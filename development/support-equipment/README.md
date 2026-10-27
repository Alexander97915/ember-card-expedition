# Retired support skills become equipment

- 岩膚聖鎧: legendary mage armor, armor +4 / maximum HP +20. Mage and Titan take 50% less incoming damage, upgraded from 40%; dodge remains available. Ordinary attacks do not interrupt chanting, hard control still does. Legacy stone skin takes the stronger effect rather than multiplying.
- 虔誠聖印: rare priest charm, maximum HP +8. Living equipped priest provides party basic-attack speed +20%, including self; stops on death/unequip and resumes on revival. Does not stack with old priest haste. Ranger heavy-bow mode converts the bonus into attack as usual.
- 鋼心護符: rare swordswoman charm, maximum HP +8. Each charge/earthshatter starts with a 25%-maximum-HP temporary shield; release/interruption/death removes only the remaining temporary portion. Does not double with legacy focus.

All three enter ordinary equipment pools, codex and training. Skills stay retired. New expeditions receive no free gear. An existing expedition is compensated once per matching active-party class because previous versions already replaced original card IDs; equipped gear is preserved and new items go to the bag. Save the revision flag for idempotence. Existing artwork is reused.

Run `support-equipment.test.cjs` from an assembled site parent containing `dist/`. Its embedded harness covers live registration, pools, training, rendering, compensation/reload idempotence, actual mage/Titan damage, dodge, ordinary-damage/hard-control casting, party haste/death/revival/nonstack and heavy-bow conversion, charge shields and cleanup, plus save persistence. Soul-axe and previous pruning suites also pass.
