# Verzeichnisstruktur (Bewerbungsmanager)

## ⚠️ Migrations-Hinweis (Alte Dateien)
Die Dateien aus dem alten Ordner `analysis/` müssen in die neuen Klassen integriert werden:
- `ApplicationAnalyzer.js` -> Integrieren in `js/services/analysis/`
- `PageSearcher.js` -> Integrieren in `js/services/analysis/`
- `ParseUrl.js` -> Integrieren in `js/services/analysis/`
- `SearchHelpers.js` -> Integrieren in `js/services/analysis/`
- `SourceProfiles.js` -> Integrieren in `js/services/analysis/`
- `TextCleanup.js` -> **Wird komplett ersetzt durch** `js/services/analysis/parser/TextCleaner.js`

---

## Projekt-Struktur

- **/**: `index.html`, `server.js`, `package.json`, `README.md`, `AI_README.md`
- **assets/**: `icon.svg`
- **css/**:
  - **base/**: `default.css`, `style.css`
  - **components/**: `buttons.css`, `content.css`, `input.css`, `status.css`, `windows.css`
  - **layout/**: `body.css`, `footer.css`, `header.css`
  - **pages/**: `editor.css`, `overview.css`
- **dok/**: Dokumentation und Notizen
- **js/**:
  - `app.js` (Zentraler Einstiegspunkt)
  - **constants/**: `AddressConstants.js`, `CompanyConstants.js`, `LocationConstants.js`, `ParserConstants.js`, `PostBoxConstants.js`, `WebConstants.js`
  - **core/**: `Router.js`
  - **models/**: `Application.js` (Datenmodell)
  - **services/**:
    - `ApplicationRepository.js`, `JobTextAnalyzer.js`, `ParserConfig.js`, `ParseUrl.js`, `SearchHelpers.js`, `SectionParser.js`, `SourceProfiles.js`, `TextCleanup.js`
    - **dto/**: `ImportToApplicationDTO.js`
    - **analysis/**:
      - `ApplicationAnalyzer.js`, `ApplicationParser.js`, `PageSearcher.js`, `ParseUrl.js`, `SearchHelpers.js`, `SourceProfiles.js`, `TextCleanup.js`
      - **extractors/**: `BenefitExtractor.js`, `CompanyExtractor.js`, `CompanyNameExtractor.js`, `DomainExtractor.js`, `EmailExtractor.js`, `JobExtractor.js`, `LocationExtractor.js`, `MoneyExtractor.js`, `PhoneExtractor.js`, `PostBoxExtractor.js`, `QualificationExtractor.js`, `StreetExtractor.js`, `TaskExtractor.js`
      - **parser/**: `LineParser.js`, `ParseText.js`, `SectionParser.js`, `SectionPart.js`, `TextCleaner.js`
  - **templates/detail/**: `ApplicationTemplate.js`, `BenefitsTemplate.js`, `CommunicationTemplate.js`, `CompanyTemplate.js`, `ContactTemplate.js`, `DetailBaseTemplate.js`, `DetailHeaderTemplate.js`, `DetailNavigationTemplate.js`, `JobTemplate.js`, `RequirementsTemplate.js`, `SourcesTemplate.js`
  - **utils/**: `GlobalUtils.js`, `HtmlUtils.js`, `StatusUtils.js`
  - **views/**:
    - `CommunicationSectionController.js`, `DetailNavigationController.js`, `DetailView.js`, `EditorView.js`, `InputPromt.js`, `OverviewView.js`, `Toast.js`, `UrlPrompt.js`, `VerifyPrompt.js`
    - **edit/**: `ApplicationTab.js`, `BaseEditTab.js`, `BenefitsTab.js`, `CompanyTab.js`, `ContactTab.js`, `ImageGallery.js`, `ImportTab.js`, `JobTab.js`, `OutputTab.js`, `RequirementsTab.js`, `SourcesTab.js`
