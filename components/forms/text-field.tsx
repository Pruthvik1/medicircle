import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import type { TextInputProps } from 'react-native';
import { View } from 'react-native';

import { RequiredLabel } from '@/components/forms/required-label';
import { FormControl, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

// react-hook-form + gluestack field with the same look as the login screen:
// label, rounded input, inline error. `secure` adds the show/hide toggle.
export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  required = true,
  secure,
  ...inputProps
}: {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  secure?: boolean;
} & Pick<
  TextInputProps,
  'placeholder' | 'keyboardType' | 'autoCapitalize' | 'multiline' | 'numberOfLines' | 'maxLength'
>) {
  const [hidden, setHidden] = useState(true);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <FormControl isInvalid={!!error} style={{ marginBottom: 16 }}>
          <View style={{ marginBottom: 6 }}>
            {required ? (
              <RequiredLabel text={label} />
            ) : (
              <Text className="text-sm font-medium text-secondary-foreground">{label}</Text>
            )}
          </View>
          <Input className="rounded-xl border-border">
            <InputField
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={secure && hidden}
              autoCorrect={false}
              placeholderTextColor="rgb(102 112 133)"
              className="text-base text-foreground"
              {...inputProps}
            />
            {secure ? (
              <InputSlot
                onPress={() => setHidden((h) => !h)}
                accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
              >
                <Feather name={hidden ? 'eye-off' : 'eye'} size={16} color="rgb(102 112 133)" />
              </InputSlot>
            ) : error ? (
              <Feather name="alert-circle" size={16} color="rgb(217 45 32)" />
            ) : null}
          </Input>
          <FormControlError>
            <FormControlErrorText>{error?.message}</FormControlErrorText>
          </FormControlError>
        </FormControl>
      )}
    />
  );
}
