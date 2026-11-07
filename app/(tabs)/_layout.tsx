import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { radius, shadows, spacing } from '@/theme';

type IconProps = { emoji: string; label: string; focused: boolean };

function TabIcon({ emoji, label, focused }: IconProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.iconWrap}>
      <View
        style={[
          styles.iconPill,
          focused && {
            backgroundColor: theme.colors.accent + '22',
          },
        ]}
      >
        <Text style={[styles.emoji, { opacity: focused ? 1 : 0.45 }]}>{emoji}</Text>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBackground,
          borderTopColor: colors.tabBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          ...shadows.md,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: -2,
        },
        headerStyle: {
          backgroundColor: colors.headerBackground,
          borderBottomColor: colors.headerBorder,
          borderBottomWidth: 1,
          ...shadows.sm,
        },
        headerTintColor: colors.headerText,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
          letterSpacing: -0.2,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="transfers"
        options={{
          title: 'Payments',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon emoji="💸" label="Payments" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon emoji="🤝" label="Groups" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="savings"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Insights" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
        }}
      />
      {/* Keep payees accessible via deep-link / navigation but hide from tab bar */}
      <Tabs.Screen
        name="payees"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="top-up"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  emoji: { fontSize: 20 },
});
