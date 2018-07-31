import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import Tab from "@app/assets/script/components/tab";
import {annotation} from "@app/assets/script/components/form-annotation";

/**
 *
 */
export class CantLoginComponent implements ComponentInterface {

    onLoad(element: HTMLElement, attachments: {}) {
        this.init(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.init(element);
    }

    private init(element) {
        new Tab();
        this.activateFormAnnotation(element);
        this.showForm(element);
    }

    private activateFormAnnotation(element) {
        annotation(element);
    }

    private showForm(element) {
        const sbfpw = utility.getParameterByName("sbfpw");
        const forgotPasswordForm = element.querySelector("#forgot-username-password");
        const resetPasswordForm = element.querySelector("#reset-password");

        if (sbfpw === null) {
            utility.addClass(resetPasswordForm, "hidden");
        } else {
            utility.addClass(forgotPasswordForm, "hidden");
        }
    }
}
