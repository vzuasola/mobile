<?php

namespace App\MobileEntry\Component\Main\Lobby\Home\ContactUs;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class ContactUsComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\MenuFetcher
     */
    private $menus;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    private $product;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('menu_fetcher'),
            $container->get('config_fetcher'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $menus,
        $configs,
        $playerSession
    ) {
        $this->configs = $configs;
        $this->menus = $menus;
        $this->playerSession = $playerSession;
    }


    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Lobby/Home/ContactUs/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $isPartnerMatrix = $this->playerSession->getDetails()['isPlayerCreatedByAgent'] ?? false;
        try {
            $contact_menu  = $this->menus->getMultilingualMenu('mobile-contact-us');
            foreach ($contact_menu as $menu) {
                if ($isPartnerMatrix &&
                    $menu['attributes']['partnerMatrixPlayer'] !== "partner-matrix-app") {
                    continue;
                }
                $data['contact_menu'][] = $menu;
            }
        } catch (\Exception $e) {
            $data['contact_menu'] = [];
        }

        try {
            $entrypage_config = $this->configs->getConfig('mobile_entrypage.entrypage_configuration');
            $data['contact_us_text'] =  $entrypage_config['contact_us_home_text'] ?? 'Contact Us';
        } catch (\Exception $e) {
            $data['entrypage_config'] = [];
            $data['contact_us_text']  = 'Contact Us';
        }

        return $data;
    }
}
