const db = require('../../db');
const Chart = require('./ChartModel');
const { fetchData } = require('../../public/scripts/utils/fetching.js');

// class AccessibilityChart encapsulates an accessibility chart
module.exports = class AccessibilityChart extends Chart {
    // max number of points for each category of evaluation
    static maxDatasetAccessibility = 1;
    static maxUrlAccessibility = 2;
    static maxDownloadURL = 2;

    // constructor for AccessibilityChart
    constructor(data) {
        super(data.chart_id, data.object_id, data.missing_params);
        this.dataset_accessibility = data.dataset_accessibility;
        this.url_accessibility = data.url_accessibility;
        this.download_url = data.download_url;

        this.maxPointsDataset = 0;
        this.maxPointsUrl = 0;
        this.maxPointsDownload = 0;
    }

    // creates a new empty AccessibilityChart
    static createEmptyAccessibility(object_id) {
        return new AccessibilityChart({
            chart_id: undefined,
            object_id: object_id,
            missing_params: new Set(),
            dataset_accessibility: 0,
            url_accessibility: 0,
            download_url: 0
        });
    }

    // gets maximum of points an object could have received
    getMaxPoints() {
        return this.maxPointsDataset + this.maxPointsUrl + this.maxPointsDownload;
    }

    // gets number of points an object has earned
    getEarnedPoints() {
        return this.dataset_accessibility + this.url_accessibility + this.download_url;
    }

    // sets all points to zero
    reset() {
        this.dataset_accessibility = 0;
        this.url_accessibility = 0;
        this.download_url = 0;

        this.maxPointsDataset = 0;
        this.maxPointsUrl = 0;
        this.maxPointsDownload = 0;
    }

    // reduces points by other chart values
    reduce(other) {
        this.dataset_accessibility -= other.dataset_accessibility;
        this.url_accessibility -= other.url_accessibility;
        this.download_url -= other.download_url;

        this.maxPointsDataset -= other.maxPointsDataset;
        this.maxPointsUrl -= other.maxPointsUrl;
        this.maxPointsDownload -= other.maxPointsDownload;
    }

    // adds points from other chart values
    add(other) {
        this.dataset_accessibility += other.dataset_accessibility;
        this.url_accessibility += other.url_accessibility;
        this.download_url += other.download_url;

        this.maxPointsDataset += other.maxPointsDataset;
        this.maxPointsUrl += other.maxPointsUrl;
        this.maxPointsDownload += other.maxPointsDownload;
    }

    // fetch chart from database for given object id
    static async fetchChartByID(object_id) {
        let result = await dbGetAccessibility(object_id);

        let accessChart = null;
        if (result) {
            result.missing_params = new Set(result.missing_params.split(' '));
            accessChart = new AccessibilityChart(result);
            accessChart.persisted = true;
        }
        return accessChart;
    }

    isPersisted() {
        return super.isPersisted();
    }

    // save chart into database
    async persist() {
        await super.persist(dbNewAccessibilityChart);
    }

    // update chart data
    async updateChartData() {
        await super.updateChartData(dbUpdateAccessibility);
    }

    // checks if dataset is accessible or not
    checkDatasetAccess(checkFunction, key, param1, param2) {
        let param = super.sendParam(checkFunction, key, param1, param2);
        // if dataset is accessible, add 1 point
        if (!param) {
            this.dataset_accessibility++;
        }
    }

    // checks if URL is accessible or not
    async checkUrlAccess(checkFunction, key, param1, param2) {
        let param = super.sendParam(checkFunction, key, param1, param2);
        // if URL exists, add 1 point
        if (param) {
            this.url_accessibility++;
            var urlData = await fetchData(param);
            // if url does not work, report it
            if (!urlData || urlData.error) {
                /*var urlError = {
                    status: urlData.status, //status code of response
                    statusText: urlData.statusText //response status text
                }*/
            } else {
                this.url_accessibility++; //if URL works, add 1 point
            }
        }
    }

    // checks if downlaod URL for resources works or not
    checkDownloadUrl(checkFunction, key, url, mediaType) {
        let param = super.sendParam(checkFunction, key, url);
        // if URL exists, add 1 point
        if (param) {
            this.download_url++;
            // don't need to check if URL works, because I know that it works if mediaType != null
            if (mediaType) {
                this.download_url++; //if URL works, add 1 point
            }
            /*var urlData = await fetchData(param);
            if (urlData.error || urlData.status.code >= 400) {
                urlData.error = true; //error while fetching resource
            } else {
                this.downloadURL++; //if URL works, add 1 point
            }*/
        }
    }
};

// inserts a new accessibility chart into database
var dbNewAccessibilityChart = async (chart, missingParams) => {
    const sql = `INSERT INTO accessibility (object_id, missing_params, dataset_accessibility,
        url_accessibility, download_url) VALUES ($1, $2, $3, $4, $5);`;
    const values = [
        chart.object_id, missingParams, chart.dataset_accessibility,
        chart.url_accessibility, chart.download_url
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updates accessibility chart data in database
var dbUpdateAccessibility = async (chart, missingParams) => {
    const sql = `UPDATE accessibility
                    SET missing_params = '${missingParams}',
                        dataset_accessibility = ${chart.dataset_accessibility},
                        url_accessibility = ${chart.url_accessibility},
                        download_url = ${chart.download_url}
                    WHERE chart_id = '${chart.chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// gets accessibility chart from database
var dbGetAccessibility = async (object_id) => {
    const sql = `SELECT * FROM accessibility WHERE object_id = '${object_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
};