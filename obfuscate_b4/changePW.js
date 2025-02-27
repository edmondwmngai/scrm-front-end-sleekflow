// declare the account fields
var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';
var sellerId = sessionStorage.getItem('scrmSellerID') || '';
var forceDetails = sessionStorage.getItem('scrmForceDetails') || '';
var confirmNewPassword;
var fieldChanged = false; // declare the parameters accessing change of fields
var isReset;
var mvcHost = config.mvcHost;
var mvcUrl = config.mvcUrl;

// update user with changed password
function changePassword(sellerIdInput, oldPassword, newPassword) {
    $.ajax({
        type: "PUT",
        url: mvcUrl + '/api/ChangePassword',
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
            if (details == 'Not Auth.') {
                alert('Session Expired');
                window.location.href = './login.html';
            }
        } else {
            event.preventDefault(); // do not submit form
            if (details == "The existing password does not match with our record.") {
                $('#old-password-error').text(details); // show warning
            } else if (details == "Seller does not exist.") {
                $('#seller-id-error').text(details); // show warning
            } else if (details == "Seller does not exist.") {
                $('#seller-id-error').text(details); // show warning
            } else if (details == "The new password has been used before.") {
                $('#password-error').text(details); // show warning
            } else {
                // Remove all sessionstorage
                for (var i = 0; i < sessionStorage.length; i++) {
                    var a = sessionStorage.key(i);
                    sessionStorage.removeItem(a);
                }
                alert('Password changed successfully, please login again');
                window.location.href = './login.html';
            }
        }
    });
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
    } else {
        // validate matching password
        if (newPassword == oldPassword) {
            $('#password-error').text('Password cannot be the same as the old one.'); // for blank fields
            hasError = true;
        }
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
    } else {
        // validate matching password
        if (confirmNewPassword != newPassword) {
            $('#confirm-password-error').text('Password does not match the confirm password.');
            hasError = true;
        }
    }

    $('#validation-result').text(hasError);
}

// Submit is clicked
function submitForm() {
    var changeCounter = 0;

    // add counter when there are changes
    if (fieldChanged) {
        changeCounter = 1;
    }

    // obtain other field values
    var sellerIdInput = $('#txt-seller-id').val();
    var oldPassword = $('#txt-old-password').val();
    var newPassword = $('#txt-password').val();
    confirmNewPassword = $('#txt-confirm-password').val();

    validateForm(sellerIdInput, oldPassword, newPassword, confirmNewPassword); // validate inputs

    var formHasError = $('#validation-result').text();

    if (formHasError == 'true') {
        event.preventDefault(); // do not submit form
    } else {
        if (fieldChanged) {
            changePassword(sellerIdInput, oldPassword, newPassword); // call change password function
        }
    }
}

$(document).ready(function () {
    $('#txt-seller-id').val(sellerId); // assign seller id to textbox
    $('#txt-seller-id').prop("disabled", true); // disable the textbox

    // when field has changed, call this function
    $(".form-group").change(function () {
        fieldChanged = true;
    });

    if (forceDetails == 'Account has expired.') {
        $('#force-info-lbl').text('You password has expired, please change your password.');
    } else if (forceDetails == 'About to expire') {
        var dateDiff = sessionStorage.getItem('scrmExpireInDay') || '';
        var sStr = dateDiff > 1 ? 's' : ''
        $('#force-info-lbl').text('Your password will expire in ' + dateDiff + ' day' + sStr + ', you can change your password now or later');
        // add skip button
        $('#cp-btn-group').append('<button id="cp-skip-btn" class="btn rounded btn-sm btn-default mt-3 mb-0 text-capitalize"><i class="fas fa-times-circle me-2"></i><span>Skip</span></button>');
        $('#cp-skip-btn').on('click', function () {
            event.preventDefault();
            sessionStorage.removeItem('scrmExpireInDay');
            sessionStorage.removeItem('scrmForceDetails');
            window.location.href = './main.html';
        })
    } else if (forceDetails == 'Initial Login.') {
        $('#force-info-lbl').text('You need to change your password on your first-time login to the Marvel.');
    }
    $('#txt-confirm-password').on('keydown', function () {
        if (window.event.keyCode == 13) {
            submitForm();
        } else if (window.event.keyCode == 32) {
            return false;
        }
    })
});
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());