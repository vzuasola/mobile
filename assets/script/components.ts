import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {AccessDeniedComponent} from "@app/src/Component/Main/AccessDenied/script";
import {HeaderComponent} from "@app/src/Component/Header/script";
import {MenuComponent} from "@app/src/Component/Header/Menu/script";
import {LoginComponent} from "@app/src/Component/Header/Login/script";
import {PromotionsComponent} from "@app/src/Component/Main/Promotions/script";
import {FooterComponent} from "@app/src/Component/Footer/script";
import {AnnouncementComponent} from "@app/src/Component/Announcement/script";
import {PushNotificationComponent} from "@app/src/Component/PushNotification/script";
import {SEOComponent} from "@app/src/Component/SEO/script";
import {SliderComponent} from "@app/src/Component/Main/Home/Slider/script";
import {ProductsComponent} from "@app/src/Component/Main/Home/Products/script";
import {CasinoOptionComponent} from "@app/src/Component/CasinoOption/script";
import {LanguageComponent} from "@app/src/Component/Language/script";

ComponentManager.setComponents({
    access_denied: new AccessDeniedComponent(),
    header: new HeaderComponent(),
    header_menu: new MenuComponent(),
    header_login: new LoginComponent(),
    promotions: new PromotionsComponent(),
    footer: new FooterComponent(),
    announcement: new AnnouncementComponent(),
    push_notification: new PushNotificationComponent(),
    seo: new SEOComponent(),
    home_slider: new SliderComponent(),
    home_products: new ProductsComponent(),
    casino_option: new CasinoOptionComponent(),
    language: new LanguageComponent(),
});
