<?php

namespace App\MobileEntry\Component\Footer;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class FooterComponent implements ComponentWidgetInterface
{
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
        $data = [
            'about_text' => 'About Dafabet',
            'about_blurb' => 'Welcome to Dafabet, Asia`s leading online betting site and home to some of the best gaming products on the web that includes Sports Betting, Online Casino, Live Casino Games, Online Poker, Flash Games and an array of world class online betting games.',
            'copyright' => 'Copyright © 2018 | Dafabet | All Rights Reserved',
        ];

        $data['authenticated'] = $_SESSION['isLogin'] ?? false;

        return $data;
    }
}
