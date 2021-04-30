const db = require('../../db');
const Chart = require('./ChartModel');

// class ContextualityChart encapsulates an contextuality chart
module.exports = class ContextualityChart extends Chart {

    // constructor for ContextualityChart
    constructor(chart_id, object_id, maxPoints, earnedPoints,
        numOfResources, fileSize, emptyData, dateOfIssue, modificationDate
    ) {
        super(chart_id, object_id, maxPoints, earnedPoints);
        this.numOfResources = numOfResources;
        this.fileSize = fileSize;
        this.emptyData = emptyData;
        this.dateOfIssue = dateOfIssue;
        this.modificationDate = modificationDate;
    }

    // save chart into database
    async persist() {
        try {
            let rowCount = await dbNewAccessibility(this);
            if (rowCount == 0)
                console.log('WARNING: contextuality chart has not been persisted!');
            else
                this.persisted = true;
        } catch (err) {
            console.log('ERROR: persisting contextuality chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // update chart data
    async updateChartData(earnedPoints, numOfResources, fileSize,
        emptyData, dateOfIssue, modificationDate
    ) {
        try {
            let rowCount = await dbUpdateChart(this.chart_id, earnedPoints,
                numOfResources, fileSize, emptyData, dateOfIssue, modificationDate
            );
            if (rowCount == 0)
                console.log('WARNING: contextuality chart has not been updated!');
            else {
                this.numOfResources = numOfResources;
                this.fileSize = fileSize;
                this.emptyData = emptyData;
                this.dateOfIssue = dateOfIssue;
                this.modificationDate = modificationDate;
            }
        } catch (err) {
            console.log('ERROR: updating contextuality chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

};

// inserting a new accessibility chart into database
dbNewChart = async (chart) => {
    const sql = `INSERT INTO contextuality (object_id, maxPoints, earnedPoints,
        numOfResources, fileSize, emptyData, dateOfIssue, modificationDate) VALUES (
        '$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8');`;
    const values = [
        chart.object_id, chart.maxPoints, chart.earnedPoints, chart.numOfResources,
        chart.fileSize, chart.emptyData, chart.dateOfIssue, chart.modificationDate
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
dbUpdateChart = async (chart_id, earnedPoints,
    numOfResources, fileSize, emptyData, dateOfIssue, modificationDate
) => {
    const sql = `UPDATE contextuality
                    SET earnedPoints = '${earnedPoints}',
                        numOfResources = '${numOfResources}',
                        fileSize = '${fileSize}',
                        emptyData = '${emptyData}',
                        dateOfIssue = '${dateOfIssue}',
                        modificationDate = '${modificationDate}'
                    WHERE chart_id = '${chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};