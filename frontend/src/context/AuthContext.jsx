import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure Axios defaults
  axios.defaults.baseURL = ''; // Set relative so proxy catches it
  
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedRole && storedUser) {
      setToken(storedToken);
      setRole(storedRole);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // API requires application/x-www-form-urlencoded format for standard OAuth2 Form compliance
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    try {
      const response = await axios.post('/api/v1/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const { access_token, role: userRole, user: userData } = response.data;
      
      setToken(access_token);
      setRole(userRole);
      setUser(userData);
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('user', JSON.stringify(userData));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      return { success: true, role: userRole };
    } catch (error) {
      const msg = error.response?.data?.detail || 'Invalid email or password';
      throw new Error(msg);
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const registerStudent = async (studentData) => {
    try {
      const response = await axios.post('/api/v1/auth/register/student', studentData);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to register student';
      throw new Error(msg);
    }
  };

  const registerTeacher = async (teacherData) => {
    try {
      const response = await axios.post('/api/v1/auth/register/teacher', teacherData);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to register teacher';
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, logout, registerStudent, registerTeacher }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
