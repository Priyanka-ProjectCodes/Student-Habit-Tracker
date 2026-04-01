import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  BarChart3,
  ChevronRight,
  Loader2,
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [report, setReport] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    email: '',
    name: '',
    rollNumber: '',
    department: '',
    registerNumber: '',
    password: ''
  });

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStudents(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStudent),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewStudent({ email: '', name: '', rollNumber: '', department: '', registerNumber: '', password: '' });
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReport = async (studentId: number) => {
    try {
      const res = await fetch(`/api/admin/reports/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReport(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const markAttendance = async (userId: number, status: 'present' | 'absent') => {
    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, status, date: format(new Date(), 'yyyy-MM-dd') }),
      });
      if (res.ok) {
        // Show a nice feedback instead of alert
        console.log(`Marked ${status} for student`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rose-dark">Admin Panel</h1>
          <p className="text-rose-dark/60 mt-1">Manage students and monitor academic performance</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-rose-accent text-white rounded-2xl font-bold shadow-lg shadow-rose-accent/20 hover:bg-rose-dark transition-all"
        >
          <Plus size={20} />
          Add Student
        </button>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-dark/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md border border-rose-secondary shadow-2xl relative">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-rose-dark/40 hover:bg-rose-bg rounded-xl transition-all"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-bold text-rose-dark mb-6">Add New Student</h2>
            
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-rose-dark/40 uppercase mb-1 ml-1">Full Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 bg-rose-bg border border-rose-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-accent/20 focus:border-rose-accent transition-all"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-rose-dark/40 uppercase mb-1 ml-1">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-3 bg-rose-bg border border-rose-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-accent/20 focus:border-rose-accent transition-all"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-rose-dark/40 uppercase mb-1 ml-1">Roll Number</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-rose-bg border border-rose-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-accent/20 focus:border-rose-accent transition-all"
                    value={newStudent.rollNumber}
                    onChange={(e) => setNewStudent({...newStudent, rollNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-rose-dark/40 uppercase mb-1 ml-1">Department</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-rose-bg border border-rose-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-accent/20 focus:border-rose-accent transition-all"
                    value={newStudent.department}
                    onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-rose-dark/40 uppercase mb-1 ml-1">Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Default: student123"
                  className="w-full px-4 py-3 bg-rose-bg border border-rose-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-accent/20 focus:border-rose-accent transition-all"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                />
              </div>
              
              <button 
                type="submit"
                className="w-full py-4 bg-rose-accent text-white rounded-2xl font-bold shadow-lg shadow-rose-accent/20 hover:bg-rose-dark transition-all mt-4"
              >
                Create Student Account
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-rose-secondary shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-rose-dark">Student Directory</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-secondary" size={18} />
                <input
                  type="text"
                  placeholder="Search name or roll..."
                  className="w-full pl-10 pr-4 py-2 bg-rose-bg border border-rose-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-accent/20 focus:border-rose-accent transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-bold text-rose-dark/40 uppercase tracking-wider border-b border-rose-bg">
                    <th className="pb-4 px-4">Student</th>
                    <th className="pb-4 px-4">Roll No</th>
                    <th className="pb-4 px-4">Level</th>
                    <th className="pb-4 px-4">Attendance</th>
                    <th className="pb-4 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-bg">
                  {isLoading ? (
                    <tr><td colSpan={5} className="py-8 text-center text-rose-dark/40">Loading students...</td></tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-rose-dark/40">No students found</td></tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="group hover:bg-rose-bg/50 transition-all">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-primary text-rose-dark rounded-full flex items-center justify-center font-bold">
                              {student.name[0]}
                            </div>
                            <div>
                              <p className="font-bold text-rose-dark">{student.name}</p>
                              <p className="text-xs text-rose-dark/50">{student.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-rose-dark/70">{student.roll_number}</td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-rose-primary text-rose-dark rounded-lg text-xs font-bold">Lvl {student.level}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => markAttendance(student.id, 'present')}
                              className="p-1.5 text-rose-accent hover:bg-rose-primary rounded-lg transition-all"
                              title="Mark Present"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={() => markAttendance(student.id, 'absent')}
                              className="p-1.5 text-rose-dark/40 hover:bg-rose-bg rounded-lg transition-all"
                              title="Mark Absent"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <button 
                            onClick={() => {
                              setSelectedStudent(student);
                              fetchReport(student.id);
                            }}
                            className="p-2 text-rose-dark/30 hover:text-rose-accent hover:bg-rose-primary rounded-lg transition-all"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Report Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-rose-secondary shadow-sm min-h-[400px]">
            <h2 className="text-xl font-bold text-rose-dark mb-6">Habit Report</h2>
            {!selectedStudent ? (
              <div className="flex flex-col items-center justify-center h-64 text-center text-rose-dark/40">
                <BarChart3 size={48} className="mb-4 opacity-20" />
                <p>Select a student to view their detailed habit report</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-rose-bg rounded-2xl border border-rose-primary">
                  <p className="text-xs font-bold text-rose-accent uppercase tracking-wider mb-1">Selected Student</p>
                  <p className="font-bold text-rose-dark">{selectedStudent.name}</p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-rose-dark">Recent Activity</h3>
                  {report.length === 0 ? (
                    <p className="text-sm text-rose-dark/40 italic">No activity logged yet</p>
                  ) : (
                    report.slice(0, 5).map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-rose-bg rounded-xl">
                        <div>
                          <p className="text-sm font-bold text-rose-dark/70">{log.habit_name}</p>
                          <p className="text-[10px] text-rose-dark/40">{log.logged_date}</p>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          log.status === 'done' ? "bg-rose-primary text-rose-dark" : "bg-rose-bg border border-rose-primary text-rose-dark/40"
                        )}>
                          {log.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
