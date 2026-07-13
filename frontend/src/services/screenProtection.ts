import { Capacitor, registerPlugin } from '@capacitor/core';

interface ScreenProtectionPlugin {
  setEnabled(options: { enabled: boolean }): Promise<{ enabled: boolean }>;
  getState(): Promise<{ enabled: boolean }>;
}

const NativeScreenProtection = registerPlugin<ScreenProtectionPlugin>('ScreenProtection');
const STORAGE_KEY = 'control-financiero-screen-protection';

export const screenProtection = {
  async getState() {
    if (Capacitor.isNativePlatform()) return NativeScreenProtection.getState();
    return { enabled: localStorage.getItem(STORAGE_KEY) === 'true' };
  },
  async setEnabled(enabled: boolean) {
    if (Capacitor.isNativePlatform()) return NativeScreenProtection.setEnabled({ enabled });
    localStorage.setItem(STORAGE_KEY, String(enabled));
    return { enabled };
  }
};
