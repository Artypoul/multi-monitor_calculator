<script lang="ts">
	import { AppContent } from '@smui/drawer';
	import TopAppBar, { Row, Section, Title as TopAppBarTitle } from '@smui/top-app-bar';
	import DarkModeToggle from '$lib/components/fields/DarkModeToggle.svelte';
</script>

<TopAppBar color="secondary" dense style="min-width:9.5rem;" variant="short">
	<Row>
		<Section align="start">
			<TopAppBarTitle>Смета ремонта</TopAppBarTitle>
		</Section>
		<Section align="end" toolbar>
			<a class="toolbar-link" href="/">Калькулятор</a>
			<a class="toolbar-link" href="/about">О проекте</a>
		</Section>
	</Row>
</TopAppBar>

<AppContent class="app-content">
	<header>
		<h1>Мини-калькулятор ремонта</h1>
		<h2>Клиент заполняет объект, получает предварительную смету и оставляет данные для замера</h2>
	</header>
	<span class="theme-toggle">
		<DarkModeToggle />
	</span>
	<slot />
</AppContent>

<style>
	header {
		padding-top: 3rem;
	}

	.theme-toggle {
		right: 0.5rem;
		top: 3.5rem;
		position: absolute;
	}

	:global(.app-content) {
		min-height: 120vh;
		position: relative;
	}

	:global(.toolbar-link) {
		color: white;
		text-decoration: none;
		margin: 0 0.75rem;
	}

	@media (max-width: 600px) {
		header {
			padding-top: 5rem;
		}

		.theme-toggle {
			position: static;
			display: flex;
			justify-content: center;
			margin-bottom: 1rem;
		}
	}
</style>
