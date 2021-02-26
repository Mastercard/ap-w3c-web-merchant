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
    $(".cart-container").click(function () {
        var count = parseInt($(".cart-count").text());
        if (count === 0) {
            $(".emptycart").show();
            $(".nonEmptyCart").hide();
        } else {
            $(".nonEmptyCart").show();
            $(".emptycart").hide();
        }
        $(".checkout-slider").show();
    });
    $(".profile").click(function () {
        $(".profile-slider").show();
    });
    $(".close").click(function () {
        $(".checkout-slider").hide();
        $(".profile-slider").hide();
    });

    if ($('#checkbox-shipping').is(':checked')) {
        $('.shipping-type-div').css("display", "block");
    }

    $('#checkbox-shipping').click(function () {
        if ($('#checkbox-shipping').is(':checked')) {
            $('.shipping-type-div').css("display", "block");
        } else {
            $('.shipping-type-div').css("display", "none");
        }
    });

});

$('.product-quantity input').click(function () {
    updateQuantity(this);
});

$('.glyphicon-remove').click(function () {
    removeItem(this);
});

export function addToCartModal(item) {
    $("#cart-items").modal('show');
    var img = '';
    var altImg = '';
    var title = '';
    var price = '';
    var content = '';

    switch (item) {
        case 'socks':
            img = 'product_socks_red';
            altImg = 'soccer-socks';
            title = 'Soccer Socks';
            price = '$7.00';
            content = `When you're on the field, you need socks that will help you perform at your best. This 2-pack of soccer socks boasts moisture-wicking technology and features arch and ankle compression for stability. Targeted cushioning on the footbed enhances shock absorption for those unexpected quick kicks.`;
            break;

        case 'tshirt':
            img = 'product_tshirt_red';
            altImg = 'soccer-tshirt';
            title = 'Soccer tshirt';
            price = '$17.00';
            content = `This short-sleeve jersey will be your favorite thing to wear! It's perfect for cheering on the team or kicking the ball around himself; the top's sweat-wicking fabric and mesh underarm ventilation help keep his core temp in check as he heats up.`;
            break;

        case 'gloves':
            img = 'product_gloves_orange';
            altImg = 'soccer-gloves';
            title = 'Soccer gloves';
            price = '$15.00';
            content = `Get a grip wearing these goalkeeper gloves, which have latex palms for excellent tact. Their positive cut gives you a greater ball-contact area, while a vented cuff and half-wrap wrist strap allow for a greater range of motion during play.`;
            break;

        case 'shoes':
            img = 'product_shoes_red';
            altImg = 'soccer-shoes';
            title = 'Soccer shoes';
            price = '$31.00';
            content = `Take on the turf in the new men's low-cut soccer shoes. They're crafted using lightweight synthetic leather for exceptional comfort and great ball feel, while the die-cut liner provides responsive shock absorption on impact. Multidirectional and varied-length rubber studs deliver dynamic traction and aggressive control.`;
            break;

        case 'ball':
            img = 'product_balls_orange';
            altImg = 'soccer-ball';
            title = 'Soccer ball';
            price = '$31.00';
            content = `When the titans of soccer clash in Barcelona, this is the ball at the center of the action. It has a seamless surface for true flight off the foot and features high-end materials in the cover, backing and bladder. The rubber-blend construction and rubber bladder promise durability and responsive action.`;
            break;
    }

    $("#product-detail-img").html('<img alt="' + altImg + '" class="img-responsive " src="images/' + img + '.png "></img>');
    $("#product-title").text(title);
    $("#product-price").text(price);
    $(".product-content").text(content);
}

export function addToCart() {
    $("#cart-items").modal('hide');
    var title = $("#product-title").text();
    var img = $("#product-detail-img").find("img").attr("src");
    var price = $("#product-price").text().replace('$', '');
    var htmlStr = `<div class="cart-item">
                        <img alt="cart-item" src="${img}">
                        <div class="cart-item-details">
                            <h5>${title}
                                        <span class="remove-item pull-right" onclick="removeItem(this)">X</span>
                                    </h5>
                            <div class="cart-item-footer">
                                <div class="controls">
                                    <span class="remove" onclick="updateQuantity(this, 'remove')">-</span>
                                    <span class="cart-item-count" init-price="${price}">1</span>
                                    <span class="add" onclick="updateQuantity(this, 'add')">+</span>
                                </div>
                                <div class="cart-item-price" init-price="${price}">$${price}</div>
                            </div>
                        </div>
                    </div>`;
    $("#cart-item").append(htmlStr);
    $(".cart-count").text(parseInt($(".cart-count").text()) + 1);
    $(".cart-container").click();
    recalculateCart();
    $(".product-size").removeClass("btn-blue");
    $(".product-size:first").addClass("btn-blue");
}

export function setProductSize(ele) {
    $(".product-size").removeClass("btn-blue");
    $(ele).addClass("btn-blue");
}

/* Update quantity */
function updateQuantity(ele, option) {
    var quantity = 1;
    var price = 0;
    if (option === 'add') {
        var initQuantity = parseInt($(ele).prev(".cart-item-count").text());
        $(ele).prev(".cart-item-count").text(initQuantity + 1);
        quantity = parseInt($(ele).prev(".cart-item-count").text());
        price = parseFloat($(ele).prev(".cart-item-count").attr('init-price'));
    } else {
        var initQuantity = parseInt($(ele).next(".cart-item-count").text());
        (initQuantity !== 1) ? $(ele).next(".cart-item-count").text(initQuantity - 1) : '';
        quantity = parseInt($(ele).next(".cart-item-count").text());
        price = parseFloat($(ele).next(".cart-item-count").attr('init-price'));

    }

    var itemPrice = price * quantity;
    $(ele).parent().parent().find('.cart-item-price').text(`$${itemPrice.toFixed(2)}`);
    recalculateCart();
}

/* Remove item from cart */
function removeItem(ele) {
    $(ele).parent().parent().parent().remove();
    $(".cart-count").text(parseInt($(".cart-count").text()) - 1);
    recalculateCart();
}

function recalculateCart() {
    var total = 0;
    $(".cart-item").each(function () {
        var price = $(this).find('.cart-item-price').text();
        total += parseFloat(price.match(/[\d\.]+/));
    });
    if (total === 0) {
        $(".emptycart").show();
        $(".nonEmptyCart").hide();
    } else {
        $(".nonEmptyCart").show();
        $(".emptycart").hide();
        $(".subtotal-price").text(`$${total}`);
    }
}


export function getCartItems() {
    var itemsList = [];
    var salesTax = 10;
    var shipping = 2;
    var subTotal = 0;
    var items = $('#cart-item .cart-item');
    items.each(function (index, elem) {
        var item = {};
        var label = $(elem).find('.cart-item-details').text();
        item['label'] = label.substr(0, label.length - 2);
        item['amount'] = {
            currency: 'INR',
            value: parseInt($(elem).find('.cart-item-price').text().replace('$', ''))
        };
        subTotal += item.amount.value;
    });

    itemsList.push({
        label: 'Sub total',
        amount: {
            currency: 'INR',
            value: subTotal
        }
    });

    itemsList.push({
        label: 'Shipping',
        amount: {
            currency: 'INR',
            value: shipping
        }
    });
    itemsList.push({
        label: 'Sales tax',
        pending: true,
        amount: {
            currency: 'INR',
            value: salesTax
        }
    });
    return {
        displayItems: itemsList,
        total: {
            label: 'Total',
            amount: {
                currency: 'INR',
                value: subTotal + salesTax + shipping
            }
        }
    };
}

export function expandMenu() {
    if ($('#GhoNow').hasClass('responsive')) {
        $('#GhoNow').removeClass("responsive");
    } else {
        $('#GhoNow').addClass("responsive");
    }
}

export function radioBtnCheck() {
    $('#dynamicBtn').click();
}