import { getDoughnutChar } from "./doughnuts.js";

let objectData = JSON.parse(document.getElementById('objectData').dataset.test);
let reuseChart = objectData.result.reuseChart;

if (reuseChart.maxPointsLicense > 0) {
    let configLicense = getDoughnutChar(
        reuseChart.license, reuseChart.maxPointsLicense, 'License',
        reuseChart.darkColor, reuseChart.lightColor
    );
    new Chart(document.getElementById('licenseChart'), configLicense);
}

if (reuseChart.maxPointsInfo > 0) {
    let configBasicInfo = getDoughnutChar(
        reuseChart.basic_info, reuseChart.maxPointsInfo, 'Basic Data Informations',
        reuseChart.darkColor, reuseChart.lightColor
    );
    new Chart(document.getElementById('basicInfoChart'), configBasicInfo);
}

if (reuseChart.maxPointsExtras > 0) {
    let configExtras = getDoughnutChar(
        reuseChart.extras, reuseChart.maxPointsExtras, 'Extra Data Informations',
        reuseChart.darkColor, reuseChart.lightColor
    );
    new Chart(document.getElementById('extrasChart'), configExtras);
}

if (reuseChart.maxPointsPublisher > 0) {
    let configPublisher = getDoughnutChar(
        reuseChart.publisher, reuseChart.maxPointsPublisher, 'Publisher',
        reuseChart.darkColor, reuseChart.lightColor
    );
    new Chart(document.getElementById('publisherChart'), configPublisher);
}