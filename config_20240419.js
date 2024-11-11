var config = {
    telPrefix: "",
    wiseHost: "http://172.17.7.40",
    mvcHost: "http://172.17.7.40",
    mvcUrl: "http://172.17.7.40/mvc",
    isDemo: true, // @ Demo HKTB is demo
    customCompany: "campaignCRM",
    restorable: false,
    caseCoArr: ['campaignCase'],
    isLdap: false,
    isEmma: true,
    isHttps: false,
	// noRingStatuses: ["BREAK", "WORKING"], // optional
	defaultTabAfterLogin: 'menu-search-customer', // optional, need to be lower case. for 'menu' can add hyphen(-) and the sub category, e.g. 'menu-incomplete-cases'
	statusStyle: {"LOGIN":"#6c757d","IDLE":"#FF2735","TALK":"#4caf50","HOLD":"rgb(201, 203, 207)","READY":"rgb(54 102 189)","WORKING":"rgba(21, 193, 231, 0.9)","BREAK":"#AB4A0E","MONITOR":"rgb(153, 102, 255)"}, // optional
    // designatedServiceId <= this is for Tai Ping voice log search only for now
	caseDefaultSearch:  ['Case_No', 'Call_Nature', 'Status', 'Details', 'Name_Eng', 'All_Phone_No'], // optional
    customerDefaultSearch:  [ 'Customer_Id', 'Name_Eng', 'All_Phone_No', 'Email'] // optional
}