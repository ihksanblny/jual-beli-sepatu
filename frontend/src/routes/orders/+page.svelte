<script lang="ts">
  import { onMount } from 'svelte';
  import { orderApi } from '$lib/api/order.api';

  let loading = $state(true);
  let orders = $state<any[]>([]);

  onMount(async () => {
    try {
      const response = await orderApi.getMyOrders();
      orders = response.data || [];
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      loading = false;
    }
  });

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  }

  function getStatusClass(status: string) {
    switch (status) {
      case 'delivered': return 'bg-green-50 text-green-600 border-green-100';
      case 'processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'shipped': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  }
</script>

<svelte:head>
  <title>My Orders | ShoeHub</title>
</svelte:head>

<div class="min-h-screen bg-[#fafafa] pt-32 pb-20">
  <div class="max-w-4xl mx-auto px-6">
    <header class="mb-12">
      <h1 class="text-4xl font-display font-bold text-ink">Order History</h1>
      <p class="text-ink-muted mt-2 font-medium">Review and track all your premium acquisitions.</p>
    </header>

    {#if loading}
      <div class="flex justify-center py-32">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    {:else if orders.length === 0}
      <div class="bg-white rounded-[48px] p-20 shadow-sm border border-gray-100 text-center">
        <div class="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-ink mb-2">No orders found yet</h2>
        <p class="text-ink-muted mb-10 max-w-sm mx-auto">Looks like you haven't made any purchases yet. Your future drops will appear here.</p>
        <a href="/products" class="bg-ink text-white px-10 py-4 rounded-2xl font-bold hover:bg-black transition-all inline-block shadow-xl shadow-black/10">Explore Collection</a>
      </div>
    {:else}
      <div class="space-y-6">
        {#each orders as order}
          <div class="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-black/5 transition-all duration-500">
            <!-- Order Header -->
            <div class="px-10 py-6 bg-gray-50/50 border-b border-gray-50 flex items-center justify-between">
              <div class="flex items-center gap-10">
                <div>
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">DATE PLACED</p>
                  <p class="font-bold text-ink text-sm">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ORDER ID</p>
                  <p class="font-bold text-ink text-sm font-mono uppercase">#{order._id.slice(-8)}</p>
                </div>
                <div>
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">TOTAL AMOUNT</p>
                  <p class="font-bold text-ink text-sm">{formatPrice(order.totalAmount)}</p>
                </div>
              </div>
              <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border {getStatusClass(order.status)}">
                {order.status}
              </span>
            </div>

            <!-- Order Items -->
            <div class="p-10 space-y-6">
              {#each order.items as item}
                <div class="flex items-center justify-between group">
                  <div class="flex items-center gap-6">
                    <div class="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                      <img src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/150'} alt="Product" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div>
                      <p class="font-bold text-ink">{item.product?.name || 'Unknown Product'}</p>
                      <div class="flex items-center gap-3 mt-1">
                        <span class="text-xs font-medium text-ink-muted">Size: <span class="text-ink font-bold">{item.size}</span></span>
                        <span class="text-xs font-medium text-ink-muted">Qty: <span class="text-ink font-bold">{item.quantity}</span></span>
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-ink">{formatPrice(item.price)}</p>
                  </div>
                </div>
              {/each}
            </div>

            <!-- Order Footer -->
            <div class="px-10 py-6 border-t border-gray-50 flex justify-end gap-4">
              <button class="px-6 py-2.5 rounded-xl text-xs font-bold text-ink hover:bg-gray-50 transition-all">Download Invoice</button>
              <button class="px-6 py-2.5 rounded-xl bg-ink text-white text-xs font-bold hover:bg-black transition-all">Track Shipment</button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
