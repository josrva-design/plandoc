# Guía de Jerarquías de Color

Sistema de colores para DocFitness. Todos los valores usan variables CSS de `docfitness-tokens.css` o `src/index.css`.

---

## 1. Paleta base

| Variable | Hex | Rol |
|---|---|---|
| `--blue` | `#0066CC` | Primario. Botones, enlaces, iconos activos, pills de acción, badge de video. |
| `--deep` | `#0D2640` | Base oscura. Títulos, cabeceras, texto principal, fondos de alto énfasis. |
| `--green` | `#2E9E70` | Éxito. Checkmarks, estados positivos, badges de confirmación. |
| `--amber` | `#F59E0B` | Advertencia. Triserie, bloque ESPECÍFICO, badges de atención. |
| `--red` | `#EF4444` | Peligro. Eliminar, errores, bloque PROHIBIDO. |
| `--purple` | `#8B5CF6` | Secundario. Superserie, badges contextuales. |
| `--white` | `#FFFFFF` | Fondo general, texto sobre color primario/oscuro. |
| `--gray` | `#E8E8E8` | Bordes, fondos sutiles, divisores. |
| `--light` | `#F8F9FA` | Fondo de superficie, campos de formulario. |
| `--hover` | `#FAFBFD` | Hover de filas de tabla y cards. |
| `--gray-medium` | `#6b7280` | Texto secundario, subtítulos. |

---

## 2. Jerarquía de superficie (de más claro a más oscuro)

| Nivel | Token | Uso |
|---|---|---|
| **Base** | `var(--white)` / `var(--bg-base)` | Fondo general de la app, tarjetas blancas. |
| **Elevada** | `var(--bg-elevated)` / `var(--surface)` | Cards con sombra, paneles flotantes, dropdowns. |
| **Sutil** | `var(--bg-subtle)` / `var(--gray-soft)` | Filas de tabla alternadas, fondos de pills, badges. |
| **Muted** | `var(--light)` | Campos de input, bloques de código, estados inactivos. |

---

## 3. Jerarquía de texto (de mayor a menor énfasis)

| Nivel | Token | Uso | Ejemplo |
|---|---|---|---|
| **Primario** | `var(--text-primary)` / `var(--deep)` | Títulos, valores numéricos, texto principal de tarjetas. | H1, H2, `.typo-value-md`. |
| **Secundario** | `var(--text-secondary)` | Descripciones, texto de apoyo, labels de datos. | Subtítulos, celdas de tabla descriptivas. |
| **Muted** | `var(--text-muted)` / `var(--gray-medium)` | Placeholders, hints, metadata, fechas. | `.label`, texto en opacity reducida. |
| **Sobre color claro** | `var(--white)` | Texto sobre fondos oscuros (`--deep`, `--blue`, `--green`). | Pills `.pill-deep`, headers de tabla `.table-header`. |
| **Sobre color primario** | `var(--white)` | Texto sobre `--blue` o `--primary`. | Botón primario, badge de video. |

---

## 4. Jerarquía de acciones

| Nivel | Token | Uso | Estado |
|---|---|---|---|
| **Primaria** | `--blue` / `--primary` | CTA principal, botón "Guardar", navegación activa. | Fondo `--blue`, texto `--white`. |
| **Secundaria** | `--gray` / `--light` | Botones secundarios, enlaces de acción. | Fondo `--gray` o `--light`, texto `--deep`. |
| **Peligro** | `--red` / `--danger` | Eliminar, borrar, acciones destructivas. | Fondo `--red`, texto `--white`. |
| **Éxito** | `--green` | Confirmar, aceptar, acciones positivas. | Fondo `--green`, texto `--white`. |
| **Advertencia** | `--amber` | Llamadas de atención sin ser error. | Fondo `--amber`, texto oscuro. |

---

## 5. Jerarquía de borders y dividers

| Nivel | Token | Uso |
|---|---|---|
| **Estándar** | `var(--border)` → `1px solid var(--gray)` | Bordes de cards, inputs, tablas. |
| **Énfasis bajo** | Borde con `var(--color-amber-light)` | Secciones destacadas como regla fija. |
| **Énfasis medio** | `var(--red-light)` | Secciones de advertencia o restricciones. |
| **Énfasis alto** | Left border `3px solid var(--blue)` | Sección activa de perfil, bloques de código. |
| **Divisor** | `--section-divider` → `1px solid #E8E8E8` | Separador horizontal entre secciones de contenido. |

---

## 6. Jerarquía de badges y pills

| Tipo | Estilo | Uso |
|---|---|---|
| **Pill primaria** | `bg-[var(--blue)] text-[var(--white)]` | Acción principal, video, estado activo. |
| **Pill oscura** | `bg-[var(--deep)] text-[var(--white)]` | Categoría de contenido, numeración. |
| **Pill verde** | `bg-[var(--green)] text-[var(--white)]` | Confirmación, estado completado. |
| **Pill gray** | `bg-[var(--gray)] text-[var(--deep)]` | Estato neutral, secundario. |
| **Pill amber** | `bg-[var(--amber-light)] text-[var(--amber-dark)]` | ESPECÍFICO, triserie, bloque de atención. |
| **Pill danger** | `bg-[var(--danger-light)] text-[var(--danger-dark)]` | PROHIBIDO, error, bloque restringido. |
| **Pill emerald** | `bg-[var(--emerald-50)] text-[var(--green)] border border-[var(--emerald-100)]` | Estado positivo, alimento libre. |
| **Pill blue** | `bg-[var(--blue-50)] text-[var(--blue)] border border-[var(--blue-100)]` | Estado informativo, flex. |

---

## 7. Jerarquía de icons (lucide-react)

| Icono | Color token | Contexto |
|---|---|---|
| `<List />` | `var(--deep)` | Encabezados de sección, título de guía. |
| `<AlertTriangle />` | `var(--amber)` | Advertencias, "no negociables". |
| `<Check />` | `var(--green)` | Estado positivo, checkmark en badge. |
| `<X />` | `var(--danger)` | Eliminar, error, restricción, cierre. |
| `<GlassWater />` | `var(--blue)` | Bebidas, hidratación. |
| `<Flame />` | `var(--red)` | Salsas, picante, elementos fuertes. |
| `<Droplets />` | `var(--blue)` | Sazonadores, líquidos libres. |
| `<Scale />` | `var(--deep)` | Peso, báscula, medición. |
| `<Ruler />` | `var(--deep)` | Unidades de medida. |
| `<CookingPot />` | `var(--accent)` | Aceites, grasas, cocción. |
| `<Plus />` | `var(--deep)` | Expandir, agregar, FAQ abierto. |
| `<Minus />` | `var(--gray-medium)` | Contraer, FAQ cerrado. |

---

## 8. Reglas de uso

### Prohibido
- Usar hex directo (`#0066CC`, `#0D2640`) en componentes. Siempre `var(--token)`.
- Usar `opacity` para cambiar el color de texto (usar `--text-muted` o `--text-secondary`).
- Mezclar tokens de diferentes sistemas (Tailwind `gray-*` con CSS custom properties).

### Obligatorio
- Si se necesita un nuevo tono, agregar el token en `docfitness-tokens.css` y documentarlo en `tokens.md`.
- Todos los colores en `GuideSection` y secciones similares deben usar `var(--color-*)`.
- Los iconos deben ser SVG de lucide-react, nunca emoji.

### Orden de preferencia para colores de fondo
1. `var(--bg-base)` → blanco puro para tarjetas.
2. `var(--bg-elevated)` → gris muy claro para superficies elevadas.
3. `var(--bg-subtle)` → gris claro para filas alternadas, pills.
4. `var(--light)` → gris sutil para campos, bloques de código.
5. Color primario (`--blue`, `--green`, `--amber`, `--red`) → solo para badges, pills y CTAs.

---

## 9. Proporción de color (regla 60/25/10/5)

```
60%  var(--blue)     → Primario (acciones, navegación, enlaces)
25%  var(--deep)     → Base oscura (texto, headers, énfasis)
10%  var(--green)    → Éxito (confirmaciones, checkmarks, states)
 5%  var(--gray)     → Neutral (bordes, fondos, divisores)
```

El resto (`--amber`, `--red`, `--purple`) se usa solo para estados y badges contextuales.