<?php

namespace App\MobileEntry\Component\Main\Lobby\Slider;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Services\Product\Products;

class SliderComponentController
{
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
     * @var App\Fetcher\Drupal\ViewsFetcher
     */
    private $viewsFetcher;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $product;

    private $rest;

    private $asset;

    private $url;

    private $currentLanguage;

    private $idDomain;

    private $user;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('product_resolver'),
            $container->get('config_fetcher'),
            $container->get('views_fetcher'),
            $container->get('player_session'),
            $container->get('rest'),
            $container->get('asset'),
            $container->get('uri'),
            $container->get('lang'),
            $container->get('id_domain'),
            $container->get('user_fetcher')
        );
    }

    /**
     *
     */
    public function __construct(
        $product,
        $configs,
        $viewsFetcher,
        $playerSession,
        $rest,
        $asset,
        $url,
        $currentLanguage,
        $idDomain,
        $user
    ) {
        $this->product = $product;
        $this->configs = $configs->withProduct($product->getProduct());
        $this->viewsFetcher = $viewsFetcher->withProduct($product->getProduct());
        $this->playerSession = $playerSession;
        $this->rest = $rest;
        $this->asset = $asset;
        $this->url = $url;
        $this->currentLanguage = $currentLanguage;
        $this->idDomain = $idDomain;
        $this->user = $user;
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function sliders($request, $response)
    {
        try {
            $data['product'] = [];
            $params = $request->getQueryParams();
            $product = ($params['product'] && in_array($params['product'], Products::PRODUCTS_WITH_CMS))
                ? $params['product'] : 'mobile-entrypage';
            $language = $this->getLatamLang($product);
            if ($product != 'mobile-entrypage') {
                $this->configs = $this->configs->withProduct($product);
                $this->viewsFetcher = $this->viewsFetcher->withProduct($product);
                $data['product'] = ['product' => $product];
            }
        } catch (\Exception $e) {
            $data['product'] = [];
        }

        try {
            $sliders = $this->viewsFetcher->withLanguage($language)->getViewById('webcomposer_slider_v2');
            $data['slides'] = $this->processSlides($sliders, $data['product']);
            if ($product === 'mobile-entrypage'
                && $language !== $this->currentLanguage
                && !$this->hasActiveSlide($data['slides'])) {
                $sliders = $this->viewsFetcher->withLanguage($this::LATAM_LANG_DEFAULT)
                    ->getViewById('webcomposer_slider_v2');
                $data['slides'] = $this->processSlides($sliders, $data['product']);
            }
        } catch (\Exception $e) {
            $data['slides'] = [];
        }

        try {
            $sliderConfigs = $this->configs->getConfig('webcomposer_config.slider_v2_configuration');
        } catch (\Exception $e) {
            $data['configs'] = [];
        }

        $data['enable_transition_slider'] = $sliderConfigs['enable_transition_slider'] ?? 'none';

        $data['launch_via_iframe'] = $this->getIframeToggle($product);

        try {
            $data['is_login'] = $this->playerSession->isLogin();
        } catch (\Exception $e) {
            $data['is_login'] = false;
        }

        try {
            $data['uglConfig'] = $this->configs->getConfig('webcomposer_config.games_playtech_provider')['ugl_switch'];
        } catch (\Exception $e) {
            $data['uglConfig'] = '';
        }

        return $this->rest->output($response, $data);
    }

    private function getLatamLang($product)
    {
        if ($product === 'mobile-entrypage' &&
            $this->currentLanguage === $this::LATAM_LANG_DEFAULT) {
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

            return $language;
        }

        return $this->currentLanguage;
    }

    private function processSlides($data, $options)
    {
        try {
            $sliders = [];
            foreach ($data as $slide) {
                $slider = [];
                $currencies = isset($slide['field_currency'][0]['value'])
                    ? explode("\r\n", $slide['field_currency'][0]['value']) : [];
                $dateStart = $slide['field_publish_date'][0]['value'] ?? '';
                $dateEnd = $slide['field_unpublish_date'][0]['value'] ?? '';
                $slider['published'] = $this->checkIfPublished(
                    $dateStart,
                    $dateEnd
                );

                $showBoth = count($slide['field_log_in_state']) > 1;
                $loginState = $slide['field_log_in_state'][0]['value'] ?? 0;

                if (!$showBoth && $loginState != $this->playerSession->isLogin()) {
                    $slider['published'] = false;
                }

                if (($loginState || $showBoth) && $this->playerSession->isLogin() && $slider['published']) {
                    $slider['published'] = $this->checkUserAvailability(
                        $slide['field_user_availability'] ?? [],
                        $currencies
                    );
                }

                $ribbonLabel = $slide['field_ribbon_product_label']['0']['value'] ?? false;
                $fieldProduct = '';
                $fieldProductId = '';
                if (isset($slide['field_product'])) {
                    $fieldProduct = $slide['field_product']['0']['name'][0]['value'] ?? '';
                    $fieldProductId = $slide['field_product']['0']['field_product_id'][0]['value'] ?? '';
                }

                $slider['default_ribbon'] = $ribbonLabel;
                $slider['product_ribbon_tag'] =
                    ($ribbonLabel) ? $ribbonLabel : $fieldProduct;
                $slider['bg_color'] = $slide['field_ribbon_background_color']['0']['color'] ?? '';
                $slider['text_color'] = $slide['field_ribbon_label_color']['0']['color'] ?? '';
                $slider['product'] = $fieldProductId;

                $slider['game_code'] = $slide['field_slider_game_code'][0]['value'] ?? '';
                $slider['game_provider'] = $slide['field_slider_game_provider'][0]['value'] ?? '';
                $slider['game_subprovider'] = $slide['field_games_subprovider'][0]['name'][0]['value'] ?? "";
                $slider['game_platform'] = $slide['field_game_platform'][0]['value'] ?? '';
                $slider['field_title'] = $slide['field_title'][0]['value'] ?? '';
                $slider['use_game_loader'] = $slide['field_slider_use_game_loader'][0]['value'] ?? 'false';
                $slider['forced_game_launch'] = $slide['field_slider_enable_game_launch'][0]['value'] ?? false;
                $slider['table_id'] = $slide['field_table_id'][0]['value'] ?? "";
                $slider['extgame_id'] = $slide['field_external_game_id'][0]['value'] ?? "";
                $slider['lobby'] = false;

                if (!empty($options) && $options['product'] === 'mobile-live-dealer') {
                    $slider['lobby'] = true;
                    if (isset($slide['field_game_lobby'][0])) {
                        $slider['lobby'] = $slide['field_game_lobby'][0]['value'] ? true : false;
                    }
                }

                $sliderUrl = $slide['field_banner_link'][0]['uri'] ?? '';
                $slider['banner_url'] = $this->url->generateUri($sliderUrl, ['skip_parsers' => true]);

                $slider['banner_target'] = $slide['field_banner_link_target'][0]['value'] ?? '';

                $sliderImg = $slide['field_banner_image'][0]['url'] ?? '';
                $slider['banner_img'] = $this->asset->generateAssetUri($sliderImg, $options);

                $sliderImgLandscape = $slide['field_banner_image_landscape'][0]['url'] ?? '';
                $slider['banner_img_landscape'] = $this->asset->generateAssetUri($sliderImgLandscape, $options);

                $slider['banner_alt'] = $slide['field_banner_image'][0]['alt'] ?? '';
                $slider['banner_pos'] = $slide['field_content_position'][0]['value'] ?? '';
                $slider['banner_blurb'] = $slide['field_banner_blurb'][0]['value'] ?? '';

                if ($this->playerSession->isLogin()) {
                    $sliderUrl = $slide['field_post_banner_link'][0]['uri'] ?? '';
                    $slider['banner_url'] = $this->url->generateUri($sliderUrl, ['skip_parsers' => true]);

                    $slider['banner_target'] = $slide['field_post_banner_link_target'][0]['value'] ?? '';

                    $sliderImg = $slide['field_post_banner_image'][0]['url'] ?? '';
                    $slider['banner_img'] = $this->asset->generateAssetUri($sliderImg, $options);

                    $sliderImgLandscape = $slide['field_post_banner_image_landscap'][0]['url'] ?? '';
                    $slider['banner_img_landscape'] = $this->asset->generateAssetUri($sliderImgLandscape, $options);

                    $slider['banner_alt'] = $slide['field_post_banner_image'][0]['alt'] ?? '';
                    $slider['banner_pos'] = $slide['field_post_content_position'][0]['value'] ?? '';
                    $slider['banner_blurb'] = $slide['field_post_banner_blurb'][0]['value'] ?? '';
                }

                $slider['pt_tournament_page'] = $slide['field_pt_tournament_page'][0]['value'] ?? '';

                $sliders[] = $slider;
            }
        } catch (\Exception $e) {
            $sliders = [];
        }

        return $sliders;
    }

    private function checkUserAvailability($slideUserAvail, $slideCurrency)
    {
        $userAvailArray = array_column($slideUserAvail, 'value');
        $userAvailArray = count($userAvailArray) >= 1 ? $userAvailArray : ['regular_user', 'partner_matrix'];
        $userAvailability = $slideUserAvail[0]['value'] ?? 'regular_user';
        $available = true;
        $partnerMatrix = $this->playerSession->getDetails()['isPlayerCreatedByAgent'] ?? false;
        $playerCurrency =$this->playerSession->getDetails()['currency'] ?? '';
        if ($partnerMatrix && !in_array('partner_matrix', $userAvailArray)) {
            $available = false;
        } elseif (!$partnerMatrix && count($userAvailArray) == 1 && $userAvailability == 'partner_matrix') {
            $available = false;
        }

        if ($available && count($slideCurrency)) {
            $available = in_array($playerCurrency, $slideCurrency);
        }

        return $available;
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

    private function hasActiveSlide($slides)
    {
        $publishedSlides = array_filter($slides, function ($slide) {
            if ($slide['published']) {
                return $slide;
            }
        });

        return count($publishedSlides) > 0;
    }

    private function getIframeToggle($product)
    {
        if (!array_key_exists($product, Products::IFRAME_TOGGLE)) {
            return false;
        }
        $dataToggle = false;
        $configParam = Products::IFRAME_TOGGLE[$product];

        if ($product === 'mobile-ptplus') {
            $pageContents = $this->viewsFetcher->withProduct($product)->getViewById($configParam);
            foreach ($pageContents as $value) {
                $key =  $value['field_page_content_key'][0]['value'];
                if ('launch_via_iframe' === $key) {
                    $dataToggle = $value['name'][0]['value'] === "1" ? true : false;
                    break;
                }
            }
        } else {
            $iframeConfigs = $this->configs->withProduct($product)->getConfig($configParam);
            $dataToggle =$iframeConfigs['launch_via_iframe'] === 1 ? true : false;
        }

        return $dataToggle;
    }
}
