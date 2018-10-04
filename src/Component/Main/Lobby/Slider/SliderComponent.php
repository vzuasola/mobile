<?php

namespace App\MobileEntry\Component\Main\Lobby\Slider;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class SliderComponent implements ComponentWidgetInterface
{
     /**
     * @var App\Fetcher\Drupal\ViewsFetcher
     */
    private $viewsFetcher;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $product;


    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Lobby/Slider/template.html.twig';
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
