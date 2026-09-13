export class WebConstants {
    static TLDS = ["de", "com", "org", "net", "eu", "io", "co", "info", "biz", "at"];

 
    static URL_REGEX = new RegExp(
        `\\b(?:https?://)?(?:www\\.)?[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.(?:${WebConstants.TLDS.join("|")})\\b`,
        "gi"
    );

   // erkennt sowohl "https://www.apetito.de" als auch bloßes "apetito.de"
 
    static DOMAIN_REGEX = /\b(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+(?:\.[a-z0-9-]+)+)\b/gi;

    // Domains, die zwar matchen, aber typischerweise keine Firmen-Domain sind
    static DOMAIN_IGNORE_LIST = new Set([
        'gmail.com', 'gmx.de', 'gmx.net', 'web.de', 'yahoo.com', 'yahoo.de',
        'outlook.com', 'hotmail.com', 'hotmail.de', 't-online.de', 'icloud.com',
        'linkedin.com', 'xing.com', 'facebook.com', 'instagram.com'
    ]);  
} 
 
