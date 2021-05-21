import { getDoughnutChar } from "./doughnuts.js";

let objectData = JSON.parse(document.getElementById('objectData').dataset.test);
let findChart = objectData.result.findChart;

if (findChart.maxPointsID > 0) {
    let configID = getDoughnutChar(
        findChart.identification, findChart.maxPointsID, 'Identification',
        findChart.darkColor, findChart.lightColor
    );
    new Chart(document.getElementById('identificationChart'), configID);
}

if (findChart.maxPointsKeywords > 0) {
    let configKey = getDoughnutChar(
        findChart.keywords, findChart.maxPointsKeywords, 'Keywords',
        findChart.darkColor, findChart.lightColor
    );
    new Chart(document.getElementById('keywordsChart'), configKey);
}

if (findChart.maxPointsCategories > 0) {
    let configCategories = getDoughnutChar(
        findChart.categories, findChart.maxPointsCategories, 'Categories',
        findChart.darkColor, findChart.lightColor
    );
    new Chart(document.getElementById('categoriesChart'), configCategories);
}

if (findChart.maxPointsState > 0) {
    let configState = getDoughnutChar(
        findChart.state, findChart.maxPointsState, 'State',
        findChart.darkColor, findChart.lightColor
    );
    new Chart(document.getElementById('stateChart'), configState);
}