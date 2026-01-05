# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

For Geist, you'll need to install it via npm or download from Vercel:

```bash
npm install geist
```

Or use the CDN:

```html
<link href="https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css" rel="stylesheet">
```

## CSS Configuration

```css
:root {
  --font-heading: 'Geist', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-body: 'Geist', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'IBM Plex Mono', 'Fira Code', 'Consolas', monospace;
}

body {
  font-family: var(--font-body);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 600;
}

code, pre, .mono {
  font-family: var(--font-mono);
}
```

## Tailwind Configuration

```javascript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Fira Code', 'monospace'],
      },
    },
  },
}
```

## Font Usage

### Headings
- **Font:** Geist
- **Weight:** 600 (semibold)
- **Usage:** Page titles, section headers, card titles

### Body Text
- **Font:** Geist
- **Weight:** 400 (regular)
- **Usage:** Paragraphs, descriptions, form labels

### Code & Technical
- **Font:** IBM Plex Mono
- **Weight:** 400 (regular), 500 (medium)
- **Usage:** Code snippets, order numbers, technical data

## Type Scale

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Labels, helper text |
| `text-sm` | 14px | Secondary text, metadata |
| `text-base` | 16px | Body text |
| `text-lg` | 18px | Lead paragraphs |
| `text-xl` | 20px | Card titles |
| `text-2xl` | 24px | Section headings |
| `text-3xl` | 30px | Page titles |
| `text-4xl` | 36px | Hero text |
| `text-5xl` | 48px | Landing hero headline |

## Examples

```jsx
{/* Hero headline */}
<h1 className="text-5xl font-semibold text-gris-tinta-800">
  Descubrí el mundo del vino
</h1>

{/* Section title */}
<h2 className="text-2xl font-semibold text-gris-tinta-800">
  Próximos Cursos
</h2>

{/* Card title */}
<h3 className="text-xl font-semibold text-gris-tinta-800">
  WSET Nivel 1
</h3>

{/* Body text */}
<p className="text-base text-gris-tinta-600">
  Curso de certificación internacional...
</p>

{/* Order number */}
<span className="font-mono text-sm text-gris-tinta-500">
  TA-2024-0892
</span>
```
