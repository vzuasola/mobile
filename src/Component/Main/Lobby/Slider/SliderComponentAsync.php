<?php

namespace App\MobileEntry\Component\Main\Lobby\Slider;

use App\Plugins\ComponentWidget\AsyncComponentInterface;

class SliderComponentAsync implements AsyncComponentInterface
{
    /**
     * @var App\Fetcher\AsyncDrupal\ConfigFetcher
     */
    private $config;

    /**
     * @var App\Fetcher\AsyncDrupal\ViewsFetcher
     */
    private $views;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher_async'),
            $container->get('views_fetcher_async')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($config, $views)
    {
        $this->config = $config;
        $this->views = $views;
    }

    /**
     * {@inheritdoc}
     */
    public function getDefinitions()
    {
        return [
            $this->views->getViewById('webcomposer_slider_v2'),
        ];
    }
}
