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
import { httpPost } from './utils';

export function validatePaymentResponse(paymentResponse) {
    return new Promise(function (resolve, reject) {
        var isValid = false;

        try {
            httpPost('/validatePaymentResponse', paymentResponse).then(function (result) {
                if (result["status"] === 'true') {
                    isValid = true;
                    resolve(isValid);
                } else {
                    reject(result);
                }
            }).catch(function (err) {
                console.log(err);
                reject(err);
            });
        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
}

export function decryptResponse(data) {
    //Make a call to the server endpoint to get the decrypt data. 
    return new Promise(function (resolve, reject) {
        httpPost('/decrypt', JSON.stringify({
            data: data
        })).then(function (result) {
            try {
                resolve(result);
            } catch (err) {
                console.warn("Failed to parse response");
                reject(err);
            }
        }).catch(function (err) {
            console.log(err);
            reject(err);
        });
    });
}

export function displayResponse(paymentResponse) {
    if (paymentResponse.hasOwnProperty('details')) {
        let details = paymentResponse['details']['paymentresponse'] || paymentResponse['details'];
        if (details && details['cardNumber']) {
            $("#payment-fail-pane, #payment-rfp-pane").hide();
            $("#payment-success-pane").show();
            $("#responseSection .paymentSuccessMessage").text(paymentResponse.message);
            $("#requestId").text(paymentResponse.requestId);
            (paymentResponse.payerName) ? $("#payerName").text(paymentResponse.payerName) : $(".payerName").hide();
            $("#cardNumber").text(details.cardNumber);
            $("#expiryDate").text(details.expiry);
            $("#cvv").text(details.cvv);
            $("#accountNumber").text(details.accountNumber);
        } else if (details && details['dssReferenceNumber']) {
            $("#payment-fail-pane, #payment-success-pane").hide();
            $("#payment-rfp-pane").show();
            $("#responseSection .paymentSuccessMessage").text(paymentResponse.message);
            $("#requestIdRFP").text(paymentResponse.requestId);
            (paymentResponse.payerName) ? $("#payerNameRFP").text(paymentResponse.payerName) : $(".payerNameRFP").hide();
            $("#dss").text(details.dssReferenceNumber);
            $("#status").text(details.status);
        }
    } else {
        $("#payment-success-pane, #payment-rfp-pane").hide();

        if (paymentResponse['error']) {
            $("#payment-fail-pane").html("<h4> ERROR : " + paymentResponse.error.code + "</h4><br\><b>" + paymentResponse.error.message + "</b>").show();
        } else if (paymentResponse['message']) {
            $("#payment-fail-pane").html("<b>" + paymentResponse['message'] + "</b>").show();
        } else {
            $("#payment-fail-pane").html("<b>" + paymentResponse + "</b>").show();
        }
    }

    $("#loader").css("display", "none");
    $("#reponseModal, #responseSection").css("display", "block");
}

export function displayLoader() {
    $("#mainContent, #reponseModal").css("display", "none");
    $("#responseSection, #loader").css("display", "block");
}

export function showHidePage(className) {
    $(".hideAll").hide();
    $("".concat(className)).show();
}