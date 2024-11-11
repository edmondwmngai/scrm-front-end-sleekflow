// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());
// resize for menu page
function resize() {
    var body = document.body,
        html = document.documentElement;
    var newHeight = Math.ceil((Math.max(body.scrollHeight, body.offsetHeight, html.offsetHeight) + 20)) || 500;
    if (parent && parent.document.getElementById("search")) {
        parent.document.getElementById("search").height = newHeight + 'px'; //將子頁面高度傳到父頁面框架 // no need to add extra space
    }
}