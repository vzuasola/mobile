import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as indiaLanguageSelectorTemplate from "../handlebars/india-language-selector.handlebars";

import { ComponentInterface, ComponentManager } from "@plugins/ComponentWidget/asset/component";
import { Router, RouterClass } from "@plugins/ComponentWidget/asset/router";

import { Modal } from "@app/assets/script/components/modal";

/**
 *
 */
export class INLanguageComponent implements ComponentInterface {
    private product: string;
    private element: HTMLElement;
    private attachments: any;
    private languageData: any;

    private country: string;
    private inShowModal: boolean;

    onLoad(element: HTMLElement, attachments: {
        authenticated: boolean,
        currentLanguage: string,
    }) {
        this.element = element;
        this.attachments = attachments;
        this.attachINModalListeners();
        this.listenOnModalClosed();
        ComponentManager.subscribe("session.login", (event, target, data) => {
            this.playerLanguage();
        });
    }

    onReload(element: HTMLElement, attachments: {
        authenticated: boolean,
        currentLanguage: string,
    }) {
        this.element = element;
        this.attachments = attachments;

        if (this.attachments.authenticated && this.country === "IN") {
            this.checkPreference();
            if (this.inShowModal) {
                this.attachINModalListeners();
                this.listenOnModalClosed();
                this.getLanguage();
            }
        }
    }

    private checkPreference() {
        xhr({
            url: Router.generateRoute("in_language", "checkpreference"),
            type: "json",
        }).then((response) => {
            this.inShowModal = false;
            if (response) {
                console.log(response);
                this.inShowModal = response.inModal;
            }
        });
    }

    private playerLanguage() {
        xhr({
            url: Router.generateRoute("in_language", "details"),
            type: "json",
        }).then((response) => {
            this.country = "";
            if (response.language && response.country === "IN") {
                this.country = response.country;
                // Replacing the current language to the language selected by user from the Langauge Selector.
                const currentLanguage = ComponentManager.getAttribute("language");
                const hostname = window.location.hostname;
                const regexp = new RegExp(hostname + "\/" + currentLanguage + "(\/?.*)$", "i");
                const redirectionUrl = window.location
                    .href
                    .replace(regexp, hostname + "/" + response.language + "$1");
                Router.navigate(
                    redirectionUrl,
                    ["*"],
                    {
                        language: response.language,
                    },
                );
            }
        });
    }

    private getLanguage() {
        xhr({
            url: Router.generateRoute("in_language", "language"),
            type: "json",
        }).then((response) => {
            this.languageData = response;
            this.processLanguage();
        });
    }

    private processLanguage() {
        this.generateLanguageMarkup(this.languageData);
        Modal.open("#india-language-lightbox");
        this.savePreference(null);
        ComponentManager.broadcast("INLanguage.modal.open");
    }

    private attachINModalListeners() {
        const wrapper = this.element.querySelector("#india-language-lightbox");

        if (wrapper) {
            utility.listen(wrapper, "click", (event, src) => {
                if (utility.hasClass(src, "in-language-link")) {
                    event.preventDefault();
                    const lang = src.getAttribute("data-lang");
                    xhr({
                        url: Router.generateRoute("in_language", "update"),
                        method: "post",
                        data: {
                            language: lang,
                        },
                        type: "json",
                    }).then((response) => {
                        if (response.status === "success") {
                            ComponentManager.broadcast("INLanguage.modal.submit", { data: src });
                            this.savePreference(src);
                            Modal.close("#india-language-lightbox");
                        }
                    });
                }
            });
        }
    }

    private listenOnModalClosed() {
        ComponentManager.subscribe("modal.closed", (event, src, data) => {
            if (data.selector === "#india-language-lightbox") {
                this.savePreference(null);
                ComponentManager.broadcast("INLanguage.modal.close");
            }
        });
    }

    private savePreference(src) {
        xhr({
            url: Router.generateRoute("in_language", "preference"),
            method: "post",
            type: "json",
        }).then((response) => {
            if (response.status === "success" && src) {
                const selectedLang = src.getAttribute("data-lang-prefix");
                const currentLanguage = ComponentManager.getAttribute("language");
                const hostname = window.location.hostname;
                const regexp = new RegExp(hostname + "\/" + currentLanguage + "(\/?.*)$", "i");
                const redirectionUrl = window.location
                    .href
                    .replace(regexp, hostname + "/" + selectedLang + "$1");
                if (currentLanguage !== selectedLang) {
                    Router.navigate(
                        redirectionUrl,
                        ["*"],
                        {
                            language: selectedLang,
                        },
                    );
                }
            }
        });
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
            languageSVG: data.mobile_language_svg_class,
            langData: data.langData,
        });

        language.innerHTML = template;
    }
}
