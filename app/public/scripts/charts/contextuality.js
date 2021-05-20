import { getDoughnutChar } from "./doughnuts.js";

let objectData = JSON.parse(document.getElementById('objectData').dataset.test);

let contextChart = objectData.result.contextChart;

let configNumOfResources = getDoughnutChar(
    contextChart.num_of_resources, contextChart.maxPointsResources, 'Number of Resources',
    contextChart.darkColor, contextChart.lightColor
);
let configFileSize = getDoughnutChar(
    contextChart.file_size, contextChart.maxPointsFSize, 'File Size',
    contextChart.darkColor, contextChart.lightColor
);
let configEmptyData = getDoughnutChar(
    contextChart.empty_data, contextChart.maxPointsEmpty, 'Empty Data',
    contextChart.darkColor, contextChart.lightColor
);
let configDateOfIssue = getDoughnutChar(
    contextChart.date_of_issue, contextChart.maxPointsIssue, 'Date Of Issue',
    contextChart.darkColor, contextChart.lightColor
);
let configModificationDate = getDoughnutChar(
    contextChart.modification_date, contextChart.maxPointsModified, 'Modification Date',
    contextChart.darkColor, contextChart.lightColor
);

new Chart(document.getElementById('numOfResourcesChart'), configNumOfResources);
new Chart(document.getElementById('fileSizeChart'), configFileSize);
new Chart(document.getElementById('emptyDataChart'), configEmptyData);
new Chart(document.getElementById('dateOfIssueChart'), configDateOfIssue);
new Chart(document.getElementById('modificationDateChart'), configModificationDate);