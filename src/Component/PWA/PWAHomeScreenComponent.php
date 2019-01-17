<?php

namespace App\MobileEntry\Component\PWA;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class PWAHomeScreenComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configs)
    {
        $this->configs = $configs;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/PWA/template.html.twig';
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
            $footerConfigs = $this->configs->getConfig('webcomposer_config.footer_configuration');
        } catch (\Exception $e) {
            $footerConfigs = [];
        }

        $data['mobile_pwa_add_homescreen'] = $footerConfigs['mobile_pwa_add_homescreen'] ?? 'Add Dafabet to Homescreen';

        return $data;
    }
}
