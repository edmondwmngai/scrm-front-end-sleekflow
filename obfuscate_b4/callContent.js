var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mediaId = window.frameElement.getAttribute("mediaId") || -1;
// Check can user download voice
var functions = sessionStorage.getItem('scrmFunctions') || '';
var canDownloadVoice = functions.indexOf('Download-Voice') != -1;
var downloadVoiceStr = canDownloadVoice ? '' : ' controlsList="nodownload"';
var wiseHost = config.wiseHost;
var parentTab = parent.tabType;

function setLanguage() {
    $('.l-form-timestamp').text(langJson['l-form-timestamp']);
    $('.l-vmail-caller-display').text(langJson['l-vmail-caller-display']);
    $('.l-form-play-call').text(langJson['l-form-play-call']);
    $('.l-call-reload').text(langJson['l-call-reload']);
}

function resize() {
    parent.document.getElementById("media-content").height = '91px'; //將子頁面高度傳到父頁面框架
    if (parent.resize) {
        parent.resize();
    }
}

function resetVideo() {
    $('#loading-icon').removeClass('d-none');
    $('#video').remove();
    loadCallData();
}

function loadCallData() {
    $.ajax({
        type: "POST",
        url: wiseHost + '/WisePBX/api/Call/GetContent',
        data: JSON.stringify({
            "id": mediaId
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                // As for Inbound Call may be still talking, so will not have successful result
                // if ($('#video').length == 0) {
                //     $("<span id='video' class='text-gray'><i class='fa fa-exclamation-triangle me-2'></i><span>Please try to reload later</span></span>").appendTo('#audio-player');
                // }
                $('#reload-later').removeClass('d-none');
                $('#loading-icon').addClass('d-none');
                resize();
                setTimeout(function () {
                    resetVideo();
                }, 5000);
            } else {
                var mediaContent = r.data[0];
                var timestamp = mediaContent.TimeStamp;
                var callerDisplay = mediaContent.CallerDisplay || '';
                var voiceUrl = mediaContent.FileUrl || '';
                $("#timestamp-span").text(timestamp.replace("T", " "));
                $('#caller-display').text(callerDisplay);
                if (voiceUrl.length > 0) {
                    if (config.isHttps) {
                        voiceUrl = voiceUrl.replace(voiceUrl.substr(0,voiceUrl.indexOf("/wisepbx/")), wiseHost);
                    }
                    $('#video').remove();
                    $('<video id="video" controls="" name="media" class="video-tag"' + downloadVoiceStr + '><source src="' + voiceUrl + '" type="audio/wav"></video>').appendTo('#audio-player');
                }
                $('#loading-icon').addClass('d-none');
                resize();
            }
        },
        error: function (r) {
            // As for Inbound Call may be still talking, so will not have successful result
            if ($('#video').length == 0) {
                $("<span id='video' class='text-gray'><i class='fa fa-exclamation-triangle me-2'></i><span>Please try to reload later</span></span>").appendTo('#audio-player');
            }
            $('#loading-icon').addClass('d-none');
            resize();
            setTimeout(function () {
                resetVideo();
            }, 5000);
        }
    });
}

function windowOnload(isReload) {
    if (isReload) {
        $('#loading-icon').removeClass('d-none');
    } else {
        setLanguage();
    }

    if (parentTab == 'traditional') {

        // for inbound call cannot get call content that soon
        setTimeout(function () {
            loadCallData();
        }, 4000);
    } else {
        loadCallData();
    }
    // As the call may not yet being able to load the data, so shows the caller display when having it first
    var callerDisplay = window.frameElement.getAttribute("callerDisplay") || '';
    if (callerDisplay.length > 0) {
        $('#caller-display').text(callerDisplay);
    }
}
$(document).ready(function () {
    if (parent.parent.iframeRecheck) {
        parent.parent.iframeRecheck($(parent.document));
    }
});
document.addEventListener('contextmenu', event => event.preventDefault());