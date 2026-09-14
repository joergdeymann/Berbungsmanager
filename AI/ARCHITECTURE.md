# System-Architektur & Parser-Fluss

## 1. Gesamt-Struktur (UI & Routing)
- **app.js** (Main Entry)
  ├── **Router** (Wechselt Views)
  ├── **OverviewView** (Listen-Übersicht)
  ├── **DetailView** (Anzeige via HTML-Templates)
  │     └── *Templates:* Company, Contact, Job, Requirements, Benefits, Sources, Application, Communication, DetailHeader, DetailNavigation
  └── **EditorView** (Zentraler Editor)
        ├── **Application** (Datenmodell)
        ├── **ApplicationAnalyzer** (Analyse-Schnittstelle)
        └── **Edit-Tabs:** ImportTab, CompanyTab, ContactTab, JobTab, RequirementsTab, BenefitsTab, ApplicationTab, SourcesTab, OutputTab

---

## 2. Der NEUE Parser-Ablauf (Ziel-Architektur)
**ParseText** ist die zentrale Steuerungskomponente für das Parsing-System:

1. **Vorbereitung:** `ParseText` -> **TextCleaner** (Bereinigt Rohdaten)
2. **Segmentierung:** `ParseText` -> **SectionParser** (Nutzt `LineParser` + `SectionPart` + Constants)
3. **Extraktion:** `ParseText` steuert spezialisierte Sub-Extractor-Klassen:
   - **CompanyExtractor** -> Nutzt `CompanyName-`, `Phone-`, `Email-`, `Street-`, `Location-`, `Domain-`, `PostBox-Extractor` + jeweilige Constants.
   - **JobExtractor** -> Nutzt `MoneyExtractor`
   - **QualificationExtractor** -> Nutzt `ParserConstants`, `LineParser`
   - **BenefitExtractor** -> Nutzt `ParserConstants`

---

## 3. ⚠️ Refactoring & Aufräum-Anweisungen (Technische Schulden)
Die alte Struktur ist teilweise redundant verschachtelt und nutzt veraltete Pfade. Folgende Bereiche müssen dringend auf den **neuen Parser** migriert werden:

### A. Veraltete Import-Analyse auflösen
Zuvor rief das `ImportTab` entweder `ParseUrl` oder den alten `ApplicationAnalyzer` auf, welche intern unsauber verschachtelt waren:
- `ParseUrl` nutzte das alte `TextCleanup` (wird komplett ersetzt durch `TextCleaner`).
- `ApplicationAnalyzer` hing am alten `JobTextAnalyzer`.
- **Ziel:** `ImportTab` und `ApplicationAnalyzer` dürfen exklusiv nur noch die neuen Klassen unter `js/services/analysis/` ansprechen.

### B. Spezifische Code-Baustellen (Dringend auflösen!)
1. **ApplicationAnalyzer:**
   - Hängt aktuell noch direkt an `analysis/SectionParser.js` (`SectionParser.parse(text)`).
   - **Ziel:** Muss auf die zentrale Steuerung über den neuen `ParseText`-Workflow umgestellt werden.
2. **JobTextAnalyzer / ParseText Verwirrung:**
   - Nutzt aktuell fälschlicherweise die alte Datei unter `analysis/parser/SectionParser.js` (inkl. `LineParser` & `SectionPart`).
   - **Ziel:** Diese imports müssen komplett auf das neue Verzeichnis `js/services/analysis/parser/` umgebogen werden. Die alten Duplikate im Root- oder `analysis/`-Ordner danach löschen.
