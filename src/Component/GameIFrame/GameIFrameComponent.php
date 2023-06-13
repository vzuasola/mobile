<?php

namespace App\MobileEntry\Component\GameIFrame;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class GameIFrameComponent implements ComponentWidgetInterface
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
     *
     */
    public function getTemplate()
    {
        return '@component/GameIFrame/template.html.twig';
    }

    /**
     *
     */
    public function getData()
    {
        return [];
    }
}
