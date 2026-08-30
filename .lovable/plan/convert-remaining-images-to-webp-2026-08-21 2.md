# Convert remaining images to WebP

Goal: every rendered image on the site is WebP, with no visible quality loss and no layout changes.

## What changes

**1. Heavy CDN PNGs already having WebP twins locally**
These three are imported as PNG pointers while an optimized WebP already sits in `src/assets`. Switch the imports:

- `physical-wellness-couple.png` (2.3 MB) → `physical-wellness.webp`
- `samvit-medicines.png` (2.1 MB) → `samvit-medicines.webp`
- `tambola-cozy.png` (2.2 MB) → `tambola-live.webp`

If a WebP twin doesn't visually match the PNG it replaces (different crop/subject), convert that exact PNG to WebP instead rather than swapping in a different photo — fidelity first.

**2. PNGs with no WebP yet — convert and upload as WebP assets**

- `yoga-program-trio.png`, `yoga-program-breathwork.png` (~2 MB each, YogaSystem)
- `codes/A–H.png` (8 files, ~1 MB each, WellnessWheel)
- `ojusvi-icon.png`, `ojusvi-logo-flat.png`, `ojusvi-logo-round.png` (Nav, Footer, pay/thank-you/payment-failed, EarningsCalculator)

Each is downloaded from its CDN URL, converted with `cwebp` (quality ~85, lossless for the code/QR and logo images so edges and scan reliability stay perfect), re-uploaded via the assets CLI as a new `.webp.asset.json` pointer, and the component import updated.

**3. JPGs**

- Four Voices photos (`voices-*.jpg`, 21–44 KB) → WebP at quality 85, imported the same way.
- `public/og-image.jpg` stays JPG: social crawlers (WhatsApp, some LinkedIn paths) handle JPG most reliably for previews.
- `favicon.ico` / `favicon.png` stay as-is.

## Notes

- Old `.png.asset.json` / `.jpg` files are removed only after all references are rewritten; CDN objects for replaced PNGs are left in place so earlier published versions don't break.
- No changes to alt text, sizes, `aspect-ratio`, `loading`/`decoding` attributes, or any layout classes.
- Verified after: build passes, homepage and `/download` render, QR codes still scan to the correct App Store / Play Store links.

## Expected result

Roughly 18–20 MB of PNG payload replaced by WebP totalling a small fraction of that, mainly benefiting the homepage and the wellness-wheel section.
