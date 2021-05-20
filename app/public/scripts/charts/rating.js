import { handleHover, handleLeave } from "./animations.js";

// get everything needed for creation of ratings chart
var getRatingsChar = (objectData) => {
    const charData = {
        labels: ['Findability', 'Accessibility', 'Interoperability', 'Reusability', 'Contextuality'],
        datasets: [
            {
                label: 'Number of points for each chart group',
                data: [
                    objectData.result.findChart.earnedPoints,
                    objectData.result.accessChart.earnedPoints,
                    objectData.result.interChart.earnedPoints,
                    objectData.result.reuseChart.earnedPoints,
                    objectData.result.contextChart.earnedPoints
                ],
                backgroundColor: ["#2ecc71", "#e74c3c", "#3e6669", "#9b59b6", "#f1c40f"]
            }
        ]
    };
    const config = {
        type: 'pie',
        data: charData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    onHover: handleHover,
                    onLeave: handleLeave
                },
                title: {
                    display: true,
                    text: 'Distribution of points by analysis groups'
                }
            }
        },
    };
    return config;
};

let objectData = JSON.parse(document.getElementById('objectData').dataset.test);

let config = getRatingsChar(objectData);
new Chart(document.getElementById('ratingsChart'), config);