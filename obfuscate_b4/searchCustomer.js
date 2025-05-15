var campaign = parent.campaign;
var selectedCustomerId = -1;
var customerTable = null;
var loadFieldFnTry = 0
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var functions = parent.functions;
var canSendWA = (functions.indexOf('Search-Customer-WA') != -1) || false;
var waChecked = false;
var jqueryDataObj = {};
var sendPhoneArr = [];
var selectedTP;
var totalSendNo = 0;
var recordPerPage = 5;

var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';

function binClick(iThis) {
    $(iThis).parent().remove();
}

function resize() {
    var body = document.body,
        html = document.documentElement;
    var newHeight = Math.ceil(Math.max(body.scrollHeight, body.offsetHeight, html.offsetHeight, 500)) + 10; // header may added after resize, so add 10 first
    var menuLowerFrame = parent.document.getElementById('search');
    if (menuLowerFrame) {
        menuLowerFrame.height = newHeight;
    }
}

function setLanguage() {
    $('.l-menu-search-customer').text(langJson['l-menu-search-customer']);
    $('.l-search-create-case-new-customer').text(langJson['l-search-create-case-new-customer']);
    $('.l-search-match').text(langJson['l-search-match']);
    $('.l-search-all').text(langJson['l-search-all']);
    $('.l-search-any').text(langJson['l-search-any']);
    $('.l-search-of-the-following').text(langJson['l-search-of-the-following']);
    $('.l-search-search').text(langJson['l-search-search']);
}

function searchInputPressed(e, type) { //type: 'customer' or 'case'
    // if pressed enter
    if (e.keyCode == 13) {
        e.preventDefault();

        // if disabled should not submit again
        if (!$('#customer-submit-btn').prop('disabled')) {
            submitClicked(type);
        }
        return false;
    }
}

function isInteger(num) { //Number.isInteger only work on Chrome, not IE, so have this function
    return (num ^ 0) === num;
}

function addCustomerInfo(data) {
    //Get Photo
    window.customerData = data;
    var backStr = 'returnToNewCase()';
    // prevent user clicked customer table multiple time at once, show the user info when they are not exist only
    if ($('#input-form').length == 0) {
        $('#search-contact-body').prepend(
            '<button id="back-btn" class="float-end btn btn-circle btn-warning mt-1 mb-3" onclick=' + backStr + ' title="' + langJson["l-general-previous-page"] + '"><i class="fas fa-arrow-left"></i></button>' +
            '<iframe id="input-form" customer-only="true" customerId=' + data.Customer_Id + ' style="border:none" width="100%" src ="../campaign/' + campaign + '/inputForm.html" />');
    }
}

function newCCClick() {
    addCustomerCase(0, -1, '', '');
}

function addCustomerCase(connId, customerId, callType, details, rowData) {
    connId = parseInt(connId);
    if (isInteger(connId) === false) {
        connId = -1;
    }
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/AddCustomerCase',
        data: JSON.stringify({
            Conn_Id: connId,
            Customer_Id: customerId,
            Agent_Id: loginId,
            Call_Type: callType,
            Type_Details: details,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        var rDetails = r.details;
        if (!/^success$/i.test(r.result || "")) {
            console.log("error /n" + r ? r : '');
        } else {
            var internalCaseNo = rDetails.Internal_Case_No || -1;
            var newCustomerId = rDetails.Customer_Id || -1;
            parent.document.getElementById("input-form").setAttribute("customerId", newCustomerId);
            parent.document.getElementById("input-form").setAttribute("internalCaseNo", internalCaseNo);
            parent.document.getElementById("input-form").setAttribute("crn", -1);
            parent.document.getElementById("input-form").setAttribute("caseNo", -1);
            if (customerId == -1) {
                parent.type = 'newCustomer';
                parent.customerData = null;
            } else {
                parent.type = 'newCase';
                parent.customerData = rowData;
            }
            parent.openInputForm(connId, callType, internalCaseNo);
        }
    });
}

function format(d) {
    // `d` is the original data object for the row
    return '<span class="details-control-title">' + langJson['l-search-full-details'] + ':</span>' + d.Details;
}

function addCaseAutoSearchTable(data, oThis) {
    var addCaseContainer = function () {
        $('#search-contact-body').append(
            '<div id="search-case-div" class="margin-top">' +
            '<table id="search-case-table" class="display table table-hover" style="width:100%" data-page-length=' + recordPerPage + '>' +
            '</table>' +
            '</div>'
        );
        // Get table data ajax
        $.ajax({
            type: "POST",
            url: config.companyUrl + '/api/CaseManualSearch',
            data: JSON.stringify({
                "anyAll": "all",
                "Is_Valid": "Y",
                "searchArr": [{
                    "list_name": "Case List",
                    "field_name": "Customer_Id",
                    "logic_operator": "is",
                    "value": data.Customer_Id,
                    "field_type": "number"
                }],
                Agent_Id: loginId,
                Token: token
            }),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (res) {
            if (!/^success$/i.test(res.result || "")) {
                console.log("ERROR in CaseAutoSearch" + res.details);
                $(oThis).prop('disabled', false);
            } else {
                $('#search-customer-container').hide();
                // Create Table
                var caseDetails = res.details;
                var casetable = $('#search-case-table').DataTable({
                    data: caseDetails,
                    sDom: 'Btip', // to hide the search
                    buttons: [
                        // { // NO DEL clipboard too much data issue
                        //     extend: 'copy',
                        //     text: '',
                        //     tag: 'span',
                        //     titleAttr: 'Copy',
                        //     className: 'fas fa-copy cursor-pointer text-warning fa-2x ml-1',
                        //     exportOptions: {
                        //         columns: [1, 2, 3, 4, 5, 6, 7]
                        //     }
                        // }, 
                        {
                            extend: 'csv',
                            text: '',
                            tag: 'span',
                            titleAttr: 'CSV',
                            className: 'fas fa-file-csv cursor-pointer text-warning fa-2x ml-1',
                            filename: 'CSV-File',
                            charset: 'utf-8',
                            bom: true,
                            exportOptions: {
                                columns: [1, 2, 3, 4, 5, 6, 7]
                            }
                        }, {
                            extend: 'excel',
                            text: '',
                            tag: 'span',
                            titleAttr: 'Excel',
                            className: 'fas fa-table cursor-pointer text-warning fa-2x ml-1',
                            filename: 'Excel-File',
                            exportOptions: {
                                columns: [1, 2, 3, 4, 5, 6, 7]
                            }
                        },
                        // { // NO DEL pdf spend too much time to load, so no this function by default
                        //     extend: 'pdf',
                        //     text: '',
                        //     tag: 'span',
                        //     className: 'fas fa-file-pdf cursor-pointer text-warning fa-2x ml-1',
                        //     exportOptions: {
                        //         columns: [1, 2, 3, 4, 5, 6, 7]
                        //     }
                        // },
                        {
                            extend: 'print',
                            text: '',
                            tag: 'span',
                            titleAttr: 'Print',
                            className: 'fas fa-print cursor-pointer text-warning fa-2x ml-1',
                            exportOptions: {
                                columns: [1, 2, 3, 4, 5, 6, 7]
                            }
                        }
                    ],
                    lengthChange: false,
                    aaSorting: [
                        [2, "desc"]
                    ],
                    searching: false,
                    columnDefs: [{
                        targets: 0,
                        data: null,
                        defaultContent: '<i title="' + langJson['l-search-update-case'] + '" class="fas fa-edit table-btn select" data-bs-toggle="tooltip"></i>',
                        className: 'btnColumn',
                        orderable: false,
                    }, {
                        targets: 4,
                        render: function (data, type, row) {
                            if (data && data.length > 0) {
                                return data.replace('Inbound_', '');
                            } else {
                                return '<span class="ms-2">-</span> ';
                            }
                        }
                    }, {
                        targets: 6,
                        render: function (data, type, row) {
                            var escalatedTo = row.Escalated_To;
                            if (escalatedTo != null) {
                                var theAgentName = parent.parent.getAgentName ? parent.parent.getAgentName(escalatedTo) : parent.parent.parent.getAgentName(escalatedTo);
                                return 'Escalated to ' + '<span style="color:green">' + theAgentName + ' (' + escalatedTo + ')<span>'
                            } else {
                                return data
                            }
                        }
                    }, {
                        targets: 2,
                        render: function (data, type, row) {
                            var DateWithoutDot = data.slice(0, data.indexOf("."));
                            return DateWithoutDot.replace('T', ' ');
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
                    },
                    initComplete: function (settings, json) {
                        resize();
                        $(oThis).prop('disabled', false);
                    },
                    columns: [{
                        title: ""
                    },
                    {
                        title: langJson['l-search-case-no'],
                        data: "Case_No"
                    }, {
                        title: langJson['l-search-last-revision'],
                        data: "Case_Updated_Time"
                    }, {
                        title: langJson['l-search-full-name'],
                        data: "Name_Eng"
                    }, {
                        title: langJson['l-search-inbound-type'],
                        data: "Call_Type"
                    }, {
                        title: langJson['l-search-nature'],
                        data: "Call_Nature"
                    }, {
                        title: langJson['l-search-status'],
                        data: "Status"
                    },
                    // { title: langJson['l-search-revised-by'], data: "Case_Updated_By" },
                    {
                        title: langJson["l-form-details"],
                        data: "Details"
                    }, {
                        "className": 'details-control',
                        "orderable": false,
                        "data": null,
                        "defaultContent": ''
                    }
                    ]
                });

                // Add event listener for opening and closing details
                $('#search-case-table tbody').on('click', 'td.details-control', function () {
                    var tr = $(this).closest('tr');
                    var row = casetable.row(tr);

                    if (row.child.isShown()) {
                        // This row is already open - close it
                        row.child.hide();
                        tr.removeClass('shown');
                        resize();
                    } else {
                        // Open this row
                        row.child(format(row.data())).show();
                        tr.addClass('shown');
                        resize();
                    }
                });

                $('#search-case-table tbody').on('click', 'tr', function (e) {
                    casetable.$('tr.highlight').removeClass('highlight');  // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                    $(this).addClass('highlight')
                });

                $('#search-case-table').on('click', '.select', function () {
                    var data = casetable.row($(this).parents('tr')).data();
                    var connId = parent.window.frameElement.getAttribute("connId") || "";
                    var callType = parent.window.frameElement.getAttribute("callType") || "";
                    var details = parent.window.frameElement.getAttribute("details") || "";
                    UpdateCase(connId, callType, details, data);
                });
            }
        })
    }

    $('#manual-search-container').hide();
    //If already have a case table, destroy it (clicked multiple time on customer table)
    var caseContainer = $('#search-case-div');
    if (caseContainer.length > 0) {
        caseContainer.remove();
        addCustomerInfo(data);
        addCaseContainer();
    } else {
        addCustomerInfo(data);
        addCaseContainer();
    }
}

function returnToNewCase() {
    // remove back btn
    $('#back-btn').remove();
    // remove input form
    $('#input-form').remove();
    // remove case table
    $('#search-case-div').remove();
    // show back search container if have
    $('#manual-search-container').show();
    // show back customr table
    $('#search-customer-container').show();
    $('#send-wa-container').removeClass('d-none');
}

function loadAllCustomerData(action) {
    $('#invisible-tbl-container').empty().append('<table id="invisible-tbl" class="table"></table>');
    jqueryDataObj['Take_All'] = 'Y';

    var columns = [{
        title: langJson['l-search-title'],
        data: "Title"
    }, {
        title: langJson['l-search-full-name'],
        data: "Name_Eng"
    }, {
        title: langJson['l-search-mobile'],
        data: "Mobile_No"
    }, {
        title: langJson['l-search-fax'],
        data: "Fax_No"
    }, {
        title: langJson['l-search-other'],
        data: "Other_Phone_No"
    }]

    var columnDefs = [];

    jqueryDataObj['Agent_Id'] = loginId;
    jqueryDataObj['Token'] = token;

    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/ManualSearch',
        data: JSON.stringify(jqueryDataObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        if (!/^success$/i.test(res.result || "")) {
            console.log("error /n" + res ? res : '');
        } else {
            var customerDetails = res.details;
            $('#invisible-tbl').DataTable({ // send template will need get the table selected rows, so not define table here
                data: customerDetails,
                lengthChange: false,
                aaSorting: [], // no initial sorting
                // pageLength: recordPerPage,
                searching: true,
                sDom: 'Btip', // to hide the search
                buttons: [
                    {
                        extend: 'csv',
                        text: '',
                        tag: 'span',
                        titleAttr: 'CSV',
                        className: 'fas fa-file-csv cursor-pointer text-warning fa-2x ml-1',
                        filename: 'CSV-File',
                        charset: 'utf-8',
                        bom: true,
                        exportOptions: {
                            columns: [0, 1, 2, 3, 4]
                        }
                    }, {
                        extend: 'excel',
                        text: '',
                        tag: 'span',
                        titleAttr: 'Excel',
                        className: 'fas fa-table cursor-pointer text-warning fa-2x ml-1',
                        filename: 'Excel-File',
                        exportOptions: {
                            columns: [0, 1, 2, 3, 4]
                        }
                    },
                    {
                        extend: 'print',
                        text: '',
                        tag: 'span',
                        titleAttr: 'Print',
                        className: 'fas fa-print cursor-pointer text-warning fa-2x ml-1',
                        exportOptions: {
                            columns: [0, 1, 2, 3, 4]
                        }
                    }
                    // { // NO DEL clipboard too much data issue
                    //     extend: 'copy', 
                    //     text: '',
                    //     tag: 'span',
                    //     titleAttr: 'Copy',
                    //     className: 'fas fa-copy cursor-pointer text-warning fa-2x ml-1',
                    //     exportOptions: {
                    //         columns: [0, 1, 2, 3, 4]
                    //     }
                    // }, // /NO DEL
                    // { // NO DEL pdf spend too much time to load, so no this function by default
                    //     extend: 'pdf',
                    //     text: '',
                    //     tag: 'span',
                    //     titleAttr: 'PDF',
                    //     className: 'fas fa-file-pdf cursor-pointer text-warning fa-2x ml-1',
                    //     exportOptions: {
                    //         columns: [0, 1, 2, 3, 4]
                    //     }
                    // } // /NO DEL
                ],
                columnDefs: columnDefs,
                columns: columns,
                initComplete: function (settings, json) {
                    $('.buttons-' + action + '[aria-controls="invisible-tbl"]').click();
                }
            });
        }
    });
}

function submitClicked(type, clickedByPop) {
    $('#customer-submit-btn').prop('disabled', true);
    var allAny = $('.' + type + '-all-any option:selected')[0].value;
    var searchCondition = $('.' + type + '-search-condition option:selected');
    var searchSymbol = $('.' + type + '-search-symbol option:selected');
    var searchInput = $('.' + type + '-search-input');
    var searchArr = [];

    for (var i = 0; i < searchCondition.length; i++) {
        var condition = searchCondition[i] || '';
        var conditionTag = $(condition).attr('tag') || ''; //e.g. select
        var inputValue = '';
        var conditionValue = searchCondition[i].value || ''; // table column name
        var conditionType = $(searchCondition[i]).attr('type') || ''; // null, datetime

        // get the value
        if (conditionTag == 'select') {
            inputValue = $(condition).parent().siblings('.select-value')[0].value || '';
        } else {
            inputValue = (searchInput[i].value || '').trim();
            if (conditionType == 'number') {
                if (isNaN(inputValue)) {
                    alert('Please input a a valid number');
                    $('#customer-submit-btn').prop('disabled', false);
                    return;
                } else {

                    // Number('') will be 0
                    inputValue = inputValue.length == 0 ? '' : Number(inputValue);
                }
            }
        }
        // /get the value

        if (inputValue.length == 0) {
            continue;
        }

        if (conditionValue.length == 0) {
            alert(langJson['l-alert-no-condition-selected']);
            $('#customer-submit-btn').prop('disabled', false);
            return;
        }

        if (conditionValue == "All_Phone_No") {
            if (!/^\d+$/.test(inputValue)) {
                alert(langJson['l-alert-phone-not-digit']);
                $('#customer-submit-btn').prop('disabled', false);
                return;
            }
            if (inputValue.length < 4) {
                alert('All Phone Numbers must input at least 4 digits');
                $('#customer-submit-btn').prop('disabled', false);
                return;
            }
        }
        if (conditionValue == "Email") {
            if (inputValue.length < 4) {
                alert('Email must input at least 4 characters');
                $('#customer-submit-btn').prop('disabled', false);
                return;
            }
        }

        // if (conditionValue == "Name_Eng") { // NO DEL no need now only
        //     if (inputValue.length < 2) {
        //         alert('Full Name must input at least 2 characters');
        //         return;
        //     }
        // } // /NO DEL no need now only

        var tmpArr = {
            "field_name": conditionValue,
            "logic_operator": searchSymbol[i].value,
            "value": inputValue,
            "field_type": conditionType
        };
        if (type == 'case') {
            tmpArr.list_name = $(condition).attr('list') || '';
        }
        searchArr.push(tmpArr);
    }

    // no search criteria inputted
    if (searchArr.length == 0) {
        alert('Please input at least one search criteria');
        $('#customer-submit-btn').prop('disabled', false);
        return;
    }

    jqueryDataObj = {
        "anyAll": allAny,
        "searchArr": searchArr,
        "Is_Valid": "Y",
        Agent_Id: loginId,
        Token: token
    };

    // create result table
    var searchCustomerDiv = $('#search-customer-container');
    var addsearchCustomerDiv = function () {
        if (canSendWA) {
            $(
                '<div id="search-customer-container">' +
                '<table id="search-customer-table" class="display table table-hover" style="width:100%" data-page-length=' + recordPerPage + '>' +
                '</table>' +
                '</div>'
            ).insertBefore('#send-wa-container')
        } else {
            $('#search-contact-body').append(
                '<div id="search-customer-container">' +
                '<table id="search-customer-table" class="display table table-hover" style="width:100%" data-page-length=' + recordPerPage + '>' +
                '</table>' +
                '</div>'
            )
        }
        // Get Manual Search Result

        var columns = [{
            title: "",
            data: null
        }, {
            title: "",
            data: 'have_case'
        }, {
            title: ""
        }, {
            title: langJson['l-search-title'],
            data: "Title"
        }, {
            title: langJson['l-search-full-name'],
            data: "Name_Eng"
        }, {
            title: langJson['l-search-mobile'],
            data: "Mobile_No"
        }, {
            title: langJson['l-search-fax'],
            data: "Fax_No"
        }, {
            title: langJson['l-search-other'],
            data: "Other_Phone_No"
        }]
        var columnDefs = [{
            targets: 0,
            colVis: false,
            defaultContent: '<i title="' + langJson['l-search-create-case'] + '" class="fas fa-edit table-btn create" data-bs-toggle="tooltip"></i>',
            className: 'btnColumn',
            orderable: false,
        }, {
            targets: 1,
            orderable: false,
            render: function (data, type, row) {
                if (data) {
                    return '<i title="' + langJson['l-search-search-case-to-update'] + '" class="table-btn fas fa-search-plus search-case" data-bs-toggle="tooltip"></i>';
                } else {
                    return ''
                }
            },
            className: 'btnColumn'
        }, {
            targets: 2,
            orderable: false,
            render: function (data, type, row) {
                return '<i class="fas fa-user-edit open" title="' + langJson['l-search-edit-user'] + '" data-bs-toggle="tooltip"></i>';
            },
            className: 'btnColumn'
        }];
        if (canSendWA) {
            //var visible = waChecked === false ? false : true; // 20250320 Unnecessary use of boolean literals in conditional expression.
            var visible = waChecked !== false;
            columns.push({
                title: '<div class="form-check select-all-div" style="margin-top:-16px">' +
                    '<label class="form-check-label">' +
                    '<input id="select-all" class="form-check-input" type="checkbox">' +
                    '<span class="form-check-sign"><span class="check"></span></span></label></div>'
            })
            var defObj = {
                targets: -1,
                orderable: false,
                'searchable': false,
                render: function (data, type, row) {
                    var mobileNo = row.Mobile_No;
                    if (mobileNo && mobileNo.length > 0) {
                        return '<div class="form-check form-check-content" style="margin-top:-16px">' +
                            '<label class="form-check-label">' +
                            '<input class="form-check-input" type="checkbox" id="' + mobileNo + '" value="' + mobileNo + '">' +
                            '<span class="form-check-sign"><span class="check" data-bs-toggle="tooltip" data-bs-placement="right" title="Send template to the customer"></span></span></label></div>';
                    } else {
                        return '';
                    }
                },
                className: 'btnColumn'
            }
            if (!visible) {
                defObj.visible = false;
                defObj.className = 'btnColumn hidden'
            }
            columnDefs.push(defObj);
        }

        jqueryDataObj['Agent_Id'] = loginId;
        jqueryDataObj['Token'] = token;

        $.ajax({
            type: "POST",
            url: config.companyUrl + '/api/ManualSearch',
            data: JSON.stringify(jqueryDataObj),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (res) {
            if (!/^success$/i.test(res.result || "")) {
                console.log("error /n" + res ? res : '');
                $('#customer-submit-btn').prop('disabled', false);
            } else {
                var customerDetails = res.details;
                customerTable = $('#search-customer-table').DataTable({ // send template will need get the table selected rows, so not define table here
                    data: customerDetails,
                    lengthChange: false,
                    aaSorting: [], // no initial sorting
                    // pageLength: recordPerPage,
                    searching: true,
                    sDom: 'Btip', // to hide the search
                    buttons: [
                        {
                            text: '',
                            tag: 'span',
                            titleAttr: 'CSV',
                            charset: 'utf-8',
                            bom: true,
                            className: 'fas fa-file-csv cursor-pointer text-warning fa-2x ml-1',
                            action: function (e, dt, node, config) {
                                if (confirm('Full data are going to be loaded.\nThis could take a few minutes. Are you sure?')) {
                                    loadAllCustomerData('csv');
                                }
                            }
                        },
                        {
                            text: '',
                            tag: 'span',
                            titleAttr: 'Excel',
                            className: 'fas fa-table cursor-pointer text-warning fa-2x ml-1',
                            action: function (e, dt, node, config) {
                                if (confirm('Full data are going to be loaded, this could take a few minutes.\nAre you sure?')) {
                                    loadAllCustomerData('excel');
                                }
                            }
                        },
                        {
                            text: '',
                            tag: 'span',
                            titleAttr: 'Print',
                            className: 'fas fa-print cursor-pointer text-warning fa-2x ml-1',
                            action: function (e, dt, node, config) {
                                if (confirm('Full data are going to be loaded, this could take a few minutes.\nAre you sure?')) {
                                    loadAllCustomerData('print');
                                }
                            }
                        }
                    ],
                    columnDefs: columnDefs,
                    columns: columns,
                    "language": {
                        "emptyTable": langJson['l-general-empty-table'],
                        "info": langJson['l-general-info-100'],
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
                        resize();
                        $('#send-wa-container').removeClass('d-none');
                        $('#send-wa-section').empty();
                        $('#customer-submit-btn').prop('disabled', false);
                    }
                });

                $('#search-customer-table tbody').on('click', 'tr', function (e) {
                    customerTable.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                    $(this).addClass('highlight');
                });
                $('#search-customer-table tbody').on('click', '.create', function (e) {
                    e.preventDefault();
                    var connId = parent.window.frameElement.getAttribute("connId") || "";
                    var callType = parent.window.frameElement.getAttribute("callType") || "";
                    var details = parent.window.frameElement.getAttribute("details") || "";
                    var data = customerTable.row($(this).parents('tr')).data();
                    addCustomerCase(connId, data.Customer_Id, callType, details, data);
                });

                $('#search-customer-table tbody').on('click', '.search-case', function () {
                    $(this).prop('disabled', true);
                    var data = customerTable.row($(this).parents('tr')).data();
                    addCaseAutoSearchTable(data, this);
                    $('#send-wa-container').addClass('d-none');
                });
                $('#search-customer-table tbody').on('click', '.open', function () {
                    var data = customerTable.row($(this).parents('tr')).data();
                    selectedCustomerId = data.Customer_Id;
                    var openWindows = parent.parent.openWindows;
                    var csPopup = window.open('../campaign/' + campaign + '/csPopup.html?edit=true', '', 'toolbar=0,location=0,top=50, left=50,menubar=0,resizable=0,scrollbars=1,width=1050,height=584');
                    openWindows[openWindows.length] = csPopup;
                    csPopup.onload = function () {
                        csPopup.onbeforeunload = function () {
                            for (var i = 0; i < openWindows.length; i++) {
                                if (openWindows[i] == csPopup) {
                                    openWindows.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    }
                });
                if (canSendWA) {
                    var column = customerTable.column(8) || null;
                    if (column) {
                        column.visible(waChecked);
                    }
                    var mobileCount = customerTable.rows(function (idx, data, node) {
                        return data.Mobile_No && data.Mobile_No.length > 0;
                    }).count();
                    // Handle click on "Select all" control
                    $('#search-customer-table').on('change', '#select-all', function () {
                        // Get all rows with search applied
                        var rows = customerTable.rows({
                            'search': 'applied'
                        }).nodes();
                        // Check/uncheck checkboxes for all rows in the table
                        $('input[type="checkbox"]', rows).prop('checked', this.checked);
                    });
                    $('#search-customer-table').on('click', '.form-check-content', function (e) {
                        e.stopPropagation();
                        var rows = customerTable.rows({
                            'search': 'applied'
                        }).nodes();
                        var selectedRows = $('input[type="checkbox"]:checked', rows);
                        if (selectedRows.length == mobileCount) {
                            $('#select-all').prop('checked', true);
                        } else {
                            $('#select-all').prop('checked', false);
                        }
                    });
                }
            }
        });
    }
    if (searchCustomerDiv.length > 0) {
        if (!clickedByPop && customerTable) {
            customerTable.state.clear();
        }
        searchCustomerDiv.remove();
        addsearchCustomerDiv();
    } else {
        addsearchCustomerDiv();
    }
    $('#send-wa-container').removeClass('d-none');
}

function UpdateCase(connId, callType, details, rowData) {
    var internalCaseNo = rowData.Internal_Case_No || -1;
    parent.document.getElementById("input-form").setAttribute("customerId", rowData.Customer_Id || -1);
    parent.document.getElementById("input-form").setAttribute("internalCaseNo", internalCaseNo);
    parent.document.getElementById("input-form").setAttribute("caseNo", rowData.Case_No || -1);
    parent.document.getElementById("input-form").setAttribute("crn", rowData.CRN || -1);
    if (rowData != null) {
        parent.customerData = rowData;
    }
    parent.type = 'newUpdate';
    parent.openInputForm(connId, callType, internalCaseNo);
}

function addSearchField(type) {
    var itm = document.querySelector("." + type + "-search-item");
    var cln = itm.cloneNode(true);
    // remove comobo if there is one
    $(cln).find(".select-value").remove();
    // set default symobol shown
    $(cln).find('.text-symbol').show();
    $(cln).find('.date-symbol').hide();
    // set deafault text field and remove datepicker if availalbe and add rubblish bin
    $(cln).find("input").remove();
    if (type == 'customer') {
        var keyPressString = "searchInputPressed(event,'customer')"
        $('<input class="customer-search-input form-control" type="search" onkeypress=' + keyPressString + '>').appendTo($(cln));
    } else {
        $('<input class="case-search-input form-control" type="search">').appendTo($(cln));
    }
    var datepicker = $(cln).find('.ui-datepicker-trigger');
    if (datepicker) {
        $(datepicker).remove();
    }
    $("<image class='rubbish-bin' src='../images/bin.png' onclick='binClick(this);'></image>").appendTo($(cln))
    // Append the cloned item element to <ul> with id="advance-search-list"
    document.getElementById(type + "-search-list").appendChild(cln);
    resize();
}

function selectChange(type, iThis) {
    var selected = $(iThis).find('option:selected'); // the selected option tag
    var selectedType = selected.attr("type");
    var selectedTag = selected.attr("tag");

    // change the input to otion if necessary
    var selectedInput = $(iThis).parent().find('.' + type + '-search-input');
    if (selectedTag == 'select') {
        if (selectedInput.siblings('.select-value').length > 0) {
            selectedInput.siblings('.select-value').remove();
        }
        var selectedOptions = JSON.parse(selected.attr('fieldOptions'));
        selectedInput.removeAttr("style").hide();
        var optionStr = '';
        for (let theOption of selectedOptions) {
            optionStr += '<option value="' + theOption + '">' + theOption.replace('_', ' ') + '</option>'
        }
        $("<select class='select-value form-select'>" + optionStr + "</select>").insertAfter(selectedInput);
    } else {
        selectedInput.show();
        selectedInput.siblings('.select-value').remove();
    }
    // if type is DATE TIME
    var symbolField = $(iThis).parent().find('.' + type + '-search-symbol');
    if (selectedType == 'datetime') {
        // sybmol chocie change to > < , etc.
        symbolField.val('=');
        symbolField.find('.date-symbol').show();
        symbolField.find('.text-symbol').removeAttr("style").hide();
        // add date picker
        if (!selectedInput.hasClass('hasDatepicker')) {
            selectedInput.attr("placeholder", "yyyy-mm-dd");
            selectedInput.attr("pattern", "[0-9]{4}-[0-9]{2}-[0-9]{2}");
            selectedInput.datepicker({
                showOn: "button",
                buttonImage: "../images/calendar-grid-30.svg",
                buttonStyle: 'height:1000px',
                buttonImageOnly: true,
                buttonText: "Select date",
                dateFormat: 'yy-mm-dd',
                changeMonth: true,
                changeYear: true
            });
        }
    } else {
        // sybmol chocie change to text
        symbolField.find('.date-symbol').removeAttr("style").hide();
        if (selectedTag == 'select' || selectedTag == 'is') {
            symbolField.find('.select-symbol').removeAttr("style").show();
            symbolField.find('.field-symbol').removeAttr("style").hide();
            symbolField.val('is');
        } else if (selectedTag == 'is-contains') {
            symbolField.find('.field-symbol').removeAttr("style").hide();
            symbolField.find('.is-contains-symbol').removeAttr("style").show();
            symbolField.val('contains');
        } else {
            symbolField.find('.text-symbol').removeAttr("style").show();
            symbolField.val('contains');
        }
        // remove date picker
        if (selectedInput.hasClass('hasDatepicker')) {
            selectedInput.removeAttr("placeholder");
            selectedInput.removeAttr("pattern");
            selectedInput.datepicker("destroy");
            selectedInput.removeClass("hasDatepicker").removeAttr('id');
        }
    }

}

function buildDefaultFields() {
    var defaultFields = config.customerDefaultSearch || [];

    for (var i = 0; i < defaultFields.length; i++) {
        var theField = defaultFields[i];

        // there is a default field already there
        if (i != 0) {
            $('#add-fields-btn').click();
        }
        var theConditionField = $('.customer-search-condition').eq(i);
        theConditionField.val(theField);
        selectChange('customer', theConditionField);
    }
}

function loadFields() {
    var contactTable = parent.contactTable || [];
    var contactCombined = parent.contactCombined || [];
    var contactSystem = parent.contactSystem || [];
    // if no field loaded yet, try 3 times (3 seconds)
    // For Case Mode Contact System will not need
    if (loadFieldFnTry < 4 && contactTable.length == 0) {
        setInterval(loadFields, 1000);
        loadFieldFnTry += 1;
        return;
    } else {
        $('#lower-part-container').removeClass('d-none');
    }
    // ==================== Condition Drop Down: Customer List insert  ====================
    for (let option of contactTable) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".customer-search-condition").append('<option style="color:blue" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    for (let option of contactCombined) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".customer-search-condition").append('<option style="color:green" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    for (let option of contactSystem) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".customer-search-condition").append('<option style="color:purple" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    $(".customer-search-condition").attr('onchange', 'selectChange("customer", this);');
}

function countPattern(str) {
    var re = /[{]/g
    return (((str || '').match(re) || []).length) / 2
}

function sendTP() {
    var tpPropsArr = [];    // 20250411 Add the "let", "const" or "var" keyword to this declaration of "tpPropsArr" to make it explicit.
    var tpPropsNo = 0;
    var tp0Val = ($('#tpl-content-0').val() || '').trim();
    var tp1Val = ($('#tpl-content-1').val() || '').trim();
    var tp2Val = ($('#tpl-content-2').val() || '').trim();
    var tp3Val = ($('#tpl-content-3').val() || '').trim();
    var tp4Val = ($('#tpl-content-4').val() || '').trim();
    var tp5Val = ($('#tpl-content-5').val() || '').trim();
    var tp6Val = ($('#tpl-content-6').val() || '').trim();

    var allPropArr = [tp0Val, tp1Val, tp2Val, tp3Val, tp4Val, tp5Val, tp6Val];

    for (let prop of allPropArr) {
        if (prop.length > 0) {
            tpPropsArr.push(prop);
        }
    }
    tpPropsNo = parseInt($('input[name=tp]:checked').attr('props'));

    // verify has selected template
    selectedTP = $('input[name=tp]:checked').val();
    if (selectedTP == undefined) {
        alert('Please select at least one template');
        return;
    }
    // verify customer selected
    var rows = customerTable.rows({
        'search': 'applied'
    }).nodes();
    var selectedCheckbox = $('input[type="checkbox"]:checked', rows);
    if (selectedCheckbox.length == 0) {
        alert('Please select at least 1 customer')
        return;
    } else if (selectedCheckbox.length > 1) {
        alert('For demo, only can send 1 whatsapp template per time');
        return;
    }
    var trimmedPropArr = [];

    for (let prop of tpPropsArr) {
        var trimmedProp = prop.trim();
        if (trimmedProp.length > 0) {
            trimmedPropArr.push(trimmedProp);
        }
    }
    for (let selected of selectedCheckbox) {
        sendPhoneArr.push($(selected).val());
    }
    totalSendNo = sendPhoneArr.length;
    if (trimmedPropArr.length != tpPropsNo) {
        alert('Template content props is not same length with the template props');
        return;
    }
    var loadingStr = '<span><div id="circularG"><div id="circularG_1" class="circularG"></div><div id="circularG_2" class="circularG"></div><div id="circularG_3" class="circularG"></div>' +
        '<div id="circularG_4" class="circularG"></div><div id="circularG_5" class="circularG"></div><div id="circularG_6" class="circularG"></div><div id="circularG_7" class="circularG"></div><div id="circularG_8" class="circularG"></div></div><span>';
    $('#send-wa-section').empty().append('<div id="send-status">' + loadingStr + '&nbsp;&nbsp;Sending, please stay on this page... <span id="send-percentage"></span> %</span></div><div id="error-log"></div>');
    confirmSendTp();
}

function confirmSendTp() {
    var sentPercentage = Math.floor(((totalSendNo - sendPhoneArr.length) / totalSendNo) * 100);
    $('#send-percentage').text(sentPercentage);
    parent.parent.document.getElementById("phone-panel").contentWindow.wiseSendWhatsAppMsgEx(campaign, sendPhoneArr[0], selectedTP, tpPropsArr, function (replyObj) {
        
        // send failed, success resultID will be "4"
        if (replyObj.resultID == "1") {
            $('#' + sendPhoneArr[0]).first().parent().parent().parent().empty().append('<i class="fas fa-times"></i>');
            $('#error-log').append('<div><i class="fas fa-exclamation-triangle me-2"></i><span>Failed to send template to: ' + sendPhoneArr[0] + '</span></div>');
        } else {
            $('#' + sendPhoneArr[0]).first().parent().parent().parent().empty().append('<i class="fas fa-check"></i>');
        }

        // remove the first item of an array
        sendPhoneArr.shift();
        if (sendPhoneArr.length == 0) {
            $('#send-status').empty().append('<div><i class="fas fa-check me-2"></i><span>Complete sent out template to all customers!</span></div>');
            waChecked = false;
        } else {
            confirmSendTp();
        }
    });
}

// deprecated on 2022-3-16 tbd: twilio whatsapp templates
// function showWAClicked(oThis) {
//     waChecked = $(oThis).prop('checked')
//     var column = customerTable.column(8) || null;
//     if (waChecked) {
//         // TO DO: get templates
//         if ($('#send-wa-section').length > 0) {
//             $('#send-wa-section').show();
//         } else {
//             var templateSectionStr = '<div id="send-wa-section" class="mt-2">' +
//                 '<label class="form-label mb-0"><span>Template Prop(s):</span><input id="tpl-content" class="rounded ms-3 me-2" autocomplete="off">4 July,8pm</label>' +
//                 '<div class="form-check form-check-radio"><label class="form-check-label" for="tp-1"><input class="form-check-input" type="radio" name="tp" id="tp-1" value="1">Your appointment is coming up on {{1}} at {{2}}<span class="circle"><span class="check"></span></span></label></div>' +
//                 '<div class="form-check form-check-radio"><label class="form-check-label" for="tp-2"><input class="form-check-input" type="radio" name="tp" id="tp-2" value="2">易寶通訊提醒你, 預約日期是{{1}}{{2}}。<span class="circle"><span class="check"></span></span></label></div>' +
//                 '<div class="form-check form-check-radio"><label class="form-check-label" for="tp-3"><input class="form-check-input" type="radio" name="tp" id="tp-3" value="3">Epro Notice: Thank you for your application, the application no is {{1}}.<span class="circle"><span class="check"></span></span></label></div>' +
//                 '<div class="form-check form-check-radio"><label class="form-check-label" for="tp-4"><input class="form-check-input" type="radio" name="tp" id="tp-4" value="4">易寶：謝謝你的申請, 你的申編號是 {{1}}.<span class="circle"><span class="check"></span></span></label></div>' +
//                 '<div class="mb-3 text-center"><a class="btn rounded btn-sm btn-warning mt-3 mb-0 text-capitalize" data-bs-toggle="confirmation" data-bs-placement="bottom" data-popout="true" data-btn-ok-class="btn-info" href="javascript:(sendTP())" data-original-title="" title=""><i class="fas fa-paper-plane me-2"></i><span class="align-middle">Send</span></a></div>' +
//                 '</div>';
//             $('#send-wa-container').append(templateSectionStr)
//         }
//         if (column) {
//             column.visible(true);
//         }
//     } else {
//         $('#send-wa-section').hide();
//         if (column) {
//             column.visible(false);
//         }
//     }
//     resize();
// }
// /deprecated on 2022-3-16 tbd: twilio whatsapp templates

function windowOnload() {
    recordPerPage = sessionStorage.getItem('scrmCaseLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5;
    loadFields();
    buildDefaultFields();
    setLanguage();
    if (canSendWA) {

        $('#search-contact-body').append(
            '<div id="send-wa-container" class="d-none">' +
            '<button id="select-tp-btn" class="btn btn-sm btn-warning text-capitalize rounded">' + langJson['l-campaign-select-template'] + '</button>' +
            '<div id="send-wa-section" class="mt-2"></div></div>'
        );
        $('#select-tp-btn').on('click', function () {
            var openWindows = parent.parent.openWindows;
            var socialPopup = window.open('../socialPopup.html?type=wa-template', 'custSendWA', '_blank, toolbar=0,location=0,top=50, left=100,menubar=0,resizable=0,scrollbars=1,width=1000,height=928');
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
    }
    resize();
    $.getScript("../js/buttons.flash.min.js");
    $.getScript("../js/jszip.min.js");
    // NO DEL $.getScript("../js/vfs_fonts.js"); // pdf spent too much time so no this function  by default
    $.getScript("../js/buttons.html5.min.js");
    $.getScript("../js/buttons.print.min.js");
    $.getScript("../js/popper.min.js");
    $.getScript("../js/bootstrap.min.js");
    //$.getScript("../js/jquery-ui.min.js");
	
	  // Create a script element
	  var script = document.createElement('script');
	  // Set the src attribute to the CDN URL
	  script.src = 'https://cdn.jsdelivr.net/npm/jquery-ui@1.14.1/dist/jquery-ui.min.js';
	  // Optionally, set the async or defer attribute
	  script.async = true; // Loads the script asynchronously
	  // Append the script to the <head> or <body> element
	  document.head.appendChild(script);
  
}
$(document).ready(function () {
    if (parent.parent.iframeRecheck) {
        parent.parent.iframeRecheck($(parent.document));
    }
});
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());