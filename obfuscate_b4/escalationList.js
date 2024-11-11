var escalationListArr = [];
var incompleteCasesArr = [];
var agentId = parseInt(sessionStorage.getItem('scrmAgentId')) || -1;
var recordPerPage = sessionStorage.getItem('scrmCaseLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5 || 5;
var campaign = parent.campaign;
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
// function to resize this search iframe
function resize(frameHeight) {
    var newHeight;
    if (frameHeight != undefined) {
        newHeight = frameHeight + 100 // 100 is for the green bar and campaign 
    } else {
        var body = document.body,
            html = document.documentElement;
        newHeight = Math.ceil(Math.max(body.scrollHeight, body.offsetHeight, html.offsetHeight)) || 500;
        newHeight += 30;
    }
    var menuLowerFrame = parent.document.getElementById('search');
    if (menuLowerFrame) {
        menuLowerFrame.height = newHeight;
    }
}
function setLanguage() {
    $('.l-menu-escalation-list').text(langJson['l-menu-escalation-list']);
}
function escalationListOnload(removeOriginal) {
    $('#lower-part-table').attr('data-page-length', recordPerPage);
    var casetable = $('#lower-part-table').DataTable({
        data: parent.escalationListArr,
        lengthChange: false,
        aaSorting: [[7, "desc"]],
        // pageLength: recordPerPage,
        searching: false,
        //buttons: [{ extend: 'colvis', columns: ':not(.noVis)' }],
        columnDefs: [{
            targets: 0,
            data: null,
            // colVis: false,
            defaultContent: '<i class="fas fa-edit table-btn select" data-toggle="tooltip" title="' + langJson['l-menu-update-case'] + '"></i>',
            className: 'btnColumn',
            // className: 'noVis', //NOTES: no column visibility
            orderable: false,
        }, {
            targets: 3,
            render: function (data, type, row) {
                if (data.length > 0) {
                    return data.replace(/[_]/g, " ");
                } else {
                    return 'Manual Update';
                }
            }
        }, {
            targets: 5,
            render: function (data, type, row) {
                if (data != null) { return parent.parent.parent.getAgentName(data) + ' (ID: ' + data + ')' } else { return data }
            }
        }, {
            targets: 6,
            render: function (data, type, row) {
                if (data != null) { return '<span style="color:green;">' + parent.parent.parent.getAgentName(data) + ' (ID: ' + data + ')<span>' } else { return '' }
            }
        }, {
            targets: -1,
            render: function (data, type, row) {
                var newData = data ? data.replace(/[T]/g, " ") : '';
                var indexOfDot = newData.indexOf('.');
                if (indexOfDot > -1) {
                    return newData.slice(0, indexOfDot);
                } else {
                    return newData;
                }
            }
        }
        ],
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
        },
        columns: [
            { title: "" },
            { title: langJson['l-search-full-name'], data: "Name_Eng" },
            { title: langJson['l-search-case-no'], data: "Case_No" },
            { title: langJson['l-search-inbound-type'], data: "Call_Type" },
            { title: langJson['l-search-nature'], data: "Call_Nature" },
            { title: langJson['l-search-escalated-from'], data: "Case_Updated_By" },
            { title: langJson['l-search-escalated-to'], data: "Escalated_To" },
            { title: langJson['l-search-last-revision'], data: "Case_Updated_Time" }
        ]
    });

    setLanguage();

    $('#lower-part-table').on('click', 'tr', function (e) {
        casetable.$('tr.highlight').removeClass('highlight');  // $('xxx tbody tr) will not select other pages not showing, do not use this selector
        $(this).addClass('highlight');
    });
    // "Update Case" button clicked in the table
    $('#lower-part-table tbody').on('click', '.select', function () {
        var data = casetable.row($(this).parents('tr')).data();
        parent.updateCase(data);
    });
}
$(document).ready(function () {
    if (parent.parent.iframeRecheck) {
        parent.parent.iframeRecheck($(parent.document));
    }
});
// $(document).ready(function () {
//     $("body").tooltip({
//         selector: '[data-toggle=tooltip]',
//         trigger: 'hover',
//         animation: false
//     });
// });
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());