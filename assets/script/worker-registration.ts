import * as Bowser from "bowser";

const browser = Bowser.getParser(window.navigator.userAgent);

const isSupported = browser.satisfies({
    chrome: ">=20",
    safari: ">=11.1",
});

if (isSupported) {
    // Service worker registraton
    if ("serviceWorker" in window.navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("/sw.js");
        });
    }
} else {
    const manifest = document.querySelector("link[rel='manifest']");

    manifest.remove();
}
