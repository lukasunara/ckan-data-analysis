const db = require('../../db');
const Chart = require('./ChartModel');
const { fetchData } = require('../../public/scripts/utils/fetching.js');

// class ReusabilityChart encapsulates an reusability chart
module.exports = class ReusabilityChart extends Chart {
    // max number of points for each category of evaluation
    static maxLicense = 3;
    static maxBasicInfo = 1;
    static maxExtras = 3;
    static maxExtrasOrganization = 4;
    static maxPublisher = 3;

    // constructor for ReusabilityChart
    constructor(data) {
        super(data.chart_id, data.object_id, data.missing_params);
        this.darkColor = '#7d4394';
        this.lightColor = '#da92f7';

        this.license = data.license;
        this.basic_info = data.basic_info;
        this.extras = data.extras;
        this.publisher = data.publisher;

        this.maxPointsLicense = 0;
        this.maxPointsInfo = 0;
        this.maxPointsExtras = 0;
        this.maxPointsPublisher = 0;
    }

    // creates a new empty ReusabilityChart
    static createEmptyReusability(object_id) {
        return new ReusabilityChart({
            chart_id: undefined,
            object_id: object_id,
            missing_params: new Set(),
            license: 0,
            basic_info: 0,
            extras: 0,
            publisher: 0
        });
    }

    // gets maximum of points an object could have received
    getMaxPoints() {
        return this.maxPointsLicense + this.maxPointsInfo + this.maxPointsExtras + this.maxPointsPublisher;
    }

    // gets number of points an object has earned
    getEarnedPoints() {
        return this.license + this.basic_info + this.extras + this.publisher;
    }

    // sets all points to zero
    reset() {
        this.license = 0;
        this.basic_info = 0;
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
        this.basic_info -= other.basic_info;
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
        this.basic_info += other.basic_info;
        this.extras += other.extras;
        this.publisher += other.publisher;

        this.maxPointsLicense += other.maxPointsLicense;
        this.maxPointsInfo += other.maxPointsInfo;
        this.maxPointsExtras += other.maxPointsExtras;
        this.maxPointsPublisher += other.maxPointsPublisher;
    }

    isPersisted() {
        return super.isPersisted();
    }

    // save chart into database
    async persist() {
        await super.persist(dbNewReusabilityChart);
    }

    // fetch chart from database for given object id
    static async fetchChartByID(object_id) {
        let result = await dbGetReusability(object_id);

        let reuseChart = null;
        if (result) {
            result.missing_params = new Set(result.missing_params.split(' '));
            reuseChart = new ReusabilityChart(result);
            reuseChart.persisted = true;
        }
        return reuseChart;
    }

    // update chart data
    async updateChartData() {
        await super.updateChartData(dbUpdateReusability);
    }

    // checks license title for dataset
    checkLicenseTitle(checkFunction, key, param1, param2) {
        let param = super.sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.license++; //if title for license exists, add 1 point
        }
    }

    // checks license URL for dataset
    async checkLicenseUrl(checkFunction, key, param1, param2) {
        let param = super.sendParam(checkFunction, key, param1, param2);
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
        let param = super.sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.basic_info++; //if basic info field exists, add 1 point
        }
    }

    // checks how many extras there are
    checkExtras(numOfExtras) {
        // points are in range [0, 3]
        if (numOfExtras > 0) {
            this.extras += numOfExtras >= 3 ? 3 : numOfExtras;
        } else {
            this.missing_params.add('extras');
        }
    }

    // checks how many members there are in an organization
    checkMembers(numOfMembers) {
        // if exists, add 1 point
        if (numOfMembers > 0) {
            this.extras++;
        } else {
            this.missing_params.add('members');
        }
    }

    // checks if there is any information about publisher of data 
    checkPublisher(checkFunction, key, param1, param2) {
        let param = super.sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.publisher++; //if exists, add 1 point
        }
    }
};

// inserts a new reusability chart into database
var dbNewReusabilityChart = async (chart, missingParams) => {
    const sql = `INSERT INTO reusability (object_id, missing_params, license,
        basic_info, extras, publisher) VALUES ($1, $2, $3, $4, $5, $6);`;
    const values = [
        chart.object_id, missingParams, chart.license,
        chart.basic_info, chart.extras, chart.publisher
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updates reusability chart data in database
var dbUpdateReusability = async (chart, missingParams) => {
    const sql = `UPDATE reusability
                    SET missing_params = '${missingParams}',
                        license = ${chart.license},
                        basic_info = ${chart.basic_info},
                        extras = ${chart.extras},
                        publisher = ${chart.publisher}
                    WHERE chart_id = '${chart.chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// gets reusability chart from database
var dbGetReusability = async (object_id) => {
    const sql = `SELECT * FROM reusability WHERE object_id = '${object_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
};