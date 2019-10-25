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

            if (isset($game['field_game_ribbon'][0])) {
                $ribbon = $game['field_game_ribbon'][0];
                $processGame['ribbon']['background'] = $ribbon['field_games_ribbon_color'][0]['color'];
                $processGame['ribbon']['color'] = $ribbon['field_games_text_color'][0]['color'];
                $processGame['ribbon']['name'] = $ribbon['field_games_ribbon_label'][0]['value'];
            }

            if (isset($game['field_all_games_category_ribbon'][0])) {
                $allGamesribbon = $game['field_all_games_category_ribbon'][0];
                $processGame['all_games_ribbon']['background'] =
                    $allGamesribbon['field_games_ribbon_color'][0]['color'];
                $processGame['all_games_ribbon']['color'] =
                    $allGamesribbon['field_games_text_color'][0]['color'];
                $processGame['all_games_ribbon']['name'] =
                    $allGamesribbon['field_games_ribbon_label'][0]['value'];
            }

            $processGame['image'] = [
                'alt' => $game['field_games_list_thumb_img_small'][0]['alt'],
                'url' =>
                    $this->asset->generateAssetUri(
                        $game['field_games_list_thumb_img_small'][0]['url'],
                        ['product' => $product]
                    )
            ];

            if (count($game['field_game_filter']) > 0) {
                $filters = [];
                foreach ($game['field_game_filter'] as $filter) {
                    if (isset($filter['parent']) &&
                        isset($filter['parent']['field_games_filter_value'])) {
                        $filters[$filter['parent']['field_games_filter_value'][0]['value']][]
                            = $filter['field_games_filter_value'][0]['value'];
                    }
                }

                $processGame['filters'] = json_encode($filters);
            }


            $processGame['title'] = $game['title'][0]['value'] ?? "";
            $processGame['game_code'] = $game['field_game_code'][0]['value'] ?? "";
            $processGame['game_provider'] = $game['field_game_provider'][0]['value'] ?? "pas";
            $processGame['game_platform'] = $game['field_game_platform'][0]['value'] ?? "";
            $processGame['keywords'] = $game['field_keywords'][0]['value'] ?? "";
            $processGame['weight'] = 0;
            $processGame['target'] = $game['field_games_target'][0]['value'] ?? "popup";
            $processGame['preview_mode'] = $game['field_preview_mode'][0]['value'] ?? 0;
            $processGame['use_game_loader'] = (isset($game['field_disable_game_loader'][0]['value'])
                && $game['field_disable_game_loader'][0]['value']) ? "false" : "false";

            $categoryList = [];

            foreach ($game['field_games_list_category'] as $category) {
                $categoryList[$category['field_games_alias'][0]['value']] =
                    $category['field_draggable_views']['category']['weight'] ?? 0;
            }

            $processGame['categories'] = $categoryList;

            return $processGame;
        } catch (\Exception $e) {
            ddd($e->getMessage());
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
            $publishOn = $game['publish_on'][0]['value'] ?? '';
            $unpublishOn = $game['unpublish_on'][0]['value'] ?? '';
            if (PublishingOptions::checkDuration($publishOn, $unpublishOn)) {
                $special = ($categoryId === $this::RECOMMENDED_GAMES);
                $gamesList['id:' . $game['field_game_code'][0]['value']] =
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
