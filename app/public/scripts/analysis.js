var numOfParams, numOfBadParams;
var numOfURLs, numOfBadURLs;
var index;
var missingParams = [];

// if checkParam returns false add key to the missingParams
var analyseParam = (param, key, checkFunction) => {
    numOfParams++;

    let exists = checkFunction(param);
    if (!exists) {
        missingParams[index++] = key;
        numOfBadParams++;
    }

    return exists;
}

// if checkParam returns false add key to the missingParams
var analyseParamWithOption = (param1, param2, key, checkFunction) => {
    numOfParams++;

    let exists = true;
    if (!checkFunction(param1)) {
        if (!checkFunction(param2)) {
            exists = false;
            missingParams[index++] = key;
            numOfBadParams++;
        }
    }

    return exists;
}

var analyseDate = (param, key) => {
    let exists = analyseParam(param, key, checkParam);

    if (exists) {
        let date = new Date(param);
        return monthDifference(date);
    }
    return -1; // if month doesn't exist
}

// if null, undefined, "" etc. return false
var checkParam = (param) => {
    return param;
}

// if null, undefined or empty array return false
var checkArray = (array) => {
    return !array || array.length > 0;
}

// count month difference between current and given date
var monthDifference = (date) => {
    let currentDate = Date.now();
    let months;

    months = (currentDate.getFullYear() - date.getFullYear()) * 12; // difference in years
    months -= currentDate.getMonth(); // substitute so we reach the current month in this year
    months += date.getMonth(); // add so we get month difference in previous year

    return months;
}

module.exports = {
    analyseParam,
    analyseParamWithOption,
    analyseDate,
    checkParam,
    checkArray
};