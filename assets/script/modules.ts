import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {AvayaModule} from "@app/src/Module/Avaya/script";
import {BalanceModule} from "@app/src/Module/Balance/script";
import {SessionModule} from "@app/src/Module/Session/script";
import {TokenParserModule} from "@app/src/Module/TokenParser/script";

import {GameIntegrationModule} from "@app/src/Module/GameIntegration/script";
import {PASModule} from "@app/src/Module/GameIntegration/PAS/script";
import {VoidbridgeModule} from "@app/src/Module/GameIntegration/Voidbridge/script";
import {MicroGamingModule} from "@app/src/Module/GameIntegration/MicroGaming/script";
import {SkywindModule} from "@app/src/Module/GameIntegration/Skywind/script";
import {SolidGamingModule} from "@app/src/Module/GameIntegration/SolidGaming/script";
import {CQ9Module} from "@app/src/Module/GameIntegration/CQ9/script";
/** @deprecated FlowGamingModule. */
import {FlowGamingModule} from "@app/src/Module/GameIntegration/FlowGaming/script";
import {OneGameModule} from "@app/src/Module/GameIntegration/OneGame/script";
import {SAGamingModule} from "@app/src/Module/GameIntegration/SAGaming/script";
import {PGSoftModule} from "@app/src/Module/GameIntegration/PGSoft/script";
import {AsiaGamingModule} from "@app/src/Module/GameIntegration/AsiaGaming/script";
import {GoldDeluxeModule} from "@app/src/Module/GameIntegration/GoldDeluxe/script";
import {RubyPlayModule} from "@app/src/Module/GameIntegration/RubyPlay/script";
import {EvolutionGamingModule} from "@app/src/Module/GameIntegration/EvolutionGaming/script";
import {EBetModule} from "@app/src/Module/GameIntegration/EBet/script";
import {GPIModule} from "@app/src/Module/GameIntegration/GPI/script";
import {GPIArcadeModule} from "@app/src/Module/GameIntegration/GPIArcade/script";
import {GPIKenoModule} from "@app/src/Module/GameIntegration/GPIKeno/script";
import {GPIPkModule} from "@app/src/Module/GameIntegration/GPIPk/script";
import {GPIThaiModule} from "@app/src/Module/GameIntegration/GPIThai/script";
import {GPISodeModule} from "@app/src/Module/GameIntegration/GPISode/script";
import {ExchangeLauncherModule} from "@app/src/Module/GameIntegration/ExchangeLauncher/script";
import {TGPModule} from "@app/src/Module/GameIntegration/TGP/script";
import {AllBetModule} from "@app/src/Module/GameIntegration/AllBet/script";
import {WACModule} from "@app/src/Module/GameIntegration/WAC/script";
import {EzugiGamingModule} from "@app/src/Module/GameIntegration/EzugiGaming/script";
import {VideoRacingModule} from "@app/src/Module/GameIntegration/VideoRacing/script";
import {FunGamingModule} from "@app/src/Module/GameIntegration/FunGaming/script";
import {KYGamingModule} from "@app/src/Module/GameIntegration/KYGaming/script";
import {LottolandModule} from "@app/src/Module/GameIntegration/Lottoland/script";
import {LoginRedirectModule} from "@app/src/Module/LoginRedirect/script";
import {ProductIntegrationModule} from "@app/src/Module/ProductIntegration/script";
import {GenericIntegrationModule} from "@app/src/Module/ProductIntegration/Generic/script";
import {ALSIntegrationModule} from "@app/src/Module/ProductIntegration/ALS/script";
import {OWSportsIntegrationModule} from "@app/src/Module/ProductIntegration/OWSports/script";
import {CasinoIntegrationModule} from "@app/src/Module/ProductIntegration/Casino/script";
import {ExchangeIntegrationModule} from "@app/src/Module/ProductIntegration/Exchange/script";
import {GamesIntegrationModule} from "@app/src/Module/ProductIntegration/Games/script";
import {LiveDealerIntegrationModule} from "@app/src/Module/ProductIntegration/LiveDealer/script";
import {ArcadeIntegrationModule} from "@app/src/Module/ProductIntegration/Arcade/script";
import {LotteryIntegrationModule} from "@app/src/Module/ProductIntegration/Lottery/script";
import {SodaCasinoIntegrationModule} from "@app/src/Module/ProductIntegration/SodaCasino/script";
import {PartnerMatrixModule} from "@app/src/Module/PartnerMatrix/script";
import {JSystemModule} from "@app/src/Module/GameIntegration/JSystem/script";
import {OpusModule} from "@app/src/Module/GameIntegration/Opus/script";
import {FGHubGamingModule} from "@app/src/Module/GameIntegration/FGHubGaming/script";

ComponentManager.setModules({
    avaya: new AvayaModule(),
    balance: new BalanceModule(),
    session: new SessionModule(),
    token_parser: new TokenParserModule(),
    game_integration: new GameIntegrationModule(),
    pas_integration: new PASModule(),
    voidbridge_integration: new VoidbridgeModule(),
    skywind_integration: new SkywindModule(),
    solidgaming_integration: new SolidGamingModule(),
    cq9_integration: new CQ9Module(),
    microgaming_integration: new MicroGamingModule(),
    flowgaming_integration: new FlowGamingModule(), /** @deprecated FlowGamingModule. */
    onegame_integration: new OneGameModule(),
    sagaming_integration: new SAGamingModule(),
    pgsoft_integration: new PGSoftModule(),
    asiagaming_integration: new AsiaGamingModule(),
    rubyplay_integration: new RubyPlayModule(),
    evolution_gaming_integration: new EvolutionGamingModule(),
    ebet_integration: new EBetModule(),
    gpi_integration: new GPIModule(),
    gpi_arcade_integration: new GPIArcadeModule(),
    gpi_keno_integration: new GPIKenoModule(),
    gpi_pk_integration: new GPIPkModule(),
    gpi_thai_integration: new GPIThaiModule(),
    gpi_sode_integration: new GPISodeModule(),
    exchange_launcher_integration: new ExchangeLauncherModule(),
    tgp_integration: new TGPModule(),
    allbet_integration: new AllBetModule(),
    wac_integration: new WACModule(),
    jsystem_integration: new JSystemModule(),
    ezugi_gaming_integration: new EzugiGamingModule(),
    videoracing_integration: new VideoRacingModule(),
    fun_gaming_integration: new FunGamingModule(),
    ky_gaming_integration: new KYGamingModule(),
    lottoland_integration: new LottolandModule(),
    opus_integration: new OpusModule(),
    login_redirect: new LoginRedirectModule(),
    product_integration: new ProductIntegrationModule(),
    generic_integration: new GenericIntegrationModule(),
    owsports_integration: new OWSportsIntegrationModule(),
    als_integration: new ALSIntegrationModule(),
    casino_integration: new CasinoIntegrationModule(),
    exchange_integration: new ExchangeIntegrationModule(),
    gold_deluxe_integration: new GoldDeluxeModule(),
    games_integration: new GamesIntegrationModule(),
    live_dealer_integration: new LiveDealerIntegrationModule(),
    arcade_integration: new ArcadeIntegrationModule(),
    lottery_integration: new LotteryIntegrationModule(),
    soda_casino_integration: new SodaCasinoIntegrationModule(),
    partner_matrix: new PartnerMatrixModule(),
    fghub_gaming_integration: new FGHubGamingModule(),
});
