# Teststrategie — v0.2

Stand: 2026-10-13 · Dies ist der Prüfplan; Anwendungstests existieren noch nicht.

## Werkzeugaufteilung

Vitest prüft Core und Adapterverträge, fast-check generiert gültige und ungültige Fachkonfigurationen, Playwright prüft vollständige Nutzerabläufe im Browser. Keine pauschale Coverage-Zahl ersetzt fachliche Abnahme.

## Core-Invarianten

- Für jede gültige Konfiguration genau Breite × Höhe Zellen, nur aktive Palette-IDs, höchstens K verwendete Farben.
- Gleicher Input und gleiche Engine-Version → identische Zuordnung; Gleichstände folgen Palettenreihenfolge.
- Jede Zelle in genau einem Abschnitt; Summe der Abschnittsbedarfe gleich globalem Bedarf gleich Zellenzahl.
- Gesperrte Zellen bleiben bei kompatibler Neuberechnung erhalten; Konflikte sind explizite Fehler.
- Ändern von Baseplate- oder Abschnittsmaßen ändert keine Zellfarbe.
- Speichern/Lesen erhält kanonische Bildbytes, Zellen, Palette, Sperren und Parameter. Abgeleitete Daten bleiben identisch.

fast-check: kleine Raster und Paletten, nichtquadratische Formate, 1×1, Primzahlen, Randabschnitte, identische Hexwerte und unterschiedliche K erzeugen. Seeds und geschrumpfte Gegenbeispiele im Fehlerbericht sichern. Mindestens 100 Fälle pro Eigenschaft als Startwert; gezielte Grenztests für 256×256 ergänzen.

## Gezielte Fälle

| Bereich | Erwarteter Fall |
|---|---|
| Geometrie | 50×50 / 10×10 = 25 Abschnitte; 50×50 / 16×16 = 16, letzter 2×2 |
| Farben | sRGB-Transfer, D65-Lab-Referenzen, transparente Pixel, gleich weit entfernte Farben |
| Farbgrenze | K=1, K=Palette, mehr gesperrte Farben als K, manuelle Änderung über K |
| Eingabe | Leere Palette, ungültiger Crop, NaN, defekte Bilddaten, doppelte IDs, zu große Dateien |
| Persistenz | Unbekannte Schemaversion, unvollständige Daten, Quota-Fehler, konkurrierende Revisionen |
| Worker | Abbruch, verspätetes Ergebnis, Fehler, Wiederholung, Hauptbildpuffer bleibt lesbar |
| Export | Mengen/Legende stimmen, lange Namen, CSV-Formelschutz, mehrere PDF-Seiten, lesbare Randabschnitte |

## Browser-Abnahme

Erster Slice: lokale Fixture laden → 32×32 → Palette → generieren → Materialsumme 1.024 → speichern → reload → gleiche Zellen. Anschließend Custom Raster, Bearbeitung/Sperren, Undo und vollständigen Import-/Export-Roundtrip prüfen.

PWA in gebauter Vorschau testen: online laden, Offline-Bereitschaft abwarten, Netzwerk deaktivieren, neu laden, neues Bild importieren, generieren, speichern und alle Exporte aufrufen. Zusätzlich fehlende Erstinstallation, Update mit ungespeicherten Änderungen und Canvas-Fallback prüfen. Chromium, Firefox und WebKit für Kernablauf; echte mobile Geräte für Touch/Installation ergänzen. Browser-/Geräteversionen bei Durchführung festhalten, Emulation nicht als vollständigen Gerätetest ausgeben.

## Visuelle und manuelle Qualität

Kleine selbst erzeugte Fixtures: Vollfarbe, Alpha-Raster, Verlauf, scharfe Kanten. Für Fotoqualität später rechtmäßig nutzbare Porträt-, Landschafts- und kontrastarme Motive mit Herkunft hinzufügen. Core-Goldens aus kanonischen Bytes getrennt von Browser-Screenshots halten. Änderungen an Goldens erst nach Prüfung der konkreten Bildunterschiede akzeptieren.

Tastatur und Screenreader an Zellwahl, Farbauswahl und Export prüfen. PDF visuell prüfen, mindestens einen kleinen Plan praktisch probebauen. Farbähnlichkeit am Bildschirm beweist keine Übereinstimmung mit echten Steinen.

## Leistungsziele und Abschluss

Vorläufige Messziele: 128×128 / 32 Farben aus bereits decodiertem Bild in höchstens 2 Sekunden auf einem bei Messung benannten Referenzgerät; Abbruch-Rückmeldung innerhalb 200 ms. Messaufbau und Speicherverbrauch dokumentieren. Maximalraster separat auf Speicherfehler prüfen; diese Ziele sind noch nicht verifiziert.

Nach Scaffold minimale Checks: Typecheck, Lint, Core-/Property-Tests, ein Playwright-Smoke-Test, Produktionsbuild. Aufwendige Browsermatrix vor Meilensteinfreigabe. Nur tatsächlich ausgeführte Prüfungen als bestanden melden; bei reinen Dokuänderungen Links, Widersprüche und Vollständigkeit prüfen.
