<?php

namespace App\MobileEntry\Component\Main\CantLogin;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class CantLoginComponent implements ComponentWidgetInterface
{
    /**
     * Config Fetcher object.
     */
    private $configFetcher;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configFetcher)
    {
        $this->configFetcher = $configFetcher->withProduct('account');
    }

    /**
     * {@inheritdoc}
     */
    public function getTemplate()
    {
        return '@component/Main/CantLogin/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        $config = $this->configFetcher->getConfigById('cant_login');

        return [
            'titleForgot' => $config['cant_login_title'] ?? 'Cannot Access your Dafabet Account?',
            'titleReset' => $config['reset_title'] ?? 'Password Reset Request',
            'passwordLink' => $config['forgot_password_link'] ?? '#forgot-password-content',
            'passwordTabMenu' => $config['forgot_password_tab_menu'] ?? 'Forgot Password',
            'usernameLink' => $config['forgot_username_link'] ?? 'Forgot Username',
            'usernameTabMenu' => $config['forgot_username_tab_menu'] ?? '#forgot-username-content',
            'mobileResetExpiredMessage' => $config['mobile_reset_expired_message']['value'] ?? "Expired Page",
        ];
    }
}
