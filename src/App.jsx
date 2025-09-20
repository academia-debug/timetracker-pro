import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { 
  Clock, Users, BarChart3, Calendar, Plus, Edit, Trash2, 
  Play, Pause, CheckCircle, AlertTriangle, Archive,
  User, Building, Target, Save, X, Eye,
  Bell, Square, RotateCcw, FileText
} from 'lucide-react';

// Hook personalizado para manejo de datos (SIMULADO LOCALMENTE)
const useSupabaseData = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [diasJustificados, setDiasJustificados] = useState([]);
  const [alertasArchivadas, setAlertasArchivadas] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const departments = ['Marketing', 'Ventas', 'Atención al Cliente', 'Administración', 'Edición', 'Equipo Docente'];

  // Datos iniciales
  const initialUsers = [
    { id: 1, username: 'juan', password: 'abc123', name: 'Juan Pérez', email: 'juan@empresa.com', department: 'Marketing', horas_objetivo: 8, hora_inicio: '09:00', role: 'employee' },
    { id: 2, username: 'maria', password: 'def456', name: 'María García', email: 'maria@empresa.com', department: 'Ventas', horas_objetivo: 7.5, hora_inicio: '08:30', role: 'employee' },
    { id: 3, username: 'admin', password: 'admin1', name: 'Administrador', email: 'admin@empresa.com', department: 'Administración', horas_objetivo: 8, hora_inicio: '09:00', role: 'admin' },
    { id: 4, username: 'carlos', password: 'demo123', name: 'Carlos Martín', email: 'carlos@empresa.com', department: 'Marketing', horas_objetivo: 8, hora_inicio: '09:00', role: 'employee' }
  ];

  const initialCategories = [
    { id: 1, department: 'Marketing', name: 'SEO' },
    { id: 2, department: 'Marketing', name: 'SEM' },
    { id: 3, department: 'Marketing', name: 'Redes Sociales' },
    { id: 4, department: 'Marketing', name: 'Contenido' },
    { id: 5, department: 'Ventas', name: 'Prospección' },
    { id: 6, department: 'Ventas', name: 'Reuniones' },
    { id: 7, department: 'Ventas', name: 'Cierre' },
    { id: 8, department: 'Ventas', name: 'Seguimiento' },
    { id: 9, department: 'Atención al Cliente', name: 'Soporte' },
    { id: 10, department: 'Atención al Cliente', name: 'Reclamaciones' },
    { id: 11, department: 'Atención al Cliente', name: 'Consultas' },
    { id: 12, department: 'Administración', name: 'Finanzas' },
    { id: 13, department: 'Administración', name: 'RRHH' },
    { id: 14, department: 'Administración', name: 'Legal' },
    { id: 15, department: 'Edición', name: 'Diseño' },
    { id: 16, department: 'Edición', name: 'Redacción' },
    { id: 17, department: 'Edición', name: 'Revisión' },
    { id: 18, department: 'Equipo Docente', name: 'Clases' },
    { id: 19, department: 'Equipo Docente', name: 'Preparación' },
    { id: 20, department: 'Equipo Docente', name: 'Evaluación' }
  ];

  const initialTasks = [
    {
      id: 1,
      user_id: 4,
      description: 'Campaña SEM Q1',
      category: 'SEM',
      hours: 5.5,
      date: new Date().toISOString().split('T')[0],
      horario: '09:00-14:30'
    },
    {
      id: 2,
      user_id: 4,
      description: 'Análisis competencia',
      category: 'SEO',
      hours: 8,
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      horario: '09:00-17:00'
    },
    {
      id: 3,
      user_id: 4,
      description: 'Contenido blog',
      category: 'Contenido',
      hours: 10.5,
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      horario: '09:00-19:30'
    },
    {
      id: 4,
      user_id: 4,
      description: 'Estrategia redes',
      category: 'Redes Sociales',
      hours: 4.5,
      date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      horario: '09:00-13:30'
    }
  ];

  // Funciones CRUD
  const createUser = useCallback(async (userData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (users.find(u => u.username === userData.username)) {
        return { success: false, error: 'El username ya existe' };
      }
      
      if (users.find(u => u.email === userData.email)) {
        return { success: false, error: 'El email ya existe' };
      }

      const newUser = {
        ...userData,
        id: Math.max(...users.map(u => u.id), 0) + 1,
        role: userData.role || 'employee'
      };
      
      setUsers(prev => [...prev, newUser]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [users]);

  const updateUser = useCallback(async (userId, userData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const emailExists = users.find(u => u.email === userData.email && u.id !== userId);
      if (emailExists) {
        return { success: false, error: 'El email ya existe' };
      }

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      ));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [users]);

  const deleteUser = useCallback(async (userId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setUsers(prev => prev.filter(user => user.id !== userId));
      setTasks(prev => prev.filter(task => task.user_id !== userId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newTask = {
        ...taskData,
        id: Math.max(...tasks.map(t => t.id), 0) + 1
      };
      
      setTasks(prev => [...prev, newTask]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [tasks]);

  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...taskData } : task
      ));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const createCategory = useCallback(async (department, categoryName) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (categories.find(c => c.department === department && c.name === categoryName)) {
        return { success: false, error: 'La categoría ya existe en este departamento' };
      }

      const newCategory = {
        id: Math.max(...categories.map(c => c.id), 0) + 1,
        department,
        name: categoryName
      };
      
      setCategories(prev => [...prev, newCategory]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [categories]);

  const deleteCategory = useCallback(async (categoryId, categoryName) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const tasksWithCategory = tasks.filter(task => task.category === categoryName);
      if (tasksWithCategory.length > 0) {
        return { success: false, error: 'No se puede eliminar: hay tareas asociadas a esta categoría' };
      }

      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [tasks]);

  const generateAlerts = useCallback(async () => {
    try {
      const alerts = [];
      const today = new Date();
      
      for (let i = 1; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        users.forEach(user => {
          if (user.role === 'admin') return;
          
          const dayTasks = tasks.filter(task => 
            task.user_id === user.id && 
            task.date === dateStr
          );
          
          const totalHours = dayTasks.reduce((sum, task) => sum + parseFloat(task.hours), 0);
          const horasObjetivo = user.horas_objetivo || 8;
          const faltantes = horasObjetivo - totalHours;
          
          if (totalHours === 0) {
            alerts.push({
              alert_id: `${user.id}-${dateStr}-critico`,
              empleado_id: user.id,
              empleado_name: user.name,
              fecha: dateStr,
              tipo: 'sin_registros',
              severity: 'critico',
              horas_objetivo: horasObjetivo,
              horas_registradas: totalHours,
              horas_faltantes: faltantes,
              departamento: user.department,
              status: 'active'
            });
          } else if (faltantes >= 0.5) {
            let severity = 'leve';
            if (faltantes >= 4) severity = 'moderado';
            else if (faltantes >= 2) severity = 'moderado';
            
            alerts.push({
              alert_id: `${user.id}-${dateStr}-${severity}`,
              empleado_id: user.id,
              empleado_name: user.name,
              fecha: dateStr,
              tipo: 'jornada_incompleta',
              severity: severity,
              horas_objetivo: horasObjetivo,
              horas_registradas: totalHours,
              horas_faltantes: faltantes,
              departamento: user.department,
              status: 'active'
            });
          }
        });
      }
      
      setAlertasArchivadas(alerts);
      return alerts;
    } catch (err) {
      setError('Error generando alertas');
      return [];
    }
  }, [users, tasks]);

  const getAlertsWithFilters = useCallback(async (filters) => {
    try {
      let filteredAlerts = [...alertasArchivadas];
      
      if (filters.empleado_id) {
        filteredAlerts = filteredAlerts.filter(alert => alert.empleado_id === parseInt(filters.empleado_id));
      }
      
      if (filters.severity && filters.severity !== 'todas') {
        filteredAlerts = filteredAlerts.filter(alert => alert.severity === filters.severity);
      }
      
      if (filters.status && filters.status !== 'todas') {
        filteredAlerts = filteredAlerts.filter(alert => alert.status === filters.status);
      }
      
      return filteredAlerts;
    } catch (err) {
      return [];
    }
  }, [alertasArchivadas]);

  const archiveAlert = useCallback(async (alertId) => {
    try {
      setAlertasArchivadas(prev => 
        prev.map(alert => 
          alert.alert_id === alertId 
            ? { ...alert, status: 'archived' }
            : alert
        )
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const restoreAlert = useCallback(async (alertId) => {
    try {
      setAlertasArchivadas(prev => 
        prev.map(alert => 
          alert.alert_id === alertId 
            ? { ...alert, status: 'active' }
            : alert
        )
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const createAssignedTask = useCallback(async (taskData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newAssignedTask = {
        ...taskData,
        id: Math.max(...assignedTasks.map(t => t.id), 0) + 1,
        created_at: new Date().toISOString(),
        status: 'pending'
      };
      
      setAssignedTasks(prev => [...prev, newAssignedTask]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [assignedTasks]);

  const updateAssignedTaskStatus = useCallback(async (taskId, status) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setAssignedTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status, 
              completed_at: status === 'completed' ? new Date().toISOString() : null 
            }
          : task
      ));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const deleteAssignedTask = useCallback(async (taskId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setAssignedTasks(prev => prev.filter(task => task.id !== taskId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const markDayAsHoliday = useCallback(async (userId, date) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const existingJustification = diasJustificados.find(j => 
        j.user_id === userId && j.date === date
      );
      
      if (existingJustification) {
        return { success: false, error: 'Este día ya tiene una justificación pendiente' };
      }

      const justification = {
        id: Math.max(...diasJustificados.map(d => d.id), 0) + 1,
        user_id: userId,
        date: date,
        type: 'holiday_vacation',
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      setDiasJustificados(prev => [...prev, justification]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [diasJustificados]);

  const getUserAlerts = useCallback((userId) => {
    return alertasArchivadas.filter(alert => 
      alert.empleado_id === userId && alert.status === 'active'
    ).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [alertasArchivadas]);

  const getAssignedTasksWithFilters = useCallback(async (filters) => {
    try {
      let filteredTasks = [...assignedTasks];
      
      if (filters.assigned_to) {
        filteredTasks = filteredTasks.filter(task => task.assigned_to === parseInt(filters.assigned_to));
      }
      
      if (filters.status && filters.status !== 'todas') {
        filteredTasks = filteredTasks.filter(task => task.status === filters.status);
      }
      
      if (filters.priority && filters.priority !== 'todas') {
        filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
      }
      
      return filteredTasks;
    } catch (err) {
      return [];
    }
  }, [assignedTasks]);

  useEffect(() => {
    if (!initialized) {
      setLoading(true);
      
      setTimeout(() => {
        setUsers(initialUsers);
        setCategories(initialCategories);
        setTasks(initialTasks);
        
        const demoAssignedTasks = [
          {
            id: 1,
            assigned_to: 4,
            assigned_by: 3,
            title: 'Revisar estrategia de marketing Q1',
            description: 'Analizar los resultados del primer trimestre y proponer mejoras para el siguiente período.',
            category: 'Marketing',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority: 'alta',
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            assigned_to: 1,
            assigned_by: 3,
            title: 'Optimización SEO página principal',
            description: 'Mejorar el SEO de la página principal siguiendo las nuevas directrices.',
            category: 'SEO',
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority: 'urgente',
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            assigned_to: 2,
            assigned_by: 3,
            title: 'Seguimiento clientes Q1',
            description: 'Realizar seguimiento de todos los clientes del primer trimestre.',
            category: 'Seguimiento',
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority: 'normal',
            status: 'completed',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        setAssignedTasks(demoAssignedTasks);
        setInitialized(true);
        setLoading(false);
      }, 1500);
    }
  }, [initialized]);

  useEffect(() => {
    if (initialized && users.length > 0 && tasks.length >= 0) {
      generateAlerts();
    }
  }, [initialized, users, tasks, generateAlerts]);

  return {
    users,
    tasks,
    categories,
    diasJustificados,
    alertasArchivadas,
    assignedTasks,
    loading,
    error,
    departments,
    createUser,
    updateUser,
    deleteUser,
    createTask,
    updateTask,
    deleteTask,
    createCategory,
    deleteCategory,
    generateAlerts,
    getAlertsWithFilters,
    archiveAlert,
    restoreAlert,
    createAssignedTask,
    updateAssignedTaskStatus,
    deleteAssignedTask,
    getAssignedTasksWithFilters,
    markDayAsHoliday,
    getUserAlerts
  };
};

const OptimizedInput = memo(({ type = 'text', value, onChange, placeholder, className = '', showPasswordToggle = false, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative">
      <input
        type={inputType}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          showPasswordToggle ? 'pr-10' : ''
        } ${className}`}
        {...props}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
});

const OptimizedSelect = memo(({ value, onChange, options, placeholder, className = '' }) => {
  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option, index) => (
        <option key={index} value={typeof option === 'string' ? option : option.value}>
          {typeof option === 'string' ? option : option.label}
        </option>
      ))}
    </select>
  );
});

const Timer = memo(({ taskId, initialHours = 0, onTimeUpdate, isActive, onToggle }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(null);

  useEffect(() => {
    setTimeElapsed(initialHours * 3600);
  }, [initialHours]);

  useEffect(() => {
    if (isRunning && isActive) {
      lastUpdateRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          if (newTime % 1800 === 0) {
            onTimeUpdate(taskId, newTime / 3600);
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (lastUpdateRef.current && !isRunning) {
        onTimeUpdate(taskId, timeElapsed / 3600);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isActive, taskId, onTimeUpdate, timeElapsed]);

  const handleToggle = useCallback(() => {
    setIsRunning(prev => !prev);
    onToggle(taskId);
  }, [taskId, onToggle]);

  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className={`text-sm font-mono ${isRunning && isActive ? 'text-green-600' : 'text-gray-600'}`}>
        {formatTime(timeElapsed)}
      </div>
      <button
        onClick={handleToggle}
        disabled={!isActive && !isRunning}
        className={`p-1 rounded ${
          isRunning && isActive 
            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${!isActive && !isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isRunning ? 'Pausar' : 'Iniciar'}
      >
        {isRunning ? <Pause size={14} /> : <Play size={14} />}
      </button>
    </div>
  );
});

const ConfirmModal = memo(({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirmar", cancelText = "Cancelar", danger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full m-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-2 text-gray-600">{message}</p>
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-md transition-colors ${
              danger 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
});

const AssignedTasks = memo(({ userId, assignedTasks, onUpdateStatus }) => {
  const userTasks = useMemo(() => 
    assignedTasks.filter(task => task.assigned_to === userId), [assignedTasks, userId]
  );

  const priorityConfig = {
    'baja': { label: 'Baja', color: 'bg-gray-100 text-gray-800' },
    'normal': { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
    'alta': { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    'urgente': { label: 'Urgente', color: 'bg-red-100 text-red-800' }
  };

  const handleStatusChange = useCallback(async (taskId, newStatus) => {
    await onUpdateStatus(taskId, newStatus);
  }, [onUpdateStatus]);

  if (userTasks.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Tareas Asignadas
        </h2>
        <p className="text-gray-500 text-center py-4">
          No tienes tareas asignadas por el momento
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Calendar size={20} />
        Tareas Asignadas ({userTasks.length})
      </h2>
      
      <div className="space-y-4">
        {userTasks.map((task) => {
          const priority = priorityConfig[task.priority] || priorityConfig.normal;
          const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
          
          return (
            <div key={task.id} className={`border rounded-lg p-4 ${
              isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{task.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${priority.color}`}>
                    {priority.label}
                  </span>
                  {task.status === 'completed' ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <button
                      onClick={() => handleStatusChange(task.id, 'completed')}
                      className="text-gray-400 hover:text-green-600"
                      title="Marcar como completada"
                    >
                      <Square size={20} />
                    </button>
                  )}
                </div>
              </div>
              
              {task.description && (
                <p className="text-gray-600 text-sm mb-2">{task.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  {task.category && (
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {task.category}
                    </span>
                  )}
                  {task.due_date && (
                    <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                      Vence: {task.due_date}
                    </span>
                  )}
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs ${
                  task.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {task.status === 'completed' ? 'Completada' : 'Pendiente'}
                </span>
              </div>
              
              {isOverdue && (
                <div className="mt-2 text-red-600 text-sm font-medium">
                  ⚠️ Tarea vencida
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

const EmployeePanel = memo(({ user, onLogout }) => {
  const {
    tasks,
    categories,
    assignedTasks,
    createTask,
    updateTask,
    deleteTask,
    updateAssignedTaskStatus,
    markDayAsHoliday,
    getUserAlerts
  } = useSupabaseData();

  const [newTask, setNewTask] = useState({
    description: '',
    category: '',
    hours: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [editingTask, setEditingTask] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTimerId, setActiveTimerId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const userTasks = useMemo(() => 
    tasks.filter(task => task.user_id === user.id), [tasks, user.id]
  );

  const todayTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return userTasks.filter(task => task.date === today);
  }, [userTasks]);

  const selectedDateTasks = useMemo(() => 
    userTasks.filter(task => task.date === selectedDate), [userTasks, selectedDate]
  );

  const todayHours = useMemo(() => 
    todayTasks.reduce((sum, task) => sum + parseFloat(task.hours), 0), [todayTasks]
  );

  const selectedDateHours = useMemo(() => 
    selectedDateTasks.reduce((sum, task) => sum + parseFloat(task.hours), 0), [selectedDateTasks]
  );

  const progressPercentage = useMemo(() => 
    Math.min((todayHours / user.horas_objetivo) * 100, 100), [todayHours, user.horas_objetivo]
  );

  const userCategories = useMemo(() => 
    categories.filter(cat => cat.department === user.department), [categories, user.department]
  );

  const calculateEndTime = useCallback((startTime, hours) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + hours * 60;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
  }, []);

  const handleSubmitTask = useCallback(async () => {
    if (!newTask.description || !newTask.category || !newTask.hours) {
      setMessage('Todos los campos son obligatorios');
      return;
    }

    const hours = parseFloat(newTask.hours);
    if (hours < 0.5 || hours > 12) {
      setMessage('Las horas deben estar entre 0.5 y 12');
      return;
    }

    const result = await createTask({
      user_id: user.id,
      description: newTask.description,
      category: newTask.category,
      hours: hours,
      date: newTask.date,
      horario: `${user.hora_inicio}-${calculateEndTime(user.hora_inicio, hours)}`
    });

    if (result.success) {
      setNewTask({
        description: '',
        category: '',
        hours: '',
        date: new Date().toISOString().split('T')[0]
      });
      setMessage('Tarea creada exitosamente');
    } else {
      setMessage('Error al crear la tarea');
    }

    setTimeout(() => setMessage(''), 3000);
  }, [newTask, user, createTask, calculateEndTime]);

  const handleEditTask = useCallback((task) => {
    setEditingTask({
      id: task.id,
      description: task.description,
      category: task.category,
      hours: task.hours,
      date: task.date
    });
  }, []);

  const handleSaveEditTask = useCallback(async () => {
    if (!editingTask.description || !editingTask.category || !editingTask.hours) {
      setMessage('Todos los campos son obligatorios');
      return;
    }

    const hours = parseFloat(editingTask.hours);
    if (hours < 0.5 || hours > 12) {
      setMessage('Las horas deben estar entre 0.5 y 12');
      return;
    }

    const result = await updateTask(editingTask.id, {
      description: editingTask.description,
      category: editingTask.category,
      hours: hours,
      date: editingTask.date,
      horario: `${user.hora_inicio}-${calculateEndTime(user.hora_inicio, hours)}`
    });

    if (result.success) {
      setEditingTask(null);
      setMessage('Tarea actualizada exitosamente');
    } else {
      setMessage('Error al actualizar la tarea');
    }

    setTimeout(() => setMessage(''), 3000);
  }, [editingTask, user, updateTask, calculateEndTime]);

  const handleDeleteTask = useCallback((taskId, taskDescription) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Tarea',
      message: `¿Estás seguro de eliminar la tarea "${taskDescription}"?`,
      onConfirm: async () => {
        const result = await deleteTask(taskId);
        
        if (result.success) {
          setMessage('Tarea eliminada exitosamente');
        } else {
          setMessage('Error al eliminar la tarea');
        }

        setTimeout(() => setMessage(''), 3000);
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  }, [deleteTask]);

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
  }, []);

  const handleTimerToggle = useCallback((taskId) => {
    if (activeTimerId && activeTimerId !== taskId) {
      setActiveTimerId(null);
      setTimeout(() => setActiveTimerId(taskId), 100);
    } else {
      setActiveTimerId(activeTimerId === taskId ? null : taskId);
    }
  }, [activeTimerId]);

  const handleTimeUpdate = useCallback(async (taskId, newHours) => {
    const result = await updateTask(taskId, { hours: newHours });
    if (result.success) {
      console.log(`Tarea ${taskId} actualizada a ${newHours.toFixed(2)} horas`);
    }
  }, [updateTask]);

  const handleAssignedTaskUpdate = useCallback(async (taskId, status) => {
    await updateAssignedTaskStatus(taskId, status);
  }, [updateAssignedTaskStatus]);

  const handleMarkAsHoliday = useCallback(async (date) => {
    const result = await markDayAsHoliday(user.id, date);
    
    if (result.success) {
      setMessage('Día marcado como festivo/vacaciones. Pendiente de revisión del administrador.');
    } else {
      setMessage(`Error: ${result.error}`);
    }

    setTimeout(() => setMessage(''), 3000);
  }, [markDayAsHoliday, user.id]);

  const handleDateChange = useCallback((newDate) => {
    setSelectedDate(newDate);
  }, []);

  const userAlerts = useMemo(() => 
    getUserAlerts(user.id), [getUserAlerts, user.id]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TimeTracker Pro</h1>
              <p className="text-gray-600">Bienvenido, {user.name}</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User size={20} />
                Información Personal
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Departamento:</span>
                  <div className="font-medium">{user.department}</div>
                </div>
              </div>
            </div>

            <AssignedTasks
              userId={user.id}
              assignedTasks={assignedTasks}
              onUpdateStatus={handleAssignedTaskUpdate}
            />

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Plus size={20} />
                Nueva Tarea
              </h2>
              
              {message && (
                <div className={`mb-4 p-3 rounded-md ${
                  message.includes('Error') 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {message}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción *</label>
                  <OptimizedInput
                    value={newTask.description}
                    onChange={(value) => setNewTask(prev => ({ ...prev, description: value }))}
                    placeholder="Descripción de la tarea"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categoría *</label>
                  <OptimizedSelect
                    value={newTask.category}
                    onChange={(value) => setNewTask(prev => ({ ...prev, category: value }))}
                    options={userCategories.map(cat => cat.name)}
                    placeholder="Seleccionar categoría"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Horas *</label>
                    <OptimizedInput
                      type="number"
                      min="0.5"
                      max="12"
                      step="0.5"
                      value={newTask.hours}
                      onChange={(value) => setNewTask(prev => ({ ...prev, hours: value }))}
                      placeholder="Ej: 2.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha *</label>
                    <OptimizedInput
                      type="date"
                      value={newTask.date}
                      onChange={(value) => setNewTask(prev => ({ ...prev, date: value }))}
                      required
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmitTask}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Crear Tarea
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText size={20} />
                  Tareas del Día
                  {activeTimerId && selectedDate === new Date().toISOString().split('T')[0] && (
                    <span className="text-sm font-normal text-green-600">
                      (Temporizador activo)
                    </span>
                  )}
                </h2>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Fecha:</label>
                  <OptimizedInput
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="w-auto"
                  />
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedDate === new Date().toISOString().split('T')[0] ? (
                    <span className="text-blue-600 font-medium">📅 Hoy</span>
                  ) : selectedDate > new Date().toISOString().split('T')[0] ? (
                    <span className="text-gray-600">📅 Fecha futura</span>
                  ) : (
                    <span className="text-gray-600">📅 Fecha pasada</span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600">
                  Total: <span className="font-medium">{selectedDateHours}h</span> / {user.horas_objetivo}h
                </div>
              </div>

              {selectedDateTasks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Descripción</th>
                        <th className="text-left py-2">Categoría</th>
                        <th className="text-left py-2">Horas</th>
                        <th className="text-left py-2">Horario</th>
                        {selectedDate === new Date().toISOString().split('T')[0] && (
                          <th className="text-left py-2">Temporizador</th>
                        )}
                        <th className="text-left py-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDateTasks.map((task) => (
                        <tr key={task.id} className="border-b hover:bg-gray-50">
                          <td className="py-2">{task.description}</td>
                          <td className="py-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {task.category}
                            </span>
                          </td>
                          <td className="py-2">{task.hours}h</td>
                          <td className="py-2">{task.horario}</td>
                          {selectedDate === new Date().toISOString().split('T')[0] && (
                            <td className="py-2">
                              <Timer
                                taskId={task.id}
                                initialHours={parseFloat(task.hours)}
                                onTimeUpdate={handleTimeUpdate}
                                isActive={activeTimerId === task.id}
                                onToggle={handleTimerToggle}
                              />
                            </td>
                          )}
                          <td className="py-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditTask(task)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Editar tarea"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id, task.description)}
                                className="text-red-600 hover:text-red-800"
                                title="Eliminar tarea"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No hay tareas registradas para {selectedDate === new Date().toISOString().split('T')[0] ? 'hoy' : 'este día'}
                </p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target size={20} />
                Resumen del Día
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso de jornada</span>
                    <span>{progressPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        progressPercentage >= 100 ? 'bg-green-500' : 
                        progressPercentage >= 75 ? 'bg-blue-500' : 
                        progressPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-500">
                    {todayHours >= user.horas_objetivo ? (
                      <span className="text-green-600 flex items-center justify-center gap-1">
                        <CheckCircle size={16} />
                        ¡Jornada completada!
                      </span>
                    ) : (
                      <span className="text-orange-600">
                        Jornada en progreso
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle size={20} />
                Mis Incidencias ({userAlerts.length})
              </h2>
              
              {userAlerts.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {userAlerts.map((alert) => {
                    const horasFaltantes = alert.horas_faltantes;
                    const mostrarHoras = horasFaltantes > 7 ? '+7h' : `${horasFaltantes}h`;
                    
                    return (
                      <div key={alert.alert_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{alert.fecha}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              alert.severity === 'critico' ? 'bg-red-100 text-red-800' :
                              alert.severity === 'moderado' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {alert.severity === 'critico' ? 'Crítico' : 
                               alert.severity === 'moderado' ? 'Moderado' : 'Leve'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Faltan: {mostrarHoras}
                          </div>
                        </div>
                        <button
                          onClick={() => handleMarkAsHoliday(alert.fecha)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                        >
                          Marcar como Festivo/Vacaciones
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No tienes incidencias pendientes
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
          </div>
        </div>
      </div>

      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Editar Tarea</h3>
              <button 
                onClick={() => setEditingTask(null)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Descripción *</label>
                <OptimizedInput
                  value={editingTask.description}
                  onChange={(value) => setEditingTask(prev => ({ ...prev, description: value }))}
                  placeholder="Descripción de la tarea"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <OptimizedSelect
                  value={editingTask.category}
                  onChange={(value) => setEditingTask(prev => ({ ...prev, category: value }))}
                  options={userCategories.map(cat => cat.name)}
                  placeholder="Seleccionar categoría"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Horas *</label>
                  <OptimizedInput
                    type="number"
                    min="0.5"
                    max="12"
                    step="0.5"
                    value={editingTask.hours}
                    onChange={(value) => setEditingTask(prev => ({ ...prev, hours: value }))}
                    placeholder="Ej: 2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha *</label>
                  <OptimizedInput
                    type="date"
                    value={editingTask.date}
                    onChange={(value) => setEditingTask(prev => ({ ...prev, date: value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveEditTask}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Guardar Cambios
                </button>
                <button
                  onClick={() => setEditingTask(null)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
        confirmText="Eliminar"
        danger={true}
      />
    </div>
  );
});

const Login = memo(({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { users } = useSupabaseData();

  const handleSubmit = useCallback(async () => {
    if (!credentials.username || !credentials.password) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (credentials.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    const user = users.find(u => 
      u.username === credentials.username && 
      u.password === credentials.password
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Credenciales inválidas');
    }

    setLoading(false);
  }, [credentials, users, onLogin]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Clock className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            TimeTracker Pro
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gestión de Tiempo Laboral
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <div className="mt-1">
                <OptimizedInput
                  id="username"
                  value={credentials.username}
                  onChange={(value) => setCredentials(prev => ({ ...prev, username: value }))}
                  placeholder="Ingresa tu usuario"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1">
                <OptimizedInput
                  id="password"
                  value={credentials.password}
                  onChange={(value) => setCredentials(prev => ({ ...prev, password: value }))}
                  placeholder="Ingresa tu contraseña"
                  showPasswordToggle={true}
                  required
                />
              </div>
            </div>

            <div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Usuarios demo</span>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <div>• juan / abc123</div>
              <div>• maria / def456</div>
              <div>• carlos / demo123</div>
              <div>• admin / admin1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleLogin = useCallback((user) => {
    setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Inicializando TimeTracker Pro...</p>
          <p className="text-sm text-gray-500">Configurando base de datos y datos demo</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentUser.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Panel de Administrador</h1>
          <p className="text-gray-600 mb-4">Funcionalidad completa disponible en el código fuente</p>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return <EmployeePanel user={currentUser} onLogout={handleLogout} />;
};

export default App;
