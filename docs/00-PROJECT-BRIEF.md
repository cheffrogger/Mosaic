# Projektbrief — v0.2

Stand: 2026-10-13 · Planungsbasis, noch keine Implementierung.

## Produktversprechen

Mosaic verwandelt ein eigenes Bild in ein baubares, farbcodiertes 1×1-Steinmosaik: frei wählbares Raster, eigene Palette, verständliche Bauabschnitte und korrekte Materialliste. Zielgruppe sind Hobbybauer, Familien und Kreative, die mit konkreten Plattengrößen und Farben arbeiten möchten. Ein guter Plan und ein kurzer Weg zum ersten Ergebnis haben Vorrang vor Infrastruktur.

Die Verarbeitung erfolgt lokal im Browser. Die App wird zuerst als responsive PWA entwickelt; Capacitor bleibt eine spätere Option. Ein kommerzielles Modell ist möglich, gehört aber nicht zum MVP.

## Erster durchgängiger Ablauf

Ein Bild laden → Ausschnitt für 32×32 wählen → kleine lokale Palette wählen → Mosaik erzeugen → 1.024 benötigte 1×1-Teile zählen → lokal speichern → erneut öffnen. Dieser Vertical Slice beweist die Architektur; er ist noch nicht das vollständige MVP.

## Vollständiges MVP

- JPEG/PNG laden, Ausschnitt verschieben und zoomen, transparente Bereiche mit gewähltem Hintergrund füllen.
- Rasterbreite/-höhe und rechteckige Baseplate-Größe frei einstellen; Bauabschnitte separat einstellen.
- Mitgelieferte sowie eigene Paletten nutzen, aktive Farben und maximale Farbanzahl festlegen.
- Deterministische Grundumwandlung und ein einfacher Pixel-Art-Modus; keine automatische Motivinterpretation.
- Einzelne Zellen ändern und sperren, eine Farbe global ersetzen, Bearbeitung rückgängig machen.
- Gesamtansicht, nummerierte Bauabschnitte, Farblegende und Materialbedarf anzeigen.
- Projekt lokal speichern und als portable Datei sichern; PDF-Bauplan, PNG und CSV exportieren.
- Nach erfolgreichem Laden und Cachen offline arbeiten, auch auf Mobilgeräten.

## Bewusste Grenzen

Eine Zelle entspricht einem deckenden 1×1-Teil desselben gewählten Teiletyps. Keine Höhen, Überlappungen, gemischten Steinformen oder leeren Zellen. Materialbedarf wird berechnet; reale Bestandsmengen begrenzen die Umwandlung noch nicht. Keine Accounts, Cloud-Synchronisierung, Kaufabwicklung, KI-Bildbearbeitung oder App-Store-Auslieferung.

## Leitplanken

React, TypeScript, Vite und pnpm Workspaces; framework-unabhängiger `mosaic-core`; Browser-Adapter für Canvas, Worker, Speicherung und Export. Vitest, fast-check und Playwright bilden später die Testbasis. Kleine Module statt vorsorglich vieler Packages.

Bestätigte Vorgaben und zusätzliche, revidierbare v0.2-Arbeitsentscheidungen sind in [DECISIONS](DECISIONS.md) getrennt. Dokumentversion v0.2 ist weder App-Version noch Projektdateiformat.

## Erfolg

Ein Nutzer kann ohne Konto vom Bild zum verständlichen Plan gelangen. Zellen, Abschnitte, Farblegende und Materialsumme stimmen überein; Speichern und Öffnen erhält manuelle Änderungen. Der erste reale Probebau ist wichtiger als die Anzahl der Features.
