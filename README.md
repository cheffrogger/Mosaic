# VStudio+ / Mosaic

Dokumentationsbasis **v0.2 · 2026-10-13** für eine lokal arbeitende Web-/PWA-App: Bild → Steinmosaik → nachvollziehbarer Bauplan.

## Einstieg

1. [Projektbrief](docs/00-PROJECT-BRIEF.md): Ziel und Grenzen.
2. [Status](docs/STATUS.md): tatsächlicher Stand und nächster Arbeitsauftrag.
3. [Entscheidungen](docs/DECISIONS.md): bestätigte Vorgaben und vorläufige Details.
4. Für die Umsetzung nur die passenden Fachkapitel laden.

| Dokument | Inhalt |
|---|---|
| [Produkt](docs/01-PRODUCT-SPEC.md) | Nutzerablauf, MVP, Abnahme |
| [Domäne](docs/02-DOMAIN-MODEL.md) | Begriffe, Datenverträge, Invarianten |
| [Architektur](docs/03-ARCHITECTURE.md) | Workspace, Abhängigkeiten, Adapter |
| [Engine](docs/04-MOSAIC-ENGINE.md) | Deterministischer Verarbeitungsablauf |
| [UX](docs/05-UX-DESIGN.md) | Bedienung und Fehlerzustände |
| [Tests](docs/06-TESTING.md) | Prüffälle und Qualitätskriterien |
| [Roadmap](docs/07-ROADMAP.md) | Kleine Schritte mit Abnahmekriterien |

[AGENTS.md](AGENTS.md) enthält die gemeinsamen Agent-Regeln; [CLAUDE.md](CLAUDE.md) verweist darauf und auf die acht lokalen Skills unter `.claude/skills/`.

## Stand und Übergabe

Hier liegen Dokumentation und Agent-Skills, keine lauffähige App. Es gibt noch keine installierten Abhängigkeiten, Workspace-Konfiguration, Tests oder Build-Skripte. Die geplante Code-Struktur steht in der Architektur; sie wird erst im nächsten Auftrag angelegt.

Dieser Ordner liegt unter einem lokalen ChatGPT-Projektspiegel. Dessen übergeordnete `AGENTS.md` und `sources/` bleiben unverändert. Für Claude Code diesen **Mosaic-Ordner als Projektwurzel öffnen** oder seinen gesamten Inhalt inklusive `.claude/` in das tatsächliche Entwicklungsrepository übernehmen und dort bestehende Regeln integrieren. Die Dateien wurden lokal angelegt; ein Upload in das ChatGPT-Projekt oder ein Git-Push wurde nicht durchgeführt.
