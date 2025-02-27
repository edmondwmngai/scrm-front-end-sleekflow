var campaign = parent.campaign;
var selectedContact = {};
var selectedCase = -1; // call from changeContact.html
var loadFieldFnTry = 0;
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var caseMode = parent.caseMode; // must be true or false
var recordPerPage = 5;
var changeContactCaseNo = -1; // needed and called from changeContactPop.html
var changeContactCustomerId; // needed and called from changeContactPop.html

function binClick(iThis) {
    $(iThis).parent().remove();
}

var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';

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
    $('.l-menu-search-case').text(langJson['l-menu-search-case']);
    if (caseMode) {
        $('.l-search-create-case-new-customer').text(langJson['l-search-create-case']);
    } else {
        $('.l-search-create-case-new-customer').text(langJson['l-search-create-case-new-customer']);
    }
    $('.l-search-match').text(langJson['l-search-match']);
    $('.l-search-all').text(langJson['l-search-all']);
    $('.l-search-any').text(langJson['l-search-any']);
    $('.l-search-of-the-following').text(langJson['l-search-of-the-following']);
    $('.l-search-search').text(langJson['l-search-search']);
}

function addCustomerCase(connId, customerId, callType, details, rowData) {
    connId = parseInt(connId);
    if (isInteger(connId) === false) {
        connId = -1;
    }
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/AddCustomerCase',
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
            parent.document.getElementById("input-form").setAttribute("caseNo", -1);
            if (customerId == -1) {
                parent.customerData = {
                    'Customer_Id': newCustomerId
                };
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

function newCCClick() {
    addCustomerCase(0, -1, '', '');
}

function searchInputPressed(e, type) { //type: 'customer' or 'case'

    // if pressed enter
    if (e.keyCode == 13) {
        e.preventDefault();

        // if disabled should not submit again
        if (!$('#case-submit-btn').prop('disabled')) {
            submitClicked(type);
        }       
        return false;
    }
}

function isInteger(num) { //Number.isInteger only work on Chrome, not IE, so have this function
    return (num ^ 0) === num;
}

function format(d) {
    // `d` is the original data object for the row
    return '<span class="details-control-title">' + langJson['l-search-full-details'] + ':</span>' + d.Details;
}

function submitClicked(type) {
    $('#case-submit-btn').prop('disabled', true);
    var connId = parent.window.frameElement.getAttribute("connId") || "";
    var callType = parent.window.frameElement.getAttribute("callType") || "";
    var details = parent.window.frameElement.getAttribute("details") || "";
    var allAny = $('.' + type + '-all-any option:selected')[0].value;
    var searchCondition = $('.' + type + '-search-condition option:selected');
    var searchSymbol = $('.' + type + '-search-symbol option:selected');
    var searchInput = $('.' + type + '-search-input');
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
                    $('#case-submit-btn').prop('disabled', false);
                    return;
                } else {

                    // Number('') will be 0
                    inputValue = inputValue.length == 0? '': Number(inputValue);
                }
            }
        }
        // /get the value

        if (inputValue.length == 0) {
            continue;
        }

        if (conditionValue.length == 0) {
            alert(langJson['l-alert-no-condition-selected']);
            $('#case-submit-btn').prop('disabled', false);
            return;
        }

        if (conditionValue == "All_Phone_No") {
            if (!/^\d+$/.test(inputValue)) {
                alert(langJson['l-alert-phone-not-digit']);
                $('#case-submit-btn').prop('disabled', false);
                return;
            }
            if (inputValue.length < 4) {
                alert('All Phone Numbers must input at least 4 digits');
                $('#case-submit-btn').prop('disabled', false);
                return;
            }
        }
        if (conditionValue == "Email") {
            if (inputValue.length < 4) {
                alert('Email must input at least 4 characters');
                $('#case-submit-btn').prop('disabled', false);
                return;
            }
        }
        if (conditionValue == "Name_Eng") {
            if (inputValue.length < 2) {
                alert('Full Name must input at least 2 characters');
                $('#case-submit-btn').prop('disabled', false);
                return;
            }
        }
        if (conditionValue == "Details") {
            if (inputValue.length < 2) {
                alert('Details must input at least 2 characters');
                $('#case-submit-btn').prop('disabled', false);
                return;
            }
        }
        if (conditionValue == "Reply_Details") {
            if (inputValue.length < 4) {
                alert('Outbound Details must input at least 4 characters');
                $('#case-submit-btn').prop('disabled', false);
                return;
            }
        }
        if (conditionValue == "Type_Details") {
            if (inputValue.length < 4) {
                alert('Inbound Details must input at least 4 characters');
                $('#case-submit-btn').prop('disabled', false);
                return;
            }
        }
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

    if (searchArr.length == 0) {
        alert('Please input at least one search criteria');
        $('#case-submit-btn').prop('disabled', false);
        return;
    }

    var submitData = {
        "anyAll": allAny,
        "searchArr": searchArr,
        "Is_Valid": "Y",
        Agent_Id: loginId,
        Token: token
    };

    // create result table

    var searchCaseDiv = $('#search-case-container');
    var addsearchCaseDiv = function () {
        $('#search-case-body').append(
            '<div id="search-case-container">' +
            '<table id="search-case-table" class="table table-hover display" style="width:100%" data-page-length=' + recordPerPage + '>' +
            '</table>' +
            '</div>'
        );

        var haveSuperFn = parent.functions.indexOf('Search-Case-Fn') != -1;
        var canChangeCustomer = !caseMode && haveSuperFn; // case mode = false and have super function to have a extra column change contact
        var dateColIdx = canChangeCustomer ? 3 : 2;
        var inboundTypeIdx = canChangeCustomer ? 5 : 4;
        var columns = [{
            title: ""
        }, {
            title: langJson["l-search-case-no"],
            data: "Case_No"
        }, {
            title: langJson["l-search-last-revision"],
            data: "Case_Updated_Time"
        }, {
            title: langJson["l-search-full-name"],
            data: "Name_Eng"
        }, {
            title: langJson["l-search-inbound-type"],
            data: "Call_Type"
        }, {
            title: langJson["l-search-nature"],
            data: "Call_Nature"
        }, {
            title: langJson["l-search-status"],
            data: "Status"
        },
        {
            title: langJson["l-form-details"],
            data: "Details"
        }, {
            "className": 'details-control',
            "orderable": false,
            "data": null,
            "defaultContent": ''
        }
        ];

        var columnDefs = [{
            targets: 0,
            data: null,
            defaultContent: '<i data-bs-toggle="tooltip" title="' + langJson['l-search-update-case'] + '" class="fas fa-edit table-btn select" data-bs-toggle="tooltip"></i>',
            className: 'btnColumn',
            orderable: false,
        }, {
            targets: dateColIdx,
            render: function (data, type, row) {
                var DateWithoutDot = data.slice(0, data.indexOf("."));
                return DateWithoutDot.replace('T', ' ');
            }
        }, {
            targets: inboundTypeIdx,
            render: function (data, type, row) {
                if (data && data.length > 0) {
                    return data.replace('Inbound_', '');
                } else {
                    return '<span class="ms-2">-</span> ';
                }
            }
        }, {
            targets: -3,
            render: function (data, type, row) {
                var escalatedTo = row.Escalated_To;
                if (row.Escalated_To != null) {
                    return 'Escalated to ' + '<span style="color:green">' + parent.parent.parent.getAgentName(escalatedTo) + ' (' + escalatedTo + ')<span>'
                } else {
                    return data
                }
            }
        }];
        var aaSorting = [
            [2, 'desc']
        ];
        var exportColumns = [1, 2, 3, 4, 5, 6, 7];
        // if the user's role have authority to change the contact of the case
        if (canChangeCustomer) {
            aaSorting = [
                [3, 'desc']
            ];
            exportColumns = [2, 3, 4, 5, 6, 7, 8];
            columns.unshift({
                title: ""
            });
            columnDefs.push({
                targets: 1,
                orderable: false,
                render: function (data, type, row) {
                    var recordCallType = row.Call_Type;
                    if (recordCallType == 'Inbound_Wechat' || recordCallType == 'Inbound_Facebook') {
                        return '<i data-bs-toggle="tooltip" data-bs-placement="top" title="' + langJson['l-search-change-customer-for-this-case'] + '" class="table-btn-disabled fas fa-exchange-alt">'
                    } else {
                        return '<i data-bs-toggle="tooltip" data-bs-placement="top" title="' + langJson['l-search-change-customer-for-this-case'] + '" class="table-btn fas fa-exchange-alt change">'
                    }
                }
            });
        }
        // /if the user's role have authority to change the contact of the case
        // Get Manual Search Result
        $.ajax({
            type: "POST",
            url: mvcHost + '/mvc' + campaign + '/api/CaseManualSearch',
            data: JSON.stringify(submitData),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log("error /n" + r ? r : '');
                $('#case-submit-btn').prop('disabled', false);
            } else {
                var caseTable = $('#search-case-table').DataTable({
                    data: r.details,
                    dom: 'Btip',
                    buttons: [
                        // { // NO DEL clipboard too much data issue
                        //     extend: 'copy',
                        //     text: '',
                        //     tag: 'span',
                        //     titleAttr: 'Copy',
                        //     className: 'fas fa-copy cursor-pointer text-warning fa-2x ml-1',
                        //     exportOptions: {
                        //         columns: exportColumns
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
                                columns: exportColumns
                            }
                        }, {
                            extend: 'excel',
                            text: '',
                            tag: 'span',
                            titleAttr: 'Excel',
                            className: 'fas fa-table cursor-pointer text-warning fa-2x ml-1',
                            filename: 'Excel-File',
                            exportOptions: {
                                columns: exportColumns
                            }
                        },
                        // { // NO DEL pdf spend too much time to load, so no this function by default
                        //     extend: 'pdf',
                        //     text: '',
                        //     tag: 'span',
                        //     titleAttr: 'PDF',
                        //     className: 'fas fa-file-pdf cursor-pointer text-warning fa-2x ml-1',
                        //     exportOptions: {
                        //         columns: exportColumns
                        //     }
                        // }, // /NO DEL
                        {
                            extend: 'print',
                            text: '',
                            tag: 'span',
                            titleAttr: 'Print',
                            className: 'fas fa-print cursor-pointer text-warning fa-2x ml-1',
                            exportOptions: {
                                columns: exportColumns
                            }
                        }
                    ],
                    lengthChange: false,
                    aaSorting: aaSorting,
                    searching: false,
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
                        $('#case-submit-btn').prop('disabled', false);
                    }
                });

                // Add event listener for opening and closing details
                $('#search-case-table tbody').on('click', 'td.details-control', function () {
                    var tr = $(this).closest('tr');
                    var row = caseTable.row(tr);

                    if (row.child.isShown()) {
                        // This row is already open - close it
                        row.child.hide();
                        tr.removeClass('shown');
                        resize();
                    } else {
                        // Open this row
                        row.child(format(row.data())).show();
                        tr.addClass('shown');
                    }
                });

                $('#search-case-table tbody').on('click', 'tr', function (e) {
                    caseTable.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                    $(this).addClass('highlight')
                });
                $('#search-case-table tbody').on('click', '.select', function () {
                    var data = caseTable.row($(this).parents('tr')).data();
                    UpdateCase(connId, callType, details, data);
                });
                $('#search-case-table tbody').on('click', '.change', function () {
                    var data = caseTable.row($(this).parents('tr')).data();
                    changeContactCaseNo = data.Case_No;
                    changeContactCustomerId = data.Customer_Id;
                    if (parent.parent && parent.parent.openWindows) {
                        var openWindows = parent.parent.openWindows;
                        var changeContactPop = window.open('./changeContactPop.html', 'Change Contact', '_blank, toolbar=0,location=0,top=50, left=50,menubar=0,resizable=0,scrollbars=1,width=903,height=640');
                        openWindows[openWindows.length] = changeContactPop;
                        changeContactPop.onload = function () {
                            changeContactPop.onbeforeunload = function () {
                                for (var i = 0; i < openWindows.length; i++) {
                                    if (openWindows[i] == changeContactPop) {
                                        openWindows.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                        }
                        return false;
                    }
                });
            }
        });
    }
    if (searchCaseDiv.length > 0) {
        searchCaseDiv.remove();
        addsearchCaseDiv();
    } else {
        addsearchCaseDiv();
    }
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
        $('<input class="case-search-input form-control" type="search">').appendTo($(cln));
    } else {
        var keyPressString = "searchInputPressed(event,'case')"
        $('<input class="case-search-input form-control" type="search" onkeypress=' + keyPressString + '>').appendTo($(cln));
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
        var optionStr = '<option value="">-- Please Select --</option>';
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
    var defaultFields = config.caseDefaultSearch || [];

    for (var i=0; i<defaultFields.length;i++) {
        var theField = defaultFields[i];

        // there is a default field already there
        if(i!=0) {
            $('#add-fields-btn').click();
        }
        var theConditionField =  $('.case-search-condition').eq(i);
        theConditionField.val(theField);
        selectChange('case', theConditionField);
    }
}

function loadCaseFields() {
    var contactTable = parent.contactTable || [];
    var contactCombined = parent.contactCombined || [];
    var contactSystem = parent.contactSystem || [];
    var caseTable = parent.caseTable || [];
    var caseSystem = parent.caseSystem || [];
    // For Case Mode can have not contact related fields
    if (loadFieldFnTry < 4 && (caseTable.length == 0 || caseSystem.length == 0)) {
        setInterval(loadCaseFields, 1000);
        loadFieldFnTry += 1;
        return;
    } else {
        $('#lower-part-container').removeClass('d-none');
    }
    // ==================== Condition Drop Down: Contact List insert  ====================
    for (let option of contactTable) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".case-search-condition").append('<option style="color:blue" list="Contact List" type="' + (option.Field_Type || '') + '" tag="' + (fieldTag || '') + '" value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    for (let option of contactCombined) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".case-search-condition").append('<option style="color:green" list="Contact List" type="' + (option.Field_Type || '') + '" tag="' + fieldTag + '" value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    for (let option of contactSystem) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".case-search-condition").append('<option style="color:purple" list="Contact List" type="' + (option.Field_Type || '') + '" tag="' + (fieldTag || '') + '" value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    $(".customer-search-condition").attr('onchange', 'selectChange("customer", this);');
    // ==================== Condition Drop Down: Case List insert  ====================
    for (let option of caseTable) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".case-search-condition").append('<option style="color:blue" style="color:blue" list="Case List" type="' + (option.Field_Type || '') + '" tag="' + (fieldTag || '') + '" value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    for (let option of caseSystem) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".case-search-condition").append('<option style="color:purple" list="Case List" type="' + (option.Field_Type || '') + '" tag="' + (fieldTag || '') + '" value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    $(".case-search-condition").attr('onchange', 'selectChange("case", this);');
}

function loadCRMFields() {
    var contactTable = parent.contactTable || [];
    var contactCombined = parent.contactCombined || [];
    var contactSystem = parent.contactSystem || [];
    var caseTable = parent.caseTable || [];
    var caseSystem = parent.caseSystem || [];
    // For Case Mode cannot have not columns in contact table
    if (loadFieldFnTry < 4 && (caseTable.length == 0 || caseSystem.length == 0)) {
        setInterval(loadCRMFields, 1000);
        loadFieldFnTry += 1;
        return;
    } else {
        $('#lower-part-container').removeClass('d-none');
    }
    // ==================== Condition Drop Down: Case List insert  ====================
    $(".case-search-condition").append('<option disabled="disabled" value="" selected="selected">=== Case List ===</option>');
    for (let option of caseTable) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".case-search-condition").append('<option style="color:blue" style="color:blue" list="Case List" type="' + (option.Field_Type || '') + '" tag="' + (fieldTag || '') + '" value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    for (let option of caseSystem) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".case-search-condition").append('<option style="color:purple" list="Case List" type="' + (option.Field_Type || '') + '" tag="' + (fieldTag || '') + '" value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    $(".case-search-condition").attr('onchange', 'selectChange("case", this);');
    // ==================== Condition Drop Down: Contact List insert  ====================
    $(".case-search-condition").append('<option disabled="disabled" value="">=== Customer List ===</option>');
    for (let option of contactTable) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".case-search-condition").append('<option style="color:blue" list="Contact List" type="' + (option.Field_Type || '') + '" tag="' + (fieldTag || '') + '" value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    for (let option of contactCombined) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".case-search-condition").append('<option style="color:green" list="Contact List" type="' + (option.Field_Type || '') + '" tag="' + (fieldTag || '') + '" value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    for (let option of contactSystem) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".case-search-condition").append('<option style="color:purple" list="Contact List" type="' + (option.Field_Type || '') + '" tag="' + (fieldTag || '') + '" value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    $(".customer-search-condition").attr('onchange', 'selectChange("customer", this);');
}

function windowOnload() {
    recordPerPage = sessionStorage.getItem('scrmCaseLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5;
    if (caseMode) {
        loadCaseFields();
    } else {
        loadCRMFields();
    }
    buildDefaultFields();
    setLanguage();
    resize();
    $.getScript("../js/buttons.flash.min.js");
    $.getScript("../js/jszip.min.js");
    // NO DEL $.getScript("../js/vfs_fonts.js"); // pdf spent too much time so no this function by default
    $.getScript("../js/buttons.html5.min.js");
    $.getScript("../js/buttons.print.min.js");
    $.getScript("../js/popper.min.js");
    $.getScript("../js/bootstrap.min.js");
    $.getScript("../js/jquery-ui.min.js");
}
$(document).ready(function () {
    if (parent.parent.iframeRecheck) {
        parent.parent.iframeRecheck($(parent.document));
    }
});
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());