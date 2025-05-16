// prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());
// resize for menu page
function resize() {
    var body = document.body,
        html = document.documentElement;
    var newHeight = Math.ceil((Math.max(body.scrollHeight, body.offsetHeight, html.offsetHeight) + 20)) || 500;
    //if (parent && parent.document.getElementById("search")) {				//20250516 Prefer using an optional chain expression instead, as it's more concise and easier to read.
    //    parent.document.getElementById("search").height = newHeight + 'px'; //將子頁面高度傳到父頁面框架 // no need to add extra space
    //}
	parent?.document?.getElementById("search")?.height = newHeight + 'px';

}