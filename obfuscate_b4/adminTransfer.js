var campaign = parent.campaign || '';
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var tryLoadAgentCount = 0;
var channelSimplify = {
    Inbound_Email: 'email',
    Inbound_Voicemail: 'vmail',
    Inbound_Fax: 'fax'
}

function resize() {
    var body = document.body,
        html = document.documentElement;
    var newHeight = Math.ceil((Math.max(body.scrollHeight, body.offsetHeight,
        html.offsetHeight) + 20)) || 500;
    parent.document.getElementById("search").height = newHeight + 'px'; //將子頁面高度傳到父頁面框架 // no need to add extra space
}

function setLanguage() {
    $('.l-menu-all').text(langJson['l-menu-all']);
    $('.l-menu-email').get(0).nextSibling.data = langJson['l-menu-email'];
    $('.l-menu-voicemail').get(0).nextSibling.data = langJson['l-menu-voicemail'];
    $('.l-menu-fax').get(0).nextSibling.data = langJson['l-menu-fax'];
    $('.l-menu-transfer-from').text(langJson['l-menu-transfer-from']);
}

function windowOnload() {
    console.log('adminTransfer');
    setLanguage();
    var agentList = parent.parent.agentList;
    if (typeof agentList !== 'undefined' && agentList.length > 0) {
        for (let option of agentList) {
            var theAgentId = option.AgentID;
            $("#from-agent-list").append('<option LevelID=' + option.LevelID + ' value=' + theAgentId + '>' + option.AgentName + ' (ID: ' + theAgentId + ')</option>');
        }
    } else {
        if (tryLoadAgentCount < 4) {
            tryLoadAgentCount += 1;
            setTimeout(function () { windowOnload() }, 3000);
        }
    }
}

function confirmClicked() {
    var selectedAgent = $("#from-agent-list").val();
    // Verify is no agent selected
    if (selectedAgent == '') {
        $('#input-form-email').src = '';
        $('#input-form-vmail').src = '';
        $('#input-form-fax').src = '';
        return;
    }
    var completeChannel = $('input[name=channel]:checked')[0].value;
    var channel = channelSimplify[completeChannel]

    console.log('agentId of confirm clicked');
    console.log(selectedAgent);
    console.log('campaign');
    console.log(campaign);

    var campaignDnis = parent.parent.document.getElementById("phone-panel").contentWindow.wiseGetServiceInfo(campaign);

    if (completeChannel == 'All') {
        var emailNotFound = true;
        var vmailNotFound = true;
        var faxNotFound = true;
        var theDnis;
        for (let dnisObj of campaignDnis) {
            var campaignChannel = dnisObj.channel;
            if (campaignChannel == 'Inbound_Email') {
                theDnis = dnisObj.dnis;
                var emailIframe = $('#input-form-email');
                emailIframe.attr('details', theDnis);
                emailIframe.attr('selected-agent', selectedAgent);
                emailIframe.attr('src', '../email.html');
                emailIframe.show();
                emailNotFound = false;
            } else if (campaignChannel == 'Inbound_Voicemail') {
                theDnis = dnisObj.dnis;
                var vmailIframe = $('#input-form-vmail');
                vmailIframe.attr('details', theDnis);
                vmailIframe.attr('selected-agent', selectedAgent);
                vmailIframe.attr('src', '../vmail.html');
                vmailIframe.show();
                vmailNotFound = false;
            } else if (campaignChannel == 'Inbound_Fax') {
                theDnis = dnisObj.dnis;
                var faxIframe = $('#input-form-fax');
                faxIframe.attr('details', theDnis);
                faxIframe.attr('selected-agent', selectedAgent);
                faxIframe.attr('src', '../fax.html');
                faxIframe.show();
                faxNotFound = false;
            }
        }
        if (emailNotFound) {
            $('#input-form-email').attr('src', '../email.html').show();
        }
        if (vmailNotFound) {
            $('#input-form-vmail').attr('src', '../vmail.html').show();
        }
        if (faxNotFound) {
            $('#input-form-fax').attr('src', '../fax.html').show();
        }
    } else {
        // hide another two channels
        if (channel == 'email') {
            $('#input-form-fax').hide();
            $('#input-form-vmail').hide();
        } else if (channel == 'vmail') {
            $('#input-form-email').hide();
            $('#input-form-fax').hide();
        } else if (channel == 'fax') {
            $('#input-form-email').hide();
            $('#input-form-vmail').hide();
        }
        var dnisNotFound = true;
        for (let campaignDnisObj of campaignDnis) {
            if (campaignDnisObj.channel == completeChannel) {
                theDnis = campaignDnisObj.dnis;
                var theIframe = $('#input-form-' + channel);
                theIframe.attr('details', theDnis);
                theIframe.attr('selected-agent', selectedAgent);
                theIframe.attr('src', '../' + channel + '.html');
                theIframe.show();
                dnisNotFound = false;
                break;
            }
        }
        if (dnisNotFound) {
            $('#input-form-' + channel).attr('src', '../' + channel + '.html').show();
        }
    }
}

$(document).on("change", "input[name=channel]", function () {
    confirmClicked();
});
$(document).ready(function () {
    if (parent.parent.iframeRecheck) {
        parent.parent.iframeRecheck($(parent.document));
    }
});
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());