import {Router} from "@plugins/ComponentWidget/asset/router";
import {Modal} from "./components/modal";

import "./components";
import "./loader";

Router.init();
Modal.listen(".modal-trigger");
