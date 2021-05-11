const db = require('../../db');
const RateableObject = require('./RateableObjectModel');
const Resource = require('./ResourceModel');

// class Dataset encapsulates a CKAN dataset
module.exports = class Dataset extends RateableObject {

    // constructor for Dataset
    constructor(object_id, portal_id, organization_id, name, title, owner_org,
        author, maintainer, private, state, description, metadataCreated, metadataModified,
        numOfExtras, numOfGroups, numOfKeywords, licenseTitle, licenseURL, url
    ) {
        super(object_id);
        this.portal_id = portal_id;
        this.organization_id = organization_id;
        this.name = name;
        this.title = title;
        this.owner_org = owner_org;
        this.author = author;
        this.maintainer = maintainer;
        this.private = private;
        this.state = state;
        this.description = description;
        this.metadataCreated = metadataCreated;
        this.metadataModified = metadataModified;
        this.numOfExtras = numOfExtras;
        this.numOfGroups = numOfGroups;
        this.numOfKeywords = numOfKeywords;
        this.licenseTitle = licenseTitle;
        this.licenseURL = licenseURL;
        this.url = url;
    }

    // save dataset into database
    async persist() {
        super.persist(dbNewDataset);
    }

    // update dataset data
    async updateDatasetData(metadataModified, numOfExtras, numOfGroups,
        numOfKeywords, licenseTitle, licenseURL, url
    ) {
        try {
            let rowCount = await dbUpdateDataset(this.object_id, this.portal_id,
                this.organization_id, metadataModified, numOfExtras, numOfGroups,
                numOfKeywords, licenseTitle, licenseURL, url
            );
            if (rowCount == 0)
                console.log('WARNING: Dataset has not been updated!');
            else {
                this.metadataModified = metadataModified;
                this.numOfExtras = numOfExtras;
                this.numOfGroups = numOfGroups;
                this.numOfKeywords = numOfKeywords;
                this.licenseTitle = licenseTitle;
                this.licenseURL = licenseURL;
                this.url = url;
            }
        } catch (err) {
            console.log('ERROR: updating dataset data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // fetch dataset by id
    static async fetchDatasetById(dataset_id, portal_id) {
        let result = await dbGetDataset(dataset_id, portal_id);

        if (result) {
            return new Dataset(result.object_id, result.portal_id, result.organization_id,
                result.name, result.title, result.owner_org, result.author, result.maintainer,
                result.private, result.state, result.description, result.metadataCreated,
                result.metadataModified, result.numOfExtras, result.numOfGroups,
                result.numOfKeywords, result.licenseTitle, result.licenseURL, result.url
            );
        }
        return null;
    }

    // fetch all resources connected to this dataset
    static async fetchResources() {
        let results = await dbGetResources(this.object_id);
        let resources = [];

        for (let result of results) {
            let newResource = new Resource(result.object_id, this.object_id,
                result.revisionId, result.name, result.size, result.format, result.mediaType,
                result.state, result.description, result.created, result.lastModified, result.url
            );
            resources.push(newResource);
        }
        return resources;
    }

    // analyses this dataset
    async analyseDataset(changedMetadata) {
        let result = new AnalysisResult();
        if (changedMetadata) {
            // 1. findability
            // 1.1. identification + from resources
            result.findChart.checkIdentification(checkParam, 'id', this.object_id);
            result.findChart.checkIdentification(checkParam, 'name', this.name);
            result.findChart.checkIdentification(checkParam, 'title', this.title);
            // 1.2. keywords
            result.findChart.checkKeywords(checkArray, 'keywords', this.numOfKeywords);
            // 1.3. categories
            result.findChart.checkCategories(checkParam, 'categories', this.numOfGroups);
            // 1.4. state + from resources
            result.findChart.checkState(checkParam, 'state', this.state);
        }
        // 2. accessibility
        // 2.1. dataset accessibility
        result.accessChart.checkDatasetAccess(checkParam, 'private', this.private);
        // 2.2. URL accessibility
        result.accessChart.checkUrlAccess(checkParam, 'url', dataset.url);
        // 2.3. download URL (only from resources)

        // 3. interoperability
        // 3.1. format (only from resources)
        // 3.2. format diversity (only from resources)
        // 3.3. compatibility (only from resources)
        // 3.4. machine readable (only from resources)
        // 3.5. linked open data (not calculated)

        // 4. reusability
        // 4.1. license
        result.reuseChart.checkLicenseTitle(checkParam, 'license_title', this.licenseTitle);
        result.reuseChart.checkLicenseUrl(checkParam, 'license_url', this.licenseURL);
        // 4.2. basic info + from resources
        result.reuseChart.checkBasicInfo(checkParam, 'notes', dataset.notes, dataset.description);
        // 4.3. extras
        result.reuseChart.checkExtras(checkArray, 'extras', dataset.extras);
        // 4.4. publisher
        result.reuseChart.checkPublisher(checkParam, 'author', dataset.author);
        result.reuseChart.checkPublisher(checkParam, 'maintainer', dataset.maintainer);
        result.reuseChart.checkPublisher(checkParam, 'owmner_org', dataset.owmner_org);
        result.reuseChart.checkPublisher(checkParam, 'organization', dataset.organization);

        // 5. contextuality
        // 5.1. number of resources (get from database)
        // 5.2. file size (only from resources)
        // 5.3. empty data (only from resources)
        // 5.4. date of issue + from resources
        result.contextChart.checkIssueDate(this.metadataCreated);
        // 5.5. modification date + from resources
        result.contextChart.checkLastModified(this.last_modified);

        for (let resource of fetchResources()) {
            // resource.analyseResource();
            // result.findChart.identification += resource.result.findChart.identification;
        }

        // overall rating
        this.result = result;
    }
};

// inserting a new dataset into database
dbNewDataset = async (dataset) => {
    const sql = `INSERT INTO dataset (object_id, portal_id, organization_id,
        name, title, owner_org, author, maintainer, private, state, description, metadataCreated,
        metadataModified, numOfExtras, numOfGroups, numOfKeywords, licenseTitle,
        licenseURL, url) VALUES ('$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9',
        '$10', '$11', '$12', '$13', '$14', '$15', '$16', '$17', '$18', '$19');`;
    const values = [
        dataset.object_id, dataset.portal_id, dataset.organization_id,
        dataset.name, dataset.title, dataset.owner_org, dataset.author, dataset.maintainer,
        dataset.private, dataset.state, dataset.description, dataset.metadataCreated,
        dataset.metadataModified, dataset.numOfExtras, dataset.numOfGroups,
        dataset.numOfKeywords, dataset.licenseTitle, dataset.licenseURL, dataset.url
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updating dataset data in database
dbUpdateDataset = async (dataset_id, portal_id, organization_id, metadataModified,
    numOfExtras, numOfGroups, numOfKeywords, licenseTitle, licenseURL, url
) => {
    const sql = `UPDATE dataset
                    SET metadataModified = '${metadataModified}',
                        numOfExtras = '${numOfExtras}',
                        numOfGroups = '${numOfGroups}',
                        numOfKeywords = '${numOfKeywords}',
                        licenseTitle = '${licenseTitle}',
                        licenseURL = '${licenseURL}',
                        url = '${url}'
                    WHERE object_id = '${dataset_id}'
                        AND portal_id = '${portal_id}'
                        AND organization_id = '${organization_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// gets dataset from database by its' id
dbGetDataset = async (dataset_id, portal_id) => {
    const sql = `SELECT * FROM dataset WHERE object_id = '${dataset_id}' AND portal_id = '${portal_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
}

// gets all resources for this dataset
dbGetResources = async (dataset_id) => {
    const sql = `SELECT * FROM resources WHERE dataset_id = ${dataset_id};`;
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err;
    }
}