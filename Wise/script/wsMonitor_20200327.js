//version 1.1 on 2018-04-18


var wsWiseMonitor = {
	arrAgentStatus: ["Logout", "Login", "Idle", "Ready", "Break", "Hold", "Talk", "Working", "Dialing", "Playing", "Monitor"],
	ACDGroupList: [],
	AgentList: [],
	SendCommandToRM : function (StrCommand){
		console.log(StrCommand);
		console.log(wsRM.readyState);
		if ( wsRM === undefined){
			//logintimeInterval = setTimeout(function(){ retryLogin() }, 5000);		
		}
		else if ( wsRM.readyState ==1){
			wsRM.send(StrCommand);	
		}
		else if ( wsRM.readyState ==0){
		}
		else if ( wsRM.readyState ==2){
		}
		else if ( wsRM.readyState ==3){
		}
	},
	triggerEvent : function (el, eventName, options) 
	{
	  var event;var isIE = false || !!document.documentMode;
	  if (window.CustomEvent) 
	  {
		//var is_IE_11 = !(window.ActiveXObject) && "ActiveXObject" in window;
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
	  el.dispatchEvent(event);
	},
	OpenWebsocket: function(serverName, callback) {
        if ("WebSocket" in window) {
            //alert("WebSocket is supported by your Browser!");
			//serverAddr = serverName;
            // Let us open a web socket
			wsWiseMonitor.ACDGroupList=[];
			wsWiseMonitor.AgentList=[];
            wsRM = new WebSocket("ws://" + serverName +":2312");
            
			
            wsRM.onopen = function() {
                // Web Socket is connected, send data using send()
				//alert(serverName);
				
				wsWiseMonitor.triggerEvent(document, 'OnRMopen');
                callback && callback();
				
            };

            wsRM.onmessage = function(evt) {
                var received_msg = evt.data;
                var obj = JSON.parse(received_msg);
                // alert ("received_msg: " + received_msg);
                //received_msg is still correct here

                console.log(obj);
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
							console.log(wsWiseMonitor.ACDGroupList);
							var i= wsWiseMonitor.ACDGroupList.findIndex(function (v) { return v.groupId==obj.GroupID});
							if(i==-1){
								wsWiseMonitor.ACDGroupList.push({"groupId": obj.GroupID,"groupName" : "", "waitCount": obj.WaitCount, "waitTime" : obj.MaxWaitTime});
								//i=wsWiseMonitor.ACDGroupList.length-1;
								//wsWiseMonitor.triggerEvent(document, 'onRMACDGroupInfo', wsWiseMonitor.ACDGroupList[i]);
								wsWiseMonitor.GetObjectInfo(2,obj.GroupID);
							} else {
								
								if(wsWiseMonitor.ACDGroupList[i].groupName==""){
									wsWiseMonitor.triggerEvent(document, 'onRMACDGroupInfo', wsWiseMonitor.ACDGroupList[i]);
									wsWiseMonitor.GetObjectInfo(2,obj.GroupID);
								} else if (wsWiseMonitor.ACDGroupList[i].waitCount!=obj.WaitCount || wsWiseMonitor.ACDGroupList[i].waitTime!=obj.MaxWaitTime){
									wsWiseMonitor.ACDGroupList[i].waitCount =obj.WaitCount;
									wsWiseMonitor.ACDGroupList[i].waitTime =obj.MaxWaitTime;
									console.log(wsWiseMonitor.ACDGroupList);
									wsWiseMonitor.triggerEvent(document, 'onRMACDGroupInfo', wsWiseMonitor.ACDGroupList[i]);
								}
							}
							break;
							case "3":	//Agent
							
							console.log(wsWiseMonitor.AgentList);
							var i= wsWiseMonitor.AgentList.findIndex(function (v) { return v.agentId==obj.AgentID});
							if(i==-1){
								wsWiseMonitor.AgentList.push({"agentId": parseInt(obj.AgentID), "agentName":"", "statusId": obj.StatusID, "breakId" : obj.BreakStatus, 
								"agentStatus": wsWiseMonitor.arrAgentStatus[parseInt(obj.StatusID)]});
								//i=wsWiseMonitor.AgentList.length-1;
								//wsWiseMonitor.triggerEvent(document, 'onRMAgentInfo', wsWiseMonitor.AgentList[i]);
								wsWiseMonitor.GetObjectInfo(3,obj.AgentID);
								
							} else {
								
								if(wsWiseMonitor.AgentList[i].agentName==""){
									wsWiseMonitor.GetObjectInfo(3,obj.AgentID);
								} else if (wsWiseMonitor.AgentList[i].statusId !=obj.StatusID || wsWiseMonitor.AgentList[i].breakId !=obj.BreakStatus) {
									wsWiseMonitor.AgentList[i].statusId =obj.StatusID;
									wsWiseMonitor.AgentList[i].breakId =obj.BreakStatus;
									wsWiseMonitor.AgentList[i].agentStatus = wsWiseMonitor.arrAgentStatus[parseInt(obj.StatusID)];
									wsWiseMonitor.triggerEvent(document, 'onRMAgentInfo', wsWiseMonitor.AgentList[i]);
									console.log(wsWiseMonitor.AgentList);
								}
								
							}
							break;
							/*
							case "30":
							if (obj.ACDType=="2") {
								var i= wsWiseMonitor.ACDGroupList.findIndex(function (v) { return v.groupId==obj.ACDID});
								if(i==-1) return;
								if (wsWiseMonitor.ACDGroupList[i].waitCount!=obj.WaitCount || wsWiseMonitor.ACDGroupList[i].waitTime!=obj.MaxWaitTime){
									wsWiseMonitor.ACDGroupList[i].waitCount =obj.WaitCount;
									wsWiseMonitor.ACDGroupList[i].waitTime =obj.MaxWaitTime;
									console.log(wsWiseMonitor.ACDGroupList);
									wsWiseMonitor.triggerEvent(document, 'onRMACDGroupInfo', wsWiseMonitor.ACDGroupList[i]);
								}
							}
							break;
							*/
							
						}
						break;
					case "6":	//Object Info
						switch(obj.ObjectType)
						{
							case "2":	//ACD Group
							console.log(wsWiseMonitor.ACDGroupList);
							
							var i= wsWiseMonitor.ACDGroupList.findIndex(function (v) { return v.groupId==obj.GroupID});
							if(i!=-1){
								if(wsWiseMonitor.ACDGroupList[i].groupName==""){
									wsWiseMonitor.ACDGroupList[i].groupName=obj.GroupDesc;
									wsWiseMonitor.triggerEvent(document, 'onRMACDGroupInfo', wsWiseMonitor.ACDGroupList[i]);
									console.log(wsWiseMonitor.ACDGroupList);
								}
							}
							break;
							case "3":	//Agent
							console.log(wsWiseMonitor.AgentList);
							
							var i= wsWiseMonitor.AgentList.findIndex(function (v) { return v.agentId==parseInt(obj.AgentID)});
							if(i!=-1){
								if(wsWiseMonitor.AgentList[i].agentName==""){
									wsWiseMonitor.AgentList[i].agentName=obj.AgentName;
									wsWiseMonitor.triggerEvent(document, 'onRMAgentInfo', wsWiseMonitor.AgentList[i]);
									console.log(wsWiseMonitor.AgentList);
								}
							}
							break;
						}
                }
            };

            wsRM.onclose = function() {
				//wsWiseMonitor.OpenWebsocket();
                wsWiseMonitor.triggerEvent(document, 'onRMclose');
                //alert(ws);
            };
            wsRM.onerror = function() {
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
		wsRM.onclose = function () {};
		wsWiseMonitor.ACDGroupList=[];
		wsWiseMonitor.AgentList=[];
		wsRM.close();
	},
	

    //=====================================================================================================
    //		JSON Command to be sent to server --- Start
    //=====================================================================================================		
	Login: function(AgentID, Password) {
		var cmd = {"Command" : "107", "AgentID" : AgentID, "Password" : String(Password), "RemoteConsoleFlag" :"0" };
		console.log(cmd);
		wsWiseMonitor.SendCommandToRM(JSON.stringify(cmd));

    },
	
	StartMonitor: function(DeviceType) {
		var cmd = {"Command" : "115", "DeviceType" : String(DeviceType)};
		wsWiseMonitor.SendCommandToRM(JSON.stringify(cmd));
	},
	
	StopMonitor: function(DeviceType) {
		var cmd = {"Command" : "116", "DeviceType" : String(DeviceType)};
		wsWiseMonitor.SendCommandToRM(JSON.stringify(cmd));
	},
	
	AddDevice : function(AgentID, AgentName, Password, Level, BeRecord, BeInbound, BeOutbound, BePD, BeVideo) {
		// "DeviceType" : "3" DEVICE_AGENT
		var cmd = {"Command" : "100", "DeviceType" : "3", "DeviceID" : String(AgentID), "agentID" : String(AgentID), "agentName" : AgentName, "termName" : "terminalname", 
		"Password" : Password, "Level" : String(Level), "bRecord" : String(BeRecord), "statusID" : "2", "ACDGp_no" : "20", "Service_no" : "2", 
		"beInbound" : String(BeInbound), "beOutbound" : String(BeOutbound), "bePD" : String(BePD), "beVideo" : String(BeVideo)};
		wsWiseMonitor.SendCommandToRM(JSON.stringify(cmd));
	},
	
	AddDeviceMember : function(ACDGroupID, AgentID) {
		// "gpDeviceTyupe" :"2" DEVICE_ACDGROUP
		// "DeviceType" : "3" 	DEVICE_AGENT
		var cmd = {"Command" : "101", "gpDeviceType" :"2", "gpDeviceID" : String(ACDGroupID),  "DeviceType" : "3", "DeviceID" : String(AgentID), "RequestID" : "1", "AgentID" : "234"};
		wsWiseMonitor.SendCommandToRM(JSON.stringify(cmd));
	},
	
	RemoveDevice: function(AgentID) {
		// "DeviceType" : "3" 	DEVICE_AGENT
		var cmd = {"Command" : "111", "DeviceType" : "3", "DeviceID" : String(AgentID)};
		wsWiseMonitor.SendCommandToRM(JSON.stringify(cmd));
	},
	RemoveDeviceMember : function(ACDGroupID, AgentID) {
		// "gpDeviceTyupe" :"2" DEVICE_ACDGROUP
		// "DeviceType" : "3" 	DEVICE_AGENT
		var cmd = {"Command" : "112", "gpDeviceType" :"2", "gpDeviceID" : String(ACDGroupID),  "DeviceType" : "3", "DeviceID" : String(AgentID), "RequestID" : "1", "AgentID" : "234"};
		wsWiseMonitor.SendCommandToRM(JSON.stringify(cmd));
	},
	GetObjectInfo: function(DeviceType, DeviceID) {
		var cmd = {"Command" : "105", "DeviceType" : String(DeviceType), "DeviceID" : String(DeviceID)};
		wsWiseMonitor.SendCommandToRM(JSON.stringify(cmd));
	},
}
/*
if (typeof triggerEvent != "undefined") {
	function triggerEvent(el, eventName, options) 
	{
	  var event;var isIE = false || !!document.documentMode;
	  if (window.CustomEvent) 
	  {
		//var is_IE_11 = !(window.ActiveXObject) && "ActiveXObject" in window;
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
	  el.dispatchEvent(event);
	}
}
*/
/*
function triggerEvent(el, eventName, options) 
{
  var event;var isIE = false || !!document.documentMode;
  if (window.CustomEvent) 
  {
	//var is_IE_11 = !(window.ActiveXObject) && "ActiveXObject" in window;
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
  el.dispatchEvent(event);
}

*/

		
		
		
	 
    
		
	