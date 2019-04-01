<?php

namespace App\MobileEntry\Module\GameIntegration\PAS;

use App\Drupal\Config;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class PASModuleScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $config;

    private $lang;

    private $paymentAccount;

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
    public function __construct($playerSession, $config, $lang, $paymentAccount, $player)
    {
        $this->playerSession = $playerSession;
        $this->config = $config;
        $this->lang = $lang;
        $this->paymentAccount = $paymentAccount;
        $this->player = $player;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $ptConfig = $this->config->getConfig('webcomposer_config.games_playtech_provider');
            $currency = null;
            if ($this->playerSession->isLogin()) {
                $currency = $this->player->getCurrency();
            }
            $iapiConfigs = $ptConfig['iapiconf_override'] ?? [];
            if ($iapiConfigs) {
                $iapiConfigs = Config::parse($iapiConfigs);
                foreach ($iapiConfigs as $key => $config) {
                    $iapiConfigs[$key] = json_decode($config, true);
                }
            }
        } catch (\Exception $e) {
            $ptConfig = [];
        }

        return [
            'futurama' => $ptConfig['futurama_switch'] ?? false,
            'authenticated' => $this->playerSession->isLogin(),
            'username' => $this->playerSession->getUsername(),
            'currency' => $currency,
            'token' => $this->playerSession->getToken(),
            'iapiconfOverride' => [],
            'lang' => $this->lang ?? 'en',
            'langguageMap' => Config::parse($ptConfig['languages']),
            'iapiConfigs' => $iapiConfigs,
            'isGold' => ($this->playerSession->isLogin()) ? $this->paymentAccount->hasAccount('casino-gold') : false,
            'pasErrorConfig' => [
                'errorMap' => isset($ptConfig['error_mapping']) ? Config::parse($ptConfig['error_mapping']) : [],
                'errorTitle' => $ptConfig['error_header_title_text'] ?? '',
                'errorButton' => $ptConfig['error_button'],
            ],
        ];
    }
}
