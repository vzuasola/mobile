<?php

namespace App\MobileEntry\Component\CasinoOption;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class CasinoOptionComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var \App\Fetcher\Integration\PreferencesFetcher
     */
    private $preferences;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('preferences_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configs, $preferences)
    {
        $this->configs = $configs;
        $this->preferences = $preferences;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/CasinoOption/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];

        try {
            $data['preferred'] = '';
            $casinoConfigs = $this->configs->getConfig('mobile_casino.casino_configuration');
            $preferredCasino = $this->preferences->getPreferences();

            if ($preferredCasino['casino.preferred']) {
                $data['preferred'] = $preferredCasino['casino.preferred'];
            }

            $data['title'] = $casinoConfigs['title'];
        } catch (\Exception $e) {
            $data['title'] = '';
        }

        try {
            $headerConfigs = $this->configs->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $headerConfigs = [];
        }

        $data['logo_title'] = $headerConfigs['logo_title'] ?? 'Dafabet';

        return $data;
    }
}
