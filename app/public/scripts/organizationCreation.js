const { fetchData } = require('./fetching.js');
const { createDataset } = require('./datasetCreation.js');
const Organization = require('../../models/data/OrganizationModel.js');

// creates new Organization object (or fetches existing one from database)
var createOrganization = async (portalName, organization) => {
    // fetch organization from database (if exists)
    let newOrganization = await Organization.fetchOrganizationById(organization.id, portalName);

    let title = organization.title ? organization.title : organization.display_name;
    let currentDate = new Date();

    // if organization doesn't exists in database create a new one
    if (!newOrganization) {
        let data = {
            object_id: organization.id, changed: true, portal_id: portalName, name: organization.name,
            title: title, description: organization.description, state: organization.state,
            approval_status: organization.approval_status, num_of_extras: organization.extras.length,
            num_of_members: organization.users.length, date_created: organization.created,
            image_display_url: organization.image_display_url, date_of_storage: currentDate
        }
        newOrganization = new Organization(data);
        await newOrganization.persist();
    } else {
        // if exists in database => check if it has passed 3 days since last update
        let sevenDays = 3 * 24 * 60 * 60 * 1000; //3 days in miliseconds
        if (currentDate - newOrganization.date_of_storage >= sevenDays) {
            // update data about organization
            let dataForUpdate = {
                name: organization.name, title: title, description: organization.description,
                state: organization.state, approval_status: organization.approval_status,
                num_of_extras: organization.extras.length, num_of_members: organization.users.length,
                date_created: organization.created, image_display_url: organization.image_display_url,
                date_of_storage: currentDate
            }
            await newOrganization.update(dataForUpdate);
        }
    }
    // create all datasets which were created by this organization
    if (organization.packages) {
        for (let i = 0; i < organization.packages.length; i++) {
            let datasetUrl = 'http://' + portalName
                + '/api/3/action/package_show?id=' + organization.packages[i];
            let dataset = await fetchData(datasetUrl);

            if (dataset.error) {
                continue;
            } else {
                await createDataset(portalName, dataset.data.result);
            }
        }
    }
    return newOrganization;
};

module.exports = {
    createOrganization
};