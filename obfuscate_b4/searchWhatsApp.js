var campaign = parent.campaign;
var tblBuilt = false;
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var userIconSrc = "../images/user.png";
var functions = sessionStorage.getItem('scrmFunctions') || '';
var canDownloadVoice = functions.indexOf('Download-Voice') != -1;
var downloadVoiceStr = canDownloadVoice ? '' : ' controlsList="nodownload"';

// today variable need to put here as SocialContent.js will use today this variable
var newDate = new Date();
var year = newDate.getFullYear();
var mm = newDate.getMonth() + 1; //January is 0!
var dd = newDate.getDate();
if (dd < 10) {
    dd = '0' + dd
}
if (mm < 10) {
    mm = '0' + mm
}
var today = year + ' - ' + mm + ' - ' + dd;

function returnAgentName(sender, nick_name) {
    if (sender == '0') {
        return 'SYSTEM';
    } else if (isNaN(sender) && isNaN(nick_name)) {
        return nick_name;
    } else if (isNaN(sender) && !isNaN(nick_name)) {
        return parent.parent.getAgentName(Number(nick_name));
    } else if (!isNaN(sender)) {
        return parent.parent.getAgentName(Number(sender));
    } else {
        return sender;
    }
}

function buildHistory(msg_list) {
    var contentScrollDiv = $('#whatsapp-container')
    for (let theMsg of msg_list) {
        var sentTime = theMsg.sent_time;
        var theMsgDate = SC.handleDate(sentTime);
        var theMsgTime = theMsgDate == '' ? SC.returnTime(sentTime, true) : (" " + SC.returnTime(sentTime, true));
        var theMsgContentDisplay = (theMsg.msg_content || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var msgObjectPath = theMsg.msg_object_path;
        var handleContentMsgObj = {}
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

        if (theMsg.send_by_flag == 2) { //發送者1:客服,2:enduser{
            contentScrollDiv.append('<div id="' + theMsg.msg_id + '" class="message-row"><div><span class="user-icon"><i class="fas fa-user"></i></span><div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime +
                '</span></div></div><div class="visitor-content-bubble content-bubble"><div class="content-bubble-name">' +
                theMsg.nick_name + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div></div>');
        } else {
            var agentBubbleName = returnAgentName(theMsg.sender, theMsg.nick_name);
            // for chatbot will show selection
            if (theMsg.msg_json && theMsg.msg_json.Commands && theMsg.msg_json.Commands.length > 0) {
                theMsgContentDisplay += '<div class="mt-1">'
                let cmds = theMsg.msg_json.Commands;
                for (let cmd of cmds) {
                    theMsgContentDisplay += ('<button class="btn-primary mr-2">' + cmd.Title + '</button>')
                }
                theMsgContentDisplay += '</div>'
            }

            if (theMsg.msg_completed && theMsg.msg_completed == '-1') {
                theMsgContentDisplay += ('<span class="text-danger ml-5"><i class="fas fa-exclamation-circle mr-2"></i>Failed to send the message</span>');
            }
            // when refresh, the nick_name from agent will become visitor, not agent name
            // contentScrollDiv.append('<div id="' + msgId + '" class="message-row agent-row"><div class="agent-content-bubble"><div class="content-bubble-name">' + agentBubbleName + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div><div><span class="user-icon"><i class="fas fa-user"></i></span><div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div></div>');
            contentScrollDiv.append('<div id="' + theMsg.msg_id + '" class="message-row agent-row"><div class="agent-content-bubble content-bubble"><div class="content-bubble-name">' + agentBubbleName + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div><div><span class="user-icon"><i class="fas fa-user"></i></span><div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div></div>');
        }

        if (theMsg.reply_msg) {
            var replyBubbleStr = '';
            var reply_msg = theMsg.reply_msg;
            var bubbleNow = $('#' + theMsg.msg_id).find('.content-bubble');
            var replyMsgContentDisplay = (reply_msg.msg_content || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
            var replyMsgMsgType = reply_msg.msg_type;
            if (replyMsgMsgType != 'tp_qr' && replyMsgMsgType != 'tp_cta') {
                replyMsgContentDisplay = SC.linkify(replyMsgContentDisplay);
            }
            var replyMsgObjPath = reply_msg.msg_object_path;
            var replyContentMsgObj = {}
            if (replyMsgObjPath != null) {
                replyContentMsgObj = SC.handleContentMsg(replyMsgObjPath, reply_msg.msg_object_client_name, reply_msg.msg_type);
                replyMsgContentDisplay = replyContentMsgObj.text + '<div>' + replyMsgContentDisplay + '</div>'
            }

            if (replyMsgMsgType == 'tp_qr') {
                replyContentMsgObj = SC.handleWATpQRMsg(replyMsgContentDisplay)
                replyMsgContentDisplay = replyContentMsgObj.text
            } else if (replyMsgMsgType == 'tp_cta') {
                replyContentMsgObj = SC.handleWATpCTAMsg(replyMsgContentDisplay)
                replyMsgContentDisplay = replyContentMsgObj.text
            }

            if (reply_msg.send_by_flag == 2) { //發送者1:客服,2:enduser{
                replyBubbleStr = ('<div class="reply-bubble reply-cust"><div class="content-bubble-name">' +
                    reply_msg.nick_name +
                    formNameStr + '</div><div class="content-bubble-content">' + replyMsgContentDisplay + '</div></div>');
            } else {
                var replyAgentBubbleName = returnAgentName(reply_msg.sender, reply_msg.nick_name);
                replyBubbleStr = ('<div class="reply-bubble reply-agent"><div class="content-bubble-name">' +
                    replyAgentBubbleName +
                    '</div><div class="content-bubble-content">' + replyMsgContentDisplay + '</div></div>');
            }
            $(replyBubbleStr).prependTo(bubbleNow);
        }
    }
}

$(document).ready(function () {
    if (parent.parent.iframeRecheck) {
        parent.parent.iframeRecheck($(parent.document));
    }

    $('#whatsapp-start-date').datepicker({
        showOn: "button",
        buttonImage: "../images/calendar-grid-30.svg",
        buttonStyle: 'height:1000px',
        buttonImageOnly: true,
        buttonText: "Select date",
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true
    });
    $("#whatsapp-start-date").datepicker().datepicker("setDate", newDate);
    $('#whatsapp-end-date').datepicker({
        showOn: "button",
        buttonImage: "../images/calendar-grid-30.svg",
        buttonStyle: 'height:1000px',
        buttonImageOnly: true,
        buttonText: "Select date",
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true
    });
    $("#whatsapp-end-date").datepicker().datepicker("setDate", newDate);
    // if click enter key in phone no. field will search also
    $('#whatsapp-phone-no').on('keypress', function (e) {
        // if pressed enter
        if (e.keyCode == 13) {
            e.preventDefault();
            $('#search-whatsapp-btn').click()
            return false;
        }
    });

    $('#search-whatsapp-btn').on('click', function (e) {
        e.preventDefault(); // this has to be added, otherwise, the return below will no stop action
        $(this).prop('disabled', true);
        var startDate = $('#whatsapp-start-date').val() || '';
        var endDate = $('#whatsapp-end-date').val() || '';
        var phoneNo = $('#whatsapp-phone-no').val() || '';
        if (startDate.length == 0 || endDate.length == 0 || phoneNo.length == 0) {
            alert('Please fill in all required fields');
            $(this).prop('disabled', false);
            return;
        }
        if (phoneNo.length < 7) {
            alert('Invalid phone number');
            $(this).prop('disabled', false);
            return;
        }
        // to avoid duration too long affact database speed, so only 30 days allowed
        var startDateAr = startDate.split('/');
        var endDateArr = endDate.split('/');
        var startDateObj = new Date(startDateAr[0], (startDateAr[1] - 1), startDateAr[2]);
        var endDateObj = new Date(endDateArr[0], (endDateArr[1] - 1), endDateArr[2]);
        const diffTime = Math.abs(endDateObj - startDateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // the start and end date will be shown, so need to be counted also
        if (diffDays > 30) {
            alert('Duration cannot be longer than 30 days');
            $(this).prop('disabled', false);
            return;
        }

        // should clear before call, will give a blink empty and then load again feeling, if in he callback, will like not loaded
        $('#whatsapp-container').empty();
        parent.parent.document.getElementById("phone-panel").contentWindow.wiseGetWhatsappMsg(campaign, startDate, endDate, phoneNo, function (msg_list) {
            if (msg_list.length == 0) {
                $('#whatsapp-container').append('<b>No records found.</b>')
            } else {
                buildHistory(msg_list);
            }
            $('#search-whatsapp-btn').prop('disabled', false);
        });
    })
});
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());



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

function windowOnload() {
    setLanguage();
}

function setLanguage() {
    $('.l-menu-search-whatsapp').text(langJson['l-menu-search-whatsapp']);
    $('.l-search-start-date').text(langJson['l-search-start-date']);
    $('.l-search-end-date').text(langJson['l-search-end-date']);
    $('.l-search-phone').text(langJson['l-search-phone']);
    $('.l-search-search').text(langJson['l-search-search']);
}