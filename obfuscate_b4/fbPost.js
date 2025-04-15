var selectedPost = {};
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var mvcUrl = config.mvcUrl;
var wiseHost = config.wiseHost;
var newDate = new Date();
var year = newDate.getFullYear();
var mm = newDate.getMonth() + 1; //January is 0!
var dd = newDate.getDate();
var today = year + ' - ' + mm + ' - ' + dd;
var fbHistoryfileHost = 'https://api.commas.hk/';
var loginId = parent.loginId;
var token = sessionStorage.getItem('scrmToken') || '';

function setLanguage() {
    $('.l-fb-manage-facebook-posts').text(langJson['l-fb-manage-facebook-posts']);
    $('.l-fb-add-new-post').text(langJson['l-fb-add-new-post']);
}

function loadFBReplies(oThis, ticketId, scrollDown) {
    var theTag = $(oThis);
    var commentId = theTag.attr('commentId');
    $.ajax({
        type: "POST",
        url: wiseHost + '/WisePBX/api/SocialMedia/GetFBReplyComments',
        data: JSON.stringify({
            "ticketId": ticketId,
            "CommentId": commentId
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in getFBComments');
            } else {
                var data = r.data;

                // add history row
                for (var i = (data.length - 1); i >= 0; i--) {
                    var theMsg = data[i];
                    var theMsgContentDisplay = (theMsg.msg_content || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    var sentTime = theMsg.sent_time;
                    var theMsgDate = SC.handleDate(sentTime);
                    var theMsgTime = theMsgDate == '' ? SC.returnTime(sentTime, true) : "";
                    var msgObjectPath = theMsg.msg_object_path;
                    if (msgObjectPath != null && msgObjectPath.length > 0) {
                        msgObjectPath = msgObjectPath.replace('./', fbHistoryfileHost);
                        var handleContentMsgObj = SC.handleContentMsg(msgObjectPath, theMsg.msg_object_client_name, theMsg.msg_type);
                        theMsgContentDisplay += handleContentMsgObj.text;
                    }

                    // msg content null and msg object path null, is a balnk message means the enduser deleted a message by themself
                    if (theMsgContentDisplay == '') {
                        theMsgContentDisplay = '[ Customer deleted or edited a message / Received an unsupported file ]';
                    }
                    var lastBubbleId = i == (data.length - 1) ? ' id="last-bubble-commentid-' + theMsg.sc_comment_id + '"' : '';
                    if (theMsg.send_by_flag == 2) { //發送者1:客服,2:enduser{
                        //var userIconSrc = "./images/user.png";		20250415 Remove this useless assignment to variable "userIconSrc".
                        var msgHandled = theMsg.msg_completed;
                        var notYetHandleStr = (msgHandled == 1) ? '<span></span>' : '<span class="ms-2">NOT YET HANDLED</span>';

                        // NO DEL - iXServer cannot provide correct profile pic to us yet
                        // if (theMsg.profile_pic != undefined && theMsg.profile_pic != '') {
                        //     userIconSrc = theMsg.profile_pic;
                        // }
                        // /NO DEL

                        var msgRowId = (theMsg.sc_comment_id + sentTime + theMsg.nick_name).replace(/[ .:]/g, '');

                        // customer if send pic/video with text, will be divided in to 2 messages
                        if ($('#' + msgRowId).length > 0) {

                            // normally picture appened first
                            if (theMsg.msg_type == 'text') {
                                $('#' + msgRowId).find('.content-bubble-content').prepend('<div>' + theMsgContentDisplay + '</div>');
                            } else {
                                $('#' + msgRowId).find('.content-bubble-content').append('<div>' + theMsgContentDisplay + '</div>');
                            }
                            // two divided messaages if not both handled, need to add 'NOT YET HANDLED' string
                            if (msgHandled != 1) {
                                if ($('#' + msgRowId).next().text() != 'NOT YET HANDLED') {
                                    $('#' + msgRowId).next().addClass('ml-2').text('NOT YET HANDLED');
                                };
                            }
                        } else {
                            theTag.after('<div' + lastBubbleId +
                                ' class="fb-reply-row"><div><img class="user-icon" src="' + theMsg.profile_pic + '" onerror="if (this.src != \'./images/user.png\') this.src = \'./images/user.png\';" /><div class="time-with-seconds"><span>' +
                                theMsgDate + '</span><span>' + theMsgTime + '</span></div></div><div id="' + msgRowId + '" class="visitor-content-bubble fb-visitor-reply-bubble"><div class="content-bubble-name">' + SC.handleBubbleName(theMsg.nick_name, null, null, true) + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div>' + notYetHandleStr + '</div>');
                        }
                    } else {
                        theTag.after('<div' + lastBubbleId + ' class="fb-reply-row"><div><span class="user-icon"><i class="fas fa-user"></i></span><div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div><div class="fb-agent-bubble"><div class="content-bubble-name">' + theMsg.nick_name + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div></div>');
                    }
                }
                theTag.remove();

                //  scroll to the bottom of the reply(normal click 'View x Replies will not scroll down)
                if (scrollDown) {
                    var lastBubbleOffset = $('#last-bubble-commentid-' + data[data.length - 1].sc_comment_id).offset();
                    if (lastBubbleOffset != undefined) {
                        $('#fb-scroll-' + ticketId).animate({
                            scrollTop: lastBubbleOffset.top
                        }, 1000);
                    }
                }
            }
        },
        error: function (r) {
            console.log('error in getFBComments');
            console.log(r);
        }
    });
}

function getFBComments(ticketId, commentIdArr) {
    $.ajax({
        type: "POST",
        url: wiseHost + '/WisePBX/api/SocialMedia/GetFBComments',
        data: JSON.stringify({
            "ticketId": ticketId,
            "number": 5
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in getFBComments');
            } else {
                var data = r.data;
                // remaining no. of messages not showed yet
                var total = r.total;
                var remainNo = total - 5;
                var contentScrollDiv = $('#modal-fb-history');
                // remove original
                contentScrollDiv.children().remove();
                if (remainNo > 0) {
                    var viewComments = '';
                    if (remainNo > 50) {
                        viewComments = 'View more comments ' + '(' + remainNo + ' previous comments)';
                    } else {
                        var theCommentS = remainNo == 1 ? '' : 's';
                        viewComments = 'View ' + remainNo + ' more comment' + theCommentS;
                    }
                    contentScrollDiv.append('<span style="margin-left:35px;" onclick="fbMoreComments(' + ticketId + ', ' + data[0].msg_id + ', this)"><i class="fb up me-2"></i><span class="link-span">' + viewComments + '</span></span>');
                }
                var titleCommentS = total > 1 ? 's' : '';
                $('#modal-comment-no').text(total + " comment" + titleCommentS);

                // add history row
                for (let theMsg of data) {
                    var theMsgContentDisplay = (theMsg.msg_content || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    var sentTime = theMsg.sent_time;
                    var theMsgDate = SC.handleDate(sentTime);
                    var theMsgTime = theMsgDate == '' ? SC.returnTime(sentTime, true) : "";
                    var msgObjectPath = theMsg.msg_object_path;
                    if (msgObjectPath != null) {
                        var handleContentMsgObj = SC.handleContentMsg(theMsg.msg_object_path, theMsg.msg_object_client_name, theMsg.msg_type);
                        theMsgContentDisplay += handleContentMsgObj.text;
                    }
                    // msg content null and msg object path null, is a balnk message means the enduser deleted a message by themself
                    if (theMsgContentDisplay == '') {
                        theMsgContentDisplay = '[ Customer deleted or edited a message / Received an unsupported file ]';
                    }
                    if (theMsg.send_by_flag == 2) { //發送者1:客服,2:enduser{
                        var msgHandled = theMsg.msg_completed;
                        var notYetHandleStr = (msgHandled == 1) ? '<span></span>' : '<span>NOT YET HANDLED</span>'
                        var msgRowId = (theMsg.sc_comment_id + sentTime + theMsg.nick_name).replace(/[ .:]/g, '');
                        // customer if send pic/video with text, will be divided in to 2 messages
                        if ($('#' + msgRowId).length > 0) {
                            // normally picture appened first
                            if (theMsg.msg_type == 'text') {
                                $('#' + msgRowId).find('.content-bubble-content').prepend('<div>' + theMsgContentDisplay + '</div>')
                            } else {
                                $('#' + msgRowId).find('.content-bubble-content').append('<div>' + theMsgContentDisplay + '</div>')
                            }
                            theMsg.reply_count = 0;
                        } else {
                            contentScrollDiv.append('<div class="message-row"><div><img class="user-icon" src="' + theMsg.profile_pic + '" onerror="if (this.src != \'./images/user.png\') this.src = \'./images/user.png\';" /><div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div><div id="' + msgRowId + '" class="visitor-content-bubble"><div class="content-bubble-name">' + SC.handleBubbleName(theMsg.nick_name, null, null, true) + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div>' + notYetHandleStr + '</div>');
                        }

                        // two divided messaages if not both handled, need to add 'NOT YET HANDLED' string
                        if (msgHandled != 1) {
                            if ($('#' + msgRowId).next().text() != 'NOT YET HANDLED') {
                                $('#' + msgRowId).next().text('NOT YET HANDLED');
                            };
                        }

                    } else {

                        // send_by_flag == 1; agent
                        contentScrollDiv.append('<div class="message-row"><div><span class="user-icon"><i class="fas fa-user"></i></span><div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div><div class="fb-agent-bubble"><div class="content-bubble-name">' + theMsg.nick_name + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div></div>');
                    }
                    var replyCount = theMsg.reply_count;
                    if (replyCount > 0) {
                        var theReply = replyCount == 1 ? 'Reply' : 'Replies';
                        var commentId = theMsg.sc_comment_id;
                        // The reply-commentid- is for clicking reply link
                        contentScrollDiv.append('<div id="reply-commentid-' + commentId + '" style="margin-left:100px;" commentId="' + commentId + '" onclick="loadFBReplies(this,' + ticketId + ')"><i class="fb right me-2"></i><span class="link-span">View ' + replyCount + ' ' + theReply + '</span></div>');
                    }
                }
                // ============== Reply Clicked history now ===========
                if (commentIdArr != undefined) {
                    // var lastDisplayingComment = '';
                    // if comment already opened, load the replies
                    for (let theCommentId of commentIdArr) {
                        var replyLink = $('#reply-commentid-' + theCommentId);
                        if (replyLink.length > 0) {
                            loadFBReplies(replyLink, ticketId, true);
                        }
                    }
                }
            }
        },
        error: function (r) {
            console.log('error in getFBComments');
            console.log(r);
        }
    });
}

function fbMoreComments(ticketId, aboveMsgId, oThis) {
    $.ajax({
        type: "POST",
        url: wiseHost + '/WisePBX/api/SocialMedia/GetFBComments',
        data: JSON.stringify({
            "ticketId": ticketId,
            "aboveMsgId": aboveMsgId,
            "number": 50
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in getFBComments');
            } else {
                $(oThis).remove();
                var data = r.data;
                // remaining no. of messages not showed yet
                var total = r.total;
                var remainNo = total - 50;

                // add history row
                var contentScrollDiv = $('#modal-fb-history');
                var prependDiv = '';
                var lastContentId = '';
                var lastHandled = 0;
                for (let theMsg of data) {
                    var theMsgContent = theMsg.msg_content;
                    var theMsgContentDisplay = '';
                    var sentTime = theMsg.sent_time;
                    var theMsgDate = SC.handleDate(sentTime);
                    var theMsgTime = theMsgDate == '' ? SC.returnTime(sentTime, true) : "";
                    if (theMsgContent != null) {
                        theMsgContentDisplay += theMsgContent;
                    }
                    var msgObjectPath = theMsg.msg_object_path;
                    if (msgObjectPath != null) {
                        var handleContentMsgObj = SC.handleContentMsg(theMsg.msg_object_path, theMsg.msg_object_client_name, theMsg.msg_type);
                        theMsgContentDisplay += handleContentMsgObj.text;
                    }
                    // msg content null and msg object path null, is a balnk message means the enduser deleted a message by themself
                    if (theMsgContentDisplay == '') {
                        theMsgContentDisplay = '[ Customer deleted or edited a message / Received an unsupported file ]';
                    }
                    if (theMsg.send_by_flag == 2) { //發送者1:客服,2:enduser{
                        var msgHandled = theMsg.msg_completed;
                        var notYetHandleStr = (msgHandled == 1) ? '' : 'NOT YET HANDLED';
                        var contentId = (commentId + sentTime + theMsg.nick_name).replace(/[ .:]/g, '');

                        if (contentId == lastContentId) {
                            if (theMsg.msg_type == 'text') {
                                // message insert before image/video, '<div>' + theMsgContentDisplay + '</div>' insert before <div class="content-bubble-content">'
                                var n = prependDiv.lastIndexOf('<div class="content-bubble-content">') + 36;
                                prependDiv = prependDiv.substring(0, n) + '<div>' + theMsgContentDisplay + '</div>' + prependDiv.substring(n);
                            } else {
                                // message insert after text
                                var n = prependDiv.lastIndexOf('</div></div>');
                                prependDiv = prependDiv.substring(0, n) + '<div>' + theMsgContentDisplay + '</div>' + prependDiv.substring(n);
                            }
                            theMsg.reply_count = 0;
                            // add not yet handled if necessary
                            if (msgHandled != 1 && lastHandled == 1) {
                                var idx = prependDiv.lastIndexOf('<span class="not-yet-span">') + 27;// first letter index after this string
                                if (prependDiv.substring(idx, idx + 15) != 'NOT YET HANDLED') {
                                    prependDiv = prependDiv.substring(0, idx) + 'NOT YET HANDLED' + prependDiv.substring(idx);
                                }
                            }
                        } else {
                            prependDiv += ('<div class="message-row"><div><img class="user-icon" src="' +
                                theMsg.profile_pic +
                                '" onerror="if (this.src != \'./images/user.png\') this.src = \'./images/user.png\';" /><div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div><div class="visitor-content-bubble"><div class="content-bubble-name">' + SC.handleBubbleName(theMsg.nick_name, null, null, true) + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div>' + notYetHandleStr + '</div>');
                        }
                        lastContentId = contentId;
                        lastHandled = msgHandled;

                    } else { 
                        
                        // send_by_flag == 1; agent
                        prependDiv += '<div class="message-row"><div><span class="user-icon"><i class="fas fa-user"></i></span><div class="time-with-seconds"><span>' + theMsgDate + '</span><span>' + theMsgTime + '</span></div></div><div class="fb-agent-bubble"><div class="content-bubble-name">' + theMsg.nick_name + '</div><div class="content-bubble-content">' + theMsgContentDisplay + '</div></div></div>';
                    }
                    var replyCount = theMsg.reply_count;
                    if (replyCount > 0) {
                        var theReply = replyCount == 1 ? 'Reply' : 'Replies';
                        var commentId = theMsg.sc_comment_id;
                        // The reply-commentid- is for clicking reply link
                        prependDiv += '<div id="reply-commentid-' + commentId + '" style="margin-left:100px;" commentId="' + commentId + '" onclick="loadFBReplies(this,' + ticketId + ')"><i class="fb right me-2"></i><span class="link-span">View ' + replyCount + ' ' + theReply + '</span></div>';
                    }
                }
                contentScrollDiv.prepend(prependDiv);
                if (remainNo > 0) {
                    var viewComments = '';
                    if (remainNo > 50) {
                        viewComments = 'View more comments ' + '(' + remainNo + ' previous comments)';
                    } else {
                        var theCommentS = remainNo == 1 ? '' : 's';
                        viewComments = 'View ' + remainNo + ' more comment' + theCommentS;
                    }
                    $('#modal-fb-history').prepend('<span style="margin-left:35px;" onclick="fbMoreComments(' + ticketId + ', ' + data[0].msg_id + ', this)"><i class="fb up me-2"></i><span class="link-span">' + viewComments + '</span></span>');
                }
            }
        },
        error: function (r) {
            console.log('error in getFBComments');
            console.log(r);
        }
    });
}

var loadFacebookPosts = function (intitial) {
    $.ajax({
        type: "POST",
        url: mvcUrl + '/api/GetFaceBookPostContent/',
        data: JSON.stringify({
            Ticket_Id: -1,
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        if (!/^success$/i.test(res.result || "")) {
            console.log("Error in loadFacebookPosts." + res ? res.details : '');
        } else {
            var postContent = res.details;

            var postTable = $('#post-table').DataTable({
                // basic configs
                data: postContent,
                aaSorting: [[0, 'desc']],
                pageLength: 10, // 10 rows per page
                lengthChange: false,
                searching: false,

                // declare columns
                columns: [{
                    title: langJson['l-fb-ticket-id'],
                    data: 'Ticket_Id'
                }, {
                    title: langJson['l-fb-details'],
                    data: 'Details'
                }, {
                    title: langJson['l-fb-media-type'],
                    data: 'Media_Type'
                }, {
                    title: langJson['l-fb-media-link'],
                    data: 'Media_Link'
                }, {
                    title: ''
                }, {
                    title: ''
                }],

                // change the wording in pagination
                "language": {
                    "emptyTable": langJson['l-general-empty-table'],
                    "info": langJson['l-general-info'],
                    "infoEmpty": langJson['l-general-info-empty'],
                    "infoFiltered": langJson['l-general-info-filtered'],
                    "lengthMenu": langJson['l-general-length-menu'],
                    "search": langJson['l-general-search-colon'],
                    "zeroRecords": langJson['l-general-zero-records'],
                    "paginate": {
                        "previous": langJson['l-general-previous'],
                        "next": langJson['l-general-next']
                    }
                },

                // declare column definitions
                columnDefs: [{
                    // edit button (in img form)
                    targets: 1,
                    className: 'lengthy-column'
                }, {
                    // history button (in img form)
                    targets: 4,
                    render: function (data, type, row) {
                        return '<i class="fas fa-history table-btn" title="History"></i>';
                    },
                    orderable: false,
                    className: 'btnColumn'
                }, {
                    // edit button (in img form)
                    targets: 5,
                    render: function (data, type, row) {
                        return '<i class="fas fa-edit table-btn open" title="' + langJson['l-fb-edit-post'] + '"></i>';
                    },
                    orderable: false,
                    className: 'btnColumn'
                }
                ]
            });

            // highlight row upon clicking
            $('#post-table tbody').on('click', 'tr', function (e) {
                postTable.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                $(this).addClass('highlight');
            });

            // open history modal
            $('#post-table tbody').on('click', '.fa-history', function () {
                var data = postTable.row($(this).parents('tr')).data();
                var ticketId = data.Ticket_Id;
                $('#modal-comment-no').empty();
                $('#modal-fb-history').empty();
                // get history
                getFBComments(ticketId);
                $('#history-modal').modal('toggle');
            });

            // open account edit popup
            $('#post-table tbody').on('click', '.open', function () {
                var data = postTable.row($(this).parents('tr')).data();
                // window.selectedCaseLog = data;
                selectedPost = data;
                var openWindows = parent.openWindows;
                // 2nd properties '_blank' will open new window, if have name('postRecord'), will refresh the same
                var fbPopup = window.open('./fbPopup.html', 'postRecord', 'menubar=no,location=no,scrollbar=no,fullscreen=no,toolbar=no,status=no,width=400,height=800,top=200,left=20,resizable=1');
                openWindows[openWindows.length] = fbPopup;
                fbPopup.onload = function () {
                    fbPopup.onbeforeunload = function () {
                        for (var i = 0; i < openWindows.length; i++) {
                            if (openWindows[i] == fbPopup) {
                                openWindows.splice(i, 1);
                                break;
                            }
                        }
                    }
                }
            });
        }
    });
}

function createClicked() {
    selectedPost = null;
    var openWindows = parent.openWindows;
    var fbPopup = window.open('./fbPopup.html', '_blank', 'menubar=no,location=no, scrollbar=no,fullscreen=no,toolbar=no,status=no,width=400,height=800,top=200,left=20,resizable=1');
    openWindows[openWindows.length] = fbPopup;
    fbPopup.onload = function () {
        fbPopup.onbeforeunload = function () {
            for (var i = 0; i < openWindows.length; i++) {
                if (openWindows[i] == fbPopup) {
                    openWindows.splice(i, 1);
                    break;
                }
            }
        }
    }
}

function windowOnload() {
    setLanguage();
    loadFacebookPosts();
    if (parent.iframeRecheck) {
        parent.iframeRecheck($(parent.document));
    }
}

// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());