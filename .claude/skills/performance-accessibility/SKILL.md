---
name: performance-accessibility
description: Use when reviewing Mosaic rendering cost, worker responsiveness, memory limits, keyboard controls or screen-reader access.
---

# performance-accessibility

Projektleitfaden v0.2. Lies gezielt: [03-ARCHITECTURE.md](../../../docs/03-ARCHITECTURE.md) · [05-UX-DESIGN.md](../../../docs/05-UX-DESIGN.md) · [06-TESTING.md](../../../docs/06-TESTING.md).

Behandle Reaktionsfähigkeit und zugängliche Zellbearbeitung gemeinsam.

- Raster per Canvas rendern, nicht 65.536 interaktive DOM-Zellen. Zugängliche fokussierte Zellsteuerung daneben anbieten: Zeile, Spalte, Farbname/-nummer, Sperre und Aktion.
- Pfeiltasten, direkte Koordinatenwahl, sichtbarer Fokus und Zoom-Buttons ergänzen Touch-Gesten. Keine Tab-Kette über jede Zelle.
- Farbe nicht als einzige Information; Plan nutzt Nummern, UI Textlabels. 44×44 CSS-Pixel als Ziel für Touch-Aktionen, reduzierte Bewegung respektieren.
- Speicher vor zusätzlichen Bildkopien begrenzen; kanonischen Puffer erhalten. Worker-Jobs abbrechbar machen und Ergebnisse revisionsgebunden übernehmen.
- Zielwerte aus Teststrategie auf benanntem Gerät messen. Ein schneller Desktoplauf belegt keine mobile Leistung.

Prüffall: 256×256 Raster → Canvas plus aktive Zellnavigation; Abbruch bleibt bedienbar. Ergebnis: gemessener Engpass, kleinste wirksame Änderung und manueller Tastatur-/Screenreader-Nachweis.
