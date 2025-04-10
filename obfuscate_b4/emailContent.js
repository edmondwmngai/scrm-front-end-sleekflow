var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var wiseHost = config.wiseHost;
//var haveFullBtn = window.frameElement.getAttribute('isFull') == 'true' ? false : true; // already isFull == true, no need to show resize button   //20250320 Unnecessary use of boolean literals in conditional expression.
var haveFullBtn = window.frameElement.getAttribute('isFull') != 'true';
var isFull = !haveFullBtn;
var isStick = false;
function resizeEmail(isInit) {
    if (parent.resizeEmail) {
        if (!isInit) {
            isFull = !isFull;
        }

        // full content height
        var newHeight = Math.ceil($('.main-card').height() + 17) || 500;
        if (isFull) {
            parent.resizeEmail(true, newHeight);
            $('#resize-btn').addClass('btn-success');
            $('#resize-btn').removeClass('btn-warning');
      //  } else {  // 20250410 'If' statement should not be the only statement in 'else' block

            // not full content
        } else if (newHeight < 303) {
                parent.resizeEmail(true, newHeight); // full size show
                $('#resize-btn').addClass('d-none');
        } else {
                parent.resizeEmail(false, newHeight);
                $('#resize-btn').addClass('btn-warning');
                $('#resize-btn').removeClass('btn-success');
           // } // 20250410 for else if 


        }
    }
}

function setLanguage() {
    $('.l-email-from').text(langJson['l-email-from']);
    $('.l-email-to').text(langJson['l-email-to']);
    $('.l-email-date-time').text(langJson['l-email-date-time']);
    $('.l-email-subject').text(langJson['l-email-subject']);
    $('.l-email-content').text(langJson['l-email-content']);
    $('.l-email-attachments').text(langJson['l-email-attachments']);
}

function windowOnload() {
    var time = window.frameElement.getAttribute("timestamp") || '';
    var name = window.frameElement.getAttribute("name") || '';
    if (name.length > 0) { name += '&nbsp;'; }
    setLanguage();
    if (haveFullBtn) {
        $('#resize-btn').removeClass('d-none');
    }
    $.ajax({
        type: "POST",
        url: config.wiseHost + '/WisePBX/api/Email/GetContent',
        data: JSON.stringify({ "id": window.frameElement.getAttribute("mediaId") || -1 }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (r) {
            var data = r.data;
            var from = '<' + data.From + '>';
            $("#name").html(name);
            $("#time").text(time.replace('T', ' '));
            $("#from").text(from);
            $("#to").text(data.To);
            $("#subject").text(data.Subject);

            var emailContent = data.Body;
            emailContent = emailContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            var imgMatch = emailContent.match(/<img/g);
            var imgLength = 0;
            if (imgMatch != null) {
                imgLength = emailContent.match(/<img/g).length;
            }
            var attachments = data.Attachments;
            for (var i = 0; i < imgLength; i++) {
                var imgTagIdx = emailContent.indexOf('<img ', imgLastIdx);
                var imgLastIdx = emailContent.indexOf('>', imgTagIdx);
                var imgTag = emailContent.slice(imgTagIdx, imgLastIdx + 1);
                var imgType = imgTag.indexOf('jpg') != -1 ? 'jpeg' : 'png';
                var imgNameIdx = imgTag.indexOf('cid:') + 4;
                var fileName = imgTag.slice(imgNameIdx, imgTag.indexOf('@', imgNameIdx));
                for (var j = 0; j < attachments.length; j++) {
                    if (attachments[j].FileName == fileName) {
                        var newEmailContent = emailContent.slice(0, imgTagIdx) + '<img name="email-img" src="data:image/' + imgType + ';charset=utf-8;base64,' + attachments[j].Base64Data + '">' +
                            emailContent.slice(imgLastIdx + 1);
                        emailContent = newEmailContent;
                        attachments.splice(j, 1);
                        break;
                    }
                }
            }
            $("#content").html(emailContent);
            for (i = 0; i < attachments.length; i++) {
                var attachment = attachments[i];
                var objDiv = document.createElement("span");
                var attaFileName = attachment.FileName;
                var escapedFileName = escape(attaFileName);
                var newFileName = attaFileName;
                if (attaFileName.length > 15) { newFileName = attaFileName.slice(0, 14); }
                objDiv.setAttribute("class", "email-attach-tag");
                objDiv.setAttribute("onclick", "download('data:" + attachment.ContentType + ";base64," + attachment.Base64Data + "','" + escapedFileName + "','" + attachment.ContentType + "');");
                objDiv.textContent = newFileName;
                $("#attachment").append(objDiv);
            }

            // set medaiContent which already have CreateDateTime attribute
            for (var attrName in data) {
                parent.mediaContent[attrName] = data[attrName]
            }

            // resize email
            resizeEmail(true);
        },
        error: function (r) {
            console.log('An error occurred.');
            console.log(r);
        },
    });
}
$(document).ready(function () {
    if (parent.parent.iframeRecheck) {
        parent.parent.iframeRecheck($(parent.document));
    }
});
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());