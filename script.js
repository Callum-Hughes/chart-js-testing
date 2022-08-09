var ctx = document.getElementById("myChart").getContext('2d');

var startLabels = [];
var startData = [];

const data = {
    labels: startLabels,
    datasets: [{
        label: '',
        data: startData,
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
        yAxisID: 'yAxisLeft',
        order: 1
    },
    {
        type: 'line',
        label: 'line',
        data: startData,
        backgroundColor: [
            'rgba(0, 0, 0, 0)'
        ],
        borderColor: [
            'rgba(255,99,132,1)'
        ],
        yAxisID: 'yAxisRight',
        order: 2
    }
    ]
}

const scales = {
    yAxisLeft: {
        beginAtZero: true,
        position: 'left'
    },
    yAxisRight: {
        position: 'right',
        ticks: {
            // Include a dollar sign in the ticks
            callback: function (value, index, ticks) {
                return value.toFixed(2) + "%";
            }
        }
    },
    x: {
        axis: 'x'
    }
};

const options = {
    scales: scales,
    onClick: (e) => {
        const canvasPosition = Chart.helpers.getRelativePosition(e, myChart);
        const dataX = myChart.scales.x.getValueForPixel(canvasPosition.x);
        //const dataY = myChart.scales.yAxisLeft.getValueForPixel(canvasPosition.y);
        const labelX = myChart.data.labels[parseInt(dataX)];

        function updateComments() {
            fetchData().then(dataPoints => {
                const comments = dataPoints['comments'];
                const goodComments = comments['good'];
                const badComments = comments['bad'];

                let goodComment = '...';
                let badComment = '...';
                if (labelX in goodComments) {
                    goodComment = goodComments[labelX];
                }
                if (labelX in badComments) {
                    badComment = badComments[labelX];
                }

                document.getElementById('good-comment').innerHTML = goodComment;
                document.getElementById('bad-comment').innerHTML = badComment;
            });
        };

        updateComments();
    }
};

var myChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options
});


async function fetchData() {
    const url = 'http://localhost:8000/circuits.json';
    const response = await fetch(url);

    const dataPoints = await response.json()
    return dataPoints;
};


const selectedData = document.getElementById('select');
selectedData.addEventListener('change', updateChart);

const uniqueCircuitsFilterThreshold = document.getElementById('unique-circuits-filter');
uniqueCircuitsFilterThreshold.addEventListener('change', updateChart);

function updateChart() {

    function generateColors(values, backgroundColorIntensity, borderColorIntensity) {
        // Should be made push/pop colours by label
        let backgroundColors = [];
        let borderColors = [];
        for (let i = 0; i < values.length; i++) {
            const r = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const backgroundColor = `rgba(${r}, ${g}, ${b}, ${backgroundColorIntensity})`;
            const borderColor = `rgba(${r}, ${g}, ${b}, ${borderColorIntensity})`;
            backgroundColors.push(backgroundColor);
            borderColors.push(borderColor);
        }
        return {
            'backgroundColors': backgroundColors,
            'borderColors': borderColors
        };
    };

    function selectData(dataPoints) {
        // Select Data
        const labels = Object.keys(dataPoints[selectedData.value]);
        const selectedValues = Object.values(dataPoints[selectedData.value]);
        let label = '';
        if (selectedData.value == 'year') {
            label = 'Number of races held'
        }
        else if (selectedData.value == 'locality') {
            label = 'Number of unique circuits holding a race'
        }
        const colors = generateColors(selectedValues, 0.2, 1);
        const backgroundColor = colors['backgroundColors'];
        const borderColor = colors['borderColors'];
        myChart.config.data.labels = labels;
        myChart.config.data.datasets[0].data = selectedValues;
        myChart.config.data.datasets[0].label = label;
        myChart.config.data.datasets[1].data = selectedValues;
        myChart.config.data.datasets[1].label = label;
        myChart.config.data.datasets[0].backgroundColor = backgroundColor;
        myChart.config.data.datasets[0].borderColor = borderColor;
        myChart.update();
    };

    function filterChart(dataPoints) {
        const labels = Object.keys(dataPoints[selectedData.value]);
        const selectedValues = Object.values(dataPoints[selectedData.value]);
        const uniqueCircuits = Object.values(dataPoints['locality']);
        
        let filterThreshold = uniqueCircuitsFilterThreshold.max;
        const filterThresholdValue = parseInt(uniqueCircuitsFilterThreshold.value);
        if (!isNaN(filterThresholdValue)) {
            filterThreshold = filterThresholdValue;
        };

        let uniqueCircuitsSearch = uniqueCircuits;
        let labelsFiltered = [];
        let selectedValuesFiltered = [];

        for (i = 0; i < labels.length; i++) {
            const firstIndex = uniqueCircuits.findIndex((x) => x <= filterThreshold);
            if (firstIndex == 0) {
                selectedValuesFiltered.push(selectedValues[i]);
                labelsFiltered.push(labels[i]);
            } else if (firstIndex == -1) {
                break;
            };
            uniqueCircuitsSearch.shift();
        }
        myChart.config.data.labels = labelsFiltered;
        myChart.config.data.datasets[0].data = selectedValuesFiltered;
        myChart.config.data.datasets[1].data = selectedValuesFiltered;
        myChart.update();
    };

    fetchData().then(dataPoints => {
        selectData(dataPoints);
        filterChart(dataPoints);
    });

};



// function filterChart() {
//     fetchData().then(dataPoints => {
//         const labels = Object.keys(dataPoints[selectedData.value]);
//         const selectedValues = Object.values(dataPoints[selectedData.value]);
//         const uniqueCircuits = Object.values(dataPoints['locality']);

//         let uniqueCircuitsSearch = uniqueCircuits;
//         let labelsFiltered = [];
//         let selectedValuesFiltered = [];

//         for (i = 0; i < labels.length; i++) {
//             const firstIndex = uniqueCircuits.findIndex((x) => x <= uniqueCircuitsFilterThreshold.value);
//             if (firstIndex == 0) {
//                 selectedValuesFiltered.push(selectedValues[i]);
//                 labelsFiltered.push(labels[i]);
//             } else if (firstIndex == -1) {
//                 break;
//             };
//             uniqueCircuitsSearch.shift();
//         }
//         myChart.config.data.labels = labelsFiltered;
//         myChart.config.data.datasets[0].data = selectedValuesFiltered;
//         myChart.config.data.datasets[1].data = selectedValuesFiltered;
//         myChart.update();
//     });
// };
