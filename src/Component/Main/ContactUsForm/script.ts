import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as contactUsTabsTemplate from "./handlebars/contact-us-tabs.handlebars";
import { Router } from "@plugins/ComponentWidget/asset/router";

import {annotation} from "@app/assets/script/components/form-annotation";
import {ContactUsForm} from "./scripts/contact-us";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class ContactUsFormComponent implements ComponentInterface {
    private element: HTMLElement;
    private contactus: any;
    private contactUsTabsData: any;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.activateFormAnnotation(element);
        this.activateContactUs(element, attachments);
        this.getContactUsTabs();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.activateFormAnnotation(element);
        this.activateContactUs(element, attachments);
        this.getContactUsTabs();
    }

    private activateFormAnnotation(element) {
        annotation(element);
    }

    /**
     * Activate Reset Password
     */
    private activateContactUs(element, attachments) {
        this.contactus = new ContactUsForm(
            element,
            attachments);
        this.contactus.init();
    }

    private countrySelection() {
        const countrySelect = document.getElementById("contactcountry") as HTMLSelectElement;
        const buttonWrapper = document.getElementById("contact-button-wrapper");
        const svgPhone = "<svg viewbox = '0 0 20 20'><use xlink: href ='#contact-phone'></use></svg>";

        if (countrySelect && buttonWrapper) {
            utility.addEventListener(countrySelect, "change", (event, src) => {
                const selectedValue = countrySelect.options[countrySelect.selectedIndex].value;
                const pattern = new RegExp(",");
                let match = false;

                match = pattern.test(selectedValue);

                if (selectedValue && match) {
                    const split = selectedValue.split(",");
                    const split1 = split[0];
                    const split2 = split[1];
                    const split3 = split[2];

                    if (split3) {
                        buttonWrapper.innerHTML = "<a href='tel:" + split1 + "' class='btn phone three clearfix'>" +
                            svgPhone + split1 + "</a> <span>or</span> <a href='tel:" +
                            split2 + "' class='btn phone three clearfix'>" + svgPhone + split2 +
                            "</a> <span>or</span> <a href='tel:" +
                            split3 + "' class='btn phone three clearfix'>" +
                            svgPhone + split3 + "</a>";
                    } else {
                        buttonWrapper.innerHTML = "<a href='tel: " + split1 + "' class='btn phone clearfix'>" +
                            svgPhone + split1 + "</a> <span>or</span> <a href='tel:" + split2 +
                            "' class='btn phone clearfix'>" + svgPhone + split2 + "</a>";
                    }
                } else if (selectedValue) {
                    buttonWrapper.innerHTML = "<a href='tel: " + selectedValue + "' class='btn phone clearfix'>" +
                        svgPhone + selectedValue + "</a>";
                } else {
                    buttonWrapper.innerHTML = "";
                }
            });
        }
    }

    private getContactUsTabs() {
        xhr({
            url: Router.generateRoute("contact_us", "contactUsTabs"),
            type: "json",
        }).then((response) => {
            this.contactUsTabsData = response;
            this.generateContactUsTabsMarkup(this.contactUsTabsData);
            this.countrySelection();
        });
    }

    /**
     * Set the contact us tabs in the template
     *
     */
    private generateContactUsTabsMarkup(data) {
        const contactUsTabs: HTMLElement = this.element.querySelector("#contact-us-tabs");
        data = this.processContact(data);
        const template = contactUsTabsTemplate({
            contactUsTabsData: data,
            contactBlurbTitle: data.contact_blurb.page_title,
            contactBlurbContent: data.contact_blurb.body_content.value,
            contactImage: data.contact_blurb.file_image_page_image,
        });

        contactUsTabs.innerHTML = template;
    }

    private processContact(data) {
        const contact = [];

        for (const tab of data.contactTabs) {
            if (this.contactsVisibility() && tab.field_device.toLowerCase().indexOf("ios") > -1) {
                contact.push(tab);
            }

            if (!this.contactsVisibility() && tab.field_device.toLowerCase().indexOf("android") > -1) {
                contact.push(tab);
            }
        }

        data.contactTabs = contact;
        return data;
    }

    private contactsVisibility() {
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);

        return ios;
    }

}
