var caseNo = window.opener.caseNo;
var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';
var isRead;
var mvcHost = config.mvcHost;
var campaign = window.opener.campaign;
var originalRemarks = '';
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};

// declare the parameters accessing change of fields
var fieldChanged = false;
var changedField = {};

function getCurrentDatetime() {
    var currentDate = new Date();
    var currentTime = new Date();
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1; //January is 0!
    var year = currentDate.getFullYear();
    var hour = currentDate.getHours();
    var minute = currentDate.getMinutes();

    if (day < 10) {
        day = '0' + day;
    }

    if (month < 10) {
        month = '0' + month;
    }

    if (hour < 10) {
        hour = '0' + hour;
    }

    if (minute < 10) {
        minute = '0' + minute;
    }

    currentDate = year + '/' + month + '/' + day;
    currentTime = hour + ':' + minute;

    // set the date and time
    $('#calendar').val(currentDate);
    $('#time').combodate('setValue', currentTime, true); // assign current time to combodate's time field
    fieldChanged = false; // as after set the date and time, fieldChanged has beomce true
}

// load campaign names
function loadCaseReminder(caseNo) {
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/GetCaseReminder',
        data: JSON.stringify({
            "Case_No": Number(caseNo),
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        // retrieve result details and put them in data container
        var reminderDetails = res.details || [];
        //result != "success" or there is no results
        if (!/^success$/i.test(res.result || "")) {
            console.log('error: ' + reminderDetails ? reminderDetails : res);
        } else {
            if (reminderDetails != '') {
                // if the reminder is read, empty all the field
                if (reminderDetails[0].Is_Read == 'Y') {
                    getCurrentDatetime();
                    $('#txt-remarks').val('');
                    isRead = "N";
                } else {
                    var datetime = reminderDetails[0].Scheduled_Time.split("T"); // obtain date and time separately
                    var time = datetime[1].substring(0, datetime[1].length - 3); // obtain time in HH:MM format

                    // set the date to datepicker textbox
                    var date = datetime[0];
                    date = date.replace(/-/g, '/');
                    $('#calendar').val(date);

                    $('#date').combodate('setValue', datetime[0], true); // assign date to date combo
                    if (datetime.length > 1) {
                        $('#time').combodate('setValue', time, true); // assign time to time combo
                    } else {
                        $('#time').combodate('setValue', '00:00', true); // assign 00:00 for unselected time
                    }
                    originalRemarks = reminderDetails[0].Remarks;
                    $('#txt-remarks').val(originalRemarks); // assign the remarks 
                    isRead = reminderDetails[0].Is_Read;
                    fieldChanged = false; // as after set the date and time, fieldChanged has beomce true
                }
            } else {
                getCurrentDatetime(); // assign current datetime to datepicker and time field
                $('#txt-remarks').val(''); // clear the remark field    
            }
            $('#calendar').on('change', function () {
                dateTimeChanged()
            });
            $('#time').on('change', function () {
                dateTimeChanged()
            });
        }
    });
}

// update case reminder
function updateCaseReminder(remarks, scheduledTime) {
    var dataObj = {
        Case_No: Number(caseNo),
        Remarks: remarks,
        Scheduled_Time: scheduledTime,
        Agent_Id: loginId,
        Token: token
    }

    // if never have reminder before, the isRead type should be undefined, is_read is not mandatory field
    if (typeof isRead != 'undefined') {
        dataObj['Is_Read'] = isRead;
    }
    
    $.ajax({
        type: "PUT",
        url: mvcHost + '/mvc' + campaign + '/api/UpdateCaseReminder',
        data: JSON.stringify(dataObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        if (!/^success$/i.test(res.result || "")) {
            if (res.details && res.details == '字串未被辨認為有效的 DateTime。') {
                $('#reminder-date-time-error').text('Invalid Datetime Format');
            } else {
                alert('Reminder Update Failed');
            }
            $('#r-popup-submit-btn').prop('disabled', false);
        } else {
            window.close();
        }
    });
}

function dateTimeChanged() {
    fieldChanged = true;
    var date = $('#calendar').val();

    if (date && date.length > 0) {
        var hh = $('.hour').val() || '';
        if (hh.length == 0) {
            hh = '00';
        }
        var mm = $('.minute').val() || '';
        if (mm.length == 0) {
            mm = '00';
        }
        var dateArr = date.split('/');
        var userdt = new Date(dateArr[0], dateArr[1] - 1, dateArr[2], hh, mm);
        var currdt = new Date();
        // if the date set older than current time
        if (userdt < currdt) {
            $('#reminder-date-time-error').text(langJson['l-reminder-time-unexpected-early']);
            return;
        }
    }
    $('#reminder-date-time-error').text('');
}

var setLanguage = function() {
    $('.l-reminder-scheduled-date-time').text(langJson['l-reminder-scheduled-date-time']);
    $('.l-campaign-date').text(langJson['l-campaign-date']);
    $('.l-campaign-time').text(langJson['l-campaign-time']);
    $('.l-reminder-remarks').text(langJson['l-reminder-remarks']);
    $('.l-general-save').text(langJson['l-general-save']);
    $('.l-general-cancel').text(langJson['l-general-cancel']);    
}

//when the reminder pop-up window is onload
function reminderPopupOnload() {
    setLanguage();
    $('#calendar').attr("placeholder", "yyyy-mm-dd");
    $('#calendar').datepicker({
        showOn: "button",
        buttonImage: "./images/calendar-grid-30.svg",
        buttonStyle: 'height:1000px',
        buttonImageOnly: true,
        buttonText: "Select date",
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true
    });

    $('#time').combodate({
        firstItem: 'name', //show 'hour' and 'minute' string at first item of dropdown
        minuteStep: 5,
        roundUp: true
    })

    // change combodate display
    $('select.minute').children().each(function (idx, e) {
        var thisVal = e.value;
        if (thisVal != undefined && thisVal != '') {
            thisVal = parseInt(thisVal);
            // another value
            var anotherVal = thisVal + 5;
            if (thisVal < 10) {
                thisVal = '0' + String(thisVal);
                if (thisVal == '00') {
                    anotherVal = '05';
                }

            }
            $(e).text(thisVal + ' - ' + anotherVal);
        }
    });

    // for update fb case reminder
    $("#p-header").text(langJson['l-form-scheduled-reminder'] + ' [' + langJson['l-search-case-no'] + ': ' + caseNo + ']');

    // use the case no to retrieve all the field values
    loadCaseReminder(caseNo);
}

// Cancel is clicked
function clearForm() {
    // close window
    window.close();
}

// Submit is clicked
function submitForm() {
    // obtain remarks value
    var remarks = $('#txt-remarks').val();
    if (remarks != originalRemarks) {
        fieldChanged = true;
    }
    // if there isn't any changes, just close the window
    if (!fieldChanged) {
        window.close();
    }

    // obtain date value
    var date = $('#calendar').val();
    // var time = $('#time').val();
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
    var time = hh + ':' + mm;

    // validate if the date field is entered
    if (date.length < 6) {
        $('#reminder-date-time-error').text('The Date field is required');
        $('#r-popup-submit-btn').prop('disabled', false);
    } else {
        // clear previous error message
        $('#reminder-date-time-error').text('');
        // form the scheduled time in YYYY-MM-DD HH:MM format
        date = date.replace(/\//g, '-'); // change date from YYYY/MM/DD to YYYY-MM-DD
        var scheduledTime = date + " " + time;
        updateCaseReminder(remarks, scheduledTime);
    }
}

$(document).ready(function () {
    $("#r-popup-submit-btn").on("click", function () {
        $(this).prop('disabled', true);
        submitForm();
    });

    if (window.opener && window.opener.parent && window.opener.parent.parent && window.opener.parent.parent.addPopupIdle) {
        window.opener.parent.parent.addPopupIdle($(document));
    }
});
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());