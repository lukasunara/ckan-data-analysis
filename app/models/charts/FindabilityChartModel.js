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

    // constructor for FindabilityChart
    constructor(chart_id, object_id, missingParams, identification, keywords, categories, state) {
        super(chart_id, object_id, missingParams);
        this.identification = identification;
        this.keywords = keywords;
        this.categories = categories;
        this.state = state;

        this.maxPointsID = 0;
        this.maxPointsKeywords = 0;
        this.maxPointsCategories = 0;
        this.maxPointsState = 0;
    }

    // creates a new empty FindabilityChart
    static createEmptyFindability(object_id) {
        return new FindabilityChart(undefined, object_id, new Set(), 0, 0, 0, 0);
    }

    // gets maximum of points an object could have received
    getMaxPoints() {
        return this.maxPointsID + this.maxPointsKeywords + this.maxPointsCategories + this.maxPointsState;
    }

    // gets number of points an object has earned
    getEarnedPoints() {
        return this.identification + this.keywords + this.categories + this.state;
    }

    // save chart into database
    async persist() {
        super.persist(dbNewFindabilityChart);
    }

    // fetch chart from database for given object id
    static async fetchChartByID(object_id) {
        let result = await dbGetFindability(object_id);

        let findChart = null;
        if (result) {
            findChart = new FindabilityChart(
                result.chart_id, result.object_id, result.missingParams,
                result.identification, result.keywords, result.categories, result.state
            );
            findChart.persisted = true;
        }
        return findChart;
    }

    /*// update chart data
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
    } */
    async updateChartData() {
        super.updateChartData(dbUpdateFindability);
    }

    // checks if identification exists
    checkIdentification(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.identification++; //if exists, add 1 point
        }
    }

    // checks number od keywords
    checkKeywords(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        // points in range [0, 3]
        if (param) {
            let points = param >= 3 ? 3 : param;
            this.keywords += points;
        }
    }

    // checks if categories exist
    checkCategories(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.categories++; //if exists, add 1 point
        }
    }

    // checks if state field exists
    checkState(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.state++; //if exists, add 1 point
        }
    }
};

// inserting a new findability chart into database
dbNewFindabilityChart = async (chart) => {
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

// updating findability chart data in database
dbUpdateFindability = async (chart) => {
    const sql = `UPDATE findability
                    SET missingParams = '${chart.missingParams}',
                        identification = '${chart.identification}',
                        keywords = '${chart.keywords}',
                        categories = '${chart.categories}',
                        state = '${chart.state}'
                    WHERE chart_id = '${chart.chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

dbGetFindability = async (object_id) => {
    const sql = `SELECT * FROM findability WHERE object_id = '${object_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
};