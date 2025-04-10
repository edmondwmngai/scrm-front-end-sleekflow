var callBar = null;
var chatBar = null;
var agentStatusTbl = null;
var agentStatusTbl2 = null;
var agentStatusSelected = null;
var qTbl = null;
var superTbl = null;
var acdTbl = null;
var agentTbl = null;
var acdCbTbl = null;
var superAcdTbl = null;
var agentCbTbl = null;
var acdQSelected = null;
var slaGauge1 = null;
var slaGauge2 = null;
var selectedCat = 'Live Monitor';
var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};
var wiseHost = config.wiseHost;
// var voiceTblBuilt = false; deprecated
var wmAgentObj = {};
var monitoringAgentId = 0;
var loginId = (typeof window.opener.loginId == 'undefined') ? window.opener.agentId : window.opener.loginId; // old code still using @ main.html
var acdLength = 0;
var acdMembersArr = [];
var superList = [];
var agentList = [];
var toAddArr = [];
var toDelArr = [];
var changingId = 0;
var isAcdToAgent = true;
var acdOrAgentRowtIdx = 0;
var superData = [];
var XRLv = wmConfig.topSuprvisorLv; // this(these) supervisor(s) is/are top with golden key can manage other supervisors to manage which acd(s)
var amIXR = false;
var superAcdData = [];
var wallIntFn = null;
var hvSocial = wmConfig.hvSocial;
var wmWallIntMiliSec = wmConfig.wmWallIntMiliSec || 300000; //5 mins
//var splitASTbl = (wmConfig.splitASTbl && wmConfig.splitASTbl === true ? true : false);    //20250320 Unnecessary use of boolean literals in conditional expression.
var splitASTbl = (wmConfig.splitASTbl && wmConfig.splitASTbl === true);
var functions = sessionStorage.getItem('scrmFunctions');
var boolShowBtn = (functions.indexOf('Wise-Mon-Act-Btn') != -1);

// new added for deciding show ACD tab or not
var readySortAnother = true; // to avoid when another chart create event again, the event will never end 
var ASCoIdx = 0;
var ASDirection = 'asc';
var headerObj = { " Stat.": "agentStatus", " Dur.": "duration", "Agent": "agentName", "": "ticketList" }
var statusStyle = config.statusStyle || { "LOGIN": "#6c757d", "IDLE": "#FF2735", "TALK": "#4caf50", "HOLD": "rgb(201, 203, 207)", "READY": "rgb(54 102 189)", "#dbdb30": "rgba(21, 193, 231, 0.9)", "BREAK": "#AB4A0E", "MONITOR": "rgb(153, 102, 255)" };
var stopASTbl = false;

function dynamicSort(property) {
    var sortOrder = 1;
    if (ASDirection === "desc") {
        sortOrder = -1;
    }
    return function (a, b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

// function talkFirstSort (theAgentArr) { //NO DEL Act. column sets not be able to sort now
//     var withTalkArr = [];
//     var noTalkArr = [];
//     for (var i=0; i<theAgentArr.length; i++) {
//         if (theAgentArr[i].agentStatus == 'Talk') {
//             withTalkArr.push(theAgentArr[i]);
//         } else {
//             noTalkArr.push(theAgentArr);
//         }
//     }
//     return withTalkArr.concat(noTalkArr);
// } // /NO DEL

function createCSS() {
    var style = document.createElement('style');
    style.type = 'text/css';
    var styleStr = '';
    for (var key in statusStyle) {

        // the status passed from server is first charecter upper case, others lower case
        var newKey = key.slice(0, 1) + key.slice(1).toLowerCase();
        styleStr += ('.bg-' + newKey + ' { background: ' + statusStyle[key] + '; }')
    }
    style.innerHTML = styleStr; // '.bg-Idle { background: green; }.bg-Ready { background: lightgray; }';
    document.getElementsByTagName('head')[0].appendChild(style);
}

$(document).ready(function () {

    // create css
    createCSS();

    wmAgentObj = window.opener.wmAgentObj || "";
    // Check is the customer logged in
    if (sessionStorage.getItem('scrmLoggedIn') == null) {
        var scrmLanguage = sessionStorage.getItem('scrmLanguage') || 'EN';
        if (scrmLanguage == 'TC') {
            alert('您尚未登入');
        } else {
            alert("You are not logged in");
        }
        window.location.href = 'login.html';
    } else {
        $('body').removeClass('d-none'); // As don't want no premission to login people see anything
    }
    $('.dropdown-toggle').dropdown();
    // Acd assignment confirm
    /*
    $('[data-bs-toggle=confirmation]').confirmation({
        rootSelector: '[data-bs-toggle=confirmation]',
        popout: true,
        title: "Are you sure?",
        btnOkLabel: "YES",
        btnCancelLabel: "NO"
    });
    */
    // When tab changed resize iframe
    $('a.nav-link').on('click', function (e) {
        $('.tab-pane').removeClass('in active show');
        var href = $(this).attr('href');
        $(href).addClass('in active show');
    });

    //increase width of tbl
    if (splitASTbl === false && hvSocial === true) {
        $('#tra-bar-container').addClass('col-sm-2');
        $('#as-tb-1-container').addClass('col-sm-8');
        $('#as-tb-2-container').addClass('d-none');
        $('#social-bar-container').addClass('col-sm-2');
    } else if (splitASTbl === false && hvSocial === false) {
        $('#tra-bar-container').addClass('col-sm-3');
        $('#as-tb-1-container').addClass('col-sm-9');
        $('#as-tb-2-container').addClass('d-none');
        $('#social-bar-container').addClass('d-none');
    } else if (splitASTbl === true && hvSocial === true) {
        $('#tra-bar-container').addClass('col-sm-2');
        $('#as-tb-1-container').addClass('col-sm-4');
        $('#as-tb-2-container').addClass('col-sm-4');
        $('#social-bar-container').addClass('col-sm-2');
    } else if (splitASTbl === true && hvSocial === false) {
        $('#tra-bar-container').addClass('col-sm-2');
        $('#as-tb-1-container').addClass('col-sm-5');
        $('#as-tb-2-container').addClass('col-sm-5');
        $('#social-bar-container').addClass('d-none');
    }

    // Init Live Mon
    loadServiceList();
    initCallBar();
    initAgentStatus();
    initChatBar();

    $('#wm-service-select').on('change', function () {
        var serviceId = this.value;
        // Remove previous selected acd
        qTbl.$('tr.select-me').removeClass('select-me'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
        // Add selected acd
        qTbl.rows(function (idx, data, node) {
            if (serviceId === 'All') {
                $(node).removeClass("select-me d-none");
            } else if (data.ServiceID === Number(serviceId)) {
                $(node).addClass("select-me").removeClass('d-none');
            } else {
                $(node).removeClass("select-me").addClass("d-none");
            }
        });
    });
    // get agent list
    var dbAgentList = window.opener.agentList;
    if (dbAgentList.length == 0) {
        setTimeout(function () {
            dbAgentList = window.opener.agentList;
            getAgentList(dbAgentList);
        }, 1000);
    } else {
        getAgentList(dbAgentList);
    }

    $('a.title-button').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href") // activated tab
        if (target == '#acd-agents') {
            isAcdToAgent = true;
            // when title change, reload the current tab table row data
            $("#acd-tbl tbody tr.highlight").trigger("click");
            acdTbl.columns.adjust().draw(false);
            agentCbTbl.columns.adjust().draw(false);
        } else {
            isAcdToAgent = false;
            // when title change, select the first row in the page, to avoid previous wrong click on the tab
            $("#agent-tbl tbody tr.highlight").trigger("click");
            agentTbl.columns.adjust().draw(false);
            acdCbTbl.columns.adjust().draw(false);
        }
    });

    // deprecated
    // if (wmConfig.hvVoiceLogFn) {
    //     $('#cat-dropdown-menu').append('<li><a tabindex="-1" href="#">Voice Log Search</a></li>');

    //     // function run after loaded script
    //     $.getScript("./obfuscate_b4/voiceLog.js");
    // }

    // movement will reset timeout counter
    if (window.opener.addPopupIdle) {
        window.opener.addPopupIdle($(document));
    }

    if (functions.indexOf('Floor-Plan-Fn') != -1) {
        $.getScript("./obfuscated/floorPlan.js");
        $('head').append('<link rel="stylesheet" href="./css/floorPlan.css" type="text/css" />');
        // this need to be define here to have the dropdown event below
        $('#cat-dropdown-menu').append('<li><a tabindex="-1" href="#">Floor Plan</a></li>');
    }

    // Set nav bar button
    $("#cat-dropdown-menu li a").click(function () {
        event.preventDefault();
        var selected = $(this).text();
        $('#dropdown-btn').text(selected + '  ');
        switchContent(selected);
    });

    // show dropdown-menu - if no this the menu will not popup correctly
    $('.dropdown-btn-container').on('show.bs.dropdown', function (e) {
        $(e.relatedTarget).next().stop(true, true).css('display', 'block');
    });
    // hide dropdown-menu - if no this the menu may not disappear really and when clicking next row, become clicking previous row Silent
    $('.dropdown-btn-container').on('hide.bs.dropdown', function (e) {
        $(e.relatedTarget).next().stop(true, true).css('display', 'none');
    });
});

function getAgentList(dbAgentList) {
    $.ajax({
        type: "POST",
        url: wiseHost + '/WisePBX/api/Config/GetAgentList',
        data: JSON.stringify({}),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            console.log('error in GetAgentList');
            console.log(r.details);
        } else {
            var oiginalAgentList = r.data;

            // Filter out agent not in application
            for (let agentObj of oiginalAgentList) {
                var newObj = { AgentID: agentObj.AgentID, AgentName: agentObj.AgentName, selectedCount: 0, selected: [] };
                for (let dbAgentObj of dbAgentList) {
                    if (dbAgentObj.AgentID == agentObj.AgentID) {
                        superList.push(newObj);
                    }
                }
                agentList.push(newObj);
            }

            // to get super data need to have agentList first
            getSuperData();
        }
    });
}

function addWallIntFnIfSelected() {
    var rowData = qTbl.row('tr.select-me').data();
    if (rowData) {
        // Clear previous interval (this have to do)
        if (wallIntFn) {
            clearInterval(wallIntFn);
            wallIntFn = null;
        }
        loadWallData(rowData);
        wallIntFn = setInterval(function () { loadWallData(rowData) }, wmWallIntMiliSec);
    }
}


function updateAgentInfo() {
    wmAgentObj = window.opener.wmAgentObj;
    initCallBar();
    initChatBar();
}
function initCallBar() {
    var cWorking = 0;
    var cReady = 0;
    var cTalk = 0;
    var cBreak = 0;
    var cIdle = 0;
    var cHold = 0;
    // var cDialing = 0;
    var cWmAgentObj = { ...wmAgentObj };    // var cWmAgentObj = Object.assign({}, wmAgentObj);     // 20250409 Use an object spread instead of `Object.assign` 
    for (var property in cWmAgentObj) {
        if (cWmAgentObj.hasOwnProperty(property)) {
            var agentObj = cWmAgentObj[property];
            var status = agentObj.agentStatus;
            if (status != 'Logout') {
                switch (status) {
                    case 'Working':
                        cWorking += 1;
                        break;
                    case 'Ready':
                        cReady += 1;
                        break;
                    case 'Talk':
                        cTalk += 1;
                        break;
                    case 'Break':
                        cBreak += 1;
                        break;
                    case 'Idle':
                        cIdle += 1;
                        break;
                    case 'Hold':
                        cHold += 1;
                        break;
                    // case 'Dialing':
                    //     cDialing += 1;
                    //     break;
                    default:
                        break;
                }
            }
        }
    }
    var agentSatusSample = [cWorking, cReady, cTalk, cBreak, cIdle, cHold]
    if (callBar) {
        // Remove data
        // callBar.data.datasets[0].data = [];
        // TO DO BELOW: will need in future
        // callBar.update();
        // Add data
        callBar.data.datasets[0].data = agentSatusSample;
        callBar.update();
    } else {
        callBar = new Chart(document.getElementById("ib-traditional-bar"),
            {
                type: 'bar',// 'doughnut',
                data: {
                    "labels": ["Working", "Ready", "Talk", "Break", "Idle", "Hold"],
                    datasets: [{
                        "data": agentSatusSample,
                        "backgroundColor": [statusStyle["WORKING"], statusStyle["READY"], statusStyle["TALK"], statusStyle["BREAK"], statusStyle["IDLE"], statusStyle["HOLD"]]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {
                        display: 'false',
                    },
                    animation: false,
                    plugins: {
                        legend: false,
                        outlabels: {
                            text: '%l\n %v %p',
                            color: 'white',
                            stretch: 20,
                            borderRadius: 5,
                            font: {
                                resizable: true,
                                minSize: 12,
                                maxSize: 18
                            }
                        }
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                callback: function (value) { if (Number.isInteger(value)) { return value; } },
                                stepSize: 1
                            }
                        }]
                    }
                }
            });
    }
}

function initChatBar() {
    if (hvSocial) {
        var chatNo = 0;
        var noChat = 0;
        var cWmAgentObj = { ...wmAgentObj };    // var cWmAgentObj = Object.assign({}, wmAgentObj);     // 20250409 Use an object spread instead of `Object.assign` 
        for (var property in cWmAgentObj) {
            if (cWmAgentObj.hasOwnProperty(property)) {
                var agentObj = cWmAgentObj[property];
                if (agentObj.agentStatus != 'Logout') {
                    if (agentObj.ticketList.length > 0) {
                        chatNo += 1;
                    } else {
                        noChat += 1;
                    }
                }
            }
        }
        var agentSatusSample = [0, chatNo, 0, 0, noChat, 0]
        if (chatBar) {
            // Remove data
            // chatBar.data.datasets[0].data = [];
            // TO DO BELOW: will need in future
            // chatBar.update();
            // Add data
            chatBar.data.datasets[0].data = agentSatusSample;
            chatBar.update();
        } else {
            chatBar = new Chart(document.getElementById("ib-social-bar"),
                {
                    type: 'bar',
                    data: {
                        "labels": ["", "Chatting", "", "", "No Chat", ""],
                        datasets: [{
                            "data": agentSatusSample,
                            "backgroundColor": ["", "cornflowerblue", "", "", "#dd6e57", ""]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        legend: {
                            display: 'false',
                        },
                        animation: false,
                        plugins: {
                            legend: false,
                            outlabels: {
                                text: '%l\n %v %p',
                                color: 'white',
                                stretch: 20,
                                borderRadius: 5,
                                font: {
                                    resizable: true,
                                    minSize: 12,
                                    maxSize: 18
                                }
                            }
                        },
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    callback: function (value) { if (Number.isInteger(value)) { return value; } },
                                    stepSize: 1
                                }
                            }]
                        }
                    }
                });
        }
    }
}

function initSlaGauge(abanonedPercentage, avgAbandonedTime) {
    // abanonedPercentage = 4; // Added for demo
    // avgAbandonedTime = 91; // Added for demo
    var sla1Color = abanonedPercentage > 15 ? '#f64e4e' : (abanonedPercentage > 5 ? '#fd9704' : '#0fdc63');
    var sla2Color = avgAbandonedTime > 15 ? '#f64e4e' : (avgAbandonedTime > 5 ? '#fd9704' : '#0fdc63');
    if (slaGauge1) {
        // Remove data
        slaGauge1.config.data.datasets[0].gaugeData.value = abanonedPercentage;
        slaGauge1.config.data.datasets[0].gaugeData.valueColor = sla1Color;
        slaGauge1.update({ duration: 0, lazy: true });
    } else {
        slaGauge1 = new Chart(document.getElementById("sla-guage-1"), {
            type: "tsgauge",
            data: {
                datasets: [{
                    backgroundColor: ["#0fdc63", "#fd9704", "#fd9704", "#f64e4e", "#f64e4e", "#f64e4e", "#f64e4e", "#f64e4e", "#f64e4e", "#f64e4e", "#f64e4e", "#f64e4e"],
                    borderWidth: 0,
                    gaugeData: {
                        value: abanonedPercentage,
                        valueColor: sla1Color
                    },
                    gaugeLimits: [0, 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100]
                }]
            },
            options: {
                events: [],
                showMarkers: true,
                animation: {
                    duration: 0
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 100,
                        bottom: 0
                    }
                },
                responsiveAnimationDuration: 0, // animation duration after a resize,
                markerFormatFn: function (v) {
                    if (v / 10 === Math.round(v / 10)) {
                        return v + '%';
                    } else {
                        return '';
                    }
                }
            }
        });
    }

    if (slaGauge2) {
        // Remove data
        slaGauge2.config.data.datasets[0].gaugeData.value = avgAbandonedTime;
        slaGauge2.config.data.datasets[0].gaugeData.valueColor = sla2Color;
        slaGauge2.update({ duration: 0, lazy: true });
    } else {
        slaGauge2 = new Chart(document.getElementById("sla-guage-2"), {
            type: "tsgauge",
            data: {
                datasets: [{
                    backgroundColor: ["#0fdc63", "#fd9704", "#fd9704", "#f64e4e", "#f64e4e", "#f64e4e", "#f64e4e", "#f64e4e", "#f64e4e", "#f64e4e", "#f64e4e", "#f64e4e"],
                    borderWidth: 0,
                    gaugeData: {
                        value: avgAbandonedTime,
                        valueColor: sla2Color
                    },
                    gaugeLimits: [0, 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100]
                }]
            },
            options: {
                events: [],
                showMarkers: true,
                animation: {
                    duration: 0
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 100,
                        bottom: 0
                    }
                },
                responsiveAnimationDuration: 0, // Animation duration after a resize,
                markerFormatFn: function (v) {
                    if (v / 10 === Math.round(v / 10)) {
                        return v + '%';
                        // return v + 's'; NO DEL - commented for demo
                    } else {
                        return '';
                    }
                }
            }
        });
    }
}

function encodeTime(t) {
    var s = "0" + t % 60;
    // var m = "" + parseInt(t / 60);
    var m = parseInt(t / 60);
    var h = "";
    if (m > 60) {
        h = parseInt(m / 60);
        m = m - (h * 60);

        // to string
        h = "" + h;
    }

    m = "" + m;
    if (h.length == 1) h = "0" + h;
    if (m.length == 1) m = "0" + m;

    if (h.length > 0) {
        return h + ":" + m + ":" + s.slice(-2);
    } else {
        return m + ":" + s.slice(-2);
    }
}
function initAgentStatus() {
    if (stopASTbl) {
        return;
    }
    //console.log('initAgentStatus');
    var cWmAgentObj = {...wmAgentObj };    // var cWmAgentObj = Object.assign({}, (wmAgentObj || {}));    // 20250409 Use an object spread instead of `Object.assign` 

    var agentArr = [];
    var d = new Date();
    for (var property in cWmAgentObj) {
        if (cWmAgentObj.hasOwnProperty(property)) {
            var agentObj = cWmAgentObj[property];
            var status = agentObj.agentStatus;
            if (status != 'Logout') {
                var duration = Math.ceil((d.getTime() - agentObj.time.getTime()) / 1000);
                agentObj.duration = encodeTime(duration);
                agentArr.push(agentObj);
            }
        }
    }
    //test data
    // agentArr = [];
    // agentArr[0] = {agentId: 1, agentName: "Apple", agentStatus: "Idle", duration: "01:10", serviceName: "", time: null, ticketList: []}
    // agentArr[1] = {agentId: 2, agentName: "Banana", agentStatus: "Idle", duration: "02:20", serviceName: "", time: null, ticketList: []}
    // agentArr[2] = {agentId: 3, agentName: "Cat", agentStatus: "Ready", duration: "01:50", serviceName: "", time: null, ticketList: []}
    // agentArr[3] = {agentId: 4, agentName: "Dog", agentStatus: "Idle", duration: "01:30", serviceName: "", time: null, ticketList: []}
    // agentArr[4] = {agentId: 5, agentName: "Egg", agentStatus: "Idle", duration: "01:50", serviceName: "", time: null, ticketList: []}
    // agentArr[5] = {agentId: 6, agentName: "Flora", agentStatus: "Idle", duration: "01:90", serviceName: "", time: null, ticketList: []}
    // agentArr[6] = {agentId: 7, agentName: "Gloria", agentStatus: "Break", duration: "01:70", serviceName: "", time: null, ticketList: []}
    // agentArr[7] = {agentId: 8, agentName: "Harry", agentStatus: "Idle", duration: "01:10", serviceName: "", time: null, ticketList: []}
    // agentArr[8] = {agentId: 9, agentName: "Irene", agentStatus: "Idle", duration: "04:00", serviceName: "", time: null, ticketList: []}
    // agentArr[9] = {agentId: 10, agentName: "Jerry", agentStatus: "Idle", duration: "01:00", serviceName: "", time: null, ticketList: []}
    // agentArr[10] = {agentId: 11, agentName: "Kay", agentStatus: "Idle", duration: "01:80", serviceName: "", time: null, ticketList: []}
    // agentArr[11] = {agentId: 12, agentName: "Lemon", agentStatus: "Idle", duration: "03:00", serviceName: "", time: null, ticketList: []}
    // agentArr[12] = {agentId: 13, agentName: "May", agentStatus: "Break", duration: "01:18", serviceName: "", time: null, ticketList: []}
    // agentArr[13] = {agentId: 14, agentName: "Nana", agentStatus: "Idle", duration: "01:19", serviceName: "", time: null, ticketList: []}
    // agentArr[14] = {agentId: 15, agentName: "Olivia", agentStatus: "Idle", duration: "01:01", serviceName: "", time: null, ticketList: []}
    // agentArr[15] = {agentId: 16, agentName: "Peter", agentStatus: "Idle", duration: "01:02", serviceName: "", time: null, ticketList: []}
    // agentArr[16] = {agentId: 17, agentName: "Queen", agentStatus: "Idle", duration: "01:05", serviceName: "", time: null, ticketList: []}
    // agentArr[17] = {agentId: 18, agentName: "Ray", agentStatus: "Idle", duration: "01:10", serviceName: "", time: null, ticketList: []}
    // agentArr[18] = {agentId: 19, agentName: "Sam", agentStatus: "Idle", duration: "01:15", serviceName: "", time: null, ticketList: []}
    // agentArr[19] = {agentId: 20, agentName: "Terry", agentStatus: "Idle", duration: "01:20", serviceName: "", time: null, ticketList: []}

    //SPLIT?
    var agentArr2 = [];
    if (splitASTbl) {
        $("#agent-status-tbl-2").removeClass('d-none');

        // NO DEL: orginally agent evently allocate to 2 tables, but customer request change to all 10 on left table first
        // agentArr2 = agentArr.slice();
        // if (agentArr.length % 2 == 0) { //even
        //     agentArr = agentArr.splice(0, agentArr.length / 2); //first half
        //     agentArr2 = agentArr2.splice(agentArr2.length / 2, agentArr2.length / 2); //second half
        // }
        // else { //odd
        //     agentArr = agentArr.splice(0, agentArr.length / 2 + 1); //first half
        //     agentArr2 = agentArr2.splice(agentArr2.length / 2 + 1, agentArr2.length / 2 + 1); //second half
        // }
        // /NO DEL

        if (agentStatusTbl) {
            console.log("agentStatusTbl.column(ASCoIdx).header().text()");
            console.log($(agentStatusTbl.column(ASCoIdx).header()).text());
        }

        if (agentStatusTbl) {
            var dataName = headerObj[$(agentStatusTbl.column(ASCoIdx).header()).text()] || '';
            // if (dataName == ' Act.'){ // NO DEL Act. column sets not be able to sort now
            //     agentArr = talkFirstSort(agentArr);
            // } else  // /No Del
            if (dataName.length > 0) {
                agentArr.sort(dynamicSort(dataName));
            }
        }

        agentArr2 = agentArr.slice(10);
        agentArr = agentArr.slice(0, 10);
    }


    if (agentStatusTbl) {

        agentStatusTbl.clear();
        agentStatusTbl.rows.add(agentArr); // Add new data
        agentStatusTbl.columns.adjust().draw(); // Redraw the DataTable

        // var agentArrClone = agentArr.slice();
        // var as1ShouldUpdate = false;
        // agentStatusTbl.rows(function (idx, data, node) {

        //     // update Row check & check should remove
        //     var shouldRemove = true;
        //     for (var i = 0; i < agentArr.length; i++) {
        //         var agentObj = agentArr[i];
        //         if (data.agentId === agentObj.agentId) {
        //             shouldRemove = false;
        //             agentArrClone[i] = null;
        //             var originalTicketLength = data.ticketList.length;
        //             var originalService = data.serviceName || '';
        //             var agentStatus = agentObj.agentStatus;
        //             var agentService = agentObj.serviceName || '';

        //             // if no need, will not update whole row, as this will make the dropdown blink always
        //             if (agentService != originalService) {

        //                 // if service change, update whole row
        //                 agentStatusTbl.row(idx).data(agentObj).draw();
        //             } else {
        //                 if (originalTicketLength != agentObj.ticketList.length) {

        //                     // if ticket number change, update whole row
        //                     agentStatusTbl.row(idx).data(agentObj).draw();
        //                 } else {

        //                     // if status row updated
        //                     if (data.agentStatus != agentStatus) {
        //                         agentStatusTbl.cell({ row: idx, column: 0 }).data(agentObj.agentStatus || "");
        //                     }

        //                     // update time always
        //                     agentStatusTbl.cell({ row: idx, column: 1 }).data(agentObj.duration);
        //                 }
        //             }
        //             break;
        //         }
        //     }
        //     if (shouldRemove) {
        //         $(node).addClass("TBD");
        //         as1ShouldUpdate = true;
        //     }
        // });
        // agentStatusTbl.rows('.TBD').remove();
        // for (let theAgent of agentArrClone) {
        //     if (theAgent != null) {
        //         agentStatusTbl.row.add(theAgent);
        //         as1ShouldUpdate = true;
        //     }
        // }
        // if (as1ShouldUpdate) {
        //     agentStatusTbl.draw().columns.adjust();
        // }
        // ================= Agent Status Table 2 Update ==================
        if (agentStatusTbl2) {

            agentStatusTbl2.clear();
            agentStatusTbl2.rows.add(agentArr2); // Add new data
            agentStatusTbl2.columns.adjust().draw(); // Redraw the DataTable

            // var agentArr2Clone = agentArr2.slice();
            // var as2ShouldUpdate = false;

            // agentStatusTbl2.rows(function (idx, data, node) {
            //     // Update Row
            //     var shouldRemove = true;
            //     for (var i = 0; i < agentArr2.length; i++) {
            //         var agentObj = agentArr2[i];
            //         if (data.agentId === agentObj.agentId) {
            //             shouldRemove = false;
            //             agentArr2Clone[i] = null;
            //             var originalTicketLength = data.ticketList.length;
            //             var originalService = data.serviceName || '';
            //             var agentStatus = agentObj.agentStatus;
            //             var agentService = agentObj.serviceName || '';

            //             // if no need, will not update whole row, as this will make the dropdown blink always
            //             if (agentService != originalService) {

            //                 // if service change, update whole row
            //                 agentStatusTbl2.row(idx).data(agentObj).draw();
            //             } else {
            //                 if (originalTicketLength != agentObj.ticketList.length) {

            //                     // if ticket number change, update whole row
            //                     agentStatusTbl2.row(idx).data(agentObj).draw();
            //                 } else {

            //                     // if status row updated
            //                     if (data.agentStatus != agentStatus) {
            //                         agentStatusTbl2.cell({ row: idx, column: 0 }).data(agentObj.agentStatus || "");
            //                     }

            //                     // update time always
            //                     agentStatusTbl2.cell({ row: idx, column: 1 }).data(agentObj.duration);
            //                 }
            //             }
            //             break;
            //         }
            //     }
            //     if (shouldRemove) {
            //         $(node).addClass("TBD");
            //         as2ShouldUpdate = true;
            //     }
            // });
            // agentStatusTbl2.rows('.TBD').remove();
            // for (let theAgentObj of agentArr2Clone) {
            //     if (theAgentObj != null) {
            //         agentStatusTbl2.row.add(theAgentObj);
            //         as2ShouldUpdate = true;
            //     }
            // }
            // if (as2ShouldUpdate) {
            //     agentStatusTbl2.draw().columns.adjust();
            // }
        }
        // updateAgentInfo();
    } else { //first time

        var ASTblColArr = [
            {
                title: '<span title="Status"><i class="fas fa-phone"></i> Stat.</span>', data: "agentStatus",
                render: function (data, type, row) {
                    var serviceName = row.serviceName || '';
                    if (serviceName.length > 0) {
                        return '<span title="' + serviceName + '"><span class="legend-square bg-' + data + '"></span>' + data + ' - ' + serviceName + '</span>';
                    } else {
                        return '<span class="legend-square bg-' + data + '"></span>' + data;
                    }
                }
            },
            {
                title: '<span title="Status Duration"><i class="fas fa-phone"></i> Dur.</span>', data: "duration"
            },
            {
                title: "Agent", className: "agent-column", render: function (data, type, row) {
                    return row.agentName + ' (ID: ' + row.agentId + ')';
                }
            }
        ]

        //Default sorting: order by status
        var ASaaSorting = [[0, "desc"]];

        //append col if showBtn is true
        if (boolShowBtn) {
            ASTblColArr.splice(2, 0, {
                title: '<span title="Phone Action"><i class="fas fa-phone"></i> Act.</span>',
                "orderable": false,
                render: function (data, type, row) {
                    if (row.agentId == loginId) {

                        // supervisor will want to always shows monitor to an agent
                        // if (monitoringAgentId == 0) {
                        // if (row.agentStatus == 'Talk') {
                        return '<span class="personal-td">N/A</span>';
                        // } else {
                        // return '<span class="personal-td"></span>';
                        // }
                        // } else {
                        // return '<button class="btn btn-sm rounded py-0 bg-info nav-btn text-capitalize px-2 stop-btn me-2">Stop</button><button class="btn btn-sm rounded py-0 bg-info nav-btn text-capitalize px-2 barge-in-btn">Barge In</button>'
                        // }
                    } else {
                        return '<div class="agent-dropdown-btn-container"><button class="btn dropdown-toggle agent-dropdown-toggle py-0 bg-info nav-btn text-capitalize px-2 tbl-dropdown-btn" data-bs-toggle="dropdown"></button><ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu"><li><a tabindex="-1" href="#">Silent</a></li><li><a tabindex="-1" href="#">Coach</a></li><li><a tabindex="-1" href="#">Conference</a></li><li><a tabindex="-1" href="#">Stop Listen</a></li><li><a tabindex="-1" href="#">Barge In</a></li></ul></div>';
                    }
                    // else if (row.agentStatus == 'Talk') {
                    // return '<div class="agent-dropdown-btn-container"><button class="btn dropdown-toggle agent-dropdown-toggle py-0 bg-info nav-btn text-capitalize px-2 tbl-dropdown-btn" data-bs-toggle="dropdown" style="font-size:16px;line-height:25px;"></button><ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu"><li><a tabindex="-1" href="#">Silent</a></li><li><a tabindex="-1" href="#">Coach</a></li><li><a tabindex="-1" href="#">Conference</a></li></ul></div>';
                    // } else {
                    // return "";
                    // }
                }
            })
        }

        if (hvSocial) {
            ASTblColArr.push({
                title: '<i class="fas fa-comment" title="No. of Social Media"></i>',
                className: "chat-no-col",
                data: "ticketList",
                render: function (data, type, row) {
                    if (data) {
                        return data.length;
                    } else {
                        return 0;
                    }
                }
            })
            if (boolShowBtn) {
                ASTblColArr.push({
                    title: '<span title="Social Media Action"><i class="fas fa-comment" style="padding-left:20px;"></i> Act.</span>',
                    "orderable": false,
                    render: function (data, type, row) {
                        if (row && row.ticketList && row.ticketList.length > 0) {
                            if (row.agentId == loginId) {
                                return 'N/A';
                            } else {
                                return '<button class="btn btn-sm rounded py-0 bg-info nav-btn text-capitalize px-2 silent-btn">Silent</button>';
                            }
                        } else {
                            return "";
                        }
                    }
                })
                ASaaSorting = [[2, "desc"], [5, "desc"]];
            }
        }

        agentStatusTbl = $('#agent-status-tbl').DataTable({
            data: agentArr,
            lengthChange: true,
            language: {
                "paginate": {
                    "previous": "PREV"
                }
            },
            "lengthMenu": [5, 10, 50],
            scrollY: '370px',
            // scrollCollapse: true, // to let the dropdown shows all
            paging: false,
            searching: false,
            info: false,
            aaSorting: (splitASTbl ? [[ASCoIdx, ASDirection]] : ASaaSorting),
            columnDefs: [
            ],
            columns: ASTblColArr,
            initComplete: function (settings, json) {
                setInterval(function () { initAgentStatus(); }, 1000);
            }
        });

        if (splitASTbl) {
            agentStatusTbl2 = $('#agent-status-tbl-2').DataTable({
                data: agentArr2,
                lengthChange: true,
                language: {
                    "paginate": {
                        "previous": "PREV"
                    }
                },
                "lengthMenu": [5, 10, 50],
                scrollY: '370px',
                // scrollCollapse: true,  // to let the dropdown shows all
                paging: false,
                searching: false,
                info: false,
                aaSorting: (splitASTbl ? [[ASCoIdx, ASDirection]] : ASaaSorting),
                columns: ASTblColArr,
                initComplete: function (settings, json) {
                    setInterval(function () { initAgentStatus(); }, 1000);
                }
            });
            // if split table when table 1 sort, antoher table sort also
            $('#agent-status-tbl').on('order.dt', function () {

                let order = agentStatusTbl.order();
                if (order.length > 0) {
                    console.log("Ordered column " + order[0][0] + ", in direction " + order[0][1]);
                    // var title = agentStatusTbl.column( idx ).header();
                    // console.log( 'Column title clicked on: '+$(title).html() );

                    if (readySortAnother) {
                        readySortAnother = false;
                        ASCoIdx = order[0][0];// title;
                        ASDirection = order[0][1];
                        agentStatusTbl2.order([order[0][0], order[0][1]]).draw();
                        initAgentStatus();
                        setTimeout(function () { readySortAnother = true; }, 500);
                    }
                }
            })

            $('#agent-status-tbl-2').on('order.dt', function () {

                let order = agentStatusTbl2.order();
                if (order.length > 0) {
                    console.log("Ordered column " + order[0][0] + ", in direction " + order[0][1]);
                    if (readySortAnother) {
                        readySortAnother = false;
                        ASCoIdx = order[0][0];
                        ASDirection = order[0][1];
                        agentStatusTbl.order([order[0][0], order[0][1]]).draw();
                        initAgentStatus();
                        setTimeout(function () { readySortAnother = true; }, 500);
                    }
                }
            })

            //resize the column width
            setTimeout(function () {
                agentStatusTbl2.columns.adjust().draw(false);
            }, 600);

            $('#agent-status-tbl2 .agent-dropdown-toggle').dropdown();
            // $('#agent-status-tbl2').on('click', '.stop-btn', function () {
            //     window.opener.document.getElementById("phone-panel").contentWindow.WiseEndMonitorCall();
            //     // var td = $(this).closest('td');
            //     // $(td).html('<span class="personal-td"></span>');
            //     // var monitoringTd = $('#agent-status-tbl2').find('.monitor-td');
            //     // if (monitoringTd) {
            //     //     $(monitoringTd).html('<div class="agent-dropdown-btn-container"><button class="btn dropdown-toggle agent-dropdown-toggle py-0 bg-info nav-btn text-capitalize px-2 tbl-dropdown-btn" data-bs-toggle="dropdown" style="font-size:16px;line-height:25px;"></button><ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu"><li><a tabindex="-1" href="#">Silent</a></li><li><a tabindex="-1" href="#">Coach</a></li><li><a tabindex="-1" href="#">Conference</a></li></ul></div>');
            //     // }
            //     monitoringAgentId = 0;
            // });
            // $('#agent-status-tbl2').on('click', '.barge-in-btn', function () {
            //     if (confirm('Are you sure you want to barge in the call?')) {
            //         var data = agentStatusTbl.row($('#agent-status-tbl2').find('.monitor-td').closest('tr')).data();
            //         var targetAgentId = data.agentId;
            //         window.opener.document.getElementById("phone-panel").contentWindow.WiseStartMonitorCall(targetAgentId, 0); // 0 means type is barge in
            //         // var td = $(this).closest('td');
            //         // $(td).html('<span class="personal-td">N/A</span>');
            //         monitoringAgentId = 0;
            //     }
            // });
            $('#agent-status-tbl2').on('click', '.dropdown-menu li a', function (e) {
                var selected = this.text;

                if (selected == 'Barge In') {
                    var data = agentStatusTbl2.row($(this).parents('tr')).data();
                    var targetAgentId = data.agentId;
                    window.opener.document.getElementById("phone-panel").contentWindow.WiseStartMonitorCall(targetAgentId, 0); // 0 means type is barge in
                    monitoringAgentId = 0;
                } else if (selected == 'Stop Listen') {
                    window.opener.document.getElementById("phone-panel").contentWindow.WiseEndMonitorCall();
                    monitoringAgentId = 0;
                //} else { // 20250410 'If' statement should not be the only statement in 'else' block
                } else if (confirm('Are you sure you want to "' + selected + '"?')) {
                        var data = agentStatusTbl2.row($(this).parents('tr')).data();
                        var targetAgentId = data.agentId;
                        var typeId = selected == 'Silent' ? 1 : (selected == 'Coach' ? 4 : 2); //Conference = 2
                        monitoringAgentId = targetAgentId;
                        // var td = $(this).closest('td');
                        // $(td).html('<span class="text-center monitor-td">' + selected + '</span>');
                        // var personalTd = $('#agent-status-tbl2').find('.personal-td');
                        // personalTd.html('<button class="btn btn-sm rounded py-0 bg-info text-capitalize px-2 stop-btn me-2">Stop</button><button class="btn btn-sm rounded py-0 bg-info text-capitalize px-2 barge-in-btn">Barge In</button>');
                        window.opener.document.getElementById("phone-panel").contentWindow.WiseStartMonitorCall(targetAgentId, typeId);
                    //} // 20250410 for else if 
                }
                e.preventDefault();
                e.stopPropagation();
            });
            $('#agent-status-tbl2').on('click', '.silent-btn', function () {
                if (confirm('Are you sure you want to silent join the chat?')) {
                    var data = agentStatusTbl2.row($(this).parents('tr')).data();
                    var ticketList = data.ticketList;
                    var ticketIdArr = [];
                    for (var i = 0; i < data.ticketList.length; i++) {
                        ticketIdArr.push(parseInt(ticketList[i].ticket_id));
                    }
                    window.opener.document.getElementById("phone-panel").contentWindow.WiseStartMontiorChat(ticketIdArr, data.agentId);
                    window.opener.tmpMonIdArr = ticketIdArr;
                    window.opener.tmpAgentId = data.agentId;
                }
                event.preventDefault();
            });

            // show dropdown-menu - if no this the menu will not popup correctly
            $('#agent-status-tbl-2').on('.agent-dropdown-btn-container show.bs.dropdown', function (e) {
                stopASTbl = true;
                $(e.relatedTarget).next().stop(true, true).css('display', 'block');

                // to do if needed, if dropdown not closed for too long, auto close
            });
            // hide dropdown-menu - if no this the menu may not disappear really and when clicking next row, become clicking previous row Silent
            $('#agent-status-tbl-2').on('.agent-dropdown-btn-container hide.bs.dropdown', function (e) {
                stopASTbl = false;
                $(e.relatedTarget).next().stop(true, true).css('display', 'none');
            });
        }
        // $('#agent-status-tbl2').on('order.dt', function () {

        //     let order = agentStatusTbl2.order();
        //     console.log("tbl2 Ordered column " + order[0][0] + ", in direction " + order[0][1]);
        //     if (readySortAnother) {
        //         readySortAnother = false;
        //         //agentStatusTbl2.order([order[0][0], order[0][1]]).draw()
        //         ASCoIdx = order[0][0];
        //         ASDirection = order[0][1];
        //         setTimeout(function () { readySortAnother = true; }, 500);
        //         //initAgentStatus();
        //     }
        // })

        // $('#agent-status-tbl').on( 'order.dt',  function () { 
        //     let order = agentStatusTbl.order();
        //     console.log("Ordered column " + order[0][0] + ", in direction " + order[0][1]);

        //     if (readySortAnother) { // need to add this to avoid after draw agent table 2 will sort back this table
        //         readySortAnother = false;
        //         agentStatusTbl2.order([order[0][0],  order[0][1]]).draw()
        //         setTimeout(function(){readySortAnother = true;},500);
        //     }
        // })

        // $('#agent-status-tbl-2').on( 'order.dt',  function () { 
        //     let order = agentStatusTbl2.order();
        //     //console.log("Ordered column " + order[0][0] + ", in direction " + order[0][1]);
        //     if (readySortAnother) {  // need to add this to avoid after draw agent table 1 will sort back this table
        //         readySortAnother = false;
        //         agentStatusTbl.order([order[0][0],  order[0][1]]).draw()
        //         setTimeout(function(){readySortAnother = true;},500);
        //     }
        // })

        //resize the column width
        setTimeout(function () {
            agentStatusTbl.columns.adjust().draw(false);
        }, 600);


        // Align Column Width, needed when used scrollY, draw false needed to avoid keep scroll up
        $('.personal-td').closest('tr').addClass('personal');
        $('#agent-status-tbl .agent-dropdown-toggle').dropdown();
        $('#agent-status-tbl').on('click', '.stop-btn', function () {
            window.opener.document.getElementById("phone-panel").contentWindow.WiseEndMonitorCall();
            // var td = $(this).closest('td');
            // $(td).html('<span class="personal-td"></span>');
            var monitoringTd = $('#agent-status-tbl').find('.monitor-td');
            if (monitoringTd) {
                $(monitoringTd).html('<div class="agent-dropdown-btn-container"><button class="btn dropdown-toggle agent-dropdown-toggle py-0 bg-info nav-btn text-capitalize px-2 tbl-dropdown-btn" data-bs-toggle="dropdown"></button><ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu"><li><a tabindex="-1" href="#">Silent</a></li><li><a tabindex="-1" href="#">Coach</a></li><li><a tabindex="-1" href="#">Conference</a></li></ul></div>');
            }
            monitoringAgentId = 0;
        });
        $('#agent-status-tbl').on('click', '.barge-in-btn', function () {
            if (confirm('Are you sure you want to barge in the call?')) {
                var data = agentStatusTbl.row($('#agent-status-tbl').find('.monitor-td').closest('tr')).data();
                var targetAgentId = data.agentId;
                window.opener.document.getElementById("phone-panel").contentWindow.WiseStartMonitorCall(targetAgentId, 0); // 0 means type is barge in
                // var td = $(this).closest('td');
                // $(td).html('<span class="personal-td">N/A</span>');
                monitoringAgentId = 0;
            }
        });
        $('#agent-status-tbl').on('click', '.dropdown-menu li a', function (e) {
            var selected = this.text;
            if (selected == 'Barge In') {
                var data = agentStatusTbl.row($(this).parents('tr')).data();
                var targetAgentId = data.agentId;
                window.opener.document.getElementById("phone-panel").contentWindow.WiseStartMonitorCall(targetAgentId, 0); // 0 means type is barge in
                monitoringAgentId = 0;
            } else if (selected == 'Stop Listen') {
                window.opener.document.getElementById("phone-panel").contentWindow.WiseEndMonitorCall();
                monitoringAgentId = 0;
            //} else {  // 20250410 'If' statement should not be the only statement in 'else' block
            } else if (confirm('Are you sure you want to "' + selected + '"?')) {
                    var data = agentStatusTbl.row($(this).parents('tr')).data();
                    var targetAgentId = data.agentId;
                    var typeId = selected == 'Silent' ? 1 : (selected == 'Coach' ? 4 : 2); //Conference = 2
                    monitoringAgentId = targetAgentId;
                    // var td = $(this).closest('td');
                    // $(td).html('<span class="text-center monitor-td">' + selected + '</span>');
                    // var personalTd = $('#agent-status-tbl').find('.personal-td');
                    // personalTd.html('<button class="btn btn-sm rounded py-0 bg-info text-capitalize px-2 stop-btn me-2">Stop</button><button class="btn btn-sm rounded py-0 bg-info text-capitalize px-2 barge-in-btn">Barge In</button>');
                    window.opener.document.getElementById("phone-panel").contentWindow.WiseStartMonitorCall(targetAgentId, typeId);
                //}// 20250410 for else if 
            }
            // e.preventDefault();
            // e.stopPropagation();
        });
        $('#agent-status-tbl').on('click', '.silent-btn', function () {
            if (confirm('Are you sure you want to silent join the chat?')) {
                var data = agentStatusTbl.row($(this).parents('tr')).data();
                var ticketList = data.ticketList;
                var ticketIdArr = [];
                for (var i = 0; i < data.ticketList.length; i++) {
                    ticketIdArr.push(parseInt(ticketList[i].ticket_id));
                }
                window.opener.document.getElementById("phone-panel").contentWindow.WiseStartMontiorChat(ticketIdArr, data.agentId);
                window.opener.tmpMonIdArr = ticketIdArr;
                window.opener.tmpAgentId = data.agentId;
            }
            event.preventDefault();
        });

        // show dropdown-menu - if no this the menu will not popup correctly
        $('#agent-status-tbl').on('.agent-dropdown-btn-container show.bs.dropdown', function (e) {
            stopASTbl = true;
            $(e.relatedTarget).next().stop(true, true).css('display', 'block');
        });
        // hide dropdown-menu - if no this the menu may not disappear really and when clicking next row, become clicking previous row Silent
        $('#agent-status-tbl').on('.agent-dropdown-btn-container hide.bs.dropdown', function (e) {
            stopASTbl = false;
            $(e.relatedTarget).next().stop(true, true).css('display', 'none');
        });
    }

    // fllor plan
    if (selectedCat == 'Floor Plan') {
        updateFloorPlan(cWmAgentObj);
    }
}
// This API have Email not same as GetACDGroupList
function loadAcdAccessList() {
    $.ajax({
        type: "POST",
        url: wiseHost + '/WisePBX/api/config/GetACDGroupAccessList',
        data: JSON.stringify({}),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).always(function (r) {
        superAcdData = r.result == "fail" ? [] : r.data;

        // matched record length could be 0, if the agent is not super
        var matchRecord = superData.filter(function (v) { return v.AgentID == loginId });
        var accessibleAcdArr = matchRecord.length > 0 ? matchRecord[0].superSelected : [];
        var acdTblArr = [];
        for (let acdObj of superAcdData) {
            if (accessibleAcdArr.indexOf(acdObj.AcdGroupID) != -1) {
                acdTblArr.push(acdObj);
            }
        }
        // Init ACD Tbl and Agent Tbl
        getACDMember(acdTblArr);
    });
}

function loadServiceList() {
    $.ajax({
        type: "POST",
        url: wiseHost + '/WisePBX/api/Config/GetServiceList',
        data: JSON.stringify({}),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            console.log('error in GetServiceList');
            console.log(r.details);
        } {
            var serviceArr = r.data;
            var selectedStr = serviceArr.length == 1 ? ' selected="true"' : '';
            if (serviceArr && serviceArr.length > 0) {

                for (let serviceObj of serviceArr) {

                    // Init Live Mon Queue Select
                    $('#wm-service-select').append(
                        '<option class="queue-header-option" value=' + serviceObj.ServiceID + '>' + serviceObj.ServiceDesc + '</option>'
                    );

                    // Init Voice Log Select - deprecated
                    // $('#voice-service-select').append(
                    //     '<option value=' + serviceObj.ServiceID + selectedStr + '>' + serviceObj.ServiceDesc + '</option>'
                    // );
                }

                // If have service, or after loading service, show the select box
                $('#voice-select-container').removeClass('d-none');
            }
            getACDArr(serviceArr);
        }
    });
}

function initWallData(tblData, rowData) {
    // Show Traditional Wall or Social Wall
    var isSocial = rowData.ACDGroupType == 'Chat' || false;
    if (isSocial) {
        $('.wall-chat').removeClass('d-none');
        $('.wall-call').addClass('d-none');
    } else {
        $('.wall-chat').addClass('d-none');
        $('.wall-call').removeClass('d-none');
    }
    var abanonedPercentage = 0;
    var avgAbandonedTime = 0;
    var serviceObj = tblData.service;
    var acdObj = tblData.acdGroup;
    $('#selected-acd').text(rowData.AcdGroupDesc);
    $('#selected-service').text($("#wm-service-select option:selected").html());

    // NO DEL - needed when demo
    // $('#wall-1').text(50 + ' / ' + 57);
    // $('#wall-2').text(48 + ' / ' + 54);
    // $('#wall-3').text(2 + ' / ' + 3);
    // $('#wall-5').text(91 + ' / ' + 93);
    // $('#wall-6').text(132 + ' / ' + 119);
    // $('#wall-4').text(6);
    // /NO DEL - needed when demo

    if (acdObj) {
        $('#wall-1').text(acdObj.IncomingCall + ' / ' + serviceObj.IncomingCall);
        $('#wall-2').text(acdObj.AnsweredCall + ' / ' + serviceObj.AnsweredCall);
        $('#wall-3').text(acdObj.AbandonedCall + ' / ' + serviceObj.AbandonedCall);
        $('#wall-5').text(acdObj.AvgAbandonedTime + ' / ' + serviceObj.AvgAbandonedTime);
        $('#wall-6').text(acdObj.AvgTalkTime + ' / ' + serviceObj.AvgTalkTime);

        // For SLA Gauge Chart
        abanonedPercentage = Math.round((acdObj.AbandonedCall / acdObj.IncomingCall) * 100) || 0;
        avgAbandonedTime = acdObj.AvgAbandonedTime;
    } else {
        $('#wall-1').text(serviceObj.IncomingCall);
        $('#wall-2').text(serviceObj.AnsweredCall);
        $('#wall-3').text(serviceObj.AbandonedCall);
        $('#wall-5').text(serviceObj.AvgAbandonedTime);
        $('#wall-6').text(serviceObj.AvgTalkTime);
        // For SLA Gauge Chart
        abanonedPercentage = Math.round((serviceObj.AbandonedCall / serviceObj.IncomingCall) * 100) || 0;
        avgAbandonedTime = serviceObj.AvgAbandonedTime;
    }

    // wall - 4 Outbound Call will not divide ACD service
    if (isSocial) {
        $('#wall-4').text('N/A');
        $('.sla-gauge-title-call').addClass('d-none');
        $('.sla-gauge-title-chat').removeClass('d-none');
    } else {
        $('#wall-4').text(serviceObj.OutboundCall); // will comment if for demo
        $('.sla-gauge-title-call').removeClass('d-none');
        $('.sla-gauge-title-chat').addClass('d-none');
    };
    $('.sla-gauge-title-sec').removeClass('d-none');
    initSlaGauge(abanonedPercentage, avgAbandonedTime);
    document.getElementById("wall-update-time").innerHTML = serviceObj.TimeStamp.slice(11, 16);
}

function getACDArr(serviceArr) {
    var serviceArrLen = serviceArr.length || [];
    var joinedArr = [];
    // for (var i = 0; i < serviceArr.length; i++) {
    //     var serviceId = serviceArr[i].ServiceID;
    $.each(serviceArr, function (idx, val) {
        var serviceId = val.ServiceID;
        $.ajax({
            type: "POST",
            url: wiseHost + '/WisePBX/api/Config/GetACDGroupList',
            data: JSON.stringify({ 'serviceId': serviceId }),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in GetACDGroupList');
                console.log(r.details || "error");
            } {
                var acdArr = r.data;

                // Join Service Id to the acdArr
                for (let acdObj of acdArr) {
                    acdObj.ServiceID = serviceId;
                    joinedArr.push(acdObj);
                }

                serviceArrLen = serviceArrLen - 1;
                if (serviceArrLen == 0) {
                    initQueue(joinedArr);
                }
            }
        });
    })
}
function updateQueueTbl(updateAcdObj) {
    // qTbl could be not yet inited when just open the popup
    if (qTbl) {
        qTbl.rows(function (idx, data, node) {
            if (data.AcdGroupID === Number(updateAcdObj.groupId)) {
                qTbl.cell({ row: idx, column: 2 }).data(updateAcdObj.waitCount);
                qTbl.cell({ row: idx, column: 3 }).data(encodeTime(Number(updateAcdObj.waitTime)));
            }
        });
        // To sort the table
        qTbl.draw();
    }
}

function loadWallData(rowData) {
    $.ajax({
        type: "POST",
        url: wiseHost + '/wisepbx/api/config/GetMonitorStatistics',
        data: JSON.stringify({ serviceId: rowData.ServiceID, groupId: rowData.AcdGroupID }),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            console.log('error in GetMonitorStatistics');
            console.log(r.details);
        } {
            initWallData(r.data, rowData);
        }
    });
}

function initQueue(acdArr) {
    qTbl = $('#q-tbl').DataTable({
        data: acdArr,
        lengthChange: true,
        language: {
            "paginate": {
                "previous": "PREV"
            }
        },
        // scrollY: '28vh',
        scrollY: 'calc(100vh - 688px)',
        // scrollCollapse: true, // not work
        paging: false,
        searching: false,
        info: false,
        aaSorting: [[2, "desc"], [3, "desc"]],
        columnDefs: [
            {
                targets: 0,
                orderable: false,
                render: function (data, type, row) {
                    if (row.ACDGroupType == 'Chat') {
                        return '<i class="fas fa-comment"></i>'
                    } else {
                        return '<i class="fas fa-phone"></i>'
                    }
                }
            }
        ],
        columns: [
            { title: "", data: "ACDGroupType" },
            { title: "ACD", data: "AcdGroupDesc" },
            { title: "No.", defaultContent: "" },
            { title: "Dur.", defaultContent: "" }
        ]
    });
    // Align Column Width, needed when used scrollY, draw false needed to avoid keep scroll up
    setTimeout(function () { qTbl.columns.adjust().draw(false); }, 200);
    // In Case before Live Mon open already got acd info
    var wmACDObj = window.opener.wmACDObj;
    for (var acdObj in wmACDObj) {
        updateQueueTbl(wmACDObj[acdObj]);
    }

    $('#q-tbl tbody').on('click', 'tr.select-me', function () {
        var data = qTbl.row($(this)).data();
        var selected = data.AcdGroupID;
        // Prevent to run again
        if (selected != acdQSelected) {
            acdQSelected = selected;
            qTbl.$('tr.queue-selected').removeClass('queue-selected'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
            $(this).addClass('queue-selected');
            if (wallIntFn) {
                clearInterval(wallIntFn);
                wallIntFn = null;
            }
            loadWallData(data);
            wallIntFn = setInterval(function () { loadWallData(data) }, wmWallIntMiliSec);
            if (event) {
                event.preventDefault();
            }
        }
    });
    // Click default wall
    // Alternative to comment, maybe not good for Site A, but look good for demo
    var defaultRowIdx = 0;
    var defaultWallAcd = wmConfig.wsDefaultWallAcd;
    if (defaultWallAcd) {
        var tblAcdArr = qTbl.columns(1).data()[0];
        for (var i = 0; i < tblAcdArr.length; i++) {
            if (tblAcdArr[i] == defaultWallAcd) {
                defaultRowIdx = i;
                break;
            }
        }
    }
    // check if just 1 service, select the first service
    if ($('#wm-service-select').find('option').length == 2) { // other than All have another serivce only
        $($('#wm-service-select').find('option')[1]).select().change();
    }
    $('#q-tbl tbody tr:eq(' + defaultRowIdx + ')').addClass('select-me').trigger("click");
    // /Alternative to comment, maybe not good for Site A, but look good for demo
}

function initACDTbl() {
    acdTbl = $('#acd-tbl').DataTable({
        data: acdMembersArr,
        lengthChange: true, // not showing 'Show ? per page' dropdown
        language: {
            "paginate": {
                "previous": "PREV"
            }
        },
        scrollY: 'calc(100vh - 200px)',  // no button underneath
        scrollCollapse: true,
        paging: false,
        searching: false,
        info: false,
        aaSorting: [[1, "asc"]],
        columnDefs: [
            {
                targets: 1, // Name can be long, need to know complete name, but don't want always scroll to right or left, so used title
                render: function (data, type, row) {
                    return ('<span title="' + data + '">' + data + '</span>');
                }
            },
            {           
                targets: 2, // 20250401 duplicate name 'columnDefs', move the in here
                render: function (data, type, row) {
                    return '<span val="' + data + '">' + data + '</span>';
                }
            }
        ],
        columns: [
            { title: "ID", data: "AcdGroupID" },
            { title: "ACD", data: "AcdGroupDesc" },
            // { title: "Sel.", data: "memberLength" }
            { title: "Sel.", data: "selectedCount" }
        ]
        /*, // 20250401 duplicate name 'columnDefs
        columnDefs: [
            {
                targets: 2,
                render: function (data, type, row) {
                    return '<span val="' + data + '">' + data + '</span>';
                }
            }
        ] */
    });
    // Align Column Width, needed when used scrollY, draw false needed to avoid keep scroll up
    // var acdRefreshTime = acdMembersArr.length * 20; // As there are math behind, the longer he list of this, the more time this table needed to draw
    // setTimeout(function(){acdTbl.columns.adjust().draw(true);},5000);

    acdCbTbl = $('#acd-cb-tbl').DataTable({
        data: acdMembersArr,
        lengthChange: true, // not showing 'Show ? per page' dropdown
        language: {
            "paginate": {
                "previous": "PREV"
            }
        },
        scrollY: 'calc(100vh - 235px)', // got button underneath
        scrollCollapse: true,
        paging: false,
        searching: false,
        info: false,
        aaSorting: [[1, "asc"]],
        columnDefs: [
            {
                targets: 1, // Name can be long, need to know complete name, but don't want always scroll to right or left, so used title
                render: function (data, type, row) {
                    return ('<span title="' + data + '">' + data + '</span>');
                }
            },
            {
                targets: 2,
                orderable: false,
                render: function (data, type, row) {
                    // each check box has the case no as the id and value
                    return '<div class="form-check" style="margin-top:-16px">' +
                        '<label class="form-check-label">' +
                        '<input class="form-check-input" type="checkbox" id="' + row.AcdGroupID + '" value="' + row.AcdGroupID + '">' +
                        '<span class="form-check-sign"><span class="check" data-bs-toggle="tooltip" data-bs-placement="right"></span></span></label></div>';
                }
            }
        ],
        columns: [
            { title: "ID", data: "AcdGroupID" },
            { title: "ACD", data: "AcdGroupDesc" },
            { title: "" }
        ]
    });
    // Align Column Width, needed when used scrollY, draw false needed to avoid keep scroll up
    // var acdCbRefreshTime = acdMembersArr.length * 50; // As there are math behind, the longer he list of this, the more time this table needed to draw
    // setTimeout(function(){acdCbTbl.columns.adjust().draw(true);}, 5000);

    $('#acd-cb-tbl tbody').on('change', '.form-check-input', function () {
        var checkedLen = $('#acd-cb-tbl tbody .form-check-input:checked').length;
        $(acdCbTbl.column(2).header()).text(('Sel. (' + checkedLen + ')'));
    });

    superAcdTbl = $('#super-acd-tbl').DataTable({
        data: superAcdData,
        lengthChange: true, // not showing 'Show ? per page' dropdown
        language: {
            "paginate": {
                "previous": "PREV"
            }
        },
        scrollY: 'calc(100vh - 235px)',  // got button underneath
        scrollCollapse: true,
        paging: false,
        searching: false,
        info: false,
        aaSorting: [[1, "asc"]],
        columnDefs: [
            {
                targets: 1, // Name can be long, need to know complete name, but don't want always scroll to right or left, so used title
                render: function (data, type, row) {
                    return ('<span title="' + data + '">' + data + '</span>');
                }
            },
            {
                targets: 2,
                orderable: false,
                render: function (data, type, row) {
                    // each check box has the case no as the id and value
                    if (amIXR) {
                        return '<div class="form-check" style="margin-top:-16px">' +
                            '<label class="form-check-label">' +
                            '<input class="form-check-input" type="checkbox" id="spa-' + row.AcdGroupID + '" value="' + row.AcdGroupID + '">' +
                            '<span class="form-check-sign"><span class="check" data-bs-toggle="tooltip" data-bs-placement="right"></span></span></label></div>';
                    } else {
                        return '<span id="spa-' + row.AcdGroupID + '"><span>';
                    }
                }
            }
        ],
        columns: [
            { title: "ID", data: "AcdGroupID" },
            { title: "ACD", data: "AcdGroupDesc" },
            { title: "" }
        ]
    });

    if (amIXR) {
        $('#super-acd-btn-container').append('<a id="super-acd-btn" class="btn rounded btn-sm btn-warning mt-2 mb-0 text-capitalize" data-bs-toggle="confirmation" data-bs-placement="bottom" data-popout="true" data-btn-ok-class="btn-info" href="javascript:(saveSuperAcdSelected())"><i class="fas fa-save me-2"></i><span class="align-middle">Save</span></a>');
        $('#super-acd-btn').confirmation({
            rootSelector: '[data-bs-toggle=confirmation]',
            popout: true,
            title: "Are you sure?",
            btnOkLabel: "YES",
            btnCancelLabel: "NO"
        });
    }
    $('#super-acd-tbl tbody').on('change', '.form-check-input', function () {
        var checkedLen = $('#super-acd-tbl tbody .form-check-input:checked').length;
        $(superAcdTbl.column(2).header()).text(('Sel. (' + checkedLen + ')'));
    });
    // If super table already loaded, select first
    if (superTbl) {
        $("#super-tbl tbody tr:eq(0)").trigger("click");
    }

    $('#acd-tbl tbody').on('click', 'tr', function () {
        var data = acdTbl.row($(this)).data();
        // it is possible selectedAcdData is undefined if supervisor not any access right
        if (data) {
            acdTbl.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
            $(this).addClass('highlight')
            var originalVal = $(this).find('td:eq(2) span').attr('val');
            $(agentCbTbl.column(2).header()).text(('Sel. (' + originalVal) + ')');
            initAgentChecked(data.selected);
            if (event) {
                event.preventDefault();
            }
            if (isAcdToAgent) {
                acdOrAgentRowtIdx = $(this).index();
            }
        }
    });
    initAgentTbl();
}

function initAcdChecked(selectedAcd) {
    acdCbTbl.$('.form-check-input').prop('checked', false);
    for (let theAcd of selectedAcd) {
        acdCbTbl.$('#' + theAcd).prop('checked', true);
    }
}

function getDeletedArr(arr1, arr2) {
    var delArr = [];
    for (var i in arr1) {
        var found = false;
        for (var j in arr2) {
            if (arr1[i] === arr2[j]) {
                found = true;
                // continue;         20250328 Remove this redundant jump. (only can skip the inner for loop )
            }
        }
        if (found === false) {
            delArr.push(arr1[i]);
        }
    }
    return delArr;
}

function getAddedArr(arr1, arr2) {
    var addArr = [];
    for (var i in arr2) {
        var found = false;
        for (var j in arr1) {
            if (arr2[i] === arr1[j]) {
                found = true;
                //continue; // 20250328 Remove this redundant jump. (only can skip the inner for loop )
            }
        }
        if (found === false) {
            addArr.push(arr2[i]);
        }
    }
    return addArr;
}

function refreshAcdAgentTbl() {
    $('#acd-tbl').DataTable().clear();
    $('#acd-tbl').DataTable().rows.add(acdMembersArr); // Add new data
    $('#acd-tbl').DataTable().columns.adjust().draw(); // Redraw the DataTable
    $('#agent-tbl').DataTable().clear();
    $('#agent-tbl').DataTable().rows.add(agentList); // Add new data
    $('#agent-tbl').DataTable().columns.adjust().draw(); // Redraw the DataTable
    if (isAcdToAgent) {
        // select highlighted
        $('#acd-tbl tbody tr:eq(' + acdOrAgentRowtIdx + ')').trigger("click");
        $('#agent-tbl tbody tr:eq(0)').trigger("click");
    } else {
        // select highlighted
        $('#agent-tbl tbody tr:eq(' + acdOrAgentRowtIdx + ')').trigger("click"); //Must refresh this table first to avoid acdOrAgentRowtIdx being changed
        $('#acd-tbl tbody tr:eq(0)').trigger("click");
    }
}

function onAddAcdMember(res) {
    var ppc = window.opener.document.getElementById("phone-panel").contentWindow;
    var toAddId = toAddArr[0];
    var alertId = changingId + 'add' + toAddId;
    var delayMiliSec = 4000;

    // close sending request bubble
    $('#add-sending-request').slideUp(200, function () {
        $(this).alert('close');
    });

    if (isAcdToAgent) {
        if (res.result == 'success') {
            var alertStr = '<div id="' + alertId + '" class="alert alert-success d-grid"><strong>Success!</strong>&nbsp;&nbsp;ACD ID: ' + changingId + ' added Agent ID: ' + toAddId + '&nbsp;&nbsp;&nbsp;<button type="button" class="btn-close" data-bs-dismiss="alert">x</button></div>'
            $('#alert-container').append(alertStr);
            var acdGroup = acdMembersArr.filter(function (v) { return v.AcdGroupID == changingId })[0];
            acdGroup.selectedCount += 1;
            acdGroup.selected.push(toAddId);
            var agentObj = agentList.filter(function (v) { return v.AgentID == toAddId })[0];
            agentObj.selectedCount += 1;
            agentObj.selected.push(changingId);
        } else {
            var alertStr = '<div id="' + alertId + '" class="alert alert-danger d-grid"><strong>Fail!</strong>&nbsp;&nbsp;ACD ID: ' + changingId + ' failed to add Agent ID: ' + toAddId + '&nbsp;&nbsp;&nbsp;<button type="button" class="btn-close" data-bs-dismiss="alert">x</button></div>'
            $('#alert-container').append(alertStr);
            delayMiliSec = 20000;
        }
        $('#' + alertId).delay(delayMiliSec).slideUp(200, function () {
            $(this).alert('close');
        });
        toAddArr.splice(0, 1);
        if (toAddArr.length > 0) {
            ppc.wiseAddACDGroupMember(changingId, toAddArr[0]);
        //} else {  // 20250410 'If' statement should not be the only statement in 'else' block
            // Refresh both table
        } else if (toDelArr.length == 0) {
                refreshAcdAgentTbl();
                $('#save-acd-agent-selected-a').removeClass('disabled');
                $('#save-agent-acd-selected-a').removeClass('disabled');
          //  } // 20250410 for else if 
        }
    } else {
        var ppc = window.opener.document.getElementById("phone-panel").contentWindow;
        if (res.result == 'success') {
            var alertStr = '<div id="' + alertId + '" class="alert alert-success d-grid"><strong>Success!</strong>&nbsp;Agent ID: ' + changingId + ' is added to ACD ID: ' + toAddId + '&nbsp;&nbsp;&nbsp;<button type="button" class="btn-close" data-bs-dismiss="alert">x</button></div>'
            $('#alert-container').append(alertStr);
            var acdGroup = acdMembersArr.filter(function (v) { return v.AcdGroupID == toAddId })[0];
            acdGroup.selectedCount += 1;
            acdGroup.selected.push(changingId);
            var agentObj = agentList.filter(function (v) { return v.AgentID == changingId })[0];
            agentObj.selectedCount += 1;
            agentObj.selected.push(toAddId);
        } else {
            var alertStr = '<div id="' + alertId + '" class="alert alert-danger d-grid"><strong>Fail!</strong>&nbsp;Agent ID: ' + changingId + ' failed to be added to ACD ID: ' + toAddId + '&nbsp;&nbsp;&nbsp;<button type="button" class="btn-close" data-bs-dismiss="alert">x</button></div>'
            $('#alert-container').append(alertStr);
            delayMiliSec = 20000;
        }
        $('#' + alertId).delay(delayMiliSec).slideUp(200, function () {
            $(this).alert('close');
        });
        toAddArr.splice(0, 1);
        if (toAddArr.length > 0) {
            ppc.wiseAddACDGroupMember(toAddArr[0], changingId);
        //} else { // 20250410 for 'If' statement should not be the only statement in 'else' block
            // Refresh both table
        } else if (toDelArr.length == 0) {
                refreshAcdAgentTbl();
                $('#save-acd-agent-selected-a').removeClass('disabled');
                $('#save-agent-acd-selected-a').removeClass('disabled');
           // } // 20250410 for else if 
        }
    }
}

function onDelAcdMember(res) {
    var ppc = window.opener.document.getElementById("phone-panel").contentWindow;
    var toDelId = toDelArr[0];
    var alertId = changingId + 'del' + toDelId;
    var delayMiliSec = 4000;

    // close sending request bubble
    $('#del-sending-request').slideUp(200, function () {
        $(this).alert('close');
    });

    if (isAcdToAgent) {
        if (res.result == 'success') {
            var alertStr = '<div id="' + alertId + '" class="alert alert-success"><strong>Success! </strong>&nbsp;ACD ID: ' + changingId + ' deleted Agent ID: ' + toDelId + '&nbsp;&nbsp;&nbsp;<button type="button" class="btn-close" data-bs-dismiss="alert">x</button></div>'
            $('#alert-container').append(alertStr);
            var acdGroup = acdMembersArr.filter(function (v) { return v.AcdGroupID == changingId })[0];
            acdGroup.selectedCount = acdGroup.selectedCount - 1;
            var toDelAgentIdx = acdGroup.selected.indexOf(toDelId);
            if (toDelAgentIdx !== -1) acdGroup.selected.splice(toDelAgentIdx, 1);
            var agentObj = agentList.filter(function (v) { return v.AgentID == toDelId })[0];
            agentObj.selectedCount = agentObj.selectedCount - 1;
            var toDelAcdIdx = agentObj.selected.indexOf(changingId);
            if (toDelAcdIdx !== -1) agentObj.selected.splice(toDelAcdIdx, 1);
        } else {
            var alertStr = '<div id="' + alertId + '" class="alert alert-danger"><strong>Fail! </strong>&nbsp;ACD ID: ' + changingId + ' failed to delete Agent ID:' + toDelId + '&nbsp;&nbsp;&nbsp;<button type="button" class="btn-close" data-bs-dismiss="alert">x</button></div>'
            $('#alert-container').append(alertStr);
            delayMiliSec = 10000;
        }
        $('#' + alertId).delay(delayMiliSec).slideUp(200, function () {
            $(this).alert('close');
        });
        toDelArr.splice(0, 1);
        if (toDelArr.length > 0) {
            ppc.wiseDelACDGroupMember(changingId, toDelArr[0]);
        //} else {  // 20250410 'If' statement should not be the only statement in 'else' block
            // Refresh both table
        } else if (toAddArr.length == 0) {
                refreshAcdAgentTbl();
                $('#save-acd-agent-selected-a').removeClass('disabled');
                $('#save-agent-acd-selected-a').removeClass('disabled');
          //  } // 20250410 for else if 
        }
    } else {
        if (res.result == 'success') {
            var alertStr = '<div id="' + alertId + '" class="alert alert-success"><strong>Success! </strong>&nbsp;Agent ID: ' + changingId + ' deleted from ACD ID: ' + toDelId + '&nbsp;&nbsp;&nbsp;<button type="button" class="btn-close" data-bs-dismiss="alert">x</button></div>'
            $('#alert-container').append(alertStr);
            var acdGroup = acdMembersArr.filter(function (v) { return v.AcdGroupID == toDelId })[0];
            acdGroup.selectedCount = acdGroup.selectedCount - 1;
            var toDelAgentIdx = acdGroup.selected.indexOf(changingId);
            if (toDelAgentIdx !== -1) acdGroup.selected.splice(toDelAgentIdx, 1);
            var agentObj = agentList.filter(function (v) { return v.AgentID == changingId })[0];
            agentObj.selectedCount = agentObj.selectedCount - 1;
            var toDelAcdIdx = agentObj.selected.indexOf(toDelId);
            if (toDelAcdIdx !== -1) agentObj.selected.splice(toDelAcdIdx, 1);
        } else {
            var alertStr = '<div id="' + alertId + '" class="alert alert-danger"><strong>Fail! </strong>&nbsp;Agent ID: ' + changingId + ' failed to be deleted from ACD ID:' + toDelId + '&nbsp;&nbsp;&nbsp;<button type="button" class="btn-close" data-bs-dismiss="alert">x</button></div>'
            $('#alert-container').append(alertStr);
            delayMiliSec = 10000;
        }
        $('#' + alertId).delay(delayMiliSec).slideUp(200, function () {
            $(this).alert('close');
        });
        toDelArr.splice(0, 1);
        if (toDelArr.length > 0) {
            ppc.wiseDelACDGroupMember(toDelArr[0], changingId);
        //} else { // 20250410 'If' statement should not be the only statement in 'else' block
            // Refresh both table
        } else if (toAddArr.length == 0) {
                refreshAcdAgentTbl();
                $('#save-acd-agent-selected-a').removeClass('disabled');
                $('#save-agent-acd-selected-a').removeClass('disabled');
           // }// // 20250410 for else if 
        }
    }
}

function onMonitorIVRSCount(ivrNum) {

    // ivr # of all hotlines
    $('#ivr-num').text(ivrNum);
}

function saveAcdAgentSelected() {

    // wise mon middleware will process order 1 by 1, sometimes could be very slow, especially when just login and open wise mon
    if (toAddArr.length > 0 || toDelArr.length > 0) {
        alert('Previous action has not been done yet, please wait and try again');
    } else {
        var selectedAcdData = acdTbl.rows(".highlight").data()[0];

        // It is possible selectedAcdData is undefined if supervisor not any access right
        if (selectedAcdData) {
            changingId = selectedAcdData.AcdGroupID;
            var originalSelected = selectedAcdData.selected;
            var newChecked = $('#agent-cb-tbl tbody .form-check-input:checked').map(function () {
                return parseInt($(this).val());
            }).get();

            // Compare 2 arrays added or deleted
            var addedArr = getAddedArr(originalSelected, newChecked);
            var deletedArr = getDeletedArr(originalSelected, newChecked);
            var ppc = window.opener.document.getElementById("phone-panel").contentWindow;
            if (addedArr.length == 0 && deletedArr.length == 0) {
                alert('No changes has been made');
                return;
            }
            if (addedArr.length > 0) {
                ppc.wiseAddACDGroupMember(changingId, addedArr[0]);
                toAddArr = addedArr;
                // disable button
                $('#save-acd-agent-selected-a').addClass('disabled');

                // show sending request bubble, the alert will close when reponse got
                var addAlertStr = '<div id="add-sending-request" class="alert alert-info d-grid"><strong>Sending add request, this could take a while, please do not leave the page...&nbsp;&nbsp;</strong><button type="button" class="btn-close" data-bs-dismiss="alert">x</button></div>'
                $('#alert-container').append(addAlertStr);
            }
            if (deletedArr.length > 0) {
                ppc.wiseDelACDGroupMember(changingId, deletedArr[0]);
                toDelArr = deletedArr;
                $('#save-acd-agent-selected-a').addClass('disabled');

                // show sending request bubble, the alert will close when reponse got
                var delAlertStr = '<div id="del-sending-request" class="alert alert-info d-grid"><strong>Sending delete request, this could take a while, please do not leave the page...&nbsp;&nbsp;</strong><button type="button" class="btn-close" data-bs-dismiss="alert">x</button></div>'
                $('#alert-container').append(delAlertStr);
            }
        }
    }
}

function saveAgentAcdSelected() {

    // wise mon middleware will process order 1 by 1, sometimes could be very slow, especially when just login and open wise mon
    if (toAddArr.length > 0 || toDelArr.length > 0) {
        alert('Previous action has not been done yet, please wait and try again');
    } else {
        var selectedAgentData = agentTbl.rows(".highlight").data()[0]
        changingId = selectedAgentData.AgentID;
        var originalSelected = selectedAgentData.selected;
        var newChecked = $('#acd-cb-tbl tbody .form-check-input:checked').map(function () {
            return parseInt($(this).val());
        }).get();
        var addedArr = getAddedArr(originalSelected, newChecked);
        var deletedArr = getDeletedArr(originalSelected, newChecked);
        var ppc = window.opener.document.getElementById("phone-panel").contentWindow;
        if (addedArr.length == 0 && deletedArr.length == 0) {
            alert('No changes has been made');
            return;
        }
        if (addedArr.length > 0) {
            ppc.wiseAddACDGroupMember(addedArr[0], changingId);
            toAddArr = addedArr;
            $('#save-agent-acd-selected-a').addClass('disabled');

            // show sending request bubble, the alert will close when reponse got
            var addAlertStr = '<div id="add-sending-request" class="alert alert-info d-grid"><strong>Sending add request, this could take a while, please do not leave the page...&nbsp;&nbsp;</strong><button type="button" class="btn-close" data-bs-dismiss="alert">x</button></div>'
            $('#alert-container').append(addAlertStr);
        }
        if (deletedArr.length > 0) {
            ppc.wiseDelACDGroupMember(deletedArr[0], changingId);
            toDelArr = deletedArr;
            $('#save-agent-acd-selected-a').addClass('disabled');

            // show sending request bubble, the alert will close when reponse got
            var delAlertStr = '<div id="del-sending-request" class="alert alert-info d-grid"><strong>Sending delete request, this could take a while, please do not leave the page...&nbsp;&nbsp;</strong><button type="button" class="btn-close" data-bs-dismiss="alert">x</button></div>'
            $('#alert-container').append(delAlertStr);
        }
    }
}

function saveSuperAcdSelected() {

    // Avoid user add button by themselves, check is the user super's super
    if (amIXR) {
        var highlightedRow = superTbl.row(".highlight");
        var selectedSuperData = highlightedRow.data();
        var hightedRowIdx = highlightedRow.index();
        var superId = selectedSuperData.AgentID;
        var originalSelected = selectedSuperData.superSelected || []; // for super tbl superSelected can be undefined
        var newChecked = $('#super-acd-tbl tbody .form-check-input:checked').map(function () {
            return parseInt($(this).val());
        }).get();
        /// Compare 2 arrays added or deleted
        var addedArr = getAddedArr(originalSelected, newChecked);
        var deletedArr = getDeletedArr(originalSelected, newChecked);

        var setting = [];
        for (let added of addedArr) {
            setting.push({ groupId: added, accessible: true });
        }
        for (let deleted of deletedArr) {
            setting.push({ groupId: deleted, accessible: false });
        }
        if (setting.length == 0) {
            alert('No changes has been made');
        } else {
            var submitData = { agentId: superId };
            submitData.setting = setting;
            $.ajax({
                type: "POST",
                url: wiseHost + '/WisePBX/api/config/UpdateACDGroupAccessList',
                data: JSON.stringify(submitData),
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).always(function (r) {
                if (r.result == 'success') {
                    // Add superSlected and superCount
                    if (r.result == 'success') {
                        var superObj = superData.filter(function (v, i) { return v.AgentID == superId })[0];
                        var superCount = 0;
                        var superSelected = [];
                        var accessList = r.data;
                        for (let accessObj of accessList) {
                            if (accessObj.Accessible) {
                                superCount += 1;
                                superSelected.push(accessObj.AcdGroupID);
                            }
                        }
                        superObj.superCount = superCount;
                        superObj.superSelected = superSelected;
                        $('#super-tbl').DataTable().clear();
                        $('#super-tbl').DataTable().rows.add(superData); // Add new data
                        $('#super-tbl').DataTable().columns.adjust().draw(); // Redraw the DataTable
                        $('#super-tbl tbody tr:eq(' + hightedRowIdx + ')').trigger("click");
                        for (let submitObj of setting) {
                            var groupId = submitObj.groupId;
                            var accessible = submitObj.accessible;
                            var alertId = 's' + (accessible ? 'add' : 'del') + groupId;
                            var addDelStr = accessible ? 'added' : 'removed';
                            var alertStr = '<div id="' + alertId + '" class="alert alert-success d-grid"><strong>Success!</strong>&nbsp;&nbsp;Super ID: ' + superId + ' ' + addDelStr + ' access to ACD Group: ' + groupId + '. User will need to re-login to refresh&nbsp;&nbsp;&nbsp;<button type="button" class="btn-close" data-bs-dismiss="alert">x</button></div>';
                            $('#alert-container').append(alertStr);
                            $('#' + alertId).delay(4000).slideUp(200, function () {
                                $(this).alert('close');
                            });
                        }
                    } else {
                        for (let submitObj of submitData) {
                            var accessible = submitObj.accessible;
                            var alertId = 's' + (accessible ? 'add' : 'del') + groupId;
                            var addDelStr = accessible ? 'add' : 'remove';
                            var alertStr = '<div id="' + alertId + '" class="alert alert-success d-grid"><strong>Fail!</strong>&nbsp;&nbsp;Super ID: ' + superId + ' failed to ' + addDelStr + ' access to ACD Group: ' + groupId + '. User will need to re-login to refresh&nbsp;&nbsp;&nbsp;<button type="button" class="btn-close" data-bs-dismiss="alert">x</button></div>';
                            $('#alert-container').append(alertStr);
                            $('#' + alertId).delay(20000).slideUp(200, function () {
                                $(this).alert('close');
                            });
                        }
                        $('#super-tbl tbody tr:eq(' + hightedRowIdx + ')').trigger("click");
                    }
                }
            });
        }
    }
}

function initAgentTbl() {
    agentTbl = $('#agent-tbl').DataTable({
        data: agentList,
        lengthChange: true, // not showing 'Show ? per page' dropdown
        language: {
            "paginate": {
                "previous": "PREV"
            }
        },
        scrollY: 'calc(100vh - 200px)', // no button underneath
        scrollCollapse: true,
        paging: false,
        searching: false,
        info: false,
        aaSorting: [[0, "asc"]],
        columns: [
            { title: "ID", data: "AgentID" },
            { title: "Agent", data: "AgentName" },
            { title: "Sel.", data: "selectedCount" }
        ],
        columnDefs: [
            {
                targets: 1, // Name can be long, need to know complete name, but don't want always scroll to right or left, so used title
                render: function (data, type, row) {
                    return ('<span title="' + data + '">' + data + '</span>');
                }
            }, {
                targets: 2,
                render: function (data, type, row) {
                    return '<span val="' + data + '">' + data + '</span>'; // For Easier Getting Data
                }
            }]
    });

    agentCbTbl = $('#agent-cb-tbl').DataTable({
        data: agentList,
        lengthChange: true,
        language: {
            "paginate": {
                "previous": "PREV"
            }
        },
        scrollY: 'calc(100vh - 235px)',  // got button underneath
        scrollCollapse: true,
        paging: false,
        searching: false,
        info: false,
        aaSorting: [[0, "asc"]],
        columnDefs: [
            {
                targets: 1, // Name can be long, need to know complete name, but don't want always scroll to right or left, so used title
                render: function (data, type, row) {
                    return ('<span title="' + data + '">' + data + '</span>');
                }
            }, {
                targets: 2,
                orderable: false,
                render: function (data, type, row) {
                    return '<div class="form-check" style="margin-top:-16px">' +
                        '<label class="form-check-label">' +
                        '<input class="form-check-input" type="checkbox" id="' + row.AgentID + '" value="' + row.AgentID + '">' +
                        '<span class="form-check-sign"><span class="check" data-bs-toggle="tooltip" data-bs-placement="right"></span></span></label></div>';
                }
            }
        ],
        columns: [
            { title: "ID", data: "AgentID" },
            { title: "Agent", data: "AgentName" },
            { title: "" }
        ]
    });
    $('#agent-cb-tbl tbody').on('change', '.form-check-input', function () {
        var checkedLen = $('#agent-cb-tbl tbody .form-check-input:checked').length;
        $(agentCbTbl.column(2).header()).text(('Sel. (' + checkedLen + ')'));
    });
    // tbody needed to avoid clicking th will fire this event also
    $('#agent-tbl tbody').on('click', 'tr', function () {
        var data = agentTbl.row($(this)).data();
        agentTbl.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
        $(this).addClass('highlight')
        var originalVal = $(this).find('td:eq(2) span').attr('val');
        $(acdCbTbl.column(2).header()).text(('Sel. (' + originalVal) + ')');
        initAcdChecked(data.selected);
        if (event) {
            event.preventDefault();
        }
        if (!isAcdToAgent) {
            acdOrAgentRowtIdx = $(this).index();
        }
    });
    $('#agent-tbl tbody tr:eq(0)').trigger('click');
    $('#acd-tbl tbody tr:eq(0)').trigger('click');
}

function initSuperChecked(selectedAcd) {
    if (amIXR) {
        superAcdTbl.$('.form-check-input').prop('checked', false);
        // For super tbl, if no selected selectedAcd should be undefined
        if (selectedAcd != undefined) {
            for (let theSelected of selectedAcd) {
                superAcdTbl.$('#spa-' + theSelected).prop('checked', true);
            }
        }
    } else {
        superAcdTbl.$('.fa-check').remove();
        // For super tbl, if no selected selectedAcd should be undefined
        if (selectedAcd != undefined) {
            for (let theSelected of selectedAcd) {
                superAcdTbl.$('#spa-' + theSelected).append('<i class="fas fa-check text-info"></i>');
            }
        }
    }
}

function getSuperData() {
    var dbAgentArr = [];
    superList.forEach(function (v, i) { dbAgentArr.push(v.AgentID) });
    // Application AgentList
    $.ajax({
        type: "POST",
        url: wiseHost + '/WisePBX/api/config/GetSupervisorList',
        data: JSON.stringify({ agentIds: dbAgentArr }),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).always(function (r) {
        if (r.result != 'success') {
            alert('error on loading supervisor list');
            return;
        }

        // only LV 3 or LV 4 agents are super
        var superArr = r.data || [];
        var superArrLen = superArr.length;
        var quried = 0;
        $.each(superArr, function (idx, val) {
            var superId = val.AgentID;

            // to know am I a super user
            if (superId == loginId && val.LevelID >= XRLv) { amIXR = true }

            // get super user access list
            $.ajax({
                type: "POST",
                url: wiseHost + '/WisePBX/api/config/GetACDGroupAccessList',
                data: JSON.stringify({ agentId: superId }),
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).always(function (res) {
                var accessList = res.data;
                if (res.result == 'success') {
                    for (let accessObj of accessList) {
                        if (accessObj.Accessible) {
                            if (superArr[idx].superCount == undefined) {
                                superArr[idx].superCount = 1;
                            } else {
                                superArr[idx].superCount += 1;
                            }

                            if (superArr[idx].superSelected == undefined) {
                                superArr[idx].superSelected = [accessObj.AcdGroupID]
                            } else {
                                superArr[idx].superSelected.push(accessObj.AcdGroupID);
                            }
                        }
                    }
                }
                quried += 1;
                if (amIXR && quried == superArrLen) {
                    superData = superArr;
                    loadAcdAccessList();
                    initSuperTbl();
                }
            });
        });
    });
}

function initSuperTbl() {
    superTbl = $('#super-tbl').DataTable({
        data: superData,
        lengthChange: true, // not showing 'Show ? per page' dropdown
        language: {
            "paginate": {
                "previous": "PREV"
            }
        },
        scrollY: 'calc(100vh - 200px)', // no button underneath
        scrollCollapse: true,
        paging: false,
        searching: false,
        info: false,
        aaSorting: [[0, "asc"]],
        columnDefs: [
        ],
        columns: [
            { title: "ID", data: "AgentID" },
            {   // Name can be long, need to know complete name, but don't want always scroll to right or left, so used title
                title: "Supervisor", data: "AgentName", render: function (data, type, row) {
                    if (row.LevelID >= XRLv) { return '<span title="' + data + '">' + data + '&nbsp;&nbsp;<i class="fas fa-key text-warning"></i></span>' }
                    else
                        return ('<span title="' + data + '">' + data + '</span>');
                }
            },
            { title: "Sel.", data: "superCount", render: function (data) { return data == undefined ? '<span val="' + 0 + '">' + 0 + '</span>' : '<span val="' + data + '">' + data + '</span>' } }
        ]
    });

    $('#super-tbl tbody').on('click', 'tr', function () {
        var data = superTbl.row($(this)).data();
        superTbl.$('tr.highlight').removeClass('highlight'); // $('xxx tbody tr) will not select other pages not showing, do not use this selector
        $(this).addClass('highlight');
        var originalVal = $(this).find('td:eq(2) span').attr('val');
        $(superAcdTbl.column(2).header()).text('Sel. (' + originalVal + ')');
        initSuperChecked(data.superSelected);
        if (event) {
            event.preventDefault();
        }
    });
    // If super acd table already loaded, select first
    if (superAcdTbl) {
        $("#super-tbl tbody tr:eq(0)").trigger("click");
    }
}

function initAgentChecked(memberArr) {

    // All Checkbox Clear First
    agentCbTbl.$('.form-check-input').prop('checked', false);

    // Check Selected Agent
    for (let member of memberArr) {
        agentCbTbl.$('#' + member).prop('checked', true);
    }
}

// =========================== ACD Related Functions ===========================

function getACDMember(joinedArr) {
    if (joinedArr.length > 0) {
        acdMembersArr = joinedArr.slice(); // to avoide joined arr affact this array
        acdLength = acdMembersArr.length;
        for (let acdMember of acdMembersArr) {
            window.opener.document.getElementById("phone-panel").contentWindow.wiseGetACDGroupMember(acdMember.AcdGroupID);
        }

        // if 5 seconds later still not getting all member of acd, will still init acd table. because in older version of Wise did not return acd member command if no member for the acd
        setTimeout(function () {
            if (acdTbl == null) {

                // before init table need to set no agent selected for hte group
                acdMembersArr.forEach(function (v) {

                    // if no v.selectedCount it will be null
                    if (v.selectedCount == null) {
                        v.selectedCount = 0;
                        v.selected = [];
                    }
                })
                initACDTbl()
            }
        }, 5000)
    } else {
        initACDTbl();
    }
}

function gotACDMember(groupDetails) {
    acdLength = acdLength - 1;
    var acdGroup = acdMembersArr.filter(function (v) { return v.AcdGroupID == groupDetails.GroupID })[0];
    var groupMember = groupDetails.Member;
    if (acdGroup != undefined) {
        var selected = [];

        // no agent still need to set 2 parameter to the object: selected & selectedCount
        if (groupMember == null) {
            acdGroup.selectedCount = 0;
        } else {
            for (var i = 0; i < groupMember.length; i++) {
                var memberId = groupMember[i].AgentID;
                selected[i] = memberId;
                for (let agentObj of agentList) {
                    if (agentObj.AgentID == memberId) {
                        agentObj.selected.push(acdGroup.AcdGroupID);
                        agentObj.selectedCount += 1;
                    }
                }
            }
            acdGroup.selectedCount = groupMember.length;
        }
        acdGroup.selected = selected;
    }
    if (acdLength == 0) {
        initACDTbl();
    }
}
// =========================== /ACD Related Functions ===========================
function switchContent(selected) {
    // No need to change any if same category
    if (selected == selectedCat) {
        return;
    }

    if (selected == 'Agent & ACD' && !amIXR) {
        alert("Please contact IT support to grant the supervisor rights");
        return;
    }
    // original category change
    switch (selectedCat) {
        case 'Agent & ACD':
            $('#agent-acd').addClass('d-none');
            break;
        case 'Live Monitor':
            $('#live-monitor').addClass('d-none');
            if (wallIntFn) {
                clearInterval(wallIntFn);
                wallIntFn = null;
            }
            break;

        // deprecated
        // case 'Voice Log Search':
        //     $('#voice-log-search').addClass('d-none');
        //     break;
        case 'Floor Plan':
            $('#floor-plan').addClass('d-none');
            $('#fp-container').empty();
            break;
        default:
            break;
    }

    // future category action
    switch (selected) {
        case 'Agent & ACD':
            $('#agent-acd').removeClass('d-none');

            // table couble be not loaded yet, if loaded add adjust the column width
            if (acdTbl) {
                acdTbl.columns.adjust().draw(false);
            }
            if (agentCbTbl) {
                agentCbTbl.columns.adjust().draw(false);
            }
            if (superTbl) {
                superTbl.columns.adjust().draw(false);
            }
            if (superAcdTbl) {
                superAcdTbl.columns.adjust().draw(false);
            }
            if (agentTbl) {
                agentTbl.columns.adjust().draw(false);
            }
            if (acdCbTbl) {
                acdCbTbl.columns.adjust().draw(false);
            }
            break;
        case 'Live Monitor':
            $('#live-monitor').removeClass('d-none');
            addWallIntFnIfSelected();
            agentStatusTbl.columns.adjust().draw(false); // In case when open this page, agent not yet loaded and switched to another page
            if (splitASTbl) { agentStatusTbl2.columns.adjust().draw(false); }

            break;

        // deprecated
        // case 'Voice Log Search':
        //     $('#voice-log-search').removeClass('d-none');
        //     break;
        case 'Floor Plan':
            $('#floor-plan').removeClass('d-none');
            break;
        default:
            break;
    }

    selectedCat = selected;
}