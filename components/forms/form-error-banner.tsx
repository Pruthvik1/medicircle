import { Feather } from '@expo/vector-icons';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

// Server/submit-level form error (e.g. "Invalid credentials") — distinct
// from a per-field validation message. Matches Figma node 424:26432
// ("00. Login / Invalid Creds"): a solid destructive-red bordered card on
// an off-white error surface, with a leading alert icon.
export function FormErrorBanner({ message }: { message: string }) {
  return (
    <Box className="w-full flex-row items-start gap-1.5 rounded-lg border border-destructive bg-error-surface p-3">
      <Feather name="alert-circle" size={16} color="rgb(217 45 32)" style={{ marginTop: 2 }} />
      <Text className="flex-1 text-sm font-medium text-destructive">{message}</Text>
    </Box>
  );
}
