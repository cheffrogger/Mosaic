---
name: mosaic-engine
description: Use when changing Mosaic sampling, color assignment, sections, numbering or locked-cell regeneration.
---

# mosaic-engine

Projektleitfaden v0.2. Lies gezielt: [02-DOMAIN-MODEL.md](../../../docs/02-DOMAIN-MODEL.md) · [04-MOSAIC-ENGINE.md](../../../docs/04-MOSAIC-ENGINE.md).

Halte den Weg von kanonischen Bildbytes zu finalen Zellen deterministisch.

- Core akzeptiert Daten, keine Canvas-/DOM-Objekte. Gleiche Bytes, Einstellungen und Engine-Version ergeben gleiche IDs.
- Nullbasierte interne Koordinaten, einsbasierte Planbeschriftung; Zeilenreihenfolge explizit verwenden.
- Randabschnitte beschneiden, physische Baseplates vollständig zählen; ungenutzte Noppen nie als Zellen zählen.
- Gesperrte Farben vor K-Reduktion reservieren. Mehr Sperrfarben als K ist ein Konflikt; nicht heimlich umfärben oder K überschreiten.
- Gleiche Geometrie erhält Sperren. Bild-/Rasterwechsel braucht den in der Produktspezifikation beschriebenen bestätigten Reset.
- Bedarf und Legende ausschließlich aus finalen Zellen ableiten. Keine unabhängigen Zähler pflegen.

Prüffall: 50×50 / 16×16 → 16 Abschnitte, letzter 2×2, letzte globale Zellnummer 2.500 und lokale Nummer 4. Ergebnis: definierter Algorithmus, Grenzfälle und passende Invariantentests.
