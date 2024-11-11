var wmConfig = {
    topSuprvisorLv: 3, // in wise, 4 is top level - Manager, 3 is Supervisor. If set 3, level 3 and 4 both can set supervisor controable ACD, and so on
    wbWallIntMiliSec: 300000, //5 mins
    wmWallIntMiliSec: 300000, //5 mins
    wsDefaultWallAcd: 'Cantonese', // Optional: default WiseMon ACD
    // hvVoiceLogFn: true, // Deprecated
    showMapChart: true,
    hvSocial: true,
    splitASTbl: false,
    wbArr: [{
        isSocial: false,
        serviceId: 1,
        acdId: 1,
        acdName: 'Cantonese'
    },{
        isSocial: true,
        serviceId: 1,
        acdId: 6,
        acdName: 'WebChat'
    }],
    fpBgDfWidth: 500,
    fpBgDfHeight: 500,
    fpPcDfSize: 50,
    fpFontDf: 15
}