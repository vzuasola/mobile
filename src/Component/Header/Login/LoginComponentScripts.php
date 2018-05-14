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

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configs, $playerSession)
    {
        $this->configs = $configs;
        $this->playerSession = $playerSession;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $config = $this->configs->getConfig('webcomposer_config.login_configuration');
        } catch (\Exception $e) {
            $config = [];
        }

        return [
            'authenticated' => $this->playerSession->isLogin(),

            'error_messages' => [
                'blank_username' => $config['error_message_blank_username'] ?? '',
                'blank_password' => $config['error_message_blank_password'] ?? '',
                'blank_passname' => $config['error_message_blank_passname'] ?? '',
                'invalid_passname' => $config['error_message_invalid_passname'] ?? '',
                'service_not_available' => $config['error_message_service_not_available'] ?? '',
                'account_suspended' => $config['error_message_account_suspended'] ?? '',
                'account_locked' => $config['error_message_account_locked'] ?? '',
            ],
        ];
    }
}
