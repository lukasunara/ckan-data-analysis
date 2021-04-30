const db = require('../../db');
const RateableObject = require('./RateableObjectModel');

// class Resource encapsulates a CKAN resource
module.exports = class Resource extends RateableObject {

    // constructor for Resource
    constructor(object_id, dataset_id, revisionId, name, size, format, mediaType,
        state, description, created, lastModified, url
    ) {
        super(object_id);
        this.dataset_id = dataset_id;
        this.revisionId = revisionId;
        this.name = name;
        this.size = size;
        this.format = format;
        this.mediaType = mediaType;
        this.state = state;
        this.description = description;
        this.created = created;
        this.lastModified = lastModified;
        this.url = url;
    }

    // save resource into database
    async persist() {
        try {
            let rowCount = await dbNewResource(this);
            if (rowCount == 0)
                console.log('WARNING: Resource has not been persisted!');
            else
                this.persisted = true;
        } catch (err) {
            console.log('ERROR: persisting resource data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // update numOfExtras
    async updateResourceData(lastModified, size, format, mediaType, url) {
        try {
            let rowCount = await dbUpdateResource(
                this.object_id, lastModified, size, format, mediaType, url
            );
            if (rowCount == 0)
                console.log('WARNING: Resource has not been updated!');
            else {
                this.lastModified = lastModified;
                this.size = size;
                this.format = format;
                this.mediaType = mediaType;
                this.url = url;
            }
        } catch (err) {
            console.log('ERROR: updating resource data: ' + JSON.stringify(this));
            throw err;
        }
    }
};

// inserting a new resource into database
dbNewResource = async (resource) => {
    const sql = `INSERT INTO resource (object_id, dataset_id, revisionId, name,
        size, format, mediaType, state, description, created, lastModified, url)
        VALUES ('$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9', '$10', '$11', '$12');`;
    const values = [
        resource.object_id, resource.dataset_id, resource.revisionId, resource.name,
        resource.size, resource.format, resource.mediaType, resource.state,
        resource.description, resource.created, resource.lastModified, resource.url
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updating resource data in database
dbUpdateResource = async (resource_id, lastModified, size, format, mediaType, url) => {
    const sql = `UPDATE resource
                    SET lastModified = '${lastModified}',
                        size = '${size}',
                        format = '${format}',
                        mediaType = '${mediaType}',
                        url = '${url}'
                    WHERE object_id = '${resource_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};