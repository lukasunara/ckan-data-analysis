const db = require('../../db');
const { checkParam } = require('../../public/scripts/utils/analysis');
const AccessibilityChart = require('../charts/AccessibilityChartModel');
const ContextualityChart = require('../charts/ContextualityChartModel');
const FindabilityChart = require('../charts/FindabilityChartModel');
const InteroperabilityChart = require('../charts/InteroperabilityChartModel');
const ReusabilityChart = require('../charts/ReusabilityChartModel');
const AnalysisResult = require('./AnalysisResult');
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
        this.owner_org = data.owner_org;
        this.author = data.author;
        this.maintainer = data.maintainer;
        this.private = data.private;
        this.state = data.state;
        this.description = data.description;
        this.metadata_created = data.metadata_created;
        this.metadata_modified = data.metadata_modified;
        this.num_of_extras = data.num_of_extras;
        this.num_of_groups = data.num_of_groups;
        this.num_of_keywords = data.num_of_keywords;
        this.license_title = data.license_title;
        this.license_url = data.license_url;
        this.url = data.url;
    }

    isPersisted() {
        super.isPersisted();
    }

    // save dataset into database
    async persist() {
        await super.persist(dbNewDataset);
    }

    // update dataset data in database
    async update(data) {
        this.name = data.name;
        this.title = data.title;
        this.owner_org = data.owner_org;
        this.author = data.author;
        this.maintainer = data.maintainer;
        this.private = data.private;
        this.state = data.state;
        this.description = data.description;
        this.metadata_created = data.metadata_created;
        this.metadata_modified = data.metadata_modified;
        this.num_of_extras = data.num_of_extras;
        this.num_of_groups = data.num_of_groups;
        this.num_of_keywords = data.num_of_keywords;
        this.license_title = data.license_title;
        this.license_url = data.license_url;
        this.url = data.url;

        await super.update(dbUpdateDataset);
    }

    // fetch dataset by id
    static async fetchDatasetById(dataset_id, portal_id) {
        let result = await dbGetDataset(dataset_id, portal_id);
        let dataset = null;
        if (result) {
            dataset = new Dataset(result);
            dataset.persisted = true;
        }
        return dataset;
    }

    // fetch all resources connected to this dataset
    async fetchResources() {
        let results = await dbGetResources(this.object_id);
        let resources = [];

        for (let resource of results) {
            let newResource = new Resource(resource);
            resources.push(newResource);
        }
        return resources;
    }

    // analyses this dataset
    async analyseDataset(organizationResult, shouldReduce) {
        let result = await AnalysisResult.createAnalysisResult(this.object_id);
        // if organization has been reseted => no need for reduce()
        if (shouldReduce)
            organizationResult.reduce(result);

        let resources = await this.fetchResources();
        if (this.changed) {
            result.reset();
            // 1. findability
            // 1.1. identification + from resources
            result.findChart.checkIdentification(checkParam, 'id', this.object_id);
            result.findChart.checkIdentification(checkParam, 'name', this.name);
            result.findChart.checkIdentification(checkParam, 'title', this.title);
            // 1.2. keywords
            result.findChart.checkKeywords(this.num_of_keywords);
            // 1.3. categories
            result.findChart.checkCategories(checkParam, 'categories', this.num_of_groups);
            // 1.4. state + from resources
            result.findChart.checkState(checkParam, 'state', this.state);

            // 2. accessibility
            // 2.1. dataset accessibility
            result.accessChart.checkDatasetAccess(checkParam, 'private', this.private);
            // 2.2. URL accessibility
            await result.accessChart.checkUrlAccess(checkParam, 'url', this.url);
            // 2.3. download URL (only from resources)

            // 3. interoperability
            // 3.1. format (only from resources)
            // 3.2. format diversity (get from resources in database)
            // 3.3. compatibility (only from resources)
            // 3.4. machine readable (only from resources)
            // 3.5. linked open data (not calculated)

            // 4. reusability
            // 4.1. license
            result.reuseChart.checkLicenseTitle(checkParam, 'license_title', this.license_title);
            await result.reuseChart.checkLicenseUrl(checkParam, 'license_url', this.license_url);
            // 4.2. basic info + from resources
            result.reuseChart.checkBasicInfo(checkParam, 'notes', this.description);
            // 4.3. extras
            result.reuseChart.checkExtras(this.num_of_extras);
            // 4.4. publisher
            result.reuseChart.checkPublisher(checkParam, 'author', this.author);
            result.reuseChart.checkPublisher(checkParam, 'maintainer', this.maintainer);
            result.reuseChart.checkPublisher(checkParam, 'owmner_org', this.owner_org);

            // 5. contextuality
            // 5.1. number of resources (get from database)
            result.contextChart.checkNumOfResources(resources.length);
            // 5.2. file size (only from resources)
            // 5.3. empty data (only from resources)
            // 5.4. date of issue + from resources
            result.contextChart.checkDateOfIssue(this.metadata_created);
            // 5.5. modification date + from resources
            result.contextChart.checkLastModified(this.metadata_modified);
        }
        result.findChart.maxPointsID += FindabilityChart.maxIdentification;
        result.findChart.maxPointsKeywords += FindabilityChart.maxKeywords;
        result.findChart.maxPointsCategories += FindabilityChart.maxCategories;
        result.findChart.maxPointsState += FindabilityChart.maxState;
        result.accessChart.maxPointsDataset += AccessibilityChart.maxDatasetAccessibility;
        result.accessChart.maxPointsUrl += AccessibilityChart.maxUrlAccessibility;
        result.reuseChart.maxPointsLicense += ReusabilityChart.maxLicense;
        result.reuseChart.maxPointsInfo += ReusabilityChart.maxBasicInfo;
        result.reuseChart.maxPointsExtras += ReusabilityChart.maxExtras;
        result.reuseChart.maxPointsPublisher += ReusabilityChart.maxPublisher;
        result.contextChart.maxPointsResources += ContextualityChart.maxNumOfResources;
        result.contextChart.maxPointsIssue += ContextualityChart.maxDateOfIssue;
        result.contextChart.maxPointsModified += ContextualityChart.maxModificationDate;

        let formats = new Set();
        for (let resource of resources) {
            if (resource.format && !formats.has(resource.format))
                formats.add(resource.format);

            await resource.analyseResource(result, !this.changed);
            result.add(resource.result);
        }
        // 3.2. format diversity (get from resources in database)
        if (organizationResult)
            organizationResult.interChart.format_diversity -= result.interChart.format_diversity;
        result.interChart.format_diversity -= result.interChart.format_diversity;
        result.interChart.checkFormatDiversity(formats.size);
        result.interChart.format_diversity += result.interChart.format_diversity;
        if (organizationResult)
            organizationResult.interChart.format_diversity += result.interChart.format_diversity;
        result.interChart.maxPointsFormatDiv += InteroperabilityChart.maxFormatDiversity;

        await result.updateDataInDB();
        await super.setChanged(this.object_id, false);

        this.result = result;
        this.resources = resources;
    }
};

// inserts a new dataset into database
var dbNewDataset = async (dataset) => {
    const sql = `INSERT INTO dataset (object_id, changed, portal_id, organization_id,
        name, title, owner_org, author, maintainer, private, state, description, metadata_created,
        metadata_modified, num_of_extras, num_of_groups, num_of_keywords, license_title,
        license_url, url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                                        $14, $15, $16, $17, $18, $19, $20);`;
    const values = [
        dataset.object_id, dataset.changed, dataset.portal_id, dataset.organization_id,
        dataset.name, dataset.title, dataset.owner_org, dataset.author, dataset.maintainer,
        dataset.private, dataset.state, dataset.description, dataset.metadata_created,
        dataset.metadata_modified, dataset.num_of_extras, dataset.num_of_groups,
        dataset.num_of_keywords, dataset.license_title, dataset.license_url, dataset.url
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
                    SET changed = $2, name = $5, title = $6, owner_org = $7, author = $8,
                        maintainer = $9, private = $10, state = $11, description = $12,
                        metadata_created = $13, metadata_modified = $14, num_of_extras = $15,
                        num_of_groups = $16, num_of_keywords = $17, license_title = $18,
                        license_url = $19, url = $20
                    WHERE object_id = $1
                        AND portal_id = $3
                        AND organization_id = $4;`;
    const values = [
        dataset.object_id, dataset.changed, dataset.portal_id, dataset.organization_id,
        dataset.name, dataset.title, dataset.owner_org, dataset.author, dataset.maintainer,
        dataset.private, dataset.state, dataset.description, dataset.metadata_created,
        dataset.metadata_modified, dataset.num_of_extras, dataset.num_of_groups,
        dataset.num_of_keywords, dataset.license_title, dataset.license_url, dataset.url
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
    const sql = `SELECT * FROM resource WHERE dataset_id = '${dataset_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err;
    }
}