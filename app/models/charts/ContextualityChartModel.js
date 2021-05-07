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

    // empty constructor
    constructor() {
        super();
        this.numOfResources = 0;
        this.fileSize = 0;
        this.emptyData = 0;
        this.dateOfIssue = 0;
        this.modificationDate = 0;
    }

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
    }

    // save chart into database
    async persist() {
        try {
            let rowCount = await dbNewAccessibility(this);
            if (rowCount == 0)
                console.log('WARNING: contextuality chart has not been persisted!');
            else
                this.persisted = true;
        } catch (err) {
            console.log('ERROR: persisting contextuality chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // update chart data
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
    }

    checkFileSize(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.fileSize++;
        }
    }

    checkNumOfResources(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            let points = param >= 5 ? 5 : param;
            this.numOfResources += points;
        }
    }

    checkDateOfIssue(created) {
        let createdDate = analyseDate(created);
        if (createdDate < 0) {
            this.missingParams.add('created');
        } else {
            this.dateOfIssue++;
        }
    }

    checkLastModified(last_modified, urlData_lastModified) {
        let metadataLastModified = analyseDate(last_modified);
        if (metadataLastModified < 0) {
            this.missingParams.add('last_modified');
        } else {
            this.modificationDate++;
            let lastModified = new Date(last_modified);
            let urlDataLastModified = new Date(urlData_lastModified);
            if (lastModified == urlDataLastModified) {
                this.modificationDate++;
            }
        }
    }

    checkEmptyRows(urlData) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            // count blank rows in resource data
            let fileStats;
            if (urlData.extension == 'xls' || urlData.extension == 'xlsx' ||
                urlData.extension == 'csv' || urlData.extension == 'xml'
            ) {
                fileStats = parseExcelFile(urlData.data, urlData.extension);
            } else if (urlData.extension == 'json') {
                fileStats = parseJSONFile(urlData.data, urlData.extension);
            }

            let percentage = fileStats.blankRows / fileStats.numOfRows * 100;
            let points;
            if (percentage < 0.5) {
                points = 4;
            } else if (percentage < 1.0) {
                points = 3;
            } else if (percentage < 2.0) {
                points = 2;
            } else if (percentage < 4.0) {
                points = 1;
            } else {
                points = 0;
            }
            this.emptyData += points;
        }
    }
};

// inserting a new accessibility chart into database
dbNewChart = async (chart) => {
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

// updating chart data in database
dbUpdateChart = async (chart_id, missingParams, numOfResources,
    fileSize, emptyData, dateOfIssue, modificationDate
) => {
    const sql = `UPDATE contextuality
                    SET missingParams = '${missingParams}',
                        numOfResources = '${numOfResources}',
                        fileSize = '${fileSize}',
                        emptyData = '${emptyData}',
                        dateOfIssue = '${dateOfIssue}',
                        modificationDate = '${modificationDate}'
                    WHERE chart_id = '${chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};