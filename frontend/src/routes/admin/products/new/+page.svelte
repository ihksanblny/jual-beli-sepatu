<script lang="ts">
  import { goto } from '$app/navigation';
  import { productApi } from '$lib/api/product.api';
  import CustomSelect from '$lib/components/CustomSelect.svelte';

  let loading = $state(false);
  let error = $state('');

  let formData = $state({
    name: '',
    brand: '',
    description: '',
    category: 'unisex',
    price: 0,
    discountPrice: 0,
    sku: '',
    featured: false,
    specifications: {
      material: '',
      sole: ''
    },
    images: [{ url: '', altText: '' }],
    sizes: [{ size: '', stock: 0 }]
  });

  const categories = [
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'kids', label: 'Kids' },
    { value: 'unisex', label: 'Unisex' }
  ];

  function addSize() {
    formData.sizes = [...formData.sizes, { size: '', stock: 0 }];
  }

  function removeSize(index: number) {
    formData.sizes = formData.sizes.filter((_, i) => i !== index);
  }

  function addImage() {
    formData.images = [...formData.images, { url: '', altText: '' }];
  }

  function removeImage(index: number) {
    formData.images = formData.images.filter((_, i) => i !== index);
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    error = '';

    try {
      // Basic validation
      if (!formData.name || !formData.price || formData.sizes.some(s => !s.size)) {
        throw new Error('Please fill all required fields and size labels.');
      }

      await productApi.createProduct(formData);
      goto('/admin/products');
    } catch (err: any) {
      error = err.response?.data?.message || err.message || 'Failed to create product';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>New Product | ShoeHub Admin</title>
</svelte:head>

<div class="p-10 bg-canvas-subtle min-h-full">
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <header class="mb-10 flex items-center justify-between">
      <div class="flex items-center gap-6">
        <a href="/admin/products" class="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-all shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <div>
          <h1 class="text-3xl font-display font-bold text-ink">Add New Product</h1>
          <p class="text-ink-muted mt-1 font-medium">Create a new premium entry in the ShoeHub collection.</p>
        </div>
      </div>
    </header>

    <form onsubmit={handleSubmit} class="space-y-8">
      {#if error}
        <div class="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {error}
        </div>
      {/if}

      <!-- Basic Information -->
      <section class="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm">
        <h2 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Basic Information</h2>
        
        <div class="grid grid-cols-2 gap-8">
          <div class="col-span-2">
            <label for="name" class="block text-sm font-bold text-ink mb-3">Product Name</label>
            <input 
              type="text" id="name" bind:value={formData.name} required
              placeholder="e.g. Air Max 270 'Midnight Blue'"
              class="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label for="brand" class="block text-sm font-bold text-ink mb-3">Brand</label>
            <input 
              type="text" id="brand" bind:value={formData.brand} required
              placeholder="e.g. Nike"
              class="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label for="category" class="block text-sm font-bold text-ink mb-3">Category</label>
            <CustomSelect options={categories} bind:value={formData.category} />
          </div>

          <div class="col-span-2">
            <label for="description" class="block text-sm font-bold text-ink mb-3">Description</label>
            <textarea 
              id="description" bind:value={formData.description} required rows="4"
              placeholder="Tell the story of this shoe..."
              class="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-medium resize-none"
            ></textarea>
          </div>
        </div>
      </section>

      <!-- Pricing & Inventory -->
      <section class="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm">
        <h2 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Pricing & Inventory</h2>
        
        <div class="grid grid-cols-2 gap-8 mb-10">
          <div>
            <label for="price" class="block text-sm font-bold text-ink mb-3">Base Price ($)</label>
            <input 
              type="number" id="price" bind:value={formData.price} required step="0.01"
              class="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold"
            />
          </div>
          <div>
            <label for="discountPrice" class="block text-sm font-bold text-ink mb-3">Sale Price ($) <span class="text-gray-300 font-normal ml-1">(Optional)</span></label>
            <input 
              type="number" id="discountPrice" bind:value={formData.discountPrice} step="0.01"
              class="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-commerce"
            />
          </div>
          <div>
            <label for="sku" class="block text-sm font-bold text-ink mb-3">SKU Identifier</label>
            <input 
              type="text" id="sku" bind:value={formData.sku} required
              placeholder="SH-2026-X"
              class="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-mono font-bold uppercase"
            />
          </div>
          <div class="flex items-end">
            <label class="flex items-center gap-4 cursor-pointer group bg-gray-50 px-6 py-4 rounded-2xl w-full">
              <input type="checkbox" bind:checked={formData.featured} class="w-5 h-5 rounded-md border-gray-300 text-primary focus:ring-primary" />
              <span class="text-sm font-bold text-ink group-hover:text-primary transition-colors">Feature on Homepage</span>
            </label>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-sm font-bold text-ink">Inventory by Size</h3>
            <button type="button" onclick={addSize} class="text-xs font-black text-primary uppercase tracking-widest hover:underline">+ ADD SIZE</button>
          </div>
          
          <div class="grid grid-cols-1 gap-3">
            {#each formData.sizes as size, i}
              <div class="flex items-center gap-4 animate-in slide-in-from-left-2 duration-300">
                <input 
                  type="text" bind:value={size.size} placeholder="Size (e.g. 42)"
                  class="flex-1 bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold"
                />
                <input 
                  type="number" bind:value={size.stock} placeholder="Stock"
                  class="w-32 bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold"
                />
                {#if formData.sizes.length > 1}
                  <button type="button" onclick={() => removeSize(i)} class="p-4 text-gray-300 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </section>

      <!-- Specifications & Media -->
      <section class="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm">
        <h2 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Specifications & Media</h2>
        
        <div class="grid grid-cols-2 gap-8 mb-12">
          <div>
            <label for="material" class="block text-sm font-bold text-ink mb-3">Upper Material</label>
            <input 
              type="text" id="material" bind:value={formData.specifications.material}
              placeholder="e.g. Italian Leather, Mesh"
              class="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
            />
          </div>
          <div>
            <label for="sole" class="block text-sm font-bold text-ink mb-3">Outsole Construction</label>
            <input 
              type="text" id="sole" bind:value={formData.specifications.sole}
              placeholder="e.g. Vulcanized Rubber"
              class="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-sm font-bold text-ink">Product Images (URLs)</h3>
            <button type="button" onclick={addImage} class="text-xs font-black text-primary uppercase tracking-widest hover:underline">+ ADD IMAGE</button>
          </div>
          
          <div class="grid grid-cols-1 gap-4">
            {#each formData.images as img, i}
              <div class="space-y-2 bg-gray-50 p-6 rounded-[24px] border border-transparent hover:border-gray-100 transition-all">
                <div class="flex items-center gap-4">
                  <input 
                    type="url" bind:value={img.url} placeholder="Image URL (https://...)"
                    class="flex-1 bg-white border-2 border-transparent px-6 py-4 rounded-xl focus:border-primary focus:outline-none transition-all font-medium text-xs"
                  />
                  {#if formData.images.length > 1}
                    <button type="button" onclick={() => removeImage(i)} class="text-red-400 hover:text-red-600 font-bold text-xs">REMOVE</button>
                  {/if}
                </div>
                <input 
                  type="text" bind:value={img.altText} placeholder="Alt text (e.g. Side profile of the shoe)"
                  class="w-full bg-white border-2 border-transparent px-6 py-4 rounded-xl focus:border-primary focus:outline-none transition-all font-medium text-xs"
                />
              </div>
            {/each}
          </div>
        </div>
      </section>

      <!-- Footer Actions -->
      <footer class="flex justify-end gap-4 py-10">
        <a href="/admin/products" class="px-10 py-5 rounded-2xl font-bold text-ink hover:bg-gray-100 transition-all">Cancel</a>
        <button 
          type="submit" disabled={loading}
          class="px-12 py-5 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-pressed active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
        >
          {#if loading}
            <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Publishing...
          {:else}
            Publish Product
          {/if}
        </button>
      </footer>
    </form>
  </div>
</div>
