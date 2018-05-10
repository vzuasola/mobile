import {Router} from "@plugins/ComponentWidget/asset/router";
import {Modal} from "./components/modal";

import "./components";
import "./game/game-launcher";
import "./loader";
import "./login-redirection";

Router.init();
Modal.listen(".modal-trigger");
