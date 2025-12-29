<!--
  DetailsSection - Expandable card with icon header.

  Why this exists:
  - Eliminates 9 repetitions of the details/summary pattern in App.vue
  - Provides consistent styling for all collapsible sections
  - Encapsulates the expand/collapse icon rotation animation

  Contract:
  - Props: title, icon, iconColor, defaultOpen?
  - Slots: default (content), header-right (optional right side content)

  Usage:
  <DetailsSection
    title="Datos económicos"
    icon="account_balance"
    icon-color="indigo"
    :default-open="true"
  >
    <template #header-right>
      <span>€ 1,234.00</span>
    </template>

    <!-- Content goes here -->
  </DetailsSection>
-->

<script setup lang="ts">
/**
 * Available icon colors that match expense categories.
 * These must be in Tailwind's safelist to work with dynamic classes.
 */
type IconColor = 'blue' | 'orange' | 'yellow' | 'pink' | 'purple' | 'emerald' | 'gray' | 'indigo' | 'violet';

interface Props {
  /** Section title displayed in the header */
  title: string;
  /** Material Symbols icon name (e.g., 'directions_car') */
  icon: string;
  /** Color theme for the icon background and text */
  iconColor: IconColor;
  /** Whether the section starts expanded */
  defaultOpen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false,
});

/**
 * Generates the icon container classes based on the color prop.
 *
 * Note: These dynamic classes are included in tailwind.config.js safelist
 * to prevent them from being purged during production build.
 */
const iconContainerClass = `w-10 h-10 rounded-lg bg-${props.iconColor}-100 dark:bg-${props.iconColor}-900/30 text-${props.iconColor}-600 dark:text-${props.iconColor}-400 flex items-center justify-center`;
</script>

<template>
  <details
    class="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden"
    :open="defaultOpen"
  >
    <!--
      Summary header - always visible.
      Uses cursor-pointer for clickable indication.
      The group-open: prefix rotates the arrow when expanded.
    -->
    <summary
      class="flex items-center justify-between p-4 cursor-pointer bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors select-none"
    >
      <div class="flex items-center gap-3">
        <!-- Icon container with dynamic color -->
        <div :class="iconContainerClass">
          <span class="material-symbols-outlined">{{ icon }}</span>
        </div>

        <!-- Title -->
        <span class="font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-tight text-sm">
          {{ title }}
        </span>
      </div>

      <div class="flex items-center gap-3">
        <!--
          Optional right side content slot.
          Used to show totals or other summary info.
        -->
        <slot name="header-right" />

        <!--
          Expand/collapse indicator.
          Rotates 180deg when section is open via group-open: modifier.
        -->
        <span
          class="material-symbols-outlined text-stone-400 transition-transform duration-200 group-open:rotate-180"
        >
          expand_more
        </span>
      </div>
    </summary>

    <!--
      Content area - only visible when expanded.
      Border-top separates it from the header.
    -->
    <div class="p-5 border-t border-stone-100 dark:border-slate-700 flex flex-col gap-6 bg-white dark:bg-slate-800">
      <slot />
    </div>
  </details>
</template>
