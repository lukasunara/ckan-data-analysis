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
    constructor(chart_id, object_id, missingParams, format,
        formatDiversity, compatibility, machineReadable, linkedOpenData
    ) {
        super(chart_id, object_id, missingParams);
        this.format = format;
        this.formatDiversity = formatDiversity;
        this.compatibility = compatibility;
        this.machineReadable = machineReadable;
        this.linkedOpenData = linkedOpenData;

        this.maxPointsFormat = 0;
        this.maxPointsFormatDiv = 0;
        this.maxPointsComp = 0;
        this.maxPointsMachine = 0;
        this.maxPointsLOD = 0;
    }

    // creates a new empty InteroperabilityChart
    static createEmptyInteroperability(object_id) {
        return new InteroperabilityChart(undefined, object_id, new Set(), 0, 0, 0, 0, 0);
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

    // save chart into database
    async persist() {
        super.persist(dbNewInteroperabilityChart);
    }

    // fetch chart from database for given object id
    static async fetchChartByID(object_id) {
        let result = await dbGetInteroperability(object_id);

        let interChart = null;
        if (result) {
            interChart = new InteroperabilityChart(
                result.chart_id, result.object_id, result.missingParams, result.format,
                result.formatDiversity, result.compatibility, result.machineReadable, result.linkedOpenData
            );
            interChart.persisted = true;
        }
        return interChart;
    }

    /*// update chart data
    async updateChartData(missingParams, format, formatDiversity,
        compatibility, machineReadable, linkedOpenData
    ) {
        try {
            let rowCount = await dbUpdateChart(this.chart_id, missingParams,
                format, formatDiversity, compatibility, machineReadable, linkedOpenData
            );
            if (rowCount == 0)
                console.log('WARNING: Interoperability chart has not been updated!');
            else {
                this.missingParams = missingParams;
                this.format = format;
                this.formatDiversity = formatDiversity;
                this.compatibility = compatibility;
                this.machineReadable = machineReadable;
                this.linkedOpenData = linkedOpenData;
            }
        } catch (err) {
            console.log('ERROR: updating interoperability chart data: ' + JSON.stringify(this));
            throw err;
        }
    } */
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

// inserting a new interoperability chart into database
dbNewInteroperabilityChart = async (chart) => {
    const sql = `INSERT INTO interoperability (object_id, missingParams, format,
        formatDiversity, compatibility, machineReadable, linkedOpenData)
        VALUES ('$1', '$2', '$3', '$4', '$5', '$6', '$7');`;
    const values = [
        chart.object_id, chart.missingParams, chart.format, chart.formatDiversity,
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

// updating interoperability chart data in database
dbUpdateInteroperability = async (chart) => {
    const sql = `UPDATE interoperability
                    SET missingParams = '${chart.missingParams}',
                        format = '${chart.format}',
                        formatDiversity = '${chart.formatDiversity}',
                        compatibility = '${chart.compatibility}',
                        machineReadable = '${chart.machineReadable}',
                        linkedOpenData = '${chart.linkedOpenData}'
                    WHERE chart_id = '${chart.chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

dbGetInteroperability = async (object_id) => {
    const sql = `SELECT * FROM interoperability WHERE object_id = '${object_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
};