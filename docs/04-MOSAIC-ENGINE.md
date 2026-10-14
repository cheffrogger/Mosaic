# Mosaic Engine — v0.2

Stand: 2026-10-13 · Deterministische MVP-Referenz; zusätzliche Methoden erst nach Vergleichstests.

## Vertrag

Eingabe: kanonisches orientiertes sRGB-RGBA8-Arbeitsbild, gültiger Ausschnitt, Raster, geordnete aktive Palette, K, Modus, Hintergrundfarbe und bestehende Sperren bei identischer Geometrie. Ausgabe: finale Zellfarben/Sperren und daraus abgeleitete Plan-/Bedarfsdaten. Keine Datei-, Canvas-, Netzwerk- oder React-Objekte im Core.

Gleiche kanonische Bytes, Konfiguration und Engine-Version liefern dieselben Farb-IDs. Browser-Decoding fremder Originaldateien ist nicht als plattformübergreifend byteidentisch garantiert; deshalb kanonische Arbeitsdaten speichern. Keine Zufallsverfahren im MVP.

## Verarbeitung

1. **Validieren:** Dimensionen, Pufferlänge, Ausschnitt, Palette, K und Sperren prüfen. Fehlercodes: `INVALID_IMAGE`, `INVALID_GRID`, `INVALID_CROP`, `EMPTY_PALETTE`, `INVALID_COLOR_LIMIT`, `LOCK_CONFLICT`, `LIMIT_EXCEEDED`. Ungültiger Input erzeugt kein Teilergebnis.
2. **Farbnormalisierung:** sRGB-Komponenten auf 0…1 normieren und in lineares RGB dekodieren. Unpremultipliziertes RGBA voraussetzen; premultiplizierte Adapterdaten vorher korrekt umrechnen. Alpha-Compositing gegen den deckenden Hintergrund im linearen Raum; Alpha 0 ergibt Hintergrund, nicht Schwarz und keine leere Zelle.
3. **Sampling:** Im Modus `balanced` jeder Rasterzelle ihr exaktes Rechteck im Ausschnitt zuordnen. Flächengewichtetes Mittel der überlappenden Quellpixel im linearen RGB bilden. In `pixel-art` den Quellpixel am Mittelpunkt dieses Rechtecks wählen (`floor`, auf Bildgrenze begrenzt). Kein browserabhängiges Canvas-Resizing als Referenz-Sampler.
4. **Wahrnehmungsraum:** Zellfarben und Palettenfarben in CIELAB mit festem D65-Referenzweiß transformieren. Default-Abstand CIE76 (euklidisch in Lab). Konvertierungen mit Referenzvektoren testen. D50- und D65-Lab nicht vermischen; CSS-Lab-Referenzen gegebenenfalls chromatisch adaptieren. Normative Farbraumhintergründe: [W3C CSS Color 4](https://www.w3.org/TR/css-color-4/).
5. **Palette auf höchstens K reduzieren:** Alle von gesperrten Zellen genutzten Farben zuerst reservieren. Sind es mehr als K, `LOCK_CONFLICT`. Übrige ungesperrte Zellen zunächst jeweils der nächsten aktiven Farbe zuordnen; Häufigkeit je Farbe zählen. Reservierte Menge mit den häufigsten noch nicht reservierten Farben bis K auffüllen. Gleichstände nach Reihenfolge im gespeicherten Palette-Snapshot. Anschließend ungesperrte Zellen neu auf diese gewählte Teilpalette abbilden. Diese einfache Heuristik verspricht kein globales Optimum.
6. **Sperren übernehmen:** Gesperrte Farbe exakt beibehalten; keine stillen Ersatzfarben. Bei Distanzgleichstand gewinnt überall die frühere Palettenposition. Numerische Gleichheit mit festem Abstandstoleranzwert `1e-9` behandeln; keine implizite Objektiteration als Sortierung.
7. **Ableiten:** Abschnitte nach Domänenmodell, Farbnummern aus verwendeten Farben in Palettenreihenfolge und Materialbedarf aus finalen Zellen erzeugen. Speicherung/Export verwenden genau diese finalen Zellen.

Wenn alle Zellen gesperrt sind, wird keine neue Farbzuweisung benötigt; Validierung und Planableitung bleiben gleich. Physische Plattenmaße beeinflussen die Farbberechnung nicht.

## Kleine Referenzfälle

- Einfarbiges deckendes Bild und exakt passende einzige Palettenfarbe → jede Zelle diese Farbe.
- Transparentes Bild, weißer Hintergrund, Palette Schwarz/Weiß → nur Weiß.
- 50×50 und 10×10-Abschnitte → 2.500 Zellen, 25 Abschnitte, Materialsumme 2.500.
- 50×50 und 16×16-Abschnitte → 16 Abschnitte, letzter 2×2, keine Phantomzellen.
- K=1 mit einer gesperrten roten Zelle → alle Zellen Rot; mit zusätzlicher gesperrter blauer Zelle → Konflikt statt Verletzung von K.
- Zwei Farben mit identischem Hexwert → bei ungesperrten Zellen gewinnt die frühere Palettenposition innerhalb der zur Zuweisung verwendeten Teilpalette; IDs werden nicht zusammengeführt. Eine durch Sperren reservierte spätere Farbe kann bei K-Reduktion die frühere aus dieser Teilpalette verdrängen.

## Qualität und Kosten

V0.2 optimiert Nachvollziehbarkeit vor maximaler Bildästhetik. Farbabgleich kostet im einfachen Verfahren ungefähr Zellen × aktive Farben; Lab-Werte vorab berechnen und wiederverwenden. Sampling kann zeilenweise erfolgen. Optimierungen müssen gegen diese Referenzfunktion getestet werden.

Dithering, CIEDE2000, Kontrastschutz, Hauttöne und Inselentfernung sind spätere Experimente, keine unfertigen MVP-Schalter. Ein Algorithmuswechsel benötigt aktualisierte Engine-Version, Vergleichsbilder und bewusste Entscheidung über veränderte Ergebnisse.
