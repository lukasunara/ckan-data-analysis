const db = require('../../db');

const { checkParam } = require('../../public/scripts/utils/analysis');

const FindabilityChart = require('../charts/FindabilityChartModel');
const AccessibilityChart = require('../charts/AccessibilityChartModel');
const InteroperabilityChart = require('../charts/InteroperabilityChartModel');
const ReusabilityChart = require('../charts/ReusabilityChartModel');
const ContextualityChart = require('../charts/ContextualityChartModel');

const RateableObject = require('./RateableObjectModel');
const Resource = require('./ResourceModel');
const AnalysisResult = require('./AnalysisResult');

// class Dataset encapsulates a CKAN dataset
module.exports = class Dataset extends RateableObject {

    // constructor for Dataset
    constructor(data) {
        super(data.object_id, data.changed, data.last_updated);
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
        this.created = data.created;
        this.last_modified = data.last_modified;
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
        this.created = data.created;
        this.last_modified = data.last_modified;
        this.num_of_extras = data.num_of_extras;
        this.num_of_groups = data.num_of_groups;
        this.num_of_keywords = data.num_of_keywords;
        this.license_title = data.license_title;
        this.license_url = data.license_url;
        this.url = data.url;
        this.last_updated = data.last_updated;

        await super.update(dbUpdateDataset);
    }

    // fetch dataset by id
    static async fetchDatasetById(dataset_id) {
        let result = await dbGetDataset(dataset_id);
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
        if (shouldReduce) organizationResult.reduce(result);

        let resources = await this.fetchResources();
        if (this.changed) {
            result.reset();
            // 1. findability
            // 1.1. identification + from resources
            result.findChart.checkIdentification(checkParam, 'id', this.object_id);
            result.findChart.checkIdentification(checkParam, 'name', this.name);
            result.findChart.checkIdentification(checkParam, 'title', this.title);
            result.findChart.max_id += FindabilityChart.maxIdentification;
            // 1.2. keywords
            result.findChart.checkKeywords(this.num_of_keywords);
            result.findChart.max_key += FindabilityChart.maxKeywords;
            // 1.3. categories
            result.findChart.checkCategories(checkParam, 'categories', this.num_of_groups);
            result.findChart.max_cat += FindabilityChart.maxCategories;
            // 1.4. state + from resources
            result.findChart.checkState(checkParam, 'state', this.state);
            result.findChart.max_state += FindabilityChart.maxState;

            // 2. accessibility
            // 2.1. dataset accessibility
            result.accessChart.checkDatasetAccess(checkParam, 'private', this.private);
            result.accessChart.max_dataset_acc += AccessibilityChart.maxDatasetAccessibility;
            // 2.2. URL accessibility
            await result.accessChart.checkUrlAccess(checkParam, 'url', this.url);
            result.accessChart.max_url_acc += AccessibilityChart.maxUrlAccessibility;
            // 2.3. download URL (only from resources)

            // 3. interoperability
            // 3.1. format (only from resources)
            // 3.2. format diversity (get from resources in database)
            result.interChart.max_format_div += InteroperabilityChart.maxFormatDiversity;
            // 3.3. compatibility (only from resources)
            // 3.4. machine readable (only from resources)
            // 3.5. linked open data (always calculated)
            result.interChart.max_lod += InteroperabilityChart.maxDatasetLOD;

            // 4. reusability
            // 4.1. license
            result.reuseChart.checkLicenseTitle(checkParam, 'license_title', this.license_title);
            await result.reuseChart.checkLicenseUrl(checkParam, 'license_url', this.license_url);
            result.reuseChart.max_license += ReusabilityChart.maxLicense;
            // 4.2. basic info + from resources
            result.reuseChart.checkBasicInfo(checkParam, 'notes', this.description);
            result.reuseChart.max_basic_info += ReusabilityChart.maxBasicInfo;
            // 4.3. extras
            result.reuseChart.checkExtras(this.num_of_extras);
            result.reuseChart.max_extras += ReusabilityChart.maxExtras;
            // 4.4. publisher
            result.reuseChart.checkPublisher(checkParam, 'author', this.author);
            result.reuseChart.checkPublisher(checkParam, 'maintainer', this.maintainer);
            result.reuseChart.checkPublisher(checkParam, 'owmner_org', this.owner_org);
            result.reuseChart.max_publisher += ReusabilityChart.maxPublisher;

            // 5. contextuality
            // 5.1. number of resources (get from database)
            result.contextChart.checkNumOfResources(resources.length);
            result.contextChart.max_num_of_res += ContextualityChart.maxNumOfResources;
            // 5.2. file size (only from resources)
            // 5.3. empty data (only from resources)
            // 5.4. date of issue + from resources
            result.contextChart.checkDateOfIssue(this.created);
            result.contextChart.max_date_of_issue += ContextualityChart.maxDateOfIssue;
            // 5.5. modification date + from resources
            result.contextChart.checkLastModified(this.last_modified);
            result.contextChart.max_modification_date += ContextualityChart.maxModificationDate;
            // 5.6. data age (only from resources)
        }
        let formats = new Set();
        for (let resource of resources) {
            if (resource.format && !formats.has(resource.format))
                formats.add(resource.format);

            await resource.analyseResource(result, !this.changed);
            result.add(resource.result);
        }
        // 3.2. format diversity (get from resources in database)
        result.interChart.format_diversity -= result.interChart.format_diversity;
        result.interChart.checkFormatDiversity(formats.size);

        // 3.5. linked open data
        result.interChart.linked_open_data -= result.interChart.linked_open_data;
        await result.interChart.checkDatasetLOD(this.portal_id, this.object_id);

        await result.updateDataInDB();
        await super.setChanged(this.object_id, false);

        this.result = result;
        this.resources = resources;
    }
};

// inserts a new dataset into database
var dbNewDataset = async (dataset) => {
    const sql = `INSERT INTO dataset (object_id, changed, last_updated, portal_id, organization_id,
        name, title, owner_org, author, maintainer, private, state, description, created,
        last_modified, num_of_extras, num_of_groups, num_of_keywords, license_title,
        license_url, url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                            $15, $16, $17, $18, $19, $20, $21);`;
    const values = [
        dataset.object_id, dataset.changed, dataset.last_updated, dataset.portal_id, dataset.organization_id,
        dataset.name, dataset.title, dataset.owner_org, dataset.author, dataset.maintainer,
        dataset.private, dataset.state, dataset.description, dataset.created, dataset.last_modified,
        dataset.num_of_extras, dataset.num_of_groups, dataset.num_of_keywords, dataset.license_title,
        dataset.license_url, dataset.url
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
                    SET changed = $2, last_updated = $3, name = $4, title = $5, owner_org = $6,
                        author = $7, maintainer = $8, private = $9, state = $10, description = $11,
                        created = $12, last_modified = $13, num_of_extras = $14,
                        num_of_groups = $15, num_of_keywords = $16, license_title = $17,
                        license_url = $18, url = $19
                    WHERE object_id = $1;`;
    const values = [
        dataset.object_id, dataset.changed, dataset.last_updated, dataset.name, dataset.title,
        dataset.owner_org, dataset.author, dataset.maintainer, dataset.private, dataset.state,
        dataset.description, dataset.created, dataset.last_modified, dataset.num_of_extras,
        dataset.num_of_groups, dataset.num_of_keywords, dataset.license_title, dataset.license_url,
        dataset.url
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
var dbGetDataset = async (dataset_id) => {
    const sql = `SELECT * FROM dataset WHERE object_id = '${dataset_id}';`;
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