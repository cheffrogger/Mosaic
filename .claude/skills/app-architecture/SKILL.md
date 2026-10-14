---
name: app-architecture
description: Use when structuring the Mosaic workspace, React integration, core dependencies, worker jobs, storage or export adapters.
---

# app-architecture

Projektleitfaden v0.2. Lies gezielt: [03-ARCHITECTURE.md](../../../docs/03-ARCHITECTURE.md) · [02-DOMAIN-MODEL.md](../../../docs/02-DOMAIN-MODEL.md).

Schütze die Fachlogik mit wenigen klaren Abhängigkeitsgrenzen.

- Starte mit apps/mosaic-web und packages/mosaic-core, React/TypeScript strict/Vite und pnpm Workspaces. Weitere Packages nur bei tatsächlichem Bedarf.
- React orchestriert UI; Sampling, Farbzuweisung und Planableitung bleiben außerhalb von Hooks im Core. Keine Browser-/Storage-/Netzwerk-Imports im Core.
- Ports der Anwendung verbinden Bilddecoder, Worker, IndexedDB, Palette und Exporte über kleine Verträge; kein DI-Framework vorab.
- Numerische Bildarbeit im Worker; jobId und projectRevision prüfen, veraltete Ergebnisse verwerfen. Keine kanonischen Bildpuffer durch Transfer unbrauchbar machen.
- Projektformat versionieren und an Ein-/Ausgabegrenzen validieren; finale Zellen nicht beim Öffnen still neu erzeugen.

Prüffall: „Schnell alles im Hook rechnen“ → reine Core-Funktion plus Worker-Adapter, Hook nur zur Steuerung. Ergebnis: kleiner Modulplan mit erlaubter Abhängigkeitsrichtung und einem prüfbaren vollständigen Ablauf.
