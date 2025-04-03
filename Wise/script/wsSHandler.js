


class WSSHandler {
	
	wsUrl="";
	websocket=null;
	tickets=[];
	messages=[];
	onTicketEvent =null;
	onMessageEvent =null;
	onInteractEvent =null;
	constructor(data) {
		//const {hostname, agentid, token, tls, listener} =data;
		const {wsUrl, apiUrl, agentid, token, tickets, listener} = data;
		
		console.log(data);
		//this.#b64DecodeUnicode("5oi05b635qKB6KGM5YWs5biD5pyA5paw");
		//this.wsUrl=(tls)? `wss://${hostname}:8133` : `ws://${hostname}:8133`;
		//this.apiUrl=(tls)? `https://${hostname}:8033` : `http://${hostname}:8033`;
		this.wsUrl=wsUrl;
		this.apiUrl=apiUrl;
		this.agentid=agentid;
		this.token=token;
		this.tickets=tickets;
		this.onTicketEvent=listener.onTicketEvent;
		this.onMessageEvent=listener.onMessageEvent;
		this.onInteractEvent=listener.onInteractEvent;
		this.tickets=[];
		
		this.#createWebSocket();
		
	};
	static async create(data) 
	{
		const {hostname, agentid, agentname, token, tls, listener} =data;
		const wsUrl=(tls)? `wss://${hostname}:8133` : `ws://${hostname}:8133`;
		const apiUrl = (tls)? `https://${hostname}:8033` : `http://${hostname}:8033`;
		
		const response = await fetch(apiUrl +'/api/login', {
            method: 'POST',
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
            body: JSON.stringify({Agent_Id: agentid, Agent_Name: agentname, Token: token}),
        });
		console.log(response);
		const json = await response.json();
		
		console.log(json);
		if(json.result=="success")
		{
			let tickets=json.tickets;
			return new WSSHandler({
				wsUrl, apiUrl, agentid, token, tickets, listener
			});
		}
		return null;
    };
	async #reConnect() 
	{
		const response = await fetch(this.apiUrl +'/api/login', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
			body: JSON.stringify({Agent_Id: this.agentid, Token: this.token}),
		});
		const json = await response.json();
		if(json.result=="success")
		{
			this.#createWebSocket();
		}
	};
	
	#createWebSocket()
	{
		this.websocket = new WebSocket(this.wsUrl);
		this.websocket.onopen = (event) => {
			console.log(event);
			let data={
				"type": "auth",
				"agentid": this.agentid,
				"token": this.token,
			}
			this.websocket.send(JSON.stringify(data));
		};
		this.websocket.onmessage= (event) => {
			console.log(event);
			const msg = JSON.parse(event.data);
			if(msg.type=="auth") {
				if(msg.result!="success") {
					console.log("Auth fail");
				}
			}
			else if(msg.type=="ticket") {
				this.tickets=[...msg.details];
				//for(var i=0;i<this.tickets.length;i++){		// 20250403 Expected a `for-of` loop instead of a `for` loop with this simple iteration.
				//	this.tickets[i].EndUserName = this.#b64DecodeUnicode(this.tickets[i].EndUserName);
				//	this.tickets[i].EndUserEmail = this.#b64DecodeUnicode(this.tickets[i].EndUserEmail);
				//}
				for (let ticket of this.tickets) {
					ticket.EndUserName = this.#b64DecodeUnicode(ticket.EndUserName);
					ticket.EndUserEmail = this.#b64DecodeUnicode(ticket.EndUserEmail);
				}
				if(this.onTicketEvent)
					this.onTicketEvent(this.tickets);

			}
			else if(msg.type=="message") {
				msg.details.MessageContent=this.#b64DecodeUnicode(msg.details.MessageContent);
				msg.details.QuotedMsgBody=this.#b64DecodeUnicode(msg.details.QuotedMsgBody);
				msg.details.FilesJson=this.#b64DecodeUnicode(msg.details.FilesJson);
				this.onMessageEvent(msg);

			}
			else if(msg.type=="requestConference") {
				msg.details.message=this.#b64DecodeUnicode(msg.details.message);
				msg.details.ticket.EndUserName=this.#b64DecodeUnicode(msg.details.ticket.EndUserName);
				msg.details.ticket.EndUserEmail=this.#b64DecodeUnicode(msg.details.ticket.EndUserEmail);
				this.onInteractEvent(msg);
			}
			else if(msg.type=="responseConference") {
				msg.details.message=this.#b64DecodeUnicode(msg.details.message);
				this.onInteractEvent(msg);
			}
			else if(msg.type=="leaveConference") {
				this.onInteractEvent(msg);
			}
			else if(msg.type=="endTicket") {
				this.onInteractEvent(msg);
			}
			else if(msg.type=="timeout") {
				this.onInteractEvent(msg);
			}
			
		};
		//let seft=this;
		this.websocket.onclose=(event)=> {
			console.log(event);
			
			setTimeout(this.#reConnect.bind(this),1000);
			
		};
		this.websocket.onerror=(event)=> {
			console.log(event);
			this.websocket.close();
		};
	};
	#b64DecodeUnicode(str) 
	{
    	try {
			return decodeURIComponent(atob(str).split('').map(function(c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			}).join(''));
		} catch(err) {
			console.log(str);
			console.log(err);
			return str;
		}
	};
	
	//"TicketId": 4,
	//"EndUserId": "85292055486",
	//"EndUserName": "Tiger Chong",
	//"AssignedTo": null,
	//"Status": "open",
	//"Channel": "whatsappcloudapi",
	//"DeviceId": "85293909352",
	
	
	
	async getTicket(data)
	{
		const { agentid, token, channel, deviceid } = data;
		//const apiUrl = (tls) ? `https://${hostname}:8033` : `http://${hostname}:8033`;
		const response = await fetch(this.apiUrl +'/api/getticket', {
            method: 'POST',
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
            body: JSON.stringify({AgentId: agentid, Token: token, Channel: channel, DeviceId: deviceid }),
        });
		if (!response.ok) {
			console.log(response);
			return null;
		}
		const json = await response.json();
		console.log(json);
		if(json.result=="success")
		{
			this.tickets.push(json.details.ticket);
		}
		return json;
	};
	
	async endTicket(data)
	{
		const { agentid, token, ticketid } = data;
		//const apiUrl = (tls) ? `https://${hostname}:8033` : `http://${hostname}:8033`;
		const response = await fetch(this.apiUrl +'/api/endticket', {
            method: 'POST',
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
            body: JSON.stringify({AgentId: agentid, Token: token, TicketId: ticketid}),
        });
		if (!response.ok) {
			console.log(response);
			return null;
		}
		const json = await response.json();
		console.log(json);
		if(json.result=="success")
		{
			//this.tickets.push(json.details.ticket);
			return true;
		}
		return json;
	};

	//getTicket().then((result) => { return result; });


	async getMessagesByUserId(data)
	{
		const { agentid, token, userId, msgId, limit } = data;
		//const apiUrl = (tls) ? `https://${hostname}:8033` : `http://${hostname}:8033`;
		//const response = await fetch(this.apiUrl +'/api/GetMesssagesByUserId', {
		const response = await fetch(this.apiUrl +'/api/GetMessagesByUserId', {
		
            method: 'POST',
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
			//body: JSON.stringify({ AgentId: agentid, Token: token, UserId: userId, MsgId: msgId, Limit: limit }),
			body: JSON.stringify({ AgentId: agentid, Token: token, UserId: userId, MsgId: msgId, Limit: limit }),
        });
		if (!response.ok) {
			console.log(response);
			return null;
		}
		const json = await response.json();
		if (json.result == "success")
			return json.details;
		else
			return null;
	};
	
	async getMessagesByTicketId(data)
	{
		const { agentid, token, ticketId } = data;
		//const apiUrl = (tls) ? `https://${hostname}:8033` : `http://${hostname}:8033`;
		const response = await fetch(this.apiUrl +'/api/GetMessagesByTicketId', {
            method: 'POST',
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
            body: JSON.stringify({AgentId: agentid, Token: token, TicketId: ticketId }),
        });
		if (!response.ok) {
			console.log(response);
			return null;
		}
		const json = await response.json();
		if(json.result=="success")
			return json.details;
		else
			return null;
	};
	
	async sendMessage(formData)
	{
		
		const response = await fetch(this.apiUrl +'/api/send', {
            method: 'POST',
            body: formData,
        });
		if (!response.ok) {
			console.log(response);
			return null;
		}

		const json = await response.json();
		if(json.result=="success")
		{
			return json.details;
		}
		else
		{
			console.log(json.details);
			return null;
		}
	};
	
	async requestConference(data)
	{
		const { agentId, token, ticketId, targetAgentId, message } = data;
		const response = await fetch(this.apiUrl +'/api/RequestConference', {
            method: 'POST',
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
            body: JSON.stringify({AgentId: agentId, Token: token, TicketId: ticketId, TargetAgentId : targetAgentId, Message: message }),
        });
		if (!response.ok) {
			console.log(response);
			return null;
		}
		const json = await response.json();
		return json;
	}
	
	async responseConference(data)
	{
		
		const { agentId, token, ticketId, requestAgentId, message, agentResponse } = data;
		const response = await fetch(this.apiUrl +'/api/ResponseConference', {
            method: 'POST',
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},																						  
            body: JSON.stringify({AgentId: agentId, Token: token, TicketId: ticketId, RequestAgentId: requestAgentId, Message: message, AgentResponse: agentResponse }),
        });
		if (!response.ok) {
			console.log(response);
			return null;
		}
		const json = await response.json();
		return json;
	}

	async leaveConference(data) {

		const { agentId, token, ticketId} = data;
		const response = await fetch(this.apiUrl + '/api/leaveConference', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
			body: JSON.stringify({ AgentId: agentId, Token: token, TicketId: ticketId}),
		});
		if (!response.ok) {
			console.log(response);
			return null;
		}
		const json = await response.json();
		return json;
	}

	/*
	connect() {
		if(this.wsUrl=="") return;
		if(this.websocket) return;
		
		this.websocket = new WebSocket(this.wsUrl);
		this.websocket.onopen = (event) => {
			console.log(event);
			this.onOpenWebsocket(event);
		};
		this.websocket.onmessage= (event) => {
			console.log(event);
			const msg = JSON.parse(event.data);
			if(msg.type=="ticket") {
				this.tickets=[...msg.data];
			};
			if(this.onTicketsUpdated)
				this.onTicketsUpdated(this.tickets);
		};
		
	};
	*/
}
