import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radii, spacing, typeScale } from '@/lib/theme';
import type { BookingStatus } from '@/lib/api';

export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <SafeAreaView style={[styles.screen, style]} edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
}

export function Heading({ children, style, ...rest }: TextProps) {
  return (
    <Text style={[styles.heading, style]} {...rest}>
      {children}
    </Text>
  );
}

export function SubHeading({ children, style, ...rest }: TextProps) {
  return (
    <Text style={[styles.subHeading, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Body({ children, style, muted, ...rest }: TextProps & { muted?: boolean }) {
  return (
    <Text style={[styles.body, muted && styles.bodyMuted, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Label({ children, style, ...rest }: TextProps) {
  return (
    <Text style={[styles.label, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Card({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card style={styles.statTile}>
      <Label>{label}</Label>
      <Heading style={styles.statValue}>{String(value)}</Heading>
    </Card>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.black : colors.black} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'secondary' && styles.buttonTextSecondary,
            variant === 'danger' && styles.buttonTextDanger,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const STATUS_STYLES: Record<BookingStatus, { bg: string; fg: string }> = {
  'Awaiting Payment': { bg: colors.warningBg, fg: colors.warning },
  'Booking Confirmed': { bg: colors.successBg, fg: colors.success },
  'Payment Arrangement': { bg: colors.warningBg, fg: colors.warning },
  Refunded: { bg: colors.grey, fg: colors.textMuted },
  Cancelled: { bg: colors.dangerBg, fg: colors.danger },
};

export function StatusBadge({ status }: { status: BookingStatus | string }) {
  const style = STATUS_STYLES[status as BookingStatus] ?? { bg: colors.grey, fg: colors.textMuted };
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.badgeText, { color: style.fg }]}>{status}</Text>
    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <View style={styles.emptyState}>
      <SubHeading style={{ textAlign: 'center' }}>{title}</SubHeading>
      {message ? (
        <Body muted style={{ textAlign: 'center', marginTop: spacing.xs }}>
          {message}
        </Body>
      ) : null}
    </View>
  );
}

export function LoadingState() {
  return (
    <View style={styles.emptyState}>
      <ActivityIndicator color={colors.accentMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  heading: { fontFamily: fonts.headingBold, fontSize: typeScale.h1, color: colors.text },
  subHeading: { fontFamily: fonts.heading, fontSize: typeScale.h2, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: typeScale.body, color: colors.text, lineHeight: 21 },
  bodyMuted: { color: colors.textMuted },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: typeScale.tiny,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  statTile: { flex: 1, gap: spacing.xs },
  statValue: { fontSize: typeScale.h2 },
  button: {
    borderRadius: radii.pill,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonPrimary: { backgroundColor: colors.black },
  buttonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.black },
  buttonDanger: { backgroundColor: colors.danger },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: { opacity: 0.85 },
  buttonText: { fontFamily: fonts.bodySemiBold, fontSize: typeScale.body, color: colors.cream },
  buttonTextSecondary: { color: colors.black },
  buttonTextDanger: { color: colors.cream },
  badge: { paddingVertical: 4, paddingHorizontal: spacing.sm, borderRadius: radii.pill, alignSelf: 'flex-start' },
  badgeText: { fontFamily: fonts.bodySemiBold, fontSize: typeScale.tiny },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
});
