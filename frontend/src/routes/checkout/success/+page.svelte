<script lang="ts">
  import { page } from '$app/state';
  
  let orderNumber = $derived(page.url.searchParams.get('orderNumber'));
</script>

<svelte:head>
  <title>Order Successful | ShoeHub</title>
</svelte:head>

<div class="bg-surface-soft min-h-screen py-spacing-section px-12 flex items-center justify-center">
  <div class="max-w-md w-full bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center">
    <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    
    <h1 class="text-3xl font-display font-light text-ink mb-4">Payment Successful!</h1>
    
    <p class="text-gray-600 mb-8">
      Thank you for your purchase. We've received your order and will begin processing it right away.
    </p>

    {#if orderNumber}
      <div class="bg-surface-soft p-4 rounded-md mb-8">
        <p class="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Order Number</p>
        <p class="text-lg font-bold text-ink">{orderNumber}</p>
      </div>
    {/if}

    <div class="space-y-4">
      <a href="/orders" class="block w-full bg-primary text-white py-3 rounded-pill font-bold hover:bg-primary-pressed transition-colors">
        View Orders
      </a>
      <a href="/products" class="block w-full border border-gray-200 py-3 rounded-pill font-bold text-ink hover:bg-surface-soft transition-colors">
        Continue Shopping
      </a>
    </div>
  </div>
</div>
