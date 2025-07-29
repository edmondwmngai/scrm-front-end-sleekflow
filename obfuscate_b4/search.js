var openType = window.frameElement.getAttribute("openType") || '';
//var isSocial = openType == "social" ? true : false; // 20250320 Unnecessary use of boolean literals in conditional expression.
var isSocial = openType == "social";
var connId = isSocial ? window.frameElement.getAttribute("connId") : parent.window.frameElement.getAttribute("connId") || "";
var callType = isSocial ? window.frameElement.getAttribute("callType") : parent.window.frameElement.getAttribute("callType") || "";
var details = isSocial ? window.frameElement.getAttribute("details") : parent.window.frameElement.getAttribute("details") || "";
var customCompany = sessionStorage.getItem('scrmCustomCompany') || 'no';

//20250520 Extract this nested ternary operation into an independent statement.
//var campaign = customCompany!= 'no'? customCompany: (isSocial ? window.frameElement.getAttribute("campaign") : (parent.frameElement.getAttribute("campaign") || parent.campaign || ''));
var campaign;

if (customCompany !== 'no') {
    campaign = customCompany;
} else if (isSocial) {
    campaign = window.frameElement.getAttribute("campaign");
} else {
    campaign = parent.frameElement.getAttribute("campaign") || parent.campaign || '';
}


var recordPerPage = 5;
var agentList = parent.parent.agentList || [];
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var caseCoArr = config.caseCoArr;
var caseMode = false;
var openCaseNo = window.frameElement.getAttribute('openCaseNo') || '';

// added for Incomplete Cases's Outbound Call
var replyConnId = isSocial ? window.frameElement.getAttribute("replyConnId") : parent.window.frameElement.getAttribute("replyConnId") || "";
var replyDetails = isSocial ? window.frameElement.getAttribute("replyDetails") : parent.window.frameElement.getAttribute("replyDetails") || "";

for (let caseCo of caseCoArr) {
    if (campaign == caseCo) {
        caseMode = true;
    }
}

var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';

function setLanguage() {
    $('.l-search-all').text(langJson['l-search-all']);
    $('.l-search-any').text(langJson['l-search-any']);
    $('.l-search-case-auto').text(langJson['l-search-case-auto']);
    $('.l-search-case-list-auto-search').text(langJson['l-search-case-list-auto-search']);
    $('.l-search-case-list-manual-search').text(langJson['l-search-case-list-manual-search']);
    $('.l-search-auto-search').text(langJson['l-search-auto-search']);
    $('.l-search-manual-search').text(langJson['l-search-manual-search']);
    if (caseMode) {
        $('.l-search-create-case-new-customer').text(langJson['l-search-create-case']);
    } else {
        $('.l-search-create-case-new-customer').text(langJson['l-search-create-case-new-customer']);
    }
    $('.l-search-match').text(langJson['l-search-match']);
    $('.l-search-of-the-following').text(langJson['l-search-of-the-following']);
    $('.l-search-search').text(langJson['l-search-search']);
}

function format(d) {
    // `d` is the original data object for the row
    return '<span class="details-control-title">' + langJson['l-search-full-details'] + ':</span>' + d.Details;
}
// When chose a contact at Customer List Auto Search and Customer List Auto Search, add contact info
function addCustomerInfo(tabName, data, callback) { // tabName: 'home' or 'menu2'
    window.customerData = data;
    var searchTabStr = '#search-' + tabName;
    // prevent user clicked customer table multiple time at once, show the user info when they are not exist only
    if ($(searchTabStr).find('#input-form-' + tabName).length == 0) {
        var backStr = 'returnToNewCase("' + tabName + '")';
        $(searchTabStr).prepend(
            '<button id="back-btn-' + tabName + '" class="float-end btn btn-circle btn-warning mt-1 mb-3" onclick=' + backStr + ' title="' + langJson["l-general-previous-page"] + '"><i class="fas fa-arrow-left"></i></button>' +
            '<iframe id="input-form-' + tabName + '" customer-only="true" customerId=' + data.Customer_Id + ' style="border:none" width="100%" src ="./campaign/' + campaign + '/inputForm.html" />');
    }
    callback();
}

function searchOnload() {
    if (caseMode) {
        $('.case-element').hide();
        $(".active").removeClass("in active");
        $('a.nav-link[href="#search-menu1"]').addClass('active');
        $('#search-menu1').addClass('in active');
        $('.l-search-create-case-new-customer').text(langJson['l-search-create-case']);
    }
    //20250320 Unexpected constant truthiness on the left-hand side of a `||` expression.
	//recordPerPage = sessionStorage.getItem('scrmCaseLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5 || 5;
	recordPerPage = sessionStorage.getItem('scrmCaseLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5;

    $('.default-auto-table').attr('data-page-length', recordPerPage);
    loadGrid();
    loadFields();
}
// addEventListener support for IE8
function bindEvent(element, eventName, eventHandler) {
    if (element.addEventListener) {
        element.addEventListener(eventName, eventHandler, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler);
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
    // set default symobol shown
    $(cln).find('.text-symbol').show();
    $(cln).find('.date-symbol').hide();
    // set deafault text field and remove datepicker if availalbe and add rubblish bin
    $(cln).find("input").remove();
    if (type == 'customer') {
        var keyPressString = "searchInputPressed(event,'customer')"
        $('<input class="customer-search-input form-control" type="search" onkeypress=' + keyPressString + '>').appendTo($(cln));
    } else {
        var keyPressString = "searchInputPressed(event,'case')"
        $('<input class="case-search-input form-control" type="search" onkeypress=' + keyPressString + '>').appendTo($(cln));
    }
    // remove date picker if available
    var datepicker = $(cln).find('.ui-datepicker-trigger');
    if (datepicker) {
        $(datepicker).remove();
    }
    $("<image class='rubbish-bin' src='./images/bin.png' onclick='binClick(this);'></image>").appendTo($(cln))
    // Append the cloned item element to <ul> with id="advance-search-list"
    document.getElementById(type + "-search-list").appendChild(cln);
    resize();
}

function getAgentName(theAgentId) {
    var agentObj = gf.altFind(agentList, function (obj) {
        return obj.AgentID == theAgentId
    });
    if (agentObj != undefined) {
        return agentObj.AgentName;
    } else {
        return theAgentId;
    }
}
// Case Auto Search in Home tab and Menu2 tab after Customer Search
function addCaseAutoSearchTable(tabName, data, oThis) {
    // if (tabName == 'menu2') {
    //     $('#menu2-manual-search-container').hide();
    // }
    // var caseContainer = $('#search-' + tabName + '-case-div');
    var addCaseContainer = function () {
        $('#search-' + tabName).append(
            '<div id="search-' + tabName + '-case-div" class="margin-top">' +
            '<table id="search-' + tabName + '-case-table" class="table table-hover display" style="width:100%" data-page-length=' + recordPerPage + '>' +
            '</table>' +
            '</div>'
        );
        // Get table data ajax
        $.ajax({
            type: "POST",
            // url: config.companyUrl + '/api/CaseAutoSearch',
            // data: JSON.stringify({ "Customer_Id": data.Customer_Id, "Is_Valid": "Y" }),
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
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log("ERROR in CaseAutoSearch" + r.details);
                $(oThis).prop('disabled', false);
            } else {
				//20250602 Refactor this code to not nest functions more than 4 levels deep.
				addCaseAutoSearchTableDetail(tabName, oThis, r);
				/*
                $('#' + tabName + '-customer-container').hide();
                var caseDetails = r.details;
                var caseTbl = $('#search-' + tabName + '-case-table').DataTable({
                    data: caseDetails,
                    lengthChange: true, // not showing 'Show ? per page' dropdown
                    language: {
                        "paginate": {
                            "previous": "PREV"
                        }
                    },
                    "lengthMenu": [5, 10, 50],
                    aaSorting: [
                        [2, "desc"]
                    ],
                    // pageLength: recordPerPage,
                    searching: false,
                    //buttons: [{ extend: 'colvis', columns: ':not(.noVis)' }],
                    columnDefs: [{
                        targets: 0,
                        data: null,
                        // colVis: false,
                        defaultContent: '<i title="' + langJson['l-search-update-case'] + '" class="fas fa-edit table-btn select" data-bs-toggle="tooltip"></i>',
                        className: 'btnColumn',
                        // className: 'noVis', //NOTES: no column visibility
                        orderable: false,
                    }, {
                        targets: 4,
                        render: function (data, type, row) {
                            if (data.length > 0) {
                                return data.replace(/_/g, " ");       // return data.replace(/[_]/g, " ");        // 20250409 Replace this character class by the character itself.
                            } else {
                                return 'Manual Update';
                            }
                        }
                    }, {
                        targets: 6,
                        render: function (data, type, row) {
                            var escalatedTo = row.Escalated_To;
                            if (escalatedTo != null) {
                                return 'Escalated to ' + '<span style="color:green">' + getAgentName(escalatedTo) + ' (ID: ' + escalatedTo + ')<span>'
                            } else {
                                return data
                            }
                        }
                        // }, {
                        //     targets: -2,
                        //     render: function (data, type, row) {
                        //         return getAgentName(data || '') + ' (' + data + ')';
                        //     }
                    }, {
                        targets: 2,
                        render: function (data, type, row) {
                            var DateWithoutDot = data.slice(0, data.indexOf("."));
                            return DateWithoutDot.replace('T', ' ');
                        }
                    }],
                    initComplete: function (settings, json) {
                        // var header = '<h5>' +
                        //     '<i class="far fa-folder-open title-icon me-2"></i>Case List' +
                        //     '</h5>';
                        // $(header).insertBefore('#search-' + tabName + '-case-table')
                        resize();
                        $(oThis).prop('disabled', false);
                    },
                    columns: [{
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
                        //{ title: langJson["l-search-revised-by"], data: "Case_Updated_By" },
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
				
                // $('#' + tabName + '-customer-container').find('i[data-bs-toggle="popover"]').popover();

                // Add event listener for opening and closing details
                $('#search-' + tabName + '-case-table').on('click', 'td.details-control', function () {
                    var tr = $(this).closest('tr');
                    var row = caseTbl.row(tr);

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

                $('#search-' + tabName + '-case-table').on('draw.dt', function (e) {
                    setTimeout(function () {
                        resize();
                    }, 500);
                });

                $('#search-' + tabName + '-case-table tbody').on('click', 'tr', function (e) {
                    caseTbl.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                    $(this).addClass('highlight')
                });

                $('#search-' + tabName + '-case-table').on('click', '.select', function () {
                    var data = caseTbl.row($(this).parents('tr')).data();
                    UpdateCase(data);
                });
				*/
            }
        });
    }

    if (tabName == 'menu2') {
        $('#menu2-manual-search-container').hide();
    }

    var caseContainer = $('#search-' + tabName + '-case-div'); //If already have a case table, destroy it (clicked multiple time on customer table)
    if (caseContainer.length > 0) {
        caseContainer.remove();
        addCustomerInfo(tabName, data, addCaseContainer);
    } else {
        addCustomerInfo(tabName, data, addCaseContainer);
    }
}

function addCaseAutoSearchTableDetail(tabName, oThis, r){
	
	$('#' + tabName + '-customer-container').hide();
	var caseDetails = r.details;
	var caseTbl = $('#search-' + tabName + '-case-table').DataTable({
		data: caseDetails,
		lengthChange: true, // not showing 'Show ? per page' dropdown
		language: {
			"paginate": {
				"previous": "PREV"
			}
		},
		"lengthMenu": [5, 10, 50],
		aaSorting: [
			[2, "desc"]
		],
		// pageLength: recordPerPage,
		searching: false,
		//buttons: [{ extend: 'colvis', columns: ':not(.noVis)' }],
		columnDefs: [{
			targets: 0,
			data: null,
			// colVis: false,
			defaultContent: '<i title="' + langJson['l-search-update-case'] + '" class="fas fa-edit table-btn select" data-bs-toggle="tooltip"></i>',
			className: 'btnColumn',
			// className: 'noVis', //NOTES: no column visibility
			orderable: false,
		}, {
			targets: 4,
			render: function (data, type, row) {
				if (data.length > 0) {
					return data.replace(/_/g, " ");       // return data.replace(/[_]/g, " ");        // 20250409 Replace this character class by the character itself.
				} else {
					return 'Manual Update';
				}
			}
		}, {
			targets: 6,
			render: function (data, type, row) {
				var escalatedTo = row.Escalated_To;
				if (escalatedTo != null) {
					return 'Escalated to ' + '<span style="color:green">' + getAgentName(escalatedTo) + ' (ID: ' + escalatedTo + ')<span>'
				} else {
					return data
				}
			}
			// }, {
			//     targets: -2,
			//     render: function (data, type, row) {
			//         return getAgentName(data || '') + ' (' + data + ')';
			//     }
		}, {
			targets: 2,
			render: function (data, type, row) {
				var DateWithoutDot = data.slice(0, data.indexOf("."));
				return DateWithoutDot.replace('T', ' ');
			}
		}],
		initComplete: function (settings, json) {
			// var header = '<h5>' +
			//     '<i class="far fa-folder-open title-icon me-2"></i>Case List' +
			//     '</h5>';
			// $(header).insertBefore('#search-' + tabName + '-case-table')
			resize();
			$(oThis).prop('disabled', false);
		},
		columns: [{
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
			//{ title: langJson["l-search-revised-by"], data: "Case_Updated_By" },
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
	// $('#' + tabName + '-customer-container').find('i[data-bs-toggle="popover"]').popover();

	// Add event listener for opening and closing details
	$('#search-' + tabName + '-case-table').on('click', 'td.details-control', function () {
		var tr = $(this).closest('tr');
		var row = caseTbl.row(tr);

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

	$('#search-' + tabName + '-case-table').on('draw.dt', function (e) {
		setTimeout(function () {
			resize();
		}, 500);
	});

	$('#search-' + tabName + '-case-table tbody').on('click', 'tr', function (e) {
		caseTbl.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
		$(this).addClass('highlight')
	});

	$('#search-' + tabName + '-case-table').on('click', '.select', function () {
		var data = caseTbl.row($(this).parents('tr')).data();
		UpdateCase(data);
	});



	
}

function returnToNewCase(tabName) {
    // remove back btn
    $('#back-btn-' + tabName).remove();
    // remove input form
    $('#search-' + tabName).find('#input-form-' + tabName).remove();
    // remove case table
    $('#search-' + tabName + '-case-div').remove();
    // show back search container if have
    if (tabName == 'menu2') {
        $('#menu2-manual-search-container').show();
    }
    // show back customr table
    $('#' + tabName + '-customer-container').show();
}

function submitClicked(type) {
    $('#' + type + '-submit-btn').prop('disabled', true);
    var allAny = $('.' + type + '-all-any option:selected')[0].value;
    var searchCondition = $('.' + type + '-search-condition option:selected');
    var searchSymbol = $('.' + type + '-search-symbol option:selected');
    //var searchInput = $('.' + type + '-search-input');		// 20250415 Remove this useless assignment to variable "searchInput".
    var searchInput = $('.' + type + '-search-input');
    var searchArr = [];
    for (var i = 0; i < searchCondition.length; i++) {
        var condition = searchCondition[i] || '';
        var conditionTag = $(condition).attr('tag') || ''; //e.g. select
        var inputValue = '';
        var conditionValue = searchCondition[i].value || ''; // table column name
        var conditionType = $(searchCondition[i]).attr('type') || ''; // null, datetime
        if (conditionTag == 'select') {
            inputValue = $(condition).parent().siblings('.select-value')[0].value || '';
        } else {
            inputValue = (searchInput[i].value || '').trim();
            if (conditionType == 'number') {
                inputValue = Number(inputValue);
            }
        }
        if (conditionValue.length == 0) {
            alert(langJson['l-alert-no-condition-selected']);
            $('#' + type + '-submit-btn').prop('disabled', false);
            return;
        }
        if (inputValue.length == 0) {
            alert(langJson['l-alert-search-field-blank']);
            $('#' + type + '-submit-btn').prop('disabled', false);
            return;
        }
        if (conditionValue == "All_Phone_No") {
            if (!/^\d+$/.test(inputValue)) {
                alert(langJson['l-alert-phone-not-digit']);
                $('#' + type + '-submit-btn').prop('disabled', false);
                return;
            }
            if (inputValue.length < 4) {
                alert('All Phone Numbers must input at least 4 digits');
                $('#' + type + '-submit-btn').prop('disabled', false);
                return;
            }
        }
        if (conditionValue == "Email") {
            if (inputValue.length < 4) {
                alert('Email must input at least 4 characters');
                $('#' + type + '-submit-btn').prop('disabled', false);
                return;
            }
        }
        if (conditionValue == "Name_Eng") {
            if (inputValue.length < 2) {
                alert('Full Name must input at least 2 characters');
                $('#' + type + '-submit-btn').prop('disabled', false);
                return;
            }
        }
        if (conditionValue == "Details") {
            if (inputValue.length < 2) {
                alert('Details must input at least 2 characters');
                $('#' + type + '-submit-btn').prop('disabled', false);
                return;
            }
        }
        if (conditionValue == "Reply_Details") {
            if (inputValue.length < 4) {
                alert('Outbound Details must input at least 4 characters');
                $('#' + type + '-submit-btn').prop('disabled', false);
                return;
            }
        }
        if (conditionValue == "Type_Details") {
            if (inputValue.length < 4) {
                alert('Inbound Details must input at least 4 characters');
                $('#' + type + '-submit-btn').prop('disabled', false);
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
        $('#' + type + '-submit-btn').prop('disabled', false);
        return;
    }

    var sendObj = {
        "anyAll": allAny,
        "searchArr": searchArr,
        "Is_Valid": "Y",
        Agent_Id: loginId,
        Token: token
    };
    // create result table
    if (type == 'customer') {
        var menu2CustomerDiv = $('#menu2-customer-container');
        var addMenu2CustomerDiv = function () {
        
			//$('#search-menu2').append(		//20250729 handle the manual search result
			$('#search-menu2').append(
                '<div id="menu2-customer-container">' +
                // '<h5>' +
                // '<i class="fas fa-users title-icon me-2"></i><span class="align-middle">' + langJson['l-search-customer-list'] +
                // '</span></h5>' +
                '<table id="search-menu2-customer-table" class="table table-hover display" style="width:100%" data-page-length=' + recordPerPage + '>' +
                '</table>' +
                '</div>'
            )
            // $('#search-menu2-customer-table').attr('data-page-length', recordPerPage);
            // Get Manual Search Result
            $.ajax({
                type: "POST",
                url: config.companyUrl + '/api/ManualSearch',
                data: JSON.stringify(sendObj),
                crossDomain: true,
                contentType: "application/json",
                dataType: 'json'
				
			}).always(handleCustomerManualSearchResponse);
            /*
			}).always(function (r) {
				
			
                if (!/^success$/i.test(r.result || "")) {
                    console.log("error /n" + r ? r : '');
                    $('#' + type + '-submit-btn').prop('disabled', false);
                } else {
                    var customerDetails = r.details;
                    var customerTable = $('#search-menu2-customer-table').DataTable({
                        data: customerDetails,
                        lengthChange: true,
                        "lengthMenu": [5, 10, 50],
                        language: {
                            "paginate": {
                                "previous": "PREV"
                            }
                        },
                        aaSorting: [], // no initial sorting
                        // pageLength: recordPerPage,
                        searching: false,
                        columnDefs: [{
                            targets: 0,
                            colVis: false,
                            defaultContent: '<i title="' + langJson['l-search-create-case'] + '" class="fas fa-edit table-btn create" data-bs-toggle="tooltip"></i>',
                            className: 'btnColumn',
                            // className: 'noVis', //NOTES: no column visibility
                            orderable: false,
                        }, {
                            targets: 1,
                            orderable: false,
                            render: function (data, type, row) {
                                if (data) {
                                    return '<i title="' + langJson['l-search-search-case-to-update'] + '" class="table-btn fas fa-search-plus search-case" data-bs-toggle="tooltip"></i>';
                                } else {
                                    return '';
                                }
                            },
                            className: 'btnColumn'
                        }],
                        columns: [{
                                title: "",
                                data: null
                            }, {
                                title: "",
                                data: 'have_case'
                            }, {
                                title: langJson['l-search-customer-id'],
                                data: 'Customer_Id'
                            }, {
                                title: langJson['l-search-full-name'],
                                data: "Name_Eng"
                            },
                            // { title: "Home", data: "Home_No" },
                            // { title: "Office", data: "Office_No" },
                            {
                                title: langJson['l-search-mobile'],
                                data: "Mobile_No"
                            }, {
                                title: langJson['l-search-fax'],
                                data: "Fax_No"
                            }, {
                                title: langJson['l-search-other'],
                                data: "Other_Phone_No"
                            }, {
                                title: langJson['l-search-email'],
                                data: "Email"
                            }
                        ],
                        initComplete: function (settings, json) {
                            resize();
                            $('#' + type + '-submit-btn').prop('disabled', false);
                        }
                    });


                    $('#search-menu2-customer-table').on('draw.dt', function (e) {
                        setTimeout(function () {
                            resize();
                        }, 500);
                    });

                    $('#search-menu2-customer-table tbody').on('click', 'tr', function (e) {
                        customerTable.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                        $(this).addClass('highlight')
                    });
                    $('#search-menu2-customer-table tbody').on('click', '.create', function (e) {
                        e.preventDefault();
                        var data = customerTable.row($(this).parents('tr')).data();
                        addCase(data.Customer_Id, data);
                    });

                    $('#search-menu2-customer-table tbody').on('click', '.search-case', function (e) {
                        $(this).prop('disabled', true);
                        e.preventDefault();
                        var data = customerTable.row($(this).parents('tr')).data();
                        addCaseAutoSearchTable('menu2', data, this);
                    });
                }*/
            //})
        }
        if (menu2CustomerDiv.length > 0) {
            menu2CustomerDiv.remove();
            addMenu2CustomerDiv();
        } else {
            addMenu2CustomerDiv();
        }
    } else { // type == case
        var menu3CustomerDiv = $('#search-menu3-customer-div');
        var addMenu3CustomerDiv = function () {
			//$('#search-menu3').append(
            $('#search-menu3').append(
                '<div id="search-menu3-customer-div">' +
                '<table id="search-menu3-case-table" class="table table-hover display" style="width:100%" data-page-length=' + recordPerPage + '>' +
                '</table>' +
                '</div>'
            );
            // Get Manual Search Result
            $.ajax({
                type: "POST",
                url: config.companyUrl + '/api/CaseManualSearch',
                data: JSON.stringify(sendObj),
                crossDomain: true,
                contentType: "application/json",
                dataType: 'json'
			}).always(handleCaseManualSearchResponse);
			/*
            }).always(function (r) {
                if (!/^success$/i.test(r.result || "")) {
                    console.log("error /n" + res ? res : '');
                    $('#' + type + '-submit-btn').prop('disabled', false);
                } else {
                    var menu3CaseDetails = r.details;
                    var menu3Table = $('#search-menu3-case-table').DataTable({
                        data: menu3CaseDetails,
                        lengthChange: true,
                        "lengthMenu": [5, 10, 50],
                        language: {
                            "paginate": {
                                "previous": "PREV"
                            }
                        },
                        aaSorting: [
                            [2, "desc"]
                        ],
                        // pageLength: recordPerPage,
                        searching: false,
                        columnDefs: [{
                            targets: 0,
                            data: null,
                            // colVis: false,
                            defaultContent: '<i title="' + langJson['l-search-update-case'] + '" class="fas fa-edit table-btn select" data-bs-toggle="tooltip"></i>',
                            className: 'btnColumn',
                            // className: 'noVis', //NOTES: no column visibility
                            orderable: false,
                        }, {
                            targets: 4,
                            render: function (data, type, row) {
                                if (data.length > 0) {
                                    return data.replace(/_/g, " ");   //  return data.replace(/[_]/g, " ");   //20250409 Replace this character class by the character itself.
                                } else {
                                    return 'Manual Update';
                                }
                            }
                        }, {
                            targets: 6,
                            render: function (data, type, row) {
                                var escalatedTo = row.Escalated_To;
                                if (escalatedTo != null) {
                                    return 'Escalated to ' + '<span style="color:green">' + getAgentName(escalatedTo) + ' (ID: ' + escalatedTo + ')<span>'
                                } else {
                                    return data
                                }
                            }
                            // }, {
                            //     targets: 6,
                            //     render: function (data, type, row) {
                            //         return getAgentName(data || '') + ' (' + data + ')';
                            //     }
                        }, {
                            targets: 2,
                            render: function (data, type, row) {
                                var DateWithoutDot = data.slice(0, data.indexOf("."));
                                return DateWithoutDot.replace('T', ' ');
                            }
                        }],
                        columns: [{
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
                            //{ title: langJson["l-search-revised-by"], data: "Case_Updated_By" },
                            {
                                title: langJson["l-form-details"],
                                data: "Details"
                            }, {
                                "className": 'details-control',
                                "orderable": false,
                                "data": null,
                                "defaultContent": ''
                            }
                        ],
                        initComplete: function (settings, json) {
                            resize();
                            $('#' + type + '-submit-btn').prop('disabled', false);
                        }
                    });

                    // $('#search-menu3-case-table').find('i[data-bs-toggle="popover"]').popover();

                    // Add event listener for opening and closing details
                    $('#search-menu3-case-table').on('click', 'td.details-control', function () {
                        var tr = $(this).closest('tr');
                        var row = menu3Table.row(tr);

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

                    $('#search-menu3-case-table').on('draw.dt', function (e) {
                        setTimeout(function () {
                            resize();
                        }, 500);
                    });

                    $('#search-menu3-case-table tbody').on('click', 'tr', function (e) {
                        menu3Table.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                        $(this).addClass('highlight')
                    });

                    $('#search-menu3-case-table tbody').on('click', '.select', function () {
                        var data = menu3Table.row($(this).parents('tr')).data();
                        UpdateCase(data);
                    });
                }
            });
			*/
        }
        if (menu3CustomerDiv.length > 0) {
            menu3CustomerDiv.remove();
            addMenu3CustomerDiv();
        } else {
            addMenu3CustomerDiv();
        }
    }
}

function handleCustomerManualSearchResponse(r)
{
	var type = "customer";
	if (!/^success$/i.test(r.result || "")) {
		console.log("error /n" + r ? r : '');
		$('#' + type + '-submit-btn').prop('disabled', false);
	} else {
		var customerDetails = r.details;
		var customerTable = $('#search-menu2-customer-table').DataTable({
			data: customerDetails,
			lengthChange: true,
			"lengthMenu": [5, 10, 50],
			language: {
				"paginate": {
					"previous": "PREV"
				}
			},
			aaSorting: [], // no initial sorting
			// pageLength: recordPerPage,
			searching: false,
			columnDefs: [{
				targets: 0,
				colVis: false,
				defaultContent: '<i title="' + langJson['l-search-create-case'] + '" class="fas fa-edit table-btn create" data-bs-toggle="tooltip"></i>',
				className: 'btnColumn',
				// className: 'noVis', //NOTES: no column visibility
				orderable: false,
			}, {
				targets: 1,
				orderable: false,
				render: function (data, type, row) {
					if (data) {
						return '<i title="' + langJson['l-search-search-case-to-update'] + '" class="table-btn fas fa-search-plus search-case" data-bs-toggle="tooltip"></i>';
					} else {
						return '';
					}
				},
				className: 'btnColumn'
			}],
			columns: [{
					title: "",
					data: null
				}, {
					title: "",
					data: 'have_case'
				}, {
					title: langJson['l-search-customer-id'],
					data: 'Customer_Id'
				}, {
					title: langJson['l-search-full-name'],
					data: "Name_Eng"
				},
				// { title: "Home", data: "Home_No" },
				// { title: "Office", data: "Office_No" },
				{
					title: langJson['l-search-mobile'],
					data: "Mobile_No"
				}, {
					title: langJson['l-search-fax'],
					data: "Fax_No"
				}, {
					title: langJson['l-search-other'],
					data: "Other_Phone_No"
				}, {
					title: langJson['l-search-email'],
					data: "Email"
				}
			],
			initComplete: function (settings, json) {
				resize();
				$('#' + type + '-submit-btn').prop('disabled', false);
			}
		});


		$('#search-menu2-customer-table').on('draw.dt', function (e) {
			setTimeout(function () {
				resize();
			}, 500);
		});

		$('#search-menu2-customer-table tbody').on('click', 'tr', function (e) {
			customerTable.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
			$(this).addClass('highlight')
		});
		$('#search-menu2-customer-table tbody').on('click', '.create', function (e) {
			e.preventDefault();
			var data = customerTable.row($(this).parents('tr')).data();
			addCase(data.Customer_Id, data);
		});

		$('#search-menu2-customer-table tbody').on('click', '.search-case', function (e) {
			$(this).prop('disabled', true);
			e.preventDefault();
			var data = customerTable.row($(this).parents('tr')).data();
			addCaseAutoSearchTable('menu2', data, this);
		});
	}
	
	
	
}


function handleCaseManualSearchResponse(r)
{
	 var type = "case";
	 if (!/^success$/i.test(r.result || "")) {
		console.log("handle case manual search");
		console.log("error /n" + r ? r : '');
		$('#' + type + '-submit-btn').prop('disabled', false);		
	} else {
		var menu3CaseDetails = r.details;
		var menu3Table = $('#search-menu3-case-table').DataTable({
			data: menu3CaseDetails,
			lengthChange: true,
			"lengthMenu": [5, 10, 50],
			language: {
				"paginate": {
					"previous": "PREV"
				}
			},
			aaSorting: [
				[2, "desc"]
			],
			// pageLength: recordPerPage,
			searching: false,
			columnDefs: [{
				targets: 0,
				data: null,
				// colVis: false,
				defaultContent: '<i title="' + langJson['l-search-update-case'] + '" class="fas fa-edit table-btn select" data-toggle="tooltip"></i>',
				className: 'btnColumn',
				// className: 'noVis', //NOTES: no column visibility
				orderable: false,
			}, {
				targets: 4,
				render: function (data, type, row) {
					if (data.length > 0) {
						return data.replace(/[_]/g, " ");
					} else {
						return 'Manual Update';
					}
				}
			}, {
				targets: 6,
				render: function (data, type, row) {
					var escalatedTo = row.Escalated_To;
					if (escalatedTo != null) {
						return 'Escalated to ' + '<span style="color:green">' + getAgentName(escalatedTo) + ' (ID: ' + escalatedTo + ')<span>'
					} else {
						return data
					}
				}
				// }, {
				//     targets: 6,
				//     render: function (data, type, row) {
				//         return getAgentName(data || '') + ' (' + data + ')';
				//     }
			}, {
				targets: 2,
				render: function (data, type, row) {
					var DateWithoutDot = data.slice(0, data.indexOf("."));
					return DateWithoutDot.replace('T', ' ');
				}
			}],
			columns: [{
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
				//{ title: langJson["l-search-revised-by"], data: "Case_Updated_By" },
				{
					title: langJson["l-form-details"],
					data: "Details"
				}, {
					"className": 'details-control',
					"orderable": false,
					"data": null,
					"defaultContent": ''
				}
			],
			initComplete: function (settings, json) {
				resize();
				$('#' + type + '-submit-btn').prop('disabled', false);
			}
		});		


		// Add event listener for opening and closing details
		$('#search-menu3-case-table').on('click', 'td.details-control', function () {
			var tr = $(this).closest('tr');
			var row = menu3Table.row(tr);

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

		$('#search-menu3-case-table').on('draw.dt', function (e) {
			setTimeout(function () {
				resize();
			}, 500);
		});

		$('#search-menu3-case-table tbody').on('click', 'tr', function (e) {
			menu3Table.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
			$(this).addClass('highlight')
		});

		$('#search-menu3-case-table tbody').on('click', '.select', function () {
			var data = menu3Table.row($(this).parents('tr')).data();
			UpdateCase(data);
		});
	}	
	
}

function isInteger(num) { //Number.isInteger only work on Chrome, not IE, so have this function
    return (num ^ 0) === num;
}

function addCase(customerId, rowData) { // for newCustomerCase customerId: -1, rowData: null
    var dataObj = {
        // Conn_Id: connId,
        Customer_Id: customerId,
        Agent_Id: loginId,
        Call_Type: callType,
        Type_Details: ((details || '').slice(0, 150)),
        Token: token
    }
    if (!isSocial && connId != -1) {
        var connIdInt = parseInt(connId);
        if (isInteger(connIdInt) === false) {
            connIdInt = -1;
        }
        dataObj.Conn_Id = connIdInt;
    } else {
        dataObj.Conn_Id = -1
    }
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/AddCustomerCase',
        data: JSON.stringify(dataObj),
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
            if (isSocial) {
                parent.document.getElementById("input-form-" + connId).setAttribute("customerId", newCustomerId);
                parent.document.getElementById("input-form-" + connId).setAttribute("internalCaseNo", internalCaseNo);
            } else {
                parent.document.getElementById("input-form").setAttribute("customerId", newCustomerId);
                parent.document.getElementById("input-form").setAttribute("internalCaseNo", internalCaseNo);
            }
            if (customerId == -1) {
                parent.type = 'newCustomer';
                parent.customerData = null;
            } else {
                parent.type = 'newCase';
                parent.customerData = rowData;
            }
            parent.openInputForm(connId, callType, internalCaseNo, campaign, rowData, newCustomerId); // rowData is only for social media now
        }
    });
}

function UpdateCase(rowData) {
    var customerId = rowData.Customer_Id;
    var internalCaseNo = rowData.Internal_Case_No;
    if (isSocial) {
        parent.document.getElementById("input-form-" + connId).setAttribute("customerId", customerId);
        parent.document.getElementById("input-form-" + connId).setAttribute("internalCaseNo", internalCaseNo);
        parent.document.getElementById("input-form-" + connId).setAttribute("caseNo", rowData.Case_No || -1);
    } else {
        parent.document.getElementById("input-form").setAttribute("customerId", customerId);
        parent.document.getElementById("input-form").setAttribute("internalCaseNo", internalCaseNo);
        parent.document.getElementById("input-form").setAttribute("caseNo", rowData.Case_No || -1);
    }
    // parent.caseNo = rowData.Case_No || -1;
    if (rowData != null) {
        parent.customerData = rowData;
    }
    parent.type = 'newUpdate';
    parent.openInputForm(connId, callType, internalCaseNo, campaign, rowData, customerId); // rowData is only for social media now
}
// "New case for new customer" button clicked
function newCCClick() {
    addCase(-1, null);
}
// function to resize this search iframe
function resize() {
    var body = document.body,
        html = document.documentElement;
    var newHeight = Math.ceil(Math.max(body.scrollHeight, body.offsetHeight,
        html.offsetHeight)) || 500;
    if (isSocial) {
        parent.document.getElementById("search-" + connId).height = newHeight + 'px'; //將子頁面高度傳到父頁面框架
    } else {
        var inputForm = parent.document.getElementById("search");
        if (inputForm) {
            inputForm.height = newHeight + 'px'; //將子頁面高度傳到父頁面框架
        }
    }
    if (parent.resize) {
        parent.resize();
    }
}

function searchInputPressed(e, type) { //type: 'customer' or 'case'

    // if pressed enter
    if (e.keyCode == 13) {
        e.preventDefault();

        // if this is the last row
        if (!$('#' + type + '-submit-btn').prop('disabled')) {
            submitClicked(type);
        }
        return false;
    }
}

function returnFieldName(callType) {
    if (callType == 'Inbound_Email') {
        return "Email";
    } else if (callType == 'Inbound_Call' || callType == 'Inbound_Voicemail' || callType == 'Inbound_Fax') {
        return "All_Phone_No"
    }
}

function returnSocialSearchArr(isCase) { // isCase == true: Case Search, isCase === false: Customer Search 
    var searchArr = [];
    details = unescape(details);
    if (callType == 'Inbound_Webchat') {
        var detailsArr = details.split(',');
        var detailsArrLength = detailsArr.length;
        var webchatFields = window.frameElement.getAttribute("webchatFields");
        // make webchatFieldsObj
        var webchatFieldsArr = webchatFields.split(',');
        var webchatFieldsObj = {};
        for (let fieldStr of webchatFieldsArr) {
            var theField = fieldStr.split(':');
            var fieldName = theField[0];
            var searchName = theField[1];
            webchatFieldsObj[fieldName] = searchName;
        }
        if (detailsArrLength > 0) {
            for (var i = 0; i < detailsArrLength; i++) {
                var theInfo = detailsArr[i];
                var theInfoArr = theInfo.split(':');
                var infoName = theInfoArr[0];
                var infoValue = unescape(theInfoArr[1] || '').replace(/&nbsp;/g, ' ');
                // if have value of the info field, add to search array
                // if the name is not system name will have error
                if (infoValue != null && infoValue.length > 0 && webchatFieldsObj[infoName] != undefined) {
                    var fieldName = webchatFieldsObj[infoName];
                    if (isCase) {
                        searchArr.push({
                            "list_name": "Contact List",
                            "field_name": fieldName,
                            "logic_operator": "is",
                            "value": infoValue,
                            "field_type": null
                        });
                    } else {
                        searchArr.push({
                            "field_name": fieldName,
                            "logic_operator": "is",
                            "value": infoValue,
                            "field_type": null
                        });
                    }
                }
            }
        }
    }
    // search facebook or wechat id also
    if (callType == 'Inbound_Facebook' || callType == 'Inbound_Wechat') {
        var enduserId = window.frameElement.getAttribute("enduserId");
        // /Ticket/GetTicketMsg does not provide enduser_id, so incomplete cases cannot auto search
        if (enduserId) {
            
			//20250520 for Extract this nested ternary operation into an independent statement.
			//var idName = callType == 'Inbound_Facebook' ? 'Facebook_Id' : (callType == 'Inbound_Whatsapp' ? 'Whatsapp_Id' : 'Wechat_Id');
			var idName;
			if (callType === 'Inbound_Facebook') {
				idName = 'Facebook_Id';
			} else if (callType === 'Inbound_Whatsapp') {
				idName = 'Whatsapp_Id';
			} else {
				idName = 'Wechat_Id';
			}

            if (isCase) {
                searchArr.push({
                    "list_name": "Contact List",
                    "field_name": idName,
                    "logic_operator": "is",
                    "value": enduserId,
                    "field_type": null
                });
            } else {
                searchArr.push({
                    "field_name": idName,
                    "logic_operator": "is",
                    "value": enduserId,
                    "field_type": null
                });
            }
        }
    } else if (callType == 'Inbound_Whatsapp') {
        var enduserId = window.frameElement.getAttribute("enduserId");
        if (enduserId) {
            var phoneNo = enduserId.replace('whatsapp:+852', '').replace('whatsapp:+', '').replace('852', '');
            if (isCase) {
                searchArr.push({
                    "list_name": "Contact List",
                    "field_name": "All_Phone_No",
                    "logic_operator": "is",
                    "value": phoneNo,
                    "field_type": null
                });
            } else {
                searchArr.push({
                    "field_name": "All_Phone_No",
                    "logic_operator": "is",
                    "value": phoneNo,
                    "field_type": null
                });
            }
        }
    }
    return searchArr;
}

function generateManualSearchTbl(customerData) {
    var customerTable = $('#auto-search-table').DataTable({
        data: customerData,
        lengthChange: true,
        "lengthMenu": [5, 10, 50],
        language: {
            "paginate": {
                "previous": "PREV"
            }
        },
        aaSorting: [], // no initial sorting
        // pageLength: recordPerPage,
        searching: false,
        columnDefs: [{
            targets: 0,
            colVis: false,
            defaultContent: '<i title="' + langJson['l-search-create-case'] + '" class="fas fa-edit table-btn create" data-bs-toggle="tooltip"></i>',
            className: 'btnColumn',
            // className: 'noVis', //NOTES: no column visibility
            orderable: false,
        }, {
            targets: 1,
            // defaultContent: "<button class='update'>Update Case</button>",
            // className: 'noVis', //NOTES: no column visibility
            orderable: false,
            render: function (data, type, row) {
                if (data) {
                    return '<i title="' + langJson['l-search-search-case-to-update'] + '" class="table-btn fas fa-search-plus search-case" data-bs-toggle="tooltip"></i>';
                } else {
                    return ''
                }
            },
            className: 'btnColumn'
        }],
        columns: [{
            title: "",
            data: null
        }, {
            title: "",
            data: 'have_case'
        }, {
            title: langJson['l-search-customer-id'],
            data: 'Customer_Id'
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
        }, {
            title: langJson['l-search-email'],
            data: "Email"
        }],
        initComplete: function (settings, json) {
            resize();
        }
    });

    $('#auto-search-table').on('draw.dt', function (e) {
        setTimeout(function () {
            resize();
        }, 500);
    });

    $('#auto-search-table tbody').on('click', 'tr', function (e) {
        customerTable.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
        $(this).addClass('highlight')
    });

    $('#auto-search-table tbody').on('click', '.create', function (e) {
        e.preventDefault();
        var data = customerTable.row($(this).parents('tr')).data();
        addCase(data.Customer_Id, data);
    });

    $('#auto-search-table tbody').on('click', '.search-case', function (e) {
        $(this).prop('disabled', true);
        e.preventDefault();
        var data = customerTable.row($(this).parents('tr')).data();
        addCaseAutoSearchTable('home', data);
    });
}

function generateCaseManualSearchTbl(caseDetails) {
    var caseTbl = $('#auto-case-table').DataTable({
        data: caseDetails,
        lengthChange: true,
        lengthMenu: [5, 10, 50],
        language: {
            "paginate": {
                "previous": "PREV"
            }
        },
        aaSorting: [
            [2, 'desc']
        ], // no initial sorting
        // pageLength: recordPerPage,
        searching: false,
        columnDefs: [{
            targets: 0,
            data: null,
            // colVis: false,
            defaultContent: '<i title="' + langJson['l-search-update-case'] + '" class="fas fa-edit table-btn select" data-bs-toggle="tooltip"></i>',
            className: 'btnColumn',
            // className: 'noVis', //NOTES: no column visibility
            orderable: false,
        }, {
            targets: 4,
            render: function (data, type, row) {
                if (data.length > 0) {
                    return data.replace(/_/g, " ");   //  return data.replace(/[_]/g, " ");       // 20250409 Replace this character class by the character itself.
                } else {
                    return 'Manual Update';
                }
            }
        }, {
            targets: 6,
            render: function (data, type, row) {
                var escalatedTo = row.Escalated_To;
                if (escalatedTo != null) {
                    return 'Escalated to ' + '<span style="color:green">' + getAgentName(escalatedTo) + ' (ID: ' + escalatedTo + ')<span>'
                } else {
                    return data
                }
            }
        }, {
            targets: 2,
            render: function (data, type, row) {
                var newData = data ? data.replace(/T/g, " ") : '';    //  var newData = data ? data.replace(/[T]/g, " ") : '';    // 20250409 Replace this character class by the character itself.
                var indexOfDot = newData.indexOf('.');
                if (indexOfDot > -1) {
                    return newData.slice(0, indexOfDot);
                } else {
                    return newData;
                }
            }
        }],
        initComplete: function (settings, json) {
            // if not case mode resize when manual search completed
            // if (caseMode) {
            resize();
            // }
        },
        columns: [{
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
            //{ title: langJson["l-search-revised-by"], data: "Case_Updated_By" },
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

    // $('#auto-case-table').find('i[data-bs-toggle="popover"]').popover();

    // Add event listener for opening and closing details
    $('#auto-case-table').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = caseTbl.row(tr);

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

    $('#auto-case-table').on('draw.dt', function (e) {
        setTimeout(function () {
            resize();
        }, 500);
    });

    $('#auto-case-table tbody').on('click', 'tr', function (e) {
        caseTbl.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
        $(this).addClass('highlight')
    });

    $('#auto-case-table tbody').on('click', '.select', function () {
        var data = caseTbl.row($(this).parents('tr')).data();
        UpdateCase(data);
    });

    if (caseDetails.length == 1 && openCaseNo.length > 0) { // only 1 result & caused by ivr entered case no. will open the case
        $("#auto-case-table>tbody>tr:first>td:first>.select").trigger('click');
    }
}

function loadGrid() { // (connId, callType, details) {

    var searchArr = [];

    if ((isSocial || callType == 'Inbound_Webchat' || callType == 'Inbound_Facebook' || callType == 'Inbound_Wechat' || callType == 'Inbound_Whatsapp')) {
        searchArr = returnSocialSearchArr(false)
    } else if (details.length > 0) {
        searchArr = [{
            "field_name": returnFieldName(callType),
            "logic_operator": "is",
            "value": details,
            "field_type": null
        }]
    } else if (replyDetails.length > 0 && $.isNumeric(replyDetails)) { // for incomplete cases
        searchArr = [{
            "field_name": 'All_Phone_No',
            "logic_operator": "is",
            "value": replyDetails,
            "field_type": null
        }]
    }

    if (searchArr.length == 0) {
        generateManualSearchTbl([]);
    //} else {      //20250410 'If' statement should not be the only statement in 'else' block
    } else if (!caseMode) {     
            $.ajax({
                type: "POST",
                // url: config.companyUrl + '/api/AutoSearch',
                // data: JSON.stringify({ "Call_Type": callType, "Details": details, "Is_Valid": "Y" }),
                url: config.companyUrl + '/api/ManualSearch',
                data: JSON.stringify({
                    "anyAll": "any",
                    "Is_Valid": "Y",
                    "searchArr": searchArr,
                    Agent_Id: loginId,
                    Token: token
                }),
                crossDomain: true,
                contentType: "application/json",
                dataType: 'json'
            }).always(function (r) {
                if (!/^success$/i.test(r.result || "")) {
                    console.log("error at AutoSearch");
                } else {
                    var customerArr = r.details;
                    generateManualSearchTbl(customerArr);
                    if ((callType == 'Inbound_Facebook' || callType == 'Inbound_Wechat') && customerArr.length == 1) {
                        var theCustomer = customerArr[0];
                        // 1/3 disable other tabs and add customr button
                        $('.to-be-disabled').addClass('disabled-class');
                        // 2/3 add the name to content div & update name of parent's bubble
                        var formName = theCustomer.Name_Eng
                        parent.$('#content-inner-scroll-' + connId).attr('formName', formName);
                        parent.addFormNameToContent(connId, formName);
                        // 3/3 add photo to parent
                        $.ajax({
                            url: config.companyUrl + '/api/GetPhoto',
                            type: "POST",
                            data: JSON.stringify({
                                "Customer_Id": theCustomer.Customer_Id,
                                Agent_Id: loginId,
                                Token: token
                            }),
                            crossDomain: true,
                            contentType: "application/json",
                            dataType: 'json',
                            success: function (r) {
                              /*var rDetails = r.details;			//20250415 Remove this useless assignment to variable "photoSrcString".
                                // if no photo the result will be fail now
                                var photoType = rDetails.Photo_Type;
                                var photoSrcString = './images/user.png';
                                if (photoType != null) {
                                    photoSrcString = "data:" + rDetails.Photo_Type + ";base64," + rDetails.Photo_Content;
                                }*/ 
                            },
                            error: function (err) {
                                console.log(err);
                            }
                        });
                    }
                }
            });
        //} //20250410 for else if 
    }
    // when tab changed resize iframe
    // $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
    //     resize();
    // });

    // incomplete cases isSocial will be false
    var caseSearchArr = [];
    if (openCaseNo.length > 0) { // if search crn, will not show phone number
        caseSearchArr = [{
            "list_name": "Case List",
            "field_name": 'Internal_Case_No',
            "logic_operator": "is",
            "value": Number(openCaseNo),
            "field_type": 'number'
        }]
    } else if (isSocial || callType == 'Inbound_Webchat') {
        caseSearchArr = returnSocialSearchArr(true)
  //  } else {      //20250410 'If' statement should not be the only statement in 'else' block
    } else if (details.length > 0) {
            caseSearchArr = [{
                "list_name": "Contact List",
                "field_name": returnFieldName(callType),
                "logic_operator": "is",
                "value": details,
                "field_type": null
            }]
     } else if (replyDetails.length > 0 && $.isNumeric(replyDetails)) { // for incomplete cases
            caseSearchArr = [{
                "list_name": "Contact List",
                "field_name": 'All_Phone_No',
                "logic_operator": "is",
                "value": replyDetails,
                "field_type": null
            }]
       // }// 20250410 for else if
    }

    if (caseSearchArr.length == 0) {
        generateCaseManualSearchTbl([]);
    } else {
        $.ajax({
            type: "POST",
            url: config.companyUrl + '/api/CaseManualSearch',
            data: JSON.stringify({
                "anyAll": "any",
                "Is_Valid": "Y",
                "searchArr": caseSearchArr,
                Agent_Id: loginId,
                Token: token
            }),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log("error CaseAutoSearch")
            } else {
                generateCaseManualSearchTbl(r.details);
            }
        });
    }
}

function selectChange(type, iThis) {
    var selected = $(iThis).find('option:selected'); // the selected option tag
    // var selectedValue = selected[0].value;  // 20250414 Remove the declaration of the unused 'selectedValue' variable.
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
                buttonImage: "./images/calendar-grid-30.svg",
                buttonStyle: 'height:1000px',
                buttonImageOnly: true,
                buttonText: "Select date",
                dateFormat: 'yy/mm/dd',
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
            selectedInput.attr("placeholder", "");
            selectedInput.datepicker("destroy");
            selectedInput.removeClass("hasDatepicker").removeAttr('id');
        }
    }
}
// build contact first than contact
function buildCRMFields(rDetails) {
    var contactTable = rDetails['Contact Table'] || [];
    var contactCombined = rDetails['Contact Combined'] || [];
    var contactSystem = rDetails['Contact System'] || [];
    // ==================== Condition Drop Down: Case List insert  ====================
    // var caseList = rDetails['Case List'];
    var caseTable = rDetails['Case Table'] || [];
    var caseSystem = rDetails['Case System'] || []; // to avoid loop error need || []
    $(".case-search-condition").append('<option disabled="disabled" value="" selected="selected">=== Case List ===</option>');
    for (let option of caseTable) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".case-search-condition").append('<option style="color:blue" list="Case List" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display.replace('_', '&nbsp;') + '</option>');
    }
    for (let option of caseSystem) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".case-search-condition").append('<option style="color:purple" list="Case List" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
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
        $(".customer-search-condition").append('<option style="color:blue" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
        $(".case-search-condition").append('<option style="color:blue" list="Contact List" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    for (let option of contactCombined) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        // customer search
        $(".customer-search-condition").append('<option style="color:green" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
        $(".case-search-condition").append('<option style="color:green" list="Contact List" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    for (let option of contactSystem) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".customer-search-condition").append('<option style="color:purple" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
        $(".case-search-condition").append('<option style="color:purple" list="Contact List" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    $(".customer-search-condition").attr('onchange', 'selectChange("customer", this);');
}
// build case first then contat
function buildCaseFields(rDetails) {
    var contactTable = rDetails['Contact Table'] || [];
    var contactCombined = rDetails['Contact Combined'] || [];
    var contactSystem = rDetails['Contact System'] || [];
    // ==================== Condition Drop Down: Contact List insert  ====================
    // $(".case-search-condition").append('<option disabled="disabled" value="">=== Customer List ===</option>');
    for (let option of contactTable) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".customer-search-condition").append('<option style="color:blue" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
        $(".case-search-condition").append('<option style="color:blue" list="Contact List" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    for (let option of contactCombined) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".customer-search-condition").append('<option style="color:green" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
        $(".case-search-condition").append('<option style="color:green" list="Contact List" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    for (let option of contactSystem) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".customer-search-condition").append('<option style="color:purple" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
        $(".case-search-condition").append('<option style="color:purple" list="Contact List" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    $(".customer-search-condition").attr('onchange', 'selectChange("customer", this);');
    // ==================== Condition Drop Down: Case List insert  ====================
    var caseTable = rDetails['Case Table'] || [];
    var caseSystem = rDetails['Case System'] || [];
    for (let option of caseTable) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".case-search-condition").append('<option style="color:blue" list="Case List" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display.replace('_', '&nbsp;') + '</option>');
    }
    for (let option of caseSystem) {
        var fieldTag = option.Field_Tag;
        var fieldOptionsStr = '';
        if (fieldTag == 'select') {
            var jsonFieldOptions = JSON.stringify(option.Field_Options);
            fieldOptionsStr = " fieldOptions='" + jsonFieldOptions + "'";
        }
        $(".case-search-condition").append('<option style="color:purple" list="Case List" type=' + option.Field_Type + ' tag=' + fieldTag + ' value=' + option.Field_Name + fieldOptionsStr + '>' + option.Field_Display + '</option>');
    }
    $(".case-search-condition").attr('onchange', 'selectChange("case", this);');
}

function loadFields() {
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/GetFields',
        data: JSON.stringify({
            "listArr": ['Contact Table', 'Contact Combined', 'Contact System', 'Case Table', 'Case System'],
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        var rDetails = r.details;
        if (!/^success$/i.test(r.result || "")) {
            console.log(rDetails || r || '');
        //} else {      //20250410 'If' statement should not be the only statement in 'else' block
        } else if (rDetails != undefined) {
                if (caseMode) {
                    buildCaseFields(rDetails);
                } else {
                    buildCRMFields(rDetails);
                }
           // }//   //20250410 for else if 
        }
    });
}
$(document).ready(function () {
    setLanguage();
    if (parent.parent.iframeRecheck) {
        parent.parent.iframeRecheck($(parent.document));
    }
    // when tab changed resize iframe
    $('a.nav-link').on('click', function (e) {
        $('.tab-pane').removeClass('in active');
        var href = $(this).attr('href');
        $(href).addClass('in active');
//        setTimeout(function () {
 //           resize(), 300
 //       });
        setTimeout(function () {resize() }, 300 );
    });
});
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());