# DevToolBox — Free Online Developer Tools

> 🚀 Fast, beautiful, and private developer tools that run entirely in your browser.

🔗 **Live site**: [https://devtoolbox.link](https://devtoolbox.link)

## Tools Included (20 tools)

| Category | Tool | Description |
|----------|------|-------------|
| **Formatters** | JSON Formatter & Validator | Format, validate, and minify JSON data |
| | CSS Minifier / Beautifier | Minify or beautify CSS code |
| | HTML Entity Encoder | Encode/decode HTML entities |
| **Encoders** | Base64 Encoder / Decoder | Encode/decode text and Base64 strings |
| | URL Encoder / Decoder | Encode/decode URL strings |
| | Image ↔ Base64 | Convert images to Base64 data URIs |
| **Generators** | UUID Generator | Generate UUID v4 (single or bulk) |
| | Lorem Ipsum Generator | Generate placeholder text |
| | Hash Generator | MD5 / SHA-1 / SHA-256 / SHA-512 |
| | Password Generator | Cryptographically secure passwords |
| | QR Code Generator | Generate QR codes as PNG or SVG |
| | CSS Gradient Generator | Visual CSS gradient editor |
| | Meta Tag Generator | SEO / OGP / Twitter Card tags |
| | Favicon Generator | Favicon from emoji or text |
| **Converters** | Color Converter | HEX ↔ RGB ↔ HSL with live preview |
| | Timestamp Converter | Unix timestamp ↔ human-readable date |
| **Text Tools** | Markdown Preview | Real-time Markdown editor and preview |
| | Word Counter | Words, characters, reading time |
| | Diff Checker | Compare two texts side by side |
| | Regex Tester | Test regex with live match highlighting |

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Deploy

### Cloudflare Pages (Recommended)
1. Push this repo to GitHub
2. Connect to [Cloudflare Pages](https://pages.cloudflare.com)
3. Build command: `npm run build` / Output directory: `dist`
4. Auto-deploys on every push to `main`

### Netlify
1. Push to GitHub
2. Connect to [Netlify](https://netlify.com)
3. Build command: `npm run build` / Publish directory: `dist`

## Monetization (Google AdSense)

To add AdSense after approval:

1. Add the AdSense script to `index.html` `<head>`:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
```

2. Add ad units in `src/main.js` inside the `render()` function

## Tech Stack

- **Vite** — Lightning-fast build
- **Vanilla JS** — Zero framework overhead
- **CSS** — Custom design system, dark mode, glassmorphism
- **Google Fonts** — Inter + JetBrains Mono
- **Cloudflare Pages** — Global edge deployment

## License

MIT

