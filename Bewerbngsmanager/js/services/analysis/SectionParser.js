export class SectionParser {

    constructor() {

        this.sectionDefinitions = [

            {
                name: "tasks",

                titles: [
                    "dein aufgabengebiet",
                    "deine aufgaben",
                    "ihre aufgaben",
                    "das erwartet dich",
                    "aufgabenbereich"
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
                    "das bringen sie mit"
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
                name: "company",

                titles: [
                    "über dieses unternehmen",
                    "über uns",
                    "über die firma",
                    "was wir machen",
                    "unternehmen"
                ]
            },

            {
                name: "contact",

                titles: [
                    "kontakt",
                    "ansprechpartner",
                    "dein ansprechpartner",
                    "ihre ansprechpartner"
                ]
            },
            {
                name:"company2",
                
                titles: [
                    "unser team",
                    "bewirb dich"
                ]
            }


        ];
    }


    parse(text) {

        const lines = this.normalize(text);

        const headings =
            this.findHeadings(lines);

        const sections = {};

        for (let i = 0; i < headings.length; i++) {

            const current =
                headings[i];

            const next =
                headings[i + 1];

            const start =
                current.index + 1;

            const end =
                next
                    ? next.index
                    : lines.length;

            sections[current.name] =
                lines
                    .slice(start, end)
                    .join("\n")
                    .trim();
        }

        return sections;
    }


    normalize(text) {

        return text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);
    }


    findHeadings(lines) {

        const found = [];

        lines.forEach((line, index) => {

            const normalized =
                this.normalizeHeading(line);

            for (const definition of this.sectionDefinitions) {

                const match =
                    definition.titles.some(title =>
                        normalized === title ||
                        normalized.startsWith(title)
                    );

                if (match) {

                    found.push({
                        name: definition.name,
                        index,
                        title: line
                    });

                    break;
                }
            }
        });

        return found;
    }


    normalizeHeading(value) {

        return value
            .toLowerCase()
            .replace(/[.:!?]/g, "")
            .trim();
    }
}