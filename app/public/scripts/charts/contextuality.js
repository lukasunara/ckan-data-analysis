import { getDoughnutChar } from "./doughnuts.js";

let objectData = JSON.parse(document.getElementById('objectData').dataset.test);
let contextChart = objectData.result.contextChart;

if (contextChart.max_num_of_res > 0) {
    let configNumOfResources = getDoughnutChar(
        contextChart.num_of_resources, contextChart.max_num_of_res,
        'Number of Resources', contextChart.darkColor, contextChart.lightColor
    );
    new Chart(document.getElementById('numOfResourcesChart'), configNumOfResources);
}

if (contextChart.max_file_size > 0) {
    let configFileSize = getDoughnutChar(
        contextChart.file_size, contextChart.max_file_size,
        'File Size', contextChart.darkColor, contextChart.lightColor
    );
    new Chart(document.getElementById('fileSizeChart'), configFileSize);
}

if (contextChart.max_empty > 0) {
    let configEmptyData = getDoughnutChar(
        contextChart.empty_data, contextChart.max_empty,
        'Empty Data', contextChart.darkColor, contextChart.lightColor
    );
    new Chart(document.getElementById('emptyDataChart'), configEmptyData);
}

if (contextChart.max_date_of_issue > 0) {
    let configDateOfIssue = getDoughnutChar(
        contextChart.date_of_issue, contextChart.max_date_of_issue,
        'Date Of Issue', contextChart.darkColor, contextChart.lightColor
    );
    new Chart(document.getElementById('dateOfIssueChart'), configDateOfIssue);
}

if (contextChart.max_modification_date > 0) {
    let configModificationDate = getDoughnutChar(
        contextChart.modification_date, contextChart.max_modification_date,
        'Modification Date', contextChart.darkColor, contextChart.lightColor
    );
    new Chart(document.getElementById('modificationDateChart'), configModificationDate);
}

if (contextChart.max_data_age > 0) {
    let configDataAge = getDoughnutChar(
        contextChart.data_age, contextChart.max_data_age,
        'Data Age', contextChart.darkColor, contextChart.lightColor
    );
    new Chart(document.getElementById('dataAgeChart'), configDataAge);
}