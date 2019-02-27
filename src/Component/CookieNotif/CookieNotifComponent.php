<?php

namespace App\MobileEntry\Component\CookieNotif;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class CookieNotifComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\configs
     */
    private $configs;

    private $idDomain;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('id_domain'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($idDomain, $configs)
    {
        $this->idDomain = $idDomain;
        $this->configs = $configs;
    }


    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/CookieNotif/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];

        try {
            $footerConfigs = $this->configs->getConfig('webcomposer_config.footer_configuration');
            $data['cookie_notification'] = $footerConfigs['cookie_notification']['value'] ?? 'cookie notification';
            $data['country_codes'] = $footerConfigs['country_codes'] ?? '';
            $data['geo_ip'] = $this->idDomain->getGeoIpCountry();
        } catch (\Exception $e) {
            $footerConfigs = [];
            $data['cookie_notification'] = '';
            $data['country_codes'] = '';
        }

        return $data;
    }
}
