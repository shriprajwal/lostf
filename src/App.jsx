import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import ItemCard from './components/ItemCard.jsx';
import ItemModal from './components/ItemModal.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import AdminEditModal from './components/AdminEditModal.jsx';
import UserEditModal from './components/UserEditModal.jsx';
import ProfileEditModal from './components/ProfileEditModal.jsx';
import GoogleOnboardingModal from './components/GoogleOnboardingModal.jsx';
import { 
  auth, 
  supabase, 
  googleProvider,
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  db
} from './services/config.js';
import { 
  Search, 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Layers, 
  MapPin, 
  Calendar, 
  Lock, 
  User, 
  Mail, 
  ShieldCheck, 
  Compass, 
  ArrowRight, 
  TrendingUp, 
  Laptop, 
  CreditCard, 
  Key, 
  BookOpen, 
  Watch, 
  Shirt, 
  HelpCircle, 
  Grid, 
  List, 
  Filter, 
  Check, 
  X, 
  Phone, 
  MessageCircle, 
  Share2, 
  Crown, 
  ShieldAlert, 
  KeyRound,
  UserPlus,
  Pencil
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home'); // 'home', 'listings', 'report', 'dashboard', 'auth', 'admin'
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [toast, setToast] = useState(null);

  // Super Admin Role State (Stored in sessionStorage for persistence across tabs)
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => {
    return sessionStorage.getItem('lf_superadmin_auth') === 'AUTHORIZED';
  });
  const [editingItem, setEditingItem] = useState(null);

  // User edit state (for the item owner, not admin)
  const [userEditingItem, setUserEditingItem] = useState(null);
  // Profile edit modal
  const [editingProfile, setEditingProfile] = useState(false);
  // Google sign in onboarding for new students
  const [googleOnboardingUser, setGoogleOnboardingUser] = useState(null);

  // Listings Filters
  const [filterType, setFilterType] = useState('all'); // 'all', 'lost', 'found'
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'resolved'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Report Form state
  const [reportForm, setReportForm] = useState({
    title: '',
    category: 'Electronics',
    description: '',
    time: '',
    location: '',
    status: 'Lost',
    collegeid: '',
    contact: ''
  });
  const [reportImage, setReportImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Auth Form state: 'login' (Student), 'signup' (Student), or 'admin' (Head Admin)
  const [authMode, setAuthMode] = useState('login'); 
  const [adminSubMode, setAdminSubMode] = useState('login'); // 'login' or 'register' 
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authCollegeId, setAuthCollegeId] = useState('');
  const [adminSecurityKey, setAdminSecurityKey] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard filter
  const [dashboardFilter, setDashboardFilter] = useState('all'); // 'all', 'active', 'resolved'

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Auth State Listener
  useEffect(() => {
    // Check master authorization in sessionStorage immediately
    if (sessionStorage.getItem('lf_superadmin_auth') === 'AUTHORIZED') {
      setIsSuperAdmin(true);
    }

    const unsub = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        try {
          const docSnap = await getDoc(doc(db, 'users', currUser.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Check if student profile is complete (not default placeholder or empty)
            if (data.collegeId && data.collegeId !== 'CAMPUS') {
              setProfile(data);
              setReportForm(prev => ({ ...prev, collegeid: data.collegeId || '' }));
              // Only grant admin if role in database is explicitly 'admin'
              if (data.role === 'admin' || data.role === 'superadmin') {
                setIsSuperAdmin(true);
                sessionStorage.setItem('lf_superadmin_auth', 'AUTHORIZED');
              } else {
                // Regular student: revoke only if not master-cleared
                if (sessionStorage.getItem('lf_superadmin_auth') !== 'AUTHORIZED') {
                  setIsSuperAdmin(false);
                }
              }
            } else {
              // Existing record without a specific collegeId — prompt for details
              setGoogleOnboardingUser({
                uid: currUser.uid,
                email: currUser.email,
                defaultName: data.username || currUser.displayName || ''
              });
            }
          } else {
            // New user without Firestore document yet — prompt for Student Name and College ID
            setGoogleOnboardingUser({
              uid: currUser.uid,
              email: currUser.email,
              defaultName: currUser.displayName || ''
            });
          }
        } catch (e) {
          console.error('Error fetching user profile:', e);
        }
      } else {
        setProfile(null);
        setGoogleOnboardingUser(null);
        if (sessionStorage.getItem('lf_superadmin_auth') !== 'AUTHORIZED') {
          setIsSuperAdmin(false);
        }
      }
    });
    return () => unsub();
  }, []);

  // Fetch Reports from Supabase
  const loadReports = async () => {
    setLoading(true);
    try {
      const [lostRes, foundRes] = await Promise.all([
        supabase.from('lost_reports').select('*').order('createdAt', { ascending: false }),
        supabase.from('found_reports').select('*').order('createdAt', { ascending: false })
      ]);

      const lostItems = (lostRes.data || []).map(item => ({
        ...item,
        reportType: 'Lost',
        tableSource: 'lost_reports'
      }));

      const foundItems = (foundRes.data || []).map(item => ({
        ...item,
        reportType: 'Found',
        tableSource: 'found_reports'
      }));

      const combined = [...lostItems, ...foundItems].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      setReports(combined);
    } catch (err) {
      console.error(err);
      showToast('Error loading reports: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Dedicated Admin Login Handler
  const handleAdminSignIn = async (e) => {
    e.preventDefault();
    setAuthLoading(true);

    const enteredEmail = authEmail.trim();
    const enteredPass = authPassword.trim();

    // 1. Master Key Direct Authentication: If password or email is 'monarch'
    if (
      enteredPass.toLowerCase() === 'monarch' ||
      enteredEmail.toLowerCase() === 'monarch' ||
      adminSecurityKey.trim().toLowerCase() === 'monarch'
    ) {
      setIsSuperAdmin(true);
      sessionStorage.setItem('lf_superadmin_auth', 'AUTHORIZED');
      showToast('👑 Master Super Admin clearance granted. Welcome, Monarch!', 'success', 5000);
      setCurrentTab('admin');
      setAuthLoading(false);
      setAuthEmail('');
      setAuthPassword('');
      setAdminSecurityKey('');
      return;
    }

    // 2. Database validation against Firebase Auth
    if (!enteredEmail || !enteredPass) {
      showToast('Please enter both admin email and password or master authorization key.', 'error');
      setAuthLoading(false);
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, enteredEmail, enteredPass);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      
      if (userDoc.exists() && (userDoc.data().role === 'admin' || userDoc.data().role === 'superadmin')) {
        setIsSuperAdmin(true);
        sessionStorage.setItem('lf_superadmin_auth', 'AUTHORIZED');
        showToast(`👑 Administrator clearance verified. Welcome back, ${userDoc.data().username || 'Administrator'}!`, 'success', 5000);
        setCurrentTab('admin');
        setAuthEmail('');
        setAuthPassword('');
        setAdminSecurityKey('');
      } else {
        await signOut(auth);
        setIsSuperAdmin(false);
        sessionStorage.removeItem('lf_superadmin_auth');
        showToast('❌ Access Denied: This account is not an authorized administrator.', 'error', 5000);
      }
    } catch (err) {
      const msg = err.message?.includes('invalid-credential') || err.message?.includes('user-not-found')
        ? 'Invalid administrator credentials. If you are the head authority, enter master key monarch.'
        : err.message?.replace('Firebase: ', '');
      showToast('❌ ' + msg, 'error', 5000);
    } finally {
      setAuthLoading(false);
    }
  };

  // Dedicated Admin Register Handler
  const handleAdminRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);

    const enteredKey = adminSecurityKey.trim();

    if (enteredKey.toLowerCase() !== 'monarch') {
      showToast('❌ Invalid Master Security Key! Registration denied.', 'error', 5000);
      setAuthLoading(false);
      return;
    }

    if (!authEmail || !authPassword || authPassword.length < 6) {
      showToast('Please enter a valid email and password (minimum 6 characters).', 'error');
      setAuthLoading(false);
      return;
    }

    try {
      let uid = null;
      let userObj = null;
      try {
        const cred = await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        uid = cred.user.uid;
        userObj = cred.user;
      } catch (createErr) {
        if (createErr.code === 'auth/email-already-in-use') {
          // If already registered earlier, sign in and upgrade to admin role
          const cred = await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
          uid = cred.user.uid;
          userObj = cred.user;
        } else {
          throw createErr;
        }
      }

      // Save permanently in Firestore with role: 'admin'
      const adminProfile = {
        uid: uid,
        email: authEmail.trim(),
        username: authUsername.trim() || 'Head Administrator',
        collegeId: 'HEAD_ADMIN',
        role: 'admin', // PERMANENT SUPER ADMIN PRIVILEGES
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', uid), adminProfile, { merge: true });

      // Immediate session clearance & profile sync
      sessionStorage.setItem('lf_superadmin_auth', 'AUTHORIZED');
      setIsSuperAdmin(true);
      setProfile(adminProfile);
      if (userObj) setUser(userObj);

      showToast('👑 Super Admin account successfully registered! Welcome to Admin Console.', 'success', 5000);
      setAuthEmail('');
      setAuthPassword('');
      setAuthUsername('');
      setAdminSecurityKey('');

      // Navigate directly to Admin Console
      setCurrentTab('admin');
    } catch (err) {
      showToast('Registration error: ' + (err.message?.replace('Firebase: ', '') || err.message), 'error', 5000);
    } finally {
      setAuthLoading(false);
    }
  };

  // Super Admin Edit Handler
  const handleAdminSave = async (originalItem, updatedData) => {
    if (!isSuperAdmin) {
      showToast('Action forbidden: Super Admin rights required.', 'error');
      return;
    }

    try {
      const isResolved = updatedData.status === 'Resolved' || updatedData.is_resolved;
      const { error } = await supabase
        .from(originalItem.tableSource)
        .update({
          title: updatedData.title.trim(),
          category: updatedData.category,
          description: updatedData.description.trim(),
          location: updatedData.location.trim(),
          contact: updatedData.contact.trim(),
          collegeid: updatedData.collegeid.trim(),
          status: updatedData.status,
          is_resolved: isResolved
        })
        .eq('id', originalItem.id);

      if (error) throw error;

      showToast('Report updated successfully by Super Admin! 👑', 'success');
      setEditingItem(null);
      loadReports();
    } catch (err) {
      showToast('Super Admin update error: ' + err.message, 'error');
      throw err;
    }
  };

  // Super Admin Delete Handler (any report)
  const handleAdminDelete = async (item) => {
    if (!isSuperAdmin && (!user || item.user_id !== user.uid)) {
      showToast('Action forbidden: You cannot delete reports created by others.', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete "${item.title || 'this item'}" from the campus registry?`)) return;

    try {
      const { error } = await supabase
        .from(item.tableSource)
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      showToast(`Listing "${item.title}" permanently deleted.`, 'success');
      if (selectedItem?.id === item.id) setSelectedItem(null);
      loadReports();
    } catch (err) {
      showToast('Delete error: ' + err.message, 'error');
    }
  };

  // Toggle Resolved status
  const handleToggleResolve = async (item) => {
    const isOwner = user && item.user_id === user.uid;
    if (!isSuperAdmin && !isOwner) {
      showToast('Permission denied: Only the author or Super Admin can resolve this item.', 'error');
      return;
    }

    const newResolved = !(item.is_resolved === true || item.status === 'Resolved');
    const newStatusText = newResolved ? 'Resolved' : item.reportType;

    try {
      const { error } = await supabase
        .from(item.tableSource)
        .update({
          is_resolved: newResolved,
          status: newStatusText
        })
        .eq('id', item.id);

      if (error) throw error;

      showToast(newResolved ? 'Item marked as Resolved! 🎉' : 'Item marked as active', 'success');
      loadReports();
      if (selectedItem && selectedItem.id === item.id) {
        setSelectedItem({ ...selectedItem, is_resolved: newResolved, status: newStatusText });
      }
    } catch (err) {
      showToast('Error updating status: ' + err.message, 'error');
    }
  };

  // User (owner) edit their own report
  const handleUserEditReport = async (originalItem, updatedData) => {
    if (!user || (originalItem.user_id !== user.uid && originalItem.user_email !== user.email)) {
      showToast('You can only edit your own reports.', 'error');
      return;
    }
    try {
      const isResolved = updatedData.status === 'Resolved' || updatedData.is_resolved;
      const { error } = await supabase
        .from(originalItem.tableSource)
        .update({
          title: updatedData.title.trim(),
          category: updatedData.category,
          description: updatedData.description.trim(),
          location: updatedData.location.trim(),
          contact: updatedData.contact.trim(),
          collegeid: updatedData.collegeid.trim(),
          status: updatedData.status,
          is_resolved: isResolved
        })
        .eq('id', originalItem.id);

      if (error) throw error;

      showToast('Your report has been updated! ✅', 'success');
      setUserEditingItem(null);
      loadReports();
    } catch (err) {
      showToast('Update error: ' + err.message, 'error');
      throw err;
    }
  };

  // User (owner) delete their own report
  const handleUserDeleteReport = async (item) => {
    if (!user || (item.user_id !== user.uid && item.user_email !== user.email)) {
      showToast('You can only delete your own reports.', 'error');
      return;
    }
    if (!confirm(`Delete "${item.title || 'this report'}"? This action cannot be undone.`)) return;
    try {
      const { error } = await supabase
        .from(item.tableSource)
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      showToast(`Report "${item.title}" deleted.`, 'success');
      if (selectedItem?.id === item.id) setSelectedItem(null);
      loadReports();
    } catch (err) {
      showToast('Delete error: ' + err.message, 'error');
    }
  };

  // Helper to verify College ID uniqueness across Firestore
  const checkCollegeIdExists = async (collegeId, currentUid = null) => {
    if (!collegeId) return { exists: false };
    const cleanId = collegeId.trim().toUpperCase();
    if (cleanId.toLowerCase() === 'monarch' || cleanId === 'HEAD_ADMIN') {
      return { exists: false };
    }

    try {
      // 1. Direct check on dedicated college_ids unique mapping collection
      const idDoc = await getDoc(doc(db, 'college_ids', cleanId));
      if (idDoc.exists()) {
        const idData = idDoc.data();
        if (!currentUid || idData.uid !== currentUid) {
          return { exists: true, source: 'college_ids' };
        }
      }

      // 2. Also check users collection as backup
      try {
        const qUpper = query(collection(db, 'users'), where('collegeId', '==', cleanId));
        const snapUpper = await getDocs(qUpper);
        for (const d of snapUpper.docs) {
          if (!currentUid || d.id !== currentUid) {
            return { exists: true, source: 'users' };
          }
        }
      } catch (queryErr) {
        // Query might be blocked if user is not authenticated; college_ids check is primary
      }

      return { exists: false };
    } catch (err) {
      console.error('Error checking College ID uniqueness:', err);
      if (err.code === 'permission-denied') {
        return { exists: false, permissionDenied: true };
      }
      return { exists: false };
    }
  };

  // User update their own Firestore profile
  const handleProfileUpdate = async ({ username, collegeId }) => {
    if (!user) return;
    const cleanId = collegeId ? collegeId.trim().toUpperCase() : '';
    const oldId = profile?.collegeId ? profile.collegeId.trim().toUpperCase() : '';

    if (cleanId && cleanId !== oldId) {
      const checkResult = await checkCollegeIdExists(cleanId, user.uid);
      if (checkResult.exists) {
        throw new Error(`College ID "${cleanId}" is already registered to another account.`);
      }
      if (checkResult.permissionDenied) {
        throw new Error('Firestore permission denied. Update Security Rules in Firebase Console.');
      }
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), { username, collegeId: cleanId });

      if (cleanId && cleanId !== oldId) {
        // Claim new college_ids record
        await setDoc(doc(db, 'college_ids', cleanId), {
          uid: user.uid,
          email: user.email || '',
          collegeId: cleanId,
          updatedAt: new Date().toISOString()
        });

        // Clean up old college_ids record
        if (oldId && oldId !== 'CAMPUS' && oldId !== 'HEAD_ADMIN') {
          try {
            await deleteDoc(doc(db, 'college_ids', oldId));
          } catch (_) {}
        }
      }

      setProfile(prev => ({ ...prev, username, collegeId: cleanId }));
      setReportForm(prev => ({ ...prev, collegeid: cleanId }));
      showToast('Profile updated successfully! 🎉', 'success');
    } catch (err) {
      showToast('Profile update error: ' + err.message, 'error');
      throw err;
    }
  };

  // Submit Report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!user && !isSuperAdmin) {
      showToast('Please sign in before submitting a report.', 'error');
      setCurrentTab('auth');
      return;
    }

    if (reportForm.contact.length !== 10) {
      showToast('Phone number must be exactly 10 digits.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = null;
      if (reportImage) {
        const ext = reportImage.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, reportImage);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const reporterName = isSuperAdmin && !user 
        ? 'Super Admin (Head Desk)' 
        : (profile?.username || user?.displayName || user?.email?.split('@')[0] || 'Campus Member');

      const payload = {
        ...reportForm,
        image_url: imageUrl,
        user_id: user?.uid || 'admin-user',
        user_email: user?.email || '',
        reporter_name: reporterName,
        is_resolved: false,
        createdAt: new Date().toISOString()
      };

      const tableName = reportForm.status === 'Found' ? 'found_reports' : 'lost_reports';
      const { error } = await supabase.from(tableName).insert([payload]);
      if (error) throw error;

      showToast(isSuperAdmin ? 'Official report posted by Super Admin! 👑' : 'Report submitted successfully! 🎉', 'success');
      setReportForm({
        title: '',
        category: 'Electronics',
        description: '',
        time: '',
        location: '',
        status: 'Lost',
        collegeid: profile?.collegeId || (isSuperAdmin ? 'ADMIN' : ''),
        contact: ''
      });
      setReportImage(null);
      setImagePreview(null);
      loadReports();
      setCurrentTab(isSuperAdmin ? 'admin' : 'listings');

    } catch (err) {
      showToast('Submission error: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Regular Student Auth Handlers
  const handleStudentAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const cleanCollegeId = authCollegeId.trim().toUpperCase();
        const isMaster = cleanCollegeId.toLowerCase() === 'monarch' || authPassword.trim().toLowerCase() === 'monarch';

        if (!cleanCollegeId && !isMaster) {
          showToast('Please enter your College ID.', 'error');
          setAuthLoading(false);
          return;
        }

        // Enforce Unique College ID across students
        if (!isMaster) {
          const checkResult = await checkCollegeIdExists(cleanCollegeId);
          if (checkResult.exists) {
            showToast(`❌ College ID "${cleanCollegeId}" is already registered. Each student must have a unique College ID.`, 'error', 6000);
            setAuthLoading(false);
            return;
          }
          if (checkResult.permissionDenied) {
            showToast(`⚠️ Firestore permission error: Update Firestore Rules in Firebase Console to allow checking College IDs.`, 'error', 6000);
            setAuthLoading(false);
            return;
          }
        }

        let cred = null;
        try {
          cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        } catch (createErr) {
          if (createErr.code === 'auth/email-already-in-use') {
            cred = await signInWithEmailAndPassword(auth, authEmail, authPassword);
          } else {
            throw createErr;
          }
        }

        const role = isMaster ? 'admin' : 'user';
        const userProf = {
          uid: cred.user.uid,
          email: authEmail,
          username: authUsername,
          collegeId: isMaster ? 'HEAD_ADMIN' : cleanCollegeId,
          role: role,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', cred.user.uid), userProf, { merge: true });

        // Claim the unique college_ids mapping document
        if (!isMaster) {
          try {
            await setDoc(doc(db, 'college_ids', cleanCollegeId), {
              uid: cred.user.uid,
              email: authEmail,
              collegeId: cleanCollegeId,
              createdAt: new Date().toISOString()
            });
          } catch (cErr) {
            console.error('Error reserving college_ids:', cErr);
          }
        }

        if (isMaster) {
          setIsSuperAdmin(true);
          sessionStorage.setItem('lf_superadmin_auth', 'AUTHORIZED');
          setProfile(userProf);
          showToast('👑 Super Admin account successfully registered! Welcome to Admin Console.', 'success');
          setCurrentTab('admin');
          return;
        } else {
          setIsSuperAdmin(false);
          sessionStorage.removeItem('lf_superadmin_auth');
          showToast('Student account created successfully! Welcome 🎉', 'success');
          setCurrentTab('home');
          return;
        }
      } else {
        const cred = await signInWithEmailAndPassword(auth, authEmail, authPassword);
        const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        if (userDoc.exists() && (userDoc.data().role === 'admin' || userDoc.data().role === 'superadmin')) {
          setIsSuperAdmin(true);
          sessionStorage.setItem('lf_superadmin_auth', 'AUTHORIZED');
          showToast('👑 Administrator authenticated.', 'success');
          setCurrentTab('admin');
          return;
        } else {
          setIsSuperAdmin(false);
          sessionStorage.removeItem('lf_superadmin_auth');
          showToast('Welcome back, Student! 🎉', 'success');
          setCurrentTab('home');
          return;
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', res.user.uid));
      
      // If user does not exist or has empty/default collegeId, show onboarding modal
      if (!userDoc.exists() || !userDoc.data().collegeId || userDoc.data().collegeId === 'CAMPUS') {
        setGoogleOnboardingUser({
          uid: res.user.uid,
          email: res.user.email,
          defaultName: (userDoc.exists() && userDoc.data().username) || res.user.displayName || ''
        });
      } else {
        const data = userDoc.data();
        setProfile(data);
        if (data.role === 'admin' || data.role === 'superadmin') {
          setIsSuperAdmin(true);
          sessionStorage.setItem('lf_superadmin_auth', 'AUTHORIZED');
        } else {
          setIsSuperAdmin(false);
          sessionStorage.removeItem('lf_superadmin_auth');
        }
        showToast(`Welcome back, ${data.username || 'Student'}! 🎉`, 'success');
        setCurrentTab('home');
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        showToast(err.message?.replace('Firebase: ', '') || err.message, 'error');
      }
    }
  };

  // Complete Google Registration with Student Name & College ID
  const handleCompleteGoogleOnboarding = async ({ username, collegeId }) => {
    if (!googleOnboardingUser) return;
    const cleanCollegeId = collegeId.trim().toUpperCase();
    const isMaster = cleanCollegeId.toLowerCase() === 'monarch';

    // Enforce Unique College ID for Google onboarding students
    if (!isMaster) {
      const checkResult = await checkCollegeIdExists(cleanCollegeId, googleOnboardingUser.uid);
      if (checkResult.exists) {
        const errorMsg = `College ID "${cleanCollegeId}" is already registered by another student.`;
        showToast(`❌ ${errorMsg}`, 'error', 6000);
        throw new Error(errorMsg);
      }
      if (checkResult.permissionDenied) {
        const errorMsg = `Firestore permission error: Update Firestore Rules in Firebase Console.`;
        showToast(`⚠️ ${errorMsg}`, 'error', 6000);
        throw new Error(errorMsg);
      }
    }

    try {
      const newProfile = {
        uid: googleOnboardingUser.uid,
        email: googleOnboardingUser.email,
        username: username.trim(),
        collegeId: isMaster ? 'HEAD_ADMIN' : cleanCollegeId,
        role: isMaster ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', googleOnboardingUser.uid), newProfile, { merge: true });

      // Claim the unique college_ids mapping document
      if (!isMaster) {
        try {
          await setDoc(doc(db, 'college_ids', cleanCollegeId), {
            uid: googleOnboardingUser.uid,
            email: googleOnboardingUser.email,
            collegeId: cleanCollegeId,
            createdAt: new Date().toISOString()
          });
        } catch (cErr) {
          console.error('Error reserving college_ids:', cErr);
        }
      }

      setProfile(newProfile);
      setReportForm(prev => ({ ...prev, collegeid: newProfile.collegeId }));
      
      if (isMaster) {
        setIsSuperAdmin(true);
        sessionStorage.setItem('lf_superadmin_auth', 'AUTHORIZED');
        showToast('👑 Super Admin account activated! Welcome to Admin Console.', 'success');
        setCurrentTab('admin');
      } else {
        setIsSuperAdmin(false);
        sessionStorage.removeItem('lf_superadmin_auth');
        showToast(`Welcome to Lostfusion, ${username}! 🎉 Profile verified.`, 'success');
        setCurrentTab('home');
      }
      setGoogleOnboardingUser(null);
    } catch (err) {
      if (!err.message?.includes('already registered')) {
        showToast('Registration error: ' + err.message, 'error');
      }
      throw err;
    }
  };

  const handleCancelGoogleOnboarding = async () => {
    await signOut(auth);
    setGoogleOnboardingUser(null);
    setUser(null);
    setProfile(null);
    setIsSuperAdmin(false);
    sessionStorage.removeItem('lf_superadmin_auth');
    showToast('Registration cancelled.', 'info');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsSuperAdmin(false);
    sessionStorage.removeItem('lf_superadmin_auth');
    showToast('Signed out successfully.', 'info');
    setCurrentTab('home');
  };

  // Filtered reports for listings
  const filteredReports = reports.filter(item => {
    if (filterType !== 'all') {
      const type = (item.reportType || item.status || '').toLowerCase();
      if (filterType === 'lost' && type !== 'lost') return false;
      if (filterType === 'found' && type !== 'found') return false;
    }
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    const isResolved = item.is_resolved === true || item.status === 'Resolved';
    if (filterStatus === 'active' && isResolved) return false;
    if (filterStatus === 'resolved' && !isResolved) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = (item.title || '').toLowerCase().includes(q) ||
                    (item.description || '').toLowerCase().includes(q) ||
                    (item.location || '').toLowerCase().includes(q) ||
                    (item.category || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Categories list with icons
  const categories = [
    { id: 'all', label: 'All', icon: <Layers size={13} /> },
    { id: 'Electronics', label: 'Electronics', icon: <Laptop size={13} /> },
    { id: 'Documents', label: 'IDs & Cards', icon: <CreditCard size={13} /> },
    { id: 'Keys', label: 'Keys', icon: <Key size={13} /> },
    { id: 'Books', label: 'Books', icon: <BookOpen size={13} /> },
    { id: 'Accessories', label: 'Accessories', icon: <Watch size={13} /> },
    { id: 'Clothing', label: 'Clothing', icon: <Shirt size={13} /> },
    { id: 'Other', label: 'Other', icon: <HelpCircle size={13} /> }
  ];

  // Quick Campus Locations
  const campusLocations = [
    'Central Library', 
    'Cafeteria / Food Court', 
    'Computer Lab 3', 
    'Main Auditorium', 
    'Sports Complex', 
    'Block A Lecture Halls', 
    'Student Parking Area'
  ];

  // User Reports in Dashboard
  const userReports = reports.filter(r => (user && r.user_id === user.uid) || (user && r.user_email === user.email));
  const userReportsFiltered = userReports.filter(r => {
    const isRes = r.is_resolved === true || r.status === 'Resolved';
    if (dashboardFilter === 'active') return !isRes;
    if (dashboardFilter === 'resolved') return isRes;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 selection:bg-blue-600 selection:text-white relative">
      
      {/* Ambient Glows */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Floating Animated Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-500/20' 
            : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-500/20' 
              : 'bg-slate-900/90 border-blue-500/40 text-blue-200 shadow-blue-500/20'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Modern Frosted Navbar - Strict Role Visibility */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        user={user} 
        profile={profile}
        isSuperAdmin={isSuperAdmin || sessionStorage.getItem('lf_superadmin_auth') === 'AUTHORIZED'}
        onLogout={handleLogout} 
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 relative z-10">
        
        {/* ========================================================
            👑 SUPER ADMIN CONSOLE TAB (Protected)
            ======================================================== */}
        {currentTab === 'admin' && (
          (isSuperAdmin || sessionStorage.getItem('lf_superadmin_auth') === 'AUTHORIZED') ? (
            <AdminPanel 
              reports={reports}
              onRefresh={loadReports}
              onEdit={(it) => setEditingItem(it)}
              onDelete={handleAdminDelete}
              onToggleResolve={handleToggleResolve}
              onAddNew={() => setCurrentTab('report')}
              onShowToast={showToast}
            />
          ) : (
            /* 403 Forbidden Access Screen for non-admins */
            <div className="max-w-lg mx-auto py-16 text-center space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-xl shadow-rose-500/10">
                <ShieldAlert size={36} />
              </div>
              <h2 className="font-heading text-3xl font-black text-white">403 Forbidden</h2>
              <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Super Admin clearance is strictly required to view this console. Other users cannot access management controls.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button 
                  onClick={() => setCurrentTab('home')}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition"
                >
                  Return to Home
                </button>
                <button 
                  onClick={() => { setAuthMode('admin'); setCurrentTab('auth'); }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Crown size={14} /> Administrator Login
                </button>
              </div>
            </div>
          )
        )}

        {/* ========================================================
            🌟 HOME VIEW
            ======================================================== */}
        {currentTab === 'home' && (
          <div className="space-y-16 py-4 sm:py-8">
            
            {/* Hero Section */}
            <section className="text-center max-w-4xl mx-auto space-y-6">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold tracking-wide backdrop-blur-md shadow-inner">
                {isSuperAdmin ? <Crown size={14} className="text-amber-400" /> : <Sparkles size={14} className="text-blue-400" />}
                <span>{isSuperAdmin ? 'Super Admin Mode Active (Head Authority)' : 'Next-Gen Campus Lost & Found System'}</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08]">
                Misplaced Something? <br />
                <span className="text-accent-gradient">
                  Reunited in Minutes.
                </span>
              </h1>

              <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Lostfusion connects students and faculty across campus to quickly report, locate, and safely reclaim lost belongings with verified student IDs.
              </p>

              {/* Instant Hero Search Box */}
              <div className="max-w-xl mx-auto pt-2">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setCurrentTab('listings');
                  }}
                  className="relative p-1.5 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl flex items-center shadow-2xl focus-within:border-blue-500/60 focus-within:shadow-[0_0_25px_rgba(59,130,246,0.25)] transition duration-300"
                >
                  <Search size={18} className="text-slate-400 ml-3 flex-shrink-0" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by item name, location, or brand (e.g. AirPods, ID card, Keys)..."
                    className="w-full px-3 py-2.5 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
                  />
                  <button 
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition flex items-center gap-1.5 flex-shrink-0"
                  >
                    <span>Search</span>
                    <ArrowRight size={13} />
                  </button>
                </form>

                {/* Quick Category Chips below Hero Search */}
                <div className="flex items-center justify-center gap-2 mt-3 flex-wrap text-xs text-slate-400">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Popular:</span>
                  {['Electronics', 'Documents', 'Keys', 'Wallets & Bags'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setFilterCategory(cat);
                        setCurrentTab('listings');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 text-[11px] transition"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 pt-3 flex-wrap">
                {isSuperAdmin ? (
                  <button 
                    onClick={() => setCurrentTab('admin')}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center gap-2 text-sm"
                  >
                    <Crown size={18} /> Open Super Admin Console
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      if (!user && !isSuperAdmin) {
                        showToast('Please sign in or register to report an item.', 'info');
                        setCurrentTab('auth');
                      } else {
                        setCurrentTab('report');
                      }
                    }}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition active:scale-95 flex items-center gap-2 text-sm"
                  >
                    <PlusCircle size={18} /> Report an Item
                  </button>
                )}
                
                <button 
                  onClick={() => setCurrentTab('listings')}
                  className="px-6 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-bold transition flex items-center gap-2 text-sm"
                >
                  <Search size={18} /> Browse Listings ({reports.length})
                </button>
              </div>

              {/* Live Impact Stats Bar */}
              <div className="pt-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md max-w-3xl mx-auto">
                  <div>
                    <div className="font-heading font-black text-2xl text-white">{reports.length}+</div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Reports</div>
                  </div>
                  <div>
                    <div className="font-heading font-black text-2xl text-emerald-400">
                      {reports.filter(r => r.is_resolved || r.status === 'Resolved').length}
                    </div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Reunited Items</div>
                  </div>
                  <div>
                    <div className="font-heading font-black text-2xl text-blue-400">
                      {reports.filter(r => (r.reportType === 'Found' || r.status === 'Found') && !r.is_resolved).length}
                    </div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Active Found</div>
                  </div>
                  <div>
                    <div className="font-heading font-black text-2xl text-purple-400">100%</div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Campus Security</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Campus Listings Carousel / Grid Preview */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-white">Recent Campus Listings</h2>
                  <p className="text-xs text-slate-400">Fresh reports submitted by students across campus</p>
                </div>
                <button 
                  onClick={() => setCurrentTab('listings')}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                >
                  <span>View All Listings</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs">Fetching campus feed...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                  <p className="text-sm text-slate-400 mb-2">No listings reported yet.</p>
                  <button 
                    onClick={() => setCurrentTab('report')}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white"
                  >
                    Post First Report
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {reports.slice(0, 3).map(item => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      currentUser={user}
                      isSuperAdmin={isSuperAdmin}
                      onSelect={(it) => setSelectedItem(it)}
                      onToggleResolve={handleToggleResolve}
                      onAdminEdit={(it) => setEditingItem(it)}
                      onAdminDelete={handleAdminDelete}
                      onUserEdit={(it) => setUserEditingItem(it)}
                      onUserDelete={handleUserDeleteReport}
                    />
                  ))}
                </div>
              )}
            </section>

          </div>
        )}

        {/* ========================================================
            🔍 LISTINGS VIEW
            ======================================================== */}
        {currentTab === 'listings' && (
          <div className="space-y-6">
            
            {/* Filter & Search Header */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0f1322]/80 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-5">
              
              {/* Search Bar + Post CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by keyword, brand, location, description..."
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => setCurrentTab('report')}
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <PlusCircle size={16} /> Post Report
                </button>
              </div>

              {/* Segmented Type Switcher + Status + View Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
                
                {/* Type Switcher */}
                <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-xl">
                  {[
                    { id: 'all', label: 'All Items' },
                    { id: 'lost', label: 'Lost Items' },
                    { id: 'found', label: 'Found Items' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilterType(tab.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        filterType === tab.id 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Status Toggle & View Mode */}
                <div className="flex items-center gap-2">
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Reports Only</option>
                    <option value="resolved">Resolved / Returned</option>
                  </select>

                  <div className="flex items-center p-1 bg-black/40 border border-white/10 rounded-xl">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg text-xs transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Grid view"
                    >
                      <Grid size={14} />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg text-xs transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="List view"
                    >
                      <List size={14} />
                    </button>
                  </div>
                </div>

              </div>

              {/* Horizontal Category Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      filterCategory === cat.id 
                        ? 'bg-white text-slate-900 font-bold shadow-md' 
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/[0.06]'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Results Count & Active Filters Pill */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
                <div>
                  Showing <strong className="text-white">{filteredReports.length}</strong> {filteredReports.length === 1 ? 'listing' : 'listings'}
                  {(searchQuery || filterCategory !== 'all' || filterType !== 'all' || filterStatus !== 'all') && (
                    <span className="ml-2 text-blue-400 font-semibold">(filtered)</span>
                  )}
                </div>

                {(searchQuery || filterCategory !== 'all' || filterType !== 'all' || filterStatus !== 'all') && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCategory('all');
                      setFilterType('all');
                      setFilterStatus('all');
                    }}
                    className="text-xs text-blue-400 hover:underline font-semibold"
                  >
                    Reset all filters
                  </button>
                )}
              </div>

            </div>

            {/* Listings Grid */}
            {loading ? (
              <div className="text-center py-20 text-slate-400">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-semibold">Loading campus listings...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] text-slate-400 flex items-center justify-center mx-auto">
                  <Search size={28} />
                </div>
                <h3 className="font-heading text-xl font-bold text-white">No listings match your search</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  We couldn't find any items matching your selected criteria. Try adjusting your search query, choosing a different category, or report the item!
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCategory('all');
                      setFilterType('all');
                      setFilterStatus('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition"
                  >
                    Clear All Filters
                  </button>
                  <button 
                    onClick={() => setCurrentTab('report')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition"
                  >
                    Post This Report
                  </button>
                </div>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' 
                  : 'space-y-4'
              }>
                {filteredReports.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    currentUser={user}
                    isSuperAdmin={isSuperAdmin}
                    onSelect={(it) => setSelectedItem(it)}
                    onToggleResolve={handleToggleResolve}
                    onAdminEdit={(it) => setEditingItem(it)}
                    onAdminDelete={handleAdminDelete}
                    onUserEdit={(it) => setUserEditingItem(it)}
                    onUserDelete={handleUserDeleteReport}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            ✍️ REPORT ITEM VIEW (Login Required)
            ======================================================== */}
        {currentTab === 'report' && (
          (!user && !isSuperAdmin) ? (
            <div className="max-w-md mx-auto py-16 text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto shadow-xl shadow-blue-500/10">
                <Lock size={36} />
              </div>
              <div className="space-y-2">
                <h2 className="font-heading text-3xl font-black text-white">Campus Login Required</h2>
                <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                  You must be signed in with your campus account or Super Admin credentials to submit lost belongings or report found items.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button 
                  onClick={() => setCurrentTab('listings')}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition"
                >
                  Browse Listings
                </button>
                <button 
                  onClick={() => setCurrentTab('auth')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95"
                >
                  <Sparkles size={14} /> Sign In to Report
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto py-4">
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0f1322]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
                
                <div className="border-b border-white/[0.08] pb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold mb-2">
                    <PlusCircle size={13} />
                    <span>{isSuperAdmin ? 'Super Admin Official Registry' : 'Campus Registry'}</span>
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-black text-white">
                    {isSuperAdmin ? 'Publish Official Campus Report' : 'Report an Item'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Fill in the details below. Verified reports are broadcasted to the entire campus network instantly.
                  </p>
                </div>

                <form onSubmit={handleSubmitReport} className="space-y-5">
                
                {/* Status Switcher: Lost vs Found Cards */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    What are you reporting?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setReportForm({ ...reportForm, status: 'Lost' })}
                      className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                        reportForm.status === 'Lost'
                          ? 'bg-rose-500/15 border-rose-500/40 text-white shadow-lg shadow-rose-500/10'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        reportForm.status === 'Lost' ? 'bg-rose-500 text-white' : 'bg-white/10 text-slate-300'
                      }`}>
                        ✕
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Lost Item</div>
                        <div className="text-[10px] text-slate-400">I lost my belonging</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReportForm({ ...reportForm, status: 'Found' })}
                      className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                        reportForm.status === 'Found'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-lg shadow-emerald-500/10'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        reportForm.status === 'Found' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-300'
                      }`}>
                        ✓
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Found Item</div>
                        <div className="text-[10px] text-slate-400">I found someone's item</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                    Item Name & Brand <span className="text-rose-400">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={reportForm.title}
                    onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                    placeholder="e.g. Midnight Blue AirPods Pro in Black Silicone Case"
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Category Selector */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {categories.filter(c => c.id !== 'all').map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setReportForm({ ...reportForm, category: cat.id })}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                          reportForm.category === cat.id 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30 font-bold' 
                            : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat.icon}
                        <span className="truncate">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                    Description & Identifying Details <span className="text-rose-400">*</span>
                  </label>
                  <textarea 
                    required
                    rows={3}
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    placeholder="Mention color, stickers, model, scratches, or unique features that verify ownership..."
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition leading-relaxed"
                  />
                </div>

                {/* Location & Quick Chips */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                    Campus Location <span className="text-rose-400">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={reportForm.location}
                    onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                    placeholder="e.g. Central Library 2nd Floor Silent Room"
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition mb-2"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Quick add:</span>
                    {campusLocations.map((loc) => (
                      <button
                        type="button"
                        key={loc}
                        onClick={() => setReportForm({ ...reportForm, location: loc })}
                        className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.06] text-[10px] text-slate-300 transition"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time & College ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                      Date & Time <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="datetime-local" 
                      required
                      value={reportForm.time}
                      onChange={(e) => setReportForm({ ...reportForm, time: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                      College ID <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={reportForm.collegeid}
                      onChange={(e) => setReportForm({ ...reportForm, collegeid: e.target.value })}
                      placeholder={isSuperAdmin ? "ADMIN" : "e.g. 21IT102"}
                      className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Contact Phone Number */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                    10-Digit Contact Phone <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">+91</span>
                    <input 
                      type="tel" 
                      required
                      maxLength={10}
                      value={reportForm.contact}
                      onChange={(e) => setReportForm({ ...reportForm, contact: e.target.value.replace(/\D/g, '') })}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition font-mono tracking-wider"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    This number allows the finder or owner to reach you via Call or WhatsApp.
                  </span>
                </div>

                {/* Photo Upload Zone */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                    Item Photo (Recommended)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 p-4 rounded-2xl border border-dashed border-white/20 bg-black/30 hover:bg-black/50 cursor-pointer transition flex flex-col items-center justify-center text-center group">
                      <Camera size={24} className="text-slate-400 group-hover:text-blue-400 transition mb-1" />
                      <span className="text-xs font-semibold text-slate-300">
                        {reportImage ? reportImage.name : 'Click to select or drag photo here'}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WEBP up to 10MB</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setReportImage(file);
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>

                    {imagePreview && (
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-lg flex-shrink-0">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => { setReportImage(null); setImagePreview(null); }}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-xs font-bold hover:bg-black/80 transition"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Publishing to Campus Network...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={17} />
                      <span>{isSuperAdmin ? 'Publish as Super Admin' : 'Submit Report'}</span>
                    </>
                  )}
                </button>

              </form>

            </div>
          </div>
          )
        )}

        {/* ========================================================
            📊 DASHBOARD VIEW (Login Required)
            ======================================================== */}
        {currentTab === 'dashboard' && (
          (!user && !isSuperAdmin) ? (
            <div className="max-w-md mx-auto py-16 text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto shadow-xl shadow-blue-500/10">
                <Lock size={36} />
              </div>
              <div className="space-y-2">
                <h2 className="font-heading text-3xl font-black text-white">Login Required</h2>
                <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Sign in with your campus account to view your reported items, track recovery status, and manage listings.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button 
                  onClick={() => setCurrentTab('home')}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition"
                >
                  Return to Home
                </button>
                <button 
                  onClick={() => setCurrentTab('auth')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95"
                >
                  <Sparkles size={14} /> Sign In
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 py-2">
            
            {/* Student Profile Identity Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0f1424] via-[#12182c] to-[#0f1424] border border-white/10 backdrop-blur-xl shadow-2xl flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-2xl p-[2px] shadow-xl ${
                  isSuperAdmin ? 'bg-gradient-to-tr from-amber-500 to-amber-600 shadow-amber-500/20' : 'bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-blue-500/20'
                }`}>
                  <div className="w-full h-full rounded-[14px] bg-[#0c101d] flex items-center justify-center text-white text-2xl font-black">
                    {isSuperAdmin ? (
                      <Crown size={32} className="text-amber-400" />
                    ) : user?.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-[14px] object-cover" />
                    ) : (
                      (profile?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-2xl font-black text-white">
                      {isSuperAdmin ? 'Super Admin' : (profile?.username || user?.displayName || 'Campus Student')}
                    </h2>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isSuperAdmin 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    }`}>
                      {isSuperAdmin ? 'SUPER ADMIN (HEAD)' : 'STUDENT'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5">{user?.email || ''}</p>

                  <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-slate-200">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>College ID: <strong>{isSuperAdmin ? 'HEAD_ADMIN' : (profile?.collegeId || 'Verified')}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isSuperAdmin && (
                  <button 
                    onClick={() => setCurrentTab('admin')}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition flex items-center gap-2"
                  >
                    <Crown size={15} /> Super Admin Console
                  </button>
                )}
                {/* Edit Profile — only for regular logged-in users */}
                {!isSuperAdmin && user && (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs transition flex items-center gap-2"
                  >
                    <Pencil size={14} /> Edit Profile
                  </button>
                )}
                <button 
                  onClick={() => setCurrentTab('report')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
                >
                  <PlusCircle size={15} /> Post Report
                </button>
              </div>
            </div>

            {/* Dashboard Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#0f1322]/80 border border-white/[0.08] backdrop-blur-md">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">My Total Reports</span>
                <div className="font-heading text-3xl font-black text-white mt-1">{userReports.length}</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0f1322]/80 border border-white/[0.08] backdrop-blur-md">
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Active Lost</span>
                <div className="font-heading text-3xl font-black text-rose-400 mt-1">
                  {userReports.filter(r => (r.reportType === 'Lost' || r.status === 'Lost') && !r.is_resolved).length}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0f1322]/80 border border-white/[0.08] backdrop-blur-md">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Active Found</span>
                <div className="font-heading text-3xl font-black text-emerald-400 mt-1">
                  {userReports.filter(r => (r.reportType === 'Found' || r.status === 'Found') && !r.is_resolved).length}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0f1322]/80 border border-white/[0.08] backdrop-blur-md">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Resolved Items</span>
                <div className="font-heading text-3xl font-black text-cyan-400 mt-1">
                  {userReports.filter(r => r.is_resolved || r.status === 'Resolved').length}
                </div>
              </div>
            </div>

            {/* "My Reports" Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-heading text-xl font-bold text-white">My Submitted Reports</h3>
                  <p className="text-xs text-slate-400">Manage and update status of reports you have created</p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-xl">
                  {['all', 'active', 'resolved'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDashboardFilter(tab)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                        dashboardFilter === tab 
                          ? 'bg-blue-600 text-white' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {userReportsFiltered.length === 0 ? (
                <div className="text-center py-16 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-8 space-y-3">
                  <p className="text-sm text-slate-400">No reports found in this category.</p>
                  <button 
                    onClick={() => setCurrentTab('report')}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white transition"
                  >
                    Create a Report
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {userReportsFiltered.map(item => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      currentUser={user}
                      isSuperAdmin={isSuperAdmin}
                      onSelect={(it) => setSelectedItem(it)}
                      onToggleResolve={handleToggleResolve}
                      onAdminEdit={(it) => setEditingItem(it)}
                      onAdminDelete={handleAdminDelete}
                      onUserEdit={(it) => setUserEditingItem(it)}
                      onUserDelete={handleUserDeleteReport}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
          )
        )}

        {/* ========================================================
            🔐 AUTH VIEW (Strict Role Separation)
            ======================================================== */}
        {currentTab === 'auth' && (
          <div className="max-w-md mx-auto py-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0f1322]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
              
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1.5px] mx-auto mb-2 shadow-lg shadow-blue-500/20">
                  <div className="w-full h-full bg-[#0a0d16] rounded-[14px] flex items-center justify-center">
                    {authMode === 'admin' ? (
                      <Crown size={22} className="text-amber-400" />
                    ) : (
                      <Sparkles size={22} className="text-blue-400" />
                    )}
                  </div>
                </div>

                <h2 className="font-heading text-2xl font-black text-white">
                  {authMode === 'admin' ? 'Head Administrator Gateway' : authMode === 'login' ? 'Student Sign In' : 'Create Student Account'}
                </h2>
                <p className="text-xs text-slate-400">
                  {authMode === 'admin' 
                    ? 'Authorized campus staff & head administrator clearance portal' 
                    : authMode === 'login' 
                      ? 'Sign in to report or track lost belongings' 
                      : 'Join with your campus credentials to submit reports'}
                </p>
              </div>

              {/* Mode Toggle Bar: Student Login vs Student Register vs Admin Gateway */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 border border-white/10 rounded-2xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`py-2 rounded-xl transition ${
                    authMode === 'login' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Student Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`py-2 rounded-xl transition ${
                    authMode === 'signup' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Student Register
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('admin')}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
                    authMode === 'admin' ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20' : 'text-amber-400/80 hover:text-amber-300'
                  }`}
                >
                  <Crown size={12} /> Admin
                </button>
              </div>

              {/* ================= ADMIN LOGIN & REGISTRATION GATEWAY ================= */}
              {authMode === 'admin' ? (
                <div className="space-y-4">
                  {/* Admin Sub-mode Switcher */}
                  <div className="flex rounded-xl bg-amber-500/10 p-1 border border-amber-500/20 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setAdminSubMode('login')}
                      className={`flex-1 py-1.5 rounded-lg transition ${
                        adminSubMode === 'login' 
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md' 
                          : 'text-amber-300/80 hover:text-white'
                      }`}
                    >
                      Admin Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminSubMode('register')}
                      className={`flex-1 py-1.5 rounded-lg transition ${
                        adminSubMode === 'register' 
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md' 
                          : 'text-amber-300/80 hover:text-white'
                      }`}
                    >
                      Register as Admin
                    </button>
                  </div>

                  {adminSubMode === 'login' ? (
                    <form onSubmit={handleAdminSignIn} className="space-y-4">
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                        <span className="font-bold text-amber-300">Administrator Access:</span> Sign in with your registered campus administrator credentials.
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                          Admin Email
                        </label>
                        <input 
                          type="text" 
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="Enter administrator email"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                          Admin Password
                        </label>
                        <input 
                          type="password" 
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Enter password"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={authLoading}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-98"
                      >
                        {authLoading ? (
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Crown size={15} />
                            <span>Authenticate as Head Admin</span>
                          </>
                        )}
                      </button>

                      <div className="text-right text-[11px] pt-1">
                        <button
                          type="button"
                          onClick={() => setAdminSubMode('register')}
                          className="text-amber-400 hover:underline font-bold"
                        >
                          Register new admin account →
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Admin Registration Form */
                    <form onSubmit={handleAdminRegister} className="space-y-3.5">
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                        <span className="font-bold text-amber-300">Super Admin Registration:</span> Authorized registration requires campus Master Security Authorization Key.
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                          Administrator Name / Title
                        </label>
                        <input 
                          type="text" 
                          required
                          value={authUsername}
                          onChange={(e) => setAuthUsername(e.target.value)}
                          placeholder="Full name or administrative title"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                          Admin Email
                        </label>
                        <input 
                          type="email" 
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="Admin email address"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                          Admin Password (min. 6 characters)
                        </label>
                        <input 
                          type="password" 
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Password (min. 6 characters)"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                          <span>Master Security Authorization Key</span>
                          <span className="text-[10px] text-amber-400/80 font-mono">(required)</span>
                        </label>
                        <input 
                          type="password" 
                          required
                          value={adminSecurityKey}
                          onChange={(e) => setAdminSecurityKey(e.target.value)}
                          placeholder="Enter master authorization key"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400 transition font-mono"
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={authLoading}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-98"
                      >
                        {authLoading ? (
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Crown size={15} />
                            <span>Register & Activate Super Admin Account</span>
                          </>
                        )}
                      </button>

                      <div className="text-center text-[11px] pt-1">
                        <button
                          type="button"
                          onClick={() => setAdminSubMode('login')}
                          className="text-amber-400 hover:underline font-bold"
                        >
                          ← Already registered as Admin? Sign In
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                /* ================= REGULAR STUDENT AUTH ================= */
                <>
                  {/* Google One-Click Button */}
                  <button 
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition flex items-center justify-center gap-2.5 shadow-md active:scale-98"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative text-center my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <span className="relative px-3 bg-[#0f1322] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      or student email
                    </span>
                  </div>

                  <form onSubmit={handleStudentAuthSubmit} className="space-y-3.5">
                    {authMode === 'signup' && (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                            Full Name / Username
                          </label>
                          <input 
                            type="text" 
                            required
                            value={authUsername}
                            onChange={(e) => setAuthUsername(e.target.value)}
                            placeholder="e.g. Alex Johnson"
                            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                            College ID / USN <span className="text-rose-400">*</span>
                          </label>
                          <input 
                            type="text" 
                            required
                            value={authCollegeId}
                            onChange={(e) => setAuthCollegeId(e.target.value.toUpperCase())}
                            placeholder="e.g. 21IT102"
                            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition uppercase"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">Must be unique to your student identity</p>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Campus Email
                      </label>
                      <input 
                        type="email" 
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="student@college.edu"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Password
                      </label>
                      <input 
                        type="password" 
                        required
                        minLength={6}
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={authLoading}
                      className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-98"
                    >
                      {authLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : authMode === 'login' ? (
                        'Log In as Student'
                      ) : (
                        'Register Student Account'
                      )}
                    </button>
                  </form>
                </>
              )}

            </div>
          </div>
        )}

      </main>

      {/* Item Details Luxury Modal */}
      {selectedItem && (
        <ItemModal 
          item={selectedItem} 
          currentUser={user}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setSelectedItem(null)}
          onToggleResolve={handleToggleResolve}
          onDelete={handleAdminDelete}
          onAdminEdit={(it) => setEditingItem(it)}
          onUserEdit={(it) => setUserEditingItem(it)}
          onShowToast={showToast}
          onRequireAuth={() => {
            setSelectedItem(null);
            setCurrentTab('auth');
            showToast('Please sign in to view contact details.', 'info');
          }}
        />
      )}

      {/* Super Admin Edit Modal */}
      {editingItem && (
        <AdminEditModal 
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleAdminSave}
        />
      )}

      {/* User (owner) Edit Report Modal */}
      {userEditingItem && (
        <UserEditModal
          item={userEditingItem}
          onClose={() => setUserEditingItem(null)}
          onSave={handleUserEditReport}
        />
      )}

      {/* Profile Edit Modal */}
      {editingProfile && user && (
        <ProfileEditModal
          profile={profile}
          onClose={() => setEditingProfile(false)}
          onSave={handleProfileUpdate}
        />
      )}

      {/* Google Sign In Onboarding Modal for New Students */}
      {googleOnboardingUser && (
        <GoogleOnboardingModal 
          googleUser={googleOnboardingUser}
          onComplete={handleCompleteGoogleOnboarding}
          onCancel={handleCancelGoogleOnboarding}
        />
      )}

      {/* Clean Campus Footer */}
      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-slate-500 bg-[#05070b]/90 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-white text-sm">Lostfusion</span>
            <span className="text-slate-600">|</span>
            <span>Connected Campus Lost & Found Registry</span>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-[11px] text-slate-500">
              &copy; 2025 Lostfusion. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
