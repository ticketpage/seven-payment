(() => {
  "use strict";

  const BARCODE_ENDPOINT = "https://inticket.sej.co.jp/order/barcode?Code=";

  function normalizeNumber(value) {
    return String(value ?? "")
      .replace(/[０-９]/g, (digit) =>
        String.fromCharCode(digit.charCodeAt(0) - 0xFEE0)
      )
      .replace(/[^\d]/g, "");
  }

  function formatNumber(number) {
    if (!/^\d{13}$/.test(number)) {
      return number;
    }

    return number.replace(
      /(\d{4})(\d{4})(\d{5})/,
      "$1-$2-$3"
    );
  }

  function getStoredSettings() {
    try {
      const raw = localStorage.getItem(APP_CONFIG.storageKeys.settings);

      if (!raw) {
        return { ...APP_CONFIG.defaults };
      }

      return {
        ...APP_CONFIG.defaults,
        ...JSON.parse(raw)
      };
    } catch (error) {
      console.warn(
        "設定の読み込みに失敗しました。デフォルト値を使用します。",
        error
      );
      return { ...APP_CONFIG.defaults };
    }
  }

  function getTicketNumber(number) {
    try {
      const raw = localStorage.getItem(APP_CONFIG.storageKeys.ticketRowMap);
      if (!raw) return null;

      const map = JSON.parse(raw);
      const rowNumber = Number(map[number]);

      return Number.isInteger(rowNumber) && rowNumber > 0
        ? rowNumber
        : null;
    } catch (error) {
      console.warn("No.情報の読み込みに失敗しました。", error);
      return null;
    }
  }

  function toFullWidthDigits(value) {
    return String(value).replace(/\d/g, (digit) =>
      String.fromCharCode(digit.charCodeAt(0) + 0xFEE0)
    );
  }

  function getDefaultPaymentDeadline() {
    const now = new Date();
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

    const dateText =
      `${now.getFullYear()}年` +
      `${now.getMonth() + 1}月` +
      `${now.getDate()}日` +
      `（${weekdays[now.getDay()]}）`;

    return `${toFullWidthDigits(dateText)}　２３：５９`;
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value ?? "";
    }
  }

  function resolveImage(configGroup, key, fallbackKey) {
    const selected = configGroup[key] || configGroup[fallbackKey];
    return selected ? selected.file : "";
  }

  function render() {
    const params = new URLSearchParams(window.location.search);
    const number = normalizeNumber(params.get("number"));
    const settings = getStoredSettings();
    const rowNumber = getTicketNumber(number);

    setText("g010", formatNumber(number));

    const barcodeImage = document.getElementById("barcodeImage");
    if (/^\d{13}$/.test(number)) {
      barcodeImage.src = BARCODE_ENDPOINT + encodeURIComponent(number);
      barcodeImage.style.display = "";
    } else {
      barcodeImage.removeAttribute("src");
      barcodeImage.style.display = "none";
    }

    const receptionMethod = rowNumber
      ? `${settings.receptionMethod} No.${rowNumber}`
      : settings.receptionMethod;

    setText("g011", receptionMethod);
    setText("g012", settings.customerName);
    setText("g013", settings.paymentDestination);
    setText("g014", settings.amount);
    setText(
      "g016",
      settings.paymentDeadline && settings.paymentDeadline.trim()
        ? settings.paymentDeadline
        : getDefaultPaymentDeadline()
    );
    setText("g019", settings.deliveryMethod);
    setText("g020", settings.orderNumber);

    setText("g026", settings.customerContact);

    const paymentImage = document.getElementById("paymentImage");
    paymentImage.src = resolveImage(
      APP_CONFIG.paymentImages,
      settings.paymentImage,
      APP_CONFIG.defaults.paymentImage
    );

    const ticketImage = document.getElementById("ticketImage");
    ticketImage.src = resolveImage(
      APP_CONFIG.ticketImages,
      settings.ticketImage,
      APP_CONFIG.defaults.ticketImage
    );
  }

  render();
})();
