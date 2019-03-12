import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {AvayaModule} from "@app/src/Module/Avaya/script";
import {BalanceModule} from "@app/src/Module/Balance/script";
import {SessionModule} from "@app/src/Module/Session/script";

import {GameIntegrationModule} from "@app/src/Module/GameIntegration/script";
import {PASModule} from "@app/src/Module/GameIntegration/PAS/script";
import {VoidbridgeModule} from "@app/src/Module/GameIntegration/Voidbridge/script";
import {MicroGamingModule} from "@app/src/Module/GameIntegration/MicroGaming/script";
import {SkywindModule} from "@app/src/Module/GameIntegration/Skywind/script";
import {SolidGamingModule} from "@app/src/Module/GameIntegration/SolidGaming/script";
import {CQ9Module} from "@app/src/Module/GameIntegration/CQ9/script";
import {FlowGamingModule} from "@app/src/Module/GameIntegration/FlowGaming/script";
import {SAGamingModule} from "@app/src/Module/GameIntegration/SAGaming/script";

import {LoginRedirectModule} from "@app/src/Module/LoginRedirect/script";
import {ProductIntegrationModule} from "@app/src/Module/ProductIntegration/script";
import {GenericIntegrationModule} from "@app/src/Module/ProductIntegration/Generic/script";
import {ALSIntegrationModule} from "@app/src/Module/ProductIntegration/ALS/script";
import {OWSportsIntegrationModule} from "@app/src/Module/ProductIntegration/OWSports/script";
import {CasinoIntegrationModule} from "@app/src/Module/ProductIntegration/Casino/script";
import {ExchangeIntegrationModule} from "@app/src/Module/ProductIntegration/Exchange/script";
import {GamesIntegrationModule} from "@app/src/Module/ProductIntegration/Games/script";

ComponentManager.setModules({
    avaya: new AvayaModule(),
    balance: new BalanceModule(),
    session: new SessionModule(),
    game_integration: new GameIntegrationModule(),
    pas_integration: new PASModule(),
    voidbridge_integration: new VoidbridgeModule(),
    skywind_integration: new SkywindModule(),
    solidgaming_integration: new SolidGamingModule(),
    cq9_integration: new CQ9Module(),
    microgaming_integration: new MicroGamingModule(),
    flowgaming_integration: new FlowGamingModule(),
    sagaming_integration: new SAGamingModule(),
    login_redirect: new LoginRedirectModule(),
    product_integration: new ProductIntegrationModule(),
    generic_integration: new GenericIntegrationModule(),
    owsports_integration: new OWSportsIntegrationModule(),
    als_integration: new ALSIntegrationModule(),
    casino_integration: new CasinoIntegrationModule(),
    exchange_integration: new ExchangeIntegrationModule(),
    games_integration: new GamesIntegrationModule(),
});
