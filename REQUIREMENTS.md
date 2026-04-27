# Defence HMI Requirements

**Application:** hmi-demo  
**Date:** 2026-04-27  
**Standards referenced:** MIL-STD-1472H, DEF STAN 00-250, STANAG 4586, ARP4754A / DO-178C, MIL-L-85762

---

## 1. Scope

This document lists the requirements applicable to the `hmi-demo` application derived from the defence and military HMI standards listed above. Each requirement identifies the governing standard clause and a unique identifier for traceability.

---

## 2. Requirements

### REQ-01 – Persistent System Status Display  
**Standard:** MIL-STD-1472H §5.2.1  

The system shall permanently display system status indicators using a three-colour scheme (green / amber / red) with consistent iconography. Status indicators shall remain visible at all times regardless of the active page.

---

### REQ-02 – Contextual Feedback with Differentiated Severity  
**Standard:** MIL-STD-1472H §5.2.3 / DEF STAN 00-250 §6.3  

The system shall provide contextual feedback messages differentiated by visual severity level (normal / warning / success / error). Feedback shall be accessible to screen readers via appropriate ARIA live-region attributes.

---

### REQ-03 – Dark Theme Default with Minimum Contrast Ratio  
**Standard:** MIL-STD-1472H §5.3.3.3  

The dark theme shall be the default presentation mode to support operational environments with reduced ambient lighting. The primary text contrast ratio shall meet or exceed the WCAG AA minimum of 4.5:1.

---

### REQ-04 – Bounded Navigation Hierarchy  
**Standard:** MIL-STD-1472H §5.10  

The navigation structure shall not exceed three levels of depth. The current navigation level shall always be visible to the operator. A Back control shall be provided and a Home action shall be accessible at all times.

---

### REQ-05 – Visual Distinction of Read-Only Parameters  
**Standard:** MIL-STD-1472H §5.2.2.4  

Read-only parameters shall be visually distinguished from editable fields through a dedicated icon and/or reduced opacity treatment so that operators cannot mistake them for modifiable controls.

---

### REQ-06 – Transaction Mode with Draft, Reset, and Rollback  
**Standard:** DEF STAN 00-250 §9.2  

Pages that issue commands shall implement a local draft state, visual highlighting of pending changes, an explicit reset action (discard draft), and a separate submit action. Backend errors shall trigger automatic rollback to the previous committed state.

---

### REQ-07 – Keyboard and Screen-Reader Accessibility  
**Standard:** DEF STAN 00-250 §11  

All interactive controls shall be operable via keyboard (Enter / Space activation) and shall expose appropriate ARIA roles (`role="button"`), states (`aria-pressed`, `aria-readonly`), and labels (`aria-label`). Focus order shall be managed via `tabindex`.

---

### REQ-08 – Authentication, RBAC, and Session Management  
**Standard:** MIL-STD-1472H §5.14 / DEF STAN 00-250 §10.1  

The system shall require authentication using multi-factor authentication or integration with PKI / CAC military token systems. Role-Based Access Control (RBAC) shall be enforced in the UI, restricting page and action visibility based on the authenticated user's role (e.g. OPERATOR, SUPERVISOR, MAINTAINER). The session shall automatically time out after a configurable period of inactivity. All authentication events shall be recorded in an access audit log.

---

### REQ-09 – Two-Step Confirmation for Irreversible Commands  
**Standard:** MIL-STD-1472H §5.10.5 / STANAG 4586 §6.4  

Irreversible or high-impact commands (e.g. RESET\_ALARMS, GPS\_RESET, REBOOT) shall require an explicit two-step confirmation before execution. A confirmation dialog or equivalent interaction shall be presented to the operator before the command is dispatched.

---

### REQ-10 – Operational Audit Trail  
**Standard:** MIL-STD-1472H §5.14.3 / DEF STAN 00-250 §10.3  

Every command issued and every parameter modification shall be recorded with: timestamp, user identity, parameter or command name, and previous and new values. Audit records shall be stored locally or forwarded to the backend and shall not be alterable by operators.

---

### REQ-11 – Network Timeout and Deterministic Error Handling  
**Standard:** MIL-STD-1472H §5.2.6 / DO-178C  

All network requests shall be subject to a configurable timeout. Requests that exceed the timeout shall be cancelled and the operator shall be notified. A retry policy with bounded maximum attempts and back-off shall be implemented to handle degraded network conditions (e.g. jamming, high latency).

---

### REQ-12 – System-Under-Control Indicator  
**Standard:** STANAG 4586 §6.3.2  

The system shall display a persistent indicator showing whether the vehicle or apparatus is currently under HMI operator control, operating autonomously, or being controlled by another operator. The indicator shall be driven by a real-time status parameter from the apparatus.

---

### REQ-13 – Minimum Touch Target Dimensions  
**Standard:** MIL-STD-1472H §5.8.6  

All interactive touch targets (buttons, icons, indicators) shall measure at least 48 px (≈ 12.7 mm at 96 dpi) in both width and height to support gloved and vibration-affected operation.

---

### REQ-14 – Night Vision Goggle (NVG) Colour Compatibility  
**Standard:** MIL-L-85762 / MIL-STD-1472H §5.3.5  

The display shall be operable under Night Vision Goggle conditions. A dedicated NVIS display mode shall restrict visible emission and limit spectral output to a range compatible with MIL-L-85762 requirements. Full compliance requires photometric measurement (NVIS Radiance, spectral irradiance) of the physical display hardware.

---

### REQ-15 – Stale Data Warning  
**Standard:** MIL-STD-1472H §5.2.7 / ARP4754A §5.3  

When the connection to the apparatus is interrupted, the system shall explicitly mark all displayed parameter values as stale or potentially outdated (e.g. via cross-hatching, timestamp overlay, or greyed background). The stale indication shall persist until a fresh data update is received.

---

### REQ-16 – Minimum Font Size for Operational Readability  
**Standard:** MIL-STD-1472H §5.3.1.3  

All operationally relevant text (parameter labels, navigation tab labels, notification counters) shall be rendered at a minimum size of 12 pt (16 px at 96 dpi) to ensure readability under vibration and low-visibility conditions.

---

### REQ-17 – Functional Segregation of Critical Actions  
**Standard:** DEF STAN 00-250 §9.4 / IEC 61511  

Command controls (write / action) shall be physically or logically separated from monitoring displays (read-only). Critical actions shall require explicit navigation or an elevated privilege level and shall not be accessible at the same interaction depth as monitoring functions.

---

### REQ-18 – Single Language or Full Internationalisation  
**Standard:** DEF STAN 00-250 §12  

The user interface shall present all text content in a single consistent language. In a multinational NATO context an internationalisation (i18n) framework shall be used if multiple languages are required; mixed-language interfaces are not acceptable.

---

### REQ-19 – No Hardcoded Credentials  
**Standard:** Security best practice  

Authentication credentials shall not be hardcoded in source code or service worker scripts. Production builds shall exclude any simulator authentication stubs and shall integrate with the approved authentication infrastructure.

---

## 3. Traceability Matrix

| Requirement | Standard | Compliance Area / NC Reference |
|---|---|---|
| REQ-01 | MIL-STD-1472H §5.2.1 | §3.1 – Persistent Status Bar |
| REQ-02 | MIL-STD-1472H §5.2.3 / DEF STAN 00-250 §6.3 | §3.2 – Notification Bar |
| REQ-03 | MIL-STD-1472H §5.3.3.3 | §3.3 – Dark Theme |
| REQ-04 | MIL-STD-1472H §5.10 | §3.4 – Hierarchical Navigation |
| REQ-05 | MIL-STD-1472H §5.2.2.4 | §3.5 – Read-Only Parameters |
| REQ-06 | DEF STAN 00-250 §9.2 | §3.6 – Transaction Pages |
| REQ-07 | DEF STAN 00-250 §11 | §3.7 – Keyboard / ARIA Accessibility |
| REQ-08 | MIL-STD-1472H §5.14 / DEF STAN 00-250 §10.1 | NC-01 – Authentication and RBAC |
| REQ-09 | MIL-STD-1472H §5.10.5 / STANAG 4586 §6.4 | NC-02 – Confirmation Dialogs |
| REQ-10 | MIL-STD-1472H §5.14.3 / DEF STAN 00-250 §10.3 | NC-03 – Audit Trail |
| REQ-11 | MIL-STD-1472H §5.2.6 / DO-178C | NC-04 – Network Timeout |
| REQ-12 | STANAG 4586 §6.3.2 | NC-05 – System-Under-Control Indicator |
| REQ-13 | MIL-STD-1472H §5.8.6 | NC-06 – Touch Target Size |
| REQ-14 | MIL-L-85762 / MIL-STD-1472H §5.3.5 | NC-07 – NVIS Compatibility |
| REQ-15 | MIL-STD-1472H §5.2.7 / ARP4754A §5.3 | NC-08 – Stale Data Warning |
| REQ-16 | MIL-STD-1472H §5.3.1.3 | NC-09 – Minimum Font Size |
| REQ-17 | DEF STAN 00-250 §9.4 / IEC 61511 | NC-10 – Functional Segregation |
| REQ-18 | DEF STAN 00-250 §12 | NC-12 – Mixed Localisation |
| REQ-19 | Security | NC-11 – Hardcoded Credentials |
