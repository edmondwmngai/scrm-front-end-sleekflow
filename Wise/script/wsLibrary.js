//version 1.1 on 2018-04-18
//let ws = null;
//let wsCreatedTime=new Date();

let wsWiseAgent = {
	ws: null,
	wsCreatedTime: new Date(),
	commandResult: {},
	functionList: {
		'0': (obj)=>{
			obj.Description = CommandHexToDescription(obj.Message);
			wsWiseAgent.commandResult[obj.ResultCommand] = "fail";
            triggerEvent(document, 'CommandFail', obj);
		},
		'1':(obj)=>{
			obj.ResultCommand = parseInt(obj.ResultCommand);
			obj.Description = CommandHexToDescription(obj.Message);
			wsWiseAgent.commandResult[obj.ResultCommand] = "success";
            triggerEvent(document, 'CommandSuccess', obj);
		},
		'2': (obj)=>{
			obj.ObjectType = parseInt(obj.ObjectType);
			triggerEvent(document, 'ObjectStatus', obj);
		},
		'4': (obj)=>{
			obj.StatusID = parseInt(obj.StatusID);
            triggerEvent(document, 'AgentStatusEvent', obj);
		},
		'5': (obj)=>{
			for (let member of obj.Member) {//Object got: {obj.Member[i].VarType, obj.Member[i].VarMsg}
				member.VarType = parseInt(member.VarType);
            }
            triggerEvent(document, 'CallMessage', obj);
		},
		'6': (obj)=>{
			obj.Type = parseInt(obj.Type);
            obj.Result = parseInt(obj.Result);
            triggerEvent(document, 'CallResultEvent', obj);
		},
		'7': (obj)=>{
			obj.ConnID = parseInt(obj.ConnID);
            obj.StatusID = parseInt(obj.statusID);
            triggerEvent(document, 'CallStatusEvent', obj);
		},
		'8': (obj)=>{
			obj.StatusID = parseInt(obj.StatusID);
            triggerEvent(document, 'ConnectStatus', obj);
		},
		'11': (obj)=>{
			obj.CallType = parseInt(obj.CallType);
            obj.DeviceType = parseInt(obj.DeviceType);
            obj.DeviceID = parseInt(obj.DeviceID);
            obj.ReplyFlag = parseInt(obj.ReplyFlag);
            triggerEvent(document, 'AnsCallInfo', obj); //Object got: {obj.CallType, obj.DeviceType, obj.DeviceID, obj.ReplyFlag}
		},
		'12': (obj)=>{
			obj.ConnID = parseInt(obj.ConnID);
            obj.CallType = parseInt(obj.CallType);
            obj.StatusID = parseInt(obj.StatusID);
            triggerEvent(document, 'MediaCallStatus', obj); //Object got: {obj.ConnID, obj.CallType, obj.StatusID}
		},
		'14': (obj)=>{
			obj.serviceID = parseInt(obj.serviceID);
            obj.WaitCount = parseInt(obj.WaitCount);
            obj.MaxWaitTime = parseInt(obj.MaxWaitTime);
            triggerEvent(document, 'ServiceQueue', obj); //Object got: {obj.serviceID, obj.WaitCount, obj.MaxWaitTime}
		},
		'15': (obj)=>{
			obj.DeviceType = parseInt(obj.DeviceType);
            obj.DeviceID = parseInt(obj.DeviceID);
            obj.CallID = parseInt(obj.CallID);
            obj.ConID = parseInt(obj.ConID);
            obj.Attribute = parseInt(obj.Attribute);
            obj.StatusID = parseInt(obj.StatusID);
            triggerEvent(document, 'ConfMemberStatus', obj); //Object got: {obj.DeviceType, obj.DeviceID, obj.DeviceName, obj.CallID, obj.ConID, obj.Attribute, obj.StatusID}
                        
		},
		'16': (obj)=>{
			obj.Member.map(member => {
				member.GroupID = parseInt(member.GroupID);
				member.Gpmember = parseInt(member.Gpmember);
			});
            triggerEvent(document, 'ACDGroupInfo', obj); //Object got: {obj.Member[i].GroupID, obj.Member[i].GroupName, obj.Member[i].Gpmember
		},
		'17': (obj)=>{
			obj.Member.map(member => {
				member.ParkID = parseInt(member.ParkID);
				member.Pkmemberno = parseInt(member.Pkmemberno);
			});
			triggerEvent(document, 'ACDParkInfo', obj); //Object got: {obj.Member[i].ParkID, obj.Member[i].ParkName, obj.Member[i].Pkmemberno}
		},
		'18': (obj)=>{
			// obj.Member if have no members, would be null
			if (obj.Member == null) {obj.Member = [];}
			obj.Member.map(member => {
				member.GroupID = parseInt(member.GroupID);
				member.AgentID = parseInt(member.AgentID);
				member.StatusID = parseInt(member.StatusID);
			});
            triggerEvent(document, 'ACDGroupMember', obj); //Object got: {obj.Member[i].GroupID, obj.Member[i].AgentID, obj.Member[i].StatusID, obj.Member[i].AgentName}					
		},
		'19': (obj)=>{
			obj.FlowID = parseInt(obj.FlowID);
            triggerEvent(document, 'IVRSInfo', obj); //Object got: {obj.FlowID, obj.FlowDesce}
		},
		'20': (obj)=>{
			obj.Member.map(member => {
				member.GroupID = parseInt(member.GroupID);
				member.WaitCount = parseInt(member.WaitCount);
				member.MaxWaitTime = parseInt(member.MaxWaitTime);
				member.CallType = parseInt(member.CallType);
			});
            triggerEvent(document, 'ACDGroupQueueEx', obj); //Object got: {obj.Member[i].GroupID,obj.Member[i].WaitCount,obj.Member[i].MaxWaitTime,obj.Member[i].CallType}
		},
		'21': (obj)=>{
			obj.Member.map(member => {
				member.ParkID = parseInt(member.ParkID);
				member.WaitCount = parseInt(member.WaitCount);
				member.MaxWaitTime = parseInt(member.MaxWaitTime);
				member.CallType = parseInt(member.CallType);
			});
            triggerEvent(document, 'ACDParkQueueEx', obj); //Object got: {obj.ParkID, obj.WaitCount, 
		},
		'23': (obj)=>{
			obj.WaitCount = parseInt(obj.WaitCount);
			obj.MaxWaitTime = parseInt(obj.MaxWaitTime);
			obj.CallType = parseInt(obj.CallType);
			triggerEvent(document, 'SkillQueue', obj); //Object got: {obj.WaitCount, obj.MaxWaitTime, obj.CallType}
		},
		'27': (obj)=>{
			obj.ConnID = parseInt(obj.ConnID);
            obj.OdeviceType = parseInt(obj.OdeviceType);
            obj.OdeviceID = parseInt(obj.OdeviceID);
            obj.ANI = parseInt(obj.ANI);
            obj.DNIS = parseInt(obj.DNIS);
            triggerEvent(document, 'AddAgentCallQueue', obj); //Object got: {obj.ConnID, obj.OdeviceType, obj.OdeviceID, obj.ANI, obj.DNIS}
		},
		'28': (obj)=>{
			obj.ConnID = parseInt(obj.ConnID);
            triggerEvent(document, 'RemoveAgentCallQueue', obj);
		},
		'29': (obj)=>{
			obj.ShareVoiceStatus = parseInt(obj.ShareVoiceStatus);
            obj.ErrorCode = parseInt(obj.ErrorCode);
            triggerEvent(document, 'ShareVoiceStatus', obj); //Object got: {obj.ShareVoiceStatus obj.ErrorCode}
		},
		'30': (obj)=>{
			triggerEvent(document, 'StartScreenCap', obj);
		},
		'31': (obj)=>{
			triggerEvent(document, 'StopScreenCap', obj);
		},
		'33': (obj)=>{
			obj.DeviceType = parseInt(obj.DeviceType);
			obj.DeviceID = parseInt(obj.DeviceID);
			obj.CallType = parseInt(obj.CallType);
			obj.IsFullList = parseInt(obj.IsFullList);
			obj.CallDataCount = parseInt(obj.CallDataCount);
			triggerEvent(document, 'CallQueueData_UC', obj); //Object got: {obj.DeviceType, obj.DeviceID, obj.CallType, obj.IsFullList, obj.CallDataCount, obj.CallListData}
		},
		'34': (obj)=>{
			obj.SupervisorID = parseInt(obj.SupervisorID);
            triggerEvent(document, 'ClearRecourse_UC', obj); //Object got: {obj.SupervisorID, obj.RecourseInfo}
		},
		'35': (obj)=>{
			obj.DeviceID = parseInt(obj.DeviceID);
            triggerEvent(document, 'RecvShortMsg_UC', obj); //Object got: {obj.DeviceID, obj.ShortMsg}
		},
		'36': (obj)=>{
			obj.Member.map(member => {
				member.VarType = parseInt(member.VarType);
			});
            triggerEvent(document, 'CallMessage_UC', obj); //Object got: {obj.Member[i].VarType, obj.Member[i].VarMsg}
        },
		'37': (obj)=>{
			obj.AgentID = parseInt(obj.AgentID);
            obj.StatusID = parseInt(obj.StatusID);
            triggerEvent(document, 'LogonAgent', obj); //Object got: {obj.Command, obj.AgentID, obj.StatusID, obj.AgentName}
                        
		},
		'38': (obj)=>{
			obj.agent_id = parseInt(obj.agent_id);
			triggerEvent(document, 'TicketList', obj); // Object got: {obj.agent_id}
		},
		'39': (obj)=>{
			obj.agent_id = parseInt(obj.agent_id);
			obj.ticket_id = parseInt(obj.ticket_id);
			obj.offline_form = parseInt(obj.offline_form);
			obj.online_form = parseInt(obj.online_form);
			obj.status_id = parseInt(obj.status_id);
			triggerEvent(document, 'TicketMsgList', obj); // Object got: {obj.ticket_id}
		},
		'40': (obj)=>{
			obj.ticket_id = parseInt(obj.ticket_id);
			obj.assign_to = parseInt(obj.assign_to);
			obj.offline_form = parseInt(obj.offline_form);
			obj.online_form = parseInt(obj.online_form);
			obj.unread_num = parseInt(obj.unread_num);
			triggerEvent(document, 'SendSocialMsgToAgent', obj); // Object got: {obj.ticket_id, obj.assign_to, obj.profile_pic, obj.nick_name, obj.msg_list.id, obj.msg_list. }
		},
		'42': (obj)=>{
			obj.agent_id = parseInt(obj.agent_id);
			triggerEvent(document, 'EndUserInfo', obj); // Object got: {obj.agent_id, obj.enduser_id}						
		},
		'43': (obj)=>{
			triggerEvent(document, "ResultSendMsg", obj);  // Object got: {obj.data.id, obj.data.client_msg_id, obj.data.sent_time}
		},
		'44': (obj)=>{
			triggerEvent(document, "ResultSendFile", obj); // Object got: {obj.data.id, obj.data.client_msg_id, obj.data.sent_time, obj.data.originName, obj.data.suffix, obj.data.url}
		},
		'45': (obj)=>{
			obj.CmdType = parseInt(obj.CmdType);
			obj.client_msg_id = parseInt(obj.client_msg_id); 
			triggerEvent(document, "ClientMsgID", obj); // Object got: {obj.CmdType, obj.client_msg_id}
		},
		'46': (obj)=>{
			obj.agent_id = parseInt(obj.agent_id);
			obj.ticket_id = parseInt(obj.ticket_id);
			triggerEvent(document, "RecvInvAgentToChat", obj); 	// Object got: {obj.agent_id, obj.ticket_id, obj.msg_content}
		},
		'47': (obj)=>{
			obj.ticket_id = parseInt(obj.ticket_id);
			triggerEvent(document, "FaceBookPost", obj); 	//Object got: {obj.from_name, obj.message, obj.sent_time, obj.sub_list[i].from_name}
		},
		'48': (obj)=>{
			obj.ticket_id = parseInt(obj.ticket_id);
			triggerEvent(document, "TicketTimeout", obj);  // Object got: {obj.ticket_id}
		},
		'49': (obj)=>{
			obj.agent_id = parseInt(obj.agent_id);
			obj.ticket_id = parseInt(obj.ticket_id);
			obj.status_id = parseInt(obj.status_id);
			triggerEvent(document, "AgentTicketStatus", obj); 	// Object got: {obj.agent_id, obj.ticket_id, obj.status_id}
		},
		'50': (obj)=>{
			obj.agent_id = parseInt(obj.agent_id);
			triggerEvent(document, "AgentTicketList", obj); // Object got: {obj.ticket_list[i].ticket_id}
		},
		'51': (obj)=>{
			obj.agent_id = parseInt(obj.agent_id);
			triggerEvent(document, "OnlineForm", obj); // Object got: {obj.data[i].fieldname, obj.data[i].fieldvalue}
		},
		'52': (obj)=>{
			obj.agent_id = parseInt(obj.agent_id);
			triggerEvent(document, "OfflineForm", obj); // Object got: {obj.data[i].fieldname, obj.data[i].fieldvalue}
		},
		'53': (obj)=>{
			obj.agent_id = parseInt(obj.agent_id);
			triggerEvent(document, "UpperLevelComment", obj); // Object got: {obj.msg_list[i].id, obj.msg_list[i].sender, obj.msg_list[i].sent_time, obj.msg_list[i].index_no, obj.msg_list[i].msg_type, obj.msg_list[i].msg_content, obj.msg_list[i].sent_by, obj.msg_list[i].msg_object_path, obj.msg_list[i].msg_completed}
						
		},
		'54': (obj)=>{
			obj.agent_id = parseInt(obj.agent_id);
			triggerEvent(document, "SameLevelComment", obj); // Object got: {obj.msg_list[i].id, obj.msg_list[i].sender, obj.msg_list[i].sent_time, obj.msg_list[i].index_no, obj.msg_list[i].msg_type, obj.msg_list[i].msg_content, obj.msg_list[i].sent_by, obj.msg_list[i].msg_object_path, obj.msg_list[i].msg_completed}
		},
		'55': (obj)=>{
			obj.agent_id = parseInt(obj.agent_id);
			triggerEvent(document, "SameLevelReply", obj); // Object got: {obj.msg_list[i].id, obj.msg_list[i].sender, obj.msg_list[i].sent_time, obj.msg_list[i].index_no, obj.msg_list[i].msg_type, obj.msg_list[i].msg_content, obj.msg_list[i].sent_by, obj.msg_list[i].msg_object_path, obj.msg_list[i].msg_completed}
		},
		'56': (obj)=>{
			obj.ticket_id = parseInt(obj.ticket_id);
			triggerEvent(document, "EndTicket", obj);
		},
		'57': (obj)=>{
			triggerEvent(document, "WCCustomerParameter", obj);
		},
		'58': (obj)=>{
			triggerEvent(document, "WCCustomerReadMsg", obj);
		},
		'59': (obj)=>{
			triggerEvent(document, "SendTemplateMsg", obj);
		},
		'60': (obj)=>{
			obj.ticket_id = parseInt(obj.ticket_id);
			triggerEvent(document, "WCCustomerInput", obj);
		},
		'61': (obj)=>{
			obj.ticket_id = parseInt(obj.ticket_id);
			triggerEvent(document, "AddToChatRoom", obj);
		},
		'62': (obj)=>{
			obj.ticket_id = parseInt(obj.ticket_id);
			triggerEvent(document, "RmFromChatRoom", obj);
		},
		'63': (obj)=>{
			triggerEvent(document, "LogonAgentEx ", obj);
		},
	},	
	OpenWebsocket: function(serverName, callback) {
        if ("WebSocket" in window) {
            //alert("WebSocket is supported by your Browser!");
			//serverAddr = serverName;
            // Let us open a web socket
			serverName = (typeof serverName=="undefined")? this.ws.url : serverName;
            this.ws = new WebSocket(serverName);
            this.ws.onopen = function() {
                // Web Socket is connected, send data using send()
				triggerEvent(document, 'wsOnopen');
                //Tiger callback && callback();
				if(callback) callback();
				
            };

            this.ws.onmessage = function(evt) {
				let obj = JSON.parse(evt.data);
                // alert ("received_msg: " + received_msg);
                //received_msg is still correct here
				//let description = CommandHexToDescription(obj.Message);
				wsWiseAgent.functionList[obj.Command](obj);
				/* Tiger 2025-04-14
                switch (obj.Command) {
                    case '0': // Fail
                        obj.Description = description;
                        triggerEvent(document, 'CommandFail', obj);
                        break;
                    case '1': // SUCCESS
                        obj.ResultCommand = parseInt(obj.ResultCommand);
                        
                        obj.Description = description;
                        triggerEvent(document, 'CommandSuccess', obj);
						
                        break;
					case '2':
						obj.ObjectType = parseInt(obj.ObjectType);
						triggerEvent(document, 'ObjectStatus', obj);
						break;
                    case '4': //Agent Status Event . Here we define the event name "AgentStatus", in order to hold the status
                        obj.StatusID = parseInt(obj.StatusID);
                        triggerEvent(document, 'AgentStatusEvent', obj);
                         break;
                    case '5': // CallMessage
                        for (let member of obj.Member) {//Object got: {obj.Member[i].VarType, obj.Member[i].VarMsg}
							member.VarType = parseInt(member.VarType);
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
                        triggerEvent(document, 'ConnectStatus', obj); 
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
						obj.Member.map(member => {
							member.GroupID = parseInt(member.GroupID);
							member.Gpmember = parseInt(member.Gpmember);
						});
                        triggerEvent(document, 'ACDGroupInfo', obj); //Object got: {obj.Member[i].GroupID, obj.Member[i].GroupName, obj.Member[i].Gpmember
                        break;
                    case '17':
						obj.Member.map(member => {
							member.ParkID = parseInt(member.ParkID);
							member.Pkmemberno = parseInt(member.Pkmemberno);
						});
                        triggerEvent(document, 'ACDParkInfo', obj); //Object got: {obj.Member[i].ParkID, obj.Member[i].ParkName, obj.Member[i].Pkmemberno}
                        break;
                    case '18':
						
						// obj.Member if have no members, would be null
						if (obj.Member == null) {obj.Member = [];}
						obj.Member.map(member => {
							member.GroupID = parseInt(member.GroupID);
							member.AgentID = parseInt(member.AgentID);
							member.StatusID = parseInt(member.StatusID);
						});
                        triggerEvent(document, 'ACDGroupMember', obj); //Object got: {obj.Member[i].GroupID, obj.Member[i].AgentID, obj.Member[i].StatusID, obj.Member[i].AgentName}					
                        break;
                    case '19':
                        obj.FlowID = parseInt(obj.FlowID);
                        triggerEvent(document, 'IVRSInfo', obj); //Object got: {obj.FlowID, obj.FlowDesce}
                        break;
                    case '20':
						obj.Member.map(member => {
							member.GroupID = parseInt(member.GroupID);
							member.WaitCount = parseInt(member.WaitCount);
							member.MaxWaitTime = parseInt(member.MaxWaitTime);
							member.CallType = parseInt(member.CallType);
						});
                        triggerEvent(document, 'ACDGroupQueueEx', obj); //Object got: {obj.Member[i].GroupID,obj.Member[i].WaitCount,obj.Member[i].MaxWaitTime,obj.Member[i].CallType}
                        break;
                    case '21':
						obj.Member.map(member => {
							member.ParkID = parseInt(member.ParkID);
							member.WaitCount = parseInt(member.WaitCount);
							member.MaxWaitTime = parseInt(member.MaxWaitTime);
							member.CallType = parseInt(member.CallType);
						});
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
						obj.Member.map(member => {
							member.VarType = parseInt(member.VarType);
						});
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
						obj.assign_to = parseInt(obj.assign_to);
						obj.offline_form = parseInt(obj.offline_form);
						obj.online_form = parseInt(obj.online_form);
						obj.unread_num = parseInt(obj.unread_num);
						triggerEvent(document, 'SendSocialMsgToAgent', obj); // Object got: {obj.ticket_id, obj.assign_to, obj.profile_pic, obj.nick_name, obj.msg_list.id, obj.msg_list. }
						break;
					case '42': // 	EndUserInfo 
						obj.agent_id = parseInt(obj.agent_id);
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
				*/
            };
			
            this.ws.onclose = function() {
                // websocket is closed.
                //wsWiseAgent.OpenWebsocket(serverName, retryLogin);
				//wsWiseAgent.OpenWebsocket(serverAddr);
				//console.log("ws.close");
				let now=new Date();
				if((now-wsWiseAgent.wsCreatedTime)/1000<=10) {
					alert("Duplicate login!");
					window.parent.logoutClicked();
				} else {
					wsWiseAgent.OpenWebsocket();
					triggerEvent(document, 'wsOnclose');
				}
            };
            this.ws.onerror = function() {
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
		let cmd = {"Command" : "100"};
		SendCommandToServer(cmd);
    },

    AcceptMediaCall: function(ConnID) {
		let cmd = {"Command" : "101", "ConnID" : ConnID};
		SendCommandToServer(cmd);
    },

    BindToACDGroup: function(GroupID) {
		let cmd = {"Command" : "105", "GroupID" : GroupID.toString()};
		SendCommandToServer(cmd);
    },

    Break: function() {
		let cmd = {"Command" : "106"};
		SendCommandToServer(cmd);

    },
    CreateConference: function(HconnId) {
		let cmd = {"Command" : "107", "HconnID" : HconnId.toString()};
		SendCommandToServer(cmd);
    },

    DialAgent: function(AgentID) {
		let cmd = {"Command" : "108", "AgentID" : AgentID.toString()};
		SendCommandToServer(cmd);
    },

    DialOut: function(DNIS, ANI) {
		let cmd = {"Command" : "109", "ANI" : ANI.toString(), "DNIS": DNIS.toString()};
		SendCommandToServer(cmd);
    },

    DialStation: function(StationNumber) {
		let cmd = {"Command" : "110", "StationNumber" : StationNumber.toString()};
		SendCommandToServer(cmd);
    },

    GetAgentStatus: function() {
		let cmd = {"Command" : "111"};
		SendCommandToServer(cmd);
    },

    GetAutoReadyStatus: function() {
		let cmd = {"Command" : "112"};
		SendCommandToServer(cmd);
    },

    GetAnswerTimeout: function() {
		let cmd = {"Command" : "113"};
		SendCommandToServer(cmd);
    },

    GetACDGroup: function() {
		let cmd = {"Command" : "114"};
		SendCommandToServer(cmd);
    },

    GetACDGroupNo: function() {
		let cmd = {"Command" : "115"};
		SendCommandToServer(cmd);
    },

    GetACDPark: function() {
		let cmd = {"Command" : "116"};
		SendCommandToServer(cmd);
    },

    GetACDParkNo: function() {
		let cmd = {"Command" : "117"};
		SendCommandToServer(cmd);
    },

    GetCallString: function(ConnID, Vartype) {
		let cmd = {"Command" : "118", "ConnID" : ConnID, "Vartype": Vartype.toString()};
		SendCommandToServer(cmd);
    },

    GetACDGroupMember: function(GroupID) {
		let cmd = {"Command" : "120", "GroupID" : GroupID.toString()};
		SendCommandToServer(cmd);
    },

    GetACDGroupMemberNo: function(GroupID) {
		let cmd = {"Command" : "121", "GroupID" : GroupID.toString()};
		SendCommandToServer(cmd);
    },

    GetIVRS: function() {
		let cmd = {"Command" : "122"};
		SendCommandToServer(cmd);
    },

    GetIVRSNo: function() {
		let cmd = {"Command" : "123"};
		SendCommandToServer(cmd);
    },

    Hangup: function(connID) {
		let cmd = {"Command" : "124", "connID": connID};
		SendCommandToServer(cmd);
    },

    Hold: function() {
		let cmd = {"Command" : "125"};
		SendCommandToServer(cmd);
    },

    Idle: function() {
		let cmd = {"Command" : "126"};
		SendCommandToServer(cmd);
    },

    Login: function(agentID, ppassword, Terminal) {
		let cmd = {"Command" : "127", "AgentID" : agentID, "Password" : ppassword.toString(), "Terminal" : Terminal };
	
		SendCommandToServer(cmd);

    },

    Logout: function() {
		let cmd = {"Command" : "128"};
		SendCommandToServer(cmd);
    },

    MonitorAgent: function(DestagentID, TypeID) {
		let cmd = {"Command" : "130","DestagentID" : DestagentID.toString(), "TypeID" : TypeID.toString()};
		SendCommandToServer(cmd);
    },

    PlayCall: function(CallID) {
		let cmd = {"Command" : "131","CallID" : CallID.toString()};
		SendCommandToServer(cmd);
    },

    PlayFile: function(Filename) {
		let cmd = {"Command" : "132","Filename" : Filename};
		SendCommandToServer(cmd);
    },

    Ready: function() {
		let cmd = {"Command" : "133"};
		SendCommandToServer(cmd);
    },

    RejectCall: function() {
		let cmd = {"Command" : "134"};
		SendCommandToServer(cmd);
    },

    SendDTMFTone: function(DTMF) {
		let cmd = {"Command" : "135", "DTMF": DTMF.toString()};
		SendCommandToServer(cmd);
    },

    StartMonitor: function(TypeID) {
		let cmd = {"Command" : "138", "TypeID": TypeID.toString()};
		SendCommandToServer(cmd);
    },

    SetAnswerTimeout: function(Timeout) {
		let cmd = {"Command" : "139", "Timeout": Timeout.toString()};
		SendCommandToServer(cmd);
    },

    SetAutoReady: function(AutoReadyflag) {
		let cmd = {"Command" : "140", "AutoReadyflag": AutoReadyflag.toString()};
		SendCommandToServer(cmd);
    },

    StepTransferCall: function(DeviceType, DeviceID, Message) {
		let cmd = {"Command" : "141", "DeviceType": DeviceType.toString(), "DeviceID": DeviceID.toString(), "Message": Message.toString()};
		SendCommandToServer(cmd);
    },

    StepTransferCallReturn: function(DeviceType, DeviceID, Message) {
		let cmd = {"Command" : "142", "DeviceType" : DeviceType.toString(), "DeviceID": DeviceID.toString(), "Message": Message.toString()};
		SendCommandToServer(cmd);
    },

    StepTransferStation: function(StationNumber) {
		let cmd = {"Command" : "143", "StationNumber" : StationNumber.toString()};
		SendCommandToServer(cmd);
    },

    StepTransferStationReturn: function(StationNumber) {
		let cmd = {"Command" : "144", "StationNumber" : StationNumber.toString()};
		SendCommandToServer(cmd);
    },

    StopMonitor: function(TypeID) {
		let cmd = {"Command" : "145", "TypeID" : TypeID.toString()};
		SendCommandToServer(cmd);
    },

    StopMonitorAgent: function(DestagentID) {
		let cmd = {"Command" : "146", "DestagentID": DestagentID.toString()};
		SendCommandToServer(cmd);
    },

    StopPlay: function() {
		let cmd = {"Command" : "147"};
		SendCommandToServer(cmd);
    },

    TransferCall: function(ConnID, Message) {
		let cmd = {"Command" : "148", "ConnID" : ConnID, "Message": Message};
		SendCommandToServer(cmd);
    },

    TransferCallReturn: function(ConnID, Message) {
		let cmd = {"Command" : "149", "ConnID" : ConnID, "Message": Message};
		SendCommandToServer(cmd);
    },

    Unhold: function(ConnID) {
		let cmd = {"Command" : "150", "ConnID" : ConnID};
		SendCommandToServer(cmd);
    },



    UpdatePassword: function(OldPwd, NewPwd) {
		let cmd = {"Command" : "151", "OldPwd" : OldPwd.toString(), "NewPwd": NewPwd.toString()};
		SendCommandToServer(cmd);
    },

    Working: function(CallType) {
		let cmd = {"Command" : "152", "CallType" : CallType.toString()};
		SendCommandToServer(cmd);
    },

    AddMemberToConferenceEx: function(ConfconnID, ConftypeID) {
		let cmd = {"Command" : "153", "ConfconnID" : ConfconnID.toString(), "ConftypeID": ConftypeID.toString()};
		SendCommandToServer(cmd);
    },

    CreateConferenceEx: function(HconnID, HtypeID, TypeID) {
		let cmd = {"Command" : "154", "HconnID" : HconnID.toString(), "HtypeID": HtypeID.toString(), "TypeID": TypeID.toString()};
		SendCommandToServer(cmd);
    },

    ListConferenceMember: function(ConfconnID) {
		let cmd = {"Command" : "155", "ConfconnID" : ConfconnID.toString()};
		SendCommandToServer(cmd);
    },

    ChangeConferenceMemberMode: function(ConfMemberconnID, Attribute) {
		let cmd = {"Command" : "156", "ConfMemberconnID" : ConfMemberconnID.toString(), "Attribute": Attribute.toString()};
		SendCommandToServer(cmd);
    },

    DeleteAgent: function(DelagentID) {
		let cmd = {"Command" : "157", "DelagentID" : DelagentID.toString()};
		SendCommandToServer(cmd);
    },

    AcceptMediaCallEx: function(DeviceType, DeviceID, CallType) {
		let cmd = {"Command" : "160", "DeviceType" : DeviceType.toString(), "DeviceID" : DeviceID.toString(), "CallType" : CallType.toString()};
		SendCommandToServer(cmd);
    },

    SetCaseID: function(CallType, CallID, CaseID) {
		let cmd = {"Command" : "161", "CallType" : CallType.toString(), "CallID" : CallID.toString(), "CaseID" : CaseID.toString()};
		SendCommandToServer(cmd);
    },

    PlayVmail: function(CallID) {
		let cmd = {"Command" : "165", "CallID" : CallID.toString()};
		SendCommandToServer(cmd);
    },

    SetForceReply: function(ForceReplyflag) {
		let cmd = {"Command" : "167", "ForceReplyflag" : ForceReplyflag.toString()};
		SendCommandToServer(cmd);
    },

    DialDevice: function(DeviceType, DeviceID) {
		let cmd = {"Command" : "170", "DeviceType" : DeviceType.toString(), "DeviceID" : DeviceID.toString()};
		SendCommandToServer(cmd);
    },

    RemoveRecourse: function() {
		let cmd = {"Command" : "172"};
		SendCommandToServer(cmd);
	},
	
	BreakEx: function(BreakType) {
		let cmd = {"Command" : "173", "BreakType" : BreakType };
		SendCommandToServer(cmd);
    },

    SetCallMessage: function(ConnID, Message) {
		let cmd = {"Command" : "176", "ConnID" : ConnID.toString(), "Message" : Message.toString()};
		SendCommandToServer(cmd);
    },

    PlayShareVoice: function(Offset, Filename) {
		let cmd = {"Command" : "177", "Offset" : Offset.toString(), "Filename" : Filename};
		SendCommandToServer(cmd);
    },

    StopShareVoice: function() {
		let cmd = {"Command" : "178"};
		SendCommandToServer(cmd);
    },

    PauseShareVoice: function() {
		let cmd = {"Command" : "179"};
		SendCommandToServer(cmd);
    },

    ResumeShareVoice: function(Offset) {
		let cmd = {"Command" : "180", "Offset" : Offset.toString()};
		SendCommandToServer(cmd);
    },

    ChangeSpeedShareVoice: function(Speed) {
		let cmd = {"Command" : "182", "Speed" : Speed.toString()};
		SendCommandToServer(cmd);
    },

    ChangeVolumeShareVoice: function(Volume) {
		let cmd = {"Command" : "183", "Volume" : Volume.toString()};
		SendCommandToServer(cmd);
    },

    StopPlayGreeting: function() {
		let cmd = {"Command" : "184"};
		SendCommandToServer(cmd);
    },

    PlayCallEx: function(Offset, CallID) {
		let cmd = {"Command" : "185", "Offset" : Offset.toString(), "CallID" : CallID.toString()};
		SendCommandToServer(cmd);
    },

    PlayFileEx: function(Offset, Filename) {
		let cmd = {"Command" : "186", "Offset" : Offset.toString(), "Filename" : Filename.toString()};
		SendCommandToServer(cmd);
    },

    PauseVoice: function() {
		let cmd = {"Command" : "187"};
		SendCommandToServer(cmd);
    },

    ResumeVoice: function(Offset) {
		let cmd = {"Command" : "188", "Offset" : Offset.toString()};
		SendCommandToServer(cmd);
    },

    ChangeSpeedVoice: function(Speed) {
		let cmd = {"Command" : "189", "Speed" : Speed.toString()};
		SendCommandToServer(cmd);
    },

    ChangeVolumeVoice: function(Volume) {
		let cmd = {"Command" : "190", "Volume" : Volume.toString()};
		SendCommandToServer(cmd);
    },

    UpdateMediaHandleDateTime: function(CallID) {
		let cmd = {"Command" : "191", "CallID" : CallID.toString()};
		SendCommandToServer(cmd);
    },

    RetrieveCallQueue: function(DeviceType, DeviceID, CallType) {
		let cmd = {"Command" : "192", "DeviceType" : DeviceType.toString(), "DeviceID" : DeviceID.toString(), "CallType" : CallType.toString()};
		SendCommandToServer(cmd);
    },

    AcceptCallEx: function(CallType, ConnID) {
		let cmd = {"Command" : "193", "CallType" : CallType, "ConnID" : ConnID};
		SendCommandToServer(cmd);
    },

    SetAgentData: function(Data) {
		let cmd = {"Command" : "194", "Data" : Data.toString()};
		SendCommandToServer(cmd);
    },

    GetAgentDataCount: function(Data) {
		let cmd = {"Command" : "195", "Data" : Data.toString()};
		SendCommandToServer(cmd);
    },

    SendFaxExP_UC: function(jsonData) {
		const {UniqueID, PhoneNumber, CoverMsg, FaxFile, SendTo, Subject, Company, Coverfile, CaseID, ANI, Sender} = jsonData;
		let cmd = {"Command" : "196", "UniqueID" : UniqueID.toString(), "PhoneNumber" : PhoneNumber.toString(), "CoverMsg" : CoverMsg, "FaxFile" : FaxFile, 
			"SendTo" : SendTo, "Subject": Subject, "Company": Company, "Coverfile": Coverfile, "CaseID": CaseID.toString(), "ANI": ANI.toString(), 
			"Sender": Sender.toString(), "Priority": "1"};
		SendCommandToServer(cmd);
    },

    SendEmail_UC: function(jsonData) {
		const {Recipient, CC, BCC, Sender, Subject, AttachedFile, CaseID, ANI, BodyType, ContentMsg} = jsonData;
		let cmd = {"Command" : "197", "Recipient" : Recipient.toString(), "CC" : CC.toString(), "BCC" : BCC, "Sender" : Sender, 
			"Subject": Subject, "AttachedFile": AttachedFile, "CaseID": CaseID.toString(), "ANI": ANI.toString(), 
			"BodyType": BodyType.toString(), "ContentMsg": ContentMsg.toString()};
		SendCommandToServer(cmd);
    },

    AddRecourse_UC: function(RecourseInfo) {
		let cmd = {"Command" : "198", "RecourseInfo" : RecourseInfo.toString()};
		SendCommandToServer(cmd);
    },

    SendSMS_UC: function(DNIS, ANI, CaseID, ReplyID, Message) {
		let cmd = {"Command" : "200", "DNIS" : DNIS.toString(), "ANI" : ANI.toString(), "CaseID" : CaseID.toString(), "ReplyID" : ReplyID.toString(), "Message" : Message.toString()};
		SendCommandToServer(cmd);
    },

    SendMessage_UC: function(DeviceType, DeviceID, Message) {
		let cmd = {"Command" : "201", "DeviceType" : DeviceType.toString(), "DeviceID" : DeviceID.toString(), "Message" : Message.toString()};
		SendCommandToServer(cmd);
    },

    SendBlogMsg: function(jsonData) {
		const { CommentonID, Sender, SendTo, PictureUrl, VideoUrl, VoiceUrl, ANI, ContentMsg } = jsonData;
		let cmd = {"Command" : "204", "CommentonID" : CommentonID.toString(), "Sender" : Sender.toString(), "SendTo" : SendTo.toString()
		, "PictureUrl" : PictureUrl.toString(), "VideoUrl" : VideoUrl.toString(), "VoiceUrl" : VoiceUrl.toString(), "ANI" : ANI.toString(), "ContentMsg" : ContentMsg.toString()};
		SendCommandToServer(cmd);
    },

    GetLogonAgent: function() {
		let cmd = {"Command" : "205"};
		SendCommandToServer(cmd);
    },

    GetGroupMemberEx: function(groupID) {
		let cmd = {"Command" : "206", "GroupID" : groupID.toString()};
		SendCommandToServer(cmd);
    },

    InactiveStatusTime: function(StatusID, InactiveTime) {
		let cmd = {"Command" : "208", "StatusID" : StatusID.toString(), "InactiveTime" : InactiveTime.toString()};
		SendCommandToServer(cmd);
    },

    SetEnableRecording: function(ConnID, ActionID) {
		let cmd = {"Command" : "209", "ConnID" : ConnID.toString(), "ActionID" : ActionID.toString()};
		SendCommandToServer(cmd);
    },
	
	GetTicket: function(company_code, assign_to, status, enduser_id, offset, count) {
		let cmd = {"Command" : "210", "company_code" : company_code.toString(), "assign_to" : assign_to.toString(), "status" : status.toString(), "enduser_id" : enduser_id.toString()
		, "offset" : offset.toString(), "count" : count.toString()};
		SendCommandToServer(cmd);
	},
	
    GetTicketMsg: function(ticket_id) {
		let cmd = {"Command" : "211", "ticket_id" : ticket_id.toString()};
		SendCommandToServer(cmd);
	},

    UpdateTicket: function(ticket_id, assign_to) {
		let cmd = {"Command" : "212", "ticket_id" : ticket_id.toString(), "assign_to" : assign_to.toString()};
		SendCommandToServer(cmd);
	},

	SendMsgToConnector: function(ticket_id, msg_id, complete_msg_id, msg_text) {
		let cmd = {"Command" : "213", "ticket_id" : ticket_id.toString(), "msg_id" : msg_id, "complete_msg_id" : complete_msg_id
		, "message":{"msg_text" : msg_text.toString()}};
		SendCommandToServer(cmd);
	},

	AssignToChatRoom: function(ticket_id, assign_to, action) {
		let cmd = {"Command" : "214", "ticket_id" : ticket_id.toString(), "assign_to" : assign_to.toString(), "action" : action.toString()};
		SendCommandToServer(cmd);
	},
	
	GetEndUserInfo : function(agent_id, enduser_id) {
		let cmd = {"Command" : "216", "agent_id" : agent_id.toString(), "enduser_id" : enduser_id.toString()};
		SendCommandToServer(cmd);
	},
	
	UpdateEndUserInfo : function(agent_id, enduser_id, name, company_code, gender, birthday, remark) {
		let cmd = {"Command" : "217", "agent_id" : agent_id.toString(), "enduser_id" : enduser_id.toString(), "name" : name.toString(), "company_code" : company_code.toString()
		, "gender" : gender.toString(), "birthday" : birthday.toString(), "remark" : remark.toString()};
		SendCommandToServer(cmd);
	},

    CompleteTicket : function(ticket_id) {
		let cmd = {"Command" : "218", "ticket_id" : ticket_id.toString()};
		SendCommandToServer(cmd);
	},
	
	SendFileToConnector: function(ticket_id, msg_id, complete_msg_id, filepath) {
		let cmd ={ "Command":"219", "ticket_id": ticket_id.toString(), "msg_id" : msg_id, "complete_msg_id": complete_msg_id, "message" : {"filepath" : filepath} };
		SendCommandToServer(cmd);
	},

	InviteAgentToChat  : function(agent_id, ticket_id, msg_content) {
		let cmd = {"Command" : "220", "ticket_id" : ticket_id, "agent_id" : agent_id, "msg_content" : msg_content.toString()};
		SendCommandToServer(cmd);
	},
	
	GetFaceBookPost   : function(agent_id, ticket_id) {
		let cmd = {"Command" : "221", "ticket_id" : ticket_id, "agent_id" : agent_id};
		SendCommandToServer(cmd);
	},

	SendFaceBookComment    : function(ticket_id, msg_text) {
		let cmd = {"Command" : "222", "ticket_id" : ticket_id.toString(), "message": {"msg_text": msg_text}};
		SendCommandToServer(cmd);
	},

	GetAgentTicketList    : function(agent_id) {
		let cmd = {"Command" : "223", "agent_id" : agent_id.toString()};
		SendCommandToServer(cmd);
	},
	
	GetOnlineForm     : function(ticket_id) {
		let cmd = {"Command" : "224", "ticket_id" : ticket_id.toString()};
		SendCommandToServer(cmd);
	},

	GetOfflineForm     : function(ticket_id) {
		let cmd = {"Command" : "225", "ticket_id" : ticket_id.toString()};
		SendCommandToServer(cmd);
	},
	
	GetUpperLevelComment      : function(msg_id) {
		let cmd = {"Command" : "228", "msg_id" : msg_id.toString()};
		SendCommandToServer(cmd);
	},
	
	GetSameLevelComment    : function(msg_id, count, mode) {
		let cmd = {"Command" : "229", "msg_id" : msg_id.toString(), "count" : count.toString(), "mode" : mode.toString()};
		SendCommandToServer(cmd);
	},
	
	GetSameLevelReply     : function(msg_id, count, mode) {
		let cmd = {"Command" : "230", "msg_id" : msg_id.toString(), "count" : count.toString(), "mode" : mode.toString()};
		SendCommandToServer(cmd);
	},

	SetAgentStatus     : function(agent_id, StatusID, mode) {
		let cmd = {"Command" : "231", "agent_id" : agent_id.toString(), "StatusID" : StatusID.toString(), "mode" : mode.toString()};
		SendCommandToServer(cmd);
	},

	SendCSInputtingState : function(agent_id, ticket_id ) {
		let cmd = {"Command" : "232", "agent_id" : String(agent_id), "ticket_id" : String(ticket_id)}
		SendCommandToServer(cmd);
	},

	SendTemplateMsg     : function(company_code, To, TP_id, props, BlogType) {
		let cmd = {"Command" : "233", "company_code" : company_code, "To" : String(To), "TP_id" : TP_id, "props" : props, "BlogType" : BlogType};
		SendCommandToServer(cmd);
	},
	GetLogonAgentEx      : function() {
		let cmd = {"Command" : "237"};
		SendCommandToServer(cmd);
	},
	LoginEx : function(agentID, password, terminal, subTerminal, phone, agentTerminal) {
		let cmd = {"Command" : "238", "agentID" : agentID.toString(), "Password" : password, "Terminal" : terminal, "Sub_Terminal" : subTerminal, "Phone" : phone, "AgentTerminal" : agentTerminal};
		SendCommandToServer(cmd);
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
		/*	Tiger 2025-04-11
		let event; let isIE = document.documentMode;
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
	}

		function SendCommandToServer(jsonCmd, tryCount)
		{
			delete wsWiseAgent.commandResult[jsonCmd.Command];
			let StrCommand = JSON.stringify(jsonCmd);
			if (wsWiseAgent.ws == null){ // phone.html not connected to agent server yet, ws is null
				if (typeof tryCount=='undefined'){tryCount=0;}
				if (tryCount<4){ // retry 3 times
					tryCount+=1;
					setTimeout(function (p) { SendCommandToServer(p.jsonCmd, p.tryCount) }.bind(this, {jsonCmd: jsonCmd,tryCount: tryCount}),1000)
				}
			}
			else if ( wsWiseAgent.ws.readyState ==1){
				wsWiseAgent.ws.send(StrCommand);	
			}
			else if (wsWiseAgent.ws.readyState == 0) {
				//
			}
			else if (wsWiseAgent.ws.readyState == 2) {
				//
			}
			else if (wsWiseAgent.ws.readyState == 3) {
				//
			}
		}
		function retryLogin(){
			let userName=localStorage.getItem("userName");
			let pass = sessionStorage.getItem("pass");
			wsWiseAgent.Login(userName,pass, "");
			
		}
		function CommandHexToDescription(strNum) {
			let errMsg = "";
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
				errMsg =strNum;
			}
			return errMsg	
		}
		/*	Tiger 2025-04-11
		function CommandIntToDescription(cNum){
			let str ;
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
		*/ 
    
		
	