import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Users, Clock, BarChart3, Settings, Plus, Edit2, Trash2, Play, Pause, CheckCircle, AlertTriangle, TrendingUp, Eye, EyeOff, User, Building, Calendar, Target, Activity, AlertCircle } from 'lucide-react';

// Configuración de Supabase
const SUPABASE_URL = 'https://enpgabqnvggkzlqjhkfc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVucGdhYnFudmdna3pscWpoa2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM0NDA5MywiZXhwIjoyMDcwOTIwMDkzfQ.GEDptQUZfE0vLi38B6uOqhM-ORtmwjRO-GjfLsynLvs';

// Cliente simple de Supabase
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'apikey': key
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.url}/rest/v1${endpoint}`;
    const config = {
      headers: this.headers,
      ...options
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Supabase request error:', error);
      return { data: null, error };
    }
  }

  async select(table, query = '*') {
    return this.request(`/${table}?select=${query}`);
  }

  async insert(table, data) {
    return this.request(`/${table}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async update(table, data, filter) {
    return this.request(`/${table}?${filter}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete(table, filter) {
    return this.request(`/${table}?${filter}`, {
      method: 'DELETE'
    });
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Datos iniciales para setup
const departments = ['Marketing', 'Ventas', 'Atención al Cliente', 'Administración', 'Edición', 'Equipo Docente'];

const initialCategories = {
  'Marketing': ['SEO', 'SEM', 'Redes Sociales', 'Contenido'],
  'Ventas': ['Prospección', 'Reuniones', 'Cierre', 'Seguimiento'],
  'Atención al Cliente': ['Soporte', 'Reclamaciones', 'Consultas'],
  'Administración': ['Finanzas', 'RRHH', 'Legal'],
  'Edición': ['Diseño', 'Redacción', 'Revisión'],
  'Equipo Docente': ['Clases', 'Preparación', 'Evaluación']
};

// Hook para manejo de datos con Supabase
const useSupabaseData = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState({});
  const [diasJustificados, setDiasJustificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializar datos
  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Verificar si hay usuarios
      const { data: existingUsers } = await supabase.select('users');
      
      if (!existingUsers || existingUsers.length === 0) {
        // Crear usuarios iniciales
        const initialUsers = [
          { 
            username: 'juan', 
            password: 'abc123', 
            name: 'Juan Pérez', 
            email: 'juan@empresa.com', 
            department: 'Marketing', 
            horas_objetivo: 8, 
            hora_inicio: '09:00' 
          },
          { 
            username: 'maria', 
            password: 'def456', 
            name: 'María García', 
            email: 'maria@empresa.com', 
            department: 'Ventas', 
            horas_objetivo: 7.5, 
            hora_inicio: '08:30' 
          },
          { 
            username: 'admin', 
            password: 'admin1', 
            name: 'Administrador', 
            email: 'admin@empresa.com', 
            department: 'Administración', 
            horas_objetivo: 8, 
            hora_inicio: '09:00', 
            role: 'admin' 
          },
          { 
            username: 'carlos', 
            password: 'demo123', 
            name: 'Carlos Martín', 
            email: 'carlos@empresa.com', 
            department: 'Marketing', 
            horas_objetivo: 8, 
            hora_inicio: '09:00' 
          }
        ];

        await supabase.insert('users', initialUsers);
        
        // Crear categorías iniciales
        const categoryInserts = [];
        Object.entries(initialCategories).forEach(([dept, cats]) => {
          cats.forEach(cat => {
            categoryInserts.push({ department: dept, name: cat });
          });
        });
        
        await supabase.insert('categories', categoryInserts);

        // Crear tareas demo para Carlos
        const carlosUser = await supabase.select('users', '*').then(res => 
          res.data?.find(u => u.username === 'carlos')
        );

        if (carlosUser) {
          const demoTasks = [
            // Día actual
            { 
              user_id: carlosUser.id, 
              description: 'Optimización SEO página principal', 
              category: 'SEO', 
              hours: 2.5, 
              date: new Date().toISOString().split('T')[0], 
              horario: '09:00-11:30' 
            },
            { 
              user_id: carlosUser.id, 
              description: 'Campaña SEM Google Ads', 
              category: 'SEM', 
              hours: 2, 
              date: new Date().toISOString().split('T')[0], 
              horario: '11:30-13:30' 
            },
            // Día anterior
            { 
              user_id: carlosUser.id, 
              description: 'Análisis keywords competencia', 
              category: 'SEO', 
              hours: 3, 
              date: new Date(Date.now() - 86400000).toISOString().split('T')[0], 
              horario: '09:00-12:00' 
            }
          ];

          await supabase.insert('tasks', demoTasks);
        }
      }

      // Cargar todos los datos
      await loadAllData();
      
    } catch (err) {
      console.error('Error initializing data:', err);
      setError('Error al inicializar la aplicación');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar todos los datos
  const loadAllData = useCallback(async () => {
    try {
      const [usersRes, tasksRes, categoriesRes, justifiedRes] = await Promise.all([
        supabase.select('users'),
        supabase.select('tasks'),
        supabase.select('categories'),
        supabase.select('justified_days')
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (tasksRes.data) setTasks(tasksRes.data);
      if (justifiedRes.data) setDiasJustificados(justifiedRes.data);

      // Procesar categorías
      if (categoriesRes.data) {
        const categoriesObj = {};
        categoriesRes.data.forEach(cat => {
          if (!categoriesObj[cat.department]) {
            categoriesObj[cat.department] = [];
          }
          categoriesObj[cat.department].push(cat.name);
        });
        setCategories(categoriesObj);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    }
  }, []);

  // Funciones CRUD para usuarios
  const createUser = useCallback(async (userData) => {
    try {
      const { data, error } = await supabase.insert('users', userData);
      if (error) throw error;
      await loadAllData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [loadAllData]);

  const updateUser = useCallback(async (userId, userData) => {
    try {
      const { data, error } = await supabase.update('users', userData, `id=eq.${userId}`);
      if (error) throw error;
      await loadAllData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [loadAllData]);

  const deleteUser = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase.delete('users', `id=eq.${userId}`);
      if (error) throw error;
      await loadAllData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [loadAllData]);

  // Funciones CRUD para tareas
  const createTask = useCallback(async (taskData) => {
    try {
      const { data, error } = await supabase.insert('tasks', taskData);
      if (error) throw error;
      await loadAllData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [loadAllData]);

  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      const { data, error } = await supabase.update('tasks', taskData, `id=eq.${taskId}`);
      if (error) throw error;
      await loadAllData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [loadAllData]);

  const deleteTask = useCallback(async (taskId) => {
    try {
      const { data, error } = await supabase.delete('tasks', `id=eq.${taskId}`);
      if (error) throw error;
      await loadAllData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [loadAllData]);

  // Funciones para categorías
  const createCategory = useCallback(async (department, name) => {
    try {
      const { data, error } = await supabase.insert('categories', { department, name });
      if (error) throw error;
      await loadAllData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [loadAllData]);

  const deleteCategoryFromDB = useCallback(async (department, name) => {
    try {
      const { data, error } = await supabase.delete('categories', `department=eq.${department}&name=eq.${name}`);
      if (error) throw error;
      await loadAllData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [loadAllData]);

  // Funciones para días justificados
  const createJustifiedDay = useCallback(async (justificationData) => {
    try {
      const { data, error } = await supabase.insert('justified_days', justificationData);
      if (error) throw error;
      await loadAllData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [loadAllData]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return {
    users,
    tasks,
    categories,
    diasJustificados,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    createTask,
    updateTask,
    deleteTask,
    createCategory,
    deleteCategoryFromDB,
    createJustifiedDay,
    loadAllData
  };
};

// Componente Input optimizado para evitar pérdida de foco
const OptimizedInput = memo(({ value, onChange, placeholder, type = 'text', className = '', ...props }) => {
  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
});

// Componente Select optimizado
const OptimizedSelect = memo(({ value, onChange, children, className = '', ...props }) => {
  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <select
      value={value}
      onChange={handleChange}
      className={className}
      {...props}
    >
      {children}
    </select>
  );
});

// Componente de Loading
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
      <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock className="text-white text-2xl animate-spin" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">TimeTracker Pro</h1>
      <p className="text-gray-600">Cargando aplicación...</p>
      <div className="mt-4">
        <div className="animate-pulse bg-gray-200 h-2 rounded-full"></div>
      </div>
    </div>
  </div>
);

// Componente Error
const ErrorDisplay = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
      <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="text-white text-2xl" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
      >
        Reintentar
      </button>
    </div>
  </div>
);

// Componente Login
const Login = memo(({ onLogin, loginError, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayError = loginError || error;

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (username.length === 0 || password.length === 0) {
      setError('Por favor, complete todos los campos');
      setLoading(false);
      return;
    }
    
    try {
      await onLogin(username, password);
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }, [username, password, onLogin]);

  const handleUsernameChange = useCallback((value) => {
    setUsername(value);
    if (displayError) setError('');
  }, [displayError]);

  const handlePasswordChange = useCallback((value) => {
    setPassword(value);
    if (displayError) setError('');
  }, [displayError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">TimeTracker Pro</h1>
          <p className="text-gray-600 mt-2">Gestión de tiempo laboral</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
            <OptimizedInput
              value={username}
              onChange={handleUsernameChange}
              placeholder="Ingrese su usuario"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              autoComplete="username"
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <div className="relative">
              <OptimizedInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Ingrese su contraseña"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                autoComplete="current-password"
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertTriangle className="mr-2 text-red-600" size={20} />
              <div>
                <p className="font-medium">Error de acceso</p>
                <p className="text-sm">{displayError}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Usuarios de prueba:</p>
          <div className="text-xs space-y-1">
            <div>• juan / abc123</div>
            <div>• maria / def456</div>
            <div>• carlos / demo123</div>
            <div>• admin / admin1</div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Componente Temporizador
const Timer = memo(({ task, onUpdate, isActive, onToggle }) => {
  const [seconds, setSeconds] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSeconds(prev => {
        const newSeconds = prev + 1;
        const totalMinutes = Math.floor(newSeconds / 60);
        
        // Solo actualizar cada 30 minutos (0.5 horas)
        if (totalMinutes > 0 && totalMinutes % 30 === 0 && totalMinutes !== lastUpdateTime) {
          const hours = newSeconds / 3600;
          onUpdate(task.id, hours);
          setLastUpdateTime(totalMinutes);
        }
        
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, task.id, onUpdate, lastUpdateTime]);

  const handleToggle = useCallback(() => {
    if (isActive) {
      // Al pausar, actualizar inmediatamente las horas
      const hours = seconds / 3600;
      onUpdate(task.id, hours);
    }
    onToggle(task.id);
  }, [isActive, seconds, task.id, onUpdate, onToggle]);

  const formatTime = useCallback((totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div className="flex items-center space-x-3">
      <div className={`font-mono text-lg font-bold ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
        {formatTime(seconds)}
      </div>
      <button
        onClick={handleToggle}
        className={`p-2 rounded-full transition-colors ${
          isActive 
            ? 'bg-red-100 hover:bg-red-200 text-red-600' 
            : 'bg-green-100 hover:bg-green-200 text-green-600'
        }`}
      >
        {isActive ? <Pause size={16} /> : <Play size={16} />}
      </button>
    </div>
  );
});

// Componente Avisos para empleados
const AvisosEmpleado = memo(({ user, tasks, diasJustificados, createJustifiedDay }) => {
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    const calcularAvisos = () => {
      const avisosEncontrados = [];
      
      // Generar fechas de los últimos 15 días
      const fechas = [];
      for (let i = 1; i < 15; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        fechas.push(fecha.toISOString().split('T')[0]);
      }

      fechas.forEach(fecha => {
        // Excluir sábados y domingos
        const fechaObj = new Date(fecha + 'T00:00:00');
        const diaSemana = fechaObj.getDay();
        if (diaSemana === 0 || diaSemana === 6) return;

        // Calcular horas trabajadas en esta fecha
        const tareasDelDia = tasks.filter(task => 
          task.user_id === user.id && task.date === fecha
        );
        
        const horasRegistradas = tareasDelDia.reduce((sum, task) => sum + task.hours, 0);
        const horasObjetivo = user.horas_objetivo || 8;
        const horasFaltantes = horasObjetivo - horasRegistradas;

        // Crear aviso si faltan horas
        if (horasFaltantes > 0) {
          avisosEncontrados.push({
            id: `${user.id}-${fecha}`,
            fecha: fecha,
            horasObjetivo: horasObjetivo,
            horasRegistradas: horasRegistradas,
            horasFaltantes: horasFaltantes,
            tipo: horasRegistradas === 0 ? 'sin-registro' : 'incompleto',
            tareasExistentes: tareasDelDia.length
          });
        }
      });

      // Ordenar por fecha (más recientes primero)
      avisosEncontrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      setAvisos(avisosEncontrados);
    };

    calcularAvisos();
  }, [user, tasks]);

  const formatearFecha = (fecha) => {
    const date = new Date(fecha + 'T00:00:00');
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);
    
    const fechaStr = fecha;
    const hoyStr = hoy.toISOString().split('T')[0];
    const ayerStr = ayer.toISOString().split('T')[0];
    
    if (fechaStr === hoyStr) return 'Hoy';
    if (fechaStr === ayerStr) return 'Ayer';
    
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short'
    });
  };

  const getAvisoColor = (tipo) => {
    return tipo === 'sin-registro' 
      ? 'border-red-200 bg-red-50' 
      : 'border-orange-200 bg-orange-50';
  };

  const getAvisoIcon = (tipo) => {
    return tipo === 'sin-registro' 
      ? <AlertTriangle className="text-red-600" size={18} />
      : <Clock className="text-orange-600" size={18} />;
  };

  const justificarDia = useCallback(async (aviso) => {
    const justificationData = {
      empleado_id: user.id,
      fecha: aviso.fecha,
      motivo: 'Vacaciones o Festivo',
      fecha_justificacion: new Date().toISOString()
    };
    
    await createJustifiedDay(justificationData);
  }, [user.id, createJustifiedDay]);

  const avisosValidos = useMemo(() => {
    return avisos.filter(aviso => 
      !diasJustificados.some(justif => 
        justif.empleado_id === user.id && justif.fecha === aviso.fecha
      )
    );
  }, [avisos, diasJustificados, user.id]);

  if (avisosValidos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CheckCircle className="mr-2 text-green-600" size={20} />
          Avisos
        </h3>
        <div className="text-center py-4">
          <CheckCircle className="mx-auto mb-3 text-green-500" size={32} />
          <p className="text-green-600 font-medium">¡Excelente trabajo!</p>
          <p className="text-gray-600 text-sm">Tienes todos tus registros al día</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <AlertTriangle className="mr-2 text-orange-600" size={20} />
        Avisos
        <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
          {avisosValidos.length}
        </span>
      </h3>
      
      <div className="space-y-3">
        {avisosValidos.slice(0, 5).map(aviso => (
          <div key={aviso.id} className={`p-4 rounded-lg border-l-4 ${getAvisoColor(aviso.tipo)}`}>
            <div className="flex items-start space-x-3">
              {getAvisoIcon(aviso.tipo)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">
                    {formatearFecha(aviso.fecha)}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    aviso.tipo === 'sin-registro' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {aviso.tipo === 'sin-registro' ? 'Sin registro' : 'Incompleto'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Registrado:</span>
                    <div className="font-medium">{aviso.horasRegistradas}h de {aviso.horasObjetivo}h</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Faltan:</span>
                    <div className="font-bold text-red-600">{aviso.horasFaltantes.toFixed(1)}h</div>
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    onClick={() => justificarDia(aviso)}
                    className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-sm rounded-md transition-colors border border-blue-200"
                  >
                    🏖️ Marcar como "Vacaciones o Festivo"
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {avisosValidos.length > 5 && (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">
              ... y {avisosValidos.length - 5} avisos más. Completa estos primero.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

// Panel de empleado
const EmployeePanel = memo(({ 
  user, 
  categories, 
  tasks, 
  diasJustificados, 
  createTask, 
  updateTask, 
  deleteTask, 
  createCategory, 
  createJustifiedDay 
}) => {
  const [newTask, setNewTask] = useState({ 
    description: '', 
    category: '', 
    hours: '', 
    date: new Date().toISOString().split('T')[0] 
  });
  const [editingTask, setEditingTask] = useState(null);
  const [activeTimer, setActiveTimer] = useState(null);
  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState(null);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const userCategories = useMemo(() => categories[user.department] || [], [categories, user.department]);
  
  const todayTasks = useMemo(() => 
    tasks.filter(task => 
      task.user_id === user.id && 
      task.date === new Date().toISOString().split('T')[0]
    ), [tasks, user.id]
  );

  const totalHours = useMemo(() => 
    todayTasks.reduce((sum, task) => sum + task.hours, 0), 
    [todayTasks]
  );

  const calculateNextHorario = useCallback((hours, date) => {
    const tasksForDate = tasks.filter(task => 
      task.user_id === user.id && task.date === date
    );

    if (tasksForDate.length === 0) {
      const start = user.hora_inicio;
      const endTime = new Date(`2000-01-01T${start}`);
      endTime.setHours(endTime.getHours() + Math.floor(hours));
      endTime.setMinutes(endTime.getMinutes() + (hours % 1) * 60);
      return `${start}-${endTime.toTimeString().slice(0, 5)}`;
    }

    const lastTask = tasksForDate[tasksForDate.length - 1];
    const lastEndTime = lastTask.horario.split('-')[1];
    const startTime = new Date(`2000-01-01T${lastEndTime}`);
    startTime.setHours(startTime.getHours() + Math.floor(hours));
    startTime.setMinutes(startTime.getMinutes() + (hours % 1) * 60);
    return `${lastEndTime}-${startTime.toTimeString().slice(0, 5)}`;
  }, [tasks, user.id, user.hora_inicio]);

  const handleAddTask = useCallback(async () => {
    if (!newTask.description || !newTask.category || !newTask.hours || !newTask.date) return;

    const hours = parseFloat(newTask.hours);
    const taskData = {
      user_id: user.id,
      description: newTask.description,
      category: newTask.category,
      hours,
      date: newTask.date,
      horario: calculateNextHorario(hours, newTask.date)
    };

    const result = await createTask(taskData);
    if (result.success) {
      setNewTask({ 
        description: '', 
        category: '', 
        hours: '', 
        date: new Date().toISOString().split('T')[0] 
      });
    }
  }, [newTask, user.id, calculateNextHorario, createTask]);

  const handleEditTask = useCallback((task) => {
    setEditingTask({ ...task });
  }, []);

  const handleUpdateTask = useCallback(async () => {
    if (!editingTask.description || !editingTask.category || !editingTask.hours) return;

    const result = await updateTask(editingTask.id, {
      description: editingTask.description,
      category: editingTask.category,
      hours: editingTask.hours
    });
    
    if (result.success) {
      setEditingTask(null);
    }
  }, [editingTask, updateTask]);

  const handleDeleteTask = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setDeleteTaskConfirm(task);
  }, [tasks]);

  const confirmDeleteTask = useCallback(async () => {
    if (deleteTaskConfirm) {
      await deleteTask(deleteTaskConfirm.id);
      setDeleteTaskConfirm(null);
    }
  }, [deleteTaskConfirm, deleteTask]);

  const cancelDeleteTask = useCallback(() => {
    setDeleteTaskConfirm(null);
  }, []);

  const handleTimerUpdate = useCallback(async (taskId, hours) => {
    await updateTask(taskId, { hours });
  }, [updateTask]);

  const handleTimerToggle = useCallback((taskId) => {
    setActiveTimer(prev => prev === taskId ? null : taskId);
  }, []);

  const handleCreateCategory = useCallback(async () => {
    const trimmedName = newCategoryName.trim();
    
    if (!trimmedName) return;
    
    const result = await createCategory(user.department, trimmedName);
    if (result.success) {
      setNewTask(prev => ({ ...prev, category: trimmedName }));
      setNewCategoryName('');
      setShowNewCategoryModal(false);
    }
  }, [newCategoryName, user.department, createCategory]);

  return (
    <div className="space-y-6">
      {/* Información del Empleado */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <User className="mr-2" size={20} />
          {user.name}
        </h3>
        <div className="flex items-center text-sm">
          <Building className="mr-2 text-gray-500" size={16} />
          <span className="text-gray-600">Departamento:</span>
          <span className="ml-2 font-medium text-gray-800">{user.department}</span>
        </div>
      </div>

      {/* Formulario nueva tarea */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Plus className="mr-2" size={20} />
          Nueva Tarea
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <OptimizedInput
                value={newTask.description}
                onChange={(value) => setNewTask(prev => ({ ...prev, description: value }))}
                placeholder="Descripción de la tarea"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <OptimizedSelect
                value={newTask.category}
                onChange={(value) => {
                  if (value === '__create_new__') {
                    setShowNewCategoryModal(true);
                  } else {
                    setNewTask(prev => ({ ...prev, category: value }));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar categoría</option>
                {userCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__create_new__" className="bg-blue-50 text-blue-700 font-medium">
                  ➕ Crear nueva categoría
                </option>
              </OptimizedSelect>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas</label>
              <OptimizedInput
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={newTask.hours}
                onChange={(value) => setNewTask(prev => ({ ...prev, hours: value }))}
                placeholder="Horas"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <OptimizedInput
                type="date"
                value={newTask.date}
                onChange={(value) => setNewTask(prev => ({ ...prev, date: value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <button
            onClick={handleAddTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Agregar Tarea
          </button>
        </div>
      </div>

      {/* Resumen del día */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="mr-2" size={20} />
          Resumen del Día
        </h3>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.min(((totalHours / user.horas_objetivo) * 100), 100).toFixed(1)}%
            </div>
            <div className="text-gray-600 text-sm">Jornada completada</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                totalHours >= user.horas_objetivo ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min((totalHours / user.horas_objetivo) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lista de tareas */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="mr-2" size={20} />
          Tareas del Día
        </h3>
        {todayTasks.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No hay tareas registradas para hoy</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tarea</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Categoría</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Horas</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Horario</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Temporizador</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {todayTasks.map(task => (
                  <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {editingTask?.id === task.id ? (
                        <OptimizedInput
                          value={editingTask.description}
                          onChange={(value) => setEditingTask(prev => ({ ...prev, description: value }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-sm">{task.description}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingTask?.id === task.id ? (
                        <OptimizedSelect
                          value={editingTask.category}
                          onChange={(value) => setEditingTask(prev => ({ ...prev, category: value }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {userCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </OptimizedSelect>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.category === 'SEO' ? 'bg-blue-100 text-blue-800' :
                          task.category === 'SEM' ? 'bg-green-100 text-green-800' :
                          task.category === 'Redes Sociales' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.category}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingTask?.id === task.id ? (
                        <OptimizedInput
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="12"
                          value={editingTask.hours}
                          onChange={(value) => setEditingTask(prev => ({ ...prev, hours: parseFloat(value) }))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-sm font-medium">{task.hours}h</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{task.horario}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Timer
                        task={task}
                        onUpdate={handleTimerUpdate}
                        isActive={activeTimer === task.id}
                        onToggle={handleTimerToggle}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {editingTask?.id === task.id ? (
                          <>
                            <button
                              onClick={handleUpdateTask}
                              className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => setEditingTask(null)}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditTask(task)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Avisos del empleado */}
      <AvisosEmpleado 
        user={user} 
        tasks={tasks} 
        diasJustificados={diasJustificados}
        createJustifiedDay={createJustifiedDay}
      />

      {/* Modal para crear nueva categoría */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <Plus className="text-blue-600 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Crear Nueva Categoría</h3>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la categoría
              </label>
              <OptimizedInput
                value={newCategoryName}
                onChange={(value) => setNewCategoryName(value)}
                placeholder="Ej: Email Marketing, Diseño Web..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Se agregará a tu departamento: <strong>{user.department}</strong>
              </p>
            </div>

            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  setShowNewCategoryModal(false);
                  setNewCategoryName('');
                }}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors duration-200"
              >
                Crear Categoría
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación de tarea */}
      {deleteTaskConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-600 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Confirmar Eliminación</h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Está seguro de que desea eliminar la tarea <strong>{deleteTaskConfirm.description}</strong>? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelDeleteTask}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteTask}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Panel de administrador simplificado para la gestión básica
const AdminPanel = memo(({ 
  users, 
  tasks, 
  categories, 
  diasJustificados,
  createUser,
  updateUser,
  deleteUser,
  createCategory,
  deleteCategoryFromDB 
}) => {
  const [activeTab, setActiveTab] = useState('users');

  const UserManagement = () => {
    const [newUser, setNewUser] = useState({
      name: '', username: '', password: '', email: '', 
      department: '', horas_objetivo: 8, hora_inicio: '09:00'
    });
    const [showNewUserForm, setShowNewUserForm] = useState(false);

    const handleAddUser = async () => {
      if (!newUser.name || !newUser.username || !newUser.password || !newUser.email || !newUser.department) {
        alert('Por favor, complete todos los campos obligatorios');
        return;
      }
      
      if (users.some(u => u.username === newUser.username)) {
        alert('El nombre de usuario ya existe');
        return;
      }

      const result = await createUser({
        ...newUser,
        horas_objetivo: parseFloat(newUser.horas_objetivo)
      });

      if (result.success) {
        setNewUser({
          name: '', username: '', password: '', email: '', 
          department: '', horas_objetivo: 8, hora_inicio: '09:00'
        });
        setShowNewUserForm(false);
      }
    };

    const handleDeleteUser = async (userId) => {
      const user = users.find(u => u.id === userId);
      if (user?.username === 'admin') {
        alert('No se puede eliminar el usuario administrador');
        return;
      }
      
      if (window.confirm(`¿Está seguro de eliminar al usuario ${user?.name}?`)) {
        await deleteUser(userId);
      }
    };

    const nonAdminUsers = users.filter(u => u.role !== 'admin');

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
          <button
            onClick={() => setShowNewUserForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200"
          >
            <Plus className="mr-2" size={16} />
            Nuevo Usuario
          </button>
        </div>

        {showNewUserForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Crear Nuevo Usuario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <OptimizedInput
                value={newUser.name}
                onChange={(value) => setNewUser(prev => ({ ...prev, name: value }))}
                placeholder="Nombre completo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <OptimizedInput
                value={newUser.username}
                onChange={(value) => setNewUser(prev => ({ ...prev, username: value }))}
                placeholder="Usuario"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <OptimizedInput
                type="password"
                value={newUser.password}
                onChange={(value) => setNewUser(prev => ({ ...prev, password: value }))}
                placeholder="Contraseña"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <OptimizedInput
                type="email"
                value={newUser.email}
                onChange={(value) => setNewUser(prev => ({ ...prev, email: value }))}
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <OptimizedSelect
                value={newUser.department}
                onChange={(value) => setNewUser(prev => ({ ...prev, department: value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccionar departamento</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </OptimizedSelect>
              <OptimizedInput
                type="number"
                step="0.5"
                value={newUser.horas_objetivo}
                onChange={(value) => setNewUser(prev => ({ ...prev, horas_objetivo: value }))}
                placeholder="Horas objetivo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleAddUser}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Crear Usuario
              </button>
              <button
                onClick={() => setShowNewUserForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nonAdminUsers.map(user => (
            <div key={user.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-4">
                <h4 className="font-semibold text-lg">{user.name}</h4>
                <p className="text-gray-600">@{user.username}</p>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div><span className="text-gray-600">Email:</span> {user.email}</div>
                <div><span className="text-gray-600">Departamento:</span> {user.department}</div>
                <div><span className="text-gray-600">Horas objetivo:</span> {user.horas_objetivo}h</div>
              </div>
              <button
                onClick={() => handleDeleteUser(user.id)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md text-sm"
              >
                Eliminar Usuario
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CategoryManagement = () => {
    const [newCategory, setNewCategory] = useState({ department: '', name: '' });

    const handleAddCategory = async () => {
      if (!newCategory.department || !newCategory.name.trim()) {
        alert('Por favor, complete todos los campos');
        return;
      }

      const result = await createCategory(newCategory.department, newCategory.name.trim());
      if (result.success) {
        setNewCategory({ department: '', name: '' });
      }
    };

    const handleDeleteCategory = async (department, categoryName) => {
      if (window.confirm(`¿Eliminar la categoría "${categoryName}"?`)) {
        await deleteCategoryFromDB(department, categoryName);
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Gestión de Categorías</h2>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Agregar Nueva Categoría</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <OptimizedSelect
              value={newCategory.department}
              onChange={(value) => setNewCategory(prev => ({ ...prev, department: value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Seleccionar departamento</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </OptimizedSelect>
            <OptimizedInput
              value={newCategory.name}
              onChange={(value) => setNewCategory(prev => ({ ...prev, name: value }))}
              placeholder="Nombre de la categoría"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Agregar Categoría
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map(dept => (
            <div key={dept} className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="font-semibold text-lg mb-4">{dept}</h4>
              <div className="space-y-2">
                {(categories[dept] || []).map(category => (
                  <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{category}</span>
                    <button
                      onClick={() => handleDeleteCategory(dept, category)}
                      className="text-red-600 hover:bg-red-100 p-1 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {(!categories[dept] || categories[dept].length === 0) && (
                  <p className="text-gray-500 text-sm">No hay categorías</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex">
      {/* Sidebar Admin */}
      <div className="w-64 bg-white rounded-lg shadow-sm border h-fit mr-8">
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors duration-200 flex items-center ${
                  activeTab === 'users' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="mr-3" size={20} />
                Gestión de Usuarios
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors duration-200 flex items-center ${
                  activeTab === 'categories' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="mr-3" size={20} />
                Categorías
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Contenido Admin */}
      <div className="flex-1">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
      </div>
    </div>
  );
});

// Componente principal
const App = () => {
  const {
    users,
    tasks,
    categories,
    diasJustificados,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    createTask,
    updateTask,
    deleteTask,
    createCategory,
    deleteCategoryFromDB,
    createJustifiedDay,
    loadAllData
  } = useSupabaseData();

  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState('');

  const handleLogin = useCallback((username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setLoginError('');
      return true;
    } else {
      setLoginError('Usuario o contraseña incorrectos');
      return false;
    }
  }, [users]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={loadAllData} />;
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} loginError={loginError} users={users} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                <Clock className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">TimeTracker Pro</h1>
              <span className="ml-4 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                🌐 Online
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Hola, {currentUser.name}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdmin ? (
          <AdminPanel 
            users={users}
            tasks={tasks}
            categories={categories}
            diasJustificados={diasJustificados}
            createUser={createUser}
            updateUser={updateUser}
            deleteUser={deleteUser}
            createCategory={createCategory}
            deleteCategoryFromDB={deleteCategoryFromDB}
          />
        ) : (
          <EmployeePanel 
            user={currentUser} 
            categories={categories} 
            tasks={tasks} 
            diasJustificados={diasJustificados}
            createTask={createTask}
            updateTask={updateTask}
            deleteTask={deleteTask}
            createCategory={createCategory}
            createJustifiedDay={createJustifiedDay}
          />
        )}
      </div>
    </div>
  );
};

export default App;