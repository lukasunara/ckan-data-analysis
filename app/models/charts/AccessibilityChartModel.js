const db = require('../../db');
const Chart = require('./ChartModel');
const { fetchData } = require('../../public/scripts/fetching.js');

// class AccessibilityChart encapsulates an accessibility chart
module.exports = class AccessibilityChart extends Chart {
    // max number of points for each category of evaluation
    static maxDatasetAccessibility = 1;
    static maxUrlAccessibility = 2;
    static maxDownloadURL = 2;

    // empty constructor
    constructor() {
        super();
        this.datasetAccessibility = 0;
        this.urlAccessibility = 0;
        this.downloadURL = 0;
    }

    // constructor for AccessibilityChart
    constructor(chart_id, object_id, missingParams, datasetAccessibility, urlAccessibility, downloadURL) {
        super(chart_id, object_id, missingParams);
        this.datasetAccessibility = datasetAccessibility;
        this.urlAccessibility = urlAccessibility;
        this.downloadURL = downloadURL;
    }

    // save chart into database
    async persist() {
        try {
            let rowCount = await dbNewAccessibility(this);
            if (rowCount == 0)
                console.log('WARNING: Accessibility chart has not been persisted!');
            else
                this.persisted = true;
        } catch (err) {
            console.log('ERROR: persisting accessibility chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // update chart data
    async updateChartData(missingParams, datasetAccessibility, urlAccessibility, downloadURL) {
        try {
            let rowCount = await dbUpdateChart(this.chart_id,
                missingParams, datasetAccessibility, urlAccessibility, downloadURL
            );
            if (rowCount == 0)
                console.log('WARNING: Accessibility chart has not been updated!');
            else {
                this.missingParams = missingParams;
                this.datasetAccessibility = datasetAccessibility;
                this.urlAccessibility = urlAccessibility;
                this.downloadURL = downloadURL;
            }
        } catch (err) {
            console.log('ERROR: updating accessibility chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

    checkDatasetAccess(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            if (param == 'true') {
                this.datasetAccessibility++;
            }
        }
    }

    checkUrlAccess(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.urlAccessibility++;
            var urlData = await fetchData(param);
            // if url does not work report it
            if (urlData.error) {
                /*var urlError = {
                    status: urlData.status, // status code of response
                    statusText: urlData.statusText // response status text
                }*/
            } else {
                this.urlAccessibility++;
            }
        }
    }

    checkDownloadUrl(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.downloadURL++;
            var urlData = await fetchData(param);
            if (urlData.error || urlData.status.code >= 400) {  // error while fetching resource
                urlData.error = true;
            } else {
                this.downloadURL++;
            }
        }
        return urlData;
    }
};

// inserting a new accessibility chart into database
dbNewChart = async (chart) => {
    const sql = `INSERT INTO accessibility (object_id, missingParams, datasetAccessibility,
        urlAccessibility, downloadURL) VALUES ('$1', '$2', '$3', '$4', '$5');`;
    const values = [
        chart.object_id, chart.missingParams, chart.datasetAccessibility,
        chart.urlAccessibility, chart.downloadURL
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
dbUpdateChart = async (
    chart_id, missingParams, datasetAccessibility, urlAccessibility, downloadURL
) => {
    const sql = `UPDATE accessibility
                    SET missingParams = '${missingParams}',
                        datasetAccessibility = '${datasetAccessibility}',
                        urlAccessibility = '${urlAccessibility}',
                        downloadURL = '${downloadURL}'
                    WHERE chart_id = '${chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};