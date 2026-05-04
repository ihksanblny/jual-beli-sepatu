<script lang="ts">
  import { onMount } from 'svelte';
  import { cart, cartTotal } from '$lib/stores/cart';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import CheckoutForm from '$lib/components/CheckoutForm.svelte';

  onMount(async () => {
    if (!$auth.isAuthenticated) {
      goto('/auth/login');
      return;
    }
    await cart.fetchCart();
    
    if ($cart.items.length === 0) {
      goto('/cart');
    }
  });

  const shippingCost = $derived($cartTotal > 150 ? 0 : 15);
  const tax = $derived($cartTotal * 0.08);
  const finalTotal = $derived($cartTotal + shippingCost + tax);

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
</script>

<svelte:head>
  <title>Checkout | ShoeHub</title>
</svelte:head>

<div class="bg-[#fafafa] min-h-screen pt-32 pb-20 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="mb-12">
      <h1 class="text-4xl font-display font-bold text-ink">Secure Checkout</h1>
      <p class="text-ink-muted mt-2 font-medium">Complete your premium acquisition safely.</p>
    </div>

    {#if $cart.loading}
      <div class="flex justify-center py-32">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    {:else if $cart.items.length > 0}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        <!-- Left Column: Checkout Form (Stripe & Address) -->
        <div>
          {#if finalTotal > 0}
            <CheckoutForm amount={finalTotal} />
          {/if}
        </div>

        <!-- Right Column: Order Summary -->
        <div class="space-y-8">
          <div class="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100">
            <h2 class="text-2xl font-display font-bold text-ink mb-8">Order Summary</h2>
            
            <div class="space-y-6 mb-8 border-b border-gray-50 pb-8">
              {#each $cart.items as item}
                <div class="flex justify-between items-center group">
                  <div class="flex gap-6 items-center">
                    <div class="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                      <img src={item.productId.images[0]?.url} alt={item.productId.name} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div>
                      <p class="font-bold text-ink leading-tight">{item.productId.name}</p>
                      <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5">Size {item.size} • Qty {item.quantity}</p>
                    </div>
                  </div>
                  <p class="font-display font-bold text-ink">
                    {formatPrice((item.productId.discountPrice || item.productId.price) * item.quantity)}
                  </p>
                </div>
              {/each}
            </div>

            <div class="space-y-4 mb-8 border-b border-gray-50 pb-8">
              <div class="flex justify-between text-sm">
                <span class="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Subtotal</span>
                <span class="font-bold text-ink">{formatPrice($cartTotal)}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Shipping</span>
                <span class="font-bold {shippingCost === 0 ? 'text-green-500' : 'text-ink'}">
                  {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Estimated Tax (8%)</span>
                <span class="font-bold text-ink">{formatPrice(tax)}</span>
              </div>
            </div>

            <div class="flex justify-between items-end">
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Total Amount</p>
                <p class="text-4xl font-display font-bold text-ink leading-none">{formatPrice(finalTotal)}</p>
              </div>
            </div>
          </div>

          <!-- Trust Badges -->
          <div class="bg-gray-50/50 rounded-[32px] p-8 border border-gray-100/50 flex items-center justify-between">
            <div class="flex flex-col items-center gap-2 opacity-40">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span class="text-[8px] font-black uppercase tracking-widest">Secure SSL</span>
            </div>
            <div class="flex flex-col items-center gap-2 opacity-40">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span class="text-[8px] font-black uppercase tracking-widest">Encrypted</span>
            </div>
            <div class="flex flex-col items-center gap-2 opacity-40">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span class="text-[8px] font-black uppercase tracking-widest">PCI DSS</span>
            </div>
          </div>
        </div>

      </div>
    {/if}
  </div>
</div>