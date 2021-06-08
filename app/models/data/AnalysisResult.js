const FindabilityChart = require('../charts/FindabilityChartModel');
const AccessibilityChart = require('../charts/AccessibilityChartModel');
const InteroperabilityChart = require('../charts/InteroperabilityChartModel');
const ReusabilityChart = require('../charts/ReusabilityChartModel');
const ContextualityChart = require('../charts/ContextualityChartModel');

// class AnalysisResult represents results of an analysis
module.exports = class AnalysisResult {

    // constructor for AnalysisResult
    constructor(object_id, charts) {
        this.findChart = charts.findChart ? charts.findChart : FindabilityChart.createEmptyFindability(object_id);
        this.accessChart = charts.accessChart ? charts.accessChart : AccessibilityChart.createEmptyAccessibility(object_id);
        this.interChart = charts.interChart ? charts.interChart : InteroperabilityChart.createEmptyInteroperability(object_id);
        this.reuseChart = charts.reuseChart ? charts.reuseChart : ReusabilityChart.createEmptyReusability(object_id);
        this.contextChart = charts.contextChart ? charts.contextChart : ContextualityChart.createEmptyContextuality(object_id);
    }

    // creates a new AnalysisResult object
    static async createAnalysisResult(object_id) {
        let charts = await AnalysisResult.fetchChartsFromDB(object_id);

        return new AnalysisResult(object_id, charts);
    }

    // fetches charts from database for given object
    static async fetchChartsFromDB(object_id) {
        return {
            findChart: await FindabilityChart.fetchChartByID(object_id),
            accessChart: await AccessibilityChart.fetchChartByID(object_id),
            interChart: await InteroperabilityChart.fetchChartByID(object_id),
            reuseChart: await ReusabilityChart.fetchChartByID(object_id),
            contextChart: await ContextualityChart.fetchChartByID(object_id)
        }
    }

    // updates all chart data in database
    async updateDataInDB() {
        await this.updateChart(this.findChart);
        await this.updateChart(this.accessChart);
        await this.updateChart(this.interChart);
        await this.updateChart(this.reuseChart);
        await this.updateChart(this.contextChart);
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
        this.findChart.earnedWeight = this.findChart.getEarnedWeight();
        this.accessChart.earnedWeight = this.accessChart.getEarnedWeight();
        this.interChart.earnedWeight = this.interChart.getEarnedWeight();
        this.reuseChart.earnedWeight = this.reuseChart.getEarnedWeight();
        this.contextChart.earnedWeight = this.contextChart.getEarnedWeight();

        let totalEarnedWeight = this.findChart.earnedWeight + this.accessChart.earnedWeight
            + this.interChart.earnedWeight + this.reuseChart.earnedWeight
            + this.contextChart.earnedWeight;

        let totalWeightFind = this.findChart.getTotalWeight();
        let totalWeightAccess = this.accessChart.getTotalWeight();
        let totalWeightInter = this.interChart.getTotalWeight();
        let totalWeightReuse = this.reuseChart.getTotalWeight();
        let totalWeightContext = this.contextChart.getTotalWeight();

        let totalWeight = totalWeightFind + totalWeightAccess + totalWeightInter
            + totalWeightReuse + totalWeightContext;

        let percentageTotal = totalEarnedWeight / totalWeight * 100;
        let grade = null;
        if (percentageTotal >= 91) {
            grade = 'EXCELLENT';
        } else if (percentageTotal >= 77) {
            grade = 'VERY GOOD';
        } else if (percentageTotal >= 52) {
            grade = 'GOOD';
        } else if (percentageTotal >= 36) {
            grade = 'BAD';
        } else {
            grade = 'VERY BAD';
        }
        return { percentage: percentageTotal, grade: grade, max: totalWeight, earned: totalEarnedWeight }
    }

    // sets all chart values to zero
    reset() {
        this.findChart.reset();
        this.accessChart.reset();
        this.interChart.reset();
        this.reuseChart.reset();
        this.contextChart.reset();
    }

    reduce(other) {
        this.findChart.reduce(other.findChart);
        this.accessChart.reduce(other.accessChart);
        this.interChart.reduce(other.interChart);
        this.reuseChart.reduce(other.reuseChart);
        this.contextChart.reduce(other.contextChart);
    }

    add(other) {
        this.findChart.add(other.findChart);
        this.accessChart.add(other.accessChart);
        this.interChart.add(other.interChart);
        this.reuseChart.add(other.reuseChart);
        this.contextChart.add(other.contextChart);
    }

    isEmpty() {
        this.findChart.maxPoints = this.findChart.getMaxPoints();
        this.accessChart.maxPoints = this.accessChart.getMaxPoints();
        this.interChart.maxPoints = this.interChart.getMaxPoints();
        this.reuseChart.maxPoints = this.reuseChart.getMaxPoints();
        this.contextChart.maxPoints = this.contextChart.getMaxPoints();

        let maxPoints = this.findChart.maxPoints + this.accessChart.maxPoints
            + this.interChart.maxPoints + this.reuseChart.maxPoints
            + this.contextChart.maxPoints;

        return maxPoints == 0;
    }
};