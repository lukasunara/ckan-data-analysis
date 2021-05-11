const db = require('../../db');
const RateableObject = require('./RateableObjectModel');

// class Portal encapsulates a CKAN portal
module.exports = class Portal extends RateableObject {

    // constructor for Portal
    constructor(object_id, name, title, description, numOfVocabularies, numOfExtensions, dcatOrRdf, url) {
        super(object_id);
        this.name = name;
        this.title = title;
        this.description = description;
        this.numOfVocabularies = numOfVocabularies;
        this.numOfExtensions = numOfExtensions;
        this.dcatOrRdf = dcatOrRdf;
        this.url = url;
    }

    // save portal into database
    async persist() {
        super.persist(dbNewPortal);
    }

    // update portal name
    async updatePortalName(name, title, description, numOfVocabularies, numOfExtensions, dcatOrRdf, url) {
        try {
            let rowCount = await dbUpdatePortalName(this.object_id, name, title, description,
                numOfVocabularies, numOfExtensions, dcatOrRdf, url
            );
            if (rowCount == 0)
                console.log('WARNING: Portal has not been updated!');
            else
                this.name = name;
        } catch (err) {
            console.log('ERROR: updating portal data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // fetch portal by name
    static async fetchPortalByName(name) {
        let result = await dbGetPortal(name);

        if (result) {
            return new Portal(result.object_id, result.name,
                result.title, result.description, result.numOfVocabularies,
                result.numOfExtensions, result.dcatOrRdf, result.url
            );
        }
        return null;
    }

    // fetch all organizations used by this portal
    async fetchOrganizations() {
        let results = await dbGetOrganizations(this.object_id);
        let organizations = [];

        for (let organization of results) {
            let newOrganization = new Organization(organization.object_id,
                organization.object_id, organization.name, organization.title, organization.state,
                organization.approvalStatus, organization.packages, organization.numOfExtras,
                organization.numOfMembers, organization.dataCreated, organization.imageDisplayURL
            );
            organizations.push(newOrganization);
        }
        return organizations;
    }

    // analyse this portal
    async analysePortal(changedMetadata) {
        let result = new AnalysisResult();
        // 1. findability (only from organizations)
        // 2. accessibility (only from organizations)
        if (changedMetadata) {
            // 3. interoperability
            // 3.1. format (only from organizations)
            // 3.2. format diversity (only from organizations)
            // 3.3. compatibility (only from organizations)
            // 3.4. machine readable (only from organizations)
            // 3.5. linked open data
            result.interChart.checkVocabularies(this.numOfVocabularies);
            result.interChart.checkExtensions(this.numOfExtensions, this.dcatOrRdf);

            // 4. reusability
            // 4.1. license (only from organizations)
            // 4.2. basic info + from organizations
            result.reuseChart.checkBasicInfo(checkParam, 'description', this.description);
            // 4.3. extras (only from organizations)
            // 4.4. publisher (only from organizations)
        }
        // 5. contextuality (only from organizations)

        for (let organization of fetchOrganizations()) {
            // organization.analyseOrganization();
        }

        // overall rating
        this.result = result;
    }
};

// inserting a new portal into database
dbNewPortal = async (portal) => {
    const sql = `INSERT INTO portal (object_id, name, title, description, url)
                    VALUES ('$1', '$2', '$3', '$4', '$5');`;
    const values = [
        portal.object_id, portal.name, portal.title, portal.description, portal.url
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updating portalName of a portal
dbUpdatePortalName = async (portal_id, name, title, description, url) => {
    const sql = `UPDATE portal
                    SET name = '${name}',
                        title = '${title}',
                        description = '${description}',
                        url = '${url}'
                    WHERE object_id = '${portal_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// gets portal from database by its' name
dbGetPortal = async (name) => {
    const sql = `SELECT * FROM portal WHERE name = '${name}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err;
    }
}

// gets all organizations used on this portal
dbGetOrganizations = async (portal_id) => {
    const sql = `SELECT * FROM organization WHERE portal_id = '${portal_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err;
    }
}