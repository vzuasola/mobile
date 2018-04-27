<?php

namespace App\MobileEntry\Component\Announcement\AnnouncementLightbox;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class AnnouncementLightboxComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\ViewsFetcher
     */
    private $viewsFetcher;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configFetcher;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher'),
            $container->get('player_session'),
            $container->get('config_fetcher')
        );
    }

    /**
     *
     */
    public function __construct($viewsFetcher, $playerSession, $configFetcher)
    {
        $this->viewsFetcher = $viewsFetcher;
        $this->playerSession = $playerSession;
        $this->configFetcher = $configFetcher;
    }

    /**
     * {@inheritdoc}
     */
    public function getTemplate()
    {
        return '@component/Announcement/AnnouncementLightbox/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        try {
            $announcementConfigs = $this->configFetcher
                ->getConfig('webcomposer_config.announcements_configuration');

            $isLogin = $this->playerSession->isLogin();
            $contents = $this->viewsFetcher->getViewById('announcements');
            $announcements = $this->formatAnnouncement($contents, $isLogin);
            
            $data['announcements'] = $announcements;
            $data['title'] = $announcementConfigs['title'];
            $data['default_message'] = $announcementConfigs['default_message'];
        } catch (\Exception $e) {
            $data['announcement'] = [];
        }

        return $data;
    }

    /**
     *
     */
    private function formatAnnouncement($contents, $isLogin)
    {
        $announcement = [];

        foreach ($contents as $content) {

            $showItem = true;
            $availability= $content['field_availability'][0]['value'];

            if (($availability == '0' && $isLogin)
                || ($availability == '1' && !$isLogin)) {
                $showItem  = false;
            }

            $announcement[] = [
                'nid' =>  $content['id'][0]['value'],
                'name' => $content['name'][0]['value'],
                'text' => $content['field_body'][0]['value'],
                'show' => $showItem,
            ];
        }
        return $announcement;
    }
}
