<?php

namespace App\MobileEntry\Controller;

use App\MobileEntry\Tools\DsbCookieHelper;
use Slim\Http\Request;
use Slim\Http\Response;

use App\BaseController;

class LogoutController extends BaseController
{
    public function view(Request $request, Response $response)
    {
        $playerSession = $this->get('player_session');

        try {
            $playerSession->logout();
        } catch (\Exception $e) {
            // do nothing
        }

        $this->resetDafaUrlCookiesIfNeeded($request, $playerSession);

        $redirect = $request->getQueryParam('destination') ?: '/';

        return $response->withRedirect(
            $this->get('uri')->generateUri($redirect, [])
        );
    }

    private function resetDafaUrlCookiesIfNeeded($request, $playerSession)
    {
        try {
            $alsConfig = $this->get('config_fetcher')->getConfig('mobile_als.als_configuration');
        } catch (\Exception $e) {
            $alsConfig = [];
        }

        $dsbCookiesAreSet = DsbCookieHelper::dSBCookiesExist();
        if ($dsbCookiesAreSet) {
            $tokenParser = $this->get('token_parser');
            $dsbCookieHelper = new DsbCookieHelper($tokenParser, $playerSession, $alsConfig);
            $dsbCookieHelper->setDafaUrlCookies();
        }
    }
}
