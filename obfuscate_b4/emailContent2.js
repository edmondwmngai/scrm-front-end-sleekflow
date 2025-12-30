(function(){
	const mediaId=$('#media-content2').data('mediaId');
	$('.l-email-from').text(langJson['l-email-from']);
	$('.l-email-to').text(langJson['l-email-to']);
	$('.l-email-date-time').text(langJson['l-email-date-time']);
	$('.l-email-subject').text(langJson['l-email-subject']);
	$('.l-email-content').text(langJson['l-email-content']);
	$('.l-email-attachments').text(langJson['l-email-attachments']);

	$.ajax({
		type: "POST",
		url: config.wiseUrl + '/api/Email/GetContent',
		data: JSON.stringify({ "id": mediaId }),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (r) {
			if (!/^success$/i.test(r.result || "")) {
				console.log('error in emailContent2.js');
			} else {
				//console.log(r.data);
				buildContent(r.data);
			}
		},
		error: function (r) {
			console.log('error in emailContent2.js');
			console.log(r);
		}
	});
})();

function buildContent(data) {
	$("#media-content2 #from").text(`<${data.From}>`);
	$("#media-content2 #to").text(`<${data.To}>`);
	$("#media-content2 #time").text(data.TimeStamp.replace('T', ' '));
	$("#media-content2 #subject").text(`<${data.Subject}>`);
	let content = data.Body;
	const htmlString =content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlString, 'text/html');
	let attachments=data.Attachments;
	//console.log(attachments);

	doc.querySelectorAll('img').forEach((img) => {
		const attachment = attachments.find(a=>img.src.includes(a.FileName));
		if(attachment) {
			img.src=`data:${attachment.ContentType};charset=utf-8;base64,${attachment.Base64Data}`;
			attachments=attachments.filter(obj => obj.ContentId !== attachment.ContentId);
		}
	});
	$("#media-content2 #content").html(doc.body.innerHTML);
	for(const attachment of attachments){
		const contentType=attachment.ContentType;
		const base64Data=attachment.Base64Data;
		const fileName=attachment.FileName;
		const objDiv =$('<span/>', {
			class: 'email-attach-tag',
			onclick: `download('data:${contentType};base64,${base64Data}','${escape(fileName)}','${contentType}')`,
			text : (fileName.length>15)? fileName.slice(0, 14) : fileName,
		});
		$("#media-content2 #attachment").append(objDiv);
	}
}
