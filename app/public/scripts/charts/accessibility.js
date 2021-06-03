import { getDoughnutChar } from "./doughnuts.js";

let objectData = JSON.parse(document.getElementById('objectData').dataset.test);
let accessChart = objectData.result.accessChart;

if (accessChart.max_dataset_acc) {
    let configDatasetAccess = getDoughnutChar(
        accessChart.dataset_accessibility, accessChart.max_dataset_acc,
        'Dataset Accessibility', accessChart.darkColor, accessChart.lightColor
    );
    new Chart(document.getElementById('datasetAccessibilityChart'), configDatasetAccess);
}

if (accessChart.max_url_acc) {
    let configURLAccess = getDoughnutChar(
        accessChart.url_accessibility, accessChart.max_url_acc,
        'URL Accessibility', accessChart.darkColor, accessChart.lightColor
    );
    new Chart(document.getElementById('urlAccessibilityChart'), configURLAccess);
}

if (accessChart.max_download_url) {
    let configDownload = getDoughnutChar(
        accessChart.download_url, accessChart.max_download_url,
        'Download URL Accessibility', accessChart.darkColor, accessChart.lightColor
    );
    new Chart(document.getElementById('downloadUrlChart'), configDownload);
}