<script lang="ts">
  import { onMount } from 'svelte';
  import { adminApi } from '$lib/api/admin.api';
  import dayjs from 'dayjs';

  let users = $state<any[]>([]);
  let pagination = $state<any>(null);
  let loading = $state(true);
  let searchQuery = $state('');

  onMount(async () => {
    await fetchUsers();
  });

  async function fetchUsers(page = 1) {
    loading = true;
    try {
      const params: any = { page };
      if (searchQuery) params.search = searchQuery;
      const { data } = await adminApi.getUsers(params);
      users = data.users;
      pagination = data.pagination;
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      loading = false;
    }
  }

  function handleSearch(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      fetchUsers(1);
    }
  }
</script>

<svelte:head>
  <title>Manage Users | Admin</title>
</svelte:head>

<div class="p-8">
  <div class="mb-8 flex justify-between items-end">
    <div>
      <h1 class="text-3xl font-display font-light text-ink">Users</h1>
      <p class="text-gray-500 mt-1">Manage platform users and roles.</p>
    </div>
    
    <div class="relative">
      <input 
        type="text" 
        bind:value={searchQuery}
        onkeydown={handleSearch}
        placeholder="Search users..."
        class="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
      />
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  </div>

  {#if loading}
    <div class="flex justify-center py-24">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  {:else}
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-card">
              <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
              <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            {#each users as user}
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <span class="font-medium text-ink">{user.firstName} {user.lastName}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-gray-600">{user.email}</td>
                <td class="px-6 py-4 text-gray-600">{dayjs(user.createdAt).format('MMM D, YYYY')}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider {user.role === 'admin' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}">
                    {user.role}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      
      {#if pagination && pagination.pages > 1}
        <div class="px-6 py-4 border-t border-gray-100 flex justify-center space-x-2">
          {#each Array(pagination.pages) as _, i}
            <button 
              onclick={() => fetchUsers(i + 1)}
              class="w-8 h-8 rounded flex items-center justify-center font-bold text-sm transition-all {pagination.page === i + 1 ? 'bg-primary text-white' : 'bg-surface-soft text-ink hover:bg-gray-200'}"
            >
              {i + 1}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
