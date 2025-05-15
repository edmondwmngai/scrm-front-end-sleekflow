var mediaId;
var mediaPath;
var timestamp = '';
var callerDisplay = '';
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
// Check can user download voice
var functions = sessionStorage.getItem('scrmFunctions') || '';
var canDownloadVoice = functions.indexOf('Download-Voice') != -1;
var downloadVoiceStr = canDownloadVoice ? '' : ' controlsList="nodownload"';
function setLanguage() {
    $('.l-form-timestamp').text(langJson['l-form-timestamp']);
    $('.l-vmail-caller-display').text(langJson['l-vmail-caller-display']);
    $('.l-form-play-voicemail').text(langJson['l-form-play-voicemail']);
    $('.l-vmail-subject').text(langJson['l-vmail-subject']);
}
function buildContent() {
    $("#timestamp-span").text(timestamp.replace('T', ' '));
    $("#vmail-caller").text(callerDisplay);
    $("#vmail-subject").text(window.frameElement.getAttribute("subject") || '');
	var vmailPath = window.frameElement.getAttribute("mediaPath") || '';

    //if (config.isHttps) {		//20250411 should not be currently used which is replace by vmailPath
    //    voiceUrl = voiceUrl.replace(voiceUrl.substr(0,voiceUrl.indexOf("/wisepbx/")), wiseHost);
    //}
    if (vmailPath.length > 0) {
        $('<video controls="" name="media" style="height:27px;width:95%;"' + downloadVoiceStr + '><source src="' + vmailPath + '" type="audio/wav"></video>').appendTo('#audio-player');
    }
    parent.document.getElementById("media-content").height = '80px';//將子頁面高度傳到父頁面框架
    // if the content load slower than the input form, will need to resize this input form
    if (parent.resize) {
        parent.resize();
    }
}
function getContent() {
    $.ajax({
        type: "POST",
        url: config.wiseUrl + '/api/Vmail/GetContent',
        data: JSON.stringify({ "id": mediaId }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in caseRecordPopupOnload');
            } else {
                var details = r.data;
                mediaPath = details.FileUrl;
                timestamp = details.CreateDateTime;
                callerDisplay = details.CallerDisplay;
                buildContent();
            }
        },
        error: function (r) {
            console.log('error in caseRecordPopupOnload');
            console.log(r);
        }
    });
}
function vmailContentOnload() {
    setLanguage();
    mediaId = window.frameElement.getAttribute("mediaId") || -1;
    mediaPath = window.frameElement.getAttribute("mediaPath");
    if (mediaPath == undefined) {
        getContent();
        return;
    } else {
        timestamp = window.frameElement.getAttribute("timestamp") || '';
        callerDisplay = window.frameElement.getAttribute("callerDisplay") || '';
        buildContent();
    }
    if (parent.parent && parent.parent.iframeRecheck) {
        parent.parent.iframeRecheck($(parent.document));
    }
}
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());