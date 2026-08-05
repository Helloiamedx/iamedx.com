# Hero headline backup

Restore the previous FoldText + shine hero headline:

```bash
cp backups/HeroHeadline.fold-shine.tsx components/HeroHeadline.tsx
```

Related snapshots (unchanged by the rotate experiment, kept for safety):

- `FoldText.pre-rotate.tsx`
- `FoldText.pre-rotate.css`

## Keyword rotate — vertical slide (liked layout)

Restore the y-slide keyword swap (Approach follows width):

```bash
cp backups/HeroHeadline.slide-swap.tsx components/HeroHeadline.tsx
```


## Keyword rotate — DecryptedText

Current hero keywords use `components/DecryptedText.tsx`.

Previous letter-cascade version is not snapshotted; slide-swap restore:

```bash
cp backups/HeroHeadline.slide-swap.tsx components/HeroHeadline.tsx
```

