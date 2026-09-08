/*
 * ParserConfig
 * ------------
 * Einzige Quelle für alle Text-Erkennungsregeln des Bewerbungs-Parsers.
 * Sowohl JobTextAnalyzer (Regex-basierte Einzelfelder) als auch
 * SectionParser (Überschriften-basierte Blöcke) lesen von hier -
 * eine Änderung an einem Begriff wirkt sich damit automatisch auf
 * beide aus.
 *
 * Aufbau einer Section-Definition:
 *   name       - Zielfeld, in das der gefundene Block einsortiert wird
 *                (mehrere Überschriften dürfen auf dasselbe Ziel zeigen,
 *                 siehe z.B. "companyInformation")
 *   titles     - Überschrift matched, wenn die Zeile GENAU einem Eintrag
 *                entspricht ODER mit ihm beginnt ("startsWith")
 *   allOf      - Liste von Begriffs-Gruppen; die Überschrift matched,
 *                wenn ALLE Begriffe einer Gruppe irgendwo in der
 *                Überschrift vorkommen (UND-Verknüpfung), z.B.
 *                ["erforderlich", "qualifikation"]
 *   multiple   - true (Default): kommt der Abschnitt mehrfach vor,
 *                werden alle Vorkommen zusammengehängt statt sich
 *                gegenseitig zu überschreiben
 */

export const IGNORE_LINE_MARKERS = [
    // Werbung / LinkedIn-Premium-Rauschen
    "premium",
    "und vieles mehr zugreifen",
    "vieles mehr zugreifen",
    "kostenlose probeversion",
    "1-monatige kostenlose probeversion",
    "einfach kündbar",
    "sie erhalten 7 tage vor ablauf",
    "schnellere jobsuche mit premium",
    "auf unternehmenseinblicke",
    "premium für 0 € testen",
    "und zahlreiche weitere mitglieder nutzen premium",

    // Bewerbungs-Button-Umfeld
    "geklickt",
    "bewerben",
    "speichern",
    "vom arbeitgeber gesponsert",
    "außerhalb von linkedin verwaltete antworten",
    "kandidat:innen haben auf",

    // Eignungs-/Matching-Anzeige
    "ihr profil und lebenslauf erfüllen",
    "scheinen gut zu den",
    "details zur eignung anzeigen",
    "beta",
    "haben ihnen diese informationen weitergeholfen?",
    "erhalten sie exklusive einblicke für bewerber:innen",
    "es gibt qualifikationen, die wahrscheinlich",

    // Quelle
    "linkedin"
];

export const SECTION_DEFINITIONS = [
    {
        name: "tasks",
        titles: [
            "dein aufgabengebiet",
            "deine aufgaben",
            "ihre aufgaben",
            "das erwartet dich",
            "aufgabenbereich",
            "darauf kannst du dich freuen"
        ]
    },
    {
        name: "qualifications",
        titles: [
            "womit du uns überzeugst",
            "dein profil",
            "ihr profil",
            "anforderungen",
            "qualifikationen",
            "das bringst du mit",
            "das bringen sie mit",
            "das ist dein erfolgsrezept"
        ],
        // Direkt benannte Erforderlich-/Wunsch-Überschriften landen ebenfalls
        // im selben Rohblock - die Feinsortierung übernimmt danach
        // QUALIFICATION_SUBFILTERS (Punkt g).
        allOf: [
            ["erforderlich", "qualifikation"],
            ["qualifikation", "wahrscheinlich"]
        ]
    },
    {
        name: "benefits",
        titles: [
            "deine vorteile bei uns",
            "wir bieten",
            "das bieten wir",
            "deine benefits",
            "unsere benefits",
            "was wir dir bieten"
        ]
    },
    {
        name: "weiterbildung",
        titles: [
            "programme",
            "berufliche weiterentwicklung"
        ]
    },
    {
        name: "companyInformation",
        titles: [
            "übersicht",
            "über dieses unternehmen",
            "über uns",
            "über die firma",
            "was wir machen",
            "unternehmen",
            "social impact",
            "details zum jobangebot",
            "wofür wir stehen"
        ]
    },
    {
        name: "contact",
        titles: [
            "kontakt",
            "ansprechpartner",
            "dein ansprechpartner",
            "ihre ansprechpartner"
        ],
        // Deckt alle Geschlechtsformen ab (Ansprechpartner/-in, Dein/Deine/
        // Ihr/Ihre ...), ohne jede Kombination einzeln auflisten zu müssen.
        allOf: [
            ["ansprechpartner"]
        ]
    },
    {
        name: "closing",
        titles: [
            "unser team",
            "bewirb dich"
        ]
    }
];

/*
 * Zusätzlich zur überschriftenbasierten Erkennung: einzelne Sätze,
 * die MITTEN im Fließtext stehen (ohne eigene Überschrift), aber
 * inhaltlich klar einem Zielfeld zuzuordnen sind - z.B. ein Satz
 * über die Firma innerhalb der Stellenbeschreibung. Wird von
 * SectionParser zusätzlich zu den Überschriften-Blöcken ausgewertet.
 */
export const INLINE_KEYWORD_RULES = [
    {
        target: "companyInformation",
        anyOf: ["familienunternehmen", "familienbetrieb", "traditionsunternehmen", "inhabergeführt"]
    }
];

/*
 * Branchen-Erkennung per Schlüsselwort, falls die Anzeige kein
 * explizites "Branche:"-Feld hat (z.B. "...ein Ziel: gutes Essen
 * für Jung und Alt zu kochen" -> Gastronomie).
 */
export const INDUSTRY_KEYWORD_RULES = [
    { industry: "Gastronomie", anyOf: ["kochen", "küche", "kulinarisch", "catering", "gastronomie"] },
    { industry: "IT / Softwareentwicklung", anyOf: ["softwareentwicklung", "it-dienstleister", "software-unternehmen"] },
    { industry: "Handwerk", anyOf: ["handwerksbetrieb", "handwerksunternehmen"] }
];

/*
 * Unterfilterung (g): Ein grober Rohblock (z.B. "qualifications" aus
 * "Womit du uns überzeugst") wird zeilenweise in Kategorien
 * aufgeteilt. Reihenfolge zählt - die erste passende Regel gewinnt,
 * alles Übrige fällt in den Default-Eimer ("required").
 */
export const QUALIFICATION_SUBFILTERS = [
    {
        target: "preferred", // wishedQualification
        anyOf: ["idealerweise", "wünschenswert", "von vorteil", "nice to have", "interesse", "wahrscheinlich"]
    },
    {
        target: "personal",
        anyOf: ["zuverlässig", "strukturiert", "teamfähig", "kommunikations", "eigenständig", "motiviert", "unterschiedlichen stärken", "team lebt von"]
    }
    // kein Treffer -> "required" (expectedQualification)
];
