// Makes Enter behave like Tab inside a container: moves focus to the next
// focusable field, and only triggers `onLast` (e.g. submit) from the final field.
export function focusNextOnEnter(e, containerRef, onLast) {
  if (e.key !== "Enter") return;
  e.preventDefault();

  const container = containerRef.current;
  if (!container) return;

  const focusable = Array.from(
    container.querySelectorAll("input, select, textarea, button")
  ).filter((el) => !el.disabled && el.tabIndex !== -1 && el.offsetParent !== null);

  const idx = focusable.indexOf(e.target);
  const next = focusable[idx + 1];
  if (next) {
    next.focus();
    if (next.tagName === "INPUT" || next.tagName === "TEXTAREA") next.select?.();
  } else if (onLast) {
    onLast();
  }
}
