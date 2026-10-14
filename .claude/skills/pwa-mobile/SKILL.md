---
name: pwa-mobile
description: Use when implementing Mosaic offline behavior, installability, service-worker updates, touch flows or future Capacitor integration.
---

# pwa-mobile

Projektleitfaden v0.2. Lies gezielt: [03-ARCHITECTURE.md](../../../docs/03-ARCHITECTURE.md) · [05-UX-DESIGN.md](../../../docs/05-UX-DESIGN.md) · [06-TESTING.md](../../../docs/06-TESTING.md).

Mache lokale Arbeit mobil verlässlich und erkläre ihren Speicherzustand.

- Offline erst nach erfolgreichem Cachen zusagen; erster Besuch ohne Netz ist nicht garantiert.
- App-Shell, Palette und Exportmodule offline bereitstellen, auch wenn diese normalerweise lazy geladen werden. Nutzerdaten gehören in den Projekt-Speicher, nicht in den Fetch-Cache.
- Update erst nach sicherer Speicherung und ausdrücklicher Reload-Aktion aktivieren. Keine ungespeicherten Änderungen durch automatischen Reload verlieren.
- IndexedDB-Fehler sichtbar machen; Projektdatei-Export als Sicherungsmöglichkeit anbieten. Browser-Speicherung ist kein garantiertes Backup.
- Touch-Aktionen durch sichtbare Buttons und Tastaturpfade ergänzen; Installation nicht voraussetzen.
- Capacitor bleibt späterer Adapter, kein zweiter UI-/Core-Stack.

Prüffall: Update beim Editieren → Hinweis anzeigen, speichern, Reload dem Nutzer überlassen. Ergebnis: Zustandsmodell sowie Offline-/Update-/Gerätetests mit tatsächlichen Grenzen.
