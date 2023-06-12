<?php

namespace App\MobileEntry\Component\Main\MyAccount\ChangePassword;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\Drupal\Config;

/**
 *
 */
class ChangePasswordComponentScripts implements ComponentAttachmentInterface
{

    /**
     * Translation Manager Object.
     */
    private $translationManager;

    private $configFetcher;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('translation_manager'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($translationManager, $configFetcher)
    {
        $this->translationManager = $translationManager;
        $this->configFetcher = $configFetcher->withProduct('account');
    }
    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $passMeter = $this->translationManager->getTranslation('password-strength-meter');
        $config = $this->configFetcher->getConfigById('my_account_change_password');

        if ($config['use_cms_password_strength'] ?? false) {
            $passMeter['label'] = $config['password_label'] ?? 'Password Strength';
            $passMeter['weak'] = $config['password_weak'] ?? 'Weak';
            $passMeter['average'] = $config['password_average'] ?? 'Average';
            $passMeter['strong'] = $config['password_strong'] ?? 'Strong';
        }

        
        $integrationError = Config::parse($config['integration_error']) ?? '';

        return [
            'messages' => $integrationError,
            'passwordStrengthMeter' => $passMeter
        ];
    }
}
