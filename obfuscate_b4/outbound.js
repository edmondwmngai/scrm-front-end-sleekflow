var agentTbl;
var mvcHost = config.mvcHost;
var wiseHost = config.wiseHost;
var customCompany = sessionStorage.getItem('scrmCustomCompany') || 'no';
var campaign = customCompany != 'no' ? customCompany : (window.frameElement.getAttribute("campaign") || parent.frameElement.getAttribute("campaign") || parent.campaign || '');
var cInputFormTbl = null;
var cCustomerTbl = null;
var selectedCat = ''; // left menu selected category
var batchTbl = null;
var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';
var customerTbl = null;
var loadedCSStatusTBl = false;
var emailFileList = [];
var outstandingAttachment = 0;
var tbdContactStatusArr = [];
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var cCustomerAjaxData = {};
var inputFormData = [];
var batchTblData = [];
var functions = parent.functions;
var cCustDeselectArr = [];
var isAdmin = (functions.indexOf('Outbound-Admin-Fn') != -1);
var isCampaignSetup = (functions.indexOf('Outbound-Campaign-Setup-Fn') != -1);
var canDownloadVoice = functions.indexOf('Download-Voice') != -1;
var today = new Date();

function openNav() {
    var existingWidth = document.getElementById("left-menu").style.width;
    if (existingWidth == "135px") {
        closeNav();
    } else {
        document.getElementById("left-menu").style.width = "135px";
        document.getElementById("main").style.marginLeft = "135px";
    }
}

function closeNav() {
    document.getElementById("left-menu").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}

function initOpen() {


    // if ($('#o-search-campaign-select').children().length == 0 || $('#o-search-batch').length == 0) {

    //     // campaign code and batch code not yet loaded cannot and no need to run change function to release fitler    
    //     $('#o-search-campaign-select').val('');
    //     $('#o-search-batch').val('');
    // } else {

    //     // change function to release the options out
    //     $('#o-search-campaign-select').val('').change();
    //     $('#o-search-batch').val('').change();
    // }

    $('#o-phone').val('');
    $('#o-name').val('');
    $('input:radio[name=gender-list]').each(function () {
        $(this).prop('checked', false);
    });
    $('#o-age').val('');
    $('#o-call-status').val('NewLead');
    $('#o-callback').val('');
    $('input[name="agent-list"]:eq(0)').prop('checked', true);

    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/GetOBCampaign',
        data: JSON.stringify({
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            parent.$.MessageBox('Get Campaign Error');
        } else {
            // update Open tab search input form field
            $('#o-search-campaign-select').empty();
            var inputFormStr = ''; // tbd '<option value="" selected=true style="display:none;">- Please Select -</option>';
            var rDetails = r.details || [];
            for (let theCampaignObj of rDetails) {
                var theCampaignCode = theCampaignObj.Campaign_Code

                // the option appear when it got campaign
                inputFormStr += '<option value=' + theCampaignCode + ' formid="' + theCampaignObj.Form_Id + '" class="d-none">' + theCampaignCode + '</option>';
            }
            $('#o-search-campaign-select').append(inputFormStr);

            if (isAdmin) {

                // get input form list and campaign list
                loadFormBatchTbl(true);
            } else {
                loadBatchTbl(true);
            }
        }
    });

}

function switchContent(selected, byPass) {

    // no need to change any if same category
    if (byPass == undefined && selected == selectedCat) {
        return;
    }
    $('.tab-pane').removeClass('active show');

    // clear orignal
    switch (selectedCat) {
        case langJson['l-social-campaign']:
            $('#c-container').empty();
            break;
        default:
            break;
    }
    selectedCat = selected;
    // future move
    switch (selected) {
        case langJson['l-social-campaign']:
            campaignInitTbl();
            $('#design-content').addClass('active show');
            break;
        case 'Form':
            initFormTbl();
            $('#form-content').addClass('active show');
            break;
        case 'Builder':
            initFBTbl();
            $('#builder-content').addClass('active show');
            break;
        case langJson['l-campaign-upload']:
            uploadInit();
            $('#upload-content').addClass('active show');
            break;
        case langJson['l-outbound-assign']:
            $('#m-lower-part').empty();
            loadBatchTbl(false);
            $('#c-customer-tbl-container').empty();

            // open top card
            $('#a-batch-body').collapse('show');
            $('#manage-content').addClass('active show');
            $('#a-assign-call-list-card').removeClass('d-none');

            break;
        case langJson['l-form-open']:
            initOpen();
            $('#c-customer-tbl-container').empty();

            // open top card
            $('#o-search-customer-body').collapse('show');
            $('#o-search-results-container').addClass('d-none');
            $('#o-contact-status-container').addClass('d-none');
            $('#o-input-form').hide();
            $('#open-content').addClass('active show');

            break;
        default:
            break;
    }
}

function replyCallClick(lastCallType, lastCallID, confConnID) {
    var iframeInputForm = document.getElementById('o-input-form');
    iframeInputForm.contentWindow.replyCallClick(lastCallType, lastCallID, confConnID);
}

function clearCreate(step) {
    // when first selected Create
    if (step == 1) {
        loadFormBatchTbl(false);
        $('#c-call-cbx').prop('checked', false);
        $('#c-email-cbx').prop('checked', false);
        $('#c-sms-cbx').prop('checked', false);
        $('#c-select-channel').addClass('d-none');
        $('#c-special-request').text(''); // @ search customer no specal requirement str
        $('.c-customer-input').val('');
        $('.range-div').addClass('d-none');
        $('#c-select-customer').addClass('d-none');
        $('#c-customer-tbl-container').empty();
        cCustomerTbl = null;
        $('#c-name-section').addClass('d-none');
        $('#c-batch-name').val('');
        $('.c-customer-input').prop('disabled', false);
        // when clicked 'Select' in Campaign table
    } else if (step == 2) {
        $('#c-call-cbx').prop('checked', false);
        $('#c-email-cbx').prop('checked', false);
        $('#c-sms-cbx').prop('checked', false);
        $('#c-select-channel').addClass('d-none');
        $('#c-special-request').text(''); // @ search customer no specal requirement str
        $('.c-customer-input').val('');
        $('.range-div').addClass('d-none');
        $('#c-select-customer').addClass('d-none');
        $('#c-customer-tbl-container').empty();
        cCustomerTbl = null;
        $('#c-name-section').addClass('d-none');
        $('#c-batch-name').val('');
        // when search criteria not correct
    } else if (step == 3) {
        $('#c-customer-tbl-container').empty();
        cCustomerTbl = null;
        $('#c-batch-name').val('');
        $('#c-name-section').addClass('d-none');
    }
}

function initFBLayout() {
    var initContainerStr = '<div><table><tr><td><label class="me-2 form-label">Form Layout</label></td><td><select id="form-layout-select" class="form-select"></select></td></tr></table></div>' +
        '<div>Form Name</div>';
    $('#b-container').empty().append(initContainerStr);
}

function initFBTbl() {
    // if no free form layout, should hide form layout container and shows "Please create Form Layout First"
    // $('#b-container').append('<div clas="form-inline"><label class="me-2 form-label">Form Layout</label><select id="form-layout-select" class="form-select"></select></div>');
    // $('#form-layout-select').append('')
    var initContainerStr = '<button id="add-Form-btn" class="btn rounded btn-sm btn-warning mt-3 mb-2 text-capitalize"><i class="fas fa-plus-square me-2"></i><span>Add Form</span></button>' +
        '<table id="b-tbl" class="table w-100">';
    $('#b-container').empty().append(initContainerStr);
    $('#add-form-btn').on('click', function () {
        initFBLayout();
    })
    // TBD demo DB should also has "Is_Active", "Updated_By", "Update_Time "" , the list below should only shows Is_Active true
    var tbd_formbuilder_list = [{
        F_Id: 1,
        Form_Name: "Form of Elder Monthly Plan Form"
    }, {
        F_Id: 2,
        Form_Name: "Form of Accident Insurance Form"
    }, {
        F_Id: 3,
        Form_Name: "Form of Domestic Helper Scheme Form"
    }, {
        F_Id: 4,
        Form_Name: "Form of Health Questionaire"
    }]

    var columns = [{
        defaultContent: '<i title="Re-Use Form" class="table-btn fas fa-redo reuse-design" data-bs-toggle="tooltip"></i>',
        orderable: false,
        className: 'btnColumn'
    }, {
        orderable: false,
        className: 'btnColumn',
        defaultContent: '<i title="Remove Form" class="table-btn fas fa-trash-alt remove-design" data-bs-toggle="tooltip"></i>'
    }, {
        orderable: false,
        className: 'btnColumn',
        defaultContent: '<i title="Preview Form" class="table-btn fas fa-search design-details" data-bs-toggle="tooltip"></i>'
    },
    {
        title: "ID",
        data: "F_Id"
    }, {
        title: "Name",
        data: "Form_Name"
    }
    ]

    $('#b-tbl').DataTable({
        data: tbd_formbuilder_list,
        lengthChange: false, // not showing 'Show ? per page' dropdown
        searching: false,
        "paging": true,
        columns: columns,
        pageLength: 10,
        aaSorting: [],
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

    // Deselect checkbox change
    $('#c-customer-tbl tbody').on('change', '.form-check-input', function (e) {
        var isChecked = $(this).prop('checked');
        var customerId = parseInt($(this).val());
        // if checked
        if (isChecked) {
            // remove Customer ID from cCustDeselectArr
            cCustDeselectArr = cCustDeselectArr.filter(function (element) {
                return element != customerId
            });
        } else { // not checked
            cCustDeselectArr.push(customerId);
        }
        var recordTotal = cCustomerTbl.page.info().recordsTotal;
        var cCustDeselectArrLen = cCustDeselectArr.length;
        if (cCustDeselectArrLen > 0) {
            $('.deselect-container').removeClass('d-none');
            $('#c-customer-deselect-no').text(cCustDeselectArrLen);
            $('#c-customer-remaining-no').text(recordTotal - cCustDeselectArrLen);
        } else {
            $('.deselect-container').addClass('d-none');
        }
    });
}

function initFormLayout() {
    var initContainerStr = '<div><table><tr><td><label class="me-2 form-label">Form Layout</label></td><td><select id="form-layout-select" class="form-select"></select></td></tr></table></div>' +
        '<div>Form Name</div>';
    $('#b-container').empty().append(initContainerStr);
}

function initFormTbl() {
    // if no free form layout, should hide form layout container and shows "Please create Form Layout First"
    // $('#b-container').append('<div clas="form-inline"><label class="me-2 form-label">Form Layout</label><select id="form-layout-select" class="form-select"></select></div>');
    // $('#form-layout-select').append('')
    var initContainerStr = '<button id="add-Form-btn" class="btn rounded btn-sm btn-warning mt-3 mb-2 text-capitalize"><i class="fas fa-plus-square me-2"></i><span>Add Form</span></button>' +
        '<table id="b-tbl" class="table w-100">';
    $('#b-container').empty().append(initContainerStr);
    $('#add-form-btn').on('click', function () {
        initFBLayout();
    })
    // TBD demo DB should also has "Is_Active", "Updated_By", "Update_Time "" , the list below should only shows Is_Active true
    var tbd_formbuilder_list = [{
        F_Id: 1,
        Form_Name: "Form of Elder Monthly Plan Form"
    }, {
        F_Id: 2,
        Form_Name: "Form of Accident Insurance Form"
    }, {
        F_Id: 3,
        Form_Name: "Form of Domestic Helper Scheme Form"
    }, {
        F_Id: 4,
        Form_Name: "Form of Health Questionaire"
    }]

    var columns = [{
        defaultContent: '<i title="Re-Use Form" class="table-btn fas fa-redo reuse-design" data-bs-toggle="tooltip"></i>',
        orderable: false,
        className: 'btnColumn'
    }, {
        orderable: false,
        className: 'btnColumn',
        defaultContent: '<i title="Remove Form" class="table-btn fas fa-trash-alt remove-design" data-bs-toggle="tooltip"></i>'
    }, {
        orderable: false,
        className: 'btnColumn',
        defaultContent: '<i title="Preview Form" class="table-btn fas fa-search design-details" data-bs-toggle="tooltip"></i>'
    },
    {
        title: "ID",
        data: "F_Id"
    }, {
        title: "Name",
        data: "Form_Name"
    }
    ]

    $('#f-tbl').DataTable({
        data: tbd_formbuilder_list,
        lengthChange: false, // not showing 'Show ? per page' dropdown
        searching: false,
        "paging": true,
        columns: columns,
        pageLength: 10,
        aaSorting: [],
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

function isDoubleByte(str) {
    for (var i = 0, n = str.length; i < n; i++) {
        if (str.charCodeAt(i) > 255) {
            return true;
        }
    }
    return false;
}

function smsWordCount() {
    var smsContent = $('#sms-content').val() || '';
    var smsContentLen = smsContent.length;
    var haveChineseChar = isDoubleByte(smsContent);
    // wds counts refers to 3HK
    var perMsgCount = 160;
    if (haveChineseChar) {
        perMsgCount = 70;
    }
    // round up
    var totalMsgs = Math.ceil(smsContentLen / perMsgCount);
    var totalMsgNumber = totalMsgs * perMsgCount;
    var smsWordCountStr = smsContentLen + '/' + totalMsgNumber;
    $('#sms-word-count').text(smsWordCountStr);
    $('#sms-msg-count').text(totalMsgs);
}

function formUpdated(isOpenNextFm) {

    // load the call log, not the form
    showLogForm(false);

    // need to be uncollapse, otherwise the columns width will be incorrect
    $('#o-search-customer-body').collapse('show');

    // update the highlighted row
    customerTbl.row(customerTbl.$('tr.highlight')).data(window.customerData);

    if (isOpenNextFm) {

        // if the not collapsed table shown, the collapase back function cannot be run
        $('#o-search-customer-body').on('shown.bs.collapse', function () {

            var higlightedRowIdx = customerTbl.row(customerTbl.$('tr.highlight')).index();
            var nextRowBtn = $("#o-search-results-tbl button:eq(" + (higlightedRowIdx + 1) + ")");
            if ($(nextRowBtn).length > 0) {
                $("#o-search-results-tbl button:eq(" + (higlightedRowIdx + 1) + ")").trigger('click');
            }

            // clear this event
            $('#o-search-customer-body').on('shown.bs.collapse', function () { });
        })
    } else {

        // need to be uncollapse, otherwise the columns width will be incorrect
        $('#o-search-customer-body').collapse('show');

        // update the highlighted row
        customerTbl.row(customerTbl.$('tr.highlight')).data(window.customerData);

        // close it back
        $('#o-search-customer-body').collapse('hide');
    }

    /*// NO DEL - agent may want to close the form and update table immediately
    // $("#o-search-btn").click();
    $('#o-search-customer-body').collapse('show'); */
}

function getAgeByDOB(dob) {
    var birthDate = new Date(dob.slice(0, 10));
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function loadFormBatchTbl(isOpen) {
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/GetOBInputForm',
        data: JSON.stringify({
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
        } else {
            inputFormData = rDetails;
            loadBatchTbl(isOpen); // batch table need to have campaign name (inputFormData)
            if (cInputFormTbl) {
                $('#c-campaign-tbl').DataTable().clear();
                $('#c-campaign-tbl').DataTable().rows.add(rDetails); // Add new data
                $('#c-campaign-tbl').DataTable().columns.adjust().draw(); // Redraw the DataTable
            } else {
                cInputFormTbl = $('#c-campaign-tbl').DataTable({
                    data: rDetails,
                    lengthChange: false,
                    aaSorting: [
                        [1, "desc"]
                    ],
                    pageLength: 5,
                    searching: false,
                    columnDefs: [{
                        targets: 0,
                        data: null,
                        defaultContent: '<button class="btn btn-sm rounded btn-warning text-capitalize"><i class="fas fa-mouse-pointer me-2"></i><span>' + langJson['l-campaign-select'] + '</span></button>',
                        className: 'btnColumn',
                        orderable: false
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
                    initComplete: function (settings, json) {
                        // resize();
                    },
                    columns: [{
                        title: ""
                    },
                    {
                        data: "Form_Id",
                        "visible": false
                    },
                    {
                        title: "Name",
                        data: "Form_Name"
                    }, {
                        title: "Details",
                        data: "Form_Details"
                    }
                    ]
                });
                // Input Form Select Event
                $('#c-campaign-tbl tbody').on('click', 'button', function (e) {
                    clearCreate(2);
                    cInputFormTbl.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                    $(this).parent().parent().addClass('highlight');
                    $('#c-select-channel').removeClass('d-none');
                    // NO DEL window.scrollTo(0,document.body.scrollHeight);
                });
            }
        }
    });
}

function uploadCheckExcel(filePath, selectedWorksheet) {

    if (typeof filePath == 'undefined') {
        var headerSelect = $('#u-excel-sheet-select');
        filePath = headerSelect.attr('filepath');
        selectedWorksheet = headerSelect.val();
    }

    var dataObj = {
        Agent_Id: loginId,
        Token: token,
        File_Path: filePath,
        WorkSheet: selectedWorksheet,
        Campaign_Code: $('#u-campaign-select').val()
    }

    // please note the library using now:
    // - if the Excel got cells previous edited, even erased, will create a blank record in ob_temp_upload table, results will have one more record
    // - the check type only got alert when whole column record wrong type, will not check every cell

    $('#u-excel-resposne-2nd-td').text(langJson['l-outbound-checking-excel']).removeClass('text-success').removeClass('text-danger');

    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/CheckOBExcel',
        data: JSON.stringify(dataObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            // parent.$.MessageBox('Check Excel Failed\r\n' + r.details);
            $('#u-excel-resposne-2nd-td').text(r.details).removeClass('text-success').addClass('text-danger');
        } else {
            var uplaodStatus = r.details.upload_status;

            if (uplaodStatus.startsWith('Checked OK')) {
                $('#u-excel-resposne-2nd-td').text(uplaodStatus).removeClass('text-danger').addClass('text-success');
            } else {
                $('#u-excel-resposne-2nd-td').text(uplaodStatus).removeClass('text-success').addClass('text-danger');
            }
        }
    });
}

function uploadedExcelFile(input) {

    // clear previous warning is exists
    $('#u-warning-txt').text('');

    // shows default checking results text first
    $('#u-results-row').removeClass('d-none');

    if (input.files && input.files[0]) {
        var fileData = new FormData();
        var theFile = input.files[0]
        fileData.append("files", theFile);
        fileData.append('Agent_Id', loginId);
        fileData.append('Token', token);
        $.ajax({
            url: mvcHost + '/mvc' + campaign + '/api/UploadExcelGetWorksheet',
            type: "POST",
            contentType: false, // Not to set any content header  
            processData: false, // Not to process data  
            data: fileData,
            dataType: 'multipart/form-data',
        }).always(function (r) {
            // status 200 , response is still fail by form data request
            var response = JSON.parse(r.responseText);
            if (!/^success$/i.test(response.result || "")) {
                if (response.details) {
                    parent.$.MessageBox('Upload Excel Failed\r\n' + response.details);
                } else {
                    parent.$.MessageBox('Upload Excel Failed');
                }
                $('#u-results-row').addClass('d-none');
            } else {
                $('#u-campaign-select').prop('disabled', true);
                var optStr = '<option value="" style="display:none;" selected>-- Please Select --</option>';
                var worksheetArr = response.worksheet;
                var filePath = response.filepath;
                for (let theWorksheetName of worksheetArr) {
                    optStr += ('<option value="' + theWorksheetName + '">' + theWorksheetName + '</option>');
                }
                $('#u-excel-sheet-select').attr('filepath', filePath).empty().append(optStr);
                $('#u-select-sheet-tr').removeClass('d-none');
                $('#u-upload-btn').addClass('d-none');
                $('#u-upload-btn-td').append(theFile.name);

                // after layout change, default select 1st sheet, as by comment of Kenneth 99% should be sheet 1
                $("#u-excel-sheet-select").val($("#u-excel-sheet-select option:eq(1)").val()).change();
            }
        });
    }
}

function uploadInit() {
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/GetOBCampaign',
        data: JSON.stringify({
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            parent.$.MessageBox('Get Campaign Error');
        } else {
            uploadPageInit(r.details || []);
        }
    });
}

function uploadPageInit(campaignArr) {

    var campaignStr = '';
    for (let campaignObj of campaignArr) {
        var theCampaignCode = campaignObj.Campaign_Code;
        campaignStr += ('<option value="' + theCampaignCode + '">' + theCampaignCode + '</option>')
    }

    var uploadFileStr = "$('#u-file-to-upload').trigger('click')"
    var uploadBtnStr = ' <table id="upload-page-tbl" class="custom-tbl">' +
        '<tr><td style="min-width:167px;">' + langJson['l-outbound-campaign-code'] + '</td><td><select id="u-campaign-select" class="form-select" style="min-width:35vw"><option value="" style="display:none;" selected>-- Please Select --</option>' + campaignStr + '</select> </td></tr>' +
        '<tr><td>' + langJson['l-outbound-batch-code'] + '</td><td><input id="u-batch-code" type="search" class="form-control" /></td></tr>' +
        '<tr><td>' + langJson['l-search-start-date'] + '</td><td><input id="u-start-calendar" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" class="rounded ps-2" type="text" placeholder="yyyy-mm-dd" autocomplete="off"></td></tr>' +
        '<tr><td>' + langJson['l-search-end-date'] + '</td><td><input id="u-end-calendar" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" class="rounded ps-2" type="text" placeholder="yyyy-mm-dd" autocomplete="off"></td></tr>' +
        '<tr id="u-upload-btn-tr" class="d-none"><td></td><td id="u-upload-btn-td"> <input type="file" id="u-file-to-upload" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onchange="uploadedExcelFile(this);" style="display:none"> <button id="u-upload-btn" class="btn rounded btn-sm btn-warning text-capitalize" onclick=' + uploadFileStr + '><i class="fas fa-upload me-2"></i><span>' + langJson['l-outbound-upload-excel-btn'] + '</span></button> </td></tr>' +
        '<tr id="u-select-sheet-tr" class="d-none">' +
        '<td>' + langJson['l-outbound-sheet-call-list'] + '</td>' +
        '<td><select id="u-excel-sheet-select" class="form-select"></select></td>' +
        '</tr>' +
        '<tr id="u-results-row" class="d-none"><td id="u-excel-resposne-1st-td">' + langJson['l-outbound-results'] + '</td><td id="u-excel-resposne-2nd-td"></td></tr>' +
        '</table>' +
        '<p id="u-warning-txt" class="text-danger ms-2" style="white-space:pre-line"></p>' +
        '<div class="text-center">' +
        '<button id="u-save-btn" class="btn btn-sm rounded btn-warning text-capitalize me-2"><i class="fa fa-save me-2"></i><span>' + langJson['l-outbound-confirm-to-upload'] + '</span></button>' +
        '<button id="u-cancel-btn" class="btn btn-sm rounded btn-gray text-capitalize"><i class="far fa-times-circle me-2"></i><span>' + langJson['l-general-cancel'] + '</span></button>' +
        '</div>';

    $('#u-container').empty().append(uploadBtnStr);
    var dateToday = new Date(); // no past date can be selected
    $('#u-start-calendar').datepicker({
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

    $('#u-end-calendar').datepicker({
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

    // the campaign has to be selected before the uplaod
    $('#u-campaign-select').on('change', function () {
        if ($(this).val().length == 0) {
            $('#u-upload-btn-tr').addClass('d-none');
        } else {
            $('#u-upload-btn-tr').removeClass('d-none');
        }
    })

    $('#u-excel-sheet-select').on('change', function () {
        uploadCheckExcel();

        // clear error, as the not sheet selected error may has gone
        $('#u-warning-txt').text('');
    })

    $('#u-save-btn').on('click', function () {
        $(this).prop('disabled', true);

        // verify before upload, becasue when verify the data, need to provide batch code
        var campaignCode = $('#u-campaign-select').val();
        var batchCodeInput = $('#u-batch-code')
        var batchCode = batchCodeInput.val();
        var startDate = $('#u-start-calendar').val();
        var endDate = $('#u-end-calendar').val();
        var validDateRegex = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/
        var sheetSheetSelect = $('#u-excel-sheet-select');
        var filepath = sheetSheetSelect.attr('filepath');
        var worksheet = sheetSheetSelect.val();
        var errArr = [];

        if (campaignCode.length == 0) {
            errArr.push(langJson['l-outbound-please-select-campaign']);
        }

        if (batchCode.length == 0) {
            errArr.push(langJson['l-outbound-batch-code-empty']);
        } else if (batchCode.indexOf(' ') >= 0) {
            errArr.push(langJson['l-outbound-batch-code-space']);
        }

        // Start Date need to check
        if (startDate.length == 0) {
            errArr.push(langJson['l-outbound-start-date-empty']);
        } else if (!validDateRegex.test(startDate)) {
            errArr.push(langJson['l-outbound-start-date-invalid']);
        }

        if (endDate.length == 0) {
            errArr.push(langJson['l-outbound-end-date-empty']);
        } else if (!validDateRegex.test(endDate)) {
            errArr.push(langJson['l-outbound-end-date-invalid']);
        }

        if (typeof filepath == 'undefined') {
            errArr.push(langJson['l-outbound-not-upload-batch']);
        } else if (worksheet.length == 0) {
            errArr.push(langJson['l-outbound-not-select-sheet']);
        }

        if ($('#u-excel-resposne-2nd-td').hasClass('text-danger')) {
            errArr.push(langJson['l-outbound-sheet-not-okay']);
        }

        if (errArr.length > 0) {
            var errStr = errArr.join('\r\n');
            $('#u-warning-txt').text(errStr);
            $(this).prop('disabled', false);
            return;
        }

        var dataObj = {
            Agent_Id: loginId,
            Token: token,
            File_Path: filepath,
            WorkSheet: worksheet,
            Campaign_Code: campaignCode,
            Batch_Code: batchCode,
            Batch_Start_Date: startDate,
            Batch_End_Date: endDate
        }

        $.ajax({
            type: "POST",
            url: mvcHost + '/mvc' + campaign + '/api/ConfirmUploadOBExcel',
            data: JSON.stringify(dataObj),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                parent.$.MessageBox(r.details || 'Add Batch Failed');
                $('#u-save-btn').prop('disabled', false);
            } else {
                if (r.details.upload_status == 'Uploaded.') {
                    parent.$.MessageBox(langJson['l-outbound-batch-created']);
                    uploadInit();
                } else {
                    parent.$.MessageBox(r.details.upload_status);
                    $('#u-save-btn').prop('disabled', false);
                }
            }
        });
    })

    $('#u-cancel-btn').on('click', function () {
        uploadInit();
    })
}

function appendAttachment(filePath) {
    var fileName = filePath.substring(filePath.lastIndexOf("/") + 1, filePath.length);
    var fileUrl = filePath.replace("D:", wiseHost + "\\WisePBX");
    var uniqueId = fileName.replace(/[^a-zA-Z]+/g, '');
    uniqueId += new Date().getUTCMilliseconds();
    var downloadId = 'download-' + uniqueId;
    var deleteId = "delete-" + uniqueId;
    var data = {
        'FileName': fileName,
        'FilePath': filePath,
        'FileUrl': fileUrl
    }
    $("#emailFile-attachment").append('<span class="email-attach-tag" id="' + uniqueId + '"><a id="' + downloadId + '" href="javascript:none;">' + fileName + '</a></span>');

    $('#' + uniqueId).append('<span id=' + deleteId + ' style="margin-left:5px;">X</span>');
    // Add click delete close function
    $('#' + deleteId).click(function (e) {
        for (var j = 0; j < emailFileList.length; j++) {
            if (emailFileList[j].FileName == fileName) {
                emailFileList.splice(j, 1);
                break;
            }
        }
        // Delete the attachment container
        $('#' + uniqueId).remove();
    });
    // Add download link and its style
    var theFile = $('#' + downloadId);
    theFile.attr("style", "text-decoration: underline;cursor:pointer;color:blue");
    emailFileList.push(data);
    // Downloaded file cannot be opened normally, so don't use download .js
    theFile.attr("href", fileUrl);
    theFile.attr("target", "_blank");
}

function assignAgentMultiple(dataObj, sendAgentArr) {

    // sendAgentArr firs element remvoed, theAgentArr is the first element
    var theAgentArr = sendAgentArr.shift();
    dataObj['Assign_To'] = theAgentArr[1];
    dataObj['Assign_Total'] = theAgentArr[2];
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/AssignOBBatchLead',
        data: JSON.stringify(dataObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + r.details);
            parent.$.MessageBox('Assign to ' + theAgentArr[0] + ' (ID: ' + theAgentArr[1] + ' ) Failed.\n' + r.details);
            $('#m-confirm-multiple-btn').prop('disabled', false);
        }
        if (sendAgentArr.length == 0) {
            batchTbl.$('tr.highlight').click();
            setTimeout(function () {
                $('#a-assign-agent-btn').click()
            }, 500);
        } else {
            assignAgentMultiple(dataObj, sendAgentArr);
        }
    })
}

function allToOneNumUpdate(batchCode, campaignCode) {

    var callStatus = $('#m-call-result').val();

    var dataObj = {
        Batch_Code: batchCode,
        Campaign_Code: campaignCode,
        Assign_From: -999,
        Agent_Id: loginId,
        Token: token,
        Call_Status: callStatus
    }

    // not new lead need to provide reason
    if (callStatus != 'NewLead') {
        var callReason = '';
        if (callStatus == 'Unreach') {
            callReason = $('#m-unreach-reason').val();
        } else if (callStatus == 'Reached') {
            callReason = $('#m-reached-reason').val();
        }

        // will not filter without reason
        if (callReason.length === 0) {
            $('#m-assignable-description').html('[Please select Call Reason for Call Result to get the Avaialble no.]');
            $('#m-assign-no').val('');
            return;
        } else {
            dataObj['Call_Reason'] = callReason;
        }
    }

    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/GetOBBatchLeadCount',
        data: JSON.stringify(dataObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + (r.details || r));
        } else {
            $('#m-assignable-description').html('');
            $('#m-assign-no').val(r.details.LeadCount);
        }
    })
}

function assignmentAllToOne(data) {
    var batchCode = data.Batch_Code;
    var campaignCode = data.Campaign_Code;

    // draw Lower Part
    getAgentList(batchCode, campaignCode, function (agentDetails) {
        var agentOptionStr = "";
        for (let theAgentObj of agentDetails) {
            agentOptionStr += '<option assigned="' + theAgentObj.Assigned + '"  unused="' + theAgentObj.Unused + '" value=' + theAgentObj.Agent_Id + '>' + theAgentObj.AgentName + ' (ID: ' + theAgentObj.Agent_Id + ' )</option>'
        }
        var unassignment = data.Unassigned;
        var lowerPartStr = ('<div id="a-agent-be-assigned-container" class="card my-2">' +
            '<div class="card-body">' +

            '<table>' +
            '<tr><td class="pe-2">' +
            langJson['l-campaign-callstatus'] +
            '</td><td><select id="m-call-result" class="form-select d-table-cell"><option value="NewLead" selected>Null</option><option value="Unreach">Unreach</option><option value="Reached">Reached</option></select></td><td></td></tr>' +

            '<tr><td></td><td><select id="m-unreach-reason" class="d-none form-select">' +
            '<option value="" selected>- Please Select -</option>' +
            '<option value="No Answered">No Answered</option>' +
            '<option value="Voice Mail">Voice Mail</option>' +
            '<option value="On Trip">On Trip</option>' +
            '<option value="Customer Busy">Customer Busy</option>' +
            '<option value="Line Busy">Line Busy</option>' +
            '<option value="Wrong Number">Wrong Number</option>' +
            '<option value="Not Here/Meeting">Not Here/Meeting</option>' +
            '</select></td><td></td><tr>' +

            '<tr><td></td><td><select id="m-reached-reason" class="d-none form-select">' +
            '<option value="" selected>- Please Select -</option>' +
            '<option value="Consider">Consider</option>' +
            '<option value="Reject">Reject</option>' +
            '</select></td><td></td><tr>' +

            '<tr><td><span class="form-label pe-3 d-table-cell">' + langJson['l-campaign-assignto'] + '</span></td><td><select id="m-assign-to" class="form-select d-table-cell"><option value=0 unused=' + unassignment + '>Pool</option>' + agentOptionStr + '</select></td><td><span id="m-to-description" class="text-secondary d-table-cell ps-2">' + langJson['l-outbound-unassignment'] + unassignment + '</span></td></tr>' +
            '<tr><td><span class="me-2 d-table-cell">' + langJson['l-campaign-numrecords'] + '&nbsp;&nbsp;</span></td><td><input id="m-assign-no" type="number" min="1" class"form-control w-auto d-table-cell" autocomplete="off" maxlength="6" disabled></td><td><span id="m-assignable-description" class="text-secondary ps-2"></span></td></tr>' +
            '</table>' +
            '<button id="m-confirm-single-btn" class="btn rounded btn-sm btn-warning text-capitalize ms-2 mt-3"><i class="fas fa-clipboard-check me-2"></i><span>' + langJson['l-general-confirm'] + '</span></button>' +
            '</div>');

        $('#m-lower-part').append(lowerPartStr);

        allToOneNumUpdate(batchCode, campaignCode);

        $('#m-assign-to').on('change', function () {
            var selected = $(this).val();
            var unused = $('option:selected', this).attr('unused');
            if (selected == 0) { // 0 = pool
                $('#m-to-description').html('Unassignment: ' + unused);

                // case status has to be new lead, disable other options
                $('#m-call-result').val('NewLead').change();

                // disable is so not obvious, so will hide it directly
                $('#m-call-result').children().not(':first').hide();
            } else {
                var assigned = $('option:selected', this).attr('assigned');
                $('#m-to-description').html(langJson['l-campaign-assigned'] + ': ' + assigned + " " + langJson['l-campaign-unused'] + ": " + unused);

                // case status can select not new lead, all options shown
                $('#m-call-result').children().not(':first').show();
            }
        })

        $('#m-call-result').on('change', function () {
            var callStatus = $(this).val();
            if (callStatus == 'NewLead') {
                $('#m-unreach-reason').removeClass('d-block').addClass('d-none');
                $('#m-reached-reason').removeClass('d-block').addClass('d-none');

                // immediately check available no.
                allToOneNumUpdate(batchCode, campaignCode);
                $('#m-assignable-description').html('');
            } else if (callStatus == 'Unreach') {
                $('#m-unreach-reason').val(''); // selection change change to please select
                $('#m-unreach-reason').removeClass('d-none').addClass('d-block');
                $('#m-reached-reason').removeClass('d-block').addClass('d-none');

                // need to select call reason first
                $('#m-assignable-description').html('[Please select Call Reason for Call Result to get the Avaialble no.]');
                $('#m-assign-no').val('');
            } else if (callStatus == 'Reached') {
                $('#m-reached-reason').val(''); // selection change change to please select
                $('#m-reached-reason').removeClass('d-none').addClass('d-block');
                $('#m-unreach-reason').removeClass('d-block').addClass('d-none');

                // need to select call reason first
                $('#m-assignable-description').html('[Please select Call Reason for Call Result to get the Avaialble no.]');
                $('#m-assign-no').val('');
            }
        });

        $('#m-unreach-reason').on('change', function () {
            allToOneNumUpdate(batchCode, campaignCode);
        });

        $('#m-reached-reason').on('change', function () {
            allToOneNumUpdate(batchCode, campaignCode);
        });

        $('#m-confirm-single-btn').on('click', function () {
            $(this).prop('disabled', true);
            var callStatus = $('#m-call-result').val();
            var dataObj = {
                Batch_Code: batchCode,
                Campaign_Code: campaignCode,
                Assign_From: -999,
                Agent_Id: loginId,
                Token: token,
                Call_Status: callStatus
            }

            // need for verfy below
            var assignTo = parseInt($('#m-assign-to').val());

            // not new lead need to provide reason
            if (callStatus != 'NewLead') {
                var callReason = '';
                if (callStatus == 'Unreach') {
                    callReason = $('#m-unreach-reason').val();
                } else if (callStatus == 'Reached') {
                    callReason = $('#m-reached-reason').val();
                }

                // will not filter without reason
                if (callReason.length === 0) {
                    parent.$.MessageBox(langJson['l-outbound-details-call-status']);
                    $(this).prop('disabled', false);
                    return;
                } else {
                    dataObj['Call_Reason'] = callReason;
                }

                // cannot assign lead that is contacted back to the pool, but can assign to another agent
                if (assignTo == 0) {
                    parent.$.MessageBox(langJson['l-campaign-only-new-lead']);
                    $(this).prop('disabled', false);
                    return;
                }
            }

            dataObj['Assign_To'] = assignTo;

            // Assign_Total will no need to pass in this case

            $.ajax({
                type: "POST",
                url: mvcHost + '/mvc' + campaign + '/api/AssignOBBatchLead',
                data: JSON.stringify(dataObj),
                crossDomain: true,
                contentType: "application/json",
                dataType: 'json'
            }).always(function (r) {
                if (!/^success$/i.test(r.result || "")) {
                    console.log('error: ' + r.details);
                    parent.$.MessageBox(r.details);
                    // 'this' is not longer the button need to specify the button id
                    $('#m-confirm-single-btn').prop('disabled', false);
                } else {
                    batchTbl.$('tr.highlight').click();
                    setTimeout(function () {
                        $('#a-assign-all-btn').click()
                    }, 500);
                }
            })
        });
    })
}

// as need to get the used unused, so need to call everytime
function getAgentList(batchCode, campaignCode, callback) {
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/GetOBBatchAssignment_Agent',
        data: JSON.stringify({
            Batch_Code: batchCode,
            Campaign_Code: campaignCode,
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        var agentDetails = r.details;
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + rDetails);
        } else {
            callback(agentDetails);
        }
    })
}

function assignmentAgentTblLoad(data) {
    var batchCode = data.Batch_Code;
    var campaignCode = data.Campaign_Code;

    // get agent list remarks: currently Vincent hard coded get agent info table Level ID 1,2,3,4 agents only
    getAgentList(batchCode, campaignCode, function (agentDetails) {
        var agentOptionStr = "";
        for (let theAgentObj of agentDetails) {
            agentOptionStr += '<option assigned="' + theAgentObj.Assigned + '"  unused="' + theAgentObj.Unused + '" value=' + theAgentObj.Agent_Id + '>' + theAgentObj.AgentName + ' (ID: ' + theAgentObj.Agent_Id + ' )</option>'
        }

        // === Draw Lower Part
        var lowerPartStr = "";
        // Add From Select
        var unassignment = data.Unassigned;
        lowerPartStr += '<div id="a-agent-be-assigned-container" class="card my-2">' +
            '<div class="card-body">' +
            '<div class="mb-3 d-flex align-items-center mb-1">' +
            '<span class="form-label pe-3 d-table-cell">' + langJson['l-outbound-assign-from'] + '</span>' +
            '<select id="m-assign-from" class="form-select d-table-cell"><option value=0 unused=' + unassignment + '>Pool</option>' + agentOptionStr + '</select>' +
            '<span id="m-from-description" class="text-secondary d-table-cell ps-2">' + langJson['l-outbound-unassignment'] + unassignment + '</span>' +
            '<span style="position: absolute;right:0">' +
            '<div class="mb-3 d-flex align-items-center me-3 mb-0 d-inline">' +
            '<span>' + langJson['l-form-gender'] + '</span><select id="m-filter-gender" class="form-select c-customer-input"> <option value="">- Please Select -</option>' +
            '<option value="M">Male</option> <option value="F">Female</option> </select>' +
            '</div>' +
            '<div class="mb-3 d-flex align-items-center mb-0 d-inline">' +
            '<span>' + langJson['l-campaign-agefrom'] + '</span> <input id="m-filter-age-from" class="form-control" type="number" min="0" style="width:5rem">' +
            '</div>' +
            '<div class="mb-3 d-flex align-items-center mb-0 d-inline">' +
            '<span class="ps-2">' + langJson['l-campaign-ageto'] + '</span> <input id="m-filter-age-to" class="form-control" type="number" min="0" style="width:5rem">' +
            '</div>' +
            '<button id="m-filter-btn" class="btn rounded btn-sm btn-warning text-capitalize ms-2"><i class="fas fa-filter me-2"></i><span>' + langJson['l-outbound-filter'] + '</span></button>' +
            '</span>' +
            '</div>';

        // add Optional Call Result
        lowerPartStr += '<div id="m-call-result-container" class="mb-3 d-flex align-items-center mb-1 d-none"><span class="d-table-cell me-2">' + langJson['l-campaign-callstatus'] + '&nbsp;&nbsp;</span><select id="m-call-result" class="form-select d-table-cell"><option value="NewLead" selected>Null</option><option value="Unreach" style="display:none;">Unreach</option><option value="Reached" style="display:none;">Reached</option></select>' +

            '<select id="m-unreach-reason" class="d-none form-select">' +
            '<option value="" selected>- Please Select -</option>' +
            '<option value="No Answered">No Answered</option>' +
            '<option value="Voice Mail">Voice Mail</option>' +
            '<option value="On Trip">On Trip</option>' +
            '<option value="Customer Busy">Customer Busy</option>' +
            '<option value="Line Busy">Line Busy</option>' +
            '<option value="Wrong Number">Wrong Number</option>' +
            '<option value="Not Here/Meeting">Not Here/Meeting</option>' +
            '</select>' +

            '<select id="m-reached-reason" class="d-none form-select">' +
            '<option value="" selected>- Please Select -</option>' +
            '<option value="Consider">Consider</option>' +
            '<option value="Reject">Reject</option>' +
            '</select></div>';

        // Add To Select
        lowerPartStr += (
            '<div class="mb-3 d-flex align-items-center mb-1 m-single-assign-row d-none"><span class="form-label pe-3 d-table-cell">' + langJson['l-campaign-assignto'] + '</span><select id="m-assign-to" class="form-select d-table-cell"><option value=0 unused=' + unassignment + '>Pool</option>' + agentOptionStr + '</select><span id="m-to-description" class="text-secondary d-table-cell ps-2">' + langJson['l-outbound-unassignment'] + unassignment + '</span></div>' +
            '<div class="mb-3 m-single-assign-row d-none">&nbsp;</div>' +
            '<div class="mb-3 m-single-assign-row d-none"><span class="me-2 d-table-cell">' + langJson['l-campaign-numrecords'] + '&nbsp;&nbsp;</span><input id="m-assign-no" type="number" min="1" class"form-control w-auto d-table-cell" autocomplete="off" maxlength="6"><span id="m-assignable-description" class="text-secondary d-table-cell ps-2">' + langJson['l-outbound-available-no'] + ': ' + unassignment + '</span></div>' +
            '<button id="m-confirm-single-btn" class="btn rounded btn-sm btn-warning text-capitalize ms-2 mt-3 m-single-assign-ele d-none"><i class="fas fa-clipboard-check me-2"></i><span>' + langJson['l-general-confirm'] + '</span></button>' +
            '<div class="m-multiple-assign-ele mt-2"><table id="m-agent-tbl" class="table table-hover w-100"></table></div>' +
            '<button id="m-confirm-multiple-btn" class="btn rounded btn-sm btn-warning text-capitalize ms-2 mt-3 m-multiple-assign-ele"><i class="fas fa-clipboard-check me-2"></i><span>' + langJson['l-general-confirm'] + '</span></button>' +
            '</div>');

        $('#m-lower-part').append(lowerPartStr);

        $('#m-filter-btn').on('click', function () {
            $(this).prop('disabled', true);
            var assignFm = parseInt($('#m-assign-from').val());
            var gender = $('#m-filter-gender').val();
            var ageFm = $('#m-filter-age-from').val();
            var ageTo = $('#m-filter-age-to').val();
            var ageFmLen = ageFm.length;
            var ageToLen = ageTo.length;

            var dataObj = {
                Batch_Code: batchCode,
                Campaign_Code: campaignCode,
                Assign_From: assignFm,
                Agent_Id: loginId,
                Token: token
            }

            if (ageFmLen > 0 && ageToLen > 0) {
                if (isNaN(ageFm) || isNaN(ageTo)) {

                    // not valid number
                    parent.$.MessageBox(langJson['l-outbound-age-from-to-invalid']);
                    $(this).prop('disabled', false);
                    return;
                } else {
                    dataObj['Age_From'] = parseInt(ageFm);
                    dataObj['Age_To'] = parseInt(ageTo);
                }

            } else if ((ageFmLen > 0 && ageToLen == 0) || (ageToLen > 0 && ageFmLen == 0)) {

                // age from and age to have to have value together
                parent.$.MessageBox(langJson['l-outbound-age-from-to-together']);
                $(this).prop('disabled', false);
                return;
            }

            // verify and add keys
            if (gender.length > 0) {
                dataObj['Gender'] = gender;
            }

            // not pool will need to proivde status
            if (assignFm != 0) {
                var callStatus = $('#m-call-result').val();
                dataObj['Call_Status'] = callStatus;

                // not new lead need to provide reason
                if (callStatus != 'NewLead') {
                    var callReason = '';
                    if (callStatus == 'Unreach') {
                        callReason = $('#m-unreach-reason').val();
                    } else if (callStatus == 'Reached') {
                        callReason = $('#m-reached-reason').val();
                    }

                    // will not filter without reason
                    if (callReason.length === 0) {
                        $('#m-assignable-description').html('[Please select Call Reason for Call Result to get the Avaialble no.]');
                        $(this).prop('disabled', false);
                        return;
                    } else {
                        dataObj['Call_Reason'] = callReason;
                    }
                }
            }

            $.ajax({
                type: "POST",
                url: mvcHost + '/mvc' + campaign + '/api/GetOBBatchLeadCount',
                data: JSON.stringify(dataObj),
                crossDomain: true,
                contentType: "application/json",
                dataType: 'json'
            }).always(function (r) {
                if (!/^success$/i.test(r.result || "")) {
                    console.log('error: ' + (r.details || r));
                } else {
                    var theLeadCount = r.details.LeadCount;
                    if (assignFm == 0) {
                        $('#m-from-description').html('Unassignment: ' + theLeadCount);
                    } else {
                        $('#m-assignable-description').html(langJson['l-outbound-available-no'] + ': ' + theLeadCount);
                    }
                }
            }).done(function () {
                $('#m-filter-btn').prop('disabled', false);
            });
        })

        // Select From Select Change
        $('#m-assign-from').on('change', function () {
            var selected = parseInt($(this).val());
            var unused = $('option:selected', this).attr('unused');
            if (selected == 0) { // 0 = pool
                $('#m-from-description').html('Unassignment: ' + unused);
                $('#m-assignable-description').html(langJson['l-outbound-available-no'] + ': ' + unused);
                $('#m-call-result-container').addClass('d-none').removeClass('d-table-row');
                $('.m-single-assign-row').addClass('d-none').removeClass('d-table-row');
                $('.m-agent-tbl-input').val('');
                $('.m-single-assign-ele').addClass('d-none');
                $('.m-multiple-assign-ele').removeClass('d-none');
            } else {
                var assigned = $('option:selected', this).attr('assigned');
                $('#m-from-description').html(langJson['l-campaign-assigned'] + ': ' + assigned + " " + langJson['l-campaign-unused'] + ": " + unused);
                $('#m-assignable-description').html(langJson['l-outbound-available-no'] + ': ' + unused);
                $('#m-call-result-container').removeClass('d-none').addClass('d-table-row');
                $('#m-call-result').val('NewLead');
                $('#m-unreach-reason').removeClass('d-block').addClass('d-none');
                $('#m-reached-reason').removeClass('d-block').addClass('d-none');
                $('.m-single-assign-row').addClass('d-table-row').removeClass('d-none');
                $('.m-single-assign-ele').removeClass('d-none');
                $('.m-multiple-assign-ele').addClass('d-none');
            }
        });
        // Select To Select Change
        $('#m-assign-to').on('change', function () {
            var selected = $(this).val();
            var unused = $('option:selected', this).attr('unused');
            if (selected == 0) { // 0 = pool
                $('#m-to-description').html('Unassignment: ' + unused);

                // case status has to be new lead, disable other options
                $('#m-call-result').val('NewLead').change();

                // disable is so not obvious, so will hide it directly
                $('#m-call-result').children().not(':first').hide();
            } else {
                var assigned = $('option:selected', this).attr('assigned');
                $('#m-to-description').html(langJson['l-campaign-assigned'] + ': ' + assigned + " " + langJson['l-campaign-unused'] + ": " + unused);

                // case status can select not new lead, all options shown
                $('#m-call-result').children().not(':first').show();
            }
        });
        $('#m-call-result').on('change', function () {
            var callStatus = $(this).val();
            if (callStatus == 'NewLead') {
                $('#m-unreach-reason').removeClass('d-block').addClass('d-none');
                $('#m-reached-reason').removeClass('d-block').addClass('d-none');

                // immediately check available no.
                $('#m-filter-btn').click();
            } else if (callStatus == 'Unreach') {
                $('#m-unreach-reason').val(''); // selection change change to please select
                $('#m-unreach-reason').removeClass('d-none').addClass('d-block');
                $('#m-reached-reason').removeClass('d-block').addClass('d-none');

                // need to select call reason first
                $('#m-assignable-description').html('[Please select Call Reason for Call Result to get the Avaialble no.]');
            } else if (callStatus == 'Reached') {
                $('#m-reached-reason').val(''); // selection change change to please select
                $('#m-reached-reason').removeClass('d-none').addClass('d-block');
                $('#m-unreach-reason').removeClass('d-block').addClass('d-none');

                // need to select call reason first
                $('#m-assignable-description').html('[Please select Call Reason for Call Result to get the Avaialble no.]');
            }
        });
        $('#m-unreach-reason').on('change', function () {
            $('#m-filter-btn').click();
        });
        $('#m-reached-reason').on('change', function () {
            $('#m-filter-btn').click();
        });

        $('#m-confirm-single-btn').on('click', function () {
            $(this).prop('disabled', true);
            var assignFm = parseInt($('#m-assign-from').val());
            var gender = $('#m-filter-gender').val();
            var ageFm = $('#m-filter-age-from').val();
            var ageTo = $('#m-filter-age-to').val();
            var ageFmLen = ageFm.length;
            var ageToLen = ageTo.length;

            var dataObj = {
                Batch_Code: batchCode,
                Campaign_Code: campaignCode,
                Assign_From: assignFm,
                Agent_Id: loginId,
                Token: token
            }

            if (ageFmLen > 0 && ageToLen > 0) {
                if (isNaN(ageFm) || isNaN(ageTo)) {

                    // not valid number
                    parent.$.MessageBox(langJson['l-outbound-age-from-to-invalid']);
                    $(this).prop('disabled', false);
                    return;
                } else {
                    dataObj['Age_From'] = parseInt(ageFm);
                    dataObj['Age_To'] = parseInt(ageTo);
                }

            } else if ((ageFmLen > 0 && ageToLen == 0) || (ageToLen > 0 && ageFmLen == 0)) {

                // age from and age to have to have value together
                parent.$.MessageBox(langJson['l-outbound-age-from-to-together']);
                $(this).prop('disabled', false);
                return;
            }

            // verify and add keys
            if (gender.length > 0) {
                dataObj['Gender'] = gender;
            }

            // need for verfy below
            var assignTo = parseInt($('#m-assign-to').val());

            // not pool will need to proivde status
            if (assignFm != 0) {
                var callStatus = $('#m-call-result').val();
                dataObj['Call_Status'] = callStatus;

                // not new lead need to provide reason
                if (callStatus != 'NewLead') {
                    var callReason = '';
                    if (callStatus == 'Unreach') {
                        callReason = $('#m-unreach-reason').val();
                    } else if (callStatus == 'Reached') {
                        callReason = $('#m-reached-reason').val();
                    }

                    // will not filter without reason
                    if (callReason.length === 0) {
                        parent.$.MessageBox(langJson['l-outbound-details-call-status']);
                        $(this).prop('disabled', false);
                        return;
                    } else {
                        dataObj['Call_Reason'] = callReason;
                    }

                    // if assignFrom is agent, not pool, cannot assign lead that is contacted back to the pool, but can assign to another agent
                    if (assignTo == 0) {
                        parent.$.MessageBox(langJson['l-campaign-only-new-lead']);
                        $(this).prop('disabled', false);
                        return;
                    }
                }
            }

            // Verify if assign from and assign to are same, no update
            if (assignFm == assignTo) {
                $(this).prop('disabled', false);
                parent.$.MessageBox(langJson['l-campaign-assign-from-to-same']);
                return;
            }
            // Verify is that not assigning a valid number
            var assignNo = $('#m-assign-no').val();
            if (isNaN(assignNo) || assignNo.length == 0) {
                parent.$.MessageBox(langJson['l-campaign-no-assign-num']);
                $(this).prop('disabled', false);
                return;
            } else {
                assignNo = parseInt(assignNo);
                if (assignNo == 0) {
                    $(this).prop('disabled', false);
                    parent.$.MessageBox(langJson['l-campaign-zero-record']);
                    return;
                }
            }

            dataObj['Assign_To'] = assignTo;
            dataObj['Assign_Total'] = assignNo;

            $.ajax({
                type: "POST",
                url: mvcHost + '/mvc' + campaign + '/api/AssignOBBatchLead',
                data: JSON.stringify(dataObj),
                crossDomain: true,
                contentType: "application/json",
                dataType: 'json'
            }).always(function (r) {
                if (!/^success$/i.test(r.result || "")) {
                    console.log('error: ' + r.details);
                    parent.$.MessageBox(r.details);
                    // 'this' is not longer the button need to specify the button id
                    $('#m-confirm-single-btn').prop('disabled', false);
                } else {
                    batchTbl.$('tr.highlight').click();
                    setTimeout(function () {
                        $('#a-assign-agent-btn').click()
                    }, 500);
                }
            })
        });

        $('#m-confirm-multiple-btn').on('click', function () {
            $(this).prop('disabled', true);
            var rowNumOfTbl = agentTbl.rows().count();
            if (rowNumOfTbl == 0) {
                $(this).prop('disabled', false);
                return;
            }

            var assignFm = parseInt($('#m-assign-from').val());
            var gender = $('#m-filter-gender').val();
            var ageFm = $('#m-filter-age-from').val();
            var ageTo = $('#m-filter-age-to').val();
            var ageFmLen = ageFm.length;
            var ageToLen = ageTo.length;

            var dataObj = {
                Batch_Code: batchCode,
                Campaign_Code: campaignCode,
                Assign_From: assignFm,
                Agent_Id: loginId,
                Token: token
            }

            if (ageFmLen > 0 && ageToLen > 0) {
                if (isNaN(ageFm) || isNaN(ageTo)) {

                    // not valid number
                    parent.$.MessageBox(langJson['l-outbound-age-from-to-invalid']);
                    $(this).prop('disabled', false);
                    return;
                } else {
                    dataObj['Age_From'] = parseInt(ageFm);
                    dataObj['Age_To'] = parseInt(ageTo);
                }

            } else if ((ageFmLen > 0 && ageToLen == 0) || (ageToLen > 0 && ageFmLen == 0)) {

                // age from and age to have to have value together
                parent.$.MessageBox(langJson['l-outbound-age-from-to-together']);
                $(this).prop('disabled', false);
                return;
            }

            // verify and add keys
            if (gender.length > 0) {
                dataObj['Gender'] = gender;
            }

            // need to check the sum of total before sending any assign request
            var sendAgentArr = [];
            var assignToal = 0;
            var noErr = true;
            agentTbl.rows().every(function (rowIdx, tableLoop, rowLoop) {
                var cellInput = $(agentTbl.cell({
                    row: rowIdx,
                    column: 4
                }).node()).find('input');
                var assignNum = $(cellInput).val();
                if (assignNum.length > 0) {
                    var theAgentObj = agentTbl.row(rowIdx).data();
                    var assignTo = theAgentObj.Agent_Id;
                    var theAgentName = theAgentObj.AgentName;
                    if (!$.isNumeric(assignNum)) {

                        parent.$.MessageBox('Assign to ' + theAgentName + ' (ID: ' + assignTo + ' ) Failed.\nThe Number is Incorrect');
                        noErr = false;
                    } else if (assignNum < 1) {
                        parent.$.MessageBox('Assign to ' + theAgentName + ' (ID: ' + assignTo + ' ) Failed.\nThe Number has to be bigger than 0');
                        noErr = false;
                    } else {

                        // dataObj['Assign_To'] = assignTo;
                        // dataObj['Assign_Total'] = parseInt(assignNum);

                        var theAssignNum = parseInt(assignNum);
                        assignToal += theAssignNum;
                        sendAgentArr.push([theAgentName, assignTo, parseInt(theAssignNum)]);
                    }
                }
            });
            // get unassiment num of pool
            var unassingnNum = parseInt($('#m-from-description').text().replace('Unassignment: ', ''));
            if (assignToal > unassingnNum) {
                parent.$.MessageBox(langJson['l-outbound-failed-assign-bigger']);
                $(this).prop('disabled', false);
                return;
            }
            if (noErr) {
                if (assignToal == 0) {
                    parent.$.MessageBox(langJson['l-outbound-fill-in-records']);
                    $(this).prop('disabled', false);
                    return;
                } else {
                    // var totalAssignLen = sendAgentArr.length;
                    assignAgentMultiple(dataObj, sendAgentArr)
                    // sendAgentArr.forEach(function (theAgentAr) {
                    //     dataObj['Assign_To'] = theAgentAr[1];
                    //     dataObj['Assign_Total'] = theAgentAr[2];
                    //     $.ajax({
                    //         type: "POST",
                    //         url: mvcHost + '/mvc' + campaign + '/api/AssignOBBatchLead',
                    //         data: JSON.stringify(dataObj),
                    //         crossDomain: true,
                    //         contentType: "application/json",
                    //         dataType: 'json'
                    //     }).always(function (r) {
                    //         if (!/^success$/i.test(r.result || "")) {
                    //             console.log('error: ' + r.details);
                    //             parent.$.MessageBox('Assign to ' + theAgentAr[0] + ' (ID: ' + theAgentAr[1] + ' ) Failed.\n' + r.details);
                    //         }
                    //         totalAssignLen = totalAssignLen - 1;
                    //         if (totalAssignLen == 0) {
                    //             batchTbl.$('tr.highlight').click();
                    //             setTimeout(function () { $('#a-assign-agent-btn').click() }, 500);
                    //         }
                    //     }).done(function () {

                    //         // 'this' is not longer the button need to specify the button id
                    //         $('#m-confirm-multiple-btn').prop('disabled', false);
                    //     });
                    // })
                }
            } else {

                // not noErr
                $(this).prop('disabled', false);
            }
        });

        // draw Agent Table
        agentTbl = $('#m-agent-tbl').DataTable({
            data: agentDetails,
            dom: "tip",
            aaSorting: [
                [1, "desc"]
            ],
            pageLength: 10,
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
                title: langJson['l-search-agent-name'],
                data: "AgentName"
            }, {
                title: langJson['l-campaign-agentid'],
                data: "Agent_Id"
            }, {
                title: langJson['l-campaign-assigned'],
                data: "Assigned"
            }, {
                title: langJson['l-campaign-unused'],
                data: "Unused"
            }, {
                title: langJson['l-outbound-records-to-add'],
                render: function (data, type, row) {
                    return '<input type="number" min="1" />'
                }
            }]
        });

        // select Agent Button Clicked
        $('#m-agent-tbl tbody').on('click', '.agent-btn', function () {
            var data = agentTbl.row($(this).parents('tr')).data();
            $('#m-assign-from').val(data.id).change();
        });
    })
}

function loadBatchTbl(isOpen) {
    var isWithinBatch = isOpen ? $('#o-within-batch-period').prop('checked') : $('#a-within-batch-period').prop('checked');
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/GetOBBatch',
        data: JSON.stringify({
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
        } else {
            // for loop to get the input form name and refresh Open tab search field
            $('#o-search-batch').empty();
            var searchCampaignStr = '<option value="" campaigncode="">- Please Select -</option>';
            const today = new Date().setHours(0, 0, 0, 0);

            batchTblData = rDetails;
            var assignTblArr = [];

            // if no batch, rDetails will be null
            if (batchTblData != null) {
                if (isWithinBatch) {

                    // by opinion of Vincent, only shows table in between start date and end date at assign table and agent can open, depend customer may change this restriction
                    for (let batchObj of batchTblData) {
                        var startDate = Date.parse(batchObj.Batch_Start_Date);
                        var endDate = Date.parse(batchObj.Batch_End_Date);

                        // assign tab can assign future batches
                        var request = isOpen ? startDate <= today && endDate >= today : endDate >= today

                        if (request) {
                            var theCampaignCode = batchObj.Campaign_Code;
                            var theBatchCode = batchObj.Batch_Code.replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;").replaceAll("&", "&amp;").replace(/\\/g, "\\\\");

                            searchCampaignStr += '<option campaigncode=' + theCampaignCode + ' value=' + theBatchCode + '>' + theBatchCode + '</option>';

                            $('#o-search-campaign-select option[value="' + theCampaignCode + '"]').removeClass('d-none');
                            assignTblArr.push(batchObj);
                        }
                    }
                } else {
                    for (let batchObj of batchTblData) {

                        // both assign table and call list will not shown the batch not between start date and end date
                        var theCampaignCode = batchObj.Campaign_Code;
                        var theBatchCode = batchObj.Batch_Code;

                        searchCampaignStr += '<option campaigncode=' + theCampaignCode + ' value=' + theBatchCode + '>' + theBatchCode + '</option>';

                        $('#o-search-campaign-select option[value="' + theCampaignCode + '"]').removeClass('d-none');
                        assignTblArr.push(batchObj);
                    }
                }
            }

            $('#o-search-batch').append(searchCampaignStr);

            if (isOpen) {

                // select the first
                // $("#o-search-campaign-select").val($('#o-search-campaign-select option:eq(2)').val());
                $('#o-search-campaign-select').val($('#o-search-campaign-select option').not('.d-none').first().val()).trigger('change');
                $("#o-search-batch").val($('#o-search-batch option').not('.d-none').eq(1).val());

                // not auto search
                // $('#o-search-btn').click();
            }

            if (batchTbl) {
                $('#a-batch-tbl').DataTable().clear();
                $('#a-batch-tbl').DataTable().rows.add(assignTblArr); // Add new data
                $('#a-batch-tbl').DataTable().columns.adjust().draw(); // Redraw the DataTable
            } else {
                batchTbl = $('#a-batch-tbl').DataTable({
                    data: assignTblArr,
                    lengthChange: false,
                    aaSorting: [
                        [0, "desc"]
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
                    createdRow: function (row, data, index) {
                        $(row).addClass("cursor-pointer");
                    },
                    columns: [{
                        title: "",
                        data: "B_Id",
                        visible: false
                    }, {
                        title: langJson['l-outbound-batch-code'],
                        data: "Batch_Code"
                    }, {
                        title: langJson['l-outbound-campaign-code'],
                        data: "Campaign_Code"
                    }, {
                        title: langJson['l-form-status'],
                        data: "Batch_Status"
                    },
                    {
                        title: langJson['l-search-start-date'],
                        data: "Batch_Start_Date",
                        render: function (data, type, row) {
                            return data.slice(0, 10)
                        }
                    },
                    {
                        title: langJson['l-search-end-date'],
                        data: "Batch_End_Date",
                        render: function (data, type, row) {
                            return data.slice(0, 10)
                        }
                    }, {
                        title: langJson['l-scheduler-created-by'] + ' (Agent ID)',
                        data: "Created_By"
                    }, {
                        title: langJson['l-outbound-created-time'],
                        data: "Created_Time",
                        render: function (data, type, row) {
                            return data.slice(0, 10)
                        }
                    }
                    ],
                    columnDefs: [{
                        "targets": '_all',
                        "render": $.fn.dataTable.render.text()
                    }]
                });


                $('#a-batch-tbl tbody').on('click', 'tr', function (e) {
                    e.preventDefault();

                    // this function will need to refresh datat, so even highlighted, can click to related data
                    // highlight the row
                    batchTbl.$('tr.highlight').removeClass('highlight');
                    $(this).addClass('highlight');
                    // get data
                    var data = batchTbl.row(this).data();

                    // if no any batches, data will be undefined
                    if (typeof data != 'undefined') {
                        // clear Lower Part
                        $('#m-lower-part').empty();
                        // draw selected 1 row table
                        $.ajax({
                            type: "POST",
                            url: mvcHost + '/mvc' + campaign + '/api/GetOBBatchAssignment',
                            data: JSON.stringify({
                                Batch_Code: data.Batch_Code,
                                Campaign_Code: data.Campaign_Code,
                                Agent_Id: loginId,
                                Token: token
                            }),
                            crossDomain: true,
                            contentType: "application/json",
                            dataType: 'json'
                        }).always(function (r) {

                            if (!/^success$/i.test(r.result || "")) {
                                console.log('error: ' + rDetails);
                            } else {
                                var batchAssignDetails = r.details[0];
                                // add selected table html
                                var selectTblHtml = '<div class="card my-2"><div class="card-body pt-0"><div class="c-section">' +
                                    '<table id="m-selected-tbl" class="table w-100"></table></div></div></div>';

                                // TBD                                
                                // var selectTblHtml = '<div class="card my-2"><div class="card-body pt-0 bg-azure"><div class="c-section"><div class="my-1"><h5 class="d-inline">Selected Batch</h5>' +
                                // '<button id="a-assign-agent-btn" class="btn btn-sm rounded btn-warning text-capitalize float-end" style="margin-top: -5px;"><i class="fas fa-mouse-pointer me-2"></i><span>Assign to Agents</span></button>' +
                                // '<button id="a-return-select-batch-tbl" class="btn btn-sm rounded btn-lightgray text-capitalize float-end d-none" style="margin-top: -5px;"><i class="fas fa-arrow-left me-2"></i><span>Return</span></button></div>' +
                                // '<table id="m-selected-tbl" class="table w-100"></table></div></div></div>';

                                $('#m-lower-part').append(selectTblHtml);

                                // TBD
                                // $('#a-return-select-batch-tbl').on('click', function () {
                                //     $('#a-assign-call-list-card').removeClass('d-none');
                                //     $('#a-assign-agent-btn').removeClass('d-none');
                                //     $(this).addClass('d-none');
                                //     // $('#a-agent-be-assigned-container').empty(); // TBD
                                //     $('#a-agent-be-assigned-container').remove();
                                // })

                                data['Total'] = batchAssignDetails.Total;
                                data['Assigned'] = batchAssignDetails.Assigned;
                                data['Unassigned'] = batchAssignDetails.Unassigned;
                                $('#m-selected-tbl').DataTable({
                                    data: [data],
                                    dom: "t",
                                    "ordering": false,
                                    columns: [{
                                        title: langJson['l-outbound-batch-code'],
                                        data: "Batch_Code"
                                    }, {
                                        title: langJson['l-outbound-campaign-code'],
                                        data: "Campaign_Code"
                                    }, {
                                        title: langJson['l-campaign-total'],
                                        data: "Total"
                                    }, {
                                        title: langJson['l-campaign-assigned'],
                                        data: "Assigned"
                                    }, {
                                        title: langJson['l-campaign-unassigned'],
                                        data: "Unassigned"
                                    }, {
                                        className: 'a-assign-tbl-col',
                                        render: function (data, type, row) {
                                            var endDate = new Date(row.Batch_End_Date.slice(0, 10));

                                            // both assign table and call list will not shown the batch not between start date and end date
                                            if (endDate >= today) {
                                                return '<button id="a-assign-cancel-btn" class="btn btn-sm rounded btn-default text-capitalize float-end a-selected-batch-btn ms-2" style="display:none;"><i class="fas fa-times-circle me-2"></i><span>Cancel</span></button>' +
                                                    '<button id="a-assign-agent-btn" class="btn btn-sm rounded btn-warning text-capitalize float-end a-selected-batch-btn ms-2"><i class="fas fa-mouse-pointer me-2"></i><span>' +
                                                    langJson['l-outbound-assign-to-agents'] +
                                                    '</span></button>' +
                                                    '<button id="a-assign-all-btn" class="btn btn-sm rounded btn-success text-capitalize float-end a-selected-batch-btn"><i class="fas fa-mouse-pointer me-2"></i><span>All To One</span></button>'
                                            } else {
                                                return 'Exprired batches no assignment allowed'
                                            }
                                        }
                                    }],
                                    columnDefs: [{
                                        "targets": '_all',
                                        "render": $.fn.dataTable.render.text()
                                    }]
                                });

                                $('#a-assign-all-btn').on('click', function () {
                                    $(this).hide();
                                    $('#a-assign-agent-btn').show();
                                    $('#a-assign-cancel-btn').show();
                                    $('#a-batch-body').collapse('hide');

                                    // if previous clicked a-assign-agent-btn need to remove it
                                    $('#a-agent-be-assigned-container').remove();
                                    assignmentAllToOne(data)
                                })

                                $('#a-assign-agent-btn').on('click', function () {
                                    $(this).hide();
                                    $('#a-assign-all-btn').show();
                                    $('#a-assign-cancel-btn').show();
                                    $('#a-batch-body').collapse('hide');

                                    // if previous clicked a-assign-all-btn need to remove it
                                    $('#a-agent-be-assigned-container').remove();
                                    assignmentAgentTblLoad(data);
                                })

                                $('#a-assign-cancel-btn').on('click', function () {
                                    $(this).prop('disabled', true);
                                    $('#a-batch-body').collapse('show');
                                    $('#a-assign-cancel-btn').hide();
                                    $('#m-lower-part').empty();
                                    batchTbl.$('tr.highlight').removeClass('highlight');
                                })
                            }
                        });
                    }
                });
            }
        }
    });
}

function drawCCustomerTbl() {
    cCustDeselectArr = [];
    var customerTblStr = '<table id="c-customer-tbl" class="table w-100"></table><div class="mt-3 d-table"><p class="d-table-row"><span class="d-table-cell">Number of customer match the criteria at the moment:&nbsp;&nbsp;&nbsp;</span><span id="c-customer-total-no" class="d-table-cell"></span></p><p class="deselect-container d-none" style="display:table-row;"><span class="d-table-cell">Number of customer take away from the selection: </span><span id="c-customer-deselect-no" class="d-table-cell"></span></p><p class="deselect-container d-none" style="display:table-row"><span class="d-table-cell">Number of customer remaining in the selection: </span><span id="c-customer-remaining-no" class="d-table-cell" style="text-decoration: underline;font-weight:600"></span></p></div>';
    $('#c-customer-tbl-container').empty().append(customerTblStr);
    cCustomerAjaxData['Agent_Id'] = loginId;
    cCustomerAjaxData['Token'] = token;
    cCustomerTbl = $('#c-customer-tbl').DataTable({
        "serverSide": true,
        "ajax": {
            "url": mvcHost + '/mvc' + campaign + '/api/SearchCustomerForOutbound',
            "type": "POST",
            "contentType": "application/json",
            "data": function (d, settings) {
                // only sorting 2 columns allowed
                if (d.order.length > 2) {
                    d.order = d.order.slice(0, 2); // change the order array that pass to API
                    settings.aaSorting = settings.aaSorting.slice(0, 2); // this is to avoid the 3rd shift clicked arrow change
                    parent.$.MessageBox(langJson['l-campaign-max-sort-col']);
                }
                return JSON.stringify(Object.assign(cCustomerAjaxData, d));
            },
            "dataSrc": function (json) {
                return json.details;
            }
        },
        lengthChange: false,
        aaSorting: [
            [0, "asc"]
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
        initComplete: function (settings, json) {
            $('#c-name-section').removeClass('d-none');
            $('#c-customer-total-no').text(json.recordsTotal);
        },
        columns: [{
            title: langJson['l-search-full-name'],
            data: "Name_Eng"
        },
        {
            title: "Gender",
            data: "Gender"
        }, {
            title: "Email",
            data: "Email"
        }, {
            title: "Mobile",
            data: "Mobile_No"
        }, {
            title: "",
            data: "Customer_Id",
            'searchable': false,
            'orderable': false,
            'render': function (data, type, full, meta) {
                var checkedStr = ' checked';
                if (cCustDeselectArr.indexOf(data) != -1) {
                    checkedStr = '';
                }
                return '<div class="form-check" style="margin-top:-8px">' +
                    '<label class="form-check-label">' +
                    '<input class="form-check-input" type="checkbox" id="' + data + '" value="' + data + '"' + checkedStr + '>' +
                    '<span class="form-check-sign"><span class="check" title="Deselect Customer"></span></span></label></div>';
            }
        }
        ]
    });

    // Deselect checkbox change
    $('#c-customer-tbl tbody').on('change', '.form-check-input', function (e) {
        var isChecked = $(this).prop('checked');
        var customerId = parseInt($(this).val());
        // if checked
        if (isChecked) {
            // remove Customer ID from cCustDeselectArr
            cCustDeselectArr = cCustDeselectArr.filter(function (element) {
                return element != customerId
            });
        } else { // not checked
            cCustDeselectArr.push(customerId);
        }
        var recordTotal = cCustomerTbl.page.info().recordsTotal;
        var cCustDeselectArrLen = cCustDeselectArr.length;
        if (cCustDeselectArrLen > 0) {
            $('.deselect-container').removeClass('d-none');
            $('#c-customer-deselect-no').text(cCustDeselectArrLen);
            $('#c-customer-remaining-no').text(recordTotal - cCustDeselectArrLen);
        } else {
            $('.deselect-container').addClass('d-none');
        }
    });
    // Left Panel Event
    $("a.nav-link").click(function () {
        $('.tab-pane').removeClass('active show');
        var theHref = $(this).attr('href');
        $(theHref).addClass('active show');
    });
    // Input Form Select Event
    $('#c-campaign-tbl tbody').on('click', 'button', function (e) {
        cCustomerTbl.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
        $(this).parent().parent().addClass('highlight');
        $('#c-select-channel').removeClass('d-none');
        // NO DEL window.scrollTo(0,document.body.scrollHeight);
    });
}

function initCampaignTbl(tblDataArr) {
    var eproFormColumns = [{
        orderable: false,
        className: 'btnColumn',
        defaultContent: '<i title="Campaign Details" class="table-btn fas fa-search design cursor-pointer"></i>'
    },
    {
        title: langJson['l-outbound-campaign-code'],
        data: "Campaign_Code"
    }, {
        title: langJson['l-outbound-campaign-description'],
        data: "Campaign_Description"
    }, {
        title: langJson['l-outbound-form-name'],
        data: "Form_Name"
    }
    ]

    if (isCampaignSetup) {
        eproFormColumns.unshift({
            orderable: false,
            className: 'btnColumn',
            defaultContent: '<i title="Remove Campaign" class="table-btn fas fa-trash-alt remove-design cursor-pointer" data-bs-toggle="tooltip"></i>'
        })
    }

    var campaignTbl = $('#c-epro-campaign-tbl').DataTable({
        data: tblDataArr,
        lengthChange: false, // not showing 'Show ? per page' dropdown
        searching: false,
        "paging": true,
        columns: eproFormColumns,
        pageLength: 10,
        aaSorting: [],
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

    $('#c-epro-campaign-tbl tbody').on('click', '.design', function () {
        var data = campaignTbl.row($(this).parents('tr')).data();
        getInputForm(data);
    });

    if (isCampaignSetup) {

        $('#c-epro-campaign-tbl tbody').on('click', '.remove-design', function () {
            if (confirm('Are you sure you want to remove the campaign?')) {
                var data = campaignTbl.row($(this).parents('tr')).data();

                var dataObj = {
                    Agent_Id: loginId,
                    Token: token,
                    Campaign_Id: data.Campaign_Id,
                    S_Action: "Delete"
                }

                $.ajax({
                    type: "PUT",
                    url: mvcHost + '/mvc' + campaign + '/api/UpdateOBCampaign',
                    data: JSON.stringify(dataObj),
                    crossDomain: true,
                    contentType: "application/json",
                    dataType: 'json'
                }).always(function (r) {
                    if (!/^success$/i.test(r.result || "")) {
                        parent.$.MessageBox(r.details || 'Failed to delete the campaign');
                    } else {
                        campaignInitTbl();
                    }
                });
            }
        });
    }
}

function campaignInitTbl(returnToNonEpro) {
    var eproActiveStr = ' in active';
    var nonEproActiveStr = '';
    if (returnToNonEpro) {
        eproActiveStr = '';
        nonEproActiveStr = ' in active';
    }
    $('#c-container').empty();
    var customerTblStr =
   //     '<ul id="tabs" class="nav nav-tabs nav-fill" role="tablist"> <li class="nav-item case-element"> <a class="nav-link active pt-2" data-bs-toggle="tab" href="#c-epro-form-list" aria-selected="true"><span>' + langJson['l-outbound-epro-created-form'] + '</span><i class="fas fa-user ms-2"></i></a> </li><li class="nav-item"> <a class="nav-link pt-2" data-bs-toggle="tab" href="#c-non-epro-form-list" aria-selected="false"><span>' + langJson['l-outbound-form-builder-form'] + '</span><i class="fas fa-file-alt ms-2"></i></a> </li></ul>' +
   //     '<div class="tab-content c-tab-content">' +
		
        '<ul id="tabs" class="nav nav-tabs nav-fill" role="tablist"> <li class="nav-item case-element"> <a class="nav-link active pt-2" data-bs-toggle="tab" href="#c-epro-form-list" aria-selected="true"><span>' + langJson['l-outbound-epro-created-form'] + '</span><i class="fas fa-file-alt ms-2"></i></a> </li></ul>' +
        '<div class="tab-content c-tab-content">' +		
        '<div id="c-epro-form-list" class="tab-pane' + eproActiveStr + '">' +

        (isCampaignSetup ? '<button id="c-add-epro-form-design-btn" class="btn rounded btn-sm btn-warning mb-3 text-capitalize"><i class="fas fa-plus-square me-2"></i><span>' + langJson['l-outbound-add-campaign-epro'] + '</span></button>' : '') +
        '<table id="c-epro-campaign-tbl" class="table w-100"></table>' +
        '</div>' +
        '<div id="c-non-epro-form-list" class="tab-pane' + nonEproActiveStr + '">' +

        '<button id="c-add-non-epro-form-design-btn" class="btn rounded btn-sm btn-warning mb-3 text-capitalize"><i class="fas fa-plus-square me-2"></i><span>' + langJson['l-outbound-add-campaign-form-builder'] + '</span></button>' +
        '<table id="c-non-epro-campaign-tbl" class="table w-100"></table>'
    '</div></div>';

    $('#c-container').append(customerTblStr);

    if (isCampaignSetup) {
        $('#c-add-epro-form-design-btn').on('click', function () {
            getInputForm();
        })
    }


    $('#c-add-non-epro-form-design-btn').on('click', function () {
        campaignAddFormNonEpro();
    })

    var dataObj = {
        Agent_Id: loginId,
        Token: token
    }

    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/GetOBCampaign',
        data: JSON.stringify(dataObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            parent.$.MessageBox('Get Campaign Error');
        } else {
            initCampaignTbl(r.details || []);
        }
    });

    var tbd_non_epro_campaign_tbl_Arr = [{
        C_Id: 2,
        C_Name: "ABC_Q2_M",
        C_Description: "ABC 2nd Quarater Male",
        Is_Form_Builder: true,
        Got_Form_Structure: true,
        Got_Form_JSON: true,
        Form_Name: '<button class="btn rounded btn-sm btn-warning mt-3 mb-2 text-capitalize"><i class="fas fa-plus-square me-2"></i><span>View Form Structure</span></button>', // "[Form Builder Created]"
        D_Arr_JSON: [{
            Excel_Header: "ABC_REF",
            DB_Header: "REF_ID",
            Label_Name: "ABC REF",
            Check_Type: "",
            Input_Type: "Text",
            Allow_Empty: false,
            Upload_Order: 1
        }, {
            Excel_Header: "Given Name",
            DB_Header: "First_Name",
            Label_Name: "First Name",
            Check_Type: "String",
            Input_Type: "Text",
            Allow_Empty: true,
            Upload_Order: 2
        }, {
            Excel_Header: "Surname",
            DB_Header: "Last_Name",
            Label_Name: "Last Name",
            Check_Type: "",
            Input_Type: "Text",
            Allow_Empty: true,
            Upload_Order: 3
        }, {
            Excel_Header: "Mobile",
            DB_Header: "Mobile_No",
            Label_Name: "Mobile",
            Check_Type: "number",
            Input_Type: "telephone",
            Allow_Empty: true,
            Upload_Order: 4
        }, {
            Excel_Header: null,
            DB_Header: "Mobile_No",
            Label_Name: "Mobile",
            Check_Type: null,
            Input_Type: "telephone",
            Allow_Empty: null,
            Upload_Order: null,
        }]
    }, {
        C_Id: 3,
        C_Name: "ABC_Q3_M",
        C_Description: "ABC 3rd Quarater Male",
        Is_Form_Builder: true,
        Form_Name: null,
        Got_Form_Structure: true,
        Got_Form_JSON: false,
        D_Arr_JSON: [{
            Excel_Header: "ABC_REF",
            DB_Header: "REF_ID",
            Label_Name: "ABC REF",
            Check_Type: "",
            Input_Type: "Text",
            Allow_Empty: false,
            Upload_Order: 1
        }, {
            Excel_Header: "Given Name",
            DB_Header: "First_Name",
            Label_Name: "First Name",
            Check_Type: "String",
            Input_Type: "Text",
            Allow_Empty: true,
            Upload_Order: 2
        }, {
            Excel_Header: "Surname",
            DB_Header: "Last_Name",
            Label_Name: "Last Name",
            Check_Type: "",
            Input_Type: "Text",
            Allow_Empty: true,
            Upload_Order: 3
        }, {
            Excel_Header: "Mobile",
            DB_Header: "Mobile_No",
            Label_Name: "Mobile",
            Check_Type: "number",
            Input_Type: "telephone",
            Allow_Empty: true,
            Upload_Order: 4
        }, {
            Excel_Header: null,
            DB_Header: "Mobile_No",
            Label_Name: "Mobile",
            Check_Type: null,
            Input_Type: "telephone",
            Allow_Empty: null,
            Upload_Order: null,
        }]
    }, {
        C_Id: 4,
        C_Name: "ABC_Q3_M",
        C_Description: "ABC 3rd Quarater Male",
        Is_Form_Builder: true,
        Form_Name: null,
        Got_Form_Structure: false,
        Got_Form_JSON: false,
        D_Arr_JSON: [{
            Excel_Header: "ABC_REF",
            DB_Header: "REF_ID",
            Label_Name: "ABC REF",
            Check_Type: "",
            Input_Type: "Text",
            Allow_Empty: false,
            Upload_Order: 1
        }, {
            Excel_Header: "Given Name",
            DB_Header: "First_Name",
            Label_Name: "First Name",
            Check_Type: "String",
            Input_Type: "Text",
            Allow_Empty: true,
            Upload_Order: 2
        }, {
            Excel_Header: "Surname",
            DB_Header: "Last_Name",
            Label_Name: "Last Name",
            Check_Type: "",
            Input_Type: "Text",
            Allow_Empty: true,
            Upload_Order: 3
        }, {
            Excel_Header: "Mobile",
            DB_Header: "Mobile_No",
            Label_Name: "Mobile",
            Check_Type: "number",
            Input_Type: "telephone",
            Allow_Empty: true,
            Upload_Order: 4
        }, {
            Excel_Header: null,
            DB_Header: "Mobile_No",
            Label_Name: "Mobile",
            Check_Type: null,
            Input_Type: "telephone",
            Allow_Empty: null,
            Upload_Order: null,
        }]
    }]

    var nonEproFormColumns = [{
        defaultContent: '<i title="Re-Use Design" class="table-btn fas fa-redo reuse-design" data-bs-toggle="tooltip"></i>',
        orderable: false,
        className: 'btnColumn'
    }, {
        orderable: false,
        className: 'btnColumn',
        defaultContent: '<i title="Remove Design" class="table-btn fas fa-trash-alt remove-design" data-bs-toggle="tooltip"></i>'
    }, {
        orderable: false,
        className: 'btnColumn',
        defaultContent: '<i title="See Design" class="table-btn far fa-list-alt design-details" data-bs-toggle="tooltip"></i>'
    }, {
        orderable: false,
        className: 'btnColumn',
        defaultContent: '<i title="Preview Form" class="table-btn fas fa-search design-details" data-bs-toggle="tooltip"></i>'
    },
    {
        title: "ID",
        data: "C_Id"
    }, {
        title: langJson['l-main-name'],
        data: "C_Name"
    }, {
        title: langJson['l-outbound-description'],
        data: "C_Description"
    },
    // {
    //     title: "Is Form Builder Form",
    //     data: "Is_Form_Builder",
    //     render: function (data) {
    //         if (data === true) {
    //             return 'Y';
    //         } else {
    //             return 'N';
    //         }
    //     }
    // }, 
    {
        //     title: "Form Name",
        //     data: "Form_Name",
        //     render: function (data) {
        //         if (data && data.length > 0) {
        //             return data;
        //         } else {
        //             return 'N/A';
        //         }
        //     }
        // }, {
        title: langJson['l-form-status'],
        render: function (data, type, row) {
            console.log(data);
            if (row.Is_Form_Builder === false || (row.Is_Form_Builder && row.Got_Form_Structure && row.Got_Form_JSON)) {
                return 'Active';
            } else {
                if (row.Got_Form_Structure === false) {
                    return '<button onclick="return campaignBuildForm()" class="btn rounded btn-sm btn-warning text-capitalize" style="width:278px;text-align: left;"><i class="fas fa-plus-square me-2"></i><span>' + langJson['l-outbound-build-form-required'] + '</span></button>';
                } else { // no form json
                    return '<button onclick="return campaignAddFormStructure()" class="btn rounded btn-sm btn-warning text-capitalize" style="width:278px;text-align: left"><i class="fas fa-plus-square me-2"></i><span>' + langJson['l-outbound-form-structure-required'] + '</span></button>';
                }
            }
        }
    }
        // , {
        //     title: "Status",
        //     render: function (data, row) {
        //         if (row.Is_Form_Builder === false || row.F_Id != null) {
        //             return '[Form Builder Form Not Yet Created]'
        //         } else {
        //             return data;
        //         }
        //     }
        // }
    ]

    $('#c-non-epro-campaign-tbl').DataTable({
        data: tbd_non_epro_campaign_tbl_Arr,
        lengthChange: false, // not showing 'Show ? per page' dropdown
        searching: false,
        "paging": true,
        columns: nonEproFormColumns,
        pageLength: 10,
        aaSorting: [],
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
    // Deselect checkbox change
    $('#c-customer-tbl tbody').on('change', '.form-check-input', function (e) {
        var isChecked = $(this).prop('checked');
        var customerId = parseInt($(this).val());
        // if checked
        if (isChecked) {
            // remove Customer ID from cCustDeselectArr
            cCustDeselectArr = cCustDeselectArr.filter(function (element) {
                return element != customerId
            });
        } else { // not checked
            cCustDeselectArr.push(customerId);
        }
        var recordTotal = cCustomerTbl.page.info().recordsTotal;
        var cCustDeselectArrLen = cCustDeselectArr.length;
        if (cCustDeselectArrLen > 0) {
            $('.deselect-container').removeClass('d-none');
            $('#c-customer-deselect-no').text(cCustDeselectArrLen);
            $('#c-customer-remaining-no').text(recordTotal - cCustDeselectArrLen);
        } else {
            $('.deselect-container').addClass('d-none');
        }
    });
}

function campaignUploadedExcelHeader(input) {
    if (input.files && input.files[0]) {
        $('#c-warning-txt').text('');
        var fileData = new FormData();
        fileData.append("files", input.files[0]);
        fileData.append('Agent_Id', loginId);
        fileData.append('Token', token);
        $('#c-select-sheet-tr').addClass('d-none');
        $('#c-header-field-tr').addClass('d-none');
        $.ajax({
            url: mvcHost + '/mvc' + campaign + '/api/UploadExcelGetWorksheet',
            type: "POST",
            contentType: false, // Not to set any content header  
            processData: false, // Not to process data  
            data: fileData,
            dataType: 'multipart/form-data',
        }).always(function (r) {
            // status 200 , response is still fail by form data request
            var response = JSON.parse(r.responseText);
            if (!/^success$/i.test(response.result || "")) {
                if (response.details) {
                    parent.$.MessageBox('Upload Excel Failed\r\n' + response.details);
                } else {
                    parent.$.MessageBox('Upload Excel Failed');
                }
            } else {
                $('#c-form-select').prop('disabled', true);
                var optStr = '<option value="" style="display:none;" selected>-- Please Select --</option>';
                var worksheetArr = response.worksheet;
                var filePath = response.filepath;
                for (let theWorksheetName of worksheetArr) {
                    optStr += ('<option value="' + theWorksheetName + '">' + theWorksheetName + '</option>');
                }
                $('#c-excel-sheet-select').attr('filepath', filePath).empty().append(optStr);
                $('#c-select-sheet-tr').removeClass('d-none');

                // by opinion of Kenneth, 99% of call list use sheet 1, so default sheet 1
                $("#c-excel-sheet-select").val($("#c-excel-sheet-select option:eq(1)").val()).change()
            }
        });
    }
}

function campaignGetExcelHeader(oThis) {

    var headerSelect = $(oThis);
    var filePath = headerSelect.attr('filepath');
    var selectedWorksheet = headerSelect.val();

    if (selectedWorksheet.length > 0) {

        var dataObj = {
            Agent_Id: loginId,
            Token: token,
            File_Path: filePath,
            WorkSheet: selectedWorksheet
        }

        $.ajax({
            type: "POST",
            url: mvcHost + '/mvc' + campaign + '/api/GetExcelWorksheetHeader',
            data: JSON.stringify(dataObj),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                parent.$.MessageBox('Get Worksheet Header Failed');
            } else {
                campaignLoadDBHeader(r.details.Call_list_ColumnName);
            }
        });
    }
}

// TBD DB Header can be no select and excel header cannot be changed
// function campaignCheckAllDbHeaderSelected(isReadOnly) {
//     var allSelected = true;
//     $('.c-db-header').each(function () {
//         if ($(this).val().length == 0) {
//             allSelected = false;
//             return false; // this can break the each loop, but will not exist the function
//         }
//     })
//     if (typeof isReadOnly == 'undefined') {
//         if (allSelected) {
//             $('#c-save-btn').prop('disabled', false);
//         } else {
//             $('#c-save-btn').prop('disabled', true);
//         }
//     } else {
//         if (allSelected) {
//             var allExcelFilled = true;
//             // check is that all excel fields not empty also
//             $('.c-excel-header').each(function () {
//                 if ($(this).val().length == 0) {
//                     allExcelFilled = false;
//                     return false; // this can break the each loop, but will not exist the function
//                 }
//             })
//             if (allExcelFilled) {
//                 $('#c-save-btn').prop('disabled', false);
//             } else {
//                 $('#c-save-btn').prop('disabled', true);
//             }
//         } else {
//             $('#c-save-btn').prop('disabled', true);
//         }
//     }
// }
// /TBD

function campaignHideShowDbHeader() {
    var allDbSelect = $('.c-db-header');
    var selectedValArr = [];
    for (let theSelect of allDbSelect) {
        var selectedVal = $(theSelect).val();
        if (selectedVal.length > 0) {
            selectedValArr.push(selectedVal);
        }
    }

    // all db options
    var alldbArr = [];
    $('.c-db-header').first().find('option:not(:eq(0))').each(function () // eq(0) is Please Select
    {
        alldbArr.push($(this).val());
        // Add $(this).val() to your list
    });

    if (selectedValArr.length === 0) {

        // show all db options
        allDbSelect.children().show();
    } else if (selectedValArr.length == alldbArr.length) {

        // show all db options
        allDbSelect.find('option:not(:eq(0))').hide();
    } else {
        for (let theDbVal of alldbArr) {

            // the db field selected
            if (selectedValArr.includes(theDbVal)) {

                // hide what show not show
                $('.c-db-header option[value="' + theDbVal + '"]:not(:selected)').hide();
            } else {
                $('.c-db-header option[value="' + theDbVal + '"]').show();
            }
        }

    }
}

function campaignLoadDBHeader(headerArr, isReadOnly) {

    if (headerArr.length == 1 && headerArr[0] == 'F1') {
        $('#c-upload-field-content-td').empty().append(langJson['l-outbound-no-header']);
    } else {

        var dbHeaderArr = JSON.parse($('#c-form-select option:selected').attr('dbheader'));
        var uploadTblStr = '<table class="custom-tbl"><tr><th>' + langJson['l-outbound-order'] + '</th><th>' + langJson['l-outbound-excel-header'] + '</th><th>' + langJson['l-outbound-db-header'] + '</th><th>' + langJson['l-outbound-check-type'] + '</th><th></th></tr><tbody id="c-header-tbody">';
        if (isReadOnly) {
            for (let theHeader of headerArr) {
                var selectedDbHeader = theHeader.DB_Field_Name;
                var dbSelectStr = '<select class="form-select pe-2 c-db-header c-template-field" disabled><option value="">-- Please Select --</option>';
                for (let theDbHeader of dbHeaderArr) {
                    var theDBHeaderName = theDbHeader.Name;
                    if (theDBHeaderName == selectedDbHeader) {
                        dbSelectStr += '<option value="' + theDBHeaderName + '" type="' + theDbHeader.Type + '" selected>' + theDBHeaderName + '</option>'
                    } else {
                        dbSelectStr += '<option value="' + theDBHeaderName + '" type="' + theDbHeader.Type + '">' + theDBHeaderName + '</option>'
                    }
                }
                dbSelectStr += '</select>';
                var checkTypeOptStr = '';
                if (theHeader.Check_Type.length == 0) {
                    checkTypeOptStr = '<option value="">N/A</option><option value="Date">Date Time [YYYY-MM-DD]</option>'
                } else {
                    checkTypeOptStr = '<option value="">N/A</option><option value="Date" selected>Date Time [YYYY-MM-DD]</option>'
                }
                uploadTblStr += ('<tr><td>' + theHeader.Excel_Field_Order + '</td><td>' + theHeader.Excel_Field_Name + '</td><td>' + dbSelectStr + '</td><td><select class="form-select pe-2" disabled>' + checkTypeOptStr + '</select></td></tr>');
            }
        } else {
            var dbHeaderArr = JSON.parse($('#c-form-select option:selected').attr('dbheader'));
            var uploadTblStr = '<table class="custom-tbl"><tr><th>Order</th><th>Excel Header</th><th>' + langJson['l-outbound-db-header'] + '</th><th>' + langJson['l-outbound-check-type'] + '</th></tr><tbody id="c-header-tbody">';
            for (var i = 0; i < headerArr.length; i++) {
                var theHeader = headerArr[i];
                var dbSelectStr = '<select class="form-select pe-2 c-db-header"><option value="">-- Please Select --</option>';
                for (let theDbHeader of dbHeaderArr) {
                    var theDBHeaderName = theDbHeader.Name;
                    if (theDBHeaderName == theHeader) {
                        dbSelectStr += '<option value="' + theDBHeaderName + '" type="' + theDbHeader.Type + '" selected>' + theDBHeaderName + '</option>'
                    } else {
                        dbSelectStr += '<option value="' + theDBHeaderName + '" type="' + theDbHeader.Type + '">' + theDBHeaderName + '</option>'
                    }
                }
                dbSelectStr += '</select>';
                uploadTblStr += ('<tr><td>' + (i + 1) + '</td><td>' + theHeader + '</td><td>' + dbSelectStr + '</td><td><select class="form-select pe-2"><option value="">N/A</option><option value="Date">Date Time [YYYY-MM-DD]</option></select></td></tr>');
            }
        }

        $('#c-upload-field-content-td').empty().append(uploadTblStr);

        $('.c-db-header').on('change', function () {
            // campaignCheckAllDbHeaderSelected(isReadOnly);
            if ($(this).find('option:selected').attr('type') == 'Date') {
                $(this).parent().next().children().val('Date').prop('disabled', true);
            } else {
                $(this).parent().next().children().prop('disabled', false);
            }
            campaignHideShowDbHeader();
        })

        campaignHideShowDbHeader(); // check for the first time()
    }
}

function uploadeExcelHeaderNonEpro() {

    var dbSelectStr = '<select class="form-select pe-2"><option value="">-- Please Select --</option><option>First_Name</option><option>Last_Name</option><option>Mobile_No</option><option>Age</option><option>AC_Open_Date</option><option>Last_Contact_Date</option><option>Last_Purchase_Date</option><option>Custom_Field_1</option><option>Custom_Field_2</option><option>Custom_Field_3</option></select>';
    var dbSelectStr1 = '<select class="form-select pe-2"><option value="">-- Please Select --</option><option selected>First_Name</option><option>Last_Name</option><option>Mobile_No</option><option>Age</option><option>AC_Open_Date</option><option>Last_Contact_Date</option><option>Last_Purchase_Date</option><option>Custom_Field_1</option><option>Custom_Field_2</option><option>Custom_Field_3</option></select>';
    var dbSelectStr2 = '<select class="form-select pe-2"><option value="">-- Please Select --</option><option>First_Name</option><option selected>Last_Name</option><option>Mobile_No</option><option>Age</option><option>AC_Open_Date</option><option>Last_Contact_Date</option><option>Last_Purchase_Date</option><option>Custom_Field_1</option><option>Custom_Field_2</option><option>Custom_Field_3</option></select>';
    var dbSelectStr3 = '<select class="form-select pe-2"><option value="">-- Please Select --</option><option>First_Name</option><option>Last_Name</option><option selected>Mobile_No</option><option>Age</option><option>AC_Open_Date</option><option>Last_Contact_Date</option><option>Last_Purchase_Date</option><option>Custom_Field_1</option><option>Custom_Field_2</option><option>Custom_Field_3</option></select>';
    var dbSelectStr4 = '<select class="form-select pe-2"><option value="">-- Please Select --</option><option>First_Name</option><option>Last_Name</option><option>Mobile_No</option><option selected>Age</option><option>AC_Open_Date</option><option>Last_Contact_Date</option><option>Last_Purchase_Date</option><option>Custom_Field_1</option><option>Custom_Field_2</option><option>Custom_Field_3</option></select>';

    var uploadTblStr = '<table class="custom-tbl"><tr><th>Order</th><th>Excel Header</th><th>' + langJson['l-outbound-db-header'] + '</th><th>' + langJson['l-outbound-check-type'] + '</th></tr><tbody>' +
        '<tr><td>1</td><td>First_Name</td><td>' + dbSelectStr1 + '</td><td><select class="form-select pe-2"><option value="">N/A</option><option value="datetime">Date Time [YYYY-MM-DD]</option></select></td></td></tr>' +
        '<tr><td>2</td><td>Last_Name</td><td>' + dbSelectStr2 + '</td><td><select class="form-select pe-2"><option value="">N/A</option><option value="datetime">Date Time [YYYY-MM-DD]</option></select></td></tr>' +
        '<tr><td>3</td><td>Mobile</td><td>' + dbSelectStr + '</td><td><select class="form-select pe-2"><option value="">N/A</option><option value="datetime">Date Time [YYYY-MM-DD]</option></select></td></tr>' +
        '<tr><td>4</td><td>Age</td><td>' + dbSelectStr4 + '</td><td><select class="form-select pe-2"><option value="">N/A</option><option value="datetime">Date Time [YYYY-MM-DD]</option></select></td></tr>' +
        '<tr><td>5</td><td>A/C Open Date</td><td>' + dbSelectStr + '</td><td><select class="form-select pe-2"><option value="">N/A</option><option value="datetime">Date Time [YYYY-MM-DD]</option></select></td></tr>' +
        '<tr><td>6</td><td>Last Contact Date</td><td>' + dbSelectStr + '</td><td><select class="form-select pe-2"><option value="">N/A</option><option value="datetime">Date Time [YYYY-MM-DD]</option></select></td></tr>' +
        '<tr><td>7</td><td>Last Purchase Product</td><td>' + dbSelectStr + '</td><td><select class="form-select pe-2"><option value="">N/A</option><option value="datetime">Date Time [YYYY-MM-DD]</option></select></td></tr>' +
        '</tbody></table>'

    $('#c-upload-field-content-td').empty().append(uploadTblStr);
}

function campaignAddFormStructure() {
    let row = {
        C_Id: 4,
        C_Name: "ABC_Q3_M",
        C_Description: "ABC 3rd Quarater Male",
        Is_Form_Builder: true,
        Form_Name: null,
        Got_Form_Structure: false,
        Got_Form_JSON: false,
        Upload_Arr: [{
            Order: 1,
            Excel_Header: "First_Name",
            DB_Header: "First_Name",
            Check_Type: "",
            Allow_Empty: false
        }, {
            Order: 2,
            Excel_Header: "Last_Name",
            DB_Header: "Last_Name",
            Check_Type: "",
            Allow_Empty: false
        }, {
            Order: 3,
            Excel_Header: "Mobile",
            DB_Header: "Mobile",
            Check_Type: "",
            Allow_Empty: false
        }, {
            Order: 4,
            Excel_Header: "Age",
            DB_Header: "Age",
            Check_Type: "",
            Allow_Empty: false
        }, {
            Order: 5,
            Excel_Header: "A/C Open Date",
            DB_Header: "AC_Open_Date",
            Check_Type: "",
            Allow_Empty: false
        }, {
            Order: 6,
            Excel_Header: "Last Contact Date",
            DB_Header: "Last_Contact_Date",
            Check_Type: "",
            Allow_Empty: false
        }, {
            Order: 7,
            Excel_Header: "Last Purchase Product",
            DB_Header: "Last_Purchase_Date",
            Check_Type: "",
            Allow_Empty: false
        }]
    }

    var rowUploadArr = row.Upload_Arr;
    var dbSelectStr = '<select class="form-select pe-2"><option value="">-- Please Select --</option><option>Custom_Field_1</option><option>Custom_Field_2</option><option>Custom_Field_3</option></select>';
    var emptyFieldRowStr = '<tr><td></td><td></td><td>' + dbSelectStr + '</td><td></td><td class="bg-lavender"><select class="form-select pe-2"><option vlaue="text">Text Field</option><option vlaue="radio">Radio</option><option vlaue="textarea">Textarea</option><option vlaue="date">Date</option></select></td><td class="bg-lavender"><input type="search" class="form-control" value=""></td></tr>';

    var selectStr = '<select class="form-select pe-2"><option vlaue="text">Text Field</option><option vlaue="radio">Radio</option><option vlaue="textarea">Textarea</option><option vlaue="date">Date</option></select>';
    var uploadTblStr = '<table id="upload-tbl" class="custom-tbl">' +
        '<tr><th>' + langJson['l-outbound-order'] + '</th><th>' + langJson['l-outbound-excel-header'] + '</th><th>' + langJson['l-outbound-db-header'] + '</th><th>' + langJson['l-outbound-check-type'] + '</th><th class="bg-lavender">' + langJson['l-outbound-input-type'] + '</th><th class="bg-lavender">' + langJson['l-outbound-label-name'] + '</th></tr><tbody id="c-other-field-tbody">';
    for (let fieldObj of rowUploadArr) {
        uploadTblStr += ('<tr><td>' + fieldObj.Order + '</td><td>' + fieldObj.Excel_Header + '</td><td>' + (fieldObj.DB_Header.length == 0 ? dbSelectStr : fieldObj.DB_Header) + '</td><td>' + (fieldObj.DB_Header.length == 0 ? '' : (fieldObj.Check_Type && fieldObj.Check_Type.length > 0 ? fieldObj.Check_Type : 'N/A')) + '</td><td class="bg-lavender">' + selectStr + '</td><td class="bg-lavender"><input type="search" class="form-control" value="' + fieldObj.Excel_Header + '" /></td></tr>');
    }
    uploadTblStr += emptyFieldRowStr
    uploadTblStr += '</tbody></table>';

    var detailsStr = '<div><button id="c-return-btn" class="btn rounded btn-sm btn-gray mb-2 text-capitalize float-end"><i class="fas fa-arrow-circle-left me-2"></i><span>' + langJson['l-outbound-return'] + '</span></button></div>' +
        '<div class="non-epro-badge-container my-2">' +
        '<span class="badge bg-lightgray text-capitalize">' + langJson['l-outbound-upload-field'] + '</span>' +
        '<span class="badge text-dark"><i class="fas fa-arrow-right"></i></span>' +
        '<span class="badge bg-primary text-capitalize">' + langJson['l-outbound-form-structure'] + '</span>' +
        '<span class="badge text-dark"><i class="fas fa-arrow-right"></i></span>' +
        '<span class="badge bg-lightgray text-capitalize">' + langJson['l-outbound-build-form'] + '</span>' +
        '</div>' +
        '<table id="after-save-clear-tbl" class="ps-2">' +
        '<tr>' +
        '<td>' + langJson['l-outbound-campaign-code'] + '</td>' +
        '<td>' + row.C_Name + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td class="pe-3">' + langJson['l-outbound-campaign-description'] + '</td>' +
        '<td>' + row.C_Description + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td>' + langJson['l-outbound-upload-fields'] + ' + ' + '<br/>' + langJson['l-outbound-other-input-fields'] + '</td>' +
        '<td id="c-upload-field-content-td">' + uploadTblStr + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td></td>' +
        '<td><button id="c-add-other-fields" class="btn btn-sm btn-circle btn-warning"><i class="fas fa-plus"></i></button></td>' +
        '</tr>' +
        '</table><div><button id="c-save-form-structure-btn" class="btn btn-warning rounded btn-sm text-capitalize"><i class="fa fa-save me-2"></i><span>' + langJson['l-general-save'] + '</span></button></div>';
    $('#c-container').empty().append(detailsStr);

    $('#c-save-form-structure-btn').on('click', function () {
        $('#c-after-save-remove-header').remove();
        $('.non-epro-badge-container').remove();
        var afterSaveStr =
            '<div class="non-epro-badge-container my-2">' +
            '<span class="badge bg-lightgray text-capitalize">' + langJson['l-outbound-upload-field'] + '</span>' +
            '<span class="badge text-dark"><i class="fas fa-arrow-right"></i></span>' +
            '<span class="badge bg-lightgray text-capitalize">' + langJson['l-outbound-form-structure'] + '</span>' +
            '<span class="badge active-arrow-color"><i class="fas fa-arrow-right"></i></span>' +
            '<span class="badge bg-lightgray text-capitalize">' + langJson['l-outbound-build-form'] + '</span>' +
            '</div>' +
            '<button id="c-build-form-btn" class="btn btn-warning rounded btn-sm text-capitalize"><i class="fas fa-arrow-right me-2"></i><span>' + langJson['l-outbound-build-form'] + '</span></button><p class="mt-2"><i>The Camaign is Inactive now, you will need to Build Form to make the Campaign Active. You can work on it now or later.</i></p>'
        $('#after-save-clear-tbl').empty().append(afterSaveStr);
        $('#c-build-form-btn').on('click', function () {
            campaignBuildForm();
        })
        $(this).remove();
    })

    $('#c-return-btn').on('click', function () {
        console.log('TBD');
        campaignInitTbl(true);
    })

    $('#c-add-other-fields').on('click', function () {
        $('#c-other-field-tbody').append(emptyFieldRowStr);
    })

    $('#c-other-field-tbody').on('click', '.c-other-field-tbody', function () {
        // parent.$.MessageBox('remove clicked')
    });

    $('#is-form-builder-select').on('change', function () {
        if ($(this).find('option:selected').val() == 'Y') {
            $('#existing-form-select').addClass('d-none');
        } else {
            $('#existing-form-select').removeClass('d-none');
        }
    })
}

function getInputForm(campaignObj) {

    var dataObj = {
        Agent_Id: loginId,
        Token: token
    }

    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/GetOBInputForm',
        data: JSON.stringify(dataObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            parent.$.MessageBox('Get Form error');
        } else {
            campaignAddFormEpro(r.details || [], campaignObj);
        }
    });
}

function campaignGetHeader(campaignCode) {

    var dataObj = {
        Agent_Id: loginId,
        Token: token,
        Campaign_Code: campaignCode
    }

    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/GetOBCampaignHeader',
        data: JSON.stringify(dataObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            parent.$.MessageBox('Get Form error');
        } else {
            campaignLoadDBHeader(r.details || [], true);
        }
    });
}


function campaignAddCampaign(campaignCode, headerColumnArr) {
    var dataObj = {
        Agent_Id: loginId,
        Token: token,
        Campaign_Code: campaignCode,
        Form_Id: parseInt($('#c-form-select').val()),
        Form_Name: $('#c-form-select option:selected').text(),
        Campaign_Description: $('#c-description').val()
    }

    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/AddOBCampaign',
        data: JSON.stringify(dataObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            parent.$.MessageBox(r.details || 'Add Campaign Error');
            $('#c-save-btn').prop('disabled', false);
        } else {
            // e.g. {"result":"success","details":{"Campaign_Id":1003}}
            if (headerColumnArr.length > 0) {
                campaignAddCampaignHeader(r.details.Campaign_Id, campaignCode, headerColumnArr);
            }
        }
    });
}

function campaignAddFormEpro(formDetailsArr, campaignObj) {

    var isReadOnly = false;

    if (typeof campaignObj != 'undefined') {
        isReadOnly = true;
    }

    var triggerFileUploadOnClickStr = '$("#file-to-upload").trigger("click");';

    var uploadBtnStr = '<input type="file" id="file-to-upload" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onchange="campaignUploadedExcelHeader(this);" style="display:none"><button class="btn rounded btn-sm btn-warning text-capitalize my-2" onclick=' + triggerFileUploadOnClickStr + '><i class="fas fa-upload me-2"></i><span>' + langJson['l-outbound-upload-excel-header'] + '</span></button>'
    // load different form
    var campaignFieldStr = '';
    var campaignDesStr = '';
    var formFieldStr = '';
    var uploadRelatedStr = '';
    var btnStr = '';
    var headerFieldTrStr = '';

    if (isReadOnly) {

        // campaignFieldStr
        // TO DO: Need to check is that no batch created firstly. Note when change Campaign Code, original capaign code call AddOBCampaignHeader HeaderColumnArr empty array, new campaign code add all sets again
        campaignFieldStr += '<input id="c-campaign-code" type="search" class="form-control c-template-field" value="' + campaignObj.Campaign_Code + '" disabled />';

        // campaignDesStr
        campaignDesStr += '<input id="c-description" type="search" class="form-control c-template-field c-edit-field" value="' + campaignObj.Campaign_Description + '" disabled />';

        // formFieldStr
        // TO DO: Need to check is that no batch created firstly. c-form-select make it editable (add c-edit-field class) when have time, it require time to update all db select fields
        formFieldStr += '<select id="c-form-select" class="form-select" disabled>';
        for (let theForm of formDetailsArr) {
            if (theForm.Form_Status == 'Active') {
                var theFormDetails = JSON.parse(theForm.Form_Details);
                var dbHeaderArrJSON = JSON.stringify(theFormDetails.DB_Header);
                if (theForm.Form_Id == campaignObj.Form_Id) {
                    formFieldStr += ('<option value="' + theForm.Form_Id + '" dbheader=\'' + dbHeaderArrJSON + '\' selected>' + theForm.Form_Name + '</option>')
                } else {
                    formFieldStr += ('<option value="' + theForm.Form_Id + '" dbheader=\'' + dbHeaderArrJSON + '\'>' + theForm.Form_Name + '</option>')
                }
            }
        }
        formFieldStr += '</select>';

        //btnStr To Do
        if (isCampaignSetup) {
            btnStr += ('<button id="c-save-btn" class="btn btn-warning rounded btn-sm text-capitalize d-none"><i class="fa fa-save me-2"></i><span>' + langJson['l-form-save'] + '</span></button>' +
                '<button id="c-update-btn" class="btn btn-warning rounded btn-sm text-capitalize d-none"><i class="fa fa-save me-2"></i><span>' + langJson['l-reminder-update'] + '</span></button>' +
                '<button id="c-edit-btn" class="btn btn-warning rounded btn-sm text-capitalize me-2"><i class="far fa-edit me-2"></i><span>' + langJson['l-outbound-edit-campaign'] + '</span></button>' +
                '<button id="c-add-template-btn" class="btn btn-warning rounded btn-sm text-capitalize"><i class="far fa-copy me-2"></i><span>' + langJson['l-outbound-use-as-template'] + '</span></button>');
        }
    } else {

        // campaignFieldStr
        campaignFieldStr += '<input id="c-campaign-code" type="search" class="form-control" placeholder="Example: ABC_01" />';

        // campaignDesStr
        campaignDesStr += '<input id="c-description" type="search" class="form-control" placeholder="(optional)" />';

        // formFieldStr
        formFieldStr += '<select id="c-form-select" class="form-select"><option value="" style="display:none" selected>-- Please Select --</option>';

        // dbheader need to be warped by single quote(') becasue it contains a JSON
        for (let formObj of formDetailsArr) {
            if (formObj.Form_Status == 'Active') {
                var theFormDetails = JSON.parse(formObj.Form_Details);
                var dbHeaderArrJSON = JSON.stringify(theFormDetails.DB_Header);
                formFieldStr += ('<option value="' + formObj.Form_Id + '" dbheader=\'' + dbHeaderArrJSON + '\'>' + formObj.Form_Name + '</option>')
            }
        }
        formFieldStr += '</select>';

        // uploadRelatedStr
        uploadRelatedStr += ('<tr id="c-upload-btn-tr" class="d-none">' +
            '<td></td>' +
            '<td>' + uploadBtnStr + '</td>' +
            '</tr>' +
            '<tr id="c-select-sheet-tr" class="d-none">' +
            '<td>Sheet Contains Header</td>' +
            '<td><select id="c-excel-sheet-select" class="form-select"></select></td>' +
            '</tr>')

        // headerFieldTrStr
        headerFieldTrStr = ' id="c-header-field-tr" class="d-none"'

        //btnStr
        btnStr += '<button id="c-save-btn" class="btn btn-warning rounded btn-sm text-capitalize"><i class="fa fa-save me-2"></i><span>' + langJson['l-form-save'] + '</span></button>';
    }

    var detailsStr = '<div><button id="c-return-btn" class="btn rounded btn-sm btn-gray mb-2 text-capitalize float-end"><i class="fas fa-arrow-circle-left me-2"></i><span>' + langJson['l-outbound-return'] + '</span></button></div>' +
        '<table id="after-save-clear-tbl" class="ps-2">' +
        '<tr>' +
        '<td>' + langJson['l-outbound-campaign-code'] + ' </td>' +
        '<td style="min-width:660px;">' + campaignFieldStr + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td class="pe-3">' + langJson['l-outbound-campaign-description'] + '</td>' +
        '<td>' + campaignDesStr + '</td>' +
        '</tr>' +
        '<td class="pe-3">' + langJson['l-outbound-select-form'] + '</td>' +
        '<td>' + formFieldStr + '</td>' +
        '</tr>' +
        uploadRelatedStr +
        '<tr' + headerFieldTrStr + '>' +
        '<td>' + langJson['l-outbound-upload-fields'] + '<i class="fas fa-info-circle ms-2 text-gray" title="If DB Header remains \'-- Please Select --\', the call list upload excel file should not have the column"></i></td>' +
        '<td id="c-upload-field-content-td"></td>' +
        '</tr>' +
        '</table>' +
        '<p id="c-warning-txt" class="text-danger ms-2" style="white-space:pre-line"></p>' +
        '<div class="text-center">' + btnStr + '</div>';

    $('#c-container').empty().append(detailsStr);

    if (isReadOnly) {
        campaignGetHeader(campaignObj.Campaign_Code);
    }

    $('#c-return-btn').on('click', function () {
        campaignInitTbl();
    })

    if (isCampaignSetup) {
        $('#c-form-select').on('change', function () {
            if ($(this).val().length == 0) {
                $('#c-upload-btn-tr').addClass('d-none');
            } else {
                $('#c-upload-btn-tr').removeClass('d-none');
            }
        })

        $('#c-excel-sheet-select').on('change', function () {
            $('#c-header-field-tr').removeClass('d-none');
            campaignGetExcelHeader(this);
            $('#c-warning-txt').text('');
        })



        $('#is-form-builder-select').on('change', function () {
            if ($(this).find('option:selected').val() == 'Y') {
                $('#existing-form-select').addClass('d-none');
            } else {
                $('#existing-form-select').removeClass('d-none');
            }
        })

        $('#c-save-btn').on('click', function () {

            $(this).prop('disabled', true);

            // verify before save
            var errArr = [];
            var campaignCode = $('#c-campaign-code').val();
            var selectedFormId = $('#c-form-select').val();
            var excelSelectVal = $('#c-excel-sheet-select').val(); // before upload excel, the val should be null

            if (campaignCode.length == 0) {
                errArr.push(langJson['l-outbound-campaign-code-empty']);
            } else if (campaignCode.indexOf(' ') >= 0) {
                errArr.push(langJson['l-outbound-campaign-code-space']);
            }

            if (selectedFormId.length == 0) {
                errArr.push(langJson['l-outbound-please-select-form']);
            } else if (excelSelectVal === null) {
                errArr.push(langJson['l-outbound-please-upload-excel']);
            } else if ($('#c-excel-sheet-select').length > 0) { // copy campaign will not need have select sheet field
                if ($('#c-excel-sheet-select').val().length == 0)
                    errArr.push(langJson['l-outbound-please-contains-header']);
            }

            if (errArr.length > 0) {
                var errStr = errArr.join('\r\n');
                $('#c-warning-txt').text(errStr);
                $(this).prop('disabled', false);
                return;
            }

            // before careate campaign, need to check is that no any other headers selected
            var headerColumnArr = [];

            var headerTr = $('#c-header-tbody').children();
            headerTr.each(function (trIdx, theTr) {
                var dbFieldName = $(this).find('td:eq(2)').find('option:selected').val();
                if (dbFieldName.length > 0) {
                    headerColumnArr.push({
                        Excel_Field_Order: (trIdx + 1),
                        Excel_Field_Name: $(this).find('td:eq(1)').text(),
                        DB_Field_Name: dbFieldName,
                        Check_Type: $(this).find('td:eq(3)').children().val()
                    });
                }
            })

            if (headerColumnArr.length == 0) {
                if (confirm(langJson['l-outbound-no-header-selected'])) {
                    campaignAddCampaign(campaignCode, []);
                } else {
                    $(this).prop('disabled', false);
                }
            } else {
                campaignAddCampaign(campaignCode, headerColumnArr);
            }
        })

        $('#c-update-btn').on('click', function () {
            $(this).prop('disabled', true);

            // verify before update 
            var campaignCode = $('#c-campaign-code').val();

            if (campaignCode.length == 0) {
                $('#c-warning-txt').text(langJson['l-outbound-campaign-code-empty']);
                $(this).prop('disabled', false);
                return;
            } else if (campaignCode.indexOf(' ') >= 0) {
                $('#c-warning-txt').text(langJson['l-outbound-campaign-code-space']);
                $(this).prop('disabled', false);
                return;
            }

            // To Do: in future Select Form editable, compare Form_Id and Form_Name also
            var originalObj = {
                Campaign_Code: campaignObj.Campaign_Code,
                Campaign_Description: campaignObj.Campaign_Description
            }

            var dataObj = {
                Campaign_Code: campaignCode,
                Campaign_Description: $('#c-description').val()
            }

            // compare by using JSON.stringify
            if (JSON.stringify(originalObj) === JSON.stringify(dataObj)) {

                // return to list without doing anything
                campaignInitTbl();
            } else {

                // campaign changed need to update
                dataObj['Agent_Id'] = loginId;
                dataObj['Token'] = token;
                dataObj['Campaign_Id'] = campaignObj.Campaign_Id;
                dataObj['S_Action'] = 'Amend';
                dataObj['Form_Id'] = campaignObj.Form_Id;
                dataObj['Form_Name'] = campaignObj.Form_Name;

                $.ajax({
                    type: "PUT",
                    url: mvcHost + '/mvc' + campaign + '/api/UpdateOBCampaign',
                    data: JSON.stringify(dataObj),
                    crossDomain: true,
                    contentType: "application/json",
                    dataType: 'json'
                }).always(function (r) {
                    if (!/^success$/i.test(r.result || "")) {
                        parent.$.MessageBox(r.details || 'Failed to update the campaign');
                    } else {
                        parent.$.MessageBox(langJson['l-outbound-campaign-update-success']);
                        campaignInitTbl();
                    }
                });
            }

            // compareHeader(campaignObj.Campaign_Code);
        });

        $('#c-edit-btn').on('click', function () {
            $(this).addClass('d-none');
            $('.c-edit-field').prop('disabled', false);

            $('#c-add-template-btn').addClass('d-none');
            $('#c-update-btn').removeClass('d-none');
        });

        $('#c-add-template-btn').on('click', function () {
            $(this).addClass('d-none');

            $('#c-edit-btn').addClass('d-none');
            $('#c-save-btn').removeClass('d-none');
            $('#c-campaign-code').select();
            $('.c-template-field').prop('disabled', false);

            $('.c-db-header').each(function () {
                // campaignCheckAllDbHeaderSelected(isReadOnly);
                if ($(this).find('option:selected').attr('type') == 'Date') {
                    $(this).parent().next().children().val('Date').prop('disabled', true);
                } else {
                    $(this).parent().next().children().prop('disabled', false);
                }
            })
        })
    }
}

function campaignReorderTbl() {
    $('#c-header-tbody').find('tr').find('td:eq(0)').each(function (idx) {
        $(this).text(idx + 1);
    });
}

function campaignAddCampaignHeader(campaignId, campaignCode, headerColumnArr) {
    var dataObj = {
        Agent_Id: loginId,
        Token: token,
        Campaign_Id: campaignId,
        Campaign_Code: campaignCode,
        HeaderColumnArr: headerColumnArr,
        File_Path: $('#c-excel-sheet-select').attr('filepath') || ''
    }
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/AddOBCampaignHeader',
        data: JSON.stringify(dataObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            parent.$.MessageBox('Get Form error');
        } else {
            parent.$.MessageBox(langJson['l-outbound-campaign-update-success2']);
            campaignInitTbl();
        }
    });
}

function campaignAddFormNonEpro() {

    var triggerFileUploadOnClickStr = '$("#file-to-upload").trigger("click");';

    var uploadBtnStr = '<input type="file" id="file-to-upload" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onchange="uploadeExcelHeaderNonEpro();" style="display:none"><button class="btn rounded btn-sm btn-warning mt-3 mb-2 text-capitalize" onclick=' + triggerFileUploadOnClickStr + '><i class="fas fa-upload me-2"></i><span>' + langJson['l-outbound-upload-excel-header'] + '</span></button>'

    '<tbody><tr><td class="pe-2"><input type="search" class="form-control" /></td><td class="pe-2"><select class="form-select pe-2"><option value="">-- Please Select --</option><option>Last_Name</option><option>Surname</option><option>Mobile</option><option>Age</option></select></td><td class="pe-2"><select class="form-select pe-2"><option vlaue="text">Text Field</option><option vlaue="radio">Radio</option><option vlaue="textarea">Textarea</option><option vlaue="date">Date</option></selet></td><td></td></tr></tbody></table>' //<i class="fas fa-trash-alt me-2"></i>

    var detailsStr = '<div><button id="c-return-btn" class="btn rounded btn-sm btn-gray mb-2 text-capitalize float-end"><i class="fas fa-arrow-circle-left me-2"></i><span>' + langJson['l-outbound-return'] + '</span></button></div>' +
        // '<h3 id="c-after-save-remove-header" class="mt-0">1/3 Upload Field Define</h3>' +
        '<div class="non-epro-badge-container my-2">' +
        '<span class="badge bg-primary text-capitalize">' + langJson['l-outbound-upload-field'] + '</span>' +
        '<span class="badge text-dark"><i class="fas fa-arrow-right"></i></span>' +
        '<span class="badge bg-lightgray text-capitalize">' + langJson['l-outbound-form-structure'] + '</span>' +
        '<span class="badge text-dark"><i class="fas fa-arrow-right"></i></span>' +
        '<span class="badge bg-lightgray text-capitalize">' + langJson['l-outbound-build-form'] + '</span>' +
        '</div>' +
        '<table id="after-save-clear-tbl" class="ps-2">' +
        '<tr>' +
        '<td>' + langJson['l-outbound-campaign-code'] + '</td>' +
        '<td><input id="c-campaign-code-input" type="search" class="form-control" placeholder="Example: ABC_01" /></td>' +
        '</tr>' +
        '<tr>' +
        '<td class="pe-3">' + langJson['l-outbound-campaign-description'] + '</td>' +
        '<td><input type="search" class="form-control" placeholder="(optional)" /></td>' +
        '</tr>' +
        '<tr>' +
        '<td>' + langJson['l-outbound-upload-fields'] + '<i class="fas fa-info-circle ms-2 text-gray" title="If DB Header remains \'-- Please Select --\', the call list upload excel file should not have the column"></i></td>' +
        '<td id="c-upload-field-content-td">' + uploadBtnStr + '</td>' +
        '</tr>' +
        '</table><div><button id="c-save-campaign-btn-non-epro" class="btn btn-warning rounded btn-sm text-capitalize"><i class="fa fa-save me-2"></i><span>' + langJson['l-general-save'] + '</span></button></div>';
    $('#c-container').empty().append(detailsStr);

    $('#c-campaign-code-input').focus();
    $('#c-return-btn').on('click', function () {
        campaignInitTbl();
    })

    $('#is-form-builder-select').on('change', function () {
        if ($(this).find('option:selected').val() == 'Y') {
            $('#existing-form-select').addClass('d-none');
        } else {
            $('#existing-form-select').removeClass('d-none');
        }
    })

    $('#c-save-campaign-btn-non-epro').on('click', function () {
        $('#c-after-save-remove-header').remove();
        $('.non-epro-badge-container').remove();
        var afterSaveStr =
            '<div class="non-epro-badge-container my-2">' +
            '<span class="badge bg-lightgray text-capitalize">' + langJson['l-outbound-upload-field'] + '</span>' +
            '<span class="badge active-arrow-color"><i class="fas fa-arrow-right"></i></span>' +
            '<span class="badge bg-lightgray text-capitalize">' + langJson['l-outbound-form-structure'] + '</span>' +
            '<span class="badge text-dark"><i class="fas fa-arrow-right"></i></span>' +
            '<span class="badge bg-lightgray text-capitalize">' + langJson['l-outbound-build-form'] + '</span>' +
            '</div>' +
            '<button id="c-form-structure-btn" class="btn btn-warning rounded btn-sm text-capitalize"><i class="fas fa-arrow-right me-2"></i><span>2/3 Create Form Structure</span></button><p class="mt-2"><i>' + langJson['l-outbound-campaign-inactive-now'] + '</i></p>';
        $('#after-save-clear-tbl').empty().append(afterSaveStr);
        $('#c-form-structure-btn').on('click', function () {
            campaignAddFormStructure();
        })
        $(this).remove();
    })
}

function campaignBuildForm() {
    var detailsStr = '<div><button id="c-return-btn" class="btn rounded btn-sm btn-gray mb-2 text-capitalize float-end" style="width:124.95px;"><i class="fas fa-arrow-circle-left me-2"></i><span>' + langJson['l-outbound-return'] + '</span></button><button id="c-save-build-form-btn" class="btn rounded btn-sm btn-warning mb-2 text-capitalize me-3 float-end"><i class="fa fa-save me-2"></i><span>' + langJson['l-outbound-save-form'] + '</span></button></div>' +
        '<div class="non-epro-badge-container my-2">' +
        '<span class="badge bg-lightgray text-capitalize">' + langJson['l-outbound-upload-field'] + '</span>' +
        '<span class="badge text-dark"><i class="fas fa-arrow-right"></i></span>' +
        '<span class="badge bg-lightgray text-capitalize">' + langJson['l-outbound-form-structure'] + '</span>' +
        '<span class="badge text-dark"><i class="fas fa-arrow-right"></i></span>' +
        '<span class="badge bg-primary text-capitalize">' + langJson['l-outbound-build-form'] + '</span>' +
        '</div>' +
        '<div><iframe src="./formbuilder.html" style="width:calc(100vw - 214px);height:calc(100vw - 694px);border:none;"></iframe></div>'
    $('#c-container').empty().append(detailsStr);
    $('#c-save-build-form-btn').on('click', function () {
        parent.$.MessageBox(langJson['l-outbound-build-form-success']);
        campaignInitTbl(true);
    })
    $('#c-return-btn').on('click', function () {
        console.log('TBD');
        campaignInitTbl(true);
    })

}

function createOpenInputForm() {
    $('#o-search-results-container').addClass('d-none');
    $('#o-contact-status-container').addClass('d-none');
    $('#o-input-form').attr('src', '').attr('height', 0);
}

function caseLogReturnData(keyId, keyVal) {
    if (keyId == 'Updated_By') {
        return parent.getAgentName(keyVal) + ' (' + keyVal + ')';
    } else if (keyId == 'Remark') {

        // at least space needed, otherewise the box will looks like a line
        if (keyVal.length == 0) {
            keyVal = '&nbsp;';
        }

        // in table /r/n will not break line, need to use br tag
        return '<div class="o-remarks-val">' + keyVal.replace(/(?:\r\n|\r|\n)/g, '<br />') + '</div>';
    } else if (keyVal == null) {
        return 'N/A'
    } else if (keyId == 'Updated_Time' || keyId == 'Callback_Time') {
        return (keyVal || '').replace('T', ' ').replace(/\.\d+/, "");
    } else {
        return keyVal;
    }
}

function showLogForm(showForm) {

    // for Contact Status
    $('#o-contact-status-container').removeClass('d-none');

    var customerData = window.customerData;

    if (showForm) {
        var theFormId = $('#o-search-campaign-select option[value="' + customerData.Campaign_Code + '"]').attr('formid');

        // added the date behind to refresh the page
        var d = new Date();
        var newSrc = './campaign/' + campaign + '/form_ob_' + String(theFormId) + '.html?' + d.getTime();
        $('#o-input-form').attr('src', newSrc).show(); // add the time to refresh the page
    }

    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/GetOBCallLog',
        data: JSON.stringify({
            Call_Id: customerData.Call_Id,
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {

        // vincent for empty logs 
        var callLogArr = (!/^success$/i.test(r.result || "")) ? [] : (r.details || []); // r.details will be null when no records
        if (loadedCSStatusTBl) {
            var statusTbl = $('#o-contact-status-tbl');
            statusTbl.DataTable().clear();
            statusTbl.DataTable().rows.add(callLogArr); // Add new data
            statusTbl.DataTable().columns.adjust().draw(); // Redraw the DataTable
            // NO DEL $(window).scrollTop($('#o-contact-status-container').offset().top - 40);
        } else {
            var callLogTbl = $('#o-contact-status-tbl').DataTable({
                data: callLogArr,
                lengthChange: false,
                aaSorting: [
                    [2, "desc"]
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
                initComplete: function (settings, json) {
                    loadedCSStatusTBl = true;
                },
                columns: [{
                    title: "",
                    data: "Attempt",
                    orderable: false
                },
                {
                    title: '',
                    render: function (data, type, row) {
                        return '<i title="Details" class="table-btn fas fa-search-plus open" data-bs-toggle="modal" data-bs-target="#logModal"></i>';
                    },
                    orderable: false,
                    className: 'btnColumn'
                },
                {
                    title: langJson['l-form-last-revision'],
                    data: "Transaction_Time",
                    render: function (data, type, row) {
                        var theTime = data || '';
                        return theTime.replace('T', ' ').replace(/\.\d+/, "");
                    }
                },
                {
                    title: langJson['l-search-status'],
                    data: "Call_Status"
                }, {
                    title: langJson['l-campaign-reason'],
                    data: "Call_Reason"
                }, {
                    title: langJson['l-campaign-callback-datetime'],
                    data: "Callback_Time",
                    render: function (data, type, row) {
                        var theTime = data || '';
                        return theTime.replace('T', ' ').replace(/\.\d+/, "");
                    }
                }, { // required for Updated by
                    title: "",
                    data: "Updated_By",
                    visible: false
                }, {
                    title: langJson['l-campaign-updated-by'],
                    render: function (data, type, row) {
                        return parent.getAgentName(row.Updated_By);
                    }
                }, {
                    title: langJson['l-form-remarks'],
                    data: "Remark"
                }
                ]
            })

            $('#o-contact-status-tbl tbody').on('click', '.open', function () {
                var data = callLogTbl.row($(this).parents('tr')).data();
                var tbodyStr = '';
                var fieldIds = ["LogID", "Attempt", "Call_Status", "Call_Reason", "Remark", "Updated_By", "Updated_Time", "Callback_Time"];
                var fieldName = ['Log ID', 'Attempt', "Call Status", "Call Reason", "Remarks", "Updated By", "Updated Time", "Callback Time"];
                var logTblBody = $('#log-tbl-body');
                var connId = data['Conn_Id'] || 'N/A';
                var replyConnId = data['Reply_Conn_Id'] || 'N/A';
                logTblBody.empty();
                for (var i = 0; i < fieldIds.length; i++) {
                    var fieldId = fieldIds[i];
                    tbodyStr += '<tr><td class="o-log-field-label">'
                    tbodyStr += fieldName[i]
                    tbodyStr += '</td><td>'
                    tbodyStr += caseLogReturnData(fieldId, data[fieldId])
                    tbodyStr += '</td></tr>'
                    if (fieldId == "Remark") {
                        tbodyStr += '<tr><td>&nbsp;</td><td></td></tr>';
                    }
                }

                tbodyStr += '<tr><td>&nbsp;</td><td></td></tr>';
                tbodyStr += '<tr><td class="fw-bold">I/B Conn ID</td><td>' + connId + '</td></tr>';
                if (isAdmin && connId != 'N/A') {
                    // String(data.Conn_Id)
                    $.ajax({
                        type: "POST",
                        url: wiseHost + '/WisePBX/api/Call/GetContent',
                        data: JSON.stringify({
                            "id": connId
                        }),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json"
                    }).always(function (r) {
                        if (!/^success$/i.test(r.result || "")) {
                            console.log('error in GetContent');
                            replyConnHandle(tbodyStr, replyConnId);
                        } else {
                            var mediaContent = r.data[0] || '';
                            if (mediaContent) {
                                var voiceUrl = mediaContent.FileUrl || '';
                                if (voiceUrl.length > 0) {
                                    if (config.isHttps) {
                                        voiceUrl = voiceUrl.replace(voiceUrl.substr(0, voiceUrl.indexOf("/wisepbx/")), wiseHost);
                                    }
                                    tbodyStr += (
                                        '<tr><td class="fw-bold pe-3">I/B Timestamp</td><td>' +
                                        mediaContent.TimeStamp.replace("T", " ") +
                                        '</td></tr><tr><td></td><td>' +
                                        '<audio id="video" controls="" name="media" class="video-tag"' +
                                        (canDownloadVoice ? '' : ' controlsList="nodownload"') +
                                        '><source src="' + voiceUrl + '" type="audio/wav"></audio>' +
                                        '</td></tr>'
                                    )
                                    replyConnHandle(tbodyStr, replyConnId);
                                } else {
                                    replyConnHandle(tbodyStr, replyConnId);
                                }
                            } else {
                                replyConnHandle(tbodyStr, replyConnId);
                            }
                        }
                    })
                } else {
                    replyConnHandle(tbodyStr, replyConnId);
                }
            })
        }
    })
}

function replyConnHandle(tbodyStr, replyConnId) {
    tbodyStr += '<tr><td>&nbsp;</td><td></td></tr>';
    tbodyStr += '<tr><td class="fw-bold">O/B Conn ID</td><td>' + replyConnId + '</td></tr>';

    if (isAdmin && replyConnId != 'N/A') {
        $.ajax({
            type: "POST",
            url: wiseHost + '/WisePBX/api/Call/GetContent',
            data: JSON.stringify({
                "id": replyConnId
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in GetContent');
                tbodyStr += (
                    '<tr><td colspan="2">Call cannot be retrieved.</td></tr>'
                )
                $('#log-tbl-body').append(tbodyStr);
            } else {
                var mediaContent = r.data[0] || '';
                if (mediaContent) {
                    var voiceUrl = mediaContent.FileUrl || '';
                    if (voiceUrl.length > 0) {
                        if (config.isHttps) {
                            voiceUrl = voiceUrl.replace(voiceUrl.substr(0, voiceUrl.indexOf("/wisepbx/")), wiseHost);
                        }
                        tbodyStr += (
                            '<tr><td class="fw-bold">O/B Phone Number</td><td>' + mediaContent.CallerDisplay + '</td></tr>' +
                            '<tr><td class="fw-bold pe-3">O/B Timestamp</td><td>' +
                            mediaContent.TimeStamp.replace("T", " ") +
                            '</td></tr><tr><td colspan="2" class="pt-2">' +
                            '<audio id="video" controls="" name="media"' +
                            (canDownloadVoice ? '' : ' controlsList="nodownload"') +
                            '><source src="' + voiceUrl + '" type="audio/wav"></audio>' +
                            '</td></tr>'
                        )
                    }
                }
                $('#log-tbl-body').append(tbodyStr);
            }
        })
    } else {
        $('#log-tbl-body').append(tbodyStr);
    }
}

$(document).ready(function () {
    if (isAdmin) {
        $('#v-pills-tab').prepend(
            '<li id="m-design-content-tab"><a id="design-tab" class="nav-link text-capitalize mx-2" data-bs-toggle="pill" href="#design-content" role="tab" aria-controls="design-content" aria-selected="false"><i class="fas fa-plus me-2"></i><span class="align-middle">' + langJson['l-social-campaign'] + '</span></a></li>' +
            '<li id="m-upload-content-tab"><a id="upload-tab" class="nav-link text-capitalize mx-2" data-bs-toggle="pill" href="#upload-content" role="tab" aria-controls="upload-content" aria-selected="false"><i class="fas fa-upload me-2"></i><span class="align-middle">' + langJson['l-campaign-upload'] + '</span></a></li>' +
            '<li id="m-manage-content-tab"><a id="manage-tab" class="nav-link text-capitalize mx-2" data-bs-toggle="pill" href="#manage-content" role="tab" aria-controls="manage-content" aria-selected="false"><i class="fas fa-tasks me-2"></i><span class="align-middle">' + langJson['l-outbound-assign'] + '</span></a></li>'
        );
    }

    $('.within-batch-period-toggle').on('click', function (e) {
        e.stopPropagation();
    })

    $('#a-within-batch-period').on('change', function (e) {
        var checked = $(this).prop('checked');
        if (checked) {
            loadBatchTbl(false);
        } else {
            loadBatchTbl(false);
        }
        return false;
    })

    // Set nav bar button
    $("#v-pills-tab li a").click(function (event) {
        var selected = $(this).find('span').text();
        switchContent(selected);
        event.preventDefault();
    });

    $('#o-search-campaign-select').on('change', function () {
        var searchBatch = $('#o-search-batch');
        searchBatch.val('');
        var theCampaignCode = $(this).val() || '';
        var batchOptions = $('#o-search-batch option');
        // batchOptions.removeClass('d-none');
        if (theCampaignCode.length == 0) {
            searchBatch.prop('disabled', true);
        } else {
            searchBatch.prop('disabled', false);
            batchOptions.each(function () {
                var campaignCode = $(this).attr('campaigncode');
                if (campaignCode != theCampaignCode && campaignCode != '') {
                    $(this).addClass('d-none');
                } else {
                    $(this).removeClass('d-none');
                }
            });
        }
    });


    // TBD campaign code has to be selected first
    // $('#o-search-batch').on('change', function () {
    //     var campaignCode = $('option:selected', this).attr('campaigncode');
    //     if (campaignCode.length == 0) {

    // TBD campaign code has to be selected first
    // $('#o-search-campaign-select').val('').prop('disabled', false);

    // all batch can be shown
    //     $('#o-search-batch option').each(function () {
    //         $(this).removeClass('d-none');
    //     });
    // }

    // TBD campaign code has to be selected first
    //  else {
    //     $('#o-search-campaign-select').val(campaignCode).prop('disabled', true);
    // }
    // });

    // TBD when seelct batch auto search, to sync others not do so
    // $('#o-search-batch').on('change', function () {
    //     var campaignCode = $('option:selected', this).attr('campaigncode');
    //     if (campaignCode.length != 0) {
    //         $('#o-search-btn').click();
    //     }
    // });

    $('#o-search-btn').on('click', function (event) {
        event.preventDefault();
        // ================= Verify =================

        // batch ID cannot be null
        var batchCode = $('#o-search-batch').val() || '';
        if (batchCode.length == 0) {
            parent.$.MessageBox(langJson['l-outbound-batch-to-be-selected']);
            createOpenInputForm();
            return;
        }

        // Phone No. have to be more than 4 digits
        var phoneNo = $('#o-phone').val() || '';
        if (phoneNo.length > 0 && phoneNo.length < 4) {
            parent.$.MessageBox(langJson['l-campaign-enquiry-phone']);
            createOpenInputForm();
            return;
        }

        var ageFrom = $('#o-age-from').val() || '';
        var ageTo = $('#o-age-to').val() || '';

        // verfiy age from age to must appear altogether
        if (ageFrom.length > 0 && ageTo.length == 0) {
            parent.$.MessageBox(langJson['l-campaign-age-to-blank']);
            createOpenInputForm();
            return;
        }
        if (ageTo.length > 0 && ageFrom.length == 0) {
            parent.$.MessageBox(langJson['l-campaign-age-from-blank']);
            createOpenInputForm();
            return;
        }

        // verify age to smaller than age from
        if (ageTo < ageFrom) {
            parent.$.MessageBox(langJson['l-campaign-age-to-smaller']);
            createOpenInputForm();
            return;
        }

        // ================= // Verify =================

        $('#o-search-results-container').removeClass('d-none');
        $('#o-contact-status-container').addClass('d-none');
        $('#o-input-form').attr('src', '').attr('height', 0);

        if (customerTbl) {
            $('#o-search-results-tbl').DataTable().ajax.reload();
        } else {
            var tblConfigObj = {
                "serverSide": true,
                'processing': true,
                dom: 'Bti',
                "pageLength": 10000, // to be able to export all data to excel
                "ajax": {
                    "url": mvcHost + '/mvc' + campaign + '/api/SearchOBCallList',
                    "type": "POST",
                    "contentType": "application/json",
                    "data": function (d, settings) {

                        // only sorting 2 columns allowed
                        if (d.order.length > 2) {
                            d.order = d.order.slice(0, 2); // change the order array that pass to API
                            settings.aaSorting = settings.aaSorting.slice(0, 2); // this is to avoid the 3rd shift clicked arrow change
                            parent.$.MessageBox(langJson['l-campaign-max-sort-col']);
                        }
                        // Name have to be more than 3 characters
                        // If have Age From or Age To must have another one
                        // Need to know is that supervisor
                        var searchOutCallData = {
                            Agent_Id: loginId,
                            Token: token
                        };
                        // Verify Age From and Age To if filled one, another one filled also
                        // Cannot get the value above, need to get again, as hard coded value here otherwise
                        searchOutCallData.Batch_Code = $('#o-search-batch').val();

                        searchOutCallData.Campaign_Code = $('#o-search-campaign-select').val();

                        var isPrivate = $("#o-search-customer-body input[name='agent-list']:checked").val() || '';
                        if (isPrivate == 'myself') {
                            searchOutCallData.To_Check_Id = loginId;
                        }

                        // if no this parameter, default will load all
                        if ($('#o-within-batch-period').prop('checked')) {
                            searchOutCallData["Within_BatchPeriod"] = "Y";
                        }

                        var phoneNo = $('#o-phone').val() || '';
                        if (phoneNo.length > 0) {
                            searchOutCallData.Phone = phoneNo;
                        }

                        var name = $('#o-name').val() || '';
                        if (name.length > 0) {
                            searchOutCallData.Name = name;
                        }

                        var gender = $('#o-gender').val() || '';
                        if (gender.length > 0) {
                            searchOutCallData.Gender = gender;
                        }

                        var ageFrom = $('#o-age-from').val() || '';
                        var ageTo = $('#o-age-to').val() || '';
                        if (ageFrom.length > 0 && ageTo.length > 0) {
                            searchOutCallData.Age_From = Number(ageFrom);
                            searchOutCallData.Age_To = Number(ageTo);
                        }

                        var callStatus = $('#o-call-status').val() || '';
                        if (callStatus.length > 0) {
                            searchOutCallData.Call_Status = callStatus;
                        }

                        var callback = $('#o-callback').val() || '';
                        if (callback.length > 0) {
                            if (callback == 'all') {
                                searchOutCallData.Callback_Time_From = '00:00';
                                searchOutCallData.Callback_Time_To = '23:59';
                            } else if (callback == '09:00 - 11:00') {
                                searchOutCallData.Callback_Time_From = '09:00';
                                searchOutCallData.Callback_Time_To = '11:00';
                            } else if (callback == '11:01 - 14:00') {
                                searchOutCallData.Callback_Time_From = '11:01';
                                searchOutCallData.Callback_Time_To = '14:00';
                            } else if (callback == '14:01 - 16:00') {
                                searchOutCallData.Callback_Time_From = '14:01';
                                searchOutCallData.Callback_Time_To = '16:00';
                            } else if (callback == '16:01 - 18:00') {
                                searchOutCallData.Callback_Time_From = '16:01';
                                searchOutCallData.Callback_Time_To = '18:00';
                            } else if (callback == '> 18:00') {
                                searchOutCallData.Callback_Time_From = '18:01';
                                searchOutCallData.Callback_Time_To = '23:59';
                            }
                        }
                        return JSON.stringify(Object.assign(searchOutCallData, d));
                    },
                    "dataSrc": function (json) {
                        if (json.result == 'success') {
                            return json.details;
                        } else {
                            return [];
                        }
                    }
                },
                lengthChange: false,
                aaSorting: [
                    [10, "desc"], // priority shows callback time, then Attempt
                    [7, "asc"]
                ],
                searching: false,
                scrollX: true, // client will want to show as much columns as possible, if this will not affact
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
                    },
                    'loadingRecords': '&nbsp;',
                    'processing': '<div class="spinner"></div>'
                },
                // initComplete: function (settings, json) {
                // after form updated will refresh  
                // $(window).scrollTop($('#o-search-results-container').offset().top - 50);
                // setTimeout(function () {
                //     $(window).scrollTop($('#o-search-results-container').offset().top - 50);
                // }, 500);
                // NO DEL window.scrollTo(0,document.body.scrollHeight);
                // $('#o-search-results-container').removeClass('d-none');
                // },
                "drawCallback": function (settings) {
                    // $('#o-search-results-tbl').DataTable().columns.adjust(); // Redraw the DataTable
                },
                columns: [{
                    title: "",
                    className: 'btnColumn',
                    orderable: false,
                    data: "Agent_Id",
                    render: function (data) {
                        if (isAdmin || data == loginId) {
                            return '<button class="btn btn-sm rounded btn-warning text-capitalize"><i class="fas fa-mouse-pointer me-2"></i><span>' + langJson['l-campaign-select'] + '</span></button>'
                        } else {
                            return ''
                        }
                    }
                },
                {
                    // title: langJson['l-ob-call-id'], deprecated no del
                    title: "ID", // by opinion of Kenneth better to show 'ID' only instead of 'Call ID'
                    data: "Call_Id"
                },
                {
                    // NO DEL: by Kenneth opinion should shows agent name(agent id) instead of agent id
                    // title: langJson['l-reminder-agent-id'],
                    // data: "Agent_Id",
                    // /NO DEL

                    title: langJson['l-reminder-agent-name'],
                    data: "Agent_Id", // to be able to sort have to have data, could not just use row.Agent_Id
                    render: function (data) {
                        return parent.getAgentName(data) + ' (' + data + ')';
                    }
                },
                {
                    title: langJson['l-ob-last-name'],
                    data: "Last_Name",
                    render: function (data, type, row) {
                        if (isAdmin || row.Agent_Id == loginId) {
                            return data
                        } else {
                            return ''
                        }
                    }
                },
                {
                    title: langJson['l-ob-first-name'],
                    data: "First_Name",
                    render: function (data, type, row) {
                        if (isAdmin || row.Agent_Id == loginId) {
                            return data
                        } else {
                            return ''
                        }
                    }
                },
                {
                    title: langJson['l-form-gender'],
                    data: "Gender",
                    render: function (data, type, row) {
                        if (isAdmin || row.Agent_Id == loginId) {
                            return data
                        } else {
                            return ''
                        }
                    }
                },
                {
                    title: "Age",
                    className: 'btnColumn',
                    data: "DOB",
                    render: function (data, type, row) {
                        if ((isAdmin || row.Agent_Id == loginId) && data && data.length > 9) {
                            return getAgeByDOB(data)
                        } else {
                            return ''
                        }
                    }
                }, {
                    title: langJson['l-campaign-attempt'],
                    data: "Attempt",
                    render: function (data, type, row) {
                        if (isAdmin || row.Agent_Id == loginId) {
                            return data
                        } else {
                            return ''
                        }
                    }
                }, {
                    title: langJson['l-search-status'],
                    data: "Call_Status",
                    render: function (data, type, row) {
                        if (isAdmin || row.Agent_Id == loginId) {
                            return data
                        } else {
                            return ''
                        }
                    }
                }, {
                    title: langJson['l-campaign-reason'],
                    data: "Call_Reason",
                    render: function (data, type, row) {
                        if (isAdmin || row.Agent_Id == loginId) {
                            return data
                        } else {
                            return ''
                        }
                    }
                }, {
                    title: langJson['l-campaign-callback-datetime'],
                    data: "Callback_Time",
                    render: function (data, type, row) {
                        if ((isAdmin || row.Agent_Id == loginId) && data) {
                            var theTime = (data || '').replace('T', ' ').replace(/\.\d+/, "");
                            if (new Date(theTime) < new Date()) {
                                return theTime.replace('T', ' ').replace(/\.\d+/, "") + '<i class="fas fa-bell ms-2 text-danger"></i>';
                            } else {
                                return theTime.replace('T', ' ').replace(/\.\d+/, "");
                            }
                        } else {
                            return '';
                        }
                    }
                }, {
                    title: langJson['l-form-mobile'],
                    data: "Mobile_No",
                    render: function (data, type, row) {
                        if (isAdmin || row.Agent_Id == loginId) {
                            return data
                        } else {
                            return ''
                        }
                    }
                }, {
                    title: "Office No",
                    data: "Office_No",
                    render: function (data, type, row) {
                        if (isAdmin || row.Agent_Id == loginId) {
                            return data
                        } else {
                            return ''
                        }
                    }
                }, {
                    title: "Home No",
                    data: "Home_No",
                    render: function (data, type, row) {
                        if (isAdmin || row.Agent_Id == loginId) {
                            return data
                        } else {
                            return ''
                        }
                    }
                }, {
                    title: "Other No",
                    data: "Other_Phone_No",
                    render: function (data, type, row) {
                        if (isAdmin || row.Agent_Id == loginId) {
                            return data
                        } else {
                            return ''
                        }
                    }
                }, {
                    title: langJson['l-form-last-revision'],
                    data: "Transaction_Time",
                    render: function (data, type, row) {
                        if (isAdmin || row.Agent_Id == loginId) {
                            var theTime = data || '';
                            return theTime.replace('T', ' ').replace(/\.\d+/, "");
                        } else {
                            return '';
                        }
                    }
                }, {
                    title: "Join Date",
                    data: "Join_Date",
                    render: function (data, type, row) {
                        if (isAdmin || row.Agent_Id == loginId) {
                            var theTime = data || '';
                            return theTime.slice(0, 10);
                        } else {
                            return '';
                        }
                    }
                }
                ]
            }
            if (isAdmin) {
                tblConfigObj['buttons'] = [{
                    extend: 'excel',
                    text: '',
                    tag: 'span',
                    titleAttr: 'Excel',
                    className: 'fas fa-table cursor-pointer text-success float-right fa-2x ml-1',
                    filename: 'Outbound-' + new Date(),
                    exportOptions: {
                        columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
                    }
                }];
            } else {
                tblConfigObj['buttons'] = [];
            }
            customerTbl = $('#o-search-results-tbl').DataTable(tblConfigObj);

            // double click call the agent
            $('#o-search-results-tbl tbody').on('dblclick', 'tr', function (e) {
                e.preventDefault();
                $(this).find('button').click();
            })

            $('#o-search-results-tbl tbody').on('click', 'button', function (e) {
                var thisBtn = $(this);
                customerTbl.$('tr.highlight').removeClass('highlight');
                thisBtn.parent().parent().addClass('highlight');

                window.customerData = customerTbl.row(thisBtn.parents('tr')).data(); // TBD, customer data and case data should get again in form and after select log
                showLogForm(true);

                // hide @ the end
                $('#o-search-customer-body').collapse('hide');
            })
        }
    })

    $('#o-cancel-btn').on('click', function () {
        initOpen();
    })

    // scroll up and down no menu bar issue
    $('textarea').keydown(function (e) {
        if (e.keyCode == 33 || e.keyCode == 34) {
            $(this).blur();
        }
    });

    $('#c-range-selection').on('change', function (e) {
        e.preventDefault();
        if (this.value == 'custom') {
            $('.range-div').removeClass('d-none');
        } else {
            $('.range-div').addClass('d-none');
            $('#c-range-from').val('');
            $('#c-range-to').val('');
        }
    });
    if (parent.parent.iframeRecheck) {
        parent.parent.iframeRecheck($(parent.document));
    }
    $('#left-menu').removeClass('d-none');

    $('#v-pills-tab li #open-tab').click();
    $('body').css('cursor', 'unset');

    // it is not make sense callback search with NewLead
    $('#o-callback').on('change', function () {
        if (this.value.length > 0) {
            if ($('#o-call-status').val() == 'NewLead') {
                $('#o-call-status').val('').trigger('change');
            }
        }
    })

    $('#o-within-batch-period').on('click', function () {
        if (!$(this).prop('checked')) {
            if (confirm('To load all batches will take more time, are you sure?')) {
                loadBatchTbl(true);
            } else {
                $(this).prop('checked', true);
            }
        } else {
            loadBatchTbl(true);
        }
    })
});

function windowOnload() {
    setLanguage();
}

function setLanguage() {
    $('.l-form-open').text(langJson['l-form-open']);
    $('.l-menu-search-customer').text(langJson['l-menu-search-customer']);

    var new_campCode = $('.l-outbound-campaign-code').html().replace('Campaign Code', langJson['l-outbound-campaign-code']);
    $('.l-outbound-campaign-code').html(new_campCode);

    var new_batchCode = $('.l-outbound-batch-code').html().replace('Batch Code', langJson['l-outbound-batch-code']);
    $('.l-outbound-batch-code').html(new_batchCode);

    $('.l-outbound-phone-number').text(langJson['l-outbound-phone-number']);
    $('.l-main-name').text(langJson['l-main-name']);
    $('.l-form-gender').text(langJson['l-form-gender']);
    $('.l-campaign-agefrom').text(langJson['l-campaign-agefrom']);
    $('.l-campaign-ageto').text(langJson['l-campaign-ageto']);
    $('.l-campaign-callstatus').text(langJson['l-campaign-callstatus']);
    $('.l-campaign-callback').text(langJson['l-campaign-callback']);
    $('.l-campaign-mycalllistonly').html('<input type="radio" name="agent-list" class="form-check-input" value="myself" checked>' + langJson['l-campaign-mycalllistonly'] + '<span class="circle"><span class="check"></span></span>');
    $('.l-campaign-allcustomers').html('<input type="radio" name="agent-list" class="form-check-input" value="all">' + langJson['l-campaign-allcustomers'] + '<span class="circle"><span class="check"></span></span>');
    $('.l-search-search').text(langJson['l-search-search']);
    $('.l-social-campaign').text(langJson['l-social-campaign']);
    $('.l-outbound-upload-batch').text(langJson['l-outbound-upload-batch']);
    $('.l-outbound-assign-call-to-agent').text(langJson['l-outbound-assign-call-to-agent']);
    $('.l-campaign-contact-status').text(langJson['l-campaign-contact-status']);

}