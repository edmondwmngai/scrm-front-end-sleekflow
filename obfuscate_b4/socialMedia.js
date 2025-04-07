var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var customerData = {};
var presentTicketId = -1;
var popupCampaign = '';
var oldHistoryObj = {};
var oldTicketListObj = {};
var oldTicketCountObj = {};
var newDate = new Date();
var year = newDate.getFullYear();
var mm = newDate.getMonth() + 1; //January is 0!
var dd = newDate.getDate();
var type = '';
var customCompany = sessionStorage.getItem('scrmCustomCompany') || 'no';
var tempCampaign = null;
var tempEntry = null;
var tempTicketId = null;
var addedNotSavedArr = [];
var sendTypingAllowed = true;
var tabType = 'social-media'; // for making outbound call
var runningTopBotom = false; // this is to avoid div scrolled to the multiple top or bottom event triggered
var isNewGetTicket = false;
var functions = sessionStorage.getItem('scrmFunctions') || '';
//var noFormInSocial = functions.indexOf('No-Form-In-Social') != -1 ? true : false;     //20250320 Unnecessary use of boolean literals in conditional expression.
var noFormInSocial = functions.indexOf('No-Form-In-Social') != -1;
var WATimeOutObj = {};
var fbPostTimeoutObj = {};
// for making outbound call, got reply conn id
function replyCallClick(lastCallType, lastCallID, confConnID, theTicketId) {
    if (theTicketId) {
        var iframeInputForm = document.getElementById('input-form-' + theTicketId);
        iframeInputForm.contentWindow.replyCallClick(lastCallType, lastCallID, confConnID);
        parent.tmpTicketId = null;
    }
}

if (dd < 10) {
    dd = '0' + dd
}
if (mm < 10) {
    mm = '0' + mm
}
var today = year + ' - ' + mm + ' - ' + dd;
var lastArr = [['Last'], ['2nd to Last', 'Last'], ['3rd to Last', '2nd to Last', 'Last']];
var customCompany = sessionStorage.getItem('scrmCustomCompany') || 'no';
var mvcHost = config.mvcHost;
var mvcUrl = config.mvcUrl;
var wiseHost = config.wiseHost;

// Check can user download voice
var canDownloadVoice = functions.indexOf('Download-Voice') != -1;
var downloadVoiceStr = canDownloadVoice ? '' : ' controlsList="nodownload"';
var typingObj = {};
var fbHistoryfileHost = 'https://api.commas.hk/';

//Number.isInteger only work on Chrome, not IE, so have this function
function removeTypingBubble(ticketId) {
    $('#chatBubble-' + ticketId).remove();
    if (typingObj[ticketId]) {
        clearTimeout(typingObj[ticketId]);
        delete typingObj[ticketId];
    }
}

function WA24Expired(ticketId) {
    parent.document.getElementById("phone-panel").contentWindow.wiseCompleteTicket(ticketId); // will disable textarea afterward automatically
    $('#reply-textarea-' + ticketId).prop("placeholder", "Over 24 hours. Template only can be sent.");
}

function WARenewTimeout(ticketId, lastClientTime) {
    lastClientTime = lastClientTime.replace("T", " ");
    lastClientTime = lastClientTime.slice(0, 19);
    var timeDiff = new Date() - new Date(lastClientTime);
    var timeDiffInHr = timeDiff / 1000 / 60 / 60;
    if (timeDiffInHr > 24) {
        WA24Expired(ticketId);
    } else {
        // remove original timer first for reset
        if (WATimeOutObj[ticketId]) {
            clearTimeout(WATimeOutObj[ticketId]);
            delete WATimeOutObj[ticketId];
        }
        var remainingTime = 86400000 - timeDiff; // 24 hours millisecond minus last sent time till now millisecond
        WATimeOutObj[ticketId] = setTimeout(function (p) { WA24Expired(p.ticketId) }.bind(this, { ticketId: ticketId }), remainingTime);
    }
}

function customerTyping(ticketId) {
    var chatDiv = $('#content-inner-scroll-' + ticketId);

    // if have the chat window
    if (chatDiv.length > 0) {
        var chatBubble = $('#chatBubble-' + ticketId);

        // if no typing  bubble
        if (chatBubble.length == 0) {

            // iXServer send typing to us every 2 secounds, so the typing time a little bit longer than usual
            chatDiv.append('<img id="chatBubble-' + ticketId + '" src="./images/r-typing.gif" style="margin-left: 30px;height: 50px;">');
            typingObj[ticketId] = setTimeout(function (p) {
                removeTypingBubble(p.ticketId);
            }.bind(this, { ticketId: ticketId }), 2500);

            // scroll to the bottom
            chatDiv.scrollTop(chatDiv[0].scrollHeight);
        } else {
            if (typingObj[ticketId]) {

                // if don't clear the time out the time out, previous timeout still will be exists
                clearTimeout(typingObj[ticketId]);
                typingObj[ticketId] = setTimeout(function (p) {
                    removeTypingBubble(p.ticketId);
                }.bind(this, { ticketId: ticketId }), 2500);
            }
        }
    }
}

function isInteger(num) {
    return (num ^ 0) === num;
}
var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';
var agentName = sessionStorage.getItem('scrmAgentName') || '';
if (agentName.length == 0) {
    agentName = parent.getAgentName(loginId);
    sessionStorage.setItem('scrmAgentName', agentName || '');
}

function resize() {
}

function setLanguage() {
    $('.l-social-active-chat-ques').text(langJson['l-social-active-chat-ques']);
    $('.l-social-ticket-id').text(langJson['l-social-ticket-id']);
    $('.l-social-add-agent-to-chat-room').text(langJson['l-social-add-agent-to-chat-room']);
    $('.l-social-campaign').text(langJson['l-social-campaign']);
    $('.l-social-platform').text(langJson['l-social-platform']);
    $('.l-social-message-to-the-invited-agent').text(langJson['l-social-message-to-the-invited-agent']);
    $('.l-social-send-request').text(langJson['l-social-send-request']);
    $('.l-social-agent-to-invite').text(langJson['l-social-agent-to-invite']);
    $('.l-general-cancel').text(langJson['l-general-cancel']);
    $('.l-social-pass-input-form-to-agent').text(langJson['l-social-pass-input-form-to-agent']);
    $('.l-social-to-pass-the-input-form-to').text(langJson['l-social-to-pass-the-input-form-to']);
    $('.l-general-confirm').text(langJson['l-general-confirm']);
}

function readOrDeletedMsg(msgObj) {
    if (msgObj.deleted_msg_id) {
        $('#content-inner-scroll-' + msgObj.ticket_id).find('#' + msgObj.deleted_msg_id).find('.content-bubble').addClass('my-auto')
            .empty().
            append('<span class="deleted-msg"><i class="fas fa-ban me-1"></i>This message was deleted</span>')
    }
}

// got social status from wise e.g. {ticket_id: -1944358426, ticket_status: "timeout"}
function addSocialStatus(obj) {
    var ticketId = obj.ticket_id;
    var ticketStatus = obj.ticket_status;
    var statusMsg = '';
    if (ticketStatus == 'timeout') {
        statusMsg = langJson['l-social-session-timeout'];
    } else if (ticketStatus == 'end') {
        statusMsg = langJson['l-social-session-ended'];
        if (noFormInSocial) {
            $('#end-' + ticketId).after('<button class="s-standalone-btn" title="Remove Ticket" onclick="removeTicket(' + ticketId + ')"><span class="align-sub"><i class="fas fa-eraser"></i></span></button>')
        }
    } else if (ticketStatus == 'left') {
        statusMsg = "You are not in the chat room anymore";// langJson['l-social-you-have-left-the-chat']; Changed on 2020-3 the user could be left because of barge in
    }
    var lastMsgSentTime = getSqlFormatTime();
    var lastMsgDate = SC.handleDate(lastMsgSentTime);
    var lastMsgTime = lastMsgDate == '' ? SC.returnTime(lastMsgSentTime, true) : "";

    // update bubble
    var theBubble = $('#bubble-' + ticketId);
    if (theBubble.length > 0) {

        // if don't have input form, remove ticket
        if (theBubble.find('.private-i').length == 0) {
            removeTicket(ticketId);
            return;
        }

        // update the bubble
        if (statusMsg.length > 0) { theBubble.find('.bubble-message').text(handleBubbleMsg(statusMsg)); }
        theBubble.addClass('bubble-closed');
        theBubble.css('background', 'rgba(0,0,0,0.01');
        theBubble.find('.bubble-subject').css("color", "#92959b");
        theBubble.find('.bubble-message').css("color", "#92959b");
        theBubble.find('.bubble-datetime').css("color", "#92959b");
        theBubble.find('.bubble-short-name').css("color", "#92959b");
        theBubble.find('.bubble-icon').css("opacity", "0.1");
        theBubble.find('.bubble-date').text(lastMsgDate);
        theBubble.find('.bubble-time').text(lastMsgTime);
    }

    // update content
    if (ticketStatus) {
        var statusDivId = ticketStatus + ticketId;
        if ($('#' + statusDivId).length == 0) {
            $('#content-inner-scroll-' + ticketId).append('<div id="' + statusDivId + '" class="text-center my-3"><span class="status-bubble">' + statusMsg + '</span></div>');
        }

        // scroll to the bottom
        var objDiv = document.getElementById('content-inner-scroll-' + ticketId);
        if (objDiv != null) {
            objDiv.scrollTop = objDiv.scrollHeight;
        }
    }

    var keyBtns = $('#content-' + ticketId).find('.keyboard-icon');
    keyBtns.prop("disabled", true);
    keyBtns.addClass("reply-btns-disable");

    $('#reply-textarea-' + ticketId).prop("disabled", true);

    $('#reply-btn-' + ticketId).prop("disabled", true).addClass("reply-btns-disable");

    theBubble.find('.fa-plus').remove();
    theBubble.find('.leave-chat-icon').remove();

    // could be system timeout
    if (WATimeOutObj[ticketId]) {
        clearTimeout(WATimeOutObj[ticketId]);
        delete WATimeOutObj[ticketId];
    }
}

// called for handle bubble's message
function handleBubbleMsg(msg, msg_object_client_name, msg_object_path) {
    if (msg != null && msg.length > 0) {
        return msg;
    } else if (msg_object_client_name || msg_object_path) {
        var fileName = '';
        if (msg_object_client_name && msg_object_client_name.length > 0) {
            fileName = msg_object_client_name;
        } else {
            try {
                fileName = msg_object_path.slice(msg_object_path.lastIndexOf('/') + 1);
            }
            catch (err) {

                console.log('Error in handleBubbleMsg');	// 20250407 Exceptions should not be ignored
                console.log(err);   //  

                return '';
            }
        }
        var extension = fileName.indexOf('.') > -1 ? (fileName.slice(fileName.indexOf('.') + 1)) : '';
        return extension.length > 0 ? ('[' + extension + '] ' + fileName) : fileName;
    } else {
        return '';
    }
}

function getSqlFormatTime() {
    var date;
    date = new Date();
    date = date.getFullYear() + '-' +
        ('00' + (date.getMonth() + 1)).slice(-2) + '-' +
        ('00' + date.getDate()).slice(-2) + ' ' +
        ('00' + date.getHours()).slice(-2) + ':' +
        ('00' + date.getMinutes()).slice(-2) + ':' +
        ('00' + date.getSeconds()).slice(-2);
    return date;
}

function cannedBtnClicked(campaign) {
    popupCampaign = campaign;
    var openWindows = parent.openWindows;
    var socialPopup = window.open('./socialPopup.html?type=msg', 'socialPop', 'toolbar=0,location=0,top=50, left=100,menubar=0,resizable=0,scrollbars=1,width=692,height=726');
    openWindows[openWindows.length] = socialPopup;
    socialPopup.onload = function () {
        socialPopup.onbeforeunload = function () {
            for (var i = 0; i < openWindows.length; i++) {
                if (openWindows[i] == socialPopup) {
                    openWindows.splice(i, 1);
                    break;
                }
            }
        }
    }
}

function shareBtnClicked(campaign) {
    popupCampaign = campaign;
    var openWindows = parent.openWindows;
    var socialPopup = window.open('./socialPopup.html?type=file', 'socialPop', 'toolbar=0,location=0,top=50, left=100,menubar=0,resizable=0,scrollbars=1,width=527,height=616');
    openWindows[openWindows.length] = socialPopup;
    socialPopup.onload = function () {
        socialPopup.onbeforeunload = function () {
            for (var i = 0; i < openWindows.length; i++) {
                if (openWindows[i] == socialPopup) {
                    openWindows.splice(i, 1);
                    break;
                }
            }
        }
    }
}

function endClicked(ticketId, oThis) {

    // close the tooltip
    $("div[role=tooltip]").remove();

    // get the entry type
    var entry = $(oThis).attr('entry');
    var confirmStr = '';
    if (entry == 'fb_comment' || entry == 'fb_post') {
        confirmStr = langJson['l-confirm-pass-agent-handling'];
    } else {
        confirmStr = langJson['l-confirm-end-the-session'];
    }
    if (confirm(confirmStr)) {
        if (entry == 'fb_comment' || entry == 'fb_post') {

            // to make the ticket not owned by the agent
            parent.document.getElementById("phone-panel").contentWindow.wiseAssignToChatRoom(ticketId, loginId, 'R');

            // put the ticket back to the queue
            parent.document.getElementById("phone-panel").contentWindow.wiseCompleteTicket(ticketId);

            // when refresh, parent.toBeUnloadedPost's tickets will be pushed back to queue
            parent.toBeUnloadedPost = parent.toBeUnloadedPost.filter(function (a) {
                return a !== ticketId
            })
            removeTicket(ticketId);

            if (fbPostTimeoutObj[ticketId]) {
                clearInterval(fbPostTimeoutObj[ticketId]);
                delete fbPostTimeoutObj[ticketId];
            }
        } else {

            // because WhatsApp took too long time to reponse successfully end ticket, so disable end ticket button first
            addSocialStatus({ ticket_id: ticketId });
            parent.document.getElementById("phone-panel").contentWindow.wiseCompleteTicket(ticketId);
        }
    }
}

function commentRowClicked(oThis, msgId) {
    var visitorRow = $(oThis);
    if (visitorRow.hasClass('selected-row')) {
        visitorRow.removeClass('selected-row');
    } else {
        visitorRow.addClass('selected-row');
    }
}

function sendSocialFile(ticketId, filePath, msgIdArr, commentIdArr) {

    // if fb comment need to check file format first
    if (commentIdArr != undefined) {
        var extension = filePath.slice(filePath.indexOf('.') + 1).toLowerCase();
        if (extension != 'jpg' && extension != 'png' && extension != 'gif') {
            alert('FB comment cannot reply by this file format');
            return;
        }
    }
    parent.sendSocialFile(presentTicketId, filePath, msgIdArr, function (r) {
        if (!/^success$/i.test(r.result || "")) {
            console.log('TBD msg: ' + JSON.stringify(r));
            var replyData = r.data;
            var alertStr = 'Failed to send the file';
            console.log('TBD r.msg: ' + replyData.msg);
            if (replyData.msg) {
                alertStr += ('\n' + replyData.msg);
            }
            console.log('TBD alertStr: ' + alertStr);
            alert(alertStr);

            var repliedFileName = replyData.originName;

            // the last image match the criteria -- as they agent may send same image more than one time
            var suffix = replyData.suffix;
            if (suffix == 'jpg' || suffix == '.png' || suffix == '.gif') {
                $('#content-inner-scroll-' + ticketId).find('img[title="' + repliedFileName + '"]').last().after(
                    '<span class="text-gray"><i class="fas fa-exclamation-circle me-2"></i>' + langJson['l-alert-send-file-failed'] + '</span>');
            } else {
                $('#content-inner-scroll-' + ticketId).find('a[href*="' + repliedFileName + '"]').last().after(
                    '<span class="text-gray ms-5"><i class="fas fa-exclamation-circle me-2"></i>' + langJson['l-alert-send-file-failed'] + '</span>');
            }
        } else {

            // sent successfully
            if (commentIdArr != undefined) {
                for (let msgId of msgIdArr) {
                    $('#content-inner-scroll-' + ticketId).find('div[msgId=' + msgId + ']').remove();
                }
            }
        }
    });
}

/* NO DEL may need in future
// emoji function here
function emojiBtnClicked(ticketId) {
    // display emoji container
    $('#emoji-container-' + ticketId).show();
    console.log('ticketId @ emojiBtnClicked'); console.log(ticketId);
}

function emojiClicked(iThis) {
    console.log('iThis'); console.log(iThis);
    console.log("$(iThis).children()"); console.log($(iThis).children());
    var emojiIcon = $(iThis).children()[0].innerHTML;
    console.log('emojiIcon'); console.log(emojiIcon);
    var replyTextarea = $('#reply-textarea-' + presentTicketId);
    var replyMsg = replyTextarea.val() || '';
    replyTextarea.val(replyMsg + emojiIcon);
}

function closeEmoji() {
    $('#emoji-container-' + presentTicketId).hide();
}
*/

function uploadAttachment(input, ticketId) {

    // if open browse file window but did not choose any file, will reply input undefined
    if (input == undefined) { return; }

    // verify did select file before upload for fb comment
    var entry = $('#reply-btn-' + ticketId).attr('entry');
    var msgIdArr = null;
    var commentIdArr = [];
    if (entry == 'fb_comment' || entry == 'fb_post') {
        msgIdArr = [];
        var selectedMsgs = $('#content-inner-scroll-' + ticketId).find('.selected-row');
        if (selectedMsgs != undefined && selectedMsgs.length > 0) {
            for (let theMsg of selectedMsgs) {
                var selectedMsg = $(theMsg);
                msgIdArr.push(selectedMsg.attr('msgId'));
                commentIdArr.push(selectedMsg.attr('commentId'));
            }
        }
        console.log('msgIdArr'); console.log(msgIdArr);
        if (msgIdArr == null || msgIdArr.length == 0) {
            alert('Please select at least one comment to reply');
            return;
        }
    }
    var limitedSizeMB = 10;// default limit 10MB
    var inputFiles = input.files;

    // only can select 1 file, verify the file size
    var attachment = inputFiles[0];

    if (attachment != undefined) {
        if (attachment.size / 1024 / 1024 > limitedSizeMB) {
            alert('The attachment ' + attachment.name + '\'s exceed ' + limitedSizeMB + 'MB');
            return; // breaks one iteration in the loop
        }
    } else {

        // cancel upload attachment will call this function also
        return;
    }
    var attachmentName = attachment.name == undefined ? '' : attachment.name;
    attachmentName = attachmentName.replace(/[ |+|#]/g, '_').replace('%20', '_').replace(/[%']/g, '');
    if (entry == 'fb_comment' || entry == 'fb_post') {

        // because other than type of below, reply comment fail iXServer will not have error
        var extension = attachmentName.slice(attachmentName.indexOf('.') + 1).toLowerCase();
        if (extension != 'jpg' && extension != 'png' && extension != 'gif' && extension != 'jpeg') {
            alert('FB comment cannot reply by this file format');
            return;
        }
    }
    var fileData = new FormData();
    fileData.append("files", attachment, attachmentName);
    fileData.append('agentId', loginId);
    fileData.append('ticketId', ticketId);  // for Create New Case no case no yet, so provide internal case no
    $.ajax({
        type: "POST",
        url: wiseHost + '/WisePBX/api/SocialMedia/UploadFile',
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
            var fileUrl = fileDetails.FileUrl;
            if (!fileUrl.includes('http')) {
                fileUrl = ('http://' + fileUrl)
            }

            // as file spent too much time to deliver and return to us that is successuflly, so want to create the bubble first
            if (entry != 'fb_comment') {
                createOrUpdateBubble({
                    'ticket_id': ticketId,
                    'msg_list': [{
                        'nick_name': agentName,
                        'send_by_flag': 1,
                        'sent_time': getSqlFormatTime(),
                        'msg_object_path': fileUrl,
                        'msg_object_client_name': fileDetails.FileName
                    }
                    ]
                });
            }

            parent.sendSocialFile(ticketId, fileDetails.FilePath, msgIdArr, function (r) {
                if (/^success$/i.test(r.result || "")) {
                    if (entry != 'fb_comment') {

                        $('#content-inner-scroll-' + ticketId).find('a[href="' + fileUrl + '"]').after('<span class="wa-sent-success">sent</span>')

                        // TBD deplicated, as upload and response took too much time, created bubble first
                        // createOrUpdateBubble({ 'ticket_id': ticketId, 'msg_list': [{ 'nick_name': agentName, 'send_by_flag': 1, 'sent_time': getSqlFormatTime(), 'msg_object_path': fileUrl, 'msg_object_client_name': fileDetails.FileName }] });
                    } else {

                        // remove message(s)
                        for (let msgId of msgIdArr) {
                            $('#content-inner-scroll-' + ticketId).find('div[msgId=' + msgId + ']').remove();
                        }

                        // load message
                        getFBComments(ticketId, true, commentIdArr);
                        console.log("entry == 'fb_comment'"); console.log(entry == 'fb_comment');
                    }
                } else {

                    $('#content-inner-scroll-' + ticketId).find('a[href="' + fileUrl + '"]').preanet().preanet().empty().append(fileDetails.FileName + " failed to send to the customer<br>[THIS MESSAGE WILL NOT BE SHOWN IN CUSTOMER'S WINDOW]")

                    // TBD deplicated, as upload and response took too much time, created bubble first
                    // createOrUpdateBubble({
                    //     'ticket_id': ticketId,
                    //     'msg_list': [{
                    //         id: new Date().getUTCMilliseconds(),
                    //         'nick_name': agentName,
                    //         'send_by_flag': 1,
                    //         'sent_time': getSqlFormatTime(),
                    //         msg_type: "text",
                    //         msg_content: fileDetails.FileName + " failed to send to the customer<br>[THIS MESSAGE WILL NOT BE SHOWN IN CUSTOMER'S WINDOW]",
                    //         isSuccess: false
                    //     }]
                    // });
                    alert('Failed to send the file');
                    console.log('Failed to send the file'); console.log(r);
                }
            });

        }
    });
}

function bubbleClicked(bubbleTicketId) {
    if (presentTicketId != bubbleTicketId) {

        // existing content hide
        $('#content-' + presentTicketId).hide();
        $('#search-input-' + presentTicketId).hide();
        $('#content-' + bubbleTicketId).show();
        $('#search-input-' + bubbleTicketId).show();
        var theBubble = $('#bubble-' + bubbleTicketId);
        if (theBubble.hasClass("bubble-unread")) {
            theBubble.removeClass("bubble-unread");
        }

        // remove previous present bubble if available
        var presentBubble = $('.bubble-present');
        if (presentBubble.length > 0) {
            presentBubble.removeClass('bubble-present');
        }
        theBubble.addClass('bubble-present');
        presentTicketId = bubbleTicketId;

        // resize height by entry
        var bubbleSrc = theBubble.find('.bubble-icon').attr('src') || [];
        if (bubbleSrc.includes('facebook_icon') || noFormInSocial) { // fb_comment

            // ----------------- fb_comment now -----------------
            $('#bubble-list-inner').height('calc(100vh - 29px)');
        } else {
            // ----------------- NON fb_comment now -----------------
            $('#bubble-list-inner').height('752px');
        }

        // scroll to the bottom
        var objDiv = document.getElementById('content-inner-scroll-' + bubbleTicketId);
        objDiv.scrollTop = objDiv.scrollHeight;
    }
}

function pasteIntoInput(el, text) {
    el.focus();
    if (typeof el.selectionStart == "number" &&
        typeof el.selectionEnd == "number") {
        var val = el.value;
        var selStart = el.selectionStart;
        el.value = val.slice(0, selStart) + text + val.slice(el.selectionEnd);
        el.selectionEnd = el.selectionStart = selStart + text.length;
    } else if (typeof document.selection != "undefined") {
        var textRange = document.selection.createRange();
        textRange.text = text;
        textRange.collapse(false);
        textRange.select();
    }
}

function coachTextareaPressed(e) {
    if (e.keyCode == 13 && !e.shiftKey) {
        e.preventDefault();
        var textareaId = e.target.id; // e.g. reply-textarea-[ticket id here]
        var ticketId = textareaId.slice(10);
        sendCoach(ticketId);
        return false;
    }
}

function textareaPressed(e) {
    if (e.keyCode == 13 && !e.shiftKey) {
        e.preventDefault();
        var textareaId = e.target.id; // e.g. reply-textarea-[ticket id here]
        var ticketId = textareaId.slice(15);
        replyClicked(ticketId);
        return false;
    }
}

function sendCSInput(ticketId) {
    if (sendTypingAllowed) {
        sendTypingAllowed = false;
        parent.document.getElementById("phone-panel").contentWindow.wiseSendCSInputtingState(ticketId);
        setTimeout(function () {
            sendTypingAllowed = true;
        }, 2000);
    }
}

function replyClicked(ticketId) {
    var replyTextarea = $('#reply-textarea-' + ticketId);
    var replyMsg = (replyTextarea.val() || '').trim();
    var replyBtn = $('#reply-btn-' + ticketId);
    var msgIdArr = null;
    var commentIdArr = null;
    var entry = replyBtn.attr('entry');
    var discardOnlyMsgArr = [];
    if (entry == 'fb_comment' || entry == 'fb_post') {
        msgIdArr = [];
        commentIdArr = [];
        var selectedMsgs = $('#content-inner-scroll-' + ticketId).find('.selected-row');
        if (selectedMsgs != undefined && selectedMsgs.length > 0) {
            for (let theSelected of selectedMsgs) {
                var selectedMsg = $(theSelected);
                msgIdArr.push(selectedMsg.attr('msgId'));
                commentIdArr.push(selectedMsg.attr('commentId'));

                // if have additional-msg-id attribute add it to the to discard msg array also
                if (selectedMsg.data("additional-msg-id") != undefined) {
                    discardOnlyMsgArr.push(selectedMsg.data("additional-msg-id"));
                }
            }
        }
        if (msgIdArr == null || msgIdArr.length == 0) {

            // no longer handle this ticket by the agent                    
            alert(langJson['l-alert-not-selected-comment']);
            return;
        }
    }
    if (replyMsg.length > 0) {

        // disable ‘send msg’ button before send out
        replyBtn.prop("disabled", true);
        parent.sendSocialMsg(ticketId, replyMsg, msgIdArr, function (r) {
            if (entry == 'fb_comment' || entry == 'fb_post') {

                // remove message(s)
                for (let theMsg of msgIdArr) {
                    $('#content-inner-scroll-' + ticketId).find('div[msgId=' + theMsg + ']').remove();
                }

                // when have txt + video, the additional one just need to discard it
                if (discardOnlyMsgArr.length > 0) {
                    parent.sendSocialMsg(ticketId, '', discardOnlyMsgArr, function (r) { }, -1);
                }

                // load message
                getFBComments(ticketId, commentIdArr);
            } else {

                // phone.html old version r.result can be empty string''
                if (r.result == 'fail') {
                    alert(langJson['l-alert-send-message-failed']);
                } else {
                    var msgId = (r && r.data && r.data.id) ? r.data.id : -1;
                    createOrUpdateBubble({
                        'ticket_id': ticketId,
                        'msg_list': [{
                            'id': msgId,
                            'nick_name': agentName,
                            'send_by_flag': 1,
                            'sent_time': getSqlFormatTime(),
                            'msg_content': replyMsg
                        }]
                    });
                }
            }
            replyBtn.prop("disabled", false);
        });
        replyTextarea.val("");
    } else {
        alert(langJson['l-alert-reply-message-blank']);
    }
}

function passFormConfirmClicked() {
    var ticketId = tempTicketId;
    var selectedInput = $("input[name='agentList']:checked");
    var invitedAgentID = selectedInput.val();
    var searchFormType = '';
    var searchInputDiv = $('#search-input-' + ticketId);
    var searchInputHtml = $("<div />").append(searchInputDiv.clone()).html();
    if ($('#input-form-' + ticketId).css('display') == 'none') {
        searchFormType = 'search';
        parent.document.getElementById("phone-panel").contentWindow.wiseSendMessage_UC(3, parseInt(invitedAgentID), 'systemMsg-`!^~' + searchFormType + '-`!^~' + ticketId + '-`!^~' + searchInputHtml);
        searchInputDiv.remove();
    } else {
        searchFormType = 'input';

        // save the form
        document.getElementById('input-form-' + ticketId).contentWindow.saveClicked(true, function (formData, formType) {
            parent.document.getElementById("phone-panel").contentWindow.wiseSendMessage_UC(3, parseInt(invitedAgentID), 'systemMsg-`!^~' + searchFormType + '-`!^~' + ticketId + '-`!^~' + searchInputHtml + '-`!^~' + JSON.stringify(formData) + '-`!^~' + formType);
            searchInputDiv.remove();
        });
    }
    // update pass form icon
    // NO DEL
    // var leaveChatIcon = $('#bubble-' + ticketId).find('.pass-form-icon');
    // leaveChatIcon.remove();
    // /NO DEL
    $('#inputFormModal').modal('toggle');
    tempTicketId = null;
}

function passFormClicked(ticketId) {
    $('#input-form-ticketid').html(ticketId);
    var agentArrDivs = '';
    var confAgentAttr = $('#channel-' + ticketId).attr('roomAgents') || '';
    var roomAgents = confAgentAttr != null && confAgentAttr.length > 0 ? confAgentAttr.split(',') : [];
    //var agentArrDivs = '' // 20200326 Review this redundant assignment: "agentArrDivs" already holds the assigned value along all execution paths.
    for (let theAgentId of roomAgents) {
        if (theAgentId != loginId) {
            var agentName = parent.getAgentName(theAgentId);
            agentArrDivs += ('<div class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="formList" value="' + theAgentId + '" id="agent-' + theAgentId + '">' + agentName + '&nbsp;(ID: ' + theAgentId + ')<span class="circle"><span class="check"></span></span></label></div>');
        }
    }
    $('#input-form-arr').html(agentArrDivs);
    $('#inputFormModal').modal('show');
    tempTicketId = ticketId;
}

function groupChatTooltip(roomAgentArr, ticketId) {
    var channelIcon = $('#channel-' + ticketId);
    if (roomAgentArr.length <= 1) {

        // remove tooltip and attribute
        channelIcon.removeAttr('data-original-title');
        channelIcon.removeClass('group-chat');
        channelIcon.attr('roomAgents', null);
    } else {
        var title = 'For reference only, agents in the chatroom: ';
        for (var i = 0; i < roomAgentArr.length; i++) {
            var theAgentId = roomAgentArr[i];
            var theAgentName = parent.getAgentName(theAgentId);
            if (i != 0) {
                title += ', ';
            }
            title += (theAgentName + ' (' + theAgentId + ')');
        }
        channelIcon.attr('data-original-title', title);
        channelIcon.addClass('group-chat');
        channelIcon.attr('roomAgents', roomAgentArr.join());
    }
    channelIcon.tooltip();
}

function agentAddGroupChat(ticketId, toAddAgentId, typeId) {
    var statusMsg = "";
    var agentNameStr = parent.getAgentName(toAddAgentId) + ' (ID: ' + toAddAgentId + ')';

    // silent: typeId = 1, no notice now
    if (typeId == 0) {
        statusMsg = agentNameStr + ' has joined to the chatroom';
    } else if (typeId == 2) {
        statusMsg = agentNameStr + ' has barged into the chatroom';
    }
    $('#content-inner-scroll-' + ticketId).append('<div class="text-center my-3"><span class="status-bubble">' + statusMsg + '</span></div>');

    // scroll to the bottom
    var objDiv = document.getElementById('content-inner-scroll-' + ticketId);
    if (objDiv != null) {
        objDiv.scrollTop = objDiv.scrollHeight;
    }
}

function agentleftGroupChat(ticketId, toRemoveAgentId, typeId) {
    if (toRemoveAgentId == loginId) {
        addSocialStatus({ ticket_id: ticketId, ticket_status: 'left' });
    } else {
        var statusMsg = "";
        var agentNameStr = parent.getAgentName(toRemoveAgentId) + ' (ID: ' + toRemoveAgentId + ')';
        if (typeId == 0) {
            statusMsg = agentNameStr + ' is not in the chat room anymore' // ' has left the chatroom'; Changed on 2020-3 the user could be left because of barge in
        }
        $('#content-inner-scroll-' + ticketId).append('<div class="text-center my-3"><span class="status-bubble">' + statusMsg + '</span></div>');
        // scroll to the bottom
        var objDiv = document.getElementById('content-inner-scroll-' + ticketId);
        if (objDiv != null) {
            objDiv.scrollTop = objDiv.scrollHeight;
        }
    }
}

function handleSystemMsg(sentMsgAgent, msgType, ticketId, MsgOrHtml, formData, formType) {

    // var bubbleTicket = $('#bubble-' + ticketId); // NO DEL may need in future

    var channelIcon = $('#channel-' + ticketId);
    var agentNameStr = parent.getAgentName(sentMsgAgent) + ' (ID: ' + sentMsgAgent + ')';
    if (msgType == 'coach') {
        var statusMsg = agentNameStr + ' sent you a coach msg:<div>' + MsgOrHtml + '</div>';
        $('#content-inner-scroll-' + ticketId).append('<div style="text-align:center;margin:23px;"><div class="coach-bubble"><img style="position:relative;" src="./images/white-warning-16.svg" /><span style="margin-left:7px;"><span>' + statusMsg + '</span></span></div></div>');

        // scroll to the bottom
        var objDiv = document.getElementById('content-inner-scroll-' + ticketId);
        if (objDiv != null) {
            objDiv.scrollTop = objDiv.scrollHeight;
        }
    } else if (msgType == 'accept') {

        // if include the agent should add
        var statusMsg = '';
        if (MsgOrHtml.length == 0) {
            statusMsg = agentNameStr + ' has accepted your request';
        } else {
            statusMsg = agentNameStr + ' has accepted your request with message:<div>' + MsgOrHtml + '</div>';
        }
        $('#content-inner-scroll-' + ticketId).append('<div class="text-center my-3"><span class="status-bubble">' + statusMsg + '</span></div>');

        // NO DEL no need for now
        // if ($('#search-input-' + ticketId).length > 0) {
        //     // if having the input form, have forward button
        //     $('<i class="fas fa-share pass-form-icon bubble-small-icon me-2" onclick="return passFormClicked(' + ticketId + ');"></i>').insertBefore(bubbleTicket.find('.leave-chat-icon'));
        // }
        // /NO DEL

        // scroll to the bottom
        var objDiv = document.getElementById('content-inner-scroll-' + ticketId);
        if (objDiv != null) {
            objDiv.scrollTop = objDiv.scrollHeight;
        }
        return;
    } else if (msgType == 'reject') {
        if (MsgOrHtml.length == 0) {
            alert(agentNameStr + langJson['l-alert-rejected-conference-only'] + ticketId);
        } else {
            alert(agentNameStr + langJson['l-alert-rejected-conference-only'] + ticketId + langJson['l-alert-rejected-conference-message'] + MsgOrHtml);
        }
        return;
    } else if (msgType == 'search') {

        // NO DEL
        // $('<i class="fas fa-share pass-form-icon bubble-small-icon me-2" onclick="return passFormClicked(' + ticketId + ');"></i>').insertBefore(bubbleTicket.find('.leave-chat-icon'));
        // /NO DEL

        $('#search-input-section').append(MsgOrHtml);
        if (presentTicketId == ticketId) {
            $('#search-input-' + ticketId).show();
        } else {
            $('#search-input-' + ticketId).hide();
        }
        return;

        // present input form show on top
    } else if (msgType == 'input') {

        // NO DEL
        // $('<i class="fas fa-share pass-form-icon me-2 bubble-small-icon" onclick="return passFormClicked(' + ticketId + ');"></i>').insertBefore(bubbleTicket.find('.leave-chat-icon'));
        // /NO DEL

        alert(agentNameStr + langJson['l-alert-passed-input-form'] + ticketId);
        customerData = JSON.parse(formData);
        customerData.inheritAll = true; // only in this case, input form will show the last case's details and contact method, etc.
        type = formType; // newCustomer, newCase, newUpdate
        $('#search-input-section').append(MsgOrHtml); // add input form iframe
        if (presentTicketId == ticketId) {
            $('#search-input-' + ticketId).show();
        } else {
            $('#search-input-' + ticketId).hide();
        }
        return;
    }
}

function addOldHistory(msgObj, ticketId, ticketLength) {
    console.log('addOldHistory msgObj');
    console.log(msgObj);

    // add message to old history
    oldTicketCountObj[ticketId] = (oldTicketCountObj[ticketId] + 1)
    var oldTicketCount = oldTicketCountObj[ticketId]
    ticketLength = Number(ticketLength);
    var msgList = msgObj.data.msg_list;
    var oldTicketList = oldTicketListObj[ticketId];
    var oldHistory = oldHistoryObj[ticketId];
    var theOldMsgTicketId = msgObj.ticket_id
    var msgIndex = oldTicketList.indexOf(theOldMsgTicketId);
    oldHistory[msgIndex] = msgList;
    var isFB = msgObj.entry == 'facebook';

    if (oldTicketCount == ticketLength) {
        var entry = msgObj.entry;
        var showedOldMsgs = 0;
        var contentScrollDiv = $('#content-inner-scroll-' + ticketId);
        var lastScrollHeight = isNewGetTicket ? null : contentScrollDiv[0].scrollHeight; // get the scroll height, so can remain same position after loading
        var formNameStr = '';
        var formName = contentScrollDiv.attr('formName');
        if (formName != undefined && formName.length > 0) {
            formNameStr = ' (' + formName + ')'
        }
        var theMsgContentDisplay, handleContentMsgObj = {};
        for (var i = oldHistory.length - 1; i >= 0; --i) {
            var theSession = oldHistory[i];

            // start from last messages
            contentScrollDiv.prepend('<div ticket-id="' + oldTicketList[i] + '"class="dotted-line"></div>');
            for (var j = theSession.length - 1; j >= 0; --j) {
                var theMsg = theSession[j];
                var sentTime = SC.returnDateTime(theMsg.sent_time);
                var theMsgDate = SC.handleDate(sentTime);
                var theMsgTime = theMsgDate == '' ? sentTime.slice(11, 19) : "";
                theMsgContentDisplay = (theMsg.msg_content || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
                var msgObjectPath = theMsg.msg_object_path;
                var msgRowId = (theMsg.sc_comment_id + sentTime + theMsg.nick_name).replace(/[ .:]/g, '');
                if (theMsg.msg_type != 'tp_qr' && theMsg.msg_type != 'tp_cta') {
                    theMsgContentDisplay = SC.linkify(theMsgContentDisplay);
                }
                if (msgObjectPath != null) {
                    handleContentMsgObj = SC.handleContentMsg(msgObjectPath, theMsg.msg_object_client_name, theMsg.msg_type);
                    theMsgContentDisplay += ('<div>' + handleContentMsgObj.text + '</div>');
                }
                if (theMsg.msg_type == 'tp_qr') {
                    handleContentMsgObj = SC.handleWATpQRMsg(theMsgContentDisplay)
                    theMsgContentDisplay = handleContentMsgObj.text
                } else if (theMsg.msg_type == 'tp_cta') {
                    handleContentMsgObj = SC.handleWATpCTAMsg(theMsgContentDisplay)
                    theMsgContentDisplay = handleContentMsgObj.text
                }

                // msg content null and msg object path null, is a balnk message means the enduser deleted a message by themself
                if (theMsgContentDisplay == '') {
                    theMsgContentDisplay = '[ Customer deleted or edited a message / Received an unsupported file ]';
                }

                // Lazy loading so no need lastConversationStr
                if (theMsg.send_by_flag == 2) { //發送者1:客服,2:enduser{

                    // Lazy loading so no need lastConversationStr
                    var userNameStr = theMsg.msg_completed == -2 ? '' : '<div><span class="content-bubble-name">' + SC.handleBubbleName(theMsg.nick_name, null, null, true) + formNameStr + '</span></div>';
                    var bubbleClassStr = 'visitor-content-bubble content-bubble';
                    if (theMsg.msg_completed == -2) {
                        theMsgContentDisplay = '<span class="deleted-msg"><i class="fas fa-ban me-1"></i>This message was deleted</span>'
                        bubbleClassStr += ' my-2';
                    }

                    var userIconStr = isFB ? '<img class="user-icon" src="' + theMsg.profile_pic + '" onerror="if (this.src != \'./images/user.png\') this.src = \'./images/user.png\';" />' :
                        '<span class="user-icon"><i class="fas fa-user"></i></span>';
                    contentScrollDiv.prepend('<div id="' + msgRowId + '" class="message-row"><div>' + userIconStr + '<div class="time-with-seconds" title="' + sentTime + '"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div><div class="' + bubbleClassStr + '">' + userNameStr + '<div class="content-bubble-content">' + theMsgContentDisplay + '</div></div></div>');
                } else {
                    var agentBubbleName = theMsg.sender == '0' ? 'SYSTEM' : isNaN(theMsg.sender) ? (isNaN(theMsg.nick_name) ? theMsg.nick_name : parent.getAgentName(Number(theMsg.nick_name))) : parent.getAgentName(Number(theMsg.sender));

                    // Lazy loading so no need lastConversationStr
                    contentScrollDiv.prepend('<div id="' + msgRowId + '" class="message-row agent-row"><div class="agent-content-bubble"><div class="content-bubble"><span class="content-bubble-name">' + agentBubbleName + '</span></div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div><div><span class="user-icon"><i class="fas fa-user"></i></span><div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div></div>')
                }

                if (theMsg.reply_msg) {
                    var replyBubbleStr = '';
                    var reply_msg = theMsg.reply_msg;
                    var bubbleNow = $('#' + msgRowId).find('.content-bubble');
                    theMsgContentDisplay = (reply_msg.msg_content || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    var replyMsgMsgType = reply_msg.msg_type;
                    if (replyMsgMsgType != 'tp_qr' && replyMsgMsgType != 'tp_cta') {
                        theMsgContentDisplay = SC.linkify(theMsgContentDisplay);
                    }
                    var replyMsgObjPath = reply_msg.msg_object_path

                    if (replyMsgObjPath != null) {
                        handleContentMsgObj = SC.handleContentMsg(reply_msg.msg_object_path, reply_msg.msg_object_client_name, reply_msg.msg_type);
                        theMsgContentDisplay = handleContentMsgObj.text + '<div>' + theMsgContentDisplay + '</div>'
                    }

                    if (replyMsgMsgType == 'tp_qr') {
                        handleContentMsgObj = SC.handleWATpQRMsg(theMsgContentDisplay)
                        theMsgContentDisplay = handleContentMsgObj.text
                    } else if (replyMsgMsgType == 'tp_cta') {
                        handleContentMsgObj = SC.handleWATpCTAMsg(theMsgContentDisplay)
                        theMsgContentDisplay = handleContentMsgObj.text
                    }
                    if (reply_msg.send_by_flag == 2) { //發送者1:客服,2:enduser{
                        replyBubbleStr = ('<div class="reply-bubble reply-cust"><div class="content-bubble-name">' +
                            reply_msg.nick_name +
                            formNameStr + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div>');
                    } else {
                        var agentBubbleName = reply_msg.sender == '0' ? 'SYSTEM' : isNaN(reply_msg.sender) ? (isNaN(reply_msg.nick_name) ? reply_msg.nick_name : parent.getAgentName(Number(reply_msg.nick_name))) : parent.getAgentName(Number(reply_msg.sender));
                        replyBubbleStr = ('<div class="reply-bubble reply-agent"><div class="content-bubble-name">' +
                            agentBubbleName +
                            '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div>');
                    }
                    $(replyBubbleStr).prependTo(bubbleNow);
                }

                showedOldMsgs += 1;
                if (showedOldMsgs == 500) {
                    break;  //break nested loop
                }
            }
            if (showedOldMsgs == 500) {
                break;  //break loop
            }
        }

        if (isNewGetTicket) {

            // scroll to the bottom
            contentScrollDiv.scrollTop(contentScrollDiv[0].scrollHeight);
            isNewGetTicket = false;
        } else {

            // Lazy loading so no need to scroll to the bottom, but scroll to the original position
            var scrollDiff = contentScrollDiv[0].scrollHeight - lastScrollHeight;
            contentScrollDiv.scrollTop(contentScrollDiv[0].scrollTop + scrollDiff);
        }

        delete oldHistoryObj[ticketId]
        delete oldTicketListObj[ticketId]
        delete oldTicketCountObj[ticketId]

        // if the container have no scroll bar, need to load more, so infinit load more can be effective
        // loop to get enduer_id, 
        // get the company_code
        var scrollDiv = contentScrollDiv[0]
        if (scrollDiv.scrollHeight <= scrollDiv.clientHeight) {
            var theBubble = $('#bubble-' + ticketId)
            var enduser_id = theBubble.attr('enduserid')
            var company_code = theBubble.attr('companycode')
            GetPreviousTicketId(enduser_id, entry, msgObj.ticket_id, company_code, ticketId);
        }
    }

    // delete main obj
    if (parent.mainOldTicketObj[theOldMsgTicketId] != undefined) {
        delete parent.mainOldTicketObj[theOldMsgTicketId]
    }
}


function gotMsgHistory(msgObj, openConnId) { // got event from wise
    var inputFormFrame = document.getElementById('input-form-' + openConnId)
    var onlineFormData = msgObj.online_form_data;
    for (var i = 0; i < onlineFormData.length; i++) {
        var theField = onlineFormData[i];
        if (theField.field_name == 'More') {
            var moreObj = JSON.parse(theField.field_value || {});
            onlineFormData.splice(i, 1);		// delete onlineFormData.splice(i, 1);		20250331 "delete" should be used only with object properties (the logic actually is not work)
            var theSource = '';
            if (moreObj.source) {
                if (moreObj.source != "") {
                    theSource = moreObj.source;
                } else {
                    theSource = 'My HK Guide'; //MYHKG have no source 
                }
                onlineFormData.push({
                    field_name: "Source",
                    field_value: theSource
                });
            }
            if (moreObj.companyName && moreObj.companyName != "" && moreObj.companyName != "undefined") {
                onlineFormData.push({
                    field_name: "Webchat Location",
                    field_value: moreObj.companyName
                });
            }
            if (moreObj.lang && moreObj.lang != "") {
                onlineFormData.push({
                    field_name: "Language",
                    field_value: moreObj.lang
                });
            }
            if (moreObj.qrcode && moreObj.qrcode != "") {
                onlineFormData.push({
                    field_name: "QR Code",
                    field_value: moreObj.qrcode
                });
            }
            if (moreObj.location && moreObj.location != "") {
                onlineFormData.push({
                    field_name: "Country",
                    field_value: moreObj.location
                });
            }
            if (moreObj.brower_user_agent && moreObj.brower_user_agent != "") {
                onlineFormData.push({
                    field_name: "Browser",
                    field_value: moreObj.brower_user_agent
                });
            }
            break;
        }
    }
    var casePopup = inputFormFrame.contentWindow.caseRecordPopup;
    casePopup.window.generateSocialHistory(msgObj);
}

// remove the session display
function removeTicket(ticketId) {

    // remove bubble
    $('#bubble-' + ticketId).remove();

    // remove content
    $('#content-' + ticketId).remove();

    // remove input form
    $('#search-input-' + ticketId).remove();

    // if bubble list is 0, turn to default page
    var bubbleChildren = $('#bubble-list-inner').children();
    if (bubbleChildren.length == 0) {
        $('#default-content-container').show();
        window.scrollTo(0, 0);
    } else {

        // click the top one
        $(bubbleChildren[0]).trigger('click');
    }
}

// inputform.html submitted case: 1. if chat ended, close all 2. if chat not ended yet, mark down it and close all when chat ended
function savedCase(ticketId) {

    // check have the session ended
    var theBubble = $('#bubble-' + ticketId);
    theBubble.addClass("case-saved")
    var noFollowupBtn = $('#input-form-' + ticketId).contents().find('#no-followup-btn');

    if (noFollowupBtn.length == 0) {
        $('#input-form-' + ticketId).contents().find('#save-btn-section').append('<button id="no-followup-btn" class="btn btn-warning rounded btn-sm text-capitalize" onclick="return parent.leaveChat(' + ticketId + ',true)"><i class="fa fa-sign-out-alt me-2"></i><span>Leave Without Follow-up Action</span></button>');
    }
}

function gotFBPostInfo(postObj) {
    var msg = postObj.message;
    var ticketId = postObj.ticket_id;

    // update bubble message
    $('#bubble-' + ticketId).find('.bubble-message').text(handleBubbleMsg(msg));

    // add to right panel
    $('#fb-title-' + ticketId).text(msg);
}

function loadFBReplies(oThis, ticketId, scrollDown) {
    var theTag = $(oThis);
    var commentId = theTag.attr('commentId');
    $.ajax({
        type: "POST",
        url: wiseHost + '/WisePBX/api/SocialMedia/GetFBReplyComments',
        data: JSON.stringify({
            "ticketId": ticketId,
            "CommentId": commentId
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in getFBComments');
            } else {
                var data = r.data;

                // add history row
                for (var i = (data.length - 1); i >= 0; i--) {
                    var theMsg = data[i];
                    var theMsgContentDisplay = (theMsg.msg_content || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    var sentTime = theMsg.sent_time;
                    var theMsgDate = SC.handleDate(sentTime);
                    var theMsgTime = theMsgDate == '' ? SC.returnTime(sentTime, true) : "";
                    var msgObjectPath = theMsg.msg_object_path;
                    if (msgObjectPath != null && msgObjectPath.length > 0) {
                        msgObjectPath = msgObjectPath.replace('./', fbHistoryfileHost);
                        var handleContentMsgObj = SC.handleContentMsg(msgObjectPath, theMsg.msg_object_client_name, theMsg.msg_type);
                        theMsgContentDisplay += ('<div>' + handleContentMsgObj.text + '<div>');
                    }

                    // msg content null and msg object path null, is a balnk message means the enduser deleted a message by themself
                    if (theMsgContentDisplay == '') {
                        theMsgContentDisplay = '[ Customer deleted or edited a message / Received an unsupported file ]';
                    }
                    var lastBubbleId = i == (data.length - 1) ? ' id="last-bubble-commentid-' + theMsg.sc_comment_id + '"' : '';

                    // 發送者1:客服,2:enduser
                    if (theMsg.send_by_flag == 2) {
                        var msgRowId = (theMsg.sc_comment_id + sentTime + theMsg.nick_name).replace(/[ .:]/g, '');

                        // customer if send pic/video with text, will be divided in to 2 messages
                        if ($('#' + msgRowId).length > 0) {

                            // normally picture appened first
                            if (theMsg.msg_type == 'text') {
                                $('#' + msgRowId).find('.content-bubble-content').prepend('<div>' + theMsgContentDisplay + '</div>')
                            } else {
                                $('#' + msgRowId).find('.content-bubble-content').append('<div>' + theMsgContentDisplay + '</div>')
                            }
                        } else {
                            theTag.after('<div' + lastBubbleId + ' class="fb-reply-row"><div id="' + msgRowId + '">' +
                                '<img class="user-icon" src="' + theMsg.profile_pic + '" onerror="if (this.src != \'./images/user.png\') this.src = \'./images/user.png\';" />' +
                                '<div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div><div class="visitor-content-bubble fb-visitor-reply-bubble ms-0"><div class="content-bubble-name">' + SC.handleBubbleName(theMsg.nick_name, null, null, true) + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div></div>');
                        }
                    } else {
                        var agentBubbleName = theMsg.sender == '0' ? 'SYSTEM' : isNaN(theMsg.sender) ? (isNaN(theMsg.nick_name) ? theMsg.nick_name : parent.getAgentName(Number(theMsg.nick_name))) : parent.getAgentName(Number(theMsg.sender)); // FB messenger greeting's nick name is customer
                        theTag.after('<div' + lastBubbleId + ' class="fb-reply-row"><div><span class="user-icon"><i class="fas fa-user"></i></span><div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div><div class="fb-agent-bubble ms-0 w-auto"><div class="content-bubble-name">' + agentBubbleName + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div></div>');
                    }
                }
                theTag.remove();

                //  scroll to the bottom of the reply(normal click 'View x Replies will not scroll down)
                if (scrollDown) {
                    var lastBubbleOffset = $('#last-bubble-commentid-' + data[data.length - 1].sc_comment_id).offset();
                    if (lastBubbleOffset != undefined) {
                        $('#fb-scroll-' + ticketId).animate({
                            scrollTop: lastBubbleOffset.top
                        }, 1000);
                    }
                }
            }
        },
        error: function (r) {
            console.log('error in getFBComments');
            console.log(r);
        }
    });
}

function fbMoreComments(ticketId, aboveMsgId, oThis) {
    $.ajax({
        type: "POST",
        url: wiseHost + '/WisePBX/api/SocialMedia/GetFBComments',
        data: JSON.stringify({
            "ticketId": ticketId,
            "aboveMsgId": String(aboveMsgId),
            "number": 50
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in getFBComments');
                $(oThis).remove(); // to avoid find comments forever loop
            } else {
                $(oThis).remove();
                var data = r.data;

                // remaining no. of messages not showed yet
                var total = r.total;
                var remainNo = total - 50;

                // add history row
                var contentScrollDiv = $('#fb-content-' + ticketId);
                var prependDiv = '';
                var lastContentId = '';

                for (let theMsg of data) {
                    var theMsgContent = theMsg.msg_content;
                    var theMsgContentDisplay = '';
                    var sentTime = theMsg.sent_time;
                    var theMsgDate = SC.handleDate(sentTime);
                    var theMsgTime = theMsgDate == '' ? SC.returnTime(sentTime, true) : "";
                    var commentId = theMsg.sc_comment_id;
                    if (theMsgContent != null) {
                        theMsgContentDisplay += theMsgContent;
                    }
                    var msgObjectPath = theMsg.msg_object_path;
                    if (msgObjectPath != null) {
                        var handleContentMsgObj = SC.handleContentMsg(theMsg.msg_object_path, theMsg.msg_object_client_name, theMsg.msg_type);
                        theMsgContentDisplay += ('<div>' + handleContentMsgObj.text + '<div>');
                    }
                    // msg content null and msg object path null, is a balnk message means the enduser deleted a message by themself
                    if (theMsgContentDisplay == '') {
                        theMsgContentDisplay = '[ Customer deleted or edited a message / Received an unsupported file ]';
                    }

                    // 發送者1:客服,2:enduser
                    if (theMsg.send_by_flag == 2) {
                        var contentId = (commentId + sentTime + theMsg.nick_name).replace(/[ .:]/g, '');

                        if (contentId == lastContentId) {
                            if (theMsg.msg_type == 'text') {

                                // message insert before image/video , insert msg_content after <div class="content-bubble-content">
                                var n = prependDiv.lastIndexOf('<div class="content-bubble-content">') + 36;
                                prependDiv = prependDiv.substring(0, n) + '<div>' + theMsgContentDisplay + '</div>' + prependDiv.substring(n);
                            } else {

                                // message insert after text, insert msg_content before '</div></div></div>'
                                var n = prependDiv.lastIndexOf('</div></div></div>');
                                prependDiv = prependDiv.substring(0, n) + '<div>' + theMsgContentDisplay + '</div>' + prependDiv.substring(n);
                            }
                            theMsg.reply_count = 0;
                        } else {
                            prependDiv += '<div class="message-row justify-content-start w-auto" commentId="' + commentId + '"><div>' +
                                '<img class="user-icon" src="' + theMsg.profile_pic + '" onerror="if (this.src != \'./images/user.png\') this.src = \'./images/user.png\';" />' +
                                '<div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div><div class="visitor-content-bubble"><div class="content-bubble-name">' + SC.handleBubbleName(theMsg.nick_name, null, null, true) + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div></div>';
                        }
                        lastContentId = contentId;

                        // send_by_flag == 1: agent
                    } else {
                        var agentBubbleName = theMsg.sender == '0' ? 'SYSTEM' : isNaN(theMsg.sender) ? (isNaN(theMsg.nick_name) ? theMsg.nick_name : parent.getAgentName(Number(theMsg.nick_name))) : parent.getAgentName(Number(theMsg.sender)); // FB messenger greeting's nick name is customer
                        prependDiv += '<div class="message-row justify-content-start w-auto" commentId="' + commentId + '"><div><span class="user-icon"><i class="fas fa-user"></i></span><div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div><div class="fb-agent-bubble"><div class="content-bubble-name">' + agentBubbleName + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div></div>';
                    }
                    var replyCount = theMsg.reply_count;
                    if (replyCount > 0) {
                        var theReply = replyCount == 1 ? 'Reply' : 'Replies';

                        // The reply-commentid- is for clicking reply link
                        prependDiv += '<div id="reply-commentid-' + commentId + '" style="margin-left:100px;" commentId="' + commentId + '" onclick="loadFBReplies(this,' + ticketId + ')"><i class="fb right me-2"></i><span class="link-span">View ' + replyCount + ' ' + theReply + '</span></div>';
                    }
                }
                contentScrollDiv.prepend(prependDiv);
                if (remainNo > 0) {
                    var viewComments = '';
                    if (remainNo > 50) {
                        viewComments = 'View more comments ' + '(' + remainNo + ' previous comments)';
                    } else {
                        var theCommentS = remainNo == 1 ? '' : 's';
                        viewComments = 'View ' + remainNo + ' more comment' + theCommentS;
                    }
                    contentScrollDiv.prepend('<span class="fb-more-comment-span" onclick="fbMoreComments(' + ticketId + ', ' + data[0].msg_id + ', this)"><i class="fb up me-2"></i><span class="link-span">' + viewComments + '</span></span>');
                }
            }
        },
        error: function (r) {
            console.log('error in getFBComments');
            console.log(r);
            $(oThis).remove(); // to avoid find comments forever loop
        }
    });
}

function reloadFBHistory(ticketId) {
    $('fb-content-' + ticketId).empty();
    getFBComments(ticketId);
}

function goComment(ticketId, commentId) {

    // if have reply, click its reply & will load to the last replies
    var replyLink = $('#reply-commentid-' + commentId);
    if (replyLink.length > 0) {
        loadFBReplies(replyLink, ticketId);
    }

    // wait till replies loaded first
    setTimeout(function (p) {
        var ticketId = p.ticketId;
        var fbSCroll = $('#fb-scroll-' + ticketId);

        // scrolled height + the height from scrolled top to the element bottom - the height of the element (71)
        var newScrollTop = fbSCroll[0].scrollTop + $('#fb-content-' + ticketId).find('.message-row[commentId=' + p.commentId + ']').offset().top - 71;
        fbSCroll.animate({
            scrollTop: newScrollTop
        }, 1000);
    }.bind(this, { ticketId: ticketId, commentId: commentId }), 500)
}

function locateComment(ticketId, commentId, tryCount) {

    // maximum try 200 times <= so locate maximum 10000 comments
    var contentScrollDiv = $('#fb-content-' + ticketId);
    if (tryCount < 200) {

        // maximum 100 try , need to wait for 1 second to let more comments show first
        var existingComment = contentScrollDiv.find('.message-row[commentId=' + commentId + ']');
        if (existingComment.length > 0) {
            goComment(ticketId, commentId);
        } else {
            var fbMoreCommentSpan = contentScrollDiv.find('.fb-more-comment-span');
            if (fbMoreCommentSpan.length > 0) {

                // click for more comments
                fbMoreCommentSpan.click();
                fbMoreCommentSpan.remove(); // this need to be added, to avoid same span clicked again
            }

            // wait till more comments loaded first
            setTimeout(function (p) {
                locateComment(p.ticketId, p.commentId, p.tryCount);
            }.bind(this, { ticketId: ticketId, commentId: commentId, tryCount: (tryCount + 1) }), 500);
        }
    }
}

function fbHandClicked(event, ticketId, commentId) {
    event.preventDefault();
    event.stopPropagation();
    getFBComments(ticketId, [commentId])
}

function getFBComments(ticketId, commentIdArr, tryCount) {
    if (tryCount == undefined || tryCount < 11) {
        $.ajax({
            type: "POST",
            url: wiseHost + '/WisePBX/api/SocialMedia/GetFBComments',
            data: JSON.stringify({
                "ticketId": ticketId,
                "number": 5
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (r) {
                if (!/^success$/i.test(r.result || "")) {
                    console.log('error in getFBComments');
                } else {
                    var data = r.data;

                    // remaining no. of messages not showed yet
                    var total = r.total;
                    var remainNo = total - 5;
                    var contentScrollDiv = $('#fb-content-' + ticketId);
                    // remove original
                    contentScrollDiv.children().remove();
                    if (remainNo > 0) {
                        var viewComments = '';
                        if (remainNo > 50) {
                            viewComments = 'View more comments ' + '(' + remainNo + ' previous comments)';
                        } else {
                            var theCommentS = remainNo == 1 ? '' : 's';
                            viewComments = 'View ' + remainNo + ' more comment' + theCommentS;
                        }
                        contentScrollDiv.append('<span class="fb-more-comment-span" onclick="fbMoreComments(' + ticketId + ', ' + data[0].msg_id + ', this)"><i class="fb up me-2"></i><span class="link-span">' + viewComments + '</span></span>');
                    }
                    var titleCommentS = total > 1 ? 's' : '';
                    $('#no-of-comment-' + ticketId).text(total + " comment" + titleCommentS);

                    // add history row
                    for (let theMsg of data) {
                        var theMsgContentDisplay = (theMsg.msg_content || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
                        var sentTime = theMsg.sent_time;
                        var theMsgDate = SC.handleDate(sentTime);
                        var theMsgTime = theMsgDate == '' ? SC.returnTime(sentTime, true) : "";
                        var msgObjectPath = theMsg.msg_object_path;
                        var commentId = theMsg.sc_comment_id;
                        if (msgObjectPath != null) {
                            var handleContentMsgObj = SC.handleContentMsg(theMsg.msg_object_path, theMsg.msg_object_client_name, theMsg.msg_type);
                            theMsgContentDisplay += ('<div>' + handleContentMsgObj.text + '<div>');
                        }

                        // msg content null and msg object path null, is a balnk message means the enduser deleted a message by themself
                        if (theMsgContentDisplay == '') {
                            theMsgContentDisplay = '[ Customer deleted or edited a message / Received an unsupported file ]';
                        }
                        if (theMsg.send_by_flag == 2) { //發送者1:客服,2:enduser{
                            var msgRowId = (commentId + sentTime + theMsg.nick_name).replace(/[ .:]/g, '');

                            // customer if send pic/video with text, will be divided in to 2 messages
                            if ($('#' + msgRowId).length > 0) {

                                // normally picture appened first
                                if (theMsg.msg_type == 'text') {
                                    $('#' + msgRowId).find('.content-bubble-content').prepend('<div>' + theMsgContentDisplay + '</div>')
                                } else {
                                    $('#' + msgRowId).find('.content-bubble-content').append('<div>' + theMsgContentDisplay + '</div>')
                                }
                                theMsg.reply_count = 0;
                            } else {
                                contentScrollDiv.append('<div id="' + msgRowId + '" class="message-row justify-content-start w-auto" commentId="' + commentId + '"><div>' +
                                    '<img class="user-icon" src="' + theMsg.profile_pic + '" onerror="if (this.src != \'./images/user.png\') this.src = \'./images/user.png\';" />' +
                                    '<div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div><div class="visitor-content-bubble fb-visitor-content-bubble"><div class="content-bubble-name">' + SC.handleBubbleName(theMsg.nick_name, null, null, true) + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div></div>');
                            }
                        } else { 

                            // send_by_flag == 1: agent
                            var agentBubbleName = theMsg.sender == '0' ? 'SYSTEM' : isNaN(theMsg.sender) ? (isNaN(theMsg.nick_name) ? theMsg.nick_name : parent.getAgentName(Number(theMsg.nick_name))) : parent.getAgentName(Number(theMsg.sender));
                            contentScrollDiv.append('<div class="message-row justify-content-start w-auto" commentId="' + commentId + '"><div><span class="user-icon"><i class="fas fa-user"></i></span><div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div><div class="fb-agent-bubble"><div class="content-bubble-name">' + agentBubbleName + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div></div>');
                        }
                        var replyCount = theMsg.reply_count;
                        if (replyCount > 0) {
                            var theReply = replyCount == 1 ? 'Reply' : 'Replies';

                            // The reply-commentid- is for clicking reply link
                            contentScrollDiv.append('<div id="reply-commentid-' + commentId + '" style="margin-left:100px;" commentId="' + commentId + '" onclick="loadFBReplies(this,' + ticketId + ')"><i class="fb right me-2"></i><span class="link-span">View ' + replyCount + ' ' + theReply + '</span></div>');
                        }
                    }
                    // ============== Reply Clicked history now ===========
                    if (commentIdArr != undefined) {

                        // Only one comment will find the comment & scroll to the location because agent could reply bulk messages
                        var theCommentId = commentIdArr[commentIdArr.length - 1]; // only the last comment will open reply
                        locateComment(ticketId, theCommentId, 0);
                    }
                }
            },
            error: function (r) {
                console.log('error in getFBComments');
                console.log(r);
            }
        });
    }
}

function waTemplate(campaign) {
    popupCampaign = campaign;
    var openWindows = parent.openWindows;
    var socialPopup = window.open('./socialPopup.html?type=wa-template', 'socialPop', '_blank, toolbar=0,location=0,top=50, left=100,menubar=0,resizable=0,scrollbars=1,width=1000,height=928');
    openWindows[openWindows.length] = socialPopup;
    socialPopup.onload = function () {
        socialPopup.onbeforeunload = function () {
            for (var i = 0; i < openWindows.length; i++) {
                if (openWindows[i] == socialPopup) {
                    openWindows.splice(i, 1);
                    break;
                }
            }
        }
    }
}

function selectAllClicked(ticketId) {
    var messageRows = $('#content-inner-scroll-' + ticketId).find('.message-row');
    var selectAll = false;
    if ($('#content-inner-scroll-' + ticketId).find('.selected-row').length > 0) {
        selectAll = true;
    }
    if (messageRows != null && messageRows.length > 0) {
        if (selectAll === false) {
            messageRows.each(function () {
                var visitorRow = $(this);
                if (!visitorRow.hasClass('selected-row')) {
                    visitorRow.addClass('selected-row');
                }
            });
        } else {
            messageRows.each(function () {
                var visitorRow = $(this);
                if (visitorRow.hasClass('selected-row')) {
                    visitorRow.removeClass('selected-row');
                }
            });
        }
    }
}

function discardClicked(ticketId) {

    // verify have agent selected message first
    var msgIdArr = [];
    var selectedMsgs = $('#content-inner-scroll-' + ticketId).find('.selected-row');
    if (selectedMsgs != undefined && selectedMsgs.length > 0) {
        for (let theSelected of selectedMsgs) {
            var selectedMsg = $(theSelected);
            msgIdArr.push(selectedMsg.attr('msgId'));

            // if have additional-msg-id attribute add it to the to discard msg array also, for txt + video this kind of message
            if (selectedMsg.data("additional-msg-id") != undefined) {
                msgIdArr.push(selectedMsg.data("additional-msg-id"));
            }
        }
    }
    if (msgIdArr.length == 0) {
        alert(langJson['l-alert-select-not-reply']);
        return;
    }
    if (confirm(langJson['l-alert-no-reply-comments'])) {
        parent.sendSocialMsg(ticketId, '', msgIdArr, function (r) {
            for (let msgId of msgIdArr) {
                $('#content-inner-scroll-' + ticketId).find('div[msgId=' + msgId + ']').remove();
            }
        }, -1);
    }
}

function getFBPostContent(ticketId) {
    $.ajax({
        type: "POST",
        url: mvcUrl + '/api/GetFaceBookPostContent/',
        data: JSON.stringify({
            Ticket_Id: ticketId,
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        var details = r.details;
        if (!/^success$/i.test(r.result || "")) {
            console.log("Error in getFBPostContent." + r ? r.details : '');
        } else {
            if (details.length > 0) {
                var info = details[0];
                var mediaLink = info.Media_Link;
                var fbContentTxt = info.Details;

                // update text
                $('#fb-title-' + ticketId).text(fbContentTxt);

                // add right panel txt
                $('#bubble-' + ticketId).find('.bubble-message').text(handleBubbleMsg(fbContentTxt));
                if (mediaLink) {
                    var pathname = window.location.pathname;
                    var pathArr = pathname.split('/');
                    var cncName = pathArr.length > 2 ? pathArr[1] : 'crm';
                    var massagedMediaContent = mediaLink.replace('.', '').replace(/\\/g, '/');
                    var mediaLinkStr = mvcHost + '/' + cncName + massagedMediaContent;
                    if (info.Media_Type == 'image/jpeg' || info.Media_Type == 'image/png' || info.Media_Type == 'image/gif') {
                        $('#fb-media-' + ticketId).append('<img style="width:100%;" src="' + mediaLinkStr + '"/>');
                    } else if (info.Media_Type == 'video/mp4') {
                        $('#fb-media-' + ticketId).append('<video controls="" width="300" height="225" preload="none" src="' + mediaLinkStr + '"' + downloadVoiceStr + '><source type="video/mp4"></video>');
                    }
                }
            } else {
                parent.document.getElementById("phone-panel").contentWindow.wiseGetFBPost(ticketId);
            }
        }
    });
}

function handleOfflineFormName(offlineFormData) {
    for (let theField of offlineFormData) {
        var fieldName = theField.field_name;
        if (fieldName == 'Name') {
            return fieldName + ": " + theField.field_value;
        }
    }
    return 'Offline Form';
}

function returnTempForm(updateCaseObj) {
    var ticketId = updateCaseObj.Conn_Id;
    $('#search-input-' + ticketId).remove();
}

function sendRequestClicked() {
    var ticketId = tempTicketId;
    var message = ($('#agent-list-message').val() || '').trim() || '';
    var selectedInput = $("input[name='agentList']:checked");
    var invitedAgentID = selectedInput.val();
    var inviteMessage = 'systemMsg-`!^~' + tempCampaign + '-`!^~' + tempEntry + '-`!^~' + message;
    parent.document.getElementById("phone-panel").contentWindow.wiseInviteAgentToChat(invitedAgentID, ticketId, inviteMessage);
    tempTicketId = null;
    $('#agentListModal').modal('toggle');
}

function gotAgentList(agentArr) {
    $('#agent-list-campaign').html(tempCampaign);
    $('#agent-list-entry').html(tempEntry);
    $('#agent-list-ticketid').html(tempTicketId);
    $('#agent-list-message').val('');
    $('#agentListModal').modal('show');
    var agentArrDiv = $('#agent-list-arr');
    var agentArrDivs = '';
    var availableAgent = 0;

    for (let theAgent of agentArr) {
        var theAgentId = theAgent.AgentID;
        if (theAgentId != loginId) {
            var agentStatus = theAgent.Status;
            if (agentStatus == 'IDLE' || agentStatus == 'WORKING' || agentStatus == 'READY') {
                agentArrDivs += ('<div style="display:table-row;"><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="agentList" value="' + theAgentId + '" id="agent-' + theAgentId + '">' + theAgent.AgentName + '&nbsp;(ID: ' + theAgentId + ')<span class="circle"><span class="check"></span></span></label></div><label class="agent-list-cell ps-3" for="agent-' + theAgentId + '">' + theAgent.Status + '</label></div>');
                availableAgent += 1;
            }
        }
    }
    if (availableAgent == 0) {
        agentArrDivs = '<div>--- ' + langJson['l-social-no-agents-available'] + ' ---</div>';
    }
    agentArrDiv.html(agentArrDivs);
}

function addAgent(ticketId, campaign, entry) {
    tempCampaign = campaign;
    tempEntry = entry;
    tempTicketId = ticketId;
    parent.getAgentList('social-media-main', campaign, entry);

    // NO DEL: not sure will we need to add this back 
    // parent.document.getElementById("phone-panel").contentWindow.WiseGetAgentList(campaign, entry);
    // Pass the form part have not yet been done
    // console.log('ticketId: ' + ticketId);
    // var invitedAgentID = "";
    // var inviteMessage = "";
    // invitedAgentID = prompt("Please enter agent ID to invite:", "");
    // console.log('invitedAgentID: ' + invitedAgentID);
    // if (invitedAgentID != null && invitedAgentID.trim() != "") {
    //     // if agent is already invited
    //     var confAgentAttr = $('#bubble-' + ticketId).attr('invitedAgent') || '';
    //     var roomAgents = confAgentAttr != null && confAgentAttr.length > 0 ? confAgentAttr.split(',') : [];
    //     console.log('confAgentAttr'); console.log(confAgentAttr);
    //     console.log('roomAgents'); console.log(roomAgents);
    //     if (confAgentAttr.length > 0 && roomAgents.indexOf(invitedAgentID) != -1) {
    //         if (confirm('Do you want pass the input form to the agent?')) {
    //             // search case status pass3
    //             var inputFormSrc = $('#input-form-' + ticketId).attr('src');
    //             console.log('inputFormSrc'); console.log(inputFormSrc);
    //             var searchFormType = '';
    //             var iframeDom = '';
    //             var searchInputDiv = $('#search-input-' + ticketId);
    //             var searchInputHtml = $("<div />").append(searchInputDiv.clone()).html();
    //             if (inputFormSrc == './search.html') {
    //                 searchFormType = 'search';
    //                 parent.document.getElementById("phone-panel").contentWindow.wiseSendMessage_UC(3, parseInt(invitedAgentID), 'systemMsg-`!^~' + agentName + '`!^~' + searchFormType + '-`!^~' + ticketId + '-`!^~' + searchInputHtml);
    //                 searchInputDiv.remove();
    //             } else {
    //                 searchFormType = 'input';
    //                 // save the form
    //                 document.getElementById('input-form-' + ticketId).contentWindow.saveClicked(true, function (formData, formType) {
    //                     console.log('formData'); console.log(formData);
    //                     parent.document.getElementById("phone-panel").contentWindow.wiseSendMessage_UC(3, parseInt(invitedAgentID), 'systemMsg-`!^~' + agentName + '`!^~' + searchFormType + '-`!^~' + ticketId + '-`!^~' + searchInputHtml + '-`!^~' + JSON.stringify(formData) + '-`!^~' + formType);
    //                     searchInputDiv.remove();
    //                 });
    //             }
    //         }
    //     } else {
    //         inviteMessage = prompt("Please enter invite message (optional):", "") || '';
    //         console.log('inviteMessage: ' + inviteMessage)
    //         // alert("You just invited agent " + invitedAgentID + " to join this chat with message: \n" + inviteMessage);
    //         parent.document.getElementById("phone-panel").contentWindow.wiseInviteAgentToChat(invitedAgentID, ticketId, inviteMessage);
    //     }
    // }
}

function stopSlient(ticketId) {
    var replyContainer = $('#content-' + ticketId).find('.reply-container');
    replyContainer.find('.silent-btn-group').remove();
    replyContainer.find('.stop-silent-group').removeClass('d-none');
}

function endMonitor(ticketId, caseSaved) {
    parent.document.getElementById("phone-panel").contentWindow.WiseEndMontiorChat(ticketId);
    removeTicket(ticketId);
}

function monitorBargeIn(ticketId) {

    // noticed Other Agents Joined the Chat
    parent.document.getElementById("phone-panel").contentWindow.WiseMontiorChat(ticketId, "B");
    stopSlient(ticketId);
    $('#bubble-' + ticketId).find('.leave-chat-icon').attr('onclick', 'leaveChat(' + ticketId + ')');
}

function monitorConference(ticketId) {

    // noticed Barged into the Chat
    parent.document.getElementById("phone-panel").contentWindow.WiseMontiorChat(ticketId, "C");
    stopSlient(ticketId);
    $('#bubble-' + ticketId).find('.leave-chat-icon').attr('onclick', 'leaveChat(' + ticketId + ')');
}


function quitCoach(ticketId) {
    $('#txt-coach-' + ticketId).addClass('d-none');
    $('#silent-btn-container-' + ticketId).removeClass('d-none');
    $('#coach-btn-container-' + ticketId).addClass('d-none');
}

function monitorCoach(ticketId) {
    $('#txt-coach-' + ticketId).removeClass('d-none');
    $('#silent-btn-container-' + ticketId).addClass('d-none');
    $('#coach-btn-container-' + ticketId).removeClass('d-none');
}

function sendCoach(ticketId) {
    var coachMsg = $('#txt-coach-' + ticketId).val() || '';
    if (coachMsg.length == 0) {
        alert('Coach msg cannot be blank');
        return;
    }
    var monitoredTicketList = parent.document.getElementById("phone-panel").contentWindow.monitoredTicketList;
    var i = monitoredTicketList.findIndex(function (v) { return v.ticketId == ticketId });
    var toCoachAgentId = monitoredTicketList[i].agentId;
    parent.document.getElementById("phone-panel").contentWindow.wiseSendMessage_UC(3, parseInt(toCoachAgentId), 'systemMsg-`!^~' + 'coach' + '-`!^~' + ticketId + '-`!^~' + coachMsg);
    var agentNameStr = parent.getAgentName(toCoachAgentId) + ' (ID: ' + toCoachAgentId + ')';
    var statusMsg = 'You have sent a coach msg to ' + agentNameStr + ':<div>' + coachMsg + '</div>';
    $('#content-inner-scroll-' + ticketId).append('<div style="text-align:center;margin:23px;"><div class="coach-bubble"><img style="position:relative;" src="./images/white-warning-16.svg" /><span style="margin-left:7px;"><span>' + statusMsg + '</span></div></span></div>');
    $('#txt-coach-' + ticketId).val('');

    // scroll to the bottom
    var objDiv = document.getElementById('content-inner-scroll-' + ticketId);
    if (objDiv != null) {
        objDiv.scrollTop = objDiv.scrollHeight;
    }
}

function leaveChat(ticketId, caseSaved) {

    // if have input form and the form havn't saved, cannot leave the chat
    var theBubble = $('#bubble-' + ticketId);
    if (!caseSaved) {
        if ($('#search-input-' + ticketId).length > 0 && !theBubble.hasClass('case-saved')) {
            alert(langJson['l-alert-form-not-saved']);
            return;
        }
    }

    // if in chat should send leave chat to other agents
    var leaveChatMsg = langJson['l-alert-confirm-end-leave'];
    if (theBubble.hasClass('bubble-closed')) {
        leaveChatMsg = langJson['l-alert-leave-the-chat'];
    }
    if (confirm(leaveChatMsg)) {
        parent.document.getElementById("phone-panel").contentWindow.wiseAssignToChatRoom(ticketId, loginId, 'R');
        removeTicket(ticketId);
    }
}

// need to wait till chat window has established, got by resultCode 4
function addAdditionalInfo(addedInfo) {
    var ticketId = addedInfo.ticket_id;
    var chatContent = $('#content-' + ticketId);
    //var searchIframeNotYetLoaded = addedInfo.e ? ($('#search-' + ticketId).length > 0 ? false : true) : false; // no need to care did sarch loaded if no e
    var searchIframeNotYetLoaded = addedInfo.e && ($('#search-' + ticketId).length === 0);

    if (chatContent.length == 0 || searchIframeNotYetLoaded) {

        // added counter to avoide looping forever
        if (!addedInfo.counter) {
            addedInfo.counter = 1;
        } else {
            addedInfo.counter += 1;
        }
        if (addedInfo.counter < 4) {
            setTimeout(function (p) { addAdditionalInfo(p.addedInfo) }.bind(this, { addedInfo: addedInfo }), 1000);
        }
    } else {

        // Add last ticket
        // var lastTicket = addedInfo.last_ticket;
        // if (lastTicket) {
        //     var lastTicketTime = lastTicket.last_chat_time;
        //     var d = new Date(); // Today
        //     d.setHours(d.getHours() - 1); // 1 hour before
        //     var theTime = Date.parse(lastTicketTime);
        //     // In the last hour contacted us
        //     if (d < theTime) {
        //         chatContent.find('.content-basic-info').append('<span class="second-line" style="display:block;"><span>Contacted us in the last hour, last Ticket ID: ' + lastTicket.ticket_id + ' on ' + lastTicket.last_chat_time + '</span>');
        //     }
        // }

        var otherFormData = [];

        // paste attribute to input form, new customer can use this to create form
        var inputForm = $('#input-form-' + ticketId);
        var theSource = addedInfo.source;
        var theCompanyName = addedInfo.companyName;
        var theLang = addedInfo.lang;
        var theQrCode = addedInfo.qrcode;
        var theLocation = addedInfo.location;
        var theBrowser = addedInfo.browser;
        var theE = addedInfo.e;
        var theLastTicket = addedInfo.last_ticket;
        if (addedInfo.source && addedInfo.source.length > 0) {
            otherFormData.push({
                field_name: "Source",
                field_value: theSource
            });
            inputForm.attr('source', theSource);
        }
        if (theCompanyName && theCompanyName != "" && theCompanyName != "undefined") {
            otherFormData.push({
                field_name: "Webchat Location",
                field_value: addedInfo.companyName
            });
            inputForm.attr('source', theSource);
        }
        if (theLang && theLang != "") {
            otherFormData.push({
                field_name: "Language",
                field_value: theLang
            });
            inputForm.attr('lang', theLang);
        }
        if (theQrCode && theQrCode != "") {
            otherFormData.push({
                field_name: "QR Code",
                field_value: theQrCode
            });
            inputForm.attr('qrcode', theQrCode);
        }
        if (theLocation && theLocation != "") {
            otherFormData.push({
                field_name: "Country",
                field_value: theLocation
            });
            inputForm.attr('location', theLocation);
        }
        if (theBrowser && theBrowser != "") {
            otherFormData.push({
                field_name: "Browser (ref only)",
                field_value: theBrowser
            });
        }
        if (theE && theE != "") {
            var b10 = parseInt(theE, 36);
            otherFormData.push({
                field_name: "CTC Info",
                field_value: b10
            });
            theE = String(b10); // after string can slice case no later
            var openCaseNo = theE.slice(8);

            // refresh search page
            $('#search-' + ticketId).attr('openCaseNo', openCaseNo).attr('src', './search.html');
        }
        if (theLastTicket && theLastTicket != "") {
            var lastTicket = addedInfo.last_ticket;
            var lastTicketTime = lastTicket.last_chat_time;
            var d = new Date(); // Today
            d.setHours(d.getHours() - 1); // 1 hour before
            var theTime = Date.parse(lastTicketTime);
            // In the last hour contacted us
            if (d < theTime) {
                var lastTicketStr = 'Last Ticket ID: ' + lastTicket.ticket_id + ' on ' + lastTicket.last_chat_time
                otherFormData.push({
                    field_name: "Contacted us in the last hour",
                    field_value: lastTicketStr
                });
            }
        }

        // add the info to header
        $('#cs-info-' + ticketId).append(SC.handleContentFormData(otherFormData));
    }
}

function GetPreviousTicketId(userId, entry, ticketId, company_code, originalTicketId) {
    $.ajax({
        type: "POST",
        url: wiseHost + '/WisePBX/api/SocialMedia/GetPreviousTicketId',
        data: JSON.stringify({
            "userId": userId,
            "entry": entry,
            "ticketId": ticketId,
            companyCode: company_code
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in GetPreviousTicketId');
            } else {

                // get message next
                var last3TicketArr = r.data;
                if (last3TicketArr != null && last3TicketArr.length > 0) {
                    oldTicketCountObj[originalTicketId] = 0;
                    oldHistoryObj[originalTicketId] = [];
                    oldTicketListObj[originalTicketId] = [];

                    // get message from oldest to latest
                    var ticketLength = last3TicketArr.length;
                    for (let theTicket of last3TicketArr) {
                        var requestTicketId = theTicket.ticket_id;

                        // add line break
                        if ($('div[ticket_id="' + requestTicketId + '"]').length == 0) {
                            oldTicketListObj[originalTicketId].push(requestTicketId);
                            parent.getTicketMsg(requestTicketId, originalTicketId, ticketLength);
                        }
                    }
                }
            }
        },
        error: function (r) {
            console.log('error in createOrUpdateBubble');
            console.log(r);
        }
    });
}

function fbPostAddContinus(ticketId) {

    // only when the ticket is still there, continues
    if ($('#bubble-' + ticketId).length > 0) {
        
        // add the agent to the ticket again
        parent.document.getElementById("phone-panel").contentWindow.wsWiseAgent.UpdateTicket(ticketId, loginId);
    } else {

        // if no longer exists clear it
        if (fbPostTimeoutObj[ticketId]) {
            clearInterval(fbPostTimeoutObj[ticketId]);
            delete fbPostTimeoutObj[ticketId];
        }
    }
}

function createOrUpdateBubble(msgObj) {
    console.log(msgObj); // TBD
    var channelImg = '';
    var ticketId = msgObj.ticket_id;
    var newTicket = false;
    var msgList = msgObj.msg_list || [];
    var msgListLength = msgList != undefined ? msgList.length : 0;
    var lastMsg = msgListLength != 0 ? msgList[msgListLength - 1] : {};
    var lastMsgContent = (lastMsg.msg_content || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var lastMsgSentTime = lastMsg.sent_time || '';
    var lastMsgDate = lastMsgSentTime.length == 0 ? '' : SC.handleDate(lastMsgSentTime);
    var lastMsgTime = lastMsgDate == '' ? lastMsgSentTime.length == 0 ? '' : SC.returnTime(lastMsgSentTime, true) : "";
    var entry = msgObj.entry;
    var campaign = customCompany != "no"? customCompany: msgObj.company_name;
    var formData = msgObj.online_form_data || [];
    var enduserId = msgObj.enduser_id || -1;
    var isOfflineForm = msgObj.offline_form == 1 || false;
    var onlineFormData = msgObj.online_form_data || [];
    var offlineFormData = msgObj.offline_form_data || [];
    var isMonitor = parent.tmpMonIdArr.includes(ticketId);
    var isFB = entry == 'facebook' || entry == 'fb_comment';

    $('#default-content-container').hide();

    // check if not campaign
    // ====== 1/3 add/update bubble ======
    var theBubble = $('#bubble-' + ticketId);
    if (theBubble.length > 0) {
        // update the bubble
        if (entry != 'fb_comment' && entry != 'fb_post') {
            theBubble.find('.bubble-message').text(handleBubbleMsg(lastMsgContent, lastMsg.msg_object_client_name, lastMsg.msg_object_path));
        }
        theBubble.find('.bubble-date').text(lastMsgDate);
        theBubble.find('.bubble-time').text(lastMsgTime);
    } else {

        // remove other present bubble if have class bubble-present
        var presentBubble = $('.bubble-present');
        if (presentBubble.length > 0) {
            presentBubble.removeClass('bubble-present');
        }

        // create bubble
        if (entry == 'webchat') {
            channelImg = 'webchat-icon-217';
        } else if (entry == 'whatsapp') {
            channelImg = 'whatsapp';
        } else if (entry == 'facebook') {
            channelImg = 'fbmsg-icon-256';
        } else if (entry == 'fb_comment' || entry == 'fb_post') {
            channelImg = 'facebook_icon';
        } else if (entry == 'wechat') {
            channelImg = 'WeChat';
        }
        var bubbleMsg = (entry == 'fb_comment' || entry == 'fb_post') ? '' : isOfflineForm ? handleOfflineFormName(offlineFormData) : handleBubbleMsg(lastMsgContent, lastMsg.msg_object_client_name, lastMsg.msg_object_path);
        var offlineFormStr = isOfflineForm ? 'bubble-closed ' : '';
        var bubbleStyle = isOfflineForm ? 'style="background:white;color:black;" ' : '';
        var inviteAgentIdStr = '';
        var conferenceStr = '';
        var bubbleShortNameStr = customCompany == 'no' ? msgObj.company_short_name : '';
        var addAgentStr = 'addAgent(' + ticketId + ',"' + campaign + '","' + entry + '")';
        if (entry != 'fb_comment' && entry != 'fb_post') {

            // conference call button and leave button
            conferenceStr = isMonitor ? '<i class="fas fa-sign-out-alt leave-chat-icon bubble-small-icon" onclick="endMonitor(' + ticketId + ')" data-bs-toggle="tooltip" data-bs-placement="bottom" title="' + langJson['l-social-leave-chat'] + '"></i>' :
                (parent.tmpTicketId == ticketId ? '' : '<i class="fas fa-plus bubble-small-icon me-2" onclick=' + addAgentStr + ' data-bs-toggle="tooltip" data-bs-placement="bottom" title="' + langJson['l-social-conference-call'] + '"></i>') +
                '<i class="fas fa-sign-out-alt leave-chat-icon bubble-small-icon" onclick="leaveChat(' + ticketId + ')" data-bs-toggle="tooltip" data-bs-placement="bottom" title="' + langJson['l-social-leave-chat'] + '"></i>' + (parent.tmpTicketId == ticketId ? '' : '<i class="fas fa-star private-i"></i>');
        } else {

            // fbpost, 10 minutes and 12 seconds later, if this ticket still here, assign again
            fbPostTimeoutObj[ticketId] = setInterval(function(p){
                fbPostAddContinus(p.ticketId);
            }.bind(this, {ticketId: ticketId}), 612000)
        }
        $('#bubble-list-inner').prepend('<div ' + bubbleStyle + 'class="' + offlineFormStr + 'bubble-container bubble-present" id="bubble-' + ticketId + '" onclick="bubbleClicked(' + ticketId + ')"' + inviteAgentIdStr + ' campaign="' + campaign + '" companycode="' + msgObj.company_code + '" enduserid="' + enduserId + '"><div class="bubble-container-inner"><span class="bubble-label-content-columns"><div class="bubble-channel-logo"><img class="bubble-icon" src="./Wise/img/' + channelImg + '.png"/></div><div class="buble-content-column"><div><span class="bubble-subject">' + SC.handleBubbleName((entry != 'fb_comment' && entry != 'fb_post' && entry != 'fb_post' && msgList.length != 0 ? msgList[0].nick_name : String(ticketId)), formData, ticketId) + '</span><span style="float:right;"><span class="bubble-short-name">' + bubbleShortNameStr + '</span>&nbsp;<span class="bubble-datetime"><span class="bubble-date">' + lastMsgDate + '</span><span class="bubble-time">' + lastMsgTime + '</span></span></span></div><div class="d-flex"><span class="bubble-message me-auto">' + bubbleMsg + '</span>' + conferenceStr + '</div></span></div></div>');
        
        // change the tab of the parent for new ticket
        window.parent.$('.nav-tabs a[href="#social-media"]').tab('show');
        newTicket = true;
        
        // hide existing if new media connection established
        var presentTicketContent = $('#content-' + presentTicketId);
        var presentTicketSearchInput = $('#search-input-' + presentTicketId);
        if (presentTicketContent.length > 0) {
            presentTicketContent.hide();
        }
        if (presentTicketSearchInput.length > 0) {
            presentTicketSearchInput.hide();
        }
        presentTicketId = ticketId;
    }

    // ====== 2.5/3 add/update content ======
    if (newTicket) {

        // add content
        var cannedBtnClickFn = 'cannedBtnClicked("' + campaign + '")';
        var shareBtnClickFn = 'shareBtnClicked("' + campaign + '")';

        // upload originally hidden, appear when needed
        var uploadBtnClickFn = '$(this).prev().trigger("click");';
        var uploadBtnStr = '<input type="file" onchange="uploadAttachment(this, ' + ticketId + ');" style="display:none"><button id="upload-' + ticketId + '" class="reply-share-container keyboard-icon" data-bs-toggle="tooltip" data-bs-placement="top" title="Send File" onclick=' + uploadBtnClickFn + '><span class="align-sub"><i class="fas fa-file-upload"></i></span></button>';

        var contentInnerHeight = (entry == 'fb_comment' || entry == 'fb_post' || noFormInSocial) ? 'calc(100vh - 262px)' : (isOfflineForm ? '413px' : '520px');

        var companyLogoStr = customCompany == 'no' ? '<img class="company-logo" src="./campaign/' + campaign + '/logo.png"/>' : '';
        var companyShortName = msgObj.company_short_name;
        var companyShortNameStr = ((entry == 'facebook' || entry == 'fb_comment') && companyShortName && companyShortName.length > 0) ? ('<span class="content-gray-label">Label:&nbsp;</span>' + companyShortName + '&nbsp;') : '';

        var textareaId = 'reply-textarea-' + ticketId;
        var sendCSInputStr = (entry == 'webchat' ? (' onkeyup="sendCSInput(' + ticketId + ')"') : '');
        var replyContainerStr = isOfflineForm ? '' : (isMonitor ?
            ('<div class="reply-container"><div class="text-center silent-btn-group"><textarea id="txt-coach-' + ticketId + '" class="reply-textarea d-none" maxlength="1000" placeholder="Type coach message here..." onkeydown="coachTextareaPressed(event)"></textarea><div id="silent-btn-container-' + ticketId + '" class="mt-4"><button class="btn btn-warning btn-sm rounded text-capitalize me-2" onclick="monitorConference(' + ticketId + ')"><i class="fas fa-user-friends me-2"></i>Conference</button><button class="btn btn-warning btn-sm rounded text-capitalize me-2" onclick="monitorBargeIn(' + ticketId + ')"><i class="fas fa-door-open me-2"></i>Barge-In</button><button class="btn btn-warning btn-sm rounded text-capitalize me-2" onclick="monitorCoach(' + ticketId + ')"><i class="fas fa-paper-plane me-2"></i>Coach</button><button class="btn btn-warning btn-sm rounded text-capitalize" onclick="endMonitor(' + ticketId + ')"><i class="fas fa-sign-out-alt me-2"></i>Quit Monitor</button><label class="silent-agent-lbl">Monitoring Agent ID:&nbsp;<span id="mon-agent-id-' + ticketId + '">' + parent.tmpAgentId + '</span></lable></div><div id="coach-btn-container-' + ticketId + '" class="d-none"><button class="btn btn-warning btn-sm rounded text-capitalize me-2" onclick="quitCoach(' + ticketId + ')"><i class="fas fa-sign-out-alt me-2"></i>Quit Coach</button><button class="btn btn-warning btn-sm rounded text-capitalize" onclick="endMonitor(' + ticketId + ')"><i class="fas fa-sign-out-alt me-2"></i>Quit Monitor</button><button class="reply-send-container" onclick="sendCoach(' + ticketId + ')" title="Send Coach Message"><img class="reply-icon-size" src="./images/send.svg"></button></div></div>' +
                '<div class="d-none stop-silent-group"><textarea id="' + textareaId + '" class="reply-textarea" maxlength="1000" rows="2" placeholder="' + langJson['l-social-type-your-text-here'] + '" onkeydown="textareaPressed(event)"></textarea><div class="reply-icon-group"><button id="canned-' + ticketId + '" class="reply-canned-container keyboard-icon" data-bs-toggle="tooltip" data-bs-placement="top" title="' + langJson['l-social-select-message'] + '" onclick=' + cannedBtnClickFn + '><span class="align-sub"><i class="far fa-keyboard"></i></span></button><button id="share-' + ticketId + '" class="reply-share-container keyboard-icon" data-bs-toggle="tooltip" data-bs-placement="top" title="' + langJson['l-social-select-file'] + '" onclick=' + shareBtnClickFn + '><span class="align-sub"><i class="far fa-file"></i></span></button><button id="end-' + ticketId + '" class="reply-end-container keyboard-icon" data-bs-toggle="tooltip" data-bs-placement="top" title="' + langJson['l-social-end-session'] + '" entry="' + entry + '" onclick="endClicked(' + ticketId + ',this)"><span class="align-sub"><i class="fas fa-times"></i></span></button><button id="reply-btn-' + ticketId + '" class="reply-send-container" entry="' + entry + '" onclick="replyClicked(' + ticketId + ')" data-bs-toggle="tooltip" data-bs-placement="top" title="' + langJson['l-social-send-message'] + '"><img class="reply-icon-size" src="./images/send.svg" /></button></div></div>'
            )
            : '<div class="reply-container"><textarea id="' + textareaId + '" class="reply-textarea" maxlength="1000" rows="2" placeholder="' + langJson['l-social-type-your-text-here'] + '" onkeypress="textareaPressed(event);"' + sendCSInputStr + '></textarea><div class="reply-icon-group"><button id="canned-' + ticketId + '" class="reply-canned-container keyboard-icon" data-bs-toggle="tooltip" data-bs-placement="top" title="' + langJson['l-social-select-message'] + '" onclick=' + cannedBtnClickFn + '><span class="align-sub"><i class="far fa-keyboard"></i></span></button><button id="share-' + ticketId + '" class="reply-share-container keyboard-icon" data-bs-toggle="tooltip" data-bs-placement="top" title="' + langJson['l-social-select-file'] + '" onclick=' + shareBtnClickFn + '><span class="align-sub"><i class="far fa-file"></i></span></button>' + uploadBtnStr + '<button id="end-' + ticketId + '" class="reply-end-container keyboard-icon" data-bs-toggle="tooltip" data-bs-placement="top" title="' + langJson['l-social-end-session'] + '" entry="' + entry + '" onclick="endClicked(' + ticketId + ',this)"><span class="align-sub"><i class="fas fa-times"></i></span></button><button id="reply-btn-' + ticketId + '" class="reply-send-container" entry="' + entry + '" onclick="replyClicked(' + ticketId + ')" data-bs-toggle="tooltip" data-bs-placement="top" title="' + langJson['l-social-send-message'] + '"><img class="reply-icon-size" src="./images/send.svg" /></button></div></div>');

        var whatsappStr = entry == 'whatsapp' ? '<span style="white-space:pre;"><span class="content-gray-label">Phone:</span>&nbsp;<span id="phone-' + ticketId + '">' + enduserId.replace('whatsapp:+', '') + '</span></span>' : '';

        $('#content-section').append('<div id="content-' + ticketId + '"><div style="padding:7px 10px 0px 10px;">' + companyLogoStr + '<span class="custom-scroll content-basic-info"><span class="cs-info-span"><span class="content-gray-label">' + langJson['l-social-platform'] + ':</span>&nbsp;' + entry + '</span>' + companyShortNameStr + '<span class="cs-info-span"><span class="content-gray-label">' + langJson['l-social-ticket-id'] + ':</span>&nbsp;' + ticketId + '</span><span id="cs-basic-' + ticketId + '">' + SC.handleContentFormData(formData) + whatsappStr + '</span><span id="cs-info-' + ticketId + '"></span></span><img id="channel-' + ticketId + '" class="top-channel-img" data-bs-toggle="tooltip" data-bs-placement="left" src="./Wise/img/' + channelImg + '.png" />' +
            '</div><div class="content-section-inner"><div style="padding:15px;"><div id="content-inner-scroll-' + ticketId + '" style="height:' + contentInnerHeight + ';overflow-y:auto;" class="custom-scroll"></div>' + replyContainerStr + '</div></div></div>');

        $('#' + textareaId).keydown(function (e) {
            if (e.keyCode == 33 || e.keyCode == 34) {
                $(this).blur();
            }
        });

        // Chrome minor bug that unable to calculate textarea scroll height correctly when it is not in the view e.g. enlarged > 125% at social media cannot see the reply textarea, when focus / type words / set value, the calculation of height will have issue, top part e.g. the top bar maybe disappeared
        var pageTop = $(window).scrollTop();
        var pageBottom = pageTop + $(window).height();
        var elementTop = $('#' + textareaId).offset().top;
        var elementBottom = elementTop + $('#' + textareaId).height();

        // if in the view, focus it
        if ((pageTop < elementTop) && (pageBottom > elementBottom)) {
            $('#' + textareaId).focus();
        }

        // if entry is wechat or facebook messenger, will try to add last 3 chat history
        if (entry == 'wechat' || entry == 'facebook' || entry == 'whatsapp') {

            // get past chatted how many times and average conversation time
            $.ajax({
                type: "POST",
                url: wiseHost + '/wisepbx/api/SocialMedia/GetStatistics',
                data: JSON.stringify({
                    "userId": enduserId,
                    "entry": entry,
                    companyCode: msgObj.company_code
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (r) {
                    if (!/^success$/i.test(r.result || "")) {

                        // if no status_id 2 completed ticket, the result will be error also by Wise code, so no need to futher study if have error
                        console.log('error in createOrUpdateBubble GetStatistics');
                    } else {
                        var data = r.data;
                        var averageTime = data.AverageTime;
                        $('#content-' + ticketId).find('.content-basic-info').append('<span class="second-line" style="display:block;"><span class="content-gray-label">No. of Times Chatted (ref only):</span>&nbsp;' + data.Count + '</span>');
                    }
                },
                error: function (r) {
                    console.log('error in createOrUpdateBubble GetStatistics');
                    console.log(r);
                }
            });

            // get last ticketId first
            GetPreviousTicketId(enduserId, entry, ticketId, msgObj.company_code, ticketId);
            isNewGetTicket = true;
            var contentInnerId = 'content-inner-scroll-' + ticketId;
            $('#' + contentInnerId).on('scroll', function () {
                var scrollTop = $(this).scrollTop();
                if (scrollTop + $(this).innerHeight() >= this.scrollHeight) {
                    if (!runningTopBotom) {
                        runningTopBotom = true;
                        setTimeout(function () { runningTopBotom = false; }, 200)
                    }

                    // To Do: hide 'To The Top button'

                } else if (scrollTop <= 0) {
                    if (!runningTopBotom) {
                        var last_ticket = $(this).find('.dotted-line').first().attr('ticket-id');
                        GetPreviousTicketId(enduserId, entry, last_ticket, msgObj.company_code, ticketId);
                        runningTopBotom = true;
                        console.log('Top reached');
                        setTimeout(function () { runningTopBotom = false; }, 190)
                    }
                } else {

                    // To Do: show 'To The Top button' if not showed

                }
            });
        }
    }

    // add message row
    var haveImageToLoad = false;
    var haveMsgSendByEndUser = false;
    var contentScrollDiv = $('#content-inner-scroll-' + ticketId);
    var formName = contentScrollDiv.attr('formName');
    var formNameStr = ''
    if (formName != undefined && formName.length > 0) {
        formNameStr = ' (' + formName + ')'
    }
    var lastClientTime = null; // for whatsapp
    for (var i = 0; i < msgListLength; i++) {
        var theMsg = msgList[i];
        var theMsgContentDisplay = (theMsg.msg_content || '').replace(/<[\/]{0,1}(script|object|embed)[^><]*>/ig, "");
        var theMsgMsgType = theMsg.msg_type;

        // if not iXServer greeting message or whatsapp not qr cta message linkify
        if ((theMsg.sender != '0' && entry != 'whatsapp') || (entry == 'whatsapp' && theMsgMsgType != 'tp_qr' && theMsgMsgType != 'tp_cta')) {
            theMsgContentDisplay = SC.linkify(theMsgContentDisplay);
        }
        var sentTime = SC.returnDateTime(theMsg.sent_time);
        var theMsgDate = SC.handleDate(sentTime);
        var theMsgTime = theMsgDate == '' ? sentTime.slice(11, 19) : "";
        var msgObjectPath = theMsg.msg_object_path;
        var msgId = String(theMsg.id || '');
        var handleContentMsgObj = {}
        if (msgObjectPath != null) {
            handleContentMsgObj = SC.handleContentMsg(theMsg.msg_object_path, theMsg.msg_object_client_name, theMsg.msg_type);
            if (handleContentMsgObj.isImage) {
                haveImageToLoad = true;
            }
            theMsgContentDisplay = handleContentMsgObj.text + '<div>' + theMsgContentDisplay + '</div>'
        }
        if (theMsg.msg_type == 'tp_qr') {
            handleContentMsgObj = SC.handleWATpQRMsg(theMsgContentDisplay)
            theMsgContentDisplay = handleContentMsgObj.text
        } else if (theMsg.msg_type == 'tp_cta') {
            handleContentMsgObj = SC.handleWATpCTAMsg(theMsgContentDisplay)
            theMsgContentDisplay = handleContentMsgObj.text
        }
        if (handleContentMsgObj.isImage) {
            haveImageToLoad = true;
        }

        // add form name if available
        var fbCommentStr = '';
        var fbToHistorStr = '';
        if (entry == 'fb_comment' || entry == 'fb_post') {
            var commentId = theMsg.sc_comment_id;
            fbCommentStr = 'msgId="' + msgId + '" commentId="' + commentId + '" onclick="commentRowClicked(this,' + msgId + ')"';
            fbToHistorStr = '<div class="me-2" onclick="fbHandClicked(event,' + ticketId + ',' + commentId + ')"><i class="far fa-hand-pointer to-history-hand"></i></div>';
            
            // msg content null and msg object path null, is a balnk message means the enduser deleted a message by themself
            if (theMsgContentDisplay == '') {
                theMsgContentDisplay = '[ Customer deleted or edited a message / Received an unsupported file ]';
            }
        }
        var visitorRow = (entry == 'fb_comment' || entry == 'fb_post') ? '' : ' visitor-row';
        var msgRowId = (entry == 'fb_comment' || entry == 'fb_post') ? 'c' + (theMsg.sc_comment_id + sentTime + theMsg.nick_name).replace(/[ .:]/g, '') : String(msgId || '').replace('.','').replace('=','');
        //var duplicateMsg = msgId == -1 ? false : ((String(msgRowId).length > 0) && contentScrollDiv.find('#' + msgRowId).length > 0 ? true : false); // sad that whatsapp spent too much time, so may cannot get back the msg id instantly    //20250320 Unnecessary use of boolean literals in conditional expression.
        var duplicateMsg = msgId != -1 && String(msgRowId).length > 0 && contentScrollDiv.find('#' + msgRowId).length > 0;
        if (!duplicateMsg) {

            // 發送者1:客服,2:enduser
            if (theMsg.send_by_flag == 2) {
                var userIconStr = isFB ? '<img class="user-icon" src="' + theMsg.profile_pic + '" onerror="if (this.src != \'./images/user.png\') this.src = \'./images/user.png\';" />' :
                    '<span class="user-icon"><i class="fas fa-user"></i></span>'
                removeTypingBubble(ticketId);
                contentScrollDiv.append('<div id="' + msgRowId + '" class="message-row' + visitorRow + '"' + fbCommentStr + '><div>' + userIconStr + '<div class="time-with-seconds" title="' + sentTime + '"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div><div class="visitor-content-bubble content-bubble"><div class="content-bubble-name">' +
                    SC.handleBubbleName(theMsg.nick_name, (entry == 'webchat' ? formData : null), null, true) +
                    formNameStr + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div>' + fbToHistorStr + '</div>');
                haveMsgSendByEndUser = true;
                if (entry == 'whatsapp') {
                    lastClientTime = sentTime;
                }
            } else {
                var agentBubbleName = theMsg.sender == '0' ? 'SYSTEM' : isNaN(theMsg.sender) ? (isNaN(theMsg.nick_name) ? theMsg.nick_name : parent.getAgentName(Number(theMsg.nick_name))) : parent.getAgentName(Number(theMsg.sender));
                
                // for chatbot will show selection
                if (theMsg.msg_json && theMsg.msg_json.Commands && theMsg.msg_json.Commands.length > 0) {
                    theMsgContentDisplay += '<div class="mt-1">'
                    var cmds = theMsg.msg_json.Commands
                    for (let cmd of cmds) {
                        theMsgContentDisplay += ('<button class="btn-primary me-2">' + cmd.Title + '</button>')
                    }
                    theMsgContentDisplay += '</div>'
                }
                if (theMsg.msg_completed && theMsg.msg_completed == '-1') {
                    theMsgContentDisplay += ('<span class="text-danger ms-5"><i class="fas fa-exclamation-circle me-2"></i>Failed to send the message</span>');
                }

                // when refresh, the nick_name from agent will become visitor, not agent name
                contentScrollDiv.append('<div id="' + msgRowId + '" class="message-row agent-row"><div class="agent-content-bubble content-bubble"><div class="content-bubble-name">' + agentBubbleName + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div><div><span class="user-icon"><i class="fas fa-user"></i></span><div class="time-with-seconds" title="' + sentTime + '"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div></div>');
            }

            if (theMsg.reply_msg) {
                var replyBubbleStr = '';
                var reply_msg = theMsg.reply_msg;
                var bubbleNow = $('#' + msgRowId).find('.content-bubble');
                var theMsgContentDisplay = (reply_msg.msg_content || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
                var replyMsgMsgType = reply_msg.msg_type;
                var replyMsgObjPath = reply_msg.msg_object_path
                if (replyMsgMsgType != 'tp_qr' && replyMsgMsgType != 'tp_cta') {
                    theMsgContentDisplay = SC.linkify(theMsgContentDisplay);
                }
                var handleContentMsgObj = {}
                if (replyMsgObjPath != null) {
                    handleContentMsgObj = SC.handleContentMsg(reply_msg.msg_object_path, reply_msg.msg_object_client_name, reply_msg.msg_type);
                    theMsgContentDisplay = handleContentMsgObj.text + '<div>' + theMsgContentDisplay + '</div>'
                }

                if (replyMsgMsgType == 'tp_qr') {
                    handleContentMsgObj = SC.handleWATpQRMsg(theMsgContentDisplay)
                    theMsgContentDisplay = handleContentMsgObj.text
                } else if (replyMsgMsgType == 'tp_cta') {
                    handleContentMsgObj = SC.handleWATpCTAMsg(theMsgContentDisplay)
                    theMsgContentDisplay = handleContentMsgObj.text
                }
                if (handleContentMsgObj.isImage) {
                    haveImageToLoad = true;
                }

                if (reply_msg.send_by_flag == 2) { //發送者1:客服,2:enduser{
                    replyBubbleStr = ('<div class="reply-bubble reply-cust"><div class="content-bubble-name">' +
                        reply_msg.nick_name +
                        formNameStr + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div>');
                } else {
                    var agentBubbleName = reply_msg.sender == '0' ? 'SYSTEM' : isNaN(reply_msg.sender) ? (isNaN(reply_msg.nick_name) ? reply_msg.nick_name : parent.getAgentName(Number(reply_msg.nick_name))) : parent.getAgentName(Number(reply_msg.sender));
                    replyBubbleStr = ('<div class="reply-bubble reply-agent"><div class="content-bubble-name">' +
                        agentBubbleName +
                        '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div>');
                }
                $(replyBubbleStr).prependTo(bubbleNow);
            }
        } else {

            // append text or pic to it
            if (theMsg.send_by_flag == 2 && (entry == 'fb_comment' || entry == 'fb_post')) {
                
                // check is that text message appened already, due to William's side bug, 10mins timeout without notifying us, need to check is that the messag already received first
                var contentContainer =  $('#' + msgRowId).data('additional-msg-id', msgId).find('.content-bubble-content');
                var originalContent = contentContainer.html();
                var newContent = theMsgContentDisplay;
                if (originalContent != newContent) {
                    if (theMsg.msg_type == 'text') {
                        $('#' + msgRowId).data('additional-msg-id', msgId).find('.content-bubble-content').prepend('<div>' + theMsgContentDisplay + '</div>')
                    } else {
                        $('#' + msgRowId).data('additional-msg-id', msgId).find('.content-bubble-content').append('<div>' + theMsgContentDisplay + '</div>')
                    }
                }
            }
        }
    }
    if (lastClientTime != null) {
        WARenewTimeout(ticketId, lastClientTime);
    }
    if (offlineFormData.length > 0) {
        var formFieldsStr = '';
        for (let theField of offlineFormData) {
            formFieldsStr += ('<div style="display:table-row;"><div style="display:table-cell;padding-right:10px;padding-bottom:3px;">' + theField.field_name + ': </div><div style="display:table-cell;">' + theField.field_value + '</div></div>');
        }
        contentScrollDiv.append('<div class="message-row visitor-row"><div class="visitor-content-bubble"><div class="content-bubble-name" style="margin-bottom:5px;">Offline Form</div><div class="content-bubble-content"><table>' + formFieldsStr + '</table><div style="float:right;">Received Time: ' + SC.returnDateTime(msgObj.start_time) + '</div></div></div></div>');
    }

    if (haveMsgSendByEndUser) {

        // mark bubble unread if send if not read yet
        if (presentTicketId != ticketId) {
            if (!theBubble.hasClass("bubble-unread")) {
                theBubble.addClass("bubble-unread");
            }
        }

        // prepend the bubble to the top
        var bubbleList = $('#bubble-list-inner');
        var listChildren = bubbleList.children();
        if (listChildren.length > 1) {
            $(theBubble).prependTo(bubbleList.first());
        }
    }

    // ====== 3/3 add auto search if needed ======
    if (newTicket) {
        if (parent.tmpTicketId == ticketId) {

            // will not have any content for search input part, if i know i am being invited
            parent.tmpTicketId = null;
        } else if (entry != 'fb_comment' && entry != 'fb_post') {

            // If entry fb_comment, still show as fb comment
            if (!parent.tmpMonIdArr.includes(ticketId)) {
                var enduserIdStr = '';
                var callType = "";
                var details = "";
                if (entry == 'webchat') {
                    callType = 'Inbound_Webchat';
                } else if (entry == 'whatsapp') {
                    callType = "Inbound_Whatsapp";
                    enduserIdStr = 'enduserId=' + enduserId + ' ';
                    var waTemplateClickStr = 'waTemplate("' + campaign + '")';
                    $('#reply-btn-' + ticketId).before('<button class="s-standalone-btn keyboard-icon" onclick=' + waTemplateClickStr + ' title="WhatsApp Template"><span class="align-sub"><i class="fab fa-whatsapp"></i></span></button>');
                } else if (entry == 'facebook') {
                    callType = "Inbound_Facebook";
                    enduserIdStr = 'enduserId=' + enduserId + ' ';
                } else if (entry == 'wechat') {
                    callType = "Inbound_Wechat";
                    enduserIdStr = 'enduserId=' + enduserId + ' ';
                }

                // still using connId which is int only, so whatsapp now okay now - no whatsapp has db not changed big int yet
                // NO INCOMPLETE for 'whatsapp' yet, as Vincent not yet change the call_history table and the savCallHistory API
                if (entry == 'webchat' || entry == 'facebook' || entry == 'wechat') {
                    callSaveCallHistory(ticketId, callType, null, campaign);
                }
                if (entry == 'webchat') { // only if entry is webchat will have case searching
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
                                var webchatFieldsStr = '';
                                var webchatFields = rDetails['Webchat Fields'] || [];
                                if (webchatFields != undefined && webchatFields.length > 0) {
                                    webchatFieldsStr += ' webchatFields= "';
                                    for (var i = 0; i < webchatFields.length; i++) {
                                        if (i != 0) {
                                            webchatFieldsStr += ','
                                        }
                                        var fieldName = SC.handleFrameDetails(webchatFields[i].Field_Name);
                                        var fieldValue = SC.handleFrameDetails(webchatFields[i].Field_Display);
                                        webchatFieldsStr += (fieldName + ':' + fieldValue);
                                    }
                                    webchatFieldsStr += '"';
                                }
                                if (onlineFormData.length > 0) {
                                    for (var i = 0; i < onlineFormData.length; i++) {
                                        if (i != 0) {
                                            details += ','
                                        }
                                        var fieldName = SC.handleFrameDetails(onlineFormData[i].field_name);
                                        var fieldValue = SC.handleFrameDetails(onlineFormData[i].field_value);
                                        details += (fieldName + ':' + fieldValue);
                                    }
                                }
                                if (offlineFormData.length > 0) {
                                    for (var i = 0; i < offlineFormData.length; i++) {
                                        if (i != 0) {
                                            details += ','
                                        }
                                        var theField = offlineFormData[i];
                                        var fieldName = SC.handleFrameDetails(theField.field_name);
                                        var fieldValue = SC.handleFrameDetails(theField.field_value);
                                        details += (fieldName + ':' + fieldValue);
                                    }
                                }
                                if (!noFormInSocial) {
                                    $('#search-input-section').append('<div id="search-input-' + ticketId + '" class="search-input">' +
                                        '<iframe id="input-form-' + ticketId + '" openType="social" campaign="' + campaign + '" connId="' + ticketId + '" callType="' + callType + '" ' + enduserIdStr + 'details="' + details + '"' + webchatFieldsStr + ' width="100%" height="auto" style="display: none; border: none;"></iframe>' +
                                        '<iframe id="search-' + ticketId + '" src="./search.html" openType="social" campaign="' + campaign + '" connId="' + ticketId + '" callType="' + callType + '" ' + enduserIdStr + 'details="' + escape(details) + '"' + webchatFieldsStr + ' width="100%" height="auto" style="border: none;"></iframe></div>');
                                }
                            }
                        }
                    });

                    // add search
                    // entry != 'wechat', details will be empty string, facebook and wechat nick name is not good for case searching
                } else {
                    if (!noFormInSocial) {
                        $('#search-input-section').append('<div id="search-input-' + ticketId + '" class="search-input">' +
                            '<iframe id="input-form-' + ticketId + '" openType="social" campaign="' + campaign + '" connId="' + ticketId + '" callType="' + callType + '" ' + enduserIdStr + ' details="" width="100%" height="auto" style="display: none; border: none;"></iframe>' +
                            '<iframe id="search-' + ticketId + '" src="./search.html" openType="social" campaign="' + campaign + '" connId="' + ticketId + '" callType="' + callType + '" ' + enduserIdStr + ' details="" width="100%" height="auto" style="border: none;"></iframe>' +
                            '</div>');

                        $('#bubble-list-inner').height('752px'); // previous height maybe fb_comment height, so need to adjust
                    }
                }
            } else {
                // momn
            }
        } else if (entry == 'fb_comment' || entry == 'fb_post') {
            $('#content-' + ticketId).find('.content-section-inner').width('60%').css('display', 'inline-block');
            $('#content-' + ticketId).append('<div class="fb-comment-inner" style="width:40%;display:inline-block;float:right;"><div id="fb-scroll-' + ticketId + '" class="fb-scroll custom-scroll"><div id="fb-title-' + ticketId + '"></div><div id="fb-media-' + ticketId + '"></div>' +
                '<div class="mt-3 justify-content-between d-flex align-items-center"><button class="btn btn-warning btn-circle box-sizing-border-box" title="Reload History" onclick="reloadFBHistory(' + ticketId + ')"><i class="fas fa-redo"></i></button><span style="color: #606770;" id="no-of-comment-' + ticketId + '"></span></div>' +
                '<div style="margin-top:13px;margin-bottom:13px;border-top:3px dotted darkgray;"></div><div id="fb-content-' + ticketId + '"></div></div></div>');
            $('#navigation ul li').css('display', 'inline-block');

            // add FB Content
            getFBPostContent(ticketId);
            $('#reply-btn-' + ticketId).before('<button class="s-standalone-btn" data-bs-toggle="tooltip" data-bs-placement="top" title="Select all messages" onclick="selectAllClicked(' + ticketId + ')"><span class="align-sub"><i class="far fa-check-square keyboard-icon"></i></span></button><button class="reply-discard-container" data-bs-toggle="tooltip" data-bs-placement="top" title="No need to answer for selected comment(s)" onclick="discardClicked(' + ticketId + ')"><span><i class="far fa-times-circle keyboard-icon"></i></span></button>');
            parent.toBeUnloadedPost.push(ticketId);
            resize();
            getFBComments(ticketId);
            $('#bubble-list-inner').height('calc(100vh - 29px)');
        }
    }

    // scroll to the bottom
    var objDiv = document.getElementById('content-inner-scroll-' + ticketId);

    // if have image need to wait till it downloaded to scroll down
    if (haveImageToLoad) {

        // need the file put to the locatino first, 500 is not enough, so changed 1000
        setTimeout(function (p) {
            var objDiv = p.objDiv;
            objDiv.scrollTop = objDiv.scrollHeight;
        }.bind(this, { objDiv: objDiv }), 1000);
    } else {
        objDiv.scrollTop = objDiv.scrollHeight;
    }
}

function updatePhotoConfirmed(campaign, customerId, iconSrc, ticketId) {
    if (confirm(langJson['l-confirm-change-profile-photo'])) {
        var fileData = new FormData();
        var URL = iconSrc;
        var request = new XMLHttpRequest();
        request.responseType = "blob"; //The response is a Blob object containing the binary data.
        request.onload = function () {
            fileData.append("Photo_File", request.response);
            fileData.append('Customer_Id', customerId);
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
                var response = JSON.parse(r.responseText);
                if (!/^success$/i.test(response.result || "")) {
                    console.log(r);
                } else {
                    // change input form icon
                    $('#input-form-' + ticketId).contents().find('#profile-pic').attr('src', iconSrc);
                }
            });
        }
        request.open("GET", URL);
        request.send();
    }
}

//  Other then FB post, first time chat will call this
function callSaveCallHistory(connId, callType, internalCaseNo, campaign) {
    var dataObj = {
        "Conn_Id": Number(connId),
        "Call_Type": callType,
        "Updated_By": loginId,
        Agent_Id: loginId,
        Token: token
    };
    if (internalCaseNo != null) {
        dataObj["Internal_Case_No"] = internalCaseNo
    }
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/SaveCallHistory',
        data: JSON.stringify(dataObj),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in callSaveCallHistory');
                console.log(r.details);
            }
        },
        error: function (r) {
            console.log('error in callSaveCallHistory');
            console.log(r);
        }
    });
}

function addFormNameToContent(ticketId, formName) {
    var contentVisitorNameContainer = $('#content-inner-scroll-' + ticketId).find('.visitor-content-bubble').find('.content-bubble-name');

    // whatsApp and FB name can be changed, use the last time used name
    var visitorOriginalName = contentVisitorNameContainer[contentVisitorNameContainer.length-1].textContent;
    contentVisitorNameContainer.text(visitorOriginalName + ' (' + formName + ')');
}

function returnToSearch(theConnId) {
    var theInputForm = $('#input-form-' + theConnId);
    theInputForm.attr('src', '');
    theInputForm.hide();
    $('#search-' + theConnId).show();
}

// called from serch.html
function openInputForm(connId, callType, internalCaseNo, campaign, rowData, customerId) {
    var iframeInputForm = $('#input-form-' + connId);
    iframeInputForm.attr('src', './campaign/' + campaign + '/inputForm.html');
    iframeInputForm.removeClass('jit-inspected');
    $('#search-' + connId).hide();
    iframeInputForm.show();

    // still using connId which is int only, so whatsapp now okay now
    if (callType == 'Inbound_Webchat' || callType == 'Inbound_Wechat' || callType == 'Inbound_Facebook') {
        callSaveCallHistory(connId, callType, internalCaseNo, campaign);
    }
    if (rowData != null) {
        var formName = rowData.Name_Eng;
        if (formName != null && formName.length > 0) {

            // add name to the content div, future bubble can get the name
            // update existing bubble name if not added before
            var scrollDiv = $('#content-inner-scroll-' + connId);
            var scrollDivName = scrollDiv.attr('formName');
            if (scrollDivName == undefined || scrollDivName.length == 0) {
                scrollDiv.attr('formName', formName);
                addFormNameToContent(connId, formName);
            }
        }
    }

    // existing photo add onlick attribute
    if (callType == 'Inbound_Facebook') { // the wechat photo src is from Tencent, they do not allow get the photo
        var userIcon = $('#content-' + connId).find('.visitor-row').find('.user-icon');
        if (userIcon != null && userIcon.length > 0) {
            var firstIcon = userIcon.first();
            var iconSrc = firstIcon.attr('src');

            // verify not default icon
            if (firstIcon.attr('src') == './images/user.png') {
                return
            } else {
                var onclickFn = 'updatePhotoConfirmed("' + campaign + '",' + customerId + ',"' + iconSrc + '",' + connId + ')';
                userIcon.attr('onclick', onclickFn);

                // add onclickFn to the content div, so future content bubble can add the fn also
                $('#content-' + connId).attr('onclickFn', onclickFn);
            }
        }
    }
}

// Get the modal
var modal = document.getElementById("myModal");

// Get the image and insert it inside the modal - use its "alt" text as a caption
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");

function enlargeImage(oThis) {
    modal.style.display = "block";
    modalImg.src = oThis.src;
    captionText.innerHTML = oThis.alt;
}


function closeEnlageModal() {
    modal.style.display = "none";
}

$(document).ready(function () {
    if (customCompany != 'no') {
        $('.module-campaign-span').hide();
    }
});

// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());