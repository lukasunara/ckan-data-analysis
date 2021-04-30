const db = require('../../db');
const Chart = require('./ChartModel');

// class FindabilityChart encapsulates a findability chart
module.exports = class FindabilityChart extends Chart {

    // constructor for FindabilityChart
    constructor(chart_id, object_id, maxPoints, earnedPoints,
        identification, keywords, categories, state
    ) {
        super(chart_id, object_id, maxPoints, earnedPoints);
        this.identification = identification;
        this.keywords = keywords;
        this.categories = categories;
        this.state = state;
    }

    // save chart into database
    async persist() {
        try {
            let rowCount = await dbNewFindability(this);
            if (rowCount == 0)
                console.log('WARNING: Findability chart has not been persisted!');
            else
                this.persisted = true;
        } catch (err) {
            console.log('ERROR: persisting findability chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // update chart data
    async updateChartData(earnedPoints, identification, keywords, categories, state) {
        try {
            let rowCount = await dbUpdateChart(this.chart_id,
                earnedPoints, identification, keywords, categories, state
            );
            if (rowCount == 0)
                console.log('WARNING: Findability chart has not been updated!');
            else {
                this.identification = identification;
                this.keywords = keywords;
                this.categories = categories;
                this.state = state;
            }
        } catch (err) {
            console.log('ERROR: updating findability chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

};

// inserting a new findability chart into database
dbNewChart = async (chart) => {
    const sql = `INSERT INTO findability (object_id, maxPoints, earnedPoints,
        identification, keywords, categories, state) VALUES ('$1', '$2', '$3',
        '$4', '$5', '$6', '$7');`;
    const values = [
        chart.object_id, chart.maxPoints, chart.earnedPoints, chart.identification,
        chart.keywords, chart.categories, chart.state,
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
dbUpdateChart = async (chart_id, earnedPoints, identification, keywords, categories, state) => {
    const sql = `UPDATE findability
                    SET earnedPoints = '${earnedPoints}',
                        identification = '${identification}',
                        keywords = '${keywords}',
                        categories = '${categories}',
                        state = '${state}'
                    WHERE chart_id = '${chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};