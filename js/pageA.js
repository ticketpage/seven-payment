(() => {
  "use strict";

  const rowsContainer = document.getElementById("numberRows");
  const rowTemplate = document.getElementById("numberRowTemplate");
  const addButton = document.getElementById("addNumberRow");
  const resetButton = document.getElementById("resetSettings");

  const settingFieldIds = [
    "receptionMethod",
    "customerName",
    "paymentDestination",
    "amount",
    "paymentDeadline",
    "deliveryMethod",
    "orderNumber",
    "customerContact",
    "paymentImage",
    "ticketImage"
  ];

  function sanitizeNumber(value) {
    return value
      .replace(/[０-９]/g, (digit) =>
        String.fromCharCode(digit.charCodeAt(0) - 0xFEE0)
      )
      .replace(/[^\d]/g, "");
  }

  function getStoredSettings() {
    try {
      const raw = localStorage.getItem(APP_CONFIG.storageKeys.settings);
      if (!raw) {
        return { ...APP_CONFIG.defaults };
      }

      const parsed = JSON.parse(raw);
      return {
        ...APP_CONFIG.defaults,
        ...parsed
      };
    } catch (error) {
      console.warn("設定の読み込みに失敗しました。デフォルト値を使用します。", error);
      return { ...APP_CONFIG.defaults };
    }
  }

  function populateSelect(selectElement, options) {
    selectElement.innerHTML = "";

    Object.entries(options).forEach(([value, item]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = item.label;
      selectElement.appendChild(option);
    });
  }

  function applySettingsToForm(settings) {
    settingFieldIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      element.value = settings[id] ?? "";
    });
  }

  function readSettingsFromForm() {
    const settings = {};

    settingFieldIds.forEach((id) => {
      const element = document.getElementById(id);
      settings[id] = element.value;
    });

    return settings;
  }

  function saveSettings() {
    const settings = readSettingsFromForm();
    localStorage.setItem(
      APP_CONFIG.storageKeys.settings,
      JSON.stringify(settings)
    );
    return settings;
  }

  function getNumberRows() {
    return Array.from(rowsContainer.querySelectorAll(".number-row"));
  }

  function rebuildTicketRowMap() {
    const map = {};

    getNumberRows().forEach((row, index) => {
      const input = row.querySelector(".number-input");
      const number = sanitizeNumber(input.value);

      if (/^\d{13}$/.test(number)) {
        map[number] = index + 1;
      }
    });

    localStorage.setItem(
      APP_CONFIG.storageKeys.ticketRowMap,
      JSON.stringify(map)
    );

    return map;
  }

  function renumberRows() {
    getNumberRows().forEach((row, index) => {
      const input = row.querySelector(".number-input");
      input.setAttribute("aria-label", `支払票番号 No.${index + 1}`);
      row.dataset.rowNumber = String(index + 1);
    });

    rebuildTicketRowMap();
  }

  function clearRowError(row) {
    const error = row.querySelector(".row-error");
    error.textContent = "";
  }

  function showRowError(row, message) {
    const error = row.querySelector(".row-error");
    error.textContent = message;
  }

  function openPageB(row) {
    const input = row.querySelector(".number-input");
    const number = sanitizeNumber(input.value);

    input.value = number;
    clearRowError(row);

    if (!/^\d{13}$/.test(number)) {
      showRowError(row, "13桁の数字で入力してください");
      input.focus();
      return;
    }

    saveSettings();
    rebuildTicketRowMap();

    const url = `pageB.html?number=${encodeURIComponent(number)}`;
    window.open(url, "_blank", "noopener");
  }

  function addNumberRow(initialValue = "") {
    const fragment = rowTemplate.content.cloneNode(true);
    const row = fragment.querySelector(".number-row");
    const input = row.querySelector(".number-input");
    const generateButton = row.querySelector(".generate-button");
    const removeButton = row.querySelector(".remove-button");

    input.value = sanitizeNumber(initialValue);

    input.addEventListener("input", () => {
      const sanitized = sanitizeNumber(input.value);
      if (input.value !== sanitized) {
        input.value = sanitized;
      }

      clearRowError(row);
      rebuildTicketRowMap();
    });

    generateButton.addEventListener("click", () => {
      openPageB(row);
    });

    removeButton.addEventListener("click", () => {
      const rows = getNumberRows();

      if (rows.length === 1) {
        input.value = "";
        clearRowError(row);
      } else {
        row.remove();
      }

      renumberRows();
    });

    rowsContainer.appendChild(fragment);
    renumberRows();

    return row;
  }

  function resetSettings() {
    applySettingsToForm(APP_CONFIG.defaults);
    localStorage.setItem(
      APP_CONFIG.storageKeys.settings,
      JSON.stringify(APP_CONFIG.defaults)
    );
  }

  function initialize() {
    populateSelect(
      document.getElementById("paymentImage"),
      APP_CONFIG.paymentImages
    );

    populateSelect(
      document.getElementById("ticketImage"),
      APP_CONFIG.ticketImages
    );

    applySettingsToForm(getStoredSettings());
    addNumberRow();

    addButton.addEventListener("click", () => {
      addNumberRow();
    });

    resetButton.addEventListener("click", resetSettings);

    settingFieldIds.forEach((id) => {
      const element = document.getElementById(id);
      element.addEventListener("change", saveSettings);
    });
  }

  initialize();
})();
