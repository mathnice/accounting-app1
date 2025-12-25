import initSqlJs, { Database as SqlJsDatabase, Statement } from 'sql.js';
import path from 'path';
import fs from 'fs';

let sqlDb: SqlJsDatabase;
const dbPath = path.join(__dirname, '../../data/accounting.db');
const dataDir = path.join(__dirname, '../../data');

// 保存数据库到文件
const saveDatabase = () => {
  if (sqlDb) {
    const data = sqlDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
};

// 定期自动保存
let saveInterval: NodeJS.Timeout;

// 包装器类，模拟 better-sqlite3 的 API
class DatabaseWrapper {
  prepare(sql: string) {
    return new StatementWrapper(sql);
  }

  exec(sql: string) {
    sqlDb.run(sql);
    saveDatabase();
  }

  pragma(pragma: string) {
    sqlDb.run(`PRAGMA ${pragma}`);
  }

  close() {
    sqlDb.close();
  }
}

class StatementWrapper {
  private sql: string;

  constructor(sql: string) {
    this.sql = sql;
  }

  run(...params: any[]) {
    sqlDb.run(this.sql, params);
    saveDatabase();
    return { changes: sqlDb.getRowsModified() };
  }

  get(...params: any[]): any {
    const stmt = sqlDb.prepare(this.sql);
    if (params.length > 0) stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return undefined;
  }

  all(...params: any[]): any[] {
    const stmt = sqlDb.prepare(this.sql);
    if (params.length > 0) stmt.bind(params);
    const results: any[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }
}

export const db = new DatabaseWrapper();


// 初始化数据库表
const initTables = () => {
  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nickname TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      email_verified INTEGER DEFAULT 0,
      reminder_enabled INTEGER DEFAULT 0,
      reminder_time TEXT DEFAULT '20:00',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      type TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      icon TEXT DEFAULT 'default',
      color TEXT DEFAULT '#1890ff',
      is_default INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, name, type)
    )
  `);

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      initial_balance INTEGER DEFAULT 0,
      current_balance INTEGER DEFAULT 0,
      icon TEXT DEFAULT 'wallet',
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, name)
    )
  `);

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      note TEXT DEFAULT '',
      payment_method TEXT DEFAULT 'cash' CHECK(payment_method IN ('cash', 'wechat', 'alipay', 'bank')),
      local_id TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  sqlDb.run(`CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id)`);
  sqlDb.run(`CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id)`);
  sqlDb.run(`CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id)`);
  sqlDb.run(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(user_id, date)`);

  saveDatabase();
  console.log('数据库表初始化完成');
};

// 连接数据库
export const connectDatabase = async (): Promise<void> => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const SQL = await initSqlJs();
    
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      sqlDb = new SQL.Database(fileBuffer);
      console.log('已加载现有数据库');
    } else {
      sqlDb = new SQL.Database();
      console.log('创建新数据库');
    }

    initTables();
    saveInterval = setInterval(saveDatabase, 30000);
    console.log('SQLite 数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (saveInterval) clearInterval(saveInterval);
  saveDatabase();
  if (sqlDb) sqlDb.close();
  console.log('数据库已关闭');
};
