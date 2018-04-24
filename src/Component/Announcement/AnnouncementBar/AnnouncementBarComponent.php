<?php

namespace App\MobileEntry\Component\Announcement\AnnouncementBar;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class AnnouncementBarComponent implements ComponentWidgetInterface
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
    public function __construct($viewsFetcher)
    {
        $this->viewsFetcher = $viewsFetcher;
        
    }
    
    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Announcement/AnnouncementBar/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        try {
            $contents = $this->viewsFetcher->getViewById('announcements');
            $announcements = $this->formatAnnouncement($contents);

            $data['announcement'] = count($announcements) ? $announcements[0] : [];

        } catch (\Exception $e) {
            $data['announcement'] = [];
        }
       
        $data['show_announcement'] = true; //@todo

        return $data;
    }

    private function formatAnnouncement($contents)
    {
        $announcements = [];

        foreach ($contents as $item) {
            $announcements[] = [
                'nid' => $item['id'][0]['value'],
                'name' => $item['name'][0]['value'],
                'text' => $item['field_body'][0]['value'],
            ];            
        }

        return $announcements;
    }



    /**
     * 
     */


}
