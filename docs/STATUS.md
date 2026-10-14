# Status — v0.2

Stand: 2026-10-14 · Phase M3: lokaler Workflow erweitert, Bildausschnitt und Zoom respektieren das Originalformat, und alle relevanten Steuerungen aktualisieren das Mosaik automatisch im Live-Workflow.

## Implementiert

- pnpm-Workspace mit [package.json](../package.json), [pnpm-workspace.yaml](../pnpm-workspace.yaml), [apps/mosaic-web](../apps/mosaic-web) und [packages/mosaic-core](../packages/mosaic-core)
- framework-unabhängiger Core in [packages/mosaic-core/src/index.ts](../packages/mosaic-core/src/index.ts) mit deterministischer Rastergenerierung, Abschnittslogik, Farb-Limits und Pixel-Art-Sampling
- lokaler Demo-Palette mit klarer Kennzeichnung im UI und Materialübersicht
- Web-Worker-Flow in [apps/mosaic-web/src/workers/mosaic.worker.ts](../apps/mosaic-web/src/workers/mosaic.worker.ts) sowie Browser-Adapter für Bildimport, benutzerdefinierte Parameter, live Crop/Zoom und lokale Speicherung
- IndexedDB-Project-Store mit Laden und erneutem Öffnen in [apps/mosaic-web/src/App.tsx](../apps/mosaic-web/src/App.tsx)
- M1-, M2- und M3-UI- sowie Browser-Smoke-Tests inklusive Fixtures im Browser-Verzeichnis
- Bildausschnitt-/Zoom-Logik mit Seitenverhältnis-Schutz und automatischer Neuberechnung in [packages/mosaic-core/src/index.ts](../packages/mosaic-core/src/index.ts)

## Verifiziert

- `pnpm --dir packages/mosaic-core test` → 3/3 Tests erfolgreich; M1- und M2-Logik verifiziert
- `pnpm typecheck` → erfolgreich, keine TypeScript-Fehler in Core oder Web-App
- `pnpm build` → Produktionsbuild erfolgreich gebaut; Vite erzeugte die dist-Ausgabe
- `pnpm --dir apps/mosaic-web exec playwright test --reporter=list` → 2 Browser-Smoke-Tests bestanden

## Aktueller Scope

Der aktuelle Slice umfasst:

- lokal geladenes Bild → Ausschnitt/Zoom mit Seitenverhältnis-Schutz → Rasterkonfiguration (Grid, Sections, K, Pixel-Art) → Mosaik → Materialliste → lokal speichern → erneut öffnen
- lokale, Demo-gestützte Palette ohne echte Katalog-/Lieferdaten
- keine Cloud-Synchronisierung, kein echter Inventarkatalog, keine kompletten Exporte, kein vollständiger PWA-/Offline-Abschluss

## Nächster sinnvoller Schritt

M3 mit stärkerem UX- und Produkt-Polish fortsetzen: live Auto-Refresh bei Steuerungsänderungen, Katalog-/Palette-Editor, bessere Fehlermeldungen, Projekt-Umbenennung, Projekt-Löschung und weitere Validierungen. Die fachliche Abnahme für M1/M2 ist mit funktionierendem lokaler Ablauf, Core-Tests und Browser-Smoke erfüllt; M4 beginnt erst mit den nächsten Produkt- und Offline-Abnahmen.

## Pflege

Aktueller Stand, erbrachte Prüfungen und verbleibende Scope-Grenzen werden hier dokumentiert; keine geplatzten oder ungetesteten Features als fertig gemeldet.
