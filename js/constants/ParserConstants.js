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
export class ParserConstants {

    static INVISIBLE_CHARS_REGEX =
        /[\u0000-\u0009\u000B-\u000C\u000E-\u001F\u007F-\u009F\p{Cf}]/gu;

    static BULLET_PREFIX_REGEX =
        /^[•●✓✔\-–—]\s*/;


    static IGNORE_LINE_MARKERS = {
        anyOf: [
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

            // Buttons
            "show less",
            "show more",

            // Quelle
            "linkedin",
            "verwaltete antworten",
            "mit ki ihre eignunge ermitteln"
        ],

        allOf: [
            ["mehr als", "personen haben"]
        ]
    };


    static IGNORE_SECTIONS = {
        anyOf: [
            "ähnliche job",
            "weitere job",
        ]
    };


    static SECTION_HEADLINES = [
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
                "wofür wir stehen",
                "über das unternehmen",
                "wer wir sind",
                "wir sind",
                "stellenbeschreibung"
            ]
        },

        {
            name: "contact",

            titles: [
                "kontakt",
                "ansprechpartner",
                "dein ansprechpartner",
                "ihre ansprechpartner",
                "wie können wir helfen",
                "wie können wir dir helfen",
                "wie können wir ihnen helfen",
                "kontaktieren sie uns",
                "so erreichen sie uns",
                "erreichbarkeit"
            ]
        },

        {
            name: "signature",

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
    static INLINE_KEYWORD_RULES = [
        {
            target: "companyInformation",

            anyOf: [
                "familienunternehmen",
                "familienbetrieb",
                "traditionsunternehmen",
                "inhabergeführt"
            ]
        }
    ];


    /*
     * Branchen-Erkennung per Schlüsselwort, falls die Anzeige kein
     * explizites "Branche:"-Feld hat (z.B. "...ein Ziel: gutes Essen
     * für Jung und Alt zu kochen" -> Gastronomie).
     */
    static INDUSTRY_KEYWORD_RULES = [
        {
            industry: "Gastronomie",

            anyOf: [
                "kochen",
                "küche",
                "kulinarisch",
                "catering",
                "gastronomie"
            ]
        },

        {
            industry: "IT / Softwareentwicklung",

            anyOf: [
                "softwareentwicklung",
                "it-dienstleister",
                "software-unternehmen"
            ]
        },

        {
            industry: "Handwerk",

            anyOf: [
                "handwerksbetrieb",
                "handwerksunternehmen"
            ]
        }
    ];


    /*
     * Unterfilterung (g): Ein grober Rohblock (z.B. "qualifications" aus
     * "Womit du uns überzeugst") wird zeilenweise in Kategorien
     * aufgeteilt. Reihenfolge zählt - die erste passende Regel gewinnt,
     * alles Übrige fällt in den Default-Eimer ("required").
     */
    static QUALIFICATION_SUBFILTERS = [
        {
            target: "preferred",

            anyOf: [
                "idealerweise",
                "wünschenswert",
                "von vorteil",
                "nice to have",
                "interesse",
                "wahrscheinlich"
            ]
        },

        {
            target: "personal",

            anyOf: [
                "zuverlässig",
                "strukturiert",
                "teamfähig",
                "kommunikations",
                "eigenständig",
                "motiviert",
                "unterschiedlichen stärken",
                "team lebt von",
                "du begeisterst",
                "werde teil",
                "gestaltest du",
                "deine expertise"
            ]
        },

        {
            target: "required",

            anyOf: [
                "erfolg",
                "abgeschlossene ausbildung",
                "berufserfahrung",
                "expertenwissen",
                "du verfügst",
                "sehr gute",
                "überzeugst du",
                "bestens vertraut",
                "studium"
            ]
        }
    ];

    static BENEFIT_KEYWORDS = [
        'jobrad',
        '13. gehalt',
        'weihnachtsgeld',
        'urlaubsgeld',
        'sportmitgliedschaft',
        'fitnessstudio',
        'essensgeldzuschuss',
        'essenszuschuss',
        'homeoffice',
        'home office',
        'betriebliche altersvorsorge',
        'vermögenswirksame leistungen',
        'weiterbildung',
        'fortbildung',
        'betriebsarzt',
        'firmenwagen',
        'flexible arbeitszeit',
        'kitazuschuss',
        'kinderbetreuungszuschuss'
    ];

    static POSSIBLE_BENEFIT_KEYWORDS = [
        // Vergütung
        '13. gehalt',
        'weihnachtsgeld',
        'urlaubsgeld',
        'sonderzahlung',
        'erfolgsbeteiligung',
        'bonus',
        'leistungsprämie',
        'provision',
        'vermögenswirksame leistungen',

        // Mobilität
        'jobrad',
        'fahrradleasing',
        'bikeleasing',
        'dienstrad',
        'firmenwagen',
        'dienstwagen',
        'fahrkostenzuschuss',
        'fahrtkostenzuschuss',
        'tankgutschein',
        'deutschlandticket',
        'jobticket',
        'zuschuss zum deutschlandticket',

        // Arbeitszeit & Arbeitsort
        'flexible arbeitszeit',
        'gleitzeit',
        'teilzeit',
        'homeoffice',
        'home office',
        'mobiles arbeiten',
        'mobile arbeit',
        'hybrides arbeiten',
        'hybride arbeit',
        'remote work',
        'remote',
        'workation',
        '4-tage-woche',
        'vier-tage-woche',

        // Urlaub & Freizeit
        '30 tage urlaub',
        '30 urlaubstage',
        'zusätzlicher urlaub',
        'sonderurlaub',
        'bezahlte freistellung',
        'urlaubskonto',

        // Altersvorsorge & Versicherungen
        'betriebliche altersvorsorge',
        'betriebliche krankenversicherung',
        'betriebliche zusatzversicherung',
        'betriebliche unfallversicherung',
        'unfallversicherung',
        'krankenversicherung',
        'altersvorsorge',
        'rentenversicherung',

        // Gesundheit & Sport
        'gesundheitsförderung',
        'gesundheitsprogramm',
        'gesundheitsmanagement',
        'betriebsarzt',
        'betriebliche gesundheitsförderung',
        'fitnessstudio',
        'sportmitgliedschaft',
        'sportangebote',
        'fitnessangebote',
        'fitnesszuschuss',
        'gesundheitsbonus',
        'wellpass',
        'hansefit',

        // Familie & Kinder
        'kitazuschuss',
        'kinderbetreuungszuschuss',
        'kindergarten-zuschuss',
        'kinderbetreuung',
        'familienfreundlich',
        'elternzeit',
        'zusätzliche elternzeit',

        // Essen & Verpflegung
        'essensgeldzuschuss',
        'essenszuschuss',
        'mittagessen',
        'kantine',
        'betriebskantine',
        'restaurantgutscheine',
        'essensgutscheine',
        'getränke kostenlos',
        'kostenlose getränke',
        'obstkorb',
        'kostenloses obst',

        // Weiterbildung & Entwicklung
        'weiterbildung',
        'fortbildung',
        'weiterbildungsbudget',
        'bildungsurlaub',
        'schulungen',
        'seminare',
        'zertifizierungen',
        'entwicklungsmöglichkeiten',
        'persönliche entwicklung',
        'berufliche entwicklung',
        'karrierechancen',

        // Arbeitsplatz & Ausstattung
        'diensthandy',
        'firmenhandy',
        'dienstlaptop',
        'firmenlaptop',
        'homeoffice-ausstattung',
        'arbeitsplatzausstattung',
        'moderne arbeitsplätze',
        'moderner arbeitsplatz',

        // Weitere häufige Benefits
        'mitarbeiterrabatt',
        'personalrabatt',
        'rabatte',
        'corporate benefits',
        'mitarbeiterangebote',
        'mitarbeitervergünstigungen',
        'prämie',
        'willkommensbonus',
        'mitarbeiter werben mitarbeiter',
        'betriebliche sozialleistungen',
        'kostenlose parkplätze',
        'parkplatz',
        'parkplätze',
        'gute verkehrsanbindung',
        'öffentliche verkehrsmittel',
        'teamevents',
        'firmenevents',
        'sommerfest',
        'weihnachtsfeier',
        'flache hierarchien',
        'du-kultur'
    ];

    /*
     * Bekannte Benefit-Stichworte: werden zusätzlich zu den echten
     * Aufzählungspunkten (aus "Das bieten wir" o.ä.) gesucht und als
     * eigene Stichpunkte ergänzt, auch wenn sie nur beiläufig in einem
     * Satz erwähnt werden (z.B. "...mit einem halben Gehalt Urlaubsgeld
     * im Gepäck" -> Stichpunkt "Urlaubsgeld"). term = wonach gesucht
     * wird (lowercase), label = wie der Stichpunkt angezeigt wird.
     */
    static BENEFIT_TAGS = [
        {
            term: "jobrad",
            label: "JobRad"
        },

        {
            term: "13. gehalt",
            label: "13. Gehalt"
        },

        {
            term: "weihnachtsgeld",
            label: "Weihnachtsgeld"
        },

        {
            term: "urlaubsgeld",
            label: "Urlaubsgeld"
        },

        {
            term: "sportmitgliedschaft",
            label: "Kostenlose Sportmitgliedschaft"
        },

        {
            term: "fitnessstudio",
            label: "Kostenlose Sportmitgliedschaft"
        },

        {
            term: "essensgeldzuschuss",
            label: "Essensgeldzuschuss"
        },

        {
            term: "essenszuschuss",
            label: "Essenszuschuss"
        },

        {
            term: "homeoffice",
            label: "Homeoffice"
        },

        {
            term: "home office",
            label: "Homeoffice"
        },

        {
            term: "betriebliche altersvorsorge",
            label: "Betriebliche Altersvorsorge"
        },

        {
            term: "vermögenswirksame leistungen",
            label: "Vermögenswirksame Leistungen"
        },

        {
            term: "weiterbildung",
            label: "Fortbildung"
        },

        {
            term: "fortbildung",
            label: "Fortbildung"
        },

        {
            term: "betriebsarzt",
            label: "Betriebsarzt"
        },

        {
            term: "firmenwagen",
            label: "Firmenwagen"
        },

        {
            term: "flexible arbeitszeit",
            label: "Flexible Arbeitszeiten"
        },

        {
            term: "kitazuschuss",
            label: "Kinderbetreuungszuschuss"
        },

        {
            term: "kinderbetreuung",
            label: "Kinderbetreuungszuschuss"
        }
    ];


    /*
     * Kurze "Badges" auf Stellenanzeigen (Arbeitsmodell/Anstellungsart),
     * die mehrfach und nebeneinander auftreten können (z.B. "Remote" UND
     * "Vollzeit" als zwei getrennte Buttons) - werden ALLE gesammelt,
     * nicht nur der erste Treffer.
     */
    static JOB_TAG_WHERE = [
        {
            term: "remote",
            label: "Remote"
        },

        {
            term: "hybrid",
            label: "Hybrid"
        },

        {
            term: "vor ort",
            label: "Vor Ort"
        }
    ];


    static JOB_TAG_WHAT = [
        {
            term: "vollzeit",
            label: "Vollzeit"
        },

        {
            term: "teilzeit",
            label: "Teilzeit"
        },

        {
            term: "minijob",
            label: "Minijob"
        },

        {
            term: "Werkstudent",
            label: "Werkstudent"
        },

        {
            term: "Praktikum",
            label: "Praktikum"
        },

        {
            term: "Freelance",
            label: "Freelance"
        }
    ];


    static JOB_TAG_HOW = [
        {
            term: "Befristet",
            label: "Befristet"
        },

        {
            term: "Unbefristet",
            label: "Unbefristet"
        }
    ];


    // Überschriften Teiler
    static SEARCH_HELPERS = {
        Karriere: [
            "karriere",
            "jobs",
            "stellenangebote",
            "stellenanzeigen",
            "offene stellen"
        ]
    };


    static APPLICATION_TYPE = [
        {
            term: "bewerbung online",
            label: "Online"
        },

        {
            term: "per mail",
            label: "Mail"
        },

        {
            term: "per posrt",
            label: "Brief"
        },

        {
            term: "per whatsappposrt",
            label: "WhatsApp"
        }
    ];


    static IMPORTANT_APPLICATION_INFORMATION = {
        allOf: [
            [
                "können",
                "nicht akzeptieren"
            ],

            [
                "datenschutzgründe"
            ]
        ]
    };


    static MONEY = {
        "Weihnachtsgeld": [
            "(13. Monatsgehalt)",
            "weihnachtsgeld.{0,20}(\\d{1,6}(?:[.,]\\d{1,2})?)"
        ],

        "Urlaubsgeld": [
            "urlaubsgeld.{0,20}(\\d{1,6}(?:[.,]\\d{1,2})?)"
        ],

        "Gehalt": [
            "gehalt.{0,20}(\\d{1,6}(?:[.,]\\d{1,2})?)"
        ]
    };


    static TAGS = {
        "Developer": [
            "Frontend Developer",
            "Backend Developer",
            "Fullstack Developer",
            "Fullstack Engineer",
            "Full Stack Developer",
            "Full Stack Engineer",
            "Frontend Engineer",
            "Backend Engineer"
        ],

        "TecS-Stack": [
            "HTML",
            "CSS",
            "Deutsch",
            "JavaScript",
            "Vue 3",
            "responsive Design",
            "API-Anbindung",
            "Statemangaement",
            "Mocks",
            "Unit-Test",
            "UC",
            "GTM",
            "GA4",
            "Azure",
            "DevOps",
            "CI/CD",
            "Git",
            "GitHub",
            "Bitbucket",
            "AWS",
            "GCP",
            "Azure",
            "Kubernetes",
            "Docker",
            "Terraform",
            "Ansible",
            "Jenkins",
            "CircleCI",
            "TravisCI",
            "Gitlab",
            "Gitea",
            "GitHub",
            "Bitbucket Server",
            "Jira",
            "Confluence",
            "Trello",
            "Asana",
            "Slack",
            "Discord",
            "MS Teams",
            "Zoom",
            "Google Meet",
            "Microsoft Teams",
            "Google Calendar",
            "Microsoft Calendar",
            "Google Drive",
            "Microsoft Drive",
            "Google Docs",
            "Microsoft Docs",
            "Gmail",
            "Outlook",
            "Yahoo Mail",
            "Protonmail",
            "C#",
            "C-Sharp"
        ],

        "IT": [
            "product owner",
            "scrum master",
            "scrum",
            "agile",
            "kanban",
            "lean",
            "devops",
            "testautomation",
            "automatisierung",
            "software development",
            "software engineering"
        ]
    };


    static TRANSLATIONS = {
        "DE": {
            "task": "Deine Aufgaben",
            "qualifications": "erforderlich Qualifiaktionen",
            "benefits": "Vorteile / Benefits"
        }
    };

    //TEMPORÄR 
     // ... bestehende Konstanten

    // typische "Badge"-Begriffe in Stellenanzeigen: Arbeitsmodell,
    // Anstellungsart und Befristung - werden oft als mehrere separate
    // Buttons/Tags nebeneinander angezeigt, nicht als Fließtext
    static JOB_TAG_KEYWORDS = [
        // Arbeitsmodell
        'Remote', 'Homeoffice', 'Home Office', 'Mobiles Arbeiten',
        'Hybrid', 'Vor Ort', 'Onsite',

        // Anstellungsart
        'Vollzeit', 'Teilzeit', 'Minijob', 'Werkstudent',
        'Werkstudentin', 'Freelance', 'Freiberuflich',
        'Praktikum', 'Ausbildung', 'Duales Studium', 'Trainee',

        // Befristung
        'Befristet', 'Unbefristet', 'Festanstellung',

        // Arbeitszeitmodell
        'Schichtdienst', 'Gleitzeit', 'Flexible Arbeitszeiten',

        // Sonstiges, häufig als eigenes Badge
        'Führungsposition', 'Neu', 'Dringend gesucht'
    ];
}