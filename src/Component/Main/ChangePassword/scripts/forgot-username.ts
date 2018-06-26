import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {Loader} from "@app/assets/script/components/loader";

export class ForgotUsername {
    static msgClass: string;
    emailField: HTMLFormElement;
    emailContainer: HTMLElement;
    loader: Loader;

    constructor(private element: HTMLElement, private emailSelector: string) {
        this.element = element;
        this.emailField = this.element.querySelector(this.emailSelector);
        this.emailContainer = this.emailField.parentElement.parentElement;
        this.loader = new Loader(utility.hasClass(this.emailField, "form-item", true), false, 0);
        ForgotUsername.msgClass = "error-message";
    }

    validateEmail() {
        // console.log("validateEmail()");
    }

    checkField() {
        const dataObj = {
            body: {
                email: this.emailField.value,
            },
        };

        const dataString = JSON.stringify(dataObj);

        const mockResp = [
            {
                username: "cashierhra",
                email: "cashierhra@gmail.com",
                password: "pass123",
            },
            {
                username: "johndoe",
                email: "jdoe@gmail.com",
                password: "pass123$$",
            },
        ];

        // Remove/hide error message & Show loader
        this.hideMessage();
        this.loader.show();

        xhr({
            // url: "http://api.myjson.com/bins/kwzpu",
            url: Router.generateRoute("promotions", "promotions"),
            type: "json",
            method: "post",
        })
            .then((resp) => {
                const data = JSON.parse(dataString);
                const email = data.body.email;

                const emailExist = mockResp.find((elem) => {
                    return elem.email === email;
                });

                if (emailExist) {
                    // Should redirect to change password form
                    this.showMessage("Email found, should redirect to change password form");
                } else {
                    // Will Show message
                    this.showMessage("No email address found from the database");
                }
            })
            .fail((err, msg) => {
                console.log("err fail() ", err);
            })
            .always((resp) => {
                this.loader.hide();
            });
    }

    showMessage(msg) {
        const oldMsgContainer = this.emailContainer.querySelector("." + ForgotUsername.msgClass);
        const msgContainer = this.createMessage(msg);

        if (oldMsgContainer) {
           oldMsgContainer.remove();
        }
    }

    hideMessage() {
        const msgContainer = this.emailContainer.querySelector("." + ForgotUsername.msgClass);

        if (msgContainer) {
            msgContainer.remove();
        }
    }

    /**
     * Create message
     *
     * @param String msg message to insert
     * @param String className class name of the message container
     */
    createMessage(msg) {
        const msgContainer = this.createElem("div", ForgotUsername.msgClass);

        msgContainer.appendChild(document.createTextNode(msg));

        this.emailContainer.appendChild(msgContainer);

        return msgContainer;
    }

    createElem(tagName, className) {
        const element = document.createElement(tagName);
        utility.addClass(element, className || "");

        return element;
    }
}
