<!--
  CurrencyInput - Input field with € prefix for monetary values.

  Why this exists:
  - Eliminates 8+ repetitions of the input-with-prefix pattern in App.vue
  - Provides consistent styling and behavior for all currency inputs
  - Encapsulates the € prefix positioning logic

  Contract:
  - Props: modelValue (number), placeholder?, disabled?, min?
  - Emits: update:modelValue, focus, blur
  - Supports v-model out of the box

  Usage:
  <CurrencyInput
    v-model="expense.amount"
    placeholder="0.00"
    @focus="onFocus"
  />
-->

<script setup lang="ts">
/**
 * Props definition with sensible defaults.
 *
 * Note: We use `number` type for modelValue because this is a
 * numeric input. Vue's v-model.number modifier handles the conversion.
 */
interface Props {
  modelValue: number;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  /** Additional classes to apply to the input */
  inputClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
  min: 0,
  inputClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  input: [event: Event];
}>();

/**
 * Handles the native input event.
 *
 * Converts the string value to a number and emits it.
 * This allows us to maintain v-model compatibility while
 * also providing the raw input event if needed.
 */
const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const value = target.value === '' ? 0 : Number(target.value);
  emit('update:modelValue', value);
  emit('input', event);
};

const handleFocus = (event: FocusEvent): void => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent): void => {
  emit('blur', event);
};
</script>

<template>
  <div class="relative">
    <!--
      Currency prefix (€).
      Positioned absolutely within the relative container.
      Uses same vertical centering pattern as the original.
    -->
    <span
      class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono pointer-events-none"
    >
      €
    </span>

    <!--
      The actual input element.
      Left padding (pl-8) accounts for the € prefix.
      All styling matches the original pattern from App.vue.
    -->
    <input
      type="number"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :min="min"
      :max="max"
      class="w-full pl-8 pr-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-stone-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      :class="inputClass"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </div>
</template>
