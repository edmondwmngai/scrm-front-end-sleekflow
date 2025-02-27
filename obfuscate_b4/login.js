var mvcHost = config.mvcHost;
var mvcUrl = config.mvcUrl;
var customCompany = 'no';
var restorable = false;
var language = localStorage.getItem('scrmLanguage') || sessionStorage.getItem('scrmLanguage') || 'EN';
var langJson = language == 'EN' ? {
    'l-login-change-password': 'Change Password',
    'l-login-done': 'Done!',
    'l-login-get-started': 'Get Started',
    'l-login-login': 'Login',
    'l-login-password': 'Password...',
    'l-login-restore': 'Restore',
    'l-login-sending-request': 'Sending Request...',
    'l-login-username': 'Username...',
    'l-general-are-you-sure': 'Are you sure?',
    'l-general-ok-label': 'Yes',
    'l-general-cancel-label': 'No',
    'warning-input-username': 'Please input a username',
    'warning-input-pw': 'Please input a password',
    'warning-account-locked': 'Account is locked, please contact your supervisor',
    'warning-change-password': 'Your password has expired, please change password'
} : (language == 'TC' ? {
    'l-login-change-password': '更改密碼',
    'l-login-done': '完成!',
    'l-login-get-restore': '恢復',
    'l-login-get-started': '開始使用',
    'l-login-login': '登入',
    'l-login-password': '密碼...',
    'l-login-restore': '恢復',
    'l-login-sending-request': '重整資料中...',
    'l-login-username': '用戶名稱...	',
    'l-general-are-you-sure': '確定?',
    'l-general-ok-label': '是',
    'l-general-cancel-label': '否',
    'warning-input-username': '請輸入用戶名稱',
    'warning-input-pw': '請輸入密碼',
    'warning-account-locked': '賬戶已被凍結，請聯絡您的主管',
    'warning-change-password': '您的密碼已過期，請更改您的密碼'

} : {
    'l-login-change-password': '更改密码',
    'l-login-done': '完成!',
    'l-login-get-restore': '恢复',
    'l-login-get-started': '开始使用',
    'l-login-login': '登入',
    'l-login-password': '密码...',
    'l-login-restore': '恢复',
    'l-login-sending-request': '重整资料中...',
    'l-login-username': '用户名称...	',
    'l-general-are-you-sure': '确定?',
    'l-general-ok-label': '是',
    'l-general-cancel-label': '否',
    'warning-input-username': '请输入用户名称',
    'warning-input-pw': '请输入密码',
    'warning-account-locked': '账户已被冻结，请联络您的主管',
    'warning-change-password': '您的密码已过期，请更改您的密码'
})



function openChangePwPopup() {
    var feature = "_blank, menubar=no,toolbar=no,resizable=no,status=no,scrollbars=yes,width=400,height=590,top=200,left=20";
    window.open("./changePasswordPopup.html?reset=true", "Change Password", feature);
}

function setLanguage() {
    $('.l-login-change-password').text(langJson['l-login-change-password']);
    $('.l-login-done').text(langJson['l-login-done']);
    $('.l-login-get-restore').text(langJson['l-login-get-restore']);
    $('.l-login-get-started').text(langJson['l-login-get-started']);
    $('.l-login-login').text(langJson['l-login-login']);
    $('.l-login-restore').text(langJson['l-login-restore']);
    $('.l-login-sending-request').text(langJson['l-login-sending-request']);
    $('.l-login-username').prop('placeholder', langJson['l-login-username']);
    $('.l-login-password').prop('placeholder', langJson['l-login-password']);
}

function languageChanged(oThis) {
    language = $(oThis).val();
    // getLanguage();
    localStorage.setItem('scrmLanguage', language);
    sessionStorage.setItem('scrmLanguage', language);
    window.location.reload(true);
    // return;
}

function staffID_onkeydown(e) {

    // pressed enter
    if (e.keyCode == 13) {
        var pwd = document.getElementById('pwd');
        pwd.focus();
        return false;
    } else if (e.keyCode == 32) { // avoide space
        return false;
    }
}

function pwd_onkeydown(e) {
    if (e.keyCode == 13) {
        if (!$('.login-btn').prop('disabled')){
            verify();
        }
        return false;
    } else if (e.keyCode == 32) { // avoide space
        return false;
    }
}

function view_enable() {
    var pwd = document.getElementById('pwd');
    (pwd.value == "") ? $('.pwd-view').css('display', "none"): $('.pwd-view').css('display', "inline");
}

function view_disable() {
    $('.pwd-view').css('display', "none");
    $('#pwd').attr('type', 'password');
}

function view_pwd(e, oThis) {
    e.preventDefault();
    $('#pwd').attr('type', 'text');
    $(oThis).removeClass('fa-eye-slash').addClass('fa-eye');
}

function hide_pwd() {
    $('#pwd').attr('type', 'password');
    $('.pwd-view').removeClass('fa-eye').addClass('fa-eye-slash');
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

function restoreClicked() {
    // e.preventDefault();
    var restoreBtn = $('#restore-btn')
    var doneStr = $('.l-login-done');
    var loadingIconSection = $('#loading-icon-section');
    var sendingRequestStr = $('.l-login-sending-request');
    var loginBtn = $('.login-btn');
    restoreBtn.addClass('disabled');
    loginBtn.prop('disabled', true);
    sendingRequestStr.removeClass('d-none');
    loadingIconSection.removeClass('d-none');
    doneStr.addClass('d-none');
    $.ajax({
        type: "GET",
        url: mvcUrl + '/api/RestoreHKTB',
        crossDomain: true,
        contentType: "application/json",
        processData: false
    }).always(function (r) {
        console.log(r.result);
        if (!/^success$/i.test(r.result || "")) {
            console.log(r.details || r);
        } else {
            sendingRequestStr.addClass('d-none');
            loadingIconSection.addClass('d-none')
            doneStr.removeClass('d-none');
            restoreBtn.removeClass('disabled');
            loginBtn.prop('disabled', false);
        }
    });
}

function returnNormalLogin() {
    $('#restore-btn').removeClass('disabled');
    $('.login-btn').prop('disabled', false);
    // loading looks
    $('#loading-icon-section').addClass('d-none');
}

function verify(e) {
    if (e) {
        e.preventDefault();
    }
    $('.login-btn').prop('disabled', true);
    $('#restore-btn').addClass('disabled');

    // loading looks
    $('#loading-icon-section').removeClass('d-none');
    var staffID = document.getElementById('staffID');
    var staffIDVal = staffID.value;
    var pwd = document.getElementById('pwd');
    if (staffIDVal == "") {
        $('#warning-msg').html(langJson['warning-input-username']);
        returnNormalLogin();
        staffID.focus();
        return;
    }
    if (pwd.value == "") {
        $('#warning-msg').html(langJson['warning-input-pw']);
        returnNormalLogin();
        pwd.focus();
        return;
    }
    var mode = 'crmMode';

    // var radios = document.getElementsByName('role');
    // var mode = ''
    // for (var i = 0, length = radios.length; i < length; i++) {
    // 	if (radios[i].checked) {
    // 		// do whatever you want with the checked radio
    // 		mode = radios[i].value;
    // 		// only one radio can be logically checked, don't check the rest
    // 		break;
    // 	}
    // }
    // tremorary allow agent id also
    // if(/^(?:[1-9]|0[1-9]|10)$/.test(staffIDVal)){
    // 	staffIDVal = Number(staffIDVal);
    // }
    //ajax get login
    var dataObj = {
        SellerID: staffIDVal || '',
        Password: pwd.value || '',
        mode: mode
    }
    if (config.isLdap === true) { // undefined === true will not have error, if isLdap is not in an object and not defined will have error
        dataObj.Is_Ldap = "Y"
    }
    $.ajax({
        type: 'POST',
        url: mvcUrl + '/api/Login',
        data: JSON.stringify(dataObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json',
        success: function (res) {
            var details = res.details || 'Error';
            if (!/^success$/i.test(res.result || "")) {
                if (details == 'Account is locked.') {
                    $('#warning-msg').html(langJson['warning-account-locked']);
                    returnNormalLogin();
                } else if (details == 'Account has expired.' || details == 'Initial Login.') {
                    sessionStorage.setItem('scrmAgentId', res.AgentID || -1);
                    sessionStorage.setItem('scrmToken', res.Token || '');
                    sessionStorage.setItem('scrmSellerID', staffIDVal || '');
                    sessionStorage.setItem('scrmForceDetails', details);
                    window.location.href = './changePW.html';
                } else {
                    $('#warning-msg').html(details);
                    returnNormalLogin();
                }
            } else {
                // verify can the user see the company
                var companies = details.Companies || '';
                if (customCompany != 'no') {
                    var companyArr = companies.split(',');
                    if (restorable === false && companyArr.indexOf(customCompany) == -1) {
                        $('#warning-msg').html("The user you are tring to login cannot access to " + customCompany);
                        returnNormalLogin();
                        var staffID = document.getElementById('staffID');
                        staffID.focus();
                        return;
                    }
                }
                // set session storage
                var reConfig = details.config;
                var photoSizeArr = reConfig.filter(function (obj) {
                    return obj.P_Name === 'PhotoSize_MB'
                }); //cannot use array.find in IE, so use array.filter
                var caseLengthArr = reConfig.filter(function (obj) {
                    return obj.P_Name === 'RecordPerPage_Case'
                });
                var caseLogLengthArr = reConfig.filter(function (obj) {
                    return obj.P_Name === 'RecordPerPage_Case_Log'
                });
                var photoSizeValue = photoSizeArr[0].P_Value;
                var caseLengthValue = caseLengthArr[0].P_Value;
                var caseLogLengthValue = caseLogLengthArr[0].P_Value;
                sessionStorage.setItem('scrmLoggedIn', true);
                sessionStorage.setItem('scrmLevelID', details.LevelID || 0);
                sessionStorage.setItem('scrmPhotoSize', photoSizeValue != undefined ? Number(photoSizeValue) : 2); // default 2MB
                sessionStorage.setItem('scrmCaseLength', caseLengthValue != undefined ? Number(caseLengthValue) : 5); // default 5 records per page
                sessionStorage.setItem('scrmCaseLogLength', caseLogLengthValue != undefined ? Number(caseLogLengthValue) : 5); // default 5 records per page
                sessionStorage.setItem('scrmAgentId', details.AgentID || -1);
                sessionStorage.setItem('scrmSellerID', details.SellerID || -1);
                sessionStorage.setItem('scrmAgentName', details.AgentName || '');
                sessionStorage.setItem('scrmRoleName', details.RoleName || '');
                sessionStorage.setItem('scrmCustomCompany', customCompany);
                sessionStorage.setItem('scrmCompanies', companies);
                sessionStorage.setItem('scrmRestorable', restorable); // when logout will return to restore page
                sessionStorage.setItem('scrmCategories', details.Categories || '');
                sessionStorage.setItem('scrmFunctions', details.Functions || '');
                sessionStorage.setItem('scrmToken', details.Token || '');
                var expireDate = new Date(Date.parse(details.ExpiryDate));
                var today = new Date();
                const diffTime = Math.abs(expireDate - today);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays < 7) {
                    sessionStorage.setItem('scrmForceDetails', 'About to expire');
                    sessionStorage.setItem('scrmExpireInDay', diffDays);
                    window.location.href = './changePW.html';
                } else {
                    window.location.href = './main.html';
                }
                // to do compare
                // var thedate = new Date(Date.parse("2011-07-14 11:23:00"));

                // } else {
                // 	setTimeout(function () {
                // 		window.location.href = './main.html';
                // 	}, 2000)
                // }
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
}

$(document).ready(function() {
    localStorage.setItem('scrmLanguage', language);
    sessionStorage.setItem('scrmLanguage', language);
    setLanguage();
    // check is it resotrable by config
    restorable = getParameterByName('restorable') == 'true' ? true : (config.restorable || false);
    // check is it opened by customer company by url query
    customCompany = getParameterByName('custom') ? getParameterByName('custom') : (config.customCompany || 'no');
    $('#language-select').val(language);
    if (restorable) {
        $('[data-bs-toggle=confirmation]').confirmation({
            rootSelector: '[data-bs-toggle=confirmation]',
            popout: true,
            title: langJson['l-general-are-you-sure'],
            btnOkLabel: langJson['l-general-ok-label'],
            btnCancelLabel: langJson['l-general-cancel-label']
        });
        $('#restore-btn').removeClass('d-none');
    }
    if (customCompany != 'no' && (config.isDemo == undefined || !config.isDemo)) {
        var loginCompany = $('#login-company');
        loginCompany.attr('src', '.\\campaign\\' + customCompany + '\\logo.png');
        loginCompany.removeClass('d-none');
    }
    var staffID = document.getElementById('staffID');
    staffID.focus();

    $('#pwd').on({
        'input focus': function() {
            view_enable();
        },
        "blur": function() {
            view_disable();
        },
        'keydown': function(e) {
            pwd_onkeydown(e);
        }
    });
    
    $('.pwd-view').on({
        "mousedown": function(e) {
            view_pwd(e, this);
        },
        "mouseup mouseleave": function() {
            hide_pwd();
        }
    });
})
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());