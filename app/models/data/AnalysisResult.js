const FindabilityChart = require('./FindabilityChartModel');
const AccessibilityChart = require('./AccessibilityChartModel');
const InteroperabilityChart = require('./InteroperabilityChartModel');
const ReusabilityChart = require('./ReusabilityChartModel');
const ContextualityChart = require('./ContextualityChartModel');

// class AnalysisResult represents results of an analysis
module.exports = class AnalysisResult {

    // constructor for AnalysisResult
    constructor(object_id) {
        await this.fetchChartsFromDB(object_id);

        if (!this.findChart) this.findChart = FindabilityChart.createEmptyFindability(object_id);
        if (!this.accessChart) this.accessChart = AccessibilityChart.createEmptyAccessibility(object_id);
        if (!this.interChart) this.interChart = InteroperabilityChart.createEmptyInteroperability(object_id);
        if (!this.reuseChart) this.reuseChart = ReusabilityChart.createEmptyReusability(object_id);
        if (!this.contextChart) this.contextChart = ContextualityChart.createEmptyContextuality(object_id);
    }

    // fetches charts from database for given object
    async fetchChartsFromDB(object_id) {
        this.findChart = await FindabilityChart.fetchChartByObjectID(object_id);
        this.accessChart = await AccessibilityChart.fetchChartByObjectID(object_id);
        this.interChart = await InteroperabilityChart.fetchChartByObjectID(object_id);
        this.reuseChart = await ReusabilityChart.fetchChartByObjectID(object_id);
        this.contextChart = await ContextualityChart.fetchChartByObjectID(object_id);
    }

    // updates all chart data in database
    async updateDataInDb() {
        updateChart(this.findChart);
        updateChart(this.accessChart);
        updateChart(this.interChart);
        updateChart(this.reuseChart);
        updateChart(this.contextChart);
    }

    // updates/persists chart in database
    async updateChart(chart) {
        if (chart.isPersisted()) {
            await chart.updateChartData();
        } else {
            await chart.persist();
        }
    }

    // calculates overall rating
    getOverallRating() {
        let maxPoints = this.findChart.getMaxPoints() + this.accessChart.getMaxPoints()
            + this.interChart.getMaxPoints() + this.reuseChart.getMaxPoints()
            + this.contextChart.getMaxPoints();

        let earnedPoints = this.findChart.getEarnedPoints() + this.accessChart.getEarnedPoints()
            + this.interChart.getEarnedPoints() + this.reuseChart.getEarnedPoints()
            + this.contextChart.getEarnedPoints();

        let percentage = earnedPoints / maxPoints * 100;
        let grade = null;
        if (percentage >= 91) {
            grade = 'EXCELLENT';
        } else if (percentage >= 77) {
            grade = 'VERY GOOD';
        } else if (percentage >= 52) {
            grade = 'GOOD';
        } else if (percentage >= 36) {
            grade = 'BAD';
        } else {
            grade = 'VERY BAD';
        }
        return { percentage: percentage, grade: grade }
    }
};