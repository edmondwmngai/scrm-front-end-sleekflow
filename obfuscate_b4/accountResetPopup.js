// declare the account fields
var agentId = 0
var colId = null;
var agentName;
var email;
var password;
var confirmPassword;
var role;
var counter;
var accountStatus;
var loginId = window.opener.loginId;
var token = window.opener.token;

// declare the parameters accessing change of fields and upload of photos
var fieldChanged = false;
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var mvcUrl = config.mvcUrl;
// After selecting photo for upload
function setLanguage() {
    $('#ac-reset-title').text(langJson['l-main-user-reset'] + ' | Epro Marvel');
    $('#user-reset-header').text(langJson['l-main-user-reset']);
    $('.l-account-seller-id').text(langJson['l-account-seller-id']);
    $('.l-account-agent-id').text(langJson['l-account-agent-id']);
    $('.l-account-profile-photo').text(langJson['l-account-profile-photo']);
    $('.l-account-choose-photo').text(langJson['l-account-choose-photo']);
    $('.l-account-agent-name').text(langJson['l-account-agent-name']);
    $('.l-account-email').text(langJson['l-account-email']);
    $('.l-account-password').text(langJson['l-account-password']);
    $('.l-account-confirm-password').text(langJson['l-account-confirm-password']);
    $('.l-account-role').text(langJson['l-account-role']);
    $('.l-account-account-status').text(langJson['l-account-account-status']);
    $('.l-account-active').text(langJson['l-account-active']);
    $('.l-general-save').text(langJson['l-general-save']);
    $('.l-general-cancel').text(langJson['l-general-cancel']);
    $('.l-fb-remove-media').text(langJson['l-fb-remove-media']);
}
// update user
function updateUser() {
    var inputObj;
    if (password.length > 0) {
        inputObj = {
            ColId: colId,
            SellerID: sellerId,
            AgentID: parseInt(agentId),
            AgentName: agentName,
            Email: email,
            Password: password,
            Role: role,
            Counter: counter,
            Account_status: accountStatus,
            Photo_Removed: "N",
            Agent_Id: loginId,
            Token: token
        };
    } else {
        // do not update password
        inputObj = {
            ColId: colId,
            SellerID: sellerId,
            AgentID: parseInt(agentId),
            AgentName: agentName,
            Email: email,
            Role: role,
            Counter: counter,
            Account_status: accountStatus,
            Photo_Removed: "N",
            Agent_Id: loginId,
            Token: token
        };
    }

    $.ajax({
        type: "PUT",
        url: mvcUrl + '/api/UpdateUser',
        data: JSON.stringify(inputObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        var details = res.details;
        if (!/^success$/i.test(res.result || "")) {
            console.log("error /n" + res ? res : '');
        } else {
            window.opener.location.reload(true);
            window.close();
        }
    });
}

function checkDuplicates(agentIdInput) {
    $.ajax({
        type: "POST",
        url: mvcUrl + '/api/CheckAgentId/',
        data: JSON.stringify({
            AgentID: agentIdInput,
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        var isTaken = res.result;
        //console.log('res.result: ' + isTaken);
        if (isTaken) {
            $('#agent-id-error').text('This agent id is taken.');
            $('#agent-id-error').css('color', 'red');
            //$('#txt-agent-id').val('');
        } else {
            $('#agent-id-error').text('This agent id is not taken.');
            $('#agent-id-error').css('color', 'green');
        }
    });
}

function checkSellerDuplicates(sellerIdInput) {
    $.ajax({
        type: "POST",
        url: mvcUrl + '/api/CheckSellerId',
        data: JSON.stringify({
            SellerID: sellerIdInput,
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        var isTaken = res.result;
        console.log('res.result: ' + isTaken);
        if (isTaken) {
            $('#seller-id-error').text('This seller id is taken.');
            $('#seller-id-error').css('color', 'red');
            //$('#txt-agent-id').val('');
        } else {
            $('#seller-id-error').text('This seller id is not taken.');
            $('#seller-id-error').css('color', 'green');
        }
    });
}

//when the account pop-up window is onload
function accountRecordPopupOnload() {
    setLanguage();
    var windowOpener = window.opener;
    var queryObj = windowOpener.selectedAccount;
    console.log('queryObj: ');
    console.log(queryObj);
    // disable the textbox initially
    $('#txt-password').prop('disabled', true);
    $('#txt-confirm-password').prop('disabled', true);
    // obtain other field values
    colId = queryObj.ColId;
    sellerId = queryObj.SellerID;
    agentId = queryObj.AgentID;
    agentName = queryObj.AgentName;
    email = queryObj.Email;
    role = queryObj.RoleName;
    counter = queryObj.Counter;
    accountStatus = queryObj.Account_status;

    // set the field values
    $('#txt-agent-id').text(agentId);
    $('#txt-name').text(agentName);
    $('#txt-email').text(email);
    $('#txt-seller-id').text(sellerId);
    $('#role-name').text(role);
    $('#account-status').text(accountStatus);

    // $('#check-agent-button').click(checkDuplicates(agentId));
    // $('#check-seller-button').click(checkSellerDuplicates(sellerId));

    // set toggle
    // if (accountStatus == "Active") {
    //     $('#status-toggle').prop('checked', true);
    //     $('#account-status-label').text(langJson['l-account-active']);
    // } else {
    //     $('#status-toggle').prop('checked', false);
    //     $('#account-status-label').text(langJson['l-account-inactive']);
    // }

    // create checkbox
    var changePwCheckbox = $('<label class="form-check-label all" for="change-password">' +
        '<input class="form-check-input" type="checkbox" id="change-password" value="Change Password">Change Password' +
        '<span class="form-check-sign"><span class="check"></span></span></label>');
    changePwCheckbox.appendTo('#change-password-container');

    // create counter field and counter value labels
    var counterFieldLabel = $('<label />', {
        class: 'form-label mr-5',
        text: langJson['l-account-counter']
    });
    var counterValueLabel = $('<label />', {
        id: 'counter-label',
        class: 'form-label',
        text: counter
    });

    // create reset button


    counterFieldLabel.appendTo('#counter-div'); // append "Counter: "
    counterValueLabel.appendTo('#counter-div'); // append value

    if (counter >= 3) {
        var resetBtn = $('<button />', {
            class: 'to-be-disabled btn rounded btn-sm btn-info mt-3 text-capitalize',
            placeholder: langJson['l-ac-reset-unlock'],
            text: langJson['l-ac-reset']
        });
        $('<br>').appendTo('#counter-div');
        resetBtn.appendTo('#counter-div'); // make the reset button appear
        // set the reset button on click action
        resetBtn.click(function () {
            fieldChanged = true;
            counter = 0;
            $('#counter-label').text(counter); // set the new counter to text
            //$('#counter-span').text(counter); // set the new counter to text
        });
    }

    // when check box is checked, text field is enabled
    $('#change-password').change(function () {
        if ($(this).prop("checked")) {
            $('#change-password').prop('checked', true);
            $('#txt-password').prop('disabled', false);
            $('#txt-confirm-password').prop('disabled', false);
        } else {
            $('#change-password').prop('checked', false);
            $('#txt-password').prop('disabled', true);
            $('#txt-confirm-password').prop('disabled', true);
            $('#txt-password').val(''); // clear the text field
            $('#txt-confirm-password').val(''); // clear the text field
        }
    });

    // when field has changed, call this function
    $(".form-group").change(function () {
        fieldChanged = true;
    });
    console.log('fieldChanged is ' + fieldChanged);
}

// Cancel is clicked
function clearForm() {
    // close window
    window.close();
}

function validateForm(password, confirmPassword) {
    var hasError = false;
    // validate password (only if the checkbox "Change Password" is clicked)
    var isChecked = $('#change-password').prop('checked');
    if (isChecked) {
        if (password.length == 0 || confirmPassword.length == 0) {
            $('#password-error').text('This field is required.'); // for blank fields
            hasError = true;
        } else {
            $('#password-error').text('');
        }
        // validate confirm password
        if (confirmPassword.length == 0) {
            $('#confirm-password-error').text('This field is required.'); // for blank fields
            hasError = true;
        //} else {  // 20250410 'If' statement should not be the only statement in 'else' block
            // validate matching password
        } else if (confirmPassword != password) {
                $('#confirm-password-error').text('Password does not match the confirm password.');
                hasError = true;
        } else {
                $('#confirm-password-error').text('');
          //  } // 20250410 for else if
        }
    }
    console.log('validation hasError result: ' + hasError);
    $('#validation-result').text(hasError);
    //return hasError;
}

function changePassword() {
    return false;
}

// Submit is clicked
function submitForm() {
    console.log('field changed? ' + fieldChanged);

    if (!fieldChanged) {    // 20250407 if (fieldChanged == false) {    Refactor the code to avoid using this boolean literal.
        window.close();
    }

    var agent_id = 0; // agent id in int format
    password = $('#txt-password').val();
    confirmPassword = $('#txt-confirm-password').val();
    counter = parseInt($('#counter-label').text());

    validateForm(password, confirmPassword);

    var formHasError = $('#validation-result').text();
    console.log('submit has error? ', formHasError);

    if (formHasError == 'true') {
        event.preventDefault(); // do not submit form
    } else {
        updateUser();
    }
}
$(document).ready(function () {
    if (window.opener.parent.addPopupIdle) {
        window.opener.parent.addPopupIdle($(parent.document));
    }
});
document.addEventListener('contextmenu', event => event.preventDefault());