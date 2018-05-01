import * as utility from "@core/assets/js/components/utility";

import PushNX from "@core/assets/js/components/push-notification";

import * as actionTemplate from "./../handlebars/pushnx/action.handlebars";
import * as bodyTemplate from "./../handlebars/pushnx/body.handlebars";
import * as dismissTemplate from "./../handlebars/pushnx/dismiss.message.handlebars";
import * as expireDateTemplate from "./../handlebars/pushnx/expiration.date.handlebars";
import * as expireMessageTemplate from "./../handlebars/pushnx/expired.message.handlebars";
import * as messageTemplate from "./../handlebars/pushnx/message.handlebars";

export class PushNotification {
    private pushnx;

    constructor(element, attachments: {authenticated: boolean, pushnx: object}) {
        console.log(attachments);
        this.pushnx = new PushNX({
            lang: "en",
            islogin: attachments.authenticated,
            enable: true, // start pushnx - default value true
            scrollbot: false, // use default scrollbot library
            modal: true, // use modal - default value true
            dismiss: true, // dismiss all message - default value false
            counter: true, // message counter custom event "pnxCountMessage"
            notify: true, // new message indicator custom event "pnxNewMessage"
            action: true, // bind message action buttons - default value true - you can also override by using custom event "pnxAction"
            template: { // override templates
                body: bodyTemplate, // body
                action: actionTemplate, // action
                message: messageTemplate, // message
                expirationDate: expireDateTemplate, // expiration date
                expiredMessage: expireMessageTemplate, // expired error message
                dismissAllMessage: dismissTemplate // dismiss all message
            },
            config: attachments.pushnx
        });

        // this.pushnx.enable();
        // this.pushnx.bindAction();

        // listen to session
        utility.listen(document, "session.logout", (event) => {
            this.pushnx.bindCloseService(); // close socket connection
        });
    }
}
