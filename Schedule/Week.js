class ThisWeek {
    constructor(_Today) {
        // 設定該日期為本週的某一天
        let dayOfWeek = _Today.getDay();
        let diff = _Today.getDate() - dayOfWeek;
        this.WeekStart = new Date(_Today.setDate(diff-1));
        this.WeekEnd = new Date(_Today.setDate(diff+6));
    }

    // 切換到前一個月
    Previous() {
        this.WeekStart.setDate(this.WeekStart.getDate()-7);
        this.WeekEnd.setDate(this.WeekEnd.getDate()-7);
        return [this.WeekStart, this.WeekEnd];
    }

    // 切換到下一個月
    Next() {
        this.WeekStart.setDate(this.WeekStart.getDate()+7);
        this.WeekEnd.setDate(this.WeekEnd.getDate()+7);
        return [this.WeekStart, this.WeekEnd];
    }

    // 獲取當前的 MonthStart 和 MonthEnd
    get() {
        return [this.WeekStart, this.WeekEnd];
    }
    getWeekStart() {
        return this.WeekStart;
    }
    getWeekEnd() {
        return this.WeekEnd;
    }
}
