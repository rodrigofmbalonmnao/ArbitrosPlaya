// ============================================
// ArbitrosPlaya - Capa de Datos (Supabase-Ready + Demo Fallback)
// ============================================

const SUPABASE_URL = 'https://tqsjpdcmvmzullpodvyd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2pwZGNtdm16dWxscG9kdnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzEzODYsImV4cCI6MjA5Mzg0NzM4Nn0.X9NxzjwKYU0CVXPIHBUmm41QemNOz87y3xyMtTK0uFc';

const isSupabaseConfigured = SUPABASE_URL && !SUPABASE_URL.includes('TU_PROYECTO');
const supabaseClient = (() => {
  if (window.supabase && isSupabaseConfigured) {
    try {
      return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch(e) {
      console.error('Error inicializando Supabase:', e);
      return null;
    }
  }
  return null;
})();

console.log('Modo:', supabaseClient ? 'SUPABASE' : 'DEMO');

const ADMIN_EMAIL = 'adminarbitrosplaya@gmail.com';

const DataService = {

  // ==========================================
  // AUTH
  // ==========================================

  isDemo: !supabaseClient,

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

  async verifyEmail(email, token) {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.verifyOtp({
        email, token, type: 'signup'
      });
      if (error) throw error;
      return data;
    } else {
      // Demo Mode: Aceptar cualquier código
      return true;
    }
  },

  async login(email, password) {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          throw new Error('Vuelvelo a intentar o si no recuerda su contraseña contacte con adminarbitrosplaya@gmail.com');
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
      if (email === 'adminarbitrosplaya@gmail.com' && password === '123456') {
        const adminUser = { id: 'mock-admin-id', email: 'adminarbitrosplaya@gmail.com', nombre: 'Rodrigo', apellido: 'Admin', isAdmin: true };
        localStorage.setItem('ap_session', JSON.stringify(adminUser));
        return adminUser;
      }

      const users = JSON.parse(localStorage.getItem('ap_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) throw new Error('Vuelvelo a intentar o si no recuerda su contraseña contacte con adminarbitrosplaya@gmail.com');
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
    // Redirección inmediata al login
    const isSub = window.location.pathname.includes('/pages/');
    window.location.href = isSub ? '../index.html' : 'index.html';
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

  async loginWithGoogle() {
    if (supabaseClient) {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname
        }
      });
      if (error) throw error;
    } else {
      alert("El inicio de sesión con Google solo está disponible en modo Producción (Supabase). En el modo Demo actual, por favor usa el formulario de email.");
    }
  },

  // ==========================================
  // REGLAMENTOS
  // ==========================================
  async getReglamentos() {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from('reglamentos').select('*').order('fecha', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      // Demo Mode
      return JSON.parse(localStorage.getItem('ap_reglamentos') || '[]');
    }
  },

  async uploadReglamento(file, metadata) {
    if (supabaseClient) {
      // 1. Subir archivo a Storage
      const fileName = `${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('reglamentos')
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      // 2. Obtener URL pública
      const { data: { publicUrl } } = supabaseClient.storage.from('reglamentos').getPublicUrl(fileName);

      // 3. Guardar metadatos en tabla
      const { error: dbError } = await supabaseClient.from('reglamentos').insert([{
        ...metadata,
        pdfUrl: publicUrl,
        storage_path: fileName
      }]);
      if (dbError) throw dbError;
    } else {
      // Demo Mode: Simulamos subida guardando metadatos y un link ficticio
      let regs = JSON.parse(localStorage.getItem('ap_reglamentos') || '[]');
      const newReg = {
        id: Date.now().toString(),
        ...metadata,
        pdfUrl: '#', // En demo no guardamos el binario real para no saturar localStorage
        isDemo: true
      };
      regs.push(newReg);
      localStorage.setItem('ap_reglamentos', JSON.stringify(regs));
    }
  },

  async deleteReglamento(id) {
    if (supabaseClient) {
      // Obtener el path del storage primero
      const { data } = await supabaseClient.from('reglamentos').select('storage_path').eq('id', id).single();
      if (data && data.storage_path) {
        await supabaseClient.storage.from('reglamentos').remove([data.storage_path]);
      }
      const { error } = await supabaseClient.from('reglamentos').delete().eq('id', id);
      if (error) throw error;
    } else {
      let regs = JSON.parse(localStorage.getItem('ap_reglamentos') || '[]');
      regs = regs.filter(r => r.id !== id);
      localStorage.setItem('ap_reglamentos', JSON.stringify(regs));
    }
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

  async markSawSolutions(resultId) {
    if (supabaseClient) {
      await supabaseClient.from('test_results').update({ sawSolutions: true }).eq('id', resultId);
    } else {
      let results = JSON.parse(localStorage.getItem('ap_results') || '[]');
      const res = results.find(r => r.id === resultId);
      if (res) {
        res.sawSolutions = true;
        localStorage.setItem('ap_results', JSON.stringify(results));
      }
    }
  },

  async getUserResults(userId, filters = {}) {
    if (supabaseClient) {
      let q = supabaseClient.from('test_results').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      
      if (filters.type) q = q.eq('test_type', filters.type);
      if (filters.dateFrom) q = q.gte('created_at', filters.dateFrom + 'T00:00:00');
      if (filters.dateTo) q = q.lte('created_at', filters.dateTo + 'T23:59:59');
      
      const { data, error } = await q;
      if (error) throw error;
      
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
      let results = JSON.parse(localStorage.getItem('ap_results') || '[]');
      results = results.filter(r => !r.user_id || r.user_id === userId);
      
      if (filters.type && filters.type !== '' && filters.type !== 'todos') {
        results = results.filter(r => (r.test_type || r.testType) === filters.type);
      }
      if (filters.year) results = results.filter(r => new Date(r.created_at).getFullYear().toString() === filters.year);
      if (filters.month) results = results.filter(r => (new Date(r.created_at).getMonth() + 1).toString() === filters.month);
      if (filters.dateFrom) results = results.filter(r => new Date(r.created_at).toISOString().split('T')[0] >= filters.dateFrom);
      if (filters.dateTo) results = results.filter(r => new Date(r.created_at).toISOString().split('T')[0] <= filters.dateTo);
      
      return results.reverse();
    }
  },

  // ==========================================
  // ADMIN FUNCTIONS
  // ==========================================
  async getAllUsers() {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from('profiles').select('*');
      if (error) throw error;
      return data;
    } else {
      return JSON.parse(localStorage.getItem('ap_users') || '[]');
    }
  },

  async deleteUser(userId) {
    if (supabaseClient) {
      // Nota: En Supabase Auth, eliminar un usuario requiere privilegios de Admin via Edge Functions o Service Role
      const { error } = await supabaseClient.from('profiles').delete().eq('id', userId);
      if (error) throw error;
    } else {
      let users = JSON.parse(localStorage.getItem('ap_users') || '[]');
      users = users.filter(u => u.id !== userId);
      localStorage.setItem('ap_users', JSON.stringify(users));
      
      let results = JSON.parse(localStorage.getItem('ap_results') || '[]');
      results = results.filter(r => r.user_id !== userId);
      localStorage.setItem('ap_results', JSON.stringify(results));
    }
  },

  async resetPassword(userId, newPassword) {
    if (supabaseClient) {
      // En Supabase Auth real se usaría updateUserServiceRole o un link de reset
      alert("En Supabase real, el usuario recibirá un email de recuperación o el admin usará la API Admin.");
    } else {
      let users = JSON.parse(localStorage.getItem('ap_users') || '[]');
      const user = users.find(u => u.id === userId);
      if (user) {
        user.password = newPassword;
        localStorage.setItem('ap_users', JSON.stringify(users));
      }
    }
  },

  async updateUserFederation(userId, newFederation) {
    if (supabaseClient) {
      const { error } = await supabaseClient.from('profiles').update({ federacion: newFederation }).eq('id', userId);
      if (error) throw error;
    } else {
      let users = JSON.parse(localStorage.getItem('ap_users') || '[]');
      const user = users.find(u => u.id === userId);
      if (user) {
        user.federacion = newFederation;
        localStorage.setItem('ap_users', JSON.stringify(users));
      }
    }
  },

  async getAllResults(filters = {}) {
    let results = [];
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from('test_results').select('*, profiles(nombre, apellido, federacion)').order('created_at', { ascending: false });
      if (error) throw error;
      results = data;
    } else {
      const allRes = JSON.parse(localStorage.getItem('ap_results') || '[]');
      const users = JSON.parse(localStorage.getItem('ap_users') || '[]');
      results = allRes.map(r => {
        const u = users.find(user => user.id === r.user_id);
        return { ...r, profiles: u ? { nombre: u.nombre, apellido: u.apellido, federacion: u.federacion } : null };
      });
    }

    // Filtros combinados
    return results.filter(r => {
      const d = new Date(r.created_at);
      const matchYear = !filters.year || d.getFullYear().toString() === filters.year;
      const matchMonth = !filters.month || (d.getMonth() + 1).toString() === filters.month;
      const matchFed = !filters.federacion || (r.profiles && r.profiles.federacion === filters.federacion);
      return matchYear && matchMonth && matchFed;
    }).reverse();
  },

  async getAdminStats(filters = {}) {
    const results = await this.getAllResults(filters);
    const users = await this.getAllUsers();
    
    // Filtrar usuarios por federación si aplica
    let filteredUsers = users;
    if (filters.federacion) {
      filteredUsers = users.filter(u => u.federacion === filters.federacion);
    }

    const totalUsers = filteredUsers.length;
    const totalTests = results.length;
    const avgScore = totalTests > 0 ? (results.reduce((s, r) => s + r.percentage, 0) / totalTests).toFixed(1) : 0;

    return { totalUsers, totalTests, avgScore };
  },

  async getQuestionsBank() {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from('preguntas_reglas').select('*').order('id', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      // Demo Mode: LocalStorage primero, si no existe usamos el array QUESTIONS (de questions-reglas.js)
      const local = localStorage.getItem('ap_questions_reglas');
      if (local) return JSON.parse(local);
      return typeof QUESTIONS !== 'undefined' ? QUESTIONS : [];
    }
  },

  async saveQuestion(question) {
    if (supabaseClient) {
      if (question.id && !question.id.toString().startsWith('temp_')) {
        const { error } = await supabaseClient.from('preguntas_reglas').update(question).eq('id', question.id);
        if (error) throw error;
      } else {
        delete question.id;
        const { error } = await supabaseClient.from('preguntas_reglas').insert([question]);
        if (error) throw error;
      }
    } else {
      // Demo Mode
      let bank = await this.getQuestionsBank();
      if (question.id) {
        const idx = bank.findIndex(q => q.id === question.id);
        if (idx !== -1) bank[idx] = question;
        else bank.push(question);
      } else {
        question.id = Date.now();
        bank.push(question);
      }
      localStorage.setItem('ap_questions_reglas', JSON.stringify(bank));
    }
  },

  async deleteQuestion(id) {
    if (supabaseClient) {
      const { error } = await supabaseClient.from('preguntas_reglas').delete().eq('id', id);
      if (error) throw error;
    } else {
      let bank = await this.getQuestionsBank();
      bank = bank.filter(q => q.id !== id);
      localStorage.setItem('ap_questions_reglas', JSON.stringify(bank));
    }
  },

  async getVideosBank() {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from('preguntas_videos').select('*').order('id', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      // Demo Mode
      const local = localStorage.getItem('ap_questions_videos');
      if (local) return JSON.parse(local);
      return typeof PREGUNTAS_VIDEOS !== 'undefined' ? PREGUNTAS_VIDEOS : [];
    }
  },

  async saveVideoQuestion(question, videoFile = null) {
    if (supabaseClient) {
      if (videoFile) {
        const fileName = `videos/${Date.now()}_${videoFile.name}`;
        const { error: uploadError } = await supabaseClient.storage.from('banco_recursos').upload(fileName, videoFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabaseClient.storage.from('banco_recursos').getPublicUrl(fileName);
        question.videoUrl = publicUrl;
      }
      
      if (question.id && !question.id.toString().startsWith('temp_')) {
        const { error } = await supabaseClient.from('preguntas_videos').update(question).eq('id', question.id);
        if (error) throw error;
      } else {
        delete question.id;
        const { error } = await supabaseClient.from('preguntas_videos').insert([question]);
        if (error) throw error;
      }
    } else {
      // Demo Mode
      let bank = await this.getVideosBank();
      if (videoFile) question.videoUrl = "Simulación: " + videoFile.name; // Simulación en demo

      if (question.id) {
        const idx = bank.findIndex(q => q.id === question.id);
        if (idx !== -1) bank[idx] = question;
        else bank.push(question);
      } else {
        question.id = 'v' + Date.now();
        bank.push(question);
      }
      localStorage.setItem('ap_questions_videos', JSON.stringify(bank));
    }
  },

  async deleteVideoQuestion(id) {
    if (supabaseClient) {
      const { error } = await supabaseClient.from('preguntas_videos').delete().eq('id', id);
      if (error) throw error;
    } else {
      let bank = await this.getVideosBank();
      bank = bank.filter(q => q.id !== id);
      localStorage.setItem('ap_questions_videos', JSON.stringify(bank));
    }
  },

  // ==========================================
  // UTILIDADES
  // ==========================================
  formatDate(iso) { 
    const d = new Date(iso);
    const date = d.toLocaleDateString('es-ES');
    const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
  },
  formatTime(sec) { return `${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`; }
};
window.DataService = DataService;
