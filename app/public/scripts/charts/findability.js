import { getDoughnutChar } from "./doughnuts.js";

let objectData = JSON.parse(document.getElementById('objectData').dataset.test);
let findChart = objectData.result.findChart;

if (findChart.max_id > 0) {
    let configID = getDoughnutChar(
        findChart.identification, findChart.max_id,
        'Identification', findChart.darkColor, findChart.lightColor
    );
    new Chart(document.getElementById('identificationChart'), configID);
}

if (findChart.max_key > 0) {
    let configKey = getDoughnutChar(
        findChart.keywords, findChart.max_key,
        'Keywords', findChart.darkColor, findChart.lightColor
    );
    new Chart(document.getElementById('keywordsChart'), configKey);
}

if (findChart.max_cat > 0) {
    let configCategories = getDoughnutChar(
        findChart.categories, findChart.max_cat,
        'Categories', findChart.darkColor, findChart.lightColor
    );
    new Chart(document.getElementById('categoriesChart'), configCategories);
}

if (findChart.max_state > 0) {
    let configState = getDoughnutChar(
        findChart.state, findChart.max_state,
        'State', findChart.darkColor, findChart.lightColor
    );
    new Chart(document.getElementById('stateChart'), configState);
}