class Agent {

	init() {
		this.cacheDOM();
		this.bindEvents();
		//this.render();

		//this.updateStatus("Session Timeout");			 //this.updateStatus("Session Ended");
	};

	getAgentNameByID(id)
	{

		if (id != null) {
			var name = top.agentList.find(l => l.AgentID == id).AgentName;


			return name;
		} else {

			return "";
		}
	}


}



