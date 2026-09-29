import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import { Body, Button, Heading, Screen } from '@/components/ui';
import { colors, fonts, radii, spacing, typeScale } from '@/lib/theme';
import { useSession } from '@/lib/auth';
import { ApiError } from '@/lib/api';

export default function SignIn() {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const form = (
    <View style={styles.content}>
      <View style={styles.brand}>
        <Body style={styles.eyebrow}>FIFI CAPTURE STUDIO</Body>
        <Heading style={styles.title}>Staff Portal</Heading>
        <Body muted style={styles.subtitle}>Sign in with your studio account</Body>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Body style={styles.fieldLabel}>Email</Body>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@fificapturestudio.com"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Body style={styles.fieldLabel}>Password</Body>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={onSubmit}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              style={styles.passwordToggle}
              hitSlop={8}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          </View>
        </View>

        {error ? (
          <Body style={styles.error}>{error}</Body>
        ) : null}

        <Button title="Sign in" onPress={onSubmit} loading={loading} disabled={!email || !password} />
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <Screen>
        <KeyboardAvoidingView style={styles.flex} behavior={undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {form}
          </ScrollView>
        </KeyboardAvoidingView>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={40}
      >
        {form}
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  content: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, gap: spacing.xxl, maxWidth: 420, width: '100%', alignSelf: 'center' },
  brand: { alignItems: 'center', gap: spacing.xs },
  eyebrow: { fontFamily: fonts.bodySemiBold, fontSize: typeScale.tiny, letterSpacing: 3, color: colors.accent },
  title: { fontSize: 32, marginTop: spacing.xs },
  subtitle: { marginTop: spacing.xs },
  form: { gap: spacing.md },
  field: { gap: spacing.xs },
  fieldLabel: { fontFamily: fonts.bodyMedium, fontSize: typeScale.small },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  passwordRow: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: spacing.xl + spacing.md },
  passwordToggle: { position: 'absolute', right: spacing.md, padding: spacing.xs },
  error: { color: colors.danger, textAlign: 'center' },
});
