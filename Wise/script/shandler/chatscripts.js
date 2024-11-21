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
	    selectedwebClientSenderId = "";
		selectedChatChannel = "";
		selectedEndUserName = "";
		PresentTicket = true;

	  init()
	  {
		    this.cacheDOM();
			this.bindEvents();
			//this.render();
		
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
		this.$textarea.on('keyup', this.addReplyMessageEnter.bind(this));

		this.$button.on('click', this.sendMessageByClick.bind(this));

		  //this.$testbutton.on('click', this.sendMessageByClick.bind(this));

//		  this.addTestBubble("Present", false, 1, 1111);
//		  this.addTestBubble("Present", false, 2, 2222);
//		  this.addTestBubble("Present", false, 3, 3333);
//		  this.moveBubbleToFirst(2222);

	  };

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

		  event.preventDefault(); // Prevent the default button click behavior
		  parent.$('#phone-panel')[0].contentWindow.sendMessageReturned = null;
		  parent.$('#phone-panel')[0].contentWindow.sendMessageByHandler(loginId, token, this.selectedChatChannel, this.selectedwebClientSenderId, "text", this.$textarea.val(), this.selectedTicketId);




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
		  parent.$('#phone-panel')[0].contentWindow.sendAttachmentByHandler(loginId, token, this.selectedChatChannel, this.selectedwebClientSenderId, "file", file, this.selectedTicketId);


	  };

	  sendAttachmentReset()
	  {
		  $('#fileInput')[0].value = "";
	  }
	  
	  sendMessageCallBack(sMsg)
	  {
		  this.updateBubbleHistory(sMsg);
		  //this.updateChatHeader();
		  this.addReplyMessageByText(sMsg);
	  };


	  incomeMessageCallBack(sMsg)
	  {
		  this.updateBubbleHistory(sMsg);

		  //Current Bubble Message
		  if (this.selectedTicketId == sMsg.TicketId) {
			  this.receiveMessage(sMsg);
		  }
		  else
		  {
			  this.updateBubbleStatus(sMsg.TicketId, "Pending_Unread", false);

		  }
	  };



	  updateBubbleStatus(inputTicketID, status, timeout)
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
					  // *********Update the logic in there
					  if (status == "Pending_Unread" && timeout == false)
					  {
						  parent.classList.add("bubble-unread");
					  }
				  }
			  });
		  });
	  }

	  // For chat history header
	  //---------------------------------------------
	  updateChatHeader(entry, visitorName, ticketId)
	  {
	  	this.$histHeader.html("");
		var templateResponse = this.chatlistHeaderTemplate;

		var channelImg = "webchat-icon-217.png";
		if (entry == 'webchat')		{	channelImg = 'webchat-icon-217.png' }
		if (entry == 'whatsapp')	{	channelImg = 'whatsapp.png';		}
		if (entry == 'facebook')	{	channelImg = 'fbmsg-icon-256.png';  }
		if (entry == 'fb_comment')	{	channelImg = 'facebook_icon.png';	} 
		if (entry == 'wechat')		{	channelImg = 'WeChat.png';			}

		  var contextResponse = {
			  ticketId: ticketId,
			  name: visitorName,
			  language: "English",
			  channelImg: channelImg,
			  channel: entry
		  };


		this.$histHeader.append(templateResponse(contextResponse));
	  };

	  // For chat history
	  //----------------------------------------------------------------------------------------------------------------------------------

	  //Visitor (Receive) side
	  //--------------------------------------
	  
	  //sMsg.MessageContent, sMsg.sendby
	  receiveMessage(sMsg)
	  {
			
			var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == sMsg.TicketId);
			var sEndUserName = sTicket[0].EndUserName;


			this.messageReceived = sMsg.MessageContent;
	  		var templateResponse = this.visitorMessageTemplate;


			var dateISO = sMsg.UpdatedAt;
			var mDate = moment(dateISO).format('hh:mm:ss');


           var attachmentTemplate = this.visitorMessageWithImageTemplate;
		 
		  //this.$chatHistory[0].getElementsByClassName('content-bubble-content')[0].append("abc");

		  
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
				  
				  var dateISO = sMsg.UpdatedAt;
				  var mDate = moment(dateISO).format('hh:mm:ss');



				  //Need to update to get AgentList function
				  var contextResponse = {
					  response: sMsg.MessageContent,
					  SentBy: top.agentName,
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

				  var dateISO = sMsg.UpdatedAt;
				  var mDate = moment(dateISO).format('hh:mm:ss');

				  var context = {
					  SentBy: top.agentName,
					  messageOutput: "{{attachment}}",
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
		  if (sMsg.MessageType = "text" && sMsg.FilesJson.length < 4)
		  {

			  var template = this.agentMessageTemplate;

			  var dateISO = sMsg.UpdatedAt;
			  var mDate = moment(dateISO).format('hh:mm:ss');

			  var context = {
				  SentBy: top.agentName,
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
			  var Fileurl = FileList[0].EproFileUrl;
			  var FileMime = FileList[0].MimeType;

			  if (FileMime.startsWith('image/'))
			  {
				  var template = this.agentMessageWithImageTemplate;
				  var dateISO = sMsg.UpdatedAt;
				  var mDate = moment(dateISO).format('hh:mm:ss');

				  var displayImage = "max-width:100%;max-height:200px";

				  //Need to update to get AgentList function
				  var contextResponse = {
					  response: sMsg.MessageContent,
					  SentBy: top.agentName,
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

				  var dateISO = sMsg.UpdatedAt;
				  var mDate = moment(dateISO).format('hh:mm:ss');

				  var context = {
					  SentBy: top.agentName,
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
			if (event.keyCode === 13) {
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
	  updateStatus(statusMessage)
	  {
		  var template  = this.statusUpdateTemplate;
		  var context = { status: statusMessage	};
		 this.$chathistory.append(template(context));
	  };

	  reloadChatHistory(sMsglist)
	  {
		  //Reset the chat history screen
		  $('#chatHistory').html('');

		  if (sMsglist != null) {
			  for (var i = 0; i < sMsglist.length; i++)
			  {
				  //for (var i = sMsglist.length - 1; i >= 0; i--) {
				  let sMsg = sMsglist[i];

				  if (sMsg.SentBy == "user") {

					  this.receiveMessage(sMsg);
				  }
				  else {
					  this.addReplyMessageByText(sMsg);
				  }

				  this.scrollToBottom();
			  }
		  }
	  };

	  //function update all the msglist in assignedlist
	  updateBubbleHistory(sMsg) {
		  var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == sMsg.TicketId);
		  var sMsglist = sTicket[0].messages;
		  sMsglist.push(sMsg);

		  var elements = document.getElementById('bubble-list-inner').querySelectorAll("#bubble-ticket");

		  elements.forEach((element, index) => {
			  var messageList = JSON.parse(element.getElementsByClassName('bubble-messagelist')[0].innerHTML);
			  messageList.push(sMsg);
			  element.getElementsByClassName('bubble-messagelist')[0].innerHTML = JSON.stringify(messageList);
		  });

	  };

	  // For ticket (bubble) list
	  //---------------------------------------------
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
		this.selectedticketId			= e.getElementsByClassName('bubble-id')[0].innerHTML;
		this.selectedChatChannel 		= e.getElementsByClassName('bubble-channel')[0].innerHTML;
		this.selectedEndUserName		= e.getElementsByClassName('bubble-subject')[0].innerHTML;

		//console.log("selected ticket id:" + this.selectedticketId.toString());

		// Update the selected class CSS
		e.classList.add("bubble-present");
		e.classList.remove("bubble-unread");

	    var selectedTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == e.getElementsByClassName('bubble-id')[0].innerHTML);

		var sMsglist = selectedTicket[0].messages;
		this.reloadChatHistory(sMsglist);

			

	  };


	  moveBubbleToFirst(inputTicketID) {

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
		  
		  var dateISO = ticket.UpdatedAt;
		  
		  var mDate = moment(dateISO).format('hh:mm:ss');
		  
		  	//var dateISO = new Date(ticket.UpdatedAt);
			//var dateUpdateAt = dateISO.getFullYear()+'-' + (dateISO.getMonth()+1) + '-'+dateISO.getDate();//prints expected format.

			var jsonMsgList = JSON.stringify(messageList);

		  

			//var dateUpdateAt = dateISO.toTimeString().split(' ')[0];
			var context = { 
				endUserId: ticket.EndUserId,
				endUserName: ticket.EndUserName,
				endUserEmail: ticket.EndUserEmail,
				endUserPhone: ticket.EndUserPhone,
				lastMessage: ticket.LastMessage, 
				ticketId: ticket.TicketId,
				updatedAt: mDate,				
				deviceId: ticket.DeviceId,
				channel:  ticket.Channel,
				messageList: jsonMsgList
			};

			var template  = this.bubbleTemplate;

			if (status == "Pending" && timeout == false)
			{
				context.bubblestatus = "bubble-container";

			}
			else if (status == "Present" && timeout == false)
			{
				this.selectedTicketId 			= context.ticketId;
				this.selectedwebClientSenderId	= context.endUserId;
				this.selectedChatChannel 	  	= ticket.Channel;
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
				
			//var dateUpdateAt = dateISO.toTimeString().split(' ')[0];
			var context = { 
				endUserId: "123",
				endUserName: name,
				ticketId: ticketID,
				endUserId: "14224242424"
			};

			var template  = this.bubbleTemplate;

			if (status == "Pending" && timeout == false)
			{
				context.bubblestatus = "bubble-container";
			}
			else if (status == "Present" && timeout == false)
			{
				this.selectedTicketId = context.ticketId;
				this.selectedwebClientSenderId	= context.endUserId;
				this.selectedChatChannel 		= "web";
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

	  };

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

				this.selectedTicketId		   	= currentTicket.ticketId;
				this.selectedwebClientSenderId 	= currentTicket.selectedwebClientSenderId;
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
					} else {
						this.addBubble("Pending", false, assignedLst[i], assignedLst[i].messages);
					}
				}
			}

			//2. Update Chat history header
			this.updateChatHeader(this.selectedChatChannel, this.selectedEndUserName, this.selectedTicketId)
				               

		  //3. Update message list
			//*****currentMsgList is only be used for getTicket
			var sMsgList= parent.$('#phone-panel')[0].contentWindow.currentMsglist;
			this.reloadChatHistory(sMsgList);
		
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
	  cannedResponse()
	  {
		
		var popupCampaign = "";
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
  }
  


