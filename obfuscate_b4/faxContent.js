var tiff = null;
var rotateStatus = 0;
var mediaId = -1;
var mediaPath = '';
var timestamp = '';
var callerDisplay = '';
var isPopup = false;
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
function setLanguage() {
    $('.l-form-timestamp').text(langJson['l-form-timestamp']);
    $('.l-fax-caller-display').text(langJson['l-fax-caller-display']);
    $('.l-fax-fax-id').text(langJson['l-fax-fax-id']);
    $('.l-fax-page').text(langJson['l-fax-page']);
    $('.l-fax-open').text(langJson['l-fax-open']);
    $('.l-fax-rotate').text(langJson['l-fax-rotate']);
    $('.l-fax-loading').text(langJson['l-fax-loading']);
}
var changePageNo = function (no) {
    tiff.setDirectory(no - 1);
    var htmlCanvas = tiff.toCanvas();
    $("#tiff-image").attr("src", htmlCanvas.toDataURL());
}

function openPopup() {
    var openWindows = parent.parent.openWindows || parent.parent.parent.parent.openWindows; // opened by Fax List || opened by Admin Transfer
    var faxPopup = window.open('./faxContent.html', '_blank');
    openWindows[openWindows.length] = faxPopup;
    faxPopup.onload = function () {
        faxPopup.onbeforeunload = function () {
            for (var i = 0; i < openWindows.length; i++) {
                if (openWindows[i] == faxPopup) {
                    openWindows.splice(i, 1);
                    break;
                }
            }
        }
    }
}
function rotateTiff() {
    var tiffImage = $('#tiff-image');

    var prefix = isPopup ? 'pop-' : '';
    if (rotateStatus == 0) {
        tiffImage.attr('class', prefix + 'rotate-90');
        rotateStatus = 1;
    } else if (rotateStatus == 1) {
        tiffImage.attr('class', prefix + 'rotate-180');
        rotateStatus = 2;
    } else if (rotateStatus == 2) {
        tiffImage.attr('class', prefix + 'rotate-270');
        rotateStatus = 3;
    } else {
        tiffImage.attr('class', prefix + 'default-image');
        rotateStatus = 0;
    }
}

function buildContent() {
    $("#media-id").text(mediaId);
    $("#timestamp-span").text(timestamp.replace('T', ' '));
    $("#media-caller").text(callerDisplay);
    if (mediaPath.length > 0) {
        // $('<div>' + mediaPath + '</div>').appendTo('#audio-player');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', mediaPath);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (e) {
            tiff = new Tiff({ buffer: xhr.response });
            for (var i = 0, len = tiff.countDirectory(); i < len; ++i) {
                $('#page-no').append($("<option/>", {
                    value: i + 1,
                    text: i + 1
                }));
            }
            $('#page-no').val("1");

            tiff.setDirectory(0);

            var htmlCanvas = tiff.toCanvas();
            $("#tiff-image").attr("src", htmlCanvas.toDataURL());
            $('#loading-tiff').remove();
        };
        xhr.send();
        if (!isPopup) { // if not pop-up
            parent.document.getElementById("media-content").height = '188px'; //將子頁面高度傳到父頁面框架
        }
    }
}
function getContent() {
    mediaId = window.frameElement.getAttribute("mediaId");
    $.ajax({
        type: "POST",
        url: config.wiseUrl + '/api/Fax/GetContent',
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

function windowOnload() {
    setLanguage();
    // if opened by pop-up should have alue for these 2 variables
    var mediaIdQuery = window.opener ? window.opener.mediaId : null;
    var mediaPathQuery = window.opener ? window.opener.mediaPath : null;
    if (mediaIdQuery != null) {
        isPopup = true;
        $('#tiff-image').attr('class', 'pop-default-image');
        // pop-up fax content
        mediaId = mediaIdQuery;
        mediaPath = mediaPathQuery;
        timestamp = window.opener ? window.opener.timestamp : null;
        callerDisplay = window.opener ? window.opener.callerDisplay : null;
    } else {
        $('<span class="fax-fn-btn" onclick="openPopup()">' + langJson['l-fax-open'] + '</span>').insertAfter('#page-no');
        var noTop = window.frameElement.getAttribute("noTop") || null;

        if (noTop && noTop == 'Y') {
            $('.line-bottom-container-first').hide();
        }
        if (window.frameElement.getAttribute("mediaPath") == undefined) {
            // load by conn_Id
            getContent();
            return;
        } else {
            // load by parent
            mediaId = window.frameElement.getAttribute("mediaId") || -1;
            mediaPath = window.frameElement.getAttribute("mediaPath") || '';
            timestamp = window.frameElement.getAttribute("timestamp") || '';
            callerDisplay = window.frameElement.getAttribute("callerDisplay") || '';
        }
    }
    buildContent();
}

$(document).ready(function () {
    if (isPopup) {
        /*if (window.opener && window.opener.parent && window.opener.parent.addPopupIdle) {
            window.opener.parent.addPopupIdle($(document));
        }*/			//20250516 Prefer using an optional chain expression instead, as it's more concise and easier to read.
		window.opener?.parent?.addPopupIdle?.($(document));
		
    //} else {  // 20250410 'If' statement should not be the only statement in 'else' block
    /*} else if (parent.parent && parent.parent.iframeRecheck) {
            parent.parent.iframeRecheck($(parent.document));
       // } // 20250410 for else if 
    }*/
	} else {   // 20250516 Prefer using an optional chain expression instead, as it's more concise and easier to read.
		parent?.parent?.iframeRecheck?.($(parent.document));
	}

});
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());