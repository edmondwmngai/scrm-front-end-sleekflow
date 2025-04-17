var customCompany = sessionStorage.getItem('scrmCustomCompany') || 'no';
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';
var openFrom = getParameterByName('open');
var winOpen = window.opener;

var changeContactCaseNo = Number(window.opener.changeContactCaseNo || -1);
var changeContactCustomerId = window.opener.changeContactCustomerId || -1;
let alertCache;

// if (changeContactCaseNo == -1 || changeContactCustomerId == -1) {
//     alert('Please re-open the window');
//     window.close();
// }

if (changeContactCustomerId == -1) {
    alert('Please re-open the window');
    window.close();
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function setLanguage() {
    $('.l-search-search-contact-list').text(langJson['l-search-search-contact-list']);
    $('.l-search-match').text(langJson['l-search-match']);
    $('.l-search-all').text(langJson['l-search-all']);
    $('.l-search-any').text(langJson['l-search-any']);
    $('.l-search-of-the-following').text(langJson['l-search-of-the-following']);
    $('.l-search-search').text(langJson['l-search-search']);
    $('.l-search-change-contact').text(langJson['l-search-change-contact']);
}
function searchInputPressed(e, type) { //type: 'customer' or 'case'
    // if pressed enter
    if (e.keyCode == 13) {
        // if this is the last row
        // if ($(e.target).parent().next().length == 0) {
        submitClicked(type);
        // }
        e.preventDefault();
    }
}
function binClick(iThis) {
    $(iThis).parent().remove();
}
function addSearchField(type) {
    var itm = document.querySelector("." + type + "-search-item");
    var cln = itm.cloneNode(true);
    // remove comobo if there is one
    $(cln).find(".select-value").remove();
    $(cln).find("input").remove();
    if (type == 'customer') {
        var keyPressString = "searchInputPressed(event,'customer')"
        $('<input class="customer-search-input form-control" type="search" onkeypress=' + keyPressString + '>').appendTo($(cln));
    } else {
        var keyPressString = "searchInputPressed(event,'case')"
        $('<input class="case-search-input form-control" type="search" onkeypress=' + keyPressString + '>').appendTo($(cln));
    }
    var datepicker = $(cln).find('.ui-datepicker-trigger');
    if (datepicker) { $(datepicker).remove(); }
    $("<image class='rubbish-bin' src='../images/bin.png' onclick='binClick(this);'></image>").appendTo($(cln))
    // Append the cloned item element to <ul> with id="advance-search-list"
    document.getElementById(type + "-search-list").appendChild(cln);
    // no need to resize in pop-up
    //resize();
}
function isInteger(num) {  //Number.isInteger only work on Chrome, not IE, so have this function
    return (num ^ 0) === num;
}
function submitClicked(type) {   //20250325 This function expects no arguments, but 1 was provided.
    var campaign = window.opener.parent.campaign || '';
    var allAny = $('.customer-all-any option:selected')[0].value;
    var searchCondition = $('.customer-search-condition option:selected');
    var searchSymbol = $('.customer-search-symbol option:selected');
    //var searchInput = $('.customer--search-input');   //20250325 Remove this useless assignment to variable "searchInput".
    var searchInput = $('.customer-search-input');
    var searchArr = [];
    
	//10-30-2025 for securit migration
	//var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    //var re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Remove the declaration of the unused 're' variable.
	
    for (var i = 0; i < searchCondition.length; i++) {
        var condition = searchCondition[i] || '';
        var conditionTag = $(condition).attr('tag') || ''; //e.g. select
        var inputValue = '';
        var conditionValue = searchCondition[i].value || ''; // table column name
        var conditionType = $(searchCondition[i]).attr('type') || '';  // null, datetime
        if (conditionTag == 'select') {
            inputValue = $(condition).parent().siblings('.select-value')[0].value || '';
        } else {
            inputValue = (searchInput[i].value || '').trim();
            if (conditionType == 'number') {
                if (isNaN(inputValue)) {
                    //alert('Please input a a valid number');
                    alertEnhanced('notValid', 'Please input a a valid number');
                    $('#customer-submit-btn').prop('disabled', false);
                    return;
                } else {
                inputValue = Number(inputValue);
                }
            }
        }

        if (conditionValue.length == 0) {
            // alert(langJson['l-alert-no-condition-selected']);
            alertEnhanced('noLength', langJson['l-alert-no-condition-selected']);
            return
        }
        if (inputValue.length == 0) {
            //alert(langJson['l-alert-search-field-blank']);
            alertEnhanced('noInput', langJson['l-alert-search-field-blank'])
            return
        }
        if (conditionValue == "All_Phone_No") {
            if (!/^\d+$/.test(inputValue)) {
                //alert(langJson['l-alert-phone-not-digit']);
                alertEnhanced('phoneNo1', langJson['l-alert-phone-not-digit']);
                return;
            }
            if (inputValue.length < 4) {
                //alert('All Phone Numbers must input at least 4 digits');
                alertEnhanced('phoneNo2', 'All Phone Numbers must input at least 4 digits');
                return;
            }
        }
        if (conditionValue == "Email") {
            if (inputValue.length < 4) {
                //alert('Email must input at least 4 characters');
                alertEnhanced('email', 'Email must input at least 4 characters');
                return;
            }
        }
        if (conditionValue == "Name_Eng") {
            if (inputValue.length < 2) {
                //alert('Full Name must input at least 2 characters');
                alertEnhanced('fullName', 'Full Name must input at least 2 characters');
                return;
            }
        }
        var tmpArr = { "field_name": conditionValue, "logic_operator": searchSymbol[i].value, "value": inputValue, "field_type": conditionType };
        tmpArr.list_name = $(condition).attr('list') || '';
        searchArr.push(tmpArr);
    }
    var submitData = { "anyAll": allAny, "searchArr": searchArr, "Is_Valid": "Y", Agent_Id: loginId, Token: token };
    // send to query the result

    var searchCustomerDiv = $('#search-customer-container');
    var addsearchCustomerDiv = function () {
        var recordPerPage = (sessionStorage.getItem('scrmCaseLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null) ? Number(sessionStorage.getItem('scrmCaseLength')) : 5;
        $('#lower-part-container').append(
            '<div id="search-customer-container">' +
            // '<h5>' +
            // '<i class="fas fa-users title-icon me-2"></i>' + langJson['l-search-customer-list'] +
            // '</h5>' +
            '<table id="search-customer-table" class="table table-hover display" style="width:100%" data-page-length=' + recordPerPage + '>' +
            '</table>' +
            '</div>'
        )
        var columns = [
            { title: "" },
            { title: langJson['l-search-customer-id'], data: "Customer_Id" },
            { title: langJson['l-search-full-name'], data: "Name_Eng" },
        ];

        columns.push(
            { title: langJson['l-search-mobile'], data: "Mobile_No" },
            { title: langJson['l-search-other'], data: "Other_Phone_No" },
            { title: langJson['l-search-email'], data: "Email" }
        );

        var columnDefs = [{
            targets: 0,
            colVis: false,
            className: 'btnColumn',
            orderable: false,
            render: function (data, type, row) {
                if (row.Customer_Id == changeContactCustomerId) {
                    return '';
                } else {
                    return '<i data-bs-toggle="tooltip" data-bs-placement="top" title="' + langJson['l-search-change-the-case-to-this-customer'] + '" class="table-btn fas fa-clipboard-check confirm">'
                }
            }
        }
        ]
        if (customCompany == 'no') {
            columns.push({ title: langJson['l-search-company'] });
            columnDefs.push({
                targets: 3,
                colVis: false,
                defaultContent: campaign,
                orderable: false,
            })
        }

        // Get Manual Search Result
        $.ajax({
            type: "POST",
            url: mvcHost + '/mvc' + campaign + '/api/ManualSearch',
            data: JSON.stringify(submitData),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (res) {
            if (!/^success$/i.test(res.result || "")) {
                console.log("error /n" + res ? res : '');
            } else {
                var customerDetails = res.details;
                var customerTable = $('#search-customer-table').DataTable({
                    data: customerDetails,
                    lengthChange: false,
                    aaSorting: [], // no initial sorting
                    searching: false,
                    columnDefs: columnDefs,
                    columns: columns,
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
                $('#search-customer-table tbody').on('click', 'tr', function (e) {
                    customerTable.$('tr.highlight').removeClass('highlight');  // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                    $(this).addClass('highlight')
                });

                $('#search-customer-table tbody').on('click', '.confirm', function () {
                    var data = customerTable.row($(this).parents('tr')).data();
                    var customerId = data.Customer_Id;

                    if (changeContactCaseNo == -1) {
                        if (openFrom == 'input') {

                            // Open from input form
                            window.opener.changedCustomer(customerId);
                            window.close();
                        } else {

                            // Open from Search Case
                            window.opener.submitClicked('case');
                            window.close();
                        }
                    } else {
                        $.ajax({
                            type: "PUT",
                            url: mvcHost + '/mvc' + campaign + '/api/ChangeContact',
                            data: JSON.stringify({ "Case_No": changeContactCaseNo, "Customer_Id": customerId, "Agent_Id": loginId, Token: token }),
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function (r) {
                                if (!/^success$/i.test(r.result || "")) {
                                    console.log('error in caseRecordPopupOnload');
                                //} else {      // 20250410 'If' statement should not be the only statement in 'else' block
                                } else if (openFrom == 'input') {

                                        // Open from input form
                                        window.opener.changedCustomer(customerId);
                                        window.close();
                                } else {

                                        // Open from Search Case
                                        window.opener.submitClicked('case');
                                        window.close();
                                    //}// 20240410 for else if
                                }
                            },
                            error: function (r) {
                                console.log('error in caseRecordPopupOnload');
                                console.log(r);
                            }
                        });
                    }
                });
            }
        })
    }
    if (searchCustomerDiv.length > 0) {
        searchCustomerDiv.remove();
        addsearchCustomerDiv();
    } else {
        addsearchCustomerDiv();
    }
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
            selectedInput.attr("placeholder", "yyyy/mm/dd");
            selectedInput.datepicker({
                showOn: "button",
                buttonImage: "../images/calendar-grid-30.svg",
                buttonStyle: 'height:1000px',
                buttonImageOnly: true,
                buttonText: "Select date",
                dateFormat: 'yy/mm/dd',
                changeMonth: true,
                changeYear: true
            });
        }
    } else {
        // // sybmol chocie change to text
        // symbolField.val('is');
        // symbolField.find('.date-symbol').removeAttr("style").hide();
        // symbolField.find('.text-symbol').removeAttr("style").show();

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
            selectedInput.attr("placeholder", "");
            selectedInput.datepicker("destroy");
            selectedInput.removeClass("hasDatepicker").removeAttr('id');
        }
    }

}

function windowOnload() {
    setLanguage();
    var contactTable = window.opener.parent.contactTable || [];
    var contactCombined = window.opener.parent.contactCombined || [];
    var contactSystem = window.opener.parent.contactSystem || [];
    // ==================== Condition Drop Down: Contact List insert  ====================
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
$(document).ready(function () {
    console.log(window.opener.parent.parent.addPopupIdle);
    if (window.opener.parent.parent.addPopupIdle) {
        window.opener.parent.parent.addPopupIdle($(document));
    }
});

//call alert (new)
function alertEnhanced(alertId, message, status) {
    const delayMiliSec = 8000;   
    if(alertId != alertCache){
        let alertStr = `<div id="${alertId}" class="alert alert-danger d-grid"><i class="fas fa-bell me-2"></i>${message}<button type="button" class="close alertButton" data-bs-dismiss="alert">x</button></div>`; 
        $('#alert-container').html(alertStr);
        alertCache = alertId; 
        $('.close.alertButton').on('click', () => {
            alertCache = "";
        })
        $(`#${alertId}`).delay(delayMiliSec).fadeOut(200, () => {
            alertCache = "";   
        })
    }
}


// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());