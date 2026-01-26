/**
 * useLearnMode.ts - Composable for managing learn mode state.
 *
 * Provides a toggle to activate/deactivate educational explanations
 * throughout the results panel.
 */

import { ref, readonly, type Ref, type DeepReadonly } from 'vue';

export interface UseLearnModeReturn {
  /** Whether learn mode is active (readonly) */
  isActive: DeepReadonly<Ref<boolean>>;
  /** Toggle learn mode on/off */
  toggle: () => void;
  /** Explicitly set learn mode state */
  setActive: (value: boolean) => void;
}

/**
 * Composable for managing learn mode state.
 *
 * @returns Object with isActive state and toggle function
 */
export function useLearnMode(): UseLearnModeReturn {
  const isActive = ref(false);

  const toggle = () => {
    isActive.value = !isActive.value;
  };

  const setActive = (value: boolean) => {
    isActive.value = value;
  };

  return {
    isActive: readonly(isActive),
    toggle,
    setActive,
  };
}
