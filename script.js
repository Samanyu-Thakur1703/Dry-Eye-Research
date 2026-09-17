const form = document.getElementById('assessmentForm');
const resetBtn = document.getElementById('resetBtn');
const emptyState = document.getElementById('emptyState');
const resultContent = document.getElementById('resultContent');
const resultTitle = document.getElementById('resultTitle');
const statusBadge = document.getElementById('statusBadge');
const summaryText = document.getElementById('summaryText');
const findingList = document.getElementById('findingList');
const riskList = document.getElementById('riskList');
const timestamp = document.getElementById('timestamp');

const errors = {
  age: document.getElementById('ageError'),
  gender: document.getElementById('genderError'),
  osdi: document.getElementById('osdiError'),
  tbut: document.getElementById('tbutError'),
  tmh: document.getElementById('tmhError')
};

function clearErrors() {
  Object.values(errors).forEach((el) => { el.textContent = ''; });
}

function validateNumber(value, min, max) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function getValues() {
  return {
    patientId: document.getElementById('patientId').value.trim(),
    age: Number(document.getElementById('age').value),
    gender: document.getElementById('gender').value,
    osdi: Number(document.getElementById('osdi').value),
    tbut: Number(document.getElementById('tbut').value),
    tmh: Number(document.getElementById('tmh').value)
  };
}

function validate(data) {
  clearErrors();
  let valid = true;

  if (!validateNumber(data.age, 0, 120)) {
    errors.age.textContent = 'Enter an age between 0 and 120.';
    valid = false;
  }
  if (!data.gender) {
    errors.gender.textContent = 'Select a gender.';
    valid = false;
  }
  if (!validateNumber(data.osdi, 0, 24)) {
    errors.osdi.textContent = 'Enter an OSDI score from 0 to 24.';
    valid = false;
  }
  if (!validateNumber(data.tbut, 0, 120)) {
    errors.tbut.textContent = 'Enter TBUT from 0 to 120 seconds.';
    valid = false;
  }
  if (!validateNumber(data.tmh, 0, 10)) {
    errors.tmh.textContent = 'Enter TMH from 0 to 10 mm.';
    valid = false;
  }

  return valid;
}

function makeFinding(name, value, isAbnormal, normalText, abnormalText) {
  return `
    <div class="finding">
      <div class="finding-main">
        <span class="dot ${isAbnormal ? 'bad' : ''}"></span>
        <div>
          <div class="finding-name">${name}</div>
          <div class="finding-value">Entered: ${value}</div>
        </div>
      </div>
      <div class="finding-state ${isAbnormal ? 'state-abnormal' : 'state-normal'}">
        ${isAbnormal ? abnormalText : normalText}
      </div>
    </div>`;
}

function runAssessment(data) {
  // These thresholds reflect the current MVP values supplied by the project team.
  // They should be updated after clinical confirmation of the final specification.
  const osdiAbnormal = data.osdi > 4 && data.osdi <= 24;
  const tbutAbnormal = data.tbut < 10;
  const tmhAbnormal = data.tmh < 0.20;

  const abnormalParameters = [osdiAbnormal, tbutAbnormal, tmhAbnormal].filter(Boolean).length;
  const dryEyeIndicatorsDetected = abnormalParameters > 0;

  const additionalRiskFactors = [];
  if (data.age > 60) {
    additionalRiskFactors.push({ label: 'Age', text: 'Age > 60: marked as a higher-risk factor in the supplied engine.' });
  }
  if (data.gender === 'female') {
    additionalRiskFactors.push({ label: 'Gender', text: 'Female: marked as a higher-risk factor in the supplied engine.' });
  }

  emptyState.classList.add('hidden');
  resultContent.classList.remove('hidden');

  if (dryEyeIndicatorsDetected) {
    resultTitle.textContent = 'Dry Eye Indicators Detected';
    statusBadge.textContent = `${abnormalParameters}/3 abnormal`;
    statusBadge.className = 'status-badge status-abnormal';
    summaryText.innerHTML = `The engine found <strong>${abnormalParameters}</strong> abnormal clinical parameter${abnormalParameters === 1 ? '' : 's'} from the current MVP engine.`;
  } else {
    resultTitle.textContent = 'No Dry Eye Indicators Detected';
    statusBadge.textContent = 'Within engine';
    statusBadge.className = 'status-badge status-normal';
    summaryText.innerHTML = 'All three entered clinical measurements are within the current normal ranges supplied for the MVP.';
  }

  findingList.innerHTML = [
    makeFinding('OSDI', `${data.osdi}`, osdiAbnormal, 'Normal', 'Abnormal'),
    makeFinding('TBUT', `${data.tbut} sec`, tbutAbnormal, 'Normal', 'Dry-eye indicator'),
    makeFinding('TMH', `${data.tmh} mm`, tmhAbnormal, 'Normal', 'Abnormal')
  ].join('');

  if (additionalRiskFactors.length) {
    riskList.innerHTML = additionalRiskFactors.map((risk) => `
      <div class="risk">
        <div class="risk-text">${risk.text}</div>
        <div class="risk-label">${risk.label}</div>
      </div>`).join('');
  } else {
    riskList.innerHTML = `
      <div class="risk no-risk">
        <div class="risk-text">No additional age/gender risk factor was triggered by the current engine.</div>
        <div class="risk-label">None</div>
      </div>`;
  }

  const now = new Date();
  timestamp.textContent = now.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = getValues();
  if (!validate(data)) return;
  runAssessment(data);
});

resetBtn.addEventListener('click', () => {
  form.reset();
  clearErrors();
  resultContent.classList.add('hidden');
  emptyState.classList.remove('hidden');
});
