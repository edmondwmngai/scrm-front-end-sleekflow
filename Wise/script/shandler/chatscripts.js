  class chat
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

	     selectedCannedFiles = [];

		//Contacted us in the last hour: Last Ticket ID: 1386264423 on 2024-11 - 29 12: 17: 37
	  init()
	  {
		    this.cacheDOM();
			this.bindEvents();
		
			 //this.updateStatus("Session Timeout");			 //this.updateStatus("Session Ended");
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
	  
	  bindEvents()
	  {
		//this.$button.on('click', this.addReplyMessageByClick.bind(this));
		this.$textarea.on('keypress', this.addReplyMessageEnter.bind(this));

		this.$button.on('click', this.sendMessageByClick.bind(this));

		  //this.$testbutton.on('click', this.sendMessageByClick.bind(this));

		//  this.addTestBubble("Present", false, "Tiger", 418);
      //    this.addTestBubble("Present", false, "Test", 419);
		  //this.addTestBubble("Present", false, 3, 3333);
//		  this.moveBubbleToFirst(2222);

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
		  var agentName = top.agentName;

		  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == this.selectedTicketId);


		  event.preventDefault(); // Prevent the default button click behavior
		  parent.$('#phone-panel')[0].contentWindow.sendMessageReturned = null;

		  parent.$('#phone-panel')[0].contentWindow.sendMessageByHandler(loginId, token, "text", this.$textarea.val(), sTicket[0]);




	  };

	  sendAttachmentByClick()
	  {
		  var loginId = top.loginId;
		  var token = top.token;
		  var agentName = top.agentName;

		  var fileInput = $('#fileInput')[0]; 
		  var file = fileInput.files[0];

		  event.preventDefault(); // Prevent the default button click behavior
		  parent.$('#phone-panel')[0].contentWindow.sendMessageReturned = null;

		  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == this.selectedTicketId);		

		  parent.$('#phone-panel')[0].contentWindow.sendAttachmentByHandler(loginId, token, "file", file, sTicket[0]);

	  };
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
	  };

	  incomeMessageCallBack(sMsg)
	  {
		  this.updateChatMessageHistory(sMsg);

		  //Current Bubble Message
		  if (this.selectedTicketId == sMsg.TicketId) {
			  this.receiveMessage(sMsg);
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

			
 //			var fileInput = $('#fileInput')[0];
//			var file = fileInput.files[0];

			var fileObj = new File([fileBlob], fileName, { type: fileType });
			var dataTransfer = new DataTransfer();

			//Use dataTransfer object insert into viewdata 
	        dataTransfer.items.add(fileObj);
			
			var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == ticketId);
			parent.$('#phone-panel')[0].contentWindow.sendAttachmentByHandler(loginId, token, "file", dataTransfer.files[0], sTicket[0]);
	  };



	  endSession() {

		  var endSession = false;

		  //Confirm by user to end the session
		  if (confirm('End Session')) {
			  endSession = true;
		  }
		  else
		  {
			  endSession = false;
		  }

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
		  this.updateChatEndSession(ticketId);
		  this.scrollToBottom();
	  };

	  sessionTimeoutCallBack(ticketId)
	  {
		  this.updateChatSessionTimeout(ticketId);
		  this.scrollToBottom();
	  };

	  
	  returnPastMessageByTicketId(ticketId)
	  {

		  var TicketId = this.selectedTicketId;
		  var loginId = top.loginId;
		  var token = top.token;

		  //agentid, token, userId, msgId, limit



		  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == ticketId);

		  parent.$('#phone-panel')[0].contentWindow.returnMessagesFromHandlerByUserId(ticketId, loginId, token, sTicket[0].EndUserId, sTicket[0].messages[sTicket[0].messages.length - 1].MessageId, 20);
	  };

	  returnPastMessageByTicketIdCallBack(ticketId, msgList)
	  {



		  if (msgList != null)
		  { 
			var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == ticketId);

			  msgList = msgList.concat(sTicket[0].messages);

			  msgList = msgList.sort((a, b) => { return a.MessageId - b.MessageId; });
			  msgList.forEach(item => { item.TicketId = ticketId; });

			  sTicket[0].messages = msgList;


			  console.log(JSON.stringify(sTicket[0]));

			  this.reloadChatHistory(sTicket[0].messages);

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

		  var pastTicket = this.returnPastTicketFromSameVisitor(sTicket.TicketId);
		  if (pastTicket != null)
		  {

			  //Contacted us in the last hour: Last Ticket ID: 1386264423 on 2024-11 - 29 12: 17: 37
			  contextResponse.additionalInfo = "Contacted us in the last hour: Last Ticket ID: " + pastTicket.TicketId + " on " + pastTicket.UpdatedAt.slice(0, 19);
		  }


		this.$histHeader.append(templateResponse(contextResponse));
	  };



	  returnPastTicketFromSameVisitor(ticketId)
	  {

		  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == ticketId);
		  var sEndUserName	= sTicket[0].EndUserName;

		  var EndUserId = sTicket[0].EndUserId;

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

			var sEndUserName = sTicket[0].EndUserName;

			this.messageReceived = sMsg.MessageContent;
	  		var templateResponse = this.visitorMessageTemplate;

			//The moment js cannot handle the iso date format, if full date format the output is wrong. Please update the moment js above 2.16.0
			var dateISO = sMsg.UpdatedAt.slice(0, 19); 
			var mDate = moment(dateISO).format('HH:mm:ss');
		  
		  //Check the filejson is empty or not
		  if (sMsg.FilesJson.length < 3)
		  {
			  var contextResponse = {
				  response: sMsg.MessageContent,
				  SentBy: sEndUserName,
				  time: mDate
			  };
			  this.$chatHistory.append(templateResponse(contextResponse));
		  }
		  else
		  {
			  var FileList = [];

			  FileList = JSON.parse(sMsg.FilesJson);

			  //FileList[0].MimeType
			  var Filename = FileList[0].EproFilename;
			  var Fileurl = FileList[0].EproFileUrl;
			  var FileMime = FileList[0].MimeType;

			  if (FileMime.startsWith('image/')) {
				  
				  var dateISO = sMsg.UpdatedAt.slice(0, 19); 
				  
				  var mDate = moment(dateISO).format('HH:mm:ss');

				  var attachmentTemplate = this.visitorMessageWithImageTemplate;

				  //var agentName = agentService.getAgentNameByID(this.currentSelectedAgentId);

				 // this.selectedAgentId = currentTicket.AssignedTo;

				  //Need to update to get AgentList function
				  var contextResponse = {
					  response: sMsg.MessageContent,
					  SentBy: sEndUserName,
					  time: mDate,
					  FileFileName: Filename,
					  FileUrl: Fileurl
				  };

				  this.$chatHistory.append(attachmentTemplate(contextResponse));
			  }
			  else {
				  var template = this.visitorMessageTemplate;

				  var aTag = "<div class='position-relative'>" +
					  "<a href='{{FileUrl}}' target='_blank' download=''>{{FileName}}</a>" +
					  "<span class='wa-sent-success'>sent</span></div>";
				  aTag = aTag.replace("{{FileUrl}}", Fileurl);
				  aTag = aTag.replace("{{FileName}}", Filename);

				  var dateISO = sMsg.UpdatedAt.slice(0, 19); 
				  var mDate = moment(dateISO).format('HH:mm:ss');

				  var context = {
					  SentBy: sEndUserName,
					  response: "{{attachment}}",
					  time: mDate
				  };

				  var output = template(context);
				  output = output.replace("{{attachment}}", aTag);
				  this.$chatHistory.append(output);
				  this.$textarea.val('');

			  }
		  }


		  this.scrollToBottom();
	  };
	  	  	  
	  //Agent (Reply) side
	  //------------------------------------------------------------------
	  addReplyMessageByText(sMsg)
	  {


		  var agentName = agentService.getAgentNameByID(sMsg.UpdatedBy);

		  
		  if (sMsg.MessageType = "text" && sMsg.FilesJson.length < 4)
		  {

			  var template = this.agentMessageTemplate;


			  var dateISO = sMsg.UpdatedAt.slice(0, 19); 
			  var mDate = moment(dateISO).format('HH:mm:ss');

			  var context = {
				  SentBy: agentName,
				  messageOutput: sMsg.MessageContent,
				  time: mDate
			  };

			  this.$chatHistory.append(template(context));

		  }
		  else if (sMsg.MessageType = "file" || sMsg.FilesJson.length > 4)
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
				  var dateISO = sMsg.UpdatedAt.slice(0, 19); 
				  var mDate = moment(dateISO).format('HH:mm:ss');

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

				  var dateISO = sMsg.UpdatedAt.slice(0, 19); 
				  var mDate = moment(dateISO).format('HH:mm:ss');

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

		  this.scrollToBottom();
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
	  scrollToBottom() {
		   this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
	  };

	  getCurrentTime() {
		  return new Date().toLocaleTimeString().
				  replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");fcall
	  };
	
	  //Update the status in chat history, eg. timeout and update the status at the end of chat history
	  updateChatStatus(statusMessage)
	  {
		  var template  = this.statusUpdateTemplate;
		  var context = { status: statusMessage	};
		  this.$chatHistory.append(template(context));
	  };

	  reloadChatHistory(sMsglist)
	  {
		  //Reset the chat history screen
		  $('#chatHistory').html('');
		  this.disableInput(false);

		  var ticketID = 0;

		  if (sMsglist != null) {
			  for (var i = 0; i < sMsglist.length; i++)
			  {
				  //for (var i = sMsglist.length - 1; i >= 0; i--) {
				  let sMsg = sMsglist[i];

				  console.log(sMsg.MessageId);

				  if (sMsg.SentBy == "user") {

					  this.receiveMessage(sMsg);
				  }
				  else {
					  this.addReplyMessageByText(sMsg);
				  }

				  this.scrollToBottom();
			  }
		  }

		  //Current present (selected ticket)
		  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == sMsglist[0].TicketId);
		  var ticketStatus = sTicket[0].Status;

		  if (ticketStatus == "closed")
		  {	
			  this.updateChatEndSession(this.selectedTicketId);
		  }

		  if (ticketStatus == "timeout") {

			  this.updateChatSessionTimeout(this.selectedTicketId);
		  }
	  };

	  //function update all the msglist in assignedlist
	  updateChatMessageHistory(sMsg)
	  {
		  //Update the client side Ticket AssignedList Message List for specified ticket
		  var sTicketLst = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == sMsg.TicketId);
		  var sTicket = sTicketLst[0];
		  var sMsglist = sTicket.messages;
		  sMsglist.push(sMsg);

		  //Update back the ticket information
		  sTicket.UpdatedAt = sMsg.UpdatedAt;
		  sTicket.LastMessage= sMsg.MessageContent;


		  //Also update the current Status of Ticket Bubble
		  var elements = document.getElementById('bubble-list-inner').querySelectorAll("#bubble-ticket");

		  elements.forEach((element, index) =>
		  {
			  var dateISO = sMsg.UpdatedAt.slice(0, 19); 
			  var mDate = moment(dateISO).format('HH:mm:ss');

			  var bubbleId = element.getElementsByClassName('bubble-id')[0].innerHTML;

			  if (bubbleId.trim() == sMsg.TicketId)
			  {
				  var messageList = JSON.parse(element.getElementsByClassName('bubble-messagelist')[0].innerHTML);
				  messageList.push(sMsg);
				  element.getElementsByClassName('bubble-messagelist')[0].innerHTML = JSON.stringify(messageList);
				  element.getElementsByClassName('bubble-time')[0].innerHTML = mDate;
				  element.getElementsByClassName('bubble-message mr-auto')[0].innerHTML = sTicket.LastMessage;
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

	  updateChatEndSession(ticketId)
	  {
		  this.disableInput(true);
		  this.updateBubbleStatus(ticketId, "Session_End", true);

		  this.updateStatusInAssignedList(ticketId, "Status", "closed");
		  this.updateChatStatus("Session Ended");

		  this.scrollToBottom();

	  };

	  updateChatSessionTimeout(ticketId)
	  {
		  // "Session Ended"
		  this.disableInput(true);
		  this.updateBubbleStatus(ticketId, "Session_End", true);
		  this.updateStatusInAssignedList(ticketId, "Status", "timeout");
		  this.updateChatStatus("Session Timeout");
		  this.updateChatStatus("Session Ended");

		  this.scrollToBottom();
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



		var sMsglist = selectedTicket[0].messages;

		this.reloadChatHistory(sMsglist);
		this.updateChatHeader(this.selectedChatChannel, selectedTicket[0]);
		  searchInput(selectedTicket[0]);	


		//  this.returnMessagesPastMessage(this.selectedTicketId);

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
		  console.log(JSON.stringify(ticket));
         console.log(ticket.UpdatedAt);
		  
		  var dateISO = ticket.UpdatedAt.slice(0, 19); 
		  var mDate = moment(dateISO).format('HH:mm:ss');
		  
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

			if (status == "Pending" && timeout == false)
			{
				context.bubblestatus = "bubble-container";

			}
			else if (status == "Present" && timeout == false)
			{
				this.selectedTicketId = context.ticketId;
				this.selectedAgentId = context.agentId;
				this.selectedwebClientSenderId	= context.endUserId;
				this.selectedChatChannel		= context.channel;
				this.selectedEndUserName		= context.EndUserName;
				context.bubblestatus = "bubble-container bubble-present";
			}
			else if (status == "Pending_Unread" && timeout == false)
			{
				context.bubblestatus = "bubble-container bubble-unread";
			}

			else if (status == "Pending" && timeout == true)
			{
				context.bubblestatus = "bubble-container bubble-present bubble-closed";
			}
			else if (status == "Present" && timeout == true)
			{
				context.bubblestatus = "bubble-container bubble-closed";
	     	}	

			// Always insert the elements at first
			this.$ticketList.prepend(template(context));

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

			if (status == "Pending" && timeout == false)
			{
				context.bubblestatus = "bubble-container";
			}
			else if (status == "Present" && timeout == false)
			{
				this.selectedTicketId = context.ticketId;
				this.selectedAgentId  = context.agentId;
				this.selectedwebClientSenderId	= context.endUserId;
				this.selectedChatChannel = context.Channel;
				this.selectedEndUserName		= context.endUserName;
				context.bubblestatus = "bubble-container bubble-present";
			}
			else if (status == "Pending_Unread" && timeout == false)
			{
				context.bubblestatus = "bubble-container bubble-unread";
			}

			else if (status == "Pending" && timeout == true)
			{
				context.bubblestatus = "bubble-container bubble-present bubble-closed";
			}
			else if (status == "Present" && timeout == true)
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

	  updateBubbleInfo(sTicket)
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
				  if (sub.innerHTML.trim() === specifiedValue.toString())
				  {
					  parent.getElementsByClassName('bubble-message mr-auto')[0].innerHTML = sTicket.messages[sTicket.messages.length - 1].MessageContent;
				  }
			  });
		  });
	  };

	  updateBubbleStatus(inputTicketID, status, timeout) {
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
					  // *********Update the logic in there
					  if (status == "Pending_Unread" && timeout == false) {
						  parent.classList.add("bubble-unread");
					  }
					  if (status == "Session_End" && timeout == true)
					  {
						  parent.classList.add("bubble-closed");
						  parent.getElementsByClassName('bubble-message mr-auto')[0].innerHTML = "Session Closed";
						  parent.getElementsByClassName('bubble-icon')[0].style = "opacity: 0.1;";
						  parent.getElementsByClassName('bubble-subject')[0].style = "color:grey";
						  parent.querySelector('#bubble-add-agent').style.visibility = "hidden";
						  parent.querySelector('#bubble-leave-chat').style.visibility = "hidden";
					  }
				  }
			  });
		  });
	  };

	  updateStatusInAssignedList(ticketId, fieldName, value)
	  {
		  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == ticketId);

		  if (fieldName = "Status")
		  {
			  sTicket[0].status = value;
		  }
	  }
	 
	//---------------------------------------------------------------------------------------------------------------------------------------------///
	// For procedure including multi-steps
	//---------------------------------------------------------------------------------------------------------------------------------------------///
	//Tiggered by click the quening list, all the information in chatbot will be reloaded

		//------------------------------------------------------------------------------------------------------------------------
		
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
		  this.reloadChatHistory(sMsgList);


		  //4. update the chat history if there is past message
		  this.returnPastMessageByTicketId(this.selectedTicketId);
	  };




	  //------------------------------------------------------------------------------------------------------------------------
	  //Unfinished AREA------------------------------------------------------------------------------------------------------------------------
	  //------------------------------------------------------------------------------------------------------------------------
	  addAgent()
	  {
			// The original logic come from socialMEdia.js addAgent then pass to  main.js 8.5 and 9  getAgentList and onWiseAgentList

			
	  
			//function addAgent(ticketId, campaign, entry) {
			//tempCampaign = campaign;
			//tempEntry = entry;
			//tempTicketId = ticketId;
			//parent.getAgentList('social-media-main', campaign, entry);


			//var ticketId = tempTicketId;

			var tempCampaign= "";
			var tempEntry	= "";
			var message		= "";


			var message = ($('#agent-list-message').val() || '').trim() || '';
			var selectedInput = $("input[name='agentList']:checked");
			var invitedAgentID = selectedInput.val();
			var inviteMessage = 'systemMsg-`!^~' + tempCampaign + '-`!^~' + tempEntry + '-`!^~' + message;

			//parent.document.getElementById("phone-panel").contentWindow.wiseInviteAgentToChat(invitedAgentID, ticketId, inviteMessage);

			//tempTicketId = null;
			$('#agentListModal').modal('toggle');
	  
	  };

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

