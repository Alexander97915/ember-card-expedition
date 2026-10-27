# P0: priest startup and protected save recovery

The approved priest run frames keep the existing 54.34 logical head size, transforms, assets and anchors. Only `sampling` changes to the contract-required `nearest`; existing priest CSS continues to control rendered filtering. Full HTML script-order tests verify registration finishes and all six heroes render/load.

`save-recovery.js` loads before `game.js`. Save writes are blocked during initialization and whenever recovery is pending. Invalid JSON, invalid migrated saves, hydration errors and storage-read failures enter a recovery screen instead of writing a new expedition over the original. The tutorial cannot obscure that screen.

Successful writes checkpoint the prior valid save at most every 30 seconds or on phase/floor changes, retaining three valid snapshots. Backup writes happen before primary replacement. A quota/backup failure retains the primary and displays the existing save warning. Normal saves and training remain separate.

Recovery is explicit: try the newest valid backups, then legacy v2. Before any recovered primary is written, preserve the exact original v3/v2 strings under `ember-v3-recovery-source`. An archive-write failure blocks recovery. Recovered battles are paused. Starting fresh from the recovery screen also requires successful original preservation and a confirmation screen. No import/export or migration UI is restored.

Run against a hydrated release plus current overlays:

```sh
EMBER_TEST_DIST=site node development/p0-save-recovery/p0.test.cjs
```

The Pages workflow runs this same suite after file verification and before publication. Tests use isolated in-memory storage; no live player save is edited. They cover fresh/normal/battle/legacy loads, all six heroes, priest action registration, corrupt/invalid saves, hydration failure, pagehide, three checkpoints, backup selection, original preservation, quota/read failures, training isolation and recovery failure.
