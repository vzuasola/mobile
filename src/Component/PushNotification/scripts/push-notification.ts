import * as utility from "@core/assets/js/components/utility";

import {ComponentManager } from "@plugins/ComponentWidget/asset/component";

import PushNX from "@core/assets/js/components/push-notification";

import {Modal} from "@app/assets/script/components/modal";

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
     * Attach message action
     *
     * @param {boolean} islogin
     */
    private attachAction(islogin: boolean) {
        //  bind action if login
         if (islogin) {
             this.pushnx.bindAction();
         }
    }

    /**
     * Listen to session logout
     */
    private listenSessionLogout() {
        ComponentManager.subscribe("session.logout", (event) => {
            this.pushnx.bindCloseService(); // close socket connection
        });
    }

    /**
     * Listen to session login
     */
    private listenSessionLogin(login: boolean) {
        ComponentManager.subscribe("session.login", (event) => {
            this.setCookie("pnxInitialLogin", true, 7);
            this.readyMessage(login);
        });
    }

    /**
     * Listen to message ready (rendered) status
     */
    private readyMessage(login: boolean) {
        ComponentManager.subscribe("pushnx.message.ready", (event) => {
            if (event.customData.ready) {
                this.initialProcess(event.customData.ready, login);
            }
        });
    }

    /**
     * Process pushnx on initial login
     *
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
     * Listen close modal
     */
    private listenCloseModal() {
        ComponentManager.subscribe("modal.close", (event, src, data) => {
            this.closeModal();
        });

    }

    /**
     * Close modal
     */
    private closeModal() {
        Modal.close("#pushnxLightbox");
    }

    /**
     * Listen open modal
     */
    private listenOpenModal(login: boolean) {
        ComponentManager.subscribe("click", (event, src) => {
            if (utility.hasClass(src, "notification-trigger", true)) {
                this.openModal(login);
            }
        });
    }

    /**
     * Open modal
     */
    private openModal(login: boolean) {
        if (this.isconnected) {
            Modal.open("#pushnxLightbox");
        }
    }

    /**
     * Listen to socket connection
     */
    private socketConnected() {
        ComponentManager.subscribe("pushnx.connected", (e) => {
            if (e.customData.status) {
                this.isconnected = e.customData.status;
            }
        });
    }

    /**
     * Create cookie
     */
    private setCookie(cname: string, cvalue: boolean, days: number) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
}
