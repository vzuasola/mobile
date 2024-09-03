<?php

namespace App\MobileEntry\Controller;

use App\BaseController;
use App\Controller\BaseSectionTrait;
use App\MobileEntry\Services\Product\Products;
use GuzzleHttp\Exception\GuzzleException;
use Slim\Http\Request;
use Slim\Http\Response;
use App\Fetcher\Drupal\ConfigFetcher;

class GameLoaderController extends BaseController
{
    use BaseSectionTrait;
    /**
     * View rendered for game loading which serves both default and iframe loading context;
     * @param Request $request the request object
     * @param Response $response the response object
     * @return mixed
     */
    public function view(Request $request, Response $response)
    {
        try {
            $alias = str_replace('mobile-', '', $request->getParam('currentProduct'));
            $product = Products::PRODUCT_MAPPING[$alias] ?? $this->get('product_resolver')->getProduct();
            $provider = $request->getParam('provider', '');
            $subProvider = $request->getParam('subprovider', '');
            // Set fetchers
            $configFetcher = $this
                ->get('config_fetcher')
                ->withProduct($product);
            // Get config
            $config = $configFetcher
                ->getConfig('webcomposer_config.header_configuration');

            // Acquire iframe status
            $isIframeEnabled = $this->isIframeEnabled($configFetcher, $provider, $subProvider);
        } catch (\Exception $e) {
            $config = [];
            $isIframeEnabled = false;
        }

        $data['title'] = $config["lobby_page_title"] ?? $this->get('translation_manager')->getTranslation('home');
        $data['is_front'] = true;
        $data['product'] = $product;

        if ($isIframeEnabled) {
            return $this->widgets->render($response, '@site/gameiframe.html.twig', $data, [
                'components_override' => [
                    'main' => 'game_iframe',
                ],
            ]);
        }

        return $this->widgets->render($response, '@site/blank.html.twig', $data);
    }

    /**
     * Determines based on game provider and subprovider if Iframe view is enabled
     * @param ConfigFetcher $configFetcher Config Fetcher class
     * @param string $provider
     * @param string $subProvider
     * @return false|mixed
     * @throws GuzzleException
     */
    private function isIframeEnabled(ConfigFetcher $configFetcher, string $provider, string $subProvider)
    {
        $iCoreGamesConfig = $configFetcher->getGeneralConfigById('icore_games_integration');

        switch ($provider) {
            case 'gpi':
                $gpiConfig = $configFetcher->getGeneralConfigById('games_gpi_provider') ?? [];
                $isLaunchIframe = $gpiConfig['gpi_live_dealer_use_iframe'] ?? false;
                $disabledSubprovider = $gpiConfig['gpi_live_dealer_disable_iframe_subprovider'] ?? '';
                break;
            case 'ugl':
            case 'pas':
                $uglConfig = $configFetcher->getGeneralConfigById('games_playtech_provider') ?? [];
                $isLaunchIframe = $uglConfig['ugl_use_iframe'] ?? false;
                $disabledSubprovider = $uglConfig['ugl_disable_iframe_subprovider'] ?? '';
                break;
            default:
                $isLaunchIframe = $iCoreGamesConfig[$provider . '_use_iframe'] ?? false;
                $disabledSubprovider = $iCoreGamesConfig[$provider . '_disable_iframe_subprovider'] ?? '';
                break;
        }

        if ($isLaunchIframe && $subProvider !== '' && $disabledSubprovider !== '') {
            // Check if launching via iframe is disabled on sub provider
            $disabledIframeSubProviders = explode("\r\n", $disabledSubprovider) ?? [];
            if (in_array($subProvider, $disabledIframeSubProviders)) {
                $isLaunchIframe = false;
            }
        }

        return $isLaunchIframe;
    }
}
