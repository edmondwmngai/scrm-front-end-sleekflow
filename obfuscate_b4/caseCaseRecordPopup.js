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
var tmpMsgList = []; // when only one webchat in page
var tmpOnlineFormArr = [];
var today = year + ' - ' + mm + ' - ' + dd;
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var wiseHost = config.wiseHost;
// Check can user download voice
var functions = sessionStorage.getItem('scrmFunctions') || '';
var canDownloadVoice = functions.indexOf('Download-Voice') != -1;
var downloadVoiceStr = canDownloadVoice ? '' : ' controlsList="nodownload"';
var openType = window.frameElement ? (window.frameElement.getAttribute('openType') || '') : '';
var ivrInfo = ''; // ivrInfo only shows when inbound type is inbound call
//var nonPopup = (openType == 'menu' || openType == 'all-media') ? true : false;    //20260320 Unnecessary use of boolean literals in conditional expression.
var nonPopup = (openType == 'menu' || openType == 'all-media');

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
    faxPopup.onload = function(){
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
    if (!r || r.data == undefined) {
        var failReason = r.details || r.Message || 'Error Occurred';
        if (callType == 'Outbound_Call') {
            $('<span class="my-3">' + failReason + '</span>').appendTo('#reply-call-span');
        } else {
            $('<div class="ms-3">Sending...</div><br /><br />').appendTo('#' + contentType + '-media-content');
            // $('<span class="text-center text-danger ms-3"><i class="fa fa-exclamation-triangle me-2"></i>' + failReason + '</span><br /><br />').appendTo('#' + contentType + '-media-content');
        }
        return;
    } else {
        mediaContent = r.data;
        // if (callType == 'Inbound_Call' || callType == 'Outbound_Call') {
        //     mediaContent = r.data[0];
        // } else {
        //     mediaContent = r.data;
        // }
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
                    console.log('newEmailContent');
                    console.log(newEmailContent);
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
        // $('#' + contentType + '-media-content').height(251);
        console.log('mediaContent');
        console.log(mediaContent);
        console.log('mediaContent.Attachments');
        console.log(mediaContent.Attachments);
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
        for (let mediaObj of mediaContent) {
            var timestamp = mediaObj.TimeStamp;
            var handledTime = timestamp.slice(0, timestamp.indexOf("."));
            var callerDisplay = mediaObj.CallerDisplay || '';
            var mediaPath = mediaObj.FileUrl || '';
            var callContainer = '<form>' +
                '<div class="row mb-1 mx-0"><span class="col-sm-2 text-gray">' + langJson['l-form-timestamp'] + '</span><div class="col-sm-10">' + handledTime.replace(/T/g, " ") + '</div></div>' +      //handledTime.replace(/[T]/g, " ") 20250409 replace Replace this character class by the character itself.
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
            var newTime = handledTime.replace(/T/g, " ");     // var newTime = handledTime.replace(/[T]/g, " "); 20250409 Replace this character class by the character itself.
            $('<span class="me-3">' + newTime + '</span>').appendTo('#call-reply-timestamp');
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
                console.log(tiff);
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
    // To do: style not yet set 
}

function addMsgRow(msgList, entry, onlineFormArr) {
    // add message row
    var rows = ''
    for (let theMsg of msgList) {
        var theMsgContent = theMsg.msg_content;
        var theMsgContentDisplay = ''
        if (theMsgContent != null) {
            theMsgContentDisplay += theMsgContent;
        }
        var msgObjectPath = theMsg.msg_object_path;
        if (msgObjectPath != null) {
            var handleContentMsgObj = SC.handleContentMsg(msgObjectPath, theMsg.msg_object_client_name, theMsg.msg_type);
            theMsgContentDisplay += handleContentMsgObj.text;
        }
        //var userIconSrc = "../../images/user.png";		// 20250415 Remove the declaration of the unused 'userIconSrc' variable.
        var sentTime = theMsg.sent_time;
        var theMsgDate = SC.handleDate(sentTime);
        //var onErrorStr = "this.onerror=null;this.src='../../images/user.png';";		//20250415 Remove the declaration of the unused 'onErrorStr' variable.
        var theMsgTime = theMsgDate == '' ? SC.returnTime(sentTime, true) : "";
        if (entry == 'fb_comment' && theMsgContentDisplay == '') {
            theMsgContentDisplay = '[This end user has deleted a comment he/she left before]';
        }
        if (theMsg.send_by_flag == 2) { //發送者1:客服,2:enduser{
            rows += '<div class="message-row visitor-row"><div><span class="user-icon"><i class="fas fa-user"></i></span><div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div><div class="visitor-content-bubble"><div class="content-bubble-name">' + SC.handleBubbleName(theMsg.nick_name, onlineFormArr) + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div></div>';
        } else {
            rows += '<div class="message-row agent-row"><div class="agent-content-bubble"><div class="content-bubble-name">' + (theMsg.sender == '0' ? 'SYSTEM' : theMsg.nick_name) + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div><div><span class="user-icon"><i class="fas fa-user"></i></span><div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div></div>';
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
    console.log('run generateSocialHistory');
    var ticketId = msgObj.ticket_id;
    var entry = msgObj.entry;
    var contentType = ticketId == connId ? 'call' : 'reply';
    var isOffline = msgObj.offline_form == 1;
    var contentHeight = (contentType == 'reply' && entry == 'whatsapp') ? '131' : '286';
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
    console.log('typeDetails @ generateSocialHistory');
    console.log(typeDetails);
    console.log('handleFormData(typeDetails) @ generateSocialHistory');
    // console.log(handleFormData(typeDetails));
    var formData = isOffline ? '' : SC.handleFormData(tmpOnlineFormArr);
    var contentRow = isOffline ? addOfflineForm(msgObj.offline_form_data, msgObj.start_time) : addMsgRow(tmpMsgList, entry, tmpOnlineFormArr);
    // var webchatHeight = openType == 'all-media' ? '' : 'height:286px;';			// 20250415 Remove the declaration of the unused 'webchatHeight' variable.
    var middleStyle = nonPopup ? '' : ' style="width: calc(100% - 290px);""';
    var downloadLink = nonPopup ? '' : '<a id="download-webchat-link" href="javascript:void(0);" class="btn btn-warning btn-sm text-capitalize rounded mt-3 align-top text-white" onclick="webchatDownload(' + ticketId + ');">Download History(HTML file)</a>';
    var logoStr = config.isDemo ? '' : '<img class="company-logo" src="./logo.png" />';
    // var iconStyle = nonPopup ? 'margin-top:-10px' : 'margin-top:10px';			// 20250415 Remove the declaration of the unused 'iconStyle' variable.
    var mediaContainer = '<div id="content-' + ticketId + '"><div class="content-header">' + downloadLink + logoStr + '<span class="custom-scroll content-basic-info"' + middleStyle + '><span class="content-gray-label">' + langJson['l-social-platform'] + ':</span>&nbsp;' + entry + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;		<span class="content-gray-label">' + langJson['l-social-ticket-id'] + ':</span>&nbsp;' + ticketId + '<span style="display:block;">' + formData + '</span></span><img style="height:51px;float:right;" src="../../Wise/img/' + channelImg + '.png" /></div><div class="content-section-inner"><div style="padding:15px;"><div id="content-inner-scroll-' + ticketId + '" style="height:' + contentHeight + 'px;overflow-y:auto;" class="custom-scroll">' + contentRow + '</div></div></div></div>';
    $(mediaContainer).appendTo('#' + contentType + '-media-content');
    // incomplete cases will not need the margin for reply 
    if (openType == 'menu') {
        $('#reply-media-content').removeClass('mb-3');
    }
}

function webchatDownload(ticketId) {
    var msgContent = '<div style="display:table;">';

    for (let theMsg of tmpMsgList) {
        // 20250406     Use concise quantifier syntax '?' instead of '{0,1}'.
        // var theContent = (theMsg.msg_content || '').replace(/<[\/]{0,1}(script|object|embed)[^><]*>/ig, ""); //.replace(/<[^>]*>?/gm, '');
        var theContent = (theMsg.msg_content || '').replace(/<\/?(script|object|embed)[^><]*>/ig, ""); //.replace(/<[^>]*>?/gm, '');

        var sentTime = theMsg.sent_time.replace('T', ' ');
        var indexOfDot = sentTime.indexOf('.');
        var timeTrimmed = indexOfDot > -1 ? sentTime.slice(0, indexOfDot) : setTime;
        if (theMsg.sender != '0') {
            theContent = SC.linkify(theContent); // as the system will have a tag, so should not add additional link
        }
        // Add time
        msgContent += ('<div style="display:table-row;"><span style="display:table-cell;min-width:153px;">[' + timeTrimmed + ']&nbsp;</span><span style="display:table-cell;text-align:right;">');
        // Add name
        if (theMsg.send_by_flag == 1) {
            //agent
            if (theMsg.sender == '0') {
                msgContent += ('SYSTEM' + '</span>:&nbsp;<span style="display:table-cell;">');
            } else {
                msgContent += (theMsg.nick_name + '</span>:&nbsp;<span style="display:table-cell;">');
            }
        } else {
            // visitor
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

//function when this pop-up onload
function caseRecordPopupOnload() {
    setLanguage();
    if (nonPopup) {
        connId = window.frameElement.getAttribute('mediaId');
        if (openType == 'menu') {
            parent.parent.getTicketMsg(connId, connId, 'incomplete');
        } else if (openType == 'all-media') {
            var caseNo = window.frameElement.getAttribute('case-no');
            parent.parent.parent.getTicketMsg(connId, connId, 'all-media', caseNo);
        }
        $('#call-media-content').removeClass('mx-3'); // only webchat will shows caseRecordPopup and webchat ned to take out mx-3
    } else {
        $('.remove-none').removeClass('d-none');
        var windowOpener = window.opener;
        var queryObj = window.opener.selectedCaseLog;
        console.log('queryObj');
        console.log(queryObj);
        var callType = queryObj.Call_Type;

        //20250320 Unnecessary use of boolean literals in conditional expression.
        //var isSocial = callType == 'Inbound_Webchat' || callType == 'Inbound_Whatsapp' || callType == 'Inbound_Wechat' || callType == 'Inbound_Facebook' || callType == 'Inbound_Connment' || callType == 'Inbound_WA' ? true : false;
        var isSocial = callType == 'Inbound_Webchat' || callType == 'Inbound_Whatsapp' || callType == 'Inbound_Wechat' || callType == 'Inbound_Facebook' || callType == 'Inbound_Connment' || callType == 'Inbound_WA';

        console.log(callType);
        var replyType = queryObj.Reply_Type;
        var callMediaType = returnMediaType(queryObj.Call_Type);
        var replyMediaType = returnMediaType(queryObj.Reply_Type);
        console.log('replyMediaType');
        console.log(replyMediaType);
        var callTypeTitle = document.getElementById('call-type-span');
        var replyTypeTitle = document.getElementById('reply-type-span');
        connId = isSocial ? queryObj.Ticket_Id : queryObj.Conn_Id;
        replyConnId = queryObj.Reply_Conn_Id ? queryObj.Reply_Conn_Id.split(',')[0] : null; // queryObj.Reply_Conn_Id.split(',')[0];
        typeDetails = queryObj.Type_Details || '';
        // ===================== 1/3 set info of call messagea =====================
        if (callType.length > 0) {
            callTypeTitle.innerHTML = callType.replace(/_/g, " ");    //  callTypeTitle.innerHTML = callType.replace(/[_]/g, " ");  //20250409 Replace this character class by the character itself.
            if (!isSocial) {
                $('#call-media-content').addClass('mt-3');
                $.ajax({
                    type: "POST",
                    url: wiseHost + '/WisePBX/api/' + callMediaType + '/GetContent',
                    data: JSON.stringify({
                        "id": connId
                    }),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (r) {
                        generateContent('call', callType, r || {}, connId); // call means inbound here only
                    },
                    error: function (r) {
                        console.log('error in caseRecordPopupOnload');
                        console.log(r);
                    },
                });
            } else {
                $('#call-media-content').removeClass('mx-3');
                console.log('connId, windowOpener.connId, windowOpener.openType');
                console.log(connId, windowOpener.connId, windowOpener.openType);
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
        $("#p-details").text(queryObj.Details);
        $("#p-updated-by").text(windowOpener.getAgentName(queryObj.Updated_By));
        $("#p-status").text(queryObj.Escalated_To != null ? 'Escalated to ' + windowOpener.getAgentName(escalatedTo) : queryObj.Status);
        $("#p-Long_Call").text(longCall);
        $("#p-Long_Call_Reason").text(queryObj.Long_Call_Reason);
        $("#p-Is_Junk_Mail").text(isJunkMail);
        $("#p-reply").text(queryObj.Reply_Type.replace(/_/g, " "));   //  $("#p-reply").text(queryObj.Reply_Type.replace(/[_]/g, " ")); // 20250409 Replace this character class by the character itself.
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
                replyTypeTitle.innerHTML = replyType.replace(/_/g, " ");  //  replyTypeTitle.innerHTML = replyType.replace(/[_]/g, " ");  // 20250409 Replace this character class by the character itself.
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