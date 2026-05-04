<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import './layout.css';

  import { page } from '$app/stores';

  let { children } = $props();

  onMount(async () => {
    await auth.init();
  });

  const isAdminPath = $derived($page.url.pathname.startsWith('/admin'));
</script>

<div class="min-h-screen flex flex-col font-sans">
  {#if !isAdminPath}
    <Navbar />
  {/if}
  <main class="flex-1">
    {@render children()}
  </main>
  {#if !isAdminPath}
    <Footer />
  {/if}
</div>
