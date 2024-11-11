
class wsSHandler {
	
	wsUrl="";
	websocket=null;
	tickets=[];
	messages=[];
	onTicketEvent =null;
	onMessageEvent =null;
	constructor(data) {
		//const {hostname, agentid, token, tls, listener} =data;
		const {wsUrl, apiUrl, agentid, token, tickets, listener} = data;
		console.log(data);
		//this.wsUrl=(tls)? `wss://${hostname}:8133` : `ws://${hostname}:8133`;
		//this.apiUrl=(tls)? `https://${hostname}:8033` : `http://${hostname}:8033`;
		this.wsUrl=wsUrl;
		this.apiUrl=apiUrl;
		this.agentid=agentid;
		this.token=token;
		this.tickets=tickets;
		this.onTicketEvent=listener.onTicketEvent;
		this.onMessageEvent=listener.onMessageEvent;
		this.tickets=[];
		
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
				if(this.onTicketEvent)
					this.onTicketEvent(this.tickets);

			};
		};
		this.websocket.onclose=(event)=> {
			console.log(event);
		};
		
	};

	//"TicketId": 4,
	//"EndUserId": "85292055486",
	//"EndUserName": "Tiger Chong",
	//"AssignedTo": null,
	//"Status": "open",
	//"Channel": "whatsappcloudapi",
	//"DeviceId": "85293909352",
	
	static async create(data) {
		const {hostname, agentid, token, tls, listener} =data;
		const wsUrl=(tls)? `wss://${hostname}:8133` : `ws://${hostname}:8133`;
		const apiUrl = (tls)? `https://${hostname}:8033` : `http://${hostname}:8033`;
		const response = await fetch(apiUrl +'/api/login', {
            method: 'POST',
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
            body: JSON.stringify({Agent_Id: agentid, Token: token}),
        });
		console.log(response);
		const json = await response.json();
		console.log(json);
		if(json.result=="success")
		{
			let tickets=json.tickets;
			return new wsSHandler({
				wsUrl, apiUrl, agentid, token, tickets, listener
			});
		}
		return null;
        //return await response.json();
        
    };
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
		const json = response.json();
		console.log(json);
		if(json.result=="success")
		{
			this.tickets.push(json.details.ticket);
		}
		return json;
	};

	//getTicket().then((result) => { return result; });


	async getMessagesByUserId(data)
	{
		const { agentid, token, userId, msgId, limit } = data;
		//const apiUrl = (tls) ? `https://${hostname}:8033` : `http://${hostname}:8033`;
		const response = await fetch(this.apiUrl +'/api/GetMesssagesByUserId', {
            method: 'POST',
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
            body: JSON.stringify({AgentId: agentid, Token: token, UserId: userId, MsgId: msgId, Limit: limit }),
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
	
	async getMessagesByTicketId(data)
	{
		const { agentid, token, ticketId, msgId } = data;
		//const apiUrl = (tls) ? `https://${hostname}:8033` : `http://${hostname}:8033`;
		const response = await fetch(this.apiUrl +'/api/GetMesssagesByUserId', {
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
			return json.details;
		else
			return null;
	};
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