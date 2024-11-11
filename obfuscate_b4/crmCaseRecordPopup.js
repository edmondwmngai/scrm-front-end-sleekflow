var rotateStatus = 0;
var connId = '';
var replyConnId = '';
var typeDetails = '';
var today = new Date();
var year = today.getFullYear();
var mm = today.getMonth() + 1; //January is 0!
var dd = today.getDate();
if (dd < 10) {
    dd = '0' + dd
}
if (mm < 10) {
    mm = '0' + mm
}
today = year + ' - ' + mm + ' - ' + dd;
var tmpMsgList = []; // when only one webchat in page
var tmpOnlineFormArr = [];

var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var wiseHost = config.wiseHost;
// Check can user download voice
var functions = sessionStorage.getItem('scrmFunctions') || '';
var canDownloadVoice = functions.indexOf('Download-Voice') != -1;
var downloadVoiceStr = canDownloadVoice ? '' : ' controlsList="nodownload"';
var openType = window.frameElement ? (window.frameElement.getAttribute('openType') || '') : '';
var ivrInfo = ''; // ivrInfo only shows when inbound type is inbound call
var nonPopup = (openType == 'menu') ? true : false;
var queryObj = nonPopup ? null : window.opener.selectedCaseLog;
var logId = nonPopup ? null : window.opener.caseLogPopupLogId;

function setLanguage() {
    $('.l-form-case-details').text(langJson['l-form-case-details']);
    $('.l-form-nature').text(langJson['l-form-nature']);
    $('.l-form-details').text(langJson['l-form-details']);
    $('.l-form-handled-by').text(langJson['l-form-handled-by']);
    $('.l-form-status').text(langJson['l-form-status']);
    $('.l-form-long-call-duration').text(langJson['l-form-long-call-duration']);
    $('.l-form-reason-for-long-call').text(langJson['l-form-reason-for-long-call']);
    $('.l-form-is-junk-mail').text(langJson['l-form-is-junk-mail']);
    $('.l-form-reply').text(langJson['l-form-reply']);
    $('.l-form-reply-details').text(langJson['l-form-reply-details']);
}

// Fax change page no
var changePageNo = function (no, contentType) {
    tiff.setDirectory(no - 1);
    var htmlCanvas = tiff.toCanvas();
    $('#' + contentType + 'tiffImage').attr('src', htmlCanvas.toDataURL());
}
// open fax popup
function openPopup(mediaId, mediaPath, timestamp, callerDisplay) {
    var params = [
        'height=' + screen.height,
        'width=' + screen.width,
        'fullscreen=yes' // only works in IE, but here for completeness
    ].join(',');
    var openWindows = window.opener.parent.parent.openWindows; // window.opener.parent.parent.parent.openWindows;
    var faxPopup = window.open('../../faxContent.html', 'full', params);
    openWindows[openWindows.length] = faxPopup;
    faxPopup.onload = function () {
        faxPopup.onbeforeunload = function () {
            for (var i = 0; i < openWindows.length; i++) {
                if (openWindows[i] == faxPopup) {
                    openWindows.splice(i, 1);
                    break;
                }
            }
        }
    }
}
// Fax Rotate pic function
function rotateTiff(contentType) {
    var tiffImage = $('#' + contentType + 'tiffImage');
    if (rotateStatus == 0) {
        tiffImage.attr('class', 'rotate-90');
        rotateStatus = 1;
    } else if (rotateStatus == 1) {
        tiffImage.attr('class', 'rotate-180');
        rotateStatus = 2;
    } else if (rotateStatus == 2) {
        tiffImage.attr('class', 'rotate-270');
        rotateStatus = 3;
    } else {
        tiffImage.attr('class', 'default-image');
        rotateStatus = 0;
    }
}
// generate call content and reply content
function generateContent(contentType, callType, r, mediaId) { //contentType: 'call' or 'reply'; channel is Call_Type or Reply_Type
    var mediaContent;
    // if Media Content(=r.data) not loaded properly, show error
    // if (r.responseJSON && r.Message) {
    //     if (r.Message == 'An error has occurred.') {
    //         $('<div class="ml-3">Send failed</div><br /><br />').appendTo('#' + contentType + '-media-content');
    //     } else {
    //         $('<div class="ml-3">' + r.Message + '</div><br /><br />').appendTo('#' + contentType + '-media-content');
    //     }
    // } else 
    if (!r || r.data == undefined) {
        if (r.responseJSON) {
            var failReason = r.responseJSON.Message || 'Error Occurred';
            if (callType == 'Outbound_Call') {
                $('<span class="my-3">' + failReason + '</span>').appendTo('#reply-call-span');
            } else {
                if (failReason == 'An error has occurred.') {
                    $('<div class="ml-3">Sending or Send Failed</div><br /><br />').appendTo('#' + contentType + '-media-content');
                } else {
                    $('<div class="ml-3">' + failReason + '</div><br /><br />').appendTo('#' + contentType + '-media-content');
                }
                // $('<span class="text-center text-danger ml-3"><i class="fa fa-exclamation-triangle mr-2"></i>' + failReason + '</span><br /><br />').appendTo('#' + contentType + '-media-content');
            }
            return;
        }
    } else {
        mediaContent = r.data;
    }
    if (callType == 'Inbound_Email' || callType == 'Outbound_Email') {
        var emailContent = mediaContent.Body;
        var attachments = mediaContent.Attachments;
        var imgMatch = emailContent.match(/<img/g);
        var imgLength = 0;
        if (imgMatch != null) {
            imgLength = emailContent.match(/<img/g).length;
        }
        var imgLastIdx = 0;
        for (var i = 0; i < imgLength; i++) {
            var imgTagIdx = emailContent.indexOf('<img ', imgLastIdx);
            var imgLastIdx = emailContent.indexOf('>', imgTagIdx);
            var imgTag = emailContent.slice(imgTagIdx, imgLastIdx + 1);
            var imgType = imgTag.indexOf('jpg') != -1 ? 'jpeg' : 'png';
            var imgNameIdx = imgTag.indexOf('cid:') + 4;
            var fileName = imgTag.slice(imgNameIdx, imgTag.indexOf('@', imgNameIdx));
            for (var j = 0; j < attachments.length; j++) {
                if (attachments[j].FileName == fileName) {
                    var newEmailContent = emailContent.slice(0, imgTagIdx) + '<img name="email-img" src="data:image/' + imgType + ';charset=utf-8;base64,' + attachments[j].Base64Data + '">' +
                        emailContent.slice(imgLastIdx + 1);
                    emailContent = newEmailContent;
                    attachments.splice(j, 1);
                    break;
                }
            }
        }


        // set info of email content
        var emailContent = '<form><div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">From</span><div class="col-sm-10"><span class="right-cell"><span>' + mediaContent.From + '</span></div></div>' +
            '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">To</span><div class="col-sm-10"><span class="right-cell"><span id="' + contentType + '-email-to"></span></div></div>' +
            '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">&nbsp;</span><div class="col-sm-10">&nbsp;</div></div>' +
            '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-email-subject'] + '</span><div class="col-sm-10"><span class="right-cell"><span>' + mediaContent.Subject + '</span></div></div>' +
            '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">&nbsp;</span><div class="col-sm-10">&nbsp;</div></div>' +
            '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-email-content'] + '</span><div class="col-sm-10"><span class="right-cell"><span>' + emailContent + '</span></div></div>' +
            '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">&nbsp;</span><div class="col-sm-10">&nbsp;</div></div>' +
            '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-email-attachments'] + '</span><div class="col-sm-10"><span class="right-cell"><span id="' + contentType + '-attachment"></span></div></div></form>';
        $(emailContent).appendTo('#' + contentType + '-media-content');
        $('#' + contentType + '-email-to').text(mediaContent.To);

        for (i = 0; i < attachments.length; i++) {
            var attachment = attachments[i];
            var objDiv = document.createElement("span");
            var fileName = attachment.FileName;
            var escapedFileName = escape(fileName);
            objDiv.setAttribute("class", "email-attach-tag");
            objDiv.setAttribute("onclick", "download('data:" + attachment.ContentType + ";base64," + attachment.Base64Data + "','" + escapedFileName + "','" + attachment.ContentType + "');");
            objDiv.textContent = fileName;
            $('#' + contentType + '-attachment').append(objDiv);
        }
    } else if (callType == 'Inbound_Voicemail') {
        // var openAudio = "window.open('" + mediaContent.FileUrl + "','_blank','width=280,height=50')";
        var vmailContainer = '<form>' +
            '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-form-timestamp'] + '</span><div class="col-sm-10">' + mediaContent.CreateDateTime.replace('T', ' ') + '</div></div>' +
            '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-form-caller-display'] + '</span><div class="col-sm-10">' + mediaContent.CallerDisplay + '</div></div>' +
            '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-vmail-vmail-id'] + '</span><div class="col-sm-10">' + mediaId + '</div></div>' +
            '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-form-play-voicemail'] + '</span><div class="col-sm-10">' +
            '<video controls="" name="media" style="height:27px;width:95%;"' + downloadVoiceStr + '><source src="' + mediaContent.FileUrl + '" type="audio/wav"></video>' +
            //<a href="javascript:void(0);" onclick=' + openAudio + '>' + langJson['l-form-play-voicemail'] + '</a>
            +'</div></div></form>';
        $(vmailContainer).appendTo('#' + contentType + '-media-content');
    } else if (callType == "Outbound_SMS") {
        var smsContainer = '<form>' +
            '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-form-mobile'] + '</span><div class="col-sm-10">' + mediaContent.MobileNo + '</div></div>' +
            '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-form-message'] + '</span><div id="sms-content" class="col-sm-10"></div></div></form>';
        $(smsContainer).appendTo('#' + contentType + '-media-content');
        $('#sms-content').text(mediaContent.Message);
    } else if (callType == 'Inbound_Call') {
        for (let theMedia of mediaContent) {
            var timestamp = theMedia.TimeStamp;
            var handledTime = timestamp.slice(0, timestamp.indexOf("."));
            var callerDisplay = theMedia.CallerDisplay || '';
            var mediaPath = theMedia.FileUrl || '';
            // var openAudio = "window.open('" + theMedia.FileUrl + "','_blank','width=280,height=50')";
            var callContainer = '<form>' +
                '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-form-timestamp'] + '</span><div class="col-sm-10">' + handledTime.replace(/[T]/g, " ") + '</div></div>' +
                '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-vmail-caller-display'] + '</span><div class="col-sm-10">' + callerDisplay + '</div></div>' +
                '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-form-play-call'] + '</span><div class="col-sm-10">' +
                '<video controls="" name="media" style="height:27px;width:95%;"' + downloadVoiceStr + '><source src="' + mediaPath + '" type="audio/wav"></video>' +
                //'<a href="javascript:void(0);" onclick=' + openAudio + '>' + langJson['l-form-play-call'] + '</a>
                '</div></div></form>';
            $(callContainer).appendTo('#' + contentType + '-media-content')
        }
    } else if (callType == 'Outbound_Call') {
        for (let theMedia of mediaContent) {
            var timestamp = theMedia.TimeStamp;
            var handledTime = timestamp.slice(0, timestamp.indexOf("."));
            var newTime = handledTime.replace(/[T]/g, " ");
            $('<span class="mr-3">' + newTime + '</span>').appendTo('#call-reply-timestamp');
            $('#reply-call-span').append('<video controls="" name="media" style="height:27px;width:95%;"' + downloadVoiceStr + '><source src="' + theMedia.FileUrl + '" type="audio/wav"></video>');
        }
    } else if (callType == 'Inbound_Fax' || callType == 'Outbound_Fax') {
        var mediaPath = mediaContent.FileUrl || '';
        if (mediaPath.length > 0) {
            var pageChangeStr = 'changePageNo(this.value,"' + contentType + '");';
            var rotateTiffStr = 'rotateTiff("' + contentType + '");';
            var openPopupStr = 'openPopup("' + mediaId + '","' + mediaPath + '","' + mediaContent.CreateDateTime + '","' + mediaContent.CallerDisplay + '");';
            var faxContainer = '<form>' +
                '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-form-timestamp'] + '</span><div class="col-sm-10">' + mediaContent.CreateDateTime.replace('T', ' ') + '</div></div>' +
                '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-form-caller-display'] + '</span><div class="col-sm-10">' + mediaContent.CallerDisplay + '</div></div>' +
                '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-fax-fax-id'] + '</span><div class="col-sm-10">' + mediaId + '</div></div>' +
                '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-fax-page'] + '</span><div class="col-sm-10">' +
                '<select id="' + contentType + 'pageNo" onchange=' + pageChangeStr + '></select>' +
                '<span class="fax-fn-btn" onclick=' + openPopupStr + '>' + langJson['l-fax-open'] + '</span>' +
                '<span id="rotate-fax" class="fax-fn-btn" onclick=' + rotateTiffStr + '>' + langJson['l-fax-rotate'] + '</span></div></div></form>' +
                '<div id="' + contentType + 'loading-tiff" style="font-weight:550;font-size:16px;text-align: center;width: 100%;margin: 30px">Loading...</div><br/>' +
                '<img id="' + contentType + 'tiffImage" src="" class="default-image"></img>';
            $(faxContainer).appendTo('#' + contentType + '-media-content');
            var xhr = new XMLHttpRequest();
            xhr.open('GET', mediaPath);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function (e) {
                var tiff = new Tiff({
                    buffer: xhr.response
                });
                for (var i = 0, len = tiff.countDirectory(); i < len; ++i) {
                    $('#' + contentType + 'pageNo').append($("<option/>", {
                        value: i + 1,
                        text: i + 1
                    }));
                }
                $('#' + contentType + 'pageNo').val("1");

                tiff.setDirectory(0);
                var htmlCanvas = tiff.toCanvas();
                $('#' + contentType + 'tiffImage').attr("src", htmlCanvas.toDataURL());
                $('#' + contentType + 'loading-tiff').remove();
            };
            xhr.send();
            // $('#' + contentType + '-media-content').height(251);
        }
    }
}

function returnMediaType(channel) { // channel is Call_Type or Reply_Type
    if (channel == 'Inbound_Voicemail' || channel == 'Outbound_Voicemail') {
        return 'Vmail';
    } else if (channel == 'Inbound_Fax' || channel == 'Outbound_Fax') {
        return 'Fax';
    } else if (channel == 'Inbound_Email' || channel == 'Outbound_Email') {
        return 'Email';
    } else if (channel == 'Inbound_Call' || channel == 'Outbound_Call') {
        return 'Call';
    } else if (channel == 'Outbound_SMS') {
        return 'SMS';
    } else {
        return channel;
    }
}

function enlargeImage(theImg) {
    // becasue pop up too small, so will not show enlarge image
}

function addReplyStr(reply_msg) {
    var replyBubbleStr = '';
    var theMsgContentDisplay = (reply_msg.msg_content || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var replyMsgType = reply_msg.msg_type;
    var replyMsgObjPath = reply_msg.msg_object_path
    if (replyMsgType != 'tp_qr' && replyMsgType != 'tp_cta') {
        theMsgContentDisplay = SC.linkify(theMsgContentDisplay);
    }
    var handleContentMsgObj = {}
    if (replyMsgObjPath != null) {
        handleContentMsgObj = SC.handleContentMsg(reply_msg.msg_object_path, reply_msg.msg_object_client_name, reply_msg.msg_type);
        theMsgContentDisplay = handleContentMsgObj.text + '<div>' + theMsgContentDisplay + '</div>'
    }

    if (replyMsgType == 'tp_qr') {
        handleContentMsgObj = SC.handleWATpQRMsg(theMsgContentDisplay)
        theMsgContentDisplay = handleContentMsgObj.text
    } else if (replyMsgType == 'tp_cta') {
        handleContentMsgObj = SC.handleWATpCTAMsg(theMsgContentDisplay)
        theMsgContentDisplay = handleContentMsgObj.text
    }

    if (reply_msg.send_by_flag == 2) { //發送者1:客服,2:enduser{
        replyBubbleStr = ('<div class="reply-bubble reply-cust"><div class="content-bubble-name">' +
            reply_msg.nick_name + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div>');
    } else {
        var agentBubbleName = reply_msg.sender == '0' ? 'SYSTEM' : isNaN(reply_msg.sender) ? (isNaN(reply_msg.nick_name) ? reply_msg.nick_name : (nonPopup ? (openType == 'menu' ? parent.parent.getAgentName(reply_msg.nick_name) : parent.parent.parent.getAgentName(reply_msg.nick_name)) : (window.opener.getAgentName(reply_msg.nick_name)))) : (nonPopup ? (openType == 'menu' ? parent.parent.getAgentName(reply_msg.sender) : parent.parent.parent.getAgentName(reply_msg.sender)) : (window.opener.getAgentName(reply_msg.sender)));
        replyBubbleStr = ('<div class="reply-bubble reply-agent"><div class="content-bubble-name">' +
            agentBubbleName +
            '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div>');
    }
    return replyBubbleStr
}

function addMsgRow(msgList, entry, onlineFormArr) {
    // add message row
    var rows = ''
    for (let theMsg of msgList) {
        var theMsgContent = (theMsg.msg_content || '').replace(/<[\/]{0,1}(script|object|embed)[^><]*>/ig, "");
        var theMsgMsgType = theMsg.msg_type;
        var replyMsgStr = theMsg.reply_msg ? addReplyStr(theMsg.reply_msg) : ''
        if (entry != 'webchat' || (entry == 'webchat' && theMsg.send_by_flag == 1 && theMsg.sender != "0")) {
            if (theMsgMsgType != 'tp_qr' && theMsgMsgType != 'tp_cta') {
                theMsgContent = SC.linkify(theMsgContent);
            }
        }
        var theMsgContentDisplay = ''
        if (theMsgContent != null) {
            theMsgContentDisplay += theMsgContent;
        }
        var msgObjectPath = theMsg.msg_object_path;
        var handleContentMsgObj = {}
        if (msgObjectPath != null) {
            handleContentMsgObj = SC.handleContentMsg(msgObjectPath, theMsg.msg_object_client_name, theMsg.msg_type);
            theMsgContentDisplay += handleContentMsgObj.text;
        }
        if (theMsg.msg_type == 'tp_qr') {
            handleContentMsgObj = SC.handleWATpQRMsg(theMsgContentDisplay)
            theMsgContentDisplay = handleContentMsgObj.text
        } else if (theMsg.msg_type == 'tp_cta') {
            handleContentMsgObj = SC.handleWATpCTAMsg(theMsgContentDisplay)
            theMsgContentDisplay = handleContentMsgObj.text
        }

        var sentTime = SC.returnDateTime(theMsg.sent_time);
        var theMsgDate = SC.handleDate(sentTime);
        var theMsgTime = theMsgDate == '' ? sentTime.slice(11, 19) : "";

        if (entry == 'fb_comment' && theMsgContentDisplay == '') {
            theMsgContentDisplay = '[This end user has deleted a comment he/she left before]';
        }

        if (theMsg.send_by_flag == 2) { //發送者1:客服,2:enduser{
            var userNameStr = theMsg.msg_completed == -2 ? '' : '<div><span class="content-bubble-name">' + SC.handleBubbleName(theMsg.nick_name, onlineFormArr, null, true) + '</span></div>';
            var bubbleClassStr = 'visitor-content-bubble content-bubble';
            if (theMsg.msg_completed == -2) {
                theMsgContentDisplay = '<span class="deleted-msg"><i class="fas fa-ban mr-1"></i>This message was deleted</span>'
                bubbleClassStr += ' my-2';
            }
            rows += '<div class="message-row visitor-row"><div><span class="user-icon"><i class="fas fa-user"></i></span><div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div><div class="' + bubbleClassStr + '">' + replyMsgStr + userNameStr + '<div class="content-bubble-content">' + theMsgContentDisplay + '</div></div></div>';
        } else {
            var msgFailStr = theMsg.msg_completed == -1 ? '<span class="text-gray"><i class="fas fa-exclamation-circle mr-2"></i>Send Failed</span>' : '';
            var agentBubbleName = theMsg.sender == '0' ? 'SYSTEM' : isNaN(theMsg.sender) ? (isNaN(theMsg.nick_name) ? theMsg.nick_name : (nonPopup ? (openType == 'menu' ? parent.parent.getAgentName(theMsg.nick_name) : parent.parent.parent.getAgentName(theMsg.nick_name)) : (window.opener.getAgentName(theMsg.nick_name)))) : (nonPopup ? (openType == 'menu' ? parent.parent.getAgentName(theMsg.sender) : parent.parent.parent.getAgentName(theMsg.sender)) : (window.opener.getAgentName(theMsg.sender)));
            // for chatbot will show selection
            if (theMsg.msg_json && theMsg.msg_json.Commands && theMsg.msg_json.Commands.length > 0) {
                theMsgContentDisplay += '<div class="mt-1">'
                var cmdArr = theMsg.msg_json.Commands
                for (let cmd of cmdArr) {
                    theMsgContentDisplay += ('<button class="btn-primary mr-2">' + cmd.Title + '</button>')
                }
                theMsgContentDisplay += '</div>'
            }
            rows += '<div class="message-row agent-row"><div class="agent-content-bubble"><div class="content-bubble-name">' + agentBubbleName + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div>' + msgFailStr + '</div><div><span class="user-icon"><i class="fas fa-user"></i></span><div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div></div>';
        }
    }
    return rows;
}

function addOfflineForm(offlineFormData, startTime) {
    var formFieldsStr = '';

    for (let theField of offlineFormData) {
        formFieldsStr += ('<div style="display:table-row;"><div style="display:table-cell;padding-right:10px;padding-bottom:3px;">' + theField.field_name + ': </div><div style="display:table-cell;">' + theField.field_value + '</div></div>');
    }
    return ('<div class="message-row visitor-row"><div class="visitor-content-bubble"><div class="content-bubble-name" style="margin-bottom:5px;">Offline Form</div><div class="content-bubble-content">' + formFieldsStr + '<div style="float:right;">Received Time: ' + SC.returnDateTime(startTime) + '</div></div></div></div>');
}

function generateSocialHistory(msgObj) {
    var ticketId = msgObj.ticket_id;
    var entry = msgObj.entry;
    var contentType = ticketId == connId ? 'call' : 'reply';
    var isOffline = msgObj.offline_form == 1;
    var contentHeight = 'auto';// (contentType == 'reply' && entry == 'whatsapp')? '131' : '286';
    tmpMsgList = msgObj.data.msg_list;
    tmpOnlineFormArr = msgObj.online_form_data;
    var channelImg = '';
    if (entry == 'webchat') {
        channelImg = 'webchat-icon-217';
    } else if (entry == 'whatsapp') {
        channelImg = 'whatsapp';
    } else if (entry == 'facebook') {
        channelImg = 'fbmsg-icon-256';
    } else if (entry == 'fb_comment') {
        channelImg = 'facebook_icon';
    } else if (entry == 'wechat') {
        channelImg = 'WeChat';
    }

    var formData = isOffline ? '' : SC.handleFormData(tmpOnlineFormArr);
    var contentRow = isOffline ? addOfflineForm(msgObj.offline_form_data, msgObj.start_time) : addMsgRow(tmpMsgList, entry, tmpOnlineFormArr);
    var webchatHeight = 'height:286px;';
    var middleStyle = nonPopup ? '' : ' style="width: calc(100% - 290px);""';
    var downloadLink = nonPopup ? '' : '<a id="download-webchat-link" href="javascript:void(0);" class="btn btn-warning btn-sm text-capitalize rounded mt-3 align-top text-white" onclick="webchatDownload(' + ticketId + ');">Download History(HTML file)</a>';
    var logoStr = config.isDemo ? '' : '<img class="company-logo" src="./logo.png" />';
    var iconStyle = nonPopup ? 'margin-top:-10px' : 'margin-top:10px';
    var mediaContainer = '<div id="content-' + ticketId + '"><div class="content-header">' + downloadLink + logoStr + '<span class="custom-scroll content-basic-info"' + middleStyle + '><span class="content-gray-label">' + langJson['l-social-platform'] + ':</span>&nbsp;' + entry + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;		<span class="content-gray-label">' + langJson['l-social-ticket-id'] + ':</span>&nbsp;' + ticketId + '<span style="display:block;">' + formData + '</span></span><img style="height:51px;float:right;" src="../../Wise/img/' + channelImg + '.png" /></div><div class="content-section-inner"><div style="padding:15px;"><div id="content-inner-scroll-' + ticketId + '" style="height:' + contentHeight + 'px;overflow-y:auto;" class="custom-scroll">' + contentRow + '</div></div></div></div>';
    $(mediaContainer).appendTo('#' + contentType + '-media-content');
    // incomplete cases will not need the margin for reply 
    if (openType == 'menu') {
        $('#reply-media-content').removeClass('mb-3');

        // set height
        var newHeight;
        var body = document.body,
            html = document.documentElement;

        // maximum height 382px
        newHeight = Math.ceil(Math.min(body.scrollHeight, body.offsetHeight, html.offsetHeight, 382)) + 1;

        var menuLowerFrame = parent.document.getElementById('media-content');
        if (menuLowerFrame) {
            menuLowerFrame.height = newHeight;
        }
    }
}

function webchatDownload(ticketId, isWebchat) {
    var msgContent = '<div style="display:table;">';

    for (let theMsg of tmpMsgList) {
        var theContent = (theMsg.msg_content || '').replace(/<[\/]{0,1}(script|object|embed)[^><]*>/ig, ""); //.replace(/<[^>]*>?/gm, '');
        var sentTime = theMsg.sent_time.replace('T', ' ');
        var indexOfDot = sentTime.indexOf('.');
        var timeTrimmed = indexOfDot > -1 ? sentTime.slice(0, indexOfDot) : sentTime;
        if (!isWebchat || (isWebchat && theMsg.send_by_flag == 1 && theMsg.sender != "0")) {
            theContent = SC.linkify(theContent); // as the system will have a tag, so should not add additional link
        }
        // Add time
        msgContent += ('<div style="display:table-row;"><span style="display:table-cell;min-width:153px;">[' + timeTrimmed + ']&nbsp;</span><span style="display:table-cell;text-align:right;">');
        // Add name
        if (theMsg.send_by_flag == 1) {
            //agent
            var agentBubbleName = theMsg.sender == '0' ? 'SYSTEM' : isNaN(theMsg.sender) ? (isNaN(theMsg.nick_name) ? theMsg.nick_name : (nonPopup ? (openType == 'menu' ? parent.parent.getAgentName(theMsg.nick_name) : parent.parent.parent.getAgentName(theMsg.nick_name)) : (window.opener.getAgentName(theMsg.nick_name)))) : (nonPopup ? (openType == 'menu' ? parent.parent.getAgentName(theMsg.sender) : parent.parent.parent.getAgentName(theMsg.sender)) : (window.opener.getAgentName(theMsg.sender)));
            msgContent += (agentBubbleName + '</span>:&nbsp;<span style="display:table-cell;">');
        } else {
            if (theMsg.msg_completed == -2) {
                theContent = '[This message was deleted]'
            }
            if (theMsg.nick_name == 'visitor') {
                theMsg.nick_name = 'VISITOR'
            }
            msgContent += (SC.handleBubbleName(theMsg.nick_name, tmpOnlineFormArr) + '</span>:&nbsp;<span style="display:table-cell;">');
        }
        // Show msgContent or file url
        msgContent += theContent.length > 0 ? theContent : theMsg.msg_object_client_name + '( ' + theMsg.msg_object_path + ' )';
        msgContent += '</span></span></div>';
    }
    msgContent += '</div>'; // end of d-table div

    var link = document.getElementById('download-webchat-link');
    link.href = 'data:text/plain;charset=UTF-8,' + encodeURIComponent(msgContent);
    //set default action on link to force download, and set default filename:
    link.download = 'Webchat-History-' + ticketId + '.html';
}

var getRelatvieCallId = function (callMediaType, theConnId) {
    return new Promise(function (myResolve) {
        $.ajax({
            type: "POST",
            url: wiseHost + '/WisePBX/api/' + callMediaType + '/GetRelativeCallID',
            data: JSON.stringify({
                "callId": theConnId
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                myResolve([theConnId]);
            } else {
                myResolve(r.data);
            }
        })
    })
}

function getContent(callMediaType, theConnId) {
    return new Promise(function (myResolve, myReject) {
        $.ajax({
            type: "POST",
            url: wiseHost + '/WisePBX/api/' + callMediaType + '/GetContent',
            data: JSON.stringify({
                "id": theConnId
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (r) {
                myResolve(r);
            },
            error: function (r) {
                myReject();
                console.log('error in getContent');
                console.log(r);
            }
        })
    })
}

//function when this pop-up onload
function caseRecordPopupOnload() {
    setLanguage();
    if (nonPopup) {
        connId = window.frameElement.getAttribute('mediaId');
        if (openType == 'menu') {
            parent.parent.getTicketMsg(connId, connId, 'incomplete');
        }
        $('#call-media-content').removeClass('mx-3'); // only webchat will shows caseRecordPopup and webchat ned to take out mx-3
    } else {
        $('.remove-none').removeClass('d-none');
        var windowOpener = window.opener;
        var queryObj = window.opener.selectedCaseLog;

        var callType = queryObj.Call_Type;
        var isSocial = callType == 'Inbound_Webchat' || callType == 'Inbound_Whatsapp' || callType == 'Inbound_Wechat' || callType == 'Inbound_Facebook' || callType == 'Inbound_Connment' || callType == 'Inbound_WA' ? true : false;

        var replyType = queryObj.Reply_Type;
        var callMediaType = returnMediaType(queryObj.Call_Type);
        var replyMediaType = returnMediaType(queryObj.Reply_Type);

        var callTypeTitle = document.getElementById('call-type-span');
        var replyTypeTitle = document.getElementById('reply-type-span');
        connId = isSocial ? (queryObj.Ticket_Id || queryObj.Conn_Id) : queryObj.Conn_Id; // Social Media use Conn_Id is deprecated
        replyConnId = queryObj.Reply_Conn_Id ? queryObj.Reply_Conn_Id.split(',')[0] : null; // Only get the first one to display
        typeDetails = queryObj.Type_Details || '';
        // ===================== 1/3 set info of call messagea =====================
        if (callType.length > 0) {
            callTypeTitle.innerHTML = callType.replace(/[_]/g, " ");
            if (!isSocial) {
                $('#call-media-content').addClass('mt-3');
                if (callMediaType == 'Call') {
                    getRelatvieCallId(callMediaType, connId).then(function (connIdArr) {
                        async function getContentLoop(theConnId) {
                            for (var theConnId of connIdArr) {    
                                // collect promises returned by twiceAsync to an array
                                await getContent(callMediaType, theConnId).then(function (r) {
                                     generateContent('call', callType, r || {}, theConnId)
                                }, function () { console.log("api error") });
                            }
                        }
                        getContentLoop();
                    })
                } else {
                    getContent(callMediaType, connId).then(
                        function (r) {
                            generateContent('call', callType, r || {}, connId); // call means inbound here only
                        }
                    );
                }
            } else {
                $('#call-media-content').removeClass('mx-3');
                window.opener.parent.parent.getTicketMsg(connId, windowOpener.ticketId, windowOpener.openType);
            }
        } else {
            callTypeTitle.innerHTML = langJson['l-form-inbound-type'] + ':&nbsp;&nbsp;&nbsp;-' // langJson['l-form-manual-update'];
            $('<h1 class="text-center text-secondary mt-0"><i class="fa fa-times-circle mt-3"></i></h1>').appendTo('#call-media-content');
        }
        // var mediaContent = window.opener.parent.mediaContent;
        // ===================== 2/3 set info of case =====================
        var escalatedTo = queryObj.Escalated_To;
        var longCall = queryObj.Long_Call == 'N' ? 'No' : (queryObj.Long_Call == 'Y' ? 'Yes' : '');
        var isJunkMail = queryObj.Is_Junk_Mail == 'N' ? 'No' : (queryObj.Is_Junk_Mail == 'Y' ? 'Yes' : '');
        $("#p-nature").text(queryObj.Call_Nature);
        $('#p-details').text($("<div>", {
            html: queryObj.Details || ''
        }).text()); // the data has been escaped
        // $("#p-details").text(queryObj.Details);
        $("#p-updated-by").text(windowOpener.getAgentName(queryObj.Updated_By));
        $("#p-status").text(queryObj.Escalated_To != null ? 'Escalated to ' + windowOpener.getAgentName(escalatedTo) : queryObj.Status);
        $("#p-Long_Call").text(longCall);
        $("#p-Long_Call_Reason").text(queryObj.Long_Call_Reason);
        $("#p-Is_Junk_Mail").text(isJunkMail);
        $("#p-reply").text(queryObj.Reply_Type.replace(/[_]/g, " "));
        $("#p-reply-details").text(queryObj.Reply_Details || '');
        // ===================== 3/3 set info of reply message =====================
        if (replyMediaType.length > 0) {
            if (replyType == 'Outbound_WhatsApp') {
                window.opener.parent.parent.getTicketMsg(replyConnId, connId, windowOpener.openType);
                $('#reply-media-content').removeClass('mx-3 mb-3'); // to make outbound fill the reply content
                $('#reply-navbar').addClass('mb-0'); // to make outbound fill the reply content
                return;
            } else {
                if (replyType == 'Outbound_Call') {
                    var callContainer = '<form>' +
                        '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-form-timestamp'] + '</span><div class="col-sm-10"><span id="call-reply-timestamp"></div></div>' +
                        '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-form-call-result'] + '</span><div class="col-sm-10">' + queryObj.Reply_Call_Result + '</div></div>' +
                        '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-form-play-call'] + '</span><div class="col-sm-10"><span id="reply-call-span"></span></div></div>' +
                        '</form>';
                    $(callContainer).appendTo('#reply-media-content');
                }
                replyTypeTitle.innerHTML = replyType.replace(/[_]/g, " ");
                $.ajax({
                    type: "POST",
                    url: wiseHost + '/WisePBX/api/' + replyMediaType + '/GetContent',
                    data: JSON.stringify({
                        "id": Number(replyConnId)
                    }),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).always(function (r) {
                    generateContent('reply', replyType, r || {}, replyConnId);
                });
            }
        } else {
            replyTypeTitle.innerHTML = langJson['l-form-outbound-type'] + ':&nbsp;&nbsp;&nbsp;-';
            $('<h1 class="text-center text-secondary mt-0"><i class="fa fa-times-circle mt-3"></i></h1>').appendTo('#reply-media-content');
            $('#reply-media-content').height('auto');
        }
    }
}
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());