import * as utility from "@core/assets/js/components/utility";

import {ComponentManager } from "@plugins/ComponentWidget/asset/component";

import PushNX from "@core/assets/js/components/push-notification";

import {Modal} from "@app/assets/script/components/modal";

// Pushnx Site Templates
import * as actionTemplate from "./../handlebars/pushnx/action.handlebars";
import * as bodyTemplate from "./../handlebars/pushnx/body.handlebars";
import * as dismissTemplate from "./../handlebars/pushnx/dismiss.message.handlebars";
import * as expireDateTemplate from "./../handlebars/pushnx/expiration.date.handlebars";
import * as expireMessageTemplate from "./../handlebars/pushnx/expired.message.handlebars";
import * as messageTemplate from "./../handlebars/pushnx/message.handlebars";
import * as titleTemplate from "./../handlebars/pushnx/title.message.handlebars";

// Pushnx SVG Templates
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
import * as productWallet from "./../handlebars/svg/product-wallet.handlebars";

import * as productGeneric from "./../handlebars/svg/product-generic.handlebars";

export class PushNotification {
    private pushnx;
    private element;
    private islogin;
    private isconnected: boolean;

    constructor(element, attachments: {authenticated: boolean, pushnx: object}) {
        this.element = element;
        this.isconnected = false;

        if (attachments.authenticated) {
            this.pushnx = new PushNX({
                islogin: attachments.authenticated,
                enable: true, // start pushnx - default value true
                scrollbot: false, // use default scrollbot library
                modal: {
                    enable: true, // default value true
                    control: false, // default value true
                    height: "auto", // custom height
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
                    wallet: productWallet,
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

            this.attachAction();
            this.listenSessionLogin();
            this.listenSessionLogout();
            this.socketConnected();
            this.messageListener();
            this.listenOpenModal();
            this.listenCloseModal();
        }
    }

    /**
     * Attach message action
     */
    private attachAction() {
         this.pushnx.bindAction();
    }

    /**
     * Listen to session logout
     */
    private listenSessionLogout() {
        ComponentManager.subscribe("session.logout", (event) => {
            this.pushnx.bindCloseService(); // close socket connection
            this.isconnected = false;
        });
    }

    /**
     * Listen to session login
     */
    private listenSessionLogin() {
        ComponentManager.subscribe("session.login", (event) => {
            this.setCookie("pushnx.initial.login", true, 7);
            this.readyMessage();
        });
    }

    /**
     * Listen to message ready (rendered) status
     */
    private readyMessage() {
        ComponentManager.subscribe("pushnx.message.ready", this.initialProcess.bind(this));
    }

    /**
     * Process pushnx on initial login
     */
    private initialProcess(event) {
        const initial = utility.getCookie("pushnx.initial.login");

        if (initial && event.customData.ready) {
            utility.removeCookie("pushnx.initial.login");
            this.isconnected = true;
            this.openModal();
        }

        setTimeout(() => {
            utility.removeCookie("pushnx.initial.login");
        }, 3000);
    }

    /**
     * Listen close modal
     */
    private listenCloseModal() {
        ComponentManager.subscribe("pushnx.modal.close", (event, src, data) => {
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
    private listenOpenModal() {
        ComponentManager.subscribe("pushnx.modal.open", (event, src) => {
            this.openModal();
        });
    }

    /**
     * Open modal
     */
    private openModal() {
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
     * listen to number of messages and do other customization
     */
    private messageListener() {
        ComponentManager.subscribe("pushnx.count.message", (event) => {
            this.emptyMessage(event.customData.count);
        });
    }

    /**
     * add custom class if message is empty
     * @param {[type]} ctr number of messages
     */
    private emptyMessage(ctr) {
        const pushnx = this.element.querySelector("#push-notification");

        if (ctr) {
            utility.removeClass(pushnx, "no-notification");
        } else {
            utility.addClass(pushnx, "no-notification");
        }
    }

    /**
     * unbind all event listeners
     */
    private unbindEvents() {
        if (this.pushnx) {
            ComponentManager.unsubscribe("pushnx.connected");
            ComponentManager.unsubscribe("pushnx.message.ready");
            ComponentManager.unsubscribe("pushnx.count.message");
            ComponentManager.unsubscribe("pushnx.modal.open");
            ComponentManager.unsubscribe("pushnx.modal.close");
            this.pushnx.unbindEvents();
        }
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
