import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import Tab from "@app/assets/script/components/tab";
import {Marker} from "@app/assets/script/components/marker";
import * as iconCheckedTemplate from "@app/templates/handlebars/icon-checked.handlebars";
import * as iconUnCheckedTemplate from "@app/templates/handlebars/icon-unchecked.handlebars";

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
        const bodyTag = document.body;
        const logoutLink: any = bodyTag.querySelector(".quicklinks-logout");

        let i = 0;

        const intervalId = setInterval(() => {
            const route = bodyTag.getAttribute("data-route");

            i++;

            if (logoutLink && route === "/my-account") {
                logoutLink.parentNode.style.display = "none";
                if (i > 5) {
                    return;
                }
            } else {
                logoutLink.parentNode.style.display = "block";
                clearInterval(intervalId);
            }

        }, 1000);
    }
}
