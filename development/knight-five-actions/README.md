# Alicia: five skill actions

Adds dedicated on-foot actions for 神聖鎖鏈, 天罰蓄勢, 鮮血聖契, 貫星聖槍 and 救贖聖印 using the current crown/loose hair/lion-pauldron/white-fur/dark-armor design. The last action uses the approved hand-held shield cast.

Twenty source-resolution RGBA cels are admitted with reviewed feet/eye landmarks and fixed source density per authored sheet. The chain counter uses a separately padded source to preserve the full cape. Beige preview backing and ambient background haze are excluded through source alpha; only emitted skill effects remain. `registration.json` records source and delivery hashes.

The adapter changes presentation only. It uses the existing pause-aware visual clock, displays exactly one cel, and resets on battle change/death/control. Actual card resolution, chain transfer, retribution stack/release, blood-pact basic follow-up and redemption rescue drive their respective actions. The large redemption barrier appears only after the original lethal-protection handler triggers; ordinary casting uses the small sigil. Mounted and angel forms retain their established bodies and get matching color feedback.

Validation: `knight-five-actions.test.cjs` from an assembled site parent containing `dist/`. Covers all five casts, real chain transfer, retribution block/release, pact follow-up, lethal protection, busy-card animation, user pause, mounted/angel fallback, reset/death, asset registration and serialized-state invariance. A/B replay with the adapter excluded produces identical state and combat messages. All 20 cels passed alpha/ground-anchor checks. Desktop browser review confirmed 20/20 poses display one visible cel with transparent backgrounds; approved held-shield rescue pose is used.

Source extraction: `register.py` expects the named original generated sheets under the sibling `generated_images` directory. It performs mechanical sprite slicing and registration; images are never reduced in resolution.
