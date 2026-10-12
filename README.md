# TI Datamath — Interactive 3D Calculator

## 🌐 Open the website

**[Launch Datamath in your browser](https://wonka15.github.io/Texas-Instrument-DataMath/)** — no installation needed.

Works on desktop and mobile. Camera features require HTTPS and permission; tracked AR requires a compatible Android WebXR browser, while iPhone/iPad use a camera-preview fallback.

A browser-based, Three.js tribute to the 1970s Texas Instruments Datamath calculator. This first working version includes a walnut-toned studio scene, procedural 3D calculator geometry, interactive keys, a red LED-style display, generated key clicks, and a simulated battery bay.

## Working checkpoint

The known-good working state from 12 October 2026 is preserved on the
[state-a-working branch](https://github.com/Wonka15/Texas-Instrument-DataMath/tree/state-a-working).
Continue polishing on main; use that branch as the reference point if a later
change needs to be compared or rolled back.

## Beginner code map

- index.html contains the page structure, accessible controls, reference-photo cards, and a small 2D-calculator fallback.
- style.css controls layout, colors, responsive behavior, and visual effects. Some later polish rules intentionally override earlier base rules; change the final matching rule carefully to preserve the established appearance.
- app.js builds the Three.js model, wires controls, updates the display, and handles audio, AR, and VR. Section comments mark the main systems.
- The fallback calculator in index.html duplicates a small amount of arithmetic logic on purpose: it keeps the keypad usable if the external 3D module cannot load.

## Reference-photo troubleshooting

The reference cards load photos from Wikimedia Commons using its file redirect, while each card links to the source page. Remote photos depend on Commons being reachable; if a photo fails, the card now displays a helpful fallback instead of a broken-image icon. GitHub Pages paths and file names are case-sensitive, so local assets must match their exact spelling and capitalization.

## Run locally

Serve the project over HTTP because it uses JavaScript modules:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish with GitHub Pages

The published website is available at **https://wonka15.github.io/Texas-Instrument-DataMath/**. If it does not load yet, open repository **Settings → Pages → Build and deployment** and select **Deploy from a branch**, branch `main`, folder `/(root)`, then save. GitHub Pages can take a few minutes to publish changes.

## Controls

- Drag the 3D view to rotate; scroll or pinch to zoom.
- **Reset View** restores the front angle.
- **Turn Over** rotates the model to inspect the rear.
- **Battery Bay** toggles the simulated battery compartment.
- Use on-screen keys or keyboard digits, `+`, `-`, `*`, `/`, `Enter`, `=`, `Escape`, `Backspace`, and `.`.
- Toggle generated sound in the header.
- AR mode uses surface detection on compatible Android WebXR browsers, with a camera-preview fallback on iPhone/iPad.
- VR is offered when a compatible immersive WebXR device/browser is detected.
- Optional KZSC radio play/pause button in the header.

## Current implementation

- Three.js procedural casing, keycaps, LED-style display, desk, lighting, and battery details.
- Four-function arithmetic, decimals, clear, clear-entry, sign toggle, repeated equals, and divide-by-zero handling.
- Pointer interaction with 3D keycaps as well as the on-screen keypad.
- Web Audio API-generated key clicks; no downloaded sound assets.
- Responsive layout and WebXR capability check.

## Model accuracy and reference research

This is a functional **Datamath-inspired** procedural model, not yet a museum-grade scan. Historical variants can differ in battery layout, legends, and casing. For a faithful final model, confirm the exact model variant and compare high-resolution front, rear, side, keypad, and battery-compartment photographs with measured dimensions. The present geometry is a first pass and should be refined against those references.

Research starting points:
- [Smithsonian National Museum of American History — Datamath collection search](https://americanhistory.si.edu/collections/search?edan_q=Datamath)
- [Texas Instruments company history](https://www.ti.com/about-ti/company/history.html)
- [Internet Archive — Datamath manuals search](https://archive.org/search?query=Texas+Instruments+Datamath)

Photographs remain the property of their respective rights holders. The project does not bundle external reference photos; check licenses and terms before reusing any reference image.

## Technology

- Three.js 0.164.1 via jsDelivr ES modules
- OrbitControls
- Web Audio API
- WebXR / Three.js VRButton where supported
- No build step required

## License

Project source code is MIT-licensed. Historical product names and trademarks belong to their respective owners. This is an unofficial educational project and is not affiliated with Texas Instruments.
