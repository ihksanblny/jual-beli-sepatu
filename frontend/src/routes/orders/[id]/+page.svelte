<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { orderApi } from '$lib/api/order.api';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import dayjs from 'dayjs';

  let orderId = $derived(page.params.id);
  let order = $state<any>(null);
  let loading = $state(true);
  let downloading = $state(false);

  async function handleDownload() {
    if (!order) return;
    downloading = true;
    try {
      await orderApi.downloadInvoice(order._id, order.orderNumber);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      downloading = false;
    }
  }

  onMount(async () => {
    if (!$auth.isAuthenticated) {
      goto('/auth/login');
      return;
    }

    try {
      if (orderId) {
        const { data } = await orderApi.getOrderById(orderId);
        order = data;
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      loading = false;
    }
  });

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
</script>

<svelte:head>
  <title>Order Details | ShoeHub</title>
</svelte:head>

<div class="bg-surface-soft min-h-screen py-spacing-section px-12">
  <div class="max-w-4xl mx-auto">
    <div class="mb-8 flex items-center gap-4">
      <a href="/orders" class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </a>
      <h1 class="text-3xl font-display font-light text-ink">Order Details</h1>
    </div>

    {#if loading}
      <div class="flex justify-center py-24">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    {:else if order}
      <div class="space-y-8">
        
        <!-- Header Info -->
        <div class="bg-white p-8 rounded-lg shadow-sm border border-gray-100 flex flex-wrap justify-between items-center gap-6">
          <div>
            <p class="text-sm text-gray-500 mb-1">Order Number</p>
            <p class="text-2xl font-display text-ink">{order.orderNumber}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Date</p>
            <p class="font-medium text-ink">{dayjs(order.createdAt).format('MMMM D, YYYY h:mm A')}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Status</p>
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-ink text-white">
              {order.status}
            </span>
          </div>
          <button 
            onclick={handleDownload}
            disabled={downloading}
            class="flex items-center gap-2 bg-surface-soft hover:bg-gray-100 text-ink px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {downloading ? 'Downloading...' : 'Invoice'}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Shipping Address -->
          <div class="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <h3 class="font-bold text-ink mb-4 border-b border-gray-100 pb-2">Shipping Address</h3>
            <p class="font-medium text-ink">{$auth.user?.firstName} {$auth.user?.lastName}</p>
            <p class="text-gray-600 mt-1">{order.shippingAddress.street}</p>
            <p class="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
            <p class="text-gray-600">{order.shippingAddress.country}</p>
          </div>

          <!-- Payment Info -->
          <div class="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <h3 class="font-bold text-ink mb-4 border-b border-gray-100 pb-2">Payment Method</h3>
            <p class="font-medium text-ink capitalize">{order.paymentMethod}</p>
            <p class="text-sm mt-2">
              Status: 
              <span class={order.paymentStatus === 'completed' ? 'text-green-600 font-bold' : 'text-yellow-600 font-bold'}>
                {order.paymentStatus.toUpperCase()}
              </span>
            </p>
          </div>
        </div>

        <!-- Items -->
        <div class="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <h3 class="font-bold text-ink mb-6 border-b border-gray-100 pb-2">Items Ordered</h3>
          <div class="space-y-6">
            {#each order.items as item}
              <div class="flex gap-6">
                <div class="w-20 h-20 bg-surface-soft rounded overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 flex justify-between">
                  <div>
                    <h4 class="font-bold text-ink"><a href="/products/{item.productId}" class="hover:text-primary">{item.name}</a></h4>
                    <p class="text-sm text-gray-500 mt-1">Size: {item.size} | Qty: {item.quantity}</p>
                  </div>
                  <p class="font-bold text-ink">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            {/each}
          </div>
          
          <!-- Summary -->
          <div class="mt-8 pt-8 border-t border-gray-100 w-full md:w-1/2 ml-auto space-y-3">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-600">
              <span>Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div class="flex justify-between font-bold text-ink text-xl pt-3 border-t border-gray-100">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <div class="text-center py-24 bg-white rounded-lg border border-dashed border-gray-300">
        <p class="text-gray-500 font-display text-xl font-light">Order not found.</p>
      </div>
    {/if}
  </div>
</div>
