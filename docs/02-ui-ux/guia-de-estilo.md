# Guía de estilo — Podio

Sistema de diseño de la aplicación. Todos los valores viven como **variables CSS (design tokens)** en [`client/src/styles/tokens.css`](../../client/src/styles/tokens.css); ningún componente usa colores sueltos.

## 1. Principios

| Principio | Qué significa en Podio |
|---|---|
| **Legible al sol** | Contraste alto (WCAG AA como mínimo) porque el juez usa la app a orillas del agua |
| **Mobile-first** | Se diseña primero para 375 px; el escritorio amplía, no al revés |
| **Deportivo y confiable** | Azul marino (agua profunda) y cian (piscina) transmiten confianza; el naranja (pista de atletismo) marca las acciones clave |
| **Números claros** | Tiempos y marcadores con números tabulares para que las cifras queden alineadas |
| **Accesible por defecto** | Etiquetas visibles, foco visible, objetivos táctiles de 44 px y movimiento reducido |

## 2. Color

### Modo claro

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `--color-bg` | `#f6f8fb` | Fondo de la página | — |
| `--color-surface` | `#ffffff` | Tarjetas, formularios | — |
| `--color-surface-2` | `#eef2f7` | Fondos secundarios, hover | — |
| `--color-border` | `#d5dde8` | Bordes y divisores | — |
| `--color-text` | `#0f1b2d` | Texto principal | 16.9 : 1 |
| `--color-text-muted` | `#4a5b72` | Texto secundario | 7.1 : 1 |
| `--color-brand` | `#0b2545` | Marca, barra lateral, pie | — |
| `--color-primary` | `#0c6b80` | Botón principal, enlaces | 5.9 : 1 con blanco |
| `--color-accent` | `#c2410c` | Acción destacada (Inscríbete) | 5.2 : 1 con blanco |
| `--color-success` | `#15803d` | Estado correcto, inscripciones abiertas | — |
| `--color-danger` | `#b91c1c` | Errores | — |

### Modo oscuro

Se activa automáticamente según la preferencia del sistema, o con el botón de luna/sol de la barra. No es una inversión automática: cada color tiene su valor oscuro propio y se verificó por separado.

| Token | Valor oscuro | Nota |
|---|---|---|
| `--color-bg` | `#070f1e` | — |
| `--color-surface` | `#0f1a2e` | — |
| `--color-text` | `#e8eef7` | — |
| `--color-primary` | `#38c7dc` | Con texto oscuro `#04121c` encima |
| `--color-accent` | `#fb923c` | Con texto oscuro `#1f0d00` encima (el blanco no alcanzaba AA) |

## 3. Tipografía

| Rol | Familia | Pesos | Uso |
|---|---|---|---|
| Títulos | **Barlow Semi Condensed** | 600, 700 | Títulos, cifras del dashboard, tiempos; recuerda a los marcadores deportivos |
| Texto | **Inter** (variable) | 400 – 700 | Párrafos, formularios, tablas |

Las fuentes se incluyen en la app (paquetes `@fontsource`), así que funcionan sin conexión.

| Token | Tamaño | Uso |
|---|---|---|
| `--text-xs` | 13 px | Etiquetas pequeñas, insignias |
| `--text-sm` | 14 px | Texto secundario, tablas |
| `--text-base` | 16 px | Texto normal y campos (evita el zoom automático en iOS) |
| `--text-xl` | 22 px | Títulos de tarjeta |
| `--text-3xl` | 36 px | Títulos de página |
| `--text-4xl` | 40 – 60 px | Título principal de la portada (fluido) |

## 4. Espaciado, bordes y sombras

- Escala de espaciado de **4 px**: `--space-1` (4 px) a `--space-20` (80 px).
- Radios: `--radius-sm` 6 px, `--radius-md` 10 px (botones, campos), `--radius-lg` 16 px (tarjetas).
- Sombras suaves (`--shadow-sm`, `--shadow-md`, `--shadow-lg`), más intensas en modo oscuro.

## 5. Componentes

| Componente | Variantes | Reglas |
|---|---|---|
| **Botón** | primary, accent, secondary, ghost, danger · md (44 px) y lg (52 px) | Estado de carga con indicador; deshabilitado con opacidad 60 % |
| **Campo** | texto, correo, fecha, lista, contraseña con botón para mostrarla | Etiqueta siempre visible; asterisco en obligatorios; error debajo del campo |
| **Alerta** | error, success, info, warning | Los errores se anuncian a lectores de pantalla (`role="alert"`) |
| **Tarjeta de torneo** | — | Bloque de calendario, estado, sede, fechas, deportes |
| **Indicador (stat card)** | — | Etiqueta, cifra grande, ayuda, ícono |
| **Diálogo** | — | Se cierra con Escape o clic fuera; el foco queda atrapado dentro |
| **Gráfico de barras** | una serie | Un solo color, barras finas, valores visibles, tooltip y tabla accesible |

Íconos: familia **Lucide** (SVG, trazo uniforme). No se usan emojis como íconos dentro de la interfaz.

## 6. Accesibilidad

- Contraste AA verificado en ambos temas.
- Foco visible en todos los controles (`--focus-ring`).
- Enlace "Saltar al contenido" al inicio de cada página.
- Objetivos táctiles de al menos **44 × 44 px**.
- Respeta `prefers-reduced-motion`: se desactivan las animaciones.
- Formularios: foco automático en el primer campo con error.

## 7. Movimiento

| Token | Duración | Uso |
|---|---|---|
| `--dur-fast` | 120 ms | Hover de botones |
| `--dur-base` | 200 ms | Tarjetas, flechas |
| `--dur-slow` | 320 ms | Diálogos, menú lateral |
