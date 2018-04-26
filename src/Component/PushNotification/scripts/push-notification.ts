import pushNotification from "@core/assets/js/components/push-notification";

import pushnxExpiredMessage from "./../handlebars/pushnx/expired.message.handlebars";
import pushnxExpirationDate from "./../handlebars/pushnx/expiration.date.handlebars";
import pushnxBody from "./../handlebars/pushnx/body.handlebars";
import pushnxAction from "./../handlebars/pushnx/action.handlebars";
import pushnxMessage from "./../handlebars/pushnx/message.handlebars";
import pushnxDismissMessage from "./../handlebars/pushnx/dismiss.message.handlebars";

export class PushNotification {
    private pushnx;

    constructor(element, attachments: {authenticated: boolean}) {
        this.pushnx = new pushNotification({
            lang: 'en',
            islogin: attachments.authenticated,
            enable: false, // start pushnx - default value true
            modal: true, // use modal - default value true
            template: { // override templates
                body: pushnxBody, // body
                action: pushnxAction, // action
                message: pushnxMessage, // message
                expirationDate: pushnxExpirationDate, // expiration date
                expiredMessage: pushnxExpiredMessage, // expired error message
                dismissAllMessage: pushnxDismissMessage // dismiss all message
            },
            dismiss: true, // dismiss all message - default value false
            counter: true, // message counter custom event "pnxCountMessage"
            notify: true, // new message indicator custom event "pnxNewMessage"
            action: false // bind message action buttons - default value true - you can also override by using custom event "pnxAction"
        });
    }
}
