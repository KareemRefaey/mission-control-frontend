import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [missions, setMissions] = useState([])
  const [completedMissions, setCompletedMissions] = useState([])
  const [myCompletedTasks, setMyCompletedTasks] = useState([])
  const [users, setUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showUsersModal, setShowUsersModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showMyCompleted, setShowMyCompleted] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [showReportsModal, setShowReportsModal] = useState(false)
  const [dashboardStats, setDashboardStats] = useState(null)
  const [employeeMonthlyStats, setEmployeeMonthlyStats] = useState([])
  const [missionLogs, setMissionLogs] = useState([])
  const [selectedMission, setSelectedMission] = useState(null)
  const [departmentEmployees, setDepartmentEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedMissionFiles, setSelectedMissionFiles] = useState(null)
  const [showFilesModal, setShowFilesModal] = useState(false)
  const [missionFiles, setMissionFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [rejectNotes, setRejectNotes] = useState('')
  const [reportStartDate, setReportStartDate] = useState('')
  const [reportEndDate, setReportEndDate] = useState('')
  const [reportStatus, setReportStatus] = useState('all')
  const [reportStage, setReportStage] = useState('all')
  const [editingUser, setEditingUser] = useState(null)
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: '',
    password: ''
  })
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: ''
  })
// تحديد عنوان الـ Backend لجميع الطلبات
axios.defaults.baseURL = 'https://mission-control-backend-t1e5.onrender.com';
  // جلب المهام حسب الدور
  const fetchMyTasks = async () => {
    try {
      const response = await axios.get('https://mission-control-backend-t1e5.onrender.com/api/my-tasks')
      setMissions(response.data)
    } catch (err) {
      console.error('خطأ في جلب المهام:', err)
    }
  }

  // جلب المهام المنتهية للموظف
  const fetchMyCompletedTasks = async () => {
    try {
      const response = await axios.get('https://mission-control-backend-t1e5.onrender.com/api/my-completed-tasks')
      setMyCompletedTasks(response.data)
    } catch (err) {
      console.error('خطأ في جلب المهام المنتهية:', err)
    }
  }

  // جلب المأموريات المكتملة (للمديرين)
  const fetchCompletedMissions = async () => {
    try {
      const response = await axios.get('https://mission-control-backend-t1e5.onrender.com/api/completed-missions')
      setCompletedMissions(response.data)
    } catch (err) {
      console.error('خطأ في جلب المكتملة:', err)
    }
  }

  // جلب كل المستخدمين (للمدير)
  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('https://mission-control-backend-t1e5.onrender.com/api/admin/users')
      setAllUsers(response.data)
    } catch (err) {
      console.error('خطأ:', err)
    }
  }

  // جلب إحصائيات Dashboard
  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('https://mission-control-backend-t1e5.onrender.com/api/dashboard/stats')
      setDashboardStats(response.data)
      await fetchEmployeeMonthlyStats()
    } catch (err) {
      console.error('خطأ في جلب الإحصائيات:', err)
    }
  }

  // جلب إحصائيات الموظفين الشهرية
  const fetchEmployeeMonthlyStats = async () => {
    try {
      const response = await axios.get('https://mission-control-backend-t1e5.onrender.com/api/dashboard/employee-monthly-stats')
      setEmployeeMonthlyStats(response.data)
    } catch (err) {
      console.error('خطأ في جلب الإحصائيات الشهرية:', err)
    }
  }

  // جلب سجل المأمورية
  const fetchMissionLogs = async (missionId) => {
    try {
      const response = await axios.get(`https://mission-control-backend-t1e5.onrender.com/api/missions/${missionId}/logs`)
      setMissionLogs(response.data)
    } catch (err) {
      console.error('خطأ:', err)
    }
  }

  // حذف مأمورية (للمدير فقط)
  const deleteMission = async (mission) => {
    if (window.confirm(`⚠️ هل أنت متأكد من حذف المأمورية "${mission.title}"؟\n\nملاحظة: سيتم حذف جميع الملفات المرفوعة نهائياً ولا يمكن استرجاعها.`)) {
      setLoading(true)
      try {
        await axios.delete(`https://mission-control-backend-t1e5.onrender.com/api/missions/${mission.id}`)
        alert('تم حذف المأمورية بنجاح')
        fetchMyTasks()
        fetchCompletedMissions()
        if (user.role === 'DISTRIBUTOR') {
          fetchDashboardStats()
        }
      } catch (err) {
        alert(err.response?.data?.message || 'خطأ في حذف المأمورية')
      } finally {
        setLoading(false)
      }
    }
  }

  // تصدير تقرير Excel
const exportExcel = async () => {
  setLoading(true)
  try {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams()
    if (reportStartDate) params.append('startDate', reportStartDate)
    if (reportEndDate) params.append('endDate', reportEndDate)
    if (reportStatus !== 'all') params.append('status', reportStatus)
    if (reportStage !== 'all') params.append('stage', reportStage)
    
    // فتح الرابط مع token في header بدلاً من URL
    const response = await axios.get(`https://mission-control-backend-t1e5.onrender.com/api/reports/excel?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    })
    
    // إنشاء رابط تحميل
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `missions_report_${Date.now()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    alert('خطأ في تصدير التقرير: ' + (err.response?.data?.message || err.message))
  } finally {
    setLoading(false)
  }
}

// تصدير تقرير PDF
const exportPDF = async () => {
  setLoading(true)
  try {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams()
    if (reportStartDate) params.append('startDate', reportStartDate)
    if (reportEndDate) params.append('endDate', reportEndDate)
    if (reportStatus !== 'all') params.append('status', reportStatus)
    if (reportStage !== 'all') params.append('stage', reportStage)
    
    const response = await axios.get(`https://mission-control-backend-t1e5.onrender.com/api/reports/pdf?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `missions_report_${Date.now()}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    alert('خطأ في تصدير التقرير: ' + (err.response?.data?.message || err.message))
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchMyTasks()
      fetchCompletedMissions()
      fetchMyCompletedTasks()
      if (userData.role === 'DISTRIBUTOR') {
        fetchUsers()
        fetchAllUsers()
      }
    }
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://mission-control-backend-t1e5.onrender.com/api/users')
      setUsers(response.data)
    } catch (err) {
      console.error('خطأ في جلب المستخدمين:', err)
    }
  }

  const fetchDepartmentEmployees = async () => {
    try {
      const response = await axios.get('https://mission-control-backend-t1e5.onrender.com/api/department/employees')
      setDepartmentEmployees(response.data)
    } catch (err) {
      console.error('خطأ:', err)
    }
  }

  const openAssignModal = async (mission) => {
    setSelectedMission(mission)
    await fetchDepartmentEmployees()
    setShowAssignModal(true)
  }

  const openLogsModal = async (mission) => {
    setSelectedMission(mission)
    await fetchMissionLogs(mission.id)
    setShowLogsModal(true)
  }

  const assignMission = async () => {
    if (!selectedEmployee) {
      alert('الرجاء اختيار موظف')
      return
    }
    
    setLoading(true)
    try {
      await axios.put(`https://mission-control-backend-t1e5.onrender.com/api/missions/${selectedMission.id}/assign`, {
        employeeId: selectedEmployee,
        stage: selectedMission.stage
      })
      alert('تم توزيع المأمورية بنجاح')
      setShowAssignModal(false)
      setSelectedEmployee('')
      fetchMyTasks()
      fetchCompletedMissions()
      fetchMyCompletedTasks()
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ في التوزيع')
    } finally {
      setLoading(false)
    }
  }

  const approveMission = async (mission) => {
    if (window.confirm(`هل أنت متأكد من قبول المأمورية "${mission.title}" وتمريرها للمرحلة التالية؟`)) {
      setLoading(true)
      try {
        await axios.put(`https://mission-control-backend-t1e5.onrender.com/api/missions/${mission.id}/approve`)
        alert('تم قبول المأمورية وتمريرها')
        fetchMyTasks()
        fetchCompletedMissions()
        fetchMyCompletedTasks()
      } catch (err) {
        alert(err.response?.data?.message || 'خطأ في قبول المأمورية')
      } finally {
        setLoading(false)
      }
    }
  }

  const openRejectModal = (mission) => {
    setSelectedMission(mission)
    setRejectNotes('')
    setShowReviewModal(true)
  }

  const rejectMission = async () => {
    if (!rejectNotes.trim()) {
      alert('الرجاء كتابة ملاحظات الرفض')
      return
    }
    
    setLoading(true)
    try {
      await axios.put(`https://mission-control-backend-t1e5.onrender.com/api/missions/${selectedMission.id}/reject`, {
        notes: rejectNotes
      })
      alert('تم رفض المأمورية وإعادتها للموظف')
      setShowReviewModal(false)
      setRejectNotes('')
      fetchMyTasks()
      fetchCompletedMissions()
      fetchMyCompletedTasks()
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ في رفض المأمورية')
    } finally {
      setLoading(false)
    }
  }

  const resubmitMission = async (mission) => {
    if (window.confirm(`هل أنت متأكد من إعادة تقديم المأمورية "${mission.title}" للمراجعة؟`)) {
      setLoading(true)
      try {
        await axios.put(`https://mission-control-backend-t1e5.onrender.com/api/missions/${mission.id}/resubmit`)
        alert('تم إعادة تقديم المأمورية، في انتظار المراجعة')
        fetchMyTasks()
        fetchMyCompletedTasks()
      } catch (err) {
        alert(err.response?.data?.message || 'خطأ في إعادة التقديم')
      } finally {
        setLoading(false)
      }
    }
  }

  const openFilesModal = async (mission) => {
    setSelectedMissionFiles(mission)
    await fetchMissionFiles(mission.id)
    setShowFilesModal(true)
  }

  const fetchMissionFiles = async (missionId) => {
    try {
      const response = await axios.get(`https://mission-control-backend-t1e5.onrender.com/api/missions/${missionId}/files`)
      setMissionFiles(response.data)
    } catch (err) {
      console.error('خطأ:', err)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('الرجاء اختيار ملف')
      return
    }

    let autoStage = ''
    if (user?.role === 'SURVEY_ENGINEER') {
      autoStage = 'survey'
    } else if (user?.role === 'TECHNICAL_STAFF') {
      autoStage = 'technical'
    } else if (user?.role === 'GIS_ANALYST') {
      autoStage = 'gis'
    } else {
      alert('ليس لديك صلاحية رفع ملفات')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('stage', autoStage)

    try {
      await axios.post(`https://mission-control-backend-t1e5.onrender.com/api/missions/${selectedMissionFiles.id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('تم رفع الملف بنجاح، في انتظار المراجعة')
      setSelectedFile(null)
      fetchMissionFiles(selectedMissionFiles.id)
      fetchMyTasks()
      fetchMyCompletedTasks()
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ في رفع الملف')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileId, fileName) => {
    if (window.confirm(`هل أنت متأكد من حذف الملف "${fileName}"؟`)) {
      try {
        await axios.delete(`https://mission-control-backend-t1e5.onrender.com/api/files/${fileId}`)
        alert('تم حذف الملف بنجاح')
        fetchMissionFiles(selectedMissionFiles.id)
      } catch (err) {
        alert(err.response?.data?.message || 'خطأ في حذف الملف')
      }
    }
  }

  const handleCreateMission = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('https://mission-control-backend-t1e5.onrender.com/api/missions', newMission)
      setShowCreateForm(false)
      setNewMission({ title: '', description: '', dueDate: '', assignedTo: '' })
      fetchMyTasks()
      alert('تم إنشاء المأمورية بنجاح')
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ في إنشاء المأمورية')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('https://mission-control-backend-t1e5.onrender.com/api/admin/users', userForm)
      alert('تم إنشاء المستخدم بنجاح')
      setUserForm({ name: '', email: '', role: '', password: '' })
      fetchAllUsers()
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ في إنشاء المستخدم')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.put(`https://mission-control-backend-t1e5.onrender.com/api/admin/users/${editingUser.id}`, userForm)
      alert('تم تحديث المستخدم بنجاح')
      setEditingUser(null)
      setUserForm({ name: '', email: '', role: '', password: '' })
      fetchAllUsers()
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ في تحديث المستخدم')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`هل أنت متأكد من حذف المستخدم "${userName}"؟`)) {
      try {
        await axios.delete(`https://mission-control-backend-t1e5.onrender.com/api/admin/users/${userId}`)
        alert('تم حذف المستخدم بنجاح')
        fetchAllUsers()
        fetchUsers()
      } catch (err) {
        alert(err.response?.data?.message || 'خطأ في حذف المستخدم')
      }
    }
  }

  const openEditUser = (user) => {
    setEditingUser(user)
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post('https://mission-control-backend-t1e5.onrender.com/api/auth/login', {
        email,
        password
      })
      
      if (response.data.success) {
        setUser(response.data.user)
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
        fetchMyTasks()
        fetchCompletedMissions()
        fetchMyCompletedTasks()
        if (response.data.user.role === 'DISTRIBUTOR') {
          fetchUsers()
          fetchAllUsers()
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    setMissions([])
    setCompletedMissions([])
    setMyCompletedTasks([])
    setEmail('')
    setPassword('')
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'قيد الانتظار'
      case 'in_progress': return 'جاري العمل'
      case 'pending_review': return 'بانتظار المراجعة'
      case 'rejected': return 'مرفوضة'
      case 'completed': return 'مكتملة'
      default: return status
    }
  }

  const getStatusStyle = (status) => {
    switch(status) {
      case 'pending_review': return { backgroundColor: '#fef3c7', color: '#d97706' }
      case 'rejected': return { backgroundColor: '#fee', color: '#c33' }
      case 'completed': return { backgroundColor: '#d1fae5', color: '#059669' }
      default: return { backgroundColor: '#dbeafe', color: '#2563eb' }
    }
  }

  const renderDashboard = () => {
    if (!dashboardStats) {
      return <div style={styles.loading}>جاري تحميل البيانات...</div>
    }

    const getStatusName = (status) => {
      switch(status) {
        case 'pending': return 'قيد الانتظار'
        case 'in_progress': return 'جاري العمل'
        case 'pending_review': return 'بانتظار المراجعة'
        case 'rejected': return 'مرفوضة'
        case 'completed': return 'مكتملة'
        default: return status
      }
    }

    const getStageName = (stage) => {
      switch(stage) {
        case 'survey': return 'مرحلة المساحة'
        case 'technical': return 'مرحلة المكتب الفني'
        case 'gis': return 'مرحلة نظم المعلومات'
        case 'completed': return 'مكتملة'
        default: return stage
      }
    }

    const totalMissions = dashboardStats.byStatus?.reduce((sum, s) => sum + s.count, 0) || 0

    return (
      <div>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{totalMissions}</div>
            <div style={styles.statLabel}>إجمالي المأموريات</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{dashboardStats.lateMissions || 0}</div>
            <div style={styles.statLabel}>مأموريات متأخرة</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{dashboardStats.completedLastWeek || 0}</div>
            <div style={styles.statLabel}>مكتملة آخر 7 أيام</div>
          </div>
        </div>

        <div style={styles.dashboardGrid}>
          <div style={styles.dashboardCard}>
            <h4>📊 المأموريات حسب الحالة</h4>
            {dashboardStats.byStatus?.map((item) => (
              <div key={item.status} style={styles.progressBar}>
                <div style={styles.progressLabel}>{getStatusName(item.status)}</div>
                <div style={styles.progressBarBg}>
                  <div style={{ ...styles.progressBarFill, width: `${(item.count / totalMissions) * 100}%` }}></div>
                </div>
                <div style={styles.progressCount}>{item.count}</div>
              </div>
            ))}
          </div>

          <div style={styles.dashboardCard}>
            <h4>🔄 المأموريات حسب المرحلة</h4>
            {dashboardStats.byStage?.map((item) => (
              <div key={item.stage} style={styles.progressBar}>
                <div style={styles.progressLabel}>{getStageName(item.stage)}</div>
                <div style={styles.progressBarBg}>
                  <div style={{ ...styles.progressBarFill, width: `${(item.count / totalMissions) * 100}%` }}></div>
                </div>
                <div style={styles.progressCount}>{item.count}</div>
              </div>
            ))}
          </div>

          {dashboardStats.employeeStats && dashboardStats.employeeStats.length > 0 && (
            <div style={styles.dashboardCard}>
              <h4>👥 عدد المأموريات لكل موظف</h4>
              {dashboardStats.employeeStats.map((emp) => (
                <div key={emp.name} style={styles.employeeRow}>
                  <span>{emp.name}</span>
                  <span style={styles.employeeCount}>{emp.missionCount}</span>
                </div>
              ))}
            </div>
          )}

          {employeeMonthlyStats.length > 0 && (
            <div style={styles.dashboardCard}>
              <h4>📅 عدد المأموريات المكتملة لكل موظف</h4>
              <table style={styles.statsTable}>
                <thead>
                  <tr>
                    <th>الموظف</th>
                    <th>هذا الشهر</th>
                    <th>إجمالي المكتملة</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeMonthlyStats.map((emp) => (
                    <tr key={emp.name}>
                      <td>{emp.name} ({emp.role === 'SURVEY_ENGINEER' ? 'مهندس مساحة' : emp.role === 'TECHNICAL_STAFF' ? 'موظف فني' : 'محلل GIS'})</td>
                      <td style={{ textAlign: 'center' }}><span style={styles.monthlyBadge}>{emp.monthlyCompleted}</span></td>
                      <td style={{ textAlign: 'center' }}>{emp.totalCompleted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {dashboardStats.deptStats && dashboardStats.deptStats.length > 0 && (
            <div style={styles.dashboardCard}>
              <h4>📈 إحصائيات قسمك</h4>
              {dashboardStats.deptStats.map((item) => (
                <div key={item.status} style={styles.progressBar}>
                  <div style={styles.progressLabel}>{getStatusName(item.status)}</div>
                  <div style={styles.progressBarBg}>
                    <div style={{ ...styles.progressBarFill, width: `${(item.count / dashboardStats.deptStats.reduce((sum, s) => sum + s.count, 0)) * 100}%` }}></div>
                  </div>
                  <div style={styles.progressCount}>{item.count}</div>
                </div>
              ))}
            </div>
          )}

          {dashboardStats.myStats && dashboardStats.myStats.length > 0 && (
            <div style={styles.dashboardCard}>
              <h4>📋 مهامي</h4>
              {dashboardStats.myStats.map((item) => (
                <div key={item.status} style={styles.progressBar}>
                  <div style={styles.progressLabel}>{getStatusName(item.status)}</div>
                  <div style={styles.progressBarBg}>
                    <div style={{ ...styles.progressBarFill, width: `${(item.count / dashboardStats.myStats.reduce((sum, s) => sum + s.count, 0)) * 100}%` }}></div>
                  </div>
                  <div style={styles.progressCount}>{item.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderMissionCard = (mission) => (
    <div key={mission.id} style={styles.missionCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexDirection: 'column' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ margin: 0 }}>{mission.title}</h4>
            <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
              {mission.description || 'لا يوجد وصف'}
            </p>
          </div>
          <div style={{ ...styles.statusBadge, ...getStatusStyle(mission.status) }}>
            {getStatusText(mission.status)}
          </div>
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
          <div>📅 تاريخ الإنشاء: {new Date(mission.createdAt).toLocaleDateString('ar-EG')}</div>
          {mission.dueDate && <div>⏰ تاريخ التسليم: {new Date(mission.dueDate).toLocaleDateString('ar-EG')}</div>}
          <div>👤 مسند إلى: {mission.assigneeName || 'لم يحدد بعد'}</div>
          <div>📍 المرحلة: {
            mission.stage === 'survey' ? '🚧 بيانات المساحة' :
            mission.stage === 'technical' ? '📐 معالجة فنية' :
            mission.stage === 'gis' ? '🗺️ نظم معلومات' :
            '✅ مكتملة'
          }</div>
          {mission.reviewNotes && (
            <div style={{ color: '#c33', marginTop: '5px' }}>
              📝 ملاحظات الرفض: {mission.reviewNotes}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          
          {/* أزرار لرؤساء الأقسام */}
          {(user.role === 'SURVEY_MANAGER' || user.role === 'TECHNICAL_MANAGER' || user.role === 'GIS_MANAGER') && (
            <>
              {(mission.status === 'pending' || mission.status === 'in_progress') && (
                <button onClick={() => openAssignModal(mission)} style={styles.assignBtn}>
                  👥 توزيع على موظف
                </button>
              )}
              
              {mission.status === 'pending_review' && (
                <>
                  <button onClick={() => approveMission(mission)} style={styles.approveBtn}>
                    ✅ قبول وتمرير
                  </button>
                  <button onClick={() => openRejectModal(mission)} style={styles.rejectBtn}>
                    ❌ رفض وإعادة للموظف
                  </button>
                </>
              )}

              <button onClick={() => openFilesModal(mission)} style={styles.viewFilesBtn}>
                📂 عرض ملفات الموظف
              </button>
            </>
          )}

          {/* أزرار للموظفين */}
          {(user.role === 'SURVEY_ENGINEER' || user.role === 'TECHNICAL_STAFF' || user.role === 'GIS_ANALYST') && (
            <>
              {mission.status === 'in_progress' && (
                <button onClick={() => openFilesModal(mission)} style={styles.uploadBtn}>
                  📎 رفع ملفات
                </button>
              )}
              {mission.status === 'rejected' && (
                <>
                  <button onClick={() => openFilesModal(mission)} style={styles.uploadBtn}>
                    📎 تعديل ورفع ملفات جديدة
                  </button>
                  <button onClick={() => resubmitMission(mission)} style={styles.resubmitBtn}>
                    🔄 إعادة التقديم للمراجعة
                  </button>
                </>
              )}
              {mission.status === 'pending_review' && (
                <span style={{ padding: '8px 15px', backgroundColor: '#fef3c7', borderRadius: '5px', fontSize: '12px' }}>
                  ⏳ في انتظار مراجعة رئيس القسم
                </span>
              )}
            </>
          )}

          {/* زر حذف المأمورية لمدير التوزيع */}
          {user.role === 'DISTRIBUTOR' && (
            <button onClick={() => deleteMission(mission)} style={styles.deleteMissionBtn}>
              🗑️ حذف المأمورية
            </button>
          )}

          {/* زر عرض السجل (للجميع) */}
          <button onClick={() => openLogsModal(mission)} style={styles.logsBtn}>
            📋 سجل المأمورية
          </button>

          {/* زر عرض الملفات للمكتملة */}
          {mission.status === 'completed' && (
            <button onClick={() => openFilesModal(mission)} style={styles.viewFilesBtn}>
              📂 عرض الملفات
            </button>
          )}
        </div>
      </div>
    </div>
  )

  if (user) {
    const isEmployee = ['SURVEY_ENGINEER', 'TECHNICAL_STAFF', 'GIS_ANALYST'].includes(user.role)
    const isManager = ['SURVEY_MANAGER', 'TECHNICAL_MANAGER', 'GIS_MANAGER'].includes(user.role)
    
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div>
              <h1>مرحباً {user.name} 👋</h1>
              <p style={{ color: '#666', marginTop: '5px' }}>
                الدور: {
                  {
                    'DISTRIBUTOR': 'مدير التوزيع',
                    'SURVEY_MANAGER': 'رئيس قسم المساحة',
                    'TECHNICAL_MANAGER': 'رئيس المكتب الفني',
                    'GIS_MANAGER': 'رئيس نظم المعلومات',
                    'SURVEY_ENGINEER': 'مهندس مساحة',
                    'TECHNICAL_STAFF': 'موظف فني',
                    'GIS_ANALYST': 'محلل نظم المعلومات'
                  }[user.role] || user.role
                }
              </p>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              تسجيل خروج
            </button>
          </div>
          
          <hr style={{ margin: '20px 0' }} />
          
          {user.role === 'DISTRIBUTOR' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <button 
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  style={styles.createBtn}
                >
                  {showCreateForm ? 'إلغاء' : '+ إنشاء مأمورية جديدة'}
                </button>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <button 
                  onClick={() => {
                    setShowUsersModal(true)
                    fetchAllUsers()
                  }}
                  style={styles.manageUsersBtn}
                >
                  👥 إدارة المستخدمين
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <button 
                  onClick={() => setShowReportsModal(true)}
                  style={styles.reportsBtn}
                >
                  📊 تقارير المأموريات
                </button>
              </div>
            </>
          )}

          {showCreateForm && user.role === 'DISTRIBUTOR' && (
            <div style={styles.formContainer}>
              <h3>إنشاء مأمورية جديدة</h3>
              <form onSubmit={handleCreateMission}>
                <input
                  type="text"
                  placeholder="عنوان المأمورية"
                  style={styles.input}
                  value={newMission.title}
                  onChange={(e) => setNewMission({...newMission, title: e.target.value})}
                  required
                />
                <textarea
                  placeholder="وصف المأمورية"
                  style={styles.textarea}
                  value={newMission.description}
                  onChange={(e) => setNewMission({...newMission, description: e.target.value})}
                  rows="3"
                />
                <select
                  style={styles.input}
                  value={newMission.assignedTo}
                  onChange={(e) => setNewMission({...newMission, assignedTo: e.target.value})}
                  required
                >
                  <option value="">اختر رئيس القسم</option>
                  {users.filter(u => u.role.includes('MANAGER')).map(u => (
                    <option key={u.id} value={u.id}>{u.name} - {
                      u.role === 'SURVEY_MANAGER' ? 'رئيس قسم المساحة' :
                      u.role === 'TECHNICAL_MANAGER' ? 'رئيس المكتب الفني' :
                      'رئيس نظم المعلومات'
                    }</option>
                  ))}
                </select>
                <input
                  type="date"
                  style={styles.input}
                  value={newMission.dueDate}
                  onChange={(e) => setNewMission({...newMission, dueDate: e.target.value})}
                />
                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? 'جاري الإنشاء...' : 'إنشاء المأمورية'}
                </button>
              </form>
            </div>
          )}
          
          {user.role === 'DISTRIBUTOR' && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button 
                onClick={() => {
                  setShowDashboard(false)
                  fetchMyTasks()
                }}
                style={{ ...styles.tabBtn, backgroundColor: !showDashboard ? '#667eea' : '#e5e7eb', color: !showDashboard ? 'white' : '#333' }}
              >
                📋 المأموريات
              </button>
              <button 
                onClick={() => {
                  setShowDashboard(true)
                  fetchDashboardStats()
                }}
                style={{ ...styles.tabBtn, backgroundColor: showDashboard ? '#667eea' : '#e5e7eb', color: showDashboard ? 'white' : '#333' }}
              >
                📊 Dashboard
              </button>
            </div>
          )}

          {showDashboard && user.role === 'DISTRIBUTOR' ? (
            renderDashboard()
          ) : (
            <>
              {isEmployee && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button 
                    onClick={() => {
                      setShowMyCompleted(false)
                      fetchMyTasks()
                    }}
                    style={{ ...styles.tabBtn, backgroundColor: !showMyCompleted ? '#667eea' : '#e5e7eb', color: !showMyCompleted ? 'white' : '#333' }}
                  >
                    📋 مهامي الجارية
                  </button>
                  <button 
                    onClick={() => {
                      setShowMyCompleted(true)
                      fetchMyCompletedTasks()
                    }}
                    style={{ ...styles.tabBtn, backgroundColor: showMyCompleted ? '#667eea' : '#e5e7eb', color: showMyCompleted ? 'white' : '#333' }}
                  >
                    ✅ مهامي المنتهية
                  </button>
                </div>
              )}

              {(isManager || (user.role === 'DISTRIBUTOR' && !showDashboard)) && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button 
                    onClick={() => {
                      setShowCompleted(false)
                      fetchMyTasks()
                    }}
                    style={{ ...styles.tabBtn, backgroundColor: !showCompleted ? '#667eea' : '#e5e7eb', color: !showCompleted ? 'white' : '#333' }}
                  >
                    📋 المأموريات الجارية
                  </button>
                  <button 
                    onClick={() => {
                      setShowCompleted(true)
                      fetchCompletedMissions()
                    }}
                    style={{ ...styles.tabBtn, backgroundColor: showCompleted ? '#667eea' : '#e5e7eb', color: showCompleted ? 'white' : '#333' }}
                  >
                    ✅ المأموريات المكتملة
                  </button>
                </div>
              )}

              <div>
                <h3>
                  {isEmployee 
                    ? (showMyCompleted ? '✅ مهامي المنتهية' : '📋 مهامي الجارية')
                    : (showCompleted ? '✅ المأموريات المكتملة' : '📋 المأموريات الجارية')
                  }
                </h3>
                
                {(() => {
                  let dataToShow = []
                  if (isEmployee) {
                    dataToShow = showMyCompleted ? myCompletedTasks : missions
                  } else {
                    dataToShow = showCompleted ? completedMissions : missions
                  }
                  
                  if (dataToShow.length === 0) {
                    return (
                      <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                        {showMyCompleted || showCompleted ? 'لا توجد مأموريات' : 'لا توجد مأموريات حالياً'}
                      </p>
                    )
                  }
                  return dataToShow.map(mission => renderMissionCard(mission))
                })()}
              </div>
            </>
          )}
        </div>

        {/* نافذة توزيع المأمورية */}
        {showAssignModal && selectedMission && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3>توزيع المأمورية: {selectedMission.title}</h3>
              <select
                style={styles.input}
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">اختر الموظف</option>
                {departmentEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={assignMission} style={styles.submitBtn} disabled={loading}>
                  {loading ? 'جاري التوزيع...' : 'توزيع'}
                </button>
                <button onClick={() => setShowAssignModal(false)} style={styles.cancelBtn}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* نافذة سجل المأمورية */}
        {showLogsModal && selectedMission && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalLarge}>
              <div style={styles.modalHeader}>
                <h3>📋 سجل المأمورية: {selectedMission.title}</h3>
                <button onClick={() => setShowLogsModal(false)} style={styles.closeBtn}>✕</button>
              </div>
              
              <div style={styles.logsList}>
                {missionLogs.length === 0 ? (
                  <p style={{ color: '#666' }}>لا يوجد سجل للمأمورية</p>
                ) : (
                  missionLogs.map(log => {
                    let actionText = ''
                    let actionColor = '#3b82f6'
                    
                    switch(log.action) {
                      case 'created':
                        actionText = `📝 تم إنشاء المأمورية بواسطة ${log.userName}`
                        actionColor = '#10b981'
                        break
                      case 'uploaded_files':
                        actionText = `📎 تم رفع ملفات بواسطة ${log.userName} (مرحلة ${log.stage === 'survey' ? 'المساحة' : log.stage === 'technical' ? 'الفنية' : 'نظم المعلومات'})`
                        actionColor = '#8b5cf6'
                        break
                      case 'approved':
                        actionText = `✅ تم قبول المأمورية بواسطة ${log.userName} وتمريرها للمرحلة التالية`
                        actionColor = '#10b981'
                        break
                      case 'rejected':
                        actionText = `❌ تم رفض المأمورية بواسطة ${log.userName} وإعادتها للموظف`
                        actionColor = '#ef4444'
                        break
                      case 'completed':
                        actionText = `🎉 تم إكمال المأمورية بواسطة ${log.userName}`
                        actionColor = '#10b981'
                        break
                      case 'assigned_to_SURVEY_ENGINEER':
                        actionText = `👥 تم توزيع المأمورية على مهندس مساحة بواسطة ${log.userName}`
                        actionColor = '#3b82f6'
                        break
                      case 'assigned_to_TECHNICAL_STAFF':
                        actionText = `👥 تم توزيع المأمورية على موظف فني بواسطة ${log.userName}`
                        actionColor = '#3b82f6'
                        break
                      case 'assigned_to_GIS_ANALYST':
                        actionText = `👥 تم توزيع المأمورية على محلل نظم المعلومات بواسطة ${log.userName}`
                        actionColor = '#3b82f6'
                        break
                      case 'received':
                        actionText = `📬 تم استلام المأمورية بواسطة ${log.userName}`
                        actionColor = '#6b7280'
                        break
                      case 'resubmitted':
                        actionText = `🔄 تم إعادة تقديم المأمورية للمراجعة بواسطة ${log.userName}`
                        actionColor = '#8b5cf6'
                        break
                      default:
                        actionText = `${log.action} بواسطة ${log.userName}`
                    }
                    
                    return (
                      <div key={log.id} style={styles.logItem}>
                        <div style={{ ...styles.logIcon, backgroundColor: actionColor }}></div>
                        <div style={styles.logContent}>
                          <div style={styles.logText}>{actionText}</div>
                          <div style={styles.logDate}>{new Date(log.createdAt).toLocaleString('ar-EG')}</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* نافذة التقارير */}
        {showReportsModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3>📊 تقارير المأموريات</h3>
                <button onClick={() => setShowReportsModal(false)} style={styles.closeBtn}>✕</button>
              </div>
              
              <div style={styles.reportForm}>
                <div>
                  <label style={styles.label}>من تاريخ</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label style={styles.label}>إلى تاريخ</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label style={styles.label}>الحالة</label>
                  <select
                    style={styles.input}
                    value={reportStatus}
                    onChange={(e) => setReportStatus(e.target.value)}
                  >
                    <option value="all">الكل</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="in_progress">جاري العمل</option>
                    <option value="pending_review">بانتظار المراجعة</option>
                    <option value="rejected">مرفوضة</option>
                    <option value="completed">مكتملة</option>
                  </select>
                </div>
                
                <div>
                  <label style={styles.label}>المرحلة</label>
                  <select
                    style={styles.input}
                    value={reportStage}
                    onChange={(e) => setReportStage(e.target.value)}
                  >
                    <option value="all">الكل</option>
                    <option value="survey">مرحلة المساحة</option>
                    <option value="technical">مرحلة المكتب الفني</option>
                    <option value="gis">مرحلة نظم المعلومات</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={exportExcel} style={styles.excelBtn} disabled={loading}>
                    📎 تصدير Excel
                  </button>
                  <button onClick={exportPDF} style={styles.pdfBtn} disabled={loading}>
                    📄 تصدير PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* نافذة رفض المأمورية */}
        {showReviewModal && selectedMission && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3>رفض المأمورية: {selectedMission.title}</h3>
              <textarea
                placeholder="اكتب ملاحظات الرفض هنا..."
                style={styles.textarea}
                rows="4"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={rejectMission} style={styles.rejectBtn} disabled={loading}>
                  {loading ? 'جاري...' : 'تأكيد الرفض'}
                </button>
                <button onClick={() => setShowReviewModal(false)} style={styles.cancelBtn}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* نافذة رفع الملفات */}
        {showFilesModal && selectedMissionFiles && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalLarge}>
              <div style={styles.modalHeader}>
                <h3>📎 ملفات المأمورية: {selectedMissionFiles.title}</h3>
                <button onClick={() => setShowFilesModal(false)} style={styles.closeBtn}>✕</button>
              </div>
              
              <div style={styles.uploadSection}>
                <h4>رفع ملف جديد</h4>
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e0e7ff', borderRadius: '8px' }}>
                  📁 نوع الملفات: {
                    user?.role === 'SURVEY_ENGINEER' ? 'بيانات المساحة' :
                    user?.role === 'TECHNICAL_STAFF' ? 'بيانات فنية' :
                    user?.role === 'GIS_ANALYST' ? 'بيانات نظم المعلومات' : 'غير محدد'
                  }
                </div>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={styles.fileInput}
                />
                <button 
                  onClick={handleFileUpload} 
                  style={styles.submitBtn}
                  disabled={uploading}
                >
                  {uploading ? 'جاري الرفع...' : 'رفع الملف'}
                </button>
              </div>
              
              <div style={styles.filesList}>
                <h4>الملفات المرفوعة</h4>
                {missionFiles.length === 0 ? (
                  <p style={{ color: '#666' }}>لا توجد ملفات مرفوعة</p>
                ) : (
                  missionFiles.map(file => (
                    <div key={file.id} style={styles.fileItem}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{file.originalName}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          رفع بواسطة: {file.uploadedByName} | {new Date(file.uploadedAt).toLocaleString('ar-EG')}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          المرحلة: {
                            file.stage === 'survey' ? 'بيانات المساحة' :
                            file.stage === 'technical' ? 'بيانات فنية' : 'بيانات نظم المعلومات'
                          }
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <a 
                          href={`https://mission-control-backend-t1e5.onrender.com/api/files/${file.id}/download?token=${localStorage.getItem('token')}`}
                          style={styles.downloadLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          تحميل
                        </a>
                        {(file.userId === user?.id || user?.role === 'DISTRIBUTOR') && (
                          <button 
                            onClick={() => handleDeleteFile(file.id, file.originalName)}
                            style={styles.deleteFileBtn}
                          >
                            حذف
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* نافذة إدارة المستخدمين */}
        {showUsersModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalLarge}>
              <div style={styles.modalHeader}>
                <h3>👥 إدارة المستخدمين</h3>
                <button onClick={() => {
                  setShowUsersModal(false)
                  setEditingUser(null)
                  setUserForm({ name: '', email: '', role: '', password: '' })
                }} style={styles.closeBtn}>✕</button>
              </div>
              
              <div style={styles.uploadSection}>
                <h4>{editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h4>
                <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
                  <input
                    type="text"
                    placeholder="الاسم"
                    style={styles.input}
                    value={userForm.name}
                    onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                    required
                  />
                  <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    style={styles.input}
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    required
                  />
                  <select
                    style={styles.input}
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                    required
                  >
                    <option value="">اختر الدور</option>
                    <option value="DISTRIBUTOR">مدير التوزيع</option>
                    <option value="SURVEY_MANAGER">رئيس قسم المساحة</option>
                    <option value="TECHNICAL_MANAGER">رئيس المكتب الفني</option>
                    <option value="GIS_MANAGER">رئيس نظم المعلومات</option>
                    <option value="SURVEY_ENGINEER">مهندس مساحة</option>
                    <option value="TECHNICAL_STAFF">موظف فني</option>
                    <option value="GIS_ANALYST">محلل نظم المعلومات</option>
                  </select>
                  <input
                    type="password"
                    placeholder={editingUser ? 'كلمة مرور جديدة (اتركها فارغة للتغيير)' : 'كلمة المرور'}
                    style={styles.input}
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    required={!editingUser}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={styles.submitBtn} disabled={loading}>
                      {loading ? 'جاري...' : (editingUser ? 'تحديث' : 'إضافة')}
                    </button>
                    {editingUser && (
                      <button type="button" onClick={() => {
                        setEditingUser(null)
                        setUserForm({ name: '', email: '', role: '', password: '' })
                      }} style={styles.cancelBtn}>
                        إلغاء التعديل
                      </button>
                    )}
                  </div>
                </form>
              </div>
              
              <div style={styles.filesList}>
                <h4>قائمة المستخدمين</h4>
                {allUsers.length === 0 ? (
                  <p style={{ color: '#666' }}>لا يوجد مستخدمين</p>
                ) : (
                  <table style={styles.userTable}>
                    <thead>
                      <tr>
                        <th>الاسم</th>
                        <th>البريد</th>
                        <th>الدور</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map(u => (
                        <tr key={u.id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.role}</td>
                          <td>
                            <button onClick={() => openEditUser(u)} style={styles.editBtn}>تعديل</button>
                            <button onClick={() => handleDeleteUser(u.id, u.name)} style={styles.deleteBtn}>حذف</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={{ ...styles.card, maxWidth: '400px', margin: '50px auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>🔐 نظام إدارة المأموريات</h1>
        
        <form onSubmit={handleLogin}>
          <div>
            <label style={styles.label}>البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mission.com"
              style={styles.input}
              required
            />
          </div>
          
          <div>
            <label style={styles.label}>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              style={styles.input}
              required
            />
          </div>
          
          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            style={styles.loginBtn}
            disabled={loading}
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
        
        <hr style={{ margin: '20px 0' }} />
        
        <div style={styles.demoBox}>
          <p style={{ textAlign: 'center', marginBottom: '10px', fontWeight: 'bold' }}>
            📧 حسابات تجريبية (كلمة المرور: 123456):
          </p>
          <div style={{ fontSize: '12px', display: 'grid', gap: '5px' }}>
            <code>📧 distributor@mission.com - مدير التوزيع</code>
            <code>📧 survey.manager@mission.com - رئيس قسم المساحة</code>
            <code>📧 technical.manager@mission.com - رئيس المكتب الفني</code>
            <code>📧 gis.manager@mission.com - رئيس نظم المعلومات</code>
            <code>📧 ahmed.ali@mission.com - مهندس مساحة</code>
            <code>📧 technical.staff@mission.com - موظف فني</code>
            <code>📧 gis.analyst@mission.com - محلل نظم المعلومات</code>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    maxWidth: '800px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  createBtn: {
    backgroundColor: '#10b981',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%'
  },
  manageUsersBtn: {
    backgroundColor: '#8b5cf6',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%'
  },
  reportsBtn: {
    backgroundColor: '#f59e0b',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%'
  },
  tabBtn: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    flex: 1,
    transition: 'all 0.3s'
  },
  formContainer: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px'
  },
  missionCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '10px',
    backgroundColor: '#f9fafb'
  },
  statusBadge: {
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  assignBtn: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '8px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  uploadBtn: {
    backgroundColor: '#10b981',
    color: 'white',
    padding: '8px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  approveBtn: {
    backgroundColor: '#10b981',
    color: 'white',
    padding: '8px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  rejectBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '8px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  resubmitBtn: {
    backgroundColor: '#8b5cf6',
    color: 'white',
    padding: '8px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  viewFilesBtn: {
    backgroundColor: '#6b7280',
    color: 'white',
    padding: '8px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  logsBtn: {
    backgroundColor: '#6b7280',
    color: 'white',
    padding: '8px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  deleteMissionBtn: {
    backgroundColor: '#dc2626',
    color: 'white',
    padding: '8px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '15px',
    width: '400px',
    maxWidth: '90%'
  },
  modalLarge: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '15px',
    width: '600px',
    maxWidth: '90%',
    maxHeight: '80vh',
    overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  closeBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  uploadSection: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px'
  },
  fileInput: {
    width: '100%',
    padding: '10px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    marginBottom: '15px'
  },
  filesList: {
    maxHeight: '300px',
    overflowY: 'auto'
  },
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #e5e7eb',
    flexWrap: 'wrap',
    gap: '10px'
  },
  downloadLink: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '5px',
    textDecoration: 'none',
    fontSize: '12px'
  },
  deleteFileBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  userTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
  },
  editBtn: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '5px'
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  cancelBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    flex: 1
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#374151'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  errorBox: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px',
    textAlign: 'center'
  },
  loginBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  demoBox: {
    fontSize: '14px',
    color: '#666',
    background: '#f9fafb',
    padding: '15px',
    borderRadius: '10px'
  },
  reportForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  excelBtn: {
    flex: 1,
    backgroundColor: '#10b981',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  pdfBtn: {
    flex: 1,
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#667eea'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px'
  },
  dashboardCard: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  progressBar: {
    marginBottom: '15px'
  },
  progressLabel: {
    fontSize: '14px',
    marginBottom: '5px',
    color: '#374151'
  },
  progressBarBg: {
    backgroundColor: '#e5e7eb',
    borderRadius: '10px',
    height: '8px',
    overflow: 'hidden'
  },
  progressBarFill: {
    backgroundColor: '#667eea',
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.3s ease'
  },
  progressCount: {
    fontSize: '12px',
    color: '#666',
    marginTop: '3px'
  },
  employeeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6'
  },
  employeeCount: {
    backgroundColor: '#667eea',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  monthlyBadge: {
    backgroundColor: '#10b981',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block'
  },
  statsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  },
  logsList: {
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '10px'
  },
  logItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '5px'
  },
  logIcon: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginTop: '5px'
  },
  logContent: {
    flex: 1
  },
  logText: {
    fontSize: '14px',
    color: '#374151',
    marginBottom: '4px'
  },
  logDate: {
    fontSize: '11px',
    color: '#9ca3af'
  }
}

export default App