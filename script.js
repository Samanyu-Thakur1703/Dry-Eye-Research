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
const meterLabel = document.getElementById('meterLabel');
const meterScore = document.getElementById('meterScore');
const needle = document.getElementById('needle');

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
    errors.osdi.textContent = 'Enter an OSDI-6 score from 0 to 24.';
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

function getOsdiCategory(score) {
  if (score <= 3) return { label: 'Normal', level: 0 };
  if (score <= 8) return { label: 'Mild–Moderate', level: 1.5 };
  return { label: 'Severe', level: 3 };
}

function getTbutCategory(seconds) {
  if (seconds > 10) return { label: 'Normal', level: 0 };
  if (seconds >= 6) return { label: 'Mild', level: 1 };
  if (seconds >= 3) return { label: 'Moderate', level: 2 };
  return { label: 'Severe / immediate', level: 3 };
}

function getTmhCategory(value) {
  if (value >= 0.2 && value <= 0.3) return { label: 'Normal', abnormal: false };
  if (value < 0.2) return { label: 'Abnormal', abnormal: true };
  return { label: 'Outside supplied normal range', abnormal: true };
}

function getOverallIndicator(osdiCategory, tbutCategory) {
  // The gauge is a visual summary, not a validated clinical score.
  const level = Math.max(osdiCategory.level, tbutCategory.level);

  if (level === 0) return { label: 'Normal', score: '0 / 3', needle: -90, css: 'status-normal' };
  if (level <= 1) return { label: 'Mild', score: '1 / 3', needle: -30, css: 'status-abnormal' };
  if (level < 3) return { label: 'Mild–Moderate', score: '2 / 3', needle: 25, css: 'status-abnormal' };
  return { label: 'Severe', score: '3 / 3', needle: 82, css: 'status-abnormal' };
}

function makeFinding(name, value, stateLabel, tone = 'normal') {
  const stateClass = tone === 'normal' ? 'state-normal' : tone === 'mild' ? 'state-mild' : tone === 'moderate' ? 'state-moderate' : 'state-severe';
  const dotClass = tone === 'normal' ? '' : 'bad';

  return `
    <div class="finding">
      <div class="finding-main">
        <span class="dot ${dotClass}"></span>
        <div>
          <div class="finding-name">${name}</div>
          <div class="finding-value">Entered: ${value}</div>
        </div>
      </div>
      <div class="finding-state ${stateClass}">${stateLabel}</div>
    </div>`;
}

function runAssessment(data) {
  const osdiCategory = getOsdiCategory(data.osdi);
  const tbutCategory = getTbutCategory(data.tbut);
  const tmhCategory = getTmhCategory(data.tmh);
  const overall = getOverallIndicator(osdiCategory, tbutCategory);

  const additionalFactors = [];
  if (data.age > 60) {
    additionalFactors.push({ label: 'Age', text: 'Age > 60 is marked as an additional higher-risk factor.' });
  }
  if (data.gender === 'female') {
    additionalFactors.push({ label: 'Gender', text: 'Female is marked as an additional higher-risk factor.' });
  }
  if (tmhCategory.abnormal) {
    additionalFactors.push({ label: 'TMH', text: 'TMH is outside the supplied 0.20–0.30 mm normal range.' });
  }

  const abnormalOrNonNormal = [osdiCategory.level > 0, tbutCategory.level > 0, tmhCategory.abnormal].filter(Boolean).length;
  const overallNormal = abnormalOrNonNormal === 0;

  emptyState.classList.add('hidden');
  resultContent.classList.remove('hidden');

  resultTitle.textContent = overallNormal ? 'Within Normal Ranges' : 'Dry-Eye Indicators Present';
  statusBadge.textContent = overallNormal ? 'Normal' : `${abnormalOrNonNormal} parameter${abnormalOrNonNormal === 1 ? '' : 's'} flagged`;
  statusBadge.className = `status-badge ${overallNormal ? 'status-normal' : 'status-abnormal'}`;

  meterLabel.textContent = overall.label;
  meterScore.textContent = overall.score;
  needle.style.transform = `translateX(-50%) rotate(${overall.needle}deg)`;

  if (overallNormal) {
    summaryText.innerHTML = 'OSDI-6 and TBUT are within the supplied normal ranges, and TMH is within the supplied normal range.';
  } else {
    const drivers = [];
    if (osdiCategory.level > 0) drivers.push(`OSDI-6: ${osdiCategory.label}`);
    if (tbutCategory.level > 0) drivers.push(`TBUT: ${tbutCategory.label}`);
    if (tmhCategory.abnormal) drivers.push('TMH: Abnormal');
    summaryText.innerHTML = `Assessment indicators: <strong>${drivers.join(' · ')}</strong>. The gauge reflects the highest OSDI/TBUT severity observed.`;
  }

  findingList.innerHTML = [
    makeFinding('OSDI-6', `${data.osdi} / 24`, osdiCategory.label, osdiCategory.level === 0 ? 'normal' : osdiCategory.level === 1.5 ? 'mild' : 'severe'),
    makeFinding('TBUT', `${data.tbut} sec`, tbutCategory.label, tbutCategory.level === 0 ? 'normal' : tbutCategory.level === 1 ? 'mild' : tbutCategory.level === 2 ? 'moderate' : 'severe'),
    makeFinding('TMH', `${data.tmh} mm`, tmhCategory.label, tmhCategory.abnormal ? 'moderate' : 'normal')
  ].join('');

  if (additionalFactors.length) {
    riskList.innerHTML = additionalFactors.map((risk) => `
      <div class="risk">
        <div class="risk-text">${risk.text}</div>
        <div class="risk-label">${risk.label}</div>
      </div>`).join('');
  } else {
    riskList.innerHTML = `
      <div class="risk no-risk">
        <div class="risk-text">No additional age, gender, or TMH factor was triggered.</div>
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
  needle.style.transform = 'translateX(-50%) rotate(-90deg)';
});
