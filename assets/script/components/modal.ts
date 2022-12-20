import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

class Modal {
    listen(selector: string) {
        utility.listen(document.body, "click", (event, src) => {
            if (utility.hasClass(src, selector.replace(".", ""))) {
                this.open(src.getAttribute("href"));
                event.preventDefault();
            }
        });
    }

    open(selector: string, height: number = 500) {
        const element: HTMLElement = document.querySelector(selector);

        utility.invoke(document, "modal.open");
        utility.addClass(element, "modal-active");

        // Avoid scrolling when modal is displayed
        document.body.style.overflow = "hidden";

        if (!element.querySelector(".modal-overlay")) {
            const overlay = document.createElement("div");

            overlay.className = "modal-overlay";
            element.insertBefore(overlay, element.firstChild);

            if (utility.hasClass(element, "modal-active")) {
                document.body.style.overflow = "hidden";
            }
        }

        this.listenOnClose(selector, element);
    }

    close(selector: string) {
        const element = document.querySelector(selector);

        if (utility.hasClass(element, "modal-active")) {
            utility.removeClass(element, "modal-active");
            utility.invoke(document, "modal.close", element);

            document.body.style.overflow = "inherit";
        }
    }

    private listenOnClose(selector: string, element: HTMLElement) {
        utility.listen(element, "click", (event, src) => {
            if (utility.hasClass(src, "modal-overlay") || utility.hasClass(src, "modal-close")) {
                const loaderContent = document.querySelector("[class='component-widget-wrapper']");
                const errorMsgLightbox = document.querySelector("[id='error-message-lightbox']");
                if (loaderContent.getAttribute("data-component-widget-class") === "game_loader" &&
                    errorMsgLightbox.classList.contains("modal-active") === true) {
                    event.preventDefault();
                } else {
                    this.close(selector);

                    event.preventDefault();
                    ComponentManager.broadcast("modal.closed", { element, selector });
                    ComponentManager.broadcast("login.update.layout.component", { element: "#login-lightbox" });
                }
            }
        });
    }
}

const modal = new Modal();

export {modal as Modal};
