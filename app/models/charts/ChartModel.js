const db = require('../../db');
const { analyseParam, analyseParamWithOption } = require('../../public/scripts/analysis.js');

// class Chart encapsulates a chart
module.exports = class Chart {

    constructor() {
        if (this.constructor === Chart) {
            throw new TypeError('Abstract class "Chart" cannot be instantiated directly.');
        }
        this.missingParams = new Set();
        this.persisted = false;
    }

    constructor(chart_id, object_id, missingParams) {
        if (this.constructor === Chart) {
            throw new TypeError('Abstract class "Chart" cannot be instantiated directly.');
        }
        this.chart_id = chart_id;
        this.object_id = object_id;
        this.missingParams = missingParams;
        this.persisted = false;
    }

    // has chart been saved into database?
    isPersisted() {
        return this.persisted;
    }

    // delete this chart from database
    async deleteChart() {
        try {
            let rowCount = await dbDeleteChart(this);
            if (rowCount == 0)
                console.log('WARNING: Chart has not been deleted!');
        } catch (err) {
            console.log('ERROR: deleting chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

    sendParam(checkFunction, key, param1, param2) {
        let param;
        if (!param2) {
            param = analyseParam(param1, checkFunction);
        } else {
            param = analyseParamWithOption(param1, param2, checkFunction);
        }
        if (!param) {
            this.missingParams.add(key);
        }
        return param;
    }
};

// delete a chart from database
dbDeleteChart = async (chart) => {
    const sql = `DELETE FROM chart WHERE chart_id = '${chart.chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};