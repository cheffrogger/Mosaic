# Architektur — v0.2

Stand: 2026-10-13 · Zielstruktur, noch kein ausführbares Scaffold.

## Kleiner Workspace

```text
apps/mosaic-web/          React + Vite, UI, Application Services, Browser-Adapter
packages/mosaic-core/     TypeScript-Domäne, Sampling, Farben, Zuweisung, Planmodell
docs/                    Fachwissen und Arbeitsstand
.claude/skills/           gezielt ladbare Leitfäden
```

Beim nächsten Scaffold `pnpm-workspace.yaml` mit `apps/*` und `packages/*` anlegen, kompatible Toolversionen prüfen und `packageManager` sowie Lockfile festhalten. Workspace-Abhängigkeiten über `workspace:*` ausdrücken. pnpm verlangt für einen Workspace die entsprechende Root-Konfiguration; siehe [pnpm Workspaces](https://pnpm.io/workspaces).

`brick-data` und `export-engine` bleiben zunächst Module im Web-Paket. Erst bei tatsächlicher unabhängiger Wiederverwendung zu Packages extrahieren. Kein Backend, SSR, Microservice, Event-Bus oder DI-Container.

## Abhängigkeitsrichtung

UI → Application Services → Core. Adapter implementieren Ports der Anwendung; der Composition Root der Web-App verbindet sie. Der Core importiert weder App noch Adapter. Ports dürfen Core-Datentypen verwenden; Storage und Plattformorchestrierung gehören nicht in den Core.

| Port | MVP-Adapter | Vertrag |
|---|---|---|
| ImageDecoder | Browser Decode/Canvas | Datei → orientierte sRGB-RGBA8-Arbeitsdaten oder validierter Fehler |
| MosaicExecutor | Web Worker | Kanonisches Bild + Konfiguration + Sperren → Core-Ergebnis, Fortschritt, Abbruch |
| ProjectRepository | IndexedDB | Versionierten Projektstand atomar laden/speichern/löschen |
| PaletteCatalog | Lokaler Snapshot | Palette mit Provenienz; keine API-Anfrage zum Generieren |
| ExportService | Lokale PDF/PNG/CSV/JSON-Adapter | Ein validierter Projektstand → downloadbare Datei |

Ports als kleine TypeScript-Schnittstellen, konkrete Funktionen direkt übergeben. Domainmodell und Algorithmus laufen auch in Vitest ohne Browser. Canvas rendert und decodiert im Adapter; Sampling/Farbzuweisung auf typisierten Arrays bleibt reine Core-Logik.

## Worker und Rendering

Jobs tragen `jobId`, `projectRevision` und serialisierbare Parameter. Nur das neueste passende Ergebnis darf übernommen werden. Abbruch invalidiert die Job-ID; falls ein synchroner Worker nicht rechtzeitig auf Nachrichten reagieren kann, Worker beenden und bei Bedarf neu starten. Der kanonische Bildpuffer bleibt im Projektbesitz; nur eine Arbeitskopie transferieren, um keine persistierbaren Daten zu detachen.

OffscreenCanvas verwenden, wenn der konkret benötigte Kontext verfügbar ist; andernfalls Canvas-Decoding im Hauptthread und die numerische Verarbeitung im Worker. Decoding begrenzen, UI zwischen Arbeitsschritten freigeben. OffscreenCanvas entkoppelt Canvas vom DOM und kann in Workern verwendet werden; einzelne Funktionen brauchen weiterhin Capability-Prüfungen ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)). Keine OffscreenCanvas-Pflicht im Core.

Mosaik als Canvas mit Viewport/Zoom rendern; React hält Steuerung und Auswahl. Nicht pro Rasterzelle ein DOM-Element anlegen. Für Bedienbarkeit eine zugängliche Zellnavigation ergänzen; siehe UX.

## Persistenz und Offline

IndexedDB speichert Projekt inklusive Arbeitsbild atomar. Autosave nach übernommenen Änderungen, serialisierte Schreibaufträge und sichtbarer Status; ältere Schreibaufträge dürfen neuere Revisionen nicht überschreiben. Bei Quota-/Speicherfehlern bleibt der Stand im Arbeitsspeicher und Projektdatei-Export wird angeboten. Lokalspeicher ist kein garantiertes Backup.

Der Service Worker cached App-Shell, gebündelte Schriften/Paletten und auch lazy geladene Exportmodule vor dem Status „offline bereit“. Nutzerbilder werden nicht über Fetch-Cache gespeichert. Neue App-Version erst nach sicherem Speichern und ausdrücklicher Reload-Aktion aktivieren; keine Aktualisierung mitten in der Bearbeitung. Installation ist optional, der normale Browser bleibt voll nutzbar.

## Erweiterungen

Capacitor kann später Storage-/Datei-Adapter ergänzen, ohne den Core zu ändern. Inventaroptimierung und Multi-Brick-Platzierung bekommen erst dann eigene Fachverträge, wenn ihre Anforderungen bestätigt sind. Externe Katalog-APIs werden über Adapter und lokale Snapshots integriert, nicht in Generierungsfunktionen.
