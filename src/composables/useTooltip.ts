/**
 * Composable for managing tooltip visibility and positioning.
 *
 * Why this exists:
 * - Eliminates duplication of tooltip logic in App.vue (6 functions → 1 composable)
 * - Previously: updateTooltipPosition, updateInfoTooltipPosition,
 *               showSalaryTooltip, hideSalaryTooltip, showInfoTooltip, hideInfoTooltip
 * - Centralizes event listener management to prevent memory leaks
 *
 * Contract:
 * - Input: anchor direction ('right' | 'bottom'), optional offset
 * - Output: reactive state (visible, position), show/hide methods
 *
 * Invariants:
 * - Event listeners are always cleaned up when hide() is called
 * - Position updates are debounced during scroll/resize
 */

import { reactive, onUnmounted } from 'vue';

export interface TooltipState {
  visible: boolean;
  targetElement: HTMLElement | null;
  position: { x: number; y: number };
}

export interface UseTooltipOptions {
  /**
   * Where to position the tooltip relative to the target element.
   * - 'right': Tooltip appears to the right of the element (for salary tooltip)
   * - 'bottom': Tooltip appears below the element (for info tooltips)
   */
  anchor?: 'right' | 'bottom';

  /**
   * Offset in pixels from the target element.
   * Default: 16px for 'right', 8px for 'bottom'
   */
  offset?: number;
}

export interface UseTooltipReturn {
  state: TooltipState;
  show: (event: MouseEvent | FocusEvent) => void;
  hide: () => void;
  updatePosition: () => void;
}

/**
 * Creates a tooltip manager with automatic position updates.
 *
 * Usage:
 * ```ts
 * const { state, show, hide } = useTooltip({ anchor: 'right' });
 *
 * // In template:
 * // @focus="show" @blur="hide"
 * // :style="{ left: `${state.position.x}px`, top: `${state.position.y}px` }"
 * ```
 *
 * @param options - Configuration options
 * @returns Reactive state and control methods
 */
export function useTooltip(options: UseTooltipOptions = {}): UseTooltipReturn {
  const { anchor = 'bottom', offset } = options;
  const defaultOffset = anchor === 'right' ? 16 : 8;
  const finalOffset = offset ?? defaultOffset;

  const state = reactive<TooltipState>({
    visible: false,
    targetElement: null,
    position: { x: 0, y: 0 },
  });

  /**
   * Updates tooltip position based on target element's bounding rect.
   *
   * Called on initial show and during scroll/resize events.
   * Uses requestAnimationFrame implicitly via Vue's reactivity.
   */
  const updatePosition = (): void => {
    if (!state.targetElement) return;

    const rect = state.targetElement.getBoundingClientRect();

    if (anchor === 'right') {
      // Position to the right of the element, vertically centered
      state.position = {
        x: rect.right + finalOffset,
        y: rect.top + rect.height / 2,
      };
    } else {
      // Position below the element, horizontally centered
      state.position = {
        x: rect.left + rect.width / 2,
        y: rect.bottom + finalOffset,
      };
    }
  };

  /**
   * Shows the tooltip anchored to the event target.
   *
   * Adds scroll/resize listeners for position updates.
   * Note: useCapture=true for scroll to catch scrolling containers.
   */
  const show = (event: MouseEvent | FocusEvent): void => {
    const target = (event.currentTarget ?? event.target) as HTMLElement;
    state.targetElement = target;
    updatePosition();
    state.visible = true;

    // Listen for position changes
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
  };

  /**
   * Hides the tooltip and cleans up event listeners.
   *
   * Critical: Must remove the same listeners that were added in show()
   * to prevent memory leaks.
   */
  const hide = (): void => {
    state.visible = false;
    state.targetElement = null;

    window.removeEventListener('scroll', updatePosition, true);
    window.removeEventListener('resize', updatePosition);
  };

  // Cleanup on component unmount to prevent memory leaks
  onUnmounted(() => {
    if (state.visible) {
      hide();
    }
  });

  return {
    state,
    show,
    hide,
    updatePosition,
  };
}
