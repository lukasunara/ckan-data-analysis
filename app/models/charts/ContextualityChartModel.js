const db = require('../../db');
const Chart = require('./ChartModel');
const { analyseDate } = require('../../public/scripts/utils/analysis');

// class ContextualityChart encapsulates an contextuality chart
module.exports = class ContextualityChart extends Chart {
    // max number of points for each indicator of evaluation
    static weightNumOfResources = 20;
    static weightFileSize = 5;
    static weightEmptyData = 25;
    static weightDateOfIssue = 5;
    static weightModifDate = 10;
    static weightDataAge = 15;

    static maxNumOfResources = 5;
    static maxFileSize = 1;
    static maxEmptyData = 4;
    static maxDateOfIssue = 1;
    static maxModificationDate = 2;
    static maxDataAge = 4;

    // constructor for ContextualityChart
    constructor(data) {
        super(data.chart_id, data.object_id, data.missing_params);
        this.darkColor = '#eec10d';
        this.lightColor = '#f1d872';

        this.num_of_resources = data.num_of_resources;
        this.max_num_of_res = data.max_num_of_res;
        this.file_size = data.file_size;
        this.max_file_size = data.max_file_size;
        this.empty_data = data.empty_data;
        this.max_empty = data.max_empty;
        this.date_of_issue = data.date_of_issue;
        this.max_date_of_issue = data.max_date_of_issue;
        this.modification_date = data.modification_date;
        this.max_modification_date = data.max_modification_date;
        this.data_age = data.data_age;
        this.max_data_age = data.max_data_age;
    }

    // creates a new empty ContextualityChart
    static createEmptyContextuality(object_id) {
        return new ContextualityChart({
            chart_id: undefined,
            object_id: object_id,
            missing_params: new Set(),
            num_of_resources: 0,
            max_num_of_res: 0,
            file_size: 0,
            max_file_size: 0,
            empty_data: 0,
            max_empty: 0,
            date_of_issue: 0,
            max_date_of_issue: 0,
            modification_date: 0,
            max_modification_date: 0,
            data_age: 0,
            max_data_age: 0
        });
    }

    // gets maximum of points an object could have received
    getMaxPoints() {
        return this.max_num_of_res + this.max_file_size + this.max_empty
            + this.max_date_of_issue + this.max_modification_date + this.max_data_age;
    }

    // gets number of points an object has earned
    getEarnedPoints() {
        return this.num_of_resources + this.file_size + this.empty_data
            + this.date_of_issue + this.modification_date + this.data_age;
    }

    // gets total weight of contextuality charts
    getTotalWeight() {
        let wNumOfRes = this.max_num_of_res == 0 ? 0 : ContextualityChart.weightNumOfResources;
        let wFileSize = this.max_file_size == 0 ? 0 : ContextualityChart.weightFileSize;
        let wEmptyData = this.max_empty == 0 ? 0 : ContextualityChart.weightEmptyData;
        let wIssueDate = this.max_date_of_issue == 0 ? 0 : ContextualityChart.weightDateOfIssue;
        let wModifDate = this.max_modification_date == 0 ? 0 : ContextualityChart.weightModifDate;
        let wDataAge = this.max_data_age == 0 ? 0 : ContextualityChart.weightDataAge;

        return wNumOfRes + wFileSize + wEmptyData + wIssueDate + wModifDate + wDataAge;
    }

    // gets earned weight of this chart
    getEarnedWeight() {
        let earnedWNumOfRes = this.max_num_of_res == 0 ? 0 : (
            this.num_of_resources / this.max_num_of_res * ContextualityChart.weightNumOfResources
        );
        let earnedWSize = this.max_file_size == 0 ? 0 : (
            this.file_size / this.max_file_size * ContextualityChart.weightFileSize
        );
        let earnedWEmpty = this.max_empty == 0 ? 0 : (
            this.empty_data / this.max_empty * ContextualityChart.weightEmptyData
        );
        let earnedWIssueDate = this.max_date_of_issue == 0 ? 0 : (
            this.date_of_issue / this.max_date_of_issue * ContextualityChart.weightDateOfIssue
        );
        let earnedWModifDate = this.max_modification_date == 0 ? 0 : (
            this.modification_date / this.max_modification_date * ContextualityChart.weightModifDate
        );
        let earnedWDataAge = this.max_data_age == 0 ? 0 : (
            this.data_age / this.max_data_age * ContextualityChart.weightDataAge
        );

        return earnedWNumOfRes + earnedWSize + earnedWEmpty + earnedWIssueDate + earnedWModifDate + earnedWDataAge;
    }

    // sets all points to zero
    reset() {
        this.num_of_resources = 0;
        this.max_num_of_res = 0;
        this.file_size = 0;
        this.max_file_size = 0;
        this.empty_data = 0;
        this.max_empty = 0;
        this.date_of_issue = 0;
        this.max_date_of_issue = 0;
        this.modification_date = 0;
        this.max_modification_date = 0;
        this.data_age = 0;
        this.max_data_age = 0;
    }

    // reduces points by other chart values
    reduce(other) {
        this.num_of_resources -= other.num_of_resources;
        this.max_num_of_res -= other.max_num_of_res;
        this.file_size -= other.file_size;
        this.max_file_size -= other.max_file_size;
        this.empty_data -= other.empty_data;
        this.max_empty -= other.max_empty;
        this.date_of_issue -= other.date_of_issue;
        this.max_date_of_issue -= other.max_date_of_issue;
        this.modification_date -= other.modification_date;
        this.max_modification_date -= other.max_modification_date;
        this.data_age -= other.data_age;
        this.max_data_age -= other.max_data_age;
    }

    // adds points from other chart values
    add(other) {
        this.num_of_resources += other.num_of_resources;
        this.max_num_of_res += other.max_num_of_res;
        this.file_size += other.file_size;
        this.max_file_size += other.max_file_size;
        this.empty_data += other.empty_data;
        this.max_empty += other.max_empty;
        this.date_of_issue += other.date_of_issue;
        this.max_date_of_issue += other.max_date_of_issue;
        this.modification_date += other.modification_date;
        this.max_modification_date += other.max_modification_date;
        this.data_age += other.data_age;
        this.max_data_age += other.max_data_age;
    }

    isPersisted() {
        return super.isPersisted();
    }

    // save chart into database
    async persist() {
        await super.persist(dbNewContextualityChart);
    }

    // fetch chart from database for given object id
    static async fetchChartByID(object_id) {
        let result = await dbGetContextuality(object_id);

        let contextChart = null;
        if (result) {
            result.missing_params = new Set(result.missing_params.split(' '));
            contextChart = new ContextualityChart(result);
            contextChart.persisted = true;
        }
        return contextChart;
    }

    // update chart data  
    async updateChartData() {
        await super.updateChartData(dbUpdateContextuality);
    }

    // checks if metadata about file size exists
    checkFileSize(checkFunction, key, param1, param2) {
        let param = super.sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.file_size++; //if exists, add 1 point
        }
    }

    // checks number of resources for datasets
    checkNumOfResources(numOfResources) {
        // points are in range [0, 5]
        this.num_of_resources += numOfResources >= 5 ? 5 : numOfResources;
    }

    // checks date of issue
    checkDateOfIssue(created) {
        let createdDate = analyseDate(created);
        // if date of issue exists and is not in the future, add 1 point
        if (createdDate < 0) {
            this.missing_params.add('created');
        } else {
            this.date_of_issue++;
        }
    }

    // checks if correct last modified date
    checkLastModified(last_modified, urlData_lastModified) {
        let metadataLastModified = analyseDate(last_modified);
        // if last modified date exists and is not in the future, add 1 point
        if (metadataLastModified < 0) {
            this.missing_params.add('last_modified');
        } else {
            this.modification_date++;
            if (urlData_lastModified) {
                let lastModified = new Date(last_modified);
                let urlDataLastModified = new Date(urlData_lastModified);
                // if last modified correct, add 1 point (45 second gap aloved)
                if (lastModified - urlDataLastModified <= 45) {
                    this.modification_date++;
                }
            }
        }
    }

    // checks how old is this data
    checkDataAge(actually_last_modified) {
        let numOfMonthsOld = analyseDate(actually_last_modified);

        if (numOfMonthsOld >= 0) {
            let points;
            if (numOfMonthsOld < 1) points = 4;
            else if (numOfMonthsOld < 3) points = 3;
            else if (numOfMonthsOld < 6) points = 2;
            else if (numOfMonthsOld < 12) points = 1;
            else points = 0;

            this.data_age += points
        }
    }

    // checks empty rows in a file (if the file can be read by xlsx extension)
    checkEmptyRows(emptyRows) {
        let points; //points are in range [0, 4]
        if (emptyRows < 0.5) {
            points = 4;
        } else if (emptyRows < 1.0) {
            points = 3;
        } else if (emptyRows < 2.0) {
            points = 2;
        } else if (emptyRows < 4.0) {
            points = 1;
        } else {
            points = 0;
        }
        this.empty_data += points;
    }
};

// inserts a new contextuality chart into database
var dbNewContextualityChart = async (chart, missingParams) => {
    const sql = `INSERT INTO contextuality (object_id, missing_params, num_of_resources, max_num_of_res,
                        file_size, max_file_size, empty_data, max_empty, date_of_issue, max_date_of_issue,
                        modification_date, max_modification_date, data_age, max_data_age) VALUES
                        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);`;
    const values = [
        chart.object_id, missingParams, chart.num_of_resources, chart.max_num_of_res, chart.file_size,
        chart.max_file_size, chart.empty_data, chart.max_empty, chart.date_of_issue, chart.max_date_of_issue,
        chart.modification_date, chart.max_modification_date, chart.data_age, chart.max_data_age
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updates contextuality chart data in database
var dbUpdateContextuality = async (chart, missingParams) => {
    const sql = `UPDATE contextuality
                    SET missing_params = $2, num_of_resources = $3, max_num_of_res = $4, file_size = $5,
                        max_file_size = $6, empty_data = $7, max_empty = $8, date_of_issue = $9,
                        max_date_of_issue = $10, modification_date = $11, max_modification_date = $12,
                        data_age = $13, max_data_age = $14
                    WHERE chart_id = $1;`;
    const values = [
        chart.chart_id, missingParams, chart.num_of_resources, chart.max_num_of_res, chart.file_size,
        chart.max_file_size, chart.empty_data, chart.max_empty, chart.date_of_issue, chart.max_date_of_issue,
        chart.modification_date, chart.max_modification_date, chart.data_age, chart.max_data_age
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// gets contextuality chart from database
var dbGetContextuality = async (object_id) => {
    const sql = `SELECT * FROM contextuality WHERE object_id = '${object_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
};