<?php

namespace App\MobileEntry\Component\MarketingSpace;

use App\Plugins\ComponentWidget\AsyncComponentInterface;

class MarketingSpaceComponentAsync implements AsyncComponentInterface
{
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
            $container->get('views_fetcher_async')
        );
    }

    /**
     *
     */
    public function __construct($views)
    {
        $this->views = $views;
    }

    /**
     *
     */
    public function getDefinitions()
    {
        return [
            $this->views->getViewById('marketing_space'),
        ];
    }
}
