var data1Line = null;
var data2Line = null;
var data3Line = null;
var data4Line = null;
var ibTraLine = null;
var ibTraDou = null;
var obTraLine = null;
var obTraDou = null;
var ibSoLine = null;
var ibSoDou = null;
var data1ArrObj = {};
var data2ArrObj = {};
var data3ArrObj = {};
var data4ArrObj = {};
var periodObj = {};
var inCallArrObj = {};
var inVMArrObj = {};
var inEmailArrObj = {};
var inFaxArrObj = {};
var inWebChatArrObj = {};
var inWeChatArrObj = {};
var inFbMsgArrObj = {};
var inWhatsappArrObj = {};
var outCallArrObj = {};
var outSMSArrObj = {};
var outEmailArrObj = {};
var outFaxArrObj = {};
var inTraSumObj = {};
var outTraSumObj = {};
var inSocSumObj = {};
var inTraDouObj = {}
var outTraDoubj = {};
var inSocDouObj = {};

var inTraAgentObj = {};
var outTraAgentObj = {};
var inSocAgentObj = {};

var channelType = 'ib';
var channelTime = 'today';
var campaign = parent.campaign;
var mvcHost = config.mvcHost;
var wiseHost = config.wiseHost;
var agentStrArr = [];
var loginId = parseInt(sessionStorage.getItem('scrmAgentId') || -1);
var token = sessionStorage.getItem('scrmToken') || '';

var langJson = JSON.parse(sessionStorage.getItem('scrmLangJson')) || {};

function channelTypeChanged(type) {
    // if same as previous, return;
    if (type == channelType) {
        return;
    }
    channelType = type;
    if (type == 'ib') {
        md.loadIB(channelTime);
    } else if (type == 'ob') {
        md.loadOB(channelTime);
    } else if (type == 'social') {
        md.loadSocial(channelTime);
    }
}

function channelTimeChanged(period) {
    // if same as previous, return;
    if (period == channelTime) {
        return;
    }
    channelTime = period;
    if (channelType == 'ib') {
        md.loadIB(period);
    } else if (channelType == 'ob') {
        md.loadOB(period);
    } else if (channelType == 'social') {
        md.loadSocial(period);
    }
}

function resize() {
    var body = document.body,
        html = document.documentElement;
    var newHeight = Math.ceil((Math.max(body.scrollHeight, body.offsetHeight,
        html.offsetHeight))) || 500;
    parent.document.getElementById("search").height = newHeight + 'px'; //將子頁面高度傳到父頁面框架 // no need to add extra space
}

// resize before charts loaded looks better
resize();

function refreshData() {
    // Get Date First
    periodObj['last30'] = getLast30Days();
    periodObj['last14'] = periodObj['last30'].slice(16, 30);
    periodObj['last7'] = periodObj['last14'].slice(7, 14);
    // Get And Set Line Charts, etc
    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/GetDashboard_CallNature',
        data: JSON.stringify({
            "Call_Nature": "Enquiry",
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            console.log("GetDashboard_CallNature error /n" + r ? r : '');
        } else {
            data1ArrObj['last30'] = JSON.parse(r.details);
            data1ArrObj['last14'] = data1ArrObj['last30'].slice(16, 30);
            data1ArrObj['last7'] = data1ArrObj['last14'].slice(7, 14);
            md.initData1Line('last7');
            $('#data-1-today').html(data1ArrObj['last7'][6]);
        }
    });

    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/GetDashboard_CallNature',
        data: JSON.stringify({
            "Call_Nature": "Feedback",
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            console.log("GetDashboard_CallNature error /n" + r ? r : '');
        } else {
            data2ArrObj['last30'] = JSON.parse(r.details);
            data2ArrObj['last14'] = data2ArrObj['last30'].slice(16, 30);
            data2ArrObj['last7'] = data2ArrObj['last14'].slice(7, 14);
            md.initData2Line('last7');
            $('#data-2-today').html(data2ArrObj['last7'][6]);
        }
    });

    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/GetDashboard_CallNature',
        data: JSON.stringify({
            "Call_Nature": "Complaint",
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            console.log("GetDashboard_CallNature error /n" + r ? r : '');
        } else {
            data3ArrObj['last30'] = JSON.parse(r.details);
            data3ArrObj['last14'] = data3ArrObj['last30'].slice(16, 30);
            data3ArrObj['last7'] = data3ArrObj['last14'].slice(7, 14);
            md.initData3Line('last7');
            $('#data-3-today').html(data3ArrObj['last7'][6]);
        }
    });

    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/GetDashboard_CallNature',
        data: JSON.stringify({
            "Call_Nature": "Compliment",
            Agent_Id: loginId,
            Token: token
        }),
        crossDomain: true,
        contentType: "application/json",
        dataType: 'json'
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            console.log("GetDashboard_CallNature error /n" + r ? r : '');
        } else {
            data4ArrObj['last30'] = JSON.parse(r.details);
            data4ArrObj['last14'] = data4ArrObj['last30'].slice(16, 30);
            data4ArrObj['last7'] = data4ArrObj['last14'].slice(7, 14);
            md.initData4Line('last7');
            $('#data-4-today').html(data4ArrObj['last7'][6]);
        }
    });

    $.ajax({
        type: "POST",
        url: mvcHost + '/mvc' + campaign + '/api/CaseManualSearch',
        //Is_ Current by default "N" ( = will search case log by default)
        data: JSON.stringify({"anyAll":"all","searchArr":[
            {"field_name":"Created_Time","logic_operator":"=","value":new Date().toISOString().slice(0,10),"field_type":"datetime","list_name":"Case List"}],
            "Is_Valid":"Y",
            Agent_Id: loginId,
            Token: token}),
        contentType: "application/json",
        dataType: 'json',
        success: function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in CaseManualSearch');
                console.log(r);
            } else {
                var caseArr = r.details;
                $('#data-5-today').html(caseArr.length);
                var closedNum = 0;
                for (var caseObj of caseArr) {
                    if (caseObj.Status == 'Closed') {
                        closedNum += 1;
                    }
                }
                $('#data-6-today').html(closedNum);
            }
        },
        error: function (r) {
            console.log('error in CaseManualSearch');
            console.log(r);
        }
    });


    md.loadMediaData();

    // last row
    // md.loadAgentNature('Today', true); // md.loadAgentMedia(); after loaded agent by this function
    md.loadAgentNature('Last30', true);
    
}

$(document).ready(function () {
    refreshData();
    $('a.nav-link').on('click', function (e) {
        $('.tab-pane').removeClass('in active');
        var href = $(this).attr('href');
        $(href).addClass('in active');
    });
    setTimeout(function () { resize(); }, 600); // Need time to be loaded first
    if (parent.parent.iframeRecheck) {
        parent.parent.iframeRecheck($(parent.document));
    }


});

function getLast30Days() {
    var weekdayArr = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    var dateArr = [];
    for (var i = 29; i > -1; --i) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        var m = d.getMonth() + 1; //months from 1-12
        var wkD = d.getDay();
        var d = d.getDate();
        var simpleDate = [weekdayArr[wkD], m + '/' + d];
        dateArr.push(simpleDate);
    }
    return dateArr;
}

function sumArr(arr) {
    var sum = 0;
    for (let ele of arr) {
        sum += ele;
    }
    return sum;
}

function addData(chart, label, data) {
    chart.data.labels = label;
    chart.data.datasets[0].data = data;
    chart.update();
}

function removeData(chart) {
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.update();
}
var md = {
    initMediaTodayCharts: function (todayTraIbArr, todayTraOutArr, todaySocialInArr) {

        /* ----------==========   Row 3 - 1st Chart   ==========---------- */
        var thridFirstLblArr = ['Call', 'VM', 'Email', 'Fax'];
        new Chart(document.getElementById("ib-trad-bar"), {
            "type": "bar",
            "data": {
                "labels": thridFirstLblArr,
                "datasets": [{
                    // "label":"Email Subscriped",
                    "data": todayTraIbArr,
                    "backgroundColor": "rgba(255,255,255,0.8)",
                    "borderColor": "rgba(255,255,255,0.8)",
                    "fill": false,
                    barThickness: 50,
                    // maxBarThickness: 8,
                    // minBarLength: 2,
                }]
            },
            "options": {
                maintainAspectRatio: false, // will not auto high
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        "gridLines": {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            fontColor: "rgba(255,255,255,0.8)"
                        }
                    }],
                    yAxes: [{
                        "gridLines": {
                            "color": "rgba(255,255,255,0.15)",
                            zeroLineColor: "rgba(255,255,255,0.15)",
                            borderDash: [3, 3]
                        },
                        ticks: {
                            fontColor: "rgba(255,255,255,0.8)",
                            beginAtZero: true,
                            stepSize: 1 // no deciaml to be shown when all numbers are 0
                        }
                    }]
                }
            }
        });

        /* ----------==========     Row 3 - 2nd Chart    ==========---------- */
        var thridSecLblArr = ['Call', 'SMS', 'Email', 'Fax'];

        new Chart(document.getElementById("ob-trad-bar"), {
            "type": "bar",
            "data": {
                "labels": thridSecLblArr,
                "datasets": [{
                    // "label":"Email Subscriped",
                    "data": todayTraOutArr,
                    "backgroundColor": "rgba(255,255,255,0.8)",
                    "borderColor": "rgba(255,255,255,0.8)",
                    "fill": false,
                    // scaleLineColor: 'rgba(0,0,0,0)', not work
                    // barPercentage: 0.5,
                    barThickness: 50,
                    // maxBarThickness: 8,
                    // minBarLength: 2,
                }]
            },
            "options": {
                maintainAspectRatio: false, // will not auto high
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        "gridLines": {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            fontColor: "rgba(255,255,255,0.8)"
                        }
                    }],
                    yAxes: [{
                        "gridLines": {
                            "color": "rgba(255,255,255,0.15)",
                            zeroLineColor: "rgba(255,255,255,0.15)",
                            borderDash: [3, 3]
                        },
                        ticks: {
                            fontColor: "rgba(255,255,255,0.8)",
                            beginAtZero: true,
                            stepSize: 1 // no deciaml to be shown when all numbers are 0
                        }
                    }]
                }
            }
        });
        /* ----------==========  Row 3 - 3rd Chart    ==========---------- */
        var rdRdlblArr = ['Web Chat', 'WeChat', 'FB Messenger', 'WhatsApp'];
        // var rdRdValAr = [15,4,30,2];
        new Chart(document.getElementById("ib-social-bar"), {
            "type": "bar",
            "data": {
                "labels": rdRdlblArr,
                "datasets": [{
                    // "label":"Email Subscriped",
                    "data": todaySocialInArr,
                    "backgroundColor": "rgba(255,255,255,0.8)",
                    "borderColor": "rgba(255,255,255,0.8)",
                    "fill": false,
                    // scaleLineColor: 'rgba(0,0,0,0)', not work
                    // barPercentage: 0.5,
                    barThickness: 50,
                    // maxBarThickness: 8,
                    // minBarLength: 2,
                }]
            },
            "options": {
                maintainAspectRatio: false, // will not auto high
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        "gridLines": {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            fontColor: "rgba(255,255,255,0.8)"
                        }
                    }],
                    yAxes: [{
                        "gridLines": {
                            "color": "rgba(255,255,255,0.15)",
                            zeroLineColor: "rgba(255,255,255,0.15)",
                            borderDash: [3, 3]
                        },
                        ticks: {
                            fontColor: "rgba(255,255,255,0.8)",
                            beginAtZero: true,
                            stepSize: 1 // no deciaml to be shown when all numbers are 0
                        }
                    }]
                }
            }
        });
    },
    initData1Line: function (period) { // period: 'last7','last14','last30'
        /* ----------==========   Row 2 - 1st Chart   ==========---------- */
        var dateArr = periodObj[period];
        if (data1Line) {
            removeData(data1Line);
            addData(data1Line, dateArr, data1ArrObj[period]);
        } else {
            data1Line = new Chart(document.getElementById("data-1-line"), {
                "type": "line",
                "data": {
                    "labels": dateArr,
                    "datasets": [{
                        // "label":"Opened Case", tooltip title will now show this label
                        "data": data1ArrObj[period],
                        "backgroundColor": "rgba(255,255,255,0.8)",
                        borderWidth: 4,
                        "fill": false,
                        // lineTension: 0, // line chart no curve with 0
                        "borderColor": "rgba(255,255,255,0.8)",
                    }]
                },
                "options": {
                    legend: {
                        display: false
                    },
                    scales: {
                        yAxes: [{
                            "gridLines": {
                                "color": "rgba(255,255,255,0.15)",
                                zeroLineColor: "rgba(255,255,255,0.15)",
                                borderDash: [3, 3]
                            },
                            ticks: {
                                fontColor: "rgba(255,255,255,0.8)",
                                beginAtZero: true,
                                userCallback: function (label, index, labels) {
                                    // when the floored value is the same as the value we have a whole number
                                    if (Math.floor(label) === label) {
                                        return label;
                                    }
                                }
                            }
                        }],
                        xAxes: [{
                            "gridLines": {
                                "color": "rgba(255,255,255,0.15)",
                                zeroLineColor: "rgba(255,255,255,0.15)",
                                borderDash: [3, 3]
                            },
                            ticks: {
                                fontColor: "rgba(255,255,255,0.8)"
                            }
                        }]
                    }
                }
            });
        }
    },
    initData2Line: function (period) { // period: 'last7','last14','last30'
        /* ----------==========   Row 2 - 2nd Chart   ==========---------- */
        var dateArr = periodObj[period];
        if (data2Line) {
            removeData(data2Line);
            addData(data2Line, dateArr, data2ArrObj[period]);
        } else {
            data2Line = new Chart(document.getElementById("data-2-line"), {
                "type": "line",
                "data": {
                    "labels": dateArr,
                    "datasets": [{
                        // "label":"Opened Case", tooltip title will now show this label
                        "data": data2ArrObj[period],
                        "backgroundColor": "rgba(255,255,255,0.8)",
                        borderWidth: 4,
                        "fill": false,
                        // lineTension: 0, // line chart no curve with 0
                        "borderColor": "rgba(255,255,255,0.8)",
                    }]
                },
                "options": {
                    legend: {
                        display: false
                    },
                    scales: {
                        yAxes: [{
                            "gridLines": {
                                "color": "rgba(255,255,255,0.15)",
                                zeroLineColor: "rgba(255,255,255,0.15)",
                                borderDash: [3, 3]
                            },
                            ticks: {
                                fontColor: "rgba(255,255,255,0.8)",
                                beginAtZero: true,
                                userCallback: function (label, index, labels) {
                                    // when the floored value is the same as the value we have a whole number
                                    if (Math.floor(label) === label) {
                                        return label;
                                    }
                                },
                            }
                        }],
                        xAxes: [{
                            "gridLines": {
                                "color": "rgba(255,255,255,0.15)",
                                zeroLineColor: "rgba(255,255,255,0.15)",
                                borderDash: [3, 3]
                            },
                            ticks: {
                                fontColor: "rgba(255,255,255,0.8)"
                            }
                        }]
                    }
                }
            });
        }
    },
    initData3Line: function (period) { // period: 'last7','last14','last30'
        /* ----------==========   Row 2 - 3rd Chart   ==========---------- */
        var dateArr = periodObj[period];
        if (data3Line) {
            removeData(data3Line);
            addData(data3Line, dateArr, data3ArrObj[period]);
        } else {
            data3Line = new Chart(document.getElementById("data-3-line"), {
                "type": "line",
                "data": {
                    "labels": dateArr,
                    "datasets": [{
                        // "label":"Opened Case", tooltip title will now show this label
                        "data": data3ArrObj[period],
                        "backgroundColor": "rgba(255,255,255,0.8)",
                        borderWidth: 4,
                        "fill": false,
                        // lineTension: 0, // line chart no curve with 0
                        "borderColor": "rgba(255,255,255,0.8)",
                    }]
                },
                "options": {
                    legend: {
                        display: false
                    },
                    scales: {
                        yAxes: [{
                            "gridLines": {
                                "color": "rgba(255,255,255,0.15)",
                                zeroLineColor: "rgba(255,255,255,0.15)",
                                borderDash: [3, 3]
                            },
                            ticks: {
                                fontColor: "rgba(255,255,255,0.8)",
                                beginAtZero: true,
                                userCallback: function (label, index, labels) {
                                    // when the floored value is the same as the value we have a whole number
                                    if (Math.floor(label) === label) {
                                        return label;
                                    }
                                },
                            }
                        }],
                        xAxes: [{
                            "gridLines": {
                                "color": "rgba(255,255,255,0.15)",
                                zeroLineColor: "rgba(255,255,255,0.15)",
                                borderDash: [3, 3]
                            },
                            ticks: {
                                fontColor: "rgba(255,255,255,0.8)"
                            }
                        }]
                    }
                }
            });
        }
    },
    initData4Line: function (period) { // period: 'last7','last14','last30'
        /* ----------==========   Row 2 - 4th Chart   ==========---------- */
        var dateArr = periodObj[period];
        if (data4Line) {
            removeData(data4Line);
            addData(data4Line, dateArr, data4ArrObj[period]);
        } else {
            data4Line = new Chart(document.getElementById("data-4-line"), {
                "type": "line",
                "data": {
                    "labels": dateArr,
                    "datasets": [{
                        // "label":"Opened Case", tooltip title will now show this label
                        "data": data4ArrObj[period],
                        "backgroundColor": "rgba(255,255,255,0.8)",
                        borderWidth: 4,
                        "fill": false,
                        // lineTension: 0, // line chart no curve with 0
                        "borderColor": "rgba(255,255,255,0.8)",
                    }]
                },
                "options": {
                    legend: {
                        display: false
                    },
                    scales: {
                        yAxes: [{
                            "gridLines": {
                                "color": "rgba(255,255,255,0.15)",
                                zeroLineColor: "rgba(255,255,255,0.15)",
                                borderDash: [3, 3]
                            },
                            ticks: {
                                fontColor: "rgba(255,255,255,0.8)",
                                beginAtZero: true,
                                userCallback: function (label, index, labels) {
                                    // when the floored value is the same as the value we have a whole number
                                    if (Math.floor(label) === label) {
                                        return label;
                                    }
                                },
                            }
                        }],
                        xAxes: [{
                            "gridLines": {
                                "color": "rgba(255,255,255,0.15)",
                                zeroLineColor: "rgba(255,255,255,0.15)",
                                borderDash: [3, 3]
                            },
                            ticks: {
                                fontColor: "rgba(255,255,255,0.8)"
                            }
                        }]
                    }
                }
            });
        }
    },
    loadMediaData: function () {
        $.ajax({
            type: "POST",
            url: wiseHost + '/WisePBX/api/config/GetDashboardData',
            data: JSON.stringify({}),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log("GetDashboardData error /n" + r ? r : '');
            } else {
                var mediaData = r.data;
                var todayTraIbArr = [];
                var todayTraOutArr = [];
                var todaySocialInArr = [];
                // In Call
                inCallArrObj['last30'] = mediaData['inbound_call'];
                inCallArrObj['last14'] = inCallArrObj['last30'].slice(16, 30);
                inCallArrObj['last7'] = inCallArrObj['last14'].slice(7, 14);
                todayTraIbArr.push(inCallArrObj['last7'][6]);
                // In VM
                inVMArrObj['last30'] = mediaData['inbound_vm'];
                inVMArrObj['last14'] = inVMArrObj['last30'].slice(16, 30);
                inVMArrObj['last7'] = inVMArrObj['last14'].slice(7, 14);
                todayTraIbArr.push(inVMArrObj['last7'][6]);
                // In Email
                inEmailArrObj['last30'] = mediaData['inbound_email'];
                inEmailArrObj['last14'] = inEmailArrObj['last30'].slice(16, 30);
                inEmailArrObj['last7'] = inEmailArrObj['last14'].slice(7, 14);
                todayTraIbArr.push(inEmailArrObj['last7'][6]);
                // In Fax
                inFaxArrObj['last30'] = mediaData['inbound_fax'];
                inFaxArrObj['last14'] = inFaxArrObj['last30'].slice(16, 30);
                inFaxArrObj['last7'] = inFaxArrObj['last14'].slice(7, 14);
                todayTraIbArr.push(inFaxArrObj['last7'][6]);
                // == In Tra Dou Total ==
                inTraDouObj['last30'] = [sumArr(inCallArrObj['last30']), sumArr(inVMArrObj['last30']), sumArr(inEmailArrObj['last30']), sumArr(inFaxArrObj['last30'])];
                inTraDouObj['last14'] = [sumArr(inCallArrObj['last14']), sumArr(inVMArrObj['last14']), sumArr(inEmailArrObj['last14']), sumArr(inFaxArrObj['last14'])];
                inTraDouObj['last7'] = [sumArr(inCallArrObj['last14']), sumArr(inVMArrObj['last7']), sumArr(inEmailArrObj['last7']), sumArr(inFaxArrObj['last7'])];
                // == In Tra Total ==
                inTraSumObj['last30'] = sumArr(inTraDouObj['last30']);
                inTraSumObj['last14'] = sumArr(inTraDouObj['last14']);
                inTraSumObj['last7'] = sumArr(inTraDouObj['last7']);
                // inTraSumObj['last30'] = sumArr(inCallArrObj['last30'].concat(inVMArrObj['last30']).concat(inEmailArrObj['last30']).concat(inFaxArrObj['last30']));
                // inTraSumObj['last14'] = sumArr(inCallArrObj['last14'].concat(inVMArrObj['last14']).concat(inEmailArrObj['last14']).concat(inFaxArrObj['last14']));
                // inTraSumObj['last7'] =  sumArr(inCallArrObj['last7'].concat(inVMArrObj['last7']).concat(inEmailArrObj['last7']).concat(inFaxArrObj['last7']));

                // Out Call
                outCallArrObj['last30'] = mediaData['outbound_call'];
                outCallArrObj['last14'] = outCallArrObj['last30'].slice(16, 30);
                outCallArrObj['last7'] = outCallArrObj['last14'].slice(7, 14);
                todayTraOutArr.push(outCallArrObj['last7'][6]);
                // Out SMS
                outSMSArrObj['last30'] = mediaData['outbound_sms'];
                outSMSArrObj['last14'] = outSMSArrObj['last30'].slice(16, 30);
                outSMSArrObj['last7'] = outSMSArrObj['last14'].slice(7, 14);
                todayTraOutArr.push(outSMSArrObj['last7'][6]);
                // Out Email
                outEmailArrObj['last30'] = mediaData['outbound_email'];
                outEmailArrObj['last14'] = outEmailArrObj['last30'].slice(16, 30);
                outEmailArrObj['last7'] = outEmailArrObj['last14'].slice(7, 14);
                todayTraOutArr.push(outEmailArrObj['last7'][6]);
                // Out Fax
                outFaxArrObj['last30'] = mediaData['outbound_fax'];
                outFaxArrObj['last14'] = outFaxArrObj['last30'].slice(16, 30);
                outFaxArrObj['last7'] = outFaxArrObj['last14'].slice(7, 14);
                todayTraOutArr.push(outFaxArrObj['last7'][6]);
                // == Out Tra Dou Total ==
                outTraDoubj['last30'] = [sumArr(outCallArrObj['last30']), sumArr(outSMSArrObj['last30']), sumArr(outEmailArrObj['last30']), sumArr(outFaxArrObj['last30'])];
                outTraDoubj['last14'] = [sumArr(outCallArrObj['last14']), sumArr(outSMSArrObj['last14']), sumArr(outEmailArrObj['last14']), sumArr(outFaxArrObj['last14'])];
                outTraDoubj['last7'] = [sumArr(outCallArrObj['last7']), sumArr(outSMSArrObj['last7']), sumArr(outEmailArrObj['last7']), sumArr(outFaxArrObj['last7'])];
                // == Out Tra Total ==
                outTraSumObj['last30'] = sumArr(outTraDoubj['last30']);
                outTraSumObj['last14'] = sumArr(outTraDoubj['last14']);
                outTraSumObj['last7'] = sumArr(outTraDoubj['last7']);
                // outTraSumObj['last30'] = sumArr(outCallArrObj['last30'].concat(outSMSArrObj['last30']).concat(outEmailArrObj['last30']).concat(outFaxArrObj['last30']));
                // outTraSumObj['last14'] = sumArr(outCallArrObj['last14'].concat(outSMSArrObj['last14']).concat(outEmailArrObj['last14']).concat(outFaxArrObj['last14']));
                // outTraSumObj['last7'] =  sumArr(outCallArrObj['last7'].concat(outSMSArrObj['last7']).concat(outEmailArrObj['last7']).concat(outFaxArrObj['last7']));

                // In Webchat
                inWebChatArrObj['last30'] = mediaData['inbound_webchat'];
                inWebChatArrObj['last14'] = inWebChatArrObj['last30'].slice(16, 30);
                inWebChatArrObj['last7'] = inWebChatArrObj['last14'].slice(7, 14);
                todaySocialInArr.push(inWebChatArrObj['last7'][6]);
                // In Wechat
                inWeChatArrObj['last30'] = mediaData['inbound_wechat'];
                inWeChatArrObj['last14'] = inWeChatArrObj['last30'].slice(16, 30);
                inWeChatArrObj['last7'] = inWeChatArrObj['last14'].slice(7, 14);
                todaySocialInArr.push(inWeChatArrObj['last7'][6]);
                // In FB Msg
                inFbMsgArrObj['last30'] = mediaData['inbound_fb_msg'];
                inFbMsgArrObj['last14'] = inFbMsgArrObj['last30'].slice(16, 30);
                inFbMsgArrObj['last7'] = inFbMsgArrObj['last14'].slice(7, 14);
                todaySocialInArr.push(inFbMsgArrObj['last7'][6]);
                // In Whatsapp
                inWhatsappArrObj['last30'] = mediaData['inbound_whatsapp'];
                inWhatsappArrObj['last14'] = inWhatsappArrObj['last30'].slice(16, 30);
                inWhatsappArrObj['last7'] = inWhatsappArrObj['last14'].slice(7, 14);
                todaySocialInArr.push(inWhatsappArrObj['last7'][6]);
                // == In Soc Dou Total ==
                inSocDouObj['last30'] = [sumArr(inWebChatArrObj['last30']), sumArr(inWeChatArrObj['last30']), sumArr(inFbMsgArrObj['last30']), sumArr(inWhatsappArrObj['last30'])];
                inSocDouObj['last14'] = [sumArr(inWebChatArrObj['last14']), sumArr(inWeChatArrObj['last14']), sumArr(inFbMsgArrObj['last14']), sumArr(inWhatsappArrObj['last14'])];
                inSocDouObj['last7'] = [sumArr(inWebChatArrObj['last7']), sumArr(inWeChatArrObj['last7']), sumArr(inFbMsgArrObj['last7']), sumArr(inWhatsappArrObj['last7'])];
                // == In Soc Total ==
                inSocSumObj['last30'] = sumArr(inSocDouObj['last30']);
                inSocSumObj['last14'] = sumArr(inSocDouObj['last14']);
                inSocSumObj['last7'] = sumArr(inSocDouObj['last7']);
                // inSocSumObj['last30'] = sumArr(inWebChatArrObj['last30'].concat(inWeChatArrObj['last30']).concat(inFbMsgArrObj['last30']).concat(inWhatsappArrObj['last30']));
                // inSocSumObj['last14'] = sumArr(inWebChatArrObj['last14'].concat(inWeChatArrObj['last14']).concat(inFbMsgArrObj['last14']).concat(inWhatsappArrObj['last14']));
                // inSocSumObj['last7'] =  sumArr(inWebChatArrObj['last7'].concat(inWeChatArrObj['last7']).concat(inFbMsgArrObj['last7']).concat(inWhatsappArrObj['last7']));
                // Load Today Inbound Outbound Today Charts
                md.initMediaTodayCharts(todayTraIbArr, todayTraOutArr, todaySocialInArr);
                // Load Line Chart and Doughnut Chart
                md.initIBTra('last30');
                md.initOBTra('last30');
                md.initIBSo('last30');
            }
        });
    },
    initIBTra: function (period) { // period: 'last7','last14','last30'
        var dateArr = periodObj[period];
        if (ibTraLine && ibTraDou) {
            // remove data
            ibTraLine.data.labels = [];
            ibTraLine.data.datasets[0].data = [];
            ibTraLine.data.datasets[1].data = [];
            ibTraLine.data.datasets[2].data = [];
            ibTraLine.data.datasets[3].data = [];
            ibTraDou.data.datasets[0].data = [];
            ibTraDou.options.tooltips.callbacks.labels = null;
            ibTraLine.update();
            ibTraDou.update();
            // add data
            ibTraLine.data.labels = dateArr;
            ibTraLine.data.datasets[0].data = inCallArrObj[period];
            ibTraLine.data.datasets[1].data = inVMArrObj[period];
            ibTraLine.data.datasets[2].data = inEmailArrObj[period];
            ibTraLine.data.datasets[3].data = inEmailArrObj[period];
            ibTraDou.data.datasets[0].data = inTraDouObj[period];
            ibTraDou.options.tooltips.callbacks.labels = function (tooltipItem, data) {
                var label = data.labels[tooltipItem.index] || '';
                if (label) {
                    label += ': ';
                }
                var theNo = data.datasets[0].data[tooltipItem.index];
                var thePercentage = Math.round((theNo / inTraSumObj[period]) * 100);
                label += (theNo + ' (' + thePercentage + '%)');
                return label;
            }
            ibTraLine.update();
            ibTraDou.update();
        } else {
            /* ----------==========  Row 4 - 1st Chart    ==========---------- */
            ibTraLine = new Chart(document.getElementById("ib-traditional-line"), {
                "type": "line",
                "data": {
                    "labels": dateArr,
                    "datasets": [{
                        "label": langJson['l-dashboard-call'],
                        "data": inCallArrObj[period],
                        borderWidth: 4,
                        "fill": false,
                        // lineTension: 0, // line chart no curve with 0
                        "borderColor": "rgba(21,193,231,0.9)",
                    },
                    {
                        "label": langJson['l-dashboard-vm'],
                        "data": inVMArrObj[period],
                        borderWidth: 4,
                        "fill": false,
                        // lineTension: 0, // line chart no curve with 0
                        "borderColor": "rgba(239,60,73,0.9)",
                    }, {
                        "label": langJson['l-dashboard-email'],
                        "data": inEmailArrObj[period],
                        borderWidth: 4,
                        "fill": false,
                        // lineTension: 0, // line chart no curve with 0
                        "borderColor": "rgba(247,159,55,0.9)",
                    },
                    {
                        "label": langJson['l-dashboard-fax'],
                        "data": inFaxArrObj[period],
                        borderWidth: 4,
                        "fill": false,
                        // lineTension: 0, // line chart no curve with 0
                        "borderColor": "rgba(71,163,75,0.9)",
                    },
                    ]
                },
                "options": {
                    maintainAspectRatio: false,
                    legend: {
                        display: true
                    },
                    scales: {
                        yAxes: [{
                            "gridLines": {
                                "color": "rgba(188,185,181,0.5)",
                                zeroLineColor: "rgba(188,185,181,0.5)",
                                borderDash: [3, 3]
                            },
                            ticks: {
                                fontColor: "rgb(188,185,181)",
                                beginAtZero: true,
                                userCallback: function (label, index, labels) {
                                    // when the floored value is the same as the value we have a whole number
                                    if (Math.floor(label) === label) {
                                        return label;
                                    }
                                },
                            }
                        }],
                        xAxes: [{
                            "gridLines": {
                                "color": "rgba(188,185,181,0.15)",
                                zeroLineColor: "rgba(188,185,181,0.15)",
                                borderDash: [3, 3]
                            },
                            ticks: {
                                fontColor: "rgba(188,185,181,0.8)"
                            }
                        }]
                    }
                }
            });
            /* ----------==========  Row 4 - 2nd Chart    ==========---------- */
            ibTraDou = new Chart(document.getElementById("ib-traditional-doughnut"), {
                type: 'doughnut',
                data: {
                    "labels": [langJson['l-dashboard-call'], langJson['l-dashboard-vm'], langJson['l-dashboard-email'], langJson['l-dashboard-fax']],
                    datasets: [{
                        "label": "Call",
                        "data": inTraDouObj[period],
                        // "fill":false,
                        "backgroundColor": ["rgba(21,193,231,0.9)", "rgba(239,60,73,0.9)", "rgba(247,159,55,0.9)", "rgba(71,163,75,0.9)"]
                        // lineTension: 0, // line chart no curve with 0
                        // "borderColor":"rgba(21,193,231,0.9)"
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {
                        display: 'false',
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    },
                    layout: {
                        padding: {
                            left: 0,
                            right: 0,
                            top: 90,
                            bottom: 50 // to let bottom text shown
                        }
                    },
                    plugins: {
                        legend: false,
                        outlabels: {
                            text: '%l %v (%p)',
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
                    tooltips: {
                        mode: 'index',
                        callbacks: {
                            label: function (tooltipItem, data) {
                                var label = data.labels[tooltipItem.index] || '';
                                if (label) {
                                    label += ': ';
                                }
                                var theNo = data.datasets[0].data[tooltipItem.index];
                                var thePercentage = Math.round((theNo / inTraSumObj[period]) * 100);
                                label += (theNo + ' (' + thePercentage + '%)');
                                return label;
                            }
                        }
                    }
                }
            });
        }
    },
    initOBTra: function (period) { // period: 'last7','last14','last30'
        var dateArr = periodObj[period];
        if (obTraLine && obTraDou) {
            // remove data
            obTraLine.data.labels = [];
            obTraLine.data.datasets[0].data = [];
            obTraLine.data.datasets[1].data = [];
            obTraLine.data.datasets[2].data = [];
            obTraLine.data.datasets[3].data = [];
            obTraDou.data.datasets[0].data = [];
            obTraDou.options.tooltips.callbacks.labels = null;
            obTraLine.update();
            obTraDou.update();
            // add data
            obTraLine.data.labels = dateArr;
            obTraLine.data.datasets[0].data = outCallArrObj[period];
            obTraLine.data.datasets[1].data = outSMSArrObj[period];
            obTraLine.data.datasets[2].data = outEmailArrObj[period];
            obTraLine.data.datasets[3].data = outFaxArrObj[period];
            obTraDou.data.datasets[0].data = outTraDoubj[period];
            obTraDou.options.tooltips.callbacks.labels = function (tooltipItem, data) {
                var label = data.labels[tooltipItem.index] || '';
                if (label) {
                    label += ': ';
                }
                var theNo = data.datasets[0].data[tooltipItem.index];
                var thePercentage = Math.round((theNo / outTraSumObj[period]) * 100);
                label += (theNo + ' (' + thePercentage + '%)');
                return label;
            }
            obTraLine.update();
            obTraDou.update();
        } else {
            /* ----------==========  Row 5 - 2nd Chart    ==========---------- */
            obTraLine = new Chart(document.getElementById("ob-traditional-line"), {
                "type": "line",
                "data": {
                    "labels": dateArr,
                    "datasets": [{
                        "label": langJson['l-dashboard-call'],
                        "data": outCallArrObj[period],
                        borderWidth: 4,
                        "fill": false,
                        // lineTension: 0, // line chart no curve with 0
                        "borderColor": "rgba(21,193,231,0.9)",
                    },
                    {
                        "label": langJson['l-dashboard-sms'],
                        "data": outSMSArrObj[period],
                        borderWidth: 4,
                        "fill": false,
                        // lineTension: 0, // line chart no curve with 0
                        "borderColor": "rgba(239,60,73,0.9)",
                    }, {
                        "label": langJson['l-dashboard-email'],
                        "data": outEmailArrObj[period],
                        borderWidth: 4,
                        "fill": false,
                        // lineTension: 0, // line chart no curve with 0
                        "borderColor": "rgba(247,159,55,0.9)",
                    },
                    {
                        "label": langJson['l-dashboard-fax'],
                        "data": outFaxArrObj[period],
                        borderWidth: 4,
                        "fill": false,
                        // lineTension: 0, // line chart no curve with 0
                        "borderColor": "rgba(71,163,75,0.9)",
                    },
                    ]
                },
                "options": {
                    maintainAspectRatio: false,
                    legend: {
                        display: true
                    },
                    scales: {
                        yAxes: [{
                            "gridLines": {
                                "color": "rgba(188,185,181,0.5)",
                                zeroLineColor: "rgba(188,185,181,0.5)",
                                borderDash: [3, 3]
                            },
                            ticks: {
                                fontColor: "rgb(188,185,181)",
                                beginAtZero: true,
                                userCallback: function (label, index, labels) {
                                    // when the floored value is the same as the value we have a whole number
                                    if (Math.floor(label) === label) {
                                        return label;
                                    }
                                },
                            }
                        }],
                        xAxes: [{
                            "gridLines": {
                                "color": "rgba(188,185,181,0.15)",
                                zeroLineColor: "rgba(188,185,181,0.15)",
                                borderDash: [3, 3]
                            },
                            ticks: {
                                fontColor: "rgba(188,185,181,0.8)"
                            }
                        }]
                    }
                }
            });
            /* ----------==========  Row 5 - 1st Chart    ==========---------- */
            obTraDou = new Chart(document.getElementById("ob-traditional-doughnut"), {
                type: 'doughnut',
                data: {
                    "labels": [langJson['l-dashboard-call'], langJson['l-dashboard-sms'], langJson['l-dashboard-email'], langJson['l-dashboard-fax']],
                    datasets: [{
                        "label": "Call",
                        "data": outTraDoubj[period],
                        // "fill":false,
                        "backgroundColor": ["rgba(21,193,231,0.9)", "rgba(239,60,73,0.9)", "rgba(247,159,55,0.9)", "rgba(71,163,75,0.9)"]
                        // lineTension: 0, // line chart no curve with 0
                        // "borderColor":"rgba(21,193,231,0.9)"
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {
                        display: 'false',
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    },
                    layout: {
                        padding: {
                            left: 0,
                            right: 0,
                            top: 90,
                            bottom: 50 // to let bottom text shown
                        }
                    },
                    plugins: {
                        legend: false,
                        outlabels: {
                            text: '%l %v (%p)',
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
                    tooltips: {
                        mode: 'index',
                        callbacks: {
                            label: function (tooltipItem, data) {
                                var label = data.labels[tooltipItem.index] || '';
                                if (label) {
                                    label += ': ';
                                }
                                var theNo = data.datasets[0].data[tooltipItem.index];
                                var thePercentage = Math.round((theNo / outTraSumObj[period]) * 100);
                                label += (theNo + ' (' + thePercentage + '%)');
                                return label;
                            }
                        }
                    }
                }
            });
        }
    },
    initIBSo: function (period) { // period: 'last7','last14','last30'
        var dateArr = periodObj[period];
        if (ibSoLine && ibSoDou) {
            // remove data
            ibSoLine.data.labels = [];
            ibSoLine.data.datasets[0].data = [];
            ibSoLine.data.datasets[1].data = [];
            ibSoLine.data.datasets[2].data = [];
            ibSoLine.data.datasets[3].data = []; // del social
            ibSoDou.data.datasets[0].data = [];
            ibSoDou.options.tooltips.callbacks.labels = null;
            ibSoLine.update();
            ibSoDou.update();
            // add data
            ibSoLine.data.labels = dateArr;
            ibSoLine.data.datasets[0].data = inWebChatArrObj[period];
            ibSoLine.data.datasets[1].data = inWeChatArrObj[period];
            ibSoLine.data.datasets[2].data = inFbMsgArrObj[period];
            ibSoLine.data.datasets[3].data = inWhatsappArrObj[period]; // add social
            ibSoDou.data.datasets[0].data = inSocDouObj[period];
            ibSoDou.options.tooltips.callbacks.labels = function (tooltipItem, data) {
                var label = data.labels[tooltipItem.index] || '';
                if (label) {
                    label += ': ';
                }
                var theNo = data.datasets[0].data[tooltipItem.index];
                var thePercentage = Math.round((theNo / inSocSumObj[period]) * 100);
                label += (theNo + ' (' + thePercentage + '%)');
                return label;
            }
            ibSoLine.update();
            ibSoDou.update();
        } else {
            /* ----------==========  Row 6 - 1st Chart    ==========---------- */
            ibSoLine = new Chart(document.getElementById("ib-social-line"), {
                "type": "line",
                "data": {
                    "labels": dateArr,
                    "datasets": [{
                        "label": langJson['l-dashboard-web-chat'],
                        "data": inWebChatArrObj[period],
                        borderWidth: 4,
                        "fill": false,
                        // lineTension: 0, // line chart no curve with 0
                        "borderColor": "rgba(21,193,231,0.9)",
                    },
                    {
                        "label": langJson['l-dashboard-wechat'],
                        "data": inWeChatArrObj[period],
                        borderWidth: 4,
                        "fill": false,
                        // lineTension: 0, // line chart no curve with 0
                        "borderColor": "rgba(239,60,73,0.9)",
                    }, {
                        "label": langJson['l-dashboard-fb'],
                        "data": inFbMsgArrObj[period],
                        borderWidth: 4,
                        "fill": false,
                        // lineTension: 0, // line chart no curve with 0
                        "borderColor": "rgba(247,159,55,0.9)",
                    }, {
                        "label": "WhatsApp",
                        "data": inWhatsappArrObj[period],
                        borderWidth: 4,
                        "fill": false,
                        // lineTension: 0, // line chart no curve with 0
                        "borderColor": "rgba(71,163,75,0.9)",
                    }
                    ]
                },
                "options": {
                    maintainAspectRatio: false,
                    legend: {
                        display: true
                    },
                    scales: {
                        yAxes: [{
                            "gridLines": {
                                "color": "rgba(188,185,181,0.5)",
                                zeroLineColor: "rgba(188,185,181,0.5)",
                                borderDash: [3, 3]
                            },
                            ticks: {
                                fontColor: "rgb(188,185,181)",
                                beginAtZero: true,
                                userCallback: function (label, index, labels) {
                                    // when the floored value is the same as the value we have a whole number
                                    if (Math.floor(label) === label) {
                                        return label;
                                    }
                                },
                            }
                        }],
                        xAxes: [{
                            "gridLines": {
                                "color": "rgba(188,185,181,0.15)",
                                zeroLineColor: "rgba(188,185,181,0.15)",
                                borderDash: [3, 3]
                            },
                            ticks: {
                                fontColor: "rgba(188,185,181,0.8)"
                            }
                        }]
                    }
                }
            });
            /* ----------==========  Row 6 - 2nd Chart    ==========---------- */
            ibSoDou = new Chart(document.getElementById("ib-social-doughnut"), {
                type: 'doughnut',
                data: {
                    "labels": [langJson['l-dashboard-web-chat'], langJson['l-dashboard-wechat'], langJson['l-dashboard-fb'], "WhatsApp"],
                    datasets: [{
                        "label": "Call",
                        "data": inSocDouObj[period],
                        "backgroundColor": ["rgba(21,193,231,0.9)", "rgba(239,60,73,0.9)", "rgba(247,159,55,0.9)", "rgba(71,163,75,0.9)"]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // will not auto high
                    legend: {
                        display: 'false',
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    },
                    layout: {
                        padding: {
                            left: 0,
                            right: 0,
                            top: 90,
                            bottom: 50 // to let bottom text shown
                        }
                    },
                    plugins: {
                        legend: false,
                        outlabels: {
                            text: '%l %v (%p)',
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
                    tooltips: {
                        mode: 'index',
                        callbacks: {
                            label: function (tooltipItem, data) {
                                var label = data.labels[tooltipItem.index] || '';
                                if (label) {
                                    label += ': ';
                                }
                                var theNo = data.datasets[0].data[tooltipItem.index];
                                var thePercentage = Math.round((theNo / inSocSumObj[period]) * 100);
                                label += (theNo + ' (' + thePercentage + '%)');
                                return label;
                            }
                        }
                    }
                }
            });
        }
    },
    // CRM used period name: 'Today','Last7','Last14','Last30'
    loadAgentNature: function (period, isInit) {
        $.ajax({
            type: "POST",
            url: mvcHost + '/mvc' + campaign + '/api/GetDashboard_Agent_CallNature',
            data: JSON.stringify({
                "Date_Range": period,
                Agent_Id: loginId,
                Token: token
            }),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log("GetDashboard_Agent_CallNature error /n" + r ? r : '');
            } else {
                var theData = r.details;
                var content = '';
                $('#agent-handled-tbl-body').empty();
                for (let theObj of theData) {
                    var theAgentId = theObj['Agent_Id'];
                    var agentStr = parent.parent.parent.getAgentName(theAgentId) + '(ID: ' + theAgentId + ')'
                    if (isInit) {
                        agentStrArr.push([agentStr, theAgentId]);
                    }
                    content += '<tr><td>';
                    content += agentStr; // Agent Name
                    content += '</td>';
                    content += ('<td>' + theObj['Enquiry'] + '</td>');
                    content += ('<td>' + theObj['Feedback'] + '</td>');
                    content += ('<td>' + theObj['Complaint'] + '</td>');
                    content += ('<td>' + theObj['Compliment'] + '</td>');
                    content += ('<td>' + theObj['Subtotal'] + '</td>');
                    content += '</tr>'
                }
                if (isInit) {
                    md.loadAgentMedia();
                }
                $('#agent-handled-tbl-body').append(content);
            }
        });
    },
    loadAgentMedia: function () {
        // Today
        $.ajax({
            type: "POST",
            url: wiseHost + '/WisePBX/api/config/GetDashboardData_Agent',
            data: JSON.stringify({
                "daysBefore": 1 //daysBefore 1 = today
            }),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log("GetDashboardData_Agent error /n" + r ? r : '');
            } else {
                var agentDataArr = r.data;
                var ibTraArr = [];
                var outTraArr = [];
                var inSocArr = [];
                for (let theAgentArr of agentStrArr) {
                    var theAgentStr = theAgentArr[0];
                    var agentInTraArr = [];
                    var agentOutTraArr = [];
                    var agentInSociArr = [];
                    agentInTraArr.push(theAgentStr);
                    agentOutTraArr.push(theAgentStr);
                    agentInSociArr.push(theAgentStr);
                    var theAgentId = theAgentArr[1];
                    var noFound = true;
                    for (let agentInfoObj of agentDataArr) {
                        if (theAgentId == agentInfoObj.agent_id) {
                            agentInTraArr.push(agentInfoObj.inbound_call);
                            agentInTraArr.push(agentInfoObj.inbound_vm);
                            agentInTraArr.push(agentInfoObj.inbound_email);
                            agentInTraArr.push(agentInfoObj.inbound_fax);
                            agentOutTraArr.push(agentInfoObj.outbound_call);
                            agentOutTraArr.push(agentInfoObj.outbound_sms);
                            agentOutTraArr.push(agentInfoObj.outbound_email);
                            agentOutTraArr.push(agentInfoObj.outbound_fax);
                            agentInSociArr.push(agentInfoObj.inbound_webchat);
                            agentInSociArr.push(agentInfoObj.inbound_wechat);
                            agentInSociArr.push(agentInfoObj.inbound_fb_msg);
                            agentInSociArr.push(agentInfoObj.inbound_whatsapp);
                            noFound = false;
                            break;
                        }
                    }
                    if (noFound) {
                        agentInTraArr.push(0, 0, 0, 0);
                        agentOutTraArr.push(0, 0, 0, 0);
                        agentInSociArr.push(0, 0, 0, 0);
                    }
                    ibTraArr.push(agentInTraArr);
                    outTraArr.push(agentOutTraArr);
                    inSocArr.push(agentInSociArr);
                }
                inTraAgentObj['today'] = ibTraArr;
                outTraAgentObj['today'] = outTraArr;
                inSocAgentObj['today'] = inSocArr;
            }
        });
        // Last 7
        $.ajax({
            type: "POST",
            url: wiseHost + '/WisePBX/api/config/GetDashboardData_Agent',
            data: JSON.stringify({
                "daysBefore": 7 //daysBefore 7 = within 7 days
            }),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log("GetDashboardData_Agent error /n" + r ? r : '');
            } else {
                var agentDataArr = r.data;
                var ibTraArr = [];
                var outTraArr = [];
                var inSocArr = [];
                for (let theAgentArr of agentStrArr) {
                    var theAgentStr = theAgentArr[0];
                    var agentInTraArr = [];
                    var agentOutTraArr = [];
                    var agentInSociArr = [];
                    agentInTraArr.push(theAgentStr);
                    agentOutTraArr.push(theAgentStr);
                    agentInSociArr.push(theAgentStr);
                    var theAgentId = theAgentArr[1];
                    var noFound = true;
                    for (let agentInfoObj of agentDataArr) {
                        if (theAgentId == agentInfoObj.agent_id) {
                            agentInTraArr.push(agentInfoObj.inbound_call);
                            agentInTraArr.push(agentInfoObj.inbound_vm);
                            agentInTraArr.push(agentInfoObj.inbound_email);
                            agentInTraArr.push(agentInfoObj.inbound_fax);
                            agentOutTraArr.push(agentInfoObj.outbound_call);
                            agentOutTraArr.push(agentInfoObj.outbound_sms);
                            agentOutTraArr.push(agentInfoObj.outbound_email);
                            agentOutTraArr.push(agentInfoObj.outbound_fax);
                            agentInSociArr.push(agentInfoObj.inbound_webchat);
                            agentInSociArr.push(agentInfoObj.inbound_wechat);
                            agentInSociArr.push(agentInfoObj.inbound_fb_msg);
                            agentInSociArr.push(agentInfoObj.inbound_whatsapp);
                            noFound = false;
                            break;
                        }
                    }
                    if (noFound) {
                        agentInTraArr.push(0, 0, 0, 0);
                        agentOutTraArr.push(0, 0, 0, 0);
                        agentInSociArr.push(0, 0, 0, 0);
                    }
                    ibTraArr.push(agentInTraArr);
                    outTraArr.push(agentOutTraArr);
                    inSocArr.push(agentInSociArr);
                }
                inTraAgentObj['last7'] = ibTraArr;
                outTraAgentObj['last7'] = outTraArr;
                inSocAgentObj['last7'] = inSocArr;
            }
        });
        // Last 14
        $.ajax({
            type: "POST",
            url: wiseHost + '/WisePBX/api/config/GetDashboardData_Agent',
            data: JSON.stringify({
                "daysBefore": 14
            }),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log("GetDashboardData_Agent error /n" + r ? r : '');
            } else {
                var agentDataArr = r.data;
                var ibTraArr = [];
                var outTraArr = [];
                var inSocArr = [];
                for (let theAgentArr of agentStrArr) {
                    var theAgentStr = theAgentArr[0];
                    var agentInTraArr = [];
                    var agentOutTraArr = [];
                    var agentInSociArr = [];
                    agentInTraArr.push(theAgentStr);
                    agentOutTraArr.push(theAgentStr);
                    agentInSociArr.push(theAgentStr);
                    var theAgentId = theAgentArr[1];
                    var noFound = true;
                    for (let agentInfoObj of agentDataArr) {
                        if (theAgentId == agentInfoObj.agent_id) {
                            agentInTraArr.push(agentInfoObj.inbound_call);
                            agentInTraArr.push(agentInfoObj.inbound_vm);
                            agentInTraArr.push(agentInfoObj.inbound_email);
                            agentInTraArr.push(agentInfoObj.inbound_fax);
                            agentOutTraArr.push(agentInfoObj.outbound_call);
                            agentOutTraArr.push(agentInfoObj.outbound_sms);
                            agentOutTraArr.push(agentInfoObj.outbound_email);
                            agentOutTraArr.push(agentInfoObj.outbound_fax);
                            agentInSociArr.push(agentInfoObj.inbound_webchat);
                            agentInSociArr.push(agentInfoObj.inbound_wechat);
                            agentInSociArr.push(agentInfoObj.inbound_fb_msg);
                            agentInSociArr.push(agentInfoObj.inbound_whatsapp);
                            noFound = false;
                            break;
                        }
                    }
                    if (noFound) {
                        agentInTraArr.push(0, 0, 0, 0);
                        agentOutTraArr.push(0, 0, 0, 0);
                        agentInSociArr.push(0, 0, 0, 0);
                    }
                    ibTraArr.push(agentInTraArr);
                    outTraArr.push(agentOutTraArr);
                    inSocArr.push(agentInSociArr);
                }
                inTraAgentObj['last14'] = ibTraArr;
                outTraAgentObj['last14'] = outTraArr;
                inSocAgentObj['last14'] = inSocArr;
            }
        });
        // Last 30
        $.ajax({
            type: "POST",
            url: wiseHost + '/WisePBX/api/config/GetDashboardData_Agent',
            data: JSON.stringify({
                "daysBefore": 30
            }),
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json'
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log("GetDashboardData_Agent error /n" + r ? r : '');
            } else {
                var agentDataArr = r.data;
                var ibTraArr = [];
                var outTraArr = [];
                var inSocArr = [];
                for (let theAgentArr of agentStrArr) {
                    var theAgentStr = theAgentArr[0];
                    var agentInTraArr = [];
                    var agentOutTraArr = [];
                    var agentInSociArr = [];
                    agentInTraArr.push(theAgentStr);
                    agentOutTraArr.push(theAgentStr);
                    agentInSociArr.push(theAgentStr);
                    var theAgentId = theAgentArr[1];
                    var noFound = true;
                    for (let agentInfoObj of agentDataArr) {
                        if (theAgentId == agentInfoObj.agent_id) {
                            agentInTraArr.push(agentInfoObj.inbound_call);
                            agentInTraArr.push(agentInfoObj.inbound_vm);
                            agentInTraArr.push(agentInfoObj.inbound_email);
                            agentInTraArr.push(agentInfoObj.inbound_fax);
                            agentOutTraArr.push(agentInfoObj.outbound_call);
                            agentOutTraArr.push(agentInfoObj.outbound_sms);
                            agentOutTraArr.push(agentInfoObj.outbound_email);
                            agentOutTraArr.push(agentInfoObj.outbound_fax);
                            agentInSociArr.push(agentInfoObj.inbound_webchat);
                            agentInSociArr.push(agentInfoObj.inbound_wechat);
                            agentInSociArr.push(agentInfoObj.inbound_fb_msg);
                            agentInSociArr.push(agentInfoObj.inbound_whatsapp);
                            noFound = false;
                            break;
                        }
                    }
                    if (noFound) {
                        agentInTraArr.push(0, 0, 0, 0);
                        agentOutTraArr.push(0, 0, 0, 0);
                        agentInSociArr.push(0, 0, 0, 0);
                    }
                    ibTraArr.push(agentInTraArr);
                    outTraArr.push(agentOutTraArr);
                    inSocArr.push(agentInSociArr);
                }
                inTraAgentObj['last30'] = ibTraArr;
                outTraAgentObj['last30'] = outTraArr;
                inSocAgentObj['last30'] = inSocArr;

                // default right lowest agent table show 30 days
                md.loadIB('last30');
            }
        });
    },
    loadIB: function (period) {
        // <th>Call</th>
        // <th>VM</th>
        // <th>Email</th>
        // <th>Fax</th>
        $('#channel-thead').empty();
        $('#channel-thead').append('<th>Agent</th><th>Call</th><th>VM</th><th>Email</th><th>Fax</th>');
        $('#channel-tbody').empty();
        var tblArrArr = inTraAgentObj[period];
        var content = '';
        for (let rowArr of tblArrArr) {
            content += ('<tr><td>' + rowArr[0] + '</td><td>' + rowArr[1] + '</td><td>' + rowArr[2] + '</td><td>' + rowArr[3] + '</td><td>' + rowArr[4] + '</td><td></tr>');
        }
        $('#channel-tbody').append(content);
    },
    loadOB: function (period) {
        $('#channel-thead').empty();
        $('#channel-thead').append('<th>Agent</th><th>Call</th><th>SMS</th><th>Email</th><th>Fax</th>');
        $('#channel-tbody').empty();
        var tblArrArr = outTraAgentObj[period];
        var content = '';
        for (let rowArr of tblArrArr) {
            content += ('<tr><td>' + rowArr[0] + '</td><td>' + rowArr[1] + '</td><td>' + rowArr[2] + '</td><td>' + rowArr[3] + '</td><td>' + rowArr[4] + '</td><td></tr>');
        }
        $('#channel-tbody').append(content);
    },
    loadSocial: function (period) {
        $('#channel-thead').empty();
        $('#channel-thead').append('<th>Agent</th><th>Web Chat</th><th>Wechat</th><th>FB Messenger</th><th>WhatsApp</th>');
        $('#channel-tbody').empty();
        var tblArrArr = inSocAgentObj[period];
        var content = '';
        for (let rowArr of tblArrArr) {
            content += ('<tr><td>' + rowArr[0] + '</td><td>' + rowArr[1] + '</td><td>' + rowArr[2] + '</td><td>' + rowArr[3] + '</td><td>' + rowArr[4] + '</td><td></tr>');
        }
        $('#channel-tbody').append(content);
    }
}

function windowOnload() {
    setLanguage();
}

function setLanguage() {
    $('.l-dashboard-today').text(langJson['l-dashboard-today']);
    $('.l-dashboard-enquiry').text(langJson['l-dashboard-enquiry']);
    $('.l-dashboard-new-case').text(langJson['l-dashboard-new-case']);
    $('.l-dashboard-last-7-days').text(langJson['l-dashboard-last-7-days']);
    $('.l-dashboard-last-14-days').text(langJson['l-dashboard-last-14-days']);
    $('.l-dashboard-last-30-days').text(langJson['l-dashboard-last-30-days']);
    $('.l-dashboard-feedback').text(langJson['l-dashboard-feedback']);
    $('.l-dashboard-feedback').text(langJson['l-dashboard-compliment']);
    $('.l-dashboard-feedback').text(langJson['l-dashboard-complaint']);
    $('.l-dashboard-opened').text(langJson['l-dashboard-opened']);
    $('.l-dashboard-closed').text(langJson['l-dashboard-closed']);
    $('.l-dashboard-ib-trad-media').text(langJson['l-dashboard-ib-trad-media']);
    $('.l-dashboard-ib-trad-media-sub').text(langJson['l-dashboard-ib-trad-media-sub']);
    $('.l-dashboard-ob-trad-media').text(langJson['l-dashboard-ob-trad-media']);
    $('.l-dashboard-ob-trad-media-sub').text(langJson['l-dashboard-ob-trad-media-sub']);
    $('.l-dashboard-ib-social-media').text(langJson['l-dashboard-ib-social-media']);
    $('.l-dashboard-social-media-sub').text(langJson['l-dashboard-social-media-sub']);
    $('.l-dashboard-created-new-case-nature').text(langJson['l-dashboard-created-new-case-nature']);
}