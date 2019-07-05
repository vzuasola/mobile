<?php

namespace App\MobileEntry\Component\MarketingSpace;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class MarketingSpaceComponentScripts implements ComponentAttachmentInterface
{
    private $configs;
    private $views;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('views_fetcher')
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
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $configs = $this->views->getViewById('marketing_space');
        } catch (\Exception $e) {
            $configs = [];
        }

        return $configs;
    }
}
