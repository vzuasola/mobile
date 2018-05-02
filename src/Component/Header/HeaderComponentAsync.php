<?php

namespace App\MobileEntry\Component\Header;

use App\Plugins\ComponentWidget\AsyncComponentInterface;

class HeaderComponentAsync implements AsyncComponentInterface
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
            $container->get('config_fetcher_async')
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
    public function getDefinitions()
    {
        return [
            $this->configs->getConfig('webcomposer_config.header_configuration'),
            $this->configs->getConfig('webcomposer_config.login_configuration'),
        ];
    }
}
