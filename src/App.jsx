import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Users, Clock, BarChart3, Settings, Plus, Edit2, Trash2, Play, Pause, CheckCircle, AlertTriangle, TrendingUp, Eye, EyeOff, User, Building, Calendar, Target, Activity, AlertCircle } from 'lucide-react';

// Datos iniciales
const initialUsers = [
  { id: 1, username: 'juan', password: 'abc123', name: 'Juan Pérez', email: 'juan@empresa.com', department: 'Marketing', horasObjetivo: 8, horaInicio: '09:00' },
  { id: 2, username: 'maria', password: 'def456', name: 'María García', email: 'maria@empresa.com', department: 'Ventas', horasObjetivo: 7.5, horaInicio: '08:30' },
  { id: 3, username: 'admin', password: 'admin1', name: 'Administrador', email: 'admin@empresa.com', department: 'Administración', horasObjetivo: 8, horaInicio: '09:00', role: 'admin' },
  { id: 4, username: 'carlos', password: 'demo123', name: 'Carlos Martín', email: 'carlos@empresa.com', department: 'Marketing', horasObjetivo: 8, horaInicio: '09:00' }
];

const departments = ['Marketing', 'Ventas', 'Atención al Cliente', 'Administración', 'Edición', 'Equipo Docente'];

const initialCategories = {
  'Marketing': ['SEO', 'SEM', 'Redes Sociales', 'Contenido'],
  'Ventas': ['Prospección', 'Reuniones', 'Cierre', 'Seguimiento'],
  'Atención al Cliente': ['Soporte', 'Reclamaciones', 'Consultas'],
  'Administración': ['Finanzas', 'RRHH', 'Legal'],
  'Edición': ['Diseño', 'Redacción', 'Revisión'],
  'Equipo Docente': ['Clases', 'Preparación', 'Evaluación']
};

// Datos demo para Carlos
const carlosDemoTasks = [
  // Día actual (hoy)
  { id: 1, userId: 4, description: 'Optimización SEO página principal', category: 'SEO', hours: 2.5, date: new Date().toISOString().split('T')[0], horario: '09:00-11:30' },
  { id: 2, userId: 4, description: 'Campaña SEM Google Ads', category: 'SEM', hours: 2, date: new Date().toISOString().split('T')[0], horario: '11:30-13:30' },
  { id: 3, userId: 4, description: 'Contenido para redes sociales', category: 'Redes Sociales', hours: 1, date: new Date().toISOString().split('T')[0], horario: '14:30-15:30' },
  
  // Día anterior (perfecto - 8.0h)
  { id: 4, userId: 4, description: 'Análisis keywords competencia', category: 'SEO', hours: 3, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], horario: '09:00-12:00' },
  { id: 5, userId: 4, description: 'Optimización campañas SEM', category: 'SEM', hours: 2.5, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], horario: '12:00-14:30' },
  { id: 6, userId: 4, description: 'Posts Instagram y LinkedIn', category: 'Redes Sociales', hours: 1.5, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], horario: '15:30-17:00' },
  { id: 7, userId: 4, description: 'Blog post sobre marketing digital', category: 'Contenido', hours: 1, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], horario: '17:00-18:00' },
  
  // Hace 2 días (exceso - 10.5h)
  { id: 8, userId: 4, description: 'Auditoría completa SEO', category: 'SEO', hours: 4, date: new Date(Date.now() - 172800000).toISOString().split('T')[0], horario: '09:00-13:00' },
  { id: 9, userId: 4, description: 'Lanzamiento campaña Black Friday', category: 'SEM', hours: 4, date: new Date(Date.now() - 172800000).toISOString().split('T')[0], horario: '14:00-18:00' },
  { id: 10, userId: 4, description: 'Crisis management redes sociales', category: 'Redes Sociales', hours: 2.5, date: new Date(Date.now() - 172800000).toISOString().split('T')[0], horario: '18:00-20:30' },
  
  // Hace 3 días (incompleto - 4.5h)
  { id: 11, userId: 4, description: 'Research palabras clave', category: 'SEO', hours: 2, date: new Date(Date.now() - 259200000).toISOString().split('T')[0], horario: '09:00-11:00' },
  { id: 12, userId: 4, description: 'Reunión con cliente', category: 'SEM', hours: 1.5, date: new Date(Date.now() - 259200000).toISOString().split('T')[0], horario: '11:00-12:30' },
  { id: 13, userId: 4, description: 'Planificación contenido semanal', category: 'Contenido', hours: 1, date: new Date(Date.now() - 259200000).toISOString().split('T')[0], horario: '14:30-15:30' }
];

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

// Componente TextArea optimizado
const OptimizedTextArea = memo(({ value, onChange, placeholder, className = '', rows = 3, ...props }) => {
  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      rows={rows}
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

// Componente Login
const Login = memo(({ onLogin, loginError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Usar el error del componente padre si existe
  const displayError = loginError || error;

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos
    
    if (username.length === 0 || password.length === 0) {
      setError('Por favor, complete todos los campos');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    onLogin(username, password);
  }, [username, password, onLogin]);

  const handleUsernameChange = useCallback((value) => {
    setUsername(value);
    if (displayError) setError(''); // Limpiar error local cuando el usuario empiece a escribir
  }, [displayError]);

  const handlePasswordChange = useCallback((value) => {
    setPassword(value);
    if (displayError) setError(''); // Limpiar error local cuando el usuario empiece a escribir
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
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Iniciar Sesión
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
const AvisosEmpleado = memo(({ user, tasks, diasJustificados, setDiasJustificados }) => {
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    const calcularAvisos = () => {
      const avisosEncontrados = [];
      
      // Generar fechas de los últimos 15 días (más enfocado para empleados)
      const fechas = [];
      for (let i = 1; i < 15; i++) { // Empezar desde 1 para excluir hoy
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
          task.userId === user.id && task.date === fecha
        );
        
        const horasRegistradas = tareasDelDia.reduce((sum, task) => sum + task.hours, 0);
        const horasObjetivo = user.horasObjetivo || 8;
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

  const justificarDia = useCallback((aviso) => {
    setDiasJustificados(prev => [...prev, {
      empleadoId: user.id,
      fecha: aviso.fecha,
      motivo: 'Vacaciones o Festivo',
      fechaJustificacion: new Date().toISOString()
    }]);
  }, [user.id, setDiasJustificados]);

  const avisosValidos = useMemo(() => {
    return avisos.filter(aviso => 
      !diasJustificados.some(justif => 
        justif.empleadoId === user.id && justif.fecha === aviso.fecha
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
        {avisosValidos.slice(0, 5).map(aviso => ( // Mostrar máximo 5 avisos
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

                {aviso.tipo === 'sin-registro' ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      💡 <strong>Acción:</strong> Agrega las tareas que realizaste este día
                    </p>
                    <button
                      onClick={() => justificarDia(aviso)}
                      className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-sm rounded-md transition-colors border border-blue-200"
                    >
                      🏖️ Marcar como "Vacaciones o Festivo"
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      💡 <strong>Acción:</strong> Completa las horas faltantes de este día ({aviso.tareasExistentes} tareas ya registradas)
                    </p>
                    <button
                      onClick={() => justificarDia(aviso)}
                      className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-sm rounded-md transition-colors border border-blue-200"
                    >
                      🏖️ Marcar como "Vacaciones o Festivo"
                    </button>
                  </div>
                )}
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

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="text-blue-600 mt-0.5">ℹ️</div>
          <div className="text-sm text-blue-800">
            <strong>Consejo:</strong> Puedes agregar tareas de días anteriores usando el formulario de arriba. 
            Solo cambia la fecha de la tarea a la fecha que quieres completar.
          </div>
        </div>
      </div>
    </div>
  );
});

// Panel de empleado
const EmployeePanel = memo(({ user, categories, tasks, setTasks, users, diasJustificados, setDiasJustificados, setCategories }) => {
  const [newTask, setNewTask] = useState({ description: '', category: '', hours: '', date: new Date().toISOString().split('T')[0] });
  const [editingTask, setEditingTask] = useState(null);
  const [activeTimer, setActiveTimer] = useState(null);
  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState(null);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [categoryError, setCategoryError] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');

  const userCategories = useMemo(() => categories[user.department] || [], [categories, user.department]);
  
  const todayTasks = useMemo(() => 
    tasks.filter(task => 
      task.userId === user.id && 
      task.date === new Date().toISOString().split('T')[0]
    ), [tasks, user.id]
  );

  const totalHours = useMemo(() => 
    todayTasks.reduce((sum, task) => sum + task.hours, 0), 
    [todayTasks]
  );

  const calculateNextHorario = useCallback((hours, date) => {
    const tasksForDate = tasks.filter(task => 
      task.userId === user.id && task.date === date
    );

    if (tasksForDate.length === 0) {
      const start = user.horaInicio;
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
  }, [tasks, user.id, user.horaInicio]);

  const handleAddTask = useCallback(() => {
    if (!newTask.description || !newTask.category || !newTask.hours || !newTask.date) return;

    const hours = parseFloat(newTask.hours);
    const task = {
      id: Date.now(),
      userId: user.id,
      description: newTask.description,
      category: newTask.category,
      hours,
      date: newTask.date,
      horario: calculateNextHorario(hours, newTask.date)
    };

    setTasks(prev => [...prev, task]);
    setNewTask({ description: '', category: '', hours: '', date: new Date().toISOString().split('T')[0] });
  }, [newTask, user.id, calculateNextHorario, setTasks]);

  const handleEditTask = useCallback((task) => {
    setEditingTask({ ...task });
  }, []);

  const handleUpdateTask = useCallback(() => {
    if (!editingTask.description || !editingTask.category || !editingTask.hours) return;

    setTasks(prev => prev.map(task => 
      task.id === editingTask.id ? editingTask : task
    ));
    setEditingTask(null);
  }, [editingTask, setTasks]);

  const handleDeleteTask = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setDeleteTaskConfirm(task);
  }, [tasks]);

  const confirmDeleteTask = useCallback(() => {
    if (deleteTaskConfirm) {
      setTasks(prev => prev.filter(task => task.id !== deleteTaskConfirm.id));
      setDeleteTaskConfirm(null);
    }
  }, [deleteTaskConfirm, setTasks]);

  const cancelDeleteTask = useCallback(() => {
    setDeleteTaskConfirm(null);
  }, []);

  const handleTimerUpdate = useCallback((taskId, hours) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, hours } : task
    ));
  }, [setTasks]);

  const handleTimerToggle = useCallback((taskId) => {
    setActiveTimer(prev => prev === taskId ? null : taskId);
  }, []);

  // Función para calcular similitud entre strings
  const calculateSimilarity = useCallback((str1, str2) => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 1; // Exactamente igual
    if (s1.includes(s2) || s2.includes(s1)) return 0.8; // Una contiene a la otra
    
    // Similitud básica por caracteres comunes
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1;
    
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) matches++;
    }
    
    return matches / longer.length;
  }, []);

  // Buscar categorías similares
  const findSimilarCategories = useCallback((newName) => {
    const allCategories = [];
    
    // Recopilar todas las categorías existentes
    Object.values(categories).forEach(deptCategories => {
      allCategories.push(...deptCategories);
    });
    
    // Buscar similitudes
    const suggestions = allCategories
      .map(category => ({
        name: category,
        similarity: calculateSimilarity(newName, category)
      }))
      .filter(item => item.similarity > 0.5) // Umbral de similitud
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3); // Máximo 3 sugerencias
    
    return suggestions;
  }, [categories, calculateSimilarity]);

  // Manejar cambio en el nombre de nueva categoría
  const handleNewCategoryChange = useCallback((value) => {
    setNewCategoryName(value);
    setCategoryError('');
    setCategorySuccess('');
    
    if (value.trim().length > 0) {
      const suggestions = findSimilarCategories(value);
      setCategorySuggestions(suggestions);
    } else {
      setCategorySuggestions([]);
    }
  }, [findSimilarCategories]);

  // Crear nueva categoría
  const handleCreateCategory = useCallback(() => {
    const trimmedName = newCategoryName.trim();
    
    if (!trimmedName) {
      setCategoryError('Por favor, ingresa el nombre de la categoría');
      return;
    }
    
    if (trimmedName.length < 2) {
      setCategoryError('El nombre debe tener al menos 2 caracteres');
      return;
    }
    
    // Verificar si ya existe exactamente
    const userCategories = categories[user.department] || [];
    if (userCategories.some(cat => cat.toLowerCase() === trimmedName.toLowerCase())) {
      setCategoryError('Esta categoría ya existe en tu departamento');
      return;
    }
    
    // Crear la categoría
    setCategories(prev => ({
      ...prev,
      [user.department]: [...(prev[user.department] || []), trimmedName]
    }));
    
    // Seleccionar la nueva categoría automáticamente en la tarea apropiada
    if (editingTask) {
      setEditingTask(prev => ({ ...prev, category: trimmedName }));
    } else {
      setNewTask(prev => ({ ...prev, category: trimmedName }));
    }
    
    // Mostrar mensaje de éxito
    setCategorySuccess(`✅ Categoría "${trimmedName}" creada y seleccionada`);
    
    // Limpiar y cerrar modal después de un breve delay
    setTimeout(() => {
      setNewCategoryName('');
      setCategorySuggestions([]);
      setCategoryError('');
      setCategorySuccess('');
      setShowNewCategoryModal(false);
    }, 1500);
  }, [newCategoryName, categories, user.department, setCategories, setNewTask, editingTask, setEditingTask]);

  // Usar categoría sugerida
  const handleUseSuggestion = useCallback((suggestion) => {
    if (editingTask) {
      setEditingTask(prev => ({ ...prev, category: suggestion.name }));
    } else {
      setNewTask(prev => ({ ...prev, category: suggestion.name }));
    }
    
    setShowNewCategoryModal(false);
    setNewCategoryName('');
    setCategorySuggestions([]);
    setCategoryError('');
  }, [setNewTask, editingTask, setEditingTask]);

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
              {Math.min(((totalHours / user.horasObjetivo) * 100), 100).toFixed(1)}%
            </div>
            <div className="text-gray-600 text-sm">Jornada completada</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                totalHours >= user.horasObjetivo ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min((totalHours / user.horasObjetivo) * 100, 100)}%` }}
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
                          onChange={(value) => {
                            if (value === '__create_new__') {
                              setShowNewCategoryModal(true);
                            } else {
                              setEditingTask(prev => ({ ...prev, category: value }));
                            }
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {userCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="__create_new__" className="bg-blue-50 text-blue-700 font-medium">
                            ➕ Crear nueva
                          </option>
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
        setDiasJustificados={setDiasJustificados}
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
                onChange={handleNewCategoryChange}
                placeholder="Ej: Email Marketing, Diseño Web..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Se agregará a tu departamento: <strong>{user.department}</strong>
              </p>
            </div>

            {/* Mensajes de error */}
            {categoryError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {categoryError}
              </div>
            )}

            {/* Mensajes de éxito */}
            {categorySuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {categorySuccess}
              </div>
            )}

            {/* Sugerencias de categorías similares */}
            {categorySuggestions.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  💡 ¿Quizás te refieres a alguna de estas?
                </p>
                <div className="space-y-1">
                  {categorySuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleUseSuggestion(suggestion)}
                      className="block w-full text-left px-2 py-1 text-sm bg-white hover:bg-yellow-100 border border-yellow-200 rounded transition-colors"
                    >
                      <span className="font-medium">{suggestion.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({Math.round(suggestion.similarity * 100)}% similar)
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  setShowNewCategoryModal(false);
                  setNewCategoryName('');
                  setCategorySuggestions([]);
                  setCategoryError('');
                  setCategorySuccess('');
                }}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200"
                disabled={categorySuccess}
              >
                {categorySuccess ? 'Cerrando...' : 'Cancelar'}
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim() || categorySuccess}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors duration-200"
              >
                {categorySuccess ? '✓ Creada' : 'Crear Categoría'}
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

// Panel de administrador - Gestión de usuarios
const UserManagement = memo(({ users, setUsers, departments }) => {
  const [newUser, setNewUser] = useState({
    name: '', username: '', password: '', email: '', 
    department: '', horasObjetivo: 8, horaInicio: '09:00'
  });
  const [editingUser, setEditingUser] = useState(null);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  const handleAddUser = useCallback(() => {
    setUpdateError('');
    setUpdateSuccess('');
    
    if (!newUser.name || !newUser.username || !newUser.password || !newUser.email || !newUser.department) {
      setUpdateError('Por favor, complete todos los campos obligatorios');
      return;
    }
    
    if (newUser.password.length < 6) {
      setUpdateError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (users.some(u => u.username === newUser.username)) {
      setUpdateError('El nombre de usuario ya existe');
      return;
    }

    const user = {
      id: Date.now(),
      ...newUser,
      horasObjetivo: parseFloat(newUser.horasObjetivo)
    };

    setUsers(prev => [...prev, user]);
    setUpdateSuccess(`Usuario "${newUser.name}" creado correctamente`);
    setNewUser({
      name: '', username: '', password: '', email: '', 
      department: '', horasObjetivo: 8, horaInicio: '09:00'
    });
    setShowNewUserForm(false);
    
    // Limpiar mensaje de éxito después de 3 segundos
    setTimeout(() => setUpdateSuccess(''), 3000);
  }, [newUser, users, setUsers]);

  const handleEditUser = useCallback((user) => {
    setEditingUser({ ...user });
    setUpdateError('');
    setUpdateSuccess('');
  }, []);

  const handleUpdateUser = useCallback(() => {
    setUpdateError('');
    setUpdateSuccess('');
    
    console.log('🔧 DEBUGGING - Intentando actualizar usuario:', editingUser);
    console.log('🔧 DEBUGGING - Usuarios actuales:', users);
    
    // Validación más permisiva
    if (!editingUser || !editingUser.name || editingUser.name.trim().length === 0) {
      console.log('❌ ERROR: Nombre vacío');
      setUpdateError('El nombre es obligatorio');
      return;
    }
    
    if (!editingUser.username || editingUser.username.trim().length === 0) {
      console.log('❌ ERROR: Username vacío');
      setUpdateError('El nombre de usuario es obligatorio');
      return;
    }
    
    if (!editingUser.password || editingUser.password.length < 3) {  // Más permisivo temporalmente
      console.log('❌ ERROR: Password muy corto:', editingUser.password);
      setUpdateError('La contraseña debe tener al menos 3 caracteres');
      return;
    }
    
    if (!editingUser.email || editingUser.email.trim().length === 0) {
      console.log('❌ ERROR: Email vacío');
      setUpdateError('El email es obligatorio');
      return;
    }
    
    if (!editingUser.department) {
      console.log('❌ ERROR: Departamento vacío');
      setUpdateError('El departamento es obligatorio');
      return;
    }

    // Verificar username duplicado
    const existingUser = users.find(u => u.username === editingUser.username && u.id !== editingUser.id);
    if (existingUser) {
      console.log('❌ ERROR: Username duplicado');
      setUpdateError('Este nombre de usuario ya está en uso por otro empleado');
      return;
    }

    console.log('✅ VALIDACIÓN EXITOSA - Actualizando usuario...');
    
    // Actualizar el usuario
    setUsers(prev => {
      const newUsers = prev.map(user => 
        user.id === editingUser.id ? { ...editingUser } : user
      );
      console.log('✅ USUARIOS ACTUALIZADOS:', newUsers);
      return newUsers;
    });
    
    console.log('✅ ACTUALIZACIÓN COMPLETADA');
    setUpdateSuccess(`Usuario "${editingUser.name}" actualizado correctamente`);
    setEditingUser(null);
    
    // Limpiar mensaje de éxito después de 3 segundos
    setTimeout(() => setUpdateSuccess(''), 3000);
  }, [editingUser, setUsers, users]);

  const handleDeleteUser = useCallback((userId) => {
    const user = users.find(u => u.id === userId);
    if (user?.username === 'admin') {
      alert('No se puede eliminar el usuario administrador');
      return;
    }
    
    setDeleteConfirm(user);
  }, [users]);

  const confirmDelete = useCallback(() => {
    if (deleteConfirm) {
      setUsers(prev => prev.filter(user => user.id !== deleteConfirm.id));
      setUpdateSuccess(`Usuario "${deleteConfirm.name}" eliminado correctamente`);
      setDeleteConfirm(null);
      setUpdateError('');
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setUpdateSuccess(''), 3000);
    }
  }, [deleteConfirm, setUsers]);

  const cancelDelete = useCallback(() => {
    setDeleteConfirm(null);
    setUpdateError('');
    setUpdateSuccess('');
  }, []);

  const nonAdminUsers = useMemo(() => users.filter(u => u.role !== 'admin'), [users]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
        <button
          onClick={() => {
            setShowNewUserForm(true);
            setUpdateError('');
            setUpdateSuccess('');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200"
        >
          <Plus className="mr-2" size={16} />
          Nuevo Usuario
        </button>
      </div>

      {/* Formulario nuevo usuario */}
      {showNewUserForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Crear Nuevo Usuario</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <OptimizedInput
                  value={newUser.name}
                  onChange={(value) => setNewUser(prev => ({ ...prev, name: value }))}
                  placeholder="Nombre completo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                <OptimizedInput
                  value={newUser.username}
                  onChange={(value) => setNewUser(prev => ({ ...prev, username: value }))}
                  placeholder="Nombre de usuario"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <OptimizedInput
                  type="password"
                  value={newUser.password}
                  onChange={(value) => setNewUser(prev => ({ ...prev, password: value }))}
                  placeholder="Contraseña (mín. 6 caracteres)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <OptimizedInput
                  type="email"
                  value={newUser.email}
                  onChange={(value) => setNewUser(prev => ({ ...prev, email: value }))}
                  placeholder="Correo electrónico"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                <OptimizedSelect
                  value={newUser.department}
                  onChange={(value) => setNewUser(prev => ({ ...prev, department: value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar departamento</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </OptimizedSelect>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horas objetivo</label>
                <OptimizedInput
                  type="number"
                  step="0.5"
                  min="1"
                  max="12"
                  value={newUser.horasObjetivo}
                  onChange={(value) => setNewUser(prev => ({ ...prev, horasObjetivo: value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de inicio</label>
                <OptimizedInput
                  type="time"
                  value={newUser.horaInicio}
                  onChange={(value) => setNewUser(prev => ({ ...prev, horaInicio: value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleAddUser}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Crear Usuario
              </button>
              <button
                onClick={() => {
                  setShowNewUserForm(false);
                  setUpdateError('');
                  setUpdateSuccess('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes de feedback para actualizaciones */}
      {updateError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {updateError}
        </div>
      )}
      
      {updateSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {updateSuccess}
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {nonAdminUsers.map(user => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm border p-6">
            {editingUser?.id === user.id ? (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-blue-600">Editando: {editingUser.name}</h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo</label>
                      <OptimizedInput
                        value={editingUser.name}
                        onChange={(value) => {
                          setEditingUser(prev => ({ ...prev, name: value }));
                          setUpdateError('');
                        }}
                        placeholder="Nombre completo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Usuario</label>
                      <OptimizedInput
                        value={editingUser.username}
                        onChange={(value) => {
                          setEditingUser(prev => ({ ...prev, username: value }));
                          setUpdateError('');
                        }}
                        placeholder="Usuario"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña</label>
                      <OptimizedInput
                        type="password"
                        value={editingUser.password}
                        onChange={(value) => {
                          setEditingUser(prev => ({ ...prev, password: value }));
                          setUpdateError('');
                        }}
                        placeholder="Contraseña (mín. 6 caracteres)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                      <OptimizedInput
                        type="email"
                        value={editingUser.email}
                        onChange={(value) => {
                          setEditingUser(prev => ({ ...prev, email: value }));
                          setUpdateError('');
                        }}
                        placeholder="Email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Departamento</label>
                      <OptimizedSelect
                        value={editingUser.department}
                        onChange={(value) => {
                          setEditingUser(prev => ({ ...prev, department: value }));
                          setUpdateError('');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </OptimizedSelect>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Horas objetivo</label>
                        <OptimizedInput
                          type="number"
                          step="0.5"
                          min="1"
                          max="12"
                          value={editingUser.horasObjetivo}
                          onChange={(value) => setEditingUser(prev => ({ ...prev, horasObjetivo: parseFloat(value) || 8 }))}
                          placeholder="Horas objetivo"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Hora inicio</label>
                        <OptimizedInput
                          type="time"
                          value={editingUser.horaInicio}
                          onChange={(value) => setEditingUser(prev => ({ ...prev, horaInicio: value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        console.log('✅ BOTÓN GUARDAR CLICKEADO');
                        handleUpdateUser();
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md text-sm transition-colors duration-200 font-medium"
                    >
                      ✓ Guardar Cambios
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUser(null);
                        setUpdateError('');
                        setUpdateSuccess('');
                      }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-md text-sm transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h4 className="font-semibold text-lg">{user.name}</h4>
                  <p className="text-gray-600">@{user.username}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Email:</span> {user.email}</div>
                  <div><span className="text-gray-600">Departamento:</span> {user.department}</div>
                  <div><span className="text-gray-600">Horas objetivo:</span> {user.horasObjetivo}h</div>
                  <div><span className="text-gray-600">Hora inicio:</span> {user.horaInicio}</div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm transition-colors duration-200 flex items-center justify-center"
                  >
                    <Edit2 className="mr-1" size={14} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md text-sm transition-colors duration-200 flex items-center justify-center"
                  >
                    <Trash2 className="mr-1" size={14} />
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-600 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Confirmar Eliminación</h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Está seguro de que desea eliminar al usuario <strong>{deleteConfirm.name}</strong>? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
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

// Panel de administrador - Gestión de categorías
const CategoryManagement = memo(({ categories, setCategories, departments }) => {
  const [newCategory, setNewCategory] = useState({ department: '', name: '' });
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddCategory = useCallback(() => {
    setErrorMessage('');
    setSuccessMessage('');
    
    console.log('Intentando agregar categoría:', newCategory); // Para debugging
    
    if (!newCategory.department) {
      setErrorMessage('Por favor, selecciona un departamento');
      return;
    }
    
    if (!newCategory.name.trim()) {
      setErrorMessage('Por favor, ingresa el nombre de la categoría');
      return;
    }

    // Verificar si la categoría ya existe
    const existingCategories = categories[newCategory.department] || [];
    if (existingCategories.includes(newCategory.name.trim())) {
      setErrorMessage('Esta categoría ya existe en el departamento seleccionado');
      return;
    }

    // Agregar la categoría
    setCategories(prev => ({
      ...prev,
      [newCategory.department]: [...(prev[newCategory.department] || []), newCategory.name.trim()]
    }));
    
    setSuccessMessage(`Categoría "${newCategory.name.trim()}" agregada exitosamente`);
    setNewCategory({ department: '', name: '' });
    
    // Limpiar mensaje de éxito después de 3 segundos
    setTimeout(() => setSuccessMessage(''), 3000);
  }, [newCategory, setCategories, categories]);

  const handleDeleteCategory = useCallback((department, category) => {
    setDeleteCategoryConfirm({ department, category });
  }, []);

  const confirmDeleteCategory = useCallback(() => {
    if (deleteCategoryConfirm) {
      setCategories(prev => ({
        ...prev,
        [deleteCategoryConfirm.department]: prev[deleteCategoryConfirm.department].filter(cat => cat !== deleteCategoryConfirm.category)
      }));
      setSuccessMessage(`Categoría "${deleteCategoryConfirm.category}" eliminada exitosamente`);
      setDeleteCategoryConfirm(null);
      setErrorMessage('');
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, [deleteCategoryConfirm, setCategories]);

  const cancelDeleteCategory = useCallback(() => {
    setDeleteCategoryConfirm(null);
    setErrorMessage('');
    setSuccessMessage('');
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Gestión de Categorías</h2>

      {/* Formulario nueva categoría */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Agregar Nueva Categoría</h3>
        
        {/* Mensajes de feedback */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departamento <span className="text-red-500">*</span>
              </label>
              <OptimizedSelect
                value={newCategory.department}
                onChange={(value) => {
                  setNewCategory(prev => ({ ...prev, department: value }));
                  setErrorMessage('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar departamento</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </OptimizedSelect>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la categoría <span className="text-red-500">*</span>
              </label>
              <OptimizedInput
                value={newCategory.name}
                onChange={(value) => {
                  setNewCategory(prev => ({ ...prev, name: value }));
                  setErrorMessage('');
                }}
                placeholder="Ej: Marketing Digital, Ventas Online..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleAddCategory}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors duration-200 flex items-center"
          >
            <Plus className="mr-2" size={16} />
            Agregar Categoría
          </button>
        </div>
      </div>

      {/* Categorías por departamento */}
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
                    className="text-red-600 hover:bg-red-100 p-1 rounded transition-colors"
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

      {/* Modal de confirmación de eliminación de categoría */}
      {deleteCategoryConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-600 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Confirmar Eliminación</h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Está seguro de que desea eliminar la categoría <strong>{deleteCategoryConfirm.category}</strong> del departamento <strong>{deleteCategoryConfirm.department}</strong>? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelDeleteCategory}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteCategory}
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

// Panel de Analytics
const AnalyticsPanel = memo(({ users, tasks, categories }) => {
  const [chartData, setChartData] = useState({
    dailyHours: {},
    employeeHours: {},
    categoryDistribution: {},
    departmentHours: {}
  });

  useEffect(() => {
    // Procesar datos para gráficos
    const dailyHours = {};
    const employeeHours = {};
    const categoryDistribution = {};
    const departmentHours = {};

    // Agrupar tareas por fecha
    tasks.forEach(task => {
      const user = users.find(u => u.id === task.userId);
      if (!user) return;

      // Horas por día
      if (!dailyHours[task.date]) dailyHours[task.date] = 0;
      dailyHours[task.date] += task.hours;

      // Horas por empleado
      if (!employeeHours[user.name]) employeeHours[user.name] = 0;
      employeeHours[user.name] += task.hours;

      // Distribución por categoría
      if (!categoryDistribution[task.category]) categoryDistribution[task.category] = 0;
      categoryDistribution[task.category] += task.hours;

      // Horas por departamento
      if (!departmentHours[user.department]) departmentHours[user.department] = 0;
      departmentHours[user.department] += task.hours;
    });

    setChartData({
      dailyHours,
      employeeHours,
      categoryDistribution,
      departmentHours
    });
  }, [tasks, users]);

  const totalHours = useMemo(() => 
    Object.values(chartData.employeeHours).reduce((sum, hours) => sum + hours, 0), 
    [chartData.employeeHours]
  );

  const totalTasks = useMemo(() => tasks.length, [tasks]);
  const activeEmployees = useMemo(() => Object.keys(chartData.employeeHours).length, [chartData.employeeHours]);
  const averageHoursPerEmployee = useMemo(() => 
    activeEmployees > 0 ? (totalHours / activeEmployees).toFixed(1) : 0, 
    [totalHours, activeEmployees]
  );

  // Encontrar el empleado más productivo
  const topEmployee = useMemo(() => {
    const entries = Object.entries(chartData.employeeHours);
    if (entries.length === 0) return null;
    return entries.reduce((max, current) => current[1] > max[1] ? current : max);
  }, [chartData.employeeHours]);

  // Categoría más utilizada
  const topCategory = useMemo(() => {
    const entries = Object.entries(chartData.categoryDistribution);
    if (entries.length === 0) return null;
    return entries.reduce((max, current) => current[1] > max[1] ? current : max);
  }, [chartData.categoryDistribution]);

  const getColorForIndex = (index) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500',
      'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analytics Avanzados</h2>

      {/* Métricas clave */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Horas</p>
              <p className="text-2xl font-bold text-blue-600">{totalHours.toFixed(1)}h</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tareas</p>
              <p className="text-2xl font-bold text-green-600">{totalTasks}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Target className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Empleados Activos</p>
              <p className="text-2xl font-bold text-purple-600">{activeEmployees}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Promedio/Empleado</p>
              <p className="text-2xl font-bold text-orange-600">{averageHoursPerEmployee}h</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Activity className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Insights destacados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 text-green-600" size={20} />
            Empleado Destacado
          </h3>
          {topEmployee ? (
            <div>
              <p className="text-xl font-bold text-gray-800">{topEmployee[0]}</p>
              <p className="text-sm text-gray-600">{topEmployee[1].toFixed(1)} horas registradas</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No hay datos disponibles</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="mr-2 text-blue-600" size={20} />
            Categoría Líder
          </h3>
          {topCategory ? (
            <div>
              <p className="text-xl font-bold text-gray-800">{topCategory[0]}</p>
              <p className="text-sm text-gray-600">{topCategory[1].toFixed(1)} horas totales</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No hay datos disponibles</p>
          )}
        </div>
      </div>

      {/* Gráfico de barras - Horas por empleado */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="mr-2" size={20} />
          Comparativa por Empleado
        </h3>
        <div className="space-y-4">
          {Object.entries(chartData.employeeHours)
            .sort(([,a], [,b]) => b - a)
            .map(([employee, hours], index) => {
              const percentage = totalHours > 0 ? (hours / totalHours) * 100 : 0;
              return (
                <div key={employee}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{employee}</span>
                    <span>{hours.toFixed(1)}h ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${getColorForIndex(index)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Distribución por categorías */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="mr-2" size={20} />
          Distribución por Categorías
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {Object.entries(chartData.categoryDistribution)
              .sort(([,a], [,b]) => b - a)
              .map(([category, hours], index) => {
                const percentage = totalHours > 0 ? (hours / totalHours) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{category}</span>
                      <span>{hours.toFixed(1)}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getColorForIndex(index)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
          
          {/* Donut visual simplificado */}
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-800">{Object.keys(chartData.categoryDistribution).length}</span>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mt-20">Categorías</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horas por departamento */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Building className="mr-2" size={20} />
          Productividad por Departamento
        </h3>
        <div className="space-y-4">
          {Object.entries(chartData.departmentHours)
            .sort(([,a], [,b]) => b - a)
            .map(([department, hours], index) => {
              const percentage = totalHours > 0 ? (hours / totalHours) * 100 : 0;
              return (
                <div key={department}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{department}</span>
                    <span>{hours.toFixed(1)}h ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full transition-all duration-500 ${getColorForIndex(index)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Evolución temporal */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="mr-2" size={20} />
          Evolución Temporal
        </h3>
        <div className="space-y-3">
          {Object.entries(chartData.dailyHours)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .slice(0, 7) // Últimos 7 días
            .map(([date, hours]) => {
              const maxHours = Math.max(...Object.values(chartData.dailyHours));
              const percentage = maxHours > 0 ? (hours / maxHours) * 100 : 0;
              const formattedDate = new Date(date).toLocaleDateString('es-ES', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short' 
              });
              
              return (
                <div key={date}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{formattedDate}</span>
                    <span>{hours.toFixed(1)}h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
});

// Panel de Alertas
const AlertasPanel = memo(({ users, tasks, diasJustificados }) => {
  const [alertas, setAlertas] = useState([]);
  const [filtroEmpleado, setFiltroEmpleado] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [alertasDescartadas, setAlertasDescartadas] = useState([]);
  const [filtroDescartadas, setFiltroDescartadas] = useState('activas'); // 'activas', 'descartadas', 'todas'

  useEffect(() => {
    const calcularAlertas = () => {
      const alertasEncontradas = [];
      const empleadosActivos = users.filter(u => u.role !== 'admin');
      
      // Generar fechas de los últimos 30 días
      const fechas = [];
      for (let i = 0; i < 30; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        fechas.push(fecha.toISOString().split('T')[0]);
      }

      empleadosActivos.forEach(empleado => {
        fechas.forEach(fecha => {
          // No procesar fechas futuras
          const hoy = new Date().toISOString().split('T')[0];
          if (fecha > hoy) return;

          // Excluir sábados y domingos
          const fechaObj = new Date(fecha + 'T00:00:00');
          const diaSemana = fechaObj.getDay(); // 0 = domingo, 6 = sábado
          if (diaSemana === 0 || diaSemana === 6) return;

          // Calcular horas trabajadas en esta fecha
          const tareasDelDia = tasks.filter(task => 
            task.userId === empleado.id && task.date === fecha
          );
          
          const horasRegistradas = tareasDelDia.reduce((sum, task) => sum + task.hours, 0);
          const horasObjetivo = empleado.horasObjetivo || 8;
          const horasFaltantes = horasObjetivo - horasRegistradas;

          // Solo crear alerta si faltan horas (no está completo el día)
          if (horasFaltantes > 0 && horasRegistradas > 0) {
            // Solo si hay al menos alguna tarea registrada (el empleado trabajó pero no completó)
            alertasEncontradas.push({
              id: `${empleado.id}-${fecha}`,
              empleado: empleado.name,
              empleadoId: empleado.id,
              fecha: fecha,
              horasObjetivo: horasObjetivo,
              horasRegistradas: horasRegistradas,
              horasFaltantes: horasFaltantes,
              departamento: empleado.department,
              tipo: horasFaltantes >= 4 ? 'critica' : horasFaltantes >= 2 ? 'moderada' : 'leve'
            });
          } else if (horasRegistradas === 0 && fecha !== hoy) {
            // Día sin registro (más crítico)
            alertasEncontradas.push({
              id: `${empleado.id}-${fecha}`,
              empleado: empleado.name,
              empleadoId: empleado.id,
              fecha: fecha,
              horasObjetivo: horasObjetivo,
              horasRegistradas: 0,
              horasFaltantes: horasObjetivo,
              departamento: empleado.department,
              tipo: 'critica'
            });
          }
        });
      });

      // Ordenar por fecha (más recientes primero) y luego por severidad
      alertasEncontradas.sort((a, b) => {
        const fechaComparison = new Date(b.fecha) - new Date(a.fecha);
        if (fechaComparison !== 0) return fechaComparison;
        
        const tipoOrden = { critica: 3, moderada: 2, leve: 1 };
        return tipoOrden[b.tipo] - tipoOrden[a.tipo];
      });

      setAlertas(alertasEncontradas);
    };

    calcularAlertas();
  }, [users, tasks]);

  const alertasFiltradas = useMemo(() => {
    return alertas.filter(alerta => {
      // Verificar si está descartada
      const estaDescartada = alertasDescartadas.some(desc => 
        desc.empleadoId === alerta.empleadoId && desc.fecha === alerta.fecha
      );
      
      // Aplicar filtro de descartadas
      if (filtroDescartadas === 'activas' && estaDescartada) return false;
      if (filtroDescartadas === 'descartadas' && !estaDescartada) return false;
      // 'todas' muestra ambas
      
      // Aplicar filtros del usuario
      if (filtroEmpleado && alerta.empleadoId !== parseInt(filtroEmpleado)) return false;
      if (filtroFecha && alerta.fecha !== filtroFecha) return false;
      return true;
    });
  }, [alertas, filtroEmpleado, filtroFecha, alertasDescartadas, filtroDescartadas]);

  const estadisticas = useMemo(() => {
    // Calcular estadísticas basadas en las alertas filtradas actualmente mostradas
    const total = alertasFiltradas.length;
    const criticas = alertasFiltradas.filter(a => a.tipo === 'critica').length;
    const moderadas = alertasFiltradas.filter(a => a.tipo === 'moderada').length;
    const leves = alertasFiltradas.filter(a => a.tipo === 'leve').length;
    
    return { total, criticas, moderadas, leves };
  }, [alertasFiltradas]);

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const getAlertaColor = (tipo) => {
    switch (tipo) {
      case 'critica': return 'border-red-200 bg-red-50';
      case 'moderada': return 'border-orange-200 bg-orange-50';
      case 'leve': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getAlertaIcon = (tipo) => {
    switch (tipo) {
      case 'critica': return <AlertTriangle className="text-red-600" size={20} />;
      case 'moderada': return <AlertCircle className="text-orange-600" size={20} />;
      case 'leve': return <Clock className="text-yellow-600" size={20} />;
      default: return <AlertCircle className="text-gray-600" size={20} />;
    }
  };

  const getAlertaTipoTexto = (tipo) => {
    switch (tipo) {
      case 'critica': return 'Crítica';
      case 'moderada': return 'Moderada';
      case 'leve': return 'Leve';
      default: return 'Normal';
    }
  };

  const descartarAlerta = useCallback((alerta) => {
    setAlertasDescartadas(prev => [...prev, {
      empleadoId: alerta.empleadoId,
      fecha: alerta.fecha
    }]);
  }, []);

  const restaurarAlerta = useCallback((alerta) => {
    setAlertasDescartadas(prev => prev.filter(desc => 
      !(desc.empleadoId === alerta.empleadoId && desc.fecha === alerta.fecha)
    ));
  }, []);

  const isAlertaDescartada = useCallback((alerta) => {
    return alertasDescartadas.some(desc => 
      desc.empleadoId === alerta.empleadoId && desc.fecha === alerta.fecha
    );
  }, [alertasDescartadas]);

  const isAlertaJustificada = useCallback((alerta) => {
    return diasJustificados.some(justif => 
      justif.empleadoId === alerta.empleadoId && justif.fecha === alerta.fecha
    );
  }, [diasJustificados]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Control de Alertas</h2>

      {/* Resumen de alertas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {filtroDescartadas === 'activas' && 'Alertas Activas'}
                {filtroDescartadas === 'descartadas' && 'Alertas Descartadas'}
                {filtroDescartadas === 'todas' && 'Total Alertas'}
              </p>
              <p className="text-2xl font-bold text-gray-800">{estadisticas.total}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-full">
              <AlertCircle className="text-gray-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Críticas</p>
              <p className="text-2xl font-bold text-red-600">{estadisticas.criticas}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Moderadas</p>
              <p className="text-2xl font-bold text-orange-600">{estadisticas.moderadas}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertCircle className="text-orange-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leves</p>
              <p className="text-2xl font-bold text-yellow-600">{estadisticas.leves}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="text-yellow-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
            <OptimizedSelect
              value={filtroEmpleado}
              onChange={(value) => setFiltroEmpleado(value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los empleados</option>
              {users.filter(u => u.role !== 'admin').map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </OptimizedSelect>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha específica</label>
            <OptimizedInput
              type="date"
              value={filtroFecha}
              onChange={(value) => setFiltroFecha(value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado de alertas</label>
            <OptimizedSelect
              value={filtroDescartadas}
              onChange={(value) => setFiltroDescartadas(value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="activas">📋 Solo activas</option>
              <option value="descartadas">🗂️ Solo descartadas</option>
              <option value="todas">📊 Todas las alertas</option>
            </OptimizedSelect>
          </div>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {filtroDescartadas === 'activas' && 'Incidencias Activas'}
            {filtroDescartadas === 'descartadas' && 'Incidencias Descartadas'}
            {filtroDescartadas === 'todas' && 'Todas las Incidencias'}
          </h3>
          {alertasDescartadas.length > 0 && filtroDescartadas !== 'descartadas' && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {alertasDescartadas.length} alerta{alertasDescartadas.length !== 1 ? 's' : ''} descartada{alertasDescartadas.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setAlertasDescartadas([])}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Restaurar todas
              </button>
            </div>
          )}
        </div>
        
        {alertasFiltradas.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {filtroDescartadas === 'activas' && '¡Excelente!'}
              {filtroDescartadas === 'descartadas' && 'Sin alertas descartadas'}
              {filtroDescartadas === 'todas' && '¡Sin incidencias!'}
            </h3>
            <p className="text-gray-600">
              {filtroDescartadas === 'activas' && 'No hay alertas pendientes con los filtros aplicados'}
              {filtroDescartadas === 'descartadas' && 'No has descartado ninguna alerta aún'}
              {filtroDescartadas === 'todas' && 'No hay alertas de ningún tipo con los filtros aplicados'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alertasFiltradas.map(alerta => {
              const estaDescartada = isAlertaDescartada(alerta);
              const estaJustificada = isAlertaJustificada(alerta);
              return (
                <div key={alerta.id} className={`relative p-4 rounded-lg border-l-4 transition-all ${
                  estaDescartada 
                    ? `${getAlertaColor(alerta.tipo)} opacity-60 bg-gray-50` 
                    : estaJustificada
                    ? 'border-blue-200 bg-blue-50'
                    : getAlertaColor(alerta.tipo)
                }`}>
                  {/* Botón X para descartar o ↩️ para restaurar */}
                  {!estaJustificada && (
                    <button
                      onClick={() => estaDescartada ? restaurarAlerta(alerta) : descartarAlerta(alerta)}
                      className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${
                        estaDescartada 
                          ? 'text-blue-500 hover:text-blue-700 hover:bg-blue-50' 
                          : 'text-gray-400 hover:text-gray-600 hover:bg-white'
                      }`}
                      title={estaDescartada ? "Restaurar alerta" : "Descartar alerta"}
                    >
                      {estaDescartada ? '↩️' : '✕'}
                    </button>
                  )}
                  
                  <div className="flex items-start justify-between pr-8">
                    <div className="flex items-start space-x-3">
                      {estaJustificada ? (
                        <div className="text-blue-600 mt-1">🏖️</div>
                      ) : (
                        getAlertaIcon(alerta.tipo)
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-800">{alerta.empleado}</h4>
                          {estaJustificada ? (
                            <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800">
                              Vacaciones o Festivo
                            </span>
                          ) : (
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              alerta.tipo === 'critica' ? 'bg-red-100 text-red-800' :
                              alerta.tipo === 'moderada' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {getAlertaTipoTexto(alerta.tipo)}
                            </span>
                          )}
                          {estaDescartada && (
                            <span className="px-2 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-600">
                              Descartada
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alerta.departamento}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Fecha:</span>
                            <div className="font-medium">{formatearFecha(alerta.fecha)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Horas registradas:</span>
                            <div className="font-medium">{alerta.horasRegistradas}h / {alerta.horasObjetivo}h</div>
                          </div>
                          <div>
                            <span className="text-gray-500">
                              {estaJustificada ? 'Estado:' : 'Tiempo faltante:'}
                            </span>
                            <div className={`font-bold ${estaJustificada ? 'text-blue-600' : 'text-red-600'}`}>
                              {estaJustificada ? 'Justificado por empleado' : `${alerta.horasFaltantes.toFixed(1)}h`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

const TrackingPanel = memo(({ users, tasks, categories }) => {
  const [filters, setFilters] = useState({
    empleado: '',
    categoria: '',
    fechaInicio: '',
    fechaFin: ''
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.empleado && task.userId !== parseInt(filters.empleado)) return false;
      if (filters.categoria && task.category !== filters.categoria) return false;
      if (filters.fechaInicio && task.date < filters.fechaInicio) return false;
      if (filters.fechaFin && task.date > filters.fechaFin) return false;
      return true;
    });
  }, [tasks, filters]);

  const employeeStats = useMemo(() => {
    const stats = {};
    
    filteredTasks.forEach(task => {
      const user = users.find(u => u.id === task.userId);
      if (!user) return;
      
      if (!stats[user.id]) {
        stats[user.id] = {
          user,
          totalHours: 0,
          tasks: 0,
          categories: {}
        };
      }
      
      stats[user.id].totalHours += task.hours;
      stats[user.id].tasks += 1;
      
      if (!stats[user.id].categories[task.category]) {
        stats[user.id].categories[task.category] = 0;
      }
      stats[user.id].categories[task.category] += task.hours;
    });
    
    return Object.values(stats);
  }, [filteredTasks, users]);

  const allCategories = useMemo(() => {
    const cats = new Set();
    Object.values(categories).forEach(deptCats => 
      deptCats.forEach(cat => cats.add(cat))
    );
    return Array.from(cats);
  }, [categories]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Seguimiento de Empleados</h2>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
            <OptimizedSelect
              value={filters.empleado}
              onChange={(value) => setFilters(prev => ({ ...prev, empleado: value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los empleados</option>
              {users.filter(u => u.role !== 'admin').map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </OptimizedSelect>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <OptimizedSelect
              value={filters.categoria}
              onChange={(value) => setFilters(prev => ({ ...prev, categoria: value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </OptimizedSelect>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
            <OptimizedInput
              type="date"
              value={filters.fechaInicio}
              onChange={(value) => setFilters(prev => ({ ...prev, fechaInicio: value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
            <OptimizedInput
              type="date"
              value={filters.fechaFin}
              onChange={(value) => setFilters(prev => ({ ...prev, fechaFin: value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Estadísticas por empleado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employeeStats.map(stat => {
          const sortedCategories = Object.entries(stat.categories)
            .sort(([,a], [,b]) => b - a);
          
          return (
            <div key={stat.user.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-4">
                <h4 className="font-semibold text-lg">{stat.user.name}</h4>
                <p className="text-gray-600">{stat.user.department}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stat.totalHours.toFixed(1)}h</div>
                  <div className="text-gray-600 text-sm">Total horas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stat.tasks}</div>
                  <div className="text-gray-600 text-sm">Tareas completadas</div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-700">Distribución por categorías:</h5>
                {sortedCategories.map(([category, hours]) => {
                  const percentage = (hours / stat.totalHours) * 100;
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category}</span>
                        <span>{hours.toFixed(1)}h ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {employeeStats.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <p className="text-gray-600">No se encontraron datos con los filtros aplicados</p>
        </div>
      )}
    </div>
  );
});

// Componente principal
const TimeTrackerPro = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(initialUsers);
  const [tasks, setTasks] = useState(carlosDemoTasks);
  const [categories, setCategories] = useState(initialCategories);
  const [activeTab, setActiveTab] = useState('tasks');
  const [loginError, setLoginError] = useState('');
  const [diasJustificados, setDiasJustificados] = useState([]);

  const handleLogin = useCallback((username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setLoginError('');
      setActiveTab(user.role === 'admin' ? 'users' : 'tasks');
      return true; // Login exitoso
    } else {
      setLoginError('Usuario o contraseña incorrectos');
      return false; // Login fallido
    }
  }, [users]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setActiveTab('tasks');
  }, []);

  if (!currentUser) {
    return <Login onLogin={handleLogin} loginError={loginError} />;
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
                  <li>
                    <button
                      onClick={() => setActiveTab('tracking')}
                      className={`w-full text-left px-4 py-3 rounded-md transition-colors duration-200 flex items-center ${
                        activeTab === 'tracking' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <BarChart3 className="mr-3" size={20} />
                      Seguimiento
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className={`w-full text-left px-4 py-3 rounded-md transition-colors duration-200 flex items-center ${
                        activeTab === 'analytics' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <TrendingUp className="mr-3" size={20} />
                      Analytics
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('alertas')}
                      className={`w-full text-left px-4 py-3 rounded-md transition-colors duration-200 flex items-center ${
                        activeTab === 'alertas' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <AlertTriangle className="mr-3" size={20} />
                      Alertas
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Contenido Admin */}
            <div className="flex-1">
              {activeTab === 'users' && (
                <UserManagement 
                  users={users} 
                  setUsers={setUsers} 
                  departments={departments} 
                />
              )}
              {activeTab === 'categories' && (
                <CategoryManagement 
                  categories={categories} 
                  setCategories={setCategories} 
                  departments={departments} 
                />
              )}
              {activeTab === 'tracking' && (
                <TrackingPanel 
                  users={users} 
                  tasks={tasks} 
                  categories={categories} 
                />
              )}
              {activeTab === 'analytics' && (
                <AnalyticsPanel 
                  users={users} 
                  tasks={tasks} 
                  categories={categories} 
                />
              )}
              {activeTab === 'alertas' && (
                <AlertasPanel 
                  users={users} 
                  tasks={tasks}
                  diasJustificados={diasJustificados}
                />
              )}
            </div>
          </div>
        ) : (
          <EmployeePanel 
            user={currentUser} 
            categories={categories} 
            tasks={tasks} 
            setTasks={setTasks} 
            users={users}
            diasJustificados={diasJustificados}
            setDiasJustificados={setDiasJustificados}
            setCategories={setCategories}
          />
        )}
      </div>
    </div>
  );
};

export default TimeTrackerPro;
