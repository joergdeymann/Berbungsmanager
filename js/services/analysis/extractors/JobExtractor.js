import { MoneyExtractor } from "./MoneyExtractor.js";

export class JobExtractor {
    constructor(lines) {
        this.lines = lines;
    }

    // JobExtractor.js
    extractJob() {
        const money = new MoneyExtractor(this.lines).extractMoney();
        return {
            salary: money.salary,
            vacationPay: money.vacationPay,
            christmasPay: money.christmasPay,
            workModel: "",
            tasks: [],
            tags: [],
            title: "",
            referenceNumber: "",
            employmentType: "",
        }
    }
}
