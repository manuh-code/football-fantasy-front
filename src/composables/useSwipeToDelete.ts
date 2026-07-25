import { computed, onBeforeUnmount, ref } from "vue";

// Horizontal swipe-to-reveal-delete for a single list row.
//
// Each row instance owns its own state, but a module-level registry lets
// starting a swipe on one row collapse any other row that is currently
// revealing its delete action — preserving the behavior that used to live in
// the lineup tables before the row markup was extracted into its own component.

const SWIPE_THRESHOLD = -60;
const SWIPE_ACTION_WIDTH = 76;

const closers = new Map<string, () => void>();

export function useSwipeToDelete(uuid: string) {
  const offsetX = ref(0);
  const swiping = ref(false);
  const open = ref(false);
  let startX = 0;
  let startY = 0;

  function close() {
    open.value = false;
    offsetX.value = 0;
  }

  closers.set(uuid, close);
  onBeforeUnmount(() => closers.delete(uuid));

  // Distance the row is translated: clamped while dragging, snapped otherwise.
  const swipeOffset = computed(() => {
    if (swiping.value) return Math.min(0, Math.max(-SWIPE_ACTION_WIDTH, offsetX.value));
    return open.value ? -SWIPE_ACTION_WIDTH : 0;
  });

  // No transition while actively dragging so the row tracks the finger 1:1.
  const swipeTransition = computed(() =>
    swiping.value ? "none" : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  );

  function onStart(e: TouchEvent | MouseEvent) {
    // Collapse every other row that is currently open.
    for (const [id, fn] of closers) {
      if (id !== uuid) fn();
    }
    const point = "touches" in e ? e.touches[0] : e;
    const wasOpen = open.value;
    startX = point.clientX + (wasOpen ? SWIPE_ACTION_WIDTH : 0);
    startY = point.clientY;
    offsetX.value = wasOpen ? -SWIPE_ACTION_WIDTH : 0;
    swiping.value = false;
    open.value = wasOpen;

    // Mouse: track globally so the drag survives leaving the row bounds.
    if (!("touches" in e)) {
      const onMouseMove = (ev: MouseEvent) => onMove(ev);
      const onMouseUp = () => {
        onEnd();
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  }

  function onMove(e: TouchEvent | MouseEvent) {
    const point = "touches" in e ? e.touches[0] : e;
    const deltaX = point.clientX - startX;
    const deltaY = Math.abs(point.clientY - startY);
    if (!swiping.value) {
      // Only commit to a horizontal swipe once it clearly beats vertical intent.
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > deltaY) {
        swiping.value = true;
      } else {
        return;
      }
    }
    if (!("touches" in e)) e.preventDefault();
    offsetX.value = Math.min(0, Math.max(-SWIPE_ACTION_WIDTH, deltaX));
  }

  function onEnd() {
    if (!swiping.value) {
      // A tap (not a drag) on an already-open row collapses it.
      if (open.value) close();
      return;
    }
    swiping.value = false;
    if (offsetX.value < SWIPE_THRESHOLD) {
      open.value = true;
      offsetX.value = -SWIPE_ACTION_WIDTH;
    } else {
      close();
    }
  }

  return { swipeOffset, swipeTransition, open, onStart, onMove, onEnd, close };
}
