# Domänenmodell — v0.2

Stand: 2026-10-13 · Datenvertrag als Spezifikation, noch keine implementierten TypeScript-Typen.

## Sprache

| Begriff | Bedeutung |
|---|---|
| Cell | Eine Rasterposition/Noppe; im MVP genau ein deckendes 1×1-Teil |
| GridConfig | Gesamtbreite/-höhe in Noppen |
| BaseplateLayout | Regelmäßige physische Platten mit frei wählbarer Breite/Höhe |
| BuildSection | Logischer rechteckiger Ausschnitt für den Bauplan; unabhängig von physischen Platten |
| PaletteColor | Projektinterne Farbidentität mit Name und sRGB-Wert |
| Palette | Geordneter Snapshot möglicher Farben und aktiver Farb-IDs |
| PartType | Gewählter 1×1-Teiletyp; einheitlich je MVP-Projekt |
| MaterialRequirement | Aus finalen Zellen abgeleiteter Bedarf; keine Aussage über Besitz oder Lieferbarkeit |
| Inventory | Spätere verfügbare Mengen je Kombination aus Teiletyp und Farbe |
| BuildPlan | Abgeleitete Übersicht, Abschnitte, Legende und Bedarf eines Projektstands |

## MosaicProject

Persistierte Felder: `schemaVersion` (anfangs 1), `projectId`, `name`, `createdAt`, `updatedAt`, `source`, `grid`, `baseplates`, `sectionSize`, `palette`, `partTypeId`, `processing`, `engineVersion`, `cells`, `revision`.

`source` enthält orientierungsbereinigte, kanonische sRGB-RGBA8-Arbeitsdaten (`width`, `height`, `rgbaBase64` für portable JSON-Dateien), Dateiname als Metadatum und den Ausschnitt. Lokal kann derselbe Byteinhalt als Binärdaten in IndexedDB liegen. Bytezahl muss exakt `width × height × 4` ergeben. Base64 ist eine Transportdarstellung, kein Farbformat. Das Originalbild wird nicht eingebettet. Das Arbeitsbild wird nach dem ersten Decodieren einmal erzeugt; erneutes Öffnen decodiert nicht wieder das Original.

`processing`: `mode` (`balanced` oder `pixel-art`), `maxColors`, `backgroundHex` (Standard `#FFFFFF`), `distanceMetric` (`cie76`). Der Ausschnitt ist `{x,y,width,height}` als reelle Pixelkoordinaten des Arbeitsbildes; positive Ausdehnung, innerhalb des Bildes und Seitenverhältnis gleich Rasterbreite/-höhe. UI-Zoom ist kein zusätzlicher divergierender Zustand im Core.

`palette.colors`: geordnete Liste `{id,name,hex,externalRefs?,provenance?}`. `hex` ist normalisiertes `#RRGGBB`; Lab wird berechnet, nicht als zweite veränderbare Wahrheit gespeichert. `activeColorIds` verweist auf eindeutige vorhandene IDs. Gleiche Hexwerte sind erlaubt, gleiche IDs nicht. Externe Referenz ist `{provider,id}`; IDs verschiedener Anbieter nie gleichsetzen. Provenienz umfasst Quelle, Datenstand und bekannte Nutzungsbedingungen. Unbekannte Verfügbarkeit ist `unknown`, nicht `true`.

`cells`: vollständiges Array in Zeilenreihenfolge, jede Zelle `{colorId,locked}`. Position folgt aus Arrayindex; Koordinaten werden nicht redundant gespeichert. Originale Zellmittelwerte werden bei Bedarf neu berechnet. Eine `revision` steigt bei übernommenen Änderungen; sie verhindert die Übernahme alter Ergebnisse.

## Geometrie und Nummerierung

Intern Ursprung links oben, x nach rechts, y nach unten, beide nullbasiert. `index = y × width + x`. Darstellung von Zeile/Spalte und laufender Zellnummer ist einsbasiert (`index + 1`).

Für Abschnittsbreite S und -höhe T: Spaltenanzahl `ceil(width/S)`, Abschnittsspalte `floor(x/S)`, Abschnittszeile `floor(y/T)`. Abschnittsnummer = Abschnittszeile × Spaltenanzahl + Abschnittsspalte + 1. Innerhalb eines Randabschnitts richtet sich die lokale Zellnummer nach dessen tatsächlicher Breite. Ursprung und tatsächliche Ausdehnung jedes Abschnitts werden im Plan angegeben.

Beispiel: 50×50 mit 10×10-Abschnitten → 25 Abschnitte, 100 Teile je Abschnitt, insgesamt 2.500. Bei 16×16 → 16 Abschnitte; unterster rechter Abschnitt 2×2. Zellposition (49,49) hat Gesamtzellnummer 2.500, Abschnitt 16, lokale Nummer 4.

Baseplates nutzen dieselbe regelmäßige Flächenaufteilung, beschreiben aber volle physische Platten: 50×50 auf 16×16-Platten benötigt 4×4 Platten und belegt nur 50×50 des 64×64-Footprints. Freie Randnoppen sind keine Mosaikzellen und erhöhen den Teilebedarf nicht. Gemischte Plattengrößen und unregelmäßige Anordnungen sind späterer Umfang.

## Invarianten und abgeleitete Daten

- `cells.length = width × height`; jede Farb-ID existiert und ist aktiv.
- Anzahl tatsächlich verwendeter Farben ≤ K; gesperrte Farben zählen mit.
- Abschnitte überdecken jede Zelle genau einmal; Baseplates verändern keine Bildzuweisung.
- Summe aller Bedarfe = Zellenanzahl; Abschnittssummen ergeben dieselbe globale Liste.
- Legendenummern 1…N entstehen aus der Reihenfolge verwendeter Farben im Palette-Snapshot. Sie sind innerhalb eines Projektstands überall gleich; bei neuer Farbverwendung dürfen sie sich ändern. Farb-IDs bleiben stabil.
- Plan, Legende und Bedarf werden aus finalen Zellen abgeleitet und nicht unabhängig editiert.

## Erweiterung und Dateiformat

Später beschreibt `BrickPlacement` eine Teileform, Position, Orientierung und Farbe mit mehreren bedeckten Zellen. Keine freie `any`-Erweiterungsmap und keine leeren Inventarfelder im MVP. Ein neues Datenformat erhält eine explizite Migration. Unbekannte neuere `schemaVersion` wird ohne Überschreiben abgelehnt; importierte Daten werden vollständig validiert. `engineVersion` identifiziert fachliche Algorithmusänderungen; alte finale Zellen werden beim Öffnen nicht automatisch neu generiert.
