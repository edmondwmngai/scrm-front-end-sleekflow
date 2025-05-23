//version 1.1 on 2018-04-18
//let wsRM = null;

let wsWiseMonitor = {
	wsRM: null,		//websocket
	arrAgentStatus: ["Logout", "Login", "Idle", "Ready", "Break", "Hold", "Talk", "Working", "Dialing", "Playing", "Monitor"],
	monCallType: ["2","10","16"],
	ACDGroupList: [],
	AgentList: [],
	ServiceList: [],
	SendCommandToRM : function (StrCommand){
		if (this.wsRM === null) {
			//
		}
		else if ( this.wsRM.readyState ==1){
			this.wsRM.send(StrCommand);	
		}
		else if (this.wsRM.readyState == 0) {
			//
		}
		else if (this.wsRM.readyState == 2) {
			//
		}
		else if (this.wsRM.readyState == 3) {
			//
		}
	},
	triggerEvent : function (el, eventName, options) 
	{
	  /*	Tiger 2025-04-11
	  let event;let isIE = document.documentMode;
	  if (window.CustomEvent) 
	  {
		if(isIE){
			event = document.createEvent('CustomEvent');
			event.initCustomEvent(eventName, true, true, options);

		}
		else
			event = new CustomEvent(eventName, {detail:options});
		
	  } 
	  else 
	  {
		event = document.createEvent('CustomEvent');
		event.initCustomEvent(eventName, true, true, options);
	  }
	  */
	  let event = new CustomEvent(eventName, {detail:options});
	  el.dispatchEvent(event);
	},
	OpenWebsocket: function(serverName, callback) {
		if (this.wsRM?.readyState!=1) {
            //alert("WebSocket is supported by your Browser!");
			//serverAddr = serverName;
            // Let us open a web socket
			this.ACDGroupList=[];
			this.AgentList=[];
			this.wsRM = new WebSocket(serverName);			
			this.wsRM.onopen = function() {
                // Web Socket is connected, send data using send()
				//alert(serverName);
				
				wsWiseMonitor.triggerEvent(document, 'OnRMopen');
                //Tiger callback && callback();
				if(callback) callback();
				
            };

			this.wsRM.onmessage = function(evt) {
                let received_msg = evt.data;
                let obj = JSON.parse(received_msg);

                switch (obj.Command) {
                    case '0': // Fail
						obj.ResultCommand = parseInt(obj.ResultCommand);
                        wsWiseMonitor.triggerEvent(document, 'onRMCommandFail', obj);
                        break;
                    case '1': // SUCCESS
                        obj.ResultCommand = parseInt(obj.ResultCommand);
                        wsWiseMonitor.triggerEvent(document, 'onRMCommandSuccess', obj);
                        break;
					case "2":	//Object Status
						switch(obj.ObjectType)
						{
							case "2":	//ACD Group
							break;
							
							case "3": {	//Agent
								let i = wsWiseMonitor.AgentList.findIndex(function (v) { return v.agentId == obj.AgentID });
								let theDate = new Date();
								let lastupdateTime = obj.LastStatusTime;
								if (lastupdateTime > 0) {
									theDate = new Date(theDate.setMilliseconds(theDate.getMilliseconds() - lastupdateTime));
								}
								if (i == -1) {
									wsWiseMonitor.AgentList.push({
										"agentId": parseInt(obj.AgentID), "agentName": "", "statusId": obj.StatusID, "breakId": obj.BreakStatus,
										"agentStatus": wsWiseMonitor.arrAgentStatus[parseInt(obj.StatusID)], "callId": parseInt(obj.CallID), "serviceId": 0, "serviceName": "", time: theDate
									});
									i = wsWiseMonitor.AgentList.length - 1;
									
									wsWiseMonitor.GetObjectInfo(3, obj.AgentID);
									if (wsWiseMonitor.AgentList[i].statusId == 5 || wsWiseMonitor.AgentList[i].statusId == 6) {
										if (obj.CallID != "0") {
											wsWiseMonitor.AgentList[i].callId = parseInt(obj.CallID);
											wsWiseMonitor.GetObjectInfo(20, obj.CallID);
										}
									}

								} else {
									let statusId_prev = wsWiseMonitor.AgentList[i].statusId;
									wsWiseMonitor.AgentList[i].time = theDate;
									if (wsWiseMonitor.AgentList[i].agentName == "") {
										wsWiseMonitor.GetObjectInfo(3, obj.AgentID);
									} else if (wsWiseMonitor.AgentList[i].statusId != obj.StatusID || wsWiseMonitor.AgentList[i].breakId != obj.BreakStatus) {
										wsWiseMonitor.AgentList[i].statusId = obj.StatusID;
										wsWiseMonitor.AgentList[i].breakId = obj.BreakStatus;
										wsWiseMonitor.AgentList[i].agentStatus = wsWiseMonitor.arrAgentStatus[parseInt(obj.StatusID)];
										if (wsWiseMonitor.AgentList[i].statusId != 5 && wsWiseMonitor.AgentList[i].statusId != 6) {
											wsWiseMonitor.AgentList[i].serviceId = 0;
											wsWiseMonitor.AgentList[i].serviceName = "";
										}
										wsWiseMonitor.triggerEvent(document, 'onRMAgentInfo', wsWiseMonitor.AgentList[i]);
									}
									if (wsWiseMonitor.AgentList[i].statusId == 6 && statusId_prev != 5 && statusId_prev != 6 && obj.CallID != "0") {	//6 -Talk, 6-Hold
										wsWiseMonitor.AgentList[i].callId = parseInt(obj.CallID);
										wsWiseMonitor.GetObjectInfo(20, obj.CallID);
									}

								}
								break;
							}
							case "20":
								wsWiseMonitor.triggerEvent(document, 'onRMCallStatus',obj);
							break;
							case "30":
							
							if (obj.ACDType=="2" && wsWiseMonitor.monCallType.indexOf(obj.CallType)!=-1 ) {
								let i= wsWiseMonitor.ACDGroupList.findIndex(function (v) { return v.groupId==obj.ACDID});
								if(i==-1){
									wsWiseMonitor.ACDGroupList.push({"groupId": obj.ACDID,"groupName" : "", "waitCount": obj.WaitCount, "waitTime" : obj.MaxWaitTime});
								} else if (wsWiseMonitor.ACDGroupList[i].groupName == "") {
									
									wsWiseMonitor.triggerEvent(document, 'onRMACDGroupInfo', wsWiseMonitor.ACDGroupList[i]);
									wsWiseMonitor.GetObjectInfo(2,obj.ACDID);
								} else {
									if(obj.CallType==wsWiseMonitor.monCallType[0]) {
										wsWiseMonitor.ACDGroupList[i].waitCount=0;
										wsWiseMonitor.ACDGroupList[i].waitTime=0
									} 
									wsWiseMonitor.ACDGroupList[i].waitCount +=parseInt(obj.WaitCount);
									wsWiseMonitor.ACDGroupList[i].waitTime +=parseInt(obj.MaxWaitTime);
									if(obj.CallType==wsWiseMonitor.monCallType[wsWiseMonitor.monCallType.length-1])
										wsWiseMonitor.triggerEvent(document, 'onRMACDGroupInfo', wsWiseMonitor.ACDGroupList[i]);
								}
							}
							break;
							
							
						}
						break;
					case "6":	//Object Info
						switch (obj.ObjectType) {
							case "2": {	//ACD Group							
								let i = wsWiseMonitor.ACDGroupList.findIndex(function (v) { return v.groupId == obj.GroupID });
								if (i != -1) {
									if (wsWiseMonitor.ACDGroupList[i].groupName == "") {
										wsWiseMonitor.ACDGroupList[i].groupName = obj.GroupDesc;
										wsWiseMonitor.triggerEvent(document, 'onRMACDGroupInfo', wsWiseMonitor.ACDGroupList[i]);
									}
								}
								break;
							}
							case "3": {	//Agent					
								let i = wsWiseMonitor.AgentList.findIndex(function (v) { return v.agentId == parseInt(obj.AgentID) });
								if (i != -1) {
									if (wsWiseMonitor.AgentList[i].agentName == "") {
										wsWiseMonitor.AgentList[i].agentName = obj.AgentName;
										wsWiseMonitor.triggerEvent(document, 'onRMAgentInfo', Object.assign(wsWiseMonitor.AgentList[i], obj));
										if (wsWiseMonitor.AgentList[i].callId > 0)
											wsWiseMonitor.GetObjectInfo(20, wsWiseMonitor.AgentList[i].callId);
									}
								}
								break;
							}
							case "20": {
								let i = wsWiseMonitor.AgentList.findIndex(function (v) { return v.callId == parseInt(obj.CallID) && (v.statusId == 5 || v.statusId == 6) });
								if (i != -1) {
									wsWiseMonitor.AgentList[i].serviceId = parseInt(obj.ServiceID);
									let s = wsWiseMonitor.ServiceList.findIndex(function (v) { return v.serviceId == parseInt(obj.ServiceID) });
									if (s != -1) {
										wsWiseMonitor.AgentList[i].serviceName = wsWiseMonitor.ServiceList[s].serviceName;
										wsWiseMonitor.triggerEvent(document, 'onRMAgentInfo', wsWiseMonitor.AgentList[i]);
									}
								}
								break;
							}
							case "21": {//Service
								let i = wsWiseMonitor.ServiceList.findIndex(function (v) { return v.serviceId == parseInt(obj.ServiceID) });
								if (i == -1) {
									wsWiseMonitor.ServiceList.push({ "serviceId": obj.ServiceID, "serviceName": obj.ServDesc });
								} else {
									wsWiseMonitor.ServiceList[i].serviceName = obj.ServDesc;
								}
								let x = wsWiseMonitor.AgentList.findIndex(function (v) { return v.serviceId == parseInt(obj.ServiceID) && v.serviceName == "" && (v.statusId == 5 || v.statusId == 6) });
								if (x != -1) {
									wsWiseMonitor.AgentList[x].serviceName = obj.ServDesc;
									wsWiseMonitor.triggerEvent(document, 'onRMAgentInfo', wsWiseMonitor.AgentList[x]);
								}
								break;
							}
						}
                }
            };

			this.wsRM.onclose = function() {

				// abnormal disconnect, trigger re-connect
                wsWiseMonitor.triggerEvent(document, 'onRMclose');
            };
			this.wsRM.onerror = function() {
                wsWiseMonitor.triggerEvent(document, 'onRMerror');
                // websocket has error.
                //alert("Websocket Error..."); 
            };
        }

        else {
            // The browser doesn't support WebSocket
            //alert("WebSocket NOT supported by your Browser!");
        }
    },
	CloseWebsocket() {
		this.ACDGroupList=[];
		this.AgentList=[];
		if (wsRM) {

			// prevent re-connect event be triggered, change onclose event
			this.wsRM.onclose = function () {};
			this.wsRM.close();

			// set to null to let phone.html know the socket closed in purpose can connect again
			this.wsRM = null;
		}
	},
	

    //=====================================================================================================
    //		JSON Command to be sent to server --- Start
    //=====================================================================================================		
	Login: function(AgentID, Password) {
		let cmd = {"Command" : "107", "AgentID" : AgentID, "Password" : String(Password), "RemoteConsoleFlag" :"0" };
		this.SendCommandToRM(JSON.stringify(cmd));
    },
	
	StartMonitor: function(DeviceType) {
		let cmd = {"Command" : "115", "DeviceType" : String(DeviceType)};
		this.SendCommandToRM(JSON.stringify(cmd));
	},
	
	StopMonitor: function(DeviceType) {
		let cmd = {"Command" : "116", "DeviceType" : String(DeviceType)};
		this.SendCommandToRM(JSON.stringify(cmd));
	},
	
	AddDevice : function(AgentID, AgentName, Password, Level, jsonFlag) {
		const {BeRecord, BeInbound, BeOutbound, BePD, BeVideo} = jsonFlag;
		// "DeviceType" : "3" DEVICE_AGENT
		let cmd = {"Command" : "100", "DeviceType" : "3", "DeviceID" : String(AgentID), "agentID" : String(AgentID), "agentName" : AgentName, "termName" : "terminalname", 
		"Password" : Password, "Level" : String(Level), "bRecord" : String(BeRecord), "statusID" : "2", "ACDGp_no" : "20", "Service_no" : "2", 
		"beInbound" : String(BeInbound), "beOutbound" : String(BeOutbound), "bePD" : String(BePD), "beVideo" : String(BeVideo)};
		this.SendCommandToRM(JSON.stringify(cmd));
	},
	
	AddDeviceMember : function(ACDGroupID, AgentID) {
		// "gpDeviceTyupe" :"2" DEVICE_ACDGROUP
		// "DeviceType" : "3" 	DEVICE_AGENT
		let cmd = {"Command" : "101", "gpDeviceType" :"2", "gpDeviceID" : String(ACDGroupID),  "DeviceType" : "3", "DeviceID" : String(AgentID), "RequestID" : "1", "AgentID" : "234"};
		this.SendCommandToRM(JSON.stringify(cmd));
	},
	
	RemoveDevice: function(AgentID) {
		// "DeviceType" : "3" 	DEVICE_AGENT
		let cmd = {"Command" : "111", "DeviceType" : "3", "DeviceID" : String(AgentID)};
		this.SendCommandToRM(JSON.stringify(cmd));
	},
	RemoveDeviceMember : function(ACDGroupID, AgentID) {
		// "gpDeviceTyupe" :"2" DEVICE_ACDGROUP
		// "DeviceType" : "3" 	DEVICE_AGENT
		let cmd = {"Command" : "112", "gpDeviceType" :"2", "gpDeviceID" : String(ACDGroupID),  "DeviceType" : "3", "DeviceID" : String(AgentID), "RequestID" : "1", "AgentID" : "234"};
		this.SendCommandToRM(JSON.stringify(cmd));
	},
	GetObjectInfo: function(DeviceType, DeviceID) {
		let cmd = {"Command" : "105", "DeviceType" : String(DeviceType), "DeviceID" : String(DeviceID)};
		this.SendCommandToRM(JSON.stringify(cmd));
	},
}

		
		
		
	 
    
		
	