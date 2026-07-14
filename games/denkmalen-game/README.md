# Public Assets

This folder contains static assets for the Draw Battle game.

## Structure

```
public/
├── icons/           # PWA icons
├── sounds/          # Sound effects (optional)
├── manifest.json    # PWA manifest
└── README.md        # This file
```

## Adding Custom Assets

### Images
Place any static images in this folder. They can be referenced as:
```tsx
<img src="/your-image.png" alt="Description" />
```

### Sound Effects
If you want to add custom sound effects, place them in a `sounds/` subfolder:
```
public/sounds/
├── click.mp3
├── success.mp3
├── error.mp3
└── background.mp3
```

### Icons for PWA
Generate proper icons for your PWA using a tool like:
- [Real Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://progressier.com/pwa-icons-and-splash-screen-generator)

Then replace the placeholder icons in `public/icons/`.
