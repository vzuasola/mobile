import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as indiaLanguageSelectorTemplate from "../handlebars/india-language-selector.handlebars";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

import {Modal} from "@app/assets/script/components/modal";

/**
 *
 */
export class INLanguageComponent implements ComponentInterface {
    private product: string;
    private element: HTMLElement;
    private attachments: any;
    private languageData: any;

    onLoad(element: HTMLElement, attachments: {
        authenticated: boolean,
        currentLanguage: string,
    }) {
        this.element = element;
        this.attachments = attachments;
        this.getLanguage();

        Router.on(RouterClass.afterNavigate, (event) => {
            this.refreshLanguage();
        });

        ComponentManager.subscribe("session.login", (event, target, data) => {
            this.processLanguage();
        });

        ComponentManager.subscribe("session.logout", (event, target, data) => {
            this.processLanguage();
        });
    }

    onReload(element: HTMLElement, attachments: {currentLanguage: string}) {
        this.element = element;
        this.attachments = attachments;
        this.getLanguage();
    }

    private generateLanguageUrl(element, currentLanguage) {
        const wrapper = element.querySelector("#india-language-lightbox");

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

                    Modal.close("#india-language-lightbox");
                    ComponentManager.broadcast("language.change");
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
                Modal.open("#india-language-lightbox");
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

    private getLanguage() {
        xhr({
            url: Router.generateRoute("language", "language"),
            type: "json",
        }).then((response) => {
            this.languageData = response;
            this.processLanguage();
        });
    }

    private processLanguage() {
        this.generateLanguageMarkup(this.languageData);
        this.product = ComponentManager.getAttribute("product");
    }

    /**
     * Set the language in the template
     *
     */
    private generateLanguageMarkup(data) {
        const language: HTMLElement = this.element.querySelector("#language");

        const template = indiaLanguageSelectorTemplate({
            languageIndiaTitle: data.mobile_india_language_select,
            languageIndiaDescription: data.mobile_india_language_description,
        });

        language.innerHTML = template;
    }
}
