import AsyncStorage from '@react-native-async-storage/async-storage';

const INSFORGE_BASE_URL = 'https://y758dmj4.us-east.insforge.app';

// InsForge Database API wrapper for React Native
class InsforgeDatabase {
  private tableName: string = '';
  private selectColumns: string = '*';
  private filters: string[] = [];
  private orderBy: string = '';
  private limitCount: number | null = null;
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;

  from(table: string): InsforgeDatabase {
    const instance = new InsforgeDatabase();
    instance.tableName = table;
    return instance;
  }

  select(columns: string = '*'): InsforgeDatabase {
    this.selectColumns = columns;
    return this;
  }

  eq(column: string, value: any): InsforgeDatabase {
    this.filters.push(`${column}=eq.${encodeURIComponent(value)}`);
    return this;
  }

  neq(column: string, value: any): InsforgeDatabase {
    this.filters.push(`${column}=neq.${encodeURIComponent(value)}`);
    return this;
  }

  gte(column: string, value: any): InsforgeDatabase {
    this.filters.push(`${column}=gte.${encodeURIComponent(value)}`);
    return this;
  }

  lte(column: string, value: any): InsforgeDatabase {
    this.filters.push(`${column}=lte.${encodeURIComponent(value)}`);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): InsforgeDatabase {
    const direction = options?.ascending === false ? 'desc' : 'asc';
    this.orderBy = `${column}.${direction}`;
    return this;
  }

  limit(count: number): InsforgeDatabase {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number): InsforgeDatabase {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('insforge-auth-token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private buildUrl(): string {
    let url = `${INSFORGE_BASE_URL}/rest/v1/${this.tableName}`;
    const params: string[] = [];

    if (this.selectColumns !== '*') {
      params.push(`select=${this.selectColumns}`);
    }

    params.push(...this.filters);

    if (this.orderBy) {
      params.push(`order=${this.orderBy}`);
    }

    if (this.limitCount !== null) {
      params.push(`limit=${this.limitCount}`);
    }

    if (this.rangeFrom !== null && this.rangeTo !== null) {
      params.push(`offset=${this.rangeFrom}`);
      params.push(`limit=${this.rangeTo - this.rangeFrom + 1}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return url;
  }

  async execute(): Promise<{ data: any[] | null; error: any }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(this.buildUrl(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('[InsforgeDB] Query error:', error);
      return { data: null, error };
    }
  }

  async insert(values: any | any[]): Promise<{ data: any[] | null; error: any }> {
    try {
      const headers = await this.getAuthHeaders();
      headers['Prefer'] = 'return=representation';

      const response = await fetch(`${INSFORGE_BASE_URL}/rest/v1/${this.tableName}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(Array.isArray(values) ? values : [values]),
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('[InsforgeDB] Insert error:', error);
      return { data: null, error };
    }
  }

  async update(values: any): Promise<{ data: any[] | null; error: any }> {
    try {
      const headers = await this.getAuthHeaders();
      headers['Prefer'] = 'return=representation';

      let url = `${INSFORGE_BASE_URL}/rest/v1/${this.tableName}`;
      if (this.filters.length > 0) {
        url += '?' + this.filters.join('&');
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('[InsforgeDB] Update error:', error);
      return { data: null, error };
    }
  }

  async delete(): Promise<{ data: any[] | null; error: any }> {
    try {
      const headers = await this.getAuthHeaders();

      let url = `${INSFORGE_BASE_URL}/rest/v1/${this.tableName}`;
      if (this.filters.length > 0) {
        url += '?' + this.filters.join('&');
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      return { data: [], error: null };
    } catch (error) {
      console.error('[InsforgeDB] Delete error:', error);
      return { data: null, error };
    }
  }
}

export const insforgeDb = new InsforgeDatabase();
