class EndOfMonth {
    constructor(_MonthStart, _MonthEnd) {
        this.MonthStart = _MonthStart;
        this.MonthEnd = _MonthEnd;
        this.updateDomainStop();
    }

    // 更新 MonthEnd 為該月的最後一天
    updateDomainStop() {
        this.MonthEnd = new Date(this.MonthStart.getFullYear(), this.MonthStart.getMonth() + 1, 0);
    }

    // 切換到前一個月
    Previous() {
        this.MonthStart.setMonth(this.MonthStart.getMonth() - 1);
        this.MonthStart.setDate(1); // 重設為該月的第一天以防溢出
        this.updateDomainStop(); // 更新 MonthEnd 為正確的最後一天
        return [this.MonthStart, this.MonthEnd];
    }

    // 切換到下一個月
    Next() {
        this.MonthStart.setMonth(this.MonthStart.getMonth() + 1);
        this.MonthStart.setDate(1); // 重設為該月的第一天以防溢出
        this.updateDomainStop(); // 更新 MonthEnd 為正確的最後一天
        return [this.MonthStart, this.MonthEnd];
    }

    // 獲取當前的 MonthStart 和 MonthEnd
    get() {
        return [this.MonthStart, this.MonthEnd];
    }
}
