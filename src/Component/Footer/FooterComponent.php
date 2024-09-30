<?php

namespace App\MobileEntry\Component\Footer;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Services\Product\Products;

class FooterComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\MenuFetcher
     */
    private $menus;

    /**
     * @var App\Fetcher\Drupal\ViewsFetcher
     */
    private $views;
    private $viewsFloating;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    private $asset;

    private $product;

    /**
     * Block utility helper
     *
     * @var object
     */
    private $blockUtils;
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
            $container->get('menu_fetcher'),
            $container->get('views_fetcher'),
            $container->get('product_resolver'),
            $container->get('config_fetcher'),
            $container->get('asset'),
            $container->get('block_utils'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $menus,
        $views,
        $product,
        $configs,
        $asset,
        $blockUtils,
        $playerSession
    ) {
        $this->menus = $menus;
        $this->views = $views;
        $this->product = $product;
        $this->configs = $configs;
        $this->asset = $asset;
        $this->blockUtils = $blockUtils;
        $this->viewsFloating = $views->withProduct($product->getProduct());
        $this->playerSession = $playerSession;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Footer/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];
        $footerData = [];
        $data['back_to_top'] = true;
        $data['copyright'] = 'Copyright';

        try {
            $data['sponsors'] = $this->views->getViewById('mobile_sponsor_list_v2');
        } catch (\Exception $e) {
            $data['sponsors'] = [];
        }

        try {
            $floatingFooter = [];
            $floatingFooter = $this->viewsFloating->getViewById('floating_footer');
            if (!empty($floatingFooter)) {
                $floatingFooter = $this->dataConvert($floatingFooter);
            }
            $data['floatingFooter'] = $floatingFooter;
        } catch (\Exception $e) {
            $data['floatingFooter'] = [];
        }

        try {
            $footerConfigs = $this->configs->getConfig('webcomposer_config.footer_configuration');
            $data['enable_new_style'] = $footerConfigs['enable_new_style'] ?? false;
            $data['footer']['quicklinks_title'] = $footerConfigs['quicklinks_title'] ?? 'Quicklinks';
            $data['footer']['social_media_title'] = $footerConfigs['social_media_title'] ?? '';
            $data['cookie_notification'] = $footerConfigs['cookie_notification']['value'] ?? 'cookie notification';
            $data['use_cms_copyright'] = $footerConfigs['use_cms_copyright_label'] ?? 0;
            $data['copyright'] = $footerConfigs['copyright'] ?? '';
            $data['all_rights_translation'] = $footerConfigs['all_rights_reserved'] ?? '';
            $data['footer']['about_dafabet_title'] = $footerConfigs['about_dafabet_title'] ?? '';
            $data['footer']['about_dafabet_content'] = $footerConfigs['about_dafabet_content'] ?? '';
            $imageUrl = $footerConfigs['file_image_ambassador_image'];
            $data['footer']['file_image_ambassador_image'] = $this->asset
                ->generateAssetUri($imageUrl);
            $data['footer']['ambassador_redirection_link'] = $footerConfigs['ambassador_redirection_link'];
            $data['footer']['ambassador_link_target'] = $footerConfigs['ambassador_link_target'];
            $data['footer']['ambassador_title'] = $footerConfigs['ambassador_title'];
            $data['footer']['enable_18plus'] = $footerConfigs['enable_18plus'];
            $data['footer']['file_image_18plus_image'] = $footerConfigs['file_image_18plus_image'];
            $data['footer']['responsible_gaming_message'] = $footerConfigs['responsible_gaming_message'];
            if (!empty($footerConfigs['back_to_top_title'])) {
                $data['back_to_top'] = !$this->blockUtils->isVisibleOn($footerConfigs['back_to_top_title']);
            }

            $this->setFooterDataByVersion($data['enable_new_style'], $data);
        } catch (\Exception $e) {
            $footerConfigs = [];
            $data['cookie_notification'] = 'Cookie Notification';
        }

        return $data;
    }

    /**
     * Data convert and sort
     *
     * @return array
     */
    public function dataConvert($floatingFooter)
    {
        $footerTabs = [];
        foreach ($floatingFooter as $key => $tab) {
            if ($tab['field_status_tab'][0]['value']) {
                $footerTabs[$key]['name_tab'] = strtolower($tab['name'][0]['value']);
                $footerTabs[$key]['label_tab'] = $tab['field_label_tab'][0]['value'];
                $footerTabs[$key]['icon_tab'] = $this->asset->generateAssetUri(
                    $tab['field_icon_tab'][0]['url'],
                    ['product' => $this->product->getProduct()]
                );
                $footerTabs[$key]['active_icon_tab'] = $this->asset->generateAssetUri(
                    $tab['field_active_icon_tab'][0]['url'],
                    ['product' => $this->product->getProduct()]
                );
                $footerTabs[$key]['status_tab'] = $tab['field_status_tab'][0]['value'];
                $footerTabs[$key]['weight'] = $tab['weight'][0]['value'];
                $footerTabs[$key]['page_url'] = $tab['field_page_url'][0]['value'] ?? "";
            }
        }
        $counts = array_map(function ($v) {
            return $v['weight'];
        }, $footerTabs);

        array_multisort($counts, SORT_ASC, SORT_NUMERIC, $footerTabs);

        return $footerTabs;
    }

    /**
     * Set data needed by footer based on version
     * @param boolean $isV2
     * @param array $data
     */
    private function setFooterDataByVersion($isV2, &$data)
    {
        if ($isV2) {
            $this->setFooterV2($data);
        } else {
            $this->setFooterV1($data);
        }
    }

     /**
     * Sets data needed for footer version 1.0
     * @param array $data
     */
    private function setFooterV1(&$data)
    {
        try {
            $data['entrypage_config'] = $this->configs->getConfig('mobile_entrypage.entrypage_configuration');
        } catch (\Exception $e) {
            $data['entrypage_config'] = [];
        }

        try {
            $data['footer_menu'] = $this->menus->getMultilingualMenu('mobile-footer');
        } catch (\Exception $e) {
            $data['footer_menu'] = [];
        }
    }

    /**
     * Returns data needed for footer version 2.0
     * @param array $data
     */
    private function setFooterV2(&$data)
    {
        // Sponsor
        try {
            $sponsorConfigs = $this->configs->getConfig('webcomposer_config.mobile_sponsor_list_v2');
            $data['sponsor_title_font_size'] = $sponsorConfigs['field_sponsor_title_font_size'] ?? '';
            $data['sponsor_subtitle_font_size'] = $sponsorConfigs['field_sponsor_subtitle_font_size'];
        } catch (\Exception $e) {
            $data['sponsor_title_font_size'] = '';
            $data['sponsor_subtitle_font_size'] = '';
        }

        // Quick links
        try {
            $quicklinks = $this->menus->getMultilingualMenu('footer-quicklinks');
            $this->processQuicklinks($quicklinks);
            $data['footer']['quicklinks'] = $quicklinks;
        } catch (\Exception $e) {
            $data['footer']['quicklinks'] = [];
        }

        // Social Media
        try {
            $socialMediaData = $this->views->getViewById('social-media');
            $socialdata = reset($socialMediaData);
            $socialIcons = $socialdata['field_social_media_cmi'] ?? [];
            $media = [];

            foreach ($socialIcons as $icon) {
                if ($icon['field_socialmedia_cmi_enable'][0]['value'] == 1) {
                    $media[] = $icon;
                }
            }

            $data['footer']['socialmedia'] = $media;
        } catch (\Exception $e) {
            $data['footer']['socialmedia'] = [];
        }

        // Partners
        try {
            $partners =  $this->views->getViewById('partner_mobile');
            $data['footer']['partners'] = $this->processPartners($partners);
        } catch (\Exception $e) {
            $data['footer']['partners'] = [];
        }
    }

    /**
     * Process partners list
     */
    private function processPartners($partners)
    {
        $partnersArr = [];
        foreach ($partners as $id => $partner) {
            foreach ($partner as $key => $items) {
                if ($key === 'field_res_partner_mobile_logo') {
                    $partnersArr[$id][$key] = $items;
                    if (isset($items[0]['url'])) {
                        $partnersArr[$id][$key][0]['url'] = $this->asset->generateAssetUri(
                            $items[0]['url'],
                            ['product' => $this->product->getProduct()]
                        );
                    }
                }

                $partnersArr[$id][$key] = $items;
            }
        }
        return $partnersArr;
    }

    /**
     * Process quicklinks menu items
     * @param array $quicklinks
     */
    private function processQuicklinks(&$quicklinks)
    {
        if ($quicklinks) {
            foreach ($quicklinks as $key => $link) {
                // Check if post-login url needs to be returned
                $postLoginURLEnabled = ($link['attributes']['postLoginURLEnabled'] ?? 0) === 1;
                $postLoginURL = $link['attributes']['postLoginURL'] ?? '#';
                if ($postLoginURLEnabled && $this->playerSession->isLogin()) {
                    $quicklinks[$key]['alias'] = $postLoginURL;
                }
            }
        }
    }
}
