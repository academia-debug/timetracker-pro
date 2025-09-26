import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { 
  Clock, Users, BarChart3, Calendar, Plus, Edit, Trash2, 
  Play, Pause, CheckCircle, AlertTriangle, Filter, Archive,
  User, Building, Target, Timer, Save, X, Search, Eye,
  TrendingUp, PieChart, Activity, FileText, Settings,
  Bell, CheckSquare, Square, RotateCcw
} from 'lucide-react';
import { supabase } from './supabaseClient';

// Hook personalizado para Supabase REAL
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

  // Cargar datos iniciales
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, tasksRes, categoriesRes, justifiedRes, assignedRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('justified_days').select('*'),
        supabase.from('assigned_tasks').select('*')
      ]);

      if (usersRes.error) throw usersRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (justifiedRes.error) throw justifiedRes.error;
      if (assignedRes.error) throw assignedRes.error;

      setUsers(usersRes.data || []);
      setTasks(tasksRes.data || []);
      setCategories(categoriesRes.data || []);
      setDiasJustificados(justifiedRes.data || []);
      setAssignedTasks(assignedRes.data || []);
      
      setInitialized(true);
    } catch (err) {
      setError(err.message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // CRUD de usuarios
  const createUser = useCallback(async (userData) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      setUsers(prev => [...prev, data[0]]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const updateUser = useCallback(async (userId, userData) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      setUsers(prev => prev.map(user => 
        user.id === userId ? data[0] : user
      ));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      setUsers(prev => prev.filter(user => user.id !== userId));
      setTasks(prev => prev.filter(task => task.user_id !== userId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // CRUD de tareas
  const createTask = useCallback(async (taskData) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      setTasks(prev => [...prev, data[0]]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', taskId)
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      setTasks(prev => prev.map(task => 
        task.id === taskId ? data[0] : task
      ));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        return { success: false, error: error.message };
      }

      setTasks(prev => prev.filter(task => task.id !== taskId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // CRUD de categorías
  const createCategory = useCallback(async (department, categoryName) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ department, name: categoryName }])
        .select();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return { success: false, error: 'La categoría ya existe en este departamento' };
        }
        return { success: false, error: error.message };
      }

      setCategories(prev => [...prev, data[0]]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId, categoryName) => {
    try {
      // Verificar si hay tareas asociadas
      const { data: tasksWithCategory } = await supabase
        .from('tasks')
        .select('id')
        .eq('category', categoryName);

      if (tasksWithCategory && tasksWithCategory.length > 0) {
        return { success: false, error: 'No se puede eliminar: hay tareas asociadas a esta categoría' };
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        return { success: false, error: error.message };
      }

      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Generar alertas desde la vista
  const generateAlerts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_alerts')
        .select('*');

      if (error) {
        console.error('Error generating alerts:', error);
        return [];
      }

      const alerts = data.map(alert => ({
        ...alert,
        status: 'active'
      }));

      setAlertasArchivadas(alerts);
      return alerts;
    } catch (err) {
      console.error('Error generating alerts:', err);
      return [];
    }
  }, []);

  const getAlertsWithFilters = useCallback(async (filters) => {
    try {
      let query = supabase.from('user_alerts').select('*');
      
      if (filters.empleado_id) {
        query = query.eq('empleado_id', filters.empleado_id);
      }
      
      if (filters.severity && filters.severity !== 'todas') {
        query = query.eq('severity', filters.severity);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error filtering alerts:', error);
        return [];
      }

      return data.map(alert => ({
        ...alert,
        status: 'active'
      }));
    } catch (err) {
      console.error('Error filtering alerts:', err);
      return [];
    }
  }, []);

  // Placeholder para archivar alertas (las alertas se calculan dinámicamente)
  const archiveAlert = useCallback(async (alertId) => {
    return { success: true };
  }, []);

  const restoreAlert = useCallback(async (alertId) => {
    return { success: true };
  }, []);

  // CRUD de tareas asignadas
  const createAssignedTask = useCallback(async (taskData) => {
    try {
      const { data, error } = await supabase
        .from('assigned_tasks')
        .insert([taskData])
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      setAssignedTasks(prev => [...prev, data[0]]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const updateAssignedTaskStatus = useCallback(async (taskId, status) => {
    try {
      const updateData = { 
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null 
      };

      const { data, error } = await supabase
        .from('assigned_tasks')
        .update(updateData)
        .eq('id', taskId)
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      setAssignedTasks(prev => prev.map(task => 
        task.id === taskId ? data[0] : task
      ));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const deleteAssignedTask = useCallback(async (taskId) => {
    try {
      const { error } = await supabase
        .from('assigned_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        return { success: false, error: error.message };
      }

      setAssignedTasks(prev => prev.filter(task => task.id !== taskId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const getAssignedTasksWithFilters = useCallback(async (filters) => {
    try {
      let query = supabase.from('assigned_tasks').select('*');
      
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      
      if (filters.status && filters.status !== 'todas') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.priority && filters.priority !== 'todas') {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error filtering assigned tasks:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error filtering assigned tasks:', err);
      return [];
    }
  }, []);

  // Marcar día como festivo/vacaciones
  const markDayAsHoliday = useCallback(async (userId, date) => {
    try {
      const { data, error } = await supabase
        .from('justified_days')
        .insert([{
          user_id: userId,
          date: date,
          type: 'holiday_vacation',
          status: 'pending'
        }])
        .select();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return { success: false, error: 'Ya existe una justificación para este día' };
        }
        return { success: false, error: error.message };
      }

      setDiasJustificados(prev => [...prev, data[0]]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Inicialización
  useEffect(() => {
    if (!initialized) {
      loadInitialData();
    }
  }, [initialized, loadInitialData]);

  // Generar alertas cuando los datos estén listos
  useEffect(() => {
    if (initialized && users.length > 0) {
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

// Modal para editar tareas
const EditTaskModal = memo(({ task, isOpen, onClose, onSave, userCategories, user }) => {
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    hours: '',
    date: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        description: task.description || '',
        category: task.category || '',
        hours: task.hours || '',
        date: task.date || ''
      });
    }
  }, [task]);

  const calculateEndTime = useCallback((startTime, hours) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + hours * 60;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
  }, []);

  const handleSubmit = useCallback(() => {
    if (!formData.description || !formData.category || !formData.hours) {
      return;
    }

    const hours = parseFloat(formData.hours);
    if (hours < 0.5 || hours > 12) {
      return;
    }

    const updatedTask = {
      ...formData,
      hours: hours,
      horario: `${user.hora_inicio}-${calculateEndTime(user.hora_inicio, hours)}`
    };

    onSave(task.id, updatedTask);
  }, [task, formData, onSave, user, calculateEndTime]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Editar Tarea</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Descripción *</label>
            <OptimizedInput
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Descripción de la tarea"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Categoría *</label>
            <OptimizedSelect
              value={formData.category}
              onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              options={userCategories.map(cat => cat.name)}
              placeholder="Seleccionar categoría"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Horas *</label>
            <OptimizedInput
              type="number"
              min="0.5"
              max="12"
              step="0.5"
              value={formData.hours}
              onChange={(value) => setFormData(prev => ({ ...prev, hours: value }))}
              placeholder="Ej: 2.5"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Fecha *</label>
            <OptimizedInput
              type="date"
              value={formData.date}
              onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Guardar Cambios
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <EditTaskModal
        task={selectedTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        userCategories={userCategories}
        user={user}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
        danger={confirmModal.danger}
        confirmText={confirmModal.danger ? "Eliminar" : "Confirmar"}
      />
    </div>
  );
});
const EditUserModal = memo(({ user, isOpen, onClose, onSave, departments }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    horas_objetivo: 8,
    hora_inicio: '09:00',
    password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        horas_objetivo: user.horas_objetivo || 8,
        hora_inicio: user.hora_inicio || '09:00',
        password: user.password || ''
      });
    }
  }, [user]);

  const handleSubmit = useCallback(() => {
    onSave(user.id, formData);
  }, [user, formData, onSave]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Editar Usuario</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username (no editable)</label>
            <input
              type="text"
              value={user?.username || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Nombre completo</label>
            <OptimizedInput
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              placeholder="Nombre completo"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <OptimizedInput
              type="email"
              value={formData.email}
              onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
              placeholder="email@empresa.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Departamento</label>
            <OptimizedSelect
              value={formData.department}
              onChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              options={departments}
              placeholder="Seleccionar departamento"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Horas objetivo</label>
            <OptimizedInput
              type="number"
              min="1"
              max="12"
              step="0.5"
              value={formData.horas_objetivo}
              onChange={(value) => setFormData(prev => ({ ...prev, horas_objetivo: parseFloat(value) }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Hora de inicio</label>
            <OptimizedInput
              type="time"
              value={formData.hora_inicio}
              onChange={(value) => setFormData(prev => ({ ...prev, hora_inicio: value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <OptimizedInput
              type="text"
              value={formData.password}
              onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
              placeholder="Contraseña"
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Guardar Cambios
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Componente de gestión de tareas asignadas (Admin)
const AssignTasksManagement = memo(({ users, assignedTasks, onCreateTask, onDeleteTask, onGetFiltered }) => {
  const [newAssignedTask, setNewAssignedTask] = useState({
    assigned_to: '',
    title: '',
    description: '',
    category: '',
    due_date: '',
    priority: 'normal'
  });

  const [filters, setFilters] = useState({
    assigned_to: '',
    status: 'todas',
    priority: 'todas'
  });

  const [filteredTasks, setFilteredTasks] = useState([]);
  const [message, setMessage] = useState('');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const priorityOptions = [
    { value: 'baja', label: 'Baja', color: 'bg-gray-100 text-gray-800' },
    { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
    { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    const applyFilters = async () => {
      const filtered = await onGetFiltered(filters);
      setFilteredTasks(filtered);
    };
    applyFilters();
  }, [filters, assignedTasks, onGetFiltered]);

  const handleCreateTask = useCallback(async () => {
    if (!newAssignedTask.assigned_to || !newAssignedTask.title) {
      setMessage('El empleado y el título son obligatorios');
      return;
    }

    if (newAssignedTask.due_date && new Date(newAssignedTask.due_date) < new Date()) {
      setMessage('La fecha límite no puede ser en el pasado');
      return;
    }

    const taskData = {
      ...newAssignedTask,
      assigned_by: 3,
      assigned_to: parseInt(newAssignedTask.assigned_to)
    };

    const result = await onCreateTask(taskData);
    
    if (result.success) {
      setNewAssignedTask({
        assigned_to: '',
        title: '',
        description: '',
        category: '',
        due_date: '',
        priority: 'normal'
      });
      setMessage('Tarea asignada exitosamente');
    } else {
      setMessage(`Error: ${result.error}`);
    }

    setTimeout(() => setMessage(''), 3000);
  }, [newAssignedTask, onCreateTask]);

  const handleDeleteTask = useCallback((taskId, taskTitle) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Tarea Asignada',
      message: `¿Estás seguro de eliminar la tarea "${taskTitle}"?`,
      onConfirm: async () => {
        const result = await onDeleteTask(taskId);
        
        if (result.success) {
          setMessage('Tarea eliminada exitosamente');
        } else {
          setMessage(`Error: ${result.error}`);
        }

        setTimeout(() => setMessage(''), 3000);
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  }, [onDeleteTask]);

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
  }, []);

  const getPriorityConfig = useCallback((priority) => {
    return priorityOptions.find(p => p.value === priority) || priorityOptions[1];
  }, [priorityOptions]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Asignar Nueva Tarea</h3>
        
        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            message.includes('Error') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Empleado *</label>
            <OptimizedSelect
              value={newAssignedTask.assigned_to}
              onChange={(value) => setNewAssignedTask(prev => ({ ...prev, assigned_to: value }))}
              options={users.filter(u => u.role !== 'admin').map(u => ({ value: u.id, label: u.name }))}
              placeholder="Seleccionar empleado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Título de la tarea *</label>
            <OptimizedInput
              value={newAssignedTask.title}
              onChange={(value) => setNewAssignedTask(prev => ({ ...prev, title: value }))}
              placeholder="Título de la tarea"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={newAssignedTask.description}
              onChange={(e) => setNewAssignedTask(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción detallada de la tarea"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <OptimizedInput
              value={newAssignedTask.category}
              onChange={(value) => setNewAssignedTask(prev => ({ ...prev, category: value }))}
              placeholder="Categoría de la tarea"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha límite</label>
            <OptimizedInput
              type="date"
              value={newAssignedTask.due_date}
              onChange={(value) => setNewAssignedTask(prev => ({ ...prev, due_date: value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prioridad</label>
            <OptimizedSelect
              value={newAssignedTask.priority}
              onChange={(value) => setNewAssignedTask(prev => ({ ...prev, priority: value }))}
              options={priorityOptions.map(p => ({ value: p.value, label: p.label }))}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleCreateTask}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Asignar Tarea
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <OptimizedSelect
            value={filters.assigned_to}
            onChange={(value) => setFilters(prev => ({ ...prev, assigned_to: value }))}
            options={[
              { value: '', label: 'Todos los empleados' },
              ...users.filter(u => u.role !== 'admin').map(u => ({ value: u.id, label: u.name }))
            ]}
          />
          
          <OptimizedSelect
            value={filters.status}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            options={[
              { value: 'todas', label: 'Todos los estados' },
              { value: 'pending', label: 'Pendientes' },
              { value: 'completed', label: 'Completadas' }
            ]}
          />
          
          <OptimizedSelect
            value={filters.priority}
            onChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
            options={[
              { value: 'todas', label: 'Todas las prioridades' },
              ...priorityOptions.map(p => ({ value: p.value, label: p.label }))
            ]}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Tareas Asignadas</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Empleado</th>
                <th className="p-3 text-left">Título</th>
                <th className="p-3 text-left">Categoría</th>
                <th className="p-3 text-left">Fecha límite</th>
                <th className="p-3 text-left">Prioridad</th>
                <th className="p-3 text-left">Estado</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => {
                const employee = users.find(u => u.id === task.assigned_to);
                const priorityConfig = getPriorityConfig(task.priority);
                
                return (
                  <tr key={task.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{employee?.name || 'Usuario no encontrado'}</div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-gray-500 mt-1">{task.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {task.category && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                          {task.category}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {task.due_date ? task.due_date : '-'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status === 'completed' ? 'Completada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar tarea"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredTasks.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No se encontraron tareas asignadas con los filtros aplicados
          </div>
        )}
      </div>

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

const AlertsManagement = memo(({ alerts, users, onArchive, onRestore, onGetFiltered }) => {
  const [filters, setFilters] = useState({
    empleado_id: '',
    severity: 'todas',
    status: 'todas',
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const severityConfig = {
    'critico': { label: 'Crítico', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    'moderado': { label: 'Moderado', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
    'leve': { label: 'Leve', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
  };

  useEffect(() => {
    const applyFilters = async () => {
      const filtered = await onGetFiltered(filters);
      setFilteredAlerts(filtered);
    };
    applyFilters();
  }, [filters, alerts, onGetFiltered]);

  const counters = useMemo(() => {
    const active = filteredAlerts.filter(alert => alert.status === 'active');
    return {
      total: active.length,
      critico: active.filter(alert => alert.severity === 'critico').length,
      moderado: active.filter(alert => alert.severity === 'moderado').length,
      leve: active.filter(alert => alert.severity === 'leve').length
    };
  }, [filteredAlerts]);

  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedAlerts(filteredAlerts.map(alert => alert.alert_id));
    } else {
      setSelectedAlerts([]);
    }
  }, [filteredAlerts]);

  const handleSelectAlert = useCallback((alertId, checked) => {
    if (checked) {
      setSelectedAlerts(prev => [...prev, alertId]);
    } else {
      setSelectedAlerts(prev => prev.filter(id => id !== alertId));
    }
  }, []);

  const handleArchiveSelected = useCallback(async () => {
    if (selectedAlerts.length === 0) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Archivar Alertas',
      message: `¿Estás seguro de archivar ${selectedAlerts.length} alerta(s) seleccionada(s)?`,
      onConfirm: async () => {
        for (const alertId of selectedAlerts) {
          await onArchive(alertId);
        }
        setSelectedAlerts([]);
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  }, [selectedAlerts, onArchive]);

  const handleArchiveAlert = useCallback(async (alertId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Archivar Alerta',
      message: '¿Estás seguro de archivar esta alerta?',
      onConfirm: async () => {
        await onArchive(alertId);
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  }, [onArchive]);

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{counters.total}</div>
          <div className="text-sm text-blue-600">Total Activas</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{counters.critico}</div>
          <div className="text-sm text-red-600">Críticas</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{counters.moderado}</div>
          <div className="text-sm text-orange-600">Moderadas</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{counters.leve}</div>
          <div className="text-sm text-yellow-600">Leves</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <OptimizedSelect
            value={filters.empleado_id}
            onChange={(value) => setFilters(prev => ({ ...prev, empleado_id: value }))}
            options={[
              { value: '', label: 'Todos los empleados' },
              ...users.filter(u => u.role !== 'admin').map(u => ({ value: u.id, label: u.name }))
            ]}
          />
          
          <OptimizedSelect
            value={filters.severity}
            onChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
            options={[
              { value: 'todas', label: 'Todas las severidades' },
              { value: 'critico', label: 'Crítico' },
              { value: 'moderado', label: 'Moderado' },
              { value: 'leve', label: 'Leve' }
            ]}
          />
          
          <OptimizedSelect
            value={filters.status}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            options={[
              { value: 'todas', label: 'Todos los estados' },
              { value: 'active', label: 'Activas' },
              { value: 'archived', label: 'Archivadas' }
            ]}
          />
          
          <OptimizedInput
            type="date"
            value={filters.fecha_desde}
            onChange={(value) => setFilters(prev => ({ ...prev, fecha_desde: value }))}
            placeholder="Fecha desde"
          />
          
          <OptimizedInput
            type="date"
            value={filters.fecha_hasta}
            onChange={(value) => setFilters(prev => ({ ...prev, fecha_hasta: value }))}
            placeholder="Fecha hasta"
          />
        </div>
      </div>

      {selectedAlerts.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
          <span className="text-blue-700">
            {selectedAlerts.length} alerta(s) seleccionada(s)
          </span>
          <button
            onClick={handleArchiveSelected}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Archive size={16} />
            Archivar seleccionadas
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={selectedAlerts.length === filteredAlerts.length && filteredAlerts.length > 0}
                  />
                </th>
                <th className="p-3 text-left">Empleado</th>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Severidad</th>
                <th className="p-3 text-left">Horas</th>
                <th className="p-3 text-left">Estado</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => {
                const config = severityConfig[alert.severity];
                const Icon = config.icon;
                
                return (
                  <tr key={alert.alert_id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.includes(alert.alert_id)}
                        onChange={(e) => handleSelectAlert(alert.alert_id, e.target.checked)}
                      />
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{alert.empleado_name}</div>
                        <div className="text-sm text-gray-500">{alert.departamento}</div>
                      </div>
                    </td>
                    <td className="p-3">{alert.fecha}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.color}`}>
                        <Icon size={12} />
                        {config.label}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div>{alert.horas_registradas}h / {alert.horas_objetivo}h</div>
                        <div className="text-red-500">Faltan: {alert.horas_faltantes}h</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        alert.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.status === 'active' ? 'Activa' : 'Archivada'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {alert.status === 'active' ? (
                          <button
                            onClick={() => handleArchiveAlert(alert.alert_id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Archivar"
                          >
                            <Archive size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onRestore(alert.alert_id)}
                            className="text-green-600 hover:text-green-800"
                            title="Restaurar"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredAlerts.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No se encontraron alertas con los filtros aplicados
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
        confirmText="Archivar"
      />
    </div>
  );
});

// Componente de analytics por usuario
const UserAnalytics = memo(({ users, tasks, selectedUserId, onUserChange }) => {
  const [dateRange, setDateRange] = useState({
    desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0]
  });

  const analytics = useMemo(() => {
    if (!selectedUserId) return null;

    const user = users.find(u => u.id === parseInt(selectedUserId));
    if (!user) return null;

    const userTasks = tasks.filter(task => 
      task.user_id === parseInt(selectedUserId) &&
      task.date >= dateRange.desde &&
      task.date <= dateRange.hasta
    );

    const totalHours = userTasks.reduce((sum, task) => sum + parseFloat(task.hours), 0);
    const totalTasks = userTasks.length;
    
    const uniqueDates = [...new Set(userTasks.map(task => task.date))];
    const daysWithRecords = uniqueDates.length;
    
    const avgHoursPerDay = daysWithRecords > 0 ? totalHours / daysWithRecords : 0;
    
    const categoryDistribution = userTasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + parseFloat(task.hours);
      return acc;
    }, {});

    const dailyEvolution = uniqueDates.map(date => {
      const dayTasks = userTasks.filter(task => task.date === date);
      const dayHours = dayTasks.reduce((sum, task) => sum + parseFloat(task.hours), 0);
      return { date, hours: dayHours };
    }).sort((a, b) => a.date.localeCompare(b.date));

    return {
      user,
      totalHours: totalHours.toFixed(2),
      totalTasks,
      daysWithRecords,
      avgHoursPerDay: avgHoursPerDay.toFixed(2),
      categoryDistribution,
      dailyEvolution
    };
  }, [selectedUserId, users, tasks, dateRange]);

  const renderSelector = () => (
    <div className="bg-white p-4 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Usuario</label>
          <OptimizedSelect
            value={selectedUserId}
            onChange={onUserChange}
            options={[
              { value: '', label: 'Seleccionar usuario' },
              ...users.filter(u => u.role !== 'admin').map(u => ({ value: u.id, label: u.name }))
            ]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fecha desde</label>
          <OptimizedInput
            type="date"
            value={dateRange.desde}
            onChange={(value) => setDateRange(prev => ({ ...prev, desde: value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fecha hasta</label>
          <OptimizedInput
            type="date"
            value={dateRange.hasta}
            onChange={(value) => setDateRange(prev => ({ ...prev, hasta: value }))}
          />
        </div>
      </div>
    </div>
  );

  if (!analytics) {
    return (
      <div className="space-y-6">
        {renderSelector()}
        <div className="text-center py-8">
          <p className="text-gray-500">Selecciona un usuario para ver sus analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderSelector()}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{analytics.totalHours}h</div>
          <div className="text-sm text-blue-600">Total de horas</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{analytics.totalTasks}</div>
          <div className="text-sm text-green-600">Total de tareas</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{analytics.avgHoursPerDay}h</div>
          <div className="text-sm text-purple-600">Promedio por día</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{analytics.daysWithRecords}</div>
          <div className="text-sm text-orange-600">Días con registro</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Información del Usuario</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-gray-500">Nombre:</span>
            <div className="font-medium">{analytics.user.name}</div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Departamento:</span>
            <div className="font-medium">{analytics.user.department}</div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Horas objetivo:</span>
            <div className="font-medium">{analytics.user.horas_objetivo}h/día</div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Hora inicio:</span>
            <div className="font-medium">{analytics.user.hora_inicio}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Distribución por Categorías</h3>
        <div className="space-y-2">
          {Object.entries(analytics.categoryDistribution).map(([category, hours]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm">{category}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(hours / analytics.totalHours) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">{hours.toFixed(1)}h</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Evolución Diaria (Últimos registros)</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {analytics.dailyEvolution.slice(-10).map((day) => (
            <div key={day.date} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">{day.date}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      day.hours >= analytics.user.horas_objetivo ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min((day.hours / analytics.user.horas_objetivo) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">{day.hours.toFixed(1)}h</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Componente de Mis Incidencias para empleados
const MisIncidencias = memo(({ user, alertasArchivadas, diasJustificados, onMarkAsHoliday }) => {
  const [message, setMessage] = useState('');

  // Filtrar alertas del usuario de los últimos 30 días
  const userIncidencias = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return alertasArchivadas
      .filter(alert => 
        alert.empleado_id === user.id && 
        alert.status === 'active' &&
        new Date(alert.fecha) >= thirtyDaysAgo
      )
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [alertasArchivadas, user.id]);

  // Verificar si un día ya está justificado
  const isDayJustified = useCallback((date) => {
    return diasJustificados.some(justification => 
      justification.user_id === user.id && 
      justification.date === date
    );
  }, [diasJustificados, user.id]);

  // Formatear horas faltantes según la nueva lógica
  const formatHorasFaltantes = useCallback((horasFaltantes) => {
    if (horasFaltantes >= 7) {
      return "+7h";
    }
    return `${horasFaltantes}h`;
  }, []);

  // Manejar marcado como festivo/vacaciones
  const handleMarkDayAsHoliday = useCallback(async (date) => {
    if (isDayJustified(date)) {
      setMessage('Este día ya está marcado como festivo/vacaciones');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const result = await onMarkAsHoliday(user.id, date);
    
    if (result.success) {
      setMessage('Día marcado como festivo/vacaciones exitosamente');
    } else {
      setMessage(`Error: ${result.error}`);
    }

    setTimeout(() => setMessage(''), 3000);
  }, [user.id, onMarkAsHoliday, isDayJustified]);
  const handleMarkAsHoliday = useCallback(async (date) => {
    if (isDayJustified(date)) {
      setMessage('Este día ya está marcado como festivo/vacaciones');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const result = await onMarkAsHoliday(user.id, date);
    
    if (result.success) {
      setMessage('Día marcado como festivo/vacaciones exitosamente');
    } else {
      setMessage(`Error: ${result.error}`);
    }

    setTimeout(() => setMessage(''), 3000);
  }, [user.id, onMarkAsHoliday, isDayJustified]);

  // Configuración de severidad para colores
  const getSeverityColor = useCallback((severity) => {
    switch (severity) {
      case 'critico':
        return 'text-red-600';
      case 'moderado':
        return 'text-orange-600';
      case 'leve':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  }, []);

  if (userIncidencias.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle size={20} />
          Mis Incidencias (0)
        </h2>
        <div className="text-center py-8">
          <CheckCircle className="mx-auto text-green-500 mb-2" size={48} />
          <p className="text-green-600 font-medium">¡Excelente!</p>
          <p className="text-sm text-gray-500">No tienes incidencias pendientes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle size={20} />
        Mis Incidencias ({userIncidencias.length})
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
      
      <div className="space-y-2 max-h-80 overflow-y-auto font-mono text-sm">
        {userIncidencias.map((incidencia) => {
          const isJustified = isDayJustified(incidencia.fecha);
          const colorClass = getSeverityColor(incidencia.severity);
          
          return (
            <div key={incidencia.alert_id} className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded ${colorClass}`}>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                <span className="font-medium">{incidencia.fecha}</span>
                <span>-</span>
                <span>Faltan: {formatHorasFaltantes(incidencia.horas_faltantes)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {isJustified ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-xs font-sans">
                      Pendiente de revisión
                    </span>
                    <CheckCircle size={16} />
                  </div>
                ) : (
                  <button
                    onClick={() => handleMarkDayAsHoliday(incidencia.fecha)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-xs font-sans transition-colors"
                  >
                    Marcar como Festivo/Vacaciones
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {userIncidencias.length > 10 && (
        <div className="mt-3 text-center text-sm text-gray-500">
          Lista scrolleable - Mostrando {userIncidencias.length} incidencias de los últimos 30 días
        </div>
      )}
    </div>
  );
});

// Componente de tareas asignadas para empleados
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

// Panel de empleado
// Panel de empleado - MODIFICADO PARA UNA SOLA COLUMNA
const EmployeePanel = memo(({ user, onLogout }) => {
  const {
    tasks,
    categories,
    assignedTasks,
    alertasArchivadas,
    diasJustificados,
    createTask,
    updateTask,
    deleteTask,
    updateAssignedTaskStatus,
    markDayAsHoliday
  } = useSupabaseData();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTask, setNewTask] = useState({
    description: '',
    category: '',
    hours: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [message, setMessage] = useState('');
  const [activeTimerId, setActiveTimerId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    danger: false
  });

  const userTasks = useMemo(() => 
    tasks.filter(task => task.user_id === user.id), [tasks, user.id]
  );

  const selectedDateTasks = useMemo(() => {
    return userTasks.filter(task => task.date === selectedDate);
  }, [userTasks, selectedDate]);

  const selectedDateHours = useMemo(() => 
    selectedDateTasks.reduce((sum, task) => sum + parseFloat(task.hours), 0), [selectedDateTasks]
  );

  const progressPercentage = useMemo(() => 
    Math.min((selectedDateHours / user.horas_objetivo) * 100, 100), [selectedDateHours, user.horas_objetivo]
  );

  const userCategories = useMemo(() => 
    categories.filter(cat => cat.department === user.department), [categories, user.department]
  );

  // Sincronizar la fecha del formulario con la fecha seleccionada
  useEffect(() => {
    setNewTask(prev => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);

  const goToPreviousDay = useCallback(() => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    const newDate = currentDate.toISOString().split('T')[0];
    setSelectedDate(newDate);
  }, [selectedDate]);

  const goToNextDay = useCallback(() => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const newDate = currentDate.toISOString().split('T')[0];
    setSelectedDate(newDate);
  }, [selectedDate]);

  const goToToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  const formatDisplayDate = useCallback((dateStr) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Hoy';
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Ayer';
    
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
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
        date: selectedDate
      });
      setMessage('Tarea creada exitosamente');
    } else {
      setMessage('Error al crear la tarea');
    }

    setTimeout(() => setMessage(''), 3000);
  }, [newTask, user, createTask, selectedDate]);

  const handleEditTask = useCallback((task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  }, []);

  const handleSaveTask = useCallback(async (taskId, taskData) => {
    const result = await updateTask(taskId, taskData);
    
    if (result.success) {
      setIsEditModalOpen(false);
      setSelectedTask(null);
      setMessage('Tarea actualizada exitosamente');
    } else {
      setMessage(`Error: ${result.error}`);
    }

    setTimeout(() => setMessage(''), 3000);
  }, [updateTask]);

  const handleDeleteTask = useCallback((taskId, taskDescription) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Tarea',
      message: `¿Estás seguro de eliminar la tarea "${taskDescription}"? Esta acción no se puede deshacer.`,
      danger: true,
      onConfirm: async () => {
        const result = await deleteTask(taskId);
        
        if (result.success) {
          setMessage('Tarea eliminada exitosamente');
        } else {
          setMessage(`Error: ${result.error}`);
        }

        setTimeout(() => setMessage(''), 3000);
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, danger: false });
      }
    });
  }, [deleteTask]);

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, danger: false });
  }, []);

  const calculateEndTime = useCallback((startTime, hours) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + hours * 60;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
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
    console.log(`Tarea ${taskId} actualizada a ${newHours.toFixed(2)} horas`);
  }, []);

  const handleAssignedTaskUpdate = useCallback(async (taskId, status) => {
    await updateAssignedTaskStatus(taskId, status);
  }, [updateAssignedTaskStatus]);

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Navegador de fechas */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <button
                onClick={goToPreviousDay}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <span>←</span> Día anterior
              </button>
              
              <div className="text-center flex flex-col items-center gap-2">
                <div className="font-semibold text-lg">{formatDisplayDate(selectedDate)}</div>
                <OptimizedInput
                  type="date"
                  value={selectedDate}
                  onChange={(value) => setSelectedDate(value)}
                  className="text-center text-sm w-40"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={goToToday}
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                >
                  Hoy
                </button>
                <button
                  onClick={goToNextDay}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Día siguiente <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Información Personal */}
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

          {/* Tareas Asignadas */}
          <AssignedTasks
            userId={user.id}
            assignedTasks={assignedTasks}
            onUpdateStatus={handleAssignedTaskUpdate}
          />

          {/* Mis Incidencias */}
          <MisIncidencias
            user={user}
            alertasArchivadas={alertasArchivadas}
            diasJustificados={diasJustificados}
            onMarkAsHoliday={markDayAsHoliday}
          />

          {/* Resumen del día seleccionado - MOVIDO AQUÍ */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target size={20} />
              Resumen del {formatDisplayDate(selectedDate)}
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
            </div>
          </div>

          {/* Nueva Tarea */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus size={20} />
              Nueva Tarea para {formatDisplayDate(selectedDate)}
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

          {/* Tareas del día seleccionado */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} />
              Tareas del {formatDisplayDate(selectedDate)}
              {activeTimerId && (
                <span className="text-sm font-normal text-green-600">
                  (Temporizador activo)
                </span>
              )}
            </h2>

            {selectedDateTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Descripción</th>
                      <th className="text-left py-2">Categoría</th>
                      <th className="text-left py-2">Horas</th>
                      <th className="text-left py-2">Horario</th>
                      <th className="text-left py-2">Temporizador</th>
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
                        <td className="py-2">
                          <TimerComponent
                            taskId={task.id}
                            initialHours={parseFloat(task.hours)}
                            onTimeUpdate={handleTimeUpdate}
                            isActive={activeTimerId === task.id}
                            onToggle={handleTimerToggle}
                          />
                        </td>
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
                No hay tareas registradas para este día
              </p>
            )}
          </div>
        </div>
      </div>

      <EditTaskModal
        task={selectedTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        userCategories={userCategories}
        user={user}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
        danger={confirmModal.danger}
        confirmText={confirmModal.danger ? "Eliminar" : "Confirmar"}
      />
    </div>
  );
});

// Panel de administrador COMPLETO
const AdminPanel = memo(({ user, onLogout }) => {
  const {
    users,
    tasks,
    categories,
    alertasArchivadas,
    assignedTasks,
    loading,
    departments,
    createUser,
    updateUser,
    deleteUser,
    createCategory,
    deleteCategory,
    generateAlerts,
    getAlertsWithFilters,
    archiveAlert,
    restoreAlert,
    createAssignedTask,
    updateAssignedTaskStatus,
    deleteAssignedTask,
    getAssignedTasksWithFilters
  } = useSupabaseData();

  const [activeTab, setActiveTab] = useState('users');
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('general');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    danger: false
  });

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    department: '',
    horas_objetivo: 8,
    hora_inicio: '09:00'
  });

  const [newCategory, setNewCategory] = useState({
    department: '',
    name: ''
  });

  const [alerts, setAlerts] = useState([]);

  const tabs = [
    { id: 'users', label: 'Gestión de Usuarios', icon: Users },
    { id: 'categories', label: 'Gestión de Categorías', icon: Building },
    { id: 'assign-tasks', label: 'Asignar Tareas', icon: Calendar },
    { id: 'alerts', label: 'Gestión de Alertas', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const analyticsSubTabs = [
    { id: 'general', label: 'Visión General' },
    { id: 'user', label: 'Por Usuario' }
  ];

  const handleCreateUser = useCallback(async () => {
    if (newUser.password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const result = await createUser(newUser);
    
    if (result.success) {
      setNewUser({
        username: '',
        password: '',
        name: '',
        email: '',
        department: '',
        horas_objetivo: 8,
        hora_inicio: '09:00'
      });
      setMessage('Usuario creado exitosamente');
    } else {
      setMessage(`Error: ${result.error}`);
    }

    setTimeout(() => setMessage(''), 3000);
  }, [newUser, createUser]);

  const handleEditUser = useCallback((user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  }, []);

  const handleSaveUser = useCallback(async (userId, userData) => {
    const result = await updateUser(userId, userData);
    
    if (result.success) {
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setMessage('Usuario actualizado exitosamente');
    } else {
      setMessage(`Error: ${result.error}`);
    }

    setTimeout(() => setMessage(''), 3000);
  }, [updateUser]);

  const handleDeleteUser = useCallback(async (userId, userName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de eliminar el usuario ${userName}? Esta acción no se puede deshacer.`,
      danger: true,
      onConfirm: async () => {
        const result = await deleteUser(userId);
        
        if (result.success) {
          setMessage('Usuario eliminado exitosamente');
        } else {
          setMessage(`Error: ${result.error}`);
        }

        setTimeout(() => setMessage(''), 3000);
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, danger: false });
      }
    });
  }, [deleteUser]);

  const handleCreateCategory = useCallback(async () => {
    if (!newCategory.department || !newCategory.name) {
      setMessage('Todos los campos son obligatorios');
      return;
    }

    const result = await createCategory(newCategory.department, newCategory.name);
    
    if (result.success) {
      setNewCategory({ department: '', name: '' });
      setMessage('Categoría creada exitosamente');
    } else {
      setMessage(`Error: ${result.error}`);
    }

    setTimeout(() => setMessage(''), 3000);
  }, [newCategory, createCategory]);

  const handleDeleteCategory = useCallback(async (categoryId, categoryName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Categoría',
      message: `¿Estás seguro de eliminar la categoría "${categoryName}"?`,
      danger: true,
      onConfirm: async () => {
        const result = await deleteCategory(categoryId, categoryName);
        
        if (result.success) {
          setMessage('Categoría eliminada exitosamente');
        } else {
          setMessage(`Error: ${result.error}`);
        }

        setTimeout(() => setMessage(''), 3000);
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, danger: false });
      }
    });
  }, [deleteCategory]);

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, danger: false });
  }, []);

  useEffect(() => {
    const loadAlerts = async () => {
      const generatedAlerts = await generateAlerts();
      setAlerts(generatedAlerts);
    };
    
    if (users.length > 0 && tasks.length >= 0) {
      loadAlerts();
    }
  }, [users, tasks, generateAlerts]);

  const categoriesByDepartment = useMemo(() => {
    return categories.reduce((acc, category) => {
      if (!acc[category.department]) {
        acc[category.department] = [];
      }
      acc[category.department].push(category);
      return acc;
    }, {});
  }, [categories]);

  const analyticsData = useMemo(() => {
    const totalHours = tasks.reduce((sum, task) => sum + parseFloat(task.hours), 0);
    const totalTasks = tasks.length;
    const activeEmployees = users.filter(u => u.role !== 'admin').length;

    const hoursByEmployee = users
      .filter(u => u.role !== 'admin')
      .map(user => ({
        name: user.name,
        hours: tasks
          .filter(task => task.user_id === user.id)
          .reduce((sum, task) => sum + parseFloat(task.hours), 0)
      }))
      .sort((a, b) => b.hours - a.hours);

    const hoursByCategory = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + parseFloat(task.hours);
      return acc;
    }, {});

    const topEmployee = hoursByEmployee[0];
    const topCategoryEntry = Object.entries(hoursByCategory)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      totalHours: totalHours.toFixed(2),
      totalTasks,
      activeEmployees,
      hoursByEmployee,
      hoursByCategory,
      topEmployee,
      topCategory: topCategoryEntry ? { name: topCategoryEntry[0], hours: topCategoryEntry[1] } : null
    };
  }, [users, tasks]);

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Crear Nuevo Usuario</h3>
        
        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            message.includes('Error') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <OptimizedInput
            value={newUser.username}
            onChange={(value) => setNewUser(prev => ({ ...prev, username: value }))}
            placeholder="Username"
            required
          />
          
          <OptimizedInput
            type="text"
            value={newUser.password}
            onChange={(value) => setNewUser(prev => ({ ...prev, password: value }))}
            placeholder="Contraseña (mín. 6 caracteres)"
            required
          />
          
          <OptimizedInput
            value={newUser.name}
            onChange={(value) => setNewUser(prev => ({ ...prev, name: value }))}
            placeholder="Nombre completo"
            required
          />
          
          <OptimizedInput
            type="email"
            value={newUser.email}
            onChange={(value) => setNewUser(prev => ({ ...prev, email: value }))}
            placeholder="email@empresa.com"
            required
          />
          
          <OptimizedSelect
            value={newUser.department}
            onChange={(value) => setNewUser(prev => ({ ...prev, department: value }))}
            options={departments}
            placeholder="Seleccionar departamento"
          />
          
          <OptimizedInput
            type="number"
            min="1"
            max="12"
            step="0.5"
            value={newUser.horas_objetivo}
            onChange={(value) => setNewUser(prev => ({ ...prev, horas_objetivo: parseFloat(value) }))}
            placeholder="Horas objetivo"
          />
          
          <OptimizedInput
            type="time"
            value={newUser.hora_inicio}
            onChange={(value) => setNewUser(prev => ({ ...prev, hora_inicio: value }))}
          />
          
          <div className="md:col-span-2">
            <button
              onClick={handleCreateUser}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Crear Usuario
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Usuarios Existentes</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Usuario</th>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Departamento</th>
                <th className="p-3 text-left">Horas Objetivo</th>
                <th className="p-3 text-left">Rol</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{u.username}</td>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.department}</td>
                  <td className="p-3">{u.horas_objetivo}h</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {u.role === 'admin' ? 'Admin' : 'Empleado'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditUser(u)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCategoriesTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Crear Nueva Categoría</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <OptimizedSelect
            value={newCategory.department}
            onChange={(value) => setNewCategory(prev => ({ ...prev, department: value }))}
            options={departments}
            placeholder="Seleccionar departamento"
          />
          
          <OptimizedInput
            value={newCategory.name}
            onChange={(value) => setNewCategory(prev => ({ ...prev, name: value }))}
            placeholder="Nombre de la categoría"
            required
          />
          
          <button
            onClick={handleCreateCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Crear Categoría
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(categoriesByDepartment).map(([dept, cats]) => (
          <div key={dept} className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">{dept}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {cats.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span>{category.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar categoría"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            {cats.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No hay categorías en este departamento
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAssignTasksTab = () => (
    <AssignTasksManagement
      users={users}
      assignedTasks={assignedTasks}
      onCreateTask={createAssignedTask}
      onDeleteTask={deleteAssignedTask}
      onGetFiltered={getAssignedTasksWithFilters}
    />
  );

  const renderAlertsTab = () => (
    <AlertsManagement
      alerts={alerts}
      users={users}
      onArchive={archiveAlert}
      onRestore={restoreAlert}
      onGetFiltered={getAlertsWithFilters}
    />
  );

  const renderGeneralAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{analyticsData.totalHours}h</div>
          <div className="text-blue-600">Total de horas registradas</div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-green-600">{analyticsData.totalTasks}</div>
          <div className="text-green-600">Total de tareas</div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">{analyticsData.activeEmployees}</div>
          <div className="text-purple-600">Empleados activos</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Empleado Destacado</h3>
          {analyticsData.topEmployee ? (
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.topEmployee.name}
              </div>
              <div className="text-gray-600">
                {analyticsData.topEmployee.hours.toFixed(1)} horas registradas
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No hay datos disponibles</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Categoría Líder</h3>
          {analyticsData.topCategory ? (
            <div>
              <div className="text-2xl font-bold text-green-600">
                {analyticsData.topCategory.name}
              </div>
              <div className="text-gray-600">
                {analyticsData.topCategory.hours.toFixed(1)} horas registradas
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No hay datos disponibles</p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Horas por Empleado</h3>
        <div className="space-y-3">
          {analyticsData.hoursByEmployee.slice(0, 10).map((emp, index) => (
            <div key={emp.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span>{emp.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(emp.hours / Math.max(...analyticsData.hoursByEmployee.map(e => e.hours))) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="w-16 text-right font-medium">{emp.hours.toFixed(1)}h</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Horas por Categoría</h3>
        <div className="space-y-3">
          {Object.entries(analyticsData.hoursByCategory)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([category, hours], index) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span>{category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(hours / Math.max(...Object.values(analyticsData.hoursByCategory))) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="w-16 text-right font-medium">{hours.toFixed(1)}h</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="border-b">
        <div className="flex space-x-8">
          {analyticsSubTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveAnalyticsTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeAnalyticsTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeAnalyticsTab === 'general' && renderGeneralAnalytics()}
      {activeAnalyticsTab === 'user' && (
        <UserAnalytics
          users={users}
          tasks={tasks}
          selectedUserId={selectedUserId}
          onUserChange={setSelectedUserId}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
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
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando...</p>
          </div>
        )}

        {!loading && (
          <>
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'categories' && renderCategoriesTab()}
            {activeTab === 'assign-tasks' && renderAssignTasksTab()}
            {activeTab === 'alerts' && renderAlertsTab()}
            {activeTab === 'analytics' && renderAnalyticsTab()}
          </>
        )}
      </div>

      <EditUserModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
        departments={departments}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
        danger={confirmModal.danger}
        confirmText={confirmModal.danger ? "Eliminar" : "Confirmar"}
      />
    </div>
  );
});

// Componente de Login
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Clock className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            TimeTracker Pro
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gestión de Tiempo Laboral
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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

// Componente principal
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
    return <AdminPanel user={currentUser} onLogout={handleLogout} />;
  }

  return <EmployeePanel user={currentUser} onLogout={handleLogout} />;
};

export default App;
