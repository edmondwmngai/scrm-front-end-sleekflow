var mvcHost = config.mvcHost;
var wiseHost = config.wiseHost;
var customCompany = sessionStorage.getItem('scrmCustomCompany') || 'no';
// no multi company in demo now, in future frame attribute add campaign to decide
var campaign = customCompany != 'no' ? customCompany : (window.frameElement.getAttribute("campaign") || parent.frameElement.getAttribute("campaign") || parent.campaign || '');
var cInputFormTbl = null;
var cCustomerTbl = null;
var selectedCat = ''; // left menu selected category
var batchTbl = null;
var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';
var customerTbl = null;
var customerTblOrder = [];
var loadedCSStatusTBl = false;
var emailFileList = [];
var outstandingAttachment = 0;
var tbdContactStatusArr = [];
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var cCustomerAjaxData = {};
var inputFormData = [];
var batchTblData = [];
var functions = parent.functions;
var isAdmin = (functions.indexOf('Campaign-Admin-Fn') != -1);
var cCustDeselectArr = [];

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

function clearOpenForm() {
    $('#o-search-campaign-select').val('').prop('disabled', false);
    $('#o-search-batch').val('').prop('disabled', false);
    $('#o-phone').val('');
    $('#o-name').val('');
    $('input:radio[name=gender-list]').each(function () { $(this).prop('checked', false); });
    $('#o-age').val('');
    $('#o-call-status').val('');
    $('#o-callback').val('');
}

function switchContent(selected, byPass) {
    // No need to change any if same category
    if (byPass == undefined && selected == selectedCat) {
        return;
    }
    $('.tab-pane').removeClass('active show');

    switch (selected) {
        case 'Survey':
            selectedCat = selected;
            $('#add-survey-content').addClass('active show');
            break;
        case langJson['l-campaign-batch']:
            clearCreate(1);
            selectedCat = selected;
            $('#batch-content').addClass('active show');
            break;
        case langJson['l-campaign-manage']:
            $('#m-lower-part').empty();
            loadBatchTbl();
            selectedCat = selected;
            $('#c-customer-tbl-container').empty();
            $('#manage-content').addClass('active show');
            break;
        case langJson['l-form-open']:
            selectedCat = selected;
            clearOpenForm();
            $('#c-customer-tbl-container').empty();
            $('#open-content').addClass('active show');
            $('#o-search-results-container').addClass('d-none');
            $('#o-contact-status-container').addClass('d-none');
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
        loadCampaignTbl();
        $('#c-call-cbx').prop('checked', false);
        $('#c-email-cbx').prop('checked', false);
        $('#c-sms-cbx').prop('checked', false);
        $('#c-whatsapp-cbx').prop('checked', false);
        $('#c-select-channel').addClass('d-none');
        $('#c-special-request').text(''); // @ search customer no specal requirement str
        $('.c-customer-input').val('');
        $('.range-div').addClass('d-none');
        $('#c-select-customer').addClass('d-none');
        $('#c-customer-tbl-container').empty();
        $('#c-name-section').addClass('d-none');
        $('#c-batch-name').val('');
        $('.c-customer-input').prop('disabled', false);
        $('#c-search-customer-again-btn').addClass('d-none');
        $('#c-search-customer-btn').removeClass('d-none');

        // when clicked 'Select' in Campaign table
    } else if (step == 2) {
        $('#c-call-cbx').prop('checked', false);
        $('#c-email-cbx').prop('checked', false);
        $('#c-sms-cbx').prop('checked', false);
        $('#c-whatsapp-cbx').prop('checked', false);
        $('#c-select-channel').addClass('d-none');
        $('#c-special-request').text(''); // @ search customer no specal requirement str
        $('.c-customer-input').val('');
        $('.range-div').addClass('d-none');
        $('#c-select-customer').addClass('d-none');
        $('#c-customer-tbl-container').empty();
        $('#c-name-section').addClass('d-none');
        $('#c-batch-name').val('');

        // when search criteria not correct
    } else if (step == 3) {
        $('#c-customer-tbl-container').empty();
        $('#c-batch-name').val('');
        $('#c-name-section').addClass('d-none');
    }
}

function isDoubleByte(str) {
    for (var i = 0, n = str.length; i < n; i++) {
        if (str.charCodeAt(i) > 255) { return true; }
    }
    return false;
}

function smsWordCount() {
    var smsContent = $('#sms-content').val() || '';
    var smsContentLen = smsContent.length;
    var haveChineseChar = isDoubleByte(smsContent);
    var msgCountArr = haveChineseChar ? [70, 134, 201, 268, 335] : [160, 306, 459, 612, 765];
    var msgNo = 1;
    var moreThanMax = true;
    for (var i = 0; i < msgCountArr.length; i++) {
        if (smsContentLen <= msgCountArr[i]) {
            msgNo = (i + 1);
            moreThanMax = false;
            break;
        }
    }
    var maxInRange = moreThanMax ? msgCountArr[4] : msgCountArr[msgNo - 1];
    var smsWordCountStr = smsContentLen + '/' + maxInRange;
    var totalMsgs = moreThanMax ? 5 : msgNo;
    $('#sms-word-count').text(smsWordCountStr);
    $('#sms-msg-count').text(totalMsgs);
}

// TBD  original
// function smsWordCount() {
//     var smsContent = $('#sms-content').val() || '';
//     var smsContentLen = smsContent.length;
//     var haveChineseChar = isDoubleByte(smsContent);
//     // wds counts refers to 3HK
//     var perMsgCount = 160;
//     if (haveChineseChar) {
//         perMsgCount = 70;
//     }
//     // round up
//     var totalMsgs = Math.ceil(smsContentLen / perMsgCount);
//     var totalMsgNumber = totalMsgs * perMsgCount;
//     var smsWordCountStr = smsContentLen + '/' + totalMsgNumber;
//     $('#sms-word-count').text(smsWordCountStr);
//     $('#sms-msg-count').text(totalMsgs);
// }
// /TBD

function formUpdated() {
    $('#o-search-btn').click();
}

function loadCampaignTbl() {
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/GetOutboundInputForm',
        data: JSON.stringify({ Agent_Id: loginId, Token: token }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        var rDetails = r.details;
        if (rDetails == 'form does not exist') {
            r.result = 'success';
            rDetails = [];
        }
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + rDetails);
        } else {
            inputFormData = rDetails;
            loadBatchTbl(); // batch table need to have campaign name (inputFormData)
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
                        defaultContent: '<button class="btn btn-sm rounded btn-warning text-capitalize"><i class="fas fa-mouse-pointer me-2"></i><span class="l-campaign-select">Select</span></button>',
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
                    columns: [{
                        title: ""
                    },
                    {
                        data: "Form_Id",
                        "visible": false
                    },
                    {
                        //title: "Name",
                        title: langJson['l-account-name'],
                        data: "Form_Name"
                    }, {
                        //title: "Details",
                        title: langJson['l-form-details'],
                        data: "Form_Details"
                    }
                    ]
                });

                // Input Form Select Event
                $('#c-campaign-tbl tbody').on('click', 'button', function (e) {
                    clearCreate(2);
                    cInputFormTbl.$('tr.highlight').removeClass('highlight');
                    $(this).parent().parent().addClass('highlight');
                    $('#c-select-channel').removeClass('d-none');
                    // NO DEL window.scrollTo(0,document.body.scrollHeight);
                });
            }
            // update Open tab search input form field
            $('#o-search-campaign-select').empty();
            var inputFormStr = '<option value="">- Please Select -</option>';
            for (let formObj of rDetails) {
                inputFormStr += '<option value=' + formObj.Form_Id + '>' + formObj.Form_Name + '</option>';
            }
            $('#o-search-campaign-select').append(inputFormStr);

            //7/7/2021 Set Language
            $('.l-campaign-select').text(langJson['l-campaign-select']);
        }
    });
}

// When selected file for attachment
function callUploadAttachment(fileData, uniqueId, loadingId, downloadId, lastAttachment) {
    $.ajax({
        type: "POST",
        url: wiseHost + '/wisepbx/api/Outbound/UploadAttachment',
        data: fileData,
        contentType: false, // Not to set any content header  
        processData: false, // Not to process data  
        dataType: 'multipart/form-data'
    }).always(function (r) {
        var response = JSON.parse(r.responseText)
        if (!/^success$/i.test(response.result || "")) {
            var details = response.details;
            console.log("Error in UploadAttachment." + details ? details : '');

        } else {
            var responseData = response.data[0];
            var theFile = $('#' + downloadId);
            // Remove loading logo
            $('#' + loadingId).remove();
            // Add "X" delete logo
            var deleteId = "delete-" + uniqueId;
            $('#' + uniqueId).append('<span id=' + deleteId + ' style="margin-left:5px;">X</span>');

            $('#' + deleteId).click(function (e) {
                for (var j = 0; j < emailFileList.length; j++) {
                    if (emailFileList[j].FileName == responseData.FileName) {
                        emailFileList.splice(j, 1);
                        break;
                    }
                }

                $('#' + uniqueId).remove();
            });

            // Add download link and its style
            theFile.attr("style", "text-decoration: underline;cursor:pointer;color:blue");
            emailFileList.push(responseData);
            theFile.attr("href", responseData.FileUrl);
            theFile.attr("target", "_blank");
        }
        if (lastAttachment) {
            // clear attachment
            var fileInput = $("#upload-emailFile");
            fileInput.replaceWith(fileInput.val('').clone(true));
        }
        outstandingAttachment = outstandingAttachment - 1;
    });
}

// When selected file for attachment
function uploadAttachment(input, batchId) {
    var limitedSizeMB = 20; // default limit 20MB
    var inputFiles = input.files;
    var inputFilesLength = inputFiles.length;
    outstandingAttachment = inputFilesLength;
    for (var i = 0; i < inputFilesLength; i++) {
        var attachment = inputFiles[i];
        // verify file size
        if (attachment.size / 1024 / 1024 > limitedSizeMB) {
            alert(langJson['l-alert-fax-file-not-valid'] + attachment.name + langJson['l-alert-exceed'] + limitedSizeMB + 'MB');
            continue; // Breaks one iteration in the loop
        }
        var attachmentName = attachment.name;
        // Make a unique id
        var uniqueId = attachmentName.replace(/[^a-zA-Z]+/g, '');
        uniqueId += new Date().getUTCMilliseconds();
        var loadingId = 'loading-' + uniqueId;
        var downloadId = 'download-' + uniqueId;

        $("#emailFile-attachment").append('<span class="email-attach-tag" id="' + uniqueId + '"><a id="' + downloadId + '" href="javascript:none;">' + attachmentName + '</a></span>');
        $("#" + uniqueId).append('<span id="' + loadingId + '"><div id="circularG"><div id="circularG_1" class="circularG"></div><div id="circularG_2" class="circularG"></div><div id="circularG_3" class="circularG"></div>' +
            '<div id="circularG_4" class="circularG"></div><div id="circularG_5" class="circularG"></div><div id="circularG_6" class="circularG"></div><div id="circularG_7" class="circularG"></div><div id="circularG_8" class="circularG"></div></div><span>');
        var fileData = new FormData();
        fileData.append("files", attachment);
        fileData.append('agentId', loginId);
        fileData.append('campaignId', batchId); // For Create New Case no case no yet, so provide internal case no
        callUploadAttachment(fileData, uniqueId, loadingId, downloadId, (i == inputFilesLength - 1));
    }
}

function appendAttachment(filePath) {
    var fileName = filePath.substring(filePath.lastIndexOf("/") + 1, filePath.length);
    var fileUrl = filePath.replace("D:", config.wiseUrl);
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

function loadBatchTbl() {
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/GetOutboundBatch',
        data: JSON.stringify({ Agent_Id: loginId, Token: token }),
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
            var searchCampaignStr = '<option value="" form-id="">- Please Select -</option>';
            batchTblData = rDetails;

            // as Marketing no Start Date and End Date, the list of batch could be very long, I'll want the latest batch be on top in select element
            for (var i = batchTblData.length - 1; i >= 0; i--) {
                var theCampaign = batchTblData[i];
                var theFormId = theCampaign.Form_Id;

                searchCampaignStr += '<option form-id=' + theFormId + ' value=' + theCampaign.Batch_Id + '>' + theCampaign.Batch_Name + '</option>';

                // need to get the form name from table for showing the batch table in Manage tab
                var theFormObj = inputFormData.find(function (formObj) { return formObj.Form_Id == theFormId });
                if (theFormObj) {
                    theCampaign.Form_Name = theFormObj.Form_Name;
                } else {
                    theCampaign.Form_Name = "";
                }
            }
            $('#o-search-batch').append(searchCampaignStr);

            if (batchTbl) {
                $('#m-batch-tbl').DataTable().clear();
                $('#m-batch-tbl').DataTable().rows.add(batchTblData); // Add new data
                $('#m-batch-tbl').DataTable().columns.adjust().draw(); // Redraw the DataTable
                //Set language
                $('.l-campaign-select').text(langJson['l-campaign-select']);
            } else {
                $('#left-menu').removeClass('d-none');
                batchTbl = $('#m-batch-tbl').DataTable({
                    data: batchTblData,
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
                    initComplete: function (settings, json) {
                        // resize();
                    },
                    columns: [{
                        title: "",
                        data: "Batch_Id",
                        visible: false
                    }, {
                        title: langJson['l-campaign-batchname'],
                        data: "Batch_Name"
                    }, {
                        title: langJson['l-campaign-campaignname'],
                        data: "Form_Name"
                    }, {
                        title: langJson['l-campaign-total'],
                        data: "Total_Leads"
                    }, {
                        title: langJson['l-form-status'],
                        data: "Batch_Status"
                    }, {
                        title: langJson['l-form-call'],
                        data: "Channel_Call",
                        className: "btnColumn",
                        orderable: false,
                        render: function (data, type, row) {
                            if (data == "Y") {
                                return '<button class="btn btn-sm rounded btn-warning text-capitalize m-call"><i class="fas fa-mouse-pointer me-2"></i><span>' + langJson['l-campaign-select'] + '</span></button>';
                            } else {
                                return "";
                            }
                        }
                    }, {
                        title: langJson['l-form-email'],
                        data: "Channel_Email",
                        className: "btnColumn",
                        orderable: false,
                        render: function (data, type, row) {
                            if (data == "Y") {
                                return '<button class="btn btn-sm rounded btn-warning text-capitalize m-email"><i class="fas fa-mouse-pointer me-2"></i><span>' + langJson['l-campaign-select'] + '</span></button>';
                            } else {
                                return "";
                            }
                        }
                    }, {
                        title: langJson['l-form-sms'],
                        data: "Channel_SMS",
                        className: "btnColumn",
                        orderable: false,
                        render: function (data, type, row) {
                            if (data == "Y") {
                                return '<button class="btn btn-sm rounded btn-warning text-capitalize m-sms"><i class="fas fa-mouse-pointer me-2"></i><span>' + langJson['l-campaign-select'] + '</span></button>';
                            } else {
                                return "";
                            }
                        }
                    }, //20/5/2021 added whatsapp col
                    {
                        title: "Whatsapp",
                        data: "Channel_Whatsapp",
                        className: "btnColumn",
                        orderable: false,
                        render: function (data, type, row) {
                            if (data == "Y") {
                                return '<button class="btn btn-sm rounded btn-warning text-capitalize m-whatsapp"><i class="fas fa-mouse-pointer me-2"></i><span>' + langJson['l-campaign-select'] + '</span></button>';
                            } else {
                                return "";
                            }
                        }
                    }


                    ],
                    "createdRow": function (row, data, rowIndex) {
                        // Per-cell function to do whatever needed with cells
                        // console.log('data');console.log(data);
                        var criteriaArr = data.Criteria.split(' | ');
                        // no need 'Channel_' info and Reanme RecordRange
                        var newCriteriaArr = [];
                        for (let theCriteria of criteriaArr) {
                            if (!theCriteria.includes('Channel_')) {
                                var newCriteria = theCriteria.replace('Age_From', 'Age From').replace('Age_To', 'Age To').replace('Recordrange_From', 'Range From').replace('Recordrange_To', 'Range To');
                                newCriteriaArr.push(newCriteria);
                            }
                        }
                        var rowTitle = '';
                        var newCriteriaLen = newCriteriaArr.length;
                        var lastIdx = newCriteriaLen - 1;
                        for (var j = 0; j < newCriteriaLen; j++) {
                            rowTitle += newCriteriaArr[j];
                            if (j != lastIdx) {
                                rowTitle += '\n'
                            }
                        }
                        $(row).attr('title', rowTitle);
                    }
                });

                //Set language
                $('.l-campaign-select').text(langJson['l-campaign-select']);

                // Select Button Clicked Event
                $('#m-batch-tbl tbody').on('click', '.m-call', function () {
                    var selectedBtn = $(this);
                    var data = batchTbl.row(selectedBtn.parents('tr')).data();
                    console.log(data);
                    data.Type = "Call";
                    var batchId = data.Batch_Id;
                    // Clear Lower Part
                    $('#m-lower-part').empty();
                    // Draw Selected 1 Row Table
                    $.ajax({
                        type: "POST",
                        url: config.companyUrl + '/api/GetOutboundBatchAssignment',
                        data: JSON.stringify({ Batch_Id: batchId, Agent_Id: loginId, Token: token }),
                        crossDomain: true,
                        contentType: "application/json",
                        dataType: 'json'
                    }).always(function (r) {
                        var campaignDetails = r.details;
                        if (!/^success$/i.test(r.result || "")) {
                            console.log('error: ' + rDetails);
                        } else {
                            // Add selected table html
                            // Add Title 
                            var selectTblHtml = '<div class="card my-2"><div class="card-body pt-0 bg-lightgray"><div class="c-section"><div class="my-1"><h5 class="d-inline l-campaign-selected-channel">Selected Campaign & Channel</h5></div>';
                            // Add Selected 1 Row Table
                            selectTblHtml += '<table id="m-selected-tbl" class="table w-100"></table></div></div></div>';
                            $('#m-lower-part').append(selectTblHtml);

                            // 7/7/2021 Set language
                            $('.l-campaign-selected-channel').text(langJson['l-campaign-selected-channel']);


                            data['Assigned'] = campaignDetails[0].Assigned;
                            data['Unassigned'] = campaignDetails[0].Unassigned;
                            $('#m-selected-tbl').DataTable({
                                data: [data],
                                dom: "t",
                                "ordering": false,
                                columns: [{
                                    title: langJson['l-campaign-batchname'],
                                    data: "Batch_Name"
                                }, {
                                    title: langJson['l-campaign-campaignname'],
                                    data: "Form_Name"
                                }, {
                                    title: langJson['l-campaign-channelname'],
                                    data: "Type"
                                }, {
                                    title: langJson['l-campaign-total'],
                                    data: "Total_Leads"
                                }, {
                                    title: langJson['l-campaign-assigned'],
                                    data: "Assigned"
                                }, {
                                    title: langJson['l-campaign-unassigned'],
                                    data: "Unassigned"
                                }]
                            });
                            // =============== Draw lower content ===============
                            // Get agent list
                            // Remarks: temprarily Vincent hard coded get agent info table Level ID 1,2 agents only
                            $.ajax({
                                type: "POST",
                                url: config.companyUrl + '/api/GetOutboundBatchAssignment_Agent',
                                data: JSON.stringify({ Batch_Id: batchId, Agent_Id: loginId, Token: token }),
                                crossDomain: true,
                                contentType: "application/json",
                                dataType: 'json'
                            }).always(function (r) {
                                var agentDetails = r.details;
                                if (!/^success$/i.test(r.result || "")) {
                                    console.log('error: ' + rDetails);
                                } else {
                                    // Add agent table string
                                    // Add Select Agent Title
                                    var agentTblStr = '<div class="card my-2"><div class="card-body pt-0"><div class="c-section"><div class="my-1"><h5 class="d-inline l-campaign-agentassignment">Agent Assignment</h5></div>';
                                    // Add Select Agent Table
                                    agentTblStr += '<table id="m-agent-tbl" class="table table-hover w-100"></table></div></div></div>';
                                    $('#m-lower-part').append(agentTblStr);
                                    // 7/7/2021 Set language
                                    $('.l-campaign-agentassignment').text(langJson['l-campaign-agentassignment']);

                                    // Draw Agent Table
                                    var agentTbl = $('#m-agent-tbl').DataTable({
                                        data: agentDetails,
                                        dom: "tip",
                                        aaSorting: [
                                            [1, "desc"] // larger number of agent id looks better
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
                                        }],
                                        initComplete: function (settings, json) {
                                            // NO DEL window.scrollTo(0,document.body.scrollHeight);
                                        }
                                    });
                                    // Select Agent Button Clicked
                                    $('#m-agent-tbl tbody').on('click', '.agent-btn', function (e) {
                                        var data = agentTbl.row($(this).parents('tr')).data();
                                        $('#m-assign-from').val(data.id).change();
                                        // Scroll To The Bottom
                                        // NO DEL window.scrollTo(0,document.body.scrollHeight);
                                    })

                                    $('#m-agent-tbl tbody').on('click', 'tr', function (e) {
                                        e.preventDefault();
                                        var data = agentTbl.row(this).data();
                                        $('#m-assign-to').val(data.Agent_Id).change();
                                    })

                                    var agentOptionStr = ""
                                    for (let theAgentObj of agentDetails) {
                                        agentOptionStr += '<option assigned="' + theAgentObj.Assigned + '"  unused="' + theAgentObj.Unused + '" value=' + theAgentObj.Agent_Id + '>' + theAgentObj.AgentName + ' (ID: ' + theAgentObj.Agent_Id + ' )</option>'
                                    }

                                    // === Draw Lower Part
                                    var lowerPartStr = "";
                                    // Add From Select
                                    var unassignment = data.Unassigned;
                                    lowerPartStr += '<div class="card my-2"><div class="card-body"><div class="d-table"><div class="mb-3 d-flex align-items-center d-table-row mb-1"><span class="form-label pe-3 d-table-cell l-campaign-from">Assign From</span><select id="m-assign-from" class="form-select d-table-cell"><option value=0 unused=' + unassignment + '>Pool</option>' + agentOptionStr + '</select><span id="m-from-description" class="text-secondary d-table-cell ps-2">Unassignment: ' + unassignment + '</span><span class="form-control"></div>';
                                    // Add Optional Call Result
                                    lowerPartStr += '<div id="m-call-result-container" class="mb-3 d-flex align-items-center mb-1 d-none"><span class="d-table-cell me-2 l-campaign-callstatus">Call Status&nbsp;&nbsp;</span><select id="m-call-result" class="form-select d-table-cell"><option value="NewLead" selected>Null</option><option value="Unreach">Unreach</option><option value="Reached">Reached</option><option value="Successful Order">Successful Order</option></select>' +

                                        '<select id="m-successful-reason" class="d-none form-select">' +
                                        '<option value="Accept Offer" selected>Accept Offer</option>' +
                                        '</select>' +

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
                                    lowerPartStr += '<div class="mb-3 d-flex align-items-center d-table-row mb-1"><span class="form-label pe-3 d-table-cell l-campaign-assignto">Assign To</span><select id="m-assign-to" class="form-select d-table-cell"><option value=0 unused=' + unassignment + '>Pool</option>' + agentOptionStr + '</select><span id="m-to-description" class="text-secondary d-table-cell ps-2">Unassignment: ' + unassignment + '</span></div>';
                                    lowerPartStr += '<div class="mb-3 d-table-row">&nbsp;</div><div class="mb-3 d-table-row"><span class="pe-2 d-table-cell l-campaign-numrecords">No. of Records&nbsp;&nbsp;</span><input id="m-assign-no" type="number" min="0" class"form-control w-auto d-table-cell" autocomplete="off" maxlength="6"><span id="m-assignable-description" class="text-secondary d-table-cell ps-2">Available No.: ' + unassignment + '</span></div></div>';
                                    lowerPartStr += '<button id="m-confirm-btn" class="btn rounded btn-sm btn-warning text-capitalize ms-2 mt-3"><i class="fas fa-clipboard-check me-2"></i><span class="l-form-confirm">Confirm</span></button></div></div>';
                                    // To Do: Agent List and str below should already got when first laod this page
                                    $('#m-lower-part').append(lowerPartStr);

                                    // 7/7/2021 Set language
                                    $('.l-campaign-from').text(langJson['l-campaign-from']);
                                    $('.l-campaign-callstatus').text(langJson['l-campaign-callstatus']);
                                    $('.l-campaign-assignto').text(langJson['l-campaign-assignto']);
                                    $('.l-campaign-numrecords').text(langJson['l-campaign-numrecords']);
                                    $('.l-form-confirm').text(langJson['l-form-confirm']);


                                    // Select From Select Change
                                    $('#m-assign-from').on('change', function () {
                                        var selected = parseInt($(this).val());
                                        var unused = $('option:selected', this).attr('unused');
                                        if (selected == 0) { // 0 = pool
                                            $('#m-from-description').html('Unassignment: ' + unused);
                                            $('#m-assignable-description').html('Available No.: ' + unused);
                                            $('#m-call-result-container').addClass('d-none').removeClass('d-table-row');
                                        } else {
                                            var assigned = $('option:selected', this).attr('assigned');
                                            $('#m-from-description').html('Assigend: ' + assigned + " Unused: " + unused);
                                            $('#m-assignable-description').html('Available No.: ' + unused);
                                            $('#m-call-result-container').removeClass('d-none').addClass('d-table-row');
                                            $('#m-call-result').val('NewLead');
                                            $('#m-unreach-reason').removeClass('d-block').addClass('d-none');
                                            $('#m-reached-reason').removeClass('d-block').addClass('d-none');
                                        }
                                    });
                                    // Select To Select Change
                                    $('#m-assign-to').on('change', function () {
                                        var selected = $(this).val();
                                        var unused = $('option:selected', this).attr('unused');
                                        if (selected == 0) { // 0 = pool
                                            $('#m-to-description').html('Unassignment: ' + unused);
                                        } else {
                                            var assigned = $('option:selected', this).attr('assigned');
                                            $('#m-to-description').html('Assigend: ' + assigned + " Unused: " + unused);
                                        }
                                    });
                                    $('#m-call-result').on('change', function () {
                                        var selected = $(this).val();
                                        if (selected == 'Successful Order') {
                                            $('#m-successful-reason').removeClass('d-none').addClass('d-block');
                                            $('#m-unreach-reason').removeClass('d-block').addClass('d-none');
                                            $('#m-reached-reason').removeClass('d-block').addClass('d-none');
                                        } else if (selected == 'Unreach') {
                                            $('#m-unreach-reason').val(''); // selection change change to please select
                                            $('#m-unreach-reason').removeClass('d-none').addClass('d-block');
                                            $('#m-successful-reason').removeClass('d-block').addClass('d-none');
                                            $('#m-reached-reason').removeClass('d-block').addClass('d-none');
                                        } else if (selected == 'Reached') {
                                            $('#m-reached-reason').val(''); // selection change change to please select
                                            $('#m-reached-reason').removeClass('d-none').addClass('d-block');
                                            $('#m-successful-reason').removeClass('d-block').addClass('d-none');
                                            $('#m-unreach-reason').removeClass('d-block').addClass('d-none');
                                        } else {
                                            $('#m-successful-reason').removeClass('d-block').addClass('d-none');
                                            $('#m-unreach-reason').removeClass('d-block').addClass('d-none');
                                            $('#m-reached-reason').removeClass('d-block').addClass('d-none');
                                        }
                                        // Available no. update
                                        if (selected.length == 0 || selected == 'NewLead') { // Null and Please Select (value empty) option, regards as new lead
                                            var avaialbleNo = $('#m-assign-from option:selected').attr('unused');
                                            $('#m-assignable-description').html('Available No.: ' + avaialbleNo);
                                        } else if (selected == 'Successful Order') {
                                            // successul get the avilable no.
                                            var getGountObj = {
                                                Batch_Id: batchId,
                                                Assign_From: parseInt($('#m-assign-from').val()),
                                                Call_Status: 'Successful Order',
                                                Call_Reason: 'Accept Offer',
                                                Agent_Id: loginId,
                                                Token: token
                                            }
                                            $.ajax({
                                                type: "POST",
                                                url: config.companyUrl + '/api/GetOutboundBatchLeadCount',
                                                data: JSON.stringify(getGountObj),
                                                crossDomain: true,
                                                contentType: "application/json",
                                                dataType: 'json'
                                            }).always(function (r) {
                                                if (!/^success$/i.test(r.result || "")) {
                                                    console.log('error: ' + r.details);
                                                } else {
                                                    $('#m-assignable-description').html('Available No.: ' + r.details.LeadCount);
                                                }
                                            });
                                        } else { // selected == 'Unreach' || selected == 'Reached'
                                            $('#m-assignable-description').html('[Please select Call Reason for Call Result to get the Avaialble no.]');
                                        }
                                    });
                                    $('#m-unreach-reason').on('change', function () {
                                        var unreachReason = $(this).val();
                                        if (unreachReason.length == 0) {
                                            var avaialbleNo = $('#m-assign-from option:selected').attr('unused');
                                            $('#m-assignable-description').html('Available No.: ' + avaialbleNo);
                                        } else {
                                            var getGountObj = {
                                                Batch_Id: batchId,
                                                Assign_From: parseInt($('#m-assign-from').val()),
                                                Call_Status: 'Unreach',
                                                Call_Reason: unreachReason,
                                                Agent_Id: loginId,
                                                Token: token
                                            }
                                            $.ajax({
                                                type: "POST",
                                                url: config.companyUrl + '/api/GetOutboundBatchLeadCount',
                                                data: JSON.stringify(getGountObj),
                                                crossDomain: true,
                                                contentType: "application/json",
                                                dataType: 'json'
                                            }).always(function (r) {
                                                if (!/^success$/i.test(r.result || "")) {
                                                    console.log('error: ' + r.details);
                                                } else {
                                                    $('#m-assignable-description').html('Available No.: ' + r.details.LeadCount);
                                                }
                                            });
                                        }
                                    });
                                    $('#m-reached-reason').on('change', function () {
                                        var reachedReason = $(this).val();
                                        if (reachedReason.length == 0) {
                                            var avaialbleNo = $('#m-assign-from option:selected').attr('unused');
                                            $('#m-assignable-description').html('Available No.: ' + avaialbleNo);
                                        } else {
                                            var getGountObj = {
                                                Batch_Id: batchId,
                                                Assign_From: parseInt($('#m-assign-from').val()),
                                                Call_Status: 'Reached',
                                                Call_Reason: reachedReason,
                                                Agent_Id: loginId,
                                                Token: token
                                            }
                                            $.ajax({
                                                type: "POST",
                                                url: config.companyUrl + '/api/GetOutboundBatchLeadCount',
                                                data: JSON.stringify(getGountObj),
                                                crossDomain: true,
                                                contentType: "application/json",
                                                dataType: 'json'
                                            }).always(function (r) {
                                                if (!/^success$/i.test(r.result || "")) {
                                                    console.log('error: ' + r.details);
                                                } else {
                                                    $('#m-assignable-description').html('Available No.: ' + r.details.LeadCount);
                                                }
                                            });
                                        }
                                    });
                                    $('#m-confirm-btn').on('click', function () {
                                        var assignFrom = parseInt($('#m-assign-from').val());
                                        var assignTo = parseInt($('#m-assign-to').val());
                                        // Verify if assign from and assign to are same, no update
                                        if (assignFrom == assignTo) {
                                            alert(langJson['l-campaign-assign-from-to-same']);
                                            return;
                                        }
                                        // Verify is that not assigning a valid number
                                        var assignNo = $('#m-assign-no').val();
                                        if (isNaN(assignNo) || assignNo.length == 0) {
                                            alert(langJson['l-campaign-no-assign-num']);
                                            return;
                                        } else {
                                            assignNo = parseInt(assignNo);
                                            if (assignNo == 0) {
                                                alert(langJson['l-campaign-zero-record']);
                                                return;
                                            }
                                        }
                                        var assignObj = {
                                            Batch_Id: batchId,
                                            Assign_From: assignFrom,
                                            Assign_To: assignTo,
                                            Assign_Total: assignNo,
                                            Agent_Id: loginId,
                                            Token: token
                                        }
                                        // not pool handling
                                        if (assignFrom != 0) {
                                            var callResult = $('#m-call-result').val();
                                            assignObj['Call_Status'] = callResult;
                                            if (callResult != 'NewLead') {
                                                var callReason = '';
                                                if (callResult == 'Successful Order') {
                                                    callReason = 'Accept Offer'; // only this option
                                                } else if (callResult == 'Unreach') {
                                                    callReason = $('#m-unreach-reason').val();
                                                } else if (callResult == 'Reached') {
                                                    callReason = $('#m-reached-reason').val();
                                                }
                                                // Verify if not NewLead, have to provide a reason
                                                if (callReason.length == 0) {
                                                    alert(langJson['l-campaign-no-call-status-reason']);
                                                    return;
                                                }
                                                // if assignFrom is agent, not pool, cannot assign lead that is contacted back to the pool, but can assign to another agent
                                                if (assignTo == 0) {
                                                    alert(langJson['l-campaign-only-new-lead']);
                                                    return;
                                                }
                                                assignObj['Call_Reason'] = callReason;
                                            }
                                        }
                                        $.ajax({
                                            type: "POST",
                                            url: config.companyUrl + '/api/AssignOutboundBatchLead',
                                            data: JSON.stringify(assignObj),
                                            crossDomain: true,
                                            contentType: "application/json",
                                            dataType: 'json'
                                        }).always(function (r) {
                                            if (!/^success$/i.test(r.result || "")) {
                                                console.log('error: ' + r.details);
                                                alert(r.details);
                                            } else {
                                                selectedBtn.click();
                                            }
                                        });
                                    });
                                }
                            });
                        }
                    });
                });
                $('#m-batch-tbl tbody').on('click', '.m-email', function () {
                    var data = batchTbl.row($(this).parents('tr')).data();
                    data.Type = "Email";
                    console.log(data);
                    var emailSubject = data.Email_Subject || '';

                    // Clear Lower Part
                    $('#m-lower-part').empty();
                    // === Draw Lower Part
                    var lowerPartStr = '';
                    // Add Title 
                    lowerPartStr += '<div class="card my-2"><div class="card-body bg-lightgray"><div class="c-section"><div class="my-1"><h5 class="d-inline l-campaign-selected-channel">Selected Campaign & Channel</h5></div>';
                    // Add Selected 1 Row Table
                    lowerPartStr += '<div class="w-100"><table id="m-selected-tbl" class="table w-100"></table></div></div></div></div>'
                    // Add Date Time Title 
                    lowerPartStr += '<div class="card my-2"><div class="card-body"><div class="c-section"><div class="mb-1"><h5 class="d-inline my-0 l-campaign-set-send-out-datetime">Set Send Out Date Time</h5></div>';
                    // Add Input
                    lowerPartStr += '<div class="mb-2"><label class="label-control me-2 l-campaign-date">Date</label><input id="m-calendar" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" class="rounded ps-2" type="text" placeholder="yyyy-mm-dd" autocomplete="off"><label class="label-control mx-2 l-campaign-time">Time</label><select id="m-hour" class="rounded me-2"><option val="00">00</option><option val="01">01</option><option val="02">02</option><option val="03">03</option><option val="04">04</option><option val="05">05</option><option val="06">06</option><option val="07">07</option><option val="08">08</option><option val="09">09</option><option val="10">10</option><option val="11">11</option><option val="12">12</option><option val="13">13</option><option val="14">14</option><option val="15">15</option><option val="16">16</option><option val="17">17</option><option val="18">18</option><option val="19">19</option><option val="20">20</option><option val="21">21</option><option val="22">22</option><option val="23">23</option></select><select id="m-min" class="rounded"><option class="00">00</option><option class="15">15</option><option class="30">30</option><option class="45">45</option></select></div></div></div></div>';
                    // Add Subject Content Title 
                    lowerPartStr += '<div class="card my-2"><div class="card-body"><div class="c-section"><div class="my-1"><h5 class="d-inline l-campaign-subject-content">Subject & Content</h5></div>';
                    // Add Subject
                    lowerPartStr += '<div class="d-flex align-items-center d-flex mb-2"><label class="control-label me-2 l-campaign-subject">Subject</label><input class="form-control flex-grow-1" id="m-mail-subject" type="search" maxlength="100" autocomplete="off" value="' + emailSubject + '"></div>'
                    // Add Editor
                    lowerPartStr += '<div id="editor"></div>';
                    // Add Attachment Field
                    var emailFileTriggerStr = '$("#upload-emailFile").trigger("click");';
                    var emailFileUploadStr = 'uploadAttachment(this,' + data.Batch_Id + ');';
                    lowerPartStr += ('<div class="d-flex align-items-center my-2"><label for="emailFile-attachment" class="control-label me-2 l-campaign-attachment">Attachment</label>' +
                        '<div id="emailFile-attachment">' +
                        '<input type="file" id="upload-emailFile" onchange=' + emailFileUploadStr + ' style="display:none" multiple>' +
                        '<input type="button" class="btn btn-warning btn-sm text-capitalize" title="Upload Attachment" value="' + langJson['l-campaign-upload'] + '" onclick=' + emailFileTriggerStr + ' /></div></div></div></div></div>');

                    // Add Variable List
                    lowerPartStr += '<div class="card my-2"><div class="card-body bg-lightgray"><div class="my-1"><h5 class="d-inline l-campaign-variable-list">Variable List</h5></div>';
                    lowerPartStr += ('<div class="d-table">' +
                        '<div class="d-table-row"><b class="d-table-cell l-campaign-field">Field</b><b class="d-table-cell l-campaign-variable">Variable</b><b class="d-table-cell"></b><b class="d-table-cell ps-5 l-campaign-field">Field</b><b class="d-table-cell l-campaign-variable">Variable</b><b class="d-table-cell"></b></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-full-name">Full Name</span><span class="d-table-cell pe-2">{{FullName}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span><span class="d-table-cell pe-2 ps-5 l-campaign-mobile-num">Mobile No</span><span class="d-table-cell pe-2">{{Mobile}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-title">Title</span><span class="d-table-cell pe-2">{{Title}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span><span class="d-table-cell pe-2 ps-5 l-campaign-home-num">Home No</span><span class="d-table-cell pe-2">{{Home}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-email">Email</span><span class="d-table-cell pe-2">{{Email}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span><span class="d-table-cell pe-2 ps-5 l-campaign-work-num">Work No</span><span class="d-table-cell pe-2">{{Work}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span></div>' +
                        '</div></div></div>');
                    lowerPartStr += '<div class="card my-2"><div class="card-body"><div class="c-section">';
                    lowerPartStr += ('<div class="d-table">' +
                        '<div class="d-table-row"><b class="d-table-cell l-campaign-field">Field</b><b class="d-table-cell l-campaign-test-value">Test Value</b><b class="d-table-cell"></b><b class="d-table-cell ps-5 l-campaign-field">Field</b><b class="d-table-cell l-campaign-test-value">Test Value</b></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-full-name">Full Name</span><span class="d-table-cell pe-2">Chan Tai Man</span><span class="d-table-cell pe-2"></span><span class="d-table-cell pe-2 ps-5 l-campaign-mobile-num ">Mobile No</span><span class="d-table-cell pe-2">61234567</span></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-title">Title</span><span class="d-table-cell pe-2">Mr.</span><span class="d-table-cell pe-2"></span><span class="d-table-cell pe-2 ps-5 l-campaign-home-num">Home No</span><span class="d-table-cell pe-2">23456789</span></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-email">Email</span><span class="d-table-cell pe-2">abc@abcde.com</span><span class="d-table-cell pe-2"></span><span class="d-table-cell pe-2 ps-5 l-campaign-work-num">Work No</span><span class="d-table-cell pe-2">34567890</span></div>' +
                        '</div></div>');
                    // Add Test Email Address
                    lowerPartStr += '<div class="mt-2"><input id="m-test-email" type="email" class="form-control w-25 d-inline" placeholder="' + langJson['l-campaign-type-your-email'] + '" maxlength=100 /><button id="m-send-test-email-btn" class="btn rounded btn-sm btn-warning text-capitalize ms-2"><i class="fas fa-paper-plane me-2"></i><span class="l-campaign-send-test-email">Send Test Email</span></button></div>';
                    lowerPartStr += '<div id="m-confirm-container" class="form-check opacity-low"><label id="m-confirm-cbx" class="form-check-label form-check-label-disabled"><input id="m-confirm-email-cbx" type="checkbox" class="form-check-input" value="call" name="call">' + langJson['l-campaign-confirm-test-email'] + '&nbsp;&nbsp;<span class="form-check-sign"><span class="check"></span></span></label></div>';
                    lowerPartStr += '<h5 class="mb-3 text-center"><button id="m-email-confirm-btn" class="btn rounded btn-sm btn-warning text-capitalize ms-2 btn-cursor-default" disabled><i class="fas fa-save me-2"></i><span class="l-form-save">Save</span></button></h5></div></div></div>';
                    // Insert String
                    $('#m-lower-part').append(lowerPartStr).ready(function () {
                        var emailBodyLink = data.Email_Body_Link || '';
                        if (emailBodyLink.length > 0) {
                            $.get(emailBodyLink).done(function (data) {
                                $("#editor").append(data || '');
                                initEditor();
                            }, 'text').fail(function () {
                                initEditor();
                            });
                        } else {
                            initEditor();
                        }

                        //Set Language 
                        $('.l-campaign-selected-channel').text(langJson['l-campaign-selected-channel']);
                        $('.l-campaign-set-send-out-datetime').text(langJson['l-campaign-set-send-out-datetime']);
                        $('.l-campaign-date').text(langJson['l-campaign-date']);
                        $('.l-campaign-time').text(langJson['l-campaign-time']);
                        $('.l-campaign-subject-content').text(langJson['l-campaign-subject-content']);
                        $('.l-campaign-subject').text(langJson['l-campaign-subject']);
                        $('.l-campaign-attachment').text(langJson['l-campaign-attachment']);
                        $('.l-campaign-variable-list').text(langJson['l-campaign-variable-list']);
                        $('.l-campaign-variable').text(langJson['l-campaign-variable']);
                        $('.l-campaign-field').text(langJson['l-campaign-field']);
                        $('.l-form-full-name').text(langJson['l-form-full-name']);
                        $('.l-campaign-mobile-num').text(langJson['l-campaign-mobile-num']);
                        $('.l-form-title').text(langJson['l-form-title']);
                        $('.l-campaign-home-num').text(langJson['l-campaign-home-num']);
                        $('.l-form-email').text(langJson['l-form-email']);
                        $('.l-campaign-work-num').text(langJson['l-campaign-work-num']);
                        $('.l-campaign-test-value').text(langJson['l-campaign-test-value']);
                        $('.l-campaign-type-your-email').text(langJson['l-campaign-type-your-email']);
                        $('.l-campaign-send-test-email').text(langJson['l-campaign-send-test-email']);
                        $('.l-form-save').text(langJson['l-form-save']);



                        // set date time
                        var sendDateTime = data.Email_Delivery_Time || '';
                        if (sendDateTime.length > 0) {
                            var datetime = sendDateTime.split("T"); // obtain date and time separately
                            var date = datetime[0];
                            var time = datetime[1];
                            var hour = time.substring(0, 2); // obtain time in HH:MM format
                            var min = time.substring(3, 5);
                            // set the date to datepicker textbox

                            $('#m-calendar').val(date);
                            // Set Date Time
                            $('#m-hour').val(hour);
                            $('#m-min').val(min);
                        }
                    });
                    var attachmentArr = data.Email_Attachment_Link == '' || data.Email_Attachment_Link == null ? '' : data.Email_Attachment_Link.split(',');
                    if (attachmentArr !== '') {
                        for (let tmpAttachment of attachmentArr) {
                            var newAttachment = tmpAttachment.split('\\').join('/');
                            appendAttachment(newAttachment);
                        }
                    }

                    $('.pop').popover();
                    $('.pop').on('shown.bs.popover', function () {
                        // Copy Variable
                        var copyText = $(this).parent().prev()[0];
                        var textArea = document.createElement("textarea");
                        textArea.value = copyText.textContent;
                        document.body.appendChild(textArea);
                        textArea.select();
                        textArea.setSelectionRange(0, 100)
                        document.execCommand("Copy");
                        textArea.remove();
                        // Hide Pop
                        var $pop = $(this);
                        setTimeout(function () {
                            $pop.popover('hide');
                        }, 1000);
                    });

                    var dateToday = new Date(); // no past date can be selected
                    $('#m-calendar').datepicker({
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

                    // Draw Selected 1 Row Table
                    $('#m-selected-tbl').DataTable({
                        data: [data],
                        dom: "t",
                        "ordering": false,
                        columns: [{
                            title: langJson['l-campaign-batchname'],
                            data: "Batch_Name"
                        }, {
                            title: langJson['l-campaign-campaignname'],
                            data: "Form_Name"
                        }, {
                            title: langJson['l-campaign-channelname'],
                            data: "Type"
                        }, {
                            title: langJson['l-campaign-total'],
                            data: "Total_Leads"
                        }]
                    });
                    $('#m-send-test-email-btn').on('click', function () {
                        var testEmail = $('#m-test-email').val();

                        if (testEmail.length == 0) {
                            alert(langJson['l-campaign-test-email-blank']);
                            return;
                        }

                        var emailSubject = $('#m-mail-subject').val() || '';
                        if (emailSubject.length == 0) {
                            alert(langJson['l-campaign-email-subject-blank']);
                            return;
                        }

                        var emailContent = CKEDITOR.instances.editor.getData() || '';
                        if (emailContent.length == 0) {
                            alert(langJson['l-campaign-email-content-blank']);
                            return;
                        }

                        emailContent = emailContent.replace(/{{FullName}}/g, 'Chan Tai Man')
                            .replace(/{{Title}}/g, 'Mr.')
                            .replace(/{{Email}}/g, 'abc@abcde.com')
                            .replace(/{{Mobile}}/g, 61234567)
                            .replace(/{{Home}}/g, 23456789)
                            .replace(/{{Work}}/g, 34567890);

                        var attachedFiles = '';
                        for (var j = 0; j < emailFileList.length; j++) {
                            if (j == 0) {
                                attachedFiles += emailFileList[j].FilePath;
                            } else {
                                attachedFiles += ("," + emailFileList[j].FilePath);
                            }
                        }
                        // Max Length is 4096
                        if (attachedFiles.length > 4096) {
                            alert(langJson['l-campaign-length-of-file']);
                            return;
                        }

                        var tempConnId = String(parent.parent.sendEmail(campaign, testEmail, '', emailSubject, emailContent, attachedFiles));

                        if (tempConnId != 0 || tempConnId != -1) {
                            $('#m-test-phone-no').val('');
                            $('#sent-test-sms-lbl').fadeIn();
                            setTimeout(function () { $('#sent-test-sms-lbl').fadeOut() }, 2000);
                            // Opacity becmoe 1 again
                            $('#m-confirm-container').removeClass('opacity-low');
                            // Piont Event Become Cursor Again
                            $('#m-confirm-cbx').removeClass('form-check-label-disabled');
                            // Cbx Can be Clicked Again
                            $('#m-confirm-email-cbx').prop('disabled', false).removeClass('btn-cursor-default');
                        }
                    });
                    $('#m-confirm-email-cbx').on('change', function () {
                        var isChecked = $(this).prop('checked');
                        if (isChecked) {
                            $('#m-email-confirm-btn').prop('disabled', false);
                        } else {
                            $('#m-email-confirm-btn').prop('disabled', true);
                        }
                    });
                    CKEDITOR.on('instanceCreated', function (e) {
                        e.editor.on('contentDom', function () {
                            var editable = e.editor.editable();
                            editable.attachListener(e.editor.document, 'keydown', function (evt) {
                                if (event.keyCode == 33 || event.keyCode == 34) {
                                    e.editor.editable().$.blur();
                                }
                            });
                        });
                    });
                    // NO DEL CKEDITOR.on('instanceReady', function() { $(window).scrollTop($('#m-lower-part').offset().top); });
                    $('#m-email-confirm-btn').on('click', function () {
                        // TO DO: to compare the date time earlier then now, if too close(e.g. with these 2 minutes should also warn not okay)
                        var inputDate = $('#m-calendar').val();

                        // ========== Verify ==========
                        if (inputDate.length == 0) {
                            alert(langJson['l-campaign-email-datetime-blank']);
                            return;
                        }

                        var emailSubject = $('#m-mail-subject').val() || '';
                        if (emailSubject.length == 0) {
                            alert(langJson['l-campaign-email-subject-blank']);
                        }

                        var emailContent = CKEDITOR.instances.editor.getData() || '';
                        if (emailContent.length == 0) {
                            alert(langJson['l-campaign-email-content-blank']);
                        }
                        // ========== /Verify ==========

                        var inputHour = $('#m-hour').val();
                        var inputMinute = $('#m-min').val();
                        var theHour = inputHour.length != 2 ? '00' : inputHour;
                        var theMinute = inputMinute.length != 2 ? '00' : inputMinute;
                        var sendDateTime = inputDate + ' ' + theHour + ':' + theMinute;

                        var attachedFiles = '';
                        for (var j = 0; j < emailFileList.length; j++) {
                            if (j == 0) {
                                attachedFiles += emailFileList[j].FileUrl;
                            } else {
                                attachedFiles += ("," + emailFileList[j].FileUrl);
                            }
                        }

                        var sendObj = {
                            Batch_Id: data.Batch_Id,
                            Agent_Id: loginId,
                            Email_Delivery_Time: sendDateTime,
                            Email_Subject: emailSubject,
                            Email_Attachment_Link: attachedFiles,
                            Token: token
                        };

                        $.ajax({
                            type: "POST",
                            url: wiseHost + '/wisepbx/api/Email/UploadContent',
                            data: JSON.stringify({ agentId: loginId, content: emailContent }),
                            crossDomain: true,
                            contentType: "application/json",
                            dataType: 'json'
                        }).always(function (r) {
                            if (!/^success$/i.test(r.result || "")) {
                                console.log('error: ' + r.details);
                                alert(langJson['l-campaign-failed-to-upload']);
                            } else {
                                sendObj.Email_Body_Link = r.data.fileLink;
                                $.ajax({
                                    type: "PUT",
                                    url: config.companyUrl + '/api/UpdateOutboundBatch',
                                    data: JSON.stringify(sendObj),
                                    crossDomain: true,
                                    contentType: "application/json",
                                    dataType: 'json'
                                }).always(function (r) {
                                    if (!/^success$/i.test(r.result || "")) {
                                        console.log('error: ' + r.details);
                                        alert(langJson['l-campaign-fail-update-outbound']);
                                    } else {
                                        switchContent('Manage', true);
                                        alert(langJson['l-campaign-scheduled-send-email']);
                                    }
                                });
                            }
                        });


                    });

                });
                $('#m-batch-tbl tbody').on('click', '.m-sms', function () {
                    var data = batchTbl.row($(this).parents('tr')).data();
                    data.Type = "SMS";
                    var smsContent = data.SMS_Content || '';
                    var sendDateTime = data.SMS_Delivery_Time || '';
                    // Clear Lower Part
                    $('#m-lower-part').empty();
                    // === Draw Lower Part
                    var lowerPartStr = "";
                    // Add Title 
                    lowerPartStr += '<div class="card my-2"><div class="card-body bg-lightgray"><div class="c-section"><div class="my-1"><h5 class="d-inline l-campaign-selected-channel">Selected Campaign & Channel</h5></div>';
                    // Add Selected 1 Row Table
                    lowerPartStr += '<div class="w-100"><table id="m-selected-tbl" class="table w-100"></table></div></div></div></div>';
                    // Add Date Time Title 
                    lowerPartStr += '<div class="card my-2"><div class="card-body"><div class="c-section"><div class="mb-1"><h5 class="d-inline my-0 l-campaign-set-send-out-datetime">Set Send Out Date Time</h5></div>';
                    // Add Input
                    lowerPartStr += '<div class="mb-2"><label class="label-control me-2 l-campaign-date">Date</label><input id="m-calendar" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" class="rounded ps-2" type="text" placeholder="yyyy-mm-dd" autocomplete="off"><label class="label-control mx-2 l-campaign-time">Time</label><select id="m-hour" class="rounded me-2"><option val="00">00</option><option val="01">01</option><option val="02">02</option><option val="03">03</option><option val="04">04</option><option val="05">05</option><option val="06">06</option><option val="07">07</option><option val="08">08</option><option val="09">09</option><option val="10">10</option><option val="11">11</option><option val="12">12</option><option val="13">13</option><option val="14">14</option><option val="15">15</option><option val="16">16</option><option val="17">17</option><option val="18">18</option><option val="19">19</option><option val="20">20</option><option val="21">21</option><option val="22">22</option><option val="23">23</option></select><select id="m-min" class="rounded"><option class="00">00</option><option class="15">15</option><option class="30">30</option><option class="45">45</option></select></div></div>';
                    // Add SMS Content Textarea
                    lowerPartStr += ('<div><textarea class="mt-3 rounded" id="sms-content" rows="3" cols="20" style="font-family:inherit;width:100%;" maxlength="500" onKeyUp="smsWordCount()" placeholder="' + langJson['l-campaign-sms-content-here'] + '">' + smsContent + '</textarea></div>' +
                        '<div class="w-100"><span style="float:right;margin-right:30px;"><span id="sms-word-count" class="align-right">0/170</span>&nbsp;&nbsp;<span id="sms-msg-count">1</span>&nbsp;message(s)</span></div></div></div></div>');

                    // Add Variable List
                    // lowerPartStr += '<div class="card my-2"><div class="card-body"><div class="c-section"><div class="my-1"><h5 class="d-inline">Variable List</h5></div>';
                    // lowerPartStr += ('<div class="d-table">' +
                    // '<div class="d-table-row"><b class="d-table-cell">Field</b><b class="d-table-cell">Variable</b><b class="d-table-cell"></b><b class="d-table-cell">Test Value</b><b class="d-table-cell">Field</b><b class="d-table-cell">Variable</b><b class="d-table-cell"></b><b class="d-table-cell">Test Value</b></div>' + 
                    // '<div class="d-table-row"><span class="d-table-cell pe-2">Full Name</span><span class="d-table-cell pe-2">{{FullName}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span><span class="d-table-cell pe-5"><input type="text" class="rounded ps-2" /></span><span class="d-table-cell pe-2">Mobile No</span><span class="d-table-cell pe-2">{{Mobile}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span><span class="d-table-cell"><input type="text" class="rounded ps-2"/></span></div>' + 
                    // '<div class="d-table-row"><span class="d-table-cell pe-2">Title</span><span class="d-table-cell pe-2">{{Title}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span><span class="d-table-cell pe-5"><input type="text" class="rounded ps-2" /></span><span class="d-table-cell pe-2">Home No</span><span class="d-table-cell pe-2">{{Home}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span><span class="d-table-cell"><input type="text" class="rounded ps-2" /></span></div>' + 
                    // '<div class="d-table-row"><span class="d-table-cell pe-2">Email</span><span class="d-table-cell pe-2">{{Email}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span><span class="d-table-cell pe-5"><input type="text" class="rounded ps-2" /></span><span class="d-table-cell pe-2">Work No</span><span class="d-table-cell pe-2">{{Work}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span><span class="d-table-cell"><input type="text" class="rounded ps-2" /></span></div>' + 
                    // '</div></div>');

                    lowerPartStr += '<div class="card my-2"><div class="card-body bg-lightgray"><div class="my-1"><h5 class="d-inline l-campaign-variable-list">Variable List</h5></div>';
                    lowerPartStr += ('<div class="d-table">' +
                        '<div class="d-table-row"><b class="d-table-cell l-campaign-field">Field</b><b class="d-table-cell l-campaign-variable">Variable</b><b class="d-table-cell"></b><b class="d-table-cell ps-5 l-campaign-field">Field</b><b class="d-table-cell l-campaign-variable">Variable</b><b class="d-table-cell"></b></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-full-name">Full Name</span><span class="d-table-cell pe-2">{{FullName}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span><span class="d-table-cell pe-2 ps-5 l-campaign-mobile-num">Mobile No</span><span class="d-table-cell pe-2">{{Mobile}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-title">Title</span><span class="d-table-cell pe-2">{{Title}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span><span class="d-table-cell pe-2 ps-5 l-campaign-home-num">Home No</span><span class="d-table-cell pe-2">{{Home}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-email">Email</span><span class="d-table-cell pe-2">{{Email}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span><span class="d-table-cell pe-2 ps-5 l-campaign-work-num">Work No</span><span class="d-table-cell pe-2">{{Work}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span></div>' +
                        '</div></div></div>');
                    lowerPartStr += '<div class="card my-2"><div class="card-body"><div class="c-section">';
                    lowerPartStr += ('<div class="d-table">' +
                        '<div class="d-table-row"><b class="d-table-cell l-campaign-field">Field</b><b class="d-table-cell l-campaign-test-value">Test Value</b><b class="d-table-cell"></b><b class="d-table-cell ps-5 l-campaign-field">Field</b><b class="d-table-cell l-campaign-test-value">Test Value</b></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-full-name">Full Name</span><span class="d-table-cell pe-2">Chan Tai Man</span><span class="d-table-cell pe-2"></span><span class="d-table-cell pe-2 ps-5 l-campaign-mobile-num">Mobile No</span><span class="d-table-cell pe-2">61234567</span></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-title">Title</span><span class="d-table-cell pe-2">Mr.</span><span class="d-table-cell pe-2"></span><span class="d-table-cell pe-2 ps-5 l-campaign-home-num">Home No</span><span class="d-table-cell pe-2">23456789</span></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-email">Email</span><span class="d-table-cell pe-2">abc@abcde.com</span><span class="d-table-cell pe-2"></span><span class="d-table-cell pe-2 ps-5 l-campaign-work-num">Work No</span><span class="d-table-cell pe-2">34567890</span></div>' +
                        '</div></div>');

                    // Add Test SMS
                    lowerPartStr += '<div class="mt-2"><input id="m-test-phone-no" type="tel" class="form-control w-25 d-inline" placeholder="' + langJson['l-campaign-type-your-phone'] + '" maxlength=100 autocomplete="off" /><button id="m-send-test-sms-btn" class="btn rounded btn-sm btn-warning text-capitalize ms-2"><i class="fas fa-paper-plane me-2"></i><span class="l-campaign-send-test-sms">Send Test SMS</span></button><span id="sent-test-sms-lbl" style="display:none;">&nbsp;Sent!</span></div>';
                    lowerPartStr += '<div id="m-confirm-container" class="form-check opacity-low"><label id="m-confirm-cbx" class="form-check-label form-check-label-disabled"><input id="m-confirm-sms-cbx" type="checkbox" class="form-check-input" value="call" name="call">' + langJson['l-campaign-confirm-test-sms'] + '&nbsp;&nbsp;<span class="form-check-sign"><span class="check"></span></span></label></div>';
                    lowerPartStr += '<h5 class="mb-3 text-center"><button id="m-sms-confirm-btn" class="btn rounded btn-sm btn-warning text-capitalize ms-2 btn-cursor-default" disabled><i class="fas fa-save me-2"></i><span class="l-form-save">Save</span></button></h5></div></div>';
                    // Insert String
                    $('#m-lower-part').append(lowerPartStr);

                    //Set Language (SMS)
                    $('.l-campaign-selected-channel').text(langJson['l-campaign-selected-channel']);
                    $('.l-campaign-set-send-out-datetime').text(langJson['l-campaign-set-send-out-datetime']);
                    $('.l-campaign-date').text(langJson['l-campaign-date']);
                    $('.l-campaign-time').text(langJson['l-campaign-time']);
                    $('.l-campaign-variable-list').text(langJson['l-campaign-variable-list']);
                    $('.l-campaign-variable').text(langJson['l-campaign-variable']);
                    $('.l-campaign-field').text(langJson['l-campaign-field']);
                    $('.l-form-full-name').text(langJson['l-form-full-name']);
                    $('.l-campaign-mobile-num').text(langJson['l-campaign-mobile-num']);
                    $('.l-form-title').text(langJson['l-form-title']);
                    $('.l-campaign-home-num').text(langJson['l-campaign-home-num']);
                    $('.l-form-email').text(langJson['l-form-email']);
                    $('.l-campaign-work-num').text(langJson['l-campaign-work-num']);
                    $('.l-campaign-test-value').text(langJson['l-campaign-test-value']);
                    $('.l-campaign-type-your-phone').text(langJson['l-campaign-type-your-phone']);
                    $('.l-campaign-send-test-sms').text(langJson['l-campaign-send-test-sms']);
                    $('.l-form-save').text(langJson['l-form-save']);


                    if (smsContent.length > 0) {
                        var datetime = sendDateTime.split("T"); // obtain date and time separately
                        var date = datetime[0];
                        var time = datetime[1];
                        var hour = time.substring(0, 2); // obtain time in HH:MM format
                        var min = time.substring(3, 5);
                        // set the date to datepicker textbox

                        $('#m-calendar').val(date);
                        // Set Date Time
                        $('#m-hour').val(hour);
                        $('#m-min').val(min);
                    }

                    // Draw Selected 1 Row Table
                    $('#m-selected-tbl').DataTable({
                        data: [data],
                        dom: "t",
                        "ordering": false,
                        columns: [{
                            title: langJson['l-campaign-batchname'],
                            data: "Batch_Name"
                        },
                        {
                            title: langJson['l-campaign-campaignname'],
                            data: "Form_Name"
                        }, {
                            title: langJson['l-campaign-channelname'],
                            data: "Type"
                        }, {
                            title: langJson['l-campaign-total'],
                            data: "Total_Leads"
                        }
                        ]
                    });
                    // Set Calendar
                    var dateToday = new Date(); // no past date can be selected
                    $('#m-calendar').datepicker({
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
                    // Set Copy Popover
                    $('.pop').popover();
                    $('.pop').on('shown.bs.popover', function () {
                        // Copy Variable
                        var copyText = $(this).parent().prev()[0];
                        var textArea = document.createElement("textarea");
                        textArea.value = copyText.textContent;
                        document.body.appendChild(textArea);
                        textArea.select();
                        textArea.setSelectionRange(0, 100)
                        document.execCommand("Copy");
                        textArea.remove();
                        // Hide Pop
                        var $pop = $(this);
                        setTimeout(function () {
                            $pop.popover('hide');
                        }, 1000);
                    });

                    // Send Test SMS
                    $('#m-send-test-sms-btn').on('click', function () {
                        // === Verify ===
                        var testPhoneNo = $('#m-test-phone-no').val();
                        if (testPhoneNo.length == 0) {
                            alert(langJson['l-campaign-test-phone-blank']);
                            return;
                        }
                        var smsContent = $('#sms-content').val() || '';
                        if (smsContent.length == 0) {
                            alert(langJson['l-campaign-sms-content-blank']);
                            return;
                        }
                        // === /Verify ===

                        smsContent = smsContent.replace(/{{FullName}}/g, 'Chan Tai Man')
                            .replace(/{{Title}}/g, 'Mr.')
                            .replace(/{{Email}}/g, 'abc@abcde.com')
                            .replace(/{{Mobile}}/g, 61234567)
                            .replace(/{{Home}}/g, 23456789)
                            .replace(/{{Work}}/g, 34567890);

                        var tempConnId = parent.parent.sendSMS(campaign, Number(testPhoneNo), smsContent) || 0;

                        if (tempConnId != 0 || tempConnId != -1) {
                            $('#m-test-phone-no').val('');
                            $('#sent-test-sms-lbl').fadeIn();
                            setTimeout(function () { $('#sent-test-sms-lbl').fadeOut() }, 2000);
                            // Opacity becmoe 1 again
                            $('#m-confirm-container').removeClass('opacity-low');
                            // Piont Event Become Cursor Again
                            $('#m-confirm-cbx').removeClass('form-check-label-disabled');
                            // Cbx Can be Clicked Again
                            $('#m-confirm-sms-cbx').prop('disabled', false).removeClass('btn-cursor-default');
                        }
                    });

                    $('#m-confirm-sms-cbx').on('change', function () {
                        var isChecked = $(this).prop('checked');
                        if (isChecked) {
                            $('#m-sms-confirm-btn').prop('disabled', false);
                        } else {
                            $('#m-sms-confirm-btn').prop('disabled', true);
                        }
                    });

                    $('#m-sms-confirm-btn').on('click', function () {
                        // TO DO: to compare the date time earlier then now, if too close(e.g. with these 2 minutes should also warn not okay)
                        var inputDate = $('#m-calendar').val();
                        if (inputDate.length == 0) {
                            alert(langJson['l-campaign-email-datetime-blank']);
                            return;
                        }
                        var smsContent = $('#sms-content').val() || '';
                        var inputHour = $('#m-hour').val();
                        var inputMinute = $('#m-min').val();
                        var theHour = inputHour.length != 2 ? '00' : inputHour;
                        var theMinute = inputMinute.length != 2 ? '00' : inputMinute;
                        var sendDateTime = inputDate + ' ' + theHour + ':' + theMinute;

                        var sendObj = {
                            Batch_Id: data.Batch_Id,
                            Agent_Id: loginId,
                            SMS_Delivery_Time: sendDateTime,
                            SMS_Content: smsContent,
                            Token: token
                        };

                        $.ajax({
                            type: "PUT",
                            url: config.companyUrl + '/api/UpdateOutboundBatch',
                            data: JSON.stringify(sendObj),
                            crossDomain: true,
                            contentType: "application/json",
                            dataType: 'json'
                        }).always(function (r) {
                            if (!/^success$/i.test(r.result || "")) {
                                console.log('error: ' + r.details);
                                alert(langJson['l-campaign-fail-update-outbound']);
                            } else {
                                switchContent('Manage', true);
                                alert(langJson['l-campaign-scheduled-send-sms']);
                            }
                        });
                    });

                    // NO DEL $(window).scrollTop($('#m-lower-part').offset().top);
                    $('textarea').keydown(function (e) {
                        if (e.keyCode == 33 || e.keyCode == 34) {
                            $(this).blur();
                        }
                    });
                });

                $('#m-batch-tbl tbody').on('click', '.m-whatsapp', function () {
                    var data = batchTbl.row($(this).parents('tr')).data();

                    $('#m-lower-part').empty();
                    var lowerPartStr = "";
                    lowerPartStr += '<div class="card my-2"><div class="card-body bg-lightgray"><div class="c-section"><div class="my-1"><h5 class="d-inline l-campaign-selected-channel">Selected Campaign & Channel</h5></div>';
                    lowerPartStr += '<div class="w-100"><table id="m-selected-tbl" class="table w-100"></table></div></div></div></div>';

                    //send out datatime input
                    lowerPartStr += '<div class="card my-2"><div class="card-body"><div class="c-section"><div class="mb-1"><h5 class="d-inline my-0 l-campaign-set-send-out-datetime">Set Send Out Date Time</h5></div>';
                    lowerPartStr += '<div class="mb-2"><label class="label-control me-2 l-campaign-date">Date</label><input id="m-calendar" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" class="rounded ps-2" type="text" placeholder="yyyy-mm-dd" autocomplete="off"><label class="label-control mx-2 l-campaign-time">Time</label><select id="m-hour" class="rounded me-2"><option val="00">00</option><option val="01">01</option><option val="02">02</option><option val="03">03</option><option val="04">04</option><option val="05">05</option><option val="06">06</option><option val="07">07</option><option val="08">08</option><option val="09">09</option><option val="10">10</option><option val="11">11</option><option val="12">12</option><option val="13">13</option><option val="14">14</option><option val="15">15</option><option val="16">16</option><option val="17">17</option><option val="18">18</option><option val="19">19</option><option val="20">20</option><option val="21">21</option><option val="22">22</option><option val="23">23</option></select><select id="m-min" class="rounded"><option class="00">00</option><option class="15">15</option><option class="30">30</option><option class="45">45</option></select></div></div>';
                    lowerPartStr += '<div id="send-wa-container" class="">' + '<button id="select-tp-btn" class="btn btn-sm btn-warning text-capitalize rounded">' + langJson['l-campaign-select-template'] + '</button>' + '<div id="send-wa-section" class="mt-2"></div></div>';

                    //09/06 whatsapp variable list=====================
                    lowerPartStr += '<div class="card my-2"><div class="card-body bg-lightgray"><div class="my-1"><h5 class="d-inline l-campaign-variable-list">Variable List</h5></div>';
                    lowerPartStr += ('<div class="d-table">' +
                        '<div class="d-table-row"><b class="d-table-cell l-campaign-field">Field</b><b class="d-table-cell l-campaign-variable">Variable</b><b class="d-table-cell"></b><b class="d-table-cell ps-5 l-campaign-field">Field</b><b class="d-table-cell l-campaign-variable">Variable</b><b class="d-table-cell"></b></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-full-name">Full Name</span><span class="d-table-cell pe-2">{{FullName}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span><span class="d-table-cell pe-2 ps-5 l-campaign-mobile-num">Mobile No</span><span class="d-table-cell pe-2">{{Mobile}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-title">Title</span><span class="d-table-cell pe-2">{{Title}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span><span class="d-table-cell pe-2 ps-5 l-campaign-home-num">Home No</span><span class="d-table-cell pe-2">{{Home}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-email">Email</span><span class="d-table-cell pe-2">{{Email}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span><span class="d-table-cell pe-2 ps-5 l-campaign-work-num">Work No</span><span class="d-table-cell pe-2">{{Work}}</span><span class="d-table-cell pe-2"><i class="fas fa-copy cursor-pointer pop" title="Copied!" data-bs-content="" data-bs-toggle="popover" data-bs-placement="bottom"></i></span></div>' +
                        '</div></div></div>');
                    lowerPartStr += '<div class="card my-2"><div class="card-body"><div class="c-section">';
                    lowerPartStr += ('<div class="d-table">' +
                        '<div class="d-table-row"><b class="d-table-cell l-campaign-field">Field</b><b class="d-table-cell l-campaign-test-value">Test Value</b><b class="d-table-cell"></b><b class="d-table-cell ps-5 l-campaign-field">Field</b><b class="d-table-cell l-campaign-test-value">Test Value</b></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-full-name">Full Name</span><span class="d-table-cell pe-2">Chan Tai Man</span><span class="d-table-cell pe-2"></span><span class="d-table-cell pe-2 ps-5 l-campaign-mobile-num">Mobile No</span><span class="d-table-cell pe-2">61234567</span></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-title">Title</span><span class="d-table-cell pe-2">Mr.</span><span class="d-table-cell pe-2"></span><span class="d-table-cell pe-2 ps-5 l-campaign-home-num">Home No</span><span class="d-table-cell pe-2">23456789</span></div>' +
                        '<div class="d-table-row"><span class="d-table-cell pe-2 l-form-email">Email</span><span class="d-table-cell pe-2">abc@abcde.com</span><span class="d-table-cell pe-2"></span><span class="d-table-cell pe-2 ps-5 l-campaign-work-num">Work No</span><span class="d-table-cell pe-2">34567890</span></div>' +
                        '</div></div>');

                    // Add Test Whatsapp
                    lowerPartStr += '<div class="mt-2"><input id="m-test-phone-no" type="tel" class="form-control w-25 d-inline" placeholder="' + langJson['l-campaign-type-your-phone'] + '" maxlength=100 autocomplete="off" /><button id="m-send-test-whatsapp-btn" class="btn rounded btn-sm btn-warning text-capitalize ms-2"><i class="fas fa-paper-plane me-2"></i><span class="l-campaign-send-test-whatsapp">Send Test Whatsapp</span></button><span id="sent-test-whatsapp-lbl" style="display:none;">&nbsp;Sent!</span></div>';
                    lowerPartStr += '<div id="m-confirm-container" class="form-check opacity-low"><label id="m-confirm-cbx" class="form-check-label form-check-label-disabled"><input id="m-confirm-whatsapp-cbx" type="checkbox" class="form-check-input" value="call" name="call">' + langJson['l-campaign-confirm-test-whatsapp'] + '&nbsp;&nbsp;<span class="form-check-sign"><span class="check"></span></span></label></div>';

                    //save btn
                    lowerPartStr += '<h5 class="mb-3 text-center"><button id="m-whatsapp-confirm-btn" class="btn rounded btn-sm btn-warning text-capitalize ms-2 btn-cursor-default" disabled><i class="fas fa-save me-2"></i><span class="l-form-save">Save</span></button></h5></div></div>';

                    //whatsapp variable list end==========================

                    // Insert String
                    $('#m-lower-part').append(lowerPartStr);

                    //Set Language (Whatsapp)
                    $('.l-campaign-selected-channel').text(langJson['l-campaign-selected-channel']);
                    $('.l-campaign-set-send-out-datetime').text(langJson['l-campaign-set-send-out-datetime']);
                    $('.l-campaign-date').text(langJson['l-campaign-date']);
                    $('.l-campaign-time').text(langJson['l-campaign-time']);
                    $('.l-campaign-variable-list').text(langJson['l-campaign-variable-list']);
                    $('.l-campaign-field').text(langJson['l-campaign-field']);
                    $('.l-campaign-variable').text(langJson['l-campaign-variable']);
                    $('.l-campaign-test-value').text(langJson['l-campaign-test-value']);
                    $('.l-form-full-name').text(langJson['l-form-full-name']);
                    $('.l-campaign-mobile-num').text(langJson['l-campaign-mobile-num']);
                    $('.l-form-title').text(langJson['l-form-title']);
                    $('.l-campaign-home-num').text(langJson['l-campaign-home-num']);
                    $('.l-form-email').text(langJson['l-form-email']);
                    $('.l-campaign-work-num').text(langJson['l-campaign-work-num']);
                    $('.l-campaign-send-test-whatsapp').text(langJson['l-campaign-send-test-whatsapp']);
                    $('.l-form-save').text(langJson['l-form-save']);


                    //show history ==========================================================================
                    data.Type = "Whatsapp";
                    var whatsappContent = data.Whatsapp_Tp_Props || '';
                    var obj;
                    var props;
                    var tpid;
                    if (whatsappContent != '') {
                        obj = JSON.parse(whatsappContent);
                        props = obj.props;
                        tpid = obj.TP_id;
                    }
                    var sendDateTime = data.Whatsapp_Delivery_Time || '';

                    if (sendDateTime != '') { //display latest send out dt & msg
                        var datetime = sendDateTime.split("T"); // obtain date and time separately
                        var date = datetime[0];
                        var time = datetime[1];
                        var hour = time.substring(0, 2); // obtain time in HH:MM format
                        var min = time.substring(3, 5);
                        // set the date to datepicker textbox

                        $('#m-calendar').val(date);
                        // Set Date Time
                        $('#m-hour').val(hour);
                        $('#m-min').val(min);

                        let waTPArr = [
                            { id: 6, props: 2, type: 'tp_text', crm: 'You made a purchase for {{1}} using a credit card ending in {{2}}' },
                            { id: 9, props: 2, type: 'tp_qr', crm: '{"img":"{{1}}","txt":"謝謝你的支持，{{2}}","btns":["我想知道更多(A01)","暫時不用","遲D再回覆你"]}' },
                            { id: 11, props: 3, type: "tp_cta", crm: '{"img":"{{1}}","txt": "感謝您登記成為會員，\\r\\n{{2}}", "btns": [{"type": "hotline", "display": "查詢熱線"},{"type": "website", "display": "網頁","url":{"no": "{{3}}", "link": "http://202.64.83.112/redirect?url="}}]}' },
                            { id: 8, props: 2, type: 'tp_cta', crm: '{"img":"{{1}}","txt":"感謝您登記成為會員，\\r\\n{{2}}","btns":[{"type":"hotline","display":"查詢熱線"},{"type":"website","display":"網頁"}]}' },
                            { id: 7, props: 1, type: 'tp_qr', crm: '{"img":"{{1}}","txt":"This is buttons test template.", "btns":["Yes","No", "Will Confirm Later"]}' },
                            { id: 12, props: 2, type: 'tp_qr', crm: '{"img": "{{1}}", "txt": "Thank you for your support, {{2}}", "btns": ["Yes(A01)", "No", "Will Confirm Later"]}' },
                            { id: 13, props: 3, type: 'tp_qr', crm: '{"img": "{{1}}", "txt": "{{2}}Thank you for your support{{3}}", "btns": ["Yes(A01)", "No", "Will Confirm Later"]}' },
                            { id: 14, props: 5, type: 'tp_cta', crm: '{"img": "{{1}}", "txt": "{{2}}\\r\\n{{3}}\\r\\n{{4}}\\r\\n{{5}}\\r\\n如您不希望再透過WhatsApp接收訊息, 請按「取消訂閱」", "btns": [{"type": "website", "display": "取消訂閱"}]}' }
                        ];
                        var index;
                        for (var i = 0; i < waTPArr.length; i++) {
                            if (waTPArr[i].id == tpid) {
                                index = i;
                            }
                        }

                        var theTemplate = waTPArr[index];
                        var crmText = theTemplate.crm;
                        var msg_content = crmText.replace(/\{\{1}}/g, props[0]).replace(/\{\{2}}/g, props[1]).replace(/\{\{3}}/g, props[2]).replace(/\{\{4}}/g, props[3]).replace(/\{\{5}}/g, props[4]);

                        if (theTemplate.id != 6) { //with image
                            var waContainerStr = (
                                '<div class="form-check form-check-radio ms-4"><label class="form-check-label" for="tp-5"><input checked class="form-check-input" type="radio" name="tp" id="tp-' + theTemplate.id + '" value="' + theTemplate.id + '" props=' + props.length + '>Selected Template ID: ' + theTemplate.id + '</div><span class="circle"><span class="check"></span></span></label></div>'
                            )

                            for (let prop of props) {
                                // NO DEL: just prsent method different: waContainerStr += '<div><label>Prop ' + (i + 1) + ':&nbsp;&nbsp;&nbsp;</label><input id="tpl-content-' + i + '" type="text" value="' + tpPropsArr[i] + '" class="w-50" /></div>'
                                waContainerStr += '<input id="tpl-content-' + i + '" type="text" value="' + prop + '" class="d-none" />'
                            }

                            if (theTemplate.type == 'tp_qr') {
                                msg_content = msg_content.replaceAll('\\', '\\\\');
                                msg_content = msg_content.replaceAll('\\\\r', '\\r');
                                msg_content = msg_content.replaceAll('\\\\n', '\\n');
                                waContainerStr += SC.handleWATpQRMsg(msg_content).text;

                            } else if (theTemplate.type == 'tp_cta') {
                                msg_content = msg_content.replaceAll('\\', '\\\\');
                                msg_content = msg_content.replaceAll('\\\\r', '\\r');
                                msg_content = msg_content.replaceAll('\\\\n', '\\n');
                                //waContainerStr += handleWATpCTAMsg(msg_content).text;
                                waContainerStr += SC.handleWATpCTAMsg(msg_content).text;

                            }

                            $('#send-wa-section').empty().append(waContainerStr);


                        } else { //with no image
                            var waContainerStr = (
                                '<div class="form-check form-check-radio ms-4"><label class="form-check-label" for="tp-5"><input checked class="form-check-input" type="radio" name="tp" id="tp-' + tpid + '" value="' + data.tpid + '" props=' + props.length + '>Selected Template ID: ' + tpid + '</div><span class="circle"><span class="check"></span></span></label></div>');

                            for (var i = 0; i < props.length; i++) {
                                waContainerStr += '<input id="tpl-content-' + i + '" type="text" value="' + props[i] + '" class="d-none" />'
                            }
                            waContainerStr += ('<div class="ms-5">' + msg_content + '</div>');

                            $('#send-wa-section').empty().append(waContainerStr);
                        }



                    } //end show history=============================================

                    // Set Calendar
                    var dateToday = new Date(); // no past date can be selected
                    $('#m-calendar').datepicker({
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

                    // Set Copy Popover
                    $('.pop').popover();
                    $('.pop').on('shown.bs.popover', function () {
                        // Copy Variable
                        var copyText = $(this).parent().prev()[0];
                        var textArea = document.createElement("textarea");
                        textArea.value = copyText.textContent;
                        document.body.appendChild(textArea);
                        textArea.select();
                        textArea.setSelectionRange(0, 100)
                        document.execCommand("Copy");
                        textArea.remove();
                        // Hide Pop
                        var $pop = $(this);
                        setTimeout(function () {
                            $pop.popover('hide');
                        }, 1000);
                    });

                    $('#m-confirm-whatsapp-cbx').on('change', function () {
                        var isChecked = $(this).prop('checked');
                        if (isChecked) {
                            $('#m-whatsapp-confirm-btn').prop('disabled', false);
                        } else {
                            $('#m-whatsapp-confirm-btn').prop('disabled', true);
                        }
                    });

                    $('#select-tp-btn').on('click', function () {
                        var openWindows = parent.parent.openWindows;
                        var socialPopup = window.open('socialPopup.html?type=wa-template', 'marketingWA', '_blank, toolbar=0,location=0,top=50, left=100,menubar=0,resizable=0,scrollbars=1,width=1000,height=928');
                        openWindows[openWindows.length] = socialPopup;
                        socialPopup.onload = function () {
                            socialPopup.onbeforeunload = function () {
                                for (var i = 0; i < openWindows.length; i++) {
                                    if (openWindows[i] == socialPopup) {
                                        openWindows.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                        }
                    })

                    $('#m-selected-tbl').DataTable({
                        data: [data],
                        dom: "t",
                        "ordering": false,
                        columns: [{
                            title: langJson['l-campaign-batchname'],
                            data: "Batch_Name"
                        },
                        {
                            title: langJson['l-campaign-campaignname'],
                            data: "Form_Name"
                        }, {
                            title: langJson['l-campaign-channelname'],
                            data: "Type"
                        }, {
                            title: langJson['l-campaign-total'],
                            data: "Total_Leads"
                        }
                        ]
                    });

                    // Send Test Whatsapp
                    $('#m-send-test-whatsapp-btn').on('click', function () {
                        var testPhoneNo = $('#m-test-phone-no').val();
                        if (testPhoneNo.length == 0) {
                            alert(langJson['l-campaign-test-phone-blank']);
                            return;
                        }

                        sendTP();

                    });

                    //24/5/2021 whatsapp call api: updateOutBoundBatch ---------------------
                    $('#m-whatsapp-confirm-btn').on('click', function () {

                        //25/5 by raymond
                        let tpPropsArr = [];
                        let tpPropsNo = 0;

                        var tp0Val = ($('#tpl-content-0').val() || '').trim();
                        var tp1Val = ($('#tpl-content-1').val() || '').trim();
                        var tp2Val = ($('#tpl-content-2').val() || '').trim();
                        var tp3Val = ($('#tpl-content-3').val() || '').trim();
                        var tp4Val = ($('#tpl-content-4').val() || '').trim();
                        var tp5Val = ($('#tpl-content-5').val() || '').trim();
                        var tp6Val = ($('#tpl-content-6').val() || '').trim();

                        var allPropArr = [tp0Val, tp1Val, tp2Val, tp3Val, tp4Val, tp5Val, tp6Val];

                        for (let propArr of allPropArr) {
                            if (propArr.length > 0) {
                                tpPropsArr.push(propArr);
                            }
                        }
                        tpPropsNo = parseInt($('input[name=tp]').attr('props')); //no. of params

					 // var selectedTP = undefined;	// 20250326 (JavaScript) Variables should not be initialized to undefined
                        var selectedTP = $('input[name=tp]').val();
                        if (selectedTP == undefined) {
                            alert(langJson['l-campaign-template-blank']);
                            return;
                        }

                        var trimmedPropArr = [];

                        for (let prop of tpPropsArr) {
                            var trimmedProp = prop.trim();
                            if (trimmedProp.length > 0) {
                                trimmedPropArr.push(trimmedProp);
                            }
                        }
                        if (trimmedPropArr.length != tpPropsNo) {
                            alert('Template content props is not same length with the template props');
                            return;
                        }

                        //write to json string
                        var whatsappJsonStr = '{"agent_id":null, "TP_id":null, "company_code":"SM_WA", "props":[]}';
                        var jsonObj = JSON.parse(whatsappJsonStr);
                        jsonObj.agent_id = loginId;
                        jsonObj.TP_id = selectedTP;
                        for (let theTrimmedProp of trimmedPropArr) {
                            jsonObj.props.push(theTrimmedProp);
                        }
                        whatsappJsonStr = JSON.stringify(jsonObj);

                        var inputDate = $('#m-calendar').val();
                        if (inputDate.length == 0) {
                            alert(langJson['l-campaign-email-datetime-blank']);
                            return;
                        }
                        var inputHour = $('#m-hour').val();
                        var inputMinute = $('#m-min').val();
                        var theHour = inputHour.length != 2 ? '00' : inputHour;
                        var theMinute = inputMinute.length != 2 ? '00' : inputMinute;
                        var sendDateTime = inputDate + ' ' + theHour + ':' + theMinute;

                        var sendObj = {
                            Batch_Id: data.Batch_Id,
                            Agent_Id: loginId,
                            Whatsapp_Delivery_Time: sendDateTime,
                            Token: token,
                            Whatsapp_Tp_ID: selectedTP,
                            Whatsapp_Tp_Props: whatsappJsonStr
                        };

                        $.ajax({
                            type: "PUT",
                            url: config.companyUrl + '/api/UpdateOutboundBatch',
                            data: JSON.stringify(sendObj),
                            crossDomain: true,
                            contentType: "application/json",
                            dataType: 'json'
                        }).always(function (r) {
                            if (!/^success$/i.test(r.result || "")) {
                                console.log('error: ' + r.details);
                                alert(langJson['l-campaign-fail-update-outbound']);
                            } else {
                                switchContent('Manage', true);
                                alert(langJson['l-campaign-scheduled-send-whatsapp']);
                            }
                        }); //end send whatsapp ------------------------------------------

                    })







                });
            }
        }
    });
}

function countPattern(str) {
    var re = /[{]/g
    return (((str || '').match(re) || []).length) / 2
}

function drawCCustomerTbl() {
    cCustDeselectArr = [];
    var customerTblStr = '<table id="c-customer-tbl" class="table w-100"></table><div class="mt-3 d-table"><p class="d-table-row"><span class="d-table-cell l-campaign-match">Number of customer match the criteria at the moment:&nbsp;&nbsp;&nbsp;</span><span id="c-customer-total-no" class="d-table-cell"></span></p><p class="deselect-container d-none" style="display:table-row;"><span class="d-table-cell">Number of customer take away from the selection: </span><span id="c-customer-deselect-no" class="d-table-cell"></span></p><p class="deselect-container d-none" style="display:table-row"><span class="d-table-cell">Number of customer remaining in the selection: </span><span id="c-customer-remaining-no" class="d-table-cell" style="text-decoration: underline;font-weight:600"></span></p></div>';
    $('#c-customer-tbl-container').empty().append(customerTblStr);

    //7/7/2021 Set Language
    $('.l-campaign-match').text(langJson['l-campaign-match']);
    $('.l-campaign-match').append("&nbsp;&nbsp;&nbsp;");

    cCustomerAjaxData['Agent_Id'] = loginId;
    cCustomerAjaxData['Token'] = token;
    //console.log(cCustomerAjaxData);
    cCustomerTbl = $('#c-customer-tbl').DataTable({
        "serverSide": true,
        "ajax": {
            "url": config.companyUrl + '/api/SearchCustomerForOutbound',
            "type": "POST",
            "contentType": "application/json",
            "data": function (d, settings) {
                // only sorting 2 columns allowed
                if (d.order.length > 2) {
                    d.order = d.order.slice(0, 2); // change the order array that pass to API
                    settings.aaSorting = settings.aaSorting.slice(0, 2); // this is to avoid the 3rd shift clicked arrow change
                    alert(langJson['l-campaign-max-sort-col']);
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
            title: langJson['l-form-gender'],
            data: "Gender"
        }, {
            title: langJson['l-form-email'],
            data: "Email"
        }, {
            title: langJson['l-form-mobile'],
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
            cCustDeselectArr = cCustDeselectArr.filter(function (element) { return element != customerId });
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

function createOpenInputForm() {
    $('#o-search-results-container').addClass('d-none');
    $('#o-contact-status-container').addClass('d-none');
    $('#o-input-form').attr('src', '').attr('height', 0);
}

$(document).ready(function () {
    if (isAdmin) {
        $('#v-pills-tab').prepend(
            // '<li><a id="add-survey-tab" class="nav-link text-capitalize" data-bs-toggle="pill" href="#add-survey-content" role="tab" aria-controls="add-survey-content" aria-selected="false"><i class="fas fa-plus me-2"></i> <span class="align-middle">Survey</span> </a></li>' +
            '<li><a id="batch-tab" class="nav-link text-capitalize" data-bs-toggle="pill" href="#batch-content" role="tab" aria-controls="batch-content" aria-selected="false"><i class="fas fa-plus me-2"></i> <span class="align-middle l-campaign-batch">Batch</span> </a></li>' +
            '<li id="m-manage-content-tab"><a id="manage-tab" class="nav-link text-capitalize" data-bs-toggle="pill" href="#manage-content" role="tab" aria-controls="manage-content" aria-selected="false" style="width:max-content;"><i class="fas fa-tasks me-2"></i><span class="align-middle l-campaign-manage">Manage</span></a></li>'
        );
        $('.l-campaign-batch').text(langJson['l-campaign-batch']);
        $('.l-campaign-manage').text(langJson['l-campaign-manage']);

    }


    // Need to get input form list and campaign list first
    loadCampaignTbl();
    // Set nav bar button
    $("#v-pills-tab li a").click(function () {
        var selected = $(this).find('span').text();
        switchContent(selected);
        event.preventDefault();
    });
    $('#o-search-campaign-select').on('change', function () {
        var formId = $(this).val() || '';
        var batchOptions = $('#o-search-batch option');
        batchOptions.removeClass('d-none');
        if (formId.length == 0) {
            $('#o-search-batch').val('');
        } else {
            batchOptions.each(function () {
                var campaignForm = $(this).attr('form-id');
                if (campaignForm != formId && campaignForm != '') {
                    $(this).addClass('d-none');
                }
            });
        }
    });
    $('#o-search-batch').on('change', function () {
        var formId = $('option:selected', this).attr('form-id');
        if (formId.length == 0) {
            $('#o-search-campaign-select').val('').prop('disabled', false);

            // all batch can be shown
            $('#o-search-batch option').each(function () {
                $(this).removeClass('d-none');
            });
        } else {
            $('#o-search-campaign-select').val(formId).prop('disabled', true);
            $('#o-search-btn').click();
        }
    });
    // Select Channel checkbox clicked
    $('.channel-cbx').on('change', function () {
        var callChecked = $('#c-call-cbx').prop('checked');
        var emailChecked = $('#c-email-cbx').prop('checked');
        var smsChecked = $('#c-sms-cbx').prop('checked');
        var whatsappChecked = $('#c-whatsapp-cbx').prop('checked');
        var specialReqStr = "";
        if (callChecked || emailChecked || smsChecked || whatsappChecked) {
            specialReqStr += langJson['l-campaign-containing'] + ' ';
            var moreThanOne = false;
            if (callChecked) {
                specialReqStr += langJson['l-campaign-phone-no-small'];
                moreThanOne = true;
            }
            if (emailChecked) {
                if (moreThanOne) {
                    specialReqStr += ' ' + langJson['l-campaign-and'] + ' ';
                }
                specialReqStr += langJson['l-campaign-email-no-small'];
                moreThanOne = true;
            }
            if (smsChecked || whatsappChecked) {
                if (moreThanOne) {
                    specialReqStr += ' ' + langJson['l-campaign-and'] + ' ';
                }
                specialReqStr += langJson['l-campaign-mobile-phone-no-small'];
                //moreThanOne = true;		20250415 Remove this useless assignment to variable "moreThanOne".
            }
            // if (whatsappChecked) {
            //     if (moreThanOne) {
            //         specialReqStr += ' ' + langJson['l-campaign-and'] + ' ';
            //     }
            //     specialReqStr += 'whatsapp phone no.';
            // }
            $('#c-special-request').text(specialReqStr);
            $('#c-select-customer').removeClass('d-none');

        }
    });

    $("#c-create-campaign-btn").on('click', function () {
        var campaignName = $('#c-batch-name').val() || '';
        // verify is customerName empty
        if (campaignName.length == 0) {
            alert(langJson['l-campaign-campaign-name-blank']);
            return;
        }

        var recordToatl = $('#c-customer-total-no').html();
        var remianingRecord = recordToatl;
        if (cCustDeselectArr.length > 0) {
            cCustomerAjaxData['excludeArr'] = cCustDeselectArr;
            remianingRecord = (recordToatl - cCustDeselectArr.length);
        }
        // verify after deselection, total number is bigger than 0
        if (remianingRecord == 0) {
            alert(langJson['l-campaign-at-least-1-customer']);
            return;
        }
        var selectedInputForm = $('#c-campaign-tbl').find('tr.highlight');
        var slectedInputForm = cInputFormTbl.row(selectedInputForm).data();
        cCustomerAjaxData['Form_Id'] = slectedInputForm.Form_Id;
        cCustomerAjaxData['Batch_Details'] = "";
        cCustomerAjaxData['Batch_Name'] = campaignName;
        // Agent_Id and Token added to cCustomerAjaxData when search customer already
        $.ajax({
            type: "POST",
            url: config.companyUrl + '/api/CreateOutboundBatch',
            data: JSON.stringify(cCustomerAjaxData),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            var rDetails = r.details;
            if (!/^success$/i.test(r.result || "")) {
                alert('error: ' + rDetails);
            } else {
                $('#manage-tab').click();
            }
        });
    });

    $('#c-search-customer-btn').on('click', function () {

        var gender = $('#c-gender').val();
        var ageFrom = $('#c-age-from').val();
        var ageTo = $('#c-age-to').val();
        var rangeFrom = $('#c-range-from').val();
        var rangeTo = $('#c-range-to').val();

        // verfiy age from age to must appear altogether
        if (ageFrom.length > 0 && ageTo.length == 0) {
            alert(langJson['l-campaign-age-to-blank']);
            clearCreate(3);
            return;
        }
        if (ageTo.length > 0 && ageFrom.length == 0) {
            alert(langJson['l-campaign-age-from-blank']);
            clearCreate(3);
            return;
        }
        if (rangeFrom.length > 0 && rangeTo.length == 0) {
            alert('Range to field have to input a number,\nas Range from field already have input');
            clearCreate(3);
            return;
        }
        if (rangeTo.length > 0 && rangeFrom.length == 0) {
            alert('Range from field have to input a number,\nas Range to field already have input');
            clearCreate(3);
            return;
        }
        // verify at least one field selected
        if (gender.length == 0 && ageFrom.length == 0) {
            alert(langJson['l-campaign-search-criteria-blank']);
            clearCreate(3);
            return;
        }
        // Ajax Data
        cCustomerAjaxData = {};

        if (ageFrom.length > 0) {
            // verify is the age input a number
            if ((isNaN(ageFrom) || isNaN(ageTo))) {
                alert(langJson['l-campaign-age-invalid']);
                clearCreate(3);
                return;
            }
            try {
                ageFrom = parseInt(ageFrom);
                ageTo = parseInt(ageTo);
            } catch (e) {

                console.log('Error in search-customer-btn');	// 20250407 Exceptions should not be ignored
                console.log(e);   //  

                alert(langJson['l-campaign-age-invalid']);
                clearCreate(3);
                return;
            }
            // verify age to smaller than age from
            if (ageTo < ageFrom) {
                alert(langJson['l-campaign-age-to-smaller']);
                clearCreate(3);
                return;
            }
            cCustomerAjaxData['Age_From'] = ageFrom;
            cCustomerAjaxData['Age_To'] = ageTo;
        }

        if (rangeFrom.length > 0) {
            // verify is the range input a number
            if ((isNaN(rangeFrom) || isNaN(rangeTo))) {
                alert(langJson['l-campaign-age-invalid']);
                clearCreate(3);
                return;
            }
            if (rangeFrom == 0) {
                alert('Range from have to be grater than 0');
                clearCreate(3);
                return;
            }
            try {
                rangeFrom = parseInt(rangeFrom);
                rangeTo = parseInt(rangeTo);
            } catch (e) {

                console.log('Error in search-customer-btn');	// 20250407 Exceptions should not be ignored
                console.log(e);   //  

                alert(langJson['l-campaign-age-invalid']);
                clearCreate(3);
                return;
            }
            // verify range to smaller than range from
            if (rangeTo < rangeFrom) {
                alert('Range to number cannot smaller than Range from');
                clearCreate(3);
                return;
            }
            cCustomerAjaxData['Recordrange_From'] = rangeFrom;
            cCustomerAjaxData['Recordrange_To'] = rangeTo;
        }


        var checkedCall = $('#c-call-cbx').prop('checked') ? 'Y' : 'N';
        var checkedEmail = $('#c-email-cbx').prop('checked') ? 'Y' : 'N';
        var checkedSMS = $('#c-sms-cbx').prop('checked') ? 'Y' : 'N';
        var checkedWhatsapp = $('#c-whatsapp-cbx').prop('checked') ? 'Y' : 'N';


        cCustomerAjaxData['Channel_Call'] = checkedCall;
        cCustomerAjaxData['Channel_Email'] = checkedEmail;
        cCustomerAjaxData['Channel_SMS'] = checkedSMS;
        cCustomerAjaxData['Channel_Whatsapp'] = checkedWhatsapp;

        if (checkedCall == 'N' && checkedEmail == 'N' && checkedSMS == 'N' && checkedWhatsapp == 'N') {
            alert(langJson['l-campaign-select-channel-blank']);
            clearCreate(3);
            return;
        }

        if (gender.length > 0) {
            cCustomerAjaxData['Gender'] = gender;
        }

        drawCCustomerTbl();

        $(this).addClass('d-none');
        $('.c-customer-input').prop('disabled', true);

        $('#c-search-customer-again-btn').removeClass('d-none');

    });

    $('#c-search-customer-again-btn').on('click', function () {
        $(this).addClass('d-none');
        $('#c-search-customer-btn').removeClass('d-none');
        clearCreate(3);
        $('.c-customer-input').prop('disabled', false);
    });

    $('#o-search-btn').on('click', function (event) {
        event.preventDefault();
        // ================= Verify =================

        // batch ID cannot be null
        var batchId = $('#o-search-batch').val() || '';
        if (batchId.length == 0) {
            alert(langJson['l-campaign-batch-blank']);
            createOpenInputForm();
            return;
        }

        // Phone No. have to be more than 4 digits
        var phoneNo = $('#o-phone').val() || '';
        if (phoneNo.length > 0 && phoneNo.length < 4) {
            alert(langJson['l-campaign-enquiry-phone']);
            createOpenInputForm();
            return;
        }

        var ageFrom = $('#o-age-from').val();
        var ageTo = $('#o-age-to').val();

        // verfiy age from age to must appear altogether
        if (ageFrom.length > 0 && ageTo.length == 0) {
            alert(langJson['l-campaign-age-to-blank']);
            createOpenInputForm();
            return;
        }
        if (ageTo.length > 0 && ageFrom.length == 0) {
            alert(langJson['l-campaign-age-from-blank']);
            createOpenInputForm();
            return;
        }

        // verify age to smaller than age from
        if (Number(ageTo) < Number(ageFrom)) {
            alert(langJson['l-campaign-age-to-smaller']);
            createOpenInputForm();
            return;
        }

        // ================= // Verify =================
        if (customerTbl != null) {
            $('#o-search-results-tbl').DataTable().ajax.reload();
        } else {
            customerTbl = $('#o-search-results-tbl').DataTable({
                "serverSide": true,
				"ajax": {
                    "url": config.companyUrl + '/api/SearchOutboundCallList',
                    "type": "POST",
                    "contentType": "application/json",
                    "data": function (d, settings) {
						
						console.log(JSON.stringify(d.order));
						console.log(JSON.stringify(d));
					//	console.log(JSON.stringify(settings));
						var columnIndex = $(this).index(); 
						
						//20250513 for fix 3rd sorting
					
												
						if (d.order.length == 0)
						{
							console.log(d.order);
							d.order = customerTblOrder;
						}
						else{
							customerTblOrder = d.order;
						}
					
                        // only sorting 2 columns allowed
                        if (d.order.length > 2) {
                            d.order = d.order.slice(0, 2); // change the order array that pass to API
                            settings.aaSorting = settings.aaSorting.slice(0, 2); // this is to avoid the 3rd shift clicked arrow change
							console.log("modified" + JSON.stringify(d));
                            alert(langJson['l-campaign-max-sort-col']);
                        }
						
					//	console.log(JSON.stringify(d));
						
                        // Name have to be more than 3 characters
                        // If have Age From or Age To must have another one
                        // Need to know is that supervisor
                        var searchOutCallData = { Agent_Id: loginId, Token: token };
                        // Verify Age From and Age To if filled one, another one filled also
                        // Cannot get the value above, need to get again, as hard coded value here otherwise
                        searchOutCallData.Batch_Id = Number($('#o-search-batch').val());

                        var isPrivate = $("#o-search-customer-body input[name='agent-list']:checked").val() || '';
                        if (isPrivate == 'myself') {
                            searchOutCallData.To_Check_Id = loginId;
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

                        var ageFrom = $('#o-age-from').val();
                        var ageTo = $('#o-age-to').val();
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
                        console.log(json);
                        return json.details;
                    }
                },
                lengthChange: false,
                aaSorting: [
                    [8, "desc"], // priority shows callback time, then lead that has not call out
                    [5, "asc"]
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
                    // after form updated will refresh  
                    $(window).scrollTop($('#o-search-results-container').offset().top - 50);
                    setTimeout(function () { $(window).scrollTop($('#o-search-results-container').offset().top - 50); }, 500);
                    // NO DEL window.scrollTo(0,document.body.scrollHeight);
                    // $('#o-search-results-container').removeClass('d-none');
                },
                "drawCallback": function (settings) {
                    $('#o-search-results-container').removeClass('d-none');
                    $('#o-contact-status-container').addClass('d-none');
                    $('#o-input-form').attr('src', '').attr('height', 0);
                },
                columns: [{
                    title: "",
                    defaultContent: '<button class="btn btn-sm rounded btn-warning text-capitalize"><i class="fas fa-mouse-pointer me-2"></i><span>' + langJson['l-campaign-select'] + '</span></button>',
                    className: 'btnColumn',
                    orderable: false
                },
                {
                    title: langJson['l-search-full-name'],
                    data: "Name_Eng"
                },
                {
                    title: langJson['l-form-gender'],
                    data: "Gender"
                }, {
                    title: langJson['l-form-mobile'],
                    data: "Mobile_No"
                }, {
                    title: langJson['l-campaign-attempt'],
                    data: "Attempt"
                }, {
                    title: langJson['l-form-status'],
                    data: "Call_Status"
                }, {
                    title: langJson['l-campaign-reason'],
                    data: "Call_Reason"
                }, {
                    title: langJson['l-campaign-transaction-datetime'],
                    data: "Transaction_Time",
                    render: function (data, type, row) {
                        var theTime = data || '';
                        return theTime.replace('T', ' ').replace(/\.\d+/, "");
                    }
                }, {
                    title: langJson['l-campaign-callback-datetime'],
                    data: "Callback_Time",
                    render: function (data, type, row) {
                        if (data) {
                            //var theTime = (data || '').replace('T', ' ').replace(/\.\d+/, "");    //20250320 for This always evaluates to truthy. Consider refactoring this code.
                            var theTime = data.replace('T', ' ').replace(/\.\d+/, "");
                            if (new Date(theTime) < new Date()) {
                                return '<i class="fas fa-bell me-2 text-danger"></i>' + theTime.replace('T', ' ').replace(/\.\d+/, "");
                            } else {
                                return theTime.replace('T', ' ').replace(/\.\d+/, "");
                            }
                        } else {
                            return '';
                        }
                    }
                }
                ]
            });
            $('#o-search-results-tbl tbody').on('click', 'button', function (e) {
                customerTbl.$('tr.highlight').removeClass('highlight');  // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                $(this).parent().parent().addClass('highlight');
                var customerDataObj = customerTbl.row($(this).parents('tr')).data();
                window.customerData = customerDataObj; // TBD, customer data and case data should get again in form and after select log
                var callLeadId = customerDataObj.Call_Lead_Id;
                $.ajax({
                    type: "POST",
                    url: config.companyUrl + '/api/GetOutboundCallLog',
                    data: JSON.stringify({ Call_Lead_Id: callLeadId, Agent_Id: loginId, Token: token }),
                    crossDomain: true,
                    contentType: "application/json",
                    dataType: 'json'
                }).always(function (r) {
                    var callLogArr = (!/^success$/i.test(r.result || "")) ? [] : r.details;
                    if (loadedCSStatusTBl) {
                        var statusTbl = $('#o-contact-status-tbl');
                        statusTbl.DataTable().clear();
                        statusTbl.DataTable().rows.add(callLogArr); // Add new data
                        statusTbl.DataTable().columns.adjust().draw(); // Redraw the DataTable
                        // var iframeInputForm = $('#o-input-form');
                        // iframeInputForm.attr('src', './campaign/' + campaign + '/form_' + customerDataObj.Form_Id + '.html');
                        // NO DEL $(window).scrollTop($('#o-contact-status-container').offset().top - 40);
                    } else {
                        $('#o-contact-status-tbl').DataTable({
                            data: callLogArr,
                            lengthChange: false,
                            aaSorting: [
                                [7, "asc"]
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
                                $('#o-input-form').show();
                            },

                            // this function will run when table inited or every time table data refreshed
                            drawCallback: function (settings) {

                                // this function will remember the old customerDataObj, so need to get again
                                var theCustomerDataObj = customerTbl.row($('.highlight')).data();

                                // for Contact Status
                                $('#o-contact-status-container').removeClass('d-none');

                                // for Input Form
                                $('#o-input-form').attr('src', './campaign/' + campaign + '/form_' + theCustomerDataObj.Form_Id + '.html');
                            },
                            columns: [{
                                title: "",
                                data: "Attempt",
                                orderable: false
                            },
                            {
                                title: langJson['l-campaign-transaction-datetime'],
                                data: "Transaction_Time",
                                render: function (data, type, row) {
                                    var theTime = data || '';
                                    return theTime.replace('T', ' ').replace(/\.\d+/, "");
                                }
                            },
                            {
                                title: langJson['l-form-status'],
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
                        });

                        // NO DEL 
                        // setTimeout(function(){
                        //     $(window).scrollTop($('#o-contact-status-container').offset().top - 40)
                        // }, 900);
                        // /NO DEL
                    }
                });
            });
        }
    });
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
			$('.range-div').addClass('d-flex'); 	// fix class after upgrade
        } else {
            $('.range-div').addClass('d-none');
			$('.range-div').removeClass('d-flex'); 	// fix class after upgrade
            $('#c-range-from').val('');
            $('#c-range-to').val('');
        }
    });
    if (parent.parent.iframeRecheck) {
        parent.parent.iframeRecheck($(parent.document));
    }
});

var totalSendNo = 0;
var sendPhoneArr = [];
var waChecked = false;

function sendTP(event) {

    let tpPropsArr = [];
    let tpPropsNo = 0;
    if (config.isEmma) {
        var tp0Val = ($('#tpl-content-0').val() || '').trim();
        var tp1Val = ($('#tpl-content-1').val() || '').trim();
        var tp2Val = ($('#tpl-content-2').val() || '').trim();
        var tp3Val = ($('#tpl-content-3').val() || '').trim();
        var tp4Val = ($('#tpl-content-4').val() || '').trim();
        var tp5Val = ($('#tpl-content-5').val() || '').trim();
        var tp6Val = ($('#tpl-content-6').val() || '').trim();

        var allPropArr = [tp0Val, tp1Val, tp2Val, tp3Val, tp4Val, tp5Val, tp6Val];

        for (var i = 0; i < allPropArr.length; i++) {
            if (allPropArr[i].length > 0) {
                allPropArr[i] = allPropArr[i].replace(/{{FullName}}/g, 'Chan Tai Man').replace(/{{Title}}/g, 'Mr.')
                    .replace(/{{Email}}/g, 'abc@abcde.com').replace(/{{Mobile}}/g, 61234567)
                    .replace(/{{Home}}/g, 23456789).replace(/{{Work}}/g, 34567890);
                tpPropsArr.push(allPropArr[i]);
            }
        }
        tpPropsNo = parseInt($('input[name=tp]:checked').attr('props'));
    } else {
        // verify content not blank
        var TPContent = $('#tpl-content').val();
        if (TPContent.trim().length == 0) {
            alert(langJson['l-campaign-template-content-blank']);
            return;
        }
        tpPropsArr = TPContent.split(',');
        tpPropsNo = countPattern(theTemplate);
    }

    // verify has selected template		
    // var selectedTP = undefined;	// 20250326 (JavaScript) Variables should not be initialized to undefined
    var selectedTP = $('input[name=tp]:checked').val();
    if (selectedTP == undefined) {
        alert(langJson['l-campaign-template-blank']);
        return;
    }

    var trimmedPropArr = [];

    for (let prop of tpPropsArr) {
        var trimmedProp = prop.trim();
        if (trimmedProp.length > 0) {
            trimmedPropArr.push(trimmedProp);
        }
    }

    sendPhoneArr.push($('#m-test-phone-no').val());

    totalSendNo = sendPhoneArr.length;
    if (trimmedPropArr.length != tpPropsNo) {
        alert('Template content props is not same length with the template props');
        return;
    }

    confirmSendTp();
}

function confirmSendTp() {
    // var sentNo = totalSendNo - sendPhoneArr.length;
    // var sentPercentage = Math.floor(((totalSendNo - sendPhoneArr.length) / totalSendNo) * 100);
    // $('#send-percentage').text(sentPercentage);

    parent.parent.document.getElementById("phone-panel").contentWindow.wiseSendWhatsAppMsgEx(campaign, sendPhoneArr[0], selectedTP, tpPropsArr, function (replyObj) {
        // send failed
        if (replyObj.resultID == "1") { // success resultID will be "4"
            // alert(replyObj.msg + '\nSend failed');
            // $('#' + sendPhoneArr[0]).first().parent().parent().parent().empty().append('<i class="fas fa-times"></i>');
            // $('#error-log').append('<div><i class="fas fa-exclamation-triangle me-2"></i><span>Failed to send template to: ' + sendPhoneArr[0] + '</span></div>');

            console.log(replyObj.msg + '\nSend failed');        // 20250326 Remove this conditional structure or edit its code blocks so that they're not all the same.
        } else {
            // alert('success');
        }
    });

    $('#sent-test-whatsapp-lbl').fadeIn();
    setTimeout(function () { $('#sent-test-whatsapp-lbl').fadeOut() }, 2000);
    // Opacity becmoe 1 again
    $('#m-confirm-container').removeClass('opacity-low');
    // Piont Event Become Cursor Again
    $('#m-confirm-cbx').removeClass('form-check-label-disabled');
    // Cbx Can be Clicked Again
    $('#m-confirm-whatsapp-cbx').prop('disabled', false).removeClass('btn-cursor-default');
}

function windowOnload() {
    setLanguage();
}

function setLanguage() {
    $('.l-campaign-batch').text(langJson['l-campaign-batch']);
    $('.l-campaign-select-campaign').text(langJson['l-campaign-select-campaign']);
    $('.l-campaign-manage').text(langJson['l-campaign-manage']);
    $('.l-account-name').text(langJson['l-search-full-name']);
    $('.l-form-details').text(langJson['l-form-details']);
    $('.l-campaign-channel').text(langJson['l-campaign-channel']);
    $('.l-campaign-select-customer').text(langJson['l-campaign-select-customer']);
    $('.l-form-gender').text(langJson['l-form-gender']);
    $('.l-campaign-is').text(langJson['l-campaign-is']);
    $('.l-campaign-age').text(langJson['l-campaign-age']);
    $('.l-campaign-from').text(langJson['l-campaign-from']);
    $('.l-campaign-to').text(langJson['l-campaign-to']);
    $('.l-campaign-range').text(langJson['l-campaign-range']);
    $('.l-form-gender').text(langJson['l-form-gender']);
    $('.l-form-email').text(langJson['l-form-email']);
    $('.l-form-mobile').text(langJson['l-form-mobile']);
    $('.l-campaign-namebatch').text(langJson['l-campaign-namebatch']);
    $('.l-campaign-batchname').text(langJson['l-campaign-batchname']);
    $('.l-campaign-create').text(langJson['l-campaign-create']);
    $('.l-campaign-create').text(langJson['l-campaign-create']);
    $('.l-campaign-select-channel').text(langJson['l-campaign-select-channel']);
    $('.l-search-search').text(langJson['l-search-search']);
    $('.l-search-searchagain').text(langJson['l-search-searchagain']);
    $('.l-menu-search-customer').text(langJson['l-menu-search-customer']);
    $('.l-social-campaign').text(langJson['l-social-campaign']);
    $('.l-search-phone').text(langJson['l-search-phone']);
    $('.l-search-full-name').text(langJson['l-search-full-name']);
    $('.l-campaign-ageto').text(langJson['l-campaign-ageto']);
    $('.l-campaign-agefrom').text(langJson['l-campaign-agefrom']);
    $('.l-campaign-callstatus').text(langJson['l-campaign-callstatus']);
    $('.l-campaign-callback').text(langJson['l-campaign-callback']);
    $('.l-campaign-mycalllistonly').html('<input type="radio" name="agent-list" class="form-check-input" value="myself" checked>' + langJson['l-campaign-mycalllistonly'] + '<span class="circle"><span class="check"></span></span>');
    $('.l-campaign-allcustomers').html('<input type="radio" name="agent-list" class="form-check-input" value="all">' + langJson['l-campaign-allcustomers'] + '<span class="circle"><span class="check"></span></span>');
    $('.l-search-search').text(langJson['l-search-search']);
    $('.l-form-open').text(langJson['l-form-open']);
    $('.l-campaign-searchresult').text(langJson['l-campaign-searchresult']);
    $('.l-campaign-contact-status').text(langJson['l-campaign-contact-status']);
}