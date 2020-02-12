<?php

namespace App\MobileEntry\Component\Main\Promotions;
use App\MobileEntry\Services\Product\Products;

/**
 *
 */
class PromotionsComponentController
{
    const TIMEOUT = 1800;
    const LATAM_LANG_DEFAULT = 'es';
    const LATAM = [
        'mx' => 'es-mx',
        'cl' => 'es-cl',
        'ar' => 'es-ar',
        'pe' => 'es-pe'
    ];

    const LATAM_CURRENCY = [
        'mxn' => 'mx',
        'clp' => 'cl',
        'pen' => 'pe',
        'ars' => 'ar'
    ];

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
    private $idDomain;
    private $user;

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
            $container->get('lang'),
            $container->get('id_domain'),
            $container->get('user_fetcher')
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
        $currentLanguage,
        $idDomain,
        $user
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
        $this->idDomain = $idDomain;
        $this->user = $user;
    }

    /**
     *
     */
    public function promotions($request, $response)
    {
        $isLogin = $this->playerSession->isLogin();
        $isProvisioned = $this->paymentAccount->hasAccount('casino-gold');
        $language = $this->currentLanguage;
        try {
            $countryCode = $this->user->getPlayerDetails()['countryCode'];
            $currency = $this->user->getPlayerDetails()['currency'];
        } catch (\Exception $e) {
            // Do nothing
        }

        $userIPCountry = ($isLogin) ? strtolower($countryCode) : strtolower($this->idDomain->getGeoIpCountry());
        if ($isLogin && array_key_exists(strtolower($currency), $this::LATAM)) {
            $userIPCountry = $this::LATAM_CURRENCY[strtolower($currency)];
        }

        if (array_key_exists($userIPCountry, $this::LATAM)) {
            $language = $this::LATAM[$userIPCountry];
        }

        try {
            $filters = $this->getFilters($language);
        } catch (\Exception $e) {
            $filters = [];
        }

        try {
            $promoConfigs = $this->configs->getConfig('mobile_promotions.promotions_configuration');
        } catch (\Exception $e) {
            $promoConfigs = [];
        }
        $promotionData = [];
        $filterData = [];
        $featured = $this->getFeatured($language);
        $promotionProducts = $this->getPromotionProducts($filters, $language);
        if (array_key_exists($userIPCountry, $this::LATAM)
            && count($featured) <= 0
            && count($promotionProducts) <= 0) {
            $featured = $this->getFeatured($this::LATAM_LANG_DEFAULT);
            $filters = $this->getFilters($this::LATAM_LANG_DEFAULT);
            $promotionProducts = $this->getPromotionProducts($filters, $this::LATAM_LANG_DEFAULT);
        }

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
                if (isset($promotionProducts[$tid])) {
                    $promoList = $this->createPromotions($promotionProducts[$tid], $promoConfigs, $isLogin, $isProvisioned);

                    if (count($promoList)) {
                        $promotionData[$id] = $promoList;
                        $filterData[] = $this->createFilter($filter);
                    }
                }
            }
        }

        $data['promotions'] = $promotionData;
        $data['filters'] = $filterData;

        return $this->rest->output($response, $data);
    }

    private function getFeatured($language) {
        $featured = [];
        try {
            $featured = $this->views->withLanguage($language)->getViewById('featured_promotions');
        } catch (\Exception $e) {
            $featured = [];
        }

        return $featured;
    }

    /**
     *
     */
    private function getFilters($language)
    {
        $item = $this->cacher->getItem('views.promotion-filter.'. $language);

        if (!$item->isHit()) {
            $data = $this->views->withLanguage($language)->getViewById('promotion-filter');

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
    private function getPromotionProducts($filters, $language)
    {
        $promotions = [];

        $item = $this->cacher->getItem('views.promotion-products.'. $language);
        $viewsLang = $this->views->withLanguage($language);
        if (!$item->isHit()) {
            foreach ($filters as $filter) {
                $id = $filter['tid'][0]['value'];

                if ($id !== 'featured') {
                    $promotions[$id] = $viewsLang->getViewById('promotions', [
                        'filter_product_category_id' => $filter['tid'][0]['value']
                    ]);

                    if (count($promotions[$id]) === 0) {
                        unset($promotions[$id]);
                    }
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
                $properties['thumbnail_alt'] = $promotion['field_post_thumbnail_image'][0]['alt'] ?? '';

                $collection[] = $properties;
            } elseif (!$isLogin && in_array("0", $availability)) {
                $properties['thumbnail'] = $this->asset->generateAssetUri(
                    $promotion['field_thumbnail_image'][0]['url'] ?? ''
                );
                $properties['summary_blurb'] = $promotion['field_summary_blurb'][0]['value'] ?? '';
                $properties['category'] = $filterId;
                $properties['thumbnail_alt'] = $promotion['field_thumbnail_image'][0]['alt'] ?? '';

                $collection[] = $properties;
            }
        }

        return $collection;
    }
}
