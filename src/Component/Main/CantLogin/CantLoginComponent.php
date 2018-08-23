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
            'title_forgot' => $config['cant_login_title'] ?? 'Cannot Access your Dafabet Account?',
            'title_reset' => $config['reset_title'] ?? 'Password Reset Request',
            'password_link' => $config['forgot_password_link'] ?? '#forgot-password-content',
            'password_tab_menu' => $config['forgot_password_tab_menu'] ?? 'Forgot Password',
            'username_link' => $config['forgot_username_link'] ?? 'Forgot Username',
            'username_tab_menu' => $config['forgot_username_tab_menu'] ?? '#forgot-username-content',
            'mobile_reset_expired_message' => $config['mobile_reset_expired_message']['value'] ?? "Expired Page",
        ];
    }
}
