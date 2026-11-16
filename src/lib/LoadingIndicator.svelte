<script lang="ts">
 let { label }: { label: string } = $props();
</script>
<p class="loading-indicator" role="status"><span class="spinner" aria-hidden="true"></span>{label}</p>
<style>
 .loading-indicator { display: flex; align-items: center; gap: .65rem; font-size: .9rem; color: var(--muted, #666); }
 .spinner { width: 1rem; height: 1rem; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin .8s linear infinite; flex-shrink: 0; }
 @keyframes spin { to { transform: rotate(360deg); } }
 @media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }
</style>
