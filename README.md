# Sisyphus' Cinema World V1

Canvas-based vertical climbing prototype. It is mobile portrait first and runs as a static site with no external assets or install step.

## Run locally

```bash
cd /workspace/project
python3 -m http.server 4173 --bind 0.0.0.0
```

Open `http://127.0.0.1:4173/`.

## Main files

- `index.html`: canvas shell and minimal death/replay overlays.
- `src/main.js`: scene state machine, game loop, fall/death/lonely/ending flow.
- `src/config.js`: tuning values for route height, fire probability, physics, colors, wake radius.
- `src/platform.js`: platform generation and the four V1 object types: TV, newspaper, film, frame.
- `src/fire.js`: following, dimming, contact behavior.
- `src/player.js`: pixel child movement, double jump, ledge grab, climb.
- `src/audio.js`: Web Audio ambient layer and object wake blips.
- `src/ending.js`: dark fall and CRT glitch stopped frame.
- `src/save.js`: localStorage unlock for “不要它”.

## Common tuning points

- Platform density/generation: `CONFIG.platformGapMin`, `CONFIG.platformGapMax` in `src/config.js`; object weights are in `PlatformManager.generateTo()` in `src/platform.js`.
- Fire probability: `CONFIG.fireKillChance` in `src/config.js`.
- Route height and ending trigger: `CONFIG.worldEndY` in `src/config.js`.
- Fire wake radius/contact radius: `CONFIG.fireWakeRadius`, `CONFIG.fireContactRadius` in `src/config.js`.
- Ending visuals: `src/ending.js`, especially `drawStopped()` and `drawCrt()`.
