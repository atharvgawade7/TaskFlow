import React, { useMemo } from 'react';
import { Icons } from './Icons';
import ActivityHeatmap from './ActivityHeatmap';
import { getCurrentDateInfo, getCurrentWeekDays } from '../data/sampleData';
import { getDayStatistics, calculateCompletionMetrics } from '../data/taskStore';

export default function InsightsView({ routines = [], tasks = [], meals = [], history = {} }) {
  const { dateKey: todayKey } = getCurrentDateInfo();

  // Compute overall historical statistics strictly from real recorded data
  const historicalStats = useMemo(() => {
    const historyDates = Object.keys(history);
    let totalAllActivities = 0;
    let totalCompleted = 0;
    let totalMissed = 0;
    let totalSkipped = 0;
    let daysWithActivity = 0;

    historyDates.forEach((dateKey) => {
      const dayData = history[dateKey];
      if (dayData && Array.isArray(dayData.activities) && dayData.activities.length > 0) {
        daysWithActivity++;
        dayData.activities.forEach((act) => {
          totalAllActivities++;
          if (act.status === 'completed' || act.status === 'eaten') totalCompleted++;
          else if (act.status === 'missed') totalMissed++;
          else if (act.status === 'skipped') totalSkipped++;
        });
      }
    });

    const totalEligible = totalAllActivities - totalSkipped;
    const overallRate = totalEligible > 0 ? Math.round((totalCompleted / totalEligible) * 100) : 0;

    // Today's pending count
    const todayStats = getDayStatistics(todayKey, routines, history);
    const todayPending = todayStats.pending;

    return {
      totalAllActivities,
      totalCompleted,
      totalMissed,
      totalSkipped,
      totalEligible,
      overallRate,
      daysWithActivity,
      todayPending,
    };
  }, [history, routines, todayKey]);

  // Compute 7-day weekly trend from actual week days
  const weeklyTrendData = useMemo(() => {
    const weekDays = getCurrentWeekDays();
    return weekDays.map((day) => {
      const stats = getDayStatistics(day.dateKey, routines, history);
      return {
        day: day.key,
        fullDate: day.date,
        isToday: day.isToday,
        ...stats,
      };
    });
  }, [routines, history]);

  // Compute domain consistency breakdown from real recorded data
  const domainBreakdown = useMemo(() => {
    const domainCounts = {};

    Object.values(history).forEach((day) => {
      if (Array.isArray(day?.activities)) {
        day.activities.forEach((act) => {
          const cat = act.category || 'Personal';
          if (!domainCounts[cat]) {
            domainCounts[cat] = { total: 0, completed: 0, skipped: 0 };
          }
          domainCounts[cat].total++;
          if (act.status === 'completed' || act.status === 'eaten') {
            domainCounts[cat].completed++;
          } else if (act.status === 'skipped') {
            domainCounts[cat].skipped++;
          }
        });
      }
    });

    return Object.entries(domainCounts).map(([name, data]) => {
      const eligible = data.total - data.skipped;
      const rate = eligible > 0 ? Math.round((data.completed / eligible) * 100) : 0;
      return {
        name,
        completed: data.completed,
        total: eligible,
        rate,
      };
    });
  }, [history]);

  return (
    <div className="insights-view-container">
      {/* 1. Core KPIs Strip (Streaks completely removed) */}
      <section className="insights-kpi-grid">
        {/* Historical Completion Rate */}
        <div className="kpi-card highlight-metric">
          <div className="kpi-top">
            <span className="kpi-label">Historical Adherence</span>
            <div className="kpi-icon-box purple">
              <Icons.Insights size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-huge-val">{historicalStats.overallRate}%</span>
          </div>
          <div className="kpi-subtext">
            <span>Overall completion across eligible recorded days</span>
          </div>
          <div className="kpi-chip-footer purple">
            <span>{historicalStats.daysWithActivity} days with recorded activity</span>
          </div>
        </div>

        {/* Total Completed Activities */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Completed Activities</span>
            <div className="kpi-icon-box green">
              <Icons.Check size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-huge-val">{historicalStats.totalCompleted}</span>
            <span className="kpi-sub-count">/ {historicalStats.totalEligible}</span>
          </div>
          <div className="kpi-subtext">
            <span className="green-text">{historicalStats.totalCompleted} finished</span> •{' '}
            <span className="rose-text">{historicalStats.totalMissed} missed</span>
          </div>
          <div className="kpi-chip-footer neutral">
            <span>{historicalStats.totalSkipped} skipped / excluded</span>
          </div>
        </div>

        {/* Historical Consistency Record */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Active Track Record</span>
            <div className="kpi-icon-box silver">
              <Icons.CalendarDays size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-huge-val">{historicalStats.daysWithActivity}</span>
            <span className="kpi-unit">Days</span>
          </div>
          <div className="kpi-subtext">
            <span>Days with verified activity history</span>
          </div>
          <div className="kpi-chip-footer blue">
            <span>Historical consistency focus</span>
          </div>
        </div>

        {/* Today's In-Progress Pending Guard */}
        <div className="kpi-card pending-guard-card">
          <div className="kpi-top">
            <span className="kpi-label">Today's In-Progress</span>
            <div className="kpi-icon-box blue">
              <Icons.Clock size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-huge-val">{historicalStats.todayPending}</span>
            <span className="kpi-unit">Pending</span>
          </div>
          <div className="kpi-subtext">
            <span>Awaiting scheduled time</span>
          </div>
          <div className="kpi-chip-footer blue">
            <span>Not counted as missed</span>
          </div>
        </div>
      </section>

      {/* 2. GitHub-Style Calendar Heatmap Component */}
      <section className="dashboard-panel heatmap-full-panel">
        <ActivityHeatmap routines={routines} history={history} />
      </section>

      {/* 3. 7-Day Velocity & Domain Consistency Breakdown */}
      <section className="insights-charts-grid">
        {/* 7-Day Weekly Velocity Bar Chart */}
        <div className="dashboard-panel weekly-trend-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Current 7-Day Weekly Velocity</h2>
              <p className="panel-desc">Completion percentage across this week's scheduled activities</p>
            </div>
          </div>

          <div className="trend-bars-wrapper">
            {weeklyTrendData.map((item) => (
              <div key={item.day} className={`trend-column ${item.isToday ? 'is-today-col' : ''}`}>
                <span className="trend-percentage">
                  {item.hasActivities && item.eligible > 0 ? `${item.rate}%` : '-'}
                </span>
                <div className="trend-bar-track">
                  <div
                    className={`trend-bar-fill ${item.isToday ? 'today-bar' : ''}`}
                    style={{
                      height: item.hasActivities && item.eligible > 0 ? `${Math.max(8, item.rate)}%` : '0%',
                      opacity: item.hasActivities ? 1 : 0.2,
                    }}
                    title={`${item.day} (${item.fullDate}): ${item.completed}/${item.eligible} completed`}
                  />
                </div>
                <span className="trend-day-label">{item.day}</span>
                <span className="trend-count-label">
                  {item.hasActivities ? `${item.completed}/${item.eligible}` : 'No acts'}
                </span>
                {item.isToday && <span className="today-badge-mini">TODAY</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Life Domain Breakdown */}
        <div className="dashboard-panel domain-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Adherence by Life Domain</h2>
              <p className="panel-desc">Completion rates across your defined categories</p>
            </div>
          </div>

          <div className="domain-breakdown-list">
            {domainBreakdown.length === 0 ? (
              <div className="empty-domain-notice">
                <Icons.Info size={20} className="empty-icon" />
                <p>No category records yet. Add routines and check off activities to populate domain metrics.</p>
              </div>
            ) : (
              domainBreakdown.map((dom) => (
                <div key={dom.name} className="domain-stat-item">
                  <div className="domain-stat-top">
                    <span className="domain-name">{dom.name}</span>
                    <span className="domain-rate">{dom.rate}%</span>
                  </div>
                  <div className="domain-bar-track">
                    <div
                      className="domain-bar-fill"
                      style={{ width: `${dom.rate}%` }}
                    />
                  </div>
                  <div className="domain-subtext">
                    <span>{dom.completed} of {dom.total} completed</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
