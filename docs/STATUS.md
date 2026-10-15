# Status — v0.2

Stand: 2026-10-15 · M3 abgeschlossen: responsive Arbeitsfläche, mobile Zellbearbeitung, Sperrenerhalt bei Neuberechnung und lokalem Roundtrip umgesetzt.

## Implementiert

- pnpm-Workspace mit [package.json](../package.json), [pnpm-workspace.yaml](../pnpm-workspace.yaml), [apps/mosaic-web](../apps/mosaic-web) und [packages/mosaic-core](../packages/mosaic-core)
- framework-unabhängiger Core in [packages/mosaic-core/src/index.ts](../packages/mosaic-core/src/index.ts) mit deterministischer Rastergenerierung, Abschnittslogik, Farb-Limits und Pixel-Art-Sampling
- lokaler Demo-Palette mit klarer Kennzeichnung im UI und Materialübersicht
- Web-Worker-Flow in [apps/mosaic-web/src/workers/mosaic.worker.ts](../apps/mosaic-web/src/workers/mosaic.worker.ts) sowie Browser-Adapter für Bildimport, benutzerdefinierte Parameter, live Crop/Zoom und lokale Speicherung
- IndexedDB-Project-Store mit Laden und erneutem Öffnen in [apps/mosaic-web/src/App.tsx](../apps/mosaic-web/src/App.tsx)
- M1-, M2- und M3-UI- sowie Browser-Smoke-Tests inklusive Fixtures im Browser-Verzeichnis
- Bildausschnitt-/Zoom-Logik mit Seitenverhältnis-Schutz und automatischer Neuberechnung in [packages/mosaic-core/src/index.ts](../packages/mosaic-core/src/index.ts)
- Worker-Ergebnisse erhalten die geladene Quellbild-URL; das Quellbild bleibt nach der Mosaikgenerierung sichtbar
- UUID-v4-Fallback über `crypto.getRandomValues` unterstützt Bildgenerierung und Projektaktionen auf Mobilgeräten im unsicheren HTTP-LAN-Kontext
- Canvas-Zellwahl per Tap/Klick und Pfeiltasten, manuelle Farbänderung mit aktualisierter Materialliste und Lock/Unlock
- Gesperrte Zellen samt Farben werden bei gleicher Rastergeometrie in den Worker übernommen; gesperrte Farben zählen gegen K, unlösbare Konflikte liefern `LOCK_CONFLICT`
- Sperrstatus wird in IndexedDB und JSON-Dateien gespeichert; ältere Projektzellen ohne `locked` werden als entsperrt normalisiert
- Zellposition, Farbname und Sperrstatus erscheinen in der zugänglichen Statusregion
- Responsive Arbeitsfläche mit gruppierten Controls, nebeneinanderliegenden Desktop-Vorschauen, mobilem Einspaltenlayout und einklappbarer Palette
- Playwright-Abdeckung für Worker-Roundtrip des Quellbilds sowie 320-px-, Mobile- und Tablet-Layouts

## Verifiziert

- `pnpm --dir packages/mosaic-core test` → 3/3 Tests erfolgreich; M1- und M2-Logik verifiziert
- `pnpm typecheck` → erfolgreich, keine TypeScript-Fehler in Core oder Web-App
- `pnpm build` → Produktionsbuild erfolgreich gebaut; Vite erzeugte die dist-Ausgabe
- `pnpm --dir apps/mosaic-web exec playwright test --reporter=list` → 7 Browser-Smoke-Tests bestanden, darunter UUID-Fallback, Touch-/Tastaturauswahl, Zelländerung, Sperr-/Roundtrip und responsive Viewports bis 320 px
- `pnpm typecheck` → Core und Web-App ohne TypeScript-Fehler
- `pnpm build` → Produktionsbuild erfolgreich gebaut

## Aktueller Scope

Der aktuelle Slice umfasst:

- lokal geladenes Bild → Ausschnitt/Zoom mit Seitenverhältnis-Schutz → Rasterkonfiguration (Grid, Sections, K, Pixel-Art) → Mosaik → Materialliste → lokal speichern → erneut öffnen
- lokale, Demo-gestützte Palette ohne echte Katalog-/Lieferdaten
- keine Cloud-Synchronisierung, kein echter Inventarkatalog, keine kompletten Exporte, kein vollständiger PWA-/Offline-Abschluss

## Nächster sinnvoller Schritt

M4 beginnen: PDF/PNG/CSV-Export, Offline-End-to-End und vollständige Geräte-/Accessibility-Abnahme. Das responsive Layout und die Zellsteuerung sind implementiert, ersetzen aber keine Offline-, Screenreader- oder echten Geräteprüfungen.

## Pflege

Aktueller Stand, erbrachte Prüfungen und verbleibende Scope-Grenzen werden hier dokumentiert; keine geplatzten oder ungetesteten Features als fertig gemeldet.
