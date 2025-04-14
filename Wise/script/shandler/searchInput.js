// msgobj is not usage??????????

function searchInput(sTicket) 
{

    var mvcHost     = config.mvcHost;
    
    var ticketId    = sTicket.TicketId;
    var entry       = sTicket.Channel;

    //var loginId= parseInt(sessionStorage.getItem('scrmAgentId') || -1);
    //var token = sessionStorage.getItem('scrmToken') || '';




    var campaign = "campaignCRM";

    if (parent.$('#phone-panel')[0].contentWindow.selectedQueuelist != null) { campaign = parent.$('#phone-panel')[0].contentWindow.selectedQueuelist[0].name }

    var enduserId   = sTicket.EndUserId;
    var loginId     = top.loginId;
    var token       = top.token;
    sessionStorage.setItem('scrmAgentId',   top.loginId);
    sessionStorage.setItem('scrmToken',     top.token);
    // var onlineFormData; //////////////////?????????????????????????????????????           20250414 Remove the declaration of the unused 'onlineFormData' variable.

    // var offlineFormData; //////////////////?????????????????????????????????????          20250414 Remove the declaration of the unused 'offlineFormData' variable.
    var newTicket = true;

    ///Still do not know the usage
    var functions = sessionStorage.getItem('scrmFunctions') || '';
    //var noFormInSocial = functions.indexOf('No-Form-In-Social') != -1 ? true : false;     // 20250320 Unnecessary use of boolean literals in conditional expression.
    var noFormInSocial = functions.indexOf('No-Form-In-Social') != -1

    //20241126 for reset
    $('#search-input-section').empty();

    // ====== 3/3 add auto search if needed ======
    if (newTicket) 
    {


        //*************to be done for agent transfer */
        if (parent.tmpTicketId == ticketId) {

            // will not have any content for search input part, if i know i am being invited
            parent.tmpTicketId = null;
        } 
		else if (entry != 'fb_comment' && entry != 'fb_post') 
		{

            // If entry fb_comment, still show as fb comment
            if (!parent.tmpMonIdArr.includes(ticketId)) {
                var enduserIdStr = '';
                var callType = "";
                var details = "";
                if (entry == 'web') {       //20261125  if (entry == 'webchat') {  ===>>>>>>>>  if (entry == 'web') {
                    callType = 'Inbound_Webchat';
                } else if (entry == 'whatsapp') {
                    callType = "Inbound_Whatsapp";
                    enduserIdStr = 'enduserId=' + enduserId + ' ';
                    var waTemplateClickStr = 'waTemplate("' + campaign + '")';
                    $('#reply-btn-' + ticketId).before('<button class="s-standalone-btn keyboard-icon" onclick=' + waTemplateClickStr + ' title="WhatsApp Template"><span class="align-sub"><i class="fab fa-whatsapp"></i></span></button>');
                } else if (entry == 'facebook') {
                    callType = "Inbound_Facebook";
                    enduserIdStr = 'enduserId=' + enduserId + ' ';
                } else if (entry == 'wechat') {
                    callType = "Inbound_Wechat";
                    enduserIdStr = 'enduserId=' + enduserId + ' ';
                }

                // still using connId which is int only, so whatsapp now okay now - no whatsapp has db not changed big int yet
                // NO INCOMPLETE for 'whatsapp' yet, as Vincent not yet change the call_history table and the savCallHistory API
              //  if (entry == 'webchat' || entry == 'facebook' || entry == 'wechat') {
              //      callSaveCallHistory(ticketId, callType, null, campaign);
              //  }
                if (entry == 'web')    //20261125 if (entry == 'webchat') {  ===>>>>>>>>  if (entry == 'web') {
				{ // only if entry is webchat will have case searching
                    $.ajax({
                        type: "POST",
                        url: mvcHost + '/mvc' + campaign + '/api/GetFields',
                        data: JSON.stringify({
                            "listArr": ["Webchat Fields"],
                            Agent_Id: loginId,
                            Token: token
                        }),
                        crossDomain: true,
                        contentType: "application/json",
                        dataType: 'json'
                    }).always(function (r) {
                        var rDetails = r.details;
                        if (!/^success$/i.test(r.result || "")) {
                            console.log('error: ' + rDetails);
                    // } else {     // 20250410 'If' statement should not be the only statement in 'else' block
                        } else if (rDetails != undefined) {
                                var webchatFieldsStr = '';
                                var webchatFields = rDetails['Webchat Fields'] || [];
                                if (webchatFields != undefined && webchatFields.length > 0) {
                                    webchatFieldsStr += ' webchatFields= "';
                                    for (var i = 0; i < webchatFields.length; i++) {
                                        if (i != 0) {
                                            webchatFieldsStr += ','
                                        }
                                        var fieldName = SC.handleFrameDetails(webchatFields[i].Field_Name);
                                        var fieldValue = SC.handleFrameDetails(webchatFields[i].Field_Display);
                                        webchatFieldsStr += (fieldName + ':' + fieldValue);
                                    }
                                    webchatFieldsStr += '"';
                                }
                                var onlineFormData = [];
                                onlineFormData.push({
                                    field_name: "Name",
                                    field_value: sTicket.EndUserName
                                });

                                if (onlineFormData.length > 0) {
                                    for (var i = 0; i < onlineFormData.length; i++) {
                                        if (i != 0) {
                                            details += ','
                                        }
                                        var fieldName = SC.handleFrameDetails(onlineFormData[i].field_name);
                                        var fieldValue = SC.handleFrameDetails(onlineFormData[i].field_value);
                                        details += (fieldName + ':' + fieldValue);
                                    }
                                }



                                //if (offlineFormData.length > 0) {
                                 //   for (var i = 0; i < offlineFormData.length; i++) {
                                 //       if (i != 0) {
                                 //           details += ','
                                  //      }
                                 //       var theField = offlineFormData[i];
                                 //       var fieldName = SC.handleFrameDetails(theField.field_name);
                                 //       var fieldValue = SC.handleFrameDetails(theField.field_value);
                                 //       details += (fieldName + ':' + fieldValue);
                                 //   }
                                //}
                                if (!noFormInSocial) {
                                    $('#search-input-section').append('<div id="search-input-' + ticketId + '" class="search-input">' +
                                        '<iframe id="input-form-' + ticketId + '" openType="social" campaign="' + campaign + '" connId="' + ticketId + '" callType="' + callType + '" ' + enduserIdStr + 'details="' + details + '"' + webchatFieldsStr + ' width="100%" height="auto" style="display: none; border: none;"></iframe>' +
                                        '<iframe id="search-' + ticketId + '" src="./search.html" openType="social" campaign="' + campaign + '" connId="' + ticketId + '" callType="' + callType + '" ' + enduserIdStr + 'details="' + escape(details) + '"' + webchatFieldsStr + ' width="100%" height="auto" style="border: none;" ></iframe></div>');
                                }
                            //} // 20250410 for else if 
                        }
                    });

                    // add search
                    // entry != 'wechat', details will be empty string, facebook and wechat nick name is not good for case searching
                } 
				//else {    // 20250410 'If' statement should not be the only statement in 'else' block 
                else if (!noFormInSocial) {
                        $('#search-input-section').append('<div id="search-input-' + ticketId + '" class="search-input">' +
                            '<iframe id="input-form-' + ticketId + '" openType="social" campaign="' + campaign + '" connId="' + ticketId + '" callType="' + callType + '" ' + enduserIdStr + ' details="" width="100%" height="auto" style="display: none; border: none;"></iframe>' +
                            '<iframe id="search-' + ticketId + '" src="./search.html" openType="social" campaign="' + campaign + '" connId="' + ticketId + '" callType="' + callType + '" ' + enduserIdStr + ' details="" width="100%" height="auto" style="border: none;"></iframe>' +
                            '</div>');
							

                        $('#bubble-list-inner').height('752px'); // previous height maybe fb_comment height, so need to adjust
                   // }// 20250410 for else if
                }
            } else {
                // momn
            }
        } else if (entry == 'fb_comment' || entry == 'fb_post') {
            $('#content-' + ticketId).find('.content-section-inner').width('60%').css('display', 'inline-block');
            $('#content-' + ticketId).append('<div class="fb-comment-inner" style="width:40%;display:inline-block;float:right;"><div id="fb-scroll-' + ticketId + '" class="fb-scroll custom-scroll"><div id="fb-title-' + ticketId + '"></div><div id="fb-media-' + ticketId + '"></div>' +
                '<div class="mt-3 justify-content-between d-flex align-items-center"><button class="btn btn-warning btn-circle box-sizing-border-box" title="Reload History" onclick="reloadFBHistory(' + ticketId + ')"><i class="fas fa-redo"></i></button><span style="color: #606770;" id="no-of-comment-' + ticketId + '"></span></div>' +
                '<div style="margin-top:13px;margin-bottom:13px;border-top:3px dotted darkgray;"></div><div id="fb-content-' + ticketId + '"></div></div></div>');
            $('#navigation ul li').css('display', 'inline-block');

            // add FB Content
            getFBPostContent(ticketId);
            $('#reply-btn-' + ticketId).before('<button class="s-standalone-btn" data-bs-toggle="tooltip" data-bs-placement="top" title="Select all messages" onclick="selectAllClicked(' + ticketId + ')"><span class="align-sub"><i class="far fa-check-square keyboard-icon"></i></span></button><button class="reply-discard-container" data-bs-toggle="tooltip" data-bs-placement="top" title="No need to answer for selected comment(s)" onclick="discardClicked(' + ticketId + ')"><span><i class="far fa-times-circle keyboard-icon"></i></span></button>');
            parent.toBeUnloadedPost.push(ticketId);
            resize();
            getFBComments(ticketId);
            $('#bubble-list-inner').height('calc(100vh - 29px)');
        }
    }

    // scroll to the bottom
    //var objDiv = document.getElementById('content-inner-scroll-' + ticketId);   //20250414 Remove the declaration of the unused 'objDiv' variable.

    // if have image need to wait till it downloaded to scroll down
    //if (haveImageToLoad) {
//
 //       // need the file put to the locatino first, 500 is not enough, so changed 1000
  //      setTimeout(function (p) {
   //         var objDiv = p.objDiv;
    //        objDiv.scrollTop = objDiv.scrollHeight;
     //   }.bind(this, { objDiv: objDiv }), 1000);
    //} else {
    //    objDiv.scrollTop = objDiv.scrollHeight;
    //}
}
