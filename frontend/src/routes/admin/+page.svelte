<script lang="ts">
  import { onMount } from 'svelte';
  import { adminApi } from '$lib/api/admin.api';
  import dayjs from 'dayjs';
  import CustomSelect from '$lib/components/CustomSelect.svelte';
 
  let selectedRange = $state('7days');
  const rangeOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' }
  ];

  let stats = $state<any>(null);
  let loading = $state(true);

  // Mock revenue data for the chart if real data isn't structured for it yet
  const revenueHistory = [
    { day: 'Mon', amount: 1200 },
    { day: 'Tue', amount: 1900 },
    { day: 'Wed', amount: 1500 },
    { day: 'Thu', amount: 2800 },
    { day: 'Fri', amount: 2200 },
    { day: 'Sat', amount: 3400 },
    { day: 'Sun', amount: 2900 }
  ];

  const maxRevenue = Math.max(...revenueHistory.map(d => d.amount));

  onMount(async () => {
    try {
      const { data } = await adminApi.getDashboardStats();
      stats = data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
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
  <title>Insights | ShoeHub Admin</title>
</svelte:head>

<div class="p-10 bg-canvas-subtle min-h-full">
  <!-- Header -->
  <header class="mb-12 flex justify-between items-end">
    <div>
      <h1 class="text-4xl font-display font-bold text-ink">Store Insights</h1>
      <p class="text-ink-muted mt-2 font-medium">Monitoring ShoeHub's performance and growth.</p>
    </div>
    <div class="flex gap-3">
      <button class="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-ink hover:bg-gray-50 transition-all">Export Report</button>
      <button class="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-pressed transition-all">Manage Drops</button>
    </div>
  </header>

  {#if loading}
    <div class="flex justify-center py-32">
      <div class="flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p class="text-sm font-bold text-primary animate-pulse">Syncing data...</p>
      </div>
    </div>
  {:else if stats}
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
        <div class="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Total Revenue</p>
        <p class="text-3xl font-display font-bold text-ink">{formatPrice(stats.totalRevenue)}</p>
        <div class="mt-4 flex items-center text-green-500 text-xs font-bold">
          <span class="mr-1">↑ 12.5%</span>
          <span class="text-gray-400 font-normal">vs last month</span>
        </div>
      </div>

      <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
        <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Orders Processed</p>
        <p class="text-3xl font-display font-bold text-ink">{stats.totalOrders}</p>
        <div class="mt-4 flex items-center text-green-500 text-xs font-bold">
          <span class="mr-1">↑ 8.2%</span>
          <span class="text-gray-400 font-normal">vs last month</span>
        </div>
      </div>

      <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
        <div class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Live Products</p>
        <p class="text-3xl font-display font-bold text-ink">{stats.totalProducts}</p>
        <div class="mt-4 flex items-center text-gray-400 text-xs font-bold">
          <span class="mr-1">0% change</span>
          <span class="text-gray-400 font-normal">vs last month</span>
        </div>
      </div>

      <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
        <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Total Customers</p>
        <p class="text-3xl font-display font-bold text-ink">{stats.totalUsers}</p>
        <div class="mt-4 flex items-center text-green-500 text-xs font-bold">
          <span class="mr-1">↑ 15.1%</span>
          <span class="text-gray-400 font-normal">vs last month</span>
        </div>
      </div>
    </div>

    <div class="space-y-10">
      <!-- Full Width Revenue Trend -->
      <div class="bg-white rounded-[32px] border border-gray-100 shadow-sm p-10 overflow-hidden relative group">
        <div class="flex justify-between items-center mb-12">
          <div>
            <h2 class="text-sm font-black text-ink uppercase tracking-[0.3em] mb-1">Performance</h2>
            <p class="text-2xl font-display font-bold text-ink">Weekly Revenue Trend</p>
          </div>
          <div class="flex gap-6 items-center">
            <div class="flex items-center gap-3 px-5 py-2.5 bg-gray-50 rounded-2xl border border-gray-100 flex-shrink-0">
              <span class="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
              <span class="text-[10px] font-black text-ink uppercase tracking-widest whitespace-nowrap">Live Data</span>
            </div>
            <CustomSelect 
              bind:value={selectedRange} 
              options={rangeOptions} 
              class="w-56"
            />
          </div>
        </div>

        <!-- Chart Grid Lines Background -->
        <div class="absolute inset-x-10 top-32 bottom-24 flex flex-col justify-between pointer-events-none opacity-5">
          {#each Array(5) as _}
            <div class="w-full border-t border-ink"></div>
          {/each}
        </div>

        <div class="h-80 flex items-end justify-between gap-6 relative z-10 px-2">
          {#each revenueHistory as data, i}
            <div class="flex-1 flex flex-col items-center gap-6 group/bar">
              <div 
                class="w-full max-w-[60px] relative transition-all cursor-pointer group-hover/bar:scale-x-105"
                style="height: {(data.amount / maxRevenue) * 100}%"
              >
                <!-- Value Tooltip -->
                <div class="absolute -top-12 left-1/2 -translate-x-1/2 bg-ink text-white text-[10px] py-2 px-3 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all scale-75 group-hover/bar:scale-100 whitespace-nowrap z-20 font-black shadow-xl shadow-black/20">
                  {formatPrice(data.amount)}
                </div>
                
                <!-- Bar Gradient Fill -->
                <div 
                  class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary to-primary/60 rounded-2xl shadow-lg shadow-primary/10 transition-all duration-1000 ease-out h-0 group-hover/bar:brightness-110" 
                  style="height: 100%; transition-delay: {i * 100}ms"
                ></div>
                
                <!-- Glass Reflection Overlay -->
                <div class="absolute top-0 left-0 w-1/2 h-full bg-white/10 rounded-l-2xl"></div>
              </div>
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/bar:text-primary transition-colors">{data.day}</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <!-- Popular Categories (Mocked for layout) -->
        <div class="bg-white rounded-[32px] border border-gray-100 shadow-sm p-10">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Sales by Category</h2>
            <button class="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">DETAILS</button>
          </div>
          
          <div class="space-y-6">
            {#each [
              { name: 'Lifestyle', percent: 65, color: 'bg-primary' },
              { name: 'Running', percent: 42, color: 'bg-orange-500' },
              { name: 'Basketball', percent: 28, color: 'bg-purple-500' },
              { name: 'Training', percent: 15, color: 'bg-blue-500' }
            ] as cat}
              <div class="space-y-2">
                <div class="flex justify-between items-end">
                  <span class="text-sm font-bold text-ink">{cat.name}</span>
                  <span class="text-xs font-black text-gray-400">{cat.percent}%</span>
                </div>
                <div class="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                  <div class="h-full {cat.color} rounded-full transition-all duration-1000" style="width: {cat.percent}%"></div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div class="p-10 border-b border-gray-50 flex justify-between items-center">
            <h2 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Latest Drops</h2>
            <a href="/admin/orders" class="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">VIEW ALL</a>
          </div>
          
          <div class="divide-y divide-gray-50 flex-1">
            {#each stats.recentOrders.slice(0, 4) as order}
              <div class="px-10 py-6 hover:bg-gray-50 transition-all flex justify-between items-center group">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                    {order.userId.firstName[0]}{order.userId.lastName[0]}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-ink mb-0.5">{order.orderNumber}</p>
                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {order.userId.firstName} • {dayjs(order.createdAt).format('MMM D, HH:mm')}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-ink mb-1">{formatPrice(order.total)}</p>
                  <span class="text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border
                    {order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' : 
                     order.status === 'processing' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                     'bg-orange-50 text-orange-600 border-orange-100'}">
                    {order.status}
                  </span>
                </div>
              </div>
            {/each}
            {#if stats.recentOrders.length === 0}
              <div class="p-20 text-center">
                <p class="text-sm text-gray-400 font-medium italic">No recent activity detected.</p>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Custom scrollbar for better appearance */
  :global(.p-10) {
    scrollbar-width: thin;
    scrollbar-color: var(--color-surface-border) transparent;
  }
</style>
