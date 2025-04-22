let loginId = sessionStorage.getItem('scrmAgentId');
let loginPassword = sessionStorage.getItem('scrmAgentPassword');

let gettingOnlineTicket = {};
let statusStyle = config.statusStyle ||  {"LOGIN":"#6c757d","IDLE":"#FF2735","TALK":"#4caf50","HOLD":"rgb(201, 203, 207)","READY":"rgb(54 102 189)","#dbdb30":"rgba(21, 193, 231, 0.9)","BREAK":"#AB4A0E","MONITOR":"rgb(153, 102, 255)"};
let noRingStatuses = config.noRingStatuses||[];
let customCompany = sessionStorage.getItem('scrmCustomCompany');
let scriptElement=document.createElement('script');  
scriptElement.type='text/javascript';
scriptElement.src = "script/sl-no.js";
let headTag=document.getElementsByTagName('head')[0];
headTag.insertBefore(scriptElement, headTag.firstChild);


let queueLayout = {};
queueLayout[CATY_INDB]={ prefix: "inbound", style: "width:48px;border-radius:3px;background: linear-gradient(60deg,#FFC83D,#fb8c00);box-shadow:3px 3px 4px 0 rgba(0,0,0,.36);", image: "img/call-icon-512-2.png", color: "#F89A1E" };
queueLayout[CATY_EMAIL]={ prefix: "email", style: "width:48px;border-radius:3px;background: linear-gradient(60deg,#FFC83D,#fb8c00);box-shadow:3px 3px 4px 0 rgba(0,0,0,.36);", image: "img/email-icon-512-2.png", color: "#F89A1E"};
queueLayout[CATY_VMAIL]={ prefix: "vmail", style: "width:48px;border-radius:3px;background: linear-gradient(60deg,#86B784,#43a047);box-shadow:3px 3px 4px 0 rgba(0,0,0,.36);", image: "img/vmail-icon-512-2.png", color: "#52BD00"};
queueLayout[CATY_FAX]={ prefix: "fax", style: "width:48px;border-radius:3px;background:linear-gradient(60deg,#6AD1D8,#00acc1);box-shadow:3px 3px 4px 0 rgba(0,0,0,.36);", image: "img/fax-icon-512-2.png", color: "#08B1C6"};
queueLayout[CATY_WEBCHAT]={ prefix: "webchat", style: "width:48px;border-radius:3px;background:linear-gradient(60deg,#F48FB1,#F06292);box-shadow:3px 3px 4px 0 rgba(0,0,0,.36);", image: "img/webchat-icon-512-2.png", color: "#F06292"};	
queueLayout[CATY_BLOG]={ prefix: "blog", style: "width:48px;border-radius:3px;background:linear-gradient(60deg,#7986CB,#3D5A98);box-shadow:3px 3px 4px 0 rgba(0,0,0,.36);", image: "img/fb-icon-512-2.png",color: "#3D5A98"};	
// wechat
queueLayout[CATY_WECHAT]={ prefix: "wechat", style: "width:48px;border-radius:3px;background: linear-gradient(60deg,#86B784,#3CB034);box-shadow:3px 3px 4px 0 rgba(0,0,0,.36);", image: "img/wechat-icon-512.png",color: "#3CB034"};	
queueLayout[CATY_WHATSAPP]={ prefix: "whatsapp", style: "width:48px;border-radius:3px;background: linear-gradient(60deg,#86B784,#3CB034);box-shadow:3px 3px 4px 0 rgba(0,0,0,.36);", image: "img/whatsapp-icon-512.png",color: "#3CB034"};	
queueLayout[CATY_FBMSG]={ prefix: "fbmsg", style: "width:48px;border-radius:3px;background: linear-gradient(60deg,#6977BC,#437BBD);box-shadow:3px 3px 4px 0 rgba(0,0,0,.36);", image: "img/fbmsg-icon-512.png",color: "#6977BC"};	
queueLayout[CATY_FBPOST]={ prefix: "fbpost", style: "width:48px;border-radius:3px;background: linear-gradient(60deg,#7986CB,#3D5A98);box-shadow:3px 3px 4px 0 rgba(0,0,0,.36);", image: "img/fbpost-icon-512.png",color: "#7986CB"};

let channels={};
channels[CATY_INDB]="Inbound_Call"; 
channels[CATY_EMAIL]="Inbound_Email"; 
channels[CATY_VMAIL]="Inbound_Voicemail"; 
channels[CATY_FAX]="Inbound_Fax"; 
channels[CATY_WEBCHAT]="Inbound_Webchat"; 
channels[CATY_BLOG]="Inbound_OthersMedia"; 
channels[CATY_WHATSAPP]="Inbound_Whatsapp"; 
channels[CATY_FBMSG]="Inbound_FBMsg"; 
channels[CATY_FBPOST]="Inbound_FBPost"; 

let agentStatus={};
agentStatus[STATUS_LOGOUT]="LOGOUT";
agentStatus[STATUS_LOGIN]="LOGIN";
agentStatus[STATUS_IDLE]="IDLE";
agentStatus[STATUS_READY]="READY";
agentStatus[STATUS_BREAK]="BREAK";
agentStatus[STATUS_HOLD]="HOLD";
agentStatus[STATUS_TALKING]="TALKING";
agentStatus[STATUS_WORKING]="WORKING";
agentStatus[STATUS_DIALING]="DIALING";
agentStatus[STATUS_PLAYING]="PLAYING";
agentStatus[STATUS_MONITOR]="MONITOR";

let ticketList=[];
let currSocialMsg={};

let sendMsgResult ={result:"", data:{}};
let sendFileResult ={result:"", data:{}};
let userMode="";
let agentStatusTimer;
let inboundQueueTimer;
let updateQueueTimer;
let queueTimeTimer;

let queueList = [];
let callType=0;
let callID=0;
let ANINo="";
let DNISNo="";
let ivrsMessage="";
let attachment="";
let currCallInfo={ lastCallType: 0, lastCallID: 0, confCallID: 0, vbotCaseNo: '', callSeq : []} ;
let currCallType=0;
let currCallID=0;
let holdingConnIDs = [];
let confConnID = 0;
let connID = 0;
let serviceID = 0;
let isMakeConf=false;
let mediaID =0;
let mediaFrom ="";
let mediaTo ="";
let mediaSubject ="";
let ringAudio;
let queAudio;
let msgAudio;

let localIP="";

let monAgentList=[];
let monACDGroupList=[];
let monCallStatusList=[];
let monitoredAgentId=0;
let monitoredTicketList=[];

let directCalls=[];

let acdGroupMemberBy="";

let templateMsgResult={};
let templateMsgResultEx=[];
let mediaCallMessage=[];

let agentLevelID=0;
let callbackFnRM100=null;


window.onclose = function() {
	wsWiseAgent.Logout();
}

window.onbeforeunload =function() {
	wsWiseAgent.Logout();
	wsWiseMonitor.CloseWebsocket();
	if(config.isWebRTC) {
		RTC.sipLogout();
	}
}
let winOnFocus=true;

let hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

let videoElement = document.getElementById("videoElement");

// If the page is hidden, pause the video;
// if the page is shown, play the video
function handleVisibilityChange() {
  if (document[hidden]) {
    winOnFocus=false;
  } else {
    winOnFocus=true;
  }
}

// Warn if the browser doesn't support addEventListener or the Page Visibility API
if (typeof document.addEventListener === "undefined" || hidden === undefined) {
  console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
} else {
  // Handle page visibility change
  document.addEventListener(visibilityChange, handleVisibilityChange, false);

  // When the video pauses, set the title.
  // This shows the paused
  

}
async function windowOnload() {
	ringAudio=document.getElementById("ringAudio");
	queAudio=document.getElementById("queAudio");
	msgAudio=document.getElementById("msgAudio");
	
	agentStatusTimer=window.setInterval ("AgentStatusTicker()",1000,"javascript");
	window.clearInterval(agentStatusTimer);
	inboundQueueTimer=window.setInterval ("inboundQueueTicker()",1000,"javascript");
	queueTimeTimer=window.setInterval ("queueTimeTicker()",1000,"javascript");
	
	if (config.isWebRTC) {
		setTimeout(function(){RTC.sipLogin();},1000); // wait till api loaded
	}
	wsWiseAgent.OpenWebsocket(config.wiseSocket);

	shandler = await WSSHandler.create({
		hostname: "172.17.6.11",
		agentid: loginId,
		agentname: top.agentName,
		token: top.token,
		tls: false,
		listener: {
			onTicketEvent: onTicketEvent,
			onMessageEvent: onMessageEvent,
			onInteractEvent: onInteractEvent,
		}
	});
	console.log(shandler.tickets);

	wa_template = Handlebars.compile($('#wa_template').html());	// located at the end of the page
	q_template = Handlebars.compile($('#visit_quoted_message_template').html());	// located at the end of the page

	var sCompany = "EPRO";
	var sAgentId = loginId;
	var sToken = top.token;

	(async () => {
		waTempService = new WaTemplateService(wa_template, q_template, config.waTemplate);
		await waTempService.getTemplateByAPI(sCompany, sAgentId, sToken);
		console.log(waTempService.templateList); // Access the updated template list
	})();


	//    var waTempService = new WaTemplateService(wa_template, q_template, config.shandlerUrl);
	caHistService = new CaseHistory();
}

// wsMonitor Start	
document.addEventListener("OnRMopen", function (e){
	setTimeout(function() {
		wsWiseMonitor.Login(loginId, loginId);
	}, 1000);
});

document.addEventListener("onRMclose", function (e){
	setTimeout(function (){wsWiseMonitor.OpenWebsocket(config.wiseMonitorSocket);},1000);
});

document.addEventListener("onRMCommandSuccess", function (e){
	let obj = e.detail;
	if(obj.ResultCommand==107) { //Login
		wsWiseMonitor.StartMonitor(3); // agent
		wsWiseMonitor.StartMonitor(2); // acd group
		wsWiseAgent.StartMonitor (6);	//for social media 
		wsWiseMonitor.StartMonitor(20); // Call IVRS - shows the queue how many people waiting in IVRS
		wsWiseMonitor.StartMonitor(21);
		setTimeout(function() { wsWiseMonitor.StopMonitor(21);},300000);
	}
	else if(obj.ResultCommand==100) { //AddDevice
		triggerEvent(window.parent.document, 'onWiseAddDevice', {"result":"success", "message" : obj.OKMessage});
		if(callbackFnRM100) callbackFnRM100({"result":"success", "message" : obj.OKMessage});
		callbackFnRM100=null;
			
	}
	else if(obj.ResultCommand==101) { //AddDeviceMember
		triggerEvent(window.parent.document, 'onWiseAddACDGroupMember', {"result":"success", "message" : obj.OKMessage});
	}
	else if(obj.ResultCommand==111) { //DelDevice
		triggerEvent(window.parent.document, 'onWiseDelDevice', {"result":"success", "message" : obj.OKMessage});
	}
	else if(obj.ResultCommand==112) { //RemoveDeviceMember
		triggerEvent(window.parent.document, 'onWiseDelACDGroupMember', {"result":"success", "message" : obj.OKMessage});
	}		
});

document.addEventListener("onRMCommandFail", function (e){
	let obj = e.detail;
	console.log(obj);
	if(obj.ResultCommand==100) { //AddDevice
		triggerEvent(window.parent.document, 'onWiseAddDevice', {"result":"fail", "message" : obj.ErrMessage});
		if(callbackFnRM100) callbackFnRM100({"result":"fail", "message" : obj.ErrMessage});
		callbackFnRM100=null;
	}
	else if(obj.ResultCommand==101) { //AddDeviceMember
		triggerEvent(window.parent.document, 'onWiseAddACDGroupMember', {"result":"fail", "message" : obj.ErrMessage});
	}
	else if(obj.ResultCommand==111) { //DelDevice
		triggerEvent(window.parent.document, 'onWiseDelDevice', {"result":"fail", "message" : obj.ErrMessage});
	}
	else if(obj.ResultCommand==112) { //RemoveDeviceMember
		triggerEvent(window.parent.document, 'onWiseDelACDGroupMember', {"result":"fail", "message" : obj.ErrMessage});
	} else if (obj.ResultCommand == 107) {
		if (parent.wiseMonPopup) {
			parent.wiseMonPopup.close();
		}
		if (parent.wallboardPopup) {
			parent.wallboardPopup.close();
		}

		// alert will run faster then popupclose, and make the window cannot be close because of the alert if no timeout
		setTimeout(function(){alert("Please contact IT support to grant the supervisor rights");},500)
	}
});

document.addEventListener("onRMAgentInfo", function (e){
	let obj = e.detail;
	let i=monAgentList.findIndex(function(v){return v.agentId==obj.agentId});
	delete obj.Password
	if(i==-1){
		obj.ticketList=[];
		monAgentList.push(obj);
		wsWiseAgent.GetAgentTicketList(obj.agentId);
		i=monAgentList.length-1;
		triggerEvent(window.parent.document, 'onMonitorAgentInfo', { ...monAgentList[i] }); // Some company may no social media service, so get ticket no return
	} else {
		monAgentList[i]=Object.assign(monAgentList[i], obj)
		triggerEvent(window.parent.document, 'onMonitorAgentInfo', monAgentList[i]);
	}
});

document.addEventListener("AgentTicketList", function (e){
	let obj = e.detail;
	let i=monAgentList.findIndex(function(v){return v.agentId==obj.agent_id});
	if(i!=-1){
		monAgentList[i].ticketList=(obj.ticket_list==null)? [] : obj.ticket_list.slice(0);
		triggerEvent(window.parent.document, 'onMonitorAgentInfo', { ...monAgentList[i] });
	}
});

document.addEventListener("AgentTicketStatus", function (e){
	let obj = e.detail;
	wsWiseAgent.GetAgentTicketList(obj.agent_id);
});

document.addEventListener("onRMACDGroupInfo", function (e){
	let obj = e.detail;
	let i=monACDGroupList.findIndex(function(v){return v.groupId==obj.groupId});
	if(i==-1){
		monACDGroupList.push({"groupId": obj.groupId,"groupName" : obj.groupName, "waitCount": obj.waitCount, "waitTime" : obj.waitTime});
		i=monACDGroupList.length-1;
		triggerEvent(window.parent.document, 'onMonitorACDGroupInfo', monACDGroupList[i]);
	} else {
		if(monACDGroupList[i].groupName=="") monACDGroupList[i].groupName=obj.groupName;
		monACDGroupList[i].waitCount=obj.waitCount;
		monACDGroupList[i].waitTime=obj.waitTime;
		triggerEvent(window.parent.document, 'onMonitorACDGroupInfo', monACDGroupList[i]);
	}
});

document.addEventListener("onRMCallStatus", function (e){
	let obj = e.detail;
	let oDeviceHandle=obj.oDeviceHandle;
	let dDeviceHandle=obj.dDeviceHandle;
	if(obj.statusID=="1") {
		if(oDeviceHandle.toString(16).substr(0,1)=="6" /*line device*/ && dDeviceHandle.toString(16).substr(0,1)=="b" /*flow device*/ && !monCallStatusList.includes(obj.callID)) {
			monCallStatusList.push(obj.callID);
			triggerEvent(window.parent.document, 'onMonitorIVRSCount', monCallStatusList.length);
		}
	}
	else if(obj.statusID=="10") {
		if(monCallStatusList.includes(obj.callID)) {
			monCallStatusList.pop(obj.callID);
			triggerEvent(window.parent.document, 'onMonitorIVRSCount', monCallStatusList.length);
		}
	}
});
// /wsMonitor End

window.addEventListener(document, 'wsOnopen', function (e){
	setTimeout(function (){wsWiseAgent.Login(loginId, loginId,"");},1000);
});

addEventListener(document, 'CommandSuccess', function (e){
	let obj = e.detail;
	let resultCmd = obj.ResultCommand;
	if (resultCmd == 127 || resultCmd == 238) {	// Login & LoginEx
		if (resultCmd == 127) { agentLevelID = obj.LevelID; parent.addWiseMonBtn(); }
		wsWiseAgent.GetACDGroup();
		wsWiseAgent.GetACDPark();
		wsWiseAgent.StartMonitor(1);	//for ACDGroup call queue
		initMediaCount();
		updateQueueTimer = window.setInterval("updateQueueTicker()", 60000, "javascript");
	} else if (resultCmd == 150) { //Unhold
		holdingConnIDs.pop();
		let parentholdBtn = parent.$("#icon-line-1")
		parentholdBtn.attr("title", "Hold Call");
		parentholdBtn.find('i').addClass('fa-pause').removeClass('fa-play');
	} else if (resultCmd == 160) { //accept Call Ex
		console.log(obj);
	}
});

addEventListener(document, 'CommandFail', function(e) {
	let obj = e.detail;
	//console.log(obj);
	// 108 DialAgent, 213 send message
	if(obj.ResultCommand == 127){
		alert(obj.Description);
		parent.logoutClicked();
	}else if (obj.ResultCommand == 108){	//DialAgent
		alert(obj.Description);
	}else if(obj.ResultCommand == 213){
		sendMsgResult.result = "fail";
		sendMsgResult.data={};
	}else if(obj.ResultCommand == 219){
		sendFileResult.result = "fail";
		sendFileResult.data={};
	}else if(obj.ResultCommand==148) { //transfer
		alert('fail: cannot transfer call');
	}else if(obj.ResultCommand==125) { //Hold
		alert('fail: cannot hold call');
	}else if(obj.ResultCommand==150) { //Unhold
		alert('Please try again');
	}
});

addEventListener(document, 'AnsCallInfo', function (e){

	let obj = e.detail;
	let caller = "";
	let answer = false;

	switch (obj.DeviceType) {
		case DEVICE_AGENT:
			caller = " Agent (" + obj.DeviceID + ")";
			break;
		case DEVICE_LINE:
			caller = " Line (" + obj.DeviceID + ")";
			break;
	}
	
	switch (obj.CallType) {
		case CATY_INTER: //Intercom call
			answer = confirm ("Accept Intercom Call?" + caller);
			break;
		case CATY_TRANSFER: //Transfer call
			answer = confirm ("Accept Transfer Call?" + caller);
			break;
		case CATY_INDB: //inbound call
			answer = confirm ("Answer direct call?" + caller);
			break;
		default:
			answer = confirm ("Accept Transfer Call?");
	}
	if (answer){
		wsWiseAgent.AcceptCall();
	} else {
		wsWiseAgent.RejectCall();
		if (obj.CallType==CATY_INTER)
			wsWiseAgent.SendMessage_UC(3,obj.DeviceID,"@sys-response@intercom-N");
	}
});	

addEventListener(document, 'AgentStatusEvent', function (e){
	let obj = e.detail;
	let statusId=obj.StatusID;
	if(statusId != STATUS_HOLD && parent.$("#icon-line-1 i").hasClass('fa-play')){
		let parentholdBtn = parent.$("#icon-line-1")
		parentholdBtn.attr("title", "Hold Call");
		parentholdBtn.find('i').addClass('fa-pause').removeClass('fa-play');
	}
	window.clearInterval(agentStatusTimer);	
	switch (statusId) {
		case STATUS_LOGIN:		    		    		    		        
			userMode = "LOGIN";
			
		break;
		case STATUS_IDLE:		    		    		    		        
			userMode = "IDLE";
			wsWiseAgent.BindToACDGroup(0);
			isMakeConf=false;
			confConnID=0;
			break;
		case STATUS_WORKING:				    
			userMode = "WORKING";
			wsWiseAgent.BindToACDGroup(0);
			isMakeConf=false;
			confConnID=0;
			break;
		case STATUS_HOLD:
			userMode = "HOLD";
			break;
		case STATUS_BREAK:
			userMode = "BREAK";
			break;
		case STATUS_DIALING:
			userMode = "DIALING";
			break;
		case STATUS_READY:
			userMode = "READY";
			break;
		case STATUS_TALKING:
			userMode = "TALK";
			wsWiseAgent.BindToACDGroup(0);
			break;
		case STATUS_PLAYING:
		    userMode = "PLAYING";
		    break;
		case STATUS_MONITOR:
			userMode = "MONITOR";
		    break;
	}
	if (userMode!="") {
		$('#panelAgentStatus').text(userMode);
		
		$('#panelTimeCount').text("00:00");
		
		if(userMode == "IDLE") {
			$('#panelAgentStatus').css("color","red");
		} else if(userMode == "TALK") {
			$('#panelAgentStatus').css("color","blue");
		} else if(userMode == "HOLD") {
			$('#panelAgentStatus').css("color","orangered");
		} else {
			$('#panelAgentStatus').css("color","black");
		}
		
		try {
			parent.document.getElementById('agent-status-text').innerHTML=userMode;
			parent.document.getElementById('panel-time-count').innerHTML="00:00";
			parent.$('#panel-agent-status').css('background-color', statusStyle[userMode] || '#6c757d')
		} catch(err) {
			console.log(err.message);
		}
		
	}
	agentStatusTimer=window.setInterval ("agentStatusTicker()",1000,"javascript");
});

let pACDGroup=[];
addEventListener(document, 'ACDGroupQueueEx', function (e) {
	let obj = e.detail;
	let bShowQueue = false;
	
	for (let member of obj.Member) {//get all member in same GroupID
		let alert_idx = originalMsgArr.findIndex(function (el) { return el.callType == member.CallType; });

		serviceList.forEach(service => {
			let callType=service.callType;
			if (service.acdGroup == member.GroupID && callType == member.CallType) {

				let idx = queueList.findIndex(function (v) { return v.callType == member.CallType && v.acdGroup == member.GroupID });
				if (idx == -1) {
					if (member.WaitCount != 0) {
						let q = {
							callType: parseInt(member.CallType), acdGroup: service.acdGroup, entry: service.entry, name: service.name, caption: service.caption,
							dnis: service.dnis, showPriority: service.showPriority, waitTime: member.MaxWaitTime, waitCount: member.WaitCount,
							mediaCount: 0
						};
						queueList.push(q);
						bShowQueue = true;
						if (member.CallType == CATY_BLOG && service.entry == "whatsapp") {
							openAlert(member.CallType, "New Whatsapp user. Please answer the chat.", member.WaitCount, member.MaxWaitTime);
						}
					}
					else {
						if (alert_idx != -1) originalMsgArr.splice(alert_idx, 1);
						if (originalMsgArr.length == 0 && popup != null) popup.close();
					}
				} else if (idx >= 0) {
					if (queueList[idx].mediaCount == 0 && member.WaitCount == 0) {
						if (alert_idx != -1) originalMsgArr.splice(alert_idx, 1);
						console.log(originalMsgArr);
						if (originalMsgArr.length == 0 && popup != null) popup.close();

						queueList.splice(idx, 1);
						bShowQueue = true;
					}
					else {



						if (queueList[idx].waitTime != member.MaxWaitTime || queueList[idx].waitCount != member.WaitCount) bShowQueue = true;
						queueList[idx].waitTime = member.MaxWaitTime;
						queueList[idx].waitCount = member.WaitCount;
						if (member.CallType == CATY_BLOG && service.entry == "whatsapp")
							openAlert(member.CallType, "New Whatsapp user. Please answer the chat.", member.WaitCount, member.MaxWaitTime);
						/*	Tiger 2025-04-10
						let bShowAlert = false;

						if (pACDGroup.length == 0)
							bShowAlert = true;
						else {
							let p = pACDGroup.findIndex(function (v) { return v.CallType == member.CallType && v.GroupID == member.GroupID });
							if (p == -1)
								bShowAlert = true;
							else if (member.WaitCount > pACDGroup[p].WaitCount) {

								bShowAlert = true;
							} else if (member.WaitCount == pACDGroup[p].WaitCount) {
								if (member.MaxWaitTime < pACDGroup[p].MaxWaitTime) bShowAlert = true;
							}
						}

						if (bShowAlert) {
							if (member.CallType == CATY_BLOG && service.entry == "whatsapp")
								openAlert(member.CallType, "New Whatsapp user. Please answer the chat.", member.WaitCount, member.MaxWaitTime);
						}
						*/
					}
				}
			}
        });
	}
		
	if (bShowQueue) {
		queueList.sort(function (a,b) { let e =a.showPriority -b.showPriority; if(e==0) return (b.waitTime-a.waitTime); else return e; });
		showQueueList();
	}
});

function getCallType(callType, entry) {
	let rCalltype = callType;
	if (callType == CATY_BLOG && entry == "wechat") rCalltype = CATY_WECHAT;
	else if (callType == CATY_BLOG && entry == "whatsapp") rCalltype = CATY_WHATSAPP;
	else if (callType == CATY_BLOG && entry == "fbmsg") rCalltype = CATY_FBMSG;
	else if (callType == CATY_BLOG && entry == "fbpost") rCalltype = CATY_FBPOST;
	return rCalltype;
}
addEventListener(document, 'CallMessage', function (e){//Object got: {obj.Member[i].VarType, obj.Member[i].VarMsg}
	let obj = e.detail;
	console.log(obj);
	mediaFrom="";
	mediaTo="";
	mediaSubject="";
	mediaID = 0;
	connID = 0;
	serviceID = 0;
	for (let member of obj.Member){ 
        switch (member.VarType) {
			case C_VAL_DATA:
				ivrsMessage = member.VarMsg;
				break;
			case C_VAL_CONNECTIONID:
				connID=member.VarMsg;
				if (callType==CATY_CONF) confConnID = connID;
				break;
			case C_VAL_CALLID:
				callID=member.VarMsg;
				break;
			case C_VAL_SERVICEID:
				serviceID =member.VarMsg;
				break;
			case C_VAL_CALLTYPE:
				callType = member.VarMsg;
				break;
			case C_VAL_ANI:
				ANINo  = member.VarMsg;
				break;
			case C_VAL_DNIS:
				DNISNo  = member.VarMsg;
				
				break;
			case C_VAL_ATTACHMENT:
				attachment = member.VarMsg;
				break;
			case C_VAL_MEDIAFROM:
				mediaFrom = member.VarMsg;
				break;
			case C_VAL_MEDIATO:
				mediaTo = member.VarMsg;
				break;
			case C_VAL_MEDIASUBJECT:
				mediaSubject = member.VarMsg;
				break;
			case C_VAL_MEDIAID:
                mediaID = member.VarMsg;
				break;
		}
	}
	let callInfo = { "callType": callType, "callID": callID, "ANI": ANINo, "DNIS": DNISNo, "Message": ivrsMessage };
    let service = serviceList.find(function (v) { return v.callType == callType && v.dnis == DNISNo });
    
	$("#softPhone").css("cursor", "default");
	$("#queueListBar").find("[id*='QueueCount1']").css("cursor", "pointer");
    if (callType==CATY_OUTBD || callType==CATY_INDB || callType==CATY_TRANSFER|| callType==CATY_CONF) {
		
		if (callType==CATY_CONF && isMakeConf) {	//when agent create conference call
			currCallInfo.confCallID = callID;
			// call UI
			window.parent.replyCallClick(currCallInfo.lastCallType, currCallInfo.lastCallID, currCallInfo.confConnID);
		} else if (callType==CATY_OUTBD) {
			// call UI
			//console.log(callID);
			if (currCallInfo.lastCallID!=callID) {
				currCallInfo.lastCallType=callType;
				currCallInfo.lastCallID=callID;
				
				if (currCallInfo.callSeq.filter(function (v) { return v.callID==callID }).length==0)
                    currCallInfo.callSeq.push(callInfo);
				saveVoicebotCall(callID, currCallInfo.vbotCaseNo);
				window.parent.replyCallClick(callType, callID, 0);
			}
		} else {
			currCallInfo.lastCallType=callType;
			currCallInfo.lastCallID=callID;
			if (currCallInfo.callSeq.filter(function (v) { return v.callID==callID }).length==0)
                currCallInfo.callSeq.push(callInfo);
			
			//all type of inbounds: inbound call , transfer in call, agent invite in conference call
			if (callType==CATY_INDB || callType==CATY_TRANSFER || (callType==CATY_CONF && !isMakeConf)) {	
				service = serviceList.find(function (v) { return v.callType == CATY_INDB && v.dnis == DNISNo });
				if (service)
                    window.parent.connClick(callID, service.name,channels[CATY_INDB],ANINo,DNISNo,ivrsMessage, attachment);
			}
		}
    } else if ((callType == CATY_EMAIL || callType == CATY_VMAIL) && DNISNo !="") {
        updateMediaCount(callType, DNISNo,10);
		if(callType==CATY_VMAIL){
            window.parent.connClick(callID, service.name,channels[CATY_VMAIL],DNISNo,DNISNo,ivrsMessage, attachment);
		}
	} else if (callType==CATY_FAX) {
		try {
            if (!service) return;
            window.parent.connClick(callID, service.name,channels[callType],ANINo,DNISNo,"");
		} catch(err) {
			console.log(err.message);
		}
	} else if ((callType == CATY_BLOG || callType == CATY_WEBCHAT) && mediaID != 0) {
        let idx = mediaCallMessage.findIndex(function (v) { return v.call_id == callID; });
		if(mediaSubject == 'webchat_offlineForm'){
			triggerEvent(document, "OfflineForm", {'Command': obj.Command, 'company_code': mediaFrom, 'ticket_id': mediaID, entry:"webchat", "offline_form":1 });
			wsWiseAgent.GetOfflineForm(mediaID);
			wsWiseAgent.UpdateTicket(mediaID, loginId);
		}else{
            if (!service){
				let rCalltype = getCallType(callType, service.entry);
                
                if (idx ==-1) {
					mediaCallMessage.push({"call_id" : callID, "ticket_id" : mediaID});
				}
				//Tiger 2020-6-2
                window.parent.connClick(callID, service.name,channels[rCalltype],mediaTo,DNISNo,mediaID);
			}
			wsWiseAgent.UpdateTicket(mediaID, loginId);
	    }
	}
});

addEventListener(document,  'CallStatusEvent', function (e){
	let obj = e.detail;
	switch (obj.StatusID) {
		case CALL_ESTHOLD:
		case CALL_ESTDHOLD:
			holdingConnIDs.push(connID);
			break;
	}
});

addEventListener(document, 'MediaCallStatus', function (e){//Object got: {obj.ConnID, obj.CallType, obj.StatusID}
	let obj = e.detail;
	if (obj.ConnID != 0) {
		if (obj.StatusID == CALL_I_QUEUE) {			//New Queue
		}
	}
});

addEventListener(document, 'StartScreenCap', function (e){
	// need to have DDE like BOCPT
});

addEventListener(document, 'StopScreenCap', function (e){
	// need to have DDE like BOCPT
});

addEventListener(document, 'OfflineForm', function (e) {
	let obj = e.detail;
	let idx = ticketList.findIndex(function (v) { return v.ticket_id==obj.ticket_id});
	if(idx == -1) {  // to create a form with company name first
		let ticket = jQuery.extend({}, obj);
		ticket.online_form_data=[];
		ticket.offline_form_data=[];
		ticket.ticket_status="open";
		ticket.company_name="";
		ticket.company_short_name="";
		let s = serviceList.filter(function (v) { return v.callType==CATY_WEBCHAT && v.dnis==ticket.company_code })[0];
		if (s!=undefined) {ticket.company_name=s.name; ticket.company_short_name=s.shortName;}
		ticketList.push(ticket);
	} else { // by ticket id match, return offline_form_data
		let bEvent = (ticketList[idx].offline_form_data.length==0);
		if (bEvent) {
			ticketList[idx].offline_form = 1;
			if(obj.data){ ticketList[idx].offline_form_data = obj.data; }
			ticketList[idx].start_time="";
			$.ajax({
				type: "POST",
				url:  config.wiseUrl+"/api/SocialMedia/GetFormData",
				data: JSON.stringify({"ticketId" : obj.ticket_id}),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function (r) {
					if (r.result=="success") {
						ticketList[idx].start_time=r.data.start_time;
					}
					triggerEvent(window.parent.document, 'onWiseSocialMsg', ticketList[idx]);
					if(gettingOnlineTicket[obj.ticket_id]){
						delete gettingOnlineTicket[obj.ticket_id];
					}
				},
				error: function (r) {
					console.log(r);
					triggerEvent(window.parent.document, 'onWiseSocialMsg', ticketList[idx]);
					if(gettingOnlineTicket[obj.ticket_id]){
						delete gettingOnlineTicket[obj.ticket_id];
					}
				},
			});
		}
		
	}
});

addEventListener(document, 'OnlineForm', function (e) {
	let obj = e.detail;
	let idx = ticketList.findIndex(function (v) { return v.ticket_id==obj.ticket_id});
	if (idx==-1) return;
	let bEvent = ticketList[idx].online_form_data.length==0;
	ticketList[idx].online_form = 1;
	ticketList[idx].online_form_data = obj.data;
	if (bEvent && ticketList[idx].msg_list!=undefined) triggerEvent(window.parent.document, 'onWiseSocialMsg', ticketList[idx]);
	if(gettingOnlineTicket[obj.ticket_id]){
		delete gettingOnlineTicket[obj.ticket_id];
	}
});

addEventListener(document, 'SendSocialMsgToAgent', function (e) {
	let obj = e.detail;
	let idx = ticketList.findIndex(function (v) { return v.ticket_id == obj.ticket_id });
	let service;
	if(idx==-1) {
		let ticket = jQuery.extend({}, obj);
		ticket.online_form_data=[];
		ticket.offline_form_data=[];
		ticket.ticket_status="open";
		ticket.company_name="";
		ticket.company_short_name="";
		if (ticket.entry=="webchat") {
            service = serviceList.find(function (v) { return v.callType==CATY_WEBCHAT && v.dnis==ticket.company_code })[0];
            if (service != undefined) { ticket.company_name = service.name; ticket.company_short_name = service.shortName;}
		} else {
            service = serviceList.find(function (v) { return v.callType==CATY_BLOG && v.dnis==ticket.company_code })[0];
            if (service != undefined) { ticket.company_name = service.name; ticket.company_short_name = service.shortName;}
		}
        let message = mediaCallMessage.find(function (v) { return v.ticket_id==obj.ticket_id})[0];
        ticket.conn_id = (message != undefined) ? message.call_id : 0;
		ticketList.push(ticket);

		if (ticket.entry == "webchat") {
			if(obj.offline_form==0) {
				wsWiseAgent.GetOnlineForm(obj.ticket_id);
				gettingOnlineTicket[obj.ticket_id] = true;
			}else{
				 wsWiseAgent.GetOfflineForm(obj.ticket_id);
				 gettingOnlineTicket[obj.ticket_id] = true;
			}
		}
		else {
			triggerEvent(window.parent.document, 'onWiseSocialMsg', ticket);
		}
	} else if (obj.msg_list!=undefined && ticketList[idx].ticketStatus != "end" && ticketList[idx].ticketStatus != "timeout") {
		if(gettingOnlineTicket[obj.ticket_id]){
			if(Array.isArray(ticketList[idx].msg_list)){
				ticketList[idx].msg_list = ticketList[idx].msg_list.concat(obj.msg_list);
			} else {
				ticketList[idx].msg_list = obj.msg_list;
			}
		}else{
			ticketList[idx].Command = obj.Command;
			ticketList[idx].msg_list=obj.msg_list;
			triggerEvent(window.parent.document, 'onWiseSocialMsg', ticketList[idx]);
		}
		console.log("winOnFocus=" + winOnFocus);
		if (!winOnFocus) {
			if (obj.msg_list[0].sender == "enduser" && (ticketList[idx].entry == "webchat" || ticketList[idx].entry == "facebook" || ticketList[idx].entry == "whatsapp")) {
				if (msgAudio.currentTime == 0 || msgAudio.currentTime == msgAudio.duration || msgAudio.paused || msgAudio.ended) {
					msgAudio.currentTime = 0;
					msgAudio.play();
				}

			}
		}
	}
	
});

addEventListener(document, 'TicketMsgList', function (e) {
	let obj = e.detail;
	
	obj.start_time="";
	obj.online_form=0;
	obj.online_form_data=[];
	obj.offline_form=0;
	obj.offline_form_data=[];
	$.ajax({
		type: "POST",
		url: config.wiseUrl+"/api/SocialMedia/GetFormData",
		data: JSON.stringify({"ticketId" : obj.ticket_id}),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (r) {
			if (r.result=="success") {
				obj.start_time=r.data.start_time;
				if(r.data.online.length>0)
				{
					obj.online_form=1;
					obj.online_form_data=r.data.online;
				} 
				
				if(r.data.offline.length>0)
				{
					obj.offline_form=1;
					obj.offline_form_data=r.data.offline;
				} 
			}
			triggerEvent(window.parent.document, 'onWiseSocialMsgList', obj);
		},
		error: function (r) {
			console.log(r);
			triggerEvent(window.parent.document, 'onWiseSocialMsgList', obj);
		},
	});
	
});

addEventListener(document, 'EndTicket', function (e) {
	let obj = e.detail;
	let idx = ticketList.findIndex(function (v) { return v.ticket_id==obj.ticket_id});
	if (idx==-1) return;
	ticketList[idx].ticketStatus = "end";
	if(ticketList[idx].offline_form != 1){
		triggerEvent(window.parent.document, 'onWiseSocialStatus', {ticket_id: obj.ticket_id, ticket_status: "end" });
	}
});

addEventListener(document, 'WCCustomerInput', function (e) {
	triggerEvent(window.parent.document, 'onWCCustomerInput', e.detail.ticket_id);
});

addEventListener(document, 'TicketTimeout', function (e){
	let obj = e.detail;
	let idx = ticketList.findIndex(function (v) { return v.ticket_id==obj.ticket_id});
	if (idx==-1) return;
	ticketList[idx].ticketStatus = "timeout";
	if(ticketList[idx].offline_form != 1){
		triggerEvent(window.parent.document, 'onWiseSocialStatus', {ticket_id: obj.ticket_id, ticket_status: "timeout" });
	}
});

addEventListener(document, 'ResultSendMsg', function (e){
	let obj = e.detail;
	sendMsgResult.result = "success";
	sendMsgResult.data=obj.data;
});

addEventListener(document, 'ResultSendFile', function (e){
	let obj = e.detail;
	sendFileResult.result = (obj.data.client_msg_id!="" && obj.data.id!="") ? "success" : "fail"; 
	sendFileResult.data=obj.data;
});

addEventListener(document, 'FaceBookPost', function (e){
	let obj = e.detail;
	triggerEvent(window.parent.document, 'onWiseFBPost', {ticket_id: obj.ticket_id, message: obj.message });
});

addEventListener(document, 'SameLevelReply', function (e){
	//
});

addEventListener(document, 'RecvInvAgentToChat', function (e){
	let obj = e.detail;
	triggerEvent(window.parent.document, 'onWiseRecvInvAgentToChat', obj);
});
// when agent got message from invited agent
addEventListener(document, 'RecvShortMsg_UC', function (e){
	let obj = e.detail;
	let msg=obj.ShortMsg;
	if(msg=="@sys-response@intercom-N") {
		alert("Agent rejected to answer intercom call.");
	} 
	else
		triggerEvent(window.parent.document, 'onWiseRecvShortMsg_UC', obj);
});
// when agent be invited to a conference
addEventListener(document, 'ClientMsgID', function (e){
	let obj = e.detail;
	triggerEvent(window.parent.document, 'onWiseClientMsgID', obj);
});

addEventListener(document, 'ACDGroupInfo', function (e){
	let obj = e.detail;
	triggerEvent(window.parent.document, 'onWiseACDGroupInfo', obj);
});

addEventListener(document, 'ACDGroupMember', function (e){
	let obj = e.detail;
	for (let member of obj.Member)
	{
        member.Status = agentStatus[obj.member.StatusID];
	}
	if(acdGroupMemberBy=="WiseGetAgentList")
		triggerEvent(window.parent.document, 'onWiseAgentList', obj);
	else
		triggerEvent(window.parent.document, 'onWiseACDGroupMember', obj);
	acdGroupMemberBy="";
});

addEventListener(document, 'LogonAgentEx ', function (e){
	let obj = e.detail;
	obj.Member =obj.Agentlist.slice();
	console.log(obj.Member);
    for (let member of obj.Member)
	{
        member.Status = agentStatus[member.StatusID];
		// NO DEL, please define agentStatusBreak object if needed
		// if(obj.Member[i].StatusID==STATUS_BREAK){
		// 	theMember.Status=agentStatusBreak[theMember.subStatusID];
		// } else { theMember.Status=agentStatus[theMember.StatusID]; }
		// /NO DEL
	}	
	triggerEvent(window.parent.document, 'onWiseAgentList', obj);
});

addEventListener(document, 'WCCustomerParameter', function (e){
	let obj = e.detail;
	triggerEvent(window.parent.document, 'addAdditionalInfo', obj);
});

addEventListener(document, 'WCCustomerReadMsg', function (e){
	let obj = e.detail;
	triggerEvent(window.parent.document, 'onWiseReadMsg', obj);
});

addEventListener(document, 'SendTemplateMsg', function (e){
	let obj=e.detail;
    if (jQuery.isEmptyObject(templateMsgResult)) {
		templateMsgResult=jQuery.extend({}, obj);
	} else {
		templateMsgResult.resultID=obj.resultID
		templateMsgResult.msg=obj.msg;
	}
	templateMsgResultEx.push(obj.ticket_id);
});

addEventListener(document, 'AddAgentCallQueue', function (e){
	let obj = e.detail;
	directCalls.push(obj.ConnID);
	window.parent.$("#panel-direct-count").css("background","blue");
	window.parent.$("#direct-count-text").text("Queue: " + String(directCalls.length));
});

addEventListener(document, 'RemoveAgentCallQueue', function (e){
	let obj = e.detail;
	directCalls=directCalls.filter( function(e){
		return e !=obj.ConnID;
	});
	if (directCalls.length==0)
		window.parent.$("#panel-direct-count").css("background","");
	else
		window.parent.$("#panel-direct-count").css("background","blue");
	window.parent.$("#direct-count-text").text("Queue: " + String(directCalls.length));
});
	
function EncodeTime(t)
{
	
	let s = "0" + t%60;
	let m = "" + parseInt(t/60);
	if (m.length==1) m ="0" + m;
	//else if ( m.length>3) m="+999";
	
	return m +":" + s.slice(-2);
}

function Sound(source,volume,loop)
{
    this.source=source;
    this.volume=volume;
    this.loop=loop;
    let son;
    this.son=son;
    this.finish=false;
    this.stop=function()
    {
        document.body.removeChild(this.son);
    }
    this.start=function()
    {
        if(this.finish)return false;
        this.son=document.createElement("embed");
        this.son.setAttribute("src",this.source);
        this.son.setAttribute("hidden","true");
        this.son.setAttribute("volume",this.volume);
        this.son.setAttribute("autostart","true");
        this.son.setAttribute("loop",this.loop);
		this.son.setAttribute("enablejavascript","true");
        document.body.appendChild(this.son);
    }
    this.remove=function()
    {
		if (this.son==undefined) return;
		document.body.removeChild(this.son);
        this.finish=true;
    }
    this.init=function(volume,loop)
    {
        this.finish=false;
        this.volume=volume;
        this.loop=loop;
    }
}

let oldStatus="";
function agentStatusTicker()
{
	if (userMode != oldStatus) {
		oldStatus = userMode;
		document.getElementById('panelTimeCount').innerHTML="00:01";
		try {
			parent.document.getElementById('panel-time-count').innerHTML="00:01";
		} catch(err) {
			console.log(err.message);
		}
    }
	else
	{
		let s=document.getElementById('panelTimeCount').innerHTML.split(":");
		let t= parseInt(s[0])*60 + parseInt(s[1]) + 1;
		document.getElementById('panelTimeCount').innerHTML=EncodeTime(t);

		try {
			s=parent.document.getElementById('panel-time-count').innerHTML.split(":");
			t= parseInt(s[0])*60 + parseInt(s[1]) + 1;
			parent.document.getElementById('panel-time-count').innerHTML=EncodeTime(t);
		} catch(err) {
			console.log(err.message);
		}
	}
}

function updateQueueTicker()
{
	window.clearInterval(updateQueueTimer);
	for(let service of serviceList) {
		if ( service.callType== CATY_EMAIL || service.callType==CATY_VMAIL || service.callType==CATY_FAX) {
			if(queueList.filter(function (v) { return v.callType==service.callType && v.dnis==service.dnis }).length==0) {
				let link = "";
				switch (service.callType) {
					case CATY_EMAIL: link = config.wiseUrl + "/api/Email/GetCount"; break;
					case CATY_VMAIL: link = config.wiseUrl + "/api/Vmail/GetCount"; break;
					case CATY_FAX: link = config.wiseUrl + "/api/Fax/GetCount"; break;
				}
				/*	Tiger 2025-04-10
				if (service.callType==CATY_EMAIL) 
					link= config.wiseUrl+"/api/Email/GetCount";
				else if (service.callType==CATY_VMAIL) 
					link= config.wiseUrl+"/api/Vmail/GetCount";
                else if (service.callType==CATY_FAX) 
					link= config.wiseUrl+"/api/Fax/GetCount";
				*/
				if (link!=""){
					$.ajax({
						type: "POST",
						async : true,
						url: link,
                        data: JSON.stringify({ "dnis": service.dnis, "agentId": loginId}),
						contentType: "application/json; charset=utf-8",
						dataType: "json",
                        service: service,
						success: function (r) {
							let mediaCount = r.data;
							if (mediaCount >0) {
								let q={callType: this.service.callType, acdGroup : this.service.acdGroup, name: this.service.name, caption : this.service.caption,
									dnis: this.service.dnis, showPriority : this.service.showPriority, waitTime: 0, waitCount : 0,
									mediaCount: mediaCount};
								queueList.push(q);
								queueList.sort(function (a,b) { let e =a.showPriority -b.showPriority; if(e==0) return (b.waitTime-a.waitTime); else return e; });
								showQueueList();
							}
						},
						error: function (r) {
							console.log(r);
						}
					});
				}
			}
		}
	}
	updateQueueTimer=window.setInterval ("updateQueueTicker()",60000,"javascript");
}

function inboundQueueTicker()
{
	let isQueue =false;
	for (let service of serviceList) {
		if($("#inboundQueue_"+service.name).text()!="0" && $("#inboundQueue_"+service.name).text()!="") {
			isQueue = true;
			break;
		}
	}
	//Tiger ringAudio=document.getElementById("ringAudio");
	if (isQueue) {
		if (noRingStatuses.indexOf(userMode)==-1){
			ringAudio.play();
		}
	}
    else if (!ringAudio.ended) {
		ringAudio.pause();
		ringAudio.currentTime =0;
	}
	
}

function readyToAnswer(name)
{
	if($("#inboundQueue_"+ name).text()=="0") return;
	try {
		parent.document.getElementById('phone-panel-no').value = '';
	} catch(err) {
		console.log(err);
	}
	$("#panelPhoneNo").text("");
    let service = serviceList.find(function (v) { return v.name===name });
    wsWiseAgent.BindToACDGroup(service.acdGroup);
	setTimeout(function (){wsWiseAgent.Ready();},500);
	
}

function wiseReadyToTalk() {
	wsWiseAgent.BindToACDGroup(0);
	setTimeout(function (){wsWiseAgent.Ready();},500);
}

function wiseIdleMode() {
	if(userMode == "READY") wsWiseAgent.Break();
	wsWiseAgent.Idle();
}

function wiseBreakMode() {
	if(userMode != "IDLE") wsWiseAgent.Idle();
	wsWiseAgent.Break();
}

function toggleReadyIdle() {
	if(userMode == "READY") { // Ready -> Idle
		wsWiseAgent.Break();
		wsWiseAgent.Idle();
	} else {
		wsWiseAgent.BindToACDGroup(0); // -> Ready
		setTimeout(function (){wsWiseAgent.Ready();},500);
	}
}

async function acceptCall(callType, acdGroup, entry, oThis)
{
	$("#softPhone").css("cursor");
	if($("#softPhone").css("cursor")=="wait") {
		alert("Waiting Wise accept call/messasge !!");
		return;
	}
	let service = serviceList.find(function (v) { return v.callType==callType && v.acdGroup==acdGroup });
    if (service==undefined) return;	
	
	if(callType==CATY_INDB) {
        if ($("#inboundQueue_" + service.name).text()=="0") return;
		
		setTimeout(function (p){wsWiseAgent.BindToACDGroup(p.acdGroup);wsWiseAgent.Ready();}.bind(this, {acdGroup : acdGroup}),100);
		$("#softPhone").css("cursor", "wait");
		$("#queueListBar").find("[id*='QueueCount1']").css("cursor","wait");
		setTimeout(function() {
			$("#softPhone").css("cursor", "default");
			$("#queueListBar").find("[id*='QueueCount1']").css("cursor","pointer");
			if(userMode != "TALK" && userMode!="IDLE") wsWiseAgent.Idle();
		},500);
	} else {
		let rCalltype = getCallType(callType, entry);
		/*	Tiger 2025-04-10
		if (callType==CATY_BLOG && entry=="wechat") rCalltype=CATY_WECHAT;
		else if (callType==CATY_BLOG && entry=="whatsapp") rCalltype=CATY_WHATSAPP;
		else if (callType==CATY_BLOG && entry=="fbmsg") rCalltype=CATY_FBMSG;
		else if (callType==CATY_BLOG && entry=="fbpost") rCalltype=CATY_FBPOST;
		*/
		let layout=queueLayout[rCalltype];
		
        let miqCount = $("#" + layout.prefix + "QueueCount1_" + service.name).text();
		if(miqCount!="0") {
			if (userMode == "WORKING") {
				wsWiseAgent.Idle();
				setTimeout(function (p) { wsWiseAgent.AcceptMediaCallEx(DEVICE_ACDGROUP, p.acdGroup, p.callType); }.bind(this, { acdGroup: acdGroup, callType: callType }), 500);
				return;
			} else {
				wsWiseAgent.AcceptMediaCallEx(DEVICE_ACDGROUP, acdGroup, callType);
			}

			$("#softPhone").css("cursor", "wait");
			$("#queueListBar").find("[id*='QueueCount1']").css("cursor","wait");
			setTimeout(function() {
				$("#softPhone").css("cursor", "default");
				$("#queueListBar").find("[id*='QueueCount1']").css("cursor","pointer");
				if(userMode != "TALK" && userMode!="IDLE") wsWiseAgent.Idle();
			},500);
		
			while (wsWiseAgent.commandResult['160']==undefined) {
				await sleep(100);
			}
			if (wsWiseAgent.commandResult['160'] == "success") { 
				setTimeout(function (p) {
					getMediaCount(p.callType, p.dnis, loginId);
					if (oThis) {
						$(oThis).siblings().first().click();
					}
				}.bind(this, { callType: service.callType, dnis: service.dnis }), 1000);
			}
		}
		//Tiger 2020-6-2
		//try {if(miqCount=="0"){window.parent.connClick(0,c[0].name,channels[callType],c[0].dnis,null)}else{setTimeout(function(){window.parent.connClick(0,c[0].name,channels[callType],c[0].dnis,null)},1000)}} catch(err){ console.log(err.message); }
	}
	/*
	} else if(callType==CATY_EMAIL) {
		if($("#emailQueue_"+ name).text()=="0") return;
		if(userMode=="WORKING") {
			wsWiseAgent.Idle();
			setTimeout(function (p){wsWiseAgent.AcceptMediaCallEx (DEVICE_ACDGROUP, p.acdGroup, p.callType);}.bind(this, {acdGroup : c[0].acdGroup, callType: callType}),500);
		} else
			wsWiseAgent.AcceptMediaCallEx (DEVICE_ACDGROUP, c[0].acdGroup, callType);
	} else if(callType==CATY_VMAIL) {
		if($("#vmailQueue_"+ name).text()=="0") return;
		if(userMode=="WORKING") {
			wsWiseAgent.Idle();
			setTimeout(function (p){wsWiseAgent.AcceptMediaCallEx (DEVICE_ACDGROUP, p.acdGroup, p.callType);}.bind(this, {acdGroup : c[0].acdGroup, callType: callType}),500);
		} else
			wsWiseAgent.AcceptMediaCallEx (DEVICE_ACDGROUP, c[0].acdGroup, callType);
	} else if(callType==CATY_FAX) {
		if($("#faxQueue_"+ name).text()=="0") return;
		if(userMode=="WORKING") {
			wsWiseAgent.Idle();
			setTimeout(function (p){wsWiseAgent.AcceptMediaCallEx (DEVICE_ACDGROUP, p.acdGroup, p.callType);}.bind(this, {acdGroup : c[0].acdGroup, callType: callType}),500);
		} else
			wsWiseAgent.AcceptMediaCallEx (DEVICE_ACDGROUP, c[0].acdGroup, callType);
	}
	*/
}
function showQueueList()
{
	$("#queueListBar").css("display", "none");
	$("#queueListBar").empty();
	
    for (let queue of queueList)
	{
		let rCalltype = getCallType(queue.callType, queue.entry);
		/*	Tiger 2025-04-10
		if (queue.callType==CATY_BLOG && queue.entry=="wechat") rCalltype=CATY_WECHAT;
		else if (queue.callType==CATY_BLOG && queue.entry=="whatsapp") rCalltype=CATY_WHATSAPP;
		else if (queue.callType==CATY_BLOG && queue.entry=="fbmsg") rCalltype=CATY_FBMSG;
		else if (queue.callType==CATY_BLOG && queue.entry=="fbpost") rCalltype=CATY_FBPOST;
		*/
		let layout=queueLayout[rCalltype];
		
		let objDiv=document.createElement("div");
		
		//20250422 for shandler logic
		if (queue.source != null && queue.waitCount < 1 && (!testMode)) {
			objDiv.setAttribute("style", "display:none;margin:5px 0px 0px 5px;box-shadow: 0 2px 4px 0 rgba(0,0,0,.14);border-radius: 3px;transition:.3s;background:#ffff;width:130px;height:80px;color:" + layout.color);
		}
		else {
			objDiv.setAttribute("style", "display:inline-block;margin:5px 0px 0px 5px;box-shadow: 0 2px 4px 0 rgba(0,0,0,.14);border-radius: 3px;transition:.3s;background:#ffff;width:130px;height:80px;color:" + layout.color);
		}
		
		let objDiv_Img=document.createElement("div");
		objDiv_Img.setAttribute("style","display:inline-block;top:-5px;margin-left:10px;position:absolute;width:30%") ;
		
		let objImg = document.createElement("img");
		objImg.setAttribute("style",layout.style);
		objImg.src=layout.image;
		objDiv_Img.appendChild(objImg);
		
		objDiv.appendChild(objDiv_Img);
		
		
		let objQueueName = document.createElement("p");
		objQueueName.setAttribute("style","display:inline-block;position:relative;text-align:right;margin:2px 0 0 -5px;width:100%");
		objQueueName.innerHTML = queue.caption;
		objDiv.appendChild(objQueueName);
		
		let objQueueTime = document.createElement("p");
		objQueueTime.setAttribute("style","display:inline-block;position:relative;text-align:right;margin:2px 0 0 -5px;width:100%;font-size:18px;color:#848484");
		objQueueTime.setAttribute("id",layout.prefix +"QueueTime_" + queue.name);
        objQueueTime.innerHTML = (queue.waitCount == 0) ? "00:00" : EncodeTime(queue.waitTime);
		objDiv.appendChild(objQueueTime);
		
		let objDivQueue=document.createElement("div");
		objDivQueue.setAttribute("class","queue_subcontent2");
		
		let objQueueCount1 = document.createElement("div");
		if($("#softPhone").css("cursor")=="wait")
			objQueueCount1.setAttribute("style","display:inline-block;float:left;text-align:left;margin-left:5px;width:30%;border:2px solid #fff;color:#848484;cursor:wait;");
		else
			objQueueCount1.setAttribute("style","display:inline-block;float:left;text-align:left;margin-left:5px;width:30%;border:2px solid #fff;color:#848484;cursor:pointer;");
			
		objQueueCount1.setAttribute("id",layout.prefix +"QueueCount1_" + queue.name);
		objQueueCount1.textContent = queue.waitCount;

		//20250422 for chatroom upgrade
		//objQueueCount1.setAttribute("onclick", "acceptCall(" + queue.callType + "," + queue.acdGroup + ",'" + queue.entry + "',this);");
		if (queue.source != "sleekflow") {
			objQueueCount1.setAttribute("onclick", "acceptCall(" + queue.callType + "," + queue.acdGroup + ",'" + queue.entry + "',this);");
		} else {
			objQueueCount1.setAttribute("onclick", "acceptCall_Shandler(" + loginId + ",'" + top.token + "','" + queue.entry + "','" + queue.dnis + "');");
			//objQueueCount1.setAttribute("onclick", "acceptCall_test()");
		}

		
		objDivQueue.appendChild(objQueueCount1);

		if (queue.callType == CATY_EMAIL || queue.callType == CATY_VMAIL || queue.callType == CATY_FAX) {
			let objQueueCount2 = document.createElement("div");
			objQueueCount2.setAttribute("id", layout.prefix + "QueueCount2_" + queue.name);
			let mystyle = "float:right;text-align:center;margin-right:5px;border:2px solid #eee;border-radius:3px;width:30%;cursor:pointer;";
			if (queue.mediaCount == 0) mystyle+="display:none;"
			objQueueCount2.setAttribute("style", mystyle);
			objQueueCount2.setAttribute("onclick", "setTimeout(function() {getMediaCount("+ queue.callType + ",'"+ queue.dnis +"', "+ loginId +");},1200);" );
			objQueueCount2.textContent = queue.mediaCount;
			
			objDivQueue.appendChild(objQueueCount2);
		} 
		
		objDiv.appendChild(objDivQueue);
		objDiv.setAttribute("id",layout.prefix +"Queue_" + queue.name);
		queueListBar.appendChild(objDiv);
	}
	
	$("#queueListBar").css("width", queueList.length*135);
	$("#queueListBar").css("display", "inline-block");
	
}

function queueTimeTicker()
{
    for (let queue of queueList)
	{
		let rCalltype = getCallType(queue.callType, queue.entry);
		let layout=queueLayout[rCalltype];
		
		let idCount=layout.prefix+ "QueueCount1_" + queue.name;
		if ($("#"+ idCount).text()>0) {
			let idTime=layout.prefix+ "QueueTime_" + queue.name;
			let s=$("#"+ idTime).html().split(":");
			queue.waitTime= parseInt(s[0])*60 + parseInt(s[1]) + 1;
            document.getElementById(idTime).innerHTML = EncodeTime(queue.waitTime);
		}
	}
}
function initMediaCount()
{
    for (let service of serviceList)
	{
		//if([CATY_EMAIL ,CATY_VMAIL, CATY_FAX].indexOf(serviceList[i].callType)!=-1)
        if (service.callType == CATY_EMAIL || service.callType == CATY_VMAIL || service.callType==CATY_FAX) 
		{
            getMediaCount(service.callType, service.dnis, loginId);
		}
	}
	
}

function getMediaCount(callType,dnis, agentId)
{
	let link="";
	if (callType==CATY_EMAIL)
		link =config.wiseUrl+"/api/Email/GetCount";
	else if (callType==CATY_VMAIL)
		link =config.wiseUrl+"/api/Vmail/GetCount";
	else if (callType==CATY_FAX)
		link =config.wiseUrl+"/api/Fax/GetCount";
	
	if (link=="") return;
	
	$.ajax({
		type: "POST",
		url: link,
		data: JSON.stringify({"dnis" : dnis, "agentId": agentId}),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (r) {
			
			if (r.result=="success"){
				showMediaCount(callType, dnis,parseInt(r.data));
			}
		},
		error: function (r) {
			console.log(r);
		},
	});
}
function showMediaCount(callType,dnis,mediaCount)
{
	
	let idxServiceList = serviceList.findIndex(function (v) { return v.callType==callType && v.dnis==dnis});
	
	let idxQueueList = queueList.findIndex(function (v) { return v.callType==callType && v.dnis==dnis});
	if (idxQueueList ==-1) {
		let service=serviceList[idxServiceList];
		if (mediaCount!=0) {
			let q={callType: parseInt(callType), acdGroup : service.acdGroup, name: service.name, caption : service.caption,
				dnis: service.dnis, showPriority : service.showPriority, waitTime: 0, waitCount : 0,
				mediaCount: mediaCount};
			queueList.push(q);
		}
	} else if (idxQueueList >= 0) {
		if(queueList[idxQueueList].waitCount==0 && mediaCount==0) 
			queueList.splice(idxQueueList,1);
		else {
			queueList[idxQueueList].mediaCount=mediaCount;
		}
	}
	queueList.sort(function (a,b) { let e =a.showPriority -b.showPriority; if(e==0) return (b.waitTime-a.waitTime); else return e; });
	showQueueList();
}

function updateMediaCount(callType,dnis,checkCount)
{
	checkCount = checkCount || -1;
	
	let url;
	if (callType==CATY_EMAIL) 
		url= config.wiseUrl+"/api/Email/GetCount";
	else if (callType==CATY_VMAIL) 
		url= config.wiseUrl+"/api/Vmail/GetCount";
	else if (callType==CATY_FAX) 
		url= config.wiseUrl+"/api/Fax/GetCount";
		
	$.ajax({
		type: "POST",
		url: url,
		data: JSON.stringify({"dnis" : dnis, "agentId": loginId}),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (r) {
			if (r.result=="success"){
				let mediaCount = parseInt(r.data);
				let idx = queueList.findIndex(function (v) { return v.callType==callType && v.dnis==dnis});
				if (idx==-1) {
					if (mediaCount!=0) {
						let service = serviceList.findIndex(function (v) { return v.callType==callType && v.dnis==dnis});
						//tiger 2025-04-10 if (!service) return;
						let q={callType: parseInt(callType), acdGroup : service.acdGroup, name: service.name, caption : service.caption,
							dnis: service.dnis, showPriority : service.showPriority, waitTime: 0, waitCount : 0,
							mediaCount: mediaCount};
						queueList.push(q);
						queueList.sort(function (a,b) { 
							let e =a.showPriority-b.showPriority; 
							if(e==0) e = b.waitTime-a.waitTime; else return e; 
							return e;
						});
						showQueueList();
						
					}
				}
				else
				{
					if(checkCount>0 && queueList[idx].mediaCount==mediaCount) {
						setTimeout(function (p)
						{
							updateMediaCount(p.callType, p.dnis, p.checkCount);
						}.bind(this, { callType: callType, checkCount: checkCount - 1 }), 500);
						return;
					}
					
					let rCalltype = getCallType(queueList[idx].callType, queueList[idx].entry) ;
					let layout=queueLayout[rCalltype];
					
					queueList[idx].mediaCount = mediaCount;
					if (queueList[idx].waitCount + queueList[idx].mediaCount == 0) {
						$("#" + layout.prefix + "Queue_" + queueList[idx].name).remove();
						queueList.splice(idx, 1);
					} else {
						let idCount2 = layout.prefix + "QueueCount2_" + queueList[idx].name;
						$("#" + idCount2).text(mediaCount);
					}

					/*	Tiger 2025-04-10
					let idCount1 =layout.prefix+"QueueCount1_" + queueList[idx].name;
					if($("#" + idCount1).text()=="0" && mediaCount==0) {
						$("#" + layout.prefix+"Queue_" + queueList[idx].name).remove();
						queueList.splice(idx,1);
					} else {
						let idCount2 =layout.prefix+"QueueCount2_" + queueList[idx].name;
						$("#" + idCount2).text(mediaCount);
					}
					*/
				}
			}
		},
		error: function (r) {
			console.log(r);
		},
	});
}

function wiseGetServiceInfo(serviceName)
{
	let r = [];
	for (let service of serviceList.filter(function (v) { return v.name == serviceName})) {
        let info = { channel: channels[service.callType], dnis: service.dnis};
		r.push(info);
	}
	return r;
}

function wiseMakeCall(serviceName,phoneNo)
{
	try {
		if (phoneNo==null)
			phoneNo=parent.document.getElementById('phone-panel-no').value;
		else
			parent.document.getElementById('phone-panel-no').value = phoneNo;
	} catch(err) {
		if (phoneNo==null)
			phoneNo=document.getElementById('panelPhoneNo').value;
		else
			document.getElementById('panelPhoneNo').value = phoneNo;
	}
	let ANI = (serviceName==null)? CallANI : outboundANI[serviceName].call;
	if (userMode == "WORKING") {
		wsWiseAgent.Idle();
		currCallInfo.lastCallType = 0;
		currCallInfo.lastCallID = 0;
		currCallInfo.confCallID = 0;
		currCallInfo.vbotCaseNo = '';
        currCallInfo.callSeq = [];
		setTimeout(function (){wsWiseAgent.DialOut (phoneNo,ANI);},500);
	}
	else if (userMode == "IDLE") {
        currCallInfo.lastCallType = 0;
        currCallInfo.lastCallID = 0;
        currCallInfo.confCallID = 0;
        currCallInfo.vbotCaseNo = '';
        currCallInfo.callSeq = [];
		wsWiseAgent.DialOut (phoneNo,ANI);
	}
	else if (userMode == "HOLD") {
		wsWiseAgent.DialOut (phoneNo,ANI);
	}
	
}
function wiseMakeCallEx(ANINo,phoneNo,vbotCaseNo='')
{
	if(ANINo==null) ANINo=CallANI;
	if (userMode == "WORKING") {
		wsWiseAgent.Idle();
        currCallInfo.lastCallType = 0;
        currCallInfo.lastCallID = 0;
        currCallInfo.confCallID = 0;
        currCallInfo.vbotCaseNo = '';
        currCallInfo.callSeq = [];
		setTimeout(function (){wsWiseAgent.DialOut (phoneNo,ANINo);},500);
	}
	else if (userMode == "IDLE") {
        currCallInfo.lastCallType = 0;
        currCallInfo.lastCallID = 0;
        currCallInfo.confCallID = 0;
        currCallInfo.vbotCaseNo = '';
        currCallInfo.callSeq = [];
		wsWiseAgent.DialOut (phoneNo,ANINo);
	}
	else if (userMode == "HOLD") {
		wsWiseAgent.DialOut (phoneNo,ANINo);
	}
}
function wiseDropCall()
{
	if (userMode == "TALK" || userMode == "DIALING") 
		wsWiseAgent.Hangup();
	else if (userMode != "IDLE") 
		wsWiseAgent.Idle();
}

function wiseHoldCall()
{
	if (userMode=="TALK") {
		wsWiseAgent.Hold();
		let parentholdBtn = parent.$("#icon-line-1")
		parentholdBtn.attr("title", "Unhold Call");
		parentholdBtn.find('i').removeClass('fa-pause').addClass('fa-play');
	} else if (userMode=="HOLD") {
		wsWiseAgent.Unhold(0);
	}
}
function wiseMakeConference()
{
	if (confConnID!=0) {
		alert("conference call was created.");
		return;
	}
	
	if(confConnID==0) {
        if (holdingConnIDs.length!=0) {
			isMakeConf=true;
            wsWiseAgent.CreateConference(holdingConnIDs[holdingConnIDs.length-1]);
		}
	} 
	else {
		wsWiseAgent.AddMemberToConference(confConnID);
	}
	
}

function wiseTransferCall(msg)
{
	if (msg==null) msg="";
	wsWiseAgent.TransferCall(0,msg);
}

function wiseCallAgent(agentNo)
{
	try {
		if (agentNo==null)
			agentNo=parent.document.getElementById('phone-panel-no').value;	
	} catch(err) {
		if (agentNo==null)
			agentNo=document.getElementById('panelPhoneNo').value;
	}
	wsWiseAgent.DialAgent(agentNo);
}

function wiseSendDTMF(val)
{
	if (userMode=="TALK") {
		wsWiseAgent.SendDTMFTone(val);
	}
}

function wiseAnswerTicket(ticketId)
{
	if(ticketId=="") return;
	wsWiseAgent.UpdateTicket(ticketId);
}

function wiseGetTicketMsg(ticketId)
{
	if(ticketId=="") return;
	wsWiseAgent.GetTicketMsg(ticketId);
} 

function wiseTerminalTicket(ticketId)
{
	if(ticketId=="") return;
	let idx = ticketList.findIndex(function (v) { return v.ticket_id==ticketId});
	if(idx!=-1) ticketList.splice(idx,1);
	wsWiseAgent.CompleteTicket(ticketId);
}

function wiseCompleteTicket(ticketId)
{
	wsWiseAgent.CompleteTicket(ticketId);
}

function wiseAssignToChatRoom(ticket_id, assign_to, action)
{
	wsWiseAgent.AssignToChatRoom(ticket_id, assign_to, action);
}

async function wiseSendSocialMsg_Ex(ticketId, msgText, completedMsgIdList, callback, msgId)
{
	if(ticketId=="") return;
	sendMsgResult.result="";
    sendMsgResult.data={};
	let ticket = ticketList.find(function (v) { return v.ticket_id == ticketId });
    if (ticket.entry == "fb_comment" || ticket.entry == "fb_post") {
        if (msgId == -1) {
            wsWiseAgent.SendMsgToConnector(ticketId, -1, completedMsgIdList, msgText);
        } else {
            for (let messageId of completedMsgIdList) {
                wsWiseAgent.SendMsgToConnector(ticketId, messageId, [messageId], msgText);
            }
        }
    } else {
        wsWiseAgent.SendMsgToConnector(ticketId, 0, [0], msgText);
    }
    while (sendMsgResult.result == "") {
        await sleep(100);
	}
    callback(sendMsgResult);
}

function wiseSendSocialMsg(ticketId, msgText, completedMsgIdList)
{
	if(ticketId=="" || msgText=="") return;
	let ticket=ticketList.filter(function (v) {return v.ticket_id==ticketId })[0];
	
	if (ticket.entry=="fb_comment"||ticket.entry=="fb_post") {
        for (let msgId of completedMsgIdList) {
			wsWiseAgent.SendMsgToConnector(ticketId, msgId, [msgId], msgText);
		}
	} else {
		wsWiseAgent.SendMsgToConnector(ticketId, 0,[0],msgText);
	}
    
}

function wiseGetFBPost(ticketId)
{
	wsWiseAgent.GetFaceBookPost(loginId,ticketId);
}

function wiseUploadSocialFile(ticketId, fileId, callback)
{
	let _fileUpload = $("#" + fileId).get(0);
	let _fileData = new FormData();
	for (let file of _fileUpload.files) {
        fileData.append("files", file);  
	}
		
    _fileData.append('ticketId', ticketId);    
	_fileData.append('agentId', loginId);  
	
	$.ajax({  
		url: config.wiseUrl+'/api/SocialMedia/UploadFile',  
		type: "POST",  
		contentType: false, // Not to set any content header  
		processData: false, // Not to process data  
		dataType: 'json',
		data: _fileData,  
		success: function (r) {
			if (typeof callback === "function") { callback(r.data); }
		},  
		error: function (err) {  
			console.log(err);  
		}  
	});  
}

async function wiseSendSocialFile_Ex(ticketId, filePath, completedMsgIdList, callback)
{
    sendFileResult.result="";
    sendFileResult.data={};
	let ticket = ticketList.filter(function (v) { return v.ticket_id == ticketId })[0];
    if (ticket.entry == "fb_comment" || ticket.entry == "fb_post") {
        for (let msgId of completedMsgIdList) {
            wsWiseAgent.SendFileToConnector(ticketId, msgId, [msgId], filePath);
        }
    } else {
        wsWiseAgent.SendFileToConnector(ticketId, 0, [0], filePath);
	}
    while (sendFileResult.result == "") {
        await sleep(100);
    }
    callback(sendFileResult);
}

function wiseSendSocialFile(ticketId, filePath, completedMsgIdList)
{
	
	
	let ticket=ticketList.filter(function (v) {return v.ticket_id==ticketId })[0];
	if (ticket.entry=="fb_comment"||ticket.entry=="fb_post") {
        for (let msgId of completedMsgIdList) {
			wsWiseAgent.SendFileToConnector(ticketId, msgId,[msgId],filePath);
		}
	} else {
		wsWiseAgent.SendFileToConnector(ticketId, 0,[0],filePath);
	}
}

function wiseSetMediaHandled(channel, mediaId, caseNo)
{
	let _callType= parseInt(Object.keys(channels)[Object.keys(channels).map(key => channels[key]).indexOf(channel)]);
	if (isNaN(_callType)) return;
	
	let _link="";
	if( _callType==CATY_EMAIL)
		_link= config.wiseUrl+"/api/Email/SetHandled";
	else if( _callType==CATY_VMAIL)
		_link= config.wiseUrl+"/api/Vmail/SetHandled";
	else if( _callType==CATY_FAX)
		_link= config.wiseUrl+"/api/Fax/SetHandled";
	if(_link=="") return;		
	$.ajax({
		type: "POST",
		url: _link,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: JSON.stringify({"callType" : _callType, "mediaId" : mediaId, "caseNo": caseNo, "updatedBy": loginId}),
		success: function (r) {
			let _dnis= r.data;
			updateMediaCount(_callType,_dnis,10);
		},
		error: function (r) {
			console.log(r);
		},
	});
		
}

function wiseAssignAgent(channel, mediaIds, assignTo, callback)
{
	let _callType= parseInt(Object.keys(channels)[Object.keys(channels).map(key => channels[key]).indexOf(channel)]);
	if (isNaN(_callType)) return;
	let _link="";
	if( _callType==CATY_EMAIL)
		_link= config.wiseUrl+"/api/Email/AssignAgent";
	else if( _callType==CATY_VMAIL)
		_link= config.wiseUrl+"/api/Vmail/AssignAgent";
	else if( _callType==CATY_FAX)
		_link= config.wiseUrl+"/api/Fax/AssignAgent";
	if(_link=="") return;	
	$.ajax({
		type: "POST",
		url: _link,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: JSON.stringify({"mediaIds" : mediaIds, "assignTo": assignTo, "updatedBy": loginId}),
		success: function (r) {
            let _dnisArray = $.unique(r.data.map(function (d) {return d.dnis;}));
			for (let _dnis of _dnisArray) {
				updateMediaCount(_callType, _dnis,10);
			}
			if (typeof callback === "function") { callback(); }
		},
		error: function (r) {
			console.log(r);
		},
	});
		
}

function wiseGetAgentName(agentIds, callback)
{
	$.ajax({
		type: "POST",
		url: config.wiseUrl+"/api/SocialMedia/GetAgentName",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: JSON.stringify({"agentIds" : agentIds}),
		success: function (r) {
			if(r.result=="success") {
				if (typeof callback === "function") { callback(r.data); }
			}
		},
		error: function (r) {
			console.log(r);
		},
	});
		
}

function wiseSendSMS(serviceName, phoneNo, shortMsg)
{
	let _returnJson;
	_returnJson = JSON.parse( $.ajax({
		type: "POST",
		async: false,
		url: config.wiseUrl+"/api/Outbound/CreateCaseId",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: JSON.stringify({"agentId": loginId}),
	}).responseText);
	
	let _mediaCaseId=-1;
	if(_returnJson.result=="success")
		_mediaCaseId = _returnJson.data ;
	else {
		if(_returnJson.result=="fail") console.log(_returnJson.details);
		return -1;
	}
	let smsANI = outboundANI[serviceName].sms;
	wsWiseAgent.SendSMS_UC(phoneNo,smsANI, _mediaCaseId, "", shortMsg );
	
	_returnJson = JSON.parse( $.ajax({
		type: "POST",
		async: false,
		url: config.wiseUrl+"/api/Outbound/GetCallId",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: JSON.stringify({"callType": CATY_OUTSMS, "caseId" : _mediaCaseId, "agentId": loginId}),
	}).responseText);
	
	if(_returnJson.result=="success")
		return _returnJson.data;
	else {
		if(_returnJson.result=="fail") console.log(_returnJson.details);
		return -1;
	}
}
function wiseInviteAgentToChat(agentId, ticketId, msgContent)
{
	wsWiseAgent.InviteAgentToChat(agentId, ticketId, msgContent);
}
function wiseSendMessage_UC(DeviceType, DeviceID, Message)
{
	wsWiseAgent.SendMessage_UC(DeviceType, DeviceID, Message);
}
function wiseSendCSInputtingState(ticketId) {
	wsWiseAgent.SendCSInputtingState(loginId, ticketId);
}
function sleep(ms) {
   return new Promise(function (res) {
      setTimeout(res, ms);
   });
};

function wiseSendEmail(serviceName, emailTo, emailCc, emailSubject, emailContent, attachedFiles)
{
	
	let _returnJson;
	_returnJson = JSON.parse( $.ajax({
		type: "POST",
		async: false,
		url: config.wiseUrl+"/api/Outbound/CreateCaseId",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: JSON.stringify({"agentId": loginId}),
	}).responseText);
	
	let _mediaCaseId=-1;
	if(_returnJson.result=="success")
		_mediaCaseId = _returnJson.data ;
	else {
		if(_returnJson.result=="fail") console.log(_returnJson.details);
		return -1;
	}
	
	_returnJson =JSON.parse( $.ajax({
		type: "POST",
		async: false,
		url: config.wiseUrl+"/api/Email/UploadContent",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: JSON.stringify({"content": emailContent, "agentId": loginId}),
	}).responseText);
	let _filePath;
	if(_returnJson.result=="success") {
		_filePath=_returnJson.data.filePath;
	} else {
		console.log(_returnJson.details);
		return -1;
	}
	
	let emailFrom = outboundANI[serviceName].email;
	wsWiseAgent.SendEmail_UC({
		"Recipient": emailTo,
		"CC": emailCc,
		"BCC": "",
		"Sender": emailFrom,
		"Subject": emailSubject,
		"AttachedFile": attachedFiles ,
		"CaseID": _mediaCaseId,
		"ANI": emailFrom,
		"BodyType": 3,
		"ContentMsg": _filePath
	});
	
	_returnJson = JSON.parse( $.ajax({
		type: "POST",
		async: false,
		url: config.wiseUrl+"/api/Outbound/GetCallId",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: JSON.stringify({"callType": CATY_EMAIL_OUT, "caseId" : _mediaCaseId, "agentId": loginId}),
	}).responseText);
	
	if(_returnJson.result=="success") {
		return _returnJson.data;
	} else {
		if(_returnJson.result=="fail") console.log(_returnJson.details);
		return -1;
	}
}

function wiseSendFax(serviceName, faxNo, faxFile,coverData)
{
	const {coverSubject, coverMsg, coverAttn,  coverSender, coverCompany} = coverData;
	let _returnJson;
	_returnJson = JSON.parse( $.ajax({
		type: "POST",
		async: false,
		url: config.wiseUrl+"/api/Outbound/CreateCaseId",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: JSON.stringify({"agentId": loginId}),
	}).responseText);
	
	let _mediaCaseId=-1;
	if(_returnJson.result=="success")
		_mediaCaseId = _returnJson.data ;
	else {
		if(_returnJson.result=="fail") console.log(_returnJson.details);
		return -1;
	}
	
	let faxANI = outboundANI[serviceName].fax;
	let faxCover = outboundANI[serviceName].faxCover;
	wsWiseAgent.SendFaxExP_UC({
		"UniqueID":0,
		"PhoneNumber" :faxNo,
		"CoverMsg" : coverMsg,
		"FaxFile" : faxFile,
		"SendTo": coverAttn,
		"Subject": coverSubject,
		"Company": coverCompany,
		"Coverfile": faxCover, 
		"CaseID": _mediaCaseId,
		"ANI": faxANI,
		"Sender": coverSender
	});

	_returnJson = JSON.parse( $.ajax({
		type: "POST",
		async: false,
		url: config.wiseUrl+"/api/Outbound/GetCallId",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: JSON.stringify({"callType": CATY_FAX_OUT, "caseId" : _mediaCaseId, "agentId": loginId}),
	}).responseText);
	
	if(_returnJson.result=="success")
		return _returnJson.data;
	else {
		if(_returnJson.result=="fail") console.log(_returnJson.details);
		return -1;
	}
}

function wiseAnswerDirectCall()
{
	if(userMode!="TALK" && userMode!="DIALING" && directCalls.length>0) {
		if(userMode!="IDLE") wsWiseAgent.Idle();
		wsWiseAgent.AcceptMediaCall(directCalls.shift());
		if (directCalls.length==0)
			window.parent.$("#panel-direct-count").css("background","");
		else
			window.parent.$("#panel-direct-count").css("background","blue");
		window.parent.$("#direct-count-text").text("Queue: " + String(directCalls.length));
	}
}

async function wiseSendWhatsAppMsg(serviceName, phoneNo, TemplateId, props, callback)
{
	let ani = outboundANI[serviceName].whatsapp;
	let no ="whatsapp:+";
	no += (String(phoneNo).length<=8)? "852" + String(phoneNo) : String(phoneNo);
	
	templateMsgResult={};
	wsWiseAgent.SendTemplateMsg(ani, no, TemplateId, props, 4);
    while (Object.keys(templateMsgResult).length==0) {
    	await sleep(100);
    }
	// return templateMsgResult;
    callback(templateMsgResult.ticket_id);
}
// phoneList: "9xxxxxxx,6xxxxxxx,5xxxxxxx"
async function wiseSendWhatsAppMsgEx(serviceName, phoneList, TemplateId, props, callback)
{
	let ani=outboundANI[serviceName].whatsapp;
	
	templateMsgResultEx=[];
    for (let phoneNo of phoneList.split(",")) {
		let no = "whatsapp:+";
		no += (phoneNo.length<=8)? "852" + phoneNo: phoneNo;
		wsWiseAgent.SendTemplateMsg(ani, no, TemplateId, props, 4);
	}
    while (templateMsgResultEx.length!=phoneNo.length) {
		await sleep(100);
	}
    templateMsgResult.ticket_id = templateMsgResultEx;
    callback(templateMsgResult);
}

function wiseGetWhatsappMsg(serviceName, startDate, endDate, phoneNo, callback)
{
	let companyCode=outboundANI[serviceName].whatsapp;
	if(companyCode==undefined) {
		alert("Whatsapp of [" + serviceName + "] is undefined");
		return;
	}
	$.ajax({
		type: "POST",
		url: config.wiseUrl+"/api/SocialMedia/GetWhatsapp",
		data: JSON.stringify({"companyCode" : companyCode, "startDate": startDate, "endDate" : endDate, "phoneNo" : phoneNo }),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (r) {
			if (r.result=="success"){
				callback(r.data);
			}
		},
		error: function (r) {
			console.log(r);
		},
	});
}

function WiseGetAgentList(name, entry)
{
	let callType;
	if(entry=="webchat") callType=CATY_WEBCHAT;
	else if(entry=="email") callType=CATY_EMAIL;
	else if(entry=="vmail") callType=CATY_VMAIL;
	else if(entry=="fax") callType=CATY_FAX;
	else callType=CATY_BLOG;

    let service = serviceList.find(function (v) { return v.name==name && v.callType==callType });
	if(s.length==0) return;
	acdGroupMemberBy="WiseGetAgentList";
    wsWiseAgent.GetACDGroupMember(service.acdGroup);
}

function WiseGetAgentListEx()
{
	wsWiseAgent.GetLogonAgentEx();
}

function WiseStartMonitorCall(agentId, typeId)
{	
	/*
	typeId: 0 	Barge In
	typeId: 1 	Silent
	typeId: 2 	Conference
	typeId: 4 	Coach
	*/
	if (monitoredAgentId!=0 && monitoredAgentId != agentId)
	{
		wsWiseAgent.StopMonitorAgent(monitoredAgentId); // You are monitoring someone and you monitor another one now, so you need to stop monitoring first 
        setTimeout(function (p) {monitoredAgentId=p.agentId; wsWiseAgent.MonitorAgent(p.agentId, p.typeId);}.bind(this, {agentId : agentId, typeId: typeId}),500);
	} else {
		if(userMode != "IDLE") wsWiseAgent.Idle(); // If user In Break or Ready or Working mode cannot monitor call
		monitoredAgentId=agentId;
		wsWiseAgent.MonitorAgent(agentId, typeId);
	}
}

function WiseEndMonitorCall()
{
    if (monitoredAgentId!=0){
        wsWiseAgent.StopMonitorAgent(monitoredAgentId);
		monitoredAgentId=0;
	}
}

function WiseStartMontiorChat(ticketIdArr, agentId)
{
	let allUnderMonitoring = true;
    for (let ticketId of ticketIdArr)
	{
		let i=monitoredTicketList.findIndex(function(v){return v.ticketId==ticketId});
		if(i==-1) {
			monitoredTicketList.push({"ticketId": ticketId, "agentId": agentId, "mode" : "S" });
			wsWiseAgent.AssignToChatRoom(ticketId,loginId,"M");
			allUnderMonitoring = false;
		}
	}
	if (allUnderMonitoring){
		// till chrome version 14, still no window.focus();
		alert("All chats are already under monitoring");
	} else {
		alert("You are entering the chat(s)."); // The alert is for switching the popup
	}
}

function WiseEndMontiorChat(ticketId)
{
	let i=monitoredTicketList.findIndex(function(v){return v.ticketId==ticketId});
	if(i==-1) {
		alert("The chat room is not under monitoring.");
	} else {
		wsWiseAgent.AssignToChatRoom(ticketId,loginId,"E"); // Exit monitored chat
		monitoredTicketList.splice(i,1);
	}
}

function WiseMontiorChat(ticketId, mode)
{
	/*
	mode: "C" Conference
	mode: "B" Barge In
	*/
	let i=monitoredTicketList.findIndex(function(v){return v.ticketId==ticketId});
	if (i == -1) {
		alert("The chat room is not under monitoring.");
		return;
	}
	if(mode=="C" && monitoredTicketList[i].mode=="S") {
		monitoredTicketList[i].mode="C";
		wsWiseAgent.AssignToChatRoom(ticketId,loginId,"C");
		// Take out from monitor
		monitoredTicketList.splice(i,1);
	} else if(mode=="B" && monitoredTicketList[i].mode!="B" ) {
		wsWiseAgent.AssignToChatRoom(ticketId,loginId,"B");
		wsWiseAgent.AssignToChatRoom(ticketId,monitoredTicketList[i].agentId,"R");
		monitoredTicketList[i].mode="B";
		monitoredTicketList[i].agentId=parseInt(loginId)
		// Take out from monitor
		monitoredTicketList.splice(i,1);
	}
}

function wiseGetACDGroupMember(gid)
{
	acdGroupMemberBy="wiseGetACDGroupMember";
	wsWiseAgent.GetACDGroupMember(gid);
}

function wiseAddDevice(AgentID, AgentName, Password, Level, Callback)
{
    if (Callback) callbackFnRM100=Callback;
	wsWiseMonitor.AddDevice(AgentID, AgentName, Password, Level, {
		"BeRecord": 1,
		"BeInbound": 1,
		"BeOutbound": 1,
		"BePD": 0,
		"BeVideo": 0
	});
}

function wiseRemoveDevice(agentID)
{
	wsWiseMonitor.RemoveDevice(agentID);
}

function wiseAddACDGroupMember(gid, aid)
{
	wsWiseMonitor.AddDeviceMember(gid, aid);
}

function wiseDelACDGroupMember(gid, aid)
{
	wsWiseMonitor.RemoveDeviceMember(gid, aid);
}

function wiseOpenMonitor() {
	// agentLvId 1,2 also can see the agent status but cannot add or remove acd
	// if (agentLevelID != 3 && agentLevelID != 4){
	// 	alert("Please contact IT support to grant the right to have Wallboard");
	// } else 
	wsWiseMonitor.OpenWebsocket(config.wiseMonitorSocket);
	
}

addEventListener(document,'AddToChatRoom', function(e) {
	let obj = e.detail;
	triggerEvent(window.parent.document, 'onAddToChatRoom', obj);
});

addEventListener(document, 'RmFromChatRoom', function(e) {
	let obj = e.detail;
	triggerEvent(window.parent.document, 'onRmFromChatRoom', obj);
});

/*
function wiseRemoveAttachement(attachedFiles)
{
	let _files=attachedFiles.split(";");
	for (_file in _files) {
		if (_file.indexOf("\\Uploads\\")==-1) return;
	}
	$.ajax({
		type: "POST",
		url: config.wiseUrl+"/api/Outbound/RemoveAttachment",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data : "{\"files\": [\"" + attachedFiles.replace(",","\",\"").replace(" ","") + "\"]",
		success: function (r) {
			console.log(r);
		},
		error: function (r) {
			console.log(r);
		},
	});
}

function wiseUploadAttachement(fileId, appCaseNo)
{
	let _fileUpload = $("#" + fileId).get(0);
	let _fileData = new FormData();
	for(let i=0;i<_fileUpload.files.length;i++)
		fileData.append("files", _fileUpload.files[i]);  
      
	_fileData.append('agentId', loginId);  
	_fileData.append('caseNo', appCaseNo);  
	console.log(_fileData);
	$.ajax({  
		url: 'http://localhost:51453/api/Outbound/UploadAttachment',  
		type: "POST",  
		contentType: false, // Not to set any content header  
		processData: false, // Not to process data  
		dataType: 'json',
		data: _fileData,  
		success: function (r) {  
			console.log(r);  
		},  
		error: function (err) {  
			console.log(err);  
		}  
	});  
}
*/


function TestGetMsg()
{	
	$("#queueListBar").find("[id*='QueueCount1']").css("cursor","wait");
		
	wiseSendEmail('OneCallFix', 'tigerpkchong@eprotel.com.hk', '', 'RE: testing', '<html><boby><h1> Hello</h1></boby></html>', '');
}

function saveVoicebotCall(callID, caseNo)
{
	$.ajax({
		type: "POST",
		url:  config.wiseUrl+"/api/Call/SaveVoicebotCall",
		data: JSON.stringify({"callId" : callID, "caseNo": caseNo, agentId: loginId}),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
	}).always(function (r) {
		console.log(r);
	});
}


let popup = null;
let originalMsgArr = [];
const popupCenter = function(url, windowName, w, h) {
    const y = window.top.innerHeight / 2 + window.top.screenY - ( h / 2);
    const x = window.top.innerWidth / 2 + window.top.screenX - ( w / 2);

	// fullscreen=false works on IE only
    return window.open(url, windowName, `toolbar=no, fullscreen=false, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`);
}

function openAlert(callType,msg, waitCount, waitTime) {
	console.log("originalMsgArr=" + originalMsgArr);
	console.log("callType=" + callType + ", msg=" + msg + ",waitCount=" + waitCount + ",waitTime=" + waitTime);
	if (userMode == "BREAK") return;
	
	let idx = originalMsgArr.findIndex(function(el) {
		return el.callType==callType;
	});
	console.log(popup);
	if(popup){
		if(!popup.closed) {
			popup.close();       
		}
	} 
	console.log("idx="+ idx);
	if(idx==-1) {
		if (waitCount==0) return;
		let msgObj={ "time": new Date(), "callType": callType, "waitCount": waitCount, "waitTime" : waitTime,  "msg" : msg};
		originalMsgArr.push(msgObj);
		popup = popupCenter('./alertPopUp.html', 'alert', 500, 500);
    } else if (waitCount == 0) {
		originalMsgArr.splice(idx, 1);
		console.log("originalMsgArr=" + originalMsgArr);
	} else {
		originalMsgArr[idx].waitCount = waitCount;
		originalMsgArr[idx].waitTime = waitTime;
	}
	
	if(originalMsgArr.length!=0) {
		popup = popupCenter('./alertPopUp.html', 'alert', 500, 500);
	}
}

