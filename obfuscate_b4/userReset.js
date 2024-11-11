var selectedAccount = {};
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var mvcUrl = config.mvcUrl;
var loginId = parent.loginId;
var token = sessionStorage.getItem('scrmToken') || '';

if (sessionStorage.getItem('scrmLoggedIn') == null) {
    alert("You are not logged in");
    window.location.href = 'login.html';
}

function setLanguage() {
    $('.l-account-create-new-user').text(langJson['l-account-create-new-user']);
}
var loadUserAccounts = function (intitial) {
    $.ajax({
        type: "POST",
        url: mvcUrl + '/api/GetLogin',
        contentType: "application/json",
        data: JSON.stringify({ Agent_Id: loginId, Token: token }),
        crossDomain: true
    }).always(function (res) {
        if (!/^success$/i.test(res.result || "")) {
            console.log("Error in loadUserAccounts." + res ? res.details : '');
        } else {

            // obtain content of "details"
            var accountContent = res.details;
            accountContent = accountContent.filter(theAgent => theAgent.Account_status == 'Active');

            var accountTable = $('#account-table').DataTable({
                // basic configs
                data: accountContent,
                aaSorting: [
                    [2, "asc"]
                ],
                pageLength: 10, // 10 rows per page
                lengthChange: false,
                searching: false,
                //"ordering": false,

                // declare columns
                columns: [
                    // { title: langJson['l-account-photo'], data: "Photo" },
                    {
                        title: langJson['l-account-seller-id'],
                        data: "SellerID"
                    }, {
                        title: langJson['l-account-agent-id'],
                        data: "AgentID"
                    }, {
                        title: langJson['l-account-name'],
                        data: "AgentName"
                    },
                    // { title: langJson['l-account-email'], data: "Email" },
                    {
                        title: langJson['l-account-role'],
                        data: "RoleName"
                    }, {
                        title: langJson['l-account-status'],
                        data: "Account_status"
                    }, {
                        title: ""
                    },
                ],

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
                columnDefs: [
                    {
                        targets: 4,
                        render: function (data, type, row) {
                            return data == 'Active' ? langJson['l-account-active'] : langJson['l-account-inactive']
                        }
                    }, {
                        targets: 5,
                        render: function (data, type, row) {
                            return '<i class="fas fa-edit table-btn open" data-toggle="tooltip" data-placement="right" title="' + langJson['l-account-edit-account'] + '"></i>';
                        },

                        orderable: false,
                        className: 'btnColumn'
                    }
                ]
            });

            // highlight row upon clicking
            $('#account-table tbody').on('click', 'tr', function (e) {
                accountTable.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                $(this).addClass('highlight')
            });

            // open account edit popup
            $('#account-table tbody').on('click', '.open', function () {
                var data = accountTable.row($(this).parents('tr')).data();
                selectedAccount = data;
                var openWindows = parent.openWindows;
                console.log('openWindows');
                console.log(openWindows);
                openWindows[openWindows.length] = window.open('./accountResetPopup.html', 'accountReset', 'menubar=no,location=no,scrollbar=no,fullscreen=no,toolbar=no,status=no,width=400,height=600,top=200,left=20,resizable=1'); // 2nd properties '_blank' will open new window, if have name('accountRecord'), will refresh the same
            });
        }
    });
}

function createClicked() {
    selectedAccount = null;
    var openWindows = parent.openWindows;
    openWindows[openWindows.length] = window.open('./accountRecordPopup.html', '_blank', 'menubar=no,location=no, scrollbar=no,fullscreen=no,toolbar=no,status=no,width=400,height=800,top=200,left=20,resizable=1');
}

function windowOnload() {
    setLanguage();
    loadUserAccounts();
    
    // added for time-out
    if (parent.iframeRecheck) {
        parent.iframeRecheck($(parent.document));
    }
}

document.addEventListener('contextmenu', event => event.preventDefault());