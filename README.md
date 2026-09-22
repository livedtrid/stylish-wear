# Stylish Wear

An immersive, scroll-driven fashion showcase built with React, Vite, and
React Three Fiber. The experience combines full-screen imagery, looping video
textures, and HTML typography in a three-page WebGL scroll scene.

## Features

- Scroll-controlled 3D layout powered by Drei `ScrollControls`
- Images and videos rendered as Three.js textures
- Video playback that starts and pauses based on scroll visibility
- Hover color transitions on image surfaces
- Responsive viewport sizing and device-pixel-ratio limits
- Static asset bundling through Vite

## Requirements

- Node.js 18 or newer
- npm
- A modern browser with WebGL support

## Getting started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Vite will print the local URL in the terminal. To expose the development
server on the network, use the host-enabled script above and open the
displayed network address.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with host access |
| `npm run build` | Type-check the project and create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |

## Project structure

```text
.
├── index.html          # HTML entry point
├── src/
│   ├── App.tsx         # WebGL scene, scroll controls, and media layout
│   ├── index.tsx       # React entry point and overlay content
│   ├── styles.css      # Global page and canvas styles
│   ├── *.png, *.jpg    # Image assets
│   └── *.mp4           # Video assets
├── package.json
└── tsconfig.json
```

`App.tsx` owns the Canvas and the scroll scene. The `Images` component keeps
the media order, world-space positions, and scroll-based material effects
together. The `Video` component creates a `THREE.VideoTexture`, keeps playback
muted and inline, and disposes the texture when it is removed.

## Adding or moving media

Media is imported statically from `src/` so Vite can include it in the build.
When changing the scene, update both the JSX child order and the corresponding
indexed material calculations in `Images`. For videos, also update the
`scrollRange` so playback remains limited to the section where the video is
visible.

## Production build

Build the application with:

```bash
npm run build
```

The generated `dist/` directory can be deployed to any static hosting
provider that supports single-page Vite applications.