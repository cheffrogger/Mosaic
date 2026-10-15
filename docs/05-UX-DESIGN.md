# UX und Bedienung — v0.2

Stand: 2026-10-13 · Arbeitsentwurf ohne vorgegebene Markenästhetik.

## Drei Arbeitsbereiche

1. **Vorbereiten:** Bild, Ausschnitt, Raster, Baseplates, Bauabschnitte und Palette. Brauchbare Defaults: 32×32 Raster, 32×32 Baseplate, 16×16 Bauabschnitte, Balanced, weißer Hintergrund, alle Farben der gewählten Palette aktiv und K gleich deren Anzahl.
2. **Mosaik bearbeiten:** Große Vorschau, Zoom, Zellwahl, Farbauswahl, Sperre und Rückgängig. Zellen sind per Tap/Klick und mit Pfeiltasten erreichbar; eine begleitende Statuszeile nennt Koordinate, Farbe und Sperrstatus. Generieren ist eine ausdrückliche Aktion, nicht bei jeder Schiebereglerbewegung eine Vollberechnung.
3. **Bauen und exportieren:** Gesamtübersicht, Abschnittsauswahl, nummerierte Legende, Materialliste sowie Download-Aktionen.

Mobil diese Bereiche als klare Schritte, Desktop Vorschau neben Einstellungen. Der aktuelle Projektstand bleibt beim Bereichswechsel erhalten. Bildwechsel/Rasterwechsel erklärt vor Bestätigung den Verlust bestehender Zelländerungen.

## Aktuelles M3-Browserlayout

Desktop und Tablet zeigen die Raster-/Abschnittseinstellungen und die Bildbearbeitung in getrennten, klar beschrifteten Gruppen; Quellbild und Mosaik stehen nebeneinander. Die Controls verwenden mindestens 44 CSS-Pixel hohe Eingabeflächen. Unter 760 Pixeln wechseln Arbeitsbereiche und Controls in eine Spalte; die Aktionsleiste und Farbpalette bleiben innerhalb des Viewports. Die lange Palette ist standardmäßig eingeklappt und nennt die Zahl aktiver Farben. Dieses Layout ist die responsive M3-Basis, ersetzt aber nicht die vollständige Mobile-, Tastatur- und Offline-Abnahme in M4.

## Zustände

Leer → Bild bereit → Einstellungen gültig → Berechnung → Ergebnis → ungespeichert/gespeichert. Abbruch erhält das letzte gültige Ergebnis. Fehler werden am betroffenen Feld erklärt. Während einer Berechnung bleiben Navigation und Abbruch bedienbar; veraltete Ergebnisse werden verworfen. Eine fehlgeschlagene Speicherung zeigt Wiederholen und Projektdatei sichern an.

## Zugängliche Bearbeitung

Farbe nie allein als Kennung verwenden: Name und Nummer zusätzlich anzeigen. Canvas erhält eine begleitende DOM-Steuerung mit fokussierter Zellposition, Zeile/Spalte, Farbname und Sperrstatus. Pfeiltasten bewegen die Zellwahl, Farbauswahl ist per Tastatur bedienbar; Abschnitte und Zellkoordinaten können direkt angewählt werden. Kein Tab-Stopp pro Zelle. Screenreader-Meldungen auf Auswahl- und Statuswechsel begrenzen.

Bedienelemente mindestens 44×44 CSS-Pixel als Produktziel; sichtbarer Fokus, ausreichender Textkontrast, Vergrößerung ohne abgeschnittene Aktionen. Pinch-Zoom durch sichtbare Plus/Minus-Aktionen ergänzen. Reduzierte Bewegung respektieren. Gedruckte Pläne bleiben anhand von Nummern auch ohne Farbsehen nutzbar.

## Offline und Vertrauen

„Offline bereit“ erst nach erfolgreichem Cachen aller notwendigen Module anzeigen. „Lokal gespeichert“ und „Projektdatei gesichert“ unterscheiden. Update-Hinweis mit späterer Reload-Aktion; keine erzwungene Neuladung. Eigene Farbwerte sind digitale Näherungen, keine Zusicherung physischer Farbtreue oder Teileverfügbarkeit.
