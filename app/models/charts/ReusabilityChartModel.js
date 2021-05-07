const db = require('../../db');
const Chart = require('./ChartModel');

// class ReusabilityChart encapsulates an reusability chart
module.exports = class ReusabilityChart extends Chart {
    // max number of points for each category of evaluation
    static maxLicense = 3;
    static maxBasicInfo = 1;
    static maxExtras = 3;
    static maxExtrasOrganization = 4;
    static maxPublisher = 4;

    // empty constructor
    constructor() {
        super();
        this.license = 0;
        this.basicInfo = 0;
        this.extras = 0;
        this.publisher = 0;
    }

    // constructor for ReusabilityChart
    constructor(chart_id, object_id, missingParams, license, basicInfo, extras, publisher) {
        super(chart_id, object_id, missingParams);
        this.license = license;
        this.basicInfo = basicInfo;
        this.extras = extras;
        this.publisher = publisher;
    }

    // save chart into database
    async persist() {
        try {
            let rowCount = await dbNewAccessibility(this);
            if (rowCount == 0)
                console.log('WARNING: reusability chart has not been persisted!');
            else
                this.persisted = true;
        } catch (err) {
            console.log('ERROR: persisting reusability chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // update chart data
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
    }

    checkLicense(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.license++;
            var urlData = await fetchData(param);
            // if url does not work report it
            if (urlData.error) {
                /*var urlError = {
                    status: urlData.status, // status code of response
                    statusText: urlData.statusText // response status text
                }*/
            } else {
                this.license++;
            }
        }
    }

    checkBasicInfo(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.basicInfo++;
        }
    }

    checkExtras(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            let points = param >= 3 ? 3 : param;
            this.extras += points;
        }
    }

    checkPublisher(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.publisher++;
        }
    }
};

// inserting a new accessibility chart into database
dbNewChart = async (chart) => {
    const sql = `INSERT INTO accessibility (object_id, missingParams, license,
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

// updating chart data in database
dbUpdateChart = async (chart_id, missingParams, license, basicInfo, extras, publisher) => {
    const sql = `UPDATE reusability
                    SET missingParams = '${missingParams}',
                        license = '${license}',
                        basicInfo = '${basicInfo}',
                        extras = '${extras}',
                        publisher = '${publisher}'
                    WHERE chart_id = '${chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};