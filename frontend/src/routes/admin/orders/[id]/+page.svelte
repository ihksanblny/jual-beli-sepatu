<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { adminApi } from '$lib/api/admin.api';
  import { orderApi } from '$lib/api/order.api';
  import dayjs from 'dayjs';
  import CustomSelect from '$lib/components/CustomSelect.svelte';

  let orderId = $derived(page.params.id);
  let order = $state<any>(null);
  let loading = $state(true);
  let updatingStatus = $state(false);
  let trackingNumberInput = $state('');
  let updatingTracking = $state(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  onMount(async () => {
    await fetchOrderDetails();
  });

  async function fetchOrderDetails() {
    loading = true;
    try {
      if (orderId) {
        const { data } = await adminApi.getOrderById(orderId);
        order = data;
        trackingNumberInput = order.trackingNumber || '';
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      loading = false;
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!order) return;
    updatingStatus = true;
    try {
      await adminApi.updateOrderStatus(order._id, { status: newStatus });
      order.status = newStatus;
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      updatingStatus = false;
    }
  }

  async function handleTrackingUpdate(e: SubmitEvent) {
    e.preventDefault();
    if (!order) return;
    updatingTracking = true;
    try {
      await adminApi.updateOrderStatus(order._id, { trackingNumber: trackingNumberInput });
      order.trackingNumber = trackingNumberInput;
      alert('Tracking number updated successfully!');
    } catch (error) {
      console.error('Failed to update tracking number:', error);
      alert('Failed to update tracking number');
    } finally {
      updatingTracking = false;
    }
  }

  async function handleDownloadInvoice() {
    if (!order) return;
    try {
      await orderApi.downloadInvoice(order._id, order.orderNumber);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download invoice');
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  function getStatusClass(status: string) {
    switch (status) {
      case 'delivered': return 'bg-green-50 text-green-600 border-green-100';
      case 'processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'shipped': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-orange-50 text-orange-600 border-orange-100';
    }
  }
</script>

<svelte:head>
  <title>Manage Order {order?.orderNumber || ''} | ShoeHub Admin</title>
</svelte:head>

<div class="p-10 bg-canvas-subtle min-h-screen">
  <!-- Back Button & Header -->
  <header class="mb-10 flex items-center gap-4">
    <a 
      href="/admin/orders" 
      aria-label="Back to orders"
      class="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </a>
    <div>
      <h1 class="text-4xl font-display font-bold text-ink">Order Details</h1>
      <p class="text-ink-muted mt-1 font-medium">Reviewing and updating single customer purchase status.</p>
    </div>
  </header>

  {#if loading}
    <div class="flex justify-center py-32">
      <div class="flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p class="text-sm font-bold text-primary animate-pulse">Syncing order file...</p>
      </div>
    </div>
  {:else if order}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
      
      <!-- Left Column: Items & Summary (2 Cols) -->
      <div class="lg:col-span-2 space-y-10">
        
        <!-- General Info Header Card -->
        <div class="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm flex justify-between items-center flex-wrap gap-6">
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">TRANSACTION NUMBER</p>
            <h2 class="text-2xl font-mono font-bold text-ink">{order.orderNumber}</h2>
            <p class="text-xs text-gray-400 font-medium mt-1">Placed on {dayjs(order.createdAt).format('MMMM D, YYYY at h:mm A')}</p>
          </div>
          <div class="flex items-center gap-4">
            <span class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border {getStatusClass(order.status)}">
              {order.status}
            </span>
            <button 
              onclick={handleDownloadInvoice}
              class="px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-ink hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Invoice PDF
            </button>
          </div>
        </div>

        <!-- Ordered Items -->
        <div class="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 class="text-sm font-black text-ink uppercase tracking-widest mb-8 pb-4 border-b border-gray-50">Items Ordered</h3>
          <div class="space-y-8">
            {#each order.items as item}
              <div class="flex items-center gap-6 group">
                <div class="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                  <img src={item.image || 'https://via.placeholder.com/150'} alt="Product" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div class="flex-1 flex justify-between items-center">
                  <div>
                    <h4 class="font-bold text-ink group-hover:text-primary transition-colors">{item.name}</h4>
                    <div class="flex items-center gap-3 mt-1">
                      <span class="text-xs font-medium text-ink-muted">Size: <span class="text-ink font-bold">{item.size}</span></span>
                      <span class="text-xs font-medium text-ink-muted">Qty: <span class="text-ink font-bold">{item.quantity}</span></span>
                      {#if item.color}
                        <span class="text-xs font-medium text-ink-muted">Color: <span class="text-ink font-bold">{item.color}</span></span>
                      {/if}
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-ink">{formatPrice(item.price * item.quantity)}</p>
                    <p class="text-[10px] text-gray-400 font-medium mt-0.5">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Payment Breakdown & Summary -->
        <div class="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 class="text-sm font-black text-ink uppercase tracking-widest mb-8 pb-4 border-b border-gray-50">Financial Overview</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            <!-- Payment Info -->
            <div class="space-y-4">
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">PAYMENT METHOD</p>
                <p class="text-sm font-bold text-ink capitalize">{order.paymentMethod}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">PAYMENT STATUS</p>
                <span class="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                  {order.paymentStatus === 'completed' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}">
                  {order.paymentStatus}
                </span>
              </div>
              {#if order.stripePaymentIntentId}
                <div>
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">STRIPE INTENT ID</p>
                  <p class="text-xs font-mono font-medium text-gray-500 break-all bg-gray-50 p-2.5 rounded-xl border border-gray-100">{order.stripePaymentIntentId}</p>
                </div>
              {/if}
            </div>

            <!-- Price Summary Box -->
            <div class="space-y-3 bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
              <div class="flex justify-between text-sm text-ink-muted">
                <span>Subtotal</span>
                <span class="font-bold text-ink">{formatPrice(order.subtotal)}</span>
              </div>
              <div class="flex justify-between text-sm text-ink-muted">
                <span>Shipping Cost</span>
                <span class="font-bold text-ink">{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span>
              </div>
              <div class="flex justify-between text-sm text-ink-muted">
                <span>Tax (8%)</span>
                <span class="font-bold text-ink">{formatPrice(order.tax)}</span>
              </div>
              <div class="flex justify-between text-xl font-display font-bold text-ink pt-3 border-t border-gray-200">
                <span>Grand Total</span>
                <span class="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- Right Column: Operations, Customer & Shipping Details (1 Col) -->
      <div class="space-y-10">
        
        <!-- Order Management Tools -->
        <div class="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm space-y-8 overflow-visible">
          <h3 class="text-sm font-black text-ink uppercase tracking-widest pb-4 border-b border-gray-50">Manage Lifecycle</h3>
          
          <!-- Status Dropdown -->
          <div class="space-y-2">
            <label for="order-status-select" class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update Order Status</label>
            <CustomSelect 
              options={statusOptions}
              value={order.status}
              onchange={handleStatusChange}
            />
          </div>

          <!-- Tracking Number Form -->
          <form onsubmit={handleTrackingUpdate} class="space-y-4 pt-4 border-t border-gray-50">
            <div class="space-y-2">
              <label for="tracking-number-input" class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tracking Number</label>
              <input 
                id="tracking-number-input"
                type="text" 
                bind:value={trackingNumberInput}
                placeholder="e.g. FedEx-123456789"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={updatingTracking}
              class="w-full py-3 bg-ink text-white rounded-xl text-xs font-bold hover:bg-black transition-all disabled:opacity-50"
            >
              {updatingTracking ? 'Saving...' : 'Save Tracking Info'}
            </button>
          </form>
        </div>

        <!-- Customer Card -->
        <div class="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
          <h3 class="text-sm font-black text-ink uppercase tracking-widest pb-4 border-b border-gray-50">Customer</h3>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center font-bold text-primary">
              {order.userId?.firstName?.[0]}{order.userId?.lastName?.[0]}
            </div>
            <div>
              <p class="font-bold text-ink">{order.userId?.firstName} {order.userId?.lastName}</p>
              <p class="text-xs text-gray-400 font-medium">{order.userId?.email}</p>
            </div>
          </div>
        </div>

        <!-- Shipping Address Card -->
        <div class="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
          <h3 class="text-sm font-black text-ink uppercase tracking-widest pb-4 border-b border-gray-50">Shipping Destination</h3>
          <div class="space-y-1 text-sm font-medium text-gray-600">
            <p class="font-bold text-ink mb-2">{order.userId?.firstName} {order.userId?.lastName}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

      </div>

    </div>
  {:else}
    <div class="text-center py-32 bg-white rounded-[32px] border border-dashed border-gray-200">
      <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p class="text-ink font-bold">Order Not Found</p>
      <p class="text-gray-400 text-sm mt-1">This transaction file might have been removed or archived.</p>
    </div>
  {/if}
</div>
