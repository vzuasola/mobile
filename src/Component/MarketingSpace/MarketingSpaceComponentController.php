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
    public function marketingSpace($request, $response)
    {
         try {
            $marketingSpace = $this->views->getViewById('marketing_space');
            $data['marketing_space'] = $this->processMarketingSpace($marketingSpace);
        } catch (\Exception $e) {
            $data['marketing_space'] = [];
        }

        try {
            $data['is_login'] = $this->playerSession->isLogin();
        } catch (\Exception $e) {
            $data['is_login'] = false;
        }

        return $this->rest->output($response, $data);
    }

    private function processMarketingSpace($data)
    {
        try {
            $marketingSpace = [];
            foreach ($data as $market_space) {
                $marketSpace = [];

                $dateStart = $market_space['field_publish_date'][0]['value'] ?? '';
                $dateEnd = $market_space['field_unpublish_date'][0]['value'] ?? '';
                $marketSpace['published'] = $this->checkIfPublished(
                    $dateStart,
                    $dateEnd
                );

                $showBoth = count($market_space['field_log_in_state']) > 1;

                $loginState = $market_space['field_log_in_state'][0]['value'] ?? 0;

                if (!$showBoth && $loginState != $this->playerSession->isLogin()) {
                    $marketSpace['published'] = false;
                }

                $marketSpace['field_title'] = $market_space['field_title'][0]['value'] ?? '';

                $marketSpacePortraitImg = $market_space['field_banner_image_portrait'][0]['url'] ?? '';
                $marketSpace['banner_img_portrait'] = $this->asset->generateAssetUri($marketSpacePortraitImg);

                $marketSpaceLandscapeImg = $market_space['field_banner_image_landscape'][0]['url'] ?? '';
                $marketSpace['banner_img_landscape'] = $this->asset->generateAssetUri($marketSpaceLandscapeImg);

                $marketSpaceUrl = $market_space['field_banner_link'][0]['uri'] ?? '';
                $marketSpace['banner_url'] = $this->url->generateUri($marketSpaceUrl, ['skip_parsers' => true]);
                $marketSpace['id'] = $market_space['id'][0]['value'] ?? '';

                $marketSpace['banner_alt'] = $market_space['field_banner_image_portrait'][0]['alt'] ?? '';

                if ($this->playerSession->isLogin()) {
                    $marketSpacePortraitImg = $market_space['field_post_banner_image_portrait'][0]['url'] ?? '';
                    $marketSpace['banner_img_portrait'] = $this->asset->generateAssetUri($marketSpacePortraitImg);

                    $marketSpaceLandscapeImg = $market_space['field_post_banner_image_landscap'][0]['url'] ?? '';
                    $marketSpace['banner_img_landscape'] = $this->asset->generateAssetUri($marketSpaceLandscapeImg);

                    $marketSpaceUrl = $market_space['field_post_banner_link'][0]['uri'] ?? '';
                    $marketSpace['banner_url'] = $this->url->generateUri($marketSpaceUrl, ['skip_parsers' => true]);

                    $marketSpace['banner_alt'] = $market_space['field_post_banner_image_portrait'][0]['alt'] ?? '';
                }

                $marketingSpace[] = $marketSpace;
            }
        } catch (\Exception $e) {
            $marketingSpace = [];
        }

        return $marketingSpace;
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
