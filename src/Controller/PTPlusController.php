<?php

namespace App\MobileEntry\Controller;

use App\BaseController;
use App\Drupal\Config;
use GuzzleHttp\Client as Client;

class PTPlusController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        try {
            $config = $this->get('config_fetcher')
                ->withProduct($this->get('product_resolver')->getProduct())
                ->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $config = [];
        }

        $data['title'] = $config["lobby_page_title"] ?? 'PT+';

        return $this->widgets->render($response, '@site/page.html.twig', $data);
    }

    /**
     *
     * @param mixed $request
     * @param mixed $response
     * @return mixed
     */
    public function tournamentAPI($request, $response)
    {
        $data = $request->getParams();

        try {
            $status = $data['status'] ?? 2;
            $generalConfiguration = $this->tournamentConfiguration($data);
            $entityName = 'W2W' . $generalConfiguration['currency'];
            $client = new Client();
            $res = $client->request(
                'POST',
                $generalConfiguration['url'],
                [
                    'form_params' => [
                        'entity_name' => $entityName,
                        'entity_key' => $generalConfiguration['key_mapping'][$entityName],
                        'isMobile' => false,
                        'language' => strtoupper($this->get('lang')),
                        'currency' => $generalConfiguration['currency'],
                        'status' => $status
                    ],
                ]
            );

            $res = json_decode($res->getBody()->getContents());

            if ($res->code === 0) {
                return $this->get('rest')->output($response, [
                    'data' => $res->data,
                    'message' => $res->message,
                    'status' => 200
                ]);
            } else {
                return $this->get('rest')->output($response, [
                    'data' => [],
                    'message' => $res->message,
                    'status' => 'failed'
                ]);
            }
        } catch (\Exception $e) {
            //throw $e;
        }
    }

    /**
     *
     * @param mixed $data
     * @return mixed
     */
    public function tournamentConfiguration($data)
    {
        $settings =  $this->get('config_fetcher')->withProduct('mobile-ptplus')
        ->getConfig('webcomposer_config.tournament_settings');

        $urlMapping = [
            'leaderboard' => $settings['leaderboards_api'],
            'dailymission' => $settings['daily_mission_api'],
        ];

        $data['key_mapping'] = Config::parseMultidimensional($settings['key_mapping']);
        $data['url'] = $urlMapping[$data['type']];
        $data['currency'] = 'CNY';

        if ($this->get('player_session')->isLogin()) {
            $playerConfig = $this->get('player');

            $data['playerId']  = $playerConfig->getPlayerId();
            $data['currency']  = $playerConfig->getCurrency();
            $data['productId'] = $playerConfig->getProductId();
            $data['regLang']   = (string)$playerConfig->getLocale();

            if ($data['currency'] === 'RMB') {
                $data['currency'] = 'CNY';
            }
        }

        return $data;
    }
}
