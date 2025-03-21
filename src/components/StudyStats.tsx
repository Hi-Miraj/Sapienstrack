import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { getSessions, getSubjectById, getSubjects, getStreak, getTotalStudyTime } from '@/utils/storageUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { formatTimeHours } from '@/utils/timerUtils';
import { format } from 'date-fns';

interface StudyStatsProps {
  visible: boolean;
}

interface ChartDataItem {
  name: string;
  minutes: number;
  subject?: string;
  dateString?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const StudyStats: React.FC<StudyStatsProps> = ({ visible }) => {
  const [chartType, setChartType] = useState<'week' | 'month' | 'pie'>('week');
  const [weeklyData, setWeeklyData] = useState<ChartDataItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<ChartDataItem[]>([]);
  const [subjectData, setSubjectData] = useState<ChartDataItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (visible) {
      generateWeeklyData();
      generateMonthlyData();
      generateSubjectData();
      setTotalHours(Math.floor(getTotalStudyTime() / 60));
      setCurrentStreak(getStreak());
    }
  }, [visible]);

  const generateWeeklyData = () => {
    const sessions = getSessions();
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Initialize data with last 7 days
    const weekData: Record<string, ChartDataItem> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dayName = dayNames[date.getDay()];
      const dateString = format(date, 'MMM d, yyyy');
      weekData[dayName] = { 
        name: dayName, 
        minutes: 0,
        dateString: dateString
      };
    }
    
    // Fill in the study minutes per day
    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      // Only include sessions from the last 7 days
      if ((today.getTime() - sessionDate.getTime()) <= 7 * 24 * 60 * 60 * 1000) {
        const dayName = dayNames[sessionDate.getDay()];
        if (weekData[dayName]) {
          weekData[dayName].minutes += session.durationMinutes;
        }
      }
    });
    
    setWeeklyData(Object.values(weekData));
  };

  const generateMonthlyData = () => {
    const sessions = getSessions();
    const today = new Date();
    const monthData: ChartDataItem[] = [];
    
    // Get the last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7 + 6));
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() - (i * 7));
      
      const weekName = `Week ${4-i}`;
      const dateString = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
      let totalMinutes = 0;
      
      sessions.forEach(session => {
        const sessionDate = new Date(session.date);
        if (sessionDate >= weekStart && sessionDate <= weekEnd) {
          totalMinutes += session.durationMinutes;
        }
      });
      
      monthData.push({
        name: weekName,
        minutes: totalMinutes,
        dateString: dateString
      });
    }
    
    setMonthlyData(monthData);
  };

  const generateSubjectData = () => {
    const sessions = getSessions();
    const subjects = getSubjects();
    const subjectMinutes: Record<string, number> = {};
    
    // Initialize all subjects with 0 minutes
    subjects.forEach(subject => {
      subjectMinutes[subject.id] = 0;
    });
    
    // Calculate total minutes per subject
    sessions.forEach(session => {
      if (subjectMinutes[session.subjectId] !== undefined) {
        subjectMinutes[session.subjectId] += session.durationMinutes;
      }
    });
    
    // Create data for the pie chart
    const pieData = subjects
      .filter(subject => subjectMinutes[subject.id] > 0)
      .map(subject => ({
        name: subject.name,
        minutes: subjectMinutes[subject.id],
        subject: subject.id
      }));
    
    setSubjectData(pieData);
  };

  if (!visible) return null;

  // Color palette for the chart
  const chartConfig = {
    minutes: { 
      theme: { 
        light: "#3B82F6", 
        dark: "#3B82F6" 
      }
    }
  };

  const formatTooltip = (value: number) => {
    return formatTimeHours(value * 60);
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 
      ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`
      : `${mins}m`;
  };

  // Custom tooltip for showing dates
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-study-darker p-2 border border-white/10 rounded-md shadow-lg">
          <p className="text-white/90 font-medium">{data.dateString || label}</p>
          <p className="text-blue-400">{formatMinutes(data.minutes)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`glass-card p-4 mb-6 rounded-lg animate-fade-in transition-all duration-300 ${expanded ? 'min-h-[500px]' : 'min-h-[300px]'}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Study Statistics</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            {expanded ? 
              <ChevronUp size={18} className="text-white/70" /> : 
              <ChevronDown size={18} className="text-white/70" />
            }
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-4xl font-bold text-white">{currentStreak}</div>
          <div className="text-sm text-white/70">Day Streak</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-4xl font-bold text-white">{totalHours}</div>
          <div className="text-sm text-white/70">Total Hours</div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setChartType('week')}
          className={`px-3 py-1 rounded-md text-sm ${chartType === 'week' ? 'bg-study-blue text-white' : 'bg-white/10 text-white/70'}`}
        >
          Weekly
        </button>
        <button
          onClick={() => setChartType('month')}
          className={`px-3 py-1 rounded-md text-sm ${chartType === 'month' ? 'bg-study-blue text-white' : 'bg-white/10 text-white/70'}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setChartType('pie')}
          className={`px-3 py-1 rounded-md text-sm ${chartType === 'pie' ? 'bg-study-blue text-white' : 'bg-white/10 text-white/70'}`}
        >
          Subjects
        </button>
      </div>

      {/* Fixed height wrapper for charts that doesn't collapse */}
      <div className={`transition-all duration-300 ${expanded ? 'h-[350px]' : 'h-[200px]'} w-full overflow-visible`}>
        {chartType === 'week' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: isMobile ? 0 : 20, bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} tickFormatter={(value) => `${Math.floor(value / 60)}h`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
              <Bar dataKey="minutes" name="Study Time" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {chartType === 'month' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: isMobile ? 0 : 20, bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} tickFormatter={(value) => `${Math.floor(value / 60)}h`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
              <Bar dataKey="minutes" name="Study Time" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {chartType === 'pie' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Pie
                data={subjectData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="minutes"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {subjectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatMinutes(Number(value))}
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.8)' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default StudyStats;
