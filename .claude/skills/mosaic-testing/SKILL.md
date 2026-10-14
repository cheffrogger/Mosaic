---
name: mosaic-testing
description: Use when testing Mosaic algorithms, persistence, exports, worker races, visual regressions or release acceptance.
---

# mosaic-testing

Projektleitfaden v0.2. Lies gezielt: [06-TESTING.md](../../../docs/06-TESTING.md) · [01-PRODUCT-SPEC.md](../../../docs/01-PRODUCT-SPEC.md).

Prüfe die fachliche Zusage, nicht nur die aktuelle Implementierung.

- Vitest für Core/Verträge, fast-check für Invarianten, Playwright für vollständige Nutzerabläufe einsetzen.
- Zellenzahl, erlaubte IDs, K, Sperren, lückenlose Abschnitte und identische Materialsumme prüfen; zufällige Seeds und minimale Fehlerfälle festhalten.
- Worker-Abbruch/veraltete Ergebnisse, Speicherfehler und Projektdatei-Roundtrip separat abdecken.
- Core-Goldens aus kanonischen Bytes von Browser-Screenshots trennen. Abweichungen ansehen und erklären, bevor Baselines ersetzt werden.
- Offline aus gebauter App mit vorbereitetem Cache testen, nicht nur aus dem Entwicklungsserver.
- Fehlende Infrastruktur und nicht ausgeführte Tests benennen; Dokuprüfung ist kein grüner Anwendungstest.

Prüffall: Ein Screenshot ändert sich nach Algorithmusarbeit → Zell-/Farbunterschiede und erwarteten Nutzen prüfen, erst dann Golden aktualisieren. Ergebnis: ausgeführte Prüfungen, konkrete Resultate und verbleibende Lücken.
