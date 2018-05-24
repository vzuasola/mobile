<?php

namespace App\MobileEntry\Controller;

use Slim\Http\Request;
use Slim\Http\Response;

use App\BaseController;

class LogoutController extends BaseController
{
    /**
     *
     */
    public function view(Request $request, Response $response)
    {
        try {
            $this->get('player_session')->logout();
        } catch (\Exception $e) {
            // do nothing
        }

        $redirect = $request->getQueryParam('destination') ?: '/';

        return $response->withRedirect(
            $this->get('uri')->generateUri($redirect, [])
        );
    }
}
