
# Dry Eye Assessment MVP

A simple, responsive, rule-based dry-eye assessment prototype for doctor-facing use.

## Run

Open `index.html` in any modern browser. No backend or build step is required.

## Current MVP rules

- OSDI <= 4: Normal
- OSDI > 4 and <= 24: Abnormal
- TBUT > 10 seconds: Normal
- TBUT < 10 seconds: Dry-eye indicator
- TMH 0.20–0.30 mm: Normal
- TMH < 0.20 mm: Abnormal
- Age > 60: Higher-risk factor
- Female gender: Higher-risk factor

The final clinical specification should be confirmed before the tool is used in a real clinical workflow. In particular, boundary values such as OSDI = 4 and TBUT = 10 should be confirmed by the clinical team.
