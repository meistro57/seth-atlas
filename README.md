# SETH ATLAS — The Architecture of Reality

*Explore the claims. Trace the evidence. Discover the missing connections.*

*Reverse Engineering the Architecture of Reality*

A responsive, client-side research site documenting a multi-phase investigation into a proposed model of reality: how belief relates to probable events, selection, materialisation, and the unresolved question of shared physical events.

## What this is

- A static site: plain HTML/CSS/JS. No framework, no build step, no API keys, no backend.
- Editable data layer: `assets/data/research.json` holds every claim, correction, timeline entry, and open question. Update the JSON, not the HTML, to add new findings.
- Diagrams are rendered SVGs with editable Mermaid source retained in the research workspace.

## Structure

```
seth-research-lab/
  index.html              # single-page research dashboard
  css/style.css           # design system (dark, responsive, accessible)
  js/app.js               # renders dashboard, evidence explorer, models, gallery
  assets/data/research.json  # source of truth for claims/corrections/questions/timeline
  assets/svg/             # rendered diagrams
```

## How to update

1. Edit `assets/data/research.json` — add a claim with its `offset`, `interpretation`, `confidence`, `status`, `models`, and `text` fragment.
2. If a conclusion is superseded, add an entry to `corrections` (never delete the old one — retractions are on the record by design).
3. Add new phases to `timeline` and new unresolved items to `openQuestions`.
4. Drop a new rendered SVG into `assets/svg/` and add its entry in the `diagrams` array in `js/app.js`.
5. Commit and push; GitHub Pages serves the site from the branch root.

## Source references & limitations

- All offsets are byte positions into the verified extraction used for retrieval (SHA-256 `a96cae0e…`, 1,123,310 bytes). They are OCR-derived and do not correspond to printed page numbers.
- Quoted fragments are limited, research-scope quotations — not reproduction of the source books.
- Every claims "interpretation" label (explicit / inferred / annotation / negative / asserted) keeps Seth claims distinct from our interpretation.

## Evidence discipline (carried from the research phases)

- Solid arrows = stated by the source; dashed = inferred; red `[?]` = unresolved.
- A/B undecidability in Phase 3 stays visible in the Model Explorer.
- The Phase 4 verdict is "D-adjacent, single worked example, second party unexamined".
- No forced winner, no invented mechanisms, no numerical weights without evidence.

## Deployment

Static site served by GitHub Pages from the repository root. No secrets, no private workspace paths, no credentials are present or referenced.