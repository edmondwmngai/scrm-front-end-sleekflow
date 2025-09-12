  class Chat
  {
	  ///////
		messageToSend = '';
		messageReceived = '';
		messageToSendBy =  '';
		bubblePresentTemplate = null;
		bubblePendingTemplate = null;
		bubblePresentClosedTemplate = null;
		bubblePendingClosedTemplate = null;
		count = 0;
		statusUpdateTemplate = null;
		agentId = 0;

	    currentTicket = null;
		
	    selectedTicketId = 0;
		selectedAgentId = 0;
	    selectedwebClientSenderId = "";
		selectedChatChannel = "";
	    selectedEndUserName = "";
	  
		PresentTicket = true;
	    isScrollToBottom = true;

	     selectedCannedFiles = [];
	  allowPastMessageCall = true;

	  isSendingMessage = false;
	  interval = null;
	  disableReloadMsg = false;
	  returnPastMessageAtBegin = false;

		//Contacted us in the last hour: Last Ticket ID: 1386264423 on 2024-11 - 29 12: 17: 37
	  init()
	  {
		    this.cacheDOM();
			this.bindEvents();

	  };
	  
	  cacheDOM()
	  {
		  
			//Initialize all the input that will be used in chat Service
		    this.$chatHistory	= $('#chatHistory');
			this.$button		= $('#sendMsgButton');
			this.$testbutton	= $('#testSendMsgButton');

			this.$textarea		= $('#replyTextarea');
			this.$histHeader	= $('.default-content-title');
			this.$ticketList	= $('#bubble-list-inner');
	//		this.$agentId		= 
			//this.$selectedTicket= $('.bubble-container-inner');

			//The handle bar template must be compiled before use, otherwise will error
			//All the templates are loaded in dom in socialmedialHandler.html  <div id="template"></div>
			this.bubbleTemplate = Handlebars.compile( $("#bubble_template").html());

			
			this.chatlistHeaderTemplate		=	Handlebars.compile( $("#chatlist_header_template").html());
			this.agentMessageTemplate		=	Handlebars.compile( $("#agent_message_template").html());
			this.visitorMessageTemplate		=	Handlebars.compile( $("#visitor_message_template").html());
		    this.statusUpdateTemplate		=	Handlebars.compile($("#status_update_template").html());
			this.visitorMessageWithImageTemplate= Handlebars.compile($("#visitor_message_withimage_template").html());
			this.agentMessageWithImageTemplate	= Handlebars.compile($("#agent_message_withimage_template").html());
		  
	  };
	  
	  bindEvents() {
		  //this.$button.on('click', this.addReplyMessageByClick.bind(this));
		  this.$textarea.on('keypress', this.addReplyMessageEnter.bind(this));

		  this.$button.on('click', this.sendMessageByClick.bind(this));


		  this.$chatHistory.on('scroll', this.onChatHistoryScroll.bind(this));

		  this.$testbutton.on('click', this.callBackTest.bind(this));

		  //  this.addTestBubble("Present", false, "Tiger", 418);
		  //    this.addTestBubble("Present", false, "Test", 419);
		  //this.addTestBubble("Present", false, 3, 3333);
		  //		  this.moveBubbleToFirst(2222);

		
	  };

	  onChatHistoryScroll()
	  {
		  
    	  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == this.selectedTicketId)[0];
          

		 if ($('#chatHistory').length) {
			sTicket.scrollTop = $('#chatHistory').scrollTop();
			console.log("sTicket.scrollTop: "  + sTicket.scrollTop);
		 } 
		/*
		  if (this.$chatHistory != undefined)
		  {
			 // If it's jQuery
			  if (typeof this.$chatHistory.scrollTop === 'function') {
				sTicket.scrollTop = this.$chatHistory.scrollTop();
			  }
			  // If it's a native DOM element
			  else if (typeof this.$chatHistory.scrollTop === 'number') {
				//sTicket.scrollTop = this.$chatHistory.scrollTop;
			  }

		  }*/
		  /*
		if (this.$chatHistory.scrollTop)
		{
		  if (this.$chatHistory.scrollTop() < 20) {
			  //console.log("scroll top" + this.$chatHistory.scrollTop());
			  //parent.$('#phone-panel')[0].contentWindow.addTestMessageAtTop();

			  //returnPastMessageByTicketId

			  if (this.allowPastMessageCall)
			  { 
				  this.allowPastMessageCall = false;
				this.isScrollToBottom = false;
				this.returnPastMessageByTicketId(this.selectedTicketId);
			  }
			  	// simulate the situation read the previous message;
		  }
		}*/
		
		if ($('#chatHistory').length) {
	//	  const scrollTop = typeof this.$chatHistory.scrollTop === 'function'
	//		? this.$chatHistory.scrollTop()
	//		: this.$chatHistory.scrollTop;

		// if (typeof this.$chatHistory.scrollTop === 'function') {
			
		  if ($('#chatHistory').scrollTop() < 20) {
			  if (this.allowPastMessageCall)
			  { 
				this.allowPastMessageCall = false;
				//this.isScrollToBottom = false;
				this.returnPastMessageByTicketId(this.selectedTicketId);
				this.scrollToTop();
			  }
			// do something
		  }
		  
		 // }
		}

	  };


	  //For send and receive by API of Web Socket_----------------------------------------------------------------------------------------------
	  //----------------------------------------------------------------------------------------------------------------------------------------

	  //On  UI level=>   sendByClick();
	  //sendMessageByAPI ()
	  //phone.html call sendMessageByHandler();
	  //wss sendMessage();

	  sendMessageByClick() {
		  

		  //var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
		  //var token = sessionStorage.getItem('scrmToken') || '';
		  //var agentName = sessionStorage.getItem('scrmAgentName') || '';

		  var loginId = top.loginId;
		  var token = top.token;
		  //var agentName = top.agentName;		//20250414 Remove this useless assignment to variable "agentName".

		  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == this.selectedTicketId);


		  event.preventDefault(); // Prevent the default button click behavior
		  this.isScrollToBottom = true;
		  parent.$('#phone-panel')[0].contentWindow.sendMessageReturned = null;
		  parent.$('#phone-panel')[0].contentWindow.sendMessageByHandler(loginId, token, "text", this.$textarea.val(), sTicket[0]);

		  this.isSendingMessage = true;
		  this.$button[0].enabled = false;
		  this.$button[0].style = "background: grey";

		  setTimeout(() =>
		  {
			  if (this.isSendingMessage)		//	  if (this.isSendingMessage == true)	// 20250407 Refactor the code to avoid using this boolean literal.
			  {
				  this.isSendingMessage = false;
				  this.$button[0].enabled = true;
				  this.$button[0].style = "background: blue";
			  }		//console.log("Delayed for 5 second.");
		  }, 5000);
	  };

	  sendAttachmentByClick()
	  {
		  var loginId = top.loginId;
		  var token = top.token;
		  //var agentName = top.agentName;		//20250414 Remove this useless assignment to variable "agentName".

		  var fileInput = $('#fileInput')[0]; 
		  var file = fileInput.files[0];

		  event.preventDefault(); // Prevent the default button click behavior
		  parent.$('#phone-panel')[0].contentWindow.sendMessageReturned = null;

		  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == this.selectedTicketId);		

		  this.isScrollToBottom = true;
		  parent.$('#phone-panel')[0].contentWindow.sendAttachmentByHandler(loginId, token, "file", file, sTicket[0]);

	  };

	  sendMessageByTemplate(selectedTemplate)
	  {


		  var loginId = top.loginId;
		  var token = top.token;
		  //var agentName = top.agentName;		//20250414 Remove this useless assignment to variable "agentName".

		  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == this.selectedTicketId);

		  this.isScrollToBottom = true;
		  parent.$('#phone-panel')[0].contentWindow.sendTemplateMessageByHandler(loginId, token, "EPRO", selectedTemplate,
			  sTicket[0].DeviceId,		//From
			  sTicket[0].EndUserPhone,  //To
			  sTicket[0].TicketId);		//TicketId
	  };

	  sendMessageByTemplateCallBack(response)
	  {
		  //message
		  //ticket
		  this.updateChatMessageHistory(response);
		  //this.updateChatHeader();
		  this.addReplyMessageByText(response);

		  this.scrollToBottom();
	  }

	  //This function is trigger on interface onClick
	  sendAttachmentReset()
	  {	
		  $('#fileInput')[0].value = "";
	  };
	  
	  sendMessageCallBack(sMsg)
	  {
		  

		  this.updateChatMessageHistory(sMsg);
		  //this.updateChatHeader();
		  this.addReplyMessageByText(sMsg);

		  if (this.selectedTicketId == sMsg.TicketId) {
			  this.scrollToBottom();

			  setTimeout(() => { this.scrollToBottom(); }, 500);
			  setTimeout(() => { this.scrollToBottom(); }, 1500);
		  }

		  this.isSendingMessage = false;
		  //this.$button[0].style = "background: lightgrey";
		  this.$button[0].style = "background: blue";
		  this.$button[0].enabled = true;
	  };

	  incomeMessageCallBack(sMsg)
	  {
		  this.updateChatMessageHistory(sMsg);

		  if (sMsg.SentBy == "timeout")
		  {
			  this.updateChatSessionTimeout(ticketId);
			  return;
		  }

		  //Current Bubble Message
		  if (this.selectedTicketId == sMsg.TicketId) {

			  if (sMsg.SentBy == "agent")
			  {
				  this.addReplyMessageByText(sMsg);
			  }
			  else
			  {
				  this.receiveMessage(sMsg);
			  }

			  setTimeout(() => { this.scrollToBottom(); }, 500);
			  setTimeout(() => { this.scrollToBottom(); }, 1500);
		  }
		  else
		  {
			  this.updateBubbleStatus(sMsg.TicketId, "Pending_Unread", false);
			  this.moveBubbleToFirst(sMsg.TicketId);
		  }


	  };
	  
	  requestCannedFileInBase64CallBack(fileId, fileName, fileType, base64, ticketId)
	  {
			var loginId = top.loginId;
			var token = top.token;

			const fileBlob = base64ToBlob(base64, fileType);

			var fileObj = new File([fileBlob], fileName, { type: fileType });
			var dataTransfer = new DataTransfer();

			//Use dataTransfer object insert into viewdata 
	        dataTransfer.items.add(fileObj);
			
			var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == ticketId);
			parent.$('#phone-panel')[0].contentWindow.sendAttachmentByHandler(loginId, token, "file", dataTransfer.files[0], sTicket[0]);
	  };

	  callBackTest()
	  {
		  var json = '{ "MessageId": 2307930870, "TicketId": 418, "UniqueId": null, "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "template", "TemplateHeaderType" : "image", "TemplateHeader" : "http://eimage.eprotel.com.hk/epro_01.png", "TemplateName":"greetings_1_image", "MessageContent": "Message 2", "FilesJson": "[]" }'; 

		  var sMsg = JSON.parse(json);

		  this.addReplyMessageByText(sMsg);

		  if (this.selectedTicketId == sMsg.TicketId) {
			  this.scrollToBottom();
		  }
	  };

	  endSession() {


		  //***** may need to handle left the chat features

		  var endSession = false;

		  //Confirm by user to end the session

		  if (confirm('End Session')) {
			  endSession = true;
		  }
	//	  else						20250326 Review this redundant assignment:
	//	  {
	//		  endSession = false;
	//	  }

		  if (endSession) {
			  var loginId = top.loginId;
			  var token = top.token;
			  //this.selectedTicketId

			  parent.$('#phone-panel')[0].contentWindow.endSessionByHandler(loginId, token, this.selectedTicketId);
			  
		  }
	  };

	  //endSessionCallBack(sTicket)
	  endSessionCallBack(ticketId)
	  {
	
		  var ticket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == ticketId)[0];

		  //check whether the ticket is not origially assigned to login agent
		  if (ticket.AssignedTo != top.loginId) {
			  this.removeBubble(ticketId);

			  if (ticketId == this.selectedTicketId) {
				  this.resetChatHistory();
				  this.$histHeader.html('');
			  }

			  this.updateChatEndSessionByMember(ticketId);
		  }
		  else
		  {

			  if (ticketId == this.selectedTicketId) {
				  this.disableInput(true);
				  this.updateChatStatus("Session Ended");
				  setTimeout(() => { this.scrollToBottom(); }, 600);
			  }
			  this.updateChatEndSession(ticketId);
		  }
	  };

	  sessionTimeoutCallBack(ticketId)
	  {
		  this.updateChatSessionTimeout(ticketId);

		  if (ticketId == this.selectedTicketId)
		  {
			  this.disableInput(true);
			  this.updateChatStatus("Session Timeout");
			  this.updateChatStatus("Session Ended");
			  this.scrollToBottom();
		  }
	  };

	  
	  returnPastMessageByTicketId(ticketId)
	  {

		  //var TicketId = this.selectedTicketId;	// 20250414 Remove this useless assignment to variable "TicketId".
		  var loginId = top.loginId;
		  var token = top.token;

		  //agentid, token, userId, msgId, limit



		  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == ticketId);

		  //parent.$('#phone-panel')[0].contentWindow.returnMessagesFromHandlerByUserId(ticketId, loginId, token, sTicket[0].EndUserId, sTicket[0].messages[sTicket[0].messages.length - 1].MessageId, 20);

		  //parent.$('#phone-panel')[0].contentWindow.returnMessagesFromHandlerByUserId(ticketId, loginId, token, sTicket[0].EndUserId, sTicket[0].messages[0].MessageId, 5);

		  parent.$('#phone-panel')[0].contentWindow.getPastMessageByHandler(ticketId, loginId, token, sTicket[0].EndUserId, sTicket[0].messages[0].MessageId, 5);
	  };

	  returnPastMessageByTicketIdCallBack(ticketId, msgList)
	  {
		  if (msgList != null)
		  {
			 // console.log(JSON.stringify(msgList));

			  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == ticketId);
			  var newList = JSON.parse(JSON.stringify(msgList));

			  //20250820 force enable scroll when there is past message
			  if (newList.length > 0)
			  {
				    sTicket[0].overflow = "scroll";
					$('#chatHistory').css('overflow-y', 'scroll'); // Always show scrollbar
			  }
			  //console.log('before');	  //console.log(JSON.stringify(newList));

			  //Record the original TicketID
			  newList.forEach(item => { item.oTicketId = item.TicketId; });
			  //Assign the display related TicketID
			  newList.forEach(item => { item.TicketId = ticketId; });

			  //console.log('Updated');		//console.log(JSON.stringify(newList));

			  //Append the message list at the beginning
			  newList = newList.concat(sTicket[0].messages);

			  //console.log('Concated');  //console.log(JSON.stringify(newList));
			  //apply sorting
			  newList = newList.sort((a, b) => { return a.MessageId - b.MessageId; });

			  //update the current message list to ticket record in assignedList
			  sTicket[0].messages = newList;

			  sTicket[0].UpdateStatus = "Updated";
			  
			  //console.log("old");		 //console.log(JSON.parse(JSON.stringify(sTicket[0].messages)));
			  //console.log("updated");	 // console.log(JSON.stringify(sTicket[0]));
			  this.reloadChatHistory(sTicket[0].messages);

			  this.allowPastMessageCall = true;
			  
			  if (newList.length > 0 && this.returnPastMessageAtBegin == true)
			  {
				  
				  this.returnPastMessageAtBegin = false;
				  this.scrollToBottom();
				  
				  
			  }else{
				  
				  this.scrollToTop();
				  
			  }
			  

			  //this.scrollToBottom();
		  }

	  }

	  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//

	  //
	  // For chat history header
	  //----------------------------------------------------------------------------------------------------------------------------------------------

	  //updateChatHeader(entry, visitorName, ticketId)
	  updateChatHeader(entry, sTicket)
	  {
	  	this.$histHeader.html("");
		var templateResponse = this.chatlistHeaderTemplate;

		var channelImg = this.returnChannelImgByEntry(entry);

		

		  var contextResponse = {
			  ticketId: sTicket.TicketId,
			  name: sTicket.EndUserName,
			  email: sTicket.EndUserEmail, 
			  phone: sTicket.EndUserPhone, 
			  language: "English",
			  channelImg: channelImg,
			  channel: entry,
			  additionalInfo: ""
		  };

		  /*
		  var pastTicket = this.returnPastTicketFromSameVisitor(sTicket.TicketId);
		  if (pastTicket != null)
		  {

			  //Contacted us in the last hour: Last Ticket ID: 1386264423 on 2024-11 - 29 12: 17: 37
			  contextResponse.additionalInfo = "Contacted us in the last hour: Last Ticket ID: " + pastTicket.TicketId + " on " + pastTicket.UpdatedAt.slice(0, 19);
		  }
		  */

		this.$histHeader.append(templateResponse(contextResponse));
	  };



	  returnPastTicketFromSameVisitor(ticketId)
	  {

		  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == ticketId);
		  var sEndUserName	= sTicket[0].EndUserName;

		  //var EndUserId = sTicket[0].EndUserId;		//20250414 Remove this useless assignment to variable "EndUserId".

		  const currentDatetime = moment();

		  // Not count the current present ticket
		  var records = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId != ticketId);
		  
		  // Filter records within 1 hour of the current datetime
		  var filteredRecords = records.filter(record => {
			  const recordMoment = moment(record.UpdatedAt.slice(0, 19));
			  return Math.abs(currentDatetime.diff(recordMoment, 'hours', true)) <= 1;
		  });
		  //Return the last inserted record in asigned ticket List only
		  if (filteredRecords.length > 0) {
			  filteredRecords = filteredRecords.filter(i => i.EndUserName == sEndUserName);
			  return filteredRecords[filteredRecords.length - 1];
		  }
		  else {
			  return null;
		  }
		 
	  };


	  // For chat history and chat inteface  on right side
	  //---------------------------------------------------------------------------------------------------------------------------------------------

	  //Visitor (Receive) side
	  //--------------------------------------
	  
	  //sMsg.MessageContent, sMsg.sendby
	  receiveMessage(sMsg)
	  {			
		    var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == sMsg.TicketId);


		  //var loginId = top.loginId;		// 20250414 Remove this useless assignment to variable "loginId".



			var sSentBy = sTicket[0].EndUserName;

		  //if (sMsg.SentBy == "agent")
		  //{
		//	  var agentName = agentService.getAgentNameByID(sMsg.UpdatedBy);
		//	  sSentBy = agentName
		 // }

			this.messageReceived = sMsg.MessageContent;
	  		var templateResponse = this.visitorMessageTemplate;

			//The moment js cannot handle the iso date format, if full date format the output is wrong. Please update the moment js above 2.16.0
			//var dateISO = sMsg.UpdatedAt.slice(0, 19); 			//var mDate = moment(dateISO).format('HH:mm:ss');

		    var mDate = returnDateForCRM(sMsg.UpdatedAt);

		  //Check the filejson is empty or not
		  if (sMsg.FilesJson.length < 3)
		  {
			  if (sMsg.QuotedMsgBody === null || sMsg.QuotedMsgBody === "")
			  {
				  var contextResponse = {
					  response: sMsg.MessageContent,
					  SentBy: sSentBy,
					  time: mDate
				  };
				  this.$chatHistory.append(templateResponse(contextResponse));
			  }
			  else
			  {
				  var quotedTemplate = parent.$('#phone-panel')[0].contentWindow.q_template;
				  var contextResponse = {
					  response: sMsg.MessageContent,
					  SentBy: sSentBy,
					  QuotedMsgBody: sMsg.QuotedMsgBody,
					  time: mDate
				  };
				  this.$chatHistory.append(quotedTemplate(contextResponse));
			  }
		  }
		  else
		  {
			  var FileList = [];

			  FileList = JSON.parse(sMsg.FilesJson);

			  //FileList[0].MimeType
			  var Filename = FileList[0].EproFilename;
			  var Fileurl = FileList[0].EproFileUrl;
			  var FileMime = FileList[0].MimeType;

			  var template = this.visitorMessageTemplate;

			  if (FileMime.startsWith('image/')) {

				  //var dateISO = sMsg.UpdatedAt.slice(0, 19); 
				  //var mDate = moment(dateISO).format('HH:mm:ss');
				  var mDate = returnDateForCRM(sMsg.UpdatedAt);

				  var attachmentTemplate = this.visitorMessageWithImageTemplate;

				  //var agentName = agentService.getAgentNameByID(this.currentSelectedAgentId);

				  // this.selectedAgentId = currentTicket.AssignedTo;

				  //Need to update to get AgentList function
				  var contextResponse = {
					  response: sMsg.MessageContent,
					  SentBy: sSentBy,
					  time: mDate,
					  FileFileName: Filename,
					  FileUrl: Fileurl
				  };

				  this.$chatHistory.append(attachmentTemplate(contextResponse));
			  }
			  else if (FileMime.startsWith('audio/ogg') || FileMime.startsWith('audio/mpeg'))
			  {
			  
					var aTag = '<audio controls controlsList="nodownload">' +
							'<source src="{{FileUrl}}" type="audio/ogg">' +
							'<source src="{{FileUrl}}" type="audio/mpeg">' +
				  'Your browser does not support the audio element.</audio>';

					aTag = aTag.replace("{{FileUrl}}", Fileurl);
					var mDate = returnDateForCRM(sMsg.UpdatedAt);

				  var context = {
					  SentBy: sSentBy,
					  response: "{{attachment}}",
					  time: mDate
					};

				  var output = template(context);
				  output = output.replace("{{attachment}}", aTag);
				  this.$chatHistory.append(output);
			  }
			  else if (FileMime.startsWith('video/mp4'))
			  {
				  var aTag = '<video controls="controls" width="300" height="225" preload="none">' +
					  '<source type="video/mp4" src="{{FileUrl}}"></video>';
				  aTag = aTag.replace("{{FileUrl}}", Fileurl);

				  var mDate = returnDateForCRM(sMsg.UpdatedAt);

				  var context = {
					  SentBy: sSentBy,
					  response: "{{attachment}}",
					  time: mDate
				  };
				  var output = template(context);
				  output = output.replace("{{attachment}}", aTag);
				  this.$chatHistory.append(output);
			  }
			  else
			  {
				
				  var aTag = "<div class='position-relative'>" +
					  "<a href='{{FileUrl}}' target='_blank' download=''>{{FileName}}</a>" +
					  "<span class='wa-sent-success'>sent</span></div>";
				  aTag = aTag.replace("{{FileUrl}}", Fileurl);
				  aTag = aTag.replace("{{FileName}}", Filename);

				 // var dateISO = sMsg.UpdatedAt.slice(0, 19); 
				 // var mDate = moment(dateISO).format('HH:mm:ss');

				  var mDate = returnDateForCRM(sMsg.UpdatedAt);

				  var context = {
					  SentBy: sSentBy,
					  response: "{{attachment}}",
					  time: mDate
				  };

				  var output = template(context);
				  output = output.replace("{{attachment}}", aTag);
				  this.$chatHistory.append(output);
				  this.$textarea.val('');

			  }
		  }


		 // this.scrollToBottom();
	  };
	  	  	  
	  //Agent (Reply) side
	  //------------------------------------------------------------------

	  addReplyMessageByText(sMsg)
	  {


		  var agentName = agentService.getAgentNameByID(sMsg.UpdatedBy);

		  console.log(JSON.stringify(sMsg));
						

		  if (sMsg.MessageType === "template")
		  {
			  //NOT finished
			  //var template = this.agentMessageTemplate;		20260414 Remove this useless assignment to variable "template".

			  console.log(sMsg.MessageId);
			  console.log(JSON.stringify(sMsg));

			  var templateList = parent.$('#phone-panel')[0].contentWindow.waTempService.getTemplateList();

			  var mTemplate = templateList.filter(i => i.TemplateName == sMsg.TemplateName)[0];

			  var cContext = parent.$('#phone-panel')[0].contentWindow.waTempService.createContextFromTemplate(mTemplate);

			  var htmlTemplate = parent.$('#phone-panel')[0].contentWindow.wa_template;

			  //var dateISO = sMsg.UpdatedAt.slice(0, 19);
			  //var mDate = moment(dateISO).format('HH:mm:ss');

			  // var mDate = returnDateForCRM(sMsg.UpdatedAt);	20250414 Remove this useless assignment to variable "mDate".

			  //this.$chatHistory.append(template(context));
			  //cContext.displayBtnGroup1 = "";
			  //cContext.displayBtnGroup2 = "";

			  cContext.Message = sMsg.MessageContent;

			  var MessageTemplate = htmlTemplate(cContext);
			  MessageTemplate = MessageTemplate.replace("fa-image wa-card-img", "");


			  var agentTemplate = this.agentMessageTemplate;

			  //var dateISO = sMsg.UpdatedAt.slice(0, 19);
			  //var mDate = moment(dateISO).format('HH:mm:ss');
			  var mDate = returnDateForCRM(sMsg.UpdatedAt);

			  var context = {
				  SentBy: agentName,
				  messageOutput: "{{Content}}",
				  time: mDate
			  };

			  var templateResult = agentTemplate(context);
			  templateResult = templateResult.replace("{{Content}}", MessageTemplate);
			  templateResult = templateResult.replace("content-bubble-content", "");

			  this.$chatHistory.append(templateResult);
		  }
		  else if (sMsg.MessageType === "text" && sMsg.FilesJson.length < 4)
		  {

			  var template = this.agentMessageTemplate;


			  //var dateISO = sMsg.UpdatedAt.slice(0, 19); 
			  //var mDate = moment(dateISO).format('HH:mm:ss');
			  var mDate = returnDateForCRM(sMsg.UpdatedAt);

			  var context = {
				  SentBy: agentName,
				  messageOutput: sMsg.MessageContent,
				  time: mDate
			  };

			  this.$chatHistory.append(template(context));

		  }
		  else if (sMsg.MessageType === "file" || sMsg.FilesJson.length > 4)
		  {

			  var FileList = [];

			  FileList = JSON.parse(sMsg.FilesJson);

			  //FileList[0].MimeType
			  var Filename = FileList[0].EproFilename;
			  var Fileurl  = FileList[0].EproFileUrl;
			  var FileMime = FileList[0].MimeType;

			  if (FileMime.startsWith('image/'))
			  {
				  var template = this.agentMessageWithImageTemplate;
				  //var dateISO = sMsg.UpdatedAt.slice(0, 19); 
				  //var mDate = moment(dateISO).format('HH:mm:ss');
				  var mDate = returnDateForCRM(sMsg.UpdatedAt);

				  var displayImage = "max-width:100%;max-height:200px";

				  //Need to update to get AgentList function
				  var contextResponse = {
					  response: sMsg.MessageContent,
					  SentBy: agentName,
					  time: mDate,
					  FileFileName: Filename,
					  FileUrl: Fileurl,
					  displayImage: displayImage
				  };

				  this.$chatHistory.append(template(contextResponse));
			  }
			  else
			  {
				  var template = this.agentMessageTemplate;

				  var aTag = "<div class='position-relative'>" +
					  "<a href='{{FileUrl}}' target='_blank' download=''>{{FileName}}</a>" +
					  "<span class='wa-sent-success'>sent</span></div>";
				  aTag = aTag.replace("{{FileUrl}}", Fileurl);
				  aTag = aTag.replace("{{FileName}}", Filename);

				  //var dateISO = sMsg.UpdatedAt.slice(0, 19); 
				  //var mDate = moment(dateISO).format('HH:mm:ss');
				  var mDate = returnDateForCRM(sMsg.UpdatedAt);

				  var context = {
					  SentBy: agentName,
					  messageOutput: "{{attachment}}",
					  time: mDate
				  };

				  var output = template(context);
				  output = output.replace("{{attachment}}", aTag);
				  this.$chatHistory.append(output);
			  }
		  }

		  //this.scrollToBottom();
		  this.$textarea.val('');
	  };	  
		
	  addReplyMessageEnter(event) {

		  // enter was pressed
		  if (event.keyCode == 13 && !event.shiftKey) {

			  //Prevent adding a new line 
				event.preventDefault();
				this.sendMessageByClick();
			}
	  };
	  //--------------------------------------------------------------------

	  scrollToTop() {
		 // if (this.$chatHistory == undefined)
		  //{
		//	this.$chatHistory	= $('#chatHistory');
		 // }
		  /*
		  if (this.$chatHistory.scrollTop)
		  {
			this.$chatHistory.scrollTop(50);			  
		  }*/
		 // if (typeof this.$chatHistory.scrollTop === 'function') {
			setTimeout(() => { this.$chatHistory[0].scrollTop = 50; }, 500);
			//this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight + 500);
		//  }

		  

	  };

	  scrollToBottom() {
		//  if (this.$chatHistory == undefined)
		//  {
		//	this.$chatHistory	= $('#chatHistory');
		//  }
		// if (typeof this.$chatHistory.scrollTop === 'function') {
		  //this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight + 500);
		  this.$chatHistory[0].scrollTop = this.$chatHistory[0].scrollHeight + 500;
	//	}


	  };

	  
	  //Update the status in chat history, eg. timeout and update the status at the end of chat history
	  updateChatStatus(statusMessage)
	  {
		  //const sessionEndedExist = this.$chatHistory.text().includes("Session Ended");

		  //if (sessionEndedExist) { return; }
		  /*
		  const text = this.$chatHistory?.[0]?.innerText;
		  if (text && text.includes("Session Ended")) {
			  // Your logic here
			  return;
		  }*/

		const el = this.$chatHistory?.[0]; // Get the native DOM element from jQuery
		const text = el?.innerText || "";

		if (text.includes("Session Ended")) {
			return;
		}


	
		  
		  var template  = this.statusUpdateTemplate;
		  var context = { status: statusMessage	};
		  this.$chatHistory.append(template(context));
	  };

	  resetChatHistory()
	  {
		  $('#chatHistory').html('');

	  }

	  reloadChatHistory(sMsglist)
	  {

		  //***After reload the history, the chatHistory will be scrolled based on isScrollToBottom Flag (to the bottom / to Top)
		  if (sMsglist == undefined)
		  {
			  return;
		  }
		  if (this.disableReloadMsg) //if (this.disableReloadMsg == true)	// 20250407 Refactor the code to avoid using this boolean literal.
		  {
			  this.disableReloadMsg = false;
		  }

		  var lTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == sMsglist[0].TicketId)[0];


		  if (lTicket.Status == "selfLeave" || lTicket.Status == "memberLeave" || lTicket.Status == "disappear")
		  {
			  return;
		  }
		  	  

		  //Reset the chat history screen
		  $('#chatHistory').html('');
		  this.disableInput(false);

		  //var ticketID = 0;		// 20250414 Remove the declaration of the unused 'ticketID' variable.

		  if (sMsglist != null)
		  {
			  var LastTicketId = 0;
			  //var loginId = top.loginId;		//20250414 Remove this useless assignment to variable "loginId".
			  //console.log("before process");
			  //console.log(JSON.parse(JSON.stringify(sMsglist)));

			  for (var i = 0; i < sMsglist.length; i++)
			  {
				  //for (var i = sMsglist.length - 1; i >= 0; i--) {
				  let sMsg = sMsglist[i];
				  

				  if (i != 0)
				  {
					  if (LastTicketId != sMsglist[i].oTicketId)
					  {
						  this.$chatHistory.append("<hr style='border: 1.5px dotted #000000; border-style: none none dotted; color: #fff; background-color: #fff;' />");
					  }
				  }
				  LastTicketId = sMsglist[i].oTicketId;

				  //console.log(sMsg.MessageId);

				  if (sMsg.SentBy == "user") {

					  this.receiveMessage(sMsg);
				  }
				  //else if (sMsg.SentBy == "agent" && sMsg.UpdatedBy != loginId)
				  //{
				//	  this.receiveMessage(sMsg);
				 // }
				  else if (sMsg.SentBy == "agent")
				  {
					  this.addReplyMessageByText(sMsg);
				  }
				  else if (sMsg.SentBy == "timeout" || sMsg.SentBy == "selfLeave")
				  {
					  // Skip the message for timeout
				  }
				  else if (sMsg.SentBy == "group")
				  {
					  var message = sMsg.MessageContent.split(",");

					  // xxx has accepted your request with message:
					  this.updateChatStatus(message[0]);

					  //show the joined conference when reload
					  this.updateChatStatus(message[1]);

				  }
				  else if (sMsg.SentBy == "memberLeave")
				  {
					  this.updateChatStatus(sMsg.MessageContent);
				  }
				  else
				  {
					  this.addReplyMessageByText(sMsg);
				  }

				  //------------------------------------------------
			

				  
				  //------------------------------------------------
				  /*if (this.isScrollToBottom) {

					 // console.log("bottom");
					  this.scrollToBottom();

				  }
				  else
				  {
					 // console.log("top");
					  this.scrollToTop();
				  }*/
			  }
		  }

		  //Current present (selected ticket)
		  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == this.selectedTicketId);
		  var ticketStatus = sTicket[0].Status;

		  //element.style.visibility = 'hidden';
		  //element.style.visibility = 'visible';

		  


		  if (ticketStatus == "closed")
		  {	
			  this.updateChatEndSession(this.selectedTicketId);
		  }

		  if (ticketStatus == "timeout") {

			  this.updateChatSessionTimeout(this.selectedTicketId);
		  }
		  
		  if (sTicket[0].Channel == "whatsapp") {
			  //document.getElementsByClassName('s-standalone-btn keyboard-icon')[0].style = "display:";
			  document.getElementsByClassName('s-standalone-btn keyboard-icon')[0].style = "display:none; d-none";
		  } else { 
			  document.getElementsByClassName('s-standalone-btn keyboard-icon')[0].style = "display:none";
		  }
		  
		  lTicket.UpdateStatus = "Reloaded";
	  };

	  //function update all the msglist in assignedlist
	  updateChatMessageHistory(sMsg)
	  {
		  //Update the client side Ticket AssignedList Message List for specified ticket
		  var sTicketLst = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == sMsg.TicketId);
		  var sTicket = sTicketLst[0];

		  if (sMsg.oTicketId == undefined) { sMsg.oTicketId = sMsg.TicketId; }


		  var sMsglist = sTicket.messages;
		  sMsglist.push(sMsg);

		  //Update back the ticket information
		  sTicket.UpdatedAt = sMsg.UpdatedAt;
		  sTicket.LastMessage= sMsg.MessageContent;
		  sTicket.UpdateStatus = "Updated";


		  //Also update the current Status of Ticket Bubble
		  var elements = document.getElementById('bubble-list-inner').querySelectorAll("#bubble-ticket");

		  elements.forEach((element, index) =>
		  {
			  //var dateISO = sMsg.UpdatedAt.slice(0, 19); 
			  //var mDate = moment(dateISO).format('HH:mm:ss');
			  var mDate = returnDateForCRM(sMsg.UpdatedAt);

			  var bubbleId = element.getElementsByClassName('bubble-id')[0].innerHTML;

			  if (bubbleId.trim() == sMsg.TicketId)
			  {
				  var messageList = JSON.parse(element.getElementsByClassName('bubble-messagelist')[0].innerHTML);
				  messageList.push(sMsg);
				  element.getElementsByClassName('bubble-messagelist')[0].innerHTML = JSON.stringify(messageList);
				  element.getElementsByClassName('bubble-time')[0].innerHTML = mDate;
				  //element.getElementsByClassName('bubble-message mr-auto')[0].innerHTML = sTicket.LastMessage;
				  element.getElementsByClassName('d-flex')[0].getElementsByClassName('bubble-message me-auto')[0].innerHTML = sTicket.LastMessage;
			  }
		  });

	  };
 



	  disableInput(sValue)
	  {
		  if (sValue)
		  {
			  $(".reply-container :input").attr("disabled", true);
		  }
		  else
		  {
			  $(".reply-container :input").attr("disabled", false);
		  }
	  };
	  //Normal case
	  updateChatEndSession(ticketId)
	  {
		  this.updateBubbleStatus(ticketId, "Session_End", true);
		  this.updateStatusInAssignedList(ticketId, "Status", "closed");
	  };
	  //Login user end the session by not originally assigned to him
	  updateChatEndSessionByMember(ticketId)
	  {
		  this.updateBubbleStatus(ticketId, "Session_End", true);
		  this.updateStatusInAssignedList(ticketId, "Status", "disappear");
		  this.removeBubble(ticketId);		
	  }
	  //B is current Login user but received mesage for A leave the chat
	  updateChatByMemberLeave(ticketId, statusMsg) {

		  if (this.selectedTicketId == ticketId) {
			  this.updateChatStatus(statusMsg);
			  this.scrollToBottom();
			  setTimeout(() => { this.scrollToBottom(); }, 500);
			  setTimeout(() => { this.scrollToBottom(); }, 1500);
			  this.disableReloadMsg = false;
		  }

	  }


	  updateChatSessionTimeout(ticketId)
	  {
		  // "Session Ended"
		  
		  this.updateBubbleStatus(ticketId, "Session_End", true);
		  this.updateStatusInAssignedList(ticketId, "Status", "timeout");
		  this.updateChatStatus("Session Timeout");
		  this.updateChatStatus("Session Ended");

		  this.scrollToBottom();

		  this.disableInput(true);

		  // "Session Timeout"
		  // "Session Ended"
	  };

	  updateChatLoginAgentLeave(ticketId)
	  {
		  // "Session Ended"
		  //this.disableInput(true);
		  this.updateBubbleStatus(ticketId, "Session", true);
		  this.updateStatusInAssignedList(ticketId, "Status", "disappear");
		//  this.drop

		  // "Session Timeout"
		  // "Session Ended"
	  };



	  // For ticket (bubble) list
	  //-----------------------------------------------------------------------------------------------------------------------------------------------------

	  //When agent click the left bubble box, the box will be highlighted
	  selectTicket(e)
	  {

		

		//Get the value from each Bubble
		//e.getElementsByClassName('bubble-subject')[0].innerHTML;
		
		//console.log(e.getElementsByClassName('bubble-subject')[0].innerHTML);

		// Loop all the ticket to reset not selecte
		const elements = e.parentElement.querySelectorAll('.bubble-container');
		elements.forEach((element, index) => {	element.classList.remove("bubble-present")   });
		
		this.selectedwebClientSenderId  = e.getElementsByClassName('bubble-user-id')[0].innerHTML;
        this.selectedTicketId			= e.getElementsByClassName('bubble-id')[0].innerHTML;
		this.selectedAgentId			= e.getElementsByClassName('bubble-agent-id')[0].innerHTML;
		this.selectedChatChannel 		= e.getElementsByClassName('bubble-channel')[0].innerHTML;
		this.selectedEndUserName		= e.getElementsByClassName('bubble-subject')[0].innerHTML;

		//console.log("selected ticket id:" + this.selectedticketId.toString());

		// Update the selected class CSS
		e.classList.add("bubble-present");
		e.classList.remove("bubble-unread");

		

	    var selectedTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == e.getElementsByClassName('bubble-id')[0].innerHTML);

		if (selectedTicket[0].overflow == "scroll") {	$('#chatHistory').css('overflow-y', 'scroll');	}
		if (selectedTicket[0].overflow == "auto")	{	$('#chatHistory').css('overflow-y', 'auto');	}

		  // for not reload the chat room is ticket is not originally assigned to login agent AND it is closed / leave)
		  if (((selectedTicket[0].Status == "closed" || selectedTicket[0].Status == "selfLeave" || selectedTicket[0].Status == "memberLeave")) && this.selectedAgentId != top.loginId) {
			  return;
		  }


		//closed case is for not reload the group chat closed by member
		if (this.selectedAgentId != top.loginId && selectedTicket[0].Status == "closed") { return; }


		var sMsglist = selectedTicket[0].messages;


		  //Skip load message 
		
		  if (selectedTicket[0].Status != "selfLeave" ||
			  selectedTicket[0].Status != "memberLeave" ||
			  this.selectedAgentId == top.loginId ||  (selectedTicket[0].Status != "closed" && this.selectedAgentId != top.loginId))
		  { 
				this.reloadChatHistory(sMsglist, true);
				this.updateChatHeader(selectedTicket[0].Channel, selectedTicket[0]);
				this.scrollToBottom();
		  }

		  searchInput(selectedTicket[0]);	

		  if (selectedTicket[0].Channel == "whatsapp") {
			  document.getElementsByClassName('s-standalone-btn keyboard-icon')[0].style = "display:";
		  } else {
			  document.getElementsByClassName('s-standalone-btn keyboard-icon')[0].style = "display:none";
		  }
		//  this.returnMessagesPastMessage(this.selectedTicketId);
		
		var ref = this.$chatHistory;
		//ref.scrollTop = selectedTicket[0].scrollTop;
		
		this.$chatHistory[0].scrollTop = selectedTicket[0].scrollTop;
		
		console.log("this.$chatHistory.scrolltop: "  + this.$chatHistory[0].scrollTop);
		 //this.$chatHistory.scrollTop = sTicket.scrollTop;
	  };

	  moveBubbleToFirst(inputTicketID)
	  {

		  const specifiedValue = inputTicketID;
		  // Find the main parent div 

		  const mainParentDiv = document.getElementById('bubble-list-inner');

		  // Find all parent divs 
		  const parentDivs = mainParentDiv.querySelectorAll('#bubble-ticket');

		  // Iterate through each parent div 
		  parentDivs.forEach(parent => {
			  const subDivs = parent.querySelectorAll('.bubble-id');

			  // Check if any sub div's HTML equals the specified value 
			  subDivs.forEach(sub => {

				  if (sub.innerHTML.trim() === specifiedValue.toString()) {

					  // Move the parent div to the top 
					  mainParentDiv.prepend(parent);
					  console.log('Moved parent div to the top:', parent);
				  }
			  });
		  });
	  };

      //  pending only:   bubble-container
      //  selected:       bubble-container bubble-present
      //  pending unread: bubble-container bubble-unread
      //  selected closed (timeout):  bubble-container bubble-present bubble-closed
      //  pending closed (timeout):  bubble-container bubble-closed	  
	  addBubble(status, timeout, ticket, messageList)
	  {
		  //moment(date).format('D MMM YYYY, h:mm:ss A')
		  //console.log(JSON.stringify(ticket));
		  //console.log(ticket.UpdatedAt);

		  //handle the incoming message is closed when reloading
		  if (ticket.Status == "closed" || ticket.Status == "timeout")
		  {
			  timeout = true;
		  }
		  if (ticket.Status == "selfLeave" || ticket.Status == "memberClosed")
		  {
			  return;		//ignore this buuble when reload
		  }
		  
		  //var dateISO = ticket.UpdatedAt.slice(0, 19); 
		  //var mDate = moment(dateISO).format('HH:mm:ss');
		  var mDate = returnDateForCRM(ticket.UpdatedAt);
		  
		  	//var dateISO = new Date(ticket.UpdatedAt);
			//var dateUpdateAt = dateISO.getFullYear()+'-' + (dateISO.getMonth()+1) + '-'+dateISO.getDate();//prints expected format.

		  var jsonMsgList = JSON.stringify(messageList);


		  var channelImg = this.returnChannelImgByEntry(ticket.Channel);

		
			//var dateUpdateAt = dateISO.toTimeString().split(' ')[0];
		  var context = { 
			    agentId: ticket.AssignedTo,
				endUserId: ticket.EndUserId,
				endUserName: ticket.EndUserName,
				endUserEmail: ticket.EndUserEmail,
				endUserPhone: ticket.EndUserPhone,
				lastMessage: ticket.LastMessage, 
				ticketId: ticket.TicketId,
				updatedAt: mDate,				
				deviceId: ticket.DeviceId,
			    channel: ticket.Channel,
				channelImg: channelImg,
				messageList: jsonMsgList
			};

			var template  = this.bubbleTemplate;

		    // 20250407 timeout == false => !timeout	Refactor the code to avoid using this boolean literal.

			if (status == "Pending" && !timeout)
			{
				context.bubblestatus = "bubble-container";

			}
			else if (status == "Present" && !timeout)
			{
				this.selectedTicketId = context.ticketId;
				this.selectedAgentId = context.agentId;
				this.selectedwebClientSenderId	= context.endUserId;
				this.selectedChatChannel		= context.channel;
				this.selectedEndUserName		= context.EndUserName;
				context.bubblestatus = "bubble-container bubble-present";
			}
			else if (status == "Pending_Unread" && !timeout)
			{
				context.bubblestatus = "bubble-container bubble-unread";
			}

			else if (status == "Pending" && timeout)
			{
				context.bubblestatus = "bubble-container bubble-present bubble-closed";
			}
			else if (status == "Present" && timeout)
			{
				context.bubblestatus = "bubble-container bubble-closed";
	     	}	

			// Always insert the elements at first
			this.$ticketList.prepend(template(context));


		  //fix reload status when it is closed
		  if (ticket.Status == "closed" || ticket.Status == "timeout")
		  {
			  this.updateBubbleStatus(ticket.TicketId, "Session_End", true);
		  }
			
		  if (this.$chatHistory != undefined)
		  {
			if (this.$chatHistory.scrollTop)
			{
				sTicket.scrollTop= this.$chatHistory.scrollTop();
				sTicket.overflow = "auto";
			}
		  }

	  };

	  addTestBubble(status, timeout, name, ticketID)
	  {

     		  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == ticketID);


			var channelImg = this.returnChannelImgByEntry(sTicket[0].Channel);

			//var dateUpdateAt = dateISO.toTimeString().split(' ')[0];
			var context = { 
				endUserName: name,
				ticketId: ticketID,
				endUserId: sTicket[0].EndUserId,
				Channel: sTicket[0].Channel,
				AssignedTo: sTicket[0].AssignedTo,
				endUserEmail: sTicket[0].EndUserEmail,
				endUserPhone: sTicket[0].EndUserPhone,
				channelImg: channelImg
			};

			var template  = this.bubbleTemplate;
		  // 20250407 timeout == false => !timeout	Refactor the code to avoid using this boolean literal.

			if (status == "Pending" && !timeout)
			{
				context.bubblestatus = "bubble-container";
			}
			else if (status == "Present" && !timeout)
			{
				this.selectedTicketId = context.ticketId;
				this.selectedAgentId  = context.agentId;
				this.selectedwebClientSenderId	= context.endUserId;
				this.selectedChatChannel = context.Channel;
				this.selectedEndUserName = context.endUserName;
				context.bubblestatus = "bubble-container bubble-present";
			}
			else if (status == "Pending_Unread" && !timeout)
			{
				context.bubblestatus = "bubble-container bubble-unread";
			}

			else if (status == "Pending" && timeout)
			{
				context.bubblestatus = "bubble-container bubble-present bubble-closed";
			}
			else if (status == "Present" && timeout)
			{
				context.bubblestatus = "bubble-container bubble-closed";
	     	}	

			this.$ticketList.append(template(context));

		  this.selectedTicketId = sTicket[0].TicketId;
		  this.selectedAgentId = sTicket[0].AssignedTo;
		  this.selectedwebClientSenderId = sTicket[0].EndUserId;
		  this.selectedChatChannel = sTicket[0].Channel;
		  this.selectedEndUserName = sTicket[0].EndUserName;


		  //var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == ticketID);

		  this.updateChatHeader("web", sTicket[0]);


	  };

	  removeBubble(inputTicketID)
	  {
		  $('#bubble-list-inner #bubble-ticket .bubble-id').each(function () {

			  if ($(this)[0].innerHTML == inputTicketID)
			  {
				  // => bubble-label-content-columns => bubble-container-inner => bubble-ticket
				  $(this)[0].parentNode.parentNode.parentNode.remove();
			  }
		  });
	  };

	 // removeAssignedTicket(inputTicketID)

	 // {
		//var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == ticketID)[0];



	 // }


	  updateBubbleInfo(inputTicketID) {
		  const specifiedValue = inputTicketID;

		  // Find the main parent div
		  const mainParentDiv = document.getElementById('bubble-list-inner');

		  // Find all parent divs 
		  const parentDivs = mainParentDiv.querySelectorAll('#bubble-ticket');
		  // Iterate through each parent div 
		  parentDivs.forEach(parent => {
			  const subDivs = parent.querySelectorAll('.bubble-id');
			  // Check if any sub div's HTML equals the specified value 
			  subDivs.forEach(sub => {
				  if (sub.innerHTML.trim() === specifiedValue.toString())
				  {
					  parent.getElementsByClassName('bubble-message me-auto')[0].innerHTML = sTicket.messages[sTicket.messages.length - 1].MessageContent;
				  }
			  });
		  });
	  };

	  updateBubbleStatus(inputTicketID, status, timeout) {

		  //Check current status, //20250414	Remove the declaration of the unused 'sTicket' variable.
		  //var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == inputTicketID); 
		  //var ticketStatus = sTicket[0].Status;		//20250414 Remove this useless assignment to variable "ticketStatus".

		  //----------------------------------------------------------------------------------------------------------------

		  
		  const specifiedValue = inputTicketID;

		  // Find the main parent div
		  const mainParentDiv = document.getElementById('bubble-list-inner');

		  // Find all parent divs 
		  const parentDivs = mainParentDiv.querySelectorAll('#bubble-ticket');

		  // Iterate through each parent div		  .bubble-id => #bubble-ticket => #bubble-list-inner
		  parentDivs.forEach(parent => {
			  const subDivs = parent.querySelectorAll('.bubble-id');

			  // Check if any sub div's HTML equals the specified value 
			  subDivs.forEach(sub => {

				  if (sub.innerHTML.trim() === specifiedValue.toString()) {

					  // 20250407 Refactor the code to avoid using this boolean literal.
					  // timeout == false => !timeout

					  // *********Update the logic in there
					  if (status == "Pending_Unread" && !timeout) {
						  parent.classList.add("bubble-unread");
					  }
					  if (status == "Session_End" && timeout)
					  {

						  
						  parent.classList.add("bubble-closed");
						  parent.classList.remove("bubble-present");
						  parent.getElementsByClassName('bubble-message me-auto')[0].innerHTML = "Session Closed";
						  parent.getElementsByClassName('bubble-icon')[0].style = "opacity: 0.1;";
						  parent.getElementsByClassName('bubble-subject')[0].style = "color:grey";
						  parent.querySelector('#bubble-add-agent').style.visibility = "hidden";
						  parent.querySelector('#bubble-leave-chat').style.visibility = "hidden";
						  this.updateChatStatus("Session Ended");
						  
						  setTimeout(() => { this.scrollToBottom(); }, 500);
					  }
				  }
			  });
		  });
	  };

	  updateStatusInAssignedList(ticketId, fieldName, value)
	  {
		  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == ticketId);

		  if (fieldName == "Status")
		  {
			  sTicket[0].Status = value;
		  }
	  }
	 
	//---------------------------------------------------------------------------------------------------------------------------------------------///
	// For procedure including multi-steps
	//---------------------------------------------------------------------------------------------------------------------------------------------///
	//Tiggered by click the quening list, all the information in chatbot will be reloaded

	//----------------------------------------------------------------------------------------------------------------------------------------------
		
	  reloadByGetTicket()
	  {
			//1. Update Bubble ticket list
		  	var currentTicket= parent.$('#phone-panel')[0].contentWindow.currentTicket;
			var assignedLst= parent.$('#phone-panel')[0].contentWindow.AssignedTicketList;

			//queueList.sort(function (a,b) { var e =a.showPriority -b.showPriority; if(e==0) return (b.waitTime-a.waitTime); else return e; });

			const elements = document.getElementById('bubble-list-inner').querySelectorAll("#bubble-ticket");
		    elements.forEach((element, index) => { element.classList.remove("bubble-present") });

			if (currentTicket != null)
			{
				
				this.selectedTicketId			= currentTicket.TicketId;
				this.selectedAgentId			= currentTicket.AssignedTo;
				this.selectedwebClientSenderId  = currentTicket.EndUserId;
				this.selectedChatChannel 	   	= currentTicket.Channel;
				this.selectedEndUserName		= currentTicket.EndUserName;
				
				currentTicket.UpdateStatus = "Updated";
				
				for (var i = 0; i < assignedLst.length; i++)
				{
					if (i == (assignedLst.length - 1)) {
						this.PresentTicket = true;
					}
					else {
						this.PresentTicket = false;
					}

					if (this.PresentTicket) {
						this.PresentTicket = false;
						this.addBubble("Present", false, assignedLst[i], assignedLst[i].messages);


						//js that call from searchinput.js
						searchInput(assignedLst[i]);
					} else {
						this.addBubble("Pending", false, assignedLst[i], assignedLst[i].messages);
					}
				}

				
		  }

		  //*****currentMsgList is only be used for getTicket
		  var sMsgList = parent.$('#phone-panel')[0].contentWindow.currentMsglist;
		  
		  //2. Update Chat history header
		  this.updateChatHeader(this.selectedChatChannel, currentTicket);
				               

		  //3. Update message list
		  this.isScrollToBottom = true;
		  this.reloadChatHistory(sMsgList);

		  //4. update the chat history if there is past message ((only whatsapp will execute this logic))
		  if (this.selectedChatChannel == "whatsapp") {		// responseInvite== false) { // 20250407 Refactor the code to avoid using this boolean literal.
			  //this.returnPastMessageByTicketId(this.selectedTicketId);
			  
			  this.returnPastMessageAtBegin = true;			  
			  setTimeout(() => { this.returnPastMessageByTicketId(this.selectedTicketId); }, 800);
			  
			  setTimeout(() => { this.scrollToBottom() }, 1000);
		  }


		  //5. scroll to bottom 
		  setTimeout(() => { this.scrollToBottom(); }, 400);
		  setTimeout(() => { this.scrollToBottom(); }, 600);
	  };




	  //------------------------------------------------------------------------------------------------------------------------
	  //Conference features-----------------------------------------------------------------------------------------------------
	  //------------------------------------------------------------------------------------------------------------------------


	  //------------------------------------------------------------------------------------------------------------------------
	  //Interface
	  //-------------------------------------------------------------------------------------------------------------------------
	  addAgentToChat()	// call the interface to add agent to conference
	  {
		//  parent.$('#phone-panel')[0].contentWindow.getAgentListFromWise();
		  //this.gotAgentListTest(); // enable for testing  (((wait the API implementation)))
		  
		  //this.getAgentListByAPI();
		  
		  this.disableReloadMsg = true;	// any action in select bubble will reload all the messages, enable it for disable reload
		  parent.$('#phone-panel')[0].contentWindow.getOnlineAgentList();
	
		  //this.getWiseAgentList();
	  };
	  
	  getOnlineAgentListCallBack(agentArr)
	  {
		  
		  
		 try {
            // Use Promise.all to wait for all AJAX requests to resolve
            // const results = await Promise.all(fetchPromises);
      //      const agentArr = await getAgentList(sAgentId, sToken);
			
			$('#agent-list-campaign').html(tempCampaign);
			$('#agent-list-entry').html(this.selectedChatChannel);
			$('#agent-list-ticketid').html(this.selectedTicketId);
			$('#agent-list-message').val('');

			$('#agentListModal').modal('show');
		  
            // Combine all `details` from the results and assign to self.templateList
            let agentArrDivs = "";			let agentArrDiv = $('#agent-list-arr');			let availableAgent = 0;
				
			for (let theAgent of agentArr) {
				var theAgentId = theAgent.AgentId;
				if (theAgentId != loginId) {
						agentArrDivs += ('<div style="display:table-row;"><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="agentList" value="' + theAgentId + '" id="agent-' + theAgentId + '">' + theAgent.AgentName + '&nbsp;(ID: ' + theAgentId + ')<span class="circle"><span class="check"></span></span></label></div><label class="agent-list-cell pl-3" for="agent-' + theAgentId + '"></label></div>');					
						availableAgent += 1;
				}
			}

			if (availableAgent == 0) {
				agentArrDivs = '<div>--- ' + langJson['l-social-no-agents-available'] + ' ---</div>';
		    }
			
			agentArrDiv.html(agentArrDivs);

        } catch (error) {
            console.error('Error in fetching templates:', error);
        }
		  
		  
		  
	  }
	  
	  
	async getAgentListByAPI()
    {
        
        var URL = config.shandlerapi;	var sAgentId = top.loginId;		var sToken = top.token;

        function getAgentList(sAgentId, sToken)
        {
            return new Promise((resolve, reject) => {

                $.ajax({
                    type: "POST",
                    url: URL + "/api/GetOnlineAgent",
                    data: JSON.stringify({ "AgentId": sAgentId, "Token": sToken }),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (r) {
                        if (!/^success$/i.test(r.result || "")) {
                            console.log('error in getAgentListByAPI');

                            reject('error in getAgentListByAPI');
                            //callback(null, r);
                        } else {
                            resolve(r.details)

                        }
                    },

                    error: function (r) {
                        //callback(null, r);
                        console.log('error in getAgentList');
                        console.log(r);
                        reject('error in getAgentListByAPI');
                    }
                });
            });
        }

        try {
            // Use Promise.all to wait for all AJAX requests to resolve
            // const results = await Promise.all(fetchPromises);
            const agentArr = await getAgentList(sAgentId, sToken);
			
			$('#agent-list-campaign').html(tempCampaign);
			$('#agent-list-entry').html(this.selectedChatChannel);
			$('#agent-list-ticketid').html(this.selectedTicketId);
			$('#agent-list-message').val('');

			$('#agentListModal').modal('show');
		  
            // Combine all `details` from the results and assign to self.templateList
            let agentArrDivs = "";			let agentArrDiv = $('#agent-list-arr');			let availableAgent = 0;
				
			for (let theAgent of agentArr) {
				var theAgentId = theAgent.AgentId;
				if (theAgentId != loginId) {
						agentArrDivs += ('<div style="display:table-row;"><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="agentList" value="' + theAgentId + '" id="agent-' + theAgentId + '">' + theAgent.AgentName + '&nbsp;(ID: ' + theAgentId + ')<span class="circle"><span class="check"></span></span></label></div><label class="agent-list-cell pl-3" for="agent-' + theAgentId + '"></label></div>');					
						availableAgent += 1;
				}
			}

			if (availableAgent == 0) {
				agentArrDivs = '<div>--- ' + langJson['l-social-no-agents-available'] + ' ---</div>';
		    }
			
			agentArrDiv.html(agentArrDivs);

        } catch (error) {
            console.error('Error in fetching templates:', error);
        }

    };

	  
	  getWiseAgentList()
	  {	  //agentList come from LogonAgentEx in phone.html
		  if (parent.$('#phone-panel')[0].contentWindow.currentAgentList != null) {
			  chatService.gotAgentSelectList();		//create the radiobutton list for selection
			  $('#agentListModal').modal('toggle');
		  }
		  else
		  {
			  parent.$('#phone-panel')[0].contentWindow.getAgentListFromWise();
			  setTimeout(() => { this.getWiseAgentList(); }, 500); // Wait until Wise return the agentList
		  }
	  };
	  gotAgentSelectList() {	//copy from original function

		  var agentList = parent.$('#phone-panel')[0].contentWindow.currentAgentList;

		  $('#agent-list-campaign').html(tempCampaign);
		  $('#agent-list-entry').html(this.selectedChatChannel);
		  $('#agent-list-ticketid').html(this.selectedTicketId);
		  $('#agent-list-message').val('');

		  $('#agentListModal').modal('show');
		  var agentArrDiv = $('#agent-list-arr');
		  var agentArrDivs = ''; var availableAgent = 0;

		  //for (var i = 0; i < agentList.length; i++) {		// 20250403 Expected a `for-of` loop instead of a `for` loop with this simple iteration.
		 // var theAgentId = agentList[i].AgentID;
		  for (var theAgentId of agentList) {
			  if (theAgentId != loginId) {
				  var agentStatus = agentList[i].Status;

				  if (agentStatus == undefined) { agentStatus = 'IDLE'; }	// only for testing, should be commented

				  if (agentStatus == 'IDLE' || agentStatus == 'WORKING' || agentStatus == 'READY') {
					  //agentArrDivs += ('<div style="display:table-row;"><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="agentList" value="' + theAgentId + '" id="agent-' + theAgentId + '">' + agentList[i].AgentName + '&nbsp;(ID: ' + theAgentId + ')<span class="circle"><span class="check"></span></span></label></div><label class="agent-list-cell pl-3" for="agent-' + theAgentId + '">' + agentStatus + '</label></div>');
					  agentArrDivs += ('<div style="display:table-row;"><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="agentList" value="' + theAgentId + '" id="agent-' + theAgentId + '">' + agentList[i].AgentName + '&nbsp;(ID: ' + theAgentId + ')<span class="circle"><span class="check"></span></span></label></div><label class="agent-list-cell ps-3" for="agent-' + theAgentId + '"></label></div>');
					  availableAgent += 1;
				  }
			  }
		  }
		  if (availableAgent == 0) {
			  agentArrDivs = '<div>--- ' + langJson['l-social-no-agents-available'] + ' ---</div>';
		  }

		  agentArrDiv.html(agentArrDivs);
	  };

	  gotAgentListTest()
	  {	//copy from original function
		  var agentArr = top.agentList;
		  
			$('#agent-list-campaign').html(tempCampaign);			$('#agent-list-entry').html(this.selectedChatChannel);
			$('#agent-list-ticketid').html(this.selectedTicketId);	$('#agent-list-message').val('');				$('#agentListModal').modal('show');
			var agentArrDiv = $('#agent-list-arr');		var agentArrDivs= '';			var availableAgent = 0;

			for (let theAgent of agentArr) {
				var theAgentId = theAgent.AgentID;
				var agentName = theAgent.AgentName;
												
				//theAgent.AgentName 
				if (theAgentId != loginId && agentName.indexOf("test") === -1) {
					var agentStatus = theAgent.Status;
					if (agentStatus == undefined) {		agentStatus = 'IDLE';	}	// only for testing, should be commented
					if (agentStatus == 'IDLE' || agentStatus == 'WORKING' || agentStatus == 'READY') { 
//						agentArrDivs += ('<div style="display:table-row;"><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="agentList" value="' + theAgentId + '" id="agent-' + theAgentId + '">' + theAgent.AgentName + '&nbsp;(ID: ' + theAgentId + ')<span class="circle"><span class="check"></span></span></label></div><label class="agent-list-cell pl-3" for="agent-' + theAgentId + '">' + agentStatus + '</label></div>');
						agentArrDivs += ('<div style="display:table-row;"><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="agentList" value="' + theAgentId + '" id="agent-' + theAgentId + '">' + theAgent.AgentName + '&nbsp;(ID: ' + theAgentId + ')<span class="circle"><span class="check"></span></span></label></div><label class="agent-list-cell ps-3" for="agent-' + theAgentId + '"></label></div>');
						availableAgent += 1;
					}
				}
			}
			if (availableAgent == 0) {				agentArrDivs = '<div>--- ' + langJson['l-social-no-agents-available'] + ' ---</div>';			}
			agentArrDiv.html(agentArrDivs);
	  };

	  showBeInvitedModal(response)
	  {

		var agent = top.agentList.filter(i => i.AgentID == response.requestAgentId)[0];
		var agentName = agent.AgentName;
	  //acceptInvitedClicked

		parent.window.$('#be-invited-campaign')[0].innerHTML = parent.window[1].campaign;
		parent.window.$('#be-invited-entry')[0].innerHTML = response.ticket.Channel;  // need ...............response.channel;
		parent.window.$('#be-invited-ticketid')[0].innerHTML = response.ticket.TicketId;

		parent.window.$('#be-invited-agent')[0].innerHTML = agentName + " (ID: <span id='be-invited-agentId'>" + response.requestAgentId + "</span>)";
		parent.window.$('#be-invited-request')[0].innerHTML = response.message.length > 0 ? response.message : '[empty]';
		parent.window.$('#beInvitedModal').modal('show');

	  };

	  //-----------------------------------------------------------------------------------------------------------------------------------------
	  // API and WebSocket
	  //-----------------------------------------------------------------------------------------------------------------------------------------
	  sendInviteRequestClicked()		//original function name is sendRequestClicked
	  {
		  var ticketId = this.selectedTicketId;
		  var message = ($('#agent-list-message').val() || '').trim() || '';
		  var selectedInput = $("input[name='agentList']:checked");
		  var invitedAgentID = selectedInput.val();
		  var inviteMessage = message;				  //var inviteMessage = 'systemMsg-`!^~' + tempCampaign + '-`!^~' + tempEntry + '-`!^~' + message;
		  var token = top.token;
		  var agentId = loginId;

		  parent.$('#phone-panel')[0].contentWindow.inviteAgentByHandler(agentId, token, ticketId, parseInt(invitedAgentID), inviteMessage)
		  $('#agentListModal').modal('toggle');
	  };

	  sendInviteRequestcallBack(result)		//****not direct callback from  inviteAgentByHandler except error return
	  {
		  //{ "type": "responseConference", "details": { "targentAgentId": 6, "ticketId": 1023, "message": "RESPONSE YOU", "agentResponse": "Y" }, "agentResponse": "Y", "targentAgentId": 6 }
		  this.disableReloadMsg = true;
		  // returned from inviteAgentByHandler
		  if (result.details.agentResponse == undefined) {		// error in calling sHandler API
			  alert(result.details);
		  }
		  else
		  { 
			  var agentName = agentService.getAgentNameByID(result.details.targentAgentId);
			  var agentNameStr = agentName + ' (ID: ' + result.details.targentAgentId + ')';

			// returned from onInteractEvent
			  if (result.details.agentResponse == 'N') {
				  var alertMessage = agentNameStr + ' rejected your conference call request to the ticket ID: ' + result.details.ticketId;
				  alert(alertMessage);
			  }
			  else if (result.details.agentResponse == 'Y') {
				  var acceptMsg = "";
				  var statusMsg = "";

				  acceptMsg = agentNameStr + ' has accepted your request with message: ' + result.details.message;
				  this.updateChatStatus(acceptMsg);

				  statusMsg = agentNameStr + ' has joined to the chatroom';
				  this.updateChatStatus(statusMsg);

				  //Tam Lee(ID: 6) is not in the chat room anymore

				  var sTicketLst= parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == result.details.ticketId);
				  var sTicket	= sTicketLst[0];
				  var sMsglist	= sTicket.messages;
				  var sLastItem = sMsglist[sMsglist.length - 1];

				  //Copy array item
				  var newItem = JSON.parse(JSON.stringify(sLastItem));

				  newItem.SentBy = "group";		newItem.UpdatedBy = result.details.targentAgentId;		newItem.FileJson = "[]";
				  newItem.MessageType = "text"; newItem.MessageContent = acceptMsg + "," + statusMsg;	newItem.QuotedMsgBody = "";
						

				  sMsglist.push(newItem);

				  //parent.$('#phone-panel')[0].contentWindow.JoinedConferenceList.push(joinedConference);
				  setTimeout(() => { this.scrollToBottom(); }, 500);
			  }
		  }

	  };

	  updateChatForResponseInvite()		//responseInvitedCall set responseInvite = true in phone.html	=> call after initialized reloadTicketScreen   
	  {
		  this.resetChatHistory();
		  parent.$('#phone-panel')[0].contentWindow.responseInviteByHandler();
		  //this.returnPastMessageByTicketId();

	  }
	  updateChatForResponseInviteCallBack(ticketId)
	  {
		  this.updateBubbleStatus(ticketId, "Pending_Unread", false);
		  this.returnPastMessageByTicketId(ticketId);
	  }

	  leaveChatClicked(ticketId)
	  {
		  var loginId = top.loginId;
		  var token = top.token;
		  var selectedId = ticketId;



		  var ticket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == ticketId)[0];

		  //check whether the ticket is not origially assigned to login agent
		  if (ticket.AssignedTo != top.loginId) 
		  {
				parent.$('#phone-panel')[0].contentWindow.leaveConferenceByHandler(loginId, token, selectedId);
		  }
		  else
		  {
			  this.disableReloadMsg = true;
			  alert("Cannot leave the chat");
			  //return;		//	20250328	Remove this redundant jump.
		  }

		 

		
	  }

	  leaveChatCallBack(response)
	  {
		  if (response.result == 'success')
		  {
			  this.removeBubble(response.details.ticketId);
			  //this.updateStatusInAssignedList(response.details.ticketId, "Status", "selfLeave");			 
			  this.updateStatusInAssignedList(response.details.ticketId, "Status", "disappear");			 

			  if (response.details.ticketId == this.selectedTicketId)
			  {
					this.resetChatHistory();
					this.$histHeader.html('');
			  }
		  }
		  else
		  {
			  alert(response.details);
		  }
	  }

	  //Some action is done by other user, need to be handle them
	  //---------------------------------------------------------------------------------------------------------
	  //Message Come from another agent for leave the chat
	  receiveMessageForMemberLeave(ticketId, toRemoveAgentId)
	  {
		  var statusMsg		= "";
		  var agentName		= agentService.getAgentNameByID(toRemoveAgentId);
		  var agentNameStr	= agentName + ' (ID: ' + toRemoveAgentId + ')';

		  statusMsg = agentNameStr + ' is not in the chat room anymore' // ' has left the chatroom'; Changed on 2020-3 the user could be left because of barge in

		  var sTicketLst= parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == ticketId);
		  var sTicket	= sTicketLst[0];					  var sMsglist = sTicket.messages;
		  var sLastItem	= sMsglist[sMsglist.length - 1];

		 // this.updateStatusInAssignedList(ticketId, "Status", "memberLeave");
		  
		  //Copy array item
		  var newItem = JSON.parse(JSON.stringify(sLastItem));

		  newItem.SentBy	= "memberLeave";	newItem.MessageType		= "text";		newItem.QuotedMsgBody	= "";	
		  newItem.UpdatedBy = toRemoveAgentId;	newItem.MessageContent	= statusMsg;	newItem.FileJson		= "[]";		  

		  sMsglist.push(newItem);

		  this.updateChatByMemberLeave(ticketId, statusMsg);


	  }
	  //Message Come from another agent for end the group chat session
	  receiveMessageForEndTicket(details)
	  {
		  //assignedTo: 5, closedBy: 5, ticketId: XXXX
		  if (details.assignedTo == top.loginId)
		  {
			this.endSessionCallBack(details.ticketId)
		  }
		  else
		  { 
			  this.updateStatusInAssignedList(details.ticketId, "Status", "disappear");
			  this.removeBubble(details.ticketId);

			  //Only reset the screen if the case is ended by conference member AND the ticket is currently SHown on screen
			  if (details.ticketId == this.selectedTicketId)
			  {
				  this.resetChatHistory();	 
				  this.$histHeader.html('');
			  }
		  }
	  }
	  
	  testInviteRequestCallBack() {
		  var res = '{ "type": "responseConference", "details": { "targentAgentId": 6, "ticketId": 418, "message": "RESPONSE YOU", "agentResponse": "Y" }, "agentResponse": "Y", "targentAgentId": 6 }';

		  var response = JSON.parse(res);

		  this.sendInviteRequestcallBack(response);
	  }


	  //-----------------------------------------------------------------------------------------------------------------------------
	  //Canned response

	  //THe original logic is come from socialMedia.js -  cannedBtnClicked(campaign)
	  returnChannelImgByEntry(entry)
	  {
		  var channelImg = "webchat-icon-217.png";
		  if (entry == 'webchat') { channelImg = 'webchat-icon-217.png' }
		  if (entry == 'whatsapp') { channelImg = 'whatsapp.png'; }
		  if (entry == 'facebook') { channelImg = 'fbmsg-icon-256.png'; }
		  if (entry == 'fb_comment') { channelImg = 'facebook_icon.png'; }
		  if (entry == 'wechat') { channelImg = 'WeChat.png'; }
		  return channelImg;
	  }
  }


///////////////////////////////////////////////////
///  Util functions
//////////////////////////////////////////////////
function base64ToBlob(base64String, contentType = '') {
	const byteCharacters = atob(base64String);
	const byteArrays = [];

	for (let i = 0; i < byteCharacters.length; i++) {
		byteArrays.push(byteCharacters.charCodeAt(i));
	}

	const byteArray = new Uint8Array(byteArrays);
	return new Blob([byteArray], { type: contentType });
};


function returnDateForCRM(inputIsoDate)
{

	var dateISO = inputIsoDate.slice(0, 19)

	if (isToday(dateISO))
	{
		return moment(dateISO).format('HH:mm:ss');
	}
	else
	{
		return moment(dateISO).format('YYYY-MM-DD HH:mm:ss');
	}

}


function isToday(inputIsoDate)
{
	const today = moment().startOf('day'); // Get today's date at midnight 
	const dateToCheck = moment(inputIsoDate).startOf('day'); // Get input date at midnight 
	return today.isSame(dateToCheck);
}
// Example usage 

