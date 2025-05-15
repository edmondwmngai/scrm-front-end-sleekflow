var campaign = window.frameElement.getAttribute("campaign") || '';
var customCompany = sessionStorage.getItem('scrmCustomCompany') || 'no';
var inboundDetails = window.frameElement.getAttribute("details") || '';
var language = 'en';
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var tabIndex = $(parent.window.frameElement).attr('tab-index');
var categories = sessionStorage.getItem('scrmCategories') || '';
//var haveSystemTools = categories.indexOf('System-Tools') != -1 ? true : false;    //20250320 Unnecessary use of boolean literals in conditional expression.
var haveSystemTools = categories.indexOf('System-Tools') != -1;
var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';
var tabType = 'traditional-media'; // for callContent.html inbound call not loading call voice immediately

function getWindowAttribute(attributeName) {
    return window.frameElement.getAttribute(attributeName);
}

function resizeEmail(isFull, newHeight) {
    if (isFull) {
        document.getElementById("media-content").height = newHeight + 'px';
    } else {
        document.getElementById("media-content").height = '303px'; // '37%';
    }
}

function resize(frameHeight) {
    var newHeight;
    if (frameHeight) {
        if (frameHeight != null) {
            newHeight = frameHeight
        }
    } else {
        var body = document.body,
            html = document.documentElement;
        newHeight = Math.ceil(Math.max(body.scrollHeight, body.offsetHeight, html.offsetHeight)) || 500;
    }
}

function scrollInputForm() {
    alert('scroll now');
    document.getElementById('input-form').contentWindow.scrollTo(0, 0);
}

function setLanguage() {
    $('.l-traditional-junk-mail').text(langJson['l-traditional-junk-mail']);
    $('.l-traditional-repeated-sender').text(langJson['l-traditional-repeated-sender']);
    $('.l-traditional-difficult-sender').text(langJson['l-traditional-difficult-sender']);
    $('.l-traditional-repeated-caller').text(langJson['l-traditional-repeated-caller']);
    $('.l-traditional-difficult-caller').text(langJson['l-traditional-difficult-caller']);
}

function getEmailSetting(emailAddress) {
    if (haveSystemTools) {
        var difficultCustomerHeader = $('#difficult-customer-header');
        var repeatedCustomerHeader = $('#repeated-customer-header');
        if (difficultCustomerHeader != undefined) {
            difficultCustomerHeader.hide();
            repeatedCustomerHeader.hide();
            $.ajax({
                type: "POST",
                url: config.wiseUrl + '/api/Email/GetSetting',
                data: JSON.stringify({
                    projectName: campaign,
                    emailAddress: emailAddress
                }),
                crossDomain: true,
                contentType: "application/json",
                dataType: 'json'
            }).always(function (r) {
                if (!/^success$/i.test(r.result || "")) {
                    console.log('error: ' + r.details || r);
                } else {
                    var emailSettingArr = r.data;
                    if (emailSettingArr.length > 0) {

                        // email will not be repeated, for same EmailType, so no need to add '\n' @ title
                        for (let theSetting of emailSettingArr) {
                            var theTitle = 'Title: ' + theSetting.Title + ', ' + 'Full Name: ' + theSetting.FullName + ', Remarks: ' + theSetting.Remarks
                            if (theSetting.EmailType == 'Difficult Customer') {
                                difficultCustomerHeader.prop('title', theTitle);
                                difficultCustomerHeader.show();
                            } else if (theSetting.EmailType == 'Repeated Customer') {
                                repeatedCustomerHeader.prop('title', theTitle);
                                repeatedCustomerHeader.show();
                            }
                        }
                    }
                }
            });
        }
    }
}

function bindEvent(element, eventName, eventHandler) {
    if (element.addEventListener) {
        element.addEventListener(eventName, eventHandler, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler);
    }
}

function getCallerSetting(tel) {
    if (haveSystemTools) {
        var difficultCallerHeader = $('#difficult-caller-header');
        var repeatedCallerHeader = $('#repeated-caller-header');
        if (difficultCallerHeader != undefined) {
            difficultCallerHeader.hide();
            repeatedCallerHeader.hide();
            $.ajax({
                type: "POST",
                url: config.companyUrl + '/api/GetCallFilter',
                data: JSON.stringify({
                    "All_Phone_No": tel,
                    Agent_Id: loginId,
                    Token: token
                }),
                crossDomain: true,
                contentType: "application/json",
                dataType: 'json'
            }).always(function (r) {
                if (!/^success$/i.test(r.result || "")) {
                    console.log('error: ' + r.details || r);
                } else {
                    var telSettingArr = r.details || [];
                    var repeatedTitle = '';
                    var specialTitle = '';
                    if (telSettingArr.length > 0) {

                        // As for phone can have more than 1 record now... so need to show all records in title, and finish the loop
                        for (let theSetting of telSettingArr) {
                            if (theSetting.Filter_Type == 'Difficult Caller') {
                                repeatedTitle += 'Title: ' + theSetting.Title + ', ' + 'Full Name: ' + theSetting.Last_Name + ', Mobile: ' + theSetting.Mobile_No + ', Other: ' + theSetting.Other_Phone_No + ', Remarks: ' + theSetting.Remark + '\n';
                                difficultCallerHeader.prop('title', repeatedTitle);
                                difficultCallerHeader.show();
                            } else if (theSetting.Filter_Type == 'Repeated Caller') {
                                specialTitle += 'Title: ' + theSetting.Title + ', ' + 'Full Name: ' + theSetting.Last_Name + ', Mobile: ' + theSetting.Mobile_No + ', Other: ' + theSetting.Other_Phone_No + ', Remarks: ' + theSetting.Remark + '\n';
                                repeatedCallerHeader.prop('title', specialTitle);
                                repeatedCallerHeader.show();
                            }
                        }
                    }
                }
            });
        }
    }
}

function windowOnload() {
    setLanguage();
    var iframeSearch = document.getElementById('search');
    var channel = window.frameElement.getAttribute("callType");
    var traditionalHeader = document.getElementById('traditional-header');
    var companyPic = document.getElementById('traditional-company-pic');
    var openedByMenu = window.frameElement.getAttribute('openMenu');
    // ================== Inbound_Call Get CallerSetting and OpenMedia ==================
    if (channel == 'Inbound_Call') {
        // only inbound call will have valid connId, otherwise 0 only
        var winConnId = window.frameElement.getAttribute("connId") || 0;
        openMedia('call', winConnId, null, null, inboundDetails);
        getCallerSetting(inboundDetails);
    }
    // ================== Set Company Logo ==================
    if (customCompany == 'no') {
        companyPic.src = './campaign/' + campaign + '/logo.png';
    } else {
        companyPic.style.display = 'inline-table';
    }
    // ================== Set Channel Pic ==================
    var channelPic = $('#traditional-call-type-pic');
    if (channelPic.children().length == 0) {
        if (channel == 'Inbound_Email') {
            channelPic.append('<img class="float-end me-3 mt-1" style="width:48px;border-radius:3px;background: linear-gradient(60deg,#FFC83D,#fb8c00);box-shadow:3px 3px 4px 0 rgba(0,0,0,.36);" src="./Wise/img/email-icon-512-2.png">');
        } else if (channel == 'Inbound_Fax') {
            channelPic.append('<img class="float-end me-3 mt-1" style="width:48px;border-radius:3px;background:linear-gradient(60deg,#6AD1D8,#00acc1);box-shadow:3px 3px 4px 0 rgba(0,0,0,.36);" src="./Wise/img/fax-icon-512-2.png">');
        } else if (channel == 'Inbound_Voicemail') {
            channelPic.append('<img class="float-end me-3 mt-1" style="width:48px;border-radius:3px;background: linear-gradient(60deg,#86B784,#43a047);box-shadow:3px 3px 4px 0 rgba(0,0,0,.36);" src="./Wise/img/vmail-icon-512-2.png">');
        } else if (channel == 'Inbound_Call') {
            // ================== Call Icon will have Pop-over if have IVR ==================
            var ivrStr = (window.frameElement.getAttribute('ivrInfo') || '').toString() || '';
            if (ivrStr.length > 0) {
                channelPic.append('<img class="float-end me-3 mt-1" style="width:48px;border-radius:3px;background: linear-gradient(60deg,#EF7C50,#e53935);box-shadow:3px 3px 4px 0 rgba(0,0,0,.36);cursor:pointer;" src="./Wise/img/call-icon-512-2.png" title="IVR Info" data-bs-content="' + ivrStr + '" data-bs-toggle="popover" data-bs-placement="left">');
                $('img[data-bs-toggle="popover"]').popover();
                setTimeout(function () {
                    $('img[data-bs-toggle="popover"]').click();
                }, 400);
            } else {
                channelPic.append('<img class="float-end me-3 mt-1" style="width:48px;border-radius:3px;background: linear-gradient(60deg,#EF7C50,#e53935);box-shadow:3px 3px 4px 0 rgba(0,0,0,.36);" src="./Wise/img/call-icon-512-2.png">');
            }
        }
    }
    // show content
    if (openedByMenu == undefined) {
        if (channel == 'Inbound_Email') {
            iframeSearch.src = './email.html'
        } else if (channel == 'Inbound_Voicemail') {
            iframeSearch.src = './vmail.html'
        } else if (channel == 'Inbound_Fax') {
            iframeSearch.src = './fax.html'
        } else if (channel == 'Inbound_Call') {
            iframeSearch.src = './search.html';
        }
    }
    $('#search').removeClass('jit-inspected');
    traditionalHeader.style.display = 'inline-table';
    if (parent.iframeRecheck) {
        parent.iframeRecheck($(parent.document));
    }
}
// save Intenrnal Case No to call_history table
function callSaveCallHistory(connId, callType, internalCaseNo) {
    var ivrInfo = window.frameElement.getAttribute('ivrInfo') || '';

    var dataObj = {
        "Conn_Id": Number(connId),
        "Call_Type": callType,
        "Updated_By": loginId,
        "Internal_Case_No": internalCaseNo,
        Agent_Id: loginId,
        Token: token
    }
    if (ivrInfo.length > 0) {
        dataObj['IVR_Info'] = ivrInfo;
    }
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/SaveCallHistory',
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
        },
    });
}
// Open Input Form, call from search.html
function openInputForm(connId, callType, internalCaseNo) {
    $('#search').hide();
    var iframeInputForm = $('#input-form');
    iframeInputForm.attr('src', './campaign/' + campaign + '/inputForm.html');
    iframeInputForm.removeClass('jit-inspected');
    iframeInputForm.show();
    if (callType == 'Inbound_Call') {
        callSaveCallHistory(connId, callType, internalCaseNo);
    }
}

function returnToSearch() {
    var theInputForm = $('#input-form');
    theInputForm.attr('src', '');
    theInputForm.hide();
    $('#search').show();
}

function removeEmailList(connId, channel, details) {
    var iframeSearch = document.getElementById('search');
    iframeSearch.src = './search.html';
    $('#search').removeClass('jit-inspected');
}
// open email or fax or vmail's content
function openMedia(omType, omMediaId, omMediaPath, omTimestamp, omCallerDisplay, omName, omSubject) {
    console.log("omType, omMediaId, omMediaPath, omTimestamp, omCallerDisplay, omName, omSubject");
    console.log(omType, omMediaId, omMediaPath, omTimestamp, omCallerDisplay, omName, omSubject);
    var mediaContentFrame = document.getElementById('media-content');
    mediaContentFrame.setAttribute('mediaId', omMediaId);
    if (omTimestamp != null) {
        mediaContentFrame.setAttribute('timestamp', omTimestamp);
    }
    if (omCallerDisplay != null) {
        mediaContentFrame.setAttribute('callerDisplay', omCallerDisplay);
    }
    if (omType != 'email') {
        mediaContentFrame.setAttribute('mediaPath', omMediaPath);
    }
    if (omType == 'fax') {
        mediaContentFrame.src = './faxContent.html';
    } else if (omType == 'vmail') {
        mediaContentFrame.setAttribute('subject', omSubject);
        mediaContentFrame.src = './vmailContent.html';
    } else if (omType == 'email') {
        mediaContentFrame.setAttribute('name', omName);
        mediaContentFrame.setAttribute('time', omTimestamp);
        mediaContentFrame.src = './emailContent.html';
    } else if (omType == 'call') {
        mediaContentFrame.src = './callContent.html';
    }
    $('#media-content').removeClass('jit-inspected');
}

function replyCallClick(lastCallType, lastCallID, confConnID) {
    var iframeInputForm = document.getElementById('input-form');
    iframeInputForm.contentWindow.replyCallClick(lastCallType, lastCallID, confConnID);
}

// got event from wise
function gotMsgHistory(msgObj) {
    var inputFormFrame = document.getElementById('input-form');
    var casePopup = inputFormFrame.contentWindow.caseRecordPopup;
    casePopup.window.generateSocialHistory(msgObj);
}

// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());