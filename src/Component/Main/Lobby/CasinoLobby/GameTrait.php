<?php

namespace App\MobileEntry\Component\Main\Lobby\CasinoLobby;

use App\MobileEntry\Services\PublishingOptions\PublishingOptions;

/**
 * Trait for games
 */
trait GameTrait
{
    /**
     * Simplify game array V2
     */
    private function processGameV2($product, $game, $special = false)
    {
        try {
            $processGame = [];
            $size = 'size-small';
            $processGame['size'] = ($special) ? 'size-small' : $size;

            if (!empty($game['field_game_ribbon']['games_ribbon_label'])) {
                $ribbon = $game['field_game_ribbon'];
                $processGame['ribbon']['background'] = $ribbon['games_ribbon_color'];
                $processGame['ribbon']['color'] = $ribbon['games_text_color'];
                $processGame['ribbon']['name'] = $ribbon['games_ribbon_label'];
            }

            if (!empty($game['field_all_games_category_ribbon']['games_ribbon_label'])) {
                $allGamesribbon = $game['field_all_games_category_ribbon'];
                $processGame['all_games_ribbon']['background'] = $allGamesribbon['games_ribbon_color'];
                $processGame['all_games_ribbon']['color'] = $allGamesribbon['games_text_color'];
                $processGame['all_games_ribbon']['name'] = $allGamesribbon['games_ribbon_label'];
            }

            $processGame['image'] = [
                'alt' => $game['field_games_list_thumb_img_small']['alt'],
                'url' =>
                    $this->asset->generateAssetUri(
                        $game['field_games_list_thumb_img_small']['url'],
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
                if (isset($category['draggable'])) {
                    $categoryList[$category['games_alias']] =
                        $category['draggable']['weight'] ?? 0;
                }
            }

            $processGame['categories'] = $categoryList;

            return $processGame;
        } catch (\Exception $e) {
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
            $publishOn = $this->gamesListVersion
                ? $game['publish_on'] ?? '' : $game['publish_on'][0]['value'] ?? '';
            $unpublishOn = $this->gamesListVersion
                ? $game['unpublish_on'] ?? '' : $game['unpublish_on'][0]['value'] ?? '';
            $status = true;
            if (!$publishOn && !$unpublishOn) {
                $status = $this->gamesListVersion ? $game['status'] : $game['status'][0]['value'];
            }
            if (PublishingOptions::checkDuration($publishOn, $unpublishOn)
                && $status) {
                $special = ($categoryId === $this::RECOMMENDED_GAMES);
                $fieldGameCode = $this->gamesListVersion
                    ? $game['field_game_code'] : $game['field_game_code'][0]['value'];
                $fieldId = $this->gamesListVersion
                    ? $game['id'] : $game['nid'][0]['value'];
                $gamesList['id:' . $fieldGameCode . $fieldId] = $this->gamesListVersion
                    ? $this->processGameV2($product, $game, $special)
                    : $this->processGameV1($product, $game, $special);
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

    /**
     * Simplify game array V1
     */
    private function processGameV1($product, $game, $special = false)
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
            return [];
        }
    }
}
