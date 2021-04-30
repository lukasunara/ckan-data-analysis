const db = require('../../db');
const RateableObject = require('./RateableObjectModel');

// class Portal encapsulates a CKAN portal
module.exports = class Portal extends RateableObject {

    // constructor for Portal
    constructor(object_id, name) {
        super(object_id);
        this.name = name;
    }

    // save portal into database
    async persist() {
        try {
            let rowCount = await dbNewPortal(this);
            if (rowCount == 0)
                console.log('WARNING: Portal has not been persisted!');
            else
                this.persisted = true;
        } catch (err) {
            console.log('ERROR: persisting portal data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // update portal name
    async updatePortalName(name) {
        try {
            let rowCount = await dbUpdatePortalName(this.object_id, name);
            if (rowCount == 0)
                console.log('WARNING: Portal has not been updated!');
            else
                this.name = name;
        } catch (err) {
            console.log('ERROR: updating portal data: ' + JSON.stringify(this));
            throw err;
        }
    }
};

// inserting a new portal into database
dbNewPortal = async (portal) => {
    const sql = `INSERT INTO portal (object_id, name) VALUES (
        '${portal.object_id}', '${portal.name}');`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updating portalName of a portal
dbUpdatePortalName = async (portal_id, portal_name) => {
    const sql = `UPDATE portal
                    SET name = '${portal_name}'
                    WHERE object_id = '${portal_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};