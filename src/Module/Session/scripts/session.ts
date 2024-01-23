import * as utility from "@core/assets/js/components/utility";
import AutoLogout from "@core/assets/js/components/utils/autologout";

import {Console} from "@core/assets/js/components/utils/console";
import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

export class Session {
    private timeout: number;
    private autologout: AutoLogout;

    constructor(timeout: number = 300) {
        this.timeout = timeout;

        this.autologout = new AutoLogout(timeout, {
            onRestart: () => {
                this.onCounterRestart();
            },
            onStop: () => {
                this.onCounterStop();
            },
        });
    }

    init() {
        this.autologout.start();
        this.attachEvents();
    }

    restart() {
        this.autologout.restart();
    }

    stop() {
        this.autologout.kill();
    }

    /**
     * Counter events
     *
     */

    private onCounterRestart() {
        Console.push("Session Module", `Starting session count with ${this.timeout} seconds`);
    }

    private onCounterStop() {
        ComponentManager.broadcast("session.logout");

        Console.push("Session Module", "Session has been terminated");
    }

    /**
     * Listener events
     *
     */

    private attachEvents() {
        utility.ready(() => {
            this.autologout.restart();
        });

        ComponentManager.subscribe("session.login", (event) => {
            this.autologout.restart();
        });

        ComponentManager.subscribe("session.logout", (event) => {
            this.autologout.kill();
        });

        ComponentManager.subscribe("click", (event) => {
            this.autologout.onUserActivity();
        });

        ComponentManager.subscribe("scroll", (event) => {
            this.autologout.onUserActivity();
        });

        ComponentManager.subscribe("keypress", (event) => {
            this.autologout.resonUserActivityet();
        });

        ComponentManager.subscribe("touchstart", (event) => {
            this.autologout.onUserActivity();
        });
    }
}
