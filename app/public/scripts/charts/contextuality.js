import { getDoughnutChar } from "./doughnuts.js";

let objectData = JSON.parse(document.getElementById('objectData').dataset.test);
let contextChart = objectData.result.contextChart;

if (contextChart.maxPointsResources > 0) {
    let configNumOfResources = getDoughnutChar(
        contextChart.num_of_resources, contextChart.maxPointsResources, 'Number of Resources',
        contextChart.darkColor, contextChart.lightColor
    );
    new Chart(document.getElementById('numOfResourcesChart'), configNumOfResources);
}

if (contextChart.maxPointsFSize > 0) {
    let configFileSize = getDoughnutChar(
        contextChart.file_size, contextChart.maxPointsFSize, 'File Size',
        contextChart.darkColor, contextChart.lightColor
    );
    new Chart(document.getElementById('fileSizeChart'), configFileSize);
}

if (contextChart.maxPointsEmpty > 0) {
    let configEmptyData = getDoughnutChar(
        contextChart.empty_data, contextChart.maxPointsEmpty, 'Empty Data',
        contextChart.darkColor, contextChart.lightColor
    );
    new Chart(document.getElementById('emptyDataChart'), configEmptyData);
}

if (contextChart.maxPointsIssue > 0) {
    let configDateOfIssue = getDoughnutChar(
        contextChart.date_of_issue, contextChart.maxPointsIssue, 'Date Of Issue',
        contextChart.darkColor, contextChart.lightColor
    );
    new Chart(document.getElementById('dateOfIssueChart'), configDateOfIssue);
}

if (contextChart.maxPointsModified > 0) {
    let configModificationDate = getDoughnutChar(
        contextChart.modification_date, contextChart.maxPointsModified, 'Modification Date',
        contextChart.darkColor, contextChart.lightColor
    );
    new Chart(document.getElementById('modificationDateChart'), configModificationDate);
}