'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { RevenueBanner } from '@/components/RevenueBanner';
import { PipelineKanban } from '@/components/PipelineKanban';
import { LeadDrawer } from '@/components/LeadDrawer';
import { MeetingPlannerView } from '@/components/MeetingPlannerView';
import { FollowUpQueueView } from '@/components/FollowUpQueueView';
import { RevenueAnalyticsView } from '@/components/RevenueAnalyticsView';
import { NewLeadModal } from '@/components/NewLeadModal';
import { EditLeadModal } from '@/components/EditLeadModal';
import { ScheduleMeetingModal } from '@/components/ScheduleMeetingModal';
import { HermesModal } from '@/components/HermesModal';
import { SettingsModal } from '@/components/SettingsModal';
import { Lead, Stage, RevenueMetrics } from '@/types/crm';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & View states
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [activeView, setActiveView] = useState<'KANBAN' | 'FOLLOWUPS' | 'CALENDAR' | 'REVENUE'>('KANBAN');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Lead for Drawer
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Modal States
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isEditLeadOpen, setIsEditLeadOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleDefaultLead, setScheduleDefaultLead] = useState<Lead | null>(null);
  const [isHermesOpen, setIsHermesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleOpenEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsEditLeadOpen(true);
  };

  // Fetch all leads & revenue metrics
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [leadsRes, revRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/revenue'),
      ]);

      const leadsData = await leadsRes.json();
      const revData = await revRes.json();

      if (leadsData.success) {
        setLeads(leadsData.leads);
      }
      if (revData.success) {
        setMetrics(revData.metrics);
      }
    } catch (err) {
      console.error('Error loading CRM data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter leads based on selected service stream and search query
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesService =
        selectedService === 'ALL' || l.serviceType === selectedService;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        (l.company && l.company.toLowerCase().includes(q)) ||
        (l.tags && l.tags.toLowerCase().includes(q)) ||
        (l.notes && l.notes.toLowerCase().includes(q));

      return matchesService && matchesSearch;
    });
  }, [leads, selectedService, searchQuery]);

  // Today's follow-up count
  const dueTodayCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return leads.filter(
      (l) =>
        l.nextFollowUpDate &&
        l.nextFollowUpDate.startsWith(todayStr) &&
        !['COMPLETED', 'LOST'].includes(l.stage)
    ).length;
  }, [leads]);

  // Stage update handler
  const handleUpdateStage = async (leadId: string, newStage: Stage) => {
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
    );

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? data.lead : l))
        );
        // Refresh revenue metrics
        fetch('/api/revenue')
          .then((r) => r.json())
          .then((d) => d.success && setMetrics(d.metrics));
      }
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  // Lead update from drawer
  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
    if (selectedLead?.id === updatedLead.id) {
      setSelectedLead(updatedLead);
    }
    // Refresh revenue metrics
    fetch('/api/revenue')
      .then((r) => r.json())
      .then((d) => d.success && setMetrics(d.metrics));
  };

  // Delete lead
  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        setSelectedLead(null);
        // Refresh metrics
        fetch('/api/revenue')
          .then((r) => r.json())
          .then((d) => d.success && setMetrics(d.metrics));
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  // 1-Click WhatsApp Trigger from Card
  const handleOpenWhatsApp = (lead: Lead) => {
    setSelectedLead(lead);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Header */}
      <DashboardHeader
        selectedService={selectedService}
        onSelectService={setSelectedService}
        activeView={activeView}
        onSelectView={setActiveView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewLead={() => setIsNewLeadOpen(true)}
        onOpenHermes={() => setIsHermesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        dueTodayCount={dueTodayCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        {/* Metric Ribbon */}
        <RevenueBanner
          metrics={metrics}
          onViewRevenueDetails={() => setActiveView('REVENUE')}
        />

        {/* View Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-500" />
            <p className="text-xs font-medium">Loading SoloCRM workspace...</p>
          </div>
        ) : (
          <>
            {activeView === 'KANBAN' && (
              <PipelineKanban
                leads={filteredLeads}
                onSelectLead={setSelectedLead}
                onEditLead={handleOpenEditLead}
                onUpdateStage={handleUpdateStage}
                onOpenWhatsApp={handleOpenWhatsApp}
              />
            )}

            {activeView === 'FOLLOWUPS' && (
              <FollowUpQueueView
                leads={filteredLeads}
                onSelectLead={setSelectedLead}
                onUpdateLead={handleUpdateLead}
                onOpenWhatsApp={handleOpenWhatsApp}
              />
            )}

            {activeView === 'CALENDAR' && (
              <MeetingPlannerView
                leads={leads}
                onOpenScheduleModal={() => {
                  setScheduleDefaultLead(null);
                  setIsScheduleOpen(true);
                }}
              />
            )}

            {activeView === 'REVENUE' && (
              <RevenueAnalyticsView
                leads={leads}
                metrics={metrics}
                onSelectLead={setSelectedLead}
              />
            )}
          </>
        )}
      </main>

      {/* Lead Detail Drawer */}
      <LeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={handleUpdateLead}
        onDeleteLead={handleDeleteLead}
        onEditLead={handleOpenEditLead}
        onOpenScheduleMeeting={(lead) => {
          setScheduleDefaultLead(lead);
          setIsScheduleOpen(true);
        }}
      />

      {/* Modals */}
      <EditLeadModal
        isOpen={isEditLeadOpen}
        lead={editingLead}
        onClose={() => {
          setIsEditLeadOpen(false);
          setEditingLead(null);
        }}
        onLeadUpdated={handleUpdateLead}
        onDeleteLead={handleDeleteLead}
      />

      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onLeadCreated={(newLead) => {
          setLeads((prev) => [newLead, ...prev]);
          setSelectedLead(newLead);
          fetch('/api/revenue')
            .then((r) => r.json())
            .then((d) => d.success && setMetrics(d.metrics));
        }}
      />

      <ScheduleMeetingModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        leads={leads}
        defaultLead={scheduleDefaultLead}
        onMeetingScheduled={loadData}
      />

      <HermesModal
        isOpen={isHermesOpen}
        onClose={() => setIsHermesOpen(false)}
        onLeadIngested={loadData}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={loadData}
      />
    </div>
  );
}
