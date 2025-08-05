import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import PlanBillingTab from "@/components/settings/PlanBillingTab";

const Settings = () => {
  return (
    <MainAppLayout 
      title="App Settings"
      description="Manage app-level configurations, subscriptions, and user access for WorkflowGuard."
    >
      <ContentSection>
        <div className="max-w-7xl mx-auto">
          <PlanBillingTab />
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default Settings;
