export class JobTextAnalyzer {
  constructor() {
    this.skillKeywords = [
      "javascript", "typescript", "html", "css", "php", "python",
      "mysql", "sql", "nosql", "react", "angular", "java", "c++", "c#",
      "git", "gitlab", "jira", "confluence", "docker", "node.js", "nodejs",
      "kubernetes", "linux", "windows", "teamfähigkeit", "kommunikation"
    ];

    this.benefitKeywords = [
      "homeoffice", "remote", "hybrid", "weiterbildung", "jobrad",
      "altersvorsorge", "flexible arbeitszeiten", "bonus", "urlaub",
      "betriebsarzt", "fitness", "firmenwagen"
    ];

    this.noiseMarkers = [
      "schnellere jobsuche mit premium",
      "auf unternehmenseinblicke",
      "premium für 0 € testen",
      "1-monatige kostenlose probeversion",
      "einfach kündbar",
      "sie erhalten 7 tage vor ablauf",
      "es gibt qualifikationen, die wahrscheinlich",
      "kandidat:innen haben auf",
      "vom arbeitgeber gesponsert",
      "außerhalb von linkedin verwaltete antworten",
      "und zahlreiche weitere mitglieder nutzen premium",
      "scheinen gut zu den",
    ];

    this.headlines = [
      "übersicht",
      "über uns",
      "über die firma",
      "was wir machen",
      "unternehmen",
      "kontakt",
      "ansprechpartner",
      "dein ansprechpartner",
      "ihre ansprechpartner",
      "deine vorteile bei uns",
      "wir bieten",
      "das bieten wir",
      "deine benefits",
      "unsere benefits",
      "was wir dir bieten",
      "dein aufgabengebiet",
      "deine aufgaben",
      "ihre aufgaben",
      "das erwartet dich",
      "aufgabenbereich",
      "womit du uns überzeugst",
      "dein profil",
      "ihr profil",
      "anforderungen",
      "qualifikationen",
      "das bringst du mit",
      "das bringen sie mit",
      "deine vorteile bei uns",
      "wir bieten",
      "das bieten wir",
      "deine benefits",
      "unsere benefits",
      "was wir dir bieten",
      "dein aufgabengebiet",
      "deine aufgaben",
      "ihre aufgaben",
      "das erwartet dich",
      "aufgabenbereich",
      "womit du uns überzeugst",
      "dein profil",
      "ihr profil",
      "anforderungen",
      "qualifikationen",
      "das bringst du mit",
      "das bringen sie mit",
      "unser team",
      "bewirb dich",
      "Commitment"
    ];

  }

  analyze(text) {
    const originalText = typeof text === "string" ? text : "";
    const lines = this.lines(originalText);
    const contentLines = lines.filter(line => !this.isNoise(line));
    const contentText = contentLines.join("\n");
    const lowerText = contentText.toLowerCase();
    const address = this.extractAddress(contentLines);
    const contact = this.extractContact(contentLines);
    const qualifications = this.extractQualifications(contentLines);
    const companyInformation = this.extractCompanyInformation(lines);
    const socialImpact = this.extractBlockShortest(contentLines, "übersicht", this.headlines);
    const socialFocus = ["Nicht berechnen"];

    return {
      analysisVersion: "1.1",
      companyName: this.extractCompanyName(contentLines),
      company: {
        name: this.extractCompanyName(contentLines),
        street: address.street,
        zip: address.zip,
        city: address.city,
        country: address.country,
        website: companyInformation.website,
        verifiedAt: companyInformation.verifiedAt,
        phones: this.extractPhones(lines),
        emails: this.unique(originalText.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g) || [])
      },
      contact,
      job: {
        title: this.extractJobTitle(lines),
        referenceNumber: this.extractReferenceNumber(contentLines),
        location: this.extractLocation(lines) || address.city,
        employmentType: this.extractEmploymentType(lines),
        salary: this.extractSalary(lines),
        workModel: this.detectWorkModel(lines.join("\n").toLowerCase())
      },
      source: this.detectSource(originalText),
      skills: this.skillKeywords.filter(skill =>
        this.containsKeyword(lowerText, skill)
      ),
      benefits: this.benefitKeywords.filter(benefit =>
        this.containsKeyword(lowerText, benefit)
      ),
      qualifications,
      companyInformation,
      social: {
        benefits: this.benefitKeywords.filter(benefit =>
          this.containsKeyword(lowerText, benefit)
        ),
        impact: socialImpact,
        focus: socialFocus
      },
      tasks: this.extractTasks(contentLines),
      sections: {
        source: contentLines.join("\n"),
        removedNoise: lines.filter(line => this.isNoise(line))
      },
      originalText
    };
  }

  lines(text) {
    return text
      .split(/\r?\n/)
      .map(line => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }

  isNoise(line) {
    const value = line.toLowerCase();
    return line === "----" ||
      this.noiseMarkers.some(marker => value.includes(marker));
  }

  extractCompanyName(lines) {
    return lines.find(line =>
      /\b(gmbh|ag|kg|ug|gbr|ohg|ltd|inc)\b/i.test(line)
    ) || "";
  }

  extractAddress(lines) {
    const result = { street: "", zip: "", city: "", country: "" };
    const zipIndex = lines.findIndex(line => /^\d{5}\s+.+/.test(line));

    if (zipIndex >= 0) {
      const match = lines[zipIndex].match(/^(\d{5})\s+(.+)$/);
      result.zip = match[1];
      result.city = match[2].trim();
      const possibleStreet = lines[zipIndex - 1] || "";
      if (/^[A-ZÄÖÜ][^,]+?\s+\d+[a-z]?$/i.test(possibleStreet)) {
        result.street = possibleStreet;
      }
      if (/^(deutschland|germany|österreich|austria|schweiz|switzerland)$/i
        .test(lines[zipIndex + 1] || "")) {
        result.country = lines[zipIndex + 1];
      }
    }

    return result;
  }

  extractCompanyInformation(lines) {
    const website = lines
      .join(" ")
      .match(/\bhttps?:\/\/[^\s]+/i)?.[0]
      ?.replace(/[),.;]+$/, "") || "";
    const industry = this.valueAfterLabel(lines, "branche");
    const size = this.valueAfterLabel(lines, "größe|groesse|mitarbeiter");
    const verifiedAt = this.valueAfterLabel(lines, "verifizierte seite");
    const overview = this.extractBlock(lines, "übersicht", "website");
    const founded = this.valueAfterLabel(lines, "gegründet");
    const specialties = this.extractBlock(lines, "spezialgebiete", "social impact")
      .join(" ")
      .split(",")
      .map(value => value.trim())
      .filter(Boolean);
    return {
      description: overview.join("\n\n"),
      industry,
      size,
      founded,
      verifiedAt,
      website,
      specialties
    };
  }

  valueAfterLabel(lines, label) {
    const index = lines.findIndex(line => new RegExp(`^${label}$`, "i").test(line));
    const value = index >= 0 ? (lines[index + 1] || "") : "";
    if (/^(website|branche|größe|groesse|mitarbeiter|verifizierte seite|benefits|social impact|im focus)$/i
      .test(value)) {
      return "";
    }
    if (/größe|groesse|mitarbeiter/i.test(label) && !/\d/.test(value)) {
      return "";
    }
    return value;
  }

  extractListAfterLabel(lines, label) {
    const index = lines.findIndex(line => new RegExp(`^${label}$`, "i").test(line));
    if (index < 0) return [];
    const nextSection = lines.findIndex((line, position) =>
      position > index &&
      /^(website|branche|größe|groesse|social impact|im focus|benefits|über uns|unternehmen)$/i
        .test(line)
    );
    const end = nextSection >= 0 ? nextSection : lines.length;
    return this.unique(lines.slice(index + 1, end)
      .filter(line => !this.isNoise(line)));
  }

  extractBlock(lines, startLabel, endLabel = "") {
    const start = lines.findIndex(line =>
      new RegExp(`^${startLabel}$`, "i").test(line)
    );
    if (start < 0) return [];
    const end = endLabel
      ? lines.findIndex((line, index) =>
        index > start && new RegExp(`^${endLabel}$`, "i").test(line)
      )
      : -1;
    return lines.slice(start + 1, end >= 0 ? end : lines.length)
      .filter(line => !this.isNoise(line));
  }

  extractBlockShortest(lines, startLabel, endLabels = []) {
    // 1. Start-Index finden
    const start = lines.findIndex(line =>
      new RegExp(`^${this.escapeRegExp(startLabel)}$`, "i").test(line)
    );
    if (start < 0) return [];

    // 2. End-Labels normalisieren
    const labelsArray = Array.isArray(endLabels) ? endLabels : [endLabels];
    
    let end = -1;
    if (labelsArray.length > 0) {
      const escapedLabels = labelsArray.map(l => this.escapeRegExp(l)).join('|');
      const endRegex = new RegExp(`^(${escapedLabels})$`, "i");

      // Startet ERST NACH dem Start-Label -> Frühere End-Labels sind blockiert
      for (let i = start + 1; i < lines.length; i++) {
        if (endRegex.test(lines[i])) {
          end = i;
          break; // Erster Fund nach Start beendet die Suche
        }
      }
    }

    // 3. Block ausschneiden und Noise filtern
    return lines.slice(start + 1, end >= 0 ? end : lines.length)
      .filter(line => !this.isNoise(line));
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  extractContact(lines) {
    const roleIndex = lines.findIndex(line =>
      /(talent acquisition|recruit|personal(?:abteilung)?|human resources|\bhr\b)/i.test(line)
    );
    const namedContact = lines.join(" ").match(
      /\b(?:bei\s+)?(?:herrn?|frau)\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)+)(?=[,.;]|$)/i
    );
    const contactName = namedContact?.[1]
      ?.replace(/^(herrn?|frau)\s+/i, "")
      .trim();
    const previousLine = roleIndex > 0 ? lines[roleIndex - 1] : "";
    return {
      name: contactName || (this.looksLikePersonName(previousLine)
        ? previousLine
        : ""),
      role: roleIndex >= 0 ? lines[roleIndex] : ""
    };
  }

  looksLikePersonName(value) {
    return /^[A-ZÄÖÜ][a-zäöüß'-]+(?:\s+[A-ZÄÖÜ][a-zäöüß'-]+){1,2}$/.test(value);
  }

  extractPhones(lines) {
    return this.unique(lines
      .filter(line => /(?:\+49|^0)\s*\d/.test(line))
      .flatMap(line => line.match(/(?:\+49|0)\s*(?:\(?\d{2,5}\)?[\s/-]*){2,}/g) || []));
  }

  extractReferenceNumber(lines) {
    return lines.join(" ").match(/\b[A-Z]{2,6}\d{2,}-\d{3,}(?:-[A-Z0-9]+)?\b/i)?.[0] || "";
  }

  extractJobTitle(lines) {
    const markedTitle = lines.find(line => /\(m\/w\/d\)|\bm\/w\/d\b/i.test(line));
    if (markedTitle && !/^(es gibt|der bereich)/i.test(markedTitle)) {
      return markedTitle.trim();
    }
    const titleIndex = lines.findIndex(line =>
      /^(gesucht wird|wir suchen|stellenangebot|job als|position:)/i.test(line)
    );
    if (titleIndex >= 0) {
      return lines[titleIndex]
        .replace(/^(gesucht wird|wir suchen|stellenangebot|job als|position:)\s*/i, "")
        .trim();
    }
    return "";
  }

  extractSalary(lines) {
    const line = lines.find(value =>
      /(gehalt|vergütung|verdienst|jahresgehalt|brutto|€|eur\b)/i.test(value)
    );
    return line || "";
  }

  extractLocation(lines) {
    const line = lines.find(value =>
      /^[^·]+,\s*[A-ZÄÖÜ][^·]+,\s*(Deutschland|Österreich|Schweiz)\s*·/i.test(value)
    );
    return line?.split("·")[0].trim() || "";
  }

  extractEmploymentType(lines) {
    const line = lines.find(value => /\b(vollzeit|teilzeit|minijob)\b/i.test(value));
    return line?.match(/\b(vollzeit|teilzeit|minijob)\b/i)?.[1] || "";
  }

  detectSource(text) {
    const sources = [
      ["LinkedIn", /\blinked(?:in)?\b/i],
      ["Instagram", /\binstagram\b/i],
      ["Indeed", /\bindeed\b/i],
      ["StepStone", /\bstepstone\b/i],
      ["XING", /\bxing\b/i],
      ["Unternehmenswebsite", /\bkarriere(?:seite)?\b|\bjobseite\b/i]
    ];
    return sources.find(([, pattern]) => pattern.test(text))?.[0] || "";
  }

  extractQualifications(lines) {
    const candidates = lines
      .map(line => line
        .split(/\bbewirb dich\b/i)[0]
        .replace(/^[•●✓✔\-–—]\s*/, "")
        .trim())
      .filter(line =>
      /^(abgeschlossenes|erste berufserfahrung|sicherer umgang|kenntnisse in|sehr gute deutsch|erfahrung mit)/i
        .test(line) ||
      /^hohes interesse an|^zuverlässige und strukturierte|^unser team lebt von/i.test(line)
    );
    const personal = this.unique(candidates.filter(line =>
      /(team lebt von|teamfähig|kommunikations|zuverlässig|eigenständig|motiviert|interesse an|strukturierte arbeitsweise|unterschiedlichen stärken)/i
        .test(line)
    ));
    return {
      required: this.unique(candidates.filter(line =>
        !/(idealerweise|wünschenswert|von vorteil|nice to have)/i.test(line) &&
        !personal.includes(line)
      )),
      preferred: this.unique(candidates.filter(line =>
        /(idealerweise|wünschenswert|von vorteil|nice to have)/i.test(line)
      )),
      personal
    };
  }

  extractTasks(lines) {
    return this.unique(lines.filter(line =>
      /^(entwicklung|programmierung|betreuung|wartung|konzeption|analyse|aufbau|pflege)\b/i
        .test(line)
    ));
  }

  detectWorkModel(text) {
    if (text.includes("homeoffice") || text.includes("remote")) return "Remote";
    if (text.includes("hybrid")) return "Hybrid";
    return "Unbekannt";
  }

  containsKeyword(text, keyword) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9+#])${escaped}($|[^a-z0-9+#])`, "i")
      .test(text);
  }

  unique(values) {
    return [...new Set(values.map(value => value.trim()).filter(Boolean))];
  }
}