import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {Modal} from "./components/modal";

import "./components";
import "./modules";

import "./game/game-launcher";
import "./loader";
import "./login-redirection";

ComponentManager.init();

Router.init();
Modal.listen(".modal-trigger");
