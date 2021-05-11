const db = require('../../db');
const FindabilityChart = require('../charts/FindabilityChartModel');
const AccessibilityChart = require('../charts/AccessibilityChartModel');
const InteroperabilityChart = require('../charts/InteroperabilityChartModel');
const ReusabilityChart = require('../charts/ReusabilityChartModel');
const ContextualityChart = require('../charts/ContextualityChartModel');

// class RateableObject encapsulates a rateable object
module.exports = class RateableObject {

    constructor(object_id) {
        if (this.constructor === RateableObject) {
            throw new TypeError('Abstract class "RateableObject" cannot be instantiated directly.');
        }
        this.object_id = object_id;
        this.persisted = false;
    }

    // has object been saved into database?
    isPersisted() {
        return this.persisted;
    }

    // save resource into database
    async persist(dbNewFunction) {
        try {
            let rowCount = await dbNewFunction(this);
            if (rowCount == 0)
                console.log('WARNING: RateableObject has not been persisted!');
            else
                this.persisted = true;
        } catch (err) {
            console.log('ERROR: persisting RateableObject data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // delete this rateable object from database
    async deletePortal() {
        try {
            let rowCount = await dbDeleteRateableObject(this);
            if (rowCount == 0)
                console.log('WARNING: Rateable object has not been deleted!');
        } catch (err) {
            console.log('ERROR: deleting rateable object data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // fetches a specific chart from database
    async fetchSpecificChart(chartType) {
        let result = await dbGetSpecificChart(chartType, object_id);

        let newChart;
        switch (chartType) {
            case 'findability': {
                newChart = new FindabilityChart(result.chart_id,
                    result.object_id, result.missingParams, result.identification,
                    result.keywords, result.categories, result.state
                );
                break;
            }
            case 'accessibility': {
                newChart = new AccessibilityChart(result.chart_id,
                    result.object_id, result.missingParams, result.datasetAccessibility,
                    result.urlAccessibility, result.downloadURL

                );
                break;
            }
            case 'interoperability': {
                newChart = new InteroperabilityChart(result.chart_id, result.object_id,
                    result.missingParams, result.format, result.formatDiversity,
                    result.compatibility, result.machineReadable, result.linkedOpenData

                );
                break;
            }
            case 'reusability': {
                newChart = new ReusabilityChart(result.chart_id,
                    result.object_id, result.missingParams, result.license,
                    result.basicInfo, result.extras, result.publisher
                );
                break;
            }
            case 'contextuality': {
                newChart = new ContextualityChart(result.chart_id, result.object_id,
                    result.missingParams, result.numOfResources, result.fileSize,
                    result.emptyData, result.dateOfIssue, result.modificationDate
                );
                break;
            }
            default: console.log("Cannot recognize type of chart!");
        }
        return newChart;
    }
};

// delete a rateable object from database
dbDeleteRateableObject = async (rateableObject) => {
    const sql = `DELETE FROM rateableObject WHERE object_id = '${rateableObject.object_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// gets a specific chart from database
dbGetSpecificChart = async (chartType, object_id) => {
    const sql = `SELECT * FROM ${chartType} WHERE object_id = '${object_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
};