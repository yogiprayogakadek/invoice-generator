---
name: Invoice Generator
description: A local, print-first A4 invoice desk in cool sky blue.
colors:
  sky-100: "#f0f9ff"
  sky-200: "#e0f2fe"
  sky-300: "#bae6fd"
  sky-400: "#38bdf8"
  sky-500: "#0ea5e9"
  sky-600: "#0284c7"
  sky-700: "#0369a1"
  sky-800: "#075985"
  sky-900: "#0c4a6e"
  page: "#f8fbfe"
  paper: "#ffffff"
  panel-soft: "#f3f9fd"
  ink: "#0f172a"
  ink-soft: "#334155"
  muted: "#5a6b80"
  line: "#e2eef7"
  line-strong: "#cfe3f1"
  success: "#10b981"
  success-ink: "#065f46"
  success-soft: "#d1fae5"
  danger: "#ef4444"
  danger-ink: "#991b1b"
  danger-soft: "#fee2e2"
  warning: "#d97706"
  warning-ink: "#92400e"
  warning-soft: "#fef3c7"
  warning-wash: "#fffbeb"
  warning-border: "#fcd34d"
typography:
  display:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.18em"
  headline:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  headline-sm:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  empty-title:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  dialog-title:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  total:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  control:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "0em"
  body-sm:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0em"
  body-xs:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0em"
  caption:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0em"
  label:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.04em"
  label-sm:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.04em"
  paper-label:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "9px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.04em"
  paper-status:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "8.5px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.06em"
rounded:
  hairline: "2px"
  xs: "7px"
  sm: "8px"
  button-sm: "9px"
  md: "10px"
  lg: "12px"
  panel-mobile: "14px"
  dialog: "16px"
  xl: "18px"
  pill: "999px"
  paper-sm: "2mm"
  paper-md: "2.5mm"
spacing:
  "2xs": "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "28px"
  "2xl": "32px"
  "3xl": "44px"
components:
  button-primary:
    backgroundColor: "{colors.sky-700}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.sky-800}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    height: "44px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  nav-item-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.sky-800}"
    rounded: "{rounded.sm}"
    height: "44px"
  status-pill:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success-ink}"
    rounded: "{rounded.pill}"
    padding: "3px 8px"
  invoice-total:
    backgroundColor: "{colors.sky-700}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
---

# Design System: Invoice Generator

## Overview

**Creative North Star: "The Sky-Lit Paper Desk"**

**Design Read:** Reading this as a local invoice desk for Indonesian small-business owners, in a minimal sky-blue paper-desk language, dial ENERGY 1 / RHYTHM 1 / MOTION 1.

**Dials: ENERGY 1 / RHYTHM 1 / MOTION 1.** The tool is calm by design: a predictable form, one paper focal point, and hover-state motion only.

Invoice Generator is a quiet work desk where the invoice is the brightest object. The form is a compact instrument on the left; the A4 paper is the product on the right. Every screen keeps that relationship: the user writes, the paper answers. The interface avoids dashboard chrome, card mosaics, and decorative motion because the document itself carries the visual weight.

The palette is one cool sky family over paper white, with slate ink and status-only green, red, and amber. Depth is restrained: hairline borders and tonal layers hold the work surface, while only the paper and modal surfaces lift with a soft ambient shadow. The paired sky gradient strips at the top and bottom edges of the paper and the deep-sky total block are the two signature moments.

**Key Characteristics:**
- Paper-first two-column desk: a 560 px form and a fluid A4 preview.
- One sky family, with deep sky reserved for the primary action and the total.
- Hairline borders, 8 to 18 px radii, tabular numerals for every amount.
- System sans by design, for reliable offline and `file://` rendering.
- Print is a first-class output: A4, repeated table headers, unbroken rows.

## Colors

A cool, narrow palette: sky blue does the identity work, slate does the reading work, and green, red, and amber appear only when they carry meaning.

### Primary
- **Deep Sky** (`#0369a1`): the primary button, the invoice table header gradient, and the total block. This is the only large saturated surface in the product.
- **Signal Sky** (`#0284c7`): focus rings, links, active navigation text, and the stronger end of the paper strip.
- **Sky Wash** (`#f0f9ff`): save-state pills, notices, active mobile navigation, and quiet selected states.

### Neutral
- **Paper White** (`#ffffff`): form panels, inputs, and the invoice sheet.
- **Page Mist** (`#f8fbfe`): the desk behind the paper.
- **Panel Soft** (`#f3f9fd`): account rows, logo wells, and inset panels.
- **Slate Ink** (`#0f172a`): headings and primary text.
- **Soft Slate** (`#334155`): body copy and table values.
- **Muted Slate** (`#5a6b80`): hints, labels, and secondary metadata. It clears 4.5:1 on the lightest sky surfaces.
- **Hairline** (`#e2eef7`) and **Strong Hairline** (`#cfe3f1`): borders and dividers.

### Semantic
- **Paid Green** (`#10b981`, ink `#065f46`, wash `#d1fae5`): paid and sent status.
- **Alert Red** (`#ef4444`, ink `#991b1b`, wash `#fee2e2`): validation, destructive actions, and overdue status.
- **Warm Amber** (`#92400e`, wash `#fef3c7`): calculation warnings and due-soon notes.

### Named Rules
**The Paper Is The Accent Rule.** Deep sky is for the primary action and the total. It never becomes a page-wide wash, a card background, or a decorative heading color.

**The Status Color Rule.** Green, red, and amber appear only on status, validation, or destructive controls. They are not part of the brand palette.

## Typography

**Display Font:** Inter, with Segoe UI and the system sans as the shipped fallback.
**Body Font:** the same stack.
**Label Font:** the same stack, uppercase for micro-labels.

**Character:** neutral, compact, and document-like. The type should disappear into the task and make the numbers easy to compare. Inter and Poppins are the preferred faces from the product brief; because this build must open from `file://` with no external assets, the system fallback is the reliable shipped voice, not a hidden default.

### Hierarchy
- **Display** (700, 28 px, line-height 1, 0.18em tracking): the word INVOICE on the paper only.
- **Headline** (700, 24 px, line-height 1.2, -0.035em): page titles such as "Invoice baru" and "Riwayat invoice".
- **Title** (700, 15 px, line-height 1.3, -0.015em): form section headings and the business name on the paper.
- **Body** (400, 14 px, line-height 1.5): form copy, history rows, and profile fields. Controls run at 12.5 to 13.5 px.
- **Label** (700, 11 px, 0.04em tracking, uppercase): item micro-labels, invoice field labels, and table headers.

### Named Rules
**The Tabular Money Rule.** Every amount, quantity, date, and invoice number uses tabular numerals. Numbers must align vertically before they can be trusted.

**The One Display Rule.** Wide-tracked uppercase is reserved for the invoice wordmark and document labels. It never becomes the voice of the app chrome.

## Layout

The desktop editor is a two-column grid: `minmax(0, 560px)` for the form and `minmax(0, 1fr)` for the preview, with a 28 px gap inside a 1560 px container. The top bar is 68 px tall and sticky. The form panel is a single white surface with 28 px padding and 18 px radius. The preview panel is sticky at 92 px from the top, capped at `calc(100vh - 92px)`, and scrolls internally while the paper stays at its true A4 width.

At 1180 px the form narrows to 520 px and the gap to 20 px. At 900 px the layout becomes a single column with Form and Pratinjau tabs; the preview is hidden until selected. At 720 px item rows become two-column cards and field grids collapse to one column. At 480 px the page padding drops to 16 px and the fixed bottom navigation appears.

Spacing follows a 4 px base: 4, 8, 12, 16, 20, 24, 28, 32, and 44 px for touch targets. Form sections are separated by 24 px, with more space above a heading than below it. The paper uses its own millimeter rhythm: 6 mm strips at the top and bottom edges, 11 mm top padding, 13 mm side padding, 9 mm bottom padding.

## Elevation & Depth

The system is flat by default. Hairline borders and tonal layers separate the form from the desk. The A4 paper is the one object that lifts: `0 24px 60px rgba(15, 23, 42, 0.1), 0 4px 12px rgba(15, 23, 42, 0.04)`. Panels use a 1 px ambient shadow, and dialogs use `0 24px 60px rgba(15, 23, 42, 0.2)`. There are no colored glows except the focus ring on inputs.

### Shadow Vocabulary
- **Paper lift** (`0 24px 60px rgba(15, 23, 42, 0.1), 0 4px 12px rgba(15, 23, 42, 0.04)`): the A4 preview only.
- **Panel rest** (`0 1px 2px rgba(15, 23, 42, 0.03)`): form and profile panels.
- **Dialog lift** (`0 24px 60px rgba(15, 23, 42, 0.2)`): modal panels above the backdrop.

### Named Rules
**The Paper Lifts Rule.** Only the invoice paper and modal surfaces carry a large shadow. Form panels stay flat; if everything floats, the paper stops being the object.

## Shapes

Corners are controlled and varied: 8 px for chips and navigation, 10 px for buttons and inputs, 12 px for account rows and history rows, 18 px for the main form and profile panels, and a full pill for status and save-state badges. The invoice sheet is a sharp-cornered A4 rectangle; its paired 6 mm sky gradient strips are the brand signature, not a rounded card.

Borders are 1 px hairlines, with dashed rules for the logo well and the invoice terms divider. There are no one-sided accent bars, no glass panels, and no oversized radii on structural surfaces.

## Components

### Buttons
- **Shape:** 10 px radius, 44 px minimum height, 13 px semibold label.
- **Primary:** deep sky background, white text, subtle sky shadow; hover darkens to sky-800, active presses down 1 px.
- **Ghost:** white background, strong hairline border, slate text; hover gains a sky wash.
- **Danger:** red ink on white for destructive row actions.

### Chips
- **Style:** 8 px radius, 44 px height, white background, hairline border, muted semibold text.
- **State:** selected chips gain a sky wash, sky border, and deep-sky text. They are quick-date actions, not filters.

### Panels
- **Corner Style:** 18 px radius for the main form and profile panels, 12 px for nested account and history rows.
- **Background:** paper white; the preview panel uses a top-to-bottom sky wash.
- **Shadow Strategy:** panel rest only; the paper carries the large lift.
- **Border:** 1 px hairline.
- **Internal Padding:** 24 to 28 px on desktop, 20 px on small screens.

### Inputs and Fields
- **Style:** 44 px height, 10 px radius, white background, strong hairline border, 13.5 px text.
- **Focus:** sky border plus a 3 px translucent sky ring. The native outline is replaced, not removed.
- **Error:** red border and a soft red ring, with an inline message below the field.
- **Disabled:** reduced opacity and a not-allowed cursor.

### Navigation
- **Desktop:** a centered segmented nav inside the top bar. Items are 44 px tall, 12.5 px semibold, with a white active pill and a soft shadow.
- **Mobile:** a fixed 64 px bottom bar with three icon-and-label items at 11 px. The active item uses a sky wash.
- **Focus:** a 2 px sky outline with 2 px offset on every focusable control.

### Invoice Paper
The signature component. A true 210 x 297 mm sheet, white, with paired 6 mm sky gradient strips at the top and bottom edges, a business header, a deep-sky table header, tabular amounts, a terbilang block, a right-aligned totals stack, and a deep-sky total block. The footer is anchored to the bottom of the sheet so short invoices still read as complete documents. Print rules repeat the table header and keep rows and totals unbroken.

### Status Pill
A real state label, not decoration. Paid and sent use green, draft uses slate, overdue uses red. The pill is 999 px radius with an 8 to 11 px uppercase label, sized for the surface it sits on.

## Do's and Don'ts

### Do:
- **Do** keep the paper the brightest and largest object on the editor screen.
- **Do** reserve deep sky for the primary action and the total block.
- **Do** use tabular numerals for every amount and invoice number.
- **Do** keep touch targets at 44 px, including chips, icon buttons, and history actions.
- **Do** keep the system sans stack, because the app must render offline from `file://`.
- **Do** test print output at A4 with background graphics enabled.

### Don't:
- **Don't** add a dashboard, KPI cards, or a card mosaic around the invoice.
- **Don't** turn the sky palette into a page-wide gradient or a purple-blue AI gradient.
- **Don't** use pill shapes for ordinary buttons or inputs; pills are for status and save-state badges.
- **Don't** use a colored left stripe, a glass panel, or a glow on cards.
- **Don't** replace the A4 preview with a generic responsive card. The paper is the product.
- **Don't** add motion beyond the 160 ms state transitions already used.
