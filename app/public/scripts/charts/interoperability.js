import { getDoughnutChar } from "./doughnuts.js";

let objectData = JSON.parse(document.getElementById('objectData').dataset.test);

let interChart = objectData.result.interChart;

let configFormat = getDoughnutChar(
    interChart.format, interChart.maxPointsFormat, 'Resource Format',
    interChart.darkColor, interChart.lightColor
);
let configFormatDiversity = getDoughnutChar(
    interChart.format_diversity, interChart.maxPointsFormatDiv, 'Format Diversity',
    interChart.darkColor, interChart.lightColor
);
let configCompatibility = getDoughnutChar(
    interChart.compatibility, interChart.maxPointsComp, 'Format and Media-Type Compatibility',
    interChart.darkColor, interChart.lightColor
);
let configMachineReadable = getDoughnutChar(
    interChart.machine_readable, interChart.maxPointsMachine, 'Machine Readable',
    interChart.darkColor, interChart.lightColor
);
let configLinkedOpenData = getDoughnutChar(
    interChart.linked_open_data, interChart.maxPointsLOD, 'Linked Open Data',
    interChart.darkColor, interChart.lightColor
);

new Chart(document.getElementById('formatDiversityChart'), configFormatDiversity);
new Chart(document.getElementById('formatChart'), configFormat);
new Chart(document.getElementById('compatibilityChart'), configCompatibility);
new Chart(document.getElementById('machineReadableChart'), configMachineReadable);
new Chart(document.getElementById('linkedOpenDataChart'), configLinkedOpenData);