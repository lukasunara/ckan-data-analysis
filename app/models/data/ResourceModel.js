const db = require('../../db');
const RateableObject = require('./RateableObjectModel');
const AnalysisResult = require('./AnalysisResult');
const FindabilityChart = require('../charts/FindabilityChartModel');
const AccessibilityChart = require('../charts/AccessibilityChartModel');
const InteroperabilityChart = require('../charts/InteroperabilityChartModel');
const ReusabilityChart = require('../charts/ReusabilityChartModel');
const ContextualityChart = require('../charts/ContextualityChartModel');

// class Resource encapsulates a CKAN resource
module.exports = class Resource extends RateableObject {

    // constructor for Resource
    constructor(object_id, dataset_id, revisionId, name, size, format, mediaType,
        state, description, created, lastModified, url
    ) {
        super(object_id);
        this.dataset_id = dataset_id;
        this.revisionId = revisionId;
        this.name = name;
        this.size = size;
        this.format = format;
        this.mediaType = mediaType;
        this.state = state;
        this.description = description;
        this.created = created;
        this.lastModified = lastModified;
        this.url = url;
    }

    // save resource into database
    async persist() {
        super.persist(dbNewResource);
    }

    // update numOfExtras
    async updateResourceData(lastModified, size, format, mediaType, url) {
        try {
            let rowCount = await dbUpdateResource(
                this.object_id, lastModified, size, format, mediaType, url
            );
            if (rowCount == 0)
                console.log('WARNING: Resource has not been updated!');
            else {
                this.lastModified = lastModified;
                this.size = size;
                this.format = format;
                this.mediaType = mediaType;
                this.url = url;
            }
        } catch (err) {
            console.log('ERROR: updating resource data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // fetch resource by id
    static async fetchResourceById(resource_id) {
        let result = await dbGetResource(resource_id);

        if (result) {
            return new Resource(result.object_id, result.dataset_id, result.revisionId,
                result.name, result.size, result.format, result.mediaType, result.state,
                result.description, result.created, result.lastModified, result.url
            );
        }
        return null;
    }

    // analyses resource
    async analyseResource(changedMetadata) {
        let result = new AnalysisResult(this.object_id);
        if (changedMetadata) {
            result.reset();
            // 1. findability
            // 1.1. identification
            result.findChart.checkIdentification(checkParam, 'id', this.object_id);
            result.findChart.checkIdentification(checkParam, 'name', this.name);
            result.findChart.checkIdentification(checkParam, 'revision_id', this.revisionId);
            result.findChart.maxPointsID += FindabilityChart.maxIdentification;
            // 1.2. keywords (not calculated)
            // 1.3. categories (not calculated)
            // 1.4. state
            result.findChart.checkState(checkParam, 'state', this.state);
            result.findChart.maxPointsState += FindabilityChart.maxState;

            // 2. accessibility
            // 2.1. dataset accessibility (not calculated)
            // 2.2. URL accessibility (not calculated)
            // 2.3. download URL
            result.accessChart.checkDownloadUrl(checkParam, 'url', this.url, this.mediaType);
            result.accessChart.maxPointsDownload += AccessibilityChart.maxDownloadURL;

            // 3. interoperability
            // 3.1. format
            result.interChart.checkFormat(checkParam, 'format', this.format);
            result.interChart.maxPointsFormat += InteroperabilityChart.maxFormat;
            // 3.2. format diversity (not calculated)
            // 3.3. compatibility
            result.interChart.checkCompatibility(this.mediaType, this.format);
            result.interChart.maxPointsComp += InteroperabilityChart.maxCompatiblity;
            // 3.4. machine readable
            result.interChart.checkMachineReadable(this.mediaType ? this.mediaType : this.format);
            result.interChart.maxPointsMachine += InteroperabilityChart.maxMachineReadable;
            // 3.5. linked open data (not calculated)

            // 4. reusability
            // 4.1. license (not calculated)
            // 4.2. basic info
            result.reuseChart.checkBasicInfo(checkParam, 'description', this.description);
            result.reuseChart.maxPointsInfo += ReusabilityChart.maxBasicInfo;
            // 4.3. extras (not calculated)
            // 4.4. publisher (not calculated)

            // 5. contextuality
            // 5.1. number of resources (not calculated)
            // 5.2. file size
            result.contextChart.checkFileSize(checkParam, 'size', this.size);
            result.contextChart.maxPointsFSize += ContextualityChart.maxFileSize;
            // 5.3. empty data (only if resource can be read by xlsx extension)
            if (this.emptyRows) {
                result.contextChart.checkEmptyRows(this.emptyRows);
                result.contextChart.maxPointsEmpty += ContextualityChart.maxEmptyData;
            }
            // 5.4. date of issue
            result.contextChart.checkIssueDate(this.created);
            result.contextChart.maxPointsIssue += ContextualityChart.maxDateOfIssue;
            // 5.5. modification date
            result.contextChart.checkLastModified(this.lastModified, this.actuallyLastModified);
            result.contextChart.maxPointsModified += ContextualityChart.maxModificationDate;
        }
        await result.updateDataInDB();
        this.result = result;
    }
};

// inserting a new resource into database
dbNewResource = async (resource) => {
    const sql = `INSERT INTO resource (object_id, dataset_id, revisionId, name,
        size, format, mediaType, state, description, created, lastModified, url)
        VALUES ('$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9', '$10', '$11', '$12');`;
    const values = [
        resource.object_id, resource.dataset_id, resource.revisionId, resource.name,
        resource.size, resource.format, resource.mediaType, resource.state,
        resource.description, resource.created, resource.lastModified, resource.url
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updating resource data in database
dbUpdateResource = async (resource_id, lastModified, size, format, mediaType, url) => {
    const sql = `UPDATE resource
                    SET lastModified = '${lastModified}',
                        size = '${size}',
                        format = '${format}',
                        mediaType = '${mediaType}',
                        url = '${url}'
                    WHERE object_id = '${resource_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// gets resource from database by its' id
dbGetResource = async (resource_id) => {
    const sql = `SELECT * FROM resource WHERE object_id = '${resource_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
};