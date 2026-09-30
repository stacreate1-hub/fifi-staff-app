import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Body, Button, Card, EmptyState, Label, LoadingState, Screen } from '@/components/ui';
import { colors, radii, spacing } from '@/lib/theme';
import {
  useCreateStaffAccount,
  useDeleteStaffAccount,
  usePhotographers,
  useStaffAccounts,
  useUpdateStaffAccountRole,
} from '@/hooks/useApi';
import { useSession } from '@/lib/auth';
import type { StaffAccount, StaffRole } from '@/lib/api';

const ROLE_LABELS: Record<StaffRole, string> = {
  fifi_staff: 'Photographer',
  fifi_office_admin: 'Office Admin',
  fifi_finance: 'Finance',
};
const ROLES: StaffRole[] = ['fifi_staff', 'fifi_office_admin', 'fifi_finance'];

export default function Staff() {
  const { capabilities } = useSession();
  const { data: photographers, isLoading: photographersLoading } = usePhotographers();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Label style={styles.sectionLabel}>Photographers</Label>
          {photographersLoading ? (
            <LoadingState />
          ) : !photographers || photographers.length === 0 ? (
            <EmptyState title="No photographers yet" message="Photographer accounts show up here once created." />
          ) : (
            photographers.map((p) => (
              <Card key={p.id} style={styles.row}>
                <Body>{p.label}</Body>
              </Card>
            ))
          )}
        </View>

        {capabilities?.manage_settings ? <ManageAccounts /> : null}
      </ScrollView>
    </Screen>
  );
}

function ManageAccounts() {
  const { data: accounts, isLoading } = useStaffAccounts();
  const createAccount = useCreateStaffAccount();
  const updateRole = useUpdateStaffAccountRole();
  const deleteAccount = useDeleteStaffAccount();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('fifi_staff');

  const submitNew = () => {
    if (!name.trim() || !email.trim()) return;
    createAccount.mutate(
      { name: name.trim(), email: email.trim(), role },
      { onSuccess: () => { setName(''); setEmail(''); } }
    );
  };

  return (
    <View>
      <Label style={styles.sectionLabel}>Manage accounts</Label>

      <Card style={{ gap: spacing.sm, marginBottom: spacing.md }}>
        <Label>New account</Label>
        <TextInput style={styles.input} placeholder="Name" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <View style={styles.rowGap}>
          {ROLES.map((r) => (
            <Button key={r} title={ROLE_LABELS[r]} variant={role === r ? 'primary' : 'secondary'} onPress={() => setRole(r)} />
          ))}
        </View>
        <Button title="Create account" onPress={submitNew} loading={createAccount.isPending} disabled={!name.trim() || !email.trim()} />
        {createAccount.isError ? <Body style={styles.error}>{createAccount.error.message}</Body> : null}
      </Card>

      {isLoading ? (
        <LoadingState />
      ) : !accounts || accounts.length === 0 ? (
        <EmptyState title="No staff accounts yet" />
      ) : (
        accounts.map((a) => (
          <AccountRow
            key={a.id}
            account={a}
            onChangeRole={(r) => updateRole.mutate({ id: a.id, role: r })}
            onRemove={() => deleteAccount.mutate(a.id)}
            busy={updateRole.isPending || deleteAccount.isPending}
          />
        ))
      )}
    </View>
  );
}

function AccountRow({
  account,
  onChangeRole,
  onRemove,
  busy,
}: {
  account: StaffAccount;
  onChangeRole: (role: StaffRole) => void;
  onRemove: () => void;
  busy: boolean;
}) {
  return (
    <Card style={{ gap: spacing.sm, marginBottom: spacing.sm }}>
      <View style={styles.rowBetween}>
        <View>
          <Body>{account.name}</Body>
          <Body muted>{account.email}</Body>
        </View>
      </View>
      <View style={styles.rowGap}>
        {ROLES.map((r) => (
          <Button
            key={r}
            title={ROLE_LABELS[r]}
            variant={account.role === r ? 'primary' : 'secondary'}
            onPress={() => onChangeRole(r)}
            disabled={account.role === r || busy}
          />
        ))}
      </View>
      <Button title="Remove account" variant="danger" onPress={onRemove} disabled={busy} />
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },
  sectionLabel: { marginBottom: spacing.sm },
  row: { marginBottom: spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowGap: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  error: { color: colors.danger },
});
