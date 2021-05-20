import { getDoughnutChar } from "./doughnuts.js";

let objectData = JSON.parse(document.getElementById('objectData').dataset.test);

let reuseChart = objectData.result.reuseChart;

let configLicense = getDoughnutChar(
    reuseChart.license, reuseChart.maxPointsLicense, 'License',
    reuseChart.darkColor, reuseChart.lightColor
);
let configBasicInfo = getDoughnutChar(
    reuseChart.basic_info, reuseChart.maxPointsInfo, 'Basic Data Informations',
    reuseChart.darkColor, reuseChart.lightColor
);
let configExtras = getDoughnutChar(
    reuseChart.extras, reuseChart.maxPointsExtras, 'Extra Data Informations',
    reuseChart.darkColor, reuseChart.lightColor
);
let configPublisher = getDoughnutChar(
    reuseChart.publisher, reuseChart.maxPointsPublisher, 'Publisher',
    reuseChart.darkColor, reuseChart.lightColor
);

new Chart(document.getElementById('licenseChart'), configLicense);
new Chart(document.getElementById('basicInfoChart'), configBasicInfo);
new Chart(document.getElementById('extrasChart'), configExtras);
new Chart(document.getElementById('publisherChart'), configPublisher);