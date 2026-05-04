<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  let { children } = $props();
  let loading = $state(true);

  onMount(async () => {
    if (!$auth.loading) {
      checkAuth();
    }
  });

  $effect(() => {
    if (!$auth.loading) {
      checkAuth();
    }
  });

  function checkAuth() {
    if (!$auth.isAuthenticated || $auth.user?.role !== 'admin') {
      goto('/');
    } else {
      loading = false;
    }
  }

  let currentPath = $derived(page.url.pathname);

  const menuItems = [
    { label: 'Overview', href: '/admin', icon: `<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>` },
    { label: 'Products', href: '/admin/products', icon: `<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>` },
    { label: 'Orders', href: '/admin/orders', icon: `<path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>` },
    { label: 'Users', href: '/admin/users', icon: `<path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>` },
  ];
</script>

{#if loading}
  <div class="flex justify-center items-center h-screen bg-canvas-subtle">
    <div class="flex flex-col items-center gap-4">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p class="text-xs font-bold text-primary tracking-widest uppercase animate-pulse">Establishing Session</p>
    </div>
  </div>
{:else}
  <div class="flex h-screen bg-[#f8fafc] p-6 gap-6 overflow-hidden">
    <!-- 
      Floating Premium Sidebar 
      "Ga nyatu" — It has its own container with margins.
    -->
    <aside class="w-72 bg-canvas-dark rounded-[32px] flex flex-col overflow-hidden shadow-2xl shadow-black/20 shrink-0">
      <!-- Sidebar Header -->
      <div class="p-8 pb-10">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xs">SH</div>
          <span class="text-xl font-bold text-white tracking-tighter">SHOE<span class="text-primary">HUB</span></span>
        </div>
        <p class="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] ml-1">Admin Central</p>
      </div>
      
      <!-- Navigation -->
      <nav class="flex-1 px-4 space-y-2">
        {#each menuItems as item}
          <a 
            href={item.href} 
            class="flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group
              {currentPath === item.href || (item.href !== '/admin' && currentPath.startsWith(item.href)) 
                ? 'bg-white/10 text-white shadow-lg shadow-black/10' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'}"
          >
            <div class="w-5 h-5 transition-transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {@html item.icon}
              </svg>
            </div>
            <span class="text-sm font-bold tracking-wide">{item.label}</span>
            
            {#if currentPath === item.href || (item.href !== '/admin' && currentPath.startsWith(item.href))}
              <div class="ml-auto w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_12px_rgba(37,99,235,0.8)]"></div>
            {/if}
          </a>
        {/each}
      </nav>
      
      <!-- Sidebar Footer -->
      <div class="p-4 mt-auto">
        <div class="bg-white/5 rounded-2xl p-4 mb-4">
          <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Signed in as</p>
          <p class="text-xs font-bold text-white truncate">{$auth.user?.firstName} {$auth.user?.lastName}</p>
        </div>
        
        <a 
          href="/" 
          class="flex items-center justify-center gap-3 py-4 text-xs font-black text-gray-500 hover:text-white transition-colors tracking-widest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          EXIT TO STORE
        </a>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-y-auto overflow-x-hidden relative">
      <!-- Decorative background blur -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] -z-10 rounded-full"></div>
      
      <div class="p-0">
        {@render children()}
      </div>
    </main>
  </div>
{/if}

<style>
  /* 
    Ensure the main content area has nice scroll behavior 
  */
  main {
    scrollbar-width: none; /* Hide scrollbar for cleaner look */
  }
  main::-webkit-scrollbar {
    display: none;
  }
</style>
