var mvcHost = config.mvcHost;
var fieldChanged = false;
var photoChanged = false;
var photoSrc = '../images/user.png';
var campaign = '';
var selectedCustomerId = -1;
var changedField = {};
var caseTable = null;
var isEdit = getParameterByName('edit') || false;
var nationalityArr = sessionStorage.getItem('scrmNationalityArr') ? JSON.parse(sessionStorage.getItem('scrmNationalityArr')) : [];
var marketArr = sessionStorage.getItem('scrmMarketArr') ? JSON.parse(sessionStorage.getItem('scrmMarketArr')) : [];
var profileArr = sessionStorage.getItem('scrmProfileArr') ? JSON.parse(sessionStorage.getItem('scrmProfileArr')) : [];
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var loginId = window.opener.loginId;
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
    $('.l-cs-all').text(langJson['l-cs-all']);
    $('.l-cs-inbound-outbound').text(langJson['l-cs-inbound-outbound']);
    $('.l-general-upload').text(langJson['l-general-upload']);
    $('.l-form-save').text(langJson['l-form-save']);
    $('.l-form-customer-information').text(langJson['l-form-customer-information']);
    $('.l-cs-customer-journey').text(langJson['l-cs-customer-journey']);
    $('.l-general-cancel').text(langJson['l-general-cancel']);
}
function previewPhoto(input) {
    var photoFile = input.files[0];
    if (input.files && photoFile) {

        // verify file type
        var fileInput, photo;
        if (photoFile.type != 'image/jpeg' && photoFile.type != 'image/gif' && photoFile.type != 'image/png') {
            alert(langJson['l-alert-not-valid-image']);

            // clear file
            fileInput = $("#p-file-to-upload")
            fileInput.replaceWith(fileInput.val('').clone(true));

            // reset picture to original
            photo = document.getElementById('p-profile-pic');
            photo.src = photoSrc;
            return;
        }

        // verify file size
        var limitedSizeMB = sessionStorage.getItem('scrmPhotoSize') ? sessionStorage.getItem('scrmPhotoSize') : 2;// default limit 2MB
        if (photoFile.size / 1024 / 1024 > limitedSizeMB) {
            alert(langJson['l-alert-photo-size-cannot-exceed'] + limitedSizeMB + 'MB');

            // clear file
            fileInput = $("#p-file-to-upload");
            fileInput.replaceWith(fileInput.val('').clone(true));

            // reset picture to original
            photo = document.getElementById('p-profile-pic');
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
    //} else {      20250410    'If' statement should not be the only statement in 'else' block
    } else if (nationalityId == 1) {
            marketSelect.val(marketId).attr('disabled', false);
            profileSelect.val(profileId).attr('disabled', false);
    } else {
            marketSelect.val(marketId).attr('disabled', true);
            profileSelect.val(profileId).attr('disabled', true);
        //}//   20250410 for else if
    }

}
function addAreaOptions() {
    for (let nationOpt of nationalityArr) {
        $('#edit-Nationality_Id').append('<option value=' + nationOpt.NationalityID + ' market-id=' + nationOpt.MarketID + ' profile-id=' + nationOpt.ProfileID + ' >' + nationOpt.NationalityName + '</option>');
    }

    for (let marketOpt of marketArr) {
        $('#edit-Market_Id').append('<option value=' + marketOpt.MarketID + '>' + marketOpt.MarketName + '</option>');
    }

    for (let profileOpt of profileArr) {
        $('#edit-Profile_Id').append('<option value=' + profileOpt.ID + '>' + profileOpt.Profile + '</option>');
    }
}
function format(d) {
    // `d` is the original data object for the row
    return '<span class="details-control-title">' + langJson['l-search-full-details'] + ':</span>' + d.Case_Details;
}
var csPopupOnload = function () {
    setLanguage();
    $('#cs-popup-title').text(langJson['l-form-customer-information'] + ' | Epro Marvel')
    var windowOpener = window.opener;
    selectedCustomerId = windowOpener.selectedCustomerId || windowOpener.customerId;
    campaign = windowOpener.campaign;
    if (isEdit == 'true') {
        selectedCustomerId = windowOpener.selectedCustomerId;
        campaign = windowOpener.campaign;
        var searchObj = {
            "anyAll": "all", "searchArr": [{
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

        // update full name
        document.getElementById('pTitle').innerHTML = openWinDoc.getElementById('Title').value || '';
        document.getElementById('pName_Eng').innerHTML = openWinDoc.getElementById('Name_Eng').value || '';
        document.getElementById('pLang').innerHTML = openWinDoc.getElementById('Lang').value || '';
        if (openWinDoc.getElementById('Agree_To_Disclose_Info').checked) {
            $('#Agree_To_Disclose_Info').prop('checked', true);
        }
        $('#Agree_To_Disclose_Info').prop('disabled', true);
        for (let theField of selectArr) {
            var e = openWinDoc.getElementById(theField);

            // if no selection, e.selectedIndex is -1
            if (e.selectedIndex && e.selectedIndex > -1) {
                document.getElementById('p' + theField).innerHTML = e.options[e.selectedIndex].text || '';
            }
        }

        // get most updated text
        for (let text of textArr) {
            document.getElementById('p' + text).innerHTML = openWinDoc.getElementById(text).value || '';
        }

        // update profile picture
        document.getElementById('p-profile-pic').src = openWinDoc.getElementById('profile-pic').src;
    }

    // ============= LOAD CUSTOMER JOURNEY =============
    $('#cs-journey').append(
        '<div id="cs-journey-container">' +
        '<table id="cs-journey-tbl" class="table table-hover display" style="width:100%" data-page-length="10">' +
        '</table>' +
        '</div>'
    );
    $.ajax({
        url: mvcHost + '/mvc' + campaign + '/api/GetCustomerJourney',
        type: "POST",
        data: JSON.stringify({ "Customer_Id": selectedCustomerId, Agent_Id: loginId, Token: token }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json',
        success: function (r) {
            var details = r.details;
            if (!/^success$/i.test(r.result || "")) {
                console.log("Error in updateClicked." + details ? details : (r || ''));
            } else {
                var caseDetails = r.details;
                var newCaseDetails = [];
                for (let theRec of caseDetails) {
                    var callType = theRec.Call_Type || '';
                    var replyType = theRec.Reply_Type || '';
                    var isManual = true;
                    if (callType.indexOf('Inbound') > -1) {
                        var inObj = { InOut: 'I' };
                        isManual = false;
                        inObj.Type = callType.replace('Inbound_', '');
                        inObj.Time = theRec.Inbound_Time;
                        inObj.Details = theRec.Type_Details;
                        inObj.Case_No = theRec.Case_No;
                        inObj.Case_Details = theRec.Details;
                        newCaseDetails.push(inObj);
                    }
                    if (replyType.indexOf('Outbound') > -1) {
                        isManual = false;
                        var outObj = { InOut: 'O' };
                        outObj.Type = replyType.replace('Outbound_', '');
                        outObj.Time = theRec.Reply_Time;
                        outObj.Details = theRec.Reply_Details;
                        outObj.Case_No = theRec.Case_No;
                        outObj.Case_Details = theRec.Details;
                        newCaseDetails.push(outObj);
                    } else if (replyType.indexOf('Marketing') > -1) {
                        isManual = false;
                        var maktObj = { InOut: 'O', Details: '[Marketing]', Case_No: '[Marketing]', Case_Details: '[Marketing]' };
                        maktObj.Type = replyType.replace('Marketing ', '');
                        // the updated_time could be null, then could not replace, so need to or empty string
                        maktObj.Time = (theRec.Updated_Time || '').replace('T', ' ').replace(/\.\d+/, "");
                        newCaseDetails.push(maktObj);
                    }
                    if (isManual) {
                        var updatedTime = theRec.Updated_Time;
                        // updated time may have T and .xxx
                        if (updatedTime && updatedTime.length > 0) {
                            var indexOfDot = updatedTime.indexOf('.');
                            if (updatedTime.indexOf('.') > -1) {
                                updatedTime = updatedTime.slice(0, indexOfDot);
                            }
                        }
                        var manualObj = { InOut: '', Type: '', Time: updatedTime.replace('T', ' '), Details: '', Case_No: theRec.Case_No, Case_Details: theRec.Details }
                        newCaseDetails.push(manualObj);
                    }
                }
                console.log('newCaseDetails');
                console.log(newCaseDetails);
                caseTable = $('#cs-journey-tbl').DataTable({
                    data: newCaseDetails,
                    lengthChange: true, // not showing 'Show ? per page' dropdown
                    "language": {
                        "emptyTable": langJson['l-general-empty-table'],
                        "info": langJson['l-general-info'],
                        "infoEmpty": langJson['l-general-info-empty'],
                        "infoFiltered": '(' + langJson['l-cs-all'] + ': _MAX_)', // not All: here
                        "lengthMenu": langJson['l-general-length-menu'],
                        "search": langJson['l-general-search-colon'],
                        "zeroRecords": langJson['l-general-zero-records'],
                        "paginate": {
                            "previous": langJson['l-general-previous'],
                            "next": langJson['l-general-next']
                        }
                    },
                    lengthMenu: [10, 20, 50],
                    aaSorting: [[0, 'desc']],
                    columnDefs: [
                        {
                            targets: 0,
                            render: function (data, type, row) {
                                if (data) {
                                    return data.replace('T', ' ');
                                } else {
                                    return ''
                                }
                            }
                        },
                        {
                            targets: 1,
                            render: function (data, type, row) {
                                if (data == 'I') {
                                    return '<span class="cj-type-span">' + row.Type + '</span><i title="In" class="fas fa-arrow-alt-circle-right text-success"></i>';
                                } else if (data == 'O') {
                                    return '<span class="cj-type-span">' + row.Type + '</span><i title="Out" class="fas fa-arrow-alt-circle-left text-danger"></i>';
                                } else {
                                    return ''
                                }
                            }
                        }
                    ],
                    columns: [
                        { title: langJson["l-search-date-time"], data: "Time" },
                        { title: langJson["l-form-type"], data: "InOut" },
                        { title: langJson["l-form-details"], data: "Details", className: 'multile-lines-cell' },
                        { title: langJson["l-search-case-no"], data: "Case_No" },
                        { title: langJson["l-form-case-details"], data: "Case_Details" },
                        {
                            "className": 'details-control',
                            "orderable": false,
                            "data": null,
                            "defaultContent": ''
                        }
                    ]
                });

                // Add event listener for opening and closing details
                $('#cs-journey-tbl tbody').on('click', 'td.details-control', function () {
                    var tr = $(this).closest('tr');
                    var row = caseTable.row(tr);

                    if (row.child.isShown()) {
                        // This row is already open - close it
                        row.child.hide();
                        tr.removeClass('shown');
                    }
                    else {
                        // Open this row
                        row.child(format(row.data())).show();
                        tr.addClass('shown');
                    }
                });

                $('#cs-journey-tbl tbody').on('click', 'tr', function () {
                    caseTable.$('tr.highlight').removeClass('highlight');  // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                    $(this).addClass('highlight')
                });

                // by default filter it to be without manual update
                noCommunicationChanged(document.getElementById('cs-journey-no-manual-input'));
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function confirmClicked() {
    var counter = 0;
    if (fieldChanged) { counter = 1; }
    if (photoChanged) { counter += 1; }

    // if no any change, just close the window
    if (counter == 0) { window.close(); }
    if (changedField.Email) {
        var email = changedField.Email;
        if (email.length > 0 && !gf.verifyIsEmailValid(email)) {
            alert('Email is invalid');
            $('#Email').focus();
            return;
        }
    }

    if (changedField.Title) {
        var title = changedField.Title;
        changedField.Gender = title.length > 0? (title == 'Mr'? 'Male' : 'Female'): '';
    }

    // ========================== 1/2 Update Customer (if needed) ==========================
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
                        window.close();
                    }
                }
            });
        }
    }
}

function noCommunicationChanged(oThis) {
    var checked = $(oThis).prop('checked');
    console.log('caseTable'); console.log(caseTable);
    if (checked) {
        $.fn.dataTable.ext.search.push(
            function (settings, data, dataIndex, row, counter) {
                //if (row.Type.length == 0) {   // 20250319 Replace this if-then-else flow by a single return statement.
                //    return false;
                //}
                //return true;
                return row.Type.length !== 0;
            }
        );
        caseTable.draw();
    } else {
        $.fn.dataTable.ext.search.pop();
        caseTable.draw();
    }
}

$(document).ready(function () {
    // if boostrap js is not loaded yet, the script below will help
    $('a.nav-link').on('click', function (e) {
        $('.tab-pane').removeClass('in active');
        $('.nav-link').removeClass('active show');
        $(this).addClass('active show');
        var href = $(this).attr('href');
        $(href).addClass('in active');
    });
    if (window.opener.parent.parent && window.opener.parent.parent.addPopupIdle) {
        window.opener.parent.parent.addPopupIdle($(document));
    }
});
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());