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
     * @var App\Player\PlayerSession
     */
    private $playerSession;

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
            $casinoConfigs = $this->configs->getConfig('mobile_casino.casino_configuration');

            $data['title'] = $casinoConfigs['title'];
        } catch (\Exception $e) {
            $data['title'] = '';
        }
        return $data;
    }
}
