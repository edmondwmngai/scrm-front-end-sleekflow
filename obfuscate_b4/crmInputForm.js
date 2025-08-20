var customerData = null;
var disableMode = false;
var customerOnly = false;
var type = parent.type;
var openType = window.frameElement.getAttribute("openType") || ''; // "menu" or "traditional" or "social"
//var isSocial = window.frameElement.getAttribute("openType") == "social" ? true : false;   //20250320 Unnecessary use of boolean literals in conditional expression.
var isSocial = window.frameElement.getAttribute("openType") === "social";
let customerId = window.frameElement.getAttribute("customerId") ? parseInt(window.frameElement.getAttribute("customerId")) : -1;
var internalCaseNo = window.frameElement.getAttribute("internalCaseNo") || -1;
var caseNo = window.frameElement.getAttribute("caseNo") || -1;
var outstandingAttachment = 0;
var agentList = parent.parent.agentList || [];
var campaign = window.frameElement.getAttribute("campaign") || parent.frameElement.getAttribute("campaign") || parent.campaign || '';
var ivrInfo = parent.frameElement.getAttribute("ivrInfo") || '';
var caseLogLength = 5;
var photoSrc = '../../images/user.png';
var replyConfirmed = false; // If true, reply is confirmed and the area is disabled, cannot be changed
var isManualUpdate = false;
var callType = isSocial ? window.frameElement.getAttribute("callType") : parent.window.frameElement.getAttribute("callType") || ''; // When manual update open input form channel is ''
var details = isSocial ? (window.frameElement.getAttribute("details") || '') : unescape(parent.window.frameElement.getAttribute("details") || ''); // isSocial ? '' : parent.window.frameElement.getAttribute("details") || '';
var connId = isSocial ? -1 : parent.window.frameElement.getAttribute("connId") || null;

//20250520 Extract this nested ternary operation into an independent statement.
//var ticketId = isSocial ? window.frameElement.getAttribute("connId") : (parent.document.getElementById('media-content') != null) ? parent.document.getElementById('media-content').getAttribute('mediaid') || null : null;
var ticketId;
if (isSocial) {
    ticketId = window.frameElement.getAttribute("connId");
} else {
    let mediaContent = parent.document.getElementById('media-content');
    if (mediaContent !== null) {
        ticketId = mediaContent.getAttribute('mediaid') || null;
    } else {
        ticketId = null;
    }
}

// When manual update open input form connId is null
var updateCaseObj = {}; // Object used to send to UpdateCase api
if (ticketId) {
    updateCaseObj.Ticket_Id = ticketId;
}
var tabType = parent.tabType || 'traditional-media';
var selectedCaseLog = {}; // Needed for caseRecordPopup
var caseRecordPopup = null; // Needed to call from menu.html to pass social media history
var emailFileList = [];
var faxFileList = [];
var outsider = false;
var nationalityArr = sessionStorage.getItem('scrmNationalityArr') ? JSON.parse(sessionStorage.getItem('scrmNationalityArr')) : [];
var marketArr = sessionStorage.getItem('scrmMarketArr') ? JSON.parse(sessionStorage.getItem('scrmMarketArr')) : [];
var profileArr = sessionStorage.getItem('scrmProfileArr') ? JSON.parse(sessionStorage.getItem('scrmProfileArr')) : [];
var updatedCustomerData = {};
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var mvcHost = config.mvcHost;
var wiseHost = config.wiseHost;
var categories = sessionStorage.getItem('scrmCategories') || '';
//var haveSystemTools = categories.indexOf('System-Tools') != -1 ? true : false;    //20250320 Unnecessary use of boolean literals in conditional expression.
var haveSystemTools = categories.indexOf('System-Tools') != -1;
var changeContactCaseNo, changeContactCustomerId;

if (connId != null) {
    connId = Number(connId)
}

var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';
var agentName = sessionStorage.getItem('scrmAgentName') || '';

//20241217 newly added for shandler
var sAgentId = 0;
var sToken = "";
var sCompany = "";
var sTo = "";
var waTempService = null;

// check if open from incomplete cases for an outbound call
var winReplyConnId = '';
var winReplyDetails = '';
if (openType == 'menu') {

    // only outbound call now
    winReplyConnId = parent.frameElement.getAttribute('replyConnId') || '';
    winReplyDetails = parent.frameElement.getAttribute('replyDetails') || '';
}

//20241219 FOR shandler
var selectedSendTemplate = null;


// var SMSTemplateArr = [
//     '你的 My Choice 驗證碼是 M-123456',
//     'M-123456 is your My Choice verification code',
//     'My Choice: 截至 01/01/00, 您的 My Choice 積金之個人帳戶戶口結餘 $178,991',
//     'My Choice: As of 01/01/00, your My Choice accumulation fund personal account balance $178,991',
//     'My Choice 強積金計劃說明書連結 https://bit.ly/3iBpRer',
//     'My Choice 強積金計劃說明書第一補編連結 https://bit.ly/2Y1O3i2',
//     'My Choice 持續成本列表連結 https://bit.ly/2XUgL4z',
//     'My Choice 強積金保守基金年費解說例子連結 https://bit.ly/30U3734',
//     'Link of My Choice MPF Scheme https://bit.ly/3fV6cEo',
//     'Link of First Addendum to the MPF Scheme Brochure of My Choice MPF https://bit.ly/33Yfptq',
//     'My Choice - Link of On-Going Cost Illustrations https://bit.ly/3kGkagZ',
//     'Link of Illustrative Example for My Choice MPF Conservative Fund https://bit.ly/3kKCENy',
//     'My Choice 更改基金組合授權書連結 https://bit.ly/33XEO6p',
//     'My Choice 基金轉換指示連結 https://bit.ly/31UfY4V',
//     'My Choice 個人資料使用指示連結 https://bit.ly/30SHmAU',
//     'Link of Change of Investment Fund Instruction of My Choice https://bit.ly/2DXLwOS',
//     'Link of My Choice Fund Swtich Form https://bit.ly/2Y20KcV',
//     'My Choice - Link of Instruction of Use of Personal Information https://bit.ly/3gXruCC'
// ]

var SMSTemplateArr = [
    'ABC Company: 你的驗證碼是 M-123456',
    'ABC Company: M-123456 is your verification code',
    'ABC Company: 截至 01/01/00, 您的個人帳戶戶口結餘 $178,991',
    'ABC Company: As of 01/01/00, your accumulation fund personal account balance $178,991',
    'ABC Company: 強積金計劃說明書連結 https://bit.ly/3iBpRer',
    'ABC Company: 強積金計劃說明書第一補編連結 https://bit.ly/2Y1O3i2',
    'ABC Company: 持續成本列表連結 https://bit.ly/2XUgL4z',
    'ABC Company: 強積金保守基金年費解說例子連結 https://bit.ly/30U3734',
    'ABC Company: Link of MPF Scheme https://bit.ly/3fV6cEo',
    'ABC Company: Link of First Addendum to the MPF Scheme Brochure of MPF https://bit.ly/33Yfptq',
    'ABC Company: Link of On-Going Cost Illustrations https://bit.ly/3kGkagZ',
    'ABC Company: Link of Illustrative Example for MPF Conservative Fund https://bit.ly/3kKCENy',
    'ABC Company: 更改基金組合授權書連結 https://bit.ly/33XEO6p',
    'ABC Company: 基金轉換指示連結 https://bit.ly/31UfY4V',
    'ABC Company: 個人資料使用指示連結 https://bit.ly/30SHmAU',
    'ABC Company: Link of Change of Investment Fund Instruction https://bit.ly/2DXLwOS',
    'ABC Company: Link of Fund Swtich Form https://bit.ly/2Y20KcV',
    'ABC Company: Link of Instruction of Use of Personal Information https://bit.ly/3gXruCC'
]

// var emailTemplateArr = [
// { subject: '你的 My Choice 驗證碼', content: '你的 My Choice 驗證碼是 M-123456'},
//     { subject: 'Your My Choice verification code', content: 'M-123456 is your My Choice verification code'},
//     { subject: '您的 My Choice 積金之個人帳戶戶口結餘', content: 'My Choice: 截至 01/01/00, 您的 My Choice 積金之個人帳戶戶口結餘 $178,991' },
//     { subject: 'Your My Choice accumulation fund personal account balance', content: 'My Choice: As of 01/01/00, your My Choice accumulation fund personal account balance $178,991' },

//     { subject: 'My Choice 強積金計劃說明書連結', content: 'My Choice 強積金計劃說明書連結 <a href="https://www.bocpt.com/media/1605/my-choice-mpf-sb_chi_final.pdf">https://www.bocpt.com/media/1605/my-choice-mpf-sb_chi_final.pdf</a>'},
//     { subject: 'My Choice 強積金計劃說明書第一補編連結', content: 'My Choice 強積金計劃說明書第一補編連結 <a href="https://www.bocpt.com/media/1897/my_choice_sb_first-addendum_chi_202005.pdf">https://www.bocpt.com/media/1897/my_choice_sb_first-addendum_chi_202005.pdf</a>'},
//     { subject: 'My Choice 持續成本列表連結', content: 'My Choice 持續成本列表連結 <a href="https://www.bocpt.com/media/1171/oci_chi_mymp-mar-2020.pdf">https://www.bocpt.com/media/1171/oci_chi_mymp-mar-2020.pdf</a>'},
//     { subject: 'My Choice 強積金保守基金年費解說例子連結', content: 'My Choice 強積金保守基金年費解說例子連結 <a href="https://www.bocpt.com/media/1172/mcf-illustrative-example_-chi.pdf">https://www.bocpt.com/media/1172/mcf-illustrative-example_-chi.pdf</a>'},

//     { subject: 'Link of My Choice MPF Scheme', content: 'Link of My Choice MPF Scheme <a href="https://www.bocpt.com/media/1606/my-choice-mpf-sb_eng_final.pdf"> https://www.bocpt.com/media/1606/my-choice-mpf-sb_eng_final.pdf</a>'},
//     { subject: 'Link of First Addendum to the MPF Scheme Brochure of My Choice MPF', content: 'Link of First Addendum to the MPF Scheme Brochure of My Choice MPF <a href="https://www.bocpt.com/media/1896/my_choice_sb_first-addendum_eng_202005.pdf">https://www.bocpt.com/media/1896/my_choice_sb_first-addendum_eng_202005.pdf</a>'},
//     { subject: 'My Choice - Link of On-Going Cost Illustrations', content: 'My Choice - Link of On-Going Cost Illustrations <a href="https://www.bocpt.com/media/1265/oci_eng_mymp-mar-2020.pdf">https://www.bocpt.com/media/1265/oci_eng_mymp-mar-2020.pdf</a>'},
//     { subject: 'Link of Illustrative Example for My Choice MPF Conservative Fund', content: 'Link of Illustrative Example for My Choice MPF Conservative Fund <a href="https://www.bocpt.com/media/1266/mcf-illustrative-example_-eng.pdf">https://www.bocpt.com/media/1266/mcf-illustrative-example_-eng.pdf</a>'},

//     { subject: 'My Choice 更改基金組合授權書連結', content: 'My Choice 更改基金組合授權書連結 <a href="https://www.bocpt.com/media/1234/my-choice-fund-rebalance_201808-2.pdf">https://www.bocpt.com/media/1234/my-choice-fund-rebalance_201808-2.pdf</a>'},
//     { subject: 'My Choice 基金轉換指示連結', content: 'My Choice 基金轉換指示連結 <a href="https://www.bocpt.com/media/1667/my-choice-fund-switching_r1.pdf">https://www.bocpt.com/media/1667/my-choice-fund-switching_r1.pdf</a>'},
//     { subject: 'My Choice 個人資料使用指示連結', content: 'My Choice 個人資料使用指示連結 <a href="https://www.bocpt.com/media/1818/instruction-of-use-of-personal-info-mymp_201912.pdf">https://www.bocpt.com/media/1818/instruction-of-use-of-personal-info-mymp_201912.pdf</a>'},

//     { subject: 'Link of Change of Investment Fund Instruction of My Choice', content: 'Link of Change of Investment Fund Instruction of My Choice <a href="https://www.bocpt.com/media/1234/my-choice-fund-rebalance_201808-2.pdf">https://www.bocpt.com/media/1234/my-choice-fund-rebalance_201808-2.pdf</a>'},
//     { subject: 'Link of My Choice Fund Swtich Form', content: 'Link of My Choice Fund Swtich Form <a href="https://www.bocpt.com/media/1667/my-choice-fund-switching_r1.pdf">https://www.bocpt.com/media/1667/my-choice-fund-switching_r1.pdf</a>'},
//     { subject: 'My Choice - Link of Instruction of Use of Personal Information', content: 'My Choice - Link of Instruction of Use of Personal Information <a href="https://www.bocpt.com/media/1818/instruction-of-use-of-personal-info-mymp_201912.pdf">https://www.bocpt.com/media/1818/instruction-of-use-of-personal-info-mymp_201912.pdf</a>'}
// ]
var emailTemplateArr = [{
    subject: 'ABC Company 你的驗證碼',
    content: '你的驗證碼是 M-123456'
},
{
    subject: 'ABC Company your verification code',
    content: 'M-123456 is your verification code'
},
{
    subject: 'ABC Company 您的積金之個人帳戶戶口結餘',
    content: '截至 01/01/00, 您的積金之個人帳戶戶口結餘 $178,991'
},
{
    subject: 'ABC Company your accumulation personal account balance',
    content: 'As of 01/01/00, your accumulation personal account balance $178,991'
},

{
    subject: 'ABC Company 強積金計劃說明書連結',
    content: '強積金計劃說明書連結 <a href="https://www.bocpt.com/media/1605/my-choice-mpf-sb_chi_final.pdf">https://www.bocpt.com/media/1605/my-choice-mpf-sb_chi_final.pdf</a>'
},
{
    subject: 'ABC Company 強積金計劃說明書第一補編連結',
    content: '強積金計劃說明書第一補編連結 <a href="https://www.bocpt.com/media/1897/my_choice_sb_first-addendum_chi_202005.pdf">https://www.bocpt.com/media/1897/my_choice_sb_first-addendum_chi_202005.pdf</a>'
},
{
    subject: 'ABC Company 持續成本列表連結',
    content: '持續成本列表連結 <a href="https://www.bocpt.com/media/1171/oci_chi_mymp-mar-2020.pdf">https://www.bocpt.com/media/1171/oci_chi_mymp-mar-2020.pdf</a>'
},
{
    subject: 'ABC Company 強積金保守基金年費解說例子連結',
    content: '強積金保守基金年費解說例子連結 <a href="https://www.bocpt.com/media/1172/mcf-illustrative-example_-chi.pdf">https://www.bocpt.com/media/1172/mcf-illustrative-example_-chi.pdf</a>'
},

{
    subject: 'ABC Company Link of MPF Scheme',
    content: 'Link of MPF Scheme <a href="https://www.bocpt.com/media/1606/my-choice-mpf-sb_eng_final.pdf"> https://www.bocpt.com/media/1606/my-choice-mpf-sb_eng_final.pdf</a>'
},
{
    subject: 'ABC Company Link of First Addendum to the MPF Scheme Brochure of MPF',
    content: 'Link of First Addendum to the MPF Scheme Brochure of MPF <a href="https://www.bocpt.com/media/1896/my_choice_sb_first-addendum_eng_202005.pdf">https://www.bocpt.com/media/1896/my_choice_sb_first-addendum_eng_202005.pdf</a>'
},
{
    subject: 'ABC Company Link of On-Going Cost Illustrations',
    content: 'Link of On-Going Cost Illustrations <a href="https://www.bocpt.com/media/1265/oci_eng_mymp-mar-2020.pdf">https://www.bocpt.com/media/1265/oci_eng_mymp-mar-2020.pdf</a>'
},
{
    subject: 'ABC Company Link of Illustrative Example for MPF Conservative Fund',
    content: 'Link of Illustrative Example for MPF Conservative Fund <a href="https://www.bocpt.com/media/1266/mcf-illustrative-example_-eng.pdf">https://www.bocpt.com/media/1266/mcf-illustrative-example_-eng.pdf</a>'
},

{
    subject: 'ABC Company 更改基金組合授權書連結',
    content: '更改基金組合授權書連結 <a href="https://www.bocpt.com/media/1234/my-choice-fund-rebalance_201808-2.pdf">https://www.bocpt.com/media/1234/my-choice-fund-rebalance_201808-2.pdf</a>'
},
{
    subject: 'ABC Company 基金轉換指示連結',
    content: '基金轉換指示連結 <a href="https://www.bocpt.com/media/1667/my-choice-fund-switching_r1.pdf">https://www.bocpt.com/media/1667/my-choice-fund-switching_r1.pdf</a>'
},
{
    subject: 'ABC Company 個人資料使用指示連結',
    content: '個人資料使用指示連結 <a href="https://www.bocpt.com/media/1818/instruction-of-use-of-personal-info-mymp_201912.pdf">https://www.bocpt.com/media/1818/instruction-of-use-of-personal-info-mymp_201912.pdf</a>'
},

{
    subject: 'ABC Company Link of Change of Investment Fund Instruction',
    content: 'Link of Change of Investment Fund Instruction <a href="https://www.bocpt.com/media/1234/my-choice-fund-rebalance_201808-2.pdf">https://www.bocpt.com/media/1234/my-choice-fund-rebalance_201808-2.pdf</a>'
},
{
    subject: 'ABC Company Link of Fund Swtich Form',
    content: 'Link of Fund Swtich Form <a href="https://www.bocpt.com/media/1667/my-choice-fund-switching_r1.pdf">https://www.bocpt.com/media/1667/my-choice-fund-switching_r1.pdf</a>'
},
{
    subject: 'ABC Company Link of Instruction of Use of Personal Information',
    content: 'Link of Instruction of Use of Personal Information <a href="https://www.bocpt.com/media/1818/instruction-of-use-of-personal-info-mymp_201912.pdf">https://www.bocpt.com/media/1818/instruction-of-use-of-personal-info-mymp_201912.pdf</a>'
}
]

// Email Template
// var emailTemplateArr = [
//     { subject: 'Your My Choice verification code', content: 'M-123456 is your My Choice verification code'},
//     { subject: '你的 My Choice 驗證碼', content: '你的 My Choice 驗證碼是 M-123456'},
//     { subject: 'My Choice - Link of My Choice Fund Swtich Form', content: 'Link of My Choice Fund Swtich Form <a href="https://www.bocpt.com/media/1667/my-choice-fund-switching_r1.pdf">https://www.bocpt.com/media/1667/my-choice-fund-switching_r1.pdf</a>' },
//     { subject: 'My Choice 基金轉換指示連結', content: 'My Choice 基金轉換指示連結 <a href="https://www.bocpt.com/media/1667/my-choice-fund-switching_r1.pdf">https://www.bocpt.com/media/1667/my-choice-fund-switching_r1.pdf</a>' },
//     { subject: 'My Choice - Link of Change of Investment Fund Instruction Form', content: 'My Choice - Link of Change of Investment Fund Instruction Form <a href="https://www.bocpt.com/media/1304/my-choice-fund-rebalance_201808.pdf">https://www.bocpt.com/media/1304/my-choice-fund-rebalance_201808.pdf</a>' },
//     { subject: 'My Choice更改基金組合授權書連結', content: 'My Choice 更改基金組合授權書連結 <a href="https://www.bocpt.com/media/1304/my-choice-fund-rebalance_201808.pdf">https://www.bocpt.com/media/1304/my-choice-fund-rebalance_201808.pdf</a>' },
//     { subject: 'Your My Choice accumulation fund personal account balance', content: 'My Choice: As of 01/01/00, your My Choice accumulation fund personal account balance $178,991' },
//     { subject: '您的 My Choice 積金之個人帳戶戶口結餘', content: 'My Choice: 截至 01/01/00, 您的 My Choice 積金之個人帳戶戶口結餘 $178,991' }    
// ]

// var SMSTemplateArr = [
//     'M-123456 is your My Choice verification code',
//     '你的 My Choice 驗證碼是 M-123456',
//     'Link of My Choice Fund Swtich Form https://bit.ly/3gMmL6B',
//     'My Choice 基金轉換指示連結 https://bit.ly/3gMmL6B',
//     'Link of Change of Investment Fund Instruction of My Choice https://bit.ly/3alo7TB',
//     'My Choice 更改基金組合授權書連結 https://bit.ly/3alo7TB',
//     'My Choice: As of 01/01/00, your My Choice accumulation fund personal account balance $178,991',
//     'My Choice: 截至 01/01/00, 您的 My Choice 積金之個人帳戶戶口結餘 $178,991'            
// ]

function nationalityChanged(oThis) {
    var nationalitySelect = $(oThis);
    var nationalityId = nationalitySelect.val();
    var option = $('option:selected', oThis);
    var marketId = option.attr('market-id');
    var profileId = option.attr('profile-id');
    var marketSelect = $('#Market_Id')
    var profileSelect = $('#Profile_Id');
    if (nationalityId == '') {
        marketSelect.val('').attr('disabled', false);
        profileSelect.val('').attr('disabled', false);
    //} else {  //20250410 'If' statement should not be the only statement in 'else' block
    } else if (nationalityId == 1) {
            marketSelect.val(marketId).attr('disabled', false);
            profileSelect.val(profileId).attr('disabled', false);
    } else {
            marketSelect.val(marketId).attr('disabled', true);
            profileSelect.val(profileId).attr('disabled', true);
        //}//   20250410 for else if
    }

}

function getAgentName(theAgentId) {
    var agentObj = gf.altFind(agentList, function (obj) {
        return obj.AgentID == theAgentId
    });
    if (agentObj != undefined) {
        return agentObj.AgentName;
    } else {
        return theAgentId;
    }
}

function resize(initial) {
    var body = document.body,
        html = document.documentElement;
    var newHeight = Math.ceil(Math.max(body.scrollHeight, body.offsetHeight,
        html.offsetHeight)) || 500;
    if (initial) {
        newHeight += 3;
    } else {
        newHeight += 1;
    }
    var frameId = window.frameElement.getAttribute('id');
    var inputFrame = frameId != undefined ? parent.document.getElementById(frameId) : parent.document.getElementById("input-form-" + connId)
    inputFrame.height = newHeight + 'px';
    if (parent.resize) {
        parent.resize();
    }
}

function setLanguage() {
    $('.l-form-address').text(langJson['l-form-address']);
    $('.l-form-agree-to-disclose-information').get(0).nextSibling.data = langJson['l-form-agree-to-disclose-information'];
    $('.l-form-are-you-sure').text(langJson['l-form-are-you-sure']);
    $('.l-form-call').get(0).nextSibling.data = langJson['l-form-call'];
    $('.l-form-customer-information').text(langJson['l-form-customer-information']);
    $('.l-form-case-details').text(langJson['l-form-case-details']);
    $('.l-form-confirm').text(langJson['l-form-confirm']);
    $('.l-form-customer-id').text(langJson['l-form-customer-id']);
    $('.l-form-details').text(langJson['l-form-details']);
    $('.l-form-dial').text(langJson['l-form-dial']);
    $('.l-form-edit').text(langJson['l-form-edit']);
    $('.l-form-email').text(langJson['l-form-email']);
    $('.l-form-escalated-to').text(langJson['l-form-escalated-to']);
    $('.l-form-fax').text(langJson['l-form-fax']);
    $('.l-form-full-name').text(langJson['l-form-full-name']);
    $('.l-form-handled-by').text(langJson['l-form-handled-by']);
    $('.l-form-language').text(langJson['l-form-language']);
    // $('.l-form-long-call-duration').get(0).nextSibling.data = langJson['l-form-long-call-duration'];
    $('.l-form-market').text(langJson['l-form-market']);
    // $('.l-form-scheduled-reminder').text(langJson['l-form-scheduled-reminder']);
    $('.l-form-scheduled-reminder').attr('title', langJson['l-form-scheduled-reminder']);
    $('.l-form-title').text(langJson['l-form-title']);
    $('.l-form-mobile').text(langJson['l-form-mobile']);
    $('.l-form-nationality').text(langJson['l-form-nationality']);
    $('.l-form-nature').text(langJson['l-form-nature']);
    $('.l-form-none').get(0).nextSibling.data = langJson['l-form-none'];
    $('.l-form-other').text(langJson['l-form-other']);
    $('.l-form-profile').text(langJson['l-form-profile']);
    $('.l-form-print').attr('title', langJson['l-form-print']);
    $('.l-form-radio-email').get(0).nextSibling.data = langJson['l-form-radio-email'];
    $('.l-form-radio-fax').get(0).nextSibling.data = langJson['l-form-radio-fax'];
    $('.l-search-change-customer-for-this-case').text(langJson['l-search-change-customer-for-this-case']);
    var radioOtherArr = $('.l-form-radio-other');
    for (let radioOther of radioOtherArr) {
        radioOther.nextSibling.data = langJson['l-form-radio-other'];
    }

    $('.l-form-remarks').text(langJson['l-form-remarks']);
    $('.l-form-reply').text(langJson['l-form-reply']);
    $('.l-form-save').text(langJson['l-form-save']);
    $('.l-form-sms').get(0).nextSibling.data = langJson['l-form-sms'];
    $('.l-form-status').text(langJson['l-form-status']);
    $('.l-general-previous-page').attr('title', langJson['l-general-previous-page']);
    $('#customer-tbl-customer-id').removeClass('d-none');
    $('.l-general-upload').attr('title', langJson['l-general-upload']);
}

function callUploadAttachment(fileData, uniqueId, loadingId, downloadId, lastAttachment, uploadType) { // "emailFile", "faxFile"
    $.ajax({
        type: "POST",
        url: config.wiseUrl + '/api/Outbound/UploadAttachment',
        data: fileData,
        contentType: false, // Not to set any content header  
        processData: false, // Not to process data  
        dataType: 'multipart/form-data'
    }).always(function (r) {
        var response = JSON.parse(r.responseText)
        if (!/^success$/i.test(response.result || "")) {
            var details = response.details;
            console.log("Error in UploadAttachment." + details ? details : '');
            alert('Failed to upload file');
            $('#' + loadingId).remove();
            // delete the attachment container
            $('#' + uniqueId).remove();
        } else {
            var responseData = response.data[0];
            var theFile = $('#' + downloadId);
            // Remove loading logo
            $('#' + loadingId).remove();
            // Add "X" delete logo
            var deleteId = "delete-" + uniqueId;
            $('#' + uniqueId).append('<span id=' + deleteId + ' style="margin-left:5px;">X</span>');

            $('#' + deleteId).click(function (e) {
                if (uploadType == 'emailFile') {
                    for (var j = 0; j < emailFileList.length; j++) {
                        if (emailFileList[j].FileName == responseData.FileName) {
                            emailFileList.splice(j, 1);
                            break;
                        }
                    }
                } else if (uploadType == 'faxFile') {
                    for (var j = 0; j < faxFileList.length; j++) {
                        if (faxFileList[j].FileName == responseData.FileName) {
                            faxFileList.splice(j, 1);
                            break;
                        }
                    }
                }
                $('#' + uniqueId).remove();
            });

            // Add download link and its style
            theFile.attr("style", "text-decoration: underline;cursor:pointer;color:blue");
            if (uploadType == 'emailFile') {
                emailFileList.push(responseData);
            } else if (uploadType == 'faxFile') {
                faxFileList.push(responseData);
            }
            theFile.attr("href", responseData.FileUrl);
            theFile.attr("target", "_blank");
        }
        if (lastAttachment) {
            // Clear attachment
            var fileInput = $("#upload-" + uploadType)
            fileInput.replaceWith(fileInput.val('').clone(true));
        }
        outstandingAttachment = outstandingAttachment - 1;
    });
}
// When selected file for attachment
function uploadAttachment(input, uploadType) { // "emailFile", "faxFile"
    var limitedSizeMB = 20; // default limit 20MB
    var inputFiles = input.files;
    var inputFilesLength = inputFiles.length;
    outstandingAttachment = inputFilesLength;
    for (var i = 0; i < inputFilesLength; i++) {
        var attachment = inputFiles[i];
        // Verify file type: tested fax can send out without file or with 1 or more Microsoft word, excel, ppt or txt or pdf file
        if (uploadType == "faxFile" && attachment.type != 'application/msword' && attachment.type != 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && attachment.type != 'application/pdf' && attachment.type != 'text/plain' && attachment.type != 'application/vnd.ms-powerpoint' && attachment.type != 'application/vnd.openxmlformats-officedocument.presentationml.presentation' && attachment.type != 'application/vnd.ms-excel' && attachment.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            alert(langJson['l-alert-fax-file-not-valid']);
            continue; // Breaks one iteration in the loop
        }
        // verify file size
        if (attachment.size / 1024 / 1024 > limitedSizeMB) {
            alert(langJson['l-alert-fax-file-not-valid'] + attachment.name + langJson['l-alert-exceed'] + limitedSizeMB + 'MB');
            continue; // Breaks one iteration in the loop
        }
        var attachmentName = attachment.name;
        // Make a unique id
        var uniqueId = attachmentName.replace(/[^a-zA-Z]+/g, '');
        uniqueId += new Date().getUTCMilliseconds();
        var loadingId = 'loading-' + uniqueId;
        var downloadId = 'download-' + uniqueId;

        $("#" + uploadType + "-attachment").append('<span class="email-attach-tag" id="' + uniqueId + '"><a id="' + downloadId + '" href="javascript:none;">' + attachmentName + '</a></span>');
        $("#" + uniqueId).append('<span id="' + loadingId + '"><div id="circularG"><div id="circularG_1" class="circularG"></div><div id="circularG_2" class="circularG"></div><div id="circularG_3" class="circularG"></div>' +
            '<div id="circularG_4" class="circularG"></div><div id="circularG_5" class="circularG"></div><div id="circularG_6" class="circularG"></div><div id="circularG_7" class="circularG"></div><div id="circularG_8" class="circularG"></div></div><span>');
        var fileData = new FormData();
        fileData.append("files", attachment);
        fileData.append('agentId', loginId);
        fileData.append('caseNo', internalCaseNo); // For Create New Case no case no yet, so provide internal case no
        callUploadAttachment(fileData, uniqueId, loadingId, downloadId, (i == inputFilesLength - 1), uploadType);
        resize();
    }
}
// When selected photo for profile photo
function previewPhoto(input) {
    var photoFile = input.files[0];
    if (input.files && photoFile) {
        // Verify file type
        if (photoFile.type != 'image/jpeg' && photoFile.type != 'image/gif' && photoFile.type != 'image/png') {
            alert(langJson['l-alert-fax-file-not-valid']);
            // Clear file
            var fileInput = $("#file-to-upload")
            fileInput.replaceWith(fileInput.val('').clone(true));
            // Reset picture to original
            var photo = document.getElementById('profile-pic');
            photo.src = photoSrc;
            return;
        }
        // verify file size
        var limitedSizeMB = sessionStorage.getItem('scrmPhotoSize') ? sessionStorage.getItem('scrmPhotoSize') : 2; // default limit 2MB
        if (photoFile.size / 1024 / 1024 > limitedSizeMB) {
            alert(langJson['l-alert-photo-size-cannot-exceed'] + limitedSizeMB + 'MB');
            // Clear file
            var fileInput = $("#file-to-upload");
            fileInput.replaceWith(fileInput.val('').clone(true));
            // Reset picture to original
            var photo = document.getElementById('profile-pic');
            photo.src = photoSrc;
            return;
        }
        // set profile picture
        var reader = new FileReader();
        reader.onload = function (e) {
            // upload photo
            // var fileUpload = $("#file-to-upload").get(0);  //20250416 Remove the declaration of the unused 'fileUploadFiles' variable.
          //var fileUploadFiles = fileUpload.files;         //20250416 Remove the declaration of the unused 'fileUploadFiles' variable.
            var fileData = new FormData();
            fileData.append("Photo_File", photoFile);
            fileData.append('Customer_Id', customerId);
            fileData.append('Agent_Id', loginId);
            fileData.append('Token', token);
            $.ajax({
                url: config.companyUrl + '/api/UploadPhoto',
                type: "POST",
                contentType: false, // Not to set any content header  
                processData: false, // Not to process data  
                data: fileData,
                dataType: 'multipart/form-data'
            }).always(function (r) {
                var response = JSON.parse(r.responseText);
                if (!/^success$/i.test(response.result || "")) {
                    console.log(r);
                } else {
                    // Change input form icon
                    $('#profile-pic').attr('src', e.target.result);
                }
            });
        }
        reader.readAsDataURL(photoFile);
    }
}

function changeCustomerClicked() {
    changeContactCaseNo = caseNo;
    changeContactCustomerId = customerId;
    setTimeout(function(){
        var openWindows = parent.parent.openWindows || parent.parent.parent.openWindows
        if (openWindows) {
            openWindows[openWindows.length] = window.open('../../menu/changeContactPop.html?open=input', 'Change Contact', '_blank, toolbar=0,location=0,top=50, left=50,menubar=0,resizable=0,scrollbars=1,width=903,height=740');
            return false;
        }
    }, 500);
}

function changedCustomer(newCustomerId) {
    customerId = newCustomerId;
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/ManualSearch',
        data: JSON.stringify({
            "anyAll": "all",
            Agent_Id: loginId,
            Token: token,
            "Is_Valid": "Y",
            "searchArr": [{
                "field_name": "Customer_Id",
                "logic_operator": "is",
                "value": Number(newCustomerId),
                "field_type": null
            }]
        }),
        crossDomain: true,
        contentType: "application/json",
    }).always(function (r) {
        var rDetails = r.details || '';
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + rDetails ? rDetails : r);
        } else {
            // originalCustomerData = rDetails[0];
            var newCaseObj = rDetails[0];
            
            if (customerData) {
                newCaseObj.inheritAll = customerData.inheritAll;
            } else {
                updateCaseObj.Customer_Id = newCaseObj.Customer_Id;
                newCaseObj.inheritAll = false;
            }
            customerData = newCaseObj;
            setCustomerInfo(true);
        }
    });
}

function setCustomerInfo(isChangedCustomer) {
    // var customerData = $.isEmptyObject(originalCustomerData) == true ? null : originalCustomerData;
    // isManualUpdate = customerData != undefined && customerData.Case_Is_Valid == 'Y' && customerData.Conn_Id == connId ? true : false;
    // updateCaseObj.Conn_Id = isManualUpdate == true ? -1 : connId; //Conn Id cannot be null
    // caseLogLength = sessionStorage.getItem('scrmCaseLogLength') != 'NaN' || sessionStorage.getItem('scrmCaseLogLength') != null ? Number(sessionStorage.getItem('scrmCaseLogLength')) : 10 || 10;
    // document.getElementById('ip-agent-name').innerHTML = agentName;
	// var inheritAll = customerData && customerData.inheritAll ? customerData.inheritAll : false;	//20250516 Prefer using an optional chain expression instead, as it's more concise and easier to read.
	var inheritAll = customerData?.inheritAll ?? false;

    document.getElementById('customer-id-title').innerHTML = customerId;
    // Set customer info
    var Mobile_No = '';
    var Other_Phone_No = '';
    var Fax_No = '';
    var Email = '';
    var Name_Eng = '';
    var Title = '';
    var Lang = '';
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
        // Get specific data
        Name_Eng = customerData.Name_Eng || '';
        Title = customerData.Title || '';
        Lang = customerData.Lang || '';
        Mobile_No = customerData.Mobile_No || '';
        Other_Phone_No = customerData.Other_Phone_No || '';
        Fax_No = customerData.Fax_No || '';
        Email = customerData.Email || '';
        // Update basic field
        document.getElementById('Title').value = Title;
        document.getElementById('Lang').value = Lang; // customerData.Lang || ''; 20250424 Remove this useless assignment to variable "Lang".
        document.getElementById('Name_Eng').value = Name_Eng;
        document.getElementById('Address1').value = customerData.Address1 || '';
        if (customerData.Agree_To_Disclose_Info == 'Y') {
            $('#Agree_To_Disclose_Info').prop('checked', true);
        }
        // Get Photo
        $.ajax({
            url: config.companyUrl + '/api/GetPhoto',
            type: "POST",
            data: JSON.stringify({
                "Customer_Id": customerId,
                Agent_Id: loginId,
                Token: token
            }),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json',
            success: function (res) {
                var details = res.details;
                if (!/^success$/i.test(res.result || "")) {
                    // when customer have no photo will have this error, too common, so no need to write console
                    if (details != '值不能為 null。\r\n參數名稱: inArray') {
                        console.log("Error in GetPhoto");
                        console.log(res);
                    }
                } else {
                    var photo = document.getElementById('profile-pic');
                    var photoSrcString = "data:" + details.Photo_Type + ";base64," + details.Photo_Content;
                    photo.src = photoSrcString;
                    photoSrc = photoSrcString; // if uploaded a wrong photo need this to resotore to the original
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
    var _Mobile_No = document.getElementById('Mobile_No');
    var _Other_Phone_No = document.getElementById('Other_Phone_No');
    var _Fax_No = document.getElementById('Fax_No');
    var _Email = document.getElementById('Email');
    // a tag fields
    /* 20250416 Remove the declaration of the unused variable.
    var tMobile = document.getElementById('tMobile_No')
    var tOther_Phone_No = document.getElementById('tOther_Phone_No');
    var tFax_No = document.getElementById('tFax_No');
    var tEmail = document.getElementById('tEmail'); */
    // Update editable text field
    _Mobile_No.value = Mobile_No;
    _Other_Phone_No.value = Other_Phone_No;
    _Fax_No.value = Fax_No;
    _Email.value = Email;

    var mobileStyle = 'none';
    var otherStyle = 'none';
    var faxStyle = 'none';
    var emailStyle = 'none';
    var newMobile = Mobile_No;
    if (Mobile_No != null && Mobile_No.length > 0) {
        mobileStyle = 'inline-block';
    } else {
        newMobile = ' ';
    }

    $('<span style="display:' + mobileStyle + ';" name="sms" class="cMobile_No" id="reply-sms-mobile-container"><div class="form-check me-2"><label class="form-check-label"><input type="checkbox" class="form-check-input reply-checkbox sms-list dial-yes-disable" value="' + Mobile_No + '" id="oSmsMobile_No">' + newMobile + '<span class="form-check-sign"><span class="check"></span></span></label></div></span>').insertBefore('#sms-other-container');
    $('<span style="display:' + mobileStyle + ';" name="call" class="cMobile_No" id="reply-call-mobile-container"><div class="form-check ms-2"><label class="form-check-label"><input type="radio" name="callList" class="form-check-input reply-checkbox call-list dial-yes-disable" onchange="replyCallChanged(this)" value="' + Mobile_No + '" id="oCallMobile_No">' + newMobile + '<span class="circle"><span class="check"></span></span></label></div></span>').insertBefore('#call-other-container');

    var newOther = Other_Phone_No;
    if (Other_Phone_No != null && Other_Phone_No.length > 0) {
        otherStyle = 'inline-block';
    } else {
        newOther = ' ';
    }
    $('<span style="display:' + otherStyle + ';" name="sms" class="cOther_Phone_No" id="reply-sms-other-container"><div class="form-check"><label class="form-check-label"><input type="checkbox" class="form-check-input reply-checkbox sms-list dial-yes-disable" value="' + Other_Phone_No + '" id="oSmsOther_Phone_No">' + newOther + '<span class="form-check-sign"><span class="check"></span></span></label></div></span>').insertBefore('#sms-other-container');
    $('<span style="display:' + otherStyle + ';" name="call" class="cOther_Phone_No" id="reply-call-other-container"><div class="form-check ms-2"><label class="form-check-label"><input type="radio" name="callList" class="form-check-input reply-checkbox call-list dial-yes-disable" onchange="replyCallChanged(this)" value="' + Other_Phone_No + '" id="oCallOther_Phone_No">' + newOther + '<span class="circle"><span class="check"></span></span></label></div></span>').insertBefore('#call-other-container');
    var newFax = Fax_No;
    if (Fax_No != null && Fax_No.length > 0) {
        faxStyle = 'inline-block';
    } else {
        newFax = ' ';
    }
    $('<span style="display:' + faxStyle + ';" name="fax" class="cFax_No" id="reply-fax-container"><div class="form-check"><label class="form-check-label"><input type="checkbox" class="form-check-input reply-checkbox fax-list dial-yes-disable" value="' + Fax_No + '" id="oFax_No">' + newFax + '<span class="form-check-sign"><span class="check"></span></span></label></div></span>').insertBefore('#fax-other-container');
    var newEmail = Email;
    if (Email != null && Email.length > 0) {
        emailStyle = 'inline-block';
    } else {
        newEmail = ' ';
    }
    $('<span style="display:' + emailStyle + ';" name="email" id="reply-email-container"><div class="form-check"><label class="form-check-label"><input id="oEmail" class="form-check-input reply-checkbox email-list dial-yes-disable" type="checkbox" value="' + Email + '">' + newEmail + '<span class="form-check-sign"><span class="check"></span></span></label></div></span>').insertBefore('#email-other-container');


    // ================ GET NATIONALITY, MARKET AND PROFILE ================
    if (nationalityArr.length == 0 || marketArr.length == 0 || profileArr.length == 0 || sessionStorage.getItem('scrmProfileArr').length < 8) {
        //var language = sessionStorage.getItem('scrmLanguage') ? sessionStorage.getItem('scrmLanguage').toLowerCase() : 'EN';
		var language = sessionStorage.getItem('scrmLanguage') != null? sessionStorage.getItem('scrmLanguage').toLowerCase() : 'EN';
		
        $.ajax({
            type: "POST",
            url: config.companyUrl + '/api/GetNationalityMarketProfile',
            crossDomain: true,
            contentType: "application/json",
            data: JSON.stringify({
                Lang: language,
                Agent_Id: loginId,
                Token: token
            }),
            dataType: 'json'
        }).always(function (r) {
            var rDetails = r.details || '';
            if (!/^success$/i.test(r.result || "")) {
                console.log('error: ' + rDetails ? rDetails : r);
            } else {
                nationalityArr = rDetails.NationalityArray;
                marketArr = rDetails.MarketArray;
                profileArr = rDetails.ProfileArray;
                sessionStorage.setItem('scrmNationalityArr', JSON.stringify(nationalityArr));
                sessionStorage.setItem('scrmMarketArr', JSON.stringify(marketArr));
                sessionStorage.setItem('scrmProfileArr', JSON.stringify(profileArr));
                addAreaOptions(customerData);
            }
        });
    } else {
        addAreaOptions(customerData);
    }

    // System tools add section
    if (openType == 'traditional' && haveSystemTools) {
        var parentDoc = parent.document;
        if (callType == 'Inbound_Email') {
            if ($('#repeated-customer-header', window.parent.document).css('display') == 'inline') {
                var repeatedCustomer = $('#repeated-customer');
                repeatedCustomer.prop('checked', true);
                var theRemark = parentDoc.getElementById('repeated-customer-header').title || '';
                $('#repeated-customer-remarks').val(theRemark); //.prop('disabled', true);
                updatedCustomerData["Repeated_Customer_Remarks"] = theRemark;
            }
            if ($('#difficult-customer-header', window.parent.document).css('display') == 'inline') {
                var difficultCustomer = $('#difficult-customer')
                difficultCustomer.prop('checked', true);
                var theRemark = parentDoc.getElementById('difficult-customer-header').title || '';
                $('#difficult-customer-remarks').val(theRemark);
                updatedCustomerData["Difficult_Customer_Remarks"] = theRemark;
            }
        } else if (callType == 'Inbound_Call' || callType == 'Inbound_Fax' || callType == 'Inbound_Voicemail') {
            if ($('#repeated-caller-header', window.parent.document).css('display') == 'inline') {
                var repeatedCaller = $('#repeated-caller');
                repeatedCaller.prop('checked', true);
                var theRemark = parentDoc.getElementById('repeated-caller-header').getAttribute('data-original-title') || '';
                $('#repeated-caller-remarks').val(theRemark); //.prop('disabled', true);
                updatedCustomerData["Repeated_Caller_Remarks"] = theRemark;
            }
            if ($('#difficult-caller-header', window.parent.document).css('display') == 'inline') {
                var difficultCaller = $('#difficult-caller')
                difficultCaller.prop('checked', true);
                var theRemark = parentDoc.getElementById('difficult-caller-header').getAttribute('data-original-title') || '';
                $('#difficult-caller-remarks').val(theRemark); //.prop('disabled', true);
                updatedCustomerData["Difficult_Caller_Remarks"] = theRemark;
            }
        }
    }


    if (isChangedCustomer) {    // 20250407 if (isChangedCustomer == true) { Refactor the code to avoid using this boolean literal.
        return;
    }
    // ==================== TYPE: NEW FOLLOW ====================
    var escalatedTo = customerData != null ? customerData.Escalated_To : null;
    if (type == 'newUpdate' && escalatedTo != null && escalatedTo != loginId) {
        outsider = true; // default outsider is false
    } else {
        $("#case-status").append('<option class="to-be-removed" value="Closed">Closed</option><option class="to-be-removed" value="Escalated">Escalated</option>');
    }
    if (type == 'newUpdate') {
        // Fill in case details
        if (customerData != undefined) {
            document.getElementById('case-nature').value = customerData.Call_Nature || '';
        }
        $("#reply-none").prop("checked", true).trigger("click");
    //} else {  20250410 'If' statement should not be the only statement in 'else' block
    } else if (type == 'newCustomer') {
            if (callType == 'Inbound_Email') {
                _Email.value = details;
            } else if (callType == 'Inbound_Fax') {
                _Fax_No.value = details;
            } else if (callType == 'Inbound_Call' || callType == 'Inbound_Voicemail') {
                var firstChar = details.charAt(0);
                if (firstChar == 5 || firstChar == 6 || firstChar == 7 || firstChar == 8 || firstChar == 9) {
                    _Mobile_No.value = details;
                } else {
                    _Other_Phone_No.value = details;
                }
            } else if (callType == 'Inbound_Webchat') {
                var detailsArr = details.split(',');
                if (details.length > 0) {
                    $.ajax({
                        type: "POST",
                        url: config.companyUrl + '/api/GetFields',
                        data: JSON.stringify({
                            "listArr": ["Webchat Fields"],
                            Agent_Id: loginId,
                            Token: token
                        }),
                        crossDomain: true,
                        contentType: "application/json",
                        dataType: 'json'
                    }).always(function (r) {
                        var rDetails = r.details;
                        if (!/^success$/i.test(r.result || "")) {
                            console.log('error: ' + rDetails);
                        //} else {  20250410 'If' statement should not be the only statement in 'else' block
                        } else if (rDetails != undefined) {
                                var webchatFields = rDetails['Webchat Fields'];
                                for (let theFieldStr of detailsArr) {
                                    var fieldNameValueArr = theFieldStr.split(':');
                                    var fieldName = fieldNameValueArr[0];
                                    var fieldValue = fieldNameValueArr[1] || '';
                                    if (fieldValue != null && fieldValue.length > 0) {
                                        for (let theField of webchatFields) {
                                            if (fieldName == theField.Field_Name) {
                                                var dbColumnName = theField.Field_Display;
                                                if (dbColumnName == 'Name_Eng') {
                                                    document.getElementById('Name_Eng').value = fieldValue;
                                                } else if (dbColumnName == 'All_Phone_No') {
                                                    var firstChar = fieldValue.charAt(0);
                                                    if (firstChar == 5 || firstChar == 6 || firstChar == 7 || firstChar == 8 || firstChar == 9) {
                                                        _Mobile_No.value = fieldValue;
                                                    } else {
                                                        _Other_Phone_No.value = fieldValue;
                                                    }
                                                } else if (dbColumnName == 'Email') {
                                                    _Email.value = fieldValue;
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            //}// 20250410 for else if 
                        }
                    });
                }
                //  else {

                //     // by logic now if have details will not has qr code, vice versa
                //     var isQrCode = window.frameElement.getAttribute("qrcode") || '';
                //     if (isQrCode && isQrCode == 'true') {
                //         document.getElementById('Name_Eng').value = 'QRCode_' + ticketId;
                //     }
                // }

                // if scan by qr code and new customer the name will change
                if (type == 'newCustomer') {

                    $('#Name_Eng').val('QRCode_' + ticketId);

                    // open From Incomplete Cases
                    var theLang = '';
                    if (isSocial) {
                        theLang = window.frameElement.getAttribute("lang") || '';
                    } else {
                        var indexOfLang = details.indexOf('Language:');
                        if (indexOfLang > -1) {
                            var indexOfNextComma = details.indexOf(',', indexOfLang);
                            if (indexOfNextComma == -1) {

                                // 5 is the length of 'Language:'
                                theLang = details.slice(indexOfLang + 9) || '';
                            } else {
                                theLang = details.slice((indexOfLang + 9), indexOfNextComma) || '';
                            }
                        }

                    }

                    if (theLang.length > 0) {

                        // if has that language select it
                        if (theLang == 'English') {
                            $('#Lang').val('English');
                        } else if (theLang == '繁體中文') {
                            $('#Lang').val('Cantonese');
                        } else if (theLang == '简体中文') {
                            $('#Lang').val('Mandarin');
                        } else if (theLang == '日文') {
                            $('#Lang').val('Japanese');
                        } else if (theLang == '韩文') {
                            $('#Lang').val('Others');
                        }
                    }
                }
            }
        //}// 20250410 for else if 
    }

    // load Escalate To dropdown
    for (let option of agentList) {
        var theAgentId = option.AgentID;
        $("#case-escalated").append('<option LevelID=' + option.LevelID + ' value=' + theAgentId + '>' + option.AgentName + ' (ID: ' + theAgentId + ')</option>');
    }
    if (inheritAll) {
        document.getElementById('case-details').value = customerData.Details || '';
        if (outsider) {
            document.getElementById('case-status').value = 'Follow-up Required';
        //} else {  //20250410 'If' statement should not be the only statement in 'else' block
        } else if (escalatedTo != null) {
                document.getElementById('case-status').value = 'Escalated';
        } else {
                document.getElementById('case-status').value = customerData.Status || '';
          //  }// 20250410 for else if
        }
        //if (customerData != undefined && customerData.Escalated_To != null) {		//20250516 Prefer using an optional chain expression instead, as it's more concise and easier to read.
		if (customerData?.Escalated_To != null) {
            document.getElementById('case-escalated').value = customerData.Escalated_To;
            if (!outsider) {
                document.getElementById('case-escalated-container').style.display = 'inherit';
            }
        }
    }
    if (type == 'newUpdate') {
        loadCaseLog(true);
    }

    // if call from incomplete call cases and reply type is outbound call
    if (winReplyConnId.length > 0 && winReplyDetails.length > 0) {

        // set reply channel: call
        $("#reply-call").prop("checked", true).trigger("click");

        // Set update case obj
        updateCaseObj.Reply_Type = 'Outbound_Call';
        updateCaseObj.Reply_Conn_Id = String(winReplyConnId);
        updateCaseObj.Reply_Details = winReplyDetails;

        // set phone number
        if (winReplyDetails == Mobile_No) {
            $("#oCallMobile_No").prop("checked", true).trigger("click");
        } else if (winReplyDetails == Other_Phone_No) {
            $("#oCallOther_Phone_No").prop("checked", true).trigger("click");
        } else {
            $("#call-other-check").prop("checked", true).trigger("click");
            $("#call-other-input").attr("value", winReplyDetails);
        }
        dialYesClicked(true);
    } else {
        $("#reply-none").prop("checked", true).trigger("click");
    }

    var customerOnlyAttr = window.frameElement.getAttribute("customer-only");
    if (customerOnlyAttr != undefined && customerOnlyAttr == 'true') {
        customerOnly = true;
        showCustomerSectionOnly();
    }
    resize(true);
}

function exportCustDoc() {
    var pageStyle = '<style>v\:* {behavior:url(#default#VML);}o\:* {behavior:url(#default#VML);}w\:* {behavior:url(#default#VML);}.shape {behavior:url(#default#VML);}</style><style>@page{ mso-page-orientation: portrait; size:21cm 29.7cm; margin:2cm 1.26cm 1cm 2cm;}@page Section1 { mso-header-margin:.5in; mso-footer-margin:.5in; mso-header: h1; mso-footer: f1; }div.Section1 { page:Section1; }</style>'
    var xmlMakeup = '<xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml>'; // To allow shown by full page
    var preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title>" + pageStyle + xmlMakeup + "</head><body>";
    var postHtml = "</body></html>";
    var title = $('#Title').val() || '';
    var name = $('#Name_Eng').val() || '';
    var language = $('#Lang').val() || '';
    var countryVal = $('#Nationality_Id').val() || 0;
    var countryTxt = $('#Nationality_Id option[value="' + countryVal + '"]').text() || '';
    var marketVal = $('#Market_Id').val() || 0;
    var marketTxt = $('#Market_Id option[value="' + marketVal + '"]').text() || '';
    var profileVal = $('#Profile_Id').val() || 0;
    var profileTxt = $('#Profile_Id option[value="' + profileVal + '"]').text() || '';
    var mobile = $('#Mobile_No').val() || '';
    var otherNo = $('#Other_Phone_No').val() || '';
    var fax = $('#Fax_No').val() || '';
    var email1 = ($('#Email').val() || '').trim();
    var address = gf.escape($('#Address1').val() || '');
    var discloseYes = $('#Agree_To_Disclose_Info').prop('checked') ? 'Yes' : 'No';
    var agentName = $('#ip-agent-name').text() || '';
     var nature = $('#case-nature').val() || '';
    var status = $('#case-status').val() || '';
    var caseDetails = ($('#case-details').val() || '').replace(/(?:\r\n|\r|\n)/g, '<br>'); // To allow next line in MS Doc
    var isLongCall = $('#Long_Call').prop('checked') ? 'Yes' : 'No';
    if (isLongCall == 'Yes') {
        isLongCall += ('&nbsp;&nbsp;&nbsp;&nbsp;Reason:&nbsp;' + $('#Long_Call_Reason').val());
		console.log(isLongCall);	//20250424 Remove this useless assignment to variable "isLongCall".
    }
    // var content = '<div class="Section1"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif">Customer ID: <span style="font-size:11.0pt"><span>' + customerId + '</span></span></span></span></p>' +
    //     '<table cellspacing="0" class="Table" style="border-collapse:collapse; border:none;><tbody>' +

        var content = 
        '<table class="Table" style="border-collapse:collapse;"><tbody>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Customer ID: </span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + customerId + '</span></span></span></span></p></td></tr>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p>&nbsp;</p></td><td style="vertical-align:top;"><p>&nbsp;</p></td></tr>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Name: </span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + name + '</span></span></span></span></p></td></tr>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Title: </span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + title + '</span></span></span></span></p></td></tr>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Language: </span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + language + '</span></span></span></span></p></td></tr>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Nationality:</span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + countryTxt + '</span></span></span></span></p></td></tr>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Market:</span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + marketTxt + '</span></span></span></span></p></td></tr>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Profile:</span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + profileTxt + '</span></span></span></span></p></td></tr>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Mobile No.</span><span style="font-size:11.0pt">:</span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + mobile + '</span></span></span></span></p></td></tr>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Other Contact No.:</span></span></span></p></td><td style="vertical-align:top;><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + otherNo + '</span></span></span></span></p></td></tr>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Fax No.:</span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + fax + '</span></span></span></span></p></td></tr>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">E-mail:</span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + email1 + '</span></span></span></span></p></td></tr>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Address:</span></span></span></p></td><td style="border: solid windowtext 1.0pt;mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt;mso-bidi-font-size:11.0pt;mso-fareast-language: ZH-HK;font-family: &quot;Times New Roman&quot;,&quot;serif&quot;;font-size: 11.0pt;vertical-align: top;max-height: fit-content;width:75%;word-break:break-all">' + address + '</td></tr>' +

        '<tr style="padding-top:3pt;"><td style="vertical-align:top; white-space:nowrap;word-break:break-word;width:200px;display:inline-block;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Agree to Disclose Information</span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:Times New Roman,serif"><span style="font-size:11.0pt;">' + discloseYes + '</td></tr>' +

        '<tr><td style="vertical-align:top; white-space:nowrap;"><p>&nbsp;</p></td><td style="vertical-align:top;"><p>&nbsp;</p></td></tr>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p>&nbsp;</p></td><td style="vertical-align:top;"><p>&nbsp;</p></td></tr>' +
        // '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Handled By:</span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + agentName + '</span></span></span></span></p></td></tr>' +
        // '</tbody></table></div>' + 
        
        // '<div class="Section1"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif">Case No: <span style="font-size:11.0pt"><span>' + caseNo + '</span></span></span></span></p>' +
        // '<table cellspacing="0" class="Table" style="border-collapse:collapse; border:none;><tbody>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Case No: </span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + caseNo + '</span></span></span></span></p></td></tr>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p>&nbsp;</p></td><td style="vertical-align:top;"><p>&nbsp;</p></td></tr>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Nature: </span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + nature + '</span></span></span></span></p></td></tr>' +

        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Status: </span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + status + '</span></span></span></span></p></td></tr>' +

        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Details:</span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + caseDetails + '</span></span></span></span></p></td></tr>' +
        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Handled By:</span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + agentName + '</span></span></span></span></p></td></tr>' +
        '</tbody></table></div>';
    var html = preHtml + content + postHtml;

    var blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });

    // Specify link url
    var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);

    // Specify file name
    var d = new Date();
    var date = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var fullDate = year + '-' + month + '-' + date;
    var filename = 'CUST-' + customerId + '_' + fullDate + '.doc'

    // Create download link element
    var downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        // Create a link to the file
        downloadLink.href = url;

        // Setting the file name
        downloadLink.download = filename;

        // Triggering the function
        downloadLink.click();
    }

    document.body.removeChild(downloadLink);
}

function exportCaseDoc() {
    var pageStyle = '<style>v\:* {behavior:url(#default#VML);}o\:* {behavior:url(#default#VML);}w\:* {behavior:url(#default#VML);}.shape {behavior:url(#default#VML);}</style><style>@page{ mso-page-orientation: portrait; size:21cm 29.7cm; margin:2cm 1.26cm 1cm 2cm;}@page Section1 { mso-header-margin:.5in; mso-footer-margin:.5in; mso-header: h1; mso-footer: f1; }div.Section1 { page:Section1; }</style>'
    var xmlMakeup = '<xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml>'; // To allow shown by full page
    var preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title>" + pageStyle + xmlMakeup + "</head><body>";
    var postHtml = "</body></html>";
    var nature = $('#case-nature').val() || '';
    var status = $('#case-status').val() || '';
    var caseDetails = ($('#case-details').val() || '').replace(/(?:\r\n|\r|\n)/g, '<br>'); // To allow next line in MS Doc
    var isLongCall = $('#Long_Call').prop('checked') ? 'Yes' : 'No';
    if (isLongCall == 'Yes') {
        isLongCall += ('&nbsp;&nbsp;&nbsp;&nbsp;Reason:&nbsp;' + $('#Long_Call_Reason').val());
		console.log(isLongCall);	//20250424 Remove this useless assignment to variable "isLongCall".
    }
    var agentName = $('#ip-agent-name').text() || '';
    var content = '<div class="Section1"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif">Case No: <span style="font-size:11.0pt"><span>' + caseNo + '</span></span></span></span></p>' +
        '<table class="Table" style="border-collapse:collapse; border:none;"><tbody>' +

        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Nature: </span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + nature + '</span></span></span></span></p></td></tr>' +

        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Status: </span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + status + '</span></span></span></span></p></td></tr>' +

        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Details:</span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + caseDetails + '</span></span></span></span></p></td></tr>' + '<tr><td style="vertical-align:top; white-space:nowrap;"><p>&nbsp;</p></td><td style="vertical-align:top;"><p>&nbsp;</p></td></tr>' +

        '<tr><td style="vertical-align:top; white-space:nowrap;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt">Handled By:</span></span></span></p></td><td style="vertical-align:top;"><p><span style="font-size:12pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="font-size:11.0pt"><span>' + agentName + '</span></span></span></span></p></td></tr>' +
        '</tbody></table></div>';
    var html = preHtml + content + postHtml;

    var blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });

    // Specify link url
    var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);

    // Specify file name
    var d = new Date();
    var date = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var fullDate = year + '-' + month + '-' + date;
    var filename = 'CASE-' + caseNo + '_' + fullDate + '.doc'

    // Create download link element
    var downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        // Create a link to the file
        downloadLink.href = url;

        // Setting the file name
        downloadLink.download = filename;

        //triggering the function
        downloadLink.click();
    }

    document.body.removeChild(downloadLink);
}

function restorePage() {
    // Restore veriable
    isManualUpdate = true;
    replyConfirmed = false; // Reply is not confirmed or dialed out
    window.onbeforeunload = undefined;
    updateCaseObj = {};
    updateCaseObj.Conn_Id = -1; // AddCustomerCase have to input a int Conn_Id, so cannot be null
    $("#reply-none").prop("checked", true).trigger("click");
    $(".reply-wa-container").remove();
    $('#reply-submit-btn').hide();
    $('#call-result-container').remove();
    dialNoClicked();
    $('#case-details').val('');
    $("#email-other-input").val('').prop('disabled', true);
    $("#fax-other-input").val('').prop('disabled', true);
    $("#sms-other-input").val('').prop('disabled', true);
    $("#call-other-input").val('').prop('disabled', true);
    $('.l-form-radio-other').prop("checked", false); // Reply's other uncheck
    $('input.reply-checkbox:checked').prop('checked', false);
    ivrInfo = '';
    if (isSocial) {
        // this scrollTop is for demo only
        parent.document.documentElement.scrollTop = 735;
    } else {
        parent.document.documentElement.scrollTop = 0;
    }
}

//20250116 for record the call type details when use new wa Template
var waTargetNumber = "";

function saveClicked(isTemp, callback) { // 1. declare 2. verify 3. update customer(if needed) 4. send reply(if needed) 5. update case 6. save call history
    event.preventDefault(); // if no this the line, return can be useless continue to proceed
    $('#case-save-btn').prop('disabled', true);
    // ========================== 1/6 Declare variable ==========================
    var caseNature = document.getElementById('case-nature').value || '';
    var caseDetails = document.getElementById('case-details').value || '';
    var caseStatus = document.getElementById('case-status').value || '';
    var caseEscalatedId = null;
    var caseEscalated = document.getElementById('case-escalated').value || null;
    if (caseEscalated != null && caseEscalated.length > 0) {
        caseEscalatedId = Number(caseEscalated);
    }
    // NO DEL var longCallDuration = $('#Long_Call').prop('checked') ? "Y" : "N"; // not sure will this field be added back
    // NO DEL var longCallReason = $('#Long_Call_Reason').val(); // not sure will this field be added back
    var isJunkMail = $('#Is_Junk_Mail').prop('checked') ? "Y" : "N";
    var replyList = document.querySelector('input[name="replyList"]:checked')
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
        //} else {  //20250410 'If' statement should not be the only statement in 'else' block
        } else if (replyDetails.length == 0) {
                replyDetails = $('#' + replyChannel + '-other-input')[0].value;
        } else {
                replyDetails += (',' + $('#' + replyChannel + '-other-input')[0].value);
            //}// 20250410 for else if
        }
    }
    // ========================== 2/6 Verify ==========================
    // Verify all attachemnt uploaded
    if (!isTemp) {
        if (outstandingAttachment > 0) {
            document.getElementById("case-save-btn").disabled = false;
            alert(langJson['l-alert-attachment-outstanding']);
            return;
        }
        // Verify nature which cannot be blank
        if (caseNature.length == 0) {
            document.getElementById("case-save-btn").disabled = false;
            alert(langJson['l-alert-no-nature']);
            $('#case-nature').focus();
            return;
        }
        // Verify status which cannot be blank
        if (caseStatus.length == 0) {
            document.getElementById("case-save-btn").disabled = false;
            alert(langJson['l-alert-no-status']);
            $('#case-status').focus();
            return;
        }
        // Verify details which cannot be blank
        if (caseNature != 'Junk' && caseDetails.length == 0) {
            document.getElementById("case-save-btn").disabled = false;
            alert(langJson['l-alert-no-details']);
            return;
        }
        // Verify case status fieldi fif 
        if (caseStatus == 'Escalated') {
            if (caseEscalated.length == 0) {
                document.getElementById("case-save-btn").disabled = false;
                alert(langJson['l-alert-select-agent-escalate']);
                $('#case-escalated').focus();
                return;
            }
        }
        // NO DEL not sure will this field be added back
        // Verify have long call reason selected
        // if (longCallDuration == 'Y' && longCallReason == '') {
        //     alert(langJson['l-alert-select-long-call-reason']);
        //     return;
        // }
        // /NO DEL not sure will this field be added back
        // Verify is reply detil empty
        if (replyChannel != '') {
            if (replyDetails.length == 0) {
                document.getElementById("case-save-btn").disabled = false;
                alert(langJson['l-alert-reply-details-empty']);
                return;
            }
            // Verify clicked confirm or dial yes or not
            if (replyConfirmed === false) {
                if (replyChannel != 'call') {
                    document.getElementById("case-save-btn").disabled = false;
                    alert(langJson['l-alert-reply-not-confirmed']);
                    return;
                } else {
                    document.getElementById("case-save-btn").disabled = false;
                    alert(langJson['l-alert-not-clicked-dial']);
                    return;
                }
            //} else {  //20250410 'If' statement should not be the only statement in 'else' block
                // replyConfirmed here
                // Verify dialed out call, have it be given result
            } else if (replyChannel == 'call') {
                    var replyCallResult = $('#call-result-select')[0].value;
                    if (replyCallResult != undefined && replyCallResult.length == 0) {
                        document.getElementById("case-save-btn").disabled = false;
                        alert(langJson['l-alert-no-call-result']);
                        $('#call-result-select').focus();
                        return;
                    }
                //}// 20250410 for else if 
            }
        }
        // Verify if email related checked but wihtout email
        var customerEmail = $('#Email').val();
        var isEmailEmpty = customerEmail.length == 0;
        var emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        var isEmail = emailRegex.test(customerEmail);
        if (!isEmailEmpty && !isEmail) {
            document.getElementById("case-save-btn").disabled = false;
            alert(langJson['l-alert-email-invalid']);
            return;
        }
    }
    // ========================== 3/6 Update Customer (if needed) ==========================
    if (!isTemp && disableMode === false) {
        updateClicked();
    } else if (isSocial) {
        if (customerData) {
            if ((callType == 'Inbound_Wechat' && customerData.Wechat_Id == null) ||
                (callType == 'Inbound_Facebook' && customerData.Facebook_Id == null) ||
                (callType == 'Inbound_Whatsapp' && customerData.Whatsapp_Id == null)
            ) {
                disableMode = false;
                updateClicked();
            }
        }
    }
    // ========================== 4/6 Send Reply + 5/6  Update Case + 6/6 Save Call History ==========================  
    var replyType = ''
    if (replyChannel == 'email') {
        replyType = 'Outbound_Email';
    } else if (replyChannel == 'fax') {
        replyType = 'Outbound_Fax';
    } else if (replyChannel == 'sms') {
        replyType = 'Outbound_SMS';
    } else if (replyChannel == 'call') {
        replyType = 'Outbound_Call';
    } else if (replyChannel == 'wa') {
        replyType = 'Outbound_WhatsApp';
    } else {
        // replyType = ''; // none        /// 20200326 Review this redundant assignment
    }
    updateCaseObj = $.extend(updateCaseObj, {
        Internal_Case_No: internalCaseNo != null ? Number(internalCaseNo) : null,
        Agent_Id: loginId,
        Call_Nature: caseNature,
        Details: gf.escape(caseDetails),
        Status: caseStatus,
        // Long_Call: longCallDuration, // NO DEL not sure will this field be added back
        // Long_Call_Reason: longCallReason, // NO DEL not sure will this field be added back
        Is_Junk_Mail: isJunkMail,
        Escalated_To: caseEscalatedId, // If not provide Escalated_To, Escalated to will become null
        Reply_Type: replyType,
        Reply_Details: replyDetails,
        Reply_Call_Result: replyCallResult,
        Call_Type: isManualUpdate ? '' : callType,
        Type_Details: isManualUpdate ? '' : details.slice(0, 150) // webchat type details can be very long, more than 150 chatacters cannto be inserted
    });
    // if (updateCaseObj.Reply_Conn_Id) {
    //     if (isSocial) {
    //         updateCaseObj.Ticket_Id = updateCaseObj.Reply_Conn_Id;
    //     } else {
    //         updateCaseObj.Reply_Conn_Id = updateCaseObj.Reply_Conn_Id
    //     }
    // }

    // Reply_Conn_Id is unlike Conn_Id int
    //if (updateCaseObj.Reply_Conn_Id) {        20250321    'updateCaseObj.Reply_Conn_Id' is assigned to itself.
        //updateCaseObj.Reply_Conn_Id = updateCaseObj.Reply_Conn_Id 
    //}
    // ====================== For Report & Customer Journey ======================
    // If have inbound, save Inbound_Time
    if (updateCaseObj.Call_Type && updateCaseObj.Call_Type.length > 0 && connId) {
        var theInboundType = updateCaseObj.Call_Type;
        var preview = parent.$('#media-content').contents() || '';
        if (theInboundType == 'Inbound_Call' || theInboundType == 'Inbound_Voicemail' || theInboundType == 'Inbound_Fax') {
            var previewTime = preview.find('#timestamp-span').html() || ''
            updateCaseObj = $.extend(updateCaseObj, {
                Inbound_Time: previewTime
            });
        } else if (theInboundType == 'Inbound_Email') {
            var previewTime = preview.find('#time').html() || ''
            updateCaseObj = $.extend(updateCaseObj, {
                Inbound_Time: previewTime
            });
        } else if (theInboundType == 'Inbound_Webchat' || theInboundType == 'Inbound_Facebook' || theInboundType == 'Inbound_WhatsApp') {
            if (isSocial) {

                var firstMsgTime = '';
                var parentContetInner = parent.$('#content-inner-scroll-' + ticketId);
                var lastDottedLine = parentContetInner.find(' .dotted-line');
                if (lastDottedLine.length > 0) {
                    firstMsgTime = lastDottedLine.last().nextAll().find('.time-with-seconds').first().attr('title');
                } else {
                    firstMsgTime = parentContetInner.find('.time-with-seconds').first().attr('title');
                }

                updateCaseObj = $.extend(updateCaseObj, {
                    Inbound_Time: firstMsgTime
                });
            }
        }
    }
    if (replyType.length > 0) {
        updateCaseObj = $.extend(updateCaseObj, {
            Reply_Time: gf.getTimeSqlFormat()
        });
    }
    // ====================== /For Report & Customer Journey ======================
    if (ivrInfo.length > 0) {
        updateCaseObj.IVR_Info = ivrInfo;
    }
    if (isTemp) {
        var Customer_Data = updateClicked(true);
        Customer_Data.disableMode = disableMode;
        Customer_Data.inheritAll = true;
        callback($.extend(updateCaseObj, Customer_Data), parent.type);
        document.getElementById("case-save-btn").disabled = false;
        return;
    }
    if (replyType == '' || replyType == 'Outbound_Call') {

        // update case
        callUpdateCase();
    } else {
        var tempConnId;

        // Send reply, update case when callback replyCallClick called
        replyDetails = replyDetails.replace(/ /g, '');
        var replyArr = replyDetails.split(',');
        if (replyType == 'Outbound_Email') {
            var attachedFiles = '';
            for (var j = 0; j < emailFileList.length; j++) {
                if (j == 0) {
                    attachedFiles += emailFileList[j].FilePath;
                } else {
                    attachedFiles += ("," + emailFileList[j].FilePath);
                }
            }
            // Max Length is 4096
            if (attachedFiles.length > 4096) {
                document.getElementById("case-save-btn").disabled = false;
                alert('The length of file path exceeded the limit\nPlease consider to shorten file name');
                return;
            }
            var emailCc = document.getElementById('email-cc').value;
            var emailSubject = document.getElementById('email-subject').value;
            var emailContent = CKEDITOR.instances.editor.getData() || '';
            tempConnId = String(parent.parent.sendEmail(campaign, replyDetails, emailCc, emailSubject, emailContent, attachedFiles));
            updateCaseObj.Reply_Conn_Id = tempConnId;
            updateCaseObj.Conference_Conn_Id = null;
            callUpdateCase();
        } else if (replyType == 'Outbound_SMS') {

            var smsContent = $('#sms-content').val();
            if (typeof smsContent == 'undefined') {
                document.getElementById("case-save-btn").disabled = false;
                alert('Please click confirm button to fill in SMS content first');
                return;
            }

            if (smsContent == '') {
                document.getElementById("case-save-btn").disabled = false;
                $('#sms-content').focus();
                alert('SMS content cannot be blank');
                return;
            }

            // need to check is that all number first
            for (var call of replyArr) {
                if (isNaN(call)) {
                    document.getElementById("case-save-btn").disabled = false;
                    alert('SMS phone: ' + val + ' is a not valid number');
                    return;
                }
            }

            for (var i = 0; i < replyArr.length; i++) {
                var phoneNum = replyArr[i];

                tempConnId = String(parent.parent.sendSMS(campaign, Number(phoneNum), smsContent) || 0);
                if (tempConnId == 0) {

                    // still need to save, as the sms may has sent, need a record
                    alert(langJson['l-alert-sms-failed'] + phoneNum + langJson['l-alert-sms-rejected']);
                }
                if (i != 0) {
                    updateCaseObj.Reply_Conn_Id += "," + tempConnId;
                } else {
                    updateCaseObj.Reply_Conn_Id = tempConnId;
                }
            }
            updateCaseObj.Conference_Conn_Id = null;
            if (updateCaseObj.Call_Type == 'Inbound_Call') {
                callSaveCallHistory(false);
            }
            callUpdateCase();
        } else if (replyType == 'Outbound_Fax') {
            var faxFile = '';
            for (var k = 0; k < faxFileList.length; k++) {
                if (k == 0) {
                    faxFile += faxFileList[k].FilePath;
                } else {
                    faxFile += (";" + faxFileList[k].FilePath); // Notes: for fax can only seperate by ;(semi-colon) cannot seperate by ,(comma)
                }
            }
            var coverAttn = document.getElementById('fax-attn').value;
            var coverSubject = document.getElementById('fax-subject').value;
            var coverMsg = document.getElementById('fax-msg').value;
            for (let reply of replyArr) {
                tempConnId = String(parent.parent.sendFax(campaign, reply, faxFile, coverSubject, coverMsg, coverAttn, agentName, companyName)) || -1;
                if (tempConnId == 0 || undefined) {
                    alert(langJson['l-alert-fax-failed'] + reply);
                }
                if (updateCaseObj.Reply_Conn_Id == null || updateCaseObj.Reply_Conn_Id.length == 0) {
                    updateCaseObj.Reply_Conn_Id = tempConnId;
                } else {
                    updateCaseObj.Reply_Conn_Id += "," + tempConnId;
                }
            }
        } else if (replyType == 'Outbound_WhatsApp') {
            // Verify content not blank
            var tp0Val = ($('#tpl-content-0').val() || '').trim();
            var tp1Val = ($('#tpl-content-1').val() || '').trim();
            var tp2Val = ($('#tpl-content-2').val() || '').trim();
            var tp3Val = ($('#tpl-content-3').val() || '').trim();
            var tp4Val = ($('#tpl-content-4').val() || '').trim();
            var tp5Val = ($('#tpl-content-5').val() || '').trim();
            var tp6Val = ($('#tpl-content-6').val() || '').trim();

            var allPropArr = [tp0Val, tp1Val, tp2Val, tp3Val, tp4Val, tp5Val, tp6Val];
            //var tpPropsArr = [];      // 20250402 Either use this collection's contents or remove the collection.
            for (let prop of allPropArr) {
                if (prop.length > 0) {
                    tpPropsArr.push(prop);
                }
            }
            // if (tp0Val.length > 0) {
            //     tpPropsArr.push(tp0Val);
            // }

            // if (tp1Val.length > 0) {
            //     tpPropsArr.push(tp1Val);
            // }

            // if (tp2Val.length > 0) {
            //     tpPropsArr.push(tp2Val);
            // }

            // if (tp3Val.length > 0) {
            //     tpPropsArr.push(tp3Val);
            // }

            // if (tpPropsArr.length == 0) {
            //     document.getElementById("case-save-btn").disabled = false;
            //     alert('Template Content cannot be blank');
            //     return;
            // }
            // Verify has selected template

            /* //20241220 commented for shandler
            var selectedTP = $('input[name=tp]:checked').val();
            if (selectedTP == undefined) {
                document.getElementById("case-save-btn").disabled = false;
                alert('Please select at least one template');
                return;
            }
             *///end of 20241220 commented for shandler///////////////////////////////
            
            // Verify customer selected
            if (replyDetails.length == 0) {         // = => == 20250424 Extract the assignment of "replyDetails.length" from this expression.
                document.getElementById("case-save-btn").disabled = false;
                alert('Please choose the mobile number');
                return;
            }

             /* //20241220 commented for shandler
            var tpPropsNo = parseInt($('input[name=tp]:checked').attr('props'));
            if (tpPropsArr.length != tpPropsNo) {
                document.getElementById("case-save-btn").disabled = false;
                alert('Template content props is not same length with the template props');
                return;
            }
            *///end of 20241220 commented for shandler///////////////////////////////


            // 20241231     New function for check template message input

            var validTemplateInputFilled = parent.parent.$('#phone-panel')[0].contentWindow.waTempService.validateTemplateInputFilled(selectedSendTemplate);     // 20250407 Refactor the code to avoid using this boolean literal.
            var validTemplateInputLength = parent.parent.$('#phone-panel')[0].contentWindow.waTempService.validateTemplateInputLength(selectedSendTemplate);

            if (!validTemplateInputFilled)
            {
                document.getElementById("case-save-btn").disabled = false;
                alert('Template content props is not same length with the template props');
                return;
            }
            if (!validTemplateInputLength)
            {
                document.getElementById("case-save-btn").disabled = false;
                alert('Template input value length is larger than supported');
                return;
            }
			
            if (selectedSendTemplate == null)
            {
                document.getElementById("case-save-btn").disabled = false;
                alert('Please select at least one template');
                return;
            }
            waTargetNumber = "";
            if (document.getElementsByName('waList')[1].checked)         // second checkbox with textbox input
            {
                waTargetNumber = "852" + $('#wa-other-input')[0].value;
            }

            if (document.getElementsByName('waList')[0].checked)        // first (loaded from case) checkbox
            {
                waTargetNumber = "852" + document.getElementsByName('waList')[0].value;
            }



            //----------------------------------------------------------------
			/*  20241219 commented for shandler send Whatsapp
            replyDetails = replyDetails.replace(/ /g, '');
			*/
            $('#send-wa-section').append('<p><span><span><div id="circularG"><div id="circularG_1" class="circularG"></div><div id="circularG_2" class="circularG"></div><div id="circularG_3" class="circularG"></div>' +
                '<div id="circularG_4" class="circularG"></div><div id="circularG_5" class="circularG"></div><div id="circularG_6" class="circularG"></div><div id="circularG_7" class="circularG"></div><div id="circularG_8" class="circularG"></div></div><span>&nbsp;&nbsp;Sending...</span></p>');


            //if ($('#wa-other-input').value.l

            //20241219 for shandler send Whatsapp
            //parent.parent.$('#phone-panel')[0].contentWindow.sendTemplateMessageByHandler(sAgentId, sToken, "EPRO", selectedSendTemplate, "85293909352", "852XXXXX8303", null);
            //parent.parent.$('#phone-panel')[0].contentWindow.sendTemplateMessageByHandler(sAgentId, sToken, "EPRO", selectedSendTemplate, "85293909352", waTargetNumber, null);
            sendTemplateMessageFromCase(sAgentId, sToken, "EPRO", selectedSendTemplate, "85293909352", waTargetNumber, null);
            /*
            parent.parent.document.getElementById("phone-panel").contentWindow.wiseSendWhatsAppMsgEx(campaign, replyDetails, selectedTP, tpPropsArr, function (replyObj) {

                // send failed
                if (replyObj.resultID == "1") { // success resultID will be "4"
                    alert(replyObj.msg + '\nSend failed, the input form will continue to be updated');
                } else {
                    updateCaseObj.Reply_Conn_Id = replyObj.ticket_id.toString(); // big int put to varchar field need to become string first
                }                
                callUpdateCase();
            });
            */
        }
    }
}
//20250117 for shandler whatsapp template messaage	(copy from sendTemplateMessageByHandler on phone.html)
//-------------------------start-----------------
function sendTemplateMessageFromCase(agent, token, companyName, sTemplate, sFrom, sTo, sTicketId) {
    
	 
	$.ajax({
        type: "POST",
		
        url: config.shandlerapi + '/api/sendTemplate', crossDomain: true,
        data:
            JSON.stringify({
                "Agent_Id": agent,      "TicketId": sTicketId,                  "Token": token,
                "Company": companyName, "TemplateName": sTemplate.TemplateName,
                "From": sFrom,          "To": sTo,                              "BodyParams": sTemplate.inputList
            }),
        contentType: "application/json; charset=utf-8", dataType: "json",
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in function sendTemplateMessageFromCase in crmInputForm.js');
            } else {  //cannot use this.selectedTicketId because the function is tiggerd in popup
                 // return to the same .js
                sendTemplateMessageFromCaseCallBack(r.details);
            }
        },
        error: function (r) {
            console.log('error in sendTemplateMessageByHandler in crmInputForm.js');
            console.log(r);
        }
    });


}

function sendTemplateMessageFromCaseCallBack(sMsg)
{
    /*       updateCaseObj Sample.
        "Conn_Id": null, "Internal_Case_No": 33948, "Agent_Id": 5, "Call_Nature": "Enquiry",
       "Details": "AAAAA", "Status": "Follow-up Required", "Is_Junk_Mail": "N", "Escalated_To": null,
       "Reply_Type": "Outbound_WhatsApp", "Reply_Details": "61354543", "Call_Type": "",
       "Type_Details": "", "Reply_Time": "2025-01-16 14:39:55",
        "Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjUiLCJuYmYiOjE3MzcwMDk0NzcsImV4cCI6MTczNzA5NTg3NywiaWF0IjoxNzM3MDA5NDc3fQ.nJ_b1y8HbTSoMKxAjyYjt2gqcVh1mL94dykLJJiU7bI"
        }
       */

    if (updateCaseObj.Type_Details == "" && updateCaseObj.Call_Type == "Inbound_WhatsApp" )
    {
        updateCaseObj.Type_Details = waTargetNumber; // $('#Mobile_No').val();
    }

    updateCaseObj.Ticket_Id = sMsg.TicketId.toString();


    callUpdateCase();



   
    $('#send-wa-section').text("");
    $('#send-wa-section').text("Send");


}
//-------------------------endt-----------------

// for customer service pop-up
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

        if (document.getElementById('case-escalated') != null) { 
            document.getElementById('case-escalated').value = null;
        }
    }
}

var dialNoClicked = function () {
    var areYouSure = $('#are-you-sure');
    areYouSure.remove();
    $('.dial-yes-disable').prop('disabled', false);
}

var dialYesClicked = function (incompleteCase) {
    var areYouSure = $('#are-you-sure');
    areYouSure.remove();
    replyConfirmed = true;
    $('<span id="call-result-container" class="mb-3" style="display:inline;"><label>&nbsp;&nbsp;&nbsp;' + langJson['l-form-call-result'] + '&nbsp;&nbsp;&nbsp;</label><select class="form-select" id="call-result-select" value="" style="display:inline;width:130px"><option value="" selected></option><option>Answered</option><option>Busy Call Again</option><option>Busy Tone</option><option>No Answer</option><option>Voicemail</option></select></span>').insertAfter('#reply-submit-btn');
    $('.dial-yes-disable').prop('disabled', true);
    if (!incompleteCase) {
        var callDetails = $('.call-list:checked')[0].value;
        if (callDetails == 'other') {
            callDetails = $('#call-other-input')[0].value;
        }
        updateCaseObj.Reply_Details = callDetails;
        updateCaseObj.Reply_Conn_Id = "-1"; // If the agent rejected to call at the end, Reply_Conn_Id will be -1;
        var makeCallTicket = tabType == 'social-media' ? ticketId : null; // social media needed
        parent.parent.makeCall(campaign, callDetails, tabType, makeCallTicket);
    }
}

function stClicked(oThis, idType) {
    var remarksField = $('#' + idType + '-remarks')
    if (!$(oThis).prop('checked')) {
        remarksField.val('').prop('disabled', true);
    } else {
        remarksField.prop('disabled', false);
    }
}

function delEmailSetting(emailType, addBack) {
    var emailAddress = document.getElementById('Email').value || '';
    var idType = emailType.toLowerCase().replace(' ', '-');
    var remarks = $('#' + idType + '-remarks').val() || '';
    if (addBack) {
        // Update customer if remarks is same no need to continue
        var remarksFieldStr = emailType.replace(' ', '_') + '_Remarks';
        if (updatedCustomerData[remarksFieldStr] == remarks) {
            return;
        }
    }
    if ('isValid')
        $.ajax({
            type: "POST",
            url: config.wiseUrl + '/api/Email/DelSetting',
            data: JSON.stringify({
                projectName: campaign,
                emailAddress: emailAddress,
                emailType: emailType,
                agentId: loginId
            }),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            var rDetails = r.details;
            if (!/^success$/i.test(r.result || "")) {
                console.log('error: ' + rDetails);
            } else {
                var theHeader = parent.document.getElementById(idType + '-header');
                theHeader.setAttribute('data-original-title', '');
                theHeader.style.display = 'none';
            }
            if (addBack) {
                addEmailSetting(emailType, remarks);
            }
        });
}

function addEmailSetting(emailType, passedRemarks) {
    var lastName = document.getElementById('Name_Eng').value || '';
    var title = document.getElementById('Title').value || '';
    var emailAddress = document.getElementById('Email').value || '';
    var idType = emailType.toLowerCase().replace(' ', '-');
    var remarks = passedRemarks || $('#' + idType + '-remarks').val() || '';
    $.ajax({
        type: "POST",
        url: config.wiseUrl + '/api/Email/AddSetting',
        data: JSON.stringify({
            projectName: campaign,
            emailAddress: emailAddress,
            emailType: emailType,
            agentId: loginId,
            fullName: lastName,
            title: title,
            remarks: remarks
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        var rDetails = r.details;
        if (!/^success$/i.test(r.result || "")) {
            console.log('error: ' + rDetails);
        } else {
            var theHeader = parent.document.getElementById(idType + '-header');
            theHeader.style.display = 'inline';
            theHeader.setAttribute('data-original-title', remarks);
        }
    });
}

function callSaveCallHistory(isSaved) { // if update reply details only, will not update Is_Saved to Y (when made an outbound call)
    var hvInbound = !isManualUpdate && connId && connId != -1 && connId != 0;

    // Conn_Id is primary key, so when just reply call, the Conn_Id should be Reply_Conn_Id
// 20250520 Extract this nested ternary operation into an independent statement.
 // var toSaveConnId = hvInbound ? Number(connId) : (isSocial && !isManualUpdate) ? Number(ticketId) : Number(updateCaseObj.Reply_Conn_Id);
	var toSaveConnId;
	if (hvInbound) {
		toSaveConnId = Number(connId);
	} else if (isSocial && !isManualUpdate) {
		toSaveConnId = Number(ticketId);
	} else {
		toSaveConnId = Number(updateCaseObj.Reply_Conn_Id);
	}

	
	
	
    var saveCallHistoryObj = {
        "Conn_Id": toSaveConnId,
        // "Conn_Id": updateCaseObj.Ticket_Id ? Number(updateCaseObj.Ticket_Id) : (updateCaseObj.Conn_Id ? Number(updateCaseObj.Conn_Id) : Number(updateCaseObj.Reply_Conn_Id)),
        'Call_Type': hvInbound ? callType : '', // callType default ''
        "Type_Details": hvInbound ? (details || '') : '', // details default ''
        "Internal_Case_No": internalCaseNo != null ? Number(internalCaseNo) : null,
        "Updated_By": loginId,
        Agent_Id: loginId,
        Token: token
    }
    if (ivrInfo.length > 0) {
        saveCallHistoryObj.IVR_Info = ivrInfo;
    }
    if (updateCaseObj.Reply_Type) {
        saveCallHistoryObj.Reply_Type = updateCaseObj.Reply_Type;
    }
    if (updateCaseObj.Reply_Details) {
        saveCallHistoryObj.Reply_Details = updateCaseObj.Reply_Details;
    }
    if (updateCaseObj.Conference_Conn_Id) {
        saveCallHistoryObj.Conference_Conn_Id = updateCaseObj.Conference_Conn_Id;
    }
    if (updateCaseObj.Reply_Conn_Id) {
        saveCallHistoryObj.Reply_Conn_Id = Number(updateCaseObj.Reply_Conn_Id);
    }
    if (isSaved) {
        saveCallHistoryObj.Is_Saved = "Y";

        // this is to avoid outbound use this conn id
        if (saveCallHistoryObj.Conn_Id == sessionStorage.getItem('scrmConnId')) {
            sessionStorage.removeItem('scrmConnId');
        }
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
          //} else {    //20250410 'If' statement should not be the only statement in 'else' block
                // Reload page
            } else if (isSaved) {
                    restorePage();
               // } //20250410 for else if 
            }
        },
        error: function (r) {
            console.log('error in callSaveCallHistory');
            console.log(r);
        },
    });
}

function callUpdateCase() {
    updateCaseObj.Agent_Id = loginId;
    updateCaseObj.Token = token;

    //20250126 for shandler
    if (updateCaseObj.Type_Details == "")
    {
        if (updateCaseObj.Call_Type == "Inbound_Whatsapp")
        {
            updateCaseObj.Type_Details = $('#Mobile_No').val();
        }
    }

    if (updateCaseObj.Ticket_Id == null && parent.parent[3].chatService != null)
    {
		if  (parent.parent[3].chatService.selectedTicketId != null)
		{
			//20250430 for ticketid fix for shandler
			 var tId =parent.parent[3].chatService.selectedTicketId.ToString;
			updateCaseObj.Ticket_Id =  tId;
		}
    }

    $.ajax({
        type: "PUT",
        url: config.companyUrl + '/api/UpdateCase',
        data: JSON.stringify(updateCaseObj),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (res) {
        document.getElementById("case-save-btn").disabled = false;
        if (!/^success$/i.test(res.result || "")) {
            alert(res.details || res || '');
        } else {
            // $('#form-back-btn').hide();
            // Check have become outsider
            if (updateCaseObj.Status == 'Escalated' && updateCaseObj.Escalated_To != loginId) {
                var caseStatusSelect = $('#case-status');
                // Set status follow up
                caseStatusSelect.val('Follow-up Required');
                // Take out Closed and Escalated option
                caseStatusSelect.find('.to-be-removed').remove();
                // hidden escalatedt to
                document.getElementById('case-escalated-container').style.display = 'none';
            }
            caseNo = res.details.Case_No || -1;
            $('#scheduled-reminder').show();
            $('#export-word-btn').show()
            // If no case no showed before
            // if ($('#case-no-span').length == 0) {
            //     $('<span id="case-no-span" class="ms-3"><label class="mt-3">' + langJson['l-search-case-no'] + ':</label>&nbsp;' + caseNo + '</span>').insertAfter($('#customer-id'));
            //     $('<button class="float-end btn btn-circle btn-warning d-print-none" title=" ' +
            //     langJson['l-form-exoprt-word']
            //     +' " onclick="scheduleClick();"><i class="fas fa-solid fa-file-word word-icon"></i></button>').insertBefore($('#scheduled-reminder'));
            // }
            var caseLogContainer = $('#case-log-container');
            caseLogContainer.remove();
            if (caseLogContainer.length == 0) {
                loadCaseLog(true);
            } else {
                caseLogContainer.remove();
                loadCaseLog(false);
            }
            // Reply wise handled the media reocrd
            if (connId != null && connId != -1 && (callType == 'Inbound_Email' || callType == 'Inbound_Fax' || callType == 'Inbound_Voicemail')) {
                parent.parent.setMediaHandled(callType, connId, updateCaseObj.Internal_Case_No);
            }

            // ========================== if social media, have meet requirement to close chat ==========================     
            if (isSocial) {
                parent.parent.callSavedCase(ticketId);
            }
            if (openType == 'menu') {
                parent.loadTitleBarData(true);
            }
            // whatsapp not yet connId (big int)
            if (updateCaseObj.Call_Type == 'Inbound_Call' || updateCaseObj.Reply_Type == 'Outbound_Call' || updateCaseObj.Call_Type == 'Inbound_Webchat' || updateCaseObj.Call_Type == 'Inbound_Wechat' || updateCaseObj.Call_Type == 'Inbound_Facebook') {
                callSaveCallHistory(true);
            } else {
                restorePage();
            }
        }
    }).done(function () {
        sessionStorage.removeItem('scrmConnId');
    });
}

function replyCallClick(lastCallType, lastCallId, confConnId) {
    updateCaseObj.Reply_Conn_Id = String(lastCallId);
    updateCaseObj.Conference_Conn_Id = confConnId != null ? Number(confConnId) : null;
    updateCaseObj.Reply_Type = 'Outbound_Call';
    callSaveCallHistory(false);
}

var WAOtherChanged = function (oThis) {
    var isChecked = $(oThis).prop('checked');
    if (isChecked) {
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
    var waContainerStr;
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
            mobileNoStr = '<span id="reply-wa-mobile-container" style="display:inline-block;">' +
                '<div class="form-check ms-2"><label class="form-check-label"><input type="checkbox" name="waList" class="form-check-input reply-checkbox wa-list" value="' + mobileNo + '" id="oCallMobile_No">' +
                mobileNo +
                '<span class="form-check-sign"><span class="check"></span></span></label></div></span>'
        }

        // if (config.isEmma) {
        var onkeyupStr = "this.value=this.value.replace(/[^\\d]/,'')"; // need to escape d, so \\d, not \d
        waContainerStr = '<span class="reply-wa-container" style="display:inline;">' + mobileNoStr +
            '<span id="wa-other-container" style="display:inline-block;"><div class="form-check ms-2" style="display:inline;"><label class="form-check-label"><input type="checkbox" class="form-check-input reply-checkbox wa-list" name="waList" value="other" id="call-other-check" onchange="WAOtherChanged(this)">Other<span class="form-check-sign"><span class="check"></span></span></label></div>&nbsp;<input type="tel" maxlength="50" onkeyup=' + onkeyupStr + ' disabled="true" id="wa-other-input" class="border-form-control" autocomplete="off"></span>' +
            '<button id="select-tp-btn" class="btn btn-sm btn-warning text-capitalize rounded ms-2">' + langJson['l-campaign-select-template'] + '</button>' +
            '<div id="send-wa-section" class="mt-2"></div>'

        $('#reply-details').append(waContainerStr);
        $('#wa-other-input').keydown(function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                $('#select-tp-btn').click();
                return false;
            }
        })




        $('#select-tp-btn').on('click', function () {
            var openWindows = parent.parent.openWindows;

            //var popupCampaign = campaign; 	// 20250416 Remove the declaration of the unused 'popupCampaign' variable.
            selectedSendTemplate = null;

         

            //20241217 newly added for shandler
            sAgentId = top.loginId;
            sToken = top.token;
            sCompany = "EPRO";

            // The service location is different from chatbot (parent.parent)
            // waTempService = parent.document.getElementById("phone-panel").contentWindow.waTempService;
            waTempService = parent.parent.document.getElementById("phone-panel").contentWindow.waTempService;

            //20241219 FOR shandler
            //var socialPopup = window.open('../../socialPopup.html?type=wa-template', 'reply-container', '_blank, toolbar=0,location=0,top=50, left=100,menubar=0,resizable=0,scrollbars=1,width=1000,height=928');
            var socialPopup = window.open('../../socialWaTemplateSL.html?type=wa-template', 'reply-container', '_blank, toolbar=0,location=0,top=50, left=100,menubar=0,resizable=0,scrollbars=1,width=1000,height=928');

            openWindows[openWindows.length] = socialPopup;
            socialPopup.onload = function () {
                socialPopup.onbeforeunload = function () {
                    for (var i = 0; i < openWindows.length; i++) {
                        if (openWindows[i] == socialPopup) {
                            openWindows.splice(i, 1);
                            break;
                        }
                    }

                    //20241219 FOR shandler
                    if (selectedSendTemplate != null)
                    {
						
						
						
						
                        replyConfirmed = true;
                        //document.getElementById("case-save-btn").disabled = false;   
                        $('#send-wa-section').text("");
                        const div = $("#reply-container");
                        //div.scrollTop(div[0].scrollHeight);
                        
                        waTempService.displayFilledTemplateOnWeb(selectedSendTemplate, $('#reply-container'));



                        if (typeof parent[0].resize !== "undefined") {
                            parent[0].resize();     //If send whatsapp template in chat room search case flow
                        }
                        else if (typeof parent[1].resize !== "undefined") {
                            parent[1].resize();     //If send whatsapp template in search case flow
                                                    //or pure create new customer flow
                        }

                        div.animate({ scrollTop: div[0].scrollHeight }, 'slow');
                    }

                    //$('#reply-container').css('height', '80px');
                    //$('#reply-container').css('overflow-y', 'scroll');

                 
                    //end of add

                }

                
            }
          
                
        })
        // } else {

        //     waContainerStr = '<span class="reply-wa-container" style="display:inline;">' + mobileNoStr +
        //         '<span id="wa-other-container" style="display:inline-block;"><div class="form-check ms-2" style="display:inline;"><label class="form-check-label"><input type="checkbox" class="form-check-input reply-checkbox wa-list" name="waList" value="other" id="call-other-check" onchange="WAOtherChanged(this)">Other<span class="form-check-sign"><span class="check"></span></span></label></div>&nbsp;<input type="tel" maxlength="80" disabled="true" id="wa-other-input" class="border-form-control" autocomplete="off"></span>' +
        //         '<div id="send-wa-section" class="mt-2">' +

        //         // '<label class="form-label mb-0"><span>Template Prop(s):</span><input id="tpl-content" class="rounded ms-3 me-2" autocomplete="off">e.g. 4 July,8pm</label>' +

        //         '<div class="form-check form-check-radio ms-4"><label class="form-check-label" for="tp-1"><input class="form-check-input" type="radio" name="tp" id="tp-1" value="1" props=2>Your appointment is coming up on {{1}} at {{2}}<span class="circle"><span class="check"></span></span></label></div>' +
        //         '<div class="form-check form-check-radio ms-4"><label class="form-check-label" for="tp-2"><input class="form-check-input" type="radio" name="tp" id="tp-2" value="2" props=2>易寶通訊提醒你, 預約日期是{{1}}{{2}}。<span class="circle"><span class="check"></span></span></label></div>' +
        //         '<div class="form-check form-check-radio ms-4"><label class="form-check-label" for="tp-3"><input class="form-check-input" type="radio" name="tp" id="tp-3" value="3" props=1>Epro Notice: Thank you for your application, the application no is {{1}}.<span class="circle"><span class="check"></span></span></label></div>' +
        //         '<div class="form-check form-check-radio ms-4"><label class="form-check-label" for="tp-4"><input class="form-check-input" type="radio" name="tp" id="tp-4" value="4" props=1>易寶：謝謝你的申請, 你的申編號是 {{1}}.<span class="circle"><span class="check"></span></span></label></div>' +
        //         '<div class="form-check form-check-radio ms-4"><label class="form-check-label" for="tp-5"><input class="form-check-input" type="radio" name="tp" id="tp-5" value="5" props=2>Case No: {{1}}<div class="mt-1">Detail : {{2}}</div><span class="circle"><span class="check"></span></span></label></div>' +

        //         '<label class="form-label mb-0 mt-1">&nbsp;&nbsp;' +
        //         '<span id="prop-0-span" class="d-none wa-prop-span">{{1}}: <input id="tpl-content-0" class="rounded ms-1 me-2" autocomplete="off" style="width: 113px;"></span>' +
        //         '<span id="prop-1-span" class="d-none wa-prop-span">{{2}}: <input id="tpl-content-1" class="rounded ms-1 me-2" autocomplete="off" style="width: 113px;"></span>' +
        //         '<span id="prop-2-span" class="d-none wa-prop-span">{{3}}: <input id="tpl-content-2" class="rounded ms-1 me-2" autocomplete="off" style="width: 113px;"></span>' +
        //         '<span id="prop-3-span" class="d-none wa-prop-span">{{4}}: <input id="tpl-content-3" class="rounded ms-1 me-2" autocomplete="off" style="width: 113px;"></span></label>' +

        //         '</div></span>';

        //     $('#reply-details').append(waContainerStr);

        //     $('input[name="tp"]').on('change', function () {
        //         event.preventDefault();
        //         var propNo = parseInt($(this).attr('props'));
        //         for (var i = 0; i < propNo; i++) {
        //             if ($('#prop-' + i + '-span').hasClass('d-none')) {
        //                 $('#prop-' + i + '-span').removeClass('d-none');
        //             }
        //         }
        //         for (var j = propNo; j < 4; j++) {
        //             if (!$('#prop-' + j + '-span').hasClass('d-none')) {
        //                 $('#prop-' + j + '-span').addClass('d-none');
        //                 $('#tpl-content-' + j).val('');
        //             }
        //         }
        //         $('#tpl-content-0').focus();
        //     })

        //     replyConfirmed = true;
        // }
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
        // Text of the confirm button of details
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
        emailFileList = [];
        faxFileList = [];
    }
    resize();
}

function smsWordCount() {
    var smsContent = $('#sms-content').val() || '';
    var smsContentLen = smsContent.length;
    var haveChineseChar = gf.isDoubleByte(smsContent);
    var msgCountArr = haveChineseChar ? [70, 134, 201, 268, 335] : [160, 306, 459, 612, 765];
    var msgNo = 1;
    var moreThanMax = true;
    for (var i = 0; i < msgCountArr.length; i++) {
        if (smsContentLen <= msgCountArr[i]) {
            msgNo = (i + 1);
            moreThanMax = false;
            break;
        }
    }
    var maxInRange = moreThanMax ? msgCountArr[4] : msgCountArr[msgNo - 1];
    var smsWordCountStr = smsContentLen + '/' + maxInRange;
    var totalMsgs = moreThanMax ? 5 : msgNo;
    $('#sms-word-count').text(smsWordCountStr);
    $('#sms-msg-count').text(totalMsgs);
}

// TBD  original
// function smsWordCount() {
//     var smsContent = $('#sms-content').val() || '';
//     var smsContentLen = smsContent.length;
//     var haveChineseChar = gf.isDoubleByte(smsContent);
//     // wds counts refers to 3HK
//     var perMsgCount = 160;
//     if (haveChineseChar) {
//         perMsgCount = 70;
//     }
//     // round up
//     var totalMsgs = Math.ceil(smsContentLen / perMsgCount);
//     var totalMsgNumber = totalMsgs * perMsgCount;
//     var smsWordCountStr = smsContentLen + '/' + totalMsgNumber;
//     $('#sms-word-count').text(smsWordCountStr);
//     $('#sms-msg-count').text(totalMsgs);
// }
// /TBD

var replySubmitClicked = function () {
    var replyChannel = document.querySelector('input[name="replyList"]:checked').value;
    var replyDetailsArr = $('.' + replyChannel + '-list:checked');

    // if checked other, chcke anything typed
    for (let theReplyDetails of replyDetailsArr) {
        var detailsValue = theReplyDetails.value;
        if (detailsValue == 'other') {
            var replyDetails = $('#' + replyChannel + '-other-input')[0].value;
            if (replyDetails.length == 0) {
                alert(langJson['l-alert-other-blank']);
                return
            }
        }
    }
    if (replyChannel == 'call') {
        var checkedPhoneList = document.querySelector('input[name="callList"]:checked');
        if (checkedPhoneList == null) {
            alert(langJson['l-alert-number-not-selected']);
            return
        }
        var areYouSure = $('#are-you-sure');
        if (areYouSure.length == 0) {
            $('<span id="are-you-sure">&nbsp;&nbsp;&nbsp;' + langJson['l-form-are-you-sure'] + '?&nbsp;&nbsp;&nbsp;<button class="btn btn-sm btn-warning text-capitalize rounded" onclick="dialYesClicked();"><i class="fas fa-check me-2"></i><span>' + langJson['l-form-yes'] + '</span></button>&nbsp;<button onclick="dialNoClicked();" class="btn btn-sm btn-warning text-capitalize rounded"><i class="fas fa-times me-2"></i><span>' + langJson['l-form-no'] + '</span></button></span>').insertAfter('#reply-submit-btn');
            $('.dial-yes-disable').prop('disabled', true);
        }
    } else if (replyChannel == 'email' || replyChannel == 'fax' || replyChannel == 'sms') {
        // get selected checkbox, if checked none, return
        var checkList = $('.' + replyChannel + '-list:checked').val();
        if (checkList == undefined || checkList.length == 0) {
            // no check box selected return
            alert(langJson['l-alert-no-reply-details']);
            return
        }
        var replyContainer = $('#reply-card');
        if (replyContainer.length > 0) {
            return;
        }
        if (replyChannel == 'email') {
            var preview = parent.$('#media-content').contents() || '';
            var mediaContent = parent.mediaContent;
            var subjectStr = callType == 'Inbound_Email' ? ('"RE: ' + mediaContent.Subject + '"') : "";

            var previous_email = '';
            var contentStr = '';

            if (callType == 'Inbound_Email') {
                previous_email = '&#13;&#10;<br />' +
                    '<hr />' +
                    '<b>From: </b>' + (preview.find('#name').html() || '') + (preview.find('#from').html() || '') + '&#13;&#10;<br />' +
                    '<b>Sent: </b>' + (preview.find('#time').html() || '') + '&#13;&#10;<br />' +
                    '<b>To: </b>' + (preview.find('#to').html() || '') + '&#13;&#10;<br />' +
                    '<b>Subject: </b>' + (preview.find('#subject').html() || '') + '&#13;&#10;<br />' +
                    (preview.find('#content').html() || '');
                contentStr = ('&#13;&#10;' + previous_email);
				console.log(contentStr);
            }

            var emailFileTriggerStr = "$('#upload-emailFile').trigger('click');"
            var emailFileUploadStr = 'uploadAttachment(this,"emailFile");'
            var replyCardStr = '<div id="reply-card" class="my-2 bg-light mb-4 rounded-2 py-5 px-3 py-3"><div class="text-center mb-2 bg-info rounded text-white"><h5 class="mt-0 mb-0">Send Email</h5></div><div class="row d-flex align-items-center">' +

                '<div class="d-flex mb-3 col-sm-12 ps-0 mb-0">' +

                '<label class="col-sm-1 control-label ps-4">Template</label>' +

                '<div class="d-flex col-sm-11 ps-2">' +

                '<span class="mb-3 d-flex align-items-center float-start" style="margin-top:-8px">' +
                '<div class="form-check mt-2">' +
                '<label class="form-check-label" style="text-wrap: nowrap;">' +
                '<input class="form-check-input" type="radio" name="lang-rd-list" value="chi" checked="">中文<span class="circle">' +
                '<span class="check"></span>' +
                '</span>' +
                '</label>' +
                '</div>' +

                '<div class="form-check mt-2 ms-2">' +
                '<label class="form-check-label">' +
                '<input class="form-check-input" type="radio" name="lang-rd-list" value="eng">English<span class="circle">' +
                '<span class="check"></span>' +
                '</span>' +
                '</label>' +

                '</div>' +
                '</span>&nbsp;&nbsp;&nbsp;' +

                '<select id="tmp-2nd-lv" class="form-select">' +
                '<option selected="selected" value=""></option>' +
                '<option lang="chi" value=0>提供驗證碼</option>' +
                '<option lang="eng" class="d-none" value=1>Give Verification</option>' +
                '<option lang="chi" value=2>上月結餘</option>' +
                '<option lang="eng" class="d-none" value=3>Last Month Balance</option>' +

                '<option lang="chi" group-id="3" value=4>銷售文件</option>' +

                '<option lang="eng" class="d-none" group-id="3" value=5>Offering Document</option>' +
                '<option lang="chi" group-id="4" value=6>個人賬戶成員</option>' +
                '<option lang="eng" class="d-none" group-id="4" value=7>Personal Account Member</option>' +
                '</select>' +

                '</div>' +
                '</div>' +

                '<div class="col-sm-12 ps-0">' +

                '<div class="offset-md-1 col-sm-11 ps-1">' +

                '<select id="tmp-3rd-lv" class="form-select d-none pt-0 mb-2" style="margin-left:148px;">' +
                '<option selected="selected" value=""></option>' +
                '<option lang="chi" group-id="3" value=4>強積金計劃說明書 - 我的強積金計劃 (2020年3月31日)</option>' +
                '<option lang="chi" group-id="3" value=5>我的強積金計劃之強積金計劃說明書第一補編 (2020年5月15日)</option>' +
                '<option lang="chi" group-id="3" value=6>持續成本列表</option>' +
                '<option lang="chi" group-id="3" value=7>我的強積金保守基金年費解說例子</option>' +
                '<option lang="eng" group-id="3" class="d-none" value=8>MPF Scheme Brochure for My Choice Mandatory Provident Fund Scheme (31 Mar 2020)</option>' +
                '<option lang="eng" group-id="3" class="d-none" value=9>First Addendum to the MPF Scheme Brochure of My Choice Mandatory Provident Fund (15 May 2020)' +
                '<option lang="eng" group-id="3" class="d-none" value=10>On-Going Cost Illustrations</option>' +
                '<option lang="eng" group-id="3" class="d-none" value=11>Illustrative Example for My Choice MPF Conservative Fund</option>' +
                '<option lang="chi" group-id="4" value=12>更改投資基金組合授權書 (適用於新供款及/或現有戶口結餘) (可輸入資料)</option>' +
                '<option lang="chi" group-id="4" value=13>基金轉換指示 (只適用於現有戶口結餘) (可輸入資料)</option>' +
                '<option lang="chi" group-id="4" value=14>個人資料使用指示</option>' +
                '<option lang="eng" group-id="4" class="d-none" value=15>Change of Investment Fund Instruction (for Future Contribution and/or Existing Account Balances) (electronic fillable)</option>' +
                '<option lang="eng" group-id="4" class="d-none" value=16>Fund Switching Instruction(for Existing Account Balance Only)(electronic fillable)' +
                '<option lang="eng" group-id="4" class="d-none" value=17>Instruction of Use of Personal Information</option>' +
                '</select>' +

                '</div>' +

                '</div>' +


                '<div class="mb-3 col-sm-12 ps-0 d-flex">' +
                '<label class="col-sm-1 control-label ps-4">From</label>' +
                '<div class="col-sm-11 ps-2">' + companyName + ' (' + companyEmail + ')' +

                '</div></div>' +

                '<div class="mb-4 col-sm-12 ps-0 d-flex"><label for="email-cc" class="col-sm-1 control-label ps-4">CC</label>' +
                '<input class="form-control col-sm-6 col-offset-5 ms-2" id="email-cc" type="search" maxlength="100" autocomplete="off"></div>' +

                '<div class="mb-4 col-sm-12 ps-0 d-flex"><label for="email-subject" class="col-sm-1 control-label ps-4">Subject</label>' +
                '<input class="form-control col-sm-6 col-offset-5 ms-2" id="email-subject" type="search" maxlength="100" autocomplete="off" value=' + subjectStr + '></div>' +

                '<div class="mb-3 col-sm-12 ps-0 mt-1 d-flex"><label for="editor" class="col-sm-1 control-label ps-4">Content<br />&nbsp;&nbsp;(html)</label>' +
                '<div class="col-sm-11 ps-2">' +
                '<div id="editor">' + contentStr + '</div>' +
                '</div></div><div class="mb-3 col-sm-12 ps-0 mt-2"><label for="emailFile-attachment" class="col-sm-1 control-label ps-4" style="text-wrap: nowrap">Attachment</label>' +
                '<div id="emailFile-attachment" class="col-sm-11 ps-3">' +
                '<input type="file" id="upload-emailFile" onchange=' + emailFileUploadStr + ' style="display:none" multiple>' +
                '<input type="button" class="btn btn-warning btn-sm text-capitalize" title="Upload Attachment" value="Upload" onclick=' + emailFileTriggerStr + ' /></div></div>' +
                '</div></div>';

            $(replyCardStr).appendTo("#reply-container").ready(function () {
                initEditor();
            });

            CKEDITOR.on('instanceCreated', function (e) {
                e.editor.on('contentDom', function () {
                    var editable = e.editor.editable();
                    editable.attachListener(e.editor.document, 'keydown', function (evt) {
                        if (event.keyCode == 33 || event.keyCode == 34) {
                            e.editor.editable().$.blur();
                        }
                    });
                });
            });
            CKEDITOR.on("instanceReady", function (ev) {
                resize();
            });

            $('input[name="lang-rd-list"]').on('change', function () {
                event.preventDefault();
                var targetLang = $('input[name="lang-rd-list"]:checked').val();

                // 2nd lv change lang and set to default
                $('#tmp-2nd-lv').val('');
                var secondLvOpts = $('#tmp-2nd-lv option');
                secondLvOpts.removeClass('d-none');
                secondLvOpts.each(function () {
                    var langCode = $(this).attr('lang');
                    if (langCode != targetLang) {
                        $(this).addClass('d-none');
                    }
                });

                // 3rd lv hide & change language
                $('#tmp-3rd-lv').addClass('d-none');
                var thirdLvOpts = $('#tmp-3rd-lv option');
                thirdLvOpts.removeClass('d-none');
                // filter out non-targeted code
                thirdLvOpts.each(function () {
                    var langCode = $(this).attr('lang');
                    if (langCode != targetLang) {
                        $(this).addClass('d-none');
                    }
                });

            });

            $('#tmp-2nd-lv').on('change', function () {
                event.preventDefault();
                var templateVal = $(this).val();
                var targetLang = $('option:selected', this).attr('lang');
                if (templateVal.length > 0) {
                    // not 3rd lv
                    if (templateVal < 4) {
                        $('#tmp-3rd-lv').addClass('d-none'); // no need to show 3rd lv
                        var template = emailTemplateArr[Number(templateVal)];
                        var greetingStr = targetLang == 'chi' ? '親愛的客戶:<br/><br/>' : 'Dear Custoemr,<br/><br/>';
                        var endingStr = '<br/><br/>ABC Company';
                        var templateContent = (greetingStr + (template.content || '') + endingStr + previous_email);
                        if (previous_email.length == 0) {
                            var templateSubject = template.subject || '';
                            $('#email-subject').val(templateSubject);
                        }
                        // verfication code
                        if (templateVal == 0 || templateVal == 1) {
                            //var randomNo = Math.floor(100000 + Math.random() * 900000); // random 6 digit number
                            var randomNo = generateSecureRandomNumber(); // random 6 digit number
                            templateContent = templateContent.replace('123456', randomNo);
                        } else if (templateVal == 2 || templateVal == 3) {
                            var now = new Date();
                            var prevMonthLastDate = new Date(now.getFullYear(), now.getMonth(), 0);
                            var date = prevMonthLastDate.getDate();
                            var month = prevMonthLastDate.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
                            var year = prevMonthLastDate.getFullYear().toString().substr(-2);
                            if (date < 10) {
                                date = '0' + date;
                            }
                            if (month < 10) {
                                month = '0' + month;
                            }
                            var dateStr = date + "/" + month + "/" + year;
                            templateContent = templateContent.replace('01/01/00', dateStr);
                        }
                        CKEDITOR.instances['editor'].setData(templateContent);
                    } else { // set 3rd lv display
                        // get lang
                        $('#tmp-3rd-lv').val(''); // default empty
                        var targetGroup = $('option:selected', this).attr('group-id');
                        var thirdLvOpts = $('#tmp-3rd-lv option');
                        thirdLvOpts.removeClass('d-none');
                        // filter out non-targeted code
                        thirdLvOpts.each(function () {
                            var groupId = $(this).attr('group-id');
                            var langCode = $(this).attr('lang');
                            if (groupId != targetGroup || langCode != targetLang) {
                                $(this).addClass('d-none');
                            }
                        });
                        $('#tmp-3rd-lv').removeClass('d-none'); // show 3rd lv      
                    }
                } else {
                    $('#tmp-3rd-lv').addClass('d-none'); // no need to show 3rd lv
                }
            });
            $('#tmp-3rd-lv').on('change', function () {
                event.preventDefault();
                var templateVal = $(this).val();
                if (templateVal.length > 0) {
                    var targetLang = $('option:selected', this).attr('lang');
                    var greetingStr = targetLang == 'chi' ? '<p>親愛的客戶:</p>' : '<p>Dear Custoemr,</p>';
                    var endingStr = '<br/><br/>ABC Company';
                    var template = emailTemplateArr[Number(templateVal)];
                    var templateContent = (greetingStr + (template.content || '') + endingStr + previous_email);
                    if (previous_email.length == 0) {
                        var templateSubject = template.subject || '';
                        $('#email-subject').val(templateSubject);
                    }
                    CKEDITOR.instances['editor'].setData(templateContent);
                }
            });
        } else if (replyChannel === 'fax') {
            var faxFileTriggerStr = "$('#upload-faxFile').trigger('click');"
            var faxFileUploadStr = 'uploadAttachment(this,"faxFile");'
            $('<div id="reply-card" class="my-2 bg-light mb-4 rounded-2 py-5 px-3 py-3"><div class="text-center mb-3 bg-info rounded text-white"><h5 class="mt-0 mb-0">Send Fax</h5></div><div class="row d-flex align-items-center">' +
                '<div class="mb-3 col-sm-12 ps-3 d-flex">' +
                '<label class="col-sm-2 control-label ps-5 justify-content-start">Cover Sender</label>' +
                '<div class="col-sm-10 ps-3">' + agentName + '</div></div>' +
                '<div class="mb-3 col-sm-12 ps-3 d-flex">' +
                '<label class="col-sm-2 control-label ps-5 justify-content-start">Cover Company</label>' +
                '<div class="col-sm-10 ps-3">' + companyName + '</div></div>' +
                '<div class="mb-3 col-sm-12 ps-3 d-flex">' +
                '<label for="fax-attn" class="col-sm-2 control-label ps-5 justify-content-start">Cover Attention</label>' +
                '<div class="col-sm-10 ps-3"><input id="fax-attn" class="form-control" /></div></div>' +
                '<div class="mb-3 col-sm-12 ps-3 d-flex">' +
                '<label for="fax-subject" class="col-sm-2 control-label ps-5 justify-content-start">Cover Subject</label>' +
                '<div class="col-sm-10 ps-3"><input id="fax-subject" class="form-control" /></div></div>' +
                '<div class="mb-3 col-sm-12 ps-3 d-flex"><label for="fax-msg" class="col-sm-2 control-label  ps-5 justify-content-start">Content</label>' +
                '<div class="col-sm-10 ps-3">' +
                '<textarea class="mt-2" id="fax-msg" rows="3" cols="20" style="font-family:inherit;width:100%;" maxlength="500"></textarea></div></div>' +
                '<div class="mb-3 col-sm-12 ps-3 d-flex">' +
                '<label class="col-sm-2 control-label ps-5 justify-content-start">Fax File<br>(TXT, PDF, DOC, PPT, XLS Format Allowed)</label>' +
                '<div id="faxFile-attachment" class="col-sm-10 ps-3"><input type="file" accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.txt" id="upload-faxFile" onchange=' + faxFileUploadStr + ' style="display:none" multiple>' +
                '<input type="button" class="btn btn-warning btn-sm ms-0 text-capitalize" title="Upload Fax File" value="Upload" style="margin-left:5px;" onclick=' + faxFileTriggerStr + ' /></div></div></div></div>' +
                +'</div>').appendTo('#reply-container');
        } else if (replyChannel === 'sms') {
            $('<div id="reply-card" class="my-2 bg-light mb-4 rounded-2 py-5 px-3 py-3"><div class="text-center mb-3 bg-info rounded text-white"><h5 class="mt-0 mb-0">Send SMS</h5></div>' +
                '<div class="row d-flex align-items-center">' +

                '<div class="d-flex mb-3 col-sm-12 ps-0 mb-0">' +
                '<label class="col-sm-1 control-label ps-4">Template</label>' +

                '<div class="d-flex col-sm-11 ps-2">' +

                '<span class="mb-3 d-flex align-items-center float-start" style="margin-top:-8px">' +
                '<div class="form-check mt-2" style="text-wrap: nowrap;">' +
                '<label class="form-check-label" >' +
                '<input class="form-check-input" type="radio" name="lang-rd-list" value="chi" checked="">中文<span class="circle">' +
                '<span class="check"></span>' +
                '</span>' +
                '</label>' +
                '</div>' +

                '<div class="form-check mt-2 ms-2">' +
                '<label class="form-check-label">' +
                '<input class="form-check-input" type="radio" name="lang-rd-list" value="eng">English<span class="circle">' +
                '<span class="check"></span>' +
                '</span>' +
                '</label>' +

                '</div>' +
                '</span>&nbsp;&nbsp;&nbsp;' +

                '<select id="tmp-2nd-lv" class="form-select w-auto" style="height:34px">' +
                '<option selected="selected" value=""></option>' +
                '<option lang="chi" value=0>提供驗證碼</option>' +
                '<option lang="eng" class="d-none" value=1>Give Verification</option>' +
                '<option lang="chi" value=2>網址連結</option>' +
                '<option lang="eng" class="d-none" value=3>Webchat Link</option>' +

                '<option lang="chi" group-id="3" value=4>銷售文件</option>' +

                '<option lang="eng" class="d-none" group-id="3" value=5>Offering Document</option>' +
                '<option lang="chi" group-id="4" value=6>個人賬戶成員</option>' +
                '<option lang="eng" class="d-none" group-id="4" value=7>Personal Account Member</option>' +
                '</select>' +

                '</div>' +
                '</div>' +

                '<div class="col-sm-12 ps-0">' +

                '<div class="offset-md-1 col-sm-11 ps-1">' +

                '<select id="tmp-3rd-lv" class="form-select d-none pt-0 mb-2  w15" style="margin-left:148px;">' +
                '<option selected="selected" value=""></option>' +
                '<option lang="chi" group-id="3" value=4>強積金計劃說明書 - 我的強積金計劃 (2020年3月31日)</option>' +
                '<option lang="chi" group-id="3" value=5>我的強積金計劃之強積金計劃說明書第一補編 (2020年5月15日)</option>' +
                '<option lang="chi" group-id="3" value=6>持續成本列表</option>' +
                '<option lang="chi" group-id="3" value=7>我的強積金保守基金年費解說例子</option>' +
                '<option lang="eng" group-id="3" class="d-none" value=8>MPF Scheme Brochure for My Choice Mandatory Provident Fund Scheme (31 Mar 2020)</option>' +
                '<option lang="eng" group-id="3" class="d-none" value=9>First Addendum to the MPF Scheme Brochure of My Choice Mandatory Provident Fund (15 May 2020)' +
                '<option lang="eng" group-id="3" class="d-none" value=10>On-Going Cost Illustrations</option>' +
                '<option lang="eng" group-id="3" class="d-none" value=11>Illustrative Example for My Choice MPF Conservative Fund</option>' +
                '<option lang="chi" group-id="4" value=12>更改投資基金組合授權書 (適用於新供款及/或現有戶口結餘) (可輸入資料)</option>' +
                '<option lang="chi" group-id="4" value=13>基金轉換指示 (只適用於現有戶口結餘) (可輸入資料)</option>' +
                '<option lang="chi" group-id="4" value=14>個人資料使用指示</option>' +
                '<option lang="eng" group-id="4" class="d-none" value=15>Change of Investment Fund Instruction (for Future Contribution and/or Existing Account Balances) (electronic fillable)</option>' +
                '<option lang="eng" group-id="4" class="d-none" value=16>Fund Switching Instruction(for Existing Account Balance Only)(electronic fillable)' +
                '<option lang="eng" group-id="4" class="d-none" value=17>Instruction of Use of Personal Information</option>' +
                '</select>' +

                '</div>' +

                '</div>' +

                '<div class="d-flex mb-3 col-sm-12 ps-0">' +
                '<label class="d-flex col-sm-2 control-label ps-4 ">&nbsp;&nbsp;&nbsp;From</label>' +
                '<div class="col-sm-11 ps-2">' + companyName +
                '</div></div>' +

                '<div class="mb-3 col-sm-12 ps-0"><label for="sms-content" class="col-sm-2 control-label ps-4">&nbsp;&nbsp;&nbsp;Content</label>' +
                '<div class="col-sm-11 ps-2">' +
                '<textarea class="mt-3" id="sms-content" rows="3" cols="20" style="font-family:inherit;width:100%;" maxlength="500" onKeyUp="smsWordCount()"></textarea></textarea></div></div>' +
                '<div class="w-100"><span style="float:right;margin-right:30px;"><span id="sms-word-count" class="align-right">0/170</span>&nbsp;&nbsp;<span id="sms-msg-count">1</span>&nbsp;message(s)</span></div>' +
                +'</div></div>').appendTo('#reply-container');

            $('input[name="lang-rd-list"]').on('change', function () {
                event.preventDefault();
                var targetLang = $('input[name="lang-rd-list"]:checked').val();

                // 2nd lv change lang and set to default
                $('#tmp-2nd-lv').val('');
                var secondLvOpts = $('#tmp-2nd-lv option');
                secondLvOpts.removeClass('d-none');
                secondLvOpts.each(function () {
                    var langCode = $(this).attr('lang');
                    if (langCode != targetLang) {
                        $(this).addClass('d-none');
                    }
                });

                // 3rd lv hide & change language
                $('#tmp-3rd-lv').addClass('d-none');
                var thirdLvOpts = $('#tmp-3rd-lv option');
                thirdLvOpts.removeClass('d-none');
                // filter out non-targeted code
                thirdLvOpts.each(function () {
                    var langCode = $(this).attr('lang');
                    if (langCode != targetLang) {
                        $(this).addClass('d-none');
                    }
                });

            });

            $('#tmp-2nd-lv').on('change', function () {
                event.preventDefault();
                var templateVal = $(this).val();
                if (templateVal.length > 0) {
                    // no 3rd lv
                    if (templateVal < 4) {
                        $('#tmp-3rd-lv').addClass('d-none'); // no need to show 3rd lv
                        var templateContent = SMSTemplateArr[Number(templateVal)] || '';
                        // verfication code
                        if (templateVal == 0 || templateVal == 1) {
                            //var randomNo = Math.floor(100000 + Math.random() * 900000); // random 6 digit number
                            var randomNo = generateSecureRandomNumber(); // random 6 digit number
                            templateContent = templateContent.replace('123456', randomNo);
                        } else if (templateVal == 2 || templateVal == 3) { // webchat link

                            // year + agent id + case no
                            // str.toString(16) => to base 16
                            var today = new Date();

                            // the padStart() method in JavaScript is used to pad a string with another string until it reaches the given length. The padding is applied from the left end of the string.
                            var dd = String(today.getDate()).padStart(2, '0');
                            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                            var yy = today.getFullYear().toString().substr(-2);

                            var agentIdStr = String(loginId);

                            // slice(-2) extracts last 2 characters of the agentId, will not change original string
                            // agent id could not put before date, becuase if the number begins with 0, the 0 will disappear when toString(36)
                            // for same reason above, the eStr below will have error when year 20xx beomcs 210x
                            agentIdStr = agentIdStr.length == 1 ? ('0' + agentIdStr) : agentIdStr.slice(-2); // all agent single now, uncomment if double digits
                            var eStr = String(yy) + mm + dd + agentIdStr + String(internalCaseNo);
                            var b36Str = Number(eStr).toString(36);

                            if (templateVal == 2) {
                                templateContent = '易寶: 感謝聯絡我們。請點擊 https://www.commas.hk/webchat/client/index.html?m=test40&l=t&q=1&e=' + b36Str + ' 以線上對話與我們聯繫。服務時間 : 星期一至五上午9時至下午5時。';
                            } else if (templateVal == 3) {
                                templateContent = 'Epro: Thank you for contacting us. Please click https://www.commas.hk/webchat/client/index.html?m=test40&l=e&q=1&e=' + b36Str + ' to chat with us. Live agents are available from 9am to 5pm (Mon-Fri).';
                            }

                            // showing last month balance
                            // var now = new Date();
                            // var prevMonthLastDate = new Date(now.getFullYear(), now.getMonth(), 0);
                            // var date = prevMonthLastDate.getDate();
                            // var month = prevMonthLastDate.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
                            // var year = prevMonthLastDate.getFullYear().toString().substr(-2);
                            // if (date < 10) {
                            //     date = '0' + date;
                            // }
                            // if (month < 10) {
                            //     month = '0' + month;
                            // }
                            // var dateStr = date + "/" + month + "/" + year;
                            // templateContent = templateContent.replace('01/01/00', dateStr);
                        }
                        $('#sms-content').val(templateContent).focus();
                        smsWordCount();
                    } else { // set 3rd lv display
                        // get lang
                        $('#tmp-3rd-lv').val(''); // default empty
                        var targetLang = $('option:selected', this).attr('lang');
                        var targetGroup = $('option:selected', this).attr('group-id');

                        var thirdLvOpts = $('#tmp-3rd-lv option');
                        thirdLvOpts.removeClass('d-none');
                        // filter out non-targeted code
                        thirdLvOpts.each(function () {
                            var groupId = $(this).attr('group-id');
                            var langCode = $(this).attr('lang');
                            if (groupId != targetGroup || langCode != targetLang) {
                                $(this).addClass('d-none');
                            }
                        });
                        $('#tmp-3rd-lv').removeClass('d-none'); // show 3rd lv      
                    }
                } else {
                    $('#tmp-3rd-lv').addClass('d-none'); // no need to show 3rd lv
                }
            });
            $('#tmp-3rd-lv').on('change', function () {
                event.preventDefault();
                var templateVal = $(this).val();
                if (templateVal.length > 0) {
                    var templateContent = SMSTemplateArr[Number(templateVal)] || '';
                    $('#sms-content').val(templateContent).focus();
                    smsWordCount();
                }
            });
        }
        // Added reply section, so needed to resize
        resize();
        replyConfirmed = true;
    }
    $('textarea').keydown(function (e) {
        if (e.keyCode == 33 || e.keyCode == 34) {
            $(this).blur();
        }
    });
}

/* 20250530 
var loadCaseLog = function (initial) {
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/GetCaseLog',
        data: JSON.stringify({
            'Case_No': Number(caseNo),
            'Is_Valid': 'Y',
            Agent_Id: loginId,
            Token: token
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).always(function (res) {
        if (!/^success$/i.test(res.result || "")) {
            console.log("Error in loadCaseLog." + res ? res.details : '');
            resize();
        } else {
            var folowHistoryContent = res.details;


            //  var follolwupString = '';         // 20250415 Remove the declaration of the unused 'follolwupString' variable.
            $('<div id="case-log-container" class="card mt-5 mb-5">' +
                '<div class="card-header card-header-text card-header-info" data-bs-toggle="collapse" data-bs-target="#case-log-body">' +
                '<h5 class="mt-0 mb-0"><i class="fa fa-table card-header-icon"></i><span class="align-middle">' + langJson['l-form-case-log'] + '</span><span class="align-middle" style="color:darkblue;">&nbsp;&nbsp;(' + langJson['l-search-case-no'] + ':&nbsp;' + caseNo + ')</span></h5>' +
                '</div><div class="collapse show mt-1" id="case-log-body">' + '<div class="card-body">' +
                '<table class="table table-hover" style="width:100%" id="case-log-table" data-page-length=' + caseLogLength + '></div></div></div>').insertAfter('#customer-table');
            var caseLogTable = $('#case-log-table').DataTable({
                data: folowHistoryContent,
                //lengthChange: false,      //20250401 duplicate name
                aaSorting: [
                    [1, 'desc']
                ],
                lengthChange: false,
                searching: false,
                initComplete: function (settings, json) {
                    resize(true);
                },
                columns: [{
                    title: langJson['l-form-open']
                }, {
                    title: langJson['l-form-last-revision'],
                    data: 'Updated_Time'
                },
                {
                    title: langJson['l-search-inbound-type'],
                    data: "Call_Type"
                }, {
                    title: langJson['l-form-inbound-details'],
                    data: "Type_Details"
                }, {
                    title: langJson['l-form-details'],
                    data: "Details",
                    className: 'case-log-details-min-width'
                }, {
                    title: langJson['l-form-outbound-type'],
                    data: "Reply_Type"
                }, {
                    title: langJson['l-form-outbound-details'],
                    data: "Reply_Details"
                }, {
                    title: langJson['l-form-status'],
                    data: "Status"
                },
                ],
                "language": {
                    "emptyTable": langJson['l-general-empty-table'],
                    "info": langJson['l-general-info'],
                    "infoEmpty": langJson['l-general-info-empty'],
                    "infoFiltered": langJson['l-general-info-filtered'],
                    "lengthMenu": langJson['l-general-length-menu'],
                    "search": langJson['l-general-search-colon'],
                    "zeroRecords": langJson['l-general-zero-records'],
                    "paginate": {
                        "previous": langJson['l-general-previous'],
                        "next": langJson['l-general-next']
                    }
                },
                columnDefs: [{
                    targets: 0,
                    render: function (data, type, row) {
                        return '<i title="Details" class="table-btn fas fa-search-plus open"></i>';
                    },
                    orderable: false,
                    className: 'btnColumn'
                }, {
                    targets: 1,
                    render: function (data, type, row) {
                        var newData = data.replace(/T/g, " "); // var newData = data.replace(/[T]/g, " ");        // 20250409 Replace this character class by the character itself.
                        var indexOfDot = newData.indexOf('.');
                        if (indexOfDot > -1) {
                            return newData.slice(0, indexOfDot);
                        } else {
                            return newData;
                        }
                    }
                }, {
                    targets: 2,
                    render: function (data, type, row) {
                        if (data && data.length > 0) {
                            return data.replace('Inbound_', '');
                        } else {
                            return '&nbsp;&nbsp;-&nbsp;&nbsp;';
                        }
                    }
                }, {
                    targets: 5,
                    render: function (data, type, row) {
                        if (data && data.length > 0) {
                            return data.replace('Outbound_', '');
                        } else {
                            return '&nbsp;&nbsp;-&nbsp;&nbsp;';
                        }
                    }
                }, {
                    targets: -1,
                    render: function (data, type, row) {
                        var escalatedTo = row.Escalated_To;
                        if (escalatedTo != null) {
                            return 'Escalated to ' + '<span style="color:green">' + getAgentName(escalatedTo) + ' (ID: ' + escalatedTo + ')<span>'
                        } else {
                            return data
                        }
                    }
                }]
            });
            $('#case-log-table tbody').on('click', 'tr', function (e) {
                caseLogTable.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
                $(this).addClass('highlight')
            });
            $('#case-log-table tbody').on('click', '.open', function () {
                var data = caseLogTable.row($(this).parents('tr')).data();
                selectedCaseLog = data;
                var openWindows = parent.parent.openWindows;
                caseRecordPopup = window.open('./caseRecordPopup.html', 'caseRecord', 'menubar=no,location=no,resizable=no,scrollbar=no,fullscreen=no,toolbar=no,status=no,width=800,height=740,top=200,left=20'); // 2nd properties '_blank' will open new window, if have name('caseRecord'), will refresh the same
                if (openWindows) {
                    openWindows[openWindows.length] = caseRecordPopup;
                    caseRecordPopup.onload = function () {
                        caseRecordPopup.onbeforeunload = function () {
                            for (var i = 0; i < openWindows.length; i++) {
                                if (openWindows[i] == caseRecordPopup) {
                                    openWindows.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    }
                }
            });
        }
    });
}
*/
// refactored loadCaseLog function 
var loadCaseLog = function (initial) {
    $.ajax({
        type: "POST",
        url: config.companyUrl + '/api/GetCaseLog',
        data: JSON.stringify({
            'Case_No': Number(caseNo),
            'Is_Valid': 'Y',
            Agent_Id: loginId,
            Token: token
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).always(function (res) {
        if (!/^success$/i.test(res.result || "")) {
            console.log("Error in loadCaseLog." + (res ? res.details : ''));
			resize();
        } else {
            var followHistoryContent = res.details;
            createCaseLogContainer();
			var caseLogTable = initializeDataTable(followHistoryContent);
			attachTableEventHandlers(caseLogTable);
        }
    });
};

function createCaseLogContainer() {
    $('<div id="case-log-container" class="card mt-5 mb-5">' +
        '<div class="card-header card-header-text card-header-info" data-bs-toggle="collapse" data-bs-target="#case-log-body">' +
        '<h5 class="mt-0 mb-0"><i class="fa fa-table card-header-icon"></i><span class="align-middle">' + langJson['l-form-case-log'] + '</span><span class="align-middle" style="color:darkblue;">  (' + langJson['l-search-case-no'] + ': ' + caseNo + ')</span></h5>' +
        '</div><div class="collapse show mt-1" id="case-log-body">' +
        '<div class="card-body">' +
        '<table class="table table-hover" style="width:100%" id="case-log-table" data-page-length=' + caseLogLength + '></table>' +
        '</div></div></div>').insertAfter('#customer-table');
}

function initializeDataTable(data) {
    return $('#case-log-table').DataTable({
        data: data,
        aaSorting: [[1, 'desc']],
        lengthChange: false,
        searching: false,
        initComplete: function (settings, json) {
            resize(true);
        },
        columns: getTableColumns(),
        language: getLanguageSettings(),
        columnDefs: getColumnDefinitions()
    });
}

function getTableColumns() {
    return [
        { title: langJson['l-form-open'] },
        { title: langJson['l-form-last-revision'], data: 'Updated_Time' },
        { title: langJson['l-search-inbound-type'], data: "Call_Type" },
        { title: langJson['l-form-inbound-details'], data: "Type_Details" },
        { title: langJson['l-form-details'], data: "Details", className: 'case-log-details-min-width' },
        { title: langJson['l-form-outbound-type'], data: "Reply_Type" },
        { title: langJson['l-form-outbound-details'], data: "Reply_Details" },
        { title: langJson['l-form-status'], data: "Status" }
    ];
}

function getLanguageSettings() {
    return {
        "emptyTable": langJson['l-general-empty-table'],
        "info": langJson['l-general-info'],
        "infoEmpty": langJson['l-general-info-empty'],
        "infoFiltered": langJson['l-general-info-filtered'],
        "lengthMenu": langJson['l-general-length-menu'],
        "search": langJson['l-general-search-colon'],
        "zeroRecords": langJson['l-general-zero-records'],
        "paginate": {
            "previous": langJson['l-general-previous'],
            "next": langJson['l-general-next']
        }
    };
}

function getColumnDefinitions() {
    return [
        {
            targets: 0,
            render: function (data, type, row) {
                return '<i title="Details" class="table-btn fas fa-search-plus open"></i>';
            },
            orderable: false,
            className: 'btnColumn'
        },
        {
            targets: 1,
            render: function (data) {
                var newData = data.replace(/T/g, " ");
                var indexOfDot = newData.indexOf('.');
                return indexOfDot > -1 ? newData.slice(0, indexOfDot) : newData;
            }
        },
        {
            targets: 2,
            render: function (data) {
                return data && data.length > 0 ? data.replace('Inbound_', '') : '  -  ';
            }
        },
        {
            targets: 5,
            render: function (data) {
                return data && data.length > 0 ? data.replace('Outbound_', '') : '  -  ';
            }
        },
        {
            targets: -1,
            render: function (data, type, row) {
                var escalatedTo = row.Escalated_To;
                if (escalatedTo != null) {
                    return 'Escalated to ' + '<span style="color:green">' + getAgentName(escalatedTo) + ' (ID: ' + escalatedTo + ')<span>';
                } else {
                    return data;
                }
            }
        }
    ];
}

function attachTableEventHandlers(caseLogTable) {
    $('#case-log-table tbody').on('click', 'tr', function () {
        caseLogTable.$('tr.highlight').removeClass('highlight');
        $(this).addClass('highlight');
    });

    $('#case-log-table tbody').on('click', '.open', function () {
        var data = caseLogTable.row($(this).parents('tr')).data();
        handleOpenCaseRecord(data);
    });
}

function handleOpenCaseRecord(data) {
    selectedCaseLog = data;
    var openWindows = parent.parent.openWindows;
    caseRecordPopup = window.open('./caseRecordPopup.html', 'caseRecord', 'menubar=no,location=no,resizable=no,scrollbar=no,fullscreen=no,toolbar=no,status=no,width=800,height=740,top=200,left=20');

    if (openWindows) {
        openWindows[openWindows.length] = caseRecordPopup;
        caseRecordPopup.onload = function () {
            caseRecordPopup.onbeforeunload = function () {
                for (var i = 0; i < openWindows.length; i++) {
                    if (openWindows[i] == caseRecordPopup) {
                        openWindows.splice(i, 1);
                        break;
                    }
                }
            };
        };
    }
}

function getAgentName(agentId) {
    // Placeholder: Implement your logic to get agent name by ID
    return "AgentName"; // Example placeholder
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

//2025-03-06 for replacing math.random 
function generateSecureRandomNumber() {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    const randomNumber = 100000 + (randomBuffer[0] % 900000); // Scale to 6 digits
    return randomNumber;
}


// Load after html ready
function windowOnload() {
    customerData = parent.customerData || null;
    // var inheritAll = customerData && customerData.inheritAll ? customerData.inheritAll : false;
    //isManualUpdate = customerData != undefined && customerData.Case_Is_Valid == 'Y' && customerData.Conn_Id == connId && customerData.Ticket_Id == ticketId ? true : false;   // 20250320 Unnecessary use of boolean literals in conditional expression.
    isManualUpdate = customerData != undefined && customerData.Case_Is_Valid == 'Y' && customerData.Conn_Id == connId && customerData.Ticket_Id == ticketId;
    updateCaseObj.Conn_Id = isManualUpdate ? null : connId;



    //20250320 Unexpected constant truthiness on the left-hand side of a `||` expression.
    //caseLogLength = sessionStorage.getItem('scrmCaseLogLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5 || 5;
    caseLogLength = sessionStorage.getItem('scrmCaseLogLength') != 'NaN' || sessionStorage.getItem('scrmCaseLength') != null ? Number(sessionStorage.getItem('scrmCaseLength')) : 5;

    document.getElementById('ip-agent-name').innerHTML = agentName;
    setCustomerInfo();

    //20250113 for auto update phone when create phone number
    //status update when openInputForm  
    //if (parent.parent[3].callTypeAfteropenForm != undefined) {  //detect it is in case create		20250729 fix the checking
	if (parent.parent[3].callTypeAfteropenForm) {  //detect it is in case create

        if (parent.parent[3].callTypeAfteropenForm == "Inbound_Whatsapp") {
            if (parent.parent[3].rowDataAfteropenForm == null)	//use this to check whether it is new case
            {
                // parent.parent[3]
                // parent.$('#social-media-main')[0].

                if (parent.parent[3].chatService != null)	// check chatService is loaded
                {
                    var selectTicketId = parent.parent[3].chatService.selectedTicketId;
                    //parent.$('#phone-panel')[0]
                    //parent.parent.$('#phone-panel')[0];
                    var sTicket = parent.parent.$('#phone-panel')[0].contentWindow.AssignedTicketList.filter(i => i.TicketId == selectTicketId)[0];

                    var sPhone = sTicket.EndUserPhone;
                    var firstThree = sTicket.EndUserPhone.substring(0, 3);
                    if (firstThree === "852") {
                        sPhone = sPhone.substring(3);
                    }
                    $('#Mobile_No').val(sPhone);
                }
            }
        }
    }

    // Set basic info
    // document.getElementById('customer-id').innerHTML = customerId;
    // document.getElementById('customer-id-title').innerHTML = customerId;
    // // Set customer info
    // var Mobile_No = '';
    // var Other_Phone_No = '';
    // var Fax_No = '';
    // var Email = '';
    // var Name_Eng = '';
    // var Title = '';
    // var Lang = '';
    // if (type != 'newCustomer') {
    //     disableMode = true;
    // }
    // if (customerData && customerData.disableMode != undefined) {
    //     disableMode = customerData.disableMode
    // }
    // if (disableMode) {
    //     $('.edit-field').prop('disabled', true);
    //     $('#edit-save-btn').html('<i class="fa fa-edit me-2"></i><span>' + langJson['l-form-edit'] + '</span>');
    // }
    // if (customerData != undefined) {
    //     // Get specific data
    //     Name_Eng = customerData.Name_Eng || '';
    //     Title = customerData.Title || '';
    //     Lang = customerData.Lang || '';
    //     Mobile_No = customerData.Mobile_No || '';
    //     Other_Phone_No = customerData.Other_Phone_No || '';
    //     Fax_No = customerData.Fax_No || '';
    //     Email = customerData.Email || '';
    //     // Update basic field
    //     document.getElementById('Title').value = Title;
    //     document.getElementById('Lang').value = customerData.Lang || '';
    //     document.getElementById('Name_Eng').value = Name_Eng;
    //     document.getElementById('Address1').value = customerData.Address1 || '';
    //     if (customerData.Agree_To_Disclose_Info == 'Y') {
    //         $('#Agree_To_Disclose_Info').prop('checked', true);
    //     }
    //     // Get Photo
    //     $.ajax({
    //         url: config.companyUrl + '/api/GetPhoto',
    //         type: "POST",
    //         data: JSON.stringify({
    //             "Customer_Id": customerId,
    //             Agent_Id: loginId,
    //             Token: token
    //         }),
    //         crossDomain: true,
    //         contentType: "application/json",
    //         dataType: 'json',
    //         success: function (res) {
    //             var details = res.details;
    //             if (!/^success$/i.test(res.result || "")) {
    //                 // when customer have no photo will have this error, too common, so no need to write console
    //                 if (details != '值不能為 null。\r\n參數名稱: inArray') {
    //                     console.log("Error in GetPhoto");
    //                     console.log(res);
    //                 }
    //             } else {
    //                 var photo = document.getElementById('profile-pic');
    //                 var photoSrcString = "data:" + details.Photo_Type + ";base64," + details.Photo_Content;
    //                 photo.src = photoSrcString;
    //                 photoSrc = photoSrcString; // if uploaded a wrong photo need this to resotore to the original
    //             }
    //         },
    //         error: function (err) {
    //             console.log(err);
    //         }
    //     });
    // }
    // var _Mobile_No = document.getElementById('Mobile_No');
    // var _Other_Phone_No = document.getElementById('Other_Phone_No');
    // var _Fax_No = document.getElementById('Fax_No');
    // var _Email = document.getElementById('Email');
    // // a tag fields
    // var tMobile = document.getElementById('tMobile_No')
    // var tOther_Phone_No = document.getElementById('tOther_Phone_No');
    // var tFax_No = document.getElementById('tFax_No');
    // var tEmail = document.getElementById('tEmail');
    // // Update editable text field
    // _Mobile_No.value = Mobile_No;
    // _Other_Phone_No.value = Other_Phone_No;
    // _Fax_No.value = Fax_No;
    // _Email.value = Email;

    // var mobileStyle = 'none';
    // var otherStyle = 'none';
    // var faxStyle = 'none';
    // var emailStyle = 'none';
    // var newMobile = Mobile_No;
    // if (Mobile_No != null && Mobile_No.length > 0) {
    //     mobileStyle = 'inline-block';
    // } else {
    //     newMobile = ' ';
    // }

    // $('<span style="display:' + mobileStyle + ';" name="sms" class="cMobile_No" id="reply-sms-mobile-container"><div class="form-check me-2"><label class="form-check-label"><input type="checkbox" class="form-check-input reply-checkbox sms-list dial-yes-disable" value="' + Mobile_No + '" id="oSmsMobile_No">' + newMobile + '<span class="form-check-sign"><span class="check"></span></span></label></div></span>').insertBefore('#sms-other-container');
    // $('<span style="display:' + mobileStyle + ';" name="call" class="cMobile_No" id="reply-call-mobile-container"><div class="form-check ms-2"><label class="form-check-label"><input type="radio" name="callList" class="form-check-input reply-checkbox call-list dial-yes-disable" onchange="replyCallChanged(this)" value="' + Mobile_No + '" id="oCallMobile_No">' + newMobile + '<span class="circle"><span class="check"></span></span></label></div></span>').insertBefore('#call-other-container');

    // var newOther = Other_Phone_No;
    // if (Other_Phone_No != null && Other_Phone_No.length > 0) {
    //     otherStyle = 'inline-block';
    // } else {
    //     newOther = ' ';
    // }
    // $('<span style="display:' + otherStyle + ';" name="sms" class="cOther_Phone_No" id="reply-sms-other-container"><div class="form-check"><label class="form-check-label"><input type="checkbox" class="form-check-input reply-checkbox sms-list dial-yes-disable" value="' + Other_Phone_No + '" id="oSmsOther_Phone_No">' + newOther + '<span class="form-check-sign"><span class="check"></span></span></label></div></span>').insertBefore('#sms-other-container');
    // $('<span style="display:' + otherStyle + ';" name="call" class="cOther_Phone_No" id="reply-call-other-container"><div class="form-check ms-2"><label class="form-check-label"><input type="radio" name="callList" class="form-check-input reply-checkbox call-list dial-yes-disable" onchange="replyCallChanged(this)" value="' + Other_Phone_No + '" id="oCallOther_Phone_No">' + newOther + '<span class="circle"><span class="check"></span></span></label></div></span>').insertBefore('#call-other-container');
    // var newFax = Fax_No;
    // if (Fax_No != null && Fax_No.length > 0) {
    //     faxStyle = 'inline-block';
    // } else {
    //     newFax = ' ';
    // }
    // $('<span style="display:' + faxStyle + ';" name="fax" class="cFax_No" id="reply-fax-container"><div class="form-check"><label class="form-check-label"><input type="checkbox" class="form-check-input reply-checkbox fax-list dial-yes-disable" value="' + Fax_No + '" id="oFax_No">' + newFax + '<span class="form-check-sign"><span class="check"></span></span></label></div></span>').insertBefore('#fax-other-container');
    // var newEmail = Email;
    // if (Email != null && Email.length > 0) {
    //     emailStyle = 'inline-block';
    // } else {
    //     newEmail = ' ';
    // }
    // $('<span style="display:' + emailStyle + ';" name="email" id="reply-email-container"><div class="form-check"><label class="form-check-label"><input id="oEmail" class="form-check-input reply-checkbox email-list dial-yes-disable" type="checkbox" value="' + Email + '">' + newEmail + '<span class="form-check-sign"><span class="check"></span></span></label></div></span>').insertBefore('#email-other-container');

    // // ==================== TYPE: NEW FOLLOW ====================
    // var escalatedTo = customerData != null ? customerData.Escalated_To : null;
    // if (type == 'newUpdate' && escalatedTo != null && escalatedTo != loginId) {
    //     outsider = true; // default outsider is false
    // } else {
    //     $("#case-status").append('<option class="to-be-removed" value="Closed">Closed</option><option class="to-be-removed" value="Escalated">Escalated</option>');
    // }
    // if (type == 'newUpdate') {
    //     // Fill in case details
    //     if (customerData != undefined) {
    //         document.getElementById('case-nature').value = customerData.Call_Nature || '';
    //     }
    //     $("#reply-none").prop("checked", true).trigger("click");
    // } else {
    //     if (type == 'newCustomer') {
    //         if (callType == 'Inbound_Email') {
    //             _Email.value = details;
    //         } else if (callType == 'Inbound_Fax') {
    //             _Fax_No.value = details;
    //         } else if (callType == 'Inbound_Call' || callType == 'Inbound_Voicemail') {
    //             var firstChar = details.charAt(0);
    //             if (firstChar == 5 || firstChar == 6 || firstChar == 7 || firstChar == 8 || firstChar == 9) {
    //                 _Mobile_No.value = details;
    //             } else {
    //                 _Other_Phone_No.value = details;
    //             }
    //         } else if (callType == 'Inbound_Webchat') {
    //             var detailsArr = details.split(',');
    //             if (details.length > 0) {
    //                 $.ajax({
    //                     type: "POST",
    //                     url: config.companyUrl + '/api/GetFields',
    //                     data: JSON.stringify({
    //                         "listArr": ["Webchat Fields"],
    //                         Agent_Id: loginId,
    //                         Token: token
    //                     }),
    //                     crossDomain: true,
    //                     contentType: "application/json",
    //                     dataType: 'json'
    //                 }).always(function (r) {
    //                     var rDetails = r.details;
    //                     if (!/^success$/i.test(r.result || "")) {
    //                         console.log('error: ' + rDetails);
    //                     } else {
    //                         if (rDetails != undefined) {
    //                             var webchatFields = rDetails['Webchat Fields'];
    //                             for (let theFieldStr of detailsArr) {
    //                                 var fieldNameValueArr = theFieldStr.split(':');
    //                                 var fieldName = fieldNameValueArr[0];
    //                                 var fieldValue = fieldNameValueArr[1] || '';
    //                                 if (fieldValue != null && fieldValue.length > 0) {
    //                                     for (let theField of webchatFields) {
    //                                         if (fieldName == theField.Field_Name) {
    //                                             var dbColumnName = theField.Field_Display;
    //                                             if (dbColumnName == 'Name_Eng') {
    //                                                 document.getElementById('Name_Eng').value = fieldValue;
    //                                             } else if (dbColumnName == 'All_Phone_No') {
    //                                                 var firstChar = fieldValue.charAt(0);
    //                                                 if (firstChar == 5 || firstChar == 6 || firstChar == 7 || firstChar == 8 || firstChar == 9) {
    //                                                     _Mobile_No.value = fieldValue;
    //                                                 } else {
    //                                                     _Other_Phone_No.value = fieldValue;
    //                                                 }
    //                                             } else if (dbColumnName == 'Email') {
    //                                                 _Email.value = fieldValue;
    //                                             }
    //                                             break;
    //                                         }
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 });
    //             }
    //             //  else {

    //             //     // by logic now if have details will not has qr code, vice versa
    //             //     var isQrCode = window.frameElement.getAttribute("qrcode") || '';
    //             //     if (isQrCode && isQrCode == 'true') {
    //             //         document.getElementById('Name_Eng').value = 'QRCode_' + ticketId;
    //             //     }
    //             // }

    //             // if scan by qr code and new customer the name will change
    //             if (type == 'newCustomer') {

    //                 $('#Name_Eng').val('QRCode_' + ticketId);

    //                   // open From Incomplete Cases
    //                   var theLang = '';
    //                   if (isSocial) {
    //                     theLang = window.frameElement.getAttribute("lang") || '';
    //                   } else {
    //                     var indexOfLang = details.indexOf('Language:');
    //                     if (indexOfLang > -1) {
    //                         var indexOfNextComma = details.indexOf(',', indexOfLang);
    //                         if (indexOfNextComma == -1) {

    //                             // 5 is the length of 'Language:'
    //                             theLang = details.slice(indexOfLang + 9) || '';
    //                         } else {
    //                             theLang = details.slice((indexOfLang + 9), indexOfNextComma) || '';
    //                         }
    //                     }

    //                   }

    //                 if (theLang.length > 0) {

    //                     // if has that language select it
    //                     if (theLang == 'English') {
    //                         $('#Lang').val('English');
    //                     } else if (theLang == '繁體中文') {
    //                         $('#Lang').val('Cantonese');
    //                     } else if (theLang == '简体中文') {
    //                         $('#Lang').val('Mandarin');
    //                     } else if (theLang == '日文') {
    //                         $('#Lang').val('Japanese');
    //                     } else if (theLang == '韩文') {
    //                         $('#Lang').val('Others');
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    // // load Escalate To dropdown
    // for (let option of agentList) {
    //     var theAgentId = option.AgentID;
    //     $("#case-escalated").append('<option LevelID=' + option.LevelID + ' value=' + theAgentId + '>' + option.AgentName + ' (ID: ' + theAgentId + ')</option>');
    // }
    // if (inheritAll) {
    //     document.getElementById('case-details').value = customerData.Details || '';
    //     if (outsider) {
    //         document.getElementById('case-status').value = 'Follow-up Required';
    //     } else {
    //         if (escalatedTo != null) {
    //             document.getElementById('case-status').value = 'Escalated';
    //         } else {
    //             document.getElementById('case-status').value = customerData.Status || '';
    //         }
    //     }
    //     if (customerData != undefined && customerData.Escalated_To != null) {
    //         document.getElementById('case-escalated').value = customerData.Escalated_To;
    //         if (!outsider) {
    //             document.getElementById('case-escalated-container').style.display = 'inherit';
    //         }
    //     }
    // }
    // if (type == 'newUpdate') {
    //     loadCaseLog(true);
    // }

    // // if call from incomplete call cases and reply type is outbound call
    // if (winReplyConnId.length > 0 && winReplyDetails.length > 0) {

    //     // set reply channel: call
    //     $("#reply-call").prop("checked", true).trigger("click");

    //     // Set update case obj
    //     updateCaseObj.Reply_Type = 'Outbound_Call';
    //     updateCaseObj.Reply_Conn_Id = String(winReplyConnId);
    //     updateCaseObj.Reply_Details = winReplyDetails;

    //     // set phone number
    //     if (winReplyDetails == Mobile_No) {
    //         $("#oCallMobile_No").prop("checked", true).trigger("click");
    //     } else if (winReplyDetails == Other_Phone_No) {
    //         $("#oCallOther_Phone_No").prop("checked", true).trigger("click");
    //     } else {
    //         $("#call-other-check").prop("checked", true).trigger("click");
    //         $("#call-other-input").attr("value", winReplyDetails);
    //     }
    //     dialYesClicked(true);
    // } else {
    //     $("#reply-none").prop("checked", true).trigger("click");
    // }

    // var customerOnlyAttr = window.frameElement.getAttribute("customer-only");
    // if (customerOnlyAttr != undefined && customerOnlyAttr == 'true') {
    //     customerOnly = true;
    //     showCustomerSectionOnly();
    // }
    // // ================ GET NATIONALITY, MARKET AND PROFILE ================
    // if (nationalityArr.length == 0) {
    //     var language = sessionStorage.getItem('scrmLanguage') ? sessionStorage.getItem('scrmLanguage').toLowerCase() : 'EN';
    //     $.ajax({
    //         type: "POST",
    //         url: config.companyUrl + '/api/GetNationalityMarketProfile',
    //         crossDomain: true,
    //         contentType: "application/json",
    //         data: JSON.stringify({ Lang: language, Agent_Id: loginId, Token: token }),
    //         dataType: 'json'
    //     }).always(function (r) {
    //         var rDetails = r.details || '';
    //         if (!/^success$/i.test(r.result || "")) {
    //             console.log('error: ' + rDetails ? rDetails : r);
    //         } else {
    //             nationalityArr = rDetails.NationalityArray;
    //             marketArr = rDetails.MarketArray;
    //             profileArr = rDetails.ProfileArray;
    //             sessionStorage.setItem('scrmNationalityArr', JSON.stringify(nationalityArr));
    //             sessionStorage.setItem('scrmMarketArr', JSON.stringify(marketArr));
    //             sessionStorage.setItem('scrmProfileArr', JSON.stringify(profileArr));
    //             addAreaOptions(customerData);
    //         }
    //     });
    // } else {
    //     addAreaOptions(customerData);
    // }
    // // System tools add section
    // if (openType == 'traditional' && haveSystemTools) {
    //     var parentDoc = parent.document;
    //     if (callType == 'Inbound_Email') {
    //         if ($('#repeated-customer-header', window.parent.document).css('display') == 'inline') {
    //             var repeatedCustomer = $('#repeated-customer');
    //             repeatedCustomer.prop('checked', true);
    //             var theRemark = parentDoc.getElementById('repeated-customer-header').title || '';
    //             $('#repeated-customer-remarks').val(theRemark); //.prop('disabled', true);
    //             updatedCustomerData["Repeated_Customer_Remarks"] = theRemark;
    //         }
    //         if ($('#difficult-customer-header', window.parent.document).css('display') == 'inline') {
    //             var difficultCustomer = $('#difficult-customer')
    //             difficultCustomer.prop('checked', true);
    //             var theRemark = parentDoc.getElementById('difficult-customer-header').title || '';
    //             $('#difficult-customer-remarks').val(theRemark);
    //             updatedCustomerData["Difficult_Customer_Remarks"] = theRemark;
    //         }
    //     } else if (callType == 'Inbound_Call' || callType == 'Inbound_Fax' || callType == 'Inbound_Voicemail') {
    //         if ($('#repeated-caller-header', window.parent.document).css('display') == 'inline') {
    //             var repeatedCaller = $('#repeated-caller');
    //             repeatedCaller.prop('checked', true);
    //             var theRemark = parentDoc.getElementById('repeated-caller-header').getAttribute('data-original-title') || '';
    //             $('#repeated-caller-remarks').val(theRemark); //.prop('disabled', true);
    //             updatedCustomerData["Repeated_Caller_Remarks"] = theRemark;
    //         }
    //         if ($('#difficult-caller-header', window.parent.document).css('display') == 'inline') {
    //             var difficultCaller = $('#difficult-caller')
    //             difficultCaller.prop('checked', true);
    //             var theRemark = parentDoc.getElementById('difficult-caller-header').getAttribute('data-original-title') || '';
    //             $('#difficult-caller-remarks').val(theRemark); //.prop('disabled', true);
    //             updatedCustomerData["Difficult_Caller_Remarks"] = theRemark;
    //         }
    //     }
    // }
    // resize(true);
    if (caseNo != -1) {
        $('#scheduled-reminder').show();
        $('#form-print-btn').show();
        $('#export-word-btn').show();
        // if ($('#case-no-span').length == 0) {
        //     $('<span id="case-no-span" class="ms-3"><label class="mt-3">' + langJson['l-search-case-no'] + ':</label>&nbsp;' + caseNo + '</span>').insertAfter($('#customer-id'));
        //     var exprtWordStr = '<button class="float-end btn btn-circle btn-warning d-print-none" onclick="exportCustDoc()" title=" ' +
        //     langJson['l-form-exoprt-word']
        //     +' " onclick="scheduleClick();"><i class="fas fa-file-word"></i></button>';
        //     $(exprtWordStr).insertBefore($('#scheduled-reminder'));
        //     // $('<i class="float-end fas fa-file-word word-icon" title="Export to MS Word" onclick="exportCustDoc()"></i>').insertBefore($('#scheduled-reminder'));
        //     // $('<i class="fas fa-file-word word-icon" title="Export to MS Word" onclick="exportCaseDoc()"></i>').insertAfter($('#case-details-title'));
        // }
    }
    // Add send WA reply
    var functions = sessionStorage.getItem('scrmFunctions') || '';
    var canSendWA = (functions.indexOf('Form-WA-TP') != -1) || false;
    if (canSendWA) {
        var waRadioStr = '<div class="form-check ms-3">' +
            '<label class="form-check-label">' +
            '<input class="form-check-input dial-yes-disable" onclick="replyChannelChange(this)"" type="radio" id="reply-sms" name="replyList" value="wa">WhatsApp' +
            '&nbsp;<span class="circle">' +
            '<span class="check"></span></span></label></div>';
        $('#reply-radio-group').append(waRadioStr);
    }
}
// WindowOnload end
function addAreaOptions(customerData) {
    for (let nationOpt of nationalityArr) {
        $('#Nationality_Id').append('<option value=' + nationOpt.NationalityID + ' market-id=' + nationOpt.MarketID + ' profile-id=' + nationOpt.ProfileID + ' >' + nationOpt.NationalityName + '</option>');
    }

    for (let marketOpt of marketArr) {
        $('#Market_Id').append('<option value=' + marketOpt.MarketID + '>' + marketOpt.MarketName + '</option>');
    }

    for (let profileOpt of profileArr) {
        $('#Profile_Id').append('<option value=' + profileOpt.ID + '>' + profileOpt.Profile + '</option>');
    }
    if (customerData != undefined) {
        document.getElementById('Nationality_Id').value = customerData.Nationality_Id || '';
        document.getElementById('Market_Id').value = customerData.Market_Id || '';
        document.getElementById('Profile_Id').value = customerData.Profile_Id || '';
    } else if (type == 'newCustomer') { // after loaded all nationarlity, see should we fill in the nationality
        var theNationality = '';
        if (callType == 'Inbound_Webchat') {
            if (isSocial) {
                theNationality = window.frameElement.getAttribute("location") || '';
            } else {
                // open From Incomplete Cases
                var indexOfNationality = details.indexOf('Country:');
                if (indexOfNationality > -1) {
                    var indexOfNextComma = details.indexOf(',', indexOfNationality);
                    if (indexOfNextComma == -1) {

                        // 8 is the length of 'Country:'
                        theNationality = details.slice(indexOfNationality + 8) || '';
                    } else {
                        theNationality = details.slice((indexOfNationality + 8), indexOfNextComma) || '';
                    }
                }
            }
            if (theNationality.length > 0) {
                switch (theNationality) {
                    case 'South Korea':
                        $('#Nationality_Id').val(47);
                        $('#Nationality_Id').change();
                        break;
                    case 'Japan':
                        $('#Nationality_Id').val(26);
                        $('#Nationality_Id').change();
                        break;
                    case 'Taiwan':
                        $('#Nationality_Id').val(52);
                        $('#Nationality_Id').change();
                        break;
                    case 'China':
                        $('#Nationality_Id').val(12);
                        $('#Nationality_Id').change();
                        break;
                    case 'Australia':
                        $('#Nationality_Id').val(5);
                        $('#Nationality_Id').change();
                        break;
                    case 'U.K.':
                        $('#Nationality_Id').val(55);
                        $('#Nationality_Id').change();
                        break;
                    case 'U.S.A.':
                        $('#Nationality_Id').val(56);
                        $('#Nationality_Id').change();
                        break;
                    default:
                        break;
                }
            }
        }
    }
}

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

function callOnkeydown(e) { // if pressed Enter, equal pressed Dial button
    if (e.keyCode == 13) {

        e.preventDefault();
        replySubmitClicked();
        return false;
    }
}

function updateClicked(isTemp) {
    // VerifyEmail
    var email = document.getElementById('Email').value || ''
    if (email.length > 0 && !gf.verifyIsEmailValid(email)) {
        alert('Email is invalid');
        $('#Email').focus();
        return;
    }
    var title = document.getElementById('Title').value || ''
//	20250520 Extract this nested ternary operation into an independent statement.
//  var gender = title.length > 0? (title == 'Mr'? 'Male' : 'Female'): ''
	var gender;

	if (title.length > 0) {
		if (title === 'Mr') {
			gender = 'Male';
		} else {
			gender = 'Female';
		}
	} else {
		gender = '';
	}

    // Update customer
    var Customer_Data = {
        Title: title,
        Gender: gender,
        Lang: document.getElementById('Lang').value || '',
        Name_Eng: document.getElementById('Name_Eng').value || '',
        Mobile_No: document.getElementById('Mobile_No').value || '',
        Other_Phone_No: document.getElementById('Other_Phone_No').value || '',
        Fax_No: document.getElementById('Fax_No').value || '',
        Email: email,
        Address1: document.getElementById('Address1').value || '',
        Nationality_Id: document.getElementById('Nationality_Id').value == '' ? null : document.getElementById('Nationality_Id').value,
        Market_Id: document.getElementById('Market_Id').value == '' ? null : document.getElementById('Market_Id').value,
        Profile_Id: document.getElementById('Profile_Id').value == '' ? null : document.getElementById('Profile_Id').value,
        Agree_To_Disclose_Info: document.getElementById('Agree_To_Disclose_Info').checked ? 'Y' : 'N'
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
    // Verify name cannot which cannot be blank
    if (Customer_Data.Name_Eng.length == 0) {
        alert(langJson['l-alert-no-full-name']);
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
            alert(langJson['l-alert-save-customer-failed']);
        } else {
            // Turn to disable mode
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
                }
               //var replyChoice = document.getElementById('.' + '_edit');  //20250416 Remove the declaration of the unused 'fileUploadFiles' variable.
                if (value != null && value.length > 0) {
                    $('.c' + fieldId).show();
                } else {
                    $('.c' + fieldId).hide();
                }
            }
        }
    });
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
    $('#customer-id-section').hide();
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

function longCallChanged(oThis) {
    if ($(oThis).prop('checked')) {
        $('#Long_Call_Reason').prop('disabled', false);
    } else {
        $('#Long_Call_Reason').val('').prop('disabled', true);
    }
}

function returnToSearch() {
    parent.returnToSearch(ticketId || connId);
}

$(document).ready(function () {
    setLanguage();

    //if (parent.parent && parent.parent.iframeRecheck) {		//20250516 Prefer using an optional chain expression instead, as it's more concise and easier to read.
    //    parent.parent.iframeRecheck($(parent.document));
    //} else if (parent.parent.parent && parent.parent.parent.iframeRecheck) {
    //    parent.parent.parent.iframeRecheck($(parent.document));
    //}
	parent.parent?.iframeRecheck?.($(parent.document)) || 
	parent.parent?.parent?.iframeRecheck?.($(parent.document));

    $('textarea').keydown(function (e) {
        if (e.keyCode == 33 || e.keyCode == 34) {
            $(this).blur();
        }
    });


    
});
// Prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());