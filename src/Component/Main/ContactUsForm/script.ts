import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import Tab from "@app/assets/script/components/tab";
import {Marker} from "@app/assets/script/components/marker";
import * as iconCheckedTemplate from "@app/templates/handlebars/icon-checked.handlebars";
import * as iconUnCheckedTemplate from "@app/templates/handlebars/icon-unchecked.handlebars";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";
import EqualHeight from "@app/assets/script/components/equal-height";
import {annotation} from "@app/assets/script/components/form-annotation";
import {ContactUsForm} from "./scripts/contact-us";

/**
 *
 */
export class ContactUsFormComponent implements ComponentInterface {
    private element: HTMLElement;
    private contactus: any;

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateFormAnnotation(element);
        this.activateContactUs(element, attachments);
        this.countrySelection();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateFormAnnotation(element);
        this.activateContactUs(element, attachments);
        this.countrySelection();
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
        const svgPhone = "<svg viewbox = '0 0 20 20'><use xlink: href ='#phone'></use></svg>";

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
}
