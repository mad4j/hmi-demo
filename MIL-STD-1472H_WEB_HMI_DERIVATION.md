# MIL-STD-1472H-Derived Specification for Military Web HMI

## 1. Purpose
This document identifies the MIL-STD-1472H sections applicable to a military Web HMI and provides a derivation into verifiable design requirements.

This is a technical derivation document: it does not replace the original standard text, which remains the authoritative source.

## 2. Derivation Method
The derivation was performed using the following steps:

1. Analysis of the MIL-STD-1472H structure (table of contents and section hierarchy).
2. Selection of clauses with direct impact on human-system interaction, visual presentation, alarms, error management, cybersecurity, and information systems.
3. Translation of each requirement from the "system/equipment" domain into implementation patterns for a web interface (browser + front-end + backend API).
4. Production of testable requirements with verification criteria.
5. Bidirectional traceability to the originating section.

Applicability criteria used:

- High: the clause is directly applicable to Web HMI UI/UX.
- Medium: the clause requires browser-context adaptation or depends on CONOPS.
- Low: the clause is primarily physical/mechanical and only indirectly relevant.

## 3. MIL-STD-1472H Sections Applicable to a Web HMI

### 3.1 High-Applicability Sections
- 4.6.1 Fail-safe design
- 4.8 Interaction
- 4.13 Automation (including 4.13.4 mode indication)
- 4.14 Functional use of color
- 5.1.3 Information system controls
- 5.2.1 General visual display requirements
- 5.2.2 Electronic display requirements
- 5.7.2 Display of warnings and hazards
- 5.7.3 Visual alerting systems
- 5.7.19 Software safety
- 5.16 Cybersecurity (5.16.1-5.16.6)
- 5.17 Information systems (5.17.2-5.17.32)

### 3.2 Medium-Applicability Sections
- 5.3.x Speech and audio systems (only if auditory alerts are implemented)
- 5.4 Labeling and marking (translated into digital labeling and microcopy)
- 5.5.3 Workspace lighting (translated into contrast, glare handling, themes, luminance)
- 5.8 Anthropometric accommodation (translated into touch targets, reachability, PPE use)
- 5.12.2/5.12.4 Teleoperation/UxV (if the HMI controls remote systems)
- 5.19.5 Application design for PEDs (responsive/mobile deployment)

### 3.3 Low-Applicability Sections (Typically Outside Web HMI Scope)
- Mechanical sections, physical platform ergonomics, valves, weapon hardware, and physical handling.
- These remain binding at overall system level, but are not primarily software UI requirements.

## 4. Formal Requirements (Shall Language + Acceptance Criteria)

### RQ-WEB-MIL-001 - Continuous Visibility of Critical State
Requirement statement:
The UI shall persistently display mission state, connectivity state, operating mode, time synchronization state, and security/comms state in an always-visible status area.

Acceptance criteria:
- AC-001.1: The status area remains visible in all operational pages and critical workflows.
- AC-001.2: Each mandatory state field is present and machine-updated at runtime.
- AC-001.3: If data for a state field is unavailable, the field shows an explicit degraded/stale indicator.

Derivation rationale:
From 5.2.1 and 4.13.4. The original requirement mandates state and operating mode visibility. In a web context, this is translated into a non-dismissible status area throughout navigation.

### RQ-WEB-MIL-002 - Temporal Feedback for Operator Actions
Requirement statement:
Each operator command shall produce visible acknowledgement feedback within <= 200 ms UI-side for local feedback events.

Acceptance criteria:
- AC-002.1: For all mapped UI commands, local acknowledgement is rendered within 200 ms in at least 95% of samples.
- AC-002.2: Delayed backend completion states are represented separately from immediate acknowledgement.
- AC-002.3: Repeated command attempts are inhibited while command state is pending, unless explicitly permitted.

Derivation rationale:
From 5.2 (visual displays) and 5.17 (dialogs/errors/notifications). The original requirement on display response is derived into immediate feedback constraints to prevent repeated or ambiguous actions.

### RQ-WEB-MIL-003 - Alarm Hierarchy and Redundant Coding
Requirement statement:
The HMI shall implement alarm severities (critical, warning, caution, info) using redundant coding composed of color, iconography, explicit text, and visual priority.

Acceptance criteria:
- AC-003.1: Every alarm includes severity text label and icon in addition to color.
- AC-003.2: Alarm lists are ordered by severity then recency.
- AC-003.3: Color-blind simulation checks preserve alarm discriminability by non-color channels.

Derivation rationale:
From 5.7.2, 5.7.3, 4.14, and 5.17.24-5.17.32. Reliance on color-only signaling is avoided to preserve robustness under stress and degraded visual conditions.

### RQ-WEB-MIL-004 - Protection of High-Impact Operations
Requirement statement:
Irreversible or high-risk operations shall require a guarded two-step sequence (pre-arm and contextual confirmation) with an explicit timeout.

Acceptance criteria:
- AC-004.1: High-impact actions cannot execute from a single click/tap.
- AC-004.2: The confirmation step includes action scope and consequence summary.
- AC-004.3: Pre-armed state expires automatically after a configured timeout.

Derivation rationale:
From 4.6.1, 5.7.19, and information system control principles (5.1.3, 5.17). This maps fail-safe/software safety concepts to critical software commands.

### RQ-WEB-MIL-005 - Software Interlocks and Safety Preconditions
Requirement statement:
The system shall block command execution when defined safety preconditions are not satisfied.

Acceptance criteria:
- AC-005.1: At least link state, crypto state, and mode constraints are checked before execution where applicable.
- AC-005.2: Blocked commands return explicit reason codes visible to the operator.
- AC-005.3: Client-side disabling is backed by server-side enforcement.

Derivation rationale:
From 4.6, 5.7.19, and 5.16.6. Hazardous-state prevention is implemented through application and workflow interlocks.

### RQ-WEB-MIL-006 - Explicit Real/Simulated Mode Distinction
Requirement statement:
Simulated mode shall be continuously distinguishable from real mode by persistent mode indicators and differentiated visual treatment.

Acceptance criteria:
- AC-006.1: A persistent simulation banner is displayed in all simulation screens.
- AC-006.2: The simulation theme is visually distinct from real operations.
- AC-006.3: Mode transitions generate explicit operator notifications.

Derivation rationale:
From 5.16.6. The simulated-mode distinction clause is translated into anti-mode-confusion front-end controls.

### RQ-WEB-MIL-007 - Identification, Authentication, and Role-Based Access Control
Requirement statement:
The HMI shall enforce strong user identification/authentication and RBAC or ABAC authorization across UI and API layers.

Acceptance criteria:
- AC-007.1: Unauthorized users cannot access protected routes or APIs.
- AC-007.2: Permission changes are reflected in both UI action availability and backend authorization decisions.
- AC-007.3: Privileged actions require authenticated identity with auditable attribution.

Derivation rationale:
From 5.16.1 and 5.16.2. The web derivation requires consistency between UI rendering, action enablement, and server-side authorization.

### RQ-WEB-MIL-008 - Secure Logon/Logoff and Inactivity Timeout
Requirement statement:
The HMI shall provide explicit logon/logoff controls and enforce inactivity timeout with controlled session lock and restoration.

Acceptance criteria:
- AC-008.1: Session lock occurs after configured inactivity interval.
- AC-008.2: Sensitive screens are inaccessible until re-authentication.
- AC-008.3: Explicit logoff invalidates active session tokens.

Derivation rationale:
From 5.16.3 and 5.16.4. This prevents unauthorized use of shared or unattended terminals.

### RQ-WEB-MIL-009 - Data Protection in Transit and at Presentation Layer
Requirement statement:
Operational and sensitive data shall be protected in transit and at presentation, including encrypted transport, selective masking, anti-cache controls, and governed export behavior.

Acceptance criteria:
- AC-009.1: All authenticated endpoints require secure transport.
- AC-009.2: Sensitive fields are masked according to user role and context.
- AC-009.3: Sensitive views set no-store style cache controls and block uncontrolled export paths.

Derivation rationale:
From 5.16.5. The cybersecurity requirement is translated into concrete web data controls.

### RQ-WEB-MIL-010 - Recovery-Oriented Error Management
Requirement statement:
The HMI shall present recoverable error messages with operational impact, probable cause, recommended action, event code, and retry state.

Acceptance criteria:
- AC-010.1: Error dialogs and inline messages include an event/reference code.
- AC-010.2: User-facing recovery guidance is provided for all non-fatal errors.
- AC-010.3: Retry state is visible when automatic or manual retry mechanisms apply.

Derivation rationale:
From 5.17.10, 5.17.9, and 5.17.12. General error requirements are converted into recoverability-focused UX patterns.

### RQ-WEB-MIL-011 - Unambiguous Dialogs and Notifications
Requirement statement:
Dialogs, prompts, and notifications shall be contextual, semantically consistent, and configured with safe defaults.

Acceptance criteria:
- AC-011.1: Destructive actions are never assigned as default focus/submit action.
- AC-011.2: Prompts include explicit object/action identification.
- AC-011.3: Notification terminology is standardized across modules.

Derivation rationale:
From 5.17.2, 5.17.7, and 5.17.13. This reduces confirmation mistakes and inadvertent activation.

### RQ-WEB-MIL-012 - Consistent Navigation and Controlled Depth
Requirement statement:
The information architecture shall remain stable and provide clear path context with bounded navigation depth for critical tasks.

Acceptance criteria:
- AC-012.1: Critical workflows expose page/path context (breadcrumb or equivalent).
- AC-012.2: Critical task paths do not exceed defined maximum interaction depth.
- AC-012.3: Equivalent tasks use consistent navigation patterns across modules.

Derivation rationale:
From 4.8 and 5.17.20. This derives a predictable and controllable workflow requirement.

### RQ-WEB-MIL-013 - Operational Readability and Contrast
Requirement statement:
The UI shall maintain readability and contrast under expected operational conditions, including day/night and degraded visual contexts.

Acceptance criteria:
- AC-013.1: Text and critical UI elements meet defined minimum contrast thresholds.
- AC-013.2: Theme switching preserves semantic color meaning and alert hierarchy.
- AC-013.3: Readability validation is executed under representative luminance profiles.

Derivation rationale:
From 4.14, 5.2, 5.5.3, 5.17.18, and 5.17.25-5.17.27. Display/color/lighting clauses are translated into contrast and theme requirements.

### RQ-WEB-MIL-014 - PPE and Touch Input Compatibility
Requirement statement:
Critical controls shall be sized and spaced for reliable use with gloves/PPE and touch interaction.

Acceptance criteria:
- AC-014.1: Touch targets for critical actions meet defined minimum size and spacing.
- AC-014.2: Usability tests with representative PPE users confirm acceptable error rate.
- AC-014.3: No critical action relies on hover-only interaction.

Derivation rationale:
From 5.8 and 5.17.16. Anthropometric criteria are translated into touch-target and equipped-user validation requirements.

### RQ-WEB-MIL-015 - Multimodal Alerting Redundancy
Requirement statement:
When auditory alerting is used, visual alert equivalence shall be provided and user-configurable where mission policy permits.

Acceptance criteria:
- AC-015.1: Every auditory alert has a synchronized visual counterpart.
- AC-015.2: Alert channel configuration follows role/policy constraints.
- AC-015.3: Muted or unavailable audio state is visibly indicated.

Derivation rationale:
From 5.3.x and 5.7.x. Audio is not permitted as the sole alarm channel in Web HMI operation.

### RQ-WEB-MIL-016 - Operational Traceability of User Actions
Requirement statement:
Mission-relevant user actions shall be audit logged with identity, timestamp, mission context, outcome, and event correlation metadata.

Acceptance criteria:
- AC-016.1: Audit records are generated for all privileged and high-impact actions.
- AC-016.2: Timestamps are synchronized to approved time source.
- AC-016.3: Audit records support end-to-end correlation with system events.

Derivation rationale:
From 5.16 and 5.17.11. This supports accountability in multi-user mission-critical systems.

### RQ-WEB-MIL-017 - Cross-Device and PED Consistency
Requirement statement:
The HMI shall preserve equivalent operational semantics, security controls, and feedback behavior across approved desktop and PED targets.

Acceptance criteria:
- AC-017.1: Core mission workflows produce equivalent outcomes on all supported device classes.
- AC-017.2: Security controls are functionally identical across device classes.
- AC-017.3: Responsive adaptations do not remove required safety indicators.

Derivation rationale:
From 5.19.5 and 5.17.22. This enables responsive deployment without operational safety regression.

### RQ-WEB-MIL-018 - Teleoperation Safety Context (If Applicable)
Requirement statement:
For remote-control workflows, the UI shall continuously display link latency, link quality, command ownership, and remote actuator state.

Acceptance criteria:
- AC-018.1: All remote-control screens expose the required four indicators.
- AC-018.2: Command execution is blocked or guarded when telemetry is stale beyond threshold.
- AC-018.3: Ownership conflicts are explicitly shown before command dispatch.

Derivation rationale:
From 5.12.2/5.12.4, 4.13, and 5.7.19. This reduces mode confusion and inconsistent commands on remote systems.

## 5. Traceability Table to MIL-STD-1472H

| Derived requirement | Original MIL-STD-1472H section | Applicability | Derivation type | Derivation note |
| --- | --- | --- | --- | --- |
| RQ-WEB-MIL-001 | 5.2.1, 4.13.4 | High | Direct + adapted | State and mode visibility translated into persistent status bar |
| RQ-WEB-MIL-002 | 5.2, 5.17 | High | Derived | Display responsiveness translated into immediate UI feedback |
| RQ-WEB-MIL-003 | 5.7.2, 5.7.3, 4.14, 5.17.24-32 | High | Derived | Normative coding translated into redundant alarm representation |
| RQ-WEB-MIL-004 | 4.6.1, 5.7.19, 5.1.3 | High | Derived | Fail-safe/software safety translated into guarded actions |
| RQ-WEB-MIL-005 | 4.6, 5.7.19, 5.16.6 | High | Derived | Application interlocks on safety preconditions |
| RQ-WEB-MIL-006 | 5.16.6 | High | Direct | Real/simulation distinction made persistent in UI |
| RQ-WEB-MIL-007 | 5.16.1, 5.16.2 | High | Direct + adapted | Access control and auth applied to web app and APIs |
| RQ-WEB-MIL-008 | 5.16.3, 5.16.4 | High | Direct | Logon/logoff/timeouts in browser session lifecycle |
| RQ-WEB-MIL-009 | 5.16.5 | High | Derived | Data protection translated into web client/server controls |
| RQ-WEB-MIL-010 | 5.17.10, 5.17.9, 5.17.12 | High | Direct + adapted | Error management transformed into recovery-focused UX |
| RQ-WEB-MIL-011 | 5.17.2, 5.17.7, 5.17.13 | High | Direct + adapted | Dialog/prompt consistency and safe defaults |
| RQ-WEB-MIL-012 | 4.8, 5.17.20 | High | Derived | Interaction + information organization translated into navigable IA |
| RQ-WEB-MIL-013 | 4.14, 5.2, 5.5.3, 5.17.18, 5.17.25-27 | High | Derived | Display/color/lighting translated into contrast strategy |
| RQ-WEB-MIL-014 | 5.8, 5.17.16 | Medium | Derived | Anthropometry/PPE translated into touch target and spacing |
| RQ-WEB-MIL-015 | 5.3.x, 5.7.x | Medium | Derived | Audio alerting made optional and redundant to visual channel |
| RQ-WEB-MIL-016 | 5.16, 5.17.11 | High | Derived | Cyber + multi-user access translated into audit trail |
| RQ-WEB-MIL-017 | 5.19.5, 5.17.22 | Medium | Derived | PED application design translated into responsive operational parity |
| RQ-WEB-MIL-018 | 5.12.2, 5.12.4, 4.13, 5.7.19 | Medium | Derived | Teleoperation safety context translated into UI indicators |

## 6. General Translation Rationale (Original -> Web)

The derivation was guided by three rules:

1. Preserve human-factors intent.
   The original requirement is kept in its objective (safety, situation awareness, error prevention), even when the technical medium changes.

2. Replace physical constraints with equivalent digital constraints.
   Example: criteria for physical panels/instruments are mapped to persistent layouts, UI states, guided workflows, and software controls.

3. Ensure operational verifiability.
   Each derived requirement is expressed in testable form (UI behavior, logging, latency, consistency, policy).

## 7. Limits and Assumptions
- This specification covers the web HMI software dimension; purely mechanical/environmental requirements remain at host-system level.
- Final numeric thresholds (latency, touch dimensions, NVG contrast) must be finalized according to CONOPS, hardware platform, and operational testing.
- Where a MIL clause is broad, the mapping is marked as "Derived" and requires validation by program authority.
