// declare the role fields
var roleId = null;
var roleName;
var accessRight = [];
var companies = [];
var categories = [];
var functions = [];
var roleStatus;
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var mvcUrl = config.mvcUrl;
var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';

function setLanguage() {
    $('.l-role-role-name').text(langJson['l-role-role-name']);
    $('.l-role-access-right').text(langJson['l-role-access-right']);
    $('.l-role-role-status').text(langJson['l-role-role-status']);
    $('.l-role-active').text(langJson['l-role-active']);
    $('.l-general-save').text(langJson['l-general-save']);
    $('.l-general-cancel').text(langJson['l-general-cancel']);
}

function loadFields(checkedItems) {
    $.ajax({
        type: "POST",
        url: mvcUrl + '/api/GetFields',
        data: JSON.stringify({
            "listArr": ["Categories", "Functions"],
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        //result != "success" or there is no results
        if (!/^success$/i.test(res.result || "")) {
            console.log('error: ' + details ? details : res);
        } else {
            // go through details and assign the list fields to data containers
            var details = res.details; // assign result details
            if (details != undefined) {
                // declare div container
                var sessionCampaignList = sessionStorage.getItem('scrmCampaignList') || [];
                var campaignList = JSON.parse(sessionCampaignList);
                var container = $('#company-items');
                // add company checkboxes
                //$('<input />', { class: 'form-check-input', type: 'checkbox', id: 'all-companies', value: 'All Companies' }).appendTo('#all-comp');
                $('<label class="form-check-label all" for="all-companies">' +
                    '<input class="form-check-input" type="checkbox" id="all-companies" value="All Companies">' +
                    langJson['l-role-all-companies'] +
                    '<span class="form-check-sign"><span class="check"></span></span></label><br/>').appendTo('#all-comp');

                // $('<label />', { class: 'form-check-label', 'for': 'all-companies', text: 'All Companies'  }).appendTo('#all-comp');
                // $('<span class="form-check-sign" for="all-companies"><span class="check"></span></span>').appendTo('#all-comp');
                //$('<br>').appendTo('#all-comp');
                campaignList.forEach(function addCheckBox(item, index) {
                    $('<div class="options"><label class="form-check-label" for="' + item.Field_Name + '">' +
                        '<input class="form-check-input" type="checkbox" id="' + item.Field_Name + '" value="' + item.Field_Name + '">' +
                        item.Field_Display +
                        '<span class="form-check-sign"><span class="check"></span></span></label></div>').appendTo(container);
                    // $('<input />', { class: 'form-check-input', type: 'checkbox', id: item.Field_Name, value: item.Field_Display }).appendTo(container);
                    // $('<label />', { class: 'form-check-label', 'for': item.Field_Name, text: item.Field_Display  }).appendTo(container);
                    // $('<br>').appendTo(container);
                });

                // add category checkboxes
                container = $('#category-items');
                $('<label class="form-check-label all" for="all-categories">' +
                    '<input class="form-check-input" type="checkbox" id="all-categories" value="All Categories">' +
                    langJson['l-role-all-categories'] +
                    '<span class="form-check-sign"><span class="check"></span></span></label><br/>').appendTo('#all-cat');
                // $('<input />', { type: 'checkbox', id: 'all-categories', value: 'All Categories' }).appendTo('#all-cat');
                // $('<label />', { 'for': 'all-categories', text: 'All Categories'  }).appendTo('#all-cat');
                // $('<br>').appendTo('#all-cat');

                details['Categories'].forEach(function addCheckBox(item, index) {
                    $('<div class="options"><label class="form-check-label" for="' + item.Field_Name + '">' +
                        '<input class="form-check-input" type="checkbox" id="' + item.Field_Name + '" value="' + item.Field_Name + '">' +
                        item.Field_Display +
                        '<span class="form-check-sign"><span class="check"></span></span></label></div>').appendTo(container);
                    // $('<input />', { type: 'checkbox', id: item.Field_Name, value: item.Field_Display }).appendTo(container);
                    // $('<label />', { 'for': item.Field_Name, text: item.Field_Display  }).appendTo(container);
                    // $('<br>').appendTo(container);
                });

                // add function checkboxes
                container = $('#function-items');
                $('<label class="form-check-label all" for="all-functions">' +
                    '<input class="form-check-input" type="checkbox" id="all-functions" value="All Functions">' +
                    langJson['l-role-all-functions'] +
                    '<span class="form-check-sign"><span class="check"></span></span></label><br/>').appendTo('#all-func');
                // $('<input />', { type: 'checkbox', id: 'all-functions', value: 'All Functions' }).appendTo('#all-func');
                // $('<label />', { 'for': 'all-functions', text: 'All Functions'  }).appendTo('#all-func');
                // $('<br>').appendTo('#all-func');
                details['Functions'].forEach(function addCheckBox(item, index) {
                    $('<div class="options"><label class="form-check-label" for="' + item.Field_Name + '">' +
                        '<input class="form-check-input" type="checkbox" id="' + item.Field_Name + '" value="' + item.Field_Name + '">' +
                        item.Field_Display +
                        '<span class="form-check-sign"><span class="check"></span></span></label></div>').appendTo(container);
                    // $('<input />', { type: 'checkbox', id: item.Field_Name, value: item.Field_Display }).appendTo(container);
                    // $('<label />', { 'for': item.Field_Name, text: item.Field_Display  }).appendTo(container);
                    // $('<br>').appendTo(container);
                });
            }
        }

        // load the checkbox actions
        loadCheckboxActions('#company-items', '#all-companies');
        loadCheckboxActions('#category-items', '#all-categories');
        loadCheckboxActions('#function-items', '#all-functions');

        // there are items checked
        if (checkedItems.length != 0) {

            // check the radio box by id
            for (let checkedItem of checkedItems) {

                // The fields will be changed sometimes, so need to verfiy do the field still exists first
                if (document.getElementById(checkedItem)) {
                    document.getElementById(checkedItem).checked = true;
                }
            }
        }
    });
}

// determine checkbox actions upon each click
function loadCheckboxActions(allCheckboxes, selectAllId) {
    $(allCheckboxes).on('change', 'input[type=checkbox]', function (event) {

        // caching the changed element:
        var changed = event.target,

            // caching:
            checkboxes = $(allCheckboxes)

                // <input> elements within the #company-items of type=checkbox:
                .find('input[type=checkbox]')

                // which do not match the '#all-companies' selector:
                .not(selectAllId);

        // if the changed element has the id of 'all-companies':
        if (changed.id === selectAllId) {

            // we update the 'checked' property of the cached check-box inputs to reflect the checked stat of the '#all-companies' element:
            checkboxes.prop('checked', changed.checked);
        } else {
            
            // here we check that the number of checked checkboxes is equal to the number of check-boxes (effectively
            // finding out whether all, or not-all, check-boxes are checked:
            var allChecked = checkboxes.length === checkboxes.filter(':checked').length

            // here we update the 'checked' property of the
            // 'all-companies' check-box to true (if the number of checked check-boxes is equal to the
            // number of check-boxes) or false (if the number of checked check-boxes is not equal to the
            // number of check-boxes):
            $(selectAllId).prop(
                'checked', allChecked
            );
        }
    });

    // click "All..." checkboxes will check/uncheck all the values
    $(selectAllId).change(function () {
        $(allCheckboxes + ' input[type="checkbox"]').prop('checked', $(this).prop("checked"))
    });
}

function createRole(roleName, companies, categories, functions, roleStatus) {
    $.ajax({
        type: "POST",
        url: mvcUrl + '/api/CreateRole',
        data: JSON.stringify({
            RoleName: roleName,
            Companies: companies,
            Categories: categories,
            Functions: functions,
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
            console.log("error /n" + res ? res : '');
        } else {
            // parent.internalCaseNo = internalCaseNo;
            // var roleID = details.RoleID || -1;        20250414 Remove the declaration of the unused 'roleID' variable.
            // var roleName = details.RoleName;          20250414 Remove the declaration of the unused 'roleName' variable.

            window.close(); // close the window
        }
    });
}

function updateRole(roleID, roleName, companies, categories, functions, roleStatus) {
    $.ajax({
        type: "PUT",
        url: mvcUrl + '/api/UpdateRole',
        data: JSON.stringify({
            RoleID: Number(roleID),
            RoleName: roleName,
            Companies: companies,
            Categories: categories,
            Functions: functions,
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
            console.log("error /n" + res ? res : '');
            console.log(details);   // 20250414 Remove the declaration of the unused 'details' variable.
        } else {
            window.close(); // close the window
        }
    });
}

//when the role pop-up window is onload
function roleRecordPopupOnload() {
    setLanguage();
    var windowOpener = window.opener;
    var queryObj = windowOpener.selectedRole;


    if (queryObj == null) {
        // for create user, change the header and load all radio boxes
        $("#p-header").text("Create a role"); // set header text
        loadFields("");
        $('#status-toggle').prop('checked', true); // set to active
    } else {
        // for update user
        $("#p-header").text("Update a role"); // set header text

        // obtain field values
        roleId = queryObj.RoleID;
        roleName = queryObj.RoleName;
        roleStatus = queryObj.RoleStatus;

        // split the values by ',' and assign them to arrays
        var companyArray = queryObj.Companies.split(',');
        var categoryArray = queryObj.Categories.split(',');
        var functionArray = queryObj.Functions.split(',');

        // combine the 3 arrays into 1 array
        accessRight = companyArray.concat(categoryArray).concat(functionArray);

        $('#txt-role-name').val(roleName); // set the role name value to text box
        loadFields(accessRight); // load access right checkboxes with checked values

        // set toggle
        if (roleStatus == "A") {
            $('#status-toggle').prop('checked', true);
            $('#role-status-label').text(langJson['l-role-active']);
        } else {
            $('#status-toggle').prop('checked', false);
            $('#role-status-label').text(langJson['l-role-inactive']);
        }
    }

    // when toggle changes, label text changes
    $('#status-toggle').change(function () {
        if ($(this).prop("checked")) {
            // make role active
            $('#status-toggle').prop('checked', true);
            $('#role-status-label').text(langJson['l-role-active']);
            $('#status-error').text(''); // clear error text
        } else {
            // make role inactive
            $('#status-toggle').prop('checked', false);
            $('#role-status-label').text(langJson['l-role-inactive']);
            checkRoleOfAgents();
        }
    });
}

function validateForm(roleName, compCheckboxes, catCheckboxes, funcCheckboxes) {
    var hasError = false;

    // validate role name
    if (roleName.length == 0) {
        $('#role-name-error').text('This field is required.'); // for blank fields
        hasError = true;
    } else {
        $('#role-name-error').text('');
    }

    // validate company checkboxes
    var noOfCheckedComps = $(compCheckboxes + ' input[type="checkbox"]').filter(':checked').length;
    var noOfCheckedCats = $(catCheckboxes + ' input[type="checkbox"]').filter(':checked').length;
    var noOfCheckedFuncs = $(funcCheckboxes + ' input[type="checkbox"]').filter(':checked').length;

    if (noOfCheckedComps == 0) {
        $('#company-error').text('This field is required.'); // for blank fields
        hasError = true;
    } else {
        $('#company-error').text('');
    }

    if (noOfCheckedCats == 0) {
        $('#category-error').text('This field is required.'); // for blank fields
        hasError = true;
    } else {
        $('#category-error').text('');
    }

    if (noOfCheckedFuncs == 0) {
        $('#function-error').text('This field is required.'); // for blank fields
        hasError = true;
    } else {
        $('#function-error').text('');
    }

    $('#validation-result').text(hasError);

    //return hasError;
}

function clearForm() {
    window.close(); // close the popup window
}

function checkRoleOfAgents() {
    // check if that role is used by any agents
    $.ajax({
        type: "POST",
        url: mvcUrl + '/api/GetAgentsOfRole',
        data: JSON.stringify({
            LevelID: roleId,
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        var details = res.details;
        if (!/^success$/i.test(res.result || "")) {
            console.log("error /n" + res ? res : '');
   //     } else {  // 20250410 'If' statement should not be the only statement in 'else' block
        } else if (details != "") {
                $('#status-error').text(details);
                return false; // do not submit form
        } else {
                $('#status-error').text('');
          //  }// 20250410 for else if
        }
    });
}

function submitForm() {

    roleName = $('#txt-role-name').val(); // obtain value from textbox
    var roleStatusOn = $('#status-toggle').prop("checked");
    if (roleStatusOn) {
        roleStatus = "A";
        $('#status-error').text('');
    } else {
        roleStatus = "D";
    }
    // assign checkbox values to data containers
    $('#company-items input:checkbox:checked').each(function () {
        if (this.value != 'All Companies') {
            companies.push(this.value);
        }
    });

    $('#category-items input:checkbox:checked').each(function () {
        if (this.value != 'All Categories') {
            categories.push(this.value);
        }
    });

    $('#function-items input:checkbox:checked').each(function () {
        if (this.value != 'All Functions') {
            functions.push(this.value);
        }
    });

    // transform the 3 arrays to 3 strings
    var companyString = companies.toString();
    var categoryString = categories.toString();
    var functionString = functions.toString();

    // validate the field values
    validateForm(roleName, '#company-items', '#category-items', '#function-items');
    var formHasError = $('#validation-result').text();

    var statusError = $('#status-error').text(); // get status error text

    if (formHasError == 'true' || statusError.length > 0) {
        event.preventDefault(); // do not submit form
    } else {
        // decide whether to create role or update role
        if (roleId == null) {
            // call for createRole function and show alert
            createRole(roleName, companyString, categoryString, functionString);
        } else {
            // call for updateRole function and show alert
            updateRole(roleId, roleName, companyString, categoryString, functionString, roleStatus);
        }
        window.opener.location.reload(true); // reload the role page
    }
}
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());