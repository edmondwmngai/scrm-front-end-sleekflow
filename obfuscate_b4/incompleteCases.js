var loginId = parseInt(sessionStorage.getItem('scrmAgentId')) || -1;
var token = sessionStorage.getItem('scrmToken') || '';

//20250320 Unexpected constant truthiness on the left-hand side of a `||` expression.
//var recordPerPage = sessionStorage.getItem('scrmCaseLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5 || 5;
var recordPerPage = sessionStorage.getItem('scrmCaseLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5;


var campaign = parent.campaign; // = window.frameElement.getAttribute("campaign") || '';
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var selectedId = -1;
var caseTbl;

var confirmClicked = function () {
    $(this).prop('disabled', true);
    var rows = caseTbl.rows({
        'search': 'applied'
    }).nodes();
    var selectedRows = $('input[type="checkbox"]:checked', rows);
    if (selectedRows.length == 0) {
        alert('Please select the media(s) which you want to mark it to be invalid');
    }
    var selectedRowsLength = selectedRows.length;
    for (let selected of selectedRows) {
        var connId = $(selected).val();
        $.ajax({
            type: "POST",
            url: config.companyUrl + '/api/SaveCallHistory',
            data: JSON.stringify({
                "Conn_Id": Number(connId),
                "Agent_Id": loginId,
                "Token": token,
                "Is_Saved": "Y"
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (r) {
                if (!/^success$/i.test(r.result || "")) {
                    console.log('error in callSaveCallHistory');
                    console.log(r.details);
                }
            },
            error: function (r) {
                console.log('error in callSaveCallHistory');
                console.log(r);
            },
        }).done(function () {
            // Reload Incomlete Cases Table
            selectedRowsLength = selectedRowsLength - 1;
            if (selectedRowsLength == 0) {
                parent.titleClicked('incompleteCases');
                $(this).prop('disabled', false);
            }
        });
    }
};

// function to resize this search iframe
function resize() {
    var newHeight;
    var body = document.body,
        html = document.documentElement;

    newHeight = Math.ceil(Math.max(body.scrollHeight, body.offsetHeight, html.offsetHeight)) || 390;
    var menuLowerFrame = parent.document.getElementById('search');
    if (menuLowerFrame) {
        menuLowerFrame.height = newHeight;
    }
}

function setLanguage() {
    $('.l-menu-incomplete-cases').text(langJson['l-menu-incomplete-cases']);
    $('.l-menu-update-case').attr('title', langJson['l-menu-update-case']);
    $('.l-incopmlete-mark-invalid').text(langJson['l-incopmlete-mark-invalid']);
}

function updateCase(rowData) {
    var iframeInputForm = document.getElementById('input-form');
    var lowerPartContainer = $('#lower-part-container');
    window.customerData = rowData;
    window.caseNo = rowData.Case_No;
    window.customerId = rowData.Customer_Id;
    window.type = 'newUpdate';
    if (lowerPartContainer.length > 0) {
        lowerPartContainer.remove();
    }
    iframeInputForm.style.display = 'block';
    iframeInputForm.src = './campaign/' + campaign + "/inputForm.html";
}

// To open search.html for Inbound_Webchat needs to load webchatfields
function getWebchatFields(data) {
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/GetFields',
        data: JSON.stringify({
            "listArr": ["Webchat Fields"],
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
        //} else {  // 20250410 'If' statement should not be the only statement in 'else' block
        } else if (rDetails != undefined) {
                var webchatFieldsStr = '';
                var webchatFields = rDetails['Webchat Fields'] || [];
                if (webchatFields != undefined && webchatFields.length > 0) {
                    for (var i = 0; i < webchatFields.length; i++) {
                        if (i != 0) {
                            webchatFieldsStr += ',';
                        }
                        var fieldName = SC.handleFrameDetails(webchatFields[i].Field_Name);
                        var fieldValue = SC.handleFrameDetails(webchatFields[i].Field_Display);
                        webchatFieldsStr += (fieldName + ':' + fieldValue);
                    }
                }
                parent.showSearch(data, webchatFieldsStr);
           // }// 20250410 for else if 
        }
    });
}

function windowOnload(removeOriginal) {
    $('#lower-part-table').attr('data-page-length', recordPerPage);
    var incompleteCasesArr = parent.incompleteCasesArr;
    var totalRecordLength = incompleteCasesArr.length;
    caseTbl = $('#lower-part-table').DataTable({
        data: incompleteCasesArr,
        lengthChange: false,
        aaSorting: [
            [1, "desc"]
        ],
        // pageLength: recordPerPage,
        searching: false,
        //buttons: [{ extend: 'colvis', columns: ':not(.noVis)' }],
        columnDefs: [{
            targets: 0,
            data: null,
            // colVis: false,
            defaultContent: '<i class="fas fa-edit table-btn select l-menu-update-case" data-bs-toggle="tooltip" title="Update"></i>',
            className: 'btnColumn',
            // className: 'noVis', //NOTES: no column visibility
            orderable: false,
        }, {
            targets: 1,
            render: function (data, type, row) {
                var newData = data.replace(/T/g, " ");    //  var newData = data.replace(/[T]/g, " ");    // 20250409 Replace this character class by the character itself.
                var indexOfDot = newData.indexOf('.');
                if (indexOfDot > -1) {
                    return newData.slice(0, indexOfDot);
                } else {
                    return newData;
                }
            }
        }, {
            targets: 2,
            render: function (data, type, row) {
                return (row.Call_Type || '').replace("Inbound_", "") + " " + (row.Type_Details || '');
            }
        }, {
            targets: 3,
            render: function (data, type, row) {
                return (row.Reply_Type || '').replace("Outbound_", "") + " " + (row.Reply_Details || '');
            }
        }, {
            targets: 4,
            render: function (data, type, row) {
                if (data != null) {
                    return parent.parent.parent.getAgentName(data)
                } else {
                    return data
                }
            }
        }, {
            'targets': 6,
            'searchable': false,
            'orderable': false,
            'render': function (data, type, row, meta) {
                return '<div class="form-check" style="margin-top:-15px">' +
                    '<label class="form-check-label">' +
                    '<input class="form-check-input" type="checkbox" id="' + data + '" value="' + data + '">' +
                    '<span class="form-check-sign"><span class="check" data-bs-placement="right" title="Mark Invalid"></span></span></label></div>';
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
            // var header = '<h5>' +
            //     '<i class="far fa-folder-open title-icon me-2"></i>Incomplete Call Cases' +
            //     '</h5>';
            // $(header).insertBefore('#lower-part-table')
            resize();
        },
        columns: [{
            title: ""
        }, {
            title: langJson['l-search-date-time'],
            data: "Updated_Time"
        }, {
            title: langJson['l-search-inbound-type']
        }, {
            title: langJson['l-form-outbound-type']
        }, {
            title: langJson['l-search-agent-name'],
            data: "Updated_By"
        }, {
            title: langJson['l-search-agent-id'],
            data: "Updated_By"
        }, {

            // NO DEL This is for select all, not sure will it be needed in future
            // title: '<div class="form-check" style="margin-top:-8px">' +
            //     '<label class="form-check-label">' +
            //     '<input id="select-all" class="form-check-input" type="checkbox">' +
            //     '<span class="form-check-sign"><span class="check"></span></span></label></div>',
            // /NO DEL
            
            title: '<div class="form-check" style="margin-top:-8px">' +
            '<label class="form-check-label">' +
            '<input id="select-all" class="form-check-input" type="checkbox">' +
            '<span class="form-check-sign"><span class="check"></span></span></label></div>',
            data: 'Conn_Id'
        }]
    });

    setLanguage();

    $('#lower-part-table tbody').on('click', '.form-check', function (e) {

        // added this to prevent click the whole row
        e.stopPropagation();

        // select all tick or not
        var rows = caseTbl.rows({
            'search': 'applied'
        }).nodes();
        if (rows.length > 0) {

            var selectedRows = $('input[type="checkbox"]:checked', rows);

            if (selectedRows.length > 0) {
                $('#confirm-btn').removeClass('disabled');
            } else {
                $('#confirm-btn').addClass('disabled');
            }

            if (selectedRows.length == totalRecordLength) {
                $('#select-all').prop('checked', true);
            } else {
                $('#select-all').prop('checked', false);
            }
        }
    });

    $('#lower-part-table th').on('click', '.form-check', function (e) {
        e.stopPropagation();
        // Get all rows with search applied
        var rows = caseTbl.rows({
            'search': 'applied'
        }).nodes();
        // Check/uncheck checkboxes for all rows in the table
        var selectedAllChecked = $('#select-all').prop('checked');
        if (selectedAllChecked){
            $('#confirm-btn').removeClass('disabled');
        } else {
            $('#confirm-btn').addClass('disabled');
        }
        $('input[type="checkbox"]', rows).prop('checked', selectedAllChecked);
    });

    $('#lower-part-table').on('click', 'tr', function (e) {
        e.preventDefault();
        var data = caseTbl.row($(this)).data();
        // if no recocord in Datatable, should not select the first line
        if (data == undefined) {
            return;
        }
        var connId = data.Conn_Id ? data.Conn_Id : data.Reply_Conn_Id;
        // no need to select once more time if the row already selected
        if (selectedId != connId) {
            selectedId = connId;
            caseTbl.$('tr.highlight').removeClass('highlight');  // $('xxx tbody tr) will not select other pages not showing, do not use this selector
            $(this).addClass('highlight');
            // if the case is manual create/update, Conn_id = Reply_Conn_Id & call type = ''
            if (data.Call_Type.length != 0 || data.Reply_Type.length != 0) {
                if (data.Reply_Type == 'Outbound_Call') {
                    parent.openMedia(parent.returnMediaType(data.Reply_Type), data.Reply_Conn_Id, null, null, data.Reply_Details);
                } else {
                    parent.openMedia(parent.returnMediaType(data.Call_Type), data.Conn_Id, null, null, data.Type_Details);
                }
            }
        }
    });
    // "Update Case" button clicked in the table
    $('#lower-part-table tbody').on('click', '.select', function (e) {
        e.preventDefault();
        var data = caseTbl.row($(this).parents('tr')).data();
       // var internalCaseNo = data.Internal_Case_No;	// 20250415 Remove this useless assignment to variable "internalCaseNo".
        // changed logic all open search no matter used case before or not
        parent.frameElement.setAttribute('connId', data.Conn_Id);

        var ivrInfo = data.IVR_Info;
        if (ivrInfo && ivrInfo.length > 0) {
            parent.frameElement.setAttribute('ivrInfo', ivrInfo);
        }

        if (data.Call_Type != 'Inbound_Call' && data.Reply_Type != 'Outbound_Call') {
            // confirm not opening the input form @ social media first
            var searchOrInput = parent.parent.document.getElementById('social-media-main').contentWindow.$('#search-input-' + data.Conn_Id);
            if (searchOrInput.length == 0) {
                getWebchatFields(data);
            } else {
                alert('Please go to Social Media to create/update case for this media');
            }
        } else {
            parent.showSearch(data);
        }
    });
    // every time page change select the first record
    $('lower-part-table').on('draw.dt', function (e) {
        e.preventDefault();
        // remove original page rows highlight
        caseTbl.rows().nodes().to$().removeClass('highlight');
        // select first record
        $("#lower-part-table tbody tr:eq(0)").trigger("click");
        $("#lower-part-table tbody tr:eq(0)").addClass("highlight");
    });
    $("#lower-part-table tbody tr:eq(0)").trigger("click");

    if (parent.parent.iframeRecheck) {
        parent.parent.iframeRecheck($(parent.document));
    }

    // define after boostrap-confirmation.js loaded
    $('[data-bs-toggle=confirmation]').confirmation({
        rootSelector: '[data-bs-toggle=confirmation]',
        popout: true,
        title: langJson['l-general-are-you-sure'],
        btnOkLabel: langJson['l-general-ok-label'],
        btnCancelLabel: langJson['l-general-cancel-label']
    });
}
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());