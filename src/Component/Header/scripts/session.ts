import * as utility from "@core/assets/js/components/utility";

import Counter from "@core/assets/js/components/utils/counter";

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
        utility.invoke(document, "session.logout");
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

        utility.listen(document, "session.login", (event) => {
            this.counter.restart();
        });

        utility.listen(document, "session.logout", (event) => {
            this.counter.kill();
        });

        utility.listen(document, "click", (event) => {
            this.counter.reset();
        });

        utility.listen(document, "scroll", (event) => {
            this.counter.reset();
        });

        utility.listen(document, "keypress", (event) => {
            this.counter.reset();
        });

        utility.listen(document, "touchstart", (event) => {
            this.counter.reset();
        });
    }
}
