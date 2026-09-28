import { createFileRoute } from "@tanstack/react-router";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.ojusvi.app";
const APP_STORE_URL = "https://apps.apple.com/in/app/ojusvi/id6792540529";
// Badge/QR targets (US storefront, per product decision).
const APP_STORE_BADGE_URL = "https://apps.apple.com/us/app/ojusvi/id6792540529";
const PLAY_STORE_BADGE_URL = PLAY_STORE_URL;

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

// Pre-generated QR codes (qrcode.react output, level M, forest on parchment).
const QR_IOS = `<svg height="168" width="168" viewBox="0 0 33 33" role="img" aria-label="QR code linking to the Ojusvi app on the Apple App Store"><path fill="#f7f1e3" d="M0,0 h33v33H0z" shape-rendering="crispEdges"></path><path fill="#1f3a2b" d="M0 0h7v1H0zM8 0h1v1H8zM11 0h2v1H11zM18 0h4v1H18zM23 0h1v1H23zM26,0 h7v1H26zM0 1h1v1H0zM6 1h1v1H6zM8 1h5v1H8zM14 1h1v1H14zM17 1h1v1H17zM22 1h2v1H22zM26 1h1v1H26zM32,1 h1v1H32zM0 2h1v1H0zM2 2h3v1H2zM6 2h1v1H6zM9 2h2v1H9zM12 2h3v1H12zM16 2h1v1H16zM18 2h1v1H18zM20 2h1v1H20zM22 2h3v1H22zM26 2h1v1H26zM28 2h3v1H28zM32,2 h1v1H32zM0 3h1v1H0zM2 3h1v1H0zM6 3h1v1H6zM8 3h2v1H8zM11 3h1v1H11zM15 3h1v1H15zM18 3h2v1H18zM23 3h1v1H23zM26 3h1v1H26zM28 3h3v1H28zM32,3 h1v1H32zM0 4h1v1H0zM2 4h3v1H2zM6 4h1v1H6zM9 4h2v1H9zM13 4h1v1H13zM16 4h1v1H16zM18 4h1v1H18zM22 4h1v1H22zM26 4h1v1H26zM28 4h3v1H28zM32,4 h1v1H32zM0 5h1v1H0zM6 5h1v1H0zM9 5h4v1H9zM14 5h3v1H14zM18 5h1v1H18zM22 5h1v1H22zM24 5h1v1H24zM26 5h1v1H26zM32,5 h1v1H32zM0 6h7v1H0zM8 6h1v1H8zM10 6h1v1H10zM12 6h1v1H12zM14 6h1v1H14zM16 6h1v1H16zM18 6h1v1H18zM20 6h1v1H20zM22 6h1v1H22zM24 6h1v1H24zM26,6 h7v1H26zM8 7h2v1H8zM15 7h5v1H15zM22 7h3v1H22zM0 8h1v1H0zM2 8h2v1H2zM5 8h3v1H5zM11 8h2v1H11zM14 8h2v1H14zM17 8h1v1H17zM21 8h1v1H21zM26 8h1v1H26zM29 8h1v1H29zM31,8 h2v1H31zM0 9h4v1H0zM5 9h1v1H5zM9 9h1v1H9zM13 9h1v1H13zM16 9h9v1H16zM26 9h2v1H26zM29,9 h4v1H29zM1 10h1v1H1zM4 10h3v1H4zM9 10h1v1H9zM11 10h1v1H11zM13 10h1v1H13zM18 10h1v1H18zM23 10h7v1H23zM31,10 h2v1H31zM0 11h3v1H0zM7 11h2v1H7zM10 11h2v1H10zM16 11h2v1H16zM22 11h2v1H22zM25 11h1v1H25zM27 11h1v1H27zM29 11h1v1H29zM1 12h2v1H1zM6 12h1v1H6zM9 12h2v1H9zM12 12h3v1H12zM20 12h1v1H20zM27 12h3v1H27zM31 12h1v1H31zM0 13h1v1H0zM2 13h2v1H2zM7 13h4v1H7zM12 13h1v1H12zM14 13h1v1H14zM20 13h1v1H20zM22 13h1v1H22zM25 13h1v1H25zM27 13h1v1H27zM29 13h1v1H29zM31 13h1v1H31zM4 14h1v1H4zM6 14h2v1H6zM9 14h1v1H9zM13 14h1v1H13zM17 14h4v1H17zM22 14h1v1H22zM26 14h5v1H26zM0 15h1v1H0zM2 15h1v1H2zM7 15h1v1H7zM9 15h1v1H9zM11 15h1v1H11zM14 15h2v1H14zM21 15h1v1H21zM23 15h8v1H23zM1 16h1v1H1zM6 16h2v1H6zM10 16h2v1H10zM13 16h2v1H13zM16 16h1v1H16zM20 16h7v1H20zM28 16h1v1H28zM30 16h1v1H30zM0 17h4v1H0zM7 17h2v1H7zM11 17h1v1H11zM14 17h2v1H14zM18 17h1v1H18zM20 17h1v1H20zM23 17h4v1H23zM28 17h2v1H28zM32,17 h1v1H32zM2 18h5v1H2zM8 18h1v1H8zM10 18h3v1H10zM14 18h3v1H14zM18 18h1v1H18zM21 18h2v1H21zM24 18h2v1H24zM27 18h2v1H27zM30 18h2v1H30zM0 19h1v1H0zM2 19h1v1H2zM9 19h6v1H9zM17 19h3v1H17zM22 19h2v1H22zM28 19h1v1H28zM0 20h3v1H0zM4 20h3v1H4zM8 20h2v1H8zM11 20h3v1H11zM16 20h1v1H16zM21 20h1v1H21zM24 20h1v1H24zM29,20 h4v1H29zM0 21h2v1H0zM7 21h1v1H7zM9 21h3v1H9zM14 21h3v1H14zM20 21h7v1H20zM29 21h2v1H29zM32,21 h1v1H32zM3 22h2v1H3zM6 22h1v1H6zM13 22h1v1H13zM15 22h1v1H15zM17 22h4v1H17zM23 22h1v1H23zM26,22 h7v1H26zM1 23h1v1H1zM12 23h4v1H12zM18 23h1v1H18zM20 23h1v1H20zM22 23h1v1H22zM27 23h1v1H27zM29 23h1v1H29zM0 24h1v1H0zM2 24h2v1H2zM5 24h3v1H5zM12 24h1v1H12zM17 24h1v1H17zM19 24h1v1H19zM22 24h7v1H22zM8 25h1v1H8zM10 25h1v1H10zM13 25h4v1H13zM18 25h3v1H18zM24 25h1v1H24zM28 25h2v1H28zM0 26h7v1H0zM8 26h1v1H8zM11 26h1v1H11zM13 26h1v1H13zM17 26h8v1H17zM26 26h1v1H26zM28 26h1v1H28zM0 27h1v1H0zM6 27h1v1H6zM8 27h4v1H8zM14 27h1v1H14zM16 27h3v1H16zM20 27h2v1H20zM23 27h2v1H23zM28,27 h5v1H28zM0 28h1v1H0zM2 28h1v1H2zM6 28h1v1H6zM9 28h1v1H9zM13 28h6v1H13zM20 28h2v1H20zM23 28h6v1H23zM30 28h2v1H30zM0 29h1v1H0zM2 29h3v1H2zM6 29h1v1H6zM8 29h1v1H8zM10 29h1v1H10zM16 29h1v1H16zM19 29h1v1H19zM21 29h1v1H21zM27 29h1v1H27zM30 29h1v1H30zM0 30h1v1H0zM2 30h3v1H2zM6 30h1v1H6zM8 30h1v1H8zM11 30h8v1H11zM20 30h4v1H20zM24 30h4v1H24zM29 30h2v1H29zM0 31h1v1H0zM6 31h1v1H6zM9 31h3v1H9zM13 31h2v1H13zM17 31h2v1H17zM20 31h1v1H20zM24 31h6v1H24zM32,31 h1v1H32zM0 32h7v1H0zM8 32h1v1H8zM16 32h2v1H16zM21 32h1v1H21zM26 32h1v1H26zM28 32h1v1H28z" shape-rendering="crispEdges"></path></svg>`;

const QR_ANDROID = `<svg height="168" width="168" viewBox="0 0 33 33" role="img" aria-label="QR code linking to the Ojusvi app on Google Play"><path fill="#f7f1e3" d="M0,0 h33v33H0z" shape-rendering="crispEdges"></path><path fill="#1f3a2b" d="M0 0h7v1H0zM8 0h2v1H8zM11 0h1v1H11zM13 0h1v1H13zM18 0h4v1H18zM23 0h1v1H23zM26,0 h7v1H26zM0 1h1v1H0zM6 1h1v1H6zM8 1h4v1H8zM13 1h1v1H13zM16 1h3v1H16zM22 1h2v1H22zM26 1h1v1H26zM32,1 h1v1H32zM0 2h1v1H0zM2 2h3v1H2zM6 2h1v1H6zM9 2h1v1H9zM12 2h1v1H12zM18 2h1v1H18zM22 2h3v1H22zM26 2h1v1H26zM28 2h3v1H28zM32,2 h1v1H32zM0 3h1v1H0zM2 3h1v1H0zM6 3h1v1H6zM8 3h2v1H8zM12 3h1v1H12zM14 3h2v1H14zM17 3h1v1H17zM20 3h1v1H20zM23 3h2v1H23zM26 3h1v1H26zM28 3h3v1H28zM32,3 h1v1H32zM0 4h1v1H0zM2 4h3v1H2zM6 4h1v1H6zM9 4h2v1H9zM13 4h2v1H13zM18 4h2v1H18zM22 4h1v1H22zM24 4h1v1H24zM26 4h1v1H26zM28 4h3v1H28zM32,4 h1v1H32zM0 5h1v1H0zM6 5h1v1H0zM9 5h4v1H9zM14 5h1v1H14zM16 5h4v1H16zM21 5h1v1H21zM24 5h1v1H24zM26 5h1v1H26zM32,5 h1v1H32zM0 6h7v1H0zM8 6h1v1H8zM10 6h1v1H10zM12 6h1v1H12zM14 6h1v1H14zM16 6h1v1H16zM18 6h1v1H18zM20 6h1v1H20zM22 6h1v1H22zM24 6h1v1H24zM26,6 h7v1H26zM8 7h1v1H8zM12 7h1v1H12zM17 7h4v1H17zM22 7h2v1H22zM0 8h1v1H0zM2 8h2v1H2zM5 8h3v1H5zM10 8h2v1H10zM14 8h1v1H14zM16 8h3v1H16zM21 8h1v1H21zM23 8h1v1H23zM26 8h1v1H26zM29 8h1v1H29zM31,8 h2v1H31zM1 9h1v1H1zM3 9h3v1H3zM7 9h2v1H7zM10 9h1v1H10zM12 9h1v1H12zM16 9h1v1H16zM18 9h3v1H18zM23 9h2v1H23zM26 9h2v1H26zM29,9 h4v1H29zM1 10h2v1H1zM4 10h1v1H4zM6 10h2v1H6zM9 10h2v1H9zM12 10h1v1H12zM14 10h1v1H14zM20 10h1v1H20zM22 10h3v1H22zM26 10h4v1H26zM31,10 h2v1H31zM1 11h2v1H1zM5 11h1v1H5zM9 11h1v1H9zM12 11h5v1H12zM18 11h1v1H18zM20 11h1v1H20zM27 11h1v1H27zM29 11h1v1H29zM31 11h1v1H31zM0 12h1v1H0zM2 12h2v1H2zM5 12h2v1H5zM8 12h2v1H8zM11 12h2v1H11zM15 12h3v1H15zM19 12h1v1H19zM22 12h4v1H22zM27 12h3v1H27zM4 13h2v1H4zM7 13h1v1H7zM11 13h1v1H11zM13 13h1v1H13zM15 13h2v1H15zM18 13h2v1H18zM21 13h1v1H21zM24 13h1v1H24zM27 13h1v1H27zM29 13h1v1H29zM31 13h1v1H31zM3 14h2v1H3zM6 14h1v1H6zM8 14h1v1H8zM12 14h1v1H12zM14 14h1v1H14zM16 14h1v1H16zM18 14h4v1H18zM24 14h1v1H24zM26 14h1v1H26zM28 14h3v1H28zM1 15h3v1H1zM9 15h1v1H9zM14 15h2v1H14zM19 15h5v1H19zM25 15h2v1H25zM30 15h1v1H30zM5 16h2v1H5zM8 16h2v1H8zM13 16h1v1H13zM16 16h1v1H16zM19 16h4v1H19zM24 16h3v1H24zM28 16h3v1H28zM2 17h1v1H2zM4 17h2v1H4zM7 17h2v1H7zM10 17h1v1H10zM12 17h4v1H12zM22 17h3v1H22zM26 17h1v1H26zM28 17h2v1H28zM32,17 h1v1H32zM0 18h1v1H0zM2 18h3v1H2zM6 18h1v1H6zM8 18h1v1H8zM12 18h1v1H12zM15 18h3v1H15zM20 18h1v1H20zM26 18h3v1H26zM30 18h2v1H30zM2 19h1v1H2zM5 19h1v1H5zM8 19h3v1H8zM14 19h2v1H14zM22 19h2v1H22zM25 19h2v1H25zM28 19h1v1H28zM32,19 h1v1H32zM0 20h1v1H0zM2 20h1v1H2zM6 20h5v1H6zM13 20h1v1H13zM15 20h1v1H15zM17 20h3v1H17zM21 20h1v1H21zM24 20h1v1H24zM27 20h1v1H27zM29 20h3v1H29zM0 21h2v1H0zM3 21h1v1H3zM5 21h1v1H5zM7 21h1v1H7zM9 21h1v1H9zM11 21h2v1H11zM14 21h1v1H14zM16 21h5v1H16zM23 21h2v1H23zM26 21h1v1H26zM29 21h1v1H29zM32,21 h1v1H32zM2 22h1v1H2zM5 22h2v1H5zM8 22h5v1H8zM14 22h1v1H14zM16 22h1v1H16zM18 22h5v1H18zM20 22h5v1H20zM26 22h2v1H26zM30,22 h3v1H30zM1 23h4v1H1zM8 23h4v1H8zM13 23h1v1H13zM16 23h1v1H16zM18 23h1v1H18zM20 23h1v1H20zM23 23h1v1H23zM25 23h1v1H25zM27 23h3v1H27zM31 23h1v1H31zM0 24h1v1H0zM2 24h2v1H2zM6 24h2v1H6zM9 24h3v1H9zM15 24h1v1H15zM17 24h1v1H17zM19 24h1v1H19zM22 24h1v1H22zM24 24h5v1H24zM31,24 h2v1H31zM8 25h1v1H8zM11 25h2v1H11zM15 25h2v1H15zM18 25h2v1H18zM21 25h1v1H21zM23 25h2v1H23zM28 25h2v1H28zM31 25h1v1H31zM0 26h7v1H0zM8 26h1v1H8zM11 26h1v1H11zM13 26h1v1H13zM16 26h1v1H16zM19 26h2v1H19zM23 26h2v1H23zM26 26h1v1H26zM28 26h1v1H28zM0 27h1v1H0zM6 27h1v1H6zM8 27h1v1H8zM10 27h1v1H10zM13 27h4v1H13zM20 27h5v1H20zM28 27h4v1H28zM0 28h1v1H0zM2 28h3v1H2zM6 28h1v1H6zM10 28h2v1H10zM14 28h1v1H14zM19 28h10v1H19zM30 28h1v1H30zM32,28 h1v1H32zM0 29h1v1H0zM2 29h3v1H2zM6 29h1v1H6zM8 29h1v1H8zM10 29h2v1H10zM14 29h2v1H14zM22 29h1v1H22zM27 29h1v1H27zM29 29h1v1H29zM32,29 h1v1H32zM0 30h1v1H0zM2 30h3v1H2zM6 30h1v1H6zM8 30h1v1H8zM11 30h5v1H11zM17 30h2v1H17zM20 30h1v1H20zM22 30h2v1H22zM26 30h2v1H26zM30 30h1v1H30zM0 31h1v1H0zM6 31h1v1H6zM12 31h1v1H12zM15 31h4v1H15zM22 31h1v1H22zM24 31h1v1H24zM27 31h2v1H27zM32,31 h1v1H32zM0 32h7v1H0zM8 32h1v1H8zM11 32h2v1H11zM15 32h1v1H15zM17 32h2v1H17zM21 32h1v1H21zM23 32h1v1H23zM25 32h1v1H25zM28 32h1v1H28z" shape-rendering="crispEdges"></path></svg>`;

/**
 * Self-contained desktop QR page (no React bundle): restores the original
 * /download-app design — headline, store buttons and scannable QR codes.
 */
function desktopQrPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Download Ojusvi — iOS &amp; Android</title>
<meta name="description" content="Download Ojusvi on iPhone or Android. Daily yoga, panchang, satsang and quiet companionship in your language.">
<link rel="canonical" href="https://ojusvi.app/download-app">
<meta property="og:title" content="Download Ojusvi">
<meta property="og:description" content="Get Ojusvi on the App Store or Google Play. 30 days free.">
<meta property="og:url" content="https://ojusvi.app/download-app">
<meta property="og:type" content="website">
<meta property="og:image" content="https://ojusvi.app/og-image.jpg">
<meta property="og:image:secure_url" content="https://ojusvi.app/og-image.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="916">
<meta property="og:image:height" content="1717">
<meta property="og:image:alt" content="Ojusvi — wellness and companionship app for adults 55+">
<meta property="og:site_name" content="Ojusvi">
<meta name="twitter:image" content="https://ojusvi.app/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f7f1e3; color: #1f3a2b; font-family: Georgia, 'Times New Roman', serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; }
  img.logo { height: 96px; width: auto; }
  h1 { font-style: italic; font-weight: 500; font-size: clamp(34px, 5vw, 52px); line-height: 1.1; margin-top: 24px; }
  p.sub { max-width: 460px; font-size: 18px; line-height: 1.65; color: rgba(26,26,26,.8); margin-top: 16px; }
  .grid { display: grid; grid-template-columns: 1fr; gap: 40px; margin-top: 48px; width: 100%; max-width: 640px; }
  @media (min-width: 640px) { .grid { grid-template-columns: 1fr 1fr; } }
  .col { display: flex; flex-direction: column; align-items: center; }
  a.btn { display: inline-flex; align-items: center; justify-content: center; height: 56px; width: 100%; max-width: 260px; border-radius: 9999px; background: #1f3a2b; color: #f7f1e3; font-size: 15px; font-weight: 500; letter-spacing: .02em; text-decoration: none; box-shadow: 0 4px 6px rgba(0,0,0,.1); }
  a.btn:hover { background: #16291e; }
  .qr { margin-top: 24px; border-radius: 16px; background: #f7f1e3; padding: 20px; box-shadow: 0 8px 30px rgba(31,58,43,.12); }
  p.hand { margin-top: 32px; font-size: 18px; font-style: italic; color: rgba(31,58,43,.8); }
  a.btn-outline { display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 32px; margin-top: 28px; border: 1.5px solid #1f3a2b; border-radius: 9999px; background: transparent; color: #1f3a2b; font-size: 15px; font-weight: 500; letter-spacing: .02em; text-decoration: none; }
  a.btn-outline:hover { background: #1f3a2b; color: #f7f1e3; }
</style>
</head>
<body>
  <a href="/" aria-label="Ojusvi — go to home page" style="display: inline-block; line-height: 0; text-decoration: none;"><img class="logo" src="/ojusvi-logo-round.webp" alt="Ojusvi logo — home" width="96" height="96"></a>
  <h1>Bring Ojusvi home.</h1>
  <p class="sub">Daily yoga, panchang, satsang and gentle companionship — in your language, on your phone.</p>
  <div class="grid">
    <div class="col">
      <a class="btn" href="${APP_STORE_BADGE_URL}">Download on the App Store</a>
      <div class="qr">${QR_IOS}</div>
    </div>
    <div class="col">
      <a class="btn" href="${PLAY_STORE_BADGE_URL}">Get it on Google Play</a>
      <div class="qr">${QR_ANDROID}</div>
    </div>
  </div>
  <p class="hand">Scan with your phone's camera.</p>
  <a class="btn-outline" href="/">Know more about Ojusvi</a>
</body>
</html>`;
}

/**
 * /download-app is a server-side store dispatcher. Android and iOS visitors
 * get a 302 straight to their store listing; desktop visitors get a QR page
 * served right here. A Meta Conversions API event is fired in the background
 * for store redirects so the redirect is never delayed.
 */
export const Route = createFileRoute("/download-app")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const ua = request.headers.get("user-agent") || "";
        const isAndroid = /android/i.test(ua);
        const isIOS = /iphone|ipad|ipod/i.test(ua);

        // Desktop/unknown: serve the QR page, no redirect.
        if (!isAndroid && !isIOS) {
          return new Response(desktopQrPage(), {
            status: 200,
            headers: {
              "content-type": "text/html; charset=utf-8",
              "Cache-Control": "no-store",
            },
          });
        }

        // Carry campaign parameters into the Play referrer for install attribution.
        const utm = new URLSearchParams();
        for (const key of UTM_KEYS) {
          const value = url.searchParams.get(key);
          if (value) utm.set(key, value);
        }
        if (!utm.has("utm_source")) utm.set("utm_source", "meta");

        let target: string;
        let platform: string;
        if (isAndroid) {
          target = `${PLAY_STORE_URL}&referrer=${encodeURIComponent(utm.toString())}`;
          platform = "android";
        } else {
          target = APP_STORE_URL;
          platform = "ios";
        }

        // Secrets are read per-request from process.env (injected into the
        // Worker runtime with nodejs_compat_populate_process_env).
        const pixelId = process.env["META_PIXEL_ID"];
        const capiToken = process.env["META_CAPI_TOKEN"];

        if (pixelId && capiToken) {
          const fbclid = url.searchParams.get("fbclid");
          const ip = request.headers.get("cf-connecting-ip") || "";

          const userData: Record<string, unknown> = {
            client_user_agent: ua,
            client_ip_address: ip,
          };
          if (fbclid) userData.fbc = `fb.1.${Date.now()}.${fbclid}`;

          const payload = {
            data: [
              {
                event_name: "StoreRedirect",
                event_time: Math.floor(Date.now() / 1000),
                action_source: "website",
                event_source_url: request.url,
                event_id: crypto.randomUUID(),
                user_data: userData,
                custom_data: {
                  platform,
                  ...Object.fromEntries(utm),
                },
              },
            ],
          };

          const send = fetch(
            `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${capiToken}`,
            {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload),
            },
          ).catch(() => {
            // Attribution is best-effort: never block or fail the redirect.
          });

          // Prefer true background execution via the Workers lifecycle
          // waitUntil; fall back to a bounded 800ms wait only when the
          // runtime doesn't expose one.
          const ctx = request as unknown as {
            waitUntil?: (p: Promise<unknown>) => void;
            runtime?: {
              cloudflare?: {
                context?: { waitUntil?: (p: Promise<unknown>) => void };
              };
            };
          };
          const waitUntil =
            ctx.waitUntil?.bind(request) ??
            ctx.runtime?.cloudflare?.context?.waitUntil?.bind(
              ctx.runtime.cloudflare.context,
            );
          if (waitUntil) {
            waitUntil(send);
          } else {
            await Promise.race([send, new Promise((r) => setTimeout(r, 800))]);
          }
        }

        return new Response(null, {
          status: 302,
          headers: {
            Location: target,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
