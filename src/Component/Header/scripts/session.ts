import * as utility from '@core/assets/js/components/utility';

import Counter from '@core/assets/js/components/utils/counter';

export class Session
{
    private timeout: number;
    private counter: Counter;

    constructor(timeout: number = 300) {
        this.timeout = timeout;

        this.counter = new Counter(timeout, {
            onRestart: this.onCounterRestart,
            onStop: this.onCounterStop,
            onCount: this.onCounterCount,
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
        console.log('Counter Reset');
    }

    private onCounterStop() {
        console.log('Counter Stop');
        utility.invoke(document, 'session.logout');
    }

    private onCounterCount(counter: Counter, time: number) {
        //console.log(`Session Count is ${time}`);
    }

    /**
     * Listener events
     *
     */

    private attachEvents() {
        utility.ready(() => {
            console.log('Session Init');
            this.counter.restart();
        });

        utility.listen(document, 'session.login', event => {
            console.log('Restarting Session');
            this.counter.restart();
        });

        utility.listen(document, 'session.logout', event => {
            console.log('Killing Session');
            this.counter.kill();
        });

        utility.listen(document, 'click', event => {
            this.counter.reset();
        });

        utility.listen(document, 'scroll', event => {
            this.counter.reset();
        });

        utility.listen(document, 'keypress', event => {
            this.counter.reset();
        });

        utility.listen(document, 'touchstart', event => {
            this.counter.reset();
        });
    }
}
