<?php

namespace App\MobileEntry\Module\GameIntegration\PAS;

use App\Plugins\ComponentWidget\ComponentIncludesInterface;

class PASModuleIncludes implements ComponentIncludesInterface
{
    private $config;

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
    public function __construct($config)
    {
        $this->config = $config;
    }
    /**
     * @{inheritdoc}
     */
    public function getIncludes()
    {
        try {
            $ptConfig = $this->config->getConfig('webcomposer_config.games_playtech_provider');
        } catch (\Exception $e) {
            $ptConfig = [];
        }

        $scripts[] = $ptConfig['javascript_assets'] ?? null;

        return $scripts;
    }
}
