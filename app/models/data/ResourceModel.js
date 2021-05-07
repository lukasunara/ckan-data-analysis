const db = require('../../db');
const RateableObject = require('./RateableObjectModel');
const AnalysisResult = require('./AnalysisResult');

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
        try {
            let rowCount = await dbNewResource(this);
            if (rowCount == 0)
                console.log('WARNING: Resource has not been persisted!');
            else
                this.persisted = true;
        } catch (err) {
            console.log('ERROR: persisting resource data: ' + JSON.stringify(this));
            throw err;
        }
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

    async analyseResource() {
        let result = new AnalysisResult();
        // 1. findability
        // 1.1. identification
        result.findChart.checkIdentification(checkParam, 'id', this.object_id);
        result.findChart.checkIdentification(checkParam, 'name', this.name);
        result.findChart.checkIdentification(checkParam, 'revision_id', this.revisionId);
        // 1.2. keywords (not calculated)
        // 1.3. categories (not calculated)
        // 1.4. state
        result.findChart.checkState(checkParam, 'state', this.state);

        // 2. accessibility
        // 2.1. dataset accessibility (not calculated)
        // 2.2. URL accessibility (not calculated)
        // 2.3. download URL
        let urlData = result.accessChart.checkDownloadUrl(checkParam, 'url', this.url);

        // 3. interoperability
        // 3.1. format
        result.interChart.checkFormat(checkParam, 'format', this.format);
        // 3.2. format diversity (not calculated)
        // 3.3. compatibility
        result.interChart.checkCompatibility(urlData, this.format);
        // 3.4. machine readable
        result.interChart.checkMachineReadable(urlData.error ? this.format : urlData.extension);
        // 3.5. linked open data (not calculated)

        // 4. reusability
        // 4.1. license (not calculated)
        // 4.2. basic info
        result.reuseChart.checkBasicInfo(checkParam, 'description', this.description);
        // 4.3. extras (not calculated)
        // 4.4. publisher (not calculated)

        // 5. contextuality
        // 5.1. number of resources (not calculated)
        // 5.2. file size
        result.contextChart.checkFileSize(checkParam, 'size', this.size);
        // 5.3. empty data
        result.contextChart.checkEmptyRows(urlData);
        // 5.4. date of issue
        result.contextChart.checkIssueDate(this.created);
        // 5.5. modification date
        result.contextChart.checkLastModified(this.last_modified, urlData.lastModified);
        // overall rating
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