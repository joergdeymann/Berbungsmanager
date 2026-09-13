export class MoneyExtractor {
    constructor(lines) {
        this.lines = lines;
    }

    extractMoney() {
        return {
            salery: this.extractSalery(),
            vacationPay: this.extractVacationPay(),
            christmasPay: this.extractChristmasPay(),
        }
    }

    extractSalery() {
    }

    extractVacationPay() {
    }

    extractChristmasPay() {
    }
}