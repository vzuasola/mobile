import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import Tab from "@app/assets/script/components/tab";
import {Marker} from "@app/assets/script/components/marker";
import * as iconCheckedTemplate from "@app/templates/handlebars/icon-checked.handlebars";
import * as iconUnCheckedTemplate from "@app/templates/handlebars/icon-unchecked.handlebars";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";
import EqualHeight from "@app/assets/script/components/equal-height";

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
        this.toggleLogoutLink();
        this.equalizeActionButtonHeight();

        new Tab();

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

    private toggleLogoutLink() {
        setTimeout(() => {
            const logoutLink: any = document.body.querySelector(".quicklinks-logout");

            if (logoutLink) {
                // Hide logout link
                logoutLink.parentNode.style.display = "none";

                Router.on(RouterClass.afterNavigate, (event) => {
                    // Show logout link
                    logoutLink.parentNode.style.display = "block";
                });
            }
        }, 150);
    }

    private equalizeActionButtonHeight() {
        const equalize = new EqualHeight("#MyProfileForm_submit, #MyProfileForm_button_cancel");
        equalize.init();
    }
}
