import * as utility from "@core/assets/js/components/utility";

import { GameLauncher } from "@app/src/Module/GameIntegration/scripts/game-launcher";

import { ComponentInterface, ComponentManager } from "@plugins/ComponentWidget/asset/component";
import { Loader } from "@app/assets/script/components/loader";
/**
 *
 */
export class GameIFrameComponent implements ComponentInterface {

    private element: HTMLElement;
    private isLogin: boolean;
    private loader: Loader;

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    onLoad(element: HTMLElement, attachments: { isLogin: boolean }) {
        this.element = element;
        this.isLogin = attachments.isLogin;
        this.loader.remove();
        this.initMessage();
        this.launchGame();
    }

    onReload(element: HTMLElement, attachments: { isLogin: boolean }) {
        this.element = element;
        this.isLogin = attachments.isLogin;
        this.loader.remove();
        this.initMessage();
        this.launchGame();
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
        const options = utility.getParameters(window.location.href);
        if (this.isLogin && options.provider) {
            options.element = this.element;
            options.onSuccess = this.loadGameFrame;
            options.onFail = this.showErrorMessage;
            GameLauncher.launch(options.provider, options);
        } else {
            this.showErrorMessage(this.element);
        }
    }

    /**
     * Update iframe src to game URL
     */
    private loadGameFrame(response, element) {
        const iframe = element.querySelector("#gameframe");
        const iframeWrapper = element.querySelector(".game-iframe-container");
        // assign src to iframe
        if (iframe !== null || iframe !== undefined && response.gameurl !== undefined) {
            utility.removeClass(iframeWrapper, "hidden");
            utility.removeClass(iframe, "hidden");
            element.querySelector(".game-iframe-loader-container").remove();

            // resize iframe
            iframe.setAttribute("width", 360);
            iframe.setAttribute("height", "auto");
            iframeWrapper.style.height = "calc(100vh - 50px)";
            iframe.setAttribute("src", response.gameurl);

        }
    }

    /**
     * Show generic error message to the user on failed launch
     */
    private showErrorMessage(element) {
        utility.addClass(element.querySelector(".loader"), "hidden");
        utility.removeClass(element.querySelector(".message"), "hidden");
        this.closeOnTimeout();
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
