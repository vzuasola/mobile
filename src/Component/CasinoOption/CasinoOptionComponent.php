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
            $data['preferred'] = 'casino';
            $casinoConfigs = $this->configs->getConfig('mobile_casino.casino_configuration');
            $preferredCasino = $this->preferences->getPreferences();

            if ($preferredCasino['casino.preferred']) {
                $data['preferred'] = $preferredCasino['casino.preferred'];
            }

            $data['title'] = $casinoConfigs['title'];
            $data['casino_text'] = $casinoConfigs['casino_text'];
            $data['casino_gold_text'] = $casinoConfigs['casino_gold_text'];
            $data['maintenance_text'] = $casinoConfigs['maintenance_text'];
        } catch (\Exception $e) {
            $data['title'] = 'Please select your preferred casino';
            $data['casino_text'] = 'Casino Classic';
            $data['casino_gold_text'] = 'Casino Gold';
            $data['maintenance_text'] = 'Under Maintenance';
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
