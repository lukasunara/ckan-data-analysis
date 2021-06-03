const db = require('../../db');
const { checkParam } = require('../../public/scripts/utils/analysis');
const AccessibilityChart = require('../charts/AccessibilityChartModel');
const ContextualityChart = require('../charts/ContextualityChartModel');
const FindabilityChart = require('../charts/FindabilityChartModel');
const ReusabilityChart = require('../charts/ReusabilityChartModel');
const AnalysisResult = require('./AnalysisResult');
const Dataset = require('./DatasetModel');
const RateableObject = require('./RateableObjectModel');

// class Organization encapsulates a CKAN organization
module.exports = class Organization extends RateableObject {

    // constructor for Organization
    constructor(data) {
        super(data.object_id, data.changed, data.last_updated);
        this.portal_id = data.portal_id;
        this.name = data.name;
        this.title = data.title;
        this.description = data.description;
        this.state = data.state;
        this.approval_status = data.approval_status;
        this.num_of_extras = data.num_of_extras;
        this.num_of_members = data.num_of_members;
        this.created = data.created;
        this.image_display_url = data.image_display_url;
    }

    isPersisted() {
        super.isPersisted();
    }

    // save organization into database
    async persist() {
        await super.persist(dbNewOrganization);
    }

    // update organization data in database
    async update(data) {
        this.name = data.name;
        this.title = data.title;
        this.description = data.description;
        this.state = data.state;
        this.approval_status = data.approval_status;
        this.num_of_extrasfExtras = data.num_of_extras;
        this.num_of_members = data.num_of_members;
        this.created = data.created;
        this.image_display_url = data.image_display_url;
        this.last_updated = data.last_updated;

        await super.update(dbUpdateOrganization);
    }

    // fetch organization by id
    static async fetchOrganizationById(organization_id) {
        let result = await dbGetOrganization(organization_id);
        let organization = null;
        if (result) {
            organization = new Organization(result);
            organization.persisted = true;
        }
        return organization;
    }

    // fetch all datasets created by this organization
    async fetchDatasets() {
        let results = await dbGetDatasets(this.object_id);
        let datasets = [];

        for (let dataset of results) {
            let newDataset = new Dataset(dataset);
            datasets.push(newDataset);
        }
        return datasets;
    }

    // analyse this organization
    async analyseOrganization(portalResult, shouldReduce) {
        let result = await AnalysisResult.createAnalysisResult(this.object_id);
        // if portal has been reseted => no need for reduce()
        if (shouldReduce) portalResult.reduce(result);

        if (this.changed) {
            result.reset();
            // 1. findability
            // 1.1. identification + from datasets
            result.findChart.checkIdentification(checkParam, 'id', this.object_id);
            result.findChart.checkIdentification(checkParam, 'name', this.name);
            result.findChart.checkIdentification(checkParam, 'title', this.title);
            result.findChart.max_id += FindabilityChart.maxIdentification;
            // 1.2. keywords (only from datasets)
            // 1.3. categories (only from datasets)
            // 1.4. state + from datasets
            result.findChart.checkState(checkParam, 'state', this.state);
            result.findChart.checkState(checkParam, 'approval_status', this.approval_status);
            result.findChart.max_state += FindabilityChart.maxStateOrganization;

            // 2. accessibility
            // 2.1. dataset accessibility (only from datasets)
            // 2.2. URL accessibility + from datasets
            await result.accessChart.checkUrlAccess(checkParam, 'image_display_url', this.image_display_url);
            result.accessChart.max_url_acc += AccessibilityChart.maxUrlAccessibility;
            // 2.3. download URL (only from datasets)

            // 3. interoperability
            // 3.1. format (only from datasets)
            // 3.2. format diversity (only from datasets)
            // 3.3. compatibility (only from datasets)
            // 3.4. machine readable (only from datasets)
            // 3.5. linked open data (only from datasets)

            // 4. reusability
            // 4.1. license (only from datasets)
            // 4.2. basic info + from datasets
            result.reuseChart.checkBasicInfo(checkParam, 'description', this.description);
            result.reuseChart.max_basic_info += ReusabilityChart.maxBasicInfo
            // 4.3. extras + from datasets
            result.reuseChart.checkExtras(this.num_of_extras);
            result.reuseChart.checkMembers(this.num_of_members);
            result.reuseChart.max_extras += ReusabilityChart.maxExtrasOrganization;
            // 4.4. publisher (only from datasets)

            // 5. contextuality
            // 5.1. number of resources (only from dataasets)
            // 5.2. file size (only from dataasets)
            // 5.3. empty data (only from dataasets)
            // 5.4. date of issue + from datasets
            result.contextChart.checkDateOfIssue(this.created);
            result.contextChart.max_date_of_issue += ContextualityChart.maxDateOfIssue;
            // 5.5. modification date (only from dataasets)
        }
        let datasets = await this.fetchDatasets();
        for (let dataset of datasets) {
            await dataset.analyseDataset(result, !this.changed);
            result.add(dataset.result);
        }
        await result.updateDataInDB();
        await super.setChanged(this.object_id, false);

        this.result = result;
        this.datasets = datasets;
    }
};

// inserts a new organization into database
var dbNewOrganization = async (org) => {
    const sql = `INSERT INTO organization (object_id, changed, last_updated, portal_id, name,
                title, description, state, approval_status, num_of_extras, num_of_members,
                created, image_display_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,
                                                    $10, $11, $12, $13);`;
    const values = [
        org.object_id, org.changed, org.last_updated, org.portal_id, org.name, org.title,
        org.description, org.state, org.approval_status, org.num_of_extras, org.num_of_members,
        org.created, org.image_display_url
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updates organization data in database
var dbUpdateOrganization = async (org) => {
    const sql = `UPDATE organization
                    SET changed = $2, last_updated = $3, name = $4, title = $5, description = $6,
                        state = $7, approval_status = $8, num_of_extras = $9, num_of_members = $10,
                        created = $11, image_display_url = $12
                    WHERE object_id = $1;`;
    const values = [
        org.object_id, org.changed, org.last_updated, org.name, org.title, org.description,
        org.state, org.approval_status, org.num_of_extras, org.num_of_members, org.created,
        org.image_display_url
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// gets organization from database (by its' id)
var dbGetOrganization = async (organization_id) => {
    const sql = `SELECT * FROM organization WHERE object_id = '${organization_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
}

// gets all datasets from database for this organization
var dbGetDatasets = async (organization_id) => {
    const sql = `SELECT * FROM dataset WHERE organization_id = '${organization_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err;
    }
}