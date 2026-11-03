# RealRise CRM – Vanilla-Prototyp

Klickbarer CRM-Prototyp im Glas-Dashboard-Stil (Vorbild: Solvik-Demo), gebaut mit reinem HTML, CSS und JavaScript. Keine Abhängigkeiten, kein Build-Schritt. Alle Daten liegen als JSON im `localStorage` des Browsers.

## Starten

Doppelklick auf `index.html` oder ein beliebiger statischer Server:

```bash
python3 -m http.server 7670
```

Dann `http://localhost:7670/#/overview` öffnen.

## Was drin ist

| View | Inhalt |
|---|---|
| Übersicht | Umsatz-Chart mit Monatsziel, Heiße Deals, Team-Quote (Ring), Stage-Mix, Ranking, Heute-Liste, Aktivität |
| Pipeline | Board mit Drag & Drop (4 Stages + Gewonnen/Verloren), Listenansicht, Deal-Drawer mit Stepper, Owner-Filter, CSV |
| Kunden | Karten/Tabelle, Segment-Filter, Sortierung, Favoriten, Profilseite mit Deal-Historie, Mini-Kalender, Funnel, Inline-Edit |
| Kalender | Monat und Woche, Owner- und Typ-Filter, Drag auf anderen Tag, Agenda mit Überfällig, Slot-Klick legt Aufgabe an |
| Finanzen | Cash-flow-Chart, Fälligkeits-Buckets, Rechnungstabelle mit Filter/Suche/Sortierung, Rechnungs-Drawer mit Papieransicht |
| Growth | Umsatz nach Segment, Lead-Quellen-Donut, Neukunden, Win-Rate-Trend, Top-Kunden, Team-Leistung |
| Onboarding | Projektkarten mit Fortschrittsring, Drawer mit Checkliste, Status, Team |
| Einstellungen | Profil, Team, Benachrichtigungen, Darstellung (Hell/Dunkel/System, Akzent Lime/Coral, Wochenstart), Daten-Export/Reset |

Global: Command-Palette (⌘K oder `/`), Dock mit Schnellaktionen, Benachrichtigungen, Aktivitäts-Drawer, Tastaturkürzel (`?`), Toasts mit Rückgängig, Mobile-Layout mit Bottom-Dock.

## Struktur

```
index.html
css/tokens.css        Design-Tokens (Dark/Light, Akzent-Varianten)
css/base.css          Reset, Shell, Header, Tabs, Dock, Grid, Responsive
css/components.css    Buttons, Chips, Badges, Avatare, Charts, Tabellen, Formulare, Dialoge
css/views.css         Layouts der einzelnen Views
js/seed.js            Deterministische Demo-Daten (relativ zu heute)
js/store.js           Zustand, Persistenz, Mutationen, KPI-Formeln
js/ui.js              Formatierung, Icons, Komponenten, SVG-Charts, Overlays
js/app.js             Router, Header, Dock, globale Formulare, Shortcuts
js/views/*.js         Eine Datei pro View
docs/                 Bauplan und Funktionsplan aus dem Vorlagen-Audit
UEBERGABE-ROBERT.md   Übergabe an Robert
```

## RealRise-Mapping

Stages: Lead → Erstgespräch → Angebot → Closing (10/35/60/90 %). Segmente: B2B, B2C, Anderes. Team: Closer, Setter, Affiliate. Quellen: Meta Ads, Webinar, Instagram, WhatsApp, Affiliate, Empfehlung. Rechnungen inklusive Raten. Onboarding-Checkliste mit den Phase-1-Schritten.

Nächster Schritt nach Freigabe des Designs: gleiche Oberfläche auf Next.js + Supabase, GHL-API als erste Datenquelle.
