(function(){
	const mediaId=$('#media-content2').data('mediaId');
	$('.l-form-timestamp').text(langJson['l-form-timestamp']);
	$('.l-vmail-caller-display').text(langJson['l-vmail-caller-display']);
	$('.l-form-play-voicemail').text(langJson['l-form-play-voicemail']);
	$('.l-vmail-subject').text(langJson['l-vmail-subject']);

	$.ajax({
		type: "POST",
		url: config.wiseUrl + '/api/Vmail/GetContent',
		data: JSON.stringify({ "id": mediaId }),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (r) {
			if (!/^success$/i.test(r.result || "")) {
				console.log('error in vmailContent2.js');
			} else {
				buildContent(r.data);
			}
		},
		error: function (r) {
			console.log('error in vmailContent2.js');
			console.log(r);
		}
	});
})();

function buildContent(details) {
	const mediaPath = details.FileUrl;
	const timestamp = details.CreateDateTime;
	const callerDisplay = details.CallerDisplay;
	const subject = details.Subject;
	const asrContent = details.ASRContent;
	
	$('#media-content2 #vmail-timestamp').text(timestamp.replace('T', ' '));
	$('#media-content2 #vmail-caller').text(callerDisplay);
	if (mediaPath.length > 0) {
		$(`<video controls="" style="height:27px;" controlsList="${canDownloadVoice ? '' : 'nodownload'}"><source src="${mediaPath}" type="audio/wav"></video>`).appendTo('#media-content2 #audio-player');
	}
	$('#media-content2 #vmail-subject').text(subject);
	$('#media-content2 #vmail-content').text(asrContent);
}
