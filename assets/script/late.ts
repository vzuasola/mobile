import {AccessDeniedComponent} from "@app/src/Component/Main/AccessDenied/script";
import {MaintenanceComponent} from "@app/src/Component/Main/Maintenance/script";
import {ContactUsComponent} from "@app/src/Component/Main/Lobby/Home/ContactUs/script";
import {GamesLobbyComponent} from "@app/src/Component/Main/Lobby/GamesLobby/script";
import {LiveDealerLobbyComponent} from "@app/src/Component/Main/Lobby/LiveDealerLobby/script";
import {ArcadeLobbyComponent} from "@app/src/Component/Main/Lobby/ArcadeLobby/script";
import {CasinoLobbyComponent} from "@app/src/Component/Main/Lobby/CasinoLobby/script";
import {LotteryLobbyComponent} from "@app/src/Component/Main/Lobby/LotteryLobby/script";
import {SodaCasinoLobbyComponent} from "@app/src/Component/Main/Lobby/SodaCasinoLobby/script";
import {CantLoginComponent} from "@app/src/Component/Main/CantLogin/script";
import {BasicPageComponent} from "@app/src/Component/Node/BasicPage/script";
import {CantLoginForgotPasswordComponent} from "@app/src/Component/Main/CantLogin/ForgotPassword/script";
import {CantLoginForgotUsernameComponent} from "@app/src/Component/Main/CantLogin/ForgotUsername/script";
import {CantLoginResetPasswordComponent} from "@app/src/Component/Main/CantLogin/ResetPassword/script";
import {MyAccountComponent} from "@app/src/Component/Main/MyAccount/script";
import {ContactUsFormComponent} from "@app/src/Component/Main/ContactUsForm/script";
import {MyAccountProfileComponent} from "@app/src/Component/Main/MyAccount/Profile/script";
import {MyAccountProfileVerifyPasswordComponent} from "@app/src/Component/Main/MyAccount/Profile/VerifyPassword/script";
import {MyAccountChangePasswordComponent} from "@app/src/Component/Main/MyAccount/ChangePassword/script";
import {VirtualsLobbyComponent} from "@app/src/Component/Main/Lobby/VirtualsLobby/script";
import {PTPlusLobbyComponent} from "@app/src/Component/Main/Lobby/PTPlusLobby/script";

console.log("Late script is loaded!");
// @ts-ignore
const componentManager = window.myComponentManager;
componentManager.logComponents();

const lateComponents = {
    access_denied: new AccessDeniedComponent(),
    maintenance: new MaintenanceComponent(),
    home_contactus: new ContactUsComponent(),
    games_lobby: new GamesLobbyComponent(),
    live_dealer_lobby: new LiveDealerLobbyComponent(),
    arcade_lobby: new ArcadeLobbyComponent(),
    casino_lobby: new CasinoLobbyComponent(),
    virtuals_lobby: new VirtualsLobbyComponent(),
    lottery_lobby: new LotteryLobbyComponent(),
    soda_casino_lobby: new SodaCasinoLobbyComponent(),
    cant_login: new CantLoginComponent(),
    node_basic_page: new BasicPageComponent(),
    cant_login_forgot_password: new CantLoginForgotPasswordComponent(),
    cant_login_forgot_username: new CantLoginForgotUsernameComponent(),
    cant_login_reset_password: new CantLoginResetPasswordComponent(),
    my_account: new MyAccountComponent(),
    contact_us: new ContactUsFormComponent(),
    profile: new MyAccountProfileComponent(),
    profile_verify_password: new MyAccountProfileVerifyPasswordComponent(),
    change_password: new MyAccountChangePasswordComponent(),
    ptplus_lobby: new PTPlusLobbyComponent(),
};

componentManager.logComponents("BEFORE");

componentManager.setAndInitLateComponent(lateComponents);

componentManager.logComponents("AFTER");
