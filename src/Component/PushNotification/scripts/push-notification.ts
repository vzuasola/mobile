import * as utility from "@core/assets/js/components/utility";

import PushNX from "@core/assets/js/components/push-notification";

import * as actionTemplate from "./../handlebars/pushnx/action.handlebars";
import * as bodyTemplate from "./../handlebars/pushnx/body.handlebars";
import * as dismissTemplate from "./../handlebars/pushnx/dismiss.message.handlebars";
import * as expireDateTemplate from "./../handlebars/pushnx/expiration.date.handlebars";
import * as expireMessageTemplate from "./../handlebars/pushnx/expired.message.handlebars";
import * as messageTemplate from "./../handlebars/pushnx/message.handlebars";

export class PushNotification {
    private pushnx;

    constructor(element, attachments: {authenticated: boolean, pushnx: object}) {
        this.pushnx = new PushNX({
            lang: "en",
            islogin: attachments.authenticated,
            enable: true, // start pushnx - default value true
            scrollbot: false, // use default scrollbot library
            modal: {
                enable: true, // default value true
                control: false, // default value true
            },
            dismiss: true, // dismiss all message - default value false
            counter: true, // message counter custom event "pnxCountMessage"
            notify: true, // new message indicator custom event "pnxNewMessage"
            action: false, // bind message action buttons default value true custom event "pnxAction"
            template: { // override templates
                body: bodyTemplate, // body
                action: actionTemplate, // action
                message: messageTemplate, // message
                expirationDate: expireDateTemplate, // expiration date
                expiredMessage: expireMessageTemplate, // expired error message
                dismissAllMessage: dismissTemplate, // dismiss all message
            },
            config: attachments.pushnx,
        });

        // this.pushnx.enable();
        this.attachAction(attachments.authenticated);
        this.listenSessionLogin();
        this.listenSessionLogout();
        this.listenMenu();
    }

    private attachAction(islogin: boolean) {
        //  bind action if login
         if (islogin) {
             this.pushnx.bindAction();
         }
    }

    private listenSessionLogout() {
        // listen to session logout
        utility.listen(document, "session.logout", (event) => {
            this.pushnx.bindCloseService(); // close socket connection
        });
    }

    private listenSessionLogin() {
        utility.listen(document, "session.login", (event) => {
            this.setCookie("pnxInitialLogin", true, 7);
            this.readyMessage();
        });
    }

    private readyMessage() {
        utility.listen(document, "pnxMessageReady", (event) => {
            if (event.customData.ready) {
                this.modalProcess(event.customData.ready);
            }
        });
    }

    private modalProcess(status: boolean) {
        const initial = utility.getCookie("pnxInitialLogin");

        if (initial) {
            this.pushnx.openModal();
            utility.removeCookie("pnxInitialLogin");
        }
    }

    private listenMenu() {
        const menuNotif = document.querySelector(".menu-notification");

        utility.listen(menuNotif, "click", (event) => {
            this.pushnx.openModal();
        });
    }

    private setCookie(cname: string, cvalue: boolean, days: number) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
}
