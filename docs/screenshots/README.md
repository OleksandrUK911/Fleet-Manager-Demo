# Screenshots

Place PNG or WebP screenshots here after deployment.

## Required files

| Filename | Screen | Resolution |
|----------|--------|-----------|
| `dashboard.png` | Live Dashboard (light mode) | 1280×800 |
| `dark-mode.png` | Live Dashboard (dark mode) | 1280×800 |
| `vehicle-detail.png` | Vehicle Detail page | 1280×800 |
| `admin-panel.png` | Admin Panel | 1280×800 |
| `reports.png` | Reports Page | 1280×800 |

## How to take screenshots

1. Start the stack locally:
   ```powershell
   .\start_local.ps1
   ```
2. Log in at `http://localhost:3000` with `admin / admin123`
3. Open Chrome / Edge DevTools → device toolbar → set **1280 × 800**
4. Capture each screen with the browser's built-in screenshot or a tool like [Greenshot](https://getgreenshot.org/)
5. Optimise to WebP for smaller file size:
   ```bash
   cwebp -q 85 dashboard.png -o dashboard.webp
   ```
6. Update the image links in `README.md` to use `.webp` extensions

## Tip

The promo site (`website/`) already contains CSS-based interactive mock-ups of all five screens — no real images required for the landing page.
