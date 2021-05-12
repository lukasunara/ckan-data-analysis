const db = require('../../db');
const FindabilityChart = require('../charts/FindabilityChartModel');
const InteroperabilityChart = require('../charts/InteroperabilityChartModel');
const ReusabilityChart = require('../charts/ReusabilityChartModel');
const RateableObject = require('./RateableObjectModel');

// class Portal encapsulates a CKAN portal
module.exports = class Portal extends RateableObject {

    // constructor for Portal
    constructor(data) {
        super(data.object_id, data.changed);
        this.name = data.name;
        this.title = data.title;
        this.description = data.description;
        this.numOfVocabularies = data.numOfVocabularies;
        this.numOfExtensions = data.numOfExtensions;
        this.dcatOrRdf = data.dcatOrRdf;
        this.url = data.url;
    }

    // save portal into database
    async persist() {
        super.persist(dbNewPortal);
    }

    // update portal data in database
    async update() {
        super.update(dbUpdatePortal);
    }

    // fetch portal by name
    static async fetchPortalByName(name) {
        let result = await dbGetPortal(name);
        if (result) {
            return new Portal(result);
        }
        return null;
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
        let result = new AnalysisResult(this.object_id);
        if (this.changed) {
            // 1. findability
            // 1.1. identification + from organizations
            result.findChart.checkIdentification(checkParam, 'name', this.name);
            result.findChart.checkIdentification(checkParam, 'title', this.title);
            result.findChart.maxPointsID += FindabilityChart.maxIdentificationPortal;
            // 1.2. keywords (only from organizations)
            // 1.3. categories (only from organizations)
            // 1.4. state (only from organizations)

            // 2. accessibility
            // 2.1. dataset accessibility (only from organizations)
            // 2.2. URL accessibility + from organizations
            result.accessChart.checkUrlAccess(checkParam, 'url', this.url);
            result.accessChart.maxPointsUrl += AccessibilityChart.maxUrlAccessibility;
            // 2.3. download URL (only from organizations)

            // 3. interoperability
            // 3.1. format (only from organizations)
            // 3.2. format diversity (only from organizations)
            // 3.3. compatibility (only from organizations)
            // 3.4. machine readable (only from organizations)
            // 3.5. linked open data
            result.interChart.checkVocabularies(this.numOfVocabularies);
            result.interChart.checkExtensions(this.numOfExtensions, this.dcatOrRdf);
            result.interChart.maxPointsLOD += InteroperabilityChart.maxLinkedOpenData;

            // 4. reusability
            // 4.1. license (only from organizations)
            // 4.2. basic info + from organizations
            result.reuseChart.checkBasicInfo(checkParam, 'description', this.description);
            result.reuseChart.maxPointsInfo += ReusabilityChart.maxBasicInfo;
            // 4.3. extras (only from organizations)
            // 4.4. publisher (only from organizations)

            // 5. contextuality (only from organizations)
        }
        for (let organization of fetchOrganizations()) {
            organization.analyseOrganization();
            result.add(organization.result);
        }
        await result.updateDataInDB();
        this.result = result;
    }
};

// inserts a new portal into database
var dbNewPortal = async (portal) => {
    const sql = `INSERT INTO portal (object_id, changed, name, title, description,
                        numOfVocabularies, numOfExtensions, dcatOrRdf, url)
                    VALUES ('$1', $2, '$3', '$4', '$5', $6, $7, $8, '$9');`;
    const values = [
        portal.object_id, portal.changed, portal.name, portal.title, portal.description,
        portal.numOfVocabularies, portal.numOfExtensions, portal.dcatOrRdf, portal.url
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
                    SET changed = $2, name = '$3', title = '$4', description = '$5',
                        numOfVocabularies = $6, numOfExtensions = $7, dcatOrRdf = $8, url = '$9'
                    WHERE object_id = '$1';`;
    const values = [
        portal.object_id, portal.changed, portal.name, portal.title, portal.description,
        portal.numOfVocabularies, portal.numOfExtensions, portal.dcatOrRdf, portal.url
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

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