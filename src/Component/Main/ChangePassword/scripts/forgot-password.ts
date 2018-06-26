import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {ForgotUsername} from "./forgot-username";

export class ForgotPassword extends ForgotUsername {
    private passwordField: HTMLFormElement;

    constructor(element: HTMLElement, emailSelector: string, private passwordSelector: string) {
        super(element, emailSelector);
        this.passwordField = this.element.querySelector(this.passwordSelector);
    }

    checkField() {
        // const email = this.emailField.value;
        const dataObj = {
            body: {
                email: this.emailField.value,
                username: this.passwordField.value,
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
                const username = data.body.username;

                const usernameEmailExist = mockResp.find((elem) => {
                    return elem.email === email && elem.username === username;
                });

                if (usernameEmailExist) {
                    this.showMessage("Username & Email found, should redirect to change password form");
                } else {
                    this.showMessage("Invalid username and/or email address.");
                }
            })
            .fail((err, msg) => {
                console.log("err fail() ", err);
            })
            .always((resp) => {
                this.loader.hide();
            });
    }
}
