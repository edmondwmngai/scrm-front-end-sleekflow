  class chat
  {
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
		PresentTicket = true;

	  init()
	  {
		    this.cacheDOM();
			this.bindEvents();
			this.render();
		
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
			this.statusUpdateTemplate		=	Handlebars.compile( $("#status_update_template").html());
	  };
	  
	  bindEvents()
	  {
		this.$button.on('click', this.addReplyMessageByClick.bind(this));
		this.$textarea.on('keyup', this.addReplyMessageEnter.bind(this));

		this.$testbutton.on('click', this.sendByClick.bind(this));
		//this.addTestBubble("Present",false);
	  };

	  render()
	  {
		  
		this.scrollToBottom();
		if (this.messageToSend.trim() !== '') 
		{

			//var ticketList = parent.$('#phone-panel')[0].contentWindow.shandler.tickets;
	//		var result = this.sendMessageByAPI(channel, webClientSenderId, messageType, messageContent, tickertId)

	//		if (result)
	//		{
				var template = this.agentMessageTemplate;
				var context = { 
					messageOutput: this.messageToSend,
					time: this.getCurrentTime()
				};

				this.$chatHistory.append(template(context));
				this.scrollToBottom();
				this.$textarea.val('');
	//		}
	    }
	  };


	  //On  UI level=>   sendByClick();
	  //sendMessageByAPI ()
	  //phone.html call sendMessageByHandler();
	  //wss sendMessage();

	  sendByClick()
	  {
			//var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
			//var token = sessionStorage.getItem('scrmToken') || '';
			//var agentName = sessionStorage.getItem('scrmAgentName') || '';

			var loginId = top.loginId;
			var token = top.token;
			
			event.preventDefault(); // Prevent the default button click behavior
			parent.$('#phone-panel')[0].contentWindow.sendMessageReturned= null;
            parent.$('#phone-panel')[0].contentWindow.sendMessageByHandler(loginId, token, "web", this.selectedwebClientSenderId, "text", this.$textarea.val(), this.selectedTicketId);
				
	  }

	  sendByAPICallBack(msg)
	  {
				parent.$('#phone-panel')[0].contentWindow.currentMsglist.push(msg);
				
				this.updateChatHeader();
				this.messageToSend = this.$textarea.val();
				this.$textarea.val('');
				this.render();         
	  
	  };

	  receiveMessageCallBack(sMsg)
	  {
			parent.$('#phone-panel')[0].contentWindow.currentMsglist.push(sMsg);
			this.receiveMessage(sMsg.MessageContent, sMsg.sendby);
			this.updateBubbleHistory(sMsg);
	  
	  };
	  // For chat history header
	  //---------------------------------------------
	  updateChatHeader()
	  {
	  		this.$histHeader.html("");
		  	var templateResponse = 	this.chatlistHeaderTemplate;
			this.$histHeader.append(templateResponse())
	  };

	  updateBubbleHistory(msg)
	  {
	

		  var elements = document.getElementById('bubble-list-inner').querySelectorAll("#bubble-ticket");


		  //document.getElementsByClassName('.bubble-container'); // Use parentElement.querySelectorAll to get all elements with class name 'box' 
		 //  const parentDiv = document.getElementsByClassName('bubble-container bubble-present');

		  //const keywordElements = document.querySelectorAll('[class*="keyword"]');


//			const elements = parentDiv.querySelectorAll('.bubble-container');
		  //getElementsByClassName('bubble-id')[0].innerHTML;

		  //parentDiv[1].querySelectorAll('[class*="bubble-container"]');
			elements.forEach((element, index) => {	
															var messageList = JSON.parse(element.getElementsByClassName('bubble-messagelist')[0].innerHTML); 
															messageList.push(msg);
															element.getElementsByClassName('bubble-messagelist')[0].innerHTML =  JSON.stringify(messageList);
												});

	  }

	  // For chat history
	  //---------------------------------------------


	  //Visitor (Receive) side
	  //--------------------------------------
	  receiveMessage(message, sendby)
	  {
			this.messageReceived = message;
	  		var templateResponse = this.visitorMessageTemplate;
			var contextResponse = { 
			  response: this.messageReceived,
			  SentBy: this.sendBy,
			  time: this.getCurrentTime()
			};

			this.$chatHistory.append(templateResponse(contextResponse))
	  };
	  
	  //Agent (Reply) side
	  //------------------------------------------------------------------
	  addReplyMessageByText(message)
	  {
	  		this.messageToSend = message;
			this.render();
	  };
	  
	  addReplyMessageByClick() 
	  {		
			this.updateChatHeader();
			this.messageToSend = this.$textarea.val()
			this.render();  
			

	  };

	  	  
	
	  addReplyMessageEnter(event) {
			// enter was pressed
			if (event.keyCode === 13) {
			  this.addReplyMessageByClick();
			}
	  };
	  //--------------------------------------------------------------------
	  scrollToBottom() {
		   this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
	  };
	  getCurrentTime() {
		  return new Date().toLocaleTimeString().
				  replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
	  };
	  getRandomItem(arr) {
		  return arr[Math.floor(Math.random()*arr.length)];
	  };
	
	  //Update the status in chat history, eg. timeout and update the status at the end of chat history
	  updateStatus(statusMessage)
	  {
		  var template  = this.statusUpdateTemplate;
		  var context = { status: statusMessage	};
		 this.$chathistory.append(template(context));
	  };

	  // For ticket (bubble) list
	  //---------------------------------------------
	  //When agent click the left bubble box, the box will be highlighted 
	  selectTicket(e)
	  {

		//Get the value from each Bubble
		//e.getElementsByClassName('bubble-subject')[0].innerHTML;
		
		console.log(e.getElementsByClassName('bubble-subject')[0].innerHTML);

		// Loop all the ticket to reset not selecte
		const elements = e.parentElement.querySelectorAll('.bubble-container');
		elements.forEach((element, index) => {	element.classList.remove("bubble-present")   });
		
		
		this.selectedwebClientSenderId  = e.getElementsByClassName('bubble-user-id')[0].innerHTML;
		this.selectedticketId			= e.getElementsByClassName('bubble-id')[0].innerHTML;
		
		console.log("selected ticket id:" + this.selectedticketId.toString());


		// Update the selected class CSS
		e.classList.add("bubble-present");
		e.classList.remove("bubble-unread");
		
		// **Not finished. Call the function from handler to load the messagelist

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
				this.selectedTicketId = context.ticketId;
				this.selectedwebClientSenderId= context.endUserId;
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

	  addTestBubble(status, timeout)
	  {



				
			//var dateUpdateAt = dateISO.toTimeString().split(' ')[0];
			var context = { 
				endUserId: "123",
				endUserName: "Name",
				ticketId: 123444,
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
				this.selectedwebClientSenderId= context.endUserId;
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

	  MoveBubbleAtFirst(status, timeout, ticket, messageList)
	  {


	  };
	  
	  refreshTicketList()
	  {
	  
			this.$ticketList.empty();


			// the following data is for testing

	 };

	//---------------------------------------------------------------------------------------------------------------------------------------------///
	// For procedure including multi-steps
	//---------------------------------------------------------------------------------------------------------------------------------------------///

		//Tiggered by click the quening list, all the information in chatbot will be reloaded

		//------------------------------------------------------------------------------------------------------------------------

	
	  reloadByGetTicket()
	  {
	  
			//1. Update Bubble ticket list
		  	var ticketList = parent.$('#phone-panel')[0].contentWindow.shandler.tickets;
		    var messageList = parent.$('#phone-panel')[0].contentWindow.currentMsglist;
		    var currentTicket= parent.$('#phone-panel')[0].contentWindow.currentTicket;
			var assignedLst= parent.$('#phone-panel')[0].contentWindow.AssignedTicketList;

			//queueList.sort(function (a,b) { var e =a.showPriority -b.showPriority; if(e==0) return (b.waitTime-a.waitTime); else return e; });

		  const elements = document.getElementById('bubble-list-inner').querySelectorAll("#bubble-ticket");
		    elements.forEach((element, index) => { element.classList.remove("bubble-present") });


			if (currentTicket != null)
			{
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
			this.updateChatHeader();

			//3. Update message list
			var sMsglist= parent.$('#phone-panel')[0].contentWindow.currentMsglist;

			if (sMsglist != null)
			{
				for (var i = 0; i < sMsglist.length; i++) {
				//for (var i = sMsglist.length - 1; i >= 0; i--) {
					let sMsg = sMsglist[i];

					if (sMsg.SentBy == "user")
					{
						this.receiveMessage(sMsg.MessageContent, sMsg.sendby);
					}
					else
					{
						this.addMessageByText(sMsg.MessageContent, sMsg.sendby);
					}
				}
           }
	  
		
	  };

	  fillChatHistory()
	  {




	  };

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
  


