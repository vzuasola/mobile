<?php

namespace App\MobileEntry\Component\Main\Lobby;


/**
 * Trait for games list version
 */
trait GamesListVersionTrait
{
    /**
     * Get the games list version
     */
    public function getGamesListVersion($product = self::PRODUCT)
    {
        try {
            $toggleConfiguration = $this->configs->withProduct($product)->getConfig('webcomposer_games_list.version_configuration');
            $isV2Enabled = $toggleConfiguration['version_configuration'] ?? false;
            if ($isV2Enabled) {
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }
}
