# Shop Manager (Bangla) – PWA

This is a lightweight inventory & sales manager in Bangla.  
Host on **GitHub Pages** and turn into an Android APK via **PWABuilder**.

## Quick Deploy (GitHub Pages)
1. Create a **public** repo on GitHub under your account: **fahimfscpic99-coder**. Example repo name: `shop-manager`.
2. Upload *all files* from this folder (`index.html`, `app.js`, `manifest.json`, `sw.js`, `icon-*.png`, `.nojekyll`).
3. Go to **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` → Folder: `/root` → **Save**.
4. After deploy, your site will be live at:  
   `https://fahimfscpic99-coder.github.io/shop-manager/`

> The `.nojekyll` file disables Jekyll so `sw.js` and other PWA assets work correctly.

## Make Android APK (Free)
1. Visit **https://www.pwabuilder.com**  
2. Enter your live URL: `https://fahimfscpic99-coder.github.io/shop-manager/`
3. Fix any issues if highlighted (this package already includes manifest, service worker, icons).
4. Generate **Android package** → Download the `.apk` and install on your device.

## Notes
- Data is saved locally (LocalStorage), works offline via Service Worker.
- Export CSV/JSON backups from the **Reports** tab.
- To reset demo data: go to **Products → ডেমো ডাটা**.

## Customize
- App title: edit `<title>` in `index.html`.
- Primary color: change `theme-color` in `index.html` and `theme_color` in `manifest.json`.
- Icons: replace `icon-192.png` & `icon-512.png`.
