<?php

namespace App\MobileEntry\Component\Header;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class HeaderComponentScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $loginConfig;

    private $product;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('product_resolver')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $loginConfig, $product)
    {
        $this->playerSession = $playerSession;
        $this->loginConfig = $loginConfig;
        $this->product = $product;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $config = $this->loginConfig->getConfig('webcomposer_config.login_configuration');
        } catch (\Exception $e) {
            $config = [];
        }

        return [
            'authenticated' => $this->playerSession->isLogin(),
            'error_message_blank_username' => $config['error_message_blank_username'],
            'error_message_blank_password' => $config['error_message_blank_password'],
            'error_message_blank_passname' => $config['error_message_blank_passname'],
            'error_message_invalid_passname' => $config['error_message_invalid_passname'],
            'error_message_service_not_available' => $config['error_message_service_not_available'],
            'error_message_account_suspended' => $config['error_message_account_suspended'],
            'error_message_account_locked' => $config['error_message_account_locked'],
            'product' => $this->product->getPageProduct()
        ];
    }
}
