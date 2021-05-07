const db = require('../../db');
const Chart = require('./ChartModel');

// class FindabilityChart encapsulates a findability chart
module.exports = class FindabilityChart extends Chart {
    // max number of points for each category of evaluation
    static maxIdentification = 3;
    static maxIdentificationPortal = 1;
    static maxKeywords = 3;
    static maxCategories = 1;
    static maxState = 1;
    static maxStateOrganization = 2;

    // empty constructor
    constructor() {
        super();
        this.identification = 0;
        this.keywords = 0;
        this.categories = 0;
        this.state = 0;
    }

    // constructor for FindabilityChart
    constructor(chart_id, object_id, missingParams, identification, keywords, categories, state) {
        super(chart_id, object_id, missingParams);
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
    async updateChartData(missingParams, identification, keywords, categories, state) {
        try {
            let rowCount = await dbUpdateChart(this.chart_id,
                missingParams, identification, keywords, categories, state
            );
            if (rowCount == 0)
                console.log('WARNING: Findability chart has not been updated!');
            else {
                this.missingParams = missingParams;
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

    checkIdentification(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.identification++;
        }
    }

    checkKeywords(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            let points = param >= 3 ? 3 : param;
            this.keywords += points;
        }
    }

    checkCategories(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.categories++;
        }
    }

    checkState(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.state++;
        }
    }
};

// inserting a new findability chart into database
dbNewChart = async (chart) => {
    const sql = `INSERT INTO findability (object_id, missingParams, identification,
        keywords, categories, state) VALUES ('$1', '$2', '$3', '$4', '$5', '$6');`;
    const values = [
        chart.object_id, chart.missingParams, chart.identification,
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
dbUpdateChart = async (chart_id, missingParams, identification, keywords, categories, state) => {
    const sql = `UPDATE findability
                    SET missingParams = '${missingParams}',
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