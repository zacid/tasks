import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { user } from './auth';

export interface UserSettings {
    task_age_days: number;
}

export const defaultSettings: UserSettings = {
    task_age_days: 3
};

export const settings = writable<UserSettings>(defaultSettings);

// Load settings when user changes
user.subscribe(async (currentUser) => {
    if (!currentUser) {
        settings.set(defaultSettings);
        return;
    }

    try {
        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();

        if (error) throw error;
        settings.set(data || defaultSettings);
    } catch (error) {
        console.error('Error loading settings:', error);
        settings.set(defaultSettings);
    }
});

export async function updateSettings(newSettings: Partial<UserSettings>) {
    const currentUser = await supabase.auth.getUser();
    if (!currentUser.data.user) return;

    try {
        const { error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: currentUser.data.user.id,
                ...newSettings
            });

        if (error) throw error;

        settings.update(current => ({
            ...current,
            ...newSettings
        }));
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
} 