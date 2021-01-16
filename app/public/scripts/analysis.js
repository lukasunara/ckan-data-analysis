// if checkParam returns false add key to the missingParams
var analyseParam = (param, checkFunction) => {
    let exists = true;

    if (!checkFunction(param)) {
        exists = false;
    }
    return exists;
}

// if checkParam returns false add key to the missingParams
var analyseParamWithOption = (param1, param2, checkFunction) => {
    let exists = true;

    if (!checkFunction(param1)) {
        if (!checkFunction(param2)) {
            exists = false;
        }
    }
    return exists;
}

var analyseDate = (param) => {
    let exists = analyseParam(param, checkParam);

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
    let currentDate = new Date(Date.now());
    let months;

    months = (currentDate.getFullYear() - date.getFullYear()) * 12; // difference in years
    months += currentDate.getMonth(); // add so we reach the current month in this year
    months -= date.getMonth(); // substitute so we get month difference in previous year

    return months;
}

module.exports = {
    analyseParam,
    analyseParamWithOption,
    analyseDate,
    checkParam,
    checkArray
};