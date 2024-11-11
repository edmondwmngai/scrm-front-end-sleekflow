
class wsSHandler {
	
	wsUrl="";
	websocket=null;
	tickets=[];
	messages=[];
	constructor(data) {
		const {wsUrl, apiUrl, agentid, token, tickets} = data;
		this.wsUrl=wsUrl;
		this.apiUrl=apiUrl;
		this.agentid=agentid;
		this.token=token;
		this.tickets=[...tickets];
	};
	static async create(hostname, agentid, token, tls=false) {
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
				wsUrl, apiUrl, agentid, token, tickets
			});
		}
		return null;
        //return await response.json();
        
    };
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
	
}