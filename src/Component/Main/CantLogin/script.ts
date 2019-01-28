import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import Tab from "@app/assets/script/components/tab";
import {annotation} from "@app/assets/script/components/form-annotation";

/**
 *
 */
export class CantLoginComponent implements ComponentInterface {
    private sbfpw: string;

    onLoad(element: HTMLElement, attachments: {}) {
        this.init(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.init(element);
    }

    private init(element) {
        // get icore token pass from query parameter
        this.sbfpw = utility.getParameterByName("sbfpw");
        // if sbfpw and cookie token are present and is the same
        // show expired page else show form
        if (utility.getCookie("reset_token") && this.sbfpw &&
            utility.getCookie("reset_token") === this.sbfpw) {
            utility.addClass(element.querySelector("#forgot-username-password"), "hidden");
            utility.addClass(element.querySelector("#reset-password"), "hidden");
            utility.removeClass(element.querySelector(".expired-token-wrapper"), "hidden");
        } else {
            new Tab();
            this.activateFormAnnotation(element);
            this.showForm(element);
        }

        this.appDetection(element);
    }

    /**
     * Add spicific body class for native app base on query parameter
     */
    private appDetection(element) {
        const device  = utility.getParameterByName("device");

        if (device === "native-app") {
            const bodyTag = utility.findParent(element, "body");
            utility.addClass(bodyTag, device);
        }
    }

    private activateFormAnnotation(element) {
        annotation(element);
    }

    private showForm(element) {
        const forgotPasswordForm = element.querySelector("#forgot-username-password");
        const resetPasswordForm = element.querySelector("#reset-password");

        if (this.sbfpw === null) {
            utility.addClass(resetPasswordForm, "hidden");
        } else {
            utility.addClass(forgotPasswordForm, "hidden");
        }
    }
}
