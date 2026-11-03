# Übergabe RealRise CRM an Robert

Stand: 03.11.2026 · Von: Dani · Repo: https://github.com/realrisedani/realrise-crm

Robert, das hier ist die Idee plus ein klickbarer Prototyp für ein eigenes CRM. **Du hast freie Hand beim Aufbau.** Technik, Architektur und ob es in Ops aufgeht oder eigenständig wird, entscheidest du. Der Prototyp zeigt nur, wie es aussehen und sich anfühlen soll.

---

## 1. Was in diesem Paket ist

| Datei / Ordner | Inhalt |
|---|---|
| `index.html`, `css/`, `js/` | Der Prototyp. Reines HTML, CSS, JavaScript, keine Abhängigkeiten, kein Build. |
| `README.md` | Technischer Überblick über den Prototyp. |
| `UEBERGABE-ROBERT.md` | Diese Datei. |
| `docs/crm-bauplan-solvik.html` | Vollständiger Design- und Funktionsplan aus dem Audit der Vorlage. Im Browser öffnen. |

Vorlage war die Demo https://demo.codeandchill.store/solvik/#/overview. Das ist ein kaufbares Template. Wir haben **nichts davon kopiert**, weder Code noch Bilder. Der Bauplan beschreibt nur Aufbau, Verhalten und Design-Werte, der Prototyp ist komplett neu geschrieben.

## 2. Prototyp starten

Doppelklick auf `index.html` reicht. Oder:

```bash
cd realrise-crm
python3 -m http.server 7670
```

Dann `http://localhost:7670` öffnen. Alle Daten sind erfundene Demo-Daten und liegen nur im Browser (`localStorage`, Key `rr-crm:v1`). Zurücksetzen über Einstellungen → Daten → Zurücksetzen.

## 3. Was der Prototyp kann

- **Übersicht:** Umsatz-Chart mit Monatsziel, heiße Deals, Team-Quote als Ring, Stage-Mix, Ranking, Heute-Liste, Aktivität.
- **Pipeline:** Board mit Drag & Drop, Gewonnen/Verloren-Zonen, Listenansicht, Deal-Drawer mit Stage-Stepper, Owner-Filter, CSV-Export.
- **Kunden:** Karten und Tabelle, Segment-Filter, Favoriten, Profilseite mit Deal-Historie, Mini-Kalender, Funnel, Inline-Bearbeitung.
- **Kalender:** Monat und Woche, Filter nach Person und Typ, Aufgaben per Drag verschieben, Agenda mit Überfälligen.
- **Finanzen:** Cash-flow, Fälligkeits-Buckets, Rechnungstabelle, Rechnungs-Drawer.
- **Growth:** Umsatz nach Segment, Lead-Quellen, Neukunden, Win-Rate, Top-Kunden, Team-Leistung.
- **Onboarding:** Projektkarten mit Fortschritt, Checkliste pro Kunde.
- **Einstellungen:** Profil, Team, Benachrichtigungen, Hell/Dunkel, Akzent Coral/Lime, Datenexport.
- **Global:** Suche mit ⌘K, Dock links mit Schnellaktionen, Tastaturkürzel (`?`), Toasts mit Rückgängig, Mobile-Layout.

Code-Aufbau: `js/store.js` ist die einzige Datenschicht. Alle Views lesen nur über den Store. Wer die Demo-Daten gegen echte Daten tauschen will, ersetzt `load()` und die `actions` im Store, die Oberfläche bleibt gleich.

## 4. Was der Prototyp bewusst NICHT ist

- Kein Backend, kein Login, keine Mehrbenutzer-Fähigkeit.
- Keine Anbindung an GHL, Ops, Sipgate oder ablefy.
- Die Stages im Prototyp sind vereinfacht auf 4. Echt sind es die 8 Stages der Pipeline „Sales" (siehe unten).
- Teamnamen außer Dani sind Platzhalter.

## 5. Fragen an dich, bevor es losgeht

1. **Wohin gehört das?** In Ops als neue Oberfläche, als eigene App mit Ops als Backend, oder baust du Ops einfach in diesem Design um?
2. **Hat Ops eine API**, die ein anderes Frontend lesen darf?
3. **Dialer-Daten:** Wo liegen Anruf-Historie und Rückruf-Daten, und kann man sie abfragen?
4. **Dialer-Link:** Lässt sich der Powerdialer per Link mit einem vorausgewählten Kontakt öffnen? Dann reicht im CRM ein „Anrufen"-Button.

## 6. Vorschlag für die Anbindung

Nur ein Vorschlag, deine Entscheidung.

1. **Server-Schicht:** GHL-Token nie im Browser. Proxy über Cloudflare, wo Ops ohnehin läuft.
2. **Erst nur lesen**, dann schreiben. Ein reines Dashboard zeigt schnell, ob die Zahlen stimmen.
3. **Live-Updates** über GHL-Workflow-Aktion „Webhook" an den Proxy statt Dauer-Abfragen.
4. **Dialer nicht nachbauen.** Ergebnisse kommen schon über die `rr-dialer-*`-Tags und Notizen in GHL an.
5. **Rechte:** Setter sehen Kontakte mit ihrem `setting-<name>`-Tag, Closer ihre Deals, Dani alles.

### Zuordnung Prototyp zu echten Daten

| Im Prototyp | Echte Quelle |
|---|---|
| 4 Stages | GHL-Pipeline „Sales" (`ZrOrAL5cPp4wmYvVBDZx`): Webinar/Aufzeichnung angemeldet · Erstgespräch gebucht · Nicht erschienen – Nachfassen · Erstgespräch gehalten · Angebot offen · Follow-up nötig · Gewonnen · Verloren / nicht geeignet |
| Kunden | GHL-Kontakte |
| Closer, Setter, Affiliate | Tags `closer-<name>`, `setting-<name>`, `aff:<slug>` (plus `-kunde`). **Nicht** das Feld „Zugewiesen", das wird in GHL automatisch umverteilt. |
| Kalender | GHL-Kalendertermine und Aufgaben |
| Aktivität | Notizen, Conversations, `rr-dialer-*`-Tags |
| Finanzen | Ops-Kasse (ablefy-Webhook), Opportunity-Felder „Cash Collected (OPS)" und „Raten bezahlt (OPS)" |
| Onboarding | GHL-Pipeline „Onboarding" |
| Verlustgrund | Opportunity-Feld `lostReasonId` |
| Lead-Quellen | `aff:`-Tag, Fallback `contact.source` |

## 7. Offene Punkte, die vorher geklärt sein sollten

- **GHL-Token mit Schreibrechten** wird gebraucht, der aktuelle hat nur Leserechte.
- **Sipgate-Token rotieren**, der stand mal im Chat.
- **Telefon-Einwilligung** für Werbeanrufe fehlt laut Audit in den Formularen. Wird wichtiger, je einfacher Anrufen aus dem CRM wird.
- **Dialer-Filter:** Beim Test am 15.10. zog der Dialer trotz Filter echte Leads. Status bitte prüfen.

## 8. Design-Entscheidungen, die schon stehen

- Akzentfarbe **RealRise-Coral** `#d97757` (Lime ist als Alternative in den Einstellungen umschaltbar).
- Schrift **Urbanist**, Glas-Karten auf dunklem Hintergrund, Hell-Modus vorhanden.
- Alle Design-Werte stehen als Variablen in `css/tokens.css` und ausführlich im Bauplan, Abschnitt 02.

Bei Fragen zum Prototyp oder zur Idee: Dani.
