<?php

namespace App\MobileEntry\Component\Language;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class LanguageComponentScripts implements ComponentAttachmentInterface
{
    private $currentLanguage;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('lang')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($currentLanguage)
    {
        $this->currentLanguage = $currentLanguage;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        return [
            'currentLanguage' => $this->currentLanguage,
        ];
    }
}
