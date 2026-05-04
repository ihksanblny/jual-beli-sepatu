<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { authApi } from '$lib/api/auth.api';

  let firstName = $state('');
  let lastName = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let showPassword = $state(false);
  let success = $state(false);
  let resendStatus = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
  let resendMessage = $state('');
  
  let error = $derived($auth.error);
  let loading = $derived($auth.loading);
  let passwordMismatch = $derived(password !== confirmPassword && confirmPassword !== '');

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (passwordMismatch) return;
    
    await auth.register({ firstName, lastName, email, password });
    if (!$auth.error && !loading) {
      success = true;
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

<div class="register-page">
  <!-- Left — visual panel -->
  <div class="register-visual">
    <img
      src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=1600"
      alt="Premium footwear"
      class="register-visual__img"
    />
    <div class="register-visual__overlay"></div>

    <!-- Branding -->
    <div class="register-visual__brand">
      <a href="/">
        SHOE<span>HUB</span>
      </a>
    </div>

    <!-- Headline -->
    <div class="register-visual__headline">
      <h2>Join the<br />Collective <em>Today.</em></h2>
      <p>Exclusive access to premium drops</p>
    </div>
  </div>

  <!-- Right — form panel -->
  <div class="register-form">
    <div class="register-form__inner">
      {#if success}
        <div class="register-form__success animate-in zoom-in-95 duration-500">
          <div class="register-form__success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2>Check your email</h2>
          <p>We've sent a verification link to <strong>{email}</strong>. Please verify your account to start shopping.</p>
          
          <div class="register-form__resend">
            {#if resendStatus === 'success'}
              <p class="resend-message success">{resendMessage}</p>
            {:else if resendStatus === 'error'}
              <p class="resend-message error">{resendMessage}</p>
              <button type="button" class="resend-link" onclick={handleResendEmail}>Try again</button>
            {:else}
              <p>Didn't receive the email? 
                <button type="button" class="resend-link" onclick={handleResendEmail} disabled={resendStatus === 'loading'}>
                  {resendStatus === 'loading' ? 'Sending...' : 'Resend Email'}
                </button>
              </p>
            {/if}
          </div>

          <a href="/auth/login" class="register-form__success-button">
            Go to Sign In
          </a>
        </div>
      {:else}
        <div class="register-form__header">
          <!-- Mobile-only logo -->
          <div class="register-form__mobile-logo">
            <a href="/">SHOE<span>HUB</span></a>
          </div>
          <h1>Create Account</h1>
          <p>Join ShoeHub for the best shopping experience.</p>
        </div>

        {#if error}
          <div class="register-form__error">
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
            <span>{error}</span>
          </div>
        {/if}

        <form onsubmit={handleSubmit}>
          <!-- Name Grid -->
          <div class="register-form__grid">
            <div class="register-form__field">
              <label for="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                bind:value={firstName}
                required
                placeholder="John"
              />
            </div>
            <div class="register-form__field">
              <label for="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                bind:value={lastName}
                required
                placeholder="Doe"
              />
            </div>
          </div>

          <div class="register-form__field">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              bind:value={email}
              required
              placeholder="you@example.com"
            />
          </div>

          <div class="register-form__field">
            <label for="password">Password</label>
            <div class="register-form__password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                bind:value={password}
                required
                minlength="8"
                placeholder="••••••••"
              />
              <button
                type="button"
                onclick={() => (showPassword = !showPassword)}
                class="register-form__eye"
              >
                {#if showPassword}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                {:else}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                {/if}
              </button>
            </div>
          </div>

          <div class="register-form__field">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              bind:value={confirmPassword}
              required
              class={passwordMismatch ? 'input-error' : ''}
              placeholder="••••••••"
            />
            {#if passwordMismatch}
              <p class="register-form__error-text">Passwords do not match</p>
            {/if}
          </div>

          <button type="submit" disabled={loading || passwordMismatch} class="register-form__submit">
            {#if loading}
              <svg class="register-form__spinner" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75"/>
              </svg>
              Creating Account...
            {:else}
              Create Account
            {/if}
          </button>
        </form>

        <p class="register-form__login">
          Already have an account?
          <a href="/auth/login">Sign In</a>
        </p>
      {/if}
    </div>
  </div>
</div>

<style>
  /* ─── Success State ─────────────────────────── */
  .register-form__success {
    text-align: center;
    padding: 32px 0;
  }
  .register-form__success-icon {
    width: 80px;
    height: 80px;
    background: #eff6ff;
    color: #2563eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }
  .register-form__success-icon svg {
    width: 40px;
    height: 40px;
  }
  .register-form__success h2 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 12px;
  }
  .register-form__success p {
    font-size: 1rem;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 24px;
  }
  .register-form__success-button {
    display: inline-block;
    background: #0f172a;
    color: #fff;
    padding: 16px 32px;
    border-radius: 14px;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.2s;
  }
  .register-form__success-button:hover {
    background: #1e293b;
    transform: translateY(-2px);
  }

  .register-form__resend {
    margin-bottom: 32px;
    font-size: 0.9rem;
    color: #64748b;
  }
  .resend-link {
    background: none;
    border: none;
    color: #2563eb;
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
    padding: 0 4px;
    transition: color 0.2s;
  }
  .resend-link:hover {
    color: #1d4ed8;
  }
  .resend-link:disabled {
    color: #94a3b8;
    cursor: not-allowed;
    text-decoration: none;
  }
  .resend-message {
    font-weight: 600;
    margin-top: 8px;
  }
  .resend-message.success { color: #10b981; }
  .resend-message.error { color: #ef4444; }

  /* ─── Layout ─────────────────────────────────── */
  .register-page {
    display: flex;
    min-height: 100vh;
    background: #fff;
  }

  .register-visual {
    position: relative;
    flex: 1;
    display: none;
    overflow: hidden;
  }

  @media (min-width: 1024px) {
    .register-visual {
      display: block;
    }
  }

  .register-visual__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .register-visual__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(15, 23, 42, 0.4),
      rgba(15, 23, 42, 0.8)
    );
  }

  .register-visual__brand {
    position: absolute;
    top: 40px;
    left: 40px;
  }

  .register-visual__brand a {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #fff;
    text-decoration: none;
  }

  .register-visual__brand span {
    color: #3b82f6;
  }

  .register-visual__headline {
    position: absolute;
    bottom: 80px;
    left: 40px;
    color: #fff;
    max-width: 400px;
  }

  .register-visual__headline h2 {
    font-size: 3rem;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 16px;
  }

  .register-visual__headline em {
    font-style: normal;
    color: #3b82f6;
  }

  .register-visual__headline p {
    font-size: 1.125rem;
    opacity: 0.9;
  }

  .register-form {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    background: #fff;
  }

  .register-form__inner {
    width: 100%;
    max-width: 440px;
  }

  .register-form__mobile-logo {
    margin-bottom: 32px;
  }

  @media (min-width: 1024px) {
    .register-form__mobile-logo {
      display: none;
    }
  }

  .register-form__mobile-logo a {
    font-size: 1.25rem;
    font-weight: 800;
    color: #0f172a;
    text-decoration: none;
  }

  .register-form__mobile-logo span {
    color: #2563eb;
  }

  .register-form__header h1 {
    font-size: 2.25rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #0f172a;
    margin-bottom: 8px;
  }

  .register-form__header p {
    color: #64748b;
    font-size: 1.05rem;
    margin-bottom: 40px;
  }

  .register-form__error {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fef2f2;
    color: #991b1b;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 32px;
    font-weight: 500;
    border: 1px solid #fee2e2;
  }

  .register-form__error svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .register-form__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .register-form__field {
    margin-bottom: 24px;
  }

  .register-form__field label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 8px;
  }

  .register-form__field input {
    width: 100%;
    height: 52px;
    padding: 0 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 1rem;
    color: #0f172a;
    transition: all 0.2s;
  }

  .register-form__field input:focus {
    outline: none;
    border-color: #2563eb;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
  }

  .register-form__password-wrap {
    position: relative;
  }

  .register-form__eye {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
  }

  .register-form__eye:hover {
    color: #64748b;
  }

  .register-form__eye svg {
    width: 20px;
    height: 20px;
  }

  .register-form__error-text {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 6px;
    font-weight: 500;
  }

  .register-form__submit {
    width: 100%;
    height: 56px;
    background: #0f172a;
    color: #fff;
    border: none;
    border-radius: 14px;
    font-size: 1.05rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 8px;
  }

  .register-form__submit:hover:not(:disabled) {
    background: #1e293b;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
  }

  .register-form__submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .register-form__spinner {
    width: 20px;
    height: 20px;
    animation: rotate 1s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .register-form__login {
    text-align: center;
    margin-top: 32px;
    color: #64748b;
    font-weight: 500;
  }

  .register-form__login a {
    color: #2563eb;
    text-decoration: none;
    font-weight: 700;
    margin-left: 4px;
  }

  .register-form__login a:hover {
    text-decoration: underline;
  }

  input.input-error {
    border-color: #ef4444;
    background: #fff5f5;
  }
</style>
