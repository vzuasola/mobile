import * as utility from "@core/assets/js/components/utility";

import Accordion from "@app/assets/script/components/accordion";

import EqualHeight from "@app/assets/script/components/equal-height";
import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class NodeComponent implements ComponentInterface {
    private element: HTMLElement;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.equalizeStickyHeight();
        this.accordion(element);
        this.parseOptin(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.equalizeStickyHeight();
        this.accordion(element);
    }

    private equalizeStickyHeight() {
        const equalSticky = new EqualHeight(".sticky-box");
        equalSticky.init();
    }

    private accordion(element) {
        const accordion = new Accordion(element, { openByDefault: 0 });
    }

    private parseOptin(main) {
        const regex = new RegExp(/\{webform:([^}]+)\}/g);
        main.innerHTML.replace(regex, (match, id) => {
            main.innerHTML = this.buildIframe(main, id);
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

    private buildIframe(main, id) {
        const src = window.location.origin + "/opt-in/" + id;
        const iframe = "<iframe src='" + src + "' class='optin-form' scrolling='no'></iframe>";

        return main.innerHTML.replace("{webform:" + id + "}", iframe);
    }

    private setDimensions(iframe, form) {
        const height = form.clientHeight;
        const width = form.clientWidth;

        iframe.setAttribute("height", height);
        iframe.setAttribute("width", width);
    }
}
