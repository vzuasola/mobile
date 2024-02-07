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

    private $user;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('translation_manager'),
            $container->get('config_fetcher'),
            $container->get('user_fetcher')
        );
    }

    /**
     * Public constructor
     * @param \App\Plugins\Translation\TranslationManager $translationManager
     * @param \App\Fetcher\Drupal\ConfigFetcher $configFetcher
     * @param \App\Fetcher\Integration\UserFetcher $userFetcher
     */
    public function __construct($translationManager, $configFetcher, $userFetcher)
    {
        $this->translationManager = $translationManager;
        $this->configFetcher = $configFetcher->withProduct('account');
        $this->user = $userFetcher;
    }
    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $username =  $this->user->getPlayerDetails()['username'];
        $passMeter = $this->translationManager->getTranslation('password-strength-meter');
        $config = $this->configFetcher->getConfigById('my_account_change_password');

        if ($config['use_cms_password_strength'] ?? false) {
            $passMeter['label'] = $config['password_label'] ?? 'Password Strength';
            $passMeter['weak'] = $config['password_weak'] ?? 'Weak';
            $passMeter['average'] = $config['password_average'] ?? 'Average';
            $passMeter['strong'] = $config['password_strong'] ?? 'Strong';
        }

        $integrationError = Config::parse($config['integration_error']) ?? '';
        $usePasswordChecklist = $config['use_password_checklist'] ?? false;

        return [
            'messages' => $integrationError,
            'passwordStrengthMeter' => $passMeter,
            'usePasswordChecklist' => $usePasswordChecklist,
            'username' => $username,
        ];
    }
}
