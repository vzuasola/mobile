<?php

namespace App\MobileEntry\Component\Main\Lobby\Home\Infobar;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class InfobarComponent implements ComponentWidgetInterface
{
    private $request;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    private $views;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('router_request'),
            $container->get('config_fetcher'),
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($request, $configs, $views)
    {
        $this->request = $request;
        $this->configs = $configs;
        $this->views = $views;
    }


    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Lobby/Home/Infobar/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        return [];
    }
}
