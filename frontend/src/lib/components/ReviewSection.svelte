<script lang="ts">
  import { onMount } from 'svelte';
  import { reviewApi } from '$lib/api/review.api';
  import { auth } from '$lib/stores/auth';
  import dayjs from 'dayjs';

  let { productId } = $props<{ productId: string }>();

  let reviews = $state<any[]>([]);
  let pagination = $state<any>(null);
  let loading = $state(true);
  
  // Form state
  let showForm = $state(false);
  let rating = $state(5);
  let title = $state('');
  let comment = $state('');
  let formError = $state('');
  let submitting = $state(false);

  onMount(async () => {
    await fetchReviews();
  });

  async function fetchReviews(page = 1) {
    loading = true;
    try {
      const { data } = await reviewApi.getProductReviews(productId, { page, limit: 5 });
      reviews = data.reviews;
      pagination = data.pagination;
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      loading = false;
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!$auth.isAuthenticated) return;
    
    submitting = true;
    formError = '';

    try {
      await reviewApi.createReview(productId, { rating, title, comment });
      showForm = false;
      title = '';
      comment = '';
      rating = 5;
      await fetchReviews(); // Refresh list
    } catch (err: any) {
      formError = err.response?.data?.message || 'Failed to submit review';
    } finally {
      submitting = false;
    }
  }
</script>

<div class="border-t border-gray-100 pt-12 mt-16">
  <div class="flex justify-between items-center mb-8">
    <h2 class="text-2xl font-display font-light text-ink">Customer Reviews</h2>
    {#if $auth.isAuthenticated}
      <button 
        onclick={() => showForm = !showForm}
        class="bg-surface-soft hover:bg-gray-200 text-ink px-6 py-2 rounded-pill font-bold transition-colors text-sm"
      >
        {showForm ? 'Cancel' : 'Write a Review'}
      </button>
    {:else}
      <a href="/auth/login" class="text-primary font-bold hover:underline text-sm">Sign in to write a review</a>
    {/if}
  </div>

  {#if showForm && $auth.isAuthenticated}
    <div class="bg-surface-card p-6 rounded-lg mb-8 border border-gray-100">
      <h3 class="font-bold text-ink mb-4">Write your review</h3>
      
      {#if formError}
        <div class="p-3 bg-red-50 text-red-700 rounded text-sm mb-4">{formError}</div>
      {/if}

      <form onsubmit={handleSubmit} class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-ink-deep mb-2">Rating</label>
          <div class="flex gap-2">
            {#each [1, 2, 3, 4, 5] as star}
              <button 
                type="button"
                onclick={() => rating = star}
                class="text-2xl focus:outline-none transition-transform hover:scale-110 {rating >= star ? 'text-yellow-400' : 'text-gray-300'}"
              >
                ★
              </button>
            {/each}
          </div>
        </div>

        <div>
          <label for="title" class="block text-sm font-medium text-ink-deep mb-2">Title</label>
          <input 
            type="text" 
            id="title" 
            bind:value={title} 
            required 
            maxlength="100"
            placeholder="Summarize your experience"
            class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label for="comment" class="block text-sm font-medium text-ink-deep mb-2">Review</label>
          <textarea 
            id="comment" 
            bind:value={comment} 
            required 
            rows="4"
            maxlength="1000"
            placeholder="Tell others what you thought about this product..."
            class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          class="bg-primary text-white px-6 py-2 rounded-pill font-bold hover:bg-primary-pressed transition-colors disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  {/if}

  <!-- Review List -->
  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  {:else if reviews.length === 0}
    <p class="text-gray-500 italic">No reviews yet. Be the first to share your thoughts!</p>
  {:else}
    <div class="space-y-6">
      {#each reviews as review}
        <div class="border-b border-gray-100 pb-6 last:border-0">
          <div class="flex justify-between items-start mb-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-surface-soft flex items-center justify-center font-bold text-ink border border-gray-200">
                {review.userId.firstName[0]}{review.userId.lastName[0]}
              </div>
              <div>
                <p class="font-bold text-ink text-sm">{review.userId.firstName} {review.userId.lastName}</p>
                <p class="text-xs text-gray-500">{dayjs(review.createdAt).format('MMMM D, YYYY')}</p>
              </div>
            </div>
            <div class="flex text-yellow-400 text-sm">
              {#each Array(5) as _, i}
                <span>{i < review.rating ? '★' : '☆'}</span>
              {/each}
            </div>
          </div>
          
          <h4 class="font-bold text-ink mt-3 mb-1">{review.title}</h4>
          <p class="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
        </div>
      {/each}

      <!-- Pagination -->
      {#if pagination && pagination.pages > 1}
        <div class="mt-8 flex justify-center space-x-2">
          {#each Array(pagination.pages) as _, i}
            <button 
              onclick={() => fetchReviews(i + 1)}
              class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all {pagination.page === i + 1 ? 'bg-primary text-white' : 'bg-surface-soft text-ink hover:bg-gray-200'}"
            >
              {i + 1}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
