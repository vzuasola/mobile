import * as utility from '@core/assets/js/components/utility';

import pushNotification from "@core/assets/js/components/push-notification";

import {pushnxExpiredMessage} from "@app/src/Component/PushNotification/templates/pushnx/expired.message.handlebars";
import {pushnxExpirationDate} from "@app/src/Component/PushNotification/templates/pushnx/expiration.date.handlebars";
import {pushnxBody} from "@app/src/Component/PushNotification/templates/pushnx/body.handlebars";
import {pushnxAction} from "@app/src/Component/PushNotification/templates/pushnx/action.handlebars";
import {pushnxMessage} from "@app/src/Component/PushNotification/templates/pushnx/message.handlebars";
import {pushnxDismissMessage} from "@app/src/Component/PushNotification/templates/pushnx/dismiss.message.handlebars";

export default function push_notification(component, attachments) {
    var pushNx = new pushNotification({
        lang: 'en',
        islogin: true,
        enable: false, // start pushnx - default value true
        modal: false, // use modal - default value true
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

    pushNx.enable();
    pushNx.bindAction();
}
