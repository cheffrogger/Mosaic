---
name: color-science
description: Use when working on Mosaic sRGB conversion, Lab distance, alpha compositing, sampling or color-quality comparisons.
---

# color-science

Projektleitfaden v0.2. Lies gezielt: [04-MOSAIC-ENGINE.md](../../../docs/04-MOSAIC-ENGINE.md) · [02-DOMAIN-MODEL.md](../../../docs/02-DOMAIN-MODEL.md).

Verhindere plausible, aber fachlich inkonsistente Farbrechnung.

- Verwende kanonisches sRGB-RGBA8; prüfe, ob Adapter unpremultiplizierte Werte liefern.
- Alpha im linearen RGB gegen den gewählten deckenden Hintergrund verrechnen, danach samplen. Volltransparent bedeutet Hintergrund, niemals automatisch Schwarz oder leere Zelle.
- Balanced mittelt flächengewichtet im linearen RGB. Pixel-Art wählt den Mittelpunktpixel.
- Vergleichsraum ist Lab mit D65, Distanz CIE76. D50-Referenzwerte nicht ohne Anpassung einsetzen; Lab nicht als editierbare zweite Farbquelle speichern.
- Gleichstand mit Toleranz 1e-9 nach Reihenfolge des Palette-Snapshots auflösen.
- Qualitätsverbesserungen mit denselben Motiven vergleichen. CIEDE2000, Dithering oder Hautschutz nicht still als neuen Default einführen.

Prüffall: Transparentes PNG auf Weiß mit Schwarz/Weiß-Palette ergibt Weiß. Gleiche Hexwerte behalten verschiedene IDs; innerhalb der gewählten Teilpalette gewinnt die frühere Palettenposition. Ergebnis: Konventionen, Referenzvektoren und beobachtbare Vergleichsergebnisse.
