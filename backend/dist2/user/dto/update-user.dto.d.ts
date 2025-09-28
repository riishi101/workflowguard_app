export declare class UpdateUserDto {
    email?: string;
    name?: string;
    jobTitle?: string;
    timezone?: string;
    language?: string;
}
export declare class UpdateNotificationSettingsDto {
    notificationsEnabled: boolean;
    notificationEmail: string;
    workflowDeleted: boolean;
    enrollmentTriggerModified: boolean;
    workflowRolledBack: boolean;
    criticalActionModified: boolean;
}
