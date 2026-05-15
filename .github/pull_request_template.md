## Summary

<!-- 1-3 bullets: what changed and why. -->

-

## Changes

<!-- Optional: list of specific files / areas touched. -->

-

## Test plan

<!--
Markdown checklist of what you ran (checked) and what the reviewer
should verify (unchecked). Pick the relevant subset for your change type;
delete the rest.
-->

### Site / copy changes

- [ ] `pnpm dev` runs locally; affected route(s) render correctly
- [ ] `pnpm build` passes
- [ ] `pnpm typecheck` clean
- [ ] Mobile viewport checked (Cmd-Shift-M in browser devtools)

### Validator changes

- [ ] Tested with a passing `.ulc.json` record
- [ ] Tested with a failing `.ulc.json` (schema-violation error surfaces correctly)
- [ ] If hash verification touched: tested with matching + mismatching source files

### Spec-render / content-sync changes

- [ ] Build pulls latest spec content from `ulcspec/ULC` successfully
- [ ] Schema drift surface (if any) renders correctly

## Related

<!-- "Closes #N" auto-closes the linked issue on merge. Or "None". -->

Closes #
