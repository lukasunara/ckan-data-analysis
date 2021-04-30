const db = require('../../db');
const Chart = require('./ChartModel');

// class InteroperabilityChart encapsulates an interoperability chart
module.exports = class InteroperabilityChart extends Chart {

    // constructor for InteroperabilityChart
    constructor(chart_id, object_id, maxPoints, earnedPoints,
        format, formatDiversity, compatibility, machineReadable
    ) {
        super(chart_id, object_id, maxPoints, earnedPoints);
        this.format = format;
        this.formatDiversity = formatDiversity;
        this.compatibility = compatibility;
        this.machineReadable = machineReadable;
    }

    // save chart into database
    async persist() {
        try {
            let rowCount = await dbNewAccessibility(this);
            if (rowCount == 0)
                console.log('WARNING: Interoperability chart has not been persisted!');
            else
                this.persisted = true;
        } catch (err) {
            console.log('ERROR: persisting interoperability chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // update chart data
    async updateChartData(earnedPoints, format, formatDiversity, compatibility, machineReadable) {
        try {
            let rowCount = await dbUpdateChart(this.chart_id,
                earnedPoints, format, formatDiversity, compatibility, machineReadable
            );
            if (rowCount == 0)
                console.log('WARNING: Interoperability chart has not been updated!');
            else {
                this.format = format;
                this.formatDiversity = formatDiversity;
                this.compatibility = compatibility;
                this.downloadURL = machineReadable;
            }
        } catch (err) {
            console.log('ERROR: updating interoperability chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

};

// inserting a new accessibility chart into database
dbNewChart = async (chart) => {
    const sql = `INSERT INTO accessibility (object_id, maxPoints, earnedPoints,
        format, formatDiversity, compatibility, machineReadable) VALUES ('$1', '$2', '$3',
        '$4', '$5', '$6', '$7');`;
    const values = [
        chart.object_id, chart.maxPoints, chart.earnedPoints, chart.format,
        chart.formatDiversity, chart.compatibility, chart.machineReadable
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
dbUpdateChart = async (chart_id, earnedPoints, format,
    formatDiversity, compatibility, machineReadable
) => {
    const sql = `UPDATE interoperability
                    SET earnedPoints = '${earnedPoints}',
                        format = '${format}',
                        formatDiversity = '${formatDiversity}',
                        compatibility = '${compatibility}',
                        machineReadable = '${machineReadable}'
                    WHERE chart_id = '${chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};