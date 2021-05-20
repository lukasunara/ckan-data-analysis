import { getDoughnutChar } from "./doughnuts.js";

let objectData = JSON.parse(document.getElementById('objectData').dataset.test);

let findChart = objectData.result.findChart;

let configID = getDoughnutChar(
    findChart.identification, findChart.maxPointsID, 'Identification', findChart.darkColor, findChart.lightColor
);
let configKey = getDoughnutChar(
    findChart.keywords, findChart.maxPointsKeywords, 'Keywords', findChart.darkColor, findChart.lightColor
);
let configCategories = getDoughnutChar(
    findChart.categories, findChart.maxPointsCategories, 'Categories', findChart.darkColor, findChart.lightColor
);
let configState = getDoughnutChar(
    findChart.state, findChart.maxPointsState, 'State', findChart.darkColor, findChart.lightColor
);

new Chart(document.getElementById('identificationChart'), configID);
new Chart(document.getElementById('keywordsChart'), configKey);
new Chart(document.getElementById('categoriesChart'), configCategories);
new Chart(document.getElementById('stateChart'), configState);