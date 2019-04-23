<?php

namespace App\MobileEntry\Component\Main\Promotions;

/**
 *
 */
class PromotionsComponentController
{
    const TIMEOUT = 1800;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    /**
     * @var App\Fetcher\Integration\PreferencesFetcher
     */
    private $views;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Fetcher\Integration\PaymentAccountFetcher
     */
    private $paymentAccount;

    private $rest;
    private $url;
    private $asset;
    private $cacher;
    private $currentLanguage;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('views_fetcher'),
            $container->get('rest'),
            $container->get('config_fetcher'),
            $container->get('accounts_service'),
            $container->get('uri'),
            $container->get('asset'),
            $container->get('redis_cache_adapter'),
            $container->get('lang')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $playerSession,
        $views,
        $rest,
        $configs,
        $paymentAccount,
        $url,
        $asset,
        $cacher,
        $currentLanguage
    ) {
        $this->playerSession = $playerSession;
        $this->views = $views;
        $this->rest = $rest;
        $this->configs = $configs;
        $this->paymentAccount = $paymentAccount;
        $this->url = $url;
        $this->asset = $asset;
        $this->cacher = $cacher;
        $this->currentLanguage = $currentLanguage;
    }

    /**
     *
     */
    public function promotions($request, $response)
    {
        $isLogin = $this->playerSession->isLogin();
        $isProvisioned = $this->paymentAccount->hasAccount('casino-gold');

        try {
            $filters = $this->getFilters();
        } catch (\Exception $e) {
            $filters = [];
        }

        try {
            $promoConfigs = $this->configs->getConfig('mobile_promotions.promotions_configuration');
        } catch (\Exception $e) {
            $promoConfigs = [];
        }

        try {
            $featured = $this->views->getViewById('featured_promotions');
        } catch (\Exception $e) {
            $featured = [];
        }

        $promotionData = [];
        $promotionProducts = $this->getPromotionProducts($filters);

        foreach ($filters as $filter) {
            $id = $filter['field_product_filter_id'][0]['value'];

            if ($id === 'featured') {
                $featured = $this->createPromotions($featured, $promoConfigs, $isLogin, $isProvisioned, 'featured');

                if (count($featured)) {
                    $promotionData[$id] = $featured;
                    $filterData[] = $this->createFilter($filter);
                }
            } else {
                $tid = $filter['tid'][0]['value'];

                $promotions = $promotionProducts[$tid];
                $promoList = $this->createPromotions($promotions, $promoConfigs, $isLogin, $isProvisioned);

                if (count($promoList)) {
                    $promotionData[$id] = $promoList;
                    $filterData[] = $this->createFilter($filter);
                }
            }
        }

        $data['promotions'] = $promotionData;
        $data['filters'] = $filterData;

        return $this->rest->output($response, $data);
    }

    /**
     *
     */
    private function getFilters()
    {
        $item = $this->cacher->getItem('views.promotion-filter.'. $this->currentLanguage);

        if (!$item->isHit()) {
            $data = $this->views->getViewById('promotion-filter');

            $item->set([
                'body' => $data,
            ]);

            $this->cacher->save($item, [
                'expires' => self::TIMEOUT,
            ]);
        } else {
            $body = $item->get();
            $data = $body['body'];
        }

        return $data;
    }

    /**
     *
     */
    private function getPromotionProducts($filters)
    {
        $promotions = [];

        $item = $this->cacher->getItem('views.promotion-products.'. $this->currentLanguage);

        if (!$item->isHit()) {
            foreach ($filters as $filter) {
                $id = $filter['tid'][0]['value'];

                if ($id !== 'featured') {
                    $promotions[$id] = $this->views->getViewById('promotions', [
                        'filter_product_category_id' => $filter['tid'][0]['value'],
                    ]);
                }
            }

            $item->set([
                'body' => $promotions,
            ]);

            $this->cacher->save($item, [
                'expires' => self::TIMEOUT,
            ]);
        } else {
            $body = $item->get();
            $promotions = $body['body'];
        }

        return $promotions;
    }

    /**
     *
     */
    private function createFilter($filter)
    {
        $data = [];

        $data['tid'] = $filter['tid'][0]['value'];
        $data['filter_id'] = $filter['field_product_filter_id'][0]['value'];
        $data['filter_name'] = $filter['field_filter_name'][0]['value'];

        return $data;
    }

    /**
     *
     */
    private function createPromotions($promotions, $config, $isLogin, $isProvisioned, $category = null)
    {
        $collection = [];

        foreach ($promotions as $promotion) {
            $properties = [];

            if (empty($promotion['field_summary_url'][0]['uri'])) {
                $uri = $promotion['path'][0]['alias'] ?? '#';
            } else {
                $uri = $promotion['field_summary_url'][0]['uri'];
            }

            $properties['title'] = $promotion['title'][0]['value'];
            $properties['product'] = $promotion['field_product_category'][0]['field_product_filter_id'][0]['value'];
            $properties['ribbon_enable'] = $promotion['field_enable_disable_ribbon_tag'][0]['value'] ?? '';
            $properties['ribbon_label'] = $promotion['field_ribbon_label'][0]['value'] ?? '';
            $properties['ribbon_bg_color'] = $promotion['field_ribbon_background_color'][0]['color'] ?? '';
            $properties['ribbon_text_color'] = $promotion['field_ribbon_text_color'][0]['color'] ?? '';
            $properties['more_info_text'] = $config['more_info_link_text'] ?? 'More Info';
            $properties['summary_url'] = $this->url->generateUri($uri, ['skip_parsers' => true]);
            $properties['summary_url_target'] = $promotion['field_summary_url_target'][0]['value'] ?? '';
            $properties['summary_url_title'] = $promotion['field_summary_url'][0]['title'] ?? ['title' => ''];
            $properties['thumbnail_alt'] = $promotion['field_thumbnail_image'][0]['alt'] ?? '';
            $properties['hide_countdown'] = $promotion['field_hide_countdown'][0]['value'] ?? true;
            $properties['unpublish_on'] = $promotion['unpublish_on'][0]['value'] ?? '';

            $filterId = $category ?? $promotion['field_product_category'][0]['field_product_filter_id'][0]['value'];
            $availability = array_column($promotion['field_promo_availability'], 'value');

            // selectively choose fields based on login state
            if ($isLogin && in_array("1", $availability)) {
                $isCasinoOnly = $promotion['field_casino_gold_only'][0]['value'] ?? false;

                if ($isCasinoOnly && !$isProvisioned) {
                    continue;
                }

                $properties['thumbnail'] = $this->asset->generateAssetUri(
                    $promotion['field_post_thumbnail_image'][0]['url'] ?? ''
                );
                $properties['summary_blurb'] = $promotion['field_post_summary_blurb'][0]['value'] ?? '';
                $properties['category'] = $filterId;

                $collection[] = $properties;
            } elseif (!$isLogin && in_array("0", $availability)) {
                $properties['thumbnail'] = $this->asset->generateAssetUri(
                    $promotion['field_thumbnail_image'][0]['url'] ?? ''
                );
                $properties['summary_blurb'] = $promotion['field_summary_blurb'][0]['value'] ?? '';
                $properties['category'] = $filterId;

                $collection[] = $properties;
            }
        }

        return $collection;
    }
}
