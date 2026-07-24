/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const primary = '#2563eb'; // Blue 600
const secondary = '#3b82f6'; // Blue 500
const accent = '#f59e0b'; // Amber 500
const success = '#10b981'; // Emerald 500
const error = '#ef4444'; // Red 500

export const Colors = {
  light: {
    text: '#111827', // Gray 900
    textMuted: '#6b7280', // Gray 500
    background: '#ffffff',
    card: '#ffffff',
    cardAlt: '#f8fafc', // Slightly off-white for alternate card surfaces
    border: '#f3f4f6', // Gray 100
    borderStrong: '#e2e8f0', // Gray 200 – for dividers/separators
    primary,
    secondary,
    accent,
    success,
    error,
    tint: primary,
    icon: '#6b7280',
    tabIconDefault: '#9ca3af',
    tabIconSelected: primary,
    headerGradient: ['#1d4ed8', '#3b82f6'], // Blue 700 to Blue 500
    announcementBg: '#eff6ff', // Blue 50
    announcementBorder: '#bfdbfe', // Blue 200
    // Announcement / notification orange card
    announcementCardBg: '#fff7ed',
    announcementCardBorder: '#fdba74',
    announcementAccent: '#f97316',
    // Subtle surface for stats/grid items
    gridItemBg: 'rgba(0,0,0,0.03)',
    // Dividers inside cards
    divider: 'rgba(0,0,0,0.08)',
    // Footer border in event detail
    footerBorder: 'rgba(0,0,0,0.05)',
    // Deadline info background
    deadlineBg: 'rgba(0,0,0,0.02)',
    // Logout button background
    logoutBg: '#fef2f2',
    // Avatar shadow background
    avatarShadowBg: '#ffffff',
  },
  dark: {
    text: '#f9fafb',
    textMuted: '#9ca3af',
    background: '#0f172a',
    card: '#1e293b',
    cardAlt: '#1e293b', // Same as card in dark mode
    border: '#334155',
    borderStrong: '#475569', // Slate 600
    primary,
    secondary,
    accent,
    success,
    error,
    tint: '#f9fafb',
    icon: '#9ca3af',
    tabIconDefault: '#4b5563',
    tabIconSelected: '#f9fafb',
    headerGradient: ['#1e3a8a', '#1e293b'], // Dark blue tones
    announcementBg: '#1e293b',
    announcementBorder: '#334155',
    // Announcement / notification orange card – dark-adapted
    announcementCardBg: '#2d1f0e',
    announcementCardBorder: '#92400e',
    announcementAccent: '#f97316',
    // Subtle surface for stats/grid items
    gridItemBg: 'rgba(255,255,255,0.05)',
    // Dividers inside cards
    divider: 'rgba(255,255,255,0.08)',
    // Footer border in event detail
    footerBorder: 'rgba(255,255,255,0.08)',
    // Deadline info background
    deadlineBg: 'rgba(255,255,255,0.04)',
    // Logout button background
    logoutBg: '#450a0a',
    // Avatar shadow background
    avatarShadowBg: '#334155',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
