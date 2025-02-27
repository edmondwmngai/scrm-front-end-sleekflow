var customCompany = sessionStorage.getItem('scrmCustomCompany') || 'no';
var loginId = parseInt(sessionStorage.getItem('scrmAgentId')) || -1;
var token = sessionStorage.getItem('scrmToken') || '';
var selectedCompany = '';
var repeatedCustomerObj = {};
var difficultCustomerObj = {};
var repeatedCallerObj = {};
var difficultCallerObj = {};
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var wiseHost = config.wiseHost;
// determine checkbox actions upon each click
function setLanguage() {
    $('.l-form-add').text(langJson['l-form-add']);
    $('.l-form-add-repeated-sender').text(langJson['l-form-add-repeated-sender']);
    $('.l-form-add-repeated-caller').text(langJson['l-form-add-repeated-caller']);
    $('.l-form-add-special-sender').text(langJson['l-form-add-special-sender']);
    $('.l-form-add-special-caller').text(langJson['l-form-add-special-caller']);
    $('.l-form-accessCode').text(langJson['l-form-accessCode']);
    $('.l-email-content').text(langJson['l-email-content']);
    $('.l-email-sender').text(langJson['l-email-sender']);
    $('.l-email-subject').text(langJson['l-email-subject']);
    $('.l-form-edit').text(langJson['l-form-edit']);
    $('.l-form-email').text(langJson['l-form-email']);
    $('.l-form-full-name').text(langJson['l-form-full-name']);
    $('.l-form-mobile').text(langJson['l-form-mobile']);
    $('.l-form-other').text(langJson['l-form-other']);
    $('.l-form-remarks').text(langJson['l-form-remarks']);
    $('.l-form-save').text(langJson['l-form-save']);
    $('.l-form-title').text(langJson['l-form-title']);
    $('.l-st-difficult-caller-list').text(langJson['l-st-difficult-caller-list']);
    $('.l-st-difficult-sender-list').text(langJson['l-st-difficult-sender-list']);
    $('.l-st-repeated-sender-list').text(langJson['l-st-repeated-sender-list']);
    $('.l-st-junk-mail-history').text(langJson['l-st-junk-mail-history']);
    $('.l-st-junk-mail-list').text(langJson['l-st-junk-mail-list']);
    $('.l-st-repeated-caller-list').text(langJson['l-st-repeated-caller-list']);
    $('.l-st-repeated-list').text(langJson['l-st-repeated-list']);
    $('.l-st-special-list').text(langJson['l-st-special-list']);
    $('.l-form-repeated-sender').text(langJson['l-form-repeated-sender']);
    $('.l-form-repeated-caller').text(langJson['l-form-repeated-caller']);
    $('.l-form-difficult-sender').text(langJson['l-form-difficult-sender']);
    $('.l-form-difficult-caller').text(langJson['l-form-difficult-caller']);
    $('.l-st-add-to-list').text(langJson['l-st-add-to-list']);
    $('.l-st-delete').text(langJson['l-st-delete']);
    $('.l-st-delete-from-list').text(langJson['l-st-delete-from-list']);
    $('.l-st-email').text(langJson['l-st-email']);

    /*
    $('[data-bs-toggle=confirmation]').confirmation({
        rootSelector: '[data-bs-toggle=confirmation]',
        popout: true,
        title: langJson['l-general-are-you-sure'],
        btnOkLabel: langJson['l-general-ok-label'],
        btnCancelLabel: langJson['l-general-cancel-label']
    });
    */
}

function restorePage() {
    $('.active').removeClass('active');
    $('.show').removeClass('show');
}

function loadCheckboxActions(allCheckboxes, selectAllId) {
    //var companyItems = $('#' + idType + '-section');
    $(allCheckboxes).on('change', 'input[type=checkbox]', function (event) {
        // caching the changed element:
        var changed = event.target,
            // caching:
            checkboxes = $(allCheckboxes)
                // <input> elements within the #' + idType + '-section of type=checkbox:
                .find('input[type=checkbox]')
                // which do not match the '#' + idType + '-emails' selector:
                .not(selectAllId);
        // if the changed element has the id of '' + idType + '-emails':
        if (changed.id === selectAllId) {
            // we update the 'checked' property of the cached check-box inputs to reflect the checked stat of the '#' + idType + '-emails' element:
            checkboxes.prop('checked', changed.checked);
        } else {
            // here we check that the number of checked checkboxes is equal to the number of check-boxes (effectively
            // finding out whether all, or not-all, check-boxes are checked:
            var allChecked = checkboxes.length === checkboxes.filter(':checked').length

            // here we update the 'checked' property of the
            // '' + idType + '-emails' check-box to true (if the number of checked check-boxes is equal to the
            // number of check-boxes) or false (if the number of checked check-boxes is not equal to the
            // number of check-boxes):
            $(selectAllId).prop(
                'checked', allChecked
            );
        }
    });
    // click "All..." checkboxes will check/uncheck all the values
    $(selectAllId).change(function () {
        $(allCheckboxes + ' input[type="checkbox"]').prop('checked', $(this).prop("checked"))
    });
}

function callSetting(callType, apiName, isValid) {
    var dataObj = {};
    var idType = callType.toLowerCase().replace(' ', '-');
    if (apiName == 'GetCallFilter') {
        dataObj = {
            "Filter_Type": callType,
            "Agent_Id": loginId,
            Token: token
        }
        var repeatedCallerTableSection = $('#' + idType + '-table-section');
        repeatedCallerTableSection.children().remove();
        repeatedCallerTableSection.append('<table id="' + idType + '-table" class="table table-hover" style="width:100% " data-page-length="5"></table>');
    } else if (apiName == 'UpdateCallFilter') {
        var filterId = callType == "Repeated Caller" ? repeatedCallerObj.Filter_Id : difficultCallerObj.Filter_Id;
        if (isValid == 'N') {
            dataObj = {
                "Filter_Id": Number(filterId),
                "Filter_Type": callType,
                "Is_Valid": 'N',
                "Agent_Id": loginId,
                Token: token
            }
        } else {
            dataObj = {
                "Filter_Id": Number(filterId),
                "Filter_Type": callType,
                "Is_Valid": 'Y',
                "Agent_Id": loginId,
                "Last_Name": $('#' + idType + '-full-name').val(),
                "Title": $('#' + idType + '-title').val(),
                "Mobile_No": $('#' + idType + '-mobile').val(),
                "Other_Phone_No": $('#' + idType + '-other').val(),
                "Remark": $('#' + idType + '-remarks').val(),
                Token: token
            }
        }
    } else if (apiName = 'AddCallFilter') {
        dataObj = {
            "Filter_Type": callType,
            "Agent_Id": loginId,
            "Last_Name": ($('#' + idType + '-full-name').val() || ''),
            "Title": ($('#' + idType + '-title').val() || ''),
            "Mobile_No": ($('#' + idType + '-mobile').val() || ''),
            "Other_Phone_No": ($('#' + idType + '-other').val() || ''),
            "Remark": $('#' + idType + '-remarks').val(),
            Token: token
        }
    }
    $.ajax({
        type: apiName == 'UpdateCallFilter' ? 'PUT' : 'POST',
        url: mvcHost + '/mvc' + selectedCompany + '/api/' + apiName,
        data: JSON.stringify(dataObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        var rDetails = r.details;
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + rDetails);
        } else {
            if (apiName == 'GetCallFilter') {
                var callerTable = $('#' + idType + '-table').DataTable({
                    data: r.details,
                    dom: 'Alfrtip',
                    aaSorting: [
                        [2, 'asc']
                    ],
                    lengthChange: true,
                    "lengthMenu": [5, 10, 50],
                    alphabetSearch: {
                        column: 0
                    },
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
                        title: langJson['l-form-full-name'],
                        data: "Last_Name"
                    }, {
                        title: langJson['l-form-title'],
                        data: "Title"
                    }, {
                        title: langJson['l-form-mobile'],
                        data: "Mobile_No"
                    }, {
                        title: langJson['l-form-other'],
                        data: "Other_Phone_No"
                    }, {
                        title: langJson['l-form-remarks'],
                        data: "Remark"
                    }]
                });
                $('div.alphabet .alphabet-info-display').text(langJson['l-st-display-colon']);
                $('#' + idType + '-table tbody').on('click', 'tr[role="row"]', function (e) {
                    e.preventDefault();
                    callerTable.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                    $(this).addClass('highlight');
                    var data = callerTable.row($(this)).data();
                    $('#' + idType + '-full-name').val(data.Last_Name || '').prop('disabled', true);
                    $('#' + idType + '-title').val(data.Title || '').prop('disabled', true);
                    $('#' + idType + '-mobile').val(data.Mobile_No || '').prop('disabled', true);
                    $('#' + idType + '-other').val(data.Other_Phone_No || '').prop('disabled', true);
                    $('#' + idType + '-remarks').val(data.Remark || '').prop('disabled', true);
                    $('#' + idType + '-custom-card').show();
                    if (idType == 'repeated-caller') {
                        repeatedCallerObj = data;
                    } else {
                        difficultCallerObj = data;
                    }
                    $('#' + idType + '-edit').show();
                    $('#' + idType + '-save').hide();
                    $('#' + idType + '-add').hide();
                });
                $('#' + idType + '-custom-card').hide()
            } else if (apiName == 'UpdateCallFilter') {
                callSetting(callType, 'GetCallFilter');
                $('#' + idType + '-remarks').prop('disabled', true);
                $('#' + idType + '-edit').show();
                $('#' + idType + '-save').hide();
            } else if (apiName == 'AddCallFilter') {
                callSetting(callType, 'GetCallFilter');
            }
        }
    });
}

function addClicked(idType) {
    $('#' + idType + '-custom-card').show();
    $('#' + idType + '-full-name').prop('disabled', false).val('');
    $('#' + idType + '-title').prop('disabled', false).val('');
    $('#' + idType + '-remarks').prop('disabled', false).val('');
    $('#' + idType + '-edit').hide();
    $('#' + idType + '-delete').hide();
    $('#' + idType + '-add').show();
    if (idType == 'repeated-customer' || idType == 'difficult-customer') {
        $('#' + idType + '-email').prop('disabled', false).val('');
    } else {
        $('#' + idType + '-mobile').prop('disabled', false).val('');
        $('#' + idType + '-other').prop('disabled', false).val('');
    }
}

function editClicked(idType) {
    $('#' + idType + '-full-name').prop('disabled', false);
    $('#' + idType + '-title').prop('disabled', false);
    $('#' + idType + '-remarks').prop('disabled', false);
    $('#' + idType + '-mobile').prop('disabled', false);
    $('#' + idType + '-other').prop('disabled', false);
    if (idType == 'repeated-customer' || idType == 'difficult-customer') {
        $('#' + idType + '-email').prop('disabled', false);
    } else {
        $('#' + idType + '-mobile').prop('disabled', false);
        $('#' + idType + '-other').prop('disabled', false);
    }
    $('#' + idType + '-edit').hide();
    $('#' + idType + '-add').hide();
    $('#' + idType + '-save').show();
    $('#' + idType + '-delete').show();
}

function emailSetting(emailType, apiName, addBack, newGet) {
    var emailArr = [];
    var idType = emailType.toLowerCase().replace(' ', '-');
    var dataObj = {};
    if (newGet) {
        if (idType == 'repeated-customer') {
            repeatedCustomerObj.FullName = $('#' + idType + '-full-name').val() || '';
            repeatedCustomerObj.Title = $('#' + idType + '-title').val() || '';
            repeatedCustomerObj.EmailAddress = $('#' + idType + '-email').val() || '';
        } else {
            difficultCustomerObj.FullName = $('#' + idType + '-full-name').val() || '';
            difficultCustomerObj.Title = $('#' + idType + '-title').val() || '';
            difficultCustomerObj.EmailAddress = $('#' + idType + '-email').val() || '';
        }
    }
    if (apiName == 'AddSetting') {
        var emailToAdd = $('#' + idType + '-email').val() || '';
        if (emailType == 'Repeated Customer' || emailType == 'Difficult Customer') {
            if (emailToAdd == undefined || emailToAdd.length == 0) {
                alert('Email Field Cannot Be Empty.');
                return;
            }
            emailArr.push(emailToAdd);
        } else if (emailType == 'Junk Mail') {
            emailArr.push($('#junk-mail-add-input').val() || '');
        }
    } else if (apiName == 'DelSetting') {
        if (emailType == 'Repeated Customer') {
            emailArr.push(repeatedCustomerObj.EmailAddress);
        } else if (emailType == 'Difficult Customer') {
            emailArr.push(difficultCustomerObj.EmailAddress);
        } else {
            $('#' + idType + '-section input:checkbox:checked').each(function () {
                if (this.value != 'All Emails') {
                    emailArr.push(this.value);
                }
            });
        }
    } else if (apiName == 'GetSetting') {
        emailArr.push('tbd');
        if ($('#' + idType + '-section').find('.options').length > 0) {
            $('#' + idType + '-section').find('.options').remove();
        }
        dataObj = {
            "projectName": selectedCompany,
            emailType: emailType
        }
        var tableSection = $('#' + idType + '-table-section');
        tableSection.children().remove();
        tableSection.append('<table id="' + idType + '-table" class="table table-hover" style="width:100% " data-page-length="5"></table>');
    } else if (apiName == 'GetJunkMails') {
        emailArr.push('tbd');
        dataObj = {
            "projectName": selectedCompany
        }
        var junkMailTableSection = $('#junk-mail-table-section');
        junkMailTableSection.children().remove();
        junkMailTableSection.append('<table id="junk-mail-table" class="table table-hover" style="width:100%" data-page-length="5"></table>');
        $("#junk-mail-from").text('');
        $("#junk-mail-to").text('');
        $("#junk-mail-subject").text('');
        $("#junk-mail-body").html('');
        $("#junk-mail-attachment").html('');
    }
    for (var i = 0; i < emailArr.length; i++) {
        var emailAddress = emailArr[i];
        if (apiName == 'AddSetting' || apiName == 'DelSetting') {
            dataObj = {
                projectName: selectedCompany,
                emailAddress: emailAddress,
                emailType: emailType,
                agentId: loginId
            };
            if (apiName == 'AddSetting') {
                if (emailType == 'Repeated Customer' || emailType == 'Difficult Customer') {
                    dataObj.fullName = $('#' + idType + '-full-name').val() || '';
                    dataObj.title = $('#' + idType + '-title').val() || '';
                    dataObj.remarks = $('#' + idType + '-remarks').val() || '';
                }
            }
        }

        $.ajax({
            type: "POST",
            url: wiseHost + '/WisePBX/api/Email/' + apiName,
            data: JSON.stringify(dataObj),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            var rDetails = r.details;
            if (!/^success$/i.test(r.result || "")) {
                console.log('error: ' + rDetails);
            } else {
                if (apiName == 'GetSetting') {
                    var theArr = r.data;
                    if (emailType == 'Junk Mail') {
                        var container = $('#' + idType + '-section');
                        container.children().remove();
                        $('<label class="form-check-label all pb-1" for="' + idType + '-emails"><input class="form-check-input" type="checkbox" id="' + idType + '-emails" value="All Emails">' + langJson['l-st-all-emails'] + '<span class="form-check-sign"><span class="check"></span></span></label><div class="dropdown-divider"></div>').appendTo(container);
                        theArr.forEach(function addCheckBox(item, index) {
                            $('<div class="options pb-1"><label class="form-check-label" for="' + item.EmailAddress + '">' +
                                '<input class="form-check-input" type="checkbox" id="' + item.EmailAddress + '" value="' + item.EmailAddress + '">' +
                                item.EmailAddress +
                                '<span class="form-check-sign"><span class="check"></span></span></label></div>').appendTo(container);
                        });
                        loadCheckboxActions('#' + idType + '-section', '#' + idType + '-emails');
                    } else {
                        var emailTable = $('#' + idType + '-table').DataTable({
                            data: theArr,
                            dom: 'Alfrtip',
                            aaSorting: [
                                [2, 'asc']
                            ],
                            lengthChange: true,
                            "lengthMenu": [5, 10, 50],
                            alphabetSearch: {
                                column: 0
                            },
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
                                title: langJson['l-form-full-name'],
                                data: "FullName"
                            }, {
                                title: langJson['l-form-title'],
                                data: "Title"
                            }, {
                                title: langJson['l-form-email'],
                                data: "EmailAddress"
                            }, {
                                title: langJson['l-form-remarks'],
                                data: "Remarks"
                            }]
                        });
                        $('div.alphabet .alphabet-info-display').text(langJson['l-st-display-colon']);
                        $('#' + idType + '-table tbody').on('click', 'tr[role="row"]', function (e) {
                            e.preventDefault();
                            emailTable.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                            $(this).addClass('highlight');
                            var data = emailTable.row($(this)).data();
                            $('#' + idType + '-full-name').val(data.FullName || '').prop('disabled', true);
                            $('#' + idType + '-title').val(data.Title || '').prop('disabled', true);
                            $('#' + idType + '-email').val(data.EmailAddress || '').prop('disabled', true);
                            $('#' + idType + '-remarks').val(data.Remarks || '').prop('disabled', true);
                            $('#' + idType + '-custom-card').show();
                            if (idType == 'repeated-customer') {
                                repeatedCustomerObj = data;
                            } else {
                                difficultCustomerObj = data;
                            }
                            $('#' + idType + '-edit').show();
                            $('#' + idType + '-save').hide();
                            $('#' + idType + '-add').hide();
                        });
                        $('#' + idType + '-custom-card').hide();
                    }
                } else if (apiName == 'AddSetting' || apiName == 'DelSetting') {
                    if (apiName == 'DelSetting' && addBack) {
                        emailSetting(emailType, 'AddSetting');
                        return;
                    }
                    if (idType = 'junk-mail') {
                        $('#' + idType + '-section').find('.options').remove();
                        $('#' + idType + '-add-input').val('');
                    }
                    emailSetting(emailType, 'GetSetting');
                } else if (apiName = 'GetJunkMails') {
                    var junkMailTable = $('#junk-mail-table').DataTable({
                        data: r.data,
                        lengthChange: true,
                        "lengthMenu": [5, 10, 50],
                        aaSorting: [
                            [0, 'desc']
                        ], // no initial sorting
                        searching: false,
                        columns: [{
                            title: langJson["l-email-date-time"],
                            data: 'CreateDateTime'
                        }, {
                            title: langJson["l-email-sender"],
                            data: 'From'
                        }, {
                            title: langJson["l-email-subject"],
                            data: "Subject"
                        }, {
                            title: langJson["l-email-content"],
                            data: "Body"
                        }, {
                            title: langJson["l-st-att-dot"],
                            data: "Attachment"
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
                        },
                        columnDefs: [{
                            targets: 0,
                            render: function (data, type, row) {
                                return data.replace('T', ' ');
                            }
                        }, {
                            targets: [1, 2],
                            render: function (data, type, row) {
                                var newData = '';
                                if (data != null) {
                                    newData = data.replace(new RegExp(' <br/>|<br/> |<br/>', 'g'), '');
                                }
                                return newData.trim();
                            }
                        }, {
                            targets: -1,
                            render: function (data, type, row) {
                                if (data == 'Y') {
                                    return 'Yes';
                                } else {
                                    return '';
                                }
                            }
                        }]
                    });
                    $('#junk-mail-table tbody').on('click', 'tr', function (e) {
                        e.preventDefault();
                        junkMailTable.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                        $(this).addClass('highlight');
                        var data = junkMailTable.row($(this)).data();
                        $.ajax({
                            type: "POST",
                            url: wiseHost + "/WisePBX/api/Email/GetContent",
                            data: JSON.stringify({
                                "id": data.EmailID
                            }),
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function (r) {
                                var record = r.data;
                                $("#junk-mail-from").text(record.From);
                                $("#junk-mail-subject").text(record.Subject);
                                var emailContent = record.Body;
                                emailContent = emailContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                                $("#junk-mail-body").html(emailContent);
                                $("#junk-mail-attachment").html('');
                                for (i = 0; i < record.Attachments.length; i++) {
                                    var attachment = record.Attachments[i];
                                    var objDiv = document.createElement("span");
                                    var fileName = attachment.FileName;
                                    var escapedFileName = escape(fileName);
                                    var newFileName = fileName;
                                    if (fileName.length > 15) {
                                        newFileName = fileName.slice(0, 14);
                                    }
                                    objDiv.setAttribute("class", "email-attach-tag");
                                    objDiv.setAttribute("onclick", "download('data:" + attachment.ContentType + ";base64," + attachment.Base64Data + "','" + escapedFileName + "','" + attachment.ContentType + "');");
                                    objDiv.textContent = newFileName;
                                    $("#junk-mail-attachment").append(objDiv);
                                }
                                $('#junk-mail-custom-card').show();
                            },
                            error: function (r) {
                                console.log('An error occurred.');
                                console.log(r);
                            },
                        });
                    });
                }
            }
        });
    }
}

function junkMailPressed() {
    if (window.event.keyCode == 13) {
        emailSetting('Junk Mail', 'AddSetting');
    }
}

function windowOnload() {
    setLanguage();
    if (customCompany != 'no') {
        selectedCompany = customCompany;
        $('#v-pills-tab').removeClass('d-none');
    } else {
        var sessionCampaignList = sessionStorage.getItem('scrmCampaignList') || [];
        var campaignList = sessionCampaignList.length > 0 ? JSON.parse(sessionCampaignList) : [];
        var optionStr = '<option disabled="disabled" selected="selected"></option>';
        var authorizedCompanies = sessionStorage.getItem('scrmCompanies') || '';
        // set option and onChange function for Customer List Manual Search's dropdown
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
            restorePage();
            $('#v-pills-tab').removeClass('d-none');
        });
    }
}
$(document).ready(function () {
    $("a.nav-link").click(function () {
        $('.tab-pane').removeClass('active show');
        var theHref = $(this).attr('href');
        $(theHref).addClass('active show');
    });
    $('textarea').keydown(function (e) {
        if (e.keyCode == 33 || e.keyCode == 34) {
            $(this).blur();
        }
    });
    if (parent.iframeRecheck) {
        parent.iframeRecheck($(parent.document));
    }
});
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());