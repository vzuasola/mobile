<?php

namespace App\MobileEntry\Module\GameIntegration\PAS;

use App\Drupal\Config;

use App\MobileEntry\Services\Accounts\Accounts;
use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class PASModuleScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $config;

    private $lang;
    /**
     * @var $accountService Accounts
     */
    private $accountService;

    private $player;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('lang'),
            $container->get('accounts_service'),
            $container->get('player')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $config, $lang, $accountService, $player)
    {
        $this->playerSession = $playerSession;
        $this->config = $config;
        $this->lang = $lang;
        $this->accountService = $accountService;
        $this->player = $player;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $currency = null;
        try {
            $ptConfig = $this->config->getConfig('webcomposer_config.games_playtech_provider');
            $currency = null;
            $playerId = null;
            if ($this->playerSession->isLogin()) {
                $currency = $this->player->getCurrency();
                $playerId = $this->player->getPlayerID();
            }
            $iapiConfigs = $ptConfig['iapiconf_override'] ?? [];
            if ($iapiConfigs) {
                $iapiConfigs = Config::parse($iapiConfigs);
                foreach ($iapiConfigs as $key => $config) {
                    $iapiConfigs[$key] = json_decode($config, true);
                }
            }

            $scripts = $ptConfig['javascript_assets'] ?? null;
            if ($scripts) {
                $scripts = Config::parse($scripts);
                foreach ($scripts as $skey => $script) {
                    $scripts[$skey] = $script;
                }
            }
        } catch (\Exception $e) {
            $ptConfig = [];
        }

        return [
            'asset' => $scripts,
            'authenticated' => $this->playerSession->isLogin(),
            'username' => $this->playerSession->getUsername(),
            'playerId' => $playerId,
            'currency' => $currency,
            'token' => $this->playerSession->getToken(),
            'iapiconfOverride' => [],
            'lang' => $this->lang ?? 'en',
            'langguageMap' => Config::parse($ptConfig['languages']),
            'iapiConfigs' => $iapiConfigs,
            'isGold' => ($this->playerSession->isLogin()) ? $this->accountService->hasAccount('casino-gold') : false,
            'pasErrorConfig' => [
                'errorMap' => isset($ptConfig['error_mapping']) ? Config::parse($ptConfig['error_mapping']) : [],
                'errorTitle' => $ptConfig['error_header_title_text'] ?? '',
                'errorButton' => $ptConfig['error_button'] ?? '',
            ],
        ];
    }
}
