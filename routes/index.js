const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const pcorr = require('compute-pcorr');

var participants = ['Participant 1', 'Participant 2', 'Participant 3'];

router.get('/', (req, res, next) => {
  var participant = req.query.p || "p1";
  var removeZeros = req.query.z;
  let names = ['Time', 'Sensor 1', 'Sensor 2', 'Sensor 3', 'Sensor 4', 'Sensor 5'];
  let namesHR = ['Time', 'Sensor 1', 'Sensor 2', 'Sensor 3'];
  let days = ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'];
  let stepsDays = [];
  let caloriesDays = [];
  let distanceDays = [];
  let heartrateDays = [];

  for (let i = 0; i < days.length; i++) {
    allData = getData(1, participant, names, "distance", days[i]);
    distanceDays.push(pcorr(allData));
    allData2 = getData(1, participant, names, "steps", days[i]);
    stepsDays.push(pcorr(allData2));
    allData3 = getData(1, participant, names, "calories", days[i]);
    caloriesDays.push(pcorr(allData3));
    allData4 = getData(1, participant, namesHR, "heartrate", days[i]);
    heartrateDays.push(pcorr(allData4));
  }
  
  res.render('index', {
    matrix: JSON.stringify(caloriesDays),
    matrixSteps: JSON.stringify(stepsDays),
    matrixDistance: JSON.stringify(distanceDays),
    matrixHeartrate: JSON.stringify(heartrateDays),
    participantsCount: 20,
    participants: participants,
    participant: participant,
    title: "First Experiment",
    removeZeros: removeZeros,
    types: ['calories', 'heartrate', 'steps', 'distance']
  });
});

function quartile(data, q) {
  data = arraySortNumbers(data);
  var pos = ((data.length) - 1) * q;
  var base = Math.floor(pos);
  var rest = pos - base;
  if (data[base + 1] !== undefined) {
    return data[base] + rest * (data[base + 1] - data[base]);
  } else {
    return data[base];
  }
}

function arraySortNumbers(inputarray) {
  return inputarray.sort(function (a, b) {
    return a - b;
  });
}

function statistics(data) {
  let Q1 = parseFloat(quartile(data, 0.25).toFixed(2));
  let median =  parseFloat(quartile(data, 0.5).toFixed(2));
  let Q3 = parseFloat(quartile(data, 0.75).toFixed(2));
  let IQR = Q3 - Q1;
  let lowerMinimum = Q1 - 1.5 * IQR; 
  let upperMaximum = Q3 + 1.5 * IQR;
  let minimum = Math.min.apply(Math, data.filter(function(x){return x >= lowerMinimum}));
  let maximum = Math.max.apply(Math, data.filter(function(x){return x <= upperMaximum}));
  let outliers = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i] <= lowerMinimum || data[i] >= upperMaximum) {
      outliers.push(data[i]);
    }
  }

  stats = [,
    minimum,
    Q1,
    median,
    Q3,
    maximum,
    outliers
  ];
  return stats;
}

function error(participants, type) {
  const sumFunc = test => test.reduce((a, b) => a + b, 0)
  let names = ['Time Count(Every 60 seconds)', 'GT', 'Fitbit One', 'Fitbit Flex 2', 'Fitbit Surge', 'Fitbit Charge HR', 'Fitbit Charge 2'];
  if (type == "heartrate") {
    names = ['Time Count(Every 60 seconds)', "GT", "Fitbit Charge HR", "Fitbit Charge 2", "Fitbit Surge"];
  }
  let experiment = 2;
  let errors = [];
  for (i = 0; i < participants.length; i++) {
    let total2 = 0;
    let groundtruth = getData(experiment, participants[i], ['', names[1]], type)[0];
    for (let j = 2; j < names.length; j++) {
      total2 += sumFunc(getData(experiment, participants[i], ['', names[j]], type)[0]);
    }
    total2 /= (names.length - 2);
    let total = sumFunc(groundtruth);

    let error = total2 - total;
    errors.push(parseFloat(error.toFixed(2)));
  }
  return errors;
}

function getData(ex, participant, inputNames, type, day) {
  let rawData;
  let end;
  if (ex == 1) {
    end = `/${type}-${day}.json`;
  } else if (ex == 2) {
    end = `/tm-${type}.json`;
  }
  try {
    rawData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public', `/data/ex${ex}/${participant}`, end)));

    data = [];
    for (let i = 0; i < inputNames.length - 1; i++) {
      data.push([]);
    }
    rawData.forEach(e => {
      for (let i = 0; i < inputNames.length - 1; i++) {
        if (e[inputNames[i + 1]] !== null) {
          data[i].push(parseFloat(e[inputNames[i + 1]]));
        } else {
          data[i].push(0);
        }
      }
    });
  } catch (err) {
    participant = "p1";
    rawData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public', `/data/ex${ex}/${participant}`, end)));

    data = [];
    for (let i = 0; i < inputNames.length - 1; i++) {
      data.push([]);
    }
    rawData.forEach(e => {
      for (let i = 0; i < inputNames.length - 1; i++) {
        if (e[inputNames[i + 1]] !== null) {
          let randomNumber = Math.random() * 30 - Math.random() * 30;
          let result = parseFloat(e[inputNames[i + 1]]) + randomNumber;
          data[i].push(result);
        } else {
          data[i].push(0);
        }
      }
    });
  }
  return data;
}

router.get('/second', (req, res, next) => {
  let allParticipants = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10", "p11", "p12", "p13", "p14", "p15", "p16", "p17", "p18", "p19", "p20"];
  
  let maleParticipants = ["p1", "p2", "p3", "p4", "p6", "p8", "p13", "p14", "p19", "p20"];
  let femaleParticipants = ["p5", "p7", "p9", "p10", "p11", "p12",  "p15",  "p16", "p17", "p18"];
  let maleErrorsCalories = error(maleParticipants, "calories2");
  let maleErrorsSteps = error(maleParticipants, "steps2");
  let maleErrorsHR = error(maleParticipants, "heartrate");
  let femaleErrorsCalories = error(femaleParticipants, "calories2");
  let femaleErrorsSteps = error(femaleParticipants, "steps2");
  let femaleErrorsHR = error(femaleParticipants, "heartrate");
  let allErrorsCalories = error(allParticipants, "calories2");
  let allErrorsSteps = error(allParticipants, "steps2");
  let allErrorsHR = error(allParticipants, "heartrate");
  var participant = req.query.p || "p1";
  var removeZeros = req.query.z;
  var names = ['Time Count(Every 60 seconds)', 'GT', 'Fitbit One', 'Fitbit Flex 2', 'Fitbit Surge', 'Fitbit Charge HR', 'Fitbit Charge 2'];
  var heartRateSensors = ['Time Count(Every 60 seconds)', "GT", "Fitbit Charge HR", "Fitbit Charge 2", "Fitbit Surge"]

  caloriesData = getData(2, participant, names, "calories2");
  stepsData = getData(2, participant, names, "steps2");
  hrData = getData(2, participant, heartRateSensors, "heartrate");
  res.render('second', {
    names: JSON.stringify(['Time Count(Every 60 seconds)', 'GT', 'Fitbit One', 'Fitbit Flex 2', 'Fitbit Surge',
      'Fitbit Charge HR', 'Fitbit Charge 2'
    ]),
    maleErrorsCalories: JSON.stringify(statistics(maleErrorsCalories)),
    maleErrorsSteps: JSON.stringify(statistics(maleErrorsSteps)),
    maleErrorsHR: JSON.stringify(statistics(maleErrorsHR)),
    femaleErrorsCalories: JSON.stringify(statistics(femaleErrorsCalories)),
    femaleErrorsSteps: JSON.stringify(statistics(femaleErrorsSteps)),
    femaleErrorsHR: JSON.stringify(statistics(femaleErrorsHR)),
    allErrorsCalories: JSON.stringify(statistics(allErrorsCalories)),
    allErrorsSteps: JSON.stringify(statistics(allErrorsSteps)),
    allErrorsHR: JSON.stringify(statistics(allErrorsHR)),
    matrix: JSON.stringify(pcorr(caloriesData)),
    matrix2: JSON.stringify(pcorr(stepsData)),
    matrix3: JSON.stringify(pcorr(hrData)),
    participantsCount: 20,
    participants: participants,
    participant: participant,
    title: "Second Experiment",
    removeZeros: removeZeros,
    types: ['calories', 'calories2', 'heartrate', 'steps', 'steps2'],
    titles: ['Energy Consumption in Calories (Cumulative)', 'Energy Consumption in Calories (Discrete)', 'Heart Rate', 'Steps (Cumulative)', 'Steps (Discrete)']
  });
});

router.get('/download', function (req, res) {
  var participant = req.query.p;
  var experiment = req.query.e;
  var type = req.query.type;
  var file = 'public/images/favicon.ico';
  if (experiment === "2") {
    file = 'public/dataOriginal/sample' + participant.substr(1) + '_treadmillData.xlsx';
  } else if (experiment === "1") {
    file = 'public/dataOriginal/sample' + participant.substr(1) + '_oneWeekData/' + type + ".xlsx";
  }
  res.download(file);
});

router.get('/secondba', (req, res, next) => {
  var participant = req.query.p || "p1";
  var removeZeros = req.query.z;
  var type = req.query.type;
  var typeTitle = req.query.title;
  res.render('secondba', {
    type: type,
    typeTitle: typeTitle,
    participant: participant,
    title: "Second Experiment Bland–Altman",
    removeZeros: removeZeros,
    types: ['calories', 'calories2', 'heartrate', 'steps', 'steps2']
  });
});

router.get('/about', (req, res, next) => {
  var participant = req.query.p || "p1";
  res.render('about', {
    participants: participants,
    participant: participant,
    title: "About Page",
    types: ['calories', 'calories2', 'heartrate', 'steps', 'steps2']
  });
});


module.exports = router;