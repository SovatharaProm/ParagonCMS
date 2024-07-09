import { defineStore } from 'pinia';
import Cookies from 'universal-cookie';
import { useCookie } from '#app';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    userRole: null,
    userName: null,
    userStatus: null, // Add userStatus property
  }),
  actions: {
    async initializeStore() {
      const tokenCookie = useCookie('token');
      this.token = process.client ? new Cookies().get('token') : tokenCookie.value;

      if (this.token) {
        await this.fetchUserRole();
      }
    },

    setToken(token) {
      this.token = token;
      if (process.client) {
        new Cookies().set('token', token, { path: '/', expires: new Date(Date.now() + 86400 * 1000 * 7), secure: false, sameSite: 'strict' });
      } else {
        const tokenCookie = useCookie('token');
        tokenCookie.value = token;
      }
    },

    async fetchUserRole() {
      try {
        if (!this.token) {
          throw new Error('No token available');
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get-my-profile`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch user role, response:', errorText);
          throw new Error('Failed to fetch user role');
        }

        const data = await response.json();
        if (data && data.data && data.data.profile) {
          this.userRole = data.data.profile.level;
          this.userName = data.data.profile.name;
          this.userStatus = data.data.profile.status; // Update the userStatus based on the profile status
        } else {
          console.error('Invalid response structure, user level not found');
          throw new Error('Invalid response structure, user level not found');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    },

    removeCookie(name) {
      const cookies = new Cookies();
      cookies.remove(name, { path: '/' });
    },

    nullToken() {
      this.removeCookie('token');
      this.token = null;
      this.userRole = null;
      this.userName = null;
      this.userStatus = null; // Reset userStatus
    },

    async logout() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/log-out`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to log out, response:', errorText);
          throw new Error('Failed to log out');
        }

        this.nullToken();
      } catch (error) {
        console.error('Error logging out:', error);
        this.nullToken(); // Ensure token is nullified even if the logout request fails
      }
    },
  },
});
