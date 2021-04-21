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
        $sponsorsData = $this->formatData($this->getSponsorsData(), $language);
        $pnxData = $this->formatData($this->getPnxData(), $language);
        $prodData = $this->formatData($this->getProducts(), $language);

        $result =  array_merge($loginData, $sponsorsData, $pnxData, $prodData);

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
     * Get sponsors title
     */
    private function getSponsorsData()
    {
        try {
            $sponsors = $this->get('config_fetcher')->getConfig('mobile_entrypage.entrypage_configuration');
        } catch (\Exception $e) {
            $sponsors = [];
        }

        $data['homescreen_sponsors'] = $sponsors['parnerts_and_sponsor_title_text'] ?? '';
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
