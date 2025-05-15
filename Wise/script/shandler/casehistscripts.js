  class CaseHistory
  {

		caseHistoryList = [];
		agentList = [];
		caseCallLog = null;
		customerData = null;
		htmlTemplate = null;


	    selectedTicketId = 0;
		agentId = 0;

		
	    isScrollToBottom = true;

		//selectedCannedFiles = [];
		//currentTicket = null;
		//PresentTicket = true;
		//allowPastMessageCall = true;

		//Contacted us in the last hour: Last Ticket ID: 1386264423 on 2024-11 - 29 12: 17: 37

	  init(customerData, agentList, caseLog, wa_template, root, header, content)
	  {
		  this.caseCallLog = caseLog;
		  this.selectedTicketId = caseLog.Ticket_Id;
		  this.agentList = agentList;
		  this.customerData = customerData;
		  this.htmlTemplate = wa_template;

		  

		  //initialize the output location dynamically
		  this.$chatHeader = header;
		  this.$chatHistory = content;

		  this.EndUserName = customerData.Name_Eng;
		  this.cacheDOM();

	  }
	  
	  cacheDOM()
	  {
		  
			//Initialize all the input that will be used in chat Service
			


		  /* <a id="download-webchat-link" href="javascript:void(0);" 
		     class="btn btn-warning btn-sm text-capitalize rounded mt-3 align-top text-white" 
			 onclick = "webchatDownload(2147674589);" > Download History(HTML file)</a> */


			//className content-header
			//className content-section-inner

			//The handle bar template must be compiled before use, otherwise will error
			//All the templates are loaded in dom in socialmedialHandler.html  <div id="template"></div>

		    //located at the end of phone.html

			this.chatlistHeaderTemplate		=	Handlebars.compile( $("#chatlist_header_template").html());
			this.agentMessageTemplate		=	Handlebars.compile( $("#agent_message_template").html());
			this.visitorMessageTemplate		=	Handlebars.compile( $("#visitor_message_template").html());
		 //   this.statusUpdateTemplate		=	Handlebars.compile($("#status_update_template").html());
			this.visitorMessageWithImageTemplate= Handlebars.compile($("#visitor_message_withimage_template").html());
			this.agentMessageWithImageTemplate	= Handlebars.compile($("#agent_message_withimage_template").html());
		  
	  };

	  returnCaseHistoryByAPI()
	  {
		//  this.$chatHistory = selector;

		  var ticketId = this.selectedTicketId;
		  var loginId = top.loginId;
		  var token = top.token;

		  parent.$('#phone-panel')[0].contentWindow.returnCaseHistoryFromHandler(loginId, token, ticketId);
		  //parent.$('#phone-panel')[0].contentWindow.getPastMessageByHandler(loginId, token, ticketId);
		
			
		//  returnCaseHistoryCallBack(msgList)
	  }

	  returnCaseHistoryCallBack(msgList)
	  {
		  if (msgList != null)
		  {
			  this.updateChatHeader(msgList[0].Channel)
			  
			  
			  //this.selectedTicketId
			  this.caseHistoryList = msgList;
			  
			  this.reloadCaseHistory(this.caseHistoryList);
		  }
	  }
			  
	 
	  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
	  //
	  // For chat history header
	  //----------------------------------------------------------------------------------------------------------------------------------------------

	  //updateChatHeader(entry, visitorName, ticketId)
	  updateChatHeader(entry)
	  {
	  	//this.$histHeader.html("");
		var templateResponse = this.chatlistHeaderTemplate;
		this.selectedChatChannel = entry;

		var channelImg = this.returnChannelImgByEntry(entry);

		  var contextResponse = {
			  ticketId: this.selectedTicketId,
			  name: this.customerData.Name_Eng,
			  email: this.customerData.Email, 
			  phone: this.customerData.Mobile_No, 
			  language: "English",
			  channelImg: channelImg,
			  channel: entry,
			  additionalInfo: ""
		  };

		  /* reload ticket from same visitor logic do not need to implement in case history
		  var pastTicket = this.returnPastTicketFromSameVisitor(sTicket.TicketId);
		  if (pastTicket != null){  //Contacted us in the last hour: Last Ticket ID: 1386264423 on 2024-11 - 29 12: 17: 37
			  contextResponse.additionalInfo = "Contacted us in the last hour: Last Ticket ID: " + pastTicket.TicketId + " on " + pastTicket.UpdatedAt.slice(0, 19);		  }*/

		  //this.$histHeader.append(templateResponse(contextResponse));



		  this.$chatHeader.append(templateResponse(contextResponse));
	  };


	  // For chat history and chat inteface  on right side
	  //---------------------------------------------------------------------------------------------------------------------------------------------
	  //Visitor (Receive) side
	  //--------------------------------------
	  
	  //sMsg.MessageContent, sMsg.sendby
	  receiveMessage(sMsg)
	  {			
		    //var sTicket = parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == sMsg.TicketId);
				
		  var sEndUserName = this.EndUserName; // this.caseLog

		    this.messageReceived = sMsg.MessageContent;
	  		var templateResponse = this.visitorMessageTemplate;

			//The moment js cannot handle the iso date format, if full date format the output is wrong. Please update the moment js above 2.16.0
		  var dateISO = sMsg.UpdatedAt.slice(0, 19); 
		  //var mDate = moment(dateISO).format('HH:mm:ss');

		  var mDate = returnDateForHist(dateISO);
					  
		  //Check the filejson is empty or not
		  if (sMsg.FilesJson.length < 3) {
			  if (sMsg.QuotedMsgBody === null || sMsg.QuotedMsgBody === "") {
				  var contextResponse = {
					  response: sMsg.MessageContent,
					  SentBy: sEndUserName,
					  time: mDate
				  };
				  this.$chatHistory.append(templateResponse(contextResponse));
			  }
			  else
			  {
				  var quotedTemplate = parent.$('#phone-panel')[0].contentWindow.q_template;
				  var contextResponse = {
					  response: sMsg.MessageContent,
					  SentBy: sEndUserName,
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

				  var dateISO = sMsg.UpdatedAt.slice(0, 19); 
				  //var mDate = moment(dateISO).format('HH:mm:ss');
				  var mDate = returnDateForHist(dateISO);

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
			  else if (FileMime.startsWith('audio/ogg') || FileMime.startsWith('audio/mpeg'))
			  {

				  var aTag = '<audio controls controlsList="nodownload">' +
					  '<source src="{{FileUrl}}" type="audio/ogg">' +
					  '<source src="{{FileUrl}}" type="audio/mpeg">' +
					  'Your browser does not support the audio element.</audio>';

				  aTag = aTag.replace("{{FileUrl}}", Fileurl);
				  var mDate = returnDateForHist(sMsg.UpdatedAt);

				  var context = {
					  SentBy: sEndUserName,
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

				  var mDate = returnDateForHist(sMsg.UpdatedAt);

				  var context = {
					  SentBy: sEndUserName,
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

					  var dateISO = sMsg.UpdatedAt.slice(0, 19); 
					  // var mDate = moment(dateISO).format('HH:mm:ss');

					  var mDate = returnDateForHist(dateISO);

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
		 // this.scrollToBottom();
	  };
	  	  	  
	  //Agent (Reply) side
	  //------------------------------------------------------------------

	  addReplyMessageByText(sMsg)
	  {


		  var agentName = this.getAgentNameByID(sMsg.UpdatedBy);

		  console.log(JSON.stringify(sMsg));
						

		  if (sMsg.MessageType === "template")
		  {
			  //NOT finished
			  //var template = this.agentMessageTemplate;		// 20250414 Remove this useless assignment to variable "template".

			  //var templateList = parent.$('#phone-panel')[0].contentWindow.waTempService.getTemplateList();
			  var templateList = waTempService.getTemplateList();

			  var mTemplate = templateList.filter(i => i.TemplateName == sMsg.TemplateName)[0];

			  //var cContext = parent.$('#phone-panel')[0].contentWindow.waTempService.createContextFromTemplate(mTemplate);
			  var cContext = waTempService.createContextFromTemplate(mTemplate);

			  //var htmlTemplate = parent.$('#phone-panel')[0].contentWindow.wa_template;
			  var htmlTemplate = this.htmlTemplate;

			  //var dateISO = sMsg.UpdatedAt.slice(0, 19);	// 20250415 Remove this useless assignment to variable "dateISO".
			  //var mDate = moment(dateISO).format('HH:mm:ss');
			  //var mDate = returnDateForHist(dateISO);		// 20250414 Remove this useless assignment to variable "mDate".

			  //this.$chatHistory.append(template(context));
			  //cContext.displayBtnGroup1 = "";
			  //cContext.displayBtnGroup2 = "";

			  cContext.Message = sMsg.MessageContent;

			  var MessageTemplate = htmlTemplate(cContext);
			  MessageTemplate = MessageTemplate.replace("fa-image wa-card-img", "");


			  var agentTemplate = this.agentMessageTemplate;

			  var dateISO = sMsg.UpdatedAt.slice(0, 19);
			  //var mDate = moment(dateISO).format('HH:mm:ss');
			  var mDate = returnDateForHist(dateISO);

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


			  var dateISO = sMsg.UpdatedAt.slice(0, 19); 
			  //var mDate = moment(dateISO).format('HH:mm:ss');
			  var mDate = returnDateForHist(dateISO);

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
				  var dateISO = sMsg.UpdatedAt.slice(0, 19); 
				  //var mDate = moment(dateISO).format('HH:mm:ss');
				  var mDate = returnDateForHist(dateISO);

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
				  //var mDate = moment(dateISO).format('HH:mm:ss');
				  var mDate = returnDateForHist(dateISO);

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
		 // this.$textarea.val('');
	  };	  

	  scrollToTop() {
		  this.$chatHistory.scrollTop(50);
	  };

	  scrollToBottom() {
		  this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
	  };


	  reloadCaseHistory(sMsglist)
	  {
		  //***After reload the history, the chatHistory will be scrolled based on isScrollToBottom Flag (to the bottom / to Top)

		  //Reset the chat history screen
		  //this.$chatHistory = $('#reply-media-content')[0];
		  //this.$chatHistory.html('');

		  //$('#reply-media-content').html('');

		  // this.disableInput(false); Do not need to disable interface in popup

		  //var ticketID = 0;			//20250414 Remove the declaration of the unused 'ticketID' variable.

		  if (sMsglist != null)
		  {
			  //var LastTicketId = 0;	//20250414 Remove the declaration of the unused 'LastTicketId' variable.

			  //  for (var i = 0; i < sMsglist.length; i++)		// 20250403 Expected a `for-of` loop instead of a `for` loop with this simple iteration.
			  for (let sMsg of sMsglist )
			  {
				  //for (var i = sMsglist.length - 1; i >= 0; i--) {
				 // let sMsg = sMsglist[i];		// 2050403 update from 'for' loop to 'for-of' loop
				  
				  /* The logic for draw a line between different ticket from same visitor is not needed in here
				  if (i != 0)
				  {
					  if (LastTicketId != sMsglist[i].oTicketId)
					  {
						  this.$chatHistory.append("<hr style='color:black' />");
					  }
				  }			  LastTicketId = sMsglist[i].oTicketId;
				  */

				  //console.log(sMsg.MessageId);
				  console.log(JSON.stringify(sMsg));

				  if (sMsg.SentBy == "user") {

					  this.receiveMessage(sMsg);
				  }
				  else if (sMsg.SentBy == "agent") {

					  this.addReplyMessageByText(sMsg);
				  }
				  else {
					  this.addReplyMessageByText(sMsg);
				  }


				  if (this.isScrollToBottom)
				  {
					  this.scrollToBottom();
				  }
				  else
				  {
					  this.scrollToTop();
				  }
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

	  //-----------------------------------------------------------------------------------------------------------------------------
	  //Uility api

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

	  getAgentNameByID(id) {

		  if (id != null) {
			  var name = this.agentList.find(l => l.AgentID == id).AgentName;


			  return name;
		  } else {

			  return "";
		  }
	  };

	  downloadHistoryAsHTML() {
		  var list = this.caseHistoryList;
		  var filename = "History";
		  var entry = this.selectedChatChannel;
		  var sTicketId = this.selectedTicketId;

		  filename = entry + "_" + filename + "_" + sTicketId.toString();


		  // Create an HTML string
		  let htmlContent = '<div style="display:table;">';

		  list.forEach(item => {

			  var dateISO = item.UpdatedAt.slice(0, 19);
			  //var mDate = moment(dateISO).format('YYYY-MM-DD HH:mm:ss');
			  var mDate = returnDateForHist(dateISO);

			  var sendBy = "";
			  if (item.SentBy === "user") {
				  sendBy = this.EndUserName;
			  }
			  else {
				  sendBy = this.getAgentNameByID(item.UpdatedBy);
			  }

			  var rowContent = '<div style="display:table-row;">' +
				  '<span style="display:table-cell;min-width:153px;">[' + mDate + ']&nbsp;</span>' +
				  '<span style="display:table-cell;text-align:right;">' + sendBy + '</span>:&nbsp;' +
				  '<span style="display:table-cell;" >' + item.MessageContent + '</span > ' +
				  '</div>';

			  htmlContent += rowContent;
		  });

		  htmlContent += '</div></div>';
		  //	channel-History-ticketid.html
		  //		[2024-12-19 12:31:21] 	MaryCheung: 	You made a purchase forAAAusing a credit card ending inBBBB

		  //htmlContent += '</tbody></table></body></html>';


		  // Create a Blob from the HTML string
		  const blob = new Blob([htmlContent], { type: 'text/html' });

		  // Create a link element
		  const link = document.createElement('a');

		  // Set the download attribute with the desired file name
		  link.download = `${filename}.html`;

		  // Create an object URL for the Blob
		  link.href = URL.createObjectURL(blob);

		  // Append the link to the document body
		  document.body.appendChild(link);

		  // Programmatically click the link to trigger the download
		  link.click();

		  // Remove the link from the document
		  document.body.removeChild(link);
	  };
  }

function returnDateForHist(inputIsoDate) {

	var dateISO = inputIsoDate.slice(0, 19)

	if (isToday(dateISO)) {
		return moment(dateISO).format('HH:mm:ss');
	}
	else {
		return moment(dateISO).format('YYYY-MM-DD HH:mm:ss');
	}

}

function isToday(inputIsoDate) {
	const today = moment().startOf('day'); // Get today's date at midnight 
	const dateToCheck = moment(inputIsoDate).startOf('day'); // Get input date at midnight 
	return today.isSame(dateToCheck);
}
