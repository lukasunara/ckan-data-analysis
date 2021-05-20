import { Utils } from "https://cdn.jsdelivr.net/npm/chart.js";

// Append '4d' to the colors (alpha channel), except for the hovered index
var handleHover = (evt, item, legend) => {
    legend.chart.data.datasets[0].backgroundColor.forEach((color, index, colors) => {
        colors[index] = index === item.index || color.length === 9 ? color : color + '4D';
    });
    legend.chart.update();
};

// Removes the alpha channel from background colors
var handleLeave = (evt, item, legend) => {
    legend.chart.data.datasets[0].backgroundColor.forEach((color, index, colors) => {
        colors[index] = color.length === 9 ? color.slice(0, -2) : color;
    });
    legend.chart.update();
};

// get everything needed for creation of ratings chart
var getRatingsChar = (objectData) => {
    const charData = {
        labels: ['Findability', 'Accessibility', 'Interoperability', 'Reusability', 'Contextuality'],
        datasets: [
            {
                label: 'Number of points for each chart group',
                data: [10, 15, 3, 34, 57
                    // objectData.result.findChart.getEarnedPoints(),
                    // objectData.result.accessChart.getEarnedPoints(),
                    // objectData.result.interChart.getEarnedPoints(),
                    // objectData.result.reuseChart.getEarnedPoints(),
                    // objectData.result.contextChart.getEarnedPoints()
                ],
                backgroundColor: ["#2ecc71", "#e74c3c", "#95a5a6", "#9b59b6", "#f1c40f"]
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

module.exports = { getRatingsChar };