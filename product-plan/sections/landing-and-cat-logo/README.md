# Landing & Catálogo

## Overview

Página de entrada principal de Tinta Academy con un hero cinematográfico con video de fondo, filtros rápidos integrados y un catálogo completo de cursos. Diseño minimalista y premium que refleja la sofisticación del mundo del vino.

## User Flows

- Usuario llega → ve hero con video atmosférico y propuesta de valor → usa chips de filtro rápido para seleccionar modalidad/tipo → hace scroll al catálogo filtrado
- Usuario explora catálogo → ve próximos cursos primero, finalizados después → aplica filtros adicionales (modalidad, tags, tipo) → hace clic en curso → va a página de detalle
- Usuario quiere registrarse → hace clic en "Iniciar Sesión" o "Registrarse" en header → va a auth flow
- Usuario busca información → hace scroll al footer → encuentra contacto, redes, info WSET, links legales, newsletter

## Design Decisions

- **Hero cinematográfico:** Video de fondo con overlay gradiente para impacto visual inmediato
- **Filtros rápidos:** Chips integrados en el hero para filtrado sin scroll
- **Catálogo dividido:** Próximos cursos arriba, finalizados abajo (con colapso)
- **Cards informativos:** Toda la info relevante visible (precio, fecha, educador, cupos)
- **Footer completo:** Múltiples columnas con links, newsletter, redes sociales

## Data Used

**Entities:** Course, Educator, Tag, HeroContent, FooterLinks, ContactInfo

**From global model:**
- Course (with modality, type, status, pricing)
- Educator (name, title, image)
- Tag (for filtering)

## Visual Reference

See `landing-catalogo.png` for the target UI design.

## Components Provided

- `LandingCatalogo` — Main orchestrating component
- `Header` — Public navigation with auth buttons
- `Hero` — Video background with headline and filters
- `CourseCatalog` — Grid with upcoming/past sections
- `CourseCard` — Individual course display
- `Footer` — Links, newsletter, contact info

## Callback Props

| Callback | Description |
|----------|-------------|
| `onViewCourse` | Called when user clicks to view course details |
| `onFilter` | Called when user applies filters |
| `onHeroCTA` | Called when user clicks hero CTA button |
| `onSubscribe` | Called when user subscribes to newsletter |
| `onNavigate` | Called when user clicks navigation links |
| `onLogin` | Called when user clicks login button |
| `onRegister` | Called when user clicks register button |
