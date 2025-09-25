import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/config';
import Button from '../Components/Button';
import { ArrowLeft, CalendarDays, Clock, LayoutGrid } from 'lucide-react';

const Timetable = () => {
  const { scheduleId, departmentId } = useParams();
  const navigate = useNavigate();
  const [timetableData, setTimetableData] = useState<{ scheduleId: string; count: number; entries: any[] } | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive values from data (must be declared before any early returns)
  const entries = timetableData?.entries || [];
  const computedDays = useMemo(() => (
    entries.length ? Math.max(...entries.map((e: any) => e.day || 0)) + 1 : 5
  ), [entries]);
  const computedSlots = useMemo(() => (
    entries.length ? Math.max(...entries.map((e: any) => e.slot || 0)) + 1 : 8
  ), [entries]);
  const sections = useMemo(() => {
    const map = new Map<string, { id: string; name: string; batch?: string }>();
    for (const e of entries) {
      if (e.section) map.set(e.sectionId, { id: e.sectionId, name: e.section.name, batch: e.section.batchYearRange });
      else if (e.sectionId) map.set(e.sectionId, { id: e.sectionId, name: e.sectionId.slice(0, 6) });
    }
    return Array.from(map.values());
  }, [entries]);
  const activeEntries = useMemo(() => (
    entries.filter((e: any) => !activeSectionId || e.sectionId === activeSectionId)
  ), [entries, activeSectionId]);
  const cellMap = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const e of activeEntries) {
      const key = `${e.day}-${e.slot}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [activeEntries]);

  // Generate human-readable times for slot headers (default 9:00 start, 60m duration)
  const slotTimes = useMemo(() => {
    const times: string[] = [];
    const startHour = 9;
    const slotMinutes = 60;
    for (let i = 0; i < computedSlots; i++) {
      const start = new Date(2000, 0, 1, startHour, 0, 0);
      start.setMinutes(start.getMinutes() + i * slotMinutes);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + slotMinutes);
      const fmt = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      times.push(`${fmt(start)}–${fmt(end)}`);
    }
    return times;
  }, [computedSlots]);

  // Section color coding
  const palette = ['#6366f1', '#059669', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  const sectionColor = useMemo(() => {
    const map = new Map<string, string>();
    sections.forEach((s, idx) => {
      map.set(s.id, palette[idx % palette.length]);
    });
    return map;
  }, [sections]);

  // Detect practicals (2 consecutive slots)
  const isPractical = (e: any) => {
    const code: string = e.course?.code || '';
    const credits: number | undefined = e.course?.credits;
    return code.includes('PR') || credits === 1;
  };
  const hasNextSame = (e: any) => entries.some((x: any) => x.day === e.day && x.slot === e.slot + 1 && x.sectionId === e.sectionId && x.courseId === e.courseId);
  const continuationKeys = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) {
      if (isPractical(e) && hasNextSame(e)) {
        set.add(`${e.day}-${e.slot + 1}-${e.sectionId}-${e.courseId}`);
      }
    }
    return set;
  }, [entries]);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (scheduleId) {
        try {
          setIsLoading(true);
          setError(null);
          
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.get(`${API_URL}/v1/algo/schedule/${scheduleId}/timetable`, {
            headers: {
              'Authorization': token.replace(/['"]+/g, '')
            }
          });
          
          setTimetableData(response.data);
          // Default to all sections visible
          setActiveSectionId(null);
        } catch (error: any) {
          console.error('Error fetching timetable:', error);
          setError(error?.response?.data?.message || 'Failed to fetch timetable');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTimetable();
  }, [scheduleId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading timetable...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!timetableData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">No schedule data found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate(`/department/${departmentId}/schedules`)}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:opacity-90"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Schedules
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-indigo-600" /> Timetable
                </h1>
                <p className="text-gray-600">Visualized by days and slots</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-4 h-4" />
                <span>{computedDays} days</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{computedSlots} slots</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        {sections.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3 items-center">
            <button
              onClick={() => setActiveSectionId(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium border ${activeSectionId === null ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
            >
              All Sections
            </button>
            {sections.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: sectionColor.get(s.id) }}></span>
                <button
                  onClick={() => setActiveSectionId(s.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${activeSectionId === s.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                  Section {s.name}{s.batch ? ` • ${s.batch}` : ''}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Timetable Grid (Columns = Slots/Time, Rows = Days) */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Timetable</h2>
          <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${computedSlots + 1}, minmax(0, 1fr))` }}>
            {/* Header Row */}
            <div className="p-3 bg-gray-100 font-medium text-center text-sm rounded-lg">Day/Time</div>
            {slotTimes.map((label, idx) => (
              <div key={idx} className="p-3 bg-gray-100 font-medium text-center text-sm rounded-lg">{label}</div>
            ))}

            {/* Days as rows */}
            {Array.from({ length: computedDays }, (_, dayIndex) => (
              <React.Fragment key={dayIndex}>
                <div className="p-3 bg-gray-50 text-center text-sm font-medium rounded-lg">Day {dayIndex + 1}</div>
                {Array.from({ length: computedSlots }, (_, slotIndex) => {
                  const key = `${dayIndex}-${slotIndex}`;
                  const cellEntries = cellMap.get(key) || [];
                  return (
                    <div key={slotIndex} className="p-2 border border-gray-100 min-h-[92px] bg-white rounded-lg">
                      {cellEntries.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-gray-400">—</div>
                      ) : (
                        <div className="space-y-2">
                          {cellEntries.map((e, idx) => {
                            // Merge practicals into a single box spanning 2 slots (visual only)
                            const merge = isPractical(e) && hasNextSame(e) && !continuationKeys.has(`${e.day}-${e.slot}-${e.sectionId}-${e.courseId}`);
                            const bg = sectionColor.get(e.sectionId) || '#6366f1';
                            return (
                              <div key={idx} className="rounded-lg p-2 text-xs text-white" style={{ backgroundColor: bg }}>
                                <div className="flex items-center justify-between">
                                  <div className="font-semibold truncate">{e.course?.name || e.courseId}</div>
                                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-white/20">
                                    {isPractical(e) ? 'Practical' : 'Theory'}{merge ? ' ×2' : ''}
                                  </span>
                                </div>
                                <div className="opacity-90 truncate">{(e.roomCodes?.length || e.roomIds?.length) ? `Room: ${(e.roomCodes || e.roomIds).join(', ')}` : 'Room: —'}</div>
                                <div className="opacity-90 truncate">{(e.facultyNames?.length || e.facultyIds?.length) ? `Faculty: ${(e.facultyNames || e.facultyIds).join(', ')}` : 'Faculty: —'}</div>
                                <div className="opacity-90 truncate text-[10px]">{e.section?.fullName ? `Section ${e.section.name} • ${e.section.fullName}` : `Section ${e.section?.name || e.sectionId.slice(0,6)}`}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Schedule ID: {scheduleId}</div>
            <Button onClick={() => navigate(`/department/${departmentId}/schedules`)} className="bg-indigo-600 text-white hover:opacity-90">Back to Schedules</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;