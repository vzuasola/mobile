<?php

namespace App\MobileEntry\Component\Main\Lobby\CasinoLobby;

use App\MobileEntry\Services\PublishingOptions\PublishingOptions;

/**
 * Trait for games
 */
trait GameTrait
{
    /**
     * Simplify game array
     */
    private function processGame($product, $game, $special = false)
    {
        try {
            $processGame = [];
            $size = 'size-small';
            $processGame['size'] = ($special) ? 'size-small' : $size;

            if ($game['field_games_ribbon_label']) {
                $processGame['ribbon']['background'] = $game['field_games_ribbon_color'];
                $processGame['ribbon']['color'] = $game['field_games_text_color'];
                $processGame['ribbon']['name'] = $game['field_games_ribbon_label'];
            }

            if (isset($game['field_all_games_ribbon_label'])) {
                $processGame['all_games_ribbon']['background'] = $game['field_all_games_ribbon_color'];
                $processGame['all_games_ribbon']['color'] = $game['field_all_games_text_color'];
                $processGame['all_games_ribbon']['name'] = $game['field_all_games_ribbon_label'];
            }

            $processGame['image'] = [
                'alt' => $game['field_games_list_thumb_img_small_1'],
                'url' =>
                    $this->asset->generateAssetUri(
                        $game['field_games_list_thumb_img_small'],
                        ['product' => $product]
                    )
            ];

            $processGame['filters'] = $game['field_game_filter'] ?? [];
            $processGame['title'] = $game['title'] ?? "";
            $processGame['game_code'] = $game['field_game_code'] ?? "";
            $processGame['game_provider'] = $game['field_game_provider'] ?? "pas"; // HERE
            $processGame['game_platform'] = $game['field_game_platform'] ?? "";
            $processGame['keywords'] = $game['field_keywords'] ?? "";
            $processGame['weight'] = 0;
            $processGame['target'] = $game['field_games_target'] ?? "popup";
            $processGame['preview_mode'] = $game['field_preview_mode'] ?? 0;
            $processGame['use_game_loader'] = (isset($game['field_disable_game_loader'])
                && $game['field_disable_game_loader']) ? "false" : "true";

            $categoryList = [];

            foreach ($game['field_games_list_category'] as $category) {
                $categoryList[$category['games_alias']] = $category['games_alias'];
            }

            $processGame['categories'] = $categoryList;

            return $processGame;
        } catch (\Exception $e) {
            $e->getMessage();
            return [];
        }
    }

    private function proccessSpecialGames($games)
    {
        try {
            $gameList = [];
            if (is_array($games) && count($games) >= 1) {
                foreach ($games as $key => $timestamp) {
                    $gameList[$key]['id'] = $key;
                    $gameList[$key]['timestamp'] = $timestamp;
                }

                return $gameList;
            }
        } catch (\Exception $e) {
            return [];
        }

        return $gameList;
    }

    /**
     * Arrange games per category
     */
    private function arrangeGames($product, $games, $categoryId)
    {
        $gamesList = [];
        foreach ($games as $game) {
            $publishOn = $game['publish_on'] ?? '';
            $unpublishOn = $game['unpublish_on'] ?? '';
            $status = true;
            if (!$publishOn && !$unpublishOn) {
                $status = $game['status'];
            }
            if (PublishingOptions::checkDuration($publishOn, $unpublishOn)
                && $status) {
                $special = ($categoryId === $this::RECOMMENDED_GAMES);
                $gamesList['id:' . $game['field_game_code']] =
                    $this->processGame($product, $game, $special);
            }
        }

        return $gamesList;
    }

    /**
     * Arrange and removed unused categories
     */
    private function getArrangedCategoriesByGame($categories, &$enableRecommended)
    {
        $categoryList = [];
        foreach ($categories as $category) {
            // remove recommended games from category as it will not have its own tab.
            if ($category['field_games_alias'] === $this::RECOMMENDED_GAMES) {
                $enableRecommended = true;
                continue;
            }

            $isPublished = PublishingOptions::checkDuration(
                $category['field_publish_date'],
                $category['field_unpublish_date']
            );
            if ($isPublished) {
                $category['published'] = $isPublished;
                $categoryList[] = $category;
            }
        }
        return $categoryList;
    }

    /**
     * Sort recently played games based on timestamp
     */
    public static function sortRecentGames($game1, $game2)
    {
        return ($game1['timestamp'] > $game2['timestamp']) ? -1 : 1;
    }
}
