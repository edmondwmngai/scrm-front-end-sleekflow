// declare the account fields
var mediaContent;
var mediaType;
var fbId = null;
var originalTicketId = null;
var ticketId = null;
var details;
var mediaLink;
var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';
// declare the parameters accessing change of fields and upload of photos
var fieldChanged = false;
var mediaChanged = false;
var mediaRemoved = "N";
var photoSrc = './images/user.png'; // default photo source
var changedField = {};
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var mvcUrl = config.mvcUrl;

function setLangage() {
    $('.l-fb-ticket-id').text(langJson['l-fb-ticket-id']);
    $('.l-fb-media').text(langJson['l-fb-media']);
    $('.l-fb-choose-media').text(langJson['l-fb-choose-media']);
    $('.l-fb-remove-media').text(langJson['l-fb-remove-media']);
    $('.l-fb-media-type').text(langJson['l-fb-media-type']);
    $('.l-fb-none').text(langJson['l-fb-none']);
    $('.l-fb-details').text(langJson['l-fb-details']);
    $('.l-general-save').text(langJson['l-general-save']);
    $('.l-general-cancel').text(langJson['l-general-cancel']);
}
// After selecting photo for upload
function previewMedia(input) {
    var mediaFile = input.files[0];
    if (input.files && mediaFile) {
        // verify file type
        if (mediaFile.type != 'image/jpeg' && mediaFile.type != 'image/gif' && mediaFile.type != 'image/png' && mediaFile.type != 'video/mp4') {
            alert(langJson['l-alert-not-valid-image']);
            // clear file
            var fileInput = $("#p-file-to-upload")
            fileInput.replaceWith(fileInput.val('').clone(true));
            // reset picture to original
            var photo = document.getElementById('profile-pic');
            photo.src = photoSrc;
            return;
        }

        mediaType = mediaFile.type;
        $('#media-type-label').text(mediaType);

        // verify file size
        var limitedSizeMB = sessionStorage.getItem('scrmPhotoSize') ? sessionStorage.getItem('scrmPhotoSize') : 5; // default limit 3MB
        if (mediaFile.size / 1024 / 1024 > limitedSizeMB) {
            alert(langJson['l-alert-photo-size-cannot-exceed'] + limitedSizeMB + 'MB');
            // clear file
            var fileInput = $("#p-file-to-upload");
            fileInput.replaceWith(fileInput.val('').clone(true));
            // reset picture to original
            var photo = document.getElementById('profile-pic');
            photo.src = photoSrc;
            return;
        }

        if (mediaType == 'video/mp4') {
            $('#video').show(); // show video playbox
            $('#profile-pic').hide();

            // set video to playbox
            var fileUrl = window.URL.createObjectURL(mediaFile);
            $('#video').attr('src', fileUrl);
        } else {
            $('#video').hide();
            $('#profile-pic').show(); // show pic

            // set profile picture
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#profile-pic').attr('src', e.target.result);

            }
            reader.readAsDataURL(mediaFile);
        }
    }
}

function removeMedia() {
    //$(this).prev("img").remove();
    //$('#profile-pic').remove();
    //$('#video').remove();

    // clear file
    var fileInput = $("#p-file-to-upload")
    fileInput.replaceWith(fileInput.val('').clone(true));
    $("#profile-pic").removeAttr("src").attr("src", "");
    $("#video").removeAttr("src").attr("src", "");
    mediaRemoved = "Y";
}

// create facebook post content
function createFacebookPostContent(ticketId, details, isMediaChanged) {
    $.ajax({
        type: "POST",
        url: mvcUrl + '/api/CreateFacebookPostContent',
        data: JSON.stringify({
            Ticket_Id: ticketId,
            Agent_Id: loginId,
            Details: details,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        var counter = 1;
        var details = res.details;
        if (!/^success$/i.test(res.result || "")) {
            console.log("error /n" + res ? res : '');
			console.log(details); 		// 20250415 Remove the declaration of the unused 'details' variable.
        } else {
            counter = counter - 1;
            if (counter == 0) {
                if (!isMediaChanged) {
                    window.close();
                }
                window.opener.location.reload(true); // reload the content page
            }
        }
    });
}

// update facebook post content
function updateFacebookPostContent(fbId, ticketId, details, isMediaChanged, isMediaRemoved) {
    $.ajax({
        type: "PUT",
        url: mvcUrl + '/api/UpdateFacebookPostContent',
        data: JSON.stringify({
            Fb_Id: fbId,
            Ticket_Id: ticketId,
            Agent_Id: loginId,
            Details: details,
            Media_Removed: isMediaRemoved,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        var counter = 1;
        var details = res.details;
        if (!/^success$/i.test(res.result || "")) {
            console.log("error /n" + res ? res : '');
			console.log(details); 		// 20250415 Remove the declaration of the unused 'details' variable.
        } else {
            counter = counter - 1;
            if (counter == 0) {
                if (!isMediaChanged || mediaRemoved == "Y") {
                    window.close();
                }
                window.opener.location.reload(true);
            }
        }
    });
}

function checkDuplicates(ticketIdInput) {
    $.ajax({
        type: "POST",
        url: mvcUrl + '/api/CheckTicketId/',
        data: JSON.stringify({
            Ticket_Id: ticketIdInput,
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        var isTaken = res.result;
        if (isTaken) {
            $('#ticket-id-error').text('This ticket id is taken.');
            $('#ticket-id-error').css('color', 'red');
            //$('#txt-agent-id').val('');
        } else {
            $('#ticket-id-error').text('This ticket id is not taken.');
            $('#ticket-id-error').css('color', 'green');
        }
    });
}



//when the account pop-up window is onload
function fbPopupOnload() {
    setLangage();
    var windowOpener = window.opener;
    var queryObj = windowOpener.selectedPost;

    if (queryObj == null) {
        // for create fb post content, change the header
        $("#p-header").text(langJson['l-fb-add-a-fb-post']); // set header text

        $('#profile-pic').hide(); // hide image initially
        $('#video').hide(); // hide video playbox initially                
    } else {
        // for update fb post content
        $("#p-header").text(langJson['l-fb-update-a-fb-post']); // set header text
        // obtain photo content and photo type
        mediaContent = queryObj.Media_Link;
        mediaType = queryObj.Media_Type;
        var media = document.getElementById('profile-pic'); // image
        if (mediaType == "video/mp4") {
            $('#profile-pic').hide();
            media = document.getElementById('video'); // video
//        } else {      // 20250410 'If' statement should not be the only statement in 'else' block
        } else if (mediaType && mediaType.length > 0) {
                $('#profile-pic').show();
                $('#video').hide(); // hide video playbox
            //}// 20250410 for else if 
        }
        if (mediaContent != null) {
            var pathname = window.location.pathname;
            var pathArr = pathname.split('/');
            var companyPathName = pathArr.length > 2 ? pathArr[1] : 'crm';
            var massagedMediaContent = mediaContent.replace('.', '').replace(/\\/g, '/');
            media.src = mvcHost + '/' + companyPathName + massagedMediaContent;
        }

        // obtain other field values
        fbId = queryObj.Fb_Id;
        ticketId = queryObj.Ticket_Id;
        originalTicketId = queryObj.Ticket_Id;
        details = queryObj.Details;

        // set the field values
        $('#txt-ticket-id').val(ticketId);
        $('#txt-details').val(details);
        $('#media-type-label').text(mediaType);
    }

    // check duplicate
    $('#txt-ticket-id').change(function () {
        fieldChanged = true;
        var ticketIdInput = parseInt($('#txt-ticket-id').val());
        if (!isNaN(ticketIdInput) && ticketIdInput.length != 0 && ticketIdInput != originalTicketId) {
            checkDuplicates(ticketIdInput);
        } else {
            $('#ticket-id-error').text('This is the original ticket id');
            $('#ticket-id-error').css('color', 'green');
        }
    })

    // when media is chosen, call this function
    $(".verify-media").change(function () {
        mediaChanged = true;
    });

    // when field has changed, call this function
    $(".form-group").change(function () {
        fieldChanged = true;
        //changedField[$(this).attr('name')] = $(this).val();
    });
}

// Cancel is clicked
function clearForm() {
    // close window
    window.close();
}

function validateForm(formType, ticketId) {
    var hasError = false;

    // validate ticket id
    if (ticketId.length == 0) {
        $('#ticket-id-error').text('This field is required.'); // for blank fields
        $('#ticket-id-error').css('color', 'red');
        hasError = true;
    } else {
        
        var numRegex = /^-?\d*$/;   // var numRegex = /^-?[0-9]*$/;     // 20250408 Use concise character class syntax '\d' instead of '[0-9]'.
        var isNumeric = numRegex.test(ticketId);
        if (isNumeric) {
            var ticket_id = parseInt(ticketId);
            //var agentIdExists = checkDuplicates(agent_id);
            checkDuplicates(ticket_id);

            // if ($('#ticket-id-error').text() == 'This ticket id is taken.' && formType == 'create') {
            //     hasError = true;
            // } else if ($('#ticket-id-error').text() == 'This ticket id is taken.' && formType == 'update') {

            // }
            if ($('#ticket-id-error').text() == 'This ticket id is taken.') {
                hasError = true;
            }
        } else {
            $('#ticket-id-error').text('Ticket ID should be a number.') // for non-numeric values
            $('#ticket-id-error').css('color', 'red');
            hasError = true;
        }
    }

    $('#validation-result').text(hasError);
}

// Submit is clicked
function submitForm() {
    var changeCounter = 0;

    // add counter when there are changes
    if (fieldChanged) {
        changeCounter = 1;
    }

    if (mediaChanged || mediaRemoved == "Y") {
        changeCounter += 1;
    }

    // if there isn't any changes, just close the window
    if (changeCounter == 0) {
        window.close();
    }

    var header = $("#p-header").text();
    var formType;
    if (header == "Add a Facebook Post") {
        formType = 'create';
    } else {
        formType = 'update';
    }

    //var formHasError = false; // initialise error bool


    var ticket_id = 0; // ticket id in int format 
    // obtain other field values
    ticketId = $('#txt-ticket-id').val();
    details = $('#txt-details').val();
    mediaType = $('#media-type-label').text();

    if (ticketId != originalTicketId) {
        validateForm(formType, ticketId);
    }
    var formHasError = $('#validation-result').text();

    // validate the field values

    if (formHasError == 'true') {
        event.preventDefault(); // do not submit form
    } else {
        ticket_id = parseInt(ticketId);
        if (fieldChanged) {
            if (fbId == null) { // 
                // create facebook post content
                createFacebookPostContent(ticket_id, details, mediaChanged)
            } else {
                // update user
                updateFacebookPostContent(fbId, ticket_id, details, mediaChanged, mediaRemoved);
            }
        } else if (!fieldChanged && mediaRemoved == "Y") {
            updateFacebookPostContent(fbId, ticket_id, details, mediaChanged, mediaRemoved); // keep update
        }

        // ========================== Upload Media (if needed) ==========================
        if (mediaChanged) {
            // upload photo
            var fileUpload = $("#p-file-to-upload").get(0);
            var fileUploadFiles = fileUpload.files;
            if (fileUploadFiles.length > 0) {
                var fileData = new FormData();
                var theFile = fileUploadFiles[0];
                // file extention
                var fileName = theFile.name;
                var fileNameWithoutExt = fileName.split('.').shift().trim();
                var fileExtention = fileName.split('.').pop();
                
                // new file name: file name with ticket id because if not do so, if another person uploaded same name file for another ticket that will be an issue
                fileData.append("Media_File", theFile, fileNameWithoutExt + '_' + ticket_id + (fileExtention.length == 0 ? '' : ('.' + fileExtention)));
                fileData.append('Ticket_Id', ticket_id);
                fileData.append('Agent_Id', loginId);
                fileData.append('Token', token);
                $.ajax({
                    url: mvcUrl + '/api/UploadFacebookMedia',
                    type: "POST",
                    contentType: false, // Not to set any content header  
                    processData: false, // Not to process data  
                    data: fileData,
                    dataType: 'multipart/form-data',
                }).always(function (r) {
                    // status 200 , response is still fail by form data request
                    var response = JSON.parse(r.responseText);
                    if (!/^success$/i.test(response.result || "")) {
                        var details = response.details;
                        console.log("Error in UploadAttachment." + details ? details : '');
                    } else {
                        changeCounter = changeCounter - 1;
                        if (changeCounter >= 0) {
                            // refresh search contact table and close pop-up
                            window.opener.location.reload(true);
                            window.close();
                        } else {
                            // if (mediaRemoved) {
                            //     window.close();
                            // } 
                        }
                    }
                });
            }
        }
    }
}

$(document).ready(function () {
    if (window.opener.parent.addPopupIdle) {
        window.opener.parent.addPopupIdle($(document));
    }
});
// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());