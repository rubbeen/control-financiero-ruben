import { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  tone?: 'blue' | 'green' | 'orange' | 'dark';
}

const tones = {
  blue: 'bg-primary text-white',
  green: 'bg-income text-white',
  orange: 'bg-purchase text-white',
  dark: 'bg-navy text-white'
};

export default function QuickActionButton({ label, icon: Icon, onClick, tone = 'blue' }: Props) {
  return (
    <button onClick={onClick} className={`flex min-h-20 flex-col items-center justify-center rounded-lg px-3 py-4 text-sm font-semibold shadow-sm ${tones[tone]}`}>
      <Icon className="mb-2 h-6 w-6" />
      {label}
    </button>
  );
}
