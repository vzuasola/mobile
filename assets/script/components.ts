import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {AccessDeniedComponent} from "@app/src/Component/Main/AccessDenied/script";
import {HeaderComponent} from "@app/src/Component/Header/script";
import {FooterComponent} from "@app/src/Component/Footer/script";
import {MenuComponent} from "@app/src/Component/Menu/script";
import {LoginComponent} from "@app/src/Component/Header/Login/script";
import {PromotionsComponent} from "@app/src/Component/Main/Promotions/script";
import {DownloadComponent} from "@app/src/Component/Main/Home/Download/script";
import {AnnouncementComponent} from "@app/src/Component/Announcement/script";
import {PushNotificationComponent} from "@app/src/Component/PushNotification/script";
import {SEOComponent} from "@app/src/Component/SEO/script";
import {HomeComponent} from "@app/src/Component/Main/Home/script";
import {MarketingComponent} from "@app/src/Component/Marketing/script";
import {SliderComponent} from "@app/src/Component/Main/Home/Slider/script";
import {ProductsComponent} from "@app/src/Component/Main/Home/Products/script";
import {NodeComponent} from "@app/src/Component/Node/script";
import {CasinoOptionComponent} from "@app/src/Component/CasinoOption/script";
import {LanguageComponent} from "@app/src/Component/Language/script";
import {ProfilerComponent} from "@app/src/Component/Profiler/script";

ComponentManager.setComponents({
    access_denied: new AccessDeniedComponent(),
    header: new HeaderComponent(),
    footer: new FooterComponent(),
    menu: new MenuComponent(),
    header_login: new LoginComponent(),
    promotions: new PromotionsComponent(),
    home_download: new DownloadComponent(),
    announcement: new AnnouncementComponent(),
    push_notification: new PushNotificationComponent(),
    seo: new SEOComponent(),
    home: new HomeComponent(),
    home_slider: new SliderComponent(),
    home_products: new ProductsComponent(),
    node: new NodeComponent(),
    casino_option: new CasinoOptionComponent(),
    language: new LanguageComponent(),
    marketing: new MarketingComponent(),
    profiler: new ProfilerComponent(),
});
