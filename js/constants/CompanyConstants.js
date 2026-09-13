export class CompanyConstants {
    static EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
    static PHONE_REGEX = /\b\+?[0-9]{1,3}[ .-][0-9]{3}[ .-][0-9]{3}\b/gi;
    static COMPANY_TYPE_PATTERN = /\b(gmbh|ohg|kg|ag|ug|gbr|ltd|inc|ek)\b/i;
    static COMPANY_HEADER_REGEX = /\b(firmenname|fimenname|firma)\b\s*:?\s*(.*)$/i;
    static PHONE_PATTERN   = /(?:\+\d{1,3}[\s/-]?|\b0)[\d\s/()-]{5,}\d\b/;
    static PHONE_PATTERN_G = /(?:\+\d{1,3}[\s/-]?|\b0)[\d\s/()-]{5,}\d\b/g;
    static EMAIL_PATTERN   = /[\w.+-]+@[\w-]+\.[\w.-]+/;
    static EMAIL_PATTERN_G = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
    static NAME_TOKEN_REGEX = /^[\p{Lu}][\p{L}\p{N}.\-]*$/u;
    static NAME_CONNECTOR_WORDS = new Set(['und', 'der', 'die', 'das', 'von', '&']);
    static WORD_TOKEN_REGEX = /\p{L}[\p{L}-]{2,}/gu;
    static ARTICLE_WORDS = new Set(['ein', 'eine', 'einer', 'einem', 'einen']);
    static COMPANY_TYPE_KEYWORDS = ['unternehmen', 'firma', 'betrieb', 'konzern', 'gruppe', 'mittelstand'];

    static COMMON_WORDS = new Set([
        'und', 'der', 'die', 'das', 'wir', 'du', 'sie', 'ist', 'ein', 'eine',
        'mit', 'für', 'bei', 'als', 'auch', 'auf', 'dich', 'dir', 'uns', 'unser',
        'unsere', 'unseres', 'unserem', 'unseren', 'team', 'teams', 'job',
        'stelle', 'unternehmen', 'mitarbeitende', 'mitarbeiter', 'standort',
        'bewerbung', 'kontakt', 'fragen', 'jahre', 'wenn', 'dann', 'noch',
        'mehr', 'oder', 'aber', 'werden', 'werde', 'kannst', 'kann', 'hast',
        'haben', 'verfügst', 'vertraut', 'inklusive', 'sowie', 'innen'
    ]);
}
