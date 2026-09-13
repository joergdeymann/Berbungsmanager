export class PostBoxConstants {
    // "Postfach 12 34 56", "Postfach 123456", "Postfach: 1234", "PF 12 34"
    static POSTBOX_REGEX = /\b(?:postfach|Postf\.|PF)\s*:?\s*(\d(?:\d|\s\d){2,9})\b/gi;
}