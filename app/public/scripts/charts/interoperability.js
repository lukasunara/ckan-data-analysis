import { getDoughnutChar } from "./doughnuts.js";

let objectData = JSON.parse(document.getElementById('objectData').dataset.test);
let interChart = objectData.result.interChart;

if (interChart.max_format > 0) {
    let configFormat = getDoughnutChar(
        interChart.format, interChart.max_format, 'Resource Format',
        interChart.darkColor, interChart.lightColor
    );
    new Chart(document.getElementById('formatChart'), configFormat);
}

if (interChart.max_format_div > 0) {
    let configFormatDiversity = getDoughnutChar(
        interChart.format_diversity, interChart.max_format_div, 'Format Diversity',
        interChart.darkColor, interChart.lightColor
    );
    new Chart(document.getElementById('formatDiversityChart'), configFormatDiversity);
}

if (interChart.max_comp > 0) {
    let configCompatibility = getDoughnutChar(
        interChart.compatibility, interChart.max_comp, 'Format and Media-Type Compatibility',
        interChart.darkColor, interChart.lightColor
    );
    new Chart(document.getElementById('compatibilityChart'), configCompatibility);
}

if (interChart.max_machine_readable > 0) {
    let configMachineReadable = getDoughnutChar(
        interChart.machine_readable, interChart.max_machine_readable, 'Machine Readable',
        interChart.darkColor, interChart.lightColor
    );
    new Chart(document.getElementById('machineReadableChart'), configMachineReadable);
}

if (interChart.max_lod > 0) {
    let configLinkedOpenData = getDoughnutChar(
        interChart.linked_open_data, interChart.max_lod, 'Linked Open Data',
        interChart.darkColor, interChart.lightColor
    );
    new Chart(document.getElementById('linkedOpenDataChart'), configLinkedOpenData);
}