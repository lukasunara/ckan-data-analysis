const db = require('../../db');
const Chart = require('./ChartModel');

// class ReusabilityChart encapsulates an reusability chart
module.exports = class ReusabilityChart extends Chart {
    // max number of points for each category of evaluation
    static maxLicense = 3;
    static maxBasicInfo = 1;
    static maxExtras = 3;
    static maxExtrasOrganization = 4;
    static maxPublisher = 3;

    // constructor for ReusabilityChart
    constructor(chart_id, object_id, missingParams, license, basicInfo, extras, publisher) {
        super(chart_id, object_id, missingParams);
        this.license = license;
        this.basicInfo = basicInfo;
        this.extras = extras;
        this.publisher = publisher;

        this.maxPointsLicense = 0;
        this.maxPointsInfo = 0;
        this.maxPointsExtras = 0;
        this.maxPointsPublisher = 0;
    }

    // creates a new empty ReusabilityChart
    static createEmptyReusability(object_id) {
        return new ReusabilityChart(undefined, object_id, new Set(), 0, 0, 0, 0);
    }

    // gets maximum of points an object could have received
    getMaxPoints() {
        return this.maxPointsLicense + this.maxPointsInfo + this.maxPointsExtras + this.maxPointsPublisher;
    }

    // gets number of points an object has earned
    getEarnedPoints() {
        return this.license + this.basicInfo + this.extras + this.publisher;
    }

    // save chart into database
    async persist() {
        super.persist(dbNewReusabilityChart);
    }

    // sets all points to zero
    reset() {
        this.license = 0;
        this.basicInfo = 0;
        this.extras = 0;
        this.publisher = 0;

        this.maxPointsLicense = 0;
        this.maxPointsInfo = 0;
        this.maxPointsExtras = 0;
        this.maxPointsPublisher = 0;
    }

    // reduces points by other chart values
    reduce(other) {
        this.license -= other.license;
        this.basicInfo -= other.basicInfo;
        this.extras -= other.extras;
        this.publisher -= other.publisher;

        this.maxPointsLicense -= other.maxPointsLicense;
        this.maxPointsInfo -= other.maxPointsInfo;
        this.maxPointsExtras -= other.maxPointsExtras;
        this.maxPointsPublisher -= other.maxPointsPublisher;
    }

    // adds points from other chart values
    add(other) {
        this.license += other.license;
        this.basicInfo += other.basicInfo;
        this.extras += other.extras;
        this.publisher += other.publisher;

        this.maxPointsLicense += other.maxPointsLicense;
        this.maxPointsInfo += other.maxPointsInfo;
        this.maxPointsExtras += other.maxPointsExtras;
        this.maxPointsPublisher += other.maxPointsPublisher;
    }

    // fetch chart from database for given object id
    static async fetchChartByID(object_id) {
        let result = await dbGetReusability(object_id);

        let reuseChart = null;
        if (result) {
            reuseChart = new ReusabilityChart(
                result.chart_id, result.object_id, result.missingParams,
                result.license, result.basicInfo, result.extras, result.publisher
            );
            reuseChart.persisted = true;
        }
        return reuseChart;
    }

    /*// update chart data
    async updateChartData(missingParams, license, basicInfo, extras, publisher) {
        try {
            let rowCount = await dbUpdateChart(this.chart_id,
                missingParams, license, basicInfo, extras, publisher
            );
            if (rowCount == 0)
                console.log('WARNING: reusability chart has not been updated!');
            else {
                this.missingParams = missingParams;
                this.license = license;
                this.basicInfo = basicInfo;
                this.extras = extras;
                this.publisher = publisher;
            }
        } catch (err) {
            console.log('ERROR: updating reusability chart data: ' + JSON.stringify(this));
            throw err;
        }
    }*/
    async updateChartData() {
        super.updateChartData(dbUpdateReusability);
    }

    // checks license title for dataset
    checkLicenseTitle(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.license++; //if title for license exists, add 1 point
        }
    }

    // checks license URL for dataset
    checkLicenseUrl(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.license++; //if URL for license exists, add 1 point
            var urlData = await fetchData(param);
            // if url does not work report it
            if (urlData.error) {
                /*var urlError = {
                    status: urlData.status, // status code of response
                    statusText: urlData.statusText // response status text
                }*/
            } else {
                this.license++; //if URL for license works, add 1 point
            }
        }
    }

    // checks basic info fields
    checkBasicInfo(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.basicInfo++; //if basic info field exists, add 1 point
        }
    }

    // checks how many extras there are
    checkExtras(numOfExtras) {
        // points are in range [0, 3]
        if (numOfExtras > 0) {
            this.extras += param >= 3 ? 3 : param;
        } else {
            this.missingParams.add('extras');
        }
    }

    // checks how many members there are in an organization
    checkMembers(numOfMembers) {
        // if exists, add 1 point
        if (numOfMembers > 0) {
            this.extras++;
        } else {
            this.missingParams.add('members');
        }
    }

    // checks if there is any information about publisher of data 
    checkPublisher(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.publisher++; //if exists, add 1 point
        }
    }
};

// inserting a new reusability chart into database
dbNewReusabilityChart = async (chart) => {
    const sql = `INSERT INTO reusability (object_id, missingParams, license,
        basicInfo, extras, publisher) VALUES ('$1', '$2', '$3', '$4', '$5', '$6');`;
    const values = [
        chart.object_id, chart.missingParams, chart.license,
        chart.basicInfo, chart.extras, chart.publisher
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updating reusability chart data in database
dbUpdateReusability = async (chart) => {
    const sql = `UPDATE reusability
                    SET missingParams = '${chart.missingParams}',
                        license = '${chart.license}',
                        basicInfo = '${chart.basicInfo}',
                        extras = '${chart.extras}',
                        publisher = '${chart.publisher}'
                    WHERE chart_id = '${chart.chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

dbGetReusability = async (object_id) => {
    const sql = `SELECT * FROM reusability WHERE object_id = '${object_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
};