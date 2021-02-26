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
import { displayResponse, displayLoader, showHidePage } from "./common";
import { isMobile, checkBrowser, formatCurrency, generateId, httpPost } from "./utils";
import { getCartItems } from "./cartDetail";

"use strict";
var isChecked = false; //checks if dynamic button is selected or not.
var orderId = null;
$(function () {
    showHidePage('.loader-page');
    if (checkBrowser() === 'safari') {
        $('.dynamic-btns table tbody').prepend('<tr><td class="dynamicButtonIframe"></td></tr>')
    }
    merchant_core.init({
        dynamicButtonContainer: 'dynamicButtonIframe',
        dynamicButtonType: 'radio',
        height: '32px',
        env: 'ENVDefault',
        onDynamicButtonClick: function (event) {
            isChecked = true;
            $('.dynamic-btns input[type="radio"]').prop("checked", false);
        }
    }).then(function (result) {
        console.log(result);
        showHidePage('.landing-page');
    }).catch(function (err) {
        console.warn(err.message);
        if (err.code === "MC005") {
            showHidePage('.landing-page');
        } else {
            displayError(err);
        }
    });
});

export function cancelCheckout() {
    if ($(".dynamic-btns table tr:first-child").find('[value="dynamicBtn"]').length > 0) {
        $(".dynamic-btns table tr:first-child").remove();
    }
    $(".order-details .row").remove();
    showHidePage('.landing-page');
}


export function displayDynamicBtns() {
    showHidePage('.loader-page');
    var url = `/saveOrder`;
    orderId = generateId();
    var cartItems = getCartItems();
    var browserType = checkBrowser();

    try {
        if (window.sessionStorage && !sessionStorage.getItem('orderId')) {
            sessionStorage.setItem('orderId', orderId);
        } else {
            orderId = sessionStorage.getItem('orderId');
            url = `/updateOrder`;
        }
    } catch (error) {
        console.log(error);
    }


    var data = JSON.stringify({
        'orderID': orderId,
        'orderDesc': cartItems,
    });

    if ($(".dynamic-btns table tr:first-child").find('[value="dynamicBtn"]').length > 0) {
        $(".dynamic-btns table tr:first-child").remove();
    }
    $(".order-details .row").remove();

    if (browserType !== 'safari') {
        //Server call to save/update the order details 
        console.time('httpRequest');
        httpPost(url, data).then(function () {
            console.timeEnd('httpRequest');
            /**
             * After successful server call, invoke the function to get last registered or t
            he latest payment handler which is used by the user for completing the payment. 
            */
            console.time('getLatestInstrument');
            merchant_core.getLatestInstrument()
                .then(function (result) {
                    console.timeEnd('getLatestInstrument');
                    let btnHtml = '';
                    if (result.walletId) {
                        btnHtml = `<tr>
                                        <td>
                                            <input type="radio" name="dynamic-btns" id="dynamicBtn" value="dynamicBtn" tabindex="-1" />
                                            <label for="dynamicBtn"><button class="btn btn-primary" style="display:inline-flex;"  onClick="radioBtnCheck()" tabindex="-1">
                                                ${result.bankName} &nbsp;
                                                <img src="${result.baseLogoURL}" alt="logo" style="width:30px">
                                                <img src="${result.logoURL}" alt="logo" style="width:20px">
                                            </button>
                                            </label>
                                        </td>
                                    </tr>`;
                    }
                    /**
                     * dynamic button for browsers except safari  when no payment handlers are registered 
                     */
                    else if (browserType !== 'safari') {
                        btnHtml = `<tr>
                                        <td>
                                            <input type="radio" name="dynamic-btns" id="dynamicBtn" value="dynamicBtn" tabindex="-1"/>
                                            <label for="dynamicBtn">
                                                <button class="btn btn-primary img-background" style="display:inline-flex;"  onClick="radioBtnCheck()" tabindex="-1">
                                                </button>
                                            </label>
                                        </td>
                                    </tr>`;
                    }

                    $(".dynamic-btns table").prepend(btnHtml);

                    $('input:radio').change(function (e) {
                        if (e.target.id === 'dynamicBtn') {
                            isChecked = true;
                        }
                    });

                    $('.pba-page table tr').click(function (e) {
                        if ($(this).find('td input:radio').attr("id") === 'dynamicBtn') {
                            isChecked = true;
                        } else {
                            isChecked = false;
                        }
                        $(this).find('td input:radio').prop('checked', true);
                        if (!isChecked) {
                            $("#paynow").css("cursor", "not-allowed");
                            $("#paynow").prop('disabled', true);
                        } else {
                            $("#paynow").css("cursor", "pointer");
                            $("#paynow").prop('disabled', false);
                        }
                    });

                    setTimeout(() => {
                        $('.pba-page table tr:first').click();
                    }, 200);
                    isChecked = true;
                    $("#paynow").css("cursor", "pointer");
                    $("#paynow").prop('disabled', false);

                }).catch(function (error) {
                    console.warn('Get instrument Error ,', error);
                });

        }).catch(function (err) {
            console.log(err);
            showHidePage('.landing-page');
        });
    } else {
        $('.dynamic-btns').on('click', 'input[type="radio"]', function (e) {
            if (e.target.id != 'dynamicBtn') {
                merchant_core.unSelectPaybutton();
            }
        });
    }
    var htmlStr = buildDisplayItems(cartItems);
    $(htmlStr).insertAfter(".order-details h3");
    showHidePage('.pba-page');

}

export function checkoutService() {

    if (!isChecked) {
        throw new DOMException("payment method not selected");
    }
    var methodData = [{
        supportedMethods: ['https://www.mediatorurl.com/mcpba'],
        data: {
            methodName: ['https://www.mediatorurl.com/mcpba'],
            merchantName: "Ghokart",
            returnURL: 'https://www.merchanturl.com/handlePayments',
            merchantCertificateURL: 'https://www.merchanturl.com/certificate.pem'
        }
    }];
    var details = getCartItems();
    details.id = orderId;

    details['shippingOptions'] = [{
        id: 'STANDARD',
        label: 'Premium',
        amount: {
            currency: 'INR',
            value: 10
        }
    }, {

        id: '11',
        label: 'Delux',
        amount: {
            currency: 'INR',
            value: 12
        },
        selected: true
    }];

    var options = {
        requestPayerName: document.querySelector('#checkbox-buyer-name').checked,
        requestPayerPhone: document.querySelector('#checkbox-buyer-phone').checked,
        requestPayerEmail: document.querySelector('#checkbox-buyer-email').checked,
        requestShipping: document.querySelector('#checkbox-shipping').checked,
        requestBillingAddress: document.querySelector('#checkbox-billing').checked
    };

    if (options.requestShipping) {
        options.shippingType = $('#shippingType').find(":selected").val();
    }

    var paymentRequest = new PaymentRequest(methodData, details, options);
    paymentRequest.canMakePayment()
        .then(function (result) {
            if (result) {
                paymentRequest.show()
                    .then(function (paymentResponse) {
                        try {
                            sessionStorage.removeItem('orderId');
                            sessionStorage.removeItem('addressID');
                        } catch (error) {
                            console.log(error);
                        }
                        /**
                         * In case of mobile browser, check for the code MC021 in payment response
                         * and exit the execution
                         * */
                        if (paymentResponse.code == 'MC021') {
                            return;
                        }
                        /**
                         * In case of order cancellation from user, check for the code AHI5009 in payment response
                         * */
                        if (paymentResponse['details']['message']['code'] == 'AHI5009' || paymentResponse['details']['message']['code'] == 'AHI5001' || paymentResponse['details']['message']['code'] == 'AHI5002' || paymentResponse['details']['message']['code'] == 'AHI5005') {
                            displayError(paymentResponse['details']['message']);
                            return paymentResponse.complete("fail");;
                        }
                        displayLoader();
                        var encodedResponse = '';

                        // Check if the Payment Response contains isW3C 
                        if (paymentResponse['details']['isW3C']) {

                            // Perform Base64 encoding of payment response received from service worker 
                            encodedResponse = btoa(JSON.stringify(paymentResponse));
                            window.location.href = window.location.origin + '/handlePaymentsW3c?paymentResponse=' + encodedResponse;
                            return paymentResponse.complete("success");
                        } else {
                            paymentResponse.complete("success").then(function () {
                                // Perform Base64 encoding of payment response received from artefact
                                encodedResponse = btoa(JSON.stringify(paymentResponse['details']));
                                window.location.href = window.location.origin + '/handlePayments?paymentResponse=' + encodedResponse;
                            });
                        }
                    }).catch(function (err) {
                        //Hide supported browser DomException error
                        if (merchant_core.isSupportedBrowser()) {
                            console.log(err);
                            displayError({ message: new Error("Something went wrong.") });
                        } else {
                            displayError(err);
                        }

                    });
            } else {
                displayError({ message: new Error("No Registered Methods . Cannot Make Payment.") });
            }
        })
        .catch(function (err) {
            // The API threw an error or the user closed the UI
            displayError(err);
        });
    $(".checkout-slider").hide();

    paymentRequest.addEventListener("shippingoptionchange", function (event) {
        event.updateWith(new Promise(function (resolve, reject) {
            handleShippingOptionChange(details, event, resolve, reject);
        }));
    });

    paymentRequest.onshippingaddresschange = function (event) {
        event.updateWith(new Promise(function (resolve, reject) {
            handleAddressChange(details, event, resolve, reject);
        }));
    };

    paymentRequest.addEventListener("paymentmethodchange", function (event) {
        event.updateWith(new Promise(function (resolve, reject) {
            handlePaymentMethodChange(details, event, resolve, reject);
        }));
    });
}

var currentMethodName = null;

function handleAddressChange(details, event, resolve, reject) {
    // changed address from events paymentRequest
    var shippingAddress = JSON.parse(JSON.stringify(event.target.shippingAddress));
    var shippingStandard, shippingExpress, unsupportedAddress = false;
    var shippingId = shippingAddress.id ? shippingAddress.id : generateId();
    var oldAddressId = '';
    try {
        oldAddressId = sessionStorage.getItem("oldAddressId");
    } catch (error) {
        console.log(error);
    }

    if (!oldAddressId || oldAddressId === 'undefined') {
        oldAddressId = shippingId;
        try {
            sessionStorage.setItem("oldAddressId", oldAddressId);
        } catch (error) {
            console.log(error);
        }
    }
    var newAddressId = shippingId;
    var addressID = '';
    try {
        sessionStorage.getItem("addressID");
    } catch (error) {
        console.log(error);
    }

    var url = '/saveAddress';
    if (oldAddressId !== newAddressId && addressID) {
        url = '/updateAddress';
        shippingAddress['addressID'] = addressID;

    }
    shippingAddress['orderID'] = orderId;
    var data = JSON.stringify({ shippingAddress: shippingAddress });

    httpPost('/validateAddress', data).then(function (result) {
        if (result.hasOwnProperty('status') && result.status === 'true') {

            httpPost(url, data).then(function (response) {
                if (response.hasOwnProperty("addressID")) {
                    try {
                        sessionStorage.setItem("addressID", response.addressID);
                    } catch (error) {
                        console.log(error);
                    }
                }
            }).catch(function (error) {
                console.log(error);
            })

            shippingStandard = {
                id: 'International Standard',
                label: 'Standard shipping International',
                amount: { currency: 'INR', value: '15.00' },
                selected: true
            };
            shippingExpress = {
                id: 'International Express',
                label: 'Express shipping International',
                amount: { currency: 'INR', value: '45.00' },
                selected: false
            };
        } else {
            unsupportedAddress = true;
        }

        //Now set available shipping options for the chosen address
        if (unsupportedAddress) {
            // Set to empty for unsupported address
            details.shippingOptions = [];
            details['error'] = "Can't ship to this address. Select a different address.";
            details['shippingAddressErrors'] = {
                addressLine: 'Invalid addressLine',
                city: 'Invalid city',
                country: 'Invalid country',
                dependentLocality: 'Invalid dependent Locality',
                organization: 'Invalid Organization',
                phone: 'Invalid phone',
                postalCode: 'Invalid Postal code',
                recipient: 'Invalid recipient',
                region: 'Invalid region',
                sortingCode: 'Invalid Sorting code'
            };
            details = updateTotal(details, {
                amount: {
                    value: 0
                }
            });
        } else {
            details.shippingOptions = [shippingStandard, shippingExpress];
            delete details['error'];
            var foundShipping = false;
            details.displayItems.forEach(function (item) {
                if (item.label == 'Shipping') {
                    foundShipping = true;
                    item.amount = {
                        currency: 'INR',
                        value: shippingStandard.amount.value
                    }
                } else if (item.label === 'Sales tax') {
                    item.pending = false;
                    item.amount = {
                        currency: 'INR',
                        value: '11'
                    };
                }
            });

            if (!foundShipping) {
                details.displayItems.push({
                    label: 'Shipping',
                    amount: {
                        currency: 'INR',
                        value: shippingStandard.amount.value
                    }
                });
            }
            //Update the order summary, display standard shipping by default
            updateTotalWithModifiers(details, currentMethodName);
        }
        resolve(details);
    }).catch(function (error) {
        console.log(error);
        reject(details);
    });
}


function handleShippingOptionChange(details, event, resolve, reject) {
    var updateRequestObject = event.target,
        selectedShippingOption = null;

    details.shippingOptions.forEach(function (item) {
        if (item.id === updateRequestObject.shippingOption) {
            item.selected = true;
            selectedShippingOption = item;
        } else {
            item.selected = false;
        }
    });
    updateTotal(details, selectedShippingOption);

    resolve(details);
}

function handlePaymentMethodChange(details, event, resolve, reject) {
    var methodDetails = event.methodDetails;

    var isPresent = false;
    if (event.methodName === 'https://www.mediatorurl.com/pay') {
        details.displayItems.forEach(function (item) {
            if (item.label === 'Service Charge') {
                isPresent = true;
            }
        });

        if (!isPresent) {
            details.displayItems.push({
                label: "Service Charge",
                amount: {
                    currency: "INR",
                    value: "10",
                },
            });
        }
        details.total.amount.value = parseInt(details.total.amount.value) + 10;
    } else {
        details.displayItems.forEach(function (item, index) {
            if (item.label === 'Service Charge') {
                details.displayItems.splice(index, 1);
            }
        });
    }
    updateTotalWithModifiers(details, event.methodName);
    resolve(details);
}

function updateTotal(details, shippingOption) {
    details.displayItems.forEach(function (item) {
        if (item.label === 'Shipping') {
            item.amount.value = shippingOption.amount.value;
        }
    });
    var subTotal = 0,
        salesTax = 0;
    details.displayItems.forEach(function (item) {
        subTotal += parseInt(item.amount.value);
    });

    details.displayItems.forEach(function (item) {
        if (item.label == 'Card processing fee') {
            subTotal -= 45;
        }
        if (item.label == 'Credit surcharge') {
            subTotal -= 2;
        }
    });
    if (currentMethodName === 'https://www.mediatorurl.com/pay') {
        subTotal += 2;
    } else if (currentMethodName == 'https://www.mediatorurl.com/pay') {
        subTotal += 45;
    }
    details.total.amount.value = subTotal;
    if (details.modifiers) {
        $.each(details.modifiers, function (index, item) {
            item.total.amount.value = subTotal;
        });
    }
    return details;
}

/* function updateTotalForAddress(details, shippingOption) {
    details.displayItems.forEach(function(item) {
        if (item.label === 'Shipping') {
            item.amount.value = shippingOption.amount.value;
        }
    });
    var subTotal = 0,
        salesTax = 0;
    details.displayItems.forEach(function(item) {
        subTotal += parseInt(item.amount.value);
    });

    details.total.amount.value = subTotal;
    if (details.modifiers) {
        $.each(details.modifiers, function(index, item) {
            item.total.amount.value = subTotal;
        });
    }
    return details;
} */

function updateTotalWithModifiers(details, methodName) {
    var subTotal = 0,
        salesTax = 0;
    details.displayItems.forEach(function (item) {
        subTotal += parseInt(item.amount.value);
    });

    details.displayItems.forEach(function (item) {
        if (item.label == 'Card processing fee') {
            subTotal -= 45;
        }
        if (item.label == 'Credit surcharge') {
            subTotal -= 2;
        }
    });
    if (methodName === 'https://www.mediatorurl.com/pay') {
        subTotal += 2;
    } else if (methodName == 'https://www.mediatorurl.com/pay') {
        subTotal += 45;
    }
    currentMethodName = methodName;
    details.total.amount.value = subTotal;
    if (details.modifiers) {
        $.each(details.modifiers, function (index, item) {
            item.total.amount.value = subTotal;
        });
    }
}

/* function validatePayer(paymentResponse) {
    var errors = checkPayerErrors(
        paymentResponse.payerName,
        paymentResponse.payerEmail,
        paymentResponse.payerPhone
    )
    if (Object.getOwnPropertyNames(errors).length) {
        paymentResponse.retry(errors);
    } else {
        //We have a good payment; send the data to the server
        paymentResponse.complete("success").then(function() {
            var encodedResponse = btoa(paymentResponse['details']);
            window.location.href = window.location.origin + '/index?paymentResponse=' + encodedResponse;
        });
    }
} */

/* function checkPayerErrors(name, email, phone) {
    //do the validation for name , email, phone
    // and if errors found error send the error object
    var errorObj = {};

    //dummy validation given for example
    if (email && email.indexOf("gmail") > -1) {
        if (!errorObj.payer) {
            errorObj['payer'] = {};
        }
        errorObj.payer['email'] = "Invalid domain";
    }
    if (phone && phone.substr(0, 3) == "+77") {
        if (!errorObj.payer) {
            errorObj['payer'] = {};
        }
        errorObj.payer['phone'] = "Invalid phone number";
    }
    return errorObj;
} */

export function displayError(err) {
    $(".pba-page").hide();
    $(".landing-page").show();
    displayLoader();
    displayResponse(err);
}

function buildDisplayItems(details) {
    if (details.displayItems && Array.isArray(details.displayItems) && details.total) {
        let displayItems = '';
        details.displayItems.forEach(function (item, index) {
            displayItems += `<div class="row">
                    <div class="col-xs-6 col-md-3">${item.label}</div>
                    <div class="col-xs-3 col-md-2 text-right"></div>
                    <div class="col-xs-3 col-md-2 text-right">${formatCurrency(item.amount.value, item.amount.currency)} </div>
                </div>`;
        });

        return displayItems + `<div class="row">
                    <div class="col-xs-6 col-md-3">${details.total.label}</div>
                    <div class="col-xs-3 col-md-2 text-right">${formatCurrency(details.total.amount.value, details.total.amount.currency)}</div>
                    <div class="col-xs-3 col-md-2 text-right">
                    ${formatCurrency(details.total.amount.value, details.total.amount.currency)}
                    </div>
                </div>`;
    } else if (details.total) {
        return displayItems + `<div class="row" style="font-weight:bold;">
                    <div class="col-xs-6 col-md-3"><b>${details.total.label}</b></div>
                    <div class="col-xs-3 col-md-2 text-right"><b>${formatCurrency(details.total.amount.value, details.total.amount.currency)}</b></div>
                    <div class="col-xs-3 col-md-2 text-right">
                        <b>${formatCurrency(details.total.amount.value, details.total.amount.currency)}</b>
                    </div>
                </div>`;
    }
    return '';
}