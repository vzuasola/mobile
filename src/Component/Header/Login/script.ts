import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import * as FormValidator from "@core/assets/js/vendor/validate";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {Login} from "./scripts/login";
import {Validation} from "./scripts/validation";

/**
 *
 */
export class LoginComponent implements ComponentInterface {
    private loginService: Login;
    private validationService: Validation;

    constructor() {
        this.loginService = new Login();
        this.validationService = new Validation();
    }

    onLoad(element: HTMLElement, attachments: {
        authenticated: boolean,
        error_messages: {[name: string]: string},
    }) {
        this.loginService.handleOnLoad(element, attachments);
        this.validationService.handleOnLoad(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {
        authenticated: boolean,
        error_messages: {[name: string]: string},
    }) {
        this.loginService.handleOnReload(element, attachments);
        this.validationService.handleOnReload(element, attachments);
    }
}
