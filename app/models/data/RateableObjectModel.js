const db = require('../../db');

// class RateableObject encapsulates a rateable object
module.exports = class RateableObject {

    constructor(object_id) {
        if (this.constructor === RateableObject) {
            throw new TypeError('Abstract class "RateableObject" cannot be instantiated directly.');
        }
        this.object_id = object_id;
        this.persisted = false;
    }

    // has dataset been saved into database?
    isPersisted() {
        return this.persisted;
    }

    // delete this rateable object from database
    async deletePortal() {
        try {
            let rowCount = await dbDeleteRateableObject(this);
            if (rowCount == 0)
                console.log('WARNING: Rateable object has not been deleted!');
        } catch (err) {
            console.log('ERROR: deleting rateable object data: ' + JSON.stringify(this));
            throw err;
        }
    }
};

// delete a rateable object from database
dbDeleteRateableObject = async (rateableObject) => {
    const sql = `DELETE FROM rateableObject WHERE object_id = '${rateableObject.object_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};