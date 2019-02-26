import * as Bowser from "bowser";

const browser = Bowser.getParser(window.navigator.userAgent);

const browserInfo = browser.getBrowser();

const isSupported = browser.satisfies({
    "chrome": ">=20",
    "android browser": ">=3.10",
    "samsung internet for android": ">=5.2",
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
