<?php

namespace App\MobileEntry\Component\Main\CantLogin;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\Drupal\Config;

/**
 *
 */
class CantLoginComponentScripts implements ComponentAttachmentInterface
{
    /**
     * Translation Manager Object.
     */
    private $translationManager;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('translation_manager')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($translationManager)
    {
        $this->translationManager = $translationManager;
    }
    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $passMeter = $this->translationManager->getTranslation('password-strength-meter');

        return [
            'passwordStrengthMeter' => $passMeter
        ];
    }
}
