var selectedAccount = {};
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var mvcUrl = config.mvcUrl;
var loginId = parent.loginId;
var token = sessionStorage.getItem('scrmToken') || '';

function setLanguage() {
    $('.l-account-create-new-user').text(langJson['l-account-create-new-user']);
    $('.l-account-manage-accounts').text(langJson['l-account-manage-accounts']);
}
var loadUserAccounts = function (intitial) {
    $.ajax({
        type: "POST",
        url: config.mvcUrl + '/api/GetLogin',
        data: JSON.stringify({ Agent_Id: loginId, Token: token }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        if (!/^success$/i.test(res.result || "")) {
            console.log("Error in loadUserAccounts." + res ? res.details : '');
        } else {
            // obtain content of "details"
            var accountContent = res.details;

            var accountTable = $('#account-table').DataTable({
                // basic configs
                data: accountContent,
                aaSorting: [
                    [2, "asc"]
                ],
                pageLength: 10, // 10 rows per page
                lengthChange: false,
                searching: false,
                // declare columns
                columns: [{
                    title: langJson['l-account-photo'],
                    data: "Photo"
                }, {
                    title: langJson['l-account-seller-id'],
                    data: "SellerID"
                }, {
                    title: langJson['l-account-agent-id'],
                    data: "AgentID"
                }, {
                    title: langJson['l-account-name'],
                    data: "AgentName"
                }, {
                    title: langJson['l-account-email'],
                    data: "Email"
                }, {
                    title: langJson['l-account-role'],
                    data: "RoleName"
                }, {
                    title: langJson['l-account-status'],
                    data: "Account_status"
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
                    // profile picture
                    targets: 0,
                    render: function (data, type, row, meta) {

                        //var photo = $('<img />', {                    // 20250414 Remove the declaration of the unused 'photo' variable.
                        //    id: 'profile-pic-' + meta.row,
                        //    class: 'profile-picture',
                        //    src: './images/user.png'
                        //});

                        var photoSrcString;
                        var imgId = 'profile-pic-' + (meta.row + 1).toString(); // row index + 1
                        var imgClass = 'profile-picture';

                        if (data == null) {
                            // no profile pic, use default pic
                            photoSrcString = "./images/user.png";

                        } else {
                            // assign data to profile pic
                            photoSrcString = "data:" + row.Photo_Type + ";base64," + row.Photo;
                        }

                        return '<img "Photo" id="' + imgId + '" class="' + imgClass + '" src="' + photoSrcString + '" alt="propic" />';

                    },
                    orderable: false
                }, {
                    targets: 6,
                    render: function (data, type, row) {
                        return data == 'Active' ? langJson['l-account-active'] : langJson['l-account-inactive']
                    }
                }, {
                    // edit button (in img form)
                    targets: 7,
                    render: function (data, type, row) {
                        if (row.AgentName == 'Super No Delete') {
                            return '<i class="fas fa-key text-warning"></i>';
                        } else {
                            return '<i class="fas fa-edit table-btn open" data-bs-toggle="tooltip" data-bs-placement="right" title="' + langJson['l-account-edit-account'] + '"></i>';
                        }
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
                // window.selectedCaseLog = data;
                selectedAccount = data;
                var openWindows = parent.openWindows;
                // because move event at parent, so the pop-up need to be full screen
                var accountRecordPopup = window.open('./accountRecordPopup.html', 'accountRecord', 'fullscreen=yes,width=' + screen.width / 3 + ',' + 'height=' + (screen.height - 50)); // 2nd properties '_blank' will open new window, if have name('accountRecord'), will refresh the same
                openWindows[openWindows.length] = accountRecordPopup;
                accountRecordPopup.onload = function () {
                    accountRecordPopup.onbeforeunload = function () {
                        for (var i = 0; i < openWindows.length; i++) {
                            if (openWindows[i] == accountRecordPopup) {
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

function createClicked() {
    selectedAccount = null;
    var openWindows = parent.openWindows;
    // because move event at parent, so the pop-up need to be full screen
    var accountRecordPopup = window.open('./accountRecordPopup.html', 'newAccountRecord', 'fullscreen=yes,width=' + screen.width / 3 + ',' + 'height=' + (screen.height - 50));
    openWindows[openWindows.length] = accountRecordPopup;
    accountRecordPopup.onload = function () {
        accountRecordPopup.onbeforeunload = function () {
            for (var i = 0; i < openWindows.length; i++) {
                if (openWindows[i] == accountRecordPopup) {
                    openWindows.splice(i, 1);
                    break;
                }
            }
        }
    }
}

function windowOnload() {
    loadUserAccounts();
    setLanguage();
    if (parent.iframeRecheck) {
        parent.iframeRecheck($(parent.document));
    }
}

document.addEventListener('contextmenu', event => event.preventDefault());