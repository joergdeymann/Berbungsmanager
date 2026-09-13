import { GlobalUtils } from "../utils/GlobalUtils.js";

export class AddressConstants {
    // Grundwörter für Straßennamen, die direkt an den Namen angehängt werden
    // (z.B. "Bahnhofstraße") oder als eigenständiges Wort folgen (z.B. "Konrad-Adenauer-Allee")
    static STREET_SUFFIXES = [
        'straße', 'strasse', 'str.', 'weg', 'allee', 'gasse', 'ring',
        'platz', 'damm', 'ufer', 'steig', 'steg', 'markt', 'promenade',
        'graben', 'tor', 'chaussee', 'zeile'
    ];

    // Präpositionen für präpositional gebildete Straßennamen ohne Grundwort
    // (z.B. "Am Bahnhof", "Im Feld", "An der Halde")
    static STREET_PREPOSITIONS = [
        'am', 'im', 'an der', 'in der', 'auf der', 'vor dem',
        'hinter dem', 'zum', 'zur', 'beim'
    ];

    // Hausnummer-Formate laut DIN 5008:
    // 5 | 5a | 5 a | 10-20 | 10 - 20 | 16/18 | 12 // 3 (Wohnungsnr.) | 5a III (Etage, optional)
    static HOUSE_NUMBER_REGEX_SRC =
        '\\d+' +
        '\\s?[a-zA-Z]?' +
        '(?:\\s?[-/]\\s?\\d+\\s?[a-zA-Z]?)?' +
        '(?:\\s?\\/\\/\\s?\\S+)?' +
        '(?:\\s+(?:[IVXLC]+|OG|DG|EG))?';

    // Variante A: Wort(e) mit Grundwort-Endung, z.B. "Bahnhofstraße", "Konrad-Adenauer-Allee"
    static SUFFIX_STREET_SRC =
        `[\\p{Lu}][\\p{L}]*(?:-[\\p{Lu}][\\p{L}]*)*` +
        `(?:${AddressConstants.STREET_SUFFIXES.map(GlobalUtils.escapeRegExp).join('|')})`;

    // Variante B: Präposition + Substantiv(e), z.B. "Am Bahnhof", "Im Feld", "An der Halde"
    static PREPOSITION_STREET_SRC =
        `(?:${AddressConstants.STREET_PREPOSITIONS.map(GlobalUtils.escapeRegExp).join('|')})` +
        `\\s+[\\p{Lu}][\\p{L}]+(?:\\s[\\p{Lu}][\\p{L}]+)*`;

    // beide Varianten kombiniert, danach zwingend eine Hausnummer
    // match[1] = Suffix-Variante, match[2] = Präpositions-Variante, match[3] = Hausnummer
    static STREET_REGEX = new RegExp(
        `\\b(?:(${AddressConstants.SUFFIX_STREET_SRC})|(${AddressConstants.PREPOSITION_STREET_SRC}))` +
        `\\s+(${AddressConstants.HOUSE_NUMBER_REGEX_SRC})`,
        'giu'
    );
}