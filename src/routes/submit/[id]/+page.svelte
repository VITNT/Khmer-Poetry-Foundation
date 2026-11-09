<script lang="ts">
 import PoemEditor from '$lib/PoemEditor.svelte';
 let { data, form } = $props();
</script>
<PoemEditor poem={data.poem} {form} />
