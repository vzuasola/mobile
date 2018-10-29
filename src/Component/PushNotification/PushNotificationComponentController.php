<?php

namespace App\MobileEntry\Component\PushNotification;

use App\Utils\IP;

/**
 *
 */
class PushNotificationComponentController
{
    const REPLY = 'reply';
    const EVENTBUS = 'eventbus';

    private $rest;

    /**
     * array
     */
    private $pnxconfig;

    /**
     * string
     */
    private $playerLocale;

    /**
     * string
     */
    private $currentPath;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('request'),
            $container->get('rest'),
            $container->get('parameters'),
            $container->get('config_fetcher'),
            $container->get('user_fetcher'),
            $container->get('player_session'),
            $container->get('session_fetcher'),
            $container->get('block_utils'),
            $container->get('lang'),
            $container->get('token_parser')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $request,
        $rest,
        $parameters,
        $config,
        $user,
        $playerSession,
        $sessionFetcher,
        $blockUtils,
        $lang,
        $tokenParser
    ) {
        $this->request = $request;
        $this->rest = $rest;
        $this->parameters = $parameters;
        $this->config = $config;
        $this->user = $user;
        $this->playerDetails = false;
        $this->playerSession = $playerSession;
        $this->sessionFetcher = $sessionFetcher;
        $this->blockUtils = $blockUtils;
        $this->lang = $lang;
        $this->tokenParser = $tokenParser;
    }

    public function pushnx($request, $response)
    {
        $this->pnxconfig = $this->config->getConfig('webcomposer_config.pushnx_configuration_v2');

        // first checkpoint is pushnx enabled
        if (!$this->isPushnxEnabled()) {
            $data['enabled'] = false;
        }

        if ($this->playerSession->isLogin()) {
            $this->playerDetails = $this->user->getPlayerDetails();
            $this->playerLocale = strtolower($this->playerDetails['locale']);
        }

        // second checkpoint is player logged-in
        if (!$this->playerDetails) {
            $data['enabled'] = false;
            $data['player'] = $this->playerDetails;
        }

        // third checkpoint is current page excluded
        if (!empty($this->pnxconfig['exclude_pages'])
            && $this->blockUtils->isVisibleOn($this->pnxconfig['exclude_pages'])) {
            $data['enabled'] = false;
            $data['excluded'] = true;
        }

        if (isset($data['enabled']) && $data['enabled'] === false) {
            return $data;
        }

        $data['enabled'] = $this->isPushnxEnabled();
        $data['playerId'] = $this->playerDetails['playerId'];
        $data['productId'] = $this->playerDetails['productId'];
        $data['clientIP'] = IP::getIpAddress();
        $data['lang'] = $this->playerLocale;

        $data['token'] = $this->playerSession->getToken();

        $domain = $this->pnxconfig['domain'] ?? '';

        // websocket
        $data['connection']['socket']['eventBus'] = $this->getURI(true, $domain)[self::EVENTBUS];
        $data['connection']['socket']['replyUri'] = $this->getURI(true, $domain)[self::REPLY];

        // no websocket
        $data['connection']['fallback']['eventBus'] = $this->getURI(false, $domain)[self::EVENTBUS];
        $data['connection']['fallback']['replyUri'] = $this->getURI(false, $domain)[self::REPLY];

        $data['dateformat'] = [
            'format' => $this->pnxconfig['date_format'],
            'offset' => $this->pnxconfig['date_offset']
        ];

        $data['delayCount'] = $this->pnxconfig['delay_count'];
        $data['displayAllMessage'] = $this->pnxconfig['debug_display_all'];
        $data['displayExpiryDate'] = $this->pnxconfig['debug_display_expirydate'];
        $data['expiryDelayCount'] = $this->pnxconfig['expiry_delay_count'];
        $data['logging'] = $this->pnxconfig['debug_logging'];

        $products = $this->configProduct($this->pnxconfig['product_list']);

        $data['productTypeId'] = $products['productTypeId'];
        $data['productDetails'] = $products['products'];
        $data['retryCount'] = $this->pnxconfig['retry_count'];

        $data['dismiss']['button_label'] = $this->pnxconfig['dismiss_button_label'];
        $data['dismiss']['content'] = $this->pnxconfig['dismiss_content'];
        $data['dismiss']['yes'] = $this->pnxconfig['dismiss_yes'];
        $data['dismiss']['no'] = $this->pnxconfig['dismiss_no'];

        $data['texts']['title'] = $this->pnxconfig['title'];
        $data['texts']['empty'] = $this->pnxconfig['empty'];
        $data['texts']['expired_message'] = $this->pnxconfig['expired_message'];

        $data['disableBonusAward'] = $this->pnxconfig['disableBonusAward'] ?? 0;

        $ctabuttons = $this->configButtons($this->pnxconfig['cta_button_list']);

        $data['cta'] = $ctabuttons;
        $data['pushnx_domains'] = ($this->pnxconfig['domains']) ? $this->parseDomains($this->pnxconfig['domains']) : [];

        return $this->rest->output($response, $data);
    }

    /**
     * Check if push notification is enabled
     */
    private function isPushnxEnabled()
    {
        if (!$this->pnxconfig['enable']) {
            return false;
        }

        if ($this->playerSession->isLogin()) {
            return true;
        }

        return false;
    }

    /**
     * Get eventbus and reply URI
     */
    private function getURI($hasWebsocket, $domainConfig)
    {
        $replyPrefix = $this->parameters['pushnx.api.reply.prefix'];
        $eventbusPrefix = $this->parameters['pushnx.api.eventbus.prefix'];
        $fallbackPrefix = $this->parameters['pushnx.fallback.prefix'];

        // Get the domain from configuration if not empty, else from parameters
        $domain = empty($domainConfig) ? $this->parameters['pushnx.server'] : $domainConfig;
        // If browser has no web socket, use fallback path
        $lang = $this->lang;
        $domain = $hasWebsocket === false ? "/$lang$fallbackPrefix" : $domain;

        return [
            self::EVENTBUS => "$domain$eventbusPrefix",
            self::REPLY => "$domain$replyPrefix",
        ];
    }

    private function configProduct($productlist)
    {
        $texts = array_map('trim', explode(PHP_EOL, $productlist));
        $texts = str_replace(' ', '', $texts);

        foreach ($texts as $text) {
            $identifier = strtolower($text);

            if (!$this->pnxconfig['product_exclude_' . $identifier]) {
                if (!empty($this->pnxconfig['product_type_id_' . $identifier])) {
                    $index = $this->pnxconfig['product_type_id_' . $identifier];
                } else {
                    $index = '0';
                }

                $details['productTypeId'][] = $index;

                $details['products'][$index] = [
                    'label' => $this->pnxconfig['product_label_' . $identifier],
                    'typeid' => $this->pnxconfig['product_type_id_' . $identifier],
                    'icon' => $this->pnxconfig['product_icon_' . $identifier],
                    'allowtodismiss' => $this->pnxconfig['product_exclude_dismiss_'. $identifier]
                ];
            }
        }

        return $details;
    }

    private function parseDomains($domains)
    {
        $map = array_map('trim', explode(PHP_EOL, $domains));

        foreach ($map as $value) {
            list($key, $domain) = explode('|', $value);

            $parsed = $this->tokenParser->processTokens($domain);
            $mapped[$key] = $parsed;
        }

        return $mapped;
    }

    private function configButtons($buttonlist)
    {
        $texts = array_map('trim', explode(PHP_EOL, $buttonlist));
        $texts = str_replace(' ', '', $texts);

        foreach ($texts as $text) {
            $identifier = strtolower($text);

            $details['buttons'][$identifier] = [
                'label' => $this->pnxconfig['cta_label_' . $identifier],
                'action' => $this->actionToken($this->pnxconfig['cta_actions_' . $identifier]),
            ];
        }

        return $details;
    }

    private function actionToken($action)
    {
        if ($action) {
            $arr = explode('::', $action);

            if (sizeof($arr) > 1) {
                $domain = $this->tokenParser->processTokens($arr[1]);

                $arr[1] = $domain;

                return implode('::', $arr);
            }
        }

        return $action;
    }
}
