import * as utility from "@core/assets/js/components/utility";

import {Modal} from "@app/assets/script/components/modal";
import PushNX from "@core/assets/js/components/push-notification";

import * as actionTemplate from "./../handlebars/pushnx/action.handlebars";
import * as bodyTemplate from "./../handlebars/pushnx/body.handlebars";
import * as dismissTemplate from "./../handlebars/pushnx/dismiss.message.handlebars";
import * as expireDateTemplate from "./../handlebars/pushnx/expiration.date.handlebars";
import * as expireMessageTemplate from "./../handlebars/pushnx/expired.message.handlebars";
import * as messageTemplate from "./../handlebars/pushnx/message.handlebars";

export class PushNotification {
    private modal: Modal;
    private pushnx;

    constructor(element, attachments: {authenticated: boolean, pushnx: object}) {
        // override modal
        this.modal = new Modal({
            closeOverlayClick: false,
            escapeClose: false,
            id : "pushnxLightbox",
        });

        this.pushnx = new PushNX({
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
            action: false, // bind message action buttons default value true custom event "pushnx.action"
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

        this.attachAction(attachments.authenticated);
        this.listenSessionLogin();
        this.listenSessionLogout();
        this.listenMenu();
        this.listenMessageCounter();
        this.listenNewMessage();
    }

    /**
     * attach message action
     * @param {boolean} islogin
     */
    private attachAction(islogin: boolean) {
        //  bind action if login
         if (islogin) {
             this.pushnx.bindAction();
         }
    }

    /**
     * listen to session logout
     */
    private listenSessionLogout() {
        utility.listen(document, "session.logout", (event) => {
            this.pushnx.bindCloseService(); // close socket connection
        });
    }

    /**
     * listen to session login
     */
    private listenSessionLogin() {
        utility.listen(document, "session.login", (event) => {
            this.setCookie("pnxInitialLogin", true, 7);
            this.readyMessage();
        });
    }

    /**
     * listen to message ready (rendered) status
     */
    private readyMessage() {
        utility.listen(document, "pushnx.message.ready", (event) => {
            if (event.customData.ready) {
                this.initialProcess(event.customData.ready);
            }
        });
    }

    /**
     * process pushnx on initial login
     * @param {boolean} status [messages is ready and rendered]
     */
    private initialProcess(status: boolean) {
        const initial = utility.getCookie("pnxInitialLogin");

        if (initial) {
            this.pushnx.openModal();
            utility.removeCookie("pnxInitialLogin");
        }
    }

    /**
     * listen to "click" event on left nav pushnx menu
     */
    private listenMenu() {
        const menuNotif = document.querySelector(".quicklinks-notification");

        utility.listen(menuNotif, "click", (e) => {
            this.pushnx.openModal();
        });
    }

    /**
     * listen to "click" event on close modal
     */
    private listenModal() {
        const closeModal = document.getElementById("pushnx-close");

        utility.listen(closeModal, "click", (event) => {
            this.pushnx.closeModal();
        });
    }

    /**
     * listen to message counter
     */
    private listenMessageCounter() {
        utility.listen(document, "pushnx.count.message", (event) => {
            if (!event.customData.count) {
                this.pushnx.closeModal();
            }

            this.listenModal();
            // update badge message counter
            this.renderMessageCounter(event.customData.count);
        });
    }

    /**
     * listen to new message
     */
    private listenNewMessage() {
        utility.listen(document, "pushnx.new.message", (event) => {
            if (event.customData.count) {
                // display the indicator
                // this.messageIndicator();
                const indicator = document.querySelector(".mobile-menu-indicator");

                utility.removeClass(indicator, "hidden");
            }
        });
    }

    private renderMessageCounter(ctr) {
        const notifCount = document.getElementById("notification-count");
        if (notifCount && ctr > 0) {
            utility.removeClass(notifCount, "hidden");
            notifCount.innerHTML = ctr;
        } else {
            utility.addClass(notifCount, "hidden");
        }
    }

    /**
     * create cookie
     */
    private setCookie(cname: string, cvalue: boolean, days: number) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
}
