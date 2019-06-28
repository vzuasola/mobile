import "../sass/app.scss";

import * as versioning from "@app/web/version.json";
import {Semver} from "./components/semver";

const version = versioning.version;

import "promise-polyfill/src/polyfill";
import "es6-shim";
import "pwacompat";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

import {Modal} from "./components/modal";

import "./components";
import "./modules";
import "./loader";
import "./worker-registration";
import "./notify";

// whenever the bootstrap AJAX receives a redirect, follow it
ComponentManager.setOption("module-response-handle-redirect", (request: XMLHttpRequest) => {
    window.location.href = request.responseURL;
});

// check if we are receiving the maintenance or resitricted page so we can
// redirect to it
ComponentManager.setOption("module-response-handle-error", (request: XMLHttpRequest) => {
    const page = request.getResponseHeader("x-page-error-type");

    if (page === "maintenance") {
        window.location.replace("/maintenance");
    } else if (page === "restricted") {
        window.location.replace("/restricted");
    }

    // handle additional error scenario here
});

ComponentManager.subscribe(RouterClass.navigateError, (event, src, data) => {
    let page: string;

    if (data.response.request) {
        page = data.response.request.getResponseHeader("x-page-error-type");
    }

    if (page === "maintenance") {
        window.location.replace("/maintenance");
    } else if (page === "restricted") {
        window.location.replace("/restricted");
    }
});

Router.setOption(
    "main-components",
    ["header", "main", "menu", "footer", "language",
    "push_notification", "marketing", "seo", "announcement", "cookie_notification"],
);

ComponentManager.init();
Router.init();

Modal.listen(".modal-trigger");

// fix for Safari and Android not reloading the page on history back
window.onpageshow = (event) => {
    if (event.persisted) {
        window.location.reload();
    }
};
