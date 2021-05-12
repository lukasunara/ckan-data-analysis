const db = require('../../db');
const Chart = require('./ChartModel');

// class InteroperabilityChart encapsulates an interoperability chart
module.exports = class InteroperabilityChart extends Chart {
    // max number of points for each category of evaluation
    static maxFormat = 1;
    static maxFormatDiversity = 4;
    static maxCompatiblity = 1;
    static maxMachineReadable = 5;
    static maxLinkedOpenData = 7;

    // constructor for InteroperabilityChart
    constructor(data) {
        super(data.chart_id, data.object_id, data.missingParams);
        this.format = data.format;
        this.formatDiversity = data.formatDiversity;
        this.compatibility = data.compatibility;
        this.machineReadable = data.machineReadable;
        this.linkedOpenData = data.linkedOpenData;

        this.maxPointsFormat = 0;
        this.maxPointsFormatDiv = 0;
        this.maxPointsComp = 0;
        this.maxPointsMachine = 0;
        this.maxPointsLOD = 0;
    }

    // creates a new empty InteroperabilityChart
    static createEmptyInteroperability(object_id) {
        return new InteroperabilityChart({
            chart_id: undefined,
            object_id: object_id,
            missingParams: new Set(),
            format: 0,
            formatDiversity: 0,
            compatibility: 0,
            machineReadables: 0,
            linkedOpenData: 0
        });
    }

    // gets maximum of points an object could have received
    getMaxPoints() {
        return this.maxPointsFormat + this.maxPointsFormatDiv + this.maxPointsComp
            + this.maxPointsMachine + this.maxPointsLOD;
    }

    // gets number of points an object has earned
    getEarnedPoints() {
        return this.format + this.formatDiversity + this.compatibility
            + this.machineReadable + this.machineReadable;
    }

    // sets all points to zero
    reset() {
        this.format = 0;
        this.formatDiversity = 0;
        this.compatibility = 0;
        this.machineReadable = 0;
        this.linkedOpenData = 0;

        this.maxPointsFormat = 0;
        this.maxPointsFormatDiv = 0;
        this.maxPointsComp = 0;
        this.maxPointsMachine = 0;
        this.maxPointsLOD = 0;
    }

    // reduces points by other chart values
    reduce(other) {
        this.format -= other.format;
        this.formatDiversity -= other.formatDiversity;
        this.compatibility -= other.compatibility;
        this.machineReadable -= other.machineReadable;
        this.linkedOpenData -= other.linkedOpenData;

        this.maxPointsFormat -= other.maxPointsFormat;
        this.maxPointsFormatDiv -= other.maxPointsFormatDiv;
        this.maxPointsComp -= other.maxPointsComp;
        this.maxPointsMachine -= other.maxPointsMachine;
        this.maxPointsLOD -= other.maxPointsLOD;
    }

    // adds points from other chart values
    add(other) {
        this.format += other.format;
        this.formatDiversity += other.formatDiversity;
        this.compatibility += other.compatibility;
        this.machineReadable += other.machineReadable;
        this.linkedOpenData += other.linkedOpenData;

        this.maxPointsFormat += other.maxPointsFormat;
        this.maxPointsFormatDiv += other.maxPointsFormatDiv;
        this.maxPointsComp += other.maxPointsComp;
        this.maxPointsMachine += other.maxPointsMachine;
        this.maxPointsLOD += other.maxPointsLOD;
    }

    // save chart into database
    async persist() {
        super.persist(dbNewInteroperabilityChart);
    }

    // fetch chart from database for given object id
    static async fetchChartByID(object_id) {
        let result = await dbGetInteroperability(object_id);
        result.missingParams = new Set(result.missingParams.split(' '));

        let interChart = null;
        if (result) {
            interChart = new InteroperabilityChart(result);
            interChart.persisted = true;
        }
        return interChart;
    }

    // update chart data
    async updateChartData() {
        super.updateChartData(dbUpdateInteroperability);
    }

    // checks if format field exists 
    checkFormat(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.format++; //if exists, add 1 point
        }
    }

    // checks compatibility of format and media type
    checkCompatibility(mediaType, format) {
        // if compatible, add 1 point
        if (mediaType.toLowerCase() == format.toLowerCase()) {
            this.compatibility++;
        }
    }

    static machineReadables = new Set([
        'csv', 'geojson', 'ics', 'json', 'json_ld', 'kmz', 'kml', 'netcdf',
        'ods', 'rdfa', 'rdf_n_quads', 'rdf_n_triples', 'rdf_trig', 'rdf_turtle',
        'rdf_xml', 'rss', 'shp', 'xls', 'xlsx', 'xlm'
    ]);
    // checks if given format is machine readable 
    checkMachineReadable(format) {
        if (machineReadables.has(format.toLowerCase())) {
            this.machineReadable++; //if machine readable, add 1 point
        }
    }

    // checks if portal contains vocabularies
    checkVocabularies(numOfVocabularies) {
        if (numOfVocabularies > 0) {
            this.linkedOpenData += 2; //if they exist, add 2 points
        }
    }

    // checks portal extensions
    checkExtensions(numOfExtensions, dcatOrRdf) {
        if (numOfExtensions > 0) {
            this.linkedOpenData++; //if they exist, add 1 point
            if (dcatOrRdf) {
                this.linkedOpenData += 4; //if there are linked open data exensions, add 4 points
            }
        }
    }
};

// inserts a new interoperability chart into database
var dbNewInteroperabilityChart = async (chart, missingParams) => {
    const sql = `INSERT INTO interoperability (object_id, missingParams, format,
        formatDiversity, compatibility, machineReadable, linkedOpenData)
        VALUES ('$1', '$2', $3, $4, $5, $6, $7);`;
    const values = [
        chart.object_id, missingParams, chart.format, chart.formatDiversity,
        chart.compatibility, chart.machineReadable, chart.linkedOpenData
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updates interoperability chart data in database
var dbUpdateInteroperability = async (chart, missingParams) => {
    const sql = `UPDATE interoperability
                    SET missingParams = '${missingParams}',
                        format = ${chart.format},
                        formatDiversity = ${chart.formatDiversity},
                        compatibility = ${chart.compatibility},
                        machineReadable = ${chart.machineReadable},
                        linkedOpenData = ${chart.linkedOpenData}
                    WHERE chart_id = '${chart.chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// gets interoperability chart from database
var dbGetInteroperability = async (object_id) => {
    const sql = `SELECT * FROM interoperability WHERE object_id = '${object_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
};