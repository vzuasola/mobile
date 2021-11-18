import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as infobarTemplate from "./handlebars/infobar.handlebars";
import { Router } from "@core/src/Plugins/ComponentWidget/asset/router";

import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class InfobarComponent implements ComponentInterface {
    private element: HTMLElement;
    private InfobarData: any;
    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.activateMarquee();
        this.listenInfobarTouch();
        this.listenChangeOrientation();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.activateMarquee();
        this.listenInfobarTouch();
        this.listenChangeOrientation();
    }

    private activateMarquee() {
        const infoBarEl: HTMLElement = this.element.querySelector(".infobar-marquee-content li");
        if (infoBarEl) {
            const infoBarContainer: HTMLElement = this.element.querySelector(".infobar");
            const infoBarItemsWidth = infoBarEl.offsetWidth;
            const infoBar = infoBarContainer.offsetWidth;
            const percentWidth = infoBar * 0.75;

            if (infoBarItemsWidth > percentWidth) {
                infoBarEl.style.animation = "marquee linear infinite forwards";
                infoBarEl.style.animationDuration = this.calculateSpeed(percentWidth, infoBarItemsWidth) + "s";
            }
        }
    }

    private calculateSpeed(percentWidth, infoBarItemsWidth) {
        const minWidth = 360;
        const timeMultiplier = Math.ceil((window.screen.width / minWidth) * 5);
        return infoBarItemsWidth / percentWidth * timeMultiplier;
    }

    private listenChangeOrientation() {
        window.addEventListener("resize", () => {
            this.activateMarquee();
        });
    }

    private listenInfobarTouch() {
        ComponentManager.subscribe(utility.eventType(), (event, src, data) => {
            const infoBarEl: HTMLElement = this.element.querySelector(".infobar-marquee-content li");
            if (infoBarEl) {
                if (infoBarEl.style.animationPlayState === "running") {
                    infoBarEl.style.animationPlayState = "paused";
                } else {
                    infoBarEl.style.animationPlayState = "running";
                }
            }
        });
    }
}
