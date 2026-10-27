# Soulweapon becomes equipment

噬魂戰斧 is an epic warrior weapon with +3 attack per hit, 10% basic-attack lifesteal, and the existing participation-based soul collection (damage within 5 seconds, +1 expedition attack, maximum +10 per encounter; excludes summons and training dummies). Equip to gain and apply souls; unequipping suspends the bonus without deleting accumulated souls.

The skill is removed from all card pools and codices. Existing owners receive one axe in their bag, preserving currently equipped gear. Skill copies become 破甲重斬 with counts preserved. Migration runs before validation and is idempotent. Existing accumulated soul attack is retained. New runs acquire the weapon via ordinary equipment drops/shops; it is also available in training. Existing artwork is reused.

Validation: run the self-contained `soulweapon-equipment.test.cjs` from the assembled site parent containing `dist/`. Covers pools, equipment rendering, training, old battle-save reload, duplicate ownership, migration idempotence, soul cap/exclusions, equip/unequip, lifesteal and persistence across encounters/reload.
