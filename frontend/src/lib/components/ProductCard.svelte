<script lang="ts">
  import type { Product } from '$lib/stores/products';
  import { wishlist } from '$lib/stores/wishlist';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  let { product } = $props<{ product: Product }>();
  
  const formattedPrice = $derived(new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price));

  const discountPrice = $derived(product.discountPrice 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.discountPrice)
    : null);

  const isNew = $derived(product.createdAt 
    ? (new Date().getTime() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
    : false);

  const isInWishlist = $derived(wishlist.isInWishlist(product._id, $wishlist.items));
  let wishlistLoading = $state(false);

  async function toggleWishlist(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!$auth.isAuthenticated) {
      goto('/auth/login');
      return;
    }

    wishlistLoading = true;
    try {
      await wishlist.toggle(product._id);
    } finally {
      wishlistLoading = false;
    }
  }
</script>

<div class="group bg-surface-card rounded-md overflow-hidden transition-all hover:shadow-lg flex flex-col h-full">
  <a href="/products/{product._id}" class="aspect-video bg-gray-200 relative overflow-hidden block">
    {#if product.images && product.images.length > 0}
        <img 
          src={product.images[0].url} 
          alt={product.images[0].altText || product.name}
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
    {:else}
      <div class="absolute inset-0 flex items-center justify-center text-gray-400 font-bold italic text-xl">
        NO IMAGE
      </div>
    {/if}
    
    {#if isNew}
      <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div class="bg-commerce text-white text-[10px] font-bold px-3 py-1 rounded-pill uppercase tracking-widest shadow-lg shadow-commerce/20">
          New Arrival
        </div>
        {#if product.featured}
          <div class="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-pill uppercase tracking-widest shadow-lg shadow-primary/20">
            Featured
          </div>
        {/if}
      </div>
    {:else if product.featured}
      <div class="absolute top-4 left-4 z-10 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-pill uppercase tracking-widest shadow-lg shadow-primary/20">
        Featured
      </div>
    {/if}
  </a>

  <div class="p-6 flex flex-col flex-1">
    <div class="flex-1">
      <h3 class="font-bold text-ink mb-1 group-hover:text-primary transition-colors line-clamp-1">
        <a href="/products/{product._id}">{product.name}</a>
      </h3>
      <p class="text-xs text-gray-500 mb-4 uppercase tracking-widest">{product.category} • {product.brand}</p>
    </div>
    
    <div class="flex justify-between items-center mt-auto">
      <div class="flex flex-col">
        {#if discountPrice}
          <span class="text-lg font-bold text-commerce">{discountPrice}</span>
          <span class="text-sm text-gray-400 line-through">{formattedPrice}</span>
        {:else}
          <span class="text-lg font-light text-ink">{formattedPrice}</span>
        {/if}
      </div>
      
      <button 
        onclick={toggleWishlist}
        disabled={wishlistLoading}
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        class="w-10 h-10 rounded-pill border {isInWishlist ? 'bg-red-50 text-red-500 border-red-100' : 'border-gray-200 text-ink hover:bg-primary hover:text-white hover:border-primary'} flex items-center justify-center transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill={isInWishlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
  </div>
</div>
