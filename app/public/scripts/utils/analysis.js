// if checkParam returns false, add key to the missingParams
var analyseParam = (param, checkFunction) => {
    return checkFunction(param);
}

// if checkParam returns false for both options, add key to the missingParams
var analyseParamWithOption = (param1, param2, checkFunction) => {
    let param = analyseParam(param1, checkFunction);
    if (!param) {
        param = analyseParam(param2, checkFunction);
    }
    return param;
}

// analises given date
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

// returns size of array
var checkArray = (array) => {
    return array ? array.length : array;
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