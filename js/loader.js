// Dynamically load jQuery
(function() {
    var script = document.createElement('script');
    script.src = 'https://code.jquery.com/jquery-3.7.1.min.js'; // your jQuery path
    script.type = 'text/javascript';
    script.onload = function() {
        console.log('jQuery loaded successfully.');
    };
    document.head.appendChild(script);
})();