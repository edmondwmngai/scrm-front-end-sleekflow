var fileObj = {};
var fl = [];
var type = '';
var cannedMsgs = [];
var waTPArr = [];
var listTable;
var campaign = '';
var customCompany = sessionStorage.getItem('scrmCustomCompany') || 'no';
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var wiseHost = config.wiseHost;

if (window.opener == null || sessionStorage.getItem('scrmLoggedIn') == null) {
    window.location.href = 'login.html';
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
/*
function get_folder_files(file_type, title, param_path) {
    // v.0.1.2
    var path = "";
    if (!param_path) {
        var tmp_file = File.openDialog(title, file_type);
        if (!tmp_file) { exit(); }
        path = tmp_file.path;
    } else { path = param_path; }

    var my_folder = new Folder(path);
    return my_folder.getFiles(file_type);
};*/

function selectClicked(index) {

    // get current chat campaign
    var windowOpener = window.opener;
    if (windowOpener) {
       // var presentTicketId = windowOpener.presentTicketId;
        if (type == 'msg') {

              //<textarea class="reply-textarea" id="replyTextarea" 

            var replyTextarea = windowOpener.$('#replyTextarea');
            var replyMsg = replyTextarea.val() || '';
            replyTextarea.val(replyMsg + cannedMsgs[index]);
            window.close();
        } else if (type == 'file') {
            // type == 'file'
            var rows = listTable.rows({ 'search': 'applied' }).nodes();
            var selectedCheckbox = $('input[type="checkbox"]:checked', rows);
            if (selectedCheckbox.length == 0) {
                alert(langJson['l-social-select-file-send']);
                return;
            }

            //var entry = windowOpener.$('#reply-btn-' + presentTicketId).attr('entry');


            

            // This is a fb fan page
            var msgIdArr = [];
            var commentIdArr = [];
            var selectedMsgs;

            var entry = "";
            if (entry == 'fb_comment') {

                // verify have selected any comments
                var selectedMsgs = windowOpener.$('#content-inner-scroll-' + presentTicketId).find('.selected-row');
                if (selectedMsgs != undefined && selectedMsgs.length > 0) {
                    for (let theSelected of selectedMsgs) {
                        var selectedMsg = $(theSelected);
                        var msgId = selectedMsg.attr('msgId');
                        msgIdArr.push(msgId);
                        commentIdArr.push(selectedMsg.attr('commentId'));
                    }
                }

                if (msgIdArr == null || msgIdArr.length == 0) {
                    alert(langJson['l-alert-not-selected-comment']);
                    return;
                }
            }

            for (var i = 0; i < selectedCheckbox.length; i++) {
                var theFile = listTable.row(selectedCheckbox[i].closest('tr')).data();

                if (theFile == null)
                {
                    alert("Please resend again");
                }

                /*
                //var fileName = theFile.FileName;
                //var fileUrl = theFile.FileUrl.toLowerCase();
                //var fileId = theFile.FileId;
                //var findType = theFile.ContentType;*/  // 20250415 Remove the declaration of the unused variable.

                var filePath = theFile.FilePath;

                // if entry is not fb_comment
                if (entry != 'fb_comment') {
                    $('#loading-icon-section').removeClass('d-none');
                    $('.temp-disabled-btn').prop('disabled', true);

                    //windowOpener.createOrUpdateBubble({ 'ticket_id': presentTicketId, 'msg_list': [{ 'nick_name': windowOpener.agentName, 'send_by_flag': 1, 'sent_time': windowOpener.getSqlFormatTime(), 'msg_object_path': fileUrl, 'msg_object_client_name': fileName }] });
                    //windowOpener.sendSocialFile(presentTicketId, filePath, null);

                    //var delay = 1000;     // 20250415 Remove the declaration of the unused variable.
                    //setTimeout(function () {
                      //  window.opener.chatService.sendCannedFile(fileId, fileName, findType);
                    //}, i * delay);
                    
                    windowOpener.chatService.selectedCannedFiles.push(theFile);

                    if (i == selectedCheckbox.length - 1) {
                        window.close();                        
                    }
                } else {

                    // fb_comment here
                    $('#loading-icon-section').removeClass('d-none');
                    $('.temp-disabled-btn').prop('disabled', true);

                    // Check has the ticket ended first, as if the ticket is ended, send message will make the conversation active again
                    if (!windowOpener.$('#end-' + presentTicketId).attr('disabled')) {

                        // if send all in one time I found will have error
                        var msgIdArrLength = msgIdArr.length;
                        if (msgIdArrLength == 1) {
                            windowOpener.sendSocialFile(presentTicketId, filePath, msgIdArr, commentIdArr);
                            setTimeout(function (p) {
                                windowOpener.getFBComments(p.presentTicketId, p.commentIdArr, 0);
                                window.close();
                            }.bind(this, { presentTicketId: presentTicketId, commentIdArr: commentIdArr }), 1000);
                        } else {

                            // if sent to mulitple comments can have issue
                            windowOpener.sendSocialFile(presentTicketId, filePath, [msgIdArr[0]], [commentIdArr[0]]);
                            for (var j = 1; j < msgIdArrLength; j++) {
                                setTimeout(function (p) {
                                    windowOpener.sendSocialFile(p.presentTicketId, p.filePath, [p.msgId], [p.commentId]);
                                    if (p.lastIdx === true) {
                                        windowOpener.getFBComments(p.presentTicketId, p.commentIdArr, 0);
                                        window.close();
                                    }
                                }.bind(this, { presentTicketId: presentTicketId, filePath: filePath, msgId: msgIdArr[j], commentId: commentIdArr[j], commentIdArr: commentIdArr, lastIdx: (i == (selectedCheckbox.length - 1) && j == (msgIdArrLength - 1)) }), j * 1000);
                            }
                        }
                    }

                }
            }
        } else if (type == 'wa-template') {

            // verify all props filled
            var whatsappNo = (window.name == 'custSendWA' || window.name == 'marketingWA' || window.name == 'reply-container') ? null : windowOpener.$('#phone-' + windowOpener.presentTicketId).text();
            var tpPropsArr = [];
            var theTemplate = waTPArr[index];
            var tpId = theTemplate.id;
            var imgField = $('#file-to-upload-' + tpId)

            $('#display-msg-' + tpId).find(":text").each(function (idx, ele) { // ":text" = input which type = text
                tpPropsArr.push($(ele).val());
            });

            if (imgField.length > 0) {
                var fileUpload = imgField.get(0);
                var fileUploadFiles = fileUpload.files;
                if (fileUploadFiles.length == 0) {
                    alert('You have to upload an image');
                    return
                } else {
                    uploadTpFile(campaign, whatsappNo, index, tpPropsArr, fileUploadFiles[0]);
                }
            } else {
                var crmText = theTemplate.crm;
                var msg_content = crmText.replace(/\{\{1}}/g, tpPropsArr[0]).replace(/\{\{2}}/g, tpPropsArr[1]).replace(/\{\{3}}/g, tpPropsArr[2]).replace(/\{\{4}}/g, tpPropsArr[3]).replace(/\{\{5}}/g, tpPropsArr[4]);
                var msg_type = theTemplate.type;
                if (window.name == 'custSendWA' || window.name == 'marketingWA' || window.name == 'reply-container') {

                    // clone he selected row to opener container
                    var waContainerStr = (
                        '<div class="form-check form-check-radio ms-4"><label class="form-check-label" for="tp-5"><input checked class="form-check-input" type="radio" name="tp" id="tp-' + tpId + '" value="' + tpId + '" props=' + tpPropsArr.length + '>Selected Template ID: ' + tpId + '</div><span class="circle"><span class="check"></span></span></label></div>'
                    )

                    // NO DEL: just display of method in input form different
                    for (var i = 0; i < tpPropsArr.length; i++) {
                        waContainerStr += '<input id="tpl-content-' + i + '" type="text" value="' + tpPropsArr[i] + '" class="d-none" />'
                        // waContainerStr += '<div><label>Prop ' + (i + 1) + ':&nbsp;&nbsp;&nbsp;</label><input id="tpl-content-' + i + '" type="text" value="' + tpPropsArr[i] + '" class="w-50" /></div>'
                    }
                    // NO DEL: just display of method in input form different

                    if (msg_type == 'tp_qr') {
                        waContainerStr += SC.handleWATpQRMsg(msg_content, null, tpId).text;
                    } else if (msg_type == 'tp_cta') {
                        waContainerStr += SC.handleWATpCTAMsg(msg_content, null, tpId).text;
                    } else {
                        waContainerStr += ('<div class="ms-5">' + msg_content + '</div>');
                    }

                    if (window.name == 'custSendWA') {
                        waContainerStr += ('<div class="mb-3 text-center"><button id="send-tp-btn" class="btn rounded btn-sm btn-warning mt-3 mb-0 text-capitalize" onclick="sendTP()" data-original-title="" title=""><i class="fas fa-paper-plane me-2"></i><span class="align-middle">Send</span></button></div>');
                        if (windowOpener.customerTable.column(8)) {
                            windowOpener.customerTable.column(8).visible(true);
                        }
                    }
                    windowOpener.$('#send-wa-section').empty().append(waContainerStr);

                    if (window.name == 'custSendWA' || window.name == 'reply-container') { windowOpener.resize(); }
                    windowOpener.$('#selected-tp-id').val(tpId);
                    windowOpener.$('#selected-tp-props').val(tpPropsArr);
                    windowOpener.replyConfirmed = true;
                    window.close();
                    return;
                } else {
                    var loginId = windowOpener.loginId || parseInt(sessionStorage.getItem('scrmAgentId') || -1);
                    var thisBtn = $('.btn-info:eq(' + index + ')');
                    thisBtn.hide()
                        .after('<span id="loading-' + index + '"><span><div id="circularG"><div id="circularG_1" class="circularG"></div><div id="circularG_2" class="circularG"></div><div id="circularG_3" class="circularG"></div>' +
                            '<div id="circularG_4" class="circularG"></div><div id="circularG_5" class="circularG"></div><div id="circularG_6" class="circularG"></div><div id="circularG_7" class="circularG"></div><div id="circularG_8" class="circularG"></div></div><span>&nbsp;&nbsp;Sending...</span>');
                    windowOpener.parent.document.getElementById("phone-panel").contentWindow.wiseSendWhatsAppMsgEx(campaign, whatsappNo, tpId, tpPropsArr, function (replyObj) {
                        $('#loading-' + index).remove();
                        if (replyObj.resultID == "4") {

                            windowOpener.createOrUpdateBubble({
                                'ticket_id': replyObj.ticket_id[0],
                                'entry': 'whatsapp',
                                'msg_list': [{ id: replyObj.msg_id, 'nick_name': loginId, 'send_by_flag': 1, msg_type: msg_type, 'sent_time': windowOpener.getSqlFormatTime(), 'msg_object_path': null, 'msg_object_client_name': null, msg_content: msg_content }]
                            });
                            window.close();
                        } else {
                            var alertStr = 'Send failed'
                            if (replyObj.msg) {
                                alertStr += ('\n' + replyObj.msg);
                            }
                            alert(alertStr);
                        }
                    });
                }
            }
        }
    }
}

function uploadTpFile(campaign, whatsappNo, index, tpPropsArr, input) {
    var windowOpener = window.opener;
    // if open browse file window but did not choose any file, will reply input undefined
    if (input == undefined) { return; }
    // verify did select file before upload for fb comment
    var limitedSizeMB = 10; // default limit 10MB

    // verify file size
    if (input.size / 1024 / 1024 > limitedSizeMB) {
        alert('Image size cannot exceed' + limitedSizeMB + 'MB');
        // clear file
        var fileInput = $('#file-to-upload-' + tpId);
        fileInput.replaceWith(fileInput.val('').clone(true));
        // reset picture to original
        $('#display-msg-' + tpId).find('.wa-card-img-container').empty().append('<i class="fas fa-image wa-card-img"></i>');
        return;
    }
    var theTemplate = waTPArr[index];
    var tpId = theTemplate.id;
    var imgName = input.name == undefined ? '' : input.name;
    //imgName = imgName.replace(/[ |+|#]/g, '_').replace('%20', '_').replace(/[%']/g, '');      // 20250408 Remove duplicates in this character class.
    imgName = imgName.replace(/[ +#]/g, '_').replace(/%20/g, '_').replace(/[%']/g, '');


    var loginId = windowOpener.loginId || parseInt(sessionStorage.getItem('scrmAgentId') || -1);
    var fileData = new FormData();
    var ticketId = (window.name == 'custSendWA' || window.name == 'marketingWA' || window.name == 'reply-container') ? new Date().valueOf() : windowOpener.presentTicketId; // as if open by input form or bluk upload should be 
    fileData.append("files", input, imgName);
    fileData.append('agentId', loginId);
    fileData.append('ticketId', ticketId);
    $.ajax({
        type: "POST",
        url: config.wiseUrl + '/api/SocialMedia/UploadFile',
        data: fileData,
        contentType: false, // Not to set any content header  
        processData: false, // Not to process data  
        dataType: 'multipart/form-data'
    }).always(function (r) {
        var response = JSON.parse(r.responseText);
        if (!/^success$/i.test(response.result || "")) {
            console.log("Error in UploadAttachment." + r);
        } else {
            var fileDetails = response.data[0];
            // TBD do it jsut because hard coded, asked Tiger to be not hard code on 2021-06-01
            //if (config.isHttps) {     //20250411 should not be currently used which is replaced by fileDetails.FileUrl
            //    voiceUrl = voiceUrl.replace(voiceUrl.substr(0,voiceUrl.indexOf("/wisepbx/")), wiseHost);
            //}
            // /TBD

            //12/7/2021 Raymond add prefix http://
            //fileDetails.FileUrl = 'http://' + fileDetails.FileUrl;    //20250416 Using http protocol is insecure. Use https instead.

            var fileStr = (fileDetails.FilePath + ',' + fileDetails.FileUrl);
            var crmProps = [fileDetails.FileUrl].concat(tpPropsArr.slice())
            tpPropsArr.unshift(fileStr);
            var msg_type = theTemplate.type;
            var crmText = theTemplate.crm;
            var msg_content = crmText.replace(/\{\{1}}/g, crmProps[0]).replace(/\{\{2}}/g, crmProps[1]).replace(/\{\{3}}/g, crmProps[2]).replace(/\{\{4}}/g, crmProps[3]).replace(/\{\{5}}/g, crmProps[4]);
            if (window.name == 'custSendWA' || window.name == 'marketingWA' || window.name == 'reply-container') {
                var waContainerStr = (
                    '<div class="form-check form-check-radio ms-4"><label class="form-check-label" for="tp-5"><input checked class="form-check-input" type="radio" name="tp" id="tp-' + tpId + '" value="' + tpId + '" props=' + tpPropsArr.length + '>Selected Template ID: ' + tpId + '</div><span class="circle"><span class="check"></span></span></label></div>'
                )
                for (var i = 0; i < tpPropsArr.length; i++) {
                    // NO DEL: just prsent method different: waContainerStr += '<div><label>Prop ' + (i + 1) + ':&nbsp;&nbsp;&nbsp;</label><input id="tpl-content-' + i + '" type="text" value="' + tpPropsArr[i] + '" class="w-50" /></div>'
                    waContainerStr += '<input id="tpl-content-' + i + '" type="text" value="' + tpPropsArr[i] + '" class="d-none" />'
                }
                if (msg_type == 'tp_qr') {
                    waContainerStr += SC.handleWATpQRMsg(msg_content, null, tpId).text;
                } else if (msg_type == 'tp_cta') {
                    waContainerStr += SC.handleWATpCTAMsg(msg_content, null, tpId).text;
                }
                if (window.name == 'custSendWA') {
                    waContainerStr += ('<div class="mb-3 text-center"><button id="send-tp-btn" class="btn rounded btn-sm btn-warning mt-3 mb-0 text-capitalize" onclick="sendTP()" data-original-title="" title=""><i class="fas fa-paper-plane me-2"></i><span class="align-middle">Send</span></button></div>');
                    if (windowOpener.customerTable.column(8)) {
                        windowOpener.customerTable.column(8).visible(true);
                    }
                }

                windowOpener.$('#send-wa-section').empty().append(waContainerStr);
                if (window.name == 'custSendWA' || window.name == 'reply-container') {
                    windowOpener.resize();
                }
                windowOpener.$('#selected-tp-id').val(tpId);
                windowOpener.$('#selected-tp-props').val(tpPropsArr);
                windowOpener.replyConfirmed = true;
                window.close();
            } else {
                var thisBtn = $('.btn-info:eq(' + index + ')');
                thisBtn.hide()
                    .after('<span id="loading-' + index + '"><span><div id="circularG"><div id="circularG_1" class="circularG"></div><div id="circularG_2" class="circularG"></div><div id="circularG_3" class="circularG"></div>' +
                        '<div id="circularG_4" class="circularG"></div><div id="circularG_5" class="circularG"></div><div id="circularG_6" class="circularG"></div><div id="circularG_7" class="circularG"></div><div id="circularG_8" class="circularG"></div></div><span>&nbsp;&nbsp;Sending...</span>');
                windowOpener.parent.document.getElementById("phone-panel").contentWindow.wiseSendWhatsAppMsgEx(campaign, whatsappNo, tpId, tpPropsArr, function (replyObj) {
                    $('#loading-' + index).remove();
                    if (replyObj.resultID == "4") {
                        windowOpener.createOrUpdateBubble({
                            'ticket_id': replyObj.ticket_id[0],
                            'entry': 'whatsapp',
                            'msg_list': [{ id: replyObj.msg_id, 'nick_name': loginId, 'send_by_flag': 1, msg_type: msg_type, 'sent_time': windowOpener.getSqlFormatTime(), 'msg_object_path': null, 'msg_object_client_name': null, msg_content: msg_content }]
                        });
                        window.close();
                    } else {
                        var alertStr = 'Send failed'
                        if (replyObj.msg) {
                            alertStr += ('\n' + replyObj.msg);
                        }
                        alert(alertStr);
                    }
                });
            }
        }
    });
}

function loadCheckboxActions(allCheckboxes, selectAllId) {
    // the allCheckBoxes not include the select all check box
    $(allCheckboxes).on('change', 'input[type=checkbox]', function (event) {
        // caching the changed element:
        var changed = event.target,
            // caching:
            checkboxes = $(allCheckboxes)
                // <input> elements within the #' + idType + '-section of type=checkbox:
                .find('input[type=checkbox]')
                // which do not match the '#' + idType + '-emails' selector:
                .not(selectAllId);
        // if the changed element has the id of '' + idType + '-emails':
        if (changed.id === selectAllId) {
            // we update the 'checked' property of the cached check-box inputs to reflect the checked stat of the '#' + idType + '-emails' element:
            checkboxes.prop('checked', changed.checked);
        } else {
            // here we check that the number of checked checkboxes is equal to the number of check-boxes (effectively
            // finding out whether all, or not-all, check-boxes are checked:
            var allChecked = checkboxes.length === checkboxes.filter(':checked').length

            // here we update the 'checked' property of the
            // '' + idType + '-emails' check-box to true (if the number of checked check-boxes is equal to the
            // number of check-boxes) or false (if the number of checked check-boxes is not equal to the
            // number of check-boxes):
            $(selectAllId).prop(
                'checked', allChecked
            );
        }
    });
    // click "All..." checkboxes will check/uncheck all the values
    $(selectAllId).change(function () {
        $(allCheckboxes + ' input[type="checkbox"]').prop('checked', $(this).prop("checked"))
    });
}

function setLanuage() {
    // $('.l-general-confirm').text(langJson['l-general-confirm']);
    $('.l-general-cancel').text(langJson['l-general-cancel']);
}

function closeWindow() {
    window.close();
}
/*
function previewPhoto(input, tpId) {
    var photoFile = input.files[0];
    if (input.files && photoFile) {
        // verify file type
        if (photoFile.type != 'image/jpeg' && photoFile.type != 'image/png') {
            alert('Upload failed. Acceept JPEG and PNG file only'); // gif is not allowed in whatsapp
            // clear file
            var fileInput = $('#file-to-upload-' + tpId)
            fileInput.replaceWith(fileInput.val('').clone(true));
            // reset picture to original
            $('#display-msg-' + tpId).find('.wa-card-img-container').empty().append('<i class="fas fa-image wa-card-img"></i>');
            return;
        }
        // verify file size
        var limitedSizeMB = 10; // default limit 2MB
        if (photoFile.size / 1024 / 1024 > limitedSizeMB) {
            alert(langJson['l-alert-photo-size-cannot-exceed'] + limitedSizeMB + 'MB');
            // clear file
            var fileInput = $('#file-to-upload-' + tpId)
            fileInput.replaceWith(fileInput.val('').clone(true));
            return;
        }
        // show preview
        var reader = new FileReader();
        reader.onload = function (e) {

            //20250402 'e.target.result' may use Object's default stringification format ('[object Object]') when stringified.
            const url = e.target.result;

            if (typeof url !== 'string') {
                console.error('The image data is not a valid string.', url);
                return;
            }
            //-----------------------------------------

            // to make the image styhle looks like whatsapp
            var img = new Image();
            img.onload = function () {
                var widthHeightClass; // whatsapp image sometimes will be w-100, somtimes h-100, decide by thei width, height
                if (this.width > this.height && this.height < 201) {
                    widthHeightClass = 'h-100'
                } else {
                    widthHeightClass = 'w-100'
                }
                //$('#display-msg-' + tpId).find('.wa-card-img-container').empty().append('<img class="wa-preview-img ' + widthHeightClass + '" src="' + e.target.result + '"/>');  //20250403 'e.target.result' update
                $('#display-msg-' + tpId).find('.wa-card-img-container').empty().append('<img class="wa-preview-img ' + widthHeightClass + '" src="' + url + '"/>');
            };
            //img.src = e.target.result;    //20250403 'e.target.result' update
            img.src = url;
        }
        reader.readAsDataURL(photoFile);
    }
}*/

$(document).ready(function () {
    // if (typeof (window.opener) == 'undefined' || typeof(window.opener.popupCampaign) == 'undefined' ) {
    if (typeof (window.opener) == 'undefined') {
        alert('Session Timeout');
        window.close();
    }
    campaign = customCompany == 'no' ? window.opener.popupCampaign : customCompany;

    setLanuage();
    type = getParameterByName('type'); // 'file' or 'msg'

    if (customCompany == 'no') {
        $('#campaign-logo').append('<img class="company-logo" src="./campaign/' + campaign + '/logo.png" />');
    }

    $('#select-msg').text(langJson['l-social-message-send-title']);
    // var script = document.createElement('script');   // 20250415 Remove the declaration of the unused variable.
    // the data should be JSON.stringify({ "companyName": campaign }), however, for Demo Tiger just build HKTB

    if (type == 'msg') {
        $.ajax({
            type: "POST",
            url: config.wiseUrl + '/api/SocialMedia/GetCannedMsgs',
            data: JSON.stringify({ "companyName": 'HKTB' }),

            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (r) {
                if (!/^success$/i.test(r.result || "")) {
                    console.log('error in socialPopup');
                } else {
                    cannedMsgs = r.data;
                    var fileContainer = $('#file-list-table');
                    if (cannedMsgs != null && cannedMsgs.length > 0) {
                        for (var i = 0; i < cannedMsgs.length; i++) {
                            var selectClickedFn = "selectClicked(" + i + ")";
                            var displayMsg = cannedMsgs[i].replace(/</g, '&lt;').replace(/>/g, '&gt;'); // to avoid text in <> not being displayed
                            fileContainer.append('<tr class="row-container"><td class="canned-cell">' + displayMsg + '</td><td class="btn-cell"><button class="btn btn-sm rounded btn-info text-capitalize" onclick=' + selectClickedFn + '><i class="fas fa-mouse-pointer me-2"></i><span>' + langJson['l-campaign-select'] + '</span></button></td></tr>')
                        }
                    }
                }
            },
            
            error: function (r) {
                console.log('error in socialPopup');
                console.log(r);
            }
        });
    } else if (type == 'file') {
        $('#select-msg').text(langJson['l-social-file-send-title']);
        $('#sp-btn-group').prepend('<button class="btn rounded btn-sm btn-warning mt-3 mb-0 text-capitalize temp-disabled-btn" onclick="selectClicked()"><i class="fas fa-save me-2"></i><span>' + langJson['l-general-confirm'] + '</span></button>');
        // the data should be JSON.stringify({ "companyName": campaign }), however, for Demo Tiger just build HKTB


            // url: config.wiseUrl + '/api/SocialMedia/GetCannedFiles',
            //data: JSON.stringify({ "companyName": 'HKTB' }),
			// url: config.cannedFilesUrl + "/socialmedia/GetCannedFiles",
          
        $.ajax({
            type: "POST",
            url: config.shandlerapi + "/api/GetCannedFiles",
            crossDomain: true,
            data: JSON.stringify({ "Company": 'EPRO'}),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (r) {
                if (!/^success$/i.test(r.result || "")) {
                    console.log('error in socialPopup');
                } else {
                    var tableData = r.details;
                    listTable = $('#file-list-table').DataTable({
                        data: tableData,
                        lengthChange: false,
                        aaSorting: [],
                        searching: false,
                        paging: false,
                        info: false,
                        columnDefs: [{
                            'targets': 1,
                            'searchable': false,
                            'orderable': false,
                            'render': function (data, type, row) {
                                var fileName = row.FileName;
                                var extension = fileName.slice(fileName.indexOf('.') + 1).toLowerCase();;
                                if (extension == 'jpg' || extension == 'gif' || extension == 'png') {
                                    return '<img class="img-in-cell" src="' + data + '" />';
                                } else {
                                    return '' + extension + '&nbsp;' + langJson['l-social-file'];
                                }
                            }
                        },
                        {
                            'targets': -1,
                            'searchable': false,
                            'className': 'btnColumn',
                            'orderable': false,
                            'render': function (data, type, full, meta) {
                                return '<div class="form-check" style="margin-top:-8px">' +
                                    '<label class="form-check-label">' +
                                    '<input class="form-check-input" type="checkbox" id="' + data + '" value="' + data + '">' +
                                    '<span class="form-check-sign"><span class="check" data-bs-toggle="tooltip" data-bs-placement="right" title="' + langJson["l-email-change-admin"] + '"></span></span></label></div>';
                            }
                        }
                        ],
                        columns: [{ title: langJson['l-social-file-name'], data: "FileName" },
                        { title: langJson['l-social-file'], data: 'FileUrl' },
                        {
                            title: '<div class="form-check" style="margin-top:-8px">' +
                                '<label class="form-check-label">' +
                                '<input id="select-all" class="form-check-input" type="checkbox">' +
                                '<span class="form-check-sign"><span class="check"></span></span></label></div>',
                            data: null
                        }
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
                        }
                    });

                    var totalRecordLength = tableData.length;

                    $('#file-list-table').on('click', '.form-check', function (e) {
                        e.stopPropagation();
                        var rows = listTable.rows({ 'search': 'applied' }).nodes();
                        var selectedRows = $('input[type="checkbox"]:checked', rows);
                        if (selectedRows.length == totalRecordLength) {
                            $('#select-all').prop('checked', true);
                        } else {
                            $('#select-all').prop('checked', false);
                        }
                        if (selectedRows.length > 0) {
                            $('.temp-disabled').prop('disabled', false);
                        } else {
                            $('.temp-disabled').prop('disabled', true);
                        }
                    });

                    // Handle click on "Select all" control
                    $('#select-all').on('click', function () {
                        // Get all rows with search applied
                        var rows = listTable.rows({ 'search': 'applied' }).nodes();

                        // Check/uncheck checkboxes for all rows in the table
                        var selectedAllChecked = this.checked;
                        $('input[type="checkbox"]', rows).prop('checked', selectedAllChecked);
                        if (selectedAllChecked) {
                            $('.temp-disabled').prop('disabled', false);
                        } else {
                            $('.temp-disabled').prop('disabled', true);
                        }
                    });
                }
            },
            error: function (r) {
                console.log('error in socialPopup');
                console.log(r);
            }
        });
    } 
	
	/*else if (type == 'wa-template') {
        // To do: API to get whtsapp template
        // To do: new web socket command to upload media to Emma
        // no of props without picture

        // TBD existing only because of 112
        if (config.isHttps) {
            if (config.isEmma) {
                waTPArr = [
                    { id: 17, props: 0, type: 'tp_text', crm: 'Thank you for your inquiry, please reply to continue the conversation' },
                    { id: 18, props: 0, type: 'tp_text', crm: '你好，謝謝您的查詢，請回覆以繼續對話' },
                    { id: 15, props: 3, type: 'tp_cta', crm: '{"img":"{{1}}","txt": "感謝您成為會員，{{2}}", "btns": [{"type": "hotline", "display": "查詢熱線"},{"type": "website", "display": "網頁","url":{"no": "{{3}}", "link": "http://202.64.83.112/redirect?url="}}]}' },
                    { id: 20, props: 0, type: 'tp_qr', crm: '{"img":"{{1}}","txt":"{{2}}Thank you for your support, {{3}}","btns": ["Yes(A01)", "No","Will Confirm Later"]}' },
                    { id: 19, props: 2, type: 'tp_qr', crm: '{"img":"{{1}}","txt":"謝謝您的支持，{{2}}","btns": ["我想知道更多(A01)", "暫時不用，謝謝","遲D再回覆你"]}' },
                    { id: 16, props: 3, type: 'tp_qr', crm: '{"img":"{{1}}","txt":"{{2}}\\n\\n{{3}}\\n\\n如您不希望再透過WhatsApp接收訊息，請回覆「取消訂閱」","btns": ["立即續保", "不需要續保"]}' }
                ];
            } else {

                // 112 twilio
                waTPArr = [
                    { id: 2, props: 2, type: 'tp_text', crm: 'Your appointment is coming up on {{1}} at {{2}}' },
                    { id: 1001, props: 2, type: 'tp_text', crm: '易寶通訊提醒你, 預約日期是{{1}}{{2}}。' },
                    { id: 5, props: 2, type: 'tp_text', crm: 'Case No: {{1}}<br/>Detail : {{2}}' },
                    { id: 1002, props: 1, type: 'tp_qr', crm: '{"txt":"Thank you for your support, {{1}}","btns": ["Yes", "No", "Will Confirm Later"]}' },
                    { id: 1003, props: 1, type: 'tp_qr', crm: '{"txt":"謝謝你的支持，{{1}}","btns": ["我想知道更多", "暫時不用", "遲D再回覆你"]}' },
                    { id: 1004, props: 2, type: 'tp_cta', crm: '{"txt":"Thank you for registering {{1}}. {{2}}","btns":[{"type":"hotline", "display":"Find Out More","num":39199686},{"type":"website","display":"Visit our Website","url":{"link":"http://www.eprotel.com.hk/en/index.php?back="}}]}' },
                    { id: 1005, props: 2, type: 'tp_cta', crm: '{"txt":"感謝您登記{{1}}。{{2}}。","btns":[{"type":"hotline","display":"查詢熱線","num":39199686},{"type":"website","display": "網頁","url":{"link": "http://www.eprotel.com.hk/ct/index.php"}}]}' }
                ];
            }
        //} else {  //20250410 'If' statement should not be the only statement in 'else' block
        } else if (config.isEmma) {
                waTPArr = [
                    { id: 6, props: 2, type: 'tp_text', crm: 'You made a purchase for {{1}} using a credit card ending in {{2}}' },
                    { id: 9, props: 2, type: 'tp_qr', crm: '{"img":"{{1}}","txt":"謝謝你的支持，{{2}}","btns":["我想知道更多(A01)","暫時不用","遲D再回覆你"]}' },
                    { id: 11, props: 3, type: "tp_cta", crm: '{"img":"{{1}}","txt": "感謝您登記成為會員，\\r\\n{{2}}", "btns": [{"type": "hotline", "display": "查詢熱線"},{"type": "website", "display": "網頁","url":{"no": "{{3}}", "link": "http://202.64.83.112/redirect?url="}}]}' },
                    // { id: 8, props: 2, type: 'tp_cta', crm: '{"img":"{{1}}","txt":"感謝您登記成為會員，\\r\\n{{2}}","btns":[{"type":"hotline","display":"查詢熱線"},{"type":"website","display":"網頁"}]}' },
                    { id: 7, props: 1, type: 'tp_qr', crm: '{"img":"{{1}}","txt":"This is buttons test template.", "btns":["Yes","No", "Will Confirm Later"]}' },
                    { id: 12, props: 2, type: 'tp_qr', crm: '{"img": "{{1}}", "txt": "Thank you for your support, {{2}}", "btns": ["Yes(A01)", "No", "Will Confirm Later"]}' },
                    { id: 13, props: 3, type: 'tp_qr', crm: '{"img": "{{1}}", "txt": "{{2}}Thank you for your support{{3}}", "btns": ["Yes(A01)", "No", "Will Confirm Later"]}' },
                    { id: 14, props: 5, type: 'tp_cta', crm: '{"img": "{{1}}", "txt": "{{2}}\\r\\n{{3}}\\r\\n{{4}}\\r\\n{{5}}\\r\\n如您不希望再透過WhatsApp接收訊息, 請按「取消訂閱」", "btns": [{"type": "website", "display": "取消訂閱"}]}' }
                ];
         } else {

                // 112 twilio
                waTPArr = [
                    { id: 2, props: 2, type: 'tp_text', crm: 'Your appointment is coming up on {{1}} at {{2}}' },
                    { id: 1001, props: 2, type: 'tp_text', crm: '易寶通訊提醒你, 預約日期是{{1}}{{2}}。' },
                    { id: 5, props: 2, type: 'tp_text', crm: 'Case No: {{1}}<br/>Detail : {{2}}' },
                    { id: 1002, props: 1, type: 'tp_qr', crm: '{"txt":"Thank you for your support, {{1}}","btns": ["Yes", "No", "Will Confirm Later"]}' },
                    { id: 1003, props: 1, type: 'tp_qr', crm: '{"txt":"謝謝你的支持，{{1}}","btns": ["我想知道更多", "暫時不用", "遲D再回覆你"]}' },
                    { id: 1004, props: 2, type: 'tp_cta', crm: '{"txt":"Thank you for registering {{1}}. {{2}}","btns":[{"type":"hotline", "display":"Find Out More","num":39199686},{"type":"website","display":"Visit our Website","url":{"link":"http://www.eprotel.com.hk/en/index.php?back="}}]}' },
                    { id: 1005, props: 2, type: 'tp_cta', crm: '{"txt":"感謝您登記{{1}}。{{2}}。","btns":[{"type":"hotline","display":"查詢熱線","num":39199686},{"type":"website","display": "網頁","url":{"link": "http://www.eprotel.com.hk/ct/index.php"}}]}' }
                ];
            //} // 20250410  for else if 
        }

        var fileContainer = $('#file-list-table');

        for (var i = 0; i < waTPArr.length; i++) {
            var theTp = waTPArr[i];
            var tpId = theTp.id;
            var tpType = theTp.type;
            var crmText = theTp.crm
            if (tpType == 'tp_text') {
                crmText = crmText.replace(/\{\{1}}/g, '<input id="tpl-content-0" type="text" class="border-radius-5" maxlenght=160 />').replace(/\{\{2}}/g, '<input id="tpl-content-1" type="text" class="border-radius-5" maxlenght=160 />').replace(/\{\{3}}/g, '<input id="tpl-content-2" type="text" class="border-radius-5" maxlenght=160 />').replace(/\{\{4}}/g, '<input id="tpl-content-3" type="text" class="border-radius-5" maxlenght=160 />').replace(/\{\{5}}/g, '<input id="tpl-content-4" type="text" class="border-radius-5" maxlenght=160 />');
            } else if (tpType == 'tp_qr') {
                crmText = SC.handleWATpQRMsg(crmText, true, tpId).text; //20250519 add .text for Refactor this function to always return the same type.
            } else if (tpType == 'tp_cta') {
                crmText = SC.handleWATpCTAMsg(crmText, true, tpId).text;// 20250519 add .text for Refactor this function to always return the same type.
            }
            var selectBtnStr = 'selectClicked(' + i + ')';
            fileContainer.append('<tr class="row-container"><td id="display-msg-' + tpId + '" class="canned-cell">' + crmText + '</td><td class="btn-cell"><button class="btn btn-sm rounded btn-info text-capitalize" onclick=' + selectBtnStr + '><i class="fas fa-mouse-pointer me-2"></i><span>' + langJson['l-campaign-select'] + '</span></button></td></tr>')
        }
		
    }
    */
   
    // movement will reset timeout counter
    if (window.opener.addPopupIdle) {
        window.opener.addPopupIdle($(document));
    }
});
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());