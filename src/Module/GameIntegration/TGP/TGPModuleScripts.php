<?php

namespace App\MobileEntry\Module\GameIntegration\TGP;

use App\Drupal\Config;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class TGPModuleScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $config;

    private $lang;

    const KEY = 'tgp';

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
        $this->config = $config->withProduct('mobile-live-dealer');
        $this->lang = $lang;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $tgpConfig =  $this->config->getConfig('webcomposer_config.icore_games_integration');

            $data = [
                'authenticated' => $this->playerSession->isLogin(),
                'lang' => $this->lang,
                'currencies' => explode(PHP_EOL, $tgpConfig[self::KEY . '_currency']),
                'languages' => Config::parse($tgpConfig[self::KEY . '_language_mapping'] ?? ''),
            ];
        } catch (\Exception $e) {
            $data = [];
        }

        return $data;
    }
}
