		var serviceList = [];

		serviceList.push({
			name: "campaignCase",
			shortName: "CCA",
			caption: "",
			callType: CATY_WEBCHAT,
			dnis: "SM_Win2016-demoWebChat",
			entry: "",
			acdGroup: 6,
			showPriority: 1
		});

		serviceList.push({
			name : "campaignCRM", 
			shortName: "CCR",
			caption : "", 
			callType: CATY_BLOG,
			dnis: "SM_Epro",
			entry: "wechat",
			acdGroup: 5,
			showPriority : 1
		});

		serviceList.push({
			name: "campaignCase",
			shortName: "CCA",
			caption: "",
			callType: CATY_INDB,
			dnis: "9000",
			entry: "",
			acdGroup: 1,
			showPriority: 1
		});
		
		serviceList.push({
			name: "campaignCase",
			shortName: "CCA",
			caption: "",
			callType: CATY_VMAIL,
			dnis: "9000",
			entry: "",
			acdGroup: 1,
			showPriority: 1
		});

		serviceList.push({
			name: "campaignCase",
			shortName: "CCA",
			caption: "",
			callType: CATY_VMAIL,
			dnis: "9001",
			entry: "",
			acdGroup: 1,
			showPriority: 2
		});

		serviceList.push({
			name: "campaignCase",
			shortName: "CCA",
			caption: "",
			callType: CATY_INDB,
			dnis: "9002",
			entry: "",
			acdGroup: 2,
			showPriority: 3
		});		
		
		// serviceList.push({
		// 	name : "campaignCase", 
		// 	shortName: "CCA",
		// 	caption : "Case", 
		// 	callType: CATY_VMAIL,
		// 	dnis: "9001",
		// 	acdGroup: 1,
		// 	showPriority : 2
		// });

		serviceList.push({
			name: "campaignCase",
			shortName: "CCA",
			caption: "EPRO",
			callType: CATY_EMAIL,
			dnis: "demo-cpb@eprotel.com.hk",
			entry: "",
			acdGroup: 7,
			showPriority: 2
		});

		serviceList.push({
			name: "campaignCase",
			shortName: "CCA",
			caption: "",
			callType: CATY_BLOG,
			dnis: "SM_Win2016-demoWeChat",
			entry: "wechat",
			acdGroup: 5,
			showPriority: 1
		});

		serviceList.push({
			name: "campaignCase",
			shortName: "CCA",
			caption: "",
			callType: CATY_BLOG,
			dnis: "SM_Win2016-demoFB",
			entry: "fbmsg",
			acdGroup: 4,
			showPriority: 1
		});
		
		serviceList.push({
			name: "campaignCase",
			shortName: "CCA",
			caption: "",
			callType: CATY_BLOG,
			dnis: "SM_Win2016-demoFB_fp",
			entry: "fbpost",
			acdGroup: 9,
			showPriority: 1
		});
		
		serviceList.push({
			name: "campaignCase",
			shortName: "CCA",
			caption: "",
			callType: CATY_BLOG,
			dnis: "SM_WA",
			entry: "whatsapp",
			acdGroup: 8,
			showPriority: 1
		});

		var outboundANI = {};
		outboundANI["campaignCase"] = { call: "36202316", fax: "5702", faxCover: "D:\\FaxShare\\cover.cov", email: "demo-cpb@eprotel.com.hk", sms: "2003", whatsapp: "SM_WA" };
		