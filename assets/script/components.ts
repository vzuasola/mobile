import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {AnnouncementComponent} from "@app/src/Component/Announcement/script";
import {FooterComponent} from "@app/src/Component/Footer/script";

import {LoginComponent} from "@app/src/Component/Header/Login/script";
import {MenuComponent} from "@app/src/Component/Header/Menu/script";
import {HeaderComponent} from "@app/src/Component/Header/script";

import {LanguageComponent} from "@app/src/Component/Language/script";
import {ProductsComponent} from "@app/src/Component/Main/Home/Products/script";
import {SliderComponent} from "@app/src/Component/Main/Home/Slider/script";
import {PushNotificationComponent} from "@app/src/Component/PushNotification/script";

ComponentManager.setComponents({
    header: new HeaderComponent(),
    footer: new FooterComponent(),
    home_slider: new SliderComponent(),
    home_products: new ProductsComponent(),
    header_menu: new MenuComponent(),
    header_login: new LoginComponent(),
    announcement: new AnnouncementComponent(),
    push_notification: new PushNotificationComponent(),
    language: new LanguageComponent(),
});
