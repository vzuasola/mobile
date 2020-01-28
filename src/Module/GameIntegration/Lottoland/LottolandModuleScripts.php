<?php

namespace App\MobileEntry\Module\GameIntegration\Lottoland;

use App\Drupal\Config;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class LottolandModuleScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $config;

    private $lang;

    const KEY = 'lottoland';

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
        $this->config = $config->withProduct('mobile-lottery');
        $this->lang = $lang;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $lottoland =  $this->config->getConfig('webcomposer_config.icore_games_integration');

            $data = [
                'authenticated' => $this->playerSession->isLogin(),
                'lang' => $this->lang,
                'currencies' => explode(PHP_EOL, $lottoland[self::KEY . '_currency']),
                'languages' => Config::parse($lottoland[self::KEY . '_language_mapping'] ?? ''),
                'script' => $lottoland[self::KEY . '_javascript_assets'],
            ];
        } catch (\Exception $e) {
            $data = [];
        }

        return $data;
    }
}
