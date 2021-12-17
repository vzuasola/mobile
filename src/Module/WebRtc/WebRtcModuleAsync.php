<?php

namespace App\MobileEntry\Module\WebRtc;

use App\Plugins\ComponentWidget\AsyncComponentInterface;

class WebRtcModuleAsync implements AsyncComponentInterface
{
    /**
     * @var App\Fetcher\AsyncDrupal\ConfigFetcher
     */
    private $configs;

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
    public function __construct($configs, $views)
    {
        $this->configs = $configs;
        $this->views = $views;
    }

    /**
     *
     */
    public function getDefinitions()
    {
        return [
            $this->configs->getConfig('webcomposer_config.avaya_configuration'),
        ];
    }
}
