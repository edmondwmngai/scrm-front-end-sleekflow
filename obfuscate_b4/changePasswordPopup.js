// declare the account fields
var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';
var sellerId = sessionStorage.getItem('scrmSellerID') || '';
var sellerIdInput;
var newPassword;
var confirmNewPassword;
var fieldChanged = false; // declare the parameters accessing change of fields
var isReset;
var mvcHost = config.mvcHost;
var mvcUrl = config.mvcUrl;
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
// get url query string
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// update user with changed password
function changePassword(sellerIdInput, oldPassword, newPassword) {
    $.ajax({
        type: "PUT",
        url: config.mvcUrl + '/api/ChangePassword',
        data: JSON.stringify({
            SellerID: sellerIdInput,
            Old_Password: oldPassword,
            Password: newPassword,
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        var counter = 1;
        var details = res.details;
        if (!/^success$/i.test(res.result || "")) {
            console.log("error /n" + res ? res : '');
        } else {
            event.preventDefault(); // do not submit form
            if (details == "The existing password does not match with our record.") {
                $('#old-password-error').text(details); // show warning
            } else if (details == "Seller does not exist.") {
                $('#seller-id-error').text(details); // show warning
                //} else if (details == "Seller does not exist.") {         // 20250408 if/else if" chains and "switch" cases should not have the same condition
            //    $('#seller-id-error').text(details); // show warning
            } else if (details == "The new password has been used before.") {
                $('#password-error').text(details); // show warning
            } else {
                // same password
                counter = counter - 1;
                if (counter == 0) {
                    window.close();
                }
            }
        }
    });
}

//when the account pop-up window is onload
function popupOnload() {
    // set header text
    var changePWStr = langJson['l-main-change-password'];
    $('#change-pw-title').text(changePWStr + ' | Epro Marvel');
    $('#p-header').text(changePWStr);
    $('.l-account-seller-id').text(langJson['l-account-seller-id']);
    $('.l-ac-existing-pw').text(langJson['l-ac-existing-pw']);
    $('.l-ac-new-pw').text(langJson['l-ac-new-pw']);
    $('.l-ac-confirm-new-pw').text(langJson['l-ac-confirm-new-pw']);
    $('.l-general-save').text(langJson['l-general-save']);
    $('.l-general-cancel').text(langJson['l-general-cancel']);
    isReset = getParameterByName('reset');

    if (isReset != 'true') {
        $('#txt-seller-id').val(sellerId); // assign seller id to textbox
        $('#txt-seller-id').prop("disabled", true); // disable the textbox
    }

    // when field has changed, call this function
    $(".form-group").change(function () {
        fieldChanged = true;
    });
}

// Cancel is clicked
function clearForm() {
    // close window
    window.close();
}

function validateForm(sellerIdInput, oldPassword, newPassword, confirmNewPassword) {
    var hasError = false;
    $('.blank-error-span').empty(); // clear old warning message
    // validate seller ID
    if (sellerIdInput.length == 0) {
        $('#seller-id-error').text('This field is required.'); // for blank fields
        hasError = true;
    }

    // validate new password format
    if (oldPassword.length == 0) {
        $('#old-password-error').text('This field is required.'); // for blank fields
        hasError = true;
    }

    // validate new password
    if (newPassword.length == 0) {
        $('#password-error').text('This field is required.'); // for blank fields
        hasError = true;
    //} else { // 20250410 'If' statement should not be the only statement in 'else' block
        // validate matching password
    } else if (newPassword == oldPassword) {
            $('#password-error').text('Password cannot be the same as the old one.'); // for blank fields
            hasError = true;
        //}// 20250410 for else if 
    }

    // validate new password
    var patt = /^(?=.*[A-Za-z])(?=.*\d)[a-zA-Z0-9!@#$%^&*()~¥=_+}{":;'?/>.<,`\-\|\[\]]{8,50}$/
    if (!patt.test(newPassword)) {
        $('#password-error').text('Password must be between 8 to 50 characters which contains at least one numeric digit and one letter.'); // for blank fields
        hasError = true;
    }

    // validate confirm new password
    if (confirmNewPassword.length == 0) {
        $('#confirm-password-error').text('This field is required.'); // for blank fields
        hasError = true;
    //} else { // 20250410 'If' statement should not be the only statement in 'else' block
        // validate matching password
    } else if (confirmNewPassword != newPassword) {
            $('#confirm-password-error').text('Password does not match the confirm password.');
            hasError = true;
       // } // 20250410 for else if 
    }

    $('#validation-result').text(hasError);
}

var changeCounter = 0;		// 20250411 Add the "let", "const" or "var" keyword to this declaration of "changeCounter" to make it explicit.
// Submit is clicked
function submitForm() {
	
	// add counter when there are changes
    if (fieldChanged) {
        changeCounter = 1;
    }

    // obtain other field values
    sellerIdInput = $('#txt-seller-id').val();
    var oldPassword = $('#txt-old-password').val();
    newPassword = $('#txt-password').val();
    confirmNewPassword = $('#txt-confirm-password').val();

    validateForm(sellerIdInput, oldPassword, newPassword, confirmNewPassword); // validate inputs

    var formHasError = $('#validation-result').text();

    if (formHasError == 'true') {
        event.preventDefault(); // do not submit form
    //} else { // 20250410 for 'If' statement should not be the only statement in 'else' block
    } else if (fieldChanged) {
            changePassword(sellerIdInput, oldPassword, newPassword); // call change password function
       // }// 20250410 for else if 
    }
}

$(document).ready(function () {
    if (window.opener.addPopupIdle) {
        window.opener.addPopupIdle($(document));
    }
});
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());