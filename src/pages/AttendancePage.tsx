import { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { supabaseService } from '../services/supabaseService';

export default function AttendancePage() {
  const { token } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await supabaseService.getAttendance();
        setAttendance(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, [token]);

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const totalCount = attendance.length;
  const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-rose-dark">Attendance History</h1>
        <p className="text-rose-dark/60 mt-1">Track your presence and consistency in classes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-rose-secondary shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-primary text-rose-dark rounded-2xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-rose-dark/40 uppercase">Present Days</p>
            <p className="text-2xl font-black text-rose-dark">{presentCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-rose-secondary shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-bg text-rose-dark/40 rounded-2xl flex items-center justify-center">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-rose-dark/40 uppercase">Absent Days</p>
            <p className="text-2xl font-black text-rose-dark">{totalCount - presentCount}</p>
          </div>
        </div>

        <div className="bg-rose-accent rounded-3xl p-6 text-white flex items-center gap-4 shadow-xl shadow-rose-accent/20">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-rose-primary text-xs font-bold uppercase">Attendance Rate</p>
            <p className="text-2xl font-black">{percentage}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-rose-secondary shadow-sm overflow-hidden">
        <div className="p-6 border-b border-rose-bg flex items-center justify-between">
          <h2 className="text-xl font-bold text-rose-dark">Recent Records</h2>
          <div className="flex items-center gap-2 text-xs text-rose-dark/40">
            <Info size={14} />
            <span>Records are updated by your teachers</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold text-rose-dark/40 uppercase tracking-wider bg-rose-bg/50">
                <th className="py-4 px-8">Date</th>
                <th className="py-4 px-8">Status</th>
                <th className="py-4 px-8">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-bg">
              {isLoading ? (
                <tr><td colSpan={3} className="py-12 text-center text-rose-dark/40">Loading records...</td></tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-rose-dark/40">
                    <Calendar size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No attendance records found yet.</p>
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-rose-bg/50 transition-all">
                    <td className="py-4 px-8 font-medium text-rose-dark/70">{record.date}</td>
                    <td className="py-4 px-8">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase",
                        record.status === 'present' 
                          ? "bg-rose-primary text-rose-dark" 
                          : "bg-rose-bg border border-rose-primary text-rose-dark/40"
                      )}>
                        {record.status === 'present' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 px-8 text-sm text-rose-dark/30">—</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
