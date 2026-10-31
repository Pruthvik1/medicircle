import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

export function RequiredLabel({ text }: { text: string }) {
  return (
    <HStack space="xs" className="items-center">
      <Text className="text-sm font-medium text-secondary-foreground">{text}</Text>
      <Text className="text-sm font-medium text-destructive">*</Text>
    </HStack>
  );
}
