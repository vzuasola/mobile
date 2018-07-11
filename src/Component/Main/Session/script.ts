import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import * as block from "./handlebars/block.handlebars";

import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

/**
 *
 */
export class SessionComponent implements ComponentInterface {
    private element: HTMLElement;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.init();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.init();
    }

    private init() {
        xhr({
            url: Router.generateRoute("session", "init"),
            type: "json",
        }).then((response) => {
            if (response.status) {
                this.doSessionProcess(this.element, () => {
                    xhr({
                        url: Router.generateRoute("session", "cleanup"),
                        type: "json",
                    }).then(() => {
                        // do nothing
                    });
                });
            }
        });
    }

    private doSessionProcess(element, fn) {
        for (let i = 1; i <= 3; i++) {
            xhr({
                url: Router.generateRoute("session", "process"),
                type: "json",
            }).then((response) => {
                if (response.status) {
                    const div = document.createElement("div");
                    div.innerHTML = block({ count: i });

                    element.querySelector(".session-wrapper")
                        .querySelector("ul")
                        .appendChild(div.firstChild);
                }

                if (i === 3) {
                    fn();
                }
            });
        }
    }
}
