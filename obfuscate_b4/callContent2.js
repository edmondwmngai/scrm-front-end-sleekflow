(function(){
	const mediaId=$('#media-content2').data('mediaId');
	$('.l-form-timestamp').text(langJson['l-form-timestamp']);
	$('.l-vmail-caller-display').text(langJson['l-vmail-caller-display']);
	$('.l-form-play-call').text(langJson['l-form-play-call']);
	$('.l-call-reload').text(langJson['l-call-reload']);
	loadCallData(mediaId);
})();

function resetVideo(mediaId) {
    $('#media-content2 #loading-icon').removeClass('d-none');
    $('#media-content2 #video').remove();
    loadCallData(mediaId);
}

function loadCallData(mediaId)
{
	$.ajax({
        type: "POST",
        url: config.wiseUrl + '/api/Call/GetContent',
        data: JSON.stringify({
            "id": mediaId
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                $('#media-content2 #reload-later').removeClass('d-none');
                $('#media-content2 #loading-icon').addClass('d-none');
                
                setTimeout(function () {
                    resetVideo(mediaId);
                }, 5000);
            } else {
                var mediaContent = r.data[0];
                var timestamp = mediaContent.TimeStamp;
                var callerDisplay = mediaContent.CallerDisplay || '';
                var voiceUrl = mediaContent.FileUrl || '';
                $("#media-content2 #timestamp-span").text(timestamp.replace("T", " "));
                $('#media-content2 #caller-display').text(callerDisplay);
                if (voiceUrl.length > 0) {
                    if (config.isHttps) {
                        voiceUrl = voiceUrl.replace(voiceUrl.substr(0,voiceUrl.indexOf("/wisepbx/")), wiseHost);
                    }
                    $('#audio-player').empty();
                    $(`<video controls style="height:27px;" controlsList="${canDownloadVoice ? '' : 'nodownload'}"><source src="${voiceUrl}" type="audio/wav"/></video>`).appendTo('#audio-player');
                }
                $('#loading-icon').addClass('d-none');
            }
        },
        error: function (r) {
            if ($('#video').length == 0) {
                $("<span id='video' class='text-gray'><i class='fa fa-exclamation-triangle me-2'></i><span>Please try to reload later</span></span>").appendTo('#audio-player');
            }
            $('#loading-icon').addClass('d-none');
            resize();
            setTimeout(function () {
                resetVideo(mediaId);
            }, 5000);
        }
    });
}
