# HMI Application Requirements

**Application:** hmi-demo  
**Date:** 2026-04-27  
**References:** WCAG 2.1, ISO 9241-110, OWASP ASVS, Nielsen's Usability Heuristics

---

## 1. Scope

This document defines the functional, non-functional, and security requirements for a generic Human-Machine Interface (HMI) application. Requirements are technology-agnostic and applicable to any web or desktop front-end that monitors and controls a connected device or back-end system. Each requirement carries a unique identifier for traceability and verification.

---

## 2. Requirements

### REQ-01 – Persistent System Status Display

The application shall permanently display the overall system status using a consistent colour scheme (e.g. green / amber / red) and iconography. Status indicators shall remain visible at all times regardless of the currently active view or page.

---

### REQ-02 – Contextual Feedback with Differentiated Severity

The application shall provide contextual feedback messages to the user, differentiated by visual severity level (informational / success / warning / error). Feedback messages shall be accessible to screen readers via appropriate ARIA live-region attributes (`role="status"` or `role="alert"`).

---

### REQ-03 – Theme Support with Minimum Contrast Ratio

The application shall offer at least one light and one dark presentation theme. The active theme shall be persisted across sessions. Regardless of the active theme, the text-to-background contrast ratio shall meet or exceed the WCAG 2.1 AA minimum of 4.5:1 for normal text.

---

### REQ-04 – Bounded Navigation Hierarchy

The navigation structure shall not exceed three levels of depth. The current location within the hierarchy (breadcrumb or equivalent) shall always be visible to the user. A Back control and a Home action shall be accessible from every view.

---

### REQ-05 – Visual Distinction of Read-Only Fields

Read-only data fields shall be visually distinguished from editable input controls through consistent styling (e.g. dedicated icon, reduced opacity, or background colour) so that users cannot mistake them for modifiable controls.

---

### REQ-06 – Unsaved-Changes Management

Views that allow data entry or command dispatch shall track a local draft state, highlight pending (unsaved) changes visually, provide an explicit discard action, and require a separate explicit submit/confirm action. On submission failure the view shall restore the previously committed state and notify the user of the error.

---

### REQ-07 – Keyboard and Screen-Reader Accessibility

All interactive controls shall be fully operable via keyboard (Tab navigation, Enter / Space activation). Controls shall expose appropriate ARIA roles (e.g. `role="button"`, `role="switch"`), states (e.g. `aria-pressed`, `aria-disabled`, `aria-readonly`), and labels (`aria-label` or `aria-labelledby`). Logical focus order shall be enforced.

---

### REQ-08 – Authentication, Role-Based Access Control, and Session Management

The application shall require user authentication before granting access. Role-Based Access Control (RBAC) shall be enforced in the UI, restricting view and action visibility based on the authenticated user's role. Sessions shall automatically expire after a configurable period of inactivity. All authentication events (login, logout, failure) shall be recorded in an access log.

---

### REQ-09 – Two-Step Confirmation for Destructive or Irreversible Actions

Any action that is destructive, irreversible, or has significant side effects shall require an explicit two-step confirmation before execution. A confirmation dialog or equivalent secondary interaction shall be presented to the user before the action is dispatched.

---

### REQ-10 – Audit Trail for Commands and Parameter Changes

Every command issued and every parameter modification shall be recorded with: timestamp, user identity, action or parameter name, and previous and new values where applicable. Audit records shall not be modifiable by end users.

---

### REQ-11 – Network Timeout and Error Handling

All network requests shall be subject to a configurable timeout. Requests that exceed the timeout shall be cancelled and the user shall be notified with a descriptive error message. A retry policy with a bounded maximum number of attempts and exponential back-off shall be implemented to handle transient network failures gracefully.

---

### REQ-12 – Real-Time Connection Status Indicator

The application shall display a persistent indicator reflecting the current connectivity state to the back-end (e.g. connected / disconnected / degraded). The indicator shall update automatically when the connection state changes.

---

### REQ-13 – Minimum Touch Target Dimensions

All interactive touch targets (buttons, icons, form controls) shall measure at least 44 × 44 CSS pixels to comply with WCAG 2.5.5 (AAA) and common mobile usability guidelines, ensuring reliable interaction on touch-screen devices.

---

### REQ-14 – Responsive Layout

The application shall adapt its layout to the viewport size and support at minimum two breakpoints (mobile and desktop). Critical controls and data shall remain usable and readable at any supported viewport size without horizontal scrolling.

---

### REQ-15 – Stale Data Warning

When the connection to the data source is interrupted or data has not been refreshed within a configurable interval, the application shall explicitly indicate that displayed values may be outdated (e.g. via a timestamp, overlay badge, or greyed styling). The stale indication shall persist until a fresh update is received.

---

### REQ-16 – Minimum Font Size for Readability

All operationally relevant text (labels, navigation items, status indicators) shall be rendered at a minimum size of 14 px (approximately 10.5 pt at 96 dpi) to ensure readability across common display sizes.

---

### REQ-17 – Separation of Read and Write Functions

Write/action controls (buttons, forms that modify state) shall be logically and visually separated from read-only monitoring displays. Actions that modify critical state shall require explicit navigation or an elevated privilege level and shall not be co-located with passive monitoring at the same interaction depth.

---

### REQ-18 – Internationalisation (i18n)

The user interface shall present all user-visible text through an internationalisation framework (i18n), allowing language and locale to be changed without code modification. All text shall originate from localisation resource files; hardcoded user-visible strings are not acceptable.

---

### REQ-19 – No Hardcoded Credentials or Secrets

Authentication credentials, API keys, tokens, and any other secrets shall not be hardcoded in source code, configuration files committed to version control, or client-side assets. Production builds shall not include development or simulator authentication stubs.

---

### REQ-20 – Performance Budget

The application shall achieve a Largest Contentful Paint (LCP) of ≤ 2.5 s and a Time to Interactive (TTI) of ≤ 3.5 s on a mid-range device over a simulated 4G connection, as measured by Lighthouse or an equivalent profiling tool.

---

### REQ-21 – Error Boundary and Graceful Degradation

Unhandled runtime errors within any view component shall be caught by an error boundary and shall not cause the entire application to become unresponsive. The user shall be presented with a friendly error message and offered an action to recover (e.g. reload the view or navigate home).

---

### REQ-22 – Input Validation and Sanitisation

All user-supplied input shall be validated on the client side before submission and independently validated on the server side. Input fields shall enforce appropriate constraints (type, range, maximum length). Displayed data originating from external sources shall be sanitised to prevent injection attacks.

---

## 3. Traceability Matrix

| Requirement | Category | Area |
|---|---|---|
| REQ-01 | UI / Feedback | Persistent Status Bar |
| REQ-02 | UI / Feedback | Notification and Alert System |
| REQ-03 | UI / Theming | Theme and Contrast |
| REQ-04 | Navigation | Hierarchical Navigation |
| REQ-05 | UI / Data Display | Read-Only Field Distinction |
| REQ-06 | Data Integrity | Unsaved-Changes Management |
| REQ-07 | Accessibility | Keyboard and ARIA |
| REQ-08 | Security | Authentication, RBAC, Session |
| REQ-09 | Safety / UX | Destructive Action Confirmation |
| REQ-10 | Security / Compliance | Audit Trail |
| REQ-11 | Resilience | Network Timeout and Retry |
| REQ-12 | UI / Feedback | Connection Status Indicator |
| REQ-13 | Accessibility / Mobile | Touch Target Size |
| REQ-14 | UI / Responsive | Responsive Layout |
| REQ-15 | Data Integrity | Stale Data Warning |
| REQ-16 | Accessibility / Readability | Minimum Font Size |
| REQ-17 | Safety / UX | Read/Write Separation |
| REQ-18 | Localisation | Internationalisation |
| REQ-19 | Security | No Hardcoded Secrets |
| REQ-20 | Performance | Performance Budget |
| REQ-21 | Resilience | Error Boundary |
| REQ-22 | Security | Input Validation and Sanitisation |
