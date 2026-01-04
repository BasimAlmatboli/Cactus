import React, { useState } from 'react';
import { Settings as SettingsIcon, Package, Truck, Users, Tag } from 'lucide-react';
import { GeneralSettings } from '../components/settings/GeneralSettings';
import { ProfitShareSettings } from '../components/settings/ProfitShareSettings';
import { ProductSettings } from '../components/settings/ProductSettings';
import { ShippingSettings } from '../components/settings/ShippingSettings';
import { QuickDiscountSettings } from '../components/settings/QuickDiscountSettings';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export const Settings = () => {
  const sections: SettingSection[] = [
    {
      id: 'general',
      title: 'General Settings',
      icon: <SettingsIcon className="h-5 w-5" />,
      component: <GeneralSettings />,
    },
    {
      id: 'profit-share',
      title: 'Profit Share',
      icon: <Users className="h-5 w-5" />,
      component: <ProfitShareSettings />,
    },
    {
      id: 'products',
      title: 'Product Settings',
      icon: <Package className="h-5 w-5" />,
      component: <ProductSettings />,
    },
    {
      id: 'shipping',
      title: 'Shipping Settings',
      icon: <Truck className="h-5 w-5" />,
      component: <ShippingSettings />,
    },
    {
      id: 'quick-discounts',
      title: 'Quick Discounts',
      icon: <Tag className="h-5 w-5" />,
      component: <QuickDiscountSettings />,
    },
  ];

  const [activeSection, setActiveSection] = useState<string>('general');

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="h-full flex gap-8">
      {/* Settings Sidebar */}
      <div className="w-64 flex-shrink-0">
        <h2 className="text-2xl font-bold text-white mb-8">Settings</h2>

        <nav className="space-y-2">
          {sections.map((section) => {
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <div className={isActive ? 'text-white' : 'text-gray-500'}>
                  {section.icon}
                </div>
                <span className="font-medium text-sm">{section.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {currentSection?.title}
          </h2>
          <p className="text-gray-400 text-sm">
            Manage your {currentSection?.title.toLowerCase()} preferences
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-[#1C1F26] rounded-2xl border border-gray-800 p-8 shadow-xl">
          {currentSection?.component}
        </div>
      </div>
    </div>
  );
};