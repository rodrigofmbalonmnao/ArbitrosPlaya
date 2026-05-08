// ============================================
// ArbitrosPlaya - Capa de Datos (Supabase-Ready + Demo Fallback)
// ============================================

const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_KEY = 'TU_SUPABASE_ANON_KEY';

const isSupabaseConfigured = SUPABASE_URL && !SUPABASE_URL.includes('TU_PROYECTO');
const supabaseClient = (window.supabase && isSupabaseConfigured) 
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

const ADMIN_EMAIL = 'rodrigofmbalonmano@gmail.com';

const DataService = {

  // ==========================================
  // AUTH
  // ==========================================

  async register(email, password, userData) {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signUp({
        email, password, options: { data: { ...userData, isAdmin: email === ADMIN_EMAIL } }
      });
      if (error) throw error;
      return data;
    } else {
      // Demo Mode
      const users = JSON.parse(localStorage.getItem('ap_users') || '[]');
      if (users.find(u => u.email === email)) throw new Error('El usuario ya existe');
      const newUser = { id: Date.now().toString(), email, password, ...userData, isAdmin: email === ADMIN_EMAIL };
      users.push(newUser);
      localStorage.setItem('ap_users', JSON.stringify(users));
      return newUser;
    }
  },

  async login(email, password) {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          throw new Error('Vuelvelo a intentar o si no recuerda su contraseña contacte con rodrigofmbalonmano@gmail.com');
        }
        throw error;
      }
      return data.session;
    } else {
      // Demo Mode
      if (email === 'test@test.com' && password === '123456') {
        const mockUser = { id: 'mock-test-id', email: 'test@test.com', nombre: 'Usuario', apellido: 'Test', isAdmin: false };
        localStorage.setItem('ap_session', JSON.stringify(mockUser));
        return mockUser;
      }
      if (email === 'rodrigofmbalonmano@gmail.com' && password === '123456') {
        const adminUser = { id: 'mock-admin-id', email: 'rodrigofmbalonmano@gmail.com', nombre: 'Rodrigo', apellido: 'Admin', isAdmin: true };
        localStorage.setItem('ap_session', JSON.stringify(adminUser));
        return adminUser;
      }

      const users = JSON.parse(localStorage.getItem('ap_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) throw new Error('Vuelvelo a intentar o si no recuerda su contraseña contacte con rodrigofmbalonmano@gmail.com');
      localStorage.setItem('ap_session', JSON.stringify(user));
      return user;
    }
  },

  async getCurrentUser() {
    if (supabaseClient) {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return null;
      return {
        id: user.id, email: user.email,
        nombre: user.user_metadata.nombre,
        apellido: user.user_metadata.apellido,
        federacion: user.user_metadata.federacion,
        isAdmin: user.email === ADMIN_EMAIL
      };
    } else {
      const session = JSON.parse(localStorage.getItem('ap_session') || 'null');
      if (session && !session.nombre) {
        // Recuperar datos completos si faltan (compatibilidad con cuentas antiguas)
        const users = JSON.parse(localStorage.getItem('ap_users') || '[]');
        const fullUser = users.find(u => u.email === session.email);
        if (fullUser && fullUser.nombre) {
          localStorage.setItem('ap_session', JSON.stringify(fullUser));
          return fullUser;
        }
        // Fallback si no hay nombre
        return { ...session, nombre: session.email.split('@')[0], apellido: '' };
      }
      return session;
    }
  },

  async logout() {
    if (supabaseClient) await supabaseClient.auth.signOut();
    localStorage.removeItem('ap_session');
  },

  async requireAuth(redirectTo = '../index.html') {
    const user = await this.getCurrentUser();
    if (!user) { window.location.href = redirectTo; return null; }
    return user;
  },

  async requireAuthHome(redirectTo = 'index.html') {
    const user = await this.getCurrentUser();
    if (!user) { window.location.href = redirectTo; return null; }
    return user;
  },

  async requireAdmin(redirectTo = '../index.html') {
    const user = await this.getCurrentUser();
    if (!user || !user.isAdmin) { window.location.href = redirectTo; return null; }
    return user;
  },

  // ==========================================
  // REGLAMENTOS
  // ==========================================
  getReglamentos() {
    return [
      { id: 1, titulo: 'Reglas de Juego IHF 2026', descripcion: 'Oficial completo.', fecha: '2024', icono: '📕', pdfUrl: '../assets/pdfs/ihf-beach-handball-rules-2026.pdf' },
      { id: 2, titulo: 'Manual de Arbitraje', descripcion: 'Guía práctica.', fecha: '2024', icono: '📙', pdfUrl: '../assets/pdfs/referee-manual-2026.pdf' },
      { id: 3, titulo: 'FAQ IHF', descripcion: 'Clarificaciones.', fecha: '2024', icono: '📘', pdfUrl: '../assets/pdfs/ihf-faq-2026.pdf' }
    ];
  },


  // ==========================================
  // RESULTADOS
  // ==========================================
  async saveTestResult(result) {
    if (supabaseClient) {
      const user = await this.getCurrentUser();
      const { data, error } = await supabaseClient.from('test_results').insert([{ user_id: user.id, ...result }]).select();
      if (error) throw error;
      return data[0].id;
    } else {
      const results = JSON.parse(localStorage.getItem('ap_results') || '[]');
      const newRes = { id: Date.now(), ...result, created_at: new Date().toISOString() };
      results.push(newRes);
      localStorage.setItem('ap_results', JSON.stringify(results));
      return newRes.id;
    }
  },

  async getUserResults(userId, filters = {}) {
    if (supabaseClient) {
      let q = supabaseClient.from('test_results').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      
      if (filters.type) {
        q = q.eq('test_type', filters.type);
      }
      
      // Filtro de fecha en Supabase (simplificado para demo/pequeña escala)
      const { data, error } = await q;
      if (error) throw error;
      
      // Filtrado manual por fecha para permitir combinaciones complejas (mes sin año, etc.)
      let filtered = data;
      if (filters.year || filters.month) {
        filtered = data.filter(r => {
          const d = new Date(r.created_at);
          const matchYear = !filters.year || d.getFullYear().toString() === filters.year;
          const matchMonth = !filters.month || (d.getMonth() + 1).toString() === filters.month;
          return matchYear && matchMonth;
        });
      }
      return filtered;
    } else {
      // Demo Mode
      let results = JSON.parse(localStorage.getItem('ap_results') || '[]');
      
      // Filtro permisivo por usuario (si no tiene id, se muestra para compatibilidad)
      results = results.filter(r => !r.user_id || r.user_id === userId);
      
      if (filters.type && filters.type !== 'todos') {
        results = results.filter(r => {
          const type = r.test_type || r.testType;
          return type === filters.type;
        });
      }
      
      if (filters.year && filters.year !== '') 
        results = results.filter(r => new Date(r.created_at).getFullYear().toString() === filters.year);
      
      if (filters.month && filters.month !== '') 
        results = results.filter(r => (new Date(r.created_at).getMonth() + 1).toString() === filters.month);
      
      return results.reverse();
    }
  },

  // ==========================================
  // UTILIDADES
  // ==========================================
  formatDate(iso) { return new Date(iso).toLocaleDateString('es-ES'); },
  formatTime(sec) { return `${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`; }
};
window.DataService = DataService;
