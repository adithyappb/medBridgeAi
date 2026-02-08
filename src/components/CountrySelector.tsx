import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COUNTRY_REGISTRY, type CountryCode } from '@/lib/countryConfig';

interface CountrySelectorProps {
  value: CountryCode;
  onChange: (value: CountryCode) => void;
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={value} onValueChange={(v) => onChange(v as CountryCode)}>
        <SelectTrigger className="w-[160px] h-8 text-sm">
          <SelectValue placeholder="Select country" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(COUNTRY_REGISTRY).map(([code, config]) => (
            <SelectItem key={code} value={code}>
              <span className="flex items-center gap-2">
                <span>{config.flag}</span>
                <span>{config.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
