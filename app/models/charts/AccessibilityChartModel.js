const db = require('../../db');
const Chart = require('./ChartModel');

// class AccessibilityChart encapsulates an accessibility chart
module.exports = class AccessibilityChart extends Chart {

    // constructor for AccessibilityChart
    constructor(chart_id, object_id, maxPoints, earnedPoints,
        datasetAccessibility, urlAccessibility, downloadURL
    ) {
        super(chart_id, object_id, maxPoints, earnedPoints);
        this.datasetAccessibility = datasetAccessibility;
        this.urlAccessibility = urlAccessibility;
        this.downloadURL = downloadURL;
    }

    // save chart into database
    async persist() {
        try {
            let rowCount = await dbNewAccessibility(this);
            if (rowCount == 0)
                console.log('WARNING: Accessibility chart has not been persisted!');
            else
                this.persisted = true;
        } catch (err) {
            console.log('ERROR: persisting accessibility chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // update chart data
    async updateChartData(earnedPoints, datasetAccessibility, urlAccessibility, downloadURL) {
        try {
            let rowCount = await dbUpdateChart(this.chart_id,
                earnedPoints, datasetAccessibility, urlAccessibility, downloadURL
            );
            if (rowCount == 0)
                console.log('WARNING: Accessibility chart has not been updated!');
            else {
                this.datasetAccessibility = datasetAccessibility;
                this.urlAccessibility = urlAccessibility;
                this.downloadURL = downloadURL;
            }
        } catch (err) {
            console.log('ERROR: updating accessibility chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

};

// inserting a new accessibility chart into database
dbNewChart = async (chart) => {
    const sql = `INSERT INTO accessibility (object_id, maxPoints, earnedPoints,
        datasetAccessibility, urlAccessibility, downloadURL) VALUES ('$1', '$2', '$3',
        '$4', '$5', '$6');`;
    const values = [
        chart.object_id, chart.maxPoints, chart.earnedPoints,
        chart.datasetAccessibility, chart.urlAccessibility, chart.downloadURL
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updating chart data in database
dbUpdateChart = async (chart_id, earnedPoints, datasetAccessibility, urlAccessibility, downloadURL) => {
    const sql = `UPDATE accessibility
                    SET earnedPoints = '${earnedPoints}',
                        datasetAccessibility = '${datasetAccessibility}',
                        urlAccessibility = '${urlAccessibility}',
                        downloadURL = '${downloadURL}'
                    WHERE chart_id = '${chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};