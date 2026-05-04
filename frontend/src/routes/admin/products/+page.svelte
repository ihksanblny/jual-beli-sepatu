<script lang="ts">
  import { onMount } from 'svelte';
  import { productApi } from '$lib/api/product.api';

  let products = $state<any[]>([]);
  let pagination = $state<any>(null);
  let loading = $state(true);
  let actionMessage = $state({ text: '', type: '' });

  onMount(async () => {
    await fetchProducts();
  });

  async function fetchProducts(page = 1) {
    loading = true;
    try {
      const data = await productApi.getProducts({ page, limit: 10 });
      products = data.products;
      pagination = data.pagination;
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      loading = false;
    }
  }

  async function handleDelete(productId: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await productApi.deleteProduct(productId);
      actionMessage = { text: `Successfully deleted "${name}"`, type: 'success' };
      await fetchProducts(pagination.page);
      
      // Clear message after 3s
      setTimeout(() => actionMessage = { text: '', type: '' }, 3000);
    } catch (error) {
      actionMessage = { text: 'Failed to delete product', type: 'error' };
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  }

  function getTotalStock(product: any) {
    return product.sizes.reduce((acc: number, s: any) => acc + s.stock, 0);
  }
</script>

<svelte:head>
  <title>Inventory | ShoeHub Admin</title>
</svelte:head>

<div class="p-10 bg-canvas-subtle min-h-full">
  <div class="mb-10 flex justify-between items-end">
    <div>
      <h1 class="text-4xl font-display font-bold text-ink">Catalog</h1>
      <p class="text-ink-muted mt-2 font-medium">Curating and managing ShoeHub's premium collection.</p>
    </div>
    <a 
      href="/admin/products/new" 
      class="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-pressed hover:scale-105 transition-all flex items-center gap-3"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
      </svg>
      Add New Drop
    </a>
  </div>

  {#if actionMessage.text}
    <div 
      class="mb-6 px-6 py-4 rounded-2xl font-bold text-sm animate-in fade-in slide-in-from-top-2 duration-300
        {actionMessage.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}"
    >
      {actionMessage.text}
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center py-32">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  {:else}
    <div class="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50">
              <th class="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Product Details</th>
              <th class="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Category</th>
              <th class="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Price Point</th>
              <th class="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Inventory</th>
              <th class="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Operation</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            {#each products as product}
              <tr class="hover:bg-gray-50/50 transition-colors group">
                <td class="px-8 py-6">
                  <div class="flex items-center gap-5">
                    <div class="w-16 h-16 bg-surface-soft rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                      {#if product.images && product.images[0]}
                        <img src={product.images[0].url} alt={product.name} class="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                      {:else}
                        <div class="w-full h-full flex items-center justify-center text-[10px] font-black text-gray-300">NO IMG</div>
                      {/if}
                    </div>
                    <div>
                      <p class="font-bold text-ink text-sm mb-0.5">{product.name}</p>
                      <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{product.brand} • {product.sku}</p>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <span class="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 capitalize">
                    {product.category}
                  </span>
                </td>
                <td class="px-8 py-6">
                  <div class="flex flex-col">
                    <span class="font-bold text-ink">{formatPrice(product.price)}</span>
                    {#if product.discountPrice}
                      <span class="text-[10px] text-commerce font-bold italic">Sale: {formatPrice(product.discountPrice)}</span>
                    {/if}
                  </div>
                </td>
                <td class="px-8 py-6">
                  <div class="flex flex-col gap-1">
                    <span class="text-sm font-bold {getTotalStock(product) < 10 ? 'text-orange-500' : 'text-ink'}">
                      {getTotalStock(product)} <span class="text-[10px] text-gray-400 font-medium uppercase ml-1">Units</span>
                    </span>
                    <div class="flex gap-1">
                      {#each product.sizes.slice(0, 3) as s}
                        <span class="text-[9px] font-bold text-gray-400">{s.size}</span>
                      {/each}
                      {#if product.sizes.length > 3}
                        <span class="text-[9px] font-bold text-gray-300">+{product.sizes.length - 3}</span>
                      {/if}
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <a 
                      href="/admin/products/{product._id}" 
                      class="px-4 py-2 rounded-xl bg-gray-50 text-ink text-xs font-bold hover:bg-ink hover:text-white transition-all"
                    >
                      Edit
                    </a>
                    <button 
                      onclick={() => handleDelete(product._id, product.name)}
                      class="px-4 py-2 rounded-xl text-red-400 text-xs font-bold hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      
      {#if pagination && pagination.pages > 1}
        <div class="px-8 py-8 border-t border-gray-50 flex justify-center space-x-3 bg-gray-50/30">
          {#each Array(pagination.pages) as _, i}
            <button 
              onclick={() => fetchProducts(i + 1)}
              class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all 
                {pagination.page === i + 1 
                  ? 'bg-ink text-white shadow-lg shadow-black/10 scale-110' 
                  : 'bg-white text-gray-400 border border-gray-100 hover:border-ink hover:text-ink'}"
            >
              {i + 1}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
