import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

import {Modal} from "@app/assets/script/components/modal";

/**
 *
 */
export class LanguageComponent implements ComponentInterface {
    private product: string;

    onLoad(element: HTMLElement, attachments: {currentLanguage: string}) {
        this.product = ComponentManager.getAttribute("product");
        this.generateLanguageUrl(element, attachments.currentLanguage);
        this.bindLanguageLightbox();

        Router.on(RouterClass.afterNavigate, (event) => {
            this.refreshLanguage();
        });
    }

    onReload(element: HTMLElement, attachments: {currentLanguage: string}) {
        this.generateLanguageUrl(element, attachments.currentLanguage);
    }

    private generateLanguageUrl(element, currentLanguage) {
        const wrapper = element.querySelector("#language-lightbox");

        if (wrapper) {
            utility.listen(wrapper, "click", (event, src) => {
                if (utility.hasClass(src, "language-link")) {
                    event.preventDefault();

                    // Replacing the current language to the language selected by user from the Langauge Selector.
                    const selectedLang = src.getAttribute("data-lang");
                    const hostname = window.location.hostname;
                    const regexp = new RegExp(hostname + "\/" + currentLanguage + "(\/?.*)$", "i");
                    const redirectionUrl = window.location
                        .href
                        .replace(regexp, hostname + "/" + selectedLang + "$1");

                    Modal.close("#language-lightbox");

                    Router.navigate(
                        redirectionUrl,
                        ["*"],
                        {
                            language: selectedLang,
                        },
                    );
                }
            });
        }
    }

    private bindLanguageLightbox() {
        ComponentManager.subscribe("click", (event, src) => {
            if (src && utility.hasClass(src, "language-trigger", true)) {
                event.preventDefault();
                Modal.open("#language-lightbox");
            }
        });
    }

    private refreshLanguage() {
        const product = ComponentManager.getAttribute("product");
        if (this.product !== product) {
            this.product = product;
            ComponentManager.refreshComponent("language");
        }
    }
}
