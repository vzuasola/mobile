import * as utility from "@core/assets/js/components/utility";
import {Validator} from "@app/assets/script/components/validation/validator";

/**
 * Cant login base
 *
 * @param Node element component parent element
 * @param Object attachments
 */
export abstract class FormBase {
    element: HTMLElement;
    attachments: any;
    private msgClass: string;

    constructor(element: HTMLElement, attachments: any) {
        this.element = element;
        this.attachments = attachments;
        this.msgClass = "error-message";
    }

    validateForm(form: HTMLFormElement) {
        const validator = new Validator(
            JSON.parse(form.getAttribute("data-validations")), [],
        );

        validator.init();

        return validator;
    }

    messageMapping(key: string) {
        return this.attachments.messages[key];
    }

    /**
     * Show/display message
     *
     * @param Node parentElem parent element to insert message
     * @param String msg message to insert
     */
    showMessage(parentElem, msg): void {
        const oldMsgContainer = parentElem.querySelector("." + this.msgClass);

        this.createMessage(parentElem, msg);

        if (oldMsgContainer) {
            oldMsgContainer.remove();
        }
    }

    hideMessage(parentElem): void {
        const msgContainer = parentElem.querySelector("." + this.msgClass);

        if (msgContainer) {
            msgContainer.remove();
        }
    }

    /**
     * Disable form elements [attr][disabled]
     *
     * @param Node form form tag element
     */
    disableattrFields(form): void {
        utility.forEach(form.elements, (elem) => {
            elem.disabled = true;
        });

        this.showOverlay(form);
    }

    /**
     * Disable form elements [attr][readOnly]
     *
     * @param Node form form tag element
     */
    disableFields(form): void {
        utility.forEach(form.elements, (elem) => {
            elem.readOnly = true;
        });

        this.showOverlay(form);
    }

    /**
     * Enable form elements
     *
     * @param Node form form tag element
     */
    enableFields(form): void {
        utility.forEach(form.elements, (elem) => {
            elem.readOnly = false;
        });

        this.hideOverlay(form);
    }

    /**
     * Show confirmation message
     *
     * @param Node form form tag element
     */
    showConfirmationMessage(form, selector: string = ".api-success-message"): void {
        const confirmationMessage = utility.findParent(form, "div").querySelector(selector);

        form.style.opacity = "0";
        utility.removeClass(confirmationMessage, "hidden");

        // setTimout needed for fade transition
        setTimeout(() => {
            utility.addClass(form, "hidden");
            confirmationMessage.style.opacity = "1";
        }, 10);
    }

    private createMessage(parentElem, msg) {
        const msgContainer = this.createElem("div", this.msgClass);

        msgContainer.appendChild(document.createTextNode(msg));

        parentElem.appendChild(msgContainer);

        return msgContainer;
    }

    private showOverlay(form) {
        let formOverlay = form.querySelector(".form-overlay");

        if (formOverlay) {
            utility.removeClass(formOverlay, "hidden");
        } else {
            formOverlay = this.createElem("div", "form-overlay");
            form.appendChild(formOverlay);
        }
    }

    private hideOverlay(form) {
        utility.addClass(form.querySelector(".form-overlay"), "hidden");
    }

    private createElem(tagName, className) {
        const element = document.createElement(tagName);
        utility.addClass(element, className || "");

        return element;
    }
}

export const resetForm = (form): void => {
    form.reset();

    // remove icon-validation
    const icons = form.querySelectorAll(".icon-validation");
    utility.forEach(icons, (icon) => {
        icon.remove();
    });

    // remove helper block
    const messages = form.querySelectorAll(".form-help-block");
    utility.forEach(messages, (message) => {
        message.remove();
    });

    // remove has-success/error class
    const formItems = form.querySelectorAll(".form-item");
    utility.forEach(formItems, (item) => {
        utility.removeClass(item, "has-error");
        utility.removeClass(item, "has-success");
    });
};
