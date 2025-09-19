import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Users, Clock, BarChart3, Settings, Plus, Edit2, Trash2, Play, Pause, CheckCircle, AlertTriangle, TrendingUp, Eye, EyeOff, User, Building, Calendar, Target, Activity, AlertCircle, FileText, Send, Save, X, Filter, Search } from 'lucide-react';

// CONFIGURACIÓN DE SUPABASE - CAMBIAR POR TUS CREDENCIALES
const SUPABASE_URL = 'https://enpgabqnvggkzlqjhkfc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pdnB5eWlua2NkdHVxc3RxbXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODM1MTksImV4cCI6MjA3Mzg1OTUxOX0.UiPjNnSdTd-UaYrj2f8iFexkDKSj7KY5Oy94G_qH5M8';

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
      headers: {
        ...this.headers,
        'Prefer': 'return=representation'
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      const hasContent = response.headers.get('content-length') !== '0';
      
      let data = null;
      if (contentType?.includes('application/json') && hasContent) {
        const text = await response.text();
        if (text.trim()) {
          data = JSON.parse(text);
        }
      }
      
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

// Hook principal para manejo de datos
const useSupabaseData = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState({});
  const [diasJustificados, setDiasJustificados] = useState([]);
  const [alertasArchivadas, setAlertasArchivadas] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todos los datos
  const loadAllData = useCallback(async () => {
    try {
      const [usersRes, tasksRes, categoriesRes, justifiedRes, archivedRes, assignedRes] = await Promise.all([
        supabase.select('users'),
        supabase.select('tasks'),
        supabase.select('categories'),
        supabase.select('justified_days'),
        supabase.select('archived_alerts'),
        supabase.select('assigned_tasks')
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (tasksRes.data) setTasks(tasksRes.data);
      if (justifiedRes.data) setDiasJustificados(justifiedRes.data);
      if (archivedRes.data) setAlertasArchivadas(archivedRes.data);
      if (assignedRes.data) setAssignedTasks(assignedRes.data);

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

  // Funciones para alertas archivadas
  const archivarAlerta = useCallback(async (alerta, archivedBy = 'admin') => {
    try {
      const alertData = {
        alert_id: alerta.id,
        empleado_id: alerta.empleadoId,
        empleado_name: alerta.empleado,
        fecha: alerta.fecha,
        tipo: alerta.tipo,
        horas_objetivo: alerta.horasObjetivo,
        horas_registradas: alerta.horasRegistradas,
        horas_faltantes: alerta.horasFaltantes,
        departamento: alerta.departamento,
        archived_by: archivedBy
      };

      const { data, error } = await supabase.insert('archived_alerts', alertData);
      if (error) throw error;
      
      await loadAllData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [loadAllData]);

  const restaurarAlerta = useCallback(async (alertId) => {
    try {
      const { data, error } = await supabase.delete('archived_alerts', `alert_id=eq.${alertId}`);
      if (error) throw error;
      
      await loadAllData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [loadAllData]);

  // Funciones para tareas asignadas
  const createAssignedTask = useCallback(async (taskData) => {
    try {
      const { data, error } = await supabase.insert('assigned_tasks', taskData);
      if (error) throw error;
      await loadAllData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [loadAllData]);

  const updateAssignedTask = useCallback(async (taskId, taskData) => {
    try {
      const { data, error } = await supabase.update('assigned_tasks', taskData, `id=eq.${taskId}`);
      if (error) throw error;
      await loadAllData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [loadAllData]);

  const completeAssignedTask = useCallback(async (taskId) => {
    try {
      const { data, error } = await supabase.update('assigned_tasks', {
        status: 'completed',
        completed_at: new Date().toISOString()
      }, `id=eq.${taskId}`);
      if (error) throw error;
      await loadAllData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [loadAllData]);

  useEffect(() => {
    loadAllData().finally(() => setLoading(false));
  }, [loadAllData]);

  return {
    users,
    tasks,
    categories,
    diasJustificados,
    alertasArchivadas,
    assignedTasks,
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
    archivarAlerta,
    restaurarAlerta,
    createAssignedTask,
    updateAssignedTask,
    completeAssignedTask,
    loadAllData
  };
};

// Componente Input optimizado
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
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Error de Configuración</h1>
      <p className="text-gray-600 mb-4">{error}</p>
      <div className="bg-yellow-50 p-4 rounded-lg mb-4 text-left">
        <p className="text-sm text-gray-700 mb-2"><strong>Para configurar la aplicación:</strong></p>
        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
          <li>Ve a tu proyecto en Supabase</li>
          <li>Copia la URL del proyecto</li>
          <li>Copia la clave anon key</li>
          <li>Reemplaza las constantes en el código</li>
        </ol>
      </div>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
            <OptimizedInput
              value={username}
              onChange={setUsername}
              placeholder="Ingrese su usuario"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <div className="relative">
              <OptimizedInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                placeholder="Ingrese su contraseña"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                autoComplete="current-password"
                disabled={loading}
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
            type="submit"
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
        </form>

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

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const handleToggle = useCallback(() => {
    if (isActive) {
      const hours = seconds / 3600;
      onUpdate(task.id, parseFloat((task.hours + hours).toFixed(2)));
      setSeconds(0);
    }
    onToggle(task.id);
  }, [isActive, seconds, task.id, task.hours, onUpdate, onToggle]);

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

// Componente para tareas asignadas del empleado
const AssignedTasks = memo(({ user, assignedTasks, completeAssignedTask }) => {
  const userAssignedTasks = useMemo(() => 
    assignedTasks.filter(task => task.assigned_to === user.id && task.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { urgente: 4, alta: 3, normal: 2, baja: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.due_date) - new Date(b.due_date);
      }),
    [assignedTasks, user.id]
  );

  const handleCompleteTask = useCallback(async (taskId) => {
    await completeAssignedTask(taskId);
  }, [completeAssignedTask]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgente': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'baja': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha límite';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  if (userAssignedTasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="mr-2" size={20} />
          Tareas Asignadas
        </h3>
        <div className="text-center py-4">
          <CheckCircle className="mx-auto mb-3 text-green-500" size={32} />
          <p className="text-green-600 font-medium">¡Excelente!</p>
          <p className="text-gray-600 text-sm">No tienes tareas pendientes asignadas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FileText className="mr-2" size={20} />
        Tareas Asignadas
        <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
          {userAssignedTasks.length}
        </span>
      </h3>
      
      <div className="space-y-3">
        {userAssignedTasks.map(task => (
          <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                )}
                <div className="flex items-center space-x-3 text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full border font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority === 'urgente' ? '🔥 Urgente' :
                     task.priority === 'alta' ? '⚡ Alta' :
                     task.priority === 'normal' ? '📝 Normal' : '📋 Baja'}
                  </span>
                  {task.category && (
                    <span className="text-gray-500">
                      📂 {task.category}
                    </span>
                  )}
                  <span className="text-gray-500">
                    📅 {formatDate(task.due_date)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleCompleteTask(task.id)}
                className="ml-4 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center"
                title="Marcar como completada"
              >
                <CheckCircle size={16} className="mr-1" />
                Completar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Componente Avisos para empleados
const AvisosEmpleado = memo(({ user, tasks, diasJustificados, createJustifiedDay }) => {
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    const calcularAvisos = () => {
      const avisosEncontrados = [];
      
      for (let i = 1; i < 15; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toISOString().split('T')[0];

        const diaSemana = fecha.getDay();
        if (diaSemana === 0 || diaSemana === 6) continue;

        const tareasDelDia = tasks.filter(task => 
          task.user_id === user.id && task.date === fechaStr
        );
        
        const horasRegistradas = tareasDelDia.reduce((sum, task) => sum + task.hours, 0);
        const horasObjetivo = user.horas_objetivo || 8;
        const horasFaltantes = horasObjetivo - horasRegistradas;

        if (horasFaltantes > 0) {
          avisosEncontrados.push({
            id: `${user.id}-${fechaStr}`,
            fecha: fechaStr,
            horasObjetivo: horasObjetivo,
            horasRegistradas: horasRegistradas,
            horasFaltantes: horasFaltantes,
            tipo: horasRegistradas === 0 ? 'sin-registro' : 'incompleto'
          });
        }
      }

      avisosEncontrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setAvisos(avisosEncontrados);
    };

    calcularAvisos();
  }, [user, tasks]);

  const formatearFecha = (fecha) => {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short'
    });
  };

  const justificarDia = useCallback(async (aviso) => {
    await createJustifiedDay({
      empleado_id: user.id,
      fecha: aviso.fecha,
      motivo: 'Vacaciones o Festivo',
      fecha_justificacion: new Date().toISOString()
    });
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
          <div key={aviso.id} className={`p-4 rounded-lg border-l-4 ${
            aviso.tipo === 'sin-registro' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'
          }`}>
            <div className="flex items-start space-x-3">
              {aviso.tipo === 'sin-registro' ? 
                <AlertTriangle className="text-red-600" size={18} /> :
                <Clock className="text-orange-600" size={18} />
              }
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">
                    {formatearFecha(aviso.fecha)}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    aviso.tipo === 'sin-registro' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {aviso.tipo === 'sin-registro' ? 'Sin registro' : 'Incompleto'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Registrado:</span>
                    <div className="font-medium">{aviso.horasRegistradas}h de {aviso.horasObjetivo}h</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Faltan:</span>
                    <div className="font-bold text-red-600">{aviso.horasFaltantes.toFixed(1)}h</div>
                  </div>
                </div>

                <button
                  onClick={() => justificarDia(aviso)}
                  className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-sm rounded-md transition-colors border border-blue-200"
                >
                  🏖️ Marcar como "Vacaciones o Festivo"
                </button>
              </div>
            </div>
          </div>
        ))}
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
  assignedTasks,
  createTask, 
  updateTask, 
  deleteTask, 
  createCategory, 
  createJustifiedDay,
  completeAssignedTask
}) => {
  const [newTask, setNewTask] = useState({ 
    description: '', 
    category: '', 
    hours: '', 
    date: new Date().toISOString().split('T')[0] 
  });
  const [editingTask, setEditingTask] = useState(null);
  const [activeTimer, setActiveTimer] = useState(null);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [taskError, setTaskError] = useState('');
  const [taskSuccess, setTaskSuccess] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

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
      const start = user.hora_inicio || '09:00';
      const startTime = new Date(`2000-01-01T${start}:00`);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + Math.floor(hours));
      endTime.setMinutes(endTime.getMinutes() + (hours % 1) * 60);
      return `${start}-${endTime.toTimeString().slice(0, 5)}`;
    }

    const sortedTasks = tasksForDate.sort((a, b) => a.id - b.id);
    const lastTask = sortedTasks[sortedTasks.length - 1];
    const lastEndTime = lastTask.horario ? lastTask.horario.split('-')[1] : '09:00';
    
    const startTime = new Date(`2000-01-01T${lastEndTime}:00`);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + Math.floor(hours));
    endTime.setMinutes(endTime.getMinutes() + (hours % 1) * 60);
    
    return `${lastEndTime}-${endTime.toTimeString().slice(0, 5)}`;
  }, [tasks, user.id, user.hora_inicio]);

  const handleAddTask = useCallback(async () => {
    setTaskError('');
    setTaskSuccess('');
    setIsCreatingTask(true);

    try {
      if (!newTask.description.trim()) {
        setTaskError('La descripción de la tarea es obligatoria');
        return;
      }
      
      if (!newTask.category) {
        setTaskError('Debe seleccionar una categoría');
        return;
      }
      
      if (!newTask.hours || isNaN(newTask.hours) || parseFloat(newTask.hours) <= 0) {
        setTaskError('Las horas deben ser un número válido mayor a 0');
        return;
      }

      const hours = parseFloat(newTask.hours);
      
      if (hours > 12) {
        setTaskError('No se pueden registrar más de 12 horas para una tarea');
        return;
      }

      const taskData = {
        user_id: user.id,
        description: newTask.description.trim(),
        category: newTask.category,
        hours: hours,
        date: newTask.date,
        horario: calculateNextHorario(hours, newTask.date)
      };

      const result = await createTask(taskData);
      
      if (result.success) {
        setTaskSuccess(`Tarea "${newTask.description.trim()}" creada exitosamente`);
        setNewTask({ 
          description: '', 
          category: '', 
          hours: '', 
          date: new Date().toISOString().split('T')[0] 
        });
        setTimeout(() => setTaskSuccess(''), 3000);
      } else {
        setTaskError(`Error al crear la tarea: ${result.error}`);
      }
    } catch (error) {
      setTaskError('Error inesperado al crear la tarea');
    } finally {
      setIsCreatingTask(false);
    }
  }, [newTask, user.id, calculateNextHorario, createTask]);

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

      {/* Tareas asignadas */}
      <AssignedTasks 
        user={user}
        assignedTasks={assignedTasks}
        completeAssignedTask={completeAssignedTask}
      />

      {/* Formulario nueva tarea */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Plus className="mr-2" size={20} />
          Nueva Tarea
        </h3>

        {taskError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="mr-2" size={16} />
              <span className="font-medium">Error:</span>
            </div>
            <p className="text-sm mt-1">{taskError}</p>
          </div>
        )}
        
        {taskSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="mr-2" size={16} />
              <span className="font-medium">Éxito:</span>
            </div>
            <p className="text-sm mt-1">{taskSuccess}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-red-500">*</span>
              </label>
              <OptimizedInput
                value={newTask.description}
                onChange={(value) => {
                  setNewTask(prev => ({ ...prev, description: value }));
                  setTaskError('');
                }}
                placeholder="Descripción de la tarea"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isCreatingTask}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <OptimizedSelect
                value={newTask.category}
                onChange={(value) => {
                  if (value === '__create_new__') {
                    setShowNewCategoryModal(true);
                  } else {
                    setNewTask(prev => ({ ...prev, category: value }));
                    setTaskError('');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isCreatingTask}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horas <span className="text-red-500">*</span>
              </label>
              <OptimizedInput
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={newTask.hours}
                onChange={(value) => {
                  setNewTask(prev => ({ ...prev, hours: value }));
                  setTaskError('');
                }}
                placeholder="Ej: 2.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isCreatingTask}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <OptimizedInput
                type="date"
                value={newTask.date}
                onChange={(value) => {
                  setNewTask(prev => ({ ...prev, date: value }));
                  setTaskError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isCreatingTask}
              />
            </div>
          </div>
          <button
            onClick={handleAddTask}
            disabled={isCreatingTask || !newTask.description.trim() || !newTask.category || !newTask.hours || !newTask.date}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md transition-colors duration-200 flex items-center"
          >
            {isCreatingTask ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando tarea...
              </>
            ) : (
              <>
                <Plus className="mr-2" size={16} />
                Agregar Tarea
              </>
            )}
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
          <div className="text-center text-sm text-gray-600">
            {totalHours.toFixed(1)}h / {user.horas_objetivo}h registradas
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
          <div className="text-center py-8">
            <Clock className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600">No hay tareas registradas para hoy</p>
            <p className="text-gray-500 text-sm mt-2">Comienza agregando tu primera tarea arriba</p>
          </div>
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
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.category === 'SEO' ? 'bg-blue-100 text-blue-800' :
                        task.category === 'SEM' ? 'bg-green-100 text-green-800' :
                        task.category === 'Redes Sociales' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium">{task.hours}h</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{task.horario}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Timer
                        task={task}
                        onUpdate={updateTask}
                        isActive={activeTimer === task.id}
                        onToggle={(taskId) => setActiveTimer(prev => prev === taskId ? null : taskId)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {editingTask?.id === task.id ? (
                          <>
                            <button
                              onClick={async () => {
                                if (editingTask.description && editingTask.category && editingTask.hours) {
                                  await updateTask(editingTask.id, {
                                    description: editingTask.description,
                                    category: editingTask.category,
                                    hours: editingTask.hours
                                  });
                                  setEditingTask(null);
                                }
                              }}
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
                              onClick={() => setEditingTask({ ...task })}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Eliminar la tarea "${task.description}"?`)) {
                                  deleteTask(task.id);
                                }
                              }}
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
                onChange={setNewCategoryName}
                placeholder="Ej: Email Marketing, Diseño Web..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
    </div>
  );
});

// Componente para gestión de alertas de usuarios
const AlertManagement = memo(({ 
  users, 
  tasks, 
  diasJustificados, 
  alertasArchivadas,
  archivarAlerta,
  restaurarAlerta
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const departments = useMemo(() => 
    [...new Set(users.filter(u => u.role !== 'admin').map(u => u.department))],
    [users]
  );

  const generateActiveAlerts = useMemo(() => {
    const alerts = [];
    
    users.filter(u => u.role !== 'admin').forEach(user => {
      for (let i = 1; i < 30; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toISOString().split('T')[0];

        const diaSemana = fecha.getDay();
        if (diaSemana === 0 || diaSemana === 6) continue;

        const tareasDelDia = tasks.filter(task => 
          task.user_id === user.id && task.date === fechaStr
        );
        
        const horasRegistradas = tareasDelDia.reduce((sum, task) => sum + task.hours, 0);
        const horasObjetivo = user.horas_objetivo || 8;
        const horasFaltantes = horasObjetivo - horasRegistradas;

        if (horasFaltantes > 0) {
          const isJustified = diasJustificados.some(justif => 
            justif.empleado_id === user.id && justif.fecha === fechaStr
          );
          
          const isArchived = alertasArchivadas.some(archived => 
            archived.empleado_id === user.id && archived.fecha === fechaStr
          );

          if (!isJustified && !isArchived) {
            alerts.push({
              id: `${user.id}-${fechaStr}`,
              empleadoId: user.id,
              empleado: user.name,
              fecha: fechaStr,
              horasObjetivo: horasObjetivo,
              horasRegistradas: horasRegistradas,
              horasFaltantes: horasFaltantes,
              departamento: user.department,
              tipo: horasRegistradas === 0 ? 'sin-registro' : 'incompleto'
            });
          }
        }
      }
    });

    return alerts.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [users, tasks, diasJustificados, alertasArchivadas]);

  const filteredActiveAlerts = useMemo(() => {
    return generateActiveAlerts.filter(alert => {
      const matchesSearch = searchTerm === '' || 
        alert.empleado.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = selectedDepartment === '' || 
        alert.departamento === selectedDepartment;
      
      const matchesDateRange = (!dateRange.start || alert.fecha >= dateRange.start) &&
        (!dateRange.end || alert.fecha <= dateRange.end);
      
      return matchesSearch && matchesDepartment && matchesDateRange;
    });
  }, [generateActiveAlerts, searchTerm, selectedDepartment, dateRange]);

  const filteredArchivedAlerts = useMemo(() => {
    return alertasArchivadas.filter(alert => {
      const matchesSearch = searchTerm === '' || 
        alert.empleado_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = selectedDepartment === '' || 
        alert.departamento === selectedDepartment;
      
      const matchesDateRange = (!dateRange.start || alert.fecha >= dateRange.start) &&
        (!dateRange.end || alert.fecha <= dateRange.end);
      
      return matchesSearch && matchesDepartment && matchesDateRange;
    });
  }, [alertasArchivadas, searchTerm, selectedDepartment, dateRange]);

  const formatearFecha = (fecha) => {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestión de Alertas</h2>
        <div className="text-sm text-gray-600">
          {filteredActiveAlerts.length} alertas activas | {filteredArchivedAlerts.length} archivadas
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Filter className="mr-2" size={20} />
          Filtros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar empleado</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <OptimizedInput
                value={searchTerm
