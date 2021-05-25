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
        this.max_license = data.max_license;
        this.basic_info = data.basic_info;
        this.max_basic_info = data.max_basic_info;
        this.extras = data.extras;
        this.max_extras = data.max_extras;
        this.publisher = data.publisher;
        this.max_publisher = data.max_publisher;
    }

    // creates a new empty ReusabilityChart
    static createEmptyReusability(object_id) {
        return new ReusabilityChart({
            chart_id: undefined,
            object_id: object_id,
            missing_params: new Set(),
            license: 0,
            max_license: 0,
            basic_info: 0,
            max_basic_info: 0,
            extras: 0,
            max_extras: 0,
            publisher: 0,
            max_publisher: 0
        });
    }

    // gets maximum of points an object could have received
    getMaxPoints() {
        return this.max_license + this.max_basic_info + this.max_extras + this.max_publisher;
    }

    // gets number of points an object has earned
    getEarnedPoints() {
        return this.license + this.basic_info + this.extras + this.publisher;
    }

    // sets all points to zero
    reset() {
        this.license = 0;
        this.max_license = 0;
        this.basic_info = 0;
        this.max_basic_info = 0;
        this.extras = 0;
        this.max_extras = 0;
        this.publisher = 0;
        this.max_publisher = 0;
    }

    // reduces points by other chart values
    reduce(other) {
        this.license -= other.license;
        this.max_license -= other.max_license;
        this.basic_info -= other.basic_info;
        this.max_basic_info -= other.max_basic_info;
        this.extras -= other.extras;
        this.max_extras -= other.max_extras;
        this.publisher -= other.publisher;
        this.max_publisher -= other.max_publisher;
    }

    // adds points from other chart values
    add(other) {
        this.license += other.license;
        this.max_license += other.max_license;
        this.basic_info += other.basic_info;
        this.max_basic_info += other.max_basic_info;
        this.extras += other.extras;
        this.max_extras += other.max_extras;
        this.publisher += other.publisher;
        this.max_publisher += other.max_publisher;
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
    const sql = `INSERT INTO reusability (object_id, missing_params, license, max_license,
                    basic_info, max_basic_info, extras, max_extras, publisher, max_publisher)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`;
    const values = [
        chart.object_id, missingParams, chart.license, chart.max_license, chart.basic_info,
        chart.max_basic_info, chart.extras, chart.max_extras, chart.publisher, chart.max_publisher
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
                    SET missing_params = $2, license = $3, max_license = $4, basic_info = $5,
                        max_basic_info = $6, extras = $7, max_extras = $8, publisher = $9, max_publisher = $10
                    WHERE chart_id = $1;`;
    const values = [
        chart.chart_id, missingParams, chart.license, chart.max_license, chart.basic_info,
        chart.max_basic_info, chart.extras, chart.max_extras, chart.publisher, chart.max_publisher
    ];
    try {
        const result = await db.query(sql, values);
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