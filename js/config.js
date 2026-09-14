const APP_CONFIG = {
  storageKeys: {
    settings: "sevenPaymentSettings",
    ticketRowMap: "sevenPaymentTicketRowMap"
  },

  defaults: {
    receptionMethod: "代金の支払いのみ",
    customerName: "江端玲音　様",
    paymentDestination: "HelloProject",
    amount: "8,500円",
    paymentDeadline: "",
    deliveryMethod: "店舗でのお渡し無し",
    orderNumber: "",
    customerContact: "03-4434-8354",

    paymentImage: "paymentOnly",
    ticketImage: "noTicket"
  },

  paymentImages: {
    paymentOnly: {
      label: "お支払いのみ",
      file: "assets/images/payment/siharai_nomi.png"
    },
    payment: {
      label: "お支払い",
      file: "assets/images/payment/siharai.png"
    },
    noPayment: {
      label: "お支払いなし",
      file: "assets/images/payment/siharai_nasi.png"
    }
  },

  ticketImages: {
    noTicket: {
      label: "発券なし",
      file: "assets/images/ticket/ticket_nasi.png"
    },
    future: {
      label: "後日発券",
      file: "assets/images/ticket/ticket_future.png"
    },
    available: {
      label: "発券あり",
      file: "assets/images/ticket/ticket_ari.png"
    }
  }
};
