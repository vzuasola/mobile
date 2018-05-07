<?php

namespace App\MobileEntry\Component\Language;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class LanguageComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\language
     */
    private $language;

    private $currentLanguage;


    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('language_fetcher'),
            $container->get('lang')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($language, $currentLanguage)
    {
        $this->language = $language;
        $this->currentLanguage = $currentLanguage;
    }


    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Language/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];
        $data['currentLanguage'] = $this->currentLanguage;
        try {
            $data['language'] = $this->language->getLanguages();
            unset($data['language']['default']);
        } catch (\Exception $e) {
            $data['language'] = [];
        }
        return $data;
    }
}
