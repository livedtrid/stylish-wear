# Copilot instructions for stylish-wear

## Project commands

This is an npm-managed Vite project; use the committed `package-lock.json` when installing dependencies.

```text
npm install
npm run dev       # Start Vite with host access enabled
npm run build     # Run TypeScript checking, then create the Vite production build
npm run preview   # Serve the built dist/ output locally
```

There is currently no test runner, test script, or lint script configured, so there is no single-test command. `npm run build` is the available type-check/build validation.

## Architecture

- `index.html` provides the root element and loads `src/index.tsx`.
- `src/index.tsx` is the application shell. It renders the WebGL scene, the HTML overlay text/link, and the `@pmndrs/branding` logo.
- `src/App.tsx` owns the React Three Fiber scene. `App` creates the `Canvas`, `ScrollControls`, and HTML scroll layer; `Images` lays out the image/video sequence and updates Drei image-material effects from scroll progress.
- `Image` wraps Drei's `Image` component to add hover color interpolation. `Video` creates and owns a `THREE.VideoTexture`, loads the imported video asset, starts playback only while its configured scroll range is visible, and disposes the texture on cleanup.
- `src/styles.css` supplies the global viewport reset, typography, background, cursor, and link behavior. The scroll-layer headings and small overlay labels are intentionally positioned with inline styles.
- Images and videos are bundled as static imports from `src/`; they are not fetched from an API or represented by a separate data/state layer.

## Repository-specific conventions

- Keep React Three Fiber hooks (`useFrame`, `useThree`, `useScroll`) inside components rendered beneath the `Canvas`.
- Use Drei's `ScrollControls` as the source of scroll state. When adding or moving media, update both the world-space position/scale and the corresponding `useFrame` material calculations or `scrollRange`.
- Treat the order of `Images`' children as significant: the indexed material updates in `useFrame` correspond directly to the JSX child order.
- Preserve the video lifecycle in `Video`: muted, looping, inline playback; visibility-gated `play()`/`pause()`; event-listener cleanup; source reset; and `VideoTexture.dispose()`.
- Prefer static asset imports so Vite handles URLs and bundling. Add new visual assets under `src/` and import them from the component that uses them.
- Keep the existing TypeScript-safe wrapper types around Drei `ImageProps`. Drei exposes material fields such as `color`, `zoom`, and `grayscale` at runtime even when the generic Three.js types do not expose them, so access those fields through the established narrow casts rather than weakening the whole component to `any`.
- Keep the global canvas/viewport behavior in `styles.css`; use inline styles in the React files only for scene-specific overlay placement.
- The project uses strict TypeScript, ES modules, React JSX transform, and Vite's bundler module resolution. Keep new source code under `src/` so it is covered by `tsconfig.json`.
