<script lang="ts">
	import '../styles/app.scss';
	import '../styles/global.scss';
</script>

<svelte:head>
	<title>Sesquipedalian TypeTester</title>
</svelte:head>

<div class="layout">
	<nav>
		<h1>Sveltepedalian</h1>
	</nav>

	<main>
		<slot />
	</main>
</div>

<style lang="scss">
	h1 {
		font-family: 'loos-extended', sans-serif;
		font-size: 1.2rem;
		text-transform: uppercase;
		color: var(--fg-200);
		letter-spacing: 2px;
		animation: test 45s infinite;
	}
	@keyframes test {
		50% {
			letter-spacing: 20px;
		}
	}
	.layout {
		height: 100%;
		display: grid;
		grid-template-rows: auto 1fr;
		align-items: center;
		padding: 2rem;
	}
</style>
