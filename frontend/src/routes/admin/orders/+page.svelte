<script lang="ts">
  import { onMount } from 'svelte';
  import { adminApi } from '$lib/api/admin.api';
  import dayjs from 'dayjs';
  import CustomSelect from '$lib/components/CustomSelect.svelte';

  let orders = $state<any[]>([]);
  let pagination = $state<any>(null);
  let loading = $state(true);
  let statusFilter = $state('');

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const updateOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  onMount(async () => {
    await fetchOrders();
  });

  async function fetchOrders(page = 1) {
    loading = true;
    try {
      const params: any = { page };
      if (statusFilter) params.status = statusFilter;
      const { data } = await adminApi.getOrders(params);
      orders = data.orders;
      pagination = data.pagination;
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      loading = false;
    }
  }

  async function updateStatus(orderId: string, newStatus: string) {
    try {
      await adminApi.updateOrderStatus(orderId, { status: newStatus });
      // Update local state
      const index = orders.findIndex(o => o._id === orderId);
      if (index !== -1) {
        orders[index].status = newStatus;
      }
    } catch (error) {
      alert('Failed to update status');
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-orange-100 text-orange-700';
    }
  }
</script>

<svelte:head>
  <title>Orders Center | ShoeHub Admin</title>
</svelte:head>

<div class="p-10 bg-canvas-subtle min-h-full">
  <div class="mb-10 flex justify-between items-end">
    <div>
      <h1 class="text-4xl font-display font-bold text-ink">Orders</h1>
      <p class="text-ink-muted mt-2 font-medium">Tracking and managing ShoeHub's order lifecycle.</p>
    </div>
    
    <div class="w-64">
      <CustomSelect 
        options={statusOptions} 
        bind:value={statusFilter} 
        onchange={() => fetchOrders(1)}
      />
    </div>
  </div>

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
              <th class="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Transaction</th>
              <th class="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Customer Details</th>
              <th class="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Placement Date</th>
              <th class="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Investment</th>
              <th class="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
              <th class="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Operation</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            {#each orders as order}
              <tr class="hover:bg-gray-50/50 transition-colors group">
                <td class="px-8 py-6">
                  <span class="font-bold text-ink font-mono text-sm tracking-tighter">{order.orderNumber}</span>
                </td>
                <td class="px-8 py-6">
                  <p class="font-bold text-ink text-sm mb-0.5">{order.userId.firstName} {order.userId.lastName}</p>
                  <p class="text-xs text-gray-400 font-medium">{order.userId.email}</p>
                </td>
                <td class="px-8 py-6 text-gray-500 text-sm font-medium">
                  {dayjs(order.createdAt).format('MMM D, YYYY')}
                  <span class="block text-[10px] text-gray-300">{dayjs(order.createdAt).format('h:mm A')}</span>
                </td>
                <td class="px-8 py-6 font-bold text-ink">{formatPrice(order.total)}</td>
                <td class="px-8 py-6">
                  <CustomSelect 
                    options={updateOptions}
                    value={order.status}
                    onchange={(newVal: string) => updateStatus(order._id, newVal)}
                    class="min-w-[140px]"
                  />
                </td>
                <td class="px-8 py-6 text-right">
                  <a 
                    href="/admin/orders/{order._id}" 
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-ink text-xs font-bold hover:bg-ink hover:text-white transition-all"
                  >
                    Details
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
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
              onclick={() => fetchOrders(i + 1)}
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

      {#if orders.length === 0}
        <div class="p-20 text-center">
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p class="text-ink font-bold">No orders found</p>
          <p class="text-gray-400 text-sm mt-1">Try adjusting your status filter.</p>
        </div>
      {/if}
    </div>
  {/if}
</div>
