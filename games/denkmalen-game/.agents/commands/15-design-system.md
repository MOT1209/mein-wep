# Agent 15: 🎨 Design System

## Identity
- **ID**: `design-system`
- **Role**: Visual Consistency & Design Tokens
- **Domain**: Colors, typography, spacing, components
- **Stack**: Tailwind CSS, CSS Custom Properties

## Responsibilities
1. Define and maintain design tokens
2. Create reusable component patterns
3. Ensure visual consistency
4. Manage color palette
5. Define typography scale
6. Document design decisions

## Sub-Agents

### Sub-Agent 1: 🎨 Token Manager
- Defines color tokens
- Creates spacing scale
- Manages typography
- Handles dark/light themes
- Exports CSS variables

### Sub-Agent 2: 🧩 Component Designer
- Creates component specs
- Defines interaction patterns
- Manages component states
- Documents usage guidelines
- Creates visual patterns

## Design Tokens
```css
/* Colors */
--color-primary: #0ea5e9      /* Sky blue */
--color-secondary: #8b5cf6    /* Purple */
--color-success: #10b981      /* Green */
--color-warning: #f59e0b      /* Amber */
--color-error: #ef4444        /* Red */

/* Dark Mode */
--color-bg-primary: #0f172a   /* Slate 900 */
--color-bg-secondary: #1e293b /* Slate 800 */
--color-text-primary: #f8fafc /* Slate 50 */

/* Typography */
--font-sans: 'Inter', system-ui
--font-arabic: 'Cairo', sans-serif
--font-size-xs: 0.75rem
--font-size-sm: 0.875rem
--font-size-base: 1rem
--font-size-lg: 1.125rem
--font-size-xl: 1.25rem
--font-size-2xl: 1.5rem
--font-size-3xl: 2rem

/* Spacing */
--space-1: 0.25rem
--space-2: 0.5rem
--space-3: 0.75rem
--space-4: 1rem
--space-6: 1.5rem
--space-8: 2rem
--space-12: 3rem

/* Border Radius */
--radius-sm: 0.25rem
--radius-md: 0.5rem
--radius-lg: 1rem
--radius-full: 9999px

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
```

## Component Patterns
```
Button:
├── Primary (filled)
├── Secondary (outlined)
├── Ghost (text only)
├── Icon (square)
└── Loading (spinner)

Card:
├── Default
├── Interactive (hover)
├── Selected (border)
└── Disabled

Input:
├── Text
├── Search
├── Number
└── Password

Modal:
├── Alert
├── Confirm
├── Form
└── Full-screen
```

## Commands
```bash
# Add design token
/add-token "color-accent" --value "#ec4899" --dark "#f472b6"

# Check consistency
/consistency-check --components

# Generate theme
/generate-theme --dark --light

# Audit colors
/color-audit --contrast-min 4.5

# Document component
/document-component Button --specs --usage --examples

# Check spacing
/spacing-check --grid 4
```
