var callDou = null;
var socialDou = null;
var traQTbl = null;
var wallGauge = [];
var toalAvailableAgent = 0;
var wmAgentObj = {};
var wiseHost = config.wiseHost;
var wbWallIntMiliSec = wmConfig.wbWallIntMiliSec || 300000; //5 mins
var wbArr = wmConfig.wbArr;
var isWbArrNotSingle = wbArr.length > 1;
var selectedCat = 'Agent Status';
var showMapChart = wmConfig.showMapChart || false;
var hvSocial = wmConfig.hvSocial || false;
var imageSeries = null;
var legend = null;
var statusStyle = config.statusStyle || {"LOGIN":"#6c757d","IDLE":"#FF2735","TALK":"#4caf50","HOLD":"rgb(201, 203, 207)","READY":"rgb(54 102 189)","#dbdb30":"rgba(21, 193, 231, 0.9)","BREAK":"#AB4A0E","MONITOR":"rgb(153, 102, 255)"};

$(document).ready(function () {
    wmAgentObj = window.opener.wmAgentObj || "";
    toalAvailableAgent = Object.keys(wmAgentObj).length;
    // Check is the customer logged in & does the user have this function
    if (sessionStorage.getItem('scrmLoggedIn') == null) {
        var scrmLanguage = sessionStorage.getItem('scrmLanguage') || 'EN';
        if (scrmLanguage == 'TC') {
            alert('您尚未登入');
        } else {
            alert("You are not logged in");
        }
        window.location.href = 'login.html';
        return;
    } else {
        $('body').removeClass('d-none'); // as don't want no premission to login people see anything
    }
    loadServiceList();
    initCallDou();
    if (hvSocial) {
        initChatDou();
    }
    initWallCard(); // Will call loadWallData(); after initiated the card
    // movement will reset timeout counter
    if (window.opener.addPopupIdle) {
        window.opener.addPopupIdle($(document));
    }
    // Set nav bar button
    $("#cat-dropdown-menu li a").click(function () {
        var selected = $(this).text();
        $('#dropdown-btn').text(selected + '  ');
        switchContent(selected);
    });

    if (showMapChart) {
        $('#menu-bar').removeClass('d-none');
    }

    // show dropdown-menu - if no this the menu will not popup correctly
    $('.dropdown-btn-container').on('show.bs.dropdown', function (e) {
        $(e.relatedTarget).next().stop(true, true).css('display', 'block');
    });
    // hide dropdown-menu - if no this the menu may not disappear really and when clicking next row, become clicking previous row Silent
    $('.dropdown-btn-container').on('hide.bs.dropdown', function (e) {
        $(e.relatedTarget).next().stop(true, true).css('display', 'none');
    });
});

function initWallCard() {
    for (var i = 0; i < wbArr.length; i++) {
        var wbObj = wbArr[i];
        var isSocial = wbObj.isSocial;
        var headerColor = isSocial ? 'info' : 'warning';
        var keyStr = isSocial ? 'Chat' : 'Call';
        var guage2Idx = (i + 1) * 2;
        var guage1Idx = guage2Idx - 1;
        var wallCardClass = (i == 0 ? 'pl-3 pr-2' : 'pr-3');
        var wallboardStr = '<div class="wall-card ' + wallCardClass + '"> <div class="row px-3"> <div class="w-23 card my-0 w-auto px-0 text-center"> <h5 class="my-0 py-2 w-100 card-header-' + headerColor + '" style="box-shadow: none;">Incoming ' + keyStr + 's</h5><h1 class="my-2"><span id="wall-' + i + '-1" class="wall-cell-span">&nbsp;</span></h1></div><div class="w-23 card my-0 w-auto px-0 text-center"> <h5 class="my-0 py-2 w-100 card-header-' + headerColor + '" style="box-shadow: none;">Answered ' + keyStr + 's</h5><h1 class="my-2"><span id="wall-' + i + '-2" class="wall-cell-span">&nbsp;</span></h1></div><div class="w-23 card my-0 w-auto px-0 text-center"> <h5 class="my-0 py-2 w-100 card-header-' + headerColor + '" style="box-shadow: none;">Abandoned ' + keyStr + 's</h5><h1 class="my-2"><span id="wall-' + i + '-3" class="wall-cell-span">&nbsp;</span></h1></div><div class="w-31 card my-0 w-auto px-0 text-center"> <h5 class="my-0 py-2 w-100 card-header-' + headerColor + '" style="box-shadow: none;">Outbound ' + keyStr + 's</h5><h1 class="my-2"><span id="wall-' + i + '-4" class="wall-cell-span">&nbsp;</span></h1></div></div><div class="row px-3"> <div class="w-69 card m-0"> <div  class="mx-auto" style="width:95%"> <div class="w-100 text-center d-flex"> <div class="w-50 d-inline-block"> <div> <h6 class="mt-3 mb-2" style="font-weight:600;color:#666666;text-align: center;">SLA - Abandoned ' + keyStr + '%</h6> <div class="sla-guage-container"><canvas id="sla-guage-' + guage1Idx + '"></canvas> </div></div></div><div class="w-50 d-inline-block"> <div> <h6 class="mt-3 mb-2" style="font-weight:600;color:#666666;text-align: center;">SLA - AVG ABANDONED SEC.</h6> <div class="sla-guage-container"><canvas id="sla-guage-' + guage2Idx + '"></canvas></div> </div></div></div></div><div class="mt-3"><label class="ms-3">ACD:&nbsp;' + wbObj.acdName + '</label><label class="float-end me-3">Last update on&nbsp;<span id="wall-' + i + '-update-time"></span></label> </div></div><div class="w-31"> <div class="card my-0 w-auto px-0 text-center"> <h5 class="my-0 py-2 w-100 card-header-' + headerColor + '" style="box-shadow: none;">Avg Abandoned Time</h5><h1 class="my-2"><span id="wall-' + i + '-5" class="wall-cell-span">&nbsp;</span></h1></div><div class="card my-0 w-auto px-0 text-center"> <h5 class="my-0 py-2 w-100 card-header-' + headerColor + '" style="box-shadow: none;"><span>Avg Talk Time</span></h5><h1 class="my-2"><span id="wall-' + i + '-6" class="wall-cell-span">&nbsp;</span></h1></div></div></div></div>';
        // Refresh wall data regularly
        $('#wall-card-container').append(wallboardStr);
    }
    loadWallData();
    setInterval(function () { loadWallData() }, wbWallIntMiliSec);
}

function initSlaGauge(abanonedPercentage, avgAbandonedTime, idx) {
    var sla1Color = abanonedPercentage > 15 ? '#f64e4e' : (abanonedPercentage > 5 ? '#fd9704' : '#0fdc63');
    var sla2Color = avgAbandonedTime > 15 ? '#f64e4e' : (avgAbandonedTime > 5 ? '#fd9704' : '#0fdc63');
    var guage2Idx = (idx + 1) * 2;
    var guage1Idx = guage2Idx - 1;
    var slaGauge1 = wallGauge[guage1Idx];
    var slaGauge2 = wallGauge[guage2Idx];
    if (slaGauge1) {
        // Remove data
        slaGauge1.config.data.datasets[0].gaugeData.value = abanonedPercentage;
        slaGauge1.config.data.datasets[0].gaugeData.valueColor = sla1Color;
        slaGauge1.update({ duration: 0, lazy: true });
    } else {
        wallGauge[guage1Idx] = new Chart(document.getElementById('sla-guage-' + guage1Idx), {
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
        wallGauge[guage2Idx] = new Chart(document.getElementById('sla-guage-' + guage2Idx), {
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
                        return v + 's';
                    } else {
                        return '';
                    }
                }
            }
        });
    }
}

// Show Traditional Wall or Social Wall
function initWallData(data, isSocial, idx) {
    var abanonedPercentage = 0;
    var avgAbandonedTime = 0;
    var serviceObj = data.service;
    var acdObj = data.acdGroup;
    var loopLen = [1, 2, 3, 5, 6]
    var strArr = [];
    if (acdObj) {
        strArr.push(acdObj.IncomingCall + ' / ' + serviceObj.IncomingCall);
        strArr.push(acdObj.AnsweredCall + ' / ' + serviceObj.AnsweredCall);
        strArr.push(acdObj.AbandonedCall + ' / ' + serviceObj.AbandonedCall);
        strArr.push(acdObj.AvgAbandonedTime + ' / ' + serviceObj.AvgAbandonedTime);
        strArr.push(acdObj.AvgTalkTime + ' / ' + serviceObj.AvgTalkTime);
        // $('#wall-' + idx + '-1').text(acdObj.IncomingCall + ' / ' + serviceObj.IncomingCall);
        // $('#wall-' + idx + '-2').text(acdObj.AnsweredCall + ' / ' + serviceObj.AnsweredCall);
        // $('#wall-' + idx + '-3').text(acdObj.AbandonedCall + ' / ' + serviceObj.AbandonedCall);
        // $('#wall-' + idx + '-5').text(acdObj.AvgAbandonedTime + ' / ' + serviceObj.AvgAbandonedTime);
        // $('#wall-' + idx + '-6').text(acdObj.AvgTalkTime + ' / ' + serviceObj.AvgTalkTime);
        // For SLA Gauge Chart
        abanonedPercentage = Math.round((acdObj.AbandonedCall / acdObj.IncomingCall) * 100) || 0;
        avgAbandonedTime = acdObj.AvgAbandonedTime;
    } else {
        strArr.push(serviceObj.IncomingCall);
        strArr.push(serviceObj.AnsweredCall);
        strArr.push(serviceObj.AbandonedCall);
        strArr.push(serviceObj.AvgAbandonedTime);
        strArr.push(serviceObj.AvgTalkTime);
        // $('#wall-' + idx + '-1').text(serviceObj.IncomingCall);
        // $('#wall-' + idx + '-2').text(serviceObj.AnsweredCall);
        // $('#wall-' + idx + '-3').text(serviceObj.AbandonedCall);
        // $('#wall-' + idx + '-5').text(serviceObj.AvgAbandonedTime);
        // $('#wall-' + idx + '-6').text(serviceObj.AvgTalkTime);
        // For SLA Gauge Chart
        abanonedPercentage = Math.round((serviceObj.AbandonedCall / serviceObj.IncomingCall) * 100) || 0;
        avgAbandonedTime = serviceObj.AvgAbandonedTime;
    }
    for (var i = 0; i < loopLen.length; i++) {
        var theStr = strArr[i];
        // Text length will only gain, will not be shorten
        var theWallCell = $('#wall-' + idx + '-' + loopLen[i]);
        theWallCell.text(theStr);
        if (isWbArrNotSingle) {
            if (theStr.length > 8) {
                theWallCell.addClass('wall-cell-len-9');
            } else if (theStr.length > 7) {
                theWallCell.addClass('wall-cell-len-8');
            } else if (theStr.length > 6) {
                theWallCell.addClass('wall-cell-len-7');
            }
        }
    }
    // wall - 4 Outbound Call will not divide ACD service
    if (isSocial) {
        $('#wall-' + idx + '-4').text('N/A');
    } else {
        $('#wall-' + idx + '-4').text(serviceObj.OutboundCall);
    };
    // var d = new Date();
    // var t = d.toLocaleTimeString();
    document.getElementById('wall-' + idx + '-update-time').innerHTML = serviceObj.TimeStamp.slice(11, 16);// t;
    initSlaGauge(abanonedPercentage, avgAbandonedTime, idx);
}
function loadWallData() {
    $.each(wbArr, function (idx, val) {
        $.ajax({
            type: "POST",
            url: config.wiseUrl + '/api/config/GetMonitorStatistics',
            data: JSON.stringify({ serviceId: val.serviceId, groupId: val.acdId }),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in GetMonitorStatistics');
                console.log(r.details);
            } else {
                initWallData(r.data, val.isSocial, idx);
            }
        });
    });
}
function initCallDou() {
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
    if (callDou) {
        // update data
        callDou.data.datasets[0].data = agentSatusSample;
        // update label calback
        // callDou.options.tooltips.callbacks.label = callDou.options.tooltips.callbacks.label;     // 20250321 callDou.options.tooltips.callbacks.label' is assigned to itself.
        callDou.options.elements.center.text = toalAvailableAgent + ' agents';
        callDou.update();
    } else {
        callDou = new Chart(document.getElementById("agent-call-dou"),
            {
                type: 'doughnut',
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
                  //  legend: {                         // 20250401 Duplicate name 'legend'.
                  //      display: 'false',
                  //  },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    },
                    layout: {
                        padding: {
                            left: 0,
                            right: 0,
                            top: 30,
                            bottom: 0 // to let bottom text shown
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
                                var thePercentage = Math.round((theNo / toalAvailableAgent) * 100);
                                label += (theNo + ' (' + thePercentage + '%)');
                                return label;
                            }
                        }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            generateLabels: function (chart) {
                                var data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map(function (label, i) {
                                        var meta = chart.getDatasetMeta(0);
                                        var ds = data.datasets[0];
                                        var arc = meta.data[i];
										var custom = arc?.custom ?? {};		// var custom = arc && arc.custom || {};	//20250516 Prefer using an optional chain expression instead, as it's more concise and easier to read.
                                        var getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
                                        var arcOpts = chart.options.elements.arc;
                                        var fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
                                        var stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
                                        var bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

                                        // We get the value of the current label
                                        var value = chart.config.data.datasets[arc._datasetIndex].data[arc._index];

                                        return {
                                            // Instead of `text: label,`
                                            // We add the value to the string
                                            text: label + " : " + value,
                                            fillStyle: fill,
                                            strokeStyle: stroke,
                                            lineWidth: bw,
                                            hidden: isNaN(ds.data[i]) || meta.data[i].hidden,
                                            index: i
                                        };
                                    });
                                } else {
                                    return [];
                                }
                            }
                        }
                    },
                    elements: {
                        center: {
                            text: toalAvailableAgent + ' agents',
                            color: '#3C4858', // Default is #000000
                            fontStyle: 'Arial', // Default is Arial
                            sidePadding: 20 // Defualt is 20 (as a percentage)
                        }
                    }
                },
                plugins: [{
                    beforeDraw: function (chart) {
                        if (chart.config.options.elements.center) {
                            // Get ctx from string
                            var ctx = chart.chart.ctx;

                            // Get options from the center object in options
                            var centerConfig = chart.config.options.elements.center;
                            var fontStyle = centerConfig.fontStyle || 'Arial';
                            var txt = centerConfig.text;
                            var color = centerConfig.color || '#000';
                            var sidePadding = centerConfig.sidePadding || 20;
                            var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)
                            // Start with a base font of 30px
                            ctx.font = "30px " + fontStyle;

                            // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
                            var stringWidth = ctx.measureText(txt).width;
                            var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

                            // Find out how much the font can grow in width.
                            var widthRatio = elementWidth / stringWidth;
                            var newFontSize = Math.floor(30 * widthRatio);
                            var elementHeight = (chart.innerRadius * 2);

                            // Pick a new font size so it will not be larger than the height of label.
                            var fontSizeToUse = Math.min(newFontSize, elementHeight);

                            // Set font settings to draw it correctly.
                            ctx.textAlign = 'center';
                            // ctx.textBaseline = 'bottom';
                            ctx.textBaseline = 'middle';
                            var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
                            var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);//  + 20;
                            ctx.font = fontSizeToUse + "px " + fontStyle;
                            ctx.fillStyle = color;

                            //Draw text in center
                            ctx.fillText(txt, centerX, centerY);
                        }
                    }
                }]
            });
    }
}

function initChatDou() {
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
    var agentSatusSample = [chatNo, noChat]
    if (socialDou) {
        // Update data
        socialDou.data.datasets[0].data = agentSatusSample;
        // Update label calback
        // socialDou.options.tooltips.callbacks.label = socialDou.options.tooltips.callbacks.label; // 20250321 callDou.options.tooltips.callbacks.label' is assigned to itself.
        socialDou.options.elements.center.text = toalAvailableAgent + ' agents';
        socialDou.update();
    } else {
        socialDou = new Chart(document.getElementById("agent-chat-dou"),
            {
                type: 'doughnut',
                data: {
                    "labels": ["Chatting", "No Chat"],
                    datasets: [{
                        "data": agentSatusSample,
                        "backgroundColor": ["cornflowerblue", "#dd6e57"]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    },
                    layout: {
                        padding: {
                            left: 0,
                            right: 0,
                            top: 30,
                            bottom: 0 // to let bottom text shown
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
                                var thePercentage = Math.round((theNo / toalAvailableAgent) * 100);
                                label += (theNo + ' (' + thePercentage + '%)');
                                return label;
                            }
                        }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            generateLabels: function (chart) {
                                var data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map(function (label, i) {
                                        var meta = chart.getDatasetMeta(0);
                                        var ds = data.datasets[0];
                                        var arc = meta.data[i];
										var custom = arc?.custom ?? {};		// var custom = arc && arc.custom || {};	//20250516 Prefer using an optional chain expression instead, as it's more concise and easier to read.
                                        var getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
                                        var arcOpts = chart.options.elements.arc;
                                        var fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
                                        var stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
                                        var bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

                                        // We get the value of the current label
                                        var value = chart.config.data.datasets[arc._datasetIndex].data[arc._index];

                                        return {
                                            // Instead of `text: label,`
                                            // We add the value to the string
                                            text: label + " : " + value,
                                            fillStyle: fill,
                                            strokeStyle: stroke,
                                            lineWidth: bw,
                                            hidden: isNaN(ds.data[i]) || meta.data[i].hidden,
                                            index: i
                                        };
                                    });
                                } else {
                                    return [];
                                }
                            }
                        }
                    },
                    elements: {
                        center: {
                            text: toalAvailableAgent + ' agents',
                            color: '#3C4858', // Default is #000000
                            fontStyle: 'Arial', // Default is Arial
                            sidePadding: 20 // Defualt is 20 (as a percentage)
                        }
                    }
                },
                plugins: [{
                    beforeDraw: function (chart) {
                        if (chart.config.options.elements.center) {
                            // Get ctx from string
                            var ctx = chart.chart.ctx;

                            // Get options from the center object in options
                            var centerConfig = chart.config.options.elements.center;
                            var fontStyle = centerConfig.fontStyle || 'Arial';
                            var txt = centerConfig.text;
                            var color = centerConfig.color || '#000';
                            var sidePadding = centerConfig.sidePadding || 20;
                            var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)
                            // Start with a base font of 30px
                            ctx.font = "30px " + fontStyle;

                            // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
                            var stringWidth = ctx.measureText(txt).width;
                            var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

                            // Find out how much the font can grow in width.
                            var widthRatio = elementWidth / stringWidth;
                            var newFontSize = Math.floor(30 * widthRatio);
                            var elementHeight = (chart.innerRadius * 2);

                            // Pick a new font size so it will not be larger than the height of label.
                            var fontSizeToUse = Math.min(newFontSize, elementHeight);

                            // Set font settings to draw it correctly.
                            ctx.textAlign = 'center';
                            // ctx.textBaseline = 'bottom';
                            ctx.textBaseline = 'middle';
                            var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
                            var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);//  + 20;
                            ctx.font = fontSizeToUse + "px " + fontStyle;
                            ctx.fillStyle = color;

                            //Draw text in center
                            ctx.fillText(txt, centerX, centerY);
                        }
                    }
                }]
            });
    }
}
function updateAgentInfo() {
    wmAgentObj = window.opener.wmAgentObj;
    toalAvailableAgent = Object.keys(wmAgentObj).length;
    initCallDou();
    if (hvSocial) {
        initChatDou();
    }
}
function encodeTime(t) {
    var s = "0" + t % 60;
    // var m = "" + parseInt(t / 60);
    var m = parseInt(t / 60);
    var h = "";
    if (m > 60) {
        h = parseInt(m/60);
        m = m - (h*60);
        
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
function updateQueueTbl(updateAcdObj) {
    // traQTbl could be not yet inited when just open the popup
    if (traQTbl) {
        traQTbl.rows(function (idx, data, node) {
            if (data.AcdGroupID === Number(updateAcdObj.groupId)) {
                traQTbl.cell({ row: idx, column: 2 }).data(updateAcdObj.waitCount);
                traQTbl.cell({ row: idx, column: 3 }).data(encodeTime(Number(updateAcdObj.waitTime)));
            }
        });
    }
    // To sort the table
    traQTbl.draw();
}
function initQueue(acdArr) {
    traQTbl = $('#trad-q-tbl').DataTable({
        data: acdArr,
        lengthChange: true,
        language: {
            "paginate": {
                "previous": "PREV"
            }
        },
        searching: false,
        info: false,
        aaSorting: [[2, "desc"], [3, "desc"]],
        scrollY: '37vh',
        scrollCollapse: true,
        paging: false,
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
    setTimeout(function () { traQTbl.columns.adjust().draw(false); }, 200);
    // In Case before Live Mon open already got acd info
    var wmACDObj = window.opener.wmACDObj;
    for (var acdObj in wmACDObj) {
        updateQueueTbl(wmACDObj[acdObj]);
    }
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
            url: config.wiseUrl + '/api/Config/GetACDGroupList',
            data: JSON.stringify({ 'serviceId': serviceId }),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }).always(function (r) {
            if (!/^success$/i.test(r.result || "")) {
                console.log('error in GetACDGroupList');
                console.log(r.details || "error");
            } else {		// } { 20250516 Nested block is redundant.
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

function loadServiceList() {
    $.ajax({
        type: "POST",
        url: config.wiseUrl + '/api/Config/GetServiceList',
        data: JSON.stringify({}),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).always(function (r) {
        if (!/^success$/i.test(r.result || "")) {
            console.log('error in GetServiceList');
            console.log(r.details);
        } else {	// } { 20250516 Nested block is redundant.
            var serviceArr = r.data;
            if (serviceArr && serviceArr.length > 0) {
                // Init Live Mon Queue Select
                for (let serviceObj of serviceArr) {
                    $('#wm-service-select').append(
                        '<option class="queue-header-option" value=' + serviceObj.ServiceID + '>' + serviceObj.ServiceDesc + '</option>'
                    );
                }
                // Init Voice Log Select
                for (let serviceObj of serviceArr) {
                    $('#voice-service-select').append(
                        '<option value=' + serviceObj.ServiceID + '>' + serviceObj.ServiceDesc + '</option>'
                    );
                }
                // If have service, or after loading service, show the select box
                $('#voice-select-container').removeClass('d-none');
            }
            getACDArr(serviceArr);
        }
    });
}


function drawMapChart(mapData) {
    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_kelly); // though color overried by gray color, but when hover, color will follow this theme
        // Themes end

        // var continents = { // NO DEL not sure will change cotinents color in future
        //   "AF": 0,
        //   "AN": 1,
        //   "AS": 2,
        //   "EU": 3,
        //   "NA": 4,
        //   "OC": 5,
        //   "SA": 6
        // }

        // Create map instance
        var chart = am4core.create("chartdiv", am4maps.MapChart);
        chart.projection = new am4maps.projections.Miller();

        // Create map polygon series for world map
        var worldSeries = chart.series.push(new am4maps.MapPolygonSeries());
        worldSeries.useGeodata = true;
        worldSeries.geodata = am4geodata_worldLow;// am4geodata_chinaLow <= will show china only
        worldSeries.exclude = ["AQ"];

        var worldPolygon = worldSeries.mapPolygons.template;
        worldPolygon.tooltipText = "{name}";
        worldPolygon.nonScalingStroke = true;
        worldPolygon.strokeOpacity = 0.5;
        worldPolygon.fill = am4core.color("#d3d3d3");
        worldPolygon.propertyFields.fill = "color";

        var hs = worldPolygon.states.create("hover");
        hs.properties.fill = chart.colors.getIndex(9);


        // Create country specific series (but hide it for now)
        var countrySeries = chart.series.push(new am4maps.MapPolygonSeries());
        countrySeries.useGeodata = true;
        countrySeries.hide();
        countrySeries.geodataSource.events.on("done", function (ev) {
            worldSeries.hide();
            countrySeries.show();
        });

        var countryPolygon = countrySeries.mapPolygons.template;
        countryPolygon.tooltipText = "{name}";
        countryPolygon.nonScalingStroke = true;
        countryPolygon.strokeOpacity = 0.5;
        countryPolygon.fill = am4core.color("#d3d3d3"); // am4core.color("#eee");


        var hs = countryPolygon.states.create("hover");
        hs.properties.fill = chart.colors.getIndex(9);

        // Set up click events
        worldPolygon.events.on("hit", function (ev) {
            ev.target.series.chart.zoomToMapObject(ev.target);
            var map = ev.target.dataItem.dataContext.map;
            if (map) {
                ev.target.isHover = false;
                countrySeries.geodataSource.url = "./js/amcharts/geodata/json/" + map + ".json";
                countrySeries.geodataSource.load();
            }
        });

        // Set up data for countries
        var data = [];
        for (var id in am4geodata_data_countries2) {
            if (am4geodata_data_countries2.hasOwnProperty(id)) {
                var country = am4geodata_data_countries2[id];
                if (country.maps.length) {
                    data.push({
                        id: id,
                        color: '#d3d3d3', // chart.colors.getIndex(continents[country.continent_code]), // NO DEL if country color not by gray, but continent color
                        map: country.maps[0]
                    });
                }
            }
        }
        worldSeries.data = data;

        // Zoom control
        chart.zoomControl = new am4maps.ZoomControl();

        var homeButton = new am4core.Button();
        homeButton.events.on("hit", function () {
            worldSeries.show();
            countrySeries.hide();
            chart.goHome();
        });

        homeButton.icon = new am4core.Sprite();
        homeButton.padding(7, 5, 7, 5);
        homeButton.width = 30;
        homeButton.icon.path = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";
        homeButton.marginBottom = 10;
        homeButton.parent = chart.zoomControl;
        homeButton.insertBefore(chart.zoomControl.plusButton);


        mapData.forEach(function (val, idx) {

            // mapData[idx].color = chart.colors.getIndex(idx + 7); // NO DEL 0-6 is continent color <= if add back continent color will change to this line

            // NO DEL not one country one color now
            // lightgray color if use will simliar color with gary color background
            // if (idx < 20) {
            //     mapData[idx].color = chart.colors.getIndex(idx);
            // } else {
            //     mapData[idx].color = chart.colors.getIndex(idx + 1);
            // }
            var theData = mapData[idx];
            var theVal = theData.value;
            if (theVal < 10) {
                mapData[idx].color = 'green';
            } else {
                mapData[idx].color = '#FF6600'
            }
        })
        // initChiMapChart(mapData);
        // Set map definition
        chart.geodata = am4geodata_worldLow; // am4geodata_chinaLow <= will show china only

        worldSeries.events.on("validated", function () {
            imageSeries.invalidate();
        })


        imageSeries = chart.series.push(new am4maps.MapImageSeries());
        imageSeries.data = mapData;
        imageSeries.dataFields.value = "value";


        var imageTemplate = imageSeries.mapImages.template;
        imageTemplate.nonScaling = true

        imageTemplate.adapter.add("latitude", function (latitude, target) { // Y
            var polygon = worldSeries.getPolygonById(target.dataItem.dataContext.id);
            if (polygon) {
                return polygon.visualLatitude;
            }
            // return latitude; // comment this and have below code is for location unkown
            if (latitude == undefined) {
                return -40;
            } else {
                return latitude;
            }
        })

        imageTemplate.adapter.add("longitude", function (longitude, target) { // X
            var placeId = target.dataItem.dataContext.id;
            var polygon = worldSeries.getPolygonById(placeId);
            if (polygon) {
                if (placeId == 'RU') {  // As Russia(RU) in two sides of maps, the visualLogitude centered in the middle of map
                    return polygon.visualLongitude + 110;
                } else {
                    return polygon.visualLongitude;
                }
            }
            // return longitude; // comment this and have below code is for location unkown
            if (longitude == undefined) {
                return -151;
            } else {
                return longitude;
            }

        })

        var circle = imageTemplate.createChild(am4core.Circle);
        circle.fillOpacity = 0.7;
        circle.propertyFields.fill = "color";
        circle.tooltipText = "{name}: [bold]{value}[/]";
        // circle.alwaysShowTooltip=true; <= NOT WORK as all tooltips will in same position
        imageSeries.heatRules.push({
            "target": circle,
            "property": "radius",
            "min": 5, // min size of the circle
            "max": 5, // max size of the circle
            "dataField": "value"
        })

        var label = imageTemplate.createChild(am4core.Label);
        label.text = "{name}: [bold]{value}[/]";// "{name}"
        label.horizontalCenter = "middle";
        label.padding(0, 0, 0, 0);
        // the label position put below the circle
        label.adapter.add("dy", function (dy, target) {
            var theCircle = target.parent.children.getIndex(0);
            return theCircle.pixelRadius;
        })

        legend = new am4maps.Legend();
        legend.background.fill = am4core.color("#000");
        legend.background.fillOpacity = 0.05;

        legend.width = 220;
        legend.align = "right";
        legend.padding(10, 15, 10, 15);
        legend.data = [];
        var legendDataArr = [];
        for (let theArea of mapData) {
            legendDataArr.push({
                "name": (theArea.name + ": " + theArea.value),
                "fill": theArea.color
            });
        }
        legend.data = legendDataArr;
        legend.itemContainers.template.clickable = false;
        legend.itemContainers.template.focusable = false;

        legend.position = "left";

        /* Create a separate container to put legend in */
        var legendContainer = am4core.create("legenddiv", am4core.Container);
        legendContainer.width = am4core.percent(100);
        legendContainer.height = am4core.percent(100);
        legend.position = "top";
        legend.parent = legendContainer;
    })
}

function initChiMapChart(mapData) {
    mapData.forEach(function (val, idx) {

        // mapData[idx].color = chart.colors.getIndex(idx + 7); // NO DEL 0-6 is continent color <= if add back continent color will change to this line

        // NO DEL not one country one color now
        // lightgray color if use will simliar color with gary color background
        // if (idx < 20) {
        //     mapData[idx].color = chart.colors.getIndex(idx);
        // } else {
        //     mapData[idx].color = chart.colors.getIndex(idx + 1);
        // }
        var theData = mapData[idx];
        var theVal = theData.value;
        if (theVal < 10) {
            mapData[idx].color = 'green';
        } else {
            mapData[idx].color = '#FF6600'
        }
    })
    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_kelly);
        // Themes end

        // NO DEL The index below is for getting continents color, no need now
        // var continents = {
        // "AF": 0,
        // "AN": 1,
        // "AS": 2,
        // "EU": 3,
        // "NA": 4,
        // "OC": 5,
        // "SA": 6
        // }

        // Create map instance
        var chart = am4core.create("chi-chartdiv", am4maps.MapChart);
        chart.projection = new am4maps.projections.Miller();

        // Create map polygon series for world map
        var countrySeries = chart.series.push(new am4maps.MapPolygonSeries());
        countrySeries.useGeodata = true;
        countrySeries.geodata = am4geodata_chinaHigh;
        // countrySeries.exclude = ["AQ"];

        var countryPolygon = countrySeries.mapPolygons.template;
        countryPolygon.tooltipText = "{name}";
        countryPolygon.nonScalingStroke = true;
        countryPolygon.strokeOpacity = 0.5;
        countryPolygon.fill = am4core.color("#d3d3d3");


        var hs = countryPolygon.states.create("hover");
        hs.properties.fill = chart.colors.getIndex(9);

        // Set up data for countries
        var data = [];
        for (var id in am4geodata_data_countries2) {
            if (am4geodata_data_countries2.hasOwnProperty(id)) {
                var country = am4geodata_data_countries2[id];
                if (country.maps.length) {
                    data.push({
                        id: id,
                        color: '#d3d3d3', // chart.colors.getIndex(continents[country.continent_code]),
                        map: country.maps[0]
                    });
                }
            }
        }
        countrySeries.data = data;
        // worldSeries.data = data;

        // Zoom control
        chart.zoomControl = new am4maps.ZoomControl();

        var homeButton = new am4core.Button();
        homeButton.events.on("hit", function () {
            // worldSeries.show();
            countrySeries.show();
            chart.goHome();
        });

        homeButton.icon = new am4core.Sprite();
        homeButton.padding(7, 5, 7, 5);
        homeButton.width = 30;
        homeButton.icon.path = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";
        homeButton.marginBottom = 10;
        homeButton.parent = chart.zoomControl;
        homeButton.insertBefore(chart.zoomControl.plusButton);

        // chart.colors.getIndex(20) <= lightgray color don't use this
        // var mapData = [
        //   { "id": "CN-HK", "name": "Hong Kong", "value": 14349569, "color": chart.colors.getIndex(21) } // in worldLow the id is "HK", in chinaLow, the id is "CN-HK"
        // ];

        // Set map definition
        chart.geodata = am4geodata_chinaHigh;

        countrySeries.events.on("validated", function () {
            imageSeries.invalidate();
        })


        var imageSeries = chart.series.push(new am4maps.MapImageSeries());
        imageSeries.data = mapData;
        imageSeries.dataFields.value = "value";

        var imageTemplate = imageSeries.mapImages.template;
        imageTemplate.nonScaling = true

        imageTemplate.adapter.add("latitude", function (latitude, target) {
            var polygon = countrySeries.getPolygonById(target.dataItem.dataContext.id);
            if (polygon) {
                return polygon.visualLatitude;
            }
            // return latitude; // comment this and have below code is for location unkown
            if (latitude == undefined) {
                return -50;
            } else {
                return latitude;
            }
        })

        imageTemplate.adapter.add("longitude", function (longitude, target) {
            var polygon = countrySeries.getPolygonById(target.dataItem.dataContext.id);
            if (polygon) {
                return polygon.visualLongitude;
            }
            // return longitude; // comment this and have below code is for location unkown
            if (longitude == undefined) {
                return -151;
            } else {
                return longitude;
            }

        })

        var circle = imageTemplate.createChild(am4core.Circle);
        circle.fillOpacity = 0.7;
        circle.propertyFields.fill = "color";
        circle.tooltipText = "{name}: [bold]{value}[/]";

        imageSeries.heatRules.push({
            "target": circle,
            "property": "radius",
            "min": 5,
            "max": 5,
            "dataField": "value"
        })

        var label = imageTemplate.createChild(am4core.Label);
        label.text = "{name}: [bold]{value}[/]";// "{name}"
        label.horizontalCenter = "middle";
        label.padding(0, 0, 0, 0);
        label.adapter.add("dy", function (dy, target) {
            var circle = target.parent.children.getIndex(0);
            return circle.pixelRadius;
        })

        legend = new am4maps.Legend();
        legend.background.fill = am4core.color("#000");
        legend.background.fillOpacity = 0.05;

        legend.width = 220;
        legend.align = "right";
        legend.padding(10, 15, 10, 15);
        legend.data = [];
        var legendDataArr = [];
        for (let theArea of mapData) {
            legendDataArr.push({
                "name": (theArea.name + ": " + theArea.value),
                "fill": theArea.color
            });
        }
        legend.data = legendDataArr;
        legend.itemContainers.template.clickable = false;
        legend.itemContainers.template.focusable = false;
        legend.position = "left";

        /* Create a separate container to put legend in */
        var legendContainer = am4core.create("chi-legenddiv", am4core.Container);
        legendContainer.width = am4core.percent(100);
        legendContainer.height = am4core.percent(100);

        legend.position = "top";
        legend.parent = legendContainer;

    }); // end am4core.ready()
}

function initMapChart() {
    // To do: call the data

    // Kenneth instruction: shouldsort by updated time than the inbound number
    var mapData = [
        { "id": "CN", "name": "China", "value": 105 },
        { "id": "AU", "name": "Australia", "value": 13 },
        { "id": "US", "name": "United States", "value": 11 },
        { "id": "CA", "name": "Canada", "value": 5 },
        { "id": "AM", "name": "Armenia", "value": 4 },
        { "id": "UN", "name": "Unknown", "value": 4 },
        { "id": "AO", "name": "Angola", "value": 3 },
        { "id": "DZ", "name": "Algeria", "value": 2 },

        { "id": "BH", "name": "Bahrain", "value": 2 },
        { "id": "RU", "name": "Russia", "value": 2 },
        { "id": "BJ", "name": "Benin", "value": 2 },

        { "id": "BW", "name": "Botswana", "value": 2 },
        { "id": "AR", "name": "Argentina", "value": 1 },

        { "id": "BE", "name": "Belgium", "value": 1 },

        { "id": "BR", "name": "Brazil", "value": 1 },
        { "id": "BN", "name": "Brunei", "value": 1 }
    ];
    var chiData = [
        { "id": "HK", "name": "Hong Kong", "value": 81 },
        { "id": "CN-SH", "name": "Shanghai", "value": 14 },
        { "id": "CN-BJ", "name": "Beijing", "value": 7 },
        { "id": "CN-QH", "name": "Qinghai", "value": 2 },
        { "id": "CN-HL", "name": "Heilongjiang", "value": 1 }


    ];
    // var mapData = [

    //     { "id": "DZ", "name": "Algeria", "value": 2 },
    //     { "id": "AO", "name": "Angola", "value": 3 },
    //     { "id": "AR", "name": "Argentina", "value": 1 },
    //     { "id": "AM", "name": "Armenia", "value": 4 },
    //     { "id": "AU", "name": "Australia", "value": 13 },
    //     { "id": "BH", "name": "Bahrain", "value": 2 },

    //     { "id": "BE", "name": "Belgium", "value": 1 },
    //     { "id": "BJ", "name": "Benin", "value": 2 },

    //     { "id": "BW", "name": "Botswana", "value": 2 },
    //     { "id": "BR", "name": "Brazil", "value": 1 },
    //     { "id": "BN", "name": "Brunei", "value": 1 },

    //     { "id": "CA", "name": "Canada", "value": 5 },
    //     { "id": "CN-HL", "name": "Heilongjiang", "value": 4 },
    //     { "id": "HK", "name": "Hong Kong", "value": 87 },

    //     { "id": "RU", "name": "Russia", "value": 2 },

    //     { "id": "UN", "name": "Unknown", "value": 4 },
    //     { "id": "US", "name": "United States", "value": 11},
    //     { "id": "CN-QH", "name": "Qinghai", "value": 14 },
    //   ];
    // var mapData = [
    //     { "id": "AF", "name": "阿富汗", "value": 3 },
    //     { "id": "DZ", "name": "阿爾及利亞", "value": 2 },
    //     { "id": "AO", "name": "安哥拉", "value": 6 },
    //     { "id": "AR", "name": "阿根廷", "value": 11 },
    //     { "id": "AM", "name": "亞美尼亞", "value": 4 },
    //     { "id": "AU", "name": "澳大利亞", "value": 4 },
    //     { "id": "BH", "name": "巴林", "value": 2 },
    //     { "id": "BD", "name": "孟加拉國", "value": 6 },
    //     { "id": "BY", "name": "白俄羅斯", "value": 7 },
    //     { "id": "BE", "name": "比利時", "value": 1 },
    //     { "id": "BJ", "name": "貝寧", "value": 5 },
    //     // { "id": "BO", "name": "玻利維亞", "value": 6 },
    //     { "id": "BW", "name": "博茨瓦納", "value": 6 },
    //     { "id": "BR", "name": "巴西", "value": 1 },
    //     { "id": "BN", "name": "文萊", "value": 1 },
    //     { "id": "KH", "name": "柬埔寨", "value": 4 },
    //     // { "id": "CM", "name": "喀麥隆", "value": 5 },
    //     { "id": "CA", "name": "Canada", "value": 5 },
    //     { "id": "HK", "name": "Hong Kong", "value": 100 },
    //     { "id": "CN-SX", "name": "Shanxi", "value": 100 },
    //     { "id": "UN", "name": "Unknown", "value": 4 }
    //   ];

    // var mapData = [
    //     { "id": "AF", "name": "Afghanistan", "value": 3 },
    //     { "id": "DZ", "name": "Algeria", "value": 2 },
    //     { "id": "AO", "name": "Angola", "value": 6 },
    //     { "id": "AR", "name": "Argentina", "value": 11 },
    //     { "id": "AM", "name": "Armenia", "value": 4 },
    //     { "id": "AU", "name": "Australia", "value": 4 },
    //     { "id": "BH", "name": "Bahrain", "value": 2 },
    //     { "id": "BD", "name": "Bangladesh", "value": 6 },
    //     { "id": "BY", "name": "Belarus", "value": 7 },
    //     { "id": "BE", "name": "Belgium", "value": 1 },
    //     { "id": "BJ", "name": "Benin", "value": 5 },
    //     // { "id": "BO", "name": "Bolivia", "value": 6 },
    //     { "id": "BW", "name": "Botswana", "value": 6 },
    //     { "id": "BR", "name": "Brazil", "value": 1 },
    //     { "id": "BN", "name": "Brunei", "value": 1 },
    //     { "id": "KH", "name": "Cambodia", "value": 4 },
    //     // { "id": "CM", "name": "Cameroon", "value": 5 },
    //     { "id": "CA", "name": "Canada", "value": 5 },
    //     { "id": "CN", "name": "China", "value": 5 },
    //     { "id": "HK", "name": "Hong Kong", "value": 100 },
    //     { "id": "UN", "name": "Unknown", "value": 4 }
    //   ];
    // var mapData = [
    //     { "id": "AF", "name": "Afghanistan", "value": 32358260, "color": chart.colors.getIndex(0) },
    //     { "id": "DZ", "name": "Algeria", "value": 35980193, "color": chart.colors.getIndex(1) },
    //     { "id": "AO", "name": "Angola", "value": 19618432, "color": chart.colors.getIndex(2) },
    //     { "id": "AR", "name": "Argentina", "value": 40764561, "color": chart.colors.getIndex(3) },
    //     { "id": "AM", "name": "Armenia", "value": 3100236, "color": chart.colors.getIndex(4) },
    //     { "id": "AU", "name": "Australia", "value": 22605732, "color": chart.colors.getIndex(6) },
    //     { "id": "BH", "name": "Bahrain", "value": 1323535, "color": chart.colors.getIndex(7) },
    //     { "id": "BD", "name": "Bangladesh", "value": 150493658, "color": chart.colors.getIndex(8) },
    //     { "id": "BY", "name": "Belarus", "value": 9559441, "color": chart.colors.getIndex(9) },
    //     { "id": "BE", "name": "Belgium", "value": 10754056, "color": chart.colors.getIndex(10) },
    //     { "id": "BJ", "name": "Benin", "value": 9099922, "color": chart.colors.getIndex(11) },
    //     { "id": "BO", "name": "Bolivia", "value": 10088108, "color": chart.colors.getIndex(12) },
    //     { "id": "BW", "name": "Botswana", "value": 2030738, "color": chart.colors.getIndex(13) },
    //     { "id": "BR", "name": "Brazil", "value": 196655014, "color": chart.colors.getIndex(14) },
    //     { "id": "BN", "name": "Brunei", "value": 405938, "color": chart.colors.getIndex(15) },
    //     { "id": "KH", "name": "Cambodia", "value": 14305183, "color": chart.colors.getIndex(16) },
    //     { "id": "CM", "name": "Cameroon", "value": 20030362, "color": chart.colors.getIndex(17) },
    //     { "id": "CA", "name": "Canada", "value": 34349561, "color": chart.colors.getIndex(18) },
    //     { "id": "CN", "name": "China", "value": 32349568, "color": chart.colors.getIndex(19) },
    //     { "id": "HK", "name": "Hong Kong", "value": 14349569, "color": chart.colors.getIndex(21) },
    //     { "id": "UN", "name": "Unknown", "value": 16349545, "color": chart.colors.getIndex(22) }
    //   ];
    $('#legenddiv').height(90 + (mapData.length * 39 / 3)); // this is needed, otherwise some countries not be able to shown
    $('#chi-legenddiv').height(80 + (chiData.length * 39 / 3)); // this is needed, otherwise some countries not be able to shown
    drawMapChart(mapData);
    initChiMapChart(chiData);
}

function updateMapChart() {
    // To do: call the data
    var mapData = [
        { "id": "AF", "name": "Afghanistan", "value": 3 },
        { "id": "DZ", "name": "Algeria", "value": 2 },
        { "id": "AO", "name": "Angola", "value": 6 },
        { "id": "AR", "name": "Argentina", "value": 11 },
        { "id": "AM", "name": "Armenia", "value": 4 },
        { "id": "AU", "name": "Australia", "value": 4 },
        { "id": "BH", "name": "Bahrain", "value": 2 },
        { "id": "BD", "name": "Bangladesh", "value": 6 },
        { "id": "BY", "name": "Belarus", "value": 7 },
        { "id": "BE", "name": "Belgium", "value": 1 },
        { "id": "BJ", "name": "Benin", "value": 5 },

        { "id": "BW", "name": "Botswana", "value": 6 },
        { "id": "BR", "name": "Brazil", "value": 1 },
        { "id": "BN", "name": "Brunei", "value": 1 },
        { "id": "KH", "name": "Cambodia", "value": 4 },

        { "id": "CA", "name": "Canada", "value": 5 },
        { "id": "CN", "name": "China", "value": 5 },
        { "id": 'CN-FJ', "name": "Fujian", "value": 2 },
        { "id": "HK", "name": "Hong Kong", "value": 100 },
        { "id": "CN-SX", "name": "Shanxi", "value": 100 },
        { "id": "TW", "name": "Taiwan", "value": 100 },
        { "id": "UN", "name": "Unknown", "value": 4 }
    ]

    imageSeries.data = mapData;
    var newLegendData = [];
    for (let theArea of mapData) {
        newLegendData.push({
            "name": (theArea.name + ": " + theArea.value),
            "fill": theArea.color
        });
    }
    legend.data = newLegendData;
}

function switchContent(selected) {
    // No need to change any if same category
    if (selected == selectedCat) {
        return;
    }
    switch (selected) {
        case 'Agent Status':
            $('#agent-status').removeClass('d-none');
            $('#map-chart').addClass('d-none');
            break;
        case 'Map Chart':
            $('#agent-status').addClass('d-none');
            $('#map-chart').removeClass('d-none');
            if (imageSeries == undefined) {
                initMapChart();
            } else {
                updateMapChart();
            }
            break;
        default:
            break;
    }
    selectedCat = selected;
}