# Entscheidungslog — v0.2

Stand: 2026-10-13. **Bestätigt** = ausdrücklich aus dem aktuellen Auftrag. **Arbeitsentscheidung** = hier konkretisierter, revidierbarer v0.2-Default, keine nachträglich behauptete Nutzerfreigabe. Änderungen mit Datum und ersetzter Entscheidung dokumentieren.

| ID | Status | Entscheidung und Grund |
|---|---|---|
| D01 | Bestätigt | React + TypeScript + Vite; PWA-first, später Capacitor möglich. Kein Next.js aus älteren Gesprächsvorschlägen übernehmen. |
| D02 | Bestätigt | pnpm Workspaces; framework-unabhängiger mosaic-core schützt Wiederverwendung und Testbarkeit. |
| D03 | Bestätigt | Lokale Browser-Verarbeitung; schwere Bildarbeit über Web Worker/Canvas, adapterbasierte Architektur. |
| D04 | Bestätigt | Custom Raster/Baseplates und Paletten gehören zum Produkt; Inventar und Multi-Brick folgen später. |
| D05 | Bestätigt | Vitest, fast-check, Playwright als Testbasis. Aktueller Auftrag liefert Dokumentation/Skills, keinen umfangreichen Produktivcode. |
| D06 | Arbeitsentscheidung | MVP nutzt einen 1×1-Teiletyp pro Projekt, keine leeren oder überlappenden Zellen. So sind Plan und Materialsumme eindeutig. |
| D07 | Arbeitsentscheidung | Physische Baseplates und logische Bauabschnitte getrennt; rechteckige regelmäßige Anordnung. Randplatten bleiben physisch vollständig, Randabschnitte werden abgeschnitten. |
| D08 | Arbeitsentscheidung | Balanced: lineares flächengewichtetes Sampling, D65-Lab/CIE76; Pixel-Art: Mittelpunkt-Sampling. Dithering und CIEDE2000 später. Einfache, testbare Baseline statt vieler Modi. |
| D09 | Arbeitsentscheidung | K-Auswahl per Häufigkeit mit reservierten Sperrfarben; Gleichstände nach Palette-Snapshot. Keine Optimalitätsgarantie. |
| D10 | Arbeitsentscheidung | Stabile interne Farb-IDs, externe IDs mit Anbieter-Namespace; Verfügbarkeit unbekannt, solange nicht belegt. Bedarf getrennt von Bestand. |
| D11 | Arbeitsentscheidung | IndexedDB und portables JSON mit kanonischen Arbeitsbildbytes; schemaVersion 1 unabhängig von Dokumentversion v0.2. Kein automatisches Neuberechnen alter Projekte. |
| D12 | Arbeitsentscheidung | Erster Slice ist kleiner als MVP; PDF/PNG/CSV, manuelle Korrektur und vollständige Offline-Abnahme folgen in weiteren kleinen Schritten. |
| D13 | Arbeitsentscheidung | Zunächst zwei Workspace-Pakete; Katalog und Export nur als Module. Extraktion bei echtem Bedarf. |
| D14 | Arbeitsentscheidung | Raster ≤256×256, Palette ≤256, Import ≤20 MiB/24 MP, Arbeitsbild ≤2.048 Kantenpixel, Projektdatei ≤64 MiB. Nach Messungen revidierbar. |
| D15 | Arbeitsentscheidung | Neue bearbeitbare Projektwurzel `Mosaic/` im lokalen Spiegel. Übergeordnete synchronisierte AGENTS.md bleibt unangetastet. |
| D16 | Arbeitsentscheidung | M1 nutzt eine klar als Demo gekennzeichnete lokale Palette, einen Worker-basierenden Core-Adapter und IndexedDB als lokale Projektpersistenz; keine echte Katalogquelle oder Cloud-Integration. |

## Kontext und offene Detailentscheidungen

Quelle: aktueller Nutzerauftrag und gelesener Gesprächsverlauf „Webapp Skills Aufsetzen“ (ID `6ace9b63-8a2c-83ed-abce-8459fff7eb33`). Ältere Alternativen und Assistentenvorschläge sind keine automatische Freigabe.

Vor Veröffentlichung benötigt die mitgelieferte echte Steinpalette nachvollziehbare Datenquelle/Nutzungsbedingungen und einen benannten Teiletyp. Bis dahin dient eine als Demo markierte Palette ohne Verfügbarkeitsversprechen. PDF-Bibliothek, konkrete Toolversionen und mobiles Referenzgerät werden bei Implementierung anhand kleiner praktischer Tests gewählt. Diese Details blockieren die Dokumentationsbasis nicht.
