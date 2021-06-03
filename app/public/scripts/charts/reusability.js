import { getDoughnutChar } from "./doughnuts.js";

let objectData = JSON.parse(document.getElementById('objectData').dataset.test);
let reuseChart = objectData.result.reuseChart;

if (reuseChart.max_license > 0) {
    let configLicense = getDoughnutChar(
        reuseChart.license, reuseChart.max_license,
        'License', reuseChart.darkColor, reuseChart.lightColor
    );
    new Chart(document.getElementById('licenseChart'), configLicense);
}

if (reuseChart.max_basic_info > 0) {
    let configBasicInfo = getDoughnutChar(
        reuseChart.basic_info, reuseChart.max_basic_info,
        'Basic Data Informations', reuseChart.darkColor, reuseChart.lightColor
    );
    new Chart(document.getElementById('basicInfoChart'), configBasicInfo);
}

if (reuseChart.max_extras > 0) {
    let configExtras = getDoughnutChar(
        reuseChart.extras, reuseChart.max_extras,
        'Extra Data Informations', reuseChart.darkColor, reuseChart.lightColor
    );
    new Chart(document.getElementById('extrasChart'), configExtras);
}

if (reuseChart.max_publisher > 0) {
    let configPublisher = getDoughnutChar(
        reuseChart.publisher, reuseChart.max_publisher,
        'Publisher', reuseChart.darkColor, reuseChart.lightColor
    );
    new Chart(document.getElementById('publisherChart'), configPublisher);
}