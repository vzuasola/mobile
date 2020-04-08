<?php

namespace App\MobileEntry\Module\GameIntegration\ExchangeLauncher;

use App\Drupal\Config;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class ExchangeLauncherModuleScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $config;

    private $lang;

    const KEY = 'exchange_launcher';

    const SUPPORTED_LANGUAGE = [
        'en', 'in', 'te', 'hi'
    ];

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('lang')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $config, $lang)
    {
        $this->playerSession = $playerSession;
        $this->config = $config->withProduct('mobile-exchange');
        $this->lang = $lang;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $data = [];
        try {
            if (in_array($this->lang, $this::SUPPORTED_LANGUAGE)) {
                $exchangeConfig =  $this->config->getConfig('webcomposer_config.games_exchange_provider');

                $data = [
                    'currencies' => explode(PHP_EOL, $exchangeConfig['currency']),
                    'languages' => Config::parse($exchangeConfig['languages'] ?? ''),
                ];
            }
        } catch (\Exception $e) {
            $data = [];
        }

        return $data;
    }
}
