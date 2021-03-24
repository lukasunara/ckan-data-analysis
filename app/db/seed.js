const { Pool } = require("pg");

// created connection pool with the database
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ckan-data-analysis',
    password: 'bazepodataka',
    port: 5432,
});

const sql_create_rateableObject = `CREATE TABLE rateableObject (
    object_id VARCHAR(36) PRIMARY KEY
);`;
const sql_create_rateableObject_id_index = `CREATE UNIQUE INDEX idx_rateableObjectId ON rateableObject(object_id);`;

const sql_create_portal = `CREATE TABLE portal (
    portalName VARCHAR(20) NOT NULL
) INHERITS (rateableObject);`;

const sql_create_organization = `CREATE TABLE organization (
    organization_name VARCHAR(200),
    organization_title VARCHAR(200),
    organization_description TEXT,
    organization_state VARCHAR(10),
    organization_approvalStatus VARCHAR(10),
    organization_packages BOOLEAN,
    organization_numOfExtras INTEGER,
    organization_numOfMembers INTEGER,
    organization_dateCreated TIMESTAMP,
    organization_imageDisplayURL TEXT
) INHERITS (rateableObject);`;

const sql_create_dataset = `CREATE TABLE dataset (
    portal_id VARCHAR(36),
    organization_id VARCHAR(36),
    dataset_name VARCHAR(200),
    dataset_title VARCHAR(200),
    dataset_ownerOrg VARCHAR(36),
    dataset_author VARCHAR(36),
    dataset_maintainer VARCHAR(36),
    dataset_state VARCHAR(10),
    dataset_description TEXT,
    dataset_metadataCreated TIMESTAMP,
    dataset_metadataModified TIMESTAMP,
    dataset_numOfExtras INTEGER,
    dataset_numOfGroups INTEGER,
    dataset_numOfKeywords INTEGER,
    dataset_licenseTitle VARCHAR(100),
    dataset_licenseURL TEXT,
    dataset_URL TEXT,
    CONSTRAINT fkDatasetPortal FOREIGN KEY (object_id) REFERENCES portal (object_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fkDatasetOrganization FOREIGN KEY (object_id) REFERENCES organization (object_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) INHERITS (rateableObject);`;
const sql_create_dataset_organization_index = `CREATE INDEX idx_datasetOrganization ON organization(organization_id);`;

const sql_create_resource = `CREATE TABLE resource (
    dataset_id VARCHAR(36),
    resource_revisionId VARCHAR(36),
    resource_name VARCHAR(200),
    resource_size INTEGER,
    resource_format VARCHAR(10),
    resource_mediaType VARCHAR(100),
    resource_state VARCHAR(10),
    resource_description TEXT,
    resource_created TIMESTAMP,
    resource_lastModified TIMESTAMP,
    resource_URL TEXT,
    CONSTRAINT fkResourceDataset FOREIGN KEY (object_id) REFERENCES dataset (object_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) INHERITS (rateableObject);`;
const sql_create_resource_dataset_index = `CREATE INDEX idx_resourceDataset ON dataset(dataset_id);`;

const sql_create_chart = `CREATE TABLE chart (
    chart_id SERIAL PRIMARY KEY,
    object_id VARCHAR(36),
    maxPoints INTEGER NOT NULL,
    earnedPoints INTEGER NOT NULL,
    CONSTRAINT fkChartObject FOREIGN KEY (object_id) REFERENCES rateableObject(object_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);`;
const sql_create_chart_id_index = `CREATE UNIQUE INDEX idx_chartId ON chart(chart_id);`;
const sql_create_chart_rateableObject_index = `CREATE INDEX idx_chartRateableObject ON rateableObject(object_id);`;

const sql_create_findability = `CREATE TABLE findability (
    identification INTEGER CHECK (identification >= 0),
    keywords INTEGER CHECK (keywords >= 0),
    categories INTEGER CHECK (categories >= 0),
    state INTEGER CHECK (state >= 0)
) INHERITS (chart);`;

const sql_create_accessibility = `CREATE TABLE accessibility (
    datasetAccessibility INTEGER CHECK (datasetAccessibility >= 0),
    urlAccessibility INTEGER CHECK (urlAccessibility >= 0),
    downloadURL INTEGER CHECK (downloadURL >= 0)
) INHERITS (chart);`;

const sql_create_interoperability = `CREATE TABLE interoperability (
    format INTEGER CHECK (format >= 0),
    formatDiversity INTEGER CHECK (formatDiversity >= 0),
    compatibility INTEGER CHECK (compatibility >= 0),
    machineReadable INTEGER CHECK (machineReadable >= 0)
) INHERITS (chart);`;

const sql_create_reusability = `CREATE TABLE reusability (
    license INTEGER CHECK (license >= 0),
    basicInfo INTEGER CHECK (basicInfo >= 0),
    extras INTEGER CHECK (extras >= 0),
    publisher INTEGER CHECK (publisher >= 0)
) INHERITS (chart);`;

const sql_create_contextuality = `CREATE TABLE contextuality (
    numOfResources INTEGER CHECK (numOfResources >= 0),
    fileSize INTEGER CHECK (fileSize >= 0),
    emptyData INTEGER CHECK (emptyData >= 0),
    dateOfIssue INTEGER CHECK (dateOfIssue >= 0),
    modificationDate INTEGER CHECK (modificationDate >= 0)
) INHERITS (chart);`;

let table_names = [
    'rateableObject',
    'portal',
    'organization',
    'dataset',
    'resource',
    'chart',
    'findability',
    'accessibility',
    'interoperability',
    'reusability',
    'contextuality'
];

let tables = [
    sql_create_rateableObject,
    sql_create_portal,
    sql_create_organization,
    sql_create_dataset,
    sql_create_resource,
    sql_create_chart,
    sql_create_findability,
    sql_create_accessibility,
    sql_create_interoperability,
    sql_create_reusability,
    sql_create_contextuality
];

let indexes = [
    sql_create_rateableObject_id_index,
    sql_create_dataset_organization_index,
    sql_create_resource_dataset_index,
    sql_create_chart_id_index,
    sql_create_chart_rateableObject_index
];

if ((tables.length != table_data.length) || (tables.length != table_names.length)) {
    console.log('Warning: "tables" and "names" arrays length mismatch.');
    return;
}

//create tables and populate with data (if provided) 
(async () => {
    console.log('Creating tables');
    for (let i = 0; i < tables.length; i++) {
        console.log('Creating table ' + table_names[i] + '.');
        try {
            await pool.query(tables[i], []);
            console.log('Table ' + table_names[i] + ' created.');
        } catch (err) {
            console.log('Error creating table ' + table_names[i]);
            return console.log(err.message);
        }
    }

    console.log('Creating indexes');
    for (let i = 0; i < indexes.length; i++) {
        try {
            await pool.query(indexes[i], []);
            console.log('Index ' + i + ' created.');
        } catch (err) {
            console.log('Error creating index ' + i + '.');
        }
    }
})();
