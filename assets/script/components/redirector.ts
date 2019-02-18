declare var navigator: any;

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
        if (!iOSSafari && navigator.standalone || window.matchMedia("(display-mode: standalone)").matches) {
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
