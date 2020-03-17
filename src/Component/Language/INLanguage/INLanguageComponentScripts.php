<?php

namespace App\MobileEntry\Component\Language\INLanguage;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class INLanguageComponentScripts implements ComponentAttachmentInterface
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    private $currentLanguage;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $ip;

    private $preference;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('lang'),
            $container->get('player_session'),
            $container->get('preferences_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configs, $currentLanguage, $playerSession, $preference)
    {
        $this->configs = $configs;
        $this->currentLanguage = $currentLanguage;
        $this->playerSession = $playerSession;
        $this->preference = $preference;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $entrypageConfigs = $this->configs->getConfig('mobile_entrypage.entrypage_configuration');
        } catch (\Exception $e) {
            $entrypageConfigs = [];
        }

        return [
            'currentLanguage' => $this->currentLanguage,
            'authenticated' => $this->playerSession->isLogin(),
            'langEnabled' => $entrypageConfigs['enable_popup_in_language'] ?? true
        ];
    }
}
