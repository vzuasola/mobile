<?php

namespace App\MobileEntry\Services\Currency;

use App\Translations\Currency;

class CurrencyTranslation
{
    private $lang;

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
    public function __construct($lang)
    {
        $this->lang = $lang;
    }

    /**
     * Translate currency depending on current langauge
     *
     * @param string $currency Registered currency of the player
     * @return string $currency Translated currency of the player
     */
    public function getTranslation($currency)
    {
        if (strtoupper($currency) === 'MBC') {
            $currency = 'mBTC';
        }
        switch ($this->lang) {
            case 'sc':
                if ($translated = Currency::getTranslation($currency)) {
                    $currency = $translated;
                }
                if ($currency === 'mBTC') {
                    $currency = 'm比特币';
                }
                break;
            case 'ch':
                if ($translated = Currency::getTranslation($currency)) {
                    $currency = $translated;
                }
                if ($currency === 'mBTC') {
                    $currency = 'm比特幣';
                }
                break;
            default:
                break;
        }

        return $currency;
    }
}
