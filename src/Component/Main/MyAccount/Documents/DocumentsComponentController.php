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
     * @var \App\Configuration\YamlConfiguration $configManager
     */
    private $configManager;

    /**
     * @var \Psr\Log\LoggerInterface $logger
     */
    private $logger;

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
            $container->get('google_storage_fetcher'),
            $container->get('configuration_manager'),
            $container->get('logger')
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
     * @param \App\Configuration\YamlConfiguration $configManager
     * @param \Psr\Log\LoggerInterface $logger
     */
    public function __construct(
        $rest,
        $configFetcher,
        $userFetcher,
        $formFetcher,
        $jiraService,
        $googleService,
        $configManager,
        $logger
    ) {
        $this->rest = $rest;
        $this->configFetcher = $configFetcher->withProduct('account');
        $this->userFetcher = $userFetcher;
        $this->formFetcher = $formFetcher->withProduct('account');
        $this->jiraService = $jiraService;
        $this->googleService = $googleService;
        $this->configManager = $configManager;
        $this->logger = $logger;
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
            $this->logger->error('DOCUMENT.UPLOADTO.CONFERROR', [
                'status_code' => 'NOT OK',
                'request' => '',
                'others' => [
                    'exception' => $e->getMessage(),
                ],
            ]);

            return $this->rest->output(
                $response,
                [
                    'status' => 'failure',
                    'message' => 'Could not create ticket. Configuration Error',
                ]
            );
        }

        // Fetch Player input from form
        try {
            $playerComments = $request->getParam('DocumentsForm_comment') ?? '';
            $playerComments = $playerComments !== '' ? $playerComments : 'User did not provide a comment';
            $purpose = $request->getParam('DocumentsForm_purpose');
            $purpose = $this->documentPurposeMap($purpose);
        } catch (\Exception $e) {
            $this->logger->error('DOCUMENT.UPLOADTO.USERINPUTERROR', [
                'status_code' => 'NOT OK',
                'request' => '',
                'others' => [
                    'exception' => $e->getMessage(),
                ],
            ]);

            return $this->rest->output(
                $response,
                [
                    'status' => 'failure',
                    'message' => 'Could not create ticket. User input error',
                ]
            );
        }

        // Upload Documents to Google Drive
        try {
            $uploadedFiles = $request->getUploadedFiles();
            $uploadReturn = $this->uploadDocs($uploadedFiles, $purpose, $documentsConfig);
        } catch (\Throwable $e) {
            $this->logger->error('DOCUMENT.UPLOADTO.GDRIVEERROR', [
                'status_code' => 'NOT OK',
                'request' => '',
                'others' => [
                    'exception' => $e->getMessage(),
                ],
            ]);

            return $this->rest->output(
                $response,
                [
                    'status' => 'failure',
                    'message' => 'Could not create ticket. Could not upload documents',
                ]
            );
        }

        // Validate Form Input
        $fields = [
            'first_upload' => $uploadedFiles['DocumentsForm_first_upload']->file ?? '',
            'second_upload' => $uploadedFiles['DocumentsForm_second_upload']->file ?? '',
            'third_upload' => $uploadedFiles['DocumentsForm_third_upload']->file ?? '',
            'purpose' => $purpose,
            'comment' => $playerComments,
        ];

        $validationErrors = [];

        try {
            $validationErrors = $this->validate($fields);
        } catch (\Throwable $e) {
            $this->logger->error('DOCUMENT.UPLOADTO.VALIDATIONERROR', [
                'status_code' => 'NOT OK',
                'request' => '',
                'others' => [
                    'exception' => $e->getMessage(),
                ],
            ]);

            return $this->rest->output(
                $response,
                [
                    'status' => 'failure',
                    'message' => 'Could not create ticket. Validation Error',
                ]
            );
        }

        if (count($validationErrors) > 0) {
            $this->logger->error('DOCUMENT.UPLOADTO.VALIDATIONRULEERROR', [
                'status_code' => 'NOT OK',
                'request' => '',
                'others' => [
                    'exception' => json_encode($validationErrors),
                ],
            ]);

            return $this->rest->output(
                $response,
                [
                    'status' => 'failure',
                    'message' => 'Could not create ticket. Validation Failed',
                ]
            );
        }

        // Current Date formatted as required for first line of ticket
        $currentDate = (new \DateTime())->format('d.m.y');

        // Jira Ticket Content. Each row is a paragraph in the ticket
        $paragraphs = [
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

        $additionalFields = [
            // VIP Level
            'customfield_14576' => $vip,
            // Purpose
            'customfield_14498' => $purpose,
            // Currency
            'customfield_14148' => $playerDetails['currency'],
            // Username
            'customfield_14354' => $playerDetails['username'],
        ];

        try {
            $data = $this->jiraService->createTicket(
                $jiraProjectId,
                $jiraIssueTypeId,
                $title,
                $paragraphs,
                $additionalFields
            );
        } catch (\Throwable $e) {
            $this->logger->error('DOCUMENT.UPLOADTO.JIRAERROR', [
                'status_code' => 'NOT OK',
                'request' => '',
                'others' => [
                    'exception' => $e->getMessage(),
                ],
            ]);

            return $this->rest->output(
                $response,
                [
                    'status' => 'failure',
                    'message' => 'Could not create ticket.',
                ]
            );
        }

        if ($data['status'] !== 'success') {
            $this->logger->error('DOCUMENT.UPLOADTO.JIRAFAILED', [
                'status_code' => 'NOT OK',
                'request' => '',
                'others' => [
                    'exception' => json_encode($data),
                ],
            ]);

            return $this->rest->output($response, [
                'status' => 'failure',
                'message' => 'Could not create ticket.',
            ]);
        }

        try {
            // Set user status to "Under Review" which is ID 3
            $this->userFetcher->setDocumentStatus(3);
        } catch (\Throwable $e) {
            $this->logger->error('DOCUMENT.UPLOADTO.ICORESTATUS', [
                'status_code' => 'NOT OK',
                'request' => '',
                'others' => [
                    'exception' => json_encode($data),
                ],
            ]);

            return $this->rest->output($response, [
                'status' => 'failure',
                'message' => 'Could not update user document status.',
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
        $formConfig = $this->formFetcher->setLanguage('en')->getDataById('documents_form');
        $purposeMap = [];
        $mapLines = explode(PHP_EOL, $formConfig['fields']['purpose']['field_settings']['choices']);
        foreach ($mapLines as $mapLine) {
            [$mapLineKey, $mapLineValue] = explode("|", $mapLine);
            $purposeMap[$mapLineKey] = $mapLineValue;
        };

        if (!array_key_exists($key, $purposeMap)) {
            throw new \Exception('Unrecognised purpose');
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

        if (count($this->validateFiles($uploadedFiles))) {
            throw new \Exception('File Validation Failed');
        }

        try {
            $fileNameFormat = strtr(
                "{username} - {brand} - {currency} - {vip} - {purpose} - {uniqueId}",
                [
                    '{username}' => $playerDetails['username'],
                    '{brand}' => $brand,
                    '{currency}' => $playerDetails['currency'],
                    '{vip}' => $playerDetails['vipLevel'],
                    '{purpose}' => $purpose,
                    '{uniqueId}' => $uniqueId,
                ]
            );

            foreach ($uploadedFiles as $document) {
                if (!empty($document->getClientFilename())) {
                    $currentFileName = strtoupper($fileNameFormat . " - [$docNum]");

                    $response = $this->googleService->storeUsingServiceAccount(
                        $driveFolderId,
                        $document->getStream()->getMetadata('uri'),
                        $currentFileName,
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

    /**
     * Validates file type and max size of uploaded files
     *
     * @param array $uploadedFiles The contents of $request->getUploadedFiles()
     * @return array Array of fields that has error
     */
    protected function validateFiles(array $uploadedFiles)
    {
        $errors = [];
        $formConfig = $this->formFetcher->getDataById('documents_form')['fields'];
        $uploadFields = [
            'DocumentsForm_first_upload' => 'first_upload',
            'DocumentsForm_second_upload' => 'second_upload',
            'DocumentsForm_third_upload' => 'third_upload'
        ];

        foreach ($uploadedFiles as $key => $document) {
            if (empty($document->getClientFilename())) {
                continue;
            }

            // Check supported file type
            $field = $uploadFields[$key];
            $validExt = $formConfig[$field]['field_settings']['data-allowed_file_extensions'];
            $validExtArr =  array_map('trim', explode(',', $validExt));
            $fileExt = pathinfo($document->getClientFilename(), PATHINFO_EXTENSION);

            if (!in_array(strtolower($fileExt), $validExtArr)) {
                $errors[$key][] = "Invalid File Type";
            }

            // Get maximum size
            $maxSize = $formConfig[$field]['field_settings']['data-maximum-image-size'] ?? '6MB';
            $max = preg_replace("/[^0-9]/", '', $maxSize);

            // Convert MB to bytes
            $maxSizeBytes = (int) $max * 1024 * 1024;

            // Check file size
            if ($document->getSize() > $maxSizeBytes) {
                $errors[$key][] = "File is greater than maximum size allowed";
            }
        }

        return $errors;
    }

    /*
     * Validate Webcomposer Configurable Form data
     *
     * @param array $submission An array containing the form values
     *
     * @return array Validation Errors
     */
    private function validate(array $submission): array
    {
        $validators = $this->configManager->getConfiguration('forms')['validations'];
        $settings = $this->formFetcher->getDataById('documents_form');

        $errors = [];
        $fields = $settings['fields'];


        foreach ($submission as $key => $value) {
            foreach ($validators as $index => $validator) {
                if (isset($fields[$key]['field_validations'][$index]['enable']) &&
                    $fields[$key]['field_validations'][$index]['enable']
                ) {
                    $error = $this->doValidate($fields[$key], $key, $value, $index, $validator);

                    if ($error) {
                        $errors[$key][] = $error;
                    }
                }
            }
        }

        return $errors;
    }

    /**
     * Validate a specific field
     *
     * @param array $field Field Definition
     * @param string $key Field key
     * @param string $dat Field value
     * @param string $method Validator name
     * @param string $class Validator Class
     */
    private function doValidate($field, $key, $data, $method, $class)
    {
        $arguments = [];

        if (isset($field['field_validations'][$method]['parameters'])) {
            $arguments = array_values($field['field_validations'][$method]['parameters']);
        }

        $options = [$data, $arguments, $field];
        $result = $this->executeValidator($class, $options);

        if (empty($result)) {
            $defaultMessage = "The $method validation has failed for field $key";
            $message = $field['field_validations'][$method]['error_message'] ?? $defaultMessage;
            return $message;
        }
    }

    /**
     * Executes the validator base on class definition
     */
    private function executeValidator($definition, $options)
    {
        list($class, $method) = explode(':', $definition);

        $instance = new $class;

        return $instance->$method(...$options);
    }
}
