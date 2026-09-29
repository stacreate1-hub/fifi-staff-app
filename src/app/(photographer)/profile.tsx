import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Body, Button, Card, Heading, Label, Screen } from '@/components/ui';
import { spacing } from '@/lib/theme';
import { useSession } from '@/lib/auth';

export default function Profile() {
  const { user, signOut } = useSession();

  return (
    <Screen>
      <View style={styles.content}>
        <Heading>{user?.name}</Heading>
        <Card style={{ gap: spacing.xs }}>
          <Label>Email</Label>
          <Body>{user?.email}</Body>
          <Label style={{ marginTop: spacing.sm }}>Role</Label>
          <Body>{user?.roles.join(', ')}</Body>
        </Card>
        <Button title="Sign out" variant="secondary" onPress={() => void signOut()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: spacing.lg, gap: spacing.lg },
});
