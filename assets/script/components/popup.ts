declare var navigator: any;

/**
 * Execute a popup window
 *
 * @param string url The url of the page to popup
 * @param array options
 */
export default function PopupWindow(url: string, title: string, options) {
    const defaults = {
        toolbar: "no",
        location: "no",
        directories: "no",
        status: "no",
        menubar: "no",
        scrollbars: "yes",
        resizable: "yes",
        copyhistory: "no",
    };

    options = options || {};

    for (const name in defaults) {
        if (options[name] === undefined) {
            options[name] = defaults[name];
        }
    }

    const template = [];

    for (const option in options) {
        if (options[option] !== undefined && options[option] !== "") {
            template.push(option + "=" + options[option]);
        }
    }

    if (navigator.standalone || window.matchMedia("(display-mode: standalone)").matches) {
        return window;
    }

    const popup: any = window.open(url, title, template.join(","));

    if (window.focus) {
        try {
            popup.focus();
        } catch (e) {
            // do nothing
        }
    }

    return popup;
}
