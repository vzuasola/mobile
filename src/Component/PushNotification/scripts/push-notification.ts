import * as utility from "@core/assets/js/components/utility";

import {Modal} from "@app/assets/script/components/modal";
import PushNX from "@core/assets/js/components/push-notification";

import * as actionTemplate from "./../handlebars/pushnx/action.handlebars";
import * as bodyTemplate from "./../handlebars/pushnx/body.handlebars";
import * as dismissTemplate from "./../handlebars/pushnx/dismiss.message.handlebars";
import * as expireDateTemplate from "./../handlebars/pushnx/expiration.date.handlebars";
import * as expireMessageTemplate from "./../handlebars/pushnx/expired.message.handlebars";
import * as messageTemplate from "./../handlebars/pushnx/message.handlebars";
import * as titleTemplate from "./../handlebars/pushnx/title.message.handlebars";

import * as productArcade from "./../handlebars/svg/product-arcade.handlebars";
import * as productCasinoGold from "./../handlebars/svg/product-casino-gold.handlebars";
import * as productCasino from "./../handlebars/svg/product-casino.handlebars";
import * as productDafasports from "./../handlebars/svg/product-dafasports.handlebars";
import * as productExchange from "./../handlebars/svg/product-exchange.handlebars";
import * as productFishHunter from "./../handlebars/svg/product-fish-hunter.handlebars";
import * as productGames from "./../handlebars/svg/product-games.handlebars";
import * as productKeno from "./../handlebars/svg/product-keno.handlebars";
import * as productLiveDealer from "./../handlebars/svg/product-live-dealer.handlebars";
import * as productLiveChat from "./../handlebars/svg/product-livechat.handlebars";
import * as productLottery from "./../handlebars/svg/product-lottery.handlebars";
import * as productOWSports from "./../handlebars/svg/product-owsports.handlebars";
import * as productPoker from "./../handlebars/svg/product-poker.handlebars";
import * as productPromotions from "./../handlebars/svg/product-promotions.handlebars";
import * as productVirtuals from "./../handlebars/svg/product-virtuals.handlebars";

import * as productGeneric from "./../handlebars/svg/product-generic.handlebars";

export class PushNotification {
    private pushnx;
    private element;
    private islogin;
    private isconnected: boolean;

    constructor(element, attachments: {authenticated: boolean, pushnx: object}) {
        this.element = element;
        this.isconnected = false;

        this.pushnx = new PushNX({
            islogin: attachments.authenticated,
            enable: true, // start pushnx - default value true
            scrollbot: false, // use default scrollbot library
            modal: {
                enable: true, // default value true
                control: false, // default value true
            },
            dismiss: false, // dismiss all message - default value false
            counter: true, // message counter custom event "pushnx.count.message"
            notify: true, // new message indicator custom event "pushnx.new.message"
            action: false, // bind message action buttons default value true custom event "pushnx.action"
            buttons: {
                OK: "btn btn-small btn-yellow pushnx-lightbox-btn-ok",
                ACCEPT: "btn btn-small btn-medium btn-yellow pushnx-lightbox-btn-accept",
                DECLINE: "btn btn-small btn-medium btn-red pushnx-lightbox-btn-decline",
            },
            icons: true,
            iconsvg: {
                arcade: productArcade,
                casinogold: productCasinoGold,
                casino: productCasino,
                dafasports: productDafasports,
                exchange: productExchange,
                fishhunter: productFishHunter,
                games: productGames,
                generic: productGeneric,
                keno: productKeno,
                livedealer: productLiveDealer,
                livechat: productLiveChat,
                lottery: productLottery,
                owsports: productOWSports,
                poker: productPoker,
                promotions: productPromotions,
                virtuals: productVirtuals,
            },
            template: { // override templates
                body: bodyTemplate, // body
                action: actionTemplate, // action
                message: messageTemplate, // message
                title: titleTemplate, // title
                expirationDate: expireDateTemplate, // expiration date
                expiredMessage: expireMessageTemplate, // expired error message
                dismissAllMessage: dismissTemplate, // dismiss all message
            },
            config: attachments.pushnx,
        });

        this.attachAction(attachments.authenticated);
        this.listenSessionLogin(attachments.authenticated);
        this.listenSessionLogout();
        this.socketConnected();
        this.listenOpenModal(attachments.authenticated);
        this.listenCloseModal();
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
    private listenSessionLogin(login: boolean) {
        utility.listen(document, "session.login", (event) => {
            this.setCookie("pnxInitialLogin", true, 7);
            this.readyMessage(login);
        });
    }

    /**
     * listen to message ready (rendered) status
     */
    private readyMessage(login: boolean) {
        utility.listen(document, "pushnx.message.ready", (event) => {
            if (event.customData.ready) {
                this.initialProcess(event.customData.ready, login);
            }
        });
    }

    /**
     * process pushnx on initial login
     * @param {boolean} status [messages is ready and rendered]
     */
    private initialProcess(status: boolean, login: boolean) {
        const initial = utility.getCookie("pnxInitialLogin");
        if (initial) {
            this.openModal(login);
            utility.removeCookie("pnxInitialLogin");
        }
    }

    /**
     * listen to "click" event on close modal
     */
    private listenModal() {
        const closeModal = this.element.querySelector("#pushnx-close");

        utility.listen(closeModal, "click", (event) => {
            this.closeModal();
        });
    }

    /**
     * listen close modal
     */
    private listenCloseModal() {
        utility.listen(document, "pushnx.close.modal", (e) => {
            this.closeModal();
        });
    }

    /**
     * close modal
     */
    private closeModal() {
        Modal.close("#pushnxLightbox");
    }

    /**
     * listen open modal
     */
    private listenOpenModal(login: boolean) {
        utility.listen(document, "pushnx.open.modal", (e) => {
            this.openModal(login);
        });
    }

    /**
     * open modal
     */
    private openModal(login: boolean) {
        if (this.isconnected) {
            Modal.open("#pushnxLightbox");
            this.listenModal();
        }
    }

    /**
     * listen to socket connection
     */
    private socketConnected() {
        utility.listen(document, "pushnx.connected", (e) => {
            if (e.customData.status) {
                this.isconnected = e.customData.status;
            }
        });
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
