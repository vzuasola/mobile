import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {AnnouncementComponent} from "@app/src/Component/Announcement/script";
import {CasinoOptionComponent} from "@app/src/Component/CasinoOption/script";
import {FooterComponent} from "@app/src/Component/Footer/script";
import {BalanceComponent} from "@app/src/Component/Header/Balance/script";
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
    announcement: new AnnouncementComponent(),
    push_notification: new PushNotificationComponent(),
    language: new LanguageComponent(),
    balance: new BalanceComponent(),
    casino_option: new CasinoOptionComponent(),
});
