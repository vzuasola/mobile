<?php

namespace App\MobileEntry\Component\CasinoOption;

use App\Plugins\ComponentWidget\AsyncComponentInterface;

class CasinoOptionComponentAsync implements AsyncComponentInterface
{
    /**
     * @var App\Fetcher\AsyncDrupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Fetcher\AsyncIntegration\PreferencesFetcher
     */
    private $preferences;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher_async'),
            $container->get('preferences_fetcher_async')
        );
    }

    /**
     *
     */
    public function __construct($configs, $preferences)
    {
        $this->configs = $configs;
        $this->preferences = $preferences;
    }

    /**
     *
     */
    public function getDefinitions()
    {
        return [
            $this->configs->getConfig('mobile_casino.casino_configuration'),
            $this->configs->getConfig('webcomposer_config.header_configuration'),
            $this->preferences->getPreferences(),
        ];
    }
}
