'use client';

import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ConsentCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}

export function ConsentCheckbox({
  checked,
  onCheckedChange,
  id = 'consent-checkbox',
}: ConsentCheckboxProps) {
  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/50">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(val) => onCheckedChange(val === true)}
        className="mt-0.5"
      />
      <Label htmlFor={id} className="text-sm leading-relaxed cursor-pointer">
        Я даю согласие на обработку моих персональных данных (имя, email, аватар)
        в целях аутентификации и предоставления сервиса в соответствии с{' '}
        <Link
          href="/privacy"
          target="_blank"
          className="underline hover:text-foreground font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          Политикой конфиденциальности
        </Link>
        . Я уведомлен(а) о своих правах на доступ, исправление и удаление данных,
        а также о праве отозвать согласие в любое время.
      </Label>
    </div>
  );
}
