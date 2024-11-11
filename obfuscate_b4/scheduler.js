var mvcHost = config.mvcHost;
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var customCompany = sessionStorage.getItem('scrmCustomCompany') || 'no';
var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';
var campaign = customCompany != 'no' ? customCompany : (window.frameElement.getAttribute("campaign") || parent.frameElement.getAttribute("campaign") || parent.campaign || '');
var currentTbl, historyTbl;
var functions = parent.functions;
var isAdmin = (functions.indexOf('Scheduler-Admin-Fn') != -1);

function drawSchedulerTbl(tryCount) {
    
    // if main not yet loaded agent list, the agent name cannot be shown;
    tryCount = (tryCount == undefined ? 0 : tryCount += 1);
    if (parent.agentList.length == 0 && tryCount < 3) {
        setTimeout(function(p) { drawSchedulerTbl(p.tryCount) }.bind(this, { tryCount: tryCount }), 700);
        return;
    }

    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc/api/GetScheduleSetting',
        data: JSON.stringify({ Agent_Id: loginId, Token: token }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function(r) {
        var rDetails = r.details;
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + rDetails);
        } else {
            var schedulerTbl = $('#scheduler-tbl').DataTable({
                data: rDetails,
                lengthChange: false,
                aaSorting: [
                    [5, "desc"]
                ],
                pageLength: 5,
                searching: false,
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
                columns: [{
                    title: '<span title="Scheduler ID">sID</span>',
                    data: "S_Id"
                }, {
                    //     title: "Service", // needed for Site A
                    //     data: "Service"
                    // }, {
                    title: langJson['l-scheduler-message'],
                    data: "Display_Message",
                    render: function(data, type, row) {
                        return '<span title="' + data + '">' + data + '</span>';
                    }
                }, {
                    title: langJson['l-scheduler-type'],
                    data: "Schedule_Type"
                }, {
                    title: langJson['l-scheduler-scheduled-time'],
                    data: "Schedule_Time",
                    render: function(data, type, row) {
                        var theTime = data || '';
                        if (row.Schedule_Type == 'specific') {
                            return theTime.slice(0, 16).replace('T', ' ');
                        } else {
                            return theTime.slice(11, 16);
                        }
                    }
                }, {
                    title: langJson['l-scheduler-created-by'],
                    data: "Created_By",
                    render: function(data, type, row) {
                        return parent.getAgentName(data);
                    }
                }, {
                    title: langJson['l-scheduler-updated-time'],
                    data: "Updated_Time",
                    render: function(data, type, row) {
                        var theTime = data || '';
                        return theTime.replace('T', ' ').replace(/\.\d+/, "");
                    }
                }]
            });
            $('#scheduler-tbl tbody').on('click', 'tr', function() {
                var d = schedulerTbl.row($(this)).data();
                $('#s-id').val(d.S_Id);
                $('#s-service').val(d.Service);
                $('#s-msg').val(d.Display_Message);
                var sType = d.Schedule_Type;
                $('#s-type').val(d.Schedule_Type);
                var scheduledTime = d.Schedule_Time;
                if (sType == 'specific') {
                    $('#s-date-container').removeClass('d-none');
                    var sDate = scheduledTime.slice(0, 10);
                    $('#s-calendar').val(sDate);
                } else {
                    $('#s-date-container').addClass('d-none');
                }
                var sTime = scheduledTime.slice(11, 16);
                $('#s-time').combodate('setValue', sTime, true);
                $('#s-edit-card').show();
                $('#save-scheduler-btn').hide();
                $('#update-scheduler-btn').show();
                $('#del-scheduler-btn').show();
                schedulerTbl.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                $(this).addClass('highlight');
            });
        }
    });
}

function drawCurrentTbl(reload) {
    if (currentTbl && reload == undefined) {
        var originalRecordNo = currentTbl.page.info().recordsTotal;
    }
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc/api/CheckScheduleAlert',
        data: JSON.stringify({ Agent_Id: loginId, Token: token }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function(r) {
        var rDetails = r.details;
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + rDetails);
        } else {
            if (rDetails != undefined) {
                var scheduelerAlarm = parent.$('#scheduler-alarm');
                var curentAlarm = $('#current-alarm');
                if (rDetails.length > 0) {
                    scheduelerAlarm.removeClass('d-none');
                    curentAlarm.removeClass('d-none');
                } else {
                    scheduelerAlarm.addClass('d-none');
                    curentAlarm.addClass('d-none');
                }
            }
            if (currentTbl) {
                // If record length change, will refresh whole table, otherwise will not
                if (reload || (originalRecordNo != rDetails.length)) {
                    $('#current-tbl').DataTable().clear();
                    $('#current-tbl').DataTable().rows.add(rDetails); // Add new data
                    $('#current-tbl').DataTable().columns.adjust().draw();
                    // reload happen when handled or click the tab
                    if (reload == undefined && (originalRecordNo != rDetails.length)) {
                        // when clicking another page or editing a comment, suddently refresh table maybe looks aukward, so will add the warning
                        $('#current-tbl-refreshed').removeClass('d-none');
                        setTimeout(function() { $('#current-tbl-refreshed').addClass('d-none'); }, 2000);
                        // if editing a task, but it is already completed by others, the edit card should be hidden also
                        if ($('#current-edit-card').css('display') != 'none') {
                            var noEditingRecord = true;
                            var editingRId = parseInt($('#r-id').val());
                            for (var i = 0; i < rDetails.lengthChange; i++) {
                                if (editingRId == rDetails[i].R_Id) {
                                    noEditingRecord = false;
                                    break;
                                }
                            }
                            if (noEditingRecord) {
                                $('#current-edit-card').hide();
                            }
                        }
                    }
                } else {
                    $('#current-tbl').DataTable().columns.adjust().draw(false); // false remain in same page
                }
            } else {
                currentTbl = $('#current-tbl').DataTable({
                    data: rDetails,
                    lengthChange: false,
                    aaSorting: [
                        [1, "desc"]
                    ], // Record desc <= latest the record no. larger
                    pageLength: 5,
                    searching: false,
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
                    columns: [{
                            title: '<span title="Scheduler ID">sID</span>',
                            data: "S_Id"
                        }, {
                            title: '<span title="Record ID">rID</span>', // If a scheduler repeated for a few days without any notice, can differ them
                            data: "R_Id"
                        },
                        {
                            //     title: "Service", // needed for Site A
                            //     data: "Service"
                            // }, {
                            title: langJson['l-scheduler-message'],
                            data: "Display_Message",
                            render: function(data, type, row) {
                                return '<span title="' + data + '">' + data + '</span>';
                            }
                        }, {
                            title: langJson['l-scheduler-type'],
                            data: "Schedule_Type"
                        }, {
                            title: langJson['l-scheduler-alert-time'],
                            data: "Alert_Time",
                            render: function(data, type, row) {
                                var theTime = data || '';
                                if (row.Schedule_Type == 'specific') {
                                    return theTime.slice(0, 16).replace('T', ' ');
                                } else {
                                    return theTime.slice(11, 16);
                                }
                            }
                        }
                    ]
                });
                $('#current-tbl tbody').on('click', 'tr', function() {
                    var d = currentTbl.row($(this)).data();
                    $('#r-id').val(d.R_Id);
                    $('#current-msg').text(d.Display_Message);
                    $('#r-comment').val('').focus();
                    $('#current-edit-card').show();
                    $('#save-scheduler-btn').hide();
                    $('#update-scheduler-btn').show();
                    $('#del-scheduler-btn').show();
                    currentTbl.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                    $(this).addClass('highlight');
                });
            }
        }
    });
}

function drawHistoryTbl(type) {
    var sendObj;
    if (type == 'year') {
        sendObj = { Search_Type: "1year", Agent_Id: loginId, Token: token };
    } else {
        sendObj = { Search_Type: "1month", Agent_Id: loginId, Token: token };
    }
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc/api/GetScheduleHistory',
        data: JSON.stringify(sendObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function(r) {
        var rDetails = r.details;
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + rDetails);
        } else {
            if (historyTbl) {
                $('#history-tbl').DataTable().clear();
                $('#history-tbl').DataTable().rows.add(rDetails); // Add new data
                $('#history-tbl').DataTable().columns.adjust().draw();
            } else {
                historyTbl = $('#history-tbl').DataTable({
                    data: rDetails,
                    lengthChange: false,
                    aaSorting: [
                        [7, "desc"]
                    ], // lastest handled record on top
                    pageLength: 5,
                    searching: false,
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
                    columns: [{
                            title: '<span title="Scheduler ID">sID</span>',
                            data: "S_Id"
                        }, {
                            title: '<span title="Record ID">rID</span>', // If a scheduler repeated for a few days without any notice, can differ them
                            data: "R_Id"
                        },
                        {
                            //     title: "Service", // needed for Site A
                            //     data: "Service"
                            // }, {
                            title: langJson['l-scheduler-message'],
                            data: "Display_Message",
                            render: function(data, type, row) {
                                return '<span title="' + data + '">' + data + '</span>';
                            }
                        }, {
                            title: langJson['l-scheduler-type'],
                            data: "Schedule_Type"
                        }, {
                            title: langJson['l-scheduler-alert-time'],
                            data: "Alert_Time",
                            render: function(data, type, row) {
                                var theTime = data || '';
                                if (row.Schedule_Type == 'specific') {
                                    return theTime.slice(0, 16).replace('T', ' ');
                                } else {
                                    return theTime.slice(11, 16);
                                }
                            }
                        }, {
                            title: langJson['l-scheduler-comment'],
                            data: "Comment",
                            render: function(data, type, row) {
                                return '<span title="' + data + '">' + data + '</span>';
                            }
                        }, {
                            title: langJson['l-form-handled-by'],
                            data: "Handle_By",
                            render: function(data, type, row) {
                                return parent.getAgentName(data);
                            }
                        }, {
                            title: langJson['l-scheduler-handled-time'],
                            data: "Handle_Time",
                            render: function(data, type, row) {
                                var theTime = data || '';
                                return theTime.replace('T', ' ').replace(/\.\d+/, "");
                            }
                        }
                    ]
                });

                $('#history-tbl tbody').on('click', 'tr', function() {
                    var d = historyTbl.row($(this)).data();

                    $('#history-msg').text(d.Display_Message);
                    $('#history-comment').text(d.Comment);
                    $('#history-details-card').show();
                    historyTbl.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                    $(this).addClass('highlight');
                });
            }
        }
    });
}
// current tab event
$('#handle-scheduler-btn').on('click', function(event) {
    var rId = parseInt($('#r-id').val());
    var comment = $('#r-comment').val() || '';
    var sendObj = { R_Id: rId, Agent_Id: loginId, Comment: comment, Token: token }

    $.ajax({
        type: "PUT",
        url: mvcHost + '/mvc/api/HandleScheduleAlert',
        data: JSON.stringify(sendObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function(r) {
        if (!/^success$/i.test(r.result || "")) {
            alert('Failed to clear the scheduler');
        } else {
            drawCurrentTbl(true);
            $('#current-edit-card').hide();
        }
    });
});
$('#current-cancel-btn').on('click', function() {
    $('#current-edit-card').hide();
    currentTbl.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
});
// /current tab event
function switchContent(switchType) {
    var lowerContainer = $('#lower-container');
    lowerContainer.empty();
    historyTbl = null;
    if (switchType == 'admin-scheduler-a') {
        $('#current-container').addClass('d-none');
        // add html
        var lowerContainerStr = (
            '<div class="pb-5">' +
            '<div class="card mt-5 mb-3">' +
            '<div class="card-header card-header-text card-header-info">' +
            '<h5 class="my-0">' +
            '<i class="fas fa-user-cog card-header-icon"></i><span class="align-middle">' + langJson['l-scheduler-scheduler-settings'] + '</span>' +
            '</h5>' +
            '</div>' +
            '<div class="card-body">' +
            '<div class="mt-3">' +
            '<table id="scheduler-tbl" class="table table-hover" style="width:100%" data-page-length="5"></table>' +
            '</div>' +
            '<button id="add-scheduler-btn" class="btn btn-warning rounded btn-sm text-capitalize mt-3" style="display:block;">' +
            '<i class="fas fa-plus mr-2"></i><span>' + langJson['l-scheduler-add-scheduler'] + '</span></button>' +
            '</div>' +
            '</div>' +

            '<div id="s-edit-card" class="card mt-0" style="display:none;">' +
            '<div class="card-body">' +
            '<div class="row mb-1 px-3 pt-2 pb-1">' +
            '<input id="s-id" class="d-none" val=""/>' +
            '<input id="s-service" class="d-none" val=""/>' +
            '<label class="mr-2 pl-0 mb-0 py-1">' + langJson['l-scheduler-message'] + '</label>' +
            '<input id="s-msg" class="form-control" type="search" autocomplete="off" max-length="500" />' +
            '</div>' +
            '<div class="row mb-1 px-3 py-1">' +
            '<div class="col-sm-3 pl-0">' +
            '<label class="mr-2 pl-0 mb-0 py-1">' + langJson['l-scheduler-type'] + '</label>' +
            '<select id="s-type" class="form-control">' +
            '<option selected="selected" value="specific">specific</option>' +
            '<option value="daily">daily</option>' +
            '</select>' +
            '</div>' +
            '<div id="s-date-container" class="col-sm-3">' +
            '<label class="mr-2 pl-0 mb-0 py-1">' + langJson['l-campaign-date'] + '</label>' +
            '<div>' +
            '<input id="s-calendar" class="rounded form-control" type="text" placeholder="yyyy-mm-dd" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" />' +
            '</div>' +
            '</div>' +
            '<div class="col-sm-3">' +
            '<label class="mr-2 pl-0 mb-0 py-1">' + langJson['l-campaign-time'] + '</label>' +
            '<input type="text" id="s-time" class=" form-control" data-format="HH:mm" data-template="HH : mm" name="time">' +
            '</div>' +
            '</div>' +
            '<div class="text-center mt-3">' +
            '<button id="update-scheduler-btn" class="btn btn-warning rounded btn-sm text-capitalize mr-2">' +
            '<i class="fas fa-pen mr-2"></i><span>' + langJson['l-scheduler-update-scheduler'] + '</span></button>' +

            '<a id="del-scheduler-btn" class="btn btn-danger rounded btn-sm text-capitalize mr-2" data-toggle="confirmation" data-placement="top" data-popout="true" data-btn-ok-class="btn-info" href="javascript:()">' +
            '<i class="fas fa-trash-alt mr-2"></i><span class="align-middle">' + langJson['l-scheduler-delete-scheduler'] + '</span></a>' +

            '<button id="save-scheduler-btn" class="btn btn-warning rounded btn-sm text-capitalize mr-2">' +
            '<i class="fas fa-plus mr-2"></i><span>' + langJson['l-scheduler-save-scheduler'] + '</span></button>' +
            '<button id="s-cancel-btn" class="btn btn-gray rounded btn-sm text-capitalize mr-2">' +
            '<i class="fas fa-times mr-2"></i></i><span>' + langJson['l-general-cancel'] + '</span></button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
        );

        var dateToday = new Date(); // no past date can be selected
        lowerContainer.append(lowerContainerStr).ready(function() {
            // add schedule btn
            $('#add-scheduler-btn').on('click', function() {
                $('#s-msg').val('').focus();
                $('#s-type').val('specific');
                $('#s-date-container').removeClass('d-none');
                var currentDate = new Date();
                var day = currentDate.getDate();
                var month = currentDate.getMonth() + 1; //January is 0!
                var year = currentDate.getFullYear();
                if (day < 10) {
                    day = '0' + day;
                }

                if (month < 10) {
                    month = '0' + month;
                }
                var YMD = year + '-' + month + '-' + day;
                $('#s-calendar').val(YMD);
                $('#s-time').combodate('setValue', currentDate, true);
                $('#s-edit-card').show();
                $('#save-scheduler-btn').show();
                $('#update-scheduler-btn').hide();
                $('#del-scheduler-btn').hide();
                schedulerTbl.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
            });
            // add type event
            $('#s-type').on('change', function() {
                    var sType = $(this).val();
                    if (sType == 'specific') {
                        $('#s-date-container').removeClass('d-none');
                    } else {
                        $('#s-date-container').addClass('d-none');
                    }
                })
                // set date time
            $('#s-calendar').datepicker({
                showOn: "button",
                buttonImage: "./images/calendar-grid-30.svg",
                buttonStyle: 'height:1000px',
                buttonImageOnly: true,
                buttonText: "Select date",
                dateFormat: 'yy-mm-dd',
                changeMonth: true,
                changeYear: true,
                minDate: dateToday
            });
            $('#s-cancel-btn').on('click', function() {
                $('#s-edit-card').hide();
                schedulerTbl.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
            });
            $('#save-scheduler-btn').on('click', function(event) {
                var service = campaign; // needed for Site A
                var displayMsg = $('#s-msg').val() || '';
                if (displayMsg.length == 0) {
                    alert('Message cannot be empty');
                    event.preventDefault(); // do not submit form
                    return;
                }
                var sType = $('#s-type').val();
                var sDate = '';
                if (sType == 'specific') {
                    sDate = $('#s-calendar').val();
                } else {
                    sDate = '2000-01-01';
                }
                var hh = $('.hour').val() || '';
                if (hh.length == 0) {
                    hh = '00';
                } else {
                    hh = (hh < 10 ? '0' : '') + hh;
                }
                var mm = $('.minute').val() || '';
                if (mm.length == 0) {
                    mm = '00';
                } else {
                    mm = (mm < 10 ? '0' : '') + mm;
                }
                if (sDate.length == 0) {
                    alert('The Date field is required');
                    event.preventDefault(); // do not submit form
                    return;
                }
                var dateTime = sDate + ' ' + hh + ':' + mm;
                var sendObj = {
                    Agent_Id: loginId,
                    Service: service,
                    Display_Message: displayMsg,
                    Schedule_Type: $('#s-type').val(),
                    Schedule_Time: dateTime,
                    Token: token
                }

                $.ajax({
                    type: "POST",
                    url: mvcHost + '/mvc/api/AddScheduleSetting',
                    data: JSON.stringify(sendObj),
                    crossDomain: true,
                    contentType: "application/json",
                    dataType: 'json'
                }).always(function(r) {
                    if (!/^success$/i.test(r.result || "")) {
                        console.log('error: ' + r.details);
                        if (d.details == '字串未被辨認為有效的 DateTime。') {
                            alert('Date Time format is invalid');
                        } else {
                            alert('Failed to update the scheduler');
                        }
                    } else {
                        switchContent('admin-scheduler-a');
                    }
                });
            });
            $('#update-scheduler-btn').on('click', function(event) {
                var displayMsg = $('#s-msg').val() || '';
                if (displayMsg.length == 0) {
                    alert('Message cannot be empty');
                    event.preventDefault(); // do not submit form
                    return;
                }
                var sType = $('#s-type').val();
                var sDate = '';
                if (sType == 'specific') {
                    sDate = $('#s-calendar').val();
                } else {
                    sDate = '2000-01-01';
                }
                var hh = $('.hour').val() || '';
                if (hh.length == 0) {
                    hh = '00';
                } else {
                    hh = (hh < 10 ? '0' : '') + hh;
                }
                var mm = $('.minute').val() || '';
                if (mm.length == 0) {
                    mm = '00';
                } else {
                    mm = (mm < 10 ? '0' : '') + mm;
                }
                if (sDate.length == 0) {
                    alert('The Date field is required');
                    event.preventDefault(); // do not submit form
                    return;
                }
                var dateTime = sDate + ' ' + hh + ':' + mm;
                var sendObj = {
                    S_Action: "Amend",
                    S_Id: parseInt($('#s-id').val()),
                    Agent_Id: loginId,
                    Service: $('#s-service').val(),
                    Display_Message: displayMsg,
                    Schedule_Type: $('#s-type').val(),
                    Schedule_Time: dateTime,
                    Token: token
                }

                $.ajax({
                    type: "PUT",
                    url: mvcHost + '/mvc/api/UpdateScheduleSetting',
                    data: JSON.stringify(sendObj),
                    crossDomain: true,
                    contentType: "application/json",
                    dataType: 'json'
                }).always(function(r) {
                    if (!/^success$/i.test(r.result || "")) {
                        console.log('error: ' + r.details);
                        if (d.details == '字串未被辨認為有效的 DateTime。') {
                            alert('Date Time format is invalid');
                        } else {
                            alert('Failed to update the scheduler');
                        }
                    } else {
                        switchContent('admin-scheduler-a');
                    }
                });
            });
            $('[data-toggle=confirmation]').confirmation({
                rootSelector: '[data-toggle=confirmation]',
                popout: true,
                title: langJson['l-general-are-you-sure'],
                btnOkLabel: langJson['l-general-ok-label'],
                btnCancelLabel: langJson['l-general-cancel-label']
            });
            $('#del-scheduler-btn').on('click', function(event) {
                var sendObj = {
                    S_Action: "Delete",
                    S_Id: parseInt($('#s-id').val()),
                    Agent_Id: loginId,
                    Token: token
                }

                $.ajax({
                    type: "PUT",
                    url: mvcHost + '/mvc/api/UpdateScheduleSetting',
                    data: JSON.stringify(sendObj),
                    crossDomain: true,
                    contentType: "application/json",
                    dataType: 'json'
                }).always(function(r) {
                    if (!/^success$/i.test(r.result || "")) {
                        alert('Failed to delete the scheduler');
                    } else {
                        switchContent('admin-scheduler-a');
                    }
                });
            });
        });
        $('#s-time').combodate('setValue', dateToday, true); // assign current time to combodate's time field
        drawSchedulerTbl();
    } else if (switchType == 'current-task-a') {
        $('#current-container').removeClass('d-none');
        drawCurrentTbl(true);
        $('#current-edit-card').hide();
    } else if (switchType == 'history-task-a') {
        $('#current-container').addClass('d-none');
        // add html
        var lowerContainerStr = (
            '<div class="pb-5">' +
            '<div class="card mt-5 mb-3">' +
            '<div class="card-header card-header-text card-header-info" style="padding:12.5px;">' +
            '<h5 class="my-0 d-inline" style="line-height:31px;">' +
            '<i class="fas fa-history card-header-icon"></i><span class="align-middle">' + langJson['l-scheduler-history'] + '</span>' +
            '</h5>' +
            '<ul class="nav nav-tabs float-right" data-tabs="tabs">' +
            '<li id="month-nav-item" class="nav-item">' +
            '<p class="nav-link active show header-btn" data-toggle="tab">' + langJson['l-scheduler-within-a-month'] + '</p>' +
            '</li>' +
            '<li id="year-nav-item" class="nav-item">' +
            '<p class="nav-link header-btn" data-toggle="tab">' + langJson['l-scheduler-within-a-year'] + '</p>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '<div class="card-body">' +
            '<div class="mt-3">' +
            '<table id="history-tbl" class="table table-hover" style="width:100%"></table>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div id="history-details-card" class="card mt-0 mb-3" style="display:none;">' +
            '<div class="card-body">' +

            '<div class="mb-1 pt-2 pb-1">' +
            '<label>' + langJson['l-scheduler-message'] + '</label>' +
            '<div id="history-msg"></div>' +
            '</div>' +

            '<div class="mb-1 pt-2 pb-1">' +
            '<label>' + langJson['l-scheduler-comment'] + '</label>' +
            '<div id="history-comment"></div>' +
            '</div>' +


            '<div class="text-center mt-3">' +

            '<button id="history-cancel-btn" class="btn btn-gray rounded btn-sm text-capitalize mr-2">' +
            '<i class="fas fa-times mr-2"></i></i><span>' + langJson['l-scheduler-close'] + '</span></button>' +

            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
        );

        lowerContainer.append(lowerContainerStr).ready(function() {
            drawHistoryTbl('month');
            $('#month-nav-item').on('click', function() {
                $('#history-details-card').hide(); // after switch duration tab, no need to see details card
                drawHistoryTbl('month');
            });
            $('#year-nav-item').on('click', function() {
                $('#history-details-card').hide(); // after switch duration tab, no need to see details card
                drawHistoryTbl('year');
            });
            $('#history-cancel-btn').on('click', function() {
                historyTbl.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                $('#history-details-card').hide();
            });
        });
    }
}

$(document).ready(function() {
    // default load current
    $('#current-task-a').click();
    if (isAdmin) {
        $('#current-task-li').before('<li class="nav-item"><a id="admin-scheduler-a" class="nav-link pt-2" href="#" data-toggle="tab" aria-selected="false"><i class="fas fa-user-cog mr-2"></i>' + langJson['l-scheduler-admin'] + '</a></li>');
        $('#current-task-li').after('<li class="nav-item"><a id="history-task-a" class="nav-link pt-2" href="#" data-toggle="tab" aria-selected="false"><i class="fas fa-history mr-2"></i>' + langJson['l-scheduler-history'] + '</a></li>');
    }
    $('.nav-link').on('click', function() {
        var switchType = $(this).attr('id');
        switchContent(switchType);
    });
    if (parent.iframeRecheck) {
        parent.iframeRecheck($(parent.document));
    }
});

// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());

function windowOnload() {
    setLanguage();
}

function setLanguage() {
    $('.l-scheduler-current').html('<iclass="fas fa-tasks mr-2"></i>' + langJson['l-scheduler-current'] + '<i id="current-alarm" class="fas fa-bell ml-1 text-danger d-none"></i>');
    $('.l-scheduler-current').text(langJson['l-scheduler-current']);
    $('.l-scheduler-message').text(langJson['l-scheduler-message']);
    $('.l-scheduler-comment').text(langJson['l-scheduler-comment']);
    $('.l-scheduler-comment-and-clear').text(langJson['l-scheduler-comment-and-clear']);
    $('.l-general-cancel').text(langJson['l-general-cancel']);


}