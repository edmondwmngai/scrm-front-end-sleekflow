var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';
var agentName = sessionStorage.getItem('scrmAgentName') || '';
var agentOpenFrom = '';
var customCompany = sessionStorage.getItem('scrmCustomCompany') || 'no';
var functions = sessionStorage.getItem('scrmFunctions') || ''; // Needed for expire time and add wise-mon wallbaord functions
var langJson = {};
var makeCallTabType = '';
var mvcHost = config.mvcHost;
var mvcUrl = config.mvcUrl;
var openWindows = [];
var getSocialMsgConnId = -1;
var getSocialMsgType = ''; // If call from social media > 0, if call from Menu = -1, traditional = 0
var mainOldTicketObj = {};
var restorable = sessionStorage.getItem('scrmRestorable');
var scrmLanguage = sessionStorage.getItem('scrmLanguage');

var tabIndex = 0;
var tmpTicketId = null; // Ticket id for the chat going to join, once form build, will return to null or social media reply call click
var tmpMonIdArr = [];
var tmpAgentId = null; // The agent invite to the chatroom, once form build, will return to null. or the agent going to silent join the chat

var toBeUnloadedPost = [];
var traditionalTabName = {
    'Inbound_Email': 'Email',
    'Inbound_Fax': 'Fax',
    'Inbound_Voicemail': 'Vmail',
    'Inbound_Call': 'Call'
};
window.agentList = [];
var wiseMonPopup = null;
var wallboardPopup = null;
var wmAgentObj = {};
var wmACDObj = {};
var confirmedLogout = false;
if (sessionStorage.getItem('scrmLoggedIn') == null) {
    if (scrmLanguage == 'TC') {
        alert('您尚未登入');
    } else {
        alert("You are not logged in");
    }
    var queryStr = customCompany == 'no' ? '' : '?custom=' + customCompany;
    window.top.location.href = window.top.location.href.replace('main.html', './login.html' + queryStr);
}

// Call from menu.html
function getAgentName(theAgentId) {
    var agentObj = gf.altFind(window.agentList, function (obj) {
        return obj.AgentID == theAgentId
    });
    if (agentObj != undefined) {
        return agentObj.AgentName;
    } else {
        return theAgentId;
    }
}

function bindEvent(element, eventName, eventHandler) {
    if (element.addEventListener) {
        element.addEventListener(eventName, eventHandler, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler);
    }
}

function readyClicked() {
    var ppc = document.getElementById("phone-panel").contentWindow;
    ppc.toggleReadyIdle();
    // To have the e.preventDfault effect
    return false;
}

function phoneNoClicked(no) {
    var phoneNoField = $('#phone-panel-no');
    var phoneNoFieldNo = String(phoneNoField.val()) + String(no);
    phoneNoField.val(phoneNoFieldNo);
    var ppc = document.getElementById("phone-panel").contentWindow;
    ppc.wiseSendDTMF(no);
}

function phoneClicked(btnType) {
    var ppc = document.getElementById("phone-panel").contentWindow;
    switch (btnType) {
        case 'make':
            makeCallTabType = '';
            ppc.wiseMakeCall(null, config.telPrefix + document.getElementById('phone-panel-no').value);
            break;
        case 'drop':
            ppc.wiseDropCall();
            break;
        case 'hold':
            $('#icon-line-1').addClass('title-btn-disabled').parent().css('cursor', 'wait');
            setTimeout(function () {
                $('#icon-line-1').removeClass('title-btn-disabled').parent().css('cursor', 'unset');
            }, 1000);
            ppc.wiseHoldCall();
            break;
        case 'agent':
            var phoneNum = document.getElementById('phone-panel-no').value;
            if (phoneNum.length == 0) {
                alert('You will need to enter the Agent ID in Tel field before clicking this button.\n\nThe agent you want to call have to be in IDLE mode, otherwise you will be alerted: Invalid device ID')
                return;
            }
            ppc.wiseCallAgent();
            break;
        case 'conference':
            ppc.wiseMakeConference();
            break;
        case 'transfer':
            ppc.wiseTransferCall();
            break;
        default:
            break;
    }
}

function directCallClicked() {
    var ppc = document.getElementById("phone-panel").contentWindow;
    ppc.wiseAnswerDirectCall();
}

var windowOnBeforeUnload = function () {
    // for (let ticketId of toBeUnloadedPost) {

    //     // To make the ticket not owned by the agent
    //     document.getElementById("phone-panel").contentWindow.wiseAssignToChatRoom(ticketId, loginId, 'R');

    //     // Put the ticket back to the queue
    //     document.getElementById("phone-panel").contentWindow.wiseCompleteTicket(ticketId);
    // }

    // // Used When User Directly Closing Browser
    // if (!confirmedLogout) {
    //     logoutClicked();
    // }
}

function sessionTimeout() {
    alert('Session Timeout');
    logoutClicked();
}

function logoutClicked() {
    confirmedLogout = true;
    // Close all pop-up
    var popupLen = openWindows.length; // the length will change when window close, so need to get now
    if (popupLen > 0) {
        while (popupLen > 0) {
            popupLen = popupLen - 1;
            var theWin = openWindows[popupLen].window;
            if (theWin) {
                theWin.close();
            }
        }
    }
    // Remove all sessionstorage
    for (var i = 0; i < sessionStorage.length; i++) {
        var a = sessionStorage.key(i);
        sessionStorage.removeItem(a);
    }

    var queryStr = customCompany == 'no' ? '' : '?custom=' + customCompany;
    window.top.location.href = window.top.location.href.replace('main.html', './login.html' + queryStr);
    // NO DEL
    // if (restorable == 'true') {
    //     window.top.location.href = window.top.location.href.replace('main.html', 'login.html?restorable=true');
    // } else 
    // if (customCompany != 'no') {
    //     window.top.location.href = window.top.location.href.replace('main.html', './login.html?custom=' + customCompany);
    // } else {
    //     window.top.location.href = window.top.location.href.replace('main.html', 'login.html');
    // }
    // /NO DEL
}

function turnDefault() { // Call from traditionalMedia.html
    document.getElementById('main').src = "../default.html";
}

function returnMain() { // Call from inputForm.html
    window.location.href = '../../main.html';
}
// ======================= Call from inputForm.html for reply to Phone.html =======================
function makeCall(serviceName, phoneNo, tabType, callTicketId) { // when dial clicked yes to confirm the call
    document.getElementById('phone-panel-no').value = phoneNo;
    document.getElementById("phone-panel").contentWindow.wiseMakeCall(serviceName, Number(config.telPrefix + String(phoneNo)));
    makeCallTabType = tabType;
    tmpTicketId = callTicketId || null;
}

function sendEmail(serviceName, emailTo, emailCc, emailSubject, emailContent, attachedFiles) {
    var connId = document.getElementById("phone-panel").contentWindow.wiseSendEmail(serviceName, emailTo, emailCc, emailSubject, emailContent, attachedFiles);
    return connId;
}

function sendSMS(serviceName, phoneNo, shortMsg) {
    var connId = document.getElementById("phone-panel").contentWindow.wiseSendSMS(serviceName, phoneNo, shortMsg);
    return connId;
}

function sendFax(serviceName, faxNo, faxFile, coverSubject, coverMsg, coverAttn, coverSender, coverCompany) {
    var connId = document.getElementById("phone-panel").contentWindow.wiseSendFax(serviceName, Number(config.telPrefix + String(faxNo)), faxFile, coverSubject, coverMsg, coverAttn, coverSender, coverCompany);
    return connId;
}

function setMediaHandled(channel, mediaId, caseNo) { //Call from search.html to Phone.html
    document.getElementById("phone-panel").contentWindow.wiseSetMediaHandled(channel, mediaId, caseNo);
}

function statusChange(status) {
    var ppc = document.getElementById("phone-panel").contentWindow;
    switch (status) {
        case 'ready':
            ppc.wiseReadyToTalk();
            break;
        case 'idle':
            ppc.wiseIdleMode();
            break;
        case 'break':
            ppc.wiseBreakMode();
            break;
        default:
            break;
    }
    // To have the e.preventDfault effect
    return false;
}

function assignAgent(channel, mediaId, assignTo, callback) { //Call from email/fax/vmail.html to Phone.html
    document.getElementById("phone-panel").contentWindow.wiseAssignAgent(channel, mediaId, assignTo, callback);
}
// ======================= /Call from inputForm.html for reply to Phone.html =======================
// ============================= Call from Phone.html to send to inputForm =========================
function replyCallClick(lastCallType, lastCallID, confConnID) {
    if (makeCallTabType.length != '') {
        var iframeMain = document.getElementById(makeCallTabType + '-main'); // menu-main/traditional/main/social-media-main
        iframeMain.contentWindow.replyCallClick(lastCallType, lastCallID, confConnID, tmpTicketId);
    } else {
        // To do: reply call save to incomplete cases, and can invalid media at incomplete cases (like hktb is_saved Y)
    }
}
// ============================= /Call from Phone.html to send to inputForm =========================
// ============================= SOCIAL MEDIA =========================
// Create custom event in Javascript library
function addEventListener(el, eventName, handler) {
    if (el.addEventListener) {
        el.addEventListener(eventName, handler);
    }
}
// 1.	Social Media Message
addEventListener(document, 'onWiseSocialMsg', function (e) {
    var obj = e.detail;
    // open message
    var iframeMain = document.getElementById('social-media-main');
    iframeMain.contentWindow.createOrUpdateBubble(obj);
});
// 1.5	Social Media Message History
addEventListener(document, 'onWiseSocialMsgList', function (e) {
    var obj = e.detail;
    var iframeMain;

    // Open message
    // Change more in online form data
    var onlineFormData = obj.online_form_data;
    for (var i = 0; i < onlineFormData.length; i++) {
        var theField = onlineFormData[i];
        if (theField.field_name == 'More') {
            var moreObj = JSON.parse(theField.field_value || {});
            var theSource = moreObj.source;
            var theCompanyName = moreObj.companyName;
            var theLang = moreObj.lang;
            var theQrCode = moreObj.qrcode;
            var theLocation = moreObj.location;
            var theBrowser = moreObj.browser;
            var theE = moreObj.e;
            delete onlineFormData.splice(i, 1);
            if (theSource && theSource != "" && theSource != "undefined") {
                onlineFormData.push({
                    field_name: "Source",
                    field_value: theSource
                });
            }
            if (theCompanyName && theCompanyName != "" && theCompanyName != "undefined") {
                onlineFormData.push({
                    field_name: "Webchat Location",
                    field_value: theCompanyName
                });
            }
            if (theLang && theLang != "") {
                onlineFormData.push({
                    field_name: "Language",
                    field_value: theLang
                });
            }
            if (theQrCode && theQrCode != "") {
                onlineFormData.push({
                    field_name: "QR Code",
                    field_value: theQrCode
                });
            }
            if (theLocation && theLocation != "") {
                onlineFormData.push({
                    field_name: "Country",
                    field_value: theLocation
                });
            }
            if (theBrowser && theBrowser != "") {
                onlineFormData.push({
                    field_name: "Browser (ref only)",
                    field_value: moreObj.brower_user_agent
                });
            }
            if (theE && theE != "") {
                var b10 = parseInt(theE, 36);
                onlineFormData.push({
                    field_name: "CTC Info",
                    field_value: b10
                });
            }
            break;
        }
    }
    // /Change more in online form data
    if (getSocialMsgType == 'social') {
        iframeMain = document.getElementById('social-media-main');
        iframeMain.contentWindow.gotMsgHistory(obj, getSocialMsgConnId); // getSocialMsgConnId if for getting the input-form iframe
    } else if (getSocialMsgType == 'incomplete') {
        if (obj.ticket_id == getSocialMsgConnId) {
            iframeMain = document.getElementById('menu-main');
            iframeMain.contentWindow.gotMsgHistory(obj, 'incomplete');
        }
    } else if (getSocialMsgType == 'menu') {
        iframeMain = document.getElementById('menu-main');
        iframeMain.contentWindow.gotMsgHistory(obj);
    } else if (getSocialMsgType == 'traditional') {
        // var iframeMain = document.getElementById('traditional-main');
        iframeMain = document.getElementById('traditional-media-main');
        iframeMain.contentWindow.gotMsgHistory(obj);
    } else if (getSocialMsgType == 'scheduled-reminder') {
        iframeMain = document.getElementById('scheduled-reminder-main');
        iframeMain.contentWindow.gotMsgHistory(obj);
    } else { // getSocialMsgType == 'social:[ticket length]"
        // var typeArr = getSocialMsgType.split(":");
        // var ticketLength = typeArr[1];
        var getTicketId = obj.ticket_id;
        var theGetMsgConnId = mainOldTicketObj[getTicketId].getSocialMsgConnId;
        var theGetMsgTicketLen = mainOldTicketObj[getTicketId].ticketLen;
        iframeMain = document.getElementById('social-media-main');
        iframeMain.contentWindow.addOldHistory(obj, theGetMsgConnId, theGetMsgTicketLen);
    }
});
// // 2.	Social Media Status
addEventListener(document, 'onWiseSocialStatus', function (e) {
    var obj = e.detail;
    var iframeMain = document.getElementById('social-media-main');
    iframeMain.contentWindow.addSocialStatus(obj); // e.g. {ticket_id: -1944358426, ticket_status: ["timeout" or "end"]}
});
// 3.	Get All Messages for Social Media   // To Do: seems not work now?
function getTicketMsg(ticketId, inputFormConnId, inputFormType) { // type is optional, menu = -1, traditional = -2, null = social media
    getSocialMsgType = inputFormType;
    // geting facebook old message, the input form type will not the ticket length
    if (typeof inputFormType === 'number') {
        mainOldTicketObj[ticketId] = {};
        mainOldTicketObj[ticketId].getSocialMsgConnId = inputFormConnId;
        mainOldTicketObj[ticketId].ticketLen = inputFormType;
    } else {
        getSocialMsgConnId = inputFormConnId;
    }
    document.getElementById("phone-panel").contentWindow.wiseGetTicketMsg(ticketId);
}
// 4.	Send Message for Social Media
function sendSocialMsg(ticketId, msgText, completedMsgIdList, callback, msgId) { // completedMsgIdList = fb comment message ids array
    document.getElementById("phone-panel").contentWindow.wiseSendSocialMsg_Ex(ticketId, msgText, completedMsgIdList, callback, msgId);
}
// 5.	Upload File for Social Media
// 6.	Send File for Social Media
function sendSocialFile(ticketId, filePath, completedMsgIdList, callback) {
    console.log('ticketId, filePath, completedMsgIdList, callback @ sendSocialFile');
    console.log(ticketId, filePath, completedMsgIdList, callback);
    document.getElementById("phone-panel").contentWindow.wiseSendSocialFile_Ex(ticketId, filePath, completedMsgIdList, callback);
}
// completedMsgIdList is only for facebook fan page. It contains array of msgId when agent replay message for list of comment in facebook fan page.
// Call from inputForm.html to socialMedia.html
function callSavedCase(ticketId) {
    var iframeMain = document.getElementById('social-media-main');
    iframeMain.contentWindow.savedCase(ticketId);
}
// 7. Get FB Post Content
addEventListener(document, 'onWiseFBPost', function (e) {
    var obj = e.detail;
    var iframeMain = document.getElementById('social-media-main');
    iframeMain.contentWindow.gotFBPostInfo(obj); // e.g. {ticket_id: -1944358426, ticket_status: ["timeout" or "end"]}
    console.log('obj @ onWiseFBPost');
    console.log(obj);
});
// 8. Receive Agent to chat
addEventListener(document, 'onWiseRecvInvAgentToChat', function (e) {
    var obj = e.detail;
});
// 9. Got Conference Call Request
function acceptRejectClicked(isAccept) {
    var replyMessage = $('#be-invited-message').val();
    var ticketId = document.getElementById('be-invited-ticketid').innerHTML;
    var phoneContent = document.getElementById("phone-panel").contentWindow;
    if (isAccept) {

        // add myself to the ticket
        phoneContent.wiseAssignToChatRoom(ticketId, loginId, 'A');
        phoneContent.wiseSendMessage_UC(3, tmpAgentId, 'systemMsg-`!^~accept-`!^~' + ticketId + '-`!^~' + replyMessage);
    } else {
        phoneContent.wiseSendMessage_UC(3, tmpAgentId, 'systemMsg-`!^~reject-`!^~' + ticketId + '-`!^~' + replyMessage);
    }
    $('#beInvitedModal').modal('toggle');
    tmpAgentId = null;
}

// 9.5  be invited to a chat room
addEventListener(document, 'onWiseClientMsgID', function (e) {
    var obj = e.detail;
    var invitedBy = obj.agent_id;
    var ticketId = obj.ticket_id;
    var msgContentArr = obj.msg_content.split('-`!^~');
    var requestMsg = msgContentArr[3] || '';
    document.getElementById('be-invited-campaign').innerHTML = msgContentArr[1];
    document.getElementById('be-invited-entry').innerHTML = msgContentArr[2];
    document.getElementById('be-invited-ticketid').innerHTML = ticketId;
    document.getElementById('be-invited-agent').innerHTML = getAgentName(invitedBy) + ' (ID: ' + invitedBy + ')';
    document.getElementById('be-invited-request').innerHTML = requestMsg.length > 0 ? requestMsg : '[empty]';
    tmpAgentId = invitedBy;
    $('#be-invited-message').val('');
    $('#beInvitedModal').modal('show');
    // to not show search or input form part when accepted the request
    tmpTicketId = ticketId;
});
// 8. Received Message From Invited Agent
addEventListener(document, 'onWiseRecvShortMsg_UC', function (e) {
    var obj = e.detail;
    var sentMsgAgent = obj.DeviceID;
    var shortMsg = obj.ShortMsg || '';
    if (shortMsg.startsWith('systemMsg-`!^~')) {
        var msgArr = shortMsg.split('-`!^~');
        var iframeMain = document.getElementById('social-media-main');
        iframeMain.contentWindow.handleSystemMsg(sentMsgAgent, msgArr[1], msgArr[2], msgArr[3], msgArr[4], msgArr[5], msgArr[6]);
    } else {
        if (!shortMsg.startsWith('~~~')) {
            var alertStr = '<div class="alert alert-warning d-grid">' + getAgentName(sentMsgAgent) +
                ' (ID: ' + sentMsgAgent + '):&nbsp;&nbsp;' + shortMsg +
                '&nbsp;&nbsp;&nbsp;<button type="button" class="close btn" data-dismiss="alert"><i class="fas fa-times-circle float-right"></i></button></div>'
            $('#alert-container').append(alertStr);
        }
    }
});

// 8.5 Call get agent List, will have response 9. onWiseAgentList 
// agentOpenFrom: 'social-media-main'; channelType: call/fax/webchat/vmail
function getAgentList(openType, campaign, channelType) {
    agentOpenFrom = openType;
    document.getElementById("phone-panel").contentWindow.WiseGetAgentList(campaign, channelType);
}

// 9. Received Message From Invited Agent
addEventListener(document, 'onWiseAgentList', function (e) {
    var obj = e.detail;
    if (agentOpenFrom.length > 0) {
        var iframeMain = document.getElementById(agentOpenFrom);
        iframeMain.contentWindow.gotAgentList(obj.Member);
        agentOpenFrom = '';
    } else {
        gotAgentList(obj.Agentlist);
    }
});
// 9.5 ACDGroupMember onWiseACDGroupMember
addEventListener(document, 'onWiseACDGroupMember', function (e) {
    var obj = e.detail;
    if (wiseMonPopup && wiseMonPopup.gotACDMember) {
        wiseMonPopup.gotACDMember(obj);
    }
});
// 10. customer typing
addEventListener(document, 'onWCCustomerInput', function (e) {
    var iframeMain = document.getElementById('social-media-main');
    if (iframeMain) {
        // e.details is just ticket_id
        iframeMain.contentWindow.customerTyping(e.detail);
    }
});
// 11. There is an agent entered the chat
addEventListener(document, 'onAddToChatRoom', function (e) {
    var obj = e.detail;
    var iframeMain = document.getElementById('social-media-main');
    iframeMain.contentWindow.agentAddGroupChat(obj.ticket_id, obj.DestagentID, obj.TypeID);
});
// 12. There is an agent left the chat
addEventListener(document, 'onRmFromChatRoom', function (e) {
    var obj = e.detail;
    var iframeMain = document.getElementById('social-media-main');
    iframeMain.contentWindow.agentleftGroupChat(obj.ticket_id, obj.DestagentID, obj.TypeID);
});
// 13. Additional Info to social media chat
addEventListener(document, 'addAdditionalInfo', function (e) {
    var obj = e.detail;
    var iframeMain = document.getElementById('social-media-main');
    iframeMain.contentWindow.addAdditionalInfo(obj);
});
// 14. add msg deleted
addEventListener(document, 'onWiseReadMsg', function (e) {
    var obj = e.detail;
    var iframeMain = document.getElementById('social-media-main');
    iframeMain.contentWindow.readOrDeletedMsg(obj);
});
// ============================= /SOCIAL MEDIA =========================
// ============================= Live Mon Related =============================
addEventListener(document, 'onMonitorAgentInfo', function (e) {
    var obj = e.detail;
    // obj.time = new Date();
    var status = obj.agentStatus;
    var theAgentId = obj.agentId;
    if (status == 'Logout' && wmAgentObj[theAgentId]) {
        delete wmAgentObj[theAgentId];
    } else {
        wmAgentObj[theAgentId] = obj;
    }
    if (wiseMonPopup && wiseMonPopup.updateAgentInfo) {
        wiseMonPopup.updateAgentInfo();
    }
    if (wiseMonPopup && wiseMonPopup.initAgentStatus) {
        wiseMonPopup.initAgentStatus(); // update agent status immediately instead of waiting for 1 second
    }
    if (wallboardPopup && wallboardPopup.updateAgentInfo) {
        wallboardPopup.updateAgentInfo();
    }
});
addEventListener(document, 'onMonitorACDGroupInfo', function (e) {
    var obj = e.detail;
    // Save the array in case the wiseMonPopup not opened yet, use when popup open
    var acdId = obj.groupId;
    wmACDObj[acdId] = obj;
    // update Queue Tbl
    if (wiseMonPopup && wiseMonPopup.updateQueueTbl) {
        wiseMonPopup.updateQueueTbl(obj);
    }
    if (wallboardPopup && wallboardPopup.updateQueueTbl) {
        wallboardPopup.updateQueueTbl(obj);
    }
});
addEventListener(document, 'onWiseAddACDGroupMember', function (e) {
    if (wiseMonPopup && wiseMonPopup.onAddAcdMember) {
        wiseMonPopup.onAddAcdMember(e.detail);
    }
});
addEventListener(document, 'onWiseDelACDGroupMember', function (e) {
    if (wiseMonPopup && wiseMonPopup.onDelAcdMember) {
        wiseMonPopup.onDelAcdMember(e.detail);
    }
});

addEventListener(document, 'onMonitorIVRSCount', function (e) {
    if (wiseMonPopup && wiseMonPopup.onMonitorIVRSCount) {
        wiseMonPopup.onMonitorIVRSCount(e.detail);
    }
});
// ============================= /Live Mon Related ============================


function callGetLogin() {
    $.ajax({
        type: "POST",
        url: mvcUrl + '/api/GetLogin',
        crossDomain: true,
        contentType: "application/json",
        data: JSON.stringify({
            Agent_Id: loginId,
            Token: token
        }),
        dataType: 'json'
    }).always(function (r) {
        var dbAgentArr = r.details;
        if (!/^success$/i.test(r.result || "")) {
            console.log('error');
            console.log(r);
        } else {
            if (dbAgentArr != undefined) {
                window.agentList = dbAgentArr;
            }
        }
    });
}

var changeConnIdDetails = function (connId, callType, details, campaign) { // call from email.html Email ID become Conn_Id
    // var iframeMain = document.getElementById('traditional-main');
    var iframeMain = document.getElementById('traditional-media-main');
    $(iframeMain).attr('connId', connId);
    $(iframeMain).attr('details', details);
}
// Traditional Tab Click
function traditionalClicked(connId, campaign, channel, details, ivrInfo) {
    var iframeMain = document.getElementById('traditional-media-main');
    $(iframeMain).attr('connId', connId);
    $(iframeMain).attr('callType', channel);
    $(iframeMain).attr('details', details);
    $(iframeMain).attr('campaign', campaign);
    if (ivrInfo != undefined) {
        $(iframeMain).attr('ivrInfo', ivrInfo);
    }
    $('.nav-tabs a[href="#traditional-media"]').tab('show');
    $(iframeMain).attr('src', 'traditionalMedia.html');
}

 
// New Social Medial Click
// 20241031
function SocialMediaClicked() {



    var iframeMain = document.getElementById('social-media-main');
    
    
	$('.nav-tabs a[href="#social-media"]').tab('show');
    $(iframeMain).attr('src', 'socialMediaHandler.html');

 
}



function callSaveCallHistory(connId, callType, campaign, details, ivrInfo) {
    var sendObj = {
        "Conn_Id": connId,
        "Call_Type": callType,
        "Updated_By": loginId,
        "Type_Details": details,
        Agent_Id: loginId,
        Token: token
    }
    if (ivrInfo != null) {
        sendObj['IVR_Info'] = ivrInfo;
    }
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/SaveCallHistory',
        data: JSON.stringify(sendObj),
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
        },
    });
}

// click from phone.html, selected a connection
function connClick(connId, campaign, callType, details, dnisDetails, ivrInfo) {
    if (callType == 'Inbound_Call' || callType == 'Inbound_Voicemail' || callType == 'Inbound_Fax' || callType == 'Inbound_Email') {
        connId = Number(connId);

        // just get the number from the details (becuase wise have alphabet inside details sometimes now)
        if (callType == 'Inbound_Call' || callType == 'Inbound_Voicemail' || callType == 'Inbound_Fax') {
            details = details.replace(/^\D+/g, '');
        }
        traditionalClicked(connId, campaign, callType, details, ivrInfo);

        // for call and social media, incomplete cases show them
        if (callType == 'Inbound_Call') {
            callSaveCallHistory(connId, callType, campaign, details, ivrInfo);
            sessionStorage.setItem('scrmConnId', connId);
        }
    }
}

function callEndClick(endedCallId) {
    $('iframe[connId="' + endedCallId + '"]').contents().find('#media-content')[0].contentWindow.loadCallData();
}

function scheduledReminderClicked() {
    var mainFrame = document.getElementById('scheduled-reminder-main');
    if (mainFrame.contentWindow.loadScheduledReminder) {
        mainFrame.contentWindow.loadScheduledReminder();
    }
}

function schedulerClicked() {
    var mainFrame = document.getElementById('scheduler-main');
    if (mainFrame.contentWindow.drawCurrentTbl) {
        mainFrame.contentWindow.drawCurrentTbl();
    }
}

function systemToolsClicked() {
    var mainFrame = document.getElementById('system-tools-main');
    if (mainFrame.contentWindow.restorePage) {
        mainFrame.contentWindow.restorePage();
    }
}

function outboundClicked() { // TBD
    // because when loaded the page, will draw a table, if the table is not dialying, but drawn, the header will not align correctly
    if ($('#outbound-main').attr('src') != 'outbound.html') {
        $('#outbound-main').attr('src', 'outbound.html');
    }
}

function loadCategories() {
    var indexOfCategory;
    var allCategories = ["Menu", "Traditional-Media", "Social-Media", "Scheduled-Reminder", "System-Tools", "FB-Post", "User-Role", "User-Account", "User-Reset", "Marketing", "Outbound", "Scheduler"];
    var categories = sessionStorage.getItem('scrmCategories') || '';
    var categoryArr = categories.split(',');
    for (let category of allCategories) {
        indexOfCategory = categoryArr.indexOf(category);
        if (indexOfCategory >= 0) {
            var theCategory = categoryArr[indexOfCategory];
            var wordArr = theCategory.split('-');
            var contentId = theCategory.toLowerCase();
            var theSecondWord = wordArr[1];
            var fileName = wordArr[0].toLowerCase() + (theSecondWord != null ? theSecondWord.charAt(0).toUpperCase() + theSecondWord.slice(1) : '');
            var onclickStr = '';
            if (theCategory == 'System-Tools' || theCategory == 'Scheduled-Reminder' || theCategory == 'Scheduler' || theCategory == 'Outbound') {
                onclickStr = ' onclick="' + fileName + 'Clicked();"'
                if (theCategory == 'Scheduled-Reminder') {

                    // every 10 minutes refresh
                    window.setInterval(function () {
                        scheduledReminderClicked();
                    }, 600000);
                } else if (theCategory == 'Scheduler') {
                    window.setInterval(function () {
                        schedulerClicked();
                    }, 5000);
                }
            }
            var alarmStr = (theCategory == 'Scheduled-Reminder' || theCategory == 'Scheduler') ? '<i id="' + contentId + '-alarm" class="fas fa-bell ml-1 text-danger d-none"></i>' : '';
            $('#main-tabs').append('<li class="nav-item"><a id="' + contentId + '-a-tag"class="nav-link pt-2" data-toggle="tab" href="#' + contentId + '" aria-selected="false" ' + onclickStr + '><span class="l-main-' + contentId + '"></span>' + alarmStr + '</li>');
            $('#main-tab-content').append('<div id="' + contentId + '" class="tab-pane position-absolute"><iframe src="./' + fileName + '.html" class="main-content" id="' + contentId + '-main" frameborder="0" width="100%" height="100%"></iframe></div>');
        }
    }
    setLanguage();
}

function openChangePwPopup() {
    var feature = "_blank, menubar=no,toolbar=no,resizable=no,status=no,scrollbars=yes,width=400,height=590,top=200,left=20";
    var changePasswordPopup = window.open("changePasswordPopup.html", "Change Password", feature);
    openWindows[openWindows.length] = changePasswordPopup;
    changePasswordPopup.onload = function () {
        changePasswordPopup.onbeforeunload = function () {
            for (var i = 0; i < openWindows.length; i++) {
                if (openWindows[i] == changePasswordPopup) {
                    openWindows.splice(i, 1);
                    break;
                }
            }
        }
    }
}

function setLanguage() {
    $('.l-main-phone').text(langJson['l-main-phone']);
    $('.l-main-tel').text(langJson['l-main-tel']);
    $('.l-main-make-call').text(langJson['l-main-make-call']);
    $('.l-main-drop-call').text(langJson['l-main-drop-call']);
    $('.l-main-hold-call').text(langJson['l-main-hold-call']);
    $('.l-main-call-agent').text(langJson['l-main-call-agent']);
    $('.l-main-conference-call').text(langJson['l-main-conference-call']);
    $('.l-main-transfer-call').text(langJson['l-main-transfer-call']);
    $('.l-main-close').text(langJson['l-main-close']);
    $('.l-main-name').text(langJson['l-main-name']);
    $('.l-main-role').text(langJson['l-main-role']);
    $('.l-main-change-password').text(langJson['l-main-change-password']);
    $('.l-main-logout').text(langJson['l-main-logout']);
    $('.l-main-menu').text(langJson['l-main-menu']);
    $('.l-main-traditional-media').text(langJson['l-main-traditional-media']);
    $('.l-main-social-media').text(langJson['l-main-social-media']);
    $('.l-main-scheduled-reminder').text(langJson['l-main-scheduled-reminder']);
    $('.l-main-system-tools').text(langJson['l-main-system-tools']);
    $('.l-main-fb-post').text(langJson['l-main-fb-post']);
    $('.l-main-user-role').text(langJson['l-main-user-role']);
    $('.l-main-user-account').text(langJson['l-main-user-account']);
    $('.l-main-user-reset').text(langJson['l-main-user-reset']);
    $('.l-main-marketing').text(langJson['l-main-marketing']);
    $('.l-main-outbound').text(langJson['l-main-outbound']);
    $('.l-main-scheduler').text(langJson['l-main-scheduler']);
    $('.l-account-seller-id').text(langJson['l-account-seller-id']);
    $('.l-user-status-LOGOUT').text(langJson['l-user-status-LOGOUT']);
    $('[data-toggle=confirmation]').confirmation({
        rootSelector: '[data-toggle=confirmation]',
        popout: true,
        title: langJson['l-general-are-you-sure'],
        btnOkLabel: langJson['l-general-ok-label'],
        btnCancelLabel: langJson['l-general-cancel-label']
    });
    $('.l-main-ready-idle').attr('title', langJson['l-main-ready-idle']);
    mainOnload();
}

function loadCampaignLang() {
    var language = (localStorage.getItem('scrmLanguage') || sessionStorage.getItem('scrmLanguage') || 'EN') + ' Language';
    var campaignListName = config.campaignListName || 'Campaign List';
    $.ajax({
        type: "POST",
        url: mvcUrl + '/api/GetFields',
        data: JSON.stringify({
            "listArr": [language, campaignListName],
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
                // ============ Set Campaign List ============
                sessionStorage.setItem('scrmCampaignList', JSON.stringify(rDetails[campaignListName] || []));
                var langArr = rDetails[language];
                for (let lang of langArr) {
                    langJson[lang.Field_Name] = lang.Field_Display;
                }
                sessionStorage.setItem('scrmLangJson', JSON.stringify(langJson));
                loadCategories();
            }
        }
    });
}

function clickedWiseMon(callback) {
    event.preventDefault(); // prevent function run once more time
    var ppc = document.getElementById("phone-panel").contentWindow;
    ppc.wiseOpenMonitor();
    var params = [
        'height=' + screen.height,
        'width=' + screen.width,
        'fullscreen=yes' // only works in IE, but here for completeness
    ].join(',');
    wiseMonPopup = window.open('./wiseMon.html', 'wiseMon', params);
    wiseMonPopup.onload = function () {
        wiseMonPopup.onbeforeunload = function () {

            // remove popup from openWindows array
            for (var i = 0; i < openWindows.length; i++) {
                if (openWindows[i] == wiseMonPopup) {
                    openWindows.splice(i, 1);
                    break;
                }
            }

            // to change the the userMode back to normal if was monitor someone
            if (ppc.userMode == 'MONITOR') {
                ppc.WiseEndMonitorCall();
            }

            wiseMonPopup = null;

            // if both wisemon and wallboard closed
            if (wallboardPopup == null) {
                wmAgentObj = {};
                wmACDObj = {};
                ppc.wsWiseMonitor.CloseWebsocket();
            }
        };
    }

    if (wiseMonPopup) {
        openWindows[openWindows.length] = wiseMonPopup;
        wiseMonPopup.moveTo(0, 0);
    } else {
        alert('Please allow browser pop up Live Mon');
    }
}

function clickedWallboard() {
    event.preventDefault(); // prevent function run once more time
    var ppc = document.getElementById("phone-panel").contentWindow;
    ppc.wiseOpenMonitor();
    var params = [
        'height=' + screen.height,
        'width=' + screen.width,
        'fullscreen=yes' // only works in IE, but here for completeness
    ].join(',');
    wallboardPopup = window.open('./wallboard.html', 'wallboard', params);
    wallboardPopup.onload = function () {
        wallboardPopup.onbeforeunload = function () {

            // remove popup from openWindows array
            for (var i = 0; i < openWindows.length; i++) {
                if (openWindows[i] == wallboardPopup) {
                    openWindows.splice(i, 1);
                    break;
                }
            }
            wallboardPopup = null;

            // if both wisemon and wallboard closed
            if (wiseMonPopup == null) {
                wmAgentObj = {};
                wmACDObj = {};
                ppc.wsWiseMonitor.CloseWebsocket();
            }
        };
    }

    if (wallboardPopup) {
        openWindows[openWindows.length] = wallboardPopup;
        wallboardPopup.moveTo(0, 0);
    } else {
        alert('Please allow browser pop up Live Mon');
    }
}

// this run after getting language
function mainOnload() {
    var phonePanel = $('#phone-panel');
    if (customCompany != 'no') {
        // The logo on left of queue
        var campaignLogo = restorable == 'true' ? 'DEMO' : customCompany;
        var logoSrc = restorable == 'true' ? '.\\images\\ets_logo.png' : './campaign/' + campaignLogo + '/logo.png';
        $('<div class="text-center my-auto pt-1" style="width: auto;margin-left:25px; margin-right:10px;"><img class="align-middle user-select-none" src="' + logoSrc + '" style="max-width: 200px;max-height:80px;"></div>').insertBefore('#phone-panel');
        phonePanel.css('width', 'calc(100% - 300px)');
    } else {
        phonePanel.css('width', '100%');
        $('#phone-panel-header').removeClass('row');
    }

    $('#navbarSupportedContent .dropdown .dropdown-item .btn-info').on({
        "click": function (e) {
            e.stopPropagation();
        }
    })

    // profile Header Set Icon
    var roleName = sessionStorage.getItem('scrmRoleName') || '';
    var sellerId = sessionStorage.getItem('scrmSellerID') || '';
    $('#dropdown-login-id').text(sellerId);
    $('#dropdown-agent-name').text(agentName);
    $('#dropdown-role-name').text(roleName);

    callGetLogin();

    // ============== add voice log if needed ==============
    if (functions.indexOf('Voice-Log') != -1) {
        $('#agent-info-dropdown').before('<div id="call-log-container" class="bg-light btn py-0 px-1" title="Voice Log"><span class="text-info"><i class="fas fa-phone-square mr-1"></i><span style="line-height: 14px;">VL</span></span></div>');
        $('#call-log-container').on('click', function (e) {
            e.preventDefault(); // prevent function run once more time
            var params = [
                'height=' + screen.height,
                'width=' + screen.width,
                'fullscreen=yes' // only works in IE, but here for completeness
            ].join(',');
            var vlPopup = window.open('./voiceLog.html', 'voiceLog', params);
            vlPopup.onload = function () {
                vlPopup.onbeforeunload = function () {
                    // remove popup from openWindows array
                    for (var i = 0; i < openWindows.length; i++) {
                        if (openWindows[i] == vlPopup) {
                            openWindows.splice(i, 1);
                            break;
                        }
                    }
                    vlPopup = null;
                    var ppc = document.getElementById("phone-panel").contentWindow;
                    // To change the the userMode back to normal if was monitor someone
                    if (ppc.userMode == 'MONITOR') {
                        document.getElementById("phone-panel").contentWindow.WiseEndMonitorCall();
                    }
                };
            }

            if (vlPopup) {
                openWindows[openWindows.length] = vlPopup;
                vlPopup.moveTo(0, 0);
            } else {
                alert('Please allow browser pop up Voice Log');
            }
        })
    }

    // ============== show default page if set ==============
    var defaultTabAfterLogin = config.defaultTabAfterLogin || '';
    if (defaultTabAfterLogin.length > 0) {
        if (defaultTabAfterLogin.startsWith('menu')) { defaultTabAfterLogin = 'menu' }
        $('#' + defaultTabAfterLogin + '-a-tag').click();
    }
}

// when double login 127 command will receive again, so the function below could run multiple times
function addWiseMonBtn() {
    if (functions.indexOf('Wise-Mon') != -1 && $('#wise-mon-icon').length == 0) {
        $('#agent-info-dropdown').before('<div id="wise-mon-icon" class="nav-item wise-mon-icon" onclick="return clickedWiseMon();"><span class="nav-link text-light far fa-eye cursor-pointer pr-0" title="Live Mon"></span></div>');
    }
    if (functions.indexOf('Wallboard') != -1 && $('#wallboard-icon').length == 0) {
        $('#agent-info-dropdown').before('<div id="wallboard-icon" class="nav-item wise-mon-icon" onclick="return clickedWallboard();"><span class="nav-link text-light fas fa-chalkboard-teacher pr-0" title="Wallboard"></span></div>');
    }
}

// when called WiseGetAgentList return agent list, insert into agent list dropdown table
function gotAgentList(agentArr, tryCount) {

    var agentArrDivs = '';

    if (agentList.length > 0) {
        agentArr = agentArr.filter(function (obj1) {
            return agentList.some(function (obj2) {
                return obj2.AgentID == obj1.AgentID
            })
        })
    } else {

        // if agentList not loaded yet, call later
        if (typeof tryCount == 'undefined') {
            tryCount = 0;
        }
        tryCount += 1;
        if (tryCount < 3) {
            setTimeout(function (p) {
                gotAgentList(p.agentArr, p.tryCount)
            }.bind(this, {
                agentArr: agentArr,
                tryCount: tryCount
            }), 1000);
        }
        return;
    }
    var shortMsgStr = langJson['l-sm-short-msg'];
    var noShortMsgFn = functions.indexOf('Short-Msg-Fn') == -1;
    for (let theAgent of agentArr) {
        var theAgentId = theAgent.AgentID;
        var agentStatus = theAgent.Status;
        var isSelf = loginId == theAgentId;
        var stickerStr = isSelf || noShortMsgFn ? '<span class"d-table-cell"></span>' : '<i class="far fa-sticky-note pr-2 cursor-pointer d-table-cell" title="' + shortMsgStr + '"></i>';
        if (agentStatus != 'LOGOUT') {
            if (agentStatus != 'IDLE' || isSelf) { // cannot dial to the agent themselves
                agentArrDivs += ('<span class="d-table-row" agentid=' + theAgentId + '><span class="d-table-cell dropdown-cell">' + theAgent.AgentName + '</span><span class="d-table-cell px-1">(ID: ' + theAgentId + ')</span><span class="d-table-cell dropdown-cell">' + theAgent.Status + '</span>' + stickerStr + '<i class="fas fa-info-circle mr-2 d-table-cell pr-2" title="Only counter party in IDLE mode can double click to call"></i></span>');
            } else {
                agentArrDivs += ('<a class="d-table-row dropdown-item" href="javascript:void(0);" agentid=' + theAgentId + '><span class="d-table-cell dropdown-cell">' + theAgent.AgentName + '</span><span class="d-table-cell px-1">(ID: ' + theAgentId + ')</span><span class="d-table-cell dropdown-cell">' + theAgent.Status + '</span>' + stickerStr + '<span class="d-table-cell"></span></a>');
            }
        }
    }

    $('#phone-submenu').append(agentArrDivs);

    $('.fa-sticky-note').on('click', function () {
        var idTd = $(this).prev().prev()
        var agentNameStr = idTd.prev().text() + ' ' + idTd.text();
        var toAgentId = idTd.parent().attr('agentid');
        var msg = prompt(langJson['l-sm-enter'] + agentNameStr + langJson['l-sm-max-500']);
        if (msg != null) {
            document.getElementById("phone-panel").contentWindow.wiseSendMessage_UC(3, toAgentId, msg.slice(0, 500));
        }

        // to close the menu
        $('#agent-list-dropdown-container').dropdown('toggle')
    })

    // not include close row, avoid single click close the menu
    $('#phone-submenu a:not("#phone-dropdown-close")').on('click', function (e) {
        e.stopPropagation();
    })

    // double click call the agent
    $('#phone-submenu a').on('dblclick', function (e) {
        var callAgentId = $(this).attr('agentid');
        $('#phone-panel-no').val(callAgentId);
        phoneClicked('agent');

        // close dropdown
        var $subMenu = $('#agent-list-dropdown').next(".dropdown-menu");
        $subMenu.toggleClass('show');
    })
}
// theDocument is the parent of iframe, will check any iframes in it and include it/them
function iframeRecheck(theDocument) {
    $.fn.idleTimeout().iframeRecheck(theDocument);
}
// if have popup need to add them have idle also
function addPopupIdle(theDocument) {
    $.fn.idleTimeout().addPopupIdle(theDocument);
}

// $(document).ready(function () {
loadCampaignLang();
var idleTimeLimit = functions.indexOf('Wallboard') != -1 ? 39570 : (functions.indexOf('Wise-Mon') != -1 ? 10770 : 570); // 570+30=10mins 39570+30=11hr 10770+30=3hr

// deprecated, if needed can add back the functions
// if (functions.indexOf('No-Phone-On-Top') === -1) { $('#direct-call-container').removeClass('d-none'); $('#phone-dropdown').removeClass('d-none'); }
$(document).idleTimeout({
    redirectUrl: '#', // redirect to this url
    idleTimeLimit: idleTimeLimit, // in seconds.
    activityEvents: 'click keypress mousemove', // mousemove',    // separate each event with a space
    dialogDisplayLimit: 30, // Time to display the warning dialog before logout (and optional callback) in seconds
    customCallback: function () {
        logoutClicked();
    },
    sessionKeepAliveTimer: false // Set to false to disable pings.
});

// when dropdown menu shows, have this event
$('#agent-list-dropdown-container').on('show.bs.dropdown', function (e) {
    if (typeof document.getElementById("phone-panel").contentWindow.WiseGetAgentListEx == 'function') {
        $('#phone-submenu').empty();
        document.getElementById("phone-panel").contentWindow.WiseGetAgentListEx();
    }
})

$('#phone-dropdown-close').on('click', function () {
    var $subMenu = $('#agent-list-dropdown').next(".dropdown-menu");
    $subMenu.toggleClass('show');
})

$('#phone-panel-no').on('keypress', function (e) {
    if (e.keyCode == 13) {
        e.preventDefault();
        phoneClicked('make');
        return false;
    }
})
if (config.isLdap == undefined || !config.isLdap) {
    $('<a class="dropdown-item" href="#" onclick="openChangePwPopup();return false;"><i class="fas fa-key mr-2"></i><span class="l-main-change-password"></span></a>')
        .insertAfter('#role-field-container')
}

if (functions.indexOf('KB') != -1) {
    $('#agent-info-dropdown').after('<div id="kb-btn" class="nav-item cursor-pointer" title="Knowledge Base" style="font-size: 25px;"> <span class="nav-link text-light fas fa-database"></span> </div>');
    $('#kb-btn').on('click', function (e) {
        e.preventDefault(); // prevent function run once more time
        var feature = 'scrollbars=yes,fullscreen=no,location=no,toolbar=no,status=yes,menubar=no,resizable=yes,width=950,height=650,top=15,left=15';
        var adminStr = functions.indexOf('KB-Admin-Fn') == -1 ? '' : '&Admin=true';

        // TechsoftCMNetV3_Man is the name originally KB used, to prevent open multiple KBs, if change here need to change KB file also

        var kbPopup = window.open('../KB/Terminal/Default.aspx?ID=' + loginId + '&Company=KB_' + customCompany + adminStr, 'TechsoftCMNetV3_Man', feature);

        kbPopup.onload = function () {
            kbPopup.onbeforeunload = function () {
                // remove popup from openWindows array
                for (var i = 0; i < openWindows.length; i++) {
                    if (openWindows[i] == kbPopup) {
                        openWindows.splice(i, 1);
                        break;
                    }
                }
                kbPopup = null;
            };
        }

        if (kbPopup) {
            openWindows[openWindows.length] = kbPopup;
            kbPopup.moveTo(0, 0);
        } else {
            alert('Please allow browser pop up Knowledge Base');
        }
    })
}

// iXServer will send outanding ticket to us when cs number increased from 0 to 1, if the ticket accepted before this, will have queue again or msg content appened
setTimeout(function () {
    $('#phone-panel').removeClass('opacity-0')
}, 5000);

// Prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());