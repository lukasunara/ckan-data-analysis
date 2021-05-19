const { fetchData } = require('./fetching.js');
const { createResource } = require('./resourceCreation.js');
const Dataset = require('../../models/data/DatasetModel.js');

// creates new Dataset object (or fetches existing one from database)
var createDataset = async (portalName, dataset) => {
    let checkResources = false; //should I check resources or not
    // fetch dataset from database (if exists)
    let newDataset = await Dataset.fetchDatasetById(dataset.id, portalName);

    let orgID = dataset.owner_org ? dataset.owner_org : dataset.organization.id;
    let description = dataset.notes ? dataset.notes : dataset.description;
    let metadataCreated = new Date(dataset.metadata_created);
    let metadataModified = new Date(dataset.metadata_modified);
    let numOfKeywords = dataset.tags ? dataset.tags.length : (dataset.keywords ? dataset.keywords.length : 0);

    // if dataset doesn't exists in database create a new one
    if (!newDataset) {
        let data = {
            object_id: dataset.id, changed: true, portal_id: portalName, organization_id: orgID,
            name: dataset.name, title: dataset.title, owner_org: dataset.owner_org, author: dataset.author,
            maintainer: dataset.maintainer, private: dataset.private, state: dataset.state,
            description: description, metadata_created: metadataCreated, metadata_modified: metadataModified,
            num_of_extras: dataset.extras.length, num_of_groups: dataset.groups.length,
            num_of_keywords: numOfKeywords, license_title: dataset.license_title,
            license_url: dataset.license_url, url: dataset.url
        }
        // create new dataset with loaded data
        newDataset = new Dataset(data);
        await newDataset.persist();
        checkResources = true; //also I need to check resources now
    } else {
        // if exists in database => check if same lastModified timestamp
        let savedLastModified = new Date(newDataset.metadata_modified);
        // if last modified timestamps are almost equal continue, else update
        if (metadataModified && (metadataModified - savedLastModified >= 45)) {
            // update all info that can be updated about this dataset
            let dataForUpdate = {
                name: dataset.name, title: dataset.title, owner_org: dataset.owner_org, author: dataset.author,
                maintainer: dataset.maintainer, private: dataset.private, state: dataset.state,
                description: description, metadataCreated: metadataCreated, metadataModified: metadataModified,
                num_of_extras: dataset.extras.length, num_of_groups: dataset.groups.length,
                num_of_keywords: numOfKeywords, license_title: dataset.license_title,
                license_url: dataset.license_url, url: dataset.url
            }
            await newDataset.update(dataForUpdate);
            checkResources = true; //also I need to check resources now
        }
    }
    // check resources if needed
    if (checkResources) {
        for (let i = 0; i < dataset.resources.length; i++) {
            let resourceUrl = 'http://' + portalName
                + '/api/3/action/resource_show?id=' + dataset.resources[i].id;
            let resourceData = await fetchData(resourceUrl);

            if (resourceData.error || resourceData.data === undefined) {
                ;
            } else {
                await createResource(resourceData.data.result, dataset.id);
            }
        }
    }
    return newDataset;
};

module.exports = {
    createDataset
};