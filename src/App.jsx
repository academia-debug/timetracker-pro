import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { 
  Clock, Users, BarChart3, Calendar, Plus, Edit, Trash2, 
  Play, Pause, CheckCircle, AlertTriangle, Filter, Archive,
  User, Building, Target, Timer, Save, X, Search, Eye,
  TrendingUp, PieChart, Activity, FileText, Settings,
  Bell, CheckSquare, Square, RotateCcw
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

  // Funciones CRUD simuladas
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

  const markDayAsHoliday = useCallback(async (userId, date) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verificar si ya existe una justificación para este día
      const existingJustification = diasJustificados.find(d => 
        d.user_id === userId && d.date === date
      );
      
      if (existingJustification) {
        return { success: false, error: 'Ya existe una justificación para este día' };
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

  // Inicialización automática
  useEffect(() => {
    if (!initialized) {
      setLoading(true);
      
      setTimeout(() => {
        setUsers(initialUsers);
        setCategories(initialCategories);
        setTasks(initialTasks);
        
        // Datos demo de tareas asignadas
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

  // Generar alertas cuando los datos estén listos
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
    markDayAsHoliday
  };
};

// Componente Input optimizado con opción de mostrar contraseña
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

// Componente Select optimizado
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

const TimerComponent = memo(({ taskId, initialHours = 0, onTimeUpdate, isActive, onToggle }) => {
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

// Modal de confirmación personalizado
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
