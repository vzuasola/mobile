<?php

namespace App\MobileEntry\Controller;

use App\BaseController;
use App\Player\CookieSession;
use App\Player\Player;
use App\Player\PlayerSession;

class PromotionsController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        $this->checkForFlutterAuthenticationRequest($request);

        try {
            $config = $this->get('config_fetcher')
                ->withProduct($this->get('product_resolver')->getProduct())
                ->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $config = [];
        }

        $data['title'] = $config["promotion_page_title"] ?? 'Promotions';

        return $this->widgets->render($response, '@site/page.html.twig', $data);
    }

    private function checkForFlutterAuthenticationRequest($request)
    {
        // Flutter app is expected to user a User Agent header that contains the word "Dart".
        $userAgent = strtolower($request->getHeaderLine('User-Agent') ?? '');
        $agentIsDart = !(strpos($userAgent, 'dart') === false);

        $iCoreToken = $request->getQueryParam('flutterauth');
        /** @var PlayerSession $playerSession */
        $playerSession = $this->get('player_session');
        if (!empty($iCoreToken) && $agentIsDart && !$playerSession->isLogin()) {
            try {
                $this->get('session')->set('token', $iCoreToken);
                $playerSession->authenticateByToken($iCoreToken);

                /** @var Player $player */
                $player = $this->get('player');
                $username = $player->getUsername();

                /** @var CookieSession $cookieSesion */
                $cookieSesion = $this->get('cookie_session');
                $cookieSesion->setWbc(
                    $username,
                    $this->get('player')->getPlayerID(),
                    $iCoreToken
                );
            } catch (\Exception $ex) {
                // Do nothing! We will proceed as unauthenticated user.
            }
        }
    }
}
