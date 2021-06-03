const db = require('../../db');
const { fetchData } = require('../../public/scripts/utils/fetching');
const Chart = require('./ChartModel');

// class InteroperabilityChart encapsulates an interoperability chart
module.exports = class InteroperabilityChart extends Chart {
    // max number of points for each indicator of evaluation
    static weightFormat = 20;
    static weightFormatDiv = 30;
    static weightCompatibility = 20;
    static weightMachineRead = 30;
    static weightLOD = 50;

    static maxFormat = 1;
    static maxFormatDiversity = 4;
    static maxCompatiblity = 1;
    static maxMachineReadable = 5;
    static maxLinkedOpenData = 7;
    static maxDatasetLOD = 5;
    static maxPortalLOD = 7;

    // constructor for InteroperabilityChart
    constructor(data) {
        super(data.chart_id, data.object_id, data.missing_params);
        this.darkColor = '#3e6669';
        this.lightColor = '#a0c3c5';

        this.format = data.format;
        this.max_format = data.max_format;
        this.format_diversity = data.format_diversity;
        this.max_format_div = data.max_format_div;
        this.compatibility = data.compatibility;
        this.max_comp = data.max_comp;
        this.machine_readable = data.machine_readable;
        this.max_machine_readable = data.max_machine_readable;
        this.linked_open_data = data.linked_open_data;
        this.max_lod = data.max_lod;
    }

    // creates a new empty InteroperabilityChart
    static createEmptyInteroperability(object_id) {
        return new InteroperabilityChart({
            chart_id: undefined,
            object_id: object_id,
            missing_params: new Set(),
            format: 0,
            max_format: 0,
            format_diversity: 0,
            max_format_div: 0,
            compatibility: 0,
            max_comp: 0,
            machine_readable: 0,
            max_machine_readable: 0,
            linked_open_data: 0,
            max_lod: 0
        });
    }

    // gets maximum of points an object could have received
    getMaxPoints() {
        return this.max_format + this.max_format_div + this.max_comp
            + this.max_machine_readable + this.max_lod;
    }

    // gets number of points an object has earned
    getEarnedPoints() {
        return this.format + this.format_diversity + this.compatibility
            + this.machine_readable + this.linked_open_data;
    }

    // gets total weight of interoperability charts
    getTotalWeight() {
        let wFormat = this.max_format == 0 ? 0 : InteroperabilityChart.weightFormat;
        let wFormatDiv = this.max_format_div == 0 ? 0 : InteroperabilityChart.weightFormatDiv;
        let wComp = this.max_comp == 0 ? 0 : InteroperabilityChart.weightCompatibility;
        let wMachRead = this.max_machine_readable == 0 ? 0 : InteroperabilityChart.weightMachineRead;
        let wLOD = this.max_lod == 0 ? 0 : InteroperabilityChart.weightLOD;

        return wFormat + wFormatDiv + wComp + wMachRead + wLOD;
    }

    // gets earned weight of this chart
    getEarnedWeight() {
        let earnedWFormat = this.max_format == 0 ? 0 : (
            this.format / this.max_format * InteroperabilityChart.weightFormat
        );
        let earnedWFormatDiv = this.max_format_div == 0 ? 0 : (
            this.format_diversity / this.max_format_div * InteroperabilityChart.weightFormatDiv
        );
        let earnedWComp = this.max_comp == 0 ? 0 : (
            this.compatibility / this.max_comp * InteroperabilityChart.weightCompatibility
        );
        let earnedWMachine = this.max_machine_readable == 0 ? 0 : (
            this.machine_readable / this.max_machine_readable * InteroperabilityChart.weightMachineRead
        );
        let earnedWLOD = this.max_lod == 0 ? 0 : (
            this.linked_open_data / this.max_lod * InteroperabilityChart.weightLOD
        );

        return earnedWFormat + earnedWFormatDiv + earnedWComp + earnedWMachine + earnedWLOD;
    }

    // sets all points to zero
    reset() {
        this.format = 0;
        this.max_format = 0;
        this.format_diversity = 0;
        this.max_format_div = 0;
        this.compatibility = 0;
        this.max_comp = 0;
        this.machine_readable = 0;
        this.max_machine_readable = 0;
        this.linked_open_data = 0;
        this.max_lod = 0;
    }

    // reduces points by other chart values
    reduce(other) {
        this.format -= other.format;
        this.max_format -= other.max_format;
        this.format_diversity -= other.format_diversity;
        this.max_format_div -= other.max_format_div;
        this.compatibility -= other.compatibility;
        this.max_comp -= other.max_comp;
        this.machine_readable -= other.machine_readable;
        this.max_machine_readable -= other.max_machine_readable;
        this.linked_open_data -= other.linked_open_data;
        this.max_lod -= other.max_lod;
    }

    // adds points from other chart values
    add(other) {
        this.format += other.format;
        this.max_format += other.max_format;
        this.format_diversity += other.format_diversity;
        this.max_format_div += other.max_format_div;
        this.compatibility += other.compatibility;
        this.max_comp += other.max_comp;
        this.machine_readable += other.machine_readable;
        this.max_machine_readable += other.max_machine_readable;
        this.linked_open_data += other.linked_open_data;
        this.max_lod += other.max_lod;
    }

    isPersisted() {
        return super.isPersisted();
    }

    // save chart into database
    async persist() {
        await super.persist(dbNewInteroperabilityChart);
    }

    // fetch chart from database for given object id
    static async fetchChartByID(object_id) {
        let result = await dbGetInteroperability(object_id);

        let interChart = null;
        if (result) {
            result.missing_params = new Set(result.missing_params.split(' '));
            interChart = new InteroperabilityChart(result);
            interChart.persisted = true;
        }
        return interChart;
    }

    // update chart data
    async updateChartData() {
        await super.updateChartData(dbUpdateInteroperability);
    }

    // checks if format field exists 
    checkFormat(checkFunction, key, param1, param2) {
        let param = super.sendParam(checkFunction, key, param1, param2);
        if (param) {
            this.format++; //if exists, add 1 point
        }
    }

    // checks number of different formats
    checkFormatDiversity(numOfDiffFormats) {
        // points are in range [0, 4]
        this.format_diversity += numOfDiffFormats >= 4 ? 4 : numOfDiffFormats;
    }

    // checks compatibility of format and media type
    checkCompatibility(mediaType, format) {
        // if compatible, add 1 point
        if (mediaType && mediaType == format.toLowerCase()) {
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
        if (InteroperabilityChart.machineReadables.has(format.toLowerCase())) {
            this.machine_readable++; //if machine readable, add 1 point
        }
    }

    // checks if portal contains vocabularies
    checkVocabularies(numOfVocabularies) {
        if (numOfVocabularies > 0) {
            this.linked_open_data += 2; //if they exist, add 2 points
        } else {
            this.missing_params.add('vocabularies');
        }
    }

    // checks portal extensions
    checkExtensions(numOfExtensions, dcatOrRdf) {
        if (numOfExtensions > 0) {
            this.linked_open_data++; //if they exist, add 1 point
            if (dcatOrRdf) {
                this.linked_open_data += 4; //if there are linked open data exensions, add 4 points
            }
        } else {
            this.missingParams.add('extensions');
        }
    }

    // https://{ckan-instance-host}/dataset/{dataset-id}.{format}
    static formatsLOD = ['rdf', 'xml', 'ttl', 'n3', 'jsonld'];
    async checkDatasetLOD(portalName, datasetID) {
        InteroperabilityChart.formatsLOD.forEach(async format => {
            let url = 'https://' + portalName + '/dataset/' + datasetID + '.' + format;

            let urlData = await fetchData(url);
            if (!urlData || urlData.error) {
                // link not working
            } else {
                this.linked_open_data++; //if URL works, add 1 point
            }
        });

    }
};

// inserts a new interoperability chart into database
var dbNewInteroperabilityChart = async (chart, missingParams) => {
    const sql = `INSERT INTO interoperability (object_id, missing_params, format, max_format,
        format_diversity, max_format_div, compatibility, max_comp, machine_readable, max_machine_readable,
        linked_open_data, max_lod) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`;
    const values = [
        chart.object_id, missingParams, chart.format, chart.max_format, chart.format_diversity,
        chart.max_format_div, chart.compatibility, chart.max_comp, chart.machine_readable,
        chart.max_machine_readable, chart.linked_open_data, chart.max_lod
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
                    SET missing_params = $2, format = $3, max_format = $4, format_diversity = $5,
                        max_format_div = $6, compatibility = $7, max_comp = $8, machine_readable = $9,
                        max_machine_readable = $10, linked_open_data = $11, max_lod = $12
                    WHERE chart_id = $1;`;
    const values = [
        chart.chart_id, missingParams, chart.format, chart.max_format, chart.format_diversity,
        chart.max_format_div, chart.compatibility, chart.max_comp, chart.machine_readable,
        chart.max_machine_readable, chart.linked_open_data, chart.max_lod
    ];
    try {
        const result = await db.query(sql, values);
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