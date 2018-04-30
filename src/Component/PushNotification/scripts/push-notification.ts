import PushNX from "@core/assets/js/components/push-notification";

import * as actionTemplate from "./../handlebars/pushnx/action.handlebars";
import * as bodyTemplate from "./../handlebars/pushnx/body.handlebars";
import * as dismissTemplate from "./../handlebars/pushnx/dismiss.message.handlebars";
import * as expireDateTemplate from "./../handlebars/pushnx/expiration.date.handlebars";
import * as expireMessageTemplate from "./../handlebars/pushnx/expired.message.handlebars";
import * as messageTemplate from "./../handlebars/pushnx/message.handlebars";

export class PushNotification {
    private pushnx;

    constructor(element, attachments: {authenticated: boolean}) {
        this.pushnx = new PushNX({
            lang: "en",
            islogin: attachments.authenticated,
            enable: false,
            modal: true,
            dismiss: true,
            counter: true,
            notify: true,
            action: false,
            template: {
                body: bodyTemplate,
                action: actionTemplate,
                message: messageTemplate,
                expirationDate: expireDateTemplate,
                expiredMessage: expireMessageTemplate,
                dismissAllMessage: dismissTemplate,
            },
        });

        this.pushnx.enable();
        this.pushnx.bindAction();
    }
}
