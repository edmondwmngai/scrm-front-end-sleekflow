var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var loginId = parent.loginId;
var token = sessionStorage.getItem('scrmToken') || '';
var mvcUrl = config.mvcUrl;
// append item to role table
function appendTableColumn(table, rowData) {
    var lastRow = $('<tr/>').appendTo(table.find('tbody:last'));
    $.each(rowData, function (colIndex, c) {
        lastRow.append($('<td/>').text(c));
    });
    return lastRow;
}

var selectedRole = {};

function setLanguage() {
    $('.l-role-manage-roles').text(langJson['l-role-manage-roles']);
    $('.l-role-create-new-role').text(langJson['l-role-create-new-role']);
}
// load the role table and role data
var loadUserRoles = function (intitial) {
    $.ajax({
        type: "POST",
        url: mvcUrl + '/api/GetRoles',
        data: JSON.stringify({ Agent_Id: loginId, Token: token }),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).always(function (res) {
        if (!/^success$/i.test(res.result || "")) {
            console.log("Error in loadUserRoles." + res ? res.details : '');
            if (res.details && res.details == 'Not Auth.') {
                parent.sessionTimeout();
            }
        } else {
            // retrieve result details and put them in data container
            var roleContent = res.details;

            var roleTable = $('#role-table').DataTable({
                // basic configs
                data: roleContent,
                aaSorting: [
                    [1, "asc"]
                ],
                pageLength: 10, // 10 rows per page
                lengthChange: false,
                searching: false,
                // declare columns
                columns: [{
                    title: langJson['l-role-role-name'],
                    data: "RoleName"
                }, {
                    title: langJson['l-role-role-status'],
                    data: "RoleStatus"
                }, {
                    title: ""
                },],

                // change the wording in pagination
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

                // declare column definitions
                columnDefs: [{
                    // edit button (in img form)
                    targets: 1,
                    //targets: 4,
                    render: function (data, type, row) {
                        if (row.RoleStatus == 'A') {
                            return data = langJson['l-role-active']; // "Active";
                        } else {
                            return data = langJson['l-role-inactive']; // "Inactive";
                        }
                    },
                }, {
                    // edit button (in img form)
                    targets: 2,
                    render: function (data, type, row) {
                        if (row.RoleName == 'Super No Delete') {
                            return '<i class="fas fa-key text-warning"></i>';
                        } else {
                            return '<i class="fas fa-edit table-btn open" data-toggle="tooltip" data-placement="right" title="' + langJson['l-role-edit-role'] + '"></i>';
                        }
                    },

                    orderable: false,
                    className: 'btnColumn'
                }
                ]
            });

            // highlight row upon clicking
            $('#role-table tbody').on('click', 'tr', function (e) {
                roleTable.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                $(this).addClass('highlight')
            });

            // open account edit popup
            $('#role-table tbody').on('click', '.open', function () {
                var data = roleTable.row($(this).parents('tr')).data();
                selectedRole = data;
                var openWindows = parent.openWindows;
                var rolePopup = window.open('./rolePopup.html', 'roleRecord', 'menubar=no,location=no,scrollbar=no,fullscreen=no,toolbar=no,status=no,width=500,height=832,top=200,left=20,resizable=1'); // 2nd properties '_blank' will open new window, if have name('roleRecord'), will refresh the same
                openWindows[openWindows.length] = rolePopup;
                rolePopup.onload = function () {
                    rolePopup.onbeforeunload = function () {
                        for (var i = 0; i < openWindows.length; i++) {
                            if (openWindows[i] == rolePopup) {
                                openWindows.splice(i, 1);
                                break;
                            }
                        }
                    }
                }
            });
        }
    });
}

function deleteRole(roleID, roleName, roleStatus) {
    // fake delete, only update the role status to 'D'
    $.ajax({
        type: "PUT",
        url: mvcUrl + '/api/UpdateRole',
        data: JSON.stringify({
            RoleID: Number(roleID),
            RoleStatus: roleStatus,
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        var details = res.details;
        if (!/^success$/i.test(res.result || "")) {
            console.log("error /n" + r ? r : '');
        } else {
            //window.close(); // close the window
        }
    });
}

function createClicked() {
    selectedRole = null;
    var openWindows = parent.openWindows;
    var rolePopup = window.open('./rolePopup.html', '_blank', 'menubar=no,location=no, scrollbar=no,fullscreen=no,toolbar=no,status=no,width=500,height=832,top=200,left=20,resizable=1');
    openWindows[openWindows.length] = rolePopup;
    rolePopup.onload = function () {
        rolePopup.onbeforeunload = function () {
            for (var i = 0; i < openWindows.length; i++) {
                if (openWindows[i] == rolePopup) {
                    openWindows.splice(i, 1);
                    break;
                }
            }
        }
    }
}

function windowOnload() {
    setLanguage();
    loadUserRoles();
    if (parent.iframeRecheck) {
        parent.iframeRecheck($(parent.document));
    }
}

// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());