<script lang="ts">
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

  // Close dropdown on click outside
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') isOpen = false;
  }
</script>

<div class="relative inline-block w-full min-w-[160px] {className}" onkeydown={handleKeydown}>
  <button
    type="button"
    onclick={() => isOpen = !isOpen}
    class="w-full bg-white border-2 border-gray-100 px-5 py-3 rounded-2xl flex items-center justify-between text-sm font-bold text-ink transition-all hover:border-primary focus:outline-none focus:border-primary shadow-sm"
  >
    <span class={value === '' ? 'text-gray-400 font-medium' : ''}>{selectedLabel}</span>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      class="h-4 w-4 text-gray-400 transition-transform duration-300 {isOpen ? 'rotate-180' : ''}" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if isOpen}
    <div 
      class="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div class="py-2 max-h-64 overflow-y-auto">
        {#each options as opt}
          <button
            type="button"
            onclick={() => selectOption(opt.value)}
            class="w-full text-left px-5 py-3 text-sm font-bold transition-colors flex items-center justify-between group
              {value === opt.value ? 'bg-primary/5 text-primary' : 'text-ink-muted hover:bg-gray-50 hover:text-ink'}"
          >
            <span>{opt.label}</span>
            {#if value === opt.value}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            {/if}
          </button>
        {/each}
      </div>
    </div>
    
    <!-- Backdrop to close -->
    <button 
      tabindex="-1"
      class="fixed inset-0 z-40 cursor-default bg-transparent outline-none" 
      onclick={() => isOpen = false}
    ></button>
  {/if}
</div>
