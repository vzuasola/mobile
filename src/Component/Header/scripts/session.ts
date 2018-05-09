import * as utility from "@core/assets/js/components/utility";

import Counter from "@core/assets/js/components/utils/counter";
import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

export class Session {
    private timeout: number;
    private counter: Counter;

    constructor(timeout: number = 300) {
        this.timeout = timeout;

        this.counter = new Counter(timeout, {
            onCount: this.onCounterCount,
            onRestart: this.onCounterRestart,
            onStop: this.onCounterStop,
        });
    }

    init() {
        this.counter.start();
        this.attachEvents();
    }

    restart() {
        this.counter.restart();
    }

    stop() {
        this.counter.kill();
    }

    /**
     * Counter events
     *
     */

    private onCounterRestart() {
        // placeholder for logs
    }

    private onCounterStop() {
        ComponentManager.broadcast("session.logout");
    }

    private onCounterCount(counter: Counter, time: number) {
        // placeholder for logs
    }

    /**
     * Listener events
     *
     */

    private attachEvents() {
        utility.ready(() => {
            this.counter.restart();
        });

        ComponentManager.subscribe("session.login", (event) => {
            this.counter.restart();
        });

        ComponentManager.subscribe("session.logout", (event) => {
            this.counter.kill();
        });

        ComponentManager.subscribe("click", (event) => {
            this.counter.reset();
        });

        ComponentManager.subscribe("scroll", (event) => {
            this.counter.reset();
        });

        ComponentManager.subscribe("keypress", (event) => {
            this.counter.reset();
        });

        ComponentManager.subscribe("touchstart", (event) => {
            this.counter.reset();
        });
    }
}
