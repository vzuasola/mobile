<?php

namespace App\MobileEntry\Component\Header;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\Utils\DCoin;

class HeaderComponent implements ComponentWidgetInterface
{
    private $request;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $menu;

    private $product;

    const HOME = [
        '/',
        // casino
        '/casino',
        '/dafa888',
        '/888',
        '/yulechang',
        '/xuanzhuan',
        '/duchang',
        '/casino-gold',
        '/gold',
        '/daebak',
        // sports
        '/sports',
        '/football',
        '/soccer',
        '/goal',
        '/cup',
        '/match168',
        // sports-df
        '/sports-df',
        '/dffootball',
        '/dfsoccer',
        '/dfgoal',
        '/dfcup',
        '/dfmatch168',
        // lottery
        '/keno',
        '/lottery',
        '/lotto-numbers',
        '/numbers',
        '/draw',
        '/live-draws',
        // live dealer
        '/live-dealer',
        '/macau',
        '/live',
        '/live-games',
        '/xianchang',
        '/zhenren',
        // games
        '/games',
        '/slots',
        '/flashgames',
        '/laohuji',
        '/playflash',
        '/spinwin',
        // arcade
        '/arcade',
        '/youxi',
        '/xiaoyouxi',
        '/fun',
        '/amusement',
        '/arcade-room',
        '/fish-hunter',
        '/fish',
        '/fishing',
        '/buyu',
        '/buyuwang',
        '/buyudaren',
        // virtual sports
        '/virtual-sports',
        '/virtual-world',
        '/virtualsports',
        '/virtual-network',
        '/virtual-sports-coupon',
        '/virtuals',
        // casino gold
        '/casino-gold',
        '/gold',
        '/jin',
        '/elite',
        '/vip',
        '/exclusive',
        // mobile-soda-casino
        '/soda-casino',
        '/suda',
        '/soda',
        '/sodabt',
        '/sodfa',
        '/sda'
    ];

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('router_request'),
            $container->get('config_fetcher'),
            $container->get('player_session'),
            $container->get('menu_fetcher'),
            $container->get('product_resolver')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($request, $configs, $playerSession, $menu, $product)
    {
        $this->request = $request;
        $this->configs = $configs;
        $this->playerSession = $playerSession;
        $this->menu = $menu;
        $this->product = $product;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate()
    {
        $headerConfigs = $this->configs->getConfig('webcomposer_config.header_configuration');
        $useDafacoinMenu = Dcoin::isDafacoinEnabled($headerConfigs, $this->playerSession);
        if ($useDafacoinMenu) {
            return '@component/Header/coin-template.html.twig';
        } else {
            return '@component/Header/template.html.twig';
        }
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData()
    {
        $data = [];
        $data['is_front'] = false;
        try {
            if (in_array($this->request->getUri()->getPath(), self::HOME)) {
                $data['is_front'] = true;
            }
        } catch (\Exception $e) {
            // Do nothing
        }

        try {
            $headerConfigs = $this->configs->getConfig('webcomposer_config.header_configuration');
            $cashierMenu = $this->menu->getMultilingualMenu('cashier-menu');
        } catch (\Exception $e) {
            $headerConfigs = [];
            $cashierMenu = [];
        }

        try {
            $product = $this->product->getProduct();
            if ($product === 'mobile-sports' || $product === 'mobile-sports-df') {
                $product = 'mobile-entrypage';
            }
            $headerConfigsByProduct = $this->configs
                ->withProduct($product)
                ->getConfig('webcomposer_config.header_configuration');
        } catch (\Exception $e) {
            $headerConfigsByProduct = [];
        }

        $data['logo_title'] = $headerConfigsByProduct['logo_title'] ?? 'Dafabet';
        $data['join_now_text'] = $headerConfigs['join_now_text'] ?? 'Join Now';
        $data['login_issue_text'] = $headerConfigs['login_issue_text'] ?? 'Cant Login ?';
        $data['login_issue_link'] = $headerConfigs['login_issue_link'] ?? [];
        $data['mobile_remember'] = $headerConfigs['mobile_remember'] ?? 'Remember Username';
        $data['mobile_login_reg'] = $headerConfigs['mobile_login_reg'] ?? 'Login/Join';
        $data['join_now_link'] = $headerConfigs['registration_link'] ?? [];
        $productRoute = $params['route'] ?? '/';
        $data['logo_link'] = $headerConfigs['mobile_logo_url'] ?? '/{lang}';
        $data['login_join_now_text'] = $headerConfigs['login_join_now_text'] ?? 'Join';
        $data['dafacoin_cms_toggle'] = $headerConfigs['dafacoin_balance_toggle'] ?? 0;

        try {
            $isLogin = $this->playerSession->isLogin();
            $username = $this->playerSession->getUsername();
        } catch (\Exception $e) {
            $isLogin = false;
            $username = false;
        }

        $data['is_login'] = $isLogin;

        if ($isLogin && $username) {
            $data['username'] = $username;
            $data['cashier_link'] = $cashierMenu[0] ?? [];
        }

        $useDafacoinMenu = DCoin::isDafacoinEnabled($headerConfigs, $this->playerSession);
        if ($isLogin && $useDafacoinMenu) {
            $data['header'] =
            [
                'dafacoin_menu' => DCoin::getDafacoinData($headerConfigs),
                'logo_title' => $headerConfigs['logo_title'],
                'logo_uri' => $headerConfigs['mobile_logo_url'],
            ];
        }

        return $data;
    }
}
