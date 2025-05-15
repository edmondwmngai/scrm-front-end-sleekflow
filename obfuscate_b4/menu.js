var lowerContent = '';
var contactTable = [];
var contactCombined = [];
var contactSystem = [];
var caseTable = [];
var caseSystem = [];
var tabType = 'menu';
var customCompany = sessionStorage.getItem('scrmCustomCompany') || 'no';
var functions = sessionStorage.getItem('scrmFunctions') || '';
var categories = sessionStorage.getItem('scrmCategories') || '';
var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';
var smDetailsArr = []; // Get when got social media history, used for open search and inputform  
window.escalationListArr = [];
window.incompleteCasesArr = [];
var levelId = parseInt(sessionStorage.getItem('scrmLevelID')) || 0; // 0: normal user, 1: supervisor
window.mediaContent = {}; // needed by input form reply by email

// to prevent openInputForm loaded previous record or new ticket history not yet get
var currentTicket = -1;
function replyCallClick(lastCallType, lastCallID, confConnID) {
    var iframeInputForm = document.getElementById('input-form');
    iframeInputForm.contentWindow.replyCallClick(lastCallType, lastCallID, confConnID);
}

//20250320 Unexpected constant truthiness on the left-hand side of a `||` expression.
//var recordPerPage = sessionStorage.getItem('scrmCaseLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5 || 5;
var recordPerPage = sessionStorage.getItem('scrmCaseLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5;

var campaign = ''; // = window.frameElement.getAttribute("campaign") || '';
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var caseMode = false;
var caseCoArr = config.caseCoArr;
if (customCompany != 'no') {
    for (let caseCo of caseCoArr) {
        if (customCompany == caseCo) {
            caseMode = true;
        }
    }
}
// save Intenrnal Case No to call_history table
function callSaveCallHistory(connId, callType, internalCaseNo) {
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/SaveCallHistory',
        data: JSON.stringify({
            "Conn_Id": Number(connId),
            "Call_Type": callType,
            "Updated_By": loginId,
            "Internal_Case_No": internalCaseNo,
            Agent_Id: loginId,
            Token: token
        }),
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
// Open Input Form, call from search.html or searchCustomer.html
function openInputForm(connId, callType, internalCaseNo) {
    showLowerFrame('inputForm');
}

function updateCase(rowData, callType, connId, details) { // call from escalation list etc. // callType, connId, details provided by Incomplete Cases
    var frameCallType = callType || rowData.Call_Type;
    var frameConnId = connId || rowData.Conn_Id;
    var frameDetails = details || rowData.Type_Details;
    window.frameElement.setAttribute('callType', frameCallType);
    window.frameElement.setAttribute('connId', frameConnId);
    window.frameElement.setAttribute('details', frameDetails);
    window.frameElement.setAttribute('isThirdFrmae', true); // Notes: in input form if call main.html, will be parent.parent.parent when call from menu 
    window.customerData = rowData;
    var inputForm = document.getElementById('input-form');

    if (rowData) {
        inputForm.setAttribute('internalCaseNo', rowData.Internal_Case_No);
        inputForm.setAttribute('caseNo', rowData.Case_No);
        inputForm.setAttribute('crn', rowData.CRN);
        inputForm.setAttribute('customerId', rowData.Customer_Id);
    }

    window.type = 'newUpdate';
    showLowerFrame('inputForm');
}

function showSearch(rowData, webchatFields) { // call from incomplete cases etc.
    var searchFrame = $('#search');
    window.frameElement.setAttribute('callType', rowData.Call_Type);
    window.frameElement.setAttribute('details', rowData.Type_Details);
    window.frameElement.setAttribute('connId', rowData.Conn_Id);
    window.customerData = rowData;
    window.type = 'newUpdate';

    // if openCaseNo not set, set empty string to refresh the frame.
    var openCaseNo = '';
    if (webchatFields) {
        searchFrame.attr('webchatFields', webchatFields);

        // to prevent openInputForm loaded previous record or new ticket history not yet get
        if (rowData.Conn_Id == currentTicket) {
            var details = '';
            if (smDetailsArr.length > 0) {
                for (var i = 0; i < smDetailsArr.length; i++) {
                    if (i != 0) {
                        details += ','
                    }
                    var smDetailsObj = smDetailsArr[i];
                    var smNotEscapedFieldName = smDetailsObj.field_name;
                    var smNotEscapedFieldValue = smDetailsObj.field_value;
                    var fieldName = smNotEscapedFieldName ? escape(smNotEscapedFieldName) : "";
                    var fieldValue = smNotEscapedFieldValue ? escape(smNotEscapedFieldValue) : "";
                    details += (fieldName + ':' + fieldValue);
                    if (smNotEscapedFieldName == 'CTC Info') {

                        // to slice need to make it to be a string first
                        openCaseNo = String(smNotEscapedFieldValue).slice(8);
                    }
                }
            }
            rowData.Type_Details = details;
        } else {
            alert('Webchat content not yet got, please click again');
            return;
        }
    } else {
        searchFrame.removeAttr('webchatFields');
    }
    window.frameElement.setAttribute('details', rowData.Type_Details);

    // added for Incomplete Cases's Outbound Call
    //if (rowData.Reply_Conn_Id != null && rowData.Reply_Conn_Id != null) {     //  
    if (rowData.Reply_Conn_Id != null) {       // 20250321 Correct one of the identical sub-expressions on both sides of operator "&&"
        window.frameElement.setAttribute('replyConnId', rowData.Reply_Conn_Id);
        window.frameElement.setAttribute('replyDetails', rowData.Reply_Details);
        openCaseNo = rowData.Internal_Case_No || '';
    } else {
        window.frameElement.setAttribute('replyConnId', '');
        window.frameElement.setAttribute('replyDetails', '');
    }


    searchFrame.attr('openCaseNo', openCaseNo);
    showLowerFrame('search');
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
    } else if (channel == 'Inbound_Webchat' || channel == 'Inbound_Wechat' || channel == 'Inbound_Facebook' || channel == 'Inbound_Whatsapp') {
        return 'Social';
    } else {
        return '';
    }
}

function titleClicked(destinateLowerFrame) {
    // remove media content if available
    var mediaContentFrame = document.getElementById('media-content');
    mediaContentFrame.src = '';
    mediaContentFrame.style = 'display:none;margin-top:0';
    if (destinateLowerFrame == 'searchCustomer' || destinateLowerFrame == 'searchCase' || destinateLowerFrame == 'searchWhatsapp' || destinateLowerFrame == 'adminTransfer' || destinateLowerFrame == 'dashboard') {
        // if (lowerContent == destinateLowerFrame || destinateLowerFrame == 'searchCustomer' || destinateLowerFrame == 'searchCase' || destinateLowerFrame == 'adminTransfer') {
        showLowerFrame(destinateLowerFrame);
        loadTitleBarData(); // reload  data and then show the destinateLowerFrame
    } else { // reload title number
        lowerContent = destinateLowerFrame;
        loadTitleBarData(); // reload  data and then show the destinateLowerFrame
    }
}

function showLowerFrame(destinateLowerFrame) { // 1. escalationList 2. incompleteCases 3. inputForm 4. search
    lowerContent = destinateLowerFrame;
    var searchFrame = $('#search');
    var formFrame = $('#input-form');
    if (destinateLowerFrame != 'inputForm') {
        if (destinateLowerFrame == 'escalationList') {
            searchFrame.attr('src', './menu/escalationList.html');
        } else if (destinateLowerFrame == 'incompleteCases') {
            searchFrame.attr('src', './menu/incompleteCases.html');
        } else if (destinateLowerFrame == 'search') {
            searchFrame.attr('src', './search.html');
        } else if (destinateLowerFrame == 'searchCustomer') {
            searchFrame.attr('src', './menu/searchCustomer.html');
        } else if (destinateLowerFrame == 'searchCase') {
            searchFrame.attr('src', './menu/searchCase.html');
        } else if (destinateLowerFrame == 'searchVoice') {
            searchFrame.attr('src', './menu/searchVoice.html');
        } else if (destinateLowerFrame == 'adminTransfer') {
            searchFrame.attr('src', './menu/adminTransfer.html');
        } else if (destinateLowerFrame == 'dashboard') {
            searchFrame.attr('src', './menu/dashboard.html');
        } else if (destinateLowerFrame == 'searchWhatsapp') {
            searchFrame.attr('src', './menu/searchWhatsapp.html');

            // resize search frame
            searchFrame.css('height', 'calc(100vh - 41px)');
        } else {
            searchFrame.attr('src', '');
        }
        formFrame.hide();
        searchFrame.show();
        searchFrame.removeClass('jit-inspected')
    } else {
        searchFrame.hide();
        formFrame.attr('src', './campaign/' + campaign + '/inputForm.html');
        formFrame.show();
        formFrame.removeClass('jit-inspected');
    }
}
// open email or fax or vmail's content
function openMedia(type, mediaId, mediaPath, timestamp, callerDisplay, name) {
    var mediaContentFrame = document.getElementById('media-content');
    mediaContentFrame.style = type == 'Call' ? 'display:inline-block;margin-top:25px' : 'display:inline-block';
    // mediaContent.style.marginTop = '10px';
    mediaContentFrame.setAttribute('mediaId', mediaId);
    if (type == 'Fax') {
        mediaContentFrame.src = './faxContent.html';
    } else if (type == 'Vmail') {
        mediaContentFrame.src = './vmailContent.html';
    } else if (type == 'Email') {
        mediaContentFrame.setAttribute('mediaId', mediaId);
        mediaContentFrame.src = './emailContent.html';
    } else if (type == 'Call') {
        mediaContentFrame.src = './callContent.html';
    } else if (type == 'Social') {
        mediaContentFrame.src = './campaign/' + campaign + '/caseRecordPopup.html';
    } else {
        mediaContentFrame.src = '';
        mediaContentFrame.style.display = 'none';
    }
}

function setLanguage() {
    $('.l-menu-refresh').text(langJson['l-menu-refresh']);
}

function resizeIframe(obj) {
    // setTimeout(function (p){p.obj.style.height = p.obj.contentWindow.document.documentElement.body.scrollHeight + 'px';}.bind(this, {obj : obj}),500);
    // obj.style.height = Math.max((obj.contentWindow.document.documentElement.lastChild.scrollHeight + 70),577) + 'px';
}

// function resize() {
//     var newHeight;
//     var body = document.body,
//         html = document.documentElement;
//     newHeight = Math.ceil(Math.max(body.scrollHeight, body.offsetHeight, html.offsetHeight)) || 500;
// var menuMainFrame = parent.document.getElementById("menu-main");
// if (menuMainFrame) {
//     menuMainFrame.height = newHeight;
// }
// }

function scrollInputForm() {
    var inputFormFrame = $('#input-form');
    if (inputFormFrame && inputFormFrame.contents()) {
        inputFormFrame.cotents().find('body').animate({
            scrollTop: 0
        }, 1000);
    }
}

function loadTitleBarData(noReload) { // if noReload, only update title bar number
    var escalateQuery = {};
    if (functions.indexOf('Escalation-List-Fn') != -1) {
        escalateQuery = {
            "anyAll": "all",
            "Is_Current": "Y",
            "searchArr": [{
                "list_name": "Case List",
                "field_name": "Escalated_To",
                "logic_operator": ">",
                "value": 0,
                "field_type": "number"
            }],
            Agent_Id: loginId,
            Token: token
        }
    } else {
        escalateQuery = {
            "anyAll": "all",
            "Is_Current": "Y",
            "searchArr": [{
                "list_name": "Case List",
                "field_name": "Escalated_To",
                "logic_operator": "is",
                "value": loginId,
                "field_type": null
            }],
            Agent_Id: loginId,
            Token: token
        }
    }
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/CaseManualSearch',
        //Is_ Current by default "N" ( = will search case log by default)
        data: JSON.stringify(escalateQuery),
        contentType: "application/json",
        dataType: 'json',
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                window.escalationListArr = [];
                $('#escalation-list-no').html('');
            } else {
                window.escalationListArr = r.details;
                $('#escalation-list-no').html(' (' + r.details.length + ')');
                if (!noReload) {
                    if (lowerContent == 'escalationList') {
                        showLowerFrame('escalationList');
                    }
                }
            }
        },
        error: function (r) {
            console.log('error in callSaveCallHistory');
            console.log(r);
            window.escalationListArr = [];
            $('#escalation-list-no').html('');
        }
    });

    var dataObj = {
        Agent_Id: loginId,
        Token: token
    }
    // if not Admin, specify only see self list
    if (functions.indexOf('Incomplete-Cases-Fn') == -1) {
        dataObj['Updated_By'] = loginId;
    }
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/GetCallHistory',
        data: JSON.stringify(dataObj),
        contentType: "application/json",
        dataType: 'json',
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in callSaveCallHistory');
                console.log(r.details);
                window.incompleteCasesArr = [];
                $('#incomplete-cases-no').html('');
            } else {
                window.incompleteCasesArr = r.details;
                $('#incomplete-cases-no').html(' (' + r.details.length + ')');
                if (!noReload) {
                    if (lowerContent == 'incompleteCases') {
                        showLowerFrame('incompleteCases');
                    }
                }
            }
        },
        error: function (r) {
            console.log('error in callSaveCallHistory');
            console.log(r);
            window.incompleteCasesArr = [];
            $('#incomplete-cases-no').html('');
        }
    });
    if (!noReload) {
        if (lowerContent == 'searchCustomer') {
            showLowerFrame('searchCustomer');
        } else if (lowerContent == 'searchCase') {
            showLowerFrame('searchCase');
        } else if (lowerContent == 'adminTransfer') {
            showLowerFrame('adminTransfer');
        } else if (lowerContent == 'dashboard') {
            showLowerFrame('dashboard');
        }
    }
}

function menuCampaignChange(iThis) {
    $('#menu-title-bar').show();
    campaign = $(iThis).find('option:selected')[0].value;
    window.campaign = campaign;
    caseMode = false;
    for (let caseCo of caseCoArr) {
        if (campaign == caseCo) {
            caseMode = true;
        }
    }
    if (caseMode) {
        $('#search-customer-link').hide();
    } else {
        $('#search-customer-link').show();
    }
    loadTitleBarData();
    if (lowerContent == 'inputForm') {
        showLowerFrame('');
    }
    // load contact list and case list for Search Contact List and Search Case List
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/GetFields',
        data: JSON.stringify({
            "listArr": ["Contact Table", "Contact Combined", "Contact System", "Case Table", "Case System"],
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        var details = r.details;
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + details ? details : r);
        } else {
            if (details != undefined) {
                // contactList = details['Contact List'];
                contactTable = details['Contact Table'];
                contactCombined = details['Contact Combined'];
                contactSystem = details['Contact System'];
                // caseList = details['Case List'];
                caseTable = details['Case Table'];
                caseSystem = details['Case System'];
            }
            $('.menu-title-items').show();
        }
    });
}

function returnToSearch() {
    var theInputForm = $('#input-form');
    theInputForm.attr('src', '');
    theInputForm.hide();
    $('#search').show();
}

function gotMsgHistory(msgObj, openType) { // got event from wise
    // Only incomplete now for hktb in fact
    if (openType == 'incomplete') {

        // used for open search and inputform 
        smDetailsArr = (msgObj.offline_form_data != undefined && msgObj.offline_form_data.length > 0) ? msgObj.offline_form_data : (msgObj.online_form_data || []);
        currentTicket = msgObj.ticket_id; // To prevent openInputForm loaded previous record or new ticket history not yet get
        document.getElementById('media-content').contentWindow.generateSocialHistory(msgObj);
    } else {
        //var ticketId = msgObj.ticket_id;      // 20250414 Remove the declaration of the unused 'ticketId' variable.
        var inputFormFrame = document.getElementById('input-form');
        var casePopup = inputFormFrame.contentWindow.caseRecordPopup;
        casePopup.window.generateSocialHistory(msgObj);
    }
}

function loadFunctions() {
    
    // The order will be the reverse of the array below
    var allLeftFunctions = ['Dashboard', "Incomplete-Cases", "Admin-Transfer", "Escalation-List", "Search-Whatsapp", "Search-Case", "Search-Customer"];
    var functionArr = categories.split(',');
    var functionLength = functionArr.length;
    if (functionLength > 0) {
        for (let leftFunction of allLeftFunctions) {
            var indexOfFunction = functionArr.indexOf(leftFunction);
            if (indexOfFunction >= 0) {
                var theFunction = functionArr[indexOfFunction];
                var wordArr = theFunction.split('-');
                var contentId = theFunction.toLowerCase();
                if (caseMode && customCompany != 'no' && contentId == 'search-customer') {
                    continue;
                }
                var theSecondWord = wordArr[1];
                var fileName = wordArr[0].toLowerCase() + (theSecondWord != null ? theSecondWord.charAt(0).toUpperCase() + theSecondWord.slice(1) : '');
                var onClickStr = 'titleClicked("' + fileName + '")';
                $('#campaign-section').after('<li class="nav-item menu-title-items" style="display: list-item;"><a id="' + contentId + '-link" class="nav-link pt-2" href="#" onclick=' + onClickStr + ' data-bs-toggle="tab" aria-selected="true">' + langJson['l-menu-' + contentId] + '<span id="' + contentId + '-no"></span></a></li>');
            }
        }
    }
    // no need refresh function if no need to refresh
    if (functions.indexOf('Escalation-List-Fn') != -1 || functions.indexOf('Incomplete-Cases-Fn') != -1) {
        $('#right-btn-section').removeClass('d-none')
    }
    setLanguage();
}

function windowOnload() {
    loadFunctions();
    var campaignSection = $('#campaign-section');
    if (customCompany != 'no') {
        window.campaign = customCompany;
        campaignSection.hide();
        $.ajax({
            type: "POST",
            url: config.companyUrl + '/api/GetFields',
            data: JSON.stringify({
                "listArr": ["Contact Table", "Contact Combined", "Contact System", "Case Table", "Case System"],
                Agent_Id: loginId,
                Token: token
            }),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            var details = r.details;
            if (!/^success$/i.test(r.result || "")) {
                console.log('error: ' + details ? details : r);
            } else {
                if (details != undefined) {
                    contactTable = details['Contact Table'];
                    contactCombined = details['Contact Combined'];
                    contactSystem = details['Contact System'];
                    caseTable = details['Case Table'];
                    caseSystem = details['Case System'];
                }
                loadTitleBarData();
                $('.menu-title-items').show();
            }
        });
        $('.menu-title-items').show()
    } else {
        campaignSection.append('<select class="form-select campaign-search-condition d-inline text-white py-0" style="max-width:150px;height:25px" onchange="menuCampaignChange(this);"><option disabled="disabled" selected="selected"></option></select>');
        var sessionCampaignList = sessionStorage.getItem('scrmCampaignList') || [];
        var campaignList = JSON.parse(sessionCampaignList);
        var authorizedCompanies = sessionStorage.getItem('scrmCompanies') || '';

        // set option and onChange function for Contact List Manual Search's dropdown
        for (let option of campaignList) {
            if (authorizedCompanies.indexOf(option.Field_Name) != -1) {
                // TBD for demo only
                if (option.Field_Display == 'DEMO') {
                    continue;
                }
                // /TBD
                $(".campaign-search-condition").append('<option class="text-dark "type=' + option.Field_Tag + ' value=' + option.Field_Name + '>' + option.Field_Display + '</option>');
            }
        }
        campaignSection.show();
    }

    // ============== show default page if set ==============
	//20250430 for set the default loading master page
	window.parent.$('.nav-tabs a[href="#menu"]').tab('show');
	
    var defaultTabAfterLogin = config.defaultTabAfterLogin || '';
    if (defaultTabAfterLogin.length > 0) {
        if (defaultTabAfterLogin.startsWith('menu')) {

            // e.g. menu-search-case
            var subTab = defaultTabAfterLogin.slice(5) || '';
            if (subTab.length > 0) {
                $('#' + subTab + '-link').trigger('click');
				//20250430 for set the default loading master page
				$('#' + subTab + '-link').addClass('active');

            }
        }
    }
}



//20250113 for end all the ticket before close()
//Start-------------------------------------------------
window.onbeforeunload = function () {

    var sHandler = parent.$('#phone-panel')[0].contentWindow.shandler;

    var sAssignedTicketList = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList;

    if (sHandler != null && sAssignedTicketList != null)
    {
		/*
        for (var i = 0; i < sAssignedTicketList.length; i++)
        {
    	    //endSessionByHandler
    	    var item = sAssignedTicketList[i];
    	    if (item.AssignedTo == loginId && item.Status == "open")
    	    {
    		    //endSessionByHandler(loginId, top.token, item.ticketId);

    		    sHandler.endTicket({
    			    agentid: loginId,
    			    token: top.token,
    			    ticketid: item.TicketId
    		    })
    				  
    	    }

        }
		*/
		
		// Filter the array to include only matching items
		const filteredTickets = sAssignedTicketList.filter(item => 
			item.AssignedTo === loginId && item.Status === "open"
		);

		// Process the filtered tickets
		filteredTickets.forEach(item => {
			sHandler.endTicket({
				agentid: loginId,
				token: top.token,
				ticketid: item.TicketId
			});
		});

		
    }
}

//End-------------------------------------------------

// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());