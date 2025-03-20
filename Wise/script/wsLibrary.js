//version 1.1 on 2018-04-18
var ws = null;
var wsCreatedTime=new Date();

var wsWiseAgent = {
	
	OpenWebsocket: function(serverName, callback) {
        if ("WebSocket" in window) {
            //alert("WebSocket is supported by your Browser!");
			//serverAddr = serverName;
            // Let us open a web socket
			// serverName = (typeof serverName=="undefined")? ws.url : "ws://" + serverName;
			serverName = (typeof serverName=="undefined")? ws.url : (config.isHttps? ("wss://" + serverName) : "ws://" + serverName);
			//serverName ="wss://win2016-demo.sipmarvel.hk:2311"
            ws = new WebSocket(serverName);
            //alert(serverName);   
			
            ws.onopen = function() {
                // Web Socket is connected, send data using send()
				triggerEvent(document, 'wsOnopen');
                callback && callback();
				
            };

            ws.onmessage = function(evt) {
                // var received_msg = evt.data;
				// var obj = JSON.parse(received_msg);
				var obj = JSON.parse(evt.data);
                // alert ("received_msg: " + received_msg);
                //received_msg is still correct here

				//console.log(obj);
                switch (obj.Command) {
                    case '0': // Fail

                        var description = CommandHexToDescription(obj.Message);
                        obj.Description = description;
                        triggerEvent(document, 'CommandFail', obj);
                        break;
                    case '1': // SUCCESS
                        obj.ResultCommand = parseInt(obj.ResultCommand);
                        var description = CommandIntToDescription(obj.ResultCommand);
                        obj.Description = description;
                        triggerEvent(document, 'CommandSuccess', obj);
						
                        break;
					case '2':
						obj.ObjectType = parseInt(obj.ObjectType);
						triggerEvent(document, 'ObjectStatus', obj);
						break;
                    case '4': //Agent Status Event . Here we define the event name "AgentStatus", in order to hold the status
                        {
                            obj.StatusID = parseInt(obj.StatusID);
                            triggerEvent(document, 'AgentStatusEvent', obj);
                        } break;
                    case '5': // CallMessage
                        for (i = 0; i < obj.Member.length; i++) {//Object got: {obj.Member[i].VarType, obj.Member[i].VarMsg}
                            obj.Member[i].VarType = parseInt(obj.Member[i].VarType);
                        }
                        triggerEvent(document, 'CallMessage', obj);
                        break;
                    case '6': //CallResultEvent
                        obj.Type = parseInt(obj.Type);
                        obj.Result = parseInt(obj.Result);
                        triggerEvent(document, 'CallResultEvent', obj);
                        break;
                    case '7': //CallStatusEvent
                        obj.ConnID = parseInt(obj.ConnID);
                        obj.StatusID = parseInt(obj.statusID);
                        triggerEvent(document, 'CallStatusEvent', obj);
                        break;
                    case '8': //ConnectStatus
                        obj.StatusID = parseInt(obj.StatusID);
                        triggerEvent(document, 'ConnectStatus', obj); // {obj.StatusID}
                        break;
                    case '11': //AnsCallInfo
                        obj.CallType = parseInt(obj.CallType);
                        obj.DeviceType = parseInt(obj.DeviceType);
                        obj.DeviceID = parseInt(obj.DeviceID);
                        obj.ReplyFlag = parseInt(obj.ReplyFlag);
                        triggerEvent(document, 'AnsCallInfo', obj); //Object got: {obj.CallType, obj.DeviceType, obj.DeviceID, obj.ReplyFlag}
                        break;
                    case '12':
                        obj.ConnID = parseInt(obj.ConnID);
                        obj.CallType = parseInt(obj.CallType);
                        obj.StatusID = parseInt(obj.StatusID);
                        triggerEvent(document, 'MediaCallStatus', obj); //Object got: {obj.ConnID, obj.CallType, obj.StatusID}
                        break;
                    case '14':
                        obj.serviceID = parseInt(obj.serviceID);
                        obj.WaitCount = parseInt(obj.WaitCount);
                        obj.MaxWaitTime = parseInt(obj.MaxWaitTime);
                        triggerEvent(document, 'ServiceQueue', obj); //Object got: {obj.serviceID, obj.WaitCount, obj.MaxWaitTime}
                        break;
                    case '15':
                        obj.DeviceType = parseInt(obj.DeviceType);
                        obj.DeviceID = parseInt(obj.DeviceID);
                        obj.CallID = parseInt(obj.CallID);
                        obj.ConID = parseInt(obj.ConID);
                        obj.Attribute = parseInt(obj.Attribute);
                        obj.StatusID = parseInt(obj.StatusID);
                        triggerEvent(document, 'ConfMemberStatus', obj); //Object got: {obj.DeviceType, obj.DeviceID, obj.DeviceName, obj.CallID, obj.ConID, obj.Attribute, obj.StatusID}
                        break;
                    case '16':
                        for (i = 0; i < obj.Member.length; i++) {
                            obj.Member[i].GroupID = parseInt(obj.Member[i].GroupID);
                            obj.Member[i].Gpmember = parseInt(obj.Member[i].Gpmember);
                        }
                        triggerEvent(document, 'ACDGroupInfo', obj); //Object got: {obj.Member[i].GroupID, obj.Member[i].GroupName, obj.Member[i].Gpmember
                        break;
                    case '17':
                        for (i = 0; i < obj.Member.length; i++) {
                            obj.Member[i].ParkID = parseInt(obj.Member[i].ParkID);
                            obj.Member[i].Pkmemberno = parseInt(obj.Member[i].Pkmemberno);
                        }
                        triggerEvent(document, 'ACDParkInfo', obj); //Object got: {obj.Member[i].ParkID, obj.Member[i].ParkName, obj.Member[i].Pkmemberno}
                        break;
                    case '18':
						
						// obj.Member if have no members, would be null
						if (obj.Member == null) {obj.Member = [];}
                        for (i = 0; i < obj.Member.length; i++) {
                            obj.Member[i].GroupID = parseInt(obj.Member[i].GroupID);
                            obj.Member[i].AgentID = parseInt(obj.Member[i].AgentID);
                            obj.Member[i].StatusID = parseInt(obj.Member[i].StatusID);
                        }
                        triggerEvent(document, 'ACDGroupMember', obj); //Object got: {obj.Member[i].GroupID, obj.Member[i].AgentID, obj.Member[i].StatusID, obj.Member[i].AgentName}					
                        break;
                    case '19':
                        obj.FlowID = parseInt(obj.FlowID);
                        triggerEvent(document, 'IVRSInfo', obj); //Object got: {obj.FlowID, obj.FlowDesce}
                        break;
                    case '20':
                        for (i = 0; i < obj.Member.length; i++) {
                            obj.Member[i].GroupID = parseInt(obj.Member[i].GroupID);
                            obj.Member[i].WaitCount = parseInt(obj.Member[i].WaitCount);
                            obj.Member[i].MaxWaitTime = parseInt(obj.Member[i].MaxWaitTime);
                            obj.Member[i].CallType = parseInt(obj.Member[i].CallType);
                        }
                        triggerEvent(document, 'ACDGroupQueueEx', obj); //Object got: {obj.Member[i].GroupID,obj.Member[i].WaitCount,obj.Member[i].MaxWaitTime,obj.Member[i].CallType}
                        break;
                    case '21':
                        for (i = 0; i < obj.Member.length; i++) {
                            obj.Member[i].ParkID = parseInt(obj.Member[i].ParkID);
                            obj.Member[i].WaitCount = parseInt(obj.Member[i].WaitCount);
                            obj.Member[i].MaxWaitTime = parseInt(obj.Member[i].MaxWaitTime);
                            obj.Member[i].CallType = parseInt(obj.Member[i].CallType);
                        }
                        triggerEvent(document, 'ACDParkQueueEx', obj); //Object got: {obj.ParkID, obj.WaitCount, 
                        //obj.MaxWaitTime, obj.CallType}
                        break;
                    case '23':
                        obj.WaitCount = parseInt(obj.WaitCount);
                        obj.MaxWaitTime = parseInt(obj.MaxWaitTime);
                        obj.CallType = parseInt(obj.CallType);
                        triggerEvent(document, 'SkillQueue', obj); //Object got: {obj.WaitCount, obj.MaxWaitTime, obj.CallType}
                        break;
                    case '27':
                        obj.ConnID = parseInt(obj.ConnID);
                        obj.OdeviceType = parseInt(obj.OdeviceType);
                        obj.OdeviceID = parseInt(obj.OdeviceID);
                        obj.ANI = parseInt(obj.ANI);
                        obj.DNIS = parseInt(obj.DNIS);
                        triggerEvent(document, 'AddAgentCallQueue', obj); //Object got: {obj.ConnID, obj.OdeviceType, obj.OdeviceID, obj.ANI, obj.DNIS}
                        break;
                    case '28': //Object got: {obj.ConnID}
                        obj.ConnID = parseInt(obj.ConnID);
                        triggerEvent(document, 'RemoveAgentCallQueue', obj);
                        break;
                    case '29':
                        obj.ShareVoiceStatus = parseInt(obj.ShareVoiceStatus);
                        obj.ErrorCode = parseInt(obj.ErrorCode);
                        triggerEvent(document, 'ShareVoiceStatus', obj); //Object got: {obj.ShareVoiceStatus obj.ErrorCode}
                        break;
					case '30':
						triggerEvent(document, 'StartScreenCap', obj);
						break;
					case '31':
						triggerEvent(document, 'StopScreenCap', obj);
						break;
                    case '33':
                        obj.DeviceType = parseInt(obj.DeviceType);
                        obj.DeviceID = parseInt(obj.DeviceID);
                        obj.CallType = parseInt(obj.CallType);
                        obj.IsFullList = parseInt(obj.IsFullList);
                        obj.CallDataCount = parseInt(obj.CallDataCount);
                        triggerEvent(document, 'CallQueueData_UC', obj); //Object got: {obj.DeviceType, obj.DeviceID, obj.CallType, obj.IsFullList, obj.CallDataCount, obj.CallListData}
                        break;
                    case '34':
                        obj.SupervisorID = parseInt(obj.SupervisorID);
                        triggerEvent(document, 'ClearRecourse_UC', obj); //Object got: {obj.SupervisorID, obj.RecourseInfo}
                        break;
                    case '35':
                        obj.DeviceID = parseInt(obj.DeviceID);
                        triggerEvent(document, 'RecvShortMsg_UC', obj); //Object got: {obj.DeviceID, obj.ShortMsg}
                        break;
                    case '36':
                        for (i = 0; i < obj.Member.length; i++) {
                            obj.Member[i].VarType = parseInt(obj.Member[i].VarType);
                        }
                        triggerEvent(document, 'CallMessage_UC', obj); //Object got: {obj.Member[i].VarType, obj.Member[i].VarMsg}
                        break;
                    case '37':
                        obj.AgentID = parseInt(obj.AgentID);
                        obj.StatusID = parseInt(obj.StatusID);
                        triggerEvent(document, 'LogonAgent', obj); //Object got: {obj.Command, obj.AgentID, obj.StatusID, obj.AgentName}
                        break;
					case '38': //TicketList
						obj.agent_id = parseInt(obj.agent_id);
						triggerEvent(document, 'TicketList', obj); // Object got: {obj.agent_id}
						break;
					case '39':	// TicketMsgList
						obj.agent_id = parseInt(obj.agent_id);
						obj.ticket_id = parseInt(obj.ticket_id);
						obj.offline_form = parseInt(obj.offline_form);
						obj.online_form = parseInt(obj.online_form);
						obj.status_id = parseInt(obj.status_id);
						triggerEvent(document, 'TicketMsgList', obj); // Object got: {obj.ticket_id}
						break;
					case '40': // 	SendSocialMsgToAgent
						obj.ticket_id = parseInt(obj.ticket_id);
						// obj.enduser_id = parseInt(obj.enduser_id);
						obj.assign_to = parseInt(obj.assign_to);
						obj.offline_form = parseInt(obj.offline_form);
						obj.online_form = parseInt(obj.online_form);
						obj.unread_num = parseInt(obj.unread_num);
						triggerEvent(document, 'SendSocialMsgToAgent', obj); // Object got: {obj.ticket_id, obj.assign_to, obj.profile_pic, obj.nick_name, obj.msg_list.id, obj.msg_list. }
						break;
					case '42': // 	EndUserInfo 
						obj.agent_id = parseInt(obj.agent_id);
						// obj.enduser_id = parseInt(obj.enduser_id);
						triggerEvent(document, 'EndUserInfo', obj); // Object got: {obj.agent_id, obj.enduser_id}						
						break;
					case '43': // 	ResultSendMsg 
						triggerEvent(document, "ResultSendMsg", obj);  // Object got: {obj.data.id, obj.data.client_msg_id, obj.data.sent_time}
						break;
					case '44': // ResultSendFile
						triggerEvent(document, "ResultSendFile", obj); // Object got: {obj.data.id, obj.data.client_msg_id, obj.data.sent_time, obj.data.originName, obj.data.suffix, obj.data.url}
						break;
					case '45': // ClientMsgID
						obj.CmdType = parseInt(obj.CmdType);
						obj.client_msg_id = parseInt(obj.client_msg_id); 
						triggerEvent(document, "ClientMsgID", obj); // Object got: {obj.CmdType, obj.client_msg_id}
						break;
					case '46': // 	RecvInvAgentToChat 
						obj.agent_id = parseInt(obj.agent_id);
						obj.ticket_id = parseInt(obj.ticket_id);
						triggerEvent(document, "RecvInvAgentToChat", obj); 	// Object got: {obj.agent_id, obj.ticket_id, obj.msg_content}
						break;
					case '47': // FaceBookPost
						obj.ticket_id = parseInt(obj.ticket_id);
						triggerEvent(document, "FaceBookPost", obj); 	//Object got: {obj.from_name, obj.message, obj.sent_time, obj.sub_list[i].from_name}
						break;	
					case '48': // 	TicketTimeout 
						obj.ticket_id = parseInt(obj.ticket_id);
						triggerEvent(document, "TicketTimeout", obj);  // Object got: {obj.ticket_id}
						break;
					case '49': //	AgentTicketStatus 
						obj.agent_id = parseInt(obj.agent_id);
						obj.ticket_id = parseInt(obj.ticket_id);
						obj.status_id = parseInt(obj.status_id);
						triggerEvent(document, "AgentTicketStatus", obj); 	// Object got: {obj.agent_id, obj.ticket_id, obj.status_id}
						break;
					case '50': // 	AgentTicketList 
						obj.agent_id = parseInt(obj.agent_id);
						triggerEvent(document, "AgentTicketList", obj); // Object got: {obj.ticket_list[i].ticket_id}
						break;
					case '51': //	OnlineForm 
						obj.agent_id = parseInt(obj.agent_id);
						triggerEvent(document, "OnlineForm", obj); // Object got: {obj.data[i].fieldname, obj.data[i].fieldvalue}
						break;	
					case '52': //	OfflineForm 
						obj.agent_id = parseInt(obj.agent_id);
						triggerEvent(document, "OfflineForm", obj); // Object got: {obj.data[i].fieldname, obj.data[i].fieldvalue}
						break;
					case '53': //		UpperLevelComment  
						obj.agent_id = parseInt(obj.agent_id);
						triggerEvent(document, "UpperLevelComment", obj); // Object got: {obj.msg_list[i].id, obj.msg_list[i].sender, obj.msg_list[i].sent_time, obj.msg_list[i].index_no, obj.msg_list[i].msg_type, obj.msg_list[i].msg_content, obj.msg_list[i].sent_by, obj.msg_list[i].msg_object_path, obj.msg_list[i].msg_completed}
						break;
					case '54': //		SameLevelComment    
						obj.agent_id = parseInt(obj.agent_id);
						triggerEvent(document, "SameLevelComment", obj); // Object got: {obj.msg_list[i].id, obj.msg_list[i].sender, obj.msg_list[i].sent_time, obj.msg_list[i].index_no, obj.msg_list[i].msg_type, obj.msg_list[i].msg_content, obj.msg_list[i].sent_by, obj.msg_list[i].msg_object_path, obj.msg_list[i].msg_completed}
						break;		
					case '55': //		SameLevelReply    
						obj.agent_id = parseInt(obj.agent_id);
						triggerEvent(document, "SameLevelReply", obj); // Object got: {obj.msg_list[i].id, obj.msg_list[i].sender, obj.msg_list[i].sent_time, obj.msg_list[i].index_no, obj.msg_list[i].msg_type, obj.msg_list[i].msg_content, obj.msg_list[i].sent_by, obj.msg_list[i].msg_object_path, obj.msg_list[i].msg_completed}
						break;		
					case '56': // 	EndTicket 
						obj.ticket_id = parseInt(obj.ticket_id);
						triggerEvent(document, "EndTicket", obj);
						break;
					case '57':
						triggerEvent(document, "WCCustomerParameter", obj);
						break;
					case '58':
						triggerEvent(document, "WCCustomerReadMsg", obj);
						break;
					case '59':
						triggerEvent(document, "SendTemplateMsg", obj);
						break;
					case '60': // 	WCCustomerInput  
						obj.ticket_id = parseInt(obj.ticket_id);
						triggerEvent(document, "WCCustomerInput", obj);
						break;
					case '61': // 	AddToChatRoom  
						obj.ticket_id = parseInt(obj.ticket_id);
						triggerEvent(document, "AddToChatRoom", obj);
						break;
					case '62': // 	RmFromChatRoom  
						obj.ticket_id = parseInt(obj.ticket_id);
						triggerEvent(document, "RmFromChatRoom", obj);
						break;
					case '63': // 	LogonAgentEx 
						triggerEvent(document, "LogonAgentEx ", obj);
						break;
                }
            };

            ws.onclose = function() {
                // websocket is closed.
                //wsWiseAgent.OpenWebsocket(serverName, retryLogin);
				//wsWiseAgent.OpenWebsocket(serverAddr);
				//console.log("ws.close");
				var now=new Date();
				if((now-wsCreatedTime)/1000<=10) {
					alert("Duplicate login!");
					window.parent.logoutClicked();
				} else {
					wsWiseAgent.OpenWebsocket();
					triggerEvent(document, 'wsOnclose');
				}
                //alert(ws);
            };
            ws.onerror = function() {
                triggerEvent(document, 'wsOnerror');
                // websocket has error.
                //alert("Websocket Error..."); 
            };
        }

        else {
            // The browser doesn't support WebSocket
            //alert("WebSocket NOT supported by your Browser!");
        }
    },


    //=====================================================================================================
    //		JSON Command to be sent to server --- Start
    //=====================================================================================================		



    AcceptCall: function() {
		/*
        var strcommand = "{ \"Command\":\"100\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "100"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    AcceptMediaCall: function(ConnID) {
		/*
        var strcommand = "{ \"Command\":\"101\" ,";
        strcommand += "\"ConnID\": \"" + ConnID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "101", "ConnID" : ConnID};
		SendCommandToServer(JSON.stringify(cmd));

    },

    BindToACDGroup: function(GroupID) {
		/*
        var strcommand = "{ \"Command\":\"105\" ,";
        strcommand += "\"GroupID\": \"" + GroupID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "105", "GroupID" : GroupID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    Break: function() {
		/*
        var strcommand = "{ \"Command\":\"106\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "106"};
		SendCommandToServer(JSON.stringify(cmd));

    },
    CreateConference: function(HconnId) {
		/*
        var strcommand = "{ \"Command\":\"107\" ,";
        strcommand += "\"HconnID\": \"" + HconnId + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "107", "HconnID" : HconnId.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    DialAgent: function(AgentID) {
		/*
        var strcommand = "{ \"Command\":\"108\" ,";
        strcommand += "\"AgentID\": \"" + AgentID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "108", "AgentID" : AgentID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    DialOut: function(DNIS, ANI) {
		/*
        var strcommand = "{ \"Command\":\"109\" ,";
        strcommand += "\"ANI\": \"" + ANI + "\" ,";
        strcommand += "\"DNIS\": \"" + DNIS + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "109", "ANI" : ANI.toString(), "DNIS": DNIS.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    DialStation: function(StationNumber) {
		/*
        var strcommand = "{ \"Command\":\"110\" ,";
        strcommand += "\"StationNumber\": \"" + StationNumber + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "110", "StationNumber" : StationNumber.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    GetAgentStatus: function() {
		/*
        var strcommand = "{ \"Command\":\"111\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "111"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    GetAutoReadyStatus: function() {
		/*
        var strcommand = "{ \"Command\":\"112\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "112"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    GetAnswerTimeout: function() {
		/*
        var strcommand = "{ \"Command\":\"113\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "113"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    GetACDGroup: function() {
		/*
        var strcommand = "{ \"Command\":\"114\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "114"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    GetACDGroupNo: function() {
		/*
        var strcommand = "{ \"Command\":\"115\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "115"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    GetACDPark: function() {
		/*
        var strcommand = "{ \"Command\":\"116\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "116"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    GetACDParkNo: function() {
		/*
        var strcommand = "{ \"Command\":\"117\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "117"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    GetCallString: function(ConnID, Vartype) {
		/*
        var strcommand = "{ \"Command\":\"118\" ,";
        strcommand += "\"ConnID\": \"" + ConnID + "\" ,";
        strcommand += "\"Vartype\": \"" + Vartype + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "118", "ConnID" : ConnID, "Vartype": Vartype.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    GetACDGroupMember: function(GroupID) {
		/*
        var strcommand = "{ \"Command\":\"120\" ,";
        strcommand += "\"GroupID\": \"" + GroupID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "120", "GroupID" : GroupID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    GetACDGroupMemberNo: function(GroupID) {
		/*
        var strcommand = "{ \"Command\":\"121\" ,";
        strcommand += "\"GroupID\": \"" + GroupID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "121", "GroupID" : GroupID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    GetIVRS: function() {
		/*
        var strcommand = "{ \"Command\":\"122\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "122"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    GetIVRSNo: function() {
		/*
        var strcommand = "{ \"Command\":\"123\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "123"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    Hangup: function(connID) {
		/*
        var strcommand = "{ \"Command\":\"124\" ,";
        strcommand += "\"connID\": \"" + connID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "124", "connID": connID};
		SendCommandToServer(JSON.stringify(cmd));
    },

    Hold: function() {
		/*
        var strcommand = "{ \"Command\":\"125\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "125"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    Idle: function() {
		/*
        var strcommand = "{ \"Command\":\"126\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "126"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    Login: function(agentID, ppassword, Terminal) {
		/*
        var strcommand = " {\"Command\": \"127\",\"AgentID\": \"";
        strcommand += agentID + "\", \"Password\":\"";
        strcommand += ppassword + "\",\"Terminal\":\"";
        var terminal = Terminal.toString().replace(/\\/g, "\\\\");
        strcommand += terminal + "\"} ";
        SendCommandToServer(strcommand);
		*/
		// var cmd = {"Command" : "127", "AgentID" : agentID, "Password" : ppassword.toString(), "Terminal" : '172.17.2.93' };
		var cmd = {"Command" : "127", "AgentID" : agentID, "Password" : ppassword.toString(), "Terminal" : Terminal };
	
		SendCommandToServer(JSON.stringify(cmd));

    },

    Logout: function() {
		/*
        var strcommand = "{ \"Command\":\"128\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "128"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    MonitorAgent: function(DestagentID, TypeID) {
		/*
        var strcommand = "{ \"Command\":\"130\" ,";
        strcommand += "\"DestagentID\": \"" + DestagentID + "\" ,";
        strcommand += "\"TypeID\": \"" + TypeID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "130","DestagentID" : DestagentID.toString(), "TypeID" : TypeID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    PlayCall: function(CallID) {
		/*
        var strcommand = "{ \"Command\":\"131\" ,";
        strcommand += "\"CallID\": \"" + CallID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "131","CallID" : CallID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    PlayFile: function(Filename) {
		/*
        var strcommand = "{ \"Command\":\"132\" ,";
        var filename = Filename.toString().replace(/\\/g, "\\\\");
        strcommand += "\"Filename\": \"" + filename + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "132","Filename" : Filename};
		SendCommandToServer(JSON.stringify(cmd));
    },

    Ready: function() {
		/*
        var strcommand = "{ \"Command\":\"133\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "133"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    RejectCall: function() {
		/*
        var strcommand = "{ \"Command\":\"134\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "134"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    SendDTMFTone: function(DTMF) {
		/*
        var strcommand = "{ \"Command\":\"135\" ,";
        strcommand += "\"DTMF\": \"" + DTMF + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "135", "DTMF": DTMF.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    StartMonitor: function(TypeID) {
		/*
        var strcommand = "{ \"Command\":\"138\" ,";
        strcommand += "\"TypeID\": \"" + TypeID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "138", "TypeID": TypeID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    SetAnswerTimeout: function(Timeout) {
		/*
        var strcommand = "{ \"Command\":\"139\" ,";
        strcommand += "\"Timeout\": \"" + Timeout + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "139", "Timeout": Timeout.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    SetAutoReady: function(AutoReadyflag) {
		/*
        var strcommand = "{ \"Command\":\"140\" ,";
        strcommand += "\"AutoReadyflag\": \"" + AutoReadyflag + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "140", "AutoReadyflag": AutoReadyflag.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    StepTransferCall: function(DeviceType, DeviceID, Message) {
		/*
        var strcommand = "{ \"Command\":\"141\" ,";
        strcommand += "\"DeviceType\": \"" + DeviceType + "\" ,";
        strcommand += "\"DeviceID\": \"" + DeviceID + "\" ,";
        strcommand += "\"Message\": \"" + Message + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "141", "DeviceType": DeviceType.toString(), "DeviceID": DeviceID.toString(), "Message": Message.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    StepTransferCallReturn: function(DeviceType, DeviceID, Message) {
		/*
        var strcommand = "{ \"Command\":\"142\" ,";
        strcommand += "\"DeviceType\": \"" + DeviceType + "\" ,";
        strcommand += "\"DeviceID\": \"" + DeviceID + "\" ,";
        strcommand += "\"Message\": \"" + Message + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "142", "DeviceType" : DeviceType.toString(), "DeviceID": DeviceID.toString(), "Message": Message.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    StepTransferStation: function(StationNumber) {
		/*
        var strcommand = "{ \"Command\":\"143\" ,";
        strcommand += "\"StationNumber\": \"" + StationNumber + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "143", "StationNumber" : StationNumber.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    StepTransferStationReturn: function(StationNumber) {
		/*
        var strcommand = "{ \"Command\":\"144\" ,";
        strcommand += "\"StationNumber\": \"" + StationNumber + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "144", "StationNumber" : StationNumber.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    StopMonitor: function(TypeID) {
		/*
        var strcommand = "{ \"Command\":\"145\" ,";
        strcommand += "\"TypeID\": \"" + TypeID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "145", "TypeID" : TypeID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    StopMonitorAgent: function(DestagentID) {
		/*
        var strcommand = "{ \"Command\":\"146\" ,";
        strcommand += "\"DestagentID\": \"" + DestagentID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "146", "DestagentID": DestagentID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    StopPlay: function() {
		/*
        var strcommand = "{ \"Command\":\"147\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "147"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    TransferCall: function(ConnID, Message) {
		/*
        var strcommand = "{ \"Command\":\"148\" ,";
        strcommand += "\"ConnID\": \"" + ConnID + "\" ,";
        strcommand += "\"Message\": \"" + Message + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "148", "ConnID" : ConnID, "Message": Message};
		SendCommandToServer(JSON.stringify(cmd));
    },

    TransferCallReturn: function(ConnID, Message) {
		/*
        var strcommand = "{ \"Command\":\"149\" ,";
        strcommand += "\"ConnID\": \"" + ConnID + "\" ,";
        strcommand += "\"Message\": \"" + Message + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "149", "ConnID" : ConnID, "Message": Message};
		SendCommandToServer(JSON.stringify(cmd));
    },

    Unhold: function(ConnID) {
		/*
        var strcommand = "{ \"Command\":\"150\" ,";
        strcommand += "\"ConnID\": \"" + ConnID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "150", "ConnID" : ConnID};
		SendCommandToServer(JSON.stringify(cmd));
    },



    UpdatePassword: function(OldPwd, NewPwd) {
		/*
        var strcommand = "{ \"Command\":\"151\" ,";
        strcommand += "\"OldPwd\": \"" + OldPwd + "\" ,";
        strcommand += "\"NewPwd\": \"" + NewPwd + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "151", "OldPwd" : OldPwd.toString(), "NewPwd": NewPwd.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    Working: function(CallType) {
		/*
        var strcommand = "{ \"Command\":\"152\" ,";
        strcommand += "\"CallType\": \"" + CallType + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "152", "CallType" : CallType.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    AddMemberToConferenceEx: function(ConfconnID, ConftypeID) {
		/*
        var strcommand = "{ \"Command\":\"153\" ,";
        strcommand += "\"ConfconnID\": \"" + ConfconnID + "\" ,";
        strcommand += "\"ConftypeID\": \"" + ConftypeID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "153", "ConfconnID" : ConfconnID.toString(), "ConftypeID": ConftypeID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    CreateConferenceEx: function(HconnID, HtypeID, TypeID) {
		/*
        var strcommand = "{ \"Command\":\"154\" ,";
        strcommand += "\"HconnID\": \"" + HconnID + "\" ,";
        strcommand += "\"HtypeID\": \"" + HtypeID + "\" ,";
        strcommand += "\"TypeID\": \"" + TypeID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "154", "HconnID" : HconnID.toString(), "HtypeID": HtypeID.toString(), "TypeID": TypeID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    ListConferenceMember: function(ConfconnID) {
		/*
        var strcommand = "{ \"Command\":\"155\" ,";
        strcommand += "\"ConfconnID\": \"" + ConfconnID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "155", "ConfconnID" : ConfconnID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    ChangeConferenceMemberMode: function(ConfMemberconnID, Attribute) {
		/*
        var strcommand = "{ \"Command\":\"156\" ,";
        strcommand += "\"ConfMemberconnID\": \"" + ConfMemberconnID + "\" ,";
        strcommand += "\"Attribute\": \"" + Attribute + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "156", "ConfMemberconnID" : ConfMemberconnID.toString(), "Attribute": Attribute.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    DeleteAgent: function(DelagentID) {
		/*
        var strcommand = "{ \"Command\":\"157\" ,";
        strcommand += "\"DelagentID\": \"" + DelagentID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "157", "DelagentID" : DelagentID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    AcceptMediaCallEx: function(DeviceType, DeviceID, CallType) {
		/*
        var strcommand = "{ \"Command\":\"160\" ,";
        strcommand += "\"DeviceType\": \"" + DeviceType + "\" ,";
        strcommand += "\"DeviceID\": \"" + DeviceID + "\" ,";
        strcommand += "\"CallType\": \"" + CallType + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "160", "DeviceType" : DeviceType.toString(), "DeviceID" : DeviceID.toString(), "CallType" : CallType.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    SetCaseID: function(CallType, CallID, CaseID) {
		/*
        var strcommand = "{ \"Command\":\"161\" ,";
        strcommand += "\"CallType\": \"" + CallType + "\" ,";
        strcommand += "\"CallID\": \"" + CallID + "\" ,";
        strcommand += "\"CaseID\": \"" + CaseID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "161", "CallType" : CallType.toString(), "CallID" : CallID.toString(), "CaseID" : CaseID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    PlayVmail: function(CallID) {
		/*
        var strcommand = "{ \"Command\":\"165\" ,";
        strcommand += "\"CallID\": \"" + CallID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "165", "CallID" : CallID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    SetForceReply: function(ForceReplyflag) {
		/*
        var strcommand = "{ \"Command\":\"167\" ,";
        strcommand += "\"ForceReplyflag\": \"" + ForceReplyflag + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "167", "ForceReplyflag" : ForceReplyflag.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    DialDevice: function(DeviceType, DeviceID) {
		/*
        var strcommand = "{ \"Command\":\"170\" ,";
        strcommand += "\"DeviceType\": \"" + DeviceType + "\" ,";
        strcommand += "\"DeviceID\": \"" + DeviceID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "170", "DeviceType" : DeviceType.toString(), "DeviceID" : DeviceID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    RemoveRecourse: function() {
		/*
        var strcommand = "{ \"Command\":\"172\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "172"};
		SendCommandToServer(JSON.stringify(cmd));
	},
	
	BreakEx: function(BreakType) {
		var cmd = {"Command" : "173", "BreakType" : BreakType };
		SendCommandToServer(JSON.stringify(cmd));
    },

    SetCallMessage: function(ConnID, Message) {
		/*
        var strcommand = "{ \"Command\":\"176\" ,";
        strcommand += "\"ConnID\": \"" + ConnID + "\" ,";
        strcommand += "\"Message\": \"" + Message + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "176", "ConnID" : ConnID.toString(), "Message" : Message.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    PlayShareVoice: function(Offset, Filename) {
		/*
        var strcommand = "{ \"Command\":\"177\" ,";
        var filename = Filename.toString().replace(/\\/g, "\\\\");
        strcommand += "\"Offset\": \"" + Offset + "\" ,";
        strcommand += "\"Filename\": \"" + filename + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "177", "Offset" : Offset.toString(), "Filename" : Filename};
		SendCommandToServer(JSON.stringify(cmd));
    },

    StopShareVoice: function() {
		/*
        var strcommand = "{ \"Command\":\"178\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "178"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    PauseShareVoice: function() {
		/*
        var strcommand = "{ \"Command\":\"179\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "179"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    ResumeShareVoice: function(Offset) {
		/*
        var strcommand = "{ \"Command\":\"180\" ,";
        strcommand += "\"Offset\": \"" + Offset + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "180", "Offset" : Offset.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    ChangeSpeedShareVoice: function(Speed) {
		/*
        var strcommand = "{ \"Command\":\"182\" ,";
        strcommand += "\"Speed\": \"" + Speed + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "182", "Speed" : Speed.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    ChangeVolumeShareVoice: function(Volume) {
		/*
        var strcommand = "{ \"Command\":\"183\" ,";
        strcommand += "\"Volume\": \"" + Volume + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "183", "Volume" : Volume.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    StopPlayGreeting: function() {
		/*
        var strcommand = "{ \"Command\":\"184\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "184"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    PlayCallEx: function(Offset, CallID) {
		/*
        var strcommand = "{ \"Command\":\"185\" ,";
        strcommand += "\"Offset\": \"" + Offset + "\" ,";
        strcommand += "\"CallID\": \"" + CallID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "185", "Offset" : Offset.toString(), "CallID" : CallID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    PlayFileEx: function(Offset, Filename) {
		/*
        var strcommand = "{ \"Command\":\"186\" ,";
        strcommand += "\"Offset\": \"" + Offset + "\" ,";
        filename = Filename.toString().replace(/\\/g, "\\\\");
        strcommand += "\"Filename\": \"" + filename + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "186", "Offset" : Offset.toString(), "Filename" : Filename.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    PauseVoice: function() {
		/*
        var strcommand = "{ \"Command\":\"187\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "187"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    ResumeVoice: function(Offset) {
		/*
        var strcommand = "{ \"Command\":\"188\" ,";
        strcommand += "\"Offset\": \"" + Offset + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "188", "Offset" : Offset.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    ChangeSpeedVoice: function(Speed) {
		/*
        var strcommand = "{ \"Command\":\"189\" ,";
        strcommand += "\"Speed\": \"" + Speed + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "189", "Speed" : Speed.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    ChangeVolumeVoice: function(Volume) {
		/*
        var strcommand = "{ \"Command\":\"190\" ,";
        strcommand += "\"Volume\": \"" + Volume + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "190", "Volume" : Volume.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    UpdateMediaHandleDateTime: function(CallID) {
		/*
        var strcommand = "{ \"Command\":\"191\" ,";
        strcommand += "\"CallID\": \"" + CallID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "191", "CallID" : CallID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    RetrieveCallQueue: function(DeviceType, DeviceID, CallType) {
		/*
        var strcommand = "{ \"Command\":\"192\" ,";
        strcommand += "\"DeviceType\": \"" + DeviceType + "\" ,";
        strcommand += "\"DeviceID\": \"" + DeviceID + "\" ,";
        strcommand += "\"CallType\": \"" + CallType + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "192", "DeviceType" : DeviceType.toString(), "DeviceID" : DeviceID.toString(), "CallType" : CallType.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    AcceptCallEx: function(CallType, ConnID) {
		/*
        var strcommand = "{ \"Command\":\"193\" ,";
        strcommand += "\"CallType\": \"" + CallType + "\" ,";
        strcommand += "\"ConnID\": \"" + ConnID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "193", "CallType" : CallType, "ConnID" : ConnID};
		SendCommandToServer(JSON.stringify(cmd));
    },

    SetAgentData: function(Data) {
		/*
        var strcommand = "{ \"Command\":\"194\" ,";
        strcommand += "\"Data\": \"" + Data + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "194", "Data" : Data.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    GetAgentDataCount: function(Data) {
		/*
        var strcommand = "{ \"Command\":\"195\" ,";
        strcommand += "\"Data\": \"" + Data + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "195", "Data" : Data.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    SendFaxExP_UC: function(UniqueID, PhoneNumber, CoverMsg, FaxFile, SendTo, Subject, Company, Coverfile, CaseID, ANI, Sender, Priority) {
		/*
        var faxFile = FaxFile.toString().replace(/\\/g, "\\\\");
        var coverfile = Coverfile.toString().replace(/\\/g, "\\\\");
        var strcommand = "{ \"Command\":\"196\" ,";
        strcommand += "\"UniqueID\": \"" + UniqueID + "\" ,";
        strcommand += "\"PhoneNumber\": \"" + PhoneNumber + "\" ,";
        strcommand += "\"CoverMsg\": \"" + CoverMsg + "\" ,";
        strcommand += "\"FaxFile\": \"" + faxFile + "\" ,";
        strcommand += "\"SendTo\": \"" + SendTo + "\" ,";
        strcommand += "\"Subject\": \"" + Subject + "\" ,";
        strcommand += "\"Company\": \"" + Company + "\" ,";
        strcommand += "\"Coverfile\": \"" + coverfile + "\" ,";
        strcommand += "\"CaseID\": \"" + CaseID + "\" ,";
        strcommand += "\"ANI\": \"" + ANI + "\" ,";
        strcommand += "\"Sender\": \"" + Sender + "\" ,";
        strcommand += "\"Priority\": \"" + Priority + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "196", "UniqueID" : UniqueID.toString(), "PhoneNumber" : PhoneNumber.toString(), "CoverMsg" : CoverMsg, "FaxFile" : FaxFile, 
			"SendTo" : SendTo, "Subject": Subject, "Company": Company, "Coverfile": Coverfile, "CaseID": CaseID.toString(), "ANI": ANI.toString(), 
			"Sender": Sender.toString(), "Priority": Priority.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    SendEmail_UC: function(Recipient, CC, BCC, Sender, Subject, AttachedFile, CaseID, ANI, BodyType, ContentMsg) {
		/*
        var attachedFile = AttachedFile.toString().replace(/\\/g, "\\\\");
        var strcommand = "{ \"Command\":\"197\" ,";
        strcommand += "\"Recipient\": \"" + Recipient + "\" ,";
        strcommand += "\"CC\": \"" + CC + "\" ,";
        strcommand += "\"BCC\": \"" + BCC + "\" ,";
        strcommand += "\"Sender\": \"" + Sender + "\" ,";
        strcommand += "\"Subject\": \"" + Subject + "\" ,";
        strcommand += "\"AttachedFile\": \"" + attachedFile + "\" ,";
        strcommand += "\"CaseID\": \"" + CaseID + "\" ,";
        strcommand += "\"ANI\": \"" + ANI + "\" ,";
        strcommand += "\"BodyType\": \"" + BodyType + "\" ,";
        strcommand += "\"ContentMsg\": \"" + ContentMsg + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "197", "Recipient" : Recipient.toString(), "CC" : CC.toString(), "BCC" : BCC, "Sender" : Sender, 
			"Subject": Subject, "AttachedFile": AttachedFile, "CaseID": CaseID.toString(), "ANI": ANI.toString(), 
			"BodyType": BodyType.toString(), "ContentMsg": ContentMsg.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    AddRecourse_UC: function(RecourseInfo) {
		/*
        var strcommand = "{ \"Command\":\"198\" ,";
        strcommand += "\"RecourseInfo\": \"" + RecourseInfo + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "198", "RecourseInfo" : RecourseInfo.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    SendSMS_UC: function(DNIS, ANI, CaseID, ReplyID, Message) {
		/*
        var strcommand = "{ \"Command\":\"200\" ,";
        strcommand += "\"DNIS\": \"" + DNIS + "\" ,";
        strcommand += "\"ANI\": \"" + ANI + "\" ,";
        strcommand += "\"CaseID\": \"" + CaseID + "\" ,";
        strcommand += "\"ReplyID\": \"" + ReplyID + "\" ,";
        strcommand += "\"Message\": \"" + Message + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "200", "DNIS" : DNIS.toString(), "ANI" : ANI.toString(), "CaseID" : CaseID.toString(), "ReplyID" : ReplyID.toString(), "Message" : Message.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    SendMessage_UC: function(DeviceType, DeviceID, Message) {
		/*
        var strcommand = "{ \"Command\":\"201\" ,";
        strcommand += "\"DeviceType\": \"" + DeviceType + "\" ,";
        strcommand += "\"DeviceID\": \"" + DeviceID + "\" ,";
        strcommand += "\"Message\": \"" + Message + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "201", "DeviceType" : DeviceType.toString(), "DeviceID" : DeviceID.toString(), "Message" : Message.toString()};
		// var cmd = {"Command" : "201", "DeviceType" : DeviceType.toString(), "DeviceID" : DeviceID.toString(), "Message" : Message.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    SendBlogMsg: function(CommentonID, Sender, SendTo, PictureUrl, VideoUrl, VoiceUrl, ANI, ContentMsg) {
		/*
        var strcommand = "{ \"Command\":\"204\" ,";
        strcommand += "\"CommentonID\": \"" + CommentonID + "\" ,";
        strcommand += "\"Sender\": \"" + Sender + "\" ,";
        strcommand += "\"SendTo\": \"" + SendTo + "\" ,";
        strcommand += "\"PictureUrl\": \"" + PictureUrl + "\" ,";
        strcommand += "\"VideoUrl\": \"" + VideoUrl + "\" ,";
        strcommand += "\"VoiceUrl\": \"" + VoiceUrl + "\" ,";
        strcommand += "\"ANI\": \"" + ANI + "\" ,";
        strcommand += "\"ContentMsg\": \"" + ContentMsg + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "204", "CommentonID" : CommentonID.toString(), "Sender" : Sender.toString(), "SendTo" : SendTo.toString()
		, "PictureUrl" : PictureUrl.toString(), "VideoUrl" : VideoUrl.toString(), "VoiceUrl" : VoiceUrl.toString(), "ANI" : ANI.toString(), "ContentMsg" : ContentMsg.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    GetLogonAgent: function() {
		/*
        var strcommand = "{ \"Command\":\"205\" }";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "205"};
		SendCommandToServer(JSON.stringify(cmd));
    },

    GetGroupMemberEx: function(groupID) {
		/*
        var strcommand = "{ \"Command\":\"206\" ,";
        strcommand += "\"GroupID\": \"" + groupID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "206", "GroupID" : groupID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    InactiveStatusTime: function(StatusID, InactiveTime) {
		/*
        var strcommand = "{ \"Command\":\"208\" ,";
        strcommand += "\"StatusID\": \"" + StatusID + "\" ,";
        strcommand += "\"InactiveTime\": \"" + InactiveTime + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "208", "StatusID" : StatusID.toString(), "InactiveTime" : InactiveTime.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },

    SetEnableRecording: function(ConnID, ActionID) {
		/*
        var strcommand = "{ \"Command\":\"209\" ,";
        strcommand += "\"ConnID\": \"" + ConnID + "\" ,";
        strcommand += "\"ActionID\": \"" + ActionID + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "209", "ConnID" : ConnID.toString(), "ActionID" : ActionID.toString()};
		SendCommandToServer(JSON.stringify(cmd));
    },
	
	GetTicket: function(company_code, assign_to, status, enduser_id, offset, count) {
		/*
		var strcommand = "{ \"Command\":\"210\", ";
		strcommand += "\"company_code\": \"" + company_code + "\", ";
		strcommand += "\"assign_to\": \"" + assign_to + "\", ";		
		strcommand += "\"status\": \"" + status + "\", ";		 
		strcommand += "\"enduser_id\": \"" + enduser_id + "\", ";
		strcommand += "\"offset\": \"" + offset + "\", ";		 
		strcommand += "\"count\": \"" + count + "\"}";	
		SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "210", "company_code" : company_code.toString(), "assign_to" : assign_to.toString(), "status" : status.toString(), "enduser_id" : enduser_id.toString()
		, "offset" : offset.toString(), "count" : count.toString()};
		SendCommandToServer(JSON.stringify(cmd));
	},
	
    GetTicketMsg: function(ticket_id) {
		/*
        var strcommand = "{ \"Command\":\"211\" ,";
        strcommand += "\"ticket_id\": \"" + ticket_id + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "211", "ticket_id" : ticket_id.toString()};
		SendCommandToServer(JSON.stringify(cmd));
	},

    UpdateTicket: function(ticket_id, assign_to) {
		/*
        var strcommand = "{ \"Command\":\"212\" ,";
        strcommand += "\"ticket_id\": \"" + ticket_id + "\" ,";
        strcommand += "\"assign_to\": \"" + assign_to + "\"}";		
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "212", "ticket_id" : ticket_id.toString(), "assign_to" : assign_to.toString()};
		SendCommandToServer(JSON.stringify(cmd));
	},

	SendMsgToConnector: function(ticket_id, msg_id, complete_msg_id, msg_text) {
		/*
        var strcommand = "{ \"Command\":\"213\" ,";
        strcommand += "\"ticket_id\": \"" + ticket_id + "\" ,";
        strcommand += "\"msg_id\": \"" + msg_id + "\" ,";	
        strcommand += "\"complete_msg_id\": \"" + complete_msg_id + "\" ,";			
        strcommand += "\"message\": { \"msg_text\": \"" + msg_text + "\"}}" ;			
        SendCommandToServer(strcommand);
		*/
		//console.log(complete_msg_id);
		var cmd = {"Command" : "213", "ticket_id" : ticket_id.toString(), "msg_id" : msg_id, "complete_msg_id" : complete_msg_id
		, "message":{"msg_text" : msg_text.toString()}};
		SendCommandToServer(JSON.stringify(cmd));
	},

	AssignToChatRoom: function(ticket_id, assign_to, action) {
		/*
        var strcommand = "{ \"Command\":\"214\" ,";
        strcommand += "\"ticket_id\": \"" + ticket_id + "\" ,";
        strcommand += "\"assign_to\": \"" + assign_to + "\" ,";			
        strcommand += "\"action\": \"" + action + "\"}";		
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "214", "ticket_id" : ticket_id.toString(), "assign_to" : assign_to.toString(), "action" : action.toString()};
		SendCommandToServer(JSON.stringify(cmd));
	},
	
	GetEndUserInfo : function(agent_id, enduser_id) {
		/*
        var strcommand = "{ \"Command\":\"216\" ,";
        strcommand += "\"agent_id\": \"" + agent_id + "\" ,";		
        strcommand += "\"enduser_id\": \"" + enduser_id + "\"}";		
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "216", "agent_id" : agent_id.toString(), "enduser_id" : enduser_id.toString()};
		SendCommandToServer(JSON.stringify(cmd));
	},
	
	UpdateEndUserInfo : function(agent_id, enduser_id, name, company_code, gender, birthday, remark) {
		/*
        var strcommand = "{ \"Command\":\"217\" ,";
        strcommand += "\"agent_id\": \"" + agent_id + "\" ,";
        strcommand += "\"enduser_id\": \"" + enduser_id + "\" ,";
        strcommand += "\"name\": \"" + name + "\" ,";
        strcommand += "\"company_code\": \"" + company_code + "\" ,";
        strcommand += "\"gender\": \"" + gender + "\" ,";
        strcommand += "\"birthday\": \"" + birthday + "\" ,";		
        strcommand += "\"remark\": \"" + remark + "\"}";		
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "217", "agent_id" : agent_id.toString(), "enduser_id" : enduser_id.toString(), "name" : name.toString(), "company_code" : company_code.toString()
		, "gender" : gender.toString(), "birthday" : birthday.toString(), "remark" : remark.toString()};
		SendCommandToServer(JSON.stringify(cmd));
	},

    CompleteTicket : function(ticket_id) {
		/*
        var strcommand = "{ \"Command\":\"218\" ,";
        strcommand += "\"ticket_id\": \"" + ticket_id + "\"}";
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "218", "ticket_id" : ticket_id.toString()};
		SendCommandToServer(JSON.stringify(cmd));
	},
	
	SendFileToConnector: function(ticket_id, msg_id, complete_msg_id, filepath) {
		/*
		var strcommand = "{ \"Command\":\"219\" ,";
        strcommand += "\"ticket_id\": \"" + ticket_id + "\" ,";
        strcommand += "\"msg_id\": \"" + msg_id + "\" ,";	
        strcommand += "\"complete_msg_id\": \"" + complete_msg_id + "\" ,";			
        strcommand += "\"message\": { \"filepath\": \"" + filepath.replace(/\\/g, "\\\\") + "\"} }";
		SendCommandToServer(strcommand);
		*/
		var cmd ={ "Command":"219", "ticket_id": ticket_id.toString(), "msg_id" : msg_id, "complete_msg_id": complete_msg_id, "message" : {"filepath" : filepath} };
		SendCommandToServer(JSON.stringify(cmd));
	},

	InviteAgentToChat  : function(agent_id, ticket_id, msg_content) {
		/*
        var strcommand = "{ \"Command\":\"220\" ,";
        strcommand += "\"agent_id\": \"" + agent_id + "\" ,";	
        strcommand += "\"ticket_id\": \"" + ticket_id + "\" ,";		
        strcommand += "\"msg_content\": \"" + msg_content + "\"}";		
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "220", "ticket_id" : ticket_id, "agent_id" : agent_id, "msg_content" : msg_content.toString()};
		SendCommandToServer(JSON.stringify(cmd));
	},
	
	GetFaceBookPost   : function(agent_id, ticket_id) {
		/*
        var strcommand = "{ \"Command\":\"221\" ,";
        strcommand += "\"agent_id\": \"" + agent_id + "\" ,";		
        strcommand += "\"ticket_id\": \"" + ticket_id + "\"}";		
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "221", "ticket_id" : ticket_id, "agent_id" : agent_id};
		SendCommandToServer(JSON.stringify(cmd));
	},

	SendFaceBookComment    : function(ticket_id, msg_text) {
		/*
        var strcommand = "{ \"Command\":\"222\" ,";
        strcommand += "\"ticket_id\": \"" + ticket_id + "\" ,";		
        strcommand += "\"message\": { \"msg_text\": \"" + msg_text + "\"}}";		
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "222", "ticket_id" : ticket_id.toString(), "message": {"msg_text": msg_text}};
		SendCommandToServer(JSON.stringify(cmd));
	},

	GetAgentTicketList    : function(agent_id) {
		/*
        var strcommand = "{ \"Command\":\"223\" ,";	
        strcommand += "\"agent_id\": \"" + agent_id + "\"}";		
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "223", "agent_id" : agent_id.toString()};
		SendCommandToServer(JSON.stringify(cmd));
	},
	
	GetOnlineForm     : function(ticket_id) {
		/*
        var strcommand = "{ \"Command\":\"224\" ,";	
        strcommand += "\"ticket_id\": \"" + ticket_id + "\"}";		
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "224", "ticket_id" : ticket_id.toString()};
		SendCommandToServer(JSON.stringify(cmd));
	},

	GetOfflineForm     : function(ticket_id) {
		/*
        var strcommand = "{ \"Command\":\"225\" ,";	
        strcommand += "\"ticket_id\": \"" + ticket_id + "\"}";		
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "225", "ticket_id" : ticket_id.toString()};
		SendCommandToServer(JSON.stringify(cmd));
	},
	
	GetUpperLevelComment      : function(msg_id) {
		/*
        var strcommand = "{ \"Command\":\"228\" ,";	
        strcommand += "\"msg_id\": \"" + msg_id + "\"}";		
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "228", "msg_id" : msg_id.toString()};
		SendCommandToServer(JSON.stringify(cmd));
	},
	
	GetSameLevelComment    : function(msg_id, count, mode) {
		/*
        var strcommand = "{ \"Command\":\"229\" ,";
        strcommand += "\"msg_id\": \"" + msg_id + "\" ,";	
        strcommand += "\"count\": \"" + count + "\" ,";			
        strcommand += "\"mode\": \"" + mode + "\"}";		
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "229", "msg_id" : msg_id.toString(), "count" : count.toString(), "mode" : mode.toString()};
		SendCommandToServer(JSON.stringify(cmd));
	},
	
	GetSameLevelReply     : function(msg_id, count, mode) {
		/*
        var strcommand = "{ \"Command\":\"230\" ,";
        strcommand += "\"msg_id\": \"" + msg_id + "\" ,";	
        strcommand += "\"count\": \"" + count + "\" ,";			
        strcommand += "\"mode\": \"" + mode + "\"}";		
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "230", "msg_id" : msg_id.toString(), "count" : count.toString(), "mode" : mode.toString()};
		SendCommandToServer(JSON.stringify(cmd));
	},

	SetAgentStatus     : function(agent_id, StatusID, mode) {
		/*
        var strcommand = "{ \"Command\":\"231\" ,";
        strcommand += "\"agent_id\": \"" + agent_id + "\" ,";	
        strcommand += "\"StatusID\": \"" + StatusID + "\" ,";			
        strcommand += "\"mode\": \"" + mode + "\"}";		
        SendCommandToServer(strcommand);
		*/
		var cmd = {"Command" : "231", "agent_id" : agent_id.toString(), "StatusID" : StatusID.toString(), "mode" : mode.toString()};
		SendCommandToServer(JSON.stringify(cmd));
	},

	SendCSInputtingState : function(agent_id, ticket_id ) {
		var cmd = {"Command" : "232", "agent_id" : String(agent_id), "ticket_id" : String(ticket_id)}
		SendCommandToServer(JSON.stringify(cmd));
	},

	SendTemplateMsg     : function(company_code, To, TP_id, props, BlogType) {
		var cmd = {"Command" : "233", "company_code" : company_code, "To" : String(To), "TP_id" : TP_id, "props" : props, "BlogType" : BlogType};
		SendCommandToServer(JSON.stringify(cmd));
	},
	GetLogonAgentEx      : function() {
		var cmd = {"Command" : "237"};
		SendCommandToServer(JSON.stringify(cmd));
	},
	LoginEx : function(agentID, password, terminal, subTerminal, phone, agentTerminal) {
		var cmd = {"Command" : "238", "agentID" : agentID.toString(), "Password" : password, "Terminal" : terminal, "Sub_Terminal" : subTerminal, "Phone" : phone, "AgentTerminal" : agentTerminal};
		SendCommandToServer(JSON.stringify(cmd));
	}
	
}

	

//=====================================================================================================
//		JSON Command to be sent to server --- End
//=====================================================================================================		

			// Create custom event in Javascript library
		function addEventListener(el, eventName, handler) 
		{
		  if (el.addEventListener) 
		  {
			el.addEventListener(eventName, handler);
		  } 
		}

		function triggerEvent(el, eventName, options) 
		{
		  //var event;var isIE = /*@cc_on!@*/false || !!document.documentMode;
		  var event;var isIE = !!document.documentMode;		// 20250320		Unexpected constant truthiness on the left-hand side of a `||` expression.
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

		


		function SendCommandToServer(StrCommand, tryCount){
			//console.log(StrCommand);
			//if (typeof ws === null){ // phone.html not connected to agent server yet, ws is null		//20250320  Unexpected constant binary expression. Compares constantly with the right-hand side of the `===`.
			if (ws === null)		
			{
				if (typeof tryCount=='undefined'){tryCount=0;}
				if (tryCount<4){ // retry 3 times
					tryCount+=1;
					setTimeout(function(){SendCommandToServer(p.StrCommand,p.tryCount)}.bind(this,{StrCommand:StrCommand,tryCount:tryCount}),1000)
				}
			}
			else if ( ws.readyState ==1){
				ws.send(StrCommand);	
			}
			else if ( ws.readyState ==0){
			}
			else if ( ws.readyState ==2){
			}
			else if ( ws.readyState ==3){
			}
		}
		function retryLogin(){
			var userName=localStorage.getItem("userName");
			var pass = sessionStorage.getItem("pass");
			var machineName = localStorage.getItem("machineName");
			wsWiseAgent.Login(userName,pass, "");
			
		}
		function CommandHexToDescription(strNum){
			switch(strNum){		
			case "80040500":
				errMsg="Server already login the system";
				break;
			case "80040501":
				errMsg="Incorrect server";
				break;
			case "80040502":	  
				errMsg ="Not yet register server";
				break;
			case "80040503":	  
				errMsg="Invalid device ID ";
				break;
			case "80040504": 
				errMsg="Invalid device status ";		  
				break;
			case "80040505":
				errMsg="No relation device";		  
				break;
			case "80040506":
				errMsg="No corresponding service";		  
				break;
			case "80040507":
				errMsg="Invalid connection";		  
				break;
			case "80040508":
				errMsg="Invalid connection status";		  
				break;
			case "80040509":
				errMsg="Invalid terminal name";		  
				break;
			case "8004050a":
				errMsg="Incorrect password of the agent";
				break;
			case "8004050b":	  
				errMsg="Agent already login in other terminal";
				break;
			case "8004050c"	:
				errMsg="Agent already login the system in other Agent Server";	
				break;
			case  "8004050d"  :
				errMsg="Invalid command parameter";
				break;
			case "8004080b" :
				errMsg="Agent already login the system";
				parent.logoutClicked();
				break;
			case "8004080c" :
				errMsg="Incorrect agent ID";
				break;
			case "8004080d"	:
				errMsg="Incorrect agent status";		  
				break;
			case "80040800":
				errMsg="Agent have not logged on";		 
				break;
			case "80040806":
				errMsg="Double login"; // in same PC logged with another account id
				break;
			case "80040517":
				errMsg="Exceed Agent License";
				break;
			default :
				//console.log(strNum);
				errMsg =strNum;
			}
			return errMsg	
		}
		function CommandIntToDescription(cNum){
			var str ;
			switch(cNum){
				case 0:
					str = "Fail";
					break;
				case 1:
					str = "SUCCESS";
					break;
				case 4:
					str = "AgentStatusEvent";
					break;
				case 5:
					str = "CallMessage";
					break;
				case 6:
					str = "CallResultEvent";
					break;
				case 7:
					str = "CallStatusEvent";
					break;
				case 8:
					str = "ConnectStatus";
					break;
				case 11:
					str = "AnsCallInfo";
					break;
				case 12:
					str = "MediaCallStatus";
					break;
				case 14:
					str = "ServiceQueue";
					break;
				case 15:
					str = "ConfMemberStatus";
					break;
				case 16:
					str = "ACDGroupInfo";
					break;
				case 17:
					str = "ACDParkInfo";
					break;
				case 18:
					str = "ACDGroupMember";
					break;
				case 19:
					str = "IVRSInfo";
					break;
				case 20:
					str = "ACDGroupQueueEx";
					break;
				case 21:
					str = "ACDParkQueueEx";		
					break;		
				case 23:
					str = "SkillQueue";
					break;
				case 27:
					str = "AddAgentCallQueue";
					break;
				case 28:
					str = "RemoveAgentCallQueue";
					break;
				case 29:
					str = "ShareVoiceStatus";
					break;
				case 33:
					str = "CallQueueDatat_UC";
					break;
				case 34:
					str = "ClearRecourse_UC";
					break;
				case 35:
					str = "RecvShortMsg_UC";
					break;
				case 36:
					str = "CallMessage_UC";
					break;
				case 37:
					str = "LogonAgent";
					break;
				case 38:
					str = "TicketList";
					break;
				case 39:
					str = "TicketMsgList";
					break;
				case 40:
					str = "SendSocialMsgToAgent";
					break;
				case 41:
					str = "SendWebChatMsgToAgent";
					break;
				case 42:
					str = "EndUserInfo";
					break;
				case 43:
					str = "ResultSendMsg";
					break;
				case 44:
					str = "ResultSendFile";
					break;
				case 45:
					str = "ClientMsgID";
					break;
				case 46:
					str = "RecvInvAgentToChat";
					break;
				case 47:
					str = "FaceBookPost";
					break;
				case 48:
					str = "TicketTimeout";
					break;
				case 49:
					str = "AgentTicketStatus";
					break;
				case 50:
					str = "AgentTicketList";
					break;
				case 51:
					str = "OnlineForm";
					break;
				case 52:
					str = "OfflineForm";
					break;
				case 53:
					str = "UpperLevelComment";
					break;
				case 54:
					str = "SameLevelComment";
					break;
				case 55:
					str = "SameLevelReply";
					break;
				case 56:
					str = "EndTicket";
					break;
				case 100:
					str = "AcceptCall";
					break;
				case 101:
					str = "AcceptMediaCall";
					break;
				case 105:
					str = "BindToACDGroup";
					break;
				case 106:
					str = "Break";
					break;
				case 107:
					str = "CreateConference";
					break;
				case 108:
					str = "DialAgent";
					break;
				case 109:
					str = "Dialout";
					break;
				case 110:
					str = "DialStation";
					break;
				case 113:
					str = "GetAnswerTimeout";
					break;
				case 111:
					str = "GetAgentStatus";
					break;
				case 112:
					str = "GetAutoReadyStatus";
					break;
				case 114:
					str = "GetACDGroup";
					break;
				case 115:
					str = "GetACDGroupNo";
					break;
				case 116:
					str = "GetACDPark";
					break;
				case 117:
					str = "GetACDParkNo";
					break;
				case 118:
					str = "GetCallString";
					break;
				case 120:
					str = "GetGroupMember";
					break;
				case 121:
					str = "GetACDGroupMemberNo";
					break;
				case 122:
					str = "GetIVRS";
					break;
				case 123:
					str = "GetIVRSNo";
					break;
				case 124:
					str = "Hangup";
					break;
				case 125:
					str = "Hold";
					break;
				case 126:
					str = "IDLE";
					break;
				case 127:
					str = "LOGIN";
					break;
				case 128:
					str = "LOGOUT";
					break;
				case 130:
					str = "MonitorAgent";
					break;
				case 131:
					str = "PlayCall";
					break;
				case 132:
					str = "PlayFile";
					break;
				case 133:
					str = "Ready";
					break;
				case 134:
					str = "RejectCall";
					break;
				case 135:
					str = "SendDTMFTone";
					break;
				case 138:
					str = "StartMonitor";
					break;
				case 139:
					str = "SetAnswerTimeout";
					break;
				case 140:
					str = "SetAutoReady";
					break;
				case 141:
					str = "StepTransferCall";
					break;
				case 142:
					str = "StepTransferCallstr =";
					break;
				case 143:
					str = "StepTransferStation";
					break;
				case 144:
					str = "StepTransferStationstr =";
					break;
				case 145:
					str = "StopMonitor";
					break;
				case 146:
					str = "StopMonitorAgent";
					break;
				case 147:
					str = "StopPlay";
					break;
				case 148:
					str = "TransferCall";
					break;
				case 149:
					str = "TransferCallstr =";
					break;
				case 150:
					str = "Unhold";
					break;
				case 151:
					str = "UpdatePassword";
					break;
				case 152:
					str = "Working";
					break;
				case 153:
					str = "AddMemberToConferenceEx";
					break;
				case 154:
					str = "CreateConferenceEx";
					break;
				case 155:
					str = "ListConferenceMember";
					break;
				case 156:
					str = "ChangeConferenceMemberMode";
					break;
				case 157:
					str = "DeleteAgent";
					break;
				case 160:
					str = "AcceptMediaCallEx";
					break;
				case 161:
					str = "SetCaseID";
					break;
				case 165:
					str = "PlayVmail";
					break;
				case 167:
					str = "SetForceReply";
					break;
				case 170:
					str = "DialDevice";
					break;
				case 172:
					str = "RemoveRecourse";
					break;
				case 176:
					str = "SetCallMessage";
					break;
				case 177:
					str = "PlayShareVoice";
					break;
				case 178:
					str = "StopShareVoice";
					break;
				case 179:
					str = "PauseShareVoice";
					break;
				case 180:
					str = "ResumeShareVoice";
					break;
				case 182:
					str = "ChangeSpeedShareVoice";
					break;
				case 183:
					str = "ChangeVolumeShareVoice";
					break;
				case 184:
					str = "StopPlayGreeting";
					break;
				case 185:
					str = "PlayCallEx";
					break;
				case 186:
					str = "PlayFileEx";
					break;
				case 187:
					str = "PauseVoice";
					break;
				case 188:
					str = "ResumeVoice";
					break;
				case 189:
					str = "ChangeSpeedVoice";
					break;
				case 190:
					str = "ChangeVolumeVoice";
					break;
				case 191:
					str = "UpdateMediaHandleDateTime";
					break;
				case 192:
					str = "RetrieveCallQueue";
					break;
				case 193:
					str = "AcceptCallEx";
					break;
				case 194:
					str = "SetAgentData";
					break;
				case 195:
					str = "GetAgentDataCount";
					break;
				case 196:
					str = "SendFaxExP_UC";
					break;
				case 197:
					str = "SendEmail_UC";
					break;
				case 198:
					str = "AddRecourse_UC";
					break;
				case 200:
					str = "SendSMS_UC";
					break;
				case 201:
					str = "SendMessage_UC";
					break;
				case 204:
					str = "SendBlogMsg";
					break;
				case 205:
					str = "GetLogonAgent";
					break;
				case 206:
					str = "GetGroupMemberEx";
					break;
				case 208:
					str = "InactiveStatusTime";
					break;
				case 209:
					str = "SetEnableRecording";
					break;
				case 210:
					str = "GetTicket";
					break;
				case 211:
					str = "GetTicketMsg";
					break;
				case 212:
					str = "UpdateTicket";
					break;
				case 213:
					str = "SendMsgToConnector";
					break;
				case 214:
					str = "AssignToChatRoom";
					break;
				case 215:
					str = "SupportCompany";
					break;
				case 216:
					str = "GetEndUserInfo";
					break;
				case 217:
					str = "UpdateEndUserInfo";
					break;
				case 218:
					str = "CompleteTicket";
					break;
				case 219:
					str = "SendFileToConnector";
					break;
				case 220:
					str = "InviteAgentToChat";
					break;
				case 221:
					str = "GetFaceBookPost";
					break;
				case 222:
					str = "SendFaceBookComment";
					break;
				case 223:
					str = "GetAgentTicketList";
					break;
				case 224:
					str = "GetOnlineForm";
					break;
				case 225:
					str = "GetOfflineForm";
					break;
				case 228:
					str = "GetUpperLevelComment";
					break;
				case 229:
					str = "GetSameLevelComment";
					break;
				case 230:
					str = "GetSameLevelReply";
					break;
				case 231:
					str = "SetAgentStatus";
					break;
				case 233:
					str = "SendTemplateMsg";
					break;
				case 237:
					str= "GetLogonAgentEx";
					break;
				case 238:
					str= "LoginEx";
					break;
			}
			str += " OK"
			return str
		}
	 
    
		
	