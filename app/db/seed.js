const { Pool } = require("pg");

// created connection pool with the database
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ckan-data-analysis',
    password: 'bazepodataka',
    port: 5432,
});

const sql_drop_tables = `
    DROP TABLE IF EXISTS contextuality;
    DROP TABLE IF EXISTS reusability;
    DROP TABLE IF EXISTS interoperability;
    DROP TABLE IF EXISTS accessibility;
    DROP TABLE IF EXISTS findability;
    DROP TABLE IF EXISTS chart;
    DROP TABLE IF EXISTS resource;
    DROP TABLE IF EXISTS dataset;
    DROP TABLE IF EXISTS organization;
    DROP TABLE IF EXISTS portal;
    DROP TABLE IF EXISTS rateableObject;
`;

const sql_create_rateableObject = `CREATE TABLE rateableObject (
    object_id VARCHAR(36) PRIMARY KEY,
    changed BOOLEAN
);`;
const sql_create_rateableObject_id_index = `CREATE UNIQUE INDEX idx_rateableObjectId ON rateableObject(object_id);`;

const sql_create_portal = `CREATE TABLE portal (
    name VARCHAR(36) NOT NULL UNIQUE,
    title VARCHAR(250),
    description TEXT,
    num_of_vocabularies INTEGER,
    num_of_extensions INTEGER,
    dcat_or_rdf BOOLEAN,
    url TEXT,
    date_of_storage TIMESTAMP,
    CONSTRAINT pkPortal PRIMARY KEY (object_id)
) INHERITS (rateableObject);`;
const sql_create_portal_id_index = `CREATE UNIQUE INDEX idx_portalId ON portal(object_id);`;
const sql_create_portal_name_index = `CREATE UNIQUE INDEX idx_portalName ON portal(name);`;

const sql_create_organization = `CREATE TABLE organization (
    portal_id VARCHAR(36),
    name VARCHAR(300),
    title VARCHAR(300),
    description TEXT,
    state VARCHAR(40),
    approval_status VARCHAR(40),
    num_of_extras INTEGER,
    num_of_members INTEGER,
    date_created TIMESTAMP,
    date_of_storage TIMESTAMP,
    image_display_url TEXT,
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
    name VARCHAR(300),
    title VARCHAR(300),
    owner_org VARCHAR(300),
    author VARCHAR(300),
    maintainer VARCHAR(300),
    private BOOLEAN,
    state VARCHAR(40),
    description TEXT,
    metadata_created TIMESTAMP,
    metadata_modified TIMESTAMP,
    num_of_extras INTEGER,
    num_of_groups INTEGER,
    num_of_keywords INTEGER,
    license_title VARCHAR(100),
    license_url TEXT,
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
    revision_id VARCHAR(36),
    name VARCHAR(300),
    size INTEGER,
    format VARCHAR(40),
    media_type VARCHAR(200),
    state VARCHAR(40),
    description TEXT,
    created TIMESTAMP,
    last_modified TIMESTAMP,
    actually_last_modified TIMESTAMP,
    empty_rows NUMERIC(6, 4),
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
    missing_params TEXT,
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
    dataset_accessibility INTEGER CHECK (dataset_accessibility >= 0),
    url_accessibility INTEGER CHECK (url_accessibility >= 0),
    download_url INTEGER CHECK (download_url >= 0),
    CONSTRAINT pkAccessibility PRIMARY KEY (chart_id)
) INHERITS (chart);`;
const sql_create_accessibility_id_index = `CREATE UNIQUE INDEX idx_accessibilityId ON accessibility(object_id);`;

const sql_create_interoperability = `CREATE TABLE interoperability (
    format INTEGER CHECK (format >= 0),
    format_diversity INTEGER CHECK (format_diversity >= 0),
    compatibility INTEGER CHECK (compatibility >= 0),
    machine_readable INTEGER CHECK (machine_readable >= 0),
    linked_open_data INTEGER CHECK (linked_open_data >= 0),
    CONSTRAINT pkInteroperability PRIMARY KEY (chart_id)
) INHERITS (chart);`;
const sql_create_interoperability_id_index = `CREATE UNIQUE INDEX idx_interoperabilityId ON interoperability(object_id);`;

const sql_create_reusability = `CREATE TABLE reusability (
    license INTEGER CHECK (license >= 0),
    basic_info INTEGER CHECK (basic_info >= 0),
    extras INTEGER CHECK (extras >= 0),
    publisher INTEGER CHECK (publisher >= 0),
    CONSTRAINT pkReusability PRIMARY KEY (chart_id)
) INHERITS (chart);`;
const sql_create_reusability_id_index = `CREATE UNIQUE INDEX idx_reusabilityId ON reusability(object_id);`;

const sql_create_contextuality = `CREATE TABLE contextuality (
    num_of_resources INTEGER CHECK (num_of_resources >= 0),
    file_size INTEGER CHECK (file_size >= 0),
    empty_data INTEGER CHECK (empty_data >= 0),
    date_of_issue INTEGER CHECK (date_of_issue >= 0),
    modification_date INTEGER CHECK (modification_date >= 0),
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

let indexes = [
    sql_create_rateableObject_id_index,
    sql_create_portal_id_index,
    sql_create_portal_name_index,
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

// drop existing tables, create new tables and populate with data (if provided) 
(async () => {
    console.log('Dropping all existing tables...');
    try {
        await pool.query(sql_drop_tables, []);
    } catch (err) {
        console.log('Error while dropping tables.');
        return console.log(err.message);
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
