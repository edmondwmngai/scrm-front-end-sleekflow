var serviceList = [];
/*
serviceList.push({
	source: "wise",
	name: "campaignCRM",
	shortName: "CCR",
	caption: "",
	callType: CATY_BLOG,
	dnis: "SM_WA",
	entry: "whatsapp",
	acdGroup: 8,
	showPriority: 1
});

serviceList.push({
	source: "wise",
	name: "campaignCRM",
	shortName: "CCR",
	caption: "",
	callType: CATY_WEBCHAT,
	dnis: "SM_Win2016-demoWebChat",
	acdGroup: 6,
	showPriority: 1
});

serviceList.push({
	source: "wise",
	name: "campaignCRM",
	shortName: "CCR",
	caption: "Chatbot",
	callType: CATY_WEBCHAT,
	dnis: "SM_Win2016-demoWC-Chatbot",
	acdGroup: 1,
	showPriority: 1
});

serviceList.push({
	source: "wise",
	name : "campaignCRM", 
	shortName: "CCR",
	caption : "", 
	callType: CATY_BLOG,
	dnis: "SM_Epro",
	entry: "wechat",
	acdGroup: 5,
	showPriority : 1
});
*/
serviceList.push({
	source: "wise",
	name: "campaignCRM",
	shortName: "CCR",
	caption: "",
	callType: CATY_INDB,
	dnis: "9000",
	acdGroup: 1,
	showPriority: 1
});

serviceList.push({
	source: "wise",
	name: "campaignCRM",
	shortName: "CCA",
	caption: "9000",
	callType: CATY_VMAIL,
	dnis: "9000",
	entry: "",
	acdGroup: 1,
	showPriority: 1
});

serviceList.push({
	source: "wise",
	name: "campaignCRM",
	shortName: "CCR",
	caption: "",
	callType: CATY_INDB,
	dnis: "2929",
	acdGroup: 111,
	showPriority: 1
});


serviceList.push({
	source: "wise",
	name: "campaignCRM",
	shortName: "CCR",
	caption: "",
	callType: CATY_INDB,
	dnis: "2000",
	acdGroup: 1,
	showPriority: 1
});

serviceList.push({
	source: "wise",
	name: "campaignCRM",
	shortName: "CCR",
	caption: "",
	callType: CATY_INDB,
	dnis: "9002",
	acdGroup: 1,
	showPriority: 1
});

serviceList.push({
	source: "wise",
	name: "campaignCRM",
	shortName: "CCR",
	caption: "9001",
	callType: CATY_VMAIL,
	dnis: "9001",
	acdGroup: 1,
	showPriority: 2
});

serviceList.push({
	source: "wise",
	name: "campaignCRM",
	shortName: "CCR",
	caption: "EPRO",
	callType: CATY_EMAIL,
	dnis: "demo-cpb@eprotel.com.hk",
	acdGroup: 7,
	showPriority: 2
});
/*
serviceList.push({
	source: "wise",
	name: "campaignCRM",
	shortName: "CCR",
	caption: "",
	callType: CATY_BLOG,
	dnis: "SM_Win2016-demoWeChat",
	entry: "wechat",
	acdGroup: 5,
	showPriority: 1
});

serviceList.push({
	source: "wise",
	name: "campaignCRM",
	shortName: "CCR",
	caption: "",
	callType: CATY_BLOG,
	dnis: "SM_Win2016-demoFB",
	entry: "fbmsg",
	acdGroup: 4,
	showPriority: 1
});

serviceList.push({
	source: "wise",
	name: "campaignCRM",
	shortName: "CCA",
	caption: "",
	callType: CATY_BLOG,
	dnis: "SM_Win2016-demoFB_fp",
	entry: "fbpost",
	acdGroup: 9,
	showPriority: 1
});
*/
serviceList.push({
	source: "sleekflow",
	name: "campaignCRM",
	shortName: "CCA",
	caption: "EPRO",
	callType: CATY_BLOG,
	entry: "whatsapp",
	deviceId: "85293909352",
	showPriority: 1
});	

serviceList.push({
	source: "sleekflow",
	name: "campaignCRM",
	shortName: "CCA",
	caption: "EPRO",
	callType: CATY_WEBCHAT,
	entry: "web",
	deviceId: "",
	showPriority: 1
});	

var outboundANI = {};
outboundANI["campaignCRM"] = { call: "36202316", fax: "5702", faxCover: "D:\\FaxShare\\cover.cov", email: "demo-cpb@eprotel.com.hk", sms: "2003", whatsapp: "SM_WA" };