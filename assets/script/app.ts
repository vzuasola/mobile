import "promise-polyfill/src/polyfill";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {Modal} from "./components/modal";

import "./components";
import "./modules";
import "./loader";

ComponentManager.init();

Router.init();

Modal.listen(".modal-trigger");

// fix for Safari and Android not reloading the page on history back
window.onpageshow = (event) => {
    const isTraversal = event.persisted;
    const isBack = typeof window.performance !== "undefined" && window.performance.navigation.type === 2;

    if (isTraversal && isBack) {
        window.location.reload();
    }
};
