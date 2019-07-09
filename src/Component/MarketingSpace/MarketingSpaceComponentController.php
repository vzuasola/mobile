<?php

namespace App\MobileEntry\Component\MarketingSpace;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class MarketingSpaceComponentController
{

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Fetcher\Drupal\Views
     */
    private $views;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $rest;

    private $asset;

    private $url;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('views_fetcher'),
            $container->get('player_session'),
            $container->get('rest'),
            $container->get('asset'),
            $container->get('uri')
        );
    }

    /**
     *
     */
    public function __construct(
        $configs,
        $views,
        $playerSession,
        $rest,
        $asset,
        $url
    ) {
        $this->configs = $configs;
        $this->views = $views;
        $this->playerSession = $playerSession;
        $this->rest = $rest;
        $this->asset = $asset;
        $this->url = $url;
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function topLeaderboard($request, $response)
    {
        try {
            $params = $request->getParsedBody();
            $views = $this->views;
            if (isset($params['currentProduct'])) {
                $views = $this->views->withProduct($params['currentProduct']);
            }

            $top_leaderboard = $views->getViewById('top_leaderboard');
            $data['top_leaderboard'] = $this->processTopLeaderBoard($top_leaderboard);
        } catch (\Exception $e) {
            $data['top_leaderboard'] = [];
        }
        $data['is_login'] = $this->playerSession->isLogin();

        return $this->rest->output($response, $data);
    }

    private function processTopLeaderBoard($data)
    {
        try {
            $topLeaderboardList = [];
            $isLogin = $this->playerSession->isLogin();
            foreach ($data as $topLeaderboardItem) {
                $dateStart = $topLeaderboardItem['field_publish_date'][0]['value'] ?? '';
                $dateEnd = $topLeaderboardItem['field_unpublish_date'][0]['value'] ?? '';
                $isPublished = $this->checkIfPublished(
                    $dateStart,
                    $dateEnd
                );

                if ($isPublished) {
                    $topLeaderboard = [];
                    $availability = array_column($topLeaderboardItem['field_log_in_state'], 'value');
                    $topLeaderboard['field_title'] = $topLeaderboardItem['field_title'][0]['value'] ?? '';
                    $topLeaderboard['id'] = $topLeaderboardItem['id'][0]['value'] ?? '';
                    if ($isLogin && in_array("1", $availability)) {
                        $portraitImg = $topLeaderboardItem['field_post_banner_image_portrait'][0]['url'] ?? '';
                        $topLeaderboard['banner_img_portrait'] = $this->asset->generateAssetUri($portraitImg);
                        $landscapeImg = $topLeaderboardItem['field_post_banner_image_landscap'][0]['url'] ?? '';
                        $topLeaderboard['banner_img_landscape'] = $this->asset->generateAssetUri($landscapeImg);

                        $tlUrl = $topLeaderboardItem['field_post_banner_link'][0]['uri'] ?? '';
                        $topLeaderboard['banner_url'] = $this->url->generateUri($tlUrl, ['skip_parsers' => true]);
                        $topLeaderboard['banner_alt'] =
                            $topLeaderboardItem['field_post_banner_image_portrait'][0]['alt']
                            ?? '';
                        $topLeaderboard['target'] =
                            $topLeaderboardItem['field_post_banner_link_target'][0]['value'] ?? '';
                        $topLeaderboardList[] = $topLeaderboard;
                    } elseif (!$isLogin && in_array("0", $availability)) {
                        $portraitImg = $topLeaderboardItem['field_banner_image_portrait'][0]['url'] ?? '';
                        $topLeaderboard['banner_img_portrait'] = $this->asset->generateAssetUri($portraitImg);
                        $landscapeImg = $topLeaderboardItem['field_banner_image_landscape'][0]['url'] ?? '';
                        $topLeaderboard['banner_img_landscape'] = $this->asset->generateAssetUri($landscapeImg);

                        $tlUrl = $topLeaderboardItem['field_banner_link'][0]['uri'] ?? '';
                        $topLeaderboard['banner_url'] = $this->url->generateUri($tlUrl, ['skip_parsers' => true]);
                        $topLeaderboard['banner_alt'] = $topLeaderboardItem['field_banner_image_portrait'][0]['alt']
                            ?? '';
                        $topLeaderboard['target'] = $topLeaderboardItem['field_banner_link_target'][0]['value'] ?? '';
                        $topLeaderboardList[] = $topLeaderboard;
                    }
                }
            }
        } catch (\Exception $e) {
            $topLeaderboardList = [];
        }

        return $topLeaderboardList;
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
