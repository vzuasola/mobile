<?php

namespace App\MobileEntry\Module\GameIntegration\GPIThai;

use App\Drupal\Config;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class GPIThaiModuleScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $config;

    private $lang;

    const KEY = 'gpi_thai';

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
            $gpiConfig =  $this->config->getConfig('webcomposer_config.games_gpi_provider');

            $data = [
                'currencies' => explode(PHP_EOL, $gpiConfig['gpi_thai_lottey_currency']),
                'languages' => Config::parse($gpiConfig['gpi_thai_lottey_language_mapping'] ?? ''),
            ];
        } catch (\Exception $e) {
            $data = [];
        }

        return $data;
    }
}
