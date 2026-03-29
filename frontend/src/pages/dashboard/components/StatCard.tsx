// src/pages/dashboard/components/StatCard.tsx
interface StatCardProps {
  label: string;
  value: string;
  iconClass: string;
  iconBgClass: string;
}

export function StatCard({ label, value, iconClass, iconBgClass }: StatCardProps) {
  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full shadow-lg rounded overflow-hidden">
      <div className="px-5 py-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</p>
            <p className="text-2xl font-bold text-gray-700 truncate">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-full ${iconBgClass} flex items-center justify-center flex-shrink-0 shadow-md`}>
            <i className={`${iconClass} text-white text-lg`}></i>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded overflow-hidden shadow-lg p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2 pr-3">
          <div className="h-2.5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-7 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
      </div>
    </div>
  );
}
