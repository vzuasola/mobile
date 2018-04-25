<?php

namespace App\MobileEntry\Component\Announcement;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class AnnouncementComponent implements ComponentWidgetInterface
{

    private $viewsFetcher;

    /**
     *  Defines the container that can be used to fetch data
     *  from Drupal
     */
    public static function create($container)
    {
        return new static (
            $container->get('views_fetcher')
        );
    }

    /**
     *  Defines the container that can be used to fetch data 
     *  from Drupal
     */
    public function __construct($views_fetcher)
    {
        $this->viewsFetcher = $views_fetcher;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Announcement/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()    
    {           
        $data = $this->viewsFetcher->getViewById('announcements');

        return $data;
    }

}
