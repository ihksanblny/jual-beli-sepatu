<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { productApi } from "$lib/api/product.api";
  import { onMount } from "svelte";

  let recentProducts = $state<any[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      const response = await productApi.getProducts({
        limit: 8,
        sort: "-createdAt",
      });
      recentProducts = response.products || [];
    } catch (error) {
      console.error("Failed to fetch recent products:", error);
    } finally {
      loading = false;
    }
  });

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }

  const features = [
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>`,
      title: "Iconic Collections",
      desc: "Curated selection of rare and classic silhouettes",
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
      title: "Expertly Verified",
      desc: "100% authenticity guaranteed on every single pair",
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
      title: "Premium Quality",
      desc: "Only the finest materials and craftsmanship",
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
      title: "Exclusive Drops",
      desc: "Early access to limited releases and collaborations",
    },
  ];

  const brands = [
    { name: "Nike", logo: "https://cdn.simpleicons.org/nike/000000" },
    { name: "Adidas", logo: "https://cdn.simpleicons.org/adidas/000000" },
    {
      name: "New Balance",
      logo: "https://cdn.simpleicons.org/newbalance/000000",
    },
    { name: "Puma", logo: "https://cdn.simpleicons.org/puma/000000" },
    { name: "Reebok", logo: "https://cdn.simpleicons.org/reebok/000000" },
    {
      name: "Under Armour",
      logo: "https://cdn.simpleicons.org/underarmour/000000",
    },
  ];
</script>

<svelte:head>
  <title>ShoeHub — Step Into Excellence</title>
  <meta
    name="description"
    content="Shop premium footwear from the world's leading brands. Free shipping on orders over $100."
  />
</svelte:head>

<!-- ============================================ -->
<!-- HERO SECTION                                 -->
<!-- ============================================ -->
<section
  class="relative bg-canvas-dark text-white overflow-hidden"
  style="min-height: 85vh; display: flex; align-items: center;"
>
  <!-- Background -->
  <div class="absolute inset-0 z-0">
    <img
      src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1920"
      alt="Hero Background"
      class="w-full h-full object-cover object-center"
    />
    <div
      class="absolute inset-0"
      style="background: linear-gradient(135deg, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.75) 50%, rgba(37,99,235,0.15) 100%);"
    ></div>
  </div>

  <!-- Content — perfectly centered -->
  <div
    class="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 flex flex-col items-center text-center"
  >
    <!-- Eyebrow label -->
    <div
      class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 text-white/80 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-pill mb-8"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
      New Season Collection 2025
    </div>

    <h1
      class="text-5xl md:text-7xl font-display font-bold leading-tight mb-6 max-w-4xl"
    >
      Step Into the World of
      <span
        class="block"
        style="background: linear-gradient(90deg, #2563eb, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"
      >
        Athletic Excellence
      </span>
    </h1>

    <p class="text-lg md:text-xl text-white/60 mb-12 max-w-2xl leading-relaxed">
      Discover premium performance footwear engineered for those who never stop
      pushing limits. From the track to the streets — own every step.
    </p>

    <div class="flex flex-wrap gap-4 justify-center">
      <a
        href="/products"
        class="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-pill font-semibold hover:bg-primary-pressed transition-all shadow-lg shadow-primary/30 text-base"
      >
        Shop Collection
        <svg
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </a>
      <a
        href="/products?featured=true"
        class="flex items-center gap-2 border border-white/25 bg-white/5 backdrop-blur-md text-white px-8 py-4 rounded-pill font-semibold hover:bg-white/15 transition-all text-base"
      >
        Explore Featured
      </a>
    </div>

    <!-- Stats Row -->
    <div
      class="flex flex-wrap justify-center gap-12 mt-20 pt-10 border-t border-white/10 w-full max-w-2xl"
    >
      {#each [["500+", "Styles Available"], ["50K+", "Happy Customers"], ["100%", "Authentic Products"]] as [num, label]}
        <div class="text-center">
          <div class="text-3xl font-display font-bold text-white">{num}</div>
          <div class="text-sm text-white/50 mt-1">{label}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ============================================ -->
<!-- CATEGORY SECTION                             -->
<!-- ============================================ -->
<section class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-6">
    <div class="flex flex-col items-center mb-16 text-center">
      <h2 class="text-4xl font-display font-bold text-ink mb-4">Shop by Category</h2>
      <div class="w-20 h-1 bg-primary"></div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each [
        { label: "Men's", href: '/products?category=men', img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800', count: '120+ Styles' },
        { label: "Women's", href: '/products?category=women', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800', count: '95+ Styles' },
        { label: "Kid's", href: '/products?category=kids', img: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800', count: '60+ Styles' },
      ] as cat}
        <a
          href={cat.href}
          class="group relative h-[420px] rounded-2xl overflow-hidden bg-gray-100 flex items-end shadow-sm hover:shadow-2xl transition-all duration-500"
        >
          <img
            src={cat.img}
            alt={cat.label}
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
          <div class="relative z-10 p-8 w-full">
            <p class="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">{cat.count}</p>
            <h3 class="text-3xl font-display font-bold text-white mb-3">{cat.label}</h3>
            <div class="flex items-center gap-2 text-white/80 text-sm font-semibold group-hover:text-primary transition-colors duration-300">
              Shop Now
              <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>

<!-- ============================================ -->
<!-- NEW ARRIVALS SECTION                         -->
<!-- ============================================ -->
<section class="bg-canvas-subtle py-24 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-end mb-12">
      <div>
        <h2 class="text-4xl font-display font-bold text-ink mb-2">New Arrivals</h2>
        <p class="text-ink-muted">The freshest drops from the world's leading brands.</p>
      </div>
      <a href="/products" class="hidden md:flex items-center gap-2 text-primary font-semibold hover:underline text-sm">
        View All
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </a>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {#if loading}
        {#each Array(8) as _}
          <div class="bg-gray-100 animate-pulse rounded-2xl overflow-hidden">
            <div class="aspect-square bg-gray-200"></div>
            <div class="p-4 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              <div class="h-5 bg-gray-200 rounded w-1/3 mt-2"></div>
            </div>
          </div>
        {/each}
      {:else if recentProducts.length === 0}
        <div class="col-span-4 text-center py-20">
          <p class="text-ink-muted text-lg">No products found. Check back soon!</p>
        </div>
      {:else}
        {#each recentProducts as product}
          <a
            href="/products/{product._id}"
            class="group bg-white rounded-2xl overflow-hidden border border-surface-border hover:shadow-xl hover:border-primary/20 transition-all duration-300 block"
          >
            <div class="aspect-square bg-canvas-subtle relative overflow-hidden">
              {#if product.images && product.images.length > 0}
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              {:else}
                <div class="absolute inset-0 flex flex-col items-center justify-center text-ink-muted/30 gap-2">
                  <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span class="text-xs">No Image</span>
                </div>
              {/if}
              {#if product.featured}
                <div class="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-pill uppercase tracking-wider shadow-md">
                  Featured
                </div>
              {/if}
              <!-- Quick View Overlay -->
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span class="bg-white text-ink text-xs font-semibold px-4 py-2 rounded-pill shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  View Details
                </span>
              </div>
            </div>
            <div class="p-4">
              <p class="text-[10px] text-ink-muted uppercase tracking-widest font-semibold mb-1">{product.brand}</p>
              <h3 class="font-semibold text-ink text-sm mb-3 truncate">{product.name}</h3>
              <div class="flex justify-between items-center">
                <span class="text-base font-bold text-ink">{formatPrice(product.price)}</span>
                <div class="w-8 h-8 rounded-full bg-canvas-subtle border border-surface-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </div>
              </div>
            </div>
          </a>
        {/each}
      {/if}
    </div>

    <div class="text-center mt-12">
      <a
        href="/products"
        class="inline-flex items-center gap-2 border-2 border-ink/15 text-ink px-8 py-3.5 rounded-pill font-semibold hover:border-primary hover:text-primary transition-all text-sm"
      >
        Browse All Products
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </a>
    </div>
  </div>
</section>

<!-- ============================================ -->
<!-- PROMOTIONAL OFFER SECTION                   -->
<!-- ============================================ -->
<section class="bg-white border-t border-b border-surface-border py-20 px-6 overflow-hidden relative">
  <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
    
    <!-- Left: Offer Text -->
    <div class="flex-1 text-center md:text-left z-10">
      <span class="inline-block px-4 py-1.5 bg-commerce text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-6 rounded-sm">
        Limited Time Offer
      </span>
      <h2 class="text-5xl md:text-7xl font-display font-bold text-ink mb-6 leading-none">
        MEGA <br/>SUMMER <br/><span class="text-primary">DROP.</span>
      </h2>
      <p class="text-2xl font-bold text-ink-muted mb-8 uppercase tracking-widest">
        UP TO <span class="text-commerce">50% OFF</span> SELECT STYLES
      </p>
      <a 
        href="/products?sale=true" 
        class="inline-block bg-ink text-white px-10 py-4 font-bold uppercase tracking-widest text-sm hover:bg-primary transition-all duration-300 shadow-xl"
      >
        Shop the Sale
      </a>
    </div>

    <!-- Right: Animated Sneaker -->
    <div class="flex-1 relative flex justify-center items-center">
      <!-- Decorative circles in background -->
      <div class="absolute w-72 h-72 bg-primary/5 rounded-full animate-pulse"></div>
      <div class="absolute w-48 h-48 bg-primary/10 rounded-full scale-150 opacity-20"></div>
      
      <div class="relative sneaker-float">
        <img 
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000" 
          alt="Floating Sneaker" 
          class="w-full max-w-md h-auto drop-shadow-[0_35px_60px_rgba(0,0,0,0.2)] transform -rotate-12"
        />
      </div>
    </div>
  </div>
</section>

<style>
  .sneaker-float {
    animation: float 4s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0) rotate(-12deg);
    }
    50% {
      transform: translateY(-20px) rotate(-10deg);
    }
  }
</style>

<!-- ============================================ -->
<!-- BRANDS SECTION                               -->
<!-- ============================================ -->
<section class="bg-canvas-subtle py-16 px-6">
  <div class="max-w-7xl mx-auto text-center">
    <p class="text-xs text-ink-muted uppercase tracking-widest font-semibold mb-10">Trusted Brands We Carry</p>
    <div class="flex flex-wrap justify-center items-center gap-12 md:gap-20">
      {#each brands as brand}
        <div class="group relative">
          <img 
            src={brand.logo} 
            alt={brand.name} 
            class="h-8 md:h-12 w-auto grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer object-contain"
          />
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ============================================ -->
<!-- CTA BANNER                                   -->
<!-- ============================================ -->
<section
  class="relative overflow-hidden py-24 px-6 text-white text-center"
  style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%);"
>
  <!-- Decorative circles -->
  <div class="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full"></div>
  <div class="absolute -bottom-16 -right-16 w-64 h-64 bg-white/5 rounded-full"></div>

  <div class="relative z-10 max-w-2xl mx-auto">
    {#if $auth.isAuthenticated}
      <h2 class="text-4xl font-display font-bold mb-4">Welcome back, {$auth.user?.firstName}! 👋</h2>
      <p class="text-white/70 text-lg mb-8">Your next great pair is waiting. Explore personalized picks just for you.</p>
      <div class="flex gap-4 justify-center">
        <a href="/products" class="bg-white text-primary px-8 py-3.5 rounded-pill font-semibold hover:bg-gray-100 transition-colors">
          Browse Products
        </a>
        <a href="/orders" class="border border-white/30 text-white px-8 py-3.5 rounded-pill font-semibold hover:bg-white/10 transition-colors">
          My Orders
        </a>
      </div>
    {:else}
      <h2 class="text-4xl font-display font-bold mb-4">Ready to Find Your Perfect Pair?</h2>
      <p class="text-white/70 text-lg mb-8">Join thousands of sneaker enthusiasts. Get early access to drops, exclusive offers, and more.</p>
      <div class="flex gap-4 justify-center flex-wrap">
        <a href="/auth/register" class="bg-white text-primary px-8 py-3.5 rounded-pill font-semibold hover:bg-gray-100 transition-colors shadow-lg">
          Create Free Account
        </a>
        <a href="/auth/login" class="border border-white/30 text-white px-8 py-3.5 rounded-pill font-semibold hover:bg-white/10 transition-colors">
          Sign In
        </a>
      </div>
    {/if}
  </div>
</section>

<!-- ============================================ -->
<!-- FOOTER                                       -->
<!-- ============================================ -->
<footer class="bg-canvas-dark text-white/50 py-16 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
      <div class="md:col-span-2">
        <a href="/" class="text-2xl font-bold text-white tracking-tighter block mb-4">
          SHOE<span class="text-primary">HUB</span>
        </a>
        <p class="text-sm leading-relaxed max-w-xs">
          Premium footwear for athletes, dreamers, and everyday legends. Step into your best self.
        </p>
      </div>
      <div>
        <h4 class="text-white text-sm font-semibold uppercase tracking-wider mb-4">Shop</h4>
        <ul class="space-y-2.5 text-sm">
          <li><a href="/products" class="hover:text-white transition-colors">All Shoes</a></li>
          <li><a href="/products?category=men" class="hover:text-white transition-colors">Men's</a></li>
          <li><a href="/products?category=women" class="hover:text-white transition-colors">Women's</a></li>
          <li><a href="/products?category=kids" class="hover:text-white transition-colors">Kid's</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white text-sm font-semibold uppercase tracking-wider mb-4">Account</h4>
        <ul class="space-y-2.5 text-sm">
          <li><a href="/auth/login" class="hover:text-white transition-colors">Sign In</a></li>
          <li><a href="/auth/register" class="hover:text-white transition-colors">Create Account</a></li>
          <li><a href="/orders" class="hover:text-white transition-colors">Order History</a></li>
          <li><a href="/profile" class="hover:text-white transition-colors">My Profile</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
      <p>© {new Date().getFullYear()} ShoeHub. All rights reserved.</p>
      <div class="flex gap-6">
        <a href="/privacy" class="hover:text-white transition-colors">Privacy Policy</a>
        <a href="/terms" class="hover:text-white transition-colors">Terms of Service</a>
      </div>
    </div>
  </div>
</footer>
