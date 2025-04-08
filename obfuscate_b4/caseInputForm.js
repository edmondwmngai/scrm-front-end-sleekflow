var customerData = null;
var disableMode = false;
var customerOnly = false;
var openType = window.frameElement.getAttribute("openType") || ''; // "menu" or "traditional" or "social"
//var isSocial = window.frameElement.getAttribute("openType") == "social" ? true : false;   //20250320 Unnecessary use of boolean literals in conditional expression.
var isSocial = window.frameElement.getAttribute("openType") == "social";
var customerId = window.frameElement.getAttribute("customerId") ? parseInt(window.frameElement.getAttribute("customerId")) : -1;
var internalCaseNo = window.frameElement.getAttribute("internalCaseNo") || -1;
var caseNo = window.frameElement.getAttribute("caseNo") || -1;
console.log('parent.caseNo @ input form');
console.log(parent.caseNo);
console.log('caseNo @ input form');
console.log(caseNo);
var outstandingAttachment = 0;
var agentList = parent.parent.agentList || [];
// var caseNo = parent.caseNo || -1;
console.log('caseNo in inputform begin');
console.log(caseNo);
var campaign = window.frameElement.getAttribute("campaign") || parent.frameElement.getAttribute("campaign") || parent.campaign || '';
var ivrInfo = parent.frameElement.getAttribute("ivrInfo");
var caseLogLength = 5;
var photoSrc = '../../images/user.png';
var caseSaved = false;
var replyConfirmed = false; // if true, reply is confirmed and the area is disabled, cannot be changed
var isManualUpdate = false;
var callType = isSocial ? window.frameElement.getAttribute("callType") : parent.window.frameElement.getAttribute("callType") || ''; // when manual update open input form channel is ''
var details = isSocial ? (window.frameElement.getAttribute("details") || '') : (parent.window.frameElement.getAttribute("details") || '');
var connId = isSocial ? -1 : parent.window.frameElement.getAttribute("connId") || null;
var ticketId = isSocial ? window.frameElement.getAttribute("connId") : null;
    var replyType ='';
// when manual update open input form connId is null
var updateCaseObj = {}; // object used to send to UpdateCase api
if (ticketId) {
    updateCaseObj.Ticket_Id = ticketId;
}
var tabType = parent.tabType || 'traditional-media';
var selectedCaseLog = {};
// window.selectedCaseLog = {};
console.log('callType in input form');
console.log(callType);
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

// check if open from incomplete cases for an outbound call
if (openType == 'menu') {

    // only outbound call now
    var replyConnId = parent.frameElement.getAttribute('replyConnId') || '';
    var replyDetails = parent.frameElement.getAttribute('replyDetails') || '';
    if (replyType.length > 0 && replyConnId.length > 0) {
        updateCaseObj.Reply_Type = 'Outbound_Call';
        updateCaseObj.Reply_Conn_Id = parseInt(replyConnId);
        updateCaseObj.Reply_Details = replyDetails;
    }
}


if (connId != null) {
    connId = Number(connId)
}

var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';
var agentName = sessionStorage.getItem('scrmAgentName') || '';

function changeCaseSavedFalse() {
    caseSaved = false;
}

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
    } else {
        if (nationalityId == 1) {
            marketSelect.val(marketId).attr('disabled', false);
            profileSelect.val(profileId).attr('disabled', false);
        } else {
            marketSelect.val(marketId).attr('disabled', true);
            profileSelect.val(profileId).attr('disabled', true);
        }
    }

}

function getAgentName(theAgentId) {
    var agentObj = gf.altFind(agentList, function (obj) {
        return obj.AgentID == theAgentId
    });
    if (agentObj != undefined) {
        return agentObj.AgentName;
    } else {
        return theAgentId;
    }
}

function resize(initial) {
    console.log('resize in input form run');
    var body = document.body,
        html = document.documentElement;
    var newHeight = Math.ceil(Math.max(body.scrollHeight, body.offsetHeight,
        html.offsetHeight)) || 500;
    if (initial) {
        newHeight += 3;
    } else {
        newHeight += 1;
    }
    console.log('window.frameElement');
    console.log(window.frameElement);
    var frameId = window.frameElement.getAttribute('id');
    var inputFrame = frameId != undefined ? parent.document.getElementById(frameId) : parent.document.getElementById("input-form-" + connId)
    // var inputFrame = isSocial ? parent.document.getElementById("input-form-" + connId) : parent.document.getElementById("input-form");
    console.log('isSocial');
    console.log(isSocial);
    console.log('inputFrame');
    console.log(inputFrame);
    inputFrame.height = newHeight + 'px';
    if (parent.resize) {
        parent.resize();
    }
    // if (parent.scrollInputForm) {
    //     parent.scrollInputForm();
    // }
    // if (this[0].contentWindow) {
    //     alert('scroll @ input form [0]');
    //     this[0].contentWindow.scrollTo(0, 1000000);
    // }
    // alert('run here 10s');
    // var lastBubbleOffset = $('#case-log-table').offset();
    // console.log('lastBubbleOffset'); console.log(lastBubbleOffset);
    // if (lastBubbleOffset != undefined) {
    //     $('body').animate({
    //         scrollTop: lastBubbleOffset.top
    //     }, 1000);
    // }
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
    $('.l-form-details').text(langJson['l-form-details']);
    $('.l-form-dial').text(langJson['l-form-dial']);
    // $('.l-form-is-junk-mail').get(0).nextSibling.data = langJson['l-form-is-junk-mail'];
    // $('.l-form-difficult-caller').get(0).nextSibling.data = langJson['l-form-difficult-caller'];
    // $('.l-form-difficult-sender').get(0).nextSibling.data = langJson['l-form-difficult-sender'];
    // $('.l-form-repeated-caller').get(0).nextSibling.data = langJson['l-form-repeated-caller'];
    // $('.l-form-repeated-sender').get(0).nextSibling.data = langJson['l-form-repeated-sender'];
    $('.l-form-edit').text(langJson['l-form-edit']);
    $('.l-form-email').text(langJson['l-form-email']);
    $('.l-form-escalated-to').text(langJson['l-form-escalated-to']);
    $('.l-form-fax').text(langJson['l-form-fax']);
    $('.l-form-full-name').text(langJson['l-form-full-name']);
    $('.l-form-handled-by').text(langJson['l-form-handled-by']);
    $('.l-form-language').text(langJson['l-form-language']);
    $('.l-form-long-call-duration').get(0).nextSibling.data = langJson['l-form-long-call-duration'];
    $('.l-form-market').text(langJson['l-form-market']);
    $('.l-form-scheduled-reminder').text(langJson['l-form-scheduled-reminder']);
    $('.l-form-title').text(langJson['l-form-title']);
    $('.l-form-mobile').text(langJson['l-form-mobile']);
    $('.l-form-nationality').text(langJson['l-form-nationality']);
    $('.l-form-nature').text(langJson['l-form-nature']);
    $('.l-form-none').get(0).nextSibling.data = langJson['l-form-none'];
    $('.l-form-other').text(langJson['l-form-other']);
    $('.l-form-profile').text(langJson['l-form-profile']);
    $('.l-form-radio-email').get(0).nextSibling.data = langJson['l-form-radio-email'];
    $('.l-form-radio-fax').get(0).nextSibling.data = langJson['l-form-radio-fax'];

    var radioOtherArr = $('.l-form-radio-other');
    for (let radioOther of radioOtherArr) {
        radioOther.nextSibling.data = langJson['l-form-radio-other'];
    }

    $('.l-form-reason-for-long-call').text(langJson['l-form-reason-for-long-call']);
    $('.l-form-remarks').text(langJson['l-form-remarks']);
    $('.l-form-reply').text(langJson['l-form-reply']);
    $('.l-form-save').text(langJson['l-form-save']);
    $('.l-form-sms').get(0).nextSibling.data = langJson['l-form-sms'];
    $('.l-form-status').text(langJson['l-form-status']);
    $('.l-general-previous-page').attr('title', langJson['l-general-previous-page']);
    $('#customer-tbl-customer-id').removeClass('d-none');
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
        console.log('r');
        console.log(r);
        var response = JSON.parse(r.responseText)
        console.log('response');
        console.log(response);
        console.log('r.result');
        console.log(r.result);
        console.log('/^success$/i.test(r.result || "")');
        console.log(/^success$/i.test(r.result || ""));
        console.log('!/^success$/i.test(r.result || "")');
        console.log(!/^success$/i.test(r.result || ""));
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
            // downloaded file cannot be opened normally, so don't use download .js
            // theFile.attr('onclick', '$.ajax({url:"' + responseData.FileUrl + '",success:download.bind(true,"' + responseData.ContentType + '","' + responseData.FileName + '")})');
            theFile.attr("href", responseData.FileUrl);
            theFile.attr("target", "_blank");
        }
        if (lastAttachment) {
            // clear attachment
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
        console.log('attachment.type');
        console.log(attachment.type);
        // verify file type: tested fax can send out without file or with 1 or more Microsoft word,excel,ppt or txt or pdf file
        if (uploadType == "faxFile" && attachment.type != 'application/msword' && attachment.type != 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && attachment.type != 'application/pdf' && attachment.type != 'text/plain' && attachment.type != 'application/vnd.ms-powerpoint' && attachment.type != 'application/vnd.openxmlformats-officedocument.presentationml.presentation' && attachment.type != 'application/vnd.ms-excel' && attachment.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            alert(langJson['l-alert-fax-file-not-valid']);
            continue; // breaks one iteration in the loop
        }
        // verify file size
        if (attachment.size / 1024 / 1024 > limitedSizeMB) {
            alert(langJson['l-alert-fax-file-not-valid'] + attachment.name + langJson['l-alert-exceed'] + limitedSizeMB + 'MB');
            continue; // breaks one iteration in the loop
        }
        var attachmentName = attachment.name;
        // make a unique id
        var uniqueId = attachmentName.replace(/[^a-zA-Z]+/g, '');
        uniqueId += new Date().getUTCMilliseconds();
        var loadingId = 'loading-' + uniqueId;
        var downloadId = 'download-' + uniqueId;

        $("#" + uploadType + "-attachment").append('<span class="email-attach-tag" id="' + uniqueId + '"><a id="' + downloadId + '" href="javascript:none;">' + attachmentName + '</a></span>');
        console.log('uniqueId');
        console.log(uniqueId);
        $("#" + uniqueId).append('<span id="' + loadingId + '"><div id="circularG"><div id="circularG_1" class="circularG"></div><div id="circularG_2" class="circularG"></div><div id="circularG_3" class="circularG"></div>' +
            '<div id="circularG_4" class="circularG"></div><div id="circularG_5" class="circularG"></div><div id="circularG_6" class="circularG"></div><div id="circularG_7" class="circularG"></div><div id="circularG_8" class="circularG"></div></div><span>');

        var fileData = new FormData();
        fileData.append("files", attachment);
        fileData.append('agentId', loginId);
        fileData.append('caseNo', internalCaseNo); // for Create New Case no case no yet, so provide internal case no
        console.log('internalCaseNo');
        console.log(internalCaseNo);
        callUploadAttachment(fileData, uniqueId, loadingId, downloadId, (i == inputFilesLength - 1), uploadType);
        resize();
    }
}

function clearPic() {

    // clear file
    var fileInput = $("#file-to-upload")
    fileInput.replaceWith(fileInput.val('').clone(true));

    // reset picture to original
    var photo = document.getElementById('profile-pic');
    photo.src = photoSrc;
}

// When selected photo for profile photo
function previewPhoto(input) {
    var photoFile = input.files[0];
    if (input.files && photoFile) {
        // verify file type
        if (photoFile.type != 'image/jpeg' && photoFile.type != 'image/gif' && photoFile.type != 'image/png') {
            alert(langJson['l-alert-fax-file-not-valid']);
            clearPic();
            return;
        }
        // verify file size
        var limitedSizeMB = sessionStorage.getItem('scrmPhotoSize') ? sessionStorage.getItem('scrmPhotoSize') : 2; // default limit 2MB
        if (photoFile.size / 1024 / 1024 > limitedSizeMB) {
            alert(langJson['l-alert-photo-size-cannot-exceed'] + limitedSizeMB + 'MB');
            clearPic();
            return;
        }
        // set profile picture
        var reader = new FileReader();
        reader.onload = function (e) {
            // upload photo
            var fileUpload = $("#file-to-upload").get(0);
            var fileUploadFiles = fileUpload.files;
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
                    // change input form icon
                    $('#profile-pic').attr('src', e.target.result);
                }
            });
        }
        reader.readAsDataURL(photoFile);
    }
}

function restorePage() {
    isManualUpdate = true;
    connId = -1;
    updateCaseObj.Conn_Id = -1; // as after saving the conn_id need to be -1
    // restore veriable
    caseSaved = true;
    replyConfirmed = false; // reply is not confirmed or dialed out
    window.onbeforeunload = undefined;
    updateCaseObj = {};
    $("#reply-none").prop("checked", true).trigger("click");
    $('#reply-submit-btn').hide();
    $('#call-result-container').remove();
    dialNoClicked();
    $('#case-details').val('');
    $("#email-other-input").val('').prop('disabled', true);
    $("#fax-other-input").val('').prop('disabled', true);
    $("#sms-other-input").val('').prop('disabled', true);
    $("#call-other-input").val('').prop('disabled', true);
    $('.l-form-radio-other').prop("checked", false); // Reply's other uncheck
    // $('input[type="checkbox"]').removeAttr('checked');
    $('input.reply-checkbox:checked').prop('checked', false);
    console.log($('input.reply-checkbox:checked'));
    console.log("$('input.reply-checkbox:checked')");
    if (isSocial) {
        // this scrollTop is for demo only
        parent.document.documentElement.scrollTop = 735;
    } else {
        parent.document.documentElement.scrollTop = 0;
    }
}

function saveClicked(isTemp, callback) { // 1. declare 2. verify 3. update customer(if needed) 4. send reply(if needed) 5. update case 6. save call history
    console.log('isTemp, callback');
    console.log(isTemp, callback);
    console.log('disableMode');
    console.log(disableMode);
    // ========================== 1/6 Declare variable ==========================
    var type = parent.type;
    var caseNature = document.getElementById('case-nature').value || '';
    var caseDetails = document.getElementById('case-details').value || '';
    caseDetails = gf.escape(caseDetails);
    var caseStatus = document.getElementById('case-status').value || '';
    var caseEscalatedId = null;
    var caseEscalated = document.getElementById('case-escalated').value || null;
    if (caseEscalated != null && caseEscalated.length > 0) {
        caseEscalatedId = Number(caseEscalated);
    }
    var longCallDuration = $('#Long_Call').prop('checked') ? "Y" : "N";
    var longCallReason = $('#Long_Call_Reason').val();
    var isJunkMail = $('#Is_Junk_Mail').prop('checked') ? "Y" : "N";
    var replyList = document.querySelector('input[name="replyList"]:checked')
    var replyChannel = replyList ? replyList.value : '';
    var replyDetails = '';
    var replyDetailsArr = $('.' + replyChannel + '-list:checked');
    for (let theReplyDetails of replyDetailsArr) {
        var detailsValue = theReplyDetails.value;
        if (detailsValue != 'other') {
            if (replyDetails.length == 0) {
                replyDetails = detailsValue;
            } else {
                replyDetails += (',' + detailsValue);
            }
        } else {
            if (replyDetails.length == 0) {
                replyDetails = $('#' + replyChannel + '-other-input')[0].value;
            } else {
                replyDetails += (',' + $('#' + replyChannel + '-other-input')[0].value);
            }
        }
    }
    // ========================== 2/6 Verify ==========================
    // verify all attachemnt uploaded
    console.log('outstandingAttachment');
    console.log(outstandingAttachment);
    if (!isTemp) {
        if (outstandingAttachment > 0) {
            console.log('***outstandingAttachment > 0');
            alert(langJson['l-alert-attachment-outstanding']);
            return;
        }
        // verify nature which cannot be blank
        if (caseNature.length == 0) {
            alert(langJson['l-alert-no-nature']);
            return;
        }
        // verify status which cannot be blank
        if (caseStatus.length == 0) {
            alert(langJson['l-alert-no-status']);
            return;
        }
        // verify details which cannot be blank
        if (caseNature != 'Junk' && caseDetails.length == 0) {
            console.log('***caseNature != Junk && caseDetails.length == 0');
            alert(langJson['l-alert-no-details']);
            return;
        }
        // verify case status fieldi fif 
        if (caseStatus == 'Escalated') {
            if (caseEscalated.length == 0) {
                alert(langJson['l-alert-select-agent-escalate']);
                return;
            }
        }
        // verify have long call reason selected
        if (longCallDuration == 'Y' && longCallReason == '') {
            alert(langJson['l-alert-select-long-call-reason']);
            return;
        }
        // vierify is reply detil empty
        if (replyChannel != '') {
            console.log('replyChannel');
            console.log(replyChannel);
            console.log('replyDetails');
            console.log(replyDetails);
            console.log('replyDetailsArr');
            console.log(replyDetailsArr);
            if (replyDetails.length == 0) {
                alert(langJson['l-alert-reply-details-empty']);
                return;
            }
            // verify clicked confirm or dial yes or not
            if (replyConfirmed === false) {
                if (replyChannel != 'call') {
                    alert(langJson['l-alert-reply-not-confirmed']);
                    return;
                } else {
                    alert(langJson['l-alert-not-clicked-dial']);
                    return;
                }
            } else {

                // replyConfirmed = true here
                // verify dialed out call, have it be given result
                if (replyChannel == 'call') {
                    var replyCallResult = $('#call-result-select')[0].value;
                    if (replyCallResult != undefined && replyCallResult.length == 0) {
                        alert(langJson['l-alert-no-call-result']);
                        return;
                    }
                }
            }
        }
        // verify if email related checked but wihtout email
        var customerEmail = $('#Email').val();
        var isEmailEmpty = customerEmail.length == 0;
        console.log('isEmailEmpty');
        console.log(isEmailEmpty);
        var emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        var isEmail = emailRegex.test(customerEmail);
        if (!isEmailEmpty && !isEmail) {
            alert(langJson['l-alert-email-invalid']);
            return;
        }
    }
    // ========================== 3/6 Update Customer (if needed) ==========================
    if (!isTemp && disableMode === false) {
        updateClicked();
    } else if (isSocial) {
        if (customerData) {
            if ((callType == 'Inbound_Wechat' && customerData.Wechat_Id == null) ||
                (callType == 'Inbound_Facebook' && customerData.Facebook_Id == null) ||
                (callType == 'Inbound_Whatsapp' && customerData.Whatsapp_Id == null)
            ) {
                disableMode = false;
                updateClicked();
            }
        }
    }
    // ========================== 4/6 Send Reply + 5/6  Update Case + 6/6 Save Call History ==========================  

    if (replyChannel == 'email') {
        replyType = 'Outbound_Email';
    } else if (replyChannel == 'fax') {
        replyType = 'Outbound_Fax';
    } else if (replyChannel == 'sms') {
        replyType = 'Outbound_SMS';
    } else if (replyChannel == 'call') {
        replyType = 'Outbound_Call';
    } else {
        replyType = ''; // none
    }
    updateCaseObj = $.extend(updateCaseObj, {
        Internal_Case_No: internalCaseNo != null ? Number(internalCaseNo) : null,
        Agent_Id: loginId,
        Call_Nature: caseNature,
        Details: caseDetails,
        Status: caseStatus,
        Long_Call: longCallDuration,
        Long_Call_Reason: longCallReason,
        Is_Junk_Mail: isJunkMail,
        Escalated_To: caseEscalatedId, //If not provide Escalated_To, Escalated to will become null
        Reply_Type: replyType,
        Reply_Details: replyDetails,
        Reply_Call_Result: replyCallResult,
        Call_Type: isManualUpdate ? '' : callType,
        Type_Details: isManualUpdate ? '' : details
    });
    if (updateCaseObj.Reply_Conn_Id) {
        if (isSocial) {
            updateCaseObj.Ticket_Id = updateCaseObj.Reply_Conn_Id;
        }
        //else {        //  20250321 'updateCaseObj.Reply_Conn_Id' is assigned to itself.
        //    updateCaseObj.Reply_Conn_Id = updateCaseObj.Reply_Conn_Id
        //}
    }
    if (ivrInfo != undefined) {
        updateCaseObj.IVR_Info = ivrInfo;
    }
    if (isTemp) {
        var Customer_Data = updateClicked(true);
        Customer_Data.disableMode = disableMode;
        Customer_Data.inheritAll = true;
        console.log('Customer_Data');
        console.log(Customer_Data);
        callback($.extend(updateCaseObj, Customer_Data), parent.type);
        return;
    }

    if (replyType == '' || replyType == 'Outbound_Call') {
        // update case
        callUpdateCase();
    } else {
        var tempConnId;
        
        // Send reply, update case when callback replyCallClick called
        replyDetails = replyDetails.replace(/ /g, '');
        var replyArr = replyDetails.split(',');
        if (replyType == 'Outbound_Email') {
            var attachedFiles = '';
            for (var j = 0; j < emailFileList.length; j++) {
                if (j == 0) {
                    attachedFiles += emailFileList[j].FilePath;
                } else {
                    attachedFiles += ("," + emailFileList[j].FilePath);
                }
            }
            // Max Length is 4096
            if (attachedFiles.length > 4096) {
                document.getElementById("case-save-btn").disabled = false;
                alert('The length of file path exceeded the limit\nPlease consider to shorten file name');
                return;
            }
            var emailCc = document.getElementById('email-cc').value;
            var emailSubject = document.getElementById('email-subject').value;
            var emailContent = CKEDITOR.instances.editor.getData() || '';
            tempConnId = String(parent.parent.sendEmail(campaign, replyDetails, emailCc, emailSubject, emailContent, attachedFiles));
            updateCaseObj.Reply_Conn_Id = tempConnId;
            updateCaseObj.Conference_Conn_Id = null;
            callUpdateCase();
        } else if (replyType == 'Outbound_SMS') {

            var smsContent = $('#sms-content').val();
            if (typeof smsContent == 'undefined') {
                document.getElementById("case-save-btn").disabled = false;
                alert('Please click confirm button to fill in SMS content first');
                return;
            }

            if (smsContent == '') {
                document.getElementById("case-save-btn").disabled = false;
                $('#sms-content').focus();
                alert('SMS content cannot be blank');
                return;
            }

            // need to check is that all number first
            for (var call of replyArr){
                if (isNaN(call)) {
                    document.getElementById("case-save-btn").disabled = false;
                    alert('SMS phone: ' + val + ' is a not valid number');
                    return;
                }
            }

            for (var i = 0; i < replyArr.length; i++) {
                var phoneNum = replyArr[i];
           
                tempConnId = String(parent.parent.sendSMS(campaign, Number(phoneNum), smsContent) || 0);
                if (tempConnId == 0) {
                    
                    // still need to save, as the sms may has sent, need a record
                    alert(langJson['l-alert-sms-failed'] + phoneNum + langJson['l-alert-sms-rejected']);
                }
                if (i != 0) {
                    updateCaseObj.Reply_Conn_Id += "," + tempConnId;
                } else {
                    updateCaseObj.Reply_Conn_Id = tempConnId;
                }
            }
            updateCaseObj.Conference_Conn_Id = null;
            if (updateCaseObj.Call_Type == 'Inbound_Call') {
                callSaveCallHistory(false);
            }
            callUpdateCase();
        } else if (replyType == 'Outbound_Fax') {
            var faxFile = '';
            for (var k = 0; k < faxFileList.length; k++) {
                if (k == 0) {
                    faxFile += faxFileList[k].FilePath;
                } else {
                    faxFile += (";" + faxFileList[k].FilePath); // Notes: for fax can only seperate by ;(semi-colon) cannot seperate by ,(comma)
                }
            }
            var coverAttn = document.getElementById('fax-attn').value;
            var coverSubject = document.getElementById('fax-subject').value;
            var coverMsg = document.getElementById('fax-msg').value;
            for (let reply of replyArr) {
                tempConnId = String(parent.parent.sendFax(campaign, reply, faxFile, coverSubject, coverMsg, coverAttn, agentName, companyName)) || -1;
                if (tempConnId == 0 || undefined) {
                    alert(langJson['l-alert-fax-failed'] + reply);
                }
                if (updateCaseObj.Reply_Conn_Id == null || updateCaseObj.Reply_Conn_Id.length == 0) {
                    updateCaseObj.Reply_Conn_Id = tempConnId;
                } else {
                    updateCaseObj.Reply_Conn_Id += "," + tempConnId;
                }
            }
        } else if (replyType == 'Outbound_WhatsApp') {
            // Verify content not blank
            var tp0Val = ($('#tpl-content-0').val() || '').trim();
            var tp1Val = ($('#tpl-content-1').val() || '').trim();
            var tp2Val = ($('#tpl-content-2').val() || '').trim();
            var tp3Val = ($('#tpl-content-3').val() || '').trim();
            var tp4Val = ($('#tpl-content-4').val() || '').trim();
            var tp5Val = ($('#tpl-content-5').val() || '').trim();
            var tp6Val = ($('#tpl-content-6').val() || '').trim();

            var allPropArr = [tp0Val, tp1Val, tp2Val, tp3Val, tp4Val, tp5Val, tp6Val];
            var tpPropsArr = [];
            for (let prop of allPropArr) {
                if (prop.length > 0) {
                    tpPropsArr.push(prop);
                }
            }
            // if (tp0Val.length > 0) {
            //     tpPropsArr.push(tp0Val);
            // }

            // if (tp1Val.length > 0) {
            //     tpPropsArr.push(tp1Val);
            // }

            // if (tp2Val.length > 0) {
            //     tpPropsArr.push(tp2Val);
            // }

            // if (tp3Val.length > 0) {
            //     tpPropsArr.push(tp3Val);
            // }

            // if (tpPropsArr.length == 0) {
            //     document.getElementById("case-save-btn").disabled = false;
            //     alert('Template Content cannot be blank');
            //     return;
            // }
            // Verify has selected template
            var selectedTP = $('input[name=tp]:checked').val();
            if (selectedTP == undefined) {
                document.getElementById("case-save-btn").disabled = false;
                alert('Please select at least one template');
                return;
            }
            // Verify customer selected
            if (replyDetails.length = 0) {
                document.getElementById("case-save-btn").disabled = false;
                alert('Please choose the mobile number');
                return;
            }

            var tpPropsNo = parseInt($('input[name=tp]:checked').attr('props'));
            if (tpPropsArr.length != tpPropsNo) {
                document.getElementById("case-save-btn").disabled = false;
                alert('Template content props is not same length with the template props');
                return;
            }
            replyDetails = replyDetails.replace(/ /g, '');
            $('#send-wa-section').append('<p><span><span><div id="circularG"><div id="circularG_1" class="circularG"></div><div id="circularG_2" class="circularG"></div><div id="circularG_3" class="circularG"></div>' +
                '<div id="circularG_4" class="circularG"></div><div id="circularG_5" class="circularG"></div><div id="circularG_6" class="circularG"></div><div id="circularG_7" class="circularG"></div><div id="circularG_8" class="circularG"></div></div><span>&nbsp;&nbsp;Sending...</span></p>');

            parent.parent.document.getElementById("phone-panel").contentWindow.wiseSendWhatsAppMsgEx(campaign, replyDetails, selectedTP, tpPropsArr, function (replyObj) {
                // send failed
                if (replyObj.resultID == "1") { // success resultID will be "4"
                    alert(replyObj.msg + '\nSend failed, the input form will continue to be updated');
                }
                updateCaseObj.Reply_Conn_Id = replyObj.ticket_id.toString(); // big int put to varchar field need to become string first
                callUpdateCase();
            });
        }
    }
}

// for customer service pop-up
var profilePicClick = function () {
    var openWindows = parent.parent.openWindows || parent.parent.parent.openWindows; // parent.parent.parent.openWindows opened from search customer
    openWindows[openWindows.length] = window.open('csPopup.html?edit=false', '', 'toolbar=0,location=0,top=50, left=50,menubar=0,resizable=0,scrollbars=1,width=1050,height=584');
}
var scheduleClick = function () {
    var openWindows = parent.parent.openWindows;
    var reminderPopup = window.open('../../reminderPopup.html', '', 'toolbar=0,location=0,top=50, left=50,menubar=0,resizable=0,scrollbars=1,width=660,height=458');
    openWindows[openWindows.length] = reminderPopup;
    reminderPopup.onload = function(){
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
    changeCaseSavedFalse();
    var selected = $(iThis).find('option:selected');
    console.log('selected');
    console.log(selected);
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
    $('<span id="call-result-container" class="mb-3" style="display:inline;"><label>&nbsp;&nbsp;&nbsp;' + langJson['l-form-call-result'] + '&nbsp;&nbsp;&nbsp;</label><select class="form-select" id="call-result-select" value="" style="display:inline;width:130px"><option value="" selected></option><option>Answered</option><option>Busy Call Again</option><option>Busy Tone</option><option>No Answer</option><option>Voicemail</option></select></span>').insertAfter('#reply-submit-btn');
    $('.dial-yes-disable').prop('disabled', true);
    if (!incompleteCase) {
        var callDetails = $('.call-list:checked')[0].value;
        if (callDetails == 'other') {
            callDetails = $('#call-other-input')[0].value;
        }
        updateCaseObj.Reply_Details = callDetails;
        updateCaseObj.Reply_Conn_Id = "-1"; // if the agent rejected to call at the end, Reply_Conn_Id will be -1;
        parent.parent.makeCall(campaign, callDetails, tabType);
        // parent.parent.makeCall(campaign, (config.telPrefix + callDetails), tabType);
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
        // update customer if remarks is same no need to continue
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
                // theHeader.title = '';
                theHeader.setAttribute('data-original-title', '');
                //$(theHeader).attr("title", "").tooltip("_fixTitle").tooltip("show");
                // $(theHeader).data('tooltip').options.title = '';
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
            // $(theHeader).attr("title", remarks).tooltip("_fixTitle");
            // theHeader.title = remarks;
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
        } else {
            if (isValid == 'Y') {
                theHeader.style.display = 'inline';
                theHeader.setAttribute('data-original-title', remarks);
                // theHeader.title = remarks;
            } else {
                theHeader.style.display = 'none';
                theHeader.setAttribute('data-original-title', '');
                // theHeader.title = '';
            }
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
    console.log('remarks');
    console.log(remarks);
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
        if (saveCallHistoryObj.Conn_Id == sessionStorage.getItem('scrmConnId')) {
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
            } else {
                // reload page
                if (isSaved) {
                    restorePage();
                }
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
            //return;   // 20250328 Remove this redundant jump.
        } else {
            $('#form-back-btn').hide();
            // check have become outsider
            if (updateCaseObj.Status == 'Escalated' && updateCaseObj.Escalated_To != loginId) {
                var caseStatusSelect = $('#case-status');
                // set status follow up
                caseStatusSelect.val('Follow-up Required');
                // take out Closed and Escalated option
                caseStatusSelect.find('.to-be-removed').remove();
                // hidden escalatedt to
                document.getElementById('case-escalated-container').style.display = 'none';
            }
            caseNo = details.Case_No || -1;
            $('#scheduled-reminder').show();
            // if no case no showed before
            if ($('#case-no-span').length == 0) {
                $('<span id="case-no-span" class="ms-3"><label class="mt-3">' + langJson['l-search-case-no'] + ':</label>&nbsp;' + caseNo + '</span>').insertAfter($('#customer-id'));
            }
            // parent.caseNo = details.Case_No || -1;
            var caseLogContainer = $('#case-log-container');
            caseLogContainer.remove();
            // if (caseLogContainer) {
            //     caseLogContainer.remove();
            //     loadCaseLog();
            // }
            if (caseLogContainer.length == 0) {
                loadCaseLog(true);
            } else {
                caseLogContainer.remove();
                loadCaseLog(false);
            }
            // reply wise handled the media reocrd
            if (connId != null && connId != -1 && (callType == 'Inbound_Email' || callType == 'Inbound_Fax' || callType == 'Inbound_Voicemail')) {
                console.log('callType, connId, updateCaseObj.Internal_Case_No');
                console.log(callType, connId, updateCaseObj.Internal_Case_No);
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
    console.log('replyCallClick run');
    callSaveCallHistory(false);
}

function replyChannelChange(iThis) {
    replyConfirmed = false;
    var channel = $(iThis).attr('value');
    var mediaChannelArr = ['email', 'fax', 'sms', 'call'];
    var replyContainer = $('#reply-card');
    if (replyContainer) {
        replyContainer.remove();
    }
    // Show what details
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
        // $('#reply-submit-btn').prop('value', 'Confirm');
        $('#reply-submit-btn').show();
    } else if (channel == 'call') {
        $('#reply-submit-btn').html('<i class="fas fa-phone me-2"></i><span>' + langJson["l-form-dial"] + '</span>');
        // $('#reply-submit-btn').prop('value', 'Dial');
        $('#reply-submit-btn').show();
    } else {
        $('#reply-submit-btn').hide();
    }
    // restore veriable
    emailFileList = [];
    faxFileList = [];
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
    changeCaseSavedFalse();
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
        console.log('checkList');
        console.log(checkList);
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
            var subjectStr = callType == 'Inbound_Email' ? ('RE: ' + mediaContent.Subject) : '';
            var contentStr = callType == 'Inbound_Email' ?
                '&#13;&#10;&#13;&#10;<br />' +
                '<hr />' +
                '<b>From: </b>' + (preview.find('#name').html() || '') + (preview.find('#from').html() || '') + '&#13;&#10;<br />' +
                '<b>Sent: </b>' + (preview.find('#time').html() || '') + '&#13;&#10;<br />' +
                '<b>To: </b>' + (preview.find('#to').html() || '') + '&#13;&#10;<br />' +
                '<b>Subject: </b>' + (preview.find('#subject').html() || '') + '&#13;&#10;<br />' +
                (preview.find('#content').html() || '') : '';
            var emailFileStr = "emailFile";
            var emailFileTriggerStr = "$('#upload-emailFile').trigger('click');"
            var emailFileUploadStr = 'uploadAttachment(this,"emailFile");'
            // $('<table style="width:100%;" id="reply-card"><tbody><tr>' +
            //     '<td style="font-family: Arial, Helvetica, sans-serif; font-size: small; background-color: #CCCCCC; text-align: center;"><h5 class="mt-0 mb-0">Send Email</h5></td></tr>' +
            //     '<tr><td><table style="width: 100%; font-family: Arial, Helvetica, sans-serif; font-size: small;"><tbody>' +
            //     '<tr><td><label>From</label></td><td>' + companyName + ' (' + companyEmail + ')</td ></tr > ' +
            //     '<tr><td width="1"><label for="email-cc">CC</label></td><td><input id="email-cc" type="search" style="width:100%;" maxlength="100"></td></tr>' +
            //     '<tr><td><label for="email-subject">Subject</label></td><td><input id="email-subject" style="width:100%;" maxlength="100" value=' + subjectStr + '></td></tr>' +
            //     '<tr><td valign="top"><label for="email-content">Content</label><br><label>(html)</label></td><td><textarea id="email-content" style="font-family:Helvetica Neue,Helvetica,Arial,sans-serif;width:100%;" rows="10" cols="20" maxlength="8000">' + contentStr + '</textarea></td></tr>' +
            //     '<tr><td><label class="me-5">Attachment</label></td><td id="emailFile-attachment"><input type="file" id="upload-emailFile" onchange=' + emailFileUploadStr + ' style="display:none" multiple>' +
            //     '<input type="button" class="btn btn-warning btn-sm" title="Upload Attachment" value="Upload" onclick=' + emailFileTriggerStr + ' /></td></tr>' +
            //     '<tr><td&nbsp;</td><td>&nbsp;</td></tr></tbody></table></td></tr></tbody></table>').appendTo('#reply-container');
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
            // $('<table style="width:100%;" id="reply-card"><tbody><tr>' +
            //     '<td style="font-family: Arial, Helvetica, sans-serif; font-size: small; background-color: #CCCCCC; text-align: center;"><h5 class="mt-0 mb-0">Send Fax</h5></td></tr>' +
            //     '<tr><td><table style="width: 100%; font-family: Arial, Helvetica, sans-serif; font-size: small;"><tbody>' +
            //     '<tr><td><label>Cover Sender</label></td><td style="width:80%">' + agentName + '</td></tr>' +
            //     '<tr><td><label>Cover Company</label></td><td>' + companyName + '</td></tr>' +
            //     '<tr><td><label for="fax-attn">Cover Attention</label></td><td><input id="fax-attn" style="width:99%;" maxlength="15"></td></tr>' +
            //     '<tr><td><label for="fax-subject">Cover Subject</label></td><td><input id="fax-subject" style="width:99%;" maxlength="20"></td></tr>' +
            //     '<tr><td valign="top"><label for="fax-msg">Cover Message</label></td><td><textarea id="fax-msg" rows="3" cols="20" style="font-family:Helvetica Neue,Helvetica,Arial,sans-serif;width:99%;" maxlength="600"></textarea></td></tr>' +
            //     '<tr><td><label>Fax File</label></td><td id="faxFile-attachment"><input type="file" accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.txt" id="upload-faxFile" onchange=' + faxFileUploadStr + ' style="display:none" multiple>' +
            //     '<input type="button" class="btn btn-warning btn-sm" title="Upload Fax File" value="Upload" style="margin-left:5px;" onclick=' + faxFileTriggerStr + ' /></td></tr>' +
            //     '</tbody></table></td></tr></tbody></table>').appendTo('#reply-container');
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
                '<textarea class="mt-2" id="fax-msg" rows="3" cols="20" style="font-family:inherit;width:100%;" maxlength="500" onchange="changeCaseSavedFalse()"></textarea></div></div>' +
                '<div class="mb-3 col-sm-12 ps-3">' +
                '<label class="col-sm-2 control-label ps-5 justify-content-start">Fax File</label>' +
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
            // $('<table style="width:100%;" id="reply-card"><tbody><tr>' +
            //     '<td style="font-family: Arial, Helvetica, sans-serif; font-size: small; background-color: #CCCCCC; text-align: center;"><h5 class="mt-0 mb-0">Send SMS</h5></td></tr>' +
            //     '<tr><td><table style="width: 100%; font-family: Arial, Helvetica, sans-serif; font-size: small;"><tbody>' +
            //     '<tr><td><label>From</label></td><td style="width:99%;">' + companyName + '</td></tr>' +
            //     '<tr><td valign="top"><label for="sms-content" class="me-5">Content</label></td><td><textarea id="sms-content" rows="10" cols="20" style="width:99%;" maxlength="300"></textarea></td></tr>' +
            //     '<tr><td&nbsp;</td><td>&nbsp;</td></tr>' +
            //     '</tbody></table></td></tr></tbody></table>').appendTo('#reply-container');
        }
        // added reply section, so needed to resize
        resize();
        replyConfirmed = true;
    }
    $('textarea').keydown(function (e) {
        if (e.keyCode == 33 || e.keyCode == 34) {
            $(this).blur();
        }
    });
}

// function exitOnClick() {
//     if (caseSaved === false) {
//         var leaveConfirm = confirm('Are you sure you want to leave the page without saving?');
//         if (leaveConfirm) {
//             // leave the page
//             parent.parent.returnMain();
//             //window.location.href = '../../main.html';
//             return;
//         } else {
//             return;
//         }
//     } else {
//         // leave the page
//         parent.parent.returnMain();
//     }
// }

function loadCaseLog(initial) {
    // console.log('parent.caseNo in loadCaseLog'); console.log(parent.caseNo);
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/GetCaseLog',
        data: JSON.stringify({
            'Case_No': Number(caseNo),
            'Is_Valid': 'Y',
            Agent_Id: loginId,
            Token: token
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).always(function (res) {
        if (!/^success$/i.test(res.result || "")) {
            console.log("Error in loadCaseLog." + res ? res.details : '');
            resize();
        } else {
            var folowHistoryContent = res.details;
            var follolwupString = '';
            $('<div id="case-log-container" class="card mt-5 mb-5">' +
                '<div class="card-header card-header-text card-header-info" data-bs-toggle="collapse" data-bs-target="#case-log-body">' +
                '<h5 class="mt-0 mb-0"><i class="fa fa-table card-header-icon"></i><span class="align-middle">' + langJson['l-form-case-log'] + '</span><span class="align-middle" style="color:darkblue;">&nbsp;&nbsp;(' + langJson['l-search-case-no'] + ':&nbsp;' + caseNo + ')</span></h5>' +
                '</div><div class="collapse show mt-1" id="case-log-body">' + '<div class="card-body">' +
                '<table class="table table-hover" style="width:100%" id="case-log-table" data-page-length=' + caseLogLength + '></div></div></div>').insertAfter('#accordion');
            var caseLogTable = $('#case-log-table').DataTable({
                data: folowHistoryContent,
                //lengthChange: false,    // 20250401 duplicate name
                aaSorting: [
                    [1, 'desc']
                ], // no initial sorting
                // pageLength: caseLogLength,//5,
                lengthChange: false,
                searching: false,
                initComplete: function (settings, json) {
                    resize(true);
                },
                columns: [{
                        title: langJson['l-form-open']
                    }, {
                        title: langJson['l-form-last-revision'],
                        data: 'Updated_Time'
                    }, // equal case_updated_time
                    {
                        title: langJson['l-search-inbound-type'],
                        data: "Call_Type"
                    }, {
                        title: langJson['l-form-inbound-details'],
                        data: "Type_Details"
                    }, {
                        title: langJson['l-form-details'],
                        data: "Details",
                        className: 'case-log-details-min-width'
                    }, {
                        title: langJson['l-form-outbound-type'],
                        data: "Reply_Type"
                    }, {
                        title: langJson['l-form-outbound-details'],
                        data: "Reply_Details"
                    }, {
                        title: langJson['l-form-status'],
                        data: "Status"
                    },
                ],
                "language": {
                    "emptyTable": langJson['l-general-empty-table'],
                    "info": langJson['l-general-info'],
                    "infoEmpty": langJson['l-general-info-empty'],
                    "infoFiltered": langJson['l-general-info-filtered'],
                    "lengthMenu": langJson['l-general-length-menu'],
                    "search": langJson['l-general-search-colon'],
                    "zeroRecords": langJson['l-general-zero-records'],
                    "paginate": {
                        "previous": langJson['l-general-previous'],
                        "next": langJson['l-general-next']
                    }
                },
                columnDefs: [{
                    targets: 0,
                    render: function (data, type, row) {
                        return '<i title="Details" class="table-btn fas fa-search-plus open"></i>';
                        // return '<img "Details" class="table-btn open" src="../../images/zoom-in-16.svg" />';
                    },
                    orderable: false,
                    className: 'btnColumn'
                }, {
                    targets: 1,
                    render: function (data, type, row) {
                        var newData = data.replace(/[T]/g, " ");
                        var indexOfDot = newData.indexOf('.');
                        if (indexOfDot > -1) {
                            return newData.slice(0, indexOfDot);
                        } else {
                            return newData;
                        }
                    }
                }, {
                    targets: 2,
                    render: function (data, type, row) {
                        if (data && data.length > 0) {
                            return data.replace('Inbound_', '');
                        } else {
                            return '&nbsp;&nbsp;-&nbsp;&nbsp;';
                        }
                    }
                }, {
                    targets: 5,
                    render: function (data, type, row) {
                        if (data && data.length > 0) {
                            return data.replace('Outbound_', '');
                        } else {
                            return '&nbsp;&nbsp;-&nbsp;&nbsp;';
                        }
                    }
                }, {
                    targets: -1,
                    render: function (data, type, row) {
                        var escalatedTo = row.Escalated_To;
                        console.log('row');
                        console.log(row);
                        console.log('escalatedTo');
                        console.log(escalatedTo);
                        if (escalatedTo != null) {
                            return 'Escalated to ' + '<span style="color:green">' + getAgentName(escalatedTo) + ' (ID: ' + escalatedTo + ')<span>'
                        } else {
                            return data
                        }
                    }
                }]
            });
            $('#case-log-table tbody').on('click', 'tr', function (e) {
                caseLogTable.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                $(this).addClass('highlight')
            });
            $('#case-log-table tbody').on('click', '.open', function () {
                var data = caseLogTable.row($(this).parents('tr')).data();
                // window.selectedCaseLog = data;
                selectedCaseLog = data;
                var openWindows = parent.parent.openWindows;
                var caseRecordPopup = window.open('./caseRecordPopup.html', 'caseRecord', 'menubar=no,location=no,resizable=no,scrollbar=no,fullscreen=no,toolbar=no,status=no,width=800,height=740,top=200,left=20'); // 2nd properties '_blank' will open new window, if have name('caseRecord'), will refresh the same
                if (openWindows) {
                    openWindows[openWindows.length] = caseRecordPopup;
                    caseRecordPopup.onload = function(){
                        caseRecordPopup.onbeforeunload = function () {
                            for (var i = 0; i < openWindows.length; i++) {
                                if (openWindows[i] == caseRecordPopup) {
                                    openWindows.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    }
                }
            });
            // scroll to the top
            // parent.scrollTo(0, 0);
            // $(parent.document.getElementsByTagName('body')).animate({
            //     scrollTop: 0
            // }, 500); // }, 'slow');
            // var caseLogY =  $("#case-log-container").offset().top - 400
            // $('body').animate({
            //     scrollTop: 0
            // }, 100);
            // console.log('$("#case-log-container").offset().top'); console.log($("#case-log-container").offset().top);
            // var $contents = $('#inputForm').contents();
            // $contents.scrollTop($contents.height());
            // this.contentWindow.scrollBy(0,100000)
            // alert('run here 9');
            // var lastBubbleOffset = $('#case-log-table').offset();
            // console.log('lastBubbleOffset'); console.log(lastBubbleOffset);
            // if (lastBubbleOffset != undefined) {
            //     $('body').animate({
            //         scrollTop: lastBubbleOffset.top
            //     }, 1000);
            // }
            // var objDiv = document.getElementsByTagName("body");
            // console.log('objDiv'); console.log(objDiv);
            // objDiv.scrollTop = 0;
            // $("html,body").animate({ scrollTop: 0 }, "slow");
            // $("body").animate({ top: 0 }, "slow", function () {
            //     alert('Animation complete.');
            // });
            // this.contentWindow.scrollTo(0, 400);
            // var frameId = window.frameElement.getAttribute('id');
            // var inputFrame = frameId != undefined ? parent.document.getElementById(frameId) : parent.document.getElementById("input-form-" + connId);
            // $(inputFrame).contents().scrollTop( $(inputFrame).contents().scrollTop() + 10 );
            // inputFrame.contentWindow.scrollTo(0, 0);
            // var myIframe = document.getElementByTagName('iframe');
            // console.log('myIframe'); console.log(myIframe);
            // myIframe.contentWindow.scrollTo(0, 0);
            // window.scrollTo(0, 1000);
            // window.scrollTo({
            //     top: 0,
            //     left: 400,
            //     behavior: 'smooth'
            // });
            // $("html").animate({ top: $(window).scrollTop() }, "slow", function () {
            //     alert('Animation complete.');
            // });
            //return false;
        }
    });
}
// call clicked
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
    console.log('this');
    console.log(this);
    console.log('oThis');
    console.log(oThis);
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
// load after html ready
function windowOnload() {
    var type = parent.type;
    customerData = parent.customerData || null;
    var inheritAll = customerData && customerData.inheritAll ? customerData.inheritAll : false;
    console.log('inheritAll');
    console.log(inheritAll);
    // isManualUpdate = customerData != undefined && customerData.Case_Is_Valid == 'Y' && customerData.Conn_Id == connId && customerData.Ticket_Id == ticketId ? true : false; // 20250320 Unnecessary use of boolean literals in conditional expression.
    isManualUpdate = customerData != undefined && customerData.Case_Is_Valid == 'Y' && customerData.Conn_Id == connId && customerData.Ticket_Id == ticketId;


    updateCaseObj.Conn_Id = isManualUpdate ? null : connId;
    console.log('customerData != undefined');
    console.log(customerData != undefined);
    console.log('customerData');
    console.log(customerData);
    console.log('isManualUpdate');
    console.log(isManualUpdate);
    console.log('call_type');
    console.log(callType);
    console.log('connId');
    console.log(connId);

    //      20250320    Unexpected constant truthiness on the left-hand side of a `||` expression.
    //    caseLogLength = sessionStorage.getItem('scrmCaseLogLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5 || 5;
    caseLogLength = sessionStorage.getItem('scrmCaseLogLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5;

    //set basic info
    document.getElementById('ip-agent-name').innerHTML = agentName;
    document.getElementById('customer-id').innerHTML = customerId;
    //document.getElementById('customer-id-title').innerHTML = customerId;
    //set customer info
    var Mobile_No = '';
    // var Home_No = '';
    // var Office_No = '';
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
        // get specific data
        Name_Eng = customerData.Name_Eng || '';
        Title = customerData.Title || '';
        Lang = customerData.Lang || '';
        Mobile_No = customerData.Mobile_No || '';
        // Home_No = customerData.Home_No || '';
        // Office_No = customerData.Office_No || '';
        Other_Phone_No = customerData.Other_Phone_No || '';
        Fax_No = customerData.Fax_No || '';
        Email = customerData.Email || '';
        // update basic field
        document.getElementById('Title').value = Title;
        // document.getElementById('Gender').innerHTML = customerData.Gender || '';
        document.getElementById('Lang').value = customerData.Lang || '';
        document.getElementById('Name_Eng').value = Name_Eng;
        document.getElementById('Address1').value = customerData.Address1 || '';
        document.getElementById('Nationality_Id').value = customerData.Nationality_Id || '';
        document.getElementById('Market_Id').value = customerData.Market_Id || '';
        document.getElementById('Profile_Id').value = customerData.Profile_Id || '';
        if (customerData.Agree_To_Disclose_Info == 'Y') {
            $('#Agree_To_Disclose_Info').prop('checked', true);
        }
        //Get Photo
        $.ajax({
            url: mvcHost + '/mvc' + campaign + '/api/GetPhoto',
            type: "POST",
            data: JSON.stringify({
                "Customer_Id": customerId,
                Agent_Id: loginId,
                Token: token
            }),
            // data: JSON.stringify({ "Customer_Id": customerData.Customer_Id }),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json',
            success: function (res) {
                var details = res.details;
                if (!/^success$/i.test(res.result || "")) {
                    // when customer have no photo will have this error, too common, so no need to write console
                    if (details != '值不能為 null。\r\n參數名稱: inArray') {
                        console.log("Error in GetPhoto");
                        console.log(res);
                    }
                } else {
                    var photo = document.getElementById('profile-pic');
                    var photoSrcString = "data:" + details.Photo_Type + ";base64," + details.Photo_Content;
                    photo.src = photoSrcString;
                    photoSrc = photoSrcString; //if uploaded a wrong photo need this to resotore to the original
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
    var _Mobile_No = document.getElementById('Mobile_No');
    // var _Home_No = document.getElementById('Home_No');
    // var _Office_No = document.getElementById('Office_No');
    var _Other_Phone_No = document.getElementById('Other_Phone_No');
    var _Fax_No = document.getElementById('Fax_No');
    var _Email = document.getElementById('Email');
    // a tag fields
    var tMobile = document.getElementById('tMobile_No')
    // var aSms = document.getElementById('aSms')
    // var tHome_No = document.getElementById('tHome_No');
    // var tOffice_No = document.getElementById('tOffice_No');
    var tOther_Phone_No = document.getElementById('tOther_Phone_No');
    var tFax_No = document.getElementById('tFax_No');
    var tEmail = document.getElementById('tEmail');
    // update editable text field
    _Mobile_No.value = Mobile_No;
    // _Home_No.value = Home_No;
    // _Office_No.value = Office_No;
    _Other_Phone_No.value = Other_Phone_No;
    _Fax_No.value = Fax_No;
    _Email.value = Email;

    var mobileStyle = 'none';
    // var homeStyle = 'none';
    // var officeStyle = 'none';
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

    // if (Home_No != null && Home_No.length > 0) {
    //     homeStyle = 'inline-block';
    // }
    // $('<span style="display:none;" name="call" class="cHome_No" id="reply-call-home-container"><span style="display:inline-block;" class="cHome_No"><div class="form-check ms-2"><label class="form-check-label"><input type="radio" name="callList" class="form-check-input reply-checkbox call-list dial-yes-disable" onchange="replyCallChanged(this)" value="' + Home_No + '" id="oCallHome_No">' + Home_No + '<span class="circle"><span class="check"></span></span></label></div></span>').insertBefore('#call-other-container');

    // if (Office_No != null && Office_No.length > 0) {
    //     officeStyle = 'inline-block';
    // }
    // $('<span style="display:' + officeStyle + ';" name="call" class="cOffice_No" id="reply-call-office-container"><div class="form-check ms-2"><label class="form-check-label"><input type="radio" name="callList" class="form-check-input reply-checkbox call-list dial-yes-disable" onchange="replyCallChanged(this)" value="' + Office_No + '" id="oCallOffice_No">' + Office_No + '<span class="circle"><span class="check"></span></span></label></div></span>').insertBefore('#call-other-container');
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

    // ==================== TYPE: NEW FOLLOW ====================
    var escalatedTo = customerData != null ? customerData.Escalated_To : null;
    if (type == 'newUpdate' && escalatedTo != null && escalatedTo != loginId) {
        outsider = true; // default outsider is false
    } else {
        $("#case-status").append('<option class="to-be-removed" value="Closed">Closed</option><option class="to-be-removed" value="Escalated">Escalated</option>');
        // $("#case-status").val('Closed');
    }
    if (type == 'newUpdate') {
        console.log("type == 'newUpdate' is true ");
        // fill in case details
        if (customerData != undefined) {
            document.getElementById('case-nature').value = customerData.Call_Nature || '';
        }
        $("#reply-none").prop("checked", true).trigger("click");
    } else {
        if (type == 'newCustomer') {
            if (callType == 'Inbound_Email') {
                _Email.value = details;
                // $('#Email_update').click();
            } else if (callType == 'Inbound_Fax') {
                _Fax_No.value = details;
                // $('#Fax_No_update').click();
            } else if (callType == 'Inbound_Call' || callType == 'Inbound_Voicemail') {
                var firstChar = details.charAt(0);
                if (firstChar == 5 || firstChar == 6 || firstChar == 7 || firstChar == 8 || firstChar == 9) {
                    _Mobile_No.value = details;
                    // $('#Mobile_No_update').click();
                } else {
                    _Other_Phone_No.value = details;
                    // $('#Other_Phone_No_update').click();
                }
            } else if (callType == 'Inbound_Webchat' || callType == 'Inbound_Facebook') {
                var detailsArr = details.split(',');
                if (details.length > 0) {
                    $.ajax({
                        type: "POST",
                        url: mvcHost + '/mvc' + campaign + '/api/GetFields',
                        data: JSON.stringify({
                            "listArr": ["Webchat Fields"],
                            Agent_Id: loginId,
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
                            if (rDetails != undefined) {
                                var webchatFields = rDetails['Webchat Fields'];
                                for (let theFieldStr of detailsArr) {
                                    var fieldNameValueArr = theFieldStr.split(':');
                                    var fieldName = fieldNameValueArr[0];
                                    var fieldValue = fieldNameValueArr[1];
                                    if (fieldValue != null && fieldValue.length > 0) {
                                        for (let theField of webchatFields) {
                                            if (fieldName == theField.Field_Name) {
                                                var dbColumnName = theField.Field_Display;
                                                if (dbColumnName == 'Name_Eng') {
                                                    document.getElementById('Name_Eng').value = unescape(fieldValue);
                                                } else if (dbColumnName == 'All_Phone_No') {
                                                    var firstChar = fieldValue.charAt(0);
                                                    if (firstChar == 5 || firstChar == 6 || firstChar == 7 || firstChar == 8 || firstChar == 9) {
                                                        _Mobile_No.value = fieldValue;
                                                    } else {
                                                        _Other_Phone_No.value = fieldValue;
                                                    }
                                                } else if (dbColumnName == 'Email') {
                                                    _Email.value = fieldValue;
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            }
        }
    }

    // load Escalate To dropdown
    for (let option of agentList) {
        var theAgentId = option.AgentID;
        $("#case-escalated").append('<option LevelID=' + option.LevelID + ' value=' + theAgentId + '>' + option.AgentName + ' (ID: ' + theAgentId + ')</option>');
    }
    if (inheritAll) {
        document.getElementById('case-details').value = customerData.Details || '';
        if (outsider) {
            document.getElementById('case-status').value = 'Follow-up Required';
        } else {
            if (escalatedTo != null) {
                document.getElementById('case-status').value = 'Escalated';
            } else {
                document.getElementById('case-status').value = customerData.Status || '';
            }
        }
        if (customerData != undefined && customerData.Escalated_To != null) {
            document.getElementById('case-escalated').value = customerData.Escalated_To;
            if (!outsider) {
                document.getElementById('case-escalated-container').style.display = 'inherit';
            }
        }
    }
    if (type == 'newUpdate') {
        loadCaseLog(true);
    }
    // if call from incomplete call cases and reply type is outbound call
    var incompleteCallDetails = parent.incompleteCallDetails;
    if (incompleteCallDetails != null) {
        var replyDetails = incompleteCallDetails.Reply_Details;
        // set reply channel: call
        $("#reply-call").prop("checked", true).trigger("click");
        // set update case obj
        updateCaseObj.Reply_Type = 'Outbound_Call';
        updateCaseObj.Reply_Conn_Id = String(incompleteCallDetails.Reply_Conn_Id);
        updateCaseObj.Reply_Details = replyDetails;
        // set phone number
        if (replyDetails == Mobile_No) {
            $("#oCallMobile_No").prop("checked", true).trigger("click");
            // } else if (replyDetails == Home_No) {
            //     $("#oCallHome_No").prop("checked", true).trigger("click");
            // } else if (replyDetails == Office_No) {
            //     $("#oCallOffice_No").prop("checked", true).trigger("click");
        } else if (replyDetails == Other_Phone_No) {
            $("#oCallOther_Phone_No").prop("checked", true).trigger("click");
        } else {
            $("#call-other-check").prop("checked", true).trigger("click");
            $("#call-other-input").attr("value", replyDetails);
        }
        dialYesClicked(true);
        console.log('incompleteCallDetails');
        console.log(incompleteCallDetails);
        parent.incompleteCallDetails = null;
    } else {
        $("#reply-none").prop("checked", true).trigger("click");
    }

    var customerOnlyAttr = window.frameElement.getAttribute("customer-only");
    if (customerOnlyAttr != undefined && customerOnlyAttr == 'true') {
        customerOnly = true;
        showCustomerSectionOnly();
    }
    // ================ GET NATIONALITY, MARKET AND PROFILE ================
    if (nationalityArr.length == 0) {
        var language = sessionStorage.getItem('scrmLanguage') ? sessionStorage.getItem('scrmLanguage').toLowerCase() : 'EN';
        $.ajax({
            type: "POST",
            url: mvcHost + '/mvc' + campaign + '/api/GetNationalityMarketProfile',
            crossDomain: true,
            contentType: "application/json",
            data: JSON.stringify({
                Lang: language,
                Agent_Id: loginId,
                Token: token
            }),
            dataType: 'json'
        }).always(function (r) {
            var rDetails = r.details || '';
            if (!/^success$/i.test(r.result || "")) {
                console.log('error: ' + rDetails ? rDetails : r);
            } else {
                nationalityArr = rDetails.NationalityArray;
                marketArr = rDetails.MarketArray;
                profileArr = rDetails.ProfileArray;
                console.log('nationalityArr');
                console.log(nationalityArr);
                sessionStorage.setItem('scrmNationalityArr', JSON.stringify(nationalityArr));
                sessionStorage.setItem('scrmMarketArr', JSON.stringify(marketArr));
                sessionStorage.setItem('scrmProfileArr', JSON.stringify(profileArr));
                addAreaOptions();
            }
        });
    } else {
        addAreaOptions();
    }
    // system tools add section
    if (openType == 'traditional' && haveSystemTools) {
        var parentDoc = parent.document;
        if (callType == 'Inbound_Email') {
            if ($('#repeated-customer-header', window.parent.document).css('display') == 'inline') {
                var repeatedCustomer = $('#repeated-customer');
                repeatedCustomer.prop('checked', true);
                // repeatedCustomer.prop('disabled', true);
                var theRemark = parentDoc.getElementById('repeated-customer-header').title || '';
                $('#repeated-customer-remarks').val(theRemark); //.prop('disabled', true);
                updatedCustomerData["Repeated_Customer_Remarks"] = theRemark;
            }
            if ($('#difficult-customer-header', window.parent.document).css('display') == 'inline') {
                var difficultCustomer = $('#difficult-customer')
                difficultCustomer.prop('checked', true);
                var theRemark = parentDoc.getElementById('difficult-customer-header').title || '';
                $('#difficult-customer-remarks').val(theRemark);
                updatedCustomerData["Difficult_Customer_Remarks"] = theRemark;
            }
            // $('#system-tool-email').show();
        } else if (callType == 'Inbound_Call' || callType == 'Inbound_Fax' || callType == 'Inbound_Voicemail') {
            if ($('#repeated-caller-header', window.parent.document).css('display') == 'inline') {
                var repeatedCaller = $('#repeated-caller');
                repeatedCaller.prop('checked', true);
                console.log('parentDoc');
                console.log(parentDoc);
                console.log("parentDoc.getElementById('repeated-caller-header')");
                console.log(parentDoc.getElementById('repeated-caller-header'));
                console.log("parentDoc.getElementById('repeated-caller-header').title");
                console.log(parentDoc.getElementById('repeated-caller-header').title);
                var theRemark = parentDoc.getElementById('repeated-caller-header').getAttribute('data-original-title') || '';
                // var theRemark = parentDoc.getElementById('repeated-caller-header').title || '';
                console.log('theRemark');
                console.log(theRemark);
                $('#repeated-caller-remarks').val(theRemark); //.prop('disabled', true);
                console.log("$('#repeated-caller-remarks')");
                console.log($('#repeated-caller-remarks'));
                updatedCustomerData["Repeated_Caller_Remarks"] = theRemark;
            }
            if ($('#difficult-caller-header', window.parent.document).css('display') == 'inline') {
                var difficultCaller = $('#difficult-caller')
                difficultCaller.prop('checked', true);
                var theRemark = parentDoc.getElementById('difficult-caller-header').getAttribute('data-original-title') || '';
                // var theRemark = parentDoc.getElementById('difficult-caller-header').title || '';
                $('#difficult-caller-remarks').val(theRemark); //.prop('disabled', true);
                updatedCustomerData["Difficult_Caller_Remarks"] = theRemark;
            }
            // $('#system-tool-call').show();
        }
    }
    resize(true);
    if (caseNo != -1) {
        $('#scheduled-reminder').show();
        if ($('#case-no-span').length == 0) {
            $('<span id="case-no-span" class="ms-3"><label class="mt-3">' + langJson['l-search-case-no'] + ':</label>&nbsp;' + caseNo + '</span>').insertAfter($('#customer-id'));
        }
    }
}
// windowOnload end
function addAreaOptions() {
    for (let nationOpt of nationalityArr) {
        $('#Nationality_Id').append('<option value=' + nationOpt.NationalityID + ' market-id=' + nationOpt.MarketID + ' profile-id=' + nationOpt.ProfileID + ' >' + nationOpt.NationalityName + '</option>');
    }

    for (let marketOpt of marketArr) {
        $('#Market_Id').append('<option value=' + marketOpt.MarketID + '>' + marketOpt.MarketName + '</option>');
    }

    for (let profileOpt of profileArr) {
        $('#Profile_Id').append('<option value=' + profileOpt.ID + '>' + profileOpt.Profile + '</option>');
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
}

function callOnkeydown() { // if pressed Enter, equal pressed Dial button
    if (window.event.keyCode == 13) {
        replySubmitClicked();
    }
}

//function validateEmail(email) {
//    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//    return re.test(String(email).toLowerCase());
//}
// 20250325 for Simplify this regular expression to reduce its complexity from 34 to the 20 allowed.
function validateEmail(email) {
    var localPartRe = /^([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*|(".+"))$/;
    

    // 20250408 Use concise character class syntax '\d' instead of '[0-9]'.
    //var domainIpRe = /^\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\]$/; // Matches an IPv4 address
    var domainIpRe = /^\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]$/; // Matches an IPv4 address

    var domainNameRe = /^(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/; // Matches domain names


    const [localPart, domainPart] = email.split('@'); // Split email by '@'

    // Validate local part and domain part separately
    return (
        localPartRe.test(localPart) &&
        (domainIpRe.test(domainPart) || domainNameRe.test(domainPart)) // Check either IP or domain name
    );
}
function updateClicked(isTemp) {
    // verifyEmail
    var email = document.getElementById('Email').value || ''
    if (email.length > 0 && !gf.verifyIsEmailValid(email)) {
        alert('Email is invalid');
        $('#Email').focus();
        return;
    }
    // update customer
    var Customer_Data = {
        // Gender: document.getElementById('Gender').innerHTML || '',
        Title: document.getElementById('Title').value || '',
        Lang: document.getElementById('Lang').value || '',
        Name_Eng: document.getElementById('Name_Eng').value || '',
        Mobile_No: document.getElementById('Mobile_No').value || '',
        // Home_No: document.getElementById('Home_No').value || '',
        // Office_No: document.getElementById('Office_No').value || '',
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
    // verify name cannot which cannot be blank
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
            // turn to disable mode
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
                            // $('#reply-fax-container').show();
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
                            // $('#reply-email-container').show();
                        }
                        break;
                    default:
                        break;
                }
                var replyChoice = document.getElementById('.' + '_edit');
                if (value != null && value.length > 0) {
                    $('.c' + fieldId).show();
                } else {
                    $('.c' + fieldId).hide();
                }
            }
            // update system tools
            // add junk mail if needed
            // var junkMail = document.getElementById('Is_Junk_Mail');
            var repeatedCustomer = document.getElementById('repeated-customer');
            var difficultCustomer = document.getElementById('difficult-customer');
            var repeatedCaller = document.getElementById('repeated-caller');
            var difficultCaller = document.getElementById('difficult-caller');

            var repeatedCustomerHeaderDisplay = $('#repeated-customer-header', window.parent.document).css('display')
            var difficultCustomerHeaderDisplay = $('#difficult-customer-header', window.parent.document).css('display')
            var repeatedCallerrHeaderDisplay = $('#repeated-caller-header', window.parent.document).css('display')
            var difficultCallerHeaderDisplay = $('#difficult-caller-header', window.parent.document).css('display')

            if (repeatedCustomerHeaderDisplay == 'inline' && repeatedCustomer.checked) {
                delEmailSetting('Repeated Customer', true);
            }
            if (difficultCustomerHeaderDisplay == 'inline' && difficultCustomer.checked) {
                delEmailSetting('Difficult Customer', true);
            }
            if (repeatedCallerrHeaderDisplay == 'inline' && repeatedCaller.checked) {
                updateCallerSetting('Repeated Caller', 'Y');
            }
            if (difficultCallerHeaderDisplay == 'inline' && difficultCaller.checked) {
                updateCallerSetting('Difficult Caller', 'Y');
            }
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
    $('#customer-id-section').hide();
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

function longCallChanged(oThis) {
    console.log('oThis');
    console.log(oThis);
    console.log("'$(this).prop('checked')'");
    console.log($(oThis).prop('checked'));
    if ($(oThis).prop('checked')) {
        $('#Long_Call_Reason').prop('disabled', false);
    } else {
        $('#Long_Call_Reason').val('').prop('disabled', true);
    }
}

function returnToSearch() {
    parent.returnToSearch(ticketId || connId);
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
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());