const db = require('../../db');
const Chart = require('./ChartModel');
const { analyseDate } = require('../../public/scripts/utils/analysis');

// class ContextualityChart encapsulates an contextuality chart
module.exports = class ContextualityChart extends Chart {
    // max number of points for each category of evaluation
    static maxNumOfResources = 5;
    static maxFileSize = 1;
    static maxEmptyData = 4;
    static maxDateOfIssue = 1;
    static maxModificationDate = 2;

    // constructor for ContextualityChart
    constructor(data) {
        super(data.chart_id, data.object_id, data.missing_params);
        this.num_of_resources = data.num_of_resources;
        this.file_size = data.file_size;
        this.empty_data = data.empty_data;
        this.date_of_issue = data.date_of_issue;
        this.modification_date = data.modification_date;

        this.maxPointsResources = 0;
        this.maxPointsFSize = 0;
        this.maxPointsEmpty = 0;
        this.maxPointsIssue = 0;
        this.maxPointsModified = 0;
    }

    // creates a new empty ContextualityChart
    static createEmptyContextuality(object_id) {
        return new ContextualityChart({
            chart_id: undefined,
            object_id: object_id,
            missing_params: new Set(),
            num_of_resources: 0,
            file_size: 0,
            empty_data: 0,
            date_of_issue: 0,
            modification_date: 0
        });
    }

    // gets maximum of points an object could have received
    getMaxPoints() {
        return this.maxPointsResources + this.maxPointsFSize
            + this.maxPointsEmpty + this.maxPointsIssue + this.maxPointsModified;
    }

    // gets number of points an object has earned
    getEarnedPoints() {
        return this.num_of_resources + this.file_size + this.empty_data
            + this.date_of_issue + this.modification_date;
    }

    // sets all points to zero
    reset() {
        this.num_of_resources = 0;
        this.file_size = 0;
        this.empty_data = 0;
        this.date_of_issue = 0;
        this.modification_date = 0;

        this.maxPointsResources = 0;
        this.maxPointsFSize = 0;
        this.maxPointsEmpty = 0;
        this.maxPointsIssue = 0;
        this.maxPointsModified = 0;
    }

    // reduces points by other chart values
    reduce(other) {
        this.num_of_resources -= other.num_of_resources;
        this.file_size -= other.file_size;
        this.empty_data -= other.empty_data;
        this.date_of_issue -= other.date_of_issue;
        this.modification_date -= other.modification_date;

        this.maxPointsResources -= other.maxPointsResources;
        this.maxPointsFSize -= other.maxPointsFSize;
        this.maxPointsEmpty -= other.maxPointsEmpty;
        this.maxPointsIssue -= other.maxPointsIssue;
        this.maxPointsModified -= other.maxPointsModified;
    }

    // adds points from other chart values
    add(other) {
        this.num_of_resources += other.num_of_resources;
        this.file_size += other.file_size;
        this.empty_data += other.empty_data;
        this.date_of_issue += other.date_of_issue;
        this.modification_date += other.modification_date;

        this.maxPointsResources += other.maxPointsResources;
        this.maxPointsFSize += other.maxPointsFSize;
        this.maxPointsEmpty += other.maxPointsEmpty;
        this.maxPointsIssue += other.maxPointsIssue;
        this.maxPointsModified += other.maxPointsModified;
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
    const sql = `INSERT INTO contextuality (object_id, missing_params, num_of_resources,
        file_size, empty_data, date_of_issue, modification_date) VALUES ($1, $2, $3, $4, $5, $6, $7);`;
    const values = [
        chart.object_id, missingParams, chart.num_of_resources, chart.file_size,
        chart.empty_data, chart.date_of_issue, chart.modification_date
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
                    SET missing_params = '${missingParams}',
                        num_of_resources = ${chart.num_of_resources},
                        file_size = ${chart.file_size},
                        empty_data = ${chart.empty_data},
                        date_of_issue = ${chart.date_of_issue},
                        modification_date = ${chart.modification_date}
                    WHERE chart_id = '${chart.chart_id}';`;
    try {
        const result = await db.query(sql, []);
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