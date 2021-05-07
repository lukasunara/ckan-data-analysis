const db = require('../../db');
const RateableObject = require('./RateableObjectModel');

// class Portal encapsulates a CKAN portal
module.exports = class Portal extends RateableObject {

    // constructor for Portal
    constructor(object_id, name, title, description, url) {
        super(object_id);
        this.name = name;
        this.title = title;
        this.description = description;
        this.url = url;
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
    async updatePortalName(name, title, description, url) {
        try {
            let rowCount = await dbUpdatePortalName(this.object_id, name, title, description, url);
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