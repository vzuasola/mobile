<?php

namespace App\MobileEntry\Component\Announcement;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class AnnouncementComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\views
     */
    private $views;

    /**
     * @var App\Fetcher\Drupal\configs
     */
    private $configs;

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
    public function __construct($views, $playerSession, $configs)
    {
        $this->views = $views;
        $this->playerSession = $playerSession;
        $this->configs = $configs;
    }

    /**
     * {@inheritdoc}
     */
    public function getTemplate()
    {
        return '@component/Announcement/template.html.twig';
    }

    public function getData()
    {
        try {
            $announcementConfigs = $this->configs->getConfig('webcomposer_config.announcements_configuration');
            $announcements = $this->formatAnnouncement();
        } catch (\Exception $e) {
            $announcementConfigs = [];
            $announcements = [];
        }

        $data['announcements'] = $announcements['list'] ?? [];
        $data['announcement_count'] = $announcements['count'] ?? 0;
        $data['title'] = $announcementConfigs['title'] ?? 'Announcement';
        $data['default_message'] = $announcementConfigs['default_message'] ?? 'You have a notification';
        $data['see_all'] = $announcementConfigs['see_all'] ?? 'See all';
        $data['dismiss_all'] = $announcementConfigs['dismiss_all'] ?? 'Dismiss all';

        return $data;
    }

    /**
     *
     */
    private function formatAnnouncement()
    {
        $isLogin = $this->playerSession->isLogin();
        $contents = $this->views->getViewById('announcements');

        $announcement = [];
        $announcement['list'] = [];
        $announcementCount = 0;

        foreach ($contents as $content) {
            $showItem = true;

            $availability = count($content['field_availability']) > 1 ?
                $content['field_availability'] :
                $content['field_availability'][0]['value'];

            $textWithTitle = $content['field_body'][0]['value'];
            $paragraphs = explode('<p>', $textWithTitle);

            if (isset($paragraphs[1])) {
                $paragraphs[1] = "
                    <strong class='text-red'>{$content['name'][0]['value']}</strong>&nbsp
                    {$paragraphs[1]}
                ";
            }

            if (($availability == '0' && $isLogin) ||
                ($availability == '1' && !$isLogin)
            ) {
                $showItem  = false;
            } else {
                $announcementCount++;
            }

            $announcement['list'][] = [
                'show' => $showItem,
                'nid' =>  $content['id'][0]['value'],
                'name' => $content['name'][0]['value'],
                'text' => $content['field_body'][0]['value'],
                'text_with_title' => implode('<p>', $paragraphs),
            ];
        }

        $announcement['count'] = $announcementCount;

        return $announcement;
    }
}
