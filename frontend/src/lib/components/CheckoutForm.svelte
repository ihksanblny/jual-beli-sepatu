<script lang="ts">
  import { onMount } from 'svelte';
  import { loadStripe, type Stripe, type StripeElements, type StripePaymentElement } from '@stripe/stripe-js';
  import { paymentApi } from '$lib/api/payment.api';
  import { orderApi } from '$lib/api/order.api';
  import { cart } from '$lib/stores/cart';
  import { goto } from '$app/navigation';
  import { userApi } from '$lib/api/user.api';

  let { amount } = $props<{ amount: number }>();

  let stripe = $state<Stripe | null>(null);
  let elements = $state<StripeElements | null>(null);
  let paymentElement = $state<StripePaymentElement | null>(null);
  let clientSecret = $state<string | undefined>(undefined);
  
  let loading = $state(true);
  let processing = $state(false);
  let errorMessage = $state('');
  
  let addresses = $state<any[]>([]);
  let selectedAddressId = $state('');

  onMount(async () => {
    console.log('[Checkout] Initializing with amount:', amount);
    
    // Safety timeout: if it takes more than 10s, show error
    const timeout = setTimeout(() => {
      if (loading) {
        console.error('[Checkout] Initialization timed out after 10s');
        loading = false;
        errorMessage = 'Initialization timed out. Please refresh and try again.';
      }
    }, 10000);

    try {
      if (!amount || isNaN(amount)) {
        throw new Error('Invalid order amount. Please check your cart.');
      }

      // Load addresses
      console.log('[Checkout] Fetching addresses...');
      const addrResponse = await userApi.getAddresses();
      addresses = addrResponse.data || [];
      const defaultAddress = addresses.find(a => a.isDefault);
      if (defaultAddress) selectedAddressId = defaultAddress._id;
      else if (addresses.length > 0) selectedAddressId = addresses[0]._id;

      // Init Stripe
      console.log('[Checkout] Loading Stripe...');
      const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51Pq...';
      stripe = await loadStripe(publicKey);
      
      if (!stripe) throw new Error('Stripe failed to load. Please check your internet connection.');

      console.log('[Checkout] Creating Payment Intent...');
      const intentData = await paymentApi.createIntent(amount);
      
      if (!intentData.success || !intentData.data?.clientSecret) {
        throw new Error(intentData.message || 'Failed to create payment intent on server.');
      }
      
      clientSecret = intentData.data.clientSecret;

      if (clientSecret) {
        elements = stripe.elements({ clientSecret, appearance: { theme: 'stripe' } });
        paymentElement = elements.create('payment');
        
        // Small delay to ensure DOM element is ready
        setTimeout(() => {
          if (paymentElement) {
            paymentElement.mount('#payment-element');
            console.log('[Checkout] Payment Element mounted.');
          }
        }, 150);
      }
    } catch (err: any) {
      console.error('[Checkout] Initialization failed:', err);
      errorMessage = err.response?.data?.message || err.message || 'Error initializing checkout';
    } finally {
      clearTimeout(timeout);
      loading = false;
      console.log('[Checkout] Initialization complete. Loading state:', loading);
    }
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!stripe || !elements || !selectedAddressId) {
      errorMessage = 'Please complete all required fields';
      return;
    }

    processing = true;
    errorMessage = '';

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required', // Avoid full redirect if possible to handle order creation
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create Order on our backend
        const orderData = await orderApi.createOrder({
          shippingAddressId: selectedAddressId,
          billingAddressId: selectedAddressId,
          paymentMethod: 'card',
          stripePaymentIntentId: paymentIntent.id
        });

        // Clear cart and redirect
        await cart.clearCart();
        goto(`/checkout/success?orderNumber=${orderData.data.orderNumber}`);
      } else {
        throw new Error('Payment was not successful');
      }

    } catch (err: any) {
      errorMessage = err.message || 'An unexpected error occurred';
      processing = false;
    }
  }

  async function handleDummyPayment() {
    if (!selectedAddressId) {
      errorMessage = 'Please select a shipping address first';
      return;
    }

    processing = true;
    errorMessage = '';

    try {
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create Order on our backend with dummy payment intent
      const orderData = await orderApi.createOrder({
        shippingAddressId: selectedAddressId,
        billingAddressId: selectedAddressId,
        paymentMethod: 'card',
        stripePaymentIntentId: 'pi_dummy_test_' + Date.now()
      });

      // Clear cart and redirect
      await cart.clearCart();
      goto(`/checkout/success?orderNumber=${orderData.data.orderNumber}`);

    } catch (err: any) {
      errorMessage = err.message || 'An unexpected error occurred during dummy payment';
      processing = false;
    }
  }
</script>

<div class="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100">
  <h2 class="text-2xl font-display font-bold text-ink mb-10">Payment Details</h2>

  {#if loading}
    <div class="flex justify-center py-16">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
  {:else}
    <form onsubmit={handleSubmit} class="space-y-12">
      
      <!-- Address Selection -->
      <div>
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-sm font-black text-ink uppercase tracking-[0.2em]">Shipping Destination</h3>
          <a href="/profile" class="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">+ NEW ADDRESS</a>
        </div>
        
        {#if addresses.length > 0}
          <div class="grid grid-cols-1 gap-4">
            {#each addresses as address}
              <label class="relative flex items-center p-6 border-2 rounded-[24px] cursor-pointer transition-all group {selectedAddressId === address._id ? 'border-primary bg-primary/[0.02]' : 'border-gray-50 hover:border-gray-200'}">
                <input 
                  type="radio" 
                  name="address" 
                  value={address._id} 
                  bind:group={selectedAddressId} 
                  class="w-5 h-5 text-primary focus:ring-primary border-gray-300 transition-all cursor-pointer"
                />
                <div class="ml-6">
                  <div class="flex items-center gap-3">
                    <p class="font-bold text-ink capitalize">{address.label}</p>
                    {#if address.isDefault}
                      <span class="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Default</span>
                    {/if}
                  </div>
                  <p class="text-xs text-gray-500 mt-1 font-medium">{address.street}, {address.city}, {address.zipCode}</p>
                </div>
                {#if selectedAddressId === address._id}
                  <div class="absolute right-6 top-1/2 -translate-y-1/2 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                {/if}
              </label>
            {/each}
          </div>
        {:else}
          <div class="p-8 bg-orange-50/50 border border-orange-100 rounded-[32px] text-center">
            <p class="text-sm text-orange-800 font-bold mb-4">No shipping address found</p>
            <a href="/profile" class="inline-block bg-orange-100 text-orange-900 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-orange-200 transition-colors">
              Add Address in Profile
            </a>
          </div>
        {/if}
      </div>

      <!-- Stripe Element -->
      <div>
        <h3 class="text-sm font-black text-ink uppercase tracking-[0.2em] mb-6">Card Information</h3>
        <div class="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100">
          <div id="payment-element">
            <!-- Stripe will inject the form here -->
          </div>
        </div>
      </div>

      {#if errorMessage}
        <div class="p-6 bg-red-50 border border-red-100 text-red-700 rounded-[24px] text-xs font-bold animate-shake">
          {errorMessage}
        </div>
      {/if}

      <div class="pt-4 space-y-4">
        <!-- Main Stripe Submit -->
        <button 
          type="submit" 
          disabled={processing || !stripe || !selectedAddressId}
          class="w-full bg-primary text-white py-6 rounded-[24px] font-black text-sm uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-pressed active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden relative"
        >
          <span class="relative z-10">
            {processing ? 'Processing Transaction...' : `Complete Purchase • $${amount.toFixed(2)}`}
          </span>
          <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
        <p class="text-center text-[10px] text-gray-400 font-bold mt-6 uppercase tracking-widest">
          Your payment is secured
        </p>

        <!-- Dummy Testing Button -->
        <div class="pt-6 mt-6 border-t border-gray-100">
          <button 
            type="button" 
            onclick={handleDummyPayment}
            disabled={processing || !selectedAddressId}
            class="w-full bg-orange-50 text-orange-600 border-2 border-dashed border-orange-200 py-4 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : 'Simulate Dummy Payment (Test Mode)'}
          </button>
          <p class="text-center text-[10px] text-orange-400 font-bold mt-2 uppercase tracking-widest">
            For development testing only
          </p>
        </div>
      </div>
    </form>
  {/if}
</div>
