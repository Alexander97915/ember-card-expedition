# Skill pruning

Retire five overlapping utility skills from every live class pool and the codex.

| Removed | Existing save replacement |
| --- | --- |
| 魔力屏障 | 岩石護甲 |
| 岩石表皮 | 岩壁 |
| 黎明祈願 | 救贖聖印 |
| 虔誠祝福 | 聖光灌注 |
| 鋼鐵專注 | 格劍反擊 |

New rewards and shops use the reduced pool. Migration runs before save validation and preserves owned-card multiplicity, battle piles, event choices and shop keys. Existing active buffs expire normally. Six classes still start with three cards each.

Validation: run `node /absolute/path/development/skill-pruning/skill-pruning.test.cjs` from an assembled site parent containing `dist/`. The test embeds its DOM and clock harness and verifies registration, pools, codices, gear/build links, starters, old battle-save reload, events, shops, duplicate counts and idempotence.
