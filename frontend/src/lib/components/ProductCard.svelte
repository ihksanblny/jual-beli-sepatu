<script lang="ts">
  import type { Product } from '$lib/stores/products';

  let { product } = $props<{ product: Product }>();
  
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price);

  const discountPrice = product.discountPrice 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.discountPrice)
    : null;
</script>

<div class="group bg-surface-card rounded-md overflow-hidden transition-all hover:shadow-lg flex flex-col h-full">
  <a href="/products/{product._id}" class="aspect-video bg-gray-200 relative overflow-hidden block">
    {#if product.images && product.images.length > 0}
      <img 
        src={product.images[0].url} 
        alt={product.images[0].altText || product.name}
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    {:else}
      <div class="absolute inset-0 flex items-center justify-center text-gray-400 font-bold italic text-xl">
        NO IMAGE
      </div>
    {/if}
    
    {#if product.featured}
      <div class="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-pill uppercase tracking-wider">
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
      
      <button class="w-10 h-10 rounded-pill border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-ink hover:border-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  </div>
</div>
