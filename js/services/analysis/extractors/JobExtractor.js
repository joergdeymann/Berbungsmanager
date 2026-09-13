import { MoneyExtractor } from "./MoneyExtractor.js";

export class JobExtractor {
    constructor(lines) {
        this.lines = lines;
    }

    extractJob() {
        const money = MoneyExtractor(addressContent).extractMoney();
        return {
            salery: money.salery,
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
