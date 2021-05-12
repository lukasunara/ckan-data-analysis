const db = require('../../db');
const AccessibilityChart = require('../charts/AccessibilityChartModel');
const FindabilityChart = require('../charts/FindabilityChartModel');
const ReusabilityChart = require('../charts/ReusabilityChartModel');
const RateableObject = require('./RateableObjectModel');

// class Organization encapsulates a CKAN organization
module.exports = class Organization extends RateableObject {

    // constructor for Organization
    constructor(object_id, portal_id, name, title, description, state,
        approvalStatus, numOfExtras, numOfMembers, dateCreated, imageDisplayURL
    ) {
        super(object_id);
        this.portal_id = portal_id;
        this.name = name;
        this.title = title;
        this.description = description;
        this.state = state;
        this.approvalStatus = approvalStatus;
        this.numOfExtras = numOfExtras;
        this.numOfMembers = numOfMembers;
        this.dateCreated = dateCreated;
        this.imageDisplayURL = imageDisplayURL;
    }

    // save organization into database
    async persist() {
        super.persist(dbNewOrganization);
    }

    // update numOfExtras
    async updateNumOfExtras(numOfExtras, imageDisplayURL) {
        try {
            let rowCount = await dbUpdateOrganization(this.object_id,
                this.portal_id, numOfExtras, imageDisplayURL
            );
            if (rowCount == 0)
                console.log('WARNING: Organization has not been updated!');
            else {
                this.numOfExtras = numOfExtras;
                this.imageDisplayURL = imageDisplayURL;
            }
        } catch (err) {
            console.log('ERROR: updating organization data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // fetch organization by id
    static async fetchOrganizationById(organization_id, portal_id) {
        let result = await dbGetOrganization(organization_id, portal_id);

        if (result) {
            return new Organization(result.object_id, result.portal_id, result.name, result.title,
                result.description, result.state, result.approvalStatus, result.numOfExtras,
                result.numOfMembers, result.dateCreated, result.imageDisplayURL
            );
        }
        return null;
    }

    // fetch all datasets created by this organization
    static async fetchDatasets() {
        let results = await dbGetDatasets(this.object_id, this.portal_id);
        let datasets = [];

        for (let dataset of results) {
            let newDataset = new Dataset(dataset.object_id, dataset.portal_id, this.object_id,
                dataset.name, dataset.title, dataset.owner_org, dataset.author, dataset.maintainer,
                dataset.private, dataset.state, dataset.description, dataset.metadataCreated,
                dataset.metadataModified, dataset.numOfExtras, dataset.numOfGroups, dataset.numOfKeywords,
                dataset.licenseTitle, dataset.licenseURL, dataset.url
            );
            datasets.push(newDataset);
        }
        return datasets;
    }

    // analyse this organization
    async analyseOrganization(changedMetadata) {
        let result = new AnalysisResult(this.object_id);
        if (changedMetadata) {
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
            result.findChart.checkState(checkParam, 'approval_status', this.approvalStatus);
            result.findChart.maxPointsState += FindabilityChart.maxStateOrganization;

            // 2. accessibility
            // 2.1. dataset accessibility (only from datasets)
            // 2.2. URL accessibility + from datasets
            result.accessChart.checkUrlAccess(checkParam, 'image_display_url', this.imageDisplayURL);
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
            result.reuseChart.checkExtras(this.numOfExtras);
            result.reuseChart.checkMembers(this.numOfMembers);
            result.reuseChart.maxPointsExtras += ReusabilityChart.maxExtrasOrganization;
            // 4.4. publisher (only from datasets)

            // 5. contextuality (only from dataasets)

            for (let dataset of fetchDatasets()) {
                dataset.analyseDataset(true);
                result.add(dataset.result);
            }
        }
        this.result = result;
    }
};

// inserting a new organization into database
dbNewOrganization = async (org) => {
    const sql = `INSERT INTO organization (object_id, portal_id, name, title,
                description, state, approvalStatus, numOfExtras, numOfMembers,
                dateCreated, imageDisplayURL) VALUES ('$1', '$2', '$3', '$4',
                '$5', '$6', '$7', '$8', '$9', '$10', '$11');`;
    const values = [
        org.object_id, org.portal_id, org.name, org.title, org.description, org.state,
        org.approvalStatus, org.numOfExtras, org.numOfMembers, org.dateCreated, org.imageDisplayURL
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updating numOfExtras of organization
dbUpdateOrganization = async (organization_id, portal_id, numOfExtras, imageDisplayURL) => {
    const sql = `UPDATE organization
                    SET numOfExtras = '${numOfExtras}',
                        imageDisplayURL = '${imageDisplayURL}'
                    WHERE object_id = '${organization_id}'
                        AND portal_id = '${portal_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// gets organization from database by its' id
dbGetOrganization = async (organization_id, portal_id) => {
    const sql = `SELECT * FROM organization WHERE object_id = '${organization_id}' AND portal_id = '${portal_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
}

// gets all datasets for this organization
dbGetDatasets = async (organization_id, portal_id) => {
    const sql = `SELECT * FROM datasets WHERE organization_id = '${organization_id}'
                    AND portal_id = '${portal_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err;
    }
}