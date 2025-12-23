<script setup lang="ts">
const resources = [
  {
    title: 'Comenzar a construir',
    description: 'Edita src/App.vue y añade tus componentes Vue para seguir calculando cómo impactan tus gastos e impuestos.',
  },
  {
    title: 'Estilos con Tailwind',
    description: 'Tailwind CSS ya está configurado. Usa las clases utilitarias o añade estilos propios en src/style.css.',
  },
  {
    title: 'Compatibilidad TypeScript',
    description: 'Vue 3 + TypeScript está listo con macros habilitadas. Ejecuta npm run typecheck para validar tus tipos.',
  },
];
</script>

<template>
  <div
    class="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display"
  >
    <main class="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <header class="space-y-4">
        <p class="text-sm uppercase tracking-[0.2em] text-primary font-semibold">
          Fiscal Ticket Panel
        </p>
        <h1 class="text-4xl sm:text-5xl font-bold leading-tight">
          Ahora con Vue 3 + TypeScript
        </h1>
        <p class="text-lg text-stone-600 dark:text-stone-300 max-w-2xl">
          El proyecto se ha migrado al stack oficial de Vite para Vue. Comienza a construir tu
          experiencia con los mismos estilos y configuraciones base listas para usar.
        </p>
        <div class="flex flex-wrap gap-3">
          <a
            class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            href="https://vite.dev/guide/"
            target="_blank"
            rel="noreferrer"
          >
            Guía de Vite
            <span class="material-symbols-outlined text-base">open_in_new</span>
          </a>
          <a
            class="inline-flex items-center gap-2 rounded-lg border border-stone-300/80 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-white/60 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-white/5"
            href="https://vuejs.org/guide/introduction.html"
            target="_blank"
            rel="noreferrer"
          >
            Docs de Vue
          </a>
        </div>
      </header>

      <section class="grid gap-6 sm:grid-cols-2">
        <article
          v-for="resource in resources"
          :key="resource.title"
          class="rounded-xl border border-stone-200 bg-white/90 p-6 shadow-ticket transition hover:-translate-y-1 hover:shadow-lg dark:border-stone-700 dark:bg-slate-900/70"
        >
          <h2 class="text-xl font-semibold text-stone-900 dark:text-white">
            {{ resource.title }}
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            {{ resource.description }}
          </p>
        </article>
      </section>

      <footer class="pt-4 text-sm text-stone-500 dark:text-stone-400">
        Monta tus componentes en <code class="font-mono text-primary">#app</code> dentro de
        <code class="font-mono text-primary">src/main.ts</code> y personaliza este esqueleto como
        necesites.
      </footer>
    </main>
  </div>
</template>
