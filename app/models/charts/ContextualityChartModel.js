const db = require('../../db');
const Chart = require('./ChartModel');
const { parseExcelFile, parseJSONFile } = require('../../public/scripts/excelParsing.js');

// class ContextualityChart encapsulates an contextuality chart
module.exports = class ContextualityChart extends Chart {
    // max number of points for each category of evaluation
    static maxNumOfResources = 5;
    static maxFileSize = 1;
    static maxEmptyData = 4;
    static maxDateOfIssue = 1;
    static maxModificationDate = 2;

    // constructor for ContextualityChart
    constructor(chart_id, object_id, missingParams, numOfResources,
        fileSize, emptyData, dateOfIssue, modificationDate
    ) {
        super(chart_id, object_id, missingParams);
        this.numOfResources = numOfResources;
        this.fileSize = fileSize;
        this.emptyData = emptyData;
        this.dateOfIssue = dateOfIssue;
        this.modificationDate = modificationDate;

        this.maxPointsResources = 0;
        this.maxPointsFSize = 0;
        this.maxPointsEmpty = 0;
        this.maxPointsIssue = 0;
        this.maxPointsModified = 0;
    }

    // creates a new empty ContextualityChart
    static createEmptyContextuality(object_id) {
        return new ContextualityChart(undefined, object_id, new Set(), 0, 0, 0, 0, 0);
    }

    // gets maximum of points an object could have received
    getMaxPoints() {
        return this.maxPointsResources + this.maxPointsFSize
            + this.maxPointsEmpty + this.maxPointsIssue + this.maxPointsModified;
    }

    // gets number of points an object has earned
    getEarnedPoints() {
        return this.numOfResources + this.fileSize + this.emptyData + this.dateOfIssue + this.modificationDate;
    }

    // save chart into database
    async persist() {
        super.persist(dbNewContextualityChart);
    }

    // fetch chart from database for given object id
    static async fetchChartByID(object_id) {
        let result = await dbGetContextuality(object_id);

        let contextChart = null;
        if (result) {
            contextChart = new ContextualityChart(
                result.chart_id, result.object_id, result.missingParams, result.numOfResources,
                result.fileSize, result.emptyData, result.dateOfIssue, result.modificationDate
            );
            contextChart.persisted = true;
        }
        return contextChart;
    }

    /*// update chart data
    async updateChartData(missingParams, numOfResources, fileSize, emptyData, dateOfIssue, modificationDate) {
        try {
            let rowCount = await dbUpdateChart(this.chart_id, missingParams,
                numOfResources, fileSize, emptyData, dateOfIssue, modificationDate
            );
            if (rowCount == 0)
                console.log('WARNING: contextuality chart has not been updated!');
            else {
                this.missingParams = missingParams;
                this.numOfResources = numOfResources;
                this.fileSize = fileSize;
                this.emptyData = emptyData;
                this.dateOfIssue = dateOfIssue;
                this.modificationDate = modificationDate;
            }
        } catch (err) {
            console.log('ERROR: updating contextuality chart data: ' + JSON.stringify(this));
            throw err;
        }
    }*/
    async updateChartData() {
        super.updateChartData(dbUpdateContextuality);
    }

    // checks if metadata about file size exists
    checkFileSize(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.fileSize++; //if exists, add 1 point
        }
    }

    // checks number of resources for datasets
    checkNumOfResources(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        // if exists, points are in range [1, 5]
        if (param) {
            let points = param >= 5 ? 5 : param;
            this.numOfResources += points;
        }
    }

    // checks date of issue
    checkDateOfIssue(created) {
        let createdDate = analyseDate(created);
        // if date of issue exists and is not in the future, add 1 point
        if (createdDate < 0) {
            this.missingParams.add('created');
        } else {
            this.dateOfIssue++;
        }
    }

    // checks if correct last modified date
    checkLastModified(last_modified, urlData_lastModified) {
        let metadataLastModified = analyseDate(last_modified);
        // if last modified date exists and is not in the future, add 1 point
        if (metadataLastModified < 0) {
            this.missingParams.add('last_modified');
        } else {
            this.modificationDate++;
            if (urlData_lastModified) {
                let lastModified = new Date(last_modified);
                let urlDataLastModified = new Date(urlData_lastModified);
                // if last modified correct, add 1 point (45 second gap aloved)
                if (lastModified - urlDataLastModified <= 45) {
                    this.modificationDate++;
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
        this.emptyData += points;
    }
};

// inserting a new contextuality chart into database
dbNewContextualityChart = async (chart) => {
    const sql = `INSERT INTO contextuality (object_id, missingParams, numOfResources,
        fileSize, emptyData, dateOfIssue, modificationDate) VALUES ('$1', '$2', '$3',
        '$4', '$5', '$6', '$7');`;
    const values = [
        chart.object_id, chart.missingParams, chart.numOfResources,
        chart.fileSize, chart.emptyData, chart.dateOfIssue, chart.modificationDate
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updating contextuality chart data in database
dbUpdateContextuality = async (chart) => {
    const sql = `UPDATE contextuality
                    SET missingParams = '${chart.missingParams}',
                        numOfResources = '${chart.numOfResources}',
                        fileSize = '${chart.fileSize}',
                        emptyData = '${chart.emptyData}',
                        dateOfIssue = '${chart.dateOfIssue}',
                        modificationDate = '${chart.modificationDate}'
                    WHERE chart_id = '${chart.chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

dbGetContextuality = async (object_id) => {
    const sql = `SELECT * FROM contextuality WHERE object_id = '${object_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
};