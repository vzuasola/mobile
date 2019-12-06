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
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateFormAnnotation(element);
        this.activateContactUs(element, attachments);
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

}
