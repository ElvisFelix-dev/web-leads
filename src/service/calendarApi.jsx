// service/calendarApi.js

import api from './api';

export const getCalendarEvents = async (params = {}) => {
  const response = await api.get('/api/calendar', {
    params,
  });

  return response.data;
};

export const getCalendarEventById = async (id) => {
  const response = await api.get(`/api/calendar/${id}`);

  return response.data;
};

export const createCalendarEvent = async (data) => {
  const response = await api.post('/api/calendar', data);

  return response.data;
};

export const updateCalendarEvent = async (id, data) => {
  const response = await api.patch(`/api/calendar/${id}`, data);

  return response.data;
};

export const deleteCalendarEvent = async (id) => {
  const response = await api.delete(`/api/calendar/${id}`);

  return response.data;
};

export const confirmCalendarEvent = async (id) => {
  const response = await api.patch(`/api/calendar/${id}/confirm`);

  return response.data;
};

export const completeCalendarEvent = async (id, data = {}) => {
  const response = await api.patch(`/api/calendar/${id}/complete`, data);

  return response.data;
};

export const cancelCalendarEvent = async (id, data = {}) => {
  const response = await api.patch(`/api/calendar/${id}/cancel`, data);

  return response.data;
};

export const getCalendarByDay = async (date) => {
  const response = await api.get('/api/calendar/day', {
    params: {
      date,
    },
  });

  return response.data;
};

export const getCalendarByPeriod = async (start, end) => {
  const response = await api.get('/api/calendar/period', {
    params: {
      start,
      end,
    },
  });

  return response.data;
};

export const getUpcomingCalendarEvents = async (limit = 10) => {
  const response = await api.get('/api/calendar/upcoming', {
    params: {
      limit,
    },
  });

  return response.data;
};

export const getCalendarMetrics = async (params = {}) => {
  const response = await api.get('/api/calendar/metrics', {
    params,
  });

  return response.data;
};
