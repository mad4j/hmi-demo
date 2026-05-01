# Unified HMI Requirements Specification - Tactical Radio

Version: 1.1
Date: 2026-04-30

## 1. Scope

This document defines a single, consistent, and verifiable set of HMI requirements for tactical radio operation. It consolidates and refines requirements from multiple sources, including MIL-STD-1472H, DEF STAN 00-250, and STANAG 4586, among others. The goal is to create a unified specification that can guide design, development, and verification of the HMI while ensuring compliance with relevant human factors principles and operational needs.

## 2. Requirement Conventions

- Requirement IDs use format HMI-REQ-XXX.
- "SHALL" indicates mandatory behavior.
- Unless otherwise specified, all pixel-based dimensions are referenced at 96 dpi (CSS pixel grid).
- Verification methods:
  - Inspection (I)
  - Analysis (A)
  - Test (T)
  - Usability Test (UT)
  - Environmental Test (ET)

## 3. HMI Requirements

### 3.1 Persistent Operational Awareness

#### HMI-REQ-001 - Persistent communication state

The system SHALL continuously display communication state (TX, RX, IDLE) in a dedicated non-overlapping region visible on every screen.

- Verification: I + T
- Acceptance: Update latency <= 200 ms; visible in 100% of screens.
- Rationale: Continuous state visibility reduces operator uncertainty and supports timely decisions in dynamic mission phases.

#### HMI-REQ-002 - Persistent active channel indicator

The system SHALL continuously display the active channel identifier through a persistent visual element on every screen.

- Verification: T
- Acceptance: Operator recognition <= 1 s in normal operating conditions.
- Rationale: Immediate channel awareness reduces selection errors and communication delays.

#### HMI-REQ-004 - System-under-control indicator

The system SHALL continuously indicate control authority state: LOCAL_OPERATOR, REMOTE_OPERATOR, AUTONOMOUS.

- Verification: I + T
- Acceptance: Indicator is driven by real-time platform status and updates <= 500 ms from data change.
- Rationale: Explicit control authority indication prevents unsafe actions when command ownership changes (e.g., remote takeover from an SNMP-attached control station)

#### HMI-REQ-040 - Persistent cryptographic state and configuration indicator

The system SHALL continuously display the active cryptographic state and configuration (e.g., algorithm identifier, key tag/ID, and operational algorithm and context, such as NATO or NATIONAL) in a dedicated persistent status region visible on every screen.

- Verification: I + T
- Acceptance: Cryptographic state indicator reflects the current hardware/software crypto engine status and updates <= 500 ms from any state change; visible on 100% of screens.
- Rationale: Continuous visibility of the operative cryptographic configuration prevents inadvertent transmission under an incorrect or unintended security posture.

#### HMI-REQ-041 - Plain-text / Cipher-text communication mode indicator

The system SHALL display a persistent, unambiguous indicator that distinguishes whether the active communication link is operating in plain-text mode (PT) or cipher-text mode (CT), using distinct visual coding (e.g., dedicated icon, label, and/or color token) that cannot be confused with any other status element.

- Verification: I + T
- Acceptance: PT/CT indicator is legible at normal operator viewing distance; updates within 200 ms of mode change; a CAUTION-level alert is raised whenever the link transitions to or remains in PT mode during a mission-active state.
- Rationale: Explicit PT/CT differentiation prevents operators from transmitting sensitive information over an unencrypted link, reducing the risk of unintended emission of classified or sensitive traffic.

#### HMI-REQ-042 - Persistent system fault state indicator

The system SHALL continuously display a FAULT condition indicator whenever one or more internal subsystems (RF, crypto, power, DSP) report a fault state, using a dedicated visual element distinct from general status icons.

- Verification: I + T
- Acceptance: FAULT indicator appears within 500 ms of fault detection and remains visible until the fault is cleared; the indicator is unambiguously distinguishable from CAUTION and ALARM states.
- Rationale: An explicit FAULT indicator enables operators to immediately recognise degraded system integrity and take corrective action without having to navigate to a diagnostic page.

#### HMI-REQ-043 - Persistent radio silence state indicator

The system SHALL continuously display a RADIO SILENCE indicator whenever both transmission (Tx) and reception (Rx) are disabled, using a dedicated, high-salience visual element visible on every screen.

- Verification: I + T
- Acceptance: RADIO SILENCE indicator appears within 200 ms of entering the radio-silence state and is immediately distinguishable from the standard IDLE communication state; a CAUTION-level alert is raised on entry and on exit from radio-silence mode.
- Rationale: Unambiguous radio-silence indication prevents operators from mistaking an inhibited link for a functioning idle link, reducing the risk of missed communications or unintended RF emission.

#### HMI-REQ-044 - Persistent GPS connectivity indicator

The system SHALL continuously display GPS connectivity status (ACQUIRED, DEGRADED, LOST) in a persistent visual element on every screen, updated from the active positioning subsystem.

- Verification: I + T
- Acceptance: GPS status indicator updates within 500 ms of a change in satellite lock or signal quality; DEGRADED and LOST states are coded with distinct visual treatment (amber and red respectively, or NVG-safe equivalents).
- Rationale: Continuous GPS status visibility is essential for position-dependent mission functions; silent GPS loss can lead to incorrect reporting or navigation decisions.

#### HMI-REQ-045 - Persistent mission time display

The system SHALL continuously display mission elapsed time (MET) or mission time-of-day (TOD) in a dedicated persistent region visible on every screen, synchronized to the platform time reference.

- Verification: I + T
- Acceptance: Mission time updates at least once per second; deviation from authoritative time reference is <= 1 s under normal operating conditions; the display remains visible regardless of the active page or active modal overlay.
- Rationale: A persistent mission time reference supports time-critical coordination, log correlation, and situational awareness without requiring navigation away from the current task.

#### HMI-REQ-003 - Persistent system status icons

The system SHALL permanently display global system status indicators using consistent iconography and three-level color semantics (NORMAL/CAUTION/ALARM mapped to green/amber/red or equivalent NVG-safe palette).

- Verification: I + T
- Acceptance: Status bar remains visible regardless of active page.
- Rationale: Persistent and consistent status semantics improve recognition speed under workload.

### 3.2 Feedback, Alerts, and Human Factors

#### HMI-REQ-005 - Input feedback latency

The system SHALL provide perceptible feedback for every operator input within 100 ms.

- Verification: T
- Acceptance: >= 99% of interactions satisfy latency target.
- Rationale: Fast feedback confirms command reception and lowers repeated input risk.

#### HMI-REQ-006 - Severity-classified notifications

The system SHALL classify and render feedback messages with distinct severity levels: NORMAL, SUCCESS, WARNING, ERROR, CRITICAL.

- Verification: I + T
- Acceptance: Each severity has unique and consistent visual treatment.
- Rationale: Severity differentiation helps operators prioritize attention and response.

#### HMI-REQ-007 - Critical alert acknowledgement

Critical alerts SHALL be perceivable within 1 second and require explicit operator acknowledgement before dismissal.

- Verification: T
- Acceptance: No auto-dismiss permitted for CRITICAL severity.
- Rationale: Mandatory acknowledgment ensures critical events are consciously assessed before continuation.

#### HMI-REQ-008 - Multimodal transmission-start feedback

The system SHALL provide at least two feedback modalities when transmission starts (e.g., visual and audible/haptic where available).

- Verification: I + T
- Acceptance: Event confirmation remains detectable under high workload conditions.
- Rationale: Multimodal confirmation improves detectability in noisy, vibrating, or visually saturated environments.

#### HMI-REQ-009 - Read-only field distinction

The system SHALL clearly distinguish read-only parameters from editable controls using iconography and/or visual styling.

- Verification: I
- Acceptance: Read-only controls expose a non-editable affordance and cannot be mistaken for writable inputs.
- Rationale: Clear read-only affordances prevent unintended modification attempts.

#### HMI-REQ-010 - Minimum touch target size

All interactive controls SHALL provide a hit area of at least 48 px x 48 px, referenced at 96 dpi.

- Verification: I + T
- Acceptance: 100% of actionable controls meet minimum size.
- Rationale: Minimum hit areas reduce input errors during motion, stress, or gloved operation.

#### HMI-REQ-011 - Minimum operational font size

Operationally relevant text SHALL use a minimum rendered size of 16 px equivalent, referenced at 96 dpi.

- Verification: I
- Acceptance: Parameter labels, navigation labels, counters, and status text meet minimum size.
- Rationale: Minimum text size preserves readability and reduces interpretation errors.

### 3.3 Navigation and Interaction Efficiency

#### HMI-REQ-012 - Navigation depth limit

Mission-critical functions SHALL be reachable within a maximum of 3 navigation levels.

- Verification: A + T
- Acceptance: No critical workflow exceeds depth 3.
- Rationale: Bounded depth reduces cognitive load and shortens access time to critical functions.

#### HMI-REQ-013 - Persistent navigation context and controls

The system SHALL always show current navigation context and provide persistent Home and Back controls.

- Verification: I + T
- Acceptance: Home available in all screens; Back valid except at root.
- Rationale: Persistent context and recovery controls improve orientation and error recovery.

#### HMI-REQ-014 - Consistent navigation patterns

Navigation behavior, labels, and transitions SHALL be consistent across all menus and pages.

- Verification: I
- Acceptance: No conflicting interaction patterns for equivalent actions.
- Rationale: Consistent interaction patterns reduce training time and mode confusion.

#### HMI-REQ-015 - Channel switch interaction budget

The system SHALL permit channel switching in no more than 2 discrete user actions.

- Verification: UT + T
- Acceptance: >= 95% users complete channel switch <= 3 s.
- Rationale: Reduced interaction steps improve operational tempo and reduce mis-selections.

#### HMI-REQ-016 - Transmission initiation simplicity

The system SHALL permit transmission initiation through a single operator action.

- Verification: T
- Acceptance: Command-to-feedback latency <= 150 ms.
- Rationale: Single-action transmission supports rapid response in time-critical communication.

### 3.4 Transaction Safety and Command Governance

#### HMI-REQ-017 - Transaction draft model

Command-capable pages SHALL implement local draft state, visible pending-change highlighting, explicit Reset (discard), and explicit Submit actions.

- Verification: I + T
- Acceptance: Draft changes are not committed until Submit.
- Rationale: Draft semantics prevent unintended live changes and support deliberate commit behavior.

#### HMI-REQ-018 - Rollback on backend failure

If command submission fails, the system SHALL automatically roll back affected values to last committed state and notify the operator.

- Verification: T
- Acceptance: No partial committed state remains visible after failure.
- Rationale: Rollback preserves consistency and operator trust after failed transactions.

#### HMI-REQ-019 - Two-step confirmation for high-impact commands

Irreversible or high-impact commands (e.g., RESET_ALARMS, GPS_RESET, REBOOT) SHALL require two-step operator confirmation before dispatch.

- Verification: I + T
- Acceptance: Command dispatch blocked until confirmation sequence is complete.
- Rationale: Two-step confirmation mitigates accidental activation of irreversible actions.

#### HMI-REQ-020 - Functional segregation of critical controls

Command/write controls SHALL be physically or logically segregated from monitoring/read-only information, and critical actions SHALL require explicit navigation and suitable privilege level.

- Verification: I + A
- Acceptance: Critical actions are not colocated at equivalent prominence with passive monitoring controls.
- Rationale: Functional separation lowers inadvertent activation risk and supports defense-in-depth.

#### HMI-REQ-021 - Transmission inhibit when encryption required

The system SHALL inhibit transmission whenever mission policy requires encryption and encryption is not active.

- Verification: T
- Acceptance: TX action blocked in all such states.
- Rationale: Transmission inhibition enforces communication security policy in constrained scenarios.

#### HMI-REQ-022 - Explicit encryption state indicator

The system SHALL display encryption state using unambiguous encoding (SECURE/PLAIN) continuously during operation.

- Verification: T
- Acceptance: State visible and readable in all operational screens.
- Rationale: Explicit crypto-state visibility supports correct tactical communication decisions.

#### HMI-REQ-039 - Transmission inhibit during critical radio operations

The system SHALL inhibit both Tx (outgoing transmission) and Rx (incoming reception) capabilities of the controlled radio apparatus whenever the apparatus signals that a critical operation requiring radio silence is active. During the inhibit period the system SHALL:

1. Prevent the operator from issuing any Tx or Rx command, with a clear visual indication that the controls are inhibited.
2. Display a persistent operator notification identifying the nature of the active critical operation and the reason for the communication inhibition.
3. Provide no operator-level path to override the inhibit state.
4. Release the inhibit automatically upon apparatus confirmation that the critical operation is complete.
5. Record the start and end of each inhibit period in the operational audit trail.

- Verification: T + I
- Acceptance: (a) Tx/Rx commands are blocked for the full duration of any active critical operation signaled by the apparatus; (b) the inhibit notification is visible and identifies the active critical operation; (c) no manual bypass path exists; (d) audit records are generated for each inhibit-start and inhibit-end event.
- Rationale: Transmission or reception during critical radio operations can corrupt system state, expose key material, or produce inadvertent RF emissions that violate COMSEC and RF management procedures. Automatic inhibition with no operator override is a fundamental safety and security requirement for tactical radio systems operating under NATO COMSEC procedures and SDR software-update lifecycles.

### 3.5 Security, Identity, and Auditability

#### HMI-REQ-023 - Authentication and role-based access control

The system SHALL enforce authentication and role-based visibility/authorization for pages and actions (minimum roles: OPERATOR, SUPERVISOR, MAINTAINER).

- Verification: I + T
- Acceptance: Unauthorized actions/pages are inaccessible in UI and rejected on invocation.
- Rationale: RBAC limits exposure of privileged functions and reduces misuse risk.

#### HMI-REQ-024 - Session timeout

The system SHALL enforce configurable inactivity timeout with automatic session termination.

- Verification: T
- Acceptance: Session closes after configured inactivity threshold.
- Rationale: Session timeout reduces unauthorized use after operator absence.

#### HMI-REQ-025 - Access and action audit trail

The system SHALL record authentication events, command executions, and parameter changes with timestamp, user identity, target, previous value, and new value where applicable.

- Verification: I + T
- Acceptance: Audit records are append-only for operators.
- Rationale: Tamper-resistant auditability supports accountability and post-event reconstruction.

#### HMI-REQ-026 - No hardcoded credentials

No production credential or authentication secret SHALL be hardcoded in source files, frontend scripts, or service workers.

- Verification: I + A
- Acceptance: Production build contains no embedded static credentials.
- Rationale: Eliminating embedded secrets reduces compromise probability and lateral risk.

### 3.6 Communications Resilience and Degraded Operation

#### HMI-REQ-027 - Configurable network timeout and cancellation

All network operations SHALL enforce configurable timeout and cancel requests that exceed threshold.

- Verification: T
- Acceptance: Timeout event generates operator-visible notification.
- Rationale: Deterministic timeout behavior prevents indefinite waits and hidden failures.

#### HMI-REQ-028 - Bounded retry with backoff

The communication layer SHALL apply bounded retry attempts with deterministic backoff under degraded links.

- Verification: T
- Acceptance: Retry count and backoff profile are configurable and capped.
- Rationale: Bounded retries improve resilience without causing uncontrolled traffic amplification.

#### HMI-REQ-029 - Stale data marking

When link to the controlled apparatus is interrupted, all displayed live parameters SHALL be marked as stale until fresh data is received.

- Verification: T
- Acceptance: Stale marking persists through outage and clears only after successful refresh.
- Rationale: Stale-data indication prevents decisions based on outdated information.

#### HMI-REQ-030 - Essential functionality in degraded mode

Under degraded conditions, the system SHALL preserve essential mission functions defined by operational profile.

- Verification: T
- Acceptance: Essential function list remains operable in simulated degraded scenarios.
- Rationale: Degraded-mode continuity preserves mission-critical operability under faults.

#### HMI-REQ-031 - Fallback interaction mode

The system SHALL provide a fallback interaction mode usable when primary display capabilities are reduced or unavailable.

- Verification: T
- Acceptance: Minimum command and status workflow remains executable.
- Rationale: Fallback interaction preserves minimum safe control when primary interaction paths degrade.

### 3.7 Accessibility, Visual Ergonomics, and Environmental Compatibility

#### HMI-REQ-032 - Keyboard and screen-reader accessibility

All interactive controls SHALL be keyboard operable and expose correct ARIA roles, states, and labels; focus order SHALL be deterministic.

- Verification: I + T
- Acceptance: All actions operable via keyboard only; screen-reader announces control purpose/state.
- Rationale: Accessibility requirements ensure equivalent control for keyboard and assistive technology users.

#### HMI-REQ-033 - Dark theme as operational default

The default theme SHALL be dark and optimized for low ambient light operation.

- Verification: I
- Acceptance: Default startup theme is dark.
- Rationale: Dark-default presentation supports low-ambient operational conditions and reduces glare.

#### HMI-REQ-034 - Contrast ratio minimum

Primary text contrast SHALL meet WCAG AA minimum ratio of 4.5:1.

- Verification: I + T
- Acceptance: All primary text meets or exceeds threshold.
- Rationale: Contrast compliance improves legibility and lowers interpretation errors.

#### HMI-REQ-035 - Daylight readability envelope

Display content SHALL remain readable at 50 cm across 0.1-10,000 lux operational envelope.

- Verification: ET
- Acceptance: Operator can correctly read required status and commands within envelope.
- Rationale: Readability across illuminance envelope ensures usable operation in field lighting extremes.

#### HMI-REQ-036 - NVG/NVIS compatibility mode

The system SHALL provide dedicated NVG/NVIS mode limiting emission according to MIL-STD-3009 / MIL-L-85762 constraints.

- Verification: T + ET
- Acceptance: Software mode available; hardware compliance confirmed by photometric test evidence.
- Rationale: NVIS compatibility reduces interference with night-vision operations.

### 3.8 Localization and Symbol Standards

#### HMI-REQ-037 - Language consistency

The UI SHALL use one consistent language per configured runtime profile; mixed-language presentation is not permitted.

- Verification: I
- Acceptance: No mixed-language labels/messages in same runtime profile.
- Rationale: Language consistency prevents ambiguity and comprehension delay.

#### HMI-REQ-038 - Tactical symbology consistency

Where tactical symbols are displayed, symbology SHALL conform to configured MIL-STD-2525 profile and remain consistent across views.

- Verification: I + T
- Acceptance: Symbol identity and meaning are preserved across all screens.
- Rationale: Symbol consistency preserves shared tactical meaning across contexts and operators.

## 4. External Specifications (Normative References)

- SPEC-001: MIL-STD-1472H - Human Engineering
- SPEC-002: DEF STAN 00-250 - Human Factors for Defence Systems
- SPEC-003: STANAG 4586 - UAS Control System Interoperability
- SPEC-004: ARP4754A - Guidelines for Development of Civil Aircraft and Systems
- SPEC-005: DO-178C - Software Considerations in Airborne Systems
- SPEC-006: MIL-L-85762 - NVIS Compatibility (legacy reference)
- SPEC-007: MIL-STD-3009 - Lighting, Aircraft, Night Vision Imaging System (NVIS) Compatible
- SPEC-008: MIL-STD-2525 - Common Warfighting Symbology
- SPEC-009: ISO 9241-110 - Dialogue Principles
- SPEC-010: IEC 61511 - Functional Safety for Process Industry Sector
- SPEC-011: WCAG 2.x AA - Contrast and Accessibility Criteria
- SPEC-012: STANAG 4691 - NATO Electronic Key Management System (EKMS) Interoperability Standard
- SPEC-013: SCA v4.1 - Software Communications Architecture (JTRS Joint Program Office)

## 5. Traceability Matrix (Requirements -> External Specifications and Clauses)

The table below links each consolidated requirement only to official specifications defined in Section 4 (SPEC-XXX), with clause-level references where available.

Traceability type legend:

- Direct: Explicit clause/section mapping is identified.
- Derived: Requirement is derived from official standard principles, but no single explicit clause is cited.
- Gap: Official source is relevant, but precise clause-level mapping still requires confirmation.

| Requirement | Linked specs | Official spec clause reference | Traceability type |
| --- | --- | --- | --- |
| HMI-REQ-001 | SPEC-001 | MIL-STD-1472H, section 5.2.1 (persistent status presentation principle) | Direct |
| HMI-REQ-002 | SPEC-001 | MIL-STD-1472H, section 5.2.1 (persistent status presentation principle) | Direct |
| HMI-REQ-003 | SPEC-001, SPEC-002 | MIL-STD-1472H, section 5.2.1; DEF STAN 00-250, section 6.3 | Direct |
| HMI-REQ-004 | SPEC-003 | STANAG 4586, section 6.3.2 | Direct |
| HMI-REQ-005 | SPEC-001, SPEC-009 | ISO 9241-110 (feedback and responsiveness dialogue principles) | Derived |
| HMI-REQ-006 | SPEC-001, SPEC-002 | MIL-STD-1472H, section 5.2.3; DEF STAN 00-250, section 6.3 | Direct |
| HMI-REQ-007 | SPEC-001, SPEC-003 | STANAG 4586, section 6.4 (operator confirmation/acknowledgement intent) | Direct |
| HMI-REQ-008 | SPEC-001, SPEC-009 | ISO 9241-110 (self-descriptiveness and feedback principles) | Derived |
| HMI-REQ-009 | SPEC-001 | MIL-STD-1472H, section 5.2.2.4 | Direct |
| HMI-REQ-010 | SPEC-001 | MIL-STD-1472H, section 5.8.6 | Direct |
| HMI-REQ-011 | SPEC-001 | MIL-STD-1472H, section 5.3.1.3 | Direct |
| HMI-REQ-012 | SPEC-001, SPEC-009 | MIL-STD-1472H, section 5.10; ISO 9241-110 (controllability/navigation consistency) | Direct |
| HMI-REQ-013 | SPEC-001 | MIL-STD-1472H, section 5.10 | Direct |
| HMI-REQ-014 | SPEC-009 | ISO 9241-110 (conformity with user expectations, consistency) | Derived |
| HMI-REQ-015 | SPEC-001, SPEC-009 | ISO 9241-110 (efficiency of dialogue) | Derived |
| HMI-REQ-016 | SPEC-001 | MIL-STD-1472H (task efficiency and control accessibility principles) | Gap |
| HMI-REQ-017 | SPEC-002 | DEF STAN 00-250, section 9.2 | Direct |
| HMI-REQ-018 | SPEC-002, SPEC-005 | DEF STAN 00-250, section 9.2; DO-178C (deterministic error handling objective) | Derived |
| HMI-REQ-019 | SPEC-001, SPEC-003 | MIL-STD-1472H, section 5.10.5; STANAG 4586, section 6.4 | Direct |
| HMI-REQ-020 | SPEC-002, SPEC-010 | DEF STAN 00-250, section 9.4; IEC 61511 (separation/protection principles) | Derived |
| HMI-REQ-021 | SPEC-001 | MIL-STD-1472H (error prevention and safety-oriented interaction principles) | Gap |
| HMI-REQ-022 | SPEC-001 | MIL-STD-1472H (state visibility and coding clarity principles) | Gap |
| HMI-REQ-023 | SPEC-001, SPEC-002 | MIL-STD-1472H, section 5.14; DEF STAN 00-250, section 10.1 | Direct |
| HMI-REQ-024 | SPEC-001, SPEC-002 | MIL-STD-1472H, section 5.14; DEF STAN 00-250, section 10.1 | Direct |
| HMI-REQ-025 | SPEC-001, SPEC-002 | MIL-STD-1472H, section 5.14.3; DEF STAN 00-250, section 10.3 | Direct |
| HMI-REQ-026 | SPEC-002 | DEF STAN 00-250, section 10 (security and access control context) | Gap |
| HMI-REQ-027 | SPEC-001, SPEC-005 | MIL-STD-1472H, section 5.2.6; DO-178C (timing determinism objectives) | Derived |
| HMI-REQ-028 | SPEC-001, SPEC-005 | MIL-STD-1472H, section 5.2.6; DO-178C (robust error recovery objectives) | Derived |
| HMI-REQ-029 | SPEC-001, SPEC-004 | MIL-STD-1472H, section 5.2.7; ARP4754A, section 5.3 | Direct |
| HMI-REQ-030 | SPEC-001, SPEC-003 | STANAG 4586 (degraded/contingency operation intent) | Gap |
| HMI-REQ-031 | SPEC-003 | STANAG 4586 (fallback operation intent) | Gap |
| HMI-REQ-032 | SPEC-002, SPEC-011 | DEF STAN 00-250, section 11; WCAG 2.x AA (keyboard and semantic accessibility criteria) | Direct |
| HMI-REQ-033 | SPEC-001 | MIL-STD-1472H, section 5.3.3.3 | Direct |
| HMI-REQ-034 | SPEC-001, SPEC-011 | MIL-STD-1472H, section 5.3.3.3; WCAG 2.x AA (contrast >= 4.5:1) | Direct |
| HMI-REQ-035 | SPEC-001 | MIL-STD-1472H (display readability under operational conditions) | Gap |
| HMI-REQ-036 | SPEC-006, SPEC-007 | MIL-L-85762; MIL-STD-3009 | Gap |
| HMI-REQ-037 | SPEC-002, SPEC-009 | DEF STAN 00-250, section 12; ISO 9241-110 (consistency principles) | Direct |
| HMI-REQ-038 | SPEC-008 | MIL-STD-2525 (symbol set/profile conformance) | Derived |
| HMI-REQ-039 | SPEC-001, SPEC-002, SPEC-010, SPEC-012, SPEC-013 | MIL-STD-1472H §5.10.5 (protection for dangerous operations); DEF STAN 00-250 §9.4 (functional segregation of critical operations); IEC 61511 (automatic inhibit as safety function); STANAG 4691 (EKMS key management – RF silence during key fill); SCA v4.1 (RF Standby/RF Mute during SDR software update) | Gap |
| HMI-REQ-040 | SPEC-001, SPEC-003, SPEC-012 | MIL-STD-1472H, section 5.2.1 (persistent status presentation principle); STANAG 4586, section 6.3.2; STANAG 4691 (EKMS key management and crypto state visibility) | Derived |
| HMI-REQ-041 | SPEC-001, SPEC-002, SPEC-012 | MIL-STD-1472H, section 5.2.1 (state coding and visibility); DEF STAN 00-250, section 6.3 (safety-relevant state indication); STANAG 4691 (PT/CT mode control and indication) | Derived |
| HMI-REQ-042 | SPEC-001, SPEC-002 | MIL-STD-1472H, section 5.2.1 (persistent status presentation); DEF STAN 00-250, section 9.2 (error and fault state indication) | Derived |
| HMI-REQ-043 | SPEC-001, SPEC-002, SPEC-010, SPEC-012 | MIL-STD-1472H, section 5.2.1; DEF STAN 00-250, section 9.4 (functional segregation of critical operations); STANAG 4691 (RF silence during key fill / EMCON procedures) | Derived |
| HMI-REQ-044 | SPEC-001, SPEC-003 | MIL-STD-1472H, section 5.2.1 (persistent status presentation); STANAG 4586, section 6.3.2 (platform navigation state awareness) | Derived |
| HMI-REQ-045 | SPEC-001, SPEC-003 | MIL-STD-1472H, section 5.2.1 (persistent status presentation); STANAG 4586, section 6.3 (mission management and time reference) | Derived |

## 6. Notes on Verification Planning

- Software-only verification can confirm UI behavior, workflow constraints, and accessibility semantics.
- Environmental and NVIS compliance requires hardware-in-the-loop or laboratory photometric evidence.
- For certification-oriented use, each requirement should be linked to test cases and objective evidence IDs in a separate verification plan.

## 7. Implementation Guidance (Non-Normative)

This section is informative and does not alter requirement compliance criteria.

- Guidance A - Use a shared application state model for status, authority, and security indicators to keep cross-page behavior consistent.
- Guidance B - Prefer deterministic interaction patterns for critical operations (explicit confirmations, clear commit points, explicit rollback feedback).
- Guidance C - Centralize severity semantics, visual tokens, and notification policies to avoid inconsistent operator cues.
- Guidance D - Apply resilient communication policies (timeouts, bounded retries, stale-data signaling) with explicit operator feedback.
- Guidance E - Enforce accessibility by design (keyboard-first flows, semantic roles/states/labels, deterministic focus order).
- Guidance F - Keep theme, contrast, and environmental display controls under a governed token system validated by objective checks.
- Guidance G - Separate normative requirements from design choices in downstream technical design documents and test procedures.

## 8. Appendix - Traceability Reference Notes (Informative)

This appendix explains the meaning of the standards and clauses cited in Section 5. The summaries below are informative only and do not replace the official source documents.

### 8.1 SPEC-001 - MIL-STD-1472H

- Section 5.2.1: Focuses on continuous visibility of mission-relevant state. For this specification, it is interpreted as a requirement to keep core status cues (communication state, active channel, global status) persistent across pages, with stable position and coding, and without being hidden by transient overlays. Design implication: these indicators should live in dedicated persistent regions and should update from authoritative real-time state with bounded latency.
- Section 5.2.2.4: Focuses on discriminability between control categories and information classes. In HMI terms, actionable controls, read-only values, and disabled/unavailable controls must be visually and semantically distinct (shape, iconography, label, state cues), so operators do not confuse what can be changed versus what is informational only.
- Section 5.2.3: Focuses on feedback quality and interpretability after operator/system events. Mapping used here: every relevant event should produce timely, unambiguous, and severity-coded feedback; feedback should communicate what happened, where, and whether action is required (including acknowledgement for critical conditions).
- Section 5.2.6: Focuses on bounded response behavior and explicit fault awareness. Applied interpretation: interaction/network failures must not remain silent or indefinite; the HMI should expose timeout/retry behavior, surface comms degradation, and preserve operator understanding of command state (pending, failed, recovered).
- Section 5.2.7: Focuses on preventing decisions based on invalid or stale information. Practical interpretation in this document: if data freshness cannot be guaranteed, values should be clearly marked stale, stale markers should persist during outage, and normal display semantics should resume only after validated refresh.
- Section 5.3.1.3: Focuses on legible alphanumeric presentation under operational constraints. In this specification, that principle is translated into minimum operational font sizing and consistent typographic hierarchy for labels, values, and status text, so recognition remains reliable under workload and variable viewing conditions.
- Section 5.3.3.3: Focuses on display presentation for low-light operation, including luminance/contrast discipline. Here it supports dark-default operation, controlled brightness/contrast behavior, and objective readability targets, including compatibility with prolonged use in reduced ambient light.
- Section 5.8.6: Focuses on control size and spacing sufficient for reliable activation. Applied to this HMI: touch/click targets should meet minimum dimensions and spacing to reduce accidental activation, including use cases with vibration, stress, gloves, or reduced precision input devices.
- Section 5.10: Focuses on navigation architecture, orientation, and recoverability. Relevant implications: bounded depth to critical functions, persistent context cues, consistent movement patterns, and always-available recovery actions (for example Home/Back) to reduce disorientation and mode errors.
- Section 5.10.5: Focuses on protections for high-consequence operations. In this document this is interpreted as explicit confirmation barriers for irreversible/high-impact actions, with clear consequence messaging and cancellation path before dispatch.
- Section 5.14: Focuses on operator-facing security controls and access boundaries. Applied interpretation: authentication state, session state, and role-based capability limits should be explicit in UI behavior; unauthorized actions must be both non-presented where possible and blocked on invocation.
- Section 5.14.3: Focuses on traceability of significant actions/events. Mapping used here: the system should support accountable records for authentication and command-relevant changes with enough context (who, when, what target, previous/new value where applicable) to enable reconstruction and audit.
- General principles cited without clause-level precision: In Section 5 traceability, some rows reference broader MIL-STD-1472H principles on efficiency, error prevention, state visibility, and display readability where a single narrower clause has not been fixed yet.

### 8.2 SPEC-002 - DEF STAN 00-250

- Section 6.3: Addresses operator cueing and alert semantics. In this specification it underpins a deterministic severity model (NORMAL/SUCCESS/WARNING/ERROR/CRITICAL), consistent visual coding, and clear prioritization logic so urgent conditions remain salient under high workload.
- Section 9.2: Addresses controlled transaction behavior for operator commands. Mapping in this document: stage-then-commit interaction model, explicit Submit/Reset controls, visible pending-change indicators, and rollback/notification behavior when commit fails.
- Section 9.4: Addresses segregation and guarding of hazardous or high-impact functions. Applied interpretation: critical controls should be separated from routine monitoring controls in layout and interaction path, with additional friction (navigation gate and/or confirmation) before execution.
- Section 10.1: Addresses identity, authentication, and authorization boundaries. Here this supports role-scoped page/action visibility and enforcement, plus explicit session governance so capability always matches authenticated role.
- Section 10.3: Addresses accountability through retained records of significant events/actions. In this HMI context that means maintaining auditable traces of access and command-related changes with sufficient detail for forensic review.
- Section 11: Addresses inclusive operability and usability constraints. Interpreted here as keyboard-complete operation, deterministic focus flow, assistive-technology-compatible semantics, and interaction patterns that remain understandable across operator capability differences.
- Section 12: Addresses linguistic coherence in operational interfaces. Applied interpretation: one active language profile at runtime, no mixed-language labels/messages within the same context, and consistent terminology for commands, statuses, and alerts.
- General section 10 reference: Used where the traceability points to the broader security and access-control intent rather than a uniquely identified narrower clause.

### 8.3 SPEC-003 - STANAG 4586

- Section 6.3.2: Addresses explicit indication of control authority in multi-actor operations. In this specification it is used to justify continuous display of authority mode (for example LOCAL_OPERATOR, REMOTE_OPERATOR, AUTONOMOUS), with rapid updates on authority transfer to prevent unsafe command assumptions.
- Section 6.4: Addresses acknowledgement/confirmation discipline for consequential actions and alerts. Mapping used here: high-impact commands require deliberate confirmation flow, and critical conditions require explicit acknowledgement before dismissal so the operator performs conscious assessment.
- Degraded/contingency operation intent: Used where the traceability refers to continuity of essential functions or fallback operation, but a narrower clause still needs confirmation.

### 8.4 SPEC-004 - ARP4754A

- Section 5.3: Addresses system-level development considerations for correctness and integrity of information used in operational decisions. In this document, it is referenced to support explicit treatment of stale/invalid data in the HMI: detect loss of freshness, mark affected values, avoid presenting stale data as nominal, and clear stale condition only after confirmed data validity restoration.

### 8.5 SPEC-005 - DO-178C

- Deterministic error-handling objective: Used in traceability where software behavior must remain bounded, predictable, and testable during faults or backend failures.
- Timing determinism objectives: Used where timeout handling must be explicit and analyzable rather than indefinite or ambiguous.
- Robust error-recovery objectives: Used where retry and recovery behavior must remain controlled, bounded, and verifiable.
- Note: In this document the DO-178C references are principle-level and informative unless a more precise software-level objective is allocated in a downstream certification baseline.

### 8.6 SPEC-006 - MIL-L-85762

- NVIS compatibility reference: Used to indicate that the display must limit emissions so as not to interfere with night-vision equipment.
- No narrower clause is cited here because conformance depends strongly on photometric characteristics of the physical display hardware.

### 8.7 SPEC-007 - MIL-STD-3009

- NVIS-compatible lighting reference: Used to support software and hardware display behavior suitable for operation with night-vision systems.
- In this document the reference is used at standard level because final conformity depends on measured luminance and spectral characteristics.

### 8.8 SPEC-008 - MIL-STD-2525

- Symbol set/profile conformance: Used to indicate that displayed tactical symbols must preserve standard meaning, identity, and consistency across views.
- In this document the reference is profile-level rather than clause-level because the applicable symbol subset depends on the mission/system profile.

### 8.9 SPEC-009 - ISO 9241-110

- Feedback and responsiveness dialogue principles: Used where the system must provide timely, understandable reaction to operator actions.
- Self-descriptiveness: Used where interface responses must clearly communicate state and effect of operator actions.
- Controllability/navigation consistency: Used where the operator must remain in control of navigation path and interaction flow.
- Conformity with user expectations: Used where consistent patterns, labels, and behavior reduce confusion and training overhead.
- Efficiency of dialogue: Used where the interface must minimize unnecessary steps for frequently performed tasks.
- Consistency principles: Used where presentation and language must remain coherent across the interface.

### 8.10 SPEC-010 - IEC 61511

- Separation/protection principles: Used where critical actions must be segregated from routine monitoring functions and protected against inadvertent activation.
- The reference is principle-based in this document and should be refined further if a formal safety lifecycle allocation is required.

### 8.11 SPEC-011 - WCAG 2.x AA

- Keyboard accessibility criteria: Used where all functionality must remain operable without pointer-only interaction.
- Semantic accessibility criteria: Used where controls need machine-readable names, roles, and states for assistive technology.

### 8.12 SPEC-012 - STANAG 4691

- NATO Electronic Key Management System (EKMS) interoperability standard: Used to support the requirement that radio communication SHALL be inhibited (no Tx, no Rx) during cryptographic key loading, key fill, and key zeroization operations. COMSEC management procedures consistently require the radio to be in a non-transmitting state during key handling to prevent inadvertent key material exposure or compromise. The reference is used at standard level; specific clause-level mapping requires confirmation against the edition applicable to the target system's COMSEC baseline.

### 8.13 SPEC-013 - SCA v4.1 (Software Communications Architecture)

- SDR device lifecycle and RF management: Used to support the requirement that radio communication SHALL be inhibited during firmware or waveform software updates. The Software Communications Architecture (SCA), published by the JTRS Joint Program Office (PEO C3T), defines the SDR device and waveform lifecycle, including an RF Standby / RF Mute state that must be asserted during software loading to prevent incomplete or undefined RF behaviour. The reference is used at standard level; specific clause-level mapping requires confirmation against the applicable SCA version and platform-specific OAL implementation.

## 9. Implementation Details (Non-Normative)

This section provides possible implementation approaches for selected requirements. These notes are informative and do not alter normative requirement compliance criteria. Alternative approaches may be used provided all acceptance criteria are satisfied.

### 9.1 HMI-REQ-039 - Transmission inhibit during critical radio operations

#### Apparatus signaling

A typical implementation relies on the apparatus exposing a `CRITICAL_OPERATION_ACTIVE` boolean flag and a `CRITICAL_OPERATION_TYPE` parameter (enum or string) that identifies the nature of the active critical operation. The HMI subscribes to changes in these parameters and enters the inhibit state whenever the flag is asserted.

Operations that may assert the flag include, but are not limited to:

- Firmware or software update of the radio apparatus.
- Cryptographic key loading, key fill, or key zeroization operations.
- Security parameter initialization or change.
- Hardware self-test routines that affect the RF front-end.

#### HMI behavior during the inhibit period

- All operator-accessible Tx and Rx command controls are disabled and visually marked as inhibited (e.g., greyed out with a lock or warning badge).
- A persistent notification of at minimum WARNING severity is displayed within 200 ms of flag assertion. The notification should identify the active operation type (from `CRITICAL_OPERATION_TYPE`) and explain the reason for the communication inhibition.
- No mechanism (button, gesture, keyboard shortcut, or programmatic path) SHALL allow the operator to bypass the inhibit state.

#### Inhibit release

The inhibit is automatically released when the apparatus clears the `CRITICAL_OPERATION_ACTIVE` flag and confirms that the critical operation is complete. The HMI should validate the cleared state before re-enabling controls to avoid race conditions.

#### Audit trail

Each inhibit-start and inhibit-end event is recorded in the operational audit trail with at minimum: timestamp, operation type, and inhibit duration (calculated at release time). If user identity is available at the time of the event, it should also be included.

---

## 10. Acronyms

| Acronym | Definition |
| --- | --- |
| ARIA | Accessible Rich Internet Applications |
| ARP | Aerospace Recommended Practice |
| CAC | Common Access Card |
| COMSEC | Communications Security |
| CSS | Cascading Style Sheets |
| DEF STAN | Defence Standard |
| dpi | dots per inch |
| EKMS | Electronic Key Management System |
| FILL | Cryptographic Key Fill (loading operation) |
| GPS | Global Positioning System |
| HMI | Human-Machine Interface |
| i18n | Internationalisation |
| IEC | International Electrotechnical Commission |
| ISO | International Organization for Standardization |
| JTRS | Joint Tactical Radio System |
| MFA | Multi-Factor Authentication |
| MIL-STD | Military Standard |
| NATO | North Atlantic Treaty Organization |
| NVIS | Night Vision Imaging System |
| NVG | Night Vision Goggle |
| OAL | Operating Environment Adaptation Layer |
| PKI | Public Key Infrastructure |
| RBAC | Role-Based Access Control |
| REQ | Requirement |
| RX | Receive |
| SCA | Software Communications Architecture |
| SDR | Software Defined Radio |
| SPEC | Specification (external standard reference, as used in this document) |
| STANAG | NATO Standardization Agreement |
| TX | Transmit |
| UAS | Unmanned Aircraft System |
| UI | User Interface |
| WCAG | Web Content Accessibility Guidelines |
