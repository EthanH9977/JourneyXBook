import React, { useState } from 'react';
import { FileText, Plus, Loader2, Calendar, HardDrive, Clock } from 'lucide-react';
import { FirebaseFile } from '../services/firebaseService';

interface FileSelectorModalProps {
  files: FirebaseFile[];
  username: string;
  onSelect: (fileId: string, fileName: string) => void;
  onCreate: (fileName: string, days: number, startDate: string) => void;
  isLoading: boolean;
  onSwitchUser: () => void;
  isOfflineMode: boolean;
}

const FileSelectorModal: React.FC<FileSelectorModalProps> = ({
  files,
  username,
  onSelect,
  onCreate,
  isLoading,
  onSwitchUser,
  isOfflineMode
}) => {
  const [newFileName, setNewFileName] = useState('');
  const [days, setDays] = useState(5);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      onCreate(newFileName.trim(), days, startDate);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-shikoku-paper/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-100 flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-shikoku-ink mb-1">
              歡迎回來，<span className="text-shikoku-indigo">{username}</span>
            </h2>
            <p className="text-xs text-stone-500">請選擇您的行程表</p>
          </div>
          {isOfflineMode && (
            <div className="bg-orange-100 text-orange-600 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-orange-200">
              <HardDrive size={14} />
              <span className="text-[10px] font-bold">本地模式</span>
            </div>
          )}
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-stone-400">
              <Loader2 className="animate-spin mb-2" size={24} />
              <span className="text-xs">讀取檔案中...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-10 text-stone-400">
              <FileText size={48} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">尚未建立任何行程</p>
            </div>
          ) : (
            files.map((file) => (
              <button
                key={file.id}
                onClick={() => onSelect(file.id, file.name)}
                className="w-full flex items-center p-4 bg-white border border-stone-200 rounded-xl hover:border-shikoku-indigo hover:shadow-md transition-all group text-left"
              >
                <div className="w-10 h-10 bg-indigo-50 text-shikoku-indigo rounded-full flex items-center justify-center mr-4 group-hover:bg-shikoku-indigo group-hover:text-white transition-colors">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 group-hover:text-shikoku-indigo transition-colors">
                    {file.name.replace('.json', '')}
                  </h3>
                  <p className="text-[10px] text-stone-400">點擊載入行程</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer: Create New */}
        <div className="p-4 border-t border-stone-100 bg-stone-50">
          {!isCreating ? (
            <div className="flex gap-3">
              <button
                onClick={onSwitchUser}
                className="px-4 py-3 text-stone-500 text-sm font-bold hover:text-stone-800 transition-colors"
              >
                切換使用者
              </button>
              <button
                onClick={() => setIsCreating(true)}
                className="flex-1 py-3 bg-white border-2 border-dashed border-stone-300 text-stone-500 font-bold rounded-xl hover:border-shikoku-indigo hover:text-shikoku-indigo transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                <span>建立新行程</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3 animate-in slide-in-from-bottom-2">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">新行程名稱</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="例如：東京五日遊"
                  autoFocus
                  className="w-full p-2 bg-white border border-stone-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-shikoku-indigo outline-none"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-stone-500 mb-1">天數</label>
                  <div className="relative">
                    <select
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-shikoku-indigo outline-none"
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{d} 天</option>
                      ))}
                    </select>
                    <Clock size={14} className="absolute right-2 top-2.5 text-stone-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-stone-500 mb-1">出發日期</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-shikoku-indigo outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2 text-xs text-stone-500 hover:text-stone-800 border border-stone-200 rounded-lg bg-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !newFileName.trim()}
                  className="flex-[2] py-2 bg-shikoku-indigo text-white font-bold rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-50 text-sm"
                >
                  建立
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileSelectorModal;