export default function GraphyteLib() {
    window.graphyte || (window.graphyte = {}), window.graphyte_queue || (window.graphyte_queue = []);
    function init() {
        for (var e = ['identify', 'track', 'trackLink', 'trackForm', 'trackClick', 'trackSubmit', 'page', 'pageview', 'ab', 'alias', 'ready', 'group', 'on', 'once', 'off'], t = function (t) {
                return function () {
                    var e = Array.prototype.slice.call(arguments);
                    return e.unshift(t), graphyte_queue.push(e), window.graphyte;
                };
            }, a = 0; a < e.length; a++) {
            var r = e[a];
            window.graphyte[r] = t(r);
        }
    }
    init();
    graphyte.load = function (t) {
        var e = document.createElement('script');
        e.async = !0;
        e.type = 'text/javascript';
        e.src = 'https://cdn.graphyte.ai/graphyte.min.js';
        e.addEventListener ? e.addEventListener('load', function (e) {
            'function' === typeof t && t(e);
        }, !1) : e.onreadystatechange = function () {
            'complete' !== this.readyState && 'loaded' !== this.readyState || t(window.event);
        };
        var a = document.getElementsByTagName('script')[0];
        a.parentNode.insertBefore(e, a);
    };
    graphyte.load(function () {
        for (graphyte.initialize({
            graphyte: {
                apiKey: 'ircxWvKXuh83czTrS9vKN4i25Xjs4rAv4eJ2NfR1',
                brandKey: '11bbf446-bfda-483c-b09a-73788c57cbea'
            }
        }); 0 < window.graphyte_queue.length;) {
            var e = window.graphyte_queue.shift(), t = e.shift();
            graphyte[t] && graphyte[t].apply(graphyte, e);
        }
    });
}
