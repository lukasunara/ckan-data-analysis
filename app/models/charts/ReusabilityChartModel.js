const db = require('../../db');
const Chart = require('./ChartModel');

// class ReusabilityChart encapsulates an reusability chart
module.exports = class ReusabilityChart extends Chart {

    // constructor for ReusabilityChart
    constructor(chart_id, object_id, maxPoints, earnedPoints,
        license, basicInfo, extras, publisher
    ) {
        super(chart_id, object_id, maxPoints, earnedPoints);
        this.license = license;
        this.basicInfo = basicInfo;
        this.extras = extras;
        this.publisher = publisher;
    }

    // save chart into database
    async persist() {
        try {
            let rowCount = await dbNewAccessibility(this);
            if (rowCount == 0)
                console.log('WARNING: reusability chart has not been persisted!');
            else
                this.persisted = true;
        } catch (err) {
            console.log('ERROR: persisting reusability chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // update chart data
    async updateChartData(earnedPoints, license, basicInfo, extras, publisher) {
        try {
            let rowCount = await dbUpdateChart(this.chart_id,
                earnedPoints, license, basicInfo, extras, publisher
            );
            if (rowCount == 0)
                console.log('WARNING: reusability chart has not been updated!');
            else {
                this.license = license;
                this.basicInfo = basicInfo;
                this.extras = extras;
                this.publisher = publisher;
            }
        } catch (err) {
            console.log('ERROR: updating reusability chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

};

// inserting a new accessibility chart into database
dbNewChart = async (chart) => {
    const sql = `INSERT INTO accessibility (object_id, maxPoints, earnedPoints,
        license, basicInfo, extras, publisher) VALUES ('$1', '$2', '$3', '$4',
        '$5', '$6', '$7');`;
    const values = [
        chart.object_id, chart.maxPoints, chart.earnedPoints,
        chart.license, chart.basicInfo, chart.extras, chart.publisher
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
dbUpdateChart = async (chart_id, earnedPoints, license, basicInfo, extras, publisher) => {
    const sql = `UPDATE reusability
                    SET earnedPoints = '${earnedPoints}',
                        license = '${license}',
                        basicInfo = '${basicInfo}',
                        extras = '${extras}',
                        publisher = '${publisher}'
                    WHERE chart_id = '${chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};