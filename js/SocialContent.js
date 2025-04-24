var SC = {
    handleBubbleName: function (nickName, onlineFormArr, ticketId, isContent) { // isContent means not left panel (left panel shows ticket id if no name)
        if (nickName != '' && nickName != 'visitor' && nickName != null) {
            return nickName;
        } else {
            var onlineFormName = '';
            if (onlineFormArr != null && onlineFormArr.length > 0) {
                for (let onlineForm of onlineFormArr) {
                    if ((onlineForm.field_name == "Name" || onlineForm.field_name == "name") && onlineForm.field_value != null) {
                        onlineFormName = onlineForm.field_value;
                        break;
                    }
                }
            }
            if (onlineFormName != null && onlineFormName.length > 0) { // online form name will be null if the customer did not input name
                return onlineFormName;
           // } else {  // 20250410 'If' statement should not be the only statement in 'else' block
            } else if (isContent) {
                    return 'visitor';
            } else {
                    return ticketId;
               // }//  20250410 for else if 
            }
        }
    },
    handleContentFormData: function (onlineFormArr) {
        var formDataStr = '';
        for (var i = 0; i < onlineFormArr.length; i++) {
            var theObj = onlineFormArr[i];
            var fieldName = theObj.field_name;
            var fieldValue = theObj.field_value;
            if (i != 0) { formDataStr += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'; }
            formDataStr += '<span style="white-space:pre;"><span class="content-gray-label">' + fieldName + ':</span>&nbsp;' + fieldValue + '</span>';
        }
        return formDataStr;
    },
    handleWATpQRMsg: function (msg_content_obj_str, forPopup, tpId) {
        // msg_content_obj_str = msg_content_obj_str.replace(/"/g,'\\"')
        var msg_content_obj = JSON.parse(msg_content_obj_str);
        var msg_btn_arr = msg_content_obj.btns;
        var imgStr = '';
        var txtStr = msg_content_obj.txt;
        var btnStr = ''
        if (msg_content_obj.img) {
            imgStr = '<div class="wa-card-img-container">';
            if (forPopup) {
                imgStr += '<i class="fas fa-image wa-card-img"></i>';
            //} else {  // 20250410 'If' statement should not be the only statement in 'else' block
            } else if (typeof enlargeImage === 'function') { // cannot use if(enlargeImage != undefined) as enlarge image could be not defined
                    imgStr += '<img onclick="enlargeImage(this);" class="wa-preview-img" src="' + msg_content_obj.img + '" />';
            } else {
                    
                    // to put it to input form
                    // to be able to add w-100 or h-100 like whatsapp
                    var previewImg = $('#display-msg-' + tpId + ' .wa-preview-img');
                    var formImgClass = previewImg.length > 0 ? previewImg.attr('class') : 'wa-preview-img';
                    var imgArr = msg_content_obj.img.split(',');
                    var theImg = imgArr.length > 1 ? imgArr[1] : imgArr[0];
                    imgStr += '<img class="' + formImgClass + '" src="' + theImg + '" />';
                //}// 20250410 for else if 
            }
            imgStr += '</div>';
        }
        if (msg_btn_arr.length > 0) {
            for (let msg_btn of msg_btn_arr) {
                btnStr += '<div class="wa-qp-btn">';
                btnStr += msg_btn;
                btnStr += '</div>'
            }
        }
        var tpQrStr = ('<div class="wa-qp-tp-container d-inline-block">' +
            '<div class="wa-qp-card-container">' +
            imgStr +
            '<div class="wa-card-txt">' +
            txtStr +
            '</div>' +
            '</div>' +

            '<div class="wa-btn-group">' +
            btnStr +
            '</div>' +
            '</div>')
        if (forPopup) {
            tpQrStr += '<div class="wa-right-config">'
            if (msg_content_obj.img) {
                var onClickStr = "$('#file-to-upload-" + tpId + "').trigger('click')";
                tpQrStr += (
                    '<p><span class="text-danger">&nbsp;*&nbsp;</span>{{1}}: Upload Photo</p>' +
                    '<input type="file" id="file-to-upload-' + tpId + '" accept="image/x-png,image/gif,image/jpeg" onchange="previewPhoto(this,' + tpId + ');" style="display:none">' +
                    '<button class="edit-field btn rounded btn-sm btn-warning text-capitalize l-general-upload" style="width:fit-content" title="Upload Photo"' +
                    'onclick="' + onClickStr + '"><i class="fas fa-cloud-upload-alt me-2"></i><span>Upload</span></button>')
            }
            if (txtStr.indexOf('{{') != -1 && txtStr.indexOf('}}') != -1) {
                if (/\{\{1}}/g.test(txtStr || "")) {
                    tpQrStr += ('<p class="mt-3">' + '{{1}}: <input id="tpl-content--0" type="text" class="border-radius-5" maxlenght=160 />')
                }
                if (/\{\{2}}/g.test(txtStr || "")) {
                    tpQrStr += ('<p class="mt-3">' + '{{2}}: <input id="tpl-content-1" type="text" class="border-radius-5" maxlenght=160 />')
                }
                if (/\{\{3}}/g.test(txtStr || "")) {
                    tpQrStr += ('<p class="mt-3">' + '{{3}}: <input id="tpl-content-2" type="text" class="border-radius-5" maxlenght=160 />')
                }
                if (/\{\{4}}/g.test(txtStr || "")) {
                    tpQrStr += ('<p class="mt-3">' + '{{4}}: <input id="tpl-content-3" type="text" class="border-radius-5" maxlenght=160 />')
                }
                if (/\{\{5}}/g.test(txtStr || "")) {
                    tpQrStr += ('<p class="mt-3">' + '{{5}}: <input id="tpl-content-4" type="text" class="border-radius-5" maxlenght=160 />')
                }
            }
            tpQrStr += '</div>'
        }
        if (forPopup) {
            return tpQrStr;
        } else {
            return { 'isImage': true, 'text': tpQrStr };
        }
    },
    handleWATpCTAMsg: function (msg_content_obj_str, forPopup, tpId) {
        // msg_content_obj_str = msg_content_obj_str.replace(/"/g,'\\"')
        var msg_content_obj = JSON.parse(msg_content_obj_str);
        var msg_btn_arr = msg_content_obj.btns;
        var imgStr = '';
        var txtStr = msg_content_obj.txt;
        var btnStr = '';
        var urlIdxArr = [];

        if (msg_content_obj.img) {
            imgStr = '<div class="wa-card-img-container">';
            if (forPopup) {
                imgStr += '<i class="fas fa-image wa-card-img"></i>';
            //} else {      // 20250410 'If' statement should not be the only statement in 'else' block
            } else if (typeof enlargeImage === 'function') { // cannot use if(enlargeImage != undefined) as enlarge image could be not defined
                    imgStr += '<img onclick="enlargeImage(this);" class="wa-preview-img" src="' + msg_content_obj.img + '" />';
            } else {

                    // to put it to input form
                    var previewImg = $('#display-msg-' + tpId + ' .wa-preview-img');
                    var formImgClass = previewImg.length > 0 ? previewImg.attr('class') : 'wa-preview-img';
                    var imgArr = msg_content_obj.img.split(',');
                    var theImg = imgArr.length > 1 ? imgArr[1] : imgArr[0];
                    imgStr += '<img class="' + formImgClass + '" src="' + theImg + '" />';
                //}// 20250410 for else if 
            }
            imgStr += '</div>';
        }

        if (msg_btn_arr.length > 0) {
            for (let theBtn of msg_btn_arr) {
                if (theBtn.type == 'hotline') {
                    btnStr += ('<div class="wa-cta-btn"' + (theBtn.num ? ' title=' + theBtn.num : '') + '>' +
                        '<i class="fas fa-phone me-2"></i>' + theBtn.display +
                        '</div>')
                } else if (theBtn.type == 'website') {
                  // var onClickStr = '';       // 20200326 Review this redundant assignment
                    var urlObj = theBtn.url;
                    if (urlObj) {
                        if (forPopup) {
                            urlIdxArr.push(urlObj)
                            btnStr += ('<div class="wa-cta-btn"' + (urlObj.link ? ' title=' + urlObj.link : '') + '>' +
                                '<i class="fas fa-external-link-alt me-2"></i>' + theBtn.display +
                                '</div>')
                        } else {
                            var newLink = urlObj.link + urlObj.no;
                            btnStr += ('<a target="_blank" class="wa-cta-btn cursor-pointer" href="' + newLink + '">' +
                                '<i class="fas fa-external-link-alt me-2"></i>' + theBtn.display +
                                '</a>')
                        }
                    } else {
                        btnStr += ('<div class="wa-cta-btn"' + (urlObj.link ? ' title=' + urlObj.link : '') + '>' +
                            '<i class="fas fa-external-link-alt me-2"></i>' + theBtn.display +
                            '</div>')
                    }
                }
            }
        }

        var tpCtaStr = ('<div class="wa-cta-tp-container d-inline-block">' +
            '<div>' +
            imgStr +
            '<div class="wa-card-txt">' +
            txtStr +
            '</div>' +
            '</div>' +

            '<div class="wa-btn-group">' +
            btnStr +
            '</div>' +
            '</div>')
        if (forPopup) {
           // var propIdx = 0    // 20250424 Remove this useless assignment to variable "propIdx".
            tpCtaStr += '<div class="wa-right-config">'
            if (msg_content_obj.img) {
                var onClickStr = "$('#file-to-upload-" + tpId + "').trigger('click')";
                tpCtaStr += (
                    '<p><span class="text-danger">&nbsp;*&nbsp;</span>{{1}}: Upload Photo</p>' +
                    '<input type="file" id="file-to-upload-' + tpId + '" accept="image/x-png,image/gif,image/jpeg" onchange="previewPhoto(this,' + tpId + ');" style="display:none">' +
                    '<button class="edit-field btn rounded btn-sm btn-warning text-capitalize l-general-upload" style="width:fit-content" title="Upload Photo"' +
                    'onclick="' + onClickStr + '"><i class="fas fa-cloud-upload-alt me-2"></i><span>Upload</span></button>')
               // propIdx += 1;  // 20250424 Remove this useless assignment to variable "propIdx".
            }
            if (txtStr.indexOf('{{') != -1 && txtStr.indexOf('}}') != -1) {
                if (/\{\{1}}/g.test(txtStr || "")) {
                    tpCtaStr += ('<p class="mt-3">' + '{{1}}: <input id="tpl-content-0" type="text" class="border-radius-5" maxlenght=160 />')
                  //  propIdx += 1; // 20250424 Remove this useless assignment to variable "propIdx".
                }
                if (/\{\{2}}/g.test(txtStr || "")) {
                    tpCtaStr += ('<p class="mt-3">' + '{{2}}: <input id="tpl-content-1" type="text" class="border-radius-5" maxlenght=160 />')
                  //  propIdx += 1; // 20250424 Remove this useless assignment to variable "propIdx".
                }
                if (/\{\{3}}/g.test(txtStr || "")) {
                    tpCtaStr += ('<p class="mt-3">' + '{{3}}: <input id="tpl-content-2" type="text" class="border-radius-5" maxlenght=160 />')
                  //  propIdx += 1; // 20250424 Remove this useless assignment to variable "propIdx".
                }
                if (/\{\{4}}/g.test(txtStr || "")) {
                    tpCtaStr += ('<p class="mt-3">' + '{{4}}: <input id="tpl-content-3" type="text" class="border-radius-5" maxlenght=160 />')
                  //  propIdx += 1; // 20250424 Remove this useless assignment to variable "propIdx".
                }
                if (/\{\{5}}/g.test(txtStr || "")) {
                    tpCtaStr += ('<p class="mt-3">' + '{{5}}: <input id="tpl-content-4" type="text" class="border-radius-5" maxlenght=160 />')
                }
            }
            if (urlIdxArr.length > 0) {
                urlIdxArr.forEach(function (anUrlObj) {
                    if (anUrlObj.no) {
                        var urlNo = Number(anUrlObj.no.replace('{{', '').replace('}}', ''))
                        tpCtaStr += ('<p class="mt-3">' + '{{' + urlNo + '}} URL:<br/>' + anUrlObj.link + '<input id="tpl-content-' + (urlNo - 1) + '" type="text" class="border-radius-5" maxlenght=160 />')
                    }
                })
            }
        }
        if (forPopup) {
            return tpCtaStr;
        } else {
            return { 'isImage': true, 'text': tpCtaStr };
        }
    },
    handleContentMsg: function (fileUrl, fileName, msgType) {
        if (fileName == null) {
            fileName = fileUrl.slice(fileUrl.lastIndexOf('/') + 1);
        }
        var extension = fileUrl.slice(fileUrl.lastIndexOf('.') + 1).toLowerCase(); // sometimes file extension can be capital
        // fileName == 'image/jpeg' is fo whatsapp
        if (msgType == "image" || fileName == 'image/jpeg' || msgType == 'image/jpeg' || extension == 'jpg' || extension == 'gif' || extension == 'png') {

            // alt attribute needed to show file name or when the file cannot be proper showed
            return { 'isImage': true, 'text': '<div style="text-align:center;"><img onclick="enlargeImage(this);" class="content-image" alt="' + fileName + '" style="max-width:100%;max-height:200px;" src="' + fileUrl + '" /></div><div class="position-relative"><a href="' + fileUrl + '" target="_blank" download>' + fileName + '</a></div>' }
        } else if (msgType == 'image/webp') {
            var webpStr = (
                '<picture>' +
                '<source srcset="' + fileUrl + '" type="image/webp">' +
                '<img src="' + fileUrl + '" style="max-height:160px;"  class="content-image" />' + // class="content-image" needed, after load' scroll down
                '</picture>');
            return { 'isImage': true, 'text': webpStr }
        } else if (msgType == "audio/ogg" || msgType == 'audio/mpeg') { // WhatsApp audio is this format 
            return { 'isImage': false, 'text': '<audio controls controlsList="nodownload"><source src="' + fileUrl + '" type="audio/ogg"><source src="' + fileUrl + '" type="audio/mpeg">Your browser does not support the audio element.</audio>' };
        } else if (msgType == "video/mp4") { // WhatsApp video is this format 
            if (downloadVoiceStr) {
                return { 'isImage': true, 'text': '<video controls="" autoplay width="300" height="225" preload="none" src="' + fileUrl + '"' + downloadVoiceStr + '><source type="video/mp4"></video>' };
            } else {
                return { 'isImage': true, 'text': '<video autoplaycontrols="" width="300" height="225" preload="none" src="' + fileUrl + '"><source type="video/mp4"></video>' };
            }
        } else if (fileUrl.endsWith('/')) {
            return { 'isImage': false, 'text': '<div><a href="' + fileUrl + '" target="_blank" download>Facebook Video Link</a><br />[External Link, may need to ask supervisor to open]</div>' };
        } else {
            return { 'isImage': false, 'text': '<div class="position-relative"><a href="' + fileUrl + '" target="_blank" download>' + fileName + '</a></div>' };
        }
    },

    handleDate: function (dateObj) { // today example: 2035-02-20
        var recDate = SC.returnDate(dateObj);
        if (recDate == today) {
            return "";
        }
        // remain not today
        var recYear = recDate.substring(0, 4); // substring will not affact recDate;
        if (recYear == today.substring(0, 4)) {

            // if same year, show the date only
            return recDate.substring(7);
        } else {
            // return whole date
            return recDate;
        }
    },

    handleFormData(formDataArr) { // used at caseRecordPopup, etc.
        var formDataStr = '';
        for (let field of formDataArr) {
            var fieldName = field.field_name || 'null';
            var fieldValue = field.field_value || 'null';

            if (fieldName == 'Name') {
                formDataStr = ('<span class="cs-info-span"><span class="content-gray-label">' + fieldName + ':</span>&nbsp;' + fieldValue + '</span>' + formDataStr);
            } else if (fieldName == 'Browser') {
                // masssage field value
                var findBrowswer = true;
                var newValue = '';
                if (fieldValue.match(/Windows/g)) {
                    newValue += 'Windows ';
                }
                if (fieldValue.match(/Mac OS /g)) {
                    newValue += 'Mac ';
                }
                if (fieldValue.match(/iPhone/g)) {
                    newValue += 'iPhone ';
                }
                if (fieldValue.match(/iOS/g)) {
                    newValue += 'iOS ';
                }
                if (fieldValue.match(/Android/g)) {
                    newValue += 'Android ';
                }
                if (fieldValue.match(/Mobile/g)) {
                    newValue += 'Mobile ';
                }
                if (fieldValue.match(/Firefox/g)) {
                    newValue += 'Firefox ';
                }
                if (fieldValue.match(/MSIE/g) || fieldValue.match(/rv:11.0/g)) {
                    newValue += 'IE ';
                }
                if (fieldValue.match(/ OPR\//g)) {
                    newValue += 'Opera ';
                    findBrowswer = false;
                }
                if (fieldValue.match(/Edge/g)) {
                    newValue += 'Edge ';
                    findBrowswer = false;
                }
                if (fieldValue.match(/Safari/g) && !fieldValue.match(/Chrome/g) && findBrowswer) {
                    newValue += 'Safari ';
                    findBrowswer = false;
                }
                if (fieldValue.match(/Chrome/g) && findBrowswer) {
                    newValue += 'Chrome ';
                }
                formDataStr += ('<span title="' + fieldValue + '" class="cs-info-span"><span class="content-gray-label">' + fieldName + ':</span>&nbsp;' + newValue + '</span>');
            } else {
                formDataStr += '<span class="cs-info-span"><span class="content-gray-label">' + fieldName + ':</span>&nbsp;' + fieldValue + '</span>';
            }

        }
        return formDataStr;
    },
    // the details will put to details which is a attribute in iframe, so will not allow white space or quotes
    handleFrameDetails: function (fieldIdValue) {
        if (fieldIdValue == null) {
            return '';
        } else {
            return fieldIdValue.replace('\"', '\"').replace("\'", "\"");// .replace(" ", "&nbsp;");
            // replace single quote or double quote to empty string
            //fieldIdValue.replace(/"/g, '\"');
            //fieldIdValue.replace(/"/g, "\'");
            // fieldIdValue.replace('\"', '\"');
            // fieldIdValue.replace("\'", "\'");
            // replace white space to &npsp;
            // fieldIdValue.replace(/ /g, "%nbsp;")
            // fieldIdValue.replace(" ", "%nbsp;");
            // return res;
        }
    },
    linkify(inputText) {
        var replacedText, replacePattern1, replacePattern2, replacePattern3;

        //URLs starting with http://, https://, or ftp://
        replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

        //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        replacePattern2 = /(^|[^\/])(www\. +(\b|$))/gim; // replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim; // 20250409 Replace this character class by the character itself.

        replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

        //Change email addresses to mailto:: links. (updated for migration on 10-3-2025)
        //replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        //replacePattern3 = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gim;

      //  replacePattern3 = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g;
        replacePattern3 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}$/g;
        //replacePattern3 = /[\w\.\-]+@[\w\-]+(\.[a-z]{2,6})+/gim;

        replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

        return replacedText;
    },

    returnDate: function (dateObj) {
        var dateObjStr = String(dateObj);
        var DateWithoutDot = dateObjStr.slice(0, dateObjStr.indexOf("."));
        var t = DateWithoutDot.split(/[- :T]/);
        var d = new Date(t[0], t[1] - 1, t[2], t[3], t[4], t[5]);
        var year = d.getFullYear();
        var month = d.getMonth() + 1; //months from 1-12
        var day = d.getDate();
        if (month < 10) {
            month = '0' + month
        }
        if (day < 10) {
            day = '0' + day
        }
        return year + ' - ' + month + ' - ' + day;
    },

    returnDateTime: function (sqlDateTime) {
        var DateWithoutDot = sqlDateTime.slice(0, sqlDateTime.indexOf("."));
        return DateWithoutDot.replace('T', ' ');
    },
    returnTime: function (dateObj, second) {
        var dateObjStr = String(dateObj);
        var DateWithoutDot = dateObjStr.slice(0, dateObjStr.indexOf("."));
        var t = DateWithoutDot.split(/[- :T]/);
        var d = new Date(t[0], t[1] - 1, t[2], t[3], t[4], t[5]);
        var hour = d.getHours();
        var min = d.getMinutes();
        if (hour < 10) {
            hour = '0' + hour
        }
        if (min < 10) {
            min = '0' + min
        }
        if (second) {
            var sec = d.getSeconds();
            if (sec < 10) {
                sec = '0' + sec
            }
            return hour + ':' + min + ':' + sec;
        }
        return hour + ' : ' + min;
    }
    // ,emojiStr: '<div class="emoji-box" add-emoji="" style="z-index: 2000; position: absolute; top: 255px; font-size: 24px; background-color: white;width: calc(100% - 347px); margin-left:35px;margin-right:135px; border-width: 1px; border-style: initial; border-color: black black black transparent; border-image: initial; padding-left: 1px;"><!-- ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😁</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😂</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😃</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😄</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😅</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😆</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😇</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😈</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😉</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😊</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😋</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😌</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😍</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😎</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😏</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😐</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😒</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😓</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😔</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😖</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😘</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😚</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😜</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😝</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😞</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😠</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😡</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😢</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😣</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😤</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😥</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😨</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😩</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😪</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😫</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😭</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😰</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😱</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😲</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😳</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😵</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😶</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😷</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😸</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😹</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😺</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😻</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😼</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😽</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😾</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">😿</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><div class="emoji ng-scope" onclick="emojiClicked(this)" style="display:inline-block;border:solid 1px black;cursor:pointer;width:40px;height:40px;text-align:center;"><span class="ng-binding">🙀</span></div><!-- end ngRepeat: emoji in $ctrl.emojiList track by $index --><button style="float:right;margin-top:12px;margin-right:10px;" onclick="closeEmoji();">Close</button></div>'
}