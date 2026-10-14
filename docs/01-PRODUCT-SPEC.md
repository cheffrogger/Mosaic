# Produktspezifikation — v0.2

Stand: 2026-10-13 · Verbindliche Vorgaben und Arbeitsentscheidungen gemäß [DECISIONS](DECISIONS.md).

## Ablauf und Abnahme

| ID | Funktion | Abnahmekriterium |
|---|---|---|
| P01 | Lokaler Bildimport | Gültiges JPEG/PNG wird orientierungsrichtig angezeigt; ungültige Datei erklärt den Fehler und erhält das bisherige Projekt. Kein Upload. |
| P02 | Ausschnitt | Zoom/Position wählen einen vollständig im Bild liegenden Ausschnitt mit Raster-Seitenverhältnis; Vorschau und Engine verwenden dieselben Parameter. |
| P03 | Custom Raster | Ganzzahlige Breite/Höhe 1–256, maximal 65.536 Zellen; Null, Dezimalwerte und Überschreitung werden vor Berechnung abgelehnt. |
| P04 | Custom Baseplates | Positive ganzzahlige Plattengröße, unabhängige Rastergröße; Randüberhang wird mit belegten/ungenutzten Noppen angezeigt. Keine heimliche Rastervergrößerung. |
| P05 | Bauabschnitte | Separat frei gewählte Abschnittsgröße; vollständige, überschneidungsfreie Abdeckung mit verkürzten Randabschnitten. |
| P06 | Custom Palettes | Name, stabile ID und sRGB-Hexwert pro Farbe; Farben aktivierbar. Leere aktive Palette verhindert Generierung, doppelte IDs werden abgelehnt. |
| P07 | Farbanzahl | Ganzzahliges K zwischen 1 und Anzahl aktiver Farben, maximal 256; tatsächliche Nutzung höchstens K, auch nach Bearbeitung. Konflikte werden vor Übernahme erklärt. |
| P08 | Generierung | Balanced als Standard, Pixel-Art als zweiter MVP-Modus; Fortschritt, Abbruch und Schutz gegen veraltete Worker-Ergebnisse. |
| P09 | Bearbeiten | Zellen umfärben/sperren; globale Ersetzung lässt gesperrte Zellen standardmäßig unverändert. Ein expliziter gesammelter Bearbeitungsschritt ist rückgängig machbar. |
| P10 | Plan | Farbnummern, Koordinaten, Gesamtübersicht und Abschnittspläne stimmen exakt mit dem aktuellen gespeicherten Mosaik überein. |
| P11 | Speichern | Lokaler Speicherstatus ist sichtbar. Nach Neuladen bleiben Palette, Einstellungen, Zellen und Sperren erhalten. Fehler werden nicht als gespeichert angezeigt. |
| P12 | Export | Projektdatei, PDF, PNG und CSV sind lokal erzeugbar; Export verwendet genau einen konsistenten Projektstand. |
| P13 | PWA | Nach erfolgreicher Offline-Vorbereitung funktionieren Import, Bearbeitung, Speicherung und Exporte ohne Netz. Erster Offline-Besuch wird nicht als unterstützt versprochen. |

## Arbeitsgrenzen für den MVP

Rastergrenzen sind vorläufige Schutzwerte, keine gemessenen Leistungsversprechen. Palette: höchstens 256 Einträge. Import zunächst höchstens 20 MiB komprimiert und 24 Megapixel decodiert; beide Grenzen prüfen. Eine portable Projektdatei ist auf 64 MiB begrenzt. Größere Dateien verständlich ablehnen, bevor zusätzliche große Kopien entstehen. Der Decodieradapter reduziert das Arbeitsbild auf höchstens 2.048 Pixel an der längsten Kante; Originaldatei nicht dauerhaft speichern. Der gespeicherte Arbeitsstand muss eine erneute Berechnung ohne ursprüngliche Datei ermöglichen.

## Manuelle Änderungen und Neuberechnung

Bei gleicher Geometrie bleiben gesperrte Zellen erhalten. Nicht gesperrte manuelle Änderungen können durch Neuberechnung ersetzt werden; die UI weist vor dem Start darauf hin und bietet Rückgängig. Bildwechsel oder Änderung der Rasterdimensionen entfernt Zelländerungen und Sperren erst nach Bestätigung. Reine Änderungen der Baseplates oder Bauabschnitte ändern keine Zellfarben.

Eine gesperrte Farbe darf nicht still deaktiviert oder entfernt werden. Übersteigt die Menge gesperrter Farben K, muss der Nutzer K erhöhen oder Sperren lösen. Einzelbearbeitung und Farbersetzung dürfen keine inaktive Farbe oder eine K-Verletzung einführen. Eine explizite Bearbeitung einer ausgewählten gesperrten Zelle ist zulässig; die Sperre bleibt gesetzt.

## Ausgabe

- PDF: A4, Gesamtübersicht, Legende mit Farbnummer/Name/Hexwert und Materialliste, danach nummerierte Abschnitte. Große Abschnitte über mehrere eindeutig beschriftete Seiten verteilen; Zellkennungen mindestens 8 pt, keine still unleserliche Skalierung.
- PNG: Gesamtmosaik ohne Bedienoberfläche, fest dokumentierte Pixel-pro-Zelle-Einstellung. Beschriftete Bauanleitung ist der PDF-Export.
- CSV: UTF-8, Kopfzeile `colorId,legendNumber,name,hex,partTypeId,quantity`; notwendige Felder quotieren und Tabellenformel-Ausführung über importierte Namen verhindern.
- Projektdatei: versioniertes JSON inklusive kanonischem Arbeitsbild, Palette-Snapshot, Parametern, finalen Zellen und Sperren. Kein Verweis auf flüchtige Blob-URLs.

## Später

Inventar nach Teiletyp/Farbe, Multi-Brick-Optimierung, zusätzliche Render-Modi, Dithering, Farbflächen-/Bereichseditor, Katalog-APIs und Capacitor sind Erweiterungen nach belastbarem MVP. Accounts und Bezahlen brauchen eine separate Produktentscheidung.
