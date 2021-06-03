import { handleHover, handleLeave } from "./animations.js";

// get everything needed for creation of ratings chart
var getDoughnutChar = (earnedPoints, maxPoints, chartName, darkColor, lightColor) => {
    var percentage = earnedPoints / maxPoints * 100;

    const charData = {
        labels: ['Earned points', 'Missing points'],
        datasets: [
            {
                label: chartName,
                data: [percentage.toFixed(0), 100 - percentage.toFixed(0)],
                backgroundColor: [darkColor, lightColor]
            }
        ]
    };
    const config = {
        type: 'doughnut',
        data: charData,
        options: {
            animations: {
                radius: {
                    duration: 400,
                    easing: 'linear',
                    loop: (context) => context.active
                }
            },
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    onHover: handleHover,
                    onLeave: handleLeave
                },
                title: {
                    display: true,
                    text: chartName
                }
            }
        }
    };
    return config;
};

export { getDoughnutChar };