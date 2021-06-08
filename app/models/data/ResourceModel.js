const db = require('../../db');

const { checkParam } = require('../../public/scripts/utils/analysis');

const FindabilityChart = require('../charts/FindabilityChartModel');
const AccessibilityChart = require('../charts/AccessibilityChartModel');
const InteroperabilityChart = require('../charts/InteroperabilityChartModel');
const ReusabilityChart = require('../charts/ReusabilityChartModel');
const ContextualityChart = require('../charts/ContextualityChartModel');

const RateableObject = require('./RateableObjectModel');
const AnalysisResult = require('./AnalysisResult');

// class Resource encapsulates a CKAN resource
module.exports = class Resource extends RateableObject {

    // constructor for Resource
    constructor(data) {
        super(data.object_id, data.changed, data.last_updated);
        this.dataset_id = data.dataset_id;
        this.revision_id = data.revision_id;
        this.name = data.name;
        this.size = data.size;
        this.format = data.format;
        this.media_type = data.media_type;
        this.state = data.state;
        this.description = data.description;
        this.created = data.created;
        this.last_modified = data.last_modified;
        this.actually_last_modified = data.actually_last_modified;
        this.empty_rows = data.empty_rows;
        this.url = data.url;
    }

    isPersisted() {
        super.isPersisted();
    }

    // save resource into database
    async persist() {
        await super.persist(dbNewResource);
    }

    // update resource in database
    async update(data) {
        this.revision_id = data.revision_id;
        this.name = data.name;
        this.size = data.size;
        this.format = data.format;
        this.media_type = data.media_type;
        this.state = data.state;
        this.description = data.description;
        this.created = data.created;
        this.last_modified = data.last_modified;
        this.actually_last_modified = data.actually_last_modified;
        this.empty_rows = data.empty_rows;
        this.url = data.url;
        this.last_updated = data.last_updated;

        await super.update(dbUpdateResource);
    }

    // fetch resource by id
    static async fetchResourceById(resource_id) {
        let result = await dbGetResource(resource_id);
        let resource = null;
        if (result) {
            resource = new Resource(result);
            resource.persisted = true;
        }
        return resource;
    }

    // analyses resource
    async analyseResource(datasetResult, shouldReduce) {
        let result = await AnalysisResult.createAnalysisResult(this.object_id);
        // if dataset has been reseted => no need for reduce()
        if (shouldReduce) datasetResult.reduce(result);

        if (this.changed) {
            result.reset();
            // 1. findability
            // 1.1. identification
            result.findChart.checkIdentification(checkParam, 'id', this.object_id);
            result.findChart.checkIdentification(checkParam, 'name', this.name);
            result.findChart.checkIdentification(checkParam, 'revision_id', this.revision_id);
            result.findChart.max_id += FindabilityChart.maxIdentification;
            // 1.2. keywords (not calculated)
            // 1.3. categories (not calculated)
            // 1.4. state
            result.findChart.checkState(checkParam, 'state', this.state);
            result.findChart.max_state += FindabilityChart.maxState;

            // 2. accessibility
            // 2.1. dataset accessibility (not calculated)
            // 2.2. URL accessibility (not calculated)
            // 2.3. download URL
            result.accessChart.checkDownloadUrl(checkParam, 'url', this.url, this.media_type);
            result.accessChart.max_download_url += AccessibilityChart.maxDownloadURL;

            // 3. interoperability
            // 3.1. format
            result.interChart.checkFormat(checkParam, 'format', this.format);
            result.interChart.max_format += InteroperabilityChart.maxFormat;
            // 3.2. format diversity (not calculated)
            // 3.3. compatibility
            result.interChart.checkCompatibility(this.media_type, this.format);
            result.interChart.max_comp += InteroperabilityChart.maxCompatiblity;
            // 3.4. machine readable
            result.interChart.checkMachineReadable(this.media_type ? this.media_type : this.format);
            result.interChart.max_machine_readable += InteroperabilityChart.maxMachineReadable;
            // 3.5. linked open data (not calculated)

            // 4. reusability
            // 4.1. license (not calculated)
            // 4.2. basic info
            result.reuseChart.checkBasicInfo(checkParam, 'description', this.description);
            result.reuseChart.max_basic_info += ReusabilityChart.maxBasicInfo;
            // 4.3. extras (not calculated)
            // 4.4. publisher (not calculated)

            // 5. contextuality
            // 5.1. number of resources (not calculated)
            // 5.2. file size
            result.contextChart.checkFileSize(checkParam, 'size', this.size);
            result.contextChart.max_file_size += ContextualityChart.maxFileSize;
            // 5.3. empty data (only if resource can be read by xlsx extension)
            if (this.empty_rows >= 0) {
                result.contextChart.checkEmptyRows(this.empty_rows);
                result.contextChart.max_empty += ContextualityChart.maxEmptyData;
            }
            // 5.4. date of issue
            result.contextChart.checkDateOfIssue(this.created);
            result.contextChart.max_date_of_issue += ContextualityChart.maxDateOfIssue;
            // 5.5. modification date
            result.contextChart.checkLastModified(this.last_modified, this.actually_last_modified);
            result.contextChart.max_modification_date += ContextualityChart.maxModificationDate;
            // 5.6. data age
            result.contextChart.checkDataAge(this.actually_last_modified ? this.actually_last_modified : this.last_modified);
            result.contextChart.max_data_age += ContextualityChart.maxDataAge;
        }
        await result.updateDataInDB();
        await super.setChanged(this.object_id, false);

        this.result = result;
    }
};

// inserts a new resource into database
var dbNewResource = async (resource) => {
    const sql = `INSERT INTO resource (object_id, changed, last_updated, dataset_id, revision_id, name,
        size, format, media_type, state, description, created, last_modified, actually_last_modified,
        empty_rows, url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);`;
    const values = [
        resource.object_id, resource.changed, resource.last_updated, resource.dataset_id,
        resource.revision_id, resource.name, resource.size, resource.format, resource.media_type,
        resource.state, resource.description, resource.created, resource.last_modified,
        resource.actually_last_modified, resource.empty_rows, resource.url
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updates resource data in database
var dbUpdateResource = async (resource) => {
    const sql = `UPDATE resource
                    SET changed = $2, last_updated = $3, revision_id = $4, name = $5, size = $6,
                        format = $7, media_type = $8, state = $9, description = $10, created = $11,
                        last_modified = $12, actually_last_modified = $13, empty_rows = $14, url = $15
                    WHERE object_id = $1;`;
    const values = [
        resource.object_id, resource.changed, resource.last_updated, resource.revision_id,
        resource.name, resource.size, resource.format, resource.media_type, resource.state,
        resource.description, resource.created, resource.last_modified, resource.actually_last_modified,
        resource.empty_rows, resource.url

    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// gets resource from database (by its' id)
var dbGetResource = async (resource_id) => {
    const sql = `SELECT * FROM resource WHERE object_id = '${resource_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
};