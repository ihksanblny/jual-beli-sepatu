<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { cart, cartCount } from '$lib/stores/cart';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let isScrolled = $state(false);
  let isMobileMenuOpen = $state(false);
  let isSearchOpen = $state(false);
  let searchQuery = $state('');

  onMount(() => {
    (async () => {
      if ($auth.isAuthenticated) {
        await cart.fetchCart();
      }
    })();

    const handleScroll = () => {
      isScrolled = window.scrollY > 20;
    };
    window.addEventListener('scroll', handleScroll);
    
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') isSearchOpen = false;
      if (e.key === '/' && !isSearchOpen) {
        e.preventDefault();
        isSearchOpen = true;
      }
    };
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  function handleLogout() {
    auth.logout();
    isMobileMenuOpen = false;
  }

  function handleSearchSubmit(e: Event) {
    e.preventDefault();
    if (searchQuery.trim()) {
      goto(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      isSearchOpen = false;
      searchQuery = '';
    }
  }

  const navLinks = [
    { label: 'All Shoes', href: '/products' },
    { label: 'Men', href: '/products?category=men' },
    { label: 'Women', href: '/products?category=women' },
    { label: 'Kids', href: '/products?category=kids' },
    { label: 'Unisex', href: '/products?category=unisex' },
    { label: 'Sale', href: '/products?sale=true' },
  ];
</script>

<nav
  class="sticky top-0 z-50 transition-all duration-300 {isScrolled
    ? 'bg-canvas-dark/95 backdrop-blur-xl shadow-lg shadow-black/20'
    : 'bg-canvas-dark'}"
>
  <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
    <!-- Logo -->
    <a href="/" class="flex items-center gap-1 flex-shrink-0">
      <span class="text-xl font-bold tracking-tighter text-white">
        SHOE<span class="text-primary">HUB</span>
      </span>
    </a>

    <!-- Center Nav Links (Desktop) -->
    <div class="hidden md:flex items-center gap-8">
      {#each navLinks as link}
        <a
          href={link.href}
          class="text-sm font-medium transition-colors duration-200 relative group
            {$page.url.pathname === link.href || $page.url.href.includes(link.href)
              ? 'text-white'
              : 'text-white/60 hover:text-white'}"
        >
          {link.label}
          <span
            class="absolute -bottom-0.5 left-0 h-0.5 bg-primary transition-all duration-200
              {$page.url.pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}"
          ></span>
        </a>
      {/each}
    </div>

    <!-- Right Side Actions -->
    <div class="flex items-center gap-4">
      <!-- Search -->
      <button
        onclick={() => (isSearchOpen = true)}
        aria-label="Search products"
        class="hidden md:flex w-9 h-9 items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <!-- Search Overlay -->
      {#if isSearchOpen}
        <div 
          class="fixed inset-0 z-[60] bg-canvas-dark/95 backdrop-blur-2xl flex items-start justify-center pt-32 px-6 animate-in fade-in duration-300"
        >
          <div class="w-full max-w-3xl animate-in zoom-in-95 slide-in-from-top-4 duration-300">
            <form onsubmit={handleSearchSubmit} class="relative">
              <input 
                type="text" 
                bind:value={searchQuery}
                placeholder="What are you looking for?"
                class="w-full bg-transparent border-b-2 border-white/20 pb-4 text-4xl font-display font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors"
                autofocus
              />
              <button 
                type="button"
                onclick={() => (isSearchOpen = false)}
                class="absolute right-0 top-1 text-white/40 hover:text-white transition-colors"
              >
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>
            <div class="mt-8 flex gap-4 text-white/40 text-xs font-bold uppercase tracking-widest">
              <span>Press <span class="text-white bg-white/10 px-1.5 py-0.5 rounded">ESC</span> to close</span>
            </div>
          </div>
        </div>
      {/if}

      {#if $auth.isAuthenticated}
        <!-- User Dropdown -->
        <div class="relative group">
          <button
            aria-label="User account menu"
            class="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <div
              class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white ring-2 ring-primary/30"
            >
              {$auth.user?.firstName?.[0]}{$auth.user?.lastName?.[0]}
            </div>
          </button>

          <!-- Dropdown Menu -->
          <div
            class="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-surface-border py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0"
          >
            <div class="px-4 py-2.5 border-b border-surface-border">
              <p class="text-xs font-semibold text-ink-muted uppercase tracking-wider">Account</p>
              <p class="text-sm font-medium text-ink truncate">{$auth.user?.firstName} {$auth.user?.lastName}</p>
            </div>
            {#if $auth.user?.role === 'admin'}
              <a href="/admin" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary font-semibold hover:bg-primary-light transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                Admin Portal
              </a>
            {/if}
            <a href="/profile" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-surface-soft transition-colors">
              <svg class="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              My Profile
            </a>
            <a href="/orders" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-surface-soft transition-colors">
              <svg class="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              My Orders
            </a>
            <a href="/wishlist" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-surface-soft transition-colors">
              <svg class="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              My Wishlist
            </a>
            <div class="border-t border-surface-border mt-1.5 pt-1.5">
              <button
                onclick={handleLogout}
                class="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-commerce hover:bg-red-50 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      {:else}
        <a
          href="/auth/login"
          class="text-sm font-semibold text-white/70 hover:text-white transition-colors hidden md:block"
        >
          Sign In
        </a>
        <a
          href="/auth/register"
          class="hidden md:flex items-center bg-primary text-white px-4 py-2 rounded-pill text-sm font-semibold hover:bg-primary-pressed transition-colors"
        >
          Get Started
        </a>
      {/if}

      <!-- Wishlist -->
      <a
        href="/wishlist"
        aria-label="View wishlist"
        class="relative w-9 h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </a>

      <!-- Cart -->
      <a
        href="/cart"
        aria-label="View cart"
        class="relative w-9 h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        {#if $cartCount > 0}
          <span
            class="absolute -top-0.5 -right-0.5 bg-commerce text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center leading-none"
          >
            {$cartCount}
          </span>
        {/if}
      </a>

      <!-- Mobile Menu Toggle -->
      <button
        onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
        aria-label="Toggle mobile menu"
        class="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all"
      >
        {#if isMobileMenuOpen}
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        {:else}
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile Menu -->
  {#if isMobileMenuOpen}
    <div class="md:hidden border-t border-white/10 bg-canvas-dark/98 backdrop-blur-xl px-6 pb-6 pt-4">
      <div class="flex flex-col gap-1">
        {#each navLinks as link}
          <a
            href={link.href}
            onclick={() => (isMobileMenuOpen = false)}
            class="px-4 py-3 rounded-lg text-sm font-medium transition-colors
              {$page.url.pathname === link.href ? 'bg-primary/20 text-primary' : 'text-white/70 hover:text-white hover:bg-white/5'}"
          >
            {link.label}
          </a>
        {/each}
        {#if !$auth.isAuthenticated}
          <div class="flex gap-3 mt-4 pt-4 border-t border-white/10">
            <a href="/auth/login" onclick={() => (isMobileMenuOpen = false)} class="flex-1 py-2.5 border border-white/20 text-white text-center rounded-pill text-sm font-semibold hover:bg-white/5 transition-colors">Sign In</a>
            <a href="/auth/register" onclick={() => (isMobileMenuOpen = false)} class="flex-1 py-2.5 bg-primary text-white text-center rounded-pill text-sm font-semibold hover:bg-primary-pressed transition-colors">Get Started</a>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</nav>
