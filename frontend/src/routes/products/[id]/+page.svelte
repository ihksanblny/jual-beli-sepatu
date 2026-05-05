<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { products } from '$lib/stores/products';
  import { auth } from '$lib/stores/auth';
  import { cart } from '$lib/stores/cart';
  import { wishlist } from '$lib/stores/wishlist';
  import ReviewSection from '$lib/components/ReviewSection.svelte';

  const productId = page.params.id;
  let selectedSize = $state('');
  let mainImageIndex = $state(0);
  let wishlistLoading = $state(false);

  onMount(async () => {
    if (productId) {
      await products.fetchProduct(productId);
      if ($auth.isAuthenticated) {
        await wishlist.fetchWishlist();
      }
    }
  });

  const product = $derived($products.currentProduct);
  const loading = $derived($products.loading);
  const isInWishlist = $derived(product ? wishlist.isInWishlist(product._id, $wishlist.items) : false);

  const formattedPrice = $derived(product ? new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price) : '');

  const discountPrice = $derived(product?.discountPrice 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.discountPrice)
    : null);

  async function addToCart() {
    if (!$auth.isAuthenticated) {
      goto('/auth/login');
      return;
    }
    
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    
    try {
      await cart.addItem({
        productId: product?._id as string,
        quantity: 1,
        size: selectedSize
      });
      goto('/cart');
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleWishlist() {
    if (!$auth.isAuthenticated) {
      goto('/auth/login');
      return;
    }

    if (!product) return;

    wishlistLoading = true;
    try {
      await wishlist.toggle(product._id);
    } finally {
      wishlistLoading = false;
    }
  }
</script>

<svelte:head>
  <title>{product ? `${product.name} | ShoeHub` : 'Loading...'}</title>
</svelte:head>

<div class="bg-white min-h-screen">
  {#if loading}
    <div class="flex justify-center items-center h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  {:else if product}
    <!-- Navigation / Breadcrumbs Chapter -->
    <nav class="max-w-7xl mx-auto px-12 py-8 text-sm flex items-center space-x-2 text-gray-400">
      <a href="/" class="hover:text-primary transition-colors">Home</a>
      <span>/</span>
      <a href="/products" class="hover:text-primary transition-colors">Products</a>
      <span>/</span>
      <span class="text-ink font-medium capitalize">{product.category}</span>
    </nav>

    <!-- Product Detail Chapter -->
    <main class="max-w-7xl mx-auto px-12 pb-32">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        
        <!-- Image Gallery (Takes 7/12) -->
        <div class="lg:col-span-7 space-y-6">
          <div class="aspect-[4/5] bg-surface-soft rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-transform hover:scale-[1.01] duration-500">
            {#if product.images && product.images.length > 0}
              <img 
                src={product.images[mainImageIndex].url} 
                alt={product.images[mainImageIndex].altText || product.name}
                class="w-full h-full object-cover"
              />
            {:else}
              <div class="w-full h-full flex items-center justify-center text-gray-300 font-bold italic text-3xl">
                SHOEHUB
              </div>
            {/if}
          </div>
          
          {#if product.images && product.images.length > 1}
            <div class="grid grid-cols-5 gap-4">
              {#each product.images as img, i}
                <button 
                  onclick={() => mainImageIndex = i}
                  class="aspect-square rounded-xl overflow-hidden border-2 transition-all {mainImageIndex === i ? 'border-primary' : 'border-transparent hover:border-gray-200'}"
                >
                  <img src={img.url} alt={img.altText} class="w-full h-full object-cover" />
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Product Info (Takes 5/12) -->
        <div class="lg:col-span-5 flex flex-col sticky top-24">
          <div class="mb-10">
            <div class="flex justify-between items-center mb-4">
              <span class="px-3 py-1 bg-surface-soft text-ink-muted text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-gray-200">
                {product.brand}
              </span>
              {#if product.reviewCount > 0}
                <div class="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <span class="text-yellow-400 text-lg">★</span>
                  <span>{product.rating.toFixed(1)}</span>
                  <span class="text-gray-400 font-normal">/ 5</span>
                </div>
              {/if}
            </div>

            <h1 class="text-5xl font-display font-bold text-ink leading-[1.1] mb-6">{product.name}</h1>
            
            <div class="flex items-baseline space-x-4 mb-8">
              {#if discountPrice}
                <span class="text-4xl font-bold text-commerce">{discountPrice}</span>
                <span class="text-xl text-gray-400 line-through font-light">{formattedPrice}</span>
              {:else}
                <span class="text-4xl font-bold text-ink">{formattedPrice}</span>
              {/if}
            </div>

            <div class="prose prose-slate prose-lg">
              <p class="text-gray-500 leading-relaxed font-light">
                {product.description}
              </p>
            </div>
          </div>

          <!-- Size Selection -->
          <div class="mb-12">
            <div class="flex justify-between items-end mb-5">
              <h3 class="text-sm font-bold text-ink uppercase tracking-widest">Select Size</h3>
              <button class="text-primary font-bold text-xs hover:underline decoration-2 underline-offset-4">SIZE GUIDE</button>
            </div>
            <div class="grid grid-cols-4 gap-3">
              {#each product.sizes as s}
                <button 
                  disabled={s.stock === 0}
                  onclick={() => selectedSize = s.size}
                  class="h-14 border rounded-xl font-bold text-sm transition-all flex items-center justify-center {selectedSize === s.size ? 'bg-ink text-white border-ink shadow-lg scale-[1.02]' : 'bg-white text-ink border-gray-200 hover:border-ink hover:bg-gray-50'} {s.stock === 0 ? 'opacity-20 cursor-not-allowed grayscale' : ''}"
                >
                  {s.size}
                </button>
              {/each}
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-4 mb-16">
            <button 
              onclick={addToCart}
              class="w-full bg-primary text-white h-16 rounded-2xl font-bold text-lg hover:bg-primary-pressed active:bg-primary-active transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Add to Bag
            </button>
            <button 
              onclick={toggleWishlist}
              disabled={wishlistLoading}
              class="w-full h-16 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:border-ink transition-all flex items-center justify-center gap-3 {isInWishlist ? 'bg-red-50 border-red-100 text-red-500' : 'text-ink'}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill={isInWishlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          <!-- Attributes Grid -->
          <div class="grid grid-cols-2 gap-y-10 gap-x-8 py-10 border-y border-gray-100">
            <div>
              <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Collection</h4>
              <p class="text-ink font-semibold text-sm capitalize">{product.category}'s Shoes</p>
            </div>
            <div>
              <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Identifier</h4>
              <p class="text-ink font-semibold text-sm">{product.sku}</p>
            </div>
            {#if product.specifications?.material}
              <div class="col-span-2">
                <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Construction</h4>
                <p class="text-ink font-semibold text-sm leading-relaxed">{product.specifications.material}</p>
              </div>
            {/if}
          </div>
        </div>
      </div>
      
      <!-- Reviews Chapter -->
      <div class="mt-32">
        <ReviewSection productId={product._id} />
      </div>
    </main>

  {:else}
    <div class="flex flex-col items-center justify-center h-screen">
      <h2 class="text-2xl font-display font-light text-ink mb-4">Product not found</h2>
      <a href="/products" class="text-primary font-bold hover:underline">Back to products</a>
    </div>
  {/if}
</div>
