# Operational Flow and Agent Orchestration: Web Games (HTML/CSS/JS)

## 1. Purpose and Scope
This document defines the operational protocol for orchestrating AI agents responsible for the complete development cycle of web-based video games using **HTML5 Canvas/WebGL**, **CSS** for UI/HUD, and **vanilla JavaScript or lightweight libraries** (Phaser, PixiJS, Three.js, Matter.js). It covers everything from mechanics design to deployment and testing of fully functional browser-based games.

---

## 2. Agent Structure by Subfolder

```
/agentes_juegos_html_css_js/
├── FLUJO_OPERATIVO.md                              # This file
├── diseno_juego/
│   ├── game-designer-web.md                        # Mechanics design, loops, GDD for web games
│   ├── level-designer-web.md                       # Level design, tile maps, spatial flow
│   └── narrative-designer-web.md                   # Interactive narrative, dialogues, branching stories
├── motor_y_renderizado/
│   ├── canvas-engine-developer.md                  # Canvas 2D API, game loop, sprite rendering, camera
│   ├── webgl-3d-developer.md                       # WebGL/Three.js, GLSL shaders, 3D browser scenes
│   └── pixel-art-animator.md                       # Spritesheets, frame-by-frame animations, texture atlas
├── sistemas_de_juego/
│   ├── physics-engine-developer.md                 # 2D/3D Physics: collisions, gravity, Matter.js/custom
│   ├── audio-web-engineer.md                       # Web Audio API, adaptive music, SFX, spatial audio
│   ├── input-system-developer.md                   # Keyboard, mouse, touch, gamepad API, mobile controls
│   └── multiplayer-web-developer.md                # WebSockets, WebRTC, shared state, browser netcode
├── ui_y_hud/
│   ├── game-ui-developer.md                        # HUD, menus, inventory, dialogues with HTML/CSS overlay
│   └── responsive-game-designer.md                 # Multi-screen adaptation, mobile-first gaming
└── pruebas_y_despliegue/
    ├── game-tester-web.md                          # Functional testing, balance, performance profiling
    ├── performance-optimizer-web.md                 # FPS, memory leaks, requestAnimationFrame, asset loading
    └── deployment-packager.md                       # PWA gaming, build tools, hosting, web monetization
```

---

## 3. Mapping Existing Agents → Web Adaptation

| Existing Agent (`game-development/`) | Web Adaptation | Key Change |
|--------------------------------------|---------------|------------|
| `game-designer.md` | `game-designer-web.md` | GDD oriented to browser constraints (60fps, touch, short sessions) |
| `level-designer.md` | `level-designer-web.md` | Tile-based design, Tiled JSON, JS procedural generation |
| `narrative-designer.md` | `narrative-designer-web.md` | Ink.js/Twine, HTML dialogues, browser visual novels |
| `game-audio-engineer.md` | `audio-web-engineer.md` | Web Audio API instead of FMOD/Wwise |
| `technical-artist.md` | `pixel-art-animator.md` | Spritesheets and CSS animations vs. engine shaders |
| *(new)* | `canvas-engine-developer.md` | No equivalent — core 2D web rendering |
| *(new)* | `webgl-3d-developer.md` | No equivalent — Three.js/WebGL for browser 3D |
| *(new)* | `physics-engine-developer.md` | No equivalent — Matter.js / custom physics |
| *(new)* | `input-system-developer.md` | No equivalent — Gamepad API, touch events |
| *(new)* | `multiplayer-web-developer.md` | Replaces engine Netcode → WebSockets/WebRTC |
| *(new)* | `game-ui-developer.md` | HUD/menus with HTML/CSS overlay over canvas |
| *(new)* | `responsive-game-designer.md` | Viewport adaptation, DPR, mobile gaming |
| *(new)* | `game-tester-web.md` | Browser-native testing |
| *(new)* | `performance-optimizer-web.md` | JS profiling, memory, rendering pipeline |
| *(new)* | `deployment-packager.md` | PWA, itch.io, Netlify, web monetization |

---

## 4. Orchestration via Boards (Context Isolation)

### Board Structure for Web Games

1. **`01. Concept / Sanitized GDD`**:
   * Game Design Document, level wireframes, reference concept art.
   * **Rule:** No API keys, service tokens, or restrictively licensed assets.
2. **`02. Assigned to Agent [Read-Only]`**:
   * Direct reference to the corresponding `.md` agent (e.g. `motor_y_renderizado/canvas-engine-developer.md`).
   * Attach only the JS modules, sprites, or CSS files subject to change.
3. **`03. Code Proposal (Diff / Module / Component)`**:
   * The agent returns proposals as ES6 modules, JS classes, or partial CSS/HTML files.
4. **`04. Browser Testing`**:
   * Human execution in Chrome DevTools / Firefox / Safari with active profiling.
5. **`05. Approval and Manual Commit`**:
   * Integration confirmed by the developer after visual and performance validation.

### Context Isolation Rules:
* **One agent per task.** Do not mix rendering context with input logic or audio.
* **Assets referenced by name.** Never include inline Base64 or absolute URLs in prompts.
* **Maximum scope per invocation:** 1 game system or 1 level/scene at a time.

---

## 5. Web Game Development Pipeline

```
[ PHASE 1: Design ]
  game-designer-web.md ──────► GDD + Core Loop + Economy Doc
  level-designer-web.md ─────► Maps / Layouts / Tile Specs
  narrative-designer-web.md ──► Script + Branching + Dialogue Trees
         │
[ PHASE 2: Engine & Rendering ]
  canvas-engine-developer.md ──► Game Loop + Renderer + Camera System
  webgl-3d-developer.md ────────► 3D Scene + Shaders + Lighting (if applicable)
  pixel-art-animator.md ────────► Spritesheets + Animation State Machine
         │
[ PHASE 3: Systems ]
  physics-engine-developer.md ──► Collisions + Physics + Raycasting
  audio-web-engineer.md ────────► SFX + Music + Adaptive Audio
  input-system-developer.md ────► Controls + Gamepad + Touch
  multiplayer-web-developer.md ──► Networking + State Sync (if applicable)
         │
[ PHASE 4: UI/HUD ]
  game-ui-developer.md ─────────► Menus + HUD + Inventory + Dialogues
  responsive-game-designer.md ──► Viewport Adapt + DPR + Mobile Layout
         │
[ PHASE 5: QA & Deployment ]
  game-tester-web.md ───────────► Functional Tests + Balance + Bugs
  performance-optimizer-web.md ──► FPS Profiling + Memory + Asset Loading
  deployment-packager.md ────────► PWA + Build + Hosting + Monetization
         │
[ FINAL STEP: Human Validation ]
  Manual testing on devices ► Signed commit ► Deploy
```

---

## 6. IDE Invocation Protocol and Human Control

```
[ STEP 1: Invocation ] ──────► Load Agent Prompt (.md) + Module/System Scope
                                      │
[ STEP 2: Generation ] ──────► Generate Artifact (JS module, CSS, partial HTML)
                                      │
[ STEP 3: Validation ] ──────► Browser testing: DevTools, FPS counter, mobile emulator
                                      │
[ STEP 4: Application ] ─────► Human applies changes and performs signed commit
```

### Immutable Security Rules:
1. **Zero Auto-Commits:** Agents have no write access to Git or hosting services.
2. **Module Auditing:** Every suggested JS module must be reviewed in DevTools before integration.
3. **Human Signature Required:** Every commit must be manually signed by the operator (`git commit -s`).
4. **No Hidden Dependencies:** Every external library (Phaser, Three.js, etc.) must be explicitly declared and approved before use.

---

## 7. Reference Technology Stack

| Layer | Primary Technology | Alternatives |
|-------|-------------------|-------------|
| 2D Rendering | Canvas 2D API | Phaser 3, PixiJS |
| 3D Rendering | Three.js + WebGL | Babylon.js, PlayCanvas |
| Physics | Matter.js | Planck.js, custom AABB |
| Audio | Web Audio API | Howler.js, Tone.js |
| Input | Gamepad API + Events | Hammer.js (touch) |
| Networking | WebSocket + WebRTC | Socket.io, Colyseus |
| UI/HUD | HTML/CSS overlay | DOM manipulation |
| Build | Vite / esbuild | Webpack, Rollup |
| Deploy | Netlify / Vercel / itch.io | GitHub Pages, PWA |
