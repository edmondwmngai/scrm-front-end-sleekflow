  class chat
  {
		messageToSend = '';
		messageToSendBy =  '';
		messageResponses =  [
   'Why did the web developer leave the restaurant? Because of the table layout.',      'How do you comfort a JavaScript bug? You console it.',
   'An SQL query enters a bar, approaches two tables and asks: "May I join you?"',      'What is the most used language in programming? Profanity.',
   'What is the object-oriented way to become wealthy? Inheritance.',      'An SEO expert walks into a bar, bars, pub, tavern, public house, Irish pub, drinks, beer, alcohol'
	];
	  init()
	  {
		    this.cacheDOM();
			this.bindEvents();
			this.render();
		  
	  };
	  
	  cacheDOM()
	  {
		  
          //default-content-title
		    this.$chatHistory = $('#chatHistory');
			this.$button = $('#sendMsgButton');
			this.$textarea = $('#replyTextarea');
			//this.$chatHistoryList =  this.$chatHistory.find('ul');
		  
	  };
	  
	  bindEvents()
	  {
		this.$button.on('click', this.addMessage.bind(this));
		this.$textarea.on('keyup', this.addMessageEnter.bind(this));
	  };
	  render()
	  {
		  
		 this.scrollToBottom();
		if (this.messageToSend.trim() !== '') 
		{
			var template = Handlebars.compile( $("#message-template").html());
			var context = { 
				messageOutput: this.messageToSend,
				time: this.getCurrentTime()
			};

			this.$chatHistoryList.append(template(context));
			this.scrollToBottom();
			this.$textarea.val('');
			
			// responses
			var templateResponse = Handlebars.compile( $("#message-response-template").html());
			var contextResponse = { 
			  response: this.getRandomItem(this.messageResponses),
			  time: this.getCurrentTime()
			};
			
			setTimeout(function() {
			  this.$chatHistoryList.append(templateResponse(contextResponse));
			  this.scrollToBottom();
			}.bind(this), 1500);
		  
	    }
	  }
	  
	  addMessage() 
	  {
			this.messageToSend = this.$textarea.val()
			this.render();         
	  };
	  addMessageEnter(event) {
			// enter was pressed
			if (event.keyCode === 13) {
			  this.addMessage();
			}
	  };
	  scrollToBottom() {
		  // this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
	  };
	  getCurrentTime() {
		  return new Date().toLocaleTimeString().
				  replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
	  };
	  getRandomItem(arr) {
		  return arr[Math.floor(Math.random()*arr.length)];
	  };
		  
  }
  
  

(function(){
  
  //===========================================For chat room with handlebar===================================================================/
  var chat = {
    messageToSend: '',
    messageToSendBy: '',
    init: function() {
      this.cacheDOM();
      this.bindEvents();
      this.render();
    },
    cacheDOM: function() {
      this.$chatHistory = $('.chat-history');
      //this.$button = $('button');
      
      this.$button = $('#Send');

      this.$textarea = $('#message-to-send');
      this.$textreply = $('#message-to-reply');
     // this.$chatHistoryList =  this.$chatHistory.find('ul');
    },
    bindEvents: function() {
      //this.$button.on('click', this.addMessage.bind(this));
      this.$button.on('click', this.replyMessageByInput.bind(this));
      //this.$textarea.on('keyup', this.addMessageEnter.bind(this));
      this.$textarea.on('keyup', this.addMessageEnter.bind(this));
    },
    render: function() {
      this.scrollToBottom();
      if (this.messageToSend.trim() !== '') {
        var template = Handlebars.compile( $("#message-template").html());
        var context = { 
          sendBy: this. messageToSendBy, 
          messageOutput: this.messageToSend,
          time: this.getCurrentTime()
        };

        this.$chatHistory.append(template(context));
        this.scrollToBottom();
        this.$textarea.val('');
        
        // responses
       // var templateResponse = Handlebars.compile( $("#message-response-template").html());
       // var contextResponse = { 
        //  response: this.getRandomItem(this.messageResponses),
        //  time: this.getCurrentTime()
       // };
        
        //setTimeout(function() {
        //  this.$chatHistoryList.append(templateResponse(contextResponse));
        //  this.scrollToBottom();
        //}.bind(this), 1500);
        
      }
      
    },
    
    addMessageText: function() {
		
      this.messageToSend = "add message testing";
      this.render();         
    },
    addMessage: function(message, sendby) {
		
      //this.messageToSend = this.$textarea.val()

      this.messageToSend = message;
      this.messageToSendBy = sendby;

      this.render();         


    },
    replyMessageByInput: function() {

        var templateResponse = Handlebars.compile( $("#message-response-template").html());
        var contextResponse = { 
          response: this.$textarea.val(),
          time: this.getCurrentTime()
        };
        
         this.$chatHistoryList.append(templateResponse(contextResponse));
        this.scrollToBottom();

    },

    replyMessage: function() {
    
     this.scrollToBottom();
    
        // responses
        var templateResponse = Handlebars.compile( $("#message-response-template").html());
        var contextResponse = { 
          response: this.$textreply.val(),
          time: this.getCurrentTime()
        };
        
        this.$chatHistoryList.append(templateResponse(contextResponse));
        this.scrollToBottom();

        this.$textarea.val('');
        

  
    },
    addMessageEnter: function(event) {
		
		
		
        // enter was pressed
        if (event.keyCode === 13) {
          this.addMessage();
        }
    },
    scrollToBottom: function() {
       this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
    },
    getCurrentTime: function() {
      return new Date().toLocaleTimeString().
              replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
    },
    getRandomItem: function(arr) {
      return arr[Math.floor(Math.random()*arr.length)];
    }
    
  };
  
    chat.init();

	var sMsglist= parent.$('#phone-panel')[0].contentWindow.currentMsglist;


     

    if (sMsglist != null)
    {
        //for (var i = 0; i < sMsglist.length; i++) {
        for (var i = sMsglist.length - 1; i >=0 ; i--) {
		    let sMsg = sMsglist[i];

            if (sMsg.SentBy == "user")
            {

                //$('#message-to-send').val(sMsg.MessageContent);
                chat.addMessage(sMsg.MessageContent,sMsg.SentBy);

               //  $('#message-to-reply').val(sMsg.MessageContent);
               //  chat.replyMessage();

            }
            else{
                $('#message-to-reply').val(sMsg.MessageContent);
                 chat.replyMessage();
            }
      
	    }
    }
 //===========================================For search filter===================================================================/
  var searchFilter = {
    options: { valueNames: ['name'] },
    init: function() {
      var userList = new List('people-detail', this.options);
      var noItems = $('<li id="no-items-found">No items found</li>');
      
      userList.on('updated', function(list) {
        if (list.matchingItems.length === 0) {
          $(list.list).append(noItems);
        } else {
          noItems.detach();
        }
      });
    }
  };
  
  searchFilter.init();
  
  //===========================================For ticket List===================================================================/
  var peopletList = {
     pId: '',
     pName: '',
    init: function() {
      this.cacheDOM();
      this.bindEvents();
      this.render();
    },
      cacheDOM: function() {
      this.$peopleHistory = $('.people-list');
      this.$peopleHistoryList =  this.$peopleHistory.find('ul');
    },
    bindEvents: function() {
      //this.$button.on('click', this.addMessage.bind(this));
      //this.$textarea.on('keyup', this.addMessageEnter.bind(this));
    },
    render: function() {
  
        
        
    },
    refreshList: function() {
      


    },
    addItem: function(sid, sname, supdateat, lsmessage)
    {
        var template = Handlebars.compile( $("#ticket-list-template").html());
        var context = { 
          id: sid,
          name: sname,
          updateat: supdateat,
          lsmessage: lsmessage
        };

        this.$peopleHistoryList.append(template(context));
        //$('#ticket-list-template').find('ul').append(template(context));
    
    }
  }


  peopletList.init();

  	//var tList = parent.$('#phone-panel')[0].contentWindow.currentTicketlist;
    var tList = parent.$('#phone-panel')[0].contentWindow.shandler.tickets;

//    var mList = parent.$('#phone-panel')[0].contentWindow.currentMsglist

    var currentQueue = parent.$('#phone-panel')[0].contentWindow.selectedQueuelist[0];


    //For controlling how many message show on same channel with same Device ID
    
    var chanellTicketCount  = tList.length;
    var chanellwaitingCount = currentQueue.waitCount;  // the latest update waitcount is updated in onTicketEvent 



    //------------------------------------------------------------------------------

    if (tList != null)
    {
        //for (var i = 0; i < sMsglist.length; i++) {
        //for (var i = tList.length - 1 - chanellwaitingCount; i >=0 ; i--) {

        for (var j = 0; j < tList.length - chanellwaitingCount; j++) {

		   let ticket = tList[j];
           peopletList.addItem(ticket.TicketId, ticket.SentBy, ticket.UpdatedAt, ticket.LastMessage);
           
	    }
    }
  //-----------Interface initialize---------------------------------//

  //for show current selected  ticket
  $('#people-detail-list').find('li').last().addClass('highlight');




    //------------------------------------------Function defined for chat input form---------------------------------------------------------------///
       $('#Test').click(function() {
                chat.addMessageText();
        });
    



})();

