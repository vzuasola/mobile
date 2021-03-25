<?php

namespace App\MobileEntry\Module\GameIntegration\Opus;

use App\Drupal\Config;
use App\Encryption\JWTEncryption;
use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;
use App\Player\Player;
use App\Player\PlayerSession;

class OpusModuleController
{
    use ProviderTrait;

    const ISSUER = 'webcomposer';
    const AUDIENCE = 'keno';
    const KEY = 'opus';

    private $rest;

    private $opus;

    private $config;

    private $player;

    private $playerSession;

    private $viewsFetcher;

    private $jwtEncryption;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('game_provider_fetcher'),
            $container->get('config_fetcher'),
            $container->get('player'),
            $container->get('player_session'),
            $container->get('views_fetcher'),
            $container->get('lang'),
            $container->get('product'),
            $container->get('jwt_encryption')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $rest,
        $opus,
        $config,
        Player $player,
        PlayerSession $playerSession,
        $viewsFetcher,
        $lang,
        $product,
        JWTEncryption $jwtEncryption
    ) {
        $this->rest = $rest;
        $this->opus = $opus;
        $this->config = $config->withProduct('mobile-live-dealer');
        $this->player = $player;
        $this->playerSession = $playerSession;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-live-dealer');
        $this->lang = $lang;
        $this->product = $product;
        $this->jwtEncryption = $jwtEncryption;
    }

    /**
     * @{inheritdoc}
     */
    public function launch($request, $response)
    {
        $data['gameurl'] = false;
        $data['currency'] = false;
        if ($this->checkCurrency($request)) {
            $data['currency'] = true;
            try {
                $data = $this->getGameUrl($request);
            } catch (\Exception $e) {
                $data['currency'] = true;
            }
        }

        return $this->rest->output($response, $data);
    }

    private function getGameUrl($request)
    {
        $data['currency'] = true;
        $productConfig = $this->config;
        $params = $request->getParsedBody();
        try {
            //Set Product
            if (isset($params['product'])) {
                $productConfig = $this->config->withProduct($params['product']);
            }

            $config = $productConfig->getGeneralConfigById('games_opus_provider');
            $language = $this->lang;
            $isLogin = $this->playerSession->isLogin();
            $sessiontokenizer = null;
            $gameUri = rtrim($config['opus_alternative_game_url'], '/') . '/';

            if ($isLogin) {
                $sessiontokenizer = $this->playerSession->getToken();
            }

            $languageParse = Config::parse($config['languages'] ?? '');
            $languageCode = $languageParse[$language] ?? "en-US";
            $product = str_replace('mobile-', '', $this->product) ?? 'live-dealer';

            $options = [
                'issuer' => self::ISSUER,
                'audience' => self::AUDIENCE,
                'expire_time' => time() + 3600,
            ];

            $payload = [
                'token' => $sessiontokenizer,
                'languagecode' => $languageCode,
            ];

            $token = $this->jwtEncryption->encrypt($payload, $options);
            $redirectUrl = $gameUri . $language. "/$product/game/opus/redirect?token=$token&login=$isLogin";

            if ($redirectUrl) {
                $data['gameurl'] = $redirectUrl;
            }
        } catch (\Exception $e) {
            $data['currency'] = true;
        }

        return $data;
    }

    public function checkCurrency($request)
    {
        try {
            $params = $request->getParsedBody();
            $productConfig = $this->config;
            $viewsFetcher = $this->viewsFetcher;
            $playerCurrency = $this->player->getCurrency();
            $subProvider = $params['subprovider'] ?? false;

            //Set Product
            if (isset($params['product'])) {
                $productConfig = $this->config->withProduct($params['product']);
                $viewsFetcher = $this->viewsFetcher->withProduct($params['product']);
            }

            if ($subProvider) {
                $supportedCurrency = $viewsFetcher->getViewById(
                    'games_subproviders',
                    ['name' => $subProvider]
                )[0]['supported_currency'] ?? '';

                // If the game has a subprovider currency restriction, verify if the user met the restriction
                if ($supportedCurrency) {
                    return in_array(
                        $playerCurrency,
                        preg_split("/\r\n|\n|\r/", $supportedCurrency)
                    );
                }
            }

            $config =  $productConfig->getGeneralConfigById('games_opus_provider');
            $currencies = explode("\r\n", $config['currency'] ?? "");

            if (in_array($playerCurrency, $currencies)) {
                return true;
            }
        } catch (\Exception $e) {
            // Do nothing
        }
        return false;
    }
}
