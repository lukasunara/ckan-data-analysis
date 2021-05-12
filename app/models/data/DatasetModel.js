const db = require('../../db');
const AccessibilityChart = require('../charts/AccessibilityChartModel');
const ContextualityChart = require('../charts/ContextualityChartModel');
const FindabilityChart = require('../charts/FindabilityChartModel');
const ReusabilityChart = require('../charts/ReusabilityChartModel');
const RateableObject = require('./RateableObjectModel');
const Resource = require('./ResourceModel');

// class Dataset encapsulates a CKAN dataset
module.exports = class Dataset extends RateableObject {

    // constructor for Dataset
    constructor(data) {
        super(data.object_id, data.changed);
        this.portal_id = data.portal_id;
        this.organization_id = data.organization_id;
        this.name = data.name;
        this.title = data.title;
        this.ownerOrg = data.ownerOrg;
        this.author = data.author;
        this.maintainer = data.maintainer;
        this.private = data.private;
        this.state = data.state;
        this.description = data.description;
        this.metadataCreated = data.metadataCreated;
        this.metadataModified = data.metadataModified;
        this.numOfExtras = data.numOfExtras;
        this.numOfGroups = data.numOfGroups;
        this.numOfKeywords = data.numOfKeywords;
        this.licenseTitle = data.licenseTitle;
        this.licenseURL = data.licenseURL;
        this.url = data.url;
    }

    // save dataset into database
    async persist() {
        super.persist(dbNewDataset);
    }

    // update dataset data in database
    async update() {
        super.update(dbUpdateDataset);
    }

    // fetch dataset by id
    static async fetchDatasetById(dataset_id, portal_id) {
        let result = await dbGetDataset(dataset_id, portal_id);
        if (result) {
            return new Dataset(result);
        }
        return null;
    }

    // fetch all resources connected to this dataset
    static async fetchResources() {
        let results = await dbGetResources(this.object_id);
        let resources = [];

        for (let resource of results) {
            let newResource = new Resource(resource);
            resources.push(newResource);
        }
        return resources;
    }

    // analyses this dataset
    async analyseDataset() {
        let result = new AnalysisResult(this.object_id);
        if (this.changed) {
            result.reset();
            // 1. findability
            // 1.1. identification + from resources
            result.findChart.checkIdentification(checkParam, 'id', this.object_id);
            result.findChart.checkIdentification(checkParam, 'name', this.name);
            result.findChart.checkIdentification(checkParam, 'title', this.title);
            result.findChart.maxPointsID += FindabilityChart.maxIdentification;
            // 1.2. keywords
            result.findChart.checkKeywords(this.numOfKeywords);
            result.findChart.maxPointsKeywords += FindabilityChart.maxKeywords;
            // 1.3. categories
            result.findChart.checkCategories(checkParam, 'categories', this.numOfGroups);
            result.findChart.maxPointsCategories += FindabilityChart.maxCategories;
            // 1.4. state + from resources
            result.findChart.checkState(checkParam, 'state', this.state);
            result.findChart.maxPointsState += FindabilityChart.maxState;

            // 2. accessibility
            // 2.1. dataset accessibility
            result.accessChart.checkDatasetAccess(checkParam, 'private', this.private);
            result.accessChart.maxPointsDataset += AccessibilityChart.maxDatasetAccessibility;
            // 2.2. URL accessibility
            result.accessChart.checkUrlAccess(checkParam, 'url', this.url);
            result.accessChart.maxPointsUrl += AccessibilityChart.maxUrlAccessibility;
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
            result.reuseChart.maxPointsLicense += ReusabilityChart.maxLicense;
            // 4.2. basic info + from resources
            result.reuseChart.checkBasicInfo(checkParam, 'notes', this.description);
            result.reuseChart.maxPointsInfo += ReusabilityChart.maxBasicInfo;
            // 4.3. extras
            result.reuseChart.checkExtras(this.numOfExtras);
            result.reuseChart.maxPointsExtras += ReusabilityChart.maxExtras;
            // 4.4. publisher
            result.reuseChart.checkPublisher(checkParam, 'author', this.author);
            result.reuseChart.checkPublisher(checkParam, 'maintainer', this.maintainer);
            result.reuseChart.checkPublisher(checkParam, 'owmner_org', this.ownerOrg);
            result.reuseChart.maxPointsPublisher += ReusabilityChart.maxPublisher;

            // 5. contextuality
            // 5.1. number of resources (get from database)
            // 5.2. file size (only from resources)
            // 5.3. empty data (only from resources)
            // 5.4. date of issue + from resources
            result.contextChart.checkIssueDate(this.metadataCreated);
            result.contextChart.maxPointsIssue += ContextualityChart.maxDateOfIssue;
            // 5.5. modification date + from resources
            result.contextChart.checkLastModified(this.metadataModified);
            result.contextChart.maxPointsModified += ContextualityChart.maxModificationDate;
        }
        for (let resource of fetchResources()) {
            resource.analyseResource();
            result.add(resource.result);
        }
        await result.updateDataInDB();
        this.result = result;
    }
};

// inserts a new dataset into database
var dbNewDataset = async (dataset) => {
    const sql = `INSERT INTO dataset (object_id, changed, portal_id, organization_id,
        name, title, ownerOrg, author, maintainer, private, state, description, metadataCreated,
        metadataModified, numOfExtras, numOfGroups, numOfKeywords, licenseTitle,
        licenseURL, url) VALUES ('$1', $2, '$3', '$4', '$5', '$6', '$7', '$8', '$9',
        $10, '$11', '$12', $13, $14, $15, $16, $17, '$18', '$19', '$20');`;
    const values = [
        dataset.object_id, dataset.changed, dataset.portal_id, dataset.organization_id,
        dataset.name, dataset.title, dataset.ownerOrg, dataset.author, dataset.maintainer,
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

// updates dataset data in database
var dbUpdateDataset = async (dataset) => {
    const sql = `UPDATE dataset
                    SET changed = $2, name = '$5', title = '$6', ownerOrg = '$7', author = '$8',
                        maintainer = '$9', private = $10, state = '$11', description = '$12',
                        metadataCreated = $13, metadataModified = $14, numOfExtras = $15,
                        numOfGroups = $16, numOfKeywords = $17, licenseTitle = '$18',
                        licenseURL = '$19', url = '$20'
                    WHERE object_id = '$1'
                        AND portal_id = '$3'
                        AND organization_id = '$4';`;
    const values = [
        dataset.object_id, dataset.changed, dataset.portal_id, dataset.organization_id,
        dataset.name, dataset.title, dataset.ownerOrg, dataset.author, dataset.maintainer,
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

// gets dataset from database (by its' id)
var dbGetDataset = async (dataset_id, portal_id) => {
    const sql = `SELECT * FROM dataset
                    WHERE object_id = '${dataset_id}' AND portal_id = '${portal_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
}

// gets all resources for this dataset
var dbGetResources = async (dataset_id) => {
    const sql = `SELECT * FROM resources WHERE dataset_id = ${dataset_id};`;
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err;
    }
}