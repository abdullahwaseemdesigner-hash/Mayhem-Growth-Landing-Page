# Mayhem Growth Landing Page

Responsive implementation of the supplied Mayhem Growth PNG designs, built with Vite, vanilla JavaScript, and GSAP ScrollTrigger.

## Open the client preview

Run `npm run build`, then open `standalone/Mayhem-Growth-Preview.html` directly in a browser or an HTML preview viewer. This single file embeds the original PNG images, Kycron and Inter fonts, styles, and animation scripts. It works offline and needs no web server or external resource requests. The video, contact form, and newsletter remain visual previews.

The source `index.html` and the normal `dist/index.html` reference separate files and require the Vite development server or static hosting. Opening either one alone in a file preview causes missing styles, images, and scripts. Use the standalone HTML when sharing a preview file with the client.

## Development

Node 22.12+ or 24 is supported. This environment uses Node 24.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
npm test
```

`npm test` checks the normal production build and the self-contained preview. It starts and stops its own preview server on port 4185, then loads the exact standalone HTML into an isolated document and an opaque-origin sandboxed iframe with networking disabled. Managed Chromium blocks file-scheme navigation, so the test injects the file contents instead of navigating to a file URL. It uses `/usr/bin/chromium` when available; otherwise run `npx playwright install chromium`, or set `CHROMIUM_PATH` to your Chromium executable. Screenshots are written to the ignored `test-results/` directory.

Deploy the contents of `dist/` to a static host, or host the single standalone HTML file. No backend is bundled. Deployment has not been performed.

## Implemented

- Hero, client logo strip, introduction preview, client testimonial, six services, four project showcases, four-step process, enquiry form, newsletter, and footer.
- Responsive layouts checked from 320 to 1920 pixels.
- Masked heading entrances, image reveals and parallax, staggered service cards, subtle desktop pointer tilt, scroll-driven testimonial text, animated project switching, and native smooth anchor scrolling.
- Reduced-motion support, keyboard project tabs, accessible dialogs, labelled form controls, mobile navigation, and focus restoration.
- Original PNG assets retained without recompression; CSS viewports isolate their photographs, logos, and icons. Text is HTML, rather than screenshots of complete sections.
- Original palette: background `#f1f0ec`, cards `#f5f4f1`, dark text, and muted gray copy.
- Self-hosted Inter Regular. No Google Fonts request is required.

## Preview configuration

### Brand fonts

The designer specified **Kycron Regular** for headings, **Kycron Extra Light** for the cover heading and eyebrow, and **Inter Regular** for all body copy.

The original WOFF2 files from the user-supplied Kycron archive are installed in `src/fonts/`. Kycron Regular is registered at weight 400; Kycron Extra Light is registered at weight 200. Both are preloaded, self-hosted, and bundled by Vite. Inter Regular remains the body font. No external font service is required.

### Original media and links

The PNG archive contains flattened section references, not the original standalone photos or vector assets. The implementation uses the same imagery via responsive viewports without inventing replacement artwork. Standalone originals/SVGs can replace those viewports for sharper large-screen rendering.

The video section is included as a visual preview with its original artwork, play button, and animations. Clicking the button opens an explicitly labelled preview; no video file or playback setup is required. Only one testimonial was supplied, so the page shows that real review without invented carousel content. Footer social marks are decorative until the actual profile URLs are supplied.

### Preview forms

The contact and newsletter forms are intentionally previews. They validate inputs, preserve entered details, and announce that nothing was sent. They never make submission requests and need no environment variables, endpoints, or credentials. Delivery is outside the requested preview scope.

## Assets and maintenance

`src/main.js` contains service/project content, interaction behavior, and animation settings. `src/style.css` controls the responsive layout. `src/fonts.css` defines font families and weights. `public/assets/` contains unmodified assets from the supplied archive. Keep its files together when deploying.

The existing checkout is already isolated for this cloud task; a separate Git worktree is unnecessary. Development servers must be restarted in new tasks.
