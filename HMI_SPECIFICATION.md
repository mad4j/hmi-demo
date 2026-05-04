# HMI Specification – Area Overview

Version: 1.1  
Date: 2026-05-04  
Repository: `mad4j/hmi-demo`

---

## 1. Purpose

This document provides a high-level specification of the Human–Machine Interface (HMI) shell layout and its functional areas. Each area is described in terms of its visual position, dimensions, responsibilities, and the components that implement it.

---

## 2. High-Level Layout Diagram

The HMI occupies the full viewport. It is rendered by the `HmiShell` component using a CSS grid with four fixed row tracks. The diagram below represents the layout:

```
┌────────────────────────────────────────────────────────────────────────────┐
│  AREA 1 – HEADER                                              (3.5 rem)    │
│  ┌──────┐ ┌──────┐ ┌───────────────────────┐ ┌──────────┐ ┌──┐ ┌──────┐ ┌──────┐ │
│  │Comm  │ │ CH3  │ │ SATURN-V              │ │ AES-256  │ │🔄│ │Icons │ │14:32 │ │
│  │[icon]│ │      │ │ NATO-BASELINE         │ │ [NATO]   │ │  │ │      │ │      │ │
│  └──────┘ └──────┘ └───────────────────────┘ └──────────┘ └──┘ └──────┘ └──────┘ │
│  CommIcon  Channel     Identity (1fr)           Crypto    Zero  Status   Time    │
├────────────────────────────────────────────────────────────────────────────┤
│  AREA 2 – NOTIFICATION BAR                                    (auto)       │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  [icon]  Message text                                   [+N badge] │    │
│  └────────────────────────────────────────────────────────────────────┘    │
├────────────────────────────────────────────────────────────────────────────┤
│  AREA 3 – CONTENT                                             (1 fr)       │
│                                                                            │
│  ┌ Home / Submenu screen ─────────────────────────────────────────────┐   │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                           │   │
│  │  │ Link │  │ Link │  │ Link │  │ Link │   (LinkWidget ×N)          │   │
│  │  │Widget│  │Widget│  │Widget│  │Widget│                           │   │
│  │  └──────┘  └──────┘  └──────┘  └──────┘                           │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│  ┌ Parameters page ───────────────────────────────────────────────────┐   │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                           │   │
│  │  │Param │  │Param │  │Param │  │Param │   (ParameterWidget ×N)     │   │
│  │  │Widget│  │Widget│  │Widget│  │Widget│                           │   │
│  │  └──────┘  └──────┘  └──────┘  └──────┘                           │   │
│  │                        ● ● ○ ○ ○   (panel dots, optional)          │   │
│  │  ┌──────────────┐  ┌──────────────┐        (transaction mode)      │   │
│  │  │   Reset (↺)  │  │   Submit (→) │                               │   │
│  │  └──────────────┘  └──────────────┘                               │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│  ┌ Settings page (tema) ──────────────────────────────────────────────┐   │
│  │  ┌──────────────────────────────┐                                  │   │
│  │  │ Theme: DARK / LIGHT / NVIS   │   (enum selector widget)         │   │
│  │  └──────────────────────────────┘                                  │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│  AREA 4 – FOOTER / TAB BAR                                    (4.5 rem)    │
│  ┌──────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │  ←   │ │  🏠 Home │ │ Waveform │ │   Menu   │ │  Alarms  │ │  ...   │  │
│  │ Back │ │          │ │(level-1) │ │(level-1) │ │(level-1) │ │        │  │
│  └──────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
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

**Content – seven zones (CSS grid: `auto auto 1fr auto auto auto auto`):**

The header is laid out as a horizontal row of seven zones from left to right:

---

**Zone 0 – Communication Icon (far left)**
- A clickable button (`comm-icon-wrap`) displaying `IconCommState.vue`.
- Navigates to `waveform-attiva` (Active Waveform page) on click.
- Width: 3 rem; height: full bar height (3.5 rem).
- Synthesised from `comm_state`, `comm_mode`, and `comm_radio_silence`. Five variants:

  | Variant         | Trigger condition                          | Colour token                          |
  |-----------------|--------------------------------------------|---------------------------------------|
  | `idle-ct`       | IDLE + CT (cipher-text)                    | `--text-green` / `--status-ok-bg`     |
  | `idle-pt`       | IDLE + PT (plain-text) – ⚠ caution         | `--status-warning-color` / warning bg |
  | `rx`            | `comm_state = RX`                          | `--text-green` / `--active-name-bg`   |
  | `tx`            | `comm_state = TX`                          | `--text-blue` / `--btn-active-bg`     |
  | `radio-silence` | `comm_radio_silence = true` (highest pri.) | `--status-critical-color` + blink     |

  Button carries `aria-label` and `title` with the full human-readable state text.

---

**Zone 0b – Channel Indicator**
- Shows the active channel number as `CHx` (e.g. `CH3`), derived from `active_channel_number`.
- Min-width: 3.2 rem; monospace font, 1 rem, bold.
- Right border `--border`; right-aligned inside the zone.

---

**Zone 1 – Identity (waveform + preset)**
- Fills the remaining horizontal space (`flex: 1fr`).
- Rendered as a clickable button; navigates to `waveform-attiva` on click.
- Right border `--border` separates it from the crypto zone.
- Two stacked rows:
  - **Waveform name** (`active_waveform_name`): 1 rem (16 px), primary colour, bold. Max-width 14 rem with text-overflow ellipsis.
  - **Preset name** (`active_preset_name`): 0.875 rem, `--text-blue` (accent), italic. Max-width 14 rem with text-overflow ellipsis.

---

**Zone 2 – Crypto State (monospace, centred)**
- Right border `--border`.
- Two stacked rows:
  - **Algorithm** (`crypto_algorithm`): e.g. `AES-256`, 0.875 rem, bold, primary colour, monospace.
  - **Context badge** (`crypto_context`): e.g. `NATO` (blue) or `NAZ` (green), 0.875 rem, monospace, colour-coded badge with rounded corners.

---

**Zone 2b – Emergency Zeroization Button**
- A compact icon button (3 rem × 3 rem) styled in `--status-critical-color` with critical background.
- Executes the named command `KEY_ZEROIZE` via `sendCommand()` on click.
- `title` and `aria-label`: `"Emergency zeroization"`.

---

**Zone 3 – Status Icon Bar**
- Contains `StatusIconBar.vue` – four icon buttons driven by `platform-status-icons.yaml`.

  | Icon    | Parameter ID     | Default target page on click | State-dependent target          |
  |---------|------------------|------------------------------|---------------------------------|
  | Fault   | `status_fault`   | `allarmi` (Alarms)           | –                               |
  | Channel | `status_channel` | `info` (System Info)         | –                               |
  | GPS     | `status_gps`     | `gps` (GPS settings)         | –                               |
  | Login   | `status_login`   | `login`                      | `logout` when state = `ok`      |

---

**Zone 4 – Mission Time (far right)**
- Left border `--border`; aligned to the right edge.
- Displays `missionTimeTod` (HH:MM format) derived from the apparatus parameter `ora_sistema`.
- The clock is kept live by a 1-second local interval; it re-synchronises with the apparatus every 60 seconds.
- Monospace font, 1 rem, bold, primary colour.

---

**Font-size compliance note (HMI-REQ-011):**
The waveform name and mission time are rendered at 1 rem = 16 px (fully compliant). Preset name and crypto rows are rendered at 0.875 rem ≈ 14 px. This is a minor deviation from the 16 px minimum, accepted as a design constraint within a fixed-height header. Both values exceed the 3:1 large-text contrast threshold and remain readable at 50 cm in normal illumination conditions.

---

### 3.2 Notification Bar (Area 2)

| Attribute   | Value                                   |
|-------------|-----------------------------------------|
| Component   | `HmiNotificationBar.vue`                |
| Row height  | `auto` (min-height 2 rem)               |
| Background  | Severity-driven CSS variable            |

**Content and behaviour:**

- Displays a single line of contextual information at all times.
- In idle state it shows the current page label (e.g. `Air Conditioning / Front Doors`).
- When a system event occurs, the bar transitions to show the event message with a severity-coded background:

  | Severity  | Background token                    | Use case                             |
  |-----------|-------------------------------------|--------------------------------------|
  | MENU      | `--notification-normal-bg`          | Default; shows current menu path     |
  | NORMAL    | `--notification-normal-bg`          | Informational feedback               |
  | SUCCESS   | `--notification-success-bg`         | Command accepted / value committed   |
  | WARNING   | `--notification-warning-bg`         | Non-critical fault or caution        |
  | ERROR     | `--notification-error-bg`           | Command failure or critical fault    |

- A numeric badge appears on the right edge when additional messages are queued.
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
- Grid columns: 4 on wide screens (≥ 400 px), 3 on medium (≤ 599 px), 2 on small (≤ 399 px).
- If `application.yaml` defines exactly one application page, the home screen auto-navigates to that page on load (the Home button still returns to the true home screen).

**Application pages** (from `application.yaml`):

| ID                   | Label         | Description                                                              |
|----------------------|---------------|--------------------------------------------------------------------------|
| `app-configurazione` | Configuration | Multi-panel system overview: Clima, Porte, Motore, Elettrico, Stato, Manutenzione, Accesso |

**Platform-level pages** (from `platform-pages-*.yaml`), shown in the Footer tab bar:

| ID              | Label    | Sub-pages / content                                                  |
|-----------------|----------|----------------------------------------------------------------------|
| `menu`          | Menu     | Air Conditioning, Doors, Extended View, Transaction Panels, Multi-Panel, Deep Navigation, Configuration, [Hidden test page] |
| `allarmi`       | Alarms   | Read-only alarm flags: battery, engine temp, pressure, oil, ABS, airbag, fuel, fuel level |
| `info`          | Info     | System diagnostics: HMI version, network status, uptime, battery voltage, CPU temp, date, system time |
| `impostazioni`  | Settings | Sub-pages: Theme, GPS, Login                                         |
| `waveform`      | Waveform | Sub-pages: Active Waveform (`waveform-attiva`), Preset (`waveform-preset`) |

#### 3.3.2 Parameters Page

Shown when the current page has parameters but no visible sub-pages (standard leaf page).

Implemented by `PageParametersView.vue`. Contains:

- **Widget grid** – a responsive grid of `ParameterWidget` tiles, one per parameter.  
  Supported parameter types:

  | Type         | Rendered as                   | Editable |
  |--------------|-------------------------------|----------|
  | `boolean`    | ON / OFF toggle               | ✓ (tap)  |
  | `number`     | Numeric value + unit          | ✗ (read-only by default) |
  | `percentage` | Numeric value + `%`           | ✓ (slider modal) |
  | `enum`       | Text badge                    | ✓ (picker modal) |
  | `text`       | Short string                  | ✓ (text input modal) |
  | `password`   | Masked (`•••`)                | ✓ (password modal) |
  | `date`       | Formatted date (`dd/mm/yyyy`) | ✓ (date picker modal) |

  Read-only parameters are visually dimmed (opacity 0.75) and show a lock icon.

- **Panel navigation** (optional) – when a page defines multiple panels, dot indicators appear below the grid. Panels can be switched by tapping a dot or using `ArrowLeft`/`ArrowRight` keyboard keys.

- **Transaction actions** (optional) – when `mode: transaction` is set on a page, two buttons appear at the bottom:
  - **Reset (↺)**: discards all staged changes, reverting to original values.
  - **Submit (→)**: commits all staged changes to the apparatus in a single atomic write. `Enter` key also submits when no editor modal is open.

  Modified parameters are highlighted with an amber border until committed.
  
  The `goOnApply` page property controls post-submit navigation: `STAY_HERE` (default), `GO_HOME`, or `GO_BACK`.

#### 3.3.3 Settings Page (Theme Selector)

Shown when the current page ID is `tema`.

- Renders a single `ParameterWidget` (enum type) labelled **Theme**.
- Valid values: `DARK`, `LIGHT`, `NVIS`.
- Selecting a new value opens an `EnumEditorModal`; on confirm, `setTheme(value)` is called and the choice is persisted in `localStorage` under the key `hmi-theme`.
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

| Element             | Width         | Behaviour                                                      |
|---------------------|---------------|----------------------------------------------------------------|
| **Back button** (←) | 0.33× share   | Navigates to the previous page in history stack. Disabled (opacity 0.45) when at the root. |
| **Home button** (🏠) | 1× share      | Returns to the home screen and resets the forward history.     |
| **Level-1 tab** ×N  | 1× share each | One tab per top-level platform page (all pages in `menuConfig.pages` that are not `hidden`). The active tab is highlighted with a top border accent and `--text-blue` text. |

The Back button occupies one-third the width of a standard tab to preserve space for the level-1 tabs. Tab labels are uppercase.

---

## 4. Navigation Model

```
                            [Home Screen]
                                  │
                    (auto-opens if single app page)
                                  │
                       [app-configurazione]
                        (Configuration – multi-panel)

                    ┌─────────────────────────────────────────────────┐
                    │           Footer Tab Bar (level-1)              │
                    └─────────────────────────────────────────────────┘
          ┌───────────┬───────────┬──────────┬──────────┬─────────────┐
          ▼           ▼           ▼          ▼          ▼             
    [Waveform]     [Menu]      [Alarms]    [Info]   [Settings]
         │            │                                  │
    ┌────┴─────┐  ┌───┴────────────────────────────┐  ┌──┴──────────────┐
    ▼          ▼  ▼     ▼          ▼    ▼     ▼    ▼  ▼     ▼       ▼
 [Active   [Preset] [A/C] [Doors] [Ext] [Trx] [...] [Nav2] [Theme] [GPS] [Login]
 Waveform]              (panels) [View] [Pnls]       │               [logout hidden]
                                                     │
                                            ┌────────┴──────────┐
                                            ▼                   ▼
                                    [Diagnostica]       [Commissioning]
                                                        [Snapshot r/o]
```

- Navigation state is managed by `useMenuNavigation.js` (singleton).
- A history stack enables the Back button; `goHome()` clears the forward history.
- `level1Items` (footer tabs) = all `menuConfig.pages` where `visibility !== 'hidden'`.
- The active level-1 highlight follows the current page's ancestry in the page tree.
- Pages with `visibility: hidden` (e.g. `logout`, `pagina_nascosta_test`) are reachable by direct `navigateToPage(id)` call but do not appear as tiles or tabs.

**Platform page IDs in order (from `platform.yaml` includes):**

| Order | ID             | Label    | Type          |
|-------|----------------|----------|---------------|
| 1     | `menu`         | Menu     | Submenu       |
| 2     | `allarmi`      | Alarms   | Leaf (params) |
| 3     | `info`         | Info     | Leaf (params) |
| 4     | `impostazioni` | Settings | Submenu       |
| 5     | `waveform`     | Waveform | Submenu       |

---

## 5. Theming

Three themes are supported, selectable at runtime via the `tema` settings page and persisted in `localStorage` under the key `hmi-theme`:

| Theme | Key     | Description                                              |
|-------|---------|----------------------------------------------------------|
| Dark  | `dark`  | Default. Deep blue-grey background, white/green text.    |
| Light | `light` | White background, dark text. Standard day mode.          |
| NVIS  | `nvis`  | Deep red/near-IR palette for night-vision compatibility. |

All colour values are expressed as CSS custom properties (`--bg-main`, `--text-primary`, etc.) scoped to the `[data-theme]` attribute on the `HmiShell` root element, enabling instant full-application repainting without page reload.

**`useTheme.js` public API:**

| Export          | Type       | Description                                              |
|-----------------|------------|----------------------------------------------------------|
| `theme`         | `Ref<string>` | Reactive current theme key (`'dark'` \| `'light'` \| `'nvis'`) |
| `setTheme(v)`   | `Function` | Set theme to a valid key; persists to localStorage       |
| `VALID_THEMES`  | `string[]` | `['light', 'dark', 'nvis']`                              |

---

## 6. Data Flow Summary

```
  ┌────────────────────────────────────────┐
  │          useEquipmentGateway.js        │
  │  ┌──────────────────────────────────┐  │
  │  │        NetworkAdapter.js         │  │
  │  │  ┌────────────────────────────┐  │  │
  │  │  │  GET  /api/parameters      │──┼──┼──► Apparatus
  │  │  │  POST /api/parameters      │◄─┼──┼─── Apparatus
  │  │  │  POST /api/commands        │──┼──┼──► Apparatus (named commands)
  │  │  │  Notifications:            │◄─┼──┼─── Apparatus (push updates)
  │  │  │   poll | sse | text-tail   │  │  │
  │  │  └────────────────────────────┘  │  │
  │  └──────────────────────────────────┘  │
  │  isConnected (ref)  isLoading (ref)    │
  └────────────────────────────────────────┘
           │  getParameters / setParameters
           │  sendCommand / notifyParameters
           ▼
  ┌─────────────────────┐
  │  useParameterStore  │   reactive parameterValues
  │  (singleton)        │   transactionDrafts
  └─────────────────────┘
           │
           │ parameterValues (reactive)
           ▼
  ┌──────────────────────────────────────────────────────┐
  │                    UI Components                     │
  │  HmiHeader · StatusIconBar · HmiNotificationBar      │
  │  PageParametersView · ParameterWidget · LinkWidget   │
  └──────────────────────────────────────────────────────┘
```

**Notification transport** is configurable via environment variable `VITE_DEVICE_NOTIFICATION_TRANSPORT`:

| Value        | Description                                                  |
|--------------|--------------------------------------------------------------|
| `text-tail`  | Default. Polls a plain-text log file (`/api/notifications/log.txt`) |
| `sse`        | Server-Sent Events on `/api/notifications`                   |
| `poll`       | Periodic polling of `/api/parameters`                        |

- `useEquipmentGateway.js` abstracts the transport layer and exposes `getParameters`, `setParameters`, `sendCommand`, and `notifyParameters`.
- `useParameterStore.js` holds the single reactive parameter state used by all components.
- All writes use optimistic updates with automatic rollback on failure.
- Transaction pages stage changes locally and commit them atomically via a single `POST`.
- Named commands (e.g. `KEY_ZEROIZE`) are sent via `sendCommand(commandId)` and routed through `POST /api/commands`.

---

## 7. Component Index

| Component / Composable / Feature           | Area     | Responsibility                                           |
|--------------------------------------------|----------|----------------------------------------------------------|
| `HmiShell.vue`                             | Shell    | CSS grid layout (4 rows); applies `data-theme` attribute; defines all CSS custom property themes |
| `HmiHeader.vue`                            | Area 1   | 7-zone header: CommIcon, Channel, Identity, Crypto, Zeroize, StatusIconBar, MissionTime |
| `IconCommState.vue`                        | Area 1   | Synthesised comm-state SVG icon with 5 variants          |
| `StatusIconBar.vue`                        | Area 1   | Real-time status icon buttons; navigate on click         |
| `AppIcon.vue`                              | Shared   | Resolves icon name to the correct SVG component          |
| `HmiNotificationBar.vue`                   | Area 2   | Priority-ordered feedback messages with severity styling |
| `PageParametersView.vue`                   | Area 3   | Parameter widget grid; panel navigation; transaction actions |
| `ParameterWidget.vue`                      | Area 3   | Single parameter display + interaction tile              |
| `LinkWidget.vue`                           | Area 3   | Navigation tile for home/submenu screens                 |
| `EnumEditorModal.vue`                      | Area 3   | Full-screen picker for enum parameters                   |
| `PercentageEditorModal.vue`                | Area 3   | Slider modal for percentage parameters                   |
| `TextEditorModal.vue`                      | Area 3   | Keyboard input modal for text / password parameters      |
| `DateEditorModal.vue`                      | Area 3   | Calendar picker modal for date parameters                |
| `HmiFooter.vue`                            | Area 4   | Back / Home / level-1 tab bar                            |
| `useMenuNavigation.js`                     | Logic    | Page history stack; current page; level-1 tab state      |
| `useParameterStore.js`                     | Logic    | Reactive parameter values; transaction drafts; initial fetch + push subscription |
| `useNotificationBar.js`                    | Logic    | Message queue; priority ordering; auto-dismiss timer     |
| `useTheme.js`                              | Logic    | Theme ref; `setTheme()`; localStorage persistence        |
| `useEquipmentGateway.js`                   | Logic    | Transport façade: `getParameters`, `setParameters`, `sendCommand`, `notifyParameters` |
| `useHeaderState.js`                        | Logic    | Derives all header-zone values from `parameterValues`; mission time clock |
| `useMenuConfig.js`                         | Logic    | YAML config loading; page tree normalisation and flattening |
| `useApplicationConfig.js`                  | Logic    | Loads `application.yaml`; exposes app-level page list    |
| `useCurrentPagePanels.js`                  | Logic    | Resolves the active panel list and current panel label for a page |
| `useCurrentPageParameterRefresh.js`        | Logic    | Triggers parameter refresh on page navigation            |
| `useTransactionPageActions.js`             | Logic    | Handles toggle/set/reset/submit actions for transaction and standard pages |
| `useLogoutPageAction.js`                   | Feature  | Handles logout page lifecycle (detect, apply, navigate)  |
| `NetworkAdapter.js`                        | Adapter  | HTTP REST + configurable notification transport (poll / sse / text-tail) |
