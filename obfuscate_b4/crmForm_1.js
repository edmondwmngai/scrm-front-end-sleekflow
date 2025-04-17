var customerData = null;
var disableMode = false;
var caseRecordPopup = null;
var customerOnly = false;
var openType = window.frameElement.getAttribute("openType") || ''; // "menu" or "traditional" or "social"


//var isSocial = window.frameElement.getAttribute("openType") == "social" ? true : false;   //20250320 Unnecessary use of boolean literals in conditional expression.
var isSocial = window.frameElement.getAttribute("openType") == "social";
var customerId = -1;
var internalCaseNo = window.frameElement.getAttribute("internalCaseNo") || -1;
var caseNo = window.frameElement.getAttribute("caseNo") || -1;
var outstandingAttachment = 0;
var agentList = parent.parent.agentList || [];
var campaign = window.frameElement.getAttribute("campaign") || parent.frameElement.getAttribute("campaign") || parent.campaign || '';
var ivrInfo = parent.frameElement.getAttribute("ivrInfo");
var caseLogLength = 5;
var photoSrc = '../../images/user.png';
var replyConfirmed = false; // If true, reply is confirmed and the area is disabled, cannot be changed
var isManualUpdate = false;
var callType = isSocial ? window.frameElement.getAttribute("callType") : parent.window.frameElement.getAttribute("callType") || ''; // When manual update open input form channel is ''
var details = isSocial ? (window.frameElement.getAttribute("details") || '') : (parent.window.frameElement.getAttribute("details") || '');
var connId = isSocial ? -1 : parent.window.frameElement.getAttribute("connId") || null;
var ticketId = isSocial ? window.frameElement.getAttribute("connId") : null;
// When manual update open input form connId is null
var updateCaseObj = {}; // Object used to send to UpdateCase api
if (ticketId) {
    updateCaseObj.Ticket_Id = ticketId;
}
var tabType = parent.tabType || 'campaign';
var selectedCaseLog = {}; // Needed for caseRecordPopup
var emailFileList = [];
var faxFileList = [];
var outsider = false;
var nationalityArr = sessionStorage.getItem('scrmNationalityArr') ? JSON.parse(sessionStorage.getItem('scrmNationalityArr')) : [];
var marketArr = sessionStorage.getItem('scrmMarketArr') ? JSON.parse(sessionStorage.getItem('scrmMarketArr')) : [];
var profileArr = sessionStorage.getItem('scrmProfileArr') ? JSON.parse(sessionStorage.getItem('scrmProfileArr')) : [];
var updatedCustomerData = {};
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var wiseHost = config.wiseHost;
var categories = sessionStorage.getItem('scrmCategories') || '';
//var haveSystemTools = categories.indexOf('System-Tools') != -1 ? true : false;    //20250320 Unnecessary use of boolean literals in conditional expression.
var haveSystemTools = categories.indexOf('System-Tools') != -1;
if (connId != null) {
    connId = Number(connId)
}

var loginId = sessionStorage.getItem('scrmAgentId') || -1;
var token = sessionStorage.getItem('scrmToken') || '';
var agentName = sessionStorage.getItem('scrmAgentName') || '';

function nationalityChanged(oThis) {
    var nationalitySelect = $(oThis);
    var nationalityId = nationalitySelect.val();
    var option = $('option:selected', oThis);
    var marketId = option.attr('market-id');
    var profileId = option.attr('profile-id');
    var marketSelect = $('#Market_Id')
    var profileSelect = $('#Profile_Id');
    if (nationalityId == '') {
        marketSelect.val('').attr('disabled', false);
        profileSelect.val('').attr('disabled', false);
    //} else {      //20250410 'If' statement should not be the only statement in 'else' block
    } else if (nationalityId == 1) {
            marketSelect.val(marketId).attr('disabled', false);
            profileSelect.val(profileId).attr('disabled', false);
    } else {
            marketSelect.val(marketId).attr('disabled', true);
            profileSelect.val(profileId).attr('disabled', true);
       // } // 20250410 for else if 
    }

}

function getAgentName(theAgentId) {
    var agentObj = gf.altFind(agentList, function (obj) {
        return obj.AgentID == theAgentId;
    });
    if (agentObj != undefined) {
        return agentObj.AgentName;
    } else {
        return theAgentId;
    }
}

function resize(initial) {
    var body = document.body,
        html = document.documentElement;
    var newHeight = Math.ceil(Math.max(body.scrollHeight, body.offsetHeight,
        html.offsetHeight)) || 500;
    if (initial) {
        newHeight += 3;
    } else {
        newHeight += 1;
    }
    var frameId = window.frameElement.getAttribute('id');
    var inputFrame = frameId != undefined ? parent.document.getElementById(frameId) : parent.document.getElementById("input-form-" + connId)
    inputFrame.height = newHeight + 'px';
    if (parent.resize) {
        parent.resize();
    }
}

function setLanguage() {
    $('.l-form-address').text(langJson['l-form-address']);
    $('.l-form-agree-to-disclose-information').get(0).nextSibling.data = langJson['l-form-agree-to-disclose-information'];
    $('.l-form-are-you-sure').text(langJson['l-form-are-you-sure']);
    $('.l-form-call').get(0).nextSibling.data = langJson['l-form-call'];
    $('.l-form-customer-information').text(langJson['l-form-customer-information']);
    $('.l-form-case-details').text(langJson['l-form-case-details']);
    $('.l-form-confirm').text(langJson['l-form-confirm']);
    $('.l-form-customer-id').text(langJson['l-form-customer-id']);
    $('.l-form-dial').text(langJson['l-form-dial']);
    $('.l-form-edit').text(langJson['l-form-edit']);
    $('.l-form-email').text(langJson['l-form-email']);
    $('.l-form-escalated-to').text(langJson['l-form-escalated-to']);
    $('.l-form-fax').text(langJson['l-form-fax']);
    $('.l-form-full-name').text(langJson['l-form-full-name']);
    $('.l-form-handled-by').text(langJson['l-form-handled-by']);
    $('.l-form-language').text(langJson['l-form-language']);
    $('.l-form-market').text(langJson['l-form-market']);
    $('.l-form-scheduled-reminder').text(langJson['l-form-scheduled-reminder']);
    $('.l-form-title').text(langJson['l-form-title']);
    $('.l-form-mobile').text(langJson['l-form-mobile']);
    $('.l-form-nationality').text(langJson['l-form-nationality']);
    $('.l-form-none').get(0).nextSibling.data = langJson['l-form-none'];
    $('.l-form-other').text(langJson['l-form-other']);
    $('.l-form-profile').text(langJson['l-form-profile']);

    var radioOtherArr = $('.l-form-radio-other');
    for (let radioOther of radioOtherArr) {
        radioOther.nextSibling.data = langJson['l-form-radio-other'];
    }

    $('.l-form-reason-for-long-call').text(langJson['l-form-reason-for-long-call']);
    $('.l-form-remarks').text(langJson['l-form-remarks']);
    $('.l-form-save').text(langJson['l-form-save']);
    $('.l-general-previous-page').attr('title', langJson['l-general-previous-page']);
    $('.l-general-upload').attr('title', langJson['l-general-upload']);
}

function callUploadAttachment(fileData, uniqueId, loadingId, downloadId, lastAttachment, uploadType) { // "emailFile", "faxFile"
    $.ajax({
        type: "POST",
        url: wiseHost + '/wisepbx/api/Outbound/UploadAttachment',
        data: fileData,
        contentType: false, // Not to set any content header  
        processData: false, // Not to process data  
        dataType: 'multipart/form-data'
    }).always(function (r) {
        var response = JSON.parse(r.responseText)
        if (!/^success$/i.test(response.result || "")) {
            var details = response.details;
            console.log("Error in UploadAttachment." + details ? details : '');
            alert('Failed to upload file');
            $('#' + loadingId).remove();
            // delete the attachment container
            $('#' + uniqueId).remove();
        } else {
            var responseData = response.data[0];
            var theFile = $('#' + downloadId);
            // Remove loading logo
            $('#' + loadingId).remove();
            // Add "X" delete logo
            var deleteId = "delete-" + uniqueId;
            $('#' + uniqueId).append('<span id=' + deleteId + ' style="margin-left:5px;">X</span>');

            $('#' + deleteId).click(function (e) {
                if (uploadType == 'emailFile') {
                    for (var j = 0; j < emailFileList.length; j++) {
                        if (emailFileList[j].FileName == responseData.FileName) {
                            emailFileList.splice(j, 1);
                            break;
                        }
                    }
                } else if (uploadType == 'faxFile') {
                    for (var j = 0; j < faxFileList.length; j++) {
                        if (faxFileList[j].FileName == responseData.FileName) {
                            faxFileList.splice(j, 1);
                            break;
                        }
                    }
                }
                $('#' + uniqueId).remove();
            });

            // Add download link and its style
            theFile.attr("style", "text-decoration: underline;cursor:pointer;color:blue");
            if (uploadType == 'emailFile') {
                emailFileList.push(responseData);
            } else if (uploadType == 'faxFile') {
                faxFileList.push(responseData);
            }
            theFile.attr("href", responseData.FileUrl);
            theFile.attr("target", "_blank");
        }
        if (lastAttachment) {
            // Clear attachment
            var fileInput = $("#upload-" + uploadType)
            fileInput.replaceWith(fileInput.val('').clone(true));
        }
        outstandingAttachment = outstandingAttachment - 1;
    });
}
// When selected file for attachment
function uploadAttachment(input, uploadType) { // "emailFile", "faxFile"
    var limitedSizeMB = 20; // default limit 20MB
    var inputFiles = input.files;
    var inputFilesLength = inputFiles.length;
    outstandingAttachment = inputFilesLength;
    for (var i = 0; i < inputFilesLength; i++) {
        var attachment = inputFiles[i];
        // Verify file type: tested fax can send out without file or with 1 or more Microsoft word, excel, ppt or txt or pdf file
        if (uploadType == "faxFile" && attachment.type != 'application/msword' && attachment.type != 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && attachment.type != 'application/pdf' && attachment.type != 'text/plain' && attachment.type != 'application/vnd.ms-powerpoint' && attachment.type != 'application/vnd.openxmlformats-officedocument.presentationml.presentation' && attachment.type != 'application/vnd.ms-excel' && attachment.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            alert(langJson['l-alert-fax-file-not-valid']);
            continue; // Breaks one iteration in the loop
        }
        // verify file size
        if (attachment.size / 1024 / 1024 > limitedSizeMB) {
            alert(langJson['l-alert-fax-file-not-valid'] + attachment.name + langJson['l-alert-exceed'] + limitedSizeMB + 'MB');
            continue; // Breaks one iteration in the loop
        }
        var attachmentName = attachment.name;
        // Make a unique id
        var uniqueId = attachmentName.replace(/[^a-zA-Z]+/g, '');
        uniqueId += new Date().getUTCMilliseconds();
        var loadingId = 'loading-' + uniqueId;
        var downloadId = 'download-' + uniqueId;
        $("#" + uploadType + "-attachment").append('<span class="email-attach-tag" id="' + uniqueId + '"><a id="' + downloadId + '" href="javascript:none;">' + attachmentName + '</a></span>');
        $("#" + uniqueId).append('<span id="' + loadingId + '"><div id="circularG"><div id="circularG_1" class="circularG"></div><div id="circularG_2" class="circularG"></div><div id="circularG_3" class="circularG"></div>' +
            '<div id="circularG_4" class="circularG"></div><div id="circularG_5" class="circularG"></div><div id="circularG_6" class="circularG"></div><div id="circularG_7" class="circularG"></div><div id="circularG_8" class="circularG"></div></div><span>');
        var fileData = new FormData();
        fileData.append("files", attachment);
        fileData.append('agentId', loginId);
        fileData.append('caseNo', internalCaseNo); // For Create New Case no case no yet, so provide internal case no
        callUploadAttachment(fileData, uniqueId, loadingId, downloadId, (i == inputFilesLength - 1), uploadType);
        resize();
    }
}
// When selected photo for profile photo
function previewPhoto(input) {
    var photoFile = input.files[0];
    if (input.files && photoFile) {
        // Verify file type
        if (photoFile.type != 'image/jpeg' && photoFile.type != 'image/gif' && photoFile.type != 'image/png') {
            alert(langJson['l-alert-fax-file-not-valid']);
            // Clear file
            var fileInput = $("#file-to-upload")
            fileInput.replaceWith(fileInput.val('').clone(true));
            // Reset picture to original
            var photo = document.getElementById('profile-pic');
            photo.src = photoSrc;
            return;
        }
        // verify file size
        var limitedSizeMB = sessionStorage.getItem('scrmPhotoSize') ? sessionStorage.getItem('scrmPhotoSize') : 2; // default limit 2MB
        if (photoFile.size / 1024 / 1024 > limitedSizeMB) {
            alert(langJson['l-alert-photo-size-cannot-exceed'] + limitedSizeMB + 'MB');
            // Clear file
            var fileInput = $("#file-to-upload");
            fileInput.replaceWith(fileInput.val('').clone(true));
            // Reset picture to original
            var photo = document.getElementById('profile-pic');
            photo.src = photoSrc;
            return;
        }
        // set profile picture
        var reader = new FileReader();
        reader.onload = function (e) {
            // upload photo
          //var fileUpload = $("#file-to-upload").get(0);       20250416 Remove the declaration of the unused 'fileUpload' & 'fileUploadFiles' variable.
          //var fileUploadFiles = fileUpload.files;
            var fileData = new FormData();
            fileData.append("Photo_File", photoFile);
            fileData.append('Customer_Id', customerId);
            fileData.append('Agent_Id', loginId);
            fileData.append('Token', token);
            $.ajax({
                url: mvcHost + '/mvc' + campaign + '/api/UploadPhoto',
                type: "POST",
                contentType: false, // Not to set any content header  
                processData: false, // Not to process data  
                data: fileData,
                dataType: 'multipart/form-data'
            }).always(function (r) {
                var response = JSON.parse(r.responseText);
                if (!/^success$/i.test(response.result || "")) {
                    console.log(r);
                } else {
                    // Change input form icon
                    $('#profile-pic').attr('src', e.target.result);
                }
            });
        }
        reader.readAsDataURL(photoFile);
    }
}

function restorePage() {
    // Restore veriable
    replyConfirmed = false; // Reply is not confirmed or dialed out
    window.onbeforeunload = undefined;
    updateCaseObj = {};
    updateCaseObj.Conn_Id = -1; // AddCustomerCase have to input a int Conn_Id, so cannot be null
    $("#reply-none").prop("checked", true).trigger("click");
    $(".reply-wa-container").remove();
    $('#reply-submit-btn').hide();
    $('#call-result-container').remove();
    dialNoClicked();
    $('#case-details').val('');
    $("#email-other-input").val('').prop('disabled', true);
    $("#fax-other-input").val('').prop('disabled', true);
    $("#sms-other-input").val('').prop('disabled', true);
    $("#call-other-input").val('').prop('disabled', true);
    $('.l-form-radio-other').prop("checked", false); // Reply's other uncheck
    $('input.reply-checkbox:checked').prop('checked', false);
    if (isSocial) {
        // this scrollTop is for demo only
        parent.document.documentElement.scrollTop = 735;
    } else {
        parent.document.documentElement.scrollTop = 0;
    }
}

function countPattern(str) {
    var re = /[{]/g
    return (((str || '').match(re) || []).length) / 2
}

function saveClicked() {
    if (loginId == -1) {
        alert('Storage lost, please login again, the case will not be saved');
        return;
    }
    var sendObj = {};
    var callReason = '';
    var replyDetails = '';
    // == Verify == 
    var callStatus = document.getElementById('call-status').value || '';
    if (callStatus.length == 0) {
        alert('Call Status is a mandatory field');
        return;
    } else {
        sendObj.Call_Status = callStatus;
    }

    if (callStatus == 'Successful Order') {
        sendObj.Call_Reason = document.getElementById('successful-reason').value || '';
    } else if (callStatus == 'Reached') {
        callReason = document.getElementById('reached-reason').value || '';
        if (callReason.length > 0) {
            sendObj.Call_Reason = callReason;
        } else {
            alert('Call Reason is a mandatory field');
            return;
        }
    } else if (callStatus == 'Unreach') {
        callReason = document.getElementById('unreach-reason').value || '';
        if (callReason.length > 0) {
            sendObj.Call_Reason = callReason;
        } else {
            alert('Call Reason is a mandatory field');
            return;
        }
    }

    // Reply 

    var replyList = document.querySelector('input[name="replyList"]:checked');
    var replyChannel = replyList ? replyList.value : '';
    var replyDetailsArr = $('.' + replyChannel + '-list:checked');
    for (let theReplyDetails of replyDetailsArr) {
        var detailsValue = theReplyDetails.value;
        if (detailsValue != 'other') {
            if (replyDetails.length == 0) {
                replyDetails = detailsValue;
            } else {
                replyDetails += (',' + detailsValue);
            }
        //} else {  // 20250410 'If' statement should not be the only statement in 'else' block
        } else if (replyDetails.length == 0) {
                replyDetails = $('#' + replyChannel + '-other-input')[0].value;
        } else {
                replyDetails += (',' + $('#' + replyChannel + '-other-input')[0].value);
            //}//   20250410 for else if
        }
    }

    if (replyChannel != '') {
        if (replyDetails.length == 0) {
            alert(langJson['l-alert-reply-details-empty']);
            return;
        }
        // Verify clicked confirm or dial yes or not
        if (replyConfirmed === false) {
            if (replyChannel != 'call') {
                alert(langJson['l-alert-reply-not-confirmed']);
                return;
            } else {
                alert(langJson['l-alert-not-clicked-dial']);
                return;
            }
        }
    }

    // All fields have to be written to overwrite previous field
    sendObj.Call_Lead_Id = customerData.Call_Lead_Id;
    sendObj.Agent_Id = Number(loginId);
    sendObj.Conn_Id = null;
    sendObj.Reply_Conn_Id = updateCaseObj.Reply_Conn_Id;

    if (sendObj.Call_Reason == undefined) {
        sendObj.Call_Reason = '';
    }

    sendObj.Remark = document.getElementById('call-remarks').value || '';

    // if no call sendObj.Reply_Conn_Id is undefined

    sendObj.Reply_Conn_Id = sendObj.Reply_Conn_Id ?? '';           // sendObj.Reply_Conn_Id == sendObj.Reply_Conn_Id || '';  //  20250321 use ?? to check undefined value

    sendObj.Reply_Details = replyDetails;
    var callbackDateTime = $('#callback-datetime').val() || '';
    sendObj.Callback_Time = callbackDateTime.length > 0 ? callbackDateTime : null;
    sendObj.Token = token;
    $.ajax({
        type: "PUT",
        url: mvcHost + '/mvc' + campaign + '/api/UpdateOutboundCallList',
        data: JSON.stringify(sendObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        var rDetails = r.details;
        if (!/^success$/i.test(r.result || "")) {
            if (rDetails == '字串未被辨認為有效的 DateTime。') {
                rDetails = 'Date Time Format is invalid';
            }
            alert('Saved failed, ' + rDetails);
            console.log('error: ' + rDetails);
        } else {
            parent.formUpdated();
            console.log(r);
        }
    });
}

// For customer service pop-up
var profilePicClick = function () {
    var openWindows = parent.parent.openWindows || parent.parent.parent.openWindows; // parent.parent.parent.openWindows opened from search customer
    var csPopup = window.open('csPopup.html?edit=false', '', 'toolbar=0,location=0,top=50, left=50,menubar=0,resizable=0,scrollbars=1,width=1050,height=584');
    openWindows[openWindows.length] = csPopup;
    csPopup.onload = function () {
        csPopup.onbeforeunload = function () {
            for (var i = 0; i < openWindows.length; i++) {
                if (openWindows[i] == csPopup) {
                    openWindows.splice(i, 1);
                    break;
                }
            }
        }
    }
}
var scheduleClick = function () {
    var openWindows = parent.parent.openWindows;
    var reminderPopup = window.open('../../reminderPopup.html', '', 'toolbar=0,location=0,top=50, left=50,menubar=0,resizable=0,scrollbars=1,width=660,height=458');
    openWindows[openWindows.length] = reminderPopup;
    reminderPopup.onload = function () {
        reminderPopup.onbeforeunload = function () {
            for (var i = 0; i < openWindows.length; i++) {
                if (openWindows[i] == reminderPopup) {
                    openWindows.splice(i, 1);
                    break;
                }
            }
        }
    }
}
var statusChange = function (iThis) {
    var selected = $(iThis).find('option:selected');
    var selectedValue = selected[0].value;
    if (selectedValue == 'Escalated') {
        document.getElementById('case-escalated-container').style.display = 'inherit';
    } else {
        document.getElementById('case-escalated-container').style.display = 'none';
        document.getElementById('case-escalated').value = null;
    }
}

var dialNoClicked = function () {
    var areYouSure = $('#are-you-sure');
    areYouSure.remove();
    $('.dial-yes-disable').prop('disabled', false);
}

var dialYesClicked = function (incompleteCase) {
    var areYouSure = $('#are-you-sure');
    areYouSure.remove();
    replyConfirmed = true;
    // $('<span id="call-result-container" class="mb-3" style="display:inline;"><label>&nbsp;&nbsp;&nbsp;' + langJson['l-form-call-result'] + '&nbsp;&nbsp;&nbsp;</label><select class="form-select" id="call-result-select" value="" style="display:inline;width:130px"><option value="" selected></option><option>Answered</option><option>Busy Call Again</option><option>Busy Tone</option><option>No Answer</option><option>Voicemail</option></select></span>').insertAfter('#reply-submit-btn');
    $('.dial-yes-disable').prop('disabled', true);
    if (!incompleteCase) {
        var callDetails = $('.call-list:checked')[0].value;
        if (callDetails == 'other') {
            callDetails = $('#call-other-input')[0].value;
        }
        updateCaseObj.Reply_Details = callDetails;
        parent.parent.makeCall(campaign, callDetails, tabType);
        updateCaseObj.Reply_Conn_Id = 0;// "-1"; // If the agent rejected to call at the end, Reply_Conn_Id will be -1;
    }
}

function stClicked(oThis, idType) {
    var remarksField = $('#' + idType + '-remarks')
    if (!$(oThis).prop('checked')) {
        remarksField.val('').prop('disabled', true);
    } else {
        remarksField.prop('disabled', false);
    }
}

function delEmailSetting(emailType, addBack) {
    var emailAddress = document.getElementById('Email').value || '';
    var idType = emailType.toLowerCase().replace(' ', '-');
    var remarks = $('#' + idType + '-remarks').val() || '';
    if (addBack) {
        // Update customer if remarks is same no need to continue
        var remarksFieldStr = emailType.replace(' ', '_') + '_Remarks';
        if (updatedCustomerData[remarksFieldStr] == remarks) {
            return;
        }
    }
    if ('isValid')
        $.ajax({
            type: "POST",
            url: wiseHost + '/WisePBX/api/Email/DelSetting',
            data: JSON.stringify({
                projectName: campaign,
                emailAddress: emailAddress,
                emailType: emailType,
                agentId: loginId
            }),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            var rDetails = r.details;
            if (!/^success$/i.test(r.result || "")) {
                console.log('error: ' + rDetails);
            } else {
                var theHeader = parent.document.getElementById(idType + '-header');
                theHeader.setAttribute('data-original-title', '');
                theHeader.style.display = 'none';
            }
            if (addBack) {
                addEmailSetting(emailType, remarks);
            }
        });
}

function addEmailSetting(emailType, passedRemarks) {
    var lastName = document.getElementById('Name_Eng').value || '';
    var title = document.getElementById('Title').value || '';
    var emailAddress = document.getElementById('Email').value || '';
    var idType = emailType.toLowerCase().replace(' ', '-');
    var remarks = passedRemarks || $('#' + idType + '-remarks').val() || '';
    $.ajax({
        type: "POST",
        url: wiseHost + '/WisePBX/api/Email/AddSetting',
        data: JSON.stringify({
            projectName: campaign,
            emailAddress: emailAddress,
            emailType: emailType,
            agentId: loginId,
            fullName: lastName,
            title: title,
            remarks: remarks
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        var rDetails = r.details;
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + rDetails);
        } else {
            var theHeader = parent.document.getElementById(idType + '-header');
            theHeader.style.display = 'inline';
            theHeader.setAttribute('data-original-title', remarks);
        }
    });
}

function updateCallerSetting(callType, isValid) {
    var idType = callType.toLowerCase().replace(' ', '-');
    var theHeader = parent.document.getElementById(idType + '-header');
    var filterId = theHeader.getAttribute('filterId');
    var lastName = document.getElementById('Name_Eng').value || '';
    var title = document.getElementById('Title').value || '';
    var mobile = document.getElementById('Mobile_No').value || '';
    var otherPhone = document.getElementById('Other_Phone_No').value || '';

    var remarks = $('#' + idType + '-remarks').val() || '';
    $.ajax({
        type: "PUT",
        url: mvcHost + '/mvcHKTB/api/UpdateCallFilter',
        data: JSON.stringify({
            "Filter_Id": Number(filterId),
            "Agent_Id": loginId,
            "Filter_Type": callType,
            "Last_Name": lastName,
            "Title": title,
            "Mobile_No": mobile,
            "Other_Phone_No": otherPhone,
            "Remark": remarks,
            "Is_Valid": isValid,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        var rDetails = r.details;
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + rDetails);
        //} else {      //20250410 'If' statement should not be the only statement in 'else' block
        } else if (isValid == 'Y') {
                theHeader.style.display = 'inline';
                theHeader.setAttribute('data-original-title', remarks);
        } else {
                theHeader.style.display = 'none';
                theHeader.setAttribute('data-original-title', '');
            //}//   20250410 for else if
        }
    });
}

function addCallerSetting(addType) {
    var lastName = document.getElementById('Name_Eng').value || '';
    var title = document.getElementById('Title').value || '';
    var mobile = document.getElementById('Mobile_No').value || '';
    var otherPhone = document.getElementById('Other_Phone_No').value || '';
    var idType = addType.toLowerCase().replace(' ', '-');
    var remarks = $('#' + idType + '-remarks').val() || '';
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvcHKTB/api/AddCallFilter',
        data: JSON.stringify({
            "Agent_Id": loginId,
            "Filter_Type": addType,
            "Last_Name": lastName,
            "Title": title,
            "Mobile_No": mobile,
            "Other_Phone_No": otherPhone,
            "Remark": remarks,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        var rDetails = r.details;
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + rDetails);
        } else {
            var theHeader = parent.document.getElementById(idType + '-header');
            var theRemarks = $('#' + idType + '-remarks');
            theHeader.style.display = 'inline';
            theHeader.setAttribute('data-original-title', remarks);
        }
    });
}

function callSaveCallHistory(isSaved) { // if update reply details only, will not update Is_Saved to Y (when made an outbound call)
    var saveCallHistoryObj = {
        "Conn_Id": updateCaseObj.Ticket_Id ? Number(updateCaseObj.Ticket_Id) : (updateCaseObj.Conn_Id ? Number(updateCaseObj.Conn_Id) : Number(updateCaseObj.Reply_Conn_Id)),
        "Internal_Case_No": internalCaseNo != null ? Number(internalCaseNo) : null,
        "Updated_By": loginId,
        Agent_Id: loginId,
        Token: token
    }
    if (updateCaseObj.Reply_Type) {
        saveCallHistoryObj.Reply_Type = updateCaseObj.Reply_Type;
    }
    if (updateCaseObj.Reply_Details) {
        saveCallHistoryObj.Reply_Details = updateCaseObj.Reply_Details;
    }
    if (updateCaseObj.Conference_Conn_Id) {
        saveCallHistoryObj.Conference_Conn_Id = updateCaseObj.Conference_Conn_Id;
    }
    if (updateCaseObj.Reply_Conn_Id && Number(updateCaseObj.Reply_Conn_Id) != 'NaN') {
        saveCallHistoryObj.Reply_Conn_Id = Number(updateCaseObj.Reply_Conn_Id);
    }
    if (isSaved) {
        saveCallHistoryObj.Is_Saved = "Y";

        // this is to avoid outbound use this conn id
        if (saveCallHistoryObj.Conn_Id == sessionStorage.getItem('scrmConnId')){
            sessionStorage.removeItem('scrmConnId');
        }
    }
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/SaveCallHistory',
        data: JSON.stringify(saveCallHistoryObj),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in callSaveCallHistory');
                console.log(r.details);
            //} else {  20250410 'If' statement should not be the only statement in 'else' block
                // Reload page
            } else if (isSaved) {
                    restorePage();
                //}// 20250410 for else if 
            }
        },
        error: function (r) {
            console.log('error in callSaveCallHistory');
            console.log(r);
        },
    });
}

function callUpdateCase() {
    updateCaseObj.Agent_Id = loginId;
    updateCaseObj.Token = token;
    $.ajax({
        type: "PUT",
        url: mvcHost + '/mvc' + campaign + '/api/UpdateCase',
        data: JSON.stringify(updateCaseObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        var details = res.details;
        if (!/^success$/i.test(res.result || "")) {
            alert(details || res || '');
           // return;   // 20250328 Remove this redundant jump.
        } else {
            $('#form-back-btn').hide();
            // Check have become outsider
            if (updateCaseObj.Status == 'Escalated' && updateCaseObj.Escalated_To != loginId) {
                var caseStatusSelect = $('#case-status');
                // Set status follow up
                caseStatusSelect.val('Follow-up Required');
                // Take out Closed and Escalated option
                caseStatusSelect.find('.to-be-removed').remove();
                // hidden escalatedt to
                document.getElementById('case-escalated-container').style.display = 'none';
            }
            caseNo = details.Case_No || -1;
            $('#scheduled-reminder').show();

            var caseLogContainer = $('#case-log-container');
            caseLogContainer.remove();
            if (caseLogContainer.length == 0) {
                loadCaseLog(true);
            } else {
                caseLogContainer.remove();
                loadCaseLog(false);
            }
            // Reply wise handled the media reocrd
            if (connId != null && connId != -1 && (callType == 'Inbound_Email' || callType == 'Inbound_Fax' || callType == 'Inbound_Voicemail')) {
                parent.parent.setMediaHandled(callType, connId, updateCaseObj.Internal_Case_No);
            }
            isManualUpdate = true;
            // ========================== if social media, have meet requirement to close chat ==========================     
            if (isSocial) {
                parent.parent.callSavedCase(ticketId);
            }
            if (openType == 'menu') {
                parent.loadTitleBarData(true);
            }
            // whatsapp not yet connId (big int)
            if (updateCaseObj.Call_Type == 'Inbound_Call' || updateCaseObj.Reply_Type == 'Outbound_Call' || updateCaseObj.Call_Type == 'Inbound_Webchat' || updateCaseObj.Call_Type == 'Inbound_Wechat' || updateCaseObj.Call_Type == 'Inbound_Facebook') {
                callSaveCallHistory(true);
            } else {
                restorePage();
            }
        }
    });
}

function replyCallClick(lastCallType, lastCallId, confConnId) {
    updateCaseObj.Reply_Conn_Id = String(lastCallId);
    updateCaseObj.Conference_Conn_Id = confConnId != null ? Number(confConnId) : null;
    updateCaseObj.Reply_Type = 'Outbound_Call';
    callSaveCallHistory(false);
}

var WAOtherChanged = function (oThis) {
    var valueOfCall = $(oThis).prop('value');
    if (valueOfCall == 'other') {
        $('#wa-other-input').prop('disabled', false);
    } else {
        $('#wa-other-input').prop('disabled', true);
    }
}

function numberOnly(value) {
    return value.replace(/[^\d]/, "");
}

function replyChannelChange(iThis) {
    replyConfirmed = false;
    var channel = $(iThis).attr('value');
    var replyContainer = $('#reply-card'); // $('#reply-card-wa');
    var mediaChannelArr = ['email', 'fax', 'sms', 'call'];
    if (replyContainer) {
        replyContainer.remove();
    }
    if (channel == 'wa') {
        $('.reply-wa-container').remove();

        // hide other channels
        for (let mediaChannel of mediaChannelArr) {
            document.getElementById(mediaChannel + '-details').style.display = 'none';
        }
        $('#reply-submit-btn').hide();
        // Create container
        var mobileNo = $('#Mobile_No').val() || '';
        var mobileNoStr = '';
        if (mobileNo.length > 0) {
            mobileNoStr = '<span id="reply-wa-mobile-container" style="display:inline-block;"><div class="form-check ms-2"><label class="form-check-label"><input type="radio" name="waList" class="form-check-input reply-checkbox wa-list" value="' + mobileNo + '" id="oCallMobile_No" onchange="WAOtherChanged(this)">' + mobileNo + '<span class="circle"><span class="check"></span></span></label></div></span>'
        }
        var waContainerStr = '<span class="reply-wa-container" style="display:inline;">' + mobileNoStr +
            '<span id="wa-other-container" style="display:inline-block;"><div class="form-check ms-2" style="display:inline;"><label class="form-check-label"><input type="radio" class="form-check-input reply-checkbox wa-list" name="waList" value="other" id="call-other-check" onchange="WAOtherChanged(this)">Other<span class="circle"><span class="check"></span></span></label></div>&nbsp;<input type="tel" onkeyup="this.value=numberOnly(this.value)" maxlength="50" disabled="true" id="wa-other-input" style="border-radius:5px;" autocomplete="off"></span>' +
            '<div id="send-wa-section" class="mt-2">' +
            '<label class="form-label mb-0"><span>Template Prop(s):</span><input id="tpl-content" class="rounded ms-3 me-2" autocomplete="off">e.g. 4 July,8pm</label>' +
            '<div class="form-check form-check-radio"><label class="form-check-label" name="tpl-lbl" for="tp-1"><input class="form-check-input" type="radio" name="tp" id="tp-1" value="1">Your appointment is coming up on {{1}} at {{2}}<span class="circle"><span class="check"></span></span></label></div>' +
            '<div class="form-check form-check-radio"><label class="form-check-label" name="tpl-lbl" for="tp-2"><input class="form-check-input" type="radio" name="tp" id="tp-2" value="2">易寶通訊提醒你, 預約日期是{{1}}{{2}}。<span class="circle"><span class="check"></span></span></label></div>' +
            '<div class="form-check form-check-radio"><label class="form-check-label" name="tpl-lbl" for="tp-3"><input class="form-check-input" type="radio" name="tp" id="tp-3" value="3">Epro Notice: Thank you for your application, the application no is {{1}}.<span class="circle"><span class="check"></span></span></label></div>' +
            '<div class="form-check form-check-radio"><label class="form-check-label" name="tpl-lbl" for="tp-4"><input class="form-check-input" type="radio" name="tp" id="tp-4" value="4">易寶：謝謝你的申請, 你的申編號是 {{1}}.<span class="circle"><span class="check"></span></span></label></div>' +
            '</div></span>';
        $('#reply-details').append(waContainerStr);
        replyConfirmed = true;
    } else {
        $('.reply-wa-container').remove();

        // show what details
        for (let currentChannel of mediaChannelArr) {
            if (currentChannel == channel) {
                document.getElementById(currentChannel + '-details').style.display = 'inherit';
            } else { 

                // channel is none;
                document.getElementById(currentChannel + '-details').style.display = 'none';
            }
        }
        // Text of the confirm button of details
        if (channel == 'email' || channel == 'fax' || channel == 'sms') {
            $('#reply-submit-btn').html('<i class="fas fa-clipboard-check me-2"></i><span>' + langJson["l-form-confirm"] + '</span>');
            $('#reply-submit-btn').show();
        } else if (channel == 'call') {
            $('#reply-submit-btn').html('<i class="fas fa-phone me-2"></i><span>' + langJson["l-form-dial"] + '</span>');
            $('#reply-submit-btn').show();
        } else {
            $('#reply-submit-btn').hide();
        }
        // restore veriable
        emailFileList = [];
        faxFileList = [];
    }
    resize();
}

function smsWordCount() {
    var smsContent = $('#sms-content').val() || '';
    var smsContentLen = smsContent.length;
    var haveChineseChar = gf.isDoubleByte(smsContent);
    // wds counts refers to 3HK
    var perMsgCount = 160;
    if (haveChineseChar) {
        perMsgCount = 70;
    }
    // round up
    var totalMsgs = Math.ceil(smsContentLen / perMsgCount);
    var totalMsgNumber = totalMsgs * perMsgCount;
    var smsWordCountStr = smsContentLen + '/' + totalMsgNumber;
    $('#sms-word-count').text(smsWordCountStr);
    $('#sms-msg-count').text(totalMsgs);
}

var replySubmitClicked = function () {
    var replyChannel = document.querySelector('input[name="replyList"]:checked').value;
    var replyDetailsArr = $('.' + replyChannel + '-list:checked');

    // if checked other, chcke anything typed
    for (let theReplyDetails of replyDetailsArr) {
        var detailsValue = theReplyDetails.value;
        if (detailsValue == 'other') {
            var replyDetails = $('#' + replyChannel + '-other-input')[0].value;
            if (replyDetails.length == 0) {
                alert(langJson['l-alert-other-blank']);
                return
            }
        }
    }
    if (replyChannel == 'call') {
        var checkedPhoneList = document.querySelector('input[name="callList"]:checked');
        if (checkedPhoneList == null) {
            alert(langJson['l-alert-number-not-selected']);
            return
        }
        var areYouSure = $('#are-you-sure');
        if (areYouSure.length == 0) {
            $('<span id="are-you-sure">&nbsp;&nbsp;&nbsp;' + langJson['l-form-are-you-sure'] + '?&nbsp;&nbsp;&nbsp;<button class="btn btn-sm btn-warning text-capitalize rounded" onclick="dialYesClicked();"><i class="fas fa-check me-2"></i><span>' + langJson['l-form-yes'] + '</span></button>&nbsp;<button onclick="dialNoClicked();" class="btn btn-sm btn-warning text-capitalize rounded"><i class="fas fa-times me-2"></i><span>' + langJson['l-form-no'] + '</span></button></span>').insertAfter('#reply-submit-btn');
            $('.dial-yes-disable').prop('disabled', true);
        }
    } else if (replyChannel == 'email' || replyChannel == 'fax' || replyChannel == 'sms') {
        // get selected checkbox, if checked none, return
        var checkList = $('.' + replyChannel + '-list:checked').val();
        if (checkList == undefined || checkList.length == 0) {
            // no check box selected return
            alert(langJson['l-alert-no-reply-details']);
            return
        }
        var replyContainer = $('#reply-card');
        if (replyContainer.length > 0) {
            return;
        }
        if (replyChannel == 'email') {
            var preview = parent.$('#media-content').contents() || '';
            var mediaContent = parent.mediaContent;
            var subjectStr = callType == 'Inbound_Email' ? ('"RE: ' + mediaContent.Subject + '"') : "";
            var contentStr = callType == 'Inbound_Email' ?
                '&#13;&#10;&#13;&#10;<br />' +
                '<hr />' +
                '<b>From: </b>' + (preview.find('#name').html() || '') + (preview.find('#from').html() || '') + '&#13;&#10;<br />' +
                '<b>Sent: </b>' + (preview.find('#time').html() || '') + '&#13;&#10;<br />' +
                '<b>To: </b>' + (preview.find('#to').html() || '') + '&#13;&#10;<br />' +
                '<b>Subject: </b>' + (preview.find('#subject').html() || '') + '&#13;&#10;<br />' +
                (preview.find('#content').html() || '') : '';
          //var emailFileStr = "emailFile";             // 20250416 Remove the declaration of the unused 'emailFileStr' variable.
            var emailFileTriggerStr = "$('#upload-emailFile').trigger('click');"
            var emailFileUploadStr = 'uploadAttachment(this,"emailFile");'
            var replyCardStr = '<div id="reply-card" class="my-2 bg-light mb-4 rounded-2 py-5 px-3 py-3"><div class="text-center mb-3 bg-info rounded text-white"><h5 class="mt-0 mb-0">Send Email</h5></div><div class="row d-flex align-items-center">' +

                '<div class="mb-3 col-sm-12 ps-0">' +
                '<label class="col-sm-1 control-label ps-4">From</label>' +
                '<div class="col-sm-11 ps-2">' + companyName + ' (' + companyEmail + ')</div></div>' +

                '<div class="mb-3 col-sm-12 ps-0"><label for="email-cc" class="col-sm-1 control-label ps-4">CC</label>' +
                '<input class="form-control col-sm-6 col-offset-5 ms-2" id="email-cc" type="search" maxlength="100" autocomplete="off">' +

                '<div class="mb-3 col-sm-12 ps-0"><label for="email-subject" class="col-sm-1 control-label ps-4">Subject</label>' +
                '<input class="form-control col-sm-6 col-offset-5 ms-2" id="email-subject" type="search" maxlength="100" autocomplete="off" value=' + subjectStr + '></div></div>' +

                '<div class="mb-3 col-sm-12 ps-0 mt-1"><label for="editor" class="col-sm-1 control-label ps-4">Content<br />&nbsp;&nbsp;(html)</label>' +
                '<div class="col-sm-11 ps-2">' +
                '<div id="editor">' + contentStr + '</div>' +
                '</div></div><div class="mb-3 col-sm-12 ps-0 mt-2"><label for="emailFile-attachment" class="col-sm-1 control-label ps-4">Attachment</label>' +
                '<div id="emailFile-attachment" class="col-sm-11 ps-2">' +
                '<input type="file" id="upload-emailFile" onchange=' + emailFileUploadStr + ' style="display:none" multiple>' +
                '<input type="button" class="btn btn-warning btn-sm text-capitalize" title="Upload Attachment" value="Upload" onclick=' + emailFileTriggerStr + ' /></div></div>' +
                '</div></div>';
            $(replyCardStr).appendTo("#reply-container").ready(function () {
                initEditor();
            });
            CKEDITOR.on('instanceCreated', function (e) {
                e.editor.on('contentDom', function () {
                    var editable = e.editor.editable();
                    editable.attachListener(e.editor.document, 'keydown', function (evt) {
                        if (event.keyCode == 33 || event.keyCode == 34) {
                            e.editor.editable().$.blur();
                        }
                    });
                });
            });
            CKEDITOR.on("instanceReady", function (ev) {
                resize();
            });
        } else if (replyChannel === 'fax') {
            var faxFileTriggerStr = "$('#upload-faxFile').trigger('click');"
            var faxFileUploadStr = 'uploadAttachment(this,"faxFile");'
            $('<div id="reply-card" class="my-2 bg-light mb-4 rounded-2 py-5 px-3 py-3"><div class="text-center mb-3 bg-info rounded text-white"><h5 class="mt-0 mb-0">Send Fax</h5></div><div class="row d-flex align-items-center">' +
                '<div class="mb-3 col-sm-12 ps-3">' +
                '<label class="col-sm-2 control-label ps-5 justify-content-start">Cover Sender</label>' +
                '<div class="col-sm-10 ps-3">' + agentName + '</div></div>' +
                '<div class="mb-3 col-sm-12 ps-3">' +
                '<label class="col-sm-2 control-label ps-5 justify-content-start">Cover Company</label>' +
                '<div class="col-sm-10 ps-3">' + companyName + '</div></div>' +
                '<div class="mb-3 col-sm-12 ps-3">' +
                '<label for="fax-attn" class="col-sm-2 control-label ps-5 justify-content-start">Cover Attention</label>' +
                '<div class="col-sm-10 ps-3"><input id="fax-attn" class="form-control" /></div></div>' +
                '<div class="mb-3 col-sm-12 ps-3">' +
                '<label for="fax-subject" class="col-sm-2 control-label ps-5 justify-content-start">Cover Subject</label>' +
                '<div class="col-sm-10 ps-3"><input id="fax-subject" class="form-control" /></div></div>' +
                '<div class="mb-3 col-sm-12 ps-3"><label for="fax-msg" class="col-sm-2 control-label  ps-5 justify-content-start">Content</label>' +
                '<div class="col-sm-10 ps-3">' +
                '<textarea class="mt-2" id="fax-msg" rows="3" cols="20" style="font-family:inherit;width:100%;" maxlength="500"></textarea></div></div>' +
                '<div class="mb-3 col-sm-12 ps-3">' +
                '<label class="col-sm-2 control-label ps-5 justify-content-start">Fax File<br>(TXT, PDF, DOC, PPT, XLS Format Allowed)</label>' +
                '<div id="faxFile-attachment" class="col-sm-10 ps-3"><input type="file" accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.txt" id="upload-faxFile" onchange=' + faxFileUploadStr + ' style="display:none" multiple>' +
                '<input type="button" class="btn btn-warning btn-sm ms-0 text-capitalize" title="Upload Fax File" value="Upload" style="margin-left:5px;" onclick=' + faxFileTriggerStr + ' /></div></div></div></div>' +
                +'</div>').appendTo('#reply-container');
        } else if (replyChannel === 'sms') {
            $('<div id="reply-card" class="my-2 bg-light mb-4 rounded-2 py-5 px-3 py-3"><div class="text-center mb-3 bg-info rounded text-white"><h5 class="mt-0 mb-0">Send SMS</h5></div>' +
                '<div class="row d-flex align-items-center"><div class="mb-3 col-sm-12 ps-0">' +
                '<label class="col-sm-1 control-label ps-4">&nbsp;&nbsp;&nbsp;From</label>' +
                '<div class="col-sm-11 ps-2">' + companyName + '</div></div>' +
                '<div class="mb-3 col-sm-12 ps-0"><label for="sms-content" class="col-sm-1 control-label ps-4">&nbsp;&nbsp;&nbsp;Content</label>' +
                '<div class="col-sm-11 ps-2">' +
                '<textarea class="mt-3" id="sms-content" rows="3" cols="20" style="font-family:inherit;width:100%;" maxlength="500" onKeyUp="smsWordCount()"></textarea></textarea></div></div>' +
                '<div class="w-100"><span style="float:right;margin-right:30px;"><span id="sms-word-count" class="align-right">0/170</span>&nbsp;&nbsp;<span id="sms-msg-count">1</span>&nbsp;message(s)</span></div>' +
                +'</div></div>').appendTo('#reply-container');
        }
        // Added reply section, so needed to resize
        resize();
        replyConfirmed = true;
    }
    $('textarea').keydown(function (e) {
        if (e.keyCode == 33 || e.keyCode == 34) {
            $(this).blur();
        }
    });
}

var loadCaseLog = function (initial) {

    // PARENT LOAD 'SEARCH RESULTS TABLE'

}

// Call clicked
var replyCallChanged = function (oThis) {
    var valueOfCall = $(oThis).prop('value');
    if (valueOfCall == 'other') {
        $('#call-other-input').prop('disabled', false);
    } else {
        $('#call-other-input').prop('disabled', true);
    }
}
// email, sms, fax other checkbox clicked
function replyOtherClicked(inputId, oThis) {
    if (inputId == 'call-other-input') {
        
    } else {
        var theInput = $('#' + inputId);
        if ($(oThis).prop('checked')) {
            theInput.prop('disabled', false);
        } else {
            theInput.prop('disabled', true);
        }
    }
}
// Load after html ready
function windowOnload() {

    $('#call-status').on('change', function () {
        var selected = $(this).val();

        if (selected == 'Successful Order') {

            $('#successful-reason').removeClass('d-none').addClass('d-block');
            $('#unreach-reason').removeClass('d-block').addClass('d-none');
            $('#reached-reason').removeClass('d-block').addClass('d-none');
            $('#call-status-label').removeClass('d-none').addClass('d-block');

        } else if (selected == 'Unreach') {

            $('#successful-reason').removeClass('d-block').addClass('d-none');
            $('#unreach-reason').removeClass('d-none').addClass('d-block');
            $('#reached-reason').removeClass('d-block').addClass('d-none');
            $('#call-status-label').removeClass('d-none').addClass('d-block');

        } else if (selected == 'Reached') {

            $('#successful-reason').removeClass('d-block').addClass('d-none');
            $('#unreach-reason').removeClass('d-block').addClass('d-none');
            $('#reached-reason').removeClass('d-none').addClass('d-block');
            $('#call-status-label').removeClass('d-none').addClass('d-block');

        } else if (selected == '') {

            $('#call-status-label').removeClass('d-block').addClass('d-none');
            $('#successful-reason').removeClass('d-block').addClass('d-none');
            $('#unreach-reason').removeClass('d-block').addClass('d-none');
            $('#reached-reason').removeClass('d-block').addClass('d-none');
        }

    });

    customerData = parent.customerData || null;
    customerId = customerData.Customer_Id;
    document.getElementById('customer-id-title').innerHTML = customerId;

    $('#callback-datetime').datetimepicker({
        showOn: "button",
        buttonImage: "../../images/calendar-grid-30.svg",
        buttonStyle: 'height:1000px',
        buttonImageOnly: true,
        buttonText: "Select date",
        dateFormat: 'yy-mm-dd',
        timeFormat: "HH:mm",
        changeMonth: true,
        changeYear: true,
        showSecond: false,
        showMillisec: false,
        pickSeconds: false
    });

    $('#call-remarks').keydown(function (e) {
        if (e.keyCode == 33 || e.keyCode == 34) {
            $(this).blur();
        }
    });


    var type = parent.type;
    //isManualUpdate = customerData != undefined && customerData.Case_Is_Valid == 'Y' && customerData.Conn_Id == connId && customerData.Ticket_Id == ticketId ? true : false;  // 20250320 Unnecessary use of boolean literals in conditional expression.
    isManualUpdate = customerData != undefined && customerData.Case_Is_Valid == 'Y' && customerData.Conn_Id == connId && customerData.Ticket_Id == ticketId;
    updateCaseObj.Conn_Id = isManualUpdate ? null : connId;
    
    // 20250320 Unexpected constant truthiness on the left-hand side of a `||` expression.
    // caseLogLength = sessionStorage.getItem('scrmCaseLogLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5 || 5;
    caseLogLength = sessionStorage.getItem('scrmCaseLogLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5;
    
    // Set basic info
    document.getElementById('ip-agent-name').innerHTML = agentName;

    // Set customer info
    var Mobile_No = '';
    var Other_Phone_No = '';
    var Fax_No = '';
    var Email = '';
    var Name_Eng = '';
    var Title = '';
    var Lang = '';
    if (type != 'newCustomer') {
        disableMode = true;
    }
    if (customerData && customerData.disableMode != undefined) {
        disableMode = customerData.disableMode
    }
    if (disableMode) {
        $('.edit-field').prop('disabled', true);
        $('#edit-save-btn').html('<i class="fa fa-edit me-2"></i><span>' + langJson['l-form-edit'] + '</span>');
    }
    if (customerData != undefined) {
        // Get specific data
        Name_Eng = customerData.Name_Eng || '';
        Title = customerData.Title || '';
        Lang = customerData.Lang || '';
        Mobile_No = customerData.Mobile_No || '';
        Other_Phone_No = customerData.Other_Phone_No || '';
        Fax_No = customerData.Fax_No || '';
        Email = customerData.Email || '';
        // Update basic field
        document.getElementById('Title').value = Title;
        document.getElementById('Lang').value = customerData.Lang || '';
        document.getElementById('Name_Eng').value = Name_Eng;
        document.getElementById('Address1').value = customerData.Address1 || '';
        if (customerData.Agree_To_Disclose_Info == 'Y') {
            $('#Agree_To_Disclose_Info').prop('checked', true);
        }
        // Get Photo
        // $.ajax({
        //     url: mvcHost + '/mvc' + campaign + '/api/GetPhoto',
        //     type: "POST",
        //     data: JSON.stringify({
        //         "Customer_Id": customerId,
        //         Agent_Id: loginId,
        //         Token: token
        //     }),
        //     crossDomain: true,
        //     contentType: "application/json",
        //     dataType: 'json',
        //     success: function (res) {
        //         var details = res.details;
        //         if (!/^success$/i.test(res.result || "")) {
        //             console.log("Error in GetPhoto");
        //             console.log(res);
        //         } else {
        //             var photo = document.getElementById('profile-pic');
        //             var photoSrcString = "data:" + details.Photo_Type + ";base64," + details.Photo_Content;
        //             photo.src = photoSrcString;
        //             photoSrc = photoSrcString; // if uploaded a wrong photo need this to resotore to the original
        //         }
        //     },
        //     error: function (err) {
        //         console.log(err);
        //     }
        // });
    }
    var _Mobile_No = document.getElementById('Mobile_No');
    var _Other_Phone_No = document.getElementById('Other_Phone_No');
    var _Fax_No = document.getElementById('Fax_No');
    var _Email = document.getElementById('Email');
    // a tag fields
 /* var tMobile = document.getElementById('tMobile_No')         //20250416  Remove the declaration of the unused 'tMobile' variable.
    var tOther_Phone_No = document.getElementById('tOther_Phone_No');
    var tFax_No = document.getElementById('tFax_No');
    var tEmail = document.getElementById('tEmail'); */
    // Update editable text field
    _Mobile_No.value = Mobile_No;
    _Other_Phone_No.value = Other_Phone_No;
    _Fax_No.value = Fax_No;
    _Email.value = Email;

    var mobileStyle = 'none';
    var otherStyle = 'none';
    var faxStyle = 'none';
    var emailStyle = 'none';
    var newMobile = Mobile_No;
    if (Mobile_No != null && Mobile_No.length > 0) {
        mobileStyle = 'inline-block';
    } else {
        newMobile = ' ';
    }

    $('<span style="display:' + mobileStyle + ';" name="sms" class="cMobile_No" id="reply-sms-mobile-container"><div class="form-check me-2"><label class="form-check-label"><input type="checkbox" class="form-check-input reply-checkbox sms-list dial-yes-disable" value="' + Mobile_No + '" id="oSmsMobile_No">' + newMobile + '<span class="form-check-sign"><span class="check"></span></span></label></div></span>').insertBefore('#sms-other-container');
    $('<span style="display:' + mobileStyle + ';" name="call" class="cMobile_No" id="reply-call-mobile-container"><div class="form-check ms-2"><label class="form-check-label"><input type="radio" name="callList" class="form-check-input reply-checkbox call-list dial-yes-disable" onchange="replyCallChanged(this)" value="' + Mobile_No + '" id="oCallMobile_No">' + newMobile + '<span class="circle"><span class="check"></span></span></label></div></span>').insertBefore('#call-other-container');

    var newOther = Other_Phone_No;
    if (Other_Phone_No != null && Other_Phone_No.length > 0) {
        otherStyle = 'inline-block';
    } else {
        newOther = ' ';
    }
    $('<span style="display:' + otherStyle + ';" name="sms" class="cOther_Phone_No" id="reply-sms-other-container"><div class="form-check"><label class="form-check-label"><input type="checkbox" class="form-check-input reply-checkbox sms-list dial-yes-disable" value="' + Other_Phone_No + '" id="oSmsOther_Phone_No">' + newOther + '<span class="form-check-sign"><span class="check"></span></span></label></div></span>').insertBefore('#sms-other-container');
    $('<span style="display:' + otherStyle + ';" name="call" class="cOther_Phone_No" id="reply-call-other-container"><div class="form-check ms-2"><label class="form-check-label"><input type="radio" name="callList" class="form-check-input reply-checkbox call-list dial-yes-disable" onchange="replyCallChanged(this)" value="' + Other_Phone_No + '" id="oCallOther_Phone_No">' + newOther + '<span class="circle"><span class="check"></span></span></label></div></span>').insertBefore('#call-other-container');
    var newFax = Fax_No;
    if (Fax_No != null && Fax_No.length > 0) {
        faxStyle = 'inline-block';
    } else {
        newFax = ' ';
    }
    $('<span style="display:' + faxStyle + ';" name="fax" class="cFax_No" id="reply-fax-container"><div class="form-check"><label class="form-check-label"><input type="checkbox" class="form-check-input reply-checkbox fax-list dial-yes-disable" value="' + Fax_No + '" id="oFax_No">' + newFax + '<span class="form-check-sign"><span class="check"></span></span></label></div></span>').insertBefore('#fax-other-container');
    var newEmail = Email;
    if (Email != null && Email.length > 0) {
        emailStyle = 'inline-block';
    } else {
        newEmail = ' ';
    }
    $('<span style="display:' + emailStyle + ';" name="email" id="reply-email-container"><div class="form-check"><label class="form-check-label"><input id="oEmail" class="form-check-input reply-checkbox email-list dial-yes-disable" type="checkbox" value="' + Email + '">' + newEmail + '<span class="form-check-sign"><span class="check"></span></span></label></div></span>').insertBefore('#email-other-container');

    $("#reply-call").prop("checked", true).trigger("click");

    // ==================== TYPE: NEW FOLLOW ====================

    // if (type == 'newUpdate') {
    //     // Fill in case details
    //     if (customerData != undefined) {
    //         document.getElementById('case-nature').value = customerData.Call_Nature || '';
    //     }
    //     $("#reply-none").prop("checked", true).trigger("click");
    // } else {
    //     if (type == 'newCustomer') {
    //         if (callType == 'Inbound_Email') {
    //             _Email.value = details;
    //         } else if (callType == 'Inbound_Fax') {
    //             _Fax_No.value = details;
    //         } else if (callType == 'Inbound_Call' || callType == 'Inbound_Voicemail') {
    //             var firstChar = details.charAt(0);
    //             if (firstChar == 5 || firstChar == 6 || firstChar == 7 || firstChar == 8 || firstChar == 9) {
    //                 _Mobile_No.value = details;
    //             } else {
    //                 _Other_Phone_No.value = details;
    //             }
    //         } else if (callType == 'Inbound_Webchat' || callType == 'Inbound_Facebook') {
    //             var detailsArr = details.split(',');
    //             if (details.length > 0) {
    //                 $.ajax({
    //                     type: "POST",
    //                     url: mvcHost + '/mvc' + campaign + '/api/GetFields',
    //                     data: JSON.stringify({
    //                         "listArr": ["Webchat Fields"]
    //                     }),
    //                     crossDomain: true,
    //                     contentType: "application/json",
    //                     dataType: 'json'
    //                 }).always(function(r) {
    //                     var rDetails = r.details;
    //                     if (!/^success$/i.test(r.result || "")) {
    //                         console.log('error: ' + rDetails);
    //                     } else {
    //                         if (rDetails != undefined) {
    //                             var webchatFields = rDetails['Webchat Fields'];
    //                             for (var i = 0; i < detailsArr.length; i++) {
    //                                 var fieldNameValueArr = detailsArr[i].split(':');
    //                                 var fieldName = fieldNameValueArr[0];
    //                                 var fieldValue =fieldNameValueArr[1] || '';
    //                                 console.log('fieldValue'); console.log(fieldValue);
    //                                 if (fieldValue != null && fieldValue.length > 0) {
    //                                     for (var j = 0; j < webchatFields.length; j++) {
    //                                         var theField = webchatFields[j];
    //                                         if (fieldName == theField.Field_Name) {
    //                                             var dbColumnName = theField.Field_Display;
    //                                             if (dbColumnName == 'Name_Eng') {
    //                                                 document.getElementById('Name_Eng').value = fieldValue;
    //                                             } else if (dbColumnName == 'All_Phone_No') {
    //                                                 var firstChar = fieldValue.charAt(0);
    //                                                 if (firstChar == 5 || firstChar == 6 || firstChar == 7 || firstChar == 8 || firstChar == 9) {
    //                                                     _Mobile_No.value = fieldValue;
    //                                                 } else {
    //                                                     _Other_Phone_No.value = fieldValue;
    //                                                 }
    //                                             } else if (dbColumnName == 'Email') {
    //                                                 _Email.value = fieldValue;
    //                                             }
    //                                             break;
    //                                         }
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 });
    //             }
    //         }
    //     }
    // }
    // Load Escalate To dropdown
    // for (var i = 0; i < agentList.length; i++) {
    //     var option = agentList[i];
    //     var theAgentId = option.AgentID;
    //     $("#case-escalated").append('<option LevelID=' + option.LevelID + ' value=' + theAgentId + '>' + option.AgentName + ' (ID: ' + theAgentId + ')</option>');
    // }
    // if (type == 'newUpdate') {
    //     loadCaseLog(true);
    // }
    // // If call from incomplete call cases and reply type is outbound call
    // var incompleteCallDetails = parent.incompleteCallDetails;
    // if (incompleteCallDetails != null) {
    //     var replyDetails = incompleteCallDetails.Reply_Details;
    //     // Set reply channel: call
    //     $("#reply-call").prop("checked", true).trigger("click");
    //     // Set update case obj
    //     updateCaseObj.Reply_Type = 'Outbound_Call';
    //     updateCaseObj.Reply_Conn_Id = String(incompleteCallDetails.Reply_Conn_Id);
    //     updateCaseObj.Reply_Details = replyDetails;
    //     // Set phone number
    //     if (replyDetails == Mobile_No) {
    //         $("#oCallMobile_No").prop("checked", true).trigger("click");
    //     } else if (replyDetails == Other_Phone_No) {
    //         $("#oCallOther_Phone_No").prop("checked", true).trigger("click");
    //     } else {
    //         $("#call-other-check").prop("checked", true).trigger("click");
    //         $("#call-other-input").attr("value", replyDetails);
    //     }
    //     dialYesClicked(true);
    //     parent.incompleteCallDetails = null;
    // } else {
    //     $("#reply-none").prop("checked", true).trigger("click");
    // }

    // var customerOnlyAttr = window.frameElement.getAttribute("customer-only");
    // if (customerOnlyAttr != undefined && customerOnlyAttr == 'true') {
    //     customerOnly = true;
    //     showCustomerSectionOnly();
    // }
    // ================ GET NATIONALITY, MARKET AND PROFILE ================
    if (nationalityArr.length == 0) {
        var language = sessionStorage.getItem('scrmLanguage') ? sessionStorage.getItem('scrmLanguage').toLowerCase() : 'EN';
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
                addAreaOptions(customerData);
            }
        });
    } else {
        addAreaOptions(customerData);
    }

    resize(true);
    if (caseNo != -1) {
        $('#scheduled-reminder').show();
    }
    // Add send WA reply
    // var functions = parent.functions;        //20250416 Remove the declaration of the unused 'functions' variable.
    // var canSendWA = (functions.indexOf('Form-WA-TP') != -1) || false;
    // if(canSendWA){
    //     var waRadioStr = '<div class="form-check ms-3">'+
    //                      '<label class="form-check-label">'+
    //                      '<input class="form-check-input dial-yes-disable" onclick="replyChannelChange(this)"" type="radio" id="reply-sms" name="replyList" value="wa">WhatsApp'+
    //                      '&nbsp;<span class="circle">'+
    //                      '<span class="check"></span></span></label></div>';
    //     $('#reply-radio-group').append(waRadioStr);
    // }
}
// WindowOnload end
function addAreaOptions(customerData) {
    for (let nationOpt of nationalityArr) {
        $('#Nationality_Id').append('<option value=' + nationOpt.NationalityID + ' market-id=' + nationOpt.MarketID + ' profile-id=' + nationOpt.ProfileID + ' >' + nationOpt.NationalityName + '</option>');
    }

    for (let marketOpt of marketArr) {
        $('#Market_Id').append('<option value=' + marketOpt.MarketID + '>' + marketOpt.MarketName + '</option>');
    }

    for (let profileOpt of profileArr) {
        $('#Profile_Id').append('<option value=' + profileOpt.ID + '>' + profileOpt.Profile + '</option>');
    }
    if (customerData != undefined) {
        document.getElementById('Nationality_Id').value = customerData.Nationality_Id || '';
        document.getElementById('Market_Id').value = customerData.Market_Id || '';
        document.getElementById('Profile_Id').value = customerData.Profile_Id || '';
    }
}

function isInteger(num) { //Number.isInteger only work on Chrome, not IE, so have this function
    return (num ^ 0) === num;
}

var editClicked = function (fieldId) {
    var textField = document.getElementById(fieldId);
    var aField = document.getElementById('t' + fieldId); //e.g. tMobile_No
    var editButton = document.getElementById(fieldId + '_edit');
    var updateButton = document.getElementById(fieldId + '_update');
    textField.style.display = 'inline-block';
    updateButton.style.display = 'inline-block';
    aField.style.display = 'none';
    editButton.style.display = 'none';
    resize();
}
function callOnkeydown() { // if pressed Enter, equal pressed Dial button
    if (window.event.keyCode == 13) {
        replySubmitClicked();
    }
}

function updateClicked(isTemp) {
    // VerifyEmail
    var email = document.getElementById('Email').value || ''
    if (email.length > 0 && !gf.verifyIsEmailValid(email)) {
        alert('Email is invalid');
        $('#Email').focus();
        return;
    }
    // Update customer
    var Customer_Data = {
        Title: document.getElementById('Title').value || '',
        Lang: document.getElementById('Lang').value || '',
        Name_Eng: document.getElementById('Name_Eng').value || '',
        Mobile_No: document.getElementById('Mobile_No').value || '',
        Other_Phone_No: document.getElementById('Other_Phone_No').value || '',
        Fax_No: document.getElementById('Fax_No').value || '',
        Email: email,
        Address1: document.getElementById('Address1').value || '',
        Nationality_Id: document.getElementById('Nationality_Id').value == '' ? null : document.getElementById('Nationality_Id').value,
        Market_Id: document.getElementById('Market_Id').value == '' ? null : document.getElementById('Market_Id').value,
        Profile_Id: document.getElementById('Profile_Id').value == '' ? null : document.getElementById('Profile_Id').value,
        Agree_To_Disclose_Info: document.getElementById('Agree_To_Disclose_Info').checked ? 'Y' : 'N'
    };
    if (isTemp) {
        return Customer_Data;
    }
    if (disableMode) {
        disableMode = false;
        $('#edit-save-btn').html('<i class="fa fa-save me-2"></i><span>' + langJson["l-form-save"] + '</span>');
        $('.edit-field').prop('disabled', false);
        return;
    }
    // Verify name cannot which cannot be blank
    if (Customer_Data.Name_Eng.length == 0) {
        alert(langJson['l-alert-no-full-name']);
        return;
    }
    if (callType == 'Inbound_Facebook') {
        Customer_Data.Facebook_Id = window.frameElement.getAttribute("enduserId");
    }
    if (callType == 'Inbound_Wechat') {
        Customer_Data.Wechat_Id = window.frameElement.getAttribute("enduserId");
    }
    if (callType == 'Inbound_Whatsapp') {
        Customer_Data.Whatsapp_Id = window.frameElement.getAttribute("enduserId");
    }
    $.ajax({
        type: "PUT",
        url: mvcHost + '/mvc' + campaign + '/api/UpdateCustomer',
        data: JSON.stringify({
            Customer_Id: Number(customerId),
            Agent_Id: loginId,
            Customer_Data: Customer_Data,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        var details = res.details;
        if (!/^success$/i.test(res.result || "")) {
            console.log("Error in updateClicked." + details ? details : '');
            alert(langJson['l-alert-save-customer-failed']);
        } else {
            // Turn to disable mode
            disableMode = true;
            $('#edit-save-btn').html('<i class="fa fa-edit me-2"></i><span>' + langJson['l-form-edit'] + '</span>');
            $('.edit-field').prop('disabled', true);

            // update reply container
            var replyArr = ['Mobile_No', 'Other_Phone_No', 'Fax_No', 'Email'];
            for (let fieldId of replyArr) {
                var value = Customer_Data[fieldId];
                switch (fieldId) {
                    case 'Mobile_No':
                        var smsMobileNo = $('#oSmsMobile_No');
                        var callMobile = $('#oCallMobile_No');
                        smsMobileNo.val(value);
                        smsMobileNo.get(0).nextSibling.data = value;
                        callMobile.val(value);
                        callMobile.get(0).nextSibling.data = value;
                        if (value.length == 0) {
                            $('#reply-sms-mobile-container').hide();
                            $('#reply-call-mobile-container').hide();
                        } else {
                            $('#reply-sms-mobile-container').css('display', 'inline-block');
                            $('#reply-call-mobile-container').css('display', 'inline-block');
                        }
                        break;
                    case 'Other_Phone_No':
                        var smsOtherNo = $('#oSmsOther_Phone_No');
                        var callOtherNo = $('#oCallOther_Phone_No');
                        smsOtherNo.val(value);
                        smsOtherNo.get(0).nextSibling.data = value;
                        callOtherNo.val(value);
                        callOtherNo.get(0).nextSibling.data = value;
                        if (value.length == 0) {
                            $('#reply-sms-other-container').hide();
                            $('#reply-call-other-container').hide();
                        } else {
                            $('#reply-sms-other-container').css('display', 'inline-block');
                            $('#reply-call-other-container').css('display', 'inline-block');
                        }
                        break;
                    case 'Fax_No':
                        var oFaxNo = $('#oFax_No');
                        oFaxNo.val(value);
                        oFaxNo.get(0).nextSibling.data = value;
                        if (value.length == 0) {
                            $('#reply-fax-container').hide();
                        } else {
                            $('#reply-fax-container').css('display', 'inline-block');
                        }
                        break;
                    case 'Email':
                        var oEmail = $('#oEmail');
                        oEmail.val(value);
                        oEmail.get(0).nextSibling.data = value;
                        if (value.length == 0) {
                            $('#reply-email-container').hide();
                        } else {
                            $('#reply-email-container').css('display', 'inline-block');
                        }
                        break;
                    default:
                        break;
                }
              //var replyChoice = document.getElementById('.' + '_edit');     // 20250416 Remove the declaration of the unused 'replyChoice' variable.
                if (value != null && value.length > 0) {
                    $('.c' + fieldId).show();
                } else {
                    $('.c' + fieldId).hide();
                }
            }
            // Update system tools
            /*  //  20250416 Remove the declaration of the unused variable.
            var repeatedCustomer = document.getElementById('repeated-customer');
            var difficultCustomer = document.getElementById('difficult-customer');
            var repeatedCaller = document.getElementById('repeated-caller');
            var difficultCaller = document.getElementById('difficult-caller');

            var repeatedCustomerHeaderDisplay = $('#repeated-customer-header', window.parent.document).css('display')
            var difficultCustomerHeaderDisplay = $('#difficult-customer-header', window.parent.document).css('display')
            var repeatedCallerrHeaderDisplay = $('#repeated-caller-header', window.parent.document).css('display')
            var difficultCallerHeaderDisplay = $('#difficult-caller-header', window.parent.document).css('display')
            */
        }
    });
}

function selectRadio(ary, value) {
    var temp;
    var i;
    temp = document.getElementsByName(ary);
    for (i = 0; i < temp.length; i++) {
        if (temp[i].value == value) {
            temp[i].checked = true;
            break;
        }
    }
}

function checkRadioSelected(ary) {
    var temp = document.getElementsByName(ary);
    var temp_checked = false;
    for (let theTmp of temp) {
        if (theTmp.checked) {
            temp_checked = true;
            break;
        }
    }
    return temp_checked;
}

function showCustomerSectionOnly() {
    $('#accordion').hide();
    $('#agent-handle-section').hide();
    $('#save-btn-section').hide();
    $('#updateCsSection').hide();
    $('#customer-table').removeClass('mb-5');
    $('#customer-table').addClass('mb-0');
    $('html').css("background", "white");
    $(".card-header").removeAttr("data-toggle");
    resize();
}

$(document).ready(function () {
    setLanguage();
    if (parent.parent.parent.iframeRecheck) {
        parent.parent.parent.iframeRecheck($(parent.document));
    }
    $('textarea').keydown(function (e) {
        if (e.keyCode == 33 || e.keyCode == 34) {
            $(this).blur();
        }
    });
});
// Prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());