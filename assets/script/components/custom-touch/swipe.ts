import * as utility from "@core/assets/js/components/utility";

export default class Swipe {
    private initialLocation;
    private inProgress;
    private startTime;
    private swipeLeftEvent;
    private swipeRightEvent;

    constructor(private element) {
        // firefox and webkit-based browsers
        utility.addEventListener(this.element, "touchstart", e => {
            this.start(e);
        });

        utility.addEventListener(this.element, "touchmove", e => {
            this.move(e);
        });

        utility.addEventListener(this.element, "touchend", e => {
            this.end(e);
        });

        // Support for pointer events
        if (window.navigator.msPointerEnabled) {
            utility.addEventListener(this.element, "MSPointerDown", e => {
                this.start(e);
            });

            utility.addEventListener(this.element, "MSPointerMove", e => {
                this.move(e);
            });

            utility.addEventListener(this.element, "MSPointerUp", e => {
                this.end(e);
            });
        } else {
            // Browsers that support mouse events
            utility.addEventListener(this.element, "mousedown", e => {
                this.start(e);
            });

            utility.addEventListener(this.element, "mousemove", e => {
                this.move(e);
            });

            utility.addEventListener(this.element, "mouseup", e => {
                this.end(e);
            });
        }

        this.swipeLeftEvent = new CustomEvent("swipeleft");
        this.swipeRightEvent = new CustomEvent("swiperight");
    }

    private start(e) {
        // Get initial coordinate position
        this.initialLocation = this.getPosition(e);

        this.inProgress = true;
        this.startTime = new Date();
    }

    private move(e) {
        if (!this.inProgress) {
            return false;
        }

        const currentLocation = this.getPosition(e);
        const verticalDelta = Math.abs(currentLocation.y - this.initialLocation.y);

        if (verticalDelta > 50) {
            this.inProgress = false;
        }
    }

    private end(e) {
        const timeDelta = new Date().getTime() - this.startTime.getTime();

        if (timeDelta > 700) {
         return;
        }

        if (!this.inProgress) {
            return;
        }

        const currentLocation = this.getPosition(e);
        const delta = Math.abs(currentLocation.x - this.initialLocation.x);

        if (delta < 100) {
            return;
        }

        if (currentLocation.x > this.initialLocation.x) {
            // If you end to the right of where you started, you swipe right.
            this.element.dispatchEvent(this.swipeRightEvent, e);
        } else if (currentLocation.x < this.initialLocation.x) {
            // If you end to the left of where you started, you swipe left.
            this.element.dispatchEvent(this.swipeLeftEvent, e);
        }
    }

    private getPosition(e) {
        let pageX;
        let pageY;

        if (e.touches) {
            // If this is a touch event
            pageX = e.changedTouches[0].pageX;
            pageY = e.changedTouches[0].pageY;
        } else {
            // If this is a mouse or pointer event
            pageX = e.pageX;
            pageY = e.pageY;
        }

        return {
            y: pageY,
            x: pageX,
        };
    }
}
