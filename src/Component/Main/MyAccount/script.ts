import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import Tab from "@app/assets/script/components/tab";
import {Marker} from "@app/assets/script/components/marker";
import * as iconCheckedTemplate from "@app/templates/handlebars/icon-checked.handlebars";
import * as iconUnCheckedTemplate from "@app/templates/handlebars/icon-unchecked.handlebars";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";
import EqualHeight from "@app/assets/script/components/equal-height";
import {annotation} from "@app/assets/script/components/form-annotation";

/**
 *
 */
export class MyAccountComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        this.init(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.init(element);
    }

    private init(element) {
        this.broadcastLogoutLink(element);
        this.equalizeActionButtonHeight();

        new Tab();
        this.activateFormAnnotation(element);

        // Checkbox
        new Marker({
            parent: ".MyProfileForm_preference_markup",
            iconDefault: iconUnCheckedTemplate(),
            iconActive: iconCheckedTemplate(),
        });

        // Radio
        new Marker({
            parent: "#MyProfileForm_gender",
        });
    }

    private activateFormAnnotation(element) {
        annotation(element);
    }

    private broadcastLogoutLink(element) {
        ComponentManager.subscribe("menu.ready", () => {
            ComponentManager.broadcast("menu.logout.hide", {
                selector: ".quicklinks-logout",
            });
        });

        Router.on(RouterClass.afterNavigate, (event) => {
            ComponentManager.broadcast("menu.logout.show", {
                selector: ".quicklinks-logout",
            });
        });
    }

    private equalizeActionButtonHeight() {
        const equalize = new EqualHeight("#MyProfileForm_submit, #MyProfileForm_button_cancel");
        equalize.init();
    }
}
