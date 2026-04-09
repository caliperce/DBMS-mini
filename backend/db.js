const oracledb = require('oracledb');

// Use thin mode by default (no Oracle Instant Client needed for Oracle 18c+)
// If thick mode is needed, uncomment the following:
// try { oracledb.initOracleClient(); } catch (e) { /* thin mode fallback */ }

// Fetch DATE, TIMESTAMP, and CLOB columns as JavaScript strings automatically
oracledb.fetchAsString = [oracledb.DATE, oracledb.CLOB];

// Return rows as objects with column names as keys (UPPERCASE by default)
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const dbConfig = {
  user: process.env.DB_USER || 'system',
  password: process.env.DB_PASSWORD || 'oracle',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/xe',
};

async function initialize() {
  try {
    await oracledb.createPool({
      ...dbConfig,
      poolAlias: 'default',
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
    console.log('Oracle connection pool created successfully');
  } catch (err) {
    console.error('Failed to create Oracle connection pool:', err.message);
    throw err;
  }
}

async function close() {
  try {
    await oracledb.getPool().close(10);
    console.log('Oracle connection pool closed');
  } catch (err) {
    console.error('Error closing pool:', err.message);
  }
}

async function getConnection() {
  return oracledb.getConnection();
}

/**
 * Convert Oracle UPPERCASE column names to lowercase snake_case.
 * E.g. STUDENT_ID -> student_id, FIRST_NAME -> first_name
 * This matches the frontend field names.
 */
function toLower(str) {
  return str.toLowerCase();
}

/**
 * Transform an array of Oracle row objects: convert all keys to camelCase.
 */
function transformRows(rows) {
  if (!rows || rows.length === 0) return [];
  return rows.map((row) => {
    const obj = {};
    for (const key of Object.keys(row)) {
      obj[toLower(key)] = row[key];
    }
    return obj;
  });
}

/**
 * Transform a single row object.
 */
function transformRow(row) {
  if (!row) return null;
  const obj = {};
  for (const key of Object.keys(row)) {
    obj[toLower(key)] = row[key];
  }
  return obj;
}

module.exports = {
  initialize,
  close,
  getConnection,
  transformRows,
  transformRow,
  oracledb,
};
