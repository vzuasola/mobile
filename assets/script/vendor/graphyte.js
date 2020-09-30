export default function GraphyteLib(settings) {
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

    graphyte.load = function (run) {
        const scriptAttachment = document.createElement("script");
        scriptAttachment.setAttribute("src", settings.asset || 'https://cdn.graphyte.ai/graphyte-apac.min.js');
        scriptAttachment.async = true;
        scriptAttachment.type = 'text/javascript';
        if (scriptAttachment.addEventListener) {
            scriptAttachment.addEventListener('load', function (e) {
                'function' === typeof run && run(e);
            });
        } else {
            scriptAttachment.onreadystatechange = function () {
                'complete' !== this.readyState && 'loaded' !== this.readyState || run(window.event);
            };
        }
        document.body.appendChild(scriptAttachment);
    };

    graphyte.load(function () {
        for (graphyte.initialize({
            graphyte: {
                apiKey: settings.apiKey || 'DaxFZkNNmk9V9ZuxabrPbHnQMezOqV23forASSta',
                brandKey: settings.brandKey || 'b1b2cf32-31f8-4b68-8ee6-90399f9eeab0',
            }
        }); 0 < window.graphyte_queue.length;) {
            var e = window.graphyte_queue.shift(), t = e.shift();
            graphyte[t] && graphyte[t].apply(graphyte, e);
        }
    });
}
