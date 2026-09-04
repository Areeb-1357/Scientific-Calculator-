const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const memoryIndicator = document.querySelector("#memory-indicator");
const keypad = document.querySelector("#keypad");
const historyList = document.querySelector("#history-list");
const entryCount = document.querySelector("#entry-count");
const angleLabel = document.querySelector("#angle-label");

let currentValue = "0";
let storedValue = null;
let pendingOperator = null;
let waitingForOperand = false;
let memory = null;
let angleMode = "DEG";
const history = [];

function updateDisplay() {
  display.textContent = currentValue;
  expression.textContent = storedValue !== null && pendingOperator
    ? `${formatNumber(storedValue)} ${pendingOperator}`
    : "READY FOR INPUT";
  memoryIndicator.textContent = memory === null ? "M: --" : `M: ${formatNumber(memory)}`;
  angleLabel.textContent = `ANGLE: ${angleMode}`;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "Error";
  return String(Number(value.toFixed(10)));
}

function inputNumber(number) {
  if (waitingForOperand || currentValue === "Error") {
    currentValue = number;
    waitingForOperand = false;
  } else {
    currentValue = currentValue === "0" ? number : currentValue + number;
  }
  updateDisplay();
}

function inputDecimal() {
  if (waitingForOperand || currentValue === "Error") {
    currentValue = "0.";
    waitingForOperand = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
  updateDisplay();
}

function chooseOperator(operator) {
  if (pendingOperator && !waitingForOperand) calculate(false);
  storedValue = Number(currentValue);
  pendingOperator = operator;
  waitingForOperand = true;
  updateDisplay();
}

async function calculate(addToHistory = true) {
  if (pendingOperator === null || storedValue === null) return;
  const first = storedValue;
  const second = Number(currentValue);
  try {
    const response = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "binary", first, operator: pendingOperator, second })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Calculation failed.");
    const result = Number(payload.result);
    currentValue = formatNumber(result);
    if (addToHistory) addHistory(`${formatNumber(first)} ${pendingOperator} ${formatNumber(second)}`, currentValue);
  } catch (error) {
    currentValue = "Error";
    expression.textContent = error.message;
  }
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = true;
  updateDisplay();
}

async function applyFunction(name) {
  const input = Number(currentValue);
  try {
    const response = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "function", name, value: input, angleMode })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Calculation failed.");
    const output = formatNumber(Number(payload.result));
    addHistory(`${name}(${formatNumber(input)})`, output);
    currentValue = output;
  } catch (error) {
    currentValue = "Error";
    expression.textContent = error.message;
  }
  waitingForOperand = true;
  updateDisplay();
}

function clearCalculator() {
  currentValue = "0";
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = false;
  updateDisplay();
}

function backspace() {
  if (waitingForOperand || currentValue === "Error") return;
  currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
  updateDisplay();
}

function addHistory(calculation, result) {
  history.unshift({ calculation, result });
  history.splice(6);
  historyList.innerHTML = history.map(item => `<div class="history-entry"><span class="calculation">${item.calculation} =</span><strong>${item.result}</strong></div>`).join("");
  entryCount.textContent = String(history.length).padStart(2, "0");
}

function setMemory(action) {
  if (action === "memory-clear") memory = null;
  if (action === "memory-recall" && memory !== null) {
    currentValue = formatNumber(memory);
    waitingForOperand = true;
  }
  if (action === "memory-add") memory = (memory || 0) + Number(currentValue);
  updateDisplay();
}

function toggleSign() {
  if (currentValue !== "0" && currentValue !== "Error") currentValue = currentValue.startsWith("-") ? currentValue.slice(1) : `-${currentValue}`;
  updateDisplay();
}

keypad.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  const { action, value } = button.dataset;
  if (action === "decimal") inputDecimal();
  else if (button.classList.contains("number")) inputNumber(value);
  else if (action === "function") applyFunction(value);
  else if (action === "constant") {
    currentValue = formatNumber(value === "Math.PI" ? Math.PI : Math.E);
    waitingForOperand = true;
    updateDisplay();
  } else if (action === "square") {
    currentValue = formatNumber(Number(currentValue) ** 2);
    waitingForOperand = true;
    updateDisplay();
  } else if (action === "toggle-sign") toggleSign();
  else if (action === "equals") calculate();
  else if (action === "clear" || action === "backspace") action === "clear" ? clearCalculator() : backspace();
  else if (action?.startsWith("memory")) setMemory(action);
  else if (value) chooseOperator(value);
});

document.querySelectorAll(".mode").forEach(button => button.addEventListener("click", () => {
  angleMode = button.dataset.mode;
  document.querySelectorAll(".mode").forEach(mode => mode.classList.toggle("active", mode === button));
  updateDisplay();
}));

document.querySelector("#clear-history").addEventListener("click", () => {
  history.length = 0;
  historyList.innerHTML = '<div class="empty-state">No calculations recorded.<br>Awaiting your first query.</div>';
  entryCount.textContent = "00";
});

document.addEventListener("keydown", event => {
  if (/^[0-9]$/.test(event.key)) inputNumber(event.key);
  else if (event.key === ".") inputDecimal();
  else if (["+", "-", "*", "/", "^"].includes(event.key)) chooseOperator(event.key);
  else if (event.key === "Enter" || event.key === "=") calculate();
  else if (event.key === "Escape") clearCalculator();
  else if (event.key === "Backspace") backspace();
});

updateDisplay();
