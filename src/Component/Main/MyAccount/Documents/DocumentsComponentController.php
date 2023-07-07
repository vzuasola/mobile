<?php

namespace App\MobileEntry\Component\Main\MyAccount\Documents;

/**
 *
 */
class DocumentsComponentController
{
    const BRAND = 'Dafabet';
    const DRIVE_FOLDER_ID = '1XLeA0iy28Ron14DUt78XPzmYnDQIQk-9';

    /**
     * @var \App\Rest\Resource $rest Rest Object.
     */
    private $rest;

    /**
     * @var \App\Fetcher\Drupal\ConfigFetcher $configFetcher Config Fetcher Object
     */
    private $configFetcher;

    /**
     * @var \App\Fetcher\Integration\UserFetcher $userFetcher User Fetcher Object
     */
    private $userFetcher;

    /**
     * @var \App\Fetcher\Drupal\ConfigFormFetcher $formFetcher Form Fetcher
     */
    private $formFetcher;

    /**
     * @var \App\Fetcher\Integration\JIRAFetcher $jiraService
     */
    private $jiraService;

    /**
     * @var \App\Fetcher\Integration\GoogleStorageFetcher $googleService
     */
    private $googleService;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('config_fetcher'),
            $container->get('user_fetcher'),
            $container->get('config_form_fetcher'),
            $container->get('jira_service'),
            $container->get('google_storage_fetcher')
        );
    }

    /**
     * Public constructor
     *
     * @param \App\Rest\Resource $rest Rest Object.
     * @param \App\Fetcher\Drupal\ConfigFetcher $configFetcher Config Fetcher Object
     * @param \App\Fetcher\Integration\UserFetcher $userFetcher User Fetcher Object
     * @param \App\Fetcher\Drupal\ConfigFormFetcher $formFetcher Form Fetcher
     * @param \App\Fetcher\Integration\JIRAFetcher $jiraService
     * @param \App\Fetcher\Integration\GoogleStorageFetcher $googleService
     */
    public function __construct(
        $rest,
        $configFetcher,
        $userFetcher,
        $formFetcher,
        $jiraService,
        $googleService
    ) {
        $this->rest = $rest;
        $this->configFetcher = $configFetcher->withProduct('account');
        $this->userFetcher = $userFetcher;
        $this->formFetcher = $formFetcher->withProduct('account');
        $this->jiraService = $jiraService;
        $this->googleService = $googleService;
    }

    /**
     * Document Upload handler
     *
     */
    public function documentUpload($request, $response)
    {

        // Fetch Documents Feature Configuration for necessary IDs
        try {
            $documentsConfig = $this->configFetcher->getConfig('my_account_config.documents_configuration');
            $jiraProjectId = $documentsConfig['jira_project_id'];
            $jiraIssueTypeId = $documentsConfig['jira_issue_type_id'];
        } catch (\Throwable $e) {
            return $this->rest->output(
                $response,
                [
                    'status' => 'failure',
                    'message' => 'Could not create ticket. Configuration Error',
                ]
            );
        }

        // Upload Documents to Google Drive
        try {
            $purpose = $request->getParam('DocumentsForm_purpose');
            $purpose = $this->documentPurposeMap($purpose);
            $uploadReturn = $this->uploadDocs($request->getUploadedFiles(), $purpose, $documentsConfig);
        } catch (\Throwable $e) {
            return $this->rest->output(
                $response,
                [
                    'status' => 'failure',
                    'message' => 'Could not create ticket. Could not upload documents',
                ]
            );
        }

        // Fetch Player input from form
        try {
            $playerComments = $request->getParam('DocumentsForm_comment') ?? '';
            $purpose = $request->getParam('DocumentsForm_purpose');
            $purpose = $this->documentPurposeMap($purpose);
        } catch (\Exception $e) {
            return $this->rest->output(
                $response,
                [
                    'status' => 'failure',
                    'message' => 'Could not create ticket. User input error',
                ]
            );
        }

        // Current Date formatted as required for first line of ticket
        $currentDate = (new \DateTime(
            date("Y-m-d"),
            new \DateTimeZone(date_default_timezone_get())
        ))->format('d.m.y');

        // Jira Ticket Content. Each row is a paragraph in the ticket
        $paragraphs =[
            [
                "content" => 'Player Comments',
                "type" => 'panel'
            ],
            $currentDate,
            $playerComments,
            [
                "content" => 'Player Attachments',
                "type" => 'panel',
                'panelType' => 'note',
            ],
            'Upload Unique ID: ' . $uploadReturn['UniqueID'],
        ];

        foreach ($uploadReturn['Documents'] as $key => $documentUrl) {
            $paragraphs[] = $this->jiraService->atlassianDocFormatLinkFormatter(
                $documentUrl,
                $key . ': ' . $documentUrl
            );
        }

        try {
            $playerDetails = $this->userFetcher->getPlayerDetails();
            $vip = $this->vipLevelMap($playerDetails['vipLevel']);
        } catch (\Exception $e) {
            return $this->rest->output(
                $response,
                [
                    'status' => 'failure',
                    'message' => 'Could not create ticket. VIP Mismatch',
                ]
            );
        }

        // Format the ticket title.
        $title = strtr(
            "{username} - Brand[{brand}] - Currency[{currency}] - VIP Level[{vip}] - Purpose[{purpose}]",
            [
                '{username}' => $playerDetails['username'],
                '{brand}' => 'DF',
                '{currency}' => $playerDetails['currency'],
                '{vip}' => $vip,
                '{purpose}' => $purpose,
            ]
        );

        try {
            $data = $this->jiraService->createTicket(
                $jiraProjectId,
                $jiraIssueTypeId,
                $title,
                $paragraphs
            );
        } catch (\Throwable $e) {
            return $this->rest->output(
                $response,
                [
                    'status' => 'failure',
                    'message' => 'Could not create ticket.',
                ]
            );
        }

        if ($data['status'] !== 'success') {
            return $this->rest->output($response, [
                'status' => 'failure',
                'message' => 'Could not create ticket.',
            ]);
        }

        return $this->rest->output($response, [
            'status' => 'success',
            'message' => 'Ticket Created',
        ]);
    }

    /**
     * Maps the user's numeric level to a text label
     *
     * @param int $level The user's level as a number
     *
     * @return string The user's level in text
     */
    protected function vipLevelMap(int $level) : string
    {
        $vipMap = [
            14 => 'Bronze',
            16 => 'Bronze',
            15 => 'Silver',
            25 => 'Silver',
            17 => 'Gold',
            17 => 'Gold',
            13 => 'Platinum',
            18 => 'Platinum',
        ];

        if (!array_key_exists($level, $vipMap)) {
            throw new \Exception('Unrecognised level');
        }

        return $vipMap[$level];
    }

    /**
     * Maps the value from the document purpose dropdown field to its label in english
     *
     * @param string $key The selected option value
     *
     * @return string The respective label of that value
     */
    protected function documentPurposeMap(String $key) : string
    {

        // Fetch purpose field mapping
        $formConfig = $this->formFetcher->getDataById('documents_form');
        $purposeMap = [];
        $mapLines = explode(PHP_EOL, $formConfig['fields']['purpose']['field_settings']['choices']);
        foreach ($mapLines as $el) {
            $expl = explode("|", $el);
            $purposeMap[$expl[0]] = $expl[1];
        };

        if (!array_key_exists($key, $purposeMap)) {
            throw new \Exception('Unrecognised level');
        }

        return $purposeMap[$key];
    }

    /**
     * Wrapper for document upload logic
     *
     * @param array $uploadedFiles The contents of $request->getUploadedFiles()
     *
     * @return array Array containing the status, upload unique id and uploaded file list
     *
     * Format:
     *
     * [
     *      "Success" => true,
     *      "UniqueID" => uniqid(),
     *      "Documents" => [
     *        "Document1" => "https://...",
     *        "Document2" => "https://..."
     *      ]
     *  ];
     */
    protected function uploadDocs(array $uploadedFiles, $purpose, $documentsConfig) : array
    {
        $driveFolderId = $documentsConfig['folder_id'] ?? self::DRIVE_FOLDER_ID;
        $brand = $documentsConfig['brand'] ?? self::BRAND;
        $uniqueId = \mt_rand(100000, 999999);
        $data['UniqueID'] = $uniqueId;
        $docNum = 1;
        $uploadReturn = [
            'Success' => true,
            'UniqueID' => $uniqueId,
        ];

        try {
            $playerDetails = $this->userFetcher->getPlayerDetails();
        } catch (\Exception $e) {
            throw new \Exception('Could not upload documents');
        }

        try {
            $fileNameFormat = strtr(
                "{username} - {brand} - {currency} - {vip} - {purpose} - {uniqueId}",
                [
                    '{username}' => $playerDetails['username'],
                    '{brand}' => self::BRAND,
                    '{currency}' => $playerDetails['currency'],
                    '{vip}' => $playerDetails['vipLevel'],
                    '{purpose}' => $purpose,
                    '{uniqueId}' => $uniqueId,
                ]
            );

            foreach ($uploadedFiles as $document) {
                if (!empty($document->getClientFilename())) {
                    $fileNameFormat = strtoupper($fileNameFormat . " - [$docNum]");

                    $response = $this->googleService->storeUsingServiceAccount(
                        $driveFolderId,
                        $document->getStream()->getMetadata('uri'),
                        $fileNameFormat,
                        $document->getClientMediaType()
                    );

                    if ($response['status'] === 'success') {
                        $uploadReturn["Documents"]["Document$docNum"] = $response['data'];
                    }

                    $docNum++;
                }
            }
        } catch (\Exception $e) {
            $uploadReturn['Success'] = false;
        }

        if ($uploadReturn['Success'] !== true) {
            throw new \Exception('Could not upload documents');
        }

        return $uploadReturn;
    }
}
