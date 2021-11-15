<?php

namespace App\MobileEntry\Component\Main\Lobby\Home\Infobar;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class InfobarComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Fetcher\Drupal\Views
     */
    private $views;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $currentLanguage;

    private $translation;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher'),
            $container->get('player_session'),
            $container->get('lang'),
            $container->get('translation_manager')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($views, $playerSession, $language, $translation)
    {
        $this->views = $views;
        $this->playerSession = $playerSession;
        $this->currentLanguage = $language;
        $this->translation = $translation;
    }


    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        return '@component/Main/Lobby/Home/Infobar/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        try {
            $infobar = $this->views->getViewById('infobar');
            $data['infobar'] = $this->processInfobar($infobar);
        } catch (\Exception $e) {
            $data['infobar'] = [];
        }

        $data['news_text'] = $this->translation->getTranslation('infobar');
        $data['language'] = $this->currentLanguage;
        return $data;
    }

    private function processInfobar($data)
    {
        try {
            $infobarList = [];
            $isLogin = $this->playerSession->isLogin();

            foreach ($data as $infobarItem) {
                $showBoth = count($infobarItem['field_log_in_state']) > 1;
                $loginState = $infobarItem['field_log_in_state'][0]['value'] ?? 0;
                $enableInfobar = $infobarItem['field_infobar_enable'][0]['value'] ?? 0;

                // selectively choose fields based on login state
                if ($enableInfobar) {
                    if ($isLogin && ($showBoth || $loginState)) {
                        $infobarList[]['field_body'] = $infobarItem['field_post_body'][0]['value'];
                    }

                    if (!$isLogin && ($showBoth || !$loginState)) {
                        $infobarList[]['field_body'] = $infobarItem['field_body'][0]['value'];
                    }
                }
            }
        } catch (\Exception $e) {
            $infobarList = [];
        }

        return $infobarList;
    }
}
