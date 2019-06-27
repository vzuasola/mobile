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
            en: "An unexpected error occurred.<br />This window will" +
            "close in few seconds.<br /><br />Please try again soon.",
            sc: "出现意外错误<br />窗口即将关闭<br /><br />请稍后重试。",
            ch: "出現意外錯誤<br />窗口即將關閉<br /><br />請稍後重試。",
            th: "เกิดความผิดพลาด<br />หน้าต่างนี้จะถูกปิดลงในอีก 5 – 6 วินาที" +
            "<br /><br />กรุณาลองใหม่อีกครั้ง",
            kr: "예상치 못한 오류가 발생했습니다.<br />" +
            "몇 초 후에 창이 닫힐 예정입니다.<br /><br />" +
            "잠시 후에 다시 시도해 주세요.",
            vn: "Rất tiếc đã xảy ra lỗi.<br />" +
            "Cửa sổ này sẽ bị đóng trong vài giây.<br />" +
            "<br />Xin vui lòng thử lại sau.",
            id: "Telah terjadi kesalahan yang tak diduga.<br />" +
            "Window ini akan segera ditutup.<br /><br /> " +
            "Silahkan coba lagi nanti.",
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
        }, 5 * 1000);
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
