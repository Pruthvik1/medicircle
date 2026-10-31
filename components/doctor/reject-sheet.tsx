import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/app/ui';
import { Text } from '@/components/ui/text';

// Rejecting needs a reason the patient will see, so the note is required.
export function RejectSheet({
  patientName,
  visible,
  submitting,
  onCancel,
  onConfirm,
}: {
  patientName: string;
  visible: boolean;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState('');
  const valid = note.trim().length >= 3;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(16,24,40,0.5)' }}
          onPress={onCancel}
          accessibilityLabel="Close"
        />
        <View className="gap-3 rounded-t-3xl bg-background p-5 pb-8">
          <Text className="text-lg font-semibold text-foreground">
            Reject {patientName}&apos;s request
          </Text>
          <Text className="text-sm text-muted-foreground">
            The patient will see this note. Suggest another time if you can.
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            autoFocus
            multiline
            maxLength={200}
            placeholder="e.g. I'm on leave that day — please book after 5 Nov."
            placeholderTextColor="#667085"
            style={{
              minHeight: 88,
              textAlignVertical: 'top',
              fontSize: 15,
              color: '#101828',
            }}
            className="rounded-xl border border-border p-3"
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <PrimaryButton variant="secondary" label="Cancel" onPress={onCancel} />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label={submitting ? 'Rejecting…' : 'Reject'}
                onPress={() => {
                  onConfirm(note.trim());
                  setNote('');
                }}
                disabled={!valid || submitting}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
