<?php

namespace App\MobileEntry\Component\Main\Promotions;

use App\MobileEntry\Services\Accounts\Accounts;

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
     * @var $accountService Accounts
     */
    private $accountService;

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
        $accountService,
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
        $this->accountService = $accountService;
        $this->url = $url;
        $this->asset = $asset;
        $this->cacher = $cacher;
        $this->currentLanguage = $currentLanguage;
        $this->idDomain = $idDomain;
        $this->user = $user;
    }

    /**
     * Gets list of promotions and promotion filters
     *
     */
    public function promotions($request, $response)
    {
        $isLogin = $this->playerSession->isLogin();
        $isProvisioned = false;
        $queryParams = $request->getQueryParams();
        $language = $queryParams['language'] ?? 'en';
        $isFlutter = (isset($queryParams['flutter']) && $queryParams['flutter'] === '1');

        // Fetch promotion custom configurations
        try {
            $promoConfigs = $this->configs->getConfig('mobile_promotions.promotions_configuration');
        } catch (\Exception $e) {
            $promoConfigs = [];
        }

        // Check if player is casino gold provisioned
        if ($isLogin) {
            $isProvisioned = $this->accountService->hasAccount('casino-gold');
        }

        // Fetch filters by language
        try {
            $filters = $this->getFilters($language);
        } catch (\Exception $e) {
            $filters = [];
        }

        $promotionData = [];
        $filterData = [];

        // Fetch featured promotions
        $featured = $this->getFeatured($language);

        // Filter out products based on enabled filters for flutter app
        if ($isFlutter) {
            $flutterOverrides = $this->getFlutterOverrides($filters, $featured);
            $featured = $flutterOverrides['featured'];
            $filters = $flutterOverrides['filters'];
        }

        // Fetch product promotions
        $promotionProducts = $this->getPromotionProducts($filters, $language, $isFlutter);

         // Override promotion list for LATAM Territory if featured and product promotions is empty
        if (!$isFlutter
            && $language !== $this->currentLanguage
            && count($featured) <= 0
            && count($promotionProducts) <= 0) {
            $featured = $this->getFeatured($this::LATAM_LANG_DEFAULT);
            $filters = $this->getFilters($this::LATAM_LANG_DEFAULT);
            $promotionProducts = $this->getPromotionProducts($filters, $this::LATAM_LANG_DEFAULT, $isFlutter);
        }

        // Create promotion collection
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
                    $promoList = $this->createPromotions(
                        $promotionProducts[$tid],
                        $promoConfigs,
                        $isLogin,
                        $isProvisioned
                    );

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

    /**
     * Check if player is from LATAM Territory base on currency and countrycode
     */
    public function getLatamLang($request, $response)
    {
        if ($this->currentLanguage === $this::LATAM_LANG_DEFAULT) {
            $userIPCountry = strtolower($this->idDomain->getGeoIpCountry());
            $language = $this->currentLanguage;
            if ($this->playerSession->isLogin()) {
                try {
                    $countryCode = $this->user->getPlayerDetails()['countryCode'];
                    $currency = $this->user->getPlayerDetails()['currency'];
                    $userIPCountry = (array_key_exists(strtolower($currency), $this::LATAM_CURRENCY))
                        ? $this::LATAM_CURRENCY[strtolower($currency)] : strtolower($countryCode);
                } catch (\Exception $e) {
                    // Do nothing
                }
            }

            if (array_key_exists($userIPCountry, $this::LATAM)) {
                $language = $this::LATAM[$userIPCountry];
            }

            return $this->rest->output($response, ['language' => $language]);
        }

        return $this->rest->output($response, ['language' => $this->currentLanguage]);
    }

    /**
     * Get list of archived promotions
     */
    public function archive($request, $response)
    {
        $languageParam = $request->getQueryParams();
        $language = $languageParam['language'] ?? 'en';
        $archived = [];
        try {
            $archived = $this->views->withLanguage($language)->getViewById('promotions_archive');
        } catch (\Exception $e) {
            $archived = [];
        }

        try {
            $promoConfigs = $this->configs->getConfig('mobile_promotions.promotions_configuration');
        } catch (\Exception $e) {
            $promoConfigs = [];
        }

        $isProvisioned = false;
        if ($this->playerSession->isLogin()) {
            $isProvisioned = $this->accountService->hasAccount('casino-gold');
        }

        $archived = $this->createPromotions(
            $archived,
            $promoConfigs,
            $this->playerSession->isLogin(),
            $isProvisioned
        );

        return $this->rest->output($response, ['promotions' =>  array_slice($archived, 0, 3)]);
    }

    /**
     * Get available filters for flutter app
     * Filter featured promotions based on filter for flutter app
     * @param array $filters
     * @param array $featuredPromos
     * @return array Array containing filters and filtered featured promotions
     */
    private function getFlutterOverrides($filters, $featuredPromos)
    {
        $flutterFilters = [];
        $featured = [];
        $filtersKey = [];

        // Filter enabled filters for Flutter
        foreach ($filters as $filter) {
            if (isset($filter['field_show_in_flutter_app'][0]['value']) &&
                $filter['field_show_in_flutter_app'][0]['value'] === true) {
                $filtersKey[] = $filter['tid'][0]['value'];
                $flutterFilters[] = $filter;
            }
        }

        // Filter featured promotions based on flutter filters
        foreach ($featuredPromos as $featuredPromo) {
            $promoCategory = $featuredPromo['field_product_category'][0]['tid'][0]['value'] ?? '';
            if (in_array($promoCategory, $filtersKey)) {
                $featured[] = $featuredPromo;
            }
        }

        return [
            'featured' => $featured,
            'filters' => $flutterFilters
        ];
    }

    /**
     * Get featured promotions
     * @param string $language
     * @return array Array of featured promotions
     */
    private function getFeatured($language)
    {
        $featured = [];
        try {
            $featured = $this->views->withLanguage($language)->getViewById('featured_promotions');
        } catch (\Exception $e) {
            $featured = [];
        }

        return $featured;
    }

    /**
     * Get list of promotion filters
     * @param string $language
     * @return array Array of promotion filters
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
     * Get promotions grouped by Product
     * @param array $filters list of promotion category to fetch
     * @param string $language
     * @param boolean $isFlutter
     * @return array Array of promotions per product
     */
    private function getPromotionProducts($filters, $language, $isFlutter)
    {
        $promotions = [];
        $cacheKey = $isFlutter ? 'views.promotion-products.flutter.'. $language
            : 'views.promotion-products.'. $language;
        $item = $this->cacher->getItem($cacheKey);
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
     * Create Promotion Filter list
     * @param array $filter
     * @return array Array of filters
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
     * Create Promotion Collection
     * @param array $promotions
     * @param array $config
     * @param boolean $isLogin is player authenticated
     * @param boolean $isProvisioned is player casino gold provisioned
     * @param string $category
     * @return array Array of promotion collection
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
