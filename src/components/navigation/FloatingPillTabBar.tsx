import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Dimensions,
  Keyboard,
} from 'react-native';
import {
  PillHomeIcon,
  PillLibraryIcon,
  PillAssistantIcon,
  PillTasksIcon,
  PillFinanceIcon,
} from './PillTabIcons';
import { GlassView } from '../common/GlassView';
import { haptic } from '../../utils/haptics';
import { useAppStore } from '../../stores/appStore';

export interface FloatingPillTabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string; params?: any }[];
  };
  descriptors: Record<string, { options: any }>;
  navigation?: {
    emit: (event: any) => any;
    navigate: (name: string, params?: any) => void;
  };
  navigateToTab?: (routeKey: string) => void;
  [key: string]: any;
}

const { width } = Dimensions.get('window');

export function FloatingPillTabBar(props: FloatingPillTabBarProps) {
  const { state, descriptors, navigation, navigateToTab } = props;
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);
  const isSheetOpen = useAppStore((s) => s.isSheetOpen);

  React.useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (isKeyboardVisible || isSheetOpen) {
    return null;
  }
  const renderIcon = (routeName: string, focused: boolean) => {
    const color = focused ? '#34312F' : '#88827E';
    switch (routeName) {
      case 'index':
        return <PillHomeIcon size={22} color={color} focused={focused} />;
      case 'library':
        return <PillLibraryIcon size={22} color={color} focused={focused} />;
      case 'assistant':
        return <PillAssistantIcon size={22} color={color} focused={focused} />;
      case 'tasks':
        return <PillTasksIcon size={22} color={color} focused={focused} />;
      case 'finance':
        return <PillFinanceIcon size={22} color={color} focused={focused} />;
      default:
        return <PillHomeIcon size={22} color={color} focused={focused} />;
    }
  };

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return 'Home';
      case 'library':
        return 'Library';
      case 'assistant':
        return 'Assistant';
      case 'tasks':
        return 'Tasks';
      case 'finance':
        return 'Finance';
      default:
        return routeName;
    }
  };

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <GlassView
        cornerRadius={40}
        variant="regular"
        tint="rgba(255, 255, 255, 0.88)"
        interactive
        style={styles.pillBar}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label = getLabel(route.name);

          const onPress = () => {
            haptic.selection();

            if (navigateToTab) {
              navigateToTab(route.key);
            } else if (navigation) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              style={({ pressed }) => [
                styles.tabItem,
                isFocused && styles.activeTabItem,
                {
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              {/* Inner capsule pill background for active tab matching reference */}
              {isFocused && <View style={styles.activePillHighlight} />}

              <View style={styles.iconWrapper}>
                {renderIcon(route.name, isFocused)}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.activeTabLabel : styles.inactiveTabLabel,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  pillBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 40,
    height: 68,
    paddingHorizontal: 8,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: 'rgba(238, 234, 229, 0.85)',
    // Soft, floating shadow matching the reference image
    shadowColor: '#2C2723',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 27,
  },
  activeTabItem: {
    // The active tab container
  },
  activePillHighlight: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 2,
    right: 2,
    borderRadius: 25,
    backgroundColor: '#F5ECE7', // Soft warm capsule pill background
    borderWidth: 1,
    borderColor: '#EFE4DD',
  },
  iconWrapper: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 10.5,
    letterSpacing: -0.2,
  },
  activeTabLabel: {
    color: '#34312F',
    fontWeight: '700',
  },
  inactiveTabLabel: {
    color: '#88827E',
    fontWeight: '500',
  },
});
