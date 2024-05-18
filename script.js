document.getElementById('show').style.display = 'none';

let show = false;
function calculateTaxComparison() {
  show = true;
  displayResults();
}

function setMax80C() {
  const maxValue = 150000; 
  document.getElementById('eightyC').value = maxValue;
}

function setMax80D() {
  const maxValue = 75000; 
  document.getElementById('eightyD').value = maxValue;
}

function setMax24b() {
  const maxValue = 200000; 
  document.getElementById('twentyFourB').value = maxValue;
}

function setMax80CCD() {
  const maxValue = 50000; 
  document.getElementById('eightyCCD').value = maxValue;
}

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function calculateTax(income, regime) {
  let tax = 0;
  if(regime === 'old')  {
    if (income <= 250000) {
      tax = 0;
    } else if (income <= 500000) {
        tax = (income - 250000) * 0.05;
    } else if (income <= 1000000) {
        tax = (250000 * 0.05) + (income - 500000) * 0.20;
    } else {
        tax = (250000 * 0.05) + (500000 * 0.20) + (income - 1000000) * 0.30;
    }
  } else {
    if (income <= 300000) {
      tax = 0;
    } else if (income <= 600000) {
        tax = (income - 300000) * 0.05;
    } else if (income <= 900000) {
        tax = (300000 * 0.05) + (income - 600000) * 0.10;
    } else if (income <= 1200000) {
        tax = (300000 * 0.05) + (300000 * 0.10) + (income - 900000) * 0.15;
    } else if (income <= 1500000) {
        tax = (300000 * 0.05) + (300000 * 0.10) + (300000 * 0.15) + (income - 1200000) * 0.20;
    } else {
        tax = (300000 * 0.05) + (300000 * 0.10) + (300000 * 0.15) + (300000 * 0.20) + (income - 1500000) * 0.30;
    }
  }

  if(income <= 500000) {
    tax = 0; // under Rebate under Section 87A
  }

  const surcharge = tax > 0 ? calculateSurcharge(tax, income) : 0;
  const healthAndEducationCess = tax > 0 ? (tax + surcharge) * 0.04 : 0;

  return {
      tax: tax,
      surcharge: surcharge,
      healthAndEducationCess: healthAndEducationCess,
      totalTax: tax + surcharge + healthAndEducationCess
  };
}

function calculateSurcharge(tax, income) {
  if (income > 5000000 && income <= 10000000) {
      return tax * 0.1;
  } else if (income > 10000000) {
      return tax * 0.15;
  }
  return 0;
}

function displayResults() {

  const income = parseFloat(document.getElementById('income').value);
  const hra = parseFloat(document.getElementById('hra').value);
  const medicalInsurance = parseFloat(document.getElementById('medicalInsurance').value);
  const standardDeduction = parseFloat(document.getElementById('standardDeduction').value);
  const eightyC = parseFloat(document.getElementById('eightyC').value);
  const eightyD = parseFloat(document.getElementById('eightyD').value);
  const eightyE = parseFloat(document.getElementById('eightyE').value);
  const twentyFourB = parseFloat(document.getElementById('twentyFourB').value);
  const eightyEEA = parseFloat(document.getElementById('eightyEEA').value);
  const eightyCCD = parseFloat(document.getElementById('eightyCCD').value);
  const fbpPlan = parseFloat(document.getElementById('fbpPlan').value);
  const additional = parseFloat(document.getElementById('additional').value);

  

  const deductions = { standardDeduction, medicalInsurance, eightyC, eightyD, eightyE, twentyFourB, eightyEEA, eightyCCD, hra, additional };

   // Define a function to calculate net income and tax for each regime
   function calculateForRegime(includeFbp, regime) {
    const fbpDeduction = includeFbp ? fbpPlan : 0;
    const totalDeductions = regime == "old" ? Object.values(deductions).reduce((a, b) => a + b, 0) + fbpDeduction : deductions.standardDeduction + fbpDeduction;
    const totalTaxableIncome = income - totalDeductions;
    const taxDetails = calculateTax(totalTaxableIncome, regime); // This function needs to handle tax calculations based on regime

    return {
      totalTaxableIncome: Math.round(totalTaxableIncome),
      totalTax: Math.round(taxDetails.totalTax),
      takeHomePay: Math.round(income - taxDetails.totalTax),
      monthlyTakeHomePay: Math.round((income - taxDetails.totalTax) / 12),
      monthlyTax: Math.round(taxDetails.totalTax / 12)
    };
  }

  // Compute results for all scenarios
  const resultsOldRegimeWithoutFbp = calculateForRegime(false, 'old');
  const resultsOldRegimeWithFbp = calculateForRegime(true, 'old');
  const resultsNewRegimeWithoutFbp = calculateForRegime(false, 'new');
  const resultsNewRegimeWithFbp = calculateForRegime(true, 'new');

  document.getElementById('show').style.display = 'block';

  // Helper function to update HTML content
  function updateResultsHtml(elementId, results, title, wtFbpTax) {
    const resultsDiv = document.getElementById(elementId);

    const monthlyFbpPlan = fbpPlan / 12;

    const takeHomePayMonthlyHtml = title === 'w/o FBP' ? 
    `<div>
      <div class="dropdown" onclick="toggleDropdown('${elementId}')">
        <p>Monthly take home: <span class="animated-green">${formatter.format(results.monthlyTakeHomePay)}</span></p>
        <div class="dropdown-arrow" id="dropdown-arrow-${elementId}"></div>
      </div>
      <ul id="dropdown-content-${elementId}">
        <li><span class="li-title">Bank A/c - </span>${formatter.format(results.monthlyTakeHomePay)}</li>
        <li><span class="li-title">Sodexo card - </span>${formatter.format(0)}</li>
      </ul>
    </div>
    ` :
    `<div>
      <div class="dropdown" onclick="toggleDropdown('${elementId}')">
        <p>Monthly take home: <span class="animated-green">${formatter.format(results.monthlyTakeHomePay)}</span></p>
        <div class="dropdown-arrow" id="dropdown-arrow-${elementId}"></div>
      </div>
      <ul id="dropdown-content-${elementId}">
        <li><span class="li-title">Bank A/c - </span>${formatter.format(results.monthlyTakeHomePay - monthlyFbpPlan)}</li>
        <li><span class="li-title">Sodexo card - </span>${formatter.format(monthlyFbpPlan)}</li>
      </ul>
    </div>
    
    `;

    const monthlySavings = title === 'w FBP' ? 
    `<p>Monthly savings on tax: <span class="animated-blue">${formatter.format(wtFbpTax - results.monthlyTax)}</span></p>` :
    ``;

    resultsDiv.innerHTML = `
      <h3>${title}:</h3>
      <p>Total Taxable Income: <strong>${formatter.format(results.totalTaxableIncome)}</strong></p>
      <p>Net Income Tax Payable: <strong>${formatter.format(results.totalTax)}</strong></p>
      <p>Annual take home: <strong>${formatter.format(results.takeHomePay)}</strong></p>
      ${takeHomePayMonthlyHtml}
      <p>Monthly Tax: <span class="animated-red">${formatter.format(results.monthlyTax)}</span></p>
      ${monthlySavings}
    `;
  }

  // Display results for all scenarios
  updateResultsHtml('resultsOldRegimeWithoutFbp', resultsOldRegimeWithoutFbp, 'w/o FBP');
  updateResultsHtml('resultsOldRegimeWithFbp', resultsOldRegimeWithFbp, 'w FBP', resultsOldRegimeWithoutFbp.monthlyTax);
  updateResultsHtml('resultsNewRegimeWithoutFbp', resultsNewRegimeWithoutFbp, 'w/o FBP');
  updateResultsHtml('resultsNewRegimeWithFbp', resultsNewRegimeWithFbp, 'w FBP', resultsNewRegimeWithoutFbp.monthlyTax);
}

function toggleDropdown(elementId) {
  console.log(elementId)
  const dropdownContent = document.getElementById(`dropdown-content-${elementId}`);
  const dropdownArrow = document.getElementById(`dropdown-arrow-${elementId}`);
  if (dropdownContent.style.display === 'block') {
    dropdownContent.style.display = 'none';
    dropdownArrow.classList.remove('open');
  } else {
    dropdownContent.style.display = 'block';
    dropdownArrow.classList.add('open');
  }
}