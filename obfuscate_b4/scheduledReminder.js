var reminderTable = null;
var overdueTable = null;
var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';
var selectedCompany = '';
var customCompany = sessionStorage.getItem('scrmCustomCompany') || 'no';
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var functions = sessionStorage.getItem('scrmFunctions') || '';
var canSeeOthersReminder = functions.indexOf('Overdue-Reminder-Fn') != -1;
var mvcHost = config.mvcHost;
var mvcUrl = config.mvcUrl;

// social media got msg history event
function gotMsgHistory(msgObj) { // got event from wise
    var inputFormFrame = document.getElementById('input-form');
    var casePopup = inputFormFrame.contentWindow.caseRecordPopup;
    casePopup.window.generateSocialHistory(msgObj);
}

function setLanguage() {
    $('.l-reminder-scheduled-reminder-list').text(langJson['l-main-scheduled-reminder']);
    $('.l-reminder-please-select-agent').text(langJson['l-reminder-please-select-agent']);
    $('.l-reminder-update').text(langJson['l-reminder-update']);
    $('[data-bs-toggle=confirmation]').confirmation({
        rootSelector: '[data-bs-toggle=confirmation]',
        popout: true,
        title: langJson['l-general-are-you-sure'],
        btnOkLabel: langJson['l-general-ok-label'],
        btnCancelLabel: langJson['l-general-cancel-label']
    });
}

function UpdateCase(rowData) {
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + selectedCompany + '/api/CaseManualSearch',
        data: JSON.stringify({
            "anyAll": "all",
            "Is_Valid": "Y",
            "searchArr": [{
                "list_name": "Case List",
                "field_name": "Case_No",
                "logic_operator": "is",
                "value": rowData.Case_No,
                "field_type": "number"
            }],
            Agent_Id: loginId,
            Token: token
        }),
        contentType: "application/json",
        dataType: 'json',
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log(r.details || r);
            } else {
                var customerData = r.details[0];
                window.type = 'newUpdate';
                window.customerData = customerData;
                $('#scheduled-reminder-list').addClass('d-none');
                $('body').append('<iframe id="input-form" campaign="' + selectedCompany + '" style="WIDTH: 100%; border: none;" opentype="scheduled-reminder" src="./campaign/' + selectedCompany + '/inputForm.html" height="100%" customerid="' + customerData.Customer_Id + '" internalcaseno="' + customerData.Internal_Case_No + '" caseno="' + customerData.Case_No + '"></iframe>');
            }
        },
        error: function (r) {
            console.log(r.details || r);
        }
    });
}

function loadScheduledReminder() {
    if (selectedCompany.length > 0) {
        $('#input-form').remove();
        $('#scheduled-reminder-list').removeClass('d-none');
        var postObj = {
            "Case_No": null,
            "Is_Read": "N",
            Agent_Id: loginId,
            Token: token,
            To_Check_Id: loginId
        };

        if (canSeeOthersReminder) {
            delete postObj.To_Check_Id; // if no this property can see every agents
            $('#select-section').removeClass('d-none'); // select agents dropdown
        }

        $.ajax({
            type: "POST",
            url: mvcHost + '/mvc' + selectedCompany + '/api/GetCaseReminder',
            data: JSON.stringify(postObj),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (res) {
            if (!/^success$/i.test(res.result || "")) {
                console.log("Error in loadScheduledReminder." + res ? res.details : '');
            } else {
                var reminderContent = res.details || [];
                var timeNow = new Date();
                var gotOverdue = false;

                // if ealier than now, overdue
                reminderContent.map(function (item) {
                    var sqlScheduledTime = item.Scheduled_Time;
                    var t = sqlScheduledTime.split(/[-T:]/);
                    var jsScheduledTime = new Date(t[0], t[1] - 1, t[2], t[3], t[4]);
                    if (jsScheduledTime < timeNow) {
                        item.isOverdue = true;
                        gotOverdue = true;
                        return item;
                    } else {
                        item.isOverdue = false;
                        return item;
                    }
                })

                if (gotOverdue) {
                    parent.$('#scheduled-reminder-alarm').removeClass('d-none');
                } else {
                    parent.$('#scheduled-reminder-alarm').addClass('d-none');
                }

                if (reminderTable) {
                    reminderTable.clear();
                    reminderTable.rows.add(reminderContent); // Add new data
                    reminderTable.columns.adjust().draw(); // Redraw the DataTable
                } else {

                    // obtain content of "details"
                    reminderTable = $('#reminder-table').DataTable({

                        // basic configs
                        data: reminderContent,
                        aaSorting: [
                            [1, "asc"]
                        ],
                        pageLength: 10, // 10 rows per page
                        lengthChange: false,
                        searching: true,
                        sDom: 'tip', // to hide the search

                        // declare columns
                        columns: [{
                            title: "",
                            className: 'btnColumn'
                        }, {
                            title: langJson['l-reminder-scheduled-date-time'],
                            className: 'col-w-15p',
                            data: "Scheduled_Time"
                        }, {
                            title: langJson['l-reminder-agent-id'],
                            className: 'col-w-5p',
                            data: "Created_By"
                        }, {
                            title: langJson['l-reminder-agent-name'],
                            className: 'col-w-10p',
                        }, {
                            title: langJson['l-reminder-remarks'],
                            data: "Remarks"
                        }, {
                            title: langJson['l-reminder-done'],
                            className: 'btnColumn'
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
                            targets: 0,
                            orderable: false,
                            defaultContent: '<i title="' + langJson['l-search-update-case'] + '" class="fas fa-edit table-btn select" data-bs-toggle="tooltip"></i>'
                        }, {
                            targets: 1,
                            render: function (data, type, row) {
                                var datetime = data.replace('T', ' ').substring(0, 16); // replace the T
                                if (row.isOverdue) {
                                    return datetime + '<i class="fas fa-bell ms-2 text-danger" title="Overdue Reminder"></i>';   
                                } else {
                                    return datetime;
                                }
                            }
                        }, {
                            targets: 3,
                            render: function (data, type, row) {
                                return parent.getAgentName(row.Created_By)
                            }
                        }, {
                            targets: 4,
                            render: function (data, type, row) {
                                return '<div class="text-wrap">' + data + '</div>'
                            }
                        }, {

                            // check box for reading reminders
                            targets: 5,
                            render: function (data, type, row) {

                                // each check box has the case no as the id and value
                                return '<div class="form-check" style="margin-top:-16px">' +
                                    '<label class="form-check-label">' +
                                    '<input class="form-check-input" type="checkbox" id="' + row.Case_No + '" value="' + row.Case_No + '">' +
                                    '<span class="form-check-sign"><span class="check" data-bs-toggle="tooltip" data-bs-placement="right" title="' + langJson['l-reminder-mark-as-read'] + '"></span></span></label></div>';
                            },
                            orderable: false
                        }
                        ]
                    });

                    // highlight row upon clicking
                    $('#reminder-table tbody').on('click', 'tr', function (e) {
                        reminderTable.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                        $(this).addClass('highlight');
                    });

                    $('#reminder-table tbody').on('click', '.select', function () {
                        var data = reminderTable.row($(this).parents('tr')).data();
                        UpdateCase(data);
                        event.preventDefault();
                    });

                    // every time load will show all agents, the drop down need to change
                    $('#select-agent').val('');
                }
            }
        })
    }
}

function loadAgentDropDown() {
    $.ajax({
        type: "POST",
        url: mvcUrl + '/api/GetLogin',
        crossDomain: true,
        contentType: "application/json",
        data: JSON.stringify({ Agent_Id: loginId, Token: token }),
        dataType: 'json'
    }).always(function (res) {

        // retrieve result details and put them in data container
        var agentDetails = res.details;

        // result != "success" or there is no results
        if (!/^success$/i.test(res.result || "")) {
            console.log('error: ' + agentDetails ? agentDetails : res);
        //} else {  //20250410 'If' statement should not be the only statement in 'else' block
        } else if (agentDetails != undefined) {

                // append 'All' to the dropdown list
                $('#select-agent').append(
                    $('<option />').text('All').val('')
                );

                // iterate through roleList to obtain role names
                for (let agentObj of agentDetails) {

                    // assign seller id to local variables
                    var theAgentId = agentObj.AgentID;
                    var agentName = agentObj.AgentName;
                    var accountStatus = agentObj.Account_status;

                    if (accountStatus == "Active") {

                        // append options to select tag
                        $('#select-agent').append(
                            $('<option />').text(agentName + ' (' + theAgentId + ')').val(theAgentId)
                        );
                    }

                }

                $('#select-agent').on('change', function () {
                    var selectedAgentId = $(this).val() == '' ? 0 : $(this).val();
                    if (selectedAgentId != 0) {
                        reminderTable
                            .column(3) // 3 is the index of agent
                            .search(selectedAgentId)
                            .draw();
                        overdueTable
                            .column(3) // 3 is the index of agent
                            .search(selectedAgentId)
                            .draw();
                    } else {
                        reminderTable.columns(3).search('', true, false).draw();
                        overdueTable.columns(3).search('', true, false).draw();
                    }
                    event.preventDefault(); // to prevent once again
                });
            //}// 20250410 for else if
        }
    });
}

function markAsRead() {

    // for filted records, even checked before filtering, will not be counted by jQuery
    if ($('input:checkbox:checked').length == 0) {
        alert('No any cases selected');
        return;
    }

    // for each checked case, update the "Is_Read" value for that case no
    $('input:checkbox:checked').each(function () {
        var caseNoInt = parseInt(this.value);

        // update the case_reminder table's "Is_Read" value to "Y" using the case no
        $.ajax({
            type: "PUT",
            url: mvcHost + '/mvc' + selectedCompany + '/api/UpdateCaseReminder',
            data: JSON.stringify({
                Case_No: caseNoInt,
                Is_Read: "Y",
                Agent_Id: loginId,
                Token: token
            }),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (res) {
            if (!/^success$/i.test(res.result || "")) {
                console.log("error /n" + res ? res : '');
            } else {
                loadScheduledReminder();
            }
        });
    });
}

function returnToSearch() {
    var theInputForm = $('#input-form');
    theInputForm.remove();
    $('#scheduled-reminder-list').removeClass('d-none');
}

function windowOnload() {
    setLanguage();
    if (canSeeOthersReminder) {
        loadAgentDropDown(); // load the drop down list of agents
    }
    if (customCompany != 'no') {
        selectedCompany = customCompany;

        // 10-min intervals will start 10 mins later, so need to load fist, too strange to jsut overdue reminder, so need ot load scheduled reminder also
        loadScheduledReminder(); // need to load scheduled 
        $('#scheduled-reminder-list').removeClass('d-none');
    } else {
        var sessionCampaignList = sessionStorage.getItem('scrmCampaignList') || [];
        var campaignList = JSON.parse(sessionCampaignList);
        var optionStr = '<option disabled="disabled" selected="selected"></option>';
        var authorizedCompanies = sessionStorage.getItem('scrmCompanies') || '';

        // set option and onChange function for Contact List Manual Search's dropdown
        for (let option of campaignList) {
            if (option.Field_Display == 'DEMO') {
                continue;
            }
            if (authorizedCompanies.indexOf(option.Field_Name) != -1) {
                optionStr += '<option value=' + option.Field_Name + '>' + option.Field_Display + '</option>';
            }
        }
        $('body').prepend('<div class="mb-3 d-flex align-items-center ms-4 mt-2 mb-0 text-info"><i class="far fa-building me-2"></i><select id="st-campaign-select" class="form-select">' + optionStr + '</select></div>');
        $('#st-campaign-select').change(function () {
            selectedCompany = $(this).val();
            loadScheduledReminder(); // load reminder after select of company
            $('#scheduled-reminder-list').removeClass('d-none');
        });
    }

    $('[data-bs-toggle=confirmation]').confirmation({
        rootSelector: '[data-bs-toggle=confirmation]'
    });

    if (parent.iframeRecheck) {
        parent.iframeRecheck($(parent.document));
    }
}
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());