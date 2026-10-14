# Status — v0.2

Stand: 2026-10-14 · Phase M1: erster kompletter lokaler Ablauf umgesetzt und verifiziert.

## Implementiert

- pnpm-Workspace mit [package.json](../package.json), [pnpm-workspace.yaml](../pnpm-workspace.yaml), [apps/mosaic-web](../apps/mosaic-web) und [packages/mosaic-core](../packages/mosaic-core)
- framework-unabhängiger Core in [packages/mosaic-core/src/index.ts](../packages/mosaic-core/src/index.ts) mit deterministischer 32×32-Mosaik-Erzeugung und Materialliste
- lokaler Demo-Palette mit klarer Kennzeichnung im UI und Materialübersicht
- Web-Worker-Flow in [apps/mosaic-web/src/workers/mosaic.worker.ts](../apps/mosaic-web/src/workers/mosaic.worker.ts) sowie Browser-Adapter für Bildimport und lokale Speicherung
- IndexedDB-Project-Store mit Laden und erneutem Öffnen in [apps/mosaic-web/src/App.tsx](../apps/mosaic-web/src/App.tsx)
- M1-UI- und Smoke-Test-Fluss inklusive Fixture im Browser-Verzeichnis

## Verifiziert

- `pnpm --dir packages/mosaic-core test` → 1/1 Testdatei erfolgreich; 1 Test bestanden
- `pnpm typecheck` → erfolgreich, keine TypeScript-Fehler in Core oder Web-App
- `pnpm build` → Produktionsbuild erfolgreich gebaut; Vite erzeugte die dist-Ausgabe
- `pnpm --dir apps/mosaic-web exec playwright test --reporter=line` → 1 Browser-Smoke-Test bestanden

## Grenzen und Scope

M1 bleibt bewusst auf den ersten vollständigen Ablauf begrenzt:

- lokal geladenes Bild → Ausschnitt/32×32 → Demo-Palette → Mosaik → 1.024 Zellen → Materialliste → lokal speichern → erneut öffnen
- keine Custom-Editor-Features, kein echter Katalog, keine Cloud, keine kompletten Exporte, kein Inventar
- PWA-/Offline-Grenzen wurden bereits in Architektur und Aufgabenstellung berücksichtigt; dieser Slice ist kein vollständiger Offline-/PWA-Abschluss

## Nächster sinnvoller Schritt

M2 mit eigener Raster-/Baseplate-/Abschnittslogik, benutzerdefinierten Paletten und Pixel-Art-/Korrekturvarianten fortsetzen. Für M1 ist der vollständige lokale Ablauf und die fachliche Verifikation die harte Abnahme.

## Pflege

Aktueller Stand, erbrachte Prüfungen und verbleibende Scope-Grenzen werden hier dokumentiert; keine geplatzten oder ungetesteten Features als fertig gemeldet.
