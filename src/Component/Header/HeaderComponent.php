<?php

namespace App\MobileEntry\Component\Header;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class HeaderComponent implements ComponentWidgetInterface
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
        return '@component/Header/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];
        $header_configs = $this->configs->getGeneralConfigById('header_configuration');
        $data['is_front'] = true;
        $data['header']['logo_title'] = $header_configs['logo_title'];

        return $data;
    }
}
