var customCompany = config.customCompany || "";

function openLink(type) {
    var popup;
    var params = [
        'height=' + screen.height,
        'width=' + screen.width,
        'fullscreen=yes' // only works in IE, but here for completeness
    ].join(',');
    var queryStr =  customCompany.length > 0? '?custom=' + customCompany : '';
    popup = window.open('./login.html' + queryStr, 'full', params);
    popup.moveTo(0, 0);
}