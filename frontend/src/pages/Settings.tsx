import React from 'react';
import { SettingsDashboard } from '@/components/dashboard/SettingsDashboard';
import { ScrollReveal } from '@/components/ui/animations';

const Settings = () => {
  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-16 max-w-5xl mx-auto">
      <ScrollReveal>
        <SettingsDashboard />
      </ScrollReveal>
    </div>
  );
};

export default Settings;
