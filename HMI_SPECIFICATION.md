# HMI Specification – Area Overview

Version: 1.0  
Date: 2026-04-30  
Repository: `mad4j/hmi-demo`

---

## 1. Purpose

This document provides a high-level specification of the Human–Machine Interface (HMI) shell layout and its functional areas. Each area is described in terms of its visual position, dimensions, responsibilities, and the components that implement it.

---

## 2. High-Level Layout Diagram

The HMI occupies the full viewport. It is rendered by the `HmiShell` component using a CSS grid with four fixed row tracks. The diagram below represents the layout:

```
┌──────────────────────────────────────────────────────────────────┐
│  AREA 1 – HEADER                                    (3.5 rem)    │
│  ┌──────────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  Zone 1 Identity │  │  Zone 2      │  │  Zone 3 Comm +     │  │
│  │  SATURN-V        │  │  AES-256     │  │  [CommIcon]        │  │
│  │  NATO-BASELINE   │  │  NET-04      │  │  [Fault][GPS]...   │  │
│  │                  │  │  [NATO]      │  │                    │  │
│  └──────────────────┘  └──────────────┘  └────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│  AREA 2 – NOTIFICATION BAR                          (auto)       │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  [icon]  Message text                         [+N badge] │    │
│  └──────────────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────────┤
│  AREA 3 – CONTENT                                   (1 fr)       │
│                                                                  │
│  ┌ Home / Submenu screen ─────────────────────────────────────┐  │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                   │  │
│  │  │ Link │  │ Link │  │ Link │  │ Link │   (LinkWidget ×N)  │  │
│  │  │Widget│  │Widget│  │Widget│  │Widget│                   │  │
│  │  └──────┘  └──────┘  └──────┘  └──────┘                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌ Parameters page ───────────────────────────────────────────┐  │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                   │  │
│  │  │Param │  │Param │  │Param │  │Param │  (ParameterWidget) │  │
│  │  │Widget│  │Widget│  │Widget│  │Widget│                   │  │
│  │  └──────┘  └──────┘  └──────┘  └──────┘                   │  │
│  │                     ● ● ○ ○ ○   (panel dots, optional)     │  │
│  │  ┌──────────────┐  ┌──────────────┐   (transaction mode)  │  │
│  │  │   Reset (↺)  │  │   Submit (→) │                       │  │
│  │  └──────────────┘  └──────────────┘                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌ Settings page ─────────────────────────────────────────────┐  │
│  │  ┌──────────────────────────────┐                          │  │
│  │  │ Theme: DARK / LIGHT / NVIS   │   (enum selector widget) │  │
│  │  └──────────────────────────────┘                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  AREA 4 – FOOTER / TAB BAR                          (4.5 rem)    │
│  ┌──────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ ...        │
│  │  ←   │  │  🏠 Home │  │  Menu    │  │  Alarms  │            │
│  │ Back │  │          │  │(level-1) │  │(level-1) │            │
│  └──────┘  └──────────┘  └──────────┘  └──────────┘            │
└──────────────────────────────────────────────────────────────────┘
```

> **Responsive behaviour:** At viewport widths ≤ 600 px or heights ≤ 600 px the outer border and border-radius are removed so the shell fills the entire screen edge-to-edge.

---

## 3. Area Descriptions

### 3.1 Header (Area 1)

| Attribute   | Value                              |
|-------------|------------------------------------|
| Component   | `HmiHeader.vue`                    |
| Row height  | 3.5 rem (fixed)                    |
| Background  | `--bg-bar` (theme-dependent)       |
| Border      | Bottom border `--border`           |

**Content – three persistent zones (CSS grid: `1fr auto 1fr`):**

**Zone 1 – Identity (left)**
- Application label (`application.yaml → name`): persistent identifier, 0.75 rem, secondary colour.
- Active waveform name (`active_waveform_name`): 1 rem (16 px – HMI-REQ-011 compliant), primary colour, bold. Updated within 500 ms of waveform switch (HMI-REQ-047).
- Active preset name (`active_preset_name`): 0.875 rem (~14 px – minor deviation documented, space-constrained header), accent colour. Shows unsaved-changes marker when running config differs from saved preset (HMI-REQ-048).

**Zone 2 – Crypto (centre, monospace)**
- `crypto_algorithm`: cipher name (e.g. `AES-256`), 0.875 rem, bold, primary colour.
- `crypto_key_id`: key tag (e.g. `NET-04`), 0.875 rem, secondary colour.
- `crypto_context`: operational context badge (`NATO` blue / `NAZ` green), 0.875 rem.
Updated within 500 ms of any crypto state change (HMI-REQ-040).

**Zone 3 – Communication + Status Icons (right)**
- **Communication icon** (`IconCommState.vue`): single synthesised icon derived from `comm_state`, `comm_mode`, `comm_radio_silence`. Five variants with distinct colour coding:

  | Variant         | Trigger condition                        | Colour token                  |
  |-----------------|------------------------------------------|-------------------------------|
  | `idle-ct`       | IDLE + CT (cipher-text)                  | `--text-green` / ok bg        |
  | `idle-pt`       | IDLE + PT (plain-text) – ⚠ caution       | `--status-warning-color`      |
  | `rx`            | comm_state = RX                          | `--text-green` / active bg    |
  | `tx`            | comm_state = TX                          | `--text-blue` / active bg     |
  | `radio-silence` | comm_radio_silence = true – highest pri. | `--status-critical-color` + blink |

  Icon carries `aria-label` and `title` with full human-readable state text. Touch target: 3.2 rem × 3 rem (≥ 48 × 48 px – HMI-REQ-010 compliant).

- **Status Icon Bar** (`StatusIconBar.vue`): unchanged, four icon buttons driven by `platform-status-icons.yaml`:

  | Icon    | Parameter ID     | Targets page on click               |
  |---------|------------------|-------------------------------------|
  | Fault   | `status_fault`   | `allarmi` (Alarms)                  |
  | Channel | `status_channel` | `info` (System Info)                |
  | GPS     | `status_gps`     | `gps` (GPS settings)                |
  | Login   | `status_login`   | `login` / `logout`                  |

**Font-size compliance note (HMI-REQ-011):**
The waveform name is rendered at 1 rem = 16 px (fully compliant). Preset name and crypto rows are rendered at 0.875 rem ≈ 14 px. This is a minor deviation from the 16 px minimum, accepted as a design constraint due to the three-row density within a fixed-height header. Both values exceed the 3:1 large-text contrast threshold and remain readable at 50 cm in normal illumination conditions.

---

### 3.2 Notification Bar (Area 2)

| Attribute   | Value                                   |
|-------------|-----------------------------------------|
| Component   | `HmiNotificationBar.vue`                |
| Row height  | `auto` (min-height 2 rem)               |
| Background  | Severity-driven CSS variable            |

**Content and behaviour:**

- Displays a single line of contextual information at all times.
- In idle state it shows the current page label (e.g. `Menu / Air Conditioning`).
- When a system event occurs, the bar transitions to show the event message with a severity-coded background:

  | Severity  | Background token                    | Use case                             |
  |-----------|-------------------------------------|--------------------------------------|
  | MENU      | `--notification-normal-bg`          | Default; shows current menu path     |
  | NORMAL    | `--notification-normal-bg`          | Informational feedback               |
  | SUCCESS   | `--notification-success-bg`         | Command accepted / value committed   |
  | WARNING   | `--notification-warning-bg`         | Non-critical fault or caution        |
  | ERROR     | `--notification-error-bg`           | Command failure or critical fault    |

- A numeric badge (`+N`) appears on the right edge when additional messages are queued.
- Tapping the bar acknowledges and dismisses the active message; the next queued message (by priority) is shown.
- Messages auto-dismiss after 5 000 ms unless marked as `ACKNOWLEDGED`.
- Queued messages are served in priority order: ERROR > WARNING > SUCCESS > NORMAL > MENU.

---

### 3.3 Content Area (Area 3)

| Attribute   | Value                                     |
|-------------|-------------------------------------------|
| Component   | Default slot of `HmiShell.vue` (`<main>`) |
| Row height  | `1fr` (fills remaining height)            |
| Overflow    | `overflow-y: auto` (scrollable)           |
| Padding     | 0.75 rem                                  |

The content area renders one of three views depending on navigation state:

#### 3.3.1 Home / Submenu Screen

Shown when the user is at the root home screen or on a page that has visible sub-pages.

- Renders a responsive grid of **LinkWidgets** (`LinkWidget.vue`).
- Each tile shows an icon and a label; clicking navigates to the target page.
- Grid columns: 4 on wide screens (≥ 400 px), 3 on medium (399 px), 2 on small (< 400 px).

**Home screen pages** (from `application.yaml`):

| ID                   | Label           | Description                              |
|----------------------|-----------------|------------------------------------------|
| `app-climatizzazione`| Air Conditioning| Cabin temperature, humidity, ventilation |
| `app-porte`          | Doors           | Door lock states                         |
| `app-stato`          | Status          | Engine temp, CPU, bus status             |

**Platform-level menu pages** (from `platform-pages-*.yaml`), shown in the Footer tab bar and accessible from the home screen via the tab bar:

| ID              | Label    | Description                                                     |
|-----------------|----------|-----------------------------------------------------------------|
| `menu`          | Menu     | Top-level platform submenu (Air Conditioning, Doors, etc.)      |
| `allarmi`       | Alarms   | Read-only alarm flags for battery, engine, pressure, oil, etc.  |
| `info`          | Info     | System diagnostics: version, network, uptime, CPU temperature   |
| `impostazioni`  | Settings | Sub-pages: Theme, GPS, Login                                    |

#### 3.3.2 Parameters Page

Shown when the current page has parameters but no visible sub-pages (standard leaf page).

Implemented by `PageParametersView.vue`. Contains:

- **Widget grid** – a responsive grid of `ParameterWidget` tiles, one per parameter.  
  Supported parameter types:

  | Type         | Rendered as                       | Editable |
  |--------------|-----------------------------------|----------|
  | `boolean`    | ON / OFF toggle                   | ✓ (tap)  |
  | `number`     | Numeric value + unit              | ✗ (read-only by default) |
  | `percentage` | Numeric value + `%`               | ✓ (slider modal) |
  | `enum`       | Text badge (blue)                 | ✓ (picker modal) |
  | `text`       | Short string                      | ✓ (text input modal) |
  | `password`   | Masked (`•••`)                    | ✓ (password modal) |
  | `date`       | Formatted date (`dd/mm/yyyy`)     | ✓ (date picker modal) |

  Read-only parameters are visually dimmed (opacity 0.75) and show a lock icon.

- **Panel navigation** (optional) – when a page defines multiple panels, dot indicators appear below the grid. Panels can be switched by tapping a dot, swiping left/right, or using `ArrowLeft`/`ArrowRight` keyboard keys.

- **Transaction actions** (optional) – when `mode: transaction` is set on a page, two buttons appear at the bottom:
  - **Reset (↺)**: discards all staged changes, reverting to original values.
  - **Submit (→)**: commits all staged changes to the apparatus in a single atomic write. `Enter` key also submits when no editor modal is open.

  Modified parameters are highlighted with an amber border until committed.

#### 3.3.3 Settings Page (Theme Selector)

Shown when the current page ID is `tema`.

- Renders a single `ParameterWidget` (enum type) labelled **Theme**.
- Valid values: `DARK`, `LIGHT`, `NVIS`.
- Selecting a new value opens an `EnumEditorModal` and persists the choice in `localStorage` under the key `hmi-theme`.
- `NVIS` (Night Vision Imaging System) applies a deep-red, low-luminance palette targeting MIL-L-85762 NVG compatibility.

---

### 3.4 Footer / Tab Bar (Area 4)

| Attribute   | Value                              |
|-------------|------------------------------------|
| Component   | `HmiFooter.vue`                    |
| Row height  | 4.5 rem (fixed)                    |
| Background  | `--bg-bar` (theme-dependent)       |
| Border      | Top border `--border`              |

**Content (left to right):**

| Element             | Width       | Behaviour                                                      |
|---------------------|-------------|----------------------------------------------------------------|
| **Back button** (←) | 0.33× share | Navigates to the previous page in history stack. Disabled (opacity 0.45) when at the root. |
| **Home button** (🏠) | 1× share    | Returns to the home screen and clears the forward history.     |
| **Level-1 tab** ×N  | 1× share each | One tab per top-level platform page (all pages in `menuConfig.pages` that are not `hidden`). The active tab is highlighted with a top border accent. |

The Back button occupies one-third the width of a standard tab to preserve space for the level-1 tabs.

---

## 4. Navigation Model

```
                         [Home Screen]
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
       [Menu]             [Alarms]           [Settings]    ← level-1 pages (tab bar)
          │                                      │
    ┌─────┼──────┐                        ┌──────┼──────┐
    ▼     ▼      ▼                        ▼      ▼      ▼
  [A/C] [Doors] [...]                 [Theme] [GPS] [Login]
                  │
           (deep navigation)
                  │
          ┌───────┴────────┐
          ▼                ▼
   [Diagnostics]   [Commissioning]
```

- Navigation state is managed by `useMenuNavigation.js` (singleton).
- Breadcrumb information is maintained as a history stack enabling the Back button.
- Pages with `visibility: hidden` are reachable by direct page ID reference (e.g. `logout`) but do not appear as tiles or tabs.

---

## 5. Theming

Three themes are supported, selectable at runtime and persisted in `localStorage`:

| Theme | Key     | Description                                              |
|-------|---------|----------------------------------------------------------|
| Dark  | `dark`  | Default. Deep blue-grey background, white/green text.    |
| Light | `light` | White background, dark text. Standard day mode.          |
| NVIS  | `nvis`  | Deep red/near-IR palette for night-vision compatibility. |

All colour values are expressed as CSS custom properties (`--bg-main`, `--text-primary`, etc.) scoped to the `[data-theme]` attribute on the `HmiShell` root element, enabling instant full-application repainting without page reload.

---

## 6. Data Flow Summary

```
  ┌───────────────────┐       GET /api/parameters (REST)       ┌──────────────┐
  │  useParameterStore│ ──────────────────────────────────────► │              │
  │  (reactive store) │ ◄────────────────────────────────────── │   Apparatus  │
  │                   │       POST /api/parameters (REST)       │  (simulator  │
  │                   │ ──────────────────────────────────────► │   server or  │
  │                   │                                         │   real HW)   │
  │                   │ ◄────────────────────────────────────── │              │
  └───────────────────┘    SSE /api/notifications (push)        └──────────────┘
           │
           │ parameterValues (reactive)
           ▼
  ┌────────────────────────────────────────────┐
  │              UI Components                 │
  │  ParameterWidget · StatusIconBar           │
  │  PageParametersView · HmiNotificationBar   │
  └────────────────────────────────────────────┘
```

- `useEquipmentGateway.js` abstracts the transport layer (REST + SSE).
- `useParameterStore.js` holds the single reactive parameter state used by all components.
- All writes use optimistic updates with automatic rollback on failure.
- Transaction pages stage changes locally and commit them atomically via a single `POST`.

---

## 7. Component Index

| Component / Composable              | Area     | Responsibility                                      |
|-------------------------------------|----------|-----------------------------------------------------|
| `HmiShell.vue`                      | Shell    | CSS grid layout; applies `data-theme` attribute     |
| `HmiHeader.vue`                     | Area 1   | Application name + status icon bar                  |
| `StatusIconBar.vue`                 | Area 1   | Real-time status icons; navigate on click           |
| `HmiNotificationBar.vue`            | Area 2   | Priority-ordered feedback messages                  |
| `PageParametersView.vue`            | Area 3   | Parameter grid; panel navigation; transaction actions |
| `ParameterWidget.vue`               | Area 3   | Single parameter display + interaction tile         |
| `LinkWidget.vue`                    | Area 3   | Navigation tile for home/submenu screens            |
| `EnumEditorModal.vue`               | Area 3   | Full-screen picker for enum parameters              |
| `PercentageEditorModal.vue`         | Area 3   | Slider for percentage parameters                    |
| `TextEditorModal.vue`               | Area 3   | Keyboard input for text / password parameters       |
| `DateEditorModal.vue`               | Area 3   | Calendar picker for date parameters                 |
| `HmiFooter.vue`                     | Area 4   | Back / Home / level-1 tab bar                       |
| `useMenuNavigation.js`              | Logic    | Page history stack; active page state               |
| `useParameterStore.js`              | Logic    | Reactive parameter values; transaction drafts       |
| `useNotificationBar.js`             | Logic    | Message queue; priority; auto-dismiss               |
| `useTheme.js`                       | Logic    | Theme selection; localStorage persistence           |
| `useEquipmentGateway.js`            | Logic    | REST + SSE transport abstraction                    |
| `useMenuConfig.js`                  | Logic    | YAML config loading; page tree flattening           |
