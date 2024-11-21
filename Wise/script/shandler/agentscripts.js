class agent {

	init() {
		this.cacheDOM();
		this.bindEvents();
		//this.render();

		//this.updateStatus("Session Timeout");			 //this.updateStatus("Session Ended");
	};

	getAgentNameByID(id)
	{
		var name = top.agentList.find(l => l.AgentID == id).AgentName;


		return name;
	}


}



