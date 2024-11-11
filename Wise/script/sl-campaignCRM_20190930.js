		var serviceList = [];

		serviceList.push({
			name: "campaignCRM",
			shortName: "CCR",
			caption: "",
			callType: CATY_WEBCHAT,
			dnis: "SM_Win2016-demoWebChat",
			acdGroup: 1,
			showPriority: 1
		});
		
		serviceList.push({
			name : "campaignCRM", 
			shortName: "CCR",
			caption : "", 
			callType: CATY_BLOG,
			dnis: "SM_Epro",
			acdGroup: 5,
			showPriority : 1
		});

		serviceList.push({
			name: "campaignCRM",
			shortName: "CCR",
			caption: "",
			callType: CATY_INDB,
			dnis: "9000",
			acdGroup: 1,
			showPriority: 1
		});

		serviceList.push({
			name: "campaignCRM",
			shortName: "CCR",
			caption: "",
			callType: CATY_VMAIL,
			dnis: "9001",
			acdGroup: 1,
			showPriority: 2
		});

		serviceList.push({
			name: "campaignCRM",
			shortName: "CCR",
			caption: "",
			callType: CATY_EMAIL,
			dnis: "demo-cpb@eprotel.com.hk",
			acdGroup: 1,
			showPriority: 2
		});

		serviceList.push({
			name: "campaignCRM",
			shortName: "CCR",
			caption: "",
			callType: CATY_BLOG,
			dnis: "SM_Win2016-demoWeChat",
			acdGroup: 5,
			showPriority: 1
		});

		serviceList.push({
			name: "campaignCRM",
			shortName: "CCR",
			caption: "",
			callType: CATY_BLOG,
			dnis: "SM_Win2016-demoFB",
			acdGroup: 4,
			showPriority: 1
		});

		var outboundANI = {};
		outboundANI["campaignCRM"] = { call: "36202316", fax: "5702", faxCover: "D:\\FaxShare\\cover.cov", email: "demo-cpb@eprotel.com.hk", sms: "2003" };