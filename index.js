(function () {
    let initialDeposit = document.querySelector('#initialDeposit')
    let contributionAmount = document.querySelector('#contributionAmount')
    let investmentTimespan = document.querySelector('#investmentTimespan')
    let investmentTimespanText = document.querySelector('#investmentTimespanText')
    let estimatedReturn = document.querySelector('#estimatedReturn')
    let futureBalance = document.querySelector('#futureBalance')

    function updateValue(element, action) {
        let min = parseFloat(element.getAttribute('min'))
        let max = parseFloat(element.getAttribute('max'))
        let step = parseFloat(element.getAttribute('step')) || 1
        let oldValue = element.dataset.value || element.defaultValue || 0
        let newValue = parseFloat(element.value.replace(/\$/, ''))

        if (isNaN(parseFloat(newValue))) {
            newValue = oldValue;
        } else {
            if (action == 'add') {
                newValue += step;
            } else if (action == 'sub') {
                newValue -= step;
            }

            newValue = newValue < min ? min : newValue > max ? max : newValue;
        }

        element.dataset.value = newValue;
        element.value = (element.dataset.prepend || '') + newValue + (element.dataset.append || '');

        updateChart();
    }

    function getChartData() {
        let P = parseFloat(initialDeposit.dataset.value) // Principal
        let r = parseFloat(estimatedReturn.dataset.value / 100) // Annual Interest Rate
        let c = parseFloat(contributionAmount.dataset.value) // Contribution Amount
        let n = parseInt(document.querySelector('[name="compound_period"]:checked').value) // Compound Period
        let n2 = parseInt(document.querySelector('[name="contribution_period"]:checked').value) // Contribution Period
        let t = parseInt(investmentTimespan.value) // Investment Time Span
        let currentYear = (new Date()).getFullYear()

        let labels = [];
        for (let year = currentYear; year < currentYear + t; year++) {
            labels.push(year);
        }

        let principal_dataset = {
            label: 'Total Principal',
            backgroundColor: 'rgb(0, 123, 255)',
            data: []
        };

        let interest_dataset = {
            label: "Total Interest",
            backgroundColor: 'rgb(23, 162, 184)',
            data: []
        };

        for (let i = 1; i <= t; i++) {
            let principal = P + ( c * n2 * i ),
                interest = 0,
                balance = principal;

            if (r) {
                let x = Math.pow(1 + r / n, n * i),
                    compound_interest = P * x,
                    contribution_interest = c * (x - 1) / (r / n2);
                interest = (compound_interest + contribution_interest - principal).toFixed(0)
                balance = (compound_interest + contribution_interest).toFixed(0);
            }

            futureBalance.innerHTML = '$' + balance;
            principal_dataset.data.push(principal);
            interest_dataset.data.push(interest);
        }

        return {
            labels: labels,
            datasets: [principal_dataset, interest_dataset]
        }
    }

    function updateChart() {
        let data = getChartData();

        chart.data.labels = data.labels;
        chart.data.datasets[0].data = data.datasets[0].data;
        chart.data.datasets[1].data = data.datasets[1].data;
        chart.update();
    }

    initialDeposit.addEventListener('change', function () {
        updateValue(this);
    });

    contributionAmount.addEventListener('change', function () {
        updateValue(this);
    });

    estimatedReturn.addEventListener('change', function () {
        updateValue(this);
    });

    investmentTimespan.addEventListener('change', function () {
        investmentTimespanText.innerHTML = this.value + ' years';
        updateChart();
    });

    investmentTimespan.addEventListener('input', function () {
        investmentTimespanText.innerHTML = this.value + ' years';
    });

    let radios = document.querySelectorAll('[name="contribution_period"], [name="compound_period"]');
    for (let j = 0; j < radios.length; j++) {
        radios[j].addEventListener('change', updateChart);
    }

    let buttons = document.querySelectorAll('[data-counter]');
    for (let i = 0; i < buttons.length; i++) {
        let button = buttons[i];

        button.addEventListener('click', function () {
            let field = document.querySelector('[name="' + this.dataset.field + '"]'),
                action = this.dataset.counter;

            if (field) {
                updateValue(field, action);
            }
        });
    }

    let ctx = document.getElementById('myChart').getContext('2d'),
        chart = new Chart(ctx, {
            type: 'bar',
            data: getChartData(),
            options: {
                legend: {
                    display: false
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return data.datasets[tooltipItem.datasetIndex].label + ': $' + tooltipItem.yLabel;
                        }
                    }
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        stacked: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Year'
                        }
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            callback: function (value) {
                                return '$' + value;
                            }
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Balance'
                        }
                    }]
                }
            }
        });

})()
