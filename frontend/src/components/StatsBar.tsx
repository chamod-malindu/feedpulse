import { Card, CardContent } from '@/components/ui/card';
import {
  MessageSquare,   
  AlertCircle,      
  TrendingUp,       
  Tag,
  Loader2,              
} from 'lucide-react';

interface StatsBarProps {
  totalFeedback: number;
  openItems: number;
  averagePriority: number;
  topTag: string;
  isLoading?: boolean;
  hasError?: boolean;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconColor: string;
  iconBg: string;
  isLoading?: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  iconColor,
  iconBg,
  isLoading,
}: StatCardProps) {
  return (
    <Card className="bg-white border border-border shadow-sm card-hover">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">

          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: iconBg }}
          >
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {isLoading ? (
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: '#0ba5ec' }}
              />
            ) : (
              <p className="text-2xl font-bold text-foreground">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatsBar({
  totalFeedback,
  openItems,
  averagePriority,
  topTag,
  isLoading = false,
  hasError = false,
}: StatsBarProps) {

  const stats = [
    {
      icon: MessageSquare,
      label: 'Total Feedback',
      value: totalFeedback,
      iconColor: '#0ba5ec',
      iconBg: '#e8f4fd',
    },
    {
      icon: AlertCircle,
      label: 'Open Items',
      value: openItems,
      iconColor: '#f59e0b',
      iconBg: '#fef3c7',
    },
    {
      icon: TrendingUp,
      label: 'Avg Priority',
      value: `${averagePriority.toFixed(1)} / 10`,
      iconColor: '#10b981',
      iconBg: '#d1fae5',
    },
    {
      icon: Tag,
      label: 'Top Tag',
      value: topTag || 'N/A',
      iconColor: '#8b5cf6',
      iconBg: '#ede9fe',
    },
  ];

  if (hasError) {
    return (
      <div className="bg-white rounded-2xl border border-border p-5 text-center">
        <p className="text-sm text-destructive">
          Failed to load stats. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map(stat => (
        <StatCard key={stat.label} {...stat} isLoading={isLoading} />
      ))}
    </div>
  );
}