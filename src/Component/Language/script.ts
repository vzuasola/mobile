import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as languageTemplate from "./handlebars/language.handlebars";

import { ComponentInterface, ComponentManager } from "@plugins/ComponentWidget/asset/component";
import { Router, RouterClass } from "@plugins/ComponentWidget/asset/router";

import { Modal } from "@app/assets/script/components/modal";

/**
 *
 */
export class LanguageComponent implements ComponentInterface {
    private isLogin: boolean;
    private matrix: boolean;
    private product: string;
    private element: HTMLElement;
    private attachments: any;
    private languageData: any;

    onLoad(element: HTMLElement, attachments: {
        authenticated: boolean,
        matrix: boolean,
        currentLanguage: string,
    }) {
        this.isLogin = attachments.authenticated;
        this.matrix = attachments.matrix;
        this.element = element;
        this.attachments = attachments;
        this.getLanguage();

        Router.on(RouterClass.afterNavigate, (event) => {
            this.refreshLanguage();
        });

        ComponentManager.subscribe("session.login", (event, target, data) => {
            this.isLogin = true;
            this.matrix = data.response.matrix;
        });

        ComponentManager.subscribe("session.logout", (event, target, data) => {
            this.isLogin = false;
            this.matrix = false;
        });
    }

    onReload(element: HTMLElement, attachments: { currentLanguage: string }) {
        this.element = element;
        this.attachments = attachments;
        this.getLanguage();
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

    private getLanguage() {
        const product = ComponentManager.getAttribute("product");
        const url = Router.generateRoute("language", "language");
        const uri = utility.addQueryParam(url, "product", product);
        xhr({
            url: uri,
            type: "json",
        }).then((response) => {
            this.languageData = response;
            this.processLanguage();
        });
    }

    private processLanguage() {
        this.generateLanguageMarkup(this.languageData);
        this.product = ComponentManager.getAttribute("product");
        this.generateLanguageUrl(this.element, this.attachments.currentLanguage);
        this.bindLanguageLightbox();
    }

    /**
     * Set the language in the template
     *
     */
    private generateLanguageMarkup(data) {
        const language: HTMLElement = this.element.querySelector("#language");

        let languageList = {
            left: [],
            right: [],
        };

        const langListArray = [];
        const latam: any = ["es", "pt-br"];

        for (const langKey in data.language) {
            if (data.language.hasOwnProperty(langKey)) {
                const lang = data.language[langKey];

                if (this.matrix && latam.includes(lang.id)) {
                    continue;
                }

                if (!lang.hide) {
                    langListArray.push(lang);
                }
            }
        }

        const mid = Math.ceil(langListArray.length / 2);
        languageList = {
            left: langListArray.splice(0, mid),
            right: langListArray,
        };

        const template = languageTemplate({
            languageData: languageList,
            languageTitle: data.mobile_language_select,
            currentLanguage: data.currentLanguage,
        });

        language.innerHTML = template;
    }
}
