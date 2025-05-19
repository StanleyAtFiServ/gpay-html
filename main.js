//=============================================================================
// Configuration
//=============================================================================

// The DOM element that the Google Pay button will be rendered into
const GPAY_BUTTON_CONTAINER_ID = 'gpay-container';

// Update the `merchantId` and `merchantName` properties with your own values.
// Your real info is required when the environment is `PRODUCTION`.
const merchantInfo = {
  merchantId: 'oidcybstraining001',
  merchantName: 'FiServ HK Office'
};

// This is the base configuration for all Google Pay payment data requests.
const baseGooglePayRequest = {
  // STEP_1 : Define your Google Pay API version
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: [
    {
      type: 'CARD',
      // STEP_4.1 : Describe your allowed payment method
      parameters: {
        // STEP_3.
        allowedAuthMethods: [
          "PAN_ONLY", "CRYPTOGRAM_3DS"
        ],
        allowedCardNetworks: [
          "VISA"
        ]
      },
      // STEP_2 : Request a payment token for your payment provider
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'cybersource',
          gatewayMerchantId: '43210987001'
        }
      }
    }
  ],
  merchantInfo
};

// Prevent accidental edits to the base configuration. Mutations will be
// handled by cloning the config using deepCopy() and modifying the copy.
Object.freeze(baseGooglePayRequest);

//=============================================================================
// Google Payments client singleton
//=============================================================================

let paymentsClient = null;

function getGooglePaymentsClient() {
  if (paymentsClient === null) {
    // STEP_5.2 : Initial a paymentClient object
    paymentsClient = new google.payments.api.PaymentsClient({
      environment: 'TEST',
      merchantInfo,
      // todo: paymentDataCallbacks (codelab pay-web-201)
    });
  }

  return paymentsClient;
}

//=============================================================================
// Helpers
//=============================================================================

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

// STEP_7: Add a GPay button
function renderGooglePayButton() {
  const button = getGooglePaymentsClient().createButton({
    onClick: onGooglePaymentButtonClicked
  });

  document.getElementById(GPAY_BUTTON_CONTAINER_ID).appendChild(button);
}

//=============================================================================
// Event Handlers
//=============================================================================

function onGooglePayLoaded() {
    const req = deepCopy(baseGooglePayRequest);

    // STEP_6.2 : Determine if GPay support current device/browser
    getGooglePaymentsClient()
      .isReadyToPay(req)
      .then(function(res) {
        if (res.result) {
          renderGooglePayButton();  // Yes, display google pay button
        } else {
          console.log("Google Pay is not ready for this user.");
        }
      })
      .catch(console.error);
  }

  function onGooglePaymentButtonClicked() {
    // Create a new request data object for this request
    const req = {
      ...deepCopy(baseGooglePayRequest),
      transactionInfo: {
        countryCode: 'HK',
        currencyCode: 'HKD',
        totalPriceStatus: 'FINAL',
        totalPrice: "1.00",
      },
      // todo: callbackIntents (codelab gpay-web-201)
    };

    // Write request object to console for debugging
    console.log("Debug after clicking button");
    console.log(req);

    getGooglePaymentsClient()
      .loadPaymentData(req)
      .then(function (res) {
        // Write response object to console for debugging
        console.log("Debug when get res");
        console.log(res);
        // @todo pass payment token to your gateway to process payment
        // @note DO NOT save the payment credentials for future transactions
        var rspPaymentData = res.paymentMethodData.tokenizationData.token;
        const b64EncPayData = btoa(rspPaymentData); 

        console.log("-EncB64Data-");
        console.log(b64EncPayData);
        document.getElementById("idB64EncText").innerText = b64EncPayData;
      })
      .catch(console.error);
  }
