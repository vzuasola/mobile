<?php

namespace App\MobileEntry\Component\Announcement;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class AnnouncementComponentController
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

    private $rest;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher'),
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('rest')
        );
    }

    /**
     *
     */
    public function __construct($views, $playerSession, $configs, $rest)
    {
        $this->views = $views;
        $this->playerSession = $playerSession;
        $this->configs = $configs;
        $this->rest = $rest;
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function announcements($request, $response)
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

        return $this->rest->output($response, $data);
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

            $dateStart = $content['field_publish_date'][0]['value'] ?? '';
            $dateEnd = $content['field_unpublish_date'][0]['value'] ?? '';

            $isPublished = $this->checkIfPublished(
                $dateStart,
                $dateEnd
            );

            if (($availability == '0' && $isLogin && $isPublished) ||
                ($availability == '1' && !$isLogin && $isPublished)
            ) {
                $showItem  = false;
            }

            if ($isPublished) {
                $announcement['list'][] = [
                    'published' => $isPublished,
                    'show' => $showItem,
                    'nid' =>  $content['id'][0]['value'],
                    'name' => $content['name'][0]['value'],
                    'title' => $content['field_title'][0]['value'] ?? "",
                    'text' => $content['field_body'][0]['value'],
                ];

                if ($showItem) {
                    $announcementCount++;
                }
            }
        }
        $announcement['count'] = $announcementCount;

        return $announcement;
    }

    private function checkIfPublished($dateStart, $dateEnd)
    {
        if (!$dateStart && !$dateEnd) {
            return true;
        }

        $currentDate = new \DateTime(date("Y-m-d H:i:s"), new \DateTimeZone(date_default_timezone_get()));
        $currentDate = $currentDate->getTimestamp();
        if ($dateStart && $dateEnd) {
            $startDate = new \DateTime($dateStart, new \DateTimeZone('UTC'));
            $startDate = $startDate->setTimezone(new \DateTimeZone(date_default_timezone_get()));

            $endDate = new \DateTime($dateEnd, new \DateTimeZone('UTC'));
            $endDate = $endDate->setTimezone(new \DateTimeZone(date_default_timezone_get()));
            if ($startDate->getTimestamp() <= $currentDate && $endDate->getTimestamp() >= $currentDate) {
                return true;
            }
        }

        if ($dateStart && !$dateEnd) {
            $startDate = new \DateTime($dateStart, new \DateTimeZone('UTC'));
            $startDate = $startDate->setTimezone(new \DateTimeZone(date_default_timezone_get()));
            if ($startDate->getTimestamp() <= $currentDate) {
                return true;
            }
        }

        if ($dateEnd && !$dateStart) {
            $endDate = new \DateTime($dateEnd, new \DateTimeZone('UTC'));
            $endDate = $endDate->setTimezone(new \DateTimeZone(date_default_timezone_get()));
            if ($endDate->getTimestamp() >=$currentDate) {
                return true;
            }
        }

        return false;
    }
}
