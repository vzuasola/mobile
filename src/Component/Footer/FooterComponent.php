<?php

namespace App\MobileEntry\Component\Footer;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class FooterComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\menus
     */
    private $menus;

    /**
     * @var App\Fetcher\Drupal\views
     */
    private $sponsors;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('menu_fetcher'),
            $container->get('views_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($menus, $sponsors)
    {
        $this->menus = $menus;
        $this->sponsors = $sponsors;
    }


    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Footer/template.html.twig';
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
            $data['downloads_menu'] = $this->menus->getMultilingualMenu('mobile-downloads');
        } catch (\Exception $e) {
            $data['downloads_menu'] = [];
        }

        try {
            $data['sponsors'] = $this->sponsors->getViewById('mobile_sponsor_list');
        } catch (\Exception $e) {
            $data['sponsors'] = [];
        }

        try {
            $data['footer_menu'] = $this->menus->getMultilingualMenu('mobile-footer');
        } catch (\Exception $e) {
            $data['footer_menu'] = [];
        }

        $this->orderSponsors($data['sponsors']);

        $data['copyright'] = 'Copyright';

        return $data;
    }


    private function orderSponsors(&$sponsors)
    {
        $count = 1;
        foreach ($sponsors as $key => $sponsor) {
            if (!$sponsor['field_mobile_full_row'][0]['value']) {
                if ($count == 1) {
                    $sponsors[$key]['leaf_class'] = 'left';
                }

                if ($count == 2) {
                    $sponsors[$key]['leaf_class'] = 'right';
                }
                $count++;
            }

            if ($count > 2) {
                $count = 1;
            }
        }
    }
}
