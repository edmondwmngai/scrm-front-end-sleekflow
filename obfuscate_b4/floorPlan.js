// dropdown content of Floor Plan

const fpBgDfWidth = wmConfig.fpBgDfWidth || 500;
const fpBgDfHeight = wmConfig.fpBgDfHeight || 500;
const fpPcDfSize = wmConfig.fpPcDfSize || 50;
const fpFontDf = wmConfig.fpFontDf || 15;
var token = sessionStorage.getItem('scrmToken') || '';
var legendStr = '';

var legendStr = '<span class="single-legend-container"><span class="legend-squre" style="background:' + statusStyle["WORKING"] + '"></span><span>Working</span></span>' +
'<span class="single-legend-container"><span class="legend-squre" style="background:' + statusStyle["READY"] + '"></span><span>Ready</span></span>' +
'<span class="single-legend-container"><span class="legend-squre" style="background:' + statusStyle["TALK"] + '"></span><span>Talk</span></span>' +
'<span class="single-legend-container"><span class="legend-squre" style="background:' + statusStyle["BREAK"] + '"></span><span>Break</span></span>' +
'<span class="single-legend-container"><span class="legend-squre" style="background:' + statusStyle["IDLE"] + '"></span><span>Idle</span></span>' +
'<span class="single-legend-container"><span class="legend-squre" style="background:' + statusStyle["HOLD"] + '"></span><span>Hold</span></span>'

var htmlStr = '<div id="floor-plan" class="mx-2 row d-none"><input id="hidden-fp-id" class="d-none" /><input id="hidden-ordering" type="number" class="d-none" />' + 
        '<div class="card"><div class="card-body">' + 
        '<span class="d-flex justify-content-between">' +
        '<select id="existing-fp-select" class="form-control existing-fp-ele w-auto"></select>' +
        '<div class="togglebutton existing-fp-ele">' +
        '<label>' +
        '<input id="no-inactive-input" type="checkbox" checked="">' +
        '<span class="toggle"></span>' +
        '<span>Active Only</span>' +
        '</label>' +
        '</div>' +
        '<div class="form-group form-inline add-fp-ele" style="display:none;"><label for="fp-name">Name</label><input id="fp-name" type="text" class="form-control ml-2" maxlength="100" /></div>' +
        '<button id="show-map-btn" class="btn rounded btn-sm btn-warning text-capitalize existing-fp-ele fp-long-btn mr-2"><i class="far fa-folder-open mr-2"></i><span>Show FP</span></button>' +
        '<div class="form-group form-inline add-fp-ele" style="display:none;"><label for="term-name-input">Terminal Name / IP</label>' +
        '<input id="term-name-input" type="text" class="form-control ml-2" maxlength="30" />' +
        '<i id="insert-term-btn" class="fas fa-plus-circle add-fp-ele text-warning icon-btn"></i>' +
        '</div>' +
        '<button id="insert-map-btn" class="btn rounded btn-sm btn-warning text-capitalize existing-fp-ele fp-long-btn"><i class="fas fa-plus-square mr-2"></i>Add FP</button>' +
        '<div class="form-group form-inline add-fp-ele" style="display:none;" title="Upload Background"><label for="bg-width-input" class="mr-2">Self BG (Optional)</label>' +
        '<input type="file" id="file-to-upload" accept="image/x-png,image/gif,image/jpeg" style="display:none">' +
        '<button id="upload-bg-btn" class="edit-field btn rounded btn-sm btn-warning text-capitalize fp-long-btn" title="Upload Background" style="display:none;"><i class="fas fa-cloud-upload-alt mr-2"></i><span>Upload</span></button>' +
        '<button id="remove-bg-btn" class="edit-field btn rounded btn-sm text-capitalize fp-long-btn" title="Remove Background" style="display:none;"><i class="far fa-trash-alt mr-2"></i><span>Remove</span></button>' +
        '</div>' +
        '<div class="form-group form-inline add-fp-ele" style="display:none;"><label for="bg-width-input">BG Width</label>' +
        '<input id="bg-width-input" type="number" min="1" class="form-control ml-2" maxlength="100" value="' + fpBgDfWidth + '" /></div>' +
        '<div class="form-group form-inline add-fp-ele" style="display:none;"><label for="bg-height-input">BG Height</label>' +
        '<input id="bg-height-input" type="number" min="1" class="form-control ml-2" maxlength="100" value="' + fpBgDfHeight + '" /></div>' +
        '<div class="form-group form-inline add-fp-ele" style="display:none;"><label for="pc-size-input">PC Size</label>' +
        '<input id="pc-size-input" type="number" min="1" class="form-control ml-2" maxlength="100" value="' + fpPcDfSize + '" /></div>' +
        '<div class="form-group form-inline add-fp-ele" style="display:none;"><label for="font-size-input">Font Size</label>' +
        '<input id="font-size-input" type="number" min="1" class="form-control ml-2" maxlength="100" value="' + fpFontDf + '" /></div>' +
        '<div class="form-group form-inline add-fp-ele" style="display:none;"><label for="is-active-select">Is Active</label>' +
        '<select id="is-active-select" class="form-control"><option>True</option><option>False</option></select></div>' +
        '<span><button id="fp-save-btn" class="btn rounded btn-sm btn-warning text-capitalize add-fp-ele fp-long-btn mr-2" style="display:none;"><i class="fa fa-save mr-2"></i><span>Save</span></button>' +
        '<button id="fp-cancel-btn" class="btn rounded btn-sm text-capitalize add-fp-ele fp-long-btn" style="display:none;"><i class="fas fa-times-circle mr-2"></i><span>Cancel</span></button>' +
        '</span></span><div id="fp-container"></div>' +
        '<div id="legends-container"><div class="d-flex">' + legendStr + '</div></div>' +
        '</div></div></div>';
$('#wm-main-content').append(htmlStr);

$('#no-inactive-input').on('change', function () {
        var checked = $(this).prop('checked');
        if (checked) {
                $('#existing-fp-select .in-active').hide();
        } else {
                $('#existing-fp-select .in-active').show();
        }
})

function previewPhoto(input) {
        var photoFile = input.files[0];
        if (input.files && photoFile) {

                var notOK = false;
                // verify file type
                if (photoFile.type != 'image/jpeg' && photoFile.type != 'image/gif' && photoFile.type != 'image/png') {
                        alert(langJson['l-alert-not-valid-image']);
                        notOK = true;
                }
                // verify file size
                var limitedSizeMB = sessionStorage.getItem('scrmPhotoSize') ? sessionStorage.getItem('scrmPhotoSize') : 2; // default limit 2MB
                if (photoFile.size / 1024 / 1024 > limitedSizeMB) {
                        alert(langJson['l-alert-photo-size-cannot-exceed'] + limitedSizeMB + 'MB');
                        notOK = true;
                }

                if (notOK) {
                        // clear file
                        var fileInput = $("#file-to-upload")
                        fileInput.replaceWith(fileInput.val('').clone(true));

                        // reset picture to original
                        $('#new-fp-bg').css('background-image', '');
                        return;
                }

                // set profile picture
                var reader = new FileReader();
                reader.onload = function (e) {


                        $('#new-fp-bg').css('background-image', 'url(' + e.target.result + ')');

                        // get image whole size
                        var url = e.target.result;
                        var bgImg = $('<img />');
                        bgImg.hide();
                        bgImg.bind('load', function () {
                                $('#bg-width-input').val($(this).width()).trigger('keyup');
                                $('#bg-height-input').val($(this).height()).trigger('keyup');
                                bgImg.remove();
                        });
                        $('body').append(bgImg);
                        bgImg.attr('src', url);
                        $('#remove-bg-btn').show();
                        $('#upload-bg-btn').hide();
                }
                reader.readAsDataURL(photoFile);
        }
}

function returnToSelect() {
        $('.add-fp-ele').hide();
        $('.existing-fp-ele').show();
        $('#fp-container').empty();

        // add new or edit also need to reload, as the edit could be set the floor plan inactive/active
        GetFloorPlanDropdown();
}

$('#fp-cancel-btn').on('click', function () {
        returnToSelect();
})

$('#fp-save-btn').on('click', function () {
        var hiddenId = Number($('#hidden-fp-id').val() || -1);
        var fpName = $('#fp-name').val() || '';

        // No need for now
        // var order = $('#order-input').val() || '';
        var bgWidth = $('#bg-width-input').val() || '';
        var bgHeight = $('#bg-height-input').val() || '';
        var pcSize = $('#pc-size-input').val() || '';
        var fontSize = $('#font-size-input').val() || '';
        var isActiveSelect = $('#is-active-select').val() || false;
        var bgB64 = '';
        var warningMsg = "";
        var style = "[" + [bgWidth, bgHeight, pcSize, fontSize] + "]";
        var pcArr = [];
        var isNew = hiddenId == -1;

        // verify
        if (fpName == "") {
                warningMsg += "Please enter a floor plan name.\n";
        }

        //bg size should be at least as big as pcSize
        if (bgWidth == "" || bgWidth <= pcSize) {
                warningMsg += "Please enter a valid background width.\n";
        }
        if (bgHeight == "" || bgHeight <= pcSize) {
                warningMsg += "Please enter a valid background height.\n";
        }

        //pcsize should not bigger than bg size
        if (pcSize == "" || pcSize <= 0 || pcSize > bgWidth || pcSize > bgHeight) {
                warningMsg += "Please enter a valid PC size.\n";
        }

        if (fontSize == "" || fontSize <= 0) {
                warningMsg += "Please enter a valid font size.\n";
        }

        if (warningMsg.length > 0) {
                alert(warningMsg);
                return;
        }

        $('.draggable').each(function () {
                var theEle = $(this)
                pcArr.push(["[\"" + theEle.attr('id') + "\"", "\"" + theEle.css('top') + "\"", "\"" + theEle.css('left') + "\"]"]);
        });

        if ($("#remove-bg-btn").is(":visible")) {
                bgB64 = $('#new-fp-bg').css('background-image').match(/^url\("?(.+?)"?\)$/);
        }
        var dataObj = {
                Agent_Id: loginId,
                Token: token,
                Name: fpName,
                Ordering: isNew ? ($('#existing-fp-select option').length + 1) : Number($('#hidden-ordering').val()),
                Value: "[" + pcArr.toString() + "]",
                Background: bgB64[1] || '',
                Style: style,
                Remarks: "",
                Status: isActiveSelect == "True" ? "Active" : "InActive"
        }

        if (!isNew) {
                dataObj['F_Id'] = hiddenId
        }

        $.ajax({
                type: (isNew? "POST": "PUT"),
                url: config.mvcUrl + '/api/' + (isNew ? 'AddFloorPlan' : 'UpdateFloorPlan'),
                data: JSON.stringify(dataObj),
                contentType: "application/json",
                dataType: 'json'
        }).always(function (r) {
                var rDetails = r.details;
                if (!/^success$/i.test(r.result || "")) {
                        console.log('error: ' + rDetails);
                } else {

                        // true to load he dropdown again
                        returnToSelect();
                }
        });

})

$('#file-to-upload').on('change', function () {
        previewPhoto(this);
})

$('#upload-bg-btn').on('click', function () {
        $('#file-to-upload').trigger('click');
})

$('#bg-width-input').on('keyup mouseup', function () {
        $('#new-fp-bg').css('width', $('#bg-width-input').val() + 'px');
});

$('#bg-height-input').on('keyup mouseup', function () {
        $('#new-fp-bg').css('height', $('#bg-height-input').val() + 'px');
});

$('#pc-size-input').on('keyup mouseup', function () {
        $('.fa-desktop').css('font-size', $('#pc-size-input').val() + 'px');
})

$('#font-size-input').on('keyup mouseup', function () {
        $('#new-fp-bg').css('font-size', $('#font-size-input').val() + 'px');
});

$("#term-name-input").on('input keydown', function (e) {
        termNameInputOnkeydown(e);
})

function termNameInputOnkeydown(e) {
        if (e.keyCode == 13) {
                e.preventDefault();
                $('#insert-term-btn').click();
                $('#term-name-input').val("");
                return false;
        }
}

$('#remove-bg-btn').on('click', function () {
        $(this).hide();
        $('#upload-bg-btn').show();
        $('#new-fp-bg').css('background-image', '');

        // clear file - if do not clear, select same picture will no response
        var fileInput = $("#file-to-upload");
        fileInput.replaceWith(fileInput.val('').clone(true));
})

$('#insert-term-btn').on('click', function (e) {
        e.preventDefault();

        var termName = $('#term-name-input').val();

        if (termName.length == 0) {
                alert('Please type Terminal Name / IP first');
                $('#term-name-input').focus();
                return;
        }

        if ($('div[id="' + termName + '"]').length > 0) {
                alert('Ther PC already inserted');
                return;
        }

        var pcSize = Number($('#pc-size-input').val());

        // next to last pc
        var lastPC = $('.pc').last()
        var lastTop = lastPC.css('top') ? Number(lastPC.css('top').replace('px', '')) : 50;
        var lastLeft = lastPC.css('left') ? Number(lastPC.css('left').replace('px', '')) : 50;

        $('#new-fp-bg').append('<div id="' + termName + '" class="draggable ui-widget-content pc" style="top:' + lastTop + 'px;left:' + (lastLeft + pcSize + 10) + 'px;position:absolute;"><i class="fas fa-desktop" style="font-size:' + pcSize +
                'px;"></i><span class="agent-name">' + termName +
                '</span><span class="text-center">' +
                '<i class="fas fa-window-close"></i>' +
                '</span></div>');

        $('div[id="' + termName + '"]').draggable({
                cursor: "move",
                snap: true,
                revert: 'invalid',

                // to prevent overlap another element
                stop: function () {
                        $(this).draggable('option', 'revert', 'invalid');
                }
        });

        // to prevent overlap another element
        $('div[id="' + termName + '"]').droppable({
                greedy: true,
                drop: function (event, ui) {
                        ui.draggable.draggable('option', 'revert', true);
                }
        });

        $('div[id="' + termName + '"] .fa-window-close').on('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                $('div[id="' + termName + '"]').remove();
        })
})

function compareOrder(a, b) {
        if (a.Ordering < b.Ordering) {
                return -1;
        }
        if (a.Ordering > b.Ordering) {
                return 1;
        }
        // if (a.Name < b.Name) {
        //         return -1;
        // }
        // if (a.Name > b.Name) {
        //         return 1;
        // }
        return 0;
}

// Cookie functions

function setCookie(cvalue) {
        const d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        let current_cookie = getCookie("openedFp") || "";
        if (current_cookie != "")
                current_cookie += ("," + cvalue);
        else current_cookie = cvalue;
        document.cookie = "openedFp=" + current_cookie + ";" + expires + ";path=/";
}

function delCookie(cvalue) {
        const d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        let current_cookie = getCookie("openedFp") || "";
        current_cookie = current_cookie.split(',').filter(function (fp) {
                return fp != cvalue;
        });
        document.cookie = "openedFp=" + current_cookie + ";" + expires + ";path=/";
}

function getCookie(name) {
        let ca = document.cookie.split(';');
        for (let c of ca) {
                if (c.indexOf(name) == 0) {
                        return c.substring(name.length + 1, c.length);
                }
        }
        return "";
}

function openCookie() {
        let openedFp = getCookie("openedFp");
        if (openedFp != "" && openedFp != null) {
                let fp = openedFp.split(',');
                for (let i of fp) {
                        $('#existing-fp-select').val(i);
                        if ($('#existing-fp-select').val() != null)
                                $('#show-map-btn').click();
                }
        }
}

// /Cookie functions

function checkFpExistsInCookie(fp_id) {
        let openedFp = getCookie("openedFp");
        if (openedFp != "") {
                if (openedFp.split(',').indexOf(fp_id) >= 0) {
                        return true;
                }
        }
        return false;
}

function GetFloorPlanDropdown() {
        $.ajax({
                url: config.mvcUrl + '/api/GetFloorPlan',
                type: "POST",
                data: JSON.stringify({
                        "Agent_Id": loginId,
                        "Token": token,
                        "F_Type": "simple"
                }),
                contentType: "application/json",
                dataType: 'json',
                success: function (res) {
                        if (!/^success$/i.test(res.result || "")) {

                                // request failed
                                console.log(res);
                        } else {
                                var optStr = '';
                                var maps = res.details;
                                maps.sort(compareOrder);
                                var inActiveStyleStr = $('#no-inactive-input').prop('checked') ? ' style="display:none;"' : '';
                                for (var map of maps) {
                                        if (map.Status == 'InActive') {
                                                optStr += ('<option value="' + map.F_Id + '" class="in-active"' + inActiveStyleStr + '>[InActive] ' + map.Name + '</option>');
                                        } else {
                                                optStr += ('<option value="' + map.F_Id + '">' + map.Name + '</option>');
                                        }
                                }
                                $('#existing-fp-select').empty().append(optStr);
                        }
                },
                error: function (err) {
                        console.log(err);
                }
        }).done(function () {
                openCookie()
        });
}


function editFP(fpFull) {

        var fpStyle = JSON.parse(fpFull.Style);
        var status = fpFull.Status;
        var bgWidth = fpStyle[0];
        var bgHeight = fpStyle[1];
        var pcSize = fpStyle[2];
        var fontSize = fpStyle[3];
        var pcs = JSON.parse(fpFull.Value);

        $('#hidden-fp-id').val(fpFull.F_Id);
        $('#hidden-ordering').val(fpFull.Ordering);
        $('#fp-name').val(fpFull.Name);
        $('#term-name-input').val('');
        $('#bg-width-input').val(bgWidth);
        $('#bg-height-input').val(bgHeight);
        $('#pc-size-input').val(pcSize);
        status == "Active" ? $('#is-active-select').val("True") : $('#is-active-select').val("False");
        $('#font-size-input').val(fontSize);


        $('.add-fp-ele').show();
        $('.existing-fp-ele').hide();
        $('#fp-container').empty();

        $('#fp-container').append('<div id="new-create-card" class="card fp-card"><div id="new-fp-bg" class="fp-bg" style="width:' + bgWidth +
                'px;height:' + bgHeight + 'px;font-size:' + fontSize + 'px;">');

        if (fpFull.Background.length > 0) {
                $('#remove-bg-btn').show();
                $('#upload-bg-btn').hide();
                $('#new-fp-bg').css('background-image', 'url(' + fpFull.Background + ')');
        } else {
                $('#remove-bg-btn').hide();
                $('#upload-bg-btn').show();
        }

        $("#new-fp-bg").droppable({
                accept: '.draggable',
                activeClass: 'ui-state-hover',
                hoverClass: 'ui-state-active',

                // to prevent drop overlap
                tolerance: 'fit'

        });

        // do not use for...of loop, the event will be replaced
        pcs.forEach(function (pc) {
                var termName = pc[0];

                $('#new-fp-bg').append('<div id="' + termName + '" class="draggable ui-widget-content pc" style="top:' + pc[1] + ';left:' + pc[2] + ';position:absolute;"><i class="fas fa-desktop" style="font-size:' + pcSize +
                        'px;"></i><span class="agent-name">' + termName +
                        '</span><span class="text-center">' +
                        '<i class="fas fa-window-close"></i>' +
                        '</span></div>');

                $('div[id="' + termName + '"]').draggable({
                        cursor: "move",
                        snap: true,
                        revert: 'invalid',

                        // to prevent overlap another element
                        stop: function () {
                                $(this).draggable('option', 'revert', 'invalid');
                        }
                });

                // to prevent overlap another element
                $('div[id="' + termName + '"]').droppable({
                        greedy: true,
                        drop: function (event, ui) {
                                ui.draggable.draggable('option', 'revert', true);
                        }
                });

                $('div[id="' + termName + '"] .fa-window-close').on('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        $('div[id="' + termName + '"]').remove();
                })
        })
}

// type: show / edit
function getFPFull(fpId, type) {
        $.ajax({
                url: config.mvcUrl + '/api/GetFloorPlan',
                type: "POST",
                data: JSON.stringify({
                        Agent_Id: loginId,
                        Token: token,
                        F_Type: "full",
                        F_Id: Number(fpId)
                }),
                contentType: "application/json",
                dataType: 'json',
                success: function (res) {
                        if (!/^success$/i.test(res.result || "")) {
                                console.log(res);
                        } else {
                                if (type == 'show') {
                                        showFullfContent(res.details[0] || []);
                                } else {
                                        editFP(res.details[0] || []);
                                }

                        }
                },
                error: function (err) {
                        console.log(err);
                }
        });
}

function showFullfContent(fpFull) {
        var pcVal = JSON.parse(fpFull.Value);
        var fpStyle = JSON.parse(fpFull.Style);
        var pcSize = fpStyle[2];
        var fpContainerId = 'fp-' + fpFull.F_Id;
        var isActive = fpFull.Status == 'Active';
        var isActiveStr = fpFull.Status == 'InActive' ? '[InActive] ' : '';
        var pcStr = '<div id="' + fpContainerId + '" class="card fp-card active-card"><span class="d-table-cell">' +
                '<div class="px-2 d-flex justify-content-between"><span class="edit-btn">Edit</span><span>' + isActiveStr + fpFull.Name + '</span><i class="fas fa-window-close my-auto"></i></div>' +
                '<div class="fp-bg" style="width:' + fpStyle[0] + 'px;height:' + fpStyle[1] + 'px;font-size:' + fpStyle[3] + 'px">'; // TO DO: add a delete cross on the right upper corner to close the container
        if (isActive) {
                for (var pc of pcVal) {
                        var termName = pc[0];
                        pcStr += ('<div id="' + termName +
                                '" class="pc pc-logout" style="top:' + pc[1] + ';left:' + pc[2] + ';height:' + pcSize +
                                'px;"><i class="fas fa-desktop" style="font-size:' + pcSize +
                                'px;"></i><span class="agent-name">' + termName +
                                '</span><span class="d-inline-flex"><span class="agent-duration"></span>' +
                                '<div class="fp-agent-dropdown-btn d-none"><button class="btn dropdown-toggle agent-dropdown-toggle py-0 bg-info nav-btn text-capitalize px-2 tbl-dropdown-btn" data-toggle="dropdown"></button><ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu"><li><a tabindex="-1" href="#">Silent</a></li><li><a tabindex="-1" href="#">Coach</a></li><li><a tabindex="-1" href="#">Conference</a></li><li><a tabindex="-1" href="#">Stop Listen</a></li><li><a tabindex="-1" href="#">Barge In</a></li></ul></div>' +
                                '<button class="social-btn d-none btn btn-sm btn-warning" title="Silent To Social Media Chat">S</button>' +
                                '<span class="na-txt d-none">&nbsp;&nbsp;&nbsp;N/A</span></span>' +
                                '</div>');
                }
        }
        pcStr += '</div></span></div>';
        $("#fp-container").append(pcStr);
        if (!isActive) {
                var urlStr = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='100px' width='100px'><text y='20' x='8' fill='lightgray' font-size='20'>InActive</text></svg>";
                $('#' + fpContainerId + ' .fp-bg').css('background-image', 'url("' + urlStr + '")');
        } else if (fpFull.Background.length > 0) {
                $('#' + fpContainerId + ' .fp-bg').css('background-image', 'url(' + fpFull.Background + ')');
        }
        $('#' + fpContainerId + ' .pc').mouseenter(function () {
                var pcSelector = $(this);
                var details = pcSelector.attr('details');
                if (details) {
                        var detailsStr = ''
                        var agentObj = JSON.parse(details);
                        for (var key in agentObj) {
                                if (key == 'Command' || key == 'time' || key == 'statusId' || key == 'agentName' || key == 'serviceName' || key == 'ObjectType' || key == 'agentId' || key == 'SiteCode') {
                                        // skip
                                } else if (key == 'ticketList') {
                                        detailsStr += ('Ticket List: ' + JSON.stringify(agentObj[key]) + ' \n');
                                } else {
                                        detailsStr += (key + ': ' + agentObj[key] + ' \n');
                                }

                        }
                        pcSelector.attr('title', detailsStr);
                }
        })

        $('#' + fpContainerId + ' .fa-window-close').on('click', function (e) {
                $('#' + fpContainerId).remove();
                delCookie(fpContainerId.substr(3));
        })

        $('#' + fpContainerId + ' .edit-btn').on('click', function (e) {

                var selectedId = $(this).closest('.active-card').attr('id').replace('fp-', '');

                getFPFull(selectedId, 'edit')
        })

        $('#' + fpContainerId + ' .dropdown-menu li a').on('click', function (e) {
                e.preventDefault();
                var selected = this.text;

                if (selected == 'Stop Listen') {
                        window.opener.document.getElementById("phone-panel").contentWindow.WiseEndMonitorCall();

                        // monitoringAgentId defined at wiseMon.js
                        monitoringAgentId = 0;
                } else {
                        var data = JSON.parse($(this).closest('.pc').attr('details'));
                        var targetAgentId = data.agentId;
                        if (selected == 'Barge In') {
                                window.opener.document.getElementById("phone-panel").contentWindow.WiseStartMonitorCall(targetAgentId, 0); // 0 means type is barge in
                                monitoringAgentId = 0;
                        } else {
                                if (confirm('Are you sure you want to "' + selected + '"?')) {
                                        var typeId = selected == 'Silent' ? 1 : (selected == 'Coach' ? 4 : 2); //Conference = 2
                                        monitoringAgentId = targetAgentId;
                                        window.opener.document.getElementById("phone-panel").contentWindow.WiseStartMonitorCall(targetAgentId, typeId);
                                }
                        }
                }
        })

        $('#' + fpContainerId + ' .social-btn').on('click', function (e) {
                e.preventDefault();
                if (confirm('Are you sure you want to silent join the chat?')) {
                        var data = JSON.parse($(this).closest('.pc').attr('details'));
                        var ticketList = data.ticketList;
                        var ticketIdArr = [];
                        for (var i = 0; i < data.ticketList.length; i++) {
                                ticketIdArr.push(parseInt(ticketList[i].ticket_id));
                        }
                        window.opener.document.getElementById("phone-panel").contentWindow.WiseStartMontiorChat(ticketIdArr, data.agentId);
                        window.opener.tmpMonIdArr = ticketIdArr;
                        window.opener.tmpAgentId = data.agentId;
                }
        });
}

$('#show-map-btn').on('click', function () {
        var fpId = $('#existing-fp-select').val();

        // check if opened, will not open again
        if ($('#fp-' + fpId).length > 0) {
                alert('The Floor Plan has already opened');
                return;
        }

        //cookie
        if (!checkFpExistsInCookie(fpId))
                setCookie(fpId);

        //use api/GetFloorPlan full
        getFPFull(fpId, 'show');
})

$('#insert-map-btn').on('click', function (e) {
        e.preventDefault();

        // reset add fp ele default
        $('#hidden-fp-id').val(-1);
        $('#fp-name').val('');
        $('#term-name-input').val('');
        $('#bg-width-input').val(fpBgDfWidth);
        $('#bg-height-input').val(fpBgDfHeight);
        $('#pc-size-input').val(fpPcDfSize);
        $('#font-size-input').val(fpFontDf);

        $('.add-fp-ele').show();
        $('.existing-fp-ele').hide();
        $('#remove-bg-btn').hide();
        $('#upload-bg-btn').show();
        $('#fp-container').empty();

        $('#fp-container').append('<div id="new-create-card" class="card fp-card"><div id="new-fp-bg" class="fp-bg" style="width:' + fpBgDfWidth +
                'px;height:' + fpBgDfHeight + 'px;font-size:' + fpFontDf + 'px">');

        $("#new-fp-bg").droppable({
                accept: '.draggable',
                activeClass: 'ui-state-hover',
                hoverClass: 'ui-state-active',

                // to prevent drop overlap
                tolerance: 'fit'
        });


})

function turnOffAgent(termName) {

        var pcContainer = $('div[id="' + termName + '"]');
        var pcIcon = $('div[id="' + termName + '"] .fa-desktop');
        // wild card remove class sample
        pcIcon.removeClass(function (index, className) {
                return (className.match(/(^|\s)bg-\S+/g) || []).join(' ');
        });

        pcContainer.attr('title', '');
        pcContainer.attr('details', '');
        pcContainer.find('.fp-agent-dropdown-btn').addClass('d-none');
        pcContainer.find('.social-btn').addClass('d-none');
        pcContainer.find('.na-txt').addClass('d-none');
}

function turnOnAgent(agentObj) {

        // pcContainer's id could has full stop, so jquery needs to get like below
        var pcContainer = $('div[id="' + agentObj.TermName + '"]');
        pcContainer.removeClass('pc-logout').addClass('pc-login');
        pcContainer.find('.agent-name').html(agentObj.AgentName);
        if (agentObj.agentId != loginId) {
                var agentDropdownBtn = pcContainer.find('.fp-agent-dropdown-btn')
                agentDropdownBtn.removeClass('d-none');

                // show dropdown-menu - if no this the menu will not popup correctly
                agentDropdownBtn.on('show.bs.dropdown', function (e) {
                        $(e.relatedTarget).next().stop(true, true).css('display', 'block');
                });

                // hide dropdown-menu - if no this the menu may not disappear really and when clicking next row, become clicking previous row Silent
                agentDropdownBtn.on('hide.bs.dropdown', function (e) {
                        $(e.relatedTarget).next().stop(true, true).css('display', 'none');
                });
        } else {
                pcContainer.find('.na-txt').removeClass('d-none');
        }

        updateFpAgent(agentObj);
}


function updateFpAgent(agentObj) {

        var pcContainer = $('div[id="' + agentObj.TermName + '"]');
        var agentStauts = agentObj.agentStatus;
        var ticketList = agentObj.ticketList;
        var socialBtn = pcContainer.find('.social-btn');
        pcContainer.find('.agent-duration').html(agentObj.duration);

        // if status chagned
        pcContainer.each(function () {
                var theContinaer = $(this);

                // if added another floor plan got same terminal may trigger below
                if (!theContinaer.hasClass('pc-login')) {
                        turnOnAgent(agentObj);
                        return;
                }
                var pcIcon = theContinaer.find('.fa-desktop');
                if (!pcIcon.hasClass('bg-' + agentStauts)) {
                        pcIcon.removeClass(function (index, className) {
                                return (className.match(/(^|\s)bg-\S+/g) || []).join(' ');
                        });
                        pcIcon.addClass('bg-' + agentStauts);
                }
        });

        if (ticketList.length == 0 || agentObj.agentId == loginId) {
                if (!socialBtn.hasClass('d-none')) {
                        socialBtn.addClass('d-none');
                }
        } else {
                if (socialBtn.hasClass('d-none')) {
                        socialBtn.removeClass('d-none');
                }
        }
        pcContainer.attr('details', JSON.stringify(agentObj));
}

function updateFloorPlan(cWmAgentObj) {

        // if no floor plan showing, no need to update anything
        if ($('.active-card').length > 0) {
                var existingIds = [];
                var existingPCsEle = $('.pc-login');
                if (existingPCsEle.length > 0) {
                        existingPCsEle.each(function () {
                                existingIds.push(this.id);
                        });

                        // to make unique Ids unique
                        existingIds = existingIds.filter(function (item, pos) {
                                return existingIds.indexOf(item) == pos;
                        })

                        // existing showing agent update
                        for (var existPCId of existingIds) {
                                var notExist = true;

                                // update agent
                                for (var agentObj in cWmAgentObj) {
                                        if (cWmAgentObj[agentObj].TermName == existPCId) {
                                                updateFpAgent(cWmAgentObj[agentObj]);
                                                delete cWmAgentObj[agentObj]
                                                notExist = false;
                                                break;
                                        }
                                }

                                // if has logout, gray it
                                if (notExist) {
                                        turnOffAgent(existPCId);
                                }
                        }
                }

                // remaining array, turn on new login agent
                for (var agentObj2 in cWmAgentObj) {
                        turnOnAgent(cWmAgentObj[agentObj2]);
                }
        }
}

// load default floor plan
GetFloorPlanDropdown();