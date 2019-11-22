import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as contactUsTemplate from "./handlebars/contact.handlebars";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import EqualHeight from "@app/assets/script/components/equal-height";
import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class ContactUsComponent implements ComponentInterface {
    private element: HTMLElement;
    private contactUsData: any;
    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getContactUs();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getContactUs();
    }

    // private equalizeContactUsHeight() {
    //     const equalDownload = new EqualHeight(".download-box");
    //     equalDownload.init();
    // }

    private getContactUs() {
        xhr({
            url: Router.generateRoute("home_contactus", "contactUs"),
            type: "json",
        }).then((response) => {
            this.contactUsData = response;
            this.generateContactUsMarkup(this.contactUsData);
            // this.equalizeContactUsHeight();
        });
    }

    /**
     * Set the download in the template
     *
     */
    private generateContactUsMarkup(data) {
        const contactUs: HTMLElement = this.element.querySelector("#home-contact");
        const template = contactUsTemplate({
            contactUsData: data,
            contactUstext: data.entrypage_config.contact_us_home_text,
            // Add Here
        });

        contactUs.innerHTML = template;
    }

}
