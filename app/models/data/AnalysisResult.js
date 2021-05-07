const FindabilityChart = require('./FindabilityChartModel');
const AccessibilityChart = require('./AccessibilityChartModel');
const InteroperabilityChart = require('./InteroperabilityChartModel');
const ReusabilityChart = require('./ReusabilityChartModel');
const ContextualityChart = require('./ContextualityChartModel');

// class AnalysisResult represents results of an analysis
module.exports = class AnalysisResult {

    // constructor for AnalysisResult
    constructor() {
        this.findChart = new FindabilityChart();
        this.accessChart = new AccessibilityChart();
        this.interChart = new InteroperabilityChart();
        this.reuseChart = new ReusabilityChart();
        this.contextChart = new ContextualityChart();
    }
}