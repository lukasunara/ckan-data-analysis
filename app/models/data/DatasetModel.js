const db = require('../../db');
const RateableObject = require('./RateableObjectModel');

// class Dataset encapsulates a CKAN dataset
module.exports = class Dataset extends RateableObject {

    // constructor for Dataset
    constructor(object_id, portal_id, organization_id, name, title, owner_org,
        author, maintainer, state, description, metadataCreated, metadataModified,
        numOfExtras, numOfGroups, numOfKeywords, licenseTitle, licenseURL, url
    ) {
        super(object_id);
        this.portal_id = portal_id;
        this.organization_id = organization_id;
        this.name = name;
        this.title = title;
        this.owner_org = owner_org;
        this.author = author;
        this.maintainer = maintainer;
        this.state = state;
        this.description = description;
        this.metadataCreated = metadataCreated;
        this.metadataModified = metadataModified;
        this.numOfExtras = numOfExtras;
        this.numOfGroups = numOfGroups;
        this.numOfKeywords = numOfKeywords;
        this.licenseTitle = licenseTitle;
        this.licenseURL = licenseURL;
        this.url = url;
    }

    // save dataset into database
    async persist() {
        try {
            let rowCount = await dbNewDataset(this);
            if (rowCount == 0)
                console.log('WARNING: Dataset has not been persisted!');
            else
                this.persisted = true;
        } catch (err) {
            console.log('ERROR: persisting dataset data: ' + JSON.stringify(this));
            throw err;
        }
    }

    // update dataset data
    async updateDatasetData(metadataModified, numOfExtras, numOfGroups,
        numOfKeywords, licenseTitle, licenseURL, url
    ) {
        try {
            let rowCount = await dbUpdateDataset(this.object_id, this.portal_id,
                this.organization_id, metadataModified, numOfExtras, numOfGroups,
                numOfKeywords, licenseTitle, licenseURL, url
            );
            if (rowCount == 0)
                console.log('WARNING: Dataset has not been updated!');
            else {
                this.metadataModified = metadataModified;
                this.numOfExtras = numOfExtras;
                this.numOfGroups = numOfGroups;
                this.numOfKeywords = numOfKeywords;
                this.licenseTitle = licenseTitle;
                this.licenseURL = licenseURL;
                this.url = url;
            }
        } catch (err) {
            console.log('ERROR: updating dataset data: ' + JSON.stringify(this));
            throw err;
        }
    }
};

// inserting a new dataset into database
dbNewDataset = async (dataset) => {
    const sql = `INSERT INTO organization (object_id, portal_id, organization_id,
        name, title, owner_org, author, maintainer, state, description, metadataCreated,
        metadataModified, numOfExtras, numOfGroups, numOfKeywords, licenseTitle,
        licenseURL, url) VALUES ('$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9',
        '$10', '$11', '$12', '$13', '$14', '$15', '$16', '$17', '$18');`;
    const values = [
        dataset.object_id, dataset.portal_id, dataset.organization_id,
        dataset.name, dataset.title, dataset.owner_org, dataset.author,
        dataset.maintainer, dataset.state, dataset.description, dataset.metadataCreated,
        dataset.metadataModified, dataset.numOfExtras, dataset.numOfGroups,
        dataset.numOfKeywords, dataset.licenseTitle, dataset.licenseURL, dataset.url
    ];
    try {
        const result = await db.query(sql, values);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

// updating dataset data in database
dbUpdateDataset = async (dataset_id, portal_id, organization_id, metadataModified,
    numOfExtras, numOfGroups, numOfKeywords, licenseTitle, licenseURL, url
) => {
    const sql = `UPDATE dataset
                    SET metadataModified = '${metadataModified}',
                        numOfExtras = '${numOfExtras}',
                        numOfGroups = '${numOfGroups}',
                        numOfKeywords = '${numOfKeywords}',
                        licenseTitle = '${licenseTitle}',
                        licenseURL = '${licenseURL}',
                        url = '${url}'
                    WHERE object_id = '${dataset_id}'
                        AND portal_id = '${portal_id}'
                        AND organization_id = '${organization_id}';`;
    try {
        const result = await db.query(sql, []);
        return result.rowCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};