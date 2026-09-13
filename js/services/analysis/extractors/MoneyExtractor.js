// MoneyExtractor.js
export class MoneyExtractor {
    constructor(lines) {
        this.lines = lines;
    }

    extractMoney() {
        return {
            salary: this.extractSalary(),
            vacationPay: this.extractVacationPay(),
            christmasPay: this.extractChristmasPay(),
        }
    }

    extractSalary() {
    }

    extractVacationPay() {
    }

    extractChristmasPay() {
    }
}