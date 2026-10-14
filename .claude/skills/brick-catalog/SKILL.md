---
name: brick-catalog
description: Use when editing Mosaic palettes, brick color identifiers, external catalog mappings or availability metadata.
---

# brick-catalog

Projektleitfaden v0.2. Lies gezielt: [02-DOMAIN-MODEL.md](../../../docs/02-DOMAIN-MODEL.md) · [DECISIONS.md](../../../docs/DECISIONS.md).

Trenne digitale Farbidentität, Anbieterzuordnung und tatsächliche Verfügbarkeit.

- Projektinterne IDs stabil halten. Externe IDs nur zusammen mit Anbieter-Namespace verwenden; gleiche Zahlen sind kein Nachweis gleicher Farbe.
- Name und sRGB-Hexwert reichen für eigene Palettefarben, aber nicht für behauptete physische Verfügbarkeit.
- Herkunft, Datenstand und bekannte Nutzungsbedingungen mit externen Snapshots dokumentieren. Keine erfundenen offiziellen Farbcodes oder Katalogdaten.
- Unbekannte Verfügbarkeit bleibt unknown und verhindert die Nutzung einer Custom Farbe nicht; zeige keine Kauf-/Liefergarantie.
- Bedarf wird gezählt, vorhandenes Inventar erst später begrenzt. Inventar wäre je Teiletyp/Farbe zu modellieren.
- Doppelte IDs ablehnen, gleiche Hexwerte zulassen. Lokalen Palette-Snapshot speichern; spätere Katalogänderungen dürfen alte Projekte nicht verändern.

Prüffall: Anbieter A/5 und B/5 bleiben getrennte Referenzen. Ohne geprüfte echte Quelle eine benannte Demo-Palette verwenden. Ergebnis: validierte Palette mit ehrlicher Provenienz und ausdrücklichen Unbekannten.
