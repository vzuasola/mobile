<?php

namespace App\MobileEntry\Component\PushNotification;

use App\Utils\IP;
use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class PushNotificationComponentScripts implements ComponentAttachmentInterface
{
    const REPLY = 'reply';
    const EVENTBUS = 'eventbus';

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
            $container->get('response'),
            $container->get('parameters'),
            $container->get('config_fetcher'),
            $container->get('user_fetcher'),
            $container->get('player_session'),
            $container->get('session_fetcher'),
            $container->get('block_utils')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($request, $response, $parameters, $config, $user, $playerSession, $session_fetcher, $block_utils)
    {
        $this->request = $request;
        $this->response = $response;
        $this->parameters = $parameters;
        $this->config = $config;
        $this->user = $user;
        $this->playerDetails = false;
        $this->playerSession = $playerSession;
        $this->sessionFetcher = $session_fetcher;
        $this->blockUtils = $block_utils;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        return [
            'authenticated' => $this->playerSession->isLogin(),
            'pushnx' => $this->getPushConfig()
        ];
    }

    public function getPushConfig()
    {
        $this->pnxconfig = $this->config->getGeneralConfigById('pushnx_configuration');

        // first checkpoint is pushnx enabled
        if (!$this->isPushnxEnabled()) {
            return ['enabled' => false];
        }

        if ($this->playerSession->isLogin()) {
            $this->playerDetails = $this->user->getPlayerDetails();
            $this->playerLocale = strtolower($this->playerDetails['locale']);
        }

        // second checkpoint is player logged-in
        if (!$this->playerDetails) {
            return ['enabled' => false];
        }

        // third checkpoint is current page excluded
        if ($this->blockUtils->isVisibleOn($this->pnxconfig['exclude_pages'])) {
            return ['enabled' => false];
        }

        $data['enabled'] = $this->isPushnxEnabled();
        $data['playerId'] = $this->playerDetails['playerId'];
        $data['productId'] = $this->playerDetails['productId'];
        $data['clientIP'] = IP::getIpAddress();
        $data['lang'] = $this->playerLocale;

        $data['token'] = $this->sessionFetcher->getAuthToken();

        $domain = $this->pnxconfig['domain'] ?? '';

        // websocket
        $data['connection']['socket']['eventBus'] = $this->getURI(true, $this->response, $domain)[self::EVENTBUS];
        $data['connection']['socket']['replyUri'] = $this->getURI(true, $this->response, $domain)[self::REPLY];

        // no websocket
        $data['connection']['fallback']['eventBus'] = $this->getURI(false, $this->response, $domain)[self::EVENTBUS];
        $data['connection']['fallback']['replyUri'] = $this->getURI(false, $this->response, $domain)[self::REPLY];

        $data['dateformat'] = [
            'format' => $this->getConfigByPlayerLocale('date_format'),
            'offset' => $this->getConfigByPlayerLocale('date_offset')
        ];

        $data['delayCount'] = $this->pnxconfig['delay_count'];
        $data['displayAllMessage'] = $this->pnxconfig['debug_display_all'];
        $data['displayExpiryDate'] = $this->pnxconfig['debug_display_expirydate'];
        $data['expiryDelayCount'] = $this->pnxconfig['expiry_delay_count'];
        $data['logging'] = $this->pnxconfig['debug_logging'];
        $data['loginSelector'] = $this->pnxconfig['login_selector'];
        $data['productTypeId'] = $this->configProductId($this->pnxconfig['producttype_id']);
        $data['productTypeIdMapping'] = $this->configProductMapping();
        $data['productTypeIdIcon'] = $this->configIconMapping();
        $data['retryCount'] = $this->pnxconfig['retry_count'];

        $data['dismiss']['button_label'] = $this->pnxconfig['dismiss_button_label'];
        $data['dismiss']['content'] = $this->pnxconfig['dismiss_content'];
        $data['dismiss']['yes'] = $this->pnxconfig['dismiss_yes'];
        $data['dismiss']['no'] = $this->pnxconfig['dismiss_no'];

        $data['texts'] = $this->parseTranslatedTexts();
        $data['texts']['expired_message'] = $this->getConfigByPlayerLocale('expiry_error_message');

        $data['disableBonusAward'] = $this->pnxconfig['disableBonusAward'] ?? 0;

        return $data;
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
     * Get config by player locale
     */
    private function getConfigByPlayerLocale($index)
    {
        $map = array_map('trim', explode(PHP_EOL, $this->pnxconfig[$index]));
        foreach ($map as $value) {
            list($lang, $text) = explode('|', $value);
            if (strtolower($lang) == $this->playerLocale) {
                return $text;
            }
            // Fallback for empty locale
            if (!$this->playerLocale) {
                return $text;
            }
        }
    }

    /**
     * Get eventbus and reply URI
     */
    private function getURI($hasWebsocket, $response, $domainConfig)
    {
        $replyPrefix = $this->parameters['pushnx.api.reply.prefix'];
        $eventbusPrefix = $this->parameters['pushnx.api.eventbus.prefix'];
        $fallbackPrefix = $this->parameters['pushnx.fallback.prefix'];

        // Get the domain from configuration if not empty, else from parameters
        $domain = empty($domainConfig) ? $this->parameters['pushnx.server'] : $domainConfig;
        // If browser has no web socket, use fallback path
        // $lang = $response->getHeader('Content-Language');
        $lang = 'en';
        $domain = $hasWebsocket === false ? "/$lang$fallbackPrefix" : $domain;

        return [
            self::EVENTBUS => "$domain$eventbusPrefix",
            self::REPLY => "$domain$replyPrefix",
        ];
    }

    private function configProductId($id)
    {
        return array_map('trim', explode(',', $id));
    }

    private function configProductMapping()
    {
        $mapped = [];
        $map = array_map('trim', explode(PHP_EOL, $this->pnxconfig['producttype_id_mapping']));
        $map = str_replace(' ', '', $map);

        foreach ($map as $value) {
            list($typeid, $text,) = explode('|', $value);
            $mapped[$typeid] = strtolower($text);
        }

        return $mapped;
    }

    private function configIconMapping()
    {
        $mapped = [];
        $map = array_map('trim', explode(PHP_EOL, $this->pnxconfig['producttype_id_mapping']));
        $map = str_replace(' ', '', $map);

        foreach ($map as $value) {
            list($typeid,, $icon) = explode('|', $value);
            $mapped[$typeid] = strtolower($icon);
        }

        return $mapped;
    }

    /**
     * Parse translated texts
     */
    private function parseTranslatedTexts()
    {
        $map = array_map('trim', explode(PHP_EOL, $this->pnxconfig['translated_texts']));
        $map = str_replace(' ', '', $map);

        $texts = [];

        foreach ($map as $value) {
            $key = strtolower($value);
            $index = 'text_' . $key;
            $data = $this->getConfigByPlayerLocale($index);
            $texts[$key] = $data;
        }

        return $texts;
    }
}
