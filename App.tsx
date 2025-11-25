
import React, { useState, useEffect, useRef } from 'react';
import Hero from './components/Hero';
import TimelineItem from './components/TimelineItem';
import AdminPage from './pages/AdminPage';
import BottomNav from './components/BottomNav';
import EditModal from './components/EditModal';
import InfoModal from './components/InfoModal';
import UserModal from './components/UserModal';
import FileSelectorModal from './components/FileSelectorModal';
import SettingsView from './components/SettingsView';
import { DEMO_DATA, generateEmptyItinerary } from './constants';
import { ItineraryItem, DayItinerary, EventType } from './types';
import { Plus, Loader2 } from 'lucide-react';
import {
  loginAndListFiles,
  loadFromFirebase,
  saveToFirebase,
  FirebaseFile
} from './services/firebaseService';


const STORAGE_KEY = 'shikoku_travel_itinerary_v1';
const USER_KEY = 'shikoku_travel_user';
const SETTINGS_DAY_ID = 0; // Special ID for the Settings Page

// App States
type AppState = 'select_user' | 'select_file' | 'loading_file' | 'ready' | 'admin';

const App: React.FC = () => {
  // Data State
  const [itinerary, setItinerary] = useState<DayItinerary[]>(DEMO_DATA);
  const [currentDayId, setCurrentDayId] = useState<number>(1);

  // App Flow State
  const [appState, setAppState] = useState<AppState>('select_user');
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Drive State
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userFolderId, setUserFolderId] = useState<string | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [availableFiles, setAvailableFiles] = useState<FirebaseFile[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [deeplinkTarget, setDeeplinkTarget] = useState<{ user: string; fileId?: string | null } | null>(null);

  // Modal states
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<ItineraryItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Initialization ---
  useEffect(() => {
    // Check if we have a cached user
    const cachedUser = localStorage.getItem(USER_KEY);
    if (cachedUser) {
      handleUserLogin(cachedUser);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam) {
      setDeeplinkTarget({ user: userParam, fileId: params.get('file') });
      handleUserLogin(userParam);
    }
  }, []);

  const handleUserLogin = async (username: string) => {
    setDriveLoading(true);
    setAppState('select_user'); // Ensure we are on a visible screen if loading takes time
    try {
      // Fetch user folder and files via Vercel API
      const { userFolderId, files, isMock } = await loginAndListFiles(username);

      setIsOfflineMode(isMock);
      setCurrentUser(username);
      setUserFolderId(userFolderId);
      setAvailableFiles(files);
      localStorage.setItem(USER_KEY, username);

      setAppState('select_file');
    } catch (e: any) {
      console.error("Login failed", e);
      // Even if fallback fails (rare), we alert
      alert(`登入失敗: ${e.message} `);
    } finally {
      setDriveLoading(false);
    }
  };

  const handleSelectFile = async (fileId: string, fileName: string) => {
    setAppState('loading_file');
    try {
      const data = await loadFromFirebase(currentUser!, fileId);
      if (Array.isArray(data)) {
        setItinerary(data);
        setCurrentFileId(fileId);
        setCurrentFileName(fileName.replace('.json', ''));
        setAppState('ready');
      } else {
        throw new Error("Invalid file format");
      }
    } catch (e) {
      console.error("Load file error", e);
      alert("讀取檔案失敗");
      setAppState('select_file');
    }
  };

  useEffect(() => {
    if (
      !deeplinkTarget ||
      !deeplinkTarget.fileId ||
      availableFiles.length === 0 ||
      currentUser !== deeplinkTarget.user
    ) {
      return;
    }
    const target = availableFiles.find(file => file.id === deeplinkTarget.fileId);
    if (target) {
      handleSelectFile(target.id, target.name);
      setDeeplinkTarget(null);
    }
  }, [deeplinkTarget, availableFiles, currentUser]);

  const handleCreateFile = async (fileName: string, days: number, startDate: string) => {
    setDriveLoading(true);
    try {
      if (!userFolderId) throw new Error("No user folder");

      // Generate blank itinerary based on user input
      const newItinerary = generateEmptyItinerary(days, startDate);

      // Save it immediately to get an ID (Mock or Real)
      const newFileId = await saveToFirebase(currentUser!, newItinerary, fileName, null);

      setItinerary(newItinerary);
      setCurrentFileId(newFileId);
      setCurrentFileName(fileName);
      setAppState('ready');
    } catch (e) {
      console.error("Create file error", e);
      alert("建立檔案失敗");
    } finally {
      setDriveLoading(false);
    }
  };

  const handleManualSync = async () => {
    if (!currentFileId || !userFolderId || !currentFileName) {
      alert("尚未連接雲端檔案");
      return;
    }

    const loadingToast = document.createElement('div');
    loadingToast.className = "fixed top-4 left-1/2 -translate-x-1/2 bg-stone-800 text-white px-4 py-2 rounded-full text-sm z-50 animate-in fade-in";
    loadingToast.innerText = isOfflineMode ? "正在儲存至本地..." : "正在同步至 Google Drive...";
    document.body.appendChild(loadingToast);

    try {
      const newId = await saveToFirebase(currentUser!, itinerary, currentFileName, currentFileId);

      // Critical: Update the file ID if it changed (e.g. from Mock to Real Cloud ID)
      if (newId !== currentFileId) {
        console.log(`File ID updated: ${currentFileId} -> ${newId} `);
        setCurrentFileId(newId);
      }

      loadingToast.innerText = "儲存成功！";
      loadingToast.className = "fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full text-sm z-50";
    } catch (e: any) {
      console.error(e);
      loadingToast.innerText = `儲存失敗: ${e.message} `;
      loadingToast.className = "fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full text-sm z-50";
    } finally {
      setTimeout(() => document.body.removeChild(loadingToast), 2000);
    }
  };

  // --- Structure Management ---

  const handleAddDay = () => {
    setItinerary(prev => {
      const lastDay = prev[prev.length - 1];
      const nextDate = new Date(lastDay.dateStr);
      nextDate.setDate(nextDate.getDate() + 1);

      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDate.getDate()).padStart(2, '0');
      const weekDays = ["(日)", "(一)", "(二)", "(三)", "(四)", "(五)", "(六)"];

      const newDay: DayItinerary = {
        dayId: lastDay.dayId + 1,
        dateStr: `${yyyy} -${mm} -${dd} `,
        displayDate: `${nextDate.getMonth() + 1}/${nextDate.getDate()} ${weekDays[nextDate.getDay()]}`,
        region: "待定地點",
        events: []
      };
      return [...prev, newDay];
    });
    alert("已新增一天至行程最後");
  };

  const handleRemoveDay = () => {
    if (itinerary.length <= 1) {
      alert("至少需要保留一天");
      return;
    }
    if (window.confirm("確定要刪除最後一天的行程嗎？裡面的活動也會被刪除。")) {
      setItinerary(prev => prev.slice(0, -1));
    }
  };

  // --- Local Data Handlers ---

  const handleExport = () => {
    const dataStr = JSON.stringify(itinerary, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentFileName || 'travel-backup'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const parsed = JSON.parse(result);
          if (Array.isArray(parsed)) {
            if (window.confirm("這將會覆蓋您目前的行程資料，確定要刪除嗎？")) {
              setItinerary(parsed);
              alert("行程匯入成功！");
            }
          }
        } catch (error) {
          alert("無法讀取檔案");
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- CRUD Handlers ---

  const currentDay = itinerary.find(d => d.dayId === currentDayId) || itinerary[0];

  const handleAddNewItem = () => {
    setIsAddingNew(true);
    setEditingItem({
      id: `new-${Date.now()}`,
      time: "09:00",
      title: "",
      locationName: "",
      type: EventType.SIGHTSEEING,
      description: "",
      details: []
    });
  };

  const handleSaveItem = (itemToSave: ItineraryItem) => {
    setItinerary(prev => prev.map(day => {
      if (day.dayId === currentDayId) {
        const existingIndex = day.events.findIndex(e => e.id === itemToSave.id);
        let newEvents = [...day.events];

        if (existingIndex >= 0) {
          newEvents[existingIndex] = itemToSave;
        } else {
          newEvents.push(itemToSave);
        }
        newEvents.sort((a, b) => a.time.localeCompare(b.time));
        return { ...day, events: newEvents };
      }
      return day;
    }));
    setEditingItem(null);
    setIsAddingNew(false);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!window.confirm("確定要刪除這個行程嗎？")) return;
    setItinerary(prev => prev.map(day => {
      if (day.dayId === currentDayId) {
        return { ...day, events: day.events.filter(e => e.id !== itemId) };
      }
      return day;
    }));
    setEditingItem(null);
    setIsAddingNew(false);
  };

  const handleRegionChange = (newRegion: string) => {
    setItinerary(prev => prev.map(day => {
      if (day.dayId === currentDayId) {
        return { ...day, region: newRegion };
      }
      return day;
    }));
  };

  // --- Render Views ---

  if (appState === 'select_user') {
    return (
      <div className="min-h-screen bg-washi flex items-center justify-center">
        <UserModal
          onConfirm={handleUserLogin}
          isLoading={driveLoading}
        />
      </div>
    );
  }

  if (appState === 'select_file') {
    return (
      <div className="min-h-screen bg-washi flex items-center justify-center">
        <FileSelectorModal
          username={currentUser || ''}
          files={availableFiles}
          onSelect={handleSelectFile}
          onCreate={handleCreateFile}
          isLoading={driveLoading}
          onSwitchUser={() => {
            localStorage.removeItem(USER_KEY);
            setAppState('select_user');
          }}
          isOfflineMode={isOfflineMode}
        />
      </div>
    );
  }

  if (appState === 'loading_file') {
    return (
      <div className="min-h-screen bg-washi flex flex-col items-center justify-center text-shikoku-indigo">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold text-xl">讀取雲端行程中...</p>
      </div>
    );
  }

  if (appState === 'admin') {
    return <AdminPage onBack={() => setAppState('ready')} />;
  }

  return (
    <div className="min-h-screen pb-32 font-sans text-shikoku-ink bg-washi bg-fixed">
      {/* Hidden File Input for Import (Shared) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json"
        className="hidden"
      />

      {currentDayId === SETTINGS_DAY_ID ? (
        // --- Settings Page View ---
        <SettingsView
          currentUser={currentUser}
          currentFileName={currentFileName}
          onSwitchUser={() => { localStorage.removeItem(USER_KEY); setAppState('select_user'); }}
          onSwitchFile={() => { handleUserLogin(currentUser!); }}
          onSync={handleManualSync}
          onExport={handleExport}
          onImport={() => fileInputRef.current?.click()}
          isOfflineMode={isOfflineMode}
          onAddDay={handleAddDay}
          onRemoveDay={handleRemoveDay}
          totalDays={itinerary.length}
          onAdmin={() => setAppState('admin')}
        />
      ) : (
        // --- Normal Timeline View ---
        <>
          <Hero
            dayStr={currentDay.displayDate}
            region={currentDay.region}
            dateStr={currentDay.dateStr}
            isOfflineMode={isOfflineMode}
            onRegionChange={handleRegionChange}
          />

          <main className="max-w-xl mx-auto px-5 py-8 relative min-h-[50vh]">
            <div className="absolute left-[78px] top-6 bottom-6 w-[1px] bg-stone-300 border-l border-dashed border-stone-400 -z-10"></div>
            <div className="space-y-6">
              {currentDay.events.map((item, index) => (
                <TimelineItem
                  key={item.id}
                  item={item}
                  isLast={index === currentDay.events.length - 1}
                  onEdit={(i) => { setEditingItem(i); setIsAddingNew(false); }}
                  onShowDetails={setViewingItem}
                />
              ))}
              {currentDay.events.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl mx-4">
                  <p className="mb-4 text-lg">本日尚無行程</p>
                  <button onClick={handleAddNewItem} className="px-6 py-2 bg-white border border-stone-300 rounded-full text-sm hover:bg-stone-50 transition-colors shadow-sm font-medium">
                    點此新增
                  </button>
                </div>
              )}
            </div>
            {currentDay.events.length > 0 && (
              <div className="flex justify-center mt-12 mb-4">
                <button onClick={handleAddNewItem} className="group flex items-center gap-2 px-6 py-3 bg-shikoku-red text-white rounded-full shadow-lg shadow-red-900/20 hover:bg-red-700 hover:scale-105 transition-all duration-300 border-2 border-white/20">
                  <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span className="font-bold text-sm tracking-widest">新增行程</span>
                </button>
              </div>
            )}
          </main>
        </>
      )}

      {/* Global Bottom Navigation */}
      <BottomNav days={itinerary} currentDayId={currentDayId} onSelectDay={setCurrentDayId} />

      {/* Modals are global */}
      <EditModal item={editingItem} onClose={() => setEditingItem(null)} onSave={handleSaveItem} onDelete={handleDeleteItem} isNew={isAddingNew} />
      <InfoModal item={viewingItem} onClose={() => setViewingItem(null)} />
    </div>
  );
};

export default App;