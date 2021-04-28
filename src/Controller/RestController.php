<?php

namespace App\MobileEntry\Controller;

use App\BaseController;
use Slim\Exception\NotFoundException;

class RestController extends BaseController
{
    /**
     *
     */
    public function getJson($request, $response, $args)
    {
        $result = [];
        $language = $this->get('lang') ?? 'en';

        $loginData = $this->formatData($this->getLoginData(), $language);
        $sponsorsData = $this->formatData($this->getEntrypageData($language), $language);
        $menuData = $this->formatData($this->getMenuData(), $language);
        $pnxData = $this->formatData($this->getPnxData(), $language);
        $prodData = $this->formatData($this->getProducts(), $language);
        $homeContactUs = $this->formatData($this->getHomeContactUs(), $language);
        $casinoFilters = $this->formatData($this->getCasinoFilters($language), $language);
        $gamesFilters = $this->formatData($this->getGamesFilters($language), $language);
        $footer = $this->formatData($this->getFooterData(), $language);
        $myaccount = $this->formatData($this->getMyAccountFormData(), $language);
        $changePass = $this->formatData($this->getChangePassFormData(), $language);

        $result =  array_merge(
            $loginData,
            $sponsorsData,
            $pnxData,
            $menuData,
            $prodData,
            $homeContactUs,
            $casinoFilters,
            $gamesFilters,
            $footer,
            $myaccount,
            $changePass
        );

        return $this->rest->output($response, $result);
    }

    /**
     * Get login text, labels and configurations
     */
    private function getLoginData()
    {
        try {
            $headerConfigs = $this->get('config_fetcher')
                ->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $headerConfigs = [];
        }

        $data['remember_username'] = $headerConfigs['mobile_remember'] ?? 'Remember Username';
        $data['text_join_now'] = $headerConfigs['join_now_text'] ?? 'Join Now';
        $data["loginscreen_can't_login"] = $headerConfigs['login_issue_text'] ?? 'Cant Login ?';

        try {
            $loginConfigs =  $this->get('config_fetcher')
                ->getConfig('webcomposer_config.login_configuration');
        } catch (\Exception $e) {
            $loginConfigs = [];
        }

        $data['input_label_username'] = $loginConfigs['username_placeholder'] ?? 'Username';
        $data['input_label_password'] = $loginConfigs['password_placeholder'] ?? 'Password';
        $data['1'] = $loginConfigs['login_bottom_label'] ?? 'Login';
        $data['loginscreen_register_ask'] = $loginConfigs['lightbox_blurb'] ?? 'Not yet a Dafabet member ?';
        $data['blank_username'] = $loginConfigs['error_message_blank_username'] ?? '';
        $data['blank_password'] = $loginConfigs['error_message_blank_password'] ?? '';
        $data['blank_passname'] = $loginConfigs['error_message_blank_passname'] ?? '';
        $data['loginscreen_message_err'] = $loginConfigs['error_message_invalid_passname'] ?? '';
        $data['error_message_restricted_country'] = $loginConfigs['error_message_restricted_country'] ?? '';
        $data['service_not_available'] = $loginConfigs['error_message_service_not_available'] ?? '';
        $data['account_suspended'] = $loginConfigs['error_message_account_suspended'] ?? '';
        $data['account_locked'] = $loginConfigs['error_message_account_locked'] ?? '';

        return $data;
    }

    /**
     * Get sponsors title, socials title
     */
    private function getEntrypageData($language)
    {
        $copyright = [
            'en' => 'Copyright',
            'eu' => 'Copyright',
            'sc' => '版权',
            'ch' => '版權',
            'th' => 'ลิขสิทธิ์',
            'vn' => 'Bản Quyền',
            'id' => 'Hak cipta',
            'jp' => 'Copyright',
            'kr' => 'Copyright',
            'in' => 'Copyright',
            'hi' => 'कॉपीराइट',
            'te' => 'కాపీరైట్',
            'gr' => 'Πνευματική Ιδιοκτησία',
            'pl' => 'Copyright',
            'es' => 'Copyright',
            'pt' => 'Copyright',
            'lo' => 'ລິຂະສິດ',
            'bu' => 'မူပိုင္ခြင့္',
            'km' => 'រក្សាសិទ្ធិ©ឆ្នាំ',
        ];

        $allrights = [
            'en' => 'All Rights Reserved',
            'eu' => 'All Rights Reserved',
            'sc' => '版权所有',
            'ch' => '版權所有',
            'th' => 'สงวนลิขสิทธิ์',
            'vn' => 'Tất Cả Các Quyền Được Bảo Hộ',
            'id' => 'Semua hak dilindungi',
            'jp' => 'All Rights Reserved',
            'kr' => 'All Rights Reserved',
            'in' => 'All Rights Reserved',
            'hi' => 'सभी अधिकार आरक्षित',
            'te' =>
                'అన్ని హక్కులూ ప్రత్యేకించుకోవడమైనది',
            'gr' => 'Όλα τα Δικαιώματα Κατοχυρωμένα',
            'pl' => 'Wszystkie prawa zastrzeżone',
            'es' => 'Todos los Derechos Reservados',
            'pt' => 'Todos os Direitos Reservados',
            'lo' => 'ຂ້າພະເຈົ້າລິຂະສິດ:',
            'bu' => 'အားလံုးေသာၾကိဳတင္ကာကြယ္ခြင့္',
            'km' => 'រក្សា​រ​សិទ្ធ​គ្រប់យ៉ាង',
        ];

        try {
            $entryConfig = $this->get('config_fetcher')->getConfig('mobile_entrypage.entrypage_configuration');
        } catch (\Exception $e) {
            $entryConfig = [];
        }

        $data['homescreen_sponsors'] = $entryConfig['parnerts_and_sponsor_title_text'] ?? '';
        $data['homescreen__contactus_title'] = $entryConfig['contact_us_home_text'] ?? '';
        $data['bottomnav_copyright'] = $copyright[$language] ?? '';
        $data['bottomnav_all_right'] = $allrights[$language] ?? '';

        return $data;
    }

    /**
     * Get push notification text, labels and configurations
     */
    private function getPnxData()
    {
        try {
            $pnxConfig = $this->get('config_fetcher')->getConfig('webcomposer_config.pushnx_configuration_v2');
        } catch (\Exception $e) {
            $pnxConfig = [];
        }
        /**
         * Remove special html chars and use part of array we need
         * DISMISS ALL NOTIFICATION
         */
        $dismissAll = $pnxConfig['dismiss_content']['value'];
        $pushNotifDismissSubstr = substr($dismissAll, 0, strpos($dismissAll, "/p>&#13;\n&#13;"));
        $pushNotifDismissHtml = strip_tags($pushNotifDismissSubstr);
        $pushNotifDismissReplace = preg_replace('/&#13;\n/i', ' ', $pushNotifDismissHtml);
        $pushNotifDismiss = $pushNotifDismissReplace;

        /**
         * Remove special html chars and use part of array we need
         * push notification warning
         */
        $pushNotifWarningSubstr = strstr($dismissAll, '?');
        $pushNotifWarningHtmlRemove = strip_tags($pushNotifWarningSubstr);
        $pushNotifWarningReplace = preg_replace('/&#13;|&#13;\n|\n|[-?]|\s+/i', ' ', $pushNotifWarningHtmlRemove);
        $pushNotifWarning = trim($pushNotifWarningReplace);

        $data['pushnotif_title'] = $pnxConfig['title']
            ?? "PUSH NOTIFICATION";
        $data['pushnotif_dismissall'] = $pnxConfig['dismiss_button_label']
            ?? "Dismiss Al";
        $data['pushnotif_dismiss'] = $pushNotifDismiss
            ?? "ARE YOU SURE YOU WANT TO DISMISS ALL NOTIFICATIONS?";
        $data['pushnotif_warning'] = $pushNotifWarning
            ?? "Dismissing all notifications will also decline all promotions you are eligible to";
        $data['pushnotif_yes'] = $pnxConfig['dismiss_yes']
            ?? "YES";
        $data['pushnotif_no'] = $pnxConfig['dismiss_no']
            ?? "NO";
        return $data;
    }

    public function getProducts()
    {
        $product = [];
        $productTiles = $this->get('views_fetcher')->getViewById('product_lobby_tiles_entity');

        foreach ($productTiles as $key => $productTile) {
            if (isset($productTile['field_product_lobby_url_post_log'][0]['uri'])) {
                $encode = base64_encode($productTile['field_product_lobby_url_post_log'][0]['uri']);
                $productTile['field_post_login_url_encoded'] = $encode;
            }

            $product[$productTile['field_product_lobby_id'][0]['value']] =
                $productTile['field_product_lobby_title'][0]['value'];
        }

        $data['homescreen_icon_ow-sports'] = $product['product-owsports'] ?? "OW Sports";
        $data['homescreen_icon_dafa-sports'] = $product['product-dafasports'] ?? "Dafa Sports";
        $data['homescreen_icon_games'] = $product['product-casino'] ?? "Casino";
        $data['homescreen_icon_live-dealer'] = $product['product-live-dealer'] ?? "Live Dealer";
        $data['homescreen_icon_arcade'] = $product['product-arcade'] ?? "Arcade";

        return $data;
    }

    private function getFooterData()
    {
        try {
            $footerMenu = [];
            $footerMenu = $this->get('menu_fetcher')->getMultilingualMenu('mobile-footer');
            foreach ($footerMenu as $key => $value) {
                $footerMenu[$value['attributes']['svg']] = $value['title'];
            }
        } catch (\Exception $e) {
            $footerMenu = [];
        }

        $data['bottomnav_language'] = $footerMenu['footer-language'] ?? 'Language';
        $data['bottomnav_desktop_site'] = $footerMenu['footer-desktop'] ?? 'View Desktop Site';

        return $data;
    }

    private function getMenuData()
    {
        try {
            $headerConfigs = $this->get('config_fetcher')
                ->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $headerConfigs = [];
        }

        try {
            $menu = [];
            $tiles = $this->get('views_fetcher')->getViewById('mobile_product_menu');

            foreach ($tiles as $key => $tile) {
                $menu[$tile['field_product_menu_id'][0]["value"]] = $tile["field_product_menu_title"][0]["value"];
            }
        } catch (\Exception $e) {
            $menu = [];
        }


        try {
            $quicklinksMenu = [];
            $quicklinks = $this->get('menu_fetcher')->getMultilingualMenu('quicklinks');

            foreach ($quicklinks as $key => $value) {
                $quicklinksMenu[$value['attributes']['svg']] = $value['title'];
            }
        } catch (\Exception $e) {
            $quicklinksMenu = [];
        }

        try {
            $topMenu = $this->get('menu_fetcher')->getMultilingualMenu('mobile-post-login');
            foreach ($topMenu as $key => $value) {
                if (strpos($value['uri'], 'cashier')) {
                    $data['drawer_cashier'] = $value['title'] ?? 'CASHIER';
                }
                if (strpos($value['uri'], 'account')) {
                    $data['drawer_MyAccount'] = $value['title'] ?? 'MY ACCOUNT';
                }
            }
        } catch (\Exception $e) {
            $topMenu = [];
        }

        try {
            $secondaryMenu = [];
            $secondary = $this->get('menu_fetcher')->getMultilingualMenu('secondary-menu');

            foreach ($secondary as $key => $value) {
                if (strpos($value['uri'], 'security')) {
                    $secondaryMenu['security'] = $value['title'];
                } elseif (strpos($value['uri'], 'terms')) {
                    $secondaryMenu['terms'] = $value['title'];
                } elseif (strpos($value['uri'], 'privacy')) {
                    $secondaryMenu['privacy'] = $value['title'];
                } elseif (strpos($value['uri'], 'affiliates')) {
                    $secondaryMenu['affiliates'] = $value['title'];
                } elseif (strpos($value['uri'], 'responsible')) {
                    $secondaryMenu['responsible'] = $value['title'];
                }
            }
        } catch (\Exception $e) {
            $secondaryMenu = [];
        }

        $data['drawer_total-balance'] = $headerConfigs['total_balance_label'] ?? 'Total Balance';
        $data['drawer_links'] = $headerConfigs['links_title'] ?? 'Links';
        $data['homescreen__menu_lottery'] = $menu['product-lottery'] ?? 'Lottery';
        $data['homescreen__menu_virtuals'] = $menu['product-virtuals']  ?? 'Virtuals';
        $data['homescreen__menu_casino'] = $menu['product-casino']  ?? 'Casino';
        $data['homescreen__menu_promotions'] = $menu['product-promotions'] ?? 'Promotions';
        $data['drawer_home'] = $quicklinksMenu['quicklinks-home'] ?? 'Home';
        $data['drawer_announcement'] = $quicklinksMenu['quicklinks-announcement'] ?? 'Announcement';
        $data['drawer_promotions'] = $quicklinksMenu['quicklinks-promotions'] ?? 'Promotions';
        $data['drawer_payments'] = $quicklinksMenu['quicklinks-payments'] ?? 'Payments';
        $data['drawer_contact_us'] = $quicklinksMenu['quicklinks-contact'] ?? 'Contact Us';
        $data['drawer_notification'] = $quicklinksMenu['quicklinks-notifications'] ?? 'Notifications';
        $data['drawer_payments'] = $quicklinksMenu['quicklinks-payments'] ?? 'Payments';
        $data['drawer_logout'] = $secondaryMenu['logout'] ?? 'Logout';
        $data['drawer_AboutUs'] = $secondaryMenu['about'] ?? 'About Us';
        $data['drawer_security'] = $secondaryMenu['security'] ?? 'Security';
        $data['drawer_privacy_policy'] = $secondaryMenu['privacy'] ?? 'Privacy Policy';
        $data['drawer_terms_of_use'] = $secondaryMenu['terms'] ?? 'Terms of use';
        $data['drawer_security'] = $secondaryMenu['security'] ?? 'Security';
        $data['drawer_affiliates'] = $secondaryMenu['affiliates'] ?? 'Affiliates';
        $data['drawer_ResponsibleGaming'] = $secondaryMenu['responsible'] ?? 'Responsible Gaming';

        return $data;
    }

    private function getGamesFilters()
    {
        $gamesLang = [
            "en",
            "sc",
            "th",
            "vn",
            "id",
            "in",
            "hi",
            "te",
            "kr",
            "pt",
            "es",
            "bu",
            "lo",
            "km",
        ];
        try {
            $filters = [];
            if (in_array($language, $gamesLang)) {
                $filterView = $this->get('views_fetcher')->withProduct('mobile-games');
                $filters = $filterView->getViewById('games_filter');
            }
        } catch (\Exception $e) {
            $filters = [];
        }

        $data = $this->getFilters($filters, 'games_filter_');

        return $data;
    }

    private function getCasinoFilters($language)
    {
        $casinoLang = [
            "en",
            "sc",
            "th",
            "vn",
            "id",
            "kr",
            "in",
            "hi",
            "te",
            "pt",
            "es",
            "lo",
            "bu",
            "km",
        ];

        try {
            $searchConfig = [];
            if (in_array($language, $casinoLang)) {
                $searchConfig = $this->get('config_fetcher')
                    ->withProduct('mobile-casino')
                    ->getConfig('games_search.search_configuration');
            }
        } catch (\Exception $e) {
            $searchConfig = [];
        }

        try {
            $filters = [];
            if (in_array($language, $casinoLang)) {
                $filterView = $this->get('views_fetcher')->withProduct('mobile-casino');
                $filters = $filterView->getViewById('games_filter');
            }
        } catch (\Exception $e) {
            $filters = [];
        }

        $filterItems = [];
        $blurb = explode(' {count} ', $searchConfig['search_blurb']);
        $data['games_search_shown'] = $blurb[0] ?? "Showing";
        $data['games_search_result'] = $blurb[1] ?
            trim(str_replace('"<strong>{keyword}</strong>"', '', $blurb[1])) : "result/s for";
        $data['games_search_notfound'] = $searchConfig['search_no_result_msg'] ?
            trim(str_replace("<strong>{keyword}</strong>.", '', $searchConfig['search_no_result_msg'])) : "";
        $data['games_search_suggest'] = $searchConfig['msg_recommended_available']
            ?? "You might want to try our recommended games.";
        $data['games_search'] = $searchConfig['search_title'] ?? "";
        $data['games_filter_submit'] = $searchConfig['games_filter_submit'] ?? "Submit";
        $data['games_filter_cancel'] = $searchConfig['games_filter_cancel'] ?? "Clear";
        $data['games_filter'] = $searchConfig['games_filter_title'] ?? "Filter";
        $data['games_search'] = $searchConfig['search_title'] ?? "Search";
        $filterItems = $this->getFilters($filters, "casino_filter_");

        return $data + $filterItems;
    }

    private function getFilters($filters, $prefix)
    {
        $data = [];
        $parents = [];
        foreach ($filters as $filter) {
            $parent = str_replace([' ', '-'], '_', strtolower($filter['parent']['name'][0]['value']));
            $key_prefix = $prefix . $parent;
            if (!isset($parents[$parent])) {
                $data[$key_prefix] =
                    $filter['parent']['field_games_filter_label'][0]['value'];
                $parents[$parent] = $parent;
            }
            $key = str_replace([' ', '-'], '_', strtolower($filter['name'][0]['value']));
            $data[$key_prefix . '_' . $key] = $filter['field_games_filter_label'][0]['value'];
        }

        return $data;
    }

    private function getMyAccountFormData()
    {
        $data = [];
        $keyMap = [
            'account_markup' => [
                'key' => 'myaccount_account_details',
                'value' => 'Account Details'
            ],
            'birthdate' => [
                'key' => 'myaccount_birth_date',
                'value' => 'Date of Birth'
            ],
            'communication_markup' => [
                'key' => 'myaccount_communication_details',
                'value' => 'Communication Details'
            ],
            'gender' => [
                'key' => 'myaccount_gender',
                'value' => 'Gender'
            ],
            'primary' => [
                'key' => 'myaccount_primary',
                'value' => 'Primary'
            ],
            'city' => [
                'key' => 'myaccount_town_city',
                'value' => 'Town / City'
            ],
            'address_markup' => [
                'key' => 'myaccount_home_address',
                'value' => 'Home Address'
            ],
            'address' => [
                'key' => 'myaccount_address',
                'value' => 'Address'
            ],
            'postal_code' =>[
                'key' => 'myaccount_postal_code',
                'value' => 'Postal Code'
            ],
            'preference_markup' => [
                'key' => 'myaccount_contact_preference',
                'value' => 'Contact Preference'
            ],
            'submit' => [
                'key' => 'myaccount_save',
                'value' => 'SAVE'
            ],
        ];

        try {
            $formMyProfile = $this->get('config_form_fetcher')
                ->withProduct('account')->getDataById('my_profile_form');

            foreach ($formMyProfile['fields'] as $key => $field) {
                if (!array_key_exists($key, $keyMap)) {
                    continue;
                }

                $data[$keyMap[$key]['key']] = $field['field_settings']['label'] ?? $keyMap[$key]['value'];
                if ($field['type'] === 'markup') {
                    $data[$keyMap[$key]['key']] = $field['field_settings']['markup'] ?
                        strip_tags($field['field_settings']['markup'])
                        : $keyMap[$key]['value'];
                    if ($key == 'preference_markup') {
                        $markup = explode("<hr>", $field['field_settings']['markup']);
                        $data[$keyMap[$key]['key']] = $markup[0];
                        $data['myaccount_confirmation_detail'] = preg_replace(
                            '/&#13;|&#13;\n|\n|[-?]|\s+/i',
                            ' ',
                            strip_tags($markup[1])
                        );
                    }
                }
                if ($key === 'gender') {
                    $choices = explode(PHP_EOL, $field['field_settings']['choices']);
                    $data['myaccount_gender_male'] = $choices[0] ?
                        str_replace(["\r", "\n", "M|"], '', $choices[0]) : 'Male';
                    $data['myaccount_gender_female'] = $choices[1] ?
                        substr($choices[1], 2) : 'Female';
                }
            }
        } catch (\Exception $e) {
            $formMyProfile = [];
        }

        return $data;
    }

    private function getChangePassFormData()
    {
        try {
            $changePass = $this->get('config_form_fetcher')
                ->withProduct('account')->getDataById('account_change_password_form');

            $fields = [];
            foreach ($changePass['fields'] as $key => $field) {
                $fields[$key] = $field['field_settings']['label'] ?? '';
            }

            $data['myaccount_current_pass'] = $fields['current_password'] ?? 'Current Password';
            $data['myaccount_new_pass'] = $fields['new_password'] ?? 'New Password';
            $data['myaccount_confirm_password'] = $fields['verify_password'] ?? 'Current Password';
        } catch (\Exception $e) {
            $changePass = [];
        }

        return $data;
    }

    public function getHomeContactUs()
    {
        $menu_item = [];
        try {
            $menu = $this->menus->getMultilingualMenu('mobile-contact-us');
        } catch (\Exception $e) {
            $menu = [];
        }

        foreach ($menu as $item) {
            $menu_item[$item['attributes']['svg']] = $item['title'];
        }

        $data['homescreen__contactus_title_live_chat'] = $menu_item['contact-live-chat'] ?? 'Live Chat';
        $data['homescreen__contactus_title_phone'] = $menu_item['contact-phone'] ?? 'Telephone';
        $data['home_contact_email'] = $menu_item['contact-mail'] ?? 'Email';

        return $data;
    }

    /**
     * Format array
     */
    private function formatData($data, $language)
    {
        $formatted = [];
        foreach ($data as $key => $value) {
            $formatted[] = [
                'id' => $key,
                'data' => [
                    $language => $value
                ]
            ];
        }

        return $formatted;
    }
}
