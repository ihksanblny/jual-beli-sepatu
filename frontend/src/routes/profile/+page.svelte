<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { authApi } from '$lib/api/auth.api';
  import { orderApi } from '$lib/api/order.api';
  import { userApi } from '$lib/api/user.api';
  import CustomSelect from '$lib/components/CustomSelect.svelte';

  let loading = $state(true);
  let saving = $state(false);
  let message = $state({ text: '', type: '' });
  let orders = $state<any[]>([]);

  let formData = $state({
    firstName: '',
    lastName: '',
    email: ''
  });

  let addresses = $state<any[]>([]);
  let showAddressForm = $state(false);
  let addressForm = $state({ label: 'home', street: '', city: '', state: '', zipCode: '', country: 'Indonesia', isDefault: false });
  let savingAddress = $state(false);

  let activeTab = $state('settings');

  // Password change states
  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmNewPassword = $state('');
  let changingPassword = $state(false);
  let passwordMessage = $state({ text: '', type: '' });

  // Delete account states
  let deletingAccount = $state(false);
  let deleteConfirmationText = $state('');

  async function handleChangePassword(e: SubmitEvent) {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      passwordMessage = { text: 'New passwords do not match', type: 'error' };
      return;
    }
    if (newPassword.length < 8) {
      passwordMessage = { text: 'Password must be at least 8 characters long', type: 'error' };
      return;
    }
    changingPassword = true;
    passwordMessage = { text: '', type: '' };

    try {
      await authApi.updatePassword({ currentPassword, newPassword });
      passwordMessage = { text: 'Password changed successfully!', type: 'success' };
      currentPassword = '';
      newPassword = '';
      confirmNewPassword = '';
    } catch (error: any) {
      passwordMessage = { text: error.response?.data?.message || 'Failed to change password', type: 'error' };
    } finally {
      changingPassword = false;
    }
  }

  async function handleDeleteAccount(e: SubmitEvent) {
    e.preventDefault();
    if (deleteConfirmationText !== 'DELETE') {
      alert('Please type DELETE to confirm account deletion.');
      return;
    }
    if (!confirm('Are you absolutely sure you want to permanently delete your account? This action cannot be undone.')) {
      return;
    }

    deletingAccount = true;
    try {
      await authApi.deleteAccount();
      auth.logout();
      window.location.href = '/';
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete account');
      deletingAccount = false;
    }
  }

  onMount(async () => {
    if (!$auth.user) return;
    
    formData = {
      firstName: $auth.user.firstName,
      lastName: $auth.user.lastName,
      email: $auth.user.email
    };

    try {
      // Fetch user orders and addresses
      const [ordersRes, addrRes] = await Promise.all([
        orderApi.getMyOrders(),
        userApi.getAddresses()
      ]);
      orders = ordersRes.data || [];
      addresses = addrRes.data || [];
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      loading = false;
    }
  });

  async function handleUpdate(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    message = { text: '', type: '' };

    try {
      const response = await authApi.updateProfile(formData);
      auth.updateUser(response.data.user);
      message = { text: 'Profile updated successfully!', type: 'success' };
    } catch (error: any) {
      message = { text: error.response?.data?.message || 'Failed to update profile', type: 'error' };
    } finally {
      saving = false;
    }
  }

  async function handleAddAddress(e: SubmitEvent) {
    e.preventDefault();
    savingAddress = true;
    try {
      const response = await userApi.addAddress(addressForm);
      // The API returns the updated array of addresses
      addresses = response.data;
      showAddressForm = false;
      addressForm = { label: 'home', street: '', city: '', state: '', zipCode: '', country: 'Indonesia', isDefault: false };
      message = { text: 'Address added successfully!', type: 'success' };
    } catch (error: any) {
      message = { text: error.response?.data?.message || 'Failed to add address', type: 'error' };
    } finally {
      savingAddress = false;
    }
  }

  async function deleteAddress(id: string) {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const response = await userApi.deleteAddress(id);
      addresses = response.data;
      message = { text: 'Address deleted successfully!', type: 'success' };
    } catch (error: any) {
      message = { text: error.response?.data?.message || 'Failed to delete address', type: 'error' };
    }
  }

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
</script>

<svelte:head>
  <title>My Profile | ShoeHub</title>
</svelte:head>

<div class="min-h-screen bg-[#fafafa] pb-20">
  <div class="max-w-6xl mx-auto px-6 pt-32">
    <div class="flex flex-col md:flex-row gap-12">
      <!-- Profile Sidebar -->
      <aside class="w-full md:w-80 space-y-8">
        <div class="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 text-center">
          <div class="w-32 h-32 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl font-display font-bold shadow-2xl shadow-primary/30">
            {$auth.user?.firstName?.[0]}{$auth.user?.lastName?.[0]}
          </div>
          <h1 class="text-2xl font-display font-bold text-ink">{$auth.user?.firstName} {$auth.user?.lastName}</h1>
          <p class="text-ink-muted text-sm font-medium mt-1">{$auth.user?.email}</p>
          <div class="mt-6 inline-flex px-4 py-1.5 bg-gray-50 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">
            Premium Member
          </div>
        </div>

         <nav class="bg-white rounded-[32px] p-4 shadow-sm border border-gray-100">
          <button 
            onclick={() => activeTab = 'settings'}
            class="w-full text-left px-6 py-4 rounded-2xl font-bold text-sm transition-all
              {activeTab === 'settings' ? 'bg-ink text-white shadow-lg' : 'text-ink-muted hover:bg-gray-50'}"
          >
            Account Settings
          </button>
          <button 
            onclick={() => activeTab = 'security'}
            class="w-full text-left px-6 py-4 rounded-2xl font-bold text-sm transition-all mt-1
              {activeTab === 'security' ? 'bg-ink text-white shadow-lg' : 'text-ink-muted hover:bg-gray-50'}"
          >
            Security & Password
          </button>
          <button 
            onclick={() => activeTab = 'addresses'}
            class="w-full text-left px-6 py-4 rounded-2xl font-bold text-sm transition-all mt-1
              {activeTab === 'addresses' ? 'bg-ink text-white shadow-lg' : 'text-ink-muted hover:bg-gray-50'}"
          >
            Shipping Addresses
          </button>
          <button 
            onclick={() => activeTab = 'delete'}
            class="w-full text-left px-6 py-4 rounded-2xl font-bold text-sm transition-all mt-1
              {activeTab === 'delete' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-red-500 hover:bg-red-50'}"
          >
            Delete Account
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 space-y-12">
        {#if activeTab === 'settings'}
          <!-- Edit Profile -->
          <section class="bg-white rounded-[48px] p-12 shadow-sm border border-gray-100">
            <div class="mb-10">
              <h2 class="text-3xl font-display font-bold text-ink">Personal Information</h2>
              <p class="text-ink-muted mt-2 font-medium">Update your account details and contact information.</p>
            </div>

            <form onsubmit={handleUpdate} class="space-y-8">
              {#if message.text}
                <div class="px-6 py-4 rounded-2xl font-bold text-sm {message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}">
                  {message.text}
                </div>
              {/if}

              <div class="grid grid-cols-2 gap-8">
                <div>
                  <label for="firstName" class="block text-sm font-bold text-ink mb-3">First Name</label>
                  <input 
                    type="text" id="firstName" bind:value={formData.firstName} required
                    class="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-bold text-ink mb-3">Last Name</label>
                  <input 
                    type="text" id="lastName" bind:value={formData.lastName} required
                    class="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
                  />
                </div>
                <div class="col-span-2">
                  <label for="email" class="block text-sm font-bold text-ink mb-3">Email Address</label>
                  <input 
                    type="email" id="email" bind:value={formData.email} required
                    class="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div class="flex justify-end pt-4">
                <button 
                  type="submit" disabled={saving}
                  class="bg-ink text-white px-12 py-5 rounded-2xl font-bold hover:bg-black active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-black/10"
                >
                  {#if saving}
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  {:else}
                    Update Profile
                  {/if}
                </button>
              </div>
            </form>
          </section>

          <!-- Recent Orders -->
          <section class="bg-white rounded-[48px] p-12 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-10">
              <div>
                <h2 class="text-3xl font-display font-bold text-ink">Order History</h2>
                <p class="text-ink-muted mt-2 font-medium">Keep track of your latest premium acquisitions.</p>
              </div>
              <button class="text-xs font-black text-primary uppercase tracking-widest hover:underline">VIEW ALL ORDERS</button>
            </div>

            {#if loading}
              <div class="flex justify-center py-20">
                <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
              </div>
            {:else if orders.length === 0}
              <div class="text-center py-20 bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p class="text-ink-muted font-bold">No orders found yet.</p>
                <a href="/products" class="text-primary text-sm font-bold mt-2 inline-block hover:underline">Start Shopping</a>
              </div>
            {:else}
              <div class="space-y-4">
                {#each orders.slice(0, 5) as order}
                  <div class="group bg-gray-50 hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all duration-500 rounded-[32px] p-8 border border-transparent hover:border-gray-100 flex items-center justify-between">
                    <div class="flex items-center gap-8">
                      <div class="flex -space-x-4">
                        {#each order.items.slice(0, 3) as item}
                          <div class="w-14 h-14 rounded-2xl bg-white border-2 border-gray-50 overflow-hidden shadow-sm">
                            <img src={item.image || 'https://via.placeholder.com/100'} alt="Product" class="w-full h-full object-cover" />
                          </div>
                        {/each}
                        {#if order.items.length > 3}
                          <div class="w-14 h-14 rounded-2xl bg-ink flex items-center justify-center text-white text-xs font-bold border-2 border-gray-50">
                            +{order.items.length - 3}
                          </div>
                        {/if}
                      </div>
                      <div>
                        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ORDER #{order._id.slice(-6).toUpperCase()}</p>
                        <p class="font-bold text-ink">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-xl font-display font-bold text-ink mb-1">{formatPrice(order.total)}</p>
                      <span class="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                        {order.status === 'delivered' ? 'bg-green-50 text-green-600 border border-green-100' : 
                         order.status === 'processing' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                         'bg-gray-50 text-gray-500 border border-gray-100'}">
                        {order.status}
                      </span>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </section>
        {/if}

        {#if activeTab === 'security'}
          <!-- Security & Password -->
          <section class="bg-white rounded-[48px] p-12 shadow-sm border border-gray-100">
            <div class="mb-10">
              <h2 class="text-3xl font-display font-bold text-ink">Security & Password</h2>
              <p class="text-ink-muted mt-2 font-medium">Update your password to keep your account secure.</p>
            </div>

            <form onsubmit={handleChangePassword} class="space-y-8">
              {#if passwordMessage.text}
                <div class="px-6 py-4 rounded-2xl font-bold text-sm {passwordMessage.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}">
                  {passwordMessage.text}
                </div>
              {/if}

              <div class="space-y-6 max-w-xl">
                <div>
                  <label for="currentPassword" class="block text-sm font-bold text-ink mb-3">Current Password</label>
                  <input 
                    type="password" id="currentPassword" bind:value={currentPassword} required
                    placeholder="••••••••"
                    class="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label for="newPassword" class="block text-sm font-bold text-ink mb-3">New Password</label>
                  <input 
                    type="password" id="newPassword" bind:value={newPassword} required
                    placeholder="Minimum 8 characters"
                    class="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label for="confirmNewPassword" class="block text-sm font-bold text-ink mb-3">Confirm New Password</label>
                  <input 
                    type="password" id="confirmNewPassword" bind:value={confirmNewPassword} required
                    placeholder="Re-type new password"
                    class="w-full bg-gray-50 border-2 border-transparent px-6 py-4 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div class="flex justify-end pt-4">
                <button 
                  type="submit" disabled={changingPassword}
                  class="bg-ink text-white px-12 py-5 rounded-2xl font-bold hover:bg-black active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-black/10"
                >
                  {#if changingPassword}
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Changing...
                  {:else}
                    Change Password
                  {/if}
                </button>
              </div>
            </form>
          </section>
        {/if}

        {#if activeTab === 'addresses'}
          <!-- Shipping Addresses -->
          <section class="bg-white rounded-[48px] p-12 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-10">
              <div>
                <h2 class="text-3xl font-display font-bold text-ink">Shipping Addresses</h2>
                <p class="text-ink-muted mt-2 font-medium">Manage where your acquisitions will be delivered.</p>
              </div>
              {#if !showAddressForm}
                <button onclick={() => showAddressForm = true} class="text-xs font-black text-primary uppercase tracking-widest hover:underline">+ NEW ADDRESS</button>
              {/if}
            </div>

            {#if showAddressForm}
              <form onsubmit={handleAddAddress} class="bg-gray-50 p-8 rounded-[32px] mb-8 space-y-6">
                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label for="addressLabel" class="block text-xs font-bold text-ink mb-2 uppercase tracking-widest">Label</label>
                    <CustomSelect 
                      bind:value={addressForm.label} 
                      options={[
                        { value: 'home', label: 'Home' },
                        { value: 'work', label: 'Work' },
                        { value: 'other', label: 'Other' }
                      ]}
                    />
                  </div>
                  <div>
                    <label for="addressCountry" class="block text-xs font-bold text-ink mb-2 uppercase tracking-widest">Country</label>
                    <input type="text" id="addressCountry" bind:value={addressForm.country} required class="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition-all font-medium" />
                  </div>
                  <div class="col-span-2">
                    <label for="addressStreet" class="block text-xs font-bold text-ink mb-2 uppercase tracking-widest">Street Address</label>
                    <input type="text" id="addressStreet" bind:value={addressForm.street} required class="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label for="addressCity" class="block text-xs font-bold text-ink mb-2 uppercase tracking-widest">City</label>
                    <input type="text" id="addressCity" bind:value={addressForm.city} required class="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label for="addressState" class="block text-xs font-bold text-ink mb-2 uppercase tracking-widest">State / Province</label>
                    <input type="text" id="addressState" bind:value={addressForm.state} required class="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label for="addressZip" class="block text-xs font-bold text-ink mb-2 uppercase tracking-widest">ZIP / Postal Code</label>
                    <input type="text" id="addressZip" bind:value={addressForm.zipCode} required class="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition-all font-medium" />
                  </div>
                  <div class="flex items-center mt-6">
                    <label class="flex items-center cursor-pointer gap-3">
                      <input type="checkbox" bind:checked={addressForm.isDefault} class="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded" />
                      <span class="text-sm font-bold text-ink">Set as default address</span>
                    </label>
                  </div>
                </div>
                <div class="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <button type="button" onclick={() => showAddressForm = false} class="px-6 py-3 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-200 transition-all">Cancel</button>
                  <button type="submit" disabled={savingAddress} class="bg-primary text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary-pressed transition-all disabled:opacity-50">
                    {savingAddress ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            {/if}

            {#if !loading && addresses.length === 0 && !showAddressForm}
              <div class="text-center py-12 bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                <p class="text-ink-muted font-bold mb-4">No shipping addresses saved.</p>
                <button onclick={() => showAddressForm = true} class="bg-primary text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-primary-pressed transition-colors">
                  Add New Address
                </button>
              </div>
            {:else if addresses.length > 0}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                {#each addresses as address}
                  <div class="relative p-6 border-2 border-gray-100 rounded-[24px] bg-white group hover:border-primary transition-all">
                    <div class="flex items-center gap-3 mb-4">
                      <span class="px-3 py-1 bg-gray-100 text-ink text-[10px] font-black uppercase tracking-widest rounded-full capitalize">{address.label}</span>
                      {#if address.isDefault}
                        <span class="px-3 py-1 bg-green-50 text-green-600 border border-green-100 text-[10px] font-black uppercase tracking-widest rounded-full">Default</span>
                      {/if}
                    </div>
                    <p class="font-bold text-ink mb-1">{address.street}</p>
                    <p class="text-sm text-gray-500 font-medium">{address.city}, {address.state} {address.zipCode}</p>
                    <p class="text-sm text-gray-500 font-medium mb-6">{address.country}</p>
                    
                    <div class="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onclick={() => deleteAddress(address._id)} class="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Address">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </section>
        {/if}

        {#if activeTab === 'delete'}
          <!-- Delete Account -->
          <section class="bg-white rounded-[48px] p-12 shadow-sm border border-red-100">
            <div class="mb-10">
              <h2 class="text-3xl font-display font-bold text-red-500">Delete Account</h2>
              <p class="text-ink-muted mt-2 font-medium">Permanently remove your ShoeHub account and all your associated data.</p>
            </div>

            <div class="bg-red-50/50 border border-red-100 p-8 rounded-[32px] mb-8 space-y-4">
              <h3 class="font-bold text-red-600 text-lg flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Warning: This action is irreversible!
              </h3>
              <p class="text-sm text-ink-muted leading-relaxed font-medium">
                Deleting your account will permanently remove your profile, address list, wishlist items, and prevent you from accessing your past order history. Please make sure you are absolutely sure before proceeding.
              </p>
            </div>

            <form onsubmit={handleDeleteAccount} class="space-y-8 max-w-xl">
              <div>
                <label for="confirmationText" class="block text-sm font-bold text-ink mb-3">To confirm, type <strong class="text-red-500">DELETE</strong> below:</label>
                <input 
                  type="text" id="confirmationText" bind:value={deleteConfirmationText} required
                  placeholder="DELETE"
                  class="w-full bg-red-50/20 border-2 border-red-100 px-6 py-4 rounded-2xl focus:bg-white focus:border-red-500 focus:outline-none transition-all font-bold tracking-wider"
                />
              </div>

              <div class="flex justify-end pt-4">
                <button 
                  type="submit" disabled={deletingAccount || deleteConfirmationText !== 'DELETE'}
                  class="bg-red-500 text-white px-12 py-5 rounded-2xl font-bold hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-red-500/10"
                >
                  {#if deletingAccount}
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deleting...
                  {:else}
                    Permanently Delete Account
                  {/if}
                </button>
              </div>
            </form>
          </section>
        {/if}
      </main>
    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: #fafafa;
  }
</style>
