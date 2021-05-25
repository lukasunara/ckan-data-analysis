const db = require('../../db');
const { checkParam } = require('../../public/scripts/utils/analysis');
const AccessibilityChart = require('../charts/AccessibilityChartModel');
const FindabilityChart = require('../charts/FindabilityChartModel');
const InteroperabilityChart = require('../charts/InteroperabilityChartModel');
const ReusabilityChart = require('../charts/ReusabilityChartModel');
const AnalysisResult = require('./AnalysisResult');
const Organization = require('./OrganizationModel');
const RateableObject = require('./RateableObjectModel');

// class Portal encapsulates a CKAN portal
module.exports = class Portal extends RateableObject {

    // constructor for Portal
    constructor(data) {
        super(data.object_id, data.changed, data.last_updated);
        this.name = data.name;
        this.title = data.title;
        this.description = data.description;
        this.num_of_vocabularies = data.num_of_vocabularies;
        this.num_of_extensions = data.num_of_extensions;
        this.dcat_or_rdf = data.dcat_or_rdf;
        this.url = data.url;
    }

    isPersisted() {
        super.isPersisted();
    }

    // save portal into database
    async persist() {
        await super.persist(dbNewPortal);
    }

    // update portal data in database
    async update() {
        this.name = data.name;
        this.title = data.title;
        this.description = data.description;
        this.num_of_vocabularies = data.num_of_vocabularies;
        this.num_of_extensions = data.num_of_extensions;
        this.dcat_or_rdf = data.dcat_or_rdf;
        this.url = data.url;
        this.last_updated = data.last_updated;

        await super.update(dbUpdatePortal);
    }

    // fetch portal by name
    static async fetchPortalByName(name) {
        let result = await dbGetPortal(name);
        let portal = null;
        if (result) {
            portal = new Portal(result);
            portal.persisted = true;
        }
        return portal;
    }

    // fetch all portals from database
    static async fetchAllPortalsFromDB() {
        return await dbGetAllPortals();
    }

    // fetch all organizations used by this portal
    async fetchOrganizations() {
        let results = await dbGetOrganizations(this.object_id);
        let organizations = [];

        for (let organization of results) {
            let newOrganization = new Organization(organization);
            organizations.push(newOrganization);
        }
        return organizations;
    }

    // analyse this portal
    async analysePortal() {
        let result = await AnalysisResult.createAnalysisResult(this.object_id);
        if (this.changed) {
            result.reset();
            // 1. findability
            // 1.1. identification + from organizations
            result.findChart.checkIdentification(checkParam, 'name', this.name);
            result.findChart.checkIdentification(checkParam, 'title', this.title);
            result.findChart.max_id += FindabilityChart.maxIdentificationPortal;
            // 1.2. keywords (only from organizations)
            // 1.3. categories (only from organizations)
            // 1.4. state (only from organizations)

            // 2. accessibility
            // 2.1. dataset accessibility (only from organizations)
            // 2.2. URL accessibility + from organizations
            await result.accessChart.checkUrlAccess(checkParam, 'url', this.url);
            result.accessChart.max_url_acc += AccessibilityChart.maxUrlAccessibility;
            // 2.3. download URL (only from organizations)

            // 3. interoperability
            // 3.1. format (only from organizations)
            // 3.2. format diversity (only from organizations)
            // 3.3. compatibility (only from organizations)
            // 3.4. machine readable (only from organizations)
            // 3.5. linked open data + from organizations
            result.interChart.checkVocabularies(this.num_of_vocabularies);
            result.interChart.checkExtensions(this.num_of_extensions, this.dcat_or_rdf);
            result.interChart.max_lod += InteroperabilityChart.maxPortalLOD;

            // 4. reusability
            // 4.1. license (only from organizations)
            // 4.2. basic info + from organizations
            result.reuseChart.checkBasicInfo(checkParam, 'description', this.description);
            result.reuseChart.max_basic_info += ReusabilityChart.maxBasicInfo;
            // 4.3. extras (only from organizations)
            // 4.4. publisher (only from organizations)

            // 5. contextuality (only from organizations)
        }
        let organizations = await this.fetchOrganizations();
        for (let organization of organizations) {
            await organization.analyseOrganization(result, !this.changed);
            result.add(organization.result);
        }
        await result.updateDataInDB();
        await super.setChanged(this.object_id, false);

        this.result = result;
        this.organizations = organizations;
    }
};

// inserts a new portal into database
var dbNewPortal = async (portal) => {
    const sql = `INSERT INTO portal (object_id, changed, last_updated, name, title,
                        description, num_of_vocabularies, num_of_extensions, dcat_or_rdf, url)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`;
    const values = [
        portal.object_id, portal.changed, portal.last_updated, portal.name, portal.title, portal.description,
        portal.num_of_vocabularies, portal.num_of_extensions, portal.dcat_or_rdf, portal.url

    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updates portal data in database
var dbUpdatePortal = async (portal) => {
    const sql = `UPDATE portal
                    SET changed = $2, last_updated = $3, name = $4, title = $5, description = $6,
                        num_of_vocabularies = $7, num_of_extensions = $8, dcat_or_rdf = $9, url = $10
                    WHERE object_id = $1;`;
    const values = [
        portal.object_id, portal.changed, portal.last_updated, portal.name, portal.title, portal.description,
        portal.num_of_vocabularies, portal.num_of_extensions, portal.dcat_or_rdf, portal.url

    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// get all portals from database
var dbGetAllPortals = async () => {
    const sql = `SELECT object_id FROM portal';`;
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

// gets portal from database (by its' unique name)
var dbGetPortal = async (name) => {
    const sql = `SELECT * FROM portal WHERE name = '${name}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
}

// gets all organizations which are contributing to this portal
var dbGetOrganizations = async (portal_id) => {
    const sql = `SELECT * FROM organization WHERE portal_id = '${portal_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err;
    }
}