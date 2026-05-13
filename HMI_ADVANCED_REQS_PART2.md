## 6. Notes on Verification Planning

- Software-only verification can confirm UI behavior, workflow constraints, and accessibility semantics.
- Environmental and NVIS compliance requires hardware-in-the-loop or laboratory photometric evidence.
- For certification-oriented use, each requirement should be linked to test cases and objective evidence IDs in a separate verification plan.

## 7. Appendix - Traceability Reference Notes (Informative)

This appendix explains the meaning of the standards and clauses cited in Section 5. The summaries below are informative only and do not replace the official source documents.

### 7.1 SPEC-001 - MIL-STD-1472H

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

### 7.2 SPEC-002 - DEF STAN 00-250

- Section 6.3: Addresses operator cueing and alert semantics. In this specification it underpins a deterministic severity model (NORMAL/SUCCESS/WARNING/ERROR/CRITICAL), consistent visual coding, and clear prioritization logic so urgent conditions remain salient under high workload.
- Section 9.2: Addresses controlled transaction behavior for operator commands. Mapping in this document: stage-then-commit interaction model, explicit Submit/Reset controls, visible pending-change indicators, and rollback/notification behavior when commit fails.
- Section 9.4: Addresses segregation and guarding of hazardous or high-impact functions. Applied interpretation: critical controls should be separated from routine monitoring controls in layout and interaction path, with additional friction (navigation gate and/or confirmation) before execution.
- Section 10.1: Addresses identity, authentication, and authorization boundaries. Here this supports role-scoped page/action visibility and enforcement, plus explicit session governance so capability always matches authenticated role.
- Section 10.3: Addresses accountability through retained records of significant events/actions. In this HMI context that means maintaining auditable traces of access and command-related changes with sufficient detail for forensic review.
- Section 11: Addresses inclusive operability and usability constraints. Interpreted here as keyboard-complete operation, deterministic focus flow, assistive-technology-compatible semantics, and interaction patterns that remain understandable across operator capability differences.
- Section 12: Addresses linguistic coherence in operational interfaces. Applied interpretation: one active language profile at runtime, no mixed-language labels/messages within the same context, and consistent terminology for commands, statuses, and alerts.
- General section 10 reference: Used where the traceability points to the broader security and access-control intent rather than a uniquely identified narrower clause.

### 7.3 SPEC-003 - STANAG 4586

- Section 6.3.2: Addresses explicit indication of control authority in multi-actor operations. In this specification it is used to justify continuous display of authority mode (for example LOCAL_OPERATOR, REMOTE_OPERATOR, AUTONOMOUS), with rapid updates on authority transfer to prevent unsafe command assumptions.
- Section 6.4: Addresses acknowledgement/confirmation discipline for consequential actions and alerts. Mapping used here: high-impact commands require deliberate confirmation flow, and critical conditions require explicit acknowledgement before dismissal so the operator performs conscious assessment.
- Degraded/contingency operation intent: Used where the traceability refers to continuity of essential functions or fallback operation, but a narrower clause still needs confirmation.

### 7.4 SPEC-004 - ARP4754A

- Section 5.3: Addresses system-level development considerations for correctness and integrity of information used in operational decisions. In this document, it is referenced to support explicit treatment of stale/invalid data in the HMI: detect loss of freshness, mark affected values, avoid presenting stale data as nominal, and clear stale condition only after confirmed data validity restoration.

### 7.5 SPEC-005 - DO-178C

- Deterministic error-handling objective: Used in traceability where software behavior must remain bounded, predictable, and testable during faults or backend failures.
- Timing determinism objectives: Used where timeout handling must be explicit and analyzable rather than indefinite or ambiguous.
- Robust error-recovery objectives: Used where retry and recovery behavior must remain controlled, bounded, and verifiable.
- Note: In this document the DO-178C references are principle-level and informative unless a more precise software-level objective is allocated in a downstream certification baseline.

### 7.6 SPEC-006 - MIL-L-85762

- NVIS compatibility reference: Used to indicate that the display must limit emissions so as not to interfere with night-vision equipment.
- No narrower clause is cited here because conformance depends strongly on photometric characteristics of the physical display hardware.

### 7.7 SPEC-007 - MIL-STD-3009

- NVIS-compatible lighting reference: Used to support software and hardware display behavior suitable for operation with night-vision systems.
- In this document the reference is used at standard level because final conformity depends on measured luminance and spectral characteristics.

### 7.8 SPEC-008 - MIL-STD-2525

- Symbol set/profile conformance: Used to indicate that displayed tactical symbols must preserve standard meaning, identity, and consistency across views.
- In this document the reference is profile-level rather than clause-level because the applicable symbol subset depends on the mission/system profile.

### 7.9 SPEC-009 - ISO 9241-110

- Feedback and responsiveness dialogue principles: Used where the system must provide timely, understandable reaction to operator actions.
- Self-descriptiveness: Used where interface responses must clearly communicate state and effect of operator actions.
- Controllability/navigation consistency: Used where the operator must remain in control of navigation path and interaction flow.
- Conformity with user expectations: Used where consistent patterns, labels, and behavior reduce confusion and training overhead.
- Efficiency of dialogue: Used where the interface must minimize unnecessary steps for frequently performed tasks.
- Consistency principles: Used where presentation and language must remain coherent across the interface.

### 7.10 SPEC-010 - IEC 61511

- Separation/protection principles: Used where critical actions must be segregated from routine monitoring functions and protected against inadvertent activation.
- The reference is principle-based in this document and should be refined further if a formal safety lifecycle allocation is required.

### 7.11 SPEC-011 - WCAG 2.x AA

- Keyboard accessibility criteria: Used where all functionality must remain operable without pointer-only interaction.
- Semantic accessibility criteria: Used where controls need machine-readable names, roles, and states for assistive technology.

### 7.12 SPEC-012 - STANAG 4691

- NATO Electronic Key Management System (EKMS) interoperability standard: Used to support the requirement that radio communication SHALL be inhibited (no Tx, no Rx) during cryptographic key loading, key fill, and key zeroization operations. COMSEC management procedures consistently require the radio to be in a non-transmitting state during key handling to prevent inadvertent key material exposure or compromise. The reference is used at standard level; specific clause-level mapping requires confirmation against the edition applicable to the target system's COMSEC baseline.

### 7.13 SPEC-013 - SCA v4.1 (Software Communications Architecture)

- SDR device lifecycle and RF management: Used to support the requirement that radio communication SHALL be inhibited during firmware or waveform software updates. The Software Communications Architecture (SCA), published by the JTRS Joint Program Office (PEO C3T), defines the SDR device and waveform lifecycle, including an RF Standby / RF Mute state that must be asserted during software loading to prevent incomplete or undefined RF behaviour. The reference is used at standard level; specific clause-level mapping requires confirmation against the applicable SCA version and platform-specific OAL implementation.

## 8. Implementation Details (Non-Normative)

This section provides possible implementation approaches for selected requirements. These notes are informative and do not alter normative requirement compliance criteria. Alternative approaches may be used provided all acceptance criteria are satisfied.

### 8.1 HMI-REQ-034 - Transmission inhibit during critical radio operations

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

### 8.2 HMI-REQ-030 - Two-step confirmation for high-impact commands

#### Confirmation interaction pattern

A compliant implementation presents the confirmation sequence as two distinct, intentional operator actions separated by an intermediate confirmation dialog:

1. **First step — Command intent**: The operator activates the command control (e.g., presses a button or selects a menu item). The HMI does not dispatch the command; instead it opens a modal confirmation dialog that clearly identifies the command name, its consequence, and any relevant system state (e.g., current waveform, key status).
2. **Second step — Explicit confirmation**: The dialog presents a labelled confirm action (e.g., "Confirm REBOOT") and a cancel action. The confirm action is visually distinct and requires a deliberate activation (e.g., a separate press or a hold-to-confirm gesture where appropriate). Only upon this second action is the command dispatched.

The dialog SHALL be dismissed automatically and the command cancelled if no operator action is taken within a configurable timeout (recommended: 30 s), to prevent accidental dispatch from an unattended screen.

#### Command identification in the dialog

The confirmation dialog SHALL display:

- The human-readable name and short description of the command.
- A summary of the expected consequence (e.g., "All active alarm conditions will be cleared").
- Any relevant current state that may affect the decision (e.g., "Active waveform: SATURN-V", "Loaded key: NET-04").
- For irreversible commands (e.g., KEY_ZEROIZE, FACTORY_RESET), a prominent irreversibility warning (e.g., "This action cannot be undone").

#### Audit trail

Each two-step confirmation event is recorded in the operational audit trail with at minimum: timestamp, command identifier, outcome (CONFIRMED or CANCELLED/TIMEOUT), and operator identity if available.

### 8.3 HMI-REQ-051 - Contrast ratio minimum

#### Background: the WCAG AA 4.5:1 standard

WCAG (Web Content Accessibility Guidelines), maintained by the W3C, defines contrast ratio as the relative luminance difference between a foreground colour and its background. The formula is:

$$\text{CR} = \frac{L_1 + 0.05}{L_2 + 0.05}$$

where $L_1$ is the relative luminance of the lighter colour and $L_2$ that of the darker one. Relative luminance is computed from linearised sRGB channel values using the formula specified in WCAG 2.x Success Criterion 1.4.3.

The **AA level** requires a minimum contrast ratio of **4.5:1** for normal text (< 18 pt or < 14 pt bold) and **3:1** for large text (≥ 18 pt or ≥ 14 pt bold) and for non-text UI components (icons, input borders, status indicators). MIL-STD-1472H section 5.3.3.3 adds a stricter operational overlay: under degraded lighting or NVG conditions, the effective contrast requirement may be higher due to display luminance reduction.

A contrast ratio of 4.5:1 means the lighter colour is at least 4.5 times more luminous than the darker one. For reference:

- Black (`#000000`) on white (`#FFFFFF`) yields 21:1.
- A mid-grey (`#767676`) on white yields exactly 4.54:1, passing AA for normal text.
- A light grey (`#959595`) on white yields approximately 3:1, passing only for large text.

#### Implementation guidance

##### 1. Design-token governance

Define all foreground/background colour pairings through a centrally governed design-token system (e.g., CSS custom properties or a token file). Each token pair SHALL have its contrast ratio recorded as metadata. This prevents ad-hoc colour choices from bypassing the requirement and makes compliance auditable.

```css
/* Example token definition */
--color-text-primary:      #1a1a1a;   /* on --color-surface-default: CR ≈ 15.3:1 */
--color-text-secondary:    #5a5a5a;   /* on --color-surface-default: CR ≈ 5.9:1  */
--color-text-disabled:     #8a8a8a;   /* on --color-surface-default: CR ≈ 3.5:1  ⚠ large text only */
--color-surface-default:   #ffffff;
```

##### 2. Automated contrast checking in CI

Integrate a contrast-ratio linting step into the build pipeline. Tools such as `axe-core`, `color-contrast-checker`, or Storybook's accessibility addon can scan rendered components and flag violations before deployment.

- Run contrast checks against all theme variants (light, dark, NVG-safe) because a pair that passes in the light theme may fail in the dark theme or under a dimmed NVG palette.
- Include status-colour tokens (NORMAL/CAUTION/ALARM) in the check scope; coloured badges and icons must also meet the 3:1 non-text threshold.

##### 3. Theme-aware verification

For each supported theme, generate a contrast-matrix report mapping every token pair to its computed ratio. Flag any pair below 4.5:1 (normal text) or 3:1 (large text / non-text) as a build warning, and treat ratios below 3:1 for any category as a build error.

##### 4. Dynamic content considerations

User-generated or apparatus-supplied strings (parameter values, preset names, waveform identifiers) are rendered using design-token foreground/background pairs, so compliance is inherited automatically provided the token pairs are compliant. Avoid inline styles or dynamic colour assignments that could break the token contract.

##### 5. Verification evidence

For formal verification, produce a static contrast audit report (e.g., exported from axe-core or a dedicated tool) covering:

- All text styles defined in the design system.
- All non-text UI components (status icons, input borders, badges).
- All theme variants.

This report constitutes the objective evidence for the Inspection + Test verification method required by HMI-REQ-051.

### 8.4 HMI-REQ-027 - Transmission initiation simplicity

#### Background: the external standard and the 150 ms threshold

HMI-REQ-027 traces to **MIL-STD-1472H** (Human Engineering), which establishes general principles of task efficiency, control accessibility, and response-time requirements for operator interfaces in military systems. Although MIL-STD-1472H does not mandate a single hard latency number for PTT (Push-To-Talk) initiation, the 150 ms acceptance criterion is derived from the convergence of three independent evidence bases:

##### 1. Human reaction-time physiology

Controlled studies of simple auditory/visual reaction time place the average human voluntary response at approximately 150–200 ms for a prepared, expected stimulus. For tactical radio communication — where the operator is already in a mission-active context and is intentionally reaching for the transmit control — the *decision* phase is near zero; the residual motor execution time is 80–130 ms. An end-to-end system latency budget of 150 ms therefore ensures that the system introduces no perceptible additional delay relative to the operator's own physical action time.

##### 2. Voice intelligibility and conversational protocol

ITU-T G.114 (one-way delay) and NATO STANAG 4586 communication quality guidelines establish that delays perceivable as "system lag" degrade conversational turn-taking and may cause operators to repeat transmission start syllables. Psychoacoustic research (e.g., work cited in MIL-HDBK-46855A) identifies approximately 100–200 ms as the perceptibility boundary for feedback delay in audio-motor tasks. Staying at or below 150 ms keeps the system within the imperceptible-delay range for a trained operator.

##### 3. MIL-STD-1472H section 5.2.6 — display update latency

MIL-STD-1472H section 5.2.6 recommends that visual feedback for operator actions appear within 100–200 ms to be perceived as causally coupled to the action. The 150 ms criterion positions the system at the midpoint of this range, ensuring that the visual TX-state indicator (HMI-REQ-001) transitions simultaneously with the perceived start of transmission from the operator's perspective.

##### Summary of the 150 ms budget decomposition

| Phase | Typical budget |
| --- | --- |
| Input event capture (touch/key debounce) | ≤ 10 ms |
| HMI event processing and command dispatch | ≤ 20 ms |
| Communication round-trip to apparatus (local bus / LAN) | ≤ 50 ms |
| Apparatus acceptance and RF front-end activation signal | ≤ 40 ms |
| HMI state update and visual feedback render | ≤ 30 ms |
| **Total** | **≤ 150 ms** |

#### Implementation guidance

##### Single-action constraint

The transmission initiation path SHALL consist of exactly one discrete operator action (e.g., a single button press, a dedicated hardware PTT key, or a single touch on a clearly labelled on-screen control). Multi-step sequences, confirmation dialogs, or navigation steps are prohibited on this path, with the exception of the inhibit conditions mandated by HMI-REQ-034 and HMI-REQ-032.

##### Latency measurement and verification

End-to-end latency SHALL be measured from the timestamp of the input event (hardware interrupt or touch event) to the timestamp of the first rendered frame showing the TX state indicator active. Tests SHALL be conducted:

- On target hardware (or a hardware-representative test bench), not solely in a browser development environment.
- Under representative background load (active parameter polling, notification processing).
- Across all supported themes and display resolutions.

A minimum of 100 samples per test configuration SHALL be collected; the 95th-percentile latency SHALL be ≤ 150 ms.

##### Guard against accidental activation

Although the path is single-action, the transmit control SHALL be positioned and sized to minimise inadvertent activation (in compliance with HMI-REQ-020 minimum touch-target requirements and HMI-REQ-031 functional segregation). Where the platform supports it, a hardware PTT key with physical travel is preferred over a purely on-screen control for high-tempo operation.

### 8.5 HMI-REQ-021 - Minimum operational font size

#### Background: the external standard and the 16 px value

HMI-REQ-021 requires that operationally relevant text be rendered at a minimum of **16 px at 96 dpi** (the CSS reference pixel grid). The value is derived from the convergence of three independent sources: human visual acuity research, MIL-STD-1472H ergonomic specifications, and web accessibility practice.

##### 1. Visual acuity and minimum legible character subtended angle

The International Commission on Illumination (CIE) and human-factors literature consistently identify a minimum visual angle of approximately **16–20 arc-minutes** for comfortable reading of alphanumeric characters under operational conditions (moderate ambient light, no optical aid). At a typical operator viewing distance of **50 cm** — the midpoint of the 30–70 cm range used in MIL-STD-1472H section 5.3 — the minimum character height resolves as:

$$h = 2 \cdot d \cdot \tan\!\left(\frac{\alpha}{2}\right)$$

where $d = 500\,\text{mm}$ and $\alpha = 16' = 0.00465\,\text{rad}$, giving:

$$h \approx 2 \times 500 \times 0.002326 \approx 2.33\,\text{mm}$$

Converting to CSS pixels at 96 dpi (1 CSS pixel = 0.2646 mm):

$$h_\text{px} = \frac{2.33}{0.2646} \approx 8.8\,\text{px}$$

This is the absolute physiological minimum. MIL-STD-1472H applies a **safety factor of approximately 1.8×** for operational environments that introduce vibration, stress, degraded lighting, or NVG use, yielding:

$$h_\text{operational} \approx 8.8 \times 1.8 \approx 15.8\,\text{px} \approx 16\,\text{px}$$

##### 2. MIL-STD-1472H section 5.3.3 — character height requirements

MIL-STD-1472H section 5.3.3 specifies character height as a function of viewing distance and criticality. For critical alphanumeric information at 50 cm viewing distance, the standard recommends a minimum character height of approximately **3.5–4.5 mm**. At 96 dpi this range maps to:

$$\frac{3.5\,\text{mm}}{0.2646\,\text{mm/px}} \approx 13.2\,\text{px} \quad \text{to} \quad \frac{4.5\,\text{mm}}{0.2646\,\text{mm/px}} \approx 17.0\,\text{px}$$

The 16 px value sits within this range and is rounded to the nearest even CSS pixel for alignment with font-size conventions in web-based HMI frameworks.

##### 3. Web accessibility and browser defaults

WCAG 2.x and the W3C CSS specification both define the browser default body font size as **16 px** (equivalent to 12 pt at 96 dpi). This value was originally chosen by browser vendors to match the minimum comfortable reading size on screen at typical desktop viewing distances. Using 16 px as the minimum aligns the HMI with the established accessibility baseline and avoids the documented readability degradation associated with sub-16 px font sizes observed in usability studies cited in ISO 9241-303.

##### Summary of the 16 px derivation

| Source | Derived minimum |
| --- | --- |
| Visual acuity + MIL-STD-1472H operational safety factor | ≈ 15.8 px → **16 px** |
| MIL-STD-1472H §5.3.3 character height range at 50 cm | 13–17 px → **16 px** (midpoint, rounded) |
| WCAG / browser accessibility baseline | **16 px** |

#### Scope of the requirement

The 16 px minimum applies to all text that is operationally relevant: parameter labels and values, navigation labels, counters, status text, alert messages, and channel/waveform/preset identifiers. It does not apply to purely decorative or incidental text (e.g., copyright notices, version strings in non-operational menus), provided those elements are never the primary source of mission-relevant information.

#### Implementation guidance

##### CSS token enforcement

Define a `--font-size-min-operational` token set to `1rem` (= 16 px at browser default scale) and apply it as the baseline for all operational text styles. Avoid absolute pixel sizes smaller than 16 px in any component that renders operational data.

```css
:root {
  --font-size-min-operational: 1rem;     /* 16 px at default scale */
  --font-size-label:           1rem;     /* parameter and status labels */
  --font-size-value:           1.125rem; /* parameter values – slightly larger */
  --font-size-nav:             1rem;     /* navigation breadcrumb and menu items */
}
```

##### Automated verification

Include a Storybook or axe-core accessibility check that flags any rendered text node with a computed font size below 16 px on components tagged as operational. This check SHALL run in CI for all supported themes and viewport sizes.

##### Viewing distance assumption

If the target platform specifies a viewing distance other than 50 cm (e.g., a vehicle-mounted display viewed from 70 cm), the minimum font size SHALL be scaled proportionally:

$$h_\text{px}(d) = 16\,\text{px} \times \frac{d}{500\,\text{mm}}$$

For example, at 70 cm: $16 \times 1.4 = 22.4\,\text{px}$ minimum. The platform-specific value SHALL be documented in the deployment configuration and verified against the token definitions before release.

### 8.6 HMI-REQ-053 - NVG/NVIS compatibility mode: colour palette conversion

#### Background: the standard and the NVIS constraint

**MIL-STD-3009** and **MIL-L-85762** define the photometric and spectral constraints that a display must satisfy to be NVIS-compatible. The key constraint is that the display must not emit significant radiant energy in the **near-infrared (NIR) band that NVG image-intensifier tubes are sensitive to** (typically 625–930 nm for Class B NVIS, 665–930 nm for Class A). Even small amounts of NIR emission saturate or bloom the NVG image, degrading the night-vision picture for the wearer and nearby personnel.

Equally important is **absolute luminance control**: in a blacked-out environment, even a faint white-lit display is bright enough to compromise dark adaptation and crew concealment. MIL-STD-3009 specifies a maximum NVIS radiance of approximately **$10^{-5}\,\text{ft-L}$** (roughly $3.4 \times 10^{-5}\,\text{cd/m}^2$) measured through a Class B NVIS filter, which is orders of magnitude below normal display luminance.

Compliance therefore requires two complementary measures:

1. **Hardware**: a display panel with low NIR emission (OLED or a filtered LCD/LED assembly with an NIR-blocking coating or filter), verified by photometric measurement. This is outside the scope of software.
2. **Software**: an NVIS colour palette that confines emission to the **green band (505–560 nm)**, which passes through the NVIS Class B filter with negligible sensitivity, while achieving low absolute luminance so the NVG tube is not overwhelmed even by the permitted green signal.

#### Why the standard favours green

The NVIS Class B filter transmits light in the green-yellow window (~505–560 nm) at very low efficiency relative to human photopic vision, so a display that emits *only* in this band can remain visually readable to the NVG-equipped operator while producing negligible NIR energy. The human eye's photopic peak sensitivity is at 555 nm — conveniently within this window — which means a narrow-green palette can preserve adequate luminous contrast without NIR contamination.

#### Colour palette conversion algorithm

The following process converts a standard sRGB design-token palette into an NVIS-safe green palette.

##### Step 1 — Linearise sRGB values

For each channel $c \in \{R, G, B\}$ of the original sRGB token (8-bit, 0–255), compute the linear light value:

$$c_\text{lin} = \begin{cases} c_\text{sRGB}/12.92 & \text{if } c_\text{sRGB} \leq 0.04045 \\ \left(\dfrac{c_\text{sRGB} + 0.055}{1.055}\right)^{2.4} & \text{otherwise} \end{cases}$$

where $c_\text{sRGB}$ is the normalised value in $[0,1]$.

##### Step 2 — Compute relative luminance

$$Y = 0.2126\,R_\text{lin} + 0.7152\,G_\text{lin} + 0.0722\,B_\text{lin}$$

This gives the CIE 1931 luminance $Y \in [0,1]$ of the original colour, independent of hue.

##### Step 3 — Map luminance to the NVIS green channel

Discard hue and saturation entirely. Set the NVIS output colour to a single green hue (e.g., `#00FF00` in sRGB, or a display-specific narrow-band green if the panel supports it) and scale its intensity linearly by the original luminance $Y$:

$$G_\text{NVIS} = \text{round}(Y \times G_\text{max})$$

where $G_\text{max}$ is the maximum green channel value that keeps the display within the MIL-STD-3009 radiance budget (typically 64–128 out of 255, determined by photometric calibration of the specific panel).

The NVIS output colour for every token is therefore `rgb(0, G_NVIS, 0)`.

##### Step 4 — Apply a global luminance scale factor

To ensure the maximum display white stays within the MIL-STD-3009 NVIS radiance budget, multiply all $G_\text{NVIS}$ values by a panel-specific scale factor $k \in (0, 1]$ determined during hardware calibration:

$$G_\text{NVIS,\,final} = \text{round}(k \times G_\text{NVIS})$$

##### Step 5 — Verify contrast ratios in the NVIS palette

After conversion, re-run the WCAG contrast check (see HMI-REQ-051 and section 9.3) on all token pairs using the NVIS green values. Because the conversion is luminance-preserving, contrast ratios are maintained *relative to each other*, but the absolute luminance is reduced. Confirm that at minimum the 3:1 floor is satisfied for all critical text and status elements under NVIS viewing conditions.

#### Implementation in CSS / design tokens

```css
/* Standard (day) theme */
:root[data-theme="day"] {
  --color-surface-default:  #1a1a1a;
  --color-text-primary:     #f0f0f0;   /* Y ≈ 0.879 */
  --color-status-alarm:     #ff4444;   /* Y ≈ 0.148 */
  --color-status-caution:   #ffaa00;   /* Y ≈ 0.422 */
  --color-status-normal:    #44cc44;   /* Y ≈ 0.454 */
}

/* NVIS-safe green palette (k = 0.50, G_max = 128) */
:root[data-theme="nvis"] {
  --color-surface-default:  rgb(0,   0, 0);      /* Y=0 → G=0   */
  --color-text-primary:     rgb(0, 113, 0);      /* Y=0.879 → G=112 */
  --color-status-alarm:     rgb(0,  19, 0);      /* Y=0.148 → G=19  */
  --color-status-caution:   rgb(0,  54, 0);      /* Y=0.422 → G=54  */
  --color-status-normal:    rgb(0,  58, 0);      /* Y=0.454 → G=58  */
}
```

The theme is activated by toggling the `data-theme` attribute on the root element; all component styles are inherited automatically through the token system, requiring no per-component changes.

#### Limitations and hardware dependency

- The software palette conversion eliminates NIR contribution from the *colour encoding*, but NIR compliance ultimately depends on the panel's physical spectral output. Software alone cannot guarantee MIL-STD-3009 compliance; photometric hardware testing is mandatory.
- Colour-coding semantics (e.g., ALARM = red, CAUTION = amber) are lost in the NVIS palette; the HMI must rely on *luminance contrast* and *shape/icon differentiation* to convey severity under NVIS mode. Ensure all status conditions remain distinguishable by luminance level or icon shape alone, as required by HMI-REQ-013.

---

## 9. Acronyms

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
