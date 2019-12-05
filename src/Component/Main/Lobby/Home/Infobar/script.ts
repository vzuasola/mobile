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
        this.getInfobar();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getInfobar();
    }

    private getInfobar() {
        xhr({
            url: Router.generateRoute("home_infobar", "infobar"),
            type: "json",
        }).then((response) => {
            this.InfobarData = response;
            this.generateInfobarMarkup(this.InfobarData);
        });
    }

    private activateMarquee() {
        const infoBarEl: HTMLElement = this.element.querySelector(".infobar-marquee-content li");
        const infoBarContainer: HTMLElement = this.element.querySelector(".infobar");
        const infoBarItemsWidth = infoBarEl.offsetWidth;
        const infoBar = infoBarContainer.offsetWidth;
        const percentWidth = infoBar * 0.75;

        if (infoBarItemsWidth > percentWidth) {
            infoBarEl.style.animation = "marquee linear infinite forwards";
            infoBarEl.style.animationDuration = this.calculateSpeed(percentWidth, infoBarItemsWidth) + "s";

        }
    }

    private calculateSpeed(percentWidth, infoBarItemsWidth) {
        const speed = infoBarItemsWidth / percentWidth * 5;
        return speed;
    }

    private listenInfobarTouch() {
        ComponentManager.subscribe(utility.eventType(), (event, src, data) => {
            console.log(event);
            const infoBarEl: HTMLElement = this.element.querySelector(".infobar-marquee-content li");
            if (infoBarEl.style.animationPlayState === "running") {
                infoBarEl.style.animationPlayState = "paused";
            } else {
                infoBarEl.style.animationPlayState = "running";
            }
        });
    }

    /**
     * Set the infobar in the template
     *
     */
    private generateInfobarMarkup(data) {
        const translation = {
            en: "News",
            eu: "News",
            sc: "公告",
            ch: "公告",
            th: "ข่าว",
            vn: "",
            id: "info",
            jp: "News",
            kr: "공지",
            in: "News",
            gr: "News",
            pl: "News",
            es: "News",
            pt: "News",
        };

        const language = ComponentManager.getAttribute("language");
        const Infobar: HTMLElement = this.element.querySelector("#home-infobar");
        const template = infobarTemplate({
            InfobarData: data,
            newsInfobarText: translation[language],
        });

        Infobar.innerHTML = template;
        this.activateMarquee();
        this.listenInfobarTouch();
    }
}
