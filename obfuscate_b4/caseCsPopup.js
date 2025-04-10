var mvcHost = config.mvcHost;
var fieldChanged = false;
var photoChanged = false;
var photoSrc = '../images/user.png';
var campaign = '';
var selectedCustomerId = -1;
var changedField = {};
var isEdit = getParameterByName('edit') || false;
var nationalityArr = sessionStorage.getItem('scrmNationalityArr') ? JSON.parse(sessionStorage.getItem('scrmNationalityArr')) : [];
var marketArr = sessionStorage.getItem('scrmMarketArr') ? JSON.parse(sessionStorage.getItem('scrmMarketArr')) : [];
var profileArr = sessionStorage.getItem('scrmProfileArr') ? JSON.parse(sessionStorage.getItem('scrmProfileArr')) : [];
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var loginId = window.opener.loginId || -1;
var token = window.opener.token;
// When selected photo for profile photo
function setLanguage() {
    $('.l-form-customer-information').text(langJson['l-form-customer-information']);
    $('.l-form-title').text(langJson['l-form-title']);
    $('.l-form-full-name').text(langJson['l-form-full-name']);
    $('.l-form-language').text(langJson['l-form-language']);
    $('.l-form-nationality').text(langJson['l-form-nationality']);
    $('.l-form-market').text(langJson['l-form-market']);
    $('.l-form-profile').text(langJson['l-form-profile']);
    $('.l-form-mobile').text(langJson['l-form-mobile']);
    $('.l-form-other').text(langJson['l-form-other']);
    $('.l-form-fax').text(langJson['l-form-fax']);
    $('.l-form-email').text(langJson['l-form-email']);
    $('.l-form-address').text(langJson['l-form-address']);
    $('.l-form-agree-to-disclose-information').get(0).nextSibling.data = langJson['l-form-agree-to-disclose-information'];
    $('.l-general-upload').text(langJson['l-general-upload']);
    $('.l-form-save').text(langJson['l-form-save']);
    $('.l-general-cancel').text(langJson['l-general-cancel']);
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
        var limitedSizeMB = sessionStorage.getItem('scrmPhotoSize') ? sessionStorage.getItem('scrmPhotoSize') : 2;// default limit 2MB
        if (photoFile.size / 1024 / 1024 > limitedSizeMB) {
            alert(langJson['l-alert-photo-size-cannot-exceed'] + limitedSizeMB + 'MB');
            notOK = true;
        }

        if (notOK) {

            // clear file
            var fileInput = $("#p-file-to-upload");
            fileInput.replaceWith(fileInput.val('').clone(true));

            // reset picture to original
            var photo = document.getElementById('p-profile-pic');
            photo.src = photoSrc;
            return;
        }

        // set profile picture
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#p-profile-pic').attr('src', e.target.result);
        }
        reader.readAsDataURL(photoFile);
    }
}
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
// function titleSelectChange(oThis) {
//     console.log('oThis'); console.log(oThis);
//     var title = $(oThis).val();
//     if (title == 'Mr') {
//         document.getElementById('pGender').innerHTML = 'Male';
//     } else {
//         document.getElementById('pGender').innerHTML = 'Female';
//     }
// }
function nationalityChanged(oThis) {
    var nationalitySelect = $(oThis);
    var nationalityId = nationalitySelect.val();
    console.log('nationalityId'); console.log(nationalityId);
    var option = $('option:selected', oThis);
    var marketId = option.attr('market-id');
    var profileId = option.attr('profile-id');
    console.log('marketId'); console.log(marketId);
    console.log('profileId'); console.log(profileId);
    var marketSelect = $('#edit-Market_Id')
    var profileSelect = $('#edit-Profile_Id');
    if (nationalityId == '') {
        marketSelect.val('').attr('disabled', false);
        profileSelect.val('').attr('disabled', false);
    //} else {      // 20250410 'If' statement should not be the only statement in 'else' block
    } else if (nationalityId == 1) {
            marketSelect.val(marketId).attr('disabled', false);
            profileSelect.val(profileId).attr('disabled', false);
    } else {
            marketSelect.val(marketId).attr('disabled', true);
            profileSelect.val(profileId).attr('disabled', true);
        //}// 20250410 for else if 
    }

}
function addAreaOptions() {
    for (let nationOpt of nationalityArr) {
        $('#edit-Nationality_Id').append('<option value=' + nationOpt.NationalityID + ' market-id=' + nationOpt.MarketID + ' profile-id=' + nationOpt.ProfileID + ' >' + nationOpt.NationalityName + '</option>');
    }

    for (let marketOpt of marketArr) {
        $('#edit-Market_Id').append('<option value=' + theOmarketOptption.MarketID + '>' + marketOpt.MarketName + '</option>');
    }

    for (let profileOpt of profileArr) {
        $('#edit-Profile_Id').append('<option value=' + profileOpt.ID + '>' + profileOpt.Profile + '</option>');
    }
}
var csPopupOnload = function () {
    setLanguage();
    $('head').append('<title>' + langJson['l-form-customer-information'] + '</title>');

    if (isEdit == 'true') {
        var windowOpener = window.opener;
        selectedCustomerId = windowOpener.selectedCustomerId;
        campaign = windowOpener.campaign;
        var searchObj = {
            "anyAll": "all",
            "searchArr": [{
                "field_name": "Customer_Id",
                "logic_operator": "is",
                "value": selectedCustomerId,
                "field_type": "number"
            }],
            "Is_Valid": "Y",
            Agent_Id: loginId,
            Token: token
        }
        if (nationalityArr.length == 0) {
            var language = sessionStorage.getItem('scrmLanguage').toLowerCase() || '';
            $.ajax({
                type: "POST",
                url: mvcHost + '/mvc' + campaign + '/api/GetNationalityMarketProfile',
                crossDomain: true,
                contentType: "application/json",
                data: JSON.stringify({ Lang: language, Agent_Id: loginId, Token: token }),
                dataType: 'json'
            }).always(function (r) {
                var rDetails = r.details || '';
                if (!/^success$/i.test(r.result || "")) {
                    console.log('error: ' + rDetails ? rDetails : r);
                } else {
                    nationalityArr = rDetails.NationalityArray;
                    marketArr = rDetails.MarketArray;
                    profileArr = rDetails.ProfileArray;
                    sessionStorage.setItem('scrmNationalityArr', JSON.stringify(nationalityArr));
                    sessionStorage.setItem('scrmMarketArr', JSON.stringify(marketArr));
                    sessionStorage.setItem('scrmProfileArr', JSON.stringify(profileArr));
                    addAreaOptions();
                }
            });
        } else {
            addAreaOptions();
        }
        $.ajax({
            type: "POST",
            url: mvcHost + '/mvc' + campaign + '/api/ManualSearch',
            data: JSON.stringify(searchObj),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (res) {
            if (!/^success$/i.test(res.result || "")) {
                console.log("error /n" + res ? res : '');
            } else {
                var selectedContact = res.details[0];
                var contactArr = ['Title', 'Name_Eng', 'Lang', 'Email', 'Mobile_No', 'Other_Phone_No', 'Fax_No', 'Address1', 'Nationality_Id', 'Market_Id', 'Profile_Id'];
                
                $('.data-field-span').hide();
                $('.edit-field').show();
                
                for (let contact of contactArr) {
                    document.getElementById('edit-' + contact).value = selectedContact[contact];
                }
                if (selectedContact['Agree_To_Disclose_Info'] == 'Y') {
                    $('#Agree_To_Disclose_Info').prop('checked', true);
                }
            }
        });

        //Get Photo
        $.ajax({
            url: mvcHost + '/mvc' + campaign + '/api/GetPhoto',
            type: "POST",
            data: JSON.stringify({ "Customer_Id": selectedCustomerId, Agent_Id: loginId, Token: token }),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json',
            success: function (res) {
                var details = res.details;
                if (!/^success$/i.test(res.result || "")) {
                    console.log("Error in updateClicked." + details ? details : '');
                } else {
                    var photo = document.getElementById('p-profile-pic');
                    var photoSrcString = "data:" + details.Photo_Type + ";base64," + details.Photo_Content;
                    photo.src = photoSrcString;
                    photoSrc = photoSrcString; //if uploaded a wrong photo need this to resotore to the original
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
        $(".verify-field").change(function () {
            fieldChanged = true;
            var fieldName = $(this).attr('name');
            var fieldValue = $(this).val();
            changedField[fieldName] = fieldValue;
            if (fieldName == 'Nationality_Id') {
                changedField['Market_Id'] = $('#edit-Market_Id').val();
                changedField['Profile_Id'] = $('#edit-Profile_Id').val();
            }
            // if (fieldName == 'Title') {
            //     if (fieldValue == 'Mr') {
            //         changedField['Gender'] = 'Male';
            //     } else {
            //         changedField['Gender'] = 'Female';
            //     }
            // }
        });
        $(".verify-photo").change(function () {
            photoChanged = true;
        });
    } else {
        // ============= READ ONLY LOAD =============
        $('.edit-field').hide();
        var textArr = ['Mobile_No', 'Other_Phone_No', 'Fax_No', 'Email', 'Address1'];
        var selectArr = ['Nationality_Id', 'Market_Id', 'Profile_Id'];
        var openWinDoc = window.opener.document;
        var customerData = window.opener.parent.customerData;
        // update full name
        // document.getElementById('pGender').innerHTML = openWinDoc.getElementById('Gender').innerHTML || '';
        document.getElementById('pTitle').innerHTML = openWinDoc.getElementById('Title').value || '';
        document.getElementById('pName_Eng').innerHTML = openWinDoc.getElementById('Name_Eng').value || '';
        document.getElementById('pLang').innerHTML = openWinDoc.getElementById('Lang').value || '';

        if (openWinDoc.getElementById('Agree_To_Disclose_Info').checked) {
            $('#Agree_To_Disclose_Info').prop('checked', true);
        }
        $('#Agree_To_Disclose_Info').prop('disabled', true);
        for (let theField of selectArr) {
            var e = openWinDoc.getElementById(theField);
            document.getElementById('p' + theField).innerHTML = e.options[e.selectedIndex].text;
        }

        // get most updated text
        for (let text of textArr) {
            document.getElementById('p' + textArr[i]).innerHTML = openWinDoc.getElementById(text).value || '';
        }

        // update profile picture
        document.getElementById('p-profile-pic').src = openWinDoc.getElementById('profile-pic').src;
    }
}
function confirmClicked() {
    if (event) {
        event.preventDefault();
    }
    var counter = 0;
    if (fieldChanged) { counter = 1; }
    if (photoChanged) { counter += 1; }
    // if no any change, just close the window
    if (counter == 0) { window.close(); }

    // ========================== 1/2 Update Customer (if needed) ==========================
    if (changedField.Email) {
        var email = changedField.Email;
        if (email.length > 0 && !gf.verifyIsEmailValid(email)) {
            alert('Email is invalid');
            $('#Email').focus();
            return;
        }
    }
    if (fieldChanged) {
        $.ajax({
            type: "PUT",
            url: mvcHost + '/mvc' + campaign + '/api/UpdateCustomer',
            data: JSON.stringify({ Customer_Id: selectedCustomerId, Agent_Id: loginId, Customer_Data: changedField, Token: token }),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (res) {
            var details = res.details;
            if (!/^success$/i.test(res.result || "")) {
                console.log("Error in updateClicked." + details ? details : '');
            } else {
                console.log('counter before minus'); console.log(counter);
                counter = counter - 1;
                console.log('counter'); console.log(counter);
                if (counter == 0) {
                    // refresh search contact table and close pop-up
                    window.opener.submitClicked('customer', true);
                    window.close();
                }
            }
        });
    }
    // ========================== 1/2 Upload Photo (if needed) ==========================
    if (photoChanged) {
        // upload photo
        var fileUpload = $("#p-file-to-upload").get(0);
        var fileUploadFiles = fileUpload.files;
        if (fileUploadFiles.length > 0) {
            var fileData = new FormData();
            fileData.append("Photo_File", fileUploadFiles[0]);
            fileData.append('Customer_Id', selectedCustomerId);
            fileData.append('Agent_Id', loginId);
            fileData.append('Token', token);
            $.ajax({
                url: mvcHost + '/mvc' + campaign + '/api/UploadPhoto',
                type: "POST",
                contentType: false, // Not to set any content header  
                processData: false, // Not to process data  
                data: fileData,
                dataType: 'multipart/form-data',
            }).always(function (r) {
                // status 200 , response is still fail by form data request
                var response = JSON.parse(r.responseText);
                if (!/^success$/i.test(response.result || "")) {
                    var details = response.details;
                    console.log("Error in UploadAttachment." + details ? details : '');
                } else {
                    counter = counter - 1;
                    console.log('counter'); console.log(counter);
                    if (counter == 0) {
                        // refresh search contact table and close pop-up
                        // window.opener.submitClicked('customer', true);
                        window.close();
                    }
                }
            });
        }
    }
}
$(document).ready(function () {
    if (window.opener.parent.parent && window.opener.parent.parent.addPopupIdle) {
        window.opener.parent.parent.addPopupIdle($(document));
    }
});
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());