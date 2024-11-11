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

		//this.$testbutton.on('click', this.sendByClick.bind(this));

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
	  sendByClick()
	  {
				this.sendMessageByAPI("web", "ccf94713-d0cb-4a84-873a-bd4a7589a751","file", "This is a testing message from shandler", "123245");
	  }



	  sendMessageByAPI(channel, webClientSenderId, messageType, messageContent, tickertId)
	  {
				 event.preventDefault(); // Prevent the default button click behavior

                // Create a FormData object
                //let formData = new FormData();

                // Append input field values to the FormData object
				//formData.append('channel',			channel);
				//formData.append('webClientSenderId',webClientSenderId);
				//formData.append('messageType',		messageType);
				//formData.append('messageContent',	messageContent);
				//formData.append('tickertId',		tickertId);

				parent.$('#phone-panel')[0].contentWindow.sendMessageByHandler(channel ,webClientSenderId,	messageType, messageContent, tickertId);

				//files
				//formData.append('file', $('#file')[0].files[0]);


	
                // Perform the AJAX request
                //$.ajax({	url: 'https://example.com/api/endpoint', // Replace with your API endpoint
				//			type: 'POST',			data: formData,
				//			processData: false, // Important for sending FormData
				//			contentType: false, // Important for sending FormData
				//			success: function(response) {    console.log('Success:', response);		},	// Handle the success response                        
				//			error: function(jqXHR, textStatus, errorThrown) {   console.log('Error:', textStatus, errorThrown); }// Handle the error response     });
	  


	  
	  
	  };

	  // For chat history header
	  //---------------------------------------------
	  updateChatHeader()
	  {
	  		this.$histHeader.html("");
		  	var templateResponse = 	this.chatlistHeaderTemplate;
			this.$histHeader.append(templateResponse())
	  };


	  // For chat history
	  //---------------------------------------------


	  //Visitor (Receive) side
	  //--------------------------------------
	  receiveMessage(message)
	  {
			this.messageReceived = message;
	  		var templateResponse = this.visitorMessageTemplate;
			var contextResponse = { 
			  response: this.messageReceived,
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

	  	  
	  addReplyTestMessageByClick() 
	  {		
			this.updateChatHeader();
			this.messageToSend = this.$textarea.val()


			this.sendMessageByAPI("web", "ccf94713-d0cb-4a84-873a-bd4a7589a751","file", this.messageToSend, "123245");

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
		e.getElementsByClassName('bubble-subject')[0].innerHTML
		console.log(e.getElementsByClassName('bubble-subject')[0].innerHTML);

		// Loop all the ticket to reset not selecte
		const elements = e.parentElement.querySelectorAll('.bubble-container');
		elements.forEach((element, index) => {	element.classList.remove("bubble-present")   });


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

	  addBubble(status, timeout, name)
	  {
			
			this.count = this.count + 1;
			var template  = this.bubbleTemplate;
			var count =  this.count;

			if (status == "Pending" && timeout == false)
			{
					var context = { 
						bubblestatus: "bubble-container",
						name: count.toString(),
						ticketId:  count
					};
			}
			else if (status == "Present" && timeout == false)
			{
					var context = { 
						bubblestatus: "bubble-container bubble-present",
						name:  count.toString(),
						ticketId:  count
					};
			}
			else if (status == "Pending_Unread" && timeout == false)
			{
					var context = { 
						bubblestatus: "bubble-container bubble-unread",
						name:  count.toString(),
						ticketId:  count
					};
			}

			else if (status == "Pending" && timeout == true)
			{
					var context = { 
						bubblestatus: "bubble-container bubble-present bubble-closed",
						name: count.toString(),
						ticketId:  count
					};
	
			}
			else if (status == "Present" && timeout == true)
			{
					var context = { 
						bubblestatus: "bubble-container bubble-closed",
						name: count.toString(),
						ticketId:  count
					};
	     	}	



			 this.$ticketList.append(template(context));

	  };

	 

	  refreshTicketList()
	  {
	  
			this.$ticketList.empty();


			// the following data is for testing
			 this.addBubble("Present", false);
			 this.addBubble("Pending", false);
			 this.addBubble("Pending", false);
			 this.addBubble("Pending_Unread", false);
			 this.addBubble("Pending", false);
			 this.addBubble("Pending", false);


			 this.addBubble("Present", true);
			 this.addBubble("Pending", true);
			  this.addBubble("Present", false);
			 this.addBubble("Pending", false);
			 this.addBubble("Pending", false);
			 this.addBubble("Pending_Unread", false);
			 this.addBubble("Pending", false);
			 this.addBubble("Pending", false);


			 this.addBubble("Present", true);
			 this.addBubble("Pending", true);
			  this.addBubble("Present", false);
			 this.addBubble("Pending", false);
			 this.addBubble("Pending", false);
			 this.addBubble("Pending_Unread", false);
			 this.addBubble("Pending", false);
			 this.addBubble("Pending", false);


			 this.addBubble("Present", true);
			 this.addBubble("Pending", true);
			  this.addBubble("Present", false);
			 this.addBubble("Pending", false);
			 this.addBubble("Pending", false);
			 this.addBubble("Pending_Unread", false);
			 this.addBubble("Pending", false);
			 this.addBubble("Pending", false);


			 this.addBubble("Present", true);
			 this.addBubble("Pending", true);
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

			if (ticketList != null)
			{
				//for (var i = 0; i < sMsglist.length; i++) {
				for (var i = 0; i < ticketList.length; i++) 
				{
					if (i == 0)
					{
						this.addBubble("Present", false, ticketList[i].EndUserName);
					}
					else
					{
						this.addBubble("Pending", false, ticketList[i].EndUserName);
					}
				   //peopletList.addItem(ticket.TicketId, ticket.SentBy);
				}
			}

			//2. Update Chat history header
			this.updateChatHeader();

			//3. Update message list
			var sMsglist= parent.$('#phone-panel')[0].contentWindow.currentMsglist;

			if (sMsglist != null)
			{
				//for (var i = 0; i < sMsglist.length; i++) {
				for (var i = sMsglist.length - 1; i >=0 ; i--) {
					let sMsg = sMsglist[i];

					if (sMsg.SentBy == "user")
					{
						this.receiveMessage(sMsg.MessageContent);
					}
					else
					{
						this.addMessageByText(sMsg.MessageContent);
					}
				}
           }
	  
		
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
  
