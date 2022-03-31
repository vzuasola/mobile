<?php

namespace App\MobileEntry\Component\Header\Login;

use App\Cookies\Cookies;
use App\Fetcher\Integration\Exception\AccountLockedException;
use App\Fetcher\Integration\Exception\AccountSuspendedException;
use App\MobileEntry\Services\CookieService\CookieService;
use App\Utils\Host;

/**
 *
 */
class LoginComponentController
{
    private $rest;
    private $playerSession;
    private $product;
    /** @var $cookieService CookieService */
    private $cookieService;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('player_session'),
            $container->get('settings')['product'],
            $container->get('cookie_service')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $playerSession, $product, $cookieService)
    {
        $this->rest = $rest;
        $this->playerSession = $playerSession;
        $this->product = $product;
        $this->cookieService = $cookieService;
    }

    /**
     *
     */
    public function authenticate($request, $response)
    {
        $data = [];
        $body = $request->getParsedBody();


        if (!empty($body['username']) && !empty($body['password'])) {
            $username = trim($body['username']);
            $password = $body['password'];

            $options = [];

            if (!empty($body['product'])) {
                $options['header']['Login-Product'] = $body['product'];
            }

            try {
                $responseHeaders = $response->getHeaders();
                if (isset($responseHeaders['X-Page-Error-Type'][0])
                    && strtolower($responseHeaders['X-Page-Error-Type'][0]) === 'restricted') {
                    throw new \Exception("Country Restricted", 421);
                }

                $data['success'] = $this->playerSession->login($username, $password, $options);
                session_start();
                session_regenerate_id(true);
                $data['hash'] = md5($this->playerSession->getToken());
                $data['token'] = $this->playerSession->getToken();
                $data['matrix'] = $this->playerSession->getDetails()['isPlayerCreatedByAgent'] ?? false;
                $data['user'] = [
                    'playerId' =>  $this->playerSession->getDetails()['playerId'] ?? '',
                    'currency' =>  $this->playerSession->getDetails()['currency'] ?? '',
                    'country' => $request->getHeader('X-Custom-LB-GeoIP-Country')[0] ?? '',
                ];
                // Set the authentication cookies
                $this->setAuthCookies();
            } catch (\Exception $e) {
                if ($e instanceof AccountLockedException) {
                    $response = $response->withStatus(403);
                } elseif ($e instanceof AccountSuspendedException) {
                    $response = $response->withStatus(402);
                } elseif ($e->getCode() == 401) {
                    $response = $response->withStatus(401);
                } elseif ($e->getCode() == 421) {
                    $response = $response->withStatus(421);
                } else {
                    $response = $response->withStatus(500);
                }

                $reason = $e->getMessage();
                $data['code'] = $e->getCode();
                $data['reason'] = $reason;

                $reasonArray = explode('response:', $reason);
                if (!empty($reasonArray)) {
                    if (isset($reasonArray[1])) {
                        $data['reasonJson'] = json_decode($reasonArray[1]);
                    } else {
                        $data['reasonJson'] = $reason;
                    }
                }
            }
        }

        return $this->rest->output($response, $data);
    }

    /**
     *
     */
    public function logout($request, $response)
    {
        $data = [];

        try {
            $data['success'] = $this->playerSession->logout();
            session_start();
            session_unset();
            session_destroy();
            session_write_close();
            Cookies::remove('ctk', [
                'expire' => 0,
                'path' => '/',
                'domain' => Host::getDomain(),
                'secure' => false,
                'http' => false
            ]);
        } catch (\Exception $e) {
            $data['message'] = $e->getMessage();
        }

        return $this->rest->output($response, $data);
    }

    private function setAuthCookies()
    {
        // Set DSB Cookies for Nextbet sports
        $this->setDsbCookies();
    }

    /**
     * Share session JWT via cookie
     */
    private function setDsbCookies()
    {
        try {
            $playerDetails = $this->playerSession->getDetails();
            $token = $this->playerSession->getToken();
            $result = $this->cookieService->cut([
                'username' => $playerDetails['username'],
                'playerId' => $playerDetails['playerId'],
                'sessionToken' => $token,
            ]);
            $options = [
                'path' => '/',
                'domain' => Host::getDomain(),
            ];

            Cookies::set('extToken', $result['jwt'], $options);
            Cookies::set('extCurrency', $playerDetails['currency'], $options);
        } catch (\Exception $e) {
            // do nothing
        }
    }
}
