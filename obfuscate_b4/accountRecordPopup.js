// declare the account fields
var photoContent;
var photoType;
var colId = null;
var userAgentId = null;
var originalAgentId = null;
var originalSellerId;
// declare the parameters accessing change of fields and upload of photos
var fieldChanged = false;
var photoChanged = false;
var photoRemoved = "N";
var photoSrc = './images/user.png'; // default photo source
var changedField = {};
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var mvcUrl = config.mvcUrl;
var loginId = window.opener.loginId;
var token = window.opener.token;
var isLdap = config.isLdap || false;
// After selecting photo for upload
function setLanguage() {
    $('#ac-rec-title').text(langJson['l-main-user-account'] + ' | Epro Marvel');
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

function previewPhoto(input) {
    var photoFile = input.files[0];
    if (input.files && photoFile) {
        var notOK = false;

        // verify file type
        if (photoFile.type != 'image/jpeg' && photoFile.type != 'image/gif' && photoFile.type != 'image/png') {
            alert(langJson['l-alert-not-valid-image']);
            notOK = true;
        }

        // verify file size
        var limitedSizeMB = sessionStorage.getItem('scrmPhotoSize') ? sessionStorage.getItem('scrmPhotoSize') : 2; // default limit 2MB
        if (photoFile.size / 1024 / 1024 > limitedSizeMB) {
            alert(langJson['l-alert-photo-size-cannot-exceed'] + limitedSizeMB + 'MB');
            notOK = true;
        }

        if (notOK) {

            // clear file
            var fileInput = $("#p-file-to-upload")
            fileInput.replaceWith(fileInput.val('').clone(true));

            // reset picture to original
            var photo = document.getElementById('profile-pic');
            photo.src = photoSrc;
            return;
        }

        // set profile picture
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#profile-pic').attr('src', e.target.result);
        }
        reader.readAsDataURL(photoFile);
        photoRemoved = 'N';
    }
}

function removePhoto() {
    // clear file
    var fileInput = $("#p-file-to-upload")
    fileInput.replaceWith(fileInput.val('').clone(true));
    $("#profile-pic").removeAttr("src").attr("src", "./images/user.png"); // remove photo, then set to default pic

    photoRemoved = "Y";
}

// create->load role radios; edit->load role radios and check the role
function loadRoles(checkedRole) {
    $.ajax({
        type: "POST",
        url: mvcUrl + '/api/GetRoles',
        crossDomain: true,
        contentType: "application/json",
        data: JSON.stringify({ RoleStatus: "Active", Agent_Id: loginId, Token: token }),
        dataType: 'json'
    }).always(function (res) {
        // retrieve result details and put them in data container
        var roleList = res.details;
        // result != "success" or there is no results
        if (!/^success$/i.test(res.result || "")) {
            console.log('error: ' + roleList || res);
            if (roleList && roleList == 'Not Auth.') {
                window.opener.parent.sessionTimeout();
            }
        //} else {  // 20250410 'If' statement should not be the only statement in 'else' block
        } else if (roleList != undefined) {

                // iterate through roleList to obtain role names
                for (const theRole of roleList) {
                    // assign role name to local variables
                    var roleName = theRole.RoleName;
                    // create radio button and corresponding label
                    var radioAndLabel = $('<div class="form-check form-check-radio">' +
                        '<label class="form-check-label" name="role-label" for="radio-' + roleName + '">' +
                        '<input class="form-check-input" type="radio" name="role" id="radio-' + roleName + '" value="' + roleName + '" >' +
                        roleName +
                        '<span class="circle"><span class="check"></span></span>' +
                        '</label></div>')
                    radioAndLabel.appendTo('#role-div')
                }

                // check the radio box for role
                if (checkedRole != "") {
                    var radioId = 'radio-' + checkedRole;
                    document.getElementById(radioId).checked = true;
                }
            //} // // 20250410 for else if 
        }
    });
}

function uploadPhotoAfterCreateUpdate() {
    // upload photo
    var fileUpload = $("#p-file-to-upload").get(0);
    var fileUploadFiles = fileUpload.files;
    if (fileUploadFiles.length > 0) {
        var fileData = new FormData();
        fileData.append("Photo_File", fileUploadFiles[0]);
        fileData.append('To_Change_Id', theAgentId);
        fileData.append('Agent_Id', loginId);
        fileData.append('Token', token);
        $.ajax({
            url: mvcUrl + '/api/UploadPhoto',
            type: "POST",
            contentType: false, // Not to set any content header  
            processData: false, // Not to process data  
            data: fileData,
            dataType: 'multipart/form-data',
        }).always(function (r) {
            // status 200 , response is still fail by form data request
            var response = JSON.parse(r.responseText);
            if (!/^success$/i.test(response.result || "")) {
                console.log("Error in UploadAttachment." + response.details || '');
            } else {
                // refresh search contact table and close pop-up
                window.close();
                window.opener.location.reload(true);
            }
        });
    } else {
        window.close();
        window.opener.location.reload(true);
    }
}

// create user
function createUser(sellerId, theAgentId, agentName, email, password, role, accountStatus) {
    var dataObj = {
        SellerID: sellerId,
        AgentID: theAgentId,
        AgentName: agentName,
        Email: email,
        Role: role,
        Account_status: accountStatus,
        Agent_Id: loginId,
        Token: token
    };
    if (!isLdap) {
        dataObj['Password'] = password;
    }
    $.ajax({
        type: "POST",
        url: mvcUrl + '/api/CreateUser',
        // data: JSON.stringify(changedField),
        data: JSON.stringify(dataObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        if (!/^success$/i.test(res.result || "")) {
            console.log("error:" + res);
        //} else {  // 20250410 'If' statement should not be the only statement in 'else' block
            // ========================== Upload Photo (if needed) ==========================
        } else if (photoChanged) {
                // upload photo
                uploadPhotoAfterCreateUpdate();
        } else {
                window.close();
                window.opener.location.reload(true);
           // } // 20250410 for else if
        }
    });
}

// update user
function updateUser(inputObj, password, counter) {
    // normal no LDAP
    if (!isLdap) {
        // password no ned to updat everytime
        if (password.length > 0) {
            inputObj['Password'] = password;
        }
        inputObj['Counter'] = counter;
    }

    $.ajax({
        type: "PUT",
        url: mvcUrl + '/api/UpdateUser',
        data: JSON.stringify(inputObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        if (!/^success$/i.test(res.result || "")) {
            console.log("error /n" + res ? res : '');
        //} else {  // 20250410 'If' statement should not be the only statement in 'else' block
            // ========================== Upload Photo (if needed) ==========================
        } else if (photoChanged) { 
                uploadPhotoAfterCreateUpdate();
        } else {
                window.close();
                window.opener.location.reload(true);
           // } // 20250410 for else if 
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
        if (isTaken) {
            $('#agent-id-error').text('This agent id is taken.');
            $('#agent-id-error').css('color', 'red');
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

    if (queryObj == null) {
        // for create user
        $("#p-header").text(langJson['l-account-create-an-account']); // set header text
        loadRoles(""); // load radio boxes
        $('#status-toggle').prop('checked', true);
    } else {
        // for update user
        $("#p-header").text(langJson['l-account-update-an-account']); // set header text

        // disable the textbox initially
        $('#txt-password').prop('disabled', true);
        $('#txt-confirm-password').prop('disabled', true);

        // obtain photo content and photo type
        photoContent = queryObj.Photo;
        photoType = queryObj.Photo_Type;
        var photo = document.getElementById('profile-pic');
        if (photoContent != null) {
            var photoSrcString = "data:" + photoType + ";base64," + photoContent;
            photo.src = photoSrcString;
            photoSrc = photoSrcString; //if upload a wrong photo, need this to resotore to the original
        }

        // obtain other field values
        colId = queryObj.ColId;
        var sellerId = queryObj.SellerID;
        originalSellerId = queryObj.SellerID;
        userAgentId = queryObj.AgentID;
        originalAgentId = queryObj.AgentID;
        var agentName = queryObj.AgentName;
        var email = queryObj.Email;
        var role = queryObj.RoleName;
        var accountStatus = queryObj.Account_status;

        // set the field values
        $('#txt-agent-id').val(userAgentId);
        $('#txt-name').val(agentName);
        $('#txt-email').val(email);
        $('#txt-seller-id').val(sellerId);
        loadRoles(role); // load role radios with one checked

        // set toggle
        if (accountStatus == "Active") {
            $('#status-toggle').prop('checked', true);
            $('#account-status-label').text(langJson['l-account-active']);
        } else {
            $('#status-toggle').prop('checked', false);
            $('#account-status-label').text(langJson['l-account-inactive']);
        }

        // create checkbox
        var changePwCheckbox = $('<label class="form-check-label all" for="change-password">' +
            '<input class="form-check-input" type="checkbox" id="change-password" value="Change Password">Change Password' +
            '<span class="form-check-sign"><span class="check"></span></span></label>');
        changePwCheckbox.appendTo('#change-password-container');

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
                $('#password-error').text('');
                $('#confirm-password-error').text('');
            }
        });

        if (!isLdap) {
            var counter = queryObj.Counter;
            // create counter field and counter value labels
            var counterFieldLabel = $('<label />', {
                class: 'form-label mr-1',
                text: langJson['l-account-counter'] + ':'
            });
            var counterValueLabel = $('<label />', {
                id: 'counter-label',
                class: 'form-label',
                text: counter
            });

            // create reset button
            var resetBtn = $('<button />', {
                class: 'to-be-disabled btn rounded btn-sm btn-info mt-3 text-capitalize',
                placeholder: langJson['l-ac-reset-unlock'],
                text: langJson['l-ac-reset']
            });

            counterFieldLabel.appendTo('#counter-div'); // append "Counter: "
            counterValueLabel.appendTo('#counter-div'); // append value

            if (counter >= 3) {
                $('<br>').appendTo('#counter-div');
                resetBtn.appendTo('#counter-div'); // make the reset button appear
            }

            // set the reset button on click action
            resetBtn.click(function () {
                fieldChanged = true;
                counter = 0;
                $('#counter-label').text(counter); // set the new counter to text
            });
        }
    }
}

var validateAgentId = function () {
    var agentIdVal = $('#txt-agent-id').val() || '';

    var numRegex = /^\d*$/; // var numRegex = /^[0-9]*$/;       //20250408 Remove duplicates in this character class.

    var isNumeric = numRegex.test(agentIdVal);

    if (agentIdVal.length == 0) {
        $('#agent-id-error').text('This field is required.'); // for blank fields
        $('#agent-id-error').css('color', 'red');
    } else if (!isNumeric) {
        $('#agent-id-error').text('Agent ID should be a number.'); // for non-numeric values
        $('#agent-id-error').css('color', 'red');
    } else if (parseInt(agentIdVal) == originalAgentId) {
        $('#agent-id-error').text('This is the original agent id');
        $('#agent-id-error').css('color', 'green');
    } else {
        checkDuplicates(parseInt(agentIdVal));
    }
}

var validateSellerId = function () {
    var sellerIdInput = $('#txt-seller-id').val();
    if (sellerIdInput.length == 0) {
        $('#seller-id-error').text('This field is required.'); // for blank fields
        $('#seller-id-error').css('color', 'red');
    } else if (sellerIdInput == originalSellerId) {
        $('#seller-id-error').text('This is the original seller id');
        $('#seller-id-error').css('color', 'green');
    } else {
        checkSellerDuplicates(sellerIdInput);
    }
}

var validateEmail = function () {
    var emailInput = $('#txt-email').val();
    if (emailInput.length == 0) {
        $('#email-error').text('This field is required.'); // for blank fields
    } else if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(emailInput)) {
        $('#email-error').text('The email is invalid.'); // for wrong email format
    } else {
        $('#email-error').text('');
    }
}
//check agent id duplicate
$('#txt-agent-id').change(function () {
    fieldChanged = true;
    validateAgentId();
})

// check seller id duplicate
$('#txt-seller-id').change(function () {
    fieldChanged = true;
    validateSellerId();
})

// verify email
$('#txt-email').change(function () {
    fieldChanged = true;
    validateEmail();
})

// when photo is chosen, call this function
$(".verify-photo").change(function () {
    photoChanged = true;
});

// when toggle changes, label text changes
$('#status-toggle').change(function () {
    if ($(this).prop("checked")) {
        $('#status-toggle').prop('checked', true);
        $('#account-status-label').text(langJson['l-account-active']);
    } else {
        $('#status-toggle').prop('checked', false);
        $('#account-status-label').text(langJson['l-account-inactive']);
    }
});

// when field has changed, call this function
$(".form-group").change(function () {
    fieldChanged = true;
});

// cancel is clicked
function clearForm() {
    // close window
    window.close();
}

function validateForm(theAgentId, sellerId, agentName, email, password, confirmPassword, role) {
    var hasError = false;

    // validate agent id
    validateAgentId();
    // if color is red, got warning
    if ($('#agent-id-error').css('color') == 'rgb(255, 0, 0)') {
        $('#txt-agent-id').focus();
        hasError = true;
    }

    // validate seller id
    validateSellerId();
    if ($('#seller-id-error').css('color') == 'rgb(255, 0, 0)') {
        $('#txt-seller-id').focus();
        hasError = true;
    }

    // validate agent name
    if (agentName.length == 0) {
        $('#agent-name-error').text('This field is required.'); // for blank fields
        hasError = true;
    } else {
        $('#agent-name-error').text('');
    }

    // validate email
    validateEmail();
    if ($('#email-error').text().length != 0) {
        $('#txt-email').focus();
        hasError = true;
    }

    var isChecked = $('#change-password').prop('checked');

    // only not Ldap need to check password
    // validate password (only if the checkbox "Change Password" is clicked)
    // when create new user, no change-password checkbox
    if (!isLdap && (isChecked == undefined || isChecked)) {
        //validatePW();
        // validate new password
        var patt = /^(?=.*[A-Za-z])(?=.*\d)[a-zA-Z0-9!@#$%^&*()~¥=_+}{":;'?/>.<,`\-\|\[\]]{8,50}$/
        if (password.length == 0) {
            $('#password-error').text('This field is required.'); // for blank fields
            hasError = true;
        } else if (!patt.test(password)) {
            $('#password-error').text('Password must be between 8 to 50 characters which contains at least one numeric digit and one letter.'); // for blank fields
            hasError = true;
        } else {
            $('#password-error').text('');
        }
        // validate confirm password
        if (confirmPassword.length == 0) {
            $('#confirm-password-error').text('This field is required.'); // for blank fields
            hasError = true;
        } else if (confirmPassword != password) {
            // validate matching password
            $('#confirm-password-error').text('Password does not match the confirm password.');
            hasError = true;
        } else {
            $('#confirm-password-error').text('');
        }
    }

    //========================================== validate checked radios ======================
    if (!role) {
        $('#role-error').text('This field is required.'); // for no checked radio
        hasError = true;
    } else {
        $('#role-error').text('');
    }

    $('#validation-result').text(hasError);
}

function changePassword() {
    return false;
}

// Submit is clicked
function submitForm() {

    if (fieldChanged === false && photoChanged === false && photoRemoved == 'N') {
        window.close();
        return;
    }

    var agent_id = 0; // agent id in int format
    userAgentId = $('#txt-agent-id').val(); // obtain agent id in string format 
    var sellerId = $('#txt-seller-id').val(); // obtain seller id in string format  
    var agentName = $('#txt-name').val();
    var email = $('#txt-email').val();
    var password = $('#txt-password').val();
    var confirmPassword = $('#txt-confirm-password').val();
    var role = $('input[name=role]:checked').val();
    var counter = isLdap ? null : parseInt($('#counter-label').text());
    var accountStatus = $('#status-toggle').prop("checked") ? 'Active' : 'Inactive';

    validateForm(userAgentId, sellerId, agentName, email, password, confirmPassword, role);

    var formHasError = $('#validation-result').text();
    console.log('submit has error? ', formHasError);

    if (formHasError == 'true') {
        return; // do not submit form
    } else {

        agent_id = parseInt(userAgentId);

        if (fieldChanged || photoRemoved == 'N') {
            if (colId == null) { // 
                // create user & upload photo
                createUser(sellerId, agent_id, agentName, email, password, role, accountStatus);
            } else {
                // update user
                updateUser({
                    ColId: colId,
                    SellerID: sellerId,
                    AgentID: agent_id,
                    AgentName: agentName,
                    Email: email,
                    Role: role,
                    Account_status: accountStatus,
                    Photo_Removed: photoRemoved,
                    Agent_Id: loginId,
                    Token: token
                }, password, counter);
            }
        } else {
            // photo changed only
            uploadPhotoAfterCreateUpdate();
        }
    }
}

$(document).ready(function () {
    if (window.opener.parent.addPopupIdle) {
        window.opener.parent.addPopupIdle($(document));
    }
    if (!isLdap) {
        $('#pw-container').removeClass('d-none');
    }
});
document.addEventListener('contextmenu', event => event.preventDefault());