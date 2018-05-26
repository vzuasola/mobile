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
        $this->config = $config;
        $this->lang = $lang;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $ptConfig = $this->config->getConfig('webcomposer_config.games_playtech_provider');

            $iapiConfigs = $ptConfig['iapiconf_override'] ?? [];
            if ($iapiConfigs) {
                $iapiConfigs = Config::parse($iapiConfigs);
                foreach ($iapiConfigs as $key => $config) {
                    $iapiConfigs[$key] = (array) json_decode($config);
                }
            }
        } catch (\Exception $e) {
            $ptConfig = [];
        }
        return [
            'authenticated' => $this->playerSession->isLogin(),
            'iapiconfOverride' => [],
            'lang' => $this->lang ?? 'en',
            'langguageMap' => Config::parse($ptConfig['languages']),
            'iapiConfigs' => $iapiConfigs,
        ];
    }
}
