# Mosaic — gemeinsame Agent-Regeln

## Einstieg und Gedächtnis

- Lies zuerst `docs/00-PROJECT-BRIEF.md` und `docs/STATUS.md`; anschließend nur die zur Aufgabe passenden Dokumente und Entscheidungen.
- Maßgeblich sind aktuelle ausdrückliche Nutzeraufträge. Innerhalb der Dokumentation gelten bestätigte Entscheidungen vor Arbeitsentscheidungen; Widersprüche benennen und gezielt bereinigen.
- Halte Fachregeln in `docs/`, nicht ausschließlich im Chat. Aktualisiere nach fachlichen Änderungen die betroffene Spezifikation, bei Entscheidungen `DECISIONS.md`, bei Arbeitsabschluss `STATUS.md`.
- Ein Status nennt implementierte Ergebnisse, tatsächlich ausgeführte Prüfungen, offene Fragen und genau den nächsten sinnvollen Schritt. Geplante Funktionen niemals als fertig ausgeben.
- `sources/` im übergeordneten Projektspiegel ist schreibgeschützt; synchronisierte Dateien weder ändern noch verschieben. Vor Änderungen vorhandene Dateien lesen und integrieren.

## Umsetzung

- MVP und ersten Vertical Slice gemäß Roadmap schützen. Keine Accounts, Cloud, Bezahlung, Inventaroptimierung oder Multi-Brick-Verlegung ohne neuen Auftrag.
- React + TypeScript strict + Vite; pnpm Workspaces. Keine zusätzliche Framework- oder Infrastrukturentscheidung ohne konkreten Bedarf.
- `mosaic-core` enthält reine, framework-unabhängige Fachlogik. Keine React-, DOM-, Canvas-, Worker-, Storage- oder Netzwerk-APIs im Core.
- Bilddecoding, Worker-Ausführung, Speicherung, Kataloge und Export sind Adapter. Schnittstellen klein halten; kein allgemeines Plugin-System oder DI-Framework vorab.
- Browser verarbeitet Nutzerdaten lokal. Keine Bild-Uploads, externen Bilddienste, Tracking oder versteckten Remote-Fonts einführen.
- Stabile IDs, versionierte Projektdaten und reproduzierbare Algorithmen beachten. Farbnummern sind keine Anbieter-IDs; Materialbedarf ist kein Inventar.
- Neue Fachlogik anhand der Invarianten aus `docs/06-TESTING.md` prüfen. Bei Fehlerkorrekturen einen reproduzierbaren Regressionstest ergänzen.
- Tests/Build nur mit vorhandenen Skripten ausführen; fehlende Infrastruktur offen benennen. Keine fiktiven grünen Checks.
- Änderungen klein und reviewbar halten. Nicht ungefragt veröffentlichen oder fremde Änderungen überschreiben.

## Fachwissen bei Bedarf

Die acht `.claude/skills/*/SKILL.md` sind auch für andere Agenten lesbare Fachleitfäden. Nur relevante Skills laden; die Dokumentation ist die gemeinsame Quelle der Regeln. Keine parallelen Implementierungen desselben Bereichs starten.
