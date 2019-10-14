<?php

namespace App\MobileEntry\Module\GameIntegration\AsiaGaming;

use App\Drupal\Config;
use App\MobileEntry\Services\Product\ProductResolver;
use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\Plugins\Token\Parser;

/**
 *
 */
class AsiaGamingModuleScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $config;

    private $lang;

    /**
     * @var Parser
     */
    private $parser;

    /**
     * @var ProductResolver
     */
    private $productResolver;

    const KEY = 'asia_gaming';

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('lang'),
            $container->get('token_parser'),
            $container->get('product_resolver')
        );
    }

    /**
     * AsiaGamingModuleScripts public constructor.
     * @param $playerSession
     * @param $config
     * @param $lang
     * @param Parser $parser
     * @param ProductResolver $productResolver
     */
    public function __construct(
        $playerSession,
        $config,
        $lang,
        Parser $parser,
        ProductResolver $productResolver
    ) {
        $this->playerSession = $playerSession;
        $this->lang = $lang;
        $this->parser = $parser;
        $this->productResolver = $productResolver;
        $product = $this->productResolver->getProduct();
        $this->config = $config->withProduct($product);
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $config = $this->config->getConfig('webcomposer_config.icore_games_integration');
            $customLobby = $this->parser->processTokens(
                ($config[self::KEY . '_custom_lobbyDomain_enabled'] ?? false)
                    ? ($config[self::KEY . '_custom_lobbyDomain'] ?? '')
                    : ''
            );

            $data = [
                'authenticated' => $this->playerSession->isLogin(),
                'lang' => $this->lang,
                'currencies' => explode(PHP_EOL, $config[self::KEY . '_currency']),
                'languages' => Config::parse($config[self::KEY . '_language_mapping'] ?? ''),
                'customLobby' => $customLobby,
            ];
        } catch (\Exception $e) {
            $data = [];
        }

        return $data;
    }
}
