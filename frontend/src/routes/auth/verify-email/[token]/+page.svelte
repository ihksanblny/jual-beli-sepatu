<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { authApi } from '$lib/api/auth.api';
  import { goto } from '$app/navigation';

  let status = $state<'loading' | 'success' | 'error'>('loading');
  let message = $state('');

  onMount(async () => {
    const token = $page.params.token;
    if (!token) {
      status = 'error';
      message = 'Invalid verification link.';
      return;
    }

    try {
      const response = await authApi.verifyEmail(token as string);
      status = 'success';
      message = response.message;
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        goto('/auth/login');
      }, 3000);
    } catch (error: any) {
      status = 'error';
      message = error.response?.data?.message || 'Verification failed. The link may be invalid or expired.';
    }
  });
</script>

<svelte:head>
  <title>Verify Email | ShoeHub</title>
</svelte:head>

<div class="min-h-[80vh] flex items-center justify-center px-6">
  <div class="w-full max-w-md bg-white rounded-[32px] p-12 text-center shadow-xl border border-surface-border">
    {#if status === 'loading'}
      <div class="flex flex-col items-center gap-6">
        <div class="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <h1 class="text-2xl font-bold text-ink">Verifying your email...</h1>
        <p class="text-ink-muted">Please wait while we activate your account.</p>
      </div>
    {:else}
      <div class="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
        <div class="w-20 h-20 rounded-full flex items-center justify-center {status === 'success' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}">
          {#if status === 'success'}
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          {:else}
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          {/if}
        </div>
        
        <h1 class="text-3xl font-extrabold text-ink tracking-tight">
          {status === 'success' ? 'All set!' : 'Oops!'}
        </h1>
        
        <p class="text-ink-muted leading-relaxed">
          {message}
        </p>

        {#if status === 'success'}
          <p class="text-xs text-ink-muted mt-4">
            Redirecting you to login in a few seconds...
          </p>
          <a href="/auth/login" class="mt-4 text-primary font-bold hover:underline">
            Click here if you're not redirected
          </a>
        {:else}
          <a 
            href="/auth/register" 
            class="mt-6 w-full bg-primary text-white py-4 rounded-pill font-bold hover:bg-primary-pressed transition-all shadow-lg shadow-primary/20"
          >
            Back to Registration
          </a>
        {/if}
      </div>
    {/if}
  </div>
</div>
