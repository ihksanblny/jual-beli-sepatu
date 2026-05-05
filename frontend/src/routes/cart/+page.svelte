<script lang="ts">
  import { onMount } from 'svelte';
  import { cart, cartTotal, cartCount } from '$lib/stores/cart';
  import { auth } from '$lib/stores/auth';

  onMount(async () => {
    if ($auth.isAuthenticated) {
      await cart.fetchCart();
    }
  });

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  async function updateQty(itemId: string, newQty: number) {
    if (newQty < 1) return;
    await cart.updateQuantity(itemId, newQty);
  }

  async function remove(itemId: string) {
    await cart.removeItem(itemId);
  }
</script>

<svelte:head>
  <title>Shopping Cart | ShoeHub</title>
</svelte:head>

<div class="bg-[#fafafa] min-h-screen pt-32 pb-20 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="mb-12">
      <h1 class="text-4xl font-display font-bold text-ink">Shopping Bag</h1>
      <p class="text-ink-muted mt-2 font-medium">Review your selection before checking out.</p>
    </div>

    {#if !$auth.isAuthenticated}
      <div class="bg-white p-20 rounded-[48px] text-center shadow-sm border border-gray-100">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 class="text-2xl font-display font-bold text-ink mb-4">Identify Yourself</h2>
        <p class="text-ink-muted mb-10 max-w-sm mx-auto">Please sign in to access your personal collection and proceed with acquisition.</p>
        <a href="/auth/login" class="inline-block bg-primary text-white px-12 py-4 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-primary-pressed shadow-xl shadow-primary/20 transition-all">
          Sign In Now
        </a>
      </div>
    {:else if $cart.loading && $cart.items.length === 0}
      <div class="flex justify-center py-32">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    {:else if $cart.items.length === 0}
      <div class="bg-white p-20 rounded-[48px] text-center shadow-sm border border-gray-100">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 class="text-2xl font-display font-bold text-ink mb-4">Your Bag is Empty</h2>
        <p class="text-ink-muted mb-10 max-w-sm mx-auto">Discover our latest drops and find the perfect addition to your rotation.</p>
        <a href="/products" class="inline-block bg-primary text-white px-12 py-4 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-primary-pressed shadow-xl shadow-primary/20 transition-all">
          Explore Collection
        </a>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <!-- Cart Items List -->
        <div class="lg:col-span-2 space-y-6">
          {#each $cart.items as item}
            <div class="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex gap-8 items-center group transition-all hover:shadow-md">
              <!-- Product Image -->
              <div class="w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                <img 
                  src={item.productId.images[0]?.url} 
                  alt={item.productId.name} 
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <!-- Content -->
              <div class="flex-1">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h3 class="text-xl font-bold text-ink mb-1">{item.productId.name}</h3>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Ref: {item.productId._id.slice(-8)} • Size {item.size}
                    </p>
                  </div>
                  <p class="text-xl font-display font-bold text-ink">
                    {formatPrice((item.productId.discountPrice || item.productId.price) * item.quantity)}
                  </p>
                </div>

                <div class="flex justify-between items-center mt-6">
                  <!-- Quantity Controls -->
                  <div class="flex items-center bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                    <button 
                      onclick={() => updateQty(item._id, Math.max(1, item.quantity - 1))}
                      class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <span class="w-8 text-center text-sm font-black text-ink">{item.quantity}</span>
                    <button 
                      onclick={() => updateQty(item._id, item.quantity + 1)}
                      class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                      aria-label="Increase quantity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <button 
                    onclick={() => remove(item._id)}
                    class="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-[0.2em] transition-colors"
                  >
                    Remove Selection
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>

        <!-- Summary Sidebar -->
        <div class="space-y-6 lg:sticky lg:top-32">
          <div class="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100">
            <h2 class="text-2xl font-display font-bold text-ink mb-8">Summary</h2>
            
            <div class="space-y-4 mb-8 border-b border-gray-50 pb-8">
              <div class="flex justify-between items-center text-sm">
                <span class="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Subtotal</span>
                <span class="font-bold text-ink">{formatPrice($cartTotal)}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Shipping</span>
                <span class="font-bold text-green-500">Calculated at next step</span>
              </div>
            </div>

            <div class="flex justify-between items-end mb-10">
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Estimated Total</p>
                <p class="text-4xl font-display font-bold text-ink leading-none">{formatPrice($cartTotal)}</p>
              </div>
            </div>

            <a 
              href="/checkout" 
              class="block w-full bg-primary text-white py-6 rounded-[24px] font-black text-sm text-center uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-pressed active:scale-[0.98] transition-all"
            >
              Secure Checkout
            </a>
          </div>

          <!-- Promotion/Help Card -->
          <div class="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100/50">
            <h4 class="text-xs font-black text-ink uppercase tracking-widest mb-2">Need Assistance?</h4>
            <p class="text-xs text-gray-500 leading-relaxed mb-4">Our dedicated support team is available 24/7 to assist with your acquisition.</p>
            <button class="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">CONTACT CONCIERGE</button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
