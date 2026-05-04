<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { authApi } from "$lib/api/auth.api";
  import { goto } from "$app/navigation";

  let email = $state("");
  let password = $state("");
  let resendStatus = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
  let resendMessage = $state('');

  let error = $derived($auth.error);
  let loading = $derived($auth.loading);
  let showPassword = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    await auth.login({ email, password });
    if ($auth.isAuthenticated) {
      goto("/");
    }
  }

  async function handleResendEmail() {
    if (resendStatus === 'loading') return;
    resendStatus = 'loading';
    try {
      const response = await authApi.resendVerification(email);
      resendStatus = 'success';
      resendMessage = response.message;
    } catch (err: any) {
      resendStatus = 'error';
      resendMessage = err.response?.data?.message || 'Failed to resend email.';
    }
  }
</script>

<div class="login-page">
  <!-- Left — visual panel -->
  <div class="login-visual">
    <img
      src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1600"
      alt="Premium sneakers"
      class="login-visual__img"
    />
    <div class="login-visual__overlay"></div>

    <!-- Branding -->
    <div class="login-visual__brand">
      <a href="/">
        SHOE<span>HUB</span>
      </a>
    </div>

    <!-- Headline -->
    <div class="login-visual__headline">
      <h2>Elevate Your<br />Every <em>Step.</em></h2>
      <p>Premium footwear collective</p>
    </div>
  </div>

  <!-- Right — form panel -->
  <div class="login-form">
    <div class="login-form__inner">
      <div class="login-form__header">
        <!-- Mobile-only logo -->
        <div class="login-form__mobile-logo">
          <a href="/">SHOE<span>HUB</span></a>
        </div>
        <h1>Welcome Back</h1>
        <p>Sign in to access your ShoeHub account.</p>
      </div>

      {#if error}
        <div class="login-form__error">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div class="login-form__error-content">
            <span>{error}</span>
            {#if error.toLowerCase().includes('verify')}
              <button type="button" class="resend-btn" onclick={handleResendEmail} disabled={resendStatus === 'loading'}>
                {resendStatus === 'loading' ? 'Sending...' : 'Resend Verification Email'}
              </button>
              {#if resendStatus === 'success'}
                <p class="resend-success">{resendMessage}</p>
              {:else if resendStatus === 'error'}
                <p class="resend-error">{resendMessage}</p>
              {/if}
            {/if}
          </div>
        </div>
      {/if}

      <form onsubmit={handleSubmit}>
        <div class="login-form__field">
          <label for="email">Email Address</label>
          <input
            type="email"
            id="email"
            bind:value={email}
            required
            placeholder="you@example.com"
          />
        </div>

        <div class="login-form__field">
          <div class="login-form__field-header">
            <label for="password">Password</label>
            <a href="/auth/forgot-password">Forgot password?</a>
          </div>
          <div class="login-form__password-wrap">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              bind:value={password}
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              onclick={() => (showPassword = !showPassword)}
              class="login-form__eye"
            >
              {#if showPassword}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  /></svg
                >
              {:else}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  /><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  /></svg
                >
              {/if}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} class="login-form__submit">
          {#if loading}
            <svg class="login-form__spinner" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                opacity="0.25"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                opacity="0.75"
              />
            </svg>
            Signing in...
          {:else}
            Sign In
          {/if}
        </button>
      </form>

      <p class="login-form__register">
        Don't have an account?
        <a href="/auth/register">Create one for free</a>
      </p>
    </div>
  </div>
</div>

<style>
  /* ─── Layout ─────────────────────────────────── */
  .login-page {
    display: flex;
    width: 100%;
    min-height: 100vh;
  }

  /* ─── Visual Panel (Left) ────────────────────── */
  .login-visual {
    display: none;
    position: relative;
    width: 50%;
    flex-shrink: 0;
    overflow: hidden;
  }
  @media (min-width: 1024px) {
    .login-visual {
      display: block;
    }
  }

  .login-visual__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .login-visual__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.55) 0%,
      rgba(0, 0, 0, 0.25) 50%,
      transparent 100%
    );
  }

  .login-visual__brand {
    position: absolute;
    top: 48px;
    left: 48px;
    z-index: 2;
  }
  .login-visual__brand a {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: #fff;
    text-decoration: none;
  }
  .login-visual__brand span {
    color: #2563eb;
  }

  .login-visual__headline {
    position: absolute;
    bottom: 64px;
    left: 48px;
    z-index: 2;
    max-width: 400px;
  }
  .login-visual__headline h2 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 3.25rem;
    font-weight: 700;
    line-height: 1.1;
    color: #fff;
    margin-bottom: 16px;
  }
  .login-visual__headline em {
    color: #2563eb;
    font-style: italic;
  }
  .login-visual__headline p {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.35em;
    color: rgba(255, 255, 255, 0.45);
  }

  /* ─── Form Panel (Right) ─────────────────────── */
  .login-form {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 32px;
    background: #fff;
  }

  .login-form__inner {
    width: 100%;
    max-width: 400px;
  }

  /* Mobile logo */
  .login-form__mobile-logo {
    display: block;
    margin-bottom: 32px;
  }
  .login-form__mobile-logo a {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: #0f172a;
    text-decoration: none;
  }
  .login-form__mobile-logo span {
    color: #2563eb;
  }
  @media (min-width: 1024px) {
    .login-form__mobile-logo {
      display: none;
    }
  }

  .login-form__header {
    margin-bottom: 40px;
  }
  .login-form__header h1 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
  }
  .login-form__header p {
    font-size: 0.875rem;
    color: #64748b;
  }

  /* Error */
  .login-form__error {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    margin-bottom: 32px;
    background: #fef2f2;
    border: 1px solid #fee2e2;
    border-radius: 14px;
    color: #991b1b;
  }
  .login-form__error svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .login-form__error-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .resend-btn {
    background: none;
    border: none;
    color: #2563eb;
    font-weight: 700;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    text-align: left;
    font-size: 0.8rem;
  }
  .resend-btn:hover {
    color: #1d4ed8;
  }
  .resend-btn:disabled {
    color: #94a3b8;
    cursor: not-allowed;
    text-decoration: none;
  }
  .resend-success { color: #059669; font-size: 0.75rem; }
  .resend-error { color: #dc2626; font-size: 0.75rem; }

  /* Fields */
  form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .login-form__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .login-form__field label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #0f172a;
  }
  .login-form__field input {
    width: 100%;
    padding: 14px 18px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #0f172a;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    outline: none;
    transition: all 0.2s;
  }
  .login-form__field input::placeholder {
    color: #94a3b8;
  }
  .login-form__field input:focus {
    background: #fff;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .login-form__field-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .login-form__field-header a {
    font-size: 0.75rem;
    font-weight: 600;
    color: #2563eb;
    text-decoration: none;
  }
  .login-form__field-header a:hover {
    text-decoration: underline;
  }

  /* Password wrapper */
  .login-form__password-wrap {
    position: relative;
  }

  .login-form__eye {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    padding: 0;
    transition: color 0.2s;
  }
  .login-form__eye:hover {
    color: #2563eb;
  }
  .login-form__eye svg {
    width: 20px;
    height: 20px;
  }

  /* Submit */
  .login-form__submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 16px;
    margin-top: 8px;
    font-size: 0.875rem;
    font-weight: 700;
    color: #fff;
    background: #0f172a;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .login-form__submit:hover {
    background: #1e293b;
  }
  .login-form__submit:active {
    transform: scale(0.98);
  }
  .login-form__submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .login-form__spinner {
    width: 18px;
    height: 18px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Register link */
  .login-form__register {
    margin-top: 36px;
    text-align: center;
    font-size: 0.8rem;
    color: #64748b;
  }
  .login-form__register a {
    color: #2563eb;
    font-weight: 700;
    text-decoration: none;
  }
  .login-form__register a:hover {
    text-decoration: underline;
  }
</style>
