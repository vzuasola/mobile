<?php

namespace App\MobileEntry\Component\Announcement;

use App\Plugins\ComponentWidget\AsyncComponentInterface;

class AnnouncementComponentAsync implements AsyncComponentInterface
{
    /**
     * @var App\Fetcher\Drupal\ViewsFetcher
     */
    private $viewsFetcher;

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
    public function __construct($viewsFetcher)
    {
        $this->viewsFetcher = $viewsFetcher;
    }

    /**
     *
     */
    public function getDefinitions()
    {
        return [
            $this->viewsFetcher->getViewById('announcements'),
        ];
    }
}
