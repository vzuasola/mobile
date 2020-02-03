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

        ComponentManager.subscribe("session.login", (event, target, data) => {
            this.playerLanguage();
            this.getLanguage();
        });
    }

    onReload(element: HTMLElement, attachments: {currentLanguage: string}) {
        this.element = element;
        this.attachments = attachments;
    }

    private playerLanguage() {
        xhr({
            url: Router.generateRoute("in_language", "details"),
            type: "json",
        }).then((response) => {
            console.log(response);
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
        });

        language.innerHTML = template;
    }
}
