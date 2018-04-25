<?php

namespace App\MobileEntry\Component\Announcement\AnnouncementBar;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class AnnouncementBarComponent implements ComponentWidgetInterface
{

    /**
     * @var App\Fetcher\Drupal\ViewsFetcher
     */
    private $viewsFetcher;
    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    /**
     *  Defines the container that can be used to fetch data
     *  from Drupal
     */
    public static function create($container)
    {
        return new static (
            $container->get('views_fetcher'),
            $container->get('player_session')
        );
    }

    /**
     *  Defines the container that can be used to fetch data
     *  from Drupal
     */
    public function __construct($viewsFetcher, $playerSession)
    {
        $this->viewsFetcher = $viewsFetcher;
        $this->playerSession = $playerSession;
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
            $announcement = $this->formatAnnouncement($contents);

            $data['announcement'] = $announcement;
            $data['show_announcement'] = true;
            $isLogin = $this->playerSession->isLogin();

            if ($announcement['availability'] == '0' && $isLogin) {
                $data['show_announcement']  = false;
            } elseif ($announcement['availability'] == '1' && !$isLogin) {
                $data['show_announcement']  = false;
            }
        } catch (\Exception $e) {
            $data['announcement'] = [];
        }
        return $data;
    }

    private function formatAnnouncement($contents)
    {
        $announcement = [];

        if (isset($contents[0])) {
            $announcement = [
                'nid' =>  $contents[0]['id'][0]['value'],
                'name' => $contents[0]['name'][0]['value'],
                'text' => $contents[0]['field_body'][0]['value'],
                'availability' => $contents[0]['field_availability'][0]['value'],
            ];
        }
        return $announcement;
    }
}
