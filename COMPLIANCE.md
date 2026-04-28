# Defence HMI Compliance Report

**Application:** hmi-demo  
**Date:** 2026-04-27  
**Standards referenced:** MIL-STD-1472H, DEF STAN 00-250, STANAG 4586, ARP4754A / DO-178C, MIL-STD-2525D (assessed)

---

## 1. Scope

This document assesses the compliance of the `hmi-demo` application against Human-Machine Interface (HMI) specifications applicable to defence and military vehicle systems. The analysis covers the Vue 3 + Vite frontend, the YAML-based menu configuration, the `NetworkAdapter`, and the Service Worker simulator. MIL-STD-2525D (Common Warfighting Symbology) was additionally evaluated for applicability and the outcome is documented in Section 4.

---

## 2. Applicable Standards

| Standard | Title |
|---|---|
| MIL-STD-1472H | Human Engineering Design Criteria for Military Systems, Equipment and Facilities |
| DEF STAN 00-250 | Human Factors for Defence Systems |
| STANAG 4586 | Standard Interfaces of UAV Control System for NATO Interoperability |
| ARP4754A | Guidelines for Development of Civil Aircraft and Systems |
| DO-178C | Software Considerations in Airborne Systems and Equipment Certification |
| MIL-L-85762 | Night Vision Imaging System (NVIS) Lighting |
| MIL-STD-2525D | Common Warfighting Symbology (assessed – see Section 4) |

---

## 3. Compliant Areas

### 3.1 Persistent Status Bar (MIL-STD-1472H §5.2.1)
**Status: COMPLIANT**

The `StatusIconBar` component permanently displays system status indicators (Fault, Channel, GPS, Login) in the top bar using a three-colour scheme (green / amber / red) with consistent iconography. Direct navigation to the corresponding detail page via click is consistent with the "status always visible" principle.

### 3.2 Notification Bar with Immediate Feedback (MIL-STD-1472H §5.2.3 / DEF STAN 00-250 §6.3)
**Status: COMPLIANT**

The `notification-bar` provides contextual feedback with differentiated visual severity levels (normal / warning / success / error). The `aria-live="polite"` attribute ensures screen-reader accessibility. A notification queue counter is also present.

### 3.3 Dark Theme as Default (MIL-STD-1472H §5.3.3.3)
**Status: COMPLIANT**

The dark theme is the application default, aligned with operational environments with reduced ambient lighting (vehicles, COP rooms, night operations). The primary text contrast ratio (`#e6edf3` on `#161b22`) exceeds 12:1, well above the WCAG AA minimum of 4.5:1 and MIL-STD requirements.

### 3.4 Two-Level Hierarchical Navigation (MIL-STD-1472H §5.10)
**Status: COMPLIANT**

The navigation structure (home → section → leaf page) is always visible in the bottom tab bar. The Back button has an explicit disabled state and Home is always accessible. Maximum depth of 2 levels respects the MIL-STD guideline of no more than 3 menu levels.

### 3.5 Clear Identification of Read-Only Parameters (MIL-STD-1472H §5.2.2.4)
**Status: COMPLIANT**

Read-only widgets display a padlock icon (`IconLock`) and reduced opacity (0.75), visually distinguishing them from editable fields.

### 3.6 Transaction Pages with Local Draft and Rollback (DEF STAN 00-250 §9.2)
**Status: COMPLIANT**

Pages in `mode: transaction` implement a local draft state, visual highlighting of pending changes (gold border), explicit reset, and a separate submit action. Backend error rollback is handled. This is a critical safeguard against accidental commands.

### 3.7 Keyboard and Screen-Reader Accessibility (DEF STAN 00-250 §11)
**Status: COMPLIANT**

All interactive controls use `role="button"`, `aria-pressed` (boolean widgets), `aria-label`, `aria-readonly`, Enter/Space keyboard handling, and managed `tabindex`.

---

## 4. Standards Assessed as Not Applicable

### 4.1 MIL-STD-2525D – Common Warfighting Symbology
**Assessment: NOT APPLICABLE**

**Standard scope:** MIL-STD-2525D defines a comprehensive set of standardised military symbols (pictograms, overlays, control measures, and tracks) intended for use on tactical situational-awareness displays, Common Operational Picture (COP) systems, and map-based Command & Control (C2) interfaces. It governs the visual encoding of unit affiliation (friend / hostile / neutral / unknown), echelon, equipment type, and operational status on georeferenced displays.

**Application scope:** `hmi-demo` is an onboard platform HMI for vehicle subsystem management. Its function is limited to:

- Monitoring and controlling vehicle subsystems: air conditioning (HVAC), door states, engine and battery telemetry, system alarms, and configuration settings.
- Displaying scalar parameters, boolean states, enumeration values, and operational alarms through a tabbed widget interface.

**Rationale for non-applicability:**

| MIL-STD-2525D requirement area | Present in hmi-demo? | Justification |
|---|---|---|
| Map / georeferenced display | ❌ No | The application has no cartographic view or geographic coordinate system. |
| Military unit / track symbols | ❌ No | No force-disposition icons, unit markers, or track objects are rendered. |
| Affiliation colour coding (blue / red / green / yellow) | ❌ No | Status colours are used for alert severity (green / amber / red) per MIL-STD-1472H, not for force affiliation. |
| Tactical overlays and control measures | ❌ No | No mission graphics, phase lines, engagement areas, or route overlays exist. |
| Symbol identifier (SIDC) encoding | ❌ No | No Symbol Identification Code is generated, stored, or transmitted. |
| COP / SA data exchange | ❌ No | The application exchanges platform telemetry parameters, not tactical picture data. |

**Conclusion:** MIL-STD-2525D does not impose any requirements on this application in its current form.

---

## 5. Non-Conformances and Gaps

### NC-01 – Missing Robust Authentication and RBAC (MIL-STD-1472H §5.14 / DEF STAN 00-250 §10.1)
**Severity: CRITICAL**

The login mechanism uses hardcoded credentials (`admin` / `admin`) in the simulator. For defence deployment the following are required:

- Multi-factor authentication or integration with PKI/CAC military token systems.
- Role-Based Access Control (RBAC) enforced in the UI. The roles `OPERATOR`, `SUPERVISOR`, `MAINTAINER` are defined in `platform-pages-menu.yaml` but no conditional visibility or permission logic is implemented anywhere in the application.
- Automatic session timeout on inactivity.
- Access audit log.

**Affected files:** `public/sw.js` (hardcoded credentials), `src/config/platform-pages-menu.yaml` (roles declared but unused)

---

### NC-02 – No Confirmation Dialog for Critical Commands (MIL-STD-1472H §5.10.5 / STANAG 4586 §6.4)
**Severity: CRITICAL**

The commands `RESET_ALARMS`, `GPS_RESET`, and `REBOOT` are executed without any confirmation dialog. MIL-STD-1472H requires a two-step confirmation for irreversible or high-impact actions. The transaction pattern already implemented for parameter pages is not applied to direct command actions.

**Affected files:** `public/sw.js` (command handlers), `src/features/page-actions/`

---

### NC-03 – No Audit Trail / Operational Log (MIL-STD-1472H §5.14.3 / DEF STAN 00-250 §10.3)
**Severity: CRITICAL**

No mechanism exists for logging user actions (who changed what, when, and from which value to which). In defence systems every command and parameter modification must be traceable with timestamp, user identity, and before/after values.

**Affected files:** `src/composables/useParameterStore.js`, `src/adapters/NetworkAdapter.js`

---

### NC-04 – No Network Timeout or Deterministic Error Handling (MIL-STD-1472H §5.2.6 / DO-178C)
**Severity: SIGNIFICANT**

The `NetworkAdapter._fetch()` method invokes `fetch()` without an `AbortController` timeout. In tactical environments (degraded networks, jamming) a request may hang indefinitely. There is also no retry policy with backoff or maximum attempt count.

**Affected files:** `src/adapters/NetworkAdapter.js` (lines 126–173)

---

### NC-05 – No "System Under Control" Indicator (STANAG 4586 §6.3.2)
**Severity: SIGNIFICANT**

There is no persistent indicator showing whether the vehicle / apparatus is currently under HMI control, autonomous, or controlled by another operator. This is a fundamental requirement for UxV / tactical vehicle systems.

**Affected files:** `src/App.vue`, `src/components/StatusIconBar.vue`

---

### NC-06 – Touch Target Size Below Standard (MIL-STD-1472H §5.8.6)
**Severity: MODERATE**
**Status: RESOLVED**

| Element | Previous size | Current size | MIL-STD minimum |
|---|---|---|---|
| Status icon buttons (`.si-btn`) | 2rem ≈ 32px | 3rem = 48px | 48px (12.7mm at 96dpi) |
| Panel dot indicators (`.panel-dot`) | 1.9rem ≈ 30px | 3rem = 48px | 48px |

Both elements have been updated to meet the 48 px minimum. The visual indicator inside `.panel-dot` (`::before` pseudo-element) retains its compact appearance while the full clickable/touchable area is now compliant with gloved and vibration-affected operation requirements.

**Affected files:** `src/components/StatusIconBar.vue`, `src/components/PageParametersView.vue`

---

### NC-07 – Potential NVIS Incompatibility (MIL-L-85762 / MIL-STD-1472H §5.3.5)
**Severity: MODERATE**
**Status: PARTIALLY MITIGATED (software layer implemented; photometric hardware validation pending)**

The status colours `#3fb950` (green) and `#e3a008` (amber) may produce spectral emission incompatible with Night Vision Goggle (NVG) operation. NVG-compatible displays must conform to MIL-L-85762, typically restricting visible emission and limiting spectral output to 600–900 nm.

**Software mitigation implemented:**

A dedicated `nvis` theme has been added (`data-theme='nvis'`) replacing all green, blue, and amber hues with a low-luminance deep-red palette (625–780 nm range) to minimise NVG bleed:

| Element | Previous value | NVIS value |
|---|---|---|
| `--text-green` / `--status-color` | `#3fb950` | `#8b1a00` |
| `--status-warning-color` | `#e3a008` | `#8b3300` |
| `--status-critical-color` | `#f85149` | `#8b0000` |
| `--text-blue` | `#58a6ff` | `#aa2200` |
| Background | `#161b22` | `#0a0000` |

All previously hardcoded status-icon colours in `StatusIconBar.vue` have been converted to CSS custom properties (`--status-ok-border`, `--status-ok-bg`, `--status-warning-color`, `--status-warning-bg`, `--status-warning-border`, `--status-critical-color`, `--status-critical-bg`, `--status-critical-border`) so they respond to theme changes. A **NVIS Mode** toggle is available in the settings page.

**Residual gap:** Full MIL-L-85762 certification requires photometric measurement (NVIS Radiance, spectral irradiance) on the physical display hardware. The software palette change is a necessary but not sufficient condition for compliance.

**Affected files:** `src/App.vue` (CSS custom properties + NVIS theme block), `src/components/StatusIconBar.vue`, `src/composables/useTheme.js`

---

### NC-08 – No Stale Data Warning (MIL-STD-1472H §5.2.7 / ARP4754A §5.3)
**Severity: MODERATE**

If the connection to the apparatus is lost, widgets continue to display the last received values without any indication of data obsolescence. Defence systems require explicit stale-data marking (e.g. cross-hatching, timestamp overlay, greyed background) to prevent operators from acting on outdated information.

**Affected files:** `src/composables/useParameterStore.js`, `src/components/ParameterWidget.vue`

---

### NC-09 – Font Size Below Operational Readability Threshold (MIL-STD-1472H §5.3.1.3)
**Severity: MODERATE**

| Element | Current size | MIL-STD minimum |
|---|---|---|
| Parameter name label (`.param-name`) | 0.62rem ≈ 10px | 12pt / 16px |
| Bottom tab labels (`.tab-label`) | 0.68rem ≈ 11px | 12pt / 16px |
| Notification count badge | 0.68rem ≈ 11px | 12pt / 16px |

Under vibration or low-visibility conditions these text elements may be unreadable at operational viewing distances.

**Affected files:** `src/components/ParameterWidget.vue`, `src/App.vue`

---

### NC-10 – No Functional Segregation of Critical Actions (DEF STAN 00-250 §9.4 / IEC 61511)
**Severity: MODERATE**

There is no physical or logical separation between monitoring functions (read-only display) and command functions (write / action). Reset Alarms and Reboot are accessible with the same interaction depth as reading the CPU temperature, without any access-level gating.

**Affected files:** `src/config/platform-pages-impostazioni.yaml`, `src/features/page-actions/`

---

### NC-11 – Hardcoded Credentials in Source Code (Security)
**Severity: NOTE**

The simulator credentials (`admin` / `admin`) are hardcoded in `public/sw.js`. While limited to the simulator, this pattern must not be replicated in production deployments. The Service Worker must be excluded from production builds or replaced with an authentication stub.

**Affected files:** `public/sw.js`

---

### NC-12 – Mixed Localisation (EN / IT) (DEF STAN 00-250 §12)
**Severity: MINOR**

The UI mixes Italian and English. YAML labels are in English ("Battery", "Engine Temp.") while error messages are in Italian ("Impossibile raggiungere il dispositivo"). In a multinational NATO context a single language or a proper i18n system is required.

**Affected files:** `src/adapters/NetworkAdapter.js`, `src/config/*.yaml`

---

## 6. Compliance Summary

| Area | Standard | Status |
|---|---|---|
| Persistent status bar | MIL-STD-1472H §5.2.1 | ✅ Compliant |
| Notification bar feedback | MIL-STD-1472H §5.2.3 | ✅ Compliant |
| Dark theme + contrast ratio | MIL-STD-1472H §5.3.3 | ✅ Compliant |
| Hierarchical navigation | MIL-STD-1472H §5.10 | ✅ Compliant |
| Read-only parameter indicators | MIL-STD-1472H §5.2.2.4 | ✅ Compliant |
| Transaction pages with rollback | DEF STAN 00-250 §9.2 | ✅ Compliant |
| Keyboard / ARIA accessibility | DEF STAN 00-250 §11 | ✅ Compliant |
| Authentication and RBAC | MIL-STD-1472H §5.14 | ❌ Non-compliant |
| Confirmation for critical commands | MIL-STD-1472H §5.10.5 | ❌ Non-compliant |
| Audit trail | DEF STAN 00-250 §10.3 | ❌ Non-compliant |
| Network timeout / fail-safe | MIL-STD-1472H §5.2.6 | ⚠️ Gap |
| System-under-control indicator | STANAG 4586 §6.3 | ⚠️ Gap |
| Touch target dimensions | MIL-STD-1472H §5.8.6 | ✅ Compliant |
| NVIS colour compatibility | MIL-L-85762 | ⚠️ Partially mitigated (hw validation pending) |
| Stale data warning | MIL-STD-1472H §5.2.7 | ⚠️ Gap |
| Minimum font size | MIL-STD-1472H §5.3.1 | ⚠️ Partial |
| Functional segregation | DEF STAN 00-250 §9.4 | ⚠️ Gap |
| Single language / i18n | DEF STAN 00-250 §12 | ⚠️ Minor |
| Warfighting symbology | MIL-STD-2525D | ➖ Not applicable |

---

## 7. Remediation Priorities

### High – Blocking for Certification

1. **Implement RBAC** – enforce the roles already declared in `platform-pages-menu.yaml` (OPERATOR, SUPERVISOR, MAINTAINER) via conditional page/action visibility driven by the authenticated user's role.
2. **Add confirmation dialogs for irreversible commands** – apply the existing transaction pattern (or a dedicated modal) to `RESET_ALARMS`, `GPS_RESET`, and `REBOOT`.
3. **Implement an operational audit log** – record each command and parameter change with timestamp, user identity, and old/new value, either locally or forwarded to the backend.

### Medium – Recommended Before Deployment

4. **Add fetch timeouts and stale-data warnings** – wrap all `fetch()` calls with `AbortController` and display a "data may be outdated" indicator when the last successful update exceeds a configurable threshold.
5. **Add a "system under control" indicator** in the top bar, driven by a new status parameter from the apparatus.
6. **Increase minimum font size to 12pt (16px)** for all operationally relevant text.
7. **Commission photometric NVIS validation** – measure NVIS Radiance and spectral irradiance of the physical display hardware in NVIS mode to complete MIL-L-85762 certification (software palette implemented).

### Low – Quality Improvement

8. **Unify the interface language** (English throughout, or a full i18n layer).
9. **Visually segregate command controls** from monitoring displays (e.g. a dedicated "Actions" section requiring explicit navigation or an elevated privilege level).
