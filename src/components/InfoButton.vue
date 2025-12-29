<!--
  InfoButton - Clickable info icon for triggering tooltips.

  Why this exists:
  - Eliminates 6+ repetitions of the info icon pattern in App.vue
  - Provides consistent styling and hover behavior
  - Standardizes the click event interface for tooltip triggers

  Contract:
  - Emits: click (with MouseEvent for tooltip positioning)

  Usage:
  <InfoButton @click="showInfoTooltip('costeEmpresa', $event)" />
-->

<script setup lang="ts">
const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent): void => {
  emit('click', event);
};
</script>

<template>
  <!--
    Info icon using Material Symbols.
    Small size (16px via style) to fit inline with text.
    Hover effect transitions to primary color.
  -->
  <span
    class="material-symbols-outlined text-sm cursor-pointer text-stone-400 hover:text-primary transition-colors"
    style="font-size: 16px"
    @click="handleClick"
  >
    info
  </span>
</template>
