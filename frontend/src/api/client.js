const BASE_URL = '/api';

/**
 * Builds JSON:API query string with filter[...] parameters
 */
function buildQueryString(params = {}) {
  const query = new URLSearchParams();

  if (params.page) query.append('page[number]', params.page);
  if (params.size) query.append('page[size]', params.size);
  if (params.search) query.append('filter[search]', params.search);
  if (params.department && params.department !== 'ALL') query.append('filter[department]', params.department);
  if (params.country && params.country !== 'ALL') query.append('filter[country]', params.country);
  if (params.minSalary) query.append('filter[minSalary]', params.minSalary);
  if (params.maxSalary) query.append('filter[maxSalary]', params.maxSalary);
  if (params.sort) query.append('sort', params.sort);

  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchEmployees(params = {}) {
  const qs = buildQueryString(params);
  const response = await fetch(`${BASE_URL}/employees${qs}`, {
    headers: {
      'Accept': 'application/vnd.api+json, application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.errors?.[0]?.detail || `Failed to fetch employees (${response.status})`;
    throw new Error(message);
  }

  const json = await response.json();
  // Unpack JSON:API resource items into normalized UI objects
  const employees = (json.data || []).map(item => ({
    id: item.id,
    type: item.type,
    ...item.attributes,
    selfLink: item.links?.self,
  }));

  return {
    employees,
    meta: json.meta || {},
    links: json.links || {},
  };
}

export async function updateEmployeeSalary(id, salary) {
  const payload = {
    data: {
      type: 'employees',
      id: String(id),
      attributes: {
        salary: Number(salary),
      },
    },
  };

  const response = await fetch(`${BASE_URL}/employees/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.api+json, application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.errors?.[0]?.detail || `Failed to update salary (${response.status})`;
    throw new Error(message);
  }

  const json = await response.json();
  return {
    id: json.data?.id,
    ...json.data?.attributes,
  };
}

export async function bulkAdjustSalaries({ department, country, percentage }) {
  const payload = {
    department: department === 'ALL' ? null : department,
    country: country === 'ALL' ? null : country,
    percentage: Number(percentage),
  };

  const response = await fetch(`${BASE_URL}/employees/bulk-adjust`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.api+json, application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.errors?.[0]?.detail || `Bulk adjustment failed (${response.status})`;
    throw new Error(message);
  }

  const json = await response.json();
  return json.data?.attributes;
}

export async function fetchAuditSummary() {
  const response = await fetch(`${BASE_URL}/analytics/summary`, {
    headers: {
      'Accept': 'application/vnd.api+json, application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.errors?.[0]?.detail || `Failed to fetch analytics (${response.status})`;
    throw new Error(message);
  }

  const json = await response.json();
  return {
    summary: json.data?.attributes || {},
    meta: json.meta || {},
  };
}

export function downloadFilteredCsv(params = {}) {
  const qs = buildQueryString(params);
  const downloadUrl = `${BASE_URL}/employees/export-csv${qs}`;
  
  // Trigger direct browser file download
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', 'globalpay-employees-export.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
