<?php

namespace App\MobileEntry\Component\Main\Lobby\Home\Infobar;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class InfobarComponentController
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Fetcher\Drupal\Views
     */
    private $views;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $rest;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('views_fetcher'),
            $container->get('player_session'),
            $container->get('rest')
        );
    }

    /**
     *
     */
    public function __construct(
        $configs,
        $views,
        $playerSession,
        $rest
    ) {
        $this->configs = $configs;
        $this->views = $views;
        $this->playerSession = $playerSession;
        $this->rest = $rest;
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function infobar($request, $response)
    {
        try {
            $params = $request->getParsedBody();
            $views = $this->views;
            if (isset($params['currentProduct'])) {
                $views = $this->views->withProduct($params['currentProduct']);
            }

            $infobar = $views->getViewById('infobar');
            $data['infobar'] = $this->processInfobar($infobar);
        } catch (\Exception $e) {
            $data['infobar'] = [];
        }
        $data['is_login'] = $this->playerSession->isLogin();

        return $this->rest->output($response, $data);
    }

    private function processInfobar($data)
    {
        try {
            $infobarList = [];
            $isLogin = $this->playerSession->isLogin();
            foreach ($data as $infobarItem) {
                $infobarData = [];

                $enableInfobar = $infobarItem['field_infobar_enable'][0]['value'] ?? 0;

                // selectively choose fields based on login state
                if ($isLogin && $enableInfobar) {
                    $infobarData['field_body'] = $infobarItem['field_post_body'][0]['value'];
                } elseif (!$isLogin && $enableInfobar) {
                    $infobarData['field_body'] = $infobarItem['field_body'][0]['value'];
                }

                $infobarList[] = $infobarData;
            }
        } catch (\Exception $e) {
            $infobarList = [];
        }

        return $infobarList;
    }
}
