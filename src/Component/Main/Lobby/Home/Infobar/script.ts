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
    }
}
