<?php

namespace App\MobileEntry\Component\Main\Promotions;

/**
 *
 */
class PromotionsComponentController
{
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
            $container->get('payment_account_fetcher'),
            $container->get('uri'),
            $container->get('asset'),
            $container->get('page_cache_adapter')
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
        $cacher
    ) {
        $this->playerSession = $playerSession;
        $this->views = $views;
        $this->rest = $rest;
        $this->configs = $configs;
        $this->paymentAccount = $paymentAccount;
        $this->url = $url;
        $this->asset = $asset;
        $this->cacher = $cacher;
    }

    public function promotions($request, $response)
    {
        $item = $this->cacher->getItem('custom.promotions');

        if (!$item->isHit()) {
            $data = $this->getPromotionCollection();

            $item->set($data);

            $this->cacher->save($item, [
                'expires' => 1800,
            ]);
        } else {
            $data = $item->get();
        }

        return $this->rest->output($response, $data);
    }

    /**
     *
     */
    private function getPromotionCollection()
    {
        try {
            $promotionsFilters = $this->views->getViewById('promotion-filter');
        } catch (\Exception $e) {
            $promotionsFilters = [];
        }

        try {
            $promoProduct = [];

            foreach ($promotionsFilters as $filters) {
                $filterId = $filters['field_product_filter_id'][0]['value'];

                if ($filterId === 'featured') {
                    $featured = $this->getPromotions($this->getFeatured(), 'featured');

                    if (count($featured)) {
                        $promoProduct[$filterId] = $featured;
                        $filterProperties[] = $this->getFilters($filters);
                    }
                } else {
                    $args = ['filter_product_category_id' => $filters['tid'][0]['value']];

                    $promotions = $this->views->getViewById('promotions', $args);
                    $promoList = $this->getPromotions($promotions);

                    if (count($promoList)) {
                        $promoProduct[$filterId] = $promoList;
                        $filterProperties[] = $this->getFilters($filters);
                    }
                }
            }

            $data['promotions'] = $promoProduct;
            $data['filters'] = $filterProperties;
        } catch (\Exception $e) {
            $data['promotions'] = [];
            $data['filters'] = [];
        }

        return $data;
    }

    /**
     *
     */
    private function getFilters($filters)
    {
        return [
            'tid' => $filters['tid'][0]['value'],
            'filter_id' => $filters['field_product_filter_id'][0]['value'],
            'filter_name' =>  $filters['field_filter_name'][0]['value']
        ];
    }

    /**
     *
     */
    private function isPlayerProvisioned()
    {
        $isProvisioned = false;

        try {
            if ($this->playerSession->isLogin()) {
                $isProvisioned = $this->paymentAccount->hasAccount('casino-gold');
            }
        } catch (\Exception $e) {
            $isProvisioned = false;
        }

        return $isProvisioned;
    }

    /**
     *
     */
    private function getPromoConfigs()
    {
        try {
            $promoConfigs = $this->configs->getConfig('mobile_promotions.promotions_configuration');
        } catch (\Exception $e) {
            $promoConfigs = [];
        }

        return $promoConfigs['more_info_link_text'] ?? 'More Info';
    }

    /**
     *
     */
    private function getPreLoginPromotions($promoProperties, $promotion)
    {
        return $promoProperties + [
            'thumbnail'=> $this->asset->generateAssetUri($promotion['field_thumbnail_image'][0]['url'] ?? ''),
            'summary_blurb' => $promotion['field_summary_blurb'][0]['value'] ?? '',
        ];
    }

    /**
     *
     */
    private function getPostLoginPromotions($promoProperties, $promotion)
    {
        return $promoProperties + [
            'thumbnail'=> $this->asset->generateAssetUri($promotion['field_post_thumbnail_image'][0]['url'] ?? ''),
            'summary_blurb' => $promotion['field_post_summary_blurb'][0]['value'] ?? '',
        ];
    }

    /**
     *
     */
    private function getPromotions($promotions, $category = null)
    {
        $promoPerProduct = [];

        $isLogin = $this->playerSession->isLogin();
        $isProvisioned = $this->isPlayerProvisioned();

        foreach ($promotions as $promotion) {
            $filterId = $category ?? $promotion['field_product_category'][0]['field_product_filter_id'][0]['value'];

            $availability = count($promotion['field_promo_availability']) > 1
                ? $promotion['field_promo_availability']
                : $promotion['field_promo_availability'][0]['value'];

            $promoProperties = $this->getPromoProperties($promotion);

            if ($isLogin && ($availability == '1' || is_array($availability))) {
                $isCasinoOnly = $promotion['field_casino_gold_only'][0]['value'] ?? false;

                if ($isCasinoOnly && !$isProvisioned) {
                    continue;
                }

                $promoProperties = $this->getPostLoginPromotions($promoProperties, $promotion);
                $promoPerProduct[] = $promoProperties + ['category' => $filterId];
            } elseif (!$isLogin && ($availability == '0' || is_array($availability))) {
                $promoProperties = $this->getPreLoginPromotions($promoProperties, $promotion);
                $promoPerProduct[] = $promoProperties + ['category' => $filterId];
            }
        }

        return $promoPerProduct;
    }

    /**
     *
     */
    private function getPromoProperties($promotion)
    {
        $uri = empty($promotion['field_summary_url'][0]['uri'])
            ? ($promotion['path'][0]['alias'] ?? '#')
            : $promotion['field_summary_url'][0]['uri'];

        $ribbonEnable = $promotion['field_enable_disable_ribbon_tag'][0]['value'] ?? '';
        $ribbonLabel = $promotion['field_ribbon_label'][0]['value'] ?? '';
        $ribbonColor = $promotion['field_ribbon_background_color'][0]['color'] ?? '';
        $ribbonTextColor = $promotion['field_ribbon_text_color'][0]['color'] ?? '';

        return [
            'title' => $promotion['title'][0]['value'],
            'product' => $promotion['field_product_category'][0]['field_product_filter_id'][0]['value'],
            'ribbon_enable' => $ribbonEnable,
            'ribbon_label' =>  $ribbonLabel,
            'ribbon_bg_color' => $ribbonColor,
            'ribbon_text_color' => $ribbonTextColor,
            'more_info_text' => $this->getPromoConfigs(),
            'summary_url' => $this->url->generateUri($uri, ['skip_parsers' => true]),
            'summary_url_target'=> $promotion['field_summary_url_target'][0]['value'] ?? '',
            'summary_url_title' => $promotion['field_summary_url'][0]['title'] ?? ['title' => ''],
            'hide_countdown' => $promotion['field_hide_countdown'][0]['value'] ?? true,
        ];
    }

    /**
     *
     */
    private function getFeatured()
    {
        try {
            $featured = $this->views->getViewById('featured_promotions');
        } catch (\Exception $e) {
            $featured = [];
        }

        return $featured;
    }
}
