var listTable;
var recordPerPage = 5;
var selectedId = -1;
var openType = window.frameElement.getAttribute("openType") || ''; // "menu" or "traditional" or "social"
var agentId = parseInt(sessionStorage.getItem('scrmAgentId')) || -1;
var selectedAgent = openType == 'menu' ? window.frameElement.getAttribute("selected-agent") : agentId; // get list for this agent
var campaign = parent.frameElement.getAttribute("campaign") || '';
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
function resize() {
    var newHeight = $('.card').height() + 110;
    var parentSearch = openType == 'menu' ? parent.document.getElementById("input-form-fax") : parent.document.getElementById("search")
    parentSearch.height = newHeight + 'px'; //將子頁面高度傳到父頁面框架 // no need to add extra space
    if (parent.resize) {
        parent.resize(newHeight);
    }
}
function setLanguage() {
    $('.l-fax-fax-list').text(langJson['l-fax-fax-list']);
    $('.l-fax-transfer-to').text(langJson['l-fax-transfer-to']);
    $('.l-fax-confirm').text(langJson['l-fax-confirm']);
}

var changePageNo = function (no) {
    tiff.setDirectory(no - 1);
    var htmlCanvas = tiff.toCanvas();
    $("#tiff-image").attr("src", htmlCanvas.toDataURL());
}

function format(d, theTr, rowChild) {
    var rowStr = '<iframe id="media-content" mediaId="' + d.FaxID + '" src="./faxContent.html" width="100%" style="border: none;" noTop="Y"></iframe>';
    rowChild(rowStr).show();
    theTr.addClass('shown');
    resize();
}

function loadTbl(tableData) {
    var dateColIdx = openType != 'menu' ? 1 : 0;

    var columns = [
        { title: langJson['l-fax-date-time'], data: "CreateDateTime" },
        { title: langJson['l-fax-caller-display'], data: "CallerDisplay" },
    ]

    var columnDefs = [
        {
            targets: dateColIdx,
            render: function (data, type, row) {
                return data.replace('T', ' ');
            }
        }, {
            'targets': -1,
            'searchable': false,
            'orderable': false,
            'render': function (data, type, full, meta) {
                return '<div class="form-check" style="margin-top:-8px">' +
                    '<label class="form-check-label">' +
                    '<input class="form-check-input" type="checkbox" id="' + data + '" value="' + data + '">' +
                    '<span class="form-check-sign"><span class="check" data-bs-toggle="tooltip" data-bs-placement="right" title="' + langJson["l-fax-change-admin"] + '"></span></span></label></div>';
            }
        }
    ];

    if (openType != 'menu') {
        // Traditional Media --- 1st column select fax
        columns.unshift({ title: '', data: null });
        columnDefs.unshift(
            {
                targets: 0,
                defaultContent: '<i title="' + langJson['l-fax-select-fax'] + '" class="table-btn fas fa-search-plus create-or-update" data-bs-toggle="tooltip"></i>',
                orderable: false,
                className: 'btnColumn'
            }
        );
    } else {
        // Menu
        columns.push({
            "className": 'details-control',
            "orderable": false,
            "data": null,
            "defaultContent": ''
        });
        columnDefs.push({
            'targets': -1,
            'searchable': false,
            'orderable': false,
            'width': '1%',
            'className': 'dt-body-center',
            'render': function (data, type, full, meta) {
                return '<div class="form-check" style="margin-top:-8px">' +
                    '<label class="form-check-label">' +
                    '<input class="form-check-input" type="checkbox" id="' + data + '" value="' + data + '">' +
                    '<span class="form-check-sign"><span class="check" data-bs-toggle="tooltip" data-bs-placement="right" title="' + langJson['l-fax-change-admin'] + '"></span></span></label></div>';
            }
        });
    }

    columns.push({
        title: '<div class="form-check" style="margin-top:-8px">' +
            '<label class="form-check-label">' +
            '<input id="select-all" class="form-check-input" type="checkbox">' +
            '<span class="form-check-sign"><span class="check"></span></span></label></div>', data: "FaxID"
    });

    var aaSorting = [[1, "desc"]];
    if (openType == 'menu') {
        aaSorting = [[0, "desc"]];
    }

    var totalRecordLength = tableData.length;
    listTable = $('#media-list-table').DataTable({
        data: tableData,
        lengthChange: true, // not showing 'Show ? per page' dropdown
        "lengthMenu": [5, 10, 50],
        aaSorting: aaSorting,
        // pageLength: recordPerPage,
        searching: false,
        columnDefs: columnDefs,
        columns: columns,
        initComplete: function (settings, json) {
            resize();
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
        }
    });

    $('#media-list-table tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = listTable.row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
            resize();
        }
        else {
            // Open this row
            format(row.data(), tr, row.child);
            // row.child(format(row.data())).show();
            // tr.addClass('shown');
            // resize();
        }
    });

    // Handle click on checkbox
    $('#media-list-table tbody').on('click', '.form-check', function (e) {
        e.stopPropagation();
        var rows = listTable.rows({ 'search': 'applied' }).nodes();
        var selectedRows = $('input[type="checkbox"]:checked', rows);
        if (selectedRows.length == totalRecordLength) {
            $('#select-all').prop('checked', true);
        } else {
            $('#select-all').prop('checked', false);
        }
        if (selectedRows.length > 0) {
            $('.temp-disabled').prop('disabled', false);
        } else {
            $('.temp-disabled').prop('disabled', true);
        }
    });

    $('#media-list-table tbody').on('click', 'tbody tr[role="row"]', function (e) {
        // e.preventDefault();// no e.preventDefault because user may click the radio button at the same time
        var data = listTable.row($(this)).data();
        listTable.$('tr.highlight').removeClass('highlight');  // $('xxx tbody tr) will not select other pages not showing, do not use this selector
        $(this).addClass('highlight');
        var tel = data.CallerDisplay;
        if (openType != 'menu') {
            parent.getCallerSetting(tel);
            var connId = data.FaxID;
            if (selectedId != connId) {
                selectedId = connId;
                parent.openMedia('fax', connId, data.FilePath, data.CreateDateTime, tel);
            }
        }
    });

    $('#media-list-table tbody').on('click', '.create-or-update', function (e) {
        e.preventDefault();
        var data = listTable.row($(this).parents('tr')).data();
        var connId = data.FaxID;
        var details = Number(data.CallerDisplay || -1);
        parent.mediaContent = { FaxID: data.FaxID, FilePath: data.FilePath }
        var parentFrame = $(parent.window.frameElement);
        var tabIndex = parentFrame.attr('tab-index');
        var theTab = parent.parent.$('#traditional-tabs li a[tab-index=' + tabIndex + '] span');
        theTab.text('Fax-' + connId);
        parentFrame.attr('connId', connId);
        parentFrame.attr('details', details);
        parent.removeEmailList(connId, 'Inbound_Fax', details);
    });

    // every time page change select the first record
    $('#media-list-table').on('draw.dt', function (e) {
        e.preventDefault();
        // cancel previous page radio selection
        $('#media-list-table tbody tr td input[name="transferRadio"]').prop('checked', false);
        // remove original page rows highlight
        listTable.rows().nodes().to$().removeClass('highlight');
        // after sorting, select the 1st record if not empty
        var emptyTd = $("#media-list-table tbody tr:eq(0) td.dataTables_empty");
        if (emptyTd.length == 0) {
            $("#media-list-table tbody tr:eq(0)").trigger("click");
        }
        resize();
    });
    // first time select the first record if not empty
    var emptyTd = $("#media-list-table tbody tr:eq(0) td.dataTables_empty");
    if (emptyTd.length == 0) {
        $("#media-list-table tbody tr:eq(0)").trigger("click");
    }

    // Handle click on "Select all" control
    $('#select-all').on('click', function () {
        // Get all rows with search applied
        var rows = listTable.rows({ 'search': 'applied' }).nodes();
        // Check/uncheck checkboxes for all rows in the table
        var selectedAllChecked = this.checked;
        $('input[type="checkbox"]', rows).prop('checked', this.checked);
        if (selectedAllChecked) {
            $('.temp-disabled').prop('disabled', false);
        } else {
            $('.temp-disabled').prop('disabled', true);
        }
    });

    // Handle click on "Select all" control
    $('thead input[name="select_all"]', listTable.table().container()).on('click', function (e) {
        if (this.checked) {
            $('#media-list-table tbody input[type="checkbox"]:not(:checked)').trigger('click');
        } else {
            $('#media-list-table tbody input[type="checkbox"]:checked').trigger('click');
        }
        // Prevent click event from propagating to parent
        e.stopPropagation();
    });

    // Handle table draw event
    listTable.on('draw', function () {
        // Update state of "Select all" control
        // updateDataTableSelectAllCtrl(listTable);
    });
}

function faxOnload() {
    setLanguage();
    var dnis = openType == 'menu' ? window.frameElement.getAttribute("details") : parent.window.frameElement.getAttribute("details") || '';
    recordPerPage = sessionStorage.getItem('scrmCaseLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5 || 5;
    $('#media-list-table').attr('data-page-length', recordPerPage);

    $.ajax({
        type: 'POST',
        url: config.wiseHost + '/WisePBX/api/Fax/GetList',
        data: JSON.stringify({ "dnis": dnis, "agentId": selectedAgent || -1 }),
        crossDomain: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).always(function (res) {
        if (!/^success$/i.test(res.result || "")) {
            console.log("error /n" + res ? res : '');
            loadTbl([]);
        } else {
            var tableData = res.data;
            loadTbl(tableData);
        }
    });

    var agentList = openType == 'menu' ? parent.parent.parent.agentList : parent.parent.agentList;
    var agentSelect = $("#agent-list");
    for (let option of agentList) {
        var theAgentId = option.AgentID;
        if (theAgentId != selectedAgent) {
            agentSelect.append('<option LevelID=' + option.LevelID + ' value=' + theAgentId + '>' + option.AgentName + ' (ID: ' + theAgentId + ')</option>');
        }
    }
    if (parent.parent.iframeRecheck) {
        parent.parent.iframeRecheck($(parent.document));
    } else if (parent.parent.parent && parent.parent.parent.iframeRecheck) {
        parent.parent.parent.iframeRecheck($(parent.document));
    }
}
// Clicked 'Confirm' button which is next to [Transfer To:]
var confirmClicked = function () {
    var rows = listTable.rows({ 'search': 'applied' }).nodes();
    var selectedCheckbox = $('input[type="checkbox"]:checked', rows);
    var rowsSelected = [];
    var transferTo = document.getElementById('agent-list').value || '';
    var assignTo = Number(transferTo) || -1;
    // verify selected an agent to transfer to
    if (transferTo == null || transferTo.length == 0) {
        alert(langJson['l-alert-no-agent-transfer']);
        return;
    }
    for (let selected of selectedCheckbox) {
        rowsSelected.push($(selected).val());
    }
    // assign agent;
    if (openType == 'menu') {
        parent.parent.parent.assignAgent('Inbound_Fax', rowsSelected, assignTo, parent.confirmClicked);
    } else {
        parent.parent.assignAgent('Inbound_Fax', rowsSelected, assignTo, parent.windowOnload);
    }
}
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());