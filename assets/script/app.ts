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

// fix for Safari not reloading the page on history back
window.onpageshow = (event) => {
    if (event.persisted) {
        window.location.reload();
    }
};
