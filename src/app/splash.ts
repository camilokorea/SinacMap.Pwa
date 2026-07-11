/**
 * Fades out and removes the startup splash screen that is inlined in
 * `index.html`. Safe to call multiple times — it no-ops once the splash
 * element has already been removed from the DOM.
 */
export function hideSplash(): void {
  const splash = document.getElementById('app-splash');
  if (!splash) {
    return;
  }

  splash.classList.add('app-splash--hidden');

  const remove = () => splash.remove();
  splash.addEventListener('transitionend', remove, { once: true });
  // Fallback in case the transitionend event never fires (e.g. reduced motion
  // or the element is not visible), so the splash can never get stuck on top.
  setTimeout(remove, 600);
}
