export const API_PATH = {
    LOGIN: 'login',
    FORGOT_PASSWORD: 'forgot/password',
    RESET_PASSWORD: 'reset/password',
    CHANGE_PASSWORD: 'user/password/update',
    PROFILE_DATA: 'user/profile',
    COUNTRIES_LIST: 'get/countries',
    STATES: 'get/states',
    UPDATE_PROFILE: 'user/detail/update',
    DASHBOARD: 'dashboard',
    LOGOUT: 'user/logout',
    USERS_LIST: 'user/list',
    ADD_USER: 'user/add',
    VIEW_USER: 'user/view',
    UPDATE_USER: 'user/update',
    DELETE_USER: 'user/delete',
    ROLES_LIST: 'user/role/list',
    LEAD_OPTIONS_LIST: 'lead/option/list',
    ASSIGNED_OPTIONS_LIST: 'user/list',
    LEAD_BASIC_DETAILS_SUBMIT: 'lead/create',
    LEAD_OFFICER_DETAIL_SUBMIT: 'lead/create-officer',
    LEAD_PARTNER_DETAIL_SUBMIT: 'lead/create-partner',
    LEAD_BUSSINESS_DETAIL_SUBMIT: 'lead/create-business-property',
    LEAD_BANK_DETAIL_SUBMIT: 'lead/create-bank-information',
    LIST_FOR_USERS: 'user/listfor',
    FULL_VIEW_LEAD: 'lead/create-single-lead',
    LEAD_LIST: 'lead/list',
    GET_ALL_STATES: 'get/all-states',
    DELETE_LEADS: 'lead/delete',
    ADMIN_LISTS: 'admin/user/list',
    ROLE_DETAIL: 'user/role/permissions',
    UPDATE_ROLE_PERMISSION: 'user/permission/assign',
    COMPANY_USERS: 'company/users/list',
    LEAD_DETAILS: 'lead/detail/',
    LEAD_EDIT_DETAIL: 'lead/edit-detail/',
    LEAD_UPDATES: 'lead/logs',
    LEAD_DOCUMENTS: 'lead-document/list',
    LEAD_ACTIVITIES: 'lead/activity',
    RENAME_LEAD_DOC: 'lead-document/rename-file',
    DELETE_LEAD_DOC: 'lead-document/delete-file',
    DASHBOARD_SEARCH: 'admin/search',
    PREDICTIVE_SEARCH: 'lead/psearch',
    LEAD_OFFICER: 'lead/get-lead-officer/',
    LEAD_PARTNER: 'lead/get-lead-partner/',
    LEAD_BUSINESS: 'lead/get-lead-property/',
    LEAD_BANK: 'lead/get-lead-bank/',
    ADD_ACTIVITY: 'lead/create-activity',
    UPLOAD_LEAD_DOC: 'lead-document/upload-file',
    EXPORT_LEAD: 'lead/export',
    EXPORT_PDF: 'lead/app-pdf/',
    LEAD_NOTES: 'lead/note',
    CREATE_LEAD_NOTE: 'lead/create-note',
    LEAD_SUBMISSION: 'lead-submission/send',
    DATA_MERCH: 'data-merch/search-merch',
    DOWNLOAD_FILE: 'lead-document/download',
    DOCUMENT_TYPES: 'lead-document/type-list',
    COMPANY_LEADS: 'lead-document/lead-list',
    EXPERIAN_CREDIT_SCORE: 'experian/search-score',
    EXPERIAN_BUSS_SCORE: 'experian/search-address',
    FCS_DETAILS: 'money-thumb/get-fcs',
    FETCH_FCS: 'money-thumb/score-card',
    SUBMIT_FCS: 'money-thumb/save-fcs',
    DECLINE_LEAD: 'lead/decline',
    DECLINE_OPTIONS: 'lead/option/list/specific-group',
    SYNDICATES_LIST: 'syndicate/list',
    SHARE_DOC: 'lead-document/send-access-link',
    VERIFY_DOC_LINK: 'lead-document/verify-access-link',
    CREATE_CONTRACT: 'lead/create-contract',
    WITHDRAW_LEAD: 'lead/withdraw',
    ADD_SYNDICATE: 'syndicate/add',
    SYNDICATE_UPDATE: 'syndicate/update/status',
    ALL_SYNDICATE_LIST: 'syndicate/select-list',
    LEAD_SOURCE: 'reports/lead-source',
    LOGIN_LOGS: 'reports/login-logs',
    LEAD_SUBMISSION_REPORTS: 'reports/lead-submission',
    LEAD_REJECTED: 'reports/lead-rejected',
    UNDERWRITER_REPORT: 'reports/underwriter-report',
    PENDING_DOCS: 'lead-document/checklist',
    REQ_PENDING_DOCS: 'lead-document/send-pending-doc-email',
    LANDLORD_INTERVIEW: 'lead/lanlord-interview',
    USER_LIST: 'user/listfor',
    UNDERWRITER_OPTIONS: 'user/listfor?role=Underwriter',
    EMAIL_REPORT_LOGS: 'reports/email-logs',
    LENDER_LIST: 'lender/select-list',
    CREATE_LENDER_OFFER: 'lead/lender-offer',
    GET_ALL_EMAIL_TEMPLATE_NAMES: 'company/templates/names',
    GET_EMAIL_TEMPLATE_HTML: 'company/template',
    SAVE_EMAIL_TEMPLATE: 'company/templates/update',
    MERCHANT_INTERVIEW: 'lead/merchant-interview',
    FCS_LEAD_DETAILS: 'money-thumb/preview-fcs',
    GET_PRE_FUND_DROPDOWNS: 'lead/option/list/specific-group',
    AGENT_LIST: 'agent/option-list',
    LEAD_PRE_FUND: 'lead/pre-funding',
    LEAD_WELCOME_CALL: 'lead/welcome-call',
    USER_CHANGE_PASSWORD: 'user/update/password',
    ADD_ROLE: 'user/role/create',
    ROLE_DELETE: 'user/role/delete',
    PRE_FUNDING_LIST: 'lead/get-pre-funding',
    ADD_FUNDING_DETAILS: 'participant/add',
    PERMISSION_GROUP_LIST: 'user/permission/group/list',
    UPDATE_PERMISSION_GROUP_LIST: 'user/permission/group/update',
    PARTICIPANT_LIST: 'participant/list',
    PARTICIPATION_DELETE: 'participant/delete',
    VIEW_SYNDICATE: 'syndicate/view',
    UPDATE_SYNDICATE: 'syndicate/update',
    SYNDICATE_DOCUMENT_DELETE: 'syndicate/doc/delete',
    SYNDICATE_DELETE: 'syndicate/delete',
    FEDERAL_TAX_ID: 'lead/check/federaltaxid',
    DUMMY_TEMPLATE: 'company/template',
    ADD_EMAIL_TEMPLATE: 'company/templates/create',
    VERIFY_CUSTOMER: 'verify/customer',
    LENDER_CREATE: 'lender/create',
    LENDER_ALL_LIST: 'lender/all-list',
    LENDER_UPDATE: 'lender/update/status',
    LENDER_VIEW: 'lender/view',
    LENDER_DELETE: 'lender/delete',
    LENDER_EDIT: 'lender/update',
    SEND_GRID_VIEW: 'send-grid/view',
    SEND_GRID_ADD: 'send-grid/add',
    EMAIL_TEMPLATES_DELETE: 'company/templates/delete',
    SEND_APP_EMAIL_TEMPLATE_LIST: 'company/templates/names/custom',
    SEND_EMAIL_SUBMIT: 'company/user/send-mail',
    LEAD_NOTIFY: 'lead-submission/send/notify',
    LEAD_SEND_SMS: 'company/user/send-sms',
    SEND_EMAIL_PREVIEW: 'company/user/template-view',
    GET_THANKS_MESSAGE: 'company/get/thanks/message',
    UPDATE_THANX_MESSAGE: 'company/update/thanks/message',
    GET_OPTIONS_SMS_TEMPLATE: 'sms/template/select/list',
    SEND_SMS_PREVIEW: 'company/user/template-view',
    CREATE_TEAM: 'team/create',
    TEAM_LIST: 'team/list',
    TEAM_VIEW: 'team/view',
    TEAM_EDIT: 'team/update',
    TEAM_DELETE: 'team/delete',
    PROPOSE_SUBMISSION: 'lead-submission/proposed/submission',
    LEAD_SPECIFIC_LENDER: 'lender/select/list',
    PERSONILIZED_VARIABLES: 'company/templates/personalize/list',
    LENDERS_LIST: 'lead-submission/proposed/lenders',
    SUBMITTED_DEALS_LENDER_LIST: 'lead-submission/submission/lenders/list',
    UPDATE_LENDER_OFFER_STATUS: 'lead-submission/lender/response',
    LEAD_COUNT: 'lead/count',
    USER_COMMISION_LIST: 'lead-commission/list',
    ADD_COMMISSION: 'lead-commission/add',
    COMMISSION_DETAILS: 'lead-commission/detail',
    USER_UPDATE_STATUS: 'user/update/status',
    USER_PRIORITY_LIST: 'user/priorityList',
    FUNDING_REPORT: 'reports/lead-fund-report',
    OFFER_REPORT: 'reports/offer-report',
    ALL_LENDERS_LIST: 'lender/lender-list',
    LENDER_SUBMISSION_REPORT: 'reports/lender-submission-report',
    FUNDED_REPORT: 'reports/funded-report',
    PRE_FUNDING_REPORT: 'reports/pre-funding-report',
    LENDER_REPORT: 'reports/lenders-report',
    UPDATE_LOG_REPORT: 'reports/update-logs-report',
    ISO_PAYMENT_REPORT: 'reports/iso-payment-report',
    SUBMISSION_REPORT: 'reports/submission-report',
    FETCH_SUBMISSION_REPORT: 'reports/fetch-submission-lead',
    PULL_THROUGH_RATIO_REPORT: 'reports/pull-through-ratio-report',
    LOGIN_IPS_REPORT: 'reports/fetch-login-logs',
    LENDER_OWE_REPORT: 'reports/lender-owe-report',
    ANALYTICS_REPORTS: 'reports/analytics-report',
    LENDER_OFFER_LISTING: 'lead/all-lenders-offer',
    VIEW_CREATE_LENDER_OFFER: 'lead/lender-offer-view',
    GET_PRE_FUNDING: 'lead/lead-pre-funding',
    LENDER_OFFER_DELETE: 'lead/lender-offer-delete',
    GET_TIMEZONES: 'get/time-zone',
    GET_DATE_FORMAT: 'get/date-format',
    GET_LENDER_OFFER_FORM: 'company/get/offer-form/field',
    SUBMIT_LENDER_FORM: 'company/store/offer-form/field',
    RELATED_DEALS: 'lead/related-deals',
    REPORT_DESCRIPTION_UPDATE: 'report/desciption/update',
    GRAPH_DASHBOARD: 'graph-dashboard',
    EMAIL_TEMPLATE_LIST: 'company/email/template/list',
    GET_EMAIL_CONFIGURATIONS: 'configuration/email-config/get',
    GET_TWILIO_CONFIGURATIONS: 'configuration/twilio/get',
    GET_EXPERIAN_CONFIGURATIONS: 'configuration/experian/get',
    GET_HELLO_SIGN_CONFIGURATIONS: 'configuration/hello-sign/get',
    GET_MONEY_THUMB_CONFIGURATIONS: 'configuration/money-thumb/get',
    GET_DECISION_LOGIC_CONFIGURATIONS: 'configuration/decision-logic/get',
    STORE_EMAIL_CONFIGURATIONS: 'configuration/email-config/store',
    STORE_TWILIO_CONFIGURATIONS: 'configuration/twilio/store',
    STORE_EXPERIAN_CONFIGURATIONS: 'configuration/experian/store',
    STORE_HELLO_SIGN_CONFIGURATIONS: 'configuration/hello-sign/store',
    STORE_MONEY_THUMB_CONFIGURATIONS: 'configuration/money-thumb/store',
    STORE_DECISION_LOGIC_CONFIGURATIONS: 'configuration/decision-logic/store',
    EMAIL_TEMPLATE_STATUS_UPDATE: 'configuration/status/update',
    PAYROLL_LIST: 'payroll/list',
    ADD_DRIP_CAMPAIGN: 'drip-campaign/add',
    DRIP_CAMPAIGN_LIST: 'drip-campaign/list',
    DRIP_CAMPAIGN_UPDATE_STATUS: 'drip-campaign/changeStatus',
    DRIP_CAMPAIGN_VIEW: 'drip-campaign/view',
    DRIP_CAMPAIGN_DELETE: 'drip-campaign/delete',
    DRIP_CAMPAIGN_UPDATE: 'drip-campaign/update',
    SEND_TEST_EMAIL_TEMPLATE: 'company/test/email-template',
    GET_DATA_MERCH_CONFIGURATIONS: 'configuration/data-merch/get',
    STORE_DATA_MERCH_CONFIGURATIONS: 'configuration/data-merch/store',
    DRIP_CAMPAINGN_LOGS_LIST: 'drip-campaign/logs',
    UPLOAD_EMAIL_TEMPLATE_IMAGE: 'company/image-upload',
    UNSUBSCRIBE_API: 'user/unsubscribe',
    MAIL_SEND_FORCEFULLY: 'user/force-send',
    DRIP_CAMPAIGNS_ENROLLMENT_LIST: 'drip-campaign/enrollment',
    UNSUBSCRIBE_EXISTS: 'user/already-unsubscribe',
    CAMPAIGN_LEAD_LIST: 'list-campaign/list',
    LIST_ADD: 'list-campaign/add',
    LIST_CAMPAIGN: 'list-campaign/get',
    LIST_CAMPAIGN_UPDATE_STATUS: 'list-campaign/changeStatus',
    VIEW_LISTING: 'list-campaign/view',
    UPDATE_LIST: 'list-campaign/update',
    LIST_DELETE: 'list-campaign/delete',
    LEAD_DETAIL_LEAD_STATUS_UPDATE: 'lead/status/update',
    LEAD_DETAIL_LEAD_SOURCE_UPDATE: 'lead/source/update',
    DELETED_LIST: 'list-campaign/get-deleted-list',
    GET_FUNDING_RECORDS: 'lead/get-pre-funding-list',
    CREATE_AGENT: 'agent/create',
    GET_AGENT_LIST: 'agent/list',
    AGENT_UPDATE_STATUS: 'agent/update-status',
    AGENT_VIEW: 'agent/view',
    AGENT_UPDATE: 'agent/update',
    AGENT_DELETE: 'agent/delete',
    UPDATE_COLOR: 'user/store-primary-color',
    GOOGLE_API: 'https://maps.googleapis.com/maps/api/geocode/json',
    ROLES_EMAIL_LIST: 'user/template/role/list',
    SYSTEM_NOTIFICATIONS_ADD: 'system-notification/add',
    SYSTEM_NOTIFICATIONS_LIST: 'system-notification/list',
    SYSTEM_NOTIFICATION_VIEW: 'system-notification/view',
    SYSTEM_NOTIFICATION_LIST_STATUS_UPADTE: 'system-notification/updateStatus',
    SYSTEM_NOTIFICATION_DELETE: 'system-notification/delete',
    SYSTEM_NOTIFICATION_UPDATE: 'system-notification/update',
    SYSTEM_NOTIFICATION_LOGS: 'system-notification/get-logs',
    SYSTEM_EMAIL_TEMPLATE_LIST: 'company/system/template/list',
    EMAIL_TEMPLATE_LISTING_NEW: 'company/lead/status/template/list',
    CUSTOMER_LEAD_DOCUMENT_TYPE: 'lead-document/specific-type-list',
    LEAD_SOURCE_LIST: 'lead-source/list',
    CREATE_LEAD_SOURCE: 'lead-source/create',
    UPDATE_LEAD_SOURCE: 'lead-source/update',
    DELETE_LEAD_SOURCE: 'lead-source/delete',
    UPDATE_STATUS_LEAD_SOURCE: 'lead-source/update/status',
    DASBOARD_CARDS_UPDATE: 'user/manage-dashoard-cards',
    VERIFY_USER: 'verify/user',
    SELECT_EMAIL_TEMPLATES: 'user/get-system-templates',
    USER_GENERATE_TEMPLATES: 'user/generate-system-templates',
    LEAD_STATUS_LISTING: 'lead-exclusive/status/list',
    LEAD_STATUS_UPDATE: 'lead-exclusive/status/update',
    LEAD_STATUS_EDIT: 'lead-exclusive/status/edit',
    SEND_SUBMISSION_NOTES: 'lead-submission/multiSubmission/list',
    LENDER_OFFER_DECINED: 'lead-submission/decline/lender/list',
    PAYROLL_LIST_LENDER: 'lender/payroll-list',
    DELETE_PREFUND_LIST: 'lead/delete-pre-funding-list',
    FIRST_OWNER_SIGNATURE: 'lead/owner-sign-email',
    UPDATE_COMPANY_STATUS: 'lead/company-paid-status/update',
    LEAD_IMPORT: 'lead/import',
    CREATE_LEAD_STATUS: 'lead-exclusive/status/create',
    DELETE_LEAD_STATUS: 'lead-exclusive/status/delete',
    BUSINESS_TYPE_LIST: 'business-type/list',
    CREATE_BUSINESS_TYPE: 'business-type/create',
    UPDATE_BUSINESS_TYPE: 'business-type/update',
    DELETE_BUSINESS_TYPE: 'business-type/delete',
    UPDATE_STATUS_BUSINESS_TYPE: 'business-type/update/status',
    LEAD_SOURCE_VIEW: 'lead-source/view',
    MONEY_THUMB_DOCUMENT_LIST: 'money-thumb/document-list',
    MONEY_THUMB_PUSH_DOCS: 'money-thumb/push-docs',
    MONEY_THUMB_SCORE_CARD: 'money-thumb/score-card',
    LEAD_DETAIL_LEAD_TYPE_UPDATE: 'lead/type/update',
    DELETE_ACTIVITY: 'lead/delete-activity',
    EDIT_ACTIVITY: 'lead/edit-activity',
    VIEW_ACTIVITY: 'lead/view-activity',
    LEAD_SOURCE_DOCUMENTS: 'lead-source/document-list',
    LEAD_SOURCE_UPLOAD_DOCUMENTS: 'lead-source/document-upload',
    LEAD_SOURCE_UPLODED_DOCUMENTS_LIST: 'lead-source/uploaded-document-list',
    LEAD_SOURCE_EMAIL: 'lead-source/send-confirmation-mail',
    LEAD_SOURCE_DOCUMENT_DELETE: 'lead-source/document-delete',
    VERIFY_LEAD_SOURCE: 'verify/lead-source/token',
    VERIFY_LEAD_SOURCE_VIEW: 'verify/lead-source/view',
    VERIFY_LEAD_SOURCE_UPDATE: 'verify/lead-source/update',
    VERIFY_LEAD_SOURCE_DOCUMENT_LIST: 'verify/lead-source/document-list',
    VERIFY_LEAD_SOURCE_UPLODED_DOCUMENTS: 'verify/lead-source/uploaded-document-list',
    VERIFY_LEAD_SOURCE_DOCUMENT_DELETE: 'verify/lead-source/document-delete',
    VERIFY_LEAD_SOURCE_TIME_ZONE: 'verify/lead-source/time-zone',
    VERIFY_LEAD_SOURCE_ENTITY_TYPE: 'verify/lead-source/list/specific-group',
    VERIFY_LEAD_SOURCE_DOCUMENT_DOWNLOAD: 'verify/lead-source/download',
    VERIFY_LEAD_SOURCE_DOCUMENT_UPLOAD: 'verify/lead-source/document-upload',
    VERIFY_LEAD_SOURCE_THANKS_MESSAGE: 'verify/lead-source/get/thanks/message',
    SYNDICATE_DOCUMENT_UPLOAD: 'syndicate/doc/upload',
    SYNDICATE_UPLOADED_DOCUMENTS_LIST: 'syndicate/doc/upload/list',
    SYNDICATE_EMAIL: 'syndicate/send/email',
    VERIFY_SYNDICATE: 'verify/syndicate/token',
    VERIFY_SYNDICATE_VIEW: 'verify/syndicate/view',
    VERIFY_SYNDICATE_UPDATE: 'verify/syndicate/update',
    VERIFY_SYNDICATE_UPLOADED_DOCUMENTS: 'verify/syndicate/uploaded-doc-list',
    VERIFY_SYNDICATE_DOCUMENT_DELETE: 'verify/syndicate/doc-delete',
    VERIFY_SYNDICATE_DOCUMENT_UPLOAD: 'verify/syndicate/doc-upload',
    VERIFY_SYNDICATE_THANKS_MESSAGE: 'verify/syndicate/get/thanks/message',
    VERIFY_SYNDICATE_DOWNLOAD: 'verify/syndicate/download',
    VERIFY_PARTICIPANT_TOKEN: 'verify/participant/token',
    VERIFY_PARTICIPANT_DOCUMENTS: 'verify/participant/doc-list',
    SEND_EMAIL_TO_PARTICIPANT: 'participant/mail-send',
    PARTICIPANT_LOGS: 'lead/module-logs',
    LENDER_UPDATE_STATUS: 'money-thumb/update-lender-status',
    NOTES_USER_LISTS: 'lead/note/tag/users',
    SYNDICATE_SECOND_SIGNATURE: 'verify/syndicate/signature/upload',
    LEAD_SOURCE_SIGNATURE: 'verify/lead-source/signature/upload',
    GET_SLIDER_SETTINGS: 'lead/get-slider-settings',
    STORE_SLIDER_SETTINGS: 'lead/store-slider-settings',
    GET_CRM_UTILITIES_ROLES: 'user/crm/utilities/permissions',
    UPDATE_CRM_PERMISSION: 'user/crm/utilities/update',
    GET_LEAD_CONTRACTS_DETAILS: 'lead/get-contract-details',
    VERIFY_LENDER_OFFER: 'verify/lender-offer/token',
    VERIFY_LENDER_OFFER_VIEW: 'verify/lender-offer/view',
    VERIFY_LENDER_OFFER_DOC_TYPES: 'verify/lender-offer/doc-list',
    VERIFY_DROPDOWN_OPTIONS: 'verify/lender-offer/specific-group-list',
    VERIFY_ACTIVE_LENDER_LIST: 'verify/lender-offer/preview-fcs',
    VERIFY_LENDER_LIST: 'verify/lender-offer/select-list',
    VERIFY_LENDER_SLIDER_LIST: 'verify/lender-offer/get/slider-setting',
    VERIFY_LENDER_UPDATE_STATUS: 'verify/lender-offer/lender-status/update',
    VERIFY_LENDER_OFFER_UPDATE: 'verify/lender-offer/update',
    VERIFY_LENDER_UPLOAD_DOC: "verify/lender-offer/upload-doc",
    VERIFY_LENDER_UPLOADED_DOC_LIST: 'verify/lender-offer/uploaded-doc-list',
    VERIFY_LENDER_DOC_DELETE: 'verify/lender-offer/doc-delete',
    VERIFY_LENDER_DOWNLOAD_DOC: 'verify/lender-offer/doc-download',
    CRM_UTILITIES_ORDER_UPDATE: 'utilities-order/update',
    DUPLICATE_LEADS: 'lead/duplicate-lead',
    DOCUMENT_TYPE_LIST: 'document-type/list',
    DOCUMENT_TYPE_CREATE: 'document-type/create',
    DOCUMENT_TYPE_UPDATE: 'document-type/update',
    DOCUMENT_TYPE_DELETE: 'document-type/delete',
    DOCUMENT_TYPE_UPDATE_STATUS: 'document-type/update/status',
    EMAIL_TEMPLATE_TYPE_LIST: 'email-template-type/list',
    EMAIL_TEMPLATE_TYPE_CREATE: 'email-template-type/create',
    EMAIL_TEMPLATE_TYPE_UPDATE: 'email-template-type/update',
    EMAIL_TEMPLATE_TYPE_DELETE: 'email-template-type/delete',
    EMAIL_TEMPLATE_TYPE_UPDATE_STATUS: 'email-template-type/update/status',
    LEAD_COMPANY_DOCUMENTS: 'lead-document/all-document-list',
    LEAD_EMAIL_TEMPLATE_EXIST: 'lead/check/template/exist',
    EMAIL_EXIST_EMAIL_TEMPLATE: 'company/email/exist',
    GET_SYSTEM_NOTIFICATION_TEMPLATE_DETAILS: 'system-notification/get-template',
    EXPORT_PAYROLL: 'payroll/export',
    LENDER_OFFER_EXISTS_SUBMITTED_DEALS: 'lead-submission/lender-offer',
    LEAD_DETAIL_ISO_UPDATE: 'lead/iso/update',
    LEAD_DETAIL_CLOSER_UPDATE: 'lead/closer/update',
    LEAD_HOLD: 'lead/hold-note',
    GET_MANAGE_CARDS: 'user/dashoard-cards-list',
    PAYROLL_MARK_AS_PAID: 'payroll/paid-statuses/update',
    ADD_PAYROLL_SETTING: 'payroll/setting/update',
    GET_PAYROLL_DATA: 'payroll/setting/get',
    GET_SVG_LIST: 'lead-exclusive/dashboard/svg/list',
    AGENT_DETAIL: 'agent/detail',
    COMPANY_DOCUMENTS_LIST: 'company-document/list',
    COMPANY_DOCUMENTS_UPLOAD: 'company-document/upload-file',
    COMPANY_DOCUMENTS_RENAME: 'company-document/rename-file',
    COMPANY_DOCUMENTS_DELETE: 'company-document/delete-file',
    DISCLOSURE_STATES: 'disclouser/state-list',
    DISCLOSURE_STATE_CREATE: 'disclouser/create',
    GET_DISCLOSURE_LIST: 'disclouser/list',
    DISCLOSURE_DELETE: 'disclouser/delete',
    DISCLOUSER_EMAIL: 'disclouser/document-email',
    DISCLOSURE_SIGN_API: 'disclouser-document/store',
    GET_DISCLOSURE_THANKS_MESSAGE: 'disclouser-document/thanks/message',
    GET_PAYROLL_SETTING_ADMIN: 'payroll/company/setting/get',
    UPDATE_PAYROLL_SETTINGS_ADMIN: 'payroll/company/setting/update',
    GET_PAYROLL_LIST_ADMIN: 'payroll/company/list',
    PAYROLL_ADMIN_COMPANY_STATUS: 'payroll/company/paid-status/update',
    PAYROLL_EXPORT_ADMIN: 'payroll/company/export',
    CONTRACT_SETTINGS_STORE: 'contract-setting/store',
    GET_CONTRACT_SETTINGS_LIST: 'contract-setting/view',
    COMPANY_PERMISSIONS: 'user/company-permissions-get',
    VERIFY_HUB_SIGN: 'lead-document/verify-hub-sign',
    HUB_SIGN_UPDATE: 'lead-document/hub-sign-events',
    HUB_SIGN_DOWNLOAD: 'hub-sign/download',
    DOWNLOAD_SYNIDCATE_FILE: 'verify/syndicate/download',
    DOWNLOAD_LEADSOURCE_FILE: 'verify/lead-source/download',
    CREATE_CONTRACT_HUB_SIGN: 'lead-document/contract/store-merchant-details',
    ADD_COMPANY_PERMISSION: 'user/company-permissions-store',
    VERIFY_AFFILATE_LINK: 'verify/affilate/token',
    AFFILATE_LINK_LEAD_OPTIONS: 'verify/affilate/option/list',
    AFFILATE_LINK_ASSIGNED_OPTIONS: 'verify/affilate/user/listfor',
    AFFILATE_LINK_FEDERAL_TAX_ID: 'verify/affilate/check/federaltaxid',
    AFFILATE_LINK_LEAD_BASIC_DETAILS_SUBMIT: 'verify/affilate/create-lead',
    AFFILATE_LINK_LEAD_OFFICER_DETAIL_SUBMIT: 'verify/affilate/create-officer',
    AFFILATE_LINK_LEAD_PARTNER_DETAIL_SUBMIT: 'verify/affilate/create-partner',
    AFFILATE_LINK_FULL_VIEW_LEAD: 'verify/affilate/create-single-lead',
    WEBHOOK_CENTREX: 'lead/webhook-centrex/export',
    GET_CONTRACT_HUB_SIGN_VALUE: 'lead-document/contract/get-merchant-details',
    AFFILIATE_DOCUMENT_LIST:'verify/affilate/document-list',
    AFFILIATE_SPECIFIC_DOCUMENT_TYPE:'verify/affilate/specific-document-type',
    AFFILIATE_UPLOAD_DOCS:'verify/affilate/upload-file',
    LEAD_EXCLUSIVE_PERIOD:'lead/exclusive/time-period',
    LEAD_ACCESS_CHECK:'lead/check-lead-access',
    LENDER_OFFER_ADD_DECLINE_REASON:'lead/lender-offer/add/decline-reason',
    ASSIGNED_TO_UPDATE:'lead/assignedTo/update',
    HUB_SIGN_DOWNLOAD_DOC:'hub-sign/view/download',
    EXCLUSIVE_REMOVE:'lead/exclusive-period-remove',
    POWER_BI_LINK:'reports/power-bi-link',
    POWER_BI_REPORT:'reports/power-bi-report',
}