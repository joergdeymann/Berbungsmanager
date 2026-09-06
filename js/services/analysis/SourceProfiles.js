/*
 * SourceProfiles
 * --------------
 * Legt pro bekannter Job-Plattform fest, in welchem Bereich der
 * HTML-Seite der eigentlich relevante Inhalt steckt (statt die
 * komplette Seite inkl. Navigation/Werbung/Footer zu übernehmen).
 *
 * WICHTIG: CSS-Selektoren von fremden Webseiten ändern sich
 * regelmäßig und sind hier nur ein bestmöglicher Startpunkt -
 * schlägt ein Selektor fehl, greift automatisch der Fallback
 * (kompletter <main>/<article>/<body>-Text, wie bisher über die
 * Ignore-Lines gefiltert). Trifft KEIN Profil zu (unbekannte
 * Domain), wird ebenfalls der Fallback verwendet.
 *
 * Hinweis: Seiten, die einen Login voraussetzen (z.B. LinkedIn-
 * Jobdetails ohne Session), liefern beim serverseitigen Abruf oft
 * nur eine Login-/Teaser-Seite zurück - dafür gibt es serverseitig
 * keine allgemeine Lösung.
 */
export const SOURCE_PROFILES = [
    {
        name: "LinkedIn",
        hostMatches: ["linkedin.com"],
        sections: [
            {
                name: "Details zum Jobangebot",
                selectors: [
                    "div.description__text",
                    "div.show-more-less-html__markup",
                    "section.description"
                ]
            },
            {
                name: "Über dieses Unternehmen",
                selectors: [
                    "section.company-info",
                    "div.core-section-container__content"
                ]
            }
        ]
    },
    {
        name: "StepStone",
        hostMatches: ["stepstone.de", "stepstone.com"],
        sections: [
            {
                name: "Details zum Jobangebot",
                selectors: ["div[data-at='job-ad-content']", "article"]
            }
        ]
    },
    {
        name: "Indeed",
        hostMatches: ["indeed.com", "indeed.de"],
        sections: [
            {
                name: "Details zum Jobangebot",
                selectors: ["#jobDescriptionText"]
            }
        ]
    },
    {
        name: "XING",
        hostMatches: ["xing.com"],
        sections: [
            {
                name: "Details zum Jobangebot",
                selectors: ["main", "article"]
            }
        ]
    }
];

export const FALLBACK_PROFILE = {
    name: "Unbekannte Quelle",
    hostMatches: [],
    sections: [
        {
            name: "Gesamter Inhalt",
            selectors: ["main", "article", "body"]
        }
    ]
};

export function detectSourceProfile(url) {
    try {
        const host = new URL(url).hostname.replace(/^www\./, "");
        const profile = SOURCE_PROFILES.find(candidate =>
            candidate.hostMatches.some(match => host.includes(match))
        );
        return profile || { ...FALLBACK_PROFILE, name: host || FALLBACK_PROFILE.name };
    } catch {
        return FALLBACK_PROFILE;
    }
}
