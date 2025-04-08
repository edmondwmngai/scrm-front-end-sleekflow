function now() {
    var date = new Date();
    var time = {
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    };

    var format = 'hh:mm:ss';
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + ''));
    }

    for (var k in time) {
        if (new RegExp('(' + k + ')').test(format))
            format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (time[k]) : (('00' + time[k]).substr(('' + time[k]).length)));
    }

    return format;
}

var sip = sipControl({
    DebugLevel: 'error',      // optional
    AutoLoginInterval: 3000,  // optional
    // EnableRTCWebBreaker: false,
    EnableRTCWebBreaker: true,
    WebSocketServerURL: config.rtc_ws_url,
    OutboundProxyURL: '',
    // ICEServers: [],
    ICEServers: config.rtc_ice,

    onConnectionStatus: function (status) {
        console.log('app connection =', status);
        // btnLogin.disabled = status === 'connect';
        // btnLogout.disabled = !(status === 'connect');
    },
    onLogin: function (flag) {
        console.log('app login =', flag);
    },
    onCallStatus: function (status) {
        console.log('app call =', status);
    },
    onIncomingCall: function (phone) {
        console.log('app incall =', phone);
    },
    onMessage: function (message) {
        // txtLog.value = now() + ' ' + JSON.stringify(message) + '\r\n\r\n' + txtLog.value;
        console.log('app message =', message);
        if (message.Type === 'connection') {
            // lblConnStatus.innerText = "connection:" +  message.Message;   Two branches in a conditional structure should not have exactly the same implementation
            console.log("connection:" + message.Message);
        } else if (message.Type === 'call') {
            // lblCallStatus.innerText = "call:" + message.Message;
            console.log("call:" + message.Message);
		}
    },
});

var RTC = {
    sipLogin: function () {
        sip.login(loginId, config.rtc_pw, config.rtc_realm);
    },

    sipLogout: function () {
        sip.logout();
    },

    sipCall: function (phoneNo) {
        sip.makeCall('call-audio', phoneNo); // the call type, not wirtten other types in document, wild geuss other types: call-video, call-im, call-data
    },

    sipHangUp: function () {
        sip.hangupCall();
    },

    sipAnswer: function () {
        sip.answerCall(); // auto answer now
    },

    sipHold: function () {
        sip.holdCall();
    },

    sipResume: function () {
        sip.resumeCall();
    },

    sendDTMF: function (c) {
        sip.sendDTMF(c);
    }
}