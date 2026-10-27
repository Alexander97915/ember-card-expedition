# P1 combat fixes

Selena now uses 60 logical units of melee reach, matching the warrior rather than the 290-unit fallback. Her five-second charge stops movement and excludes her from the basic-attack ready queue so she cannot repeatedly take the first slot without executing an attack. Frozen enemies are excluded from ready attacks until freeze expires, as stunned enemies already were.

No sprite transforms, character sizes, card damage, costs or durations change. Existing saved positions remain valid; melee heroes approach their targets on the next active tick.

Run against the hydrated release plus overlays:

```
EMBER_TEST_DIST=site node development/p1-combat/p1.test.cjs
EMBER_TEST_DIST=site node development/p0-save-recovery/p0.test.cjs
```

The Pages workflow runs both suites before publication.
