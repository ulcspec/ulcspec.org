// Binds a "copy" button to a text source. Falls back to selecting the source
// text when the Clipboard API is unavailable (older Safari, insecure context).
//
// Status element is optional but recommended: the function writes a polite
// announcement to it via `aria-live="polite"` for screen readers, and clears
// the message after `revertMs`.
//
// DOM contract (required by every consumer of this helper):
//   - The button element identified by `buttonId` MUST contain two child
//     elements with `data-copy-default` and `data-copy-done` attributes,
//     wrapping the default and "Copied" label text respectively. The helper
//     toggles their `.hidden` class to flip the label.
//   - The source element identified by `sourceId` is the element whose
//     `textContent` gets copied.
//   - The optional status element identified by `statusId` should be wrapped
//     in `role="status" aria-live="polite"` so screen readers announce.
//
// Bindings live until the page unloads. The helper is idempotent on a given
// button (a second call with the same button is a no-op) so safe to re-run
// after View Transitions or other script re-execution.

export interface BindCopyButtonOptions {
  buttonId: string;
  sourceId: string;
  statusId?: string;
  revertMs?: number;
  selectFallbackText?: string;
  copiedAnnouncement?: string;
}

const bound = new WeakSet<HTMLElement>();

export function bindCopyButton(options: BindCopyButtonOptions): void {
  const {
    buttonId,
    sourceId,
    statusId,
    revertMs = 2400,
    selectFallbackText = 'Prompt selected. Press Cmd+C / Ctrl+C to copy.',
    copiedAnnouncement = 'Copied to clipboard',
  } = options;

  const btn = document.getElementById(buttonId);
  const source = document.getElementById(sourceId);
  if (!btn || !source) return;
  if (bound.has(btn)) return;
  bound.add(btn);

  const status = statusId ? document.getElementById(statusId) : null;
  const defaultLabel = btn.querySelector<HTMLElement>('[data-copy-default]');
  const doneLabel = btn.querySelector<HTMLElement>('[data-copy-done]');
  const hasClipboard =
    typeof navigator !== 'undefined' && !!navigator.clipboard;

  if (!hasClipboard && defaultLabel) {
    // The button stays useful: it now selects the source so the user can
    // hand-copy with Cmd/Ctrl+C. Label flips so the affordance is honest.
    defaultLabel.textContent = 'Select text';
  }

  let revertTimer: number | null = null;

  btn.addEventListener('click', async () => {
    const text = source.textContent ?? '';
    if (!hasClipboard) {
      const range = document.createRange();
      range.selectNodeContents(source);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      source.focus();
      if (status) status.textContent = selectFallbackText;
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      if (defaultLabel) defaultLabel.classList.add('hidden');
      if (doneLabel) doneLabel.classList.remove('hidden');
      if (status) status.textContent = copiedAnnouncement;
      if (revertTimer !== null) window.clearTimeout(revertTimer);
      revertTimer = window.setTimeout(() => {
        if (defaultLabel) defaultLabel.classList.remove('hidden');
        if (doneLabel) doneLabel.classList.add('hidden');
        if (status) status.textContent = '';
        revertTimer = null;
      }, revertMs);
    } catch {
      if (status) status.textContent = 'Copy failed, select the text manually';
    }
  });
}

// Binds all copy cards matching `selector` (e.g. `[data-prompt-card]`). Each
// card MUST expose `data-button-id`, `data-source-id`, and (optionally)
// `data-status-id` attributes on the wrapper element. The per-instance options
// override the helper defaults.
//
// Used by PromptBlock + QuoteCopyBlock so each new copy-able primitive does
// not duplicate the binding loop.
export function bindAllCopyCards(
  selector: string,
  overrides: Pick<
    BindCopyButtonOptions,
    'copiedAnnouncement' | 'selectFallbackText' | 'revertMs'
  > = {}
): void {
  for (const card of document.querySelectorAll<HTMLElement>(selector)) {
    const { buttonId, sourceId, statusId } = card.dataset;
    if (!buttonId || !sourceId) continue;
    bindCopyButton({ buttonId, sourceId, statusId, ...overrides });
  }
}
