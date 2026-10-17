import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { apiGetOrders, apiGetAllUsers, apiGetEnquiries } from '../services/api';

const AdminNotificationContext = createContext(null);

// High-end pleasant two-tone synthesized notification chime via Web Audio API
export function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    
    // Tone 1: 587.33 Hz (D5) - soft bell
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: 880 Hz (A5) - bright chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.debug('Audio chime unable to play:', err);
  }
}

export function AdminNotificationProvider({ children }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem('np_admin_sound');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('np_admin_sound', String(next));
      } catch (_) {}
      return next;
    });
  }, []);

  // Track known IDs so we can detect newly placed orders, verifications, enquiries
  const knownOrderIds = useRef(new Set());
  const knownUserIds = useRef(new Set());
  const knownEnquiryIds = useRef(new Set());
  const isInitialLoad = useRef(true);

  const fetchAllData = useCallback(async (isBackground = false) => {
    if (user?.role !== 'admin') return;

    if (!isBackground) setIsLiveSyncing(true);

    try {
      const [ordersRes, usersRes, enquiriesRes] = await Promise.allSettled([
        apiGetOrders(),
        apiGetAllUsers(),
        apiGetEnquiries()
      ]);

      const rawOrders = ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value) ? ordersRes.value : [];
      const rawUsers = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value) ? usersRes.value : [];
      const rawEnquiries = enquiriesRes.status === 'fulfilled' && Array.isArray(enquiriesRes.value) ? enquiriesRes.value : [];

      setOrders(rawOrders);
      setUsers(rawUsers.filter(u => u.role !== 'admin'));
      setEnquiries(rawEnquiries);
      setLastSyncTime(new Date());

      // If this is initial load, initialize known IDs without triggering alerts
      if (isInitialLoad.current) {
        rawOrders.forEach(o => {
          const id = String(o.orderId || o.id || o._id);
          knownOrderIds.current.add(id);
        });
        rawUsers.forEach(u => {
          const id = String(u.id || u._id);
          knownUserIds.current.add(id);
        });
        rawEnquiries.forEach(e => {
          const id = String(e.id || e._id);
          knownEnquiryIds.current.add(id);
        });
        isInitialLoad.current = false;
        return;
      }

      // Check for newly placed orders
      let newOrdersFound = [];
      rawOrders.forEach(o => {
        const id = String(o.orderId || o.id || o._id);
        if (!knownOrderIds.current.has(id)) {
          knownOrderIds.current.add(id);
          if (o.status === 'pending') {
            newOrdersFound.push(o);
          }
        }
      });

      // Check for new retailer verification requests
      let newVerificationsFound = [];
      rawUsers.forEach(u => {
        const id = String(u.id || u._id);
        if (!knownUserIds.current.has(id)) {
          knownUserIds.current.add(id);
          if (u.role !== 'admin' && (u.status === 'pending' || u.status === 'onboarding')) {
            newVerificationsFound.push(u);
          }
        }
      });

      // Check for new enquiries or medicine requests
      let newEnquiriesFound = [];
      rawEnquiries.forEach(e => {
        const id = String(e.id || e._id);
        if (!knownEnquiryIds.current.has(id)) {
          knownEnquiryIds.current.add(id);
          if (!e.status || e.status === 'pending') {
            newEnquiriesFound.push(e);
          }
        }
      });

      // Trigger notifications for new orders
      if (newOrdersFound.length > 0) {
        if (soundEnabled) playNotificationChime();
        const first = newOrdersFound[0];
        const countText = newOrdersFound.length > 1 ? ` (+${newOrdersFound.length - 1} more)` : '';
        addToast(
          `🛒 New Order Placed: Order #${first.orderId} by ${first.userName || 'Retailer'}${countText}!`,
          'success',
          7000
        );
      }

      // Trigger notifications for new verification requests
      if (newVerificationsFound.length > 0) {
        if (soundEnabled && newOrdersFound.length === 0) playNotificationChime();
        const first = newVerificationsFound[0];
        const countText = newVerificationsFound.length > 1 ? ` (+${newVerificationsFound.length - 1} more)` : '';
        addToast(
          `📋 New Retailer Verification: ${first.storeName || first.name}${countText} submitted for approval!`,
          'warning',
          7000
        );
      }

      // Trigger notifications for new enquiries or requests
      if (newEnquiriesFound.length > 0) {
        if (soundEnabled && newOrdersFound.length === 0 && newVerificationsFound.length === 0) playNotificationChime();
        const first = newEnquiriesFound[0];
        const isMed = first.type === 'medicine_request';
        const label = isMed ? `Medicine Request: ${first.medicineName || 'Medicine'}` : `Enquiry: ${first.subject || 'Message'}`;
        addToast(
          `💬 New ${label} from ${first.name}!`,
          'info',
          7000
        );
      }

    } catch (err) {
      console.error('Admin sync error:', err);
    } finally {
      setIsLiveSyncing(false);
    }
  }, [user, soundEnabled, addToast]);

  // Periodic polling every 12 seconds when logged in as admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      isInitialLoad.current = true;
      knownOrderIds.current.clear();
      knownUserIds.current.clear();
      knownEnquiryIds.current.clear();
      return;
    }

    fetchAllData(false);

    const interval = setInterval(() => {
      fetchAllData(true);
    }, 12000);

    return () => clearInterval(interval);
  }, [user, fetchAllData]);

  // Compute pending metrics
  const pendingOrders = orders.filter(o => o && o.status === 'pending');
  const pendingOrdersCount = pendingOrders.length;
  const latestOrder = pendingOrders.length > 0 ? pendingOrders[0] : null;

  const pendingVerifications = users.filter(u => u && u.role !== 'admin' && (u.status === 'pending' || u.status === 'onboarding'));
  const pendingVerificationsCount = pendingVerifications.length;
  const latestVerification = pendingVerifications.length > 0 ? pendingVerifications[0] : null;

  const pendingEnquiries = enquiries.filter(e => e && (!e.status || e.status === 'pending'));
  const pendingEnquiriesCount = pendingEnquiries.length;
  const latestEnquiry = pendingEnquiries.length > 0 ? pendingEnquiries[0] : null;

  const totalAlertsCount = pendingOrdersCount + pendingVerificationsCount + pendingEnquiriesCount;

  return (
    <AdminNotificationContext.Provider value={{
      orders,
      pendingOrders,
      pendingOrdersCount,
      latestOrder,

      users,
      pendingVerifications,
      pendingVerificationsCount,
      latestVerification,

      enquiries,
      pendingEnquiries,
      pendingEnquiriesCount,
      latestEnquiry,

      totalAlertsCount,
      isLiveSyncing,
      lastSyncTime,
      soundEnabled,
      toggleSound,
      refreshAll: () => fetchAllData(false),
      playNotificationSound: playNotificationChime
    }}>
      {children}
    </AdminNotificationContext.Provider>
  );
}

export const useAdminNotifications = () => {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    return {
      orders: [],
      pendingOrders: [],
      pendingOrdersCount: 0,
      latestOrder: null,
      users: [],
      pendingVerifications: [],
      pendingVerificationsCount: 0,
      latestVerification: null,
      enquiries: [],
      pendingEnquiries: [],
      pendingEnquiriesCount: 0,
      latestEnquiry: null,
      totalAlertsCount: 0,
      isLiveSyncing: false,
      lastSyncTime: new Date(),
      soundEnabled: true,
      toggleSound: () => {},
      refreshAll: () => {},
      playNotificationSound: () => {}
    };
  }
  return context;
};
