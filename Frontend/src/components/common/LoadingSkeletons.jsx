import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton width={100} height={14} />
                <Skeleton width={60} height={28} className="mt-2" />
                <Skeleton width={120} height={12} className="mt-2" />
              </div>
              <Skeleton circle width={40} height={40} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
// Task List Skeleton
export function TaskListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border">
          <Skeleton circle width={24} height={24} />
          <div className="flex-1">
            <Skeleton width="70%" height={16} />
            <div className="flex gap-2 mt-2">
              <Skeleton width={60} height={20} borderRadius={999} />
              <Skeleton width={50} height={20} borderRadius={999} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Community Post Skeleton
export function CommunityPostSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <Skeleton circle width={40} height={40} />
              <div>
                <Skeleton width={120} height={14} />
                <Skeleton width={80} height={12} className="mt-1" />
              </div>
            </div>
            <Skeleton width="80%" height={18} />
            <Skeleton count={2} className="mt-2" />
            <div className="flex gap-4 mt-4 pt-4 border-t border-border">
              <Skeleton width={60} height={24} />
              <Skeleton width={80} height={24} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Roadmap Section Skeleton
export function RoadmapSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton circle width={20} height={20} />
              <Skeleton width={140} height={16} />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton width={40} height={14} />
              <Skeleton width={96} height={8} borderRadius={4} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton({ height = 300 }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton width={180} height={20} />
      </CardHeader>
      <CardContent>
        <Skeleton height={height} borderRadius={8} />
      </CardContent>
    </Card>
  );
}

// Generic Card Skeleton
export function CardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <Skeleton width="60%" height={20} />
        <Skeleton count={3} className="mt-3" />
      </CardContent>
    </Card>
  );
}

export default {
  DashboardStatsSkeleton,
  TaskListSkeleton,
  CommunityPostSkeleton,
  RoadmapSkeleton,
  ChartSkeleton,
  CardSkeleton,
};
