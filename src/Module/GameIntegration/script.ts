import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";

import {GameLauncher} from "./scripts/game-launcher";

export class GameIntegrationModule implements ModuleInterface {
    private gameLauncher;

    constructor() {
        this.gameLauncher = GameLauncher;
    }

    onLoad(attachments: {}) {
        const pas: any = ComponentManager.getModuleInstance("pas_integration");
        const microGaming: any = ComponentManager.getModuleInstance("microgaming_integration");
        const voidbridge: any = ComponentManager.getModuleInstance("voidbridge_integration");
        const skywind: any = ComponentManager.getModuleInstance("skywind_integration");
        const solidgaming: any = ComponentManager.getModuleInstance("solidgaming_integration");
        const cq9: any = ComponentManager.getModuleInstance("cq9_integration");
        const flowGaming: any = ComponentManager.getModuleInstance("flowgaming_integration");
        const oneGame: any = ComponentManager.getModuleInstance("onegame_integration");
        const saGaming: any = ComponentManager.getModuleInstance("sagaming_integration");
        const pgSoft: any = ComponentManager.getModuleInstance("pgsoft_integration");
        const asiaGaming: any = ComponentManager.getModuleInstance("asiagaming_integration");
        const goldDeluxe: any = ComponentManager.getModuleInstance("gold_deluxe_integration");
        const rubyPlay: any = ComponentManager.getModuleInstance("rubyplay_integration");
        const evoGaming: any = ComponentManager.getModuleInstance("evolution_gaming_integration");
        const eBet: any = ComponentManager.getModuleInstance("ebet_integration");
        const gpi: any = ComponentManager.getModuleInstance("gpi_integration");
        const gpiArcade: any = ComponentManager.getModuleInstance("gpi_arcade_integration");
        const gpiKeno: any = ComponentManager.getModuleInstance("gpi_keno_integration");
        const gpiPk: any = ComponentManager.getModuleInstance("gpi_pk_integration");
        const gpiThai: any = ComponentManager.getModuleInstance("gpi_thai_integration");
        const gpiSode: any = ComponentManager.getModuleInstance("gpi_sode_integration");
        const exchangeLauncher: any = ComponentManager.getModuleInstance("exchange_launcher_integration");
        const tgp: any = ComponentManager.getModuleInstance("tgp_integration");
        const allbet: any = ComponentManager.getModuleInstance("allbet_integration");
        const wac: any = ComponentManager.getModuleInstance("wac_integration");
        const jsystem: any = ComponentManager.getModuleInstance("jsystem_integration");
        const ezugiGaming: any = ComponentManager.getModuleInstance("ezugi_gaming_integration");
        const videoRacing: any = ComponentManager.getModuleInstance("videoracing_integration");
        const funGaming: any = ComponentManager.getModuleInstance("fun_gaming_integration");
        const kyGaming: any = ComponentManager.getModuleInstance("ky_gaming_integration");
        const lottoland: any = ComponentManager.getModuleInstance("lottoland_integration");
        const opus: any = ComponentManager.getModuleInstance("opus_integration");
        this.gameLauncher.setProvider("pas", pas);
        this.gameLauncher.setProvider("micro_gaming", microGaming);
        this.gameLauncher.setProvider("solid_gaming", solidgaming);
        this.gameLauncher.setProvider("cq9", cq9);
        this.gameLauncher.setProvider("voidbridge", voidbridge);
        this.gameLauncher.setProvider("skywind", skywind);
        this.gameLauncher.setProvider("flow_gaming", flowGaming);
        this.gameLauncher.setProvider("onegame", oneGame);
        this.gameLauncher.setProvider("sa_gaming", saGaming);
        this.gameLauncher.setProvider("pgsoft", pgSoft);
        this.gameLauncher.setProvider("asia_gaming", asiaGaming);
        this.gameLauncher.setProvider("gold_deluxe", goldDeluxe);
        this.gameLauncher.setProvider("ruby_play", rubyPlay);
        this.gameLauncher.setProvider("evo_gaming", evoGaming);
        this.gameLauncher.setProvider("ebet", eBet);
        this.gameLauncher.setProvider("gpi", gpi);
        this.gameLauncher.setProvider("gpi_arcade", gpiArcade);
        this.gameLauncher.setProvider("gpi_keno", gpiKeno);
        this.gameLauncher.setProvider("gpi_pk", gpiPk);
        this.gameLauncher.setProvider("gpi_thai", gpiThai);
        this.gameLauncher.setProvider("gpi_sode", gpiSode);
        this.gameLauncher.setProvider("exchange_launcher", exchangeLauncher);
        this.gameLauncher.setProvider("tgp", tgp);
        this.gameLauncher.setProvider("allbet", allbet);
        this.gameLauncher.setProvider("wac", wac);
        this.gameLauncher.setProvider("jsystem", jsystem);
        this.gameLauncher.setProvider("ezugi_gaming", ezugiGaming);
        this.gameLauncher.setProvider("video_racing", videoRacing);
        this.gameLauncher.setProvider("fun_gaming", funGaming);
        this.gameLauncher.setProvider("ky_gaming", kyGaming);
        this.gameLauncher.setProvider("lottoland", lottoland);
        this.gameLauncher.setProvider("opus", opus);

        setTimeout(() => {
            this.gameLauncher.init();
        }, 20);
    }
}
