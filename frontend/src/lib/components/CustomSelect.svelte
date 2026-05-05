<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let { 
    value = $bindable(''), 
    options = [], 
    placeholder = 'Select option',
    class: className = '',
    onchange = () => {}
  } = $props();

  let isOpen = $state(false);
  let selectedLabel = $derived(options.find(o => o.value === value)?.label || placeholder);

  function selectOption(val: string) {
    value = val;
    isOpen = false;
    onchange(val);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') isOpen = false;
  }
</script>

<div class="relative inline-block w-full min-w-[200px] {className}" onkeydown={handleKeydown} role="presentation">
  <!-- Trigger Button -->
  <button
    type="button"
    onclick={() => isOpen = !isOpen}
    class="w-full bg-white/80 backdrop-blur-md border-2 border-gray-100/50 px-6 py-3.5 rounded-[20px] flex items-center justify-between text-sm font-bold text-ink transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 focus:outline-none focus:border-primary group shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
  >
    <span class="flex items-center gap-3">
      <span class={value === '' ? 'text-gray-400 font-medium' : ''}>{selectedLabel}</span>
    </span>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      class="h-4.5 w-4.5 text-gray-400 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) {isOpen ? 'rotate-180 text-primary' : ''}" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if isOpen}
    <!-- Dropdown Menu -->
    <div 
      transition:slide={{ duration: 300, easing: cubicOut }}
      class="absolute z-50 mt-3 w-full bg-white/90 backdrop-blur-2xl rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20 overflow-hidden ring-1 ring-black/5"
    >
      <div class="p-2 max-h-72 overflow-y-auto custom-scrollbar">
        {#each options as opt}
          <button
            type="button"
            onclick={() => selectOption(opt.value)}
            class="w-full text-left px-5 py-3.5 text-sm font-bold transition-all duration-200 rounded-[16px] flex items-center justify-between group/item mb-1 last:mb-0
              {value === opt.value 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-ink-muted hover:bg-primary/5 hover:text-primary'}"
          >
            <span class="relative z-10">{opt.label}</span>
            
            {#if value === opt.value}
              <div transition:fade={{ duration: 200 }}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            {/if}
          </button>
        {/each}
      </div>
    </div>
    
    <!-- Seamless Backdrop -->
    <button 
      tabindex="-1"
      aria-label="Close dropdown"
      class="fixed inset-0 z-40 cursor-default bg-transparent" 
      onclick={() => isOpen = false}
      transition:fade={{ duration: 200 }}
    ></button>
  {/if}
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.1);
  }
</style>
