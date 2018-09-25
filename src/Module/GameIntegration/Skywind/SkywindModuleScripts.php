<?php

namespace App\MobileEntry\Module\GameIntegration\Skywind;

use App\Drupal\Config;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class SkywindModuleScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $config;

    private $lang;

    const KEY = 'skywind';

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
        $this->config = $config->withProduct('mobile-games');
        $this->lang = $lang;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {

        try {
            $config =  $this->config->getConfig('webcomposer_config.icore_games_integration');
            $providerMapping = Config::parse($config['game_provider_mapping'] ?? '');

            $data = [
                'authenticated' => $this->playerSession->isLogin(),
                'lang' => $this->lang,
                'currencies' => explode(PHP_EOL, $config[self::KEY . '_currency']),
                'languages' => Config::parse($config[self::KEY . '_language_mapping'] ?? ''),
                'providerName' => $providerMapping[self::KEY],
            ];
        } catch (\Exception $e) {
            $data = [];
        }

        return $data;
    }
}
