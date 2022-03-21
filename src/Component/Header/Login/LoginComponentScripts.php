<?php

namespace App\MobileEntry\Component\Header\Login;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class LoginComponentScripts implements ComponentAttachmentInterface
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $player;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('player_session'),
            $container->get('player')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configs, $playerSession, $player)
    {
        $this->configs = $configs;
        $this->playerSession = $playerSession;
        $this->player = $player;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $currency = null;
        $currCountry = (isset($_SERVER['HTTP_X_CUSTOM_LB_GEOIP_COUNTRY'])) ?
            trim($_SERVER['HTTP_X_CUSTOM_LB_GEOIP_COUNTRY']) : '';
        try {
            $currency = null;
            $playerId = null;
            if ($this->playerSession->isLogin()) {
                $currency = $this->player->getCurrency();
                $playerId = $this->player->getPlayerID();
            }

            $config = $this->configs->getConfig('webcomposer_config.login_configuration');
        } catch (\Exception $e) {
            $config = [];
        }

        return [
            'authenticated' => $this->playerSession->isLogin(),
            'username' => $this->playerSession->getUsername(),
            'playerId' => $playerId,
            'currency' => $currency,
            'token' => $this->playerSession->getToken(),
            'country' => $currCountry,

            'error_messages' => [
                'blank_username' => $config['error_message_blank_username'] ?? '',
                'blank_password' => $config['error_message_blank_password'] ?? '',
                'blank_passname' => $config['error_message_blank_passname'] ?? '',
                'invalid_passname' => $config['error_message_invalid_passname'] ?? '',
                'error_message_restricted_country' => $config['error_message_restricted_country'] ?? '',
                'service_not_available' => $config['error_message_service_not_available'] ?? '',
                'account_suspended' => $config['error_message_account_suspended'] ?? '',
                'account_locked' => $config['error_message_account_locked'] ?? '',
            ],
        ];
    }
}
