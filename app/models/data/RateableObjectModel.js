const db = require('../../db');

// class RateableObject encapsulates a rateable object
module.exports = class RateableObject {

    constructor(object_id, changed) {
        if (this.constructor === RateableObject) {
            throw new TypeError('Abstract class "RateableObject" cannot be instantiated directly.');
        }
        this.object_id = object_id;
        this.changed = changed;
        this.persisted = false;
    }

    // has object been saved into database?
    isPersisted() {
        return this.persisted;
    }

    // save resource into database
    async persist(dbNewFunction) {
        try {
            let rowCount = await dbNewFunction(this);
            if (!rowCount) {
                console.log('WARNING: RateableObject has not been persisted!');
            } else {
                this.persisted = true;
                this.changed = true;
            }
        } catch (err) {
            console.log('ERROR: persisting RateableObject data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // delete this rateable object from database
    async deletePortal() {
        try {
            let rowCount = await dbDeleteRateableObject(this);
            if (!rowCount)
                console.log('WARNING: Rateable object has not been deleted!');
        } catch (err) {
            console.log('ERROR: deleting rateable object data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // update object data in database
    async update(dbUpdateMethod) {
        this.changed = true;
        try {
            let rowCount = await dbUpdateMethod(this);
            if (!rowCount) {
                console.log('WARNING: RateableObject has not been updated!');
                this.changed = false;
            }
        } catch (err) {
            console.log('ERROR: updating rateable object data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // update "changed" flag in database
    async setChanged(object_id, changed) {
        try {
            let rowCount = await dbSetChanged(object_id, changed);
            if (!rowCount) {
                console.log('WARNING: flag "changed" has not been updated!');
            } else {
                this.changed = changed;
            }
        } catch (err) {
            console.log('ERROR: updating flag "changed": ' + JSON.stringify(this));
            throw err;
        }
    }
};

// delete a rateable object from database
var dbDeleteRateableObject = async (rateableObject) => {
    const sql = `DELETE FROM rateableObject WHERE object_id = '${rateableObject.object_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// set the "changed" flag in rateable object
var dbSetChanged = async (object_id, changed) => {
    const sql = `UPDATE rateableObject SET changed = '${changed}' WHERE object_id = '${object_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};