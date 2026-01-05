# Tailwind Color Configuration

## Color Choices

- **Primary (verde-uva):** `#143F3B` — Used for logo, active nav items, primary buttons, links
- **Secondary (paper):** `#EBEBEB` — Used for light backgrounds, hover states, secondary buttons
- **Neutral (gris-tinta):** `#2E2E2E` — Used for body text, headings, borders

## Tailwind Config Extension

Add these colors to your `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'verde-uva': {
          50: '#f0f7f6',
          100: '#d9ece9',
          200: '#b3d9d4',
          300: '#8dc6be',
          400: '#4a8f86',
          500: '#2d6b63',
          600: '#1e5048',
          700: '#143f3b', // Primary
          800: '#0f2f2c',
          900: '#0a1f1d',
        },
        'paper': {
          50: '#ffffff',
          100: '#f9f9f9',
          200: '#f3f3f3',
          300: '#ebebeb', // Secondary
          400: '#e0e0e0',
          500: '#d4d4d4',
          600: '#bdbdbd',
          700: '#9e9e9e',
          800: '#757575',
          900: '#616161',
        },
        'gris-tinta': {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#808080',
          500: '#666666',
          600: '#4d4d4d',
          700: '#333333',
          800: '#2e2e2e', // Neutral
          900: '#1a1a1a',
        },
      },
    },
  },
}
```

## Usage Examples

### Primary Button
```jsx
<button className="bg-verde-uva-700 hover:bg-verde-uva-800 text-white px-4 py-2 rounded-lg">
  Inscribirme
</button>
```

### Secondary Button
```jsx
<button className="bg-paper-300 hover:bg-paper-400 text-gris-tinta-800 px-4 py-2 rounded-lg">
  Ver más
</button>
```

### Text Styles
```jsx
<h1 className="text-gris-tinta-800 font-semibold">Título</h1>
<p className="text-gris-tinta-500">Texto secundario</p>
```

### Sidebar Navigation
```jsx
{/* Active item */}
<a className="bg-verde-uva-700/10 text-verde-uva-700 font-medium">
  Dashboard
</a>

{/* Inactive item */}
<a className="text-gris-tinta-600 hover:bg-paper-200">
  Cursos
</a>
```

### Cards
```jsx
<div className="bg-white border border-paper-300 rounded-xl shadow-sm">
  <h3 className="text-gris-tinta-800">Card Title</h3>
  <p className="text-gris-tinta-500">Description</p>
</div>
```

### Badges
```jsx
{/* Course type badge */}
<span className="bg-verde-uva-100 text-verde-uva-700 px-2 py-0.5 rounded text-sm">
  WSET
</span>

{/* Status badge */}
<span className="bg-paper-200 text-gris-tinta-600 px-2 py-0.5 rounded text-sm">
  Borrador
</span>
```
