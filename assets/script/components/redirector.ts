declare var navigator: any;

import * as utility from "@core/assets/js/components/utility";

/**
 *
 */
class Redirector {
    /**
     * Redirect to a URL with fallback options
     *
     * @param url The URL to redirect to
     * @param closure A optional handler callback
     */
    redirect(url: string, closure?) {
        // Safari
        const iOSSafari = /iP(ad|od|hone)/i.test(window.navigator.userAgent) &&
        /WebKit/i.test(window.navigator.userAgent) &&
        !(/(CriOS|FxiOS|OPiOS|mercury)/i.test(window.navigator.userAgent));

        // handle redirects if we are on a PWA standalone
        if (!iOSSafari && (navigator.standalone || window.matchMedia("(display-mode: standalone)").matches)) {
            url = utility.addQueryParam(url, "source", "pwa");

            // Check if re is in the parameters and add source=pwa to re param
            let reUrl = utility.getParameterByName("re", url);
            if (reUrl) {
                url = utility.removeQueryParam(url, "re");
                reUrl = utility.addQueryParam(reUrl, "source", "pwa");
                url = utility.addQueryParam(url, "re", reUrl);
            }

            window.open(url);

            if (closure) {
                closure();
            }

            return;
        }

        window.location.href = url;
    }
}

const redirector = new Redirector();

export { redirector as Redirector };
