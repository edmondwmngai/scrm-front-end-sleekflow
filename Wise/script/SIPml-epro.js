/*
* Author: zhang wei
*/
var sipControl = (function () {
  var sipControl = function (options) {
    return new sipControl.fn.init(options);
  };
  sipControl.fn = sipControl.prototype = {
    constructor: sipControl,
    init: function (options) {
      // load sipml-api script file      
      var tagHead = document.getElementsByTagName('head')[0];
      var tagScript = document.createElement('script');
      tagScript.setAttribute('type', 'text/javascript');
      // tagScript.setAttribute('src', './SIPml-api.js?svn=252');
	    tagScript.setAttribute('src', '../js/SIPml-api.js?svn=252');
      tagHead.appendChild(tagScript);
	  
	  // var tagHead1 = document.getElementsByTagName('head')[0];
      // var tagScript1 = document.createElement('script');
      // tagScript1.setAttribute('type', 'text/javascript');
      // tagScript1.setAttribute('src', '../WebRTC.js');
      // tagHead1.appendChild(tagScript1);
	  
	  // RTC.sipLogin();

      var tagBody = document.getElementsByTagName('body')[0];
      var tagAudio = document.createElement('audio');
      tagAudio.setAttribute('id', 'epro_sip_audio_remote');
      tagAudio.setAttribute('autoplay', 'autoplay');
      tagBody.appendChild(tagAudio);

      // init paramter
      var opts = options ? options : {};

      this.logined = false;
      this.autoLogin = false;
      this.autoLoginInterval = opts.AutoLoginInterval ? opts.AutoLoginInterval : 3000;
      this.autoLoginTimer = null;

      this.connectParameter = {
        WebSocketServerURL: opts.WebSocketServerURL ? opts.WebSocketServerURL : null,
        OutboundProxyURL: opts.OutboundProxyURL ? opts.OutboundProxyURL : '',
        ICEServers: opts.ICEServers ? opts.ICEServers : [],
        EnableRTCWebBreaker: opts.EnableRTCWebBreaker ? opts.EnableRTCWebBreaker === true : false,
        EnableEarlyIms: opts.EnableEarlyIms ? opts.EnableEarlyIms === true : false,
        EnabledMediaStreamCache: opts.EnabledMediaStreamCache ? opts.EnabledMediaStreamCache === true : true,
        BandWidth: opts.BandWidth ? tsk_string_to_object(opts.BandWidth) : undefined,
        VideoSize: opts.VideoSize ? tsk_string_to_object(opts.VideoSize) : undefined,
      };      
      this.loginParameter = {
        DisplayName: '',
        PrivateIdentity: '',
        PublicIdentity: '',
        Password: '',
        Realm: ''
      };

      this.oSipStack = null;
      this.oSipSessionRegister = null;
      this.oSipSessionCall = null;
      this.oSipSessionTransferCall = null;
      this.oConfigCall = null;

      this.onConnectionStatus = opts.onConnectionStatus ? opts.onConnectionStatus : function () { };
      this.onLogin = opts.onLogin ? opts.onLogin : function () { };
      this.onCallStatus = opts.onCallStatus ? opts.onCallStatus : function () { };
      this.onIncomingCall = opts.onIncomingCall ? opts.onIncomingCall : function () { };
      this.onMessage = opts.onMessage ? opts.onMessage : function () { };

      var that = this;
      this.readyStateTimer = setInterval(function () {
        if (document.readyState === 'complete') {
          clearInterval(that.readyStateTimer);
          SIPml.setDebugLevel(opts.DebugLevel ? opts.DebugLevel : 'info');
          SIPml.init(function () { that.initSuccess(that) }, function (e) { that.initFail(that, e) });
        }
      }, 500);
    },
    initSuccess: function (that) {
      if (!SIPml.isWebRtcSupported()) {
        alert(SIPml.getNavigatorFriendlyName() === 'chrome' ? 'You\'re using an old Chrome version or WebRTC is not enabled.' : 'webrtc-everywhere extension is not installed.');
        return;
      }

      if (!SIPml.isWebSocketSupported()) {
        alert('Your browser don\'t support WebSockets.');
        return;
      }

      if (!SIPml.isWebRtcSupported()) {
        alert('Your browser don\'t support WebRTC.');
        return;
      }

      that.oConfigCall = {
        audio_remote: document.getElementById('epro_sip_audio_remote'),
        events_listener: { events: '*', listener: function (e) { that.onSipEventSession(that, e) } },
        sip_caps: [
          { name: '+g.oma.sip-im' },
          { name: 'language', value: '\"en,fr\"' }
        ]
      };
    },
    initFail: function (that, e) {
      that.message(true, 'connection', e);
    },
    login: function (id, password, realm) {
      var that = this;
      try {
        var parameter = {
          DisplayName: id,
          PrivateIdentity: id,
          PublicIdentity: 'sip:' + id + '@' + realm,
          Password: password,
          Realm: realm,
        }
        if (!parameter.Realm || !parameter.PrivateIdentity || !parameter.PublicIdentity) {
          that.message(true, 'connection', 'PrivateIdentity/PublicIdentity/Realm is required');
          return;
        }
        var o_impu = tsip_uri.prototype.Parse(parameter.PublicIdentity);
        if (!o_impu || !o_impu.s_user_name || !o_impu.s_host) {
          that.message(true, 'connection', '[' + parameter.PublicIdentity.value + '] is not a valid PublicIdentity');
          return;
        }

        clearInterval(that.autoLoginTimer);
        that.autoLogin = true;
        that.autoLoginTimer = setInterval(function () {
          if (that.autoLogin && !that.logined) {
            that.login(that.loginParameter.DisplayName, that.loginParameter.Password, that.loginParameter.Realm);
          }
        }, that.autoLoginInterval);

        that.loginParameter = {
          DisplayName: parameter.DisplayName ? parameter.DisplayName : '',
          PrivateIdentity: parameter.PrivateIdentity ? parameter.PrivateIdentity : '',
          PublicIdentity: parameter.PublicIdentity ? parameter.PublicIdentity : '',
          Password: parameter.Password ? parameter.Password : '',
          Realm: parameter.Realm ? parameter.Realm : '',
        };

        that.oSipStack = new SIPml.Stack({
          realm: parameter.Realm,
          impi: parameter.PrivateIdentity,
          impu: parameter.PublicIdentity,
          password: parameter.Password,
          display_name: parameter.DisplayName,

          websocket_proxy_url: that.connectParameter.WebSocketServerURL,
          outbound_proxy_url: that.connectParameter.OutboundProxyURL,
          ice_servers: that.connectParameter.ICEServers,

          enable_rtcweb_breaker: that.connectParameter.EnableRTCWebBreaker,
          enable_early_ims: that.connectParameter.EnableEarlyIms,
          enable_media_stream_cache: that.connectParameter.EnabledMediaStreamCache,
          bandwidth: that.connectParameter.BandWidth,
          video_size: that.connectParameter.VideoSize,

          events_listener: { events: '*', listener: function (e) { that.onSipEventStack(that, this, e,) } },

          sip_headers: [
            { name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.2016.03.04' },
            { name: 'Organization', value: 'Epro Telecom' }
          ]
        });       

        if (that.oSipStack.start() != 0) {
          that.logined = false;
          that.onLogin(false);
          that.onConnectionStatus('disconnect');
          that.message(true, 'connection', 'Failed to start the SIP stack');
        } else {

        }
      } catch (ex) {
        that.logined = false;
        that.onLogin(false);
        that.onConnectionStatus('disconnect');
        that.message(true, 'connection', ex);
      }
    },
    logout: function () {
      var that = this;

      clearInterval(that.autoLoginTimer);
      that.autoLogin = false;

      if (that.oSipStack) {
        that.oSipStack.stop();
      } else {
        that.logined = false;
        thia.onLogin(false);
        that.onConnectionStatus('disconnect');
      }
    },
    makeCall: function (s_type, s_phone) {
      var that = this;
      if (that.oSipStack && !that.oSipSessionCall && !tsk_string_is_null_or_empty(s_phone)) {
        if (s_type === 'call-screenshare') {
          if (!SIPml.isScreenShareSupported()) {
            alert('Screen sharing not supported. Are you using chrome 26+?');
            return;
          }
          if (!location.protocol.match('https')) {
            alert('Screen sharing requires https://');
            return;
          }
        }

        if (that.connectParameter.BandWidth) that.oConfigCall.bandwidth = that.connectParameter.BandWidth;
        if (that.connectParameter.VideoSize) that.oConfigCall.video_size = that.connectParameter.VideoSize;

        that.oSipSessionCall = that.oSipStack.newSession(s_type, that.oConfigCall);

        if (that.oSipSessionCall.call(s_phone) != 0) {
          that.oSipSessionCall = null;
          that.message(true, 'call', 'Failed to make call');
          return;
        }
      } else if (that.oSipSessionCall) {
        that.oSipSessionCall.accept(that.oConfigCall);
        that.message(false, 'call', 'Connecting...');
      }
    },
    answerCall: function () {
      var that = this;
      if (that.oSipSessionCall) {
        that.oSipSessionCall.accept(that.oConfigCall);
        that.message(false, 'call', 'Connecting...');
      }
    },
    hangupCall: function () {
      var that = this;
      if (that.oSipSessionCall) {
        that.oSipSessionCall.hangup({ events_listener: that.oConfigCall.events_listener });
        that.message(false, 'call', 'Terminating the call...');
      }
    },
    holdCall: function () {
      var that = this;
      if (that.oSipSessionCall) {
        that.oSipSessionCall.hold();
        that.message(false, 'call', 'Holding...');
      }
    },
    resumeCall: function () {
      var that = this;
      if (that.oSipSessionCall) {
        that.oSipSessionCall.resume();
        that.message(false, 'call', 'Resume...');
      }
    },
    sendDTMF: function (c) {
      var that = this;
      if (that.oSipSessionCall && c) {
        if (that.oSipSessionCall.dtmf(c) === 0) {
          that.message(false, 'call', 'Sending DTMF');
        }
      }
    },
    message: function (flag, type, text) {
      var that = this;
      that.onMessage({ Error: flag, Type: type, Message: text });
    },
    onSipEventStack: function (that, tttt, e) {
      that.message(false, 'stack', e.type);
      switch (e.type) {
        case 'started':
          {
            that.logined = false;
            that.onLogin(false);
            that.onConnectionStatus('connect');

            try {
              that.oSipSessionRegister = tttt.newSession('register', {
                expires: 200,
                events_listener: that.oConfigCall.events_listener,
                sip_caps: [
                  { name: '+g.oma.sip-im', value: null },
                  { name: '+audio', value: null },
                  { name: 'language', value: '\"en,fr\"' }
                ]
              });
              that.oSipSessionRegister.register();
            }
            catch (ex) {
              that.message(true, 'connection', ex);
            }
            break;
          }
        case 'stopping':
        case 'stopped':
        case 'failed_to_start':
        case 'failed_to_stop':
          {
            var failed = (e.type === 'failed_to_start') || (e.type === 'failed_to_stop');
            that.oSipStack = null;
            that.oSipSessionRegister = null;
            that.oSipSessionCall = null;

            that.logined = false;
            that.onConnectionStatus('disconnect');
            that.onLogin(false);

            that.message(true, 'connection', failed ? 'Disconnected: ' + e.description : 'Disconnected');
            break;
          }
        case 'i_new_call':
          {
            if (that.oSipSessionCall) {
              e.newSession.hangup();
            } else {
              that.oSipSessionCall = e.newSession;
              that.oSipSessionCall.setConfiguration(that.oConfigCall);
              that.oSipSessionCall.accept(that.oConfigCall); // auto answer

              var phone = (that.oSipSessionCall.getRemoteFriendlyName() || 'unknown');
              if (that.onIncomingCall) {
                that.onIncomingCall(phone);
              }
              that.message(false, 'call', 'Incoming call: ' + phone);
            }
            break;
          }
        case 'm_permission_requested':
          {
            break;
          }
        case 'm_permission_accepted':
        case 'm_permission_refused':
          {
            if (e.type === 'm_permission_refused') {
              that.oSipSessionCall = null;
              that.message(true, 'call', 'Media stream permission denied');
            }
            break;
          }
        case 'starting':
        default:
          break;
      }
    },
    onSipEventSession: function (that, e) {
      if (e.type === 'sent_request')
        return;

      that.message(false, 'session', e.type);
      switch (e.type) {
        case 'connecting':
        case 'connected':
          {
            var connected = (e.type === 'connected');
            if (e.session === that.oSipSessionRegister) {
              that.logined = true;
              that.onLogin(true);
              that.message(false, 'connection', e.description);
            } else if (e.session === that.oSipSessionCall) {
              if (connected) {
                that.onCallStatus('answer');
              }

              that.message(false, 'call', e.description);
              if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback

              }
            }
            break;
          }
        case 'terminating':
        case 'terminated':
          {
            if (e.session === that.oSipSessionRegister) {
              that.oSipSessionCall = null;
              that.oSipSessionRegister = null;

              that.logined = false;
              that.onLogin(false);
              that.message(false, 'connection', e.description);
            } else if (e.session === that.oSipSessionCall) {
              that.oSipSessionCall = null;
              that.onCallStatus('hangup');
              that.message(false, 'call', e.description);
            }
            break;
          }
        case 'm_stream_video_local_added':
        case 'm_stream_video_local_removed':
        case 'm_stream_video_remote_added':
        case 'm_stream_video_remote_removed':
          {
            break;
          }
        case 'm_stream_audio_local_added':
        case 'm_stream_audio_local_removed':
        case 'm_stream_audio_remote_added':
        case 'm_stream_audio_remote_removed':
          {
            break;
          }
        case 'i_ect_new_call':
          {
            that.oSipSessionTransferCall = e.session;
            break;
          }
        case 'i_ao_request':
          {
            if (e.session === that.oSipSessionCall) {
              var responseCode = e.getSipResponseCode();
              if (responseCode === 180 || responseCode === 183) {
                that.onCallStatus('remote_ringing');
                that.message(false, 'call', 'Remote ringing...');
              }
            }
            break;
          }
        case 'm_early_media':
          {
            if (e.session === that.oSipSessionCall) {
              that.message(false, 'call', 'Early media started');
            }
            break;
          }
        case 'm_local_hold_ok':
          {
            if (e.session === that.oSipSessionCall) {
              if (that.oSipSessionCall.bTransfering) {
                that.oSipSessionCall.bTransfering = false;
              }
              that.oSipSessionCall.bHeld = true;
              that.onCallStatus('local_holding');
              that.message(false, 'call', 'Call placed on hold');
            }
            break;
          }
        case 'm_local_hold_nok':
          {
            if (e.session === that.oSipSessionCall) {
              oSipSessionCall.bTransfering = false;
              that.message(false, 'call', 'Failed to place remote party on hold');
            }
            break;
          }
        case 'm_local_resume_ok':
          {
            if (e.session === that.oSipSessionCall) {
              that.oSipSessionCall.bTransfering = false;
              that.oSipSessionCall.bHeld = false;
              that.onCallStatus('local_resume');
              that.message(false, 'call', 'Call taken off hold');

              if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback yet

              }
            }
            break;
          }
        case 'm_local_resume_nok':
          {
            if (e.session === that.oSipSessionCall) {
              that.oSipSessionCall.bTransfering = false;
              that.message(false, 'call', 'Failed to unhold call');
            }
            break;
          }
        case 'm_remote_hold':
          {
            if (e.session === that.oSipSessionCall) {
              that.onCallStatus('remote_holding');
              that.message(false, 'call', 'Placed on hold by remote party');
            }
            break;
          }
        case 'm_remote_resume':
          {
            if (e.session === that.oSipSessionCall) {
              that.onCallStatus('remote_resume');
              that.message(false, 'call', 'Taken off hold by remote party');
            }
            break;
          }
        case 'm_bfcp_info':
          {
            if (e.session === that.oSipSessionCall) {
              that.onCallStatus('BFCP');
              that.message(false, 'call', 'BFCP Info: ' + e.description + '');
            }
            break;
          }
        case 'o_ect_trying':
          {
            if (e.session === that.oSipSessionCall) {
              that.onCallStatus('transfering');
              that.message(false, 'call', 'Call transfer in progress...');
            }
            break;
          }
        case 'o_ect_accepted':
          {
            if (e.session === that.oSipSessionCall) {
              that.onCallStatus('transfer_accept');
              that.message(false, 'call', 'Call transfer accepted');
            }
            break;
          }
        case 'o_ect_completed':
        case 'i_ect_completed':
          {
            if (e.session === that.oSipSessionCall) {
              that.onCallStatus('transfer_complete');
              that.message(false, 'call', 'Call transfer completed');

              if (that.oSipSessionTransferCall) {
                that.oSipSessionCall = that.oSipSessionTransferCall;
              }
              that.oSipSessionTransferCall = null;
            }
            break;
          }
        case 'o_ect_failed':
        case 'i_ect_failed':
          {
            if (e.session === that.oSipSessionCall) {
              that.onCallStatus('transfer_fail');
              that.message(false, 'call', 'Call transfer failed');
            }
            break;
          }
        case 'o_ect_notify':
        case 'i_ect_notify':
          {
            if (e.session === that.oSipSessionCall) {
              if (e.getSipResponseCode() >= 300) {
                if (that.oSipSessionCall.bHeld) {
                  that.oSipSessionCall.resume();
                }
              }
              that.message(false, 'call', 'Call Transfer: ' + e.getSipResponseCode() + ' ' + e.description);
            }
            break;
          }
        case 'i_ect_requested':
          {
            if (e.session === oSipSessionCall) {
              that.onCallStatus('transfer_request');
              var message = 'Do you accept call transfer to [' + e.getTransferDestinationFriendlyName() + ']?';
              if (confirm(message)) {
                that.oSipSessionCall.acceptTransfer();
                that.onCallStatus('transfer_requet_accept');
                that.message(false, 'call', 'Call transfer in progress...');
                break;
              } else {
                that.oSipSessionCall.rejectTransfer();
                that.onCallStatus('transfer_requet_reject');
                that.message(false, 'call', 'Call transfer is rejected');
              }
            }
            break;
          }
      }
    }
  };
  sipControl.fn.init.prototype = sipControl.fn;
  return sipControl;
})();