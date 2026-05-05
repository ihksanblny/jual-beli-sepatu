<script lang="ts">
  import { onMount } from 'svelte';
  import { wishlist } from '$lib/stores/wishlist';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import ProductCard from '$lib/components/ProductCard.svelte';

  onMount(async () => {
    if (!$auth.isAuthenticated) {
      goto('/auth/login');
      return;
    }
    await wishlist.fetchWishlist();
  });

  const items = $derived($wishlist.items);
  const loading = $derived($wishlist.loading);
</script>

<svelte:head>
  <title>My Wishlist | ShoeHub</title>
</svelte:head>

<div class="min-h-screen bg-[#fafafa] pb-32">
  <div class="max-w-7xl mx-auto px-6 pt-32">
    <div class="mb-12">
      <h1 class="text-5xl font-display font-bold text-ink mb-4">My Wishlist</h1>
      <p class="text-ink-muted text-lg font-medium">Your curated collection of premium footwear.</p>
    </div>

    {#if loading}
      <div class="flex justify-center py-32">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    {:else if items.length === 0}
      <div class="text-center py-32 bg-white rounded-[48px] border border-gray-100 shadow-sm">
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-display font-bold text-ink mb-3">Your wishlist is empty</h2>
        <p class="text-ink-muted mb-10 max-w-md mx-auto">Start exploring our collection and save your favorite premium shoes for later acquisition.</p>
        <a 
          href="/products" 
          class="inline-flex items-center bg-ink text-white px-10 py-4 rounded-2xl font-bold hover:bg-black transition-all active:scale-95 shadow-xl shadow-black/10"
        >
          Explore Collection
        </a>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {#each items as product (product._id)}
          <ProductCard {product} />
        {/each}
      </div>
    {/if}
  </div>
</div>
