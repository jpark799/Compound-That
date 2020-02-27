const calc = () => {
  let initialDeposit = document.querySelector("#initialDeposit");
  let contributionAmount = document.querySelector("#contributionAmount");
  let investmentTimespan = document.querySelector("#investmentTimespan");
  let investmentTimespanText = document.querySelector(
    "#investmentTimespanText"
  );
  let estimatedReturn = document.querySelector("#estimatedReturn");
  let futureBalance = document.querySelector("#futureBalance");

  function updateValue(element, action) {
    let min = parseFloat(element.getAttribute("min"));
    let max = parseFloat(element.getAttribute("max"));
    let step = parseFloat(element.getAttribute("step")) || 1;
    let oldValue = element.dataset.value || element.defaultValue || 0;
    let newValue = parseFloat(element.value.replace(/\$/, ""));

    if (isNaN(parseFloat(newValue))) {
      newValue = oldValue;
    } else {
      if (action == "add") {
        newValue += step;
      } else if (action == "sub") {
        newValue -= step;
      }

      newValue = newValue < min ? min : newValue > max ? max : newValue;
    }

    element.dataset.value = newValue;
    element.value =
      (element.dataset.prepend || "") +
      newValue +
      (element.dataset.append || "");

    updateChart();
  }

  function getChartData() {
    let principleFormInput = parseFloat(initialDeposit.dataset.value); // Principal
    let estimatedReturnFormInput = parseFloat(
      estimatedReturn.dataset.value / 100
    ); // Annual Interest Rate
    let contributionFormInput = parseFloat(contributionAmount.dataset.value); // Contribution Amount
    let compoundPeriodFormInput = parseInt(
      document.querySelector('[name="compound_period"]:checked').value
    ); // Compound Period
    let contributionPeriodFormInput = parseInt(
      document.querySelector('[name="contribution_period"]:checked').value
    ); // Contribution Period
    let investmentTimeSpan = parseInt(investmentTimespan.value); // Investment Time Span
    let currentYear = new Date().getFullYear();

    let labels = [];
    for (
      let year = currentYear;
      year < currentYear + investmentTimeSpan;
      year++
    ) {
      labels.push(year);
    }

    let principalDataset = {
      label: "Total Principal",
      backgroundColor: "rgb(0, 123, 255)",
      data: []
    };

    let interestDataset = {
      label: "Total Interest",
      backgroundColor: "rgb(23, 162, 184)",
      data: []
    };

    for (let i = 1; i <= investmentTimeSpan; i++) {
      let principal =
        principleFormInput +
        contributionFormInput * contributionPeriodFormInput * i;
      let interest = 0;
      let balance = principal;

      if (estimatedReturnFormInput) {
        let x = Math.pow(
          1 + estimatedReturnFormInput / compoundPeriodFormInput,
          compoundPeriodFormInput * i
        );
        let compoundInterest = principleFormInput * x;
        let contributionInterest =
          (contributionFormInput * (x - 1)) /
          (estimatedReturnFormInput / contributionPeriodFormInput);
        interest = (
          compoundInterest +
          contributionInterest -
          principal
        ).toFixed(0);
        balance = (compoundInterest + contributionInterest).toFixed(0);
      }

      futureBalance.innerHTML = "$" + balance;
      principalDataset.data.push(principal);
      interestDataset.data.push(interest);
    }

    return {
      labels: labels,
      datasets: [principalDataset, interestDataset]
    };
  }

  function updateChart() {
    let data = getChartData();

    chart.data.labels = data.labels;
    chart.data.datasets[0].data = data.datasets[0].data;
    chart.data.datasets[1].data = data.datasets[1].data;
    chart.update();
  }

  initialDeposit.addEventListener("change", function() {
    updateValue(this);
  });

  contributionAmount.addEventListener("change", function() {
    updateValue(this);
  });

  estimatedReturn.addEventListener("change", function() {
    updateValue(this);
  });

  investmentTimespan.addEventListener("change", function() {
    investmentTimespanText.innerHTML = this.value + " years";
    updateChart();
  });

  investmentTimespan.addEventListener("input", function() {
    investmentTimespanText.innerHTML = this.value + " years";
  });

  let radios = document.querySelectorAll(
    '[name="contribution_period"], [name="compound_period"]'
  );
  for (let j = 0; j < radios.length; j++) {
    radios[j].addEventListener("change", updateChart);
  }

  let buttons = document.querySelectorAll("[data-counter]");
  for (let i = 0; i < buttons.length; i++) {
    let button = buttons[i];

    button.addEventListener("click", function() {
      let field = document.querySelector('[name="' + this.dataset.field + '"]');
      let action = this.dataset.counter;

      if (field) {
        updateValue(field, action);
      }
    });
  }

  let ctx = document.getElementById("myChart").getContext("2d");
  let chart = new Chart(ctx, {
    type: "bar",
    data: getChartData(),
    options: {
      legend: {
        display: false
      },
      tooltips: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function(tooltipItem, data) {
            return (
              data.datasets[tooltipItem.datasetIndex].label +
              ": $" +
              tooltipItem.yLabel
            );
          }
        }
      },
      responsive: true,
      scales: {
        xAxes: [
          {
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: "Year"
            }
          }
        ],
        yAxes: [
          {
            stacked: true,
            ticks: {
              callback: function(value) {
                return "$" + value;
              }
            },
            scaleLabel: {
              display: true,
              labelString: "Balance"
            }
          }
        ]
      }
    }
  });
};

calc();
