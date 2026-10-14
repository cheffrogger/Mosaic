# Roadmap — v0.2

Stand: 2026-10-13 · Kleine auslieferbare Schritte, keine monatelange Infrastrukturphase.

| Schritt | Ergebnis | Fertig, wenn |
|---|---|---|
| M0 · Projektbasis | Spezifikationen, Entscheidungen, Agent-Regeln, acht Skills | Inhalte konsistent und lesbar; tatsächlicher Status dokumentiert |
| M1 · Erster Vertical Slice | Minimales pnpm-Scaffold, Core, React-UI, Worker, lokale Speicherung | Bild → Ausschnitt → 32×32 → lokale Palette → Mosaik → 1.024 Teile → speichern/öffnen; Core-Test und Browser-Smoke grün |
| M2 · Eigene Bauparameter | Custom Raster/Baseplates/Abschnitte, Custom Palette, K, Pixel-Art | 50×50 mit 10×10 und 16×16 korrekt; ungültige Einstellungen erklärt |
| M3 · Korrektur und Sicherung | Einzeländerung, Sperren, Farbersetzung, Undo, portable Projektdatei | Bearbeitung bleibt nach Roundtrip erhalten; Neuberechnung respektiert Sperren |
| M4 · Baubares MVP | PDF/PNG/CSV, Offline-Modus, mobile und zugängliche Bedienung | Plan vollständig und lesbar, Offline-End-to-End bestanden, kleiner Probebau erfolgreich |
| M5 · Nach echtem Feedback | Bildqualität und Geschwindigkeit gezielt verbessern | Vergleichbare Motive/Messwerte belegen Nutzen; kein unkontrollierter Scope-Zuwachs |

PWA-, Worker- und Bediengrenzen ab M1 beachten, auch wenn vollständige Offline-Abnahme erst M4 erfolgt. Bei Zeitdruck erst den abgeschlossenen Slice bewerten und anschließend bewussten Umfang wählen; nicht alle Meilensteine gleichzeitig beginnen.

## Nächster Implementierungsauftrag

M1 in einem separaten Arbeitsauftrag umsetzen: Toolversionen prüfen und pinnen; nur `apps/mosaic-web` und `packages/mosaic-core` anlegen; eine kleine ausdrücklich als Demo gekennzeichnete Palette verwenden; Bilddecoding/Ausschnitt, deterministischen Balanced-Core, Worker und IndexedDB verbinden. Einfache Materialliste und Speichern/Öffnen reichen. Noch keine Katalog-API oder Kaufanbindung.

## Parkplatz

Inventarbegrenzung benötigt eine definierte Strategie bei unzureichendem Bestand; Multi-Brick benötigt Flächenabdeckung, Rotation und eine Zielfunktion. Capacitor braucht tatsächlichen Plattformbedarf. Dithering/weitere Farbmetriken brauchen Vergleichsmotive. Monetarisierung, Accounts und Cloud sind getrennte Produktentscheidungen. Keines dieser Themen blockiert M1.
