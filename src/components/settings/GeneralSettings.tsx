import React, { useState, useEffect } from 'react';
import { Save, Loader2, Settings as SettingsIcon } from 'lucide-react';
import {
    getAllEditableSettings,
    updateSetting,
    settingsCache
} from '../../services/settingsService';

interface Setting {
    id: string;
    setting_key: string;
    setting_value: string;
    setting_type: 'number' | 'string' | 'boolean' | 'json';
    description: string | null;
    category: string | null;
    is_editable: boolean;
}

export const GeneralSettings = () => {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [editedValues, setEditedValues] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getAllEditableSettings();
            setSettings(data);

            // Initialize edited values
            const initialValues: Record<string, string> = {};
            data.forEach(setting => {
                initialValues[setting.setting_key] = setting.setting_value;
            });
            setEditedValues(initialValues);
        } catch (err) {
            console.error('Error loading settings:', err);
            setError('Failed to load settings. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleValueChange = (key: string, value: string) => {
        setEditedValues(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async (key: string) => {
        try {
            setIsSaving(true);
            const setting = settings.find(s => s.setting_key === key);
            if (!setting) return;

            const value = editedValues[key];

            // Parse value based on type
            let parsedValue: any = value;
            if (setting.setting_type === 'number') {
                parsedValue = Number(value);
                if (isNaN(parsedValue)) {
                    alert('Please enter a valid number');
                    return;
                }
            } else if (setting.setting_type === 'boolean') {
                parsedValue = value === 'true';
            }

            await updateSetting(key, parsedValue);

            // Clear cache for this setting
            settingsCache.clear(key);

            // Update local state
            setSettings(prev => prev.map(s =>
                s.setting_key === key
                    ? { ...s, setting_value: value }
                    : s
            ));

            alert('Setting saved successfully!');
        } catch (err) {
            console.error('Error saving setting:', err);
            alert('Failed to save setting. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const formatLabel = (key: string): string => {
        return key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getInputType = (type: string): string => {
        switch (type) {
            case 'number':
                return 'number';
            case 'boolean':
                return 'checkbox';
            default:
                return 'text';
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">General Settings</h2>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading settings...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">General Settings</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                    <button
                        onClick={loadSettings}
                        className="ml-4 text-red-800 underline hover:no-underline"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
        const category = setting.category || 'general';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(setting);
        return acc;
    }, {} as Record<string, Setting[]>);

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2">
                <SettingsIcon className="h-6 w-6 text-gray-700" />
                <h2 className="text-xl font-semibold">General Settings</h2>
            </div>

            {Object.entries(groupedSettings).map(([category, categorySettings]) => (
                <div key={category} className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 capitalize">
                        {category} Settings
                    </h3>

                    <div className="space-y-4">
                        {categorySettings.map((setting) => (
                            <div key={setting.id} className="border-b border-gray-200 pb-4 last:border-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {formatLabel(setting.setting_key)}
                                        </label>
                                        {setting.description && (
                                            <p className="text-xs text-gray-500 mb-2">
                                                {setting.description}
                                            </p>
                                        )}

                                        <div className="flex items-center space-x-2">
                                            {setting.setting_type === 'boolean' ? (
                                                <input
                                                    type="checkbox"
                                                    checked={editedValues[setting.setting_key] === 'true'}
                                                    onChange={(e) => handleValueChange(setting.setting_key, e.target.checked ? 'true' : 'false')}
                                                    className="rounded text-blue-500 focus:ring-blue-500"
                                                    disabled={isSaving}
                                                />
                                            ) : (
                                                <input
                                                    type={getInputType(setting.setting_type)}
                                                    value={editedValues[setting.setting_key] || ''}
                                                    onChange={(e) => handleValueChange(setting.setting_key, e.target.value)}
                                                    className="w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                    step={setting.setting_type === 'number' ? '0.01' : undefined}
                                                    disabled={isSaving}
                                                />
                                            )}

                                            {setting.setting_key === 'free_shipping_threshold' && (
                                                <span className="text-sm text-gray-600">SAR</span>
                                            )}

                                            <button
                                                onClick={() => handleSave(setting.setting_key)}
                                                disabled={isSaving || editedValues[setting.setting_key] === setting.setting_value}
                                                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${editedValues[setting.setting_key] === setting.setting_value
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                            >
                                                {isSaving ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Save className="h-4 w-4" />
                                                )}
                                                <span>Save</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
