# Codex Hook Game Design Guidelines

Source reviewed: https://view.genially.com/69f0f12f460e377c7c7bfc5b  
Review date: 2026-05-01  
Purpose: translate the Genially reference into practical design guidelines for HookTheHook without copying its exact artwork, layout, or wording.

## Screenshot Inventory

Captured reference screenshots:

- `output/playwright/genially_69f0f12f460e377c7c7bfc5b/page-01.png` - overview map with four character archetypes.
- `output/playwright/genially_69f0f12f460e377c7c7bfc5b/page-02.png` - achievement-focused character detail screen.
- `output/playwright/genially_69f0f12f460e377c7c7bfc5b/page-03.png` - competition-focused character detail screen.
- `output/playwright/genially_69f0f12f460e377c7c7bfc5b/page-04.png` - social-focused character detail screen.
- `output/playwright/genially_69f0f12f460e377c7c7bfc5b/page-05.png` - exploration-focused character detail screen.
- `output/playwright/genially_69f0f12f460e377c7c7bfc5b/page-06.png` through `page-13.png` - mostly leftover pirate template pages; use only as broad visual inspiration.
- `output/playwright/genially_69f0f12f460e377c7c7bfc5b/interactive-hotspots-page-01.png` - overview after toggling interactive element visibility.

## Core Takeaway

The strongest idea in the reference is not the pirate art by itself. It is the way the pirate-map wrapper turns four player motivations into navigable destinations. HookTheHook can use the same structural lesson:

- A central map/hub gives players a fast mental model.
- Each destination represents a player motivation, challenge type, or upgrade path.
- Detail screens explain the reward, risk, and play behavior behind that destination.
- Interaction is simple: choose a marked point, inspect, return to the map.

For HookTheHook, this should become a compact "captain's chart" design language rather than a full UI redesign.

## Visual Direction

Use a hand-drawn nautical style with readable game UI discipline:

- Background: parchment, sea chart, dock ledger, weathered paper, or lightly stained map texture.
- Frame: dark wood, rope, brass, ink, or worn metal accents.
- Path language: dashed routes, map pins, X marks, arrows, fog patches, sketched circles, and stamped icons.
- Character/object language: large readable silhouettes, held tools, treasure props, hooks, ropes, buoys, crates, and compass cues.
- Typography: use bold display type only for titles and archetype names; body text should stay clean and high-contrast.
- Panels: white or pale parchment cards with enough padding; avoid dense text blocks during gameplay.
- Motion: small bobs, map-pulse highlights, ink-draw path reveals, stamp impacts, and treasure-glint rewards.

Avoid copying the Genially screens directly. Treat them as a mood board for "interactive pirate map + character motivation cards."

## Player Motivation Model

Use the four Bartle-style archetypes as design lenses. HookTheHook does not need to label players explicitly, but each lens should be represented by mechanics.

### Achievement Lens

Player need: mastery, completion, visible progress.

Useful HookTheHook mechanics:

- Stage completion stars or medals.
- Hook accuracy rating.
- Time, combo, or no-miss objectives.
- Treasure room / collection book for unlocked items.
- Progress bars for area completion.
- Locked challenges that open after clean clears.

Design guideline:

- Always show what was completed, what remains, and what the next visible reward is.
- Let this player replay levels for cleaner outcomes, not only for survival.

Minimal first pass:

- Add a simple end-of-level result panel with `Clear`, `Time`, `Hooks Used`, and one medal.

Test after first pass:

- Complete one easy level and one messy level.
- Confirm the result panel makes the better run feel meaningfully different.

### Competition Lens

Player need: comparison, speed, dominance, pressure.

Useful HookTheHook mechanics:

- Level timer.
- Personal best.
- Ghost target or par time.
- Daily challenge seed.
- Local leaderboard before online/global leaderboard.
- Short head-to-head challenge format if multiplayer exists later.

Design guideline:

- Start with competition against the player's own best time before adding global rankings.
- Use rival language carefully; competition should raise intensity without making the game feel hostile.

Minimal first pass:

- Show `Best Time` and `Current Time` on a small level-select or result panel.

Test after first pass:

- Replay a level three times.
- Confirm the UI makes the faster run obvious without needing explanation.

### Social Lens

Player need: cooperation, sharing, helping, belonging.

Useful HookTheHook mechanics:

- Shareable level result card.
- Crew-themed assist system.
- Optional hints framed as advice from another sailor.
- Cooperative objectives if multiplayer or async features are added later.
- Positive reinforcement for helping or reviving another player.

Design guideline:

- Social systems should never be required for core progression.
- If HookTheHook remains single-player, express this lens through share cards, crew NPCs, and supportive feedback.

Minimal first pass:

- Add a result-card layout that could be screenshotted or shared later: level name, medal, time, hook count.

Test after first pass:

- Take a screenshot after a completed level.
- Check whether the result card communicates the achievement without extra context.

### Exploration Lens

Player need: discovery, secrets, optional depth.

Useful HookTheHook mechanics:

- Fogged map sections.
- Hidden treasure pickups.
- Optional side routes.
- Inspectable map hotspots.
- Secret hook angles or alternate exits.
- Lore scraps, bottle notes, or dock rumors.

Design guideline:

- Keep the main route clear while letting curious players find optional depth.
- Secrets should reward observation and experimentation, not random wall-checking.

Minimal first pass:

- Add one clearly hinted optional pickup or side route to a test level.

Test after first pass:

- Ask a tester to play without instructions.
- Confirm they notice the hint, even if they do not immediately solve it.

## Hub Screen Recommendation

Build a HookTheHook hub inspired by the overview map:

- Center: map route showing islands or docks.
- Four optional marked areas: mastery, speed, crew, discovery.
- Each marker gets one strong symbol: medal, crossed hooks, crew flag, spyglass.
- Hover/select state should pulse or stamp the marker.
- Selection opens a compact detail panel, not a separate dense page at first.
- Include a clear back/close action.

This can live in level select, chapter select, or a tutorial codex. It should not interrupt the main action loop.

## UI Rules

- Use large visual targets for clickable map points.
- Keep all text readable on parchment; avoid low-contrast gray body text.
- Do not put long paragraphs into live gameplay screens.
- Reserve black buttons for strong actions like back/close/confirm.
- Use icon-first labels where possible: medal, compass, hook, map, chest, flag.
- Keep decorative marks away from real clickable targets unless they are interactive.
- Make hover/selection states visually different from static X marks.
- On mobile or small windows, stack character/art above text rather than shrinking everything.

## HookTheHook Mechanic Mapping

Recommended mapping from reference concept to HookTheHook systems:

- Map X mark -> level node, secret node, or challenge node.
- Dashed route -> progression path between levels.
- Character card -> challenge type or player motivation panel.
- Treasure coin/crown -> medal, perfect clear, collectible.
- Sword/duel imagery -> timed challenge or rival run.
- Cooking/crew imagery -> assist, sharing, cooperative flavor.
- Spyglass -> hidden route, hint reveal, or optional lore.
- Fog/blank map area -> locked or undiscovered content.

## Implementation Plan By Pass

Pass 1: visual reference only

- Add no new systems.
- Pick one existing menu or review screen where a parchment/map treatment can be mocked up.
- Test whether the palette, frame, and icon language fit HookTheHook.

Pass 2: achievement feedback

- Add a basic result panel with medal/time/hook-count feedback.
- Test repeated runs to confirm the player can see improvement.

Pass 3: map-node interaction

- Add a small route map for a limited set of levels.
- Each node needs idle, hover/focus, selected, locked, and completed states.
- Test mouse and controller/keyboard navigation.

Pass 4: optional discovery

- Add one secret or optional objective.
- Test whether players notice the affordance without tutorial text.

Pass 5: social/share polish

- Design a shareable result-card composition.
- Do this after result data is stable.

## What Not To Carry Over

- Do not keep Genially's bottom promotional banner, tooltip style, or navigation chrome.
- Do not use the leftover template pages as content direction.
- Do not overfill screens with explanatory text.
- Do not use black X marks for both decoration and interaction unless the selected state is unmistakable.
- Do not make every player type a separate permanent mode before testing whether the result loop and level-select loop support them.

## Acceptance Checks

Use these checks after each implementation pass:

- The player can understand the screen goal within 3 seconds.
- The next actionable target is visually obvious.
- The pirate/map theme supports the mechanic rather than covering it.
- Achievement, speed, social, and exploration motivations each have at least one clear affordance somewhere in the game.
- A player can return from any detail view to the previous screen without confusion.
- Decorative map marks are not mistaken for controls.
- Text remains readable at the smallest supported game window size.

