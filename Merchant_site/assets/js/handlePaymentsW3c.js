/**  Copyright (c) 2021 Mastercard
 
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
 
    http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 
*/
$(function () {
    /**
     * Initialize the mediator to update the AHI frequency on successful payment 
     */
    merchant_core.init({
        env: 'ENVDefault'
    }).then(function (result) {
        console.log(result);
    }).catch(function (err) {
        console.warn(err.message);
    });

    try {
        //Read the querystring part of a URL.
        var paymentResponseStr = urlSearchParams.get("paymentResponse", window.location.href);

        if (paymentResponseStr) {
            //Decode from Base64 
            var paymentResponse = JSON.parse(atob(paymentResponseStr));

            if (paymentResponse['details'] && paymentResponse['details']['message']['code'] !== 'AHI2000') {
                displayError(paymentResponse['details']);
                return;
            }

            //Verify the payment response sign
            httpPost('/prverify', JSON.stringify({ sign: paymentResponse['details']['sign'] }))
                .then(function (result) {

                    if (result['code'] !== 'M2000') {
                        displayError(result);
                        return;
                    }

                    decryptResponse(result['payload'])
                        .then(function (response) {
                            if (response["status"] !== 'true') {
                                displayError(ERROR_MESSAGES['M5004']);
                                return;
                            }

                            var decryptedCredential = JSON.parse(atob(response['paymentResponse']));

                            paymentResponse['details'] = decryptedCredential;

                            var dataToValidate = JSON.stringify({ 'paymentResponse': paymentResponse });

                            validatePaymentResponse(dataToValidate)
                                .then(function (isValid) {
                                    if (isValid) {
                                        var walletId = decryptedCredential['walletID'];
                                        var transactionSource = decryptedCredential['transactionSource'];
                                        // Update the frequency of successfully used payemnt handler
                                        merchant_core.updateAHIFrequency(walletId, transactionSource);
                                        paymentResponse['message'] = "Order has been placed successfully.";
                                        displayResponse(paymentResponse);
                                        $(".pba-page").hide();
                                        $(".landing-page").show();
                                        $("#mainContent").css("display", "none");
                                        $("#responseSection").css("display", "block");
                                    } else {
                                        displayError(ERROR_MESSAGES['M5003']);
                                    }
                                }).catch(function (error) {
                                    displayError(ERROR_MESSAGES['M5003']);
                                });
                        }).catch(function (err) {
                            displayError(ERROR_MESSAGES['M5004']);
                        });

                }).catch(function (err) {
                    displayError(ERROR_MESSAGES['M5005']);
                });
        }
    } catch (error) {
        displayError(ERROR_MESSAGES['M5003']);
    }
});