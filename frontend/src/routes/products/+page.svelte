<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { products } from '$lib/stores/products';
  import ProductCard from '$lib/components/ProductCard.svelte';

  let searchQuery = $state('');
  let categoryFilter = $state('');
  
  // React to URL changes (e.g. clicking Men/Women in Navbar)
  $effect(() => {
    const url = $page.url;
    const category = url.searchParams.get('category') || '';
    const search = url.searchParams.get('search') || '';
    const sale = url.searchParams.get('sale') === 'true';
    
    // Update local state to match URL
    categoryFilter = category;
    searchQuery = search;
    
    // Fetch products based on URL params
    products.fetchProducts({ 
      category, 
      search,
      sale,
      page: 1 
    });
  });

  async function handleFilter() {
    // When manually filtering, we could also update the URL here if we wanted
    // but the effect above will handle the store fetch if the URL changes.
    products.fetchProducts({ 
      search: searchQuery, 
      category: categoryFilter 
    });
  }
</script>

<svelte:head>
  <title>Browse Products | ShoeHub</title>
</svelte:head>

<div class="bg-surface-soft min-h-screen">
  <!-- Header Chapter -->
  <header class="bg-canvas-dark text-white py-12 px-12">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-4xl font-display font-bold mb-4 capitalize">
        {categoryFilter ? `${categoryFilter}'s ` : ''} 
        {$page.url.searchParams.get('sale') === 'true' ? 'Sale Collection' : 'All Products'}
      </h1>
      <p class="text-gray-400 max-w-2xl italic">
        {$page.url.searchParams.get('sale') === 'true' 
          ? 'Exclusive deals on our most-wanted footwear. Grab them while they last.' 
          : 'Explore our extensive collection of performance and lifestyle footwear. Filters and search are your best friends here.'}
      </p>
    </div>
  </header>

  <!-- Filter Strip Chapter -->
  <div class="bg-white border-b border-gray-100 py-4 px-12 sticky top-12 z-40 shadow-sm">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center space-x-2">
        <button 
          onclick={() => { categoryFilter = ''; handleFilter(); }}
          class="px-4 py-1.5 rounded-pill text-sm font-medium transition-colors {categoryFilter === '' ? 'bg-ink text-white' : 'bg-surface-soft text-ink hover:bg-gray-200'}"
        >
          All
        </button>
        {#each ['men', 'women', 'kids', 'unisex'] as cat}
          <button 
            onclick={() => { categoryFilter = cat; handleFilter(); }}
            class="px-4 py-1.5 rounded-pill text-sm font-medium transition-colors {categoryFilter === cat ? 'bg-ink text-white' : 'bg-surface-soft text-ink hover:bg-gray-200'} capitalize"
          >
            {cat}
          </button>
        {/each}
      </div>

      <div class="flex items-center space-x-2">
        <div class="relative">
          <input 
            type="text" 
            bind:value={searchQuery}
            onkeydown={(e) => e.key === 'Enter' && handleFilter()}
            placeholder="Search products..."
            class="pl-10 pr-4 py-2 bg-surface-soft border-none rounded-pill text-sm focus:ring-2 focus:ring-primary w-64 transition-all"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-4 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button 
          onclick={handleFilter}
          class="bg-primary text-white px-6 py-2 rounded-pill text-sm font-bold hover:bg-primary-pressed transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  </div>

  <!-- Product Grid Chapter -->
  <main class="py-12 px-12">
    <div class="max-w-7xl mx-auto">
      {#if $products.loading}
        <div class="flex justify-center py-24">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      {:else if $products.items.length === 0}
        <div class="text-center py-32 bg-white rounded-[32px] border border-dashed border-gray-200">
          <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p class="text-gray-500 font-display text-2xl font-light mb-2">
            {$page.url.searchParams.get('sale') === 'true' ? 'No items are currently on sale.' : 'No products found matching your criteria.'}
          </p>
          <p class="text-gray-400 text-sm mb-8">Try adjusting your filters or search query to find what you're looking for.</p>
          <button 
            onclick={() => { searchQuery = ''; categoryFilter = ''; handleFilter(); }}
            class="text-primary font-bold hover:underline px-6 py-2 border-2 border-primary rounded-full hover:bg-primary hover:text-white transition-all"
          >
            Clear all filters
          </button>
        </div>
      {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {#each $products.items as product}
            <ProductCard {product} />
          {/each}
        </div>

        <!-- Pagination -->
        {#if $products.pagination.pages > 1}
          <div class="mt-16 flex justify-center space-x-2">
            {#each Array($products.pagination.pages) as _, i}
              <button 
                onclick={() => products.fetchProducts({ page: i + 1, search: searchQuery, category: categoryFilter })}
                class="w-10 h-10 rounded-pill flex items-center justify-center font-bold text-sm transition-all {$products.pagination.page === i + 1 ? 'bg-primary text-white' : 'bg-white text-ink hover:bg-gray-100'}"
              >
                {i + 1}
              </button>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  </main>
</div>
