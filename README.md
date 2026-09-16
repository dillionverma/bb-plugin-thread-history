# bb-plugin-thread-history

`Mod+[` and `Mod+]` move back and forward through the threads you opened in
the current BB window, like browser history. `Mod` is Command on macOS and
Control elsewhere. The same actions are listed in the quick palette as
"Back to previous thread" and "Forward to next thread".

- History is per window and survives a reload.
- Opening a different thread after going back discards the forward entries.
- The last 50 threads are kept.

## Install

```
bb plugin install .
```

If BB's own previous/next-thread commands were overridden to `Mod+[` /
`Mod+]`, reset them so the two do not both fire:

```
bb settings keyboard reset thread.previous
bb settings keyboard reset thread.next
```

## Develop

```
npm install
npm test
npm run typecheck
bb plugin build
bb plugin reload thread-history
```

- `app.tsx` — an app overlay records the thread in view and captures BB's
  navigation; a content script binds the keys; two palette actions expose
  the same moves.
- `lib/history.ts` — the pure history model and the per-window store.
- `lib/shortcut.ts` — key matching for both platforms.
- `server.ts` — required by the manifest, registers nothing.
