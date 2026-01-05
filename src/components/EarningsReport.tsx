import React from 'react';
import { OrderItem } from '../types';
import { calculateTotalEarnings } from '../utils/profitSharing';
import { Wallet } from 'lucide-react';

interface EarningsReportProps {
  items: OrderItem[];
  totalYassirShare: number;
  totalBasimShare: number;
}

export const EarningsReport: React.FC<EarningsReportProps> = ({
  items,
  totalYassirShare,
  totalBasimShare,
}) => {
  const earnings = calculateTotalEarnings(items, totalYassirShare, totalBasimShare);

  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-medium text-white flex items-center gap-2">
        <Wallet className="h-5 w-5 text-gray-400" />
        <span>Total Earnings Report</span>
      </h3>

      <div className="bg-gradient-to-br from-[#1C1F26] to-[#13151A] rounded-xl p-6 space-y-6 border border-gray-800 shadow-lg">
        {/* Yassir's Earnings */}
        <div className="space-y-3">
          <h4 className="text-blue-400 font-medium text-lg">Yassir's Total Earnings</h4>
          <div className="grid grid-cols-2 gap-4 text-sm bg-[#0F1115] p-4 rounded-lg border border-gray-800">
            <div>
              <span className="text-gray-500 block mb-1">Profit Share</span>
              <span className="font-medium text-white text-lg">{totalYassirShare.toFixed(2)} SAR</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Products Cost</span>
              <span className="font-medium text-white text-lg">{earnings.yassirProductsCost.toFixed(2)} SAR</span>
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-gray-800/50">
            <span className="text-lg font-bold text-blue-400 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20">
              Total: {earnings.yassirTotalEarnings.toFixed(2)} SAR
            </span>
          </div>
        </div>

        {/* Basim's Earnings */}
        <div className="space-y-3 pt-4 border-t border-gray-800">
          <h4 className="text-purple-400 font-medium text-lg">Basim's Total Earnings</h4>
          <div className="grid grid-cols-2 gap-4 text-sm bg-[#0F1115] p-4 rounded-lg border border-gray-800">
            <div>
              <span className="text-gray-500 block mb-1">Profit Share</span>
              <span className="font-medium text-white text-lg">{totalBasimShare.toFixed(2)} SAR</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Products Cost</span>
              <span className="font-medium text-white text-lg">{earnings.basimProductsCost.toFixed(2)} SAR</span>
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-gray-800/50">
            <span className="text-lg font-bold text-purple-400 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/20">
              Total: {earnings.basimTotalEarnings.toFixed(2)} SAR
            </span>
          </div>
        </div>

        {/* Combined Earnings */}
        <div className="pt-6 border-t border-gray-800">
          <div className="text-xl font-bold text-white flex items-center justify-between">
            <span>Combined Total Earnings:</span>
            <span className="text-green-400">{earnings.combinedTotalEarnings.toFixed(2)} SAR</span>
          </div>
        </div>
      </div>
    </div>
  );
};