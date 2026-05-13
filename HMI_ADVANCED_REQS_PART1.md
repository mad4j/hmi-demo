# Unified HMI Requirements Specification - Tactical Radio

Version: 1.2
Date: 2026-05-02

## 1. Scope

This document defines a single, consistent, and verifiable set of HMI requirements for tactical radio operation. It consolidates and refines requirements from multiple sources, including MIL-STD-1472H, DEF STAN 00-250, and STANAG 4586, among others. The goal is to create a unified specification that can guide design, development, and verification of the HMI while ensuring compliance with relevant human factors principles and operational needs.

## 2. Requirement Conventions

- Requirement IDs use format HMI-REQ-XXX.
- "SHALL" indicates mandatory behavior.
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

#### HMI-REQ-003 - Persistent active waveform indicator

The system SHALL continuously display the name or identifier of the waveform (or communication application) currently loaded and operative, in a dedicated persistent visual element visible on every screen.

- Verification: I + T
- Acceptance: Waveform name updates within 500 ms of a waveform load or switch event; the displayed label matches the canonical waveform identifier reported by the SDR runtime; visible on 100% of screens.
- Rationale: Continuous waveform identification prevents operators from issuing channel or configuration commands that are incompatible with the active air interface, reducing misconfiguration risk during dynamic mission phases.

#### HMI-REQ-004 - Persistent active configuration preset indicator

The system SHALL continuously display the name or identifier of the configuration preset currently operative, in a dedicated persistent visual element visible on every screen.

- Verification: I + T
- Acceptance: Preset name updates within 500 ms of a preset load or change event; a visual distinction (e.g., modified marker) is shown when the running configuration has been altered relative to the saved preset state; visible on 100% of screens.
- Rationale: Explicit preset identification allows operators to verify at a glance that the intended configuration is active, and to detect unsaved modifications that could affect interoperability or mission compliance.

#### HMI-REQ-005 - System-under-control indicator

The system SHALL continuously indicate control authority state: LOCAL_OPERATOR, REMOTE_OPERATOR, AUTONOMOUS.

- Verification: I + T
- Acceptance: Indicator is driven by real-time platform status and updates <= 500 ms from data change.
- Rationale: Explicit control authority indication prevents unsafe actions when command ownership changes (e.g., remote takeover from an SNMP-attached control station)

#### HMI-REQ-006 - Persistent cryptographic state and configuration indicator

The system SHALL continuously display the active cryptographic state and configuration (e.g., algorithm identifier, key tag/ID, and operational context, such as NATO or NATIONAL) in a dedicated persistent status region visible on every screen.

- Verification: I + T
- Acceptance: Cryptographic state indicator reflects the current hardware/software crypto engine status and updates <= 500 ms from any state change; visible on 100% of screens.
- Rationale: Continuous visibility of the operative cryptographic configuration prevents inadvertent transmission under an incorrect or unintended security posture.

#### HMI-REQ-007 - Plain-text / Cipher-text communication mode indicator

The system SHALL display a persistent, unambiguous indicator that distinguishes whether the active communication link is operating in plain-text mode (PT) or cipher-text mode (CT), using distinct visual coding (e.g., dedicated icon, label, and/or color token) that cannot be confused with any other status element.

- Verification: I + T
- Acceptance: PT/CT indicator is legible at normal operator viewing distance; updates within 200 ms of mode change; a CAUTION-level alert is raised whenever the link transitions to or remains in PT mode during a mission-active state.
- Rationale: Explicit PT/CT differentiation prevents operators from transmitting sensitive information over an unencrypted link, reducing the risk of unintended emission of classified or sensitive traffic.

#### HMI-REQ-008 - Persistent system fault state indicator

The system SHALL continuously display a FAULT condition indicator whenever one or more internal subsystems (RF, crypto, power, DSP) report a fault state, using a dedicated visual element distinct from general status icons.

- Verification: I + T
- Acceptance: FAULT indicator appears within 500 ms of fault detection and remains visible until the fault is cleared; the indicator is unambiguously distinguishable from CAUTION and ALARM states.
- Rationale: An explicit FAULT indicator enables operators to immediately recognise degraded system integrity and take corrective action without having to navigate to a diagnostic page.

#### HMI-REQ-009 - Persistent radio silence state indicator

The system SHALL continuously display a RADIO SILENCE indicator whenever both transmission (Tx) and reception (Rx) are disabled, using a dedicated, high-salience visual element visible on every screen.

- Verification: I + T
- Acceptance: RADIO SILENCE indicator appears within 200 ms of entering the radio-silence state and is immediately distinguishable from the standard IDLE communication state; a CAUTION-level alert is raised on entry and on exit from radio-silence mode.
- Rationale: Unambiguous radio-silence indication prevents operators from mistaking an inhibited link for a functioning idle link, reducing the risk of missed communications or unintended RF emission.

#### HMI-REQ-010 - Persistent GPS connectivity indicator

The system SHALL continuously display GPS connectivity status (ACQUIRED, DEGRADED, LOST) in a persistent visual element on every screen, updated from the active positioning subsystem.

- Verification: I + T
- Acceptance: GPS status indicator updates within 500 ms of a change in satellite lock or signal quality; DEGRADED and LOST states are coded with distinct visual treatment (amber and red respectively, or NVG-safe equivalents).
- Rationale: Continuous GPS status visibility is essential for position-dependent mission functions; silent GPS loss can lead to incorrect reporting or navigation decisions.

#### HMI-REQ-011 - Persistent mission time display

The system SHALL continuously display mission elapsed time (MET) or mission time-of-day (TOD) in a dedicated persistent region visible on every screen, synchronized to the platform time reference.

- Verification: I + T
- Acceptance: Mission time updates at least once per second; deviation from authoritative time reference is <= 1 s under normal operating conditions; the display remains visible regardless of the active page or active modal overlay.
- Rationale: A persistent mission time reference supports time-critical coordination, log correlation, and situational awareness without requiring navigation away from the current task.

#### HMI-REQ-012 - Persistent power supply and battery state indicator

The system SHALL continuously display the current power supply source (EXTERNAL / BATTERY) and, when operating on battery, the estimated remaining charge level (expressed as a percentage or discrete step scale) in a dedicated persistent visual element visible on every screen.

- Verification: I + T
- Acceptance: Power source and charge level indicators update within 1 s of a change in supply source or a >= 1% change in charge level; a CAUTION-level alert is raised when battery charge falls below 20%; a CRITICAL-level alert is raised when battery charge falls below 10%.
- Rationale: Continuous power status visibility enables operators to anticipate mission endurance limits and take preventive action (e.g., switch to external power or terminate non-essential functions) before a forced shutdown interrupts communications.

#### HMI-REQ-013 - Persistent system status icons

The system SHALL permanently display global system status indicators using consistent iconography and three-level color semantics (NORMAL/CAUTION/ALARM mapped to green/amber/red or equivalent NVG-safe palette).

- Verification: I + T
- Acceptance: Status bar remains visible regardless of active page.
- Rationale: Persistent and consistent status semantics improve recognition speed under workload.

### 3.2 Feedback, Alerts, and Human Factors

#### HMI-REQ-014 - Input feedback latency

The system SHALL provide perceptible feedback for every operator input within 100 ms.

- Verification: T
- Acceptance: >= 99% of interactions satisfy latency target.
- Rationale: Fast feedback confirms command reception and lowers repeated input risk. Time consuming operations (e.g., waveform switch, configuration changes) should provide immediate feedback of command acceptance followed by progress indication until completion.

#### HMI-REQ-015 - Severity-classified notifications

The system SHALL classify and render feedback messages with distinct severity levels: NORMAL, SUCCESS, WARNING, ERROR, CRITICAL.

- Verification: I + T
- Acceptance: Each severity has unique and consistent visual treatment. Operator recognition <= 1 s in normal operating conditions.
- Rationale: Severity differentiation helps operators prioritize attention and response.

#### HMI-REQ-016 - Critical alert acknowledgement

Critical alerts SHALL require explicit operator acknowledgement before dismissal.

- Verification: T
- Acceptance: No auto-dismiss permitted for CRITICAL severity.
- Rationale: Mandatory acknowledgment ensures critical events are consciously assessed before continuation.

#### HMI-REQ-017 - Non-blocking presentation of informational notifications

Notifications of NORMAL or INFO severity SHALL be presented in a non-blocking, non-modal manner that does not interrupt the operator's current interaction flow, does not require explicit acknowledgement, and auto-dismisses after a configurable display period.

- Verification: I + T
- Acceptance: NORMAL/INFO notifications do not open a modal overlay; operator can continue interacting with any control while the notification is visible; notification auto-dismisses within a configurable timeout (default: 5 s); no confirmation action is required from the operator.
- Rationale: Blocking an operator for informational feedback imposes unnecessary workflow interruption and increases task completion time. Non-blocking presentation ensures that low-priority status updates reach the operator without preempting ongoing mission-critical interactions, consistent with the graduated urgency model established by HMI-REQ-015 and HMI-REQ-016.

#### HMI-REQ-018 - Multimodal transmission-start feedback !!!TBV

The system SHALL provide at least two feedback modalities when transmission starts (e.g., visual and audible/haptic where available).

- Verification: I + T
- Acceptance: Event confirmation remains detectable under high workload conditions.
- Rationale: Multimodal confirmation improves detectability in noisy, vibrating, or visually saturated environments.

#### HMI-REQ-019 - Read-only field distinction

The system SHALL clearly distinguish read-only parameters from editable controls using iconography and/or visual styling.

- Verification: I
- Acceptance: Read-only controls expose a non-editable affordance and cannot be mistaken for writable inputs.
- Rationale: Clear read-only affordances prevent unintended modification attempts.

#### HMI-REQ-020 - Minimum touch target size

All interactive controls SHALL provide a hit area of at least 48 px x 48 px, referenced at 96 dpi.

- Verification: I + T
- Acceptance: 100% of actionable controls meet minimum size.
- Rationale: Minimum hit areas reduce input errors during motion, stress, or gloved operation.

#### HMI-REQ-021 - Minimum operational font size

Operationally relevant text SHALL use a minimum rendered size of 16 px equivalent, referenced at 96 dpi.

- Verification: I
- Acceptance: Parameter labels, navigation labels, counters, and status text meet minimum size.
- Rationale: Minimum text size preserves readability and reduces interpretation errors.

### 3.3 Navigation and Interaction Efficiency

#### HMI-REQ-022 - Navigation depth limit

Mission-critical functions SHALL be reachable within a maximum of 3 navigation levels.

- Verification: A + T
- Acceptance: No critical workflow exceeds depth 3.
- Rationale: Bounded depth reduces cognitive load and shortens access time to critical functions.

#### HMI-REQ-023 - Persistent navigation context and controls

The system SHALL always show current navigation context and provide persistent Home and Back controls.

- Verification: I + T
- Acceptance: Home available in all screens; Back valid except at root.
- Rationale: Persistent context and recovery controls improve orientation and error recovery.

#### HMI-REQ-024 - Consistent navigation patterns

Navigation behavior, labels, and transitions SHALL be consistent across all menus and pages.

- Verification: I
- Acceptance: No conflicting interaction patterns for equivalent actions.
- Rationale: Consistent interaction patterns reduce training time and mode confusion.

#### HMI-REQ-025 - Channel switch interaction budget

In case of multi-channel radio equipments, the system SHALL permit channel switching in no more than 2 discrete user actions.

- Verification: UT + T
- Acceptance: >= 95% users complete channel switch <= 3 s.
- Rationale: Reduced interaction steps improve operational tempo and reduce mis-selections.

#### HMI-REQ-026 - Active waveform switch capability and interaction budget

The system SHALL permit switching the active waveform through an explicit operator workflow that is reachable within a maximum of 3 navigation levels and completable in no more than 3 discrete user actions from the waveform management entry point.

- Verification: UT + T
- Acceptance: >= 95% users complete waveform switch <= 10 s in nominal conditions; waveform switch progress is shown within 200 ms of command acceptance; the persistent active waveform indicator (HMI-REQ-003) updates <= 500 ms after apparatus confirmation.
- Rationale: Operators must be able to intentionally change waveform under mission tempo while preserving control, predictability, and immediate state awareness.

#### HMI-REQ-027 - Transmission initiation simplicity  !!!TBV

The system SHALL permit transmission initiation through a single operator action.

- Verification: T
- Acceptance: Command-to-feedback latency <= 150 ms.
- Rationale: Single-action transmission supports rapid response in time-critical communication.

### 3.4 Transaction Safety and Command Governance

#### HMI-REQ-028 - Transaction draft model

Command-capable pages SHALL implement local draft state, visible pending-change highlighting, explicit Reset (discard), and explicit Submit actions.

- Verification: I + T
- Acceptance: Draft changes are not committed until Submit.
- Rationale: Draft semantics prevent unintended live changes and support deliberate commit behavior.

#### HMI-REQ-029 - Rollback on backend failure

If command submission fails, the system SHALL automatically roll back affected values to last committed state and notify the operator.

- Verification: T
- Acceptance: No partial committed state remains visible after failure.
- Rationale: Rollback preserves consistency and operator trust after failed transactions.

#### HMI-REQ-030 - Two-step confirmation for high-impact commands

Irreversible or high-impact commands SHALL require two-step operator confirmation before dispatch. Examples of commands that fall within this category include, but are not limited to:

- REBOOT — performs a full system or subsystem restart, interrupting all active communications.
- KEY_ZEROIZE — destroys all loaded cryptographic key material (irreversible without re-keying).

- Verification: I + T
- Acceptance: Command dispatch blocked until confirmation sequence is complete.
- Rationale: Two-step confirmation mitigates accidental activation of irreversible actions.

#### HMI-REQ-031 - Functional segregation of critical controls

Command/write controls SHALL be physically or logically segregated from monitoring/read-only information, and critical actions SHALL require explicit navigation and suitable privilege level.

- Verification: I + A
- Acceptance: Critical actions are not colocated at equivalent prominence with passive monitoring controls.
- Rationale: Functional separation lowers inadvertent activation risk and supports defense-in-depth.

#### HMI-REQ-032 - Transmission inhibit when encryption required !!!TBV

The system SHALL inhibit transmission whenever mission policy requires encryption and encryption is not active.

- Verification: T
- Acceptance: TX action blocked in all such states.
- Rationale: Transmission inhibition enforces communication security policy in constrained scenarios.

#### HMI-REQ-033 - Explicit encryption state indicator !!!RED

The system SHALL display encryption state using unambiguous encoding (SECURE/PLAIN) continuously during operation.

- Verification: T
- Acceptance: State visible and readable in all operational screens.
- Rationale: Explicit crypto-state visibility supports correct tactical communication decisions.

#### HMI-REQ-034 - Transmission inhibit during critical radio operations

The system SHALL inhibit both Tx (outgoing transmission) and Rx (incoming reception) capabilities of the controlled radio apparatus whenever the apparatus signals that a critical operation requiring radio silence is active. During the inhibit period the system SHALL:

1. Prevent the operator from issuing any Tx or Rx command, with a clear visual indication that the controls are inhibited.
2. Display a persistent operator notification identifying the nature of the active critical operation and the reason for the communication inhibition.
3. Provide no operator-level path to override the inhibit state.
4. Release the inhibit automatically upon apparatus confirmation that the critical operation is complete.
5. Record the start and end of each inhibit period in the operational audit trail.

- Verification: T + I
- Acceptance: (a) Tx/Rx commands are blocked for the full duration of any active critical operation signaled by the apparatus; (b) the inhibit notification is visible and identifies the active critical operation; (c) no manual bypass path exists; (d) audit records are generated for each inhibit-start and inhibit-end event.
- Rationale: Transmission or reception during critical radio operations can corrupt system state, expose key material, or produce inadvertent RF emissions that violate COMSEC and RF management procedures. Automatic inhibition with no operator override is a fundamental safety and security requirement for tactical radio systems operating under NATO COMSEC procedures and SDR software-update lifecycles.

#### HMI-REQ-035 - Waveform deinstantiation precondition for administrative operations

For administrative operations that modify executable radio software state (including, but not limited to, firmware update, platform software update, waveform software load/update/remove), the system SHALL enforce waveform deinstantiation (no active waveform instance) before operation start, consistent with SCA lifecycle constraints.

During this precondition the system SHALL:

1. Block operation start if any waveform is still instantiated, with a clear operator message indicating required deinstantiation.
2. Provide an explicit guided action to deinstantiate the active waveform when the operator has sufficient privileges.
3. Keep Tx/Rx inhibited for the entire administrative operation lifecycle, from pre-check start to completion acknowledgment.
4. Prevent operator override of the deinstantiation precondition.
5. Record in the audit trail: operation type, precondition check result, deinstantiation timestamp, operation start/end timestamps, and outcome.

- Verification: T + I
- Acceptance: (a) administrative operation dispatch is rejected whenever an active waveform instance exists; (b) operation dispatch succeeds only after confirmed deinstantiation; (c) Tx/Rx remain inhibited throughout the operation; (d) audit entries are generated for each operation with all mandatory fields.
- Rationale: Enforcing waveform deinstantiation prior to software-administration activities prevents undefined runtime behavior, RF emissions in inconsistent states, and lifecycle violations under SCA-governed SDR operation.

#### HMI-REQ-036 - Waveform preset lifecycle management !!!TBV

The system SHALL provide managed lifecycle operations for waveform presets, including create, validate, save, load/apply, rename, duplicate, delete, import, and export, under role-based authorization.

The preset workflow SHALL:

1. Use draft semantics for editable preset data, with explicit Submit and Reset actions consistent with HMI-REQ-028.
2. Validate preset schema and mission policy constraints before save or apply, returning field-level errors for invalid data.
3. Require explicit confirmation before deleting a preset or applying a preset that changes security-relevant parameters.
4. Clearly indicate whether the running configuration exactly matches a saved preset or contains unsaved changes, consistent with HMI-REQ-004.
5. Record all preset lifecycle operations in the audit trail, including actor, target preset identifier, operation type, and outcome.

- Verification: T + I + UT
- Acceptance: (a) invalid presets cannot be saved or applied; (b) applying a valid preset updates apparatus parameters through the bidirectional contract defined in HMI-REQ-043 and reports completion outcome; (c) preset state indicator updates <= 500 ms after apply completion; (d) authorized users can complete create-save-apply workflow <= 20 s in nominal conditions.
- Rationale: Structured waveform preset management reduces setup time, improves repeatability between missions, and limits configuration errors for complex waveform parameter sets.

### 3.5 Security, Identity, and Auditability

#### HMI-REQ-037 - Authentication and role-based access control

The system SHALL enforce authentication and role-based visibility/authorization for pages and actions (minimum roles: OPERATOR, SUPERVISOR, MAINTAINER).

- Verification: I + T
- Acceptance: Unauthorized actions/pages are inaccessible in UI and rejected on invocation.
- Rationale: RBAC limits exposure of privileged functions and reduces misuse risk.

#### HMI-REQ-038 - Communication operations available without login

The system SHALL keep communication operations available to the operator even when no user session is active, and SHALL NOT require prior login to access or execute communication functions necessary for radio use.

- Verification: I + T
- Acceptance: In the logged-out state, communication functions remain visible and executable, while privileged non-communication functions remain subject to HMI-REQ-037.
- Rationale: Basic communication capability must remain immediately available in operational contexts where authentication delay would reduce mission effectiveness.

#### HMI-REQ-039 - Emergency zeroization available without login

The system SHALL permit execution of the emergency zeroization operation even when no user session is active, and SHALL NOT require prior login to trigger emergency zeroization.

- Verification: I + T
- Acceptance: In the logged-out state, the operator can invoke emergency zeroization and the system starts the zeroization sequence without requiring authentication.
- Rationale: Emergency zeroization is a time-critical protective action and must remain immediately available under compromise or capture risk conditions.

#### HMI-REQ-040 - Session timeout

The system SHALL enforce configurable inactivity timeout with automatic session termination.

- Verification: T
- Acceptance: Session closes after configured inactivity threshold.
- Rationale: Session timeout reduces unauthorized use after operator absence.

#### HMI-REQ-041 - Access and action audit trail !!!TBV

The system SHALL record authentication events, command executions, and parameter changes with timestamp, user identity, target, previous value, and new value where applicable.

- Verification: I + T
- Acceptance: Audit records are append-only for operators.
- Rationale: Tamper-resistant auditability supports accountability and post-event reconstruction.

#### HMI-REQ-042 - No hardcoded credentials

No production credential or authentication secret SHALL be hardcoded in source files, frontend scripts, or service workers.

- Verification: I + A
- Acceptance: Production build contains no embedded static credentials.
- Rationale: Eliminating embedded secrets reduces compromise probability and lateral risk.

### 3.6 Communications Resilience and Degraded Operation

#### HMI-REQ-043 - HMI–apparatus bidirectional communication capability

The communication interface SHALL support the following interaction primitives in both directions:

**HMI → Apparatus** (synchronous requests)

- **Synchronous parameter read**: the HMI issues a read request for one or more apparatus parameters and receives the current value(s) within a bounded response time.
- **Synchronous parameter update**: the HMI issues a write request to set one or more apparatus parameters and receives a completion acknowledgement (success or error) within a bounded response time.
- **Synchronous command execution**: the HMI issues a command request (e.g., RESET, KEY_ZEROIZE, WAVEFORM_LOAD) and receives an immediate acceptance response (or error) within a bounded response time; execution progress and final outcome are subsequently delivered via asynchronous notifications.

**Apparatus → HMI** (asynchronous notifications)

- **Asynchronous state-change notification**: the apparatus proactively notifies the HMI whenever a relevant system state changes (e.g., communication state, control authority, crypto mode, fault condition) without the HMI having issued a prior read request.
- **Asynchronous parameter-update notification**: the apparatus proactively notifies the HMI whenever the value of one or more monitored parameters changes, enabling the HMI to keep displayed values current without polling.
- **Asynchronous command-progress notification**: for time-consuming commands, the apparatus emits periodic progress notifications (e.g., percentage complete, current phase) and a final completion notification (success or error) after the initial acceptance response has been sent.

- Verification: T + A
- Acceptance: Synchronous request–response round-trips complete within a configurable timeout (default: 5 s for reads and writes; immediate acceptance within 1 s for commands); asynchronous notifications are delivered to the HMI and reflected in the UI within 500 ms of the originating apparatus event; timeout and error responses are distinguishable from each other and surfaced to the operator with at minimum WARNING severity; all primitive types are covered by integration tests against a representative apparatus interface or simulator.
- Rationale: A bidirectional communication contract is required to support both operator-driven interactions and apparatus-driven state propagation. For time-consuming operations, the synchronous request returns an immediate acceptance or rejection, decoupling command submission from execution; execution progress and outcome are then delivered asynchronously, preventing the HMI from blocking or appearing unresponsive during long-running operations. Explicit asynchronous primitives for state changes, parameter updates, and command progress eliminate the need for polling, reduce latency, and provide a deterministic, auditable event model.

#### HMI-REQ-044 - Configurable network timeout and cancellation

All network operations SHALL enforce configurable timeout and cancel requests that exceed threshold.

- Verification: T
- Acceptance: Timeout event generates operator-visible notification.
- Rationale: Deterministic timeout behavior prevents indefinite waits and hidden failures.

#### HMI-REQ-045 - Bounded retry with backoff

The communication layer SHALL apply bounded retry attempts with deterministic backoff under degraded links.

- Verification: T
- Acceptance: Retry count and backoff profile are configurable and capped.
- Rationale: Bounded retries improve resilience without causing uncontrolled traffic amplification.

#### HMI-REQ-046 - Stale data marking

When link to the controlled apparatus is interrupted, all displayed live parameters SHALL be marked as stale until fresh data is received.

- Verification: T
- Acceptance: Stale marking persists through outage and clears only after successful refresh.
- Rationale: Stale-data indication prevents decisions based on outdated information.

#### HMI-REQ-047 - Essential functionality in degraded mode !!!TBV

Under degraded conditions, the system SHALL preserve essential mission functions defined by operational profile.

- Verification: T
- Acceptance: Essential function list remains operable in simulated degraded scenarios.
- Rationale: Degraded-mode continuity preserves mission-critical operability under faults.

#### HMI-REQ-048 - Fallback interaction mode !!!TBV

The system SHALL provide a fallback interaction mode usable when primary display capabilities are reduced or unavailable.

- Verification: T
- Acceptance: Minimum command and status workflow remains executable.
- Rationale: Fallback interaction preserves minimum safe control when primary interaction paths degrade.

### 3.7 Accessibility, Visual Ergonomics, and Environmental Compatibility

#### HMI-REQ-049 - Keyboard and screen-reader accessibility

All interactive controls SHALL be keyboard operable and expose correct ARIA roles, states, and labels; focus order SHALL be deterministic.

- Verification: I + T
- Acceptance: All actions operable via keyboard only; screen-reader announces control purpose/state.
- Rationale: Accessibility requirements ensure equivalent control for keyboard and assistive technology users.

#### HMI-REQ-050 - Dark theme as operational default

The default theme SHALL be dark and optimized for low ambient light operation.

- Verification: I
- Acceptance: Default startup theme is dark.
- Rationale: Dark-default presentation supports low-ambient operational conditions and reduces glare.

#### HMI-REQ-051 - Contrast ratio minimum

Primary text contrast SHALL meet WCAG AA minimum ratio of 4.5:1.

- Verification: I + T
- Acceptance: All primary text meets or exceeds threshold.
- Rationale: Contrast compliance improves legibility and lowers interpretation errors.

#### HMI-REQ-052 - Daylight readability envelope

Display content SHALL remain readable at 50 cm across 0.1-10,000 lux operational envelope.

- Verification: ET
- Acceptance: Operator can correctly read required status and commands within envelope.
- Rationale: Readability across illuminance envelope ensures usable operation in field lighting extremes.

#### HMI-REQ-053 - NVG/NVIS compatibility mode

The system SHALL provide dedicated NVG/NVIS mode limiting emission according to MIL-STD-3009 / MIL-L-85762 constraints.

- Verification: T + ET
- Acceptance: Software mode available; hardware compliance confirmed by photometric test evidence.
- Rationale: NVIS compatibility reduces interference with night-vision operations.

### 3.8 Localization and Symbol Standards

#### HMI-REQ-054 - Language consistency

The UI SHALL use one consistent language per configured runtime profile; mixed-language presentation is not permitted.

- Verification: I
- Acceptance: No mixed-language labels/messages in same runtime profile.
- Rationale: Language consistency prevents ambiguity and comprehension delay.

#### HMI-REQ-055 - Tactical symbology consistency

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
| HMI-REQ-013 | SPEC-001, SPEC-002 | MIL-STD-1472H, section 5.2.1; DEF STAN 00-250, section 6.3 | Direct |
| HMI-REQ-005 | SPEC-003 | STANAG 4586, section 6.3.2 | Direct |
| HMI-REQ-014 | SPEC-001, SPEC-009 | ISO 9241-110 (feedback and responsiveness dialogue principles) | Derived |
| HMI-REQ-015 | SPEC-001, SPEC-002 | MIL-STD-1472H, section 5.2.3; DEF STAN 00-250, section 6.3 | Direct |
| HMI-REQ-016 | SPEC-001, SPEC-003 | STANAG 4586, section 6.4 (operator confirmation/acknowledgement intent) | Direct |
| HMI-REQ-017 | SPEC-001, SPEC-002, SPEC-009 | MIL-STD-1472H, section 5.2.3 (information coding and graduated urgency); DEF STAN 00-250, section 6.3 (alarm and notification classification); ISO 9241-110 (controllability and non-interruptive feedback dialogue principles) | Derived |
| HMI-REQ-018 | SPEC-001, SPEC-009 | ISO 9241-110 (self-descriptiveness and feedback principles) | Derived |
| HMI-REQ-019 | SPEC-001 | MIL-STD-1472H, section 5.2.2.4 | Direct |
| HMI-REQ-020 | SPEC-001 | MIL-STD-1472H, section 5.8.6 | Direct |
| HMI-REQ-021 | SPEC-001 | MIL-STD-1472H, section 5.3.1.3 | Direct |
| HMI-REQ-022 | SPEC-001, SPEC-009 | MIL-STD-1472H, section 5.10; ISO 9241-110 (controllability/navigation consistency) | Direct |
| HMI-REQ-023 | SPEC-001 | MIL-STD-1472H, section 5.10 | Direct |
| HMI-REQ-024 | SPEC-009 | ISO 9241-110 (conformity with user expectations, consistency) | Derived |
| HMI-REQ-025 | SPEC-001, SPEC-009 | ISO 9241-110 (efficiency of dialogue) | Derived |
| HMI-REQ-027 | SPEC-001 | MIL-STD-1472H (task efficiency and control accessibility principles) | Gap |
| HMI-REQ-028 | SPEC-002 | DEF STAN 00-250, section 9.2 | Direct |
| HMI-REQ-029 | SPEC-002, SPEC-005 | DEF STAN 00-250, section 9.2; DO-178C (deterministic error handling objective) | Derived |
| HMI-REQ-030 | SPEC-001, SPEC-003 | MIL-STD-1472H, section 5.10.5; STANAG 4586, section 6.4 | Direct |
| HMI-REQ-031 | SPEC-002, SPEC-010 | DEF STAN 00-250, section 9.4; IEC 61511 (separation/protection principles) | Derived |
| HMI-REQ-032 | SPEC-001 | MIL-STD-1472H (error prevention and safety-oriented interaction principles) | Gap |
| HMI-REQ-033 | SPEC-001 | MIL-STD-1472H (state visibility and coding clarity principles) | Gap |
| HMI-REQ-037 | SPEC-001, SPEC-002 | MIL-STD-1472H, section 5.14; DEF STAN 00-250, section 10.1 | Direct |
| HMI-REQ-038 | SPEC-001, SPEC-002, SPEC-013 | DEF STAN 00-250, section 10.1; STANAG 4586, section 6.3; MIL-STD-1472H, section 5.2.6 | Derived |
| HMI-REQ-039 | SPEC-002, SPEC-013 | DEF STAN 00-250, section 10.1; IEC 61508 / IEC 61511 emergency protective action principles | Derived |
| HMI-REQ-040 | SPEC-001, SPEC-002 | MIL-STD-1472H, section 5.14; DEF STAN 00-250, section 10.1 | Direct |
| HMI-REQ-041 | SPEC-001, SPEC-002 | MIL-STD-1472H, section 5.14.3; DEF STAN 00-250, section 10.3 | Direct |
| HMI-REQ-042 | SPEC-002 | DEF STAN 00-250, section 10 (security and access control context) | Gap |
| HMI-REQ-044 | SPEC-001, SPEC-005 | MIL-STD-1472H, section 5.2.6; DO-178C (timing determinism objectives) | Derived |
| HMI-REQ-045 | SPEC-001, SPEC-005 | MIL-STD-1472H, section 5.2.6; DO-178C (robust error recovery objectives) | Derived |
| HMI-REQ-046 | SPEC-001, SPEC-004 | MIL-STD-1472H, section 5.2.7; ARP4754A, section 5.3 | Direct |
| HMI-REQ-047 | SPEC-001, SPEC-003 | STANAG 4586 (degraded/contingency operation intent) | Gap |
| HMI-REQ-048 | SPEC-003 | STANAG 4586 (fallback operation intent) | Gap |
| HMI-REQ-049 | SPEC-002, SPEC-011 | DEF STAN 00-250, section 11; WCAG 2.x AA (keyboard and semantic accessibility criteria) | Direct |
| HMI-REQ-050 | SPEC-001 | MIL-STD-1472H, section 5.3.3.3 | Direct |
| HMI-REQ-051 | SPEC-001, SPEC-011 | MIL-STD-1472H, section 5.3.3.3; WCAG 2.x AA (contrast >= 4.5:1) | Direct |
| HMI-REQ-052 | SPEC-001 | MIL-STD-1472H (display readability under operational conditions) | Gap |
| HMI-REQ-053 | SPEC-006, SPEC-007 | MIL-L-85762; MIL-STD-3009 | Gap |
| HMI-REQ-054 | SPEC-002, SPEC-009 | DEF STAN 00-250, section 12; ISO 9241-110 (consistency principles) | Direct |
| HMI-REQ-055 | SPEC-008 | MIL-STD-2525 (symbol set/profile conformance) | Derived |
| HMI-REQ-034 | SPEC-001, SPEC-002, SPEC-010, SPEC-012, SPEC-013 | MIL-STD-1472H §5.10.5 (protection for dangerous operations); DEF STAN 00-250 §9.4 (functional segregation of critical operations); IEC 61511 (automatic inhibit as safety function); STANAG 4691 (EKMS key management – RF silence during key fill); SCA v4.1 (RF Standby/RF Mute during SDR software update) | Gap |
| HMI-REQ-006 | SPEC-001, SPEC-003, SPEC-012 | MIL-STD-1472H, section 5.2.1 (persistent status presentation principle); STANAG 4586, section 6.3.2; STANAG 4691 (EKMS key management and crypto state visibility) | Derived |
| HMI-REQ-007 | SPEC-001, SPEC-002, SPEC-012 | MIL-STD-1472H, section 5.2.1 (state coding and visibility); DEF STAN 00-250, section 6.3 (safety-relevant state indication); STANAG 4691 (PT/CT mode control and indication) | Derived |
| HMI-REQ-008 | SPEC-001, SPEC-002 | MIL-STD-1472H, section 5.2.1 (persistent status presentation); DEF STAN 00-250, section 9.2 (error and fault state indication) | Derived |
| HMI-REQ-009 | SPEC-001, SPEC-002, SPEC-010, SPEC-012 | MIL-STD-1472H, section 5.2.1; DEF STAN 00-250, section 9.4 (functional segregation of critical operations); STANAG 4691 (RF silence during key fill / EMCON procedures) | Derived |
| HMI-REQ-010 | SPEC-001, SPEC-003 | MIL-STD-1472H, section 5.2.1 (persistent status presentation); STANAG 4586, section 6.3.2 (platform navigation state awareness) | Derived |
| HMI-REQ-011 | SPEC-001, SPEC-003 | MIL-STD-1472H, section 5.2.1 (persistent status presentation); STANAG 4586, section 6.3 (mission management and time reference) | Derived |
| HMI-REQ-012 | SPEC-001, SPEC-002 | MIL-STD-1472H, section 5.2.1 (persistent status presentation); DEF STAN 00-250, section 9.2 (power state and system health indication) | Derived |
| HMI-REQ-003 | SPEC-001, SPEC-003, SPEC-013 | MIL-STD-1472H, section 5.2.1 (persistent status presentation); STANAG 4586, section 6.3.2; SCA v4.1 (waveform identity and lifecycle management) | Derived |
| HMI-REQ-004 | SPEC-001, SPEC-002 | MIL-STD-1472H, section 5.2.1 (persistent status presentation); DEF STAN 00-250, section 6.3 (configuration state visibility) | Derived |
| HMI-REQ-043 | SPEC-001, SPEC-002, SPEC-003 | MIL-STD-1472H, section 5.2.6 (system responsiveness and feedback); DEF STAN 00-250, section 9.2 (error detection and reporting); STANAG 4586, section 6.3 (data exchange and command interface) | Derived |
| HMI-REQ-026 | SPEC-001, SPEC-003, SPEC-013 | MIL-STD-1472H, section 5.10 (navigation efficiency and bounded interaction depth); STANAG 4586, section 6.3 (operator command workflow); SCA v4.1 (waveform lifecycle operation and activation flow) | Derived |
| HMI-REQ-035 | SPEC-001, SPEC-002, SPEC-010, SPEC-013 | MIL-STD-1472H, section 5.10.5 (protection for high-consequence operations); DEF STAN 00-250, section 9.4 (functional segregation and guarded operations); IEC 61511 (enforced precondition/interlock principles); SCA v4.1 (waveform deinstantiation and software lifecycle state model) | Gap |
| HMI-REQ-036 | SPEC-001, SPEC-002, SPEC-003, SPEC-013 | MIL-STD-1472H, section 5.2.3 and 5.10 (feedback clarity and controllable workflows); DEF STAN 00-250, section 9.2 and 10.3 (transaction integrity and accountability); STANAG 4586, section 6.3 (configuration command exchange); SCA v4.1 (waveform configuration/preset lifecycle context) | Derived |
