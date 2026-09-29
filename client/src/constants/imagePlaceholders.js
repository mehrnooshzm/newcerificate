// A single shared "no preview available" placeholder — used anywhere a
// design/template preview image might be missing or fail to load, so the
// fallback looks the same everywhere in the app.
//
// This is a safe, guaranteed-to-load inline SVG (no network request).
// If you'd rather use a real asset, replace this with a path like
// '/images/default-preview.png' — no other files need to change.
export const DEFAULT_PREVIEW_IMAGE =
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
      <rect width="400" height="300" fill="#e5e7eb"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="16"
            fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
        No preview available
      </text>
    </svg>`
  );
