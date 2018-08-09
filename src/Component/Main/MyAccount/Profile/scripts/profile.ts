import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Loader} from "@app/assets/script/components/loader";
import {FormBase} from "@app/assets/script/components/form-base";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 * Forgot Password
 *
 * @param Node element component parent element
 * @param Object attachments
 * @param String emailField selector to target for email
 * @param String passwordField selector to target for password
 */
export class Profile extends FormBase {
    private form: HTMLFormElement;
    private loader: Loader;
    private validator: any;

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
    }

    init() {
        this.form = this.element.querySelector(".profile-form");
        this.validator = this.validateForm(this.form);
    }
}
