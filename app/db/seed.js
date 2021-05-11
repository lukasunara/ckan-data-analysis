const { Pool } = require("pg");

// created connection pool with the database
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ckan-data-analysis',
    password: 'bazepodataka',
    port: 5432,
});

const sql_drop_table_contextuality = `DROP TABLE IF EXISTS contextuality;`;
const sql_drop_tables_reusability = `DROP TABLE IF EXISTS reusability;`;
const sql_drop_tables_interoperability = `DROP TABLE IF EXISTS interoperability;`;
const sql_drop_table_accessibility = `DROP TABLE IF EXISTS accessibility;`;
const sql_drop_tables_findability = `DROP TABLE IF EXISTS findability;`;
const sql_drop_tables_chart = `DROP TABLE IF EXISTS chart;`;
const sql_drop_tables_resource = `DROP TABLE IF EXISTS resource;`;
const sql_drop_tables_dataset = `DROP TABLE IF EXISTS dataset;`;
const sql_drop_tables_organization = `DROP TABLE IF EXISTS organization;`;
const sql_drop_tables_portal = `DROP TABLE IF EXISTS portal;`;
const sql_drop_tables_rateableObject = `DROP TABLE IF EXISTS rateableObject;`;

const sql_create_rateableObject = `CREATE TABLE rateableObject (
    object_id VARCHAR(36) PRIMARY KEY
);`;
const sql_create_rateableObject_id_index = `CREATE UNIQUE INDEX idx_rateableObjectId ON rateableObject(object_id);`;

const sql_create_portal = `CREATE TABLE portal (
    name VARCHAR(20) NOT NULL,
    title VARCHAR(20),
    description TEXT,
    url TEXT,
    CONSTRAINT pkPortal PRIMARY KEY (object_id)
) INHERITS (rateableObject);`;
const sql_create_portal_id_index = `CREATE UNIQUE INDEX idx_portalId ON portal(object_id);`;

const sql_create_organization = `CREATE TABLE organization (
    portal_id VARCHAR(36),
    name VARCHAR(200),
    title VARCHAR(200),
    description TEXT,
    state VARCHAR(10),
    approvalStatus VARCHAR(10),
    packages BOOLEAN,
    numOfExtras INTEGER,
    numOfMembers INTEGER,
    dateCreated TIMESTAMP,
    imageDisplayURL TEXT,
    CONSTRAINT pkOrganization PRIMARY KEY (object_id),
    CONSTRAINT fkOrganizationPortal FOREIGN KEY (portal_id) REFERENCES portal(object_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) INHERITS (rateableObject);`;
const sql_create_organization_id_index = `CREATE UNIQUE INDEX idx_organizationId ON organization(object_id);`;
const sql_create_organization_portal_index = `CREATE INDEX idx_organizationPortal ON organization(portal_id);`;

const sql_create_dataset = `CREATE TABLE dataset (
    portal_id VARCHAR(36),
    organization_id VARCHAR(36),
    name VARCHAR(200),
    title VARCHAR(200),
    ownerOrg VARCHAR(36),
    author VARCHAR(36),
    maintainer VARCHAR(36),
    private BOOLEAN,
    state VARCHAR(10),
    description TEXT,
    metadataCreated TIMESTAMP,
    metadataModified TIMESTAMP,
    numOfExtras INTEGER,
    numOfGroups INTEGER,
    numOfKeywords INTEGER,
    licenseTitle VARCHAR(100),
    licenseURL TEXT,
    url TEXT,
    CONSTRAINT pkDataset PRIMARY KEY (object_id),
    CONSTRAINT fkDatasetPortal FOREIGN KEY (portal_id) REFERENCES portal(object_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fkDatasetOrganization FOREIGN KEY (organization_id) REFERENCES organization(object_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) INHERITS (rateableObject);`;
const sql_create_dataset_id_index = `CREATE UNIQUE INDEX idx_datasetId ON dataset(object_id);`;
const sql_create_dataset_portal_index = `CREATE INDEX idx_datasetPortal ON dataset(portal_id);`;
const sql_create_dataset_organization_index = `CREATE INDEX idx_datasetOrganization ON dataset(organization_id);`;

const sql_create_resource = `CREATE TABLE resource (
    dataset_id VARCHAR(36),
    revisionId VARCHAR(36),
    name VARCHAR(200),
    size INTEGER,
    format VARCHAR(10),
    mediaType VARCHAR(100),
    state VARCHAR(10),
    description TEXT,
    created TIMESTAMP,
    lastModified TIMESTAMP,
    url TEXT,
    CONSTRAINT pkResource PRIMARY KEY (object_id),
    CONSTRAINT fkResourceDataset FOREIGN KEY (dataset_id) REFERENCES dataset(object_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) INHERITS (rateableObject);`;
const sql_create_resource_id_index = `CREATE UNIQUE INDEX idx_resourceId ON resource(object_id);`;
const sql_create_resource_dataset_index = `CREATE INDEX idx_resourceDataset ON resource(dataset_id);`;

const sql_create_chart = `CREATE TABLE chart (
    chart_id SERIAL PRIMARY KEY,
    object_id VARCHAR(36),
    missingParams TEXT NOT NULL,
    CONSTRAINT fkChartObject FOREIGN KEY (object_id) REFERENCES rateableObject(object_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);`;
const sql_create_chart_id_index = `CREATE UNIQUE INDEX idx_chartId ON chart(chart_id);`;
const sql_create_chart_rateableObject_index = `CREATE INDEX idx_chartRateableObject ON chart(object_id);`;

const sql_create_findability = `CREATE TABLE findability (
    identification INTEGER CHECK (identification >= 0),
    keywords INTEGER CHECK (keywords >= 0),
    categories INTEGER CHECK (categories >= 0),
    state INTEGER CHECK (state >= 0),
    CONSTRAINT pkFindability PRIMARY KEY (chart_id)
) INHERITS (chart);`;
const sql_create_findability_id_index = `CREATE UNIQUE INDEX idx_findabilityId ON findability(object_id);`;

const sql_create_accessibility = `CREATE TABLE accessibility (
    datasetAccessibility INTEGER CHECK (datasetAccessibility >= 0),
    urlAccessibility INTEGER CHECK (urlAccessibility >= 0),
    downloadURL INTEGER CHECK (downloadURL >= 0),
    CONSTRAINT pkAccessibility PRIMARY KEY (chart_id)
) INHERITS (chart);`;
const sql_create_accessibility_id_index = `CREATE UNIQUE INDEX idx_accessibilityId ON accessibility(object_id);`;

const sql_create_interoperability = `CREATE TABLE interoperability (
    format INTEGER CHECK (format >= 0),
    formatDiversity INTEGER CHECK (formatDiversity >= 0),
    compatibility INTEGER CHECK (compatibility >= 0),
    machineReadable INTEGER CHECK (machineReadable >= 0),
    linkedOpenData INTEGER CHECK (linkedOpenData >= 0),
    CONSTRAINT pkInteroperability PRIMARY KEY (chart_id)
) INHERITS (chart);`;
const sql_create_interoperability_id_index = `CREATE UNIQUE INDEX idx_interoperabilityId ON interoperability(object_id);`;

const sql_create_reusability = `CREATE TABLE reusability (
    license INTEGER CHECK (license >= 0),
    basicInfo INTEGER CHECK (basicInfo >= 0),
    extras INTEGER CHECK (extras >= 0),
    publisher INTEGER CHECK (publisher >= 0),
    CONSTRAINT pkReusability PRIMARY KEY (chart_id)
) INHERITS (chart);`;
const sql_create_reusability_id_index = `CREATE UNIQUE INDEX idx_reusabilityId ON reusability(object_id);`;

const sql_create_contextuality = `CREATE TABLE contextuality (
    numOfResources INTEGER CHECK (numOfResources >= 0),
    fileSize INTEGER CHECK (fileSize >= 0),
    emptyData INTEGER CHECK (emptyData >= 0),
    dateOfIssue INTEGER CHECK (dateOfIssue >= 0),
    modificationDate INTEGER CHECK (modificationDate >= 0),
    CONSTRAINT pkContextuality PRIMARY KEY (chart_id)
) INHERITS (chart);`;
const sql_create_contextuality_id_index = `CREATE UNIQUE INDEX idx_contextualityId ON contextuality(object_id);`;

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

let drop_tables = [
    sql_drop_table_contextuality,
    sql_drop_tables_reusability,
    sql_drop_tables_interoperability,
    sql_drop_table_accessibility,
    sql_drop_tables_findability,
    sql_drop_tables_chart,
    sql_drop_tables_resource,
    sql_drop_tables_dataset,
    sql_drop_tables_organization,
    sql_drop_tables_portal,
    sql_drop_tables_rateableObject
];

let indexes = [
    sql_create_rateableObject_id_index,
    sql_create_portal_id_index,
    sql_create_organization_id_index,
    sql_create_organization_portal_index,
    sql_create_dataset_id_index,
    sql_create_dataset_portal_index,
    sql_create_dataset_organization_index,
    sql_create_resource_id_index,
    sql_create_resource_dataset_index,
    sql_create_chart_id_index,
    sql_create_chart_rateableObject_index,
    sql_create_findability_id_index,
    sql_create_accessibility_id_index,
    sql_create_interoperability_id_index,
    sql_create_reusability_id_index,
    sql_create_contextuality_id_index
];

//create tables and populate with data (if provided) 
(async () => {
    if (tables.length != table_names.length || tables.length != drop_tables.length) {
        console.log('Warning: "tables", "table_names" and "drop_tables" arrays length mismatch.');
        return;
    }
    console.log('Dropping all existing tables...');
    for (let i = 0; i < drop_tables.length; i++) {
        try {
            await pool.query(drop_tables[i], []);
        } catch (err) {
            console.log('Error while dropping table ' + table_names[i] + '.');
            return console.log(err.message);
        }
    }
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
            return console.log(err.message);
        }
    }
})();
