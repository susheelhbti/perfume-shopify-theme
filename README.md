# NOXR — Luxury Perfume Oil Theme

A premium, dark-aesthetic Shopify OS 2.0 theme built specifically for high-end fragrance, attar, and perfume oil brands. Featuring rich micro-interactions, 3D hover effects, and a sophisticated gold-on-black design language.

![Shopify OS 2.0](https://img.shields.io/badge/Shopify-OS_2.0-black?logo=shopify&logoColor=white)
![Alpine.js](https://img.shields.io/badge/Alpine.js-v3.x-8BC0D0?logo=alpinedotjs&logoColor=white)
![Liquid](https://img.shields.io/badge/Liquid-Shopify-008080?logo=liquid&logoColor=white)

---

## ✨ Key Features

### Design & UX
* **Dark Luxury Aesthetic:** Deep black (`#050505`) backgrounds with metallic gold (`#c6a56b`) accents.
* **Typography:** High-contrast pairing of *Cormorant Garamond* (display) and *Inter* (body).
* **3D Card Interactions:** Mouse-tracking perspective tilt and spotlight effects on collection cards (gracefully disabled on touch devices).
* **Cinematic Animations:** Staggered entrance reveals, shimmer light-sweeps, breathing signature glows, and word-by-word heading animations.
* **Full-Bleed Imagery:** Edge-to-edge collection cards with gradient content overlays.

### Technical
* **Shopify OS 2.0:** Fully JSON-template driven with section-based architecture.
* **Reactive Cart Drawer:** Built with Alpine.js, featuring multi-item selection, subtotal calculation, and a dynamic free-shipping progress bar.
* **Performance Optimized:** Externalized CSS/JS assets, native WebP `<picture>` elements, lazy loading, and `IntersectionObserver` for triggering animations only when visible.
* **Client-Side Wishlist:** LocalStorage-backed wishlist toggling directly from product cards without page reloads.

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| **Markup** | Shopify Liquid |
| **Styling** | Vanilla CSS3 (Custom Properties, Keyframes, Grid) |
| **Reactivity** | Alpine.js v3 (Cart, Product Cards) |
| **Behavior** | Vanilla JavaScript (ES5/6, IntersectionObserver) |
| **Fonts** | Google Fonts (Cormorant Garamond, Inter) |

---

## 📁 Architecture & File Structure

The theme strictly follows a separation of concerns pattern. Dynamic server-side logic lives in `.liquid` files, while styling and behavior are decoupled into external, cacheable assets.

```text
├── assets/
│   ├── collections-grid.css    # Static CSS (uses --cs-* custom properties)
│   ├── collections-grid.js     # Static JS (IntersectionObserver, 3D tilt)
│   ├── cart-drawer.css / .js   # Cart UI & state logic
│   ├── product-card.css / .js  # Card interactions
│   ├── base.css                # Global variables, resets, typography
│   └── ...
├── layout/
│   ├── theme.liquid            # Global wrapper (<head>, <footer>)
│   └── password.liquid         # Password page wrapper
├── sections/
│   ├── collections-grid.liquid # Injects --cs-* vars, loads CSS/JS, outputs HTML
│   ├── cart-drawer.liquid      # Alpine.js x-data cart wrapper
│   ├── hero-banner.liquid      # Hero with gallery/particles
│   └── ...
├── snippets/
│   ├── product-card.liquid     # Reusable card markup (Alpine state)
│   ├── image-webp.liquid       # Responsive WebP picture element
│   ├── breadcrumbs.liquid      # Dynamic nav trail
│   └── ...
├── templates/                  # OS 2.0 JSON routing
└── config/
    ├── settings_schema.json    # Theme setting definitions
    └── settings_data.json      # Active theme preset values
```

### How Scoping Works
To keep external CSS files static and highly cacheable, section-specific dynamic colors (like the collection grid's background or accent color) are injected via a single inline `style` attribute on the section wrapper in the `.liquid` file:
```html
<div class="collections-section" style="--cs-bg: {{ bg_color }}; --cs-accent: {{ accent_color }};">
```
The external `collections-grid.css` then consumes these using `var(--cs-accent)`.

---

## 🚀 Installation

1. Download the theme `.zip` file.
2. Go to your Shopify Admin > **Online Store** > **Themes**.
3. Click **Add theme** > **Upload zip file**.
4. Select the downloaded file and wait for extraction.
5. Click **Actions** > **Preview** to view, or **Publish** to make it live.

---

## ⚙️ Customization

### Theme Editor (No-Code)
Almost all visual settings can be adjusted via the Shopify Theme Editor (Admin > Online Store > Customize):
* **Colors:** Change background, text, and gold accent colors per section.
* **Typography:** Adjust font sizes and weights globally.
* **Collections Grid:** Swap out the 3 collections, change tier labels, update price ranges, and toggle the "Signature" card status.
* **Free Shipping:** Enable and set the threshold amount for the cart drawer progress bar.

### Developer Customization (Code)
* **Global CSS Variables:** Found in `assets/base.css` (e.g., `--gold: #c6a56b;`, `--ease: cubic-bezier(...);`).
* **Animation Speeds:** Adjust `animation-duration` values directly in component-specific CSS files (e.g., `collections-grid.css`).

---

## ⚠️ Developer Notes & Implementation Details

When extending or modifying this theme, keep the following architectural quirks in mind:

* **Cart Drawer Dependencies:** The free shipping bar in `cart-drawer.liquid` relies on global settings: `settings.free_shipping_enable` and `settings.free_shipping_threshold`. Ensure these are defined in `config/settings_schema.json` under the global settings group, not the section schema.
* **Quick View Variants:** The `snippets/quick-view.liquid` modal currently renders variant buttons but requires an Alpine.js `x-data` wrapper and `@click` bindings on the pills to dynamically update the hidden `<input name="id">`. By default, it adds the first available variant.
* **Wishlist Type Consistency:** The `product-card.liquid` snippet passes `productId` to `window.NOXR.toggleWishlist()`. Ensure your global `utils.js` or `theme.js` handles IDs consistently (as strings) to prevent state desync between the UI heart icon and LocalStorage.
* **3D Touch Fallback:** The `collections-grid.js` explicitly checks for `'ontouchstart' in window` and `window.innerWidth <= 900` to disable the `rotateX/rotateY` transforms, preventing sticky hover states on iOS/Android.
* **Breadcrumbs:** The `breadcrumbs.liquid` snippet handles `product`, `collection`, `page`, `blog`, and `article` types. If you create custom templates (like a custom search page), you may need to add a new `{%- when 'search' -%}` block.
