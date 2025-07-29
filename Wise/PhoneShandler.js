     //20241031 for sHandler
     var shandler; 				//20250414 Add the "let", "const" or "var" keyword to this declaration of "shandler" to make it explicit.
     var waTempService = null;   var caHistService = null;       var wa_template = null;         var q_template = null;
     var currentTicket = null;   var currentTicketlist = null;   var currentMsglist = null;      var SelectedChannel = null;
     var SelectedDeviceID = null;var selectedQueuelist = null;   var currentAgentList = null;    var reloadedByGetTicket = false;
     var responseInvite = false; var AssignedTicketList = [];    var JoinedConferenceList = [];  var sendMessageReturned = null; var testMode = false;

     function onTicketEvent(e) {

         console.log(e);

         //Remove all queueListItem that are created in sHandler
         queueList = queueList.filter(i => i.source != 'sleekflow');

         //20250403 Expected a `for-of` loop instead of a `for` loop
         for (let service of serviceList) {

             //let service = serviceList[i];		// 20250403 Expected a `for-of` loop instead of a `for` loop

             if (service.source == 'sleekflow') {
                 let _list = e.filter(t => t.Channel == service.entry && t.DeviceId == service.deviceId);
                 let a = queueList.findIndex(v => v.entry == service.entry && v.dnis == service.deviceId);
                 if (a != -1) {
                     queueList[a].waitCount = _list.length;
                     selectedQueuelist[0].waitCount = _list.length;
                 }
                 else {
                     queueList.push({
                         callType: service.callType, name: service.name, caption: service.caption, entry: service.entry, source: service.source,
                         dnis: service.deviceId, showPriority: 0, waitTime: 0, waitCount: _list.length,
                     });
                 }
             }
         }

         //ticketList.push(q);


         //Remove all queueListItem that waitCount is 0
         //queueList = queueList.filter(i=>i.source != 'sleekflow' && i.waitCount == 0);


         showQueueList();
     }

     function onMessageEvent(e) {
         parent.$('#social-media-main')[0].contentWindow.chatService.incomeMessageCallBack(e.details);
         console.log(e);
     }


     var invitedTicket = null;
     function onInteractEvent(e) {
         //{"type":"responseConference","details":{"targentAgentId":6,"ticketId":1023,"message":"RESPONSE YOU","agentResponse":"Y"}}

         //for handling conference with agent
         if (e.type == "requestConference") {
             invitedTicket = e.details.ticket;
             showBeInvitedModal(e);
             console.log(e);
         }

         if (e.type == "responseConference") {
             parent.$('#social-media-main')[0].contentWindow.chatService.sendInviteRequestcallBack(e);
             console.log(e);
         }

         if (e.type == "endTicket") {	//assignedTo: 5, closedBy: 5
             parent.$('#social-media-main')[0].contentWindow.chatService.receiveMessageForEndTicket(e.details);
             console.log(e);
         }

         if (e.type == "timeout") {
             parent.$('#social-media-main')[0].contentWindow.chatService.sessionTimeoutCallBack(e.details.ticketId);
             console.log(e);
         }

         if (e.type == "leaveConference") {
             parent.$('#social-media-main')[0].contentWindow.chatService.receiveMessageForMemberLeave(e.details.ticketId, e.details.leaveAgentId);
             console.log(e);
         }
     }

     function showBeInvitedModal(response) {
         var agent = top.agentList.filter(i => i.AgentID == response.details.requestAgentId)[0];
         var agentName = agent.AgentName;

         parent.window.$('#be-invited-campaign')[0].innerHTML = parent.window[1].campaign;
         parent.window.$('#be-invited-entry')[0].innerHTML = response.details.ticket.Channel;  // need ...............response.channel;
         parent.window.$('#be-invited-ticketid')[0].innerHTML = response.details.ticket.TicketId;

         parent.window.$('#be-invited-agent')[0].innerHTML = agentName + " (ID: <span id='be-invited-agentId'>" + response.details.requestAgentId + "</span>)";
         parent.window.$('#be-invited-request')[0].innerHTML = response.details.message.length > 0 ? response.details.message : '[empty]';
         parent.window.$('#beInvitedModal').modal('show');
     }

     function testInvite() {
         var responseText = '{"type":"requestConference","requestAgentId":5,"ticket":{"TicketId":419,"EndUserId":"037b1416-38c5-4c9e-aa4c-ce7dec02effa","EndUserProfileId":"53cf32e6-8914-4ffb-a935-fefb05caa9fd","EndUserName":"TEST","EndUserEmail":"TEST@TESTER.COM","EndUserPhone":"85291111111","AssignedTo":5,"Status":"open","Channel":"web","DeviceId":"","CreatedBy":"user","CreatedAt":"2024-11-27T09:58:11.51","UpdatedAt":"2024-11-27T09:58:24.383","LastMessage":"Message from tester 44"},"message":"wantInvite"}';
         var response = JSON.parse(responseText);
         showBeInvitedModal(response);
     }
	 
	 
	 
	 

     //For development and debug //20241031
     //--------------------------------------------------------------------------------
     function acceptCall_test(loginId, Token, Channel, deviceID) {
         testMode = true;

         //Function for redirect iframe to socialMedialHandler.html
         window.parent.SocialMediaClicked();


         var testAssignedList = '[{ "TicketId": 418, "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "EndUserProfileId": "53cf32e6-8914-4ffb-a935-fefb05caa9fd", "EndUserName": "TIGER", "EndUserEmail": "TIGER@TIGERTEST.COM", "EndUserPhone": "85291111111", "AssignedTo": 5, "Status": "open", "Channel": "web", "DeviceId": "", "CreatedBy": "user", "CreatedAt": "2024-11-27T09:54:24.763", "UpdatedAt": "2024-11-27T09:54:34.257", "LastMessage": "Message 3", "messages": ' +
             '[{ "MessageId": 2307930846, "TicketId": 418, "UniqueId": null, "QuotedMsgBody": "", "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:24.763", "MessageType": "text", "MessageContent": "MEssage 1", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307930870, "TicketId": 418, "UniqueId": null, "QuotedMsgBody": "",  "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 2", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307930871, "TicketId": 418, "UniqueId": null, "QuotedMsgBody": "",  "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 3", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307930872, "TicketId": 418, "UniqueId": null, "QuotedMsgBody": "",  "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 4", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307930873, "TicketId": 418, "UniqueId": null, "QuotedMsgBody": "",  "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 5", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307930874, "TicketId": 418, "UniqueId": null, "QuotedMsgBody": "",  "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 6", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307930875, "TicketId": 418, "UniqueId": null, "QuotedMsgBody": "",  "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 7", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307930876, "TicketId": 418, "UniqueId": null, "QuotedMsgBody": "",  "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 8", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307930877, "TicketId": 418, "UniqueId": null, "QuotedMsgBody": "",  "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 9", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307930878, "TicketId": 418, "UniqueId": null, "QuotedMsgBody": "",  "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 10", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307930879, "TicketId": 418, "UniqueId": null, "QuotedMsgBody": "",  "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 11", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307930880, "TicketId": 418, "UniqueId": null, "QuotedMsgBody": "",  "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 12", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307930881, "TicketId": 418, "UniqueId": null, "QuotedMsgBody": "",  "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 13", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307930882, "TicketId": 418, "UniqueId": null, "QuotedMsgBody": "",  "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 14", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307930883, "TicketId": 418, "UniqueId": null, "QuotedMsgBody": "",  "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 15", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307930925, "TicketId": 418, "UniqueId": null, "QuotedMsgBody": "",  "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:34.257", "MessageType": "text", "MessageContent": "Message 16", "FilesJson": "[]" }] },' +

             '{ "TicketId": 419, "EndUserId": "037b1416-38c5-4c9e-aa4c-ce7dec02effa", "EndUserProfileId": "53cf32e6-8914-4ffb-a935-fefb05caa9fd", "EndUserName": "TEST", "EndUserEmail": "TEST@TESTER.COM", "EndUserPhone": "85291111111", "AssignedTo": 5, "Status": "open", "Channel": "web", "DeviceId": "", "CreatedBy": "user", "CreatedAt": "2024-11-27T09:58:11.51", "UpdatedAt": "2024-11-27T09:58:24.383", "LastMessage": "Message from tester 44", "messages": [{ "MessageId": 2307932310, "TicketId": 419, "UniqueId": null, "QuotedMsgBody": "", "EndUserId": "037b1416-38c5-4c9e-aa4c-ce7dec02effa", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:58:11.51", "MessageType": "text", "MessageContent": "Message from tester 1", "FilesJson": "[]" }, { "MessageId": 2307932360, "TicketId": 419, "UniqueId": null, "QuotedMsgBody": "", "EndUserId": "037b1416-38c5-4c9e-aa4c-ce7dec02effa", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:58:18.937", "MessageType": "text", "MessageContent": "Message from tester 2", "FilesJson": "[]" }, { "MessageId": 2307932376, "TicketId": 419, "UniqueId": null, "QuotedMsgBody": "", "EndUserId": "037b1416-38c5-4c9e-aa4c-ce7dec02effa", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:58:21.74", "MessageType": "text", "MessageContent": "Message from tester 33", "FilesJson": "[]" }, { "MessageId": 2307932391, "TicketId": 419, "UniqueId": null,"QuotedMsgBody": "",  "EndUserId": "037b1416-38c5-4c9e-aa4c-ce7dec02effa", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:58:24.383", "MessageType": "text", "MessageContent": "Message from tester 44", "FilesJson": "[]" }] },' +
             '{ "TicketId": 420, "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "EndUserProfileId": "53cf32e6-8914-4ffb-a935-fefb05caa9fd", "EndUserName": "MARY", "EndUserEmail": "MARY@MARY.COM", "EndUserPhone": "85291111111", "AssignedTo": 5, "Status": "closed", "Channel": "web", "DeviceId": "", "CreatedBy": "user", "CreatedAt": "2024-12-02T14:54:24.363", "UpdatedAt": "2024-12-02T14:54:34.257", "LastMessage": "Message 3", "messages": [{ "MessageId": 2307930846, "TicketId": 420, "UniqueId": null, "QuotedMsgBody": "", "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:24.763", "MessageType": "text", "MessageContent": "MEssage 1", "FilesJson": "[]" }, { "MessageId": 2307930870, "TicketId": 420, "UniqueId": null, "QuotedMsgBody": "", "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 2", "FilesJson": "[]" }, { "MessageId": 2307930925, "TicketId": 420, "UniqueId": null, "QuotedMsgBody": "", "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-12-02T14:54:34.257", "MessageType": "text", "MessageContent": "Message 3", "FilesJson": "[]" }] }]';




         //var testQueueList = '[{ "callType": 16, "name": "campaignCRM", "caption": "EPRO", "entry": "whatsapp", "source": "sleekflow", "dnis": "85293909352", "showPriority": 0, "waitTime": 0, "waitCount": 0 }, { "callType": 10, "name": "campaignCRM", "caption": "EPRO", "entry": "web", "source": "sleekflow", "dnis": "", "showPriority": 0, "waitTime": 0, "waitCount": 0 }, { "callType": 7, "acdGroup": 1, "entry": "", "name": "campaignCRM", "caption": "9000", "dnis": "9000", "showPriority": 1, "waitTime": 582820, "waitCount": 1, "mediaCount": 0 }, { "callType": 6, "acdGroup": 7, "name": "campaignCRM", "caption": "EPRO", "dnis": "demo-cpb@eprotel.com.hk", "showPriority": 2, "waitTime": 632525, "waitCount": 1, "mediaCount": 17 }, { "callType": 7, "acdGroup": 1, "name": "campaignCRM", "caption": "9001", "dnis": "9001", "showPriority": 2, "waitTime": 582821, "waitCount": 0, "mediaCount": 2 }]';
         AssignedTicketList = JSON.parse(testAssignedList);

         //queueList = JSON.parse(testQueueList);

         selectedQueuelist = queueList.filter(i => i.source == 'sleekflow' && i.entry == 'web');


         //JSON.parse(JSON.stringify(parent.$('#phone-panel')[0].contentWindow.AssignedTicketList));


         //var chatService= parent.$('#social-media')[0].contentWindow.chatService;
         //chatService.addMessage();
     }

     var inviteTicketId = "";
     var inviteTargetAgentId = "";
     var inviteMessage = "";
     var inviteAgentResponse = "N";
     function responseInvitedCall(isAccept) {
         //check websocket state, continue process is not allowed if false is returned;
         var wssresult = checkWebSocketState(shandler.websocket);
         //if (wssresult.result == false) { alert(wssresult.message); return; }	// 20250407 Refactor the code to avoid using this boolean literal.
         if (!wssresult.result) { alert(wssresult.message); return; }
         //-----

         inviteTicketId = parent.window.$('#be-invited-ticketid')[0].innerHTML;
         inviteTargetAgentId = parent.window.$('#be-invited-agentId')[0].innerHTML;
         inviteMessage = parent.window.$('#be-invited-message').val();
         inviteAgentResponse = "N";

         if (isAccept) {
             inviteAgentResponse = "Y";
             currentTicket = invitedTicket;
             currentTicket.messages = [];
             AssignedTicketList.push(currentTicket);
             //queueList = JSON.parse(testQueueList);

             window.parent.SocialMediaClicked();


             //Call the function after load the page

             reloadedByGetTicket = true;
             responseInvite = true;

         }

         //$('#beInvitedModal').modal('toggle');
     }
     let runCount = 0;


     function responseInviteCallBack(ticketId, response) {

         if (response == 'Y') {
             parent.window.$('#beInvitedModal').blur();			// 20250328 Expected an assignment or function call and instead saw an expression.
             parent.window.$('#beInvitedModal').modal('hide');
             //responseInviteByHandler(parseInt(agentId), token, parseInt(ticketId), parseInt(targetAgentId), message, agentResponse);
             responseInvite = false;
             parent.$('#social-media-main')[0].contentWindow.chatService.updateChatForResponseInviteCallBack(ticketId);
         }
         //acceptCall_fromConference(response);
     }

     function acceptCall_fromConference(response) {


         //parent.$('#social-media-main')[0].contentWindow.chatService.updateChatHeader(invitedTicket.Channel, invitedTicket);
         //parent.$('#social-media-main')[0].contentWindow.chatService.resetChatHistory();

         //  this.updateChatHeader(selectedTicket[0].Channel, selectedTicket[0]);


     }

     // Function that trigger by user click the querylist on the top
     function acceptCall_Shandler(loginId, Token, Channel, deviceID) {
         //check websocket state, continue process is not allowed if false is returned;
         // var wssresult = checkWebSocketState(shandler.websocket);
         // if (wssresult.result == false) { alert(wssresult.message); return; }
         //-----

         //var ticket = null;	//20250414 Remove the declaration of the unused variable.
         //var msg = null;

         //Step 1: get the ticket
         shandler.getTicket({
             agentid: loginId,
             token: Token,
             channel: Channel,
             deviceid: deviceID
         })
             .then(response => {
                 if (response.result == "success") {

                     if (response.details.ticket != null) {
                         if (shandler.tickets.length != 0) {

                             //let _messagelist = response.details.messages.filter(t => t.TicketId == shandler.tickets[shandler.tickets.length-1].TicketId);



                             let _messagelist = response.details.messages.filter(t => t.TicketId == response.details.ticket.TicketId);

                             //at the sorting for store message list first come first store
                             _messagelist = _messagelist.sort((a, b) => { return a.MessageId - b.MessageId; });


                             // createOrUpdateBubbleFromHandler(shandler.tickets[0], _messagelist);
                             // if (_messagelist == null)
                             // {
                             //		shandler.tickets[0].shift;
                             //  }

                             //Function for redirect iframe to socialMedialHandler.html
                             window.parent.SocialMediaClicked();

                             currentTicket = response.details.ticket;

                             //For Show last message in ticket double list
                             currentTicket.LastMessage = _messagelist[_messagelist.length - 1].MessageContent;

                             //currentTicketlist = [].concat(shandler.tickets);
                             _messagelist.forEach(item => { item.oTicketId = item.TicketId; });

                             currentMsglist = _messagelist;


                             //Will be reset if other channel with different different id is selected;
                             selectedQueuelist = queueList.filter(i => i.source == 'sleekflow' && i.entry == Channel && i.dnis == deviceID);


                             //All the chatService reload the ticket screen



                             const assignedTicket = { ...currentTicket };	//const assignedTicket = Object.assign({}, currentTicket);	//20250409 Use an object spread instead of `Object.assign`

                             assignedTicket.messages = _messagelist;

                             //Area for handling data
                             if (assignedTicket.Channel == "whatsapp") {
                                 assignedTicket.EndUserPhone = _messagelist[0].EndUserId;
                                 currentTicket.EndUserPhone = _messagelist[0].EndUserId;
                             }

                             AssignedTicketList.push(assignedTicket);


                             reloadedByGetTicket = true;
                             responseInvite = false;

                             //pastMsglist = null;  //20250424 remove unused variable

                             //var limit = "500";
                             //shandler.getMessagesByUserId({
                             //    agentid: loginId,
                             //    token: Token,
                             //    userId: currentTicket.EndUserId,
                             //    msgId: _messagelist[_messagelist.length - 1].msgId,
                             //    limit, limit,
                             //    deviceid: deviceID
                             //})
                             //    .then(response => {
                             //        pastMsglist = response.details.messages;
                             //    })
                             //    .catch(error => {

                             //        console.log(error);
                             //        return null;
                             //    });

                         }



                     }
                     //triggerEvent(window.parent.document, 'onWiseSocialMsg', );
                 }
             })
             .catch(error => {
                 console.log(error);
             });

         //-------------------------------------------//
         //agentid, token, ticketId,

         //			Msg object field name

         //         id: new Date().getUTCMilliseconds(),
         //         'nick_name': agentName,
         //         'send_by_flag': 1,							//發送者1:客服,2:enduser{			*****NEED all the message list for update bubble
         //         'sent_time': getSqlFormatTime(),
         //         msg_type: "text",
         //         msg_content: fileDetails.FileName + " failed to send to the customer<br>[THIS MESSAGE WILL NOT BE SHOWN IN CUSTOMER'S WINDOW]",
         //         isSuccess: false

         //		"MessageId": 2281386826,	<= ID
         //		"TicketId": 26,
         //		"UniqueId": null,
         //		"EndUserId": "537e41bd-d962-4244-a8bf-804b0803937d",
         //		"Channel": "web",
         //		"SentBy": "user",
         //		"UpdatedBy": null,
         //		"UpdatedAt": "2024-10-30T09:40:42.933",		<=sent_time'
         //		"MessageType": "text",
         //		"MessageContent": "AAAAA",
         //		"FilesJson": "[]"

         //		AgentiD???
     }


     //function sendMessageByHandler(agent, token, channel, webClientSenderId, messageType, messageContent, ticketId)
     function sendMessageByHandler(agent, token, messageType, messageContent, sTicket) {
         //check websocket state, continue process is not allowed if false is returned;
         var wssresult = checkWebSocketState(shandler.websocket);
         //if (wssresult.result == false) { alert(wssresult.message); return; }		// 20250407 Refactor the code to avoid using this boolean literal.
         if (!wssresult.result) { alert(wssresult.message); return; }
         //-----

         //Default example
         //let formData = new FormData();
         //formData.append('agentId', 111);
         //formData.append('token', 'xxx');
         //formData.append('ticketId', 112);
         //formData.append('channel', 'web');
         //formData.append('WebClientSenderId', '11120-232-42323');      //user id
         //formData.append('messageType', 'file');               //file or text
         //	formData.append('messageContent', 'hello');
         //	formData.append('files', file);

         var channel = sTicket.Channel;
         // Create a FormData object
         let formData = new FormData();

         // Append input field values to the FormData object

         if (channel == "web") {
             formData.append('agentId', agent);
             formData.append('token', token);
             formData.append('ticketId', sTicket.TicketId);
             formData.append('channel', sTicket.Channel);
             formData.append('webClientSenderId', sTicket.EndUserId);
             formData.append('messageType', messageType);
             formData.append('messageContent', messageContent);
             //formData.append('files',			file);
         }
         if (channel == "whatsapp") {

             formData.append('agentId', agent);
             formData.append('token', token);
             formData.append('ticketId', sTicket.TicketId);
             //formData.append('channel', sTicket.Channel);
             formData.append('channel', "whatsappcloudapi");


             //formData.append('webClientSenderId', sTicket.webClientSenderId);

             formData.append('from', sTicket.DeviceId);
             formData.append('to', sTicket.EndUserPhone);

             formData.append('messageType', messageType);
             formData.append('messageContent', messageContent);


         }


         shandler.sendMessage(formData)
             .then(response => {
                 if (response != null) {
                     sendMessageReturned = response;
                     parent.$('#social-media-main')[0].contentWindow.chatService.sendMessageCallBack(sendMessageReturned);
                 }
             })
             .catch(error => {

                 console.log(error);
                 return null;
             });
     }



     function sendAttachmentByHandler(agent, token, messageType, file, sTicket) {

         //check websocket state, continue process is not allowed if false is returned;
         var wssresult = checkWebSocketState(shandler.websocket);
         //if (wssresult.result == false) { alert(wssresult.message); return; }	// 20250407 Refactor the code to avoid using this boolean literal.
         if (!wssresult.result) { alert(wssresult.message); return; }
         //-----

         //Default example
         //let formData = new FormData();
         //formData.append('agentId', 111);
         //formData.append('token', 'xxx');
         //formData.append('ticketId', 112);
         //formData.append('channel', 'web');
         //formData.append('WebClientSenderId', '11120-232-42323');      //user id
         //formData.append('messageType', 'file');               //file or text
         //	formData.append('messageContent', 'hello');
         //	formData.append('files', file);

         var channel = sTicket.Channel;

         // Create a FormData object
         let formData = new FormData();

         // Append input field values to the FormData object
         if (channel == "web") {
             formData.append('agentId', agent);
             formData.append('token', token);
             formData.append('ticketId', sTicket.TicketId);
             formData.append('channel', sTicket.Channel);
             formData.append('webClientSenderId', sTicket.EndUserId);
             formData.append('messageType', messageType);
             formData.append('messageContent', "");
             formData.append('files', file);
         }

         if (channel == "whatsapp") {

             formData.append('agentId', agent);
             formData.append('token', token);
             formData.append('ticketId', sTicket.TicketId);
             //formData.append('channel', sTicket.Channel);
             formData.append('channel', "whatsappcloudapi");

             //formData.append('webClientSenderId', sTicket.webClientSenderId);

             formData.append('from', sTicket.DeviceId);
             formData.append('to', sTicket.EndUserPhone);

             formData.append('messageType', messageType);
             formData.append('messageContent', "");
             formData.append('files', file);

         }

         // FOR DEBUG
         //var object = {};
         //formData.forEach(function (value, key) {        object[key] = value;    });
         //var json = JSON.stringify(object);

         //console.log(json);

         shandler.sendMessage(formData)
             .then(response => {
                 if (response != null) {
                     sendMessageReturned = response;
                     parent.$('#social-media-main')[0].contentWindow.chatService.sendMessageCallBack(sendMessageReturned);
                 }
             })
             .catch(error => {

                 console.log(error);
                 return null;
             });
     }

     function getPastMessageByHandler(ticketId, agentid, token, userId, msgId, limit) {
         //check websocket state, continue process is not allowed if false is returned;
         var wssresult = checkWebSocketState(shandler.websocket);
         //if (wssresult.result == false) { alert(wssresult.message); return; }	// 20250407 Refactor the code to avoid using this boolean literal.
         if (!wssresult.result) { alert(wssresult.message); return; }
         //-----

         $.ajax({	//parent.$('#phone-panel')[0].contentWindow.shandler.apiUrl 'http://172.17.6.11:8033'
             type: "POST",
             url: shandler.apiUrl + '/api/GetMessagesByUserId', crossDomain: true,
             data: JSON.stringify({ AgentId: agentid, Token: token, UserId: userId, MsgId: msgId, Limit: limit }),
             contentType: "application/json; charset=utf-8", dataType: "json",
             success: function (r) {
                 if (!/^success$/i.test(r.result || "")) {
                     console.log('error in function getPastMessageByHandler');
                     console.log(r);
                 } else {  //cannot use this.selectedTicketId because the function is tiggerd in popup

                     //console.log(JSON.stringify(r.details));
                     parent.$('#social-media-main')[0].contentWindow.chatService.returnPastMessageByTicketIdCallBack(ticketId, r.details);

                 }
             },
             error: function (r) {
                 console.log('error in getPastMessageByHandler');
                 console.log(r);
             }
         });

     }

     //	function sendTemplateMessageByHandler(agent, token, companyName, sTemplate, sTicket) {
     //****20250116 same API defined in crmInputForm .js*/
     function sendTemplateMessageByHandler(agent, token, companyName, sTemplate, sFrom, sTo, sTicketId) {

         //check websocket state, continue process is not allowed if false is returned;
         var wssresult = checkWebSocketState(shandler.websocket);
         //if (wssresult.result == false) { alert(wssresult.message); return; }	// 20250407 Refactor the code to avoid using this boolean literal.
         if (!wssresult.result) { alert(wssresult.message); return; }
         //-----

         $.ajax({
             type: "POST",
             url: shandler.apiUrl + '/api/sendTemplate', crossDomain: true,
             data:
                 JSON.stringify({
                     "Agent_Id": agent,
                     "TicketId": sTicketId,
                     "Token": token,
                     "Company": companyName,
                     "TemplateName": sTemplate.TemplateName,
                     "From": sFrom,
                     "To": sTo,
                     "BodyParams": sTemplate.inputList
                 }),
             contentType: "application/json; charset=utf-8", dataType: "json",
             success: function (r) {
                 if (!/^success$/i.test(r.result || "")) {
                     console.log('error in function sendTemplateMessageByHandler');
                     //} else {  // 20250410 'If' statement should not be the only statement in 'else' block
                 } else if (sTicketId != null) {
                     //Send from chatbot
                     parent.$('#social-media-main')[0].contentWindow.chatService.sendMessageByTemplateCallBack(r.details);
                     //} // //20250410 for else if

                     //cannot use this.selectedTicketId because the function is tiggerd in popup
                     //var sTicketId = parent.$('#social-media-main')[0].contentWindow.chatService.selectedTicketId;
                     //parent.$('#social-media-main')[0].contentWindow.chatService.requestCannedFileInBase64CallBack(fileId, fileName, fileType, r.data.FileBase64, sTicketId);
                 }
             },
             error: function (r) {
                 console.log('error in sendTemplateMessageByHandler');
                 console.log(r);
             }
         });


     }
     function requestCannedFileInBase64ByHandler(fileId, fileName, fileType) {
         //check websocket state, continue process is not allowed if false is returned;
         var wssresult = checkWebSocketState(shandler.websocket);
         //if (wssresult.result == false) { alert(wssresult.message); return; }		// 20250407	Refactor the code to avoid using this boolean literal.
         if (!wssresult.result) { alert(wssresult.message); return; }
         //-----

         var api = shandler.apiUrl.replace("8033", "");

         $.ajax({
             type: "POST",

             url: api + '/shandler/api/socialmedia/GetCannedFiles', crossDomain: true,
             data: JSON.stringify({ "company": 'EPRO', "fileId": fileId }), contentType: "application/json; charset=utf-8", dataType: "json",
             success: function (r) {
                 if (!/^success$/i.test(r.result || "")) {
                     console.log('error in sendCannedFileByHandler');
                 } else {  //cannot use this.selectedTicketId because the function is tiggerd in popup
                     var sTicketId = parent.$('#social-media-main')[0].contentWindow.chatService.selectedTicketId;
                     parent.$('#social-media-main')[0].contentWindow.chatService.requestCannedFileInBase64CallBack(fileId, fileName, fileType, r.data.FileBase64, sTicketId);
                 }
             },
             error: function (r) {
                 console.log('error in sendCannedFileByHandler');
                 console.log(r);
             }
         });
     };


     function endSessionByHandler(loginId, token, ticketId) {
         //check websocket state, continue process is not allowed if false is returned;
         //  var wssresult = checkWebSocketState(shandler.websocket);
         //  if (wssresult.result == false) { alert(wssresult.message); return; }
         //-----

         // Append input field values to the FormData object

         //agentid, token, ticketid

         shandler.endTicket({
             agentid: loginId,
             token: token,
             ticketid: ticketId
         })
             .then(response => {
                 if (response) {
                     parent.$('#social-media-main')[0].contentWindow.chatService.endSessionCallBack(ticketId);
                 }
             })
             .catch(error => {
                 console.log('error in endSessionByHandler');
                 console.log(error);
                 return null;
             });
     }


     function returnCaseHistoryFromHandler(agentId, token, ticketId) {
         //check websocket state, continue process is not allowed if false is returned;
         var wssresult = checkWebSocketState(shandler.websocket);
		 console.log(JSON.stringify(shandler));
         //if (wssresult.result == false) { alert(wssresult.message); return; }		// 20250407 Refactor the code to avoid using this boolean literal
         if (!wssresult.result) { alert(wssresult.message); return; }
         //-----

         shandler.getMessagesByTicketId({
             agentid: agentId,
             token: token,
             ticketId: ticketId
         })
             .then(response => {

                 if (response != null) {
                     console.log("getMessagesByTicketId: ");
                     //   var msg_list = response.details.msg_list;
                     //sort in ascending
                     response = response.sort((a, b) => { return a.MessageId - b.MessageId; });

                     //parent.$('#social-media-main')[0].contentWindow.chatService.returnPastMessageByTicketIdCallBack(ticketId, lastApiResult);
                     parent.$('#phone-panel')[0].contentWindow.caHistService.returnCaseHistoryCallBack(response);
                     //lastApiResult = null;			//20250414 remove the unused variable

                 }
             })
             .catch(error => {
                 console.log(error);
             });

     }


     function getOnlineAgentList()
	 {
		 
		 var URL = config.shandlerapi;	var sAgentId = top.loginId;		var sToken = top.token;
		 
         //check websocket state, continue process is not allowed if false is returned;
         var wssresult = checkWebSocketState(shandler.websocket);
         //if (wssresult.result == false) { alert(wssresult.message); return; }	// 20250407 Refactor the code to avoid using this boolean literal.
         if (!wssresult.result) { alert(wssresult.message); return; }
         //-----

         $.ajax({
			type: "POST",
			url: URL + "/api/GetOnlineAgent",
			data: JSON.stringify({ "AgentId": sAgentId, "Token": sToken }),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function (r) {
				if (!/^success$/i.test(r.result || "")) {
					console.log('error in getAgentListByAPI');
				} else {
					parent.$('#social-media-main')[0].contentWindow.chatService.getOnlineAgentListCallBack(r.details);
				}
			},

			error: function (r) {
				//callback(null, r);
				console.log('error in getAgentList');
				console.log(r);
				reject('error in getAgentListByAPI');
			}
		});
     }

     // Conference Inviter side
     function inviteAgentByHandler(agentId, token, ticketId, targetAgentId, message) {
         //check websocket state, continue process is not allowed if false is returned;
         var wssresult = checkWebSocketState(shandler.websocket);
         //if (wssresult.result == false) { alert(wssresult.message); return; }		// 20250407 Refactor the code to avoid using this boolean literal
         if (!wssresult.result) { alert(wssresult.message); return; }
         //-----

         shandler.requestConference({
             agentId: agentId,
             token: token,
             ticketId: ticketId,
             targetAgentId: targetAgentId,
             message: message
         })
             .then(response => {

                 if (response != null) {
                     console.log("inviteAgentByHandler: ");

                     //Need to need if the return is not valid
                     if (response.result != 'success') {
                         parent.$('#social-media-main')[0].contentWindow.chatService.sendInviteRequestcallBack(response);
                         //inviteAgentCallBack(response);
                     }

                 }
             })
             .catch(error => {
                 console.log(error);
             });
     }

     // Conference invitee side
     //function responseInviteByHandler(agentId, token, ticketId, requestAgentId, message, agentResponse)
     function responseInviteByHandler() {



         //check websocket state, continue process is not allowed if false is returned;
         var wssresult = checkWebSocketState(shandler.websocket);
         //if (wssresult.result == false) { alert(wssresult.message); return; }		// 20250407 Refactor the code to avoid using this boolean literal
         if (!wssresult.result) { alert(wssresult.message); return; }
         //-----
         var agentId = loginId; var requestAgentId = parseInt(inviteTargetAgentId); var agentResponse = inviteAgentResponse;
         var token = top.token; var ticketId = parseInt(inviteTicketId); var message = inviteMessage;

         //agentResponse: Y/N
         shandler.responseConference({
             agentId: agentId,
             token: token,
             ticketId: ticketId,
             requestAgentId: requestAgentId,
             message: message,
             agentResponse: agentResponse
         })
             .then(response => {

                 if (response != null) {
                     console.log("responseInviteByHandler: ");

                     if (response.result == 'success') {
                         responseInviteCallBack(ticketId, agentResponse);
                     }

                 }
             })
             .catch(error => {
                 console.log(error);
             });
     }
     // for invited agent drop the bubble and set status to "leave"
     function leaveConferenceByHandler(leaveAgentId, token, ticketId) {
         //check websocket state, continue process is not allowed if false is returned;
         var wssresult = checkWebSocketState(shandler.websocket);
         //if (wssresult.result == false) { alert(wssresult.message); return; }		// 20250407 Refactor the code to avoid using this boolean literal
         if (!wssresult.result) { alert(wssresult.message); return; }
         //-----

         var agentId = leaveAgentId; var token = token; var ticketId = parseInt(ticketId);

         shandler.leaveConference({
             agentId: agentId,
             token: token,
             ticketId: ticketId
         })
             .then(response => {

                 if (response != null) {
                     console.log("leaveConferenceByHandler: ");
                     parent.$('#social-media-main')[0].contentWindow.chatService.leaveChatCallBack(response);
                 }
             })
             .catch(error => {
                 console.log(error);
             });
     }

     function checkWebSocketState(websocket) {
         var result = null;		// var result = true;		//20250326	Review this redundant assignment:
         var message = "";

         switch (websocket.readyState) {
             case WebSocket.CONNECTING:
                 message = "WebSocket is connecting...";
                 result = true;
                 break;
             case WebSocket.OPEN:
                 message = 'WebSocket is open.';
                 result = true;
                 break;
             case WebSocket.CLOSING:
                 message = 'WebSocket is closing...';
                 result = false;
                 break;
             case WebSocket.CLOSED:
                 message = 'WebSocket is closed.';
                 result = false;
                 break;
             default:
                 message = 'Unknown WebSocket state.';
                 result = false;
                 break;
         }
         console.log(message);

         return {
             result: result,
             message: message
         }
     }

     //------------------------------
     function addTestMessageAtTop() {

         var messageToAdd = '[{ "MessageId": 2307920846, "TicketId": 410, "UniqueId": null, "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:24.763", "MessageType": "text", "MessageContent": "MEssage 111", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307920870, "TicketId": 410, "UniqueId": null, "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 112", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307920871, "TicketId": 412, "UniqueId": null, "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:27.827", "MessageType": "text", "MessageContent": "Message 113", "FilesJson": "[]" }, ' +
             '{ "MessageId": 2307920925, "TicketId": 412, "UniqueId": null, "EndUserId": "b5b6f193-0a3b-4560-aa33-573706309416", "Channel": "web", "SentBy": "user", "UpdatedBy": null, "UpdatedAt": "2024-11-27T09:54:34.257", "MessageType": "text", "MessageContent": "Message 116", "FilesJson": "[]" }]'


         var msgList = JSON.parse(messageToAdd);
         parent.$('#social-media-main')[0].contentWindow.chatService.returnPastMessageByTicketIdCallBack(418, msgList);
     }
 