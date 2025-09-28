"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_CONFIG = void 0;
exports.PLAN_CONFIG = {
    starter: {
        maxWorkflows: 25,
        historyDays: 30,
        features: ['basic_monitoring', 'email_support'],
    },
    professional: {
        maxWorkflows: 500,
        historyDays: 90,
        features: [
            'advanced_monitoring',
            'priority_support',
            'custom_notifications',
        ],
    },
    enterprise: {
        maxWorkflows: null,
        historyDays: null,
        features: [
            'unlimited_workflows',
            'advanced_monitoring',
            '24_7_support',
            'api_access',
            'user_permissions',
            'audit_logs',
        ],
    },
};
