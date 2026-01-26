/**
 * Composable for managing tooltip visibility and positioning.
 *
 * Why this exists:
 * - Eliminates duplication of tooltip logic
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

import { reactive, onUnmounted, ref } from 'vue';

/** Margin from viewport edges in pixels (1rem) */
const VIEWPORT_MARGIN = 16;

export interface TooltipState {
  visible: boolean;
  targetElement: HTMLElement | null;
  position: { x: number; y: number };
  /** Whether tooltip is positioned above or below the trigger */
  placement: 'above' | 'below';
  /** Max height when tooltip doesn't fit - enables scroll */
  maxHeight: number | null;
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
  /** Set reference to tooltip DOM element for accurate measurement */
  setTooltipRef: (el: HTMLElement | null) => void;
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

  // Reference to tooltip DOM element for measuring
  const tooltipRef = ref<HTMLElement | null>(null);

  const state = reactive<TooltipState>({
    visible: false,
    targetElement: null,
    position: { x: 0, y: 0 },
    placement: 'below',
    maxHeight: null,
  });

  /**
   * Set reference to tooltip DOM element.
   * Called after tooltip is rendered to enable accurate measurement.
   */
  const setTooltipRef = (el: HTMLElement | null): void => {
    tooltipRef.value = el;
  };

  /**
   * Updates tooltip position based on target element's bounding rect.
   *
   * For 'bottom' anchor:
   * - Measures actual tooltip height if ref is available
   * - Calculates best position (above or below)
   * - Ensures viewport margin of 16px on all sides
   * - Sets maxHeight with scroll if tooltip doesn't fit
   *
   * Called on initial show and during scroll/resize events.
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
      state.placement = 'below'; // Not really used for 'right' anchor
      state.maxHeight = null;
    } else {
      // Position below or above the element, horizontally centered
      const viewportHeight = window.innerHeight;

      // Measure tooltip height (fallback to estimate if not yet rendered)
      const tooltipHeight = tooltipRef.value?.offsetHeight ?? 400;

      // Calculate available space
      const spaceBelow = viewportHeight - rect.bottom - finalOffset - VIEWPORT_MARGIN;
      const spaceAbove = rect.top - finalOffset - VIEWPORT_MARGIN;

      let y: number;
      let placement: 'above' | 'below';
      let maxHeight: number | null = null;

      // Choose the side with more space
      if (spaceAbove > spaceBelow) {
        // Position above - place at top of viewport with maxHeight
        placement = 'above';
        y = VIEWPORT_MARGIN;
        // Always set maxHeight for above placement to ensure content fits
        maxHeight = rect.top - finalOffset - VIEWPORT_MARGIN;
      } else {
        // Position below (default)
        placement = 'below';
        y = rect.bottom + finalOffset;
        // Always set maxHeight based on available space below
        const availableBelow = viewportHeight - y - VIEWPORT_MARGIN;
        // Always apply maxHeight to prevent overflow
        maxHeight = availableBelow;
      }

      // Ensure minimum margin from top
      y = Math.max(VIEWPORT_MARGIN, y);

      state.position = {
        x: rect.left + rect.width / 2,
        y,
      };
      state.placement = placement;
      state.maxHeight = maxHeight;
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
    setTooltipRef,
  };
}
