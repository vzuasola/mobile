import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {GameInterface} from "./../scripts/game.interface";

export class VoidbridgeModule implements ModuleInterface, GameInterface {
    onLoad(attachments) {
        // this.isSessionAlive = attachments.authenticated;
        // this.iapiconfOverride = attachments.iapiconfOverride;
        // this.lang = attachments.lang;
        // this.languageMap = attachments.langguageMap;
        // this.iapiConfs = attachments.iapiConfigs;
    }

    init() {
        console.log("Voidbridge Init");
    }

    login(username, password) {
        // not implemented
    }

    prelaunch() {
        // not implemented
    }

    launch(options) {
        console.log(options);
    }

    logout() {
        // not implemented
    }
}
