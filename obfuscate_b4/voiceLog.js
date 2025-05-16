if (sessionStorage.getItem('scrmLoggedIn') == null) {
    var scrmLanguage = sessionStorage.getItem('scrmLanguage') || 'EN';
    if (scrmLanguage == 'TC') {
        alert('您尚未登入');
    } else {
        alert("You are not logged in");
    }
    window.location.href = 'login.html';
} else {
    $('body').removeClass('d-none'); // as don't want no premission to login people see anything
}

var functions = sessionStorage.getItem('scrmFunctions');

var canDownloadVoice = functions.indexOf('Download-Voice') != -1;
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var voiceTblBuilt = false; 
var wiseHost = config.wiseHost;

$('#voice-start-date').datepicker({
    showOn: "button",
    buttonImage: "./images/calendar-grid-30.svg",
    buttonImageOnly: true,
    buttonText: "Select date",
    dateFormat: 'yy-mm-dd',
    changeMonth: true,
    changeYear: true
});
$("#voice-start-date").datepicker().datepicker("setDate", new Date());
$('#voice-end-date').datepicker({
    showOn: "button",
    buttonImage: "./images/calendar-grid-30.svg",
    buttonImageOnly: true,
    buttonText: "Select date",
    dateFormat: 'yy-mm-dd',
    changeMonth: true,
    changeYear: true
});
$("#voice-end-date").datepicker().datepicker("setDate", new Date());

function searchVoiceClicked() {
    var alertMsg = "";
    var hasError = false;
    var sendObj = {};
    var startDate = $('#voice-start-date').val() || '';
    var endDate = $('#voice-end-date').val() || '';
    var formatValid = true;
    // Verify start date and end date filled
    if (startDate.length == 0) {
        alertMsg += "Start Date cannot be empty";
        hasError = true;
    //} else { // 20250410 'If' statement should not be the only statement in 'else' block
        //if (!/^\d{4}(-|\/)(0?[1-9]|1[012])(-|\/)(0?[1-9]|[12][0-9]|3[01])$/.test(startDate)) {        // 20250326 Replace this alternation with a character class
        //if (!/^\d{4}(-\/)(0?[1-9]|1[012])(-\/)(0?[1-9]|[12][0-9]|3[01])$/.test(startDate)) {   
    } else if (!/^\d{4}[-\/](0?\d|1[0-2])[-\/](0?\d|[12]\d|3[01])$/.test(startDate)) {     // 20250408    Use concise character class syntax '\d' instead of '[0-9]'. 
            
            if (alertMsg.length > 0) {
                alertMsg += "\n"
            }
            alertMsg += 'Start Date format is invalid';
            hasError = true;
            formatValid = false;
        //}// 20250410 for else if 
    }
    if (endDate.length == 0) {
        if (alertMsg.length > 0) {
            alertMsg += "\n"
        }
        alertMsg += "End Date cannot be empty";
        hasError = true;
    //} else {
        //if (!/^\d{4}(-|\/)(0?[1-9]|1[012])(-|\/)(0?[1-9]|[12][0-9]|3[01])$/.test(endDate)) {      // 20250326 Replace this alternation with a character class
        //if (!/^\d{4}(-\/)(0?[1-9]|1[012])(-\/)(0?[1-9]|[12][0-9]|3[01])$/.test(endDate)) {
    } else if (!/^\d{4}[-\/](0?\d|1[0-2])[-\/](0?\d|[12]\d|3[01])$/.test(endDate)) {     // 20250408    Use concise character class syntax '\d' instead of '[0-9]'. 
    // 20250410 for 'If' statement should not be the only statement in 'else' block
            if (alertMsg.length > 0) {
                alertMsg += "\n"
            }
            alertMsg += 'End Date format is invalid';
            hasError = true;
            formatValid = false;
        //}// 20250410 for else if 
    }
    // if format is not valid cannot compare this
    if (formatValid && startDate.length > 0 && endDate.length > 0) {
        startDate = startDate.replace(/-/g, '/');
        endDate = endDate.replace(/-/g, '/');
        var startDateArr = startDate.split('/');
        var endDateArr = endDate.split('/');
        var startMM = startDateArr[1].charAt(0) == '0' ? startDateArr[1].charAt(1) : startDateArr[1];
        var startDD = startDateArr[2].charAt(0) == '0' ? startDateArr[2].charAt(1) : startDateArr[2];
        var endMM = endDateArr[1].charAt(0) == '0' ? endDateArr[1].charAt(1) : endDateArr[1];
        var endDD = endDateArr[2].charAt(0) == '0' ? endDateArr[2].charAt(1) : endDateArr[2];
        var startDateFormat = new Date(startDateArr[0], startMM - 1, startDD, '00', '00');
        var endDateFormat = new Date(endDateArr[0], endMM - 1, endDD, '00', '00');
        // if the date set older than current time
        if (startDateFormat > endDateFormat) {
            if (alertMsg.length > 0) {
                alertMsg += "\n"
            }
            alertMsg += "End Date cannot set earlier than Start Date";
            hasError = true;
        }
    }
    if (hasError) {
        alert(alertMsg);
        return;
    }
    sendObj["startDate"] = startDate;
    sendObj["endDate"] = endDate;
    var staffNo = $('#voice-staff-no').val() || "";
    var phoneNo = $('#voice-phone-no').val() || "";
    var serviceId = config.designatedServiceId || $('#voice-service-select').val() || "";
    if (staffNo.length > 0) {
        sendObj["agentId"] = staffNo;
    }
    if (phoneNo.length > 0) {
        sendObj["phoneNo"] = phoneNo;
    }
    if (serviceId.length > 0) {
        sendObj["serviceId"] = serviceId;
    }

    // empty container first, to make it like refreshed
    $('#search-voice-tbl').addClass('d-none');

    $.ajax({
        type: "POST",
        url: config.wiseUrl + '/api/Call/GetVoiceLogEx',
        data: JSON.stringify(sendObj),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).always(function (r) {
        // If no such record r.result is fail also, if format wrong r.data is the reason
        var tblData = r.result == "fail" ? [] : r.data;

        if (voiceTblBuilt) {
            var voiceTbl = $('#search-voice-tbl');
            voiceTbl.DataTable().clear();
            voiceTbl.DataTable().rows.add(tblData); // Add new data
            voiceTbl.DataTable().columns.adjust().draw(); // Redraw the DataTable
        } else {
            buildVoiceTbl(tblData);
            voiceTblBuilt = true;
        }
        $('#search-voice-tbl').removeClass('d-none');
    });
}

$('#voice-fm-container input').on('keypress', function (e) {

    // if pressed enter
    if (e.keyCode == 13) {
        searchVoiceClicked();
    }
})

function buildVoiceTbl(tblData) {
    $('#search-voice-tbl').DataTable({
        data: tblData,
        lengthChange: false,
        aaSorting: [
            [2, "desc"]
        ],
        pageLength: 5,
        searching: false,
        columns: [{
                title: 'ID',
                data: "CallId",
            },
            {
                title: '<span class="text-success"><i class="fas fa-arrow-right me-1"></i><i class="fas fa-phone-volume"></i></span> In /<div><span class="text-danger"><i class="fas fa-arrow-left me-1"></i><i class="fas fa-phone-volume"></i></span> Out /</div><div><span class="text-info"><i class="fas fa-exchange-alt"></i></span> Intercom</div>',
                data: "CallType",
                className: 'btnColumn'
            },
            {
                title: "Time Stamp",
                data: "TimeStamp",
                className: 'btnColumn'
            }, {
                title: "Agent",
                data: "StaffNo",
                className: 'btnColumn'
            },
            {
                title: "Customer Phone No.",
                data: "PhoneNo",
                orderable: false,
                className: 'btnColumn'
            },
            {
                title: "Service",
                data: "ServiceName",
                className: 'btnColumn'
            },
            {
                title: "Voice",
                className: 'pr-5' // this is needed to shows the whole voice
            }
        ],

        // Declare column definitions
        columnDefs: [{
            targets: 1,
            orderable: false,
            render: function (data, type, row) {
                if (data == 'Inbound') {
                    return '<span class="text-success"><i class="fas fa-arrow-right me-1"></i><i class="fas fa-phone-volume"></i></span>'
                } else if (data == 'Conference') {
                    return '<span class="text-info"><i class="fas fa-exchange-alt"></i></span>'
                } else {
                    return '<span class="text-danger"><i class="fas fa-arrow-left me-1"></i><i class="fas fa-phone-volume"></i></span>'
                }
            }
        }, {
            targets: 2,
            render: function (data, type, row) {
                return data.replace('T', ' ');
            }
        }, {
            targets: 6,
            orderable: false,
            render: function (data, type, row) {
                var voiceArr = row.VoiceFiles;
                var voiceStr = "";
                for (var i = 0; i < voiceArr.length; i++) {
                    voiceStr += ('<div><audio controls id="voice-' + i + '" ><source src="' + voiceArr[i].FileUrl + '" type="audio/wav"' + (canDownloadVoice ? '' : ' controlsList="nodownload"') + '></audio></div>')
                }
                return voiceStr;
            }
        }],

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
        }
    });
}


function loadServiceList() {
    $.ajax({
        type: "POST",
        url: config.wiseUrl + '/api/Config/GetServiceList',
        data: JSON.stringify({}),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            console.log('error in GetServiceList');
            console.log(r.details);
        } else {	// } { 20250516 Nested block is redundant.
            var serviceArr = r.data;

            // if just 1 service no need to have this select, and if not the selection value, default will show the log from all services
            if (typeof config.designatedServiceId == 'undefined' && serviceArr && serviceArr.length > 1) {
                var selectedStr = serviceArr.length == 1 ? ' selected="true"' : '';

                for (let serviceObj of serviceArr) {

                    // init Voice Log Select
                    $('#voice-service-select').append(
                        '<option value=' + serviceObj.ServiceID + selectedStr + '>' + serviceObj.ServiceDesc + '</option>'
                    );
                }

                // if have service, or after loading service, show the select box
                $('#voice-select-container').removeClass('d-none');
            }
        }
    });
}

$(document).ready(function () {
    loadServiceList();
})