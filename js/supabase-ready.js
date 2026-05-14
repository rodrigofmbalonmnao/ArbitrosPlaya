// ============================================
// ArbitrosPlaya - Capa de Datos (Solo Supabase)
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

const ADMIN_EMAIL = 'adminarbitrosplaya@gmail.com';

function checkConnection() {
  if (!supabaseClient) throw new Error("Sin conexión, inténtalo más tarde");
}

const DataService = {

  // ==========================================
  // AUTH
  // ==========================================

  isDemo: false,

  async register(email, password, userData) {
    checkConnection();
    const { data, error } = await supabaseClient.auth.signUp({
      email, password, options: { 
        data: { ...userData, isAdmin: email === ADMIN_EMAIL },
        emailRedirectTo: 'https://rodrigofmbalonmnao.github.io/ArbitrosPlaya/index.html'
      }
    });
    if (error) throw error;
    return data;
  },

  async verifyEmail(email, token) {
    checkConnection();
    const { data, error } = await supabaseClient.auth.verifyOtp({
      email, token, type: 'signup'
    });
    if (error) throw error;
    return data;
  },

  async login(email, password) {
    checkConnection();
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        throw new Error('Vuelvelo a intentar o si no recuerda su contraseña contacte con adminarbitrosplaya@gmail.com');
      }
      throw error;
    }
    return data.session;
  },

  async getCurrentUser() {
    if (!supabaseClient) return null;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return null;
    const isAdmin = user.email === ADMIN_EMAIL;
    return {
      id: user.id, email: user.email,
      nombre: user.user_metadata.nombre || (isAdmin ? 'Administrador' : ''),
      apellido: user.user_metadata.apellido || '',
      federacion: user.user_metadata.federacion || '',
      isAdmin: isAdmin
    };
  },

  async logout() {
    if (supabaseClient) await supabaseClient.auth.signOut();
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
    checkConnection();
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    });
    if (error) throw error;
  },

  // ==========================================
  // REGLAMENTOS
  // ==========================================
  async getReglamentos() {
    checkConnection();
    const { data, error } = await supabaseClient.from('reglamentos').select('*').order('fecha', { ascending: false });
    if (error) throw error;
    return data.map(r => ({
      ...r,
      pdf_url: r.pdf_url || r.pdfUrl,
      pdfUrl: r.pdf_url || r.pdfUrl,
      storage_path: r.storage_path || r.storagePath,
      storagePath: r.storage_path || r.storagePath
    }));
  },

  async uploadReglamento(file, metadata) {
    checkConnection();
    
    // Corregir mapeo de metadata si existe
    const dbMetadata = { ...metadata };
    if (dbMetadata.pdfUrl !== undefined) {
      dbMetadata.pdf_url = dbMetadata.pdfUrl;
      delete dbMetadata.pdfUrl;
    }
    if (dbMetadata.storagePath !== undefined) {
      dbMetadata.storage_path = dbMetadata.storagePath;
      delete dbMetadata.storagePath;
    }

    const fileName = `${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('reglamentos')
      .upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseClient.storage.from('reglamentos').getPublicUrl(fileName);

    const { error: dbError } = await supabaseClient.from('reglamentos').insert([{
      ...dbMetadata,
      pdf_url: publicUrl,
      storage_path: fileName
    }]);
    if (dbError) throw dbError;
  },

  async deleteReglamento(id) {
    checkConnection();
    const { data } = await supabaseClient.from('reglamentos').select('storage_path').eq('id', id).single();
    if (data && data.storage_path) {
      await supabaseClient.storage.from('reglamentos').remove([data.storage_path]);
    }
    const { error } = await supabaseClient.from('reglamentos').delete().eq('id', id);
    if (error) throw error;
  },

  // ==========================================
  // RESULTADOS
  // ==========================================
  async saveTestResult(result) {
    checkConnection();
    const user = await this.getCurrentUser();
    const { data, error } = await supabaseClient.from('test_results').insert([{ user_id: user.id, ...result }]).select();
    if (error) throw error;
    return data[0].id;
  },

  async markSawSolutions(resultId) {
    checkConnection();
    await supabaseClient.from('test_results').update({ sawSolutions: true }).eq('id', resultId);
  },

  async getUserResults(userId, filters = {}) {
    checkConnection();
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
  },

  // ==========================================
  // ADMIN FUNCTIONS
  // ==========================================
  async getAllUsers() {
    checkConnection();
    const { data, error } = await supabaseClient.from('profiles').select('*');
    if (error) throw error;
    return data;
  },

  async deleteUser(userId) {
    checkConnection();
    const { error } = await supabaseClient.from('profiles').delete().eq('id', userId);
    if (error) throw error;
  },

  async resetPassword(userId, newPassword, email = null) {
    checkConnection();
    if (!email) throw new Error("Email requerido para restablecer contraseña.");
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://rodrigofmbalonmnao.github.io/ArbitrosPlaya/index.html'
    });
    if (error) throw error;
  },

  async updateUserFederation(userId, newFederation) {
    checkConnection();
    const { error } = await supabaseClient.from('profiles').update({ federacion: newFederation }).eq('id', userId);
    if (error) throw error;
  },

  async getAllResults(filters = {}) {
    checkConnection();
    const { data, error } = await supabaseClient.from('test_results').select('*, profiles(nombre, apellido, federacion)').order('created_at', { ascending: false });
    if (error) throw error;
    let results = data;

    return results.filter(r => {
      const d = new Date(r.created_at);
      const matchYear = !filters.year || d.getFullYear().toString() === filters.year;
      const matchMonth = !filters.month || (d.getMonth() + 1).toString() === filters.month;
      const matchFed = !filters.federacion || (r.profiles && r.profiles.federacion === filters.federacion);
      return matchYear && matchMonth && matchFed;
    }).reverse();
  },

  async getAdminStats(filters = {}) {
    checkConnection();
    const results = await this.getAllResults(filters);
    const users = await this.getAllUsers();
    
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
    checkConnection();
    const { data, error } = await supabaseClient.from('preguntas_reglas').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data;
  },

  async saveQuestion(question) {
    checkConnection();
    if (question.id && !question.id.toString().startsWith('temp_')) {
      const { error } = await supabaseClient.from('preguntas_reglas').update(question).eq('id', question.id);
      if (error) throw error;
    } else {
      delete question.id;
      const { error } = await supabaseClient.from('preguntas_reglas').insert([question]);
      if (error) throw error;
    }
  },

  async deleteQuestion(id) {
    checkConnection();
    const { error } = await supabaseClient.from('preguntas_reglas').delete().eq('id', id);
    if (error) throw error;
  },

  async getVideosBank() {
    checkConnection();
    const { data, error } = await supabaseClient.from('preguntas_videos').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data;
  },

  async saveVideoQuestion(question, videoFile = null) {
    checkConnection();
    
    // Asegurar mapeo correcto para Supabase
    const dbQuestion = { ...question };
    if (dbQuestion.videoTitulo !== undefined) {
      dbQuestion.video_titulo = dbQuestion.videoTitulo;
      delete dbQuestion.videoTitulo;
    }
    if (dbQuestion.videoUrl !== undefined) {
      dbQuestion.video_url = dbQuestion.videoUrl;
      delete dbQuestion.videoUrl;
    }

    if (videoFile) {
      const fileName = `videos/${Date.now()}_${videoFile.name}`;
      const { error: uploadError } = await supabaseClient.storage.from('banco_recursos').upload(fileName, videoFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabaseClient.storage.from('banco_recursos').getPublicUrl(fileName);
      dbQuestion.video_url = publicUrl;
    }
    
    if (dbQuestion.id && !dbQuestion.id.toString().startsWith('temp_')) {
      const { error } = await supabaseClient.from('preguntas_videos').update(dbQuestion).eq('id', dbQuestion.id);
      if (error) throw error;
    } else {
      delete dbQuestion.id;
      const { error } = await supabaseClient.from('preguntas_videos').insert([dbQuestion]);
      if (error) throw error;
    }
  },

  async deleteVideoQuestion(id) {
    checkConnection();
    const { error } = await supabaseClient.from('preguntas_videos').delete().eq('id', id);
    if (error) throw error;
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
