var customerData = null;
var disableMode = false;
var caseRecordPopup = null;
var customerOnly = false;
var openType = window.frameElement.getAttribute("openType") || ''; // "menu" or "traditional" or "social"

//var isSocial = window.frameElement.getAttribute("openType") == "social" ? true : false;     // 20250320 Unnecessary use of boolean literals in conditional expression.
var isSocial = window.frameElement.getAttribute("openType") == "social";
var customerId = -1;
var internalCaseNo = window.frameElement.getAttribute("internalCaseNo") || -1;
var caseNo = window.frameElement.getAttribute("caseNo") || -1;
var outstandingAttachment = 0;
var agentList = parent.parent.agentList || [];
var campaign = window.frameElement.getAttribute("campaign") || parent.frameElement.getAttribute("campaign") || parent.campaign || '';
var ivrInfo = parent.frameElement.getAttribute("ivrInfo");
var caseLogLength = 5;
var photoSrc = '../../images/user.png';
var replyConfirmed = false; // If true, reply is confirmed and the area is disabled, cannot be changed
var callType = isSocial ? window.frameElement.getAttribute("callType") : parent.window.frameElement.getAttribute("callType") || ''; // When manual update open input form channel is ''
var details = isSocial ? (window.frameElement.getAttribute("details") || '') : (parent.window.frameElement.getAttribute("details") || ''); // isSocial ? '' : parent.window.frameElement.getAttribute("details") || '';
var connId = sessionStorage.getItem('scrmConnId') || -1;
var ticketId = isSocial ? window.frameElement.getAttribute("connId") : null;
// When manual update open input form connId is null
var updateCaseObj = {}; // Object used to send to UpdateCase api
if (ticketId) {
    updateCaseObj.Ticket_Id = ticketId;
}
var tabType = parent.tabType || 'outbound';
var selectedCaseLog = {}; // Needed for caseRecordPopup
// var emailFileList = [];		// 20250402 Either use this collection's contents or remove the collection.
// var faxFileList = [];       // 20250402 Either use this collection's contents or remove the collection.
var outsider = false;
var nationalityArr = sessionStorage.getItem('scrmNationalityArr') ? JSON.parse(sessionStorage.getItem('scrmNationalityArr')) : [];
var marketArr = sessionStorage.getItem('scrmMarketArr') ? JSON.parse(sessionStorage.getItem('scrmMarketArr')) : [];
var profileArr = sessionStorage.getItem('scrmProfileArr') ? JSON.parse(sessionStorage.getItem('scrmProfileArr')) : [];
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var wiseHost = config.wiseHost;
var categories = sessionStorage.getItem('scrmCategories') || '';
//var haveSystemTools = categories.indexOf('System-Tools') != -1 ? true : false; //20250320  Unnecessary use of boolean literals in conditional expression.
var haveSystemTools = categories.indexOf('System-Tools') != -1;
if (connId != null) {
    connId = Number(connId);
}

var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';
var agentName = sessionStorage.getItem('scrmAgentName') || '';
var productArr = [];
var productCompareArr = [];

function getAgentName(theAgentId) {
    var agentObj = gf.altFind(agentList, function (obj) {
        return obj.AgentID == theAgentId;
    })
    if (agentObj != undefined) {
        return agentObj.AgentName;
    } else {
        return theAgentId;
    }
}

function oldProductCheck(cancelEditBtns, cancelDelBtnShowns, totalLen, productCode, planCode, planPrice) {
    if (totalLen === 0) {
        saveProduct(productCode, planCode, planPrice);
    } else {
        cancelEditBtns.each(function () {
            var theBtn = $(this);
            var theSaId = theBtn.attr('said');
            var originalPlanCode = theBtn.attr('plancode');
            var originalPrice = theBtn.attr('price');
            var newPlanInput = $('input[name="planList-' + theSaId + '"]:checked');
            var newPlanCode = newPlanInput.val();
            var newPrice = newPlanInput.attr('price');

            // if exactly the same, no need to update
            if (originalPlanCode == newPlanCode && originalPrice == newPrice) {
                totalLen = totalLen - 1;
                if (totalLen == 0) {
                    if (productCode.length > 0) {
                        saveProduct(productCode, planCode, planPrice);
                    } else {
                        formUpdated();
                    }
                }
            } else {
                $.ajax({
                    type: "PUT",
                    url: config.companyUrl + '/api/UpdateOBSalesOrder',
                    data: JSON.stringify({
                        Agent_Id: loginId,
                        Token: token,
                        Sa_Id: parseInt(theSaId),
                        Plan_Code: newPlanCode,
                        Price: newPrice
                    }),
                    crossDomain: true,
                    contentType: "application/json",
                    dataType: 'json'
                }).always(function (r) {
                    if (!/^success$/i.test(r.result || "")) {
                        console.log('error: ' + (r.deatils || r));
                    } else {
                        // nothing to do
                    }
                }).done(function () {
                    totalLen = totalLen - 1;
                    if (totalLen == 0) {
                        if (productCode.length > 0) {
                            saveProduct(productCode, planCode, planPrice);
                        } else {
                            formUpdated();
                        }
                    }
                })
            }
        })

        // delete
        cancelDelBtnShowns.each(function () {
            var theBtn = $(this);
            var theSaId = theBtn.attr('said');
            $.ajax({
                type: "PUT",
                url: config.companyUrl + '/api/UpdateOBSalesOrder',
                data: JSON.stringify({
                    Agent_Id: loginId,
                    Token: token,
                    Sa_Id: parseInt(theSaId),
                    Order_Status: "InActive"
                }),
                crossDomain: true,
                contentType: "application/json",
                dataType: 'json'
            }).always(function (r) {
                if (!/^success$/i.test(r.result || "")) {
                    console.log('error: ' + (r.deatils || r));
                } else {
                    // nothing to do
                }
            }).done(function () {
                totalLen = totalLen - 1;
                if (totalLen == 0) {
                    if (productCode.length > 0) {
                        saveProduct(productCode, planCode, planPrice);
                    } else {
                        formUpdated();
                    }
                }
            })
        })
    }
}

function oldProductEdit(saId, productCode, price) {
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/UpdateOBSalesOrder',
        data: JSON.stringify({
            Agent_Id: loginId,
            Token: token,
            Sa_Id: saId,
            Product_Code: productCode,
            Price: price
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + (r.deatils || r));
        } else {
            // nothing to do
        }
    })
}

function oldProductDel(saId) {
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/UpdateOBSalesOrder',
        data: JSON.stringify({
            Agent_Id: loginId,
            Token: token,
            Sa_Id: saId
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + (r.deatils || r));
        } else {
            // nothing to do
        }
    })
}

function getProduct() {
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/GetOBProductPrice',
        data: JSON.stringify({
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + (r.deatils || r));
        } else {
            productArr = JSON.parse(r.details);
            console.log(productArr);
            var productStr = '';
            for (var i = 0; i < productArr.length; i++) {
                var productObj = productArr[i];
                var productCode = productObj.Product_Code;
                productStr += ('<option value="' + i + '" productcode="' + productCode + '">' + productCode + ' - ' + productObj.Product_Desc + '</option>');
            }
            $('#form-product-select').append(productStr).on('change', function (e) {
                e.preventDefault();
                var codePriceStr = '';
                var selectedVal = $(this).val();
                if (selectedVal.length > 0) {
                    var planDetailsArr = productArr[parseInt($(this).val())].PlanDetails;
                    for (let planObj of planDetailsArr) {
                        var planCode = planObj.Plan_Code;
                        var planPrice = planObj.Price;
                        codePriceStr += ('<div class="form-check"><label class="form-check-label">' +
                            '<input type="radio" name="planList" class="form-check-input reply-checkbox" value="' + planCode + '" price="' + planPrice + '">' + planCode + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$' + planPrice + '<span class="circle"><span class="check"></span></span></label></div>')
                    }

                    $('#form-prodcut-code-price').empty().append(codePriceStr);

                    // the content as been longer need to resize
                    resize();
                //} else {  // 20250410 'If' statement should not be the only statement in 'else' block
                } else if ($('#case-status').prop('disabled') === false) {
                        $('#form-product-2nd-row').hide();
                    //}// 20250410 for else if 
                }
            })

            if (customerData.Call_Status == 'Successful Order') {
                $.ajax({
                    type: "POST",
                    url: config.companyUrl + '/api/GetOBSalesOrder',
                    data: JSON.stringify({
                        Agent_Id: loginId,
                        Token: token,
                        Call_Id: customerData.Call_Id
                    }),
                    crossDomain: true,
                    contentType: "application/json",
                    dataType: 'json'
                }).always(function (r) {
                    if (!/^success$/i.test(r.result || "")) {
                        console.log('error: ' + (r.deatils || r));
                    } else {
                        var recordArr = r.details;

                        // if no record reocrdArr will be null...
                        if (recordArr != null && recordArr.length > 0) {

                            // since the old product select will have margin top, so the new product select need to have margin top also
                            $('#form-product-select').addClass('product-select-mt');
                            $('label[for="form-product-select"]').addClass('product-select-mt');
                            for (let recordObj of recordArr) {
                                var theProductCode = recordObj.Product_Code;

                                // the find() method returns the value of the first element in the provided array that satisfies the provided
                                var theProjectObj = productArr.find(function (val) {
                                    return val.Product_Code == theProductCode
                                })

                                $('#form-product-select option[productcode="' + theProductCode + '"]').hide();

                                // previous product select add
                                var saId = recordObj.Sa_Id;

                                // get the product description also
                                var productCodeWDescription = $('#form-product-select option[productcode="' + theProductCode + '"]').text();

                                // the productCodeWDescription will be empty string ('') if no existing product, will just show the product code then
                                var previousProductStr = '<div id="top-record-container-' + saId + '" class="top-border-container"><select class="form-select select-min-w" disabled="true"><option selected>' + (productCodeWDescription.length > 0 ? productCodeWDescription : productCode) + '</option></select></div>';
                                $('#form-product-select').before(previousProductStr);
                                var thePlanDetailsArr = theProjectObj.PlanDetails;
                                var originalPlanCode = recordObj.Plan_Code;
                                var originalPrice = recordObj.Price;
                                var theCodePriceStr = '<div id="btm-record-container-' + saId + '" class="bottom-border-container"><div class="select-min-w">'
                                var matched = false;

                                for (let planObj of thePlanDetailsArr) {
                                    var planCode = planObj.Plan_Code;
                                    var planPrice = planObj.Price;
                                    var selectedStr = '';
                                    if (planCode == originalPlanCode && planPrice == originalPrice) {
                                        matched = true;
                                        selectedStr = ' checked=true';
                                    }
                                    theCodePriceStr += ('<div class="form-check justify-content-start"><label class="form-check-label">' +
                                        '<input type="radio" name="planList-' + saId + '" class="form-check-input reply-checkbox" value="' + planCode + '" price="' + planPrice + '" disabled="true"' + selectedStr + '>' + planCode + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$' + planPrice + '<span class="circle"><span class="check"></span></span></label></div>')
                                }

                                // if the plan or price is no longer available, add new option that not in the list
                                if (!matched) {
                                    theCodePriceStr += ('<div class="form-check justify-content-start"><label class="form-check-label">' +
                                        '<input type="radio" name="planList-' + saId + '" value="' + originalPlanCode + '" price="' + originalPrice + '" class="form-check-input reply-checkbox" disabled="true" checked=true>' + originalPlanCode + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$' + originalPrice + '<span class="circle"><span class="check"></span></span></label></div>')
                                }

                                theCodePriceStr += '</div>'
                                theCodePriceStr += ('<div class="text-center mt-3 mb-2">' +
                                    '<button said="' + saId + '" class="btn btn-warning rounded btn-sm text-capitalize edit-record-btn" style="margin-left:-16px;"><i class="fa fa-edit me-2"></i><span class="l-form-edit">Edit</span></button>' +

                                    // NO DEL depends customer need, may need to delete product
                                    // '<button said="' + saId + '" class="btn btn-danger rounded btn-sm text-capitalize del-record-btn" style="margin-right:-16px;"><i class="fas fa-trash-alt me-2"></i><span class="l-st-delete">Delete</span></button>' +
                                    // /NO DEL

                                    '<button said="' + saId + '" class="btn btn-lightgray rounded btn-sm text-capitalize undo-edit-record-btn" plancode="' + originalPlanCode + '" price="' + originalPrice + '"style="display:none;"><i class="fa fa-undo me-2"></i><span class="l-st-delete">Cancel Edit</span></button>' +
                                    '<button said="' + saId + '" class="btn btn-lightgray rounded btn-sm text-capitalize undo-del-record-btn" style="display:none;"><i class="fa fa-undo me-2"></i><span class="l-st-delete">Cancel Delete</span></button>' +
                                    '</div>')
                                theCodePriceStr += '</div>'
                                $('#form-prodcut-code-price').before(theCodePriceStr);
                                $('#form-product-2nd-row').show();

                                // $('#record-del-' + saId).on('click', function(){
                                //     $('#top-record-container-' + saId + '').hide();
                                //     $('#btm-record-container-' + saId + '').hide();
                                // })
                            }

                            $('.edit-record-btn').on('click', function () {
                                var theBtn = $(this);
                                var theSaId = theBtn.attr('said');
                                $('input[name="planList-' + theSaId + '"]').prop('disabled', false);
                                theBtn.hide();
                                theBtn.siblings('.del-record-btn').hide();
                                theBtn.siblings('.undo-edit-record-btn').show();
                            })

                            $('.undo-edit-record-btn').on('click', function () {
                                var theBtn = $(this);
                                var theSaId = theBtn.attr('said');
                                var thePlanCode = theBtn.attr('plancode');
                                var thePrice = theBtn.attr('price');
                                $('input[name="planList-' + theSaId + '"][value="' + thePlanCode + '"][price="' + thePrice + '"]').prop("checked", true);
                                $('input[name="planList-' + theSaId + '"]').prop('disabled', true);
                                theBtn.hide();
                                theBtn.siblings('.del-record-btn').show();
                                theBtn.siblings('.edit-record-btn').show();
                            })

                            $('.del-record-btn').on('click', function () {
                                var theBtn = $(this);
                                var theSaId = theBtn.attr('said');
                                $('#top-record-container-' + theSaId + ' .select-min-w').css('opacity', '0.2');
                                $('#btm-record-container-' + theSaId + ' .select-min-w').css('opacity', '0.2');
                                theBtn.hide();
                                theBtn.siblings('.edit-record-btn').hide();
                                theBtn.siblings('.undo-del-record-btn').show();
                            })

                            $('.undo-del-record-btn').on('click', function () {
                                var theBtn = $(this);
                                var theSaId = theBtn.attr('said');
                                $('#top-record-container-' + theSaId + ' .select-min-w').css('opacity', 'unset');
                                $('#btm-record-container-' + theSaId + ' .select-min-w').css('opacity', 'unset');
                                theBtn.hide();
                                theBtn.siblings('.del-record-btn').show();
                                theBtn.siblings('.edit-record-btn').show();
                            })
                        }

                        // the content as been longer need to resize
                        resize();
                    }
                })
            } else {

                // the content as been longer need to resize
                resize();
            }
        }
    })
}

function resize() {
    var body = document.body,
        html = document.documentElement;
    var newHeight = Math.ceil(Math.max(body.scrollHeight, body.offsetHeight,
        html.offsetHeight)) || 500;

    // need to be long to have mrgin bottom
    newHeight += 15;
    var inputFrame = parent.document.getElementById("o-input-form");
    inputFrame.height = newHeight + 'px';
}

function setLanguage() {
    $('.l-form-are-you-sure').text(langJson['l-form-are-you-sure']);
    $('.l-form-call').get(0).nextSibling.data = langJson['l-form-call'];
    $('.l-form-customer-information').text(langJson['l-form-customer-information']);
    $('.l-form-confirm').text(langJson['l-form-confirm']);
    $('.l-form-dial').text(langJson['l-form-dial']);
    $('.l-form-edit').text(langJson['l-form-edit']);
    $('.l-form-escalated-to').text(langJson['l-form-escalated-to']);
    $('.l-form-handled-by').text(langJson['l-form-handled-by']);
    $('.l-form-scheduled-reminder').text(langJson['l-form-scheduled-reminder']);
    $('.l-form-none').get(0).nextSibling.data = langJson['l-form-none'];

    var radioOtherArr = $('.l-form-radio-other');
    for (let radioOther of radioOtherArr) {
        radioOther.nextSibling.data = langJson['l-form-radio-other'];
    }

    $('.l-form-reason-for-long-call').text(langJson['l-form-reason-for-long-call']);
    $('.l-form-remarks').text(langJson['l-form-remarks']);
    $('.l-form-save').text(langJson['l-form-save']);
    $('.l-general-previous-page').attr('title', langJson['l-general-previous-page']);
    $('#customer-tbl-customer-id').removeClass('d-none');
    $('.l-general-upload').attr('title', langJson['l-general-upload']);

    $('.l-ob-call-id').text(langJson['l-ob-call-id']);
    $('.l-ob-first-name').text(langJson['l-ob-first-name']);
    $('.l-ob-last-name').text(langJson['l-ob-last-name']);
    $('.l-form-gender').text(langJson['l-form-gender']);
    $('.l-form-mobile').text(langJson['l-form-mobile']);
    $('.l-ob-home').text(langJson['l-ob-home']);
    $('.l-ob-office').text(langJson['l-ob-office']);
    $('.l-form-other').text(langJson['l-form-other']);
    $('.l-ob-dob').text(langJson['l-ob-dob']);
    $('.l-ob-join-date').text(langJson['l-ob-join-date']);
    $('.l-form-case-details').text(langJson['l-form-case-details']);
    $('.l-campaign-callstatus').text(langJson['l-campaign-callstatus']);
    $('.l-campaign-reason').text(langJson['l-campaign-reason']);
    $('.l-ob-product').text(langJson['l-ob-product']);
    $('.l-ob-plan-code').text(langJson['l-ob-plan-code']);
    $('.l-ob-price').text(langJson['l-ob-price']);
    $('.l-campaign-callback').text(langJson['l-campaign-callback']);
    $('.l-main-outbound').text(langJson['l-main-outbound']);
}

function restorePage() {

    // Restore veriable
    replyConfirmed = false; // Reply is not confirmed or dialed out  <= to change no need this variable in fact
    updateCaseObj = {}; // to change no need this variable in fact
    $("#reply-none").prop("checked", true).trigger("click");
    $(".reply-wa-container").remove();
    $('#reply-submit-btn').hide();
    $('#call-result-container').remove();
    dialNoClicked();
    $('#case-details').val('');
    $("#call-other-input").val('').prop('disabled', true);
    $('.l-form-radio-other').prop("checked", false); // Reply's other uncheck
    $('input.reply-checkbox:checked').prop('checked', false);
    parent.document.documentElement.scrollTop = 0;
}

function countPattern(str) {
    var re = /[{]/g
    return (((str || '').match(re) || []).length) / 2
}

var gotOldProduct = false;	// Declaration of variable 

function getCurrentSdObj() {
    var sendObj = {};
    var callReason = '';
    //var replyDetails = '';         // 20200326 Review this redundant assignment
    var productCode = '';			// 20250411 Add the "let", "const" or "var" keyword to this declaration of "productCode" to make it explicit.
    // var planCode = '';
    // var planPrice = '';
   
   // var gotOldProduct = false;     // 20250411 Add the "let", "const" or "var" keyword to this declaration of "productCode" to make it explicit.
	// 20250416 Remove the declaration of the unused 'gotOldProduct' variable.
   
   // var hvDifference = false; // default false, need to be true to update


    // == verify == 
    var callStatus = document.getElementById('call-status').value || '';
    sendObj.Call_Status = callStatus;

    if (callStatus == 'Successful Order') {
        // sendObj.Call_Reason = document.getElementById('successful-reason').value || '';
        // var productVal = $('#form-product-select').val();

        // // validate has product selected if no old products
        // if (!gotOldProduct && productVal.length == 0) {
        //     parent.parent.$.MessageBox('Product has to be selected for successful order');
        //     return;
        // } else {

        // validate has plan selected, if product selected
        // if (productVal.length > 0) {
        //     var checkedPlanList = document.querySelector('input[name="planList"]:checked');
        //     if (productVal.length > 0 && checkedPlanList == null) {
        //         parent.parent.$.MessageBox('Plan Code has to be selected if product code is selected');
        //         return;
        //     } else {
        //         var selectedPlanObj = productArr[parseInt(productVal)];
        //         productCode = selectedPlanObj.Product_Code;
        //         planCode = checkedPlanList.value;
        //         planPrice = $(checkedPlanList).attr('price');
        //     }
        // }

        // }
        $("#form-insurance-plan :input").each(function () {
            var id = $(this).attr("id");
            var value = $(this).val();
            insurancePlan[id] = value;
        })
        productCode = insurancePlan;
        console.log(insurancePlan);
        // }
    } else if (callStatus == 'Reached') {
        callReason = document.getElementById('reached-reason').value || '';
        sendObj.Call_Reason = callReason;
    } else if (callStatus == 'Unreach') {
        callReason = document.getElementById('unreach-reason').value || '';
        sendObj.Call_Reason = callReason;
    }

    // Reply 

    var replyList = document.querySelector('input[name="replyList"]:checked');
    var replyChannel = replyList ? replyList.value : '';
    var replyDetails = '';
    var replyDetailsArr = $('.' + replyChannel + '-list:checked');
    for (let theReplyDetails of replyDetailsArr) {
        var detailsValue = theReplyDetails.value;
        if (detailsValue != 'other') {
            if (replyDetails.length == 0) {
                replyDetails = detailsValue;
            } else {
                replyDetails += (',' + detailsValue);
            }
        //} else {  20250410 'If' statement should not be the only statement in 'else' block
        } else if (replyDetails.length == 0) {
                replyDetails = $('#' + replyChannel + '-other-input')[0].value;
        } else {
                replyDetails += (',' + $('#' + replyChannel + '-other-input')[0].value);
           // }// 20250410 for else if 
        }
    }

    // All fields have to be written to overwrite previous field
    sendObj.Call_Id = customerData.Call_Id;
    sendObj.Reply_Conn_Id = updateCaseObj.Reply_Conn_Id || null;
    var sessionConnId = sessionStorage.getItem('scrmConnId') || null;

    // if no outbound and have inbound in session storage, save inbound connid, otherwise save null
    if (sessionConnId != null && sendObj.Reply_Conn_Id == null) {
        var intConnId = parseInt(sessionConnId);
        sendObj.Conn_Id = intConnId;

        // udpateCaseObj for complete the media in incomplete cases
        updateCaseObj.Conn_Id = intConnId;
    } else {

        sendObj.Conn_Id = null;
        if (updateCaseObj.Conn_Id) {
            delete updateCaseObj.Conn_Id;
        }
    }

    sendObj.Remark = document.getElementById('call-remarks').value || '';

    sendObj.Reply_Details = replyDetails;
    var callbackDateTime = $('#callback-datetime').val() || '';

    sendObj.Callback_Time = callbackDateTime.length > 0 ? callbackDateTime : null;

    return sendObj
    // discussed w/ Vincent, though no any chagnges now, if old sales record cahgned need to update call log also
    // must update call log if need to add sales order or update old sales order
    // if (productCode.length > 0 || totalLen > 0) {
    //     hvDifference = true;
    // }
}

function verifyOkFn(sendObj) {
    var errArr = [];
    var cancelEditBtns = [];
    var cancelDelBtnShowns = [];
    var totalLen = 0;
    var replyChannel = document.querySelector('input[name="replyList"]:checked').value;
	gotOldProduct = false;

    if (replyChannel != '') {
        if (sendObj.Reply_Details.length == 0) {
            errArr.push(langJson['l-alert-reply-details-empty']);
        }

        // Verify clicked confirm or dial yes or not
        if (replyConfirmed === false) {
            if (replyChannel != 'call') {
                errArr.push(langJson['l-alert-reply-not-confirmed']);
            } else {
                errArr.push(langJson['l-alert-not-clicked-dial']);
            }
        }
    }

    // the handling will be different if got old products bought
    if ($('#call-status').prop('disabled')) {
        gotOldProduct = true;
        cancelEditBtns = $('.undo-edit-record-btn:visible');
        cancelDelBtnShowns = $('.undo-del-record-btn:visible');
        totalLen = cancelEditBtns.length + cancelDelBtnShowns.length;
    }

    if ((sendObj.Call_Status || '').length == 0) {
        errArr.push('Call Status is a mandatory field');
    } 
    
    if (sendObj.Call_Status != 'Successful Order' && sendObj.Call_Reason.length == 0) {
        errArr.push('Call Reason is a mandatory field');
    }

    if (errArr.length == 0) {
        return true;
    } else {
        parent.parent.$.MessageBox(errArr.join('<br />'));
		console.log(totalLen);		//20250424 Remove this useless assignment to variable "totalLen".
        return false;
    }
}

function hvDifferenceFn(sendObj, forSave) {
   
    // whenever once called out have difference
    if (sendObj.Reply_Conn_Id.length > 0) {
        return true;
    }

    var mismatch = false;

    // both sendObj and customerData fields could be null, to compare need to or empty string
    for (var k in sendObj) {
        if (k == 'Callback_Time') {
            if ((sendObj[k] || '') != (customerData[k] || '').slice(0, 16).replace('T', ' ')) {
                mismatch = true;
                break;
            }
        } else if (k == 'Reply_Details') { // no need to check Reply_Details

            // nothing to do with reply details

        } else if (k == 'Conn_Id') {

            // only for save need to check difference
            if (forSave) {
                if ((sendObj['Conn_Id'] || '') != (customerData['Conn_Id'] || '')){
                    mismatch = true;
                    break;
                }
            }
        } else if (k == 'Reply_Conn_Id') {

            // no need to save a case without a reply and other are the same
            if (sendObj.Reply_Conn_Id != '') {
                if ((sendObj['Reply_Conn_Id'] || '') != (customerData['Reply_Conn_Id'] || '')){
                    mismatch = true;
                    break;
                }
            }
        //} else {  20250410 'If' statement should not be the only statement in 'else' block
        } else if ((sendObj[k] || '') != (customerData[k] || '')){
                mismatch = true;
                break;
            //}//   20250410 for else if 
        }
    }
        
    return mismatch;
}

function formUpdated(){
    $('#fm-save-btn').addClass('d-none');
    $('input').prop('disabled', true);
    $('select').prop('disabled', true);
    $('textarea').prop('disabled', true);
    parent.formUpdated();
}

function saveClicked() {
    if (loginId == -1) {
        alert('Storage lost, please login again, the case will not be saved');
        $('#fm-save-btn').prop('disabled', false);
        return;
    }

    // == verify == 
    var sendObj = getCurrentSdObj();
       
    var verifyOk = verifyOkFn(sendObj);

    if (!verifyOk) {
        $('#fm-save-btn').prop('disabled', false);
        return;
    }

    var hvDifference = hvDifferenceFn(sendObj, true);

    if (!hvDifference) {

        // check if no change, check is old sales records no change also, alert the user if really no change
        parent.parent.$.MessageBox('No changes has been made');
        $('#fm-save-btn').prop('disabled', false);
        //return;   // 20250328 Remove this redundant jump.
    } else {

        sendObj.Agent_Id = Number(loginId);
        sendObj.Token = token;

        if (sendObj.Call_Reason == 'Opt Out') {
            sendObj.Opt_Out = 'Y'
        }

        $.ajax({
            type: "PUT",
            url: config.companyUrl + '/api/UpdateOBCallList',
            data: JSON.stringify(sendObj),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            var rDetails = r.details;
            if (!/^success$/i.test(r.result || "")) {
                if (rDetails == '字串未被辨認為有效的 DateTime。') {
                    rDetails = 'Date Time Format is invalid';
                }
                parent.parent.$.MessageBox('Saved failed. ' + (rDetails || r));
                $('#fm-save-btn').prop('disabled', false);
            } else {
                delete sendObj.Token;
                delete sendObj.Agent_Id;

                parent.customerData = Object.assign(parent.customerData, sendObj);
                updateCaseObj = {};

                if (sendObj.Call_Status == 'Successful Order') {

                    // after old product checking and update, if have new product, add new product
                    if (gotOldProduct) {
                        oldProductCheck(cancelEditBtns, cancelDelBtnShowns, totalLen, productCode, planCode, planPrice);
                    } else {
                        saveProduct(productCode, planCode, planPrice);
                    }
                //} else {  //20250410 'If' statement should not be the only statement in 'else' block

                    // remove the inbound from incomplete list
                } else if (sendObj.Conn_Id == sessionStorage.getItem('scrmConnId')) {
                        sessionStorage.removeItem('scrmConnId');
                        callSaveCallHistory(sendObj.Conn_Id);
                } else {

                        // update table row data
                        formUpdated();
                    //}//   20240410 for else if 
                }
                parent.parent.$.MessageBox('Call list updated.');
            }
        })
    }
}

var saveProduct = function (productCode, planCode, planPrice) {
    if (productCode.length > 0) {
        var sendObj = {
            Agent_Id: Number(loginId),
            Token: token,
            Call_Id: customerData.Call_Id,
            Campaign_Code: customerData.Campaign_Code,
            Batch_Code: customerData.Batch_Code,
            Product_Code: productCode,
            Plan_Code: planCode,
            Price: planPrice
        }
        $.ajax({
            type: "POST",
            url: config.companyUrl + '/api/AddOBSalesOrder',
            data: JSON.stringify(sendObj),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                parent.parent.$.MessageBox('Saved Product failed. ' + (r.details || r));
            } else {
                formUpdated();
            }
        })
    }
}

// For customer service pop-up
var profilePicClick = function () {
    var openWindows = parent.parent.openWindows || parent.parent.parent.openWindows; // parent.parent.parent.openWindows opened from search customer
    var csPopup = window.open('csPopup.html?edit=false', '', 'toolbar=0,location=0,top=50, left=50,menubar=0,resizable=0,scrollbars=1,width=1050,height=584');
    openWindows[openWindows.length] = csPopup;
    csPopup.onload = function () {
        csPopup.onbeforeunload = function () {
            for (var i = 0; i < openWindows.length; i++) {
                if (openWindows[i] == csPopup) {
                    openWindows.splice(i, 1);
                    break;
                }
            }
        }
    }
}

var scheduleClick = function () {
    var openWindows = parent.parent.openWindows;
    var reminderPopup = window.open('../../reminderPopup.html', '', 'toolbar=0,location=0,top=50, left=50,menubar=0,resizable=0,scrollbars=1,width=660,height=458');
    openWindows[openWindows.length] = reminderPopup;
    reminderPopup.onload = function () {
        reminderPopup.onbeforeunload = function () {
            for (var i = 0; i < openWindows.length; i++) {
                if (openWindows[i] == reminderPopup) {
                    openWindows.splice(i, 1);
                    break;
                }
            }
        }
    }
}
var statusChange = function (iThis) {
    var selected = $(iThis).find('option:selected');
    var selectedValue = selected[0].value;
    if (selectedValue == 'Escalated') {
        document.getElementById('case-escalated-container').style.display = 'inherit';
    } else {
        document.getElementById('case-escalated-container').style.display = 'none';
        document.getElementById('case-escalated').value = null;
    }
}

var dialNoClicked = function () {
    var areYouSure = $('#are-you-sure');
    areYouSure.remove();
    $('.dial-yes-disable').prop('disabled', false);
}

var dialYesClicked = function () {
    var areYouSure = $('#are-you-sure');
    areYouSure.remove();
    replyConfirmed = true;
    $('.dial-yes-disable').prop('disabled', true);
    var callDetails = $('.call-list:checked')[0].value;
    if (callDetails == 'other') {
        callDetails = $('#call-other-input')[0].value;
    }
    updateCaseObj.Reply_Details = callDetails;
    parent.parent.makeCall(campaign, callDetails, tabType);
    updateCaseObj.Reply_Conn_Id = 0; // "-1"; // If the agent rejected to call at the end, Reply_Conn_Id will be -1;
}

function stClicked(oThis, idType) {
    var remarksField = $('#' + idType + '-remarks')
    if (!$(oThis).prop('checked')) {
        remarksField.val('').prop('disabled', true);
    } else {
        remarksField.prop('disabled', false);
    }
}

// ontbound will not go to incomplete cases, only inbound if successfully saved, will need to record when it is saved
function callSaveCallHistory(ibConnId) { // if update reply details only, will not update Is_Saved to Y (when made an outbound call)
    var saveCallHistoryObj = {
        "Conn_Id": ibConnId,
        "Internal_Case_No": null,
        "Updated_By": loginId,
        Agent_Id: loginId,
        Token: token,
        Is_Saved: "Y"
    }

    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/SaveCallHistory',
        data: JSON.stringify(saveCallHistoryObj),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in callSaveCallHistory');
                console.log(r.details);
            } else {

                // reload page
                formUpdated();
            }
        },
        error: function (r) {
            console.log('error in callSaveCallHistory');
            console.log(r);
        }
    })
}

function replyCallClick(lastCallType, lastCallId, confConnId) {
    updateCaseObj.Reply_Conn_Id = String(lastCallId);
    updateCaseObj.Conference_Conn_Id = confConnId != null ? Number(confConnId) : null;
    updateCaseObj.Reply_Type = 'Outbound_Call';
}

var WAOtherChanged = function (oThis) {
    var valueOfCall = $(oThis).prop('value');
    if (valueOfCall == 'other') {
        $('#wa-other-input').prop('disabled', false);
    } else {
        $('#wa-other-input').prop('disabled', true);
    }
}

function numberOnly(value) {
    return value.replace(/[^\d]/, "");
}

function replyChannelChange(iThis) {
    replyConfirmed = false;
    var channel = $(iThis).attr('value');
    var replyContainer = $('#reply-card'); // $('#reply-card-wa');
    var mediaChannelArr = ['email', 'fax', 'sms', 'call'];
    if (replyContainer) {
        replyContainer.remove();
    }
    if (channel == 'wa') {
        $('.reply-wa-container').remove();

        // hide other channels
        for (let mediaChannel of mediaChannelArr) {
            document.getElementById(mediaChannel + '-details').style.display = 'none';
        }
        $('#reply-submit-btn').hide();
        // Create container
        var mobileNo = $('#Mobile_No').val() || '';
        var mobileNoStr = '';
        if (mobileNo.length > 0) {
            mobileNoStr = '<span id="reply-wa-mobile-container" style="display:inline-block;"><div class="form-check ms-2"><label class="form-check-label"><input type="radio" name="waList" class="form-check-input reply-checkbox wa-list" value="' + mobileNo + '" id="oCallMobile_No" onchange="WAOtherChanged(this)">' + mobileNo + '<span class="circle"><span class="check"></span></span></label></div></span>'
        }
        var waContainerStr = '<span class="reply-wa-container" style="display:inline;">' + mobileNoStr +
            '<span id="wa-other-container" style="display:inline-block;"><div class="form-check ms-2" style="display:inline;"><label class="form-check-label"><input type="radio" class="form-check-input reply-checkbox wa-list" name="waList" value="other" id="call-other-check" onchange="WAOtherChanged(this)">Other<span class="circle"><span class="check"></span></span></label></div>&nbsp;<input type="tel" onkeyup="this.value=numberOnly(this.value)" maxlength="50" disabled="true" id="wa-other-input" style="border-radius:5px;" autocomplete="off"></span>' +
            '<div id="send-wa-section" class="mt-2">' +
            '<label class="form-label mb-0"><span>Template Prop(s):</span><input id="tpl-content" class="rounded ms-3 me-2" autocomplete="off">e.g. 4 July,8pm</label>' +
            '<div class="form-check form-check-radio"><label class="form-check-label" name="tpl-lbl" for="tp-1"><input class="form-check-input" type="radio" name="tp" id="tp-1" value="1">Your appointment is coming up on {{1}} at {{2}}<span class="circle"><span class="check"></span></span></label></div>' +
            '<div class="form-check form-check-radio"><label class="form-check-label" name="tpl-lbl" for="tp-2"><input class="form-check-input" type="radio" name="tp" id="tp-2" value="2">易寶通訊提醒你, 預約日期是{{1}}{{2}}。<span class="circle"><span class="check"></span></span></label></div>' +
            '<div class="form-check form-check-radio"><label class="form-check-label" name="tpl-lbl" for="tp-3"><input class="form-check-input" type="radio" name="tp" id="tp-3" value="3">Epro Notice: Thank you for your application, the application no is {{1}}.<span class="circle"><span class="check"></span></span></label></div>' +
            '<div class="form-check form-check-radio"><label class="form-check-label" name="tpl-lbl" for="tp-4"><input class="form-check-input" type="radio" name="tp" id="tp-4" value="4">易寶：謝謝你的申請, 你的申編號是 {{1}}.<span class="circle"><span class="check"></span></span></label></div>' +
            '</div></span>';
        $('#reply-details').append(waContainerStr);
        replyConfirmed = true;
    } else {
        $('.reply-wa-container').remove();

        // show what details
        for (let currentChannel of mediaChannelArr) {
            if (currentChannel == channel) {
                document.getElementById(currentChannel + '-details').style.display = 'inherit';
            } else {

                // channel is none;
                document.getElementById(currentChannel + '-details').style.display = 'none';
            }
        }

        // text of the confirm button of details
        if (channel == 'email' || channel == 'fax' || channel == 'sms') {
            $('#reply-submit-btn').html('<i class="fas fa-clipboard-check me-2"></i><span>' + langJson["l-form-confirm"] + '</span>');
            $('#reply-submit-btn').show();
        } else if (channel == 'call') {
            $('#reply-submit-btn').html('<i class="fas fa-phone me-2"></i><span>' + langJson["l-form-dial"] + '</span>');
            $('#reply-submit-btn').show();
        } else {
            $('#reply-submit-btn').hide();
        }
        // restore veriable
        // emailFileList = []; // 20250402 Either use this collection's contents or remove the collection.
        // faxFileList = []; // 20250402 Either use this collection's contents or remove the collection.
    }
    resize();
}

function smsWordCount() {
    var smsContent = $('#sms-content').val() || '';
    var smsContentLen = smsContent.length;
    var haveChineseChar = gf.isDoubleByte(smsContent);
    // wds counts refers to 3HK
    var perMsgCount = 160;
    if (haveChineseChar) {
        perMsgCount = 70;
    }
    // round up
    var totalMsgs = Math.ceil(smsContentLen / perMsgCount);
    var totalMsgNumber = totalMsgs * perMsgCount;
    var smsWordCountStr = smsContentLen + '/' + totalMsgNumber;
    $('#sms-word-count').text(smsWordCountStr);
    $('#sms-msg-count').text(totalMsgs);
}

var replySubmitClicked = function () {
    var replyChannel = document.querySelector('input[name="replyList"]:checked').value;
    var replyDetailsArr = $('.' + replyChannel + '-list:checked');

    // if checked other, chcke anything typed
    for (let theReplyDetails of replyDetailsArr) {
        var detailsValue = theReplyDetails.value;
        if (detailsValue == 'other') {
            var replyDetails = $('#' + replyChannel + '-other-input')[0].value;
            if (replyDetails.length == 0) {
                parent.parent.$.MessageBox(langJson['l-alert-other-blank']);
                return
            }
        }
    }
    if (replyChannel == 'call') {
        var checkedPhoneList = document.querySelector('input[name="callList"]:checked');
        if (checkedPhoneList == null) {
            parent.parent.$.MessageBox(langJson['l-alert-number-not-selected']);
            return
        }
        var areYouSure = $('#are-you-sure');
        if (areYouSure.length == 0) {
            $('<span id="are-you-sure">&nbsp;&nbsp;&nbsp;' + langJson['l-form-are-you-sure'] + '?&nbsp;&nbsp;&nbsp;<button class="btn btn-sm btn-warning text-capitalize rounded" onclick="dialYesClicked();"><i class="fas fa-check me-2"></i><span>' + langJson['l-form-yes'] + '</span></button>&nbsp;<button onclick="dialNoClicked();" class="btn btn-sm btn-warning text-capitalize rounded"><i class="fas fa-times me-2"></i><span>' + langJson['l-form-no'] + '</span></button></span>').insertAfter('#reply-submit-btn');
            $('.dial-yes-disable').prop('disabled', true);
        }
    } else if (replyChannel == 'sms') {
        // get selected checkbox, if checked none, return
        var checkList = $('.' + replyChannel + '-list:checked').val();
        if (checkList == undefined || checkList.length == 0) {
            // no check box selected return
            parent.parent.$.MessageBox(langJson['l-alert-no-reply-details']);
            return
        }
        var replyContainer = $('#reply-card');
        if (replyContainer.length > 0) {
            return;
        }

        $('<div id="reply-card" class="my-2 bg-light mb-4 rounded-2 py-5 px-3 py-3"><div class="text-center mb-3 bg-info rounded text-white"><h5 class="mt-0 mb-0">Send SMS</h5></div>' +
            '<div class="row d-flex align-items-center"><div class="mb-3 col-sm-12 ps-0">' +
            '<label class="col-sm-1 control-label ps-4">&nbsp;&nbsp;&nbsp;From</label>' +
            '<div class="col-sm-11 ps-2">' + companyName + '</div></div>' +
            '<div class="mb-3 col-sm-12 ps-0"><label for="sms-content" class="col-sm-1 control-label ps-4">&nbsp;&nbsp;&nbsp;Content</label>' +
            '<div class="col-sm-11 ps-2">' +
            '<textarea class="mt-3" id="sms-content" rows="3" cols="20" style="font-family:inherit;width:100%;" maxlength="500" onKeyUp="smsWordCount()"></textarea></textarea></div></div>' +
            '<div class="w-100"><span style="float:right;margin-right:30px;"><span id="sms-word-count" class="align-right">0/170</span>&nbsp;&nbsp;<span id="sms-msg-count">1</span>&nbsp;message(s)</span></div>' +
            +'</div></div>').appendTo('#reply-container');

        // Added reply section, so needed to resize
        resize();
        replyConfirmed = true;
    }
    $('textarea').keydown(function (e) {
        if (e.keyCode == 33 || e.keyCode == 34) {
            $(this).blur();
        }
    })
}

var loadCaseLog = function (initial) {

    // PARENT LOAD 'SEARCH RESULTS TABLE'

}

// Call clicked
var replyCallChanged = function (oThis) {
    var valueOfCall = $(oThis).prop('value');
    if (valueOfCall == 'other') {
        $('#call-other-input').prop('disabled', false);
    } else {
        $('#call-other-input').prop('disabled', true);
    }
}
// email, sms, fax other checkbox clicked
function replyOtherClicked(inputId, oThis) {
    if (inputId != 'call-other-input') {

//   } else {   ==> != 20250519 Empty block statement.
        var theInput = $('#' + inputId);
        if ($(oThis).prop('checked')) {
            theInput.prop('disabled', false);
        } else {
            theInput.prop('disabled', true);
        }
    }
}
// Load after html ready

function insertInsuredPersonalInfoForm(person) {
    var name;
    var relationship;
    if (person == 'main') {
        name = "Main";
        relationship = "本人";
    } else if (person == 'spouse') {
        name = "Spouse";
        relationship = "配偶";
    } else {
        name = "Child " + person[5];
        relationship = "子女";
    }

    $("<hr/> <div class='row'><span class='is-header'>Insured's Personal Information - " + name + "</span></div>" +
        "<div class='row d-flex align-items-center '> <!-- relationship --> <label for='" + person + "-relationship-display' class='col-1-w control-label col-form-label '>Relationship</label> <div class='col-2-sw'> <input id='" + person + "-relationship-display' class='form-control' type='search' disabled value='" + relationship + "'></div></div>" +
        "<div class='row d-flex align-items-center'> <!-- residency --> <label for='" + person + "-residency-select' class='col-1-w control-label col-form-label'>Residency</label> <div class='col-2-sw'> <select id='" + person + "-residency-select' class='form-select select-min-w'> <option value='' selected>- Please select -</option> <option value='A'>香港永久居民</option> <option value='B'>香港居民</option> </select></div></div>" +
        "<div class='row d-flex align-items-center'> <!-- Eng Last Name --> <label for='" + person + "-eng-last-name-input' class='col-1-w control-label col-form-label'>Last Name(English)</label>  <div class='mb-3 col-sm-4'> <input id='" + person + "-eng-last-name-input' class='form-control mt-1' type='search' style='width: 76%;'></div></div>" +
        "<div class='row d-flex align-items-center'> <!-- Eng First Name --> <label for='" + person + "-eng-first-name-input' class='col-1-w control-label col-form-label'>First Name(English)</label>  <div class='mb-3 col-sm-4'> <input id='" + person + "-eng-first-name-input' class='form-control mt-1' type='search' style='width: 76%;'></div></div>" +
        "<div class='row d-flex align-items-center'> <!-- Chi Last Name --> <label for='" + person + "-chi-last-name-input' class='col-1-w control-label col-form-label'>Last Name(Chinese)</label> <div class='mb-3 col-sm-4'> <input id='" + person + "-chi-last-name-input' class='form-control mt-1' type='search' style='width: 76%;'></div></div>" +
        "<div class='row d-flex align-items-center'> <!-- Chi First Name --> <label for='" + person + "-chi-first-name-input' class='col-1-w control-label col-form-label'>First Name(Chinese)</label> <div class='mb-3 col-sm-4'> <input id='" + person + "-chi-first-name-input' class='form-control mt-1' type='search' style='width: 76%;'></div></div>" +
        "<div class='row d-flex align-items-center'> <!-- HKID --> <label for='" + person + "-hkid-input' class='col-1-w control-label col-form-label'>HKID</label> <div class='col-2-sw'> <input id='" + person + "-hkid-input' class='form-control mt-1' type='search'></div></div>" +
        "<div class='row d-flex align-items-center'> <!-- Nationality --> <label for='" + person + "-nationality-input' class='col-1-w control-label col-form-label'>Nationality</label> <div class='col-2-sw'> <input id='" + person + "-nationality-input' class='form-control mt-1' type='search'></div></div>" +
        "<div class='row d-flex align-items-center'> <!-- DOB --> <label for='" + person + "-dob-date' class='col-1-w control-label col-form-label'>Date of Birth</label> <div class='col-2-sw'> <input id='" + person + "-dob-date' class='form-control mt-1' type='search' placeholder='yyyy-mm-dd' autocomplete='off'></div><span class='font-weight-700 ms-5 me-3'>Age:&nbsp;&nbsp;<span id='" + person + "-dob-date-age'></span></span></div>" +
        "<div class='row d-flex align-items-center'> <!-- place of birth --> <label for='" + person + "-place-of-birth-input' class='col-1-w control-label col-form-label'>Place of Birth</label> <div class='col-2-sw'> <input id='" + person + "-palce-of-birth-input' class='form-control mt-1' type='search'></div></div>" +
        "<div class='row d-flex align-items-center'> <!-- gender --> <label for='" + person + "-gender-select' class='col-1-w control-label col-form-label'>Gender</label> <div class='col-2-sw'> <select id='" + person + "-gender-select' class='form-select select-min-w'> <option value='' selected>- Please select -</option> <option value='M'>Male</option> <option value='F'>Female</option> <option value='O'>Other</option> </select></div></div>" +
        "<div class='row d-flex align-items-center'> <!-- occupation --> <label for='" + person + "-occupation-select' class='col-1-w control-label col-form-label'>Occupation</label> <div class='col-2-sw'> <select id='" + person + "-occupation-select' class='form-select select-min-w'> <option value='' selected>- Please select -</option> </select></div></div>" +
        "<div class='row d-flex align-items-center'> <!-- title --> <label for='" + person + "-title-select' class='col-1-w control-label col-form-label'>Title</label> <div class='col-2-sw'> <select id='" + person + "-title-select' class='form-select select-min-w'> <option value='' selected>- Please select -</option> </select></div></div>")
        .appendTo("#insured-personal-info-" + person)

    $(person + "-hkid-input").on('blur', function () {
        //checkHKID(this.value, this);		// 20250325 This function expects 1 argument, but 2 were provided.
		checkHKID(this.value);
    })

    if (person == "main") {
        $('#main-gender-select').val($('#applicant-gender-select').val());
        $('#main-eng-first-name-input').val($('#applicant-eng-first-name-input').val());
        $('#main-eng-last-name-input').val($('#applicant-eng-last-name-input').val());
    }

    insertDOBDatepicker(person);
}

function insertDOBDatepicker(person) {
    $('#' + person + '-dob-date').datepicker({
        showOn: "button",
        buttonImage: "../../images/calendar-grid-30.svg",
        buttonStyle: 'height:1000px',
        buttonImageOnly: true,
        buttonText: "Select date",
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        maxDate: new Date()
    })

    $('#' + person + '-dob-date').on('change', function () {
        $('#' + person + '-dob-date-age').text(parent.getAgeByDOB(this.value))
    });

    if (person == "main") {
        $('#main-dob-date').val($('#applicant-dob-date').val()).trigger('change');
    }
}

$(document).ready(function () {

    setLanguage();

    if (parent.parent.parent.iframeRecheck) {
        parent.parent.parent.iframeRecheck($(parent.document));
    }

    // ==================== 0 - event ====================
    $('textarea').keydown(function (e) {
        if (e.keyCode == 33 || e.keyCode == 34) {
            $(this).blur();
        }
    })

    $('#fm-save-btn').on('click', function(){
        $(this).prop('disabled', true);
        saveClicked();
    })

    $('#call-status').on('change', function () {
        var selected = $(this).val();

        if (selected == 'Successful Order') {

            $('#successful-reason').removeClass('d-none').addClass('d-block');
            $('#unreach-reason').removeClass('d-block').addClass('d-none');
            $('#reached-reason').removeClass('d-block').addClass('d-none');
            $('#call-status-label').removeClass('d-none').addClass('d-block');

            $('#form-product-select').val('');
            $('#form-insurance-plan').show();

            if (productArr.length == 0) {
                getProduct();
            }

        } else if (selected == 'Unreach') {

            $('#successful-reason').removeClass('d-block').addClass('d-none');
            $('#unreach-reason').removeClass('d-none').addClass('d-block');
            $('#reached-reason').removeClass('d-block').addClass('d-none');
            $('#call-status-label').removeClass('d-none').addClass('d-block');

            $('#form-insurance-plan').hide();

        } else if (selected == 'Reached') {

            $('#successful-reason').removeClass('d-block').addClass('d-none');
            $('#unreach-reason').removeClass('d-block').addClass('d-none');
            $('#reached-reason').removeClass('d-none').addClass('d-block');
            $('#call-status-label').removeClass('d-none').addClass('d-block');

            $('#form-insurance-plan').hide();

        } else if (selected == '') {

            $('#call-status-label').removeClass('d-block').addClass('d-none');
            $('#successful-reason').removeClass('d-block').addClass('d-none');
            $('#unreach-reason').removeClass('d-block').addClass('d-none');
            $('#reached-reason').removeClass('d-block').addClass('d-none');

            $('#form-insurance-plan').hide();

        }

    })

    $("#applicant-crs-select").on('change', function () {
        if (Number($(this).val()) > 1) {
            $("#applicant-jurisdiction-input").prop('disabled', false)
        } else {
            $("#applicant-jurisdiction-input").prop('disabled', true)
        }
    })

    $("#applicant-crs-reason-select").on('change', function () {
        if ($(this).val() == 'B') {
            $("#applicant-crs-reason-details-input").prop('disabled', false)
        } else {
            $("#applicant-crs-reason-details-input").prop('disabled', true)
        }
    })

    $('#insured-person-main-check').on('change', function () {
        if ($(this).prop('checked')) {
            insertInsuredPersonalInfoForm('main');
            $(this).val('true');
        } else {
            $('#insured-personal-info-main').empty();
            $(this).val('false');
        }
        resize();
    })

    $('#insured-person-spouse-check').on('change', function () {
        if ($(this).prop('checked')) {
            insertInsuredPersonalInfoForm('spouse');
            $(this).val('true');
        } else {
            $('#insured-personal-info-spouse').empty();
            $(this).val('false');
        }
        resize();
    })

    $('#insured-person-child-select').on('change', function () {
        for (var i = 1; i <= Number($(this).val()); i++) {
            insertInsuredPersonalInfoForm("child" + i);
        }
        for (var i = Number($(this).val()) + 1; i <= 4; i++) {
            $('#insured-personal-info-child' + i).empty();
        }
        resize();
    })

    $('#application-signing-date').on("change", function () {
        var day = $(this).datepicker("getDate") || new Date();
        $('#commencement-date').datepicker("option", "minDate", new Date(day.setDate(day.getDate() + 1)));
        console.log("after: " + $('#commencement-date').datepicker("option", "minDate"));
    })

    $('#application-signing-date').datepicker({
        showOn: "button",
        buttonImage: "../../images/calendar-grid-30.svg",
        buttonStyle: 'height:1000px',
        buttonImageOnly: true,
        buttonText: "Select date",
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        minDate: new Date()
    })

    $('#commencement-date').datepicker({
        showOn: "button",
        buttonImage: "../../images/calendar-grid-30.svg",
        buttonStyle: 'height:1000px',
        buttonImageOnly: true,
        buttonText: "Select date",
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        minDate: new Date(new Date().setDate(new Date().getDate() + 1))
    })

    //for DOB
    $('#applicant-dob-date').datepicker({
        showOn: "button",
        buttonImage: "../../images/calendar-grid-30.svg",
        buttonStyle: 'height:1000px',
        buttonImageOnly: true,
        buttonText: "Select date",
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        maxDate: new Date()
    })

    $('#applicant-dob-date').on('change', function () {
        $('#applicant-dob-date-age').text(parent.getAgeByDOB(this.value))
    });

    $('#callback-datetime').datetimepicker({
        showOn: "button",
        buttonImage: "../../images/calendar-grid-30.svg",
        buttonStyle: 'height:1000px',
        buttonImageOnly: true,
        buttonText: "Select date",
        dateFormat: 'yy-mm-dd',
        timeFormat: "HH:mm",
        changeMonth: true,
        changeYear: true,
        showSecond: false,
        showMillisec: false,
        pickSeconds: false
    })

    $('#call-remarks').keydown(function (e) {
        if (e.keyCode == 33 || e.keyCode == 34) {
            $(this).blur();
        }
    })

    // ==================== 1- customer data ====================
    customerData = parent.customerData || null;
    console.log('customerData'); console.log(customerData);
    customerId = customerData.Call_Id;
    document.getElementById('customer-id-title').innerHTML = customerId;

    var type = parent.type;

    //20250320 Unexpected constant truthiness on the left-hand side of a `||` expression.
    //caseLogLength = sessionStorage.getItem('scrmCaseLogLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5 || 5;
	caseLogLength = sessionStorage.getItem('scrmCaseLogLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5;
	
    // Set basic info
    document.getElementById('ip-agent-name').innerHTML = agentName;

    if (customerData.Callback_Time != null) {
        $('#callback-datetime').val(customerData.Callback_Time.replace('T', ' ').slice(0, 16));
    }

    var callStatus = customerData.Call_Status || '';
    var callReason = customerData.Call_Reason || '';
    var remarks = customerData.Remark || '';
    console.log('TBD callStatus'); console.log(callStatus);
    if (callStatus.length > 0) {
        $('#call-status').val(callStatus).change();
        if (callReason.length > 0) {
            if (callStatus == 'Reached') {
                $('#reached-reason').val(customerData.Call_Reason)
            } else if (callStatus == 'Unreach') {
                $('#unreach-reason').val(customerData.Call_Reason)
            }
        }
    }

    $('#call-remarks').val(remarks);

    // Set customer info
    var Mobile_No = '';
    var Home_No = '';
    var Office_No = '';
    var Other_Phone_No = '';
    var First_Name = '';
    var Last_Name = '';
    var Gender = '';

    if (type != 'newCustomer') {
        disableMode = true;
    }
  //if (customerData && customerData.disableMode != undefined) {		//20250516 Prefer using an optional chain expression instead, as it's more concise and easier to read.
	if (customerData?.disableMode !== undefined) {
        disableMode = customerData.disableMode
    }
    if (disableMode) {
        $('.edit-field').prop('disabled', true);
        $('#edit-save-btn').html('<i class="fa fa-edit me-2"></i><span>' + langJson['l-form-edit'] + '</span>');
    }
    if (customerData != undefined) {

        if (customerData.Call_Status == 'Successful Order') {

            // set 'Successful Order' to load product
            // you cannot change the call status to others if it is 'Successful Order'
            $('#call-status').val('Successful Order').change().prop('disabled', true);
            $('#successful-reason').prop('disabled', true);
        }

        // get specific data
        First_Name = customerData.First_Name || '';
        Last_Name = customerData.Last_Name || '';
        Gender = customerData.Gender || '';

        Mobile_No = customerData.Mobile_No || '';
        Home_No = customerData.Home_No || '';
        Office_No = customerData.Office_No || '';
        Other_Phone_No = customerData.Other_Phone_No || '';
        Email = customerData.Email || '';

        // Update basic field
        $('#Gender').val(Gender);
        $('#First_Name').val(First_Name);
        $('#Last_Name').val(Last_Name);
        $('#DOB').val((customerData.DOB || '').substr(0, 10));
        $('#Join_Date').val((customerData.Join_Date || '').substr(0, 10));

        $('#applicant-gender-select').val(Gender);
        $('#applicant-eng-first-name-input').val(First_Name);
        $('#applicant-eng-last-name-input').val(Last_Name);
        $('#applicant-dob-date').val((customerData.DOB || '').substr(0, 10)).trigger('change');
    }
    var _Mobile_No = $('#Mobile_No');
    var _Office_No = $('#Office_No');
    var _Home_No = $('#Home_No');
    var _Other_Phone_No = $('#Other_Phone_No');

    // Update editable text field
    _Mobile_No.val(Mobile_No);
    _Home_No.val(Home_No);
    _Office_No.val(Office_No);
    _Other_Phone_No.val(Other_Phone_No);

    $('#applicant-mobile-no-input').val(Mobile_No);

    var mobileStyle = 'none';
    var homeStyle = 'none';
    var officeStyle = 'none';
    var otherStyle = 'none';
    var newMobile = Mobile_No;
    var newHome = Home_No;
    var newOffice = Office_No;
    var newOther = Other_Phone_No;

    if (Mobile_No != null && Mobile_No.length > 0) {
        mobileStyle = 'inline-block';
    } else {
        newMobile = ' ';
    }

    if (Home_No != null && Home_No.length > 0) {
        homeStyle = 'inline-block';
    } else {
        newHome = ' ';
    }

    if (Office_No != null && Office_No.length > 0) {
        officeStyle = 'inline-block';
    } else {
        newOffice = ' ';
    }

    if (Other_Phone_No != null && Other_Phone_No.length > 0) {
        otherStyle = 'inline-block';
    } else {
        newOther = ' ';
    }

    $('<span style="display:' + mobileStyle + ';" name="sms" class="cMobile_No" id="reply-sms-mobile-container"><div class="form-check me-2"><label class="form-check-label"><input type="checkbox" class="form-check-input reply-checkbox sms-list dial-yes-disable" value="' + Mobile_No + '" id="oSmsMobile_No">' + newMobile + '<span class="form-check-sign"><span class="check"></span></span></label></div></span>').insertBefore('#sms-other-container');
    $('<span style="display:' + mobileStyle + ';" name="call" class="cMobile_No" id="reply-call-mobile-container"><div class="form-check ms-2"><label class="form-check-label"><input type="radio" name="callList" class="form-check-input reply-checkbox call-list dial-yes-disable" onchange="replyCallChanged(this)" value="' + Mobile_No + '" id="oCallMobile_No">' + newMobile + '<span class="circle"><span class="check"></span></span></label></div></span>').insertBefore('#call-other-container');

    $('<span style="display:' + homeStyle + ';" name="sms" class="cMobile_No" id="reply-sms-mobile-container"><div class="form-check me-2"><label class="form-check-label"><input type="checkbox" class="form-check-input reply-checkbox sms-list dial-yes-disable" value="' + Home_No + '" id="oSmsMobile_No">' + newHome + '<span class="form-check-sign"><span class="check"></span></span></label></div></span>').insertBefore('#sms-other-container');
    $('<span style="display:' + homeStyle + ';" name="call" class="cMobile_No" id="reply-call-mobile-container"><div class="form-check ms-2"><label class="form-check-label"><input type="radio" name="callList" class="form-check-input reply-checkbox call-list dial-yes-disable" onchange="replyCallChanged(this)" value="' + Home_No + '" id="oCallMobile_No">' + newHome + '<span class="circle"><span class="check"></span></span></label></div></span>').insertBefore('#call-other-container');

    $('<span style="display:' + officeStyle + ';" name="sms" class="cMobile_No" id="reply-sms-mobile-container"><div class="form-check me-2"><label class="form-check-label"><input type="checkbox" class="form-check-input reply-checkbox sms-list dial-yes-disable" value="' + Office_No + '" id="oSmsMobile_No">' + newOffice + '<span class="form-check-sign"><span class="check"></span></span></label></div></span>').insertBefore('#sms-other-container');
    $('<span style="display:' + officeStyle + ';" name="call" class="cMobile_No" id="reply-call-mobile-container"><div class="form-check ms-2"><label class="form-check-label"><input type="radio" name="callList" class="form-check-input reply-checkbox call-list dial-yes-disable" onchange="replyCallChanged(this)" value="' + Office_No + '" id="oCallMobile_No">' + newOffice + '<span class="circle"><span class="check"></span></span></label></div></span>').insertBefore('#call-other-container');

    $('<span style="display:' + otherStyle + ';" name="sms" class="cOther_Phone_No" id="reply-sms-other-container"><div class="form-check"><label class="form-check-label"><input type="checkbox" class="form-check-input reply-checkbox sms-list dial-yes-disable" value="' + Other_Phone_No + '" id="oSmsOther_Phone_No">' + newOther + '<span class="form-check-sign"><span class="check"></span></span></label></div></span>').insertBefore('#sms-other-container');
    $('<span style="display:' + otherStyle + ';" name="call" class="cOther_Phone_No" id="reply-call-other-container"><div class="form-check ms-2"><label class="form-check-label"><input type="radio" name="callList" class="form-check-input reply-checkbox call-list dial-yes-disable" onchange="replyCallChanged(this)" value="' + Other_Phone_No + '" id="oCallOther_Phone_No">' + newOther + '<span class="circle"><span class="check"></span></span></label></div></span>').insertBefore('#call-other-container');


    // // deprecated - if not admin and call list not belongs to the agent, disable all fields
    // // deprecated - tested if Supervisor updated the form, will not customerData Agent_Id becomes the agent
    // // deprecated, but keep, non handling agent and not admin, should not be able to see the form in fact, in case he can still see the form, added below
    if (!parent.isAdmin && customerData.Agent_Id != loginId) {
        console.log('disable');
        $('input').prop('disabled', true);
        $('select').prop('disabled', true);
        $('textarea').prop('disabled', true);
        $('button').prop('disabled', true);

        // init after select reply by call will resize
        resize();
    } else {

        // not disabled fields, selet call
        $("#reply-call").prop("checked", true).trigger("click");

        // select first displaying phone number
        $('input[name="callList"]:visible:first').prop("checked", true);
    }

    if (caseNo != -1) {
        $('#scheduled-reminder').show();
    }

    $('#fm-close-btn').on('click', function () {

        function closeForm() {
            parent.$('#o-search-customer-body').collapse('show');
            parent.$('#o-search-btn').click();
        }

        // after saved will forzen the form
        if ($('#fm-save-btn').hasClass('d-none')) {
            closeForm();
            return;
        }

        var sendObj = getCurrentSdObj();

        // to do compare if no chagne close, if change shows confirm
        if (hvDifferenceFn(sendObj, false)){
            
            // Confirm
            parent.parent.$.MessageBox({
                buttonDone  : "OK",
                buttonFail  : "Cancel",
                message     : "Discard changes and close the form?"
            }).done(function(){
                closeForm();
            })

            // no cancel
            // .fail(function(){
            // });

            // if (confirm('Discard changes and cloase the form?')) {
            //     closeForm();
            // }
        } else {
            closeForm();
        }
    })
})

function isInteger(num) { //Number.isInteger only work on Chrome, not IE, so have this function
    return (num ^ 0) === num;
}

var editClicked = function (fieldId) {
    var textField = document.getElementById(fieldId);
    var aField = document.getElementById('t' + fieldId); //e.g. tMobile_No
    var editButton = document.getElementById(fieldId + '_edit');
    var updateButton = document.getElementById(fieldId + '_update');
    textField.style.display = 'inline-block';
    updateButton.style.display = 'inline-block';
    aField.style.display = 'none';
    editButton.style.display = 'none';
    resize();
}

function callOnkeydown() { // if pressed Enter, equal pressed Dial button
    if (window.event.keyCode == 13) {
        replySubmitClicked();
    }
}

function updateClicked(isTemp) {

    // verify email
    var email = document.getElementById('Email').value || ''
    if (email.length > 0 && !gf.verifyIsEmailValid(email)) {
        parent.parent.$.MessageBox('Email is invalid');
        $('#Email').focus();
        return;
    }

    // Update customer
    var Customer_Data = {

        Lang: document.getElementById('Lang').value || '',
        Name_Eng: document.getElementById('Name_Eng').value || '',
        Mobile_No: document.getElementById('Mobile_No').value || '',
        Other_Phone_No: document.getElementById('Other_Phone_No').value || '',
        Fax_No: document.getElementById('Fax_No').value || '',
        Email: email,
        Address1: document.getElementById('Address1').value || ''
    };
    if (isTemp) {
        return Customer_Data;
    }
    if (disableMode) {
        disableMode = false;
        $('#edit-save-btn').html('<i class="fa fa-save me-2"></i><span>' + langJson["l-form-save"] + '</span>');
        $('.edit-field').prop('disabled', false);
        return;
    }

    // verify name cannot which cannot be blank
    if (Customer_Data.Name_Eng.length == 0) {
        parent.parent.$.MessageBox(langJson['l-alert-no-full-name']);
        return;
    }
    if (callType == 'Inbound_Facebook') {
        Customer_Data.Facebook_Id = window.frameElement.getAttribute("enduserId");
    }
    if (callType == 'Inbound_Wechat') {
        Customer_Data.Wechat_Id = window.frameElement.getAttribute("enduserId");
    }
    if (callType == 'Inbound_Whatsapp') {
        Customer_Data.Whatsapp_Id = window.frameElement.getAttribute("enduserId");
    }
    $.ajax({
        type: "PUT",
        url: config.companyUrl + '/api/UpdateCustomer',
        data: JSON.stringify({
            Customer_Id: Number(customerId),
            Agent_Id: loginId,
            Customer_Data: Customer_Data,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        var details = res.details;
        if (!/^success$/i.test(res.result || "")) {
            console.log("Error in updateClicked." + details ? details : '');
            parent.parent.$.MessageBox(langJson['l-alert-save-customer-failed']);
        } else {

            // turn to disable mode
            disableMode = true;
            $('#edit-save-btn').html('<i class="fa fa-edit me-2"></i><span>' + langJson['l-form-edit'] + '</span>');
            $('.edit-field').prop('disabled', true);

            // update reply container
            var replyArr = ['Mobile_No', 'Other_Phone_No', 'Fax_No', 'Email'];
            for (let fieldId of replyArr) {
                var value = Customer_Data[fieldId];
                switch (fieldId) {
                    case 'Mobile_No':
                        var smsMobileNo = $('#oSmsMobile_No');
                        var callMobile = $('#oCallMobile_No');
                        smsMobileNo.val(value);
                        smsMobileNo.get(0).nextSibling.data = value;
                        callMobile.val(value);
                        callMobile.get(0).nextSibling.data = value;
                        if (value.length == 0) {
                            $('#reply-sms-mobile-container').hide();
                            $('#reply-call-mobile-container').hide();
                        } else {
                            $('#reply-sms-mobile-container').css('display', 'inline-block');
                            $('#reply-call-mobile-container').css('display', 'inline-block');
                        }
                        break;
                    case 'Other_Phone_No':
                        var smsOtherNo = $('#oSmsOther_Phone_No');
                        var callOtherNo = $('#oCallOther_Phone_No');
                        smsOtherNo.val(value);
                        smsOtherNo.get(0).nextSibling.data = value;
                        callOtherNo.val(value);
                        callOtherNo.get(0).nextSibling.data = value;
                        if (value.length == 0) {
                            $('#reply-sms-other-container').hide();
                            $('#reply-call-other-container').hide();
                        } else {
                            $('#reply-sms-other-container').css('display', 'inline-block');
                            $('#reply-call-other-container').css('display', 'inline-block');
                        }
                        break;
                    case 'Fax_No':
                        var oFaxNo = $('#oFax_No');
                        oFaxNo.val(value);
                        oFaxNo.get(0).nextSibling.data = value;
                        if (value.length == 0) {
                            $('#reply-fax-container').hide();
                        } else {
                            $('#reply-fax-container').css('display', 'inline-block');
                        }
                        break;
                    case 'Email':
                        var oEmail = $('#oEmail');
                        oEmail.val(value);
                        oEmail.get(0).nextSibling.data = value;
                        if (value.length == 0) {
                            $('#reply-email-container').hide();
                        } else {
                            $('#reply-email-container').css('display', 'inline-block');
                        }
                        break;
                    default:
                        break;
                };
                if (value != null && value.length > 0) {
                    $('.c' + fieldId).show();
                } else {
                    $('.c' + fieldId).hide();
                }
            }
        }
    })
}

function selectRadio(ary, value) {
    var temp;
    var i;
    temp = document.getElementsByName(ary);
    for (i = 0; i < temp.length; i++) {
        if (temp[i].value == value) {
            temp[i].checked = true;
            break;
        }
    }
}

function checkRadioSelected(ary) {
    var temp = document.getElementsByName(ary);
    var temp_checked = false;
    for (let theTmp of temp) {
        if (theTmp.checked) {
            temp_checked = true;
            break;
        }
    }
    return temp_checked;
}

function showCustomerSectionOnly() {
    $('#accordion').hide();
    $('#agent-handle-section').hide();
    $('#save-btn-section').hide();
    $('#updateCsSection').hide();
    $('#customer-table').removeClass('mb-5');
    $('#customer-table').addClass('mb-0');
    $('html').css("background", "white");
    $(".card-header").removeAttr("data-toggle");
    resize();
}

// to do check HKID again before saving
function checkHKID(str) {
    var strValidChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    // maybe just clear the field, no HKID
    if (str.length == 0) {
        return
    }

    // basic check length
    if (str.length < 8) {
        alert("Invalid HKID");
        return false;
    }

    // convert to upper case
    str = str.toUpperCase();

    // regular expression to check pattern and split
    var hkidPat = /^([A-Z]{1,2})(\d{6})([A\d])$/;   // var hkidPat = /^([A-Z]{1,2})([0-9]{6})([A0-9])$/;    // 20250408 Use concise character class syntax '\d' instead of '[0-9]'.

    var matchArray = str.match(hkidPat);

    // not match, return false
    if (matchArray == null) {
        alert("Invalid HKID");
        return false;
    }

    // the character part, numeric part and check digit part
    var charPart = matchArray[1];
    var numPart = matchArray[2];
    var checkDigit = matchArray[3];

    // calculate the checksum for character part
    var checkSum = 0;
    if (charPart.length == 2) {
        checkSum += 9 * (10 + strValidChars.indexOf(charPart.charAt(0)));
        checkSum += 8 * (10 + strValidChars.indexOf(charPart.charAt(1)));
    } else {
        checkSum += 9 * 36;
        checkSum += 8 * (10 + strValidChars.indexOf(charPart));
    }

    // calculate the checksum for numeric part
    for (var i = 0, j = 7; i < numPart.length; i++, j--) {
        checkSum += j * numPart.charAt(i);
    }

    // verify the check digit
    var remaining = checkSum % 11;
    var verify = remaining == 0 ? 0 : 11 - remaining;
    var flag = verify == checkDigit || (verify == 10 && checkDigit == 'A');
    if (!flag) alert("Invalid HKID");
    return flag;
}

$('#applicant-hkid-input').on('blur', function () {
    //checkHKID(this.value, this);	//20250325 This function expects 1 argument, but 2 were provided.
	checkHKID(this.value);
	
})