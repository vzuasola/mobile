import * as utility from "@core/assets/js/components/utility";

import {GameLauncher} from "@app/src/Module/GameIntegration/scripts/game-launcher";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";
import { ProviderDrawer } from "../Main/Lobby/LiveDealerLobby/scripts/provider-drawer";

/**
 *
 */
export class GameLoaderComponent implements ComponentInterface {

    private element: HTMLElement;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.initMessage();
        this.launchGame();
        this.showMessage();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.initMessage();
        this.launchGame();
        this.showMessage();
    }

    /**
     * Set the message for loader
     */
    private initMessage() {
        const message = {
            en: "The connection has timed out.<br />" +
            "Please try again in a few moments.",
            sc: "连接超时<br />请稍后重试",
            ch: "連接超時<br />請稍後重試",
            th: "หมดเวลาเชื่อมต่อ<br />กรุณาลองใหม่ในอีกสักครู่",
            kr: "연결 시간이 초과되었습니다.<br />" +
            "잠시 후에 다시 시도하십시오. ",
            vn: "Thời gian kết nối đã hết.<br />" +
            "Vui lòng thử lại sau vài phút.<br />",
            id: "Waktu koneksi telah habis.<br />" +
            "Silakan coba lagi beberapa saat lagi.",
            pt: "A conexão expirou. <br />" +
            "Por favor, tente novamente em alguns instantes.",
            es: "La conexión ha expirado. <br />" +
            "Por favor, inténtalo de nuevo en unos minutos.",
        };

        let lang = ComponentManager.getAttribute("language");

        if (!message[lang]) {
            lang = "en";
        }

        this.element.querySelector(".message").innerHTML = message[lang];

    }

    /**
     * Launch game using game launcher
     */
    private launchGame() {
        const params = utility.getParameters(window.location.href);
        if (params.provider) {
            GameLauncher.launch(params.provider, params);
        }
    }

    /**
     * Show message to the user after 5 secs
     */
    private showMessage() {
        setTimeout(() => {
            utility.addClass(this.element.querySelector(".loader"), "hidden");
            utility.removeClass(this.element.querySelector(".message"), "hidden");
            this.closeOnTimeout();
        }, 30 * 1000);
    }

    /**
     * Close self after 5 secs
     */
    private closeOnTimeout() {
        setTimeout(() => {
            window.close();
            window.history.back();
        }, 5 * 1000);
    }
}
