const db = require('../../db');
const { analyseParam, analyseParamWithOption } = require('../../public/scripts/analysis.js');

// class Chart encapsulates a chart
module.exports = class Chart {

    // constructor for all Charts
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

    // save chart into database
    async persist(dbNewFunction) {
        try {
            let rowCount = await dbNewFunction(this);
            if (rowCount == 0)
                console.log('WARNING: Chart has not been persisted!');
            else
                this.persisted = true;
        } catch (err) {
            console.log('ERROR: persisting chart data: ' + JSON.stringify(this));
            throw err;
        }
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

    // update chart data
    async updateChartData(dbUpdateChartMethod) {
        try {
            let rowCount = await dbUpdateChartMethod(this);
            if (rowCount == 0)
                console.log('WARNING: chart has not been updated!');
        } catch (err) {
            console.log('ERROR: updating chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // sends param to a check function and returns its' value
    sendParam(checkFunction, key, param1, param2) {
        let param;
        if (!param2) {
            param = analyseParam(param1, checkFunction);
        } else {
            param = analyseParamWithOption(param1, param2, checkFunction);
        }
        // if param is null, undefined or empty => add to missingParams of this chart
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