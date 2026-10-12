# TI Datamath — Interactive 3D Calculator

A browser-based, Three.js tribute to the 1970s Texas Instruments Datamath calculator. This first working version includes a walnut-toned studio scene, procedural 3D calculator geometry, interactive keys, a red LED-style display, generated key clicks, and a simulated battery bay.

## Run locally

Serve the project over HTTP because it uses JavaScript modules:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish with GitHub Pages

Open repository **Settings → Pages → Build and deployment**. Select **Deploy from a branch**, choose `main` and `/(root)`, and save. After deployment, GitHub will display the public site URL.

## Controls

- Drag the 3D view to rotate; scroll or pinch to zoom.
- **Reset View** restores the front angle.
- **Turn Over** rotates the model to inspect the rear.
- **Battery Bay** toggles the simulated battery compartment.
- Use on-screen keys or keyboard digits, `+`, `-`, `*`, `/`, `Enter`, `=`, `Escape`, `Backspace`, and `.`.
- Toggle generated sound in the header.
- VR is offered when a compatible immersive WebXR device/browser is detected.

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
