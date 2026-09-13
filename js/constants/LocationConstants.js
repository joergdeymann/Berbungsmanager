export class LocationConstants {

    // Signalwörter, die auf einen Ort ohne PLZ hindeuten
    static LOCATION_KEYWORDS_REGEX = /\b(standort|sitz|firmensitz|hauptsitz|niederlassung|filiale|arbeitsort|einsatzort)\b\s*:?\s*/i;

    // ein Ortsname direkt nach dem Signalwort, inkl. mehrteiliger Namen
    // ("Frankfurt am Main", "Rheine")
    static CITY_NAME_REGEX = /[\p{Lu}][\p{L}ß]*(?:\s(?:am|an|im|in|bei|der)\s[\p{Lu}][\p{L}ß]*|[\s-][\p{Lu}][\p{L}ß]*)*/u;

        // gängige Länderkürzel (Kfz-Kennzeichen-Format), wie sie vor PLZ in Adressen stehen
    static COUNTRY_CODES = new Set([
        'D', 'A', 'CH', 'F', 'I', 'NL', 'B', 'L', 'E', 'P', 'PL', 'CZ',
        'HU', 'DK', 'S', 'N', 'FIN', 'GB', 'IRL', 'GR', 'RO', 'BG',
        'HR', 'SK', 'SI', 'LT', 'LV', 'EST'
    ]);

    // optionales Länderkürzel + Bindestrich, dann PLZ (4-5 Ziffern, je nach Land), dann Ort
    static ZIP_CITY_REGEX = /\b(?:([A-Z]{1,3})-)?(\d{4,5})[\s,]+([\p{Lu}][\p{L}ß]*(?:[\s-][\p{Lu}][\p{L}]*)*)/gu;
    
    static DEFAULT_COUNTRY = 'D';

}
