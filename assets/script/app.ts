import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {Modal} from "./components/modal";

import "./components";
import "./modules";

import "./loader";

ComponentManager.init();

Router.setOption("no-trailing-slashes", true);
Router.init();

Modal.listen(".modal-trigger");
