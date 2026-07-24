const display = document.getElementById('display');
const historyEl = document.getElementById('history');
const keys = document.querySelector('.keys');

let current = '0';
let previous = null;
let operator = null;
let justEvaluated = false;

const MAX_DIGITS = 14;

function updateScreen() {
  display.textContent = formatForDisplay(current);
  historyEl.textContent = previous !== null && operator
    ? `${formatForDisplay(previous)} ${operator}`
    : '';
  highlightActiveOperator();
}

function formatForDisplay(value) {
  if (value === 'Error') return value;
  const [intPart, decPart] = value.split(',');
  const intFormatted = new Intl.NumberFormat('ru-RU').format(Number(intPart || 0));
  return decPart !== undefined ? `${intFormatted},${decPart}` : intFormatted;
}

function highlightActiveOperator() {
  document.querySelectorAll('.key--op').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.op === operator);
  });
}

function inputDigit(digit) {
  if (justEvaluated) {
    current = digit;
    justEvaluated = false;
    return;
  }
  if (current === '0') {
    current = digit;
  } else if (current.replace(',', '').length < MAX_DIGITS) {
    current += digit;
  }
}

function inputDecimal() {
  if (justEvaluated) {
    current = '0,';
    justEvaluated = false;
    return;
  }
  if (!current.includes(',')) {
    current += ',';
  }
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  justEvaluated = false;
}

function backspace() {
  if (justEvaluated) return;
  current = current.length > 1 ? current.slice(0, -1) : '0';
}

function toNumber(value) {
  return parseFloat(value.replace(',', '.'));
}

function fromNumber(value) {
  if (!isFinite(value)) return 'Error';
  let str = String(Math.round(value * 1e10) / 1e10).replace('.', ',');
  if (str.replace(',', '').length > MAX_DIGITS) {
    str = value.toPrecision(10).replace('.', ',');
  }
  return str;
}

function applyOperator(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
    default: return b;
  }
}

let currentPendingReset = false;

function chooseOperator(op) {
  if (operator && previous !== null && !justEvaluated) {
    const result = applyOperator(toNumber(previous), toNumber(current), operator);
    previous = fromNumber(result);
    current = previous;
  } else {
    previous = current;
  }
  operator = op;
  justEvaluated = false;
  currentPendingReset = true;
}

function inputDigitWrapper(digit) {
  if (currentPendingReset) {
    current = '0';
    currentPendingReset = false;
  }
  inputDigit(digit);
}

function equals() {
  if (operator === null || previous === null) return;
  const result = applyOperator(toNumber(previous), toNumber(current), operator);
  current = fromNumber(result);
  previous = null;
  operator = null;
  justEvaluated = true;
  currentPendingReset = false;
}

function percent() {
  const value = toNumber(current) / 100;
  current = fromNumber(value);
}

keys.addEventListener('click', (event) => {
  const button = event.target.closest('.key');
  if (!button) return;

  const { digit, action, op } = button.dataset;

  if (digit !== undefined) {
    inputDigitWrapper(digit);
  } else if (op !== undefined) {
    chooseOperator(op);
  } else if (action === 'decimal') {
    inputDecimal();
  } else if (action === 'clear') {
    clearAll();
  } else if (action === 'backspace') {
    backspace();
  } else if (action === 'percent') {
    percent();
  } else if (action === 'equals') {
    equals();
  }

  updateScreen();
});

document.addEventListener('keydown', (event) => {
  const { key } = event;
  if (/^[0-9]$/.test(key)) {
    inputDigitWrapper(key);
  } else if (key === '.' || key === ',') {
    inputDecimal();
  } else if (key === '+') {
    chooseOperator('+');
  } else if (key === '-') {
    chooseOperator('−');
  } else if (key === '*') {
    chooseOperator('×');
  } else if (key === '/') {
    event.preventDefault();
    chooseOperator('÷');
  } else if (key === 'Enter' || key === '=') {
    equals();
  } else if (key === 'Backspace') {
    backspace();
  } else if (key === 'Escape') {
    clearAll();
  } else if (key === '%') {
    percent();
  } else {
    return;
  }
  updateScreen();
});

updateScreen();
