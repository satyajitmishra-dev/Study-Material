'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui/core';
import { 
  Calendar, 
  MapPin, 
  Mail, 
  Clock, 
  Users, 
  Trophy, 
  FileText, 
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Download,
  Check
} from 'lucide-react';
import { registerForEventAction } from '@/lib/actions/eventActions';

interface EventDetailClientProps {
  event: any;
  userId: string | null;
  isOrganizer: boolean;
}

export default function EventDetailClient({ event, userId, isOrganizer }: EventDetailClientProps) {
  const [currentEvent, setCurrentEvent] = useState(event);
  const [showRegForm, setShowRegForm] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>(event.registrations || []);

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [university, setUniversity] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [teamName, setTeamName] = useState('');
  const [memberEmailsInput, setMemberEmailsInput] = useState('');
  const [consent, setConsent] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Time remaining countdown
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(currentEvent.deadlineAt).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [currentEvent.deadlineAt]);

  const isClosed = new Date(currentEvent.deadlineAt).getTime() < Date.now();
  const isRegistered = registrations.some(r => r.userId === userId);

  // Register Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('You must be logged in to register.');
      return;
    }
    if (!consent) {
      setError('You must consent to event rules.');
      return;
    }

    setLoading(true);
    setError('');

    const teamMembers = memberEmailsInput.split(',').map(m => m.trim()).filter(Boolean);

    try {
      const res = await registerForEventAction({
        eventId: currentEvent.id,
        fullName,
        email,
        phone: phone || undefined,
        college: college || undefined,
        university: university || undefined,
        company: company || undefined,
        role: role || undefined,
        githubUrl: githubUrl || undefined,
        linkedinUrl: linkedinUrl || undefined,
        resumeUrl: resumeUrl || undefined,
        teamName: teamName || undefined,
        teamMembers,
        consent,
        slug: currentEvent.slug
      });

      if (res.success) {
        setSuccess(true);
        setRegistrations([...registrations, { userId, fullName, email }]);
        setShowRegForm(false);
      } else {
        setError(res.error || 'Failed to register.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Export CSV Action
  const handleExportCSV = () => {
    const headers = 'Full Name,Email,Phone,College,University,Team Name,GitHub,LinkedIn,Checked In\n';
    const rows = registrations.map(r => 
      `"${r.fullName}","${r.email}","${r.phone || ''}","${r.college || ''}","${r.university || ''}","${r.teamName || ''}","${r.githubUrl || ''}","${r.linkedinUrl || ''}","${r.checkedIn ? 'Yes' : 'No'}"`
    ).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentEvent.slug}_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle Check In
  const handleCheckIn = (regId: string) => {
    setRegistrations(prev => prev.map(r => {
      if (r.id === regId) {
        return { ...r, checkedIn: !r.checkedIn };
      }
      return r;
    }));
  };

  // Parsed JSON metadata
  const faqList = currentEvent.faq ? JSON.parse(currentEvent.faq) : [];
  const timeline = currentEvent.timelineJson ? JSON.parse(currentEvent.timelineJson) : [];
  const judges = currentEvent.judgesJson ? JSON.parse(currentEvent.judgesJson) : [];
  const sponsors = currentEvent.sponsorsJson ? JSON.parse(currentEvent.sponsorsJson) : [];

  return (
    <div className="space-y-8 font-sans">
      
      {/* Event Banner */}
      {currentEvent.banner && (
        <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden relative">
          <img src={currentEvent.banner} alt={currentEvent.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal to-transparent opacity-85" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-pink text-white">
                {currentEvent.eventType}
              </span>
              <h1 className="text-2xl md:text-4xl font-black text-warm-white">
                {currentEvent.title}
              </h1>
            </div>

            {/* Countdown timer */}
            <div className="bg-charcoal/80 border border-white/10 p-4 rounded-xl flex gap-3 text-center text-warm-white shrink-0 font-mono text-[11px] backdrop-blur-md">
              <div>
                <span className="block text-[15px] font-bold text-accent-pink">{timeLeft.days}</span>
                <span className="text-[9px] text-stone uppercase">Days</span>
              </div>
              <div className="border-r border-white/5 pr-3" />
              <div>
                <span className="block text-[15px] font-bold text-accent-pink">{timeLeft.hours}</span>
                <span className="text-[9px] text-stone uppercase">Hrs</span>
              </div>
              <div className="border-r border-white/5 pr-3" />
              <div>
                <span className="block text-[15px] font-bold text-accent-pink">{timeLeft.minutes}</span>
                <span className="text-[9px] text-stone uppercase">Mins</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <Card className="p-3.5 bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[12px] rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </Card>
      )}

      {success && (
        <Card className="p-4 bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[12.5px] rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Registration complete! You are verified for {currentEvent.title}.</span>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Overview */}
          <Card className="p-6 border-white/5 bg-charcoal/20 space-y-3">
            <h3 className="text-[13.5px] font-bold text-warm-white font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-3 bg-accent-pink rounded-full" /> Event Overview
            </h3>
            <p className="text-[13.5px] text-stone/90 leading-relaxed font-light font-sans">
              {currentEvent.description}
            </p>
          </Card>

          {/* Timeline */}
          {timeline.length > 0 && (
            <Card className="p-6 border-white/5 bg-charcoal/20 space-y-4">
              <h3 className="text-[13.5px] font-bold text-warm-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-stone" /> Event Agenda & Schedule
              </h3>
              <div className="space-y-4 pt-1 font-mono text-[12px]">
                {timeline.map((t: any, idx: number) => (
                  <div key={idx} className="flex gap-4 items-start relative group pl-4">
                    {idx < timeline.length - 1 && (
                      <div className="absolute left-[3px] top-4 bottom-[-16px] w-[1px] bg-white/5" />
                    )}
                    <div className="w-2 h-2 rounded-full bg-accent-pink mt-1.5 shrink-0" />
                    <div>
                      <span className="text-accent-pink font-bold block">{t.time}</span>
                      <span className="text-warm-white">{t.event}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Prizes */}
          {currentEvent.prizes && (
            <Card className="p-6 border-white/5 bg-charcoal/20 space-y-3">
              <h3 className="text-[13.5px] font-bold text-warm-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4.5 h-4.5 text-accent-amber animate-pulse" /> Prizes & Rewards
              </h3>
              <p className="text-[12.5px] text-stone whitespace-pre-line leading-relaxed font-sans pl-1">
                {currentEvent.prizes}
              </p>
            </Card>
          )}

          {/* Rules */}
          {currentEvent.rules && (
            <Card className="p-6 border-white/5 bg-charcoal/20 space-y-3">
              <h3 className="text-[13.5px] font-bold text-warm-white font-mono uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-stone" /> Rules & Conduct
              </h3>
              <p className="text-[12.5px] text-stone whitespace-pre-line leading-relaxed font-sans pl-1">
                {currentEvent.rules}
              </p>
            </Card>
          )}

          {/* FAQ */}
          {faqList.length > 0 && (
            <Card className="p-6 border-white/5 bg-charcoal/20 space-y-4">
              <h3 className="text-[13.5px] font-bold text-warm-white font-mono uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4.5 h-4.5 text-stone" /> Frequently Asked Questions
              </h3>
              <div className="space-y-4 divide-y divide-white/5">
                {faqList.map((f: any, idx: number) => (
                  <div key={idx} className={`${idx > 0 ? 'pt-4' : ''} space-y-1 font-sans`}>
                    <h4 className="text-[13px] font-bold text-warm-white">{f.q}</h4>
                    <p className="text-[12px] text-stone font-light leading-relaxed">{f.a}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Organizer Dashboard */}
          {isOrganizer && (
            <Card className="p-6 border border-white/10 bg-charcoal/40 space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-[14px] font-bold text-warm-white font-mono uppercase">
                  Organizer Control Panel
                </h3>
                <Button variant="secondary" className="text-[11px] py-1.5 px-3" onClick={handleExportCSV}>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </Button>
              </div>

              <div className="space-y-4">
                <div className="text-[12px] text-stone">
                  Registered Participants: <span className="text-warm-white font-bold">{registrations.length}</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {registrations.map((r, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-charcoal/20 border border-white/5 text-[12px]">
                      <div>
                        <span className="text-warm-white font-bold block">{r.fullName}</span>
                        <span className="text-[11px] text-stone">{r.email}</span>
                      </div>
                      <Button 
                        variant="secondary" 
                        className={`text-[10px] py-1 px-2.5 flex items-center gap-1
                          ${r.checkedIn ? 'border-accent-emerald/20 text-accent-emerald bg-accent-emerald/5' : ''}`}
                        onClick={() => handleCheckIn(r.id || i.toString())}
                      >
                        {r.checkedIn && <Check className="w-3 h-3" />}
                        <span>{r.checkedIn ? 'Checked In' : 'Check In'}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

        </div>

        {/* Right Column: Registrations / Panel details */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Register Button area */}
          {!isRegistered && !isClosed && !showRegForm && (
            <Button 
              variant="primary" 
              className="w-full justify-center text-[13px] uppercase font-bold tracking-wider py-3 shadow-premium"
              onClick={() => setShowRegForm(true)}
            >
              Register Now
            </Button>
          )}

          {isRegistered && (
            <Card className="p-4 border-accent-emerald/20 bg-accent-emerald/5 text-center text-[12px] text-accent-emerald font-semibold uppercase tracking-wider">
              ✓ Registered
            </Card>
          )}

          {isClosed && !isRegistered && (
            <Card className="p-4 border-white/5 bg-charcoal/10 text-center text-[12px] text-stone font-semibold uppercase">
              Registration Closed
            </Card>
          )}

          {/* Registration Form */}
          {showRegForm && (
            <Card className="p-5 border border-white/10 bg-charcoal/30 space-y-4">
              <h3 className="text-[13px] font-bold text-warm-white font-mono uppercase">
                Event Registration
              </h3>
              <form onSubmit={handleRegister} className="space-y-3.5 text-[12px]">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone uppercase font-bold">Full Name *</label>
                  <input 
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-charcoal/20 border border-white/5 rounded px-2.5 py-1.5 text-warm-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone uppercase font-bold">Email Address *</label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full bg-charcoal/20 border border-white/5 rounded px-2.5 py-1.5 text-warm-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone uppercase font-bold">University / College</label>
                  <input 
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Enter college"
                    className="w-full bg-charcoal/20 border border-white/5 rounded px-2.5 py-1.5 text-warm-white outline-none"
                  />
                </div>

                {currentEvent.maxTeamSize > 1 && (
                  <div className="space-y-3 border-t border-white/5 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-stone uppercase font-bold">Team Name</label>
                      <input 
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Enter team name"
                        className="w-full bg-charcoal/20 border border-white/5 rounded px-2.5 py-1.5 text-warm-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-stone uppercase font-bold">Member Emails (Comma separated)</label>
                      <input 
                        type="text"
                        value={memberEmailsInput}
                        onChange={(e) => setMemberEmailsInput(e.target.value)}
                        placeholder="mate1@gmail.com, mate2@gmail.com"
                        className="w-full bg-charcoal/20 border border-white/5 rounded px-2.5 py-1.5 text-warm-white outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 pt-2">
                  <input 
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-[11px] text-stone leading-tight">
                    I agree to the rules and conditions of this event.
                  </span>
                </div>

                <div className="flex gap-2 pt-2 justify-end">
                  <Button variant="secondary" type="button" onClick={() => setShowRegForm(false)}>Cancel</Button>
                  <Button variant="primary" type="submit" disabled={loading}>Submit</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Quick Stats sidebar widget */}
          <Card className="p-5 border-white/5 bg-charcoal/20 space-y-4 text-[12.5px] font-sans">
            <h3 className="text-[11.5px] font-bold text-stone font-mono uppercase tracking-wider">
              Event Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-stone">
                <Calendar className="w-4.5 h-4.5 text-accent-pink shrink-0" />
                <div>
                  <span className="text-warm-white block font-medium">Date</span>
                  <span className="text-[11.5px] text-stone/85">{new Date(currentEvent.startAt).toLocaleDateString()} - {new Date(currentEvent.endAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-stone">
                <MapPin className="w-4.5 h-4.5 text-accent-pink shrink-0" />
                <div>
                  <span className="text-warm-white block font-medium">Location</span>
                  <span className="text-[11.5px] text-stone/85">{currentEvent.onlineOffline === 'online' ? 'Online Virtual' : currentEvent.venue}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-stone">
                <Users className="w-4.5 h-4.5 text-accent-pink shrink-0" />
                <div>
                  <span className="text-warm-white block font-medium">Team Limit</span>
                  <span className="text-[11.5px] text-stone/85">{currentEvent.minTeamSize}-{currentEvent.maxTeamSize} Members</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-stone">
                <Mail className="w-4.5 h-4.5 text-accent-pink shrink-0" />
                <div>
                  <span className="text-warm-white block font-medium">Contact</span>
                  <span className="text-[11.5px] text-stone/85">{currentEvent.contactEmail}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Sponsors */}
          {sponsors.length > 0 && (
            <Card className="p-5 border-white/5 bg-charcoal/20 space-y-4">
              <h3 className="text-[11px] font-bold text-stone font-mono uppercase tracking-wider">
                Event Sponsors
              </h3>
              <div className="flex flex-wrap gap-3">
                {sponsors.map((sp: any, i: number) => (
                  <div key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[11px] font-mono text-warm-white">
                    {sp.name} <span className="text-[9px] text-accent-pink">({sp.tier})</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>

      </div>
    </div>
  );
}
