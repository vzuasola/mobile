import * as utility from "@core/assets/js/components/utility";
import DateTimeTimeout from "@core/assets/js/components/utils/dateTimeTimeout";

import {Console} from "@core/assets/js/components/utils/console";
import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

export class Session {
    private timeout: number;
    private counter: DateTimeTimeout;

    constructor(timeout: number = 300) {
        this.timeout = timeout;

        this.counter = new DateTimeTimeout(timeout, {
            onCount: (counter: DateTimeTimeout, timeoutDate: Date) => {
                this.onCounterCount(counter, timeoutDate);
            },
            onRestart: () => {
                this.onCounterRestart();
            },
            onStop: () => {
                this.onCounterStop();
            },
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
        Console.push("Session Module", `Starting session count with ${this.timeout} seconds`);
    }

    private onCounterStop() {
        ComponentManager.broadcast("session.logout");

        Console.push("Session Module", "Session has been terminated");
    }

    private onCounterCount(counter: DateTimeTimeout, timeoutDate: Date) {
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
