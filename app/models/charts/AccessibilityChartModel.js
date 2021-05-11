const db = require('../../db');
const Chart = require('./ChartModel');
const { fetchData } = require('../../public/scripts/fetching.js');

// class AccessibilityChart encapsulates an accessibility chart
module.exports = class AccessibilityChart extends Chart {
    // max number of points for each category of evaluation
    static maxDatasetAccessibility = 1;
    static maxUrlAccessibility = 2;
    static maxDownloadURL = 2;

    // constructor for AccessibilityChart
    constructor(chart_id, object_id, missingParams, datasetAccessibility, urlAccessibility, downloadURL) {
        super(chart_id, object_id, missingParams);
        this.datasetAccessibility = datasetAccessibility;
        this.urlAccessibility = urlAccessibility;
        this.downloadURL = downloadURL;

        this.maxPointsDataset = 0;
        this.maxPointsUrl = 0;
        this.maxPointsDownload = 0;
    }

    // creates a new empty AccessibilityChart
    static createEmptyAccessibility(object_id) {
        return new AccessibilityChart(undefined, object_id, new Set(), 0, 0, 0);
    }

    // gets maximum of points an object could have received
    getMaxPoints() {
        return this.maxPointsDataset + this.maxPointsUrl + this.maxPointsDownload;
    }

    // gets number of points an object has earned
    getEarnedPoints() {
        return this.datasetAccessibility + this.urlAccessibility + this.downloadURL;
    }

    // save chart into database
    async persist() {
        super.persist(dbNewAccessibilityChart);
    }

    // fetch chart from database for given object id
    static async fetchChartByID(object_id) {
        let result = await dbGetAccessibility(object_id);

        let accessChart = null;
        if (result) {
            accessChart = new AccessibilityChart(
                result.chart_id, result.object_id, result.missingParams,
                result.datasetAccessibility, result.urlAccessibility, result.downloadURL
            );
            accessChart.persisted = true;
        }
        return accessChart;
    }

    /*// update chart data
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
    }*/
    async updateChartData() {
        super.updateChartData(dbUpdateAccessibility);
    }

    // checks if dataset is accessible or not
    checkDatasetAccess(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        // if dataset is accessible, add 1 point
        if (param) {
            if (param == 'true') {
                this.datasetAccessibility++;
            }
        }
    }

    // checks if URL is accessible or not
    checkUrlAccess(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        // if URL exists, add 1 point
        if (param) {
            this.urlAccessibility++;
            var urlData = await fetchData(param);
            // if url does not work, report it
            if (urlData.error) {
                /*var urlError = {
                    status: urlData.status, //status code of response
                    statusText: urlData.statusText //response status text
                }*/
            } else {
                this.urlAccessibility++; //if URL works, add 1 point
            }
        }
    }

    // checks if downlaod URL for resources works or not
    checkDownloadUrl(checkFunction, key, url, mediaType) {
        let param = sendParam(checkFunction, key, url);
        // if URL exists, add 1 point
        if (param) {
            this.downloadURL++;
            if (mediaType) {
                this.downloadURL++; //if URL works, add 1 point
            }
            // don't need to do this, because I know that it works if mediaType != null
            /*var urlData = await fetchData(param);
            if (urlData.error || urlData.status.code >= 400) {
                urlData.error = true; //error while fetching resource
            } else {
                this.downloadURL++; //if URL works, add 1 point
            }*/
        }
    }
};

// inserting a new accessibility chart into database
dbNewAccessibilityChart = async (chart) => {
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
dbUpdateAccessibility = async (chart) => {
    const sql = `UPDATE accessibility
                    SET missingParams = '${chart.missingParams}',
                        datasetAccessibility = '${chart.datasetAccessibility}',
                        urlAccessibility = '${chart.urlAccessibility}',
                        downloadURL = '${chart.downloadURL}'
                    WHERE chart_id = '${chart.chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

dbGetAccessibility = async (object_id) => {
    const sql = `SELECT * FROM accessibility WHERE object_id = '${object_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
};