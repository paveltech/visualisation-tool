function capitalizeFirstLetter(string) {
    let uString = string.charAt(0).toUpperCase() + string.slice(1);
    let fString = uString.replace(/([a-zA-Z])(\d)/g, '$1 $2');
    return fString
}

function displayGraph(type, data, names) {
    setTimeout(function () {
        const container = function (data) {
            let time = data[0];
            let input = [];
            heartRateSensors = ["GT", "Fitbit Charge HR", "Fitbit Charge 2", "Fitbit Surge"]
            for (i = 1; i < data.length; i++) {
                if (type == "heartrate") {
                    if (heartRateSensors.indexOf(names[i]) >= 0) {
                        input.push({
                            name: names[i],
                            data: data[i]
                        });
                    }
                } else {
                    input.push({
                        name: names[i],
                        data: data[i]
                    });
                }
            }
            const options = {
                title: {
                    text: `${capitalizeFirstLetter(type)} Day`
                },
                subtitle: {
                    text: 'Source: Sheffield Hallam Lab'
                },
                xAxis: {
                    categories: time,
                    title: {
                        text: names[0]
                    }
                },
                yAxis: {
                    title: {
                        text: `${capitalizeFirstLetter(type)}`
                    }
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: false
                        },
                        enableMouseTracking: true
                    }
                },
                series: input
            }
            Highcharts.chart(type, options);
        }
        container(data);
    }, 100);
}

function getData(type, names, callback) {
    $.getJSON(`/data/ex2/${participant}/tm-${type}.json`, function (jsonData) {
        let allData = [];

        for (let i = 0; i < names.length; i++) {
            allData.push([]);
        }
        jsonData.forEach(e => {
            for (let i = 0; i < names.length; i++) {
                if (i === 0) {
                    allData[i].push(e[names[i]]);
                } else {
                    allData[i].push(parseInt(e[names[i]]));
                }
            }
        });

        setTimeout(function () {
            callback(allData);
        }, 100);
    });
}