const db = require('../../db');
const { checkParam } = require('../../public/scripts/analysis');
const AccessibilityChart = require('../charts/AccessibilityChartModel');
const FindabilityChart = require('../charts/FindabilityChartModel');
const ReusabilityChart = require('../charts/ReusabilityChartModel');
const AnalysisResult = require('./AnalysisResult');
const Dataset = require('./DatasetModel');
const RateableObject = require('./RateableObjectModel');

// class Organization encapsulates a CKAN organization
module.exports = class Organization extends RateableObject {

    // constructor for Organization
    constructor(data) {
        super(data.object_id, data.changed);
        this.portal_id = data.portal_id;
        this.name = data.name;
        this.title = data.title;
        this.description = data.description;
        this.state = data.state;
        this.approval_status = data.approval_status;
        this.num_of_extras = data.num_of_extras;
        this.num_of_members = data.num_of_members;
        this.date_created = data.date_created;
        this.image_display_url = data.image_display_url;
        this.date_of_storage = data.date_of_storage;
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
        this.date_created = data.date_created;
        this.image_display_url = data.image_display_url;
        this.date_of_storage = data.date_of_storage;

        await super.update(dbUpdateOrganization);
    }

    // fetch organization by id
    static async fetchOrganizationById(organization_id, portal_id) {
        let result = await dbGetOrganization(organization_id, portal_id);
        let organization = null;
        if (result) {
            organization = new Organization(result);
            organization.persisted = true;
        }
        return organization;
    }

    // fetch all datasets created by this organization
    async fetchDatasets() {
        let results = await dbGetDatasets(this.object_id, this.portal_id);
        let datasets = [];

        for (let dataset of results) {
            let newDataset = new Dataset(dataset);
            datasets.push(newDataset);
        }
        return datasets;
    }

    // analyse this organization
    async analyseOrganization() {
        let result = await AnalysisResult.createAnalysisResult(this.object_id);
        if (this.changed) {
            result.reset();
            // 1. findability
            // 1.1. identification + from datasets
            result.findChart.checkIdentification(checkParam, 'id', this.object_id);
            result.findChart.checkIdentification(checkParam, 'name', this.name);
            result.findChart.checkIdentification(checkParam, 'title', this.title);
            result.findChart.maxPointsID += FindabilityChart.maxIdentification;
            // 1.2. keywords (only from datasets)
            // 1.3. categories (only from datasets)
            // 1.4. state + from datasets
            result.findChart.checkState(checkParam, 'state', this.state);
            result.findChart.checkState(checkParam, 'approval_status', this.approval_status);
            result.findChart.maxPointsState += FindabilityChart.maxStateOrganization;

            // 2. accessibility
            // 2.1. dataset accessibility (only from datasets)
            // 2.2. URL accessibility + from datasets
            await result.accessChart.checkUrlAccess(checkParam, 'image_display_url', this.image_display_url);
            result.accessChart.maxPointsUrl += AccessibilityChart.maxUrlAccessibility;
            // 2.3. download URL (only from datasets)

            // 3. interoperability
            // 3.1. format (only from datasets)
            // 3.2. format diversity (only from datasets)
            // 3.3. compatibility (only from datasets)
            // 3.4. machine readable (only from datasets)
            // 3.5. linked open data (not calculated)

            // 4. reusability
            // 4.1. license (only from datasets)
            // 4.2. basic info + from datasets
            result.reuseChart.checkBasicInfo(checkParam, 'description', this.description);
            result.reuseChart.maxPointsInfo += ReusabilityChart.maxBasicInfo
            // 4.3. extras + from datasets
            result.reuseChart.checkExtras(this.num_of_extras);
            result.reuseChart.checkMembers(this.num_of_members);
            result.reuseChart.maxPointsExtras += ReusabilityChart.maxExtrasOrganization;
            // 4.4. publisher (only from datasets)

            // 5. contextuality (only from dataasets)
        }
        for (let dataset of (await this.fetchDatasets())) {
            await dataset.analyseDataset();
            result.add(dataset.result);
        }
        await result.updateDataInDB();
        await super.setChanged(this.object_id, false);
        this.result = result;
    }
};

// inserts a new organization into database
var dbNewOrganization = async (org) => {
    const sql = `INSERT INTO organization (object_id, changed, portal_id, name,
                title, description, state, approval_status, num_of_extras, num_of_members,
                date_created, image_display_url, date_of_storage) VALUES ($1, $2, $3, $4,
                $5, $6, $7, $8, $9, $10, $11, $12, $13);`;
    const values = [
        org.object_id, org.changed, org.portal_id, org.name, org.title, org.description,
        org.state, org.approval_status, org.num_of_extras, org.num_of_members, org.date_created,
        org.image_display_url, org.date_of_storage
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
                    SET changed = $2, name = $4, title = $5, description = $6, state = $7,
                        approval_status = $8, num_of_extras = $9, num_of_members = $10,
                        date_created = $11, image_display_url = $12, date_of_storage = $13
                    WHERE object_id = $1
                        AND portal_id = $3;`;
    const values = [
        org.object_id, org.changed, org.portal_id, org.name, org.title, org.description,
        org.state, org.approval_status, org.num_of_extras, org.num_of_members, org.date_created,
        org.image_display_url, org.date_of_storage
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
var dbGetOrganization = async (organization_id, portal_id) => {
    const sql = `SELECT * FROM organization
                    WHERE object_id = '${organization_id}' AND portal_id = '${portal_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
}

// gets all datasets from database for this organization
var dbGetDatasets = async (organization_id, portal_id) => {
    const sql = `SELECT * FROM dataset
                    WHERE organization_id = '${organization_id}' AND portal_id = '${portal_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err;
    }
}