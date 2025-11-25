import React from 'react';
import { User, Calendar, Cloud, Save, FileJson, RefreshCw, Plus, Minus } from 'lucide-react';

interface SettingsViewProps {
  currentUser: string | null;
  currentFileName: string | null;
  onSwitchUser: () => void;
  onSwitchFile: () => void;
  onSync: () => void;
  onExport: () => void;
  onImport: () => void;
  isOfflineMode: boolean;
  onAddDay: () => void;
  onRemoveDay: () => void;

  totalDays: number;
  onAdmin: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  currentFileName,
  onSwitchUser,
  onSwitchFile,
  onSync,
  onExport,
  onImport,
  isOfflineMode,
  onAddDay,
  onRemoveDay,
  onRemoveDay,
  totalDays,
  onAdmin
}) => {
  return (
    <div className="px-5 py-8 max-w-xl mx-auto min-h-[80vh] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-shikoku-indigo tracking-tight">設定與管理</h1>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isOfflineMode
          ? 'bg-orange-50 text-orange-600 border-orange-200'
          : 'bg-green-50 text-green-600 border-green-200'
          }`}>
          {isOfflineMode ? '本地模式' : '雲端已連線'}
        </div>
      </div>

      {/* Account Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-4 bg-stone-50/50 border-b border-stone-100">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">使用者帳戶</h2>
        </div>
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-shikoku-indigo shrink-0">
              <User size={24} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-lg text-stone-800 truncate">{currentUser || "Guest"}</p>
              <p className="text-xs text-stone-400">目前登入身份</p>
            </div>
          </div>
          <button
            onClick={onSwitchUser}
            className="shrink-0 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-bold text-stone-600 hover:bg-stone-50 hover:text-shikoku-indigo hover:border-indigo-200 transition-colors"
          >
            切換
          </button>
        </div>
      </section>

      {/* File Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-4 bg-stone-50/50 border-b border-stone-100">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">行程檔案</h2>
        </div>
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 shrink-0">
              <Calendar size={24} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-lg text-stone-800 truncate max-w-[150px]">{currentFileName || "未選擇"}</p>
              <p className="text-xs text-stone-400">目前編輯中</p>
            </div>
          </div>
          <button
            onClick={onSwitchFile}
            className="shrink-0 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-bold text-stone-600 hover:bg-stone-50 hover:text-shikoku-indigo hover:border-indigo-200 transition-colors"
          >
            更換
          </button>
        </div>

        {/* Day Management Subsection */}
        <div className="px-5 pb-5 pt-0">
          <div className="bg-stone-50 rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm font-bold text-stone-600">總天數：{totalDays} 天</span>
            <div className="flex gap-2">
              <button onClick={onRemoveDay} className="w-8 h-8 flex items-center justify-center bg-white border border-stone-200 rounded-lg text-stone-500 hover:text-red-500 hover:border-red-200 transition-colors">
                <Minus size={16} />
              </button>
              <button onClick={onAddDay} className="w-8 h-8 flex items-center justify-center bg-white border border-stone-200 rounded-lg text-stone-500 hover:text-shikoku-indigo hover:border-indigo-200 transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Actions Grid */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider px-1">資料同步與備份</h2>

        <button
          onClick={onSync}
          className="w-full bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Cloud size={20} />
          </div>
          <div className="text-left flex-1">
            <span className="block font-bold text-stone-800">手動同步至雲端</span>
            <span className="text-xs text-stone-500">立即上傳最新變更至雲端</span>
          </div>
          <RefreshCw size={18} className="text-stone-300 group-hover:text-blue-500" />
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onExport}
            className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center gap-3 hover:border-shikoku-indigo hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center">
              <Save size={20} />
            </div>
            <div className="text-center">
              <span className="block font-bold text-stone-800 text-sm">匯出備份 (JSON)</span>
              <span className="text-[10px] text-stone-400">下載到裝置</span>
            </div>
          </button>

          <button
            onClick={onImport}
            className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center gap-3 hover:border-shikoku-indigo hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center">
              <FileJson size={20} />
            </div>
            <div className="text-center">
              <span className="block font-bold text-stone-800 text-sm">匯入備份 (JSON)</span>
              <span className="text-[10px] text-stone-400">讀取舊檔案</span>
            </div>
          </button>
        </div>
      </section>

      <div className="mt-auto pt-8 pb-4 text-center space-y-4">
        <button
          onClick={onAdmin}
          className="text-xs text-stone-300 hover:text-stone-500 transition-colors uppercase tracking-widest font-bold"
        >
          JourneyX Book v1.0 • Admin
        </button>
      </div>
    </div>
  );
};

export default SettingsView;