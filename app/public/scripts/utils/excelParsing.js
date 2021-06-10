var XLSX = require('xlsx');

var numOfRows, blankRows;

// parse through all sheets
var parseExcelFile = (data, extension) => {
    numOfRows = 0;
    blankRows = 0;

    try {
        if (extension == 'xlsx' || extension == 'xls') {
            var workbook = XLSX.read(data, { type: 'array', sheetStubs: true });
        } else if (extension == 'csv' || extension == 'xml') {
            var workbook = XLSX.read(data, { type: 'buffer', sheetStubs: true });
        }
        var sheetNamesList = workbook.SheetNames; // list of sheet names

        // iterate over all sheets and analyse them
        sheetNamesList.forEach(sheet => {
            let worksheetJSON = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheet], { defval: null, blankrows: true }
            );
            try {
                analyseFile(worksheetJSON);
            } catch (err) {
                // console.log(err);
            }
        });
    } catch (err) {
        // console.log(err);
    }
    // console.log(blankRows + '/' + numOfRows + '\n');

    return {
        numOfRows: numOfRows,
        blankRows: blankRows
    }
}

// parses through json file and analyzes it
var parseJSONFile = (jsonData) => {
    numOfRows = 0;
    blankRows = 0;

    try {
        analyseFile(jsonData);
    } catch (err) {
        // console.log(err);
    }

    return {
        numOfRows: numOfRows,
        blankRows: blankRows
    }
}

// analyse one worksheet
var analyseFile = (worksheetJSON) => {
    worksheetJSON.forEach(row => {
        numOfRows++;
        if (!checkJSONRow(row)) {
            blankRows++;
        }
        // console.log(row);
    });
    // console.log(worksheetJSON);
}

// checks if a row is blank (contains no values)
var checkJSONRow = (row) => {
    if (!row) {
        return false; // blank row
    }
    // if every parameter in row is not defined => row is empty
    for (let key in row) {
        if (row[key] !== null) {
            if (row[key] instanceof String) {
                let str = row[key].trim();
                if (str.length == 1 && !isAlphaNumeric(str.charCodeAt(0))) {
                    continue; // if row = ',' or '!' etc.
                }
            }
            return true; // row not blank
        }
    }
    return false;
}

var isAlphaNumeric = (charCode) => {
    if (!(charCode > 47 && charCode < 58) &&    // 0-9
        !(charCode > 64 && charCode < 91) &&    // A-Z
        !(charCode > 96 && charCode < 123)      // a-z
    ) {
        return false;
    }
    return true;
}

module.exports = {
    parseExcelFile,
    parseJSONFile
}