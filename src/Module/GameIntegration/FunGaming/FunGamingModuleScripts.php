<?php

namespace App\MobileEntry\Module\GameIntegration\FunGaming;

use App\Drupal\Config;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class FunGamingModuleScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $config;

    private $lang;

    const KEY = 'fun_gaming';

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
        $this->config = $config->withProduct('mobile-arcade');
        $this->lang = $lang;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $funGamingConfig =  $this->config->getConfig('webcomposer_config.icore_games_integration');

            $data = [
                'authenticated' => $this->playerSession->isLogin(),
                'lang' => $this->lang,
                'currencies' => explode(PHP_EOL, $funGamingConfig[self::KEY . '_currency']),
                'languages' => Config::parse($funGamingConfig[self::KEY . '_language_mapping'] ?? ''),
            ];
        } catch (\Exception $e) {
            $data = [];
        }

        return $data;
    }
}
