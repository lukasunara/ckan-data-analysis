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

    // empty constructor
    constructor() {
        super();
        this.format = 0;
        this.formatDiversity = 0;
        this.compatibility = 0;
        this.machineReadable = 0;
        this.linkedOpenData = 0;
    }

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
    }

    // save chart into database
    async persist() {
        try {
            let rowCount = await dbNewAccessibility(this);
            if (rowCount == 0)
                console.log('WARNING: Interoperability chart has not been persisted!');
            else
                this.persisted = true;
        } catch (err) {
            console.log('ERROR: persisting interoperability chart data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // update chart data
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
    }

    checkFormat(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.format++;
        }
    }

    checkCompatibility(urlData, format) {
        if (!urlData.error) {  // error while fetching resource
            if (urlData.extension.toLowerCase() == format.toLowerCase()) {
                this.compatibility++;
            } else if (urlData.extension == 'shp' && resource.format.toLowerCase() == 'shx') {
                this.compatibility++; // because .shp and .shx has the same content type
            }
        }
    }

    static machineReadables = new Set([
        'csv', 'geojson', 'ics', 'json', 'json_ld', 'kmz', 'kml', 'netcdf',
        'ods', 'rdfa', 'rdf_n_quads', 'rdf_n_triples', 'rdf_trig', 'rdf_turtle',
        'rdf_xml', 'rss', 'shp', 'xls', 'xlsx', 'xlm'
    ]);
    checkMachineReadable(format) {
        if (machineReadables.has(format.toLowerCase())) {
            this.machineReadable++;
        }
    }

    checkVocabularies(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.linkedOpenData += 2;
        }
    }

    checkExtensions(checkFunction, key, param1, param2) {
        let param = sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.linkedOpenData++;
            let extensions = new Set(param1);
            if (extensions.has('dcat') || extensions.has('rdft')) {
                this.linkedOpenData += 4;
            }
        }
    }
};

// inserting a new accessibility chart into database
dbNewChart = async (chart) => {
    const sql = `INSERT INTO accessibility (object_id, missingParams, format,
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

// updating chart data in database
dbUpdateChart = async (chart_id, missingParams, format,
    formatDiversity, compatibility, machineReadable, linkedOpenData
) => {
    const sql = `UPDATE interoperability
                    SET missingParams = '${missingParams}',
                        format = '${format}',
                        formatDiversity = '${formatDiversity}',
                        compatibility = '${compatibility}',
                        machineReadable = '${machineReadable}',
                        linkedOpenData = '${linkedOpenData}'
                    WHERE chart_id = '${chart_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};