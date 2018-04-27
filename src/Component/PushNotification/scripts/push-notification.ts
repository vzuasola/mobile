import PushNX from "@core/assets/js/components/push-notification";

import * as expireMessageTemplate from "./../handlebars/pushnx/expired.message.handlebars";
import * as expireDateTemplate from "./../handlebars/pushnx/expiration.date.handlebars";
import * as bodyTemplate from "./../handlebars/pushnx/body.handlebars";
import * as actionTemplate from "./../handlebars/pushnx/action.handlebars";
import * as messageTemplate from "./../handlebars/pushnx/message.handlebars";
import * as dismissTemplate from "./../handlebars/pushnx/dismiss.message.handlebars";

export class PushNotification {
    private pushnx;

    constructor(element, attachments: {authenticated: boolean}) {
        this.pushnx = new PushNX({
            lang: 'en',
            islogin: attachments.authenticated,
            enable: false, // start pushnx - default value true
            modal: true, // use modal - default value true
            dismiss: true, // dismiss all message - default value false
            counter: true, // message counter custom event "pnxCountMessage"
            notify: true, // new message indicator custom event "pnxNewMessage"
            action: false, // bind message action buttons - default value true - you can also override by using custom event "pnxAction"
            template: { // override templates
                body: bodyTemplate, // body
                action: actionTemplate, // action
                message: messageTemplate, // message
                expirationDate: expireDateTemplate, // expiration date
                expiredMessage: expireMessageTemplate, // expired error message
                dismissAllMessage: dismissTemplate // dismiss all message
            },
        });

        this.pushnx.enable();
        this.pushnx.bindAction();
    }
}
