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
        // handle redirects if we are on a PWA standalone
        if (navigator.standalone || window.matchMedia("(display-mode: standalone)").matches) {
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
