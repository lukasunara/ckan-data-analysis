import { getDoughnutChar } from "./doughnuts.js";

let objectData = JSON.parse(document.getElementById('objectData').dataset.test);

let accessChart = objectData.result.accessChart;

let configDatasetAccess = getDoughnutChar(
    accessChart.dataset_accessibility, accessChart.maxPointsDataset, 'Dataset Accessibility',
    accessChart.darkColor, accessChart.lightColor
);
let configURLAccess = getDoughnutChar(
    accessChart.url_accessibility, accessChart.maxPointsUrl, 'URL Accessibility',
    accessChart.darkColor, accessChart.lightColor
);
let configDownload = getDoughnutChar(
    accessChart.download_url, accessChart.maxPointsDownload, 'Download URL Accessibility',
    accessChart.darkColor, accessChart.lightColor
);

new Chart(document.getElementById('datasetAccessibilityChart'), configDatasetAccess);
new Chart(document.getElementById('urlAccessibilityChart'), configURLAccess);
new Chart(document.getElementById('downloadUrlChart'), configDownload);