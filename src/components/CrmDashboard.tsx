"use client";

import React, { useState, useMemo } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Settings, 
  Search, 
  Filter, 
  ChevronDown, 
  Menu, 
  X, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from "lucide-react";

// Mock Data representing the Google Sheets CRM
const MOCK_DATA = [
  { id: "BKG-001", date: "2026-05-30", customer: "Rahul Sharma", phone: "9876543210", service: "Plumber", location: "MP Nagar", problem: "Leaking pipe in kitchen", vendor: "Ramesh P.", vendorPhone: "9988776655", status: "NEW", amount: 0, payment: "PENDING" },
  { id: "BKG-002", date: "2026-05-29", customer: "Priya Singh", phone: "9876543211", service: "Electrician", location: "Arera Colony", problem: "AC not cooling", vendor: "Suresh E.", vendorPhone: "9988776654", status: "ASSIGNED", amount: 450, payment: "PENDING" },
  { id: "BKG-003", date: "2026-05-28", customer: "Amit Patel", phone: "9876543212", service: "Painter", location: "Kolar", problem: "Living room touchup", vendor: "Raju Painter", vendorPhone: "9988776653", status: "COMPLETED", amount: 2500, payment: "PAID" },
  { id: "BKG-004", date: "2026-05-28", customer: "Neha Gupta", phone: "9876543213", service: "Carpenter", location: "Awadhpuri", problem: "Broken door hinge", vendor: "Kishore C.", vendorPhone: "9988776652", status: "COMPLETED", amount: 800, payment: "PAID" },
  { id: "BKG-005", date: "2026-05-30", customer: "Vikas Jain", phone: "9876543214", service: "AC Repair", location: "BHEL", problem: "Gas refill required", vendor: "Unassigned", vendorPhone: "-", status: "NEW", amount: 0, payment: "PENDING" },
];

export default function CrmDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");

  // Calculations for Dashboard Cards
  const totalBookings = MOCK_DATA.length;
  const pendingJobs = MOCK_DATA.filter(job => job.status === "NEW" || job.status === "ASSIGNED").length;
  const completedJobs = MOCK_DATA.filter(job => job.status === "COMPLETED").length;
  const totalEarnings = MOCK_DATA.filter(job => job.payment === "PAID").reduce((sum, job) => sum + job.amount, 0);

  // Filter Logic
  const filteredData = useMemo(() => {
    return MOCK_DATA.filter(job => {
      const matchesSearch = job.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            job.phone.includes(searchQuery) || 
                            job.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || job.status === statusFilter;
      const matchesService = serviceFilter === "ALL" || job.service === serviceFilter;
      return matchesSearch && matchesStatus && matchesService;
    });
  }, [searchQuery, statusFilter, serviceFilter]);

  // Color helpers
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'NEW': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPaymentColor = (payment: string) => {
    return payment === 'PAID' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50';
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col border-r border-slate-800
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <span className="text-xl font-black text-white tracking-tight">Tekton<span className="text-yellow-400">CRM</span></span>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 bg-yellow-400/10 text-yellow-400 rounded-xl font-bold transition">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-900 hover:text-white rounded-xl font-medium transition">
            <Briefcase className="w-5 h-5" />
            <span>All Bookings</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-900 hover:text-white rounded-xl font-medium transition">
            <Users className="w-5 h-5" />
            <span>Vendors</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-900 hover:text-white rounded-xl font-medium transition">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </a>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border border-slate-700">
              AD
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Admin User</p>
              <p className="text-xs text-slate-500">Bhopal Hub</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center space-x-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-black text-slate-900 hidden sm:block">Overview</h1>
          </div>
          
          <div className="relative w-full max-w-md ml-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search customers, phones..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            />
          </div>
        </header>

        {/* SCROLLABLE DASHBOARD AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Bookings</h3>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Briefcase className="w-5 h-5" /></div>
              </div>
              <p className="text-3xl font-black text-slate-900">{totalBookings}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Jobs</h3>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock className="w-5 h-5" /></div>
              </div>
              <p className="text-3xl font-black text-slate-900">{pendingJobs}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Completed</h3>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
              </div>
              <p className="text-3xl font-black text-slate-900">{completedJobs}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Earnings</h3>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><IndianRupee className="w-5 h-5" /></div>
              </div>
              <p className="text-3xl font-black text-emerald-600">₹{totalEarnings}</p>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            
            {/* Table Toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-900">Recent Bookings</h2>
              
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                {/* Status Filter */}
                <div className="relative w-full sm:w-auto">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="NEW">New</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>

                {/* Service Filter */}
                <div className="relative w-full sm:w-auto">
                  <select 
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="ALL">All Services</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Painter">Painter</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="AC Repair">AC Repair</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Responsive Table Wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <th className="px-6 py-4">Booking ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Service Details</th>
                    <th className="px-6 py-4">Vendor Status</th>
                    <th className="px-6 py-4 text-center">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        No bookings found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                        
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block">{job.id}</span>
                          <span className="text-xs text-slate-500">{job.date}</span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{job.customer}</div>
                          <div className="text-xs text-slate-500">{job.phone}</div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-black rounded uppercase">
                              {job.service}
                            </span>
                            <span className="text-xs font-semibold text-slate-600">{job.location}</span>
                          </div>
                          <div className="text-xs text-slate-500 truncate max-w-[200px]" title={job.problem}>
                            {job.problem}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="mb-1.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider border ${getStatusColor(job.status)}`}>
                              {job.status}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-700">
                            {job.vendor} <span className="text-slate-400 font-normal">({job.vendorPhone})</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="font-black text-slate-900 mb-1">
                            ₹{job.amount || "-"}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPaymentColor(job.payment)}`}>
                            {job.payment}
                          </span>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
