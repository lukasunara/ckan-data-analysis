const db = require('../../db');
const Chart = require('./ChartModel');

// class FindabilityChart encapsulates a findability chart
module.exports = class FindabilityChart extends Chart {
    // max number of points for each indicator of evaluation
    static weightID = 30;
    static weightKeywords = 30;
    static weightCategories = 30;
    static weightState = 10;

    static maxIdentification = 3;
    static maxIdentificationPortal = 2;
    static maxKeywords = 3;
    static maxCategories = 1;
    static maxState = 1;
    static maxStateOrganization = 2;

    // constructor for FindabilityChart
    constructor(data) {
        super(data.chart_id, data.object_id, data.missing_params);
        this.darkColor = '#1b6b3d';
        this.lightColor = '#71c495';

        this.identification = data.identification;
        this.max_id = data.max_id;
        this.keywords = data.keywords;
        this.max_key = data.max_key;
        this.categories = data.categories;
        this.max_cat = data.max_cat;
        this.state = data.state;
        this.max_state = data.max_state;
    }

    // creates a new empty FindabilityChart
    static createEmptyFindability(object_id) {
        return new FindabilityChart({
            chart_id: undefined,
            object_id: object_id,
            missing_params: new Set(),
            identification: 0,
            max_id: 0,
            keywords: 0,
            max_key: 0,
            categories: 0,
            max_cat: 0,
            state: 0,
            max_state: 0
        });
    }

    // gets maximum of points an object could have received
    getMaxPoints() {
        return this.max_id + this.max_key + this.max_cat + this.max_state;
    }

    // gets number of points an object has earned
    getEarnedPoints() {
        return this.identification + this.keywords + this.categories + this.state;
    }

    // gets total weight of findability charts
    getTotalWeight() {
        let wID = this.max_id == 0 ? 0 : FindabilityChart.weightID;
        let wKeywords = this.max_key == 0 ? 0 : FindabilityChart.weightKeywords;
        let wCategories = this.max_cat == 0 ? 0 : FindabilityChart.weightCategories;
        let wState = this.max_state == 0 ? 0 : FindabilityChart.weightState;

        return wID + wKeywords + wCategories + wState;
    }

    // gets earned weight of this chart
    getEarnedWeight() {
        let earnedWID = this.max_id == 0 ? 0 : (
            this.identification / this.max_id * FindabilityChart.weightID
        );
        let earnedWKeywords = this.max_key == 0 ? 0 : (
            this.keywords / this.max_key * FindabilityChart.weightKeywords
        );
        let earnedWCategories = this.max_cat == 0 ? 0 : (
            this.categories / this.max_cat * FindabilityChart.weightCategories
        );
        let earnedWState = this.max_state == 0 ? 0 : (
            this.state / this.max_state * FindabilityChart.weightState
        );

        return earnedWID + earnedWKeywords + earnedWCategories + earnedWState;
    }

    // sets all points to zero
    reset() {
        this.identification = 0;
        this.max_id = 0;
        this.keywords = 0;
        this.max_key = 0;
        this.categories = 0;
        this.max_cat = 0;
        this.state = 0;
        this.max_state = 0;
    }

    // reduces points by other chart values
    reduce(other) {
        this.identification -= other.identification;
        this.max_id -= other.max_id;
        this.keywords -= other.keywords;
        this.max_key -= other.max_key;
        this.categories -= other.categories;
        this.max_cat -= other.max_cat;
        this.state -= other.state;
        this.max_state -= other.max_state;
    }

    // adds points from other chart values
    add(other) {
        this.identification += other.identification;
        this.max_id += other.max_id;
        this.keywords += other.keywords;
        this.max_key += other.max_key;
        this.categories += other.categories;
        this.max_cat += other.max_cat;
        this.state += other.state;
        this.max_state += other.max_state;
    }

    // fetch chart from database for given object id
    static async fetchChartByID(object_id) {
        let result = await dbGetFindability(object_id);

        let findChart = null;
        if (result) {
            result.missing_params = new Set(result.missing_params.split(' '));
            findChart = new FindabilityChart(result);
            findChart.persisted = true;
        }
        return findChart;
    }

    isPersisted() {
        return super.isPersisted();
    }

    // save chart into database
    async persist() {
        await super.persist(dbNewFindabilityChart);
    }

    // update chart data
    async updateChartData() {
        await super.updateChartData(dbUpdateFindability);
    }

    // checks if identification exists
    checkIdentification(checkFunction, key, param1, param2) {
        let param = super.sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.identification++; //if exists, add 1 point
        }
    }

    // checks number od keywords
    checkKeywords(numOfKeywords) {
        // points in range [0, 3]
        if (numOfKeywords > 0) {
            this.keywords += numOfKeywords >= 3 ? 3 : numOfKeywords;
        } else {
            this.missing_params.add('keywords');
        }
    }

    // checks if categories exist
    checkCategories(checkFunction, key, param1, param2) {
        let param = super.sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.categories++; //if exists, add 1 point
        }
    }

    // checks if state field exists
    checkState(checkFunction, key, param1, param2) {
        let param = super.sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.state++; //if exists, add 1 point
        }
    }
};

// inserts a new findability chart into database
var dbNewFindabilityChart = async (chart, missingParams) => {
    const sql = `INSERT INTO findability (object_id, missing_params, identification, max_id,
                    keywords, max_key, categories, max_cat, state, max_state) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`;
    const values = [
        chart.object_id, missingParams, chart.identification, chart.max_id, chart.keywords,
        chart.max_key, chart.categories, chart.max_cat, chart.state, chart.max_state
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updates findability chart data in database
var dbUpdateFindability = async (chart, missingParams) => {
    const sql = `UPDATE findability
                    SET missing_params = $2, identification = $3, max_id = $4, keywords = $5,
                        max_key = $6, categories = $7, max_cat = $8, state = $9, max_state = $10
                    WHERE chart_id = $1;`;
    const values = [
        chart.chart_id, missingParams, chart.identification, chart.max_id, chart.keywords,
        chart.max_key, chart.categories, chart.max_cat, chart.state, chart.max_state
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// gets findability chart from database
var dbGetFindability = async (object_id) => {
    const sql = `SELECT * FROM findability WHERE object_id = '${object_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
};