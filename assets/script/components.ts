import {ComponentManager} from "@core/src/Plugins/ComponentWidget/asset/component";

import {AccessDeniedComponent} from "@app/src/Component/Main/AccessDenied/script";
import {FooterComponent} from "@app/src/Component/Footer/script";
import {HeaderComponent} from "@app/src/Component/Header/script";
import {BacktotopComponent} from "@app/src/Component/Backtotop/script";
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
import {CantLoginComponent} from "@app/src/Component/Main/CantLogin/script";
import {PromotionsNodeComponent} from "@app/src/Component/Node/Promotions/script";
import {SessionComponent} from "@app/src/Component/Main/Session/script";
import { SessionLegacyComponent } from "@app/src/Component/Main/SessionLegacy/script";
import {CantLoginForgotPasswordComponent} from "@app/src/Component/Main/CantLogin/ForgotPassword/script";
import {CantLoginForgotUsernameComponent} from "@app/src/Component/Main/CantLogin/ForgotUsername/script";
import {CantLoginResetPasswordComponent} from "@app/src/Component/Main/CantLogin/ResetPassword/script";
import {MyAccountComponent} from "@app/src/Component/Main/MyAccount/script";
import {MyAccountProfileComponent} from "@app/src/Component/Main/MyAccount/Profile/script";
import {MyAccountChangePasswordComponent} from "@app/src/Component/Main/MyAccount/ChangePassword/script";

ComponentManager.setComponents({
    access_denied: new AccessDeniedComponent(),
    footer: new FooterComponent(),
    header: new HeaderComponent(),
    backtotop: new BacktotopComponent(),
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
    cant_login: new CantLoginComponent(),
    node_promotions: new PromotionsNodeComponent(),
    session: new SessionComponent(),
    session_legacy: new SessionLegacyComponent(),
    cant_login_forgot_password: new CantLoginForgotPasswordComponent(),
    cant_login_forgot_username: new CantLoginForgotUsernameComponent(),
    cant_login_reset_password: new CantLoginResetPasswordComponent(),
    my_account: new MyAccountComponent(),
    profile: new MyAccountProfileComponent(),
    change_password: new MyAccountChangePasswordComponent(),
});
