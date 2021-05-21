import { getDoughnutChar } from "./doughnuts.js";

let objectData = JSON.parse(document.getElementById('objectData').dataset.test);
let interChart = objectData.result.interChart;

if (interChart.maxPointsFormat > 0) {
    let configFormat = getDoughnutChar(
        interChart.format, interChart.maxPointsFormat, 'Resource Format',
        interChart.darkColor, interChart.lightColor
    );
    new Chart(document.getElementById('formatChart'), configFormat);
}

if (interChart.maxPointsFormatDiv > 0) {
    let configFormatDiversity = getDoughnutChar(
        interChart.format_diversity, interChart.maxPointsFormatDiv, 'Format Diversity',
        interChart.darkColor, interChart.lightColor
    );
    new Chart(document.getElementById('formatDiversityChart'), configFormatDiversity);
}

if (interChart.maxPointsComp > 0) {
    let configCompatibility = getDoughnutChar(
        interChart.compatibility, interChart.maxPointsComp, 'Format and Media-Type Compatibility',
        interChart.darkColor, interChart.lightColor
    );
    new Chart(document.getElementById('compatibilityChart'), configCompatibility);
}

if (interChart.maxPointsMachine > 0) {
    let configMachineReadable = getDoughnutChar(
        interChart.machine_readable, interChart.maxPointsMachine, 'Machine Readable',
        interChart.darkColor, interChart.lightColor
    );
    new Chart(document.getElementById('machineReadableChart'), configMachineReadable);
}

if (interChart.maxPointsLOD > 0) {
    let configLinkedOpenData = getDoughnutChar(
        interChart.linked_open_data, interChart.maxPointsLOD, 'Linked Open Data',
        interChart.darkColor, interChart.lightColor
    );
    new Chart(document.getElementById('linkedOpenDataChart'), configLinkedOpenData);
}