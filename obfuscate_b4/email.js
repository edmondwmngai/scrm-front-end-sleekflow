var listTable;
var recordPerPage = 5;
var selectedId = -1;
var openType = window.frameElement.getAttribute("openType") || ''; // "menu" or "traditional" or "social"
var agentId = parseInt(sessionStorage.getItem('scrmAgentId')) || -1;
var selectedAgent = openType == 'menu' ? window.frameElement.getAttribute("selected-agent") : agentId; // get list for this agent
var campaign = parent.frameElement.getAttribute("campaign") || '';
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};

function resize() {
    var newHeight = $('.card').height() + 100;
    var parentSearch = openType == 'menu' ? parent.document.getElementById("input-form-email") : parent.document.getElementById("search")

    //將子頁面高度傳到父頁面框架 // no need to add extra space
    parentSearch.height = newHeight + 'px';
    if (parent.resize) {
        parent.resize(newHeight);
    }
}

function setLanguage() {
    $('.l-email-email-list').text(langJson['l-email-email-list']);
    $('.l-email-transfer-to').text(langJson['l-email-transfer-to']);
    $('.l-email-confirm').text(langJson['l-email-confirm']);
}

function format(d, theTr, rowChild) {
    $.ajax({
        type: "POST",
        url: config.wiseHost + '/WisePBX/api/Email/GetContent',
        data: JSON.stringify({ "id": d.EmailID || -1 }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (r) {
            var details = r.data;
            var emailContent = details.Body;
            emailContent = emailContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            var imgTagIdx = emailContent.indexOf('<img ');
            if (imgTagIdx != -1) {
                var imgLastIdx = emailContent.indexOf('>', imgTagIdx) + 1;
                var imgTag = emailContent.slice(imgTagIdx, imgLastIdx);
                var imgType = imgTag.indexOf('jpg') != -1 ? 'jpeg' : 'png';
                var imgNameIdx = imgTag.indexOf('cid:') + 4;
                var fileName = imgTag.slice(imgNameIdx, imgTag.indexOf('@', imgNameIdx));
                var attachments = details.Attachments;
                for (let attachment of attachments) {
                    if (attachment.FileName == fileName) {
                        var newEmailContent = emailContent.slice(0, imgTagIdx) + '<img src="data:image/' + imgType + ';charset=utf-8;base64,' + attachment.Base64Data + '">' + emailContent.slice(imgLastIdx + 1);
                        emailContent = newEmailContent;
                        break;
                    }
                }
            }
            rowChild('<div>' + langJson['l-email-content'] + ':</div><div class="custom-scroll details-content">' + emailContent + '</div>').show();
            theTr.addClass('shown');
            resize();
        },
        error: function (r) {
            console.log('An error occurred.');
            console.log(r);
        },
    });
}

function emailOnload() {
    setLanguage();
    var dnis = openType == 'menu' ? window.frameElement.getAttribute("details") : parent.window.frameElement.getAttribute("details") || '';
    recordPerPage = sessionStorage.getItem('scrmCaseLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5;
    $('#media-list-table').attr('data-page-length', recordPerPage);

    // Set Column
    var columns = [
        { title: langJson['l-email-date-time'], data: "CreateDateTime" },
        { title: langJson['l-email-name'], data: "Name" },
        { title: langJson['l-email-sender'], data: "Sender" },
        { title: langJson['l-email-subject'], data: "Subject" }];

    if (openType != 'menu') {
        columns.unshift(
            { title: "", data: null }
        );
    } else {
        columns.push({
            "className": 'details-control',
            "orderable": false,
            "data": null,
            "defaultContent": ''
        });
    }

    columns.push({
        title: '<div class="form-check" style="margin-top:-8px">' +
            '<label class="form-check-label">' +
            '<input id="select-all" class="form-check-input" type="checkbox">' +
            '<span class="form-check-sign"><span class="check"></span></span></label></div>', data: "EmailID"
    })

    // Set ColumnDefs
    var emailColumnIdx = openType == 'menu' ? 0 : 1;
    var subjectColumnIdx = openType == 'menu' ? -3 : -2;
    var columnDefs = [{
        targets: emailColumnIdx,
        render: function (data, type, row) {
            return data.replace('T', ' ');
        }
    },
    {
        targets: subjectColumnIdx,
        render: function (data, type, row) {
            var newData = '';
            if (data != null) {
                newData = data.replace(new RegExp(' <br/>|<br/> |<br/>', 'g'), '');
            }
            return newData.trim();
        }
    }, {
        'targets': -1,
        'searchable': false,
        'orderable': false,
        'render': function (data, type, full, meta) {
            return '<div class="form-check" style="margin-top:-8px">' +
                '<label class="form-check-label">' +
                '<input class="form-check-input" type="checkbox" id="' + data + '" value="' + data + '">' +
                '<span class="form-check-sign"><span class="check" data-bs-toggle="tooltip" data-bs-placement="right" title="' + langJson["l-email-change-admin"] + '"></span></span></label></div>';
        }
    }
    ];
    if (openType != 'menu') {
        columnDefs.unshift(
            {
                targets: 0,
                defaultContent: '<i title="' + langJson['l-email-select-email'] + '" class="table-btn fas fa-search-plus create-or-update" data-bs-toggle="tooltip"></i>',
                orderable: false,
                className: 'btnColumn'
            }
        )
    }

    var aaSorting = [[1, "desc"]];
    if (openType == 'menu') {
        aaSorting = [[0, "desc"]];
    }

    $.ajax({
        type: 'POST',
        url: config.wiseHost + '/WisePBX/api/Email/GetList',
        data: JSON.stringify({ "dnis": dnis, "agentId": selectedAgent || -1 }),
        crossDomain: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).always(function (res) {
        if (!/^success$/i.test(res.result || "")) {
            console.log("error /n" + res ? res : '');
        } else {
            var tableData = res.data;
            var totalRecordLength = tableData.length;
            listTable = $('#media-list-table').DataTable({
                data: tableData,
                lengthChange: true, // not showing 'Show ? per page' dropdown
                "lengthMenu": [5, 10, 50],
                aaSorting: aaSorting,
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

            $('#media-list-table').on('click', 'td.details-control', function () {
                var tr = $(this).closest('tr');
                var row = listTable.row(tr);

                if (row.child.isShown()) {
                    // This row is already opened - close it
                    row.child.hide();
                    tr.removeClass('shown');
                    resize();
                }
                else {
                    // Open this row
                    format(row.data(), tr, row.child);
                }
            });

            // Handle click on checkbox
            $('#media-list-table').on('click', '.form-check', function (e) {
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

            $('#media-list-table').on('click', 'tbody tr[role="row"]', function (e) {
                listTable.$('tr.highlight').removeClass('highlight');
                $(this).addClass('highlight');
                var data = listTable.row($(this)).data();
                if (openType != 'menu') {
                    parent.getEmailSetting(data.Sender);
                    parent.mediaContent = {};
                    parent.mediaContent = data;
                    var connId = data.EmailID;
                    if (selectedId != connId) {
                        selectedId = connId;
                        parent.openMedia('email', connId, null, data.CreateDateTime, null, data.Name);
                    }
                }
            });

            $('#media-list-table tbody').on('click', '.create-or-update', function (e) {
                e.preventDefault();
                var data = listTable.row($(this).parents('tr')).data();
                var connId = data.EmailID;
                var details = data.Sender;
                var parentFrame = $(parent.window.frameElement);
                parentFrame.attr('connId', connId);
                parentFrame.attr('details', details);
                parent.removeEmailList(connId, 'Inbound_Email', details);
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
            if ($("#media-list-table tbody tr:eq(0) td.dataTables_empty").length == 0) {
                $("#media-list-table tbody tr:eq(0)").trigger("click");
            }

            // Handle click on "Select all" control
            $('#select-all').on('click', function () {
                // Get all rows with search applied
                var rows = listTable.rows({ 'search': 'applied' }).nodes();
                // Check/uncheck checkboxes for all rows in the table
                var selectedAllChecked = this.checked;
                $('input[type="checkbox"]', rows).prop('checked', selectedAllChecked);
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
        }
    });
    // TBD Site A supervisor want only no LOGOUT agent being shown
    var agentList = openType == 'menu' ? parent.parent.parent.agentList : parent.parent.agentList;
    var agentSelect = $("#agent-list");
    for (let option of agentList) {
        var theAgentId = option.AgentID;
        if (theAgentId != selectedAgent) {
            agentSelect.append('<option LevelID=' + option.LevelID + ' value=' + theAgentId + '>' + option.AgentName + ' (ID: ' + theAgentId + ')</option>');
        }
    }
    // /TBD Site A supervisor want only no LOGOUT agent being shown
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
        parent.parent.parent.assignAgent('Inbound_Email', rowsSelected, assignTo, parent.confirmClicked);
    } else {
        parent.parent.assignAgent('Inbound_Email', rowsSelected, assignTo, parent.windowOnload);
    }
}
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());