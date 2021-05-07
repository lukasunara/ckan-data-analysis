const db = require('../../db');
const RateableObject = require('./RateableObjectModel');

// class Organization encapsulates a CKAN organization
module.exports = class Organization extends RateableObject {

    // constructor for Organization
    constructor(object_id, portal_id, name, title, description, state, approvalStatus
        , packages, numOfExtras, numOfMembers, dateCreated, imageDisplayURL
    ) {
        super(object_id);
        this.portal_id = portal_id;
        this.name = name;
        this.title = title;
        this.description = description;
        this.state = state;
        this.approvalStatus = approvalStatus;
        this.packages = packages;
        this.numOfExtras = numOfExtras;
        this.numOfMembers = numOfMembers;
        this.dateCreated = dateCreated;
        this.imageDisplayURL = imageDisplayURL;
    }

    // save organization into database
    async persist() {
        try {
            let rowCount = await dbNewOrganization(this);
            if (rowCount == 0)
                console.log('WARNING: Organization has not been persisted!');
            else
                this.persisted = true;
        } catch (err) {
            console.log('ERROR: persisting organization data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // update numOfExtras
    async updateNumOfExtras(numOfExtras, imageDisplayURL) {
        try {
            let rowCount = await dbUpdateNumOfExtras(this.object_id, this.portal_id, numOfExtras, imageDisplayURL);
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
};

// inserting a new organization into database
dbNewOrganization = async (org) => {
    const sql = `INSERT INTO organization (object_id, portal_id, name, title,
                description, state, approvalStatus, packages, numOfExtras,
                numOfMembers, dateCreated, imageDisplayURL) VALUES ('$1', '$2',
                '$3', '$4', '$5', '$6', '$7', '$8', '$9', '$10', '$11', '$12');`;
    const values = [
        org.object_id, org.portal_id, org.name, org.title, org.description,
        org.state, org.approvalStatus, org.packages, org.numOfExtras,
        org.numOfMembers, org.dateCreated, org.imageDisplayURL
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
dbUpdateNumOfExtras = async (organization_id, portal_id, numOfExtras, imageDisplayURL) => {
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