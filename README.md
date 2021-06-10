# ckan-data-analysis
Analysis of portals and open datasets available on CKAN platform
(Analiza kvalitete skupova otvorenih podataka dostupnih na platformi CKAN)

# Getting Started
Expects from user to have Node.js, NPM and PostgreSQL on their computers.

1. clone folder app
2. download NPM libraries ("npm install")
3. create empty database in PostgreSQL
4. insert info about database name and password in files "db/seed.js" and "db/index.js"
5. fill database ("node db/seed.js")
6. start application on localhost:3000 ("node server.js")
