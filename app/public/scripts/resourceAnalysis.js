const { fetchData } = require('./fetching.js');
const { parseExcelFile, parseJSONFile } = require('./excelParsing.js');
const {
    analyseParam,
    analyseDate,
    checkParam
} = require('./analysis.js');

var numOfParams, numOfBadParams;
var index;
var missingParams = [];

// sends param to a check function 
var sendParam = (checkFunction, key, param1, param2) => {
    numOfParams++;

    let exists;
    if (!param2) {
        exists = analyseParam(param1, checkFunction);
    } else {
        exists = analyseParamWithOption(param1, param2, checkFunction);
    }

    if (!exists) {
        missingParams[index++] = key;
        numOfBadParams++;
    }

    return exists;
}

var analyseResource = async (resource) => {
    numOfParams = 0;
    numOfBadParams = 0;
    index = 0;
    missingParams = [];

    sendParam(checkParam, 'name', resource.name);
    sendParam(checkParam, 'id', resource.id);
    sendParam(checkParam, 'revision_id', resource.revision_id);
    sendParam(checkParam, 'size', resource.size);
    sendParam(checkParam, 'format', resource.format);
    sendParam(checkParam, 'state', resource.state);
    sendParam(checkParam, 'description', resource.description);

    // get when was the metadata last modified
    let metadataLastModified = analyseDate(resource.last_modified);
    if (metadataLastModified < 0) {
        metadataLastModified = analyseDate(resource.created);
    }

    let urlExists = sendParam(checkParam, 'url', resource.url);
    if (urlExists) {
        var urlData = await fetchData(resource.url);
        if (urlData.message) {
            var download = {
                error: true,
                message: urlData.message
            }
        } else {
            // because .shp and .shx has the same content type
            if (urlData.extension == 'shp' && resource.format.toLowerCase() == 'shx') {
                urlData.extension = 'shx';
            }
            var download = {
                format: urlData.extension,
                status: urlData.status,
                lastModified: urlData.lastModified
            };

            var fileStats;
            if (urlData.extension == 'xls' || urlData.extension == 'xlsx' ||
                urlData.extension == 'csv' || urlData.extension == 'xml'
            ) {
                fileStats = parseExcelFile(urlData.data, urlData.extension);
            } else if (urlData.extension == 'json') {
                fileStats = parseJSONFile(urlData.data, urlData.extension);
            }
        }
    }

    return {
        numbers: {
            numOfParams: numOfParams,
            numOfBadParams: numOfBadParams
        },
        missingParams: missingParams,
        lastModified: metadataLastModified,
        download: download,
        fileStats: fileStats
    }
}

module.exports = {
    analyseResource
};