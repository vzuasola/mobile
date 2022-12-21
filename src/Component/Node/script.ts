import * as utility from "@core/assets/js/components/utility";

import Accordion from "@app/assets/script/components/accordion";

import EqualHeight from "@app/assets/script/components/equal-height";
import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class NodeComponent implements ComponentInterface {
    private element: HTMLElement;

    onLoad(element: HTMLElement, attachments: {faqdomain: string}) {
        this.element = element;
        this.equalizeStickyHeight();
        this.accordion(element);
        this.parseOptin(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {faqdomain: string}) {
        this.equalizeStickyHeight();
        this.accordion(element);
        this.parseOptin(element, attachments);
    }

    private equalizeStickyHeight() {
        const equalSticky = new EqualHeight(".sticky-box");
        equalSticky.init();
    }

    private accordion(element) {
        const accordion = new Accordion(element, { openByDefault: 0 });
    }

    private parseOptin(main, attachments) {
        const regex = new RegExp(/\{webformfaq:([^}]+)\}/g);
        main.innerHTML.replace(regex, (match, id) => {
            main.innerHTML = this.buildIframe(main, id, attachments);
        });

        const iframes = main.querySelectorAll("[class^='optin-form']");
        if (iframes) {
            utility.forEach(iframes, (iframe) => {
                iframe.onload = () => {
                    const form = iframe.contentWindow.document.querySelector(".form-optin");
                    this.setDimensions(iframe, form);

                    utility.listen(form, "reset", () => {
                        this.setDimensions(iframe, form);
                    });
                };
            });
        }
    }

    private buildIframe(main, id, attachments) {
        const src = attachments.faqdomain + "/opt-in/" + id;
        const iframe = "<iframe src='" + src + "' class='optin-form'></iframe>";

        return main.innerHTML.replace("{webformfaq:" + id + "}", iframe);
    }

    private setDimensions(iframe, form) {
        const height = form.clientHeight;
        const width = form.clientWidth;

        iframe.setAttribute("height", height);
        iframe.setAttribute("width", width);
    }
}
