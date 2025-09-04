// src/stores/auth.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const userEmail = ref(null)

  async function login(email, password) {
    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        email: email,
        password: password
      })
      token.value = response.data.token
      userEmail.value = email
      localStorage.setItem('token', token.value)
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  function logout() {
    token.value = null
    userEmail.value = null
    localStorage.removeItem('token')
  }

  return { token, userEmail, login, logout }
})