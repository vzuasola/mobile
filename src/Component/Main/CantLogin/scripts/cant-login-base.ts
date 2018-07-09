import * as utility from "@core/assets/js/components/utility";

export class CantLoginBase {
    element: HTMLElement;
    attachments: any;
    msgClass: string;

    constructor(element: HTMLElement, attachments: any) {
        this.element = element;
        this.attachments = attachments;
        this.msgClass = "error-message";
    }

    messageMapping(key) {
        return this.attachments.messages[key];
    }

    /**
     * Show/display message
     *
     * @param Node parentElem parent element to insert message
     * @param String msg message to insert
     */
    showMessage(parentElem, msg) {
        const oldMsgContainer = parentElem.querySelector("." + this.msgClass);

        this.createMessage(parentElem, msg);

        if (oldMsgContainer) {
            oldMsgContainer.remove();
        }
    }

    hideMessage(parentElem) {
        const msgContainer = parentElem.querySelector("." + this.msgClass);

        if (msgContainer) {
            msgContainer.remove();
        }
    }

    /**
     * Disable form elements
     *
     * @param Node form form tag element
     */
    disableFields(form) {
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
    enableFields(form) {
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
    showConfirmationMessage(form) {
        const confirmationMessage = utility.findParent(form, "div").querySelector(".confirmation-message");

        form.style.opacity = "0";
        utility.removeClass(confirmationMessage, "hidden");

        // setTimout needed for fade transition
        setTimeout(() => {
            utility.addClass(form, "hidden");
            confirmationMessage.style.opacity = "1";
        }, 10);
    }

    /**
     * Private methods ========================================
     */
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
