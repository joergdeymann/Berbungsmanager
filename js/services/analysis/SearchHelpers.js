/*
 * SearchHelpers ("Suchehilfen")
 * -----------------------------
 * Im Gegensatz zu SourceProfiles.js (CSS-Selektoren je Job-Portal)
 * sind das hier reine TEXT-Suchbegriffe, mit denen PageSearcher.js
 * eine beliebige, unbekannte Firmenseite durchsucht - z.B. um in
 * einem Kontakt-Popup ("Wie können wir helfen?") eine
 * Telefonnummer zu finden, auch ohne bekannten CSS-Selektor.
 *
 * Neue Begriffe können hier einfach ergänzt werden, ohne Code
 * anzufassen.
 */
export const SEARCH_HELPERS = {
    Kontaktdaten: [
        "wie können wir helfen",
        "wie können wir dir helfen",
        "wie können wir ihnen helfen",
        "kontaktieren sie uns",
        "so erreichen sie uns",
        "erreichbarkeit",
        "kontakt"
    ],
    Firmeninformationen: [
        "über uns",
        "über das unternehmen",
        "wer wir sind",
        "wir sind"
    ],
    Karriere: [
        "karriere",
        "jobs",
        "stellenangebote",
        "stellenanzeigen",
        "offene stellen"
    ]
};
