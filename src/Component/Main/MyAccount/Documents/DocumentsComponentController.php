<?php

namespace App\MobileEntry\Component\Main\MyAccount\Documents;

/**
 *
 */
class DocumentsComponentController
{
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
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('config_fetcher'),
            $container->get('user_fetcher'),
            $container->get('config_form_fetcher'),
            $container->get('jira_service')
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
     */
    public function __construct(
        $rest,
        $configFetcher,
        $userFetcher,
        $formFetcher,
        $jiraService
    ) {
        $this->rest = $rest;
        $this->configFetcher = $configFetcher->withProduct('account');
        $this->userFetcher = $userFetcher;
        $this->formFetcher = $formFetcher->withProduct('account');
        $this->jiraService = $jiraService;
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
            $uploadReturn = $this->uploadDocs($request->getUploadedFiles());
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
        $currentDate = (new \DateTime())->format('d.m.y');

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
            "{username} - Brand[DF] - Currency[{currency}] - VIP Level[{vip}] - Purpose[{purpose}]",
            [
                '{username}' => $playerDetails['username'],
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
            'message' => 'Ticket Created'
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
        foreach ($mapLines as $mapLine) {
            [$key, $value] = explode("|", $mapLine);
            $purposeMap[$key] = $value;
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
    protected function uploadDocs(array $uploadedFiles) : array
    {

        $uploadReturn = [
            "Success" => true,
            "UniqueID" => uniqid(),
            "Documents" => [
              "Document1" => "https://drive.google.com/file/d/1yNYxeEKrsArcVULCu-d3K-3k2vkEwQlH/view?usp=drivesdk",
              "Document2" => "https://drive.google.com/file/d/1w5NbqUp-sOIs462X7wbdqXSkBCpOh33c/view?usp=drivesdk"
            ]
        ];

        if ($uploadReturn['Success'] !== true) {
            throw new \Exception('Could not upload documents');
        }

        return $uploadReturn;
    }
}
